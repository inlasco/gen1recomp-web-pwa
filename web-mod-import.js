(function (global) {
  "use strict";

  var RESULT_FILE = "web-mod-result.txt";
  var ERROR_FILE = "web-mod-error.txt";
  var REFRESH_FLAG = "web-mod-refresh.flag";
  var PICKED_MOD = "picked_mod.zip";
  var MAX_ENTRIES = 50000;
  var MAX_UNCOMPRESSED = 256 * 1024 * 1024;

  var crcTable = null;
  function getCrcTable() {
    if (crcTable) return crcTable;
    crcTable = new Uint32Array(256);
    for (var n = 0; n < 256; n += 1) {
      var c = n;
      for (var k = 0; k < 8; k += 1) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crcTable[n] = c >>> 0;
    }
    return crcTable;
  }

  function crc32(bytes) {
    var table = getCrcTable();
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i += 1) {
      c = table[(c ^ bytes[i]) & 255] ^ (c >>> 8);
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function u16(view, offset) { return view.getUint16(offset, true); }
  function u32(view, offset) { return view.getUint32(offset, true); }

  function safeRelative(path) {
    if (!path || path.indexOf("\\") !== -1 || path.indexOf("\0") !== -1 || path[0] === "/") {
      return false;
    }
    var parts = path.split("/");
    for (var i = 0; i < parts.length; i += 1) {
      if (parts[i] === ".." || parts[i] === ".") return false;
    }
    return true;
  }

  function parseZip(bytes) {
    if (!(bytes instanceof Uint8Array) || bytes.length < 22) {
      throw new Error("Archive ZIP vide ou illisible.");
    }
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var min = Math.max(0, bytes.length - 22 - 65535);
    var eocd = -1;
    for (var i = bytes.length - 22; i >= min; i -= 1) {
      if (u32(view, i) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error("Fin d'archive ZIP introuvable.");

    var count = u16(view, eocd + 10);
    var cdSize = u32(view, eocd + 12);
    var cdOffset = u32(view, eocd + 16);
    if (count === 0xFFFF || cdSize === 0xFFFFFFFF || cdOffset === 0xFFFFFFFF) {
      throw new Error("ZIP64 non pris en charge par l'import Web.");
    }
    if (count > MAX_ENTRIES) throw new Error("Archive contenant trop de fichiers.");
    if (cdOffset + cdSize > bytes.length) throw new Error("Répertoire ZIP tronqué.");

    var decoder = new TextDecoder("utf-8");
    var entries = [];
    var total = 0;
    var p = cdOffset;
    for (var index = 0; index < count; index += 1) {
      if (p + 46 > bytes.length || u32(view, p) !== 0x02014b50) {
        throw new Error("Répertoire ZIP invalide à l'entrée " + (index + 1) + ".");
      }
      var flags = u16(view, p + 8);
      var method = u16(view, p + 10);
      var crc = u32(view, p + 16);
      var compressedSize = u32(view, p + 20);
      var uncompressedSize = u32(view, p + 24);
      var nameLength = u16(view, p + 28);
      var extraLength = u16(view, p + 30);
      var commentLength = u16(view, p + 32);
      var localOffset = u32(view, p + 42);
      var endName = p + 46 + nameLength;
      if (endName > bytes.length) throw new Error("Nom ZIP tronqué.");
      var name = decoder.decode(bytes.subarray(p + 46, endName));

      if ((flags & 1) !== 0) throw new Error("Archive ZIP chiffrée non prise en charge.");
      if (method !== 0 && method !== 8) {
        throw new Error("Méthode de compression ZIP non prise en charge (" + method + ").");
      }
      if (!safeRelative(name)) throw new Error("Chemin dangereux dans le ZIP : " + name);
      if (localOffset + 30 > bytes.length || u32(view, localOffset) !== 0x04034b50) {
        throw new Error("En-tête ZIP local invalide : " + name);
      }
      var localNameLength = u16(view, localOffset + 26);
      var localExtraLength = u16(view, localOffset + 28);
      var dataOffset = localOffset + 30 + localNameLength + localExtraLength;
      if (dataOffset + compressedSize > bytes.length) throw new Error("Données ZIP tronquées : " + name);

      total += uncompressedSize;
      if (total > MAX_UNCOMPRESSED) throw new Error("Mod trop volumineux une fois décompressé.");
      entries.push({
        name: name,
        method: method,
        crc: crc,
        compressedSize: compressedSize,
        uncompressedSize: uncompressedSize,
        dataOffset: dataOffset,
        directory: name.endsWith("/")
      });
      p = endName + extraLength + commentLength;
    }
    return entries;
  }

  function inflateRawJs(input, expectedLength) {
    var LEN_BASE = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
    var LEN_EXTRA = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
    var DIST_BASE = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
    var DIST_EXTRA = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
    var bitpos = 0;
    function bits(n) {
      var v = 0;
      for (var i = 0; i < n; i += 1) {
        var byte = input[bitpos >>> 3];
        if (byte === undefined) throw new Error("Flux DEFLATE tronqué.");
        v |= ((byte >>> (bitpos & 7)) & 1) << i;
        bitpos += 1;
      }
      return v >>> 0;
    }
    function reverseBits(v, n) {
      var r = 0;
      for (var i = 0; i < n; i += 1) { r = (r << 1) | (v & 1); v >>>= 1; }
      return r >>> 0;
    }
    function huffman(lengths) {
      var max = 0;
      for (var i = 0; i < lengths.length; i += 1) if (lengths[i] > max) max = lengths[i];
      if (!max) throw new Error("Table Huffman DEFLATE vide.");
      var count = new Array(max + 1).fill(0);
      for (var j = 0; j < lengths.length; j += 1) if (lengths[j]) count[lengths[j]] += 1;
      var next = new Array(max + 1).fill(0), code = 0;
      for (var len = 1; len <= max; len += 1) {
        code = (code + (count[len - 1] || 0)) << 1;
        next[len] = code;
      }
      var tables = new Array(max + 1);
      for (var l = 1; l <= max; l += 1) tables[l] = Object.create(null);
      for (var sym = 0; sym < lengths.length; sym += 1) {
        var sl = lengths[sym];
        if (!sl) continue;
        var c = next[sl]++;
        tables[sl][reverseBits(c, sl)] = sym;
      }
      return { max: max, tables: tables };
    }
    function decode(tree) {
      var code = 0;
      for (var len = 1; len <= tree.max; len += 1) {
        code |= bits(1) << (len - 1);
        var sym = tree.tables[len][code];
        if (sym !== undefined) return sym;
      }
      throw new Error("Code Huffman DEFLATE invalide.");
    }
    function fixedTrees() {
      var lit = new Array(288);
      for (var i = 0; i <= 143; i += 1) lit[i] = 8;
      for (var j = 144; j <= 255; j += 1) lit[j] = 9;
      for (var k = 256; k <= 279; k += 1) lit[k] = 7;
      for (var m = 280; m <= 287; m += 1) lit[m] = 8;
      var dist = new Array(32).fill(5);
      return [huffman(lit), huffman(dist)];
    }
    function dynamicTrees() {
      var hlit = bits(5) + 257;
      var hdist = bits(5) + 1;
      var hclen = bits(4) + 4;
      var order = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
      var clen = new Array(19).fill(0);
      for (var i = 0; i < hclen; i += 1) clen[order[i]] = bits(3);
      var ctree = huffman(clen);
      var total = hlit + hdist;
      var lengths = [];
      while (lengths.length < total) {
        var sym = decode(ctree);
        if (sym <= 15) {
          lengths.push(sym);
        } else if (sym === 16) {
          if (!lengths.length) throw new Error("Répétition DEFLATE invalide.");
          var prev = lengths[lengths.length - 1], rep = bits(2) + 3;
          while (rep-- > 0) lengths.push(prev);
        } else if (sym === 17) {
          var rep0 = bits(3) + 3;
          while (rep0-- > 0) lengths.push(0);
        } else if (sym === 18) {
          var rep00 = bits(7) + 11;
          while (rep00-- > 0) lengths.push(0);
        } else throw new Error("Longueur Huffman DEFLATE invalide.");
        if (lengths.length > total) throw new Error("Table DEFLATE débordante.");
      }
      var litLengths = lengths.slice(0, hlit);
      var distLengths = lengths.slice(hlit);
      if (!litLengths[256]) throw new Error("Fin de bloc DEFLATE absente.");
      // RFC1951 permits one distance code; a completely empty distance alphabet
      // is only usable when the block never emits a length/distance pair. Keep a
      // sentinel tree so literals-only streams remain decodable.
      var anyDist = false;
      for (var d = 0; d < distLengths.length; d += 1) if (distLengths[d]) { anyDist = true; break; }
      return [huffman(litLengths), anyDist ? huffman(distLengths) : null];
    }

    var output = new Uint8Array(expectedLength);
    var op = 0, finalBlock = 0, fixed = null;
    while (!finalBlock) {
      finalBlock = bits(1);
      var type = bits(2);
      if (type === 0) {
        bitpos = (bitpos + 7) & ~7;
        var len = bits(16), nlen = bits(16);
        if (((len ^ 0xFFFF) & 0xFFFF) !== nlen) throw new Error("Bloc DEFLATE stocké invalide.");
        if (op + len > output.length) throw new Error("DEFLATE dépasse la taille attendue.");
        for (var s = 0; s < len; s += 1) output[op++] = bits(8);
        continue;
      }
      if (type === 3) throw new Error("Type de bloc DEFLATE réservé.");
      var trees;
      if (type === 1) {
        if (!fixed) fixed = fixedTrees();
        trees = fixed;
      } else {
        trees = dynamicTrees();
      }
      var litTree = trees[0], distTree = trees[1];
      while (true) {
        var lsym = decode(litTree);
        if (lsym < 256) {
          if (op >= output.length) throw new Error("DEFLATE dépasse la taille attendue.");
          output[op++] = lsym;
        } else if (lsym === 256) {
          break;
        } else {
          if (lsym < 257 || lsym > 285) throw new Error("Longueur DEFLATE invalide.");
          var li = lsym - 257;
          var length = LEN_BASE[li] + (LEN_EXTRA[li] ? bits(LEN_EXTRA[li]) : 0);
          if (!distTree) throw new Error("Distance DEFLATE absente.");
          var dsym = decode(distTree);
          if (dsym < 0 || dsym > 29) throw new Error("Distance DEFLATE invalide.");
          var distance = DIST_BASE[dsym] + (DIST_EXTRA[dsym] ? bits(DIST_EXTRA[dsym]) : 0);
          if (distance > op) throw new Error("Distance DEFLATE hors fenêtre.");
          if (op + length > output.length) throw new Error("DEFLATE dépasse la taille attendue.");
          for (var c = 0; c < length; c += 1) {
            output[op] = output[op - distance];
            op += 1;
          }
        }
      }
    }
    if (op !== expectedLength) throw new Error("Taille DEFLATE finale incorrecte.");
    return output;
  }

  async function inflateEntry(entry, bytes) {
    var compressed = bytes.subarray(entry.dataOffset, entry.dataOffset + entry.compressedSize);
    var output;
    if (entry.method === 0) {
      output = compressed.slice();
    } else {
      var nativeDone = false;
      if (typeof DecompressionStream === "function") {
        try {
          var ds = new DecompressionStream("deflate-raw");
          var stream = new Blob([compressed]).stream().pipeThrough(ds);
          output = new Uint8Array(await new Response(stream).arrayBuffer());
          nativeDone = true;
        } catch (_) {
          nativeDone = false;
        }
      }
      if (!nativeDone) {
        output = inflateRawJs(compressed, entry.uncompressedSize);
      }
    }
    if (output.length !== entry.uncompressedSize) {
      throw new Error("Taille décompressée incorrecte : " + entry.name);
    }
    if (crc32(output) !== entry.crc) {
      throw new Error("CRC ZIP incorrect : " + entry.name);
    }
    return output;
  }

  function locateRoot(entries) {
    var names = new Set();
    var topDirectories = new Set();
    for (var i = 0; i < entries.length; i += 1) {
      var name = entries[i].name;
      names.add(name);
      var slash = name.indexOf("/");
      if (slash > 0) topDirectories.add(name.slice(0, slash));
    }
    if (names.has("manifest.json")) return "";
    var candidates = [];
    topDirectories.forEach(function (top) {
      if (names.has(top + "/manifest.json")) candidates.push(top);
    });
    if (candidates.length !== 1) {
      throw new Error("Le ZIP doit contenir manifest.json à la racine ou dans un seul dossier de mod.");
    }
    return candidates[0] + "/";
  }

  function findEntry(entries, name) {
    for (var i = 0; i < entries.length; i += 1) if (entries[i].name === name) return entries[i];
    return null;
  }

  function exists(fs, path) {
    try { return !!fs.analyzePath(path).exists; } catch (_) { return false; }
  }

  function mkdirTree(fs, path) {
    if (fs.mkdirTree) { fs.mkdirTree(path); return; }
    var parts = path.split("/").filter(Boolean);
    var cur = path[0] === "/" ? "" : ".";
    for (var i = 0; i < parts.length; i += 1) {
      cur += "/" + parts[i];
      if (!exists(fs, cur)) {
        try { fs.mkdir(cur); } catch (_) {}
      }
    }
  }

  function parentPath(path) {
    var i = path.lastIndexOf("/");
    return i <= 0 ? "/" : path.slice(0, i);
  }

  function removeTree(fs, path) {
    if (!exists(fs, path)) return;
    var names = null;
    try { names = fs.readdir(path); } catch (_) { names = null; }
    if (names) {
      for (var i = 0; i < names.length; i += 1) {
        var name = names[i];
        if (name === "." || name === "..") continue;
        removeTree(fs, path + "/" + name);
      }
      try { fs.rmdir(path); return; } catch (_) {}
    }
    try { fs.unlink(path); } catch (_) {}
  }

  function readUtf8(fs, path) {
    try { return fs.readFile(path, { encoding: "utf8" }); } catch (_) { return null; }
  }

  function sameIdPaths(fs, modsRoot, id) {
    var out = [];
    var names;
    try { names = fs.readdir(modsRoot); } catch (_) { return out; }
    for (var i = 0; i < names.length; i += 1) {
      var name = names[i];
      if (name === "." || name === "..") continue;
      var path = modsRoot + "/" + name;
      if (name === id) { out.push(path); continue; }
      var raw = readUtf8(fs, path + "/manifest.json");
      if (!raw) continue;
      try {
        var manifest = JSON.parse(raw);
        if (manifest && manifest.id === id) out.push(path);
      } catch (_) {}
    }
    return out;
  }

  function writeText(fs, path, text) {
    fs.writeFile(path, new TextEncoder().encode(text));
  }

  function syncFs(fs) {
    if (!fs.syncfs) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      fs.syncfs(false, function (error) { if (error) reject(error); else resolve(); });
    });
  }

  function yieldUi() {
    return new Promise(function (resolve) {
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(function () { resolve(); });
      else setTimeout(resolve, 0);
    });
  }

  async function install(options) {
    var fs = options && options.fs;
    var saveDirectory = options && options.saveDirectory;
    var file = options && options.file;
    var onProgress = options && options.onProgress;
    if (!fs || !saveDirectory || !file || typeof file.arrayBuffer !== "function") {
      throw new Error("Import Web non initialisé.");
    }

    // A previous failed legacy import must never race this direct installer.
    [PICKED_MOD, RESULT_FILE, ERROR_FILE, REFRESH_FLAG].forEach(function (name) {
      var stale = saveDirectory + "/" + name;
      if (exists(fs, stale)) { try { fs.unlink(stale); } catch (_) {} }
    });

    var arrayBuffer = await file.arrayBuffer();
    var bytes = new Uint8Array(arrayBuffer);
    var entries = parseZip(bytes);
    var prefix = locateRoot(entries);
    var manifestEntry = findEntry(entries, prefix + "manifest.json");
    if (!manifestEntry) throw new Error("manifest.json introuvable.");
    var manifestBytes = await inflateEntry(manifestEntry, bytes);
    var manifest;
    try { manifest = JSON.parse(new TextDecoder("utf-8").decode(manifestBytes)); }
    catch (_) { throw new Error("manifest.json invalide."); }
    if (!manifest || typeof manifest.id !== "string" || !/^[A-Za-z0-9_-]+$/.test(manifest.id)) {
      throw new Error("ID de mod invalide dans manifest.json.");
    }
    if (typeof manifest.entry !== "string" || !manifest.entry || !safeRelative(manifest.entry)) {
      throw new Error("Point d'entrée du mod invalide.");
    }
    if (manifest.api != null && (!Number.isInteger(Number(manifest.api)) || Number(manifest.api) < 1 || Number(manifest.api) > 2)) {
      throw new Error("Version d'API de mod non prise en charge.");
    }

    var id = manifest.id;
    var stage = saveDirectory + "/.web-mod-stage-" + id;
    var backup = saveDirectory + "/.web-mod-backup-" + id;
    var modsRoot = saveDirectory + "/mods";
    var dest = modsRoot + "/" + id;

    removeTree(fs, stage);
    removeTree(fs, backup);
    mkdirTree(fs, stage);

    var candidates = [];
    for (var i = 0; i < entries.length; i += 1) {
      var entry = entries[i];
      if (entry.directory || !entry.name.startsWith(prefix)) continue;
      var rel = entry.name.slice(prefix.length);
      if (!rel) continue;
      if (!safeRelative(rel)) throw new Error("Chemin de mod invalide : " + rel);
      candidates.push({ entry: entry, rel: rel });
    }

    try {
      for (var n = 0; n < candidates.length; n += 1) {
        var item = candidates[n];
        var output = (item.entry === manifestEntry) ? manifestBytes : await inflateEntry(item.entry, bytes);
        var target = stage + "/" + item.rel;
        mkdirTree(fs, parentPath(target));
        fs.writeFile(target, output, { canOwn: true });
        if (onProgress && (n === 0 || (n + 1) % 32 === 0 || n + 1 === candidates.length)) {
          onProgress(n + 1, candidates.length, id);
        }
        if ((n + 1) % 32 === 0) await yieldUi();
      }

      if (!exists(fs, stage + "/manifest.json") || !exists(fs, stage + "/" + manifest.entry)) {
        throw new Error("Mod incomplet après extraction.");
      }

      mkdirTree(fs, modsRoot);
      var oldPaths = sameIdPaths(fs, modsRoot, id);
      var hadCanonical = exists(fs, dest);
      if (hadCanonical) fs.rename(dest, backup);

      try {
        fs.rename(stage, dest);
      } catch (commitError) {
        if (hadCanonical && exists(fs, backup) && !exists(fs, dest)) {
          try { fs.rename(backup, dest); } catch (_) {}
        }
        throw commitError;
      }

      for (var j = 0; j < oldPaths.length; j += 1) {
        if (oldPaths[j] !== dest) removeTree(fs, oldPaths[j]);
      }
      removeTree(fs, backup);

      if (exists(fs, saveDirectory + "/" + PICKED_MOD)) {
        try { fs.unlink(saveDirectory + "/" + PICKED_MOD); } catch (_) {}
      }
      if (exists(fs, saveDirectory + "/" + ERROR_FILE)) {
        try { fs.unlink(saveDirectory + "/" + ERROR_FILE); } catch (_) {}
      }
      writeText(fs, saveDirectory + "/" + RESULT_FILE, id);
      writeText(fs, saveDirectory + "/" + REFRESH_FLAG, "1");
      await syncFs(fs);

      return { id: id, files: candidates.length, bytes: bytes.length };
    } catch (error) {
      removeTree(fs, stage);
      throw error;
    }
  }

  global.Gen1WebModInstaller = {
    install: install,
    parseZip: parseZip,
    inflateEntry: inflateEntry,
    inflateRawJs: inflateRawJs,
    constants: {
      resultFile: RESULT_FILE,
      errorFile: ERROR_FILE,
      refreshFlag: REFRESH_FLAG
    }
  };
})(typeof window !== "undefined" ? window : globalThis);

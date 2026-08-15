(function () {
  "use strict";

  var MARKER = "web-bridge-ready.txt";
  var MARKER_VALUE = "gen1recomp-web-v1";
  var PICKED_ROM = "picked_rom.gb";
  var PICKED_MOD = "picked_mod.zip";
  var IMPORT_FLAG = "web-import-active.flag";
  var WIDE_REQUEST = "web-adaptive-wide-request.txt";
  var SAVE_ROOT = "/home/web_user/love";
  var saveDirectory = null;
  var syncing = false;
  var modImporting = false;
  var picker = document.getElementById("rom-picker");
  var pickerButton = document.getElementById("rom-button");
  var modButton = document.getElementById("mod-button");
  var status = document.getElementById("web-status");
  var fullscreenButton = document.getElementById("fullscreen-button");
  var canvas = document.getElementById("canvas");
  var gameFrame = document.getElementById("game-frame");
  // ------------------------------------------------------------------
  // GEOMETRY
  //
  // MEASURED ON THE SHIPPED RUNTIME (LÖVE 11.5 / 2dengine love.js / SDL2
  // emscripten video backend, love.wasm 304f195f…):
  //
  //   At window creation and at every love.window.setMode, SDL sets the
  //   canvas backing store to 0x0 then 1x1, reads the canvas CSS box through
  //   getBoundingClientRect, and if that box is not 1x1 it flags the canvas
  //   EXTERNALLY SIZED. From then on the width and height passed to setMode
  //   are DISCARDED and the window becomes floor(cssW) x floor(cssH).
  //
  // That is the whole lock. The old stylesheet gave #canvas an explicit CSS
  // size, so the engine had silently been the CSS box all along -- never the
  // 800x600 of love.conf -- and no setMode could ever widen it.
  //
  // The fix is to give the engine back its window: #canvas carries NO CSS
  // size while SDL is creating or re-creating the window, so the canvas is
  // not externally sized and setMode is honoured. Only afterwards does CSS
  // present that rectangle, scaled by ONE scalar on both axes.
  //
  //   LÖVE/SDL -> backing store -> GL viewport -> love.graphics -> CSS -> input
  //
  // The engine height never changes (the renderer's integer fit scale, and
  // therefore vertical world span and apparent size, hang off it); only the
  // width follows the aspect the device really offers.
  // ------------------------------------------------------------------
  var WIDE_REQUEST = "web-adaptive-wide-request.txt";
  var MAX_ENGINE_WIDTH = 4096;
  var ASPECT_DEADBAND = 0.02;
  var baseWidth = 0;
  var baseHeight = 0;
  var gameLive = false;
  var engineResizing = false;
  var geometrySequence = 0;
  var requestedGeometry = null;
  var loveGeometry = null;
  var resizeTimer = null;
  var geometryState = "PREPARATION_LAUNCHER_GEOMETRY";

  function setGeometryState(value) {
    geometryState = value;
    document.body.setAttribute("data-geometry-state", value);
  }

  function visibleViewportSize() {
    var vv = window.visualViewport;
    var w = vv && Number(vv.width) > 0 ? Number(vv.width) : Number(window.innerWidth);
    var h = vv && Number(vv.height) > 0 ? Number(vv.height) : Number(window.innerHeight);
    if (!(w > 0 && h > 0) && document.documentElement) {
      w = Number(document.documentElement.clientWidth) || w;
      h = Number(document.documentElement.clientHeight) || h;
    }
    return { width: w || 0, height: h || 0 };
  }

  // The rectangle actually available to the game: browser chrome, the
  // preparation toolbar and the CSS safe-area padding are already outside it.
  function gameBoxSize() {
    var rect = gameFrame && gameFrame.getBoundingClientRect
      ? gameFrame.getBoundingClientRect() : null;
    if (rect && Number(rect.width) > 0 && Number(rect.height) > 0) {
      return { width: Number(rect.width), height: Number(rect.height) };
    }
    return visibleViewportSize();
  }

  function glViewport() {
    var gl = canvas && canvas.GLctxObject && canvas.GLctxObject.GLctx;
    if (!gl || typeof gl.getParameter !== "function") return null;
    try {
      var v = gl.getParameter(gl.VIEWPORT);
      if (!v || v.length < 4) return null;
      return [Number(v[0]), Number(v[1]), Number(v[2]), Number(v[3])];
    } catch (_) {
      return null;
    }
  }

  // Nothing is hardcoded here: no 16:9, no 19.5:9, no device size. The height
  // is the engine's own validated height, the width is that height times the
  // aspect the frame really has. Portrait returns the launcher geometry --
  // widescreen is a landscape answer, not a vertical one.
  function targetGeometry() {
    if (!(baseWidth > 0 && baseHeight > 0)) return null;
    var box = gameBoxSize();
    if (!(box.width > 0 && box.height > 0)) return null;
    if (box.width <= box.height) {
      return { width: baseWidth, height: baseHeight };
    }
    var width = Math.round(baseHeight * (box.width / box.height));
    width = Math.max(baseWidth, Math.min(MAX_ENGINE_WIDTH, width));
    return { width: width, height: baseHeight };
  }

  // The presentation itself is a CSS rule (#canvas: auto sizes under
  // max-width/max-height: 100%), i.e. the browser's own uniform contain fit
  // of the canvas's intrinsic size -- which SDL owns. THE SHELL NEVER WRITES
  // A SIZE ONTO THE CANVAS. That is deliberate: any CSS size present while
  // SDL probes the element flags it externally sized and takes the window
  // away from the engine, which is the failure this patch removes. This
  // function only publishes what happened, for diagnosis and for the lock.
  function presentEngineRectangle() {
    if (!canvas) return;
    var w = Number(canvas.width) || 0;
    var h = Number(canvas.height) || 0;
    if (!(w > 0 && h > 0)) return;
    var rect = canvas.getBoundingClientRect();
    document.body.setAttribute("data-engine-rect", w + "x" + h);
    if (rect.width > 0 && rect.height > 0) {
      document.body.setAttribute("data-present-scale",
        (rect.width / w).toFixed(6) + "x" + (rect.height / h).toFixed(6));
    }
    document.body.classList.toggle("web-geometry-locked", chainCoherent());
  }

  function chainCoherent() {
    if (!canvas || !loveGeometry) return false;
    var viewport = glViewport();
    return Number(canvas.width) === loveGeometry.pixelWidth
      && Number(canvas.height) === loveGeometry.pixelHeight
      && loveGeometry.windowWidth === loveGeometry.logicalWidth
      && loveGeometry.windowHeight === loveGeometry.logicalHeight
      && loveGeometry.logicalWidth === loveGeometry.pixelWidth
      && loveGeometry.logicalHeight === loveGeometry.pixelHeight
      && !!viewport && viewport[0] === 0 && viewport[1] === 0
      && viewport[2] === loveGeometry.pixelWidth
      && viewport[3] === loveGeometry.pixelHeight;
  }

  // Called by Lua IMMEDIATELY BEFORE love.window.setMode: hides the canvas
  // for the one frame in which SDL re-creates the window, so its raw pixel
  // size is never shown. visibility, never display: the element must keep a
  // layout box or SDL's probe reads nothing.
  function beginEngineResize() {
    engineResizing = true;
    document.body.classList.add("web-engine-resizing");
    if (canvas) canvas.getBoundingClientRect();
    return 1;
  }

  // Called by Lua IMMEDIATELY AFTER setMode.
  function endEngineResize() {
    engineResizing = false;
    document.body.classList.remove("web-engine-resizing");
    presentEngineRectangle();
    return canvas ? Number(canvas.width) : 0;
  }

  function resolveSaveDirectory() {
    var fs = getFS();
    if (!fs) return null;
    saveDirectory = saveDirectory || findSaveDirectory(fs);
    return saveDirectory;
  }

  // The target is published as a small file in the save directory, the same
  // channel the ROM/mod pick already uses. Lua owns setMode; this only says
  // which rectangle the device can actually show.
  function publishTarget(force) {
    if (!gameLive) return 0;
    var directory = resolveSaveDirectory();
    var fs = getFS();
    if (!directory || !fs) return 0;
    var target = targetGeometry();
    if (!target) return 0;
    if (!force && requestedGeometry) {
      if (requestedGeometry.width === target.width
          && requestedGeometry.height === target.height) {
        presentEngineRectangle();
        return requestedGeometry.sequence;
      }
      // Safari shows and hides its chrome constantly. A window re-creation
      // per pixel of URL bar is not worth it: below the deadband the engine
      // rectangle is kept and CSS simply re-fits it.
      var drift = Math.abs(target.width - requestedGeometry.width)
        / Math.max(1, requestedGeometry.width);
      if (drift < ASPECT_DEADBAND) {
        presentEngineRectangle();
        return requestedGeometry.sequence;
      }
    }
    geometrySequence += 1;
    requestedGeometry = {
      sequence: geometrySequence,
      width: target.width,
      height: target.height
    };
    try {
      fs.writeFile(directory + "/" + WIDE_REQUEST, new TextEncoder().encode(
        "GEN1WIDE 1 " + geometrySequence + " " + target.width + " " + target.height + "\n"));
    } catch (_) {
      return 0;
    }
    setGeometryState("TARGET_PUBLISHED_" + target.width + "x" + target.height);
    document.body.setAttribute("data-engine-target", target.width + "x" + target.height);
    return geometrySequence;
  }

  // Called by Lua at the real Red/Blue/Yellow handoff, with the engine's own
  // current geometry as the baseline. The preparation module never reaches
  // this, so it keeps its validated rectangle and its touch coordinate space.
  function enterGameViewport(engineWidth, engineHeight) {
    baseWidth = Math.max(1, Math.round(Number(engineWidth) || 0));
    baseHeight = Math.max(1, Math.round(Number(engineHeight) || 0));
    gameLive = true;
    document.body.classList.add("web-game-live");
    setGeometryState("GAME_HANDOFF");
    return publishTarget(true);
  }

  // Lua publishes the dimensions the ENGINE actually holds, after setMode.
  // The shell never derives them from the DOM: this is what turns the
  // invariant into a measurement instead of an assumption.
  function reportLoveGeometry(windowW, windowH, logicalW, logicalH, pixelW, pixelH) {
    var v = Array.prototype.slice.call(arguments).map(function (value) {
      return Math.round(Number(value) || 0);
    });
    loveGeometry = {
      windowWidth: v[0], windowHeight: v[1],
      logicalWidth: v[2], logicalHeight: v[3],
      pixelWidth: v[4], pixelHeight: v[5]
    };
    document.body.setAttribute("data-love-geometry",
      v[2] + "x" + v[3] + "@" + v[4] + "x" + v[5]);
    presentEngineRectangle();
    return chainCoherent() ? 1 : 0;
  }

  // Safari can emit several viewport events for one change; they are
  // coalesced. Re-presenting is immediate and free; re-publishing a target is
  // debounced and deadbanded, so a viewport wobble cannot feed itself.
  function queueGeometrySync() {
    window.requestAnimationFrame(presentEngineRectangle);
    if (!gameLive) return;
    if (resizeTimer !== null) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      resizeTimer = null;
      publishTarget(false);
    }, 180);
  }
  var queueAdaptiveMeasurement = queueGeometrySync;

  // One rectangle for rendering and for input: the backing store and the CSS
  // box differ by a single uniform scalar, so this transform is exact on both
  // axes. This is what the half-black-canvas failure destroyed.
  function clientToLove(clientX, clientY) {
    if (!canvas) return null;
    var rect = canvas.getBoundingClientRect();
    if (!(rect.width > 0 && rect.height > 0)) return null;
    return {
      x: (Number(clientX) - rect.left) * Number(canvas.width) / rect.width,
      y: (Number(clientY) - rect.top) * Number(canvas.height) / rect.height
    };
  }

  if (canvas && window.MutationObserver) {
    new MutationObserver(function () {
      presentEngineRectangle();
    }).observe(canvas, {
      attributes: true,
      attributeFilter: ["width", "height"]
    });
  }
  setGeometryState(geometryState);
  window.setInterval(presentEngineRectangle, 500);
  var immersiveExit = document.createElement("button");
  immersiveExit.id = "immersive-exit";
  immersiveExit.type = "button";
  immersiveExit.textContent = "×";
  immersiveExit.setAttribute("aria-label", "Quitter le plein écran");
  document.body.appendChild(immersiveExit);
  var modPicker = document.createElement("input");
  modPicker.type = "file";
  modPicker.accept = ".zip,application/zip";
  modPicker.style.display = "none";
  modPicker.setAttribute("aria-hidden", "true");
  document.body.appendChild(modPicker);

  // The preparation rack (#rom-button / #mod-button / #fullscreen-button /
  // #web-status) is OPTIONAL: a shell that lets the launcher's own controls
  // drive the import omits it entirely, and the engine calls in through
  // Gen1WebBridge.pickRom instead.  Every reference to those four elements is
  // therefore guarded.  #rom-picker and #canvas are the only required ones.
  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function getFS() {
    return window.Module && window.Module.FS ? window.Module.FS : null;
  }

  function pathExists(fs, path) {
    try {
      return !!fs.analyzePath(path).exists;
    } catch (_) {
      return false;
    }
  }

  function readText(fs, path) {
    try {
      return fs.readFile(path, { encoding: "utf8" });
    } catch (_) {
      return null;
    }
  }

  function findSaveDirectory(fs) {
    var candidates = [];
    try {
      candidates = fs.readdir(SAVE_ROOT);
    } catch (_) {
      return null;
    }
    for (var i = 0; i < candidates.length; i += 1) {
      var name = candidates[i];
      if (name === "." || name === "..") continue;
      var directory = SAVE_ROOT + "/" + name;
      var markerPath = directory + "/" + MARKER;
      if (readText(fs, markerPath) === MARKER_VALUE) return directory;
    }
    return null;
  }

  function scrubTransientRom() {
    var fs = getFS();
    if (!fs || !saveDirectory) return;
    var path = saveDirectory + "/" + PICKED_ROM;
    if (pathExists(fs, path)) {
      try { fs.unlink(path); } catch (_) {}
    }
  }

  function shouldDeferSync(fs) {
    if (!saveDirectory || modImporting) return true;
    return pathExists(fs, saveDirectory + "/" + PICKED_ROM)
      || pathExists(fs, saveDirectory + "/" + PICKED_MOD)
      || pathExists(fs, saveDirectory + "/" + IMPORT_FLAG);
  }

  function persistFilesystem() {
    var fs = getFS();
    if (!fs || syncing || shouldDeferSync(fs)) return;
    syncing = true;
    fs.syncfs(false, function (error) {
      syncing = false;
      if (error) console.warn("IndexedDB sync failed", error);
    });
  }


  var lastDiagnostic = null;
  var diagnosticPanel = null;
  var stageFirstSeenAt = 0;
  var lastStage = null;

  function ensureDiagnosticPanel() {
    if (diagnosticPanel) return diagnosticPanel;
    diagnosticPanel = document.createElement("pre");
    diagnosticPanel.id = "web-diagnostic";
    diagnosticPanel.style.cssText = [
      "position:fixed", "left:8px", "right:8px", "bottom:88px",
      "z-index:99999", "max-height:42vh", "overflow:auto",
      "white-space:pre-wrap", "word-break:break-word",
      "background:#240b0b", "color:#fff", "border:2px solid #ff6b6b",
      "padding:10px", "font:12px/1.35 ui-monospace,Menlo,monospace",
      "border-radius:10px"
    ].join(";");
    document.body.appendChild(diagnosticPanel);
    return diagnosticPanel;
  }

  function showDiagnostic(text) {
    if (!text || text === lastDiagnostic) return;
    lastDiagnostic = text;
    ensureDiagnosticPanel().textContent = text;
    setStatus("Diagnostic affiché — faites une capture de l’encadré rouge.");
  }

  function pollDiagnostic() {
    var fs = getFS();
    if (fs && saveDirectory) {
      var err = readText(fs, saveDirectory + "/web-last-error.txt");
      if (err) {
        showDiagnostic(err);
        return;
      }
      var stage = readText(fs, saveDirectory + "/web-newgame-stage.txt");
      if (stage) {
        if (stage !== lastStage) {
          lastStage = stage;
          stageFirstSeenAt = Date.now();
        }
        if (Date.now() - stageFirstSeenAt > 1500) {
          showDiagnostic("NEW GAME en cours / bloqué à : " + stage);
        }
        return;
      }
    }
    var persistedStage = null;
    try { persistedStage = localStorage.getItem("gen1recomp-newgame-stage"); } catch (_) {}
    if (persistedStage && persistedStage !== "done") {
      showDiagnostic("Dernière étape NEW GAME avant le rechargement : " + persistedStage);
    }
  }


  var gamepadLabel = null;
  var hadGamepad = false;

  function activeGamepad() {
    if (!navigator.getGamepads) return null;
    var pads;
    try { pads = navigator.getGamepads(); } catch (_) { return null; }
    if (!pads) return null;
    for (var i = 0; i < pads.length; i += 1) {
      if (pads[i] && pads[i].connected !== false) return pads[i];
    }
    return null;
  }

  function noteGamepad() {
    var pad = activeGamepad();
    if (!pad) {
      if (hadGamepad) {
        hadGamepad = false;
        gamepadLabel = null;
        setStatus("Manette déconnectée — commandes tactiles disponibles.");
      }
      return;
    }
    hadGamepad = true;
    var label = (pad.id || "manette").replace(/\s+/g, " ").trim();
    if (label !== gamepadLabel) {
      gamepadLabel = label;
      setStatus("Manette détectée — " + label);
    }
    // Keep the game canvas as the active interaction target. WebKit/iOS
    // exposes MFi/GameController devices through the Gamepad API; love.js/SDL
    // consumes the same browser gamepad stream.
    if (canvas && document.activeElement !== canvas) {
      try { canvas.focus({ preventScroll: true }); } catch (_) { try { canvas.focus(); } catch (_) {} }
    }
  }

  function inNativeFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function setImmersive(on) {
    document.body.classList.toggle("web-immersive", !!on);
    if (canvas && on) {
      try { canvas.focus({ preventScroll: true }); } catch (_) {}
    }
    // The frame rect changed without a window resize event: re-present now,
    // and let the debounced publisher decide whether the engine rectangle
    // itself has to change. The backing store is never written from here.
    presentEngineRectangle();
    queueGeometrySync();
  }

  async function enterFullscreen() {
    // Fullscreen API when the browser exposes it; iPhone Safari may instead
    // fall back to the CSS immersive mode. Home Screen PWA + manifest
    // display=fullscreen removes the browser chrome.
    setImmersive(true);
    var target = document.documentElement;
    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen({ navigationUI: "hide" });
      } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen();
      }
    } catch (_) {
      // CSS immersive mode intentionally remains active.
    }
    setStatus("Mode jeu plein écran activé.");
    return true;
  }

  function exitFullscreen() {
    setImmersive(false);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } catch (_) {}
    return true;
  }

  // Opening a file picker is a privileged action: iOS only allows it inside a
  // real DOM user gesture.  A click on the rack button below IS one.  A call
  // arriving from Lua (love.system.openURL -> Gen1WebBridge.pickRom) is NOT:
  // SDL hands the touch to the engine a frame later, so by the time this runs
  // Safari has already closed the activation window and click() is a no-op
  // that throws nothing and reports nothing.
  //
  // We cannot make that call legal, so we make the dead end visible: when the
  // picker does not open, the status line says which button to press instead
  // of leaving the player tapping a launcher button that never answers.
  function openPicker(input, hint) {
    input.value = "";
    var opened = false;
    try {
      input.click();
      opened = true;
    } catch (_) {
      opened = false;
    }
    if (!opened || !userGestureLikely()) {
      setStatus(hint);
    }
    return true;
  }

  // navigator.userActivation is the direct answer where it exists (Chromium);
  // elsewhere fall back to "was there a real pointer event in the last
  // second", which is what a genuine button press looks like.
  var lastGesture = 0;
  ["pointerdown", "pointerup", "touchend", "click", "keydown"].forEach(
    function (type) {
      window.addEventListener(type, function () {
        lastGesture = Date.now();
      }, true);
    });

  function userGestureLikely() {
    var activation = navigator.userActivation;
    if (activation && typeof activation.isActive === "boolean") {
      return activation.isActive;
    }
    return (Date.now() - lastGesture) < 1000;
  }

  function pickRom() {
    return openPicker(picker,
      "Touchez « Importer une ROM » en bas de l’écran pour choisir la cartouche.");
  }

  function pickMod() {
    return openPicker(modPicker,
      "Touchez « Importer un mod » en bas de l’écran pour choisir le .zip.");
  }

  async function importSelectedMod(file) {
    if (!file) return;
    if (!/\.zip$/i.test(file.name)) {
      setStatus("Fichier refusé : choisissez un mod au format .zip.");
      return;
    }
    var fs = getFS();
    if (!fs || !saveDirectory) {
      setStatus("Le moteur n’est pas encore prêt. Réessayez dans un instant.");
      return;
    }
    if (!window.Gen1WebModInstaller || !window.Gen1WebModInstaller.install) {
      setStatus("Importeur de mods Web indisponible.");
      return;
    }

    modImporting = true;
    if (modButton) modButton.disabled = true;
    setStatus("Analyse locale du mod…");
    try {
      var result = await window.Gen1WebModInstaller.install({
        fs: fs,
        saveDirectory: saveDirectory,
        file: file,
        onProgress: function (done, total, id) {
          setStatus("Installation " + id + " — " + done + "/" + total);
        }
      });
      setStatus("Mod installé : " + result.id + " (" + result.files + " fichiers).");
    } catch (error) {
      console.error(error);
      var message = String(error && error.message ? error.message : error);
      try {
        var encoder = new TextEncoder();
        fs.writeFile(saveDirectory + "/web-mod-error.txt", encoder.encode(message));
        fs.writeFile(saveDirectory + "/web-mod-refresh.flag", encoder.encode("1"));
      } catch (_) {}
      setStatus("Échec import mod : " + message);
    } finally {
      modImporting = false;
      if (modButton) modButton.disabled = false;
      modPicker.value = "";
    }
  }

  async function importSelectedFile(file) {
    if (!file) return;
    if (!/\.(gb|gbc)$/i.test(file.name)) {
      setStatus("Fichier refusé : choisissez un fichier .gb ou .gbc.");
      return;
    }
    if (file.size !== 1024 * 1024) {
      setStatus("Fichier refusé : la ROM doit faire exactement 1 Mio.");
      return;
    }
    var fs = getFS();
    if (!fs || !saveDirectory) {
      setStatus("Le moteur n’est pas encore prêt. Réessayez dans un instant.");
      return;
    }

    if (pickerButton) pickerButton.disabled = true;
    setStatus("Lecture locale et validation par Gen1Recomp…");
    try {
      var bytes = new Uint8Array(await file.arrayBuffer());
      scrubTransientRom();
      fs.writeFile(saveDirectory + "/" + PICKED_ROM, bytes, {
        canOwn: true
      });
      bytes = null;
      setStatus("ROM remise au moteur local — aucun téléversement.");
    } catch (error) {
      console.error(error);
      scrubTransientRom();
      setStatus("Impossible de lire ce fichier local.");
    } finally {
      if (pickerButton) pickerButton.disabled = false;
    }
  }

  if (pickerButton) pickerButton.addEventListener("click", pickRom);
  if (modButton) modButton.addEventListener("click", pickMod);
  if (fullscreenButton) fullscreenButton.addEventListener("click", enterFullscreen);
  immersiveExit.addEventListener("click", exitFullscreen);
  picker.addEventListener("change", function () {
    importSelectedFile(picker.files && picker.files[0]);
  });
  modPicker.addEventListener("change", function () {
    importSelectedMod(modPicker.files && modPicker.files[0]);
  });

  window.Gen1WebBridge = {
    pickRom: pickRom,
    pickMod: pickMod,
    enterFullscreen: enterFullscreen,
    exitFullscreen: exitFullscreen,
    activeGamepad: activeGamepad,
    enterGameViewport: enterGameViewport,
    beginEngineResize: beginEngineResize,
    endEngineResize: endEngineResize,
    reportLoveGeometry: reportLoveGeometry,
    clientToLove: clientToLove,
    inspectGeometry: function () {
      var rect = canvas ? canvas.getBoundingClientRect() : null;
      return {
        state: geometryState,
        gameLive: gameLive,
        base: { width: baseWidth, height: baseHeight },
        requested: requestedGeometry,
        love: loveGeometry,
        backing: canvas ? { width: Number(canvas.width), height: Number(canvas.height) } : null,
        cssRect: rect ? { width: rect.width, height: rect.height } : null,
        scale: rect && canvas && canvas.width > 0
          ? { x: rect.width / canvas.width, y: rect.height / canvas.height } : null,
        viewport: glViewport(),
        gameBox: gameBoxSize(),
        locked: chainCoherent()
      };
    },
    persist: persistFilesystem,
    getSaveDirectory: function () { return saveDirectory; }
  };

  var readyPoll = window.setInterval(function () {
    var fs = getFS();
    if (!fs) return;
    saveDirectory = saveDirectory || findSaveDirectory(fs);
    if (!saveDirectory) return;
    window.clearInterval(readyPoll);
    if (pickerButton) pickerButton.disabled = false;
    if (modButton) modButton.disabled = false;
    setStatus("Prêt — ROM et mods traités uniquement sur cet appareil.");
    if (gameLive && !requestedGeometry) publishTarget(true);
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(function () {});
    }
    persistFilesystem();
  }, 250);

  window.setInterval(persistFilesystem, 4000);
  window.setInterval(noteGamepad, 250);
  window.addEventListener("gamepadconnected", noteGamepad);
  window.addEventListener("gamepaddisconnected", noteGamepad);
  window.addEventListener("resize", queueAdaptiveMeasurement);
  window.addEventListener("orientationchange", queueAdaptiveMeasurement);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", queueAdaptiveMeasurement);
  }
  document.addEventListener("fullscreenchange", function () {
    queueAdaptiveMeasurement();
    if (!inNativeFullscreen() && document.body.classList.contains("web-immersive")) {
      // Keep CSS immersive mode on iPhone; native fullscreen exits only
      // when the user explicitly taps our exit control.
    }
  });
  window.setInterval(pollDiagnostic, 250);
  window.setTimeout(pollDiagnostic, 750);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      scrubTransientRom();
      persistFilesystem();
    }
  });
  window.addEventListener("pagehide", function () {
    scrubTransientRom();
    persistFilesystem();
  });
  window.addEventListener("beforeunload", scrubTransientRom, { capture: true });

  // /gen1recomp/ PWA promotion: retire only the legacy Gen1Recomp caching
  // service worker and its CacheStorage entries. IndexedDB / IDBFS data is
  // deliberately untouched. Home Screen standalone mode does not require a
  // service worker on current iOS; offline caching can be reintroduced later
  // as a separate, versioned layer after this exact game build is validated.
  function retireLegacyGen1RecompServiceWorker() {
    if (window.location.pathname.indexOf("/gen1recomp/") !== 0) return;

    if ("caches" in window) {
      window.caches.keys().then(function (names) {
        return Promise.all(names.map(function (name) {
          return name.indexOf("gen1recomp-web-") === 0
            ? window.caches.delete(name)
            : false;
        }));
      }).catch(function (error) {
        console.warn("Legacy Gen1Recomp cache cleanup failed", error);
      });
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        return Promise.all(registrations.map(function (registration) {
          var scopePath = "";
          try { scopePath = new URL(registration.scope).pathname; } catch (_) {}
          if (scopePath.indexOf("/gen1recomp/") !== 0) return false;
          return registration.unregister();
        }));
      }).catch(function (error) {
        console.warn("Legacy Gen1Recomp service worker cleanup failed", error);
      });
    }
  }

  window.addEventListener("load", retireLegacyGen1RecompServiceWorker, { once: true });
})();

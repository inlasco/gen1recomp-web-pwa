(function () {
  "use strict";

  var STATE_FILE = "inlascomp-launcher-state.json";
  var COMMAND_FILE = "inlascomp-launcher-command.json";
  var BUNDLED_MOD = "mods/DramaticShape-Mobile-Web-by-inlasco.zip";
  var BUG_EMAIL = "radon61250@gmail.com";
  var POLL_MS = 180;

  var selectedGame = "red";
  var currentView = "library";
  var state = null;
  var lastStateRaw = "";
  var lastStateAt = 0;
  var toastTimer = null;
  var coverFailures = Object.create(null);

  var COPY = {
    fr: {
      library: "Bibliothèque", mods: "MODS", settings: "Paramètres",
      subtitle: "Classic Adventure Library", libraryLead: "Vos aventures, prêtes à jouer.",
      selected: "SÉLECTIONNÉ", ready: "Prêt", installed: "Installé", missing: "ROM requise",
      play: "Jouer", importRom: "Importer une ROM", reimport: "Réimporter",
      importHint: "La ROM reste sur votre appareil. Gen1Recomp l’identifie automatiquement.",
      variants: "Versions importées", working: "Traitement en cours…",
      modsTitle: "Mods", modsLead: "Importez, activez et désactivez vos mods locaux.",
      importMod: "Importer un mod .zip", bundled: "Dramatic Shape — Web/Mobile",
      bundledDesc: "Version incluse avec Gen1Recomp, adaptée au rendu Web/mobile.",
      installBundled: "Installer / réinstaller", enableAll: "Tout activer", disableAll: "Tout désactiver",
      noMods: "Aucun mod installé pour le moment.", enabled: "Activé", disabled: "Désactivé",
      settingsTitle: "Paramètres", settingsLead: "Options du launcher uniquement.",
      language: "Langue du launcher", languageDesc: "N’affecte pas la langue contenue dans la ROM.",
      report: "Signaler un bug", reportDesc: "Ouvre votre application Mail avec les informations de base.",
      reportButton: "Écrire un rapport", fullscreen: "Plein écran", fullscreenDesc: "Utilise le mode immersif disponible sur cet appareil.",
      fullscreenButton: "Activer", chooseRom: "Choisissez votre ROM (.gb / .gbc)",
      chooseMod: "Choisissez votre mod (.zip)", modInstalling: "Installation du mod…",
      modInstalled: "Mod installé", modFailed: "Échec de l’installation du mod",
      offlineCover: "Jaquette indisponible", unsupportedVariant: "Cette version n’est pas encore importée.",
      red: "RED", blue: "BLUE", yellow: "YELLOW", adventure: "ADVENTURE"
    },
    en: {
      library: "Library", mods: "MODS", settings: "Settings",
      subtitle: "Classic Adventure Library", libraryLead: "Your adventures, ready to play.",
      selected: "SELECTED", ready: "Ready", installed: "Installed", missing: "ROM required",
      play: "Play", importRom: "Import ROM", reimport: "Re-import",
      importHint: "Your ROM stays on this device. Gen1Recomp identifies it automatically.",
      variants: "Imported versions", working: "Working…",
      modsTitle: "Mods", modsLead: "Import, enable and disable your local mods.",
      importMod: "Import mod .zip", bundled: "Dramatic Shape — Web/Mobile",
      bundledDesc: "The Gen1Recomp bundled build, adapted for Web/mobile rendering.",
      installBundled: "Install / reinstall", enableAll: "Enable all", disableAll: "Disable all",
      noMods: "No mods installed yet.", enabled: "Enabled", disabled: "Disabled",
      settingsTitle: "Settings", settingsLead: "Launcher options only.",
      language: "Launcher language", languageDesc: "Does not change the language contained in your ROM.",
      report: "Report a bug", reportDesc: "Opens your mail app with basic diagnostic information.",
      reportButton: "Write report", fullscreen: "Fullscreen", fullscreenDesc: "Uses the immersive mode available on this device.",
      fullscreenButton: "Enable", chooseRom: "Choose your ROM (.gb / .gbc)",
      chooseMod: "Choose your mod (.zip)", modInstalling: "Installing mod…",
      modInstalled: "Mod installed", modFailed: "Mod installation failed",
      offlineCover: "Cover unavailable", unsupportedVariant: "This version has not been imported yet.",
      red: "RED", blue: "BLUE", yellow: "YELLOW", adventure: "ADVENTURE"
    },
    es: {
      library: "Biblioteca", mods: "MODS", settings: "Ajustes",
      subtitle: "Classic Adventure Library", libraryLead: "Tus aventuras, listas para jugar.",
      selected: "SELECCIONADO", ready: "Listo", installed: "Instalado", missing: "ROM necesaria",
      play: "Jugar", importRom: "Importar ROM", reimport: "Reimportar",
      importHint: "La ROM permanece en tu dispositivo. Gen1Recomp la identifica automáticamente.",
      variants: "Versiones importadas", working: "Procesando…",
      modsTitle: "Mods", modsLead: "Importa, activa y desactiva tus mods locales.",
      importMod: "Importar mod .zip", bundled: "Dramatic Shape — Web/Mobile",
      bundledDesc: "Versión incluida con Gen1Recomp, adaptada al renderizado Web/móvil.",
      installBundled: "Instalar / reinstalar", enableAll: "Activar todo", disableAll: "Desactivar todo",
      noMods: "Aún no hay mods instalados.", enabled: "Activado", disabled: "Desactivado",
      settingsTitle: "Ajustes", settingsLead: "Solo opciones del launcher.",
      language: "Idioma del launcher", languageDesc: "No cambia el idioma contenido en la ROM.",
      report: "Reportar un error", reportDesc: "Abre tu app de correo con información básica.",
      reportButton: "Escribir informe", fullscreen: "Pantalla completa", fullscreenDesc: "Usa el modo inmersivo disponible en este dispositivo.",
      fullscreenButton: "Activar", chooseRom: "Elige tu ROM (.gb / .gbc)",
      chooseMod: "Elige tu mod (.zip)", modInstalling: "Instalando mod…",
      modInstalled: "Mod instalado", modFailed: "Error al instalar el mod",
      offlineCover: "Carátula no disponible", unsupportedVariant: "Esta versión aún no está importada.",
      red: "RED", blue: "BLUE", yellow: "YELLOW", adventure: "ADVENTURE"
    },
    it: {
      library: "Libreria", mods: "MODS", settings: "Impostazioni",
      subtitle: "Classic Adventure Library", libraryLead: "Le tue avventure, pronte da giocare.",
      selected: "SELEZIONATO", ready: "Pronto", installed: "Installato", missing: "ROM necessaria",
      play: "Gioca", importRom: "Importa ROM", reimport: "Reimporta",
      importHint: "La ROM resta sul dispositivo. Gen1Recomp la identifica automaticamente.",
      variants: "Versioni importate", working: "Elaborazione…",
      modsTitle: "Mods", modsLead: "Importa, attiva e disattiva i mod locali.",
      importMod: "Importa mod .zip", bundled: "Dramatic Shape — Web/Mobile",
      bundledDesc: "Versione inclusa in Gen1Recomp, adattata al rendering Web/mobile.",
      installBundled: "Installa / reinstalla", enableAll: "Attiva tutto", disableAll: "Disattiva tutto",
      noMods: "Nessun mod installato.", enabled: "Attivo", disabled: "Disattivo",
      settingsTitle: "Impostazioni", settingsLead: "Solo opzioni del launcher.",
      language: "Lingua del launcher", languageDesc: "Non modifica la lingua contenuta nella ROM.",
      report: "Segnala un bug", reportDesc: "Apre l’app Mail con le informazioni di base.",
      reportButton: "Scrivi rapporto", fullscreen: "Schermo intero", fullscreenDesc: "Usa la modalità immersiva disponibile sul dispositivo.",
      fullscreenButton: "Attiva", chooseRom: "Scegli la ROM (.gb / .gbc)",
      chooseMod: "Scegli il mod (.zip)", modInstalling: "Installazione mod…",
      modInstalled: "Mod installato", modFailed: "Installazione mod non riuscita",
      offlineCover: "Copertina non disponibile", unsupportedVariant: "Questa versione non è ancora importata.",
      red: "RED", blue: "BLUE", yellow: "YELLOW", adventure: "ADVENTURE"
    },
    de: {
      library: "Bibliothek", mods: "MODS", settings: "Einstellungen",
      subtitle: "Classic Adventure Library", libraryLead: "Deine Abenteuer sind startklar.",
      selected: "AUSGEWÄHLT", ready: "Bereit", installed: "Installiert", missing: "ROM erforderlich",
      play: "Spielen", importRom: "ROM importieren", reimport: "Neu importieren",
      importHint: "Die ROM bleibt auf deinem Gerät. Gen1Recomp erkennt sie automatisch.",
      variants: "Importierte Versionen", working: "Verarbeitung…",
      modsTitle: "Mods", modsLead: "Lokale Mods importieren, aktivieren und deaktivieren.",
      importMod: "Mod .zip importieren", bundled: "Dramatic Shape — Web/Mobile",
      bundledDesc: "Die mit Gen1Recomp gelieferte, für Web/Mobilgeräte angepasste Version.",
      installBundled: "Installieren / neu installieren", enableAll: "Alle aktivieren", disableAll: "Alle deaktivieren",
      noMods: "Noch keine Mods installiert.", enabled: "Aktiv", disabled: "Inaktiv",
      settingsTitle: "Einstellungen", settingsLead: "Nur Launcher-Optionen.",
      language: "Launcher-Sprache", languageDesc: "Ändert nicht die Sprache in der ROM.",
      report: "Fehler melden", reportDesc: "Öffnet die Mail-App mit Basisinformationen.",
      reportButton: "Bericht schreiben", fullscreen: "Vollbild", fullscreenDesc: "Verwendet den auf diesem Gerät verfügbaren immersiven Modus.",
      fullscreenButton: "Aktivieren", chooseRom: "ROM auswählen (.gb / .gbc)",
      chooseMod: "Mod auswählen (.zip)", modInstalling: "Mod wird installiert…",
      modInstalled: "Mod installiert", modFailed: "Mod-Installation fehlgeschlagen",
      offlineCover: "Cover nicht verfügbar", unsupportedVariant: "Diese Version wurde noch nicht importiert.",
      red: "RED", blue: "BLUE", yellow: "YELLOW", adventure: "ADVENTURE"
    }
  };

  var language = (function () {
    try {
      var saved = localStorage.getItem("inlascomp-language");
      if (COPY[saved]) return saved;
    } catch (_) {}
    var browser = String(navigator.language || "fr").toLowerCase().slice(0, 2);
    return COPY[browser] ? browser : "fr";
  })();

  function t(key) {
    return (COPY[language] && COPY[language][key]) || COPY.en[key] || key;
  }

  function esc(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function getBridge() { return window.Gen1WebBridge || null; }
  function getFs() { return window.Module && window.Module.FS ? window.Module.FS : null; }
  function getSaveDirectory() {
    var bridge = getBridge();
    try { return bridge && bridge.getSaveDirectory ? bridge.getSaveDirectory() : null; }
    catch (_) { return null; }
  }

  function readState() {
    var fs = getFs();
    var dir = getSaveDirectory();
    if (!fs || !dir) return null;
    try {
      var raw = fs.readFile(dir + "/" + STATE_FILE, { encoding: "utf8" });
      if (typeof raw !== "string") raw = new TextDecoder("utf-8").decode(raw);
      if (!raw) return null;
      if (raw !== lastStateRaw) {
        lastStateRaw = raw;
        lastStateAt = Date.now();
        state = JSON.parse(raw);
      }
      return state;
    } catch (_) {
      return null;
    }
  }

  function writeCommand(action, extra) {
    var fs = getFs();
    var dir = getSaveDirectory();
    if (!fs || !dir) return false;
    var data = Object.assign({ action: action, nonce: Date.now() }, extra || {});
    try {
      fs.writeFile(dir + "/" + COMMAND_FILE, new TextEncoder().encode(JSON.stringify(data)));
      return true;
    } catch (_) { return false; }
  }

  function gameById(id) {
    var games = (state && state.games) || [];
    for (var i = 0; i < games.length; i += 1) if (games[i].id === id) return games[i];
    return null;
  }

  function selectedVariant(game) {
    if (!game) return null;
    var variants = game.variants || [];
    for (var i = 0; i < variants.length; i += 1) {
      if (variants[i].id === game.selectedVariant) return variants[i];
    }
    return variants[0] || null;
  }

  function variantName(v) {
    if (!v) return "";
    return String(v.label || v.id || "").toUpperCase();
  }

  function coverFile(gameId, variantId) {
    var names = {
      us: {
        red: "Pokemon - Red Version (USA, Europe) (SGB Enhanced).png",
        blue: "Pokemon - Blue Version (USA, Europe) (SGB Enhanced).png",
        yellow: "Pokemon - Yellow Version - Special Pikachu Edition (USA, Europe) (CGB+SGB Enhanced).png"
      },
      fr: {
        red: "Pokemon - Version Rouge (France) (SGB Enhanced).png",
        blue: "Pokemon - Version Bleue (France) (SGB Enhanced).png",
        yellow: "Pokemon - Version Jaune - Edition Speciale Pikachu (France) (CGB+SGB Enhanced).png"
      }
    };
    return names[variantId] && names[variantId][gameId] ? names[variantId][gameId] : null;
  }

  function coverUrl(gameId, variantId) {
    var file = coverFile(gameId, variantId);
    if (!file) return "";
    return "https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy/master/Named_Boxarts/" + encodeURIComponent(file).replace(/%2F/g, "/");
  }

  function buildShell() {
    if (document.getElementById("inlascomp-launcher")) return;
    var root = document.createElement("section");
    root.id = "inlascomp-launcher";
    root.hidden = true;
    root.setAttribute("aria-label", "inlasComp launcher");
    root.innerHTML = [
      '<div class="ic-shell">',
        '<aside class="ic-sidebar">',
          '<div class="ic-brand"><div class="ic-brand-mark"><span></span></div><div class="ic-brand-copy"><div class="ic-brand-name">inlasComp</div><div class="ic-brand-sub">Classic Adventure Library</div></div></div>',
          '<nav class="ic-nav" data-nav></nav>',
          '<div class="ic-side-bottom"><div class="ic-side-rule"></div><nav class="ic-nav" data-side-bottom></nav></div>',
        '</aside>',
        '<main class="ic-main">',
          '<header class="ic-topbar">',
            '<div class="ic-mobile-top"><div class="ic-brand-mark"><span></span></div><div class="ic-brand-name">inlasComp</div></div>',
            '<div class="ic-heading"><h1 data-page-title></h1><p data-page-lead></p></div>',
            '<div class="ic-top-tools"><div class="ic-lang" data-lang></div><button class="ic-icon-button" data-report title="Report a bug">!</button></div>',
          '</header>',
          '<section class="ic-view" data-view="library"><div class="ic-library-layout"><div class="ic-game-grid" data-game-grid></div><div data-detail></div></div></section>',
          '<section class="ic-view" data-view="mods" hidden><div class="ic-mod-page" data-mod-page></div></section>',
          '<section class="ic-view" data-view="settings" hidden><div class="ic-settings-page" data-settings-page></div></section>',
        '</main>',
      '</div>',
      '<nav class="ic-bottom-nav" data-bottom-nav></nav>',
      '<input id="inlascomp-mod-picker" type="file" accept=".zip,application/zip" hidden>',
      '<div class="ic-toast" data-toast></div>'
    ].join("");
    document.body.appendChild(root);
    bindStaticEvents(root);
    renderChrome();
  }

  function navButton(view, icon, label) {
    return '<button class="ic-nav-button' + (currentView === view ? ' is-active' : '') + '" data-go="' + view + '"><span class="ic-nav-icon">' + icon + '</span><span>' + esc(label) + '</span></button>';
  }

  function renderChrome() {
    var root = document.getElementById("inlascomp-launcher");
    if (!root) return;
    root.querySelector("[data-nav]").innerHTML = navButton("library", "▦", t("library")) + navButton("mods", "◇", t("mods"));
    root.querySelector("[data-side-bottom]").innerHTML = navButton("settings", "⚙", t("settings"));
    root.querySelector("[data-bottom-nav]").innerHTML = navButton("library", "⌂", t("library")) + navButton("mods", "◇", t("mods")) + navButton("settings", "⚙", t("settings"));
    root.querySelector("[data-lang]").innerHTML = ["fr","en","es","it","de"].map(function (code) {
      return '<button class="ic-lang-button' + (language === code ? ' is-active' : '') + '" data-language="' + code + '">' + code.toUpperCase() + '</button>';
    }).join("");
    var titles = {
      library: [t("library"), t("libraryLead")],
      mods: [t("modsTitle"), t("modsLead")],
      settings: [t("settingsTitle"), t("settingsLead")]
    };
    root.querySelector("[data-page-title]").textContent = titles[currentView][0];
    root.querySelector("[data-page-lead]").textContent = titles[currentView][1];
    root.querySelectorAll("[data-view]").forEach(function (node) { node.hidden = node.getAttribute("data-view") !== currentView; });
  }

  function renderLibrary() {
    if (!state) return;
    var root = document.getElementById("inlascomp-launcher");
    var games = state.games || [];
    if (!gameById(selectedGame) && games.length) selectedGame = games[0].id;
    var grid = root.querySelector("[data-game-grid]");
    grid.innerHTML = games.map(function (game) {
      var variant = selectedVariant(game);
      var url = coverUrl(game.id, variant && variant.id);
      var failedKey = game.id + ":" + (variant && variant.id || "");
      var ready = !!game.ready;
      return '<article class="ic-game-card' + (game.id === selectedGame ? ' is-selected' : '') + '" data-game-card="' + esc(game.id) + '" data-game="' + esc(game.id) + '">' +
        '<div class="ic-cover-fallback" data-letter="' + esc(String(game.id || "?").charAt(0).toUpperCase()) + '"></div>' +
        (url && !coverFailures[failedKey] ? '<img class="ic-cover" data-cover-key="' + esc(failedKey) + '" src="' + esc(url) + '" alt="" loading="eager" referrerpolicy="no-referrer">' : '') +
        '<div class="ic-card-shade"></div><div class="ic-card-body">' +
          '<div class="ic-card-title">' + esc(t(game.id)) + '</div><div class="ic-card-kicker">' + esc(t("adventure")) + '</div>' +
          '<div class="ic-card-status"><span class="' + (ready ? 'ic-ready' : '') + '"><i class="ic-status-dot"></i>' + esc(ready ? t("installed") : t("missing")) + '</span><span>' + esc(variantName(variant)) + '</span></div>' +
        '</div></article>';
    }).join("");

    var game = gameById(selectedGame);
    if (!game) return;
    var variant = selectedVariant(game);
    var variants = game.variants || [];
    var selectedReady = !!game.ready;
    var working = state.workState === "working" && state.importing === game.id;
    var detail = root.querySelector("[data-detail]");
    var chips = variants.map(function (v) {
      var active = v.id === game.selectedVariant;
      return '<button class="ic-chip' + (active ? ' is-active' : '') + '" data-variant="' + esc(v.id) + '" data-game="' + esc(game.id) + '"' + (!v.ready && !active ? ' disabled' : '') + '>' + esc(variantName(v)) + (v.ready ? ' ✓' : '') + '</button>';
    }).join("");
    var progress = working ? Math.max(0, Math.min(1, Number(state.progress) || 0)) : 0;
    detail.innerHTML = '<section class="ic-detail" data-game="' + esc(game.id) + '">' +
      '<div class="ic-detail-info"><div class="ic-eyebrow">' + esc(t("selected")) + '</div><h2>' + esc(game.displayName || game.label || game.id) + '</h2>' +
      '<div class="ic-detail-sub">' + esc(selectedReady ? (variantName(variant) + ' · ' + t("ready")) : t("importHint")) + '</div>' +
      '<div class="ic-variant-row" aria-label="' + esc(t("variants")) + '">' + chips + '</div>' +
      (working ? '<div class="ic-progress-wrap"><div class="ic-progress-text">' + esc(state.status || t("working")) + '</div><div class="ic-progress"><span style="width:' + Math.round(progress * 100) + '%"></span></div></div>' : '') +
      '</div><div class="ic-detail-actions">' +
      '<button class="ic-action ic-action-primary" data-play="' + esc(game.id) + '"' + (!selectedReady || working ? ' disabled' : '') + '>▶&nbsp;&nbsp;' + esc(t("play")) + '</button>' +
      '<button class="ic-action" data-import-rom="' + esc(game.id) + '"' + (working ? ' disabled' : '') + '>' + esc(t("importRom")) + '</button>' +
      (selectedReady ? '<button class="ic-action" data-reimport="' + esc(game.id) + '"' + (working ? ' disabled' : '') + '>' + esc(t("reimport")) + '</button>' : '') +
      '</div></section>';
  }

  function renderMods() {
    var root = document.getElementById("inlascomp-launcher");
    var page = root.querySelector("[data-mod-page]");
    var mods = (state && state.mods) || [];
    var rows = mods.length ? mods.map(function (mod) {
      return '<div class="ic-mod-row"><div><div class="ic-mod-name">' + esc(mod.name || mod.id) + '</div><div class="ic-mod-meta">v' + esc(mod.version || "?") + (mod.status ? ' · ' + esc(mod.status) : '') + (mod.description ? '<br>' + esc(mod.description) : '') + '</div></div>' +
      '<button class="ic-toggle' + (mod.enabled ? ' is-on' : '') + '" data-toggle-mod="' + esc(mod.id) + '" aria-label="' + esc(mod.enabled ? t("enabled") : t("disabled")) + '"></button></div>';
    }).join("") : '<div class="ic-empty">' + esc(t("noMods")) + '</div>';

    page.innerHTML = '<section class="ic-panel ic-mod-hero"><div class="ic-section-head"><div><h2>' + esc(t("modsTitle")) + '</h2><p>' + esc(t("modsLead")) + '</p></div>' +
      '<div class="ic-section-actions"><button class="ic-inline-action" data-disable-all>' + esc(t("disableAll")) + '</button><button class="ic-inline-action" data-enable-all>' + esc(t("enableAll")) + '</button><button class="ic-inline-action is-accent" data-import-mod>' + esc(t("importMod")) + '</button></div></div>' +
      '<div class="ic-mod-highlight"><div class="ic-mod-logo">◆</div><div><h3>' + esc(t("bundled")) + '</h3><p>' + esc(t("bundledDesc")) + '</p></div><button class="ic-inline-action is-accent" data-install-bundled>' + esc(t("installBundled")) + '</button></div></section>' +
      '<section class="ic-panel ic-mod-list">' + rows + '</section>';
  }

  function renderSettings() {
    var root = document.getElementById("inlascomp-launcher");
    var page = root.querySelector("[data-settings-page]");
    var langButtons = ["fr","en","es","it","de"].map(function (code) {
      return '<button class="ic-lang-button' + (language === code ? ' is-active' : '') + '" data-language="' + code + '">' + code.toUpperCase() + '</button>';
    }).join("");
    page.innerHTML = '<section class="ic-panel ic-settings-card"><div class="ic-section-head"><div><h2>' + esc(t("settingsTitle")) + '</h2><p>' + esc(t("settingsLead")) + '</p></div></div>' +
      '<div class="ic-setting-row"><div><div class="ic-setting-title">' + esc(t("language")) + '</div><div class="ic-setting-desc">' + esc(t("languageDesc")) + '</div></div><div class="ic-lang">' + langButtons + '</div></div>' +
      '<div class="ic-setting-row"><div><div class="ic-setting-title">' + esc(t("fullscreen")) + '</div><div class="ic-setting-desc">' + esc(t("fullscreenDesc")) + '</div></div><button class="ic-inline-action" data-fullscreen>' + esc(t("fullscreenButton")) + '</button></div>' +
      '<div class="ic-setting-row"><div><div class="ic-setting-title">' + esc(t("report")) + '</div><div class="ic-setting-desc">' + esc(t("reportDesc")) + '</div></div><button class="ic-inline-action is-accent" data-report>' + esc(t("reportButton")) + '</button></div></section>';
  }

  function renderAll() {
    if (!state) return;
    renderChrome();
    renderLibrary();
    renderMods();
    renderSettings();
  }

  function setView(view) {
    if (["library","mods","settings"].indexOf(view) < 0) return;
    currentView = view;
    if (view === "mods") writeCommand("open-mods");
    renderAll();
  }

  function setLanguage(code) {
    if (!COPY[code]) return;
    language = code;
    try { localStorage.setItem("inlascomp-language", code); } catch (_) {}
    document.documentElement.lang = code;
    renderAll();
  }

  function showToast(message, error) {
    var el = document.querySelector("#inlascomp-launcher [data-toast]");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("is-error", !!error);
    el.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-visible"); }, 3600);
  }

  function reportBug() {
    var game = gameById(selectedGame);
    var detail = [
      "inlasComp / Gen1Recomp Web",
      "Game: " + (game ? game.id : "n/a"),
      "Variant: " + (game ? game.selectedVariant : "n/a"),
      "Launcher language: " + language,
      "UA: " + navigator.userAgent,
      "",
      "Describe the issue here:"
    ].join("\n");
    window.location.href = "mailto:" + BUG_EMAIL + "?subject=" + encodeURIComponent("inlasComp bug report") + "&body=" + encodeURIComponent(detail);
  }

  function importRom(gameId) {
    selectedGame = gameId;
    writeCommand("prepare-rom-picker", { game: gameId });
    var picker = document.getElementById("rom-picker");
    if (!picker) { showToast(t("chooseRom"), true); return; }
    picker.value = "";
    showToast(t("chooseRom"), false);
    try { picker.click(); } catch (_) { showToast(t("chooseRom"), true); }
  }

  async function installModFile(file) {
    if (!file) return;
    var fs = getFs();
    var dir = getSaveDirectory();
    if (!window.Gen1WebModInstaller || !window.Gen1WebModInstaller.install || !fs || !dir) {
      showToast(t("modFailed"), true);
      return;
    }
    showToast(t("modInstalling"), false);
    try {
      var result = await window.Gen1WebModInstaller.install({
        fs: fs,
        saveDirectory: dir,
        file: file,
        onProgress: function (done, total, id) {
          showToast(t("modInstalling") + " " + id + " — " + done + "/" + total, false);
        }
      });
      showToast(t("modInstalled") + ": " + result.id, false);
      writeCommand("refresh-mods");
    } catch (error) {
      console.error("[inlasComp] mod install", error);
      showToast(t("modFailed") + ": " + (error && error.message ? error.message : error), true);
    }
  }

  async function installBundled() {
    showToast(t("modInstalling"), false);
    try {
      var response = await fetch(BUNDLED_MOD, { cache: "no-cache", credentials: "same-origin" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      var blob = await response.blob();
      var file = new File([blob], "DramaticShape-Mobile-Web-by-inlasco.zip", { type: "application/zip" });
      await installModFile(file);
    } catch (error) {
      console.error("[inlasComp] bundled mod", error);
      showToast(t("modFailed") + ": " + (error && error.message ? error.message : error), true);
    }
  }

  function bindStaticEvents(root) {
    root.addEventListener("click", function (event) {
      var target = event.target.closest("button,[data-game-card]");
      if (!target) return;
      if (target.hasAttribute("data-go")) { setView(target.getAttribute("data-go")); return; }
      if (target.hasAttribute("data-language")) { setLanguage(target.getAttribute("data-language")); return; }
      if (target.hasAttribute("data-report")) { reportBug(); return; }
      if (target.hasAttribute("data-game-card")) {
        selectedGame = target.getAttribute("data-game-card");
        writeCommand("select-game", { game: selectedGame });
        renderLibrary();
        return;
      }
      if (target.hasAttribute("data-variant")) {
        var gameId = target.getAttribute("data-game");
        var variant = target.getAttribute("data-variant");
        selectedGame = gameId;
        writeCommand("select-variant", { game: gameId, variant: variant });
        return;
      }
      if (target.hasAttribute("data-play")) {
        var playGame = target.getAttribute("data-play");
        var g = gameById(playGame);
        writeCommand("play", { game: playGame, variant: g && g.selectedVariant });
        return;
      }
      if (target.hasAttribute("data-import-rom")) { importRom(target.getAttribute("data-import-rom")); return; }
      if (target.hasAttribute("data-reimport")) {
        var rg = target.getAttribute("data-reimport");
        var game = gameById(rg);
        writeCommand("reimport-rom", { game: rg, variant: game && game.selectedVariant });
        setTimeout(function () { importRom(rg); }, 120);
        return;
      }
      if (target.hasAttribute("data-import-mod")) {
        var mp = document.getElementById("inlascomp-mod-picker");
        if (mp) { mp.value = ""; showToast(t("chooseMod"), false); mp.click(); }
        return;
      }
      if (target.hasAttribute("data-install-bundled")) { installBundled(); return; }
      if (target.hasAttribute("data-toggle-mod")) { writeCommand("toggle-mod", { modId: target.getAttribute("data-toggle-mod") }); return; }
      if (target.hasAttribute("data-enable-all")) { writeCommand("enable-all-mods"); return; }
      if (target.hasAttribute("data-disable-all")) { writeCommand("disable-all-mods"); return; }
      if (target.hasAttribute("data-fullscreen")) {
        var bridge = getBridge();
        if (bridge && bridge.enterFullscreen) bridge.enterFullscreen();
      }
    });

    root.addEventListener("error", function (event) {
      var img = event.target;
      if (!img || !img.matches || !img.matches("img.ic-cover")) return;
      var key = img.getAttribute("data-cover-key");
      if (key) coverFailures[key] = true;
      img.remove();
    }, true);

    var modPicker = root.querySelector("#inlascomp-mod-picker");
    modPicker.addEventListener("change", function () {
      var file = modPicker.files && modPicker.files[0];
      if (file) installModFile(file);
      modPicker.value = "";
    });
  }

  function poll() {
    buildShell();
    var root = document.getElementById("inlascomp-launcher");
    var fresh = readState();
    if (fresh && fresh.active !== false) {
      root.hidden = false;
      document.body.classList.add("inlascomp-launcher-live");
      if (fresh.tab === "red" || fresh.tab === "blue" || fresh.tab === "yellow") selectedGame = fresh.tab;
      renderAll();
    } else {
      if (!lastStateAt || Date.now() - lastStateAt > 700) {
        root.hidden = true;
        document.body.classList.remove("inlascomp-launcher-live");
        state = null;
        lastStateRaw = "";
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      buildShell();
      setInterval(poll, POLL_MS);
      poll();
    }, { once: true });
  } else {
    buildShell();
    setInterval(poll, POLL_MS);
    poll();
  }
})();

--[[
This file is part of "love.js" by 2dengine.
https://2dengine.com/doc/lovejs.html

MIT License

Copyright (c) 2022 2dengine LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
]]

-- normalizem.lua is a series of hacks which ensure that
-- any optional love.js modules behave as expected

if love.event then
  local _love_event_push = love.event.push
  function love.event.push(event, action, ...)
    if event == 'quit' and action == 'reload' then
      love.js.eval('window.Player.deletePkgs(); window.location.reload();')
      return
    end
    return _love_event_push(event, action, ...)
  end
end

if love.audio then
  local playing = {}
  local function _cleanup_playing()
    for s in pairs(playing) do
      -- we need to use "pcall" in case the object was released
      local ok, busy = pcall(s.isPlaying, s)
      if not ok or not busy then
        playing[s] = nil
      end
    end
  end
  local _love_audio_play = love.audio.play
  function love.audio.play(...)
    --_cleanup_playing()
    -- track currently playing
    for i = 1, select("#", ...) do
      local source = select(i, ...)
      if source ~= nil then
        playing[source] = true
      end
    end
    return _love_audio_play(...)
  end

  local _love_audio_stop = love.audio.stop
  function love.audio.stop(source, ...)
    if source then
      return _love_audio_stop(source, ...)
    end
    _cleanup_playing()
    for s in pairs(playing) do
      s:stop()
      playing[s] = nil
    end
  end

  local reg = debug.getregistry()
  if reg then
    local _Source_play = reg.Source.play
    reg.Source.play = function(source, ...)
      local res = _Source_play(source, ...)
      if res then
        playing[source] = true
      end
      return res
    end
  end
end

local cache = {}
local maxlines = 2^32
local function input(n)
  n = n or maxlines
  for i = 1, n do
    local line = io.read()
    if not line then
      break
    end
    cache[i] = line
  end
  local sz = table.concat(cache, '\n')
  for i = #cache, 1, -1 do
    cache[i] = nil
  end
  return sz
end

function love.system.getClipboardText()
  return love.js.eval([[
(function() {
  var clipboard = navigator.clipboard;
  if (!clipboard)
    return '';
  if (clipboard.text !== undefined)
    return clipboard.text;

  function sync_clipboard() {
    clipboard.readText()
      .then(function (text) {
        clipboard.permission = 'granted';
        clipboard.text = text;
      })
      .catch(function (error) {
        //console.log(error);
      })
      .finally(function() {
        if (clipboard.permission == 'granted')
          setTimeout(sync_clipboard, 10);
      });
  }

  clipboard.permission = 'prompt';
  clipboard.text = clipboard.text || '';
  sync_clipboard();
  return '';
})();
]]);
end

function love.system.setClipboardText(text)
  local cmd = [[
(function() {
  var clipboard = navigator.clipboard;
  if (!clipboard)
    return;
  clipboard.text = %q;
  navigator.clipboard.writeText(clipboard.text)
    .catch(function () {});
  document.execCommand('copy');
})();
]]
  cmd = string.format(cmd, text)
  return love.js.eval(cmd)
end


-- inlasComp Web launcher overlay. Kept in normalize2 so the production .love
-- and LÖVE 11.5 runtime remain byte-for-byte untouched.
package.preload["inlascomp_launcher"] = function()
-- inlasComp Web launcher bridge.
--
-- This module does not replace Gen1Recomp's importer. It wraps the current
-- LauncherView at load time, exports its state to the DOM and accepts a small
-- command channel from the Web shell. The original view keeps drawing behind
-- the DOM launcher, so any engine-side modal/state machine remains intact and
-- the existing launcher is still the automatic fallback if the Web shell is
-- unavailable.

local M = {}

local STATE_FILE = "inlascomp-launcher-state.json"
local COMMAND_FILE = "inlascomp-launcher-command.json"
local STATE_INTERVAL = 0.18

local function jsonEscape(value)
  value = tostring(value or "")
  value = value:gsub("\\", "\\\\")
  value = value:gsub('"', '\\"')
  value = value:gsub("\b", "\\b")
  value = value:gsub("\f", "\\f")
  value = value:gsub("\n", "\\n")
  value = value:gsub("\r", "\\r")
  value = value:gsub("\t", "\\t")
  value = value:gsub("[%z\1-\31]", function(c)
    return string.format("\\u%04x", string.byte(c))
  end)
  return '"' .. value .. '"'
end

local function isArray(t)
  if type(t) ~= "table" then return false end
  local n = 0
  for k in pairs(t) do
    if type(k) ~= "number" or k < 1 or k % 1 ~= 0 then return false end
    if k > n then n = k end
  end
  for i = 1, n do if t[i] == nil then return false end end
  return true, n
end

local function encodeJson(value, seen)
  local tv = type(value)
  if value == nil then return "null" end
  if tv == "boolean" then return value and "true" or "false" end
  if tv == "number" then
    if value ~= value or value == math.huge or value == -math.huge then return "null" end
    return tostring(value)
  end
  if tv == "string" then return jsonEscape(value) end
  if tv ~= "table" then return jsonEscape(tostring(value)) end

  seen = seen or {}
  if seen[value] then return "null" end
  seen[value] = true
  local array, n = isArray(value)
  local out = {}
  if array then
    for i = 1, n do out[#out + 1] = encodeJson(value[i], seen) end
    seen[value] = nil
    return "[" .. table.concat(out, ",") .. "]"
  end
  for k, v in pairs(value) do
    if type(k) == "string" then
      out[#out + 1] = jsonEscape(k) .. ":" .. encodeJson(v, seen)
    end
  end
  table.sort(out)
  seen[value] = nil
  return "{" .. table.concat(out, ",") .. "}"
end

local function decodeCommand(raw)
  if type(raw) ~= "string" or raw == "" then return nil end
  local ok, Json = pcall(require, "src.link.Json")
  if ok and Json and Json.decode then
    local decoded, cmd = pcall(Json.decode, raw)
    if decoded and type(cmd) == "table" then return cmd end
  end
  -- The shell only emits JSON. If the engine decoder is unavailable, fail
  -- closed rather than attempting to execute a malformed command.
  return nil
end

local function bool(v) return v and true or false end
local function text(v)
  if v == nil then return nil end
  return tostring(v)
end

local function clearBridgeFiles()
  pcall(love.filesystem.remove, STATE_FILE)
  pcall(love.filesystem.remove, COMMAND_FILE)
end

local function buildState(imp)
  local GameVersion = require("src.core.GameVersion")
  local state = {
    active = true,
    schema = 1,
    tab = imp.tab,
    workState = imp.workState,
    status = text(imp.status),
    detail = text(imp.detail),
    progress = tonumber(imp.progress) or 0,
    importing = text(imp.importing),
    errorVersion = text(imp.errorVersion),
    games = {},
    mods = {},
  }

  for _, game in ipairs(GameVersion.ORDER or { "red", "blue", "yellow" }) do
    local currentVariant = GameVersion.variantFor and GameVersion.variantFor(game)
      or (GameVersion.variant and GameVersion.variant()) or "us"
    local gameInfo = GameVersion.info(game, currentVariant) or GameVersion.info(game)
    local g = {
      id = game,
      label = text(gameInfo and (gameInfo.launcherName or gameInfo.label)) or game,
      displayName = text(gameInfo and gameInfo.displayName) or game,
      selectedVariant = currentVariant,
      ready = bool(imp.ready and imp.ready[game]),
      returning = bool(imp.returning and imp.returning[game]),
      romName = text(imp.romName and imp.romName[game]),
      variants = {},
    }

    local variants = GameVersion.variantsOf and GameVersion.variantsOf(game) or { currentVariant }
    for _, variant in ipairs(variants) do
      local info = GameVersion.info(game, variant) or {}
      local byVariant = imp.readyVariants and imp.readyVariants[game]
      g.variants[#g.variants + 1] = {
        id = variant,
        ready = bool(byVariant and byVariant[variant]),
        language = text(info.language) or (variant == "us" and "en" or variant),
        label = text(info.variantLabel or info.regionLabel or variant:upper()),
        displayName = text(info.displayName),
      }
    end
    state.games[#state.games + 1] = g
  end

  -- Installed mods are local state. Do not trigger network discovery here.
  if imp._ensureMods then pcall(imp._ensureMods, imp) end
  for i, mod in ipairs(imp.mods or {}) do
    if i > 64 then break end
    state.mods[#state.mods + 1] = {
      id = text(mod.id) or ("mod-" .. i),
      name = text(mod.name) or text(mod.id) or "Mod",
      version = text(mod.version),
      enabled = bool(mod.enabled),
      status = text(mod.status),
      badge = text(mod.badge),
      description = text(mod.description),
      experimental = bool(mod.experimental),
    }
  end
  if imp.modNotice then
    state.modNotice = {
      ok = bool(imp.modNotice.ok),
      text = text(imp.modNotice.text),
    }
  end

  local currentGame = GameVersion.GAMES and GameVersion.GAMES[imp.tab] and imp.tab or nil
  if currentGame then
    local variant = GameVersion.variantFor and GameVersion.variantFor(currentGame) or nil
    local info = GameVersion.info(currentGame, variant) or GameVersion.info(currentGame)
    state.language = text(info and info.language)
  end

  return state
end

local function writeState(imp, force)
  if imp._handedOff then
    clearBridgeFiles()
    return
  end
  imp._inlascompStateClock = (imp._inlascompStateClock or 0)
  if not force and imp._inlascompStateClock < STATE_INTERVAL then return end
  imp._inlascompStateClock = 0
  local ok, payload = pcall(function() return encodeJson(buildState(imp)) end)
  if ok and payload then pcall(love.filesystem.write, STATE_FILE, payload) end
end

local function selectGame(imp, game)
  if type(game) ~= "string" then return false end
  local GameVersion = require("src.core.GameVersion")
  if not (GameVersion.GAMES and GameVersion.GAMES[game]) then return false end
  if imp._switchTab then
    pcall(imp._switchTab, imp, game)
  else
    imp.tab = game
  end
  imp.panelVersion = game
  return true
end

local function selectVariant(imp, game, variant)
  if not (game and variant) then return false end
  if not selectGame(imp, game) then return false end
  if imp.selectVariant then
    local ok, result = pcall(imp.selectVariant, imp, game, variant)
    return ok and result ~= false
  end
  return false
end

local function prepareRomPicker(imp, game)
  if imp.workState == "working" then return false end
  selectGame(imp, game)
  imp.chooseVersion = game or imp.chooseVersion or "red"
  -- This is the same armed state RomImporter:choose establishes on Web before
  -- the browser delivers picked_rom.gb. The DOM launcher itself owns the real
  -- user gesture, so it can open the input directly without the extra iOS
  -- prompt round-trip.
  imp.pickPending = true
  imp.pickTimer = 0
  return true
end

local function processCommand(imp)
  local raw = love.filesystem.read(COMMAND_FILE)
  if not raw then return end
  -- Consume first: even a command that throws must never replay every frame.
  pcall(love.filesystem.remove, COMMAND_FILE)
  local cmd = decodeCommand(raw)
  if type(cmd) ~= "table" then return end
  local action = cmd.action

  if action == "select-game" then
    selectGame(imp, cmd.game)
  elseif action == "select-variant" then
    selectVariant(imp, cmd.game, cmd.variant)
  elseif action == "play" then
    selectGame(imp, cmd.game)
    if cmd.variant then selectVariant(imp, cmd.game, cmd.variant) end
    if imp.ready and imp.ready[cmd.game] and imp.play then
      pcall(imp.play, imp, cmd.game)
    end
  elseif action == "prepare-rom-picker" then
    prepareRomPicker(imp, cmd.game)
  elseif action == "reimport-rom" then
    if selectGame(imp, cmd.game) and cmd.variant then
      selectVariant(imp, cmd.game, cmd.variant)
    end
    if imp.reimport then pcall(imp.reimport, imp, cmd.game) end
  elseif action == "refresh-mods" then
    if imp._ensureMods then pcall(imp._ensureMods, imp) end
  elseif action == "toggle-mod" then
    if imp._ensureMods then pcall(imp._ensureMods, imp) end
    if imp._toggleMod and cmd.modId then pcall(imp._toggleMod, imp, cmd.modId) end
  elseif action == "enable-all-mods" then
    if imp._setAllMods then pcall(imp._setAllMods, imp, true) end
  elseif action == "disable-all-mods" then
    if imp._setAllMods then pcall(imp._setAllMods, imp, false) end
  elseif action == "open-mods" then
    if imp._switchTab then pcall(imp._switchTab, imp, "mods") else imp.tab = "mods" end
    if imp._ensureMods then pcall(imp._ensureMods, imp) end
  end

  if imp._handedOff then
    clearBridgeFiles()
    return
  end
  writeState(imp, true)
end

function M.wrapOriginal()
  local chunk, err = love.filesystem.load("src/import/LauncherView.lua")
  assert(chunk, err or "could not load original LauncherView")
  local original = chunk()
  assert(type(original) == "table", "original LauncherView did not return a table")

  local wrapped = setmetatable({}, { __index = original })

  wrapped.update = function(imp, dt)
    if original.update then original.update(imp, dt) end
    if imp._handedOff then
      clearBridgeFiles()
      return
    end
    imp._inlascompStateClock = (imp._inlascompStateClock or 0) + (dt or 0)
    processCommand(imp)
    if imp._handedOff then
      clearBridgeFiles()
      return
    end
    writeState(imp, false)
  end

  wrapped.draw = function(imp)
    if imp._handedOff then
      clearBridgeFiles()
      return
    end
    -- Keep the battle-tested engine launcher alive underneath the DOM shell.
    -- This preserves all importer-side setup/modals and is an instant fallback
    -- if the Web UI fails to load.
    if original.draw then original.draw(imp) end
    writeState(imp, false)
  end

  wrapped.detach = function(imp)
    clearBridgeFiles()
    if original.detach then return original.detach(imp) end
  end

  return wrapped
end
  return M
end

package.preload["src.import.LauncherView"] = function()
  return require("inlascomp_launcher").wrapOriginal()
end

-- Which Gen-1 game this process is running, and in which regional variant.
--
-- There are three LOGICAL GAMES -- red, blue, yellow -- and each exists in one
-- or more VARIANTS (a language/region release of that same game).  The logical
-- game is the identity everything structural keys off: mods target "red", the
-- launcher shows three columns, scripts ask isYellow().  The variant only
-- decides which bytes we accept and where the extracted data lives:
--
--     game    variant   ROM SHA-1        manifest                    cache
--     red     us        ea9bcae6...      rom_manifest.json           red/
--     red     fr        47a7622f...      rom_manifest_red_fr.json    red-fr/
--     blue    us        d7037c83...      rom_manifest_blue.json      blue/
--     blue    fr        47faa910...      rom_manifest_blue_fr.json   blue-fr/
--     yellow  us        cc7d0326...      rom_manifest_yellow.json    yellow/
--     yellow  fr        0aceec0e...      rom_manifest_yellow_fr.json yellow-fr/
--
-- The `us` variant keeps every historical path byte-for-byte (Red still saves
-- to save.lua and caches under red/, Blue to save_blue.lua and blue/, ...), so
-- an existing install keeps finding its caches and saves.  A regional variant
-- gets its own cache prefix and save suffix, so a US and a FR copy of the same
-- game never share extracted data or progress.
--
-- Adding a language later (es/de/it) means adding a row to VARIANT_DATA and a
-- manifest; nothing else in the engine has to change.
--
-- Zero requires, so it loads during love.conf and under plain Lua for tools
-- and tests.  The active game+variant is a process-global set once at boot
-- from the launcher's choice (main.lua); it defaults to Red US.

local GameVersion = {}

-- ---------------------------------------------------------------------------
-- Logical games
-- ---------------------------------------------------------------------------

-- Fields here are variant-independent: they are the game's identity.
GameVersion.GAMES = {
  red = {
    id = "red",
    label = "Red",
    launcherName = "Red",       -- game-panel header in the launcher
  },
  blue = {
    id = "blue",
    label = "Blue",
    launcherName = "Blue",
  },
  yellow = {
    id = "yellow",
    label = "Yellow",
    launcherName = "Yellow",
  },
}

-- Launcher column order.  Three games, never six.
GameVersion.ORDER = { "red", "blue", "yellow" }

-- ---------------------------------------------------------------------------
-- Variants
-- ---------------------------------------------------------------------------

-- Selector order inside a game panel.  "us" is first so it stays the default.
GameVersion.VARIANT_ORDER = { "us", "fr" }

GameVersion.VARIANT_INFO = {
  us = {
    variant = "us",
    language = "en",
    region = "us",
    variantLabel = "US",        -- launcher selector chip
    languageLabel = "EN",
  },
  fr = {
    variant = "fr",
    language = "fr",
    region = "fr",
    variantLabel = "FR",
    languageLabel = "FR",
  },
}

-- Per game+variant: the ROM we accept, the manifest that describes it, and
-- the two namespaces that must never collide between variants.
--
-- saveSuffix "" (Red US) and "_blue"/"_yellow" are the historical names and
-- must not change: they are the files existing players already have.
GameVersion.VARIANT_DATA = {
  red = {
    us = {
      sha1 = "ea9bcae617fdf159b045185467ae58b2e4a48b9a",
      manifest = "tools/rom_manifest.json",
      cachePrefix = "red/",   -- red/data/generated, red/assets/generated (#899)
      saveSuffix = "",        -- save.lua / save.lua.bak / save.lua.tmp
      displayName = "Pokemon Red",
    },
    fr = {
      sha1 = "47a7622fa30e6402a3891fe65b3a930bf9bd7aec",
      manifest = "tools/rom_manifest_red_fr.json",
      cachePrefix = "red-fr/",
      saveSuffix = "_fr",     -- save_fr.lua
      displayName = "Pokemon Version Rouge",
    },
  },
  blue = {
    us = {
      sha1 = "d7037c83e1ae5b39bde3c30787637ba1d4c48ce2",
      manifest = "tools/rom_manifest_blue.json",
      cachePrefix = "blue/",  -- blue/data/generated, blue/assets/generated
      saveSuffix = "_blue",   -- save_blue.lua / .bak / .tmp
      displayName = "Pokemon Blue",
    },
    fr = {
      sha1 = "47faa910d0e073c600665bf9c83b6bd17babdf8a",
      manifest = "tools/rom_manifest_blue_fr.json",
      cachePrefix = "blue-fr/",
      saveSuffix = "_blue_fr",
      displayName = "Pokemon Version Bleue",
    },
  },
  yellow = {
    us = {
      sha1 = "cc7d03262ebfaf2f06772c1a480c7d9d5f4a38e1",
      manifest = "tools/rom_manifest_yellow.json",
      cachePrefix = "yellow/",  -- yellow/data/generated, yellow/assets/generated
      saveSuffix = "_yellow",   -- save_yellow.lua / .bak / .tmp
      displayName = "Pokemon Yellow",
    },
    fr = {
      sha1 = "0aceec0ef7aa2ca5aa831554598d91f61a925591",
      manifest = "tools/rom_manifest_yellow_fr.json",
      cachePrefix = "yellow-fr/",
      saveSuffix = "_yellow_fr",
      displayName = "Pokemon Version Jaune",
    },
  },
}

-- ---------------------------------------------------------------------------
-- Resolved records
-- ---------------------------------------------------------------------------

-- One frozen table per (game, variant): everything a caller can need about a
-- concrete playable build.  Built once at load; callers never mutate them.
local RESOLVED = {}
for game, variants in pairs(GameVersion.VARIANT_DATA) do
  RESOLVED[game] = {}
  for variant, data in pairs(variants) do
    local info = {}
    for k, v in pairs(GameVersion.GAMES[game]) do info[k] = v end
    for k, v in pairs(GameVersion.VARIANT_INFO[variant]) do info[k] = v end
    for k, v in pairs(data) do info[k] = v end
    info.game = game
    -- Identity of a save slot: the pair, not the game alone, so a US and a FR
    -- playthrough of the same game can coexist.
    info.saveId = variant == "us" and game or (game .. "-" .. variant)
    RESOLVED[game][variant] = info
  end
end
GameVersion.RESOLVED = RESOLVED

-- ---------------------------------------------------------------------------
-- Active game / variant
-- ---------------------------------------------------------------------------

GameVersion.current = "red"
GameVersion.currentVariant = "us"

-- Per-game variant choice, so the launcher can remember that (say) Yellow is
-- being played in French while Red is being played in English.  The active
-- game's entry is always in sync with currentVariant.
GameVersion.selected = { red = "us", blue = "us", yellow = "us" }

function GameVersion.hasVariant(id, variant)
  local variants = GameVersion.VARIANT_DATA[id]
  return (variants and variant and variants[variant]) ~= nil
end

-- The variant currently chosen for a game (defaults to us).
function GameVersion.variantFor(id)
  id = id or GameVersion.current
  local chosen = GameVersion.selected[id]
  if GameVersion.hasVariant(id, chosen) then return chosen end
  return "us"
end

-- Remember a variant for a game without making that game active.
function GameVersion.selectVariant(id, variant)
  if not GameVersion.hasVariant(id, variant) then return GameVersion.variantFor(id) end
  GameVersion.selected[id] = variant
  if id == GameVersion.current then GameVersion.currentVariant = variant end
  return variant
end

-- Make a game (and optionally a variant) active.  Historical single-argument
-- callers keep working: the game's remembered variant is used.
function GameVersion.set(id, variant)
  GameVersion.current = GameVersion.GAMES[id] and id or "red"
  if variant == nil then
    variant = GameVersion.variantFor(GameVersion.current)
  elseif not GameVersion.hasVariant(GameVersion.current, variant) then
    variant = "us"
  end
  GameVersion.currentVariant = variant
  GameVersion.selected[GameVersion.current] = variant
  return GameVersion.current, variant
end

function GameVersion.get()
  return GameVersion.current
end

function GameVersion.variant()
  return GameVersion.currentVariant
end

function GameVersion.isBlue()
  return GameVersion.current == "blue"
end

function GameVersion.isYellow()
  return GameVersion.current == "yellow"
end

-- True when the active build is a localised (non-US) release.
function GameVersion.isRegional(id, variant)
  return GameVersion.variantOf(id, variant) ~= "us"
end

function GameVersion.language(id, variant)
  return GameVersion.info(id, variant).language
end

-- Normalise the (id, variant) pair a caller passed, filling in the active /
-- remembered values.  Every accessor below funnels through this, so a call
-- with no arguments always describes the running build.
function GameVersion.variantOf(id, variant)
  id = id or GameVersion.current
  if variant == nil then variant = GameVersion.variantFor(id) end
  if not GameVersion.hasVariant(id, variant) then variant = "us" end
  return variant
end

-- Metadata for a game+variant, defaulting to the active one.
function GameVersion.info(id, variant)
  id = id or GameVersion.current
  local byVariant = RESOLVED[id]
  if not byVariant then return nil end
  return byVariant[GameVersion.variantOf(id, variant)]
end

function GameVersion.saveSuffix(id, variant)
  return GameVersion.info(id, variant).saveSuffix
end

function GameVersion.cachePrefix(id, variant)
  return GameVersion.info(id, variant).cachePrefix
end

function GameVersion.manifestPath(id, variant)
  return GameVersion.info(id, variant).manifest
end

function GameVersion.displayName(id, variant)
  return GameVersion.info(id, variant).displayName
end

-- ---------------------------------------------------------------------------
-- ROM identification
-- ---------------------------------------------------------------------------

-- The (game, variant) a ROM belongs to, by its SHA-1.  Returns nil for a ROM
-- that is not one of the six supported dumps -- a patched, hacked, truncated
-- or overdumped file has a different SHA-1 and is refused here.
function GameVersion.identify(sha1)
  if type(sha1) ~= "string" then return nil end
  sha1 = sha1:lower()
  for _, game in ipairs(GameVersion.ORDER) do
    for _, variant in ipairs(GameVersion.VARIANT_ORDER) do
      local info = RESOLVED[game] and RESOLVED[game][variant]
      if info and info.sha1 == sha1 then return game, variant end
    end
  end
  return nil
end

-- The logical game a ROM belongs to, or nil for an unknown ROM.  Historical
-- signature: callers that only care which column a ROM lands in.
function GameVersion.forSha1(sha1)
  local game = GameVersion.identify(sha1)
  return game
end

-- Every supported (game, variant) pair, in launcher order.  Used by the
-- importer's "supported ROMs" listing and by the tests.
function GameVersion.allVariants()
  local out = {}
  for _, game in ipairs(GameVersion.ORDER) do
    for _, variant in ipairs(GameVersion.VARIANT_ORDER) do
      local info = RESOLVED[game] and RESOLVED[game][variant]
      if info then out[#out + 1] = info end
    end
  end
  return out
end

-- The variants of one game, in launcher order.
function GameVersion.variantsOf(id)
  local out = {}
  for _, variant in ipairs(GameVersion.VARIANT_ORDER) do
    if GameVersion.hasVariant(id, variant) then out[#out + 1] = variant end
  end
  return out
end

-- ---------------------------------------------------------------------------
-- Backwards compatibility
-- ---------------------------------------------------------------------------

-- GameVersion.VERSIONS used to be `id -> {sha1, manifest, cachePrefix,
-- saveSuffix, displayName, ...}`.  Callers still use it two ways: as a
-- membership test (`if GameVersion.VERSIONS[v] then`) and as a metadata read.
-- Membership works unchanged.  Metadata reads resolve through the *currently
-- selected variant of that game*, which is what every historical caller
-- meant, so a FR playthrough reads FR paths without touching those call
-- sites.  Prefer GameVersion.info(id, variant) in new code: it is explicit.
GameVersion.VERSIONS = {}
for _, game in ipairs(GameVersion.ORDER) do
  GameVersion.VERSIONS[game] = setmetatable({}, {
    __index = function(_, key)
      local base = GameVersion.GAMES[game]
      if base[key] ~= nil then return base[key] end
      local info = RESOLVED[game][GameVersion.variantFor(game)]
      return info[key]
    end,
    __newindex = function()
      error("GameVersion.VERSIONS is read-only; edit VARIANT_DATA instead", 2)
    end,
    __metatable = false,
  })
end

return GameVersion

-- Regional (US / FR) support suite, run against the engine sources that a
-- packaged .love actually ships.  See run_fr_regional_tests.sh.
--
-- Pure Lua: no love, no LÖVE window, no ROM.  Everything here is either a
-- property of the shipped tables (GameVersion, Strings, the manifests) or a
-- pure function of them, which is exactly the layer a regional regression
-- would break first.

local root = arg[1] or "."
package.path = root .. "/?.lua;" .. root .. "/?/init.lua;" .. package.path

local passed, failed, skipped = 0, 0, 0
local failures = {}

local function ok(cond, name, detail)
  if cond then
    passed = passed + 1
  else
    failed = failed + 1
    failures[#failures + 1] = name .. (detail and ("  -- " .. detail) or "")
    print("FAIL  " .. name .. (detail and ("  -- " .. detail) or ""))
  end
end

local function eq(got, want, name)
  ok(got == want, name, ("got %s, want %s"):format(tostring(got), tostring(want)))
end

local function skip(name, why)
  skipped = skipped + 1
  print("SKIP  " .. name .. "  -- " .. why)
end

local function section(title)
  print("")
  print("== " .. title)
end

-- ---------------------------------------------------------------------------
section("GameVersion: three logical games, six variants")
-- ---------------------------------------------------------------------------

local GameVersion = require("src.core.GameVersion")

eq(#GameVersion.ORDER, 3, "exactly three logical games")
eq(GameVersion.ORDER[1] .. "/" .. GameVersion.ORDER[2] .. "/" .. GameVersion.ORDER[3],
  "red/blue/yellow", "the three games are red, blue, yellow")

local versionKeys = 0
for _ in pairs(GameVersion.VERSIONS) do versionKeys = versionKeys + 1 end
eq(versionKeys, 3, "GameVersion.VERSIONS still has three keys (mods see 3 games)")

eq(#GameVersion.allVariants(), 6, "six supported (game, variant) pairs")

-- The canonical dumps.  These are the reproducible-build hashes of the pret
-- and pret-derived disassemblies; a ROM that is not one of them is refused.
local EXPECTED = {
  { "ea9bcae617fdf159b045185467ae58b2e4a48b9a", "red", "us", "en" },
  { "47a7622fa30e6402a3891fe65b3a930bf9bd7aec", "red", "fr", "fr" },
  { "d7037c83e1ae5b39bde3c30787637ba1d4c48ce2", "blue", "us", "en" },
  { "47faa910d0e073c600665bf9c83b6bd17babdf8a", "blue", "fr", "fr" },
  { "cc7d03262ebfaf2f06772c1a480c7d9d5f4a38e1", "yellow", "us", "en" },
  { "0aceec0ef7aa2ca5aa831554598d91f61a925591", "yellow", "fr", "fr" },
}

for _, row in ipairs(EXPECTED) do
  local sha, game, variant, language = row[1], row[2], row[3], row[4]
  local g, v = GameVersion.identify(sha)
  eq(g, game, ("identify %s -> game"):format(sha:sub(1, 8)))
  eq(v, variant, ("identify %s -> variant"):format(sha:sub(1, 8)))
  eq(GameVersion.forSha1(sha), game,
    ("forSha1 %s keeps its historical contract"):format(sha:sub(1, 8)))
  local info = GameVersion.info(game, variant)
  eq(info.language, language, ("%s/%s language"):format(game, variant))
  eq(info.sha1, sha, ("%s/%s sha1 round-trips"):format(game, variant))
  ok(type(info.manifest) == "string" and info.manifest ~= "",
    ("%s/%s has a manifest path"):format(game, variant))
  ok(type(info.displayName) == "string" and info.displayName ~= "",
    ("%s/%s has a display name"):format(game, variant))
end

-- Rejection.  Anything not in the table above is not a supported dump:
-- a hack, a bad dump, an overdump, a patched or trimmed file.
for _, bad in ipairs({
  "0000000000000000000000000000000000000000",
  "ea9bcae617fdf159b045185467ae58b2e4a48b9b",  -- one nibble off
  "",
  "not a hash",
}) do
  eq(GameVersion.identify(bad), nil, ("unknown SHA-1 %q refused"):format(bad))
end
eq(GameVersion.identify(nil), nil, "nil SHA-1 refused")
eq(GameVersion.forSha1("deadbeef"), nil, "forSha1 refuses an unknown ROM")

-- Case tolerance: hashes are compared lower-case.
eq(select(1, GameVersion.identify("47A7622FA30E6402A3891FE65B3A930BF9BD7AEC")), "red",
  "uppercase SHA-1 still identifies")

-- ---------------------------------------------------------------------------
section("Caches: US and FR never share a namespace")
-- ---------------------------------------------------------------------------

local prefixes, seenPrefix = {}, {}
for _, info in ipairs(GameVersion.allVariants()) do
  local key = info.game .. "/" .. info.variant
  prefixes[key] = info.cachePrefix
  ok(not seenPrefix[info.cachePrefix],
    ("cache prefix %q is unique"):format(info.cachePrefix))
  seenPrefix[info.cachePrefix] = key
  ok(info.cachePrefix:sub(-1) == "/",
    ("cache prefix %q ends in /"):format(info.cachePrefix))
end

-- The historical US trees must not move: an existing install has to keep
-- finding the cache it already extracted.
eq(prefixes["red/us"], "red/", "Red US keeps red/")
eq(prefixes["blue/us"], "blue/", "Blue US keeps blue/")
eq(prefixes["yellow/us"], "yellow/", "Yellow US keeps yellow/")
ok(prefixes["red/fr"] ~= prefixes["red/us"], "Rouge FR cache != Red US cache")
ok(prefixes["blue/fr"] ~= prefixes["blue/us"], "Bleue FR cache != Blue US cache")
ok(prefixes["yellow/fr"] ~= prefixes["yellow/us"], "Jaune FR cache != Yellow US cache")

-- The cache completion marker embeds the variant's ROM hash, so a marker
-- written by one variant can never validate the other's cache.
for _, game in ipairs(GameVersion.ORDER) do
  local us = GameVersion.info(game, "us").sha1
  local fr = GameVersion.info(game, "fr").sha1
  ok(us ~= fr, ("%s: US and FR markers carry different hashes"):format(game))
end

-- ---------------------------------------------------------------------------
section("Saves: six playthroughs coexist, US names unchanged")
-- ---------------------------------------------------------------------------

local suffixes, seenSuffix, seenSaveId = {}, {}, {}
for _, info in ipairs(GameVersion.allVariants()) do
  local key = info.game .. "/" .. info.variant
  suffixes[key] = info.saveSuffix
  local file = "save" .. info.saveSuffix .. ".lua"
  ok(not seenSuffix[file], ("save file %q is unique"):format(file))
  seenSuffix[file] = key
  ok(not seenSaveId[info.saveId], ("save id %q is unique"):format(info.saveId))
  seenSaveId[info.saveId] = key
end

eq(suffixes["red/us"], "", "Red US still saves to save.lua")
eq(suffixes["blue/us"], "_blue", "Blue US still saves to save_blue.lua")
eq(suffixes["yellow/us"], "_yellow", "Yellow US still saves to save_yellow.lua")
eq(GameVersion.info("red", "us").saveId, "red", "Red US slot dir stays saves/red")
eq(GameVersion.info("blue", "us").saveId, "blue", "Blue US slot dir stays saves/blue")
eq(GameVersion.info("yellow", "us").saveId, "yellow",
  "Yellow US slot dir stays saves/yellow")
ok(GameVersion.info("red", "fr").saveId ~= "red", "Rouge FR has its own slot dir")

-- ---------------------------------------------------------------------------
section("Active selection and switching")
-- ---------------------------------------------------------------------------

GameVersion.set("red")
eq(GameVersion.get(), "red", "default game is Red")
eq(GameVersion.variant(), "us", "default variant is US")
eq(GameVersion.VERSIONS.red.cachePrefix, "red/",
  "VERSIONS view resolves the selected variant (US)")

GameVersion.set("red", "fr")
eq(GameVersion.variant(), "fr", "switched to Rouge FR")
eq(GameVersion.cachePrefix(), "red-fr/", "active cache prefix follows the variant")
eq(GameVersion.saveSuffix(), "_fr", "active save suffix follows the variant")
eq(GameVersion.language(), "fr", "active language follows the variant")
eq(GameVersion.VERSIONS.red.cachePrefix, "red-fr/",
  "VERSIONS view follows the variant, so legacy call sites stay correct")
eq(GameVersion.isYellow(), false, "isYellow() unaffected by the variant")

GameVersion.set("yellow")
eq(GameVersion.get(), "yellow", "switched game")
eq(GameVersion.isYellow(), true, "isYellow() still keys on the logical game")
eq(GameVersion.variant(), "us", "each game remembers its own variant")
eq(GameVersion.VERSIONS.red.cachePrefix, "red-fr/",
  "Red keeps its FR selection while Yellow is active")

GameVersion.set("yellow", "fr")
eq(GameVersion.isYellow(), true, "Jaune FR is still the Yellow game")
eq(GameVersion.cachePrefix(), "yellow-fr/", "Jaune FR cache")

-- An unsupported variant falls back rather than pointing at nothing.
GameVersion.set("red", "de")
eq(GameVersion.variant(), "us", "an unknown variant falls back to US")
GameVersion.set("emerald")
eq(GameVersion.get(), "red", "an unknown game falls back to Red")

GameVersion.set("red", "us")

-- ---------------------------------------------------------------------------
section("Mods: the target is still the logical game")
-- ---------------------------------------------------------------------------

-- A mod names red / blue / yellow.  Nothing in the mod layer may grow to six
-- ids, so the sets a mod can address are checked directly.
for _, game in ipairs({ "red", "blue", "yellow" }) do
  ok(GameVersion.VERSIONS[game] ~= nil, ("mods can target %q"):format(game))
  local variants = GameVersion.variantsOf(game)
  ok(#variants >= 2, ("%q resolves to more than one variant"):format(game))
  for _, variant in ipairs(variants) do
    GameVersion.set(game, variant)
    eq(GameVersion.get(), game,
      ("%s/%s still reports the logical game to mods"):format(game, variant))
  end
end
for _, notAGame in ipairs({ "red-fr", "blue-fr", "yellow-fr", "red_fr" }) do
  eq(GameVersion.VERSIONS[notAGame], nil,
    ("%q is NOT a mod-visible game"):format(notAGame))
end
GameVersion.set("red", "us")

-- A shared mod profile carries one slot per LOGICAL game.  Feeding it a
-- variant id must be rejected the same way any other unknown key is, or the
-- six-games shape would leak into a file format mods exchange.
local okProfile, ModProfile = pcall(require, "src.mods.ModProfile")
if okProfile and ModProfile.encode and ModProfile.decode then
  local body = ModProfile.encode({
    name = "TEST", enabled = {}, options = {},
    slots = { red = "slot1", ["red-fr"] = "slot1", nonsense = "slot1" },
  })
  local decoded, err = ModProfile.decode(body)
  if decoded then
    eq(decoded.slots.red, "slot1", "mod profile accepts the logical game id")
    eq(decoded.slots["red-fr"], nil, "mod profile rejects a variant id as a game")
    eq(decoded.slots.nonsense, nil, "mod profile rejects an unknown game id")
  else
    skip("mod profile slot filtering", tostring(err))
  end
else
  skip("mod profile slot filtering", "ModProfile could not be required")
end

-- ---------------------------------------------------------------------------
section("Strings: the FR catalog is correct and US-safe")
-- ---------------------------------------------------------------------------

local Strings = require("src.core.Strings")

local function specifiers(s)
  local n = 0
  for spec in s:gmatch("%%(.)") do
    if spec ~= "%" then n = n + 1 end
  end
  return n
end

eq(Strings.loadLocale("en"), false, "no built-in catalog for English")
eq(Strings("NEW GAME"), "NEW GAME", "US build reads English")

local loaded = Strings.loadLocale("fr")
ok(loaded, "the French catalog loads")
if loaded then
  ok(Strings("NEW GAME") ~= "NEW GAME", "French build translates a known key")
  eq(Strings("Wild %s\nappeared!", "PIKACHU"), "Wild PIKACHU\nappeared!",
    "an uncovered key falls through to English, formatted")

  local catalog = require("data.strings.fr")
  local entries, arityBad, emptyBad = 0, 0, 0
  for source, translation in pairs(catalog) do
    entries = entries + 1
    if type(translation) ~= "string" or translation == "" then
      emptyBad = emptyBad + 1
      print("       empty translation for " .. tostring(source))
    elseif specifiers(source) ~= specifiers(translation) then
      arityBad = arityBad + 1
      print(("       arity %d != %d for %q -> %q")
        :format(specifiers(source), specifiers(translation), source, translation))
    end
  end
  ok(entries > 0, ("catalog has entries (%d)"):format(entries))
  eq(arityBad, 0, "every translation keeps the source's format arity")
  eq(emptyBad, 0, "no empty translations")

  -- Placeholder tokens the text box resolves must survive translation.
  local tokenBad = 0
  for source, translation in pairs(catalog) do
    for token in source:gmatch("%b{}") do
      if not translation:find(token, 1, true) then
        tokenBad = tokenBad + 1
        print(("       token %s lost in %q"):format(token, source))
      end
    end
  end
  eq(tokenBad, 0, "every {TOKEN} in a source survives into its translation")
end

Strings.loadLocale("en")
eq(Strings("NEW GAME"), "NEW GAME", "switching back to English drops the catalog")

-- ---------------------------------------------------------------------------
section("Manifests: one per variant, each bound to its own ROM")
-- ---------------------------------------------------------------------------

local function readFile(path)
  local f = io.open(path, "rb")
  if not f then return nil end
  local data = f:read("*a")
  f:close()
  return data
end

-- Minimal, dependency-free extraction of the two scalar fields the suite
-- needs, so the 1 MB manifests do not have to be fully decoded here.
local function scalar(text, key)
  return text:match('"' .. key .. '"%s*:%s*"([^"]*)"')
end

local manifestSeen = {}
for _, info in ipairs(GameVersion.allVariants()) do
  local label = info.game .. "/" .. info.variant
  local raw = readFile(root .. "/" .. info.manifest)
  ok(raw ~= nil, ("%s manifest %s is present in the .love"):format(label, info.manifest))
  if raw then
    ok(not manifestSeen[info.manifest],
      ("%s has its own manifest file"):format(label))
    manifestSeen[info.manifest] = label
    eq(scalar(raw, "romSha1"), info.sha1,
      ("%s manifest declares its own ROM hash"):format(label))
    ok(raw:find('"format"%s*:%s*2') ~= nil,
      ("%s manifest is format 2"):format(label))
    -- The measurement block is what lets RomExtractor find the TX_FAR that
    -- follows a dex entry body: metric releases are one byte shorter.
    local measurements = scalar(raw, "measurements")
    if info.variant == "us" then
      ok(measurements == nil or measurements == "imperial",
        ("%s dex measurements are imperial"):format(label),
        tostring(measurements))
    else
      eq(measurements, "metric", ("%s dex measurements are metric"):format(label))
    end
  end
end

-- ---------------------------------------------------------------------------
section("Save converter: the charmap follows the variant")
-- ---------------------------------------------------------------------------

local charmaps = {
  { "src/save_convert/data/charmap.lua", "us" },
  { "src/save_convert/data/charmap_fr.lua", "fr" },
  { "src/save_convert/data/charmap_fr_yellow.lua", "fr yellow" },
}
local loadedMaps = {}
for _, row in ipairs(charmaps) do
  local chunk = loadfile(root .. "/" .. row[1])
  ok(chunk ~= nil, ("%s charmap ships"):format(row[2]))
  if chunk then loadedMaps[row[2]] = chunk() end
end

if loadedMaps.us and loadedMaps.fr then
  -- $BA is "é" internationally and "à" in the French releases; decoding a
  -- French .sav through the international table mangles every accented name.
  ok(loadedMaps.us.byByte[0xBA] ~= loadedMaps.fr.byByte[0xBA],
    "the FR charmap re-points $BA",
    ("us=%s fr=%s"):format(tostring(loadedMaps.us.byByte[0xBA]),
      tostring(loadedMaps.fr.byByte[0xBA])))
  -- Latin A-Z is shared; a "translation" that moved it would be wrong.
  local sameLetters = true
  for byte = 0x80, 0x99 do
    if loadedMaps.us.byByte[byte] ~= loadedMaps.fr.byByte[byte] then
      sameLetters = false
    end
  end
  ok(sameLetters, "A-Z stays at $80-$99 in both charmaps")
  -- Control tokens are structural, not localised.
  local sameControls = true
  for _, byte in ipairs({ 0x50, 0x52, 0x53, 0x57, 0x58 }) do
    if loadedMaps.us.byByte[byte] ~= loadedMaps.fr.byByte[byte] then
      sameControls = false
    end
  end
  ok(sameControls, "control tokens are identical across charmaps")
end

-- ---------------------------------------------------------------------------
section("Packaging: no ROM, no user data, no private cache")
-- ---------------------------------------------------------------------------

local function listFiles(dir, acc)
  acc = acc or {}
  local pipe = io.popen('find "' .. dir .. '" -type f 2>/dev/null')
  if not pipe then return nil end
  for line in pipe:lines() do acc[#acc + 1] = line:sub(#dir + 2) end
  pipe:close()
  return acc
end

local files = listFiles(root)
if not files then
  skip("artifact content audit", "io.popen unavailable")
else
  local FORBIDDEN = {
    "%.gbc?$", "%.rom$", "%.sav$", "%.srm$", "%.state$",
    "^data/generated/", "^assets/generated/", "picked_rom", "baserom",
    "^save%.lua$", "^save_.*%.lua$", "%.env$", "%.pem$", "id_rsa",
  }
  local offenders = {}
  for _, path in ipairs(files) do
    for _, pattern in ipairs(FORBIDDEN) do
      if path:match(pattern) then offenders[#offenders + 1] = path end
    end
  end
  eq(#offenders, 0, "the artifact ships no ROM, save, or extracted cache",
    table.concat(offenders, ", "))
  ok(#files > 100, ("the artifact has content (%d files)"):format(#files))
end

-- ---------------------------------------------------------------------------
print("")
print(("passed %d  failed %d  skipped %d"):format(passed, failed, skipped))
if failed > 0 then
  print("")
  for _, f in ipairs(failures) do print("  FAILED: " .. f) end
  os.exit(1)
end
print("OK")

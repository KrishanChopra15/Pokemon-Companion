"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const PokemonSourceResolverService =
    require("../scripts/services/pokemon-source-resolver-service");


function createService(encounters = [], evolution = null) {
    return new PokemonSourceResolverService(encounters, evolution);
}

function encounter(species, overrides = {}) {
    return {
        method: "land_mons",
        map: "ROUTE_1",
        mons: [{ species }],
        ...overrides
    };
}


// -----------------------------------------------
// Constructor
// -----------------------------------------------

test("constructor creates a PokemonSourceResolverService instance", () => {
    assert.ok(
        createService() instanceof PokemonSourceResolverService
    );
});

test("constructor defaults encounters to an empty array", () => {
    const service = createService();

    assert.deepEqual(service.encounters, []);
});

test("constructor defaults evolution service to null", () => {
    const service = createService();

    assert.equal(service.evolution, null);
});

test("constructor stores an encounter database array", () => {
    const encounters = [encounter("PIKACHU")];
    const service = createService(encounters);

    assert.equal(service.encounters, encounters);
});

test("constructor preserves the original encounter database reference", () => {
    const encounters = [];
    const service = createService(encounters);

    assert.equal(service.encounters, encounters);
});

test("constructor replaces a non-array encounter database with an empty array", () => {
    const service = createService({ encounters: [] });

    assert.deepEqual(service.encounters, []);
});

test("constructor replaces null encounter data with an empty array", () => {
    const service = new PokemonSourceResolverService(null);

    assert.deepEqual(service.encounters, []);
});

test("constructor replaces undefined encounter data with an empty array", () => {
    const service = new PokemonSourceResolverService(undefined);

    assert.deepEqual(service.encounters, []);
});

test("constructor stores the injected evolution service", () => {
    const evolution = {
        getEvolutionSource() {
            return null;
        }
    };

    const service = createService([], evolution);

    assert.equal(service.evolution, evolution);
});


// -----------------------------------------------
// resolve
// -----------------------------------------------

test("resolve returns the species passed by the caller", () => {
    const service = createService();

    assert.equal(
        service.resolve("Bulbasaur").species,
        "Bulbasaur"
    );
});

test("resolve returns a sources array", () => {
    const service = createService();

    assert.ok(Array.isArray(service.resolve("PIKACHU").sources));
});

test("resolve includes a generic trade source for any species", () => {
    const service = createService();

    assert.deepEqual(
        service.resolve("MISSINGNO").sources,
        [
            {
                method: "TRADE",
                available: true
            }
        ]
    );
});

test("resolve includes sources in wild, evolution, starter, trade order", () => {
    const evolution = {
        getEvolutionSource() {
            return {
                from: "IVYSAUR",
                requirement: "LEVEL_32"
            };
        }
    };

    const service = createService(
        [encounter("BULBASAUR")],
        evolution
    );

    const result = service.resolve("BULBASAUR");

    assert.deepEqual(
        result.sources.map(source => source.method),
        ["land_mons", "EVOLUTION", "STARTER", "TRADE"]
    );
});

test("resolve includes multiple wild encounters before other source types", () => {
    const service = createService([
        encounter("PIKACHU", { map: "ROUTE_1" }),
        encounter("PIKACHU", { map: "POWER_PLANT" })
    ]);

    const result = service.resolve("PIKACHU");

    assert.deepEqual(
        result.sources.map(source => source.location),
        ["ROUTE_1", "POWER_PLANT", undefined]
    );

    assert.deepEqual(
        result.sources.map(source => source.method),
        ["land_mons", "land_mons", "TRADE"]
    );
});

test("resolve leaves the supplied encounter database unchanged", () => {
    const encounters = [encounter("PIKACHU")];
    const snapshot = structuredClone(encounters);
    const service = createService(encounters);

    service.resolve("PIKACHU");

    assert.deepEqual(encounters, snapshot);
});

test("resolve returns a new combined sources array on each call", () => {
    const service = createService();

    const first = service.resolve("PIKACHU");
    const second = service.resolve("PIKACHU");

    assert.notEqual(first.sources, second.sources);
    assert.deepEqual(first.sources, second.sources);
});


// -----------------------------------------------
// getWildSources: matching
// -----------------------------------------------

test("getWildSources finds a species in an encounter", () => {
    const service = createService([
        encounter("BULBASAUR")
    ]);

    assert.equal(
        service.getWildSources("BULBASAUR").length,
        1
    );
});

test("getWildSources normalizes lowercase species input", () => {
    const service = createService([
        encounter("BULBASAUR")
    ]);

    assert.equal(
        service.getWildSources("bulbasaur").length,
        1
    );
});

test("getWildSources normalizes mixed-case species input", () => {
    const service = createService([
        encounter("BULBASAUR")
    ]);

    assert.equal(
        service.getWildSources("BulBaSaur").length,
        1
    );
});

test("getWildSources matches a SPECIES_ constant", () => {
    const service = createService([
        encounter("SPECIES_BULBASAUR")
    ]);

    assert.equal(
        service.getWildSources("SPECIES_BULBASAUR").length,
        1
    );
});

test("getWildSources returns no matches when a species object is passed directly", () => {
    const service = createService([
        encounter("BULBASAUR")
    ]);

    assert.deepEqual(
        service.getWildSources({ name: "Bulbasaur" }),
        []
    );
});

test("getWildSources does not extract the constant from a species object argument", () => {
    const service = createService([
        encounter("SPECIES_BULBASAUR")
    ]);

    assert.deepEqual(
        service.getWildSources({
            constant: "SPECIES_BULBASAUR"
        }),
        []
    );
});

test("getWildSources does not extract name or constant from a species object argument", () => {
    const service = createService([
        encounter("BULBASAUR"),
        encounter("SQUIRTLE")
    ]);

    assert.deepEqual(
        service.getWildSources({
            name: "Bulbasaur",
            constant: "SPECIES_SQUIRTLE"
        }),
        []
    );
});

test("getWildSources does not match a different species", () => {
    const service = createService([
        encounter("BULBASAUR")
    ]);

    assert.deepEqual(
        service.getWildSources("SQUIRTLE"),
        []
    );
});

test("getWildSources returns an empty array when no encounter database exists", () => {
    const service = createService();

    assert.deepEqual(
        service.getWildSources("PIKACHU"),
        []
    );
});

test("getWildSources returns every matching encounter slot", () => {
    const service = createService([
        {
            method: "land_mons",
            map: "ROUTE_1",
            mons: [
                { species: "PIKACHU", slotIndex: 0 },
                { species: "SQUIRTLE", slotIndex: 1 },
                { species: "PIKACHU", slotIndex: 2 }
            ]
        }
    ]);

    const result = service.getWildSources("PIKACHU");

    assert.equal(result.length, 2);
    assert.deepEqual(
        result.map(source => source.slotIndex),
        [0, 2]
    );
});

test("getWildSources searches across multiple encounter records", () => {
    const service = createService([
        encounter("PIKACHU", { map: "ROUTE_1" }),
        encounter("SQUIRTLE", { map: "ROUTE_2" }),
        encounter("PIKACHU", { map: "POWER_PLANT" })
    ]);

    const result = service.getWildSources("PIKACHU");

    assert.equal(result.length, 2);
    assert.deepEqual(
        result.map(source => source.location),
        ["ROUTE_1", "POWER_PLANT"]
    );
});

test("getWildSources skips null encounter records", () => {
    const service = createService([
        null,
        encounter("PIKACHU")
    ]);

    assert.equal(
        service.getWildSources("PIKACHU").length,
        1
    );
});

test("getWildSources skips encounter records without a mons array", () => {
    const service = createService([
        { method: "land_mons", map: "ROUTE_1" },
        { method: "land_mons", mons: "PIKACHU" },
        encounter("PIKACHU")
    ]);

    assert.equal(
        service.getWildSources("PIKACHU").length,
        1
    );
});

test("getWildSources safely skips null Pokémon entries", () => {
    const service = createService([
        {
            method: "land_mons",
            map: "ROUTE_1",
            mons: [
                null,
                { species: "PIKACHU" }
            ]
        }
    ]);

    assert.equal(
        service.getWildSources("PIKACHU").length,
        1
    );
});

test("getWildSources ignores entries for other species", () => {
    const service = createService([
        {
            method: "land_mons",
            mons: [
                { species: "BULBASAUR" },
                { species: "SQUIRTLE" },
                { species: "CHARMANDER" }
            ]
        }
    ]);

    assert.deepEqual(
        service.getWildSources("PIKACHU"),
        []
    );
});


// -----------------------------------------------
// getWildSources: returned fields
// -----------------------------------------------

test("getWildSources uses encounter method", () => {
    const service = createService([
        encounter("PIKACHU", { method: "water_mons" })
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].method,
        "water_mons"
    );
});

test("getWildSources defaults the method to WILD when it is missing", () => {
    const service = createService([
        {
            map: "ROUTE_1",
            mons: [{ species: "PIKACHU" }]
        }
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].method,
        "WILD"
    );
});

test("getWildSources prefers the encounter displayMethod", () => {
    const service = createService([
        encounter("PIKACHU", {
            method: "land_mons",
            displayMethod: "Tall Grass"
        })
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].displayMethod,
        "Tall Grass"
    );
});

test("getWildSources maps land_mons to Grass", () => {
    const service = createService([
        encounter("PIKACHU", { method: "land_mons" })
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].displayMethod,
        "Grass"
    );
});

test("getWildSources maps water_mons to Surf", () => {
    const service = createService([
        encounter("PIKACHU", { method: "water_mons" })
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].displayMethod,
        "Surf"
    );
});

test("getWildSources maps fishing_mons to Fishing", () => {
    const service = createService([
        encounter("MAGIKARP", { method: "fishing_mons" })
    ]);

    assert.equal(
        service.getWildSources("MAGIKARP")[0].displayMethod,
        "Fishing"
    );
});

test("getWildSources maps rock_smash_mons to Rock Smash", () => {
    const service = createService([
        encounter("GEODUDE", { method: "rock_smash_mons" })
    ]);

    assert.equal(
        service.getWildSources("GEODUDE")[0].displayMethod,
        "Rock Smash"
    );
});

test("getWildSources preserves unknown encounter methods for display", () => {
    const service = createService([
        encounter("PIKACHU", { method: "special_mons" })
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].displayMethod,
        "special_mons"
    );
});

test("getWildSources defaults display to Wild when method is missing", () => {
    const service = createService([
        {
            map: "ROUTE_1",
            mons: [{ species: "PIKACHU" }]
        }
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].displayMethod,
        "Wild"
    );
});

test("getWildSources prefers map over location", () => {
    const service = createService([
        encounter("PIKACHU", {
            map: "ROUTE_1",
            location: "VIRIDIAN_FOREST"
        })
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].location,
        "ROUTE_1"
    );
});

test("getWildSources falls back to location when map is missing", () => {
    const service = createService([
        {
            method: "land_mons",
            location: "VIRIDIAN_FOREST",
            mons: [{ species: "PIKACHU" }]
        }
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].location,
        "VIRIDIAN_FOREST"
    );
});

test("getWildSources defaults location to null when map and location are missing", () => {
    const service = createService([
        {
            method: "land_mons",
            mons: [{ species: "PIKACHU" }]
        }
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].location,
        null
    );
});

test("getWildSources defaults baseLabel to null", () => {
    const service = createService([
        encounter("PIKACHU")
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].baseLabel,
        null
    );
});

test("getWildSources preserves baseLabel", () => {
    const service = createService([
        encounter("PIKACHU", { baseLabel: "Tall grass" })
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].baseLabel,
        "Tall grass"
    );
});

test("getWildSources defaults encounterRate to null", () => {
    const service = createService([
        encounter("PIKACHU")
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].encounterRate,
        null
    );
});

test("getWildSources preserves encounterRate zero", () => {
    const service = createService([
        encounter("PIKACHU", { encounterRate: 0 })
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].encounterRate,
        0
    );
});

test("getWildSources defaults slotIndex to null", () => {
    const service = createService([
        encounter("PIKACHU")
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].slotIndex,
        null
    );
});

test("getWildSources preserves slotIndex zero", () => {
    const service = createService([
        {
            method: "land_mons",
            mons: [{ species: "PIKACHU", slotIndex: 0 }]
        }
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].slotIndex,
        0
    );
});

test("getWildSources defaults slotEncounterRate to null", () => {
    const service = createService([
        encounter("PIKACHU")
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].slotEncounterRate,
        null
    );
});

test("getWildSources preserves slotEncounterRate zero", () => {
    const service = createService([
        {
            method: "land_mons",
            mons: [{
                species: "PIKACHU",
                slotEncounterRate: 0
            }]
        }
    ]);

    assert.equal(
        service.getWildSources("PIKACHU")[0].slotEncounterRate,
        0
    );
});

test("getWildSources defaults minLevel and maxLevel to null", () => {
    const service = createService([
        encounter("PIKACHU")
    ]);

    const result = service.getWildSources("PIKACHU")[0];

    assert.equal(result.minLevel, null);
    assert.equal(result.maxLevel, null);
});

test("getWildSources preserves minLevel and maxLevel", () => {
    const service = createService([
        {
            method: "land_mons",
            mons: [{
                species: "PIKACHU",
                minLevel: 3,
                maxLevel: 7
            }]
        }
    ]);

    const result = service.getWildSources("PIKACHU")[0];

    assert.equal(result.minLevel, 3);
    assert.equal(result.maxLevel, 7);
});

test("getWildSources preserves zero level values", () => {
    const service = createService([
        {
            method: "land_mons",
            mons: [{
                species: "PIKACHU",
                minLevel: 0,
                maxLevel: 0
            }]
        }
    ]);

    const result = service.getWildSources("PIKACHU")[0];

    assert.equal(result.minLevel, 0);
    assert.equal(result.maxLevel, 0);
});

test("getWildSources returns all expected fields", () => {
    const service = createService([
        encounter("PIKACHU")
    ]);

    assert.deepEqual(
        Object.keys(service.getWildSources("PIKACHU")[0]).sort(),
        [
            "method",
            "displayMethod",
            "location",
            "baseLabel",
            "encounterRate",
            "slotIndex",
            "slotEncounterRate",
            "rod",
            "minLevel",
            "maxLevel"
        ].sort()
    );
});


// -----------------------------------------------
// Evolution sources
// -----------------------------------------------

test("getEvolutionSources returns an empty array without an evolution service", () => {
    const service = createService();

    assert.deepEqual(
        service.getEvolutionSources("CHARIZARD"),
        []
    );
});

test("getEvolutionSources calls getEvolutionSource with a normalized constant", () => {
    const calls = [];
    const evolution = {
        getEvolutionSource(species) {
            calls.push(species);
            return null;
        }
    };

    const service = createService([], evolution);

    service.getEvolutionSources("charizard");

    assert.deepEqual(calls, ["SPECIES_CHARIZARD"]);
});

test("getEvolutionSources preserves an existing SPECIES_ constant", () => {
    const calls = [];
    const evolution = {
        getEvolutionSource(species) {
            calls.push(species);
            return null;
        }
    };

    const service = createService([], evolution);

    service.getEvolutionSources("SPECIES_CHARIZARD");

    assert.deepEqual(calls, ["SPECIES_CHARIZARD"]);
});

test("getEvolutionSources returns empty when the evolution service returns null", () => {
    const service = createService([], {
        getEvolutionSource() {
            return null;
        }
    });

    assert.deepEqual(
        service.getEvolutionSources("CHARIZARD"),
        []
    );
});

test("getEvolutionSources returns empty when the evolution service returns undefined", () => {
    const service = createService([], {
        getEvolutionSource() {
            return undefined;
        }
    });

    assert.deepEqual(
        service.getEvolutionSources("CHARIZARD"),
        []
    );
});

test("getEvolutionSources returns the EVOLUTION method", () => {
    const service = createService([], {
        getEvolutionSource() {
            return {
                from: "CHARMELEON",
                requirement: "LEVEL_36"
            };
        }
    });

    assert.equal(
        service.getEvolutionSources("CHARIZARD")[0].method,
        "EVOLUTION"
    );
});

test("getEvolutionSources preserves the previous species", () => {
    const service = createService([], {
        getEvolutionSource() {
            return {
                from: "CHARMELEON",
                requirement: "LEVEL_36"
            };
        }
    });

    assert.equal(
        service.getEvolutionSources("CHARIZARD")[0].from,
        "CHARMELEON"
    );
});

test("getEvolutionSources preserves the evolution requirement", () => {
    const requirement = {
        level: 36,
        type: "LEVEL"
    };

    const service = createService([], {
        getEvolutionSource() {
            return {
                from: "CHARMELEON",
                requirement
            };
        }
    });

    assert.equal(
        service.getEvolutionSources("CHARIZARD")[0].requirement,
        requirement
    );
});

test("getEvolutionSources returns one source for an evolution result", () => {
    const service = createService([], {
        getEvolutionSource() {
            return {
                from: "CHARMELEON",
                requirement: "LEVEL_36"
            };
        }
    });

    assert.equal(
        service.getEvolutionSources("CHARIZARD").length,
        1
    );
});

test("getEvolutionSources retains undefined fields when not supplied", () => {
    const service = createService([], {
        getEvolutionSource() {
            return {};
        }
    });

    assert.deepEqual(
        service.getEvolutionSources("CHARIZARD"),
        [{
            method: "EVOLUTION",
            from: undefined,
            requirement: undefined
        }]
    );
});


// -----------------------------------------------
// Starter sources
// -----------------------------------------------

for (const starter of ["BULBASAUR", "CHARMANDER", "SQUIRTLE"]) {
    test(`getStarterSources recognizes ${starter}`, () => {
        const service = createService();

        assert.deepEqual(
            service.getStarterSources(starter),
            [{ method: "STARTER" }]
        );
    });
}

test("getStarterSources normalizes lowercase species", () => {
    const service = createService();

    assert.deepEqual(
        service.getStarterSources("bulbasaur"),
        [{ method: "STARTER" }]
    );
});

test("getStarterSources recognizes a SPECIES_ constant", () => {
    const service = createService();

    assert.deepEqual(
        service.getStarterSources("SPECIES_SQUIRTLE"),
        [{ method: "STARTER" }]
    );
});

test("getStarterSources does not recognize non-starter species", () => {
    const service = createService();

    assert.deepEqual(
        service.getStarterSources("PIKACHU"),
        []
    );
});

test("getStarterSources does not return duplicates", () => {
    const service = createService();

    assert.equal(
        service.getStarterSources("CHARMANDER").length,
        1
    );
});


// -----------------------------------------------
// Trade sources
// -----------------------------------------------

test("getTradeSources returns one generic trade source", () => {
    const service = createService();

    assert.deepEqual(
        service.getTradeSources("PIKACHU"),
        [{
            method: "TRADE",
            available: true
        }]
    );
});

test("getTradeSources returns a source for an unknown species", () => {
    const service = createService();

    assert.deepEqual(
        service.getTradeSources("MISSINGNO"),
        [{
            method: "TRADE",
            available: true
        }]
    );
});

test("getTradeSources does not require an evolution service", () => {
    const service = createService();

    assert.equal(
        service.getTradeSources("CHARIZARD").length,
        1
    );
});

test("getTradeSources returns a fresh array on each call", () => {
    const service = createService();

    const first = service.getTradeSources("PIKACHU");
    const second = service.getTradeSources("PIKACHU");

    assert.notEqual(first, second);
    assert.deepEqual(first, second);
});


// -----------------------------------------------
// getSpeciesValue
// -----------------------------------------------

test("getSpeciesValue returns a primitive species string", () => {
    const service = createService();

    assert.equal(
        service.getSpeciesValue("PIKACHU"),
        "PIKACHU"
    );
});

test("getSpeciesValue returns an object's name", () => {
    const service = createService();

    assert.equal(
        service.getSpeciesValue({ name: "Pikachu" }),
        "Pikachu"
    );
});

test("getSpeciesValue falls back to an object's constant", () => {
    const service = createService();

    assert.equal(
        service.getSpeciesValue({
            constant: "SPECIES_PIKACHU"
        }),
        "SPECIES_PIKACHU"
    );
});

test("getSpeciesValue prefers name over constant", () => {
    const service = createService();

    assert.equal(
        service.getSpeciesValue({
            name: "Pikachu",
            constant: "SPECIES_SQUIRTLE"
        }),
        "Pikachu"
    );
});

test("getSpeciesValue returns null for an object with neither name nor constant", () => {
    const service = createService();

    assert.equal(
        service.getSpeciesValue({ id: 25 }),
        null
    );
});

test("getSpeciesValue returns null for null", () => {
    const service = createService();

    assert.equal(service.getSpeciesValue(null), null);
});

test("getSpeciesValue returns null for undefined", () => {
    const service = createService();

    assert.equal(service.getSpeciesValue(undefined), null);
});

test("getSpeciesValue returns null for an empty string", () => {
    const service = createService();

    assert.equal(service.getSpeciesValue(""), null);
});

test("getSpeciesValue returns null for numeric zero", () => {
    const service = createService();

    assert.equal(service.getSpeciesValue(0), null);
});

test("getSpeciesValue preserves a nonzero number", () => {
    const service = createService();

    assert.equal(service.getSpeciesValue(25), 25);
});


// -----------------------------------------------
// normalizeSpecies
// -----------------------------------------------

test("normalizeSpecies uppercases lowercase names", () => {
    const service = createService();

    assert.equal(
        service.normalizeSpecies("pikachu"),
        "PIKACHU"
    );
});

test("normalizeSpecies uppercases mixed-case names", () => {
    const service = createService();

    assert.equal(
        service.normalizeSpecies("PiKaChU"),
        "PIKACHU"
    );
});

test("normalizeSpecies removes an uppercase SPECIES_ prefix", () => {
    const service = createService();

    assert.equal(
        service.normalizeSpecies("SPECIES_PIKACHU"),
        "PIKACHU"
    );
});

test("normalizeSpecies preserves an already normalized species name", () => {
    const service = createService();

    assert.equal(
        service.normalizeSpecies("PIKACHU"),
        "PIKACHU"
    );
});

test("normalizeSpecies returns null for missing species", () => {
    const service = createService();

    assert.equal(service.normalizeSpecies(null), null);
    assert.equal(service.normalizeSpecies(undefined), null);
});

test("normalizeSpecies returns null for an empty string", () => {
    const service = createService();

    assert.equal(service.normalizeSpecies(""), null);
});

test("normalizeSpecies converts a number to an uppercase string", () => {
    const service = createService();

    assert.equal(service.normalizeSpecies(25), "25");
});

test("normalizeSpecies only removes the uppercase SPECIES_ prefix", () => {
    const service = createService();

    assert.equal(
        service.normalizeSpecies("species_pikachu"),
        "SPECIES_PIKACHU"
    );
});


// -----------------------------------------------
// getDisplayMethod
// -----------------------------------------------

test("getDisplayMethod maps land_mons to Grass", () => {
    const service = createService();

    assert.equal(service.getDisplayMethod("land_mons"), "Grass");
});

test("getDisplayMethod maps water_mons to Surf", () => {
    const service = createService();

    assert.equal(service.getDisplayMethod("water_mons"), "Surf");
});

test("getDisplayMethod maps fishing_mons to Fishing", () => {
    const service = createService();

    assert.equal(service.getDisplayMethod("fishing_mons"), "Fishing");
});

test("getDisplayMethod maps rock_smash_mons to Rock Smash", () => {
    const service = createService();

    assert.equal(
        service.getDisplayMethod("rock_smash_mons"),
        "Rock Smash"
    );
});

test("getDisplayMethod returns an unknown method unchanged", () => {
    const service = createService();

    assert.equal(
        service.getDisplayMethod("special_mons"),
        "special_mons"
    );
});

test("getDisplayMethod returns Wild when method is missing", () => {
    const service = createService();

    assert.equal(service.getDisplayMethod(undefined), "Wild");
});

test("getDisplayMethod returns Wild for null", () => {
    const service = createService();

    assert.equal(service.getDisplayMethod(null), "Wild");
});

test("getDisplayMethod uses exact method matching", () => {
    const service = createService();

    assert.equal(
        service.getDisplayMethod("LAND_MONS"),
        "LAND_MONS"
    );
});


// -----------------------------------------------
// getRodForSlot
// -----------------------------------------------

test("getRodForSlot returns null for non-fishing encounters", () => {
    const service = createService();

    assert.equal(
        service.getRodForSlot({
            method: "land_mons",
            rodGroups: { Good_Rod: [1] }
        }, 1),
        null
    );
});

test("getRodForSlot returns null when the encounter is missing", () => {
    const service = createService();

    assert.equal(service.getRodForSlot(null, 1), null);
});

test("getRodForSlot returns null when rodGroups is missing", () => {
    const service = createService();

    assert.equal(
        service.getRodForSlot({
            method: "fishing_mons"
        }, 1),
        null
    );
});

test("getRodForSlot returns null when slotIndex is null", () => {
    const service = createService();

    assert.equal(
        service.getRodForSlot({
            method: "fishing_mons",
            rodGroups: { Good_Rod: [1] }
        }, null),
        null
    );
});

test("getRodForSlot returns null when slotIndex is undefined", () => {
    const service = createService();

    assert.equal(
        service.getRodForSlot({
            method: "fishing_mons",
            rodGroups: { Good_Rod: [1] }
        }, undefined),
        null
    );
});

test("getRodForSlot identifies the Old Rod group", () => {
    const service = createService();

    assert.equal(
        service.getRodForSlot({
            method: "fishing_mons",
            rodGroups: {
                Old_Rod: [0, 1],
                Good_Rod: [2, 3]
            }
        }, 0),
        "Old_Rod"
    );
});

test("getRodForSlot identifies the Good Rod group", () => {
    const service = createService();

    assert.equal(
        service.getRodForSlot({
            method: "fishing_mons",
            rodGroups: {
                Old_Rod: [0, 1],
                Good_Rod: [2, 3]
            }
        }, 2),
        "Good_Rod"
    );
});

test("getRodForSlot identifies the Super Rod group", () => {
    const service = createService();

    assert.equal(
        service.getRodForSlot({
            method: "fishing_mons",
            rodGroups: {
                Super_Rod: [5, 6]
            }
        }, 6),
        "Super_Rod"
    );
});

test("getRodForSlot returns null when no group includes the slot", () => {
    const service = createService();

    assert.equal(
        service.getRodForSlot({
            method: "fishing_mons",
            rodGroups: {
                Old_Rod: [0, 1],
                Good_Rod: [2, 3]
            }
        }, 4),
        null
    );
});

test("getRodForSlot skips a rod group when its slots are not an array", () => {
    const service = createService();

    assert.equal(
        service.getRodForSlot({
            method: "fishing_mons",
            rodGroups: {
                Old_Rod: "0,1",
                Good_Rod: [2, 3]
            }
        }, 0),
        null
    );
});

test("getRodForSlot uses exact method matching", () => {
    const service = createService();

    assert.equal(
        service.getRodForSlot({
            method: "FISHING_MONS",
            rodGroups: { Old_Rod: [0] }
        }, 0),
        null
    );
});

test("getWildSources attaches the rod based on the encounter slot", () => {
    const service = createService([
        {
            method: "fishing_mons",
            map: "ROUTE_12",
            rodGroups: {
                Old_Rod: [0, 1],
                Good_Rod: [2, 3]
            },
            mons: [
                { species: "MAGIKARP", slotIndex: 0 },
                { species: "GYARADOS", slotIndex: 2 }
            ]
        }
    ]);

    const magikarp = service.getWildSources("MAGIKARP")[0];
    const gyarados = service.getWildSources("GYARADOS")[0];

    assert.equal(magikarp.rod, "Old_Rod");
    assert.equal(gyarados.rod, "Good_Rod");
});


// -----------------------------------------------
// normalizeConstant
// -----------------------------------------------

test("normalizeConstant prefixes a plain species name", () => {
    const service = createService();

    assert.equal(
        service.normalizeConstant("Pikachu"),
        "SPECIES_PIKACHU"
    );
});

test("normalizeConstant converts lowercase species names to uppercase", () => {
    const service = createService();

    assert.equal(
        service.normalizeConstant("bulbasaur"),
        "SPECIES_BULBASAUR"
    );
});

test("normalizeConstant preserves an existing SPECIES_ prefix", () => {
    const service = createService();

    assert.equal(
        service.normalizeConstant("SPECIES_BULBASAUR"),
        "SPECIES_BULBASAUR"
    );
});

test("normalizeConstant preserves an existing uppercase prefix as written", () => {
    const service = createService();

    assert.equal(
        service.normalizeConstant("SPECIES_bulbasaur"),
        "SPECIES_bulbasaur"
    );
});

test("normalizeConstant returns null for null", () => {
    const service = createService();

    assert.equal(service.normalizeConstant(null), null);
});

test("normalizeConstant returns null for undefined", () => {
    const service = createService();

    assert.equal(service.normalizeConstant(undefined), null);
});

test("normalizeConstant returns null for an empty string", () => {
    const service = createService();

    assert.equal(service.normalizeConstant(""), null);
});

test("normalizeConstant stringifies non-string values", () => {
    const service = createService();

    assert.equal(
        service.normalizeConstant(25),
        "SPECIES_25"
    );
});


// -----------------------------------------------
// explain
// -----------------------------------------------

test("explain returns the supplied Pokémon value", () => {
    const service = createService();

    assert.equal(service.explain("PIKACHU").pokemon, "PIKACHU");
});

test("explain reports the number of resolved sources", () => {
    const service = createService();

    const result = service.explain("PIKACHU");

    assert.equal(result.methods, result.sources.length);
});

test("explain includes wild and trade sources when an encounter is available", () => {
    const service = createService([
        encounter("PIKACHU")
    ]);

    const result = service.explain("PIKACHU");

    assert.equal(result.methods, 2);
    assert.deepEqual(
        result.sources.map(source => source.method),
        ["land_mons", "TRADE"]
    );
});

test("explain includes a starter source for Bulbasaur", () => {
    const service = createService();

    const result = service.explain("BULBASAUR");

    assert.ok(
        result.sources.some(source => source.method === "STARTER")
    );
});

test("explain includes an evolution source when the evolution service provides one", () => {
    const service = createService([], {
        getEvolutionSource() {
            return {
                from: "CHARMELEON",
                requirement: "LEVEL_36"
            };
        }
    });

    const result = service.explain("CHARIZARD");

    assert.ok(
        result.sources.some(source => source.method === "EVOLUTION")
    );
});

test("explain always includes the generic trade source", () => {
    const service = createService();

    const result = service.explain("MISSINGNO");

    assert.ok(
        result.sources.some(source =>
            source.method === "TRADE" && source.available === true
        )
    );
});

test("explain returns the resolved sources array", () => {
    const service = createService([
        encounter("PIKACHU")
    ]);

    const result = service.explain("PIKACHU");

    assert.deepEqual(
        result.sources,
        service.resolve("PIKACHU").sources
    );
});

test("explain returns exactly pokemon, methods and sources", () => {
    const service = createService();

    assert.deepEqual(
        Object.keys(service.explain("PIKACHU")).sort(),
        ["pokemon", "methods", "sources"].sort()
    );
});


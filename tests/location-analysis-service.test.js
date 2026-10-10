"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const LocationAnalysisService = require("../scripts/services/location-analysis-service");

// --------------------------------------------------
// Fixtures and mock database
// --------------------------------------------------

function createLocationDatabase(locationPokemon = {}, pokemonLocations = {}) {
    const calls = {
        getPokemonInLocation: [],
        getPokemonLocations: []
    };

    return {
        calls,

        getPokemonInLocation(location) {
            calls.getPokemonInLocation.push(location);

            return Object.prototype.hasOwnProperty.call(
                locationPokemon,
                location
            )
                ? locationPokemon[location]
                : [];
        },

        getPokemonLocations(pokemon) {
            calls.getPokemonLocations.push(pokemon);

            return Object.prototype.hasOwnProperty.call(
                pokemonLocations,
                pokemon
            )
                ? pokemonLocations[pokemon]
                : [];
        }
    };
}

function createEnvironment(options = {}) {
    const locationPokemon = options.locationPokemon || {
        PALLET_TOWN: ["Pikachu", "Pidgey", "Rattata"],
        ROUTE_1: ["Pidgey", "Rattata", "Rattata"],
        VIRIDIAN_FOREST: ["Caterpie", "Pikachu", "Weedle"],
        PEWTER_CITY: ["Geodude", "Pikachu"],
        CERULEAN_CITY: ["Psyduck", "Oddish", "Pikachu"]
    };

    const pokemonLocations = options.pokemonLocations || {
        Pikachu: ["VIRIDIAN_FOREST", "POWER_PLANT"],
        Pidgey: ["PALLET_TOWN", "ROUTE_1"],
        Bulbasaur: ["PALLET_TOWN"]
    };

    const locationDatabase = createLocationDatabase(
        locationPokemon,
        pokemonLocations
    );

    return {
        locationDatabase,
        service: new LocationAnalysisService(locationDatabase)
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a LocationAnalysisService instance", () => {
    const { service } = createEnvironment();

    assert.ok(service instanceof LocationAnalysisService);
});

test("constructor stores the supplied location database", () => {
    const { service, locationDatabase } = createEnvironment();

    assert.strictEqual(
        service.locationDatabase,
        locationDatabase
    );
});

test("constructor accepts a custom database object", () => {
    const database = {
        getPokemonInLocation() {
            return [];
        },
        getPokemonLocations() {
            return [];
        }
    };

    const service = new LocationAnalysisService(database);

    assert.strictEqual(service.locationDatabase, database);
});

// --------------------------------------------------
// getPokemonAvailableInLocations
// --------------------------------------------------

test("getPokemonAvailableInLocations returns an array", () => {
    const { service } = createEnvironment();

    assert.ok(
        Array.isArray(
            service.getPokemonAvailableInLocations(["PALLET_TOWN"])
        )
    );
});

test("getPokemonAvailableInLocations returns Pokémon from one location", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getPokemonAvailableInLocations(["PALLET_TOWN"]),
        ["Pikachu", "Pidgey", "Rattata"]
    );
});

test("getPokemonAvailableInLocations combines Pokémon from multiple locations", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getPokemonAvailableInLocations([
            "PALLET_TOWN",
            "VIRIDIAN_FOREST"
        ]),
        [
            "Pikachu",
            "Pidgey",
            "Rattata",
            "Caterpie",
            "Weedle"
        ]
    );
});

test("getPokemonAvailableInLocations removes duplicates within a location", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            ROUTE_1: ["Pidgey", "Pidgey", "Rattata", "Pidgey"]
        }
    });

    assert.deepEqual(
        service.getPokemonAvailableInLocations(["ROUTE_1"]),
        ["Pidgey", "Rattata"]
    );
});

test("getPokemonAvailableInLocations removes duplicates across locations", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getPokemonAvailableInLocations([
            "PALLET_TOWN",
            "ROUTE_1",
            "VIRIDIAN_FOREST"
        ]),
        [
            "Pikachu",
            "Pidgey",
            "Rattata",
            "Caterpie",
            "Weedle"
        ]
    );
});

test("getPokemonAvailableInLocations preserves first-seen order", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            AREA_A: ["Eevee", "Pikachu"],
            AREA_B: ["Pikachu", "Bulbasaur"],
            AREA_C: ["Bulbasaur", "Squirtle"]
        }
    });

    assert.deepEqual(
        service.getPokemonAvailableInLocations([
            "AREA_A",
            "AREA_B",
            "AREA_C"
        ]),
        ["Eevee", "Pikachu", "Bulbasaur", "Squirtle"]
    );
});

test("getPokemonAvailableInLocations returns an empty array for no locations", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getPokemonAvailableInLocations([]),
        []
    );
});

test("getPokemonAvailableInLocations returns an empty array when locations have no Pokémon", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            AREA_A: [],
            AREA_B: []
        }
    });

    assert.deepEqual(
        service.getPokemonAvailableInLocations([
            "AREA_A",
            "AREA_B"
        ]),
        []
    );
});

test("getPokemonAvailableInLocations handles a location with no database entry", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getPokemonAvailableInLocations(["UNKNOWN_AREA"]),
        []
    );
});

test("getPokemonAvailableInLocations queries each supplied location", () => {
    const { service, locationDatabase } = createEnvironment();

    service.getPokemonAvailableInLocations([
        "PALLET_TOWN",
        "ROUTE_1",
        "PEWTER_CITY"
    ]);

    assert.deepEqual(
        locationDatabase.calls.getPokemonInLocation,
        ["PALLET_TOWN", "ROUTE_1", "PEWTER_CITY"]
    );
});

test("getPokemonAvailableInLocations queries repeated locations each time", () => {
    const { service, locationDatabase } = createEnvironment();

    service.getPokemonAvailableInLocations([
        "PALLET_TOWN",
        "PALLET_TOWN"
    ]);

    assert.deepEqual(
        locationDatabase.calls.getPokemonInLocation,
        ["PALLET_TOWN", "PALLET_TOWN"]
    );
});

test("getPokemonAvailableInLocations returns unique values using Set equality", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            AREA_A: ["Pikachu", "pikachu", "PIKACHU"],
            AREA_B: []
        }
    });

    assert.deepEqual(
        service.getPokemonAvailableInLocations([
            "AREA_A",
            "AREA_B"
        ]),
        ["Pikachu", "pikachu", "PIKACHU"]
    );
});

test("getPokemonAvailableInLocations handles numeric entries using Set equality", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            AREA_A: [1, 2, 1],
            AREA_B: [2, 3]
        }
    });

    assert.deepEqual(
        service.getPokemonAvailableInLocations([
            "AREA_A",
            "AREA_B"
        ]),
        [1, 2, 3]
    );
});

test("getPokemonAvailableInLocations returns a new array on each call", () => {
    const { service } = createEnvironment();

    const first = service.getPokemonAvailableInLocations(["PALLET_TOWN"]);
    const second = service.getPokemonAvailableInLocations(["PALLET_TOWN"]);

    assert.notStrictEqual(first, second);
    assert.deepEqual(first, second);
});

test("getPokemonAvailableInLocations does not mutate database encounter arrays", () => {
    const encounters = ["Pikachu", "Pidgey", "Pikachu"];

    const { service } = createEnvironment({
        locationPokemon: {
            AREA_A: encounters
        }
    });

    service.getPokemonAvailableInLocations(["AREA_A"]);

    assert.deepEqual(
        encounters,
        ["Pikachu", "Pidgey", "Pikachu"]
    );
});

test("getPokemonAvailableInLocations propagates database errors", () => {
    const database = {
        getPokemonInLocation() {
            throw new Error("Encounter lookup failed");
        },
        getPokemonLocations() {
            return [];
        }
    };

    const service = new LocationAnalysisService(database);

    assert.throws(
        () => service.getPokemonAvailableInLocations(["PALLET_TOWN"]),
        /Encounter lookup failed/
    );
});

test("getPokemonAvailableInLocations propagates errors from a non-iterable encounter result", () => {
    const database = {
        getPokemonInLocation() {
            return null;
        },
        getPokemonLocations() {
            return [];
        }
    };

    const service = new LocationAnalysisService(database);

    assert.throws(
        () => service.getPokemonAvailableInLocations(["PALLET_TOWN"]),
        TypeError
    );
});

// --------------------------------------------------
// getLocationsContainingPokemon
// --------------------------------------------------

test("getLocationsContainingPokemon returns locations for Pikachu", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getLocationsContainingPokemon("Pikachu"),
        ["VIRIDIAN_FOREST", "POWER_PLANT"]
    );
});

test("getLocationsContainingPokemon returns locations for Pidgey", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getLocationsContainingPokemon("Pidgey"),
        ["PALLET_TOWN", "ROUTE_1"]
    );
});

test("getLocationsContainingPokemon returns an empty array for an unknown Pokémon", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getLocationsContainingPokemon("Missingmon"),
        []
    );
});

test("getLocationsContainingPokemon delegates to the location database", () => {
    const { service, locationDatabase } = createEnvironment();

    service.getLocationsContainingPokemon("Bulbasaur");

    assert.deepEqual(
        locationDatabase.calls.getPokemonLocations,
        ["Bulbasaur"]
    );
});

test("getLocationsContainingPokemon passes the Pokémon identifier unchanged", () => {
    const calls = [];

    const database = {
        getPokemonInLocation() {
            return [];
        },
        getPokemonLocations(pokemon) {
            calls.push(pokemon);
            return [];
        }
    };

    const service = new LocationAnalysisService(database);

    service.getLocationsContainingPokemon("NIDORAN_F");

    assert.deepEqual(calls, ["NIDORAN_F"]);
});

test("getLocationsContainingPokemon returns the database result unchanged", () => {
    const expected = ["AREA_A", "AREA_B"];

    const database = {
        getPokemonInLocation() {
            return [];
        },
        getPokemonLocations() {
            return expected;
        }
    };

    const service = new LocationAnalysisService(database);

    assert.strictEqual(
        service.getLocationsContainingPokemon("Pikachu"),
        expected
    );
});

test("getLocationsContainingPokemon propagates database errors", () => {
    const database = {
        getPokemonInLocation() {
            return [];
        },
        getPokemonLocations() {
            throw new Error("Location lookup failed");
        }
    };

    const service = new LocationAnalysisService(database);

    assert.throws(
        () => service.getLocationsContainingPokemon("Pikachu"),
        /Location lookup failed/
    );
});

// --------------------------------------------------
// getPokemonCountInLocations
// --------------------------------------------------

test("getPokemonCountInLocations counts unique Pokémon in one location", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getPokemonCountInLocations(["PALLET_TOWN"]),
        3
    );
});

test("getPokemonCountInLocations counts unique Pokémon across locations", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getPokemonCountInLocations([
            "PALLET_TOWN",
            "ROUTE_1",
            "VIRIDIAN_FOREST"
        ]),
        5
    );
});

test("getPokemonCountInLocations returns zero for an empty location list", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getPokemonCountInLocations([]),
        0
    );
});

test("getPokemonCountInLocations returns zero when no Pokémon are available", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            AREA_A: [],
            AREA_B: []
        }
    });

    assert.equal(
        service.getPokemonCountInLocations([
            "AREA_A",
            "AREA_B"
        ]),
        0
    );
});

test("getPokemonCountInLocations counts a species only once across repeated locations", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            AREA_A: ["Eevee", "Eevee"],
            AREA_B: ["Eevee", "Eevee"]
        }
    });

    assert.equal(
        service.getPokemonCountInLocations([
            "AREA_A",
            "AREA_B"
        ]),
        1
    );
});

test("getPokemonCountInLocations queries each location once", () => {
    const { service, locationDatabase } = createEnvironment();

    service.getPokemonCountInLocations([
        "PALLET_TOWN",
        "ROUTE_1"
    ]);

    assert.deepEqual(
        locationDatabase.calls.getPokemonInLocation,
        ["PALLET_TOWN", "ROUTE_1"]
    );
});

test("getPokemonCountInLocations propagates encounter lookup errors", () => {
    const database = {
        getPokemonInLocation() {
            throw new Error("Encounter lookup failed");
        },
        getPokemonLocations() {
            return [];
        }
    };

    const service = new LocationAnalysisService(database);

    assert.throws(
        () => service.getPokemonCountInLocations(["AREA_A"]),
        /Encounter lookup failed/
    );
});

// --------------------------------------------------
// getCommonPokemon
// --------------------------------------------------

test("getCommonPokemon returns Pokémon available in both groups", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            BEFORE_A: ["Pikachu", "Pidgey", "Rattata"],
            BEFORE_B: ["Bulbasaur"],
            AFTER_A: ["Pidgey", "Rattata", "Psyduck"],
            AFTER_B: ["Pikachu", "Oddish"]
        }
    });

    assert.deepEqual(
        service.getCommonPokemon(
            ["BEFORE_A", "BEFORE_B"],
            ["AFTER_A", "AFTER_B"]
        ),
        ["Pidgey", "Rattata", "Pikachu"]
    );
});

test("getCommonPokemon returns an empty array when groups have no Pokémon in common", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            GROUP_A: ["Pikachu", "Pidgey"],
            GROUP_B: ["Bulbasaur", "Squirtle"]
        }
    });

    assert.deepEqual(
        service.getCommonPokemon(
            ["GROUP_A"],
            ["GROUP_B"]
        ),
        []
    );
});

test("getCommonPokemon returns an empty array when the first group is empty", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            GROUP_B: ["Pikachu", "Pidgey"]
        }
    });

    assert.deepEqual(
        service.getCommonPokemon([], ["GROUP_B"]),
        []
    );
});

test("getCommonPokemon returns an empty array when the second group is empty", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            GROUP_A: ["Pikachu", "Pidgey"]
        }
    });

    assert.deepEqual(
        service.getCommonPokemon(["GROUP_A"], []),
        []
    );
});

test("getCommonPokemon returns unique common Pokémon", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            GROUP_A: ["Pikachu", "Pikachu", "Pidgey"],
            GROUP_B: ["Pikachu", "Pikachu", "Pidgey", "Pikachu"]
        }
    });

    assert.deepEqual(
        service.getCommonPokemon(["GROUP_A"], ["GROUP_B"]),
        ["Pikachu", "Pidgey"]
    );
});

test("getCommonPokemon preserves the order from the second group", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            GROUP_A: ["Pikachu", "Pidgey", "Rattata"],
            GROUP_B: ["Rattata", "Pikachu", "Pidgey"]
        }
    });

    assert.deepEqual(
        service.getCommonPokemon(["GROUP_A"], ["GROUP_B"]),
        ["Rattata", "Pikachu", "Pidgey"]
    );
});

test("getCommonPokemon compares Pokémon identifiers exactly", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            GROUP_A: ["Pikachu"],
            GROUP_B: ["pikachu"]
        }
    });

    assert.deepEqual(
        service.getCommonPokemon(["GROUP_A"], ["GROUP_B"]),
        []
    );
});

test("getCommonPokemon queries both location groups", () => {
    const { service, locationDatabase } = createEnvironment({
        locationPokemon: {
            GROUP_A: ["Pikachu"],
            GROUP_B: ["Pidgey"]
        }
    });

    service.getCommonPokemon(["GROUP_A"], ["GROUP_B"]);

    assert.deepEqual(
        locationDatabase.calls.getPokemonInLocation,
        ["GROUP_A", "GROUP_B"]
    );
});

test("getCommonPokemon processes the first group before the second group", () => {
    const { service, locationDatabase } = createEnvironment({
        locationPokemon: {
            FIRST_A: ["Pikachu"],
            FIRST_B: ["Pidgey"],
            SECOND_A: ["Rattata"],
            SECOND_B: ["Psyduck"]
        }
    });

    service.getCommonPokemon(
        ["FIRST_A", "FIRST_B"],
        ["SECOND_A", "SECOND_B"]
    );

    assert.deepEqual(
        locationDatabase.calls.getPokemonInLocation,
        ["FIRST_A", "FIRST_B", "SECOND_A", "SECOND_B"]
    );
});

test("getCommonPokemon propagates encounter lookup errors", () => {
    const database = {
        getPokemonInLocation(location) {
            if (location === "GROUP_B") {
                throw new Error("Second group lookup failed");
            }

            return ["Pikachu"];
        },
        getPokemonLocations() {
            return [];
        }
    };

    const service = new LocationAnalysisService(database);

    assert.throws(
        () => service.getCommonPokemon(["GROUP_A"], ["GROUP_B"]),
        /Second group lookup failed/
    );
});

// --------------------------------------------------
// getNewPokemon
// --------------------------------------------------

test("getNewPokemon returns species only found in the new locations", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            PREVIOUS: ["Pikachu", "Pidgey", "Rattata"],
            CURRENT: ["Pidgey", "Oddish", "Psyduck"]
        }
    });

    assert.deepEqual(
        service.getNewPokemon(["PREVIOUS"], ["CURRENT"]),
        ["Oddish", "Psyduck"]
    );
});

test("getNewPokemon returns all species when the previous group is empty", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            CURRENT: ["Pikachu", "Pidgey"]
        }
    });

    assert.deepEqual(
        service.getNewPokemon([], ["CURRENT"]),
        ["Pikachu", "Pidgey"]
    );
});

test("getNewPokemon returns an empty array when the new group is empty", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            PREVIOUS: ["Pikachu", "Pidgey"]
        }
    });

    assert.deepEqual(
        service.getNewPokemon(["PREVIOUS"], []),
        []
    );
});

test("getNewPokemon returns an empty array when no new species are found", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            PREVIOUS: ["Pikachu", "Pidgey"],
            CURRENT: ["Pikachu", "Pidgey"]
        }
    });

    assert.deepEqual(
        service.getNewPokemon(["PREVIOUS"], ["CURRENT"]),
        []
    );
});

test("getNewPokemon removes duplicate species from the new locations", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            PREVIOUS: ["Pikachu"],
            CURRENT_A: ["Pidgey", "Pidgey"],
            CURRENT_B: ["Pidgey", "Psyduck", "Psyduck"]
        }
    });

    assert.deepEqual(
        service.getNewPokemon(
            ["PREVIOUS"],
            ["CURRENT_A", "CURRENT_B"]
        ),
        ["Pidgey", "Psyduck"]
    );
});

test("getNewPokemon preserves species order from the new locations", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            PREVIOUS: ["Pikachu"],
            CURRENT_A: ["Squirtle", "Bulbasaur"],
            CURRENT_B: ["Charmander", "Bulbasaur"]
        }
    });

    assert.deepEqual(
        service.getNewPokemon(
            ["PREVIOUS"],
            ["CURRENT_A", "CURRENT_B"]
        ),
        ["Squirtle", "Bulbasaur", "Charmander"]
    );
});

test("getNewPokemon compares species identifiers exactly", () => {
    const { service } = createEnvironment({
        locationPokemon: {
            PREVIOUS: ["Pikachu"],
            CURRENT: ["pikachu"]
        }
    });

    assert.deepEqual(
        service.getNewPokemon(["PREVIOUS"], ["CURRENT"]),
        ["pikachu"]
    );
});

test("getNewPokemon queries previous locations before new locations", () => {
    const { service, locationDatabase } = createEnvironment({
        locationPokemon: {
            OLD_A: ["Pikachu"],
            OLD_B: ["Pidgey"],
            NEW_A: ["Rattata"],
            NEW_B: ["Psyduck"]
        }
    });

    service.getNewPokemon(
        ["OLD_A", "OLD_B"],
        ["NEW_A", "NEW_B"]
    );

    assert.deepEqual(
        locationDatabase.calls.getPokemonInLocation,
        ["OLD_A", "OLD_B", "NEW_A", "NEW_B"]
    );
});

test("getNewPokemon does not mutate the source encounter arrays", () => {
    const previous = ["Pikachu", "Pikachu"];
    const current = ["Pidgey", "Pidgey", "Rattata"];

    const { service } = createEnvironment({
        locationPokemon: {
            PREVIOUS: previous,
            CURRENT: current
        }
    });

    service.getNewPokemon(["PREVIOUS"], ["CURRENT"]);

    assert.deepEqual(previous, ["Pikachu", "Pikachu"]);
    assert.deepEqual(current, ["Pidgey", "Pidgey", "Rattata"]);
});

test("getNewPokemon propagates encounter lookup errors", () => {
    const database = {
        getPokemonInLocation(location) {
            if (location === "CURRENT") {
                throw new Error("New location lookup failed");
            }

            return ["Pikachu"];
        },
        getPokemonLocations() {
            return [];
        }
    };

    const service = new LocationAnalysisService(database);

    assert.throws(
        () => service.getNewPokemon(["PREVIOUS"], ["CURRENT"]),
        /New location lookup failed/
    );
});
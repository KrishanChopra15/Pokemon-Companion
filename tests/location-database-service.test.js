"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const LocationDatabaseService = require("../scripts/services/location-database-service");

// --------------------------------------------------
// Test fixtures
// --------------------------------------------------

let fixtureCounter = 0;

const DEFAULT_LOCATIONS = {
    PALLET_TOWN: {
        id: "PALLET_TOWN",
        name: "Pallet Town",
        encounters: [
            { pokemon: "Pikachu" },
            { pokemon: "Pidgey" },
            { pokemon: "Pikachu" }
        ]
    },

    ROUTE_1: {
        id: "ROUTE_1",
        name: "Route 1",
        encounters: [
            { pokemon: "Pidgey" },
            { pokemon: "Rattata" }
        ]
    },

    VIRIDIAN_FOREST: {
        id: "VIRIDIAN_FOREST",
        name: "Viridian Forest",
        encounters: [
            { pokemon: "Caterpie" },
            { pokemon: "Weedle" },
            { pokemon: "Pikachu" }
        ]
    },

    EMPTY_AREA: {
        id: "EMPTY_AREA",
        name: "Empty Area",
        encounters: []
    }
};

const DEFAULT_POKEMON_LOCATIONS = {
    Pikachu: ["PALLET_TOWN", "VIRIDIAN_FOREST"],
    Pidgey: ["PALLET_TOWN", "ROUTE_1"],
    Rattata: ["ROUTE_1"],
    Caterpie: ["VIRIDIAN_FOREST"],
    Weedle: ["VIRIDIAN_FOREST"]
};

function createFixture(t, options = {}) {
    const game =
        `__location_database_service_test_${process.pid}_${++fixtureCounter}`;

    const directory = path.join(
        __dirname,
        "..",
        "database",
        "generated",
        game
    );

    fs.mkdirSync(directory, { recursive: true });

    if (options.writeLocations !== false) {
        const locations = Object.prototype.hasOwnProperty.call(
            options,
            "locations"
        )
            ? options.locations
            : DEFAULT_LOCATIONS;

        fs.writeFileSync(
            path.join(directory, "locations.json"),
            JSON.stringify(locations),
            "utf8"
        );
    }

    if (options.writePokemonLocations !== false) {
        const pokemonLocations = Object.prototype.hasOwnProperty.call(
            options,
            "pokemonLocations"
        )
            ? options.pokemonLocations
            : DEFAULT_POKEMON_LOCATIONS;

        fs.writeFileSync(
            path.join(directory, "pokemon-locations.json"),
            JSON.stringify(pokemonLocations),
            "utf8"
        );
    }

    t.after(() => {
        fs.rmSync(directory, {
            recursive: true,
            force: true
        });
    });

    return {
        game,
        directory,

        createService() {
            return new LocationDatabaseService(game);
        }
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a LocationDatabaseService instance", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.ok(service instanceof LocationDatabaseService);
});

test("constructor stores the parsed location database", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(service.locations, DEFAULT_LOCATIONS);
});

test("constructor stores the parsed Pokémon location database", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.pokemonLocations,
        DEFAULT_POKEMON_LOCATIONS
    );
});

test("constructor loads both JSON database files", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.ok(service.locations.PALLET_TOWN);
    assert.ok(service.pokemonLocations.Pikachu);
});

test("constructor parses location records from JSON", t => {
    const locations = {
        TEST_AREA: {
            id: "TEST_AREA",
            name: "Test Area",
            encounters: [
                { pokemon: "Bulbasaur" }
            ]
        }
    };

    const fixture = createFixture(t, { locations });
    const service = fixture.createService();

    assert.deepEqual(service.locations, locations);
});

test("constructor parses Pokémon location arrays from JSON", t => {
    const pokemonLocations = {
        Bulbasaur: ["TEST_AREA", "TEST_FOREST"],
        Squirtle: ["TEST_LAKE"]
    };

    const fixture = createFixture(t, { pokemonLocations });
    const service = fixture.createService();

    assert.deepEqual(
        service.pokemonLocations,
        pokemonLocations
    );
});

test("constructor preserves location metadata", t => {
    const locations = {
        TEST_AREA: {
            id: "TEST_AREA",
            name: "Test Area",
            region: "KANTO",
            type: "FOREST",
            encounters: []
        }
    };

    const fixture = createFixture(t, { locations });
    const service = fixture.createService();

    assert.deepEqual(
        service.locations.TEST_AREA,
        locations.TEST_AREA
    );
});

test("constructor keeps location and Pokémon databases separate", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.ok(service.locations.PALLET_TOWN);
    assert.equal(
        service.pokemonLocations.PALLET_TOWN,
        undefined
    );
});

test("constructor loads data for the requested game", t => {
    const locationsA = {
        AREA_A: {
            id: "AREA_A",
            encounters: []
        }
    };

    const locationsB = {
        AREA_B: {
            id: "AREA_B",
            encounters: []
        }
    };

    const fixtureA = createFixture(t, {
        locations: locationsA
    });

    const fixtureB = createFixture(t, {
        locations: locationsB
    });

    const serviceA = fixtureA.createService();
    const serviceB = fixtureB.createService();

    assert.deepEqual(
        Object.keys(serviceA.locations),
        ["AREA_A"]
    );

    assert.deepEqual(
        Object.keys(serviceB.locations),
        ["AREA_B"]
    );
});

test("constructor throws when the locations file is missing", t => {
    const fixture = createFixture(t, {
        writeLocations: false
    });

    assert.throws(
        () => fixture.createService(),
        error => error.code === "ENOENT"
    );
});

test("constructor throws when the Pokémon locations file is missing", t => {
    const fixture = createFixture(t, {
        writePokemonLocations: false
    });

    assert.throws(
        () => fixture.createService(),
        error => error.code === "ENOENT"
    );
});

test("constructor throws when the locations JSON is malformed", t => {
    const fixture = createFixture(t);

    fs.writeFileSync(
        path.join(fixture.directory, "locations.json"),
        "{invalid json",
        "utf8"
    );

    assert.throws(
        () => fixture.createService(),
        SyntaxError
    );
});

test("constructor throws when the Pokémon locations JSON is malformed", t => {
    const fixture = createFixture(t);

    fs.writeFileSync(
        path.join(fixture.directory, "pokemon-locations.json"),
        "{invalid json",
        "utf8"
    );

    assert.throws(
        () => fixture.createService(),
        SyntaxError
    );
});

test("constructor throws when locations JSON contains a string instead of valid JSON", t => {
    const fixture = createFixture(t);

    fs.writeFileSync(
        path.join(fixture.directory, "locations.json"),
        "not JSON",
        "utf8"
    );

    assert.throws(
        () => fixture.createService(),
        SyntaxError
    );
});

test("constructor throws when the requested game directory does not exist", () => {
    const game =
        `__location_database_service_missing_${process.pid}_${++fixtureCounter}`;

    assert.throws(
        () => new LocationDatabaseService(game),
        error => error.code === "ENOENT"
    );
});

// --------------------------------------------------
// getLocation
// --------------------------------------------------

test("getLocation returns Pallet Town", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getLocation("PALLET_TOWN"),
        DEFAULT_LOCATIONS.PALLET_TOWN
    );
});

test("getLocation returns Route 1", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getLocation("ROUTE_1"),
        DEFAULT_LOCATIONS.ROUTE_1
    );
});

test("getLocation returns Viridian Forest", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getLocation("VIRIDIAN_FOREST"),
        DEFAULT_LOCATIONS.VIRIDIAN_FOREST
    );
});

test("getLocation returns the original stored location object", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.strictEqual(
        service.getLocation("PALLET_TOWN"),
        service.locations.PALLET_TOWN
    );
});

test("getLocation returns null for an unknown location", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.getLocation("UNKNOWN_LOCATION"),
        null
    );
});

test("getLocation returns null for an empty ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(service.getLocation(""), null);
});

test("getLocation returns null for a null ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(service.getLocation(null), null);
});

test("getLocation returns null for an undefined ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(service.getLocation(undefined), null);
});

test("getLocation uses exact ID matching", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.getLocation("pallet_town"),
        null
    );
});

test("getLocation returns null when a stored entry is null", t => {
    const fixture = createFixture(t, {
        locations: {
            NULL_AREA: null
        }
    });

    const service = fixture.createService();

    assert.equal(
        service.getLocation("NULL_AREA"),
        null
    );
});

test("getLocation returns null when a stored entry is false", t => {
    const fixture = createFixture(t, {
        locations: {
            FALSE_AREA: false
        }
    });

    const service = fixture.createService();

    assert.equal(
        service.getLocation("FALSE_AREA"),
        null
    );
});

// --------------------------------------------------
// getAllLocations
// --------------------------------------------------

test("getAllLocations returns an array", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.ok(Array.isArray(service.getAllLocations()));
});

test("getAllLocations returns every stored location", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.getAllLocations().length,
        Object.keys(DEFAULT_LOCATIONS).length
    );
});

test("getAllLocations returns location values without database keys", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getAllLocations(),
        Object.values(DEFAULT_LOCATIONS)
    );
});

test("getAllLocations preserves object value order", t => {
    const locations = {
        AREA_C: { id: "AREA_C" },
        AREA_A: { id: "AREA_A" },
        AREA_B: { id: "AREA_B" }
    };

    const fixture = createFixture(t, { locations });
    const service = fixture.createService();

    assert.deepEqual(
        service.getAllLocations().map(location => location.id),
        ["AREA_C", "AREA_A", "AREA_B"]
    );
});

test("getAllLocations returns the original location objects", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const all = service.getAllLocations();

    assert.strictEqual(all[0], service.locations.PALLET_TOWN);
});

test("getAllLocations returns a new array on each call", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const first = service.getAllLocations();
    const second = service.getAllLocations();

    assert.notStrictEqual(first, second);
    assert.deepEqual(first, second);
});

test("getAllLocations returns an empty array for an empty database", t => {
    const fixture = createFixture(t, {
        locations: {}
    });

    const service = fixture.createService();

    assert.deepEqual(service.getAllLocations(), []);
});

test("getAllLocations includes records even when an entry is null", t => {
    const locations = {
        AREA_A: null,
        AREA_B: { id: "AREA_B" }
    };

    const fixture = createFixture(t, { locations });
    const service = fixture.createService();

    assert.deepEqual(
        service.getAllLocations(),
        [null, { id: "AREA_B" }]
    );
});

// --------------------------------------------------
// getPokemonInLocation
// --------------------------------------------------

test("getPokemonInLocation returns Pokémon in Pallet Town", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonInLocation("PALLET_TOWN"),
        ["Pikachu", "Pidgey"]
    );
});

test("getPokemonInLocation returns Pokémon in Route 1", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonInLocation("ROUTE_1"),
        ["Pidgey", "Rattata"]
    );
});

test("getPokemonInLocation returns Pokémon in Viridian Forest", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonInLocation("VIRIDIAN_FOREST"),
        ["Caterpie", "Weedle", "Pikachu"]
    );
});

test("getPokemonInLocation removes duplicate species", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonInLocation("PALLET_TOWN"),
        ["Pikachu", "Pidgey"]
    );
});

test("getPokemonInLocation preserves first-seen species order", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                id: "TEST_AREA",
                encounters: [
                    { pokemon: "Eevee" },
                    { pokemon: "Pikachu" },
                    { pokemon: "Eevee" },
                    { pokemon: "Squirtle" },
                    { pokemon: "Pikachu" }
                ]
            }
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonInLocation("TEST_AREA"),
        ["Eevee", "Pikachu", "Squirtle"]
    );
});

test("getPokemonInLocation returns an empty array for an empty encounter list", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonInLocation("EMPTY_AREA"),
        []
    );
});

test("getPokemonInLocation returns an empty array for an unknown location", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonInLocation("UNKNOWN_LOCATION"),
        []
    );
});

test("getPokemonInLocation returns an empty array for an empty ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonInLocation(""),
        []
    );
});

test("getPokemonInLocation preserves species identifiers exactly", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                id: "TEST_AREA",
                encounters: [
                    { pokemon: "pikachu" },
                    { pokemon: "Pikachu" },
                    { pokemon: "PIKACHU" }
                ]
            }
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonInLocation("TEST_AREA"),
        ["pikachu", "Pikachu", "PIKACHU"]
    );
});

test("getPokemonInLocation uses encounter pokemon properties", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                id: "TEST_AREA",
                encounters: [
                    {
                        pokemon: "Bulbasaur",
                        rate: 20,
                        level: 5
                    },
                    {
                        pokemon: "Squirtle",
                        rate: 10,
                        level: 7
                    }
                ]
            }
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonInLocation("TEST_AREA"),
        ["Bulbasaur", "Squirtle"]
    );
});

test("getPokemonInLocation preserves missing pokemon values as undefined", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                id: "TEST_AREA",
                encounters: [
                    {},
                    { pokemon: "Pikachu" },
                    {}
                ]
            }
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonInLocation("TEST_AREA"),
        [undefined, "Pikachu"]
    );
});

test("getPokemonInLocation does not mutate the encounter list", t => {
    const locations = {
        TEST_AREA: {
            id: "TEST_AREA",
            encounters: [
                { pokemon: "Pikachu" },
                { pokemon: "Pikachu" },
                { pokemon: "Pidgey" }
            ]
        }
    };

    const original = JSON.stringify(locations);

    const fixture = createFixture(t, { locations });
    const service = fixture.createService();

    service.getPokemonInLocation("TEST_AREA");

    assert.equal(
        JSON.stringify(service.locations),
        original
    );
});

test("getPokemonInLocation returns a new array on each call", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const first = service.getPokemonInLocation("PALLET_TOWN");
    const second = service.getPokemonInLocation("PALLET_TOWN");

    assert.notStrictEqual(first, second);
    assert.deepEqual(first, second);
});

test("getPokemonInLocation throws when encounters is missing", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                id: "TEST_AREA"
            }
        }
    });

    const service = fixture.createService();

    assert.throws(
        () => service.getPokemonInLocation("TEST_AREA"),
        TypeError
    );
});

test("getPokemonInLocation throws when encounters is null", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                id: "TEST_AREA",
                encounters: null
            }
        }
    });

    const service = fixture.createService();

    assert.throws(
        () => service.getPokemonInLocation("TEST_AREA"),
        TypeError
    );
});

// --------------------------------------------------
// getPokemonLocations
// --------------------------------------------------

test("getPokemonLocations returns the locations for Pikachu", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonLocations("Pikachu"),
        ["PALLET_TOWN", "VIRIDIAN_FOREST"]
    );
});

test("getPokemonLocations returns the locations for Pidgey", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonLocations("Pidgey"),
        ["PALLET_TOWN", "ROUTE_1"]
    );
});

test("getPokemonLocations returns one location when only one is known", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonLocations("Rattata"),
        ["ROUTE_1"]
    );
});

test("getPokemonLocations returns an empty array for an unknown Pokémon", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonLocations("Missingmon"),
        []
    );
});

test("getPokemonLocations returns an empty array for an empty Pokémon ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonLocations(""),
        []
    );
});

test("getPokemonLocations uses exact Pokémon identifiers", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonLocations("pikachu"),
        []
    );
});

test("getPokemonLocations returns the stored array unchanged", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.strictEqual(
        service.getPokemonLocations("Pikachu"),
        service.pokemonLocations.Pikachu
    );
});

test("getPokemonLocations preserves location order", t => {
    const pokemonLocations = {
        Eevee: ["AREA_C", "AREA_A", "AREA_B"]
    };

    const fixture = createFixture(t, { pokemonLocations });
    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonLocations("Eevee"),
        ["AREA_C", "AREA_A", "AREA_B"]
    );
});

test("getPokemonLocations does not deduplicate stored locations", t => {
    const fixture = createFixture(t, {
        pokemonLocations: {
            Pikachu: [
                "PALLET_TOWN",
                "PALLET_TOWN",
                "VIRIDIAN_FOREST"
            ]
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonLocations("Pikachu"),
        [
            "PALLET_TOWN",
            "PALLET_TOWN",
            "VIRIDIAN_FOREST"
        ]
    );
});

test("getPokemonLocations returns an empty array when its stored value is null", t => {
    const fixture = createFixture(t, {
        pokemonLocations: {
            Pikachu: null
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonLocations("Pikachu"),
        []
    );
});

test("getPokemonLocations returns an empty array when its stored value is false", t => {
    const fixture = createFixture(t, {
        pokemonLocations: {
            Pikachu: false
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonLocations("Pikachu"),
        []
    );
});

test("getPokemonLocations returns an empty array when its stored value is an empty string", t => {
    const fixture = createFixture(t, {
        pokemonLocations: {
            Pikachu: ""
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getPokemonLocations("Pikachu"),
        []
    );
});

// --------------------------------------------------
// getPokemonCount
// --------------------------------------------------

test("getPokemonCount returns the number of Pokémon keys", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.getPokemonCount(),
        Object.keys(DEFAULT_POKEMON_LOCATIONS).length
    );
});

test("getPokemonCount returns five for the default fixture", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(service.getPokemonCount(), 5);
});

test("getPokemonCount returns zero for an empty Pokémon database", t => {
    const fixture = createFixture(t, {
        pokemonLocations: {}
    });

    const service = fixture.createService();

    assert.equal(service.getPokemonCount(), 0);
});

test("getPokemonCount counts each Pokémon key once", t => {
    const fixture = createFixture(t, {
        pokemonLocations: {
            Pikachu: ["AREA_A", "AREA_B"],
            Pidgey: ["AREA_A"],
            Rattata: ["AREA_B"]
        }
    });

    const service = fixture.createService();

    assert.equal(service.getPokemonCount(), 3);
});

test("getPokemonCount counts keys even when the location arrays are empty", t => {
    const fixture = createFixture(t, {
        pokemonLocations: {
            Pikachu: [],
            Pidgey: [],
            Rattata: []
        }
    });

    const service = fixture.createService();

    assert.equal(service.getPokemonCount(), 3);
});

test("getPokemonCount counts keys even when a value is null", t => {
    const fixture = createFixture(t, {
        pokemonLocations: {
            Pikachu: null,
            Pidgey: ["AREA_A"]
        }
    });

    const service = fixture.createService();

    assert.equal(service.getPokemonCount(), 2);
});

test("getPokemonCount does not count locations", t => {
    const fixture = createFixture(t, {
        locations: {
            AREA_A: {
                id: "AREA_A",
                encounters: []
            },
            AREA_B: {
                id: "AREA_B",
                encounters: []
            }
        },
        pokemonLocations: {
            Pikachu: ["AREA_A", "AREA_B"]
        }
    });

    const service = fixture.createService();

    assert.equal(service.getPokemonCount(), 1);
});

test("getPokemonCount does not change after querying Pokémon", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const before = service.getPokemonCount();

    service.getPokemonInLocation("PALLET_TOWN");
    service.getPokemonLocations("Pikachu");
    service.getAllLocations();

    assert.equal(service.getPokemonCount(), before);
});
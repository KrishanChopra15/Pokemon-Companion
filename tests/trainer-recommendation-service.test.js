"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const TrainerRecommendationService = require("../scripts/services/trainer-recommendation-service");

function createPokemonDatabase(records = [], bySpecies = null) {
    const calls = {
        getAllPokemon: 0,
        getPokemon: []
    };

    const speciesMap = bySpecies || Object.fromEntries(
        records.map(pokemon => [pokemon.species || pokemon.name, pokemon])
    );

    return {
        calls,
        database: {
            getAllPokemon() {
                calls.getAllPokemon++;
                return records;
            },

            getPokemon(species) {
                calls.getPokemon.push(species);
                return speciesMap[species] ?? null;
            }
        }
    };
}

function createPokemon(name, type1 = null, type2 = null) {
    return {
        name,
        ...(type1 ? { type1: { name: type1 } } : {}),
        ...(type2 ? { type2: { name: type2 } } : {})
    };
}

function createService(database = createPokemonDatabase()) {
    return new TrainerRecommendationService(database.database || database);
}

function createAnalysis(overrides = {}) {
    return {
        name: "Leader Brock",
        types: ["Rock", "Ground"],
        ...overrides
    };
}

function createPlayerPokemon(species, level = 10) {
    return { species, level };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a TrainerRecommendationService instance", () => {
    assert.ok(
        createService() instanceof TrainerRecommendationService
    );
});

test("constructor stores the Pokémon database", () => {
    const database = createPokemonDatabase();

    assert.strictEqual(
        createService(database).pokemonDatabase,
        database.database
    );
});

test("constructor preserves a null Pokémon database", () => {
    const service = new TrainerRecommendationService(null);

    assert.equal(service.pokemonDatabase, null);
});

test("constructor permits an undefined Pokémon database", () => {
    const service = new TrainerRecommendationService(undefined);

    assert.equal(service.pokemonDatabase, undefined);
});

// --------------------------------------------------
// getWeaknesses: Rock
// --------------------------------------------------

test("getWeaknesses returns counters for Rock", () => {
    assert.deepEqual(
        createService().getWeaknesses(["Rock"]),
        ["Water", "Grass", "Fighting", "Ground", "Steel"]
    );
});

test("getWeaknesses adds Rock counters in the defined order", () => {
    const result = createService().getWeaknesses(["Rock"]);

    assert.equal(result[0], "Water");
    assert.equal(result[1], "Grass");
    assert.equal(result[2], "Fighting");
    assert.equal(result[3], "Ground");
    assert.equal(result[4], "Steel");
});

// --------------------------------------------------
// getWeaknesses: Ground
// --------------------------------------------------

test("getWeaknesses returns counters for Ground", () => {
    assert.deepEqual(
        createService().getWeaknesses(["Ground"]),
        ["Water", "Grass", "Ice"]
    );
});

test("getWeaknesses adds Ground counters in the defined order", () => {
    const result = createService().getWeaknesses(["Ground"]);

    assert.equal(result[0], "Water");
    assert.equal(result[1], "Grass");
    assert.equal(result[2], "Ice");
});

// --------------------------------------------------
// getWeaknesses: Water
// --------------------------------------------------

test("getWeaknesses returns counters for Water", () => {
    assert.deepEqual(
        createService().getWeaknesses(["Water"]),
        ["Electric", "Grass"]
    );
});

// --------------------------------------------------
// getWeaknesses: Fire
// --------------------------------------------------

test("getWeaknesses returns counters for Fire", () => {
    assert.deepEqual(
        createService().getWeaknesses(["Fire"]),
        ["Water", "Ground", "Rock"]
    );
});

// --------------------------------------------------
// getWeaknesses: combinations and edge cases
// --------------------------------------------------

test("getWeaknesses combines counters from multiple types", () => {
    assert.deepEqual(
        createService().getWeaknesses(["Water", "Fire"]),
        ["Electric", "Grass", "Water", "Ground", "Rock"]
    );
});

test("getWeaknesses removes duplicate weaknesses", () => {
    assert.deepEqual(
        createService().getWeaknesses(["Rock", "Ground"]),
        [
            "Water",
            "Grass",
            "Fighting",
            "Ground",
            "Steel",
            "Ice"
        ]
    );
});

test("getWeaknesses preserves first-seen order for duplicate types", () => {
    assert.deepEqual(
        createService().getWeaknesses(["Fire", "Water", "Fire"]),
        ["Water", "Ground", "Rock", "Electric", "Grass"]
    );
});

test("getWeaknesses returns an empty array for an empty types list", () => {
    assert.deepEqual(createService().getWeaknesses([]), []);
});

test("getWeaknesses returns an empty array for unhandled types", () => {
    assert.deepEqual(
        createService().getWeaknesses([
            "Normal",
            "Electric",
            "Grass",
            "Psychic",
            "Bug",
            "Dragon"
        ]),
        []
    );
});

test("getWeaknesses matches type names exactly", () => {
    assert.deepEqual(
        createService().getWeaknesses(["rock", "GROUND", "Fire "]),
        []
    );
});

test("getWeaknesses handles an unknown type alongside a supported type", () => {
    assert.deepEqual(
        createService().getWeaknesses(["Unknown", "Fire"]),
        ["Water", "Ground", "Rock"]
    );
});

test("getWeaknesses does not modify the supplied types array", () => {
    const types = ["Rock", "Ground"];
    const original = [...types];

    createService().getWeaknesses(types);

    assert.deepEqual(types, original);
});

test("getWeaknesses returns a new array on every call", () => {
    const service = createService();

    assert.notStrictEqual(
        service.getWeaknesses(["Rock"]),
        service.getWeaknesses(["Rock"])
    );
});

test("getWeaknesses throws when types is missing", () => {
    assert.throws(
        () => createService().getWeaknesses(undefined),
        TypeError
    );
});

test("getWeaknesses throws when types is null", () => {
    assert.throws(
        () => createService().getWeaknesses(null),
        TypeError
    );
});

test("getWeaknesses throws when types is not an array", () => {
    assert.throws(
        () => createService().getWeaknesses("Rock"),
        TypeError
    );
});

// --------------------------------------------------
// findPokemon
// --------------------------------------------------

test("findPokemon returns Pokémon with a matching primary type", () => {
    const records = [
        createPokemon("Squirtle", "Water"),
        createPokemon("Pikachu", "Electric"),
        createPokemon("Bulbasaur", "Grass")
    ];

    const result = createService(
        createPokemonDatabase(records)
    ).findPokemon(["Water"]);

    assert.deepEqual(result, ["Squirtle"]);
});

test("findPokemon returns Pokémon with a matching secondary type", () => {
    const records = [
        createPokemon("Charizard", "Fire", "Flying"),
        createPokemon("Pikachu", "Electric")
    ];

    assert.deepEqual(
        createService(createPokemonDatabase(records))
            .findPokemon(["Flying"]),
        ["Charizard"]
    );
});

test("findPokemon includes a Pokémon when either type matches", () => {
    const records = [
        createPokemon("Charizard", "Fire", "Flying"),
        createPokemon("Squirtle", "Water"),
        createPokemon("Bulbasaur", "Grass", "Poison")
    ];

    assert.deepEqual(
        createService(createPokemonDatabase(records))
            .findPokemon(["Water", "Poison"]),
        ["Squirtle", "Bulbasaur"]
    );
});

test("findPokemon does not return Pokémon with no matching types", () => {
    const records = [
        createPokemon("Pikachu", "Electric"),
        createPokemon("Charmander", "Fire")
    ];

    assert.deepEqual(
        createService(createPokemonDatabase(records))
            .findPokemon(["Water"]),
        []
    );
});

test("findPokemon matches type names exactly", () => {
    const records = [
        createPokemon("Squirtle", "Water"),
        createPokemon("Psyduck", "water")
    ];

    assert.deepEqual(
        createService(createPokemonDatabase(records))
            .findPokemon(["Water"]),
        ["Squirtle"]
    );
});

test("findPokemon returns names instead of full Pokémon records", () => {
    const records = [
        createPokemon("Squirtle", "Water")
    ];

    const result = createService(
        createPokemonDatabase(records)
    ).findPokemon(["Water"]);

    assert.deepEqual(result, ["Squirtle"]);
});

test("findPokemon preserves database ordering", () => {
    const records = [
        createPokemon("First", "Water"),
        createPokemon("Second", "Water"),
        createPokemon("Third", "Water")
    ];

    assert.deepEqual(
        createService(createPokemonDatabase(records))
            .findPokemon(["Water"]),
        ["First", "Second", "Third"]
    );
});

test("findPokemon limits results to ten Pokémon", () => {
    const records = Array.from(
        { length: 15 },
        (_, index) => createPokemon(`Pokemon${index}`, "Water")
    );

    const result = createService(
        createPokemonDatabase(records)
    ).findPokemon(["Water"]);

    assert.equal(result.length, 10);
    assert.deepEqual(
        result,
        records.slice(0, 10).map(pokemon => pokemon.name)
    );
});

test("findPokemon returns fewer than ten results when fewer match", () => {
    const records = [
        createPokemon("Squirtle", "Water"),
        createPokemon("Pikachu", "Electric"),
        createPokemon("Psyduck", "Water")
    ];

    assert.deepEqual(
        createService(createPokemonDatabase(records))
            .findPokemon(["Water"]),
        ["Squirtle", "Psyduck"]
    );
});

test("findPokemon returns an empty array when no Pokémon match", () => {
    const records = [
        createPokemon("Pikachu", "Electric"),
        createPokemon("Charmander", "Fire")
    ];

    assert.deepEqual(
        createService(createPokemonDatabase(records))
            .findPokemon(["Ice"]),
        []
    );
});

test("findPokemon calls getAllPokemon once", () => {
    const database = createPokemonDatabase([
        createPokemon("Squirtle", "Water")
    ]);

    createService(database).findPokemon(["Water"]);

    assert.equal(database.calls.getAllPokemon, 1);
});

test("findPokemon propagates database lookup errors", () => {
    const service = createService({
        getAllPokemon() {
            throw new Error("Database lookup failed");
        }
    });

    assert.throws(
        () => service.findPokemon(["Water"]),
        /Database lookup failed/
    );
});

test("findPokemon throws if getAllPokemon is unavailable", () => {
    const service = createService({});

    assert.throws(
        () => service.findPokemon(["Water"]),
        TypeError
    );
});

test("findPokemon throws if the database returns a non-array", () => {
    const service = createService({
        getAllPokemon: () => ({})
    });

    assert.throws(
        () => service.findPokemon(["Water"]),
        TypeError
    );
});

test("findPokemon throws for a missing type list", () => {
    const service = createService(
        createPokemonDatabase([createPokemon("Squirtle", "Water")])
    );

    assert.throws(
        () => service.findPokemon(undefined),
        TypeError
    );
});

// --------------------------------------------------
// rankPlayerPokemon
// --------------------------------------------------

test("rankPlayerPokemon returns the expected result shape", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Electric")
        }
    );

    assert.deepEqual(
        createService(database).rankPlayerPokemon(
            [createPlayerPokemon("PIKACHU", 20)],
            ["Water"]
        ),
        [
            {
                pokemon: "PIKACHU",
                level: 20,
                score: 20
            }
        ]
    );
});

test("rankPlayerPokemon adds the Pokémon level to its score", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Normal")
        }
    );

    assert.deepEqual(
        createService(database).rankPlayerPokemon(
            [createPlayerPokemon("PIKACHU", 25)],
            []
        ),
        [
            {
                pokemon: "PIKACHU",
                level: 25,
                score: 25
            }
        ]
    );
});

test("rankPlayerPokemon adds fifty points for a matching primary type", () => {
    const database = createPokemonDatabase(
        [],
        {
            SQUIRTLE: createPokemon("Squirtle", "Water")
        }
    );

    const result = createService(database).rankPlayerPokemon(
        [createPlayerPokemon("SQUIRTLE", 10)],
        ["Water"]
    );

    assert.equal(result[0].score, 60);
});

test("rankPlayerPokemon adds fifty points for a matching secondary type", () => {
    const database = createPokemonDatabase(
        [],
        {
            CHARIZARD: createPokemon("Charizard", "Fire", "Flying")
        }
    );

    const result = createService(database).rankPlayerPokemon(
        [createPlayerPokemon("CHARIZARD", 10)],
        ["Flying"]
    );

    assert.equal(result[0].score, 60);
});

test("rankPlayerPokemon adds one bonus for each matching type slot", () => {
    const database = createPokemonDatabase(
        [],
        {
            DUAL: createPokemon("DualType", "Water", "Grass")
        }
    );

    const result = createService(database).rankPlayerPokemon(
        [createPlayerPokemon("DUAL", 10)],
        ["Water", "Grass"]
    );

    assert.equal(result[0].score, 110);
});

test("rankPlayerPokemon scores a dual-type Pokémon at one hundred bonus points when both types match", () => {
    const database = createPokemonDatabase(
        [],
        {
            DUAL: createPokemon("DualType", "Water", "Grass")
        }
    );

    const result = createService(database).rankPlayerPokemon(
        [createPlayerPokemon("DUAL", 7)],
        ["Water", "Grass"]
    );

    assert.equal(result[0].score, 107);
});

test("rankPlayerPokemon does not add a bonus for unmatched types", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Electric")
        }
    );

    const result = createService(database).rankPlayerPokemon(
        [createPlayerPokemon("PIKACHU", 12)],
        ["Water"]
    );

    assert.equal(result[0].score, 12);
});

test("rankPlayerPokemon defaults a falsey level to zero in the score", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Electric")
        }
    );

    const result = createService(database).rankPlayerPokemon(
        [createPlayerPokemon("PIKACHU", 0)],
        []
    );

    assert.equal(result[0].score, 0);
});

test("rankPlayerPokemon preserves a zero level in the result", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Electric")
        }
    );

    const result = createService(database).rankPlayerPokemon(
        [createPlayerPokemon("PIKACHU", 0)],
        []
    );

    assert.equal(result[0].level, 0);
});

test("rankPlayerPokemon preserves an undefined level in the result", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Electric")
        }
    );

    const result = createService(database).rankPlayerPokemon(
        [{ species: "PIKACHU" }],
        []
    );

    assert.equal(result[0].level, undefined);
    assert.equal(result[0].score, 0);
});

test("rankPlayerPokemon skips Pokémon missing from the database", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Electric")
        }
    );

    const result = createService(database).rankPlayerPokemon(
        [
            createPlayerPokemon("UNKNOWN", 30),
            createPlayerPokemon("PIKACHU", 10)
        ],
        []
    );

    assert.deepEqual(result, [
        {
            pokemon: "PIKACHU",
            level: 10,
            score: 10
        }
    ]);
});

test("rankPlayerPokemon returns an empty array when no species are found", () => {
    const service = createService(
        createPokemonDatabase([], {})
    );

    assert.deepEqual(
        service.rankPlayerPokemon(
            [
                createPlayerPokemon("UNKNOWN_1", 10),
                createPlayerPokemon("UNKNOWN_2", 20)
            ],
            ["Water"]
        ),
        []
    );
});

test("rankPlayerPokemon retains every known team member", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Electric"),
            SQUIRTLE: createPokemon("Squirtle", "Water"),
            CHARMANDER: createPokemon("Charmander", "Fire")
        }
    );

    const result = createService(database).rankPlayerPokemon(
        [
            createPlayerPokemon("PIKACHU", 12),
            createPlayerPokemon("SQUIRTLE", 10),
            createPlayerPokemon("CHARMANDER", 8)
        ],
        ["Water"]
    );

    assert.equal(result.length, 3);
});

test("rankPlayerPokemon sorts recommendations by descending score", () => {
    const database = createPokemonDatabase(
        [],
        {
            LOW: createPokemon("Low", "Normal"),
            MID: createPokemon("Mid", "Water"),
            HIGH: createPokemon("High", "Water", "Grass")
        }
    );

    const result = createService(database).rankPlayerPokemon(
        [
            createPlayerPokemon("LOW", 5),
            createPlayerPokemon("MID", 10),
            createPlayerPokemon("HIGH", 20)
        ],
        ["Water", "Grass"]
    );

    assert.deepEqual(
        result.map(item => item.pokemon),
        ["HIGH", "MID", "LOW"]
    );

    assert.deepEqual(
        result.map(item => item.score),
        [120, 60, 5]
    );
});

test("rankPlayerPokemon preserves input order when scores tie", () => {
    const database = createPokemonDatabase(
        [],
        {
            FIRST: createPokemon("First", "Normal"),
            SECOND: createPokemon("Second", "Normal"),
            THIRD: createPokemon("Third", "Normal")
        }
    );

    const result = createService(database).rankPlayerPokemon(
        [
            createPlayerPokemon("FIRST", 10),
            createPlayerPokemon("SECOND", 10),
            createPlayerPokemon("THIRD", 10)
        ],
        []
    );

    assert.deepEqual(
        result.map(item => item.pokemon),
        ["FIRST", "SECOND", "THIRD"]
    );
});

test("rankPlayerPokemon looks up each species once", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Electric"),
            SQUIRTLE: createPokemon("Squirtle", "Water")
        }
    );

    createService(database).rankPlayerPokemon(
        [
            createPlayerPokemon("PIKACHU", 10),
            createPlayerPokemon("SQUIRTLE", 12)
        ],
        ["Water"]
    );

    assert.deepEqual(
        database.calls.getPokemon,
        ["PIKACHU", "SQUIRTLE"]
    );
});

test("rankPlayerPokemon does not mutate the supplied team", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Electric")
        }
    );

    const team = [createPlayerPokemon("PIKACHU", 10)];
    const original = structuredClone(team);

    createService(database).rankPlayerPokemon(team, ["Water"]);

    assert.deepEqual(team, original);
});

test("rankPlayerPokemon does not mutate database Pokémon", () => {
    const pokemon = createPokemon("Pikachu", "Electric");
    const database = createPokemonDatabase([], { PIKACHU: pokemon });
    const original = structuredClone(pokemon);

    createService(database).rankPlayerPokemon(
        [createPlayerPokemon("PIKACHU", 10)],
        ["Water"]
    );

    assert.deepEqual(pokemon, original);
});

test("rankPlayerPokemon returns an empty array for an empty team", () => {
    assert.deepEqual(
        createService().rankPlayerPokemon([], ["Water"]),
        []
    );
});

test("rankPlayerPokemon accepts an empty weakness list", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Electric")
        }
    );

    assert.deepEqual(
        createService(database).rankPlayerPokemon(
            [createPlayerPokemon("PIKACHU", 10)],
            []
        ),
        [
            {
                pokemon: "PIKACHU",
                level: 10,
                score: 10
            }
        ]
    );
});

test("rankPlayerPokemon propagates database errors", () => {
    const service = createService({
        getPokemon() {
            throw new Error("Pokémon lookup failed");
        }
    });

    assert.throws(
        () => service.rankPlayerPokemon(
            [createPlayerPokemon("PIKACHU", 10)],
            []
        ),
        /Pokémon lookup failed/
    );
});

test("rankPlayerPokemon throws when getPokemon is unavailable", () => {
    const service = createService({});

    assert.throws(
        () => service.rankPlayerPokemon(
            [createPlayerPokemon("PIKACHU", 10)],
            []
        ),
        TypeError
    );
});

// --------------------------------------------------
// recommend
// --------------------------------------------------

test("recommend returns null when analysis is missing", () => {
    assert.equal(createService().recommend(null), null);
});

test("recommend returns null when analysis is undefined", () => {
    assert.equal(createService().recommend(undefined), null);
});

test("recommend returns the trainer name", () => {
    const result = createService().recommend(
        createAnalysis({ name: "Leader Misty", types: [] })
    );

    assert.equal(result.trainer, "Leader Misty");
});

test("recommend returns the calculated weaknesses", () => {
    const result = createService().recommend(
        createAnalysis({ types: ["Water"] })
    );

    assert.deepEqual(result.weaknesses, ["Electric", "Grass"]);
});

test("recommend uses database counters when the player team is empty", () => {
    const records = [
        createPokemon("Pikachu", "Electric"),
        createPokemon("Bulbasaur", "Grass"),
        createPokemon("Charmander", "Fire")
    ];

    const result = createService(
        createPokemonDatabase(records)
    ).recommend(
        createAnalysis({ types: ["Water"] }),
        []
    );

    assert.deepEqual(result.recommendations, ["Pikachu", "Bulbasaur"]);
});

test("recommend ranks player Pokémon when a player team is supplied", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Electric"),
            CHARMANDER: createPokemon("Charmander", "Fire")
        }
    );

    const result = createService(database).recommend(
        createAnalysis({ types: ["Water"] }),
        [
            createPlayerPokemon("CHARMANDER", 20),
            createPlayerPokemon("PIKACHU", 10)
        ]
    );

    assert.deepEqual(
        result.recommendations.map(item => item.pokemon),
        ["PIKACHU", "CHARMANDER"]
    );
});

test("recommend returns the expected result structure for database recommendations", () => {
    const result = createService(
        createPokemonDatabase([
            createPokemon("Pikachu", "Electric")
        ])
    ).recommend(
        createAnalysis({ name: "Misty", types: ["Water"] })
    );

    assert.deepEqual(result, {
        trainer: "Misty",
        weaknesses: ["Electric", "Grass"],
        recommendations: ["Pikachu"]
    });
});

test("recommend returns the expected result structure for player team recommendations", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Electric")
        }
    );

    assert.deepEqual(
        createService(database).recommend(
            createAnalysis({ name: "Misty", types: ["Water"] }),
            [createPlayerPokemon("PIKACHU", 12)]
        ),
        {
            trainer: "Misty",
            weaknesses: ["Electric", "Grass"],
            recommendations: [
                {
                    pokemon: "PIKACHU",
                    level: 12,
                    score: 62
                }
            ]
        }
    );
});

test("recommend prefers database recommendations for an omitted player team", () => {
    const records = [createPokemon("Pikachu", "Electric")];
    const database = createPokemonDatabase(records);
    const service = createService(database);

    const result = service.recommend(
        createAnalysis({ types: ["Water"] })
    );

    assert.deepEqual(result.recommendations, ["Pikachu"]);
    assert.equal(database.calls.getAllPokemon, 1);
    assert.deepEqual(database.calls.getPokemon, []);
});

test("recommend uses player team recommendations when non-empty", () => {
    const database = createPokemonDatabase(
        [createPokemon("Bulbasaur", "Grass")],
        {
            PIKACHU: createPokemon("Pikachu", "Electric")
        }
    );

    const result = createService(database).recommend(
        createAnalysis({ types: ["Water"] }),
        [createPlayerPokemon("PIKACHU", 10)]
    );

    assert.equal(database.calls.getAllPokemon, 0);
    assert.deepEqual(database.calls.getPokemon, ["PIKACHU"]);
    assert.equal(result.recommendations.length, 1);
});

test("recommend falls back to database recommendations for an empty team", () => {
    const database = createPokemonDatabase([
        createPokemon("Pikachu", "Electric")
    ]);

    const result = createService(database).recommend(
        createAnalysis({ types: ["Water"] }),
        []
    );

    assert.deepEqual(result.recommendations, ["Pikachu"]);
});

test("recommend propagates errors from database counter lookup", () => {
    const service = createService({
        getAllPokemon() {
            throw new Error("Cannot retrieve Pokémon");
        }
    });

    assert.throws(
        () => service.recommend(
            createAnalysis({ types: ["Water"] })
        ),
        /Cannot retrieve Pokémon/
    );
});

test("recommend propagates errors from player Pokémon ranking", () => {
    const service = createService({
        getPokemon() {
            throw new Error("Cannot retrieve player Pokémon");
        }
    });

    assert.throws(
        () => service.recommend(
            createAnalysis({ types: ["Water"] }),
            [createPlayerPokemon("PIKACHU", 10)]
        ),
        /Cannot retrieve player Pokémon/
    );
});

test("recommend throws when analysis types are missing", () => {
    assert.throws(
        () => createService().recommend({ name: "Trainer" }),
        TypeError
    );
});

test("recommend throws when analysis types are null", () => {
    assert.throws(
        () => createService().recommend(
            createAnalysis({ types: null })
        ),
        TypeError
    );
});

test("recommend does not mutate analysis or player team", () => {
    const database = createPokemonDatabase(
        [],
        {
            PIKACHU: createPokemon("Pikachu", "Electric")
        }
    );

    const analysis = createAnalysis({ types: ["Water"] });
    const originalAnalysis = structuredClone(analysis);
    const team = [createPlayerPokemon("PIKACHU", 10)];
    const originalTeam = structuredClone(team);

    createService(database).recommend(analysis, team);

    assert.deepEqual(analysis, originalAnalysis);
    assert.deepEqual(team, originalTeam);
});

test("recommend returns an empty list when no database counters match", () => {
    const database = createPokemonDatabase([
        createPokemon("Charmander", "Fire"),
        createPokemon("Rattata", "Normal")
    ]);

    const result = createService(database).recommend(
        createAnalysis({ types: ["Water"] })
    );

    assert.deepEqual(result.recommendations, []);
});

test("recommend can return no player counters when all species are unknown", () => {
    const service = createService(
        createPokemonDatabase([], {})
    );

    const result = service.recommend(
        createAnalysis({ types: ["Water"] }),
        [
            createPlayerPokemon("UNKNOWN_1", 10),
            createPlayerPokemon("UNKNOWN_2", 20)
        ]
    );

    assert.deepEqual(result.recommendations, []);
});

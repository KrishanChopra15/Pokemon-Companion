"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const TrainerAnalysisService = require("../scripts/services/trainer-analysis-service");

function createPokemonDatabase(records = {}) {
    const calls = [];

    return {
        calls,
        database: {
            getPokemon(species) {
                calls.push(species);
                return records[species] ?? null;
            }
        }
    };
}

function createPokemonRecord({
    type1 = null,
    type2 = null,
    baseHP = 50,
    baseAttack = 50,
    baseDefense = 50,
    baseSpeed = 50,
    baseSpAttack = 50,
    baseSpDefense = 50
} = {}) {
    return {
        type1: type1 ? { name: type1 } : null,
        type2: type2 ? { name: type2 } : null,
        baseHP,
        baseAttack,
        baseDefense,
        baseSpeed,
        baseSpAttack,
        baseSpDefense
    };
}

function createPartyPokemon(species, level, iv = 0) {
    return { species, level, iv };
}

function createTrainer(overrides = {}) {
    return {
        id: "TRAINER_1",
        trainerName: "Youngster Ben",
        trainerType: "YOUNGSTER",
        party: {
            pokemon: [
                createPartyPokemon("RATTATA", 8),
                createPartyPokemon("PIDGEY", 9)
            ]
        },
        ...overrides
    };
}

function createService(options = {}) {
    const trainerCalls = [];

    const trainerDatabase = options.trainerDatabase || {
        getTrainer(id) {
            trainerCalls.push(id);
            return options.trainer ?? createTrainer();
        }
    };

    const pokemonResult = options.pokemonDatabase ||
        createPokemonDatabase({
            RATTATA: createPokemonRecord({
                type1: "NORMAL",
                baseHP: 30,
                baseAttack: 56,
                baseDefense: 35,
                baseSpeed: 72,
                baseSpAttack: 25,
                baseSpDefense: 35
            }),
            PIDGEY: createPokemonRecord({
                type1: "NORMAL",
                type2: "FLYING",
                baseHP: 40,
                baseAttack: 45,
                baseDefense: 40,
                baseSpeed: 56,
                baseSpAttack: 35,
                baseSpDefense: 35
            })
        });

    const pokemonDatabase = pokemonResult.database || pokemonResult;

    return {
        service: new TrainerAnalysisService(
            trainerDatabase,
            pokemonDatabase
        ),
        trainerCalls,
        pokemonCalls: pokemonResult.calls || []
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a TrainerAnalysisService instance", () => {
    const { service } = createService();

    assert.ok(service instanceof TrainerAnalysisService);
});

test("constructor stores the trainer database", () => {
    const trainerDatabase = { getTrainer() {} };
    const service = new TrainerAnalysisService(trainerDatabase, {});

    assert.strictEqual(service.trainerDatabase, trainerDatabase);
});

test("constructor stores the Pokémon database", () => {
    const pokemonDatabase = { getPokemon() {} };
    const service = new TrainerAnalysisService({}, pokemonDatabase);

    assert.strictEqual(service.pokemonDatabase, pokemonDatabase);
});

test("constructor preserves null database arguments", () => {
    const service = new TrainerAnalysisService(null, null);

    assert.equal(service.trainerDatabase, null);
    assert.equal(service.pokemonDatabase, null);
});

// --------------------------------------------------
// analyzeTrainer: trainer lookup
// --------------------------------------------------

test("analyzeTrainer looks up the requested trainer ID", () => {
    const { service, trainerCalls } = createService();

    service.analyzeTrainer("TRAINER_42");

    assert.deepEqual(trainerCalls, ["TRAINER_42"]);
});

test("analyzeTrainer returns null when the trainer is unknown", () => {
    const { service } = createService({
        trainerDatabase: {
            getTrainer: () => null
        }
    });

    assert.equal(service.analyzeTrainer("UNKNOWN_TRAINER"), null);
});

test("analyzeTrainer returns null when the database returns undefined", () => {
    const { service } = createService({
        trainerDatabase: {
            getTrainer: () => undefined
        }
    });

    assert.equal(service.analyzeTrainer("UNKNOWN_TRAINER"), null);
});

test("analyzeTrainer returns null when the database returns false", () => {
    const { service } = createService({ trainer: false });

    assert.equal(service.analyzeTrainer("UNKNOWN_TRAINER"), null);
});

test("analyzeTrainer propagates trainer database errors", () => {
    const service = new TrainerAnalysisService({
        getTrainer() {
            throw new Error("Trainer lookup failed");
        }
    }, { getPokemon() {} });

    assert.throws(
        () => service.analyzeTrainer("TRAINER_1"),
        /Trainer lookup failed/
    );
});

// --------------------------------------------------
// analyzeTrainer: output fields and team resolution
// --------------------------------------------------

test("analyzeTrainer returns trainer ID, name, and type", () => {
    const trainer = createTrainer();
    const { service } = createService({ trainer });

    const result = service.analyzeTrainer(trainer.id);

    assert.equal(result.id, trainer.id);
    assert.equal(result.name, trainer.trainerName);
    assert.equal(result.type, trainer.trainerType);
});

test("analyzeTrainer resolves every Pokémon in the trainer party", () => {
    const { service, pokemonCalls } = createService();

    const result = service.analyzeTrainer("TRAINER_1");

    assert.deepEqual(
        pokemonCalls,
        ["RATTATA", "PIDGEY"]
    );

    assert.equal(result.team.length, 2);
});

test("analyzeTrainer preserves party order", () => {
    const { service } = createService();

    const result = service.analyzeTrainer("TRAINER_1");

    assert.deepEqual(
        result.team.map(member => member.species),
        ["RATTATA", "PIDGEY"]
    );
});

test("analyzeTrainer preserves party species, levels, and IV values", () => {
    const trainer = createTrainer({
        party: {
            pokemon: [
                createPartyPokemon("RATTATA", 12, 20),
                createPartyPokemon("PIDGEY", 18, 31)
            ]
        }
    });

    const { service } = createService({ trainer });
    const result = service.analyzeTrainer(trainer.id);

    assert.deepEqual(
        result.team.map(({ species, level, iv }) => ({
            species,
            level,
            iv
        })),
        [
            { species: "RATTATA", level: 12, iv: 20 },
            { species: "PIDGEY", level: 18, iv: 31 }
        ]
    );
});

test("analyzeTrainer includes the resolved Pokémon database object", () => {
    const rattata = createPokemonRecord({ type1: "NORMAL" });
    const pidgey = createPokemonRecord({
        type1: "NORMAL",
        type2: "FLYING"
    });

    const { service } = createService({
        pokemonDatabase: {
            getPokemon(species) {
                return {
                    RATTATA: rattata,
                    PIDGEY: pidgey
                }[species] ?? null;
            }
        }
    });

    const result = service.analyzeTrainer("TRAINER_1");

    assert.strictEqual(result.team[0].pokemon, rattata);
    assert.strictEqual(result.team[1].pokemon, pidgey);
});

test("analyzeTrainer retains a null result for an unresolved Pokémon", () => {
    const { service } = createService({
        pokemonDatabase: { getPokemon: () => null }
    });

    const result = service.analyzeTrainer("TRAINER_1");

    assert.equal(result.team.length, 2);
    assert.equal(result.team[0].pokemon, null);
    assert.equal(result.team[1].pokemon, null);
});

test("analyzeTrainer handles an empty party", () => {
    const trainer = createTrainer({
        party: { pokemon: [] }
    });

    const { service } = createService({ trainer });
    const result = service.analyzeTrainer(trainer.id);

    assert.deepEqual(result.team, []);
    assert.equal(result.teamSize, 0);
    assert.equal(result.highestLevel, 0);
    assert.equal(result.averageLevel, 0);
    assert.deepEqual(result.types, []);
    assert.equal(result.teamPower, 0);
    assert.deepEqual(result.weaknesses, []);
    assert.equal(result.matchup, null);
});

test("analyzeTrainer handles a trainer with no party", () => {
    const trainer = createTrainer({ party: null });
    const { service } = createService({ trainer });

    const result = service.analyzeTrainer(trainer.id);

    assert.deepEqual(result.team, []);
    assert.equal(result.teamSize, 0);
    assert.equal(result.highestLevel, 0);
    assert.equal(result.averageLevel, 0);
    assert.equal(result.teamPower, 0);
});

test("analyzeTrainer omits matchup when playerTeam is empty", () => {
    const { service } = createService();

    assert.equal(
        service.analyzeTrainer("TRAINER_1", []).matchup,
        null
    );
});

test("analyzeTrainer omits matchup when playerTeam is not supplied", () => {
    const { service } = createService();

    assert.equal(
        service.analyzeTrainer("TRAINER_1").matchup,
        null
    );
});

test("analyzeTrainer calculates matchup when playerTeam is non-empty", () => {
    const { service } = createService();

    const result = service.analyzeTrainer(
        "TRAINER_1",
        [{ species: "CHARMANDER", level: 15 }]
    );

    assert.deepEqual(result.matchup, {
        playerCount: 1,
        trainerCount: 2,
        trainerPower: result.teamPower
    });
});

test("analyzeTrainer propagates Pokémon database errors", () => {
    const { service } = createService({
        pokemonDatabase: {
            getPokemon() {
                throw new Error("Pokémon lookup failed");
            }
        }
    });

    assert.throws(
        () => service.analyzeTrainer("TRAINER_1"),
        /Pokémon lookup failed/
    );
});

test("analyzeTrainer throws when the trainer database is unavailable", () => {
    const service = new TrainerAnalysisService(
        null,
        { getPokemon() { return null; } }
    );

    assert.throws(
        () => service.analyzeTrainer("TRAINER_1"),
        TypeError
    );
});

test("analyzeTrainer throws when getTrainer is not callable", () => {
    const service = new TrainerAnalysisService(
        { getTrainer: true },
        { getPokemon() { return null; } }
    );

    assert.throws(
        () => service.analyzeTrainer("TRAINER_1"),
        TypeError
    );
});

test("analyzeTrainer throws when the trainer party lacks a Pokémon array", () => {
    const trainer = createTrainer({ party: {} });
    const { service } = createService({ trainer });

    assert.throws(
        () => service.analyzeTrainer(trainer.id),
        TypeError
    );
});

// --------------------------------------------------
// getTeamSize
// --------------------------------------------------

test("getTeamSize returns the number of team members", () => {
    const { service } = createService();

    assert.equal(
        service.getTeamSize([
            { species: "PIKACHU" },
            { species: "CHARMANDER" },
            { species: "SQUIRTLE" }
        ]),
        3
    );
});

test("getTeamSize returns zero for an empty team", () => {
    assert.equal(createService().service.getTeamSize([]), 0);
});

test("getTeamSize counts unresolved Pokémon", () => {
    const { service } = createService();

    assert.equal(
        service.getTeamSize([
            { species: "UNKNOWN", pokemon: null },
            { species: "PIKACHU", pokemon: {} }
        ]),
        2
    );
});

test("getTeamSize does not change the supplied team", () => {
    const { service } = createService();
    const team = [{ species: "PIKACHU" }];
    const original = [...team];

    service.getTeamSize(team);

    assert.deepEqual(team, original);
});

test("getTeamSize throws for a missing team", () => {
    assert.throws(
        () => createService().service.getTeamSize(null),
        TypeError
    );
});

// --------------------------------------------------
// getHighestLevel
// --------------------------------------------------

test("getHighestLevel returns the highest level", () => {
    const { service } = createService();

    assert.equal(
        service.getHighestLevel([
            { level: 5 },
            { level: 22 },
            { level: 14 }
        ]),
        22
    );
});

test("getHighestLevel returns zero for an empty team", () => {
    assert.equal(createService().service.getHighestLevel([]), 0);
});

test("getHighestLevel handles a team with one member", () => {
    assert.equal(
        createService().service.getHighestLevel([{ level: 17 }]),
        17
    );
});

test("getHighestLevel handles equal levels", () => {
    assert.equal(
        createService().service.getHighestLevel([
            { level: 10 },
            { level: 10 },
            { level: 10 }
        ]),
        10
    );
});

test("getHighestLevel can handle level zero", () => {
    assert.equal(
        createService().service.getHighestLevel([
            { level: 0 },
            { level: 0 }
        ]),
        0
    );
});

test("getHighestLevel does not modify the team", () => {
    const { service } = createService();
    const team = [{ level: 5 }, { level: 20 }];
    const original = structuredClone(team);

    service.getHighestLevel(team);

    assert.deepEqual(team, original);
});

test("getHighestLevel throws for a missing team", () => {
    assert.throws(
        () => createService().service.getHighestLevel(null),
        TypeError
    );
});

// --------------------------------------------------
// getAverageLevel
// --------------------------------------------------

test("getAverageLevel calculates the average level", () => {
    assert.equal(
        createService().service.getAverageLevel([
            { level: 10 },
            { level: 20 },
            { level: 30 }
        ]),
        20
    );
});

test("getAverageLevel rounds the result to the nearest integer", () => {
    assert.equal(
        createService().service.getAverageLevel([
            { level: 10 },
            { level: 11 }
        ]),
        11
    );
});

test("getAverageLevel rounds a fractional mean downward when below the midpoint", () => {
    assert.equal(
        createService().service.getAverageLevel([
            { level: 10 },
            { level: 11 },
            { level: 11 }
        ]),
        11
    );
});

test("getAverageLevel rounds a mean ending in one half upward", () => {
    assert.equal(
        createService().service.getAverageLevel([
            { level: 10 },
            { level: 11 }
        ]),
        11
    );
});

test("getAverageLevel returns zero for an empty team", () => {
    assert.equal(createService().service.getAverageLevel([]), 0);
});

test("getAverageLevel handles a one-member team", () => {
    assert.equal(
        createService().service.getAverageLevel([{ level: 37 }]),
        37
    );
});

test("getAverageLevel handles level zero", () => {
    assert.equal(
        createService().service.getAverageLevel([
            { level: 0 },
            { level: 0 }
        ]),
        0
    );
});

test("getAverageLevel does not mutate the team", () => {
    const { service } = createService();
    const team = [{ level: 10 }, { level: 20 }];
    const original = structuredClone(team);

    service.getAverageLevel(team);

    assert.deepEqual(team, original);
});

test("getAverageLevel throws for a missing team", () => {
    assert.throws(
        () => createService().service.getAverageLevel(null),
        TypeError
    );
});

// --------------------------------------------------
// getTypes
// --------------------------------------------------

test("getTypes returns a single Pokémon type", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getTypes([
            { species: "PIKACHU", pokemon: createPokemonRecord({ type1: "ELECTRIC" }) }
        ]),
        ["ELECTRIC"]
    );
});

test("getTypes returns both types for a dual-type Pokémon", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getTypes([
            {
                species: "PIDGEY",
                pokemon: createPokemonRecord({
                    type1: "NORMAL",
                    type2: "FLYING"
                })
            }
        ]),
        ["NORMAL", "FLYING"]
    );
});

test("getTypes combines types from multiple Pokémon", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getTypes([
            { pokemon: createPokemonRecord({ type1: "NORMAL" }) },
            { pokemon: createPokemonRecord({ type1: "WATER" }) },
            { pokemon: createPokemonRecord({ type1: "ELECTRIC" }) }
        ]),
        ["NORMAL", "WATER", "ELECTRIC"]
    );
});

test("getTypes removes duplicate types", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getTypes([
            { pokemon: createPokemonRecord({ type1: "WATER" }) },
            { pokemon: createPokemonRecord({ type1: "WATER" }) },
            { pokemon: createPokemonRecord({ type1: "WATER" }) }
        ]),
        ["WATER"]
    );
});

test("getTypes preserves first-seen type order", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getTypes([
            {
                pokemon: createPokemonRecord({
                    type1: "WATER",
                    type2: "ICE"
                })
            },
            {
                pokemon: createPokemonRecord({
                    type1: "FIRE",
                    type2: "WATER"
                })
            }
        ]),
        ["WATER", "ICE", "FIRE"]
    );
});

test("getTypes skips Pokémon without a resolved database record", () => {
    assert.deepEqual(
        createService().service.getTypes([
            { species: "UNKNOWN", pokemon: null },
            { species: "PIKACHU", pokemon: createPokemonRecord({ type1: "ELECTRIC" }) }
        ]),
        ["ELECTRIC"]
    );
});

test("getTypes skips records without either type", () => {
    assert.deepEqual(
        createService().service.getTypes([
            { species: "UNKNOWN", pokemon: {} },
            { species: "PIKACHU", pokemon: null }
        ]),
        []
    );
});

test("getTypes does not include a missing second type", () => {
    assert.deepEqual(
        createService().service.getTypes([
            { pokemon: createPokemonRecord({ type1: "FIRE" }) }
        ]),
        ["FIRE"]
    );
});

test("getTypes uses exact type names without case normalization", () => {
    assert.deepEqual(
        createService().service.getTypes([
            { pokemon: createPokemonRecord({ type1: "Fire" }) },
            { pokemon: createPokemonRecord({ type1: "FIRE" }) }
        ]),
        ["Fire", "FIRE"]
    );
});

test("getTypes returns an empty array for an empty team", () => {
    assert.deepEqual(createService().service.getTypes([]), []);
});

test("getTypes throws for a missing team", () => {
    assert.throws(
        () => createService().service.getTypes(null),
        TypeError
    );
});

// --------------------------------------------------
// getTeamPower
// --------------------------------------------------

test("getTeamPower sums all six base stats", () => {
    const pokemon = createPokemonRecord({
        baseHP: 45,
        baseAttack: 49,
        baseDefense: 49,
        baseSpeed: 45,
        baseSpAttack: 65,
        baseSpDefense: 65
    });

    assert.equal(
        createService().service.getTeamPower([
            { species: "BULBASAUR", pokemon }
        ]),
        318
    );
});

test("getTeamPower adds the base stats of multiple Pokémon", () => {
    const first = createPokemonRecord({
        baseHP: 10,
        baseAttack: 20,
        baseDefense: 30,
        baseSpeed: 40,
        baseSpAttack: 50,
        baseSpDefense: 60
    });

    const second = createPokemonRecord({
        baseHP: 1,
        baseAttack: 2,
        baseDefense: 3,
        baseSpeed: 4,
        baseSpAttack: 5,
        baseSpDefense: 6
    });

    assert.equal(
        createService().service.getTeamPower([
            { pokemon: first },
            { pokemon: second }
        ]),
        231
    );
});

test("getTeamPower returns zero for an empty team", () => {
    assert.equal(createService().service.getTeamPower([]), 0);
});

test("getTeamPower ignores members without a resolved Pokémon", () => {
    const pokemon = createPokemonRecord({
        baseHP: 10,
        baseAttack: 20,
        baseDefense: 30,
        baseSpeed: 40,
        baseSpAttack: 50,
        baseSpDefense: 60
    });

    assert.equal(
        createService().service.getTeamPower([
            { species: "UNKNOWN", pokemon: null },
            { species: "KNOWN", pokemon }
        ]),
        210
    );
});

test("getTeamPower ignores all unresolved Pokémon", () => {
    assert.equal(
        createService().service.getTeamPower([
            { species: "UNKNOWN_1", pokemon: null },
            { species: "UNKNOWN_2", pokemon: undefined }
        ]),
        0
    );
});

test("getTeamPower includes zero-valued stats", () => {
    const pokemon = createPokemonRecord({
        baseHP: 0,
        baseAttack: 0,
        baseDefense: 0,
        baseSpeed: 0,
        baseSpAttack: 0,
        baseSpDefense: 0
    });

    assert.equal(
        createService().service.getTeamPower([
            { pokemon }
        ]),
        0
    );
});

test("getTeamPower does not mutate Pokémon data", () => {
    const { service } = createService();
    const pokemon = createPokemonRecord();
    const original = { ...pokemon };

    service.getTeamPower([{ pokemon }]);

    assert.deepEqual(pokemon, original);
});

test("getTeamPower throws for a missing team", () => {
    assert.throws(
        () => createService().service.getTeamPower(null),
        TypeError
    );
});

// --------------------------------------------------
// getWeaknesses
// --------------------------------------------------

test("getWeaknesses returns types for each resolved Pokémon", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getWeaknesses([
            {
                species: "PIDGEY",
                pokemon: createPokemonRecord({
                    type1: "NORMAL",
                    type2: "FLYING"
                })
            }
        ]),
        [
            {
                pokemon: "PIDGEY",
                types: ["NORMAL", "FLYING"]
            }
        ]
    );
});

test("getWeaknesses preserves team order", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getWeaknesses([
            {
                species: "RATTATA",
                pokemon: createPokemonRecord({ type1: "NORMAL" })
            },
            {
                species: "SQUIRTLE",
                pokemon: createPokemonRecord({
                    type1: "WATER"
                })
            }
        ]).map(item => item.pokemon),
        ["RATTATA", "SQUIRTLE"]
    );
});

test("getWeaknesses skips unresolved Pokémon", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getWeaknesses([
            { species: "UNKNOWN", pokemon: null },
            {
                species: "PIKACHU",
                pokemon: createPokemonRecord({ type1: "ELECTRIC" })
            }
        ]),
        [
            {
                pokemon: "PIKACHU",
                types: ["ELECTRIC", undefined]
            }
        ]
    );
});

test("getWeaknesses includes undefined when a type is absent", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getWeaknesses([
            {
                species: "PIKACHU",
                pokemon: createPokemonRecord({ type1: "ELECTRIC" })
            }
        ]),
        [
            {
                pokemon: "PIKACHU",
                types: ["ELECTRIC", undefined]
            }
        ]
    );
});

test("getWeaknesses includes two undefined types for a record without types", () => {
    assert.deepEqual(
        createService().service.getWeaknesses([
            { species: "MYSTERY", pokemon: {} }
        ]),
        [
            {
                pokemon: "MYSTERY",
                types: [undefined, undefined]
            }
        ]
    );
});

test("getWeaknesses uses the member species as the Pokémon label", () => {
    assert.deepEqual(
        createService().service.getWeaknesses([
            {
                species: "CUSTOM_NAME",
                pokemon: createPokemonRecord({ type1: "FIRE" })
            }
        ]),
        [
            {
                pokemon: "CUSTOM_NAME",
                types: ["FIRE", undefined]
            }
        ]
    );
});

test("getWeaknesses returns an empty array for an empty team", () => {
    assert.deepEqual(createService().service.getWeaknesses([]), []);
});

test("getWeaknesses does not mutate the team", () => {
    const { service } = createService();
    const team = [
        {
            species: "PIKACHU",
            pokemon: createPokemonRecord({ type1: "ELECTRIC" })
        }
    ];
    const original = structuredClone(team);

    service.getWeaknesses(team);

    assert.deepEqual(team, original);
});

test("getWeaknesses throws for a missing team", () => {
    assert.throws(
        () => createService().service.getWeaknesses(null),
        TypeError
    );
});

// --------------------------------------------------
// analyzeMatchup
// --------------------------------------------------

test("analyzeMatchup returns player and trainer team counts", () => {
    const { service } = createService();

    assert.deepEqual(
        service.analyzeMatchup(
            [{ species: "PIKACHU" }, { species: "MEW" }],
            [
                {
                    species: "RATTATA",
                    pokemon: createPokemonRecord()
                }
            ]
        ),
        {
            playerCount: 2,
            trainerCount: 1,
            trainerPower: 300
        }
    );
});

test("analyzeMatchup calculates trainer team power", () => {
    const { service } = createService();
    const pokemon = createPokemonRecord({
        baseHP: 10,
        baseAttack: 20,
        baseDefense: 30,
        baseSpeed: 40,
        baseSpAttack: 50,
        baseSpDefense: 60
    });

    assert.deepEqual(
        service.analyzeMatchup(
            [{ species: "PIKACHU" }],
            [{ species: "RATTATA", pokemon }]
        ),
        {
            playerCount: 1,
            trainerCount: 1,
            trainerPower: 210
        }
    );
});

test("analyzeMatchup returns zero trainer power for an empty trainer team", () => {
    assert.deepEqual(
        createService().service.analyzeMatchup(
            [{ species: "PIKACHU" }],
            []
        ),
        {
            playerCount: 1,
            trainerCount: 0,
            trainerPower: 0
        }
    );
});

test("analyzeMatchup returns zero player count for an empty player team", () => {
    assert.deepEqual(
        createService().service.analyzeMatchup(
            [],
            [{
                species: "RATTATA",
                pokemon: createPokemonRecord()
            }]
        ),
        {
            playerCount: 0,
            trainerCount: 1,
            trainerPower: 300
        }
    );
});

test("analyzeMatchup supports unresolved trainer Pokémon", () => {
    assert.deepEqual(
        createService().service.analyzeMatchup(
            [{ species: "PIKACHU" }],
            [{ species: "UNKNOWN", pokemon: null }]
        ),
        {
            playerCount: 1,
            trainerCount: 1,
            trainerPower: 0
        }
    );
});

test("analyzeMatchup does not mutate either input team", () => {
    const { service } = createService();
    const playerTeam = [{ species: "PIKACHU" }];
    const trainerTeam = [{
        species: "RATTATA",
        pokemon: createPokemonRecord()
    }];

    const originalPlayerTeam = structuredClone(playerTeam);
    const originalTrainerTeam = structuredClone(trainerTeam);

    service.analyzeMatchup(playerTeam, trainerTeam);

    assert.deepEqual(playerTeam, originalPlayerTeam);
    assert.deepEqual(trainerTeam, originalTrainerTeam);
});

test("analyzeMatchup throws for a missing player team", () => {
    assert.throws(
        () => createService().service.analyzeMatchup(null, []),
        TypeError
    );
});

test("analyzeMatchup throws for a missing trainer team", () => {
    assert.throws(
        () => createService().service.analyzeMatchup([], null),
        TypeError
    );
});

// --------------------------------------------------
// Combined trainer analysis
// --------------------------------------------------

test("analyzeTrainer calculates every summary field from the resolved team", () => {
    const trainer = createTrainer({
        party: {
            pokemon: [
                createPartyPokemon("RATTATA", 8),
                createPartyPokemon("PIDGEY", 12)
            ]
        }
    });

    const { service } = createService({ trainer });
    const result = service.analyzeTrainer(trainer.id);

    assert.equal(result.teamSize, 2);
    assert.equal(result.highestLevel, 12);
    assert.equal(result.averageLevel, 10);
    assert.deepEqual(result.types, ["NORMAL", "FLYING"]);
    assert.equal(result.teamPower, 504);
    assert.deepEqual(result.weaknesses, [
        {
            pokemon: "RATTATA",
            types: ["NORMAL", undefined]
        },
        {
            pokemon: "PIDGEY",
            types: ["NORMAL", "FLYING"]
        }
    ]);
});

test("analyzeTrainer includes unresolved team members in size and level summaries", () => {
    const trainer = createTrainer({
        party: {
            pokemon: [
                createPartyPokemon("UNKNOWN", 20),
                createPartyPokemon("RATTATA", 10)
            ]
        }
    });

    const { service } = createService({ trainer });
    const result = service.analyzeTrainer(trainer.id);

    assert.equal(result.teamSize, 2);
    assert.equal(result.highestLevel, 20);
    assert.equal(result.averageLevel, 15);
    assert.deepEqual(result.types, ["NORMAL"]);
    assert.equal(result.teamPower, 253);
    assert.equal(result.weaknesses.length, 1);
});

test("analyzeTrainer uses player team length for matchup count", () => {
    const { service } = createService();

    const result = service.analyzeTrainer(
        "TRAINER_1",
        [
            { species: "PIKACHU" },
            { species: "MEW" },
            { species: "SQUIRTLE" }
        ]
    );

    assert.equal(result.matchup.playerCount, 3);
    assert.equal(result.matchup.trainerCount, result.teamSize);
    assert.equal(result.matchup.trainerPower, result.teamPower);
});

test("analyzeTrainer does not modify the trainer record", () => {
    const trainer = createTrainer();
    const original = structuredClone(trainer);
    const { service } = createService({ trainer });

    service.analyzeTrainer(trainer.id);

    assert.deepEqual(trainer, original);
});

test("analyzeTrainer propagates errors when getPokemon is not callable", () => {
    const trainer = createTrainer();
    const service = new TrainerAnalysisService(
        { getTrainer: () => trainer },
        { getPokemon: true }
    );

    assert.throws(
        () => service.analyzeTrainer(trainer.id),
        TypeError
    );
});

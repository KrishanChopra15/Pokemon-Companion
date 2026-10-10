"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattlePreparationService = require(
    "../scripts/services/battle-preparation-service.js"
);

const PokemonMoveSlot = require(
    "../scripts/domain/pokemon-move-slot.js"
);

// --------------------------------
// Test helpers
// --------------------------------

function createPokemon(overrides = {}) {
    return {
        species: "BULBASAUR",
        name: "Bulbasaur",
        level: 5,
        hp: 22,
        maxHP: 22,
        attack: 10,
        defense: 12,
        spAttack: 11,
        spDefense: 12,
        speed: 9,
        moves: [],
        ...overrides
    };
}

function createTrainer(overrides = {}) {
    return {
        id: "trainer-1",
        trainerName: "Youngster Joey",
        trainerType: "TRAINER",
        trainerClass: "Youngster",
        trainerPic: "youngster",
        aiFlags: [],
        encounterMusic: "trainer",
        party: [
            createPokemon({
                species: "RATTATA",
                name: "Rattata"
            })
        ],
        ...overrides
    };
}

function createTrainerDatabase(trainers = {}) {
    return {
        getTrainer(trainerId) {
            return trainers[trainerId] ?? null;
        }
    };
}

function createService(overrides = {}) {
    return new BattlePreparationService(
        overrides.trainers ?? null,
        overrides.pokemon ?? null,
        overrides.statCalculation ?? null,
        overrides.statProvider ?? null,
        overrides.moves ?? null
    );
}

function createBasePokemon(overrides = {}) {
    return {
        name: "BULBASAUR",
        type1: { name: "grass" },
        type2: { name: "poison" },
        baseAttack: 49,
        baseDefense: 49,
        baseSpAttack: 65,
        baseSpDefense: 65,
        baseSpeed: 45,
        learnset: [],
        ...overrides
    };
}

// --------------------------------
// Constructor
// --------------------------------

test("BattlePreparationService stores its dependencies", () => {
    const trainers = {};
    const pokemon = {};
    const statCalculation = {};
    const statProvider = {};
    const moves = {};

    const service = new BattlePreparationService(
        trainers,
        pokemon,
        statCalculation,
        statProvider,
        moves
    );

    assert.equal(service.trainers, trainers);
    assert.equal(service.pokemon, pokemon);
    assert.equal(service.statCalculation, statCalculation);
    assert.equal(service.statProvider, statProvider);
    assert.equal(service.moves, moves);
});

test("BattlePreparationService supports omitted dependencies", () => {
    const service = new BattlePreparationService();

    assert.equal(service.trainers, null);
    assert.equal(service.pokemon, null);
    assert.equal(service.statCalculation, null);
    assert.equal(service.statProvider, null);
    assert.equal(service.moves, null);
});

// --------------------------------
// Trainer lookup
// --------------------------------

test("getTrainer returns null when the trainer database is unavailable", () => {
    const service = createService();

    assert.equal(service.getTrainer("trainer-1"), null);
});

test("getTrainer delegates lookup to the trainer database", () => {
    const trainer = createTrainer();
    let receivedId;

    const service = createService({
        trainers: {
            getTrainer(trainerId) {
                receivedId = trainerId;
                return trainer;
            }
        }
    });

    assert.equal(service.getTrainer("trainer-1"), trainer);
    assert.equal(receivedId, "trainer-1");
});

test("getTrainer returns null for an unknown trainer", () => {
    const service = createService({
        trainers: createTrainerDatabase()
    });

    assert.equal(service.getTrainer("missing"), null);
});

// --------------------------------
// Trainer party
// --------------------------------

test("getTrainerParty returns an empty array for an unknown trainer", () => {
    const service = createService({
        trainers: createTrainerDatabase()
    });

    assert.deepEqual(service.getTrainerParty("missing"), []);
});

test("getTrainerParty returns a trainer's array party", () => {
    const party = [
        createPokemon(),
        createPokemon({
            species: "SQUIRTLE",
            name: "Squirtle"
        })
    ];

    const service = createService({
        trainers: createTrainerDatabase({
            "trainer-1": createTrainer({ party })
        })
    });

    assert.equal(service.getTrainerParty("trainer-1"), party);
});

test("getTrainerParty supports a nested party.pokemon array", () => {
    const party = [
        createPokemon({
            species: "RATTATA",
            name: "Rattata"
        })
    ];

    const service = createService({
        trainers: createTrainerDatabase({
            "trainer-1": createTrainer({
                party: { pokemon: party }
            })
        })
    });

    assert.equal(service.getTrainerParty("trainer-1"), party);
});

test("getTrainerParty returns an empty array for an invalid party shape", () => {
    const service = createService({
        trainers: createTrainerDatabase({
            "trainer-1": createTrainer({
                party: { pokemon: "RATTATA" }
            })
        })
    });

    assert.deepEqual(service.getTrainerParty("trainer-1"), []);
});

// --------------------------------
// Player party
// --------------------------------

test("getPlayerParty returns an empty array for missing player state", () => {
    const service = createService();

    assert.deepEqual(service.getPlayerParty(null), []);
});

test("getPlayerParty prefers the pokemon array", () => {
    const pokemonParty = [createPokemon()];
    const teamParty = [
        createPokemon({
            species: "SQUIRTLE"
        })
    ];

    const service = createService();

    assert.equal(
        service.getPlayerParty({
            pokemon: pokemonParty,
            team: teamParty
        }),
        pokemonParty
    );
});

test("getPlayerParty supports the team array", () => {
    const team = [createPokemon()];
    const service = createService();

    assert.equal(
        service.getPlayerParty({ team }),
        team
    );
});

test("getPlayerParty supports the party array", () => {
    const party = [createPokemon()];
    const service = createService();

    assert.equal(
        service.getPlayerParty({ party }),
        party
    );
});

test("getPlayerParty returns an empty array when no supported array exists", () => {
    const service = createService();

    assert.deepEqual(
        service.getPlayerParty({
            pokemon: {},
            team: null,
            party: "Bulbasaur"
        }),
        []
    );
});

// --------------------------------
// Trainer battle preparation
// --------------------------------

test("prepareTrainerBattle rejects an unknown trainer", () => {
    const service = createService({
        trainers: createTrainerDatabase()
    });

    const result = service.prepareTrainerBattle(
        "missing",
        { pokemon: [createPokemon()] }
    );

    assert.deepEqual(result, {
        success: false,
        reason: "Unknown trainer"
    });
});

test("prepareTrainerBattle rejects an empty player party", () => {
    const service = createService({
        trainers: createTrainerDatabase({
            "trainer-1": createTrainer()
        })
    });

    const result = service.prepareTrainerBattle(
        "trainer-1",
        { pokemon: [] }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Player has no Pokémon");
});

test("prepareTrainerBattle rejects a trainer with no Pokémon", () => {
    const service = createService({
        trainers: createTrainerDatabase({
            "trainer-1": createTrainer({ party: [] })
        })
    });

    const result = service.prepareTrainerBattle(
        "trainer-1",
        { pokemon: [createPokemon()] }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Trainer has no Pokémon");
});

test("prepareTrainerBattle builds the trainer battle structure", () => {
    const trainer = createTrainer();
    const playerPokemon = createPokemon();
    const service = createService({
        trainers: createTrainerDatabase({
            "trainer-1": trainer
        })
    });

    const result = service.prepareTrainerBattle(
        "trainer-1",
        { pokemon: [playerPokemon] }
    );

    assert.equal(result.success, true);
    assert.equal(result.battleType, "TRAINER");
    assert.equal(result.trainerId, "trainer-1");
    assert.equal(result.trainer, trainer);

    assert.equal(result.player.active, 0);
    assert.equal(result.player.party.length, 1);
    assert.equal(result.player.party[0].sourcePokemon, playerPokemon);

    assert.equal(result.opponent.active, 0);
    assert.equal(result.opponent.party.length, 1);
    assert.equal(result.opponent.trainerClass, trainer.trainerClass);
    assert.equal(result.opponent.trainerPic, trainer.trainerPic);
    assert.equal(result.opponent.aiFlags, trainer.aiFlags);
    assert.equal(
        result.opponent.encounterMusic,
        trainer.encounterMusic
    );
});

test("prepareTrainerBattle filters invalid Pokémon from both parties", () => {
    const trainer = createTrainer({
        party: [
            null,
            createPokemon({
                species: "RATTATA",
                name: "Rattata"
            })
        ]
    });

    const service = createService({
        trainers: createTrainerDatabase({
            "trainer-1": trainer
        })
    });

    const result = service.prepareTrainerBattle(
        "trainer-1",
        {
            pokemon: [
                null,
                createPokemon()
            ]
        }
    );

    assert.equal(result.success, true);
    assert.equal(result.player.party.length, 1);
    assert.equal(result.opponent.party.length, 1);
    assert.equal(result.opponent.party[0].species, "RATTATA");
});

// --------------------------------
// preparePokemon: validation and base data
// --------------------------------

test("preparePokemon returns null for a missing Pokémon", () => {
    const service = createService();

    assert.equal(service.preparePokemon(null), null);
});

test("preparePokemon preserves incoming Pokémon fields", () => {
    const pokemon = createPokemon({
        nickname: "Leafy",
        experience: 125,
        heldItem: "ORAN_BERRY"
    });

    const service = createService();
    const result = service.preparePokemon(pokemon);

    assert.equal(result.nickname, "Leafy");
    assert.equal(result.experience, 125);
    assert.equal(result.heldItem, "ORAN_BERRY");
    assert.equal(result.sourcePokemon, pokemon);
});

test("preparePokemon does not mutate the source Pokémon", () => {
    const pokemon = createPokemon({
        type: "GRASS",
        friendship: 125,
        moves: [
            {
                name: "Tackle",
                currentPP: 10
            }
        ]
    });

    const before = structuredClone(pokemon);
    const service = createService();

    service.preparePokemon(pokemon);

    assert.deepEqual(pokemon, before);
});

test("preparePokemon retrieves base data by species", () => {
    let receivedSpecies;

    const basePokemon = createBasePokemon();

    const service = createService({
        pokemon: {
            getPokemon(species) {
                receivedSpecies = species;
                return basePokemon;
            }
        }
    });

    const result = service.preparePokemon(
        createPokemon()
    );

    assert.equal(receivedSpecies, "BULBASAUR");
    assert.equal(result.baseAttack, 49);
    assert.equal(result.baseDefense, 49);
});

test("preparePokemon prefers supplied values over base database values", () => {
    const service = createService({
        pokemon: {
            getPokemon() {
                return createBasePokemon({
                    name: "BASE_NAME",
                    baseAttack: 49
                });
            }
        }
    });

    const result = service.preparePokemon(
        createPokemon({
            name: "My Bulbasaur",
            attack: 30
        })
    );

    assert.equal(result.name, "My Bulbasaur");
    assert.equal(result.attack, 30);
});

// --------------------------------
// preparePokemon: types and levels
// --------------------------------

test("preparePokemon defaults a missing level to one", () => {
    const service = createService();

    const result = service.preparePokemon(
        createPokemon({ level: undefined })
    );

    assert.equal(result.level, 1);
});

test("preparePokemon uses the supplied types array", () => {
    const types = ["GRASS", "POISON"];
    const service = createService();

    const result = service.preparePokemon(
        createPokemon({ types })
    );

    assert.equal(result.types, types);
});

test("preparePokemon normalizes a scalar type into an array", () => {
    const service = createService();

    const result = service.preparePokemon(
        createPokemon({
            types: undefined,
            type: "FIRE"
        })
    );

    assert.deepEqual(result.types, ["FIRE"]);
    assert.equal(Object.hasOwn(result, "type"), false);
});

test("preparePokemon accepts an array supplied through type", () => {
    const types = ["WATER", "ICE"];
    const service = createService();

    const result = service.preparePokemon(
        createPokemon({
            types: undefined,
            type: types
        })
    );

    assert.equal(result.types, types);
});

test("preparePokemon derives types from base Pokémon data", () => {
    const service = createService({
        pokemon: {
            getPokemon() {
                return createBasePokemon({
                    type1: { name: "grass" },
                    type2: { name: "poison" }
                });
            }
        }
    });

    const result = service.preparePokemon(
        createPokemon({
            types: undefined,
            type: undefined
        })
    );

    assert.deepEqual(result.types, ["GRASS", "POISON"]);
});

// --------------------------------
// preparePokemon: friendship and status
// --------------------------------

test("preparePokemon defaults friendship to 70", () => {
    const service = createService();

    const result = service.preparePokemon(
        createPokemon({ friendship: undefined })
    );

    assert.equal(result.friendship, 70);
});

test("preparePokemon preserves valid friendship", () => {
    const service = createService();

    const result = service.preparePokemon(
        createPokemon({ friendship: 143 })
    );

    assert.equal(result.friendship, 143);
});

test("preparePokemon floors fractional friendship", () => {
    const service = createService();

    const result = service.preparePokemon(
        createPokemon({ friendship: 143.8 })
    );

    assert.equal(result.friendship, 143);
});

test("preparePokemon clamps friendship to the range zero through 255", () => {
    const service = createService();

    assert.equal(
        service.preparePokemon(
            createPokemon({ friendship: -10 })
        ).friendship,
        0
    );

    assert.equal(
        service.preparePokemon(
            createPokemon({ friendship: 300 })
        ).friendship,
        255
    );
});

test("preparePokemon preserves a supplied status", () => {
    const service = createService();

    const result = service.preparePokemon(
        createPokemon({ status: "PARALYSIS" })
    );

    assert.equal(result.status, "PARALYSIS");
});

test("preparePokemon defaults a missing status to null", () => {
    const service = createService();

    const result = service.preparePokemon(
        createPokemon({ status: undefined })
    );

    assert.equal(result.status, null);
});

test("preparePokemon initializes battle stat stages to zero", () => {
    const service = createService();

    const result = service.preparePokemon(
        createPokemon({
            statStages: {
                attack: 4
            }
        })
    );

    assert.deepEqual(result.statStages, {
        attack: 0,
        defense: 0,
        speed: 0,
        spAttack: 0,
        spDefense: 0,
        accuracy: 0,
        evasion: 0
    });
});

// --------------------------------
// preparePokemon: stats
// --------------------------------

test("preparePokemon uses supplied stats without a stat provider", () => {
    const service = createService();

    const result = service.preparePokemon(
        createPokemon({
            hp: 25,
            maxHP: 30,
            attack: 16,
            defense: 17,
            spAttack: 18,
            spDefense: 19,
            speed: 20
        })
    );

    assert.equal(result.hp, 25);
    assert.equal(result.maxHP, 30);
    assert.equal(result.attack, 16);
    assert.equal(result.defense, 17);
    assert.equal(result.spAttack, 18);
    assert.equal(result.spDefense, 19);
    assert.equal(result.speed, 20);
});

test("preparePokemon calculates fallback HP when incoming HP is missing", () => {
    const service = createService();

    const result = service.preparePokemon(
        createPokemon({
            level: 10,
            hp: undefined,
            maxHP: undefined
        })
    );

    assert.equal(result.hp, 40);
    assert.equal(result.maxHP, 40);
});

test("preparePokemon uses base stats when incoming stats are missing", () => {
    const service = createService({
        pokemon: {
            getPokemon() {
                return createBasePokemon();
            }
        }
    });

    const result = service.preparePokemon(
        createPokemon({
            attack: undefined,
            defense: undefined,
            spAttack: undefined,
            spDefense: undefined,
            speed: undefined
        })
    );

    assert.equal(result.attack, 49);
    assert.equal(result.defense, 49);
    assert.equal(result.spAttack, 65);
    assert.equal(result.spDefense, 65);
    assert.equal(result.speed, 45);
});

test("preparePokemon uses fallback value one when no stat is available", () => {
    const service = createService();

    const result = service.preparePokemon(
        createPokemon({
            hp: undefined,
            maxHP: undefined,
            attack: undefined,
            defense: undefined,
            spAttack: undefined,
            spDefense: undefined,
            speed: undefined
        })
    );

    assert.equal(result.attack, 1);
    assert.equal(result.defense, 1);
    assert.equal(result.spAttack, 1);
    assert.equal(result.spDefense, 1);
    assert.equal(result.speed, 1);
});

test("preparePokemon requests exact stats from the stat provider", () => {
    const pokemon = createPokemon();
    let receivedPokemon;
    let receivedMode;

    const service = createService({
        statProvider: {
            getBattleStats(prepared, mode) {
                receivedPokemon = prepared;
                receivedMode = mode;

                return {
                    hp: 35,
                    attack: 20,
                    defense: 21,
                    spAttack: 22,
                    spDefense: 23,
                    speed: 24
                };
            }
        }
    });

    const result = service.preparePokemon(pokemon);

    assert.equal(receivedPokemon.species, "BULBASAUR");
    assert.equal(receivedMode, "EXACT");
    assert.equal(result.hp, 22);
    assert.equal(result.maxHP, 22);
    assert.equal(result.attack, 20);
    assert.equal(result.defense, 21);
    assert.equal(result.spAttack, 22);
    assert.equal(result.spDefense, 23);
    assert.equal(result.speed, 24);
});

test("preparePokemon uses provider HP when incoming HP is missing", () => {
    const service = createService({
        statProvider: {
            getBattleStats() {
                return {
                    hp: 35,
                    attack: 10,
                    defense: 10,
                    spAttack: 10,
                    spDefense: 10,
                    speed: 10
                };
            }
        }
    });

    const result = service.preparePokemon(
        createPokemon({
            hp: undefined,
            maxHP: undefined
        })
    );

    assert.equal(result.hp, 35);
    assert.equal(result.maxHP, 35);
});

test("preparePokemon uses one as a fallback for missing provider stats", () => {
    const service = createService({
        statProvider: {
            getBattleStats() {
                return {};
            }
        }
    });

    const result = service.preparePokemon(
        createPokemon({
            hp: undefined,
            maxHP: undefined
        })
    );

    assert.equal(result.hp, 1);
    assert.equal(result.maxHP, 1);
    assert.equal(result.attack, 1);
    assert.equal(result.defense, 1);
    assert.equal(result.spAttack, 1);
    assert.equal(result.spDefense, 1);
    assert.equal(result.speed, 1);
});

// --------------------------------
// prepareMove
// --------------------------------

test("prepareMove returns null for a missing move", () => {
    const service = createService();

    assert.equal(service.prepareMove(null), null);
});

test("prepareMove returns null when no move constant can be resolved", () => {
    const service = createService();

    assert.equal(
        service.prepareMove({}),
        null
    );
});

test("prepareMove preserves an existing move constant", () => {
    const service = createService();

    const result = service.prepareMove({
        constant: "MOVE_TACKLE",
        name: "Tackle",
        currentPP: 10
    });

    assert.ok(result instanceof PokemonMoveSlot);
    assert.equal(result.constant, "MOVE_TACKLE");
    assert.equal(result.name, "Tackle");
});

test("prepareMove resolves the constant from nested move data", () => {
    const service = createService();

    const result = service.prepareMove({
        move: {
            constant: "MOVE_GROWL"
        },
        currentPP: 10
    });

    assert.ok(result instanceof PokemonMoveSlot);
    assert.equal(result.constant, "MOVE_GROWL");
});

test("prepareMove builds a constant from a move name", () => {
    const service = createService();

    const result = service.prepareMove({
        name: "tackle",
        currentPP: 10
    });

    assert.equal(result.constant, "MOVE_TACKLE");
});

test("prepareMove does not add another prefix to a MOVE_ name", () => {
    const service = createService();

    const result = service.prepareMove({
        name: "MOVE_TACKLE",
        currentPP: 10
    });

    assert.equal(result.constant, "MOVE_TACKLE");
});

test("prepareMove reads metadata from the move database", () => {
    let requestedConstant;

    const service = createService({
        moves: {
            getMoveByConstant(constant) {
                requestedConstant = constant;

                return {
                    name: "Tackle",
                    type: "NORMAL",
                    category: "PHYSICAL",
                    power: 40,
                    accuracy: 100,
                    pp: 35,
                    effect: null
                };
            }
        }
    });

    const result = service.prepareMove({
        constant: "MOVE_TACKLE",
        currentPP: 10
    });

    assert.equal(requestedConstant, "MOVE_TACKLE");
    assert.equal(result.name, "Tackle");
    assert.equal(result.type, "NORMAL");
    assert.equal(result.category, "PHYSICAL");
    assert.equal(result.power, 40);
    assert.equal(result.accuracy, 100);
});

test("prepareMove uses fallback metadata when no database move exists", () => {
    const service = createService();

    const result = service.prepareMove({
        name: "Tackle",
        type: "FIGHTING",
        category: "PHYSICAL",
        power: 50,
        accuracy: 90,
        effect: "TEST_EFFECT",
        currentPP: 7
    });

    assert.equal(result.name, "Tackle");
    assert.equal(result.type, "FIGHTING");
    assert.equal(result.category, "PHYSICAL");
    assert.equal(result.power, 50);
    assert.equal(result.accuracy, 90);
    assert.equal(result.effect, "TEST_EFFECT");
});

test("prepareMove applies default metadata where fields are missing", () => {
    const service = createService();

    const result = service.prepareMove({
        name: "Tackle",
        currentPP: 10
    });

    assert.equal(result.type, "NORMAL");
    assert.equal(result.category, "PHYSICAL");
    assert.equal(result.power, 0);
    assert.equal(result.accuracy, 100);
    assert.equal(result.effect, null);
});

test("prepareMove preserves target, priority, and flags", () => {
    const service = createService();

    const flags = ["CONTACT"];

    const result = service.prepareMove({
        name: "Tackle",
        currentPP: 10,
        target: "NEAR_OTHER",
        priority: 1,
        flags
    });

    assert.equal(result.target, "NEAR_OTHER");
    assert.equal(result.priority, 1);
    assert.equal(result.flags, flags);
});

// --------------------------------
// Move PP resolution
// --------------------------------

test("resolveBasePP prefers the move's basePP", () => {
    const service = createService();

    assert.equal(
        service.resolveBasePP(
            { basePP: 15 },
            { pp: 35 }
        ),
        15
    );
});

test("resolveBasePP falls back to database PP", () => {
    const service = createService();

    assert.equal(
        service.resolveBasePP(
            {},
            { pp: 35 }
        ),
        35
    );
});

test("resolveBasePP floors fractional values", () => {
    const service = createService();

    assert.equal(
        service.resolveBasePP(
            { basePP: 12.8 },
            null
        ),
        12
    );
});

test("resolveBasePP ignores negative values and uses the default", () => {
    const service = createService();

    assert.equal(
        service.resolveBasePP(
            { basePP: -1 },
            { pp: -5 }
        ),
        20
    );
});

test("resolveBasePP defaults to 20 when no valid value exists", () => {
    const service = createService();

    assert.equal(
        service.resolveBasePP({}, null),
        20
    );
});

test("resolvePPUps clamps explicit PP Ups between zero and three", () => {
    const service = createService();

    assert.equal(
        service.resolvePPUps({ ppUps: -2 }, 20),
        0
    );

    assert.equal(
        service.resolvePPUps({ ppUps: 2.8 }, 20),
        2
    );

    assert.equal(
        service.resolvePPUps({ ppUps: 10 }, 20),
        3
    );
});

test("resolvePPUps infers PP Ups from stored maximum PP", () => {
    const service = createService();

    assert.equal(
        service.resolvePPUps(
            {
                maxPP: 42
            },
            35
        ),
        1
    );
});

test("resolvePPUps returns zero when no PP Ups can be inferred", () => {
    const service = createService();

    assert.equal(
        service.resolvePPUps({}, 35),
        0
    );

    assert.equal(
        service.resolvePPUps({ maxPP: 50 }, 0),
        0
    );
});

test("resolveCurrentPP prioritizes currentPP", () => {
    const service = createService();

    assert.equal(
        service.resolveCurrentPP(
            {
                currentPP: 5,
                pp: 15
            },
            20,
            0
        ),
        5
    );
});

test("resolveCurrentPP falls back to legacy PP", () => {
    const service = createService();

    assert.equal(
        service.resolveCurrentPP(
            {
                pp: 12
            },
            20,
            0
        ),
        12
    );
});

test("resolveCurrentPP clamps negative PP to zero", () => {
    const service = createService();

    assert.equal(
        service.resolveCurrentPP(
            {
                currentPP: -5
            },
            20,
            0
        ),
        0
    );
});

test("resolveCurrentPP calculates PP for a new move", () => {
    const service = createService();

    assert.equal(
        service.resolveCurrentPP(
            {},
            20,
            2
        ),
        28
    );
});

// --------------------------------
// Friendship and move category
// --------------------------------

test("resolveFriendship defaults invalid friendship to 70", () => {
    const service = createService();

    assert.equal(
        service.resolveFriendship({ friendship: "invalid" }),
        70
    );
});

test("resolveFriendship clamps and floors values", () => {
    const service = createService();

    assert.equal(
        service.resolveFriendship({ friendship: -5 }),
        0
    );

    assert.equal(
        service.resolveFriendship({ friendship: 300 }),
        255
    );

    assert.equal(
        service.resolveFriendship({ friendship: 100.9 }),
        100
    );
});

test("getMoveCategory defaults missing types to PHYSICAL", () => {
    const service = createService();

    assert.equal(service.getMoveCategory(null), "PHYSICAL");
    assert.equal(service.getMoveCategory(""), "PHYSICAL");
});

test("getMoveCategory identifies Generation III special types", () => {
    const service = createService();

    for (const type of [
        "FIRE",
        "WATER",
        "GRASS",
        "ELECTRIC",
        "ICE",
        "PSYCHIC",
        "DRAGON",
        "DARK"
    ]) {
        assert.equal(
            service.getMoveCategory(type),
            "SPECIAL",
            `${type} should be SPECIAL`
        );
    }
});

test("getMoveCategory treats other types as PHYSICAL", () => {
    const service = createService();

    for (const type of [
        "NORMAL",
        "FIGHTING",
        "FLYING",
        "POISON",
        "GROUND",
        "ROCK",
        "BUG",
        "GHOST",
        "STEEL"
    ]) {
        assert.equal(
            service.getMoveCategory(type),
            "PHYSICAL",
            `${type} should be PHYSICAL`
        );
    }
});

test("getMoveCategory ignores type letter case", () => {
    const service = createService();

    assert.equal(
        service.getMoveCategory("water"),
        "SPECIAL"
    );

    assert.equal(
        service.getMoveCategory("normal"),
        "PHYSICAL"
    );
});

// --------------------------------
// Battle readiness and summary
// --------------------------------

test("canBattle returns false for an unknown trainer", () => {
    const service = createService({
        trainers: createTrainerDatabase()
    });

    assert.equal(
        service.canBattle(
            "missing",
            { pokemon: [createPokemon()] }
        ),
        false
    );
});

test("canBattle returns false when the player party is empty", () => {
    const service = createService({
        trainers: createTrainerDatabase({
            "trainer-1": createTrainer()
        })
    });

    assert.equal(
        service.canBattle(
            "trainer-1",
            { pokemon: [] }
        ),
        false
    );
});

test("canBattle returns true when both trainer and player parties are available", () => {
    const service = createService({
        trainers: createTrainerDatabase({
            "trainer-1": createTrainer()
        })
    });

    assert.equal(
        service.canBattle(
            "trainer-1",
            { pokemon: [createPokemon()] }
        ),
        true
    );
});

test("getBattleSummary returns null for an unknown trainer", () => {
    const service = createService({
        trainers: createTrainerDatabase()
    });

    assert.equal(
        service.getBattleSummary("missing"),
        null
    );
});

test("getBattleSummary returns trainer metadata and party", () => {
    const trainer = createTrainer();
    const service = createService({
        trainers: createTrainerDatabase({
            "trainer-1": trainer
        })
    });

    const result = service.getBattleSummary("trainer-1");

    assert.deepEqual(result, {
        trainerId: "trainer-1",
        name: trainer.trainerName,
        type: trainer.trainerType,
        class: trainer.trainerClass,
        party: trainer.party
    });
});

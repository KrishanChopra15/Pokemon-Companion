"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const RewardService = require("../scripts/services/reward-service");

function createService(pokemonDatabase = null) {
    return new RewardService(pokemonDatabase);
}

function createTrainerState(overrides = {}) {
    const calls = {
        items: [],
        pokemon: [],
        money: [],
        storyFlags: [],
        hmAbilities: [],
        removedStoryFlags: [],
        battles: [],
        getState: 0,
        serialize: 0
    };

    const trainerState = {
        addItem(name, quantity) {
            calls.items.push({ name, quantity });
        },

        addPokemon(pokemon) {
            calls.pokemon.push(pokemon);
        },

        addMoney(amount) {
            calls.money.push(amount);
        },

        addStoryFlag(flag) {
            calls.storyFlags.push(flag);
        },

        addHMAbility(ability) {
            calls.hmAbilities.push(ability);
        },

        removeStoryFlag(flag) {
            calls.removedStoryFlags.push(flag);
        },

        completeBattle(battle) {
            calls.battles.push(battle);
        },

        getState() {
            calls.getState++;
            return { trainer: "state" };
        },

        serialize() {
            calls.serialize++;
            return { trainer: "serialized" };
        },

        ...overrides
    };

    return { trainerState, calls };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a RewardService instance", () => {
    assert.ok(createService() instanceof RewardService);
});

test("constructor defaults the Pokémon database to null", () => {
    assert.equal(createService().pokemonDatabase, null);
});

test("constructor stores the supplied Pokémon database", () => {
    const database = {
        getBaseFriendship() {
            return 80;
        }
    };

    assert.strictEqual(createService(database).pokemonDatabase, database);
});

test("constructor preserves a zero-like database argument", () => {
    const service = createService(0);

    assert.equal(service.pokemonDatabase, 0);
});

// --------------------------------------------------
// execute: validation
// --------------------------------------------------

test("execute rejects missing rewards", () => {
    assert.deepEqual(createService().execute(null, {}), {
        success: false,
        reason: "No rewards"
    });
});

test("execute rejects undefined rewards", () => {
    assert.deepEqual(createService().execute(undefined, {}), {
        success: false,
        reason: "No rewards"
    });
});

test("execute rejects false rewards", () => {
    assert.equal(
        createService().execute(false, {}).reason,
        "No rewards"
    );
});

test("execute rejects zero rewards", () => {
    assert.equal(
        createService().execute(0, {}).reason,
        "No rewards"
    );
});

test("execute checks rewards before trainer state", () => {
    assert.equal(
        createService().execute(null, null).reason,
        "No rewards"
    );
});

test("execute rejects a missing trainer state", () => {
    assert.deepEqual(createService().execute({}, null), {
        success: false,
        reason: "Missing trainer state"
    });
});

test("execute rejects undefined trainer state", () => {
    assert.equal(
        createService().execute({}, undefined).reason,
        "Missing trainer state"
    );
});

test("execute rejects false trainer state", () => {
    assert.equal(
        createService().execute({}, false).reason,
        "Missing trainer state"
    );
});

// --------------------------------------------------
// execute: items
// --------------------------------------------------

test("execute grants an item with its specified quantity", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addItems: [{ name: "POTION", quantity: 5 }]
    }, trainerState);

    assert.deepEqual(calls.items, [
        { name: "POTION", quantity: 5 }
    ]);
});

test("execute defaults an omitted item quantity to one", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addItems: [{ name: "POTION" }]
    }, trainerState);

    assert.deepEqual(calls.items, [
        { name: "POTION", quantity: 1 }
    ]);
});

test("execute defaults a zero item quantity to one", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addItems: [{ name: "POTION", quantity: 0 }]
    }, trainerState);

    assert.deepEqual(calls.items, [
        { name: "POTION", quantity: 1 }
    ]);
});

test("execute preserves a negative item quantity", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addItems: [{ name: "POTION", quantity: -2 }]
    }, trainerState);

    assert.deepEqual(calls.items, [
        { name: "POTION", quantity: -2 }
    ]);
});

test("execute grants multiple items in order", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addItems: [
            { name: "POTION", quantity: 2 },
            { name: "POKE_BALL", quantity: 3 },
            { name: "ANTIDOTE" }
        ]
    }, trainerState);

    assert.deepEqual(calls.items, [
        { name: "POTION", quantity: 2 },
        { name: "POKE_BALL", quantity: 3 },
        { name: "ANTIDOTE", quantity: 1 }
    ]);
});

test("execute skips falsey item entries", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addItems: [
            null,
            undefined,
            false,
            0,
            "",
            { name: "POTION" }
        ]
    }, trainerState);

    assert.deepEqual(calls.items, [
        { name: "POTION", quantity: 1 }
    ]);
});

test("execute accepts an item without a name", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addItems: [{}]
    }, trainerState);

    assert.deepEqual(calls.items, [
        { name: undefined, quantity: 1 }
    ]);
});

test("execute does not grant items when addItems is absent", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({}, trainerState);

    assert.deepEqual(calls.items, []);
});

// --------------------------------------------------
// execute: Pokémon rewards
// --------------------------------------------------

test("execute grants a Pokémon reward", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addPokemon: [{ species: "PIKACHU", level: 10 }]
    }, trainerState);

    assert.equal(calls.pokemon.length, 1);
    assert.equal(calls.pokemon[0].species, "PIKACHU");
    assert.equal(calls.pokemon[0].level, 10);
});

test("execute skips null Pokémon rewards", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addPokemon: [null, { species: "PIKACHU" }]
    }, trainerState);

    assert.equal(calls.pokemon.length, 1);
    assert.equal(calls.pokemon[0].species, "PIKACHU");
});

test("execute skips Pokémon rewards without a species", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addPokemon: [
            {},
            { species: null },
            { species: "" },
            { species: "PIKACHU" }
        ]
    }, trainerState);

    assert.equal(calls.pokemon.length, 1);
    assert.equal(calls.pokemon[0].species, "PIKACHU");
});

test("execute grants multiple Pokémon in order", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addPokemon: [
            { species: "PIKACHU" },
            { species: "CHARMANDER" },
            { species: "SQUIRTLE" }
        ]
    }, trainerState);

    assert.deepEqual(
        calls.pokemon.map(pokemon => pokemon.species),
        ["PIKACHU", "CHARMANDER", "SQUIRTLE"]
    );
});

test("execute does not grant Pokémon when addPokemon is absent", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({}, trainerState);

    assert.deepEqual(calls.pokemon, []);
});

// --------------------------------------------------
// execute: money
// --------------------------------------------------

test("execute grants a money reward", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addMoney: 500
    }, trainerState);

    assert.deepEqual(calls.money, [500]);
});

test("execute does not grant money when the amount is zero", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addMoney: 0
    }, trainerState);

    assert.deepEqual(calls.money, []);
});

test("execute does not grant money when the amount is absent", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({}, trainerState);

    assert.deepEqual(calls.money, []);
});

test("execute preserves a negative money amount", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addMoney: -100
    }, trainerState);

    assert.deepEqual(calls.money, [-100]);
});

// --------------------------------------------------
// execute: story flags
// --------------------------------------------------

test("execute adds story flags", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addStoryFlags: ["GOT_POKEDEX", "MET_PROFESSOR"]
    }, trainerState);

    assert.deepEqual(calls.storyFlags, [
        "GOT_POKEDEX",
        "MET_PROFESSOR"
    ]);
});

test("execute preserves story flag order", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addStoryFlags: ["FLAG_1", "FLAG_2", "FLAG_3"]
    }, trainerState);

    assert.deepEqual(calls.storyFlags, [
        "FLAG_1",
        "FLAG_2",
        "FLAG_3"
    ]);
});

test("execute passes falsey story flag entries to trainer state", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        addStoryFlags: ["FLAG_1", "", null, false, "FLAG_2"]
    }, trainerState);

    assert.deepEqual(calls.storyFlags, [
        "FLAG_1",
        "",
        null,
        false,
        "FLAG_2"
    ]);
});

// --------------------------------------------------
// execute: HM abilities
// --------------------------------------------------

test("execute adds HM abilities", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        hmAbilities: ["CAN_USE_CUT", "CAN_USE_SURF"]
    }, trainerState);

    assert.deepEqual(calls.hmAbilities, [
        "CAN_USE_CUT",
        "CAN_USE_SURF"
    ]);
});

test("execute skips falsey HM ability entries", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        hmAbilities: [
            null,
            undefined,
            false,
            0,
            "",
            "CAN_USE_FLY"
        ]
    }, trainerState);

    assert.deepEqual(calls.hmAbilities, ["CAN_USE_FLY"]);
});

// --------------------------------------------------
// execute: remove story flags
// --------------------------------------------------

test("execute removes story flags", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        removeStoryFlags: ["TEMP_FLAG", "OLD_EVENT_FLAG"]
    }, trainerState);

    assert.deepEqual(calls.removedStoryFlags, [
        "TEMP_FLAG",
        "OLD_EVENT_FLAG"
    ]);
});

test("execute preserves falsey entries in the story flag removal list", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        removeStoryFlags: ["FLAG_1", "", null, false]
    }, trainerState);

    assert.deepEqual(calls.removedStoryFlags, [
        "FLAG_1",
        "",
        null,
        false
    ]);
});

// --------------------------------------------------
// execute: battles
// --------------------------------------------------

test("execute records completed battles", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        battles: ["RIVAL_1", "GYM_BROCK"]
    }, trainerState);

    assert.deepEqual(calls.battles, [
        "RIVAL_1",
        "GYM_BROCK"
    ]);
});

test("execute preserves battle order", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        battles: ["BATTLE_1", "BATTLE_2", "BATTLE_3"]
    }, trainerState);

    assert.deepEqual(calls.battles, [
        "BATTLE_1",
        "BATTLE_2",
        "BATTLE_3"
    ]);
});

test("execute passes falsey battle entries to trainer state", () => {
    const { trainerState, calls } = createTrainerState();

    createService().execute({
        battles: ["BATTLE_1", "", null, false, "BATTLE_2"]
    }, trainerState);

    assert.deepEqual(calls.battles, [
        "BATTLE_1",
        "",
        null,
        false,
        "BATTLE_2"
    ]);
});

// --------------------------------------------------
// execute: returned trainer state
// --------------------------------------------------

test("execute returns success for empty rewards", () => {
    const { trainerState } = createTrainerState();

    assert.equal(
        createService().execute({}, trainerState).success,
        true
    );
});

test("execute returns getState when available", () => {
    const { trainerState, calls } = createTrainerState();

    const result = createService().execute({}, trainerState);

    assert.deepEqual(result, {
        success: true,
        state: { trainer: "state" }
    });
    assert.equal(calls.getState, 1);
    assert.equal(calls.serialize, 0);
});

test("execute prefers getState over serialize", () => {
    const { trainerState, calls } = createTrainerState();

    const result = createService().execute({}, trainerState);

    assert.deepEqual(result.state, { trainer: "state" });
    assert.equal(calls.getState, 1);
    assert.equal(calls.serialize, 0);
});

test("execute uses serialize when getState is unavailable", () => {
    const { trainerState, calls } = createTrainerState({
        getState: undefined
    });

    const result = createService().execute({}, trainerState);

    assert.deepEqual(result, {
        success: true,
        state: { trainer: "serialized" }
    });
    assert.equal(calls.serialize, 1);
});

test("execute returns trainer state when neither serializer exists", () => {
    const trainerState = {
        marker: "original"
    };

    const result = createService().execute({}, trainerState);

    assert.equal(result.success, true);
    assert.strictEqual(result.state, trainerState);
});

test("execute propagates errors from getState", () => {
    const { trainerState } = createTrainerState({
        getState() {
            throw new Error("State retrieval failed");
        }
    });

    assert.throws(
        () => createService().execute({}, trainerState),
        /State retrieval failed/
    );
});

test("execute propagates errors from serialize", () => {
    const { trainerState } = createTrainerState({
        getState: undefined,
        serialize() {
            throw new Error("Serialization failed");
        }
    });

    assert.throws(
        () => createService().execute({}, trainerState),
        /Serialization failed/
    );
});

// --------------------------------------------------
// execute: processing order
// --------------------------------------------------

test("execute processes reward categories in implementation order", () => {
    const order = [];

    const trainerState = {
        addItem() {
            order.push("item");
        },
        addPokemon() {
            order.push("pokemon");
        },
        addMoney() {
            order.push("money");
        },
        addStoryFlag() {
            order.push("storyFlag");
        },
        addHMAbility() {
            order.push("hmAbility");
        },
        removeStoryFlag() {
            order.push("removeStoryFlag");
        },
        completeBattle() {
            order.push("battle");
        },
        getState() {
            order.push("getState");
            return {};
        }
    };

    createService().execute({
        addItems: [{ name: "POTION" }],
        addPokemon: [{ species: "PIKACHU" }],
        addMoney: 100,
        addStoryFlags: ["FLAG_1"],
        hmAbilities: ["CAN_USE_CUT"],
        removeStoryFlags: ["FLAG_2"],
        battles: ["BATTLE_1"]
    }, trainerState);

    assert.deepEqual(order, [
        "item",
        "pokemon",
        "money",
        "storyFlag",
        "hmAbility",
        "removeStoryFlag",
        "battle",
        "getState"
    ]);
});

test("execute propagates errors from reward handlers", () => {
    const trainerState = {
        addItem() {
            throw new Error("Item handler failed");
        }
    };

    assert.throws(
        () => createService().execute({
            addItems: [{ name: "POTION" }]
        }, trainerState),
        /Item handler failed/
    );
});

// --------------------------------------------------
// createRewardPokemon
// --------------------------------------------------

test("createRewardPokemon preserves the species", () => {
    assert.equal(
        createService().createRewardPokemon({ species: "PIKACHU" }).species,
        "PIKACHU"
    );
});

test("createRewardPokemon defaults the level to one", () => {
    assert.equal(
        createService().createRewardPokemon({ species: "PIKACHU" }).level,
        1
    );
});

test("createRewardPokemon preserves a specified level", () => {
    assert.equal(
        createService().createRewardPokemon({
            species: "PIKACHU",
            level: 25
        }).level,
        25
    );
});

test("createRewardPokemon defaults a zero level to one", () => {
    assert.equal(
        createService().createRewardPokemon({
            species: "PIKACHU",
            level: 0
        }).level,
        1
    );
});

test("createRewardPokemon defaults friendship to base friendship", () => {
    assert.equal(
        createService().createRewardPokemon({ species: "PIKACHU" }).friendship,
        70
    );
});

test("createRewardPokemon uses friendship from the Pokémon database", () => {
    const database = {
        getBaseFriendship(species) {
            assert.equal(species, "PIKACHU");
            return 90;
        }
    };

    assert.equal(
        createService(database).createRewardPokemon({
            species: "PIKACHU"
        }).friendship,
        90
    );
});

test("createRewardPokemon preserves explicitly supplied friendship", () => {
    assert.equal(
        createService().createRewardPokemon({
            species: "PIKACHU",
            friendship: 120
        }).friendship,
        120
    );
});

test("createRewardPokemon preserves zero friendship", () => {
    assert.equal(
        createService().createRewardPokemon({
            species: "PIKACHU",
            friendship: 0
        }).friendship,
        0
    );
});

test("createRewardPokemon preserves null friendship", () => {
    assert.equal(
        createService().createRewardPokemon({
            species: "PIKACHU",
            friendship: null
        }).friendship,
        null
    );
});

test("createRewardPokemon defaults nickname to null", () => {
    assert.equal(
        createService().createRewardPokemon({ species: "PIKACHU" }).nickname,
        null
    );
});

test("createRewardPokemon preserves a nickname", () => {
    assert.equal(
        createService().createRewardPokemon({
            species: "PIKACHU",
            nickname: "SPARKY"
        }).nickname,
        "SPARKY"
    );
});

test("createRewardPokemon converts an empty nickname to null", () => {
    assert.equal(
        createService().createRewardPokemon({
            species: "PIKACHU",
            nickname: ""
        }).nickname,
        null
    );
});

test("createRewardPokemon defaults experience to zero", () => {
    assert.equal(
        createService().createRewardPokemon({ species: "PIKACHU" }).exp,
        0
    );
});

test("createRewardPokemon preserves experience", () => {
    assert.equal(
        createService().createRewardPokemon({
            species: "PIKACHU",
            exp: 1250
        }).exp,
        1250
    );
});

test("createRewardPokemon defaults falsey experience to zero", () => {
    assert.equal(
        createService().createRewardPokemon({
            species: "PIKACHU",
            exp: 0
        }).exp,
        0
    );
});

test("createRewardPokemon defaults moves to an empty array", () => {
    assert.deepEqual(
        createService().createRewardPokemon({ species: "PIKACHU" }).moves,
        []
    );
});

test("createRewardPokemon preserves the supplied moves array", () => {
    const moves = ["THUNDERBOLT", "QUICK_ATTACK"];

    const pokemon = createService().createRewardPokemon({
        species: "PIKACHU",
        moves
    });

    assert.strictEqual(pokemon.moves, moves);
});

test("createRewardPokemon uses an empty array for non-array moves", () => {
    for (const moves of ["THUNDERBOLT", {}, null, 10]) {
        assert.deepEqual(
            createService().createRewardPokemon({
                species: "PIKACHU",
                moves
            }).moves,
            []
        );
    }
});

test("createRewardPokemon defaults ball to null", () => {
    assert.equal(
        createService().createRewardPokemon({ species: "PIKACHU" }).ball,
        null
    );
});

test("createRewardPokemon preserves the supplied ball", () => {
    assert.equal(
        createService().createRewardPokemon({
            species: "PIKACHU",
            ball: "GREAT_BALL"
        }).ball,
        "GREAT_BALL"
    );
});

test("createRewardPokemon converts a falsey ball to null", () => {
    assert.equal(
        createService().createRewardPokemon({
            species: "PIKACHU",
            ball: ""
        }).ball,
        null
    );
});

test("createRewardPokemon defaults locations to null", () => {
    const pokemon = createService().createRewardPokemon({
        species: "PIKACHU"
    });

    assert.equal(pokemon.metLocation, null);
    assert.equal(pokemon.location, null);
});

test("createRewardPokemon preserves metLocation and location independently", () => {
    const pokemon = createService().createRewardPokemon({
        species: "PIKACHU",
        metLocation: "VIRIDIAN_FOREST",
        location: "PEWTER_CITY"
    });

    assert.equal(pokemon.metLocation, "VIRIDIAN_FOREST");
    assert.equal(pokemon.location, "PEWTER_CITY");
});

test("createRewardPokemon falls back to location for metLocation", () => {
    const pokemon = createService().createRewardPokemon({
        species: "PIKACHU",
        location: "PEWTER_CITY"
    });

    assert.equal(pokemon.metLocation, "PEWTER_CITY");
    assert.equal(pokemon.location, "PEWTER_CITY");
});

test("createRewardPokemon prioritizes metLocation over location", () => {
    const pokemon = createService().createRewardPokemon({
        species: "PIKACHU",
        metLocation: "VIRIDIAN_FOREST",
        location: "PEWTER_CITY"
    });

    assert.equal(pokemon.metLocation, "VIRIDIAN_FOREST");
});

test("createRewardPokemon uses null when both location fields are falsey", () => {
    const pokemon = createService().createRewardPokemon({
        species: "PIKACHU",
        metLocation: "",
        location: ""
    });

    assert.equal(pokemon.metLocation, null);
    assert.equal(pokemon.location, null);
});

test("createRewardPokemon returns only the expected fields", () => {
    const pokemon = createService().createRewardPokemon({
        species: "PIKACHU",
        level: 10,
        friendship: 80,
        nickname: "SPARKY",
        exp: 100,
        moves: ["THUNDERBOLT"],
        ball: "POKE_BALL",
        metLocation: "PALLET_TOWN",
        location: "PALLET_TOWN",
        extraField: "ignored"
    });

    assert.deepEqual(pokemon, {
        species: "PIKACHU",
        level: 10,
        friendship: 80,
        nickname: "SPARKY",
        exp: 100,
        moves: ["THUNDERBOLT"],
        ball: "POKE_BALL",
        metLocation: "PALLET_TOWN",
        location: "PALLET_TOWN"
    });
});

// --------------------------------------------------
// getBaseFriendship
// --------------------------------------------------

test("getBaseFriendship returns the default value when no database exists", () => {
    assert.equal(createService().getBaseFriendship("PIKACHU"), 70);
});

test("getBaseFriendship uses the Pokémon database method", () => {
    const database = {
        getBaseFriendship() {
            return 100;
        }
    };

    assert.equal(createService(database).getBaseFriendship("MEW"), 100);
});

test("getBaseFriendship passes the species to the database", () => {
    let receivedSpecies;

    const database = {
        getBaseFriendship(species) {
            receivedSpecies = species;
            return 50;
        }
    };

    createService(database).getBaseFriendship("CHARMANDER");

    assert.equal(receivedSpecies, "CHARMANDER");
});

test("getBaseFriendship falls back when the database returns null", () => {
    const database = {
        getBaseFriendship() {
            return null;
        }
    };

    assert.equal(createService(database).getBaseFriendship("PIKACHU"), 70);
});

test("getBaseFriendship falls back when the database returns undefined", () => {
    const database = {
        getBaseFriendship() {
            return undefined;
        }
    };

    assert.equal(createService(database).getBaseFriendship("PIKACHU"), 70);
});

test("getBaseFriendship preserves zero returned by the database", () => {
    const database = {
        getBaseFriendship() {
            return 0;
        }
    };

    assert.equal(createService(database).getBaseFriendship("PIKACHU"), 0);
});

test("getBaseFriendship preserves false returned by the database", () => {
    const database = {
        getBaseFriendship() {
            return false;
        }
    };

    assert.equal(createService(database).getBaseFriendship("PIKACHU"), false);
});

test("getBaseFriendship falls back when the database method is missing", () => {
    assert.equal(
        createService({}).getBaseFriendship("PIKACHU"),
        70
    );
});

test("getBaseFriendship falls back when the database method is not a function", () => {
    assert.equal(
        createService({ getBaseFriendship: true }).getBaseFriendship("PIKACHU"),
        70
    );
});

test("getBaseFriendship propagates database errors", () => {
    const database = {
        getBaseFriendship() {
            throw new Error("Database lookup failed");
        }
    };

    assert.throws(
        () => createService(database).getBaseFriendship("PIKACHU"),
        /Database lookup failed/
    );
});

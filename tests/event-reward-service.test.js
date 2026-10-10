"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const EventRewardService = require(
    "../scripts/services/event-reward-service"
);

function createService() {
    return new EventRewardService();
}

function createTrainerState() {
    const calls = [];

    const trainerState = {
        addItem(...args) {
            calls.push({ method: "addItem", args });
        },

        addKeyItem(...args) {
            calls.push({ method: "addKeyItem", args });
        },

        addPokemon(...args) {
            calls.push({ method: "addPokemon", args });
        },

        addStoryFlag(...args) {
            calls.push({ method: "addStoryFlag", args });
        },

        addHMAbility(...args) {
            calls.push({ method: "addHMAbility", args });
        },

        addAbility(...args) {
            calls.push({ method: "addAbility", args });
        },

        completeEvent(...args) {
            calls.push({ method: "completeEvent", args });
        }
    };

    return { trainerState, calls };
}

// --------------------------------------------------
// Construction
// --------------------------------------------------

test("constructor creates an EventRewardService instance", () => {
    assert.ok(createService() instanceof EventRewardService);
});

test("constructor does not require arguments", () => {
    assert.doesNotThrow(() => new EventRewardService());
});

// --------------------------------------------------
// giveRewards(): validation
// --------------------------------------------------

test("giveRewards returns failure when rewards are null", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    assert.deepEqual(
        service.giveRewards(null, trainerState),
        {
            success: false,
            reason: "No rewards"
        }
    );

    assert.deepEqual(calls, []);
});

test("giveRewards returns failure when rewards are undefined", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    assert.deepEqual(
        service.giveRewards(undefined, trainerState),
        {
            success: false,
            reason: "No rewards"
        }
    );

    assert.deepEqual(calls, []);
});

test("giveRewards returns failure when rewards are false", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    assert.deepEqual(
        service.giveRewards(false, trainerState),
        {
            success: false,
            reason: "No rewards"
        }
    );

    assert.deepEqual(calls, []);
});

test("giveRewards returns failure when rewards are zero", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    assert.deepEqual(
        service.giveRewards(0, trainerState),
        {
            success: false,
            reason: "No rewards"
        }
    );

    assert.deepEqual(calls, []);
});

test("giveRewards rejects missing rewards before accessing trainer state", () => {
    const service = createService();

    assert.deepEqual(
        service.giveRewards(null, null),
        {
            success: false,
            reason: "No rewards"
        }
    );
});

// --------------------------------------------------
// giveRewards(): successful results
// --------------------------------------------------

test("giveRewards succeeds for an empty rewards object", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();
    const rewards = {};

    assert.deepEqual(
        service.giveRewards(rewards, trainerState),
        {
            success: true,
            rewards
        }
    );

    assert.deepEqual(calls, []);
});

test("giveRewards succeeds for empty reward arrays", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    const rewards = {
        items: [],
        keyItems: [],
        pokemon: [],
        storyFlags: [],
        hmAbilities: [],
        abilities: [],
        completedEvents: []
    };

    assert.deepEqual(
        service.giveRewards(rewards, trainerState),
        {
            success: true,
            rewards
        }
    );

    assert.deepEqual(calls, []);
});

test("giveRewards returns the original rewards object", () => {
    const service = createService();
    const { trainerState } = createTrainerState();
    const rewards = {
        storyFlags: ["MET_PROFESSOR"]
    };

    const result = service.giveRewards(rewards, trainerState);

    assert.strictEqual(result.rewards, rewards);
});

test("giveRewards returns exactly success and rewards on success", () => {
    const service = createService();
    const { trainerState } = createTrainerState();

    const result = service.giveRewards({}, trainerState);

    assert.deepEqual(
        Object.keys(result).sort(),
        ["rewards", "success"]
    );

    assert.equal(result.success, true);
});

test("giveRewards does not replace the supplied rewards object", () => {
    const service = createService();
    const { trainerState } = createTrainerState();

    const rewards = {
        storyFlags: ["GOT_POKEDEX"],
        customData: { source: "NPC" }
    };

    service.giveRewards(rewards, trainerState);

    assert.deepEqual(rewards, {
        storyFlags: ["GOT_POKEDEX"],
        customData: { source: "NPC" }
    });
});

// --------------------------------------------------
// Normal item rewards
// --------------------------------------------------

test("giveRewards calls addItem for each normal item", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        items: [
            { id: "POTION", quantity: 2 },
            { id: "POKE_BALL", quantity: 5 }
        ]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addItem", args: ["POTION", 2] },
        { method: "addItem", args: ["POKE_BALL", 5] }
    ]);
});

test("giveRewards defaults a missing item quantity to one", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        items: [{ id: "POTION" }]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addItem", args: ["POTION", 1] }
    ]);
});

test("giveRewards defaults a null item quantity to one", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        items: [{ id: "POTION", quantity: null }]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addItem", args: ["POTION", 1] }
    ]);
});

test("giveRewards defaults a zero item quantity to one", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        items: [{ id: "POTION", quantity: 0 }]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addItem", args: ["POTION", 1] }
    ]);
});

test("giveRewards defaults a false item quantity to one", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        items: [{ id: "POTION", quantity: false }]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addItem", args: ["POTION", 1] }
    ]);
});

test("giveRewards preserves a negative item quantity", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        items: [{ id: "POTION", quantity: -3 }]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addItem", args: ["POTION", -3] }
    ]);
});

test("giveRewards preserves a truthy string quantity", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        items: [{ id: "POTION", quantity: "4" }]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addItem", args: ["POTION", "4"] }
    ]);
});

test("giveRewards preserves item order", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        items: [
            { id: "POTION" },
            { id: "ANTIDOTE" },
            { id: "REPEL" }
        ]
    }, trainerState);

    assert.deepEqual(
        calls.map(call => call.args[0]),
        ["POTION", "ANTIDOTE", "REPEL"]
    );
});

// --------------------------------------------------
// Key item rewards
// --------------------------------------------------

test("giveRewards calls addKeyItem for each key item", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        keyItems: ["POKEDEX", "BICYCLE"]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addKeyItem", args: ["POKEDEX"] },
        { method: "addKeyItem", args: ["BICYCLE"] }
    ]);
});

test("giveRewards passes key item objects unchanged", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    const keyItem = {
        id: "POKE_FLUTE",
        name: "Poké Flute"
    };

    service.giveRewards({
        keyItems: [keyItem]
    }, trainerState);

    assert.strictEqual(calls[0].args[0], keyItem);
});

test("giveRewards does not use normal item handling for key items", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        keyItems: ["POKEDEX"]
    }, trainerState);

    assert.deepEqual(
        calls.map(call => call.method),
        ["addKeyItem"]
    );
});

// --------------------------------------------------
// Pokémon rewards
// --------------------------------------------------

test("giveRewards calls addPokemon for each Pokémon reward", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    const bulbasaur = { species: "BULBASAUR" };
    const charmander = { species: "CHARMANDER" };

    service.giveRewards({
        pokemon: [bulbasaur, charmander]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addPokemon", args: [bulbasaur] },
        { method: "addPokemon", args: [charmander] }
    ]);
});

test("giveRewards preserves Pokémon object identity", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    const pokemon = {
        species: "SQUIRTLE",
        level: 10,
        nickname: "Shell"
    };

    service.giveRewards({
        pokemon: [pokemon]
    }, trainerState);

    assert.strictEqual(calls[0].args[0], pokemon);
});

test("giveRewards preserves Pokémon reward order", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        pokemon: [
            { species: "BULBASAUR" },
            { species: "CHARMANDER" },
            { species: "SQUIRTLE" }
        ]
    }, trainerState);

    assert.deepEqual(
        calls.map(call => call.args[0].species),
        ["BULBASAUR", "CHARMANDER", "SQUIRTLE"]
    );
});

// --------------------------------------------------
// Story flag rewards
// --------------------------------------------------

test("giveRewards calls addStoryFlag for each story flag", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        storyFlags: [
            "GOT_POKEDEX",
            "MET_RIVAL"
        ]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addStoryFlag", args: ["GOT_POKEDEX"] },
        { method: "addStoryFlag", args: ["MET_RIVAL"] }
    ]);
});

test("giveRewards preserves story flag order", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        storyFlags: ["FLAG_A", "FLAG_B", "FLAG_C"]
    }, trainerState);

    assert.deepEqual(
        calls.map(call => call.args[0]),
        ["FLAG_A", "FLAG_B", "FLAG_C"]
    );
});

// --------------------------------------------------
// HM ability rewards
// --------------------------------------------------

test("giveRewards calls addHMAbility for each HM ability", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        hmAbilities: ["CUT", "SURF"]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addHMAbility", args: ["CUT"] },
        { method: "addHMAbility", args: ["SURF"] }
    ]);
});

test("giveRewards preserves HM ability order", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        hmAbilities: ["CUT", "FLY", "SURF"]
    }, trainerState);

    assert.deepEqual(
        calls.map(call => call.args[0]),
        ["CUT", "FLY", "SURF"]
    );
});

// --------------------------------------------------
// General ability rewards
// --------------------------------------------------

test("giveRewards calls addAbility for each general ability", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        abilities: ["FLASH", "STRENGTH"]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addAbility", args: ["FLASH"] },
        { method: "addAbility", args: ["STRENGTH"] }
    ]);
});

test("giveRewards keeps general abilities separate from HM abilities", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        hmAbilities: ["CUT"],
        abilities: ["FLASH"]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addHMAbility", args: ["CUT"] },
        { method: "addAbility", args: ["FLASH"] }
    ]);
});

// --------------------------------------------------
// Completed event rewards
// --------------------------------------------------

test("giveRewards calls completeEvent for every completed event", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        completedEvents: [
            "MET_PROFESSOR",
            "GOT_STARTER"
        ]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "completeEvent", args: ["MET_PROFESSOR"] },
        { method: "completeEvent", args: ["GOT_STARTER"] }
    ]);
});

test("giveRewards preserves completed event order", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        completedEvents: ["EVENT_A", "EVENT_B", "EVENT_C"]
    }, trainerState);

    assert.deepEqual(
        calls.map(call => call.args[0]),
        ["EVENT_A", "EVENT_B", "EVENT_C"]
    );
});

// --------------------------------------------------
// All reward types together
// --------------------------------------------------

test("giveRewards applies reward categories in defined order", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        items: [{ id: "POTION", quantity: 2 }],
        keyItems: ["POKEDEX"],
        pokemon: [{ species: "BULBASAUR" }],
        storyFlags: ["GOT_STARTER"],
        hmAbilities: ["CUT"],
        abilities: ["FLASH"],
        completedEvents: ["INTRO_COMPLETE"]
    }, trainerState);

    assert.deepEqual(
        calls.map(call => call.method),
        [
            "addItem",
            "addKeyItem",
            "addPokemon",
            "addStoryFlag",
            "addHMAbility",
            "addAbility",
            "completeEvent"
        ]
    );
});

test("giveRewards passes the correct arguments for all reward types", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    const pokemon = { species: "BULBASAUR" };

    service.giveRewards({
        items: [{ id: "POTION", quantity: 3 }],
        keyItems: ["POKEDEX"],
        pokemon: [pokemon],
        storyFlags: ["GOT_STARTER"],
        hmAbilities: ["CUT"],
        abilities: ["FLASH"],
        completedEvents: ["INTRO_COMPLETE"]
    }, trainerState);

    assert.deepEqual(calls, [
        { method: "addItem", args: ["POTION", 3] },
        { method: "addKeyItem", args: ["POKEDEX"] },
        { method: "addPokemon", args: [pokemon] },
        { method: "addStoryFlag", args: ["GOT_STARTER"] },
        { method: "addHMAbility", args: ["CUT"] },
        { method: "addAbility", args: ["FLASH"] },
        { method: "completeEvent", args: ["INTRO_COMPLETE"] }
    ]);
});

test("giveRewards processes multiple entries from every category", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        items: [
            { id: "POTION" },
            { id: "ANTIDOTE", quantity: 2 }
        ],
        keyItems: ["POKEDEX", "BICYCLE"],
        pokemon: [
            { species: "BULBASAUR" },
            { species: "CHARMANDER" }
        ],
        storyFlags: ["FLAG_A", "FLAG_B"],
        hmAbilities: ["CUT", "SURF"],
        abilities: ["FLASH", "STRENGTH"],
        completedEvents: ["EVENT_A", "EVENT_B"]
    }, trainerState);

    assert.equal(calls.length, 14);

    assert.deepEqual(
        calls.map(call => call.method),
        [
            "addItem", "addItem",
            "addKeyItem", "addKeyItem",
            "addPokemon", "addPokemon",
            "addStoryFlag", "addStoryFlag",
            "addHMAbility", "addHMAbility",
            "addAbility", "addAbility",
            "completeEvent", "completeEvent"
        ]
    );
});

test("giveRewards handles categories that are omitted", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    const rewards = {
        storyFlags: ["MET_PROFESSOR"]
    };

    assert.deepEqual(
        service.giveRewards(rewards, trainerState),
        {
            success: true,
            rewards
        }
    );

    assert.deepEqual(calls, [
        { method: "addStoryFlag", args: ["MET_PROFESSOR"] }
    ]);
});

test("giveRewards treats null category arrays as empty", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    const rewards = {
        items: null,
        keyItems: null,
        pokemon: null,
        storyFlags: null,
        hmAbilities: null,
        abilities: null,
        completedEvents: null
    };

    assert.equal(
        service.giveRewards(rewards, trainerState).success,
        true
    );

    assert.deepEqual(calls, []);
});

test("giveRewards treats false category values as empty", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    service.giveRewards({
        items: false,
        keyItems: false,
        pokemon: false,
        storyFlags: false,
        hmAbilities: false,
        abilities: false,
        completedEvents: false
    }, trainerState);

    assert.deepEqual(calls, []);
});

// --------------------------------------------------
// hasRewards()
// --------------------------------------------------

test("hasRewards returns false for null", () => {
    assert.equal(createService().hasRewards(null), false);
});

test("hasRewards returns false for undefined", () => {
    assert.equal(createService().hasRewards(undefined), false);
});

test("hasRewards returns false for false", () => {
    assert.equal(createService().hasRewards(false), false);
});

test("hasRewards returns false for an empty rewards object", () => {
    assert.equal(createService().hasRewards({}), false);
});

test("hasRewards returns false when every reward array is empty", () => {
    assert.equal(
        createService().hasRewards({
            items: [],
            keyItems: [],
            pokemon: [],
            storyFlags: [],
            hmAbilities: [],
            abilities: [],
            completedEvents: []
        }),
        false
    );
});

test("hasRewards detects normal items", () => {
    assert.equal(
        createService().hasRewards({
            items: [{ id: "POTION" }]
        }),
        true
    );
});

test("hasRewards detects key items", () => {
    assert.equal(
        createService().hasRewards({
            keyItems: ["POKEDEX"]
        }),
        true
    );
});

test("hasRewards detects Pokémon rewards", () => {
    assert.equal(
        createService().hasRewards({
            pokemon: [{ species: "BULBASAUR" }]
        }),
        true
    );
});

test("hasRewards detects story flags", () => {
    assert.equal(
        createService().hasRewards({
            storyFlags: ["GOT_STARTER"]
        }),
        true
    );
});

test("hasRewards detects HM abilities", () => {
    assert.equal(
        createService().hasRewards({
            hmAbilities: ["CUT"]
        }),
        true
    );
});

test("hasRewards detects general abilities", () => {
    assert.equal(
        createService().hasRewards({
            abilities: ["FLASH"]
        }),
        true
    );
});

test("hasRewards detects completed events", () => {
    assert.equal(
        createService().hasRewards({
            completedEvents: ["INTRO_COMPLETE"]
        }),
        true
    );
});

test("hasRewards detects rewards even when other arrays are empty", () => {
    assert.equal(
        createService().hasRewards({
            items: [],
            keyItems: [],
            pokemon: [],
            storyFlags: ["GOT_STARTER"],
            hmAbilities: [],
            abilities: [],
            completedEvents: []
        }),
        true
    );
});

test("hasRewards does not count unrelated properties", () => {
    assert.equal(
        createService().hasRewards({
            coins: 100,
            experience: 500,
            customReward: true
        }),
        false
    );
});

test("hasRewards does not mutate the rewards object", () => {
    const service = createService();

    const rewards = {
        items: [{ id: "POTION", quantity: 2 }],
        storyFlags: ["GOT_STARTER"]
    };

    const before = structuredClone(rewards);

    service.hasRewards(rewards);

    assert.deepEqual(rewards, before);
});

// --------------------------------------------------
// Reward object helpers
// --------------------------------------------------

test("createStoryReward returns one story flag", () => {
    const service = createService();

    assert.deepEqual(
        service.createStoryReward("GOT_STARTER"),
        {
            storyFlags: ["GOT_STARTER"]
        }
    );
});

test("createStoryReward preserves the supplied flag", () => {
    const service = createService();

    assert.deepEqual(
        service.createStoryReward("CUSTOM_FLAG"),
        {
            storyFlags: ["CUSTOM_FLAG"]
        }
    );
});

test("createStoryReward wraps a null flag without validation", () => {
    const service = createService();

    assert.deepEqual(
        service.createStoryReward(null),
        {
            storyFlags: [null]
        }
    );
});

test("createItemReward defaults quantity to one", () => {
    const service = createService();

    assert.deepEqual(
        service.createItemReward("POTION"),
        {
            items: [
                {
                    id: "POTION",
                    quantity: 1
                }
            ]
        }
    );
});

test("createItemReward preserves an explicit quantity", () => {
    const service = createService();

    assert.deepEqual(
        service.createItemReward("POKE_BALL", 5),
        {
            items: [
                {
                    id: "POKE_BALL",
                    quantity: 5
                }
            ]
        }
    );
});

test("createItemReward preserves a zero quantity", () => {
    const service = createService();

    assert.deepEqual(
        service.createItemReward("POTION", 0),
        {
            items: [
                {
                    id: "POTION",
                    quantity: 0
                }
            ]
        }
    );
});

test("createItemReward preserves a null quantity", () => {
    const service = createService();

    assert.deepEqual(
        service.createItemReward("POTION", null),
        {
            items: [
                {
                    id: "POTION",
                    quantity: null
                }
            ]
        }
    );
});

test("createItemReward preserves the supplied item ID", () => {
    const service = createService();

    assert.deepEqual(
        service.createItemReward("CUSTOM_ITEM", 3),
        {
            items: [
                {
                    id: "CUSTOM_ITEM",
                    quantity: 3
                }
            ]
        }
    );
});

test("createKeyItemReward returns one key item", () => {
    const service = createService();

    assert.deepEqual(
        service.createKeyItemReward("POKEDEX"),
        {
            keyItems: ["POKEDEX"]
        }
    );
});

test("createKeyItemReward preserves an object reference", () => {
    const service = createService();

    const item = {
        id: "BICYCLE",
        name: "Bicycle"
    };

    const result = service.createKeyItemReward(item);

    assert.strictEqual(result.keyItems[0], item);
});

test("createHMAbilityReward returns one HM ability", () => {
    const service = createService();

    assert.deepEqual(
        service.createHMAbilityReward("CUT"),
        {
            hmAbilities: ["CUT"]
        }
    );
});

test("createHMAbilityReward preserves the supplied ability", () => {
    const service = createService();

    assert.deepEqual(
        service.createHMAbilityReward("SURF"),
        {
            hmAbilities: ["SURF"]
        }
    );
});

test("createAbilityReward returns one general ability", () => {
    const service = createService();

    assert.deepEqual(
        service.createAbilityReward("FLASH"),
        {
            abilities: ["FLASH"]
        }
    );
});

test("createAbilityReward preserves the supplied ability", () => {
    const service = createService();

    assert.deepEqual(
        service.createAbilityReward("STRENGTH"),
        {
            abilities: ["STRENGTH"]
        }
    );
});

// --------------------------------------------------
// Integration of helper methods and reward application
// --------------------------------------------------

test("hasRewards recognizes a story reward helper result", () => {
    const service = createService();

    assert.equal(
        service.hasRewards(
            service.createStoryReward("GOT_STARTER")
        ),
        true
    );
});

test("hasRewards recognizes an item reward helper result", () => {
    const service = createService();

    assert.equal(
        service.hasRewards(
            service.createItemReward("POTION", 2)
        ),
        true
    );
});

test("hasRewards recognizes a key item helper result", () => {
    const service = createService();

    assert.equal(
        service.hasRewards(
            service.createKeyItemReward("POKEDEX")
        ),
        true
    );
});

test("hasRewards recognizes an HM ability helper result", () => {
    const service = createService();

    assert.equal(
        service.hasRewards(
            service.createHMAbilityReward("CUT")
        ),
        true
    );
});

test("hasRewards recognizes a general ability helper result", () => {
    const service = createService();

    assert.equal(
        service.hasRewards(
            service.createAbilityReward("FLASH")
        ),
        true
    );
});

test("giveRewards applies an item helper result", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    const rewards = service.createItemReward("POTION", 3);

    service.giveRewards(rewards, trainerState);

    assert.deepEqual(calls, [
        { method: "addItem", args: ["POTION", 3] }
    ]);
});

test("giveRewards applies a story helper result", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    const rewards = service.createStoryReward("GOT_STARTER");

    service.giveRewards(rewards, trainerState);

    assert.deepEqual(calls, [
        { method: "addStoryFlag", args: ["GOT_STARTER"] }
    ]);
});

test("giveRewards applies a key item helper result", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    const rewards = service.createKeyItemReward("POKEDEX");

    service.giveRewards(rewards, trainerState);

    assert.deepEqual(calls, [
        { method: "addKeyItem", args: ["POKEDEX"] }
    ]);
});

test("giveRewards applies an HM ability helper result", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    const rewards = service.createHMAbilityReward("CUT");

    service.giveRewards(rewards, trainerState);

    assert.deepEqual(calls, [
        { method: "addHMAbility", args: ["CUT"] }
    ]);
});

test("giveRewards applies a general ability helper result", () => {
    const service = createService();
    const { trainerState, calls } = createTrainerState();

    const rewards = service.createAbilityReward("FLASH");

    service.giveRewards(rewards, trainerState);

    assert.deepEqual(calls, [
        { method: "addAbility", args: ["FLASH"] }
    ]);
});
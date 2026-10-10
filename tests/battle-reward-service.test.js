"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattleRewardService = require(
    "../scripts/services/battle-reward-service.js"
);

// --------------------------------
// Test helpers
// --------------------------------

function createPokemon(name = "Bulbasaur", overrides = {}) {
    return {
        species: name.toUpperCase(),
        name,
        level: 5,
        exp: 100,
        friendship: 70,
        moves: [],
        ...overrides
    };
}

function createExperienceService(overrides = {}) {
    return {
        calculateExp(defeatedPokemon, source) {
            return 25;
        },

        giveExp(pokemon, amount) {
            return {
                success: true,
                exp: amount,
                levels: []
            };
        },

        ...overrides
    };
}

function createService({
    experience = createExperienceService(),
    levelUp = null,
    evolution = null,
    friendship = null,
    rewards = null
} = {}) {
    return new BattleRewardService(
        experience,
        levelUp,
        evolution,
        friendship,
        rewards
    );
}

// --------------------------------
// Constructor
// --------------------------------

test("BattleRewardService stores its dependencies", () => {
    const experience = {};
    const levelUp = {};
    const evolution = {};
    const friendship = {};
    const rewards = {};

    const service = new BattleRewardService(
        experience,
        levelUp,
        evolution,
        friendship,
        rewards
    );

    assert.equal(service.experience, experience);
    assert.equal(service.levelUp, levelUp);
    assert.equal(service.evolution, evolution);
    assert.equal(service.friendship, friendship);
    assert.equal(service.rewards, rewards);
});

test("BattleRewardService accepts omitted optional dependencies", () => {
    const service = new BattleRewardService(
        createExperienceService()
    );

    assert.equal(service.levelUp, undefined);
    assert.equal(service.evolution, undefined);
    assert.equal(service.friendship, undefined);
    assert.equal(service.rewards, undefined);
});

// --------------------------------
// Give battle EXP
// --------------------------------

test("giveBattleExp rejects a missing Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.giveBattleExp(null, createPokemon("Charmander")),
        {
            success: false,
            reason: "Missing Pokemon"
        }
    );
});

test("giveBattleExp rejects a missing defeated Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.giveBattleExp(createPokemon(), null),
        {
            success: false,
            reason: "Missing Pokemon"
        }
    );
});

test("giveBattleExp calculates and awards experience", () => {
    const pokemon = createPokemon();
    const defeatedPokemon = createPokemon("Charmander");

    const calls = [];

    const service = createService({
        experience: {
            calculateExp(defeated, source) {
                calls.push(["calculateExp", defeated, source]);
                return 50;
            },

            giveExp(target, amount) {
                calls.push(["giveExp", target, amount]);

                return {
                    success: true,
                    exp: amount,
                    levels: []
                };
            }
        }
    });

    const result = service.giveBattleExp(
        pokemon,
        defeatedPokemon
    );

    assert.equal(result.success, true);
    assert.equal(result.exp, 50);
    assert.equal(result.levelUp, null);
    assert.deepEqual(result.friendship, []);

    assert.deepEqual(calls, [
        ["calculateExp", defeatedPokemon, "TRAINER"],
        ["giveExp", pokemon, 50]
    ]);
});

test("giveBattleExp forwards the specified experience source", () => {
    const pokemon = createPokemon();
    const defeatedPokemon = createPokemon("Pidgey");

    let receivedSource;

    const service = createService({
        experience: {
            calculateExp(defeated, source) {
                receivedSource = source;
                return 12;
            },

            giveExp() {
                return {
                    success: true,
                    levels: []
                };
            }
        }
    });

    service.giveBattleExp(
        pokemon,
        defeatedPokemon,
        "WILD"
    );

    assert.equal(receivedSource, "WILD");
});

test("giveBattleExp preserves the experience service result", () => {
    const pokemon = createPokemon();
    const defeatedPokemon = createPokemon("Rattata");

    const expResult = {
        success: true,
        exp: 25,
        levels: [],
        totalExp: 125
    };

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return expResult;
            }
        })
    });

    const result = service.giveBattleExp(
        pokemon,
        defeatedPokemon
    );

    assert.strictEqual(result.result, expResult);
});

test("giveBattleExp reports an experience award failure", () => {
    const expResult = {
        success: false,
        reason: "Experience could not be awarded"
    };

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return expResult;
            }
        })
    });

    const result = service.giveBattleExp(
        createPokemon(),
        createPokemon("Charmander")
    );

    assert.deepEqual(result, {
        success: false,
        reason: "Failed to give EXP",
        exp: expResult
    });
});

// --------------------------------
// Level-up processing
// --------------------------------

test("giveBattleExp reports unavailable level-up service when levels were gained", () => {
    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return {
                    success: true,
                    exp: 100,
                    levels: [6]
                };
            }
        })
    });

    const result = service.giveBattleExp(
        createPokemon(),
        createPokemon("Charmander")
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Level up service unavailable"
    );
    assert.ok(result.exp);
});

test("giveBattleExp applies the number of gained levels", () => {
    const pokemon = createPokemon();
    let receivedPokemon;
    let receivedLevelCount;

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return {
                    success: true,
                    exp: 150,
                    levels: [6, 7]
                };
            }
        }),

        levelUp: {
            levelUp(target, count) {
                receivedPokemon = target;
                receivedLevelCount = count;

                return {
                    success: true,
                    levels: [6, 7]
                };
            }
        }
    });

    const result = service.giveBattleExp(
        pokemon,
        createPokemon("Charmander")
    );

    assert.equal(result.success, true);
    assert.strictEqual(receivedPokemon, pokemon);
    assert.equal(receivedLevelCount, 2);
    assert.deepEqual(result.levelUp.levels, [6, 7]);
});

test("giveBattleExp reports a failed level-up operation", () => {
    const levelUpResult = {
        success: false,
        reason: "Could not apply levels"
    };

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return {
                    success: true,
                    exp: 100,
                    levels: [6]
                };
            }
        }),

        levelUp: {
            levelUp() {
                return levelUpResult;
            }
        }
    });

    const result = service.giveBattleExp(
        createPokemon(),
        createPokemon("Charmander")
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Failed to apply level up");
    assert.strictEqual(result.levelUp, levelUpResult);
});

test("giveBattleExp does not invoke level-up service when no levels were gained", () => {
    let levelUpCalls = 0;

    const service = createService({
        experience: createExperienceService(),

        levelUp: {
            levelUp() {
                levelUpCalls++;

                return {
                    success: true
                };
            }
        }
    });

    const result = service.giveBattleExp(
        createPokemon(),
        createPokemon("Charmander")
    );

    assert.equal(result.success, true);
    assert.equal(levelUpCalls, 0);
    assert.equal(result.levelUp, null);
});

test("giveBattleExp applies friendship once for each gained level", () => {
    const calls = [];

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return {
                    success: true,
                    exp: 200,
                    levels: [6, 7, 8]
                };
            }
        }),

        levelUp: {
            levelUp() {
                return {
                    success: true,
                    levels: [6, 7, 8]
                };
            }
        },

        friendship: {
            applyLevelUp(pokemon) {
                calls.push(pokemon);

                return {
                    success: true,
                    change: 1
                };
            }
        }
    });

    const pokemon = createPokemon();

    const result = service.giveBattleExp(
        pokemon,
        createPokemon("Charmander")
    );

    assert.equal(result.success, true);
    assert.equal(calls.length, 3);
    assert.ok(calls.every(target => target === pokemon));

    assert.deepEqual(result.friendship, [
        { level: 6, success: true, change: 1 },
        { level: 7, success: true, change: 1 },
        { level: 8, success: true, change: 1 }
    ]);
});

test("giveBattleExp preserves gained levels when the friendship service is unavailable", () => {
    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return {
                    success: true,
                    exp: 100,
                    levels: [6]
                };
            }
        }),

        levelUp: {
            levelUp() {
                return {
                    success: true,
                    levels: [6]
                };
            }
        }
    });

    const result = service.giveBattleExp(
        createPokemon(),
        createPokemon("Charmander")
    );

    assert.equal(result.success, true);
    assert.deepEqual(result.friendship, []);
});

// --------------------------------
// Progression state synchronization
// --------------------------------

test("syncProgressionState rejects a missing Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.syncProgressionState(null),
        {
            success: false,
            reason: "Missing Pokemon"
        }
    );
});

test("syncProgressionState reports an unavailable source Pokémon", () => {
    const pokemon = createPokemon();

    const service = createService();
    const result = service.syncProgressionState(pokemon);

    assert.equal(result.success, true);
    assert.equal(result.synchronized, false);
    assert.equal(result.reason, "Source Pokemon unavailable");
    assert.strictEqual(result.pokemon, pokemon);
});

test("syncProgressionState copies progression fields to the source Pokémon", () => {
    const sourcePokemon = createPokemon("Bulbasaur");

    const runtimePokemon = createPokemon("Ivysaur", {
        species: "IVYSAUR",
        level: 16,
        exp: 1200,
        friendship: 85,
        sourcePokemon
    });

    const service = createService();
    const result = service.syncProgressionState(runtimePokemon);

    assert.equal(sourcePokemon.species, "IVYSAUR");
    assert.equal(sourcePokemon.level, 16);
    assert.equal(sourcePokemon.exp, 1200);
    assert.equal(sourcePokemon.friendship, 85);

    assert.equal(result.success, true);
    assert.equal(result.synchronized, true);
    assert.strictEqual(result.pokemon, sourcePokemon);
});

test("syncProgressionState copies evolution history when present", () => {
    const evolutionHistory = [
        {
            from: "BULBASAUR",
            to: "IVYSAUR"
        }
    ];

    const sourcePokemon = createPokemon();

    const runtimePokemon = createPokemon("Ivysaur", {
        evolutionHistory,
        sourcePokemon
    });

    const service = createService();

    service.syncProgressionState(runtimePokemon);

    assert.strictEqual(
        sourcePokemon.evolutionHistory,
        evolutionHistory
    );
});

test("syncProgressionState preserves a nickname when it is supplied", () => {
    const sourcePokemon = createPokemon();

    const runtimePokemon = createPokemon("Bulbasaur", {
        nickname: "Leafy",
        sourcePokemon
    });

    const service = createService();

    service.syncProgressionState(runtimePokemon);

    assert.equal(sourcePokemon.nickname, "Leafy");
});

test("syncProgressionState does not replace a nickname when it is undefined", () => {
    const sourcePokemon = createPokemon("Bulbasaur", {
        nickname: "Original"
    });

    const runtimePokemon = createPokemon("Bulbasaur", {
        nickname: undefined,
        sourcePokemon
    });

    const service = createService();

    service.syncProgressionState(runtimePokemon);

    assert.equal(sourcePokemon.nickname, "Original");
});

test("syncProgressionState synchronizes the move array by reference", () => {
    const sourcePokemon = createPokemon();
    const moves = [
        {
            constant: "MOVE_TACKLE",
            currentPP: 5
        }
    ];

    const runtimePokemon = createPokemon("Bulbasaur", {
        moves,
        sourcePokemon
    });

    const service = createService();

    service.syncProgressionState(runtimePokemon);

    assert.strictEqual(sourcePokemon.moves, moves);
});

// --------------------------------
// Major battle friendship
// --------------------------------

test("applyMajorBattleFriendship rejects a missing Pokémon", () => {
    const service = createService({
        friendship: {
            applyMajorBattle() {
                return { success: true };
            }
        }
    });

    assert.deepEqual(
        service.applyMajorBattleFriendship(null),
        {
            success: false,
            reason: "Missing Pokemon"
        }
    );
});

test("applyMajorBattleFriendship reports an unavailable friendship service", () => {
    const service = createService();

    const result = service.applyMajorBattleFriendship(
        createPokemon()
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Friendship service unavailable");
});

test("applyMajorBattleFriendship reports a missing applyMajorBattle method", () => {
    const service = createService({
        friendship: {}
    });

    const result = service.applyMajorBattleFriendship(
        createPokemon()
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Major battle friendship is unavailable"
    );
});

test("applyMajorBattleFriendship delegates Pokémon and options", () => {
    const pokemon = createPokemon();
    const options = {
        trainerType: "GYM_LEADER"
    };

    const expected = {
        success: true,
        friendship: 80,
        change: 5
    };

    let receivedPokemon;
    let receivedOptions;

    const service = createService({
        friendship: {
            applyMajorBattle(target, receivedOptionsValue) {
                receivedPokemon = target;
                receivedOptions = receivedOptionsValue;
                return expected;
            }
        }
    });

    const result = service.applyMajorBattleFriendship(
        pokemon,
        options
    );

    assert.strictEqual(result, expected);
    assert.strictEqual(receivedPokemon, pokemon);
    assert.strictEqual(receivedOptions, options);
});

// --------------------------------
// Major battle party friendship
// --------------------------------

test("applyMajorBattlePartyFriendship rejects a non-array party", () => {
    const service = createService();

    assert.deepEqual(
        service.applyMajorBattlePartyFriendship(null),
        {
            success: false,
            reason: "Invalid party",
            results: []
        }
    );
});

test("applyMajorBattlePartyFriendship skips empty party slots", () => {
    const processed = [];

    const service = createService({
        friendship: {
            applyMajorBattle(pokemon) {
                processed.push(pokemon);

                return {
                    success: true
                };
            }
        }
    });

    const first = createPokemon();
    const second = createPokemon("Squirtle");

    const result = service.applyMajorBattlePartyFriendship([
        first,
        null,
        undefined,
        second
    ]);

    assert.equal(result.success, true);
    assert.equal(processed.length, 2);
    assert.strictEqual(processed[0], first);
    assert.strictEqual(processed[1], second);
});

test("applyMajorBattlePartyFriendship applies friendship to each Pokémon", () => {
    const first = createPokemon();
    const second = createPokemon("Squirtle");

    const service = createService({
        friendship: {
            applyMajorBattle(pokemon) {
                return {
                    success: true,
                    friendship: pokemon.species === "BULBASAUR" ? 80 : 90
                };
            }
        }
    });

    const result = service.applyMajorBattlePartyFriendship([
        first,
        second
    ]);

    assert.equal(result.success, true);

    assert.deepEqual(
        result.results.map(entry => entry.pokemon),
        ["BULBASAUR", "SQUIRTLE"]
    );

    assert.deepEqual(
        result.results.map(entry => entry.friendship),
        [80, 90]
    );
});

// --------------------------------
// Evolution
// --------------------------------

test("checkEvolution reports an unavailable evolution service", () => {
    const service = createService();

    const result = service.checkEvolution(
        createPokemon()
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Evolution service unavailable");
});

test("checkEvolution delegates Pokémon and context", () => {
    const pokemon = createPokemon();
    const context = {
        trigger: "LEVEL_UP"
    };

    const expected = {
        success: true,
        evolved: false
    };

    let receivedPokemon;
    let receivedContext;

    const service = createService({
        evolution: {
            checkEvolution(target, receivedContextValue) {
                receivedPokemon = target;
                receivedContext = receivedContextValue;
                return expected;
            }
        }
    });

    const result = service.checkEvolution(
        pokemon,
        context
    );

    assert.strictEqual(result, expected);
    assert.strictEqual(receivedPokemon, pokemon);
    assert.strictEqual(receivedContext, context);
});

// --------------------------------
// Full battle reward processing
// --------------------------------

test("processBattleRewards rejects a missing Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.processBattleRewards(
            null,
            createPokemon("Charmander")
        ),
        {
            success: false,
            reason: "Missing Pokemon"
        }
    );
});

test("processBattleRewards stops when experience processing fails", () => {
    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return {
                    success: false,
                    reason: "No EXP"
                };
            }
        })
    });

    const result = service.processBattleRewards(
        createPokemon(),
        createPokemon("Charmander")
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Failed to process battle EXP");
    assert.ok(result.exp);
});

test("processBattleRewards returns the progression results on success", () => {
    const pokemon = createPokemon();
    const defeatedPokemon = createPokemon("Charmander");

    const service = createService();

    const result = service.processBattleRewards(
        pokemon,
        defeatedPokemon
    );

    assert.equal(result.success, true);
    assert.strictEqual(result.pokemon, pokemon);
    assert.ok(result.exp);
    assert.equal(result.evolution.reason, "No level-up");
    assert.equal(result.majorBattleFriendship, null);
    assert.equal(result.synchronization.reason, "Source Pokemon unavailable");
    assert.deepEqual(result.partySynchronization, []);
    assert.equal(result.rewards, null);
});

test("processBattleRewards does not apply major battle friendship by default", () => {
    let friendshipCalls = 0;

    const service = createService({
        friendship: {
            applyMajorBattle() {
                friendshipCalls++;

                return {
                    success: true
                };
            }
        }
    });

    service.processBattleRewards(
        createPokemon(),
        createPokemon("Charmander")
    );

    assert.equal(friendshipCalls, 0);
});

test("processBattleRewards applies major battle friendship to the specified party", () => {
    const first = createPokemon();
    const second = createPokemon("Squirtle");
    const processed = [];

    const service = createService({
        friendship: {
            applyMajorBattle(pokemon, options) {
                processed.push({
                    pokemon,
                    options
                });

                return {
                    success: true,
                    change: 5
                };
            }
        }
    });

    const context = {
        majorBattle: true,
        playerParty: [first, second],
        trainerType: "GYM_LEADER"
    };

    const result = service.processBattleRewards(
        first,
        createPokemon("Charmander"),
        null,
        null,
        "TRAINER",
        context
    );

    assert.equal(result.success, true);
    assert.equal(processed.length, 2);
    assert.strictEqual(processed[0].pokemon, first);
    assert.strictEqual(processed[1].pokemon, second);
    assert.strictEqual(processed[0].options, context);
    assert.ok(result.majorBattleFriendship.success);
});

test("processBattleRewards falls back to the receiving Pokémon for major friendship", () => {
    const pokemon = createPokemon();
    const processed = [];

    const service = createService({
        friendship: {
            applyMajorBattle(target) {
                processed.push(target);

                return {
                    success: true
                };
            }
        }
    });

    const result = service.processBattleRewards(
        pokemon,
        createPokemon("Charmander"),
        null,
        null,
        "TRAINER",
        {
            majorBattle: true
        }
    );

    assert.equal(result.success, true);
    assert.equal(processed.length, 1);
    assert.strictEqual(processed[0], pokemon);
});

test("processBattleRewards checks evolution after a level-up", () => {
    const pokemon = createPokemon();
    let receivedContext;

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return {
                    success: true,
                    exp: 100,
                    levels: [6]
                };
            }
        }),

        levelUp: {
            levelUp() {
                return {
                    success: true,
                    levels: [6]
                };
            }
        },

        evolution: {
            checkEvolution(target, context) {
                receivedContext = context;

                return {
                    success: true,
                    evolved: true
                };
            }
        }
    });

    const result = service.processBattleRewards(
        pokemon,
        createPokemon("Charmander"),
        null,
        null,
        "TRAINER",
        {
            location: "ROUTE_1"
        }
    );

    assert.equal(result.success, true);
    assert.equal(result.evolution.evolved, true);
    assert.equal(receivedContext.levelUp, true);
    assert.equal(receivedContext.trigger, "LEVEL_UP");
    assert.equal(receivedContext.evolutionTrigger, "LEVEL_UP");
    assert.equal(receivedContext.location, "ROUTE_1");
});

test("processBattleRewards does not check evolution when no level was gained", () => {
    let evolutionCalls = 0;

    const service = createService({
        evolution: {
            checkEvolution() {
                evolutionCalls++;

                return {
                    success: true
                };
            }
        }
    });

    const result = service.processBattleRewards(
        createPokemon(),
        createPokemon("Charmander")
    );

    assert.equal(result.success, true);
    assert.equal(evolutionCalls, 0);
    assert.equal(result.evolution.reason, "No level-up");
});

test("processBattleRewards synchronizes progression to the source Pokémon", () => {
    const sourcePokemon = createPokemon();

    const pokemon = createPokemon("Ivysaur", {
        species: "IVYSAUR",
        level: 16,
        exp: 1200,
        friendship: 90,
        sourcePokemon
    });

    const service = createService();

    const result = service.processBattleRewards(
        pokemon,
        createPokemon("Charmander")
    );

    assert.equal(result.success, true);
    assert.equal(result.synchronization.synchronized, true);
    assert.equal(sourcePokemon.species, "IVYSAUR");
    assert.equal(sourcePokemon.level, 16);
    assert.equal(sourcePokemon.exp, 1200);
    assert.equal(sourcePokemon.friendship, 90);
});

test("processBattleRewards synchronizes party members in major battles", () => {
    const firstSource = createPokemon();
    const secondSource = createPokemon("Squirtle");

    const first = createPokemon("Bulbasaur", {
        friendship: 80,
        sourcePokemon: firstSource
    });

    const second = createPokemon("Squirtle", {
        friendship: 85,
        sourcePokemon: secondSource
    });

    const service = createService();

    const result = service.processBattleRewards(
        first,
        createPokemon("Charmander"),
        null,
        null,
        "TRAINER",
        {
            majorBattle: true,
            playerParty: [first, second]
        }
    );

    assert.equal(result.success, true);
    assert.equal(result.partySynchronization.length, 2);
    assert.equal(firstSource.friendship, 80);
    assert.equal(secondSource.friendship, 85);
    assert.ok(
        result.partySynchronization.every(entry => entry.synchronized)
    );
});

test("processBattleRewards executes trainer rewards when all required inputs exist", () => {
    const trainerRewards = {
        money: 500
    };

    const trainerState = {
        money: 100
    };

    const expectedRewards = {
        success: true,
        moneyGained: 500
    };

    let receivedRewards;
    let receivedState;

    const service = createService({
        rewards: {
            execute(rewards, state) {
                receivedRewards = rewards;
                receivedState = state;

                return expectedRewards;
            }
        }
    });

    const result = service.processBattleRewards(
        createPokemon(),
        createPokemon("Charmander"),
        trainerRewards,
        trainerState
    );

    assert.equal(result.success, true);
    assert.strictEqual(result.rewards, expectedRewards);
    assert.strictEqual(receivedRewards, trainerRewards);
    assert.strictEqual(receivedState, trainerState);
});

test("processBattleRewards skips trainer rewards when the reward service is unavailable", () => {
    const service = createService();

    const result = service.processBattleRewards(
        createPokemon(),
        createPokemon("Charmander"),
        { money: 500 },
        { money: 100 }
    );

    assert.equal(result.success, true);
    assert.equal(result.rewards, null);
});

test("processBattleRewards skips trainer rewards when trainer rewards are missing", () => {
    let rewardCalls = 0;

    const service = createService({
        rewards: {
            execute() {
                rewardCalls++;

                return {
                    success: true
                };
            }
        }
    });

    const result = service.processBattleRewards(
        createPokemon(),
        createPokemon("Charmander"),
        null,
        { money: 100 }
    );

    assert.equal(result.success, true);
    assert.equal(rewardCalls, 0);
    assert.equal(result.rewards, null);
});

test("processBattleRewards skips trainer rewards when trainer state is missing", () => {
    let rewardCalls = 0;

    const service = createService({
        rewards: {
            execute() {
                rewardCalls++;

                return {
                    success: true
                };
            }
        }
    });

    const result = service.processBattleRewards(
        createPokemon(),
        createPokemon("Charmander"),
        { money: 500 },
        null
    );

    assert.equal(result.success, true);
    assert.equal(rewardCalls, 0);
    assert.equal(result.rewards, null);
});
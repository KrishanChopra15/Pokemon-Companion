"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const PokemonProgressionService =
    require("../scripts/services/pokemon-progression-service");


function createPokemon(overrides = {}) {
    return {
        species: "CHARMANDER",
        level: 5,
        exp: 125,
        friendship: 70,
        ...overrides
    };
}

function createExperienceService(overrides = {}) {
    return {
        giveExp() {
            return {
                success: true,
                levels: []
            };
        },
        getExpProgress(pokemon) {
            return {
                currentExp: pokemon.exp,
                level: pokemon.level
            };
        },
        ...overrides
    };
}

function createLevelUpService(overrides = {}) {
    return {
        levelUp() {
            return {
                success: true,
                levels: []
            };
        },
        ...overrides
    };
}

function createEvolutionService(overrides = {}) {
    return {
        checkEvolution() {
            return {
                success: false,
                reason: "No evolution available"
            };
        },
        ...overrides
    };
}

function createFriendshipService(overrides = {}) {
    return {
        applyLevelUp() {
            return {
                success: true,
                friendship: 71
            };
        },
        ...overrides
    };
}

function createService({
    experience = createExperienceService(),
    levelUp = createLevelUpService(),
    evolution = createEvolutionService(),
    friendship = null
} = {}) {
    return new PokemonProgressionService(
        experience,
        levelUp,
        evolution,
        friendship
    );
}


// -----------------------------------------------
// Constructor
// -----------------------------------------------

test("constructor creates a PokemonProgressionService instance", () => {
    assert.ok(
        createService() instanceof PokemonProgressionService
    );
});

test("constructor stores the experience service", () => {
    const experience = createExperienceService();
    const service = createService({ experience });

    assert.equal(service.experience, experience);
});

test("constructor stores the level-up service", () => {
    const levelUp = createLevelUpService();
    const service = createService({ levelUp });

    assert.equal(service.levelUp, levelUp);
});

test("constructor stores the evolution service", () => {
    const evolution = createEvolutionService();
    const service = createService({ evolution });

    assert.equal(service.evolution, evolution);
});

test("constructor defaults the friendship service to null", () => {
    const service = createService();

    assert.equal(service.friendship, null);
});

test("constructor stores an injected friendship service", () => {
    const friendship = createFriendshipService();
    const service = createService({ friendship });

    assert.equal(service.friendship, friendship);
});


// -----------------------------------------------
// processExperience: EXP service interactions
// -----------------------------------------------

test("processExperience calls giveExp with the Pokémon and amount", () => {
    const calls = [];
    const experience = createExperienceService({
        giveExp(pokemon, amount) {
            calls.push({ pokemon, amount });
            return {
                success: true,
                levels: []
            };
        }
    });

    const service = createService({ experience });
    const pokemon = createPokemon();

    service.processExperience(pokemon, 200);

    assert.deepEqual(calls, [{ pokemon, amount: 200 }]);
});

test("processExperience returns the EXP service failure unchanged", () => {
    const failure = {
        success: false,
        reason: "Invalid EXP amount"
    };

    const experience = createExperienceService({
        giveExp() {
            return failure;
        }
    });

    const service = createService({ experience });
    const result = service.processExperience(createPokemon(), 100);

    assert.equal(result, failure);
});

test("processExperience does not level up when EXP fails", () => {
    let levelUpCalled = false;

    const experience = createExperienceService({
        giveExp() {
            return {
                success: false,
                reason: "EXP rejected"
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            levelUpCalled = true;
            return { success: true, levels: [] };
        }
    });

    const service = createService({ experience, levelUp });

    service.processExperience(createPokemon(), 100);

    assert.equal(levelUpCalled, false);
});

test("processExperience does not apply friendship when EXP fails", () => {
    let friendshipCalled = false;

    const experience = createExperienceService({
        giveExp() {
            return {
                success: false,
                reason: "EXP rejected"
            };
        }
    });

    const friendship = createFriendshipService({
        applyLevelUp() {
            friendshipCalled = true;
            return { success: true };
        }
    });

    const service = createService({ experience, friendship });

    service.processExperience(createPokemon(), 100);

    assert.equal(friendshipCalled, false);
});

test("processExperience does not check evolution itself", () => {
    let evolutionCalled = false;

    const evolution = createEvolutionService({
        checkEvolution() {
            evolutionCalled = true;
            return { success: false };
        }
    });

    const service = createService({ evolution });

    service.processExperience(createPokemon(), 100);

    assert.equal(evolutionCalled, false);
});


// -----------------------------------------------
// processExperience: no level gained
// -----------------------------------------------

test("processExperience returns success when EXP succeeds without a level-up", () => {
    const expResult = {
        success: true,
        amount: 50,
        levels: []
    };

    const experience = createExperienceService({
        giveExp() {
            return expResult;
        }
    });

    const service = createService({ experience });
    const result = service.processExperience(createPokemon(), 50);

    assert.equal(result.success, true);
    assert.equal(result.experience, expResult);
});

test("processExperience sets levelUp to null when no levels are gained", () => {
    const service = createService();

    const result = service.processExperience(createPokemon(), 10);

    assert.equal(result.levelUp, null);
});

test("processExperience returns an empty friendship array when no levels are gained", () => {
    const service = createService({
        friendship: createFriendshipService()
    });

    const result = service.processExperience(createPokemon(), 10);

    assert.deepEqual(result.friendship, []);
});

test("processExperience does not call levelUp when the levels array is empty", () => {
    let levelUpCalled = false;

    const experience = createExperienceService({
        giveExp() {
            return { success: true, levels: [] };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            levelUpCalled = true;
            return { success: true, levels: [] };
        }
    });

    const service = createService({ experience, levelUp });

    service.processExperience(createPokemon(), 10);

    assert.equal(levelUpCalled, false);
});

test("processExperience does not apply friendship when no levels are gained", () => {
    let friendshipCalled = false;

    const friendship = createFriendshipService({
        applyLevelUp() {
            friendshipCalled = true;
            return { success: true };
        }
    });

    const service = createService({ friendship });

    service.processExperience(createPokemon(), 10);

    assert.equal(friendshipCalled, false);
});


// -----------------------------------------------
// processExperience: level-up handling
// -----------------------------------------------

test("processExperience calls levelUp with the number of gained levels", () => {
    const calls = [];
    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6, 7, 8]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp(pokemon, count) {
            calls.push({ pokemon, count });
            return {
                success: true,
                levels: [6, 7, 8]
            };
        }
    });

    const service = createService({ experience, levelUp });
    const pokemon = createPokemon();

    service.processExperience(pokemon, 1000);

    assert.deepEqual(calls, [{ pokemon, count: 3 }]);
});

test("processExperience passes the original Pokémon to levelUp", () => {
    let receivedPokemon;

    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp(pokemon) {
            receivedPokemon = pokemon;
            return { success: true, levels: [6] };
        }
    });

    const service = createService({ experience, levelUp });
    const pokemon = createPokemon();

    service.processExperience(pokemon, 200);

    assert.equal(receivedPokemon, pokemon);
});

test("processExperience returns the level-up service result", () => {
    const levelResult = {
        success: true,
        levels: [6]
    };

    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return levelResult;
        }
    });

    const service = createService({ experience, levelUp });
    const result = service.processExperience(createPokemon(), 100);

    assert.equal(result.levelUp, levelResult);
});

test("processExperience includes the EXP result in the success response", () => {
    const expResult = {
        success: true,
        amount: 300,
        levels: [6]
    };

    const experience = createExperienceService({
        giveExp() {
            return expResult;
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const service = createService({ experience, levelUp });
    const result = service.processExperience(createPokemon(), 300);

    assert.equal(result.experience, expResult);
});

test("processExperience reports success when the EXP service succeeds", () => {
    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: []
            };
        }
    });

    const service = createService({ experience });

    assert.equal(
        service.processExperience(createPokemon(), 100).success,
        true
    );
});

test("processExperience returns the three expected response fields", () => {
    const service = createService();
    const result = service.processExperience(createPokemon(), 100);

    assert.deepEqual(
        Object.keys(result).sort(),
        ["experience", "friendship", "levelUp", "success"].sort()
    );
});

test("processExperience preserves a failed level-up result in its response", () => {
    const levelResult = {
        success: false,
        reason: "Level-up failed",
        levels: []
    };

    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return levelResult;
        }
    });

    const service = createService({ experience, levelUp });
    const result = service.processExperience(createPokemon(), 100);

    assert.equal(result.success, true);
    assert.equal(result.levelUp, levelResult);
});


// -----------------------------------------------
// processExperience: friendship gains
// -----------------------------------------------

test("processExperience applies friendship once for one gained level", () => {
    let calls = 0;

    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return { success: true, levels: [6] };
        }
    });

    const friendship = createFriendshipService({
        applyLevelUp() {
            calls += 1;
            return {
                success: true,
                amount: 1
            };
        }
    });

    const service = createService({
        experience,
        levelUp,
        friendship
    });

    service.processExperience(createPokemon(), 100);

    assert.equal(calls, 1);
});

test("processExperience applies friendship once for every gained level", () => {
    let calls = 0;

    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6, 7, 8, 9]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: [6, 7, 8, 9]
            };
        }
    });

    const friendship = createFriendshipService({
        applyLevelUp() {
            calls += 1;
            return {
                success: true,
                amount: 1
            };
        }
    });

    const service = createService({
        experience,
        levelUp,
        friendship
    });

    service.processExperience(createPokemon(), 10000);

    assert.equal(calls, 4);
});

test("processExperience passes the original Pokémon to friendship service", () => {
    let receivedPokemon;

    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return { success: true, levels: [6] };
        }
    });

    const friendship = createFriendshipService({
        applyLevelUp(pokemon) {
            receivedPokemon = pokemon;
            return { success: true };
        }
    });

    const service = createService({
        experience,
        levelUp,
        friendship
    });

    const pokemon = createPokemon();

    service.processExperience(pokemon, 100);

    assert.equal(receivedPokemon, pokemon);
});

test("processExperience includes each gained level in its friendship result", () => {
    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6, 7]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: [6, 7]
            };
        }
    });

    const friendship = createFriendshipService({
        applyLevelUp() {
            return {
                success: true,
                gained: 1
            };
        }
    });

    const service = createService({
        experience,
        levelUp,
        friendship
    });

    const result = service.processExperience(createPokemon(), 1000);

    assert.deepEqual(result.friendship, [
        { level: 6, success: true, gained: 1 },
        { level: 7, success: true, gained: 1 }
    ]);
});

test("processExperience preserves friendship service result fields", () => {
    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const friendship = createFriendshipService({
        applyLevelUp() {
            return {
                success: true,
                oldFriendship: 70,
                newFriendship: 71,
                change: 1
            };
        }
    });

    const service = createService({
        experience,
        levelUp,
        friendship
    });

    const result = service.processExperience(createPokemon(), 100);

    assert.deepEqual(result.friendship[0], {
        level: 6,
        success: true,
        oldFriendship: 70,
        newFriendship: 71,
        change: 1
    });
});

test("processExperience works without a friendship service", () => {
    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6, 7]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: [6, 7]
            };
        }
    });

    const service = createService({ experience, levelUp });
    const result = service.processExperience(createPokemon(), 1000);

    assert.deepEqual(result.friendship, []);
});

test("processExperience skips friendship when applyLevelUp is missing", () => {
    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const service = createService({
        experience,
        levelUp,
        friendship: {}
    });

    const result = service.processExperience(createPokemon(), 100);

    assert.deepEqual(result.friendship, []);
});

test("processExperience skips friendship when applyLevelUp is not a function", () => {
    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const service = createService({
        experience,
        levelUp,
        friendship: { applyLevelUp: true }
    });

    const result = service.processExperience(createPokemon(), 100);

    assert.deepEqual(result.friendship, []);
});

test("processExperience records unsuccessful friendship results without failing progression", () => {
    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const friendship = createFriendshipService({
        applyLevelUp() {
            return {
                success: false,
                reason: "Friendship unchanged"
            };
        }
    });

    const service = createService({
        experience,
        levelUp,
        friendship
    });

    const result = service.processExperience(createPokemon(), 100);

    assert.equal(result.success, true);
    assert.deepEqual(result.friendship, [
        {
            level: 6,
            success: false,
            reason: "Friendship unchanged"
        }
    ]);
});


// -----------------------------------------------
// processEvolution
// -----------------------------------------------

test("processEvolution delegates to checkEvolution", () => {
    let callCount = 0;

    const evolution = createEvolutionService({
        checkEvolution() {
            callCount += 1;
            return { success: false };
        }
    });

    const service = createService({ evolution });

    service.processEvolution(createPokemon());

    assert.equal(callCount, 1);
});

test("processEvolution passes the original Pokémon to the evolution service", () => {
    let receivedPokemon;

    const evolution = createEvolutionService({
        checkEvolution(pokemon) {
            receivedPokemon = pokemon;
            return { success: false };
        }
    });

    const service = createService({ evolution });
    const pokemon = createPokemon();

    service.processEvolution(pokemon);

    assert.equal(receivedPokemon, pokemon);
});

test("processEvolution passes the supplied context to the evolution service", () => {
    let receivedContext;

    const evolution = createEvolutionService({
        checkEvolution(pokemon, context) {
            receivedContext = context;
            return { success: false };
        }
    });

    const service = createService({ evolution });
    const context = {
        trigger: "LEVEL_UP",
        levelUp: true
    };

    service.processEvolution(createPokemon(), context);

    assert.equal(receivedContext, context);
});

test("processEvolution defaults context to an empty object", () => {
    let receivedContext;

    const evolution = createEvolutionService({
        checkEvolution(pokemon, context) {
            receivedContext = context;
            return { success: false };
        }
    });

    const service = createService({ evolution });

    service.processEvolution(createPokemon());

    assert.deepEqual(receivedContext, {});
});

test("processEvolution returns the evolution service result unchanged", () => {
    const evolutionResult = {
        success: true,
        from: "CHARMELEON",
        to: "CHARIZARD"
    };

    const evolution = createEvolutionService({
        checkEvolution() {
            return evolutionResult;
        }
    });

    const service = createService({ evolution });

    assert.equal(
        service.processEvolution(createPokemon()),
        evolutionResult
    );
});


// -----------------------------------------------
// processProgression: early failure and no level-up
// -----------------------------------------------

test("processProgression returns an EXP failure unchanged", () => {
    const failure = {
        success: false,
        reason: "EXP rejected"
    };

    const experience = createExperienceService({
        giveExp() {
            return failure;
        }
    });

    const service = createService({ experience });
    const result = service.processProgression(createPokemon(), 100);

    assert.equal(result, failure);
});

test("processProgression does not check evolution when EXP fails", () => {
    let evolutionCalled = false;

    const experience = createExperienceService({
        giveExp() {
            return {
                success: false,
                reason: "EXP rejected"
            };
        }
    });

    const evolution = createEvolutionService({
        checkEvolution() {
            evolutionCalled = true;
            return { success: true };
        }
    });

    const service = createService({ experience, evolution });

    service.processProgression(createPokemon(), 100);

    assert.equal(evolutionCalled, false);
});

test("processProgression does not check evolution without a level-up", () => {
    let evolutionCalled = false;

    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: []
            };
        }
    });

    const evolution = createEvolutionService({
        checkEvolution() {
            evolutionCalled = true;
            return { success: true };
        }
    });

    const service = createService({ experience, evolution });

    service.processProgression(createPokemon(), 100);

    assert.equal(evolutionCalled, false);
});

test("processProgression returns null evolution when levelUp is null", () => {
    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: []
            };
        }
    });

    const service = createService({ experience });

    const result = service.processProgression(createPokemon(), 100);

    assert.equal(result.success, true);
    assert.equal(result.levelUp, null);
    assert.equal(result.evolution, null);
});

test("processProgression does not check evolution when level-up levels are empty", () => {
    let evolutionCalled = false;

    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: []
            };
        }
    });

    const evolution = createEvolutionService({
        checkEvolution() {
            evolutionCalled = true;
            return { success: true };
        }
    });

    const service = createService({
        experience,
        levelUp,
        evolution
    });

    service.processProgression(createPokemon(), 100);

    assert.equal(evolutionCalled, false);
});

test("processProgression does not check evolution when levelUp.levels is not an array", () => {
    let evolutionCalled = false;

    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: 6
            };
        }
    });

    const evolution = createEvolutionService({
        checkEvolution() {
            evolutionCalled = true;
            return { success: true };
        }
    });

    const service = createService({
        experience,
        levelUp,
        evolution
    });

    const result = service.processProgression(createPokemon(), 100);

    assert.equal(result.evolution, null);
    assert.equal(evolutionCalled, false);
});


// -----------------------------------------------
// processProgression: evolution context
// -----------------------------------------------

test("processProgression checks evolution after a level-up", () => {
    let evolutionCalled = false;

    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const evolution = createEvolutionService({
        checkEvolution() {
            evolutionCalled = true;
            return { success: false };
        }
    });

    const service = createService({
        experience,
        levelUp,
        evolution
    });

    service.processProgression(createPokemon(), 100);

    assert.equal(evolutionCalled, true);
});

test("processProgression passes the original Pokémon into evolution checking", () => {
    let receivedPokemon;

    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const evolution = createEvolutionService({
        checkEvolution(pokemon) {
            receivedPokemon = pokemon;
            return { success: false };
        }
    });

    const service = createService({
        experience,
        levelUp,
        evolution
    });

    const pokemon = createPokemon();

    service.processProgression(pokemon, 100);

    assert.equal(receivedPokemon, pokemon);
});

test("processProgression adds levelUp true to the evolution context", () => {
    let receivedContext;

    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const evolution = createEvolutionService({
        checkEvolution(pokemon, context) {
            receivedContext = context;
            return { success: false };
        }
    });

    const service = createService({
        experience,
        levelUp,
        evolution
    });

    service.processProgression(createPokemon(), 100);

    assert.equal(receivedContext.levelUp, true);
});

test("processProgression sets trigger to LEVEL_UP", () => {
    let receivedContext;

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return { success: true, levels: [6] };
            }
        }),
        levelUp: createLevelUpService({
            levelUp() {
                return { success: true, levels: [6] };
            }
        }),
        evolution: createEvolutionService({
            checkEvolution(pokemon, context) {
                receivedContext = context;
                return { success: false };
            }
        })
    });

    service.processProgression(createPokemon(), 100);

    assert.equal(receivedContext.trigger, "LEVEL_UP");
});

test("processProgression sets evolutionTrigger to LEVEL_UP", () => {
    let receivedContext;

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return { success: true, levels: [6] };
            }
        }),
        levelUp: createLevelUpService({
            levelUp() {
                return { success: true, levels: [6] };
            }
        }),
        evolution: createEvolutionService({
            checkEvolution(pokemon, context) {
                receivedContext = context;
                return { success: false };
            }
        })
    });

    service.processProgression(createPokemon(), 100);

    assert.equal(receivedContext.evolutionTrigger, "LEVEL_UP");
});

test("processProgression preserves other context fields", () => {
    let receivedContext;

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return { success: true, levels: [6] };
            }
        }),
        levelUp: createLevelUpService({
            levelUp() {
                return { success: true, levels: [6] };
            }
        }),
        evolution: createEvolutionService({
            checkEvolution(pokemon, context) {
                receivedContext = context;
                return { success: false };
            }
        })
    });

    const context = {
        source: "BATTLE",
        location: "PALLET_TOWN",
        customFlag: 42
    };

    service.processProgression(createPokemon(), 100, context);

    assert.equal(receivedContext.source, "BATTLE");
    assert.equal(receivedContext.location, "PALLET_TOWN");
    assert.equal(receivedContext.customFlag, 42);
});

test("processProgression overrides conflicting evolution context fields", () => {
    let receivedContext;

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return { success: true, levels: [6] };
            }
        }),
        levelUp: createLevelUpService({
            levelUp() {
                return { success: true, levels: [6] };
            }
        }),
        evolution: createEvolutionService({
            checkEvolution(pokemon, context) {
                receivedContext = context;
                return { success: false };
            }
        })
    });

    service.processProgression(createPokemon(), 100, {
        levelUp: false,
        trigger: "TRADE",
        evolutionTrigger: "ITEM"
    });

    assert.equal(receivedContext.levelUp, true);
    assert.equal(receivedContext.trigger, "LEVEL_UP");
    assert.equal(receivedContext.evolutionTrigger, "LEVEL_UP");
});

test("processProgression defaults context to an empty object", () => {
    let receivedContext;

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return { success: true, levels: [6] };
            }
        }),
        levelUp: createLevelUpService({
            levelUp() {
                return { success: true, levels: [6] };
            }
        }),
        evolution: createEvolutionService({
            checkEvolution(pokemon, context) {
                receivedContext = context;
                return { success: false };
            }
        })
    });

    service.processProgression(createPokemon(), 100);

    assert.deepEqual(receivedContext, {
        levelUp: true,
        trigger: "LEVEL_UP",
        evolutionTrigger: "LEVEL_UP"
    });
});


// -----------------------------------------------
// processProgression: result handling
// -----------------------------------------------

test("processProgression includes the Pokémon species in its result", () => {
    const service = createService();
    const pokemon = createPokemon({ species: "SQUIRTLE" });

    const result = service.processProgression(pokemon, 100);

    assert.equal(result.pokemon, "SQUIRTLE");
});

test("processProgression includes experience, level-up, friendship and evolution fields", () => {
    const service = createService();
    const result = service.processProgression(createPokemon(), 100);

    assert.deepEqual(
        Object.keys(result).sort(),
        [
            "success",
            "pokemon",
            "experience",
            "levelUp",
            "friendship",
            "evolution"
        ].sort()
    );
});

test("processProgression preserves the EXP result in its output", () => {
    const expResult = {
        success: true,
        gained: 250,
        levels: []
    };

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return expResult;
            }
        })
    });

    const result = service.processProgression(createPokemon(), 250);

    assert.equal(result.experience, expResult);
});

test("processProgression preserves the level-up result in its output", () => {
    const levelResult = {
        success: true,
        levels: [6]
    };

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return { success: true, levels: [6] };
            }
        }),
        levelUp: createLevelUpService({
            levelUp() {
                return levelResult;
            }
        })
    });

    const result = service.processProgression(createPokemon(), 100);

    assert.equal(result.levelUp, levelResult);
});

test("processProgression preserves friendship results in its output", () => {
    const friendshipResult = {
        level: 6,
        success: true,
        change: 2
    };

    const experience = createExperienceService({
        giveExp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const levelUp = createLevelUpService({
        levelUp() {
            return {
                success: true,
                levels: [6]
            };
        }
    });

    const friendship = createFriendshipService({
        applyLevelUp() {
            return {
                success: true,
                change: 2
            };
        }
    });

    const service = createService({
        experience,
        levelUp,
        friendship
    });

    const result = service.processProgression(createPokemon(), 100);

    assert.deepEqual(result.friendship, [friendshipResult]);
});

test("processProgression includes a successful evolution result", () => {
    const evolutionResult = {
        success: true,
        from: "CHARMELEON",
        to: "CHARIZARD"
    };

    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return { success: true, levels: [6] };
            }
        }),
        levelUp: createLevelUpService({
            levelUp() {
                return { success: true, levels: [6] };
            }
        }),
        evolution: createEvolutionService({
            checkEvolution() {
                return evolutionResult;
            }
        })
    });

    const result = service.processProgression(createPokemon(), 100);

    assert.equal(result.evolution, evolutionResult);
});

test("processProgression sets evolution to null when evolution is unsuccessful", () => {
    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return { success: true, levels: [6] };
            }
        }),
        levelUp: createLevelUpService({
            levelUp() {
                return { success: true, levels: [6] };
            }
        }),
        evolution: createEvolutionService({
            checkEvolution() {
                return {
                    success: false,
                    reason: "No evolution available"
                };
            }
        })
    });

    const result = service.processProgression(createPokemon(), 100);

    assert.equal(result.success, true);
    assert.equal(result.evolution, null);
});

test("processProgression remains successful when evolution is unsuccessful", () => {
    const service = createService({
        experience: createExperienceService({
            giveExp() {
                return { success: true, levels: [6] };
            }
        }),
        levelUp: createLevelUpService({
            levelUp() {
                return { success: true, levels: [6] };
            }
        }),
        evolution: createEvolutionService({
            checkEvolution() {
                return { success: false };
            }
        })
    });

    const result = service.processProgression(createPokemon(), 100);

    assert.equal(result.success, true);
});

test("processProgression does not mutate the Pokémon species field", () => {
    const service = createService();
    const pokemon = createPokemon({ species: "CHARMANDER" });

    service.processProgression(pokemon, 100);

    assert.equal(pokemon.species, "CHARMANDER");
});


// -----------------------------------------------
// getSummary
// -----------------------------------------------

test("getSummary returns the Pokémon species", () => {
    const service = createService();
    const pokemon = createPokemon({ species: "SQUIRTLE" });

    assert.equal(service.getSummary(pokemon).species, "SQUIRTLE");
});

test("getSummary returns the Pokémon level", () => {
    const service = createService();
    const pokemon = createPokemon({ level: 24 });

    assert.equal(service.getSummary(pokemon).level, 24);
});

test("getSummary returns the Pokémon EXP value", () => {
    const service = createService();
    const pokemon = createPokemon({ exp: 1500 });

    assert.equal(service.getSummary(pokemon).exp, 1500);
});

test("getSummary returns the Pokémon friendship value", () => {
    const service = createService();
    const pokemon = createPokemon({ friendship: 130 });

    assert.equal(service.getSummary(pokemon).friendship, 130);
});

test("getSummary returns null when friendship is undefined", () => {
    const service = createService();
    const pokemon = createPokemon();

    delete pokemon.friendship;

    assert.equal(service.getSummary(pokemon).friendship, null);
});

test("getSummary preserves an explicit friendship value of zero", () => {
    const service = createService();
    const pokemon = createPokemon({ friendship: 0 });

    assert.equal(service.getSummary(pokemon).friendship, 0);
});

test("getSummary calls getExpProgress with the Pokémon", () => {
    let receivedPokemon;

    const experience = createExperienceService({
        getExpProgress(pokemon) {
            receivedPokemon = pokemon;
            return { progress: 50 };
        }
    });

    const service = createService({ experience });
    const pokemon = createPokemon();

    service.getSummary(pokemon);

    assert.equal(receivedPokemon, pokemon);
});

test("getSummary returns the experience progress result", () => {
    const progress = {
        current: 100,
        required: 200,
        percentage: 50
    };

    const experience = createExperienceService({
        getExpProgress() {
            return progress;
        }
    });

    const service = createService({ experience });

    assert.equal(
        service.getSummary(createPokemon()).progress,
        progress
    );
});

test("getSummary returns evolution history when available", () => {
    const history = [
        {
            from: "CHARMELEON",
            to: "CHARIZARD"
        }
    ];

    const service = createService();
    const pokemon = createPokemon({
        evolutionHistory: history
    });

    assert.equal(service.getSummary(pokemon).evolution, history);
});

test("getSummary returns an empty evolution array when history is absent", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.deepEqual(
        service.getSummary(pokemon).evolution,
        []
    );
});

test("getSummary returns an empty evolution array when history is null", () => {
    const service = createService();
    const pokemon = createPokemon({
        evolutionHistory: null
    });

    assert.deepEqual(
        service.getSummary(pokemon).evolution,
        []
    );
});

test("getSummary returns all six expected fields", () => {
    const service = createService();

    const result = service.getSummary(createPokemon());

    assert.deepEqual(
        Object.keys(result).sort(),
        [
            "species",
            "level",
            "exp",
            "friendship",
            "progress",
            "evolution"
        ].sort()
    );
});

test("getSummary does not mutate the Pokémon", () => {
    const service = createService();
    const pokemon = createPokemon({
        evolutionHistory: [{ from: "A", to: "B" }]
    });
    const original = { ...pokemon };

    service.getSummary(pokemon);

    assert.deepEqual(pokemon, original);
});

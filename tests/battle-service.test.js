"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattleService = require("../scripts/services/battle-service.js");

// --------------------------------
// Test helpers
// --------------------------------

function createPokemon(name, hp = 20) {
    return {
        name,
        species: name.toUpperCase(),
        hp,
        maxHp: 20
    };
}

function createBattle(overrides = {}) {
    return {
        id: "BATTLE_1",
        type: "TRAINER",
        status: "ACTIVE",
        trainerId: "trainer-1",
        trainer: null,
        player: {
            party: [createPokemon("Bulbasaur")],
            active: 0
        },
        opponent: {
            party: [createPokemon("Charmander")],
            active: 0
        },
        turn: 1,
        result: null,
        winner: null,
        ...overrides
    };
}

function createService({
    preparation = {},
    engine = {},
    rewards = null
} = {}) {
    return new BattleService(
        preparation,
        engine,
        rewards
    );
}

function createSuccessfulTrainerPreparation(overrides = {}) {
    return {
        success: true,
        battleType: "TRAINER",
        trainer: {
            id: "trainer-1",
            trainerType: "TRAINER"
        },
        player: {
            party: [createPokemon("Bulbasaur")],
            active: 0
        },
        opponent: {
            party: [createPokemon("Charmander")],
            active: 0
        },
        ...overrides
    };
}

function createPreparation(overrides = {}) {
    return {
        prepareTrainerBattle() {
            return createSuccessfulTrainerPreparation();
        },

        getPlayerParty() {
            return [createPokemon("Bulbasaur")];
        },

        preparePokemon(pokemon) {
            return pokemon ? { ...pokemon } : null;
        },

        ...overrides
    };
}

function createEngine(overrides = {}) {
    return {
        initializeBattle() {
            return { success: true };
        },

        processTurn() {
            return { success: true };
        },

        ...overrides
    };
}

// --------------------------------
// Constructor and battle IDs
// --------------------------------

test("BattleService stores its dependencies", () => {
    const preparation = {};
    const engine = {};
    const rewards = {};

    const service = new BattleService(
        preparation,
        engine,
        rewards
    );

    assert.equal(service.preparation, preparation);
    assert.equal(service.engine, engine);
    assert.equal(service.rewards, rewards);
});

test("BattleService starts with empty battle storage", () => {
    const service = createService();

    assert.deepEqual(service.activeBattles, {});
    assert.equal(service.getBattleCount(), 0);
});

test("BattleService generates sequential battle IDs", () => {
    const service = createService();

    assert.equal(service.createBattleId(), "BATTLE_1");
    assert.equal(service.createBattleId(), "BATTLE_2");
    assert.equal(service.createBattleId(), "BATTLE_3");
});

// --------------------------------
// Start trainer battle
// --------------------------------

test("BattleService rejects trainer battles without a preparation service", () => {
    const service = createService({
        engine: createEngine()
    });

    const result = service.startTrainerBattle(
        "trainer-1",
        {}
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Battle preparation service unavailable"
    );
    assert.equal(service.getBattleCount(), 0);
});

test("BattleService propagates trainer preparation failures", () => {
    const service = createService({
        preparation: {
            prepareTrainerBattle() {
                return {
                    success: false,
                    reason: "Trainer not found"
                };
            }
        },
        engine: createEngine()
    });

    const result = service.startTrainerBattle(
        "missing-trainer",
        {}
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Trainer not found");
    assert.equal(service.getBattleCount(), 0);
});

test("BattleService uses a fallback reason when trainer preparation fails without one", () => {
    const service = createService({
        preparation: {
            prepareTrainerBattle() {
                return { success: false };
            }
        },
        engine: createEngine()
    });

    const result = service.startTrainerBattle(
        "trainer-1",
        {}
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Unable to prepare trainer battle"
    );
});

test("BattleService rejects invalid prepared trainer battles", () => {
    const preparation = createPreparation({
        prepareTrainerBattle() {
            return createSuccessfulTrainerPreparation({
                opponent: null
            });
        }
    });

    const service = createService({
        preparation,
        engine: createEngine()
    });

    const result = service.startTrainerBattle(
        "trainer-1",
        {}
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid prepared battle");
    assert.equal(service.getBattleCount(), 0);
});

test("BattleService rejects prepared battles without party arrays", () => {
    const preparation = createPreparation({
        prepareTrainerBattle() {
            return createSuccessfulTrainerPreparation({
                player: {
                    party: null
                }
            });
        }
    });

    const service = createService({
        preparation,
        engine: createEngine()
    });

    const result = service.startTrainerBattle(
        "trainer-1",
        {}
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid prepared battle");
});

test("BattleService creates and stores a trainer battle", () => {
    let initializedBattle = null;

    const prepared = createSuccessfulTrainerPreparation();

    const service = createService({
        preparation: createPreparation({
            prepareTrainerBattle() {
                return prepared;
            }
        }),
        engine: createEngine({
            initializeBattle(battle) {
                initializedBattle = battle;
                return { success: true };
            }
        })
    });

    const result = service.startTrainerBattle(
        "trainer-1",
        { name: "Player" }
    );

    assert.equal(result.success, true);
    assert.equal(result.battleId, "BATTLE_1");
    assert.equal(result.battle.id, "BATTLE_1");
    assert.equal(result.battle.type, "TRAINER");
    assert.equal(result.battle.status, "ACTIVE");
    assert.equal(result.battle.turn, 1);
    assert.equal(result.battle.result, null);
    assert.equal(result.battle.winner, null);
    assert.equal(result.battle.trainerId, "trainer-1");
    assert.equal(result.battle.trainer, prepared.trainer);
    assert.equal(result.battle.player, prepared.player);
    assert.equal(result.battle.opponent, prepared.opponent);
    assert.equal(initializedBattle, result.battle);
    assert.equal(service.getBattle("BATTLE_1"), result.battle);
    assert.equal(service.getBattleCount(), 1);
});

test("BattleService defaults the trainer battle type to TRAINER", () => {
    const service = createService({
        preparation: createPreparation({
            prepareTrainerBattle() {
                return createSuccessfulTrainerPreparation({
                    battleType: null
                });
            }
        }),
        engine: createEngine()
    });

    const result = service.startTrainerBattle(
        "trainer-1",
        {}
    );

    assert.equal(result.success, true);
    assert.equal(result.battle.type, "TRAINER");
});

test("BattleService removes a trainer battle when initialization fails", () => {
    const service = createService({
        preparation: createPreparation(),
        engine: createEngine({
            initializeBattle() {
                return {
                    success: false,
                    reason: "Engine initialization failed"
                };
            }
        })
    });

    const result = service.startTrainerBattle(
        "trainer-1",
        {}
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Engine initialization failed");
    assert.equal(service.getBattleCount(), 0);
    assert.equal(service.getBattle("BATTLE_1"), null);
});

// --------------------------------
// Start wild battle
// --------------------------------

test("BattleService rejects a missing wild Pokémon", () => {
    const service = createService({
        preparation: createPreparation(),
        engine: createEngine()
    });

    const result = service.startWildBattle(
        {},
        null
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Missing wild Pokemon");
    assert.equal(service.getBattleCount(), 0);
});

test("BattleService rejects wild battles without a preparation service", () => {
    const service = createService({
        engine: createEngine()
    });

    const result = service.startWildBattle(
        {},
        createPokemon("Pidgey")
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Battle preparation service unavailable"
    );
});

test("BattleService rejects an empty player party in a wild battle", () => {
    const service = createService({
        preparation: createPreparation({
            getPlayerParty() {
                return [];
            }
        }),
        engine: createEngine()
    });

    const result = service.startWildBattle(
        {},
        createPokemon("Pidgey")
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Player has no Pokémon");
    assert.equal(service.getBattleCount(), 0);
});

test("BattleService rejects a non-array player party in a wild battle", () => {
    const service = createService({
        preparation: createPreparation({
            getPlayerParty() {
                return null;
            }
        }),
        engine: createEngine()
    });

    const result = service.startWildBattle(
        {},
        createPokemon("Pidgey")
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Player has no Pokémon");
});

test("BattleService rejects a party containing no valid prepared Pokémon", () => {
    const service = createService({
        preparation: createPreparation({
            getPlayerParty() {
                return [null, undefined];
            },

            preparePokemon() {
                return null;
            }
        }),
        engine: createEngine()
    });

    const result = service.startWildBattle(
        {},
        createPokemon("Pidgey")
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Player has no valid Pokémon");
});

test("BattleService rejects an invalid wild Pokémon", () => {
    const service = createService({
        preparation: createPreparation({
            preparePokemon(pokemon) {
                if (pokemon.isWild) {
                    return null;
                }

                return { ...pokemon };
            }
        }),
        engine: createEngine()
    });

    const result = service.startWildBattle(
        {},
        {
            name: "Pidgey",
            isWild: true
        }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid wild Pokémon");
    assert.equal(service.getBattleCount(), 0);
});

test("BattleService creates and stores a wild battle", () => {
    let initializedBattle = null;

    const playerPokemon = createPokemon("Bulbasaur");
    const wildPokemon = createPokemon("Pidgey");

    const service = createService({
        preparation: createPreparation({
            getPlayerParty() {
                return [playerPokemon];
            },

            preparePokemon(pokemon) {
                return { ...pokemon };
            }
        }),

        engine: createEngine({
            initializeBattle(battle) {
                initializedBattle = battle;
                return { success: true };
            }
        })
    });

    const result = service.startWildBattle(
        { name: "Player" },
        wildPokemon
    );

    assert.equal(result.success, true);
    assert.equal(result.battleId, "BATTLE_1");
    assert.equal(result.battle.type, "WILD");
    assert.equal(result.battle.status, "ACTIVE");
    assert.equal(result.battle.trainerId, null);
    assert.equal(result.battle.trainer, null);
    assert.equal(result.battle.turn, 1);
    assert.equal(result.battle.player.party.length, 1);
    assert.equal(result.battle.opponent.party.length, 1);
    assert.equal(
        result.battle.player.party[0].name,
        "Bulbasaur"
    );
    assert.equal(
        result.battle.opponent.party[0].name,
        "Pidgey"
    );
    assert.equal(result.battle.player.active, 0);
    assert.equal(result.battle.opponent.active, 0);
    assert.equal(initializedBattle, result.battle);
    assert.equal(service.getBattle("BATTLE_1"), result.battle);
});

test("BattleService filters invalid Pokémon from the prepared player party", () => {
    let initializedBattle = null;

    const firstPokemon = createPokemon("Bulbasaur");
    const secondPokemon = createPokemon("Squirtle");

    const service = createService({
        preparation: createPreparation({
            getPlayerParty() {
                return [
                    firstPokemon,
                    null,
                    secondPokemon
                ];
            },

            preparePokemon(pokemon) {
                return pokemon ? { ...pokemon } : null;
            }
        }),

        engine: createEngine({
            initializeBattle(battle) {
                initializedBattle = battle;
                return { success: true };
            }
        })
    });

    const result = service.startWildBattle(
        {},
        createPokemon("Pidgey")
    );

    assert.equal(result.success, true);
    assert.equal(
        initializedBattle.player.party.length,
        2
    );
    assert.deepEqual(
        initializedBattle.player.party.map(pokemon => pokemon.name),
        ["Bulbasaur", "Squirtle"]
    );
});

test("BattleService removes a wild battle when initialization fails", () => {
    const service = createService({
        preparation: createPreparation(),

        engine: createEngine({
            initializeBattle() {
                return {
                    success: false,
                    reason: "Wild battle initialization failed"
                };
            }
        })
    });

    const result = service.startWildBattle(
        {},
        createPokemon("Pidgey")
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Wild battle initialization failed"
    );
    assert.equal(service.getBattleCount(), 0);
    assert.equal(service.getBattle("BATTLE_1"), null);
});

// --------------------------------
// Battle initialization
// --------------------------------

test("BattleService rejects initialization without a battle", () => {
    const service = createService({
        engine: createEngine()
    });

    const result = service.initializeBattle(null);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Missing battle");
});

test("BattleService rejects initialization without an engine", () => {
    const service = createService();

    const result = service.initializeBattle(
        createBattle()
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Battle engine unavailable");
});

test("BattleService delegates battle initialization to the engine", () => {
    const battle = createBattle();
    let receivedBattle = null;

    const expected = {
        success: true,
        initialized: true
    };

    const service = createService({
        engine: createEngine({
            initializeBattle(received) {
                receivedBattle = received;
                return expected;
            }
        })
    });

    assert.equal(service.initializeBattle(battle), expected);
    assert.equal(receivedBattle, battle);
});

// --------------------------------
// Battle lookup and listing
// --------------------------------

test("BattleService returns null for an unknown battle ID", () => {
    const service = createService();

    assert.equal(service.getBattle("missing"), null);
});

test("BattleService returns all stored battles", () => {
    const service = createService();
    const first = createBattle({ id: "BATTLE_1" });
    const second = createBattle({ id: "BATTLE_2" });

    service.activeBattles[first.id] = first;
    service.activeBattles[second.id] = second;

    assert.deepEqual(
        service.getBattles(),
        [first, second]
    );
});

test("BattleService lists only ACTIVE battles in getActiveBattles", () => {
    const service = createService();

    const active = createBattle({
        id: "BATTLE_1",
        status: "ACTIVE"
    });

    const completed = createBattle({
        id: "BATTLE_2",
        status: "COMPLETED"
    });

    const paused = createBattle({
        id: "BATTLE_3",
        status: "PAUSED"
    });

    service.activeBattles[active.id] = active;
    service.activeBattles[completed.id] = completed;
    service.activeBattles[paused.id] = paused;

    assert.deepEqual(
        service.getActiveBattles(),
        [active]
    );

    assert.equal(service.getBattles().length, 3);
});

test("BattleService reports whether a battle is active", () => {
    const service = createService();

    const battle = createBattle({
        id: "BATTLE_1",
        status: "ACTIVE"
    });

    service.activeBattles[battle.id] = battle;

    assert.equal(service.isActive("BATTLE_1"), true);
    assert.equal(service.isActive("missing"), false);

    battle.status = "COMPLETED";

    assert.equal(service.isActive("BATTLE_1"), false);
});

// --------------------------------
// Turn processing
// --------------------------------

test("BattleService rejects processing a turn for an unknown battle", () => {
    const service = createService({
        engine: createEngine()
    });

    const result = service.processTurn(
        "missing",
        { name: "Tackle" }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Unknown battle");
});

test("BattleService rejects turn processing for a completed battle", () => {
    const service = createService({
        engine: createEngine()
    });

    service.activeBattles.BATTLE_1 = createBattle({
        status: "COMPLETED"
    });

    const result = service.processTurn(
        "BATTLE_1",
        { name: "Tackle" }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Battle finished");
});

test("BattleService rejects turn processing without an engine", () => {
    const service = createService();

    service.activeBattles.BATTLE_1 = createBattle();

    const result = service.processTurn(
        "BATTLE_1",
        { name: "Tackle" }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Battle engine unavailable");
});

test("BattleService passes the battle and player move to the engine", () => {
    const battle = createBattle();

    const playerMove = {
        name: "Tackle"
    };

    let receivedBattle = null;
    let receivedMove = null;

    const expected = {
        success: true,
        result: {
            damage: 5
        }
    };

    const service = createService({
        engine: createEngine({
            processTurn(received, move) {
                receivedBattle = received;
                receivedMove = move;
                return expected;
            }
        })
    });

    service.activeBattles[battle.id] = battle;

    const result = service.processTurn(
        battle.id,
        playerMove
    );

    assert.equal(result, expected);
    assert.equal(receivedBattle, battle);
    assert.equal(receivedMove, playerMove);
});

test("BattleService reports a failed turn when the engine returns no result", () => {
    const service = createService({
        engine: createEngine({
            processTurn() {
                return null;
            }
        })
    });

    service.activeBattles.BATTLE_1 = createBattle();

    const result = service.processTurn(
        "BATTLE_1",
        { name: "Tackle" }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Battle turn failed");
});

test("BattleService resolves a battle result if the engine ends the battle", () => {
    const battle = createBattle();

    battle.opponent.party[0].hp = 0;

    const service = createService({
        engine: createEngine({
            processTurn(receivedBattle) {
                receivedBattle.status = "COMPLETED";

                return {
                    success: true
                };
            }
        })
    });

    service.activeBattles[battle.id] = battle;

    const result = service.processTurn(
        battle.id,
        { name: "Tackle" }
    );

    assert.equal(result.success, true);
    assert.equal(battle.winner, "PLAYER");
    assert.deepEqual(battle.result, {
        winner: "PLAYER",
        outcome: "VICTORY"
    });
});

// --------------------------------
// Resolve battle result
// --------------------------------

test("BattleService returns null when resolving a missing battle", () => {
    const service = createService();

    assert.equal(service.resolveBattleResult(null), null);
});

test("BattleService resolves a player victory when all opponents have fainted", () => {
    const battle = createBattle();

    battle.opponent.party[0].hp = 0;

    const service = createService();

    const result = service.resolveBattleResult(battle);

    assert.equal(battle.status, "COMPLETED");
    assert.equal(battle.winner, "PLAYER");
    assert.deepEqual(battle.result, {
        winner: "PLAYER",
        outcome: "VICTORY"
    });

    assert.deepEqual(result, {
        status: "COMPLETED",
        winner: "PLAYER",
        result: battle.result
    });
});

test("BattleService resolves an opponent victory when all player Pokémon have fainted", () => {
    const battle = createBattle();

    battle.player.party[0].hp = 0;

    const service = createService();

    const result = service.resolveBattleResult(battle);

    assert.equal(battle.status, "COMPLETED");
    assert.equal(battle.winner, "OPPONENT");
    assert.deepEqual(battle.result, {
        winner: "OPPONENT",
        outcome: "DEFEAT"
    });

    assert.deepEqual(result, {
        status: "COMPLETED",
        winner: "OPPONENT",
        result: battle.result
    });
});

test("BattleService leaves the battle unchanged when both sides have living Pokémon", () => {
    const battle = createBattle();
    const service = createService();

    const result = service.resolveBattleResult(battle);

    assert.equal(battle.status, "ACTIVE");
    assert.equal(battle.winner, null);
    assert.equal(battle.result, null);

    assert.deepEqual(result, {
        status: "ACTIVE",
        winner: null,
        result: null
    });
});

// --------------------------------
// Complete battle
// --------------------------------

test("BattleService rejects completion of an unknown battle", () => {
    const service = createService();

    const result = service.completeBattle("missing");

    assert.equal(result.success, false);
    assert.equal(result.reason, "Unknown battle");
});

test("BattleService does not complete an already completed battle twice", () => {
    const battle = createBattle({
        status: "COMPLETED",
        winner: "PLAYER",
        result: {
            winner: "PLAYER",
            outcome: "VICTORY"
        }
    });

    let rewardCalls = 0;

    const service = createService({
        rewards: {
            processBattleRewards() {
                rewardCalls++;
                return {};
            }
        }
    });

    service.activeBattles[battle.id] = battle;

    const result = service.completeBattle(
        battle.id,
        {
            winner: "OPPONENT",
            outcome: "DEFEAT"
        }
    );

    assert.equal(result.success, true);
    assert.equal(result.battleId, battle.id);
    assert.equal(result.result, battle.result);
    assert.equal(battle.winner, "PLAYER");
    assert.equal(rewardCalls, 0);
});

test("BattleService completes a battle using the supplied result", () => {
    const battle = createBattle();
    const service = createService();

    service.activeBattles[battle.id] = battle;

    const result = service.completeBattle(
        battle.id,
        {
            winner: "PLAYER",
            outcome: "VICTORY",
            message: "Opponent defeated"
        }
    );

    assert.equal(result.success, true);
    assert.equal(result.battleId, battle.id);
    assert.equal(battle.status, "COMPLETED");
    assert.equal(battle.winner, "PLAYER");

    assert.deepEqual(battle.result, {
        winner: "PLAYER",
        outcome: "VICTORY",
        message: "Opponent defeated"
    });

    assert.equal(result.result, battle.result);
});

test("BattleService derives the result when no winner is supplied", () => {
    const battle = createBattle();

    battle.opponent.party[0].hp = 0;

    const service = createService();

    service.activeBattles[battle.id] = battle;

    const result = service.completeBattle(battle.id);

    assert.equal(result.success, true);
    assert.equal(battle.status, "COMPLETED");
    assert.equal(battle.winner, "PLAYER");
    assert.equal(battle.result.winner, "PLAYER");
    assert.equal(battle.result.outcome, undefined);
});

test("BattleService processes rewards for a player victory with a defeated opponent", () => {
    const battle = createBattle({
        trainer: {
            trainerType: "GYM_LEADER",
            rewards: {
                money: 500
            }
        }
    });

    battle.opponent.party[0].hp = 0;

    let rewardArguments = null;

    const expectedRewards = {
        experience: 100,
        money: 500
    };

    const service = createService({
        rewards: {
            processBattleRewards(...args) {
                rewardArguments = args;
                return expectedRewards;
            }
        }
    });

    service.activeBattles[battle.id] = battle;

    const result = service.completeBattle(
        battle.id,
        {
            winner: "PLAYER",
            outcome: "VICTORY"
        }
    );

    assert.equal(result.success, true);
    assert.equal(rewardArguments.length, 6);
    assert.equal(
        rewardArguments[0],
        battle.player.party[0]
    );
    assert.equal(
        rewardArguments[1],
        battle.opponent.party[0]
    );
    assert.deepEqual(
        rewardArguments[2],
        battle.trainer.rewards
    );
    assert.equal(rewardArguments[3], battle.player);
    assert.equal(rewardArguments[4], "TRAINER");
    assert.equal(rewardArguments[5].majorBattle, true);
    assert.equal(rewardArguments[5].trainer, battle.trainer);
    assert.equal(battle.result.rewards, expectedRewards);
});

test("BattleService does not process rewards for an opponent victory", () => {
    const battle = createBattle();

    battle.player.party[0].hp = 0;

    let rewardCalls = 0;

    const service = createService({
        rewards: {
            processBattleRewards() {
                rewardCalls++;
                return {};
            }
        }
    });

    service.activeBattles[battle.id] = battle;

    service.completeBattle(
        battle.id,
        {
            winner: "OPPONENT",
            outcome: "DEFEAT"
        }
    );

    assert.equal(rewardCalls, 0);
});

test("BattleService does not process rewards without a defeated opponent Pokémon", () => {
    const battle = createBattle();

    let rewardCalls = 0;

    const service = createService({
        rewards: {
            processBattleRewards() {
                rewardCalls++;
                return {};
            }
        }
    });

    service.activeBattles[battle.id] = battle;

    service.completeBattle(
        battle.id,
        {
            winner: "PLAYER",
            outcome: "VICTORY"
        }
    );

    assert.equal(rewardCalls, 0);
});

// --------------------------------
// Major trainer battles
// --------------------------------

test("BattleService identifies a gym leader by trainer type", () => {
    const service = createService();

    assert.equal(
        service.isMajorTrainerBattle({
            trainerType: "GYM_LEADER"
        }),
        true
    );
});

test("BattleService identifies a gym leader by trainer class", () => {
    const service = createService();

    assert.equal(
        service.isMajorTrainerBattle({
            trainerClass: "Leader"
        }),
        true
    );
});

test("BattleService identifies Elite Four trainers", () => {
    const service = createService();

    assert.equal(
        service.isMajorTrainerBattle({
            trainerType: "ELITE_FOUR"
        }),
        true
    );

    assert.equal(
        service.isMajorTrainerBattle({
            trainerClass: "Elite4"
        }),
        true
    );
});

test("BattleService identifies champions", () => {
    const service = createService();

    assert.equal(
        service.isMajorTrainerBattle({
            trainerType: "CHAMPION"
        }),
        true
    );

    assert.equal(
        service.isMajorTrainerBattle({
            trainerClass: "Champion"
        }),
        true
    );
});

test("BattleService rejects missing or ordinary trainers as major battles", () => {
    const service = createService();

    assert.equal(service.isMajorTrainerBattle(null), false);

    assert.equal(
        service.isMajorTrainerBattle({
            trainerType: "TRAINER",
            trainerClass: "Youngster"
        }),
        false
    );
});

// --------------------------------
// Convenience completion methods
// --------------------------------

test("BattleService winBattle completes a battle with a player victory", () => {
    const battle = createBattle();
    const service = createService();

    service.activeBattles[battle.id] = battle;

    const result = service.winBattle(battle.id);

    assert.equal(result.success, true);
    assert.equal(battle.status, "COMPLETED");
    assert.equal(battle.winner, "PLAYER");
    assert.equal(battle.result.outcome, "VICTORY");
});

test("BattleService loseBattle completes a battle with an opponent victory", () => {
    const battle = createBattle();
    const service = createService();

    service.activeBattles[battle.id] = battle;

    const result = service.loseBattle(battle.id);

    assert.equal(result.success, true);
    assert.equal(battle.status, "COMPLETED");
    assert.equal(battle.winner, "OPPONENT");
    assert.equal(battle.result.outcome, "DEFEAT");
});

// --------------------------------
// Battle removal and statistics
// --------------------------------

test("BattleService returns false when clearing a missing battle", () => {
    const service = createService();

    assert.equal(service.clearBattle("missing"), false);
    assert.equal(service.getBattleCount(), 0);
});

test("BattleService removes an existing battle", () => {
    const service = createService();
    const battle = createBattle();

    service.activeBattles[battle.id] = battle;

    assert.equal(service.clearBattle(battle.id), true);
    assert.equal(service.getBattle(battle.id), null);
    assert.equal(service.getBattleCount(), 0);
});

test("BattleService counts all stored battles, including completed battles", () => {
    const service = createService();

    service.activeBattles.BATTLE_1 = createBattle({
        id: "BATTLE_1",
        status: "ACTIVE"
    });

    service.activeBattles.BATTLE_2 = createBattle({
        id: "BATTLE_2",
        status: "COMPLETED"
    });

    assert.equal(service.getBattleCount(), 2);

    service.clearBattle("BATTLE_1");

    assert.equal(service.getBattleCount(), 1);
});
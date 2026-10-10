"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const BattlePredictionService = require(
    "../scripts/services/battle-prediction-service"
);

function createPokemon(overrides = {}) {
    return {
        species: "Bulbasaur",
        level: 10,
        hp: 50,
        attack: 40,
        defense: 40,
        speed: 40,
        moves: [{ name: "TACKLE" }],
        ...overrides
    };
}

function createBattleData(playerParty = null, opponentParty = null) {
    return {
        id: "test-battle",
        player: {
            name: "Player",
            party: playerParty || [
                createPokemon({ species: "PlayerMon" })
            ]
        },
        opponent: {
            name: "Opponent",
            party: opponentParty || [
                createPokemon({ species: "OpponentMon" })
            ]
        }
    };
}

function createPreparation(preparedBattle = createBattleData()) {
    const result = preparedBattle.success === undefined
        ? { success: true, ...preparedBattle }
        : preparedBattle;

    return {
        prepareTrainerBattle(trainerId, playerState) {
            return result;
        }
    };
}

function createSimulation(winners = ["PLAYER"]) {
    let index = 0;

    return {
        exact(pokemon) {
            return pokemon;
        },

        random(pokemon) {
            return pokemon;
        },

        bestCase(pokemon) {
            return pokemon;
        },

        worstCase(pokemon) {
            return pokemon;
        },

        simulateBattle(battle) {
            const winner = winners[
                Math.min(index, winners.length - 1)
            ];

            index++;

            return { winner };
        }
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor stores the supplied dependencies", () => {
    const simulation = { simulateBattle() {} };
    const preparation = { prepareTrainerBattle() {} };

    const service = new BattlePredictionService(
        simulation,
        preparation
    );

    assert.equal(service.simulation, simulation);
    assert.equal(service.preparation, preparation);
});

test("constructor defaults both dependencies to null", () => {
    const service = new BattlePredictionService();

    assert.equal(service.simulation, null);
    assert.equal(service.preparation, null);
});

// --------------------------------------------------
// Trainer battle preparation
// --------------------------------------------------

test("predictTrainerBattle fails when preparation is unavailable", () => {
    const service = new BattlePredictionService();

    const result = service.predictTrainerBattle(
        "trainer-1",
        {}
    );

    assert.deepEqual(result, {
        success: false,
        reason: "Battle preparation unavailable"
    });
});

test("predictTrainerBattle requests preparation with trainer ID and player state", () => {
    const calls = [];
    const preparedBattle = createBattleData();

    const preparation = {
        prepareTrainerBattle(trainerId, playerState) {
            calls.push({ trainerId, playerState });
            return preparedBattle;
        }
    };

    const service = new BattlePredictionService(
        createSimulation(["PLAYER"]),
        preparation
    );

    const playerState = { name: "Test Player" };

    service.predictTrainerBattle(
        "trainer-42",
        playerState,
        "EXACT",
        1
    );

    assert.deepEqual(calls, [
        {
            trainerId: "trainer-42",
            playerState
        }
    ]);
});

test("predictTrainerBattle returns preparation failures unchanged", () => {
    const preparationFailure = {
        success: false,
        reason: "Trainer is unavailable",
        details: { trainerId: "trainer-1" }
    };

    const service = new BattlePredictionService(
        createSimulation(),
        createPreparation(preparationFailure)
    );

    const result = service.predictTrainerBattle(
        "trainer-1",
        {},
        "RANDOM",
        5
    );

    assert.equal(result, preparationFailure);
});

test("predictTrainerBattle does not run simulations after preparation fails", () => {
    let simulationCalls = 0;

    const service = new BattlePredictionService(
        {
            simulateBattle() {
                simulationCalls++;
                return { winner: "PLAYER" };
            }
        },
        createPreparation({ success: false, reason: "Failed" })
    );

    service.predictTrainerBattle("trainer-1", {}, "RANDOM", 5);

    assert.equal(simulationCalls, 0);
});

// --------------------------------------------------
// Prediction results
// --------------------------------------------------

test("predictTrainerBattle counts wins correctly", () => {
    const service = new BattlePredictionService(
        createSimulation(["PLAYER"]),
        createPreparation()
    );

    const result = service.predictTrainerBattle(
        "trainer-1",
        {},
        "EXACT",
        5
    );

    assert.equal(result.success, true);
    assert.equal(result.result.wins, 5);
    assert.equal(result.result.losses, 0);
    assert.equal(result.result.draws, 0);
});

test("predictTrainerBattle counts losses correctly", () => {
    const service = new BattlePredictionService(
        createSimulation(["OPPONENT"]),
        createPreparation()
    );

    const result = service.predictTrainerBattle(
        "trainer-1",
        {},
        "EXACT",
        4
    );

    assert.equal(result.result.wins, 0);
    assert.equal(result.result.losses, 4);
    assert.equal(result.result.draws, 0);
});

test("predictTrainerBattle counts draws correctly", () => {
    const service = new BattlePredictionService(
        createSimulation([null]),
        createPreparation()
    );

    const result = service.predictTrainerBattle(
        "trainer-1",
        {},
        "EXACT",
        3
    );

    assert.equal(result.result.wins, 0);
    assert.equal(result.result.losses, 0);
    assert.equal(result.result.draws, 3);
});

test("predictTrainerBattle accumulates mixed results", () => {
    const service = new BattlePredictionService(
        createSimulation([
            "PLAYER",
            "OPPONENT",
            null,
            "PLAYER",
            "OPPONENT"
        ]),
        createPreparation()
    );

    const result = service.predictTrainerBattle(
        "trainer-1",
        {},
        "RANDOM",
        5
    );

    assert.deepEqual(result.result, {
        wins: 2,
        losses: 2,
        draws: 1
    });
});

test("predictTrainerBattle includes the requested trainer ID", () => {
    const service = new BattlePredictionService(
        createSimulation(),
        createPreparation()
    );

    const result = service.predictTrainerBattle(
        "gym-leader-7",
        {},
        "EXACT",
        1
    );

    assert.equal(result.trainerId, "gym-leader-7");
});

test("predictTrainerBattle includes the selected mode", () => {
    const service = new BattlePredictionService(
        createSimulation(),
        createPreparation()
    );

    const result = service.predictTrainerBattle(
        "trainer-1",
        {},
        "BEST_CASE",
        1
    );

    assert.equal(result.mode, "BEST_CASE");
});

test("predictTrainerBattle reports the requested simulation count", () => {
    const service = new BattlePredictionService(
        createSimulation(),
        createPreparation()
    );

    const result = service.predictTrainerBattle(
        "trainer-1",
        {},
        "RANDOM",
        7
    );

    assert.equal(result.simulations, 7);
});

test("predictTrainerBattle runs the requested number of simulations", () => {
    let calls = 0;

    const simulation = {
        random(pokemon) {
            return pokemon;
        },

        simulateBattle() {
            calls++;
            return { winner: "PLAYER" };
        }
    };

    const service = new BattlePredictionService(
        simulation,
        createPreparation()
    );

    service.predictTrainerBattle(
        "trainer-1",
        {},
        "RANDOM",
        12
    );

    assert.equal(calls, 12);
});

test("predictTrainerBattle calculates a 100 percent win rate", () => {
    const service = new BattlePredictionService(
        createSimulation(["PLAYER"]),
        createPreparation()
    );

    const result = service.predictTrainerBattle(
        "trainer-1",
        {},
        "EXACT",
        5
    );

    assert.equal(result.winRate, 100);
});

test("predictTrainerBattle calculates a zero percent win rate for losses", () => {
    const service = new BattlePredictionService(
        createSimulation(["OPPONENT"]),
        createPreparation()
    );

    const result = service.predictTrainerBattle(
        "trainer-1",
        {},
        "EXACT",
        5
    );

    assert.equal(result.winRate, 0);
});

test("predictTrainerBattle floors fractional win percentages", () => {
    const service = new BattlePredictionService(
        createSimulation([
            "PLAYER",
            "PLAYER",
            "OPPONENT"
        ]),
        createPreparation()
    );

    const result = service.predictTrainerBattle(
        "trainer-1",
        {},
        "EXACT",
        3
    );

    assert.equal(result.winRate, 66);
});

// --------------------------------------------------
// Recommendation thresholds
// --------------------------------------------------

test("getRecommendation returns VERY_FAVOURABLE at 80 percent", () => {
    const service = new BattlePredictionService();

    assert.equal(
        service.getRecommendation(8, 2, 10),
        "VERY_FAVOURABLE"
    );
});

test("getRecommendation returns VERY_FAVOURABLE above 80 percent", () => {
    const service = new BattlePredictionService();

    assert.equal(
        service.getRecommendation(9, 1, 10),
        "VERY_FAVOURABLE"
    );
});

test("getRecommendation returns SLIGHT_ADVANTAGE at 50 percent", () => {
    const service = new BattlePredictionService();

    assert.equal(
        service.getRecommendation(5, 5, 10),
        "SLIGHT_ADVANTAGE"
    );
});

test("getRecommendation returns SLIGHT_ADVANTAGE below 80 percent", () => {
    const service = new BattlePredictionService();

    assert.equal(
        service.getRecommendation(7, 3, 10),
        "SLIGHT_ADVANTAGE"
    );
});

test("getRecommendation returns RISKY at 30 percent", () => {
    const service = new BattlePredictionService();

    assert.equal(
        service.getRecommendation(3, 7, 10),
        "RISKY"
    );
});

test("getRecommendation returns RISKY between 30 and 50 percent", () => {
    const service = new BattlePredictionService();

    assert.equal(
        service.getRecommendation(4, 6, 10),
        "RISKY"
    );
});

test("getRecommendation returns UNFAVOURABLE below 30 percent", () => {
    const service = new BattlePredictionService();

    assert.equal(
        service.getRecommendation(2, 8, 10),
        "UNFAVOURABLE"
    );
});

test("getRecommendation uses the win count and total", () => {
    const service = new BattlePredictionService();

    // The implementation accepts losses but determines the
    // recommendation using wins / total.
    assert.equal(
        service.getRecommendation(6, 100, 10),
        "SLIGHT_ADVANTAGE"
    );
});

test("predictTrainerBattle includes the recommendation", () => {
    const service = new BattlePredictionService(
        createSimulation(["PLAYER"]),
        createPreparation()
    );

    const result = service.predictTrainerBattle(
        "trainer-1",
        {},
        "EXACT",
        5
    );

    assert.equal(result.recommendation, "VERY_FAVOURABLE");
});

// --------------------------------------------------
// Applying stat scenarios
// --------------------------------------------------

test("applyScenario returns the original Pokémon without simulation service", () => {
    const service = new BattlePredictionService();
    const pokemon = createPokemon();

    assert.equal(service.applyScenario(pokemon, "EXACT"), pokemon);
});

test("applyScenario uses exact for EXACT mode", () => {
    const pokemon = createPokemon();
    let receivedPokemon;

    const simulation = {
        exact(value) {
            receivedPokemon = value;
            return { ...value, scenario: "EXACT" };
        }
    };

    const service = new BattlePredictionService(simulation);
    const result = service.applyScenario(pokemon, "EXACT");

    assert.equal(receivedPokemon, pokemon);
    assert.equal(result.scenario, "EXACT");
});

test("applyScenario uses bestCase for BEST_CASE mode", () => {
    const pokemon = createPokemon();

    const service = new BattlePredictionService({
        bestCase(value) {
            return { ...value, scenario: "BEST_CASE" };
        }
    });

    assert.equal(
        service.applyScenario(pokemon, "BEST_CASE").scenario,
        "BEST_CASE"
    );
});

test("applyScenario uses worstCase for WORST_CASE mode", () => {
    const pokemon = createPokemon();

    const service = new BattlePredictionService({
        worstCase(value) {
            return { ...value, scenario: "WORST_CASE" };
        }
    });

    assert.equal(
        service.applyScenario(pokemon, "WORST_CASE").scenario,
        "WORST_CASE"
    );
});

test("applyScenario uses random for RANDOM mode", () => {
    const pokemon = createPokemon();

    const service = new BattlePredictionService({
        random(value) {
            return { ...value, scenario: "RANDOM" };
        }
    });

    assert.equal(
        service.applyScenario(pokemon, "RANDOM").scenario,
        "RANDOM"
    );
});

test("applyScenario defaults unknown modes to random", () => {
    const pokemon = createPokemon();

    const service = new BattlePredictionService({
        random(value) {
            return { ...value, scenario: "RANDOM" };
        }
    });

    assert.equal(
        service.applyScenario(pokemon, "UNRECOGNIZED").scenario,
        "RANDOM"
    );
});

// --------------------------------------------------
// Running one simulation
// --------------------------------------------------

test("runSimulation returns DRAW when simulation service is unavailable", () => {
    const service = new BattlePredictionService();

    assert.equal(
        service.runSimulation(createBattleData(), "EXACT"),
        "DRAW"
    );
});

test("runSimulation returns WIN when the player wins", () => {
    const service = new BattlePredictionService(
        createSimulation(["PLAYER"])
    );

    assert.equal(
        service.runSimulation(createBattleData(), "EXACT"),
        "WIN"
    );
});

test("runSimulation returns LOSS when the opponent wins", () => {
    const service = new BattlePredictionService(
        createSimulation(["OPPONENT"])
    );

    assert.equal(
        service.runSimulation(createBattleData(), "EXACT"),
        "LOSS"
    );
});

test("runSimulation returns DRAW for an unrecognized winner", () => {
    const service = new BattlePredictionService({
        exact(pokemon) {
            return pokemon;
        },

        random(pokemon) {
            return pokemon;
        },

        simulateBattle() {
            return { winner: "UNKNOWN" };
        }
    });

    assert.equal(
        service.runSimulation(createBattleData(), "EXACT"),
        "DRAW"
    );
});

test("runSimulation returns DRAW when the result is missing", () => {
    const service = new BattlePredictionService({
        exact(pokemon) {
            return pokemon;
        },

        random(pokemon) {
            return pokemon;
        },

        simulateBattle() {
            return null;
        }
    });

    assert.equal(
        service.runSimulation(createBattleData(), "EXACT"),
        "DRAW"
    );
});

test("runSimulation applies the requested mode to the player party", () => {
    const player = createPokemon({ species: "PlayerMon" });
    const receivedModes = [];

    const simulation = {
        exact(pokemon) {
            receivedModes.push(["player", "EXACT", pokemon.species]);
            return { ...pokemon };
        },
        random(pokemon) {
            receivedModes.push(["random", "RANDOM", pokemon.species]);
            return { ...pokemon };
        },
        simulateBattle() {
            return { winner: "PLAYER" };
        }
    };

    const service = new BattlePredictionService(simulation);

    service.runSimulation(
        createBattleData([player]),
        "EXACT"
    );

    assert.deepEqual(receivedModes, [
        ["player", "EXACT", "PlayerMon"],
        ["random", "RANDOM", "OpponentMon"]
    ]);
});

test("runSimulation always uses RANDOM for the opponent party", () => {
    const received = [];

    const simulation = {
        bestCase(pokemon) {
            received.push(["BEST_CASE", pokemon.species]);
            return { ...pokemon };
        },
        random(pokemon) {
            received.push(["RANDOM", pokemon.species]);
            return { ...pokemon };
        },
        simulateBattle() {
            return { winner: "PLAYER" };
        }
    };

    const service = new BattlePredictionService(simulation);

    service.runSimulation(createBattleData(), "BEST_CASE");

    assert.deepEqual(received, [
        ["BEST_CASE", "PlayerMon"],
        ["RANDOM", "OpponentMon"]
    ]);
});

test("runSimulation preserves battle metadata", () => {
    let receivedBattle;

    const battle = createBattleData();

    const simulation = {
        random(pokemon) {
            return { ...pokemon };
        },
        simulateBattle(simulatedBattle) {
            receivedBattle = simulatedBattle;
            return { winner: "PLAYER" };
        }
    };

    const service = new BattlePredictionService(simulation);

    service.runSimulation(battle, "RANDOM");

    assert.equal(receivedBattle.id, battle.id);
    assert.equal(receivedBattle.player.name, battle.player.name);
    assert.equal(receivedBattle.opponent.name, battle.opponent.name);
});

test("runSimulation creates replacement party arrays", () => {
    const battle = createBattleData();

    let receivedBattle;

    const simulation = {
        random(pokemon) {
            return { ...pokemon };
        },
        simulateBattle(value) {
            receivedBattle = value;
            return { winner: "PLAYER" };
        }
    };

    const service = new BattlePredictionService(simulation);

    service.runSimulation(battle, "RANDOM");

    assert.notEqual(
        receivedBattle.player.party,
        battle.player.party
    );

    assert.notEqual(
        receivedBattle.opponent.party,
        battle.opponent.party
    );
});

test("runSimulation does not replace the original party Pokémon objects", () => {
    const battle = createBattleData();

    let receivedBattle;

    const simulation = {
        random(pokemon) {
            return { ...pokemon };
        },
        simulateBattle(value) {
            receivedBattle = value;
            return { winner: "PLAYER" };
        }
    };

    const service = new BattlePredictionService(simulation);

    service.runSimulation(battle, "RANDOM");

    assert.notEqual(
        receivedBattle.player.party[0],
        battle.player.party[0]
    );

    assert.notEqual(
        receivedBattle.opponent.party[0],
        battle.opponent.party[0]
    );
});

test("runSimulation applies scenarios to every Pokémon in both parties", () => {
    const playerParty = [
        createPokemon({ species: "PlayerOne" }),
        createPokemon({ species: "PlayerTwo" })
    ];

    const opponentParty = [
        createPokemon({ species: "EnemyOne" }),
        createPokemon({ species: "EnemyTwo" })
    ];

    const received = [];

    const simulation = {
        bestCase(pokemon) {
            received.push(["BEST_CASE", pokemon.species]);
            return { ...pokemon };
        },
        random(pokemon) {
            received.push(["RANDOM", pokemon.species]);
            return { ...pokemon };
        },
        simulateBattle() {
            return { winner: "PLAYER" };
        }
    };

    const service = new BattlePredictionService(simulation);

    service.runSimulation(
        createBattleData(playerParty, opponentParty),
        "BEST_CASE"
    );

    assert.deepEqual(received, [
        ["BEST_CASE", "PlayerOne"],
        ["BEST_CASE", "PlayerTwo"],
        ["RANDOM", "EnemyOne"],
        ["RANDOM", "EnemyTwo"]
    ]);
});

test("runSimulation returns DRAW if simulateBattle has no winner field", () => {
    const service = new BattlePredictionService({
        random(pokemon) {
            return pokemon;
        },
        simulateBattle() {
            return {};
        }
    });

    assert.equal(
        service.runSimulation(createBattleData(), "RANDOM"),
        "DRAW"
    );
});

// --------------------------------------------------
// Integration between prediction and simulation
// --------------------------------------------------

test("predictTrainerBattle runs the configured mode in every simulation", () => {
    const modesUsed = [];

    const simulation = {
        exact(pokemon) {
            modesUsed.push("EXACT");
            return { ...pokemon };
        },
        random(pokemon) {
            modesUsed.push("RANDOM");
            return { ...pokemon };
        },
        simulateBattle() {
            return { winner: "PLAYER" };
        }
    };

    const service = new BattlePredictionService(
        simulation,
        createPreparation()
    );

    service.predictTrainerBattle(
        "trainer-1",
        {},
        "EXACT",
        3
    );

    assert.equal(modesUsed.filter(mode => mode === "EXACT").length, 3);
    assert.equal(modesUsed.filter(mode => mode === "RANDOM").length, 3);
});

test("predictTrainerBattle can return a draw-only prediction", () => {
    const service = new BattlePredictionService(
        createSimulation([null]),
        createPreparation()
    );

    const result = service.predictTrainerBattle(
        "trainer-1",
        {},
        "RANDOM",
        4
    );

    assert.deepEqual(result.result, {
        wins: 0,
        losses: 0,
        draws: 4
    });

    assert.equal(result.winRate, 0);
    assert.equal(result.recommendation, "UNFAVOURABLE");
});
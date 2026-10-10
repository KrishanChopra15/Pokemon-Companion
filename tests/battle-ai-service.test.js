"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattleAIService = require(
    "../scripts/services/battle-ai-service.js"
);

// --------------------------------
// Test helpers
// --------------------------------

function createPokemon(name = "Bulbasaur", overrides = {}) {
    return {
        name,
        species: name.toUpperCase(),
        level: 10,
        hp: 30,
        type: "GRASS",
        moves: [],
        ...overrides
    };
}

function createMove(name, overrides = {}) {
    return {
        name,
        power: 40,
        accuracy: 100,
        effectiveness: 1,
        pp: 10,
        ...overrides
    };
}

function createService() {
    return new BattleAIService();
}

function withMockedRandom(values, callback) {
    const originalRandom = Math.random;
    let index = 0;

    Math.random = () => {
        const value = values[Math.min(index, values.length - 1)];
        index++;
        return value;
    };

    try {
        return callback();
    } finally {
        Math.random = originalRandom;
    }
}

// --------------------------------
// Constructor and difficulty
// --------------------------------

test("BattleAIService initializes all supported difficulty levels", () => {
    const service = createService();

    assert.deepEqual(service.difficulties, {
        EASY: { randomness: 0.7 },
        NORMAL: { randomness: 0.4 },
        HARD: { randomness: 0.1 }
    });
});

test("getDifficulty returns EASY settings", () => {
    const service = createService();

    assert.deepEqual(
        service.getDifficulty("EASY"),
        { randomness: 0.7 }
    );
});

test("getDifficulty returns NORMAL settings", () => {
    const service = createService();

    assert.deepEqual(
        service.getDifficulty("NORMAL"),
        { randomness: 0.4 }
    );
});

test("getDifficulty returns HARD settings", () => {
    const service = createService();

    assert.deepEqual(
        service.getDifficulty("HARD"),
        { randomness: 0.1 }
    );
});

test("getDifficulty defaults to NORMAL for an unknown level", () => {
    const service = createService();

    assert.deepEqual(
        service.getDifficulty("EXPERT"),
        { randomness: 0.4 }
    );
});

test("getDifficulty defaults to NORMAL for a missing level", () => {
    const service = createService();

    assert.deepEqual(
        service.getDifficulty(undefined),
        { randomness: 0.4 }
    );
});

// --------------------------------
// Move evaluation
// --------------------------------

test("evaluateMove returns one for a string move", () => {
    const service = createService();

    assert.equal(
        service.evaluateMove(
            createPokemon(),
            createPokemon("Charmander"),
            "Tackle"
        ),
        1
    );
});

test("evaluateMove scores a move using its power", () => {
    const service = createService();

    assert.equal(
        service.evaluateMove(
            createPokemon(),
            createPokemon("Charmander"),
            createMove("Tackle", { power: 60 })
        ),
        60
    );
});

test("evaluateMove multiplies the score by move accuracy", () => {
    const service = createService();

    assert.equal(
        service.evaluateMove(
            createPokemon(),
            createPokemon("Charmander"),
            createMove("Tackle", {
                power: 80,
                accuracy: 50
            })
        ),
        40
    );
});

test("evaluateMove multiplies the score by effectiveness", () => {
    const service = createService();

    assert.equal(
        service.evaluateMove(
            createPokemon(),
            createPokemon("Charmander"),
            createMove("Tackle", {
                power: 40,
                effectiveness: 2
            })
        ),
        80
    );
});

test("evaluateMove applies accuracy and effectiveness together", () => {
    const service = createService();

    assert.equal(
        service.evaluateMove(
            createPokemon(),
            createPokemon("Charmander"),
            createMove("Tackle", {
                power: 100,
                accuracy: 80,
                effectiveness: 2
            })
        ),
        160
    );
});

test("evaluateMove treats zero power as a score of zero", () => {
    const service = createService();

    assert.equal(
        service.evaluateMove(
            createPokemon(),
            createPokemon("Charmander"),
            createMove("Growl", { power: 0 })
        ),
        0
    );
});

test("evaluateMove uses zero power when power is missing", () => {
    const service = createService();

    assert.equal(
        service.evaluateMove(
            createPokemon(),
            createPokemon("Charmander"),
            { name: "Status Move" }
        ),
        0
    );
});

test("evaluateMove does not apply a falsy accuracy multiplier", () => {
    const service = createService();

    assert.equal(
        service.evaluateMove(
            createPokemon(),
            createPokemon("Charmander"),
            createMove("Tackle", {
                power: 50,
                accuracy: 0
            })
        ),
        50
    );
});

test("evaluateMove does not apply a falsy effectiveness multiplier", () => {
    const service = createService();

    assert.equal(
        service.evaluateMove(
            createPokemon(),
            createPokemon("Charmander"),
            createMove("Tackle", {
                power: 50,
                effectiveness: 0
            })
        ),
        50
    );
});

// --------------------------------
// Best move selection
// --------------------------------

test("getBestMove selects the highest-scoring move", () => {
    const service = createService();

    const weakMove = createMove("Tackle", {
        power: 40
    });

    const strongMove = createMove("Flamethrower", {
        power: 90
    });

    const bestMove = service.getBestMove(
        createPokemon(),
        createPokemon("Bulbasaur"),
        [weakMove, strongMove]
    );

    assert.strictEqual(bestMove, strongMove);
});

test("getBestMove keeps the first move when scores are tied", () => {
    const service = createService();

    const firstMove = createMove("Tackle", {
        power: 40
    });

    const secondMove = createMove("Scratch", {
        power: 40
    });

    const bestMove = service.getBestMove(
        createPokemon(),
        createPokemon("Charmander"),
        [firstMove, secondMove]
    );

    assert.strictEqual(bestMove, firstMove);
});

test("getBestMove evaluates every supplied move", () => {
    const service = createService();
    const evaluated = [];

    service.evaluateMove = (_pokemon, _opponent, move) => {
        evaluated.push(move);
        return move.score;
    };

    const moves = [
        { name: "Move A", score: 1 },
        { name: "Move B", score: 5 },
        { name: "Move C", score: 3 }
    ];

    const result = service.getBestMove(
        createPokemon(),
        createPokemon("Charmander"),
        moves
    );

    assert.deepEqual(evaluated, moves);
    assert.strictEqual(result, moves[1]);
});

test("getBestMove returns the supplied move when it is the only option", () => {
    const service = createService();
    const move = createMove("Tackle");

    assert.strictEqual(
        service.getBestMove(
            createPokemon(),
            createPokemon("Charmander"),
            [move]
        ),
        move
    );
});

// --------------------------------
// Random and strategic move choice
// --------------------------------

test("chooseMove returns null when moves are missing", () => {
    const service = createService();

    assert.equal(
        service.chooseMove(
            createPokemon(),
            createPokemon("Charmander"),
            null
        ),
        null
    );
});

test("chooseMove returns null when the moves array is empty", () => {
    const service = createService();

    assert.equal(
        service.chooseMove(
            createPokemon(),
            createPokemon("Charmander"),
            []
        ),
        null
    );
});

test("chooseMove can select a random move on EASY difficulty", () => {
    const service = createService();

    const firstMove = createMove("Tackle");
    const secondMove = createMove("Growl");

    const result = withMockedRandom([0.1, 0.75], () =>
        service.chooseMove(
            createPokemon(),
            createPokemon("Charmander"),
            [firstMove, secondMove],
            "EASY"
        )
    );

    assert.strictEqual(result, secondMove);
});

test("chooseMove can select a random move on NORMAL difficulty", () => {
    const service = createService();

    const firstMove = createMove("Tackle");
    const secondMove = createMove("Growl");

    const result = withMockedRandom([0.2, 0.1], () =>
        service.chooseMove(
            createPokemon(),
            createPokemon("Charmander"),
            [firstMove, secondMove],
            "NORMAL"
        )
    );

    assert.strictEqual(result, firstMove);
});

test("chooseMove uses the best move when random selection is not triggered", () => {
    const service = createService();

    const weakMove = createMove("Tackle", { power: 30 });
    const strongMove = createMove("Flamethrower", { power: 90 });

    const result = withMockedRandom([0.99], () =>
        service.chooseMove(
            createPokemon(),
            createPokemon("Charmander"),
            [weakMove, strongMove],
            "NORMAL"
        )
    );

    assert.strictEqual(result, strongMove);
});

test("chooseMove can select randomly on HARD difficulty when the random value is below its threshold", () => {
    const service = createService();

    const firstMove = createMove("Tackle");
    const secondMove = createMove("Growl");

    const result = withMockedRandom([0.05, 0.9], () =>
        service.chooseMove(
            createPokemon(),
            createPokemon("Charmander"),
            [firstMove, secondMove],
            "HARD"
        )
    );

    assert.strictEqual(result, secondMove);
});

test("chooseMove falls back to best-move selection for an unknown difficulty", () => {
    const service = createService();

    const weakMove = createMove("Tackle", { power: 30 });
    const strongMove = createMove("Flamethrower", { power: 90 });

    const result = withMockedRandom([0.99], () =>
        service.chooseMove(
            createPokemon(),
            createPokemon("Charmander"),
            [weakMove, strongMove],
            "UNKNOWN"
        )
    );

    assert.strictEqual(result, strongMove);
});

// --------------------------------
// Enemy move selection
// --------------------------------

test("chooseEnemyMove returns null when the Pokémon is missing", () => {
    const service = createService();

    assert.equal(
        service.chooseEnemyMove(null, createPokemon()),
        null
    );
});

test("chooseEnemyMove uses STRUGGLE when the Pokémon has no moves", () => {
    const service = createService();

    assert.deepEqual(
        service.chooseEnemyMove(
            createPokemon("Charmander", { moves: [] }),
            createPokemon()
        ),
        service.getStruggleMove()
    );
});

test("chooseEnemyMove uses STRUGGLE when every numeric PP value is exhausted", () => {
    const service = createService();

    const pokemon = createPokemon("Charmander", {
        moves: [
            createMove("Tackle", { pp: 0 }),
            createMove("Growl", { pp: -1 })
        ]
    });

    const result = service.chooseEnemyMove(
        pokemon,
        createPokemon()
    );

    assert.deepEqual(result, service.getStruggleMove());
});

test("chooseEnemyMove excludes moves with zero PP", () => {
    const service = createService();

    const exhaustedMove = createMove("Tackle", {
        pp: 0,
        power: 100
    });

    const usableMove = createMove("Scratch", {
        pp: 5,
        power: 40
    });

    const pokemon = createPokemon("Charmander", {
        moves: [exhaustedMove, usableMove]
    });

    service.chooseMove = (_pokemon, _opponent, moves) => moves[0];

    const result = service.chooseEnemyMove(
        pokemon,
        createPokemon()
    );

    assert.strictEqual(result, usableMove);
});

test("chooseEnemyMove treats moves without numeric PP as usable", () => {
    const service = createService();

    const move = {
        name: "Tackle",
        power: 40
    };

    const pokemon = createPokemon("Charmander", {
        moves: [move]
    });

    service.chooseMove = (_pokemon, _opponent, moves) => moves[0];

    assert.strictEqual(
        service.chooseEnemyMove(pokemon, createPokemon()),
        move
    );
});

test("chooseEnemyMove forwards the requested difficulty", () => {
    const service = createService();
    let receivedDifficulty;

    service.chooseMove = (_pokemon, _opponent, moves, difficulty) => {
        receivedDifficulty = difficulty;
        return moves[0];
    };

    const move = createMove("Tackle");

    const result = service.chooseEnemyMove(
        createPokemon("Charmander", {
            moves: [move]
        }),
        createPokemon(),
        "HARD"
    );

    assert.strictEqual(result, move);
    assert.equal(receivedDifficulty, "HARD");
});

// --------------------------------
// Matchup evaluation
// --------------------------------

test("evaluateMatchup rewards a higher-level attacker", () => {
    const service = createService();

    assert.equal(
        service.evaluateMatchup(
            createPokemon("Charmander", { level: 15 }),
            createPokemon("Bulbasaur", { level: 10 })
        ),
        10
    );
});

test("evaluateMatchup penalizes an attacker that is not higher level", () => {
    const service = createService();

    assert.equal(
        service.evaluateMatchup(
            createPokemon("Charmander", { level: 10 }),
            createPokemon("Bulbasaur", { level: 10 })
        ),
        -10
    );

    assert.equal(
        service.evaluateMatchup(
            createPokemon("Charmander", { level: 5 }),
            createPokemon("Bulbasaur", { level: 10 })
        ),
        -10
    );
});

test("evaluateMatchup adds the type-advantage score", () => {
    const service = createService();

    assert.equal(
        service.evaluateMatchup(
            createPokemon("Charmander", {
                level: 15,
                type: "FIRE"
            }),
            createPokemon("Bulbasaur", {
                level: 10,
                type: "GRASS"
            })
        ),
        30
    );
});

test("evaluateMatchup does not add type advantage when the type fields are missing", () => {
    const service = createService();

    assert.equal(
        service.evaluateMatchup(
            createPokemon("Charmander", {
                level: 15,
                type: undefined
            }),
            createPokemon("Bulbasaur", {
                level: 10,
                type: undefined
            })
        ),
        10
    );
});

// --------------------------------
// Type advantage
// --------------------------------

test("typeAdvantage recognizes FIRE advantages", () => {
    const service = createService();

    assert.equal(service.typeAdvantage("FIRE", "GRASS"), 20);
    assert.equal(service.typeAdvantage("FIRE", "ICE"), 20);
    assert.equal(service.typeAdvantage("FIRE", "BUG"), 20);
});

test("typeAdvantage recognizes WATER advantages", () => {
    const service = createService();

    assert.equal(service.typeAdvantage("WATER", "FIRE"), 20);
    assert.equal(service.typeAdvantage("WATER", "GROUND"), 20);
    assert.equal(service.typeAdvantage("WATER", "ROCK"), 20);
});

test("typeAdvantage recognizes ELECTRIC advantages", () => {
    const service = createService();

    assert.equal(service.typeAdvantage("ELECTRIC", "WATER"), 20);
    assert.equal(service.typeAdvantage("ELECTRIC", "FLYING"), 20);
});

test("typeAdvantage recognizes GRASS advantages", () => {
    const service = createService();

    assert.equal(service.typeAdvantage("GRASS", "WATER"), 20);
    assert.equal(service.typeAdvantage("GRASS", "GROUND"), 20);
    assert.equal(service.typeAdvantage("GRASS", "ROCK"), 20);
});

test("typeAdvantage returns zero for an unlisted matchup", () => {
    const service = createService();

    assert.equal(service.typeAdvantage("FIRE", "WATER"), 0);
    assert.equal(service.typeAdvantage("WATER", "GRASS"), 0);
    assert.equal(service.typeAdvantage("NORMAL", "GHOST"), 0);
});

test("typeAdvantage uses the supplied type strings as written", () => {
    const service = createService();

    assert.equal(service.typeAdvantage("fire", "grass"), 0);
    assert.equal(service.typeAdvantage("FIRE", "grass"), 0);
});

// --------------------------------
// Battle prediction
// --------------------------------

test("predictBattle returns PLAYER when the player score is higher", () => {
    const service = createService();

    const result = service.predictBattle(
        [
            createPokemon("Charmander", {
                level: 20,
                type: "FIRE"
            })
        ],
        [
            createPokemon("Bulbasaur", {
                level: 10,
                type: "GRASS"
            })
        ]
    );

    assert.equal(result.winner, "PLAYER");
    assert.equal(result.playerScore, 30);
    assert.equal(result.opponentScore, 0);
});

test("predictBattle returns OPPONENT when the opponent score is higher", () => {
    const service = createService();

    const result = service.predictBattle(
        [
            createPokemon("Bulbasaur", {
                level: 5,
                type: "GRASS"
            })
        ],
        [
            createPokemon("Charmander", {
                level: 15,
                type: "FIRE"
            })
        ]
    );

    assert.equal(result.winner, "OPPONENT");
    assert.equal(result.playerScore, 0);
    assert.equal(result.opponentScore, 10);
});

test("predictBattle gives the player the result when scores are tied", () => {
    const service = new BattleAIService();

    const playerTeam = [
        createPokemon("Charmander", { level: 20, type: null }),
        createPokemon("Bulbasaur", { level: 1, type: null })
    ];

    const opponentTeam = [
        createPokemon("Squirtle", { level: 10, type: null })
    ];

    const result = service.predictBattle(playerTeam, opponentTeam);

    assert.equal(result.playerScore, 10);
    assert.equal(result.opponentScore, 10);
    assert.equal(result.winner, "PLAYER");
});

test("predictBattle accumulates scores across multiple matchups", () => {
    const service = createService();

    const result = service.predictBattle(
        [
            createPokemon("Charmander", {
                level: 20,
                type: "FIRE"
            }),
            createPokemon("Squirtle", {
                level: 10,
                type: "WATER"
            })
        ],
        [
            createPokemon("Bulbasaur", {
                level: 10,
                type: "GRASS"
            })
        ]
    );

    assert.equal(result.playerScore, 30);
    assert.equal(result.opponentScore, 10);
    assert.equal(result.winner, "PLAYER");
});

test("predictBattle returns player victory for two empty teams", () => {
    const service = createService();

    assert.deepEqual(
        service.predictBattle([], []),
        {
            winner: "PLAYER",
            playerScore: 0,
            opponentScore: 0
        }
    );
});

// --------------------------------
// Switch decisions
// --------------------------------

test("shouldSwitch returns false for a missing Pokémon", () => {
    const service = createService();

    assert.equal(service.shouldSwitch(null), false);
});

test("shouldSwitch returns true when HP is zero", () => {
    const service = createService();

    assert.equal(
        service.shouldSwitch(
            createPokemon("Bulbasaur", { hp: 0 })
        ),
        true
    );
});

test("shouldSwitch returns true when HP is negative", () => {
    const service = createService();

    assert.equal(
        service.shouldSwitch(
            createPokemon("Bulbasaur", { hp: -1 })
        ),
        true
    );
});

test("shouldSwitch returns false when the Pokémon is alive", () => {
    const service = createService();

    assert.equal(
        service.shouldSwitch(
            createPokemon("Bulbasaur", { hp: 1 })
        ),
        false
    );
});

test("chooseSwitch returns null for a missing team", () => {
    const service = createService();

    assert.equal(service.chooseSwitch(null), null);
});

test("chooseSwitch selects the first living Pokémon", () => {
    const service = createService();

    const fainted = createPokemon("Bulbasaur", { hp: 0 });
    const firstAlive = createPokemon("Squirtle", { hp: 10 });
    const secondAlive = createPokemon("Charmander", { hp: 20 });

    assert.strictEqual(
        service.chooseSwitch([
            fainted,
            firstAlive,
            secondAlive
        ]),
        firstAlive
    );
});

test("chooseSwitch returns null when all team members have fainted", () => {
    const service = createService();

    assert.equal(
        service.chooseSwitch([
            createPokemon("Bulbasaur", { hp: 0 }),
            createPokemon("Squirtle", { hp: -1 })
        ]),
        null
    );
});

test("chooseSwitch preserves the selected Pokémon object identity", () => {
    const service = createService();
    const pokemon = createPokemon("Squirtle", { hp: 10 });

    assert.strictEqual(
        service.chooseSwitch([pokemon]),
        pokemon
    );
});

// --------------------------------
// STRUGGLE fallback
// --------------------------------

test("getStruggleMove returns the expected STRUGGLE data", () => {
    const service = createService();

    assert.deepEqual(service.getStruggleMove(), {
        name: "STRUGGLE",
        constant: "MOVE_STRUGGLE",
        type: "NORMAL",
        category: "PHYSICAL",
        power: 50,
        accuracy: 100,
        priority: 0,
        pp: 1,
        maxPP: 1
    });
});

test("getStruggleMove returns a fresh move object for each call", () => {
    const service = createService();

    const first = service.getStruggleMove();
    const second = service.getStruggleMove();

    assert.notStrictEqual(first, second);
    assert.deepEqual(first, second);
});

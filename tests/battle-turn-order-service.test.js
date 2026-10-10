"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattleTurnOrderService = require(
    "../scripts/services/battle-turn-order-service.js"
);

// --------------------------------
// Test helpers
// --------------------------------

function createPokemon(name, speed, overrides = {}) {
    return {
        name,
        species: name.toUpperCase(),
        speed,
        statStages: {
            speed: 0
        },
        ...overrides
    };
}

function createBattle(player, opponent) {
    return {
        id: "BATTLE_1",
        player: {
            party: [player],
            active: 0
        },
        opponent: {
            party: [opponent],
            active: 0
        }
    };
}

function createService() {
    return new BattleTurnOrderService({
        getActivePokemon(side) {
            if (!side || !Array.isArray(side.party)) {
                return null;
            }

            return side.party[side.active ?? 0] || null;
        }
    });
}

function withMockedRandom(value, callback) {
    const originalRandom = Math.random;

    Math.random = () => value;

    try {
        return callback();
    } finally {
        Math.random = originalRandom;
    }
}

// --------------------------------
// Constructor
// --------------------------------

test("BattleTurnOrderService stores the Pokémon service", () => {
    const pokemonService = {
        getActivePokemon() {
            return null;
        }
    };

    const service = new BattleTurnOrderService(pokemonService);

    assert.equal(service.battlePokemon, pokemonService);
});

test("BattleTurnOrderService supports a missing Pokémon service", () => {
    const service = new BattleTurnOrderService();

    assert.equal(service.battlePokemon, null);
});

// --------------------------------
// Move priority
// --------------------------------

test("getMovePriority returns zero for a missing move", () => {
    const service = createService();

    assert.equal(service.getMovePriority(null), 0);
    assert.equal(service.getMovePriority(undefined), 0);
});

test("getMovePriority returns a numeric priority", () => {
    const service = createService();

    assert.equal(
        service.getMovePriority({ priority: 2 }),
        2
    );

    assert.equal(
        service.getMovePriority({ priority: -1 }),
        -1
    );
});

test("getMovePriority defaults a missing priority to zero", () => {
    const service = createService();

    assert.equal(
        service.getMovePriority({ name: "Tackle" }),
        0
    );
});

test("getMovePriority defaults a nonnumeric priority to zero", () => {
    const service = createService();

    assert.equal(
        service.getMovePriority({ priority: "2" }),
        0
    );
});

// --------------------------------
// Speed calculation
// --------------------------------

test("getSpeed returns zero for a missing Pokémon", () => {
    const service = createService();

    assert.equal(service.getSpeed(null), 0);
});

test("getSpeed uses the Pokémon's direct speed stat", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(createPokemon("Bulbasaur", 45)),
        45
    );
});

test("getSpeed falls back to stats.speed", () => {
    const service = createService();

    assert.equal(
        service.getSpeed({
            stats: {
                speed: 63
            }
        }),
        63
    );
});

test("getSpeed defaults to a base speed of one when speed data is missing", () => {
    const service = createService();

    assert.equal(service.getSpeed({}), 1);
});

test("getSpeed defaults a zero stats.speed fallback to one", () => {
    const service = createService();

    assert.equal(
        service.getSpeed({
            stats: {
                speed: 0
            }
        }),
        1
    );
});

test("getSpeed floors fractional speed", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(createPokemon("Bulbasaur", 12.9)),
        12
    );
});

test("getSpeed never returns less than one for ordinary numeric inputs", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(createPokemon("Bulbasaur", 0)),
        1
    );

    assert.equal(
        service.getSpeed(createPokemon("Bulbasaur", -10)),
        1
    );
});

// --------------------------------
// Speed stages
// --------------------------------

test("getSpeed applies a positive Speed stage", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(
            createPokemon("Bulbasaur", 40, {
                statStages: {
                    speed: 1
                }
            })
        ),
        60
    );
});

test("getSpeed applies a negative Speed stage", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(
            createPokemon("Bulbasaur", 60, {
                statStages: {
                    speed: -1
                }
            })
        ),
        40
    );
});

test("getSpeed applies the maximum positive Speed stage", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(
            createPokemon("Bulbasaur", 10, {
                statStages: {
                    speed: 6
                }
            })
        ),
        40
    );
});

test("getSpeed applies the maximum negative Speed stage", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(
            createPokemon("Bulbasaur", 80, {
                statStages: {
                    speed: -6
                }
            })
        ),
        20
    );
});

test("getSpeed clamps an excessive positive Speed stage to six", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(
            createPokemon("Bulbasaur", 10, {
                statStages: {
                    speed: 10
                }
            })
        ),
        40
    );
});

test("getSpeed clamps an excessive negative Speed stage to minus six", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(
            createPokemon("Bulbasaur", 80, {
                statStages: {
                    speed: -10
                }
            })
        ),
        20
    );
});

test("getSpeed defaults a missing Speed stage to zero", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(
            createPokemon("Bulbasaur", 45, {
                statStages: {}
            })
        ),
        45
    );
});

test("applyStatStage preserves the stat at stage zero", () => {
    const service = createService();

    assert.equal(service.applyStatStage(50, 0), 50);
});

test("applyStatStage calculates positive stage multipliers", () => {
    const service = createService();

    assert.equal(service.applyStatStage(40, 1), 60);
    assert.equal(service.applyStatStage(40, 2), 80);
    assert.equal(service.applyStatStage(40, 3), 100);
});

test("applyStatStage calculates negative stage multipliers", () => {
    const service = createService();

    assert.equal(service.applyStatStage(60, -1), 40);
    assert.equal(service.applyStatStage(60, -2), 30);
    assert.equal(service.applyStatStage(60, -3), 24);
});

test("applyStatStage floors fractional results", () => {
    const service = createService();

    assert.equal(service.applyStatStage(41, 1), 61);
    assert.equal(service.applyStatStage(41, -1), 27);
});

// --------------------------------
// Paralysis
// --------------------------------

test("getSpeed applies the paralysis Speed reduction", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(
            createPokemon("Bulbasaur", 100, {
                status: "PARALYSIS"
            })
        ),
        25
    );
});

test("getSpeed applies paralysis after the Speed stage", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(
            createPokemon("Bulbasaur", 80, {
                status: "PARALYSIS",
                statStages: {
                    speed: 1
                }
            })
        ),
        30
    );
});

test("getSpeed keeps a paralyzed Pokémon at a minimum effective Speed of one", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(
            createPokemon("Bulbasaur", 1, {
                status: "PARALYSIS"
            })
        ),
        1
    );
});

test("getSpeed does not apply paralysis reduction to other statuses", () => {
    const service = createService();

    assert.equal(
        service.getSpeed(
            createPokemon("Bulbasaur", 80, {
                status: "BURN"
            })
        ),
        80
    );
});

// --------------------------------
// Turn-order validation
// --------------------------------

test("getTurnOrder returns an empty array for a missing battle", () => {
    const service = createService();

    assert.deepEqual(
        service.getTurnOrder(null, {}, {}),
        []
    );
});

test("getTurnOrder returns an empty array when the player side is missing", () => {
    const service = createService();

    assert.deepEqual(
        service.getTurnOrder(
            {
                opponent: {
                    party: [createPokemon("Charmander", 40)],
                    active: 0
                }
            },
            {},
            {}
        ),
        []
    );
});

test("getTurnOrder returns an empty array when the opponent side is missing", () => {
    const service = createService();

    assert.deepEqual(
        service.getTurnOrder(
            {
                player: {
                    party: [createPokemon("Bulbasaur", 40)],
                    active: 0
                }
            },
            {},
            {}
        ),
        []
    );
});

// --------------------------------
// Priority ordering
// --------------------------------

test("getTurnOrder gives the player the first move when player priority is higher", () => {
    const service = createService();

    const player = createPokemon("Bulbasaur", 10);
    const enemy = createPokemon("Charmander", 200);

    const battle = createBattle(player, enemy);

    const playerMove = {
        name: "Quick Attack",
        priority: 1
    };

    const enemyMove = {
        name: "Tackle",
        priority: 0
    };

    const order = service.getTurnOrder(
        battle,
        playerMove,
        enemyMove
    );

    assert.deepEqual(
        order.map(action => action.side),
        ["PLAYER", "OPPONENT"]
    );

    assert.strictEqual(order[0].move, playerMove);
    assert.strictEqual(order[1].move, enemyMove);
});

test("getTurnOrder gives the opponent the first move when opponent priority is higher", () => {
    const service = createService();

    const battle = createBattle(
        createPokemon("Bulbasaur", 200),
        createPokemon("Charmander", 10)
    );

    const playerMove = {
        name: "Tackle",
        priority: 0
    };

    const enemyMove = {
        name: "Quick Attack",
        priority: 1
    };

    const order = service.getTurnOrder(
        battle,
        playerMove,
        enemyMove
    );

    assert.deepEqual(
        order.map(action => action.side),
        ["OPPONENT", "PLAYER"]
    );

    assert.strictEqual(order[0].move, enemyMove);
    assert.strictEqual(order[1].move, playerMove);
});

test("getTurnOrder uses Speed when move priorities are equal", () => {
    const service = createService();

    const battle = createBattle(
        createPokemon("Bulbasaur", 100),
        createPokemon("Charmander", 50)
    );

    const playerMove = {
        name: "Tackle",
        priority: 0
    };

    const enemyMove = {
        name: "Scratch",
        priority: 0
    };

    const order = service.getTurnOrder(
        battle,
        playerMove,
        enemyMove
    );

    assert.deepEqual(
        order.map(action => action.side),
        ["PLAYER", "OPPONENT"]
    );
});

test("getTurnOrder lets priority override a Speed disadvantage", () => {
    const service = createService();

    const battle = createBattle(
        createPokemon("Bulbasaur", 10),
        createPokemon("Charmander", 200)
    );

    const order = service.getTurnOrder(
        battle,
        {
            name: "Quick Attack",
            priority: 1
        },
        {
            name: "Tackle",
            priority: 0
        }
    );

    assert.deepEqual(
        order.map(action => action.side),
        ["PLAYER", "OPPONENT"]
    );
});

test("getTurnOrder uses the opponent's Speed after player Speed is reduced by paralysis", () => {
    const service = createService();

    const battle = createBattle(
        createPokemon("Bulbasaur", 100, {
            status: "PARALYSIS"
        }),
        createPokemon("Charmander", 40)
    );

    const order = service.getTurnOrder(
        battle,
        { name: "Tackle", priority: 0 },
        { name: "Scratch", priority: 0 }
    );

    assert.deepEqual(
        order.map(action => action.side),
        ["OPPONENT", "PLAYER"]
    );
});

// --------------------------------
// Speed tie
// --------------------------------

test("getTurnOrder chooses the player first when the Speed-tie random value is below 0.5", () => {
    const service = createService();

    const battle = createBattle(
        createPokemon("Bulbasaur", 50),
        createPokemon("Charmander", 50)
    );

    const playerMove = { name: "Tackle", priority: 0 };
    const enemyMove = { name: "Scratch", priority: 0 };

    const order = withMockedRandom(0.25, () =>
        service.getTurnOrder(
            battle,
            playerMove,
            enemyMove
        )
    );

    assert.deepEqual(
        order.map(action => action.side),
        ["PLAYER", "OPPONENT"]
    );
});

test("getTurnOrder chooses the opponent first when the Speed-tie random value is at least 0.5", () => {
    const service = createService();

    const battle = createBattle(
        createPokemon("Bulbasaur", 50),
        createPokemon("Charmander", 50)
    );

    const playerMove = { name: "Tackle", priority: 0 };
    const enemyMove = { name: "Scratch", priority: 0 };

    const order = withMockedRandom(0.5, () =>
        service.getTurnOrder(
            battle,
            playerMove,
            enemyMove
        )
    );

    assert.deepEqual(
        order.map(action => action.side),
        ["OPPONENT", "PLAYER"]
    );
});

test("getTurnOrder preserves the supplied move objects in a Speed tie", () => {
    const service = createService();

    const battle = createBattle(
        createPokemon("Bulbasaur", 50),
        createPokemon("Charmander", 50)
    );

    const playerMove = { name: "Tackle" };
    const enemyMove = { name: "Scratch" };

    const order = withMockedRandom(0.1, () =>
        service.getTurnOrder(
            battle,
            playerMove,
            enemyMove
        )
    );

    assert.strictEqual(order[0].move, playerMove);
    assert.strictEqual(order[1].move, enemyMove);
});

// --------------------------------
// Shared-state integrity
// --------------------------------

test("getTurnOrder does not modify Pokémon speed or stages", () => {
    const service = createService();

    const player = createPokemon("Bulbasaur", 80, {
        statStages: {
            speed: 2
        }
    });

    const enemy = createPokemon("Charmander", 40, {
        statStages: {
            speed: -1
        }
    });

    const beforePlayer = structuredClone(player);
    const beforeEnemy = structuredClone(enemy);

    service.getTurnOrder(
        createBattle(player, enemy),
        { priority: 0 },
        { priority: 0 }
    );

    assert.deepEqual(player, beforePlayer);
    assert.deepEqual(enemy, beforeEnemy);
});

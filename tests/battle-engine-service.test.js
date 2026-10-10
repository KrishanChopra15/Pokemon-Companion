"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattleEngineService = require(
    "../scripts/services/battle-engine-service.js"
);

// --------------------------------
// Test helpers
// --------------------------------

function createPokemon(name = "Bulbasaur", hp = 20) {
    return {
        name,
        species: name.toUpperCase(),
        hp,
        maxHP: 20
    };
}

function createBattle(overrides = {}) {
    return {
        id: "BATTLE_1",
        status: "ACTIVE",
        turn: 1,
        result: null,
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

function createService(flow = null, pokemon = null) {
    return new BattleEngineService(flow, pokemon);
}

// --------------------------------
// Constructor
// --------------------------------

test("BattleEngineService stores its dependencies", () => {
    const flow = {};
    const pokemon = {};

    const service = createService(flow, pokemon);

    assert.equal(service.flow, flow);
    assert.equal(service.pokemon, pokemon);
});

test("BattleEngineService supports missing dependencies", () => {
    const service = createService();

    assert.equal(service.flow, null);
    assert.equal(service.pokemon, null);
});

// --------------------------------
// Initialize battle: validation
// --------------------------------

test("BattleEngineService rejects a missing battle", () => {
    const service = createService();

    const result = service.initializeBattle(null);

    assert.deepEqual(result, {
        success: false,
        reason: "Invalid battle data"
    });
});

test("BattleEngineService rejects a battle without an ID", () => {
    const service = createService();
    const battle = createBattle({ id: undefined });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid battle data");
});

test("BattleEngineService rejects a battle with an empty ID", () => {
    const service = createService();
    const battle = createBattle({ id: "" });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid battle data");
});

test("BattleEngineService rejects a battle without a player", () => {
    const service = createService();
    const battle = createBattle({ player: null });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid battle data");
});

test("BattleEngineService rejects a battle without an opponent", () => {
    const service = createService();
    const battle = createBattle({ opponent: null });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid battle data");
});

test("BattleEngineService rejects a player without a party array", () => {
    const service = createService();

    const battle = createBattle({
        player: {
            active: 0,
            party: null
        }
    });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid battle data");
});

test("BattleEngineService rejects an opponent without a party array", () => {
    const service = createService();

    const battle = createBattle({
        opponent: {
            active: 0,
            party: {}
        }
    });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid battle data");
});

// --------------------------------
// Initialize battle: metadata
// --------------------------------

test("BattleEngineService initializes default battle metadata", () => {
    const service = createService();

    const battle = createBattle({
        status: undefined,
        turn: undefined,
        result: undefined
    });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, true);
    assert.equal(result.battle, battle);
    assert.equal(battle.status, "ACTIVE");
    assert.equal(battle.turn, 1);
    assert.equal(battle.result, null);
});

test("BattleEngineService initializes missing active indexes to zero", () => {
    const service = createService();

    const battle = createBattle({
        player: {
            party: [createPokemon()],
            active: undefined
        },
        opponent: {
            party: [createPokemon("Charmander")],
            active: undefined
        }
    });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, true);
    assert.equal(battle.player.active, 0);
    assert.equal(battle.opponent.active, 0);
});

test("BattleEngineService preserves existing battle metadata", () => {
    const service = createService();

    const battleResult = {
        winner: "PLAYER"
    };

    const battle = createBattle({
        status: "COMPLETED",
        turn: 7,
        result: battleResult,
        player: {
            party: [
                createPokemon("Bulbasaur"),
                createPokemon("Squirtle")
            ],
            active: 1
        },
        opponent: {
            party: [
                createPokemon("Charmander"),
                createPokemon("Pidgey")
            ],
            active: 1
        }
    });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, true);
    assert.equal(battle.status, "COMPLETED");
    assert.equal(battle.turn, 7);
    assert.equal(battle.result, battleResult);
    assert.equal(battle.player.active, 1);
    assert.equal(battle.opponent.active, 1);
});

test("BattleEngineService preserves zero as the battle turn", () => {
    const service = createService();
    const battle = createBattle({ turn: 0 });

    service.initializeBattle(battle);

    assert.equal(battle.turn, 0);
});

test("BattleEngineService preserves an explicitly supplied null result", () => {
    const service = createService();
    const battle = createBattle({ result: null });

    service.initializeBattle(battle);

    assert.equal(battle.result, null);
});

test("BattleEngineService returns the original battle object", () => {
    const service = createService();
    const battle = createBattle();

    const result = service.initializeBattle(battle);

    assert.strictEqual(result.battle, battle);
});

// --------------------------------
// Initialize battle: active indexes
// --------------------------------

test("BattleEngineService resets a negative player active index", () => {
    const service = createService();

    const battle = createBattle({
        player: {
            party: [
                createPokemon(),
                createPokemon("Squirtle")
            ],
            active: -1
        }
    });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, true);
    assert.equal(battle.player.active, 0);
});

test("BattleEngineService resets a player active index beyond the party", () => {
    const service = createService();

    const battle = createBattle({
        player: {
            party: [createPokemon()],
            active: 5
        }
    });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, true);
    assert.equal(battle.player.active, 0);
});

test("BattleEngineService resets a negative opponent active index", () => {
    const service = createService();

    const battle = createBattle({
        opponent: {
            party: [
                createPokemon("Charmander"),
                createPokemon("Pidgey")
            ],
            active: -1
        }
    });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, true);
    assert.equal(battle.opponent.active, 0);
});

test("BattleEngineService resets an opponent active index beyond the party", () => {
    const service = createService();

    const battle = createBattle({
        opponent: {
            party: [createPokemon("Charmander")],
            active: 2
        }
    });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, true);
    assert.equal(battle.opponent.active, 0);
});

test("BattleEngineService resets active indexes for empty parties to zero", () => {
    const service = createService();

    const battle = createBattle({
        player: {
            party: [],
            active: 3
        },
        opponent: {
            party: [],
            active: 2
        }
    });

    const result = service.initializeBattle(battle);

    assert.equal(result.success, true);
    assert.equal(battle.player.active, 0);
    assert.equal(battle.opponent.active, 0);
});

// --------------------------------
// Process turn
// --------------------------------

test("BattleEngineService rejects a missing battle during turn processing", () => {
    const service = createService({
        processTurn() {
            return { success: true };
        }
    });

    const result = service.processTurn(null, {
        name: "Tackle"
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Unknown battle");
});

test("BattleEngineService rejects a completed battle during turn processing", () => {
    const service = createService({
        processTurn() {
            return { success: true };
        }
    });

    const result = service.processTurn(
        createBattle({ status: "COMPLETED" }),
        { name: "Tackle" }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Battle is not active");
});

test("BattleEngineService rejects a paused battle during turn processing", () => {
    const service = createService({
        processTurn() {
            return { success: true };
        }
    });

    const result = service.processTurn(
        createBattle({ status: "PAUSED" }),
        { name: "Tackle" }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Battle is not active");
});

test("BattleEngineService rejects turn processing without a flow service", () => {
    const service = createService();

    const result = service.processTurn(
        createBattle(),
        { name: "Tackle" }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Battle flow unavailable");
});

test("BattleEngineService forwards the battle and player move to the flow", () => {
    const battle = createBattle();
    const playerMove = {
        name: "Tackle"
    };

    let receivedBattle;
    let receivedMove;

    const expectedResult = {
        success: true,
        result: {
            damage: 5
        }
    };

    const service = createService({
        processTurn(received, move) {
            receivedBattle = received;
            receivedMove = move;
            return expectedResult;
        }
    });

    const result = service.processTurn(battle, playerMove);

    assert.strictEqual(receivedBattle, battle);
    assert.strictEqual(receivedMove, playerMove);
    assert.strictEqual(result, expectedResult);
});

test("BattleEngineService forwards failed turn results unchanged", () => {
    const expectedResult = {
        success: false,
        reason: "Invalid move"
    };

    const service = createService({
        processTurn() {
            return expectedResult;
        }
    });

    const result = service.processTurn(
        createBattle(),
        { name: "Unknown Move" }
    );

    assert.strictEqual(result, expectedResult);
});

// --------------------------------
// Active Pokémon lookup
// --------------------------------

test("BattleEngineService returns null when the battle is missing", () => {
    const service = createService(null, {
        getActivePokemon() {
            return createPokemon();
        }
    });

    assert.equal(service.getPlayerActive(null), null);
    assert.equal(service.getOpponentActive(null), null);
});

test("BattleEngineService returns null when the corresponding battle side is missing", () => {
    const service = createService(null, {
        getActivePokemon() {
            return createPokemon();
        }
    });

    assert.equal(
        service.getPlayerActive({
            opponent: {
                party: [],
                active: 0
            }
        }),
        null
    );

    assert.equal(
        service.getOpponentActive({
            player: {
                party: [],
                active: 0
            }
        }),
        null
    );
});

test("BattleEngineService returns null when the Pokémon service is unavailable", () => {
    const service = createService();

    assert.equal(
        service.getPlayerActive(createBattle()),
        null
    );

    assert.equal(
        service.getOpponentActive(createBattle()),
        null
    );
});

test("BattleEngineService delegates player active lookup", () => {
    const battle = createBattle();
    const expectedPokemon = battle.player.party[0];
    let receivedSide;

    const service = createService(null, {
        getActivePokemon(side) {
            receivedSide = side;
            return expectedPokemon;
        }
    });

    const result = service.getPlayerActive(battle);

    assert.strictEqual(result, expectedPokemon);
    assert.strictEqual(receivedSide, battle.player);
});

test("BattleEngineService delegates opponent active lookup", () => {
    const battle = createBattle();
    const expectedPokemon = battle.opponent.party[0];
    let receivedSide;

    const service = createService(null, {
        getActivePokemon(side) {
            receivedSide = side;
            return expectedPokemon;
        }
    });

    const result = service.getOpponentActive(battle);

    assert.strictEqual(result, expectedPokemon);
    assert.strictEqual(receivedSide, battle.opponent);
});

test("BattleEngineService preserves null from active Pokémon lookup", () => {
    const service = createService(null, {
        getActivePokemon() {
            return null;
        }
    });

    assert.equal(
        service.getPlayerActive(createBattle()),
        null
    );

    assert.equal(
        service.getOpponentActive(createBattle()),
        null
    );
});

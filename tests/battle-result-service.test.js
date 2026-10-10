"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattleResultService = require(
    "../scripts/services/battle-result-service.js"
);

// --------------------------------
// Test helpers
// --------------------------------

function createPokemon(name, hp = 20) {
    return {
        name,
        species: name.toUpperCase(),
        hp
    };
}

function createBattle({
    playerParty = [createPokemon("Bulbasaur")],
    opponentParty = [createPokemon("Charmander")],
    status = "ACTIVE",
    winner = null,
    result = null
} = {}) {
    return {
        id: "BATTLE_1",
        status,
        winner,
        result,
        player: {
            party: playerParty,
            active: 0
        },
        opponent: {
            party: opponentParty,
            active: 0
        }
    };
}

function createService() {
    return new BattleResultService();
}

// --------------------------------
// Check battle end: invalid input
// --------------------------------

test("BattleResultService returns null when the battle is missing", () => {
    const service = createService();

    assert.equal(service.checkBattleEnd(null), null);
});

test("BattleResultService returns null when the player side is missing", () => {
    const service = createService();

    assert.equal(
        service.checkBattleEnd({
            opponent: {
                party: [createPokemon("Charmander")]
            }
        }),
        null
    );
});

test("BattleResultService returns null when the opponent side is missing", () => {
    const service = createService();

    assert.equal(
        service.checkBattleEnd({
            player: {
                party: [createPokemon("Bulbasaur")]
            }
        }),
        null
    );
});

// --------------------------------
// Check battle end: victory
// --------------------------------

test("BattleResultService completes the battle when all opponent Pokémon have fainted", () => {
    const service = createService();

    const battle = createBattle({
        playerParty: [
            createPokemon("Bulbasaur", 10),
            createPokemon("Squirtle", 0)
        ],
        opponentParty: [
            createPokemon("Charmander", 0),
            createPokemon("Pidgey", -2)
        ]
    });

    const result = service.checkBattleEnd(battle);

    assert.equal(battle.status, "COMPLETED");
    assert.equal(battle.winner, "PLAYER");

    assert.deepEqual(result, {
        status: "COMPLETED",
        winner: "PLAYER"
    });
});

test("BattleResultService keeps the battle active while at least one opponent Pokémon remains alive", () => {
    const service = createService();

    const battle = createBattle({
        opponentParty: [
            createPokemon("Charmander", 0),
            createPokemon("Pidgey", 5)
        ]
    });

    const result = service.checkBattleEnd(battle);

    assert.equal(battle.status, "ACTIVE");
    assert.equal(battle.winner, null);

    assert.deepEqual(result, {
        status: "ACTIVE",
        winner: null
    });
});

test("BattleResultService supports an empty opponent party as a player victory", () => {
    const service = createService();

    const battle = createBattle({
        opponentParty: []
    });

    const result = service.checkBattleEnd(battle);

    assert.equal(battle.status, "COMPLETED");
    assert.equal(battle.winner, "PLAYER");

    assert.deepEqual(result, {
        status: "COMPLETED",
        winner: "PLAYER"
    });
});

// --------------------------------
// Check battle end: defeat
// --------------------------------

test("BattleResultService completes the battle when all player Pokémon have fainted", () => {
    const service = createService();

    const battle = createBattle({
        playerParty: [
            createPokemon("Bulbasaur", 0),
            createPokemon("Squirtle", -1)
        ],
        opponentParty: [
            createPokemon("Charmander", 15),
            createPokemon("Pidgey", 0)
        ]
    });

    const result = service.checkBattleEnd(battle);

    assert.equal(battle.status, "COMPLETED");
    assert.equal(battle.winner, "OPPONENT");

    assert.deepEqual(result, {
        status: "COMPLETED",
        winner: "OPPONENT"
    });
});

test("BattleResultService keeps the battle active while at least one player Pokémon remains alive", () => {
    const service = createService();

    const battle = createBattle({
        playerParty: [
            createPokemon("Bulbasaur", 0),
            createPokemon("Squirtle", 8)
        ]
    });

    const result = service.checkBattleEnd(battle);

    assert.equal(battle.status, "ACTIVE");
    assert.equal(battle.winner, null);

    assert.deepEqual(result, {
        status: "ACTIVE",
        winner: null
    });
});

test("BattleResultService supports an empty player party as an opponent victory", () => {
    const service = createService();

    const battle = createBattle({
        playerParty: []
    });

    const result = service.checkBattleEnd(battle);

    assert.equal(battle.status, "COMPLETED");
    assert.equal(battle.winner, "OPPONENT");

    assert.deepEqual(result, {
        status: "COMPLETED",
        winner: "OPPONENT"
    });
});

// --------------------------------
// Check battle end: no winner yet
// --------------------------------

test("BattleResultService leaves an ongoing battle unchanged when both sides have living Pokémon", () => {
    const service = createService();

    const battle = createBattle();

    const originalResult = battle.result;
    const originalWinner = battle.winner;

    const result = service.checkBattleEnd(battle);

    assert.equal(battle.status, "ACTIVE");
    assert.equal(battle.winner, originalWinner);
    assert.equal(battle.result, originalResult);

    assert.deepEqual(result, {
        status: "ACTIVE",
        winner: null
    });
});

test("BattleResultService returns the existing status and winner when the battle continues", () => {
    const service = createService();

    const battle = createBattle({
        status: "ACTIVE",
        winner: "UNKNOWN"
    });

    const result = service.checkBattleEnd(battle);

    assert.deepEqual(result, {
        status: "ACTIVE",
        winner: "UNKNOWN"
    });
});

test("BattleResultService does not create a separate battle result object", () => {
    const service = createService();

    const battle = createBattle({
        result: null
    });

    service.checkBattleEnd(battle);

    assert.equal(battle.result, null);
});

// --------------------------------
// Repeated checks
// --------------------------------

test("BattleResultService continues to report a completed player victory", () => {
    const service = createService();

    const battle = createBattle({
        opponentParty: [
            createPokemon("Charmander", 0)
        ]
    });

    service.checkBattleEnd(battle);

    const result = service.checkBattleEnd(battle);

    assert.deepEqual(result, {
        status: "COMPLETED",
        winner: "PLAYER"
    });
});

test("BattleResultService continues to report a completed opponent victory", () => {
    const service = createService();

    const battle = createBattle({
        playerParty: [
            createPokemon("Bulbasaur", 0)
        ]
    });

    service.checkBattleEnd(battle);

    const result = service.checkBattleEnd(battle);

    assert.deepEqual(result, {
        status: "COMPLETED",
        winner: "OPPONENT"
    });
});

// --------------------------------
// isFinished
// --------------------------------

test("BattleResultService identifies a completed battle", () => {
    const service = createService();

    assert.equal(
        service.isFinished(
            createBattle({
                status: "COMPLETED"
            })
        ),
        true
    );
});

test("BattleResultService identifies an active battle as unfinished", () => {
    const service = createService();

    assert.equal(
        service.isFinished(
            createBattle({
                status: "ACTIVE"
            })
        ),
        false
    );
});

test("BattleResultService identifies a battle with another status as unfinished", () => {
    const service = createService();

    assert.equal(
        service.isFinished(
            createBattle({
                status: "PAUSED"
            })
        ),
        false
    );
});

test("BattleResultService returns false when the battle is missing", () => {
    const service = createService();

    assert.equal(service.isFinished(null), false);
});

test("BattleResultService returns false when the battle is undefined", () => {
    const service = createService();

    assert.equal(service.isFinished(undefined), false);
});

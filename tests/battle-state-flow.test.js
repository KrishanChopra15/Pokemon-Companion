"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattleStateFlow = require("../scripts/battle-state/battle-state-flow.js");

function createBattleStateService(battles = {}) {
    return {
        getBattle(battleId) {
            return battles[battleId] ?? null;
        }
    };
}

// --------------------------------
// Constructor and state retrieval
// --------------------------------

test("BattleStateFlow returns null when no battle-state service is available", () => {
    const flow = new BattleStateFlow(null);

    assert.equal(flow.getBattleState("battle-1"), null);
});

test("BattleStateFlow retrieves the requested battle", () => {
    const battle = {
        id: "battle-1",
        status: "ACTIVE"
    };

    const flow = new BattleStateFlow(
        createBattleStateService({
            "battle-1": battle
        })
    );

    assert.equal(flow.getBattleState("battle-1"), battle);
});

test("BattleStateFlow returns null when the battle does not exist", () => {
    const flow = new BattleStateFlow(
        createBattleStateService()
    );

    assert.equal(flow.getBattleState("missing-battle"), null);
});

test("BattleStateFlow passes the battle ID to the service", () => {
    let receivedBattleId;

    const battle = {
        id: "battle-2",
        status: "ACTIVE"
    };

    const service = {
        getBattle(battleId) {
            receivedBattleId = battleId;
            return battle;
        }
    };

    const flow = new BattleStateFlow(service);

    assert.equal(flow.getBattleState("battle-2"), battle);
    assert.equal(receivedBattleId, "battle-2");
});

// --------------------------------
// Active battle checks
// --------------------------------

test("BattleStateFlow identifies an active battle", () => {
    const flow = new BattleStateFlow(
        createBattleStateService({
            "battle-1": {
                id: "battle-1",
                status: "ACTIVE"
            }
        })
    );

    assert.equal(flow.isActive("battle-1"), true);
});

test("BattleStateFlow rejects a completed battle as active", () => {
    const flow = new BattleStateFlow(
        createBattleStateService({
            "battle-1": {
                id: "battle-1",
                status: "COMPLETED"
            }
        })
    );

    assert.equal(flow.isActive("battle-1"), false);
});

test("BattleStateFlow rejects a missing battle as active", () => {
    const flow = new BattleStateFlow(
        createBattleStateService()
    );

    assert.equal(flow.isActive("missing-battle"), false);
});

test("BattleStateFlow rejects a battle with a different status as active", () => {
    const flow = new BattleStateFlow(
        createBattleStateService({
            "battle-1": {
                id: "battle-1",
                status: "PAUSED"
            }
        })
    );

    assert.equal(flow.isActive("battle-1"), false);
});

test("BattleStateFlow returns false when the battle service is unavailable", () => {
    const flow = new BattleStateFlow(null);

    assert.equal(flow.isActive("battle-1"), false);
});

// --------------------------------
// Finished battle checks
// --------------------------------

test("BattleStateFlow identifies a completed battle", () => {
    const flow = new BattleStateFlow(
        createBattleStateService({
            "battle-1": {
                id: "battle-1",
                status: "COMPLETED"
            }
        })
    );

    assert.equal(flow.isFinished("battle-1"), true);
});

test("BattleStateFlow rejects an active battle as finished", () => {
    const flow = new BattleStateFlow(
        createBattleStateService({
            "battle-1": {
                id: "battle-1",
                status: "ACTIVE"
            }
        })
    );

    assert.equal(flow.isFinished("battle-1"), false);
});

test("BattleStateFlow rejects a missing battle as finished", () => {
    const flow = new BattleStateFlow(
        createBattleStateService()
    );

    assert.equal(flow.isFinished("missing-battle"), false);
});

test("BattleStateFlow rejects a battle with a different status as finished", () => {
    const flow = new BattleStateFlow(
        createBattleStateService({
            "battle-1": {
                id: "battle-1",
                status: "PAUSED"
            }
        })
    );

    assert.equal(flow.isFinished("battle-1"), false);
});

test("BattleStateFlow returns false when checking completion without a service", () => {
    const flow = new BattleStateFlow(null);

    assert.equal(flow.isFinished("battle-1"), false);
});

// --------------------------------
// State consistency
// --------------------------------

test("BattleStateFlow reflects status changes in the existing battle state", () => {
    const battle = {
        id: "battle-1",
        status: "ACTIVE"
    };

    const flow = new BattleStateFlow(
        createBattleStateService({
            "battle-1": battle
        })
    );

    assert.equal(flow.isActive("battle-1"), true);
    assert.equal(flow.isFinished("battle-1"), false);

    battle.status = "COMPLETED";

    assert.equal(flow.isActive("battle-1"), false);
    assert.equal(flow.isFinished("battle-1"), true);
});

test("BattleStateFlow does not create or replace the battle state", () => {
    const battle = {
        id: "battle-1",
        status: "ACTIVE"
    };

    const flow = new BattleStateFlow(
        createBattleStateService({
            "battle-1": battle
        })
    );

    assert.equal(flow.getBattleState("battle-1"), battle);
    assert.equal(flow.getBattleState("battle-1"), battle);
});
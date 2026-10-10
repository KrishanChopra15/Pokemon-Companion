"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattleStateService = require("../scripts/services/battle-state-service.js");

// --------------------------------
// Test helpers
// --------------------------------

function createBattleService(battles = {}) {
    return {
        getBattle(battleId) {
            return battles[battleId] ?? null;
        },

        getActiveBattles() {
            return Object.values(battles);
        },

        clearBattle(battleId) {
            if (!Object.hasOwn(battles, battleId)) {
                return false;
            }

            delete battles[battleId];
            return true;
        }
    };
}

// --------------------------------
// Constructor and getBattle
// --------------------------------

test("BattleStateService can be created without a battle service", () => {
    const service = new BattleStateService();

    assert.equal(service.battles, null);
});

test("BattleStateService returns null when no battle service is available", () => {
    const service = new BattleStateService(null);

    assert.equal(service.getBattle("battle-1"), null);
});

test("BattleStateService retrieves the requested battle", () => {
    const battle = {
        id: "battle-1",
        status: "ACTIVE"
    };

    const service = new BattleStateService(
        createBattleService({
            "battle-1": battle
        })
    );

    assert.equal(service.getBattle("battle-1"), battle);
});

test("BattleStateService passes the battle ID to the underlying service", () => {
    let receivedBattleId = null;

    const battle = {
        id: "battle-2",
        status: "ACTIVE"
    };

    const battleService = {
        getBattle(battleId) {
            receivedBattleId = battleId;
            return battle;
        }
    };

    const service = new BattleStateService(battleService);

    assert.equal(service.getBattle("battle-2"), battle);
    assert.equal(receivedBattleId, "battle-2");
});

test("BattleStateService returns null when the requested battle does not exist", () => {
    const service = new BattleStateService(
        createBattleService()
    );

    assert.equal(service.getBattle("missing-battle"), null);
});

// --------------------------------
// getBattles
// --------------------------------

test("BattleStateService returns an empty array when no service is available", () => {
    const service = new BattleStateService(null);

    assert.deepEqual(service.getBattles(), []);
});

test("BattleStateService retrieves the active battles", () => {
    const firstBattle = {
        id: "battle-1",
        status: "ACTIVE"
    };

    const secondBattle = {
        id: "battle-2",
        status: "ACTIVE"
    };

    const expectedBattles = [
        firstBattle,
        secondBattle
    ];

    const battleService = {
        getActiveBattles() {
            return expectedBattles;
        }
    };

    const service = new BattleStateService(battleService);

    assert.equal(service.getBattles(), expectedBattles);
});

test("BattleStateService returns an empty array when getActiveBattles is unavailable", () => {
    const battleService = {
        getBattle() {
            return null;
        }
    };

    const service = new BattleStateService(battleService);

    assert.deepEqual(service.getBattles(), []);
});

test("BattleStateService calls getActiveBattles only once per request", () => {
    let callCount = 0;

    const battleService = {
        getActiveBattles() {
            callCount++;
            return [];
        }
    };

    const service = new BattleStateService(battleService);

    service.getBattles();

    assert.equal(callCount, 1);
});

// --------------------------------
// removeBattle
// --------------------------------

test("BattleStateService returns false when removing a battle without a service", () => {
    const service = new BattleStateService(null);

    assert.equal(service.removeBattle("battle-1"), false);
});

test("BattleStateService passes the battle ID to clearBattle", () => {
    let receivedBattleId = null;

    const battleService = {
        clearBattle(battleId) {
            receivedBattleId = battleId;
            return true;
        }
    };

    const service = new BattleStateService(battleService);

    assert.equal(service.removeBattle("battle-3"), true);
    assert.equal(receivedBattleId, "battle-3");
});

test("BattleStateService returns true when the underlying service removes a battle", () => {
    const battles = {
        "battle-1": {
            id: "battle-1",
            status: "ACTIVE"
        }
    };

    const service = new BattleStateService(
        createBattleService(battles)
    );

    assert.equal(service.removeBattle("battle-1"), true);
    assert.equal(service.getBattle("battle-1"), null);
});

test("BattleStateService preserves a false removal result", () => {
    const battleService = {
        clearBattle() {
            return false;
        }
    };

    const service = new BattleStateService(battleService);

    assert.equal(service.removeBattle("battle-1"), false);
});

// --------------------------------
// exists
// --------------------------------

test("BattleStateService identifies an existing battle", () => {
    const service = new BattleStateService(
        createBattleService({
            "battle-1": {
                id: "battle-1",
                status: "ACTIVE"
            }
        })
    );

    assert.equal(service.exists("battle-1"), true);
});

test("BattleStateService returns false for a missing battle", () => {
    const service = new BattleStateService(
        createBattleService()
    );

    assert.equal(service.exists("missing-battle"), false);
});

test("BattleStateService returns false when checking existence without a service", () => {
    const service = new BattleStateService(null);

    assert.equal(service.exists("battle-1"), false);
});

test("BattleStateService determines existence through getBattle", () => {
    let getBattleCalls = 0;

    const battle = {
        id: "battle-1",
        status: "ACTIVE"
    };

    const battleService = {
        getBattle(battleId) {
            getBattleCalls++;
            return battleId === "battle-1" ? battle : null;
        }
    };

    const service = new BattleStateService(battleService);

    assert.equal(service.exists("battle-1"), true);
    assert.equal(service.exists("missing-battle"), false);
    assert.equal(getBattleCalls, 2);
});

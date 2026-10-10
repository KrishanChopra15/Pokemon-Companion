"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const ActionFlow = require("../scripts/action/action-flow");


function createContext(options = {}) {
    const actions = [];
    const calls = [];

    const manager = {
        addAction(action) {
            calls.push({
                method: "addAction",
                action
            });

            if (options.failAdd) {
                return {
                    success: false,
                    reason: "Action could not be recorded"
                };
            }

            actions.push(action);

            return {
                success: true,
                action
            };
        },

        getAll() {
            calls.push({
                method: "getAll"
            });

            return actions;
        }
    };

    return {
        flow: new ActionFlow(manager),
        manager,
        actions,
        calls
    };
}


// -------------------------------------
// Submit and validate actions
// -------------------------------------

test("ActionFlow rejects a null action", () => {
    const { flow, calls } = createContext();

    const result = flow.submit(null);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid action");
    assert.equal(calls.length, 0);
});


test("ActionFlow rejects an action without a type", () => {
    const { flow, calls } = createContext();

    const result = flow.submit({
        reference: "TEST"
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid action");
    assert.equal(calls.length, 0);
});


test("ActionFlow rejects an action with an empty type", () => {
    const { flow, calls } = createContext();

    const result = flow.submit({
        type: ""
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid action");
    assert.equal(calls.length, 0);
});


test("ActionFlow delegates valid actions to ActionManager", () => {
    const { flow, actions, calls } = createContext();

    const action = {
        type: "TEST_ACTION",
        reference: "TEST_REFERENCE",
        details: {
            value: 42
        }
    };

    const result = flow.submit(action);

    assert.equal(result.success, true);
    assert.strictEqual(result.action, action);
    assert.strictEqual(actions[0], action);

    assert.deepEqual(calls[0], {
        method: "addAction",
        action
    });
});


test("ActionFlow returns ActionManager failures unchanged", () => {
    const { flow, actions } = createContext({
        failAdd: true
    });

    const action = {
        type: "TEST_ACTION"
    };

    const result = flow.submit(action);

    assert.deepEqual(result, {
        success: false,
        reason: "Action could not be recorded"
    });

    assert.equal(actions.length, 0);
});


// -------------------------------------
// Capture actions
// -------------------------------------

test("ActionFlow creates a capture action", () => {
    const { flow, actions } = createContext();

    const result = flow.capturePokemon(
        "PIKACHU",
        7,
        "ROUTE_2"
    );

    assert.equal(result.success, true);

    assert.deepEqual(actions[0], {
        type: "CAPTURE_POKEMON",
        reference: "PIKACHU",
        species: "PIKACHU",
        level: 7,
        location: "ROUTE_2"
    });
});


test("ActionFlow preserves optional capture details", () => {
    const { flow, actions } = createContext();

    const result = flow.capturePokemon(
        "EEVEE",
        5,
        null
    );

    assert.equal(result.success, true);
    assert.deepEqual(actions[0], {
        type: "CAPTURE_POKEMON",
        reference: "EEVEE",
        species: "EEVEE",
        level: 5,
        location: null
    });
});


// -------------------------------------
// Trainer defeat actions
// -------------------------------------

test("ActionFlow creates a trainer defeat action", () => {
    const { flow, actions } = createContext();

    const result = flow.defeatTrainer("YOUNGSTER_JOEY");

    assert.equal(result.success, true);

    assert.deepEqual(actions[0], {
        type: "DEFEATED_TRAINER",
        reference: "YOUNGSTER_JOEY",
        trainer: "YOUNGSTER_JOEY"
    });
});


// -------------------------------------
// Badge actions
// -------------------------------------

test("ActionFlow creates a gym badge action", () => {
    const { flow, actions } = createContext();

    const result = flow.earnBadge(
        "PEWTER_GYM",
        "BOULDER_BADGE"
    );

    assert.equal(result.success, true);

    assert.deepEqual(actions[0], {
        type: "EARNED_BADGE",
        reference: "PEWTER_GYM",
        gym: "PEWTER_GYM",
        badge: "BOULDER_BADGE"
    });
});


// -------------------------------------
// Action history
// -------------------------------------

test("ActionFlow returns the action manager's history", () => {
    const { flow, actions } = createContext();

    flow.capturePokemon("PIKACHU", 7, "ROUTE_2");
    flow.defeatTrainer("YOUNGSTER_JOEY");

    const history = flow.getHistory();

    assert.strictEqual(history, actions);
    assert.equal(history.length, 2);
    assert.equal(history[0].type, "CAPTURE_POKEMON");
    assert.equal(history[1].type, "DEFEATED_TRAINER");
});


test("ActionFlow history reflects subsequently submitted actions", () => {
    const { flow } = createContext();

    const history = flow.getHistory();

    flow.earnBadge(
        "PEWTER_GYM",
        "BOULDER_BADGE"
    );

    assert.equal(history.length, 1);
    assert.equal(history[0].type, "EARNED_BADGE");
});


// -------------------------------------
// Action isolation
// -------------------------------------

test("Separate ActionFlow instances keep histories isolated", () => {
    const first = createContext();
    const second = createContext();

    first.flow.capturePokemon(
        "PIKACHU",
        7,
        "ROUTE_2"
    );

    assert.equal(first.flow.getHistory().length, 1);
    assert.equal(second.flow.getHistory().length, 0);
});
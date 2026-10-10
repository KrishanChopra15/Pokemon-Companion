"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const ActionManager = require("../scripts/action/action-manager");


// -------------------------------------
// Initial state and recording
// -------------------------------------

test("ActionManager starts with an empty history", () => {
    const manager = new ActionManager();

    assert.deepEqual(manager.getAll(), []);
});


test("ActionManager records an action with an ID and timestamp", () => {
    const manager = new ActionManager();

    const action = {
        type: "CAPTURE_POKEMON",
        reference: "PIKACHU",
        species: "PIKACHU",
        level: 7
    };

    const result = manager.addAction(action);

    assert.equal(result.success, true);
    assert.equal(result.action.id, 1);
    assert.equal(typeof result.action.timestamp, "number");

    assert.equal(result.action.type, "CAPTURE_POKEMON");
    assert.equal(result.action.reference, "PIKACHU");
    assert.equal(result.action.species, "PIKACHU");
    assert.equal(result.action.level, 7);

    assert.strictEqual(manager.getAll()[0], result.action);
});


test("ActionManager assigns unique sequential IDs", () => {
    const manager = new ActionManager();

    const first = manager.addAction({
        type: "CAPTURE_POKEMON",
        reference: "PIKACHU"
    });

    const second = manager.addAction({
        type: "DEFEATED_TRAINER",
        reference: "YOUNGSTER_JOEY"
    });

    const third = manager.addAction({
        type: "EARNED_BADGE",
        reference: "PEWTER_GYM"
    });

    assert.equal(first.action.id, 1);
    assert.equal(second.action.id, 2);
    assert.equal(third.action.id, 3);
    assert.equal(manager.getAll().length, 3);
});


test("ActionManager does not modify the submitted action object", () => {
    const manager = new ActionManager();

    const action = {
        type: "CAPTURE_POKEMON",
        reference: "EEVEE",
        details: {
            level: 5
        }
    };

    const originalKeys = Object.keys(action);

    const result = manager.addAction(action);

    assert.notStrictEqual(result.action, action);
    assert.deepEqual(Object.keys(action), originalKeys);
    assert.equal(action.id, undefined);
    assert.equal(action.timestamp, undefined);

    assert.deepEqual(result.action.details, {
        level: 5
    });

    // The record is a shallow copy, so nested objects remain shared.
    assert.strictEqual(result.action.details, action.details);
});


// -------------------------------------
// History queries
// -------------------------------------

test("ActionManager returns the live action history", () => {
    const manager = new ActionManager();

    const history = manager.getAll();

    manager.addAction({
        type: "CAPTURE_POKEMON",
        reference: "BULBASAUR"
    });

    assert.strictEqual(manager.getAll(), history);
    assert.equal(history.length, 1);
    assert.equal(history[0].reference, "BULBASAUR");
});


test("ActionManager finds actions by type", () => {
    const manager = new ActionManager();

    manager.addAction({
        type: "CAPTURE_POKEMON",
        reference: "PIKACHU"
    });

    manager.addAction({
        type: "DEFEATED_TRAINER",
        reference: "YOUNGSTER_JOEY"
    });

    manager.addAction({
        type: "CAPTURE_POKEMON",
        reference: "EEVEE"
    });

    const captures = manager.findByType("CAPTURE_POKEMON");

    assert.equal(captures.length, 2);
    assert.deepEqual(
        captures.map(action => action.reference),
        ["PIKACHU", "EEVEE"]
    );
});


test("ActionManager returns an empty array for an unknown action type", () => {
    const manager = new ActionManager();

    manager.addAction({
        type: "CAPTURE_POKEMON",
        reference: "PIKACHU"
    });

    assert.deepEqual(
        manager.findByType("UNKNOWN_ACTION"),
        []
    );
});


test("ActionManager checks action type and reference", () => {
    const manager = new ActionManager();

    manager.addAction({
        type: "EARNED_BADGE",
        reference: "PEWTER_GYM",
        badge: "BOULDER_BADGE"
    });

    assert.equal(
        manager.hasAction("EARNED_BADGE", "PEWTER_GYM"),
        true
    );

    assert.equal(
        manager.hasAction("EARNED_BADGE", "CERULEAN_GYM"),
        false
    );

    assert.equal(
        manager.hasAction("DEFEATED_TRAINER", "PEWTER_GYM"),
        false
    );
});


test("ActionManager permits multiple records with the same type and reference", () => {
    const manager = new ActionManager();

    manager.addAction({
        type: "CAPTURE_POKEMON",
        reference: "PIKACHU"
    });

    manager.addAction({
        type: "CAPTURE_POKEMON",
        reference: "PIKACHU"
    });

    assert.equal(manager.getAll().length, 2);
    assert.equal(manager.findByType("CAPTURE_POKEMON").length, 2);

    assert.equal(
        manager.hasAction("CAPTURE_POKEMON", "PIKACHU"),
        true
    );
});


// -------------------------------------
// Generated metadata
// -------------------------------------

test("ActionManager preserves its generated ID and timestamp", () => {
    const manager = new ActionManager();

    const result = manager.addAction({
        id: 999,
        timestamp: 1,
        type: "TEST_ACTION",
        reference: "TEST_REFERENCE"
    });

    assert.equal(result.success, true);

    // The manager should own these generated fields.
    assert.equal(result.action.id, 1);
    assert.notEqual(result.action.timestamp, 1);
    assert.equal(typeof result.action.timestamp, "number");
});
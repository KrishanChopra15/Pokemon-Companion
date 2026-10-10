"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const EncounterManager = require("../scripts/encounter/encounter-manager");


// -------------------------------------
// Initial state
// -------------------------------------

test("EncounterManager starts without an active encounter", () => {
    const manager = new EncounterManager();

    assert.equal(manager.getEncounter(), null);
    assert.equal(manager.hasEncounter(), false);
    assert.deepEqual(manager.getHistory(), []);
    assert.equal(manager.getLastEncounter(), null);
});


// -------------------------------------
// Starting encounters
// -------------------------------------

test("EncounterManager stores the same encounter object", () => {
    const manager = new EncounterManager();

    const encounter = {
        type: "WILD",
        location: "ROUTE_1",
        species: "PIDGEY",
        level: 3
    };

    const result = manager.setEncounter(encounter);

    assert.equal(result.success, true);
    assert.strictEqual(result.encounter, encounter);
    assert.strictEqual(manager.getEncounter(), encounter);
    assert.equal(manager.hasEncounter(), true);
});


test("EncounterManager rejects a null encounter", () => {
    const manager = new EncounterManager();

    const result = manager.setEncounter(null);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid encounter");
    assert.equal(manager.getEncounter(), null);
    assert.equal(manager.hasEncounter(), false);
    assert.equal(manager.getHistory().length, 0);
});


test("EncounterManager does not replace the active encounter after invalid input", () => {
    const manager = new EncounterManager();

    const encounter = {
        type: "WILD",
        location: "ROUTE_2",
        species: "RATTATA",
        level: 4
    };

    manager.setEncounter(encounter);

    const result = manager.setEncounter(null);

    assert.equal(result.success, false);
    assert.strictEqual(manager.getEncounter(), encounter);
    assert.equal(manager.getHistory().length, 1);
});


test("Starting another encounter replaces the active encounter", () => {
    const manager = new EncounterManager();

    const first = {
        type: "WILD",
        species: "PIDGEY",
        level: 3
    };

    const second = {
        type: "WILD",
        species: "RATTATA",
        level: 4
    };

    manager.setEncounter(first);
    manager.setEncounter(second);

    assert.strictEqual(manager.getEncounter(), second);
    assert.equal(manager.hasEncounter(), true);
    assert.equal(manager.getHistory().length, 2);
});


// -------------------------------------
// Encounter history
// -------------------------------------

test("EncounterManager records encounters in order", () => {
    const manager = new EncounterManager();

    const first = {
        type: "WILD",
        species: "PIDGEY",
        level: 3
    };

    const second = {
        type: "WILD",
        species: "RATTATA",
        level: 4
    };

    manager.setEncounter(first);
    manager.setEncounter(second);

    const history = manager.getHistory();

    assert.equal(history.length, 2);
    assert.strictEqual(history[0], first);
    assert.strictEqual(history[1], second);
});


test("EncounterManager returns the most recent encounter", () => {
    const manager = new EncounterManager();

    const first = {
        type: "WILD",
        species: "PIDGEY",
        level: 3
    };

    const second = {
        type: "WILD",
        species: "SPEAROW",
        level: 5
    };

    manager.setEncounter(first);
    manager.setEncounter(second);

    assert.strictEqual(manager.getLastEncounter(), second);
});


test("EncounterManager returns null when encounter history is empty", () => {
    const manager = new EncounterManager();

    assert.equal(manager.getLastEncounter(), null);
});


test("EncounterManager exposes its live history array", () => {
    const manager = new EncounterManager();

    const history = manager.getHistory();

    const encounter = {
        type: "WILD",
        species: "PIKACHU",
        level: 5
    };

    manager.setEncounter(encounter);

    assert.strictEqual(manager.getHistory(), history);
    assert.equal(history.length, 1);
    assert.strictEqual(history[0], encounter);
});


// -------------------------------------
// Clearing and resetting
// -------------------------------------

test("Clearing an encounter removes only the active encounter", () => {
    const manager = new EncounterManager();

    const encounter = {
        type: "WILD",
        species: "BULBASAUR",
        level: 5
    };

    manager.setEncounter(encounter);

    const history = manager.getHistory();
    const result = manager.clearEncounter();

    assert.equal(result.success, true);
    assert.equal(manager.getEncounter(), null);
    assert.equal(manager.hasEncounter(), false);

    // Clearing should preserve the encounter history.
    assert.strictEqual(manager.getHistory(), history);
    assert.equal(manager.getHistory().length, 1);
    assert.strictEqual(manager.getLastEncounter(), encounter);
});


test("Clearing when no encounter is active succeeds", () => {
    const manager = new EncounterManager();

    const result = manager.clearEncounter();

    assert.equal(result.success, true);
    assert.equal(manager.getEncounter(), null);
    assert.equal(manager.hasEncounter(), false);
    assert.deepEqual(manager.getHistory(), []);
});


test("Reset clears the active encounter and encounter history", () => {
    const manager = new EncounterManager();

    manager.setEncounter({
        type: "WILD",
        species: "PIDGEY",
        level: 3
    });

    manager.setEncounter({
        type: "WILD",
        species: "RATTATA",
        level: 4
    });

    const oldHistory = manager.getHistory();
    const result = manager.reset();

    assert.equal(result.success, true);
    assert.equal(manager.getEncounter(), null);
    assert.equal(manager.hasEncounter(), false);
    assert.deepEqual(manager.getHistory(), []);
    assert.equal(manager.getLastEncounter(), null);

    // Reset replaces the history array.
    assert.notStrictEqual(manager.getHistory(), oldHistory);

    // The previous array still contains its old records.
    assert.equal(oldHistory.length, 2);
});


// -------------------------------------
// State after clearing
// -------------------------------------

test("EncounterManager can start a new encounter after clearing one", () => {
    const manager = new EncounterManager();

    const first = {
        type: "WILD",
        species: "PIDGEY",
        level: 3
    };

    const second = {
        type: "WILD",
        species: "ODDISH",
        level: 6
    };

    manager.setEncounter(first);
    manager.clearEncounter();

    const result = manager.setEncounter(second);

    assert.equal(result.success, true);
    assert.strictEqual(manager.getEncounter(), second);
    assert.strictEqual(manager.getLastEncounter(), second);
    assert.equal(manager.getHistory().length, 2);
    assert.strictEqual(manager.getHistory()[0], first);
    assert.strictEqual(manager.getHistory()[1], second);
});
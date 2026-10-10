"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GameSession = require("../scripts/session/game-session");
const WorldManager = require("../scripts/world/world-manager");


function createContext() {
    const session = new GameSession();

    return {
        session,
        manager: new WorldManager(session)
    };
}


// -------------------------------------
// Current location
// -------------------------------------

test("WorldManager reads the current location from the session", () => {
    const { session, manager } = createContext();

    assert.equal(
        manager.getCurrentLocation(),
        session.getLocation()
    );
});


test("WorldManager updates the session location", () => {
    const { session, manager } = createContext();

    const result = manager.setLocation("VIRIDIAN_CITY");

    assert.equal(result.success, true);
    assert.equal(result.location, "VIRIDIAN_CITY");
    assert.equal(session.getLocation(), "VIRIDIAN_CITY");
    assert.equal(manager.getCurrentLocation(), "VIRIDIAN_CITY");
});


test("WorldManager marks a successfully entered location as visited", () => {
    const { manager } = createContext();

    const result = manager.setLocation("CERULEAN_CITY");

    assert.equal(result.success, true);
    assert.equal(manager.hasVisited("CERULEAN_CITY"), true);
});


test("WorldManager does not duplicate a visited location", () => {
    const { manager } = createContext();

    manager.setLocation("PEWTER_CITY");
    manager.setLocation("PEWTER_CITY");

    const occurrences = manager.getVisitedLocations().filter(
        location => location === "PEWTER_CITY"
    );

    assert.equal(occurrences.length, 1);
});


test("WorldManager does not mark a failed location change as visited", () => {
    const state = {
        visitedLocations: []
    };

    const session = {
        getLocation() {
            return "PALLET_TOWN";
        },

        setLocation() {
            return {
                success: false,
                reason: "Location change failed"
            };
        },

        getState() {
            return state;
        },

        markVisited(location) {
            if (!state.visitedLocations.includes(location)) {
                state.visitedLocations.push(location);
            }
        },

        getVisitedLocations() {
            return state.visitedLocations;
        }
    };

    const manager = new WorldManager(session);

    const result = manager.setLocation("VIRIDIAN_CITY");

    assert.equal(result.success, false);
    assert.equal(
        manager.hasVisited("VIRIDIAN_CITY"),
        false
    );
});


// -------------------------------------
// Visited locations
// -------------------------------------

test("WorldManager records visited locations without duplicates", () => {
    const { manager } = createContext();

    manager.markVisited("PALLET_TOWN");
    manager.markVisited("VIRIDIAN_CITY");
    manager.markVisited("PALLET_TOWN");

    const visited = manager.getVisitedLocations();

    assert.ok(visited.includes("PALLET_TOWN"));
    assert.ok(visited.includes("VIRIDIAN_CITY"));

    assert.equal(
        visited.filter(
            location => location === "PALLET_TOWN"
        ).length,
        1
    );
});


test("WorldManager checks whether a location has been visited", () => {
    const { manager } = createContext();

    manager.markVisited("LAVENDER_TOWN");

    assert.equal(manager.hasVisited("LAVENDER_TOWN"), true);
    assert.equal(manager.hasVisited("SAFFRON_CITY"), false);
});


test("WorldManager returns the session's visited-location collection", () => {
    const { session, manager } = createContext();

    assert.strictEqual(
        manager.getVisitedLocations(),
        session.getVisitedLocations()
    );
});


test("WorldManager supports session state without visited-location helpers", () => {
    const state = {
        visitedLocations: []
    };

    const session = {
        getState() {
            return state;
        },

        getLocation() {
            return "PALLET_TOWN";
        }
    };

    const manager = new WorldManager(session);

    manager.markVisited("VIRIDIAN_CITY");
    manager.markVisited("PEWTER_CITY");
    manager.markVisited("VIRIDIAN_CITY");

    assert.deepEqual(state.visitedLocations, [
        "VIRIDIAN_CITY",
        "PEWTER_CITY"
    ]);

    assert.equal(manager.hasVisited("VIRIDIAN_CITY"), true);
});


// -------------------------------------
// Walking-step state
// -------------------------------------

test("WorldManager returns zero when walking steps are unset", () => {
    const { session, manager } = createContext();

    session.getState().walkingSteps = undefined;

    assert.equal(manager.getWalkingSteps(), 0);
});


test("WorldManager returns zero when total steps are unset", () => {
    const { session, manager } = createContext();

    session.getState().totalSteps = undefined;

    assert.equal(manager.getTotalSteps(), 0);
});


test("WorldManager adds walking steps and updates the total", () => {
    const { session, manager } = createContext();

    const result = manager.addWalkingSteps(25);

    assert.equal(result.success, true);
    assert.equal(result.added, 25);
    assert.equal(result.previousWalkingSteps, 0);
    assert.equal(result.walkingSteps, 25);
    assert.equal(result.totalSteps, 25);
    assert.equal(result.intervals, 0);

    assert.equal(manager.getWalkingSteps(), 25);
    assert.equal(manager.getTotalSteps(), 25);
    assert.equal(session.getState().totalSteps, 25);
});


test("WorldManager calculates a completed 128-step interval", () => {
    const { manager } = createContext();

    const result = manager.addWalkingSteps(128);

    assert.equal(result.success, true);
    assert.equal(result.intervals, 1);
    assert.equal(result.walkingSteps, 0);
    assert.equal(result.totalSteps, 128);
    assert.equal(manager.getWalkingSteps(), 0);
});


test("WorldManager accumulates steps across multiple calls", () => {
    const { manager } = createContext();

    const first = manager.addWalkingSteps(100);
    const second = manager.addWalkingSteps(28);

    assert.equal(first.intervals, 0);
    assert.equal(first.walkingSteps, 100);

    assert.equal(second.success, true);
    assert.equal(second.previousWalkingSteps, 100);
    assert.equal(second.intervals, 1);
    assert.equal(second.walkingSteps, 0);

    assert.equal(manager.getTotalSteps(), 128);
});


test("WorldManager calculates multiple completed intervals and remaining steps", () => {
    const { manager } = createContext();

    manager.addWalkingSteps(100);

    const result = manager.addWalkingSteps(300);

    assert.equal(result.success, true);
    assert.equal(result.intervals, 3);
    assert.equal(result.walkingSteps, 16);
    assert.equal(result.totalSteps, 400);

    assert.equal(manager.getWalkingSteps(), 16);
    assert.equal(manager.getTotalSteps(), 400);
});


test("WorldManager preserves completed-step totals when intervals roll over", () => {
    const { manager } = createContext();

    manager.addWalkingSteps(127);
    manager.addWalkingSteps(1);
    manager.addWalkingSteps(1);

    assert.equal(manager.getWalkingSteps(), 1);
    assert.equal(manager.getTotalSteps(), 129);
});


// -------------------------------------
// Input validation
// -------------------------------------

test("WorldManager rejects invalid step counts", () => {
    const { manager } = createContext();

    const invalidInputs = [
        0,
        -1,
        NaN,
        Infinity,
        -Infinity,
        "not-a-number",
        null,
        undefined
    ];

    for (const input of invalidInputs) {
        const result = manager.addWalkingSteps(input);

        assert.equal(
            result.success,
            false,
            `Expected ${String(input)} to be rejected`
        );

        assert.equal(
            result.reason,
            "Invalid step count"
        );
    }

    assert.equal(manager.getWalkingSteps(), 0);
    assert.equal(manager.getTotalSteps(), 0);
});


test("WorldManager floors positive fractional step counts", () => {
    const { manager } = createContext();

    const result = manager.addWalkingSteps(10.8);

    assert.equal(result.success, true);
    assert.equal(result.added, 10);
    assert.equal(result.walkingSteps, 10);
    assert.equal(result.totalSteps, 10);
});


// -------------------------------------
// Session isolation
// -------------------------------------

test("Separate sessions keep locations and walking state isolated", () => {
    const firstSession = new GameSession();
    const secondSession = new GameSession();

    const firstManager = new WorldManager(firstSession);
    const secondManager = new WorldManager(secondSession);

    firstManager.setLocation("VIRIDIAN_CITY");
    firstManager.addWalkingSteps(60);

    assert.equal(
        firstManager.getCurrentLocation(),
        "VIRIDIAN_CITY"
    );

    assert.notEqual(
        secondManager.getCurrentLocation(),
        "VIRIDIAN_CITY"
    );

    assert.equal(firstManager.getTotalSteps(), 60);
    assert.equal(secondManager.getTotalSteps(), 0);

    assert.equal(firstManager.hasVisited("VIRIDIAN_CITY"), true);
    assert.equal(secondManager.hasVisited("VIRIDIAN_CITY"), false);
});
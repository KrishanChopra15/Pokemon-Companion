"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const WorldFlow = require("../scripts/world/world-flow");


function createContext(options = {}) {
    const world = {
        currentLocation: options.currentLocation || "PALLET_TOWN",
        visited: [options.currentLocation || "PALLET_TOWN"],
        walkingSteps: 0,
        totalSteps: 0,

        getCurrentLocation() {
            return this.currentLocation;
        },

        setLocation(location) {
            if (options.failSetLocation) {
                return {
                    success: false,
                    reason: "Location update failed"
                };
            }

            this.currentLocation = location;

            return {
                success: true,
                location
            };
        },

        markVisited(location) {
            if (!this.visited.includes(location)) {
                this.visited.push(location);
            }

            return {
                success: true
            };
        },

        addWalkingSteps(steps) {
            if (
                !Number.isFinite(steps) ||
                steps < 0
            ) {
                return {
                    success: false,
                    reason: "Invalid step count"
                };
            }

            this.walkingSteps += steps;
            this.totalSteps += steps;

            const intervals = Math.floor(
                this.walkingSteps / 128
            );

            this.walkingSteps %= 128;

            return {
                success: true,
                intervals,
                steps
            };
        },

        getWalkingSteps() {
            return this.walkingSteps;
        },

        getTotalSteps() {
            return this.totalSteps;
        },

        getVisitedLocations() {
            return this.visited;
        }
    };

    const locationAccess = options.locationAccess === false
        ? null
        : options.locationAccess || {
            analyzeLocation(location, currentLocation, playerState) {
                if (options.inaccessible) {
                    return {
                        accessible: false,
                        reason: "Missing required badge"
                    };
                }
            
                return {
                    accessible: true,
                    location,
                    currentLocation,
                    playerState
                };
            }
        };

    const team = options.team === false
        ? null
        : {
            getTeam() {
                return options.members || [];
            }
        };

    const friendshipCalls = [];

    const friendship = options.friendship === false
        ? null
        : {
            applyWalking(pokemon, applyOptions) {
                friendshipCalls.push({
                    pokemon,
                    options: applyOptions
                });

                if (options.failFriendship) {
                    return {
                        success: false,
                        reason: "Friendship update failed"
                    };
                }

                return {
                    success: true,
                    friendship: 1
                };
            }
        };

    const flow = new WorldFlow(
        world,
        locationAccess,
        null,
        team,
        friendship
    );

    return {
        flow,
        world,
        locationAccess,
        team,
        friendship,
        friendshipCalls
    };
}


// -------------------------------------
// Player movement
// -------------------------------------

test("WorldFlow moves the player to an accessible location", () => {
    const { flow, world } = createContext();

    const result = flow.moveTo(
        "VIRIDIAN_CITY",
        { badges: [] }
    );

    assert.equal(result.success, true);
    assert.equal(result.location, "VIRIDIAN_CITY");
    assert.equal(world.currentLocation, "VIRIDIAN_CITY");
    assert.ok(world.visited.includes("VIRIDIAN_CITY"));
});


test("WorldFlow supplies location context to the access service", () => {
    let receivedArguments = null;

    const locationAccess = {
        analyzeLocation(...args) {
            receivedArguments = args;

            return {
                accessible: true
            };
        }
    };

    const { flow } = createContext({
        locationAccess
    });

    const playerState = {
        badges: ["BOULDER_BADGE"]
    };

    const result = flow.moveTo(
        "CERULEAN_CITY",
        playerState
    );

    assert.equal(result.success, true);

    assert.deepEqual(receivedArguments, [
        "CERULEAN_CITY",
        "PALLET_TOWN",
        playerState
    ]);
});


test("WorldFlow rejects an inaccessible destination", () => {
    const { flow, world } = createContext({
        inaccessible: true
    });

    const originalLocation = world.currentLocation;

    const result = flow.moveTo("LAVENDER_TOWN");

    assert.equal(result.success, false);
    assert.equal(result.reason, "Location inaccessible");
    assert.equal(
        result.details.reason,
        "Missing required badge"
    );

    assert.equal(world.currentLocation, originalLocation);
    assert.equal(
        world.visited.includes("LAVENDER_TOWN"),
        false
    );
});


test("WorldFlow reports a failed location update", () => {
    const { flow, world } = createContext({
        failSetLocation: true
    });

    const result = flow.moveTo("CELADON_CITY");

    assert.equal(result.success, false);
    assert.equal(result.reason, "Failed to move");
    assert.equal(world.currentLocation, "PALLET_TOWN");
    assert.equal(
        world.visited.includes("CELADON_CITY"),
        false
    );
});


test("WorldFlow can move when no location access service is supplied", () => {
    const { flow, world } = createContext({
        locationAccess: false
    });

    const result = flow.moveTo("FUCHSIA_CITY");

    assert.equal(result.success, true);
    assert.equal(world.currentLocation, "FUCHSIA_CITY");
});


test("WorldFlow does not add a duplicate visited location", () => {
    const { flow, world } = createContext({
        currentLocation: "PALLET_TOWN"
    });

    const result = flow.moveTo("PALLET_TOWN");

    assert.equal(result.success, true);

    assert.equal(
        world.visited.filter(
            location => location === "PALLET_TOWN"
        ).length,
        1
    );
});


// -------------------------------------
// Walking progress
// -------------------------------------

test("WorldFlow records walking steps", () => {
    const { flow } = createContext();

    const result = flow.recordSteps(20);

    assert.equal(result.success, true);
    assert.equal(result.steps.steps, 20);
    assert.equal(result.steps.intervals, 0);
    assert.equal(result.applied, false);
    assert.deepEqual(result.friendship, []);

    assert.equal(flow.getWalkingSteps(), 20);
    assert.equal(flow.getTotalSteps(), 20);
});


test("WorldFlow does not apply friendship before a 128-step interval", () => {
    const pokemon = {
        species: "PIKACHU",
        friendship: 70
    };

    const { flow, friendshipCalls } = createContext({
        members: [pokemon]
    });

    const result = flow.recordSteps(127);

    assert.equal(result.success, true);
    assert.equal(result.applied, false);
    assert.equal(friendshipCalls.length, 0);
    assert.equal(flow.getWalkingSteps(), 127);
});


test("WorldFlow applies friendship after a completed 128-step interval", () => {
    const pokemon = {
        species: "PIKACHU",
        friendship: 70
    };

    const { flow, friendshipCalls } = createContext({
        members: [pokemon]
    });

    const result = flow.recordSteps(128);

    assert.equal(result.success, true);
    assert.equal(result.applied, true);
    assert.equal(result.steps.intervals, 1);
    assert.equal(friendshipCalls.length, 1);

    assert.strictEqual(
        friendshipCalls[0].pokemon,
        pokemon
    );

    assert.equal(
        friendshipCalls[0].options.steps,
        128
    );

    assert.equal(flow.getWalkingSteps(), 0);
    assert.equal(flow.getTotalSteps(), 128);
});


test("WorldFlow applies the appropriate number of intervals to each party member", () => {
    const first = {
        species: "PIKACHU"
    };

    const second = {
        species: "CHARMANDER"
    };

    const { flow, friendshipCalls } = createContext({
        members: [first, second]
    });

    const result = flow.recordSteps(256);

    assert.equal(result.success, true);
    assert.equal(result.steps.intervals, 2);
    assert.equal(result.applied, true);
    assert.equal(friendshipCalls.length, 2);

    assert.strictEqual(friendshipCalls[0].pokemon, first);
    assert.strictEqual(friendshipCalls[1].pokemon, second);

    for (const call of friendshipCalls) {
        assert.equal(call.options.steps, 256);
    }

    assert.deepEqual(
        result.friendship.map(entry => entry.species),
        ["PIKACHU", "CHARMANDER"]
    );
});


test("WorldFlow forwards optional walking friendship settings", () => {
    const pokemon = {
        species: "EEVEE"
    };

    const { flow, friendshipCalls } = createContext({
        members: [pokemon]
    });

    const result = flow.recordSteps(
        128,
        {
            random: () => 0,
            source: "TEST"
        }
    );

    assert.equal(result.success, true);

    assert.deepEqual(friendshipCalls[0].options, {
        steps: 128,
        random: friendshipCalls[0].options.random,
        source: "TEST"
    });

    assert.equal(
        typeof friendshipCalls[0].options.random,
        "function"
    );
});


test("WorldFlow handles an empty team after a completed interval", () => {
    const { flow, friendshipCalls } = createContext({
        members: []
    });

    const result = flow.recordSteps(128);

    assert.equal(result.success, true);
    assert.equal(result.applied, false);
    assert.equal(result.reason, "No active Pokemon");
    assert.deepEqual(result.friendship, []);
    assert.equal(friendshipCalls.length, 0);
});


test("WorldFlow reports unavailable team after recording steps", () => {
    const { flow } = createContext({
        team: false
    });

    const result = flow.recordSteps(128);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Team unavailable");
    assert.equal(result.steps.intervals, 1);
});


test("WorldFlow reports missing friendship service after recording steps", () => {
    const { flow } = createContext({
        members: [{ species: "PIKACHU" }],
        friendship: false
    });

    const result = flow.recordSteps(128);

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Friendship service unavailable"
    );

    assert.equal(result.steps.intervals, 1);
});


test("WorldFlow propagates invalid step results", () => {
    const { flow } = createContext();

    const result = flow.recordSteps(-1);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid step count");
    assert.equal(flow.getTotalSteps(), 0);
});


// -------------------------------------
// World status
// -------------------------------------

test("WorldFlow returns the current world status", () => {
    const { flow } = createContext({
        currentLocation: "PALLET_TOWN"
    });

    flow.recordSteps(25);
    flow.moveTo("VIRIDIAN_CITY");

    const status = flow.getWorldStatus();

    assert.equal(status.current, "VIRIDIAN_CITY");
    assert.ok(status.visited.includes("PALLET_TOWN"));
    assert.ok(status.visited.includes("VIRIDIAN_CITY"));
    assert.equal(status.walkingSteps, 25);
    assert.equal(status.totalSteps, 25);
});


test("WorldFlow exposes walking step totals through delegated getters", () => {
    const { flow, world } = createContext();

    world.walkingSteps = 77;
    world.totalSteps = 333;

    assert.equal(flow.getWalkingSteps(), 77);
    assert.equal(flow.getTotalSteps(), 333);
});
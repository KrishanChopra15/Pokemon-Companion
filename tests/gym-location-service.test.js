"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GymLocationService = require("../scripts/services/gym-location-service");

// --------------------------------------------------
// Fixtures and mock dependencies
// --------------------------------------------------

function createGyms() {
    return {
        PEWTER_GYM: {
            id: "PEWTER_GYM",
            name: "Pewter Gym",
            location: "MAP_PE​​WTER_CITY"
        },
        CERULEAN_GYM: {
            id: "CERULEAN_GYM",
            name: "Cerulean Gym",
            location: "MAP_CERULEAN_CITY"
        }
    };
}

function createGymProgression(gyms = createGyms()) {
    const calls = {
        getGym: []
    };

    return {
        calls,

        getGym(gymId) {
            calls.getGym.push(gymId);

            return Object.prototype.hasOwnProperty.call(gyms, gymId)
                ? gyms[gymId]
                : null;
        }
    };
}

function createLocationGraph(graph = {}) {
    const calls = {
        getConnections: []
    };

    return {
        calls,

        getConnections(location) {
            calls.getConnections.push(location);
            return graph[location] || [];
        }
    };
}

function createProgression(options = {}) {
    const calls = {
        checkRequirement: [],
        getLocationProgression: [],
        canUnlock: []
    };

    return {
        calls,

        checkRequirement(requirement, playerState) {
            calls.checkRequirement.push({
                requirement,
                playerState
            });

            if (typeof options.checkRequirement === "function") {
                return options.checkRequirement(requirement, playerState);
            }

            return { allowed: true };
        },

        getLocationProgression(location) {
            calls.getLocationProgression.push(location);

            if (typeof options.getLocationProgression === "function") {
                return options.getLocationProgression(location);
            }

            return options.rules?.[location] || [];
        },

        canUnlock(rule, playerState) {
            calls.canUnlock.push({
                rule,
                playerState
            });

            if (typeof options.canUnlock === "function") {
                return options.canUnlock(rule, playerState);
            }

            return { allowed: true };
        }
    };
}

function createLocationGate(options = {}) {
    const calls = {
        canEnter: [],
        getWarnings: []
    };

    return {
        calls,

        canEnter(location, playerState) {
            calls.canEnter.push({ location, playerState });

            if (typeof options.canEnter === "function") {
                return options.canEnter(location, playerState);
            }

            return {
                allowed: options.allowed !== false
            };
        },

        getWarnings(location, playerState) {
            calls.getWarnings.push({ location, playerState });

            if (typeof options.getWarnings === "function") {
                return options.getWarnings(location, playerState);
            }

            return options.warnings?.[location] || [];
        }
    };
}

function createFieldObstacle(options = {}) {
    const calls = {
        getObstacles: [],
        canClearObstacle: []
    };

    return {
        calls,

        getObstacles(location) {
            calls.getObstacles.push(location);

            if (typeof options.getObstacles === "function") {
                return options.getObstacles(location);
            }

            return options.obstacles?.[location] || [];
        },

        canClearObstacle(location, obstacleType, playerState) {
            calls.canClearObstacle.push({
                location,
                obstacleType,
                playerState
            });

            if (typeof options.canClearObstacle === "function") {
                return options.canClearObstacle(
                    location,
                    obstacleType,
                    playerState
                );
            }

            return {
                clearable: options.clearable !== false
            };
        }
    };
}

function createEnvironment(options = {}) {
    const hasOwn = (key) =>
        Object.prototype.hasOwnProperty.call(options, key);

    const gymProgression = hasOwn("gymProgression")
        ? options.gymProgression
        : createGymProgression(options.gyms || createGyms());

    const locationGraph = hasOwn("locationGraph")
        ? options.locationGraph
        : createLocationGraph(options.graph || {});

    const locationGate = hasOwn("locationGate")
        ? options.locationGate
        : null;

    const fieldObstacle = hasOwn("fieldObstacle")
        ? options.fieldObstacle
        : null;

    const progression = hasOwn("progression")
        ? options.progression
        : null;

    const service = new GymLocationService(
        gymProgression,
        locationGraph,
        locationGate,
        fieldObstacle,
        progression
    );

    return {
        service,
        gymProgression,
        locationGraph,
        locationGate,
        fieldObstacle,
        progression
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a GymLocationService instance", () => {
    const { service } = createEnvironment();

    assert.ok(service instanceof GymLocationService);
});

test("constructor stores the gym progression service", () => {
    const env = createEnvironment();

    assert.strictEqual(
        env.service.gymProgression,
        env.gymProgression
    );
});

test("constructor stores the location graph service", () => {
    const env = createEnvironment();

    assert.strictEqual(
        env.service.locationGraph,
        env.locationGraph
    );
});

test("constructor stores the location gate service", () => {
    const gate = createLocationGate();
    const { service } = createEnvironment({
        locationGate: gate
    });

    assert.strictEqual(service.locationGate, gate);
});

test("constructor stores the field obstacle service", () => {
    const obstacles = createFieldObstacle();
    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    assert.strictEqual(service.fieldObstacle, obstacles);
});

test("constructor stores the progression service", () => {
    const progression = createProgression();
    const { service } = createEnvironment({
        progression
    });

    assert.strictEqual(service.progression, progression);
});

test("constructor defaults the location gate to null", () => {
    const { service } = createEnvironment();

    assert.equal(service.locationGate, null);
});

test("constructor defaults the field obstacle service to null", () => {
    const { service } = createEnvironment();

    assert.equal(service.fieldObstacle, null);
});

test("constructor defaults the progression service to null", () => {
    const { service } = createEnvironment();

    assert.equal(service.progression, null);
});

// --------------------------------------------------
// getStartingLocation
// --------------------------------------------------

test("getStartingLocation returns MAP_PALLET_TOWN", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getStartingLocation(),
        "MAP_PALLET_TOWN"
    );
});

test("getStartingLocation returns a string", () => {
    const { service } = createEnvironment();

    assert.equal(
        typeof service.getStartingLocation(),
        "string"
    );
});

// --------------------------------------------------
// getLocationsBeforeGym
// --------------------------------------------------

test("getLocationsBeforeGym returns an array", () => {
    const { service } = createEnvironment();

    assert.ok(
        Array.isArray(
            service.getLocationsBeforeGym("PEWTER_GYM")
        )
    );
});

test("getLocationsBeforeGym returns an empty array for an unknown gym", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getLocationsBeforeGym("UNKNOWN_GYM"),
        []
    );
});

test("getLocationsBeforeGym checks whether the gym exists", () => {
    const env = createEnvironment();

    env.service.getLocationsBeforeGym("PEWTER_GYM");

    assert.deepEqual(
        env.gymProgression.calls.getGym,
        ["PEWTER_GYM"]
    );
});

test("getLocationsBeforeGym does not traverse the graph for an unknown gym", () => {
    const env = createEnvironment();

    env.service.getLocationsBeforeGym("UNKNOWN_GYM");

    assert.deepEqual(
        env.locationGraph.calls.getConnections,
        []
    );
});

test("getLocationsBeforeGym includes the starting location", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        ["MAP_PALLET_TOWN"]
    );
});

test("getLocationsBeforeGym returns the starting location when the graph is empty", () => {
    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: []
        }
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        ["MAP_PALLET_TOWN"]
    );
});

test("getLocationsBeforeGym follows string connections", () => {
    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: ["MAP_ROUTE_1"],
            MAP_ROUTE_1: ["MAP_VIRIDIAN_CITY"],
            MAP_VIRIDIAN_CITY: []
        }
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        [
            "MAP_PALLET_TOWN",
            "MAP_ROUTE_1",
            "MAP_VIRIDIAN_CITY"
        ]
    );
});

test("getLocationsBeforeGym follows object connections", () => {
    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: [
                { location: "MAP_ROUTE_1" }
            ],
            MAP_ROUTE_1: [
                { location: "MAP_VIRIDIAN_CITY" }
            ],
            MAP_VIRIDIAN_CITY: []
        }
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        [
            "MAP_PALLET_TOWN",
            "MAP_ROUTE_1",
            "MAP_VIRIDIAN_CITY"
        ]
    );
});

test("getLocationsBeforeGym uses breadth-first traversal order", () => {
    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: [
                "MAP_ROUTE_1",
                "MAP_ROUTE_21"
            ],
            MAP_ROUTE_1: [
                "MAP_VIRIDIAN_CITY"
            ],
            MAP_ROUTE_21: [
                "MAP_CINNABAR_ISLAND"
            ],
            MAP_VIRIDIAN_CITY: [],
            MAP_CINNABAR_ISLAND: []
        }
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        [
            "MAP_PALLET_TOWN",
            "MAP_ROUTE_1",
            "MAP_ROUTE_21",
            "MAP_VIRIDIAN_CITY",
            "MAP_CINNABAR_ISLAND"
        ]
    );
});

test("getLocationsBeforeGym handles cycles in the graph", () => {
    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: ["MAP_ROUTE_1"],
            MAP_ROUTE_1: ["MAP_VIRIDIAN_CITY"],
            MAP_VIRIDIAN_CITY: [
                "MAP_PALLET_TOWN",
                "MAP_ROUTE_1"
            ]
        }
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        [
            "MAP_PALLET_TOWN",
            "MAP_ROUTE_1",
            "MAP_VIRIDIAN_CITY"
        ]
    );
});

test("getLocationsBeforeGym does not return duplicate visited locations", () => {
    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: [
                "MAP_ROUTE_1",
                "MAP_ROUTE_1"
            ],
            MAP_ROUTE_1: ["MAP_VIRIDIAN_CITY"],
            MAP_VIRIDIAN_CITY: [
                "MAP_ROUTE_1"
            ]
        }
    });

    const locations =
        service.getLocationsBeforeGym("PEWTER_GYM");

    assert.equal(
        locations.length,
        new Set(locations).size
    );
});

test("getLocationsBeforeGym skips an object connection without a location", () => {
    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: [
                {},
                { location: "MAP_ROUTE_1" }
            ],
            MAP_ROUTE_1: []
        }
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        [
            "MAP_PALLET_TOWN",
            "MAP_ROUTE_1"
        ]
    );
});

test("getLocationsBeforeGym skips an empty string destination", () => {
    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: [
                "",
                "MAP_ROUTE_1"
            ],
            MAP_ROUTE_1: []
        }
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        [
            "MAP_PALLET_TOWN",
            "MAP_ROUTE_1"
        ]
    );
});

test("getLocationsBeforeGym does not enter disconnected locations", () => {
    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: ["MAP_ROUTE_1"],
            MAP_ROUTE_1: [],
            MAP_CERULEAN_CITY: ["MAP_ROUTE_24"]
        }
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        [
            "MAP_PALLET_TOWN",
            "MAP_ROUTE_1"
        ]
    );
});

test("getLocationsBeforeGym passes the player state to location checks", () => {
    const playerState = {
        badges: ["BOULDER_BADGE"]
    };

    const gate = createLocationGate();
    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: ["MAP_ROUTE_1"],
            MAP_ROUTE_1: []
        },
        locationGate: gate
    });

    service.getLocationsBeforeGym(
        "PEWTER_GYM",
        playerState
    );

    assert.ok(
        gate.calls.canEnter.every(
            call => call.playerState === playerState
        )
    );
});

test("getLocationsBeforeGym uses an empty player state by default", () => {
    const gate = createLocationGate();
    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: ["MAP_ROUTE_1"],
            MAP_ROUTE_1: []
        },
        locationGate: gate
    });

    service.getLocationsBeforeGym("PEWTER_GYM");

    assert.ok(
        gate.calls.canEnter.every(
            call =>
                call.playerState !== null &&
                typeof call.playerState === "object"
        )
    );
});

test("getLocationsBeforeGym excludes a location rejected by a gate", () => {
    const gate = createLocationGate({
        canEnter(location) {
            return {
                allowed: location !== "MAP_ROUTE_1"
            };
        }
    });

    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: [
                "MAP_ROUTE_1",
                "MAP_ROUTE_2"
            ],
            MAP_ROUTE_1: ["MAP_ROUTE_3"],
            MAP_ROUTE_2: []
        },
        locationGate: gate
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        [
            "MAP_PALLET_TOWN",
            "MAP_ROUTE_2"
        ]
    );
});

test("getLocationsBeforeGym excludes a location with a blocked progression rule", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["NEED_BADGE"]
        },
        canUnlock(rule) {
            return {
                allowed: rule !== "NEED_BADGE"
            };
        }
    });

    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: ["MAP_ROUTE_1"],
            MAP_ROUTE_1: ["MAP_ROUTE_2"],
            MAP_ROUTE_2: []
        },
        progression
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        ["MAP_PALLET_TOWN"]
    );
});

test("getLocationsBeforeGym excludes a route with unsatisfied connection requirements", () => {
    const progression = createProgression({
        checkRequirement() {
            return { allowed: false };
        }
    });

    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: [
                {
                    location: "MAP_ROUTE_1",
                    requirements: ["CUT"]
                }
            ],
            MAP_ROUTE_1: []
        },
        progression
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        ["MAP_PALLET_TOWN"]
    );
});

test("getLocationsBeforeGym includes a route when its requirements are satisfied", () => {
    const progression = createProgression({
        checkRequirement() {
            return { allowed: true };
        }
    });

    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: [
                {
                    location: "MAP_ROUTE_1",
                    requirements: ["CUT"]
                }
            ],
            MAP_ROUTE_1: []
        },
        progression
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        [
            "MAP_PALLET_TOWN",
            "MAP_ROUTE_1"
        ]
    );
});

test("getLocationsBeforeGym returns a new array on each call", () => {
    const { service } = createEnvironment();

    const first =
        service.getLocationsBeforeGym("PEWTER_GYM");

    const second =
        service.getLocationsBeforeGym("PEWTER_GYM");

    assert.notStrictEqual(first, second);
    assert.deepEqual(first, second);
});

// --------------------------------------------------
// canTraverseConnection
// --------------------------------------------------

test("canTraverseConnection permits a connection with no requirements", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.canTraverseConnection([], {}),
        true
    );
});

test("canTraverseConnection permits undefined requirements", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.canTraverseConnection(undefined, {}),
        true
    );
});

test("canTraverseConnection permits null requirements", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.canTraverseConnection(null, {}),
        true
    );
});

test("canTraverseConnection permits an empty requirements array", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.canTraverseConnection([], {}),
        true
    );
});

test("canTraverseConnection permits unrestricted connections without progression", () => {
    const { service } = createEnvironment({
        progression: null
    });

    assert.equal(
        service.canTraverseConnection([], {}),
        true
    );
});

test("canTraverseConnection rejects required abilities when progression is absent", () => {
    const { service } = createEnvironment({
        progression: null
    });

    assert.equal(
        service.canTraverseConnection(
            ["CUT"],
            {}
        ),
        false
    );
});

test("canTraverseConnection checks each requirement using progression", () => {
    const progression = createProgression();
    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.canTraverseConnection(
            ["CUT", "SURF"],
            {}
        ),
        true
    );

    assert.equal(
        progression.calls.checkRequirement.length,
        2
    );
});

test("canTraverseConnection converts string requirements before checking them", () => {
    const progression = createProgression();
    const { service } = createEnvironment({
        progression
    });

    service.canTraverseConnection(["CUT"], {});

    assert.deepEqual(
        progression.calls.checkRequirement[0].requirement,
        {
            abilities: ["CUT"]
        }
    );
});

test("canTraverseConnection forwards the player state to progression", () => {
    const progression = createProgression();
    const playerState = { abilities: ["CAN_USE_CUT"] };

    const { service } = createEnvironment({
        progression
    });

    service.canTraverseConnection(
        ["CUT"],
        {},
        playerState
    );

    assert.strictEqual(
        progression.calls.checkRequirement[0].playerState,
        playerState
    );
});

test("canTraverseConnection rejects a connection when a requirement is denied", () => {
    const progression = createProgression({
        checkRequirement() {
            return { allowed: false };
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.canTraverseConnection(["CUT"], {}),
        false
    );
});

test("canTraverseConnection stops after the first denied requirement", () => {
    const progression = createProgression({
        checkRequirement(requirement) {
            return {
                allowed: requirement.abilities[0] !== "SURF"
            };
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.canTraverseConnection(
            ["CUT", "SURF", "STRENGTH"],
            {}
        ),
        false
    );

    assert.equal(
        progression.calls.checkRequirement.length,
        2
    );
});

test("canTraverseConnection continues when all requirements are allowed", () => {
    const progression = createProgression({
        checkRequirement() {
            return { allowed: true };
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.canTraverseConnection(
            ["CUT", "SURF", "STRENGTH"],
            {}
        ),
        true
    );
});

test("canTraverseConnection skips falsey requirement entries", () => {
    const progression = createProgression();
    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.canTraverseConnection(
            [null, "", false, "CUT"],
            {}
        ),
        true
    );

    assert.equal(
        progression.calls.checkRequirement.length,
        1
    );
});

test("canTraverseConnection propagates progression errors", () => {
    const progression = createProgression({
        checkRequirement() {
            throw new Error("Requirement check failed");
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.throws(
        () => service.canTraverseConnection(["CUT"], {}),
        /Requirement check failed/
    );
});

// --------------------------------------------------
// convertConnectionRequirement
// --------------------------------------------------

test("convertConnectionRequirement converts a string to an ability", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement("CUT"),
        {
            abilities: ["CUT"]
        }
    );
});

test("convertConnectionRequirement preserves a string ability's casing", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement("cut"),
        {
            abilities: ["cut"]
        }
    );
});

test("convertConnectionRequirement maps CUT to CAN_USE_CUT", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "CUT"
        }),
        {
            abilities: ["CAN_USE_CUT"]
        }
    );
});

test("convertConnectionRequirement maps FLASH to CAN_USE_FLASH", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "FLASH"
        }),
        {
            abilities: ["CAN_USE_FLASH"]
        }
    );
});

test("convertConnectionRequirement maps SURF to CAN_USE_SURF", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "SURF"
        }),
        {
            abilities: ["CAN_USE_SURF"]
        }
    );
});

test("convertConnectionRequirement maps STRENGTH to CAN_USE_STRENGTH", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "STRENGTH"
        }),
        {
            abilities: ["CAN_USE_STRENGTH"]
        }
    );
});

test("convertConnectionRequirement maps FLY to CAN_USE_FLY", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "FLY"
        }),
        {
            abilities: ["CAN_USE_FLY"]
        }
    );
});

test("convertConnectionRequirement maps ROCK_SMASH to CAN_USE_ROCK_SMASH", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "ROCK_SMASH"
        }),
        {
            abilities: ["CAN_USE_ROCK_SMASH"]
        }
    );
});

test("convertConnectionRequirement maps POKE_FLUTE to CAN_USE_POKE_FLUTE", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "POKE_FLUTE"
        }),
        {
            abilities: ["CAN_USE_POKE_FLUTE"]
        }
    );
});

test("convertConnectionRequirement is case-insensitive for mapped types", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "surf"
        }),
        {
            abilities: ["CAN_USE_SURF"]
        }
    );
});

test("convertConnectionRequirement preserves an explicit CAN_USE ability", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "CAN_USE_SURF"
        }),
        {
            abilities: ["CAN_USE_SURF"]
        }
    );
});

test("convertConnectionRequirement uppercases an explicit CAN_USE ability", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "can_use_surf"
        }),
        {
            abilities: ["CAN_USE_SURF"]
        }
    );
});

test("convertConnectionRequirement uppercases unknown requirement types", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "special_key"
        }),
        {
            abilities: ["SPECIAL_KEY"]
        }
    );
});

test("convertConnectionRequirement returns an empty abilities array for an object without a type", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({}),
        {
            abilities: []
        }
    );
});

test("convertConnectionRequirement returns an empty abilities array for a null requirement", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement(null),
        {
            abilities: []
        }
    );
});

test("convertConnectionRequirement returns an empty abilities array for an undefined requirement", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement(undefined),
        {
            abilities: []
        }
    );
});

test("convertConnectionRequirement returns an empty abilities array for a number", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement(42),
        {
            abilities: []
        }
    );
});

test("convertConnectionRequirement returns an empty abilities array for a boolean", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement(true),
        {
            abilities: []
        }
    );
});

test("convertConnectionRequirement returns an empty abilities array for an empty type", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: ""
        }),
        {
            abilities: []
        }
    );
});

test("convertConnectionRequirement returns an empty abilities array for a null type", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: null
        }),
        {
            abilities: []
        }
    );
});

// --------------------------------------------------
// canEnterLocation: location gates
// --------------------------------------------------

test("canEnterLocation permits entry when optional services are absent", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        true
    );
});

test("canEnterLocation permits entry when no location gate is configured", () => {
    const { service } = createEnvironment({
        locationGate: null
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        true
    );
});

test("canEnterLocation returns false when the location gate denies entry", () => {
    const gate = createLocationGate({
        allowed: false
    });

    const { service } = createEnvironment({
        locationGate: gate
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        false
    );
});

test("canEnterLocation passes the location to the gate", () => {
    const gate = createLocationGate();
    const { service } = createEnvironment({
        locationGate: gate
    });

    service.canEnterLocation("MAP_ROUTE_1", {});

    assert.equal(
        gate.calls.canEnter[0].location,
        "MAP_ROUTE_1"
    );
});

test("canEnterLocation passes the player state to the gate", () => {
    const gate = createLocationGate();
    const playerState = { badges: ["BOULDER_BADGE"] };

    const { service } = createEnvironment({
        locationGate: gate
    });

    service.canEnterLocation(
        "MAP_ROUTE_1",
        playerState
    );

    assert.strictEqual(
        gate.calls.canEnter[0].playerState,
        playerState
    );
});

test("canEnterLocation defaults player state to an object", () => {
    const gate = createLocationGate();
    const { service } = createEnvironment({
        locationGate: gate
    });

    service.canEnterLocation("MAP_ROUTE_1");

    assert.ok(
        gate.calls.canEnter[0].playerState &&
        typeof gate.calls.canEnter[0].playerState === "object"
    );
});

test("canEnterLocation does not check progression when the gate denies entry", () => {
    const gate = createLocationGate({
        allowed: false
    });
    const progression = createProgression();

    const { service } = createEnvironment({
        locationGate: gate,
        progression
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        false
    );

    assert.deepEqual(
        progression.calls.getLocationProgression,
        []
    );
});

test("canEnterLocation propagates gate errors", () => {
    const gate = {
        canEnter() {
            throw new Error("Location gate failed");
        }
    };

    const { service } = createEnvironment({
        locationGate: gate
    });

    assert.throws(
        () => service.canEnterLocation("MAP_ROUTE_1", {}),
        /Location gate failed/
    );
});

// --------------------------------------------------
// canEnterLocation: progression
// --------------------------------------------------

test("canEnterLocation checks progression rules for the location", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["RULE_A", "RULE_B"]
        }
    });

    const { service } = createEnvironment({
        progression
    });

    service.canEnterLocation("MAP_ROUTE_1", {});

    assert.deepEqual(
        progression.calls.getLocationProgression,
        ["MAP_ROUTE_1"]
    );
});

test("canEnterLocation permits entry when there are no progression rules", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: []
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        true
    );

    assert.deepEqual(
        progression.calls.canUnlock,
        []
    );
});

test("canEnterLocation permits entry when every progression rule is allowed", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["RULE_A", "RULE_B"]
        },
        canUnlock() {
            return { allowed: true };
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        true
    );

    assert.equal(
        progression.calls.canUnlock.length,
        2
    );
});

test("canEnterLocation rejects entry when a progression rule is denied", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["BLOCKED_RULE"]
        },
        canUnlock() {
            return { allowed: false };
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        false
    );
});

test("canEnterLocation stops after the first denied progression rule", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: [
                "RULE_A",
                "RULE_B",
                "RULE_C"
            ]
        },
        canUnlock(rule) {
            return {
                allowed: rule !== "RULE_B"
            };
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        false
    );

    assert.equal(
        progression.calls.canUnlock.length,
        2
    );
});

test("canEnterLocation passes the player state to progression checks", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["RULE_A"]
        }
    });

    const playerState = { badges: ["BOULDER_BADGE"] };

    const { service } = createEnvironment({
        progression
    });

    service.canEnterLocation(
        "MAP_ROUTE_1",
        playerState
    );

    assert.strictEqual(
        progression.calls.canUnlock[0].playerState,
        playerState
    );
});

test("canEnterLocation checks the gate before progression", () => {
    const order = [];

    const gate = {
        canEnter() {
            order.push("gate");
            return { allowed: true };
        }
    };

    const progression = {
        getLocationProgression() {
            order.push("getRules");
            return ["RULE_A"];
        },

        canUnlock() {
            order.push("unlock");
            return { allowed: true };
        }
    };

    const { service } = createEnvironment({
        locationGate: gate,
        progression
    });

    service.canEnterLocation("MAP_ROUTE_1", {});

    assert.deepEqual(
        order,
        ["gate", "getRules", "unlock"]
    );
});

test("canEnterLocation skips progression when the progression service is absent", () => {
    const { service } = createEnvironment({
        progression: null
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        true
    );
});

test("canEnterLocation propagates progression rule lookup errors", () => {
    const progression = {
        getLocationProgression() {
            throw new Error("Rule lookup failed");
        }
    };

    const { service } = createEnvironment({
        progression
    });

    assert.throws(
        () => service.canEnterLocation("MAP_ROUTE_1", {}),
        /Rule lookup failed/
    );
});

test("canEnterLocation propagates progression unlock errors", () => {
    const progression = {
        getLocationProgression() {
            return ["RULE_A"];
        },

        canUnlock() {
            throw new Error("Unlock check failed");
        }
    };

    const { service } = createEnvironment({
        progression
    });

    assert.throws(
        () => service.canEnterLocation("MAP_ROUTE_1", {}),
        /Unlock check failed/
    );
});

// --------------------------------------------------
// canEnterLocation: field obstacles
// --------------------------------------------------

test("canEnterLocation permits entry when no obstacle service is configured", () => {
    const { service } = createEnvironment({
        fieldObstacle: null
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        true
    );
});

test("canEnterLocation permits entry when a location has no obstacles", () => {
    const obstacles = createFieldObstacle({
        obstacles: {
            MAP_ROUTE_1: []
        }
    });

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        true
    );

    assert.deepEqual(
        obstacles.calls.canClearObstacle,
        []
    );
});

test("canEnterLocation checks whether each obstacle can be cleared", () => {
    const obstacles = createFieldObstacle({
        obstacles: {
            MAP_ROUTE_1: [
                { type: "TREE" },
                { type: "ROCK" }
            ]
        }
    });

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        true
    );

    assert.equal(
        obstacles.calls.canClearObstacle.length,
        2
    );
});

test("canEnterLocation passes the correct obstacle type", () => {
    const obstacles = createFieldObstacle({
        obstacles: {
            MAP_ROUTE_1: [
                { type: "TREE" }
            ]
        }
    });

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    service.canEnterLocation("MAP_ROUTE_1", {});

    assert.deepEqual(
        obstacles.calls.canClearObstacle[0],
        {
            location: "MAP_ROUTE_1",
            obstacleType: "TREE",
            playerState: {}
        }
    );
});

test("canEnterLocation passes the player state to obstacle checks", () => {
    const obstacles = createFieldObstacle({
        obstacles: {
            MAP_ROUTE_1: [
                { type: "TREE" }
            ]
        }
    });

    const playerState = {
        abilities: ["CAN_USE_CUT"]
    };

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    service.canEnterLocation(
        "MAP_ROUTE_1",
        playerState
    );

    assert.strictEqual(
        obstacles.calls.canClearObstacle[0].playerState,
        playerState
    );
});

test("canEnterLocation rejects entry when an obstacle cannot be cleared", () => {
    const obstacles = createFieldObstacle({
        obstacles: {
            MAP_ROUTE_1: [
                { type: "TREE" }
            ]
        },
        clearable: false
    });

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        false
    );
});

test("canEnterLocation stops after the first uncleared obstacle", () => {
    const obstacles = createFieldObstacle({
        obstacles: {
            MAP_ROUTE_1: [
                { type: "TREE" },
                { type: "ROCK" },
                { type: "WATER" }
            ]
        },
        canClearObstacle(location, type) {
            return {
                clearable: type !== "ROCK"
            };
        }
    });

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        false
    );

    assert.equal(
        obstacles.calls.canClearObstacle.length,
        2
    );
});

test("canEnterLocation does not check obstacles when the gate denies entry", () => {
    const gate = createLocationGate({
        allowed: false
    });

    const obstacles = createFieldObstacle();

    const { service } = createEnvironment({
        locationGate: gate,
        fieldObstacle: obstacles
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        false
    );

    assert.deepEqual(
        obstacles.calls.getObstacles,
        []
    );
});

test("canEnterLocation does not check obstacles when progression denies entry", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["BLOCKED_RULE"]
        },
        canUnlock() {
            return { allowed: false };
        }
    });

    const obstacles = createFieldObstacle();

    const { service } = createEnvironment({
        progression,
        fieldObstacle: obstacles
    });

    assert.equal(
        service.canEnterLocation("MAP_ROUTE_1", {}),
        false
    );

    assert.deepEqual(
        obstacles.calls.getObstacles,
        []
    );
});

test("canEnterLocation checks obstacles after progression", () => {
    const order = [];

    const progression = {
        getLocationProgression() {
            order.push("progression");
            return [];
        }
    };

    const obstacles = {
        getObstacles() {
            order.push("obstacles");
            return [];
        }
    };

    const { service } = createEnvironment({
        progression,
        fieldObstacle: obstacles
    });

    service.canEnterLocation("MAP_ROUTE_1", {});

    assert.deepEqual(
        order,
        ["progression", "obstacles"]
    );
});

test("canEnterLocation propagates obstacle lookup errors", () => {
    const obstacles = {
        getObstacles() {
            throw new Error("Obstacle lookup failed");
        }
    };

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    assert.throws(
        () => service.canEnterLocation("MAP_ROUTE_1", {}),
        /Obstacle lookup failed/
    );
});

test("canEnterLocation propagates obstacle clearance errors", () => {
    const obstacles = {
        getObstacles() {
            return [{ type: "TREE" }];
        },

        canClearObstacle() {
            throw new Error("Obstacle clearance failed");
        }
    };

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    assert.throws(
        () => service.canEnterLocation("MAP_ROUTE_1", {}),
        /Obstacle clearance failed/
    );
});

// --------------------------------------------------
// getLocationWarnings
// --------------------------------------------------

test("getLocationWarnings returns an empty array when no gate exists", () => {
    const { service } = createEnvironment({
        locationGate: null
    });

    assert.deepEqual(
        service.getLocationWarnings(["MAP_ROUTE_1"]),
        []
    );
});

test("getLocationWarnings returns an empty array for an empty locations list", () => {
    const gate = createLocationGate();
    const { service } = createEnvironment({
        locationGate: gate
    });

    assert.deepEqual(
        service.getLocationWarnings([]),
        []
    );

    assert.deepEqual(
        gate.calls.getWarnings,
        []
    );
});

test("getLocationWarnings returns warnings for one location", () => {
    const gate = createLocationGate({
        warnings: {
            MAP_ROUTE_1: ["Requires CUT"]
        }
    });

    const { service } = createEnvironment({
        locationGate: gate
    });

    assert.deepEqual(
        service.getLocationWarnings(["MAP_ROUTE_1"]),
        [
            {
                location: "MAP_ROUTE_1",
                warnings: ["Requires CUT"]
            }
        ]
    );
});

test("getLocationWarnings skips locations without warnings", () => {
    const gate = createLocationGate({
        warnings: {
            MAP_ROUTE_1: [],
            MAP_ROUTE_2: ["Requires SURF"]
        }
    });

    const { service } = createEnvironment({
        locationGate: gate
    });

    assert.deepEqual(
        service.getLocationWarnings([
            "MAP_ROUTE_1",
            "MAP_ROUTE_2"
        ]),
        [
            {
                location: "MAP_ROUTE_2",
                warnings: ["Requires SURF"]
            }
        ]
    );
});

test("getLocationWarnings returns warnings for multiple locations", () => {
    const gate = createLocationGate({
        warnings: {
            MAP_ROUTE_1: ["Requires CUT"],
            MAP_ROUTE_2: ["Requires SURF"],
            MAP_ROUTE_3: []
        }
    });

    const { service } = createEnvironment({
        locationGate: gate
    });

    assert.deepEqual(
        service.getLocationWarnings([
            "MAP_ROUTE_1",
            "MAP_ROUTE_2",
            "MAP_ROUTE_3"
        ]),
        [
            {
                location: "MAP_ROUTE_1",
                warnings: ["Requires CUT"]
            },
            {
                location: "MAP_ROUTE_2",
                warnings: ["Requires SURF"]
            }
        ]
    );
});

test("getLocationWarnings preserves the input location order", () => {
    const gate = createLocationGate({
        warnings: {
            MAP_ROUTE_3: ["Warning C"],
            MAP_ROUTE_1: ["Warning A"],
            MAP_ROUTE_2: ["Warning B"]
        }
    });

    const { service } = createEnvironment({
        locationGate: gate
    });

    const result = service.getLocationWarnings([
        "MAP_ROUTE_3",
        "MAP_ROUTE_1",
        "MAP_ROUTE_2"
    ]);

    assert.deepEqual(
        result.map(item => item.location),
        [
            "MAP_ROUTE_3",
            "MAP_ROUTE_1",
            "MAP_ROUTE_2"
        ]
    );
});

test("getLocationWarnings passes the player state to the gate", () => {
    const gate = createLocationGate({
        warnings: {
            MAP_ROUTE_1: ["Requires CUT"]
        }
    });

    const playerState = {
        abilities: []
    };

    const { service } = createEnvironment({
        locationGate: gate
    });

    service.getLocationWarnings(
        ["MAP_ROUTE_1"],
        playerState
    );

    assert.strictEqual(
        gate.calls.getWarnings[0].playerState,
        playerState
    );
});

test("getLocationWarnings defaults the player state to an object", () => {
    const gate = createLocationGate();
    const { service } = createEnvironment({
        locationGate: gate
    });

    service.getLocationWarnings(["MAP_ROUTE_1"]);

    assert.ok(
        gate.calls.getWarnings[0].playerState &&
        typeof gate.calls.getWarnings[0].playerState === "object"
    );
});

test("getLocationWarnings calls the gate once per location", () => {
    const gate = createLocationGate();
    const { service } = createEnvironment({
        locationGate: gate
    });

    service.getLocationWarnings([
        "MAP_ROUTE_1",
        "MAP_ROUTE_2",
        "MAP_ROUTE_3"
    ]);

    assert.equal(
        gate.calls.getWarnings.length,
        3
    );
});

test("getLocationWarnings preserves the original warning array", () => {
    const warnings = ["Requires CUT", "Requires a badge"];

    const gate = createLocationGate({
        warnings: {
            MAP_ROUTE_1: warnings
        }
    });

    const { service } = createEnvironment({
        locationGate: gate
    });

    const result = service.getLocationWarnings([
        "MAP_ROUTE_1"
    ]);

    assert.strictEqual(
        result[0].warnings,
        warnings
    );
});

test("getLocationWarnings propagates gate errors", () => {
    const gate = {
        getWarnings() {
            throw new Error("Warning lookup failed");
        }
    };

    const { service } = createEnvironment({
        locationGate: gate
    });

    assert.throws(
        () => service.getLocationWarnings(["MAP_ROUTE_1"]),
        /Warning lookup failed/
    );
});

// --------------------------------------------------
// Integration: traversal and access rules
// --------------------------------------------------

test("getLocationsBeforeGym combines gates, progression, and obstacles", () => {
    const gate = createLocationGate({
        canEnter(location) {
            return {
                allowed: location !== "MAP_BLOCKED_BY_GATE"
            };
        }
    });

    const progression = createProgression({
        rules: {
            MAP_BLOCKED_BY_PROGRESSION: ["NEED_BADGE"]
        },
        canUnlock(rule) {
            return {
                allowed: rule !== "NEED_BADGE"
            };
        }
    });

    const obstacles = createFieldObstacle({
        obstacles: {
            MAP_BLOCKED_BY_OBSTACLE: [
                { type: "TREE" }
            ]
        },
        canClearObstacle() {
            return { clearable: false };
        }
    });

    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: [
                "MAP_OPEN_ROUTE",
                "MAP_BLOCKED_BY_GATE",
                "MAP_BLOCKED_BY_PROGRESSION",
                "MAP_BLOCKED_BY_OBSTACLE"
            ],
            MAP_OPEN_ROUTE: [],
            MAP_BLOCKED_BY_GATE: [],
            MAP_BLOCKED_BY_PROGRESSION: [],
            MAP_BLOCKED_BY_OBSTACLE: []
        },
        locationGate: gate,
        progression,
        fieldObstacle: obstacles
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        [
            "MAP_PALLET_TOWN",
            "MAP_OPEN_ROUTE"
        ]
    );
});

test("getLocationsBeforeGym allows traversal when all configured rules pass", () => {
    const gate = createLocationGate();

    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["RULE_A"]
        }
    });

    const obstacles = createFieldObstacle({
        obstacles: {
            MAP_ROUTE_1: [
                { type: "TREE" }
            ]
        }
    });

    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: [
                {
                    location: "MAP_ROUTE_1",
                    requirements: ["CUT"]
                }
            ],
            MAP_ROUTE_1: []
        },
        locationGate: gate,
        progression,
        fieldObstacle: obstacles
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        [
            "MAP_PALLET_TOWN",
            "MAP_ROUTE_1"
        ]
    );
});

test("getLocationsBeforeGym skips connection requirements when the requirements array is empty", () => {
    const progression = createProgression({
        checkRequirement() {
            throw new Error("Should not check an empty requirement list");
        }
    });

    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: [
                {
                    location: "MAP_ROUTE_1",
                    requirements: []
                }
            ],
            MAP_ROUTE_1: []
        },
        progression
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        [
            "MAP_PALLET_TOWN",
            "MAP_ROUTE_1"
        ]
    );

    assert.deepEqual(
        progression.calls.checkRequirement,
        []
    );
});

test("getLocationsBeforeGym does not traverse a connection without required progression", () => {
    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: [
                {
                    location: "MAP_ROUTE_1",
                    requirements: ["CUT"]
                }
            ],
            MAP_ROUTE_1: []
        },
        progression: null
    });

    assert.deepEqual(
        service.getLocationsBeforeGym("PEWTER_GYM"),
        ["MAP_PALLET_TOWN"]
    );
});

test("getLocationsBeforeGym propagates graph lookup errors", () => {
    const locationGraph = {
        getConnections() {
            throw new Error("Graph lookup failed");
        }
    };

    const { service } = createEnvironment({
        locationGraph
    });

    assert.throws(
        () => service.getLocationsBeforeGym("PEWTER_GYM"),
        /Graph lookup failed/
    );
});

test("getLocationsBeforeGym propagates gate errors encountered during traversal", () => {
    const gate = {
        canEnter() {
            throw new Error("Gate evaluation failed");
        }
    };

    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: ["MAP_ROUTE_1"],
            MAP_ROUTE_1: []
        },
        locationGate: gate
    });

    assert.throws(
        () => service.getLocationsBeforeGym("PEWTER_GYM"),
        /Gate evaluation failed/
    );
});

test("getLocationsBeforeGym propagates progression errors encountered during traversal", () => {
    const progression = createProgression({
        checkRequirement() {
            throw new Error("Connection progression failed");
        }
    });

    const { service } = createEnvironment({
        graph: {
            MAP_PALLET_TOWN: [
                {
                    location: "MAP_ROUTE_1",
                    requirements: ["CUT"]
                }
            ]
        },
        progression
    });

    assert.throws(
        () => service.getLocationsBeforeGym("PEWTER_GYM"),
        /Connection progression failed/
    );
});

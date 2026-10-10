"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const LocationAccessService = require("../scripts/services/location-access-service");

// --------------------------------------------------
// Fixtures and mock services
// --------------------------------------------------

function createGraph(options = {}) {
    const calls = [];

    return {
        calls,

        isReachable(startLocation, targetLocation, canTraverse) {
            calls.push({
                startLocation,
                targetLocation,
                canTraverse
            });

            if (typeof options.isReachable === "function") {
                return options.isReachable(
                    startLocation,
                    targetLocation,
                    canTraverse
                );
            }

            return options.reachable !== false;
        }
    };
}

function createGate(options = {}) {
    const calls = [];

    return {
        calls,

        canEnter(location, playerState) {
            calls.push({ location, playerState });

            if (typeof options.canEnter === "function") {
                return options.canEnter(location, playerState);
            }

            return {
                allowed: options.allowed !== false,
                reason: options.reason || null
            };
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
                return options.checkRequirement(
                    requirement,
                    playerState
                );
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
            calls.canUnlock.push({ rule, playerState });

            if (typeof options.canUnlock === "function") {
                return options.canUnlock(rule, playerState);
            }

            return { allowed: true };
        }
    };
}

function createObstacles(options = {}) {
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

        canClearObstacle(location, type, playerState) {
            calls.canClearObstacle.push({
                location,
                type,
                playerState
            });

            if (typeof options.canClearObstacle === "function") {
                return options.canClearObstacle(
                    location,
                    type,
                    playerState
                );
            }

            return {
                clearable: options.clearable !== false,
                requirement: options.requirement
            };
        }
    };
}

function createEnvironment(options = {}) {
    const has = key =>
        Object.prototype.hasOwnProperty.call(options, key);

    const graph = has("locationGraph")
        ? options.locationGraph
        : createGraph(options.graphOptions || {});

    const obstacles = has("fieldObstacle")
        ? options.fieldObstacle
        : createObstacles(options.obstacleOptions || {});

    const gate = has("locationGate")
        ? options.locationGate
        : null;

    const progression = has("progression")
        ? options.progression
        : null;

    return {
        graph,
        obstacles,
        gate,
        progression,

        service: new LocationAccessService(
            graph,
            obstacles,
            gate,
            progression
        )
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a LocationAccessService instance", () => {
    const { service } = createEnvironment();

    assert.ok(service instanceof LocationAccessService);
});

test("constructor stores the location graph service", () => {
    const env = createEnvironment();

    assert.strictEqual(env.service.locationGraph, env.graph);
});

test("constructor stores the field obstacle service", () => {
    const env = createEnvironment();

    assert.strictEqual(env.service.fieldObstacle, env.obstacles);
});

test("constructor stores the location gate service", () => {
    const gate = createGate();
    const env = createEnvironment({ locationGate: gate });

    assert.strictEqual(env.service.locationGate, gate);
});

test("constructor stores the progression service", () => {
    const progression = createProgression();
    const env = createEnvironment({ progression });

    assert.strictEqual(env.service.progression, progression);
});

test("constructor defaults the location gate to null", () => {
    const { service } = createEnvironment();

    assert.equal(service.locationGate, null);
});

test("constructor defaults progression to null", () => {
    const { service } = createEnvironment();

    assert.equal(service.progression, null);
});

test("constructor accepts an explicit null location gate", () => {
    const { service } = createEnvironment({
        locationGate: null
    });

    assert.equal(service.locationGate, null);
});

test("constructor accepts an explicit null progression service", () => {
    const { service } = createEnvironment({
        progression: null
    });

    assert.equal(service.progression, null);
});

// --------------------------------------------------
// analyzeLocation
// --------------------------------------------------

test("analyzeLocation returns an object", () => {
    const { service } = createEnvironment();

    assert.equal(
        typeof service.analyzeLocation(
            "MAP_ROUTE_1",
            "MAP_PALLET_TOWN"
        ),
        "object"
    );
});

test("analyzeLocation includes the target location", () => {
    const { service } = createEnvironment();

    const result = service.analyzeLocation(
        "MAP_ROUTE_1",
        "MAP_PALLET_TOWN"
    );

    assert.equal(result.location, "MAP_ROUTE_1");
});

test("analyzeLocation checks graph reachability", () => {
    const { service, graph } = createEnvironment();

    service.analyzeLocation(
        "MAP_ROUTE_1",
        "MAP_PALLET_TOWN"
    );

    assert.equal(graph.calls.length, 1);
    assert.equal(
        graph.calls[0].startLocation,
        "MAP_PALLET_TOWN"
    );
    assert.equal(
        graph.calls[0].targetLocation,
        "MAP_ROUTE_1"
    );
});

test("analyzeLocation reports reachable when the graph allows it", () => {
    const { service } = createEnvironment({
        graphOptions: {
            reachable: true
        }
    });

    assert.equal(
        service.analyzeLocation(
            "MAP_ROUTE_1",
            "MAP_PALLET_TOWN"
        ).reachable,
        true
    );
});

test("analyzeLocation reports unreachable when the graph denies it", () => {
    const { service } = createEnvironment({
        graphOptions: {
            reachable: false
        }
    });

    assert.equal(
        service.analyzeLocation(
            "MAP_ROUTE_1",
            "MAP_PALLET_TOWN"
        ).reachable,
        false
    );
});

test("analyzeLocation checks location gates", () => {
    const gate = createGate();
    const { service } = createEnvironment({
        locationGate: gate
    });

    service.analyzeLocation(
        "MAP_ROUTE_1",
        "MAP_PALLET_TOWN"
    );

    assert.equal(gate.calls.length, 1);
    assert.equal(gate.calls[0].location, "MAP_ROUTE_1");
});

test("analyzeLocation checks progression requirements", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["RULE_A"]
        }
    });

    const { service } = createEnvironment({
        progression
    });

    service.analyzeLocation(
        "MAP_ROUTE_1",
        "MAP_PALLET_TOWN"
    );

    assert.deepEqual(
        progression.calls.getLocationProgression,
        ["MAP_ROUTE_1"]
    );
});

test("analyzeLocation checks obstacle status", () => {
    const obstacles = createObstacles({
        obstacles: {
            MAP_ROUTE_1: [
                { type: "TREE", x: 2, y: 3 }
            ]
        }
    });

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    service.analyzeLocation(
        "MAP_ROUTE_1",
        "MAP_PALLET_TOWN"
    );

    assert.deepEqual(
        obstacles.calls.getObstacles,
        ["MAP_ROUTE_1"]
    );
});

test("analyzeLocation returns the gate result", () => {
    const gateResult = {
        allowed: false,
        reason: "Location locked"
    };

    const gate = createGate({
        canEnter() {
            return gateResult;
        }
    });

    const { service } = createEnvironment({
        locationGate: gate
    });

    assert.strictEqual(
        service.analyzeLocation(
            "MAP_ROUTE_1",
            "MAP_PALLET_TOWN"
        ).gate,
        gateResult
    );
});

test("analyzeLocation returns the progression result", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["RULE_A"]
        },
        canUnlock() {
            return {
                allowed: false,
                reason: "Rule denied"
            };
        }
    });

    const { service } = createEnvironment({
        progression
    });

    const result = service.analyzeLocation(
        "MAP_ROUTE_1",
        "MAP_PALLET_TOWN"
    );

    assert.deepEqual(result.progression, {
        allowed: false,
        reason: "Progression requirement not met"
    });
});

test("analyzeLocation returns obstacle status", () => {
    const { service } = createEnvironment({
        obstacleOptions: {
            obstacles: {
                MAP_ROUTE_1: [
                    { type: "TREE", x: 4, y: 5 }
                ]
            },
            requirement: "CAN_USE_CUT"
        }
    });

    const result = service.analyzeLocation(
        "MAP_ROUTE_1",
        "MAP_PALLET_TOWN",
        {}
    );

    assert.deepEqual(result.obstacles, [
        {
            type: "TREE",
            cleared: true,
            requirement: "CAN_USE_CUT",
            x: 4,
            y: 5
        }
    ]);
});

test("analyzeLocation reports accessible when all checks pass", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.analyzeLocation(
            "MAP_ROUTE_1",
            "MAP_PALLET_TOWN"
        ).accessible,
        true
    );
});

test("analyzeLocation reports inaccessible when unreachable", () => {
    const { service } = createEnvironment({
        graphOptions: {
            reachable: false
        }
    });

    assert.equal(
        service.analyzeLocation(
            "MAP_ROUTE_1",
            "MAP_PALLET_TOWN"
        ).accessible,
        false
    );
});

test("analyzeLocation reports inaccessible when a location gate denies entry", () => {
    const gate = createGate({
        allowed: false
    });

    const { service } = createEnvironment({
        locationGate: gate
    });

    assert.equal(
        service.analyzeLocation(
            "MAP_ROUTE_1",
            "MAP_PALLET_TOWN"
        ).accessible,
        false
    );
});

test("analyzeLocation reports inaccessible when progression denies entry", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["RULE_A"]
        },
        canUnlock() {
            return { allowed: false };
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.analyzeLocation(
            "MAP_ROUTE_1",
            "MAP_PALLET_TOWN"
        ).accessible,
        false
    );
});

test("analyzeLocation does not use obstacle status to calculate accessibility", () => {
    const obstacles = createObstacles({
        obstacles: {
            MAP_ROUTE_1: [{ type: "TREE" }]
        },
        clearable: false
    });

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    const result = service.analyzeLocation(
        "MAP_ROUTE_1",
        "MAP_PALLET_TOWN"
    );

    assert.equal(result.obstacles[0].cleared, false);
    assert.equal(result.accessible, true);
});

test("analyzeLocation passes player state to connection checks", () => {
    const playerState = {
        abilities: ["CAN_USE_CUT"]
    };

    const graph = createGraph({
        isReachable(start, target, canTraverse) {
            canTraverse(["CUT"], {});
            return true;
        }
    });

    const progression = createProgression();

    const { service } = createEnvironment({
        locationGraph: graph,
        progression
    });

    service.analyzeLocation(
        "MAP_ROUTE_1",
        "MAP_PALLET_TOWN",
        playerState
    );

    assert.strictEqual(
        progression.calls.checkRequirement[0].playerState,
        playerState
    );
});

test("analyzeLocation uses an empty player state by default", () => {
    const progression = createProgression();

    const graph = createGraph({
        isReachable(start, target, canTraverse) {
            canTraverse(["CUT"], {});
            return true;
        }
    });

    const { service } = createEnvironment({
        locationGraph: graph,
        progression
    });

    service.analyzeLocation(
        "MAP_ROUTE_1",
        "MAP_PALLET_TOWN"
    );

    assert.ok(
        progression.calls.checkRequirement[0].playerState
    );

    assert.equal(
        typeof progression.calls.checkRequirement[0].playerState,
        "object"
    );
});

test("analyzeLocation returns all expected properties", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        Object.keys(
            service.analyzeLocation(
                "MAP_ROUTE_1",
                "MAP_PALLET_TOWN"
            )
        ),
        [
            "location",
            "reachable",
            "accessible",
            "gate",
            "progression",
            "obstacles"
        ]
    );
});

test("analyzeLocation propagates graph errors", () => {
    const graph = {
        isReachable() {
            throw new Error("Graph lookup failed");
        }
    };

    const { service } = createEnvironment({
        locationGraph: graph
    });

    assert.throws(
        () => service.analyzeLocation(
            "MAP_ROUTE_1",
            "MAP_PALLET_TOWN"
        ),
        /Graph lookup failed/
    );
});

// --------------------------------------------------
// canTraverseConnection
// --------------------------------------------------

test("canTraverseConnection permits connections without requirements", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.canTraverseConnection([], {}, {}),
        true
    );
});

test("canTraverseConnection permits undefined requirements", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.canTraverseConnection(undefined, {}, {}),
        true
    );
});

test("canTraverseConnection permits null requirements", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.canTraverseConnection(null, {}, {}),
        true
    );
});

test("canTraverseConnection permits an empty requirements array", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.canTraverseConnection([], {}, {}),
        true
    );
});

test("canTraverseConnection rejects requirements without a progression service", () => {
    const { service } = createEnvironment({
        progression: null
    });

    assert.equal(
        service.canTraverseConnection(["CUT"], {}, {}),
        false
    );
});

test("canTraverseConnection checks requirements using progression", () => {
    const progression = createProgression();
    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.canTraverseConnection(["CUT", "SURF"], {}, {}),
        true
    );

    assert.equal(
        progression.calls.checkRequirement.length,
        2
    );
});

test("canTraverseConnection converts string requirements", () => {
    const progression = createProgression();
    const { service } = createEnvironment({
        progression
    });

    service.canTraverseConnection(["CUT"], {}, {});

    assert.deepEqual(
        progression.calls.checkRequirement[0].requirement,
        { abilities: ["CUT"] }
    );
});

test("canTraverseConnection forwards player state", () => {
    const progression = createProgression();
    const playerState = {
        abilities: ["CAN_USE_CUT"]
    };

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

test("canTraverseConnection rejects a denied requirement", () => {
    const progression = createProgression({
        checkRequirement() {
            return { allowed: false };
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.canTraverseConnection(["CUT"], {}, {}),
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
            {},
            {}
        ),
        false
    );

    assert.equal(
        progression.calls.checkRequirement.length,
        2
    );
});

test("canTraverseConnection skips falsey requirements", () => {
    const progression = createProgression();

    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.canTraverseConnection(
            [null, "", false, "CUT"],
            {},
            {}
        ),
        true
    );

    assert.equal(
        progression.calls.checkRequirement.length,
        1
    );
});

test("canTraverseConnection permits a connection when every requirement passes", () => {
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
            {},
            {}
        ),
        true
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
        () => service.canTraverseConnection(["CUT"], {}, {}),
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
        { abilities: ["CUT"] }
    );
});

test("convertConnectionRequirement maps CUT", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({ type: "CUT" }),
        { abilities: ["CAN_USE_CUT"] }
    );
});

test("convertConnectionRequirement maps FLASH", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({ type: "FLASH" }),
        { abilities: ["CAN_USE_FLASH"] }
    );
});

test("convertConnectionRequirement maps SURF", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({ type: "SURF" }),
        { abilities: ["CAN_USE_SURF"] }
    );
});

test("convertConnectionRequirement maps STRENGTH", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({ type: "STRENGTH" }),
        { abilities: ["CAN_USE_STRENGTH"] }
    );
});

test("convertConnectionRequirement maps FLY", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({ type: "FLY" }),
        { abilities: ["CAN_USE_FLY"] }
    );
});

test("convertConnectionRequirement maps ROCK_SMASH", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({ type: "ROCK_SMASH" }),
        { abilities: ["CAN_USE_ROCK_SMASH"] }
    );
});

test("convertConnectionRequirement maps POKE_FLUTE", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({ type: "POKE_FLUTE" }),
        { abilities: ["CAN_USE_POKE_FLUTE"] }
    );
});

test("convertConnectionRequirement preserves an explicit CAN_USE ability", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "CAN_USE_SURF"
        }),
        { abilities: ["CAN_USE_SURF"] }
    );
});

test("convertConnectionRequirement normalizes type casing", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "surf"
        }),
        { abilities: ["CAN_USE_SURF"] }
    );
});

test("convertConnectionRequirement uppercases an unknown type", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({
            type: "special_key"
        }),
        { abilities: ["SPECIAL_KEY"] }
    );
});

test("convertConnectionRequirement returns an empty abilities list for an object without a type", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({}),
        { abilities: [] }
    );
});

test("convertConnectionRequirement handles null", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement(null),
        { abilities: [] }
    );
});

test("convertConnectionRequirement handles undefined", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement(undefined),
        { abilities: [] }
    );
});

test("convertConnectionRequirement handles non-object values", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement(123),
        { abilities: [] }
    );
});

test("convertConnectionRequirement handles an empty type", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.convertConnectionRequirement({ type: "" }),
        { abilities: [] }
    );
});

// --------------------------------------------------
// checkLocationGate
// --------------------------------------------------

test("checkLocationGate allows entry when no gate service exists", () => {
    const { service } = createEnvironment({
        locationGate: null
    });

    assert.deepEqual(
        service.checkLocationGate("MAP_ROUTE_1", {}),
        {
            allowed: true,
            reason: null
        }
    );
});

test("checkLocationGate delegates to the gate service", () => {
    const gate = createGate();
    const { service } = createEnvironment({
        locationGate: gate
    });

    service.checkLocationGate("MAP_ROUTE_1", {});

    assert.equal(gate.calls.length, 1);
    assert.equal(gate.calls[0].location, "MAP_ROUTE_1");
});

test("checkLocationGate forwards player state", () => {
    const gate = createGate();
    const playerState = {
        badges: ["BOULDER_BADGE"]
    };

    const { service } = createEnvironment({
        locationGate: gate
    });

    service.checkLocationGate("MAP_ROUTE_1", playerState);

    assert.strictEqual(
        gate.calls[0].playerState,
        playerState
    );
});

test("checkLocationGate returns the gate result unchanged", () => {
    const result = {
        allowed: false,
        reason: "Requires a badge"
    };

    const gate = createGate({
        canEnter() {
            return result;
        }
    });

    const { service } = createEnvironment({
        locationGate: gate
    });

    assert.strictEqual(
        service.checkLocationGate("MAP_ROUTE_1", {}),
        result
    );
});

test("checkLocationGate propagates gate errors", () => {
    const gate = {
        canEnter() {
            throw new Error("Gate check failed");
        }
    };

    const { service } = createEnvironment({
        locationGate: gate
    });

    assert.throws(
        () => service.checkLocationGate("MAP_ROUTE_1", {}),
        /Gate check failed/
    );
});

// --------------------------------------------------
// checkProgression
// --------------------------------------------------

test("checkProgression allows entry when progression is absent", () => {
    const { service } = createEnvironment({
        progression: null
    });

    assert.deepEqual(
        service.checkProgression("MAP_ROUTE_1", {}),
        {
            allowed: true,
            reason: null
        }
    );
});

test("checkProgression allows entry when there are no rules", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: []
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.deepEqual(
        service.checkProgression("MAP_ROUTE_1", {}),
        {
            allowed: true,
            reason: null
        }
    );
});

test("checkProgression allows entry when rules are undefined", () => {
    const progression = createProgression({
        getLocationProgression() {
            return undefined;
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.deepEqual(
        service.checkProgression("MAP_ROUTE_1", {}),
        {
            allowed: true,
            reason: null
        }
    );
});

test("checkProgression looks up rules for the requested location", () => {
    const progression = createProgression();
    const { service } = createEnvironment({
        progression
    });

    service.checkProgression("MAP_CERULEAN_CITY", {});

    assert.deepEqual(
        progression.calls.getLocationProgression,
        ["MAP_CERULEAN_CITY"]
    );
});

test("checkProgression allows entry when the first rule succeeds", () => {
    const expected = {
        allowed: true,
        reason: "Requirement satisfied"
    };

    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["RULE_A", "RULE_B"]
        },
        canUnlock() {
            return expected;
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.strictEqual(
        service.checkProgression("MAP_ROUTE_1", {}),
        expected
    );

    assert.equal(
        progression.calls.canUnlock.length,
        1
    );
});

test("checkProgression returns the first successful rule result", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: [
                "BLOCKED_RULE",
                "ALLOWED_RULE",
                "UNREACHED_RULE"
            ]
        },
        canUnlock(rule) {
            if (rule === "ALLOWED_RULE") {
                return {
                    allowed: true,
                    rule
                };
            }

            return { allowed: false };
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.deepEqual(
        service.checkProgression("MAP_ROUTE_1", {}),
        {
            allowed: true,
            rule: "ALLOWED_RULE"
        }
    );

    assert.equal(
        progression.calls.canUnlock.length,
        2
    );
});

test("checkProgression denies entry when every rule fails", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["RULE_A", "RULE_B"]
        },
        canUnlock() {
            return { allowed: false };
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.deepEqual(
        service.checkProgression("MAP_ROUTE_1", {}),
        {
            allowed: false,
            reason: "Progression requirement not met"
        }
    );
});

test("checkProgression forwards player state to canUnlock", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["RULE_A"]
        }
    });

    const { service } = createEnvironment({
        progression
    });

    const playerState = {
        badges: ["BOULDER_BADGE"]
    };

    service.checkProgression("MAP_ROUTE_1", playerState);

    assert.strictEqual(
        progression.calls.canUnlock[0].playerState,
        playerState
    );
});

test("checkProgression continues checking when a rule is denied", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["RULE_A", "RULE_B"]
        },
        canUnlock(rule) {
            return {
                allowed: rule === "RULE_B"
            };
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.equal(
        service.checkProgression("MAP_ROUTE_1", {}).allowed,
        true
    );

    assert.equal(
        progression.calls.canUnlock.length,
        2
    );
});

test("checkProgression propagates rule lookup errors", () => {
    const progression = createProgression({
        getLocationProgression() {
            throw new Error("Rule lookup failed");
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.throws(
        () => service.checkProgression("MAP_ROUTE_1", {}),
        /Rule lookup failed/
    );
});

test("checkProgression propagates unlock check errors", () => {
    const progression = createProgression({
        rules: {
            MAP_ROUTE_1: ["RULE_A"]
        },
        canUnlock() {
            throw new Error("Unlock check failed");
        }
    });

    const { service } = createEnvironment({
        progression
    });

    assert.throws(
        () => service.checkProgression("MAP_ROUTE_1", {}),
        /Unlock check failed/
    );
});

// --------------------------------------------------
// getObstacleStatus
// --------------------------------------------------

test("getObstacleStatus returns an array", () => {
    const { service } = createEnvironment();

    assert.ok(
        Array.isArray(
            service.getObstacleStatus("MAP_ROUTE_1", {})
        )
    );
});

test("getObstacleStatus returns an empty array when no obstacles exist", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getObstacleStatus("MAP_ROUTE_1", {}),
        []
    );
});

test("getObstacleStatus retrieves obstacles for the requested location", () => {
    const obstacles = createObstacles();
    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    service.getObstacleStatus("MAP_ROUTE_1", {});

    assert.deepEqual(
        obstacles.calls.getObstacles,
        ["MAP_ROUTE_1"]
    );
});

test("getObstacleStatus returns obstacle types", () => {
    const { service } = createEnvironment({
        obstacleOptions: {
            obstacles: {
                MAP_ROUTE_1: [
                    { type: "TREE" },
                    { type: "ROCK" }
                ]
            }
        }
    });

    assert.deepEqual(
        service.getObstacleStatus("MAP_ROUTE_1", {}).map(
            item => item.type
        ),
        ["TREE", "ROCK"]
    );
});

test("getObstacleStatus reports clearable obstacles", () => {
    const { service } = createEnvironment({
        obstacleOptions: {
            obstacles: {
                MAP_ROUTE_1: [
                    { type: "TREE" }
                ],
                clearable: true
            }
        }
    });

    assert.equal(
        service.getObstacleStatus("MAP_ROUTE_1", {})[0].cleared,
        true
    );
});

test("getObstacleStatus reports uncleared obstacles", () => {
    const { service } = createEnvironment({
        obstacleOptions: {
            obstacles: {
                MAP_ROUTE_1: [
                    { type: "TREE" }
                ]
            },
            clearable: false
        }
    });

    assert.equal(
        service.getObstacleStatus("MAP_ROUTE_1", {})[0].cleared,
        false
    );
});

test("getObstacleStatus returns the obstacle requirement", () => {
    const { service } = createEnvironment({
        obstacleOptions: {
            obstacles: {
                MAP_ROUTE_1: [
                    { type: "TREE" }
                ]
            },
            requirement: "CAN_USE_CUT"
        }
    });

    assert.equal(
        service.getObstacleStatus("MAP_ROUTE_1", {})[0].requirement,
        "CAN_USE_CUT"
    );
});

test("getObstacleStatus defaults a missing requirement to null", () => {
    const { service } = createEnvironment({
        obstacleOptions: {
            obstacles: {
                MAP_ROUTE_1: [
                    { type: "ROCK" }
                ]
            }
        }
    });

    assert.equal(
        service.getObstacleStatus("MAP_ROUTE_1", {})[0].requirement,
        null
    );
});

test("getObstacleStatus preserves obstacle coordinates", () => {
    const { service } = createEnvironment({
        obstacleOptions: {
            obstacles: {
                MAP_ROUTE_1: [
                    { type: "TREE", x: 12, y: 7 }
                ]
            }
        }
    });

    assert.deepEqual(
        service.getObstacleStatus("MAP_ROUTE_1", {})[0],
        {
            type: "TREE",
            cleared: true,
            requirement: null,
            x: 12,
            y: 7
        }
    );
});

test("getObstacleStatus forwards player state to clearance checks", () => {
    const obstacles = createObstacles({
        obstacles: {
            MAP_ROUTE_1: [
                { type: "TREE" }
            ]
        }
    });

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    const playerState = {
        abilities: ["CAN_USE_CUT"]
    };

    service.getObstacleStatus(
        "MAP_ROUTE_1",
        playerState
    );

    assert.equal(
        obstacles.calls.canClearObstacle.length,
        1
    );

    assert.strictEqual(
        obstacles.calls.canClearObstacle[0].playerState,
        playerState
    );
});

test("getObstacleStatus checks every obstacle", () => {
    const obstacles = createObstacles({
        obstacles: {
            MAP_ROUTE_1: [
                { type: "TREE" },
                { type: "ROCK" },
                { type: "WATER" }
            ]
        }
    });

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    service.getObstacleStatus("MAP_ROUTE_1", {});

    assert.equal(
        obstacles.calls.canClearObstacle.length,
        3
    );
});

test("getObstacleStatus preserves obstacle order", () => {
    const { service } = createEnvironment({
        obstacleOptions: {
            obstacles: {
                MAP_ROUTE_1: [
                    { type: "ROCK" },
                    { type: "TREE" },
                    { type: "WATER" }
                ]
            }
        }
    });

    assert.deepEqual(
        service.getObstacleStatus("MAP_ROUTE_1", {}).map(
            item => item.type
        ),
        ["ROCK", "TREE", "WATER"]
    );
});

test("getObstacleStatus propagates obstacle lookup errors", () => {
    const obstacles = {
        getObstacles() {
            throw new Error("Obstacle lookup failed");
        }
    };

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    assert.throws(
        () => service.getObstacleStatus("MAP_ROUTE_1", {}),
        /Obstacle lookup failed/
    );
});

test("getObstacleStatus propagates obstacle clearance errors", () => {
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
        () => service.getObstacleStatus("MAP_ROUTE_1", {}),
        /Obstacle clearance failed/
    );
});

// --------------------------------------------------
// getBlockedObstacles
// --------------------------------------------------

test("getBlockedObstacles returns an array", () => {
    const { service } = createEnvironment();

    assert.ok(
        Array.isArray(
            service.getBlockedObstacles("MAP_ROUTE_1")
        )
    );
});

test("getBlockedObstacles returns an empty array when no obstacles exist", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getBlockedObstacles("MAP_ROUTE_1"),
        []
    );
});

test("getBlockedObstacles returns obstacles that cannot be cleared", () => {
    const { service } = createEnvironment({
        obstacleOptions: {
            obstacles: {
                MAP_ROUTE_1: [
                    { type: "TREE" },
                    { type: "ROCK" }
                ]
            },
            canClearObstacle(location, type) {
                return {
                    clearable: type !== "TREE"
                };
            }
        }
    });

    assert.deepEqual(
        service.getBlockedObstacles("MAP_ROUTE_1"),
        [{ type: "TREE" }]
    );
});

test("getBlockedObstacles excludes obstacles that can be cleared", () => {
    const { service } = createEnvironment({
        obstacleOptions: {
            obstacles: {
                MAP_ROUTE_1: [
                    { type: "TREE" },
                    { type: "ROCK" }
                ]
            }
        }
    });

    assert.deepEqual(
        service.getBlockedObstacles("MAP_ROUTE_1"),
        []
    );
});

test("getBlockedObstacles forwards player state to clearance checks", () => {
    const obstacles = createObstacles({
        obstacles: {
            MAP_ROUTE_1: [
                { type: "TREE" }
            ],
            clearable: false
        }
    });

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    const playerState = {
        abilities: []
    };

    service.getBlockedObstacles(
        "MAP_ROUTE_1",
        playerState
    );

    assert.strictEqual(
        obstacles.calls.canClearObstacle[0].playerState,
        playerState
    );
});

test("getBlockedObstacles defaults player state to an object", () => {
    const obstacles = createObstacles({
        obstacles: {
            MAP_ROUTE_1: [
                { type: "TREE" }
            ]
        }
    });

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    service.getBlockedObstacles("MAP_ROUTE_1");

    assert.ok(
        obstacles.calls.canClearObstacle[0].playerState
    );

    assert.equal(
        typeof obstacles.calls.canClearObstacle[0].playerState,
        "object"
    );
});

test("getBlockedObstacles checks every obstacle", () => {
    const obstacles = createObstacles({
        obstacles: {
            MAP_ROUTE_1: [
                { type: "TREE" },
                { type: "ROCK" },
                { type: "WATER" }
            ]
        },
        clearable: false
    });

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    service.getBlockedObstacles("MAP_ROUTE_1");

    assert.equal(
        obstacles.calls.canClearObstacle.length,
        3
    );
});

test("getBlockedObstacles preserves the original obstacle objects", () => {
    const tree = { type: "TREE", x: 1, y: 2 };

    const obstacles = createObstacles({
        obstacles: {
            MAP_ROUTE_1: [tree]
        },
        clearable: false
    });

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    const result = service.getBlockedObstacles("MAP_ROUTE_1");

    assert.strictEqual(result[0], tree);
});

test("getBlockedObstacles preserves the order of blocked obstacles", () => {
    const { service } = createEnvironment({
        obstacleOptions: {
            obstacles: {
                MAP_ROUTE_1: [
                    { type: "ROCK" },
                    { type: "TREE" },
                    { type: "WATER" }
                ]
            },
            canClearObstacle(location, type) {
                return {
                    clearable: type === "TREE"
                };
            }
        }
    });

    assert.deepEqual(
        service.getBlockedObstacles("MAP_ROUTE_1").map(
            obstacle => obstacle.type
        ),
        ["ROCK", "WATER"]
    );
});

test("getBlockedObstacles propagates obstacle lookup errors", () => {
    const obstacles = {
        getObstacles() {
            throw new Error("Obstacle lookup failed");
        }
    };

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    assert.throws(
        () => service.getBlockedObstacles("MAP_ROUTE_1"),
        /Obstacle lookup failed/
    );
});

test("getBlockedObstacles propagates clearance errors", () => {
    const obstacles = {
        getObstacles() {
            return [{ type: "TREE" }];
        },

        canClearObstacle() {
            throw new Error("Clearance check failed");
        }
    };

    const { service } = createEnvironment({
        fieldObstacle: obstacles
    });

    assert.throws(
        () => service.getBlockedObstacles("MAP_ROUTE_1"),
        /Clearance check failed/
    );
});

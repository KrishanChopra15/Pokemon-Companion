"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const LocationGateService = require("../scripts/services/location-gate-service");

let fixtureCounter = 0;

const DEFAULT_LOCATIONS = {
    PALLET_TOWN: {
        id: "PALLET_TOWN",
        name: "Pallet Town",
        gates: {
            hard: [
                { id: "HARD_1", type: "CAN_USE_CUT" }
            ],
            soft: [
                { id: "SOFT_1", type: "CAN_USE_SURF" }
            ]
        }
    },

    ROUTE_1: {
        id: "ROUTE_1",
        name: "Route 1",
        gates: {
            hard: [],
            soft: []
        }
    },

    VIRIDIAN_CITY: {
        id: "VIRIDIAN_CITY",
        name: "Viridian City"
    }
};

function createFixture(t, options = {}) {
    const game =
        `__location_gate_service_test_${process.pid}_${++fixtureCounter}`;

    const directory = path.join(
        __dirname,
        "..",
        "database",
        "generated",
        game
    );

    fs.mkdirSync(directory, { recursive: true });

    if (options.writeLocations !== false) {
        const locations =
            Object.prototype.hasOwnProperty.call(options, "locations")
                ? options.locations
                : DEFAULT_LOCATIONS;

        fs.writeFileSync(
            path.join(directory, "locations.json"),
            JSON.stringify(locations),
            "utf8"
        );
    }

    t.after(() => {
        fs.rmSync(directory, {
            recursive: true,
            force: true
        });
    });

    return {
        game,
        directory,
        createService(progression = null) {
            return new LocationGateService(game, progression);
        }
    };
}

function progressionMock(rules = {}, checkRequirement = null) {
    const progression = {
        getAllProgression() {
            return rules;
        }
    };

    if (checkRequirement) {
        progression.checkRequirement = checkRequirement;
    }

    return progression;
}

// --------------------------------------------------
// Constructor and database loading
// --------------------------------------------------

test("constructor creates a LocationGateService instance", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.ok(service instanceof LocationGateService);
});

test("constructor loads location data", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(service.locations, DEFAULT_LOCATIONS);
});

test("constructor defaults progression to null", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(service.progression, null);
});

test("constructor stores the supplied progression service", t => {
    const fixture = createFixture(t);
    const progression = progressionMock();
    const service = fixture.createService(progression);

    assert.strictEqual(service.progression, progression);
});

test("constructor loads custom location data", t => {
    const locations = {
        TEST_AREA: {
            id: "TEST_AREA",
            gates: {
                hard: [{ type: "TEST_GATE" }],
                soft: []
            }
        }
    };

    const fixture = createFixture(t, { locations });
    const service = fixture.createService();

    assert.deepEqual(service.locations, locations);
});

test("constructor throws when locations.json is missing", t => {
    const fixture = createFixture(t, {
        writeLocations: false
    });

    assert.throws(
        () => fixture.createService(),
        error =>
            error instanceof Error &&
            error.message.startsWith("Location database missing:")
    );
});

test("constructor throws when locations.json contains malformed JSON", t => {
    const fixture = createFixture(t);

    fs.writeFileSync(
        path.join(fixture.directory, "locations.json"),
        "{invalid json",
        "utf8"
    );

    assert.throws(
        () => fixture.createService(),
        SyntaxError
    );
});

test("constructor throws when the game directory does not exist", () => {
    const game =
        `__location_gate_service_missing_${process.pid}_${++fixtureCounter}`;

    assert.throws(
        () => new LocationGateService(game),
        error =>
            error instanceof Error &&
            error.message.startsWith("Location database missing:")
    );
});

// --------------------------------------------------
// getGate
// --------------------------------------------------

test("getGate returns hard and soft gates for a configured location", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getGate("PALLET_TOWN"),
        {
            hard: [{ id: "HARD_1", type: "CAN_USE_CUT" }],
            soft: [{ id: "SOFT_1", type: "CAN_USE_SURF" }]
        }
    );
});

test("getGate returns empty arrays for a location without gates", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getGate("VIRIDIAN_CITY"),
        { soft: [], hard: [] }
    );
});

test("getGate returns empty arrays for an unknown location", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getGate("UNKNOWN_LOCATION"),
        { soft: [], hard: [] }
    );
});

test("getGate returns empty arrays for an empty location ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(service.getGate(""), {
        soft: [],
        hard: []
    });
});

test("getGate copies the configured hard gate array", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const gates = service.getGate("PALLET_TOWN");

    assert.notStrictEqual(
        gates.hard,
        service.locations.PALLET_TOWN.gates.hard
    );
});

test("getGate copies the configured soft gate array", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const gates = service.getGate("PALLET_TOWN");

    assert.notStrictEqual(
        gates.soft,
        service.locations.PALLET_TOWN.gates.soft
    );
});

test("getGate preserves the configured gate objects", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const gates = service.getGate("PALLET_TOWN");

    assert.strictEqual(
        gates.hard[0],
        service.locations.PALLET_TOWN.gates.hard[0]
    );
});

test("getGate handles missing hard and soft arrays", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                id: "TEST_AREA",
                gates: {}
            }
        }
    });

    const service = fixture.createService();

    assert.deepEqual(service.getGate("TEST_AREA"), {
        soft: [],
        hard: []
    });
});

test("getGate preserves multiple configured gates and their order", t => {
    const locations = {
        TEST_AREA: {
            gates: {
                hard: [
                    { id: "H1", type: "CUT" },
                    { id: "H2", type: "SURF" }
                ],
                soft: [
                    { id: "S1", type: "FLASH" },
                    { id: "S2", type: "FLY" }
                ]
            }
        }
    };

    const fixture = createFixture(t, { locations });
    const service = fixture.createService();

    assert.deepEqual(service.getGate("TEST_AREA"), {
        hard: [
            { id: "H1", type: "CUT" },
            { id: "H2", type: "SURF" }
        ],
        soft: [
            { id: "S1", type: "FLASH" },
            { id: "S2", type: "FLY" }
        ]
    });
});

test("getGate includes matching progression hard gates", t => {
    const fixture = createFixture(t);
    const progression = progressionMock({
        rule1: {
            id: "WORLD_HARD",
            location: "ROUTE_1",
            type: "HARD_GATE",
            requirement: {
                badges: ["BOULDER_BADGE"]
            }
        }
    });

    const service = fixture.createService(progression);

    assert.deepEqual(
        service.getGate("ROUTE_1").hard,
        [{
            id: "WORLD_HARD",
            location: "ROUTE_1",
            type: "HARD_GATE",
            requirement: {
                badges: ["BOULDER_BADGE"]
            }
        }]
    );
});

test("getGate includes matching progression soft gates", t => {
    const fixture = createFixture(t);
    const progression = progressionMock({
        rule1: {
            id: "WORLD_SOFT",
            location: "ROUTE_1",
            type: "SOFT_GATE",
            requirement: {
                keyItems: ["BICYCLE"]
            }
        }
    });

    const service = fixture.createService(progression);

    assert.deepEqual(
        service.getGate("ROUTE_1").soft,
        [{
            id: "WORLD_SOFT",
            location: "ROUTE_1",
            type: "SOFT_GATE",
            requirement: {
                keyItems: ["BICYCLE"]
            }
        }]
    );
});

test("getGate matches progression gate types without case sensitivity", t => {
    const fixture = createFixture(t);
    const progression = progressionMock({
        a: {
            id: "A",
            location: "ROUTE_1",
            type: "hard_gate"
        },
        b: {
            id: "B",
            location: "ROUTE_1",
            type: "soft_gate"
        }
    });

    const service = fixture.createService(progression);
    const gates = service.getGate("ROUTE_1");

    assert.deepEqual(gates.hard.map(gate => gate.id), ["A"]);
    assert.deepEqual(gates.soft.map(gate => gate.id), ["B"]);
});

test("getGate ignores progression rules for other locations", t => {
    const fixture = createFixture(t);
    const progression = progressionMock({
        a: {
            id: "A",
            location: "PALLET_TOWN",
            type: "HARD_GATE"
        }
    });

    const service = fixture.createService(progression);

    assert.deepEqual(
        service.getGate("ROUTE_1").hard,
        []
    );
});

test("getGate ignores progression rules that are not hard or soft gates", t => {
    const fixture = createFixture(t);
    const progression = progressionMock({
        a: {
            id: "A",
            location: "ROUTE_1",
            type: "BADGE"
        },
        b: {
            id: "B",
            location: "ROUTE_1",
            type: "STORY"
        }
    });

    const service = fixture.createService(progression);

    assert.deepEqual(
        service.getGate("ROUTE_1"),
        { soft: [], hard: [] }
    );
});

test("getGate ignores null progression rules", t => {
    const fixture = createFixture(t);
    const progression = progressionMock({
        a: null,
        b: {
            id: "B",
            location: "ROUTE_1",
            type: "HARD_GATE"
        }
    });

    const service = fixture.createService(progression);

    assert.deepEqual(
        service.getGate("ROUTE_1").hard.map(gate => gate.id),
        ["B"]
    );
});

test("getGate preserves the complete progression requirement object", t => {
    const requirement = {
        badges: ["CASCADE_BADGE"],
        keyItems: ["BICYCLE"],
        storyFlags: ["BRIDGE_REPAIRED"],
        abilities: ["CAN_USE_SURF"]
    };

    const fixture = createFixture(t);
    const progression = progressionMock({
        a: {
            id: "A",
            location: "ROUTE_1",
            type: "HARD_GATE",
            requirement
        }
    });

    const service = fixture.createService(progression);

    assert.deepEqual(
        service.getGate("ROUTE_1").hard[0].requirement,
        requirement
    );
});

test("getGate does not duplicate a progression hard gate with a matching ID", t => {
    const fixture = createFixture(t);
    const progression = progressionMock({
        a: {
            id: "HARD_1",
            location: "PALLET_TOWN",
            type: "HARD_GATE",
            requirement: {
                abilities: ["CAN_USE_SURF"]
            }
        }
    });

    const service = fixture.createService(progression);

    assert.equal(
        service.getGate("PALLET_TOWN").hard.length,
        1
    );
});

test("getGate does not duplicate a progression soft gate with a matching ID", t => {
    const fixture = createFixture(t);
    const progression = progressionMock({
        a: {
            id: "SOFT_1",
            location: "PALLET_TOWN",
            type: "SOFT_GATE",
            requirement: {
                abilities: ["CAN_USE_CUT"]
            }
        }
    });

    const service = fixture.createService(progression);

    assert.equal(
        service.getGate("PALLET_TOWN").soft.length,
        1
    );
});

test("getGate allows same IDs in separate hard and soft lists", t => {
    const fixture = createFixture(t);
    const progression = progressionMock({
        a: {
            id: "SHARED_ID",
            location: "ROUTE_1",
            type: "HARD_GATE"
        },
        b: {
            id: "SHARED_ID",
            location: "ROUTE_1",
            type: "SOFT_GATE"
        }
    });

    const service = fixture.createService(progression);
    const gates = service.getGate("ROUTE_1");

    assert.equal(gates.hard.length, 1);
    assert.equal(gates.soft.length, 1);
});

test("getGate can use progression rules without configured location gates", t => {
    const fixture = createFixture(t, {
        locations: {
            ROUTE_1: {
                id: "ROUTE_1"
            }
        }
    });

    const progression = progressionMock({
        a: {
            id: "WORLD_GATE",
            location: "ROUTE_1",
            type: "HARD_GATE"
        }
    });

    const service = fixture.createService(progression);

    assert.equal(
        service.getGate("ROUTE_1").hard.length,
        1
    );
});

test("getGate ignores progression when getAllProgression is absent", t => {
    const fixture = createFixture(t);
    const service = fixture.createService({});

    assert.deepEqual(
        service.getGate("ROUTE_1"),
        { soft: [], hard: [] }
    );
});

test("getGate ignores progression when getAllProgression is not a function", t => {
    const fixture = createFixture(t);
    const service = fixture.createService({
        getAllProgression: true
    });

    assert.deepEqual(
        service.getGate("ROUTE_1"),
        { soft: [], hard: [] }
    );
});

// --------------------------------------------------
// canEnter
// --------------------------------------------------

test("canEnter allows entry when there are no hard gates", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.canEnter("ROUTE_1"),
        { allowed: true }
    );
});

test("canEnter allows entry when location is unknown", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.canEnter("UNKNOWN_LOCATION"),
        { allowed: true }
    );
});

test("canEnter blocks entry when a hard ability gate is unmet", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.canEnter("PALLET_TOWN", {}),
        {
            allowed: false,
            type: "hard",
            requirement: "CAN_USE_CUT",
            reason: "Requires CAN_USE_CUT"
        }
    );
});

test("canEnter allows entry when a required ability is present", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.canEnter("PALLET_TOWN", {
            abilities: ["CAN_USE_CUT"]
        }),
        { allowed: true }
    );
});

test("canEnter allows an HM gate through the hms array", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                gates: {
                    hard: [{ type: "SURF" }]
                }
            }
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.canEnter("TEST_AREA", { hms: ["SURF"] }),
        { allowed: true }
    );
});

test("canEnter allows a CAN_USE gate through hmAbilities", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                gates: {
                    hard: [{ type: "CAN_USE_SURF" }]
                }
            }
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.canEnter("TEST_AREA", {
            hmAbilities: ["can_use_surf"]
        }),
        { allowed: true }
    );
});

test("canEnter allows an HM gate through hmAbilities", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                gates: {
                    hard: [{ type: "SURF" }]
                }
            }
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.canEnter("TEST_AREA", {
            hmAbilities: ["can_use_surf"]
        }),
        { allowed: true }
    );
});

test("canEnter checks ability names without case sensitivity", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                gates: {
                    hard: [{ type: "CAN_USE_CUT" }]
                }
            }
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.canEnter("TEST_AREA", {
            abilities: ["can_use_cut"]
        }),
        { allowed: true }
    );
});

test("canEnter checks hard gates in order", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                gates: {
                    hard: [
                        { type: "CAN_USE_CUT" },
                        { type: "CAN_USE_SURF" }
                    ]
                }
            }
        }
    });

    const service = fixture.createService();

    const result = service.canEnter("TEST_AREA", {});

    assert.equal(result.requirement, "CAN_USE_CUT");
    assert.equal(result.reason, "Requires CAN_USE_CUT");
});

test("canEnter ignores soft gates", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                gates: {
                    hard: [],
                    soft: [{ type: "CAN_USE_SURF" }]
                }
            }
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.canEnter("TEST_AREA", {}),
        { allowed: true }
    );
});

test("canEnter checks a progression hard gate", t => {
    const fixture = createFixture(t);
    const progression = progressionMock({
        a: {
            id: "WORLD_GATE",
            location: "ROUTE_1",
            type: "HARD_GATE",
            requirement: {
                badges: ["BOULDER_BADGE"]
            }
        }
    });

    const service = fixture.createService(progression);

    assert.deepEqual(
        service.canEnter("ROUTE_1", {}),
        {
            allowed: false,
            type: "hard",
            requirement: "HARD_GATE",
            reason: "Requires badge BOULDER_BADGE"
        }
    );
});

test("canEnter allows progression gate when its requirement is satisfied", t => {
    const fixture = createFixture(t);
    const progression = progressionMock({
        a: {
            id: "WORLD_GATE",
            location: "ROUTE_1",
            type: "HARD_GATE",
            requirement: {
                badges: ["BOULDER_BADGE"]
            }
        }
    });

    const service = fixture.createService(progression);

    assert.deepEqual(
        service.canEnter("ROUTE_1", {
            badges: ["BOULDER_BADGE"]
        }),
        { allowed: true }
    );
});

test("canEnter delegates explicit requirements to progression.checkRequirement", t => {
    const fixture = createFixture(t);

    const requirement = {
        abilities: ["CAN_USE_SURF"]
    };

    let receivedRequirement;
    let receivedState;

    const progression = progressionMock(
        {
            a: {
                id: "WORLD_GATE",
                location: "ROUTE_1",
                type: "HARD_GATE",
                requirement
            }
        },
        (givenRequirement, state) => {
            receivedRequirement = givenRequirement;
            receivedState = state;

            return { allowed: true };
        }
    );

    const service = fixture.createService(progression);
    const state = { marker: true };

    assert.deepEqual(
        service.canEnter("ROUTE_1", state),
        { allowed: true }
    );

    assert.strictEqual(receivedRequirement, requirement);
    assert.strictEqual(receivedState, state);
});

test("canEnter uses progression.checkRequirement for legacy gates", t => {
    const fixture = createFixture(t);

    let receivedRequirement;

    const progression = progressionMock(
        {
            a: {
                id: "WORLD_GATE",
                location: "ROUTE_1",
                type: "HARD_GATE"
            }
        },
        requirement => {
            receivedRequirement = requirement;
            return { allowed: true };
        }
    );

    const service = fixture.createService(progression);

    assert.deepEqual(
        service.canEnter("ROUTE_1", {}),
        { allowed: true }
    );

    assert.deepEqual(
        receivedRequirement,
        { ability: "HARD_GATE" }
    );
});

// --------------------------------------------------
// getWarnings
// --------------------------------------------------

test("getWarnings returns an empty array when no soft gates exist", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getWarnings("ROUTE_1"),
        []
    );
});

test("getWarnings returns a warning for an unmet soft gate", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getWarnings("PALLET_TOWN", {}),
        [{
            type: "CAN_USE_SURF",
            reason: "Requires CAN_USE_SURF"
        }]
    );
});

test("getWarnings returns no warning when the soft requirement is met", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getWarnings("PALLET_TOWN", {
            abilities: ["CAN_USE_SURF"]
        }),
        []
    );
});

test("getWarnings does not block entry", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                gates: {
                    hard: [],
                    soft: [{ type: "CAN_USE_SURF" }]
                }
            }
        }
    });

    const service = fixture.createService();

    assert.deepEqual(service.canEnter("TEST_AREA"), {
        allowed: true
    });

    assert.equal(
        service.getWarnings("TEST_AREA").length,
        1
    );
});

test("getWarnings returns warnings in soft gate order", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                gates: {
                    soft: [
                        { type: "CAN_USE_CUT" },
                        { type: "CAN_USE_SURF" }
                    ]
                }
            }
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getWarnings("TEST_AREA"),
        [
            {
                type: "CAN_USE_CUT",
                reason: "Requires CAN_USE_CUT"
            },
            {
                type: "CAN_USE_SURF",
                reason: "Requires CAN_USE_SURF"
            }
        ]
    );
});

test("getWarnings uses the gate reason before the generated reason", t => {
    const fixture = createFixture(t, {
        locations: {
            TEST_AREA: {
                gates: {
                    soft: [{
                        type: "CAN_USE_SURF",
                        reason: "Recommended: learn Surf first"
                    }]
                }
            }
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getWarnings("TEST_AREA"),
        [{
            type: "CAN_USE_SURF",
            reason: "Recommended: learn Surf first"
        }]
    );
});

test("getWarnings includes progression soft gates", t => {
    const fixture = createFixture(t);

    const progression = progressionMock({
        a: {
            id: "WORLD_SOFT",
            location: "ROUTE_1",
            type: "SOFT_GATE",
            requirement: {
                keyItems: ["BICYCLE"]
            }
        }
    });

    const service = fixture.createService(progression);

    assert.deepEqual(
        service.getWarnings("ROUTE_1", {}),
        [{
            type: "SOFT_GATE",
            reason: "Requires key item BICYCLE"
        }]
    );
});

test("getWarnings omits satisfied progression soft gates", t => {
    const fixture = createFixture(t);

    const progression = progressionMock({
        a: {
            id: "WORLD_SOFT",
            location: "ROUTE_1",
            type: "SOFT_GATE",
            requirement: {
                keyItems: ["BICYCLE"]
            }
        }
    });

    const service = fixture.createService(progression);

    assert.deepEqual(
        service.getWarnings("ROUTE_1", {
            keyItems: ["BICYCLE"]
        }),
        []
    );
});

// --------------------------------------------------
// hasRequirement
// --------------------------------------------------

test("hasRequirement allows a missing gate", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.hasRequirement(null, {}),
        { allowed: true }
    );
});

test("hasRequirement allows an undefined gate", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.hasRequirement(undefined, {}),
        { allowed: true }
    );
});

test("hasRequirement delegates explicit object requirements to progression", t => {
    const fixture = createFixture(t);

    const requirement = {
        badges: ["CASCADE_BADGE"]
    };

    let receivedRequirement;

    const progression = {
        checkRequirement(givenRequirement) {
            receivedRequirement = givenRequirement;
            return { allowed: false, reason: "Not ready" };
        }
    };

    const service = fixture.createService(progression);

    const result = service.hasRequirement(
        {
            type: "HARD_GATE",
            requirement
        },
        {}
    );

    assert.deepEqual(result, {
        allowed: false,
        reason: "Not ready"
    });

    assert.strictEqual(receivedRequirement, requirement);
});

test("hasRequirement falls back to direct progression checks without checkRequirement", t => {
    const fixture = createFixture(t);
    const service = fixture.createService({});

    assert.deepEqual(
        service.hasRequirement(
            {
                type: "HARD_GATE",
                requirement: {
                    badges: ["BOULDER_BADGE"]
                }
            },
            {}
        ),
        {
            allowed: false,
            reason: "Requires badge BOULDER_BADGE"
        }
    );
});

test("hasRequirement checks legacy gates through progression", t => {
    const fixture = createFixture(t);

    let receivedRequirement;

    const progression = {
        checkRequirement(requirement) {
            receivedRequirement = requirement;
            return { allowed: true };
        }
    };

    const service = fixture.createService(progression);

    assert.deepEqual(
        service.hasRequirement({
            type: "CAN_USE_SURF"
        }, {}),
        { allowed: true }
    );

    assert.deepEqual(
        receivedRequirement,
        { abilities: ["CAN_USE_SURF"] }
    );
});

test("hasRequirement checks legacy gates directly without progression", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.hasRequirement({
            type: "CAN_USE_CUT"
        }, {}),
        {
            allowed: false,
            reason: "Requires CAN_USE_CUT"
        }
    );
});

test("hasRequirement can check a legacy ability gate through player abilities", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.hasRequirement({
            type: "CAN_USE_CUT"
        }, {
            abilities: ["CAN_USE_CUT"]
        }),
        { allowed: true }
    );
});

// --------------------------------------------------
// convertGateToRequirement
// --------------------------------------------------

test("convertGateToRequirement converts a string to an ability requirement", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement("CLIMB"),
        { ability: "CLIMB" }
    );
});

test("convertGateToRequirement maps CUT to CAN_USE_CUT", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({ type: "CUT" }),
        { abilities: ["CAN_USE_CUT"] }
    );
});

test("convertGateToRequirement maps FLASH to CAN_USE_FLASH", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({ type: "FLASH" }),
        { abilities: ["CAN_USE_FLASH"] }
    );
});

test("convertGateToRequirement maps SURF to CAN_USE_SURF", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({ type: "SURF" }),
        { abilities: ["CAN_USE_SURF"] }
    );
});

test("convertGateToRequirement maps STRENGTH to CAN_USE_STRENGTH", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({ type: "STRENGTH" }),
        { abilities: ["CAN_USE_STRENGTH"] }
    );
});

test("convertGateToRequirement maps FLY to CAN_USE_FLY", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({ type: "FLY" }),
        { abilities: ["CAN_USE_FLY"] }
    );
});

test("convertGateToRequirement maps ROCK_SMASH to CAN_USE_ROCK_SMASH", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({ type: "ROCK_SMASH" }),
        { abilities: ["CAN_USE_ROCK_SMASH"] }
    );
});

test("convertGateToRequirement maps POKE_FLUTE to CAN_USE_POKE_FLUTE", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({ type: "POKE_FLUTE" }),
        { abilities: ["CAN_USE_POKE_FLUTE"] }
    );
});

test("convertGateToRequirement normalizes HM names to uppercase", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({ type: "surf" }),
        { abilities: ["CAN_USE_SURF"] }
    );
});

test("convertGateToRequirement preserves explicit CAN_USE abilities in uppercase", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({
            type: "can_use_cut"
        }),
        { abilities: ["CAN_USE_CUT"] }
    );
});

test("convertGateToRequirement converts badge types", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({
            type: "BOULDER_BADGE"
        }),
        { badges: ["BOULDER_BADGE"] }
    );
});

test("convertGateToRequirement converts item types", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({
            type: "ITEM_BICYCLE"
        }),
        { keyItems: ["BICYCLE"] }
    );
});

test("convertGateToRequirement converts story flag types", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({
            type: "FLAG_BRIDGE_REPAIRED"
        }),
        { storyFlags: ["BRIDGE_REPAIRED"] }
    );
});

test("convertGateToRequirement converts unknown types to generic abilities", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({
            type: "MYSTERY_REQUIREMENT"
        }),
        { ability: "MYSTERY_REQUIREMENT" }
    );
});

test("convertGateToRequirement handles missing gate type", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.convertGateToRequirement({}),
        { ability: "" }
    );
});

// --------------------------------------------------
// Direct progression requirement checks
// --------------------------------------------------

test("checkDirectProgressionRequirement allows an empty requirement", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectProgressionRequirement(null, {}),
        { allowed: true }
    );
});

test("checkDirectProgressionRequirement requires all listed badges", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectProgressionRequirement(
            { badges: ["BOULDER_BADGE", "CASCADE_BADGE"] },
            { badges: ["BOULDER_BADGE"] }
        ),
        {
            allowed: false,
            reason: "Requires badge CASCADE_BADGE"
        }
    );
});

test("checkDirectProgressionRequirement accepts all listed badges", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectProgressionRequirement(
            { badges: ["BOULDER_BADGE", "CASCADE_BADGE"] },
            { badges: ["BOULDER_BADGE", "CASCADE_BADGE"] }
        ),
        { allowed: true }
    );
});

test("checkDirectProgressionRequirement reports the first missing key item", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectProgressionRequirement(
            { keyItems: ["BICYCLE", "OLD_ROD"] },
            { keyItems: ["OLD_ROD"] }
        ),
        {
            allowed: false,
            reason: "Requires key item BICYCLE"
        }
    );
});

test("checkDirectProgressionRequirement accepts required key items", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectProgressionRequirement(
            { keyItems: ["BICYCLE"] },
            { keyItems: ["BICYCLE"] }
        ),
        { allowed: true }
    );
});

test("checkDirectProgressionRequirement checks story flags", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectProgressionRequirement(
            { storyFlags: ["BRIDGE_REPAIRED"] },
            {}
        ),
        {
            allowed: false,
            reason: "Requires story flag BRIDGE_REPAIRED"
        }
    );
});

test("checkDirectProgressionRequirement accepts required story flags", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectProgressionRequirement(
            { storyFlags: ["BRIDGE_REPAIRED"] },
            { storyFlags: ["BRIDGE_REPAIRED"] }
        ),
        { allowed: true }
    );
});

test("checkDirectProgressionRequirement checks abilities", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectProgressionRequirement(
            { abilities: ["CAN_USE_SURF"] },
            {}
        ),
        {
            allowed: false,
            reason: "Requires ability CAN_USE_SURF"
        }
    );
});

test("checkDirectProgressionRequirement accepts abilities from player state", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectProgressionRequirement(
            { abilities: ["CAN_USE_SURF"] },
            { abilities: ["CAN_USE_SURF"] }
        ),
        { allowed: true }
    );
});

test("checkDirectProgressionRequirement checks badges before key items", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const result = service.checkDirectProgressionRequirement(
        {
            badges: ["BOULDER_BADGE"],
            keyItems: ["BICYCLE"]
        },
        {}
    );

    assert.equal(result.reason, "Requires badge BOULDER_BADGE");
});

test("checkDirectProgressionRequirement checks key items before story flags", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const result = service.checkDirectProgressionRequirement(
        {
            keyItems: ["BICYCLE"],
            storyFlags: ["BRIDGE_REPAIRED"]
        },
        {}
    );

    assert.equal(result.reason, "Requires key item BICYCLE");
});

test("checkDirectProgressionRequirement checks story flags before abilities", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const result = service.checkDirectProgressionRequirement(
        {
            storyFlags: ["BRIDGE_REPAIRED"],
            abilities: ["CAN_USE_SURF"]
        },
        {}
    );

    assert.equal(result.reason, "Requires story flag BRIDGE_REPAIRED");
});

// --------------------------------------------------
// Direct legacy requirement checks
// --------------------------------------------------

test("checkDirectRequirement allows a missing gate", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectRequirement(null, {}),
        { allowed: true }
    );
});

test("checkDirectRequirement checks explicit CAN_USE abilities", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectRequirement(
            { type: "CAN_USE_SURF" },
            {}
        ),
        {
            allowed: false,
            reason: "Requires CAN_USE_SURF"
        }
    );
});

test("checkDirectRequirement allows an explicit ability gate when satisfied", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectRequirement(
            { type: "CAN_USE_SURF" },
            { abilities: ["CAN_USE_SURF"] }
        ),
        { allowed: true }
    );
});

test("checkDirectRequirement allows a legacy HM gate through hms", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectRequirement(
            { type: "CUT" },
            { hms: ["CUT"] }
        ),
        { allowed: true }
    );
});

test("checkDirectRequirement allows a legacy HM gate through abilities", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectRequirement(
            { type: "CUT" },
            { abilities: ["CAN_USE_CUT"] }
        ),
        { allowed: true }
    );
});

test("checkDirectRequirement checks badge names", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectRequirement(
            { type: "BOULDER_BADGE" },
            {}
        ),
        {
            allowed: false,
            reason: "Requires BOULDER_BADGE"
        }
    );
});

test("checkDirectRequirement allows a badge present in player state", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectRequirement(
            { type: "BOULDER_BADGE" },
            { badges: ["BOULDER_BADGE"] }
        ),
        { allowed: true }
    );
});

test("checkDirectRequirement checks story flag names", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectRequirement(
            { type: "BRIDGE_REPAIRED" },
            {}
        ),
        {
            allowed: false,
            reason: "Requires BRIDGE_REPAIRED"
        }
    );
});

test("checkDirectRequirement allows a story flag present in player state", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectRequirement(
            { type: "BRIDGE_REPAIRED" },
            { storyFlags: ["BRIDGE_REPAIRED"] }
        ),
        { allowed: true }
    );
});

test("checkDirectRequirement uses a custom reason for an unknown gate", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectRequirement(
            {
                type: "MYSTERY_REQUIREMENT",
                reason: "Complete the forest trial"
            },
            {}
        ),
        {
            allowed: false,
            reason: "Complete the forest trial"
        }
    );
});

test("checkDirectRequirement generates a reason for an unknown gate", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.checkDirectRequirement(
            { type: "MYSTERY_REQUIREMENT" },
            {}
        ),
        {
            allowed: false,
            reason: "Requires MYSTERY_REQUIREMENT"
        }
    );
});

// --------------------------------------------------
// Player-state helper methods
// --------------------------------------------------

test("hasBadge uses the playerState.hasBadge method when available", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    let receivedBadge;

    const state = {
        badges: [],
        hasBadge(badge) {
            receivedBadge = badge;
            return true;
        }
    };

    assert.equal(service.hasBadge("BOULDER_BADGE", state), true);
    assert.equal(receivedBadge, "BOULDER_BADGE");
});

test("hasBadge falls back to the badges array", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.hasBadge("BOULDER_BADGE", {
            badges: ["BOULDER_BADGE"]
        }),
        true
    );
});

test("hasBadge returns false for a missing badge", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.hasBadge("BOULDER_BADGE", {
            badges: []
        }),
        false
    );
});

test("hasKeyItem uses the playerState.hasKeyItem method when available", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    let receivedItem;

    const state = {
        keyItems: [],
        hasKeyItem(item) {
            receivedItem = item;
            return true;
        }
    };

    assert.equal(service.hasKeyItem("BICYCLE", state), true);
    assert.equal(receivedItem, "BICYCLE");
});

test("hasKeyItem falls back to the keyItems array", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.hasKeyItem("BICYCLE", {
            keyItems: ["BICYCLE"]
        }),
        true
    );
});

test("hasKeyItem returns false for a missing key item", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.hasKeyItem("BICYCLE", {
            keyItems: []
        }),
        false
    );
});

test("hasStoryFlag uses the playerState.hasStoryFlag method when available", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    let receivedFlag;

    const state = {
        storyFlags: [],
        hasStoryFlag(flag) {
            receivedFlag = flag;
            return true;
        }
    };

    assert.equal(
        service.hasStoryFlag("BRIDGE_REPAIRED", state),
        true
    );

    assert.equal(receivedFlag, "BRIDGE_REPAIRED");
});

test("hasStoryFlag falls back to the storyFlags array", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.hasStoryFlag("BRIDGE_REPAIRED", {
            storyFlags: ["BRIDGE_REPAIRED"]
        }),
        true
    );
});

test("hasStoryFlag returns false for a missing flag", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.hasStoryFlag("BRIDGE_REPAIRED", {
            storyFlags: []
        }),
        false
    );
});

test("hasAbility checks ability names without case sensitivity", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.hasAbility("CAN_USE_SURF", {
            abilities: ["can_use_surf"]
        }),
        true
    );
});

test("hasAbility checks HM abilities without case sensitivity", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.hasAbility("CAN_USE_SURF", {
            hmAbilities: ["can_use_surf"]
        }),
        true
    );
});

test("hasAbility maps CAN_USE ability to the hms array", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.hasAbility("CAN_USE_SURF", {
            hms: ["SURF"]
        }),
        true
    );
});

test("hasAbility returns false when the ability is missing", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.hasAbility("CAN_USE_SURF", {
            abilities: [],
            hmAbilities: [],
            hms: []
        }),
        false
    );
});

test("hasAbility returns false when player state has no ability arrays", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.hasAbility("CAN_USE_SURF", {}),
        false
    );
});

test("hasAbility supports non-string ability values in arrays", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.hasAbility("123", {
            abilities: [123]
        }),
        true
    );
});

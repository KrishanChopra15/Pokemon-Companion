"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const MapAccessService = require("../scripts/services/map-access-service");

let fixtureCounter = 0;

const DEFAULT_LOCATIONS = {
    PALLET_TOWN: {
        id: "PALLET_TOWN",
        name: "Pallet Town",
        gates: {
            hard: [
                {
                    abilities: ["CAN_USE_CUT"]
                }
            ],
            soft: [
                {
                    type: "SURF",
                    reason: "Surf is recommended"
                }
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

function createService(options = {}) {
    const locations =
        Object.prototype.hasOwnProperty.call(options, "locations")
            ? options.locations
            : DEFAULT_LOCATIONS;

    const progression =
        Object.prototype.hasOwnProperty.call(options, "progression")
            ? options.progression
            : [];

    const game = options.game || "test-game";

    return new MapAccessService(game, locations, progression);
}

function createDiskFixture(t, options = {}) {
    const game =
        `__map_access_service_test_${process.pid}_${++fixtureCounter}`;

    const directory = path.join(
        process.cwd(),
        "database",
        "generated",
        game
    );

    if (options.createDirectory !== false) {
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

        if (options.writeProgression !== false) {
            const progression =
                Object.prototype.hasOwnProperty.call(options, "progression")
                    ? options.progression
                    : [];

            fs.writeFileSync(
                path.join(directory, "progression.json"),
                JSON.stringify(progression),
                "utf8"
            );
        }

        t.after(() => {
            fs.rmSync(directory, {
                recursive: true,
                force: true
            });
        });
    }

    return {
        game,
        directory,
        createService() {
            return new MapAccessService(game);
        }
    };
}

// --------------------------------------------------
// Constructor and database loading
// --------------------------------------------------

test("constructor creates a MapAccessService instance", () => {
    const service = createService();

    assert.ok(service instanceof MapAccessService);
});

test("constructor defaults the game to firered", () => {
    const service = new MapAccessService(
        undefined,
        {},
        {}
    );

    assert.equal(service.game, "firered");
});

test("constructor stores the selected game", () => {
    const service = createService({ game: "leafgreen" });

    assert.equal(service.game, "leafgreen");
});

test("constructor uses the supplied location database", () => {
    const locations = {
        TEST_AREA: {
            id: "TEST_AREA"
        }
    };

    const service = createService({ locations });

    assert.strictEqual(service.locations, locations);
});

test("constructor uses the supplied progression database", () => {
    const progression = [
        {
            id: "RULE_1",
            location: "TEST_AREA",
            type: "STORY"
        }
    ];

    const service = createService({ progression });

    assert.strictEqual(service.progression, progression);
});

test("constructor uses empty injected objects without loading disk data", () => {
    const locations = {};
    const progression = {};

    const service = new MapAccessService(
        "__unused_game__",
        locations,
        progression
    );

    assert.strictEqual(service.locations, locations);
    assert.strictEqual(service.progression, progression);
});

test("constructor loads location and progression databases from disk", t => {
    const locations = {
        TEST_AREA: {
            id: "TEST_AREA",
            name: "Test Area"
        }
    };

    const progression = [
        {
            id: "RULE_1",
            location: "TEST_AREA",
            type: "STORY",
            requirement: {
                badge: "BOULDER_BADGE"
            }
        }
    ];

    const fixture = createDiskFixture(t, {
        locations,
        progression
    });

    const service = fixture.createService();

    assert.deepEqual(service.locations, locations);
    assert.deepEqual(service.progression, progression);
});

test("constructor defaults to empty objects when database files are missing", t => {
    const fixture = createDiskFixture(t, {
        createDirectory: false
    });

    const service = fixture.createService();

    assert.deepEqual(service.locations, {});
    assert.deepEqual(service.progression, {});
});

test("constructor throws when locations.json contains malformed JSON", t => {
    const fixture = createDiskFixture(t);

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

test("constructor throws when progression.json contains malformed JSON", t => {
    const fixture = createDiskFixture(t);

    fs.writeFileSync(
        path.join(fixture.directory, "progression.json"),
        "{invalid json",
        "utf8"
    );

    assert.throws(
        () => fixture.createService(),
        SyntaxError
    );
});

test("loadDatabase returns its default value when the file is missing", () => {
    const service = createService({
        game: "__missing_database_test__"
    });

    const fallback = { fallback: true };

    assert.strictEqual(
        service.loadDatabase(
            "generated",
            "does-not-exist.json",
            fallback
        ),
        fallback
    );
});

test("loadDatabase parses a valid JSON file", t => {
    const fixture = createDiskFixture(t, {
        locations: { A: { id: "A" } }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.loadDatabase(
            "generated",
            "locations.json",
            {}
        ),
        { A: { id: "A" } }
    );
});

test("loadDatabase throws when an existing file contains malformed JSON", t => {
    const fixture = createDiskFixture(t);

    fs.writeFileSync(
        path.join(fixture.directory, "locations.json"),
        "not-json",
        "utf8"
    );

    const service = new MapAccessService(
        fixture.game,
        {},
        {}
    );

    assert.throws(
        () => service.loadDatabase(
            "generated",
            "locations.json",
            {}
        ),
        SyntaxError
    );
});

// --------------------------------------------------
// buildProgressionIndex
// --------------------------------------------------

test("buildProgressionIndex groups records by location", () => {
    const service = createService({
        progression: [
            { id: "A", location: "ROUTE_1", type: "STORY" },
            { id: "B", location: "PALLET_TOWN", type: "GYM" },
            { id: "C", location: "ROUTE_1", type: "HARD_GATE" }
        ]
    });

    assert.deepEqual(
        service.progressionByLocation,
        {
            ROUTE_1: [
                { id: "A", location: "ROUTE_1", type: "STORY" },
                { id: "C", location: "ROUTE_1", type: "HARD_GATE" }
            ],
            PALLET_TOWN: [
                { id: "B", location: "PALLET_TOWN", type: "GYM" }
            ]
        }
    );
});

test("buildProgressionIndex supports an object database", () => {
    const progression = {
        ruleA: { id: "A", location: "ROUTE_1" },
        ruleB: { id: "B", location: "ROUTE_1" },
        ruleC: { id: "C", location: "FOREST" }
    };

    const service = createService({ progression });

    assert.deepEqual(
        service.progressionByLocation.ROUTE_1.map(rule => rule.id),
        ["A", "B"]
    );

    assert.deepEqual(
        service.progressionByLocation.FOREST.map(rule => rule.id),
        ["C"]
    );
});

test("buildProgressionIndex skips null records", () => {
    const service = createService({
        progression: [
            null,
            { id: "A", location: "ROUTE_1" }
        ]
    });

    assert.deepEqual(
        service.progressionByLocation.ROUTE_1.map(rule => rule.id),
        ["A"]
    );
});

test("buildProgressionIndex skips records without a location", () => {
    const service = createService({
        progression: [
            { id: "A" },
            { id: "B", location: "" },
            { id: "C", location: "ROUTE_1" }
        ]
    });

    assert.deepEqual(
        Object.keys(service.progressionByLocation),
        ["ROUTE_1"]
    );
});

test("buildProgressionIndex preserves records in input order", () => {
    const progression = [
        { id: "C", location: "A" },
        { id: "A", location: "A" },
        { id: "B", location: "A" }
    ];

    const service = createService({ progression });

    assert.deepEqual(
        service.progressionByLocation.A.map(rule => rule.id),
        ["C", "A", "B"]
    );
});

test("buildProgressionIndex returns an empty object for an empty database", () => {
    const service = createService({ progression: [] });

    assert.deepEqual(service.progressionByLocation, {});
});

test("buildProgressionIndex returns a fresh index when called again", () => {
    const service = createService({
        progression: [
            { id: "A", location: "ROUTE_1" }
        ]
    });

    const first = service.buildProgressionIndex();
    const second = service.buildProgressionIndex();

    assert.notStrictEqual(first, second);
    assert.deepEqual(first, second);
});

test("buildProgressionIndex stores original progression records", () => {
    const record = {
        id: "A",
        location: "ROUTE_1",
        type: "STORY"
    };

    const service = createService({
        progression: [record]
    });

    assert.strictEqual(
        service.progressionByLocation.ROUTE_1[0],
        record
    );
});

// --------------------------------------------------
// getAllLocations
// --------------------------------------------------

test("getAllLocations returns object database values", () => {
    const service = createService();

    assert.deepEqual(
        service.getAllLocations(),
        Object.values(DEFAULT_LOCATIONS)
    );
});

test("getAllLocations returns array databases unchanged", () => {
    const locations = [
        { id: "A", name: "Area A" },
        { id: "B", name: "Area B" }
    ];

    const service = createService({ locations });

    assert.strictEqual(service.getAllLocations(), locations);
});

test("getAllLocations returns an empty array for an empty object database", () => {
    const service = createService({ locations: {} });

    assert.deepEqual(service.getAllLocations(), []);
});

test("getAllLocations returns an empty array for an empty array database", () => {
    const locations = [];
    const service = createService({ locations });

    assert.strictEqual(service.getAllLocations(), locations);
});

test("getAllLocations preserves object value order", () => {
    const locations = {
        C: { id: "C" },
        A: { id: "A" },
        B: { id: "B" }
    };

    const service = createService({ locations });

    assert.deepEqual(
        service.getAllLocations().map(location => location.id),
        ["C", "A", "B"]
    );
});

// --------------------------------------------------
// getLocation
// --------------------------------------------------

test("getLocation finds a location by object key", () => {
    const service = createService();

    assert.deepEqual(
        service.getLocation("PALLET_TOWN"),
        DEFAULT_LOCATIONS.PALLET_TOWN
    );
});

test("getLocation returns the original stored object", () => {
    const service = createService();

    assert.strictEqual(
        service.getLocation("ROUTE_1"),
        service.locations.ROUTE_1
    );
});

test("getLocation finds a location by ID in an array database", () => {
    const locations = [
        { id: "AREA_A", name: "Area A" },
        { id: "AREA_B", name: "Area B" }
    ];

    const service = createService({ locations });

    assert.strictEqual(
        service.getLocation("AREA_B"),
        locations[1]
    );
});

test("getLocation returns null for an unknown location", () => {
    const service = createService();

    assert.equal(service.getLocation("UNKNOWN"), null);
});

test("getLocation returns null for an empty ID", () => {
    const service = createService();

    assert.equal(service.getLocation(""), null);
});

test("getLocation returns null for a null ID", () => {
    const service = createService();

    assert.equal(service.getLocation(null), null);
});

test("getLocation returns null for an undefined ID", () => {
    const service = createService();

    assert.equal(service.getLocation(undefined), null);
});

test("getLocation uses exact case-sensitive matching", () => {
    const service = createService();

    assert.equal(
        service.getLocation("pallet_town"),
        null
    );
});

test("getLocation returns null for a null object entry", () => {
    const service = createService({
        locations: { TEST_AREA: null }
    });

    assert.equal(service.getLocation("TEST_AREA"), null);
});

test("getLocation returns null when no array entry has the requested ID", () => {
    const service = createService({
        locations: [
            { id: "AREA_A" },
            { id: "AREA_B" }
        ]
    });

    assert.equal(service.getLocation("AREA_C"), null);
});

// --------------------------------------------------
// canAccess
// --------------------------------------------------

test("canAccess allows an existing location without blocking gates", () => {
    const service = createService();

    assert.deepEqual(
        service.canAccess("ROUTE_1", {}),
        { allowed: true }
    );
});

test("canAccess denies an unknown location", () => {
    const service = createService();

    assert.deepEqual(
        service.canAccess("UNKNOWN", {}),
        {
            allowed: false,
            reason: "Unknown location"
        }
    );
});

test("canAccess treats missing trainer state as an empty object", () => {
    const service = createService({
        locations: {
            AREA_A: { id: "AREA_A" }
        }
    });

    assert.deepEqual(
        service.canAccess("AREA_A"),
        { allowed: true }
    );
});

test("canAccess checks hard gates before progression rules", () => {
    const service = createService({
        locations: {
            AREA_A: {
                id: "AREA_A",
                gates: {
                    hard: [{ badge: "BOULDER_BADGE" }]
                }
            }
        },
        progression: [
            {
                id: "RULE",
                location: "AREA_A",
                type: "STORY",
                requirement: {
                    keyItem: "BICYCLE"
                }
            }
        ]
    });

    const result = service.canAccess("AREA_A", {});

    assert.deepEqual(result, {
        allowed: false,
        reason: "Requires BOULDER_BADGE"
    });
});

test("canAccess returns the hard-gate failure unchanged", () => {
    const failure = {
        allowed: false,
        reason: "Access denied by custom gate"
    };

    const service = createService({
        locations: {
            AREA_A: {
                id: "AREA_A",
                gates: {
                    hard: [{ badge: "BOULDER_BADGE" }]
                }
            }
        }
    });

    service.checkLocationHardGates = () => failure;

    assert.strictEqual(
        service.canAccess("AREA_A", {}),
        failure
    );
});

test("canAccess returns the progression failure unchanged", () => {
    const failure = {
        allowed: false,
        reason: "Story not complete"
    };

    const service = createService({
        locations: {
            AREA_A: { id: "AREA_A" }
        }
    });

    service.checkProgressionRules = () => failure;

    assert.strictEqual(
        service.canAccess("AREA_A", {}),
        failure
    );
});

test("canAccess allows entry when all hard and progression requirements are met", () => {
    const service = createService({
        locations: {
            AREA_A: {
                id: "AREA_A",
                gates: {
                    hard: [{ badge: "BOULDER_BADGE" }]
                }
            }
        },
        progression: [
            {
                id: "RULE",
                location: "AREA_A",
                type: "STORY",
                requirement: {
                    keyItem: "BICYCLE"
                }
            }
        ]
    });

    assert.deepEqual(
        service.canAccess("AREA_A", {
            badges: ["BOULDER_BADGE"],
            keyItems: ["BICYCLE"]
        }),
        { allowed: true }
    );
});

// --------------------------------------------------
// checkLocationHardGates
// --------------------------------------------------

test("checkLocationHardGates allows a location with no gates", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocationHardGates(
            { id: "AREA_A" },
            {}
        ),
        { allowed: true }
    );
});

test("checkLocationHardGates allows an empty hard-gate array", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocationHardGates(
            {
                id: "AREA_A",
                gates: { hard: [] }
            },
            {}
        ),
        { allowed: true }
    );
});

test("checkLocationHardGates blocks the first unmet hard gate", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocationHardGates(
            {
                id: "AREA_A",
                gates: {
                    hard: [
                        { badge: "BOULDER_BADGE" },
                        { keyItem: "BICYCLE" }
                    ]
                }
            },
            {}
        ),
        {
            allowed: false,
            reason: "Requires BOULDER_BADGE"
        }
    );
});

test("checkLocationHardGates allows entry when every hard gate is met", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocationHardGates(
            {
                id: "AREA_A",
                gates: {
                    hard: [
                        { badge: "BOULDER_BADGE" },
                        { keyItem: "BICYCLE" }
                    ]
                }
            },
            {
                badges: ["BOULDER_BADGE"],
                keyItems: ["BICYCLE"]
            }
        ),
        { allowed: true }
    );
});

test("checkLocationHardGates ignores soft gates", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocationHardGates(
            {
                id: "AREA_A",
                gates: {
                    hard: [],
                    soft: [
                        { ability: "CAN_USE_SURF" }
                    ]
                }
            },
            {}
        ),
        { allowed: true }
    );
});

test("checkLocationHardGates ignores non-array hard gates", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocationHardGates(
            {
                id: "AREA_A",
                gates: {
                    hard: { badge: "BOULDER_BADGE" }
                }
            },
            {}
        ),
        { allowed: true }
    );
});

// --------------------------------------------------
// checkProgressionRules
// --------------------------------------------------

test("checkProgressionRules allows a location with no rules", () => {
    const service = createService();

    assert.deepEqual(
        service.checkProgressionRules("UNKNOWN", {}),
        { allowed: true }
    );
});

test("checkProgressionRules checks a rule attached to the location", () => {
    const service = createService({
        progression: [
            {
                id: "RULE",
                location: "AREA_A",
                type: "STORY",
                requirement: {
                    badge: "BOULDER_BADGE"
                }
            }
        ]
    });

    assert.deepEqual(
        service.checkProgressionRules("AREA_A", {}),
        {
            allowed: false,
            reason: "Requires BOULDER_BADGE"
        }
    );
});

test("checkProgressionRules ignores GYM rules", () => {
    const service = createService({
        progression: [
            {
                id: "GYM_RULE",
                location: "AREA_A",
                type: "GYM",
                requirement: {
                    badge: "BOULDER_BADGE"
                }
            }
        ]
    });

    assert.deepEqual(
        service.checkProgressionRules("AREA_A", {}),
        { allowed: true }
    );
});

test("checkProgressionRules ignores HM rules", () => {
    const service = createService({
        progression: [
            {
                id: "HM_RULE",
                location: "AREA_A",
                type: "HM",
                requirement: {
                    ability: "CAN_USE_SURF"
                }
            }
        ]
    });

    assert.deepEqual(
        service.checkProgressionRules("AREA_A", {}),
        { allowed: true }
    );
});

test("checkProgressionRules ignores GYM and HM types case-insensitively", () => {
    const service = createService({
        progression: [
            {
                id: "GYM_RULE",
                location: "AREA_A",
                type: "gym",
                requirement: { badge: "BOULDER_BADGE" }
            },
            {
                id: "HM_RULE",
                location: "AREA_A",
                type: "hm",
                requirement: { ability: "CAN_USE_SURF" }
            }
        ]
    });

    assert.deepEqual(
        service.checkProgressionRules("AREA_A", {}),
        { allowed: true }
    );
});

test("checkProgressionRules returns the first failing rule result", () => {
    const service = createService({
        progression: [
            {
                id: "RULE_A",
                location: "AREA_A",
                type: "STORY",
                requirement: { badge: "BOULDER_BADGE" }
            },
            {
                id: "RULE_B",
                location: "AREA_A",
                type: "STORY",
                requirement: { keyItem: "BICYCLE" }
            }
        ]
    });

    assert.deepEqual(
        service.checkProgressionRules("AREA_A", {}),
        {
            allowed: false,
            reason: "Requires BOULDER_BADGE"
        }
    );
});

test("checkProgressionRules evaluates rules in order until one fails", () => {
    const service = createService({
        progression: [
            {
                id: "GYM_RULE",
                location: "AREA_A",
                type: "GYM",
                requirement: { badge: "BOULDER_BADGE" }
            },
            {
                id: "ACCESS_RULE",
                location: "AREA_A",
                type: "STORY",
                requirement: { keyItem: "BICYCLE" }
            }
        ]
    });

    assert.deepEqual(
        service.checkProgressionRules("AREA_A", {}),
        {
            allowed: false,
            reason: "Requires BICYCLE"
        }
    );
});

test("checkProgressionRules permits a rule with no requirement", () => {
    const service = createService({
        progression: [
            {
                id: "RULE",
                location: "AREA_A",
                type: "STORY"
            }
        ]
    });

    assert.deepEqual(
        service.checkProgressionRules("AREA_A", {}),
        { allowed: true }
    );
});

// --------------------------------------------------
// checkRequirement
// --------------------------------------------------

test("checkRequirement allows an empty requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(null, {}),
        { allowed: true }
    );
});

test("checkRequirement allows an undefined requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(undefined, {}),
        { allowed: true }
    );
});

test("checkRequirement requires all badges in the badges array", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                badges: ["BOULDER_BADGE", "CASCADE_BADGE"]
            },
            {
                badges: ["BOULDER_BADGE"]
            }
        ),
        {
            allowed: false,
            reason: "Missing required badges"
        }
    );
});

test("checkRequirement allows all satisfied badge requirements", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                badges: ["BOULDER_BADGE", "CASCADE_BADGE"]
            },
            {
                badges: ["BOULDER_BADGE", "CASCADE_BADGE"]
            }
        ),
        { allowed: true }
    );
});

test("checkRequirement supports a single badge", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { badge: "BOULDER_BADGE" },
            {}
        ),
        {
            allowed: false,
            reason: "Requires BOULDER_BADGE"
        }
    );
});

test("checkRequirement allows a satisfied single badge", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { badge: "BOULDER_BADGE" },
            { badges: ["BOULDER_BADGE"] }
        ),
        { allowed: true }
    );
});

test("checkRequirement requires every HM in the hms array", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { hms: ["CUT", "SURF"] },
            { hms: ["CUT"] }
        ),
        {
            allowed: false,
            reason: "Requires HM SURF"
        }
    );
});

test("checkRequirement allows all satisfied HMs", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { hms: ["CUT", "SURF"] },
            { hms: ["CUT", "SURF"] }
        ),
        { allowed: true }
    );
});

test("checkRequirement supports a single HM", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { hm: "SURF" },
            {}
        ),
        {
            allowed: false,
            reason: "Requires HM SURF"
        }
    );
});

test("checkRequirement supports multiple abilities", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { abilities: ["CAN_USE_CUT", "CAN_USE_SURF"] },
            { abilities: ["CAN_USE_CUT"] }
        ),
        {
            allowed: false,
            reason: "Requires ability CAN_USE_SURF"
        }
    );
});

test("checkRequirement allows satisfied abilities", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { abilities: ["CAN_USE_CUT", "CAN_USE_SURF"] },
            { abilities: ["CAN_USE_CUT", "CAN_USE_SURF"] }
        ),
        { allowed: true }
    );
});

test("checkRequirement supports a single ability", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { ability: "CAN_USE_SURF" },
            {}
        ),
        {
            allowed: false,
            reason: "Requires ability CAN_USE_SURF"
        }
    );
});

test("checkRequirement supports multiple key items", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { keyItems: ["BICYCLE", "OLD_ROD"] },
            { keyItems: ["BICYCLE"] }
        ),
        {
            allowed: false,
            reason: "Requires key item OLD_ROD"
        }
    );
});

test("checkRequirement allows satisfied key items", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { keyItems: ["BICYCLE", "OLD_ROD"] },
            { keyItems: ["BICYCLE", "OLD_ROD"] }
        ),
        { allowed: true }
    );
});

test("checkRequirement supports a single key item", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { keyItem: "BICYCLE" },
            {}
        ),
        {
            allowed: false,
            reason: "Requires BICYCLE"
        }
    );
});

test("checkRequirement supports multiple story flags", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { storyFlags: ["BRIDGE_REPAIRED", "ROCKETS_DEFEATED"] },
            { storyFlags: ["BRIDGE_REPAIRED"] }
        ),
        {
            allowed: false,
            reason: "Requires story flag ROCKETS_DEFEATED"
        }
    );
});

test("checkRequirement allows satisfied story flags", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { storyFlags: ["BRIDGE_REPAIRED"] },
            { storyFlags: ["BRIDGE_REPAIRED"] }
        ),
        { allowed: true }
    );
});

test("checkRequirement supports a single story flag", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { storyFlag: "BRIDGE_REPAIRED" },
            {}
        ),
        {
            allowed: false,
            reason: "Requires BRIDGE_REPAIRED"
        }
    );
});

test("checkRequirement checks access to a previously visited location", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { access: "PALLET_TOWN" },
            {}
        ),
        {
            allowed: false,
            reason: "Requires access to PALLET_TOWN"
        }
    );
});

test("checkRequirement allows access when the location was visited", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { access: "PALLET_TOWN" },
            { visitedLocations: ["PALLET_TOWN"] }
        ),
        { allowed: true }
    );
});

test("checkRequirement checks badges before the remaining requirements", () => {
    const service = createService();

    const result = service.checkRequirement(
        {
            badges: ["BOULDER_BADGE"],
            keyItem: "BICYCLE",
            storyFlag: "BRIDGE_REPAIRED"
        },
        {}
    );

    assert.equal(result.reason, "Missing required badges");
});

test("checkRequirement checks HMs before abilities", () => {
    const service = createService();

    const result = service.checkRequirement(
        {
            hms: ["SURF"],
            ability: "CAN_USE_CUT"
        },
        {}
    );

    assert.equal(result.reason, "Requires HM SURF");
});

test("checkRequirement checks abilities before key items", () => {
    const service = createService();

    const result = service.checkRequirement(
        {
            ability: "CAN_USE_CUT",
            keyItem: "BICYCLE"
        },
        {}
    );

    assert.equal(result.reason, "Requires ability CAN_USE_CUT");
});

test("checkRequirement checks key items before story flags", () => {
    const service = createService();

    const result = service.checkRequirement(
        {
            keyItem: "BICYCLE",
            storyFlag: "BRIDGE_REPAIRED"
        },
        {}
    );

    assert.equal(result.reason, "Requires BICYCLE");
});

test("checkRequirement allows an object containing only unknown fields", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { unknownField: "value" },
            {}
        ),
        { allowed: true }
    );
});

test("checkRequirement treats empty requirement arrays as satisfied", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                badges: [],
                hms: [],
                abilities: [],
                keyItems: [],
                storyFlags: []
            },
            {}
        ),
        { allowed: true }
    );
});

// --------------------------------------------------
// hasBadge and hasBadges
// --------------------------------------------------

test("hasBadge checks the badges array", () => {
    const service = createService();

    assert.equal(
        service.hasBadge(
            "BOULDER_BADGE",
            { badges: ["BOULDER_BADGE"] }
        ),
        true
    );
});

test("hasBadge returns false for a missing badge", () => {
    const service = createService();

    assert.equal(
        service.hasBadge(
            "BOULDER_BADGE",
            { badges: [] }
        ),
        false
    );
});

test("hasBadge prefers the trainer state's hasBadge method", () => {
    const service = createService();

    const state = {
        badges: [],
        hasBadge(badge) {
            return badge === "CASCADE_BADGE";
        }
    };

    assert.equal(
        service.hasBadge("CASCADE_BADGE", state),
        true
    );

    assert.equal(
        service.hasBadge("BOULDER_BADGE", state),
        false
    );
});

test("hasBadges requires every listed badge", () => {
    const service = createService();

    assert.equal(
        service.hasBadges(
            ["BOULDER_BADGE", "CASCADE_BADGE"],
            { badges: ["BOULDER_BADGE"] }
        ),
        false
    );
});

test("hasBadges returns true when every listed badge is present", () => {
    const service = createService();

    assert.equal(
        service.hasBadges(
            ["BOULDER_BADGE", "CASCADE_BADGE"],
            { badges: ["BOULDER_BADGE", "CASCADE_BADGE"] }
        ),
        true
    );
});

test("hasBadges returns true for an empty badge list", () => {
    const service = createService();

    assert.equal(service.hasBadges([], {}), true);
});

// --------------------------------------------------
// hasHM
// --------------------------------------------------

test("hasHM checks the hms array", () => {
    const service = createService();

    assert.equal(
        service.hasHM("SURF", { hms: ["SURF"] }),
        true
    );
});

test("hasHM checks exact values in hmAbilities", () => {
    const service = createService();

    assert.equal(
        service.hasHM("SURF", { hmAbilities: ["SURF"] }),
        true
    );
});

test("hasHM compares hmAbilities without case sensitivity", () => {
    const service = createService();

    assert.equal(
        service.hasHM("SURF", { hmAbilities: ["surf"] }),
        true
    );
});

test("hasHM prefers a successful custom hasHM method", () => {
    const service = createService();

    assert.equal(
        service.hasHM("SURF", {
            hasHM(hm) {
                return hm === "SURF";
            }
        }),
        true
    );
});

test("hasHM falls back to arrays when the custom method returns false", () => {
    const service = createService();

    assert.equal(
        service.hasHM("SURF", {
            hasHM() {
                return false;
            },
            hms: ["SURF"]
        }),
        true
    );
});

test("hasHM returns false when the HM is missing", () => {
    const service = createService();

    assert.equal(
        service.hasHM("SURF", {
            hms: [],
            hmAbilities: []
        }),
        false
    );
});

// --------------------------------------------------
// hasAbility
// --------------------------------------------------

test("hasAbility checks abilities case-insensitively", () => {
    const service = createService();

    assert.equal(
        service.hasAbility("CAN_USE_SURF", {
            abilities: ["can_use_surf"]
        }),
        true
    );
});

test("hasAbility checks HM abilities case-insensitively", () => {
    const service = createService();

    assert.equal(
        service.hasAbility("CAN_USE_SURF", {
            hmAbilities: ["can_use_surf"]
        }),
        true
    );
});

test("hasAbility maps CAN_USE abilities to the hms array", () => {
    const service = createService();

    assert.equal(
        service.hasAbility("CAN_USE_SURF", {
            hms: ["SURF"]
        }),
        true
    );
});

test("hasAbility maps CAN_USE abilities to case-insensitive HM abilities", () => {
    const service = createService();

    assert.equal(
        service.hasAbility("CAN_USE_SURF", {
            hmAbilities: ["surf"]
        }),
        true
    );
});

test("hasAbility returns false for a missing ability", () => {
    const service = createService();

    assert.equal(
        service.hasAbility("CAN_USE_SURF", {
            abilities: [],
            hmAbilities: [],
            hms: []
        }),
        false
    );
});

test("hasAbility treats a falsey ability as satisfied", () => {
    const service = createService();

    assert.equal(service.hasAbility("", {}), true);
    assert.equal(service.hasAbility(null, {}), true);
    assert.equal(service.hasAbility(undefined, {}), true);
});

test("hasAbility supports non-string values in ability arrays", () => {
    const service = createService();

    assert.equal(
        service.hasAbility("123", {
            abilities: [123]
        }),
        true
    );
});

test("hasAbility does not map a plain SURF ability name to the hms array", () => {
    const service = createService();

    assert.equal(
        service.hasAbility("SURF", {
            hms: ["SURF"]
        }),
        false
    );
});

// --------------------------------------------------
// hasKeyItem
// --------------------------------------------------

test("hasKeyItem checks the keyItems array", () => {
    const service = createService();

    assert.equal(
        service.hasKeyItem("BICYCLE", {
            keyItems: ["BICYCLE"]
        }),
        true
    );
});

test("hasKeyItem returns false for a missing item", () => {
    const service = createService();

    assert.equal(
        service.hasKeyItem("BICYCLE", {
            keyItems: []
        }),
        false
    );
});

test("hasKeyItem prefers the trainer state's hasKeyItem method", () => {
    const service = createService();

    const state = {
        keyItems: [],
        hasKeyItem(item) {
            return item === "BICYCLE";
        }
    };

    assert.equal(
        service.hasKeyItem("BICYCLE", state),
        true
    );

    assert.equal(
        service.hasKeyItem("OLD_ROD", state),
        false
    );
});

// --------------------------------------------------
// hasStoryFlag
// --------------------------------------------------

test("hasStoryFlag checks the storyFlags array", () => {
    const service = createService();

    assert.equal(
        service.hasStoryFlag("BRIDGE_REPAIRED", {
            storyFlags: ["BRIDGE_REPAIRED"]
        }),
        true
    );
});

test("hasStoryFlag returns false for a missing flag", () => {
    const service = createService();

    assert.equal(
        service.hasStoryFlag("BRIDGE_REPAIRED", {
            storyFlags: []
        }),
        false
    );
});

test("hasStoryFlag prefers the trainer state's hasStoryFlag method", () => {
    const service = createService();

    const state = {
        storyFlags: [],
        hasStoryFlag(flag) {
            return flag === "BRIDGE_REPAIRED";
        }
    };

    assert.equal(
        service.hasStoryFlag("BRIDGE_REPAIRED", state),
        true
    );

    assert.equal(
        service.hasStoryFlag("ROCKETS_DEFEATED", state),
        false
    );
});

// --------------------------------------------------
// hasVisited
// --------------------------------------------------

test("hasVisited checks visitedLocations", () => {
    const service = createService();

    assert.equal(
        service.hasVisited("PALLET_TOWN", {
            visitedLocations: ["PALLET_TOWN"]
        }),
        true
    );
});

test("hasVisited returns false for an unvisited location", () => {
    const service = createService();

    assert.equal(
        service.hasVisited("PALLET_TOWN", {
            visitedLocations: []
        }),
        false
    );
});

test("hasVisited prefers the trainer state's hasVisited method", () => {
    const service = createService();

    const state = {
        visitedLocations: [],
        hasVisited(location) {
            return location === "PALLET_TOWN";
        }
    };

    assert.equal(
        service.hasVisited("PALLET_TOWN", state),
        true
    );

    assert.equal(
        service.hasVisited("ROUTE_1", state),
        false
    );
});

// --------------------------------------------------
// getAvailableLocations
// --------------------------------------------------

test("getAvailableLocations returns locations that can be accessed", () => {
    const service = createService({
        locations: [
            { id: "OPEN_AREA" },
            {
                id: "LOCKED_AREA",
                gates: {
                    hard: [{ badge: "BOULDER_BADGE" }]
                }
            }
        ]
    });

    assert.deepEqual(
        service.getAvailableLocations({}),
        [{ id: "OPEN_AREA" }]
    );
});

test("getAvailableLocations includes every location when there are no blocking requirements", () => {
    const locations = [
        { id: "AREA_A" },
        { id: "AREA_B" }
    ];

    const service = createService({ locations });

    assert.deepEqual(
        service.getAvailableLocations({}),
        locations
    );
});

test("getAvailableLocations uses the supplied trainer state", () => {
    const locations = [
        {
            id: "AREA_A",
            gates: {
                hard: [{ badge: "BOULDER_BADGE" }]
            }
        },
        {
            id: "AREA_B",
            gates: {
                hard: [{ badge: "CASCADE_BADGE" }]
            }
        }
    ];

    const service = createService({ locations });

    assert.deepEqual(
        service.getAvailableLocations({
            badges: ["CASCADE_BADGE"]
        }),
        [locations[1]]
    );
});

test("getAvailableLocations returns an empty array for no locations", () => {
    const service = createService({ locations: [] });

    assert.deepEqual(
        service.getAvailableLocations({}),
        []
    );
});

test("getAvailableLocations excludes locations blocked by progression rules", () => {
    const locations = [
        { id: "OPEN_AREA" },
        { id: "STORY_AREA" }
    ];

    const service = createService({
        locations,
        progression: [
            {
                id: "RULE",
                location: "STORY_AREA",
                type: "STORY",
                requirement: {
                    storyFlag: "BRIDGE_REPAIRED"
                }
            }
        ]
    });

    assert.deepEqual(
        service.getAvailableLocations({}),
        [locations[0]]
    );
});

test("getAvailableLocations ignores blocking requirements on GYM progression records", () => {
    const locations = [{ id: "GYM_AREA" }];

    const service = createService({
        locations,
        progression: [
            {
                id: "GYM_RULE",
                location: "GYM_AREA",
                type: "GYM",
                requirement: {
                    badge: "BOULDER_BADGE"
                }
            }
        ]
    });

    assert.deepEqual(
        service.getAvailableLocations({}),
        locations
    );
});

// --------------------------------------------------
// unlockLocation
// --------------------------------------------------

test("unlockLocation succeeds for an accessible location", () => {
    const service = createService({
        locations: {
            AREA_A: { id: "AREA_A" }
        }
    });

    assert.deepEqual(
        service.unlockLocation("AREA_A", {}),
        {
            success: true,
            location: "AREA_A"
        }
    );
});

test("unlockLocation fails for an unknown location", () => {
    const service = createService();

    assert.deepEqual(
        service.unlockLocation("UNKNOWN", {}),
        {
            success: false,
            reason: "Unknown location"
        }
    );
});

test("unlockLocation fails when a hard gate is unmet", () => {
    const service = createService({
        locations: {
            AREA_A: {
                id: "AREA_A",
                gates: {
                    hard: [{ badge: "BOULDER_BADGE" }]
                }
            }
        }
    });

    assert.deepEqual(
        service.unlockLocation("AREA_A", {}),
        {
            success: false,
            reason: "Requires BOULDER_BADGE"
        }
    );
});

test("unlockLocation calls visitLocation after successful access", () => {
    const service = createService({
        locations: {
            AREA_A: { id: "AREA_A" }
        }
    });

    const visited = [];

    const result = service.unlockLocation("AREA_A", {
        visitLocation(location) {
            visited.push(location);
        }
    });

    assert.deepEqual(result, {
        success: true,
        location: "AREA_A"
    });

    assert.deepEqual(visited, ["AREA_A"]);
});

test("unlockLocation does not call visitLocation when access fails", () => {
    const service = createService();

    let called = false;

    const result = service.unlockLocation("UNKNOWN", {
        visitLocation() {
            called = true;
        }
    });

    assert.equal(result.success, false);
    assert.equal(called, false);
});

test("unlockLocation does not mutate trainer state without visitLocation", () => {
    const service = createService({
        locations: {
            AREA_A: { id: "AREA_A" }
        }
    });

    const state = {
        visitedLocations: []
    };

    const result = service.unlockLocation("AREA_A", state);

    assert.equal(result.success, true);
    assert.deepEqual(state.visitedLocations, []);
});

test("unlockLocation succeeds when no trainer state is supplied", () => {
    const service = createService({
        locations: {
            AREA_A: { id: "AREA_A" }
        }
    });

    assert.deepEqual(
        service.unlockLocation("AREA_A"),
        {
            success: true,
            location: "AREA_A"
        }
    );
});

test("unlockLocation returns the location ID supplied by the caller", () => {
    const service = createService({
        locations: {
            AREA_A: { id: "AREA_A" }
        }
    });

    const result = service.unlockLocation("AREA_A", {});

    assert.equal(result.location, "AREA_A");
});

// --------------------------------------------------
// getSoftGates
// --------------------------------------------------

test("getSoftGates returns configured soft gates", () => {
    const service = createService();

    assert.deepEqual(
        service.getSoftGates("PALLET_TOWN"),
        [{
            type: "SURF",
            reason: "Surf is recommended"
        }]
    );
});

test("getSoftGates returns an empty array for an unknown location", () => {
    const service = createService();

    assert.deepEqual(
        service.getSoftGates("UNKNOWN"),
        []
    );
});

test("getSoftGates returns an empty array when no gates are configured", () => {
    const service = createService();

    assert.deepEqual(
        service.getSoftGates("VIRIDIAN_CITY"),
        []
    );
});

test("getSoftGates returns an empty array when soft gates are not an array", () => {
    const service = createService({
        locations: {
            AREA_A: {
                id: "AREA_A",
                gates: {
                    soft: { type: "SURF" }
                }
            }
        }
    });

    assert.deepEqual(
        service.getSoftGates("AREA_A"),
        []
    );
});

test("getSoftGates returns the original soft-gate array", () => {
    const soft = [
        { type: "SURF" },
        { type: "STRENGTH" }
    ];

    const service = createService({
        locations: {
            AREA_A: {
                id: "AREA_A",
                gates: { soft }
            }
        }
    });

    assert.strictEqual(service.getSoftGates("AREA_A"), soft);
});

test("getSoftGates preserves the configured soft-gate order", () => {
    const soft = [
        { type: "CUT" },
        { type: "SURF" },
        { type: "FLY" }
    ];

    const service = createService({
        locations: {
            AREA_A: {
                id: "AREA_A",
                gates: { soft }
            }
        }
    });

    assert.deepEqual(
        service.getSoftGates("AREA_A"),
        soft
    );
});

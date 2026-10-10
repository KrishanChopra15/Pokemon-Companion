"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ProgressionService =
    require("../scripts/services/progression-service");

let fixtureCounter = 0;

function createService(progression = {}, unlockService = null) {
    const game =
        `__progression_service_unit_${process.pid}_${++fixtureCounter}`;

    const service = new ProgressionService(game, unlockService);
    service.progression = progression;

    return service;
}

function createDiskFixture(t, options = {}) {
    const game =
        `__progression_service_test_${process.pid}_${++fixtureCounter}`;

    const directory = path.join(
        process.cwd(),
        "database",
        "generated",
        game
    );

    fs.mkdirSync(directory, { recursive: true });

    if (options.writeFile !== false) {
        const progression =
            Object.prototype.hasOwnProperty.call(options, "progression")
                ? options.progression
                : {};

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

    return {
        game,
        directory,
        createService(unlockService = null) {
            return new ProgressionService(game, unlockService);
        }
    };
}

// --------------------------------------------------
// Constructor and database loading
// --------------------------------------------------

test("constructor creates a ProgressionService instance", () => {
    const service = createService();

    assert.ok(service instanceof ProgressionService);
});

test("constructor stores the selected game", () => {
    const service = new ProgressionService(
        "__progression_game_test__"
    );

    assert.equal(service.game, "__progression_game_test__");
});

test("constructor defaults the game name to firered", () => {
    // The constructor may load the local FireRed database.
    const service = new ProgressionService();

    assert.equal(service.game, "firered");
});

test("constructor defaults the unlock service to null", () => {
    const service = createService();

    assert.equal(service.progressionUnlock, null);
});

test("constructor stores the supplied unlock service", () => {
    const unlockService = {
        apply() {
            return { success: true };
        }
    };

    const service = createService({}, unlockService);

    assert.strictEqual(service.progressionUnlock, unlockService);
});

test("constructor initializes an empty progression database when the file is missing", () => {
    const service = createService();

    assert.deepEqual(service.progression, {});
});

test("constructor loads progression records from JSON", t => {
    const progression = {
        RULE_1: {
            id: "RULE_1",
            location: "PALLET_TOWN",
            type: "STORY"
        }
    };

    const fixture = createDiskFixture(t, { progression });
    const service = fixture.createService();

    assert.deepEqual(service.progression, progression);
});

test("constructor preserves nested progression data", t => {
    const progression = {
        RULE_1: {
            id: "RULE_1",
            requirement: {
                badges: ["BOULDER_BADGE"],
                conditions: {
                    caughtPokemon: 10
                }
            },
            unlocks: [
                { type: "LOCATION", id: "ROUTE_1" }
            ]
        }
    };

    const fixture = createDiskFixture(t, { progression });
    const service = fixture.createService();

    assert.deepEqual(service.progression, progression);
});

test("constructor uses the requested game database", t => {
    const fixtureA = createDiskFixture(t, {
        progression: {
            RULE_A: { id: "RULE_A" }
        }
    });

    const fixtureB = createDiskFixture(t, {
        progression: {
            RULE_B: { id: "RULE_B" }
        }
    });

    assert.deepEqual(
        fixtureA.createService().progression,
        { RULE_A: { id: "RULE_A" } }
    );

    assert.deepEqual(
        fixtureB.createService().progression,
        { RULE_B: { id: "RULE_B" } }
    );
});

test("loadProgression returns an empty object when the file is missing", () => {
    const service = createService();

    assert.deepEqual(service.loadProgression(), {});
});

test("loadProgression reads updated file contents", t => {
    const fixture = createDiskFixture(t, {
        progression: {
            RULE_1: { id: "RULE_1" }
        }
    });

    const service = fixture.createService();

    fs.writeFileSync(
        path.join(fixture.directory, "progression.json"),
        JSON.stringify({
            RULE_2: { id: "RULE_2" }
        }),
        "utf8"
    );

    assert.deepEqual(
        service.loadProgression(),
        { RULE_2: { id: "RULE_2" } }
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

test("loadProgression throws for malformed JSON in an existing file", t => {
    const fixture = createDiskFixture(t);

    fs.writeFileSync(
        path.join(fixture.directory, "progression.json"),
        "not json",
        "utf8"
    );

    const service = createService();

    service.game = fixture.game;

    assert.throws(
        () => service.loadProgression(),
        SyntaxError
    );
});

// --------------------------------------------------
// getProgression
// --------------------------------------------------

test("getProgression returns a progression record by ID", () => {
    const record = {
        id: "RULE_1",
        type: "STORY"
    };

    const service = createService({
        RULE_1: record
    });

    assert.deepEqual(
        service.getProgression("RULE_1"),
        record
    );
});

test("getProgression returns the original record object", () => {
    const record = {
        id: "RULE_1",
        location: "PALLET_TOWN"
    };

    const service = createService({
        RULE_1: record
    });

    assert.strictEqual(
        service.getProgression("RULE_1"),
        record
    );
});

test("getProgression returns null for an unknown ID", () => {
    const service = createService({});

    assert.equal(
        service.getProgression("UNKNOWN"),
        null
    );
});

test("getProgression returns null for an empty ID", () => {
    const service = createService({});

    assert.equal(service.getProgression(""), null);
});

test("getProgression returns null for a null ID", () => {
    const service = createService({});

    assert.equal(service.getProgression(null), null);
});

test("getProgression returns null for an undefined ID", () => {
    const service = createService({});

    assert.equal(service.getProgression(undefined), null);
});

test("getProgression returns null for a null stored record", () => {
    const service = createService({
        RULE_1: null
    });

    assert.equal(service.getProgression("RULE_1"), null);
});

test("getProgression returns null for a false stored record", () => {
    const service = createService({
        RULE_1: false
    });

    assert.equal(service.getProgression("RULE_1"), null);
});

test("getProgression uses exact key matching", () => {
    const service = createService({
        RULE_1: { id: "RULE_1" }
    });

    assert.equal(
        service.getProgression("rule_1"),
        null
    );
});

// --------------------------------------------------
// getAllProgression
// --------------------------------------------------

test("getAllProgression returns the progression database", () => {
    const progression = {
        RULE_1: { id: "RULE_1" },
        RULE_2: { id: "RULE_2" }
    };

    const service = createService(progression);

    assert.deepEqual(
        service.getAllProgression(),
        progression
    );
});

test("getAllProgression returns the original database object", () => {
    const progression = {
        RULE_1: { id: "RULE_1" }
    };

    const service = createService(progression);

    assert.strictEqual(
        service.getAllProgression(),
        progression
    );
});

test("getAllProgression returns the same reference on repeated calls", () => {
    const service = createService({
        RULE_1: { id: "RULE_1" }
    });

    assert.strictEqual(
        service.getAllProgression(),
        service.getAllProgression()
    );
});

test("getAllProgression returns an empty object for an empty database", () => {
    const service = createService({});

    assert.deepEqual(service.getAllProgression(), {});
});

// --------------------------------------------------
// getLocationProgression
// --------------------------------------------------

test("getLocationProgression returns IDs matching a location", () => {
    const service = createService({
        RULE_A: { id: "RULE_A", location: "PALLET_TOWN" },
        RULE_B: { id: "RULE_B", location: "ROUTE_1" },
        RULE_C: { id: "RULE_C", location: "PALLET_TOWN" }
    });

    assert.deepEqual(
        service.getLocationProgression("PALLET_TOWN"),
        ["RULE_A", "RULE_C"]
    );
});

test("getLocationProgression returns an empty array when no records match", () => {
    const service = createService({
        RULE_A: { id: "RULE_A", location: "PALLET_TOWN" }
    });

    assert.deepEqual(
        service.getLocationProgression("ROUTE_1"),
        []
    );
});

test("getLocationProgression returns an empty array for an empty database", () => {
    const service = createService({});

    assert.deepEqual(
        service.getLocationProgression("PALLET_TOWN"),
        []
    );
});

test("getLocationProgression preserves progression key order", () => {
    const service = createService({
        THIRD: { location: "AREA_A" },
        FIRST: { location: "AREA_A" },
        SECOND: { location: "AREA_A" }
    });

    assert.deepEqual(
        service.getLocationProgression("AREA_A"),
        ["THIRD", "FIRST", "SECOND"]
    );
});

test("getLocationProgression compares location values exactly", () => {
    const service = createService({
        RULE_1: { location: "PALLET_TOWN" }
    });

    assert.deepEqual(
        service.getLocationProgression("pallet_town"),
        []
    );
});

test("getLocationProgression returns IDs rather than progression records", () => {
    const service = createService({
        RULE_1: {
            id: "INTERNAL_ID",
            location: "PALLET_TOWN"
        }
    });

    assert.deepEqual(
        service.getLocationProgression("PALLET_TOWN"),
        ["RULE_1"]
    );
});

test("getLocationProgression throws when a record is null", () => {
    const service = createService({
        RULE_1: null
    });

    assert.throws(
        () => service.getLocationProgression("PALLET_TOWN"),
        TypeError
    );
});

// --------------------------------------------------
// canUnlock
// --------------------------------------------------

test("canUnlock rejects an unknown progression ID", () => {
    const service = createService({});

    assert.deepEqual(
        service.canUnlock("UNKNOWN", {}),
        {
            allowed: false,
            reason: "Unknown progression"
        }
    );
});

test("canUnlock allows a progression without requirements", () => {
    const service = createService({
        RULE_1: {
            id: "RULE_1"
        }
    });

    assert.deepEqual(
        service.canUnlock("RULE_1", {}),
        { allowed: true }
    );
});

test("canUnlock checks a single badge requirement", () => {
    const service = createService({
        RULE_1: {
            id: "RULE_1",
            requirement: {
                badge: "BOULDER_BADGE"
            }
        }
    });

    assert.deepEqual(
        service.canUnlock("RULE_1", {}),
        {
            allowed: false,
            reason: "Requires BOULDER_BADGE"
        }
    );
});

test("canUnlock allows a satisfied badge requirement", () => {
    const service = createService({
        RULE_1: {
            id: "RULE_1",
            requirement: {
                badge: "BOULDER_BADGE"
            }
        }
    });

    assert.deepEqual(
        service.canUnlock("RULE_1", {
            badges: ["BOULDER_BADGE"]
        }),
        { allowed: true }
    );
});

test("canUnlock passes context to requirement evaluation", () => {
    const tracker = {
        getCaughtSpeciesCount() {
            return 5;
        }
    };

    const context = { pokemonTracker: tracker };

    const service = createService({
        RULE_1: {
            id: "RULE_1",
            requirement: {
                conditions: {
                    caughtPokemon: 5
                }
            }
        }
    });

    assert.deepEqual(
        service.canUnlock("RULE_1", {}, context),
        { allowed: true }
    );
});

test("canUnlock uses an empty context by default", () => {
    const service = createService({
        RULE_1: {
            id: "RULE_1",
            requirement: {
                conditions: {
                    caughtPokemon: 1
                }
            }
        }
    });

    assert.deepEqual(
        service.canUnlock("RULE_1", {}),
        {
            allowed: false,
            reason: "Pokémon tracker unavailable"
        }
    );
});

// --------------------------------------------------
// complete
// --------------------------------------------------

test("complete rejects an unknown progression", () => {
    const service = createService({});

    assert.deepEqual(
        service.complete("UNKNOWN", {}),
        {
            success: false,
            allowed: false,
            reason: "Unknown progression"
        }
    );
});

test("complete rejects a progression with unmet requirements", () => {
    const service = createService({
        RULE_1: {
            id: "RULE_1",
            requirement: {
                badge: "BOULDER_BADGE"
            }
        }
    });

    assert.deepEqual(
        service.complete("RULE_1", {}),
        {
            success: false,
            allowed: false,
            reason: "Requires BOULDER_BADGE",
            progression: "RULE_1"
        }
    );
});

test("complete does not apply unlocks when requirements fail", () => {
    let applyCalled = false;

    const unlockService = {
        apply() {
            applyCalled = true;
            return { success: true };
        }
    };

    const service = createService({
        RULE_1: {
            id: "RULE_1",
            requirement: {
                badge: "BOULDER_BADGE"
            }
        }
    }, unlockService);

    service.complete("RULE_1", {});

    assert.equal(applyCalled, false);
});

test("complete reports unavailable unlock service when no service is supplied", () => {
    const service = createService({
        RULE_1: {
            id: "RULE_1",
            requirement: {},
            unlocks: ["UNLOCK_A"]
        }
    });

    assert.deepEqual(
        service.complete("RULE_1", {}),
        {
            success: false,
            allowed: true,
            reason: "Progression unlock service unavailable",
            progression: "RULE_1",
            unlocks: ["UNLOCK_A"]
        }
    );
});

test("complete returns an empty unlock list when unlocks are absent", () => {
    const service = createService({
        RULE_1: { id: "RULE_1" }
    });

    const result = service.complete("RULE_1", {});

    assert.deepEqual(result.unlocks, []);
});

test("complete applies progression unlocks when requirements pass", () => {
    const progression = {
        id: "RULE_1",
        requirement: {},
        unlocks: ["ROUTE_1"]
    };

    let receivedProgression;
    let receivedState;

    const state = { marker: true };

    const unlockService = {
        apply(record, trainerState) {
            receivedProgression = record;
            receivedState = trainerState;

            return {
                success: true,
                applied: ["ROUTE_1"],
                skipped: []
            };
        }
    };

    const service = createService({
        RULE_1: progression
    }, unlockService);

    const result = service.complete("RULE_1", state);

    assert.strictEqual(receivedProgression, progression);
    assert.strictEqual(receivedState, state);

    assert.deepEqual(result, {
        success: true,
        allowed: true,
        progression: "RULE_1",
        unlocks: ["ROUTE_1"],
        applied: ["ROUTE_1"],
        skipped: [],
        reason: null
    });
});

test("complete uses the progression record ID in its result", () => {
    const service = createService({
        RULE_KEY: {
            id: "RECORD_ID",
            requirement: {}
        }
    }, {
        apply() {
            return { success: true };
        }
    });

    assert.equal(
        service.complete("RULE_KEY", {}).progression,
        "RECORD_ID"
    );
});

test("complete returns applied and skipped results from the unlock service", () => {
    const service = createService({
        RULE_1: {
            id: "RULE_1",
            requirement: {},
            unlocks: ["A", "B", "C"]
        }
    }, {
        apply() {
            return {
                success: true,
                applied: ["A"],
                skipped: ["B", "C"],
                reason: "Some unlocks were already present"
            };
        }
    });

    assert.deepEqual(
        service.complete("RULE_1", {}),
        {
            success: true,
            allowed: true,
            progression: "RULE_1",
            unlocks: ["A", "B", "C"],
            applied: ["A"],
            skipped: ["B", "C"],
            reason: "Some unlocks were already present"
        }
    );
});

test("complete defaults missing applied and skipped results to empty arrays", () => {
    const service = createService({
        RULE_1: {
            id: "RULE_1",
            requirement: {}
        }
    }, {
        apply() {
            return { success: true };
        }
    });

    const result = service.complete("RULE_1", {});

    assert.deepEqual(result.applied, []);
    assert.deepEqual(result.skipped, []);
});

test("complete converts a falsey unlock service reason to null", () => {
    const service = createService({
        RULE_1: {
            id: "RULE_1",
            requirement: {}
        }
    }, {
        apply() {
            return {
                success: true,
                reason: ""
            };
        }
    });

    assert.equal(
        service.complete("RULE_1", {}).reason,
        null
    );
});

test("complete preserves a failed result returned by the unlock service", () => {
    const service = createService({
        RULE_1: {
            id: "RULE_1",
            requirement: {},
            unlocks: ["ROUTE_1"]
        }
    }, {
        apply() {
            return {
                success: false,
                applied: [],
                skipped: ["ROUTE_1"],
                reason: "Unlock failed"
            };
        }
    });

    assert.deepEqual(
        service.complete("RULE_1", {}),
        {
            success: false,
            allowed: true,
            progression: "RULE_1",
            unlocks: ["ROUTE_1"],
            applied: [],
            skipped: ["ROUTE_1"],
            reason: "Unlock failed"
        }
    );
});

test("complete propagates errors from the unlock service", () => {
    const expectedError = new Error("Apply failed");

    const service = createService({
        RULE_1: {
            id: "RULE_1",
            requirement: {}
        }
    }, {
        apply() {
            throw expectedError;
        }
    });

    assert.throws(
        () => service.complete("RULE_1", {}),
        error => error === expectedError
    );
});

// --------------------------------------------------
// checkRequirement
// --------------------------------------------------

test("checkRequirement allows a missing requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(null, {}),
        { allowed: true }
    );
});

test("checkRequirement allows undefined requirements", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(undefined, {}),
        { allowed: true }
    );
});

test("checkRequirement checks multiple badges", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { badges: ["BOULDER_BADGE", "CASCADE_BADGE"] },
            { badges: ["BOULDER_BADGE"] }
        ),
        {
            allowed: false,
            reason: "Missing required badges"
        }
    );
});

test("checkRequirement checks a single badge", () => {
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

test("checkRequirement checks multiple HMs", () => {
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

test("checkRequirement checks a single HM", () => {
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

test("checkRequirement checks multiple key items", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { keyItems: ["BICYCLE", "POKE_FLUTE"] },
            { keyItems: ["BICYCLE"] }
        ),
        {
            allowed: false,
            reason: "Requires key item POKE_FLUTE"
        }
    );
});

test("checkRequirement checks a single key item", () => {
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

test("checkRequirement checks multiple story flags", () => {
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

test("checkRequirement checks a single story flag", () => {
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

test("checkRequirement checks abilities", () => {
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

test("checkRequirement allows all satisfied requirements", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                badges: ["BOULDER_BADGE"],
                badge: "CASCADE_BADGE",
                hms: ["CUT"],
                hm: "SURF",
                keyItems: ["BICYCLE"],
                keyItem: "POKE_FLUTE",
                storyFlags: ["BRIDGE_REPAIRED"],
                storyFlag: "ROCKETS_DEFEATED",
                abilities: ["CAN_USE_FLY"]
            },
            {
                badges: ["BOULDER_BADGE", "CASCADE_BADGE"],
                hms: ["CUT", "SURF"],
                keyItems: ["BICYCLE", "POKE_FLUTE"],
                storyFlags: ["BRIDGE_REPAIRED", "ROCKETS_DEFEATED"],
                abilities: ["CAN_USE_FLY"]
            }
        ),
        { allowed: true }
    );
});

test("checkRequirement reports badge failures before HM failures", () => {
    const service = createService();

    assert.equal(
        service.checkRequirement(
            {
                badge: "BOULDER_BADGE",
                hm: "SURF"
            },
            {}
        ).reason,
        "Requires BOULDER_BADGE"
    );
});

test("checkRequirement reports HM failures before key item failures", () => {
    const service = createService();

    assert.equal(
        service.checkRequirement(
            {
                hm: "SURF",
                keyItem: "BICYCLE"
            },
            {}
        ).reason,
        "Requires HM SURF"
    );
});

test("checkRequirement reports key item failures before story flag failures", () => {
    const service = createService();

    assert.equal(
        service.checkRequirement(
            {
                keyItem: "BICYCLE",
                storyFlag: "BRIDGE_REPAIRED"
            },
            {}
        ).reason,
        "Requires BICYCLE"
    );
});

test("checkRequirement reports story flag failures before ability failures", () => {
    const service = createService();

    assert.equal(
        service.checkRequirement(
            {
                storyFlag: "BRIDGE_REPAIRED",
                abilities: ["CAN_USE_SURF"]
            },
            {}
        ).reason,
        "Requires BRIDGE_REPAIRED"
    );
});

// --------------------------------------------------
// Caught Pokémon condition
// --------------------------------------------------

test("checkRequirement allows a condition requiring zero caught Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                conditions: {
                    caughtPokemon: 0
                }
            },
            {},
            {
                pokemonTracker: {
                    getCaughtSpeciesCount() {
                        return 0;
                    }
                }
            }
        ),
        { allowed: true }
    );
});

test("checkRequirement rejects an unmet caught Pokémon count", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                conditions: {
                    caughtPokemon: 10
                }
            },
            {},
            {
                pokemonTracker: {
                    getCaughtSpeciesCount() {
                        return 7;
                    }
                }
            }
        ),
        {
            allowed: false,
            reason: "Requires at least 10 different caught Pokémon"
        }
    );
});

test("checkRequirement allows a caught Pokémon count equal to the requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                conditions: {
                    caughtPokemon: 10
                }
            },
            {},
            {
                pokemonTracker: {
                    getCaughtSpeciesCount() {
                        return 10;
                    }
                }
            }
        ),
        { allowed: true }
    );
});

test("checkRequirement allows a caught Pokémon count above the requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                conditions: {
                    caughtPokemon: 5
                }
            },
            {},
            {
                pokemonTracker: {
                    getCaughtSpeciesCount() {
                        return 20;
                    }
                }
            }
        ),
        { allowed: true }
    );
});

test("checkRequirement converts a numeric string caught Pokémon requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                conditions: {
                    caughtPokemon: "5"
                }
            },
            {},
            {
                pokemonTracker: {
                    getCaughtSpeciesCount() {
                        return 5;
                    }
                }
            }
        ),
        { allowed: true }
    );
});

test("checkRequirement rejects a negative caught Pokémon requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                conditions: {
                    caughtPokemon: -1
                }
            },
            {},
            {
                pokemonTracker: {
                    getCaughtSpeciesCount() {
                        return 10;
                    }
                }
            }
        ),
        {
            allowed: false,
            reason: "Invalid caught Pokémon requirement"
        }
    );
});

test("checkRequirement rejects a non-numeric caught Pokémon requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                conditions: {
                    caughtPokemon: "many"
                }
            },
            {},
            {
                pokemonTracker: {
                    getCaughtSpeciesCount() {
                        return 10;
                    }
                }
            }
        ),
        {
            allowed: false,
            reason: "Invalid caught Pokémon requirement"
        }
    );
});

test("checkRequirement rejects an infinite caught Pokémon requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                conditions: {
                    caughtPokemon: Infinity
                }
            },
            {},
            {
                pokemonTracker: {
                    getCaughtSpeciesCount() {
                        return 10;
                    }
                }
            }
        ),
        {
            allowed: false,
            reason: "Invalid caught Pokémon requirement"
        }
    );
});

test("checkRequirement rejects a NaN caught Pokémon requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                conditions: {
                    caughtPokemon: NaN
                }
            },
            {},
            {
                pokemonTracker: {
                    getCaughtSpeciesCount() {
                        return 10;
                    }
                }
            }
        ),
        {
            allowed: false,
            reason: "Invalid caught Pokémon requirement"
        }
    );
});

test("checkRequirement reports when the Pokémon tracker is missing", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                conditions: {
                    caughtPokemon: 5
                }
            },
            {},
            {}
        ),
        {
            allowed: false,
            reason: "Pokémon tracker unavailable"
        }
    );
});

test("checkRequirement reports when the tracker method is missing", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                conditions: {
                    caughtPokemon: 5
                }
            },
            {},
            {
                pokemonTracker: {}
            }
        ),
        {
            allowed: false,
            reason: "Pokémon tracker unavailable"
        }
    );
});

test("checkRequirement calls getCaughtSpeciesCount without arguments", () => {
    const service = createService();
    let argumentCount = -1;

    service.checkRequirement(
        {
            conditions: {
                caughtPokemon: 1
            }
        },
        {},
        {
            pokemonTracker: {
                getCaughtSpeciesCount(...args) {
                    argumentCount = args.length;
                    return 1;
                }
            }
        }
    );

    assert.equal(argumentCount, 0);
});

test("checkRequirement ignores caught Pokémon tracker when the condition is absent", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            { conditions: {} },
            {},
            {}
        ),
        { allowed: true }
    );
});

test("checkRequirement allows unrelated condition fields", () => {
    const service = createService();

    assert.deepEqual(
        service.checkRequirement(
            {
                conditions: {
                    unknownCondition: true
                }
            },
            {},
            {}
        ),
        { allowed: true }
    );
});

test("checkRequirement propagates errors from the Pokémon tracker", () => {
    const expectedError = new Error("Tracker failed");
    const service = createService();

    assert.throws(
        () => service.checkRequirement(
            {
                conditions: {
                    caughtPokemon: 1
                }
            },
            {},
            {
                pokemonTracker: {
                    getCaughtSpeciesCount() {
                        throw expectedError;
                    }
                }
            }
        ),
        error => error === expectedError
    );
});

// --------------------------------------------------
// Badge helpers
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

test("hasBadge returns false when the badge is absent", () => {
    const service = createService();

    assert.equal(
        service.hasBadge("BOULDER_BADGE", { badges: [] }),
        false
    );
});

test("hasBadge calls a custom hasBadge method", () => {
    const service = createService();
    let receivedBadge;

    const state = {
        hasBadge(badge) {
            receivedBadge = badge;
            return true;
        }
    };

    assert.equal(
        service.hasBadge("CASCADE_BADGE", state),
        true
    );

    assert.equal(receivedBadge, "CASCADE_BADGE");
});

test("hasBadge returns false when the custom method returns false", () => {
    const service = createService();
    const trainerState = {
        hasBadge: () => false,
        badges: ["BOULDER_BADGE"]
    };

    assert.equal(service.hasBadge("BOULDER_BADGE", trainerState), false);
});

test("hasBadges requires every badge", () => {
    const service = createService();

    assert.equal(
        service.hasBadges(
            ["BOULDER_BADGE", "CASCADE_BADGE"],
            { badges: ["BOULDER_BADGE"] }
        ),
        false
    );
});

test("hasBadges succeeds when every badge is owned", () => {
    const service = createService();

    assert.equal(
        service.hasBadges(
            ["BOULDER_BADGE", "CASCADE_BADGE"],
            { badges: ["BOULDER_BADGE", "CASCADE_BADGE"] }
        ),
        true
    );
});

test("hasBadges succeeds for an empty badge list", () => {
    const service = createService();

    assert.equal(service.hasBadges([], {}), true);
});

// --------------------------------------------------
// HM helpers
// --------------------------------------------------

test("hasHM checks the hms array", () => {
    const service = createService();

    assert.equal(
        service.hasHM("SURF", { hms: ["SURF"] }),
        true
    );
});

test("hasHM checks the hmAbilities array", () => {
    const service = createService();

    assert.equal(
        service.hasHM("SURF", { hmAbilities: ["SURF"] }),
        true
    );
});

test("hasHM calls a custom hasHM method", () => {
    const service = createService();
    let receivedHM;

    const state = {
        hasHM(hm) {
            receivedHM = hm;
            return true;
        }
    };

    assert.equal(service.hasHM("CUT", state), true);
    assert.equal(receivedHM, "CUT");
});

test("hasHM falls back to hms when the custom method returns false", () => {
    const service = createService();

    assert.equal(
        service.hasHM("CUT", {
            hasHM() {
                return false;
            },
            hms: ["CUT"]
        }),
        true
    );
});

test("hasHM uses exact matching in its arrays", () => {
    const service = createService();

    assert.equal(
        service.hasHM("SURF", {
            hms: ["surf"],
            hmAbilities: []
        }),
        false
    );
});

test("hasHM returns false when the HM is missing", () => {
    const service = createService();

    assert.equal(
        service.hasHM("FLY", {
            hms: [],
            hmAbilities: []
        }),
        false
    );
});

// --------------------------------------------------
// Ability helpers
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

test("hasAbility checks hmAbilities case-insensitively", () => {
    const service = createService();

    assert.equal(
        service.hasAbility("CAN_USE_SURF", {
            hmAbilities: ["can_use_surf"]
        }),
        true
    );
});

test("hasAbility passes the normalized ability to the custom method", () => {
    const service = createService();
    let receivedAbility;

    const state = {
        hasAbility(ability) {
            receivedAbility = ability;
            return true;
        }
    };

    assert.equal(
        service.hasAbility("can_use_cut", state),
        true
    );

    assert.equal(receivedAbility, "CAN_USE_CUT");
});

test("hasAbility falls back to the abilities array if the method returns false", () => {
    const service = createService();

    assert.equal(
        service.hasAbility("CAN_USE_CUT", {
            hasAbility() {
                return false;
            },
            abilities: ["can_use_cut"]
        }),
        true
    );
});

test("hasAbility maps CAN_USE_POKE_FLUTE to the GOT_POKE_FLUTE story flag", () => {
    const service = createService();
    let receivedFlag;

    const state = {
        hasStoryFlag(flag) {
            receivedFlag = flag;
            return true;
        }
    };

    assert.equal(
        service.hasAbility("CAN_USE_POKE_FLUTE", state),
        true
    );

    assert.equal(receivedFlag, "GOT_POKE_FLUTE");
});

test("hasAbility returns false for a missing ability", () => {
    const service = createService();

    assert.equal(
        service.hasAbility("CAN_USE_SURF", {
            abilities: [],
            hmAbilities: []
        }),
        false
    );
});

test("hasAbility does not map ordinary HM names to the hms array", () => {
    const service = createService();

    assert.equal(
        service.hasAbility("SURF", { hms: ["SURF"] }),
        false
    );
});

// --------------------------------------------------
// Key item helpers
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

test("hasKeyItem returns false when the item is absent", () => {
    const service = createService();

    assert.equal(
        service.hasKeyItem("BICYCLE", {
            keyItems: []
        }),
        false
    );
});

test("hasKeyItem calls the custom hasKeyItem method", () => {
    const service = createService();
    let receivedItem;

    const state = {
        hasKeyItem(item) {
            receivedItem = item;
            return true;
        }
    };

    assert.equal(service.hasKeyItem("BICYCLE", state), true);
    assert.equal(receivedItem, "BICYCLE");
});

test("hasKeyItem returns the custom method result directly", () => {
    const service = createService();

    assert.equal(
        service.hasKeyItem("BICYCLE", {
            hasKeyItem() {
                return false;
            },
            keyItems: ["BICYCLE"]
        }),
        false
    );
});

// --------------------------------------------------
// Story flag helpers
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

test("hasStoryFlag returns false when a flag is absent", () => {
    const service = createService();

    assert.equal(
        service.hasStoryFlag("BRIDGE_REPAIRED", {
            storyFlags: []
        }),
        false
    );
});

test("hasStoryFlag calls the custom hasStoryFlag method", () => {
    const service = createService();
    let receivedFlag;

    const state = {
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

test("hasStoryFlag returns the custom method result directly", () => {
    const service = createService();

    assert.equal(
        service.hasStoryFlag("BRIDGE_REPAIRED", {
            hasStoryFlag() {
                return false;
            },
            storyFlags: ["BRIDGE_REPAIRED"]
        }),
        false
    );
});

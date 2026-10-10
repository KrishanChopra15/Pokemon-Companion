"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const ProgressionUnlockService = require("../scripts/services/progression-unlock-service");

function createService() {
    return new ProgressionUnlockService();
}

function createTrainerState(overrides = {}) {
    const calls = {
        hmAbilities: [],
        badges: [],
        storyFlags: [],
        abilities: []
    };

    const trainerState = {
        addHMAbility(value) {
            calls.hmAbilities.push(value);
        },
        addBadge(value) {
            calls.badges.push(value);
        },
        addStoryFlag(value) {
            calls.storyFlags.push(value);
        },
        addAbility(value) {
            calls.abilities.push(value);
        },
        ...overrides
    };

    return { trainerState, calls };
}

// --------------------------------------------------
// Construction
// --------------------------------------------------

test("constructor creates a ProgressionUnlockService instance", () => {
    assert.ok(createService() instanceof ProgressionUnlockService);
});

test("constructor creates independent service instances", () => {
    assert.notStrictEqual(createService(), createService());
});

// --------------------------------------------------
// apply: argument validation
// --------------------------------------------------

test("apply rejects a missing progression", () => {
    assert.deepEqual(createService().apply(null, {}), {
        success: false,
        applied: [],
        skipped: [],
        reason: "Missing progression"
    });
});

test("apply rejects an undefined progression", () => {
    assert.equal(createService().apply(undefined, {}).reason, "Missing progression");
});

test("apply rejects a false progression", () => {
    assert.equal(createService().apply(false, {}).reason, "Missing progression");
});

test("apply checks the progression before the trainer state", () => {
    assert.equal(createService().apply(null, null).reason, "Missing progression");
});

test("apply rejects a missing trainer state", () => {
    assert.deepEqual(createService().apply({ id: "P1" }, null), {
        success: false,
        applied: [],
        skipped: [],
        reason: "Missing trainer state"
    });
});

test("apply rejects an undefined trainer state", () => {
    assert.equal(
        createService().apply({ id: "P1" }, undefined).reason,
        "Missing trainer state"
    );
});

test("apply rejects a false trainer state", () => {
    assert.equal(
        createService().apply({ id: "P1" }, false).reason,
        "Missing trainer state"
    );
});

// --------------------------------------------------
// apply: progression unlock lists
// --------------------------------------------------

test("apply succeeds when unlocks is an empty array", () => {
    const { trainerState } = createTrainerState();

    assert.deepEqual(createService().apply({ id: "P1", unlocks: [] }, trainerState), {
        success: true,
        progression: "P1",
        applied: [],
        skipped: []
    });
});

test("apply uses an empty list when unlocks is missing", () => {
    const { trainerState } = createTrainerState();

    assert.deepEqual(createService().apply({ id: "P1" }, trainerState), {
        success: true,
        progression: "P1",
        applied: [],
        skipped: []
    });
});

test("apply uses an empty list when unlocks is undefined", () => {
    const { trainerState } = createTrainerState();

    assert.deepEqual(
        createService().apply({ id: "P1", unlocks: undefined }, trainerState).applied,
        []
    );
});

test("apply uses an empty list when unlocks is null", () => {
    const { trainerState } = createTrainerState();

    assert.deepEqual(
        createService().apply({ id: "P1", unlocks: null }, trainerState).applied,
        []
    );
});

test("apply uses an empty list when unlocks is not an array", () => {
    const { trainerState } = createTrainerState();

    for (const unlocks of ["BOULDER_BADGE", {}, 10, true]) {
        const result = createService().apply({ id: "P1", unlocks }, trainerState);
        assert.deepEqual(result.applied, []);
        assert.deepEqual(result.skipped, []);
        assert.equal(result.success, true);
    }
});

test("apply returns null when the progression ID is missing", () => {
    const { trainerState } = createTrainerState();

    const result = createService().apply({ unlocks: [] }, trainerState);

    assert.equal(result.progression, null);
});

test("apply returns null when the progression ID is empty", () => {
    const { trainerState } = createTrainerState();

    assert.equal(
        createService().apply({ id: "", unlocks: [] }, trainerState).progression,
        null
    );
});

test("apply preserves a non-empty progression ID", () => {
    const { trainerState } = createTrainerState();

    assert.equal(
        createService().apply({ id: "GYM_1", unlocks: [] }, trainerState).progression,
        "GYM_1"
    );
});

// --------------------------------------------------
// applyUnlock: invalid unlocks
// --------------------------------------------------

test("applyUnlock rejects a missing unlock", () => {
    assert.deepEqual(createService().applyUnlock(undefined, {}, {}), {
        applied: false,
        reason: "Invalid unlock"
    });
});

test("applyUnlock rejects a null unlock", () => {
    assert.deepEqual(createService().applyUnlock(null, {}, {}), {
        applied: false,
        reason: "Invalid unlock"
    });
});

test("applyUnlock rejects an empty string", () => {
    assert.deepEqual(createService().applyUnlock("", {}, {}), {
        applied: false,
        reason: "Invalid unlock"
    });
});

test("applyUnlock rejects a numeric unlock", () => {
    assert.equal(
        createService().applyUnlock(123, {}, {}).reason,
        "Invalid unlock"
    );
});

test("applyUnlock rejects an object unlock", () => {
    assert.equal(
        createService().applyUnlock({}, {}, {}).reason,
        "Invalid unlock"
    );
});

test("applyUnlock rejects a boolean unlock", () => {
    assert.equal(
        createService().applyUnlock(true, {}, {}).reason,
        "Invalid unlock"
    );
});

// --------------------------------------------------
// applyUnlock: HM and field abilities
// --------------------------------------------------

test("applyUnlock grants an HM ability", () => {
    const { trainerState, calls } = createTrainerState();

    assert.deepEqual(
        createService().applyUnlock("CAN_USE_CUT", {}, trainerState),
        { applied: true }
    );
    assert.deepEqual(calls.hmAbilities, ["CAN_USE_CUT"]);
});

test("applyUnlock normalizes HM ability names to uppercase", () => {
    const { trainerState, calls } = createTrainerState();

    createService().applyUnlock("can_use_surf", {}, trainerState);

    assert.deepEqual(calls.hmAbilities, ["CAN_USE_SURF"]);
});

test("applyUnlock supports different HM ability names", () => {
    const { trainerState, calls } = createTrainerState();

    for (const ability of [
        "CAN_USE_CUT",
        "CAN_USE_FLASH",
        "CAN_USE_SURF",
        "CAN_USE_STRENGTH",
        "CAN_USE_FLY"
    ]) {
        assert.equal(
            createService().applyUnlock(ability, {}, trainerState).applied,
            true
        );
    }

    assert.deepEqual(calls.hmAbilities, [
        "CAN_USE_CUT",
        "CAN_USE_FLASH",
        "CAN_USE_SURF",
        "CAN_USE_STRENGTH",
        "CAN_USE_FLY"
    ]);
});

test("applyUnlock skips an HM ability when addHMAbility is unavailable", () => {
    const result = createService().applyUnlock(
        "CAN_USE_FLY",
        {},
        {}
    );

    assert.deepEqual(result, {
        applied: false,
        reason: "Trainer state cannot store HM abilities"
    });
});

test("applyUnlock skips an HM ability when addHMAbility is not a function", () => {
    const result = createService().applyUnlock(
        "CAN_USE_FLY",
        {},
        { addHMAbility: true }
    );

    assert.equal(result.applied, false);
    assert.equal(result.reason, "Trainer state cannot store HM abilities");
});

// --------------------------------------------------
// applyUnlock: badges
// --------------------------------------------------

test("applyUnlock grants a badge", () => {
    const { trainerState, calls } = createTrainerState();

    assert.deepEqual(
        createService().applyUnlock("BOULDER_BADGE", {}, trainerState),
        { applied: true }
    );
    assert.deepEqual(calls.badges, ["BOULDER_BADGE"]);
});

test("applyUnlock normalizes badge names to uppercase", () => {
    const { trainerState, calls } = createTrainerState();

    createService().applyUnlock("cascade_badge", {}, trainerState);

    assert.deepEqual(calls.badges, ["CASCADE_BADGE"]);
});

test("applyUnlock grants multiple badges in order", () => {
    const { trainerState, calls } = createTrainerState();
    const service = createService();

    for (const badge of [
        "BOULDER_BADGE",
        "CASCADE_BADGE",
        "THUNDER_BADGE"
    ]) {
        assert.equal(service.applyUnlock(badge, {}, trainerState).applied, true);
    }

    assert.deepEqual(calls.badges, [
        "BOULDER_BADGE",
        "CASCADE_BADGE",
        "THUNDER_BADGE"
    ]);
});

test("applyUnlock skips a badge when addBadge is unavailable", () => {
    assert.deepEqual(
        createService().applyUnlock("BOULDER_BADGE", {}, {}),
        {
            applied: false,
            reason: "Trainer state cannot store badges"
        }
    );
});

test("applyUnlock skips a badge when addBadge is not a function", () => {
    const result = createService().applyUnlock(
        "BOULDER_BADGE",
        {},
        { addBadge: true }
    );

    assert.equal(result.applied, false);
    assert.equal(result.reason, "Trainer state cannot store badges");
});

// --------------------------------------------------
// applyUnlock: story flags
// --------------------------------------------------

test("applyUnlock grants a story flag by removing the FLAG_ prefix", () => {
    const { trainerState, calls } = createTrainerState();

    assert.deepEqual(
        createService().applyUnlock("FLAG_SILPH_CO_COMPLETED", {}, trainerState),
        { applied: true }
    );
    assert.deepEqual(calls.storyFlags, ["SILPH_CO_COMPLETED"]);
});

test("applyUnlock normalizes lowercase story flags", () => {
    const { trainerState, calls } = createTrainerState();

    createService().applyUnlock("flag_pokedex_received", {}, trainerState);

    assert.deepEqual(calls.storyFlags, ["POKEDEX_RECEIVED"]);
});

test("applyUnlock grants multiple story flags in order", () => {
    const { trainerState, calls } = createTrainerState();
    const service = createService();

    service.applyUnlock("FLAG_ONE", {}, trainerState);
    service.applyUnlock("FLAG_TWO", {}, trainerState);

    assert.deepEqual(calls.storyFlags, ["ONE", "TWO"]);
});

test("applyUnlock passes an empty flag when the unlock is FLAG_", () => {
    const { trainerState, calls } = createTrainerState();

    createService().applyUnlock("FLAG_", {}, trainerState);

    assert.deepEqual(calls.storyFlags, [""]);
});

test("applyUnlock skips a story flag when addStoryFlag is unavailable", () => {
    assert.deepEqual(
        createService().applyUnlock("FLAG_POKEDEX_RECEIVED", {}, {}),
        {
            applied: false,
            reason: "Trainer state cannot store story flags"
        }
    );
});

test("applyUnlock skips a story flag when addStoryFlag is not a function", () => {
    const result = createService().applyUnlock(
        "FLAG_POKEDEX_RECEIVED",
        {},
        { addStoryFlag: true }
    );

    assert.equal(result.applied, false);
    assert.equal(result.reason, "Trainer state cannot store story flags");
});

// --------------------------------------------------
// applyUnlock: general abilities and unsupported types
// --------------------------------------------------

test("applyUnlock grants a general ability", () => {
    const { trainerState, calls } = createTrainerState();

    assert.deepEqual(
        createService().applyUnlock("CAN_TRADE", {}, trainerState),
        { applied: true }
    );
    assert.deepEqual(calls.abilities, ["CAN_TRADE"]);
});

test("applyUnlock normalizes general abilities to uppercase", () => {
    const { trainerState, calls } = createTrainerState();

    createService().applyUnlock("can_trade", {}, trainerState);

    assert.deepEqual(calls.abilities, ["CAN_TRADE"]);
});

test("applyUnlock grants an unclassified string as a general ability", () => {
    const { trainerState, calls } = createTrainerState();

    createService().applyUnlock("SPECIAL_ACCESS", {}, trainerState);

    assert.deepEqual(calls.abilities, ["SPECIAL_ACCESS"]);
});

test("applyUnlock skips a general ability when addAbility is unavailable", () => {
    assert.deepEqual(
        createService().applyUnlock("CAN_TRADE", {}, {}),
        {
            applied: false,
            reason: "Unsupported progression unlock"
        }
    );
});

test("applyUnlock skips a general ability when addAbility is not a function", () => {
    const result = createService().applyUnlock(
        "CAN_TRADE",
        {},
        { addAbility: true }
    );

    assert.equal(result.applied, false);
    assert.equal(result.reason, "Unsupported progression unlock");
});

test("applyUnlock prioritizes HM abilities over badge suffixes", () => {
    const { trainerState, calls } = createTrainerState();

    createService().applyUnlock("CAN_USE_FLY_BADGE", {}, trainerState);

    assert.deepEqual(calls.hmAbilities, ["CAN_USE_FLY_BADGE"]);
    assert.deepEqual(calls.badges, []);
});

test("applyUnlock prioritizes badge suffix over story flag prefix", () => {
    const { trainerState, calls } = createTrainerState();

    createService().applyUnlock(
        "FLAG_SPECIAL_BADGE",
        {},
        trainerState
    );

    assert.deepEqual(calls.badges, ["FLAG_SPECIAL_BADGE"]);
    assert.deepEqual(calls.storyFlags, []);
});

test("applyUnlock propagates errors from addHMAbility", () => {
    const service = createService();
    const trainerState = {
        addHMAbility() {
            throw new Error("HM failure");
        }
    };

    assert.throws(
        () => service.applyUnlock("CAN_USE_FLY", {}, trainerState),
        /HM failure/
    );
});

test("applyUnlock propagates errors from addBadge", () => {
    const service = createService();
    const trainerState = {
        addBadge() {
            throw new Error("Badge failure");
        }
    };

    assert.throws(
        () => service.applyUnlock("BOULDER_BADGE", {}, trainerState),
        /Badge failure/
    );
});

test("applyUnlock propagates errors from addStoryFlag", () => {
    const service = createService();
    const trainerState = {
        addStoryFlag() {
            throw new Error("Story flag failure");
        }
    };

    assert.throws(
        () => service.applyUnlock("FLAG_EVENT_DONE", {}, trainerState),
        /Story flag failure/
    );
});

test("applyUnlock propagates errors from addAbility", () => {
    const service = createService();
    const trainerState = {
        addAbility() {
            throw new Error("Ability failure");
        }
    };

    assert.throws(
        () => service.applyUnlock("CAN_TRADE", {}, trainerState),
        /Ability failure/
    );
});

// --------------------------------------------------
// apply: applied and skipped results
// --------------------------------------------------

test("apply separates successful and skipped unlocks", () => {
    const { trainerState } = createTrainerState({
        addBadge: undefined,
        addAbility: undefined
    });

    const progression = {
        id: "P1",
        unlocks: [
            "BOULDER_BADGE",
            "CAN_USE_CUT",
            "UNKNOWN_UNLOCK",
            null
        ]
    };

    const result = createService().apply(progression, trainerState);

    assert.equal(result.success, true);
    assert.deepEqual(result.applied, ["CAN_USE_CUT"]);
    assert.deepEqual(result.skipped, [
        {
            unlock: "BOULDER_BADGE",
            reason: "Trainer state cannot store badges"
        },
        {
            unlock: "UNKNOWN_UNLOCK",
            reason: "Unsupported progression unlock"
        },
        {
            unlock: null,
            reason: "Invalid unlock"
        }
    ]);
});

test("apply preserves successful unlock order", () => {
    const { trainerState } = createTrainerState();

    const unlocks = [
        "BOULDER_BADGE",
        "CAN_USE_FLY",
        "FLAG_EVENT_DONE",
        "CAN_TRADE"
    ];

    const result = createService().apply(
        { id: "P1", unlocks },
        trainerState
    );

    assert.deepEqual(result.applied, unlocks);
    assert.deepEqual(result.skipped, []);
});

test("apply preserves the original unlock values in applied results", () => {
    const { trainerState } = createTrainerState();
    const unlock = "boulder_badge";

    const result = createService().apply(
        { id: "P1", unlocks: [unlock] },
        trainerState
    );

    assert.equal(result.applied[0], unlock);
});

test("apply preserves invalid unlock values in skipped results", () => {
    const { trainerState } = createTrainerState();

    const invalidUnlock = { type: "badge" };
    const result = createService().apply(
        { id: "P1", unlocks: [invalidUnlock] },
        trainerState
    );

    assert.strictEqual(result.skipped[0].unlock, invalidUnlock);
});

test("apply succeeds even when every unlock is skipped", () => {
    const { trainerState } = createTrainerState({
        addHMAbility: undefined,
        addBadge: undefined,
        addStoryFlag: undefined,
        addAbility: undefined
    });

    const result = createService().apply(
        {
            id: "P1",
            unlocks: [
                "CAN_USE_FLY",
                "BOULDER_BADGE",
                "FLAG_EVENT_DONE",
                "CAN_TRADE"
            ]
        },
        trainerState
    );

    assert.equal(result.success, true);
    assert.deepEqual(result.applied, []);
    assert.equal(result.skipped.length, 4);
});

test("apply propagates errors thrown while processing an unlock", () => {
    const service = createService();
    const trainerState = {
        addAbility() {
            throw new Error("Cannot add ability");
        }
    };

    assert.throws(
        () => service.apply(
            { id: "P1", unlocks: ["CAN_TRADE"] },
            trainerState
        ),
        /Cannot add ability/
    );
});

// --------------------------------------------------
// canApply: validation
// --------------------------------------------------

test("canApply rejects an undefined unlock", () => {
    assert.equal(createService().canApply(undefined, {}), false);
});

test("canApply rejects a null unlock", () => {
    assert.equal(createService().canApply(null, {}), false);
});

test("canApply rejects an empty unlock string", () => {
    assert.equal(createService().canApply("", {}), false);
});

test("canApply rejects a numeric unlock", () => {
    assert.equal(createService().canApply(10, {}), false);
});

test("canApply rejects an object unlock", () => {
    assert.equal(createService().canApply({}, {}), false);
});

test("canApply rejects a missing trainer state", () => {
    assert.equal(createService().canApply("CAN_TRADE", null), false);
});

test("canApply rejects an undefined trainer state", () => {
    assert.equal(createService().canApply("CAN_TRADE", undefined), false);
});

test("canApply rejects a false trainer state", () => {
    assert.equal(createService().canApply("CAN_TRADE", false), false);
});

// --------------------------------------------------
// canApply: unlock type support
// --------------------------------------------------

test("canApply checks support for HM abilities", () => {
    assert.equal(createService().canApply("CAN_USE_FLY", {
        addHMAbility() {}
    }), true);
});

test("canApply normalizes HM ability names", () => {
    assert.equal(createService().canApply("can_use_fly", {
        addHMAbility() {}
    }), true);
});

test("canApply rejects HM abilities without addHMAbility", () => {
    assert.equal(createService().canApply("CAN_USE_FLY", {}), false);
});

test("canApply rejects HM abilities when addHMAbility is not a function", () => {
    assert.equal(createService().canApply("CAN_USE_FLY", {
        addHMAbility: true
    }), false);
});

test("canApply checks support for badges", () => {
    assert.equal(createService().canApply("BOULDER_BADGE", {
        addBadge() {}
    }), true);
});

test("canApply normalizes badge names", () => {
    assert.equal(createService().canApply("boulder_badge", {
        addBadge() {}
    }), true);
});

test("canApply rejects badges without addBadge", () => {
    assert.equal(createService().canApply("BOULDER_BADGE", {}), false);
});

test("canApply rejects badges when addBadge is not a function", () => {
    assert.equal(createService().canApply("BOULDER_BADGE", {
        addBadge: true
    }), false);
});

test("canApply checks support for story flags", () => {
    assert.equal(createService().canApply("FLAG_EVENT_DONE", {
        addStoryFlag() {}
    }), true);
});

test("canApply normalizes story flag names", () => {
    assert.equal(createService().canApply("flag_event_done", {
        addStoryFlag() {}
    }), true);
});

test("canApply rejects story flags without addStoryFlag", () => {
    assert.equal(createService().canApply("FLAG_EVENT_DONE", {}), false);
});

test("canApply rejects story flags when addStoryFlag is not a function", () => {
    assert.equal(createService().canApply("FLAG_EVENT_DONE", {
        addStoryFlag: true
    }), false);
});

test("canApply checks support for general abilities", () => {
    assert.equal(createService().canApply("CAN_TRADE", {
        addAbility() {}
    }), true);
});

test("canApply normalizes general ability names", () => {
    assert.equal(createService().canApply("can_trade", {
        addAbility() {}
    }), true);
});

test("canApply rejects general abilities without addAbility", () => {
    assert.equal(createService().canApply("CAN_TRADE", {}), false);
});

test("canApply rejects general abilities when addAbility is not a function", () => {
    assert.equal(createService().canApply("CAN_TRADE", {
        addAbility: true
    }), false);
});

test("canApply prioritizes HM abilities when checking support", () => {
    assert.equal(createService().canApply("CAN_USE_FLY_BADGE", {
        addHMAbility() {},
        addBadge: undefined
    }), true);
});

test("canApply prioritizes badge suffix over story flag prefix", () => {
    const service = createService();

    assert.equal(
        service.canApply("FLAG_SPECIAL_BADGE", {
            addBadge() {}
        }),
        true
    );

    assert.equal(
        service.canApply("FLAG_SPECIAL_BADGE", {
            addStoryFlag() {}
        }),
        false
    );
});

// --------------------------------------------------
// applyAll: invalid input
// --------------------------------------------------

test("applyAll rejects a missing progression list", () => {
    assert.deepEqual(createService().applyAll(undefined, {}), {
        success: false,
        applied: [],
        skipped: [],
        reason: "Invalid progression list"
    });
});

test("applyAll rejects a null progression list", () => {
    assert.equal(createService().applyAll(null, {}).reason, "Invalid progression list");
});

test("applyAll rejects an object instead of an array", () => {
    assert.equal(createService().applyAll({}, {}).reason, "Invalid progression list");
});

test("applyAll rejects a string instead of an array", () => {
    assert.equal(
        createService().applyAll("P1", {}).reason,
        "Invalid progression list"
    );
});

test("applyAll accepts an empty progression list", () => {
    assert.deepEqual(createService().applyAll([], {}), {
        success: true,
        applied: [],
        skipped: []
    });
});

// --------------------------------------------------
// applyAll: applying progressions
// --------------------------------------------------

test("applyAll applies unlocks from multiple progressions", () => {
    const { trainerState } = createTrainerState();

    const result = createService().applyAll([
        { id: "P1", unlocks: ["BOULDER_BADGE"] },
        { id: "P2", unlocks: ["CAN_USE_CUT", "FLAG_EVENT_DONE"] }
    ], trainerState);

    assert.equal(result.success, true);
    assert.deepEqual(result.applied, [
        {
            progression: "P1",
            unlocks: ["BOULDER_BADGE"]
        },
        {
            progression: "P2",
            unlocks: ["CAN_USE_CUT", "FLAG_EVENT_DONE"]
        }
    ]);
    assert.deepEqual(result.skipped, []);
});

test("applyAll preserves progression order", () => {
    const { trainerState } = createTrainerState();

    const result = createService().applyAll([
        { id: "FIRST", unlocks: ["CAN_TRADE"] },
        { id: "SECOND", unlocks: ["CAN_BATTLE"] },
        { id: "THIRD", unlocks: ["CAN_TRADE"] }
    ], trainerState);

    assert.deepEqual(
        result.applied.map(item => item.progression),
        ["FIRST", "SECOND", "THIRD"]
    );
});

test("applyAll collects skipped unlocks within a successful progression", () => {
    const { trainerState } = createTrainerState({
        addBadge: undefined
    });

    const result = createService().applyAll([
        { id: "P1", unlocks: ["BOULDER_BADGE", "CAN_TRADE"] }
    ], trainerState);

    assert.equal(result.success, true);
    assert.deepEqual(result.applied, [
        {
            progression: "P1",
            unlocks: ["CAN_TRADE"]
        }
    ]);
    assert.deepEqual(result.skipped, []);
});

test("applyAll records a missing progression as skipped", () => {
    const { trainerState } = createTrainerState();

    const result = createService().applyAll([
        null
    ], trainerState);

    assert.equal(result.success, true);
    assert.deepEqual(result.applied, []);
    assert.deepEqual(result.skipped, [
        {
            progression: null,
            reason: "Missing progression"
        }
    ]);
});

test("applyAll records a progression with a missing trainer state as skipped", () => {
    const result = createService().applyAll([
        { id: "P1", unlocks: ["CAN_TRADE"] }
    ], null);

    assert.equal(result.success, true);
    assert.deepEqual(result.applied, []);
    assert.deepEqual(result.skipped, [
        {
            progression: "P1",
            reason: "Missing trainer state"
        }
    ]);
});

test("applyAll continues processing after a skipped progression", () => {
    const { trainerState } = createTrainerState();

    const result = createService().applyAll([
        null,
        { id: "P2", unlocks: ["CAN_TRADE"] }
    ], trainerState);

    assert.deepEqual(result.applied, [
        {
            progression: "P2",
            unlocks: ["CAN_TRADE"]
        }
    ]);
    assert.deepEqual(result.skipped, [
        {
            progression: null,
            reason: "Missing progression"
        }
    ]);
});

test("applyAll returns null for a progression without an ID", () => {
    const { trainerState } = createTrainerState();

    const result = createService().applyAll([
        { unlocks: ["CAN_TRADE"] }
    ], trainerState);

    assert.equal(result.applied[0].progression, null);
});

test("applyAll returns null for a skipped progression without an ID", () => {
    const result = createService().applyAll([
        {}
    ], null);

    assert.deepEqual(result.skipped, [
        {
            progression: null,
            reason: "Missing trainer state"
        }
    ]);
});

test("applyAll propagates errors raised while applying a progression", () => {
    const service = createService();
    const trainerState = {
        addAbility() {
            throw new Error("Unlock failed");
        }
    };

    assert.throws(
        () => service.applyAll([
            { id: "P1", unlocks: ["CAN_TRADE"] }
        ], trainerState),
        /Unlock failed/
    );
});

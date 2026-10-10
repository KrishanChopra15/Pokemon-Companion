"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const StoryProgressionService = require("../scripts/services/story-progression-service");

function createService() {
    return new StoryProgressionService();
}

function createTrainerState(overrides = {}) {
    return {
        badges: [],
        keyItems: [],
        storyFlags: [],
        completedEvents: [],
        ...overrides
    };
}

const EXPECTED_IDS = [
    "GET_OAK_PARCEL",
    "RECEIVE_POKEDEX",
    "COMPLETE_MT_MOON",
    "HELP_BILL",
    "ENTER_SS_ANNE",
    "SS_ANNE_DEPART",
    "CLEAR_SILPH_CO",
    "UNLOCK_ELITE_FOUR"
];

const ELITE_FOUR_BADGES = [
    "BOULDER_BADGE",
    "CASCADE_BADGE",
    "THUNDER_BADGE",
    "RAINBOW_BADGE",
    "SOUL_BADGE",
    "MARSH_BADGE",
    "VOLCANO_BADGE",
    "EARTH_BADGE"
];

// --------------------------------------------------
// Constructor and rules
// --------------------------------------------------

test("constructor creates a StoryProgressionService instance", () => {
    assert.ok(createService() instanceof StoryProgressionService);
});

test("constructor initializes story rules as an array", () => {
    assert.ok(Array.isArray(createService().storyRules));
});

test("constructor initializes eight story rules", () => {
    assert.equal(createService().storyRules.length, 8);
});

test("story rules have the expected IDs in order", () => {
    assert.deepEqual(
        createService().storyRules.map(rule => rule.id),
        EXPECTED_IDS
    );
});

test("every story rule has a description", () => {
    for (const rule of createService().getAllRules()) {
        assert.equal(typeof rule.description, "string");
        assert.ok(rule.description.length > 0);
    }
});

test("every story rule has a location", () => {
    for (const rule of createService().getAllRules()) {
        assert.equal(typeof rule.location, "string");
        assert.ok(rule.location.length > 0);
    }
});

test("every story rule has a completion flag", () => {
    for (const rule of createService().getAllRules()) {
        assert.equal(typeof rule.completionFlag, "string");
        assert.ok(rule.completionFlag.length > 0);
    }
});

test("getAllRules returns the underlying rules array", () => {
    const service = createService();

    assert.strictEqual(service.getAllRules(), service.storyRules);
});

test("getAllRules returns the same reference on repeated calls", () => {
    const service = createService();

    assert.strictEqual(service.getAllRules(), service.getAllRules());
});

test("getAllRules returns the rules in definition order", () => {
    const service = createService();

    assert.deepEqual(
        service.getAllRules().map(rule => rule.id),
        EXPECTED_IDS
    );
});

test("story rules contain all expected completion flags", () => {
    const service = createService();

    assert.deepEqual(
        service.getAllRules().map(rule => rule.completionFlag),
        [
            "OAK_PARCEL_DELIVERED",
            "POKEDEX_RECEIVED",
            "MT_MOON_COMPLETED",
            "BILL_EVENT_COMPLETED",
            "SS_ANNE_ENTERED",
            "SS_ANNE_DEPARTED",
            "SILPH_CO_COMPLETED",
            "ELITE_FOUR_UNLOCKED"
        ]
    );
});

// --------------------------------------------------
// getRule
// --------------------------------------------------

test("getRule returns the Oak Parcel rule", () => {
    const rule = createService().getRule("GET_OAK_PARCEL");

    assert.equal(rule.id, "GET_OAK_PARCEL");
    assert.equal(rule.location, "VIRIDIAN_CITY");
    assert.equal(rule.completionFlag, "OAK_PARCEL_DELIVERED");
});

test("getRule returns the Pokédex rule", () => {
    const rule = createService().getRule("RECEIVE_POKEDEX");

    assert.equal(rule.id, "RECEIVE_POKEDEX");
    assert.equal(rule.location, "PALLET_TOWN");
});

test("getRule returns the Mt. Moon rule", () => {
    const rule = createService().getRule("COMPLETE_MT_MOON");

    assert.equal(rule.id, "COMPLETE_MT_MOON");
    assert.equal(rule.location, "MAP_MT_MOON_1F");
});

test("getRule returns the Bill rule", () => {
    assert.equal(
        createService().getRule("HELP_BILL").completionFlag,
        "BILL_EVENT_COMPLETED"
    );
});

test("getRule returns the S.S. Anne entry rule", () => {
    assert.equal(
        createService().getRule("ENTER_SS_ANNE").location,
        "MAP_SSANNE_EXTERIOR"
    );
});

test("getRule returns the S.S. Anne departure rule", () => {
    assert.equal(
        createService().getRule("SS_ANNE_DEPART").location,
        "MAP_SSANNE"
    );
});

test("getRule returns the Silph Co. rule", () => {
    assert.equal(
        createService().getRule("CLEAR_SILPH_CO").location,
        "MAP_SILPH_CO_1F"
    );
});

test("getRule returns the Elite Four rule", () => {
    assert.deepEqual(
        createService().getRule("UNLOCK_ELITE_FOUR").requirement.badges,
        ELITE_FOUR_BADGES
    );
});

test("getRule returns the original rule object", () => {
    const service = createService();

    assert.strictEqual(
        service.getRule("GET_OAK_PARCEL"),
        service.storyRules[0]
    );
});

test("getRule returns null for an unknown ID", () => {
    assert.equal(createService().getRule("UNKNOWN_OBJECTIVE"), null);
});

test("getRule returns null for an empty ID", () => {
    assert.equal(createService().getRule(""), null);
});

test("getRule returns null for a null ID", () => {
    assert.equal(createService().getRule(null), null);
});

test("getRule returns null for an undefined ID", () => {
    assert.equal(createService().getRule(undefined), null);
});

test("getRule uses exact case-sensitive matching", () => {
    assert.equal(createService().getRule("get_oak_parcel"), null);
});

test("getRule returns null for a numeric ID", () => {
    assert.equal(createService().getRule(123), null);
});

// --------------------------------------------------
// Rule definitions and requirements
// --------------------------------------------------

test("GET_OAK_PARCEL has no requirement", () => {
    assert.equal(
        createService().getRule("GET_OAK_PARCEL").requirement,
        null
    );
});

test("RECEIVE_POKEDEX requires delivery of Oak's Parcel", () => {
    assert.deepEqual(
        createService().getRule("RECEIVE_POKEDEX").requirement,
        { storyFlag: "OAK_PARCEL_DELIVERED" }
    );
});

test("COMPLETE_MT_MOON requires the Boulder Badge", () => {
    assert.deepEqual(
        createService().getRule("COMPLETE_MT_MOON").requirement,
        { badge: "BOULDER_BADGE" }
    );
});

test("HELP_BILL requires Mt. Moon completion", () => {
    assert.deepEqual(
        createService().getRule("HELP_BILL").requirement,
        { storyFlag: "MT_MOON_COMPLETED" }
    );
});

test("ENTER_SS_ANNE requires the S.S. Ticket", () => {
    assert.deepEqual(
        createService().getRule("ENTER_SS_ANNE").requirement,
        { keyItem: "SS_TICKET" }
    );
});

test("SS_ANNE_DEPART requires entering the S.S. Anne", () => {
    assert.deepEqual(
        createService().getRule("SS_ANNE_DEPART").requirement,
        { storyFlag: "SS_ANNE_ENTERED" }
    );
});

test("CLEAR_SILPH_CO has no artificial badge requirement", () => {
    assert.equal(
        createService().getRule("CLEAR_SILPH_CO").requirement,
        null
    );
});

test("UNLOCK_ELITE_FOUR requires all eight badges", () => {
    assert.deepEqual(
        createService().getRule("UNLOCK_ELITE_FOUR").requirement.badges,
        ELITE_FOUR_BADGES
    );
});

// --------------------------------------------------
// canComplete: unknown and unrestricted objectives
// --------------------------------------------------

test("canComplete rejects an unknown objective", () => {
    assert.deepEqual(
        createService().canComplete(
            "UNKNOWN_OBJECTIVE",
            createTrainerState()
        ),
        {
            allowed: false,
            reason: "Unknown story objective"
        }
    );
});

test("canComplete rejects an empty objective ID", () => {
    assert.deepEqual(
        createService().canComplete("", createTrainerState()),
        {
            allowed: false,
            reason: "Unknown story objective"
        }
    );
});

test("canComplete rejects a null objective ID", () => {
    assert.deepEqual(
        createService().canComplete(null, createTrainerState()),
        {
            allowed: false,
            reason: "Unknown story objective"
        }
    );
});

test("canComplete allows an objective without requirements", () => {
    assert.deepEqual(
        createService().canComplete(
            "GET_OAK_PARCEL",
            createTrainerState()
        ),
        { allowed: true }
    );
});

test("canComplete allows CLEAR_SILPH_CO without badges", () => {
    assert.deepEqual(
        createService().canComplete(
            "CLEAR_SILPH_CO",
            createTrainerState()
        ),
        { allowed: true }
    );
});

test("canComplete permits an unrestricted objective without trainer state", () => {
    assert.deepEqual(
        createService().canComplete("GET_OAK_PARCEL", null),
        { allowed: true }
    );
});

test("canComplete does not add artificial gym-order requirements to Silph Co.", () => {
    const trainerState = createTrainerState({
        badges: ["BOULDER_BADGE"],
        storyFlags: []
    });

    assert.deepEqual(
        createService().canComplete("CLEAR_SILPH_CO", trainerState),
        { allowed: true }
    );
});

// --------------------------------------------------
// canComplete: single badge
// --------------------------------------------------

test("canComplete rejects Mt. Moon completion without the Boulder Badge", () => {
    assert.deepEqual(
        createService().canComplete(
            "COMPLETE_MT_MOON",
            createTrainerState()
        ),
        {
            allowed: false,
            reason: "Requires BOULDER_BADGE"
        }
    );
});

test("canComplete allows Mt. Moon completion with the Boulder Badge", () => {
    assert.deepEqual(
        createService().canComplete(
            "COMPLETE_MT_MOON",
            createTrainerState({ badges: ["BOULDER_BADGE"] })
        ),
        { allowed: true }
    );
});

test("canComplete checks badges using a custom hasBadge method", () => {
    const trainerState = createTrainerState({
        hasBadge: badge => badge === "BOULDER_BADGE"
    });

    assert.deepEqual(
        createService().canComplete("COMPLETE_MT_MOON", trainerState),
        { allowed: true }
    );
});

test("canComplete uses the custom hasBadge result directly", () => {
    const trainerState = createTrainerState({
        badges: ["BOULDER_BADGE"],
        hasBadge: () => false
    });

    assert.deepEqual(
        createService().canComplete("COMPLETE_MT_MOON", trainerState),
        {
            allowed: false,
            reason: "Requires BOULDER_BADGE"
        }
    );
});

// --------------------------------------------------
// canComplete: multiple badges
// --------------------------------------------------

test("canComplete rejects Elite Four access when all badges are missing", () => {
    assert.deepEqual(
        createService().canComplete(
            "UNLOCK_ELITE_FOUR",
            createTrainerState()
        ),
        {
            allowed: false,
            reason: "Requires BOULDER_BADGE"
        }
    );
});

test("canComplete reports the first missing badge in rule order", () => {
    const trainerState = createTrainerState({
        badges: ["BOULDER_BADGE", "CASCADE_BADGE"]
    });

    assert.deepEqual(
        createService().canComplete(
            "UNLOCK_ELITE_FOUR",
            trainerState
        ),
        {
            allowed: false,
            reason: "Requires THUNDER_BADGE"
        }
    );
});

test("canComplete allows Elite Four access with all eight badges", () => {
    assert.deepEqual(
        createService().canComplete(
            "UNLOCK_ELITE_FOUR",
            createTrainerState({ badges: [...ELITE_FOUR_BADGES] })
        ),
        { allowed: true }
    );
});

test("canComplete allows Elite Four access when badges are returned by hasBadge", () => {
    const trainerState = createTrainerState({
        hasBadge: badge => ELITE_FOUR_BADGES.includes(badge)
    });

    assert.deepEqual(
        createService().canComplete("UNLOCK_ELITE_FOUR", trainerState),
        { allowed: true }
    );
});

test("canComplete checks each required badge through the custom method", () => {
    const checked = [];
    const trainerState = createTrainerState({
        hasBadge(badge) {
            checked.push(badge);
            return badge === "BOULDER_BADGE";
        }
    });

    createService().canComplete("UNLOCK_ELITE_FOUR", trainerState);

    assert.deepEqual(checked, [
        "BOULDER_BADGE",
        "CASCADE_BADGE"
    ]);
});

// --------------------------------------------------
// canComplete: key items
// --------------------------------------------------

test("canComplete rejects S.S. Anne entry without the ticket", () => {
    assert.deepEqual(
        createService().canComplete(
            "ENTER_SS_ANNE",
            createTrainerState()
        ),
        {
            allowed: false,
            reason: "Requires SS_TICKET"
        }
    );
});

test("canComplete allows S.S. Anne entry with the ticket", () => {
    assert.deepEqual(
        createService().canComplete(
            "ENTER_SS_ANNE",
            createTrainerState({ keyItems: ["SS_TICKET"] })
        ),
        { allowed: true }
    );
});

test("canComplete checks key items using a custom hasKeyItem method", () => {
    const trainerState = createTrainerState({
        hasKeyItem: item => item === "SS_TICKET"
    });

    assert.deepEqual(
        createService().canComplete("ENTER_SS_ANNE", trainerState),
        { allowed: true }
    );
});

test("canComplete uses the custom hasKeyItem result directly", () => {
    const trainerState = createTrainerState({
        keyItems: ["SS_TICKET"],
        hasKeyItem: () => false
    });

    assert.deepEqual(
        createService().canComplete("ENTER_SS_ANNE", trainerState),
        {
            allowed: false,
            reason: "Requires SS_TICKET"
        }
    );
});

// --------------------------------------------------
// canComplete: story flags
// --------------------------------------------------

test("canComplete rejects Pokédex receipt without the parcel flag", () => {
    assert.deepEqual(
        createService().canComplete(
            "RECEIVE_POKEDEX",
            createTrainerState()
        ),
        {
            allowed: false,
            reason: "Requires OAK_PARCEL_DELIVERED"
        }
    );
});

test("canComplete allows Pokédex receipt after parcel delivery", () => {
    assert.deepEqual(
        createService().canComplete(
            "RECEIVE_POKEDEX",
            createTrainerState({
                storyFlags: ["OAK_PARCEL_DELIVERED"]
            })
        ),
        { allowed: true }
    );
});

test("canComplete rejects Bill's event until Mt. Moon is completed", () => {
    assert.deepEqual(
        createService().canComplete(
            "HELP_BILL",
            createTrainerState()
        ),
        {
            allowed: false,
            reason: "Requires MT_MOON_COMPLETED"
        }
    );
});

test("canComplete allows Bill's event after Mt. Moon completion", () => {
    assert.deepEqual(
        createService().canComplete(
            "HELP_BILL",
            createTrainerState({
                storyFlags: ["MT_MOON_COMPLETED"]
            })
        ),
        { allowed: true }
    );
});

test("canComplete rejects S.S. Anne departure before entry", () => {
    assert.deepEqual(
        createService().canComplete(
            "SS_ANNE_DEPART",
            createTrainerState()
        ),
        {
            allowed: false,
            reason: "Requires SS_ANNE_ENTERED"
        }
    );
});

test("canComplete allows S.S. Anne departure after entry", () => {
    assert.deepEqual(
        createService().canComplete(
            "SS_ANNE_DEPART",
            createTrainerState({
                storyFlags: ["SS_ANNE_ENTERED"]
            })
        ),
        { allowed: true }
    );
});

test("canComplete checks story flags using a custom method", () => {
    const trainerState = createTrainerState({
        hasStoryFlag: flag => flag === "OAK_PARCEL_DELIVERED"
    });

    assert.deepEqual(
        createService().canComplete("RECEIVE_POKEDEX", trainerState),
        { allowed: true }
    );
});

test("canComplete uses the custom story-flag result directly", () => {
    const trainerState = createTrainerState({
        storyFlags: ["OAK_PARCEL_DELIVERED"],
        hasStoryFlag: () => false
    });

    assert.deepEqual(
        createService().canComplete("RECEIVE_POKEDEX", trainerState),
        {
            allowed: false,
            reason: "Requires OAK_PARCEL_DELIVERED"
        }
    );
});

// --------------------------------------------------
// State helper methods
// --------------------------------------------------

test("hasBadge checks the badges array", () => {
    assert.equal(
        createService().hasBadge(
            "BOULDER_BADGE",
            createTrainerState({ badges: ["BOULDER_BADGE"] })
        ),
        true
    );
});

test("hasBadge returns false for a missing badge", () => {
    assert.equal(
        createService().hasBadge("BOULDER_BADGE", createTrainerState()),
        false
    );
});

test("hasBadge passes the badge to a custom method", () => {
    const received = [];
    const state = createTrainerState({
        hasBadge(badge) {
            received.push(badge);
            return true;
        }
    });

    assert.equal(createService().hasBadge("CASCADE_BADGE", state), true);
    assert.deepEqual(received, ["CASCADE_BADGE"]);
});

test("hasBadge falls back to an empty array when badges is absent", () => {
    assert.equal(
        createService().hasBadge("BOULDER_BADGE", {}),
        false
    );
});

test("hasKeyItem checks the keyItems array", () => {
    assert.equal(
        createService().hasKeyItem(
            "SS_TICKET",
            createTrainerState({ keyItems: ["SS_TICKET"] })
        ),
        true
    );
});

test("hasKeyItem returns false for a missing item", () => {
    assert.equal(
        createService().hasKeyItem("SS_TICKET", createTrainerState()),
        false
    );
});

test("hasKeyItem passes the item to a custom method", () => {
    const received = [];
    const state = createTrainerState({
        hasKeyItem(item) {
            received.push(item);
            return true;
        }
    });

    assert.equal(createService().hasKeyItem("SS_TICKET", state), true);
    assert.deepEqual(received, ["SS_TICKET"]);
});

test("hasKeyItem falls back to an empty array when keyItems is absent", () => {
    assert.equal(createService().hasKeyItem("SS_TICKET", {}), false);
});

test("hasStoryFlag checks the storyFlags array", () => {
    assert.equal(
        createService().hasStoryFlag(
            "OAK_PARCEL_DELIVERED",
            createTrainerState({
                storyFlags: ["OAK_PARCEL_DELIVERED"]
            })
        ),
        true
    );
});

test("hasStoryFlag returns false for a missing flag", () => {
    assert.equal(
        createService().hasStoryFlag(
            "OAK_PARCEL_DELIVERED",
            createTrainerState()
        ),
        false
    );
});

test("hasStoryFlag passes the flag to a custom method", () => {
    const received = [];
    const state = createTrainerState({
        hasStoryFlag(flag) {
            received.push(flag);
            return true;
        }
    });

    assert.equal(
        createService().hasStoryFlag("FLAG_TEST", state),
        true
    );

    assert.deepEqual(received, ["FLAG_TEST"]);
});

test("hasStoryFlag falls back to an empty array when storyFlags is absent", () => {
    assert.equal(
        createService().hasStoryFlag("FLAG_TEST", {}),
        false
    );
});

// --------------------------------------------------
// isCompleted
// --------------------------------------------------

test("isCompleted returns true when the completion flag is present", () => {
    const service = createService();
    const rule = service.getRule("GET_OAK_PARCEL");

    assert.equal(
        service.isCompleted(
            rule,
            createTrainerState({
                storyFlags: ["OAK_PARCEL_DELIVERED"]
            })
        ),
        true
    );
});

test("isCompleted returns true when the rule ID is in completedEvents", () => {
    const service = createService();
    const rule = service.getRule("GET_OAK_PARCEL");

    assert.equal(
        service.isCompleted(
            rule,
            createTrainerState({
                completedEvents: ["GET_OAK_PARCEL"]
            })
        ),
        true
    );
});

test("isCompleted returns true when the completion flag is in completedEvents", () => {
    const service = createService();
    const rule = service.getRule("GET_OAK_PARCEL");

    assert.equal(
        service.isCompleted(
            rule,
            createTrainerState({
                completedEvents: ["OAK_PARCEL_DELIVERED"]
            })
        ),
        true
    );
});

test("isCompleted returns false when the objective is not completed", () => {
    assert.equal(
        createService().isCompleted(
            createService().getRule("GET_OAK_PARCEL"),
            createTrainerState()
        ),
        false
    );
});

test("isCompleted supports completion through a custom hasStoryFlag method", () => {
    const service = createService();
    const rule = service.getRule("GET_OAK_PARCEL");

    const state = createTrainerState({
        hasStoryFlag: flag => flag === rule.completionFlag
    });

    assert.equal(service.isCompleted(rule, state), true);
});

test("isCompleted returns true for a completion flag even without completedEvents", () => {
    const rule = createService().getRule("RECEIVE_POKEDEX");

    assert.equal(
        createService().isCompleted(
            rule,
            createTrainerState({
                storyFlags: ["POKEDEX_RECEIVED"]
            })
        ),
        true
    );
});

test("isCompleted does not modify trainer state", () => {
    const service = createService();
    const state = createTrainerState({
        storyFlags: ["OAK_PARCEL_DELIVERED"],
        completedEvents: []
    });
    const original = {
        badges: [...state.badges],
        keyItems: [...state.keyItems],
        storyFlags: [...state.storyFlags],
        completedEvents: [...state.completedEvents]
    };

    service.isCompleted(service.getRule("GET_OAK_PARCEL"), state);

    assert.deepEqual(state, original);
});

// --------------------------------------------------
// getNextObjectives
// --------------------------------------------------

test("getNextObjectives returns an array", () => {
    assert.ok(
        Array.isArray(
            createService().getNextObjectives(createTrainerState())
        )
    );
});

test("getNextObjectives returns only known story rules", () => {
    const service = createService();

    for (const rule of service.getNextObjectives(createTrainerState())) {
        assert.ok(EXPECTED_IDS.includes(rule.id));
    }
});

test("getNextObjectives includes Oak's Parcel at the beginning", () => {
    const objectives = createService().getNextObjectives(
        createTrainerState()
    );

    assert.ok(
        objectives.some(rule => rule.id === "GET_OAK_PARCEL")
    );
});

test("getNextObjectives includes unrestricted Silph Co. progression", () => {
    const objectives = createService().getNextObjectives(
        createTrainerState()
    );

    assert.ok(
        objectives.some(rule => rule.id === "CLEAR_SILPH_CO")
    );
});

test("getNextObjectives excludes objectives whose completion flags are present", () => {
    const objectives = createService().getNextObjectives(
        createTrainerState({
            storyFlags: [
                "OAK_PARCEL_DELIVERED",
                "SILPH_CO_COMPLETED"
            ]
        })
    );

    assert.equal(
        objectives.some(rule => rule.id === "GET_OAK_PARCEL"),
        false
    );

    assert.equal(
        objectives.some(rule => rule.id === "CLEAR_SILPH_CO"),
        false
    );
});

test("getNextObjectives excludes objectives already in completedEvents", () => {
    const objectives = createService().getNextObjectives(
        createTrainerState({
            completedEvents: ["GET_OAK_PARCEL"]
        })
    );

    assert.equal(
        objectives.some(rule => rule.id === "GET_OAK_PARCEL"),
        false
    );
});

test("getNextObjectives unlocks Pokédex receipt when Oak's Parcel is delivered", () => {
    const objectives = createService().getNextObjectives(
        createTrainerState({
            storyFlags: ["OAK_PARCEL_DELIVERED"]
        })
    );

    assert.ok(
        objectives.some(rule => rule.id === "RECEIVE_POKEDEX")
    );
});

test("getNextObjectives does not include Pokédex receipt before parcel delivery", () => {
    const objectives = createService().getNextObjectives(
        createTrainerState()
    );

    assert.equal(
        objectives.some(rule => rule.id === "RECEIVE_POKEDEX"),
        false
    );
});

test("getNextObjectives unlocks Mt. Moon when the Boulder Badge is owned", () => {
    const objectives = createService().getNextObjectives(
        createTrainerState({
            badges: ["BOULDER_BADGE"]
        })
    );

    assert.ok(
        objectives.some(rule => rule.id === "COMPLETE_MT_MOON")
    );
});

test("getNextObjectives unlocks Bill's event after Mt. Moon", () => {
    const objectives = createService().getNextObjectives(
        createTrainerState({
            storyFlags: ["MT_MOON_COMPLETED"]
        })
    );

    assert.ok(
        objectives.some(rule => rule.id === "HELP_BILL")
    );
});

test("getNextObjectives unlocks S.S. Anne entry with the ticket", () => {
    const objectives = createService().getNextObjectives(
        createTrainerState({
            keyItems: ["SS_TICKET"]
        })
    );

    assert.ok(
        objectives.some(rule => rule.id === "ENTER_SS_ANNE")
    );
});

test("getNextObjectives unlocks S.S. Anne departure after entry", () => {
    const objectives = createService().getNextObjectives(
        createTrainerState({
            storyFlags: ["SS_ANNE_ENTERED"]
        })
    );

    assert.ok(
        objectives.some(rule => rule.id === "SS_ANNE_DEPART")
    );
});

test("getNextObjectives excludes Elite Four access until every badge is owned", () => {
    const objectives = createService().getNextObjectives(
        createTrainerState({
            badges: ELITE_FOUR_BADGES.slice(0, 7)
        })
    );

    assert.equal(
        objectives.some(rule => rule.id === "UNLOCK_ELITE_FOUR"),
        false
    );
});

test("getNextObjectives includes Elite Four access when all badges are owned", () => {
    const objectives = createService().getNextObjectives(
        createTrainerState({
            badges: [...ELITE_FOUR_BADGES]
        })
    );

    assert.ok(
        objectives.some(rule => rule.id === "UNLOCK_ELITE_FOUR")
    );
});

test("getNextObjectives returns rules in the original story order", () => {
    const objectives = createService().getNextObjectives(
        createTrainerState({
            storyFlags: ["OAK_PARCEL_DELIVERED"],
            badges: ["BOULDER_BADGE"],
            keyItems: ["SS_TICKET"]
        })
    );

    const resultIndices = objectives.map(
        rule => EXPECTED_IDS.indexOf(rule.id)
    );

    assert.deepEqual(
        resultIndices,
        [...resultIndices].sort((a, b) => a - b)
    );
});

test("getNextObjectives does not modify trainer state", () => {
    const service = createService();
    const state = createTrainerState({
        badges: ["BOULDER_BADGE"],
        keyItems: ["SS_TICKET"],
        storyFlags: ["OAK_PARCEL_DELIVERED"],
        completedEvents: []
    });

    const original = structuredClone(state);

    service.getNextObjectives(state);

    assert.deepEqual(state, original);
});

// --------------------------------------------------
// Alternate route and no state mutation
// --------------------------------------------------

test("Silph Co. remains available without the Rainbow Badge", () => {
    const state = createTrainerState({
        badges: ["BOULDER_BADGE", "CASCADE_BADGE", "THUNDER_BADGE"]
    });

    assert.deepEqual(
        createService().canComplete("CLEAR_SILPH_CO", state),
        { allowed: true }
    );
});

test("Silph Co. remains available without any badges", () => {
    assert.deepEqual(
        createService().canComplete(
            "CLEAR_SILPH_CO",
            createTrainerState()
        ),
        { allowed: true }
    );
});

test("canComplete does not mutate trainer state", () => {
    const service = createService();
    const state = createTrainerState({
        badges: ["BOULDER_BADGE"],
        keyItems: [],
        storyFlags: [],
        completedEvents: []
    });

    const original = structuredClone(state);

    service.canComplete("COMPLETE_MT_MOON", state);

    assert.deepEqual(state, original);
});

test("story progression checks do not add completion flags", () => {
    const service = createService();
    const state = createTrainerState({
        badges: ["BOULDER_BADGE"],
        storyFlags: [],
        keyItems: []
    });

    service.canComplete("COMPLETE_MT_MOON", state);
    service.getNextObjectives(state);

    assert.deepEqual(state.storyFlags, []);
});

test("story progression checks do not complete events", () => {
    const service = createService();
    const state = createTrainerState();

    service.canComplete("GET_OAK_PARCEL", state);
    service.isCompleted(service.getRule("GET_OAK_PARCEL"), state);
    service.getNextObjectives(state);

    assert.deepEqual(state.completedEvents, []);
});

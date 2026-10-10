"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GymProgressionService = require("../scripts/services/gym-progression-service");

// --------------------------------------------------
// Fixtures and mock dependencies
// --------------------------------------------------

function createGyms() {
    return [
        {
            id: "PEWTER_GYM",
            order: 1,
            trainer: "Brock",
            badge: "BOULDER_BADGE"
        },
        {
            id: "CERULEAN_GYM",
            order: 2,
            trainer: "Misty",
            badge: "CASCADE_BADGE"
        },
        {
            id: "VERMILION_GYM",
            order: 3,
            trainer: "Lt. Surge",
            badge: "THUNDER_BADGE"
        },
        {
            id: "FUCHSIA_GYM",
            order: 4,
            trainer: "Koga",
            badge: "SOUL_BADGE"
        }
    ];
}

function createDatabase(gyms = createGyms()) {
    const calls = {
        getAllGyms: 0,
        getGym: []
    };

    return {
        calls,
        gyms,

        getAllGyms() {
            calls.getAllGyms += 1;
            return gyms;
        },

        getGym(id) {
            calls.getGym.push(id);

            return gyms.find(gym => gym.id === id) || null;
        }
    };
}

function createTrainerState(options = {}) {
    const state = {
        badges: options.badges || [],
        storyFlags: options.storyFlags || [],
        hmAbilities: options.hmAbilities || [],
        hms: options.hms || [],
        keyItems: options.keyItems || [],
        visitedLocations: options.visitedLocations || []
    };

    const calls = {
        hasCompletedBattle: [],
        hasStoryFlag: [],
        hasBadge: [],
        hasKeyItem: []
    };

    state.hasCompletedBattle = function (gymId) {
        calls.hasCompletedBattle.push(gymId);

        if (typeof options.hasCompletedBattle === "function") {
            return options.hasCompletedBattle(gymId);
        }

        return (options.completedBattles || []).includes(gymId);
    };

    state.hasStoryFlag = function (flag) {
        calls.hasStoryFlag.push(flag);

        if (typeof options.hasStoryFlag === "function") {
            return options.hasStoryFlag(flag);
        }

        return state.storyFlags.includes(flag);
    };

    state.hasBadge = function (badge) {
        calls.hasBadge.push(badge);

        if (typeof options.hasBadge === "function") {
            return options.hasBadge(badge);
        }

        return state.badges.includes(badge);
    };

    state.hasKeyItem = function (item) {
        calls.hasKeyItem.push(item);

        if (typeof options.hasKeyItem === "function") {
            return options.hasKeyItem(item);
        }

        return state.keyItems.includes(item);
    };

    return { state, calls };
}

function createMapAccess(options = {}) {
    const calls = [];

    return {
        calls,

        canAccess(location, trainerState) {
            calls.push({ location, trainerState });

            if (typeof options.canAccess === "function") {
                return options.canAccess(location, trainerState);
            }

            return {
                allowed: options.allowed !== false
            };
        }
    };
}

function createEnvironment(options = {}) {
    const database = Object.prototype.hasOwnProperty.call(
        options,
        "database"
    )
        ? options.database
        : createDatabase(options.gyms || createGyms());

    const mapAccess = Object.prototype.hasOwnProperty.call(
        options,
        "mapAccess"
    )
        ? options.mapAccess
        : null;

    return {
        database,
        mapAccess,
        service: new GymProgressionService(database, mapAccess)
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a GymProgressionService instance", () => {
    const { service } = createEnvironment();

    assert.ok(service instanceof GymProgressionService);
});

test("constructor stores the supplied database service", () => {
    const { service, database } = createEnvironment();

    assert.strictEqual(service.database, database);
});

test("constructor stores the supplied map access service", () => {
    const mapAccess = createMapAccess();
    const { service } = createEnvironment({ mapAccess });

    assert.strictEqual(service.mapAccess, mapAccess);
});

test("constructor defaults map access to null", () => {
    const { service } = createEnvironment();

    assert.equal(service.mapAccess, null);
});

test("constructor accepts a missing database service", () => {
    const { service } = createEnvironment({
        database: null
    });

    assert.equal(service.database, null);
});

// --------------------------------------------------
// getAllGyms
// --------------------------------------------------

test("getAllGyms returns all gyms from the database", () => {
    const { service, database } = createEnvironment();

    assert.deepEqual(
        service.getAllGyms(),
        database.gyms
    );
});

test("getAllGyms delegates to the database", () => {
    const { service, database } = createEnvironment();

    service.getAllGyms();

    assert.equal(database.calls.getAllGyms, 1);
});

test("getAllGyms returns the original database array", () => {
    const gyms = createGyms();
    const { service } = createEnvironment({ gyms });

    assert.strictEqual(service.getAllGyms(), gyms);
});

test("getAllGyms returns an empty array when the database is null", () => {
    const { service } = createEnvironment({
        database: null
    });

    assert.deepEqual(service.getAllGyms(), []);
});

test("getAllGyms returns an empty array when the database is undefined", () => {
    const { service } = createEnvironment({
        database: undefined
    });

    assert.deepEqual(service.getAllGyms(), []);
});

test("getAllGyms propagates database errors", () => {
    const service = new GymProgressionService({
        getAllGyms() {
            throw new Error("Gym database failed");
        }
    });

    assert.throws(
        () => service.getAllGyms(),
        /Gym database failed/
    );
});

// --------------------------------------------------
// getGym
// --------------------------------------------------

test("getGym finds Pewter Gym", () => {
    const { service, database } = createEnvironment();

    assert.strictEqual(
        service.getGym("PEWTER_GYM"),
        database.gyms[0]
    );
});

test("getGym finds Cerulean Gym", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getGym("CERULEAN_GYM").trainer,
        "Misty"
    );
});

test("getGym delegates to the database service", () => {
    const { service, database } = createEnvironment();

    service.getGym("VERMILION_GYM");

    assert.deepEqual(
        database.calls.getGym,
        ["VERMILION_GYM"]
    );
});

test("getGym returns null for an unknown gym", () => {
    const { service } = createEnvironment();

    assert.equal(service.getGym("UNKNOWN_GYM"), null);
});

test("getGym returns null when the database is missing", () => {
    const { service } = createEnvironment({
        database: null
    });

    assert.equal(service.getGym("PEWTER_GYM"), null);
});

test("getGym passes the requested ID unchanged", () => {
    const database = {
        getGym(id) {
            assert.equal(id, "custom-gym-id");
            return { id };
        }
    };

    const service = new GymProgressionService(database);

    assert.deepEqual(
        service.getGym("custom-gym-id"),
        { id: "custom-gym-id" }
    );
});

test("getGym propagates database errors", () => {
    const service = new GymProgressionService({
        getGym() {
            throw new Error("Gym lookup failed");
        }
    });

    assert.throws(
        () => service.getGym("PEWTER_GYM"),
        /Gym lookup failed/
    );
});

// --------------------------------------------------
// getGymByOrder and getNextGym
// --------------------------------------------------

test("getGymByOrder finds the first gym", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getGymByOrder(1).id,
        "PEWTER_GYM"
    );
});

test("getGymByOrder finds the fourth gym", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getGymByOrder(4).id,
        "FUCHSIA_GYM"
    );
});

test("getGymByOrder returns null for an unknown order", () => {
    const { service } = createEnvironment();

    assert.equal(service.getGymByOrder(99), null);
});

test("getGymByOrder uses exact order matching", () => {
    const { service } = createEnvironment();

    assert.equal(service.getGymByOrder("1"), null);
});

test("getGymByOrder returns the first matching gym when orders are duplicated", () => {
    const gyms = [
        { id: "GYM_A", order: 1 },
        { id: "GYM_B", order: 1 }
    ];

    const { service } = createEnvironment({ gyms });

    assert.equal(service.getGymByOrder(1).id, "GYM_A");
});

test("getGymByOrder returns null when the database is absent", () => {
    const { service } = createEnvironment({
        database: null
    });

    assert.equal(service.getGymByOrder(1), null);
});

test("getNextGym returns the gym with the next order", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getNextGym(1).id,
        "CERULEAN_GYM"
    );
});

test("getNextGym returns null after the last gym", () => {
    const { service } = createEnvironment();

    assert.equal(service.getNextGym(4), null);
});

test("getNextGym returns null when the next order is missing", () => {
    const gyms = [
        { id: "GYM_A", order: 1 },
        { id: "GYM_C", order: 3 }
    ];

    const { service } = createEnvironment({ gyms });

    assert.equal(service.getNextGym(1), null);
});

test("getNextGym uses the requested order plus one", () => {
    const { service } = createEnvironment();

    assert.equal(service.getNextGym(2).order, 3);
});

test("getNextGym returns null when the database is missing", () => {
    const { service } = createEnvironment({
        database: null
    });

    assert.equal(service.getNextGym(1), null);
});

// --------------------------------------------------
// getPreviousGyms
// --------------------------------------------------

test("getPreviousGyms returns every gym with a lower order", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getPreviousGyms("VERMILION_GYM").map(gym => gym.id),
        ["PEWTER_GYM", "CERULEAN_GYM"]
    );
});

test("getPreviousGyms returns an empty array for the first gym", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getPreviousGyms("PEWTER_GYM"),
        []
    );
});

test("getPreviousGyms returns an empty array for an unknown gym", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getPreviousGyms("UNKNOWN_GYM"),
        []
    );
});

test("getPreviousGyms uses order values rather than array positions", () => {
    const gyms = [
        { id: "GYM_THREE", order: 3 },
        { id: "GYM_ONE", order: 1 },
        { id: "GYM_TWO", order: 2 }
    ];

    const { service } = createEnvironment({ gyms });

    assert.deepEqual(
        service.getPreviousGyms("GYM_THREE").map(gym => gym.id),
        ["GYM_ONE", "GYM_TWO"]
    );
});

test("getPreviousGyms preserves the database array order", () => {
    const gyms = [
        { id: "GYM_THREE", order: 3 },
        { id: "GYM_ONE", order: 1 },
        { id: "GYM_TWO", order: 2 }
    ];

    const { service } = createEnvironment({ gyms });

    assert.deepEqual(
        service.getPreviousGyms("GYM_THREE").map(gym => gym.id),
        ["GYM_ONE", "GYM_TWO"]
    );
});

test("getPreviousGyms returns original gym objects", () => {
    const { service, database } = createEnvironment();

    const previous = service.getPreviousGyms("VERMILION_GYM");

    assert.strictEqual(previous[0], database.gyms[0]);
    assert.strictEqual(previous[1], database.gyms[1]);
});

test("getPreviousGyms returns an empty array when the database is missing", () => {
    const { service } = createEnvironment({
        database: null
    });

    assert.deepEqual(
        service.getPreviousGyms("PEWTER_GYM"),
        []
    );
});

// --------------------------------------------------
// canChallengeGym: basic eligibility
// --------------------------------------------------

test("canChallengeGym allows a gym with no requirements", () => {
    const gyms = [
        { id: "PEWTER_GYM", order: 1 }
    ];

    const { service } = createEnvironment({ gyms });
    const { state } = createTrainerState();

    assert.deepEqual(
        service.canChallengeGym("PEWTER_GYM", state),
        { allowed: true }
    );
});

test("canChallengeGym allows a gym with an empty requirements object", () => {
    const gyms = [
        {
            id: "PEWTER_GYM",
            order: 1,
            requirements: {}
        }
    ];

    const { service } = createEnvironment({ gyms });
    const { state } = createTrainerState();

    assert.deepEqual(
        service.canChallengeGym("PEWTER_GYM", state),
        { allowed: true }
    );
});

test("canChallengeGym rejects an unknown gym", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.deepEqual(
        service.canChallengeGym("UNKNOWN_GYM", state),
        {
            allowed: false,
            reason: "Unknown gym"
        }
    );
});

test("canChallengeGym checks whether the gym has been defeated", () => {
    const { service } = createEnvironment();
    const { state, calls } = createTrainerState();

    service.canChallengeGym("PEWTER_GYM", state);

    assert.deepEqual(
        calls.hasCompletedBattle,
        ["PEWTER_GYM"]
    );
});

test("canChallengeGym rejects an already defeated gym", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        completedBattles: ["PEWTER_GYM"]
    });

    assert.deepEqual(
        service.canChallengeGym("PEWTER_GYM", state),
        {
            allowed: false,
            reason: "Gym already defeated"
        }
    );
});

test("canChallengeGym permits a gym that has not been defeated", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.deepEqual(
        service.canChallengeGym("PEWTER_GYM", state),
        { allowed: true }
    );
});

test("canChallengeGym skips completion checking when the method is absent", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    delete state.hasCompletedBattle;

    assert.deepEqual(
        service.canChallengeGym("PEWTER_GYM", state),
        { allowed: true }
    );
});

test("canChallengeGym stops immediately for an unknown gym", () => {
    const database = {
        getGym() {
            return null;
        },

        getAllGyms() {
            return [];
        }
    };

    const service = new GymProgressionService(database);
    const { state, calls } = createTrainerState();

    service.canChallengeGym("UNKNOWN_GYM", state);

    assert.deepEqual(calls.hasCompletedBattle, []);
});

test("canChallengeGym does not evaluate requirements for a defeated gym", () => {
    const gyms = [
        {
            id: "PEWTER_GYM",
            order: 1,
            requirements: {
                storyFlags: ["OAK_PARCEL"]
            }
        }
    ];

    const { service } = createEnvironment({ gyms });

    const { state, calls } = createTrainerState({
        completedBattles: ["PEWTER_GYM"]
    });

    service.canChallengeGym("PEWTER_GYM", state);

    assert.deepEqual(calls.hasStoryFlag, []);
});

// --------------------------------------------------
// canChallengeGym: requirement failures
// --------------------------------------------------

test("canChallengeGym rejects missing story flags", () => {
    const gyms = [
        {
            id: "PEWTER_GYM",
            order: 1,
            requirements: {
                storyFlags: ["OAK_PARCEL"]
            }
        }
    ];

    const { service } = createEnvironment({ gyms });
    const { state } = createTrainerState();

    assert.deepEqual(
        service.canChallengeGym("PEWTER_GYM", state),
        {
            allowed: false,
            reason: "Missing story requirement"
        }
    );
});

test("canChallengeGym rejects missing badges", () => {
    const gyms = [
        {
            id: "CERULEAN_GYM",
            order: 2,
            requirements: {
                badges: ["BOULDER_BADGE"]
            }
        }
    ];

    const { service } = createEnvironment({ gyms });
    const { state } = createTrainerState();

    assert.deepEqual(
        service.canChallengeGym("CERULEAN_GYM", state),
        {
            allowed: false,
            reason: "Missing badge requirement"
        }
    );
});

test("canChallengeGym rejects missing HM abilities", () => {
    const gyms = [
        {
            id: "CERULEAN_GYM",
            order: 2,
            requirements: {
                hms: ["CUT"]
            }
        }
    ];

    const { service } = createEnvironment({ gyms });
    const { state } = createTrainerState();

    assert.deepEqual(
        service.canChallengeGym("CERULEAN_GYM", state),
        {
            allowed: false,
            reason: "Missing HM requirement"
        }
    );
});

test("canChallengeGym rejects missing key items", () => {
    const gyms = [
        {
            id: "VERMILION_GYM",
            order: 3,
            requirements: {
                keyItems: ["SS_TICKET"]
            }
        }
    ];

    const { service } = createEnvironment({ gyms });
    const { state } = createTrainerState();

    assert.deepEqual(
        service.canChallengeGym("VERMILION_GYM", state),
        {
            allowed: false,
            reason: "Missing key item requirement"
        }
    );
});

test("canChallengeGym returns the map access denial result", () => {
    const gyms = [
        {
            id: "CERULEAN_GYM",
            order: 2,
            requirements: {
                access: "MAP_CERULEAN_CITY"
            }
        }
    ];

    const mapAccess = createMapAccess({
        allowed: false
    });

    const { service } = createEnvironment({
        gyms,
        mapAccess
    });

    const { state } = createTrainerState();

    assert.deepEqual(
        service.canChallengeGym("CERULEAN_GYM", state),
        { allowed: false }
    );
});

test("canChallengeGym allows a gym when all requirements are met", () => {
    const gyms = [
        {
            id: "CERULEAN_GYM",
            order: 2,
            requirements: {
                storyFlags: ["BRIDGE_CLEARED"],
                badges: ["BOULDER_BADGE"],
                hms: ["CUT"],
                keyItems: ["SS_TICKET"],
                access: "MAP_CERULEAN_CITY"
            }
        }
    ];

    const mapAccess = createMapAccess();

    const { service } = createEnvironment({
        gyms,
        mapAccess
    });

    const { state } = createTrainerState({
        storyFlags: ["BRIDGE_CLEARED"],
        badges: ["BOULDER_BADGE"],
        hmAbilities: ["CUT"],
        keyItems: ["SS_TICKET"]
    });

    assert.deepEqual(
        service.canChallengeGym("CERULEAN_GYM", state),
        { allowed: true }
    );
});

test("canChallengeGym checks requirements in the expected order", () => {
    const order = [];

    const gyms = [
        {
            id: "CERULEAN_GYM",
            order: 2,
            requirements: {
                storyFlags: ["FLAG"],
                badges: ["BADGE"],
                hms: ["CUT"],
                keyItems: ["KEY"],
                access: "MAP_CERULEAN_CITY"
            }
        }
    ];

    const mapAccess = {
        canAccess() {
            order.push("access");
            return { allowed: true };
        }
    };

    const { service } = createEnvironment({
        gyms,
        mapAccess
    });

    const { state } = createTrainerState({
        hasStoryFlag() {
            order.push("story");
            return true;
        },
        hasBadge() {
            order.push("badge");
            return true;
        },
        hasKeyItem() {
            order.push("keyItem");
            return true;
    }
    });

    state.hmAbilities = ["CUT"];

    service.canChallengeGym("CERULEAN_GYM", state);

    assert.deepEqual(
        order,
        ["story", "badge", "keyItem", "access"]
    );
});

test("canChallengeGym stops when the story requirement fails", () => {
    const gyms = [
        {
            id: "PEWTER_GYM",
            order: 1,
            requirements: {
                storyFlags: ["FLAG"],
                badges: ["BADGE"]
            }
        }
    ];

    const { service } = createEnvironment({ gyms });
    const { state, calls } = createTrainerState();

    service.canChallengeGym("PEWTER_GYM", state);

    assert.deepEqual(calls.hasStoryFlag, ["FLAG"]);
    assert.deepEqual(calls.hasBadge, []);
});

test("canChallengeGym stops when the badge requirement fails", () => {
    const gyms = [
        {
            id: "PEWTER_GYM",
            order: 1,
            requirements: {
                storyFlags: ["FLAG"],
                badges: ["BADGE"],
                hms: ["CUT"]
            }
        }
    ];

    const { service } = createEnvironment({ gyms });
    const { state, calls } = createTrainerState({
        storyFlags: ["FLAG"]
    });

    service.canChallengeGym("PEWTER_GYM", state);

    assert.deepEqual(calls.hasStoryFlag, ["FLAG"]);
    assert.deepEqual(calls.hasBadge, ["BADGE"]);
    assert.deepEqual(calls.hasKeyItem, []);
});

// --------------------------------------------------
// Story flags
// --------------------------------------------------

test("checkStoryFlags returns true when no story flags are required", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.checkStoryFlags({}, state),
        true
    );
});

test("checkStoryFlags accepts an empty story flag list", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.checkStoryFlags({ storyFlags: [] }, state),
        true
    );
});

test("checkStoryFlags returns true when all story flags are present", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        storyFlags: ["FLAG_A", "FLAG_B"]
    });

    assert.equal(
        service.checkStoryFlags({
            storyFlags: ["FLAG_A", "FLAG_B"]
        }, state),
        true
    );
});

test("checkStoryFlags returns false when a story flag is missing", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        storyFlags: ["FLAG_A"]
    });

    assert.equal(
        service.checkStoryFlags({
            storyFlags: ["FLAG_A", "FLAG_B"]
        }, state),
        false
    );
});

test("checkStoryFlags stops after the first missing flag", () => {
    const { service } = createEnvironment();
    const { state, calls } = createTrainerState();

    service.checkStoryFlags({
        storyFlags: ["FLAG_A", "FLAG_B"]
    }, state);

    assert.deepEqual(calls.hasStoryFlag, ["FLAG_A"]);
});

test("checkStoryFlags uses the hasStoryFlag helper", () => {
    const { service } = createEnvironment();

    const { state, calls } = createTrainerState({
        hasStoryFlag() {
            return true;
        }
    });

    service.checkStoryFlags({
        storyFlags: ["CUSTOM_FLAG"]
    }, state);

    assert.deepEqual(calls.hasStoryFlag, ["CUSTOM_FLAG"]);
});

// --------------------------------------------------
// Badges
// --------------------------------------------------

test("checkBadges returns true when no badges are required", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.checkBadges({}, state),
        true
    );
});

test("checkBadges accepts an empty badge list", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.checkBadges({ badges: [] }, state),
        true
    );
});

test("checkBadges returns true when all required badges are owned", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        badges: ["BOULDER_BADGE", "CASCADE_BADGE"]
    });

    assert.equal(
        service.checkBadges({
            badges: ["BOULDER_BADGE", "CASCADE_BADGE"]
        }, state),
        true
    );
});

test("checkBadges returns false when a badge is missing", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        badges: ["BOULDER_BADGE"]
    });

    assert.equal(
        service.checkBadges({
            badges: ["BOULDER_BADGE", "CASCADE_BADGE"]
        }, state),
        false
    );
});

test("checkBadges stops after the first missing badge", () => {
    const { service } = createEnvironment();
    const { state, calls } = createTrainerState();

    service.checkBadges({
        badges: ["BOULDER_BADGE", "CASCADE_BADGE"]
    }, state);

    assert.deepEqual(
        calls.hasBadge,
        ["BOULDER_BADGE"]
    );
});

test("checkBadges uses the hasBadge helper", () => {
    const { service } = createEnvironment();

    const { state, calls } = createTrainerState({
        hasBadge() {
            return true;
        }
    });

    service.checkBadges({
        badges: ["CUSTOM_BADGE"]
    }, state);

    assert.deepEqual(
        calls.hasBadge,
        ["CUSTOM_BADGE"]
    );
});

// --------------------------------------------------
// HM abilities
// --------------------------------------------------

test("checkHMs returns true when no HMs are required", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.checkHMs({}, state),
        true
    );
});

test("checkHMs accepts an empty HM list", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.checkHMs({ hms: [] }, state),
        true
    );
});

test("checkHMs accepts required abilities from hmAbilities", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        hmAbilities: ["CUT", "SURF"]
    });

    assert.equal(
        service.checkHMs({
            hms: ["CUT", "SURF"]
        }, state),
        true
    );
});

test("checkHMs also accepts required abilities from hms", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        hms: ["CUT"]
    });

    assert.equal(
        service.checkHMs({
            hms: ["CUT"]
        }, state),
        true
    );
});

test("checkHMs returns false when an ability is absent", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.checkHMs({
            hms: ["CUT"]
        }, state),
        false
    );
});

test("checkHMs uses exact ability matching", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        hmAbilities: ["can_use_cut"]
    });

    assert.equal(
        service.checkHMs({
            hms: ["CUT"]
        }, state),
        false
    );
});

test("checkHMs succeeds when the ability is in either supported list", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        hmAbilities: ["SURF"]
    });

    assert.equal(
        service.checkHMs({
            hms: ["SURF"]
        }, state),
        true
    );
});

test("checkHMs stops after the first missing ability", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        hmAbilities: ["CUT"]
    });

    assert.equal(
        service.checkHMs({
            hms: ["CUT", "SURF", "STRENGTH"]
        }, state),
        false
    );
});

// --------------------------------------------------
// Key items
// --------------------------------------------------

test("checkKeyItems returns true when no key items are required", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.checkKeyItems({}, state),
        true
    );
});

test("checkKeyItems accepts an empty key item list", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.checkKeyItems({ keyItems: [] }, state),
        true
    );
});

test("checkKeyItems returns true when all required items are present", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        keyItems: ["SS_TICKET", "BICYCLE"]
    });

    assert.equal(
        service.checkKeyItems({
            keyItems: ["SS_TICKET", "BICYCLE"]
        }, state),
        true
    );
});

test("checkKeyItems returns false when a required item is missing", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        keyItems: ["SS_TICKET"]
    });

    assert.equal(
        service.checkKeyItems({
            keyItems: ["SS_TICKET", "BICYCLE"]
        }, state),
        false
    );
});

test("checkKeyItems uses the hasKeyItem helper", () => {
    const { service } = createEnvironment();

    const { state, calls } = createTrainerState({
        hasKeyItem() {
            return true;
        }
    });

    service.checkKeyItems({
        keyItems: ["CUSTOM_ITEM"]
    }, state);

    assert.deepEqual(
        calls.hasKeyItem,
        ["CUSTOM_ITEM"]
    );
});

// --------------------------------------------------
// Map access
// --------------------------------------------------

test("checkAccess delegates to map access when configured", () => {
    const mapAccess = createMapAccess();
    const { service } = createEnvironment({ mapAccess });
    const { state } = createTrainerState();

    service.checkAccess("MAP_CERULEAN_CITY", state);

    assert.equal(mapAccess.calls.length, 1);
    assert.equal(
        mapAccess.calls[0].location,
        "MAP_CERULEAN_CITY"
    );
});

test("checkAccess forwards trainer state to map access", () => {
    const mapAccess = createMapAccess();
    const { service } = createEnvironment({ mapAccess });
    const { state } = createTrainerState();

    service.checkAccess("MAP_CERULEAN_CITY", state);

    assert.strictEqual(
        mapAccess.calls[0].trainerState,
        state
    );
});

test("checkAccess returns the map access service result unchanged", () => {
    const expected = {
        allowed: false,
        reason: "Location not reached"
    };

    const mapAccess = {
        canAccess() {
            return expected;
        }
    };

    const { service } = createEnvironment({ mapAccess });
    const { state } = createTrainerState();

    assert.strictEqual(
        service.checkAccess("MAP_CERULEAN_CITY", state),
        expected
    );
});

test("checkAccess uses visitedLocations when map access is absent", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState({
        visitedLocations: ["MAP_PALLET_TOWN"]
    });

    assert.deepEqual(
        service.checkAccess("MAP_PALLET_TOWN", state),
        { allowed: true }
    );
});

test("checkAccess denies locations that have not been visited", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.deepEqual(
        service.checkAccess("MAP_CERULEAN_CITY", state),
        { allowed: false }
    );
});

test("checkAccess defaults missing visitedLocations to an empty array", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.checkAccess("MAP_PALLET_TOWN", {}),
        { allowed: false }
    );
});

test("checkAccess propagates map access errors", () => {
    const mapAccess = {
        canAccess() {
            throw new Error("Map access failed");
        }
    };

    const { service } = createEnvironment({ mapAccess });

    assert.throws(
        () => service.checkAccess("MAP_CERULEAN_CITY", {}),
        /Map access failed/
    );
});

// --------------------------------------------------
// hasHM
// --------------------------------------------------

test("hasHM finds an ability in hmAbilities", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState({
        hmAbilities: ["CUT"]
    });

    assert.equal(service.hasHM("CUT", state), true);
});

test("hasHM finds an ability in hms", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState({
        hms: ["SURF"]
    });

    assert.equal(service.hasHM("SURF", state), true);
});

test("hasHM returns false when the ability is missing", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(service.hasHM("CUT", state), false);
});

test("hasHM checks both ability lists", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState({
        hmAbilities: ["CUT"],
        hms: ["SURF"]
    });

    assert.equal(service.hasHM("CUT", state), true);
    assert.equal(service.hasHM("SURF", state), true);
});

test("hasHM does not use case-insensitive matching", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState({
        hmAbilities: ["cut"]
    });

    assert.equal(service.hasHM("CUT", state), false);
});

test("hasHM handles missing ability lists", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.hasHM("CUT", {}),
        false
    );
});

// --------------------------------------------------
// hasKeyItem
// --------------------------------------------------

test("hasKeyItem finds an item in the keyItems array", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState({
        keyItems: ["BICYCLE"]
    });

    assert.equal(
        service.hasKeyItem("BICYCLE", state),
        true
    );
});

test("hasKeyItem returns false when an item is absent", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.hasKeyItem("BICYCLE", state),
        false
    );
});

test("hasKeyItem delegates to the trainer state method when available", () => {
    const { service } = createEnvironment();
    const calls = [];

    const state = {
        hasKeyItem(item) {
            calls.push(item);
            return true;
        },
        keyItems: []
    };

    assert.equal(
        service.hasKeyItem("BICYCLE", state),
        true
    );

    assert.deepEqual(calls, ["BICYCLE"]);
});

test("hasKeyItem prefers the trainer state method over the array", () => {
    const { service } = createEnvironment();

    const state = {
        keyItems: ["BICYCLE"],

        hasKeyItem() {
            return false;
        }
    };

    assert.equal(
        service.hasKeyItem("BICYCLE", state),
        false
    );
});

test("hasKeyItem handles a missing keyItems array", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.hasKeyItem("BICYCLE", {}),
        false
    );
});

// --------------------------------------------------
// hasStoryFlag
// --------------------------------------------------

test("hasStoryFlag finds a flag in storyFlags", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState({
        storyFlags: ["OAK_PARCEL"]
    });

    assert.equal(
        service.hasStoryFlag("OAK_PARCEL", state),
        true
    );
});

test("hasStoryFlag returns false when the flag is missing", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.hasStoryFlag("OAK_PARCEL", state),
        false
    );
});

test("hasStoryFlag delegates to the trainer state method when available", () => {
    const { service } = createEnvironment();
    const calls = [];

    const state = {
        hasStoryFlag(flag) {
            calls.push(flag);
            return true;
        },
        storyFlags: []
    };

    assert.equal(
        service.hasStoryFlag("OAK_PARCEL", state),
        true
    );

    assert.deepEqual(calls, ["OAK_PARCEL"]);
});

test("hasStoryFlag prefers the trainer state method over the array", () => {
    const { service } = createEnvironment();

    const state = {
        storyFlags: ["OAK_PARCEL"],

        hasStoryFlag() {
            return false;
        }
    };

    assert.equal(
        service.hasStoryFlag("OAK_PARCEL", state),
        false
    );
});

test("hasStoryFlag handles a missing storyFlags array", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.hasStoryFlag("OAK_PARCEL", {}),
        false
    );
});

// --------------------------------------------------
// playerHasBadge
// --------------------------------------------------

test("playerHasBadge finds a badge in the badges array", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState({
        badges: ["BOULDER_BADGE"]
    });

    assert.equal(
        service.playerHasBadge("BOULDER_BADGE", state),
        true
    );
});

test("playerHasBadge returns false when the badge is absent", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.playerHasBadge("BOULDER_BADGE", state),
        false
    );
});

test("playerHasBadge delegates to the trainer state method when available", () => {
    const { service } = createEnvironment();
    const calls = [];

    const state = {
        hasBadge(badge) {
            calls.push(badge);
            return true;
        },
        badges: []
    };

    assert.equal(
        service.playerHasBadge("BOULDER_BADGE", state),
        true
    );

    assert.deepEqual(calls, ["BOULDER_BADGE"]);
});

test("playerHasBadge prefers the trainer state method over the array", () => {
    const { service } = createEnvironment();

    const state = {
        badges: ["BOULDER_BADGE"],

        hasBadge() {
            return false;
        }
    };

    assert.equal(
        service.playerHasBadge("BOULDER_BADGE", state),
        false
    );
});

test("playerHasBadge handles a missing badges array", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.playerHasBadge("BOULDER_BADGE", {}),
        false
    );
});

// --------------------------------------------------
// getAvailableGyms
// --------------------------------------------------

test("getAvailableGyms returns an array", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.ok(
        Array.isArray(service.getAvailableGyms(state))
    );
});

test("getAvailableGyms returns all gyms when none have requirements", () => {
    const gyms = [
        { id: "GYM_A", order: 1 },
        { id: "GYM_B", order: 2 },
        { id: "GYM_C", order: 3 }
    ];

    const { service } = createEnvironment({ gyms });
    const { state } = createTrainerState();

    assert.deepEqual(
        service.getAvailableGyms(state).map(gym => gym.id),
        ["GYM_A", "GYM_B", "GYM_C"]
    );
});

test("getAvailableGyms excludes already defeated gyms", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        completedBattles: ["PEWTER_GYM"]
    });

    assert.deepEqual(
        service.getAvailableGyms(state).map(gym => gym.id),
        [
            "CERULEAN_GYM",
            "VERMILION_GYM",
            "FUCHSIA_GYM"
        ]
    );
});

test("getAvailableGyms excludes gyms with unmet requirements", () => {
    const gyms = [
        {
            id: "GYM_A",
            order: 1
        },
        {
            id: "GYM_B",
            order: 2,
            requirements: {
                badges: ["BOULDER_BADGE"]
            }
        }
    ];

    const { service } = createEnvironment({ gyms });
    const { state } = createTrainerState();

    assert.deepEqual(
        service.getAvailableGyms(state).map(gym => gym.id),
        ["GYM_A"]
    );
});

test("getAvailableGyms allows gyms when their requirements are fulfilled", () => {
    const gyms = [
        {
            id: "GYM_A",
            order: 1
        },
        {
            id: "GYM_B",
            order: 2,
            requirements: {
                badges: ["BOULDER_BADGE"]
            }
        }
    ];

    const { service } = createEnvironment({ gyms });

    const { state } = createTrainerState({
        badges: ["BOULDER_BADGE"]
    });

    assert.deepEqual(
        service.getAvailableGyms(state).map(gym => gym.id),
        ["GYM_A", "GYM_B"]
    );
});

test("getAvailableGyms returns an empty array when the database is absent", () => {
    const { service } = createEnvironment({
        database: null
    });

    const { state } = createTrainerState();

    assert.deepEqual(
        service.getAvailableGyms(state),
        []
    );
});

// --------------------------------------------------
// getRecommendedNextGyms
// --------------------------------------------------

test("getRecommendedNextGyms returns an array", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.ok(
        Array.isArray(service.getRecommendedNextGyms(state))
    );
});

test("getRecommendedNextGyms selects the available gym with the lowest order", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.deepEqual(
        service.getRecommendedNextGyms(state).map(gym => gym.id),
        ["PEWTER_GYM"]
    );
});

test("getRecommendedNextGyms advances after the first gym is defeated", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        completedBattles: ["PEWTER_GYM"]
    });

    assert.deepEqual(
        service.getRecommendedNextGyms(state).map(gym => gym.id),
        ["CERULEAN_GYM"]
    );
});

test("getRecommendedNextGyms returns an empty array when all gyms are defeated", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        completedBattles: [
            "PEWTER_GYM",
            "CERULEAN_GYM",
            "VERMILION_GYM",
            "FUCHSIA_GYM"
        ]
    });

    assert.deepEqual(
        service.getRecommendedNextGyms(state),
        []
    );
});

test("getRecommendedNextGyms returns all available gyms tied for the lowest order", () => {
    const gyms = [
        { id: "GYM_A", order: 1 },
        { id: "GYM_B", order: 1 },
        { id: "GYM_C", order: 2 }
    ];

    const { service } = createEnvironment({ gyms });
    const { state } = createTrainerState();

    assert.deepEqual(
        service.getRecommendedNextGyms(state).map(gym => gym.id),
        ["GYM_A", "GYM_B"]
    );
});

test("getRecommendedNextGyms considers availability before order", () => {
    const gyms = [
        {
            id: "GYM_A",
            order: 1,
            requirements: {
                badges: ["UNOWNED_BADGE"]
            }
        },
        { id: "GYM_B", order: 2 }
    ];

    const { service } = createEnvironment({ gyms });
    const { state } = createTrainerState();

    assert.deepEqual(
        service.getRecommendedNextGyms(state).map(gym => gym.id),
        ["GYM_B"]
    );
});

// --------------------------------------------------
// getNextUncompletedGym
// --------------------------------------------------

test("getNextUncompletedGym returns the first gym when none are completed", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.getNextUncompletedGym(state).id,
        "PEWTER_GYM"
    );
});

test("getNextUncompletedGym skips completed gyms", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        completedBattles: [
            "PEWTER_GYM",
            "CERULEAN_GYM"
        ]
    });

    assert.equal(
        service.getNextUncompletedGym(state).id,
        "VERMILION_GYM"
    );
});

test("getNextUncompletedGym returns null when every gym is completed", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        completedBattles: [
            "PEWTER_GYM",
            "CERULEAN_GYM",
            "VERMILION_GYM",
            "FUCHSIA_GYM"
        ]
    });

    assert.equal(
        service.getNextUncompletedGym(state),
        null
    );
});

test("getNextUncompletedGym sorts gyms by order before selecting", () => {
    const gyms = [
        { id: "GYM_C", order: 3 },
        { id: "GYM_A", order: 1 },
        { id: "GYM_B", order: 2 }
    ];

    const { service } = createEnvironment({ gyms });
    const { state } = createTrainerState();

    assert.equal(
        service.getNextUncompletedGym(state).id,
        "GYM_A"
    );
});

test("getNextUncompletedGym selects the next incomplete gym after a completed one", () => {
    const gyms = [
        { id: "GYM_A", order: 1 },
        { id: "GYM_B", order: 2 },
        { id: "GYM_C", order: 3 }
    ];

    const { service } = createEnvironment({ gyms });

    const { state } = createTrainerState({
        completedBattles: ["GYM_A", "GYM_B"]
    });

    assert.equal(
        service.getNextUncompletedGym(state).id,
        "GYM_C"
    );
});

test("getNextUncompletedGym returns null for an empty database", () => {
    const { service } = createEnvironment({ gyms: [] });
    const { state } = createTrainerState();

    assert.equal(
        service.getNextUncompletedGym(state),
        null
    );
});

test("getNextUncompletedGym treats missing completion methods as incomplete", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    delete state.hasCompletedBattle;

    assert.equal(
        service.getNextUncompletedGym(state).id,
        "PEWTER_GYM"
    );
});

// --------------------------------------------------
// hasBadge
// --------------------------------------------------

test("hasBadge returns true when the player owns the gym badge", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        badges: ["BOULDER_BADGE"]
    });

    assert.equal(
        service.hasBadge("PEWTER_GYM", state),
        true
    );
});

test("hasBadge returns false when the player does not own the badge", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.hasBadge("PEWTER_GYM", state),
        false
    );
});

test("hasBadge returns false for an unknown gym", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.hasBadge("UNKNOWN_GYM", state),
        false
    );
});

test("hasBadge delegates ownership checks to playerHasBadge", () => {
    const { service } = createEnvironment();

    const { state, calls } = createTrainerState({
        badges: ["CASCADE_BADGE"]
    });

    service.hasBadge("CERULEAN_GYM", state);

    assert.deepEqual(calls.hasBadge, ["CASCADE_BADGE"]);
});

test("hasBadge supports custom trainer state methods", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        hasBadge(badge) {
            return badge === "BOULDER_BADGE";
        }
    });

    assert.equal(
        service.hasBadge("PEWTER_GYM", state),
        true
    );
});

// --------------------------------------------------
// Statistics
// --------------------------------------------------

test("getGymCount returns the total number of gyms", () => {
    const { service } = createEnvironment();

    assert.equal(service.getGymCount(), 4);
});

test("getGymCount returns zero for an empty database", () => {
    const { service } = createEnvironment({ gyms: [] });

    assert.equal(service.getGymCount(), 0);
});

test("getGymCount returns zero when the database is absent", () => {
    const { service } = createEnvironment({
        database: null
    });

    assert.equal(service.getGymCount(), 0);
});

test("getCompletedGymCount returns zero when no gyms are completed", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    assert.equal(
        service.getCompletedGymCount(state),
        0
    );
});

test("getCompletedGymCount counts completed gyms", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        completedBattles: [
            "PEWTER_GYM",
            "VERMILION_GYM"
        ]
    });

    assert.equal(
        service.getCompletedGymCount(state),
        2
    );
});

test("getCompletedGymCount returns the total when every gym is completed", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        completedBattles: [
            "PEWTER_GYM",
            "CERULEAN_GYM",
            "VERMILION_GYM",
            "FUCHSIA_GYM"
        ]
    });

    assert.equal(
        service.getCompletedGymCount(state),
        4
    );
});

test("getCompletedGymCount ignores completion IDs that are not gyms", () => {
    const { service } = createEnvironment();

    const { state } = createTrainerState({
        completedBattles: [
            "PEWTER_GYM",
            "UNKNOWN_GYM"
        ]
    });

    assert.equal(
        service.getCompletedGymCount(state),
        1
    );
});

test("getCompletedGymCount returns zero when the completion method is absent", () => {
    const { service } = createEnvironment();
    const { state } = createTrainerState();

    delete state.hasCompletedBattle;

    assert.equal(
        service.getCompletedGymCount(state),
        0
    );
});

test("getCompletedGymCount returns zero for an empty database", () => {
    const { service } = createEnvironment({ gyms: [] });
    const { state } = createTrainerState();

    assert.equal(
        service.getCompletedGymCount(state),
        0
    );
});

test("getCompletedGymCount checks completion using each gym ID", () => {
    const { service } = createEnvironment();

    const { state, calls } = createTrainerState();

    service.getCompletedGymCount(state);

    assert.deepEqual(
        calls.hasCompletedBattle,
        [
            "PEWTER_GYM",
            "CERULEAN_GYM",
            "VERMILION_GYM",
            "FUCHSIA_GYM"
        ]
    );
});

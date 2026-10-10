"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GymEventService = require("../scripts/services/gym-event-service");

// --------------------------------------------------
// Fixtures
// --------------------------------------------------

function createGyms() {
    return {
        PEWTER_GYM: {
            id: "PEWTER_GYM",
            city: "Pewter City",
            trainer: "Brock",
            badge: "BOULDER_BADGE",
            battleEvent: "BATTLE_BROCK"
        },

        CERULEAN_GYM: {
            id: "CERULEAN_GYM",
            city: "Cerulean City",
            trainer: "Misty",
            badge: "CASCADE_BADGE",
            battleEvent: "BATTLE_MISTY"
        },

        FUCHSIA_GYM: {
            id: "FUCHSIA_GYM",
            city: "Fuchsia City",
            trainer: "Koga",
            badge: "SOUL_BADGE",
            battleEvent: "BATTLE_KOGA"
        },

        NO_EVENT_GYM: {
            id: "NO_EVENT_GYM",
            trainer: "Unknown Trainer",
            badge: "TEST_BADGE"
        },

        NO_BADGE_GYM: {
            id: "NO_BADGE_GYM",
            trainer: "No Badge Trainer",
            battleEvent: "BATTLE_NO_BADGE"
        },

        MINIMAL_GYM: {
            id: "MINIMAL_GYM"
        }
    };
}

function createRewards() {
    return {
        PEWTER_GYM: {
            money: 1500,
            items: ["TM39", "POTION"],
            hmAbilities: ["CUT"]
        },

        CERULEAN_GYM: {
            money: 2500,
            items: ["TM11"],
            hmAbilities: ["SURF"]
        },

        FUCHSIA_GYM: {
            money: 3500,
            items: ["TM06"],
            hmAbilities: ["STRENGTH"]
        },

        NO_EVENT_GYM: {
            money: 500,
            items: ["POTION"],
            hmAbilities: []
        },

        NO_BADGE_GYM: {
            money: 750,
            items: [],
            hmAbilities: []
        },

        MINIMAL_GYM: {}
    };
}

function createEnvironment(options = {}) {
    const gyms = options.gyms || createGyms();
    const rewards = options.rewards || createRewards();

    const calls = {
        getGym: [],
        getRewards: [],
        getAllGyms: 0
    };

    const database = {
        getGym(gymId) {
            calls.getGym.push(gymId);

            return Object.prototype.hasOwnProperty.call(gyms, gymId)
                ? gyms[gymId]
                : null;
        },

        getRewards(gymId) {
            calls.getRewards.push(gymId);

            return Object.prototype.hasOwnProperty.call(rewards, gymId)
                ? rewards[gymId]
                : null;
        },

        getAllGyms() {
            calls.getAllGyms += 1;

            return options.allGyms || Object.values(gyms);
        }
    };

    return {
        gyms,
        rewards,
        database,
        calls,
        service: new GymEventService(database)
    };
}

function createTrainerState(options = {}) {
    const calls = {
        hasCompletedEvent: [],
        addBadge: [],
        addItem: [],
        addHMAbility: [],
        completeBattle: [],
        completeEvent: [],
        actions: []
    };

    const completedEvents = new Set(
        options.completedEvents || []
    );

    const state = {
        hasCompletedEvent(eventId) {
            calls.hasCompletedEvent.push(eventId);

            if (typeof options.hasCompletedEvent === "function") {
                return options.hasCompletedEvent(eventId);
            }

            return completedEvents.has(eventId);
        },

        addBadge(badge) {
            calls.addBadge.push(badge);
            calls.actions.push(["addBadge", badge]);
        },

        addItem(item) {
            calls.addItem.push(item);
            calls.actions.push(["addItem", item]);
        },

        addHMAbility(ability) {
            calls.addHMAbility.push(ability);
            calls.actions.push(["addHMAbility", ability]);
        },

        completeBattle(gymId) {
            calls.completeBattle.push(gymId);
            calls.actions.push(["completeBattle", gymId]);
        }
    };

    if (options.includeCompleteEvent !== false) {
        state.completeEvent = function (eventId) {
            calls.completeEvent.push(eventId);
            calls.actions.push(["completeEvent", eventId]);
        };
    }

    return {
        state,
        calls,
        completedEvents
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a GymEventService instance", () => {
    const { service } = createEnvironment();

    assert.ok(service instanceof GymEventService);
});

test("constructor stores the supplied database service", () => {
    const { service, database } = createEnvironment();

    assert.equal(service.database, database);
});

test("constructor does not load gym records independently", () => {
    const database = {
        getGym() {
            return null;
        }
    };

    const service = new GymEventService(database);

    assert.equal(service.database, database);
});

// --------------------------------------------------
// getGymEvent
// --------------------------------------------------

test("getGymEvent returns the requested gym", () => {
    const { service, gyms } = createEnvironment();

    assert.equal(
        service.getGymEvent("PEWTER_GYM"),
        gyms.PEWTER_GYM
    );
});

test("getGymEvent delegates to the database service", () => {
    const { service, calls } = createEnvironment();

    service.getGymEvent("CERULEAN_GYM");

    assert.deepEqual(calls.getGym, ["CERULEAN_GYM"]);
});

test("getGymEvent returns the original gym object", () => {
    const { service, gyms } = createEnvironment();

    assert.strictEqual(
        service.getGymEvent("PEWTER_GYM"),
        gyms.PEWTER_GYM
    );
});

test("getGymEvent returns null for an unknown gym", () => {
    const { service } = createEnvironment();

    assert.equal(service.getGymEvent("UNKNOWN_GYM"), null);
});

test("getGymEvent returns null for an empty ID", () => {
    const { service } = createEnvironment();

    assert.equal(service.getGymEvent(""), null);
});

test("getGymEvent returns null for a null ID", () => {
    const { service } = createEnvironment();

    assert.equal(service.getGymEvent(null), null);
});

test("getGymEvent preserves the database result when it is undefined", () => {
    const database = {
        getGym() {
            return undefined;
        }
    };

    const service = new GymEventService(database);

    assert.equal(service.getGymEvent("PEWTER_GYM"), undefined);
});

test("getGymEvent propagates database errors", () => {
    const database = {
        getGym() {
            throw new Error("Database lookup failed");
        }
    };

    const service = new GymEventService(database);

    assert.throws(
        () => service.getGymEvent("PEWTER_GYM"),
        /Database lookup failed/
    );
});

// --------------------------------------------------
// getEventId
// --------------------------------------------------

test("getEventId returns the Pewter Gym battle event", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getEventId("PEWTER_GYM"),
        "BATTLE_BROCK"
    );
});

test("getEventId returns the Cerulean Gym battle event", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getEventId("CERULEAN_GYM"),
        "BATTLE_MISTY"
    );
});

test("getEventId returns the Fuchsia Gym battle event", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getEventId("FUCHSIA_GYM"),
        "BATTLE_KOGA"
    );
});

test("getEventId returns null for an unknown gym", () => {
    const { service } = createEnvironment();

    assert.equal(service.getEventId("UNKNOWN_GYM"), null);
});

test("getEventId returns undefined when the gym has no battle event", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getEventId("NO_EVENT_GYM"),
        undefined
    );
});

test("getEventId preserves a null battle event", () => {
    const gyms = createGyms();
    gyms.NO_EVENT_GYM.battleEvent = null;

    const { service } = createEnvironment({ gyms });

    assert.equal(service.getEventId("NO_EVENT_GYM"), null);
});

test("getEventId preserves an empty battle event ID", () => {
    const gyms = createGyms();
    gyms.NO_EVENT_GYM.battleEvent = "";

    const { service } = createEnvironment({ gyms });

    assert.equal(service.getEventId("NO_EVENT_GYM"), "");
});

test("getEventId looks up the gym through getGymEvent", () => {
    const { service, calls } = createEnvironment();

    service.getEventId("PEWTER_GYM");

    assert.deepEqual(calls.getGym, ["PEWTER_GYM"]);
});

// --------------------------------------------------
// getTrainer
// --------------------------------------------------

test("getTrainer returns Brock for Pewter Gym", () => {
    const { service } = createEnvironment();

    assert.equal(service.getTrainer("PEWTER_GYM"), "Brock");
});

test("getTrainer returns Misty for Cerulean Gym", () => {
    const { service } = createEnvironment();

    assert.equal(service.getTrainer("CERULEAN_GYM"), "Misty");
});

test("getTrainer returns Koga for Fuchsia Gym", () => {
    const { service } = createEnvironment();

    assert.equal(service.getTrainer("FUCHSIA_GYM"), "Koga");
});

test("getTrainer returns null for an unknown gym", () => {
    const { service } = createEnvironment();

    assert.equal(service.getTrainer("UNKNOWN_GYM"), null);
});

test("getTrainer returns undefined when the gym has no trainer", () => {
    const { service } = createEnvironment();

    assert.equal(service.getTrainer("MINIMAL_GYM"), undefined);
});

test("getTrainer preserves a null trainer value", () => {
    const gyms = createGyms();
    gyms.MINIMAL_GYM.trainer = null;

    const { service } = createEnvironment({ gyms });

    assert.equal(service.getTrainer("MINIMAL_GYM"), null);
});

// --------------------------------------------------
// getBadge
// --------------------------------------------------

test("getBadge returns the Boulder Badge", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getBadge("PEWTER_GYM"),
        "BOULDER_BADGE"
    );
});

test("getBadge returns the Cascade Badge", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getBadge("CERULEAN_GYM"),
        "CASCADE_BADGE"
    );
});

test("getBadge returns the Soul Badge", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getBadge("FUCHSIA_GYM"),
        "SOUL_BADGE"
    );
});

test("getBadge returns null for an unknown gym", () => {
    const { service } = createEnvironment();

    assert.equal(service.getBadge("UNKNOWN_GYM"), null);
});

test("getBadge returns undefined when the gym has no badge", () => {
    const { service } = createEnvironment();

    assert.equal(service.getBadge("NO_BADGE_GYM"), undefined);
});

test("getBadge preserves a null badge value", () => {
    const gyms = createGyms();
    gyms.MINIMAL_GYM.badge = null;

    const { service } = createEnvironment({ gyms });

    assert.equal(service.getBadge("MINIMAL_GYM"), null);
});

// --------------------------------------------------
// getRewards
// --------------------------------------------------

test("getRewards returns the requested gym rewards", () => {
    const { service, rewards } = createEnvironment();

    assert.equal(
        service.getRewards("PEWTER_GYM"),
        rewards.PEWTER_GYM
    );
});

test("getRewards delegates to the database service", () => {
    const { service, calls } = createEnvironment();

    service.getRewards("CERULEAN_GYM");

    assert.deepEqual(calls.getRewards, ["CERULEAN_GYM"]);
});

test("getRewards returns the original rewards object", () => {
    const { service, rewards } = createEnvironment();

    assert.strictEqual(
        service.getRewards("PEWTER_GYM"),
        rewards.PEWTER_GYM
    );
});

test("getRewards returns null when the database returns null", () => {
    const { service } = createEnvironment({
        rewards: {
            PEWTER_GYM: null
        }
    });

    assert.equal(service.getRewards("PEWTER_GYM"), null);
});

test("getRewards returns undefined when the database returns undefined", () => {
    const { service } = createEnvironment({
        rewards: {
            PEWTER_GYM: undefined
        }
    });

    assert.equal(service.getRewards("PEWTER_GYM"), undefined);
});

test("getRewards passes through unknown gym IDs", () => {
    const { service, calls } = createEnvironment();

    assert.equal(service.getRewards("UNKNOWN_GYM"), null);
    assert.deepEqual(calls.getRewards, ["UNKNOWN_GYM"]);
});

test("getRewards propagates database errors", () => {
    const database = {
        getRewards() {
            throw new Error("Rewards lookup failed");
        }
    };

    const service = new GymEventService(database);

    assert.throws(
        () => service.getRewards("PEWTER_GYM"),
        /Rewards lookup failed/
    );
});

// --------------------------------------------------
// isCompleted
// --------------------------------------------------

test("isCompleted returns true for an already completed event", () => {
    const { service } = createEnvironment();

    const trainer = createTrainerState({
        completedEvents: ["BATTLE_BROCK"]
    });

    assert.equal(
        service.isCompleted("PEWTER_GYM", trainer.state),
        true
    );
});

test("isCompleted returns false for an incomplete event", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    assert.equal(
        service.isCompleted("PEWTER_GYM", trainer.state),
        false
    );
});

test("isCompleted checks the gym battle event ID", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.isCompleted("PEWTER_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.hasCompletedEvent,
        ["BATTLE_BROCK"]
    );
});

test("isCompleted returns false for an unknown gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    assert.equal(
        service.isCompleted("UNKNOWN_GYM", trainer.state),
        false
    );
});

test("isCompleted does not check trainer state for an unknown gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.isCompleted("UNKNOWN_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.hasCompletedEvent,
        []
    );
});

test("isCompleted returns false when the gym has no battle event", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    assert.equal(
        service.isCompleted("NO_EVENT_GYM", trainer.state),
        false
    );
});

test("isCompleted does not check trainer state without an event ID", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.isCompleted("NO_EVENT_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.hasCompletedEvent,
        []
    );
});

test("isCompleted returns false when hasCompletedEvent is absent", () => {
    const { service } = createEnvironment();

    const trainerState = {};

    assert.equal(
        service.isCompleted("PEWTER_GYM", trainerState),
        false
    );
});

test("isCompleted returns false when hasCompletedEvent is falsy", () => {
    const { service } = createEnvironment();

    const trainerState = {
        hasCompletedEvent: null
    };

    assert.equal(
        service.isCompleted("PEWTER_GYM", trainerState),
        false
    );
});

test("isCompleted returns the result of hasCompletedEvent", () => {
    const { service } = createEnvironment();

    const trainerState = {
        hasCompletedEvent(eventId) {
            assert.equal(eventId, "BATTLE_BROCK");
            return true;
        }
    };

    assert.equal(
        service.isCompleted("PEWTER_GYM", trainerState),
        true
    );
});

test("isCompleted preserves a false result from hasCompletedEvent", () => {
    const { service } = createEnvironment();

    const trainerState = {
        hasCompletedEvent() {
            return false;
        }
    };

    assert.equal(
        service.isCompleted("PEWTER_GYM", trainerState),
        false
    );
});

test("isCompleted propagates errors from hasCompletedEvent", () => {
    const { service } = createEnvironment();

    const trainerState = {
        hasCompletedEvent() {
            throw new Error("Completion lookup failed");
        }
    };

    assert.throws(
        () => service.isCompleted("PEWTER_GYM", trainerState),
        /Completion lookup failed/
    );
});

// --------------------------------------------------
// completeGym: unknown and already completed gyms
// --------------------------------------------------

test("completeGym rejects an unknown gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    assert.deepEqual(
        service.completeGym("UNKNOWN_GYM", trainer.state),
        {
            success: false,
            reason: "Unknown gym"
        }
    );
});

test("completeGym does not award rewards for an unknown gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("UNKNOWN_GYM", trainer.state);

    assert.deepEqual(trainer.calls.addBadge, []);
    assert.deepEqual(trainer.calls.addItem, []);
    assert.deepEqual(trainer.calls.addHMAbility, []);
    assert.deepEqual(trainer.calls.completeBattle, []);
    assert.deepEqual(trainer.calls.completeEvent, []);
});

test("completeGym does not check completion for an unknown gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("UNKNOWN_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.hasCompletedEvent,
        []
    );
});

test("completeGym rejects an already completed gym event", () => {
    const { service } = createEnvironment();

    const trainer = createTrainerState({
        completedEvents: ["BATTLE_BROCK"]
    });

    assert.deepEqual(
        service.completeGym("PEWTER_GYM", trainer.state),
        {
            success: false,
            reason: "Gym event already completed"
        }
    );
});

test("completeGym does not award rewards when the event is already completed", () => {
    const { service } = createEnvironment();

    const trainer = createTrainerState({
        completedEvents: ["BATTLE_BROCK"]
    });

    service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(trainer.calls.addBadge, []);
    assert.deepEqual(trainer.calls.addItem, []);
    assert.deepEqual(trainer.calls.addHMAbility, []);
    assert.deepEqual(trainer.calls.completeBattle, []);
    assert.deepEqual(trainer.calls.completeEvent, []);
});

test("completeGym does not retrieve rewards for an already completed event", () => {
    const { service, calls } = createEnvironment();

    const trainer = createTrainerState({
        completedEvents: ["BATTLE_BROCK"]
    });

    service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(calls.getRewards, []);
});

// --------------------------------------------------
// completeGym: successful completion
// --------------------------------------------------

test("completeGym successfully completes an incomplete gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
});

test("completeGym returns the completed gym ID", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.gym, "PEWTER_GYM");
});

test("completeGym returns the battle event ID", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.event, "BATTLE_BROCK");
});

test("completeGym returns the gym badge", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.badge, "BOULDER_BADGE");
});

test("completeGym returns the gym rewards", () => {
    const { service, rewards } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.strictEqual(result.rewards, rewards.PEWTER_GYM);
});

test("completeGym retrieves rewards for the correct gym", () => {
    const { service, calls } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("CERULEAN_GYM", trainer.state);

    assert.deepEqual(
        calls.getRewards,
        ["CERULEAN_GYM"]
    );
});

test("completeGym awards the gym badge", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.addBadge,
        ["BOULDER_BADGE"]
    );
});

test("completeGym awards each item in the rewards", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.addItem,
        ["TM39", "POTION"]
    );
});

test("completeGym awards each HM ability in the rewards", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.addHMAbility,
        ["CUT"]
    );
});

test("completeGym marks the gym battle as completed", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.completeBattle,
        ["PEWTER_GYM"]
    );
});

test("completeGym marks the event as completed", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.completeEvent,
        ["BATTLE_BROCK"]
    );
});

test("completeGym performs completion actions in the expected order", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(trainer.calls.actions, [
        ["addBadge", "BOULDER_BADGE"],
        ["addItem", "TM39"],
        ["addItem", "POTION"],
        ["addHMAbility", "CUT"],
        ["completeBattle", "PEWTER_GYM"],
        ["completeEvent", "BATTLE_BROCK"]
    ]);
});

test("completeGym awards the correct badge for Cerulean Gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("CERULEAN_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.addBadge,
        ["CASCADE_BADGE"]
    );
});

test("completeGym awards the correct items for Cerulean Gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("CERULEAN_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.addItem,
        ["TM11"]
    );
});

test("completeGym awards the correct HM abilities for Cerulean Gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("CERULEAN_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.addHMAbility,
        ["SURF"]
    );
});

test("completeGym completes the correct event for Cerulean Gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("CERULEAN_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.completeEvent,
        ["BATTLE_MISTY"]
    );
});

// --------------------------------------------------
// completeGym: missing and empty reward data
// --------------------------------------------------

test("completeGym succeeds when the database returns null rewards", () => {
    const { service } = createEnvironment({
        rewards: {
            PEWTER_GYM: null
        }
    });

    const trainer = createTrainerState();

    const result = service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.deepEqual(result.rewards, {});
});

test("completeGym defaults missing rewards to an empty object", () => {
    const { service } = createEnvironment({
        rewards: {}
    });

    const trainer = createTrainerState();

    const result = service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.deepEqual(result.rewards, {});
});

test("completeGym defaults undefined rewards to an empty object", () => {
    const { service } = createEnvironment({
        rewards: {
            PEWTER_GYM: undefined
        }
    });

    const trainer = createTrainerState();

    const result = service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.deepEqual(result.rewards, {});
});

test("completeGym does not award items when the items list is missing", () => {
    const { service } = createEnvironment({
        rewards: {
            PEWTER_GYM: {
                money: 1000,
                hmAbilities: ["CUT"]
            }
        }
    });

    const trainer = createTrainerState();

    service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(trainer.calls.addItem, []);
});

test("completeGym does not award HM abilities when the list is missing", () => {
    const { service } = createEnvironment({
        rewards: {
            PEWTER_GYM: {
                money: 1000,
                items: ["POTION"]
            }
        }
    });

    const trainer = createTrainerState();

    service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(trainer.calls.addHMAbility, []);
});

test("completeGym handles null items and HM ability lists", () => {
    const { service } = createEnvironment({
        rewards: {
            PEWTER_GYM: {
                items: null,
                hmAbilities: null
            }
        }
    });

    const trainer = createTrainerState();

    const result = service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.deepEqual(trainer.calls.addItem, []);
    assert.deepEqual(trainer.calls.addHMAbility, []);
});

test("completeGym supports empty reward lists", () => {
    const { service } = createEnvironment({
        rewards: {
            PEWTER_GYM: {
                money: 500,
                items: [],
                hmAbilities: []
            }
        }
    });

    const trainer = createTrainerState();

    service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(trainer.calls.addItem, []);
    assert.deepEqual(trainer.calls.addHMAbility, []);
});

test("completeGym still completes the battle when there are no rewards", () => {
    const { service } = createEnvironment({
        rewards: {
            PEWTER_GYM: {}
        }
    });

    const trainer = createTrainerState();

    const result = service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.deepEqual(
        trainer.calls.completeBattle,
        ["PEWTER_GYM"]
    );
});

// --------------------------------------------------
// completeGym: badge and event edge cases
// --------------------------------------------------

test("completeGym does not award a badge when the badge is missing", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("NO_BADGE_GYM", trainer.state);

    assert.deepEqual(trainer.calls.addBadge, []);
});

test("completeGym does not award a badge when the badge is null", () => {
    const gyms = createGyms();
    gyms.NO_BADGE_GYM.badge = null;

    const { service } = createEnvironment({ gyms });
    const trainer = createTrainerState();

    service.completeGym("NO_BADGE_GYM", trainer.state);

    assert.deepEqual(trainer.calls.addBadge, []);
});

test("completeGym does not award a badge when the badge is empty", () => {
    const gyms = createGyms();
    gyms.NO_BADGE_GYM.badge = "";

    const { service } = createEnvironment({ gyms });
    const trainer = createTrainerState();

    service.completeGym("NO_BADGE_GYM", trainer.state);

    assert.deepEqual(trainer.calls.addBadge, []);
});

test("completeGym completes a gym that has no battle event", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.completeGym(
        "NO_EVENT_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.equal(result.event, undefined);
});

test("completeGym passes the missing event ID to completeEvent", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("NO_EVENT_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.completeEvent,
        [undefined]
    );
});

test("completeGym marks the gym completed even when it has no battle event", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.completeGym("NO_EVENT_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.completeBattle,
        ["NO_EVENT_GYM"]
    );
});

test("completeGym succeeds when completeEvent is absent", () => {
    const { service } = createEnvironment();

    const trainer = createTrainerState({
        includeCompleteEvent: false
    });

    const result = service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.deepEqual(
        trainer.calls.completeBattle,
        ["PEWTER_GYM"]
    );
});

test("completeGym skips only the event callback when completeEvent is absent", () => {
    const { service } = createEnvironment();

    const trainer = createTrainerState({
        includeCompleteEvent: false
    });

    service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(trainer.calls.completeEvent, []);
    assert.deepEqual(
        trainer.calls.completeBattle,
        ["PEWTER_GYM"]
    );
});

// --------------------------------------------------
// completeGym: completion state and errors
// --------------------------------------------------

test("completeGym checks completion before awarding rewards", () => {
    const { service } = createEnvironment();

    const trainer = createTrainerState({
        completedEvents: ["BATTLE_BROCK"]
    });

    service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.hasCompletedEvent,
        ["BATTLE_BROCK"]
    );

    assert.deepEqual(trainer.calls.actions, []);
});

test("completeGym allows completion when hasCompletedEvent returns false", () => {
    const { service } = createEnvironment();

    const trainer = createTrainerState({
        hasCompletedEvent() {
            return false;
        }
    });

    const result = service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
});

test("completeGym propagates errors from the completion check", () => {
    const { service } = createEnvironment();

    const trainer = createTrainerState({
        hasCompletedEvent() {
            throw new Error("Completion check failed");
        }
    });

    assert.throws(
        () => service.completeGym("PEWTER_GYM", trainer.state),
        /Completion check failed/
    );
});

test("completeGym propagates errors from addBadge", () => {
    const { service } = createEnvironment();

    const trainer = createTrainerState();
    trainer.state.addBadge = () => {
        throw new Error("Badge update failed");
    };

    assert.throws(
        () => service.completeGym("PEWTER_GYM", trainer.state),
        /Badge update failed/
    );
});

test("completeGym propagates errors from addItem", () => {
    const { service } = createEnvironment();

    const trainer = createTrainerState();
    trainer.state.addItem = () => {
        throw new Error("Item update failed");
    };

    assert.throws(
        () => service.completeGym("PEWTER_GYM", trainer.state),
        /Item update failed/
    );
});

test("completeGym propagates errors from addHMAbility", () => {
    const { service } = createEnvironment();

    const trainer = createTrainerState();
    trainer.state.addHMAbility = () => {
        throw new Error("HM ability update failed");
    };

    assert.throws(
        () => service.completeGym("PEWTER_GYM", trainer.state),
        /HM ability update failed/
    );
});

test("completeGym propagates errors from completeBattle", () => {
    const { service } = createEnvironment();

    const trainer = createTrainerState();
    trainer.state.completeBattle = () => {
        throw new Error("Battle completion failed");
    };

    assert.throws(
        () => service.completeGym("PEWTER_GYM", trainer.state),
        /Battle completion failed/
    );
});

test("completeGym propagates errors from completeEvent", () => {
    const { service } = createEnvironment();

    const trainer = createTrainerState();
    trainer.state.completeEvent = () => {
        throw new Error("Event completion failed");
    };

    assert.throws(
        () => service.completeGym("PEWTER_GYM", trainer.state),
        /Event completion failed/
    );
});

// --------------------------------------------------
// getAllGyms
// --------------------------------------------------

test("getAllGyms returns all gyms from the database service", () => {
    const { service, database } = createEnvironment();

    assert.deepEqual(
        service.getAllGyms(),
        database.getAllGyms()
    );
});

test("getAllGyms delegates to the database service", () => {
    const { service, calls } = createEnvironment();

    service.getAllGyms();

    assert.equal(calls.getAllGyms, 1);
});

test("getAllGyms returns the original array from the database", () => {
    const allGyms = [
        { id: "GYM_A" },
        { id: "GYM_B" }
    ];

    const { service } = createEnvironment({ allGyms });

    assert.strictEqual(service.getAllGyms(), allGyms);
});

test("getAllGyms returns an empty array when the database returns one", () => {
    const { service } = createEnvironment({
        allGyms: []
    });

    assert.deepEqual(service.getAllGyms(), []);
});

test("getAllGyms propagates database errors", () => {
    const database = {
        getAllGyms() {
            throw new Error("Gym listing failed");
        }
    };

    const service = new GymEventService(database);

    assert.throws(
        () => service.getAllGyms(),
        /Gym listing failed/
    );
});
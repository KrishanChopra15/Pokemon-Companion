"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GymService = require("../scripts/services/gym-service");

// --------------------------------------------------
// Fixtures
// --------------------------------------------------

function createGyms() {
    return [
        {
            id: "PEWTER_GYM",
            order: 1,
            trainer: "BROCK",
            badge: "BOULDER_BADGE",
            requirements: {}
        },
        {
            id: "CERULEAN_GYM",
            order: 2,
            trainer: "MISTY",
            badge: "CASCADE_BADGE",
            requirements: {
                badges: ["BOULDER_BADGE"]
            }
        },
        {
            id: "VERMILION_GYM",
            order: 3,
            trainer: "LT_SURGE",
            badge: "THUNDER_BADGE",
            requirements: {}
        },
        {
            id: "FUCHSIA_GYM",
            order: 4,
            trainer: "KOGA",
            badge: "SOUL_BADGE",
            requirements: {}
        },
        {
            id: "NO_TRAINER_GYM",
            order: 5,
            badge: "TEST_BADGE",
            requirements: {}
        }
    ];
}

function createEvents() {
    return {
        PEWTER_GYM: {
            gymId: "PEWTER_GYM",
            battleEvent: "BATTLE_BROCK",
            badge: "BOULDER_BADGE"
        },
        CERULEAN_GYM: {
            gymId: "CERULEAN_GYM",
            battleEvent: "BATTLE_MISTY",
            badge: "CASCADE_BADGE"
        },
        VERMILION_GYM: {
            gymId: "VERMILION_GYM",
            battleEvent: "BATTLE_SURGE",
            badge: "THUNDER_BADGE"
        },
        FUCHSIA_GYM: {
            gymId: "FUCHSIA_GYM",
            battleEvent: "BATTLE_KOGA",
            badge: "SOUL_BADGE"
        },
        NO_TRAINER_GYM: {
            gymId: "NO_TRAINER_GYM",
            battleEvent: "BATTLE_NO_TRAINER",
            badge: "TEST_BADGE"
        }
    };
}

function createTrainerRecords() {
    return {
        BROCK: {
            id: "BROCK",
            name: "Brock",
            class: "Gym Leader"
        },
        MISTY: {
            id: "MISTY",
            name: "Misty",
            class: "Gym Leader"
        },
        LT_SURGE: {
            id: "LT_SURGE",
            name: "Lt. Surge",
            class: "Gym Leader"
        },
        KOGA: {
            id: "KOGA",
            name: "Koga",
            class: "Gym Leader"
        }
    };
}

// --------------------------------------------------
// Mock dependencies
// --------------------------------------------------

function createProgressionService(gyms, options = {}) {
    const calls = {
        getGym: [],
        getAllGyms: 0,
        canChallengeGym: [],
        getAvailableGyms: [],
        getRecommendedNextGyms: [],
        getGymCount: 0,
        getCompletedGymCount: []
    };

    const service = {
        calls,

        getGym(gymId) {
            calls.getGym.push(gymId);

            if (typeof options.getGym === "function") {
                return options.getGym(gymId, gyms);
            }

            return gyms.find(gym => gym.id === gymId) || null;
        },

        getAllGyms() {
            calls.getAllGyms += 1;

            if (typeof options.getAllGyms === "function") {
                return options.getAllGyms(gyms);
            }

            return gyms;
        },

        canChallengeGym(gymId, trainerState) {
            calls.canChallengeGym.push({
                gymId,
                trainerState
            });

            if (typeof options.canChallengeGym === "function") {
                return options.canChallengeGym(gymId, trainerState);
            }

            return { allowed: true };
        },

        getAvailableGyms(trainerState) {
            calls.getAvailableGyms.push(trainerState);

            if (typeof options.getAvailableGyms === "function") {
                return options.getAvailableGyms(trainerState);
            }

            if (Object.prototype.hasOwnProperty.call(options, "availableGyms")) {
                return options.availableGyms;
            }

            return gyms;
        },

        getRecommendedNextGyms(trainerState) {
            calls.getRecommendedNextGyms.push(trainerState);

            if (typeof options.getRecommendedNextGyms === "function") {
                return options.getRecommendedNextGyms(trainerState);
            }

            if (Object.prototype.hasOwnProperty.call(options, "recommendedGyms")) {
                return options.recommendedGyms;
            }

            return gyms.length > 0 ? [gyms[0]] : [];
        },

        getGymCount() {
            calls.getGymCount += 1;

            if (typeof options.getGymCount === "function") {
                return options.getGymCount(gyms);
            }

            if (Object.prototype.hasOwnProperty.call(options, "gymCount")) {
                return options.gymCount;
            }

            return gyms.length;
        },

        getCompletedGymCount(trainerState) {
            calls.getCompletedGymCount.push(trainerState);

            if (typeof options.getCompletedGymCount === "function") {
                return options.getCompletedGymCount(trainerState, gyms);
            }

            if (Object.prototype.hasOwnProperty.call(options, "completedCount")) {
                return options.completedCount;
            }

            return 0;
        }
    };

    return service;
}

function createEventService(events, options = {}) {
    const calls = [];

    return {
        calls,

        getGymEvent(gymId) {
            calls.push(gymId);

            if (typeof options.getGymEvent === "function") {
                return options.getGymEvent(gymId, events);
            }

            return Object.prototype.hasOwnProperty.call(events, gymId)
                ? events[gymId]
                : null;
        }
    };
}

function createRewardService(options = {}) {
    const calls = [];

    return {
        calls,

        giveRewards(gymId, trainerState) {
            calls.push({ gymId, trainerState });

            if (typeof options.giveRewards === "function") {
                return options.giveRewards(gymId, trainerState);
            }

            return {
                success: true,
                rewards: {
                    items: ["TM39"],
                    hmAbilities: ["CUT"]
                }
            };
        }
    };
}

function createTrainerDatabase(records = createTrainerRecords()) {
    const calls = [];

    return {
        calls,

        getTrainer(trainerId) {
            calls.push(trainerId);

            return Object.prototype.hasOwnProperty.call(records, trainerId)
                ? records[trainerId]
                : null;
        }
    };
}

function createTrainerState(options = {}) {
    const calls = {
        completeEvent: [],
        hasCompletedBattle: []
    };

    const state = {};

    if (options.includeHasCompletedBattle !== false) {
        state.hasCompletedBattle = function (gymId) {
            calls.hasCompletedBattle.push(gymId);

            if (typeof options.hasCompletedBattle === "function") {
                return options.hasCompletedBattle(gymId);
            }

            return (options.completedGyms || []).includes(gymId);
        };
    }

    if (options.includeCompleteEvent !== false) {
        state.completeEvent = function (eventId) {
            calls.completeEvent.push(eventId);
        };
    }

    return { state, calls };
}

function createEnvironment(options = {}) {
    const gyms = Object.prototype.hasOwnProperty.call(options, "gyms")
        ? options.gyms
        : createGyms();

    const events = Object.prototype.hasOwnProperty.call(options, "events")
        ? options.events
        : createEvents();

    const progression = Object.prototype.hasOwnProperty.call(
        options,
        "progression"
    )
        ? options.progression
        : createProgressionService(gyms, options.progressionOptions || {});

    const eventService = Object.prototype.hasOwnProperty.call(
        options,
        "eventsService"
    )
        ? options.eventsService
        : createEventService(events, options.eventOptions || {});

    const rewardService = Object.prototype.hasOwnProperty.call(
        options,
        "rewards"
    )
        ? options.rewards
        : createRewardService(options.rewardOptions || {});

    const trainerDatabase = Object.prototype.hasOwnProperty.call(
        options,
        "trainers"
    )
        ? options.trainers
        : null;

    const service = new GymService(
        progression,
        eventService,
        rewardService,
        trainerDatabase
    );

    return {
        service,
        gyms,
        events,
        progression,
        eventService,
        rewardService,
        trainerDatabase
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a GymService instance", () => {
    const env = createEnvironment();

    assert.ok(env.service instanceof GymService);
});

test("constructor stores the progression service", () => {
    const env = createEnvironment();

    assert.strictEqual(env.service.progression, env.progression);
});

test("constructor stores the event service", () => {
    const env = createEnvironment();

    assert.strictEqual(env.service.events, env.eventService);
});

test("constructor stores the reward service", () => {
    const env = createEnvironment();

    assert.strictEqual(env.service.rewards, env.rewardService);
});

test("constructor stores the trainer database when supplied", () => {
    const trainers = createTrainerDatabase();
    const env = createEnvironment({ trainers });

    assert.strictEqual(env.service.trainers, trainers);
});

test("constructor defaults the trainer database to null", () => {
    const env = createEnvironment();

    assert.equal(env.service.trainers, null);
});

test("constructor accepts an explicit null trainer database", () => {
    const env = createEnvironment({ trainers: null });

    assert.equal(env.service.trainers, null);
});

// --------------------------------------------------
// getGym
// --------------------------------------------------

test("getGym returns the requested gym", () => {
    const env = createEnvironment();

    assert.strictEqual(
        env.service.getGym("PEWTER_GYM"),
        env.gyms[0]
    );
});

test("getGym delegates to the progression service", () => {
    const env = createEnvironment();

    env.service.getGym("CERULEAN_GYM");

    assert.deepEqual(
        env.progression.calls.getGym,
        ["CERULEAN_GYM"]
    );
});

test("getGym returns null for an unknown gym", () => {
    const env = createEnvironment();

    assert.equal(
        env.service.getGym("UNKNOWN_GYM"),
        null
    );
});

test("getGym passes the gym ID unchanged", () => {
    const progression = {
        getGym(gymId) {
            assert.equal(gymId, "custom-gym-id");
            return { id: gymId };
        }
    };

    const env = createEnvironment({ progression });

    assert.deepEqual(
        env.service.getGym("custom-gym-id"),
        { id: "custom-gym-id" }
    );
});

test("getGym returns the result from progression unchanged", () => {
    const gym = { id: "CUSTOM_GYM" };

    const progression = {
        getGym() {
            return gym;
        }
    };

    const env = createEnvironment({ progression });

    assert.strictEqual(
        env.service.getGym("CUSTOM_GYM"),
        gym
    );
});

test("getGym propagates progression errors", () => {
    const progression = {
        getGym() {
            throw new Error("Gym lookup failed");
        }
    };

    const env = createEnvironment({ progression });

    assert.throws(
        () => env.service.getGym("PEWTER_GYM"),
        /Gym lookup failed/
    );
});

// --------------------------------------------------
// getAllGyms
// --------------------------------------------------

test("getAllGyms returns all gyms from progression", () => {
    const env = createEnvironment();

    assert.strictEqual(
        env.service.getAllGyms(),
        env.gyms
    );
});

test("getAllGyms delegates to the progression service", () => {
    const env = createEnvironment();

    env.service.getAllGyms();

    assert.equal(
        env.progression.calls.getAllGyms,
        1
    );
});

test("getAllGyms preserves an empty array", () => {
    const env = createEnvironment({ gyms: [] });

    assert.deepEqual(env.service.getAllGyms(), []);
});

test("getAllGyms returns the progression result unchanged", () => {
    const expected = [{ id: "CUSTOM_GYM" }];

    const progression = {
        getAllGyms() {
            return expected;
        }
    };

    const env = createEnvironment({ progression });

    assert.strictEqual(env.service.getAllGyms(), expected);
});

test("getAllGyms propagates progression errors", () => {
    const progression = {
        getAllGyms() {
            throw new Error("Gym listing failed");
        }
    };

    const env = createEnvironment({ progression });

    assert.throws(
        () => env.service.getAllGyms(),
        /Gym listing failed/
    );
});

// --------------------------------------------------
// hasTrainerDatabase
// --------------------------------------------------

test("hasTrainerDatabase returns false when the trainer database is null", () => {
    const env = createEnvironment({ trainers: null });

    assert.equal(env.service.hasTrainerDatabase(), false);
});

test("hasTrainerDatabase returns true when a trainer database is supplied", () => {
    const trainers = createTrainerDatabase();
    const env = createEnvironment({ trainers });

    assert.equal(env.service.hasTrainerDatabase(), true);
});

test("hasTrainerDatabase returns true for an empty trainer database object", () => {
    const env = createEnvironment({ trainers: {} });

    assert.equal(env.service.hasTrainerDatabase(), true);
});

// --------------------------------------------------
// getGymTrainerId
// --------------------------------------------------

test("getGymTrainerId returns Brock's trainer ID", () => {
    const env = createEnvironment();

    assert.equal(
        env.service.getGymTrainerId("PEWTER_GYM"),
        "BROCK"
    );
});

test("getGymTrainerId returns the trainer ID for Cerulean Gym", () => {
    const env = createEnvironment();

    assert.equal(
        env.service.getGymTrainerId("CERULEAN_GYM"),
        "MISTY"
    );
});

test("getGymTrainerId returns null for an unknown gym", () => {
    const env = createEnvironment();

    assert.equal(
        env.service.getGymTrainerId("UNKNOWN_GYM"),
        null
    );
});

test("getGymTrainerId returns undefined when the gym has no trainer", () => {
    const env = createEnvironment();

    assert.equal(
        env.service.getGymTrainerId("NO_TRAINER_GYM"),
        undefined
    );
});

test("getGymTrainerId delegates to getGym", () => {
    const env = createEnvironment();

    env.service.getGymTrainerId("VERMILION_GYM");

    assert.deepEqual(
        env.progression.calls.getGym,
        ["VERMILION_GYM"]
    );
});

// --------------------------------------------------
// getGymTrainer
// --------------------------------------------------

test("getGymTrainer returns null without a trainer database", () => {
    const env = createEnvironment({ trainers: null });

    assert.equal(
        env.service.getGymTrainer("PEWTER_GYM"),
        null
    );
});

test("getGymTrainer does not look up a gym without a trainer database", () => {
    const env = createEnvironment({ trainers: null });

    env.service.getGymTrainer("PEWTER_GYM");

    assert.deepEqual(
        env.progression.calls.getGym,
        []
    );
});

test("getGymTrainer returns Brock's trainer record", () => {
    const records = createTrainerRecords();
    const trainers = createTrainerDatabase(records);
    const env = createEnvironment({ trainers });

    assert.strictEqual(
        env.service.getGymTrainer("PEWTER_GYM"),
        records.BROCK
    );
});

function trainersRecords(database, trainerId) {
    return Object.values(createTrainerRecords()).find(
        trainer => trainer.id === trainerId
    );
}

test("getGymTrainer delegates to the trainer database", () => {
    const trainers = createTrainerDatabase();
    const env = createEnvironment({ trainers });

    env.service.getGymTrainer("CERULEAN_GYM");

    assert.deepEqual(trainers.calls, ["MISTY"]);
});

test("getGymTrainer returns the database result unchanged", () => {
    const expected = { id: "BROCK", name: "Custom Brock" };

    const trainers = {
        getTrainer(trainerId) {
            assert.equal(trainerId, "BROCK");
            return expected;
        }
    };

    const env = createEnvironment({ trainers });

    assert.strictEqual(
        env.service.getGymTrainer("PEWTER_GYM"),
        expected
    );
});

test("getGymTrainer returns null when the gym does not exist", () => {
    const trainers = createTrainerDatabase();
    const env = createEnvironment({ trainers });

    assert.equal(
        env.service.getGymTrainer("UNKNOWN_GYM"),
        null
    );

    assert.deepEqual(trainers.calls, []);
});

test("getGymTrainer returns null when the gym has no trainer ID", () => {
    const trainers = createTrainerDatabase();
    const env = createEnvironment({ trainers });

    assert.equal(
        env.service.getGymTrainer("NO_TRAINER_GYM"),
        null
    );

    assert.deepEqual(trainers.calls, []);
});

test("getGymTrainer returns null when the trainer database cannot find the trainer", () => {
    const trainers = createTrainerDatabase({});
    const env = createEnvironment({ trainers });

    assert.equal(
        env.service.getGymTrainer("PEWTER_GYM"),
        null
    );
});

test("getGymTrainer propagates trainer database errors", () => {
    const trainers = {
        getTrainer() {
            throw new Error("Trainer lookup failed");
        }
    };

    const env = createEnvironment({ trainers });

    assert.throws(
        () => env.service.getGymTrainer("PEWTER_GYM"),
        /Trainer lookup failed/
    );
});

// --------------------------------------------------
// canChallenge
// --------------------------------------------------

test("canChallenge delegates to gym progression", () => {
    const env = createEnvironment();
    const trainer = {};

    env.service.canChallenge("PEWTER_GYM", trainer);

    assert.equal(
        env.progression.calls.canChallengeGym.length,
        1
    );

    assert.equal(
        env.progression.calls.canChallengeGym[0].gymId,
        "PEWTER_GYM"
    );

    assert.strictEqual(
        env.progression.calls.canChallengeGym[0].trainerState,
        trainer
    );
});

test("canChallenge returns the progression result unchanged", () => {
    const expected = {
        allowed: false,
        reason: "Missing badge requirement"
    };

    const progression = createProgressionService(createGyms(), {
        canChallengeGym() {
            return expected;
        }
    });

    const env = createEnvironment({ progression });

    assert.strictEqual(
        env.service.canChallenge("CERULEAN_GYM", {}),
        expected
    );
});

test("canChallenge propagates progression errors", () => {
    const progression = createProgressionService(createGyms(), {
        canChallengeGym() {
            throw new Error("Challenge check failed");
        }
    });

    const env = createEnvironment({ progression });

    assert.throws(
        () => env.service.canChallenge("PEWTER_GYM", {}),
        /Challenge check failed/
    );
});

// --------------------------------------------------
// getGymEvent
// --------------------------------------------------

test("getGymEvent returns the requested gym event", () => {
    const env = createEnvironment();

    assert.strictEqual(
        env.service.getGymEvent("PEWTER_GYM"),
        env.events.PEWTER_GYM
    );
});

test("getGymEvent delegates to the event service", () => {
    const env = createEnvironment();

    env.service.getGymEvent("CERULEAN_GYM");

    assert.deepEqual(
        env.eventService.calls,
        ["CERULEAN_GYM"]
    );
});

test("getGymEvent returns null for an unknown gym", () => {
    const env = createEnvironment();

    assert.equal(
        env.service.getGymEvent("UNKNOWN_GYM"),
        null
    );
});

test("getGymEvent returns the result unchanged", () => {
    const expected = { battleEvent: "CUSTOM_EVENT" };

    const eventsService = {
        getGymEvent() {
            return expected;
        }
    };

    const env = createEnvironment({ eventsService });

    assert.strictEqual(
        env.service.getGymEvent("CUSTOM_GYM"),
        expected
    );
});

test("getGymEvent propagates event service errors", () => {
    const eventsService = {
        getGymEvent() {
            throw new Error("Event lookup failed");
        }
    };

    const env = createEnvironment({ eventsService });

    assert.throws(
        () => env.service.getGymEvent("PEWTER_GYM"),
        /Event lookup failed/
    );
});

// --------------------------------------------------
// getBattleData
// --------------------------------------------------

test("getBattleData returns null for an unknown gym", () => {
    const env = createEnvironment();

    assert.equal(
        env.service.getBattleData("UNKNOWN_GYM"),
        null
    );
});

test("getBattleData does not look up events for an unknown gym", () => {
    const env = createEnvironment();

    env.service.getBattleData("UNKNOWN_GYM");

    assert.deepEqual(
        env.eventService.calls,
        []
    );
});

test("getBattleData returns the gym ID and gym record", () => {
    const env = createEnvironment();

    const result = env.service.getBattleData("PEWTER_GYM");

    assert.equal(result.gymId, "PEWTER_GYM");
    assert.strictEqual(result.gym, env.gyms[0]);
});

test("getBattleData returns the trainer ID", () => {
    const env = createEnvironment();

    assert.equal(
        env.service.getBattleData("PEWTER_GYM").trainerId,
        "BROCK"
    );
});

test("getBattleData returns null trainer when the trainer database is absent", () => {
    const env = createEnvironment({ trainers: null });

    assert.equal(
        env.service.getBattleData("PEWTER_GYM").trainer,
        null
    );
});

test("getBattleData resolves the trainer when a trainer database is available", () => {
    const trainers = createTrainerDatabase();
    const env = createEnvironment({ trainers });

    const result = env.service.getBattleData("PEWTER_GYM");

    assert.equal(result.trainer.name, "Brock");
    assert.equal(result.trainerId, "BROCK");
});

test("getBattleData includes the gym event", () => {
    const env = createEnvironment();

    assert.strictEqual(
        env.service.getBattleData("PEWTER_GYM").event,
        env.events.PEWTER_GYM
    );
});

test("getBattleData returns all expected properties", () => {
    const env = createEnvironment();

    assert.deepEqual(
        Object.keys(env.service.getBattleData("PEWTER_GYM")),
        ["gymId", "gym", "trainerId", "trainer", "event"]
    );
});

test("getBattleData preserves a missing event as null", () => {
    const env = createEnvironment({
        events: {}
    });

    const result = env.service.getBattleData("PEWTER_GYM");

    assert.equal(result.event, null);
});

test("getBattleData propagates progression lookup errors", () => {
    const progression = createProgressionService(createGyms(), {
        getGym() {
            throw new Error("Gym lookup failed");
        }
    });

    const env = createEnvironment({ progression });

    assert.throws(
        () => env.service.getBattleData("PEWTER_GYM"),
        /Gym lookup failed/
    );
});

// --------------------------------------------------
// completeGym: challenge validation
// --------------------------------------------------

test("completeGym rejects a gym that cannot be challenged", () => {
    const progression = createProgressionService(createGyms(), {
        canChallengeGym() {
            return {
                allowed: false,
                reason: "Gym already defeated"
            };
        }
    });

    const env = createEnvironment({ progression });
    const trainer = createTrainerState();

    assert.deepEqual(
        env.service.completeGym("PEWTER_GYM", trainer.state),
        {
            success: false,
            reason: "Gym already defeated"
        }
    );
});

test("completeGym checks challenge eligibility before retrieving the event", () => {
    const order = [];

    const progression = createProgressionService(createGyms(), {
        canChallengeGym() {
            order.push("challenge");
            return {
                allowed: false,
                reason: "Blocked"
            };
        }
    });

    const eventsService = {
        getGymEvent() {
            order.push("event");
            return { battleEvent: "BATTLE_BROCK" };
        }
    };

    const env = createEnvironment({
        progression,
        eventsService
    });

    env.service.completeGym("PEWTER_GYM", {});

    assert.deepEqual(order, ["challenge"]);
});

test("completeGym does not award rewards when challenge eligibility fails", () => {
    const progression = createProgressionService(createGyms(), {
        canChallengeGym() {
            return {
                allowed: false,
                reason: "Blocked"
            };
        }
    });

    const env = createEnvironment({ progression });
    const trainer = createTrainerState();

    env.service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(env.rewardService.calls, []);
    assert.deepEqual(trainer.calls.completeEvent, []);
});

test("completeGym preserves the rejection reason", () => {
    const progression = createProgressionService(createGyms(), {
        canChallengeGym() {
            return {
                allowed: false,
                reason: "Missing story requirement"
            };
        }
    });

    const env = createEnvironment({ progression });

    assert.deepEqual(
        env.service.completeGym("PEWTER_GYM", {}),
        {
            success: false,
            reason: "Missing story requirement"
        }
    );
});

test("completeGym preserves an undefined rejection reason", () => {
    const progression = createProgressionService(createGyms(), {
        canChallengeGym() {
            return { allowed: false };
        }
    });

    const env = createEnvironment({ progression });

    assert.deepEqual(
        env.service.completeGym("PEWTER_GYM", {}),
        {
            success: false,
            reason: undefined
        }
    );
});

// --------------------------------------------------
// completeGym: event validation
// --------------------------------------------------

test("completeGym rejects a missing gym event", () => {
    const env = createEnvironment({
        events: {}
    });

    assert.deepEqual(
        env.service.completeGym("PEWTER_GYM", {}),
        {
            success: false,
            reason: "Missing gym event"
        }
    );
});

test("completeGym rejects a null gym event", () => {
    const env = createEnvironment({
        eventOptions: {
            getGymEvent() {
                return null;
            }
        }
    });

    assert.deepEqual(
        env.service.completeGym("PEWTER_GYM", {}),
        {
            success: false,
            reason: "Missing gym event"
        }
    );
});

test("completeGym does not apply rewards when the event is missing", () => {
    const env = createEnvironment({
        events: {}
    });

    env.service.completeGym("PEWTER_GYM", {});

    assert.deepEqual(env.rewardService.calls, []);
});

test("completeGym checks the event after challenge eligibility", () => {
    const order = [];

    const progression = createProgressionService(createGyms(), {
        canChallengeGym() {
            order.push("challenge");
            return { allowed: true };
        }
    });

    const eventsService = {
        getGymEvent() {
            order.push("event");
            return null;
        }
    };

    const env = createEnvironment({
        progression,
        eventsService
    });

    env.service.completeGym("PEWTER_GYM", {});

    assert.deepEqual(order, ["challenge", "event"]);
});

// --------------------------------------------------
// completeGym: reward application
// --------------------------------------------------

test("completeGym applies rewards after successful validation", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    const result = env.service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.equal(env.rewardService.calls.length, 1);
});

test("completeGym passes the gym ID and trainer state to the reward service", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    env.service.completeGym("CERULEAN_GYM", trainer.state);

    assert.equal(
        env.rewardService.calls[0].gymId,
        "CERULEAN_GYM"
    );

    assert.strictEqual(
        env.rewardService.calls[0].trainerState,
        trainer.state
    );
});

test("completeGym returns a failed reward result unchanged", () => {
    const rewardResult = {
        success: false,
        reason: "Reward application failed"
    };

    const env = createEnvironment({
        rewardOptions: {
            giveRewards() {
                return rewardResult;
            }
        }
    });

    const trainer = createTrainerState();

    assert.strictEqual(
        env.service.completeGym("PEWTER_GYM", trainer.state),
        rewardResult
    );
});

test("completeGym does not complete the event when reward application fails", () => {
    const env = createEnvironment({
        rewardOptions: {
            giveRewards() {
                return {
                    success: false,
                    reason: "Failed"
                };
            }
        }
    });

    const trainer = createTrainerState();

    env.service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(trainer.calls.completeEvent, []);
});

test("completeGym completes the event after rewards succeed", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    env.service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.completeEvent,
        ["BATTLE_BROCK"]
    );
});

test("completeGym applies rewards before completing the event", () => {
    const order = [];

    const rewards = {
        giveRewards() {
            order.push("rewards");

            return {
                success: true,
                rewards: {}
            };
        }
    };

    const eventsService = {
        getGymEvent() {
            order.push("getEvent");

            return {
                battleEvent: "BATTLE_BROCK",
                badge: "BOULDER_BADGE"
            };
        }
    };

    const env = createEnvironment({
        rewards,
        eventsService
    });

    const trainer = createTrainerState();
    trainer.state.completeEvent = function (eventId) {
        order.push("completeEvent");
        trainer.calls.completeEvent.push(eventId);
    };

    env.service.completeGym("PEWTER_GYM", trainer.state);

    assert.deepEqual(
        order,
        ["getEvent", "rewards", "completeEvent"]
    );
});

test("completeGym succeeds without a reward service", () => {
    const env = createEnvironment({
        rewards: null
    });

    const trainer = createTrainerState();

    const result = env.service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.deepEqual(result.rewards, {});
    assert.deepEqual(
        trainer.calls.completeEvent,
        ["BATTLE_BROCK"]
    );
});

test("completeGym returns the gym ID on success", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    const result = env.service.completeGym(
        "CERULEAN_GYM",
        trainer.state
    );

    assert.equal(result.gym, "CERULEAN_GYM");
});

test("completeGym returns the battle event ID on success", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    const result = env.service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.event, "BATTLE_BROCK");
});

test("completeGym returns the badge from the event", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    const result = env.service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.badge, "BOULDER_BADGE");
});

test("completeGym returns the reward result's rewards field", () => {
    const rewards = {
        money: 2000,
        items: ["TM39"]
    };

    const env = createEnvironment({
        rewardOptions: {
            giveRewards() {
                return {
                    success: true,
                    rewards
                };
            }
        }
    });

    const trainer = createTrainerState();

    const result = env.service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.strictEqual(result.rewards, rewards);
});

test("completeGym succeeds when the trainer lacks completeEvent", () => {
    const env = createEnvironment();
    const trainer = createTrainerState({
        includeCompleteEvent: false
    });

    const result = env.service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
});

test("completeGym passes an undefined event ID through to completeEvent", () => {
    const events = {
        PEWTER_GYM: {
            gymId: "PEWTER_GYM",
            badge: "BOULDER_BADGE"
        }
    };

    const env = createEnvironment({ events });
    const trainer = createTrainerState();

    const result = env.service.completeGym(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.deepEqual(trainer.calls.completeEvent, [undefined]);
    assert.equal(result.event, undefined);
});

test("completeGym propagates challenge service errors", () => {
    const progression = createProgressionService(createGyms(), {
        canChallengeGym() {
            throw new Error("Challenge service failed");
        }
    });

    const env = createEnvironment({ progression });

    assert.throws(
        () => env.service.completeGym("PEWTER_GYM", {}),
        /Challenge service failed/
    );
});

test("completeGym propagates event service errors", () => {
    const eventsService = {
        getGymEvent() {
            throw new Error("Event service failed");
        }
    };

    const env = createEnvironment({ eventsService });

    assert.throws(
        () => env.service.completeGym("PEWTER_GYM", {}),
        /Event service failed/
    );
});

test("completeGym propagates reward service errors", () => {
    const env = createEnvironment({
        rewardOptions: {
            giveRewards() {
                throw new Error("Reward service failed");
            }
        }
    });

    assert.throws(
        () => env.service.completeGym(
            "PEWTER_GYM",
            createTrainerState().state
        ),
        /Reward service failed/
    );
});

test("completeGym propagates completeEvent errors", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    trainer.state.completeEvent = function () {
        throw new Error("Event completion failed");
    };

    assert.throws(
        () => env.service.completeGym("PEWTER_GYM", trainer.state),
        /Event completion failed/
    );
});

// --------------------------------------------------
// getGymStatus
// --------------------------------------------------

test("getGymStatus returns exists false for an unknown gym", () => {
    const env = createEnvironment();

    assert.deepEqual(
        env.service.getGymStatus("UNKNOWN_GYM", {}),
        { exists: false }
    );
});

test("getGymStatus does not look up events for an unknown gym", () => {
    const env = createEnvironment();

    env.service.getGymStatus("UNKNOWN_GYM", {});

    assert.deepEqual(env.eventService.calls, []);
});

test("getGymStatus reports that an existing gym exists", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    assert.equal(
        env.service.getGymStatus("PEWTER_GYM", trainer.state).exists,
        true
    );
});

test("getGymStatus includes the gym record", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    const status = env.service.getGymStatus(
        "PEWTER_GYM",
        trainer.state
    );

    assert.strictEqual(status.gym, env.gyms[0]);
});

test("getGymStatus includes the trainer record when available", () => {
    const trainers = createTrainerDatabase();
    const env = createEnvironment({ trainers });
    const trainer = createTrainerState();

    const status = env.service.getGymStatus(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(status.trainer.name, "Brock");
});

test("getGymStatus returns null trainer when no trainer database exists", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    assert.equal(
        env.service.getGymStatus("PEWTER_GYM", trainer.state).trainer,
        null
    );
});

test("getGymStatus includes the event", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    assert.strictEqual(
        env.service.getGymStatus("PEWTER_GYM", trainer.state).event,
        env.events.PEWTER_GYM
    );
});

test("getGymStatus reports completed true for a defeated gym", () => {
    const env = createEnvironment();
    const trainer = createTrainerState({
        completedGyms: ["PEWTER_GYM"]
    });

    assert.equal(
        env.service.getGymStatus("PEWTER_GYM", trainer.state).completed,
        true
    );
});

test("getGymStatus reports completed false for an undefeated gym", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    assert.equal(
        env.service.getGymStatus("PEWTER_GYM", trainer.state).completed,
        false
    );
});

test("getGymStatus returns undefined completed when the completion method is absent", () => {
    const env = createEnvironment();
    const trainer = createTrainerState({
        includeHasCompletedBattle: false
    });

    assert.equal(
        env.service.getGymStatus("PEWTER_GYM", trainer.state).completed,
        undefined
    );
});

test("getGymStatus checks completion using the requested gym ID", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    env.service.getGymStatus("CERULEAN_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.hasCompletedBattle,
        ["CERULEAN_GYM"]
    );
});

test("getGymStatus includes the availability result", () => {
    const availability = {
        allowed: false,
        reason: "Missing badge requirement"
    };

    const progression = createProgressionService(createGyms(), {
        canChallengeGym() {
            return availability;
        }
    });

    const env = createEnvironment({ progression });
    const trainer = createTrainerState();

    const status = env.service.getGymStatus(
        "CERULEAN_GYM",
        trainer.state
    );

    assert.strictEqual(status.availability, availability);
});

test("getGymStatus checks availability using the requested gym ID", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    env.service.getGymStatus("VERMILION_GYM", trainer.state);

    assert.equal(
        env.progression.calls.canChallengeGym[0].gymId,
        "VERMILION_GYM"
    );
});

test("getGymStatus returns all expected properties for an existing gym", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    assert.deepEqual(
        Object.keys(
            env.service.getGymStatus("PEWTER_GYM", trainer.state)
        ),
        [
            "exists",
            "gym",
            "trainer",
            "event",
            "completed",
            "availability"
        ]
    );
});

test("getGymStatus propagates lookup errors", () => {
    const progression = createProgressionService(createGyms(), {
        getGym() {
            throw new Error("Gym lookup failed");
        }
    });

    const env = createEnvironment({ progression });

    assert.throws(
        () => env.service.getGymStatus("PEWTER_GYM", {}),
        /Gym lookup failed/
    );
});

// --------------------------------------------------
// getAvailableGyms
// --------------------------------------------------

test("getAvailableGyms delegates to progression", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    env.service.getAvailableGyms(trainer.state);

    assert.deepEqual(
        env.progression.calls.getAvailableGyms,
        [trainer.state]
    );
});

test("getAvailableGyms returns the progression result unchanged", () => {
    const expected = [
        { id: "PEWTER_GYM" },
        { id: "CERULEAN_GYM" }
    ];

    const env = createEnvironment({
        progressionOptions: {
            availableGyms: expected
        }
    });

    assert.strictEqual(
        env.service.getAvailableGyms({}),
        expected
    );
});

test("getAvailableGyms preserves an empty array", () => {
    const env = createEnvironment({
        progressionOptions: {
            availableGyms: []
        }
    });

    assert.deepEqual(
        env.service.getAvailableGyms({}),
        []
    );
});

test("getAvailableGyms propagates progression errors", () => {
    const progression = createProgressionService(createGyms(), {
        getAvailableGyms() {
            throw new Error("Available gym lookup failed");
        }
    });

    const env = createEnvironment({ progression });

    assert.throws(
        () => env.service.getAvailableGyms({}),
        /Available gym lookup failed/
    );
});

// --------------------------------------------------
// getRecommendedNextGym
// --------------------------------------------------

test("getRecommendedNextGym delegates to progression", () => {
    const env = createEnvironment();
    const trainer = createTrainerState();

    env.service.getRecommendedNextGym(trainer.state);

    assert.deepEqual(
        env.progression.calls.getRecommendedNextGyms,
        [trainer.state]
    );
});

test("getRecommendedNextGym returns the progression result unchanged", () => {
    const expected = [
        { id: "CERULEAN_GYM", order: 2 }
    ];

    const env = createEnvironment({
        progressionOptions: {
            recommendedGyms: expected
        }
    });

    assert.strictEqual(
        env.service.getRecommendedNextGym({}),
        expected
    );
});

test("getRecommendedNextGym returns an empty array when progression recommends none", () => {
    const env = createEnvironment({
        progressionOptions: {
            recommendedGyms: []
        }
    });

    assert.deepEqual(
        env.service.getRecommendedNextGym({}),
        []
    );
});

test("getRecommendedNextGym preserves multiple recommended gyms", () => {
    const expected = [
        { id: "GYM_A", order: 1 },
        { id: "GYM_B", order: 1 }
    ];

    const env = createEnvironment({
        progressionOptions: {
            recommendedGyms: expected
        }
    });

    assert.strictEqual(
        env.service.getRecommendedNextGym({}),
        expected
    );
});

test("getRecommendedNextGym propagates progression errors", () => {
    const progression = createProgressionService(createGyms(), {
        getRecommendedNextGyms() {
            throw new Error("Recommendation lookup failed");
        }
    });

    const env = createEnvironment({ progression });

    assert.throws(
        () => env.service.getRecommendedNextGym({}),
        /Recommendation lookup failed/
    );
});

// --------------------------------------------------
// getProgressionStats
// --------------------------------------------------

test("getProgressionStats returns total and completed counts", () => {
    const env = createEnvironment({
        progressionOptions: {
            gymCount: 8,
            completedCount: 3
        }
    });

    const trainer = createTrainerState();

    assert.deepEqual(
        env.service.getProgressionStats(trainer.state),
        {
            total: 8,
            completed: 3
        }
    );
});

test("getProgressionStats returns zero counts for an empty progression", () => {
    const env = createEnvironment({
        gyms: [],
        progressionOptions: {
            gymCount: 0,
            completedCount: 0
        }
    });

    assert.deepEqual(
        env.service.getProgressionStats({}),
        {
            total: 0,
            completed: 0
        }
    );
});

test("getProgressionStats delegates to getGymCount", () => {
    const env = createEnvironment({
        progressionOptions: {
            gymCount: 5
        }
    });

    env.service.getProgressionStats({});

    assert.equal(
        env.progression.calls.getGymCount,
        1
    );
});

test("getProgressionStats passes trainer state to getCompletedGymCount", () => {
    const env = createEnvironment({
        progressionOptions: {
            completedCount: 2
        }
    });

    const trainer = createTrainerState();

    env.service.getProgressionStats(trainer.state);

    assert.deepEqual(
        env.progression.calls.getCompletedGymCount,
        [trainer.state]
    );
});

test("getProgressionStats returns the exact underlying counts", () => {
    const env = createEnvironment({
        progressionOptions: {
            gymCount: 16,
            completedCount: 7
        }
    });

    assert.deepEqual(
        env.service.getProgressionStats({}),
        {
            total: 16,
            completed: 7
        }
    );
});

test("getProgressionStats propagates count errors", () => {
    const progression = createProgressionService(createGyms(), {
        getGymCount() {
            throw new Error("Gym count failed");
        }
    });

    const env = createEnvironment({ progression });

    assert.throws(
        () => env.service.getProgressionStats({}),
        /Gym count failed/
    );
});

test("getProgressionStats propagates completed count errors", () => {
    const progression = createProgressionService(createGyms(), {
        getCompletedGymCount() {
            throw new Error("Completed count failed");
        }
    });

    const env = createEnvironment({ progression });

    assert.throws(
        () => env.service.getProgressionStats({}),
        /Completed count failed/
    );
});

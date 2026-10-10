"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GymRewardService = require("../scripts/services/gym-reward-service");

// --------------------------------------------------
// Fixtures and mock dependencies
// --------------------------------------------------

function createGyms() {
    return [
        {
            id: "PEWTER_GYM",
            badge: "BOULDER_BADGE",
            rewards: {
                money: 1500,
                items: ["TM39", "POTION"],
                hmAbilities: ["CUT"]
            }
        },
        {
            id: "CERULEAN_GYM",
            badge: "CASCADE_BADGE",
            rewards: {
                money: 2500,
                items: ["TM11"],
                hmAbilities: ["SURF"]
            }
        },
        {
            id: "VERMILION_GYM",
            badge: "THUNDER_BADGE",
            rewards: {
                money: 3000,
                items: ["TM24", "SUPER_POTION"],
                hmAbilities: []
            }
        },
        {
            id: "FUCHSIA_GYM",
            badge: "SOUL_BADGE",
            rewards: {
                money: 4000,
                items: ["TM06"],
                hmAbilities: ["STRENGTH"]
            }
        },
        {
            id: "NO_BADGE_GYM",
            rewards: {
                items: ["POTION"],
                hmAbilities: []
            }
        },
        {
            id: "MINIMAL_GYM",
            badge: "TEST_BADGE"
        }
    ];
}

function createDatabase(gyms = createGyms()) {
    const calls = {
        getGym: [],
        hasGym: [],
        getAllGyms: 0
    };

    return {
        gyms,
        calls,

        getGym(gymId) {
            calls.getGym.push(gymId);

            return gyms.find(gym => gym.id === gymId) || null;
        },

        hasGym(gymId) {
            calls.hasGym.push(gymId);

            return gyms.some(gym => gym.id === gymId);
        },

        getAllGyms() {
            calls.getAllGyms += 1;

            return gyms;
        }
    };
}

function createTrainerState() {
    const calls = {
        addBadge: [],
        addItem: [],
        addHMAbility: [],
        completeBattle: [],
        actions: []
    };

    const state = {
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

    return { state, calls };
}

function createEnvironment(options = {}) {
    const database = Object.prototype.hasOwnProperty.call(
        options,
        "database"
    )
        ? options.database
        : createDatabase(options.gyms || createGyms());

    return {
        database,
        service: new GymRewardService(database)
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a GymRewardService instance", () => {
    const { service } = createEnvironment();

    assert.ok(service instanceof GymRewardService);
});

test("constructor stores the supplied database service", () => {
    const { service, database } = createEnvironment();

    assert.strictEqual(service.database, database);
});

test("constructor does not load gym records independently", () => {
    const database = {
        getGym() {
            return null;
        }
    };

    const service = new GymRewardService(database);

    assert.strictEqual(service.database, database);
});

// --------------------------------------------------
// getReward
// --------------------------------------------------

test("getReward returns the Boulder Badge and Pewter rewards", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getReward("PEWTER_GYM"),
        {
            badge: "BOULDER_BADGE",
            rewards: {
                money: 1500,
                items: ["TM39", "POTION"],
                hmAbilities: ["CUT"]
            }
        }
    );
});

test("getReward returns rewards for Cerulean Gym", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getReward("CERULEAN_GYM"),
        {
            badge: "CASCADE_BADGE",
            rewards: {
                money: 2500,
                items: ["TM11"],
                hmAbilities: ["SURF"]
            }
        }
    );
});

test("getReward returns the gym badge", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.getReward("VERMILION_GYM").badge,
        "THUNDER_BADGE"
    );
});

test("getReward returns the gym rewards object", () => {
    const { service, database } = createEnvironment();

    const result = service.getReward("PEWTER_GYM");
    const gym = database.gyms.find(
        entry => entry.id === "PEWTER_GYM"
    );

    assert.strictEqual(result.rewards, gym.rewards);
});

test("getReward returns an empty rewards object when rewards are missing", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getReward("MINIMAL_GYM"),
        {
            badge: "TEST_BADGE",
            rewards: {}
        }
    );
});

test("getReward returns an empty rewards object when rewards are null", () => {
    const gyms = createGyms();

    gyms[0].rewards = null;

    const { service } = createEnvironment({ gyms });

    assert.deepEqual(
        service.getReward("PEWTER_GYM"),
        {
            badge: "BOULDER_BADGE",
            rewards: {}
        }
    );
});

test("getReward returns an empty rewards object when rewards are false", () => {
    const gyms = createGyms();

    gyms[0].rewards = false;

    const { service } = createEnvironment({ gyms });

    assert.deepEqual(
        service.getReward("PEWTER_GYM"),
        {
            badge: "BOULDER_BADGE",
            rewards: {}
        }
    );
});

test("getReward returns an undefined badge when the gym has no badge", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getReward("NO_BADGE_GYM"),
        {
            badge: undefined,
            rewards: {
                items: ["POTION"],
                hmAbilities: []
            }
        }
    );
});

test("getReward returns null for an unknown gym", () => {
    const { service } = createEnvironment();

    assert.equal(service.getReward("UNKNOWN_GYM"), null);
});

test("getReward returns null for an empty gym ID", () => {
    const { service } = createEnvironment();

    assert.equal(service.getReward(""), null);
});

test("getReward returns null for a null gym ID", () => {
    const { service } = createEnvironment();

    assert.equal(service.getReward(null), null);
});

test("getReward delegates to the database service", () => {
    const { service, database } = createEnvironment();

    service.getReward("CERULEAN_GYM");

    assert.deepEqual(
        database.calls.getGym,
        ["CERULEAN_GYM"]
    );
});

test("getReward passes the gym ID unchanged", () => {
    const database = {
        getGym(gymId) {
            assert.equal(gymId, "custom-gym-id");

            return {
                id: gymId,
                badge: "CUSTOM_BADGE",
                rewards: {}
            };
        }
    };

    const service = new GymRewardService(database);

    assert.deepEqual(
        service.getReward("custom-gym-id"),
        {
            badge: "CUSTOM_BADGE",
            rewards: {}
        }
    );
});

test("getReward propagates database lookup errors", () => {
    const service = new GymRewardService({
        getGym() {
            throw new Error("Gym lookup failed");
        }
    });

    assert.throws(
        () => service.getReward("PEWTER_GYM"),
        /Gym lookup failed/
    );
});

// --------------------------------------------------
// giveRewards: unknown gyms
// --------------------------------------------------

test("giveRewards rejects an unknown gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    assert.deepEqual(
        service.giveRewards("UNKNOWN_GYM", trainer.state),
        {
            success: false,
            reason: "Unknown gym"
        }
    );
});

test("giveRewards does not modify trainer state for an unknown gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.giveRewards("UNKNOWN_GYM", trainer.state);

    assert.deepEqual(trainer.calls.actions, []);
    assert.deepEqual(trainer.calls.addBadge, []);
    assert.deepEqual(trainer.calls.addItem, []);
    assert.deepEqual(trainer.calls.addHMAbility, []);
    assert.deepEqual(trainer.calls.completeBattle, []);
});

test("giveRewards looks up the requested gym", () => {
    const { service, database } = createEnvironment();
    const trainer = createTrainerState();

    service.giveRewards("CERULEAN_GYM", trainer.state);

    assert.deepEqual(
        database.calls.getGym,
        ["CERULEAN_GYM"]
    );
});

test("giveRewards does not retrieve rewards for an unknown gym", () => {
    const { service, database } = createEnvironment();
    const trainer = createTrainerState();

    service.giveRewards("UNKNOWN_GYM", trainer.state);

    assert.deepEqual(
        database.calls.getGym,
        ["UNKNOWN_GYM"]
    );
});

// --------------------------------------------------
// giveRewards: successful completion
// --------------------------------------------------

test("giveRewards successfully completes Pewter Gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
});

test("giveRewards returns the completed gym ID", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.gym, "PEWTER_GYM");
});

test("giveRewards returns the gym badge", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.badge, "BOULDER_BADGE");
});

test("giveRewards returns the gym rewards", () => {
    const { service, database } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "PEWTER_GYM",
        trainer.state
    );

    const gym = database.gyms.find(
        entry => entry.id === "PEWTER_GYM"
    );

    assert.strictEqual(result.rewards, gym.rewards);
});

test("giveRewards awards the gym badge", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.giveRewards("PEWTER_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.addBadge,
        ["BOULDER_BADGE"]
    );
});

test("giveRewards awards every item in the gym rewards", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.giveRewards("PEWTER_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.addItem,
        ["TM39", "POTION"]
    );
});

test("giveRewards awards every HM ability in the gym rewards", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.giveRewards("PEWTER_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.addHMAbility,
        ["CUT"]
    );
});

test("giveRewards marks the gym battle as complete", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.giveRewards("PEWTER_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.completeBattle,
        ["PEWTER_GYM"]
    );
});

test("giveRewards applies actions in badge, item, ability, completion order", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.giveRewards("PEWTER_GYM", trainer.state);

    assert.deepEqual(trainer.calls.actions, [
        ["addBadge", "BOULDER_BADGE"],
        ["addItem", "TM39"],
        ["addItem", "POTION"],
        ["addHMAbility", "CUT"],
        ["completeBattle", "PEWTER_GYM"]
    ]);
});

test("giveRewards applies the correct rewards for Cerulean Gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "CERULEAN_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.equal(result.badge, "CASCADE_BADGE");

    assert.deepEqual(
        trainer.calls.addItem,
        ["TM11"]
    );

    assert.deepEqual(
        trainer.calls.addHMAbility,
        ["SURF"]
    );

    assert.deepEqual(
        trainer.calls.completeBattle,
        ["CERULEAN_GYM"]
    );
});

test("giveRewards applies the correct rewards for Vermilion Gym", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "VERMILION_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.equal(result.badge, "THUNDER_BADGE");

    assert.deepEqual(
        trainer.calls.addItem,
        ["TM24", "SUPER_POTION"]
    );

    assert.deepEqual(
        trainer.calls.addHMAbility,
        []
    );
});

// --------------------------------------------------
// giveRewards: optional badge
// --------------------------------------------------

test("giveRewards does not award a badge when the gym has no badge", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "NO_BADGE_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.equal(result.badge, undefined);
    assert.deepEqual(trainer.calls.addBadge, []);
});

test("giveRewards does not award a null badge", () => {
    const gyms = createGyms();

    gyms[0].badge = null;

    const { service } = createEnvironment({ gyms });
    const trainer = createTrainerState();

    service.giveRewards("PEWTER_GYM", trainer.state);

    assert.deepEqual(trainer.calls.addBadge, []);
});

test("giveRewards does not award an empty badge string", () => {
    const gyms = createGyms();

    gyms[0].badge = "";

    const { service } = createEnvironment({ gyms });
    const trainer = createTrainerState();

    service.giveRewards("PEWTER_GYM", trainer.state);

    assert.deepEqual(trainer.calls.addBadge, []);
});

test("giveRewards still awards items when there is no badge", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    service.giveRewards("NO_BADGE_GYM", trainer.state);

    assert.deepEqual(
        trainer.calls.addItem,
        ["POTION"]
    );

    assert.deepEqual(
        trainer.calls.completeBattle,
        ["NO_BADGE_GYM"]
    );
});

// --------------------------------------------------
// giveRewards: missing and empty rewards
// --------------------------------------------------

test("giveRewards handles a gym whose rewards are missing", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "MINIMAL_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.deepEqual(result.rewards, {});
    assert.deepEqual(trainer.calls.addItem, []);
    assert.deepEqual(trainer.calls.addHMAbility, []);
});

test("giveRewards handles an empty items list", () => {
    const gyms = createGyms();

    gyms[0].rewards.items = [];

    const { service } = createEnvironment({ gyms });
    const trainer = createTrainerState();

    service.giveRewards("PEWTER_GYM", trainer.state);

    assert.deepEqual(trainer.calls.addItem, []);
});

test("giveRewards handles an empty HM abilities list", () => {
    const gyms = createGyms();

    gyms[0].rewards.hmAbilities = [];

    const { service } = createEnvironment({ gyms });
    const trainer = createTrainerState();

    service.giveRewards("PEWTER_GYM", trainer.state);

    assert.deepEqual(trainer.calls.addHMAbility, []);
});

test("giveRewards defaults missing items to an empty array", () => {
    const gyms = createGyms();

    delete gyms[0].rewards.items;

    const { service } = createEnvironment({ gyms });
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.deepEqual(trainer.calls.addItem, []);
});

test("giveRewards defaults missing HM abilities to an empty array", () => {
    const gyms = createGyms();

    delete gyms[0].rewards.hmAbilities;

    const { service } = createEnvironment({ gyms });
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.deepEqual(trainer.calls.addHMAbility, []);
});

test("giveRewards handles null items", () => {
    const gyms = createGyms();

    gyms[0].rewards.items = null;

    const { service } = createEnvironment({ gyms });
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.deepEqual(trainer.calls.addItem, []);
});

test("giveRewards handles null HM abilities", () => {
    const gyms = createGyms();

    gyms[0].rewards.hmAbilities = null;

    const { service } = createEnvironment({ gyms });
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);
    assert.deepEqual(trainer.calls.addHMAbility, []);
});

test("giveRewards completes the battle when there are no items or HM abilities", () => {
    const gyms = createGyms();

    gyms[0].rewards = {
        money: 1000,
        items: [],
        hmAbilities: []
    };

    const { service } = createEnvironment({ gyms });
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.success, true);

    assert.deepEqual(
        trainer.calls.completeBattle,
        ["PEWTER_GYM"]
    );
});

test("giveRewards returns reward metadata without separately distributing money", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    const result = service.giveRewards(
        "PEWTER_GYM",
        trainer.state
    );

    assert.equal(result.rewards.money, 1500);
    assert.deepEqual(trainer.calls.actions, [
        ["addBadge", "BOULDER_BADGE"],
        ["addItem", "TM39"],
        ["addItem", "POTION"],
        ["addHMAbility", "CUT"],
        ["completeBattle", "PEWTER_GYM"]
    ]);
});

// --------------------------------------------------
// giveRewards: errors
// --------------------------------------------------

test("giveRewards propagates database lookup errors", () => {
    const service = new GymRewardService({
        getGym() {
            throw new Error("Database lookup failed");
        }
    });

    const trainer = createTrainerState();

    assert.throws(
        () => service.giveRewards(
            "PEWTER_GYM",
            trainer.state
        ),
        /Database lookup failed/
    );
});

test("giveRewards propagates addBadge errors", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    trainer.state.addBadge = () => {
        throw new Error("Badge update failed");
    };

    assert.throws(
        () => service.giveRewards(
            "PEWTER_GYM",
            trainer.state
        ),
        /Badge update failed/
    );
});

test("giveRewards propagates addItem errors", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    trainer.state.addItem = () => {
        throw new Error("Item update failed");
    };

    assert.throws(
        () => service.giveRewards(
            "PEWTER_GYM",
            trainer.state
        ),
        /Item update failed/
    );
});

test("giveRewards propagates addHMAbility errors", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    trainer.state.addHMAbility = () => {
        throw new Error("HM ability update failed");
    };

    assert.throws(
        () => service.giveRewards(
            "PEWTER_GYM",
            trainer.state
        ),
        /HM ability update failed/
    );
});

test("giveRewards propagates completeBattle errors", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    trainer.state.completeBattle = () => {
        throw new Error("Battle completion failed");
    };

    assert.throws(
        () => service.giveRewards(
            "PEWTER_GYM",
            trainer.state
        ),
        /Battle completion failed/
    );
});

test("giveRewards stops before awarding items if addBadge throws", () => {
    const { service } = createEnvironment();
    const trainer = createTrainerState();

    trainer.state.addBadge = () => {
        throw new Error("Badge update failed");
    };

    assert.throws(
        () => service.giveRewards(
            "PEWTER_GYM",
            trainer.state
        ),
        /Badge update failed/
    );

    assert.deepEqual(trainer.calls.addItem, []);
    assert.deepEqual(trainer.calls.addHMAbility, []);
    assert.deepEqual(trainer.calls.completeBattle, []);
});

// --------------------------------------------------
// hasReward
// --------------------------------------------------

test("hasReward returns true for an existing gym", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.hasReward("PEWTER_GYM"),
        true
    );
});

test("hasReward returns false for an unknown gym", () => {
    const { service } = createEnvironment();

    assert.equal(
        service.hasReward("UNKNOWN_GYM"),
        false
    );
});

test("hasReward delegates to database hasGym", () => {
    const { service, database } = createEnvironment();

    service.hasReward("CERULEAN_GYM");

    assert.deepEqual(
        database.calls.hasGym,
        ["CERULEAN_GYM"]
    );
});

test("hasReward passes the gym ID unchanged", () => {
    const database = {
        hasGym(gymId) {
            assert.equal(gymId, "custom-gym");
            return true;
        }
    };

    const service = new GymRewardService(database);

    assert.equal(service.hasReward("custom-gym"), true);
});

test("hasReward returns the database result unchanged", () => {
    const database = {
        hasGym() {
            return "custom-result";
        }
    };

    const service = new GymRewardService(database);

    assert.equal(
        service.hasReward("PEWTER_GYM"),
        "custom-result"
    );
});

test("hasReward propagates database errors", () => {
    const service = new GymRewardService({
        hasGym() {
            throw new Error("Gym existence check failed");
        }
    });

    assert.throws(
        () => service.hasReward("PEWTER_GYM"),
        /Gym existence check failed/
    );
});

// --------------------------------------------------
// getAllRewards
// --------------------------------------------------

test("getAllRewards returns an array", () => {
    const { service } = createEnvironment();

    assert.ok(Array.isArray(service.getAllRewards()));
});

test("getAllRewards returns one entry per gym", () => {
    const { service, database } = createEnvironment();

    assert.equal(
        service.getAllRewards().length,
        database.gyms.length
    );
});

test("getAllRewards returns each gym ID, badge, and rewards", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getAllRewards()[0],
        {
            id: "PEWTER_GYM",
            badge: "BOULDER_BADGE",
            rewards: {
                money: 1500,
                items: ["TM39", "POTION"],
                hmAbilities: ["CUT"]
            }
        }
    );
});

test("getAllRewards preserves the gym order", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getAllRewards().map(reward => reward.id),
        [
            "PEWTER_GYM",
            "CERULEAN_GYM",
            "VERMILION_GYM",
            "FUCHSIA_GYM",
            "NO_BADGE_GYM",
            "MINIMAL_GYM"
        ]
    );
});

test("getAllRewards preserves badges", () => {
    const { service } = createEnvironment();

    assert.deepEqual(
        service.getAllRewards().map(reward => reward.badge),
        [
            "BOULDER_BADGE",
            "CASCADE_BADGE",
            "THUNDER_BADGE",
            "SOUL_BADGE",
            undefined,
            "TEST_BADGE"
        ]
    );
});

test("getAllRewards preserves missing rewards as undefined", () => {
    const { service } = createEnvironment();

    const reward = service.getAllRewards().find(
        entry => entry.id === "MINIMAL_GYM"
    );

    assert.equal(reward.rewards, undefined);
});

test("getAllRewards preserves the original rewards references", () => {
    const { service, database } = createEnvironment();

    const allRewards = service.getAllRewards();

    assert.strictEqual(
        allRewards[0].rewards,
        database.gyms[0].rewards
    );
});

test("getAllRewards returns new result objects on repeated calls", () => {
    const { service } = createEnvironment();

    const first = service.getAllRewards();
    const second = service.getAllRewards();

    assert.notStrictEqual(first, second);
    assert.notStrictEqual(first[0], second[0]);
});

test("getAllRewards delegates to database getAllGyms", () => {
    const { service, database } = createEnvironment();

    service.getAllRewards();

    assert.equal(database.calls.getAllGyms, 1);
});

test("getAllRewards returns an empty array for an empty database", () => {
    const { service } = createEnvironment({
        gyms: []
    });

    assert.deepEqual(service.getAllRewards(), []);
});

test("getAllRewards propagates database errors", () => {
    const service = new GymRewardService({
        getAllGyms() {
            throw new Error("Could not retrieve gyms");
        }
    });

    assert.throws(
        () => service.getAllRewards(),
        /Could not retrieve gyms/
    );
});

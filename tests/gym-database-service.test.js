"use strict";

const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const GymDatabaseService = require(
    "../scripts/services/gym-database-service"
);

const TEST_GAME = `__gym_database_service_test_${process.pid}`;
const GENERATED_DIR = path.resolve(
    process.cwd(),
    "database/generated"
);

const GYMS = {
    PEWTER_GYM: {
        id: "PEWTER_GYM",
        order: 1,
        city: "Pewter City",
        trainer: "Brock",
        badge: "BOULDER_BADGE",
        battleEvent: "BATTLE_BROCK",
        rewards: {
            money: 1500,
            items: ["TM39"]
        },
        requirements: {
            badges: []
        }
    },

    CERULEAN_GYM: {
        id: "CERULEAN_GYM",
        order: 2,
        city: "Cerulean City",
        trainer: "Misty",
        badge: "CASCADE_BADGE",
        battleEvent: "BATTLE_MISTY",
        rewards: {
            money: 1900
        },
        requirements: {
            badges: ["BOULDER_BADGE"]
        }
    },

    VERMILION_GYM: {
        id: "VERMILION_GYM",
        order: 3,
        city: "Vermilion City",
        trainer: "Lt. Surge",
        badge: "THUNDER_BADGE",
        battleEvent: "BATTLE_SURGE",
        rewards: {
            money: 2100
        },
        requirements: {
            badges: ["CASCADE_BADGE"]
        }
    },

    FUCHSIA_GYM: {
        id: "FUCHSIA_GYM",
        order: 4,
        city: "Fuchsia City",
        trainer: "Koga",
        badge: "SOUL_BADGE",
        battleEvent: "BATTLE_KOGA"
    }
};

function writeFixture(game, contents) {
    const directory = path.join(GENERATED_DIR, game);
    const file = path.join(directory, "gyms.json");

    fs.mkdirSync(directory, { recursive: true });

    fs.writeFileSync(
        file,
        typeof contents === "string"
            ? contents
            : JSON.stringify(contents, null, 2),
        "utf8"
    );

    return { directory, file };
}

function removeFixture(game) {
    fs.rmSync(
        path.join(GENERATED_DIR, game),
        {
            recursive: true,
            force: true
        }
    );
}

function createService(game = TEST_GAME) {
    return new GymDatabaseService(game);
}

function captureConsole(method, callback) {
    const original = console[method];
    const calls = [];

    console[method] = (...args) => {
        calls.push(args);
    };

    try {
        return {
            result: callback(),
            calls
        };
    } finally {
        console[method] = original;
    }
}

writeFixture(TEST_GAME, GYMS);

after(() => {
    removeFixture(TEST_GAME);
});

// --------------------------------------------------
// Constructor and loading
// --------------------------------------------------

test("constructor creates a GymDatabaseService instance", () => {
    assert.ok(createService() instanceof GymDatabaseService);
});

test("constructor stores the supplied game name", () => {
    assert.equal(createService().game, TEST_GAME);
});

test("constructor loads the gym database", () => {
    const service = createService();

    assert.deepEqual(service.gyms, GYMS);
});

test("constructor loads all gym records", () => {
    const service = createService();

    assert.equal(Object.keys(service.gyms).length, 4);
});

test("constructor preserves gym database keys", () => {
    const service = createService();

    assert.deepEqual(
        Object.keys(service.gyms),
        ["PEWTER_GYM", "CERULEAN_GYM", "VERMILION_GYM", "FUCHSIA_GYM"]
    );
});

test("constructor loads metadata for each gym", () => {
    const service = createService();

    assert.equal(service.gyms.PEWTER_GYM.city, "Pewter City");
    assert.equal(service.gyms.PEWTER_GYM.trainer, "Brock");
    assert.equal(service.gyms.PEWTER_GYM.badge, "BOULDER_BADGE");
});

test("constructor parses JSON from the gym database file", () => {
    const game = `${TEST_GAME}_json`;

    try {
        writeFixture(game, '{"TEST_GYM":{"id":"TEST_GYM","order":1}}');

        assert.deepEqual(createService(game).gyms, {
            TEST_GYM: {
                id: "TEST_GYM",
                order: 1
            }
        });
    } finally {
        removeFixture(game);
    }
});

test("constructor loads the requested game's database", () => {
    const game = `${TEST_GAME}_alternate`;

    try {
        writeFixture(game, {
            ALTERNATE_GYM: {
                id: "ALTERNATE_GYM",
                order: 1,
                city: "Alternate City"
            }
        });

        const service = createService(game);

        assert.deepEqual(service.gyms, {
            ALTERNATE_GYM: {
                id: "ALTERNATE_GYM",
                order: 1,
                city: "Alternate City"
            }
        });
    } finally {
        removeFixture(game);
    }
});

test("constructor defaults the game to firered", () => {
    const service = captureConsole("warn", () =>
        new GymDatabaseService()
    ).result;

    assert.equal(service.game, "firered");
});

test("constructor returns an empty database when the file is missing", () => {
    const game = `${TEST_GAME}_missing`;

    try {
        const captured = captureConsole("warn", () =>
            createService(game)
        );

        assert.deepEqual(captured.result.gyms, {});
        assert.equal(captured.calls.length, 1);
        assert.match(
            captured.calls[0][0],
            /Gym database not found/
        );
    } finally {
        removeFixture(game);
    }
});

test("constructor logs the missing database path", () => {
    const game = `${TEST_GAME}_missing_path`;

    const captured = captureConsole("warn", () =>
        createService(game)
    );

    assert.match(
        captured.calls[0][1],
        new RegExp(`${game.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/gyms\\.json$`)
    );
});

test("constructor returns an empty database when JSON parsing fails", () => {
    const game = `${TEST_GAME}_invalid_json`;

    try {
        writeFixture(game, "{ invalid JSON");

        const captured = captureConsole("error", () =>
            createService(game)
        );

        assert.deepEqual(captured.result.gyms, {});
        assert.equal(captured.calls.length, 1);
        assert.match(
            captured.calls[0][0],
            /Failed loading gym database/
        );
    } finally {
        removeFixture(game);
    }
});

test("constructor logs the JSON parsing error message", () => {
    const game = `${TEST_GAME}_invalid_message`;

    try {
        writeFixture(game, "{ invalid JSON");

        const captured = captureConsole("error", () =>
            createService(game)
        );

        assert.match(captured.calls[0][1], /Unexpected|Expected/i);

    } finally {
        removeFixture(game);
    }
});

test("constructor accepts an empty gym database", () => {
    const game = `${TEST_GAME}_empty`;

    try {
        writeFixture(game, {});

        assert.deepEqual(createService(game).gyms, {});
    } finally {
        removeFixture(game);
    }
});

// --------------------------------------------------
// loadDatabase()
// --------------------------------------------------

test("loadDatabase returns the parsed database", () => {
    const service = createService();

    assert.deepEqual(service.loadDatabase(), GYMS);
});

test("loadDatabase returns an empty object when the file is missing", () => {
    const game = `${TEST_GAME}_load_missing`;

    const service = new GymDatabaseService(game);

    const captured = captureConsole("warn", () =>
        service.loadDatabase()
    );

    assert.deepEqual(captured.result, {});
    assert.equal(captured.calls.length, 1);
});

test("loadDatabase returns an empty object when reading invalid JSON", () => {
    const game = `${TEST_GAME}_load_invalid`;

    try {
        writeFixture(game, "invalid");

        const service = new GymDatabaseService(game);
        const captured = captureConsole("error", () =>
            service.loadDatabase()
        );

        assert.deepEqual(captured.result, {});
        assert.equal(captured.calls.length, 1);
    } finally {
        removeFixture(game);
    }
});

test("loadDatabase does not mutate a valid database file", () => {
    const fixture = path.join(
        GENERATED_DIR,
        TEST_GAME,
        "gyms.json"
    );

    const before = fs.readFileSync(fixture, "utf8");

    createService().loadDatabase();

    assert.equal(fs.readFileSync(fixture, "utf8"), before);
});

// --------------------------------------------------
// getAllGyms()
// --------------------------------------------------

test("getAllGyms returns an array", () => {
    assert.ok(Array.isArray(createService().getAllGyms()));
});

test("getAllGyms returns every gym", () => {
    assert.equal(createService().getAllGyms().length, 4);
});

test("getAllGyms sorts gyms by ascending order", () => {
    const service = createService();

    assert.deepEqual(
        service.getAllGyms().map(gym => gym.order),
        [1, 2, 3, 4]
    );
});

test("getAllGyms returns gyms in their configured order", () => {
    const service = createService();

    assert.deepEqual(
        service.getAllGyms().map(gym => gym.id),
        [
            "PEWTER_GYM",
            "CERULEAN_GYM",
            "VERMILION_GYM",
            "FUCHSIA_GYM"
        ]
    );
});

test("getAllGyms preserves each gym's metadata", () => {
    const service = createService();

    const gyms = service.getAllGyms();

    assert.equal(gyms[0].city, "Pewter City");
    assert.equal(gyms[1].trainer, "Misty");
    assert.equal(gyms[2].badge, "THUNDER_BADGE");
});

test("getAllGyms does not reorder the internal database keys", () => {
    const service = createService();
    const before = Object.keys(service.gyms);

    service.getAllGyms();

    assert.deepEqual(Object.keys(service.gyms), before);
});

test("getAllGyms returns a new sorted array on each call", () => {
    const service = createService();

    assert.notStrictEqual(
        service.getAllGyms(),
        service.getAllGyms()
    );
});

test("getAllGyms returns the original gym objects", () => {
    const service = createService();

    const firstGym = service.getAllGyms()[0];

    assert.strictEqual(
        firstGym,
        service.gyms.PEWTER_GYM
    );
});

test("getAllGyms returns an empty array for an empty database", () => {
    const game = `${TEST_GAME}_empty_gyms`;

    try {
        writeFixture(game, {});

        assert.deepEqual(createService(game).getAllGyms(), []);
    } finally {
        removeFixture(game);
    }
});

test("getAllGyms handles a single gym", () => {
    const game = `${TEST_GAME}_single_gym`;

    try {
        writeFixture(game, {
            ONLY_GYM: {
                id: "ONLY_GYM",
                order: 1
            }
        });

        assert.deepEqual(
            createService(game).getAllGyms().map(gym => gym.id),
            ["ONLY_GYM"]
        );
    } finally {
        removeFixture(game);
    }
});

// --------------------------------------------------
// getGymCount()
// --------------------------------------------------

test("getGymCount returns the number of gyms", () => {
    assert.equal(createService().getGymCount(), 4);
});

test("getGymCount agrees with getAllGyms length", () => {
    const service = createService();

    assert.equal(
        service.getGymCount(),
        service.getAllGyms().length
    );
});

test("getGymCount returns zero for an empty database", () => {
    const game = `${TEST_GAME}_count_empty`;

    try {
        writeFixture(game, {});

        assert.equal(createService(game).getGymCount(), 0);
    } finally {
        removeFixture(game);
    }
});

// --------------------------------------------------
// getGym()
// --------------------------------------------------

test("getGym retrieves a gym by its database key", () => {
    const service = createService();

    assert.deepEqual(
        service.getGym("PEWTER_GYM"),
        GYMS.PEWTER_GYM
    );
});

test("getGym returns the original gym object", () => {
    const service = createService();

    assert.strictEqual(
        service.getGym("PEWTER_GYM"),
        service.gyms.PEWTER_GYM
    );
});

test("getGym returns null for an unknown gym", () => {
    assert.equal(createService().getGym("UNKNOWN_GYM"), null);
});

test("getGym returns null for an empty ID", () => {
    assert.equal(createService().getGym(""), null);
});

test("getGym returns null for a missing ID", () => {
    assert.equal(createService().getGym(undefined), null);
});

test("getGym returns null for a null ID", () => {
    assert.equal(createService().getGym(null), null);
});

test("getGym uses exact database key matching", () => {
    const service = createService();

    assert.equal(service.getGym("pewter_gym"), null);
    assert.equal(service.getGym("PEWTER_GYM").id, "PEWTER_GYM");
});

// --------------------------------------------------
// hasGym()
// --------------------------------------------------

test("hasGym returns true for an existing gym", () => {
    assert.equal(createService().hasGym("PEWTER_GYM"), true);
});

test("hasGym returns true for each known gym", () => {
    const service = createService();

    for (const id of Object.keys(GYMS)) {
        assert.equal(service.hasGym(id), true);
    }
});

test("hasGym returns false for an unknown gym", () => {
    assert.equal(createService().hasGym("UNKNOWN_GYM"), false);
});

test("hasGym returns false for an empty ID", () => {
    assert.equal(createService().hasGym(""), false);
});

test("hasGym returns false for an undefined ID", () => {
    assert.equal(createService().hasGym(undefined), false);
});

test("hasGym returns false for a null ID", () => {
    assert.equal(createService().hasGym(null), false);
});

test("hasGym uses exact database key matching", () => {
    assert.equal(createService().hasGym("pewter_gym"), false);
});

// --------------------------------------------------
// City, badge, and trainer searches
// --------------------------------------------------

test("getGymByCity finds Pewter City", () => {
    assert.deepEqual(
        createService().getGymByCity("Pewter City"),
        GYMS.PEWTER_GYM
    );
});

test("getGymByCity finds Cerulean City", () => {
    assert.deepEqual(
        createService().getGymByCity("Cerulean City"),
        GYMS.CERULEAN_GYM
    );
});

test("getGymByCity returns null when no city matches", () => {
    assert.equal(
        createService().getGymByCity("Unknown City"),
        null
    );
});

test("getGymByCity uses exact city matching", () => {
    assert.equal(createService().getGymByCity("pewter city"), null);
});

test("getGymByCity returns the first gym when cities are duplicated", () => {
    const game = `${TEST_GAME}_duplicate_city`;

    try {
        writeFixture(game, {
            FIRST: {
                id: "FIRST",
                order: 1,
                city: "Shared City"
            },
            SECOND: {
                id: "SECOND",
                order: 2,
                city: "Shared City"
            }
        });

        assert.equal(
            createService(game).getGymByCity("Shared City").id,
            "FIRST"
        );
    } finally {
        removeFixture(game);
    }
});

test("getGymByBadge finds the Boulder Badge", () => {
    assert.deepEqual(
        createService().getGymByBadge("BOULDER_BADGE"),
        GYMS.PEWTER_GYM
    );
});

test("getGymByBadge finds the Cascade Badge", () => {
    assert.deepEqual(
        createService().getGymByBadge("CASCADE_BADGE"),
        GYMS.CERULEAN_GYM
    );
});

test("getGymByBadge returns null for an unknown badge", () => {
    assert.equal(
        createService().getGymByBadge("UNKNOWN_BADGE"),
        null
    );
});

test("getGymByBadge uses exact badge matching", () => {
    assert.equal(
        createService().getGymByBadge("boulder_badge"),
        null
    );
});

test("getGymByBadge returns the first gym when badges are duplicated", () => {
    const game = `${TEST_GAME}_duplicate_badge`;

    try {
        writeFixture(game, {
            FIRST: {
                id: "FIRST",
                order: 1,
                badge: "SHARED_BADGE"
            },
            SECOND: {
                id: "SECOND",
                order: 2,
                badge: "SHARED_BADGE"
            }
        });

        assert.equal(
            createService(game).getGymByBadge("SHARED_BADGE").id,
            "FIRST"
        );
    } finally {
        removeFixture(game);
    }
});

test("getGymByTrainer finds Brock", () => {
    assert.deepEqual(
        createService().getGymByTrainer("Brock"),
        GYMS.PEWTER_GYM
    );
});

test("getGymByTrainer finds Misty", () => {
    assert.deepEqual(
        createService().getGymByTrainer("Misty"),
        GYMS.CERULEAN_GYM
    );
});

test("getGymByTrainer returns null for an unknown trainer", () => {
    assert.equal(
        createService().getGymByTrainer("Unknown Trainer"),
        null
    );
});

test("getGymByTrainer uses exact trainer matching", () => {
    assert.equal(createService().getGymByTrainer("brock"), null);
});

test("getGymByTrainer returns the first gym when trainers are duplicated", () => {
    const game = `${TEST_GAME}_duplicate_trainer`;

    try {
        writeFixture(game, {
            FIRST: {
                id: "FIRST",
                order: 1,
                trainer: "Shared Trainer"
            },
            SECOND: {
                id: "SECOND",
                order: 2,
                trainer: "Shared Trainer"
            }
        });

        assert.equal(
            createService(game).getGymByTrainer("Shared Trainer").id,
            "FIRST"
        );
    } finally {
        removeFixture(game);
    }
});

// --------------------------------------------------
// Battle event, badge, rewards, requirements, order
// --------------------------------------------------

test("getBattleEvent returns a gym's battle event", () => {
    assert.equal(
        createService().getBattleEvent("PEWTER_GYM"),
        "BATTLE_BROCK"
    );
});

test("getBattleEvent returns null for an unknown gym", () => {
    assert.equal(
        createService().getBattleEvent("UNKNOWN_GYM"),
        null
    );
});

test("getBattleEvent returns undefined when an existing gym has no battle event", () => {
    const service = new GymDatabaseService(TEST_GAME);

    delete service.gyms.FUCHSIA_GYM.battleEvent;

    assert.equal(
        service.getBattleEvent("FUCHSIA_GYM"),
        undefined
    );
});

test("getBadge returns a gym's badge", () => {
    assert.equal(
        createService().getBadge("PEWTER_GYM"),
        "BOULDER_BADGE"
    );
});

test("getBadge returns null for an unknown gym", () => {
    assert.equal(createService().getBadge("UNKNOWN_GYM"), null);
});

test("getBadge returns undefined when an existing gym has no badge", () => {
    const game = `${TEST_GAME}_no_badge`;

    try {
        writeFixture(game, {
            TEST_GYM: {
                id: "TEST_GYM",
                order: 1
            }
        });

        assert.equal(
            createService(game).getBadge("TEST_GYM"),
            undefined
        );
    } finally {
        removeFixture(game);
    }
});

test("getRewards returns a gym's rewards", () => {
    assert.deepEqual(
        createService().getRewards("PEWTER_GYM"),
        GYMS.PEWTER_GYM.rewards
    );
});

test("getRewards returns the original rewards object", () => {
    const service = createService();

    assert.strictEqual(
        service.getRewards("PEWTER_GYM"),
        service.gyms.PEWTER_GYM.rewards
    );
});

test("getRewards defaults missing rewards to an empty object", () => {
    assert.deepEqual(
        createService().getRewards("FUCHSIA_GYM"),
        {}
    );
});

test("getRewards defaults null rewards to an empty object", () => {
    const game = `${TEST_GAME}_null_rewards`;

    try {
        writeFixture(game, {
            TEST_GYM: {
                id: "TEST_GYM",
                order: 1,
                rewards: null
            }
        });

        assert.deepEqual(
            createService(game).getRewards("TEST_GYM"),
            {}
        );
    } finally {
        removeFixture(game);
    }
});

test("getRewards returns null for an unknown gym", () => {
    assert.equal(createService().getRewards("UNKNOWN_GYM"), null);
});

test("getRequirements returns a gym's requirements", () => {
    assert.deepEqual(
        createService().getRequirements("CERULEAN_GYM"),
        {
            badges: ["BOULDER_BADGE"]
        }
    );
});

test("getRequirements returns the original requirements object", () => {
    const service = createService();

    assert.strictEqual(
        service.getRequirements("PEWTER_GYM"),
        service.gyms.PEWTER_GYM.requirements
    );
});

test("getRequirements defaults missing requirements to an empty object", () => {
    assert.deepEqual(
        createService().getRequirements("FUCHSIA_GYM"),
        {}
    );
});

test("getRequirements defaults null requirements to an empty object", () => {
    const game = `${TEST_GAME}_null_requirements`;

    try {
        writeFixture(game, {
            TEST_GYM: {
                id: "TEST_GYM",
                order: 1,
                requirements: null
            }
        });

        assert.deepEqual(
            createService(game).getRequirements("TEST_GYM"),
            {}
        );
    } finally {
        removeFixture(game);
    }
});

test("getRequirements returns null for an unknown gym", () => {
    assert.equal(
        createService().getRequirements("UNKNOWN_GYM"),
        null
    );
});

test("getOrder returns the configured order", () => {
    assert.equal(createService().getOrder("VERMILION_GYM"), 3);
});

test("getOrder returns one for the first gym", () => {
    assert.equal(createService().getOrder("PEWTER_GYM"), 1);
});

test("getOrder returns null for an unknown gym", () => {
    assert.equal(createService().getOrder("UNKNOWN_GYM"), null);
});

test("getOrder returns undefined for an existing gym without an order", () => {
    const game = `${TEST_GAME}_no_order`;

    try {
        writeFixture(game, {
            TEST_GYM: {
                id: "TEST_GYM"
            }
        });

        assert.equal(
            createService(game).getOrder("TEST_GYM"),
            undefined
        );
    } finally {
        removeFixture(game);
    }
});

// --------------------------------------------------
// Order-based lookup
// --------------------------------------------------

test("getGymByOrder finds the first gym", () => {
    assert.deepEqual(
        createService().getGymByOrder(1),
        GYMS.PEWTER_GYM
    );
});

test("getGymByOrder finds the third gym", () => {
    assert.deepEqual(
        createService().getGymByOrder(3),
        GYMS.VERMILION_GYM
    );
});

test("getGymByOrder returns null for an unknown order", () => {
    assert.equal(createService().getGymByOrder(99), null);
});

test("getGymByOrder uses exact order matching", () => {
    assert.equal(createService().getGymByOrder("1"), null);
});

test("getFirstGym returns the gym with order one", () => {
    assert.deepEqual(
        createService().getFirstGym(),
        GYMS.PEWTER_GYM
    );
});

test("getFirstGym returns null when no gym has order one", () => {
    const game = `${TEST_GAME}_no_first`;

    try {
        writeFixture(game, {
            SECOND: {
                id: "SECOND",
                order: 2
            }
        });

        assert.equal(createService(game).getFirstGym(), null);
    } finally {
        removeFixture(game);
    }
});

test("getLastGym returns the gym whose order equals the gym count", () => {
    assert.deepEqual(
        createService().getLastGym(),
        GYMS.FUCHSIA_GYM
    );
});

test("getLastGym returns null for an empty database", () => {
    const game = `${TEST_GAME}_no_last`;

    try {
        writeFixture(game, {});

        assert.equal(createService(game).getLastGym(), null);
    } finally {
        removeFixture(game);
    }
});

test("getLastGym returns null when gym orders are not sequential", () => {
    const game = `${TEST_GAME}_nonsequential`;

    try {
        writeFixture(game, {
            FIRST: {
                id: "FIRST",
                order: 1
            },
            THIRD: {
                id: "THIRD",
                order: 3
            }
        });

        assert.equal(createService(game).getLastGym(), null);
    } finally {
        removeFixture(game);
    }
});

test("getNextGym returns the gym after the requested order", () => {
    assert.deepEqual(
        createService().getNextGym(1),
        GYMS.CERULEAN_GYM
    );
});

test("getNextGym can find the third gym", () => {
    assert.deepEqual(
        createService().getNextGym(2),
        GYMS.VERMILION_GYM
    );
});

test("getNextGym returns null after the last gym", () => {
    assert.equal(createService().getNextGym(4), null);
});

test("getNextGym returns null for a negative order with no matching successor", () => {
    assert.equal(createService().getNextGym(-2), null);
});

// --------------------------------------------------
// Battle events
// --------------------------------------------------

test("getAllBattleEvents returns one entry per gym", () => {
    assert.equal(
        createService().getAllBattleEvents().length,
        4
    );
});

test("getAllBattleEvents returns the expected structure", () => {
    assert.deepEqual(
        createService().getAllBattleEvents(),
        [
            {
                gym: "PEWTER_GYM",
                event: "BATTLE_BROCK"
            },
            {
                gym: "CERULEAN_GYM",
                event: "BATTLE_MISTY"
            },
            {
                gym: "VERMILION_GYM",
                event: "BATTLE_SURGE"
            },
            {
                gym: "FUCHSIA_GYM",
                event: "BATTLE_KOGA"
            }
        ]
    );
});

test("getAllBattleEvents preserves gym order", () => {
    assert.deepEqual(
        createService().getAllBattleEvents().map(entry => entry.gym),
        [
            "PEWTER_GYM",
            "CERULEAN_GYM",
            "VERMILION_GYM",
            "FUCHSIA_GYM"
        ]
    );
});

test("getAllBattleEvents preserves missing battle event values as undefined", () => {
    const service = new GymDatabaseService(TEST_GAME);

    delete service.gyms.FUCHSIA_GYM.battleEvent;

    const event = service
        .getAllBattleEvents()
        .find(item => item.gym === "FUCHSIA_GYM");

    assert.deepEqual(event, {
        gym: "FUCHSIA_GYM",
        event: undefined
    });
});

test("getAllBattleEvents returns an empty array for an empty database", () => {
    const game = `${TEST_GAME}_no_battle_events`;

    try {
        writeFixture(game, {});

        assert.deepEqual(
            createService(game).getAllBattleEvents(),
            []
        );
    } finally {
        removeFixture(game);
    }
});

// --------------------------------------------------
// reload()
// --------------------------------------------------

test("reload returns the reloaded database", () => {
    const service = createService();

    assert.deepEqual(service.reload(), GYMS);
});

test("reload replaces the previous database reference", () => {
    const service = createService();
    const original = service.gyms;

    service.reload();

    assert.notStrictEqual(service.gyms, original);
});

test("reload updates the database after the file changes", () => {
    const service = createService();

    const updatedGyms = {
        NEW_GYM: {
            id: "NEW_GYM",
            order: 1,
            city: "New City",
            trainer: "New Trainer"
        }
    };

    writeFixture(TEST_GAME, updatedGyms);

    try {
        const result = service.reload();

        assert.deepEqual(result, updatedGyms);
        assert.deepEqual(service.gyms, updatedGyms);
        assert.equal(service.getGymCount(), 1);
    } finally {
        writeFixture(TEST_GAME, GYMS);
    }
});

test("reload returns an empty database when the file becomes invalid", () => {
    const service = createService();

    const fixture = writeFixture(TEST_GAME, "{ invalid JSON");

    try {
        const captured = captureConsole("error", () =>
            service.reload()
        );

        assert.deepEqual(captured.result, {});
        assert.deepEqual(service.gyms, {});
    } finally {
        writeFixture(TEST_GAME, GYMS);
    }
});

test("reload returns an empty database when the file is removed", () => {
    const service = createService();

    removeFixture(TEST_GAME);

    try {
        const captured = captureConsole("warn", () =>
            service.reload()
        );

        assert.deepEqual(captured.result, {});
        assert.deepEqual(service.gyms, {});
    } finally {
        writeFixture(TEST_GAME, GYMS);
    }
});

test("reload restores access to updated gym data", () => {
    const service = createService();

    const updatedGyms = {
        TEST_GYM: {
            id: "TEST_GYM",
            order: 1,
            badge: "TEST_BADGE"
        }
    };

    writeFixture(TEST_GAME, updatedGyms);

    try {
        service.reload();

        assert.equal(service.hasGym("TEST_GYM"), true);
        assert.equal(service.getBadge("TEST_GYM"), "TEST_BADGE");
        assert.equal(service.hasGym("PEWTER_GYM"), false);
    } finally {
        writeFixture(TEST_GAME, GYMS);
    }
});

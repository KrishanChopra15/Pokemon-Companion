"use strict";

const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const FieldObstacleService = require(
    "../scripts/services/field-obstacle-service"
);

const TEST_GAME = `__field_obstacle_service_test_${process.pid}`;
const RAW_DIR = path.resolve(__dirname, "../database/raw");

const OBSTACLES = {
    PALLET_TOWN: [],
    VIRIDIAN_FOREST: [
        {
            type: "CUT",
            name: "Small Tree"
        },
        {
            type: "ROCK_SMASH",
            name: "Cracked Rock"
        },
        {
            type: "STRENGTH",
            name: "Heavy Boulder"
        }
    ],
    ROUTE_1: [
        {
            type: "SURF",
            name: "Water"
        }
    ],
    DIGLETT_CAVE: [
        {
            type: "FLASH",
            name: "Dark Cave"
        }
    ]
};

function writeFixture(game, contents) {
    const directory = path.join(RAW_DIR, game);
    const file = path.join(directory, "field-obstacles.json");

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
        path.join(RAW_DIR, game),
        {
            recursive: true,
            force: true
        }
    );
}

function createService(
    game = TEST_GAME,
    progressionService = null
) {
    return new FieldObstacleService(game, progressionService);
}

function createPlayerState(overrides = {}) {
    return {
        hmAbilities: [],
        ...overrides
    };
}

writeFixture(TEST_GAME, OBSTACLES);

after(() => {
    removeFixture(TEST_GAME);
});

// --------------------------------------------------
// Constructor and loading
// --------------------------------------------------

test("constructor creates a FieldObstacleService instance", () => {
    assert.ok(createService() instanceof FieldObstacleService);
});

test("constructor loads the obstacle database", () => {
    assert.deepEqual(createService().obstacles, OBSTACLES);
});

test("constructor preserves the loaded location keys", () => {
    assert.deepEqual(
        Object.keys(createService().obstacles),
        Object.keys(OBSTACLES)
    );
});

test("constructor loads every obstacle in the fixture", () => {
    const service = createService();

    const total = Object.values(service.obstacles)
        .reduce((count, obstacles) => count + obstacles.length, 0);

    assert.equal(total, 5);
});

test("constructor defaults progression service to null", () => {
    const service = createService();

    assert.equal(service.progression, null);
});

test("constructor stores the injected progression service", () => {
    const progression = {
        currentStage: "GYM_1"
    };

    const service = createService(TEST_GAME, progression);

    assert.strictEqual(service.progression, progression);
});

test("constructor preserves the progression service reference", () => {
    const progression = {
        canUseAbility: () => true
    };

    assert.strictEqual(
        createService(TEST_GAME, progression).progression,
        progression
    );
});

test("constructor loads data from the requested game directory", () => {
    const game = `${TEST_GAME}_alternate`;

    try {
        writeFixture(game, {
            TEST_LOCATION: [
                {
                    type: "CUT",
                    name: "Unique Tree"
                }
            ]
        });

        const service = createService(game);

        assert.deepEqual(service.obstacles, {
            TEST_LOCATION: [
                {
                    type: "CUT",
                    name: "Unique Tree"
                }
            ]
        });
    } finally {
        removeFixture(game);
    }
});

test("constructor parses JSON from the obstacle file", () => {
    const game = `${TEST_GAME}_json`;

    try {
        writeFixture(
            game,
            '{"TEST_LOCATION":[{"type":"CUT","name":"Tree"}]}'
        );

        assert.deepEqual(createService(game).obstacles, {
            TEST_LOCATION: [
                {
                    type: "CUT",
                    name: "Tree"
                }
            ]
        });
    } finally {
        removeFixture(game);
    }
});

test("constructor throws when the obstacle database is missing", () => {
    assert.throws(
        () => createService(`${TEST_GAME}_missing`),
        error => error.code === "ENOENT"
    );
});

test("constructor throws when the obstacle file contains invalid JSON", () => {
    const game = `${TEST_GAME}_invalid_json`;

    try {
        writeFixture(game, "{ invalid JSON");

        assert.throws(
            () => createService(game),
            SyntaxError
        );
    } finally {
        removeFixture(game);
    }
});

test("constructor accepts an empty obstacle database", () => {
    const game = `${TEST_GAME}_empty`;

    try {
        writeFixture(game, {});

        assert.deepEqual(createService(game).obstacles, {});
    } finally {
        removeFixture(game);
    }
});

// --------------------------------------------------
// getObstacles()
// --------------------------------------------------

test("getObstacles returns obstacles for an existing location", () => {
    const service = createService();

    assert.deepEqual(
        service.getObstacles("VIRIDIAN_FOREST"),
        OBSTACLES.VIRIDIAN_FOREST
    );
});

test("getObstacles returns the original obstacle array", () => {
    const service = createService();

    assert.strictEqual(
        service.getObstacles("VIRIDIAN_FOREST"),
        service.obstacles.VIRIDIAN_FOREST
    );
});

test("getObstacles returns an empty array for a location with no obstacles", () => {
    const service = createService();

    assert.deepEqual(
        service.getObstacles("PALLET_TOWN"),
        []
    );
});

test("getObstacles returns an empty array for an unknown location", () => {
    const service = createService();

    assert.deepEqual(
        service.getObstacles("UNKNOWN_LOCATION"),
        []
    );
});

test("getObstacles returns an empty array for a missing location", () => {
    const service = createService();

    assert.deepEqual(service.getObstacles(undefined), []);
});

test("getObstacles returns an empty array for a null location", () => {
    const service = createService();

    assert.deepEqual(service.getObstacles(null), []);
});

test("getObstacles uses exact location key matching", () => {
    const service = createService();

    assert.deepEqual(service.getObstacles("viridian_forest"), []);
});

test("getObstacles preserves obstacle ordering", () => {
    const service = createService();

    assert.deepEqual(
        service.getObstacles("VIRIDIAN_FOREST")
            .map(obstacle => obstacle.type),
        ["CUT", "ROCK_SMASH", "STRENGTH"]
    );
});

test("getObstacles returns the empty array stored for a known location", () => {
    const service = createService();

    assert.strictEqual(
        service.getObstacles("PALLET_TOWN"),
        service.obstacles.PALLET_TOWN
    );
});

test("getObstacles returns an empty array for a location whose data is null", () => {
    const game = `${TEST_GAME}_null_location`;

    try {
        writeFixture(game, {
            NULL_LOCATION: null
        });

        assert.deepEqual(
            createService(game).getObstacles("NULL_LOCATION"),
            []
        );
    } finally {
        removeFixture(game);
    }
});

test("getObstacles returns the same reference on repeated calls for an existing location", () => {
    const service = createService();

    assert.strictEqual(
        service.getObstacles("VIRIDIAN_FOREST"),
        service.getObstacles("VIRIDIAN_FOREST")
    );
});

// --------------------------------------------------
// hasObstacle()
// --------------------------------------------------

test("hasObstacle returns true for an existing obstacle type", () => {
    const service = createService();

    assert.equal(
        service.hasObstacle("VIRIDIAN_FOREST", "CUT"),
        true
    );
});

test("hasObstacle finds an obstacle later in the list", () => {
    const service = createService();

    assert.equal(
        service.hasObstacle("VIRIDIAN_FOREST", "STRENGTH"),
        true
    );
});

test("hasObstacle returns false for a type that is absent", () => {
    const service = createService();

    assert.equal(
        service.hasObstacle("VIRIDIAN_FOREST", "SURF"),
        false
    );
});

test("hasObstacle returns false for a location without obstacles", () => {
    const service = createService();

    assert.equal(
        service.hasObstacle("PALLET_TOWN", "CUT"),
        false
    );
});

test("hasObstacle returns false for an unknown location", () => {
    const service = createService();

    assert.equal(
        service.hasObstacle("UNKNOWN_LOCATION", "CUT"),
        false
    );
});

test("hasObstacle matches obstacle type exactly", () => {
    const service = createService();

    assert.equal(
        service.hasObstacle("VIRIDIAN_FOREST", "cut"),
        false
    );
});

test("hasObstacle returns false for an empty type", () => {
    const service = createService();

    assert.equal(
        service.hasObstacle("VIRIDIAN_FOREST", ""),
        false
    );
});

test("hasObstacle returns false for a null type", () => {
    const service = createService();

    assert.equal(
        service.hasObstacle("VIRIDIAN_FOREST", null),
        false
    );
});

test("hasObstacle does not mutate the obstacle database", () => {
    const service = createService();
    const before = structuredClone(service.obstacles);

    service.hasObstacle("VIRIDIAN_FOREST", "CUT");

    assert.deepEqual(service.obstacles, before);
});

// --------------------------------------------------
// canClearObstacle(): validation and missing obstacles
// --------------------------------------------------

test("canClearObstacle handles a missing obstacle", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacle("VIRIDIAN_FOREST", null),
        {
            exists: false,
            clearable: true
        }
    );
});

test("canClearObstacle handles undefined obstacle input", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacle("VIRIDIAN_FOREST", undefined),
        {
            exists: false,
            clearable: true
        }
    );
});

test("canClearObstacle handles an empty obstacle string", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacle("VIRIDIAN_FOREST", ""),
        {
            exists: false,
            clearable: true
        }
    );
});

test("canClearObstacle handles an obstacle object without a type", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacle("VIRIDIAN_FOREST", {
            name: "Unknown obstacle"
        }),
        {
            exists: false,
            clearable: true
        }
    );
});

test("canClearObstacle handles an obstacle object with an empty type", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacle("VIRIDIAN_FOREST", {
            type: ""
        }),
        {
            exists: false,
            clearable: true
        }
    );
});

test("canClearObstacle handles an obstacle object with a null type", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacle("VIRIDIAN_FOREST", {
            type: null
        }),
        {
            exists: false,
            clearable: true
        }
    );
});

test("canClearObstacle treats a missing obstacle type as clearable", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacle("UNKNOWN_LOCATION", "CUT"),
        {
            exists: false,
            clearable: true
        }
    );
});

test("canClearObstacle treats an obstacle absent from a location as clearable", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacle("VIRIDIAN_FOREST", "SURF"),
        {
            exists: false,
            clearable: true
        }
    );
});

test("canClearObstacle does not check abilities when the obstacle is missing", () => {
    const service = createService();
    let calls = 0;

    const playerState = {
        hasHMAbility() {
            calls += 1;
            return false;
        }
    };

    service.canClearObstacle(
        "UNKNOWN_LOCATION",
        "CUT",
        playerState
    );

    assert.equal(calls, 0);
});

// --------------------------------------------------
// canClearObstacle(): hasHMAbility callback
// --------------------------------------------------

test("canClearObstacle uses hasHMAbility when supplied", () => {
    const service = createService();
    const calls = [];

    const result = service.canClearObstacle(
        "VIRIDIAN_FOREST",
        "CUT",
        {
            hasHMAbility(type) {
                calls.push(type);
                return true;
            }
        }
    );

    assert.deepEqual(calls, ["CUT"]);
    assert.deepEqual(result, {
        exists: true,
        clearable: true,
        requirement: "CUT",
        reason: null
    });
});

test("canClearObstacle returns false when hasHMAbility rejects the ability", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacle(
            "VIRIDIAN_FOREST",
            "CUT",
            {
                hasHMAbility() {
                    return false;
                }
            }
        ),
        {
            exists: true,
            clearable: false,
            requirement: "CUT",
            reason: "Requires CUT field ability"
        }
    );
});

test("canClearObstacle calls hasHMAbility with the obstacle type", () => {
    const service = createService();
    let requested;

    service.canClearObstacle(
        "ROUTE_1",
        { type: "SURF" },
        {
            hasHMAbility(type) {
                requested = type;
                return true;
            }
        }
    );

    assert.equal(requested, "SURF");
});

test("canClearObstacle supports an obstacle object with hasHMAbility", () => {
    const service = createService();

    const result = service.canClearObstacle(
        "VIRIDIAN_FOREST",
        {
            type: "ROCK_SMASH",
            name: "Cracked Rock"
        },
        {
            hasHMAbility(type) {
                return type === "ROCK_SMASH";
            }
        }
    );

    assert.equal(result.exists, true);
    assert.equal(result.clearable, true);
    assert.equal(result.requirement, "ROCK_SMASH");
    assert.equal(result.reason, null);
});

test("canClearObstacle prefers hasHMAbility over the fallback list", () => {
    const service = createService();

    const result = service.canClearObstacle(
        "VIRIDIAN_FOREST",
        "CUT",
        {
            hasHMAbility() {
                return false;
            },
            hmAbilities: ["CUT"]
        }
    );

    assert.equal(result.clearable, false);
    assert.equal(result.reason, "Requires CUT field ability");
});

test("canClearObstacle preserves the callback's returned value", () => {
    const service = createService();

    const result = service.canClearObstacle(
        "VIRIDIAN_FOREST",
        "CUT",
        {
            hasHMAbility() {
                return "allowed";
            }
        }
    );

    assert.equal(result.clearable, "allowed");
    assert.equal(result.reason, null);
});

test("canClearObstacle returns a field ability reason when the callback returns a falsy value", () => {
    const service = createService();

    const result = service.canClearObstacle(
        "VIRIDIAN_FOREST",
        "CUT",
        {
            hasHMAbility() {
                return 0;
            }
        }
    );

    assert.equal(result.clearable, 0);
    assert.equal(result.reason, "Requires CUT field ability");
});

// --------------------------------------------------
// canClearObstacle(): fallback hmAbilities array
// --------------------------------------------------

test("canClearObstacle allows an ability listed in hmAbilities", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacle(
            "VIRIDIAN_FOREST",
            "CUT",
            createPlayerState({
                hmAbilities: ["CUT"]
            })
        ),
        {
            exists: true,
            clearable: true,
            requirement: "CUT"
        }
    );
});

test("canClearObstacle rejects an ability absent from hmAbilities", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacle(
            "VIRIDIAN_FOREST",
            "CUT",
            createPlayerState({
                hmAbilities: ["SURF"]
            })
        ),
        {
            exists: true,
            clearable: false,
            requirement: "CUT"
        }
    );
});

test("canClearObstacle defaults a missing player state", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacle("VIRIDIAN_FOREST", "CUT"),
        {
            exists: true,
            clearable: false,
            requirement: "CUT"
        }
    );
});

test("canClearObstacle defaults missing hmAbilities to an empty array", () => {
    const service = createService();

    const result = service.canClearObstacle(
        "VIRIDIAN_FOREST",
        "CUT",
        {}
    );

    assert.equal(result.exists, true);
    assert.equal(result.clearable, false);
    assert.deepEqual(result, {
        exists: true,
        clearable: false,
        requirement: "CUT"
    });
});

test("canClearObstacle defaults null hmAbilities to an empty array", () => {
    const service = createService();

    const result = service.canClearObstacle(
        "VIRIDIAN_FOREST",
        "CUT",
        {
            hmAbilities: null
        }
    );

    assert.equal(result.clearable, false);
});

test("canClearObstacle defaults false hmAbilities to an empty array", () => {
    const service = createService();

    const result = service.canClearObstacle(
        "VIRIDIAN_FOREST",
        "CUT",
        {
            hmAbilities: false
        }
    );

    assert.equal(result.clearable, false);
});

test("canClearObstacle ignores unrelated abilities", () => {
    const service = createService();

    const result = service.canClearObstacle(
        "VIRIDIAN_FOREST",
        "CUT",
        {
            hmAbilities: ["SURF", "FLASH", "STRENGTH"]
        }
    );

    assert.equal(result.clearable, false);
});

test("canClearObstacle matches fallback abilities exactly", () => {
    const service = createService();

    const result = service.canClearObstacle(
        "VIRIDIAN_FOREST",
        "CUT",
        {
            hmAbilities: ["cut"]
        }
    );

    assert.equal(result.clearable, false);
});

test("canClearObstacle does not include reason in the fallback result", () => {
    const service = createService();

    const result = service.canClearObstacle(
        "VIRIDIAN_FOREST",
        "CUT",
        {
            hmAbilities: []
        }
    );

    assert.equal(
        Object.prototype.hasOwnProperty.call(result, "reason"),
        false
    );
});

test("canClearObstacle returns the required type in fallback mode", () => {
    const service = createService();

    const result = service.canClearObstacle(
        "VIRIDIAN_FOREST",
        {
            type: "STRENGTH"
        },
        {
            hmAbilities: ["STRENGTH"]
        }
    );

    assert.equal(result.requirement, "STRENGTH");
    assert.equal(result.clearable, true);
});

// --------------------------------------------------
// canClearObstacleType()
// --------------------------------------------------

test("canClearObstacleType delegates to the obstacle check", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacleType(
            "VIRIDIAN_FOREST",
            "CUT",
            { hmAbilities: ["CUT"] }
        ),
        service.canClearObstacle(
            "VIRIDIAN_FOREST",
            "CUT",
            { hmAbilities: ["CUT"] }
        )
    );
});

test("canClearObstacleType succeeds when the required ability is present", () => {
    const service = createService();

    assert.equal(
        service.canClearObstacleType(
            "ROUTE_1",
            "SURF",
            { hmAbilities: ["SURF"] }
        ).clearable,
        true
    );
});

test("canClearObstacleType rejects when the required ability is absent", () => {
    const service = createService();

    assert.equal(
        service.canClearObstacleType(
            "ROUTE_1",
            "SURF",
            { hmAbilities: [] }
        ).clearable,
        false
    );
});

test("canClearObstacleType supports hasHMAbility", () => {
    const service = createService();

    assert.equal(
        service.canClearObstacleType(
            "ROUTE_1",
            "SURF",
            {
                hasHMAbility(type) {
                    return type === "SURF";
                }
            }
        ).clearable,
        true
    );
});

test("canClearObstacleType treats a missing obstacle as clearable", () => {
    const service = createService();

    assert.deepEqual(
        service.canClearObstacleType(
            "PALLET_TOWN",
            "CUT",
            { hmAbilities: [] }
        ),
        {
            exists: false,
            clearable: true
        }
    );
});

// --------------------------------------------------
// getBlockedObstacles()
// --------------------------------------------------

test("getBlockedObstacles returns an array", () => {
    const service = createService();

    assert.ok(
        Array.isArray(
            service.getBlockedObstacles("VIRIDIAN_FOREST")
        )
    );
});

test("getBlockedObstacles returns all obstacles when no abilities are available", () => {
    const service = createService();

    assert.deepEqual(
        service.getBlockedObstacles(
            "VIRIDIAN_FOREST",
            { hmAbilities: [] }
        ),
        OBSTACLES.VIRIDIAN_FOREST
    );
});

test("getBlockedObstacles returns no obstacles when all abilities are available", () => {
    const service = createService();

    assert.deepEqual(
        service.getBlockedObstacles(
            "VIRIDIAN_FOREST",
            {
                hmAbilities: [
                    "CUT",
                    "ROCK_SMASH",
                    "STRENGTH"
                ]
            }
        ),
        []
    );
});

test("getBlockedObstacles returns only obstacles without their required abilities", () => {
    const service = createService();

    assert.deepEqual(
        service.getBlockedObstacles(
            "VIRIDIAN_FOREST",
            {
                hmAbilities: ["CUT"]
            }
        ),
        [
            OBSTACLES.VIRIDIAN_FOREST[1],
            OBSTACLES.VIRIDIAN_FOREST[2]
        ]
    );
});

test("getBlockedObstacles uses hasHMAbility when supplied", () => {
    const service = createService();

    const blocked = service.getBlockedObstacles(
        "VIRIDIAN_FOREST",
        {
            hasHMAbility(type) {
                return type === "CUT";
            }
        }
    );

    assert.deepEqual(
        blocked,
        [
            OBSTACLES.VIRIDIAN_FOREST[1],
            OBSTACLES.VIRIDIAN_FOREST[2]
        ]
    );
});

test("getBlockedObstacles returns an empty array for a location without obstacles", () => {
    const service = createService();

    assert.deepEqual(
        service.getBlockedObstacles("PALLET_TOWN"),
        []
    );
});

test("getBlockedObstacles returns an empty array for an unknown location", () => {
    const service = createService();

    assert.deepEqual(
        service.getBlockedObstacles("UNKNOWN_LOCATION"),
        []
    );
});

test("getBlockedObstacles defaults missing player state", () => {
    const service = createService();

    assert.deepEqual(
        service.getBlockedObstacles("ROUTE_1"),
        OBSTACLES.ROUTE_1
    );
});

test("getBlockedObstacles preserves obstacle order", () => {
    const service = createService();

    const blocked = service.getBlockedObstacles(
        "VIRIDIAN_FOREST",
        {
            hmAbilities: ["ROCK_SMASH"]
        }
    );

    assert.deepEqual(
        blocked.map(obstacle => obstacle.type),
        ["CUT", "STRENGTH"]
    );
});

test("getBlockedObstacles does not mutate the stored obstacle list", () => {
    const service = createService();
    const before = structuredClone(service.obstacles);

    service.getBlockedObstacles(
        "VIRIDIAN_FOREST",
        { hmAbilities: ["CUT"] }
    );

    assert.deepEqual(service.obstacles, before);
});

test("getBlockedObstacles can filter by the callback's result", () => {
    const service = createService();

    const blocked = service.getBlockedObstacles(
        "VIRIDIAN_FOREST",
        {
            hasHMAbility(type) {
                return type !== "CUT";
            }
        }
    );

    assert.deepEqual(
        blocked.map(obstacle => obstacle.type),
        ["CUT"]
    );
});

// --------------------------------------------------
// getAllObstacles()
// --------------------------------------------------

test("getAllObstacles returns the entire database", () => {
    const service = createService();

    assert.deepEqual(
        service.getAllObstacles(),
        OBSTACLES
    );
});

test("getAllObstacles returns the original database reference", () => {
    const service = createService();

    assert.strictEqual(
        service.getAllObstacles(),
        service.obstacles
    );
});

test("getAllObstacles returns the same reference on repeated calls", () => {
    const service = createService();

    assert.strictEqual(
        service.getAllObstacles(),
        service.getAllObstacles()
    );
});

test("getAllObstacles includes locations with empty obstacle lists", () => {
    const service = createService();

    assert.deepEqual(
        service.getAllObstacles().PALLET_TOWN,
        []
    );
});

test("getAllObstacles reflects changes to the returned database", () => {
    const service = createService();

    service.getAllObstacles().TEST_LOCATION = [
        {
            type: "CUT",
            name: "Added Tree"
        }
    ];

    assert.deepEqual(
        service.getObstacles("TEST_LOCATION"),
        [
            {
                type: "CUT",
                name: "Added Tree"
            }
        ]
    );
});

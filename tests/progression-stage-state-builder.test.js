const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

const ProgressionStageStateBuilder = require(
    "../scripts/services/progression-stage-state-builder.js"
);

const STAGES = [
    "PRE_BROCK",
    "BROCK",
    "MISTY",
    "LT_SURGE",
    "ERIKA",
    "KOGA",
    "SABRINA",
    "BLAINE",
    "GIOVANNI",
    "ELITE_FOUR",
    "CHAMPION",
    "POST_GAME"
];

function createBuilder(stages = STAGES) {
    return new ProgressionStageStateBuilder(stages);
}

function createState(overrides = {}) {
    return {
        badges: [],
        keyItems: [],
        abilities: [],
        storyFlags: [],
        ...overrides
    };
}

describe("ProgressionStageStateBuilder constructor", () => {
    test("creates a builder instance", () => {
        assert.ok(
            createBuilder() instanceof ProgressionStageStateBuilder
        );
    });

    test("defaults stages to an empty array", () => {
        const builder = new ProgressionStageStateBuilder();

        assert.deepEqual(builder.stages, []);
    });

    test("stores the supplied stages array", () => {
        const stages = ["PRE_BROCK", "BROCK"];
        const builder = createBuilder(stages);

        assert.equal(builder.stages, stages);
    });

    test("initializes stageStates to null", () => {
        const builder = createBuilder();

        assert.equal(builder.stageStates, null);
    });

    test("replaces null stages with an empty array", () => {
        const builder = new ProgressionStageStateBuilder(null);

        assert.deepEqual(builder.stages, []);
    });

    test("replaces undefined stages with an empty array", () => {
        const builder = new ProgressionStageStateBuilder(undefined);

        assert.deepEqual(builder.stages, []);
    });

    test("replaces non-array stages with an empty array", () => {
        const builder = new ProgressionStageStateBuilder({
            first: "PRE_BROCK"
        });

        assert.deepEqual(builder.stages, []);
    });

    test("accepts an empty stages array", () => {
        const builder = createBuilder([]);

        assert.deepEqual(builder.stages, []);
    });
});

describe("ProgressionStageStateBuilder getStageMaxLevel", () => {
    const expectedLevels = {
        PRE_BROCK: 20,
        BROCK: 30,
        MISTY: 35,
        LT_SURGE: 40,
        ERIKA: 45,
        KOGA: 50,
        SABRINA: 55,
        BLAINE: 55,
        GIOVANNI: 60,
        ELITE_FOUR: 65,
        CHAMPION: 70,
        POST_GAME: 100
    };

    for (const [stage, level] of Object.entries(expectedLevels)) {
        test(`returns level ${level} for ${stage}`, () => {
            const builder = createBuilder();

            assert.equal(
                builder.getStageMaxLevel(stage),
                level
            );
        });
    }

    test("returns level 100 for an unknown stage", () => {
        const builder = createBuilder();

        assert.equal(
            builder.getStageMaxLevel("UNKNOWN_STAGE"),
            100
        );
    });

    test("returns level 100 for an undefined stage", () => {
        const builder = createBuilder();

        assert.equal(
            builder.getStageMaxLevel(undefined),
            100
        );
    });

    test("returns level 100 for a null stage", () => {
        const builder = createBuilder();

        assert.equal(
            builder.getStageMaxLevel(null),
            100
        );
    });

    test("uses exact stage names", () => {
        const builder = createBuilder();

        assert.equal(builder.getStageMaxLevel("brock"), 100);
        assert.equal(builder.getStageMaxLevel("BROCK"), 30);
    });
});

describe("ProgressionStageStateBuilder addUnique", () => {
    test("adds a value to an empty array", () => {
        const builder = createBuilder();
        const values = [];

        builder.addUnique(values, "BOULDER_BADGE");

        assert.deepEqual(values, ["BOULDER_BADGE"]);
    });

    test("adds a new value to an existing array", () => {
        const builder = createBuilder();
        const values = ["BOULDER_BADGE"];

        builder.addUnique(values, "CASCADE_BADGE");

        assert.deepEqual(
            values,
            ["BOULDER_BADGE", "CASCADE_BADGE"]
        );
    });

    test("does not add a duplicate value", () => {
        const builder = createBuilder();
        const values = ["BOULDER_BADGE"];

        builder.addUnique(values, "BOULDER_BADGE");

        assert.deepEqual(values, ["BOULDER_BADGE"]);
    });

    test("preserves the original insertion order", () => {
        const builder = createBuilder();
        const values = ["A", "B"];

        builder.addUnique(values, "C");
        builder.addUnique(values, "A");

        assert.deepEqual(values, ["A", "B", "C"]);
    });

    test("ignores a non-array target", () => {
        const builder = createBuilder();

        assert.doesNotThrow(() => {
            builder.addUnique(null, "VALUE");
            builder.addUnique(undefined, "VALUE");
            builder.addUnique({}, "VALUE");
        });
    });

    test("ignores an empty string value", () => {
        const builder = createBuilder();
        const values = [];

        builder.addUnique(values, "");

        assert.deepEqual(values, []);
    });

    test("ignores a null value", () => {
        const builder = createBuilder();
        const values = [];

        builder.addUnique(values, null);

        assert.deepEqual(values, []);
    });

    test("ignores an undefined value", () => {
        const builder = createBuilder();
        const values = [];

        builder.addUnique(values, undefined);

        assert.deepEqual(values, []);
    });

    test("ignores a false value", () => {
        const builder = createBuilder();
        const values = [];

        builder.addUnique(values, false);

        assert.deepEqual(values, []);
    });

    test("ignores a zero value", () => {
        const builder = createBuilder();
        const values = [];

        builder.addUnique(values, 0);

        assert.deepEqual(values, []);
    });

    test("allows truthy non-string values", () => {
        const builder = createBuilder();
        const values = [];

        builder.addUnique(values, 5);

        assert.deepEqual(values, [5]);
    });
});

describe("ProgressionStageStateBuilder buildStageState", () => {
    test("builds an empty state for the first stage", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState("PRE_BROCK"),
            createState()
        );
    });

    test("returns all four state collections", () => {
        const builder = createBuilder();

        const result = builder.buildStageState("PRE_BROCK");

        assert.deepEqual(Object.keys(result), [
            "badges",
            "keyItems",
            "abilities",
            "storyFlags"
        ]);
    });

    test("returns separate arrays for each state category", () => {
        const builder = createBuilder();
        const state = builder.buildStageState("PRE_BROCK");

        assert.notEqual(state.badges, state.keyItems);
        assert.notEqual(state.badges, state.abilities);
        assert.notEqual(state.badges, state.storyFlags);
        assert.notEqual(state.keyItems, state.abilities);
        assert.notEqual(state.keyItems, state.storyFlags);
        assert.notEqual(state.abilities, state.storyFlags);
    });

    test("does not mutate a previous state", () => {
        const builder = createBuilder();
        const previous = createState({
            badges: ["BOULDER_BADGE"],
            keyItems: ["OLD_ITEM"],
            abilities: ["OLD_ABILITY"],
            storyFlags: ["OLD_FLAG"]
        });

        const original = {
            badges: [...previous.badges],
            keyItems: [...previous.keyItems],
            abilities: [...previous.abilities],
            storyFlags: [...previous.storyFlags]
        };

        builder.buildStageState("MISTY", previous);

        assert.deepEqual(previous, original);
    });

    test("copies collections from the previous state", () => {
        const builder = createBuilder();
        const previous = createState({
            badges: ["CUSTOM_BADGE"],
            keyItems: ["CUSTOM_ITEM"],
            abilities: ["CUSTOM_ABILITY"],
            storyFlags: ["CUSTOM_FLAG"]
        });

        const result = builder.buildStageState(
            "PRE_BROCK",
            previous
        );

        assert.notEqual(result.badges, previous.badges);
        assert.notEqual(result.keyItems, previous.keyItems);
        assert.notEqual(result.abilities, previous.abilities);
        assert.notEqual(result.storyFlags, previous.storyFlags);

        assert.deepEqual(result, previous);
    });

    test("handles missing collections in the previous state", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState("PRE_BROCK", {}),
            createState()
        );
    });

    test("handles null collections in the previous state", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState(
                "PRE_BROCK",
                {
                    badges: null,
                    keyItems: null,
                    abilities: null,
                    storyFlags: null
                }
            ),
            createState()
        );
    });

    test("preserves existing custom values in the previous state", () => {
        const builder = createBuilder();
        const previous = createState({
            badges: ["CUSTOM_BADGE"],
            keyItems: ["CUSTOM_ITEM"],
            abilities: ["CUSTOM_ABILITY"],
            storyFlags: ["CUSTOM_FLAG"]
        });

        const result = builder.buildStageState("BROCK", previous);

        assert.ok(result.badges.includes("CUSTOM_BADGE"));
        assert.ok(result.keyItems.includes("CUSTOM_ITEM"));
        assert.ok(result.abilities.includes("CUSTOM_ABILITY"));
        assert.ok(result.storyFlags.includes("CUSTOM_FLAG"));
    });

    test("does not duplicate badges already in the previous state", () => {
        const builder = createBuilder();
        const previous = createState({
            badges: ["BOULDER_BADGE"]
        });

        const result = builder.buildStageState("MISTY", previous);

        assert.equal(
            result.badges.filter(
                badge => badge === "BOULDER_BADGE"
            ).length,
            1
        );
    });

    test("does not duplicate abilities already in the previous state", () => {
        const builder = createBuilder();
        const previous = createState({
            abilities: ["CAN_USE_FLASH"]
        });

        const result = builder.buildStageState("BROCK", previous);

        assert.equal(
            result.abilities.filter(
                ability => ability === "CAN_USE_FLASH"
            ).length,
            1
        );
    });
});

describe("ProgressionStageStateBuilder badge progression", () => {
    const expectedBadges = {
        PRE_BROCK: [],
        BROCK: ["BOULDER_BADGE"],
        MISTY: ["BOULDER_BADGE", "CASCADE_BADGE"],
        LT_SURGE: [
            "BOULDER_BADGE",
            "CASCADE_BADGE",
            "THUNDER_BADGE"
        ],
        ERIKA: [
            "BOULDER_BADGE",
            "CASCADE_BADGE",
            "THUNDER_BADGE",
            "RAINBOW_BADGE"
        ],
        KOGA: [
            "BOULDER_BADGE",
            "CASCADE_BADGE",
            "THUNDER_BADGE",
            "RAINBOW_BADGE",
            "SOUL_BADGE"
        ],
        SABRINA: [
            "BOULDER_BADGE",
            "CASCADE_BADGE",
            "THUNDER_BADGE",
            "RAINBOW_BADGE",
            "SOUL_BADGE",
            "MARSH_BADGE"
        ],
        BLAINE: [
            "BOULDER_BADGE",
            "CASCADE_BADGE",
            "THUNDER_BADGE",
            "RAINBOW_BADGE",
            "SOUL_BADGE",
            "MARSH_BADGE",
            "VOLCANO_BADGE"
        ],
        GIOVANNI: [
            "BOULDER_BADGE",
            "CASCADE_BADGE",
            "THUNDER_BADGE",
            "RAINBOW_BADGE",
            "SOUL_BADGE",
            "MARSH_BADGE",
            "VOLCANO_BADGE",
            "EARTH_BADGE"
        ],
        ELITE_FOUR: [
            "BOULDER_BADGE",
            "CASCADE_BADGE",
            "THUNDER_BADGE",
            "RAINBOW_BADGE",
            "SOUL_BADGE",
            "MARSH_BADGE",
            "VOLCANO_BADGE",
            "EARTH_BADGE"
        ],
        CHAMPION: [
            "BOULDER_BADGE",
            "CASCADE_BADGE",
            "THUNDER_BADGE",
            "RAINBOW_BADGE",
            "SOUL_BADGE",
            "MARSH_BADGE",
            "VOLCANO_BADGE",
            "EARTH_BADGE"
        ],
        POST_GAME: [
            "BOULDER_BADGE",
            "CASCADE_BADGE",
            "THUNDER_BADGE",
            "RAINBOW_BADGE",
            "SOUL_BADGE",
            "MARSH_BADGE",
            "VOLCANO_BADGE",
            "EARTH_BADGE"
        ]
    };

    for (const stage of STAGES) {
        test(`adds the expected cumulative badges at ${stage}`, () => {
            const builder = createBuilder();

            assert.deepEqual(
                builder.buildStageState(stage).badges,
                expectedBadges[stage]
            );
        });
    }

    test("does not add a badge for an unknown stage", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState("UNKNOWN_STAGE").badges,
            []
        );
    });

    test("does not exceed the eight defined badges", () => {
        const builder = createBuilder();

        assert.equal(
            builder.buildStageState("POST_GAME").badges.length,
            8
        );
    });

    test("adds badge progression without duplicating existing badges", () => {
        const builder = createBuilder();
        const previous = createState({
            badges: [
                "BOULDER_BADGE",
                "CUSTOM_BADGE"
            ]
        });

        const result = builder.buildStageState("MISTY", previous);

        assert.deepEqual(result.badges, [
            "BOULDER_BADGE",
            "CUSTOM_BADGE",
            "CASCADE_BADGE"
        ]);
    });
});

describe("ProgressionStageStateBuilder ability progression", () => {
    test("grants Flash at the Brock stage", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState("BROCK").abilities,
            ["CAN_USE_FLASH"]
        );
    });

    test("does not grant Cut before Misty", () => {
        const builder = createBuilder();

        assert.equal(
            builder.buildStageState("BROCK").abilities.includes("CAN_USE_CUT"),
            false
        );
    });

    test("grants Cut at the Misty stage", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState("MISTY").abilities,
            ["CAN_USE_FLASH", "CAN_USE_CUT"]
        );
    });

    test("grants Fly at the Lt. Surge stage", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState("LT_SURGE").abilities,
            [
                "CAN_USE_FLASH",
                "CAN_USE_CUT",
                "CAN_USE_FLY"
            ]
        );
    });

    test("grants Strength at the Erika stage", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState("ERIKA").abilities,
            [
                "CAN_USE_FLASH",
                "CAN_USE_CUT",
                "CAN_USE_FLY",
                "CAN_USE_STRENGTH"
            ]
        );
    });

    test("grants Surf at the Koga stage", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState("KOGA").abilities,
            [
                "CAN_USE_FLASH",
                "CAN_USE_CUT",
                "CAN_USE_FLY",
                "CAN_USE_SURF",
                "CAN_USE_STRENGTH"
            ]
        );
    });

    test("does not grant Fly before Lt. Surge", () => {
        const builder = createBuilder();

        assert.equal(
            builder.buildStageState("MISTY").abilities.includes("CAN_USE_FLY"),
            false
        );
    });

    test("does not grant Strength before Erika", () => {
        const builder = createBuilder();

        assert.equal(
            builder.buildStageState("LT_SURGE").abilities.includes("CAN_USE_STRENGTH"),
            false
        );
    });

    test("does not grant Surf before Koga", () => {
        const builder = createBuilder();

        assert.equal(
            builder.buildStageState("ERIKA").abilities.includes("CAN_USE_SURF"),
            false
        );
    });

    test("does not duplicate abilities supplied in the previous state", () => {
        const builder = createBuilder();
        const previous = createState({
            abilities: ["CAN_USE_FLASH"]
        });

        const result = builder.buildStageState("BROCK", previous);

        assert.deepEqual(result.abilities, ["CAN_USE_FLASH"]);
    });
});

describe("ProgressionStageStateBuilder key item progression", () => {
    test("does not grant key items before Misty", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState("BROCK").keyItems,
            []
        );
    });

    test("grants SS Ticket at Misty", () => {
        const builder = createBuilder();

        assert.ok(
            builder.buildStageState("MISTY").keyItems.includes("SS_TICKET")
        );
    });

    test("grants Tea at Misty", () => {
        const builder = createBuilder();

        assert.ok(
            builder.buildStageState("MISTY").keyItems.includes("TEA")
        );
    });

    test("grants both defined key items at Misty", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState("MISTY").keyItems,
            ["SS_TICKET", "TEA"]
        );
    });

    test("preserves earlier key items at later stages", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState("POST_GAME").keyItems,
            ["SS_TICKET", "TEA"]
        );
    });

    test("does not duplicate existing key items", () => {
        const builder = createBuilder();
        const previous = createState({
            keyItems: ["SS_TICKET"]
        });

        const result = builder.buildStageState("MISTY", previous);

        assert.deepEqual(result.keyItems, ["SS_TICKET", "TEA"]);
    });
});

describe("ProgressionStageStateBuilder story flags", () => {
    test("does not add Pokédex flag before Brock", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState("PRE_BROCK").storyFlags,
            []
        );
    });

    test("adds Pokédex flag at Brock", () => {
        const builder = createBuilder();

        assert.ok(
            builder.buildStageState("BROCK").storyFlags.includes(
                "POKEDEX_RECEIVED"
            )
        );
    });

    test("adds Silph Co. completion flag at Misty", () => {
        const builder = createBuilder();

        assert.ok(
            builder.buildStageState("MISTY").storyFlags.includes(
                "SILPH_CO_COMPLETED"
            )
        );
    });

    test("does not add Silph Co. completion flag before Misty", () => {
        const builder = createBuilder();

        assert.equal(
            builder.buildStageState("BROCK").storyFlags.includes(
                "SILPH_CO_COMPLETED"
            ),
            false
        );
    });

    test("preserves earlier story flags at later stages", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildStageState("POST_GAME").storyFlags,
            ["POKEDEX_RECEIVED", "SILPH_CO_COMPLETED"]
        );
    });

    test("does not duplicate existing story flags", () => {
        const builder = createBuilder();
        const previous = createState({
            storyFlags: ["POKEDEX_RECEIVED"]
        });

        const result = builder.buildStageState("BROCK", previous);

        assert.deepEqual(
            result.storyFlags,
            ["POKEDEX_RECEIVED"]
        );
    });
});

describe("ProgressionStageStateBuilder buildCumulativeStageStates", () => {
    test("returns an empty object when no stages are configured", () => {
        const builder = createBuilder([]);

        assert.deepEqual(
            builder.buildCumulativeStageStates(),
            {}
        );
    });

    test("creates an entry for each configured stage", () => {
        const stages = ["PRE_BROCK", "BROCK", "MISTY"];
        const builder = createBuilder(stages);

        assert.deepEqual(
            Object.keys(builder.buildCumulativeStageStates()),
            stages
        );
    });

    test("builds the first stage with empty collections", () => {
        const builder = createBuilder();

        assert.deepEqual(
            builder.buildCumulativeStageStates().PRE_BROCK,
            createState()
        );
    });

    test("builds cumulative badges across stages", () => {
        const builder = createBuilder([
            "PRE_BROCK",
            "BROCK",
            "MISTY"
        ]);

        const states = builder.buildCumulativeStageStates();

        assert.deepEqual(states.PRE_BROCK.badges, []);
        assert.deepEqual(states.BROCK.badges, ["BOULDER_BADGE"]);
        assert.deepEqual(
            states.MISTY.badges,
            ["BOULDER_BADGE", "CASCADE_BADGE"]
        );
    });

    test("builds cumulative abilities across stages", () => {
        const builder = createBuilder();

        const states = builder.buildCumulativeStageStates();

        assert.deepEqual(states.PRE_BROCK.abilities, []);
        assert.deepEqual(states.BROCK.abilities, ["CAN_USE_FLASH"]);
        assert.deepEqual(
            states.MISTY.abilities,
            ["CAN_USE_FLASH", "CAN_USE_CUT"]
        );
        assert.deepEqual(
            states.LT_SURGE.abilities,
            ["CAN_USE_FLASH", "CAN_USE_CUT", "CAN_USE_FLY"]
        );
    });

    test("builds cumulative key items across stages", () => {
        const builder = createBuilder([
            "PRE_BROCK",
            "BROCK",
            "MISTY"
        ]);

        const states = builder.buildCumulativeStageStates();

        assert.deepEqual(states.BROCK.keyItems, []);
        assert.deepEqual(states.MISTY.keyItems, ["SS_TICKET", "TEA"]);
    });

    test("builds cumulative story flags across stages", () => {
        const builder = createBuilder([
            "PRE_BROCK",
            "BROCK",
            "MISTY"
        ]);

        const states = builder.buildCumulativeStageStates();

        assert.deepEqual(states.PRE_BROCK.storyFlags, []);
        assert.deepEqual(
            states.BROCK.storyFlags,
            ["POKEDEX_RECEIVED"]
        );
        assert.deepEqual(
            states.MISTY.storyFlags,
            ["POKEDEX_RECEIVED", "SILPH_CO_COMPLETED"]
        );
    });

    test("stores the generated state map on the builder", () => {
        const builder = createBuilder();

        const states = builder.buildCumulativeStageStates();

        assert.equal(builder.stageStates, states);
    });

    test("returns the cached state map on subsequent calls", () => {
        const builder = createBuilder();

        const first = builder.buildCumulativeStageStates();
        const second = builder.buildCumulativeStageStates();

        assert.equal(first, second);
    });

    test("returns the cached state map even if stages change later", () => {
        const stages = ["PRE_BROCK", "BROCK"];
        const builder = createBuilder(stages);

        const first = builder.buildCumulativeStageStates();

        stages.push("MISTY");

        const second = builder.buildCumulativeStageStates();

        assert.equal(first, second);
        assert.deepEqual(Object.keys(second), ["PRE_BROCK", "BROCK"]);
    });

    test("creates independent collection arrays for each stage snapshot", () => {
        const builder = createBuilder([
            "PRE_BROCK",
            "BROCK",
            "MISTY"
        ]);

        const states = builder.buildCumulativeStageStates();

        assert.notEqual(
            states.BROCK.badges,
            states.MISTY.badges
        );
        assert.notEqual(
            states.BROCK.abilities,
            states.MISTY.abilities
        );
        assert.notEqual(
            states.BROCK.keyItems,
            states.MISTY.keyItems
        );
        assert.notEqual(
            states.BROCK.storyFlags,
            states.MISTY.storyFlags
        );
    });

    test("does not allow later stages to retroactively change earlier snapshots", () => {
        const builder = createBuilder([
            "PRE_BROCK",
            "BROCK",
            "MISTY"
        ]);

        const states = builder.buildCumulativeStageStates();

        assert.deepEqual(states.BROCK.badges, ["BOULDER_BADGE"]);
        assert.deepEqual(states.BROCK.keyItems, []);
        assert.deepEqual(states.BROCK.storyFlags, ["POKEDEX_RECEIVED"]);
    });

    test("retains the configured stage order in the generated object", () => {
        const stages = ["MISTY", "BROCK", "PRE_BROCK"];
        const builder = createBuilder(stages);

        assert.deepEqual(
            Object.keys(builder.buildCumulativeStageStates()),
            stages
        );
    });
    
    test("supports a single configured stage", () => {
        const builder = createBuilder(["BROCK"]);
        const states = builder.buildCumulativeStageStates();
    
        assert.deepEqual(Object.keys(states), ["BROCK"]);
    
        assert.deepEqual(
            Object.keys(states.BROCK),
            ["badges", "keyItems", "abilities", "storyFlags"]
        );
    
        for (const collection of Object.values(states.BROCK)) {
            assert.ok(Array.isArray(collection));
        }
    });
});

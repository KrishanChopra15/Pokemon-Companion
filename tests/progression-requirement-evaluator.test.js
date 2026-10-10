const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

const ProgressionRequirementEvaluator = require(
    "../scripts/services/progression-requirement-evaluator.js"
);

const HANDLER_NAMES = [
    "isNamedRequirementSatisfiedAtStage",
    "areBadgesSatisfiedAtStage",
    "areKeyItemsSatisfiedAtStage",
    "isBadgeSatisfiedAtStage",
    "isKeyItemSatisfiedAtStage",
    "isStoryFlagSatisfiedAtStage",
    "canAccessLocationAtStage"
];

function createRecordingHandlers(results = {}) {
    const calls = [];

    const handlers = {};

    for (const name of HANDLER_NAMES) {
        handlers[name] = (...args) => {
            calls.push({ name, args });

            const result = results[name];

            if (typeof result === "function") {
                return result(...args);
            }

            return result === undefined ? true : result;
        };
    }

    return { handlers, calls };
}

function createEvaluator(results = {}) {
    const recording = createRecordingHandlers(results);

    return {
        evaluator: new ProgressionRequirementEvaluator(
            recording.handlers
        ),
        handlers: recording.handlers,
        calls: recording.calls
    };
}

describe("ProgressionRequirementEvaluator constructor", () => {
    test("creates an evaluator instance", () => {
        const evaluator = new ProgressionRequirementEvaluator();

        assert.ok(
            evaluator instanceof ProgressionRequirementEvaluator
        );
    });

    test("defaults handlers to an empty object", () => {
        const evaluator = new ProgressionRequirementEvaluator();

        assert.deepEqual(evaluator.handlers, {});
    });

    test("stores the supplied handlers object", () => {
        const handlers = {
            isNamedRequirementSatisfiedAtStage: () => true
        };

        const evaluator = new ProgressionRequirementEvaluator(handlers);

        assert.equal(evaluator.handlers, handlers);
    });

    test("accepts an empty handlers object", () => {
        const handlers = {};
        const evaluator = new ProgressionRequirementEvaluator(handlers);

        assert.equal(evaluator.handlers, handlers);
    });
});

describe("ProgressionRequirementEvaluator isSatisfied basic inputs", () => {
    test("treats an undefined requirement as satisfied", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(undefined, "STAGE_1"),
            true
        );
    });

    test("treats a null requirement as satisfied", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(null, "STAGE_1"),
            true
        );
    });

    test("treats false as a satisfied empty requirement", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(false, "STAGE_1"),
            true
        );
    });

    test("treats zero as a satisfied empty requirement", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(0, "STAGE_1"),
            true
        );
    });

    test("treats an empty string as a satisfied empty requirement", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied("", "STAGE_1"),
            true
        );
    });

    test("treats a number as satisfied when it is not a requirement object", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(123, "STAGE_1"),
            true
        );
    });

    test("treats a boolean true as satisfied", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(true, "STAGE_1"),
            true
        );
    });

    test("does not call handlers for a falsey requirement", () => {
        const { evaluator, calls } = createEvaluator();

        evaluator.isSatisfied(null, "STAGE_1");

        assert.equal(calls.length, 0);
    });

    test("does not call handlers for an unsupported primitive", () => {
        const { evaluator, calls } = createEvaluator();

        evaluator.isSatisfied(42, "STAGE_1");

        assert.equal(calls.length, 0);
    });

    test("treats an empty object as satisfied", () => {
        const { evaluator, calls } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied({}, "STAGE_1"),
            true
        );

        assert.equal(calls.length, 0);
    });

    test("treats an object with unrecognized properties as satisfied", () => {
        const { evaluator, calls } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                {
                    customField: "value",
                    enabled: true
                },
                "STAGE_1"
            ),
            true
        );

        assert.equal(calls.length, 0);
    });
});

describe("ProgressionRequirementEvaluator named requirements", () => {
    test("evaluates a string requirement through its handler", () => {
        const { evaluator, calls } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied("SURF", "STAGE_2"),
            true
        );

        assert.equal(calls.length, 1);
        assert.equal(
            calls[0].name,
            "isNamedRequirementSatisfiedAtStage"
        );
        assert.deepEqual(
            calls[0].args,
            ["SURF", "STAGE_2", null]
        );
    });

    test("returns false when a named requirement is rejected", () => {
        const { evaluator } = createEvaluator({
            isNamedRequirementSatisfiedAtStage: false
        });

        assert.equal(
            evaluator.isSatisfied("SURF", "STAGE_2"),
            false
        );
    });

    test("passes the supplied state to the named requirement handler", () => {
        const { evaluator, calls } = createEvaluator();
        const state = { badgeCount: 3 };

        evaluator.isSatisfied("SURF", "STAGE_2", state);

        assert.equal(calls[0].args[2], state);
    });

    test("uses the type field as the named requirement", () => {
        const { evaluator, calls } = createEvaluator();

        evaluator.isSatisfied(
            { type: "SURF" },
            "STAGE_2"
        );

        assert.equal(
            calls[0].name,
            "isNamedRequirementSatisfiedAtStage"
        );
        assert.equal(calls[0].args[0], "SURF");
    });

    test("uses kind when type is absent", () => {
        const { evaluator, calls } = createEvaluator();

        evaluator.isSatisfied(
            { kind: "CUT" },
            "STAGE_1"
        );

        assert.equal(calls[0].args[0], "CUT");
    });

    test("uses requirement when type and kind are absent", () => {
        const { evaluator, calls } = createEvaluator();

        evaluator.isSatisfied(
            { requirement: "STRENGTH" },
            "STAGE_3"
        );

        assert.equal(calls[0].args[0], "STRENGTH");
    });

    test("prioritizes type over kind and requirement", () => {
        const { evaluator, calls } = createEvaluator();

        evaluator.isSatisfied(
            {
                type: "SURF",
                kind: "CUT",
                requirement: "STRENGTH"
            },
            "STAGE_2"
        );

        assert.equal(calls[0].args[0], "SURF");
        assert.equal(calls.length, 1);
    });

    test("uses kind when type is an empty string", () => {
        const { evaluator, calls } = createEvaluator();

        evaluator.isSatisfied(
            {
                type: "",
                kind: "CUT"
            },
            "STAGE_1"
        );

        assert.equal(calls[0].args[0], "CUT");
    });

    test("combines a named requirement with other requirement categories", () => {
        const { evaluator, calls } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                {
                    type: "SURF",
                    badge: "RAINBOW_BADGE"
                },
                "STAGE_3"
            ),
            true
        );

        assert.equal(calls.length, 2);
        assert.deepEqual(
            calls.map(call => call.name),
            [
                "isNamedRequirementSatisfiedAtStage",
                "isBadgeSatisfiedAtStage"
            ]
        );
    });
});

describe("ProgressionRequirementEvaluator anyOf", () => {
    test("accepts anyOf when at least one option passes", () => {
        const { evaluator } = createEvaluator({
            isNamedRequirementSatisfiedAtStage: requirement =>
                requirement === "CUT"
        });

        assert.equal(
            evaluator.isSatisfied(
                {
                    anyOf: ["SURF", "CUT", "STRENGTH"]
                },
                "STAGE_2"
            ),
            true
        );
    });

    test("rejects anyOf when all options fail", () => {
        const { evaluator } = createEvaluator({
            isNamedRequirementSatisfiedAtStage: false
        });

        assert.equal(
            evaluator.isSatisfied(
                {
                    anyOf: ["SURF", "CUT"]
                },
                "STAGE_2"
            ),
            false
        );
    });

    test("rejects an empty anyOf array", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { anyOf: [] },
                "STAGE_1"
            ),
            false
        );
    });

    test("stops checking anyOf options after one passes", () => {
        const { evaluator, calls } = createEvaluator({
            isNamedRequirementSatisfiedAtStage: requirement =>
                requirement === "CUT"
        });

        evaluator.isSatisfied(
            { anyOf: ["SURF", "CUT", "STRENGTH"] },
            "STAGE_2"
        );

        assert.deepEqual(
            calls.map(call => call.args[0]),
            ["SURF", "CUT"]
        );
    });

    test("passes the same stage and state into each anyOf option", () => {
        const { evaluator, calls } = createEvaluator({
            isNamedRequirementSatisfiedAtStage: name =>
                name === "CUT"
        });

        const state = { badgeCount: 2 };

        evaluator.isSatisfied(
            { anyOf: ["SURF", "CUT"] },
            "STAGE_2",
            state
        );

        assert.equal(calls.length, 2);

        for (const call of calls) {
            assert.equal(call.args[1], "STAGE_2");
            assert.equal(call.args[2], state);
        }
    });

    test("supports nested anyOf requirements", () => {
        const { evaluator } = createEvaluator({
            isNamedRequirementSatisfiedAtStage: name =>
                name === "CUT"
        });

        assert.equal(
            evaluator.isSatisfied(
                {
                    anyOf: [
                        {
                            anyOf: ["SURF", "CUT"]
                        },
                        "STRENGTH"
                    ]
                },
                "STAGE_2"
            ),
            true
        );
    });

    test("uses anyOf instead of evaluating other fields on the same object", () => {
        const { evaluator, calls } = createEvaluator({
            isNamedRequirementSatisfiedAtStage: true,
            isBadgeSatisfiedAtStage: false
        });

        assert.equal(
            evaluator.isSatisfied(
                {
                    anyOf: ["SURF"],
                    badge: "RAINBOW_BADGE"
                },
                "STAGE_2"
            ),
            true
        );

        assert.equal(calls.length, 1);
        assert.equal(calls[0].args[0], "SURF");
    });

    test("treats an anyOf option with no requirements as satisfied", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { anyOf: [null] },
                "STAGE_1"
            ),
            true
        );
    });

    test("fails an anyOf option whose named requirement handler is missing", () => {
        const evaluator = new ProgressionRequirementEvaluator({});

        assert.equal(
            evaluator.isSatisfied(
                { anyOf: ["SURF", "CUT"] },
                "STAGE_2"
            ),
            false
        );
    });
});

describe("ProgressionRequirementEvaluator abilities", () => {
    test("checks every ability through the named requirement handler", () => {
        const { evaluator, calls } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { abilities: ["SURF", "CUT"] },
                "STAGE_2"
            ),
            true
        );

        assert.deepEqual(
            calls.map(call => call.args[0]),
            ["SURF", "CUT"]
        );
    });

    test("rejects abilities when an ability is unavailable", () => {
        const { evaluator } = createEvaluator({
            isNamedRequirementSatisfiedAtStage: ability =>
                ability !== "CUT"
        });

        assert.equal(
            evaluator.isSatisfied(
                { abilities: ["SURF", "CUT"] },
                "STAGE_2"
            ),
            false
        );
    });

    test("short-circuits abilities after the first unavailable ability", () => {
        const { evaluator, calls } = createEvaluator({
            isNamedRequirementSatisfiedAtStage: ability =>
                ability === "SURF"
        });

        evaluator.isSatisfied(
            { abilities: ["SURF", "CUT", "STRENGTH"] },
            "STAGE_2"
        );

        assert.deepEqual(
            calls.map(call => call.args[0]),
            ["SURF", "CUT"]
        );
    });

    test("accepts an empty abilities array", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { abilities: [] },
                "STAGE_1"
            ),
            true
        );
    });

    test("does not process abilities when the value is not an array", () => {
        const { evaluator, calls } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { abilities: "SURF" },
                "STAGE_1"
            ),
            true
        );

        assert.equal(calls.length, 0);
    });
});

describe("ProgressionRequirementEvaluator HMs", () => {
    test("checks every HM through the named requirement handler", () => {
        const { evaluator, calls } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { hms: ["CUT", "SURF"] },
                "STAGE_2"
            ),
            true
        );

        assert.deepEqual(
            calls.map(call => call.args[0]),
            ["CUT", "SURF"]
        );
    });

    test("rejects HMs when an HM is unavailable", () => {
        const { evaluator } = createEvaluator({
            isNamedRequirementSatisfiedAtStage: hm =>
                hm !== "SURF"
        });

        assert.equal(
            evaluator.isSatisfied(
                { hms: ["CUT", "SURF"] },
                "STAGE_2"
            ),
            false
        );
    });

    test("short-circuits HM evaluation after the first failure", () => {
        const { evaluator, calls } = createEvaluator({
            isNamedRequirementSatisfiedAtStage: hm =>
                hm === "CUT"
        });

        evaluator.isSatisfied(
            { hms: ["CUT", "SURF", "STRENGTH"] },
            "STAGE_2"
        );

        assert.deepEqual(
            calls.map(call => call.args[0]),
            ["CUT", "SURF"]
        );
    });

    test("accepts an empty HMs array", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { hms: [] },
                "STAGE_1"
            ),
            true
        );
    });
});

describe("ProgressionRequirementEvaluator badge requirements", () => {
    test("checks a badge list through the badge-list handler", () => {
        const { evaluator, calls } = createEvaluator();
        const badges = ["BOULDER_BADGE", "CASCADE_BADGE"];

        assert.equal(
            evaluator.isSatisfied(
                { badges },
                "STAGE_2"
            ),
            true
        );

        assert.equal(calls.length, 1);
        assert.equal(
            calls[0].name,
            "areBadgesSatisfiedAtStage"
        );
        assert.equal(calls[0].args[0], badges);
    });

    test("returns false when the badge-list handler rejects the list", () => {
        const { evaluator } = createEvaluator({
            areBadgesSatisfiedAtStage: false
        });

        assert.equal(
            evaluator.isSatisfied(
                { badges: ["BOULDER_BADGE"] },
                "STAGE_1"
            ),
            false
        );
    });

    test("passes stage and state to the badge-list handler", () => {
        const { evaluator, calls } = createEvaluator();
        const state = { badges: ["BOULDER_BADGE"] };

        evaluator.isSatisfied(
            { badges: ["BOULDER_BADGE"] },
            "STAGE_1",
            state
        );

        assert.equal(calls[0].args[1], "STAGE_1");
        assert.equal(calls[0].args[2], state);
    });

    test("accepts an empty badge list when its handler accepts it", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { badges: [] },
                "STAGE_1"
            ),
            true
        );
    });

    test("checks a single badge through the single-badge handler", () => {
        const { evaluator, calls } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { badge: "BOULDER_BADGE" },
                "STAGE_1"
            ),
            true
        );

        assert.equal(
            calls[0].name,
            "isBadgeSatisfiedAtStage"
        );
        assert.equal(
            calls[0].args[0],
            "BOULDER_BADGE"
        );
    });

    test("rejects a single badge when its handler returns false", () => {
        const { evaluator } = createEvaluator({
            isBadgeSatisfiedAtStage: false
        });

        assert.equal(
            evaluator.isSatisfied(
                { badge: "BOULDER_BADGE" },
                "STAGE_1"
            ),
            false
        );
    });
});

describe("ProgressionRequirementEvaluator key items", () => {
    test("checks key item lists through their handler", () => {
        const { evaluator, calls } = createEvaluator();
        const items = ["POKE_FLUTE", "SILPH_SCOPE"];

        assert.equal(
            evaluator.isSatisfied(
                { keyItems: items },
                "STAGE_3"
            ),
            true
        );

        assert.equal(
            calls[0].name,
            "areKeyItemsSatisfiedAtStage"
        );
        assert.equal(calls[0].args[0], items);
    });

    test("rejects key item lists when their handler returns false", () => {
        const { evaluator } = createEvaluator({
            areKeyItemsSatisfiedAtStage: false
        });

        assert.equal(
            evaluator.isSatisfied(
                { keyItems: ["POKE_FLUTE"] },
                "STAGE_3"
            ),
            false
        );
    });

    test("passes stage and state to the key item list handler", () => {
        const { evaluator, calls } = createEvaluator();
        const state = { keyItems: ["POKE_FLUTE"] };

        evaluator.isSatisfied(
            { keyItems: ["POKE_FLUTE"] },
            "STAGE_3",
            state
        );

        assert.equal(calls[0].args[1], "STAGE_3");
        assert.equal(calls[0].args[2], state);
    });

    test("checks a single key item through its handler", () => {
        const { evaluator, calls } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { keyItem: "POKE_FLUTE" },
                "STAGE_3"
            ),
            true
        );

        assert.equal(
            calls[0].name,
            "isKeyItemSatisfiedAtStage"
        );
        assert.equal(
            calls[0].args[0],
            "POKE_FLUTE"
        );
    });

    test("rejects an unavailable single key item", () => {
        const { evaluator } = createEvaluator({
            isKeyItemSatisfiedAtStage: false
        });

        assert.equal(
            evaluator.isSatisfied(
                { keyItem: "POKE_FLUTE" },
                "STAGE_3"
            ),
            false
        );
    });

    test("accepts an empty key item list when its handler accepts it", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { keyItems: [] },
                "STAGE_1"
            ),
            true
        );
    });
});

describe("ProgressionRequirementEvaluator story flags", () => {
    test("checks every story flag through its handler", () => {
        const { evaluator, calls } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { storyFlags: ["BRIDGE_FIXED", "ROCKET_DEFEATED"] },
                "STAGE_3"
            ),
            true
        );

        assert.deepEqual(
            calls.map(call => call.args[0]),
            ["BRIDGE_FIXED", "ROCKET_DEFEATED"]
        );

        assert.ok(
            calls.every(
                call => call.name === "isStoryFlagSatisfiedAtStage"
            )
        );
    });

    test("rejects story flags when one flag is not satisfied", () => {
        const { evaluator } = createEvaluator({
            isStoryFlagSatisfiedAtStage: flag =>
                flag !== "ROCKET_DEFEATED"
        });

        assert.equal(
            evaluator.isSatisfied(
                { storyFlags: ["BRIDGE_FIXED", "ROCKET_DEFEATED"] },
                "STAGE_3"
            ),
            false
        );
    });

    test("short-circuits story flags after the first failure", () => {
        const { evaluator, calls } = createEvaluator({
            isStoryFlagSatisfiedAtStage: flag =>
                flag === "BRIDGE_FIXED"
        });

        evaluator.isSatisfied(
            {
                storyFlags: [
                    "BRIDGE_FIXED",
                    "ROCKET_DEFEATED",
                    "CHAMPION_DEFEATED"
                ]
            },
            "STAGE_3"
        );

        assert.deepEqual(
            calls.map(call => call.args[0]),
            ["BRIDGE_FIXED", "ROCKET_DEFEATED"]
        );
    });

    test("accepts an empty story flags array", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { storyFlags: [] },
                "STAGE_1"
            ),
            true
        );
    });

    test("passes stage and state to story flag handlers", () => {
        const { evaluator, calls } = createEvaluator();
        const state = { storyFlags: ["BRIDGE_FIXED"] };

        evaluator.isSatisfied(
            { storyFlags: ["BRIDGE_FIXED"] },
            "STAGE_2",
            state
        );

        assert.equal(calls[0].args[1], "STAGE_2");
        assert.equal(calls[0].args[2], state);
    });
});

describe("ProgressionRequirementEvaluator location dependencies", () => {
    test("checks each required location through its handler", () => {
        const { evaluator, calls } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                {
                    locations: [
                        "MAP_PALLET_TOWN",
                        "MAP_ROUTE1"
                    ]
                },
                "STAGE_1"
            ),
            true
        );

        assert.deepEqual(
            calls.map(call => call.args[0]),
            ["MAP_PALLET_TOWN", "MAP_ROUTE1"]
        );

        assert.ok(
            calls.every(
                call => call.name === "canAccessLocationAtStage"
            )
        );
    });

    test("rejects location requirements when a location cannot be accessed", () => {
        const { evaluator } = createEvaluator({
            canAccessLocationAtStage: location =>
                location !== "MAP_ROUTE1"
        });

        assert.equal(
            evaluator.isSatisfied(
                {
                    locations: [
                        "MAP_PALLET_TOWN",
                        "MAP_ROUTE1"
                    ]
                },
                "STAGE_1"
            ),
            false
        );
    });

    test("short-circuits location checks after the first failure", () => {
        const { evaluator, calls } = createEvaluator({
            canAccessLocationAtStage: location =>
                location === "MAP_PALLET_TOWN"
        });

        evaluator.isSatisfied(
            {
                locations: [
                    "MAP_PALLET_TOWN",
                    "MAP_ROUTE1",
                    "MAP_ROUTE2"
                ]
            },
            "STAGE_1"
        );

        assert.deepEqual(
            calls.map(call => call.args[0]),
            ["MAP_PALLET_TOWN", "MAP_ROUTE1"]
        );
    });

    test("accepts an empty locations array", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                { locations: [] },
                "STAGE_1"
            ),
            true
        );
    });

    test("passes stage, state, and dependency stack to the location handler", () => {
        const { evaluator, calls } = createEvaluator();
        const state = { currentLocation: "MAP_ROUTE1" };
        const stack = new Set(["MAP_ROUTE2"]);

        evaluator.isSatisfied(
            { locations: ["MAP_ROUTE1"] },
            "STAGE_2",
            state,
            stack
        );

        assert.equal(calls[0].args[1], "STAGE_2");
        assert.equal(calls[0].args[2], state);
        assert.equal(calls[0].args[3], stack);
    });

    test("creates a Set for location dependencies when the supplied stack is not a Set", () => {
        const { evaluator, calls } = createEvaluator();

        evaluator.isSatisfied(
            { locations: ["MAP_ROUTE1"] },
            "STAGE_2",
            {},
            ["MAP_ROUTE2"]
        );

        assert.ok(calls[0].args[3] instanceof Set);
        assert.deepEqual(
            [...calls[0].args[3]],
            []
        );
    });

    test("creates an empty Set by default for location dependencies", () => {
        const { evaluator, calls } = createEvaluator();

        evaluator.isSatisfied(
            { locations: ["MAP_ROUTE1"] },
            "STAGE_1"
        );

        assert.ok(calls[0].args[3] instanceof Set);
        assert.deepEqual([...calls[0].args[3]], []);
    });

    test("reuses the same dependency Set for every location in one requirement", () => {
        const { evaluator, calls } = createEvaluator();

        evaluator.isSatisfied(
            {
                locations: [
                    "MAP_ROUTE1",
                    "MAP_ROUTE2"
                ]
            },
            "STAGE_1"
        );

        assert.equal(
            calls[0].args[3],
            calls[1].args[3]
        );
    });
});

describe("ProgressionRequirementEvaluator combined requirements", () => {
    test("requires all categories to pass", () => {
        const { evaluator } = createEvaluator({
            isNamedRequirementSatisfiedAtStage: true,
            isBadgeSatisfiedAtStage: true,
            isStoryFlagSatisfiedAtStage: false
        });

        assert.equal(
            evaluator.isSatisfied(
                {
                    type: "SURF",
                    badge: "RAINBOW_BADGE",
                    storyFlags: ["BRIDGE_FIXED"]
                },
                "STAGE_3"
            ),
            false
        );
    });

    test("passes when all supplied categories pass", () => {
        const { evaluator } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                {
                    type: "SURF",
                    abilities: ["CUT"],
                    hms: ["STRENGTH"],
                    badges: ["BOULDER_BADGE"],
                    keyItems: ["POKE_FLUTE"],
                    badge: "CASCADE_BADGE",
                    keyItem: "SILPH_SCOPE",
                    storyFlags: ["BRIDGE_FIXED"],
                    locations: ["MAP_ROUTE1"]
                },
                "STAGE_3"
            ),
            true
        );
    });

    test("fails a combined requirement when a handler is missing", () => {
        const evaluator = new ProgressionRequirementEvaluator({
            isNamedRequirementSatisfiedAtStage: () => true
        });

        assert.equal(
            evaluator.isSatisfied(
                {
                    type: "SURF",
                    badge: "RAINBOW_BADGE"
                },
                "STAGE_3"
            ),
            false
        );
    });

    test("evaluates independent categories even if an earlier category fails", () => {
        const { evaluator, calls } = createEvaluator({
            isNamedRequirementSatisfiedAtStage: false,
            isBadgeSatisfiedAtStage: true
        });

        evaluator.isSatisfied(
            {
                type: "SURF",
                badge: "RAINBOW_BADGE"
            },
            "STAGE_3"
        );

        assert.equal(calls.length, 2);
        assert.deepEqual(
            calls.map(call => call.name),
            [
                "isNamedRequirementSatisfiedAtStage",
                "isBadgeSatisfiedAtStage"
            ]
        );
    });

    test("checks categories in the implementation's defined order", () => {
        const { evaluator, calls } = createEvaluator();

        evaluator.isSatisfied(
            {
                type: "SURF",
                abilities: ["CUT"],
                hms: ["STRENGTH"],
                badges: ["BOULDER_BADGE"],
                keyItems: ["POKE_FLUTE"],
                badge: "CASCADE_BADGE",
                keyItem: "SILPH_SCOPE",
                storyFlags: ["BRIDGE_FIXED"],
                locations: ["MAP_ROUTE1"]
            },
            "STAGE_3"
        );

        assert.deepEqual(
            calls.map(call => call.name),
            [
                "isNamedRequirementSatisfiedAtStage",
                "isNamedRequirementSatisfiedAtStage",
                "isNamedRequirementSatisfiedAtStage",
                "areBadgesSatisfiedAtStage",
                "areKeyItemsSatisfiedAtStage",
                "isBadgeSatisfiedAtStage",
                "isKeyItemSatisfiedAtStage",
                "isStoryFlagSatisfiedAtStage",
                "canAccessLocationAtStage"
            ]
        );
    });

    test("does not apply a named requirement for a falsey type field", () => {
        const { evaluator, calls } = createEvaluator();

        assert.equal(
            evaluator.isSatisfied(
                {
                    type: "",
                    abilities: []
                },
                "STAGE_1"
            ),
            true
        );

        assert.equal(calls.length, 0);
    });

    test("supports the default null state in handler calls", () => {
        const { evaluator, calls } = createEvaluator();

        evaluator.isSatisfied("SURF", "STAGE_1");

        assert.equal(calls[0].args[2], null);
    });
});

describe("ProgressionRequirementEvaluator call", () => {
    test("returns false when a named handler is missing", () => {
        const evaluator = new ProgressionRequirementEvaluator({});

        assert.equal(
            evaluator.call(
                "isNamedRequirementSatisfiedAtStage",
                "SURF",
                "STAGE_2",
                {}
            ),
            false
        );
    });

    test("returns false when the handler property is not a function", () => {
        const evaluator = new ProgressionRequirementEvaluator({
            isNamedRequirementSatisfiedAtStage: true
        });

        assert.equal(
            evaluator.call(
                "isNamedRequirementSatisfiedAtStage",
                "SURF",
                "STAGE_2",
                {}
            ),
            false
        );
    });

    test("calls the requested handler with all supplied arguments", () => {
        const argsReceived = [];
        const evaluator = new ProgressionRequirementEvaluator({
            customHandler(...args) {
                argsReceived.push(...args);
                return true;
            }
        });

        assert.equal(
            evaluator.call(
                "customHandler",
                "ARG_1",
                "ARG_2",
                "ARG_3"
            ),
            true
        );

        assert.deepEqual(
            argsReceived,
            ["ARG_1", "ARG_2", "ARG_3"]
        );
    });

    test("returns the handler's result unchanged", () => {
        const result = { allowed: true };

        const evaluator = new ProgressionRequirementEvaluator({
            customHandler() {
                return result;
            }
        });

        assert.equal(
            evaluator.call("customHandler"),
            result
        );
    });

    test("returns false when the handler returns false", () => {
        const evaluator = new ProgressionRequirementEvaluator({
            customHandler() {
                return false;
            }
        });

        assert.equal(
            evaluator.call("customHandler"),
            false
        );
    });

    test("returns undefined when a handler returns undefined", () => {
        const evaluator = new ProgressionRequirementEvaluator({
            customHandler() {
                return undefined;
            }
        });

        assert.equal(
            evaluator.call("customHandler"),
            undefined
        );
    });
});

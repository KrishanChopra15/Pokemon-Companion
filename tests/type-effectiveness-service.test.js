"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const TypeEffectivenessService =
    require("../scripts/services/type-effectiveness-service");


function createService() {
    return new TypeEffectivenessService();
}

function quietly(callback) {
    const originalLog = console.log;
    console.log = () => {};

    try {
        return callback();
    } finally {
        console.log = originalLog;
    }
}

function single(service, attackType, defenseType, context = {}) {
    return quietly(() =>
        service.getSingleMultiplier(
            attackType,
            defenseType,
            context
        )
    );
}

function multiplier(service, attackType, defenseTypes, context = {}) {
    return quietly(() =>
        service.getMultiplier(
            attackType,
            defenseTypes,
            context
        )
    );
}


// -----------------------------------------------
// Constructor and type chart
// -----------------------------------------------

test("constructor creates a TypeEffectivenessService instance", () => {
    assert.ok(createService() instanceof TypeEffectivenessService);
});

test("constructor initializes the type chart", () => {
    const service = createService();

    assert.ok(service.chart);
    assert.equal(typeof service.chart, "object");
});

test("constructor creates an independent chart for each instance", () => {
    const first = createService();
    const second = createService();

    assert.notEqual(first.chart, second.chart);
    assert.notEqual(first.chart.FIRE, second.chart.FIRE);
});

test("chart contains the expected attack types", () => {
    const service = createService();

    assert.deepEqual(
        Object.keys(service.chart),
        [
            "NORMAL",
            "FIRE",
            "WATER",
            "ELECTRIC",
            "GRASS",
            "ICE",
            "FIGHTING",
            "POISON",
            "GROUND",
            "FLYING",
            "PSYCHIC",
            "BUG",
            "ROCK",
            "GHOST",
            "DRAGON",
            "DARK",
            "STEEL"
        ]
    );
});

test("chart contains representative super-effective matchups", () => {
    const service = createService();

    assert.equal(service.chart.FIRE.GRASS, 2);
    assert.equal(service.chart.WATER.FIRE, 2);
    assert.equal(service.chart.ELECTRIC.WATER, 2);
    assert.equal(service.chart.GROUND.ELECTRIC, 2);
    assert.equal(service.chart.ICE.DRAGON, 2);
});

test("chart contains representative resisted matchups", () => {
    const service = createService();

    assert.equal(service.chart.FIRE.WATER, 0.5);
    assert.equal(service.chart.WATER.GRASS, 0.5);
    assert.equal(service.chart.ELECTRIC.GRASS, 0.5);
    assert.equal(service.chart.GRASS.FIRE, 0.5);
    assert.equal(service.chart.ICE.STEEL, 0.5);
});

test("chart contains representative immunities", () => {
    const service = createService();

    assert.equal(service.chart.NORMAL.GHOST, 0);
    assert.equal(service.chart.ELECTRIC.GROUND, 0);
    assert.equal(service.chart.FIGHTING.GHOST, 0);
    assert.equal(service.chart.POISON.STEEL, 0);
    assert.equal(service.chart.GROUND.FLYING, 0);
    assert.equal(service.chart.PSYCHIC.DARK, 0);
    assert.equal(service.chart.GHOST.NORMAL, 0);
});


// -----------------------------------------------
// normalizeType
// -----------------------------------------------

test("normalizeType uppercases lowercase strings", () => {
    const service = createService();

    assert.equal(service.normalizeType("fire"), "FIRE");
});

test("normalizeType uppercases mixed-case strings", () => {
    const service = createService();

    assert.equal(service.normalizeType("WaTeR"), "WATER");
});

test("normalizeType preserves uppercase types", () => {
    const service = createService();

    assert.equal(service.normalizeType("GRASS"), "GRASS");
});

test("normalizeType removes the TYPE_ prefix", () => {
    const service = createService();

    assert.equal(service.normalizeType("TYPE_FIRE"), "FIRE");
});

test("normalizeType removes the TYPE_ prefix from lowercase suffixes", () => {
    const service = createService();

    assert.equal(service.normalizeType("TYPE_water"), "WATER");
});

test("normalizeType accepts a type object with a constant", () => {
    const service = createService();

    assert.equal(
        service.normalizeType({ constant: "TYPE_ELECTRIC" }),
        "ELECTRIC"
    );
});

test("normalizeType uppercases a type object's constant", () => {
    const service = createService();

    assert.equal(
        service.normalizeType({ constant: "TYPE_grass" }),
        "GRASS"
    );
});

test("normalizeType accepts a type object with a name", () => {
    const service = createService();

    assert.equal(
        service.normalizeType({ name: "Water" }),
        "WATER"
    );
});

test("normalizeType prefers constant when both constant and name exist", () => {
    const service = createService();

    assert.equal(
        service.normalizeType({
            constant: "TYPE_FIRE",
            name: "Water"
        }),
        "FIRE"
    );
});

test("normalizeType defaults null to NORMAL", () => {
    const service = createService();

    assert.equal(service.normalizeType(null), "NORMAL");
});

test("normalizeType defaults undefined to NORMAL", () => {
    const service = createService();

    assert.equal(service.normalizeType(undefined), "NORMAL");
});

test("normalizeType defaults an empty string to NORMAL", () => {
    const service = createService();

    assert.equal(service.normalizeType(""), "NORMAL");
});

test("normalizeType defaults false to NORMAL", () => {
    const service = createService();

    assert.equal(service.normalizeType(false), "NORMAL");
});

test("normalizeType converts a number to a string", () => {
    const service = createService();

    assert.equal(service.normalizeType(123), "123");
});

test("normalizeType stringifies an object without a constant or name", () => {
    const service = createService();

    assert.equal(
        service.normalizeType({ other: "value" }),
        "[OBJECT OBJECT]"
    );
});


// -----------------------------------------------
// getSingleMultiplier: direct matchups
// -----------------------------------------------

const MATCHUPS = [
    ["NORMAL", "ROCK", 0.5],
    ["NORMAL", "GHOST", 0],
    ["NORMAL", "STEEL", 0.5],

    ["FIRE", "GRASS", 2],
    ["FIRE", "ICE", 2],
    ["FIRE", "BUG", 2],
    ["FIRE", "STEEL", 2],
    ["FIRE", "WATER", 0.5],
    ["FIRE", "ROCK", 0.5],
    ["FIRE", "DRAGON", 0.5],

    ["WATER", "FIRE", 2],
    ["WATER", "GROUND", 2],
    ["WATER", "ROCK", 2],
    ["WATER", "GRASS", 0.5],
    ["WATER", "DRAGON", 0.5],

    ["ELECTRIC", "WATER", 2],
    ["ELECTRIC", "FLYING", 2],
    ["ELECTRIC", "GROUND", 0],
    ["ELECTRIC", "GRASS", 0.5],
    ["ELECTRIC", "DRAGON", 0.5],

    ["GRASS", "WATER", 2],
    ["GRASS", "GROUND", 2],
    ["GRASS", "ROCK", 2],
    ["GRASS", "FIRE", 0.5],
    ["GRASS", "POISON", 0.5],
    ["GRASS", "FLYING", 0.5],
    ["GRASS", "BUG", 0.5],
    ["GRASS", "STEEL", 0.5],

    ["ICE", "GRASS", 2],
    ["ICE", "GROUND", 2],
    ["ICE", "FLYING", 2],
    ["ICE", "DRAGON", 2],
    ["ICE", "FIRE", 0.5],
    ["ICE", "WATER", 0.5],
    ["ICE", "STEEL", 0.5],

    ["FIGHTING", "NORMAL", 2],
    ["FIGHTING", "ROCK", 2],
    ["FIGHTING", "DARK", 2],
    ["FIGHTING", "STEEL", 2],
    ["FIGHTING", "GHOST", 0],
    ["FIGHTING", "FLYING", 0.5],
    ["FIGHTING", "PSYCHIC", 0.5],

    ["POISON", "GRASS", 2],
    ["POISON", "GROUND", 0.5],
    ["POISON", "GHOST", 0.5],
    ["POISON", "STEEL", 0],

    ["GROUND", "FIRE", 2],
    ["GROUND", "ELECTRIC", 2],
    ["GROUND", "POISON", 2],
    ["GROUND", "FLYING", 0],
    ["GROUND", "BUG", 0.5],

    ["FLYING", "GRASS", 2],
    ["FLYING", "FIGHTING", 2],
    ["FLYING", "BUG", 2],
    ["FLYING", "ELECTRIC", 0.5],

    ["PSYCHIC", "FIGHTING", 2],
    ["PSYCHIC", "POISON", 2],
    ["PSYCHIC", "DARK", 0],

    ["BUG", "GRASS", 2],
    ["BUG", "PSYCHIC", 2],
    ["BUG", "DARK", 2],
    ["BUG", "FIRE", 0.5],
    ["BUG", "GHOST", 0.5],

    ["ROCK", "FIRE", 2],
    ["ROCK", "ICE", 2],
    ["ROCK", "FLYING", 2],
    ["ROCK", "BUG", 2],
    ["ROCK", "FIGHTING", 0.5],

    ["GHOST", "PSYCHIC", 2],
    ["GHOST", "GHOST", 2],
    ["GHOST", "NORMAL", 0],

    ["DRAGON", "DRAGON", 2],
    ["DRAGON", "STEEL", 0.5],

    ["DARK", "PSYCHIC", 2],
    ["DARK", "GHOST", 2],
    ["DARK", "FIGHTING", 0.5],

    ["STEEL", "ICE", 2],
    ["STEEL", "ROCK", 2],
    ["STEEL", "FIRE", 0.5],
    ["STEEL", "WATER", 0.5]
];

for (const [attackType, defenseType, expected] of MATCHUPS) {
    test(
        `getSingleMultiplier returns ${expected} for ${attackType} versus ${defenseType}`,
        () => {
            const service = createService();

            assert.equal(
                single(service, attackType, defenseType),
                expected
            );
        }
    );
}


// -----------------------------------------------
// getSingleMultiplier: neutral effectiveness
// -----------------------------------------------

test("getSingleMultiplier defaults an unlisted matchup to neutral", () => {
    const service = createService();

    assert.equal(single(service, "FIRE", "NORMAL"), 1);
});

test("getSingleMultiplier defaults an unknown attack type to neutral", () => {
    const service = createService();

    assert.equal(single(service, "UNKNOWN", "GRASS"), 1);
});

test("getSingleMultiplier defaults an unknown defense type to neutral", () => {
    const service = createService();

    assert.equal(single(service, "FIRE", "UNKNOWN"), 1);
});

test("getSingleMultiplier defaults both unknown types to neutral", () => {
    const service = createService();

    assert.equal(single(service, "UNKNOWN", "UNKNOWN"), 1);
});

test("getSingleMultiplier treats a missing attack type as NORMAL", () => {
    const service = createService();

    assert.equal(single(service, undefined, "GHOST"), 0);
});

test("getSingleMultiplier treats a missing defense type as NORMAL", () => {
    const service = createService();

    assert.equal(single(service, "FIGHTING", undefined), 2);
});

test("getSingleMultiplier preserves a zero chart value", () => {
    const service = createService();

    assert.equal(single(service, "ELECTRIC", "GROUND"), 0);
});

test("getSingleMultiplier normalizes lowercase attack and defense types", () => {
    const service = createService();

    assert.equal(single(service, "fire", "grass"), 2);
});

test("getSingleMultiplier accepts TYPE_ prefixed values", () => {
    const service = createService();

    assert.equal(
        single(service, "TYPE_WATER", "TYPE_FIRE"),
        2
    );
});

test("getSingleMultiplier accepts objects with type constants", () => {
    const service = createService();

    assert.equal(
        single(
            service,
            { constant: "TYPE_FIRE" },
            { constant: "TYPE_GRASS" }
        ),
        2
    );
});

test("getSingleMultiplier accepts objects with type names", () => {
    const service = createService();

    assert.equal(
        single(
            service,
            { name: "electric" },
            { name: "water" }
        ),
        2
    );
});


// -----------------------------------------------
// Foresight behavior
// -----------------------------------------------

test("Foresight makes Normal effective against Ghost", () => {
    const service = createService();

    assert.equal(
        single(service, "NORMAL", "GHOST", { foresight: true }),
        1
    );
});

test("Foresight makes Fighting effective against Ghost", () => {
    const service = createService();

    assert.equal(
        single(service, "FIGHTING", "GHOST", { foresight: true }),
        1
    );
});

test("Normal remains ineffective against Ghost without Foresight", () => {
    const service = createService();

    assert.equal(single(service, "NORMAL", "GHOST"), 0);
});

test("Fighting remains ineffective against Ghost without Foresight", () => {
    const service = createService();

    assert.equal(single(service, "FIGHTING", "GHOST"), 0);
});

test("Foresight does not change Fire effectiveness against Ghost", () => {
    const service = createService();

    assert.equal(
        single(service, "FIRE", "GHOST", { foresight: true }),
        1
    );
});

test("Foresight does not change Normal effectiveness against Rock", () => {
    const service = createService();

    assert.equal(
        single(service, "NORMAL", "ROCK", { foresight: true }),
        0.5
    );
});

test("Foresight can be enabled with other context properties present", () => {
    const service = createService();

    assert.equal(
        single(
            service,
            "NORMAL",
            "GHOST",
            { foresight: true, otherContext: "value" }
        ),
        1
    );
});


// -----------------------------------------------
// getMultiplier: input handling
// -----------------------------------------------

test("getMultiplier returns one when the move type is missing", () => {
    const service = createService();

    assert.equal(multiplier(service, null, ["ROCK"]), 1);
});

test("getMultiplier returns one for an empty move type", () => {
    const service = createService();

    assert.equal(multiplier(service, "", ["GHOST"]), 1);
});

test("getMultiplier returns one for a false move type", () => {
    const service = createService();

    assert.equal(multiplier(service, false, ["GHOST"]), 1);
});

test("getMultiplier handles one defender type supplied as a string", () => {
    const service = createService();

    assert.equal(multiplier(service, "FIRE", "GRASS"), 2);
});

test("getMultiplier handles one defender type supplied in an array", () => {
    const service = createService();

    assert.equal(multiplier(service, "FIRE", ["GRASS"]), 2);
});

test("getMultiplier returns one when defender types are an empty array", () => {
    const service = createService();

    assert.equal(multiplier(service, "FIRE", []), 1);
});

test("getMultiplier wraps a missing defender type and normalizes it to NORMAL", () => {
    const service = createService();

    assert.equal(multiplier(service, "FIGHTING", undefined), 2);
});

test("getMultiplier normalizes a null defender type to NORMAL", () => {
    const service = createService();

    assert.equal(multiplier(service, "NORMAL", null), 1);
});

test("getMultiplier supports a defender type object", () => {
    const service = createService();

    assert.equal(
        multiplier(service, "FIRE", { constant: "TYPE_GRASS" }),
        2
    );
});

test("getMultiplier supports an attacker type object", () => {
    const service = createService();

    assert.equal(
        multiplier(
            service,
            { constant: "TYPE_FIRE" },
            ["GRASS"]
        ),
        2
    );
});


// -----------------------------------------------
// getMultiplier: dual types
// -----------------------------------------------

test("getMultiplier multiplies dual-type effectiveness", () => {
    const service = createService();

    assert.equal(
        multiplier(service, "WATER", ["FIRE", "GROUND"]),
        4
    );
});

test("getMultiplier combines a weakness and a resistance", () => {
    const service = createService();

    assert.equal(
        multiplier(service, "FIRE", ["GRASS", "WATER"]),
        1
    );
});

test("getMultiplier returns quarter effectiveness against two resistant types", () => {
    const service = createService();

    assert.equal(
        multiplier(service, "FIRE", ["WATER", "ROCK"]),
        0.25
    );
});

test("getMultiplier returns fourfold effectiveness against two vulnerable types", () => {
    const service = createService();

    assert.equal(
        multiplier(service, "ICE", ["GROUND", "FLYING"]),
        4
    );
});

test("getMultiplier returns zero when one defender type is immune", () => {
    const service = createService();

    assert.equal(
        multiplier(service, "ELECTRIC", ["WATER", "GROUND"]),
        0
    );
});

test("getMultiplier keeps effectiveness zero after multiplying further types", () => {
    const service = createService();

    assert.equal(
        multiplier(service, "NORMAL", ["GHOST", "ROCK"]),
        0
    );
});

test("getMultiplier handles three defender types", () => {
    const service = createService();

    assert.equal(
        multiplier(service, "FIRE", ["GRASS", "WATER", "ICE"]),
        2
    );
});

test("getMultiplier handles three neutral defender types", () => {
    const service = createService();

    assert.equal(
        multiplier(service, "DRAGON", ["NORMAL", "WATER", "ROCK"]),
        1
    );
});

test("getMultiplier applies Foresight to a Ghost type in a dual-type matchup", () => {
    const service = createService();

    assert.equal(
        multiplier(
            service,
            "NORMAL",
            ["GHOST", "DARK"],
            { foresight: true }
        ),
        1
    );
});

test("getMultiplier does not alter the provided defender type array", () => {
    const service = createService();

    const defenderTypes = ["GRASS", "WATER"];
    const originalTypes = [...defenderTypes];

    multiplier(service, "FIRE", defenderTypes);

    assert.deepEqual(defenderTypes, originalTypes);
});


// -----------------------------------------------
// Every defined chart entry is retrievable
// -----------------------------------------------

for (const [attackType, defenses] of Object.entries(createService().chart)) {
    test(`getSingleMultiplier reads every defined chart entry for ${attackType}`, () => {
        const service = createService();

        for (const [defenseType, expected] of Object.entries(defenses)) {
            assert.equal(
                single(service, attackType, defenseType),
                expected,
                `${attackType} versus ${defenseType}`
            );
        }
    });
}

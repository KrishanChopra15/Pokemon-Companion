"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const CaptureService = require(
    "../scripts/services/capture-service"
);

function createReference() {
    return {
        balls: {
            standardBalls: [
                {
                    itemConstant: "ITEM_POKE_BALL",
                    type: "STANDARD",
                    multiplier: 1
                },
                {
                    itemConstant: "ITEM_GREAT_BALL",
                    type: "STANDARD",
                    multiplier: 1.5
                },
                {
                    itemConstant: "ITEM_ULTRA_BALL",
                    type: "STANDARD",
                    multiplier: 2
                },
                {
                    itemConstant: "ITEM_SAFARI_BALL",
                    type: "SAFARI",
                    multiplier: 1.5,
                    usesSafariCatchFactor: true
                },
                {
                    itemConstant: "ITEM_LUXURY_BALL",
                    type: "STANDARD",
                    multiplier: 1
                }
            ],

            conditionalBalls: [
                {
                    itemConstant: "ITEM_NET_BALL",
                    type: "CONDITIONAL",
                    defaultMultiplier: 1,
                    conditions: [
                        {
                            condition: "TARGET_TYPE_WATER_OR_BUG",
                            multiplier: 3
                        }
                    ]
                },
                {
                    itemConstant: "ITEM_DIVE_BALL",
                    type: "CONDITIONAL",
                    defaultMultiplier: 1,
                    conditions: [
                        {
                            condition: "UNDERWATER",
                            multiplier: 3
                        }
                    ]
                },
                {
                    itemConstant: "ITEM_REPEAT_BALL",
                    type: "CONDITIONAL",
                    defaultMultiplier: 1,
                    conditions: [
                        {
                            condition: "TARGET_ALREADY_CAUGHT",
                            multiplier: 3
                        }
                    ]
                },
                {
                    itemConstant: "ITEM_NEST_BALL",
                    type: "LEVEL_BASED",
                    defaultMultiplier: 1,
                    minimumMultiplier: 10
                },
                {
                    itemConstant: "ITEM_TIMER_BALL",
                    type: "TURN_BASED",
                    defaultMultiplier: 1,
                    maximumMultiplier: 4
                }
            ],

            masterBall: {
                itemConstant: "ITEM_MASTER_BALL",
                type: "MASTER",
                guaranteed: true
            }
        }
    };
}

function createService(reference = createReference()) {
    return new CaptureService(reference);
}

function createPokemon(overrides = {}) {
    return {
        species: "Bulbasaur",
        catchRate: 45,
        hp: 50,
        currentHP: 50,
        maxHP: 100,
        level: 10,
        types: ["Grass"],
        ...overrides
    };
}

function createOptions(overrides = {}) {
    return {
        catchRate: 100,
        maxHP: 100,
        currentHP: 50,
        ball: "ITEM_POKE_BALL",
        ...overrides
    };
}

function withMockedRandom(values, callback) {
    const originalRandom = Math.random;
    let index = 0;

    Math.random = () => {
        const currentIndex = Math.min(index, values.length - 1);
        index++;
        return values[currentIndex];
    };

    try {
        return callback();
    } finally {
        Math.random = originalRandom;
    }
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor stores the capture reference", () => {
    const reference = createReference();
    const service = new CaptureService(reference);

    assert.strictEqual(service.reference, reference);
});

test("constructor uses the nested balls collection", () => {
    const reference = createReference();
    const service = new CaptureService(reference);

    assert.strictEqual(service.balls, reference.balls);
});

test("constructor supports older root-level ball references", () => {
    const reference = {
        standardBalls: [
            {
                itemConstant: "ITEM_POKE_BALL",
                type: "STANDARD",
                multiplier: 1
            }
        ]
    };

    const service = new CaptureService(reference);

    assert.strictEqual(service.balls, reference);
});

test("constructor throws when capture reference data is missing", () => {
    assert.throws(
        () => new CaptureService(),
        {
            name: "TypeError",
            message: "Capture reference data is required."
        }
    );
});

test("constructor throws for null reference data", () => {
    assert.throws(
        () => new CaptureService(null),
        {
            name: "TypeError",
            message: "Capture reference data is required."
        }
    );
});

test("constructor throws for false reference data", () => {
    assert.throws(
        () => new CaptureService(false),
        TypeError
    );
});

// --------------------------------------------------
// Ball normalization and lookup
// --------------------------------------------------

test("normalizeBallConstant defaults to a Poké Ball", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant(),
        "ITEM_POKE_BALL"
    );
});

test("normalizeBallConstant supports POKEBALL", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant("pokeball"),
        "ITEM_POKE_BALL"
    );
});

test("normalizeBallConstant supports GREATBALL", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant("greatball"),
        "ITEM_GREAT_BALL"
    );
});

test("normalizeBallConstant supports ULTRA_BALL", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant("ultra_ball"),
        "ITEM_ULTRA_BALL"
    );
});

test("normalizeBallConstant supports MASTERBALL", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant("masterball"),
        "ITEM_MASTER_BALL"
    );
});

test("normalizeBallConstant supports SAFARIBALL", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant("safariball"),
        "ITEM_SAFARI_BALL"
    );
});

test("normalizeBallConstant supports NETBALL", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant("netball"),
        "ITEM_NET_BALL"
    );
});

test("normalizeBallConstant supports DIVEBALL", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant("diveball"),
        "ITEM_DIVE_BALL"
    );
});

test("normalizeBallConstant supports NESTBALL", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant("nestball"),
        "ITEM_NEST_BALL"
    );
});

test("normalizeBallConstant supports REPEATBALL", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant("repeatball"),
        "ITEM_REPEAT_BALL"
    );
});

test("normalizeBallConstant supports TIMERBALL", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant("timerball"),
        "ITEM_TIMER_BALL"
    );
});

test("normalizeBallConstant supports LUXURYBALL", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant("luxuryball"),
        "ITEM_LUXURY_BALL"
    );
});

test("normalizeBallConstant trims whitespace and ignores case", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant("  great_ball  "),
        "ITEM_GREAT_BALL"
    );
});

test("normalizeBallConstant preserves unknown constants in uppercase", () => {
    const service = createService();

    assert.equal(
        service.normalizeBallConstant("custom_ball"),
        "CUSTOM_BALL"
    );
});

test("getBall finds a standard ball", () => {
    const service = createService();

    assert.equal(
        service.getBall("ITEM_POKE_BALL").multiplier,
        1
    );
});

test("getBall finds a conditional ball", () => {
    const service = createService();

    assert.equal(
        service.getBall("ITEM_NET_BALL").type,
        "CONDITIONAL"
    );
});

test("getBall returns a guaranteed Master Ball", () => {
    const service = createService();
    const ball = service.getBall("ITEM_MASTER_BALL");

    assert.equal(ball.guaranteed, true);
    assert.equal(ball.itemConstant, "ITEM_MASTER_BALL");
});

test("getBall accepts a ball alias", () => {
    const service = createService();

    assert.equal(
        service.getBall("greatball").itemConstant,
        "ITEM_GREAT_BALL"
    );
});

test("getBall returns null for an unknown ball", () => {
    const service = createService();

    assert.equal(service.getBall("ITEM_UNKNOWN_BALL"), null);
});

test("getBall defaults to a Poké Ball for an empty constant", () => {
    const service = createService();

    assert.equal(
        service.getBall("").itemConstant,
        "ITEM_POKE_BALL"
    );
});

// --------------------------------------------------
// Ball collection
// --------------------------------------------------

test("getAllBalls includes standard balls", () => {
    const service = createService();

    const balls = service.getAllBalls();

    assert.ok(
        balls.some(ball => ball.itemConstant === "ITEM_POKE_BALL")
    );
});

test("getAllBalls includes conditional balls", () => {
    const service = createService();

    const balls = service.getAllBalls();

    assert.ok(
        balls.some(ball => ball.itemConstant === "ITEM_NET_BALL")
    );
});

test("getAllBalls includes the Master Ball", () => {
    const service = createService();

    const balls = service.getAllBalls();

    assert.ok(
        balls.some(ball => ball.itemConstant === "ITEM_MASTER_BALL")
    );
});

test("getAllBalls removes duplicate item constants", () => {
    const reference = createReference();

    reference.balls.conditionalBalls.push({
        itemConstant: "ITEM_POKE_BALL",
        type: "STANDARD",
        multiplier: 99
    });

    const service = createService(reference);
    const balls = service.getAllBalls();

    assert.equal(
        balls.filter(ball => ball.itemConstant === "ITEM_POKE_BALL")
            .length,
        1
    );
});

test("addUniqueBall ignores a missing ball", () => {
    const service = createService();
    const balls = [];

    service.addUniqueBall(balls, null);

    assert.deepEqual(balls, []);
});

test("addUniqueBall ignores duplicate constants", () => {
    const service = createService();
    const first = { itemConstant: "ITEM_POKE_BALL" };
    const second = { itemConstant: "ITEM_POKE_BALL" };
    const balls = [first];

    service.addUniqueBall(balls, second);

    assert.deepEqual(balls, [first]);
});

test("addUniqueBall adds a unique ball", () => {
    const service = createService();
    const ball = { itemConstant: "ITEM_GREAT_BALL" };
    const balls = [];

    service.addUniqueBall(balls, ball);

    assert.deepEqual(balls, [ball]);
});

test("getAllBalls returns an empty list when no collections exist", () => {
    const service = createService({ balls: {} });

    assert.deepEqual(service.getAllBalls(), []);
});

// --------------------------------------------------
// Status normalization
// --------------------------------------------------

test("normalizeStatus defaults to NONE", () => {
    const service = createService();

    assert.equal(service.normalizeStatus(), "NONE");
});

test("normalizeStatus converts NORMAL to NONE", () => {
    const service = createService();

    assert.equal(service.normalizeStatus("normal"), "NONE");
});

test("normalizeStatus converts ASLEEP to SLEEP", () => {
    const service = createService();

    assert.equal(service.normalizeStatus("asleep"), "SLEEP");
});

test("normalizeStatus preserves SLEEP", () => {
    const service = createService();

    assert.equal(service.normalizeStatus("sleep"), "SLEEP");
});

test("normalizeStatus converts FROZEN to FREEZE", () => {
    const service = createService();

    assert.equal(service.normalizeStatus("frozen"), "FREEZE");
});

test("normalizeStatus converts POISONED to POISON", () => {
    const service = createService();

    assert.equal(service.normalizeStatus("poisoned"), "POISON");
});

test("normalizeStatus converts BURNED to BURN", () => {
    const service = createService();

    assert.equal(service.normalizeStatus("burned"), "BURN");
});

test("normalizeStatus converts PARALYZED to PARALYSIS", () => {
    const service = createService();

    assert.equal(service.normalizeStatus("paralyzed"), "PARALYSIS");
});

test("normalizeStatus converts TOXIC_POISON to TOXIC", () => {
    const service = createService();

    assert.equal(service.normalizeStatus("toxic_poison"), "TOXIC");
});

test("normalizeStatus uppercases and trims unknown statuses", () => {
    const service = createService();

    assert.equal(
        service.normalizeStatus("  custom_status "),
        "CUSTOM_STATUS"
    );
});

// --------------------------------------------------
// Input validation
// --------------------------------------------------

test("validateCatchRate accepts a non-negative number", () => {
    const service = createService();

    assert.equal(service.validateCatchRate(45), 45);
});

test("validateCatchRate floors fractional values", () => {
    const service = createService();

    assert.equal(service.validateCatchRate(45.9), 45);
});

test("validateCatchRate accepts a numeric string", () => {
    const service = createService();

    assert.equal(service.validateCatchRate("45"), 45);
});

test("validateCatchRate rejects negative values", () => {
    const service = createService();

    assert.throws(
        () => service.validateCatchRate(-1),
        RangeError
    );
});

test("validateCatchRate rejects non-numeric values", () => {
    const service = createService();

    assert.throws(
        () => service.validateCatchRate("invalid"),
        RangeError
    );
});

test("validateCatchRate rejects Infinity", () => {
    const service = createService();

    assert.throws(
        () => service.validateCatchRate(Infinity),
        RangeError
    );
});

test("validateHP accepts positive HP", () => {
    const service = createService();

    assert.equal(service.validateHP(100, "maxHP"), 100);
});

test("validateHP floors fractional HP", () => {
    const service = createService();

    assert.equal(service.validateHP(100.9, "maxHP"), 100);
});

test("validateHP rejects zero", () => {
    const service = createService();

    assert.throws(
        () => service.validateHP(0, "maxHP"),
        RangeError
    );
});

test("validateHP rejects negative HP", () => {
    const service = createService();

    assert.throws(
        () => service.validateHP(-1, "maxHP"),
        RangeError
    );
});

test("validateHP rejects a non-finite value", () => {
    const service = createService();

    assert.throws(
        () => service.validateHP(NaN, "maxHP"),
        RangeError
    );
});

test("validateCurrentHP floors fractional HP", () => {
    const service = createService();

    assert.equal(service.validateCurrentHP(25.9, 100), 25);
});

test("validateCurrentHP clamps negative HP to zero", () => {
    const service = createService();

    assert.equal(service.validateCurrentHP(-10, 100), 0);
});

test("validateCurrentHP clamps HP above maxHP", () => {
    const service = createService();

    assert.equal(service.validateCurrentHP(150, 100), 100);
});

test("validateCurrentHP accepts zero HP", () => {
    const service = createService();

    assert.equal(service.validateCurrentHP(0, 100), 0);
});

test("validateCurrentHP rejects a non-numeric value", () => {
    const service = createService();

    assert.throws(
        () => service.validateCurrentHP("invalid", 100),
        RangeError
    );
});

test("validateSafariFactor floors a positive factor", () => {
    const service = createService();

    assert.equal(service.validateSafariFactor(12.9), 12);
});

test("validateSafariFactor rejects negative factors", () => {
    const service = createService();

    assert.throws(
        () => service.validateSafariFactor(-1),
        RangeError
    );
});

test("validateSafariFactor rejects non-finite factors", () => {
    const service = createService();

    assert.throws(
        () => service.validateSafariFactor(NaN),
        RangeError
    );
});

// --------------------------------------------------
// Target types
// --------------------------------------------------

test("getTargetTypes prefers the supplied targetTypes array", () => {
    const service = createService();
    const targetTypes = ["Water", "Ice"];

    assert.strictEqual(
        service.getTargetTypes({
            targetTypes,
            pokemon: { types: ["Fire"] }
        }),
        targetTypes
    );
});

test("getTargetTypes derives types from the supplied Pokémon", () => {
    const service = createService();
    const pokemon = { types: ["Water", "Flying"] };

    assert.deepEqual(
        service.getTargetTypes({ pokemon }),
        ["Water", "Flying"]
    );
});

test("getTargetTypes returns an empty list when types are unavailable", () => {
    const service = createService();

    assert.deepEqual(service.getTargetTypes({}), []);
});

test("getTargetTypesFromPokemon returns an empty list for a missing Pokémon", () => {
    const service = createService();

    assert.deepEqual(service.getTargetTypesFromPokemon(null), []);
});

test("getTargetTypesFromPokemon uses the types array", () => {
    const service = createService();
    const types = ["Grass", "Poison"];

    assert.strictEqual(
        service.getTargetTypesFromPokemon({ types }),
        types
    );
});

test("getTargetTypesFromPokemon supports type1 and type2", () => {
    const service = createService();

    assert.deepEqual(
        service.getTargetTypesFromPokemon({
            type1: "Fire",
            type2: "Flying"
        }),
        ["Fire", "Flying"]
    );
});

test("getTargetTypesFromPokemon supports only type1", () => {
    const service = createService();

    assert.deepEqual(
        service.getTargetTypesFromPokemon({
            type1: "Water"
        }),
        ["Water"]
    );
});

test("hasTargetType matches strings without case sensitivity", () => {
    const service = createService();

    assert.equal(
        service.hasTargetType(["WATER"], "Water"),
        true
    );
});

test("hasTargetType matches type objects by name", () => {
    const service = createService();

    assert.equal(
        service.hasTargetType([{ name: "Bug" }], "BUG"),
        true
    );
});

test("hasTargetType returns false for an unlisted type", () => {
    const service = createService();

    assert.equal(
        service.hasTargetType(["Fire"], "Water"),
        false
    );
});

test("hasTargetType returns false for a non-array", () => {
    const service = createService();

    assert.equal(service.hasTargetType("Water", "Water"), false);
});

test("getPokemonIdentifier prefers species", () => {
    const service = createService();

    assert.equal(
        service.getPokemonIdentifier({
            species: "Pikachu",
            name: "Other",
            id: 25
        }),
        "Pikachu"
    );
});

test("getPokemonIdentifier falls back to name", () => {
    const service = createService();

    assert.equal(
        service.getPokemonIdentifier({ name: "Pikachu", id: 25 }),
        "Pikachu"
    );
});

test("getPokemonIdentifier falls back to constant", () => {
    const service = createService();

    assert.equal(
        service.getPokemonIdentifier({ constant: "SPECIES_PIKACHU" }),
        "SPECIES_PIKACHU"
    );
});

test("getPokemonIdentifier falls back to ID", () => {
    const service = createService();

    assert.equal(
        service.getPokemonIdentifier({ id: 25 }),
        25
    );
});

test("getPokemonIdentifier returns null when there is no identifier", () => {
    const service = createService();

    assert.equal(service.getPokemonIdentifier({}), null);
});

// --------------------------------------------------
// Ball multipliers
// --------------------------------------------------

test("calculateBallMultiplier returns null for a guaranteed ball", () => {
    const service = createService();

    assert.equal(
        service.calculateBallMultiplier({ guaranteed: true }),
        null
    );
});

test("calculateBallMultiplier returns a standard multiplier", () => {
    const service = createService();

    assert.equal(
        service.calculateBallMultiplier({
            type: "STANDARD",
            multiplier: 1.5
        }),
        1.5
    );
});

test("calculateBallMultiplier converts a standard multiplier to a number", () => {
    const service = createService();

    assert.equal(
        service.calculateBallMultiplier({
            type: "STANDARD",
            multiplier: "2"
        }),
        2
    );
});

test("calculateBallMultiplier uses the default multiplier", () => {
    const service = createService();

    assert.equal(
        service.calculateBallMultiplier({
            defaultMultiplier: 1.25
        }),
        1.25
    );
});

test("calculateBallMultiplier defaults to one", () => {
    const service = createService();

    assert.equal(
        service.calculateBallMultiplier({}),
        1
    );
});

test("calculateBallMultiplier delegates conditional balls", () => {
    const service = createService();
    const ball = {
        type: "CONDITIONAL",
        defaultMultiplier: 1,
        conditions: [
            {
                condition: "UNDERWATER",
                multiplier: 3
            }
        ]
    };

    assert.equal(
        service.calculateBallMultiplier(ball, { underwater: true }),
        3
    );
});

test("calculateBallMultiplier delegates level-based balls", () => {
    const service = createService();
    const ball = {
        type: "LEVEL_BASED",
        defaultMultiplier: 1,
        minimumMultiplier: 10
    };

    assert.equal(
        service.calculateBallMultiplier(ball, { level: 10 }),
        3
    );
});

test("calculateBallMultiplier delegates turn-based balls", () => {
    const service = createService();
    const ball = {
        type: "TURN_BASED",
        defaultMultiplier: 1,
        maximumMultiplier: 4
    };

    assert.equal(
        service.calculateBallMultiplier(ball, { battleTurn: 10 }),
        2
    );
});

test("calculateBallMultiplier supports Safari balls", () => {
    const service = createService();

    assert.equal(
        service.calculateBallMultiplier({
            type: "SAFARI",
            multiplier: 1.5
        }),
        1.5
    );
});

test("calculateConditionalMultiplier uses its default when conditions are missing", () => {
    const service = createService();

    assert.equal(
        service.calculateConditionalMultiplier({
            defaultMultiplier: 1.25
        }, {}),
        1.25
    );
});

test("calculateConditionalMultiplier applies the first matching condition", () => {
    const service = createService();

    const ball = {
        defaultMultiplier: 1,
        conditions: [
            {
                condition: "UNDERWATER",
                multiplier: 3
            },
            {
                condition: "TARGET_ALREADY_CAUGHT",
                multiplier: 2
            }
        ]
    };

    assert.equal(
        service.calculateConditionalMultiplier(ball, {
            underwater: true,
            alreadyCaught: true
        }),
        3
    );
});

test("calculateConditionalMultiplier keeps the default when nothing matches", () => {
    const service = createService();

    assert.equal(
        service.calculateConditionalMultiplier({
            defaultMultiplier: 1.5,
            conditions: [
                {
                    condition: "UNDERWATER",
                    multiplier: 3
                }
            ]
        }, {}),
        1.5
    );
});

test("conditionMatches recognizes Water targets", () => {
    const service = createService();

    assert.equal(
        service.conditionMatches(
            "TARGET_TYPE_WATER_OR_BUG",
            { targetTypes: ["Water"] }
        ),
        true
    );
});

test("conditionMatches recognizes Bug targets", () => {
    const service = createService();

    assert.equal(
        service.conditionMatches(
            "TARGET_TYPE_WATER_OR_BUG",
            { targetTypes: ["Bug"] }
        ),
        true
    );
});

test("conditionMatches recognizes underwater context", () => {
    const service = createService();

    assert.equal(
        service.conditionMatches("UNDERWATER", { underwater: true }),
        true
    );
});

test("conditionMatches recognizes previously caught Pokémon", () => {
    const service = createService();

    assert.equal(
        service.conditionMatches(
            "TARGET_ALREADY_CAUGHT",
            { alreadyCaught: true }
        ),
        true
    );
});

test("conditionMatches returns false for unknown conditions", () => {
    const service = createService();

    assert.equal(
        service.conditionMatches("UNKNOWN", {}),
        false
    );
});

test("calculateLevelMultiplier uses the fallback for an invalid level", () => {
    const service = createService();

    assert.equal(
        service.calculateLevelMultiplier({
            defaultMultiplier: 1.25
        }, { level: "invalid" }),
        1.25
    );
});

test("calculateLevelMultiplier applies the level formula below level 40", () => {
    const service = createService();

    assert.equal(
        service.calculateLevelMultiplier({
            defaultMultiplier: 1,
            minimumMultiplier: 10
        }, { level: 10 }),
        3
    );
});

test("calculateLevelMultiplier applies the configured minimum", () => {
    const service = createService();

    assert.equal(
        service.calculateLevelMultiplier({
            defaultMultiplier: 1,
            minimumMultiplier: 20
        }, { level: 39 }),
        2
    );
});

test("calculateLevelMultiplier uses the default at level 40", () => {
    const service = createService();

    assert.equal(
        service.calculateLevelMultiplier({
            defaultMultiplier: 1.5
        }, { level: 40 }),
        1.5
    );
});

test("calculateTurnMultiplier starts at one", () => {
    const service = createService();

    assert.equal(
        service.calculateTurnMultiplier({
            defaultMultiplier: 1
        }, { battleTurn: 0 }),
        1
    );
});

test("calculateTurnMultiplier grows with battle turns", () => {
    const service = createService();

    assert.equal(
        service.calculateTurnMultiplier({
            defaultMultiplier: 1,
            maximumMultiplier: 4
        }, { battleTurn: 10 }),
        2
    );
});

test("calculateTurnMultiplier respects the maximum", () => {
    const service = createService();

    assert.equal(
        service.calculateTurnMultiplier({
            defaultMultiplier: 1,
            maximumMultiplier: 2
        }, { battleTurn: 100 }),
        2
    );
});

test("calculateTurnMultiplier does not use negative turns", () => {
    const service = createService();

    assert.equal(
        service.calculateTurnMultiplier({
            defaultMultiplier: 1
        }, { battleTurn: -10 }),
        1
    );
});

// --------------------------------------------------
// Safari catch rate
// --------------------------------------------------

test("calculateSafariCatchRate applies the reference formula", () => {
    const service = createService();

    assert.equal(service.calculateSafariCatchRate(10), 127);
});

test("calculateSafariCatchRate floors fractional results", () => {
    const service = createService();

    assert.equal(service.calculateSafariCatchRate(1), 12);
});

test("calculateSafariCatchRate caps the result at 255", () => {
    const service = createService();

    assert.equal(service.calculateSafariCatchRate(100), 255);
});

test("calculateSafariCatchRate accepts zero", () => {
    const service = createService();

    assert.equal(service.calculateSafariCatchRate(0), 0);
});

test("calculateSafariCatchRate rejects a negative factor", () => {
    const service = createService();

    assert.throws(
        () => service.calculateSafariCatchRate(-1),
        RangeError
    );
});

// --------------------------------------------------
// Modified capture odds
// --------------------------------------------------

test("calculateModifiedOdds applies the HP formula", () => {
    const service = createService();

    assert.equal(
        service.calculateModifiedOdds(100, 1, 50, 100, "NONE"),
        66
    );
});

test("calculateModifiedOdds reduces odds at full HP", () => {
    const service = createService();

    assert.equal(
        service.calculateModifiedOdds(100, 1, 100, 100, "NONE"),
        33
    );
});

test("calculateModifiedOdds increases odds at zero HP", () => {
    const service = createService();

    assert.equal(
        service.calculateModifiedOdds(100, 1, 0, 100, "NONE"),
        100
    );
});

test("calculateModifiedOdds doubles the odds for sleep", () => {
    const service = createService();

    assert.equal(
        service.calculateModifiedOdds(100, 1, 50, 100, "SLEEP"),
        132
    );
});

test("calculateModifiedOdds doubles the odds for freeze", () => {
    const service = createService();

    assert.equal(
        service.calculateModifiedOdds(100, 1, 50, 100, "FREEZE"),
        132
    );
});

test("calculateModifiedOdds multiplies odds by 1.5 for poison", () => {
    const service = createService();

    assert.equal(
        service.calculateModifiedOdds(100, 1, 50, 100, "POISON"),
        99
    );
});

test("calculateModifiedOdds multiplies odds by 1.5 for burn", () => {
    const service = createService();

    assert.equal(
        service.calculateModifiedOdds(100, 1, 50, 100, "BURN"),
        99
    );
});

test("calculateModifiedOdds multiplies odds by 1.5 for paralysis", () => {
    const service = createService();

    assert.equal(
        service.calculateModifiedOdds(100, 1, 50, 100, "PARALYSIS"),
        99
    );
});

test("calculateModifiedOdds multiplies odds by 1.5 for toxic", () => {
    const service = createService();

    assert.equal(
        service.calculateModifiedOdds(100, 1, 50, 100, "TOXIC"),
        99
    );
});

test("calculateModifiedOdds returns zero for zero catch rate", () => {
    const service = createService();

    assert.equal(
        service.calculateModifiedOdds(0, 1, 50, 100, "NONE"),
        0
    );
});

test("calculateModifiedOdds never returns negative odds", () => {
    const service = createService();

    assert.equal(
        service.calculateModifiedOdds(0, 1, 0, 100, "NONE"),
        0
    );
});

// --------------------------------------------------
// Shake threshold and probability
// --------------------------------------------------

test("calculateShakeThreshold returns zero for zero odds", () => {
    const service = createService();

    assert.equal(service.calculateShakeThreshold(0), 0);
});

test("calculateShakeThreshold returns zero for negative odds", () => {
    const service = createService();

    assert.equal(service.calculateShakeThreshold(-1), 0);
});

test("calculateShakeThreshold returns a positive threshold for positive odds", () => {
    const service = createService();

    assert.ok(service.calculateShakeThreshold(100) > 0);
});

test("calculateShakeThreshold stays within the supported range", () => {
    const service = createService();

    const threshold = service.calculateShakeThreshold(1);

    assert.ok(threshold >= 0);
    assert.ok(threshold <= 65535);
});

test("calculateShakeThreshold increases for higher capture odds", () => {
    const service = createService();

    assert.ok(
        service.calculateShakeThreshold(200) >
        service.calculateShakeThreshold(20)
    );
});

test("calculateShakeChance returns zero for a zero threshold", () => {
    const service = createService();

    assert.equal(service.calculateShakeChance(0), 0);
});

test("calculateShakeChance returns one for threshold 65536", () => {
    const service = createService();

    assert.equal(service.calculateShakeChance(65536), 1);
});

test("calculateShakeChance returns one half for threshold 32768", () => {
    const service = createService();

    assert.equal(service.calculateShakeChance(32768), 0.5);
});

test("calculateShakeChance returns a fraction for a partial threshold", () => {
    const service = createService();

    assert.equal(
        service.calculateShakeChance(16384),
        0.25
    );
});

test("random16 can return zero", () => {
    const service = createService();

    assert.equal(
        withMockedRandom([0], () => service.random16()),
        0
    );
});

test("random16 can return the maximum 16-bit value", () => {
    const service = createService();

    assert.equal(
        withMockedRandom([0.99999], () => service.random16()),
        65535
    );
});

test("random16 returns an integer", () => {
    const service = createService();

    const result = withMockedRandom([0.5], () => service.random16());

    assert.equal(Number.isInteger(result), true);
    assert.equal(result, 32768);
});

// --------------------------------------------------
// Capture calculation
// --------------------------------------------------

test("calculate returns a result with the expected fields", () => {
    const service = createService();

    const result = service.calculate(createOptions());

    assert.equal(result.ball, "ITEM_POKE_BALL");
    assert.equal(result.available, true);
    assert.equal(result.catchRate, 100);
    assert.equal(result.maxHP, 100);
    assert.equal(result.currentHP, 50);
    assert.equal(result.status, "NONE");
    assert.equal(result.ballMultiplier, 1);
    assert.equal(result.modifiedOdds, 66);
    assert.equal(result.shakesRequired, 3);
    assert.equal(result.guaranteed, false);
});

test("calculate accepts a ball alias", () => {
    const service = createService();

    const result = service.calculate(
        createOptions({ ball: "greatball" })
    );

    assert.equal(result.ball, "ITEM_GREAT_BALL");
    assert.equal(result.ballMultiplier, 1.5);
});

test("calculate uses the normalized status", () => {
    const service = createService();

    const result = service.calculate(
        createOptions({ status: "asleep" })
    );

    assert.equal(result.status, "SLEEP");
    assert.equal(result.modifiedOdds, 132);
});

test("calculate floors fractional catch rates", () => {
    const service = createService();

    const result = service.calculate(
        createOptions({ catchRate: 100.9 })
    );

    assert.equal(result.catchRate, 100);
});

test("calculate clamps current HP to max HP", () => {
    const service = createService();

    const result = service.calculate(
        createOptions({ currentHP: 150 })
    );

    assert.equal(result.currentHP, 100);
});

test("calculate clamps negative current HP to zero", () => {
    const service = createService();

    const result = service.calculate(
        createOptions({ currentHP: -10 })
    );

    assert.equal(result.currentHP, 0);
});

test("calculate throws when the ball is unknown", () => {
    const service = createService();

    assert.throws(
        () => service.calculate(
            createOptions({ ball: "UNKNOWN_BALL" })
        ),
        /Unknown capture ball/
    );
});

test("calculate throws when catch rate is invalid", () => {
    const service = createService();

    assert.throws(
        () => service.calculate(
            createOptions({ catchRate: -1 })
        ),
        RangeError
    );
});

test("calculate throws when maximum HP is zero", () => {
    const service = createService();

    assert.throws(
        () => service.calculate(
            createOptions({ maxHP: 0 })
        ),
        RangeError
    );
});

test("calculate throws when current HP is not numeric", () => {
    const service = createService();

    assert.throws(
        () => service.calculate(
            createOptions({ currentHP: "invalid" })
        ),
        RangeError
    );
});

test("calculate guarantees capture with a Master Ball", () => {
    const service = createService();

    const result = service.calculate(
        createOptions({ ball: "ITEM_MASTER_BALL" })
    );

    assert.equal(result.guaranteed, true);
    assert.equal(result.captureChance, 1);
    assert.equal(result.capturePercentage, 100);
    assert.equal(result.shakesRequired, 3);
    assert.equal(result.shakeChance, 1);
    assert.equal(result.modifiedOdds, 255);
    assert.equal(result.shakeThreshold, null);
});

test("calculate guarantees capture when modified odds exceed 254", () => {
    const service = createService();

    const result = service.calculate(
        createOptions({
            catchRate: 300,
            currentHP: 0
        })
    );

    assert.equal(result.guaranteed, true);
    assert.equal(result.captureChance, 1);
    assert.equal(result.capturePercentage, 100);
});

test("calculate requires safariCatchFactor for Safari Balls", () => {
    const service = createService();

    assert.throws(
        () => service.calculate(
            createOptions({ ball: "ITEM_SAFARI_BALL" })
        ),
        /Safari Ball requires safariCatchFactor/
    );
});

test("calculate applies the Safari catch factor", () => {
    const service = createService();

    const result = service.calculate(
        createOptions({
            ball: "ITEM_SAFARI_BALL",
            safariCatchFactor: 10
        })
    );

    assert.equal(result.catchRate, 127);
    assert.equal(result.ball, "ITEM_SAFARI_BALL");
});

test("calculate uses target types for conditional multipliers", () => {
    const service = createService();

    const result = service.calculate(
        createOptions({
            ball: "ITEM_NET_BALL",
            targetTypes: ["Water"]
        })
    );

    assert.equal(result.ballMultiplier, 3);
});

test("calculate uses the Nest Ball level multiplier", () => {
    const service = createService();

    const result = service.calculate(
        createOptions({
            ball: "ITEM_NEST_BALL",
            level: 10
        })
    );

    assert.equal(result.ballMultiplier, 3);
});

test("calculate uses the Timer Ball turn multiplier", () => {
    const service = createService();

    const result = service.calculate(
        createOptions({
            ball: "ITEM_TIMER_BALL",
            battleTurn: 10
        })
    );

    assert.equal(result.ballMultiplier, 2);
});

test("calculate computes capture chance from three shake checks", () => {
    const service = createService();

    const result = service.calculate(createOptions());

    assert.equal(
        result.captureChance,
        Math.pow(result.shakeChance, 3)
    );

    assert.equal(
        result.capturePercentage,
        result.captureChance * 100
    );
});

// --------------------------------------------------
// Calculate for all balls
// --------------------------------------------------

test("calculateForAllBalls returns one result per unique ball", () => {
    const service = createService();

    const results = service.calculateForAllBalls({
        catchRate: 100,
        maxHP: 100,
        currentHP: 50,
        level: 10,
        battleTurn: 5
    });

    assert.equal(results.length, service.getAllBalls().length);
});

test("calculateForAllBalls calculates standard balls", () => {
    const service = createService();

    const results = service.calculateForAllBalls({
        catchRate: 100,
        maxHP: 100,
        currentHP: 50
    });

    const pokeBall = results.find(
        result => result.ball === "ITEM_POKE_BALL"
    );

    assert.equal(pokeBall.available, true);
    assert.equal(pokeBall.ballMultiplier, 1);
});

test("calculateForAllBalls marks Safari Ball unavailable without a factor", () => {
    const service = createService();

    const results = service.calculateForAllBalls({
        catchRate: 100,
        maxHP: 100,
        currentHP: 50
    });

    const safariBall = results.find(
        result => result.ball === "ITEM_SAFARI_BALL"
    );

    assert.equal(safariBall.available, false);
    assert.equal(
        safariBall.reason,
        "Safari Ball requires safariCatchFactor."
    );
});

test("calculateForAllBalls calculates Safari Ball when a factor is supplied", () => {
    const service = createService();

    const results = service.calculateForAllBalls({
        catchRate: 100,
        maxHP: 100,
        currentHP: 50,
        safariCatchFactor: 10
    });

    const safariBall = results.find(
        result => result.ball === "ITEM_SAFARI_BALL"
    );

    assert.equal(safariBall.available, true);
    assert.equal(safariBall.catchRate, 127);
});

test("calculateForAllBalls reports validation errors as unavailable results", () => {
    const service = createService();

    const results = service.calculateForAllBalls({
        catchRate: -1,
        maxHP: 100,
        currentHP: 50,
        safariCatchFactor: 10
    });

    assert.ok(results.length > 0);

    for (const result of results) {
        assert.equal(result.available, false);
        assert.equal(typeof result.reason, "string");
    }
});

// --------------------------------------------------
// Capture attempts
// --------------------------------------------------

test("attemptCapture rejects a missing Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.attemptCapture(null),
        {
            success: false,
            captured: false,
            reason: "Missing Pokemon"
        }
    );
});

test("attemptCapture catches calculation errors", () => {
    const service = createService();
    const pokemon = createPokemon();

    const result = service.attemptCapture(
        pokemon,
        "UNKNOWN_BALL"
    );

    assert.equal(result.success, false);
    assert.equal(result.captured, false);
    assert.equal(result.pokemon, "Bulbasaur");
    assert.equal(result.ball, "UNKNOWN_BALL");
    assert.match(result.reason, /Unknown capture ball/);
});

test("attemptCapture succeeds automatically with a Master Ball", () => {
    const service = createService();

    service.random16 = () => {
        throw new Error("Randomness should not be needed");
    };

    const result = service.attemptCapture(
        createPokemon(),
        "ITEM_MASTER_BALL"
    );

    assert.equal(result.success, true);
    assert.equal(result.captured, true);
    assert.equal(result.pokemon, "Bulbasaur");
    assert.equal(result.ball, "ITEM_MASTER_BALL");
    assert.equal(result.chance, 100);
    assert.equal(result.roll, null);
    assert.equal(result.shakes, 3);
    assert.equal(result.result.guaranteed, true);
});

test("attemptCapture reports three successful shakes when all rolls pass", () => {
    const service = createService();

    service.random16 = () => 0;

    const result = service.attemptCapture(
        createPokemon({
            catchRate: 100,
            hp: 1,
            currentHP: 1,
            maxHP: 100
        }),
        "ITEM_POKE_BALL"
    );

    assert.equal(result.success, true);
    assert.equal(result.captured, true);
    assert.equal(result.shakes, 3);
});

test("attemptCapture stops shaking when a roll fails", () => {
    const service = createService();
    let calls = 0;

    service.random16 = () => {
        calls++;
        return 65535;
    };

    const result = service.attemptCapture(
        createPokemon({
            catchRate: 45,
            hp: 100,
            currentHP: 100,
            maxHP: 100
        }),
        "ITEM_POKE_BALL"
    );

    assert.equal(result.success, true);
    assert.equal(result.captured, false);
    assert.equal(result.shakes, 0);
    assert.equal(calls, 1);
});

test("attemptCapture preserves the Pokémon identifier", () => {
    const service = createService();

    service.random16 = () => 0;

    const result = service.attemptCapture(
        createPokemon({ species: "Pikachu" }),
        "ITEM_POKE_BALL"
    );

    assert.equal(result.pokemon, "Pikachu");
});

test("attemptCapture accepts a ball alias", () => {
    const service = createService();

    service.random16 = () => 0;

    const result = service.attemptCapture(
        createPokemon({
            catchRate: 100,
            hp: 1,
            currentHP: 1,
            maxHP: 100
        }),
        "greatball"
    );

    assert.equal(result.success, true);
    assert.equal(result.ball, "ITEM_GREAT_BALL");
});

test("attemptCapture passes supplied options to the calculation", () => {
    const service = createService();

    service.random16 = () => 0;

    const result = service.attemptCapture(
        createPokemon({
            catchRate: 45,
            maxHP: 100,
            currentHP: 80
        }),
        "ITEM_GREAT_BALL",
        {
            catchRate: 100,
            currentHP: 1,
            maxHP: 100
        }
    );

    assert.equal(result.success, true);
    assert.equal(result.result.catchRate, 100);
    assert.equal(result.result.currentHP, 1);
});

// --------------------------------------------------
// Legacy chance and summaries
// --------------------------------------------------

test("calculateChance returns zero when Pokémon is missing", () => {
    const service = createService();

    assert.equal(service.calculateChance(null), 0);
});

test("calculateChance returns the calculated percentage", () => {
    const service = createService();

    const chance = service.calculateChance(
        createPokemon({
            catchRate: 100,
            currentHP: 50,
            maxHP: 100
        }),
        "ITEM_POKE_BALL"
    );

    const result = service.calculate(
        createOptions({
            catchRate: 100,
            currentHP: 50,
            maxHP: 100,
            ball: "ITEM_POKE_BALL",
            targetTypes: ["Grass"]
        })
    );

    assert.equal(chance, result.capturePercentage);
});

test("calculateChance accepts HP and catch rate overrides", () => {
    const service = createService();

    const chance = service.calculateChance(
        createPokemon({
            catchRate: 45,
            currentHP: 90,
            maxHP: 100
        }),
        "ITEM_POKE_BALL",
        {
            catchRate: 100,
            currentHP: 1,
            maxHP: 100
        }
    );

    const expected = service.calculate(
        createOptions({
            catchRate: 100,
            currentHP: 1,
            maxHP: 100
        })
    );

    assert.equal(chance, expected.capturePercentage);
});

test("createSummary returns the expected fields", () => {
    const service = createService();

    assert.deepEqual(
        service.createSummary(
            createPokemon({ species: "Pikachu" }),
            {
                captured: true,
                ball: "ITEM_GREAT_BALL",
                chance: 75,
                shakes: 3
            }
        ),
        {
            pokemon: "Pikachu",
            captured: true,
            ball: "ITEM_GREAT_BALL",
            chance: 75,
            shakes: 3
        }
    );
});

test("createSummary converts the captured value to a boolean", () => {
    const service = createService();

    const summary = service.createSummary(
        createPokemon(),
        {
            captured: 1,
            ball: "ITEM_POKE_BALL",
            chance: 50,
            shakes: 2
        }
    );

    assert.equal(summary.captured, true);
});

test("createSummary reads chance from the nested result when needed", () => {
    const service = createService();

    const summary = service.createSummary(
        createPokemon(),
        {
            captured: false,
            ball: "ITEM_POKE_BALL",
            result: {
                capturePercentage: 12.5
            }
        }
    );

    assert.equal(summary.chance, 12.5);
});

test("createSummary defaults chance to zero", () => {
    const service = createService();

    const summary = service.createSummary(
        createPokemon(),
        {
            captured: false,
            ball: "ITEM_POKE_BALL"
        }
    );

    assert.equal(summary.chance, 0);
});

test("createSummary defaults shakes to null", () => {
    const service = createService();

    const summary = service.createSummary(
        createPokemon(),
        {
            captured: false,
            ball: "ITEM_POKE_BALL",
            chance: 0
        }
    );

    assert.equal(summary.shakes, null);
});
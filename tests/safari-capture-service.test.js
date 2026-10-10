"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const SafariCaptureService = require(
    "../scripts/services/safari-capture-service"
);

function createReference() {
    return {
        balls: {},
        safari: {
            bait: {
                counter: {
                    minimum: 2,
                    maximum: 6
                }
            },
            rock: {
                counter: {
                    minimum: 2,
                    maximum: 6
                }
            }
        }
    };
}

function createService(reference = createReference()) {
    return new SafariCaptureService(reference);
}

function createPokemon(overrides = {}) {
    return {
        species: "Bulbasaur",
        catchRate: 100,
        safariZoneFleeRate: 100,
        ...overrides
    };
}

function createState(overrides = {}) {
    return {
        pokemon: "Bulbasaur",
        baseCatchFactor: 7,
        baseEscapeFactor: 7,
        safariCatchFactor: 7,
        safariEscapeFactor: 7,
        baitCounter: 0,
        rockCounter: 0,
        activeAction: "NONE",
        turn: 0,
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
    const service = createService(reference);

    assert.strictEqual(service.reference, reference);
    assert.strictEqual(service.safari, reference.safari);
});

test("constructor creates a normal CaptureService dependency", () => {
    const service = createService();

    assert.ok(service.captureService);
    assert.equal(
        typeof service.captureService.calculateModifiedOdds,
        "function"
    );
});

test("constructor rejects missing capture reference data", () => {
    assert.throws(
        () => new SafariCaptureService(),
        {
            name: "TypeError",
            message: "Capture reference data is required."
        }
    );
});

test("constructor rejects a null reference", () => {
    assert.throws(
        () => new SafariCaptureService(null),
        {
            name: "TypeError",
            message: "Capture reference data is required."
        }
    );
});

test("constructor rejects a reference without Safari configuration", () => {
    assert.throws(
        () => new SafariCaptureService({ balls: {} }),
        {
            name: "TypeError",
            message: "Safari capture reference data is required."
        }
    );
});

// --------------------------------------------------
// Initial Safari state
// --------------------------------------------------

test("initializeState rejects a missing Pokémon", () => {
    const service = createService();

    assert.throws(
        () => service.initializeState(null),
        {
            name: "TypeError",
            message: "Pokemon is required."
        }
    );
});

test("initializeState includes the Pokémon species", () => {
    const service = createService();

    const state = service.initializeState(
        createPokemon({ species: "Pikachu" })
    );

    assert.equal(state.pokemon, "Pikachu");
});

test("initializeState falls back to the Pokémon name", () => {
    const service = createService();

    const state = service.initializeState({
        name: "Pikachu",
        catchRate: 100,
        safariZoneFleeRate: 100
    });

    assert.equal(state.pokemon, "Pikachu");
});

test("initializeState falls back to the Pokémon ID", () => {
    const service = createService();

    const state = service.initializeState({
        id: 25,
        catchRate: 100,
        safariZoneFleeRate: 100
    });

    assert.equal(state.pokemon, 25);
});

test("initializeState uses null when no Pokémon identifier exists", () => {
    const service = createService();

    const state = service.initializeState({
        catchRate: 100,
        safariZoneFleeRate: 100
    });

    assert.equal(state.pokemon, null);
});

test("initializeState calculates the initial catch factor", () => {
    const service = createService();

    const state = service.initializeState(
        createPokemon({ catchRate: 127 })
    );

    assert.equal(state.baseCatchFactor, 9);
    assert.equal(state.safariCatchFactor, 9);
});

test("initializeState calculates the initial escape factor", () => {
    const service = createService();

    const state = service.initializeState(
        createPokemon({ safariZoneFleeRate: 127 })
    );

    assert.equal(state.baseEscapeFactor, 9);
    assert.equal(state.safariEscapeFactor, 9);
});

test("initializeState starts with zero action counters", () => {
    const service = createService();

    const state = service.initializeState(createPokemon());

    assert.equal(state.baitCounter, 0);
    assert.equal(state.rockCounter, 0);
});

test("initializeState starts with no active action", () => {
    const service = createService();

    const state = service.initializeState(createPokemon());

    assert.equal(state.activeAction, "NONE");
    assert.equal(state.turn, 0);
});

test("initializeState rejects a negative catch rate", () => {
    const service = createService();

    assert.throws(
        () => service.initializeState(
            createPokemon({ catchRate: -1 })
        ),
        RangeError
    );
});

test("initializeState rejects a negative Safari flee rate", () => {
    const service = createService();

    assert.throws(
        () => service.initializeState(
            createPokemon({ safariZoneFleeRate: -1 })
        ),
        RangeError
    );
});

// --------------------------------------------------
// Initial factors and validation helpers
// --------------------------------------------------

test("calculateInitialCatchFactor applies the expected formula", () => {
    const service = createService();

    assert.equal(service.calculateInitialCatchFactor(127), 9);
});

test("calculateInitialCatchFactor never returns a negative factor", () => {
    const service = createService();

    assert.equal(service.calculateInitialCatchFactor(0), 0);
});

test("calculateInitialEscapeFactor applies the expected formula", () => {
    const service = createService();

    assert.equal(service.calculateInitialEscapeFactor(127), 9);
});

test("calculateInitialEscapeFactor has a minimum of two", () => {
    const service = createService();

    assert.equal(service.calculateInitialEscapeFactor(0), 2);
});

test("validateSafariFactor accepts non-negative numbers", () => {
    const service = createService();

    assert.equal(
        service.validateSafariFactor(12, "factor"),
        12
    );
});

test("validateSafariFactor floors fractional values", () => {
    const service = createService();

    assert.equal(
        service.validateSafariFactor(12.9, "factor"),
        12
    );
});

test("validateSafariFactor rejects negative values", () => {
    const service = createService();

    assert.throws(
        () => service.validateSafariFactor(-1, "factor"),
        RangeError
    );
});

test("validateSafariFactor rejects non-finite values", () => {
    const service = createService();

    assert.throws(
        () => service.validateSafariFactor(Infinity, "factor"),
        RangeError
    );
});

test("validateCatchRate floors fractional values", () => {
    const service = createService();

    assert.equal(service.validateCatchRate(45.9), 45);
});

test("validateCatchRate accepts numeric strings", () => {
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

test("validateSafariFleeRate floors fractional values", () => {
    const service = createService();

    assert.equal(service.validateSafariFleeRate(45.9), 45);
});

test("validateSafariFleeRate rejects negative values", () => {
    const service = createService();

    assert.throws(
        () => service.validateSafariFleeRate(-1),
        RangeError
    );
});

test("validateCounter accepts integers between zero and six", () => {
    const service = createService();

    assert.equal(service.validateCounter(0, "counter"), 0);
    assert.equal(service.validateCounter(3, "counter"), 3);
    assert.equal(service.validateCounter(6, "counter"), 6);
});

test("validateCounter converts an integer string", () => {
    const service = createService();

    assert.equal(service.validateCounter("3", "counter"), 3);
});

test("validateCounter rejects fractional values", () => {
    const service = createService();

    assert.throws(
        () => service.validateCounter(2.5, "counter"),
        RangeError
    );
});

test("validateCounter rejects negative values", () => {
    const service = createService();

    assert.throws(
        () => service.validateCounter(-1, "counter"),
        RangeError
    );
});

test("validateCounter rejects values above six", () => {
    const service = createService();

    assert.throws(
        () => service.validateCounter(7, "counter"),
        RangeError
    );
});

// --------------------------------------------------
// State validation
// --------------------------------------------------

test("validateState accepts a valid Safari state", () => {
    const service = createService();

    assert.doesNotThrow(() => service.validateState(createState()));
});

test("validateState rejects a missing state", () => {
    const service = createService();

    assert.throws(
        () => service.validateState(null),
        {
            name: "TypeError",
            message: "Safari state is required."
        }
    );
});

test("validateState rejects an invalid catch factor", () => {
    const service = createService();

    assert.throws(
        () => service.validateState(
            createState({ safariCatchFactor: -1 })
        ),
        RangeError
    );
});

test("validateState rejects an invalid escape factor", () => {
    const service = createService();

    assert.throws(
        () => service.validateState(
            createState({ safariEscapeFactor: -1 })
        ),
        RangeError
    );
});

test("validateState rejects an invalid Bait counter", () => {
    const service = createService();

    assert.throws(
        () => service.validateState(
            createState({ baitCounter: 7 })
        ),
        RangeError
    );
});

test("validateState rejects an invalid Rock counter", () => {
    const service = createService();

    assert.throws(
        () => service.validateState(
            createState({ rockCounter: -1 })
        ),
        RangeError
    );
});

// --------------------------------------------------
// Safari catch probability
// --------------------------------------------------

test("calculateCatchChance returns a valid result", () => {
    const service = createService();

    const result = service.calculateCatchChance(
        createState(),
        { maxHP: 100, currentHP: 50 }
    );

    assert.equal(result.available, true);
    assert.equal(result.ball, "ITEM_SAFARI_BALL");
    assert.equal(result.safariCatchFactor, 7);
    assert.equal(result.maxHP, 100);
    assert.equal(result.currentHP, 50);
    assert.equal(result.ballMultiplier, 1.5);
    assert.equal(result.guaranteed, false);
    assert.equal(result.shakesRequired, undefined);
});

test("calculateCatchChance defaults HP values to one", () => {
    const service = createService();

    const result = service.calculateCatchChance(createState());

    assert.equal(result.maxHP, 1);
    assert.equal(result.currentHP, 1);
});

test("calculateCatchChance normalizes status conditions", () => {
    const service = createService();

    const result = service.calculateCatchChance(
        createState(),
        {
            maxHP: 100,
            currentHP: 50,
            status: "asleep"
        }
    );

    assert.equal(result.status, "SLEEP");
});

test("calculateCatchChance uses the current Safari catch factor", () => {
    const service = createService();

    const normal = service.calculateCatchChance(
        createState({ safariCatchFactor: 7 }),
        { maxHP: 100, currentHP: 50 }
    );

    const rock = service.calculateCatchChance(
        createState({ safariCatchFactor: 14 }),
        { maxHP: 100, currentHP: 50 }
    );

    assert.ok(rock.modifiedOdds > normal.modifiedOdds);
});

test("calculateCatchChance lowers the catch odds for the Bait factor", () => {
    const service = createService();

    const normal = service.calculateCatchChance(
        createState({ safariCatchFactor: 7 }),
        { maxHP: 100, currentHP: 50 }
    );

    const bait = service.calculateCatchChance(
        createState({ safariCatchFactor: 3 }),
        { maxHP: 100, currentHP: 50 }
    );

    assert.ok(bait.modifiedOdds < normal.modifiedOdds);
});

test("calculateCatchChance returns guaranteed capture for odds above 254", () => {
    const service = createService();

    const result = service.calculateCatchChance(
        createState({ safariCatchFactor: 20 }),
        { maxHP: 1, currentHP: 0 }
    );

    assert.equal(result.guaranteed, true);
    assert.equal(result.captureChance, 1);
    assert.equal(result.capturePercentage, 100);
    assert.equal(result.shakeThreshold, null);
});

test("calculateCatchChance rejects invalid HP", () => {
    const service = createService();

    assert.throws(
        () => service.calculateCatchChance(
            createState(),
            { maxHP: 0, currentHP: 0 }
        ),
        RangeError
    );
});

test("calculateCatchChance rejects a missing Safari state", () => {
    const service = createService();

    assert.throws(
        () => service.calculateCatchChance(null),
        TypeError
    );
});

// --------------------------------------------------
// Safari flee probability
// --------------------------------------------------

test("calculateFleeChance returns a valid flee result", () => {
    const service = createService();

    const result = service.calculateFleeChance(createState());

    assert.equal(result.available, true);
    assert.equal(result.safariEscapeFactor, 7);
    assert.equal(result.activeAction, "NONE");
    assert.equal(result.baitCounter, 0);
    assert.equal(result.rockCounter, 0);
    assert.equal(result.fleeRate, 35);
    assert.equal(result.fleePercentage, 35);
    assert.equal(result.willCheckThisTurn, true);
});

test("calculateFleeChance increases flee rate while Rock is active", () => {
    const service = createService();

    const normal = service.calculateFleeChance(createState());

    const rock = service.calculateFleeChance(
        createState({ rockCounter: 2, activeAction: "ROCK" })
    );

    assert.ok(rock.fleeRate > normal.fleeRate);
    assert.equal(rock.fleeRate, 70);
});

test("calculateFleeChance decreases flee rate while Bait is active", () => {
    const service = createService();

    const normal = service.calculateFleeChance(createState());

    const bait = service.calculateFleeChance(
        createState({ baitCounter: 2, activeAction: "BAIT" })
    );

    assert.ok(bait.fleeRate < normal.fleeRate);
    assert.equal(bait.fleeRate, 5);
});

test("calculateFleeChance gives Rock priority when both counters are active", () => {
    const service = createService();

    const result = service.calculateFleeChance(
        createState({
            baitCounter: 2,
            rockCounter: 2
        })
    );

    assert.equal(result.fleeRate, 70);
    assert.equal(result.activeAction, "ROCK");
});

test("calculateFleeChance caps the rate at 100 percent", () => {
    const service = createService();

    const result = service.calculateFleeChance(
        createState({ safariEscapeFactor: 100 })
    );

    assert.equal(result.fleeRate, 100);
});

test("calculateFleeChance rejects invalid state", () => {
    const service = createService();

    assert.throws(
        () => service.calculateFleeChance(null),
        TypeError
    );
});

// --------------------------------------------------
// Combined calculation
// --------------------------------------------------

test("calculate returns catch and flee results", () => {
    const service = createService();
    const state = createState();

    const result = service.calculate(
        state,
        { maxHP: 100, currentHP: 50 }
    );

    assert.equal(result.available, true);
    assert.strictEqual(result.state, state);
    assert.ok(result.catch);
    assert.ok(result.flee);
    assert.equal(typeof result.catch.capturePercentage, "number");
    assert.equal(typeof result.flee.fleePercentage, "number");
});

test("calculate rejects a missing state", () => {
    const service = createService();

    assert.throws(
        () => service.calculate(null),
        TypeError
    );
});

// --------------------------------------------------
// Bait and Rock factors
// --------------------------------------------------

test("applyBaitCatchFactor halves the catch factor", () => {
    const service = createService();

    assert.equal(service.applyBaitCatchFactor(10), 5);
});

test("applyBaitCatchFactor enforces a minimum of three", () => {
    const service = createService();

    assert.equal(service.applyBaitCatchFactor(4), 3);
    assert.equal(service.applyBaitCatchFactor(0), 3);
});

test("applyBaitCatchFactor rejects a negative factor", () => {
    const service = createService();

    assert.throws(
        () => service.applyBaitCatchFactor(-1),
        RangeError
    );
});

test("applyRockCatchFactor doubles the catch factor", () => {
    const service = createService();

    assert.equal(service.applyRockCatchFactor(7), 14);
});

test("applyRockCatchFactor caps the catch factor at twenty", () => {
    const service = createService();

    assert.equal(service.applyRockCatchFactor(15), 20);
});

test("applyRockCatchFactor accepts zero", () => {
    const service = createService();

    assert.equal(service.applyRockCatchFactor(0), 0);
});

test("applyRockCatchFactor rejects a negative factor", () => {
    const service = createService();

    assert.throws(
        () => service.applyRockCatchFactor(-1),
        RangeError
    );
});

// --------------------------------------------------
// Active action
// --------------------------------------------------

test("getActiveAction returns NONE when no counter is active", () => {
    const service = createService();

    assert.equal(service.getActiveAction(createState()), "NONE");
});

test("getActiveAction returns BAIT when only Bait is active", () => {
    const service = createService();

    assert.equal(
        service.getActiveAction(createState({ baitCounter: 2 })),
        "BAIT"
    );
});

test("getActiveAction returns ROCK when Rock is active", () => {
    const service = createService();

    assert.equal(
        service.getActiveAction(createState({ rockCounter: 2 })),
        "ROCK"
    );
});

test("getActiveAction prioritizes Rock over Bait", () => {
    const service = createService();

    assert.equal(
        service.getActiveAction(
            createState({
                baitCounter: 2,
                rockCounter: 1
            })
        ),
        "ROCK"
    );
});

// --------------------------------------------------
// Comparison state
// --------------------------------------------------

test("createComparisonState returns a fresh state object", () => {
    const service = createService();
    const state = createState();

    const result = service.createComparisonState(state, "NONE");

    assert.notStrictEqual(result, state);
    assert.deepEqual(result, state);
});

test("createComparisonState resets existing counters", () => {
    const service = createService();

    const result = service.createComparisonState(
        createState({
            baitCounter: 4,
            rockCounter: 3,
            activeAction: "ROCK"
        }),
        "NONE"
    );

    assert.equal(result.baitCounter, 0);
    assert.equal(result.rockCounter, 0);
    assert.equal(result.activeAction, "NONE");
});

test("createComparisonState calculates the Bait scenario", () => {
    const service = createService();

    const result = service.createComparisonState(
        createState({ safariCatchFactor: 10 }),
        "BAIT"
    );

    assert.equal(result.baitCounter, 1);
    assert.equal(result.rockCounter, 0);
    assert.equal(result.safariCatchFactor, 5);
    assert.equal(result.activeAction, "BAIT");
});

test("createComparisonState calculates the Rock scenario", () => {
    const service = createService();

    const result = service.createComparisonState(
        createState({ safariCatchFactor: 10 }),
        "ROCK"
    );

    assert.equal(result.baitCounter, 0);
    assert.equal(result.rockCounter, 1);
    assert.equal(result.safariCatchFactor, 20);
    assert.equal(result.activeAction, "ROCK");
});

test("createComparisonState does not mutate the original state", () => {
    const service = createService();
    const state = createState();
    const original = { ...state };

    service.createComparisonState(state, "BAIT");

    assert.deepEqual(state, original);
});

// --------------------------------------------------
// Apply Safari actions
// --------------------------------------------------

test("applyAction normalizes the action name", () => {
    const service = createService();

    const result = withMockedRandom([0], () =>
        service.applyAction(createState(), " bait ")
    );

    assert.equal(result.activeAction, "BAIT");
    assert.equal(result.baitCounter, 2);
});

test("applyAction creates a Bait duration between two and six", () => {
    const service = createService();

    for (const randomValue of [0, 0.4, 0.9999]) {
        const result = withMockedRandom([randomValue], () =>
            service.applyAction(createState(), "BAIT")
        );

        assert.ok(result.baitCounter >= 2);
        assert.ok(result.baitCounter <= 6);
    }
});

test("applyAction creates a Rock duration between two and six", () => {
    const service = createService();

    const result = withMockedRandom([0.9999], () =>
        service.applyAction(createState(), "ROCK")
    );

    assert.equal(result.rockCounter, 6);
    assert.equal(result.activeAction, "ROCK");
});

test("applyAction resets the opposing action counter for Bait", () => {
    const service = createService();

    const result = withMockedRandom([0], () =>
        service.applyAction(
            createState({ rockCounter: 3 }),
            "BAIT"
        )
    );

    assert.equal(result.rockCounter, 0);
});

test("applyAction resets the opposing action counter for Rock", () => {
    const service = createService();

    const result = withMockedRandom([0], () =>
        service.applyAction(
            createState({ baitCounter: 3 }),
            "ROCK"
        )
    );

    assert.equal(result.baitCounter, 0);
});

test("applyAction applies the Bait catch factor", () => {
    const service = createService();

    const result = withMockedRandom([0], () =>
        service.applyAction(
            createState({ safariCatchFactor: 10 }),
            "BAIT"
        )
    );

    assert.equal(result.safariCatchFactor, 5);
});

test("applyAction applies the Rock catch factor", () => {
    const service = createService();

    const result = withMockedRandom([0], () =>
        service.applyAction(
            createState({ safariCatchFactor: 10 }),
            "ROCK"
        )
    );

    assert.equal(result.safariCatchFactor, 20);
});

test("applyAction does not mutate the original state", () => {
    const service = createService();
    const state = createState();
    const original = { ...state };

    withMockedRandom([0], () => service.applyAction(state, "BAIT"));

    assert.deepEqual(state, original);
});

test("applyAction rejects unknown actions", () => {
    const service = createService();

    assert.throws(
        () => service.applyAction(createState(), "THROW"),
        /Unknown Safari action/
    );
});

test("applyAction rejects invalid state", () => {
    const service = createService();

    assert.throws(
        () => service.applyAction(null, "BAIT"),
        TypeError
    );
});

test("randomActionDuration can produce the minimum duration", () => {
    const service = createService();

    assert.equal(
        withMockedRandom([0], () => service.randomActionDuration()),
        2
    );
});

test("randomActionDuration can produce the maximum duration", () => {
    const service = createService();

    assert.equal(
        withMockedRandom([0.9999], () => service.randomActionDuration()),
        6
    );
});

// --------------------------------------------------
// Advance turns
// --------------------------------------------------

test("advanceTurn increments the turn counter", () => {
    const service = createService();

    const result = service.advanceTurn(createState({ turn: 4 }));

    assert.equal(result.turn, 5);
});

test("advanceTurn decrements the Bait counter", () => {
    const service = createService();

    const result = service.advanceTurn(
        createState({ baitCounter: 3 })
    );

    assert.equal(result.baitCounter, 2);
});

test("advanceTurn decrements the Rock counter", () => {
    const service = createService();

    const result = service.advanceTurn(
        createState({ rockCounter: 3 })
    );

    assert.equal(result.rockCounter, 2);
});

test("advanceTurn does not allow counters to become negative", () => {
    const service = createService();

    const result = service.advanceTurn(
        createState({ baitCounter: 0, rockCounter: 0 })
    );

    assert.equal(result.baitCounter, 0);
    assert.equal(result.rockCounter, 0);
});

test("advanceTurn keeps Bait active while its counter remains positive", () => {
    const service = createService();

    const result = service.advanceTurn(
        createState({
            baitCounter: 2,
            activeAction: "BAIT"
        })
    );

    assert.equal(result.baitCounter, 1);
    assert.equal(result.activeAction, "BAIT");
});

test("advanceTurn expires Bait when its counter reaches zero", () => {
    const service = createService();

    const result = service.advanceTurn(
        createState({
            baitCounter: 1,
            activeAction: "BAIT"
        })
    );

    assert.equal(result.baitCounter, 0);
    assert.equal(result.activeAction, "NONE");
});

test("advanceTurn keeps the Bait-adjusted catch factor after expiration", () => {
    const service = createService();

    const result = service.advanceTurn(
        createState({
            baseCatchFactor: 10,
            safariCatchFactor: 5,
            baitCounter: 1,
            activeAction: "BAIT"
        })
    );

    assert.equal(result.safariCatchFactor, 5);
});

test("advanceTurn resets the catch factor when Rock expires", () => {
    const service = createService();

    const result = service.advanceTurn(
        createState({
            baseCatchFactor: 7,
            safariCatchFactor: 14,
            rockCounter: 1,
            activeAction: "ROCK"
        })
    );

    assert.equal(result.rockCounter, 0);
    assert.equal(result.safariCatchFactor, 7);
    assert.equal(result.activeAction, "NONE");
});

test("advanceTurn gives Rock priority when Bait remains active", () => {
    const service = createService();

    const result = service.advanceTurn(
        createState({
            baitCounter: 3,
            rockCounter: 1,
            activeAction: "ROCK"
        })
    );

    assert.equal(result.baitCounter, 2);
    assert.equal(result.rockCounter, 0);
    assert.equal(result.activeAction, "BAIT");
});

test("advanceTurn does not mutate the original state", () => {
    const service = createService();
    const state = createState({ baitCounter: 2 });
    const original = { ...state };

    service.advanceTurn(state);

    assert.deepEqual(state, original);
});

test("advanceTurn rejects invalid state", () => {
    const service = createService();

    assert.throws(
        () => service.advanceTurn(null),
        TypeError
    );
});

// --------------------------------------------------
// Compare actions and action summaries
// --------------------------------------------------

test("compareActions returns Normal, Bait, and Rock results", () => {
    const service = createService();

    const result = service.compareActions(
        createState(),
        { maxHP: 100, currentHP: 50 }
    );

    assert.ok(result.normal);
    assert.ok(result.bait);
    assert.ok(result.rock);

    assert.equal(result.normal.state.activeAction, "NONE");
    assert.equal(result.bait.state.activeAction, "BAIT");
    assert.equal(result.rock.state.activeAction, "ROCK");
});

test("compareActions does not mutate the supplied state", () => {
    const service = createService();
    const state = createState();
    const original = { ...state };

    service.compareActions(state, {
        maxHP: 100,
        currentHP: 50
    });

    assert.deepEqual(state, original);
});

test("getActionSummary provides the three action summaries", () => {
    const service = createService();

    const result = service.getActionSummary(
        createState(),
        { maxHP: 100, currentHP: 50 }
    );

    assert.equal(result.normal.action, "NONE");
    assert.equal(result.bait.action, "BAIT");
    assert.equal(result.rock.action, "ROCK");
});

test("getActionSummary includes catch and flee percentages", () => {
    const service = createService();

    const result = service.getActionSummary(
        createState(),
        { maxHP: 100, currentHP: 50 }
    );

    for (const action of [
        result.normal,
        result.bait,
        result.rock
    ]) {
        assert.equal(typeof action.catchPercentage, "number");
        assert.equal(typeof action.fleePercentage, "number");
        assert.equal(typeof action.catchFactor, "number");
        assert.equal(typeof action.escapeFactor, "number");
    }
});

test("getActionSummary includes configured action duration ranges", () => {
    const service = createService();

    const result = service.getActionSummary(
        createState(),
        { maxHP: 100, currentHP: 50 }
    );

    assert.deepEqual(result.bait.duration, {
        minimum: 2,
        maximum: 6
    });

    assert.deepEqual(result.rock.duration, {
        minimum: 2,
        maximum: 6
    });
});

test("compareActions rejects a missing state", () => {
    const service = createService();

    assert.throws(
        () => service.compareActions(null),
        TypeError
    );
});

test("getActionSummary rejects a missing state", () => {
    const service = createService();

    assert.throws(
        () => service.getActionSummary(null),
        TypeError
    );
});

// --------------------------------------------------
// Projection entries and projected turns
// --------------------------------------------------

test("createProjectionEntry includes state and probability fields", () => {
    const service = createService();
    const state = createState();

    const result = service.createProjectionEntry(
        state,
        { maxHP: 100, currentHP: 50 }
    );

    assert.equal(result.turn, state.turn);
    assert.equal(result.activeAction, "NONE");
    assert.equal(result.baitCounter, 0);
    assert.equal(result.rockCounter, 0);
    assert.equal(result.safariCatchFactor, 7);
    assert.equal(result.safariEscapeFactor, 7);
    assert.equal(typeof result.catchPercentage, "number");
    assert.equal(typeof result.fleePercentage, "number");
});

test("projectTurns includes the current state and requested future turns", () => {
    const service = createService();

    const result = service.projectTurns(
        createState(),
        {
            turns: 3,
            maxHP: 100,
            currentHP: 50
        }
    );

    assert.equal(result.length, 4);
    assert.deepEqual(
        result.map(entry => entry.turn),
        [0, 1, 2, 3]
    );
});

test("projectTurns returns one entry when zero turns are requested", () => {
    const service = createService();

    const result = service.projectTurns(
        createState(),
        {
            turns: 0,
            maxHP: 100,
            currentHP: 50
        }
    );

    assert.equal(result.length, 1);
    assert.equal(result[0].turn, 0);
});

test("projectTurns shows counters expiring over time", () => {
    const service = createService();

    const result = service.projectTurns(
        createState({
            baitCounter: 2,
            activeAction: "BAIT"
        }),
        {
            turns: 2,
            maxHP: 100,
            currentHP: 50
        }
    );

    assert.deepEqual(
        result.map(entry => entry.baitCounter),
        [2, 1, 0]
    );

    assert.deepEqual(
        result.map(entry => entry.activeAction),
        ["BAIT", "BAIT", "NONE"]
    );
});

test("projectTurns projects Rock expiration and catch-factor reset", () => {
    const service = createService();

    const result = service.projectTurns(
        createState({
            baseCatchFactor: 7,
            safariCatchFactor: 14,
            rockCounter: 1,
            activeAction: "ROCK"
        }),
        {
            turns: 1,
            maxHP: 100,
            currentHP: 50
        }
    );

    assert.equal(result[0].safariCatchFactor, 14);
    assert.equal(result[1].safariCatchFactor, 7);
    assert.equal(result[1].activeAction, "NONE");
});

test("projectTurns does not mutate the input state", () => {
    const service = createService();
    const state = createState({ baitCounter: 3 });
    const original = { ...state };

    service.projectTurns(
        state,
        {
            turns: 3,
            maxHP: 100,
            currentHP: 50
        }
    );

    assert.deepEqual(state, original);
});

test("projectTurns rejects negative turn counts", () => {
    const service = createService();

    assert.throws(
        () => service.projectTurns(createState(), { turns: -1 }),
        RangeError
    );
});

test("projectTurns rejects fractional turn counts", () => {
    const service = createService();

    assert.throws(
        () => service.projectTurns(createState(), { turns: 1.5 }),
        RangeError
    );
});

test("projectTurns rejects non-numeric turn counts", () => {
    const service = createService();

    assert.throws(
        () => service.projectTurns(createState(), { turns: "invalid" }),
        RangeError
    );
});

test("projectTurns rejects a missing state", () => {
    const service = createService();

    assert.throws(
        () => service.projectTurns(null, { turns: 1 }),
        TypeError
    );
});
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const SafariZoneService = require("../scripts/services/safari-zone-service");

function createService(options = {}) {
    return new SafariZoneService(options);
}

function createSession(overrides = {}) {
    return {
        active: true,
        stepsRemaining: 600,
        stepsUsed: 0,
        safariBallsRemaining: 30,
        safariBallsUsed: 0,
        ...overrides
    };
}

function createTrainerState(money = 1000) {
    const calls = {
        getMoney: 0,
        removeMoney: [],
    };

    const trainerState = {
        getMoney() {
            calls.getMoney++;
            return money;
        },
        removeMoney(amount) {
            calls.removeMoney.push(amount);
        }
    };

    return { trainerState, calls };
}

// --------------------------------------------------
// Constructor and configuration
// --------------------------------------------------

test("constructor creates a SafariZoneService instance", () => {
    assert.ok(createService() instanceof SafariZoneService);
});

test("constructor uses the default entry fee", () => {
    assert.equal(createService().entryFee, 500);
});

test("constructor uses the default maximum steps", () => {
    assert.equal(createService().maximumSteps, 600);
});

test("constructor uses the default starting Safari Balls", () => {
    assert.equal(createService().startingSafariBalls, 30);
});

test("constructor accepts custom configuration", () => {
    const service = createService({
        entryFee: 700,
        maximumSteps: 800,
        startingSafariBalls: 25
    });

    assert.equal(service.entryFee, 700);
    assert.equal(service.maximumSteps, 800);
    assert.equal(service.startingSafariBalls, 25);
});

test("constructor preserves zero configuration values", () => {
    const service = createService({
        entryFee: 0,
        maximumSteps: 0,
        startingSafariBalls: 0
    });

    assert.equal(service.entryFee, 0);
    assert.equal(service.maximumSteps, 0);
    assert.equal(service.startingSafariBalls, 0);
});

test("constructor preserves custom negative configuration values", () => {
    const service = createService({
        entryFee: -1,
        maximumSteps: -2,
        startingSafariBalls: -3
    });

    assert.equal(service.entryFee, -1);
    assert.equal(service.maximumSteps, -2);
    assert.equal(service.startingSafariBalls, -3);
});

test("constructor uses defaults for null configuration values", () => {
    const service = createService({
        entryFee: null,
        maximumSteps: null,
        startingSafariBalls: null
    });

    assert.equal(service.entryFee, 500);
    assert.equal(service.maximumSteps, 600);
    assert.equal(service.startingSafariBalls, 30);
});

test("constructor preserves explicitly supplied false configuration values", () => {
    const service = createService({
        entryFee: false,
        maximumSteps: false,
        startingSafariBalls: false
    });

    assert.equal(service.entryFee, false);
    assert.equal(service.maximumSteps, false);
    assert.equal(service.startingSafariBalls, false);
});

test("getConfiguration returns all configured values", () => {
    const service = createService({
        entryFee: 750,
        maximumSteps: 900,
        startingSafariBalls: 20
    });

    assert.deepEqual(service.getConfiguration(), {
        entryFee: 750,
        maximumSteps: 900,
        startingSafariBalls: 20
    });
});

test("getConfiguration returns a new object each time", () => {
    const service = createService();

    assert.notStrictEqual(
        service.getConfiguration(),
        service.getConfiguration()
    );
});

test("mutating the configuration result does not change service settings", () => {
    const service = createService();
    const configuration = service.getConfiguration();

    configuration.entryFee = 0;
    configuration.maximumSteps = 1;
    configuration.startingSafariBalls = 2;

    assert.equal(service.entryFee, 500);
    assert.equal(service.maximumSteps, 600);
    assert.equal(service.startingSafariBalls, 30);
});

// --------------------------------------------------
// Trainer money
// --------------------------------------------------

test("getTrainerMoney reads money through getMoney", () => {
    const { trainerState } = createTrainerState(800);

    assert.equal(createService().getTrainerMoney(trainerState), 800);
});

test("getTrainerMoney calls getMoney once", () => {
    const { trainerState, calls } = createTrainerState(800);

    createService().getTrainerMoney(trainerState);

    assert.equal(calls.getMoney, 1);
});

test("getTrainerMoney converts a numeric string returned by getMoney", () => {
    const trainerState = {
        getMoney: () => "750"
    };

    assert.equal(createService().getTrainerMoney(trainerState), 750);
});

test("getTrainerMoney converts null returned by getMoney to zero", () => {
    const trainerState = {
        getMoney: () => null
    };

    assert.equal(createService().getTrainerMoney(trainerState), 0);
});

test("getTrainerMoney returns NaN for a non-numeric getMoney result", () => {
    const trainerState = {
        getMoney: () => "not money"
    };

    assert.ok(Number.isNaN(createService().getTrainerMoney(trainerState)));
});

test("getTrainerMoney prefers getMoney over the money property", () => {
    const trainerState = {
        getMoney: () => 250,
        money: 1000
    };

    assert.equal(createService().getTrainerMoney(trainerState), 250);
});

test("getTrainerMoney falls back to a finite money property", () => {
    assert.equal(
        createService().getTrainerMoney({ money: 450 }),
        450
    );
});

test("getTrainerMoney accepts a zero money property", () => {
    assert.equal(
        createService().getTrainerMoney({ money: 0 }),
        0
    );
});

test("getTrainerMoney rejects a string money property without getMoney", () => {
    assert.throws(
        () => createService().getTrainerMoney({ money: "500" }),
        {
            name: "TypeError",
            message: "Trainer state does not provide money."
        }
    );
});

test("getTrainerMoney rejects a non-finite money property", () => {
    for (const money of [NaN, Infinity, -Infinity]) {
        assert.throws(
            () => createService().getTrainerMoney({ money }),
            TypeError
        );
    }
});

test("getTrainerMoney rejects a missing trainer state", () => {
    assert.throws(
        () => createService().getTrainerMoney(null),
        {
            name: "TypeError",
            message: "Trainer state is required."
        }
    );
});

test("getTrainerMoney rejects undefined trainer state", () => {
    assert.throws(
        () => createService().getTrainerMoney(undefined),
        TypeError
    );
});

test("getTrainerMoney rejects a trainer without money support", () => {
    assert.throws(
        () => createService().getTrainerMoney({}),
        {
            name: "TypeError",
            message: "Trainer state does not provide money."
        }
    );
});

test("getTrainerMoney propagates errors from getMoney", () => {
    const trainerState = {
        getMoney() {
            throw new Error("Money lookup failed");
        },
        money: 1000
    };

    assert.throws(
        () => createService().getTrainerMoney(trainerState),
        /Money lookup failed/
    );
});

// --------------------------------------------------
// canEnter
// --------------------------------------------------

test("canEnter allows entry when money exceeds the entry fee", () => {
    const { trainerState } = createTrainerState(800);

    assert.deepEqual(createService().canEnter(trainerState), {
        allowed: true,
        money: 800,
        entryFee: 500,
        shortfall: 0
    });
});

test("canEnter allows entry with exactly the required money", () => {
    const { trainerState } = createTrainerState(500);

    assert.deepEqual(createService().canEnter(trainerState), {
        allowed: true,
        money: 500,
        entryFee: 500,
        shortfall: 0
    });
});

test("canEnter rejects entry with insufficient money", () => {
    const { trainerState } = createTrainerState(300);

    assert.deepEqual(createService().canEnter(trainerState), {
        allowed: false,
        money: 300,
        entryFee: 500,
        shortfall: 200
    });
});

test("canEnter reports the full shortfall when the trainer has no money", () => {
    const { trainerState } = createTrainerState(0);

    assert.deepEqual(createService().canEnter(trainerState), {
        allowed: false,
        money: 0,
        entryFee: 500,
        shortfall: 500
    });
});

test("canEnter calculates shortfall using a custom entry fee", () => {
    const service = createService({ entryFee: 900 });
    const { trainerState } = createTrainerState(650);

    assert.deepEqual(service.canEnter(trainerState), {
        allowed: false,
        money: 650,
        entryFee: 900,
        shortfall: 250
    });
});

test("canEnter handles a zero entry fee", () => {
    const service = createService({ entryFee: 0 });
    const { trainerState } = createTrainerState(0);

    assert.deepEqual(service.canEnter(trainerState), {
        allowed: true,
        money: 0,
        entryFee: 0,
        shortfall: 0
    });
});

test("canEnter returns zero shortfall when the trainer has excess money", () => {
    const { trainerState } = createTrainerState(5000);

    assert.equal(
        createService().canEnter(trainerState).shortfall,
        0
    );
});

test("canEnter rejects a trainer without money information", () => {
    assert.throws(
        () => createService().canEnter({}),
        TypeError
    );
});

// --------------------------------------------------
// removeMoney
// --------------------------------------------------

test("removeMoney prefers the trainer state's removeMoney method", () => {
    const calls = [];
    const trainerState = {
        money: 1000,
        removeMoney(amount) {
            calls.push(amount);
        }
    };

    createService().removeMoney(trainerState, 500);

    assert.deepEqual(calls, [500]);
    assert.equal(trainerState.money, 1000);
});

test("removeMoney subtracts money from a finite money property", () => {
    const trainerState = { money: 1000 };

    createService().removeMoney(trainerState, 500);

    assert.equal(trainerState.money, 500);
});

test("removeMoney supports spending the exact available amount", () => {
    const trainerState = { money: 500 };

    createService().removeMoney(trainerState, 500);

    assert.equal(trainerState.money, 0);
});

test("removeMoney throws when the fallback balance is insufficient", () => {
    const trainerState = { money: 300 };

    assert.throws(
        () => createService().removeMoney(trainerState, 500),
        {
            name: "Error",
            message: "Not enough money."
        }
    );

    assert.equal(trainerState.money, 300);
});

test("removeMoney rejects a missing trainer state", () => {
    assert.throws(
        () => createService().removeMoney(null, 100),
        {
            name: "TypeError",
            message: "Trainer state is required."
        }
    );
});

test("removeMoney rejects a trainer without money management", () => {
    assert.throws(
        () => createService().removeMoney({}, 100),
        {
            name: "TypeError",
            message: "Trainer state does not provide money management."
        }
    );
});

test("removeMoney rejects a non-finite fallback balance", () => {
    for (const money of [NaN, Infinity, "500"]) {
        assert.throws(
            () => createService().removeMoney({ money }, 100),
            TypeError
        );
    }
});

test("removeMoney propagates errors from the removeMoney method", () => {
    const trainerState = {
        removeMoney() {
            throw new Error("Payment failed");
        },
        money: 1000
    };

    assert.throws(
        () => createService().removeMoney(trainerState, 500),
        /Payment failed/
    );
});

// --------------------------------------------------
// enter
// --------------------------------------------------

test("enter succeeds when the trainer can afford the entry fee", () => {
    const { trainerState } = createTrainerState(1000);

    const result = createService().enter(trainerState);

    assert.equal(result.success, true);
    assert.deepEqual(result.session, {
        active: true,
        stepsRemaining: 600,
        stepsUsed: 0,
        safariBallsRemaining: 30,
        safariBallsUsed: 0
    });
});

test("enter deducts the configured entry fee", () => {
    const service = createService({ entryFee: 250 });
    const { trainerState, calls } = createTrainerState(1000);

    service.enter(trainerState);

    assert.deepEqual(calls.removeMoney, [250]);
});

test("enter allows exactly enough money", () => {
    const { trainerState, calls } = createTrainerState(500);

    const result = createService().enter(trainerState);

    assert.equal(result.success, true);
    assert.deepEqual(calls.removeMoney, [500]);
});

test("enter rejects insufficient money without deducting money", () => {
    const { trainerState, calls } = createTrainerState(100);

    assert.deepEqual(createService().enter(trainerState), {
        success: false,
        reason: "NOT_ENOUGH_MONEY",
        money: 100,
        entryFee: 500,
        shortfall: 400
    });

    assert.deepEqual(calls.removeMoney, []);
});

test("enter returns the full shortfall when the trainer has no money", () => {
    const { trainerState } = createTrainerState(0);

    const result = createService().enter(trainerState);

    assert.equal(result.success, false);
    assert.equal(result.shortfall, 500);
});

test("enter initializes session resources from configuration", () => {
    const service = createService({
        entryFee: 100,
        maximumSteps: 300,
        startingSafariBalls: 15
    });
    const { trainerState } = createTrainerState(100);

    assert.deepEqual(service.enter(trainerState), {
        success: true,
        session: {
            active: true,
            stepsRemaining: 300,
            stepsUsed: 0,
            safariBallsRemaining: 15,
            safariBallsUsed: 0
        }
    });
});

test("enter succeeds when the configured fee is zero", () => {
    const service = createService({ entryFee: 0 });
    const { trainerState, calls } = createTrainerState(0);

    const result = service.enter(trainerState);

    assert.equal(result.success, true);
    assert.deepEqual(calls.removeMoney, [0]);
});

test("enter propagates money deduction errors", () => {
    const trainerState = {
        getMoney: () => 1000,
        removeMoney() {
            throw new Error("Cannot deduct entry fee");
        }
    };

    assert.throws(
        () => createService().enter(trainerState),
        /Cannot deduct entry fee/
    );
});

// --------------------------------------------------
// isActive and createSession
// --------------------------------------------------

test("isActive returns true for an active session", () => {
    assert.equal(createService().isActive(createSession()), true);
});

test("isActive returns false for an inactive session", () => {
    assert.equal(
        createService().isActive(createSession({ active: false })),
        false
    );
});

test("isActive returns false for missing session", () => {
    assert.equal(createService().isActive(null), false);
});

test("isActive requires active to be exactly true", () => {
    assert.equal(
        createService().isActive(createSession({ active: 1 })),
        false
    );

    assert.equal(
        createService().isActive(createSession({ active: "true" })),
        false
    );
});

test("createSession creates an inactive session with zero resources", () => {
    assert.deepEqual(createService().createSession(), {
        active: false,
        stepsRemaining: 0,
        stepsUsed: 0,
        safariBallsRemaining: 0,
        safariBallsUsed: 0
    });
});

test("createSession returns a new object on each call", () => {
    const service = createService();

    assert.notStrictEqual(service.createSession(), service.createSession());
});

// --------------------------------------------------
// Session validation
// --------------------------------------------------

test("validateSession accepts a valid session", () => {
    assert.doesNotThrow(
        () => createService().validateSession(createSession())
    );
});

test("validateSession rejects a missing session", () => {
    assert.throws(
        () => createService().validateSession(null),
        {
            name: "TypeError",
            message: "Safari session is required."
        }
    );
});

test("validateSession rejects undefined", () => {
    assert.throws(
        () => createService().validateSession(undefined),
        TypeError
    );
});

test("validateSession rejects a non-object session", () => {
    for (const session of [false, 0, "", "session"]) {
        assert.throws(
            () => createService().validateSession(session),
            TypeError
        );
    }
});

test("validateSession rejects a session missing stepsRemaining", () => {
    assert.throws(
        () => createService().validateSession({
            active: true,
            stepsUsed: 0,
            safariBallsRemaining: 30,
            safariBallsUsed: 0
        }),
        {
            name: "RangeError",
            message: "stepsRemaining must be a non-negative integer."
        }
    );
});

test("validateSession rejects negative stepsRemaining", () => {
    assert.throws(
        () => createService().validateSession(
            createSession({ stepsRemaining: -1 })
        ),
        /stepsRemaining must be a non-negative integer/
    );
});

test("validateSession rejects fractional stepsRemaining", () => {
    assert.throws(
        () => createService().validateSession(
            createSession({ stepsRemaining: 1.5 })
        ),
        /stepsRemaining must be a non-negative integer/
    );
});

test("validateSession rejects string stepsRemaining", () => {
    assert.throws(
        () => createService().validateSession(
            createSession({ stepsRemaining: "10" })
        ),
        /stepsRemaining must be a non-negative integer/
    );
});

test("validateSession rejects negative stepsUsed", () => {
    assert.throws(
        () => createService().validateSession(
            createSession({ stepsUsed: -1 })
        ),
        /stepsUsed must be a non-negative integer/
    );
});

test("validateSession rejects fractional stepsUsed", () => {
    assert.throws(
        () => createService().validateSession(
            createSession({ stepsUsed: 1.5 })
        ),
        /stepsUsed must be a non-negative integer/
    );
});

test("validateSession rejects negative safariBallsRemaining", () => {
    assert.throws(
        () => createService().validateSession(
            createSession({ safariBallsRemaining: -1 })
        ),
        /safariBallsRemaining must be a non-negative integer/
    );
});

test("validateSession rejects fractional safariBallsRemaining", () => {
    assert.throws(
        () => createService().validateSession(
            createSession({ safariBallsRemaining: 2.5 })
        ),
        /safariBallsRemaining must be a non-negative integer/
    );
});

test("validateSession rejects negative safariBallsUsed", () => {
    assert.throws(
        () => createService().validateSession(
            createSession({ safariBallsUsed: -1 })
        ),
        /safariBallsUsed must be a non-negative integer/
    );
});

test("validateSession rejects fractional safariBallsUsed", () => {
    assert.throws(
        () => createService().validateSession(
            createSession({ safariBallsUsed: 1.5 })
        ),
        /safariBallsUsed must be a non-negative integer/
    );
});

test("validateSession rejects a non-boolean active property", () => {
    for (const active of [undefined, null, 0, 1, "true"]) {
        assert.throws(
            () => createService().validateSession(
                createSession({ active })
            ),
            {
                name: "TypeError",
                message: "Safari session active state must be a boolean."
            }
        );
    }
});

// --------------------------------------------------
// getSessionSummary
// --------------------------------------------------

test("getSessionSummary returns all session fields and percentages", () => {
    const service = createService();
    const result = service.getSessionSummary(createSession({
        stepsRemaining: 300,
        stepsUsed: 300,
        safariBallsRemaining: 15,
        safariBallsUsed: 15
    }));

    assert.deepEqual(result, {
        active: true,
        stepsRemaining: 300,
        stepsUsed: 300,
        safariBallsRemaining: 15,
        safariBallsUsed: 15,
        stepsPercentageRemaining: 50,
        ballsPercentageRemaining: 50
    });
});

test("getSessionSummary reports 100 percent when no resources are used", () => {
    const result = createService().getSessionSummary(createSession());

    assert.equal(result.stepsPercentageRemaining, 100);
    assert.equal(result.ballsPercentageRemaining, 100);
});

test("getSessionSummary reports zero percent when all steps are used", () => {
    const result = createService().getSessionSummary(
        createSession({ stepsRemaining: 0, stepsUsed: 600 })
    );

    assert.equal(result.stepsPercentageRemaining, 0);
});

test("getSessionSummary reports zero percent when all Safari Balls are used", () => {
    const result = createService().getSessionSummary(
        createSession({ safariBallsRemaining: 0, safariBallsUsed: 30 })
    );

    assert.equal(result.ballsPercentageRemaining, 0);
});

test("getSessionSummary uses configured resource maximums", () => {
    const service = createService({
        maximumSteps: 200,
        startingSafariBalls: 10
    });

    const result = service.getSessionSummary(createSession({
        stepsRemaining: 50,
        stepsUsed: 150,
        safariBallsRemaining: 2,
        safariBallsUsed: 8
    }));

    assert.equal(result.stepsPercentageRemaining, 25);
    assert.equal(result.ballsPercentageRemaining, 20);
});

test("getSessionSummary does not mutate the input session", () => {
    const service = createService();
    const session = createSession();
    const original = { ...session };

    service.getSessionSummary(session);

    assert.deepEqual(session, original);
});

test("getSessionSummary rejects an invalid session", () => {
    assert.throws(
        () => createService().getSessionSummary(null),
        TypeError
    );
});

// --------------------------------------------------
// validatePositiveInteger
// --------------------------------------------------

test("validatePositiveInteger accepts a positive integer", () => {
    assert.doesNotThrow(
        () => createService().validatePositiveInteger(1, "steps")
    );
});

test("validatePositiveInteger accepts a large positive integer", () => {
    assert.doesNotThrow(
        () => createService().validatePositiveInteger(100000, "steps")
    );
});

test("validatePositiveInteger rejects zero", () => {
    assert.throws(
        () => createService().validatePositiveInteger(0, "steps"),
        {
            name: "RangeError",
            message: "steps must be a positive integer."
        }
    );
});

test("validatePositiveInteger rejects negative integers", () => {
    assert.throws(
        () => createService().validatePositiveInteger(-1, "steps"),
        RangeError
    );
});

test("validatePositiveInteger rejects fractional values", () => {
    assert.throws(
        () => createService().validatePositiveInteger(1.5, "steps"),
        RangeError
    );
});

test("validatePositiveInteger rejects numeric strings", () => {
    assert.throws(
        () => createService().validatePositiveInteger("2", "steps"),
        RangeError
    );
});

test("validatePositiveInteger rejects NaN", () => {
    assert.throws(
        () => createService().validatePositiveInteger(NaN, "steps"),
        RangeError
    );
});

test("validatePositiveInteger rejects Infinity", () => {
    assert.throws(
        () => createService().validatePositiveInteger(Infinity, "steps"),
        RangeError
    );
});

// --------------------------------------------------
// validateNonNegativeInteger
// --------------------------------------------------

test("validateNonNegativeInteger accepts zero", () => {
    assert.doesNotThrow(
        () => createService().validateNonNegativeInteger(0, "steps")
    );
});

test("validateNonNegativeInteger accepts positive integers", () => {
    assert.doesNotThrow(
        () => createService().validateNonNegativeInteger(100, "steps")
    );
});

test("validateNonNegativeInteger rejects negative values", () => {
    assert.throws(
        () => createService().validateNonNegativeInteger(-1, "steps"),
        {
            name: "RangeError",
            message: "steps must be a non-negative integer."
        }
    );
});

test("validateNonNegativeInteger rejects fractional values", () => {
    assert.throws(
        () => createService().validateNonNegativeInteger(0.5, "steps"),
        RangeError
    );
});

test("validateNonNegativeInteger rejects numeric strings", () => {
    assert.throws(
        () => createService().validateNonNegativeInteger("0", "steps"),
        RangeError
    );
});

test("validateNonNegativeInteger rejects NaN", () => {
    assert.throws(
        () => createService().validateNonNegativeInteger(NaN, "steps"),
        RangeError
    );
});

test("validateNonNegativeInteger rejects Infinity", () => {
    assert.throws(
        () => createService().validateNonNegativeInteger(Infinity, "steps"),
        RangeError
    );
});

// --------------------------------------------------
// consumeSteps
// --------------------------------------------------

test("consumeSteps consumes one step by default", () => {
    const result = createService().consumeSteps(createSession());

    assert.equal(result.success, true);
    assert.equal(result.exhausted, false);
    assert.equal(result.stepsConsumed, 1);
    assert.equal(result.session.stepsRemaining, 599);
    assert.equal(result.session.stepsUsed, 1);
});

test("consumeSteps consumes a requested number of steps", () => {
    const result = createService().consumeSteps(createSession(), 25);

    assert.equal(result.stepsConsumed, 25);
    assert.equal(result.session.stepsRemaining, 575);
    assert.equal(result.session.stepsUsed, 25);
});

test("consumeSteps preserves the session active state while steps remain", () => {
    const result = createService().consumeSteps(createSession(), 10);

    assert.equal(result.session.active, true);
});

test("consumeSteps does not mutate the original session", () => {
    const session = createSession();
    const original = { ...session };

    createService().consumeSteps(session, 10);

    assert.deepEqual(session, original);
});

test("consumeSteps caps consumption at steps remaining", () => {
    const result = createService().consumeSteps(
        createSession({ stepsRemaining: 5, stepsUsed: 595 }),
        10
    );

    assert.equal(result.success, true);
    assert.equal(result.exhausted, true);
    assert.equal(result.reason, "STEPS_EXHAUSTED");
    assert.equal(result.session.stepsRemaining, 0);
    assert.equal(result.session.stepsUsed, 600);
    assert.equal(result.session.active, false);
});

test("consumeSteps reports exhaustion when the final step is consumed", () => {
    const result = createService().consumeSteps(
        createSession({ stepsRemaining: 1, stepsUsed: 599 }),
        1
    );

    assert.deepEqual(result, {
        success: true,
        exhausted: true,
        reason: "STEPS_EXHAUSTED",
        session: {
            active: false,
            stepsRemaining: 0,
            stepsUsed: 600,
            safariBallsRemaining: 30,
            safariBallsUsed: 0
        }
    });
});

test("consumeSteps omits stepsConsumed when the session is exhausted", () => {
    const result = createService().consumeSteps(
        createSession({ stepsRemaining: 1 }),
        1
    );

    assert.equal(
        Object.hasOwn(result, "stepsConsumed"),
        false
    );
});

test("consumeSteps exhausts a session whose remaining steps are already zero", () => {
    const result = createService().consumeSteps(
        createSession({ stepsRemaining: 0 }),
        1
    );

    assert.equal(result.success, true);
    assert.equal(result.exhausted, true);
    assert.equal(result.session.active, false);
    assert.equal(result.session.stepsRemaining, 0);
});

test("consumeSteps rejects an inactive session", () => {
    const result = createService().consumeSteps(
        createSession({ active: false }),
        1
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "SESSION_INACTIVE");
    assert.deepEqual(result.session, createSession({ active: false }));
});

test("consumeSteps does not mutate an inactive session", () => {
    const session = createSession({
        active: false,
        stepsRemaining: 50,
        stepsUsed: 20
    });
    const original = { ...session };

    createService().consumeSteps(session, 5);

    assert.deepEqual(session, original);
});

test("consumeSteps validates the session before validating steps", () => {
    assert.throws(
        () => createService().consumeSteps(null, 0),
        {
            name: "TypeError",
            message: "Safari session is required."
        }
    );
});

test("consumeSteps rejects zero steps", () => {
    assert.throws(
        () => createService().consumeSteps(createSession(), 0),
        RangeError
    );
});

test("consumeSteps rejects negative steps", () => {
    assert.throws(
        () => createService().consumeSteps(createSession(), -1),
        RangeError
    );
});

test("consumeSteps rejects fractional steps", () => {
    assert.throws(
        () => createService().consumeSteps(createSession(), 1.5),
        RangeError
    );
});

test("consumeSteps rejects numeric strings", () => {
    assert.throws(
        () => createService().consumeSteps(createSession(), "5"),
        RangeError
    );
});

test("consumeSteps validates step quantity even for inactive sessions", () => {
    assert.throws(
        () => createService().consumeSteps(
            createSession({ active: false }),
            0
        ),
        RangeError
    );
});

// --------------------------------------------------
// useSafariBall
// --------------------------------------------------

test("useSafariBall consumes one Safari Ball", () => {
    const result = createService().useSafariBall(createSession());

    assert.deepEqual(result, {
        success: true,
        session: createSession({
            safariBallsRemaining: 29,
            safariBallsUsed: 1
        })
    });
});

test("useSafariBall does not change the step counters", () => {
    const result = createService().useSafariBall(createSession({
        stepsRemaining: 400,
        stepsUsed: 200
    }));

    assert.equal(result.session.stepsRemaining, 400);
    assert.equal(result.session.stepsUsed, 200);
});

test("useSafariBall does not mutate the original session", () => {
    const session = createSession();
    const original = { ...session };

    createService().useSafariBall(session);

    assert.deepEqual(session, original);
});

test("useSafariBall rejects an inactive session", () => {
    const session = createSession({ active: false });

    assert.deepEqual(
        createService().useSafariBall(session),
        {
            success: false,
            reason: "SESSION_INACTIVE",
            session
        }
    );
});

test("useSafariBall rejects a session with no Safari Balls", () => {
    const session = createSession({ safariBallsRemaining: 0 });

    assert.deepEqual(
        createService().useSafariBall(session),
        {
            success: false,
            reason: "NO_SAFARI_BALLS",
            session
        }
    );
});

test("useSafariBall rejects a session with a negative remaining ball count", () => {
    assert.throws(
        () => createService().useSafariBall(
            createSession({ safariBallsRemaining: -1 })
        ),
        RangeError
    );
});

test("useSafariBall allows consuming the last Safari Ball", () => {
    const result = createService().useSafariBall(
        createSession({ safariBallsRemaining: 1, safariBallsUsed: 29 })
    );

    assert.equal(result.success, true);
    assert.equal(result.session.safariBallsRemaining, 0);
    assert.equal(result.session.safariBallsUsed, 30);
    assert.equal(result.session.active, true);
});

test("useSafariBall does not deactivate a session when balls reach zero", () => {
    const result = createService().useSafariBall(
        createSession({ safariBallsRemaining: 1 })
    );

    assert.equal(result.session.active, true);
});

test("useSafariBall validates session counters before checking activity", () => {
    assert.throws(
        () => createService().useSafariBall(
            createSession({
                active: false,
                safariBallsRemaining: -1
            })
        ),
        RangeError
    );
});

test("useSafariBall rejects a missing session", () => {
    assert.throws(
        () => createService().useSafariBall(null),
        {
            name: "TypeError",
            message: "Safari session is required."
        }
    );
});

// --------------------------------------------------
// addSafariBalls
// --------------------------------------------------

test("addSafariBalls adds the requested quantity", () => {
    const result = createService().addSafariBalls(createSession(), 5);

    assert.deepEqual(result, createSession({
        safariBallsRemaining: 35
    }));
});

test("addSafariBalls preserves the number of balls already used", () => {
    const result = createService().addSafariBalls(
        createSession({
            safariBallsRemaining: 5,
            safariBallsUsed: 25
        }),
        10
    );

    assert.equal(result.safariBallsRemaining, 15);
    assert.equal(result.safariBallsUsed, 25);
});

test("addSafariBalls does not mutate the original session", () => {
    const session = createSession();
    const original = { ...session };

    createService().addSafariBalls(session, 5);

    assert.deepEqual(session, original);
});

test("addSafariBalls works on an inactive session", () => {
    const result = createService().addSafariBalls(
        createSession({
            active: false,
            safariBallsRemaining: 0
        }),
        3
    );

    assert.equal(result.active, false);
    assert.equal(result.safariBallsRemaining, 3);
});

test("addSafariBalls allows a large quantity", () => {
    const result = createService().addSafariBalls(createSession(), 1000);

    assert.equal(result.safariBallsRemaining, 1030);
});

test("addSafariBalls rejects zero quantity", () => {
    assert.throws(
        () => createService().addSafariBalls(createSession(), 0),
        {
            name: "RangeError",
            message: "quantity must be a positive integer."
        }
    );
});

test("addSafariBalls rejects negative quantity", () => {
    assert.throws(
        () => createService().addSafariBalls(createSession(), -1),
        RangeError
    );
});

test("addSafariBalls rejects fractional quantity", () => {
    assert.throws(
        () => createService().addSafariBalls(createSession(), 1.5),
        RangeError
    );
});

test("addSafariBalls rejects numeric string quantities", () => {
    assert.throws(
        () => createService().addSafariBalls(createSession(), "5"),
        RangeError
    );
});

test("addSafariBalls validates the session before the quantity", () => {
    assert.throws(
        () => createService().addSafariBalls(null, 0),
        {
            name: "TypeError",
            message: "Safari session is required."
        }
    );
});

// --------------------------------------------------
// exit
// --------------------------------------------------

test("exit ends an active session", () => {
    const result = createService().exit(createSession());

    assert.equal(result.active, false);
});

test("exit preserves session resource counts", () => {
    const result = createService().exit(createSession({
        stepsRemaining: 250,
        stepsUsed: 350,
        safariBallsRemaining: 10,
        safariBallsUsed: 20
    }));

    assert.deepEqual(result, {
        active: false,
        stepsRemaining: 250,
        stepsUsed: 350,
        safariBallsRemaining: 10,
        safariBallsUsed: 20
    });
});

test("exit does not mutate the original session", () => {
    const session = createSession();
    const original = { ...session };

    createService().exit(session);

    assert.deepEqual(session, original);
});

test("exit returns a new session object", () => {
    const session = createSession();

    assert.notStrictEqual(
        createService().exit(session),
        session
    );
});

test("exit accepts an already inactive session", () => {
    const result = createService().exit(
        createSession({ active: false })
    );

    assert.equal(result.active, false);
});

test("exit preserves additional session properties", () => {
    const result = createService().exit(
        createSession({ customProperty: "preserved" })
    );

    assert.equal(result.customProperty, "preserved");
    assert.equal(result.active, false);
});

test("exit rejects an invalid session", () => {
    assert.throws(
        () => createService().exit(null),
        {
            name: "TypeError",
            message: "Safari session is required."
        }
    );
});

// --------------------------------------------------
// Interactions between session operations
// --------------------------------------------------

test("consuming steps and balls updates returned sessions independently", () => {
    const service = createService();
    const session = createSession();

    const afterSteps = service.consumeSteps(session, 20).session;
    const afterBall = service.useSafariBall(afterSteps).session;

    assert.equal(afterBall.stepsRemaining, 580);
    assert.equal(afterBall.stepsUsed, 20);
    assert.equal(afterBall.safariBallsRemaining, 29);
    assert.equal(afterBall.safariBallsUsed, 1);

    assert.equal(session.stepsRemaining, 600);
    assert.equal(session.safariBallsRemaining, 30);
});

test("a session can be exited after resource consumption", () => {
    const service = createService();
    const session = createSession();

    const afterSteps = service.consumeSteps(session, 10).session;
    const afterBall = service.useSafariBall(afterSteps).session;
    const exited = service.exit(afterBall);

    assert.equal(exited.active, false);
    assert.equal(exited.stepsRemaining, 590);
    assert.equal(exited.stepsUsed, 10);
    assert.equal(exited.safariBallsRemaining, 29);
    assert.equal(exited.safariBallsUsed, 1);
});

test("the session returned by entry can be used for subsequent operations", () => {
    const service = createService();
    const { trainerState } = createTrainerState(1000);

    const entry = service.enter(trainerState);
    assert.equal(entry.success, true);

    const steps = service.consumeSteps(entry.session, 5);
    const ball = service.useSafariBall(steps.session);

    assert.equal(ball.success, true);
    assert.equal(ball.session.stepsRemaining, 595);
    assert.equal(ball.session.stepsUsed, 5);
    assert.equal(ball.session.safariBallsRemaining, 29);
    assert.equal(ball.session.safariBallsUsed, 1);
});

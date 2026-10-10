"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const PokemonExplanationService = require(
    "../scripts/services/pokemon-explanation-service"
);

function createService() {
    return new PokemonExplanationService();
}

const BULBASAUR = "BULBASAUR";

function availableResult(overrides = {}) {
    return {
        available: true,
        difficulty: "NORMAL",
        warning: null,
        source: "NORMAL",
        ...overrides
    };
}

function lockedResult(overrides = {}) {
    return {
        available: false,
        status: "LOCKED",
        reason: "Not yet available",
        missingRequirements: [],
        ...overrides
    };
}

// --------------------------------------------------
// Construction
// --------------------------------------------------

test("constructor creates a PokemonExplanationService instance", () => {
    assert.ok(createService() instanceof PokemonExplanationService);
});

test("constructor does not require arguments", () => {
    assert.doesNotThrow(() => new PokemonExplanationService());
});

// --------------------------------------------------
// explain(): missing availability information
// --------------------------------------------------

test("explain returns UNKNOWN when availability information is null", () => {
    const service = createService();

    assert.deepEqual(
        service.explain(BULBASAUR, null),
        {
            pokemon: BULBASAUR,
            status: "UNKNOWN",
            summary: "No availability information found."
        }
    );
});

test("explain returns UNKNOWN when availability information is undefined", () => {
    const service = createService();

    assert.deepEqual(
        service.explain(BULBASAUR, undefined),
        {
            pokemon: BULBASAUR,
            status: "UNKNOWN",
            summary: "No availability information found."
        }
    );
});

test("explain returns UNKNOWN when availability information is false", () => {
    const service = createService();

    assert.equal(
        service.explain(BULBASAUR, false).status,
        "UNKNOWN"
    );
});

test("explain returns UNKNOWN when availability information is zero", () => {
    const service = createService();

    assert.equal(
        service.explain(BULBASAUR, 0).status,
        "UNKNOWN"
    );
});

test("explain preserves the requested species when information is missing", () => {
    const service = createService();

    assert.equal(
        service.explain("CHARMANDER", null).pokemon,
        "CHARMANDER"
    );
});

test("explain uses the exact UNKNOWN summary", () => {
    const service = createService();

    assert.equal(
        service.explain(BULBASAUR, null).summary,
        "No availability information found."
    );

    assert.equal(
        service.explain(BULBASAUR, null).summary,
        "No availability information found."
    );
});

// --------------------------------------------------
// explain(): locked Pokémon
// --------------------------------------------------

test("explain returns LOCKED when the Pokémon is unavailable", () => {
    const service = createService();

    assert.deepEqual(
        service.explain(BULBASAUR, lockedResult()),
        {
            pokemon: BULBASAUR,
            status: "LOCKED",
            summary: "This Pokémon is not available during the current progression.",
            reason: "Not yet available",
            missingRequirements: []
        }
    );
});

test("explain preserves the requested species for a locked Pokémon", () => {
    const service = createService();

    assert.equal(
        service.explain("MEWTWO", lockedResult()).pokemon,
        "MEWTWO"
    );
});

test("explain uses the exact LOCKED summary", () => {
    const service = createService();

    assert.equal(
        service.explain(BULBASAUR, lockedResult()).summary,
        "This Pokémon is not available during the current progression."
    );
});

test("explain preserves a supplied restriction reason", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        lockedResult({
            reason: "Available only after the champion is defeated."
        })
    );

    assert.equal(
        result.reason,
        "Available only after the champion is defeated."
    );
});

test("explain converts a missing locked reason to null", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        { available: false }
    );

    assert.equal(result.reason, null);
});

test("explain converts an empty locked reason to null", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        lockedResult({ reason: "" })
    );

    assert.equal(result.reason, null);
});

test("explain preserves missing requirements", () => {
    const service = createService();

    const requirements = [
        "CHAMPION_DEFEATED",
        "NATIONAL_DEX"
    ];

    const result = service.explain(
        BULBASAUR,
        lockedResult({
            missingRequirements: requirements
        })
    );

    assert.deepEqual(result.missingRequirements, requirements);
});

test("explain preserves the original missing requirements array", () => {
    const service = createService();
    const requirements = ["NATIONAL_DEX"];

    const result = service.explain(
        BULBASAUR,
        lockedResult({
            missingRequirements: requirements
        })
    );

    assert.strictEqual(result.missingRequirements, requirements);
});

test("explain defaults missing locked requirements to an empty array", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        { available: false }
    );

    assert.deepEqual(result.missingRequirements, []);
});

test("explain defaults null locked requirements to an empty array", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        lockedResult({
            missingRequirements: null
        })
    );

    assert.deepEqual(result.missingRequirements, []);
});

test("explain defaults false locked requirements to an empty array", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        lockedResult({
            missingRequirements: false
        })
    );

    assert.deepEqual(result.missingRequirements, []);
});

test("explain does not include availability difficulty in a locked explanation", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        lockedResult({
            difficulty: "EXTREME_GRIND"
        })
    );

    assert.equal(
        Object.prototype.hasOwnProperty.call(result, "difficulty"),
        false
    );
});

test("explain does not include the source in a locked explanation", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        lockedResult({
            source: "TRADE"
        })
    );

    assert.equal(
        Object.prototype.hasOwnProperty.call(result, "source"),
        false
    );
});

test("explain treats a missing available field as locked", () => {
    const service = createService();

    const result = service.explain(BULBASAUR, {
        reason: "Not unlocked"
    });

    assert.equal(result.status, "LOCKED");
});

test("explain treats available zero as locked", () => {
    const service = createService();

    const result = service.explain(BULBASAUR, {
        available: 0
    });

    assert.equal(result.status, "LOCKED");
});

// --------------------------------------------------
// explain(): available Pokémon
// --------------------------------------------------

test("explain returns AVAILABLE for a normally available Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.explain(BULBASAUR, availableResult()),
        {
            pokemon: BULBASAUR,
            status: "AVAILABLE",
            difficulty: "NORMAL",
            summary: "Available normally at this point in the adventure.",
            warning: null,
            source: "NORMAL"
        }
    );
});

test("explain preserves the requested species for an available Pokémon", () => {
    const service = createService();

    assert.equal(
        service.explain("CHARMANDER", availableResult()).pokemon,
        "CHARMANDER"
    );
});

test("explain defaults a missing difficulty to NORMAL", () => {
    const service = createService();

    const result = service.explain(BULBASAUR, {
        available: true
    });

    assert.equal(result.difficulty, "NORMAL");
});

test("explain defaults a null difficulty to NORMAL", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        availableResult({ difficulty: null })
    );

    assert.equal(result.difficulty, "NORMAL");
});

test("explain defaults an empty difficulty to NORMAL", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        availableResult({ difficulty: "" })
    );

    assert.equal(result.difficulty, "NORMAL");
});

test("explain defaults a missing source to NORMAL", () => {
    const service = createService();

    const result = service.explain(BULBASAUR, {
        available: true,
        difficulty: "NORMAL"
    });

    assert.equal(result.source, "NORMAL");
});

test("explain defaults a null source to NORMAL", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        availableResult({ source: null })
    );

    assert.equal(result.source, "NORMAL");
});

test("explain defaults an empty source to NORMAL", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        availableResult({ source: "" })
    );

    assert.equal(result.source, "NORMAL");
});

test("explain preserves a supplied warning", () => {
    const service = createService();

    const warning = "This evolution requires extra grinding.";

    const result = service.explain(
        BULBASAUR,
        availableResult({ warning })
    );

    assert.equal(result.warning, warning);
});

test("explain defaults a missing warning to null", () => {
    const service = createService();

    const result = service.explain(BULBASAUR, {
        available: true,
        difficulty: "NORMAL"
    });

    assert.equal(result.warning, null);
});

test("explain defaults an empty warning to null", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        availableResult({ warning: "" })
    );

    assert.equal(result.warning, null);
});

test("explain defaults a false warning to null", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        availableResult({ warning: false })
    );

    assert.equal(result.warning, null);
});

test("explain uses the HARD_GRIND summary", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        availableResult({ difficulty: "HARD_GRIND" })
    );

    assert.equal(
        result.summary,
        "Technically obtainable, but requires additional grinding compared to normal progression."
    );
});

test("explain uses the EXTREME_GRIND summary", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        availableResult({ difficulty: "EXTREME_GRIND" })
    );

    assert.equal(
        result.summary,
        "Technically obtainable, but far outside normal progression and requires extreme grinding."
    );
});

test("explain uses the TRADE summary", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        availableResult({ difficulty: "TRADE" })
    );

    assert.equal(
        result.summary,
        "Available through trading, but not through normal FireRed progression."
    );
});

test("explain uses the fallback summary for an unknown difficulty", () => {
    const service = createService();

    const result = service.explain(
        BULBASAUR,
        availableResult({ difficulty: "UNRECOGNIZED" })
    );

    assert.equal(result.summary, "Availability confirmed.");
});

// --------------------------------------------------
// generateSummary()
// --------------------------------------------------

test("generateSummary returns the NORMAL summary", () => {
    const service = createService();

    assert.equal(
        service.generateSummary({ difficulty: "NORMAL" }),
        "Available normally at this point in the adventure."
    );
});

test("generateSummary returns the HARD_GRIND summary", () => {
    const service = createService();

    assert.equal(
        service.generateSummary({ difficulty: "HARD_GRIND" }),
        "Technically obtainable, but requires additional grinding compared to normal progression."
    );
});

test("generateSummary returns the EXTREME_GRIND summary", () => {
    const service = createService();

    assert.equal(
        service.generateSummary({ difficulty: "EXTREME_GRIND" }),
        "Technically obtainable, but far outside normal progression and requires extreme grinding."
    );
});

test("generateSummary returns the TRADE summary", () => {
    const service = createService();

    assert.equal(
        service.generateSummary({ difficulty: "TRADE" }),
        "Available through trading, but not through normal FireRed progression."
    );
});

test("generateSummary uses the fallback summary for an unknown difficulty", () => {
    const service = createService();

    assert.equal(
        service.generateSummary({ difficulty: "UNKNOWN" }),
        "Availability confirmed."
    );
});

test("generateSummary uses the fallback summary when difficulty is missing", () => {
    const service = createService();

    assert.equal(
        service.generateSummary({}),
        "Availability confirmed."
    );
});

test("generateSummary uses the fallback summary for an empty difficulty", () => {
    const service = createService();

    assert.equal(
        service.generateSummary({ difficulty: "" }),
        "Availability confirmed."
    );
});

test("generateSummary does not depend on warning text", () => {
    const service = createService();

    assert.equal(
        service.generateSummary({
            difficulty: "NORMAL",
            warning: "Example warning"
        }),
        "Available normally at this point in the adventure."
    );
});

test("generateSummary does not depend on the availability source", () => {
    const service = createService();

    assert.equal(
        service.generateSummary({
            difficulty: "NORMAL",
            source: "TRADE"
        }),
        "Available normally at this point in the adventure."
    );
});

// --------------------------------------------------
// generateDetails()
// --------------------------------------------------

test("generateDetails returns an object", () => {
    const service = createService();

    assert.deepEqual(
        service.generateDetails(availableResult()),
        { method: "NORMAL_PROGRESS" }
    );
});

test("generateDetails uses NORMAL_PROGRESS for a normal source", () => {
    const service = createService();

    assert.deepEqual(
        service.generateDetails({
            source: "NORMAL"
        }),
        {
            method: "NORMAL_PROGRESS"
        }
    );
});

test("generateDetails uses NORMAL_PROGRESS when the source is missing", () => {
    const service = createService();

    assert.deepEqual(
        service.generateDetails({}),
        {
            method: "NORMAL_PROGRESS"
        }
    );
});

test("generateDetails uses NORMAL_PROGRESS for a null source", () => {
    const service = createService();

    assert.deepEqual(
        service.generateDetails({
            source: null
        }),
        {
            method: "NORMAL_PROGRESS"
        }
    );
});

test("generateDetails uses TRADE for the TRADE source", () => {
    const service = createService();

    assert.deepEqual(
        service.generateDetails({
            source: "TRADE"
        }),
        {
            method: "TRADE"
        }
    );
});

test("generateDetails does not treat lowercase trade as TRADE", () => {
    const service = createService();

    assert.deepEqual(
        service.generateDetails({
            source: "trade"
        }),
        {
            method: "NORMAL_PROGRESS"
        }
    );
});

test("generateDetails includes a supplied warning", () => {
    const service = createService();

    const warning = "This Pokémon requires extra grinding.";

    assert.deepEqual(
        service.generateDetails({
            source: "NORMAL",
            warning
        }),
        {
            method: "NORMAL_PROGRESS",
            warning
        }
    );
});

test("generateDetails omits warning when it is missing", () => {
    const service = createService();

    const result = service.generateDetails({
        source: "NORMAL"
    });

    assert.equal(
        Object.prototype.hasOwnProperty.call(result, "warning"),
        false
    );
});

test("generateDetails omits warning when it is null", () => {
    const service = createService();

    const result = service.generateDetails({
        source: "NORMAL",
        warning: null
    });

    assert.equal(
        Object.prototype.hasOwnProperty.call(result, "warning"),
        false
    );
});

test("generateDetails omits warning when it is an empty string", () => {
    const service = createService();

    const result = service.generateDetails({
        source: "NORMAL",
        warning: ""
    });

    assert.equal(
        Object.prototype.hasOwnProperty.call(result, "warning"),
        false
    );
});

test("generateDetails preserves the original warning value", () => {
    const service = createService();

    const warning = "Obtainable after extra training.";

    assert.equal(
        service.generateDetails({
            source: "TRADE",
            warning
        }).warning,
        warning
    );
});

test("generateDetails does not add unrelated availability fields", () => {
    const service = createService();

    const result = service.generateDetails({
        available: true,
        difficulty: "HARD_GRIND",
        source: "NORMAL",
        warning: "Extra grinding required.",
        species: "BULBASAUR"
    });

    assert.deepEqual(result, {
        method: "NORMAL_PROGRESS",
        warning: "Extra grinding required."
    });
});

test("generateDetails returns a fresh object on every call", () => {
    const service = createService();
    const result = { source: "NORMAL" };

    const first = service.generateDetails(result);
    const second = service.generateDetails(result);

    assert.notStrictEqual(first, second);
    assert.deepEqual(first, second);
});

// --------------------------------------------------
// hasWarning()
// --------------------------------------------------

test("hasWarning returns true when warning text exists", () => {
    const service = createService();

    assert.equal(
        service.hasWarning({
            warning: "Additional grinding required."
        }),
        true
    );
});

test("hasWarning returns false when warning is null", () => {
    const service = createService();

    assert.equal(
        service.hasWarning({
            warning: null
        }),
        false
    );
});

test("hasWarning returns false when warning is missing", () => {
    const service = createService();

    assert.equal(
        service.hasWarning({})
        ,
        false
    );
});

test("hasWarning returns false when warning is an empty string", () => {
    const service = createService();

    assert.equal(
        service.hasWarning({
            warning: ""
        }),
        false
    );
});

test("hasWarning returns false when warning is false", () => {
    const service = createService();

    assert.equal(
        service.hasWarning({
            warning: false
        }),
        false
    );
});

test("hasWarning returns true when warning is a nonempty string", () => {
    const service = createService();

    assert.equal(
        service.hasWarning({
            warning: "Warning"
        }),
        true
    );
});

test("hasWarning returns true when warning is a nonempty array", () => {
    const service = createService();

    assert.equal(
        service.hasWarning({
            warning: ["Warning"]
        }),
        true
    );
});

test("hasWarning returns false when explanation is undefined", () => {
    const service = createService();

    assert.throws(
        () => service.hasWarning(undefined),
        TypeError
    );
});

test("hasWarning returns false when explanation is null", () => {
    const service = createService();

    assert.throws(
        () => service.hasWarning(null),
        TypeError
    );
});

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const ExperienceService = require("../scripts/services/experience-service.js");

function createGrowthRateService(overrides = {}) {
    return {
        getRequiredExp(level, growthRate) {
            if (overrides.getRequiredExp) {
                return overrides.getRequiredExp(level, growthRate);
            }

            return level ** 3;
        },
    };
}

function createService(growthRateService = createGrowthRateService()) {
    return new ExperienceService(growthRateService);
}

function createPokemon(overrides = {}) {
    return {
        species: "PIKACHU",
        level: 5,
        exp: 125,
        baseExp: 50,
        growthRate: "GROWTH_MEDIUM_FAST",
        ...overrides,
    };
}

test("constructor stores the growth-rate service", () => {
    const growthRates = createGrowthRateService();
    const service = createService(growthRates);

    assert.equal(service.growthRates, growthRates);
});

test("constructor configures trainer and wild EXP multipliers", () => {
    const service = createService();

    assert.deepEqual(service.baseExp, {
        TRAINER: 1,
        WILD: 1,
    });
});

test("calculateExp returns zero for a missing defeated Pokemon", () => {
    assert.equal(createService().calculateExp(null), 0);
});

test("calculateExp returns zero for undefined defeated Pokemon", () => {
    assert.equal(createService().calculateExp(undefined), 0);
});

test("calculateExp calculates a wild Pokemon reward", () => {
    const service = createService();

    assert.equal(
        service.calculateExp({ baseExp: 50, level: 10 }),
        250
    );
});

test("calculateExp calculates a trainer Pokemon reward", () => {
    const service = createService();

    assert.equal(
        service.calculateExp(
            { baseExp: 50, level: 10 },
            "TRAINER"
        ),
        250
    );
});

test("calculateExp floors fractional EXP rewards", () => {
    const service = createService();

    assert.equal(
        service.calculateExp({ baseExp: 15, level: 3 }),
        22
    );
});

test("calculateExp defaults missing base EXP to 50", () => {
    const service = createService();

    assert.equal(
        service.calculateExp({ level: 10 }),
        250
    );
});

test("calculateExp defaults zero base EXP to 50", () => {
    const service = createService();

    assert.equal(
        service.calculateExp({ baseExp: 0, level: 10 }),
        250
    );
});

test("calculateExp defaults missing level to one", () => {
    const service = createService();

    assert.equal(
        service.calculateExp({ baseExp: 50 }),
        25
    );
});

test("calculateExp defaults zero level to one", () => {
    const service = createService();

    assert.equal(
        service.calculateExp({ baseExp: 50, level: 0 }),
        25
    );
});

test("calculateExp uses a multiplier of one for an unknown source", () => {
    const service = createService();

    assert.equal(
        service.calculateExp(
            { baseExp: 40, level: 5 },
            "UNKNOWN"
        ),
        100
    );
});

test("calculateExp uses a multiplier of one for an empty source", () => {
    const service = createService();

    assert.equal(
        service.calculateExp(
            { baseExp: 40, level: 5 },
            ""
        ),
        100
    );
});

test("calculateExp uses the configured source multiplier", () => {
    const service = createService();
    service.baseExp.WILD = 2;

    assert.equal(
        service.calculateExp(
            { baseExp: 50, level: 10 },
            "WILD"
        ),
        500
    );
});

test("giveExp returns a failure for a missing Pokemon", () => {
    const result = createService().giveExp(null, 10);

    assert.deepEqual(result, {
        success: false,
        reason: "Missing Pokemon",
    });
});

test("giveExp rejects undefined Pokemon", () => {
    const result = createService().giveExp(undefined, 10);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Missing Pokemon");
});

test("giveExp rejects NaN as an EXP amount", () => {
    const pokemon = createPokemon();
    const originalExp = pokemon.exp;

    const result = createService().giveExp(pokemon, NaN);

    assert.deepEqual(result, {
        success: false,
        reason: "Invalid EXP amount",
    });
    assert.equal(pokemon.exp, originalExp);
});

test("giveExp rejects positive Infinity", () => {
    const pokemon = createPokemon();

    const result = createService().giveExp(pokemon, Infinity);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid EXP amount");
});

test("giveExp rejects negative Infinity", () => {
    const pokemon = createPokemon();

    const result = createService().giveExp(pokemon, -Infinity);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid EXP amount");
});

test("giveExp rejects negative EXP amounts", () => {
    const pokemon = createPokemon();
    const originalExp = pokemon.exp;

    const result = createService().giveExp(pokemon, -1);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid EXP amount");
    assert.equal(pokemon.exp, originalExp);
});

test("giveExp accepts a numeric string", () => {
    const pokemon = createPokemon({ level: 5, exp: 125 });
    const result = createService().giveExp(pokemon, "10");

    assert.equal(result.success, true);
    assert.equal(result.gained, 10);
    assert.equal(result.total, 135);
});

test("giveExp accepts zero EXP", () => {
    const pokemon = createPokemon({ level: 5, exp: 125 });
    const result = createService().giveExp(pokemon, 0);

    assert.equal(result.success, true);
    assert.equal(result.gained, 0);
    assert.equal(result.total, 125);
});

test("giveExp initializes missing EXP to zero", () => {
    const pokemon = createPokemon({ exp: undefined });
    const result = createService().giveExp(pokemon, 10);

    assert.equal(result.success, true);
    assert.equal(pokemon.exp, 10);
    assert.equal(result.total, 10);
});

test("giveExp preserves existing EXP before adding the reward", () => {
    const pokemon = createPokemon({ exp: 200 });
    const result = createService().giveExp(pokemon, 25);

    assert.equal(pokemon.exp, 225);
    assert.equal(result.total, 225);
});

test("giveExp initializes a missing level to one", () => {
    const pokemon = createPokemon({
        level: undefined,
        exp: 0,
    });

    const result = createService().giveExp(pokemon, 0);

    assert.equal(pokemon.level, 1);
    assert.equal(result.oldLevel, 1);
    assert.equal(result.currentLevel, 1);
});

test("giveExp initializes a zero level to one", () => {
    const pokemon = createPokemon({
        level: 0,
        exp: 0,
    });

    const result = createService().giveExp(pokemon, 0);

    assert.equal(pokemon.level, 1);
    assert.equal(result.oldLevel, 1);
});

test("giveExp returns the old level as currentLevel", () => {
    const pokemon = createPokemon({
        level: 5,
        exp: 125,
    });

    const result = createService().giveExp(pokemon, 10);

    assert.equal(result.oldLevel, 5);
    assert.equal(result.currentLevel, 5);
});

test("giveExp does not mutate the Pokemon's actual level", () => {
    const pokemon = createPokemon({
        level: 5,
        exp: 125,
    });

    createService().giveExp(pokemon, 1000);

    assert.equal(pokemon.level, 5);
});

test("giveExp returns an empty levels array when no level is gained", () => {
    const pokemon = createPokemon({
        level: 5,
        exp: 125,
    });

    const result = createService().giveExp(pokemon, 0);

    assert.deepEqual(result.levels, []);
    assert.equal(result.pendingLevel, 5);
});

test("giveExp reports the next pending level when its threshold is reached", () => {
    const pokemon = createPokemon({
        level: 5,
        exp: 125,
    });

    const result = createService().giveExp(pokemon, 91);

    assert.equal(result.pendingLevel, 6);
    assert.deepEqual(result.levels, [6]);
});

test("giveExp reports multiple pending level increases", () => {
    const pokemon = createPokemon({
        level: 5,
        exp: 125,
    });

    const result = createService().giveExp(pokemon, 1000);

    assert.deepEqual(result.levels, [6, 7, 8, 9, 10]);
    assert.equal(result.pendingLevel, 10);
    assert.equal(result.currentLevel, 5);
    assert.equal(pokemon.level, 5);
});

test("giveExp includes the exact new total in its result", () => {
    const pokemon = createPokemon({
        level: 5,
        exp: 125,
    });

    const result = createService().giveExp(pokemon, 75);

    assert.equal(result.gained, 75);
    assert.equal(result.total, 200);
    assert.equal(pokemon.exp, 200);
});

test("giveExp returns the expected result structure", () => {
    const pokemon = createPokemon({
        level: 5,
        exp: 125,
    });

    const result = createService().giveExp(pokemon, 10);

    assert.deepEqual(result, {
        success: true,
        gained: 10,
        total: 135,
        oldLevel: 5,
        currentLevel: 5,
        pendingLevel: 5,
        levels: [],
    });
});

test("giveExp delegates level thresholds to the growth-rate service", () => {
    const calls = [];

    const growthRates = createGrowthRateService({
        getRequiredExp(level, growthRate) {
            calls.push({ level, growthRate });
            return level * 100;
        },
    });

    const pokemon = createPokemon({
        level: 2,
        exp: 200,
        growthRate: "CUSTOM_GROWTH",
    });

    createService(growthRates).giveExp(pokemon, 100);

    assert.ok(
        calls.some(
            call =>
                call.level === 3 &&
                call.growthRate === "CUSTOM_GROWTH"
        )
    );
});

test("giveExp uses the Pokemon growth rate for pending levels", () => {
    const calls = [];

    const service = createService({
        getRequiredExp(level, growthRate) {
            calls.push({ level, growthRate });
            return level * 100;
        },
    });

    const pokemon = createPokemon({
        level: 2,
        exp: 200,
        growthRate: "GROWTH_SLOW",
    });

    const result = service.giveExp(pokemon, 100);

    assert.equal(result.pendingLevel, 3);
    assert.deepEqual(result.levels, [3]);
    assert.ok(calls.every(call => call.growthRate === "GROWTH_SLOW"));
});

test("giveExp does not calculate pending levels beyond level 100", () => {
    const pokemon = createPokemon({
        level: 100,
        exp: 1000000,
    });

    const result = createService().giveExp(pokemon, 1000);

    assert.equal(result.pendingLevel, 100);
    assert.deepEqual(result.levels, []);
    assert.equal(pokemon.level, 100);
});

test("giveExp stops pending level calculations at level 100", () => {
    const pokemon = createPokemon({
        level: 99,
        exp: 1000000,
    });

    const result = createService().giveExp(pokemon, 0);

    assert.equal(result.pendingLevel, 100);
    assert.deepEqual(result.levels, [100]);
});

test("getExpRequired delegates to the growth-rate service", () => {
    const calls = [];
    const growthRates = {
        getRequiredExp(level, growthRate) {
            calls.push({ level, growthRate });
            return 12345;
        },
    };

    const service = createService(growthRates);

    assert.equal(
        service.getExpRequired(25, "GROWTH_FAST"),
        12345
    );

    assert.deepEqual(calls, [{
        level: 25,
        growthRate: "GROWTH_FAST",
    }]);
});

test("getExpRequired uses the default growth rate argument", () => {
    let received;

    const service = createService({
        getRequiredExp(level, growthRate) {
            received = { level, growthRate };
            return 0;
        },
    });

    service.getExpRequired(10);

    assert.deepEqual(received, {
        level: 10,
        growthRate: "GROWTH_MEDIUM_FAST",
    });
});

test("getExpRequired falls back to the cube of the level without a growth service", () => {
    const service = createService(null);

    assert.equal(service.getExpRequired(1), 1);
    assert.equal(service.getExpRequired(5), 125);
    assert.equal(service.getExpRequired(10), 1000);
});

test("getExpProgress returns null for a missing Pokemon", () => {
    assert.equal(createService().getExpProgress(null), null);
});

test("getExpProgress returns null for undefined Pokemon", () => {
    assert.equal(createService().getExpProgress(undefined), null);
});

test("getExpProgress defaults missing EXP to zero", () => {
    const pokemon = createPokemon({ exp: undefined });
    const result = createService().getExpProgress(pokemon);

    assert.equal(result.current, 0);
    assert.equal(result.level, 1);
});

test("getExpProgress defaults zero EXP to zero", () => {
    const pokemon = createPokemon({ exp: 0 });
    const result = createService().getExpProgress(pokemon);

    assert.equal(result.current, 0);
    assert.equal(result.level, 1);
});

test("getExpProgress defaults missing growth rate to medium-fast", () => {
    let receivedGrowthRate;

    const service = createService({
        getRequiredExp(level, growthRate) {
            receivedGrowthRate = growthRate;
            return level ** 3;
        },
    });

    service.getExpProgress({
        exp: 10,
        growthRate: undefined,
    });

    assert.equal(receivedGrowthRate, "GROWTH_MEDIUM_FAST");
});

test("getExpProgress calculates level and progress at the start of a level", () => {
    const service = createService();

    const result = service.getExpProgress({
        exp: 125,
        growthRate: "GROWTH_MEDIUM_FAST",
    });

    assert.deepEqual(result, {
        level: 5,
        current: 125,
        levelStart: 125,
        levelEnd: 216,
        progress: 0,
        remaining: 91,
        percentage: 0,
    });
});

test("getExpProgress calculates progress within a level", () => {
    const result = createService().getExpProgress({
        exp: 170,
        growthRate: "GROWTH_MEDIUM_FAST",
    });

    assert.equal(result.level, 5);
    assert.equal(result.current, 170);
    assert.equal(result.levelStart, 125);
    assert.equal(result.levelEnd, 216);
    assert.equal(result.progress, 45);
    assert.equal(result.remaining, 46);
    assert.equal(result.percentage, 49);
});

test("getExpProgress calculates 100 percent at the next level threshold", () => {
    const result = createService().getExpProgress({
        exp: 216,
        growthRate: "GROWTH_MEDIUM_FAST",
    });

    assert.equal(result.level, 6);
    assert.equal(result.levelStart, 216);
    assert.equal(result.progress, 0);
    assert.equal(result.percentage, 0);
});

test("getExpProgress calculates remaining EXP correctly", () => {
    const result = createService().getExpProgress({
        exp: 200,
        growthRate: "GROWTH_MEDIUM_FAST",
    });

    assert.equal(result.remaining, 16);
});

test("getExpProgress never returns negative progress", () => {
    const result = createService().getExpProgress({
        exp: -10,
        growthRate: "GROWTH_MEDIUM_FAST",
    });

    assert.equal(result.progress, 0);
});

test("getExpProgress ensures the required interval is at least one", () => {
    const service = createService({
        getRequiredExp(level) {
            return level === 1 ? 0 : 0;
        },
    });

    const result = service.getExpProgress({ exp: 0 });

    assert.equal(result.percentage, 0);
    assert.equal(result.remaining, 0);
});

test("getExpProgress never reports a percentage greater than 100", () => {
    const service = createService({
        getRequiredExp(level) {
            return level * 100;
        },
    });

    const result = service.getExpProgress({ exp: 100000 });

    assert.ok(result.percentage <= 100);
});

test("getExpProgress caps its calculated level at 100", () => {
    const result = createService().getExpProgress({
        exp: 1000000000,
        growthRate: "GROWTH_MEDIUM_FAST",
    });

    assert.equal(result.level, 100);
});

test("getExpProgress delegates EXP thresholds to the growth-rate service", () => {
    const calls = [];

    const service = createService({
        getRequiredExp(level, growthRate) {
            calls.push({ level, growthRate });
            return level ** 3;
        },
    });

    service.getExpProgress({
        exp: 125,
        growthRate: "GROWTH_FAST",
    });

    assert.ok(calls.length > 0);
    assert.ok(calls.every(call => call.growthRate === "GROWTH_FAST"));
});

test("createReward returns the defeated species, level, and calculated EXP", () => {
    const service = createService();

    assert.deepEqual(
        service.createReward({
            species: "CHARMANDER",
            level: 10,
            baseExp: 50,
        }),
        {
            pokemon: "CHARMANDER",
            level: 10,
            exp: 250,
        }
    );
});

test("createReward supports a trainer source", () => {
    const service = createService();

    assert.deepEqual(
        service.createReward(
            {
                species: "SQUIRTLE",
                level: 8,
                baseExp: 60,
            },
            "TRAINER"
        ),
        {
            pokemon: "SQUIRTLE",
            level: 8,
            exp: 240,
        }
    );
});

test("createReward throws when the defeated Pokemon is missing", () => {
    const service = createService();

    assert.throws(
        () => service.createReward(null),
        TypeError
    );
});

test("createReward preserves the defeated Pokemon's original level", () => {
    const defeatedPokemon = {
        species: "BULBASAUR",
        level: 12,
        baseExp: 64,
    };

    const reward = createService().createReward(defeatedPokemon);

    assert.equal(reward.level, 12);
    assert.equal(defeatedPokemon.level, 12);
});

test("createReward does not mutate the defeated Pokemon", () => {
    const defeatedPokemon = {
        species: "PIDGEY",
        level: 5,
        baseExp: 50,
    };

    const before = { ...defeatedPokemon };

    createService().createReward(defeatedPokemon);

    assert.deepEqual(defeatedPokemon, before);
});
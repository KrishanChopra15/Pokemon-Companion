"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const DamageCalculationService = require("../scripts/services/damage-calculation-service.js");

function createPokemon(overrides = {}) {
    return {
        species: "Testmon",
        level: 50,
        types: ["GRASS"],
        attack: 100,
        defense: 100,
        spAttack: 100,
        spDefense: 100,
        hp: 100,
        maxHp: 100,
        ...overrides,
    };
}

function createMove(overrides = {}) {
    return {
        name: "TEST MOVE",
        constant: "MOVE_TEST_MOVE",
        type: "FIRE",
        category: "PHYSICAL",
        power: 40,
        ...overrides,
    };
}

function createService(typeEffectivenessService = null, statusEffectService = null) {
    return new DamageCalculationService(typeEffectivenessService, statusEffectService);
}

function withMutedConsole(callback) {
    const originalLog = console.log;
    console.log = () => {};
    try {
        return callback();
    } finally {
        console.log = originalLog;
    }
}

function withRandom(value, callback) {
    const originalRandom = Math.random;
    Math.random = () => value;
    try {
        return callback();
    } finally {
        Math.random = originalRandom;
    }
}

function calculate(service, attacker, defender, move, context = {}, random = 0) {
    return withMutedConsole(() =>
        withRandom(random, () => service.calculateDamage(attacker, defender, move, context))
    );
}

test("constructor stores optional collaborators and configures Gen 3 constants", () => {
    const typeEffectiveness = { getMultiplier() { return 1; } };
    const statusEffect = { marker: true };
    const service = createService(typeEffectiveness, statusEffect);

    assert.equal(service.typeEffectiveness, typeEffectiveness);
    assert.equal(service.statusEffect, statusEffect);
    assert.equal(service.randomMin, 217);
    assert.equal(service.randomMax, 255);
    assert.deepEqual(service.criticalRates, { NORMAL: 16, HIGH: 8 });
});

test("constructor defaults collaborators to null", () => {
    const service = createService();
    assert.equal(service.typeEffectiveness, null);
    assert.equal(service.statusEffect, null);
});

test("calculateDamage returns zero when attacker is missing", () => {
    assert.equal(calculate(createService(), null, createPokemon(), createMove()), 0);
});

test("calculateDamage returns zero when defender is missing", () => {
    assert.equal(calculate(createService(), createPokemon(), null, createMove()), 0);
});

test("calculateDamage returns zero when move is missing", () => {
    assert.equal(calculate(createService(), createPokemon(), createPokemon(), null), 0);
});

test("calculateDamage returns zero for zero-power moves", () => {
    assert.equal(calculate(createService(), createPokemon(), createPokemon(), createMove({ power: 0 })), 0);
});

test("calculateDamage returns zero for negative-power moves", () => {
    assert.equal(calculate(createService(), createPokemon(), createPokemon(), createMove({ power: -10 })), 0);
});

test("calculateDamage treats an omitted power as zero", () => {
    const move = createMove();
    delete move.power;
    assert.equal(calculate(createService(), createPokemon(), createPokemon(), move), 0);
});

test("level zero falls back to level one", () => {
    const service = createService();
    const result = calculate(service, createPokemon({ level: 0 }), createPokemon(), createMove(), { forceCritical: false }, 0.999999);
    assert.equal(result, 3);
});

test("missing level falls back to level one", () => {
    const attacker = createPokemon();
    delete attacker.level;
    const result = calculate(createService(), attacker, createPokemon(), createMove(), { forceCritical: false }, 0.999999);
    assert.equal(result, 3);
});

test("uses the base Gen 3 damage formula with the minimum random factor", () => {
    const result = calculate(createService(), createPokemon(), createPokemon(), createMove(), { forceCritical: false }, 0);
    assert.equal(result, 16);
});

test("uses the base Gen 3 damage formula with the maximum random factor", () => {
    const result = calculate(createService(), createPokemon(), createPokemon(), createMove(), { forceCritical: false }, 0.999999);
    assert.equal(result, 19);
});

test("damage calculation never returns less than one after a non-immune hit", () => {
    const result = calculate(
        createService(),
        createPokemon({ attack: 1 }),
        createPokemon({ defense: 9999 }),
        createMove({ power: 1 }),
        { forceCritical: false },
        0
    );
    assert.equal(result, 1);
});

test("calculateDamage does not modify either Pokemon's HP", () => {
    const attacker = createPokemon({ hp: 73 });
    const defender = createPokemon({ hp: 41 });
    calculate(createService(), attacker, defender, createMove(), { forceCritical: false }, 0);
    assert.equal(attacker.hp, 73);
    assert.equal(defender.hp, 41);
});

test("calculateDamage does not mutate the move", () => {
    const move = createMove();
    const before = structuredClone(move);
    calculate(createService(), createPokemon(), createPokemon(), move, { forceCritical: false }, 0);
    assert.deepEqual(move, before);
});

test("applies STAB for a matching single type", () => {
    const result = calculate(
        createService(),
        createPokemon({ types: ["FIRE"] }),
        createPokemon(),
        createMove({ type: "FIRE" }),
        { forceCritical: false },
        0.999999
    );
    assert.equal(result, 28);
});

test("does not apply STAB when the move type does not match the attacker", () => {
    const result = calculate(
        createService(),
        createPokemon({ types: ["GRASS"] }),
        createPokemon(),
        createMove({ type: "FIRE" }),
        { forceCritical: false },
        0.999999
    );
    assert.equal(result, 19);
});

test("applies STAB for a matching secondary type", () => {
    const result = calculate(
        createService(),
        createPokemon({ types: ["GRASS", "FIRE"] }),
        createPokemon(),
        createMove({ type: "FIRE" }),
        { forceCritical: false },
        0.999999
    );
    assert.equal(result, 28);
});

test("supports a scalar attacker type for STAB", () => {
    const result = calculate(
        createService(),
        createPokemon({ types: undefined, type: "FIRE" }),
        createPokemon(),
        createMove({ type: "FIRE" }),
        { forceCritical: false },
        0.999999
    );
    assert.equal(result, 28);
});

test("normalizes type strings when checking STAB", () => {
    const service = createService();
    assert.equal(service.hasSTAB(createPokemon({ types: ["TYPE_FIRE"] }), createMove({ type: "FIRE" })), true);
    assert.equal(service.hasSTAB(createPokemon({ types: ["fire"] }), createMove({ type: "TYPE_FIRE" })), true);
});

test("supports object-shaped types when checking STAB", () => {
    const service = createService();
    assert.equal(
        service.hasSTAB(createPokemon({ types: [{ constant: "TYPE_FIRE" }] }), createMove({ type: { name: "FIRE" } })),
        true
    );
});

test("hasSTAB returns false when Pokemon is missing", () => {
    assert.equal(createService().hasSTAB(null, createMove()), false);
});

test("hasSTAB returns false when move is missing", () => {
    assert.equal(createService().hasSTAB(createPokemon(), null), false);
});

test("hasSTAB returns false when the attacker has no type data", () => {
    assert.equal(createService().hasSTAB(createPokemon({ types: undefined, type: undefined }), createMove()), false);
});

test("applies a type-effectiveness multiplier", () => {
    const typeService = { getMultiplier: () => 2 };
    const result = calculate(createService(typeService), createPokemon(), createPokemon(), createMove(), { forceCritical: false }, 0.999999);
    assert.equal(result, 38);
});

test("returns zero for type immunity without consuming a damage random roll", () => {
    let calls = 0;
    const originalRandom = Math.random;
    Math.random = () => { calls += 1; return 0; };
    try {
        const service = createService({ getMultiplier: () => 0 });
        const result = withMutedConsole(() => service.calculateDamage(
            createPokemon(), createPokemon(), createMove(), { forceCritical: false }
        ));
        assert.equal(result, 0);
        assert.equal(calls, 0);
    } finally {
        Math.random = originalRandom;
    }
});

test("forwards move type, defender types, and context to the type service", () => {
    const defenderTypes = ["WATER", "FLYING"];
    const context = { marker: "context" };
    let received;
    const typeService = {
        getMultiplier(...args) {
            received = args;
            return 1;
        },
    };
    const service = createService(typeService);
    assert.equal(service.getTypeMultiplier("FIRE", defenderTypes, context), 1);
    assert.deepEqual(received, ["FIRE", defenderTypes, context]);
});

test("wraps a scalar defender type before forwarding it to the type service", () => {
    let received;
    const service = createService({ getMultiplier(...args) { received = args; return 1; } });
    service.getTypeMultiplier("FIRE", "GRASS", { weather: "SUN" });
    assert.deepEqual(received, ["FIRE", ["GRASS"], { weather: "SUN" }]);
});

test("defaults to neutral type effectiveness without a type service", () => {
    assert.equal(createService().getTypeMultiplier("FIRE", ["GRASS"]), 1);
});

test("uses defender.types before defender.type", () => {
    let receivedTypes;
    const service = createService({ getMultiplier(_moveType, types) { receivedTypes = types; return 1; } });
    calculate(
        service,
        createPokemon(),
        createPokemon({ types: ["WATER"], type: "ROCK" }),
        createMove(),
        { forceCritical: false },
        0
    );
    assert.deepEqual(receivedTypes, ["WATER"]);
});

test("falls back to scalar defender.type when defender.types is absent", () => {
    let receivedTypes;
    const service = createService({ getMultiplier(_moveType, types) { receivedTypes = types; return 1; } });
    calculate(
        service,
        createPokemon(),
        createPokemon({ types: undefined, type: "ROCK" }),
        createMove(),
        { forceCritical: false },
        0
    );
    assert.deepEqual(receivedTypes, ["ROCK"]);
});

test("defaults defender typing to NORMAL when no defender type is provided", () => {
    let receivedTypes;
    const service = createService({ getMultiplier(_moveType, types) { receivedTypes = types; return 1; } });
    calculate(
        service,
        createPokemon(),
        createPokemon({ types: undefined, type: undefined }),
        createMove(),
        { forceCritical: false },
        0
    );
    assert.deepEqual(receivedTypes, ["NORMAL"]);
});

test("uses the physical attack and defense stats for physical moves", () => {
    const service = createService();
    assert.equal(service.getAttack(createPokemon({ attack: 150, spAttack: 300 }), createMove()), 150);
    assert.equal(service.getDefense(createPokemon({ defense: 125, spDefense: 250 }), createMove()), 125);
});

test("uses the special attack and defense stats for special moves", () => {
    const service = createService();
    const move = createMove({ category: "SPECIAL" });
    assert.equal(service.getAttack(createPokemon({ attack: 150, spAttack: 300 }), move), 300);
    assert.equal(service.getDefense(createPokemon({ defense: 125, spDefense: 250 }), move), 250);
});

test("uses attack stat stages", () => {
    const service = createService();
    assert.equal(service.getAttack(createPokemon({ attack: 100, statStages: { attack: 2 } }), createMove()), 200);
    assert.equal(service.getAttack(createPokemon({ attack: 100, statStages: { attack: -2 } }), createMove()), 50);
});

test("uses special attack stat stages", () => {
    const service = createService();
    assert.equal(
        service.getAttack(createPokemon({ spAttack: 100, statStages: { spAttack: 2 } }), createMove({ category: "SPECIAL" })),
        200
    );
});

test("uses defense stat stages", () => {
    const service = createService();
    assert.equal(service.getDefense(createPokemon({ defense: 100, statStages: { defense: 2 } }), createMove()), 200);
    assert.equal(service.getDefense(createPokemon({ defense: 100, statStages: { defense: -2 } }), createMove()), 50);
});

test("uses special defense stat stages", () => {
    const service = createService();
    assert.equal(
        service.getDefense(createPokemon({ spDefense: 100, statStages: { spDefense: 2 } }), createMove({ category: "SPECIAL" })),
        200
    );
});

test("defaults zero or missing combat stats to one", () => {
    const service = createService();
    assert.equal(service.getAttack(createPokemon({ attack: 0 }), createMove()), 1);
    assert.equal(service.getDefense(createPokemon({ defense: undefined }), createMove()), 1);
    assert.equal(service.getRawAttack(createPokemon({ attack: 0 }), createMove()), 1);
    assert.equal(service.getRawDefense(createPokemon({ defense: undefined }), createMove()), 1);
});

test("raw attack and defense bypass stat stages", () => {
    const service = createService();
    const pokemon = createPokemon({
        attack: 100,
        defense: 120,
        spAttack: 140,
        spDefense: 160,
        statStages: { attack: 6, defense: -6, spAttack: 6, spDefense: -6 },
    });
    assert.equal(service.getRawAttack(pokemon, createMove()), 100);
    assert.equal(service.getRawDefense(pokemon, createMove()), 120);
    assert.equal(service.getRawAttack(pokemon, createMove({ category: "SPECIAL" })), 140);
    assert.equal(service.getRawDefense(pokemon, createMove({ category: "SPECIAL" })), 160);
});

test("stage multiplier supports all stages from minus six to plus six", () => {
    const service = createService();
    const expected = [1 / 4, 2 / 7, 1 / 3, 2 / 5, 1 / 2, 2 / 3, 1, 3 / 2, 2, 5 / 2, 3, 7 / 2, 4];
    for (let stage = -6; stage <= 6; stage += 1) {
        assert.equal(service.getStageMultiplier(stage), expected[stage + 6], `stage ${stage}`);
    }
});

test("stage multiplier clamps stages below minus six and above plus six", () => {
    const service = createService();
    assert.equal(service.getStageMultiplier(-100), service.getStageMultiplier(-6));
    assert.equal(service.getStageMultiplier(100), service.getStageMultiplier(6));
});

test("stage multiplier defaults an omitted stage to neutral", () => {
    assert.equal(createService().getStageMultiplier(), 1);
});

test("burn recognition supports a string status", () => {
    assert.equal(createService().isBurned(createPokemon({ status: "BURN" })), true);
});

test("burn recognition supports an object status name", () => {
    assert.equal(createService().isBurned(createPokemon({ status: { name: "BURN" } })), true);
});

test("burn recognition is false for other statuses and missing Pokemon", () => {
    const service = createService();
    assert.equal(service.isBurned(createPokemon({ status: "POISON" })), false);
    assert.equal(service.isBurned(createPokemon({ status: { name: "POISON" } })), false);
    assert.equal(service.isBurned(null), false);
    assert.equal(service.isBurned(createPokemon()), false);
});

test("halves physical attack damage for a burned attacker", () => {
    const result = calculate(
        createService(),
        createPokemon({ status: "BURN" }),
        createPokemon(),
        createMove(),
        { forceCritical: false },
        0.999999
    );
    assert.equal(result, 10);
});

test("burn does not reduce damage for a special move", () => {
    const burned = calculate(
        createService(),
        createPokemon({ status: "BURN" }),
        createPokemon(),
        createMove({ category: "SPECIAL" }),
        { forceCritical: false },
        0.999999
    );
    const healthy = calculate(
        createService(),
        createPokemon(),
        createPokemon(),
        createMove({ category: "SPECIAL" }),
        { forceCritical: false },
        0.999999
    );
    assert.equal(burned, healthy);
});

test("critical hits use raw attack and defense rather than modified stages", () => {
    const attacker = createPokemon({ attack: 100, statStages: { attack: 6 } });
    const defender = createPokemon({ defense: 100, statStages: { defense: -6 } });
    const result = calculate(createService(), attacker, defender, createMove(), { forceCritical: true }, 0.999999);
    assert.equal(result, 38);
});

test("critical hits double base damage", () => {
    const ordinary = calculate(createService(), createPokemon(), createPokemon(), createMove(), { forceCritical: false }, 0.999999);
    const critical = calculate(createService(), createPokemon(), createPokemon(), createMove(), { forceCritical: true }, 0.999999);
    assert.equal(ordinary, 19);
    assert.equal(critical, 38);
});

test("critical physical hits bypass the burn attack reduction", () => {
    const service = createService();
    const burnedCritical = calculate(service, createPokemon({ status: "BURN" }), createPokemon(), createMove(), { forceCritical: true }, 0.999999);
    const healthyCritical = calculate(service, createPokemon(), createPokemon(), createMove(), { forceCritical: true }, 0.999999);
    assert.equal(burnedCritical, healthyCritical);
});

test("forceCritical false prevents a random critical-hit check", () => {
    const service = createService();
    let randomCalls = 0;
    const originalRandom = Math.random;
    Math.random = () => { randomCalls += 1; return 0.999999; };
    try {
        withMutedConsole(() => service.calculateDamage(createPokemon(), createPokemon(), createMove(), { forceCritical: false }));
    } finally {
        Math.random = originalRandom;
    }
    assert.equal(randomCalls, 1, "only the damage random factor should be rolled");
});

test("normal critical chance succeeds at the lowest random value", () => {
    assert.equal(withRandom(0, () => createService().checkCriticalHit(createMove())), true);
});

test("normal critical chance fails after its first sixteenth interval", () => {
    assert.equal(withRandom(1 / 16, () => createService().checkCriticalHit(createMove())), false);
});

test("high critical chance uses the one-in-eight threshold", () => {
    const service = createService();
    assert.equal(withRandom(0.124999, () => service.checkCriticalHit(createMove({ criticalRate: "HIGH" }))), true);
    assert.equal(withRandom(0.125, () => service.checkCriticalHit(createMove({ criticalRate: "HIGH" }))), false);
});

test("checkCriticalHit defaults to the normal rate when move is missing or has no high rate", () => {
    const service = createService();
    assert.equal(withRandom(0.0625, () => service.checkCriticalHit()), false);
    assert.equal(withRandom(0.0625, () => service.checkCriticalHit(createMove({ criticalRate: "NORMAL" }))), false);
});

test("Struggle is detected by its constant", () => {
    const result = calculate(
        createService(),
        createPokemon({ types: ["FIRE"] }),
        createPokemon(),
        createMove({ constant: "MOVE_STRUGGLE", type: "FIRE" }),
        { forceCritical: true, weatherMultiplier: 2 },
        0.999999
    );
    assert.equal(result, 19);
});

test("Struggle is detected by its name", () => {
    const result = calculate(
        createService(),
        createPokemon({ types: ["FIRE"] }),
        createPokemon(),
        createMove({ name: "STRUGGLE", type: "FIRE" }),
        { forceCritical: true, weatherMultiplier: 2 },
        0.999999
    );
    assert.equal(result, 19);
});

test("Struggle ignores forced critical hits", () => {
    const service = createService();
    const result = calculate(
        service,
        createPokemon(),
        createPokemon(),
        createMove({ name: "STRUGGLE" }),
        { forceCritical: true },
        0.999999
    );
    assert.equal(result, 19);
});

test("Struggle ignores STAB, type effectiveness, and weather multiplier", () => {
    const typeService = { getMultiplier: () => 0.5 };
    const result = calculate(
        createService(typeService),
        createPokemon({ types: ["FIRE"] }),
        createPokemon(),
        createMove({ name: "STRUGGLE", type: "FIRE" }),
        { forceCritical: false, weatherMultiplier: 3 },
        0.999999
    );
    assert.equal(result, 19);
});

test("applies a numeric weather multiplier to non-Struggle damage", () => {
    const result = calculate(
        createService(),
        createPokemon(),
        createPokemon(),
        createMove(),
        { forceCritical: false, weatherMultiplier: 2 },
        0.999999
    );
    assert.equal(result, 38);
});

test("floors damage after applying the weather multiplier", () => {
    const result = calculate(
        createService(),
        createPokemon(),
        createPokemon(),
        createMove(),
        { forceCritical: false, weatherMultiplier: 0.5 },
        0.999999
    );
    assert.equal(result, 9);
});

test("ignores a non-numeric weather multiplier", () => {
    const baseline = calculate(createService(), createPokemon(), createPokemon(), createMove(), { forceCritical: false }, 0.999999);
    const ignored = calculate(
        createService(),
        createPokemon(),
        createPokemon(),
        createMove(),
        { forceCritical: false, weatherMultiplier: "2" },
        0.999999
    );
    assert.equal(ignored, baseline);
});

test("normalizeType returns an empty string for missing values", () => {
    const service = createService();
    assert.equal(service.normalizeType(), "");
    assert.equal(service.normalizeType(null), "");
    assert.equal(service.normalizeType(""), "");
});

test("normalizeType strips the TYPE_ prefix and uppercases strings", () => {
    const service = createService();
    assert.equal(service.normalizeType("TYPE_FIRE"), "FIRE");
    assert.equal(service.normalizeType("water"), "WATER");
    assert.equal(service.normalizeType("TYPE_GRASS"), "GRASS");
});

test("normalizeType reads constant first for object-shaped types", () => {
    const service = createService();
    assert.equal(service.normalizeType({ constant: "TYPE_WATER", name: "FIRE" }), "WATER");
});

test("normalizeType falls back to object name", () => {
    assert.equal(createService().normalizeType({ name: "TYPE_GRASS" }), "GRASS");
});

test("normalizeType handles an object with no type fields", () => {
    assert.equal(createService().normalizeType({}), "");
});
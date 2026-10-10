"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const StatCalculationService =
    require("../scripts/services/stat-calculation-service");


const DEFAULT_BASE_STATS = {
    hp: 50,
    attack: 50,
    defense: 50,
    spAttack: 50,
    spDefense: 50,
    speed: 50
};


function createPokemon(overrides = {}) {
    return {
        level: 50,
        baseStats: {
            ...DEFAULT_BASE_STATS,
            ...(overrides.baseStats || {})
        },
        ivs: {
            ...(overrides.ivs || {})
        },
        evs: {
            ...(overrides.evs || {})
        },
        nature: "HARDY",
        status: null,
        ...overrides
    };
}

function createService(statStageService = null, abilityService = null) {
    return new StatCalculationService(
        statStageService,
        abilityService
    );
}


// -----------------------------------------------
// Constructor
// -----------------------------------------------

test("constructor creates a StatCalculationService instance", () => {
    assert.ok(createService() instanceof StatCalculationService);
});

test("constructor defaults the stat-stage service to null", () => {
    const service = createService();

    assert.equal(service.statStage, null);
});

test("constructor defaults the ability service to null", () => {
    const service = createService();

    assert.equal(service.ability, null);
});

test("constructor stores the injected stat-stage service", () => {
    const statStage = {
        getModifiedStat() {
            return 123;
        }
    };

    const service = createService(statStage);

    assert.equal(service.statStage, statStage);
});

test("constructor stores the injected ability service", () => {
    const ability = {
        modifyAttack(pokemon, value) {
            return value;
        }
    };

    const service = createService(null, ability);

    assert.equal(service.ability, ability);
});

test("constructor defines the Adamant nature modifier", () => {
    const service = createService();

    assert.deepEqual(service.natureModifiers.ADAMANT, {
        increase: "attack",
        decrease: "spAttack"
    });
});

test("constructor defines the Modest nature modifier", () => {
    const service = createService();

    assert.deepEqual(service.natureModifiers.MODEST, {
        increase: "spAttack",
        decrease: "attack"
    });
});

test("constructor defines the Jolly nature modifier", () => {
    const service = createService();

    assert.deepEqual(service.natureModifiers.JOLLY, {
        increase: "speed",
        decrease: "spAttack"
    });
});

test("constructor defines the Timid nature modifier", () => {
    const service = createService();

    assert.deepEqual(service.natureModifiers.TIMID, {
        increase: "speed",
        decrease: "attack"
    });
});

test("constructor defines the Bold nature modifier", () => {
    const service = createService();

    assert.deepEqual(service.natureModifiers.BOLD, {
        increase: "defense",
        decrease: "attack"
    });
});

test("constructor defines the Calm nature modifier", () => {
    const service = createService();

    assert.deepEqual(service.natureModifiers.CALM, {
        increase: "spDefense",
        decrease: "attack"
    });
});

test("constructor defines the Careful nature modifier", () => {
    const service = createService();

    assert.deepEqual(service.natureModifiers.CAREFUL, {
        increase: "spDefense",
        decrease: "spAttack"
    });
});

test("constructor defines the Impish nature modifier", () => {
    const service = createService();

    assert.deepEqual(service.natureModifiers.IMPISH, {
        increase: "defense",
        decrease: "spAttack"
    });
});

test("constructor defines exactly eight nature modifiers", () => {
    const service = createService();

    assert.equal(Object.keys(service.natureModifiers).length, 8);
});


// -----------------------------------------------
// getBaseStat
// -----------------------------------------------

test("getBaseStat reads a value from baseStats", () => {
    const service = createService();
    const pokemon = createPokemon({
        baseStats: { attack: 90 }
    });

    assert.equal(service.getBaseStat(pokemon, "attack"), 90);
});

test("getBaseStat reads HP from baseStats", () => {
    const service = createService();
    const pokemon = createPokemon({
        baseStats: { hp: 45 }
    });

    assert.equal(service.getBaseStat(pokemon, "hp"), 45);
});

test("getBaseStat supports the legacy baseAttack property", () => {
    const service = createService();

    assert.equal(
        service.getBaseStat({ baseAttack: 77 }, "attack"),
        77
    );
});

test("getBaseStat supports the legacy baseDefense property", () => {
    const service = createService();

    assert.equal(
        service.getBaseStat({ baseDefense: 62 }, "defense"),
        62
    );
});

test("getBaseStat supports the legacy baseSpAttack property", () => {
    const service = createService();

    assert.equal(
        service.getBaseStat({ baseSpAttack: 81 }, "spAttack"),
        81
    );
});

test("getBaseStat supports the legacy baseSpDefense property", () => {
    const service = createService();

    assert.equal(
        service.getBaseStat({ baseSpDefense: 70 }, "spDefense"),
        70
    );
});

test("getBaseStat supports the legacy baseSpeed property", () => {
    const service = createService();

    assert.equal(
        service.getBaseStat({ baseSpeed: 100 }, "speed"),
        100
    );
});

test("getBaseStat falls back to the legacy property when baseStats value is zero", () => {
    const service = createService();

    assert.equal(
        service.getBaseStat({
            baseStats: { attack: 0 },
            baseAttack: 75
        }, "attack"),
        75
    );
});

test("getBaseStat defaults a missing stat to one", () => {
    const service = createService();

    assert.equal(
        service.getBaseStat({}, "attack"),
        1
    );
});

test("getBaseStat defaults a zero base stat to one when no legacy value exists", () => {
    const service = createService();

    assert.equal(
        service.getBaseStat({
            baseStats: { attack: 0 }
        }, "attack"),
        1
    );
});

test("getBaseStat uses baseStats before the legacy property when both are truthy", () => {
    const service = createService();

    assert.equal(
        service.getBaseStat({
            baseStats: { attack: 65 },
            baseAttack: 90
        }, "attack"),
        65
    );
});


// -----------------------------------------------
// getIV
// -----------------------------------------------

test("getIV reads an IV from the ivs object", () => {
    const service = createService();
    const pokemon = createPokemon({
        ivs: { attack: 31 }
    });

    assert.equal(service.getIV(pokemon, "attack"), 31);
});

test("getIV returns zero when no IV is provided", () => {
    const service = createService();

    assert.equal(service.getIV({}, "attack"), 0);
});

test("getIV uses the scalar iv as a fallback", () => {
    const service = createService();

    assert.equal(
        service.getIV({ iv: 17 }, "speed"),
        17
    );
});

test("getIV prefers the individual IV over the scalar fallback", () => {
    const service = createService();

    assert.equal(
        service.getIV({
            ivs: { attack: 31 },
            iv: 10
        }, "attack"),
        31
    );
});

test("getIV preserves an individual IV of zero instead of using the fallback", () => {
    const service = createService();

    assert.equal(
        service.getIV({
            ivs: { attack: 0 },
            iv: 20
        }, "attack"),
        0
    );
});

test("getIV returns zero for an empty IV object", () => {
    const service = createService();

    assert.equal(
        service.getIV({ ivs: {} }, "defense"),
        0
    );
});


// -----------------------------------------------
// getEV
// -----------------------------------------------

test("getEV reads EVs from the evs object", () => {
    const service = createService();
    const pokemon = createPokemon({
        evs: { attack: 252 }
    });

    assert.equal(service.getEV(pokemon, "attack"), 252);
});

test("getEV returns zero when EVs are missing", () => {
    const service = createService();

    assert.equal(service.getEV({}, "attack"), 0);
});

test("getEV returns zero for an empty EV object", () => {
    const service = createService();

    assert.equal(
        service.getEV({ evs: {} }, "speed"),
        0
    );
});

test("getEV preserves an EV value of zero", () => {
    const service = createService();

    assert.equal(
        service.getEV({ evs: { defense: 0 } }, "defense"),
        0
    );
});


// -----------------------------------------------
// calculateHP
// -----------------------------------------------

test("calculateHP uses the expected base HP formula at level 50", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 50,
        baseStats: { hp: 50 },
        ivs: { hp: 0 },
        evs: { hp: 0 }
    });

    assert.equal(service.calculateHP(pokemon), 110);
});

test("calculateHP uses the expected base HP formula at level one", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 1,
        baseStats: { hp: 50 },
        ivs: { hp: 0 },
        evs: { hp: 0 }
    });

    assert.equal(service.calculateHP(pokemon), 12);
});

test("calculateHP includes IVs", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 50,
        baseStats: { hp: 50 },
        ivs: { hp: 31 },
        evs: { hp: 0 }
    });

    assert.equal(service.calculateHP(pokemon), 125);
});

test("calculateHP includes one quarter of EVs rounded down", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 50,
        baseStats: { hp: 50 },
        ivs: { hp: 0 },
        evs: { hp: 12 }
    });

    assert.equal(service.calculateHP(pokemon), 111);
});

test("calculateHP includes maximum listed EVs and IVs at level 100", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 100,
        baseStats: { hp: 50 },
        ivs: { hp: 31 },
        evs: { hp: 252 }
    });

    assert.equal(service.calculateHP(pokemon), 304);
});

test("calculateHP defaults a falsy level to one", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 0,
        baseStats: { hp: 50 }
    });

    assert.equal(service.calculateHP(pokemon), 12);
});

test("calculateHP uses the legacy baseHP property when needed", () => {
    const service = createService();

    assert.equal(
        service.calculateHP({
            level: 50,
            baseHp: 60,
            ivs: { hp: 0 },
            evs: { hp: 0 }
        }),
        120
    );
});

test("calculateHP floors the final value", () => {
    const service = createService();

    const result = service.calculateHP({
        level: 13,
        baseStats: { hp: 17 },
        ivs: { hp: 1 },
        evs: { hp: 3 }
    });

    assert.equal(result, 27);
});

test("calculateHP does not apply a nature modifier", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 50,
        nature: "ADAMANT",
        baseStats: { hp: 50 }
    });

    assert.equal(service.calculateHP(pokemon), 110);
});

test("calculateHP does not use stat-stage modifiers", () => {
    const statStage = {
        getModifiedStat() {
            throw new Error("HP should not use stat stages");
        }
    };

    const service = createService(statStage);
    const pokemon = createPokemon();

    assert.equal(service.calculateHP(pokemon), 110);
});


// -----------------------------------------------
// calculateStat
// -----------------------------------------------

test("calculateStat uses the normal stat formula at level 50", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 50,
        baseStats: { attack: 50 },
        ivs: { attack: 0 },
        evs: { attack: 0 }
    });

    assert.equal(service.calculateStat(pokemon, "attack"), 55);
});

test("calculateStat uses the normal stat formula at level one", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 1,
        baseStats: { attack: 50 },
        ivs: { attack: 0 },
        evs: { attack: 0 }
    });

    assert.equal(service.calculateStat(pokemon, "attack"), 6);
});

test("calculateStat includes IVs", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 50,
        baseStats: { attack: 50 },
        ivs: { attack: 31 },
        evs: { attack: 0 }
    });

    assert.equal(service.calculateStat(pokemon, "attack"), 70);
});

test("calculateStat includes EVs divided by four", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 50,
        baseStats: { attack: 50 },
        ivs: { attack: 0 },
        evs: { attack: 252 }
    });

    assert.equal(service.calculateStat(pokemon, "attack"), 86);
});

test("calculateStat floors EVs divided by four", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 50,
        baseStats: { attack: 50 },
        ivs: { attack: 0 },
        evs: { attack: 7 }
    });

    assert.equal(service.calculateStat(pokemon, "attack"), 55);
});

test("calculateStat includes IVs and EVs together", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 50,
        baseStats: { attack: 50 },
        ivs: { attack: 31 },
        evs: { attack: 252 }
    });

    assert.equal(service.calculateStat(pokemon, "attack"), 102);
});

test("calculateStat defaults a falsy level to one", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 0,
        baseStats: { attack: 50 }
    });

    assert.equal(service.calculateStat(pokemon, "attack"), 6);
});

test("calculateStat supports the legacy baseAttack property", () => {
    const service = createService();

    assert.equal(
        service.calculateStat({
            level: 50,
            baseAttack: 90
        }, "attack"),
        95
    );
});

test("calculateStat floors the base formula result", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 13,
        baseStats: { defense: 17 },
        ivs: { defense: 1 },
        evs: { defense: 3 }
    });

    assert.equal(service.calculateStat(pokemon, "defense"), 9);
});

test("calculateStat returns the neutral result for an unmodified nature", () => {
    const service = createService();
    const pokemon = createPokemon({
        nature: "HARDY"
    });

    assert.equal(service.calculateStat(pokemon, "attack"), 55);
});


// -----------------------------------------------
// calculateStats
// -----------------------------------------------

test("calculateStats returns all six calculated battle stats", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.deepEqual(service.calculateStats(pokemon), {
        hp: 110,
        attack: 55,
        defense: 55,
        spAttack: 55,
        spDefense: 55,
        speed: 55
    });
});

test("calculateStats uses the HP formula separately from other stats", () => {
    const service = createService();
    const pokemon = createPokemon({
        baseStats: {
            hp: 60,
            attack: 50
        }
    });

    const result = service.calculateStats(pokemon);

    assert.equal(result.hp, 120);
    assert.equal(result.attack, 55);
});

test("calculateStats includes stat-stage modifications in non-HP stats", () => {
    const statStage = {
        getModifiedStat(pokemon, stat, value) {
            return stat === "attack" ? value + 10 : value;
        }
    };

    const service = createService(statStage);
    const result = service.calculateStats(createPokemon());

    assert.equal(result.attack, 65);
    assert.equal(result.hp, 110);
    assert.equal(result.defense, 55);
});

test("calculateStats includes ability modifiers in eligible stats", () => {
    const ability = {
        modifyAttack(pokemon, value) {
            return value * 2;
        },
        modifySpeed(pokemon, value) {
            return value + 10;
        }
    };

    const service = createService(null, ability);
    const result = service.calculateStats(createPokemon());

    assert.equal(result.attack, 110);
    assert.equal(result.speed, 65);
    assert.equal(result.defense, 55);
    assert.equal(result.hp, 110);
});

test("calculateStats does not modify the input base stats", () => {
    const service = createService();
    const pokemon = createPokemon();
    const original = { ...pokemon.baseStats };

    service.calculateStats(pokemon);

    assert.deepEqual(pokemon.baseStats, original);
});


// -----------------------------------------------
// Nature modifiers
// -----------------------------------------------

const NATURE_CASES = [
    ["ADAMANT", "attack", 55, 60],
    ["ADAMANT", "spAttack", 55, 49],
    ["MODEST", "spAttack", 55, 60],
    ["MODEST", "attack", 55, 49],
    ["JOLLY", "speed", 55, 60],
    ["JOLLY", "spAttack", 55, 49],
    ["TIMID", "speed", 55, 60],
    ["TIMID", "attack", 55, 49],
    ["BOLD", "defense", 55, 60],
    ["BOLD", "attack", 55, 49],
    ["CALM", "spDefense", 55, 60],
    ["CALM", "attack", 55, 49],
    ["CAREFUL", "spDefense", 55, 60],
    ["CAREFUL", "spAttack", 55, 49],
    ["IMPISH", "defense", 55, 60],
    ["IMPISH", "spAttack", 55, 49]
];

for (const [nature, stat, value, expected] of NATURE_CASES) {
    test(`applyNature applies the ${nature} modifier to ${stat}`, () => {
        const service = createService();
        const pokemon = createPokemon({ nature });

        assert.equal(
            service.applyNature(pokemon, stat, value),
            expected
        );
    });
}

test("applyNature leaves unrelated stats unchanged", () => {
    const service = createService();
    const pokemon = createPokemon({ nature: "ADAMANT" });

    assert.equal(
        service.applyNature(pokemon, "defense", 55),
        55
    );
});

test("applyNature is case-insensitive for nature names", () => {
    const service = createService();
    const pokemon = createPokemon({ nature: "adamant" });

    assert.equal(
        service.applyNature(pokemon, "attack", 55),
        60
    );
});

test("applyNature leaves values unchanged when nature is missing", () => {
    const service = createService();

    assert.equal(
        service.applyNature({}, "attack", 55),
        55
    );
});

test("applyNature leaves values unchanged for an unlisted nature", () => {
    const service = createService();
    const pokemon = createPokemon({ nature: "HARDY" });

    assert.equal(
        service.applyNature(pokemon, "attack", 55),
        55
    );
});

test("applyNature floors the 10 percent increase", () => {
    const service = createService();
    const pokemon = createPokemon({ nature: "ADAMANT" });

    assert.equal(
        service.applyNature(pokemon, "attack", 59),
        64
    );
});

test("applyNature floors the 10 percent decrease", () => {
    const service = createService();
    const pokemon = createPokemon({ nature: "ADAMANT" });

    assert.equal(
        service.applyNature(pokemon, "spAttack", 59),
        53
    );
});

test("calculateStat applies a positive nature modifier", () => {
    const service = createService();
    const pokemon = createPokemon({ nature: "ADAMANT" });

    assert.equal(service.calculateStat(pokemon, "attack"), 60);
});

test("calculateStat applies a negative nature modifier", () => {
    const service = createService();
    const pokemon = createPokemon({ nature: "ADAMANT" });

    assert.equal(service.calculateStat(pokemon, "spAttack"), 49);
});

test("calculateStat applies nature before stat stages", () => {
    const calls = [];

    const statStage = {
        getModifiedStat(pokemon, stat, value) {
            calls.push({ stat, value });
            return value;
        }
    };

    const service = createService(statStage);
    const pokemon = createPokemon({ nature: "ADAMANT" });

    service.calculateStat(pokemon, "attack");

    assert.deepEqual(calls, [
        { stat: "attack", value: 60 }
    ]);
});


// -----------------------------------------------
// Stat-stage integration
// -----------------------------------------------

test("applyStage returns the value unchanged without a stat-stage service", () => {
    const service = createService();

    assert.equal(
        service.applyStage(createPokemon(), "attack", 55),
        55
    );
});

test("applyStage delegates to getModifiedStat when injected", () => {
    const calls = [];

    const statStage = {
        getModifiedStat(pokemon, stat, value) {
            calls.push({ pokemon, stat, value });
            return value + 20;
        }
    };

    const service = createService(statStage);
    const pokemon = createPokemon();

    assert.equal(
        service.applyStage(pokemon, "defense", 55),
        75
    );

    assert.deepEqual(calls, [
        { pokemon, stat: "defense", value: 55 }
    ]);
});

test("calculateStat applies the returned stat-stage value", () => {
    const statStage = {
        getModifiedStat(pokemon, stat, value) {
            return value * 2;
        }
    };

    const service = createService(statStage);

    assert.equal(
        service.calculateStat(createPokemon(), "attack"),
        110
    );
});

test("calculateStat applies a stage modification after nature", () => {
    const statStage = {
        getModifiedStat(pokemon, stat, value) {
            return value + 1;
        }
    };

    const service = createService(statStage);

    assert.equal(
        service.calculateStat(
            createPokemon({ nature: "ADAMANT" }),
            "attack"
        ),
        61
    );
});


// -----------------------------------------------
// Ability integration
// -----------------------------------------------

test("applyAbility returns the value unchanged without an ability service", () => {
    const service = createService();

    assert.equal(
        service.applyAbility(createPokemon(), "attack", 55),
        55
    );
});

test("applyAbility delegates attack to modifyAttack", () => {
    const calls = [];

    const ability = {
        modifyAttack(pokemon, value) {
            calls.push({ pokemon, value });
            return value * 2;
        }
    };

    const service = createService(null, ability);
    const pokemon = createPokemon();

    assert.equal(
        service.applyAbility(pokemon, "attack", 55),
        110
    );

    assert.deepEqual(calls, [
        { pokemon, value: 55 }
    ]);
});

test("applyAbility delegates speed to modifySpeed", () => {
    const calls = [];

    const ability = {
        modifySpeed(pokemon, value) {
            calls.push({ pokemon, value });
            return value + 15;
        }
    };

    const service = createService(null, ability);
    const pokemon = createPokemon();

    assert.equal(
        service.applyAbility(pokemon, "speed", 55),
        70
    );

    assert.deepEqual(calls, [
        { pokemon, value: 55 }
    ]);
});

test("applyAbility does not call modifyAttack for defense", () => {
    let called = false;

    const ability = {
        modifyAttack() {
            called = true;
            return 999;
        }
    };

    const service = createService(null, ability);

    assert.equal(
        service.applyAbility(createPokemon(), "defense", 55),
        55
    );
    assert.equal(called, false);
});

test("applyAbility does not call modifySpeed for attack", () => {
    let called = false;

    const ability = {
        modifySpeed() {
            called = true;
            return 999;
        }
    };

    const service = createService(null, ability);

    assert.equal(
        service.applyAbility(createPokemon(), "attack", 55),
        55
    );
    assert.equal(called, false);
});

test("applyAbility leaves attack unchanged when modifyAttack is missing", () => {
    const service = createService(null, {});

    assert.equal(
        service.applyAbility(createPokemon(), "attack", 55),
        55
    );
});

test("applyAbility leaves speed unchanged when modifySpeed is missing", () => {
    const service = createService(null, {});

    assert.equal(
        service.applyAbility(createPokemon(), "speed", 55),
        55
    );
});

test("calculateStat applies an ability modifier after stages", () => {
    const calls = [];

    const statStage = {
        getModifiedStat(pokemon, stat, value) {
            calls.push("stage");
            return value + 10;
        }
    };

    const ability = {
        modifyAttack(pokemon, value) {
            calls.push("ability");
            return value * 2;
        }
    };

    const service = createService(statStage, ability);

    assert.equal(
        service.calculateStat(createPokemon(), "attack"),
        130
    );

    assert.deepEqual(calls, ["stage", "ability"]);
});


// -----------------------------------------------
// Speed and paralysis
// -----------------------------------------------

test("calculateSpeed returns the normal calculated speed without paralysis", () => {
    const service = createService();

    assert.equal(
        service.calculateSpeed(createPokemon()),
        55
    );
});

test("calculateSpeed quarters speed under paralysis", () => {
    const service = createService();
    const pokemon = createPokemon({
        baseStats: { speed: 100 },
        status: "PARALYSIS"
    });

    assert.equal(service.calculateSpeed(pokemon), 26);
});

test("calculateSpeed floors the paralysed speed", () => {
    const service = createService();
    const pokemon = createPokemon({
        level: 1,
        baseStats: { speed: 50 },
        status: "PARALYSIS"
    });

    assert.equal(service.calculateSpeed(pokemon), 1);
});

test("calculateSpeed does not apply the paralysis penalty to other statuses", () => {
    const service = createService();
    const pokemon = createPokemon({
        status: "BURN"
    });

    assert.equal(service.calculateSpeed(pokemon), 55);
});

test("calculateSpeed checks the exact PARALYSIS status value", () => {
    const service = createService();
    const pokemon = createPokemon({
        status: "paralysis"
    });

    assert.equal(service.calculateSpeed(pokemon), 55);
});

test("calculateSpeed applies speed nature before paralysis", () => {
    const service = createService();
    const pokemon = createPokemon({
        nature: "JOLLY",
        status: "PARALYSIS"
    });

    assert.equal(service.calculateSpeed(pokemon), 15);
});

test("calculateSpeed applies speed ability modifiers before paralysis", () => {
    const ability = {
        modifySpeed(pokemon, value) {
            return value * 2;
        }
    };

    const service = createService(null, ability);
    const pokemon = createPokemon({
        status: "PARALYSIS"
    });

    assert.equal(service.calculateSpeed(pokemon), 27);
});

test("calculateSpeed passes the Pokémon into the ability modifier", () => {
    let receivedPokemon;

    const ability = {
        modifySpeed(pokemon, value) {
            receivedPokemon = pokemon;
            return value;
        }
    };

    const service = createService(null, ability);
    const pokemon = createPokemon();

    service.calculateSpeed(pokemon);

    assert.equal(receivedPokemon, pokemon);
});


// -----------------------------------------------
// compareSpeed
// -----------------------------------------------

test("compareSpeed returns the first Pokémon when it is faster", () => {
    const service = createService();
    const faster = createPokemon({
        baseStats: { speed: 100 }
    });
    const slower = createPokemon({
        baseStats: { speed: 50 }
    });

    assert.equal(service.compareSpeed(faster, slower), faster);
});

test("compareSpeed returns the second Pokémon when it is faster", () => {
    const service = createService();
    const slower = createPokemon({
        baseStats: { speed: 50 }
    });
    const faster = createPokemon({
        baseStats: { speed: 100 }
    });

    assert.equal(service.compareSpeed(slower, faster), faster);
});

test("compareSpeed returns null when speeds are equal", () => {
    const service = createService();
    const first = createPokemon();
    const second = createPokemon();

    assert.equal(service.compareSpeed(first, second), null);
});

test("compareSpeed considers paralysis when comparing speed", () => {
    const service = createService();
    const paralysed = createPokemon({
        baseStats: { speed: 100 },
        status: "PARALYSIS"
    });
    const unstatused = createPokemon({
        baseStats: { speed: 50 }
    });

    assert.equal(
        service.compareSpeed(paralysed, unstatused),
        unstatused
    );
});

test("compareSpeed considers nature modifiers", () => {
    const service = createService();
    const jolly = createPokemon({
        nature: "JOLLY",
        baseStats: { speed: 50 }
    });
    const neutral = createPokemon({
        baseStats: { speed: 54 }
    });

    assert.equal(service.compareSpeed(jolly, neutral), jolly);
});

test("compareSpeed considers ability speed modifiers", () => {
    const ability = {
        modifySpeed(pokemon, value) {
            return pokemon.boostSpeed ? value * 2 : value;
        }
    };

    const service = createService(null, ability);
    const boosted = createPokemon({
        baseStats: { speed: 40 },
        boostSpeed: true
    });
    const fasterBase = createPokemon({
        baseStats: { speed: 60 }
    });

    assert.equal(service.compareSpeed(boosted, fasterBase), boosted);
});

test("compareSpeed returns the original Pokémon object rather than a stat summary", () => {
    const service = createService();
    const first = createPokemon({
        baseStats: { speed: 100 }
    });
    const second = createPokemon({
        baseStats: { speed: 50 }
    });

    const result = service.compareSpeed(first, second);

    assert.equal(result, first);
    assert.equal(result.baseStats.speed, 100);
});

test("compareSpeed returns null when paralysis makes speeds equal", () => {
    const service = createService();
    const paralysed = createPokemon({
        baseStats: { speed: 100 },
        status: "PARALYSIS"
    });
    const other = createPokemon({
        baseStats: { speed: 21 }
    });

    assert.equal(service.compareSpeed(paralysed, other), null);
});


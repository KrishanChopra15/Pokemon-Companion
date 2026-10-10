"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const PokemonStatProviderService = require(
    "../scripts/services/pokemon-stat-provider-service"
);

const STAT_KEYS = [
    "hp",
    "attack",
    "defense",
    "spAttack",
    "spDefense",
    "speed"
];

const MAX_IVS = {
    hp: 31,
    attack: 31,
    defense: 31,
    spAttack: 31,
    spDefense: 31,
    speed: 31
};

const MIN_IVS = {
    hp: 0,
    attack: 0,
    defense: 0,
    spAttack: 0,
    spDefense: 0,
    speed: 0
};

const MAX_EVS = {
    hp: 252,
    attack: 252,
    defense: 252,
    spAttack: 252,
    spDefense: 252,
    speed: 252
};

const MIN_EVS = {
    hp: 0,
    attack: 0,
    defense: 0,
    spAttack: 0,
    spDefense: 0,
    speed: 0
};

function createService(statCalculationService = null) {
    return new PokemonStatProviderService(statCalculationService);
}

function createPokemon(overrides = {}) {
    return {
        name: "BULBASAUR",
        level: 20,
        category: "PHYSICAL",
        ...overrides
    };
}

// Temporarily replace Math.random for deterministic tests.
function withMockRandom(values, callback) {
    const originalRandom = Math.random;
    let index = 0;

    Math.random = () => {
        const value = values[Math.min(index, values.length - 1)];
        index += 1;
        return value;
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

test("constructor creates a PokemonStatProviderService instance", () => {
    assert.ok(
        createService() instanceof PokemonStatProviderService
    );
});

test("constructor defaults stat calculation service to null", () => {
    const service = createService();

    assert.equal(service.statCalculation, null);
});

test("constructor stores the injected stat calculation service", () => {
    const calculator = {
        calculateStats() {
            return {};
        }
    };

    const service = createService(calculator);

    assert.strictEqual(service.statCalculation, calculator);
});

test("constructor preserves the injected calculator reference", () => {
    const calculator = {
        calculateStats() {
            return { hp: 100 };
        }
    };

    assert.strictEqual(
        createService(calculator).statCalculation,
        calculator
    );
});

// --------------------------------------------------
// getBattleStats()
// --------------------------------------------------

test("getBattleStats defaults to EXACT mode", () => {
    const service = createService();
    const pokemon = createPokemon({
        ivs: MAX_IVS,
        evs: MIN_EVS,
        nature: "JOLLY"
    });

    const result = service.getBattleStats(pokemon);

    assert.strictEqual(result.ivs, pokemon.ivs);
    assert.strictEqual(result.evs, pokemon.evs);
    assert.equal(result.nature, "JOLLY");
});

test("getBattleStats returns prepared data when no calculator exists", () => {
    const service = createService();

    const result = service.getBattleStats(createPokemon());

    assert.equal(result.name, "BULBASAUR");
    assert.ok(result.ivs);
    assert.ok(result.evs);
    assert.equal(result.nature, "HARDY");
});

test("getBattleStats preserves Pokémon fields in the result", () => {
    const service = createService();

    const result = service.getBattleStats(
        createPokemon({
            name: "CHARMANDER",
            level: 35,
            customField: "preserved"
        })
    );

    assert.equal(result.name, "CHARMANDER");
    assert.equal(result.level, 35);
    assert.equal(result.customField, "preserved");
});

test("getBattleStats does not mutate the original Pokémon object", () => {
    const service = createService();
    const pokemon = createPokemon({
        ivs: { hp: 20 },
        evs: { attack: 40 }
    });
    const original = { ...pokemon };

    service.getBattleStats(pokemon);

    assert.deepEqual(pokemon, original);
});

test("getBattleStats passes the prepared data to the calculator", () => {
    let received;

    const calculator = {
        calculateStats(prepared) {
            received = prepared;
            return {};
        }
    };

    const service = createService(calculator);
    const pokemon = createPokemon({
        ivs: MAX_IVS,
        evs: MIN_EVS
    });

    const result = service.getBattleStats(pokemon);

    assert.ok(received);
    assert.equal(received.name, "BULBASAUR");
    assert.strictEqual(result.ivs, pokemon.ivs);
});

test("getBattleStats merges calculated stats into prepared data", () => {
    const calculator = {
        calculateStats() {
            return {
                calculated: true,
                hp: 123,
                attack: 95
            };
        }
    };

    const service = createService(calculator);
    const result = service.getBattleStats(createPokemon());

    assert.equal(result.calculated, true);
    assert.equal(result.hp, 123);
    assert.equal(result.attack, 95);
    assert.equal(result.name, "BULBASAUR");
});

test("getBattleStats lets calculated values overwrite prepared fields", () => {
    const calculator = {
        calculateStats() {
            return {
                name: "CALCULATED_NAME",
                level: 99,
                nature: "MODEST"
            };
        }
    };

    const result = createService(calculator).getBattleStats(
        createPokemon({
            name: "BULBASAUR",
            level: 20,
            nature: "ADAMANT"
        })
    );

    assert.equal(result.name, "CALCULATED_NAME");
    assert.equal(result.level, 99);
    assert.equal(result.nature, "MODEST");
});

test("getBattleStats preserves prepared fields not overwritten by calculator", () => {
    const calculator = {
        calculateStats() {
            return { hp: 200 };
        }
    };

    const result = createService(calculator).getBattleStats(
        createPokemon({
            name: "SQUIRTLE",
            level: 15,
            nature: "CALM"
        })
    );

    assert.equal(result.name, "SQUIRTLE");
    assert.equal(result.level, 15);
    assert.equal(result.nature, "CALM");
    assert.equal(result.hp, 200);
});

test("getBattleStats calls calculateStats once per call", () => {
    let calls = 0;

    const calculator = {
        calculateStats() {
            calls += 1;
            return {};
        }
    };

    const service = createService(calculator);

    service.getBattleStats(createPokemon());

    assert.equal(calls, 1);
});

test("getBattleStats does not call a calculator when none is configured", () => {
    const service = createService();

    assert.equal(service.statCalculation, null);

    const result = service.getBattleStats(createPokemon());

    assert.ok(result.ivs);
});

test("getBattleStats forwards the requested mode to stat preparation", () => {
    const service = createService();

    const result = service.getBattleStats(
        createPokemon(),
        "WORST_CASE"
    );

    assert.deepEqual(result.ivs, MIN_IVS);
    assert.deepEqual(result.evs, MIN_EVS);
    assert.equal(result.nature, "HARDY");
});

test("getBattleStats returns calculated values alongside prepared data", () => {
    const calculator = {
        calculateStats(prepared) {
            return {
                finalStats: {
                    hp: prepared.level * 5
                }
            };
        }
    };

    const result = createService(calculator).getBattleStats(
        createPokemon({ level: 20 })
    );

    assert.equal(result.finalStats.hp, 100);
    assert.equal(result.name, "BULBASAUR");
});

// --------------------------------------------------
// resolveStatData(): shared behavior
// --------------------------------------------------

test("resolveStatData preserves original Pokémon properties", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({
            heldItem: "LEFTOVERS",
            status: "BURN"
        }),
        "WORST_CASE"
    );

    assert.equal(result.name, "BULBASAUR");
    assert.equal(result.heldItem, "LEFTOVERS");
    assert.equal(result.status, "BURN");
});

test("resolveStatData defaults a missing nature to HARDY", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({ nature: undefined }),
        "WORST_CASE"
    );

    assert.equal(result.nature, "HARDY");
});

test("resolveStatData defaults an empty nature to HARDY initially", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({ nature: "" }),
        "EXACT"
    );

    assert.equal(result.nature, "HARDY");
});

test("resolveStatData preserves a supplied nature in EXACT mode", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({
            nature: "JOLLY",
            ivs: MAX_IVS,
            evs: MIN_EVS
        }),
        "EXACT"
    );

    assert.equal(result.nature, "JOLLY");
});

test("resolveStatData preserves a supplied nature in an unrecognized mode", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({ nature: "TIMID" }),
        "UNRECOGNIZED"
    );

    assert.equal(result.nature, "TIMID");
});

test("resolveStatData initializes IVs and EVs as objects", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon(),
        "UNRECOGNIZED"
    );

    assert.deepEqual(result.ivs, {});
    assert.deepEqual(result.evs, {});
});

test("resolveStatData does not overwrite unrelated Pokémon fields", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({
            ability: "OVERGROW",
            experience: 500
        }),
        "WORST_CASE"
    );

    assert.equal(result.ability, "OVERGROW");
    assert.equal(result.experience, 500);
});

test("resolveStatData returns a new top-level object", () => {
    const service = createService();
    const pokemon = createPokemon();

    const result = service.resolveStatData(pokemon, "WORST_CASE");

    assert.notStrictEqual(result, pokemon);
});

test("resolveStatData does not modify the input object's nature", () => {
    const service = createService();
    const pokemon = createPokemon({ nature: "CALM" });

    service.resolveStatData(pokemon, "BEST_CASE");

    assert.equal(pokemon.nature, "CALM");
});

// --------------------------------------------------
// EXACT mode
// --------------------------------------------------

test("EXACT mode preserves supplied IVs", () => {
    const service = createService();
    const ivs = { hp: 31, attack: 20 };

    const result = service.resolveStatData(
        createPokemon({ ivs }),
        "EXACT"
    );

    assert.strictEqual(result.ivs, ivs);
});

test("EXACT mode preserves supplied EVs", () => {
    const service = createService();
    const evs = { hp: 100, speed: 80 };

    const result = service.resolveStatData(
        createPokemon({ evs }),
        "EXACT"
    );

    assert.strictEqual(result.evs, evs);
});

test("EXACT mode generates IVs when IVs are missing", () => {
    const service = createService();

    const result = withMockRandom([0], () =>
        service.resolveStatData(
            createPokemon({ ivs: undefined }),
            "EXACT"
        )
    );

    assert.deepEqual(result.ivs, MIN_IVS);
});

test("EXACT mode generates EVs when EVs are missing", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({ evs: undefined }),
        "EXACT"
    );

    assert.deepEqual(result.evs, MIN_EVS);
});

test("EXACT mode generates IVs when IVs are null", () => {
    const service = createService();

    const result = withMockRandom([0], () =>
        service.resolveStatData(
            createPokemon({ ivs: null }),
            "EXACT"
        )
    );

    assert.deepEqual(result.ivs, MIN_IVS);
});

test("EXACT mode generates EVs when EVs are null", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({ evs: null }),
        "EXACT"
    );

    assert.deepEqual(result.evs, MIN_EVS);
});

test("EXACT mode preserves empty IV and EV objects", () => {
    const service = createService();
    const ivs = {};
    const evs = {};

    const result = service.resolveStatData(
        createPokemon({ ivs, evs }),
        "EXACT"
    );

    assert.strictEqual(result.ivs, ivs);
    assert.strictEqual(result.evs, evs);
});

test("EXACT mode preserves explicitly supplied zero-valued stats", () => {
    const service = createService();
    const ivs = { hp: 0 };
    const evs = { attack: 0 };

    const result = service.resolveStatData(
        createPokemon({ ivs, evs }),
        "EXACT"
    );

    assert.equal(result.ivs.hp, 0);
    assert.equal(result.evs.attack, 0);
});

// --------------------------------------------------
// BEST_CASE mode
// --------------------------------------------------

test("BEST_CASE mode assigns maximum IVs", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon(),
        "BEST_CASE"
    );

    assert.deepEqual(result.ivs, MAX_IVS);
});

test("BEST_CASE mode assigns maximum EVs to every stat", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon(),
        "BEST_CASE"
    );

    assert.deepEqual(result.evs, MAX_EVS);
});

test("BEST_CASE mode chooses ADAMANT for a physical category", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({ category: "PHYSICAL" }),
        "BEST_CASE"
    );

    assert.equal(result.nature, "ADAMANT");
});

test("BEST_CASE mode chooses MODEST for a special category", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({ category: "SPECIAL" }),
        "BEST_CASE"
    );

    assert.equal(result.nature, "MODEST");
});

test("BEST_CASE mode ignores existing IVs", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({ ivs: MIN_IVS }),
        "BEST_CASE"
    );

    assert.deepEqual(result.ivs, MAX_IVS);
});

test("BEST_CASE mode ignores existing EVs", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({ evs: MIN_EVS }),
        "BEST_CASE"
    );

    assert.deepEqual(result.evs, MAX_EVS);
});

test("BEST_CASE mode replaces the supplied nature", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({
            nature: "TIMID",
            category: "PHYSICAL"
        }),
        "BEST_CASE"
    );

    assert.equal(result.nature, "ADAMANT");
});

// --------------------------------------------------
// WORST_CASE mode
// --------------------------------------------------

test("WORST_CASE mode assigns minimum IVs", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon(),
        "WORST_CASE"
    );

    assert.deepEqual(result.ivs, MIN_IVS);
});

test("WORST_CASE mode assigns minimum EVs", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon(),
        "WORST_CASE"
    );

    assert.deepEqual(result.evs, MIN_EVS);
});

test("WORST_CASE mode forces HARDY nature", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({ nature: "MODEST" }),
        "WORST_CASE"
    );

    assert.equal(result.nature, "HARDY");
});

test("WORST_CASE mode ignores existing IVs and EVs", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({
            ivs: MAX_IVS,
            evs: MAX_EVS
        }),
        "WORST_CASE"
    );

    assert.deepEqual(result.ivs, MIN_IVS);
    assert.deepEqual(result.evs, MIN_EVS);
});

// --------------------------------------------------
// RANDOM mode
// --------------------------------------------------

test("RANDOM mode generates one IV for every stat", () => {
    const service = createService();

    const result = withMockRandom([0.5], () =>
        service.resolveStatData(
            createPokemon(),
            "RANDOM"
        )
    );

    assert.deepEqual(
        Object.keys(result.ivs).sort(),
        [...STAT_KEYS].sort()
    );
});

test("RANDOM mode generates IVs within the inclusive range zero to 31", () => {
    const service = createService();

    const result = withMockRandom([0.5], () =>
        service.resolveStatData(
            createPokemon(),
            "RANDOM"
        )
    );

    for (const key of STAT_KEYS) {
        assert.ok(result.ivs[key] >= 0 && result.ivs[key] <= 31);
        assert.equal(Number.isInteger(result.ivs[key]), true);
    }
});

test("RANDOM mode uses zero EVs", () => {
    const service = createService();

    const result = withMockRandom([0.5], () =>
        service.resolveStatData(
            createPokemon(),
            "RANDOM"
        )
    );

    assert.deepEqual(result.evs, MIN_EVS);
});

test("RANDOM mode chooses a nature from the supported list", () => {
    const service = createService();

    const allowed = [
        "ADAMANT",
        "MODEST",
        "JOLLY",
        "TIMID",
        "BOLD",
        "CALM",
        "CAREFUL",
        "IMPISH",
        "HARDY"
    ];

    const result = withMockRandom([0.5], () =>
        service.resolveStatData(
            createPokemon(),
            "RANDOM"
        )
    );

    assert.ok(allowed.includes(result.nature));
});

test("RANDOM mode ignores pre-existing IVs and EVs", () => {
    const service = createService();

    const result = withMockRandom([0.5], () =>
        service.resolveStatData(
            createPokemon({
                ivs: MAX_IVS,
                evs: MAX_EVS
            }),
            "RANDOM"
        )
    );

    assert.notStrictEqual(result.ivs, MAX_IVS);
    assert.deepEqual(result.evs, MIN_EVS);
});

test("RANDOM mode can generate the minimum IV value", () => {
    const service = createService();

    const ivs = withMockRandom([0], () =>
        service.randomIVs()
    );

    assert.deepEqual(ivs, MIN_IVS);
});

test("RANDOM mode can generate the maximum IV value", () => {
    const service = createService();

    const ivs = withMockRandom([0.999999], () =>
        service.randomIVs()
    );

    assert.deepEqual(ivs, MAX_IVS);
});

test("RANDOM mode generates different IV values from successive random inputs", () => {
    const service = createService();

    const ivs = withMockRandom(
        [0, 0.1, 0.2, 0.3, 0.4, 0.5],
        () => service.randomIVs()
    );

    assert.deepEqual(ivs, {
        hp: 0,
        attack: 3,
        defense: 6,
        spAttack: 9,
        spDefense: 12,
        speed: 16
    });
});

// --------------------------------------------------
// AVERAGE_CASE mode
// --------------------------------------------------

test("AVERAGE_CASE mode generates random IVs", () => {
    const service = createService();

    const result = withMockRandom([0.5], () =>
        service.resolveStatData(
            createPokemon(),
            "AVERAGE_CASE"
        )
    );

    assert.deepEqual(result.ivs, {
        hp: 16,
        attack: 16,
        defense: 16,
        spAttack: 16,
        spDefense: 16,
        speed: 16
    });
});

test("AVERAGE_CASE mode uses zero EVs", () => {
    const service = createService();

    const result = withMockRandom([0.5], () =>
        service.resolveStatData(
            createPokemon(),
            "AVERAGE_CASE"
        )
    );

    assert.deepEqual(result.evs, MIN_EVS);
});

test("AVERAGE_CASE mode forces HARDY nature", () => {
    const service = createService();

    const result = withMockRandom([0.5], () =>
        service.resolveStatData(
            createPokemon({ nature: "MODEST" }),
            "AVERAGE_CASE"
        )
    );

    assert.equal(result.nature, "HARDY");
});

test("AVERAGE_CASE mode ignores pre-existing IVs and EVs", () => {
    const service = createService();

    const result = withMockRandom([0.5], () =>
        service.resolveStatData(
            createPokemon({
                ivs: MAX_IVS,
                evs: MAX_EVS
            }),
            "AVERAGE_CASE"
        )
    );

    assert.notStrictEqual(result.ivs, MAX_IVS);
    assert.deepEqual(result.evs, MIN_EVS);
});

// --------------------------------------------------
// Unknown modes
// --------------------------------------------------

test("an unknown mode leaves IVs empty", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({ ivs: MAX_IVS }),
        "UNKNOWN"
    );

    assert.deepEqual(result.ivs, {});
});

test("an unknown mode leaves EVs empty", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({ evs: MAX_EVS }),
        "UNKNOWN"
    );

    assert.deepEqual(result.evs, {});
});

test("an unknown mode preserves the initial nature", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon({ nature: "BOLD" }),
        "UNKNOWN"
    );

    assert.equal(result.nature, "BOLD");
});

test("mode matching is case-sensitive", () => {
    const service = createService();

    const result = service.resolveStatData(
        createPokemon(),
        "best_case"
    );

    assert.deepEqual(result.ivs, {});
    assert.deepEqual(result.evs, {});
});

// --------------------------------------------------
// IV generators
// --------------------------------------------------

test("maxIVs returns all six stats at 31", () => {
    const service = createService();

    assert.deepEqual(service.maxIVs(), MAX_IVS);
});

test("minIVs returns all six stats at zero", () => {
    const service = createService();

    assert.deepEqual(service.minIVs(), MIN_IVS);
});

test("randomIVs returns all six required stat keys", () => {
    const service = createService();

    const result = withMockRandom([0.5], () =>
        service.randomIVs()
    );

    assert.deepEqual(
        Object.keys(result).sort(),
        [...STAT_KEYS].sort()
    );
});

test("defaultIVs delegates to random IV generation", () => {
    const service = createService();

    const result = withMockRandom([0.25], () =>
        service.defaultIVs()
    );

    assert.deepEqual(result, {
        hp: 8,
        attack: 8,
        defense: 8,
        spAttack: 8,
        spDefense: 8,
        speed: 8
    });
});

test("maxIVs returns a fresh object for each call", () => {
    const service = createService();

    assert.notStrictEqual(service.maxIVs(), service.maxIVs());
});

test("minIVs returns a fresh object for each call", () => {
    const service = createService();

    assert.notStrictEqual(service.minIVs(), service.minIVs());
});

// --------------------------------------------------
// EV generators
// --------------------------------------------------

test("maxEVs returns every stat at 252", () => {
    const service = createService();

    assert.deepEqual(service.maxEVs(), MAX_EVS);
});

test("minEVs returns every stat at zero", () => {
    const service = createService();

    assert.deepEqual(service.minEVs(), MIN_EVS);
});

test("defaultEVs returns minimum EVs", () => {
    const service = createService();

    assert.deepEqual(service.defaultEVs(), MIN_EVS);
});

test("maxEVs returns a fresh object for each call", () => {
    const service = createService();

    assert.notStrictEqual(service.maxEVs(), service.maxEVs());
});

test("minEVs returns a fresh object for each call", () => {
    const service = createService();

    assert.notStrictEqual(service.minEVs(), service.minEVs());
});

test("defaultEVs returns a fresh object for each call", () => {
    const service = createService();

    assert.notStrictEqual(service.defaultEVs(), service.defaultEVs());
});

// --------------------------------------------------
// Nature helpers
// --------------------------------------------------

test("bestNature returns MODEST for SPECIAL category", () => {
    const service = createService();

    assert.equal(
        service.bestNature({ category: "SPECIAL" }),
        "MODEST"
    );
});

test("bestNature returns ADAMANT for PHYSICAL category", () => {
    const service = createService();

    assert.equal(
        service.bestNature({ category: "PHYSICAL" }),
        "ADAMANT"
    );
});

test("bestNature returns ADAMANT when category is missing", () => {
    const service = createService();

    assert.equal(service.bestNature({}), "ADAMANT");
});

test("bestNature matching is case-sensitive", () => {
    const service = createService();

    assert.equal(
        service.bestNature({ category: "special" }),
        "ADAMANT"
    );
});

test("randomNature can select the first supported nature", () => {
    const service = createService();

    assert.equal(
        withMockRandom([0], () => service.randomNature()),
        "ADAMANT"
    );
});

test("randomNature can select the last supported nature", () => {
    const service = createService();

    assert.equal(
        withMockRandom([0.999999], () => service.randomNature()),
        "HARDY"
    );
});

test("randomNature can select every supported nature", () => {
    const service = createService();

    const expected = [
        "ADAMANT",
        "MODEST",
        "JOLLY",
        "TIMID",
        "BOLD",
        "CALM",
        "CAREFUL",
        "IMPISH",
        "HARDY"
    ];

    const actual = expected.map((nature, index) => {
        const randomValue = (index + 0.1) / expected.length;

        return withMockRandom(
            [randomValue],
            () => service.randomNature()
        );
    });

    assert.deepEqual(actual, expected);
});

// --------------------------------------------------
// random31()
// --------------------------------------------------

test("random31 returns zero when Math.random returns zero", () => {
    const service = createService();

    assert.equal(
        withMockRandom([0], () => service.random31()),
        0
    );
});

test("random31 returns 31 near the upper random boundary", () => {
    const service = createService();

    assert.equal(
        withMockRandom([0.999999], () => service.random31()),
        31
    );
});

test("random31 returns an integer", () => {
    const service = createService();

    const value = withMockRandom(
        [0.4321],
        () => service.random31()
    );

    assert.equal(Number.isInteger(value), true);
});

test("random31 remains within zero and 31 across sample values", () => {
    const service = createService();

    const samples = [
        0,
        0.01,
        0.1,
        0.25,
        0.5,
        0.75,
        0.9,
        0.999999
    ];

    const results = samples.map(value =>
        withMockRandom([value], () => service.random31())
    );

    for (const value of results) {
        assert.ok(value >= 0 && value <= 31);
        assert.equal(Number.isInteger(value), true);
    }
});

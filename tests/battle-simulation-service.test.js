"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const BattleSimulationService = require(
    "../scripts/services/battle-simulation-service"
);

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

function createPokemon(overrides = {}) {
    return {
        species: "Bulbasaur",
        level: 10,
        hp: 100,
        maxHP: 100,
        attack: 50,
        defense: 50,
        spAttack: 50,
        spDefense: 50,
        speed: 50,
        types: ["GRASS"],
        category: "PHYSICAL",
        ivs: {},
        evs: {},
        nature: "HARDY",
        status: null,
        statusData: null,
        moves: [
            {
                name: "TACKLE",
                type: "NORMAL",
                category: "PHYSICAL",
                power: 40,
                accuracy: 100,
                priority: 0
            }
        ],
        ...overrides
    };
}

function createBattle(playerOverrides = {}, opponentOverrides = {}) {
    return {
        player: {
            party: [
                createPokemon({
                    species: "PlayerMon",
                    types: ["FIRE"],
                    ...playerOverrides
                })
            ]
        },
        opponent: {
            party: [
                createPokemon({
                    species: "OpponentMon",
                    types: ["GRASS"],
                    ...opponentOverrides
                })
            ]
        }
    };
}

function createDeterministicSimulation({
    first = "PLAYER",
    playerDamage = 100,
    opponentDamage = 100
} = {}) {
    const service = new BattleSimulationService();

    service.chooseMove = (pokemon) => ({
        name: `${pokemon.species}_MOVE`,
        type: "NORMAL",
        category: "PHYSICAL",
        power: 40,
        priority: 0
    });

    service.determineFirstPokemon = () => first;

    service.calculateSimulationDamage = (attacker) => ({
        damage: attacker.species === "PlayerMon"
            ? playerDamage
            : opponentDamage,
        critical: false
    });

    return service;
}

// --------------------------------------------------
// Constructor and stat provider
// --------------------------------------------------

test("constructor stores the supplied service dependencies", () => {
    const statProvider = { getBattleStats() {} };
    const typeEffectiveness = { getMultiplier() {} };
    const statusEffect = { processTurn() {} };

    const service = new BattleSimulationService(
        statProvider,
        typeEffectiveness,
        statusEffect
    );

    assert.equal(service.statProvider, statProvider);
    assert.equal(service.typeEffectiveness, typeEffectiveness);
    assert.equal(service.statusEffect, statusEffect);
});

test("constructor defaults all dependencies to null", () => {
    const service = new BattleSimulationService();

    assert.equal(service.statProvider, null);
    assert.equal(service.typeEffectiveness, null);
    assert.equal(service.statusEffect, null);
});

test("getSimulationStats returns the original Pokémon without a provider", () => {
    const service = new BattleSimulationService();
    const pokemon = createPokemon();

    assert.equal(service.getSimulationStats(pokemon), pokemon);
});

test("getSimulationStats delegates to the stat provider", () => {
    const pokemon = createPokemon();
    const result = { ...pokemon, hp: 120 };
    const calls = [];

    const provider = {
        getBattleStats(receivedPokemon, mode) {
            calls.push({ receivedPokemon, mode });
            return result;
        }
    };

    const service = new BattleSimulationService(provider);
    const actual = service.getSimulationStats(pokemon, "EXACT");

    assert.equal(actual, result);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].receivedPokemon, pokemon);
    assert.equal(calls[0].mode, "EXACT");
});

test("getSimulationStats defaults to RANDOM mode", () => {
    let receivedMode;

    const service = new BattleSimulationService({
        getBattleStats(pokemon, mode) {
            receivedMode = mode;
            return pokemon;
        }
    });

    const pokemon = createPokemon();

    service.getSimulationStats(pokemon);

    assert.equal(receivedMode, "RANDOM");
});

// --------------------------------------------------
// Scenario generation
// --------------------------------------------------

test("generateScenarios returns one EXACT scenario", () => {
    const service = new BattleSimulationService();
    const pokemon = createPokemon();

    const scenarios = service.generateScenarios(pokemon, "EXACT");

    assert.equal(scenarios.length, 1);
    assert.equal(scenarios[0], pokemon);
});

test("generateScenarios returns one BEST_CASE scenario", () => {
    const service = new BattleSimulationService();
    const pokemon = createPokemon();

    const scenarios = service.generateScenarios(pokemon, "BEST_CASE");

    assert.equal(scenarios.length, 1);
    assert.equal(scenarios[0].nature, "ADAMANT");
});

test("generateScenarios returns one WORST_CASE scenario", () => {
    const service = new BattleSimulationService();
    const pokemon = createPokemon();

    const scenarios = service.generateScenarios(pokemon, "WORST_CASE");

    assert.equal(scenarios.length, 1);
    assert.equal(scenarios[0].nature, "HARDY");
});

test("generateScenarios creates three RANDOM scenarios", () => {
    const service = new BattleSimulationService();
    const pokemon = createPokemon();

    const scenarios = withMockedRandom([0], () =>
        service.generateScenarios(pokemon, "RANDOM")
    );

    assert.equal(scenarios.length, 3);
});

test("generateScenarios returns an empty array for an unknown mode", () => {
    const service = new BattleSimulationService();

    assert.deepEqual(
        service.generateScenarios(createPokemon(), "UNKNOWN"),
        []
    );
});

test("exact requests EXACT stats from the provider", () => {
    let receivedMode;

    const service = new BattleSimulationService({
        getBattleStats(pokemon, mode) {
            receivedMode = mode;
            return pokemon;
        }
    });

    const pokemon = createPokemon();

    assert.equal(service.exact(pokemon), pokemon);
    assert.equal(receivedMode, "EXACT");
});

test("random requests RANDOM stats from the provider", () => {
    let receivedMode;

    const service = new BattleSimulationService({
        getBattleStats(pokemon, mode) {
            receivedMode = mode;
            return pokemon;
        }
    });

    withMockedRandom([0], () => service.random(createPokemon()));

    assert.equal(receivedMode, "RANDOM");
});

test("bestCase requests BEST_CASE stats from the provider", () => {
    let receivedMode;

    const service = new BattleSimulationService({
        getBattleStats(pokemon, mode) {
            receivedMode = mode;
            return pokemon;
        }
    });

    service.bestCase(createPokemon());

    assert.equal(receivedMode, "BEST_CASE");
});

test("worstCase requests WORST_CASE stats from the provider", () => {
    let receivedMode;

    const service = new BattleSimulationService({
        getBattleStats(pokemon, mode) {
            receivedMode = mode;
            return pokemon;
        }
    });

    service.worstCase(createPokemon());

    assert.equal(receivedMode, "WORST_CASE");
});

test("random creates a copy instead of replacing the original Pokémon", () => {
    const service = new BattleSimulationService();
    const pokemon = createPokemon({
        ivs: { hp: 5 },
        evs: { attack: 20 },
        nature: "HARDY"
    });

    const result = withMockedRandom([0], () => service.random(pokemon));

    assert.notEqual(result, pokemon);
    assert.deepEqual(pokemon.ivs, { hp: 5 });
    assert.deepEqual(pokemon.evs, { attack: 20 });
    assert.equal(pokemon.nature, "HARDY");
});

test("random assigns generated IVs, EVs, and a nature", () => {
    const service = new BattleSimulationService();
    const pokemon = createPokemon();

    const result = withMockedRandom([0], () => service.random(pokemon));

    assert.deepEqual(result.ivs, service.zeroIVs());
    assert.deepEqual(result.evs, service.zeroEVs());
    assert.equal(result.nature, "ADAMANT");
});

// --------------------------------------------------
// IV generation
// --------------------------------------------------

test("generateRandomIVs creates all six IV fields", () => {
    const service = new BattleSimulationService();

    const ivs = withMockedRandom([0], () =>
        service.generateRandomIVs()
    );

    assert.deepEqual(Object.keys(ivs), [
        "hp",
        "attack",
        "defense",
        "spAttack",
        "spDefense",
        "speed"
    ]);
});

test("generateRandomIVs respects the minimum of zero", () => {
    const service = new BattleSimulationService();

    const ivs = withMockedRandom([0], () =>
        service.generateRandomIVs()
    );

    for (const value of Object.values(ivs)) {
        assert.equal(value, 0);
    }
});

test("generateRandomIVs respects the maximum of 31", () => {
    const service = new BattleSimulationService();

    const ivs = withMockedRandom([0.9999], () =>
        service.generateRandomIVs()
    );

    for (const value of Object.values(ivs)) {
        assert.equal(value, 31);
    }
});

test("maxIVs returns 31 for every IV", () => {
    const service = new BattleSimulationService();

    assert.deepEqual(service.maxIVs(), {
        hp: 31,
        attack: 31,
        defense: 31,
        spAttack: 31,
        spDefense: 31,
        speed: 31
    });
});

test("maxIVs returns a fresh object on every call", () => {
    const service = new BattleSimulationService();

    assert.notEqual(service.maxIVs(), service.maxIVs());
});

test("zeroIVs returns zero for every IV", () => {
    const service = new BattleSimulationService();

    assert.deepEqual(service.zeroIVs(), {
        hp: 0,
        attack: 0,
        defense: 0,
        spAttack: 0,
        spDefense: 0,
        speed: 0
    });
});

test("zeroIVs returns a fresh object on every call", () => {
    const service = new BattleSimulationService();

    assert.notEqual(service.zeroIVs(), service.zeroIVs());
});

// --------------------------------------------------
// EV generation and spreads
// --------------------------------------------------

test("generateRandomEVs creates all six EV fields", () => {
    const service = new BattleSimulationService();

    const evs = withMockedRandom([0], () =>
        service.generateRandomEVs()
    );

    assert.deepEqual(Object.keys(evs), [
        "hp",
        "attack",
        "defense",
        "spAttack",
        "spDefense",
        "speed"
    ]);
});

test("generateRandomEVs never exceeds 252 EVs in a stat", () => {
    const service = new BattleSimulationService();

    const evs = withMockedRandom([0.9999], () =>
        service.generateRandomEVs()
    );

    for (const value of Object.values(evs)) {
        assert.ok(value >= 0);
        assert.ok(value <= 252);
    }
});

test("generateRandomEVs does not exceed the 510 EV total", () => {
    const service = new BattleSimulationService();

    const evs = withMockedRandom([0.9999], () =>
        service.generateRandomEVs()
    );

    const total = Object.values(evs).reduce(
        (sum, value) => sum + value,
        0
    );

    assert.ok(total <= 510);
    assert.equal(total, 510);
});

test("generateRandomEVs can generate zero EVs", () => {
    const service = new BattleSimulationService();

    const evs = withMockedRandom([0], () =>
        service.generateRandomEVs()
    );

    for (const value of Object.values(evs)) {
        assert.equal(value, 0);
    }
});

test("maxPhysicalEVs returns the physical spread", () => {
    const service = new BattleSimulationService();

    assert.deepEqual(service.maxPhysicalEVs(), {
        hp: 0,
        attack: 252,
        defense: 0,
        spAttack: 0,
        spDefense: 4,
        speed: 252
    });
});

test("maxSpecialEVs returns the special spread", () => {
    const service = new BattleSimulationService();

    assert.deepEqual(service.maxSpecialEVs(), {
        hp: 0,
        attack: 0,
        defense: 0,
        spAttack: 252,
        spDefense: 4,
        speed: 252
    });
});

test("getBestEVSpread selects the physical spread by default", () => {
    const service = new BattleSimulationService();

    assert.deepEqual(
        service.getBestEVSpread(createPokemon({ category: "PHYSICAL" })),
        service.maxPhysicalEVs()
    );
});

test("getBestEVSpread selects the special spread for SPECIAL Pokémon", () => {
    const service = new BattleSimulationService();

    assert.deepEqual(
        service.getBestEVSpread(createPokemon({ category: "SPECIAL" })),
        service.maxSpecialEVs()
    );
});

test("zeroEVs returns zero for all EV fields", () => {
    const service = new BattleSimulationService();

    assert.deepEqual(service.zeroEVs(), {
        hp: 0,
        attack: 0,
        defense: 0,
        spAttack: 0,
        spDefense: 0,
        speed: 0
    });
});

// --------------------------------------------------
// Nature selection and random numbers
// --------------------------------------------------

test("bestNature selects MODEST for SPECIAL Pokémon", () => {
    const service = new BattleSimulationService();

    assert.equal(
        service.bestNature(createPokemon({ category: "SPECIAL" })),
        "MODEST"
    );
});

test("bestNature selects ADAMANT for other Pokémon", () => {
    const service = new BattleSimulationService();

    assert.equal(
        service.bestNature(createPokemon({ category: "PHYSICAL" })),
        "ADAMANT"
    );
});

test("bestCase uses maximum IVs and the selected EV spread", () => {
    const service = new BattleSimulationService();

    const result = service.bestCase(
        createPokemon({ category: "PHYSICAL" })
    );

    assert.deepEqual(result.ivs, service.maxIVs());
    assert.deepEqual(result.evs, service.maxPhysicalEVs());
    assert.equal(result.nature, "ADAMANT");
});

test("bestCase selects MODEST for SPECIAL Pokémon", () => {
    const service = new BattleSimulationService();

    const result = service.bestCase(
        createPokemon({ category: "SPECIAL" })
    );

    assert.equal(result.nature, "MODEST");
    assert.deepEqual(result.evs, service.maxSpecialEVs());
});

test("worstCase uses zero IVs, zero EVs, and HARDY nature", () => {
    const service = new BattleSimulationService();

    const result = service.worstCase(createPokemon());

    assert.deepEqual(result.ivs, service.zeroIVs());
    assert.deepEqual(result.evs, service.zeroEVs());
    assert.equal(result.nature, "HARDY");
});

test("randomNature can select the first nature", () => {
    const service = new BattleSimulationService();

    assert.equal(
        withMockedRandom([0], () => service.randomNature()),
        "ADAMANT"
    );
});

test("randomNature can select the last nature", () => {
    const service = new BattleSimulationService();

    assert.equal(
        withMockedRandom([0.9999], () => service.randomNature()),
        "HARDY"
    );
});

test("randomNumber can return the minimum", () => {
    const service = new BattleSimulationService();

    assert.equal(
        withMockedRandom([0], () => service.randomNumber(5, 10)),
        5
    );
});

test("randomNumber can return the maximum", () => {
    const service = new BattleSimulationService();

    assert.equal(
        withMockedRandom([0.9999], () => service.randomNumber(5, 10)),
        10
    );
});

// --------------------------------------------------
// Move choice and turn order
// --------------------------------------------------

test("chooseMove selects one of the supplied moves", () => {
    const service = new BattleSimulationService();
    const firstMove = { name: "TACKLE" };
    const secondMove = { name: "VINE WHIP" };
    const pokemon = createPokemon({
        moves: [firstMove, secondMove]
    });

    const result = withMockedRandom([0.9999], () =>
        service.chooseMove(pokemon)
    );

    assert.equal(result, secondMove);
});

test("chooseMove returns TACKLE when no moves are available", () => {
    const service = new BattleSimulationService();
    const pokemon = createPokemon({ moves: [] });

    assert.deepEqual(service.chooseMove(pokemon), {
        name: "TACKLE",
        type: "NORMAL",
        category: "PHYSICAL",
        power: 40,
        accuracy: 100,
        priority: 0
    });
});

test("chooseMove uses TACKLE when moves are missing", () => {
    const service = new BattleSimulationService();
    const pokemon = createPokemon({ moves: undefined });

    assert.equal(service.chooseMove(pokemon).name, "TACKLE");
});

test("determineFirstPokemon prioritizes the player's move", () => {
    const service = new BattleSimulationService();

    assert.equal(
        service.determineFirstPokemon(
            createPokemon(),
            createPokemon(),
            { priority: 1 },
            { priority: 0 }
        ),
        "PLAYER"
    );
});

test("determineFirstPokemon prioritizes the opponent's move", () => {
    const service = new BattleSimulationService();

    assert.equal(
        service.determineFirstPokemon(
            createPokemon(),
            createPokemon(),
            { priority: 0 },
            { priority: 1 }
        ),
        "OPPONENT"
    );
});

test("determineFirstPokemon uses speed when move priorities tie", () => {
    const service = new BattleSimulationService();

    assert.equal(
        service.determineFirstPokemon(
            createPokemon({ speed: 80 }),
            createPokemon({ speed: 40 }),
            { priority: 0 },
            { priority: 0 }
        ),
        "PLAYER"
    );
});

test("determineFirstPokemon gives the turn to the faster opponent", () => {
    const service = new BattleSimulationService();

    assert.equal(
        service.determineFirstPokemon(
            createPokemon({ speed: 40 }),
            createPokemon({ speed: 80 }),
            { priority: 0 },
            { priority: 0 }
        ),
        "OPPONENT"
    );
});

test("determineFirstPokemon uses status speed multipliers", () => {
    const statusEffect = {
        getSpeedMultiplier(pokemon) {
            return pokemon.species === "PlayerMon" ? 0.5 : 1;
        }
    };

    const service = new BattleSimulationService(
        null,
        null,
        statusEffect
    );

    assert.equal(
        service.determineFirstPokemon(
            createPokemon({ species: "PlayerMon", speed: 100 }),
            createPokemon({ species: "OpponentMon", speed: 60 }),
            { priority: 0 },
            { priority: 0 }
        ),
        "OPPONENT"
    );
});

test("determineFirstPokemon randomly resolves a speed tie", () => {
    const service = new BattleSimulationService();
    const player = createPokemon({ speed: 50 });
    const opponent = createPokemon({ speed: 50 });

    assert.equal(
        withMockedRandom([0], () =>
            service.determineFirstPokemon(
                player,
                opponent,
                { priority: 0 },
                { priority: 0 }
            )
        ),
        "PLAYER"
    );

    assert.equal(
        withMockedRandom([0.9999], () =>
            service.determineFirstPokemon(
                player,
                opponent,
                { priority: 0 },
                { priority: 0 }
            )
        ),
        "OPPONENT"
    );
});

// --------------------------------------------------
// Simulation damage calculation
// --------------------------------------------------

test("calculateSimulationDamage returns zero when accuracy fails", () => {
    const service = new BattleSimulationService();

    const result = withMockedRandom([0.9999], () =>
        service.calculateSimulationDamage(
            createPokemon(),
            createPokemon(),
            {
                name: "LOW ACCURACY",
                type: "NORMAL",
                category: "PHYSICAL",
                power: 40,
                accuracy: 50
            }
        )
    );

    assert.equal(result, 0);
});

test("calculateSimulationDamage returns damage and critical fields", () => {
    const service = new BattleSimulationService();

    const result = withMockedRandom([0.9999, 0.9999], () =>
        service.calculateSimulationDamage(
            createPokemon(),
            createPokemon(),
            {
                type: "NORMAL",
                power: 40,
                category: "PHYSICAL"
            }
        )
    );

    assert.equal(typeof result.damage, "number");
    assert.equal(result.critical, false);
});

test("calculateSimulationDamage uses special attack and defense stats", () => {
    const service = new BattleSimulationService();

    const attacker = createPokemon({
        attack: 10,
        spAttack: 100,
        types: ["WATER"]
    });

    const defender = createPokemon({
        defense: 100,
        spDefense: 10,
        types: ["FIRE"]
    });

    const result = withMockedRandom([0.9999, 0.9999], () =>
        service.calculateSimulationDamage(
            attacker,
            defender,
            {
                type: "NORMAL",
                category: "SPECIAL",
                power: 40
            }
        )
    );

    assert.ok(result.damage > 0);
    assert.equal(result.critical, false);
});

test("calculateSimulationDamage applies the burn attack multiplier", () => {
    let receivedPokemon;

    const statusEffect = {
        getAttackMultiplier(pokemon) {
            receivedPokemon = pokemon;
            return 0.5;
        }
    };

    const service = new BattleSimulationService(
        null,
        null,
        statusEffect
    );

    const attacker = createPokemon({ attack: 100 });

    withMockedRandom([0.9999, 0.9999], () =>
        service.calculateSimulationDamage(
            attacker,
            createPokemon(),
            {
                type: "NORMAL",
                category: "PHYSICAL",
                power: 40
            }
        )
    );

    assert.equal(receivedPokemon, attacker);
});

test("calculateSimulationDamage does not use the physical attack multiplier for special moves", () => {
    let multiplierCalls = 0;

    const statusEffect = {
        getAttackMultiplier() {
            multiplierCalls++;
            return 0.5;
        }
    };

    const service = new BattleSimulationService(
        null,
        null,
        statusEffect
    );

    withMockedRandom([0.9999, 0.9999], () =>
        service.calculateSimulationDamage(
            createPokemon(),
            createPokemon(),
            {
                type: "NORMAL",
                category: "SPECIAL",
                power: 40
            }
        )
    );

    assert.equal(multiplierCalls, 0);
});

test("calculateSimulationDamage applies STAB when types match", () => {
    const service = new BattleSimulationService();

    const attacker = createPokemon({
        attack: 50,
        types: ["FIRE"]
    });

    const defender = createPokemon({
        defense: 50,
        types: ["GRASS"]
    });

    const move = {
        type: "FIRE",
        category: "PHYSICAL",
        power: 40
    };

    const withoutSTAB = withMockedRandom([0.9999, 0.9999], () =>
        service.calculateSimulationDamage(
            { ...attacker, types: ["WATER"] },
            defender,
            move
        )
    );

    const withSTAB = withMockedRandom([0.9999, 0.9999], () =>
        service.calculateSimulationDamage(
            attacker,
            defender,
            move
        )
    );

    assert.ok(withSTAB.damage > withoutSTAB.damage);
});

test("calculateSimulationDamage applies the injected type multiplier", () => {
    const typeEffectiveness = {
        getMultiplier(attackType, defenderTypes) {
            assert.equal(attackType, "FIRE");
            assert.deepEqual(defenderTypes, ["GRASS"]);
            return 2;
        }
    };

    const service = new BattleSimulationService(
        null,
        typeEffectiveness
    );

    const result = withMockedRandom([0.9999, 0.9999], () =>
        service.calculateSimulationDamage(
            createPokemon({ types: ["FIRE"] }),
            createPokemon({ types: ["GRASS"] }),
            {
                type: "FIRE",
                category: "PHYSICAL",
                power: 40
            }
        )
    );

    assert.ok(result.damage > 0);
});

test("calculateSimulationDamage can produce a critical hit", () => {
    const service = new BattleSimulationService();

    const result = withMockedRandom([0, 0.9999], () =>
        service.calculateSimulationDamage(
            createPokemon(),
            createPokemon(),
            {
                type: "NORMAL",
                category: "PHYSICAL",
                power: 40
            }
        )
    );

    assert.equal(result.critical, true);
});

// --------------------------------------------------
// Type effectiveness
// --------------------------------------------------

test("calculateTypeEffectiveness delegates to the injected service", () => {
    const calls = [];

    const typeEffectiveness = {
        getMultiplier(attackType, defenderTypes) {
            calls.push({ attackType, defenderTypes });
            return 1.5;
        }
    };

    const service = new BattleSimulationService(
        null,
        typeEffectiveness
    );

    assert.equal(
        service.calculateTypeEffectiveness("FIRE", ["GRASS"]),
        1.5
    );

    assert.deepEqual(calls, [
        {
            attackType: "FIRE",
            defenderTypes: ["GRASS"]
        }
    ]);
});

test("calculateTypeEffectiveness uses the built-in fallback", () => {
    const service = new BattleSimulationService();

    assert.equal(
        service.calculateTypeEffectiveness("FIRE", ["GRASS"]),
        2
    );
});

test("getTypeMultiplier handles a single defender type string", () => {
    const service = new BattleSimulationService();

    assert.equal(service.getTypeMultiplier("WATER", "ROCK"), 2);
});

test("getTypeMultiplier combines multipliers for multiple defender types", () => {
    const service = new BattleSimulationService();

    assert.equal(
        service.getTypeMultiplier("FIRE", ["GRASS", "ROCK"]),
        1
    );
});

test("getTypeMultiplier returns one for unlisted matchups", () => {
    const service = new BattleSimulationService();

    assert.equal(
        service.getTypeMultiplier("NORMAL", ["WATER"]),
        1
    );
});

// --------------------------------------------------
// Status application
// --------------------------------------------------

test("applyStatus returns null without a status service", () => {
    const service = new BattleSimulationService();

    assert.equal(
        service.applyStatus(createPokemon(), { status: "BURN" }),
        null
    );
});

test("applyStatus returns null when the move has no status effect", () => {
    let called = false;

    const service = new BattleSimulationService(
        null,
        null,
        {
            applyStatus() {
                called = true;
            }
        }
    );

    assert.equal(
        service.applyStatus(createPokemon(), { name: "TACKLE" }),
        null
    );
    assert.equal(called, false);
});

test("applyStatus prevents burn against FIRE types", () => {
    let called = false;

    const service = new BattleSimulationService(
        null,
        null,
        {
            applyStatus() {
                called = true;
            }
        }
    );

    const result = service.applyStatus(
        createPokemon({ types: ["FIRE"] }),
        { status: "BURN" }
    );

    assert.deepEqual(result, {
        success: false,
        reason: "Fire type immune to burn"
    });
    assert.equal(called, false);
});

test("applyStatus prevents poison against POISON types", () => {
    let called = false;

    const service = new BattleSimulationService(
        null,
        null,
        {
            applyStatus() {
                called = true;
            }
        }
    );

    const result = service.applyStatus(
        createPokemon({ types: ["POISON"] }),
        { status: "POISON" }
    );

    assert.deepEqual(result, {
        success: false,
        reason: "Poison immunity"
    });
    assert.equal(called, false);
});

test("applyStatus prevents poison against STEEL types", () => {
    const service = new BattleSimulationService(
        null,
        null,
        { applyStatus() {} }
    );

    const result = service.applyStatus(
        createPokemon({ types: ["STEEL"] }),
        { status: "POISON" }
    );

    assert.deepEqual(result, {
        success: false,
        reason: "Poison immunity"
    });
});

test("applyStatus delegates eligible status effects", () => {
    const expected = { success: true };
    const calls = [];

    const statusEffect = {
        applyStatus(pokemon, status) {
            calls.push({ pokemon, status });
            return expected;
        }
    };

    const service = new BattleSimulationService(
        null,
        null,
        statusEffect
    );

    const pokemon = createPokemon({ types: ["GRASS"] });
    const result = service.applyStatus(
        pokemon,
        { status: "BURN" }
    );

    assert.equal(result, expected);
    assert.deepEqual(calls, [{ pokemon, status: "BURN" }]);
});

// --------------------------------------------------
// Battle simulation
// --------------------------------------------------

test("simulateBattle returns PLAYER when the player knocks out the opponent first", () => {
    const service = createDeterministicSimulation({
        first: "PLAYER",
        playerDamage: 100,
        opponentDamage: 10
    });

    const battle = createBattle(
        { hp: 100 },
        { hp: 20 }
    );

    const result = service.simulateBattle(battle);

    assert.equal(result.winner, "PLAYER");
    assert.equal(result.log.length, 1);
    assert.equal(result.log[0].attacker, "PlayerMon");
    assert.equal(result.log[0].target, "OpponentMon");
    assert.equal(result.log[0].targetHP, 0);
});

test("simulateBattle returns OPPONENT when the opponent knocks out the player first", () => {
    const service = createDeterministicSimulation({
        first: "OPPONENT",
        playerDamage: 10,
        opponentDamage: 100
    });

    const battle = createBattle(
        { hp: 20 },
        { hp: 100 }
    );

    const result = service.simulateBattle(battle);

    assert.equal(result.winner, "OPPONENT");
    assert.equal(result.log.length, 1);
    assert.equal(result.log[0].attacker, "OpponentMon");
    assert.equal(result.log[0].target, "PlayerMon");
    assert.equal(result.log[0].targetHP, 0);
});

test("simulateBattle records multiple attacks before a knockout", () => {
    const service = createDeterministicSimulation({
        first: "PLAYER",
        playerDamage: 10,
        opponentDamage: 10
    });

    const battle = createBattle(
        { hp: 100 },
        { hp: 15 }
    );

    const result = service.simulateBattle(battle);

    assert.equal(result.winner, "PLAYER");
    assert.equal(result.log.length, 3);
    assert.equal(result.log[0].attacker, "PlayerMon");
    assert.equal(result.log[1].attacker, "OpponentMon");
    assert.equal(result.log[2].attacker, "PlayerMon");
});

test("simulateBattle initializes maxHP from current HP", () => {
    const service = createDeterministicSimulation();
    const battle = createBattle(
        { hp: 75, maxHP: 999 },
        { hp: 60, maxHP: 999 }
    );

    service.simulateBattle(battle);

    assert.equal(battle.player.party[0].maxHP, 75);
    assert.equal(battle.opponent.party[0].maxHP, 60);
});

test("simulateBattle clears previous status effects at the start", () => {
    const service = createDeterministicSimulation();

    const battle = createBattle(
        {
            hp: 100,
            status: "BURN",
            statusData: { turns: 2 }
        },
        {
            hp: 20,
            status: "POISON",
            statusData: { turns: 3 }
        }
    );

    const result = service.simulateBattle(battle);

    assert.equal(battle.player.party[0].status, null);
    assert.equal(battle.player.party[0].statusData, null);
    assert.equal(battle.opponent.party[0].status, null);
    assert.equal(battle.opponent.party[0].statusData, null);
    assert.equal(result.winner, "PLAYER");
});

test("simulateBattle returns a battle log array", () => {
    const service = createDeterministicSimulation();
    const result = service.simulateBattle(createBattle());

    assert.ok(Array.isArray(result.log));
    assert.ok(result.log.length > 0);
});

test("simulateBattle logs the critical-hit flag", () => {
    const service = createDeterministicSimulation();

    service.calculateSimulationDamage = () => ({
        damage: 100,
        critical: true
    });

    const result = service.simulateBattle(createBattle());

    assert.equal(result.log[0].critical, true);
});
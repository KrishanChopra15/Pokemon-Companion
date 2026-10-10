"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const StatStageService =
    require("../scripts/services/stat-stage-service");


function createService() {
    return new StatStageService();
}

function createPokemon(statStages) {
    const pokemon = {};

    if (statStages !== undefined) {
        pokemon.statStages = statStages;
    }

    return pokemon;
}

const EXPECTED_STATS = [
    "attack",
    "defense",
    "speed",
    "spAttack",
    "spDefense",
    "accuracy",
    "evasion"
];


// -----------------------------------------------
// Constructor
// -----------------------------------------------

test("constructor sets the minimum stage to -6", () => {
    const service = createService();

    assert.equal(service.minStage, -6);
});

test("constructor sets the maximum stage to 6", () => {
    const service = createService();

    assert.equal(service.maxStage, 6);
});

test("constructor defines all seven supported stats", () => {
    const service = createService();

    assert.deepEqual(service.stats, EXPECTED_STATS);
});

test("constructor creates an independent stats array for each instance", () => {
    const first = createService();
    const second = createService();

    assert.notEqual(first.stats, second.stats);
    assert.deepEqual(first.stats, second.stats);
});


// -----------------------------------------------
// initialize
// -----------------------------------------------

test("initialize creates statStages when it is missing", () => {
    const service = createService();
    const pokemon = createPokemon();

    const result = service.initialize(pokemon);

    assert.ok(pokemon.statStages);
    assert.equal(result, pokemon.statStages);
});

test("initialize creates all seven supported stages at zero", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.deepEqual(service.initialize(pokemon), {
        attack: 0,
        defense: 0,
        speed: 0,
        spAttack: 0,
        spDefense: 0,
        accuracy: 0,
        evasion: 0
    });
});

test("initialize fills an existing empty statStages object", () => {
    const service = createService();
    const pokemon = createPokemon({});

    service.initialize(pokemon);

    for (const stat of EXPECTED_STATS) {
        assert.equal(pokemon.statStages[stat], 0);
    }
});

test("initialize preserves existing nonzero stages", () => {
    const service = createService();
    const pokemon = createPokemon({
        attack: 3,
        speed: -2
    });

    service.initialize(pokemon);

    assert.equal(pokemon.statStages.attack, 3);
    assert.equal(pokemon.statStages.speed, -2);
});

test("initialize fills missing stages without overwriting existing ones", () => {
    const service = createService();
    const pokemon = createPokemon({
        attack: 4,
        defense: -1
    });

    service.initialize(pokemon);

    assert.equal(pokemon.statStages.attack, 4);
    assert.equal(pokemon.statStages.defense, -1);
    assert.equal(pokemon.statStages.speed, 0);
    assert.equal(pokemon.statStages.spAttack, 0);
    assert.equal(pokemon.statStages.spDefense, 0);
    assert.equal(pokemon.statStages.accuracy, 0);
    assert.equal(pokemon.statStages.evasion, 0);
});

test("initialize replaces an explicitly undefined supported stage with zero", () => {
    const service = createService();
    const pokemon = createPokemon({
        attack: undefined
    });

    service.initialize(pokemon);

    assert.equal(pokemon.statStages.attack, 0);
});

test("initialize preserves extra properties on statStages", () => {
    const service = createService();
    const pokemon = createPokemon({
        attack: 2,
        customValue: 99
    });

    service.initialize(pokemon);

    assert.equal(pokemon.statStages.customValue, 99);
});

test("initialize returns the same statStages object stored on the Pokémon", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 2 });

    const result = service.initialize(pokemon);

    assert.equal(result, pokemon.statStages);
});

test("initialize does not replace an existing statStages object", () => {
    const service = createService();
    const stages = { attack: 2 };
    const pokemon = createPokemon(stages);

    service.initialize(pokemon);

    assert.equal(pokemon.statStages, stages);
});

test("initialize leaves a fully initialized set of stages unchanged", () => {
    const service = createService();
    const pokemon = createPokemon({
        attack: 1,
        defense: 2,
        speed: 3,
        spAttack: 4,
        spDefense: 5,
        accuracy: -1,
        evasion: -2
    });
    const original = { ...pokemon.statStages };

    service.initialize(pokemon);

    assert.deepEqual(pokemon.statStages, original);
});


// -----------------------------------------------
// increase
// -----------------------------------------------

for (const stat of EXPECTED_STATS) {
    test(`increase raises ${stat} by one by default`, () => {
        const service = createService();
        const pokemon = createPokemon();

        const result = service.increase(pokemon, stat);

        assert.deepEqual(result, {
            success: true,
            stat,
            stage: 1
        });
        assert.equal(pokemon.statStages[stat], 1);
    });
}

test("increase accepts an explicit amount", () => {
    const service = createService();
    const pokemon = createPokemon();

    const result = service.increase(pokemon, "attack", 3);

    assert.deepEqual(result, {
        success: true,
        stat: "attack",
        stage: 3
    });
});

test("increase adds to the existing stage", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 2 });

    const result = service.increase(pokemon, "attack", 3);

    assert.equal(result.stage, 5);
    assert.equal(pokemon.statStages.attack, 5);
});

test("increase clamps a stage at the maximum of six", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 5 });

    const result = service.increase(pokemon, "attack", 5);

    assert.equal(result.success, true);
    assert.equal(result.stage, 6);
    assert.equal(pokemon.statStages.attack, 6);
});

test("increase keeps a stage at six when increasing it further", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 6 });

    const result = service.increase(pokemon, "attack", 1);

    assert.equal(result.stage, 6);
});

test("increase can decrease a stage when given a negative amount", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 2 });

    const result = service.increase(pokemon, "attack", -3);

    assert.equal(result.stage, -1);
});

test("increase clamps at the minimum of negative six", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: -5 });

    const result = service.increase(pokemon, "attack", -3);

    assert.equal(result.success, true);
    assert.equal(result.stage, -6);
});

test("increase does not change a stage when the amount is zero", () => {
    const service = createService();
    const pokemon = createPokemon({ defense: 3 });

    const result = service.increase(pokemon, "defense", 0);

    assert.equal(result.success, true);
    assert.equal(result.stage, 3);
});

test("increase rejects an unknown stat", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.deepEqual(
        service.increase(pokemon, "criticalHit"),
        {
            success: false,
            reason: "Unknown stat"
        }
    );
});

test("increase initializes supported stages even when the requested stat is invalid", () => {
    const service = createService();
    const pokemon = createPokemon();

    service.increase(pokemon, "criticalHit");

    for (const stat of EXPECTED_STATS) {
        assert.equal(pokemon.statStages[stat], 0);
    }
});

test("increase reports the stat name in its result", () => {
    const service = createService();
    const pokemon = createPokemon();

    const result = service.increase(pokemon, "spAttack");

    assert.equal(result.stat, "spAttack");
});


// -----------------------------------------------
// decrease
// -----------------------------------------------

for (const stat of EXPECTED_STATS) {
    test(`decrease lowers ${stat} by one by default`, () => {
        const service = createService();
        const pokemon = createPokemon();

        const result = service.decrease(pokemon, stat);

        assert.deepEqual(result, {
            success: true,
            stat,
            stage: -1
        });
        assert.equal(pokemon.statStages[stat], -1);
    });
}

test("decrease accepts an explicit amount", () => {
    const service = createService();
    const pokemon = createPokemon();

    const result = service.decrease(pokemon, "defense", 3);

    assert.equal(result.success, true);
    assert.equal(result.stage, -3);
});

test("decrease subtracts the amount from the existing stage", () => {
    const service = createService();
    const pokemon = createPokemon({ speed: 3 });

    const result = service.decrease(pokemon, "speed", 2);

    assert.equal(result.stage, 1);
});

test("decrease clamps at negative six", () => {
    const service = createService();
    const pokemon = createPokemon({ defense: -5 });

    const result = service.decrease(pokemon, "defense", 4);

    assert.equal(result.success, true);
    assert.equal(result.stage, -6);
});

test("decrease does not lower a stage below negative six", () => {
    const service = createService();
    const pokemon = createPokemon({ speed: -6 });

    const result = service.decrease(pokemon, "speed");

    assert.equal(result.stage, -6);
});

test("decrease cannot lower a stage below negative six with a large amount", () => {
    const service = createService();
    const pokemon = createPokemon({ accuracy: 0 });

    const result = service.decrease(pokemon, "accuracy", 100);

    assert.equal(result.stage, -6);
});

test("decrease accepts a negative amount as an increase", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 1 });

    const result = service.decrease(pokemon, "attack", -2);

    assert.equal(result.success, true);
    assert.equal(result.stage, 3);
});

test("decrease rejects an unknown stat", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.deepEqual(
        service.decrease(pokemon, "unknownStat"),
        {
            success: false,
            reason: "Unknown stat"
        }
    );
});


// -----------------------------------------------
// setStage
// -----------------------------------------------

test("setStage sets a supported stat to the requested stage", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.equal(
        service.setStage(pokemon, "attack", 4),
        4
    );
    assert.equal(pokemon.statStages.attack, 4);
});

test("setStage accepts negative stages", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.equal(
        service.setStage(pokemon, "defense", -3),
        -3
    );
});

test("setStage clamps values above six to six", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.equal(
        service.setStage(pokemon, "speed", 10),
        6
    );
    assert.equal(pokemon.statStages.speed, 6);
});

test("setStage clamps values below negative six to negative six", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.equal(
        service.setStage(pokemon, "speed", -10),
        -6
    );
    assert.equal(pokemon.statStages.speed, -6);
});

test("setStage accepts the maximum stage exactly", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.equal(
        service.setStage(pokemon, "attack", 6),
        6
    );
});

test("setStage accepts the minimum stage exactly", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.equal(
        service.setStage(pokemon, "attack", -6),
        -6
    );
});

test("setStage can reset an individual stat to zero", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 4 });

    assert.equal(
        service.setStage(pokemon, "attack", 0),
        0
    );
});

test("setStage initializes all other supported stages", () => {
    const service = createService();
    const pokemon = createPokemon();

    service.setStage(pokemon, "spAttack", 2);

    assert.equal(pokemon.statStages.spAttack, 2);
    assert.equal(pokemon.statStages.attack, 0);
    assert.equal(pokemon.statStages.defense, 0);
    assert.equal(pokemon.statStages.speed, 0);
    assert.equal(pokemon.statStages.spDefense, 0);
    assert.equal(pokemon.statStages.accuracy, 0);
    assert.equal(pokemon.statStages.evasion, 0);
});

test("setStage stores a decimal stage without rounding", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.equal(
        service.setStage(pokemon, "attack", 1.5),
        1.5
    );
});


// -----------------------------------------------
// reset
// -----------------------------------------------

test("reset returns a successful result", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 3 });

    assert.deepEqual(
        service.reset(pokemon),
        { success: true }
    );
});

test("reset sets every supported stage to zero", () => {
    const service = createService();
    const pokemon = createPokemon({
        attack: 6,
        defense: -3,
        speed: 2,
        spAttack: 1,
        spDefense: -2,
        accuracy: 4,
        evasion: -6
    });

    service.reset(pokemon);

    for (const stat of EXPECTED_STATS) {
        assert.equal(pokemon.statStages[stat], 0);
    }
});

test("reset removes extra properties from statStages", () => {
    const service = createService();
    const pokemon = createPokemon({
        attack: 2,
        customValue: 99
    });

    service.reset(pokemon);

    assert.equal(
        Object.hasOwn(pokemon.statStages, "customValue"),
        false
    );
});

test("reset replaces the previous statStages object", () => {
    const service = createService();
    const originalStages = { attack: 3 };
    const pokemon = createPokemon(originalStages);

    service.reset(pokemon);

    assert.notEqual(pokemon.statStages, originalStages);
    assert.deepEqual(originalStages, { attack: 3 });
});

test("reset leaves the Pokémon with all seven initialized stages", () => {
    const service = createService();
    const pokemon = createPokemon();

    service.reset(pokemon);

    assert.deepEqual(
        Object.keys(pokemon.statStages).sort(),
        [...EXPECTED_STATS].sort()
    );
});


// -----------------------------------------------
// getStage
// -----------------------------------------------

test("getStage returns zero for an uninitialized stat", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.equal(service.getStage(pokemon, "attack"), 0);
});

test("getStage returns the current positive stage", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 4 });

    assert.equal(service.getStage(pokemon, "attack"), 4);
});

test("getStage returns the current negative stage", () => {
    const service = createService();
    const pokemon = createPokemon({ defense: -2 });

    assert.equal(service.getStage(pokemon, "defense"), -2);
});

test("getStage initializes all supported stages as a side effect", () => {
    const service = createService();
    const pokemon = createPokemon();

    service.getStage(pokemon, "speed");

    for (const stat of EXPECTED_STATS) {
        assert.equal(pokemon.statStages[stat], 0);
    }
});

test("getStage returns zero for an unknown stat", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.equal(service.getStage(pokemon, "unknownStat"), 0);
});

test("getStage does not add an unknown stat to statStages", () => {
    const service = createService();
    const pokemon = createPokemon();

    service.getStage(pokemon, "unknownStat");

    assert.equal(
        Object.hasOwn(pokemon.statStages, "unknownStat"),
        false
    );
});


// -----------------------------------------------
// getMultiplier
// -----------------------------------------------

test("getMultiplier returns one for stage zero", () => {
    const service = createService();

    assert.equal(service.getMultiplier(0), 1);
});

test("getMultiplier returns 1.5 for stage one", () => {
    const service = createService();

    assert.equal(service.getMultiplier(1), 1.5);
});

test("getMultiplier returns two for stage two", () => {
    const service = createService();

    assert.equal(service.getMultiplier(2), 2);
});

test("getMultiplier returns four for stage six", () => {
    const service = createService();

    assert.equal(service.getMultiplier(6), 4);
});

test("getMultiplier returns two thirds for stage negative one", () => {
    const service = createService();

    assert.equal(service.getMultiplier(-1), 2 / 3);
});

test("getMultiplier returns one half for stage negative two", () => {
    const service = createService();

    assert.equal(service.getMultiplier(-2), 0.5);
});

test("getMultiplier returns one quarter for stage negative six", () => {
    const service = createService();

    assert.equal(service.getMultiplier(-6), 0.25);
});

test("getMultiplier follows the formula for every supported stage", () => {
    const service = createService();

    for (let stage = -6; stage <= 6; stage += 1) {
        const expected = stage >= 0
            ? (2 + stage) / 2
            : 2 / (2 - stage);

        assert.equal(
            service.getMultiplier(stage),
            expected,
            `Unexpected multiplier for stage ${stage}`
        );
    }
});


// -----------------------------------------------
// getModifiedStat
// -----------------------------------------------

test("getModifiedStat preserves the base stat at stage zero", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.equal(
        service.getModifiedStat(pokemon, "attack", 100),
        100
    );
});

test("getModifiedStat applies a positive stage multiplier", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 1 });

    assert.equal(
        service.getModifiedStat(pokemon, "attack", 100),
        150
    );
});

test("getModifiedStat applies a negative stage multiplier", () => {
    const service = createService();
    const pokemon = createPokemon({ defense: -1 });

    assert.equal(
        service.getModifiedStat(pokemon, "defense", 90),
        60
    );
});

test("getModifiedStat floors fractional results", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 1 });

    assert.equal(
        service.getModifiedStat(pokemon, "attack", 101),
        151
    );
});

test("getModifiedStat applies the maximum positive stage", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 6 });

    assert.equal(
        service.getModifiedStat(pokemon, "attack", 25),
        100
    );
});

test("getModifiedStat applies the maximum negative stage", () => {
    const service = createService();
    const pokemon = createPokemon({ defense: -6 });

    assert.equal(
        service.getModifiedStat(pokemon, "defense", 100),
        25
    );
});

test("getModifiedStat returns zero when the base value is zero", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 6 });

    assert.equal(
        service.getModifiedStat(pokemon, "attack", 0),
        0
    );
});

test("getModifiedStat initializes stages when they are missing", () => {
    const service = createService();
    const pokemon = createPokemon();

    service.getModifiedStat(pokemon, "speed", 50);

    assert.equal(pokemon.statStages.speed, 0);
    assert.equal(pokemon.statStages.attack, 0);
});

test("getModifiedStat uses stage zero for an unknown stat", () => {
    const service = createService();
    const pokemon = createPokemon();

    assert.equal(
        service.getModifiedStat(pokemon, "unknownStat", 45),
        45
    );
});


// -----------------------------------------------
// getAllStages
// -----------------------------------------------

test("getAllStages initializes missing stat stages", () => {
    const service = createService();
    const pokemon = createPokemon();

    const result = service.getAllStages(pokemon);

    assert.deepEqual(result, {
        attack: 0,
        defense: 0,
        speed: 0,
        spAttack: 0,
        spDefense: 0,
        accuracy: 0,
        evasion: 0
    });
});

test("getAllStages returns the Pokémon's statStages object", () => {
    const service = createService();
    const pokemon = createPokemon({ attack: 2 });

    const result = service.getAllStages(pokemon);

    assert.equal(result, pokemon.statStages);
});

test("getAllStages preserves existing stage values", () => {
    const service = createService();
    const pokemon = createPokemon({
        attack: 3,
        speed: -2
    });

    const result = service.getAllStages(pokemon);

    assert.equal(result.attack, 3);
    assert.equal(result.speed, -2);
    assert.equal(result.defense, 0);
});

test("getAllStages reflects subsequent changes to the same stage object", () => {
    const service = createService();
    const pokemon = createPokemon();

    const stages = service.getAllStages(pokemon);

    service.increase(pokemon, "attack", 2);

    assert.equal(stages.attack, 2);
    assert.equal(stages, pokemon.statStages);
});


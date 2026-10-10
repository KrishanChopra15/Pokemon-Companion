"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const TrainerDifficultyService = require("../scripts/services/trainer-difficulty-service");

function createService() {
    return new TrainerDifficultyService();
}

function createAnalysis(overrides = {}) {
    return {
        type: "YOUNGSTER",
        teamSize: 2,
        averageLevel: 10,
        highestLevel: 15,
        teamPower: 300,
        ...overrides
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a TrainerDifficultyService instance", () => {
    assert.ok(createService() instanceof TrainerDifficultyService);
});

test("constructor creates independent service instances", () => {
    assert.notStrictEqual(createService(), createService());
});

// --------------------------------------------------
// Base score calculation
// --------------------------------------------------

test("calculate returns a score and difficulty", () => {
    assert.deepEqual(
        createService().calculate(createAnalysis()),
        {
            score: 37,
            difficulty: "EASY"
        }
    );
});

test("calculate adds five points per team member", () => {
    const service = createService();

    assert.equal(
        service.calculate(createAnalysis({
            teamSize: 4,
            averageLevel: 0,
            highestLevel: 0,
            teamPower: 0
        })).score,
        20
    );
});

test("calculate adds the average level", () => {
    const service = createService();

    assert.equal(
        service.calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 25,
            highestLevel: 0,
            teamPower: 0
        })).score,
        25
    );
});

test("calculate adds the highest level", () => {
    const service = createService();

    assert.equal(
        service.calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 0,
            highestLevel: 40,
            teamPower: 0
        })).score,
        40
    );
});

test("calculate adds the floored team power contribution", () => {
    const service = createService();

    assert.equal(
        service.calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 0,
            highestLevel: 0,
            teamPower: 450
        })).score,
        3
    );
});

test("calculate floors fractional team power contributions", () => {
    const service = createService();

    assert.equal(
        service.calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 0,
            highestLevel: 0,
            teamPower: 449
        })).score,
        2
    );
});

test("calculate floors team power just below a multiple of 150", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 0,
            highestLevel: 0,
            teamPower: 599
        })).score,
        3
    );
});

test("calculate gives one power point for team power of 150", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 0,
            highestLevel: 0,
            teamPower: 150
        })).score,
        1
    );
});

test("calculate gives zero power points for team power below 150", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 0,
            highestLevel: 0,
            teamPower: 149
        })).score,
        0
    );
});

test("calculate combines all base team strength values", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            teamSize: 3,
            averageLevel: 20,
            highestLevel: 35,
            teamPower: 750
        })).score,
        20 + 35 + 15 + 5
    );
});

test("calculate returns zero for an all-zero analysis", () => {
    assert.deepEqual(
        createService().calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 0,
            highestLevel: 0,
            teamPower: 0
        })),
        {
            score: 0,
            difficulty: "EASY"
        }
    );
});

// --------------------------------------------------
// Trainer category modifiers
// --------------------------------------------------

test("calculate adds five points for a gym leader", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            type: "GYM_LEADER",
            teamSize: 0,
            averageLevel: 0,
            highestLevel: 0,
            teamPower: 0
        })).score,
        5
    );
});

test("calculate adds twenty points for an Elite Four trainer", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            type: "ELITE_FOUR",
            teamSize: 0,
            averageLevel: 0,
            highestLevel: 0,
            teamPower: 0
        })).score,
        20
    );
});

test("calculate adds thirty points for a champion", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            type: "CHAMPION",
            teamSize: 0,
            averageLevel: 0,
            highestLevel: 0,
            teamPower: 0
        })).score,
        30
    );
});

test("calculate adds ten points for a rival", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            type: "RIVAL",
            teamSize: 0,
            averageLevel: 0,
            highestLevel: 0,
            teamPower: 0
        })).score,
        10
    );
});

test("calculate gives no category bonus to an ordinary trainer", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            type: "YOUNGSTER",
            teamSize: 0,
            averageLevel: 0,
            highestLevel: 0,
            teamPower: 0
        })).score,
        0
    );
});

test("calculate gives no bonus for an unknown trainer category", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            type: "UNKNOWN",
            teamSize: 0,
            averageLevel: 0,
            highestLevel: 0,
            teamPower: 0
        })).score,
        0
    );
});

test("calculate matches trainer categories exactly", () => {
    for (const type of [
        "gym_leader",
        "Gym_Leader",
        "ELITE FOUR",
        "champion",
        "rival"
    ]) {
        assert.equal(
            createService().calculate(createAnalysis({
                type,
                teamSize: 0,
                averageLevel: 0,
                highestLevel: 0,
                teamPower: 0
            })).score,
            0
        );
    }
});

test("calculate combines the base score with the gym leader bonus", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            type: "GYM_LEADER",
            teamSize: 2,
            averageLevel: 10,
            highestLevel: 15,
            teamPower: 300
        })).score,
        42
    );
});

test("calculate combines the base score with the Elite Four bonus", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            type: "ELITE_FOUR"
        })).score,
        57
    );
});

test("calculate combines the base score with the champion bonus", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            type: "CHAMPION"
        })).score,
        67
    );
});

test("calculate combines the base score with the rival bonus", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            type: "RIVAL"
        })).score,
        47
    );
});

// --------------------------------------------------
// Difficulty classification
// --------------------------------------------------

test("calculate classifies a score below 45 as EASY", () => {
    assert.deepEqual(
        createService().calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 44,
            highestLevel: 0,
            teamPower: 0
        })),
        {
            score: 44,
            difficulty: "EASY"
        }
    );
});

test("calculate classifies a score of 44 as EASY", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 44,
            highestLevel: 0,
            teamPower: 0
        })).difficulty,
        "EASY"
    );
});

test("calculate classifies a score of exactly 45 as MEDIUM", () => {
    assert.deepEqual(
        createService().calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 45,
            highestLevel: 0,
            teamPower: 0
        })),
        {
            score: 45,
            difficulty: "MEDIUM"
        }
    );
});

test("calculate classifies a score between 45 and 79 as MEDIUM", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 60,
            highestLevel: 0,
            teamPower: 0
        })).difficulty,
        "MEDIUM"
    );
});

test("calculate classifies a score of 79 as MEDIUM", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 79,
            highestLevel: 0,
            teamPower: 0
        })).difficulty,
        "MEDIUM"
    );
});

test("calculate classifies a score of exactly 80 as HARD", () => {
    assert.deepEqual(
        createService().calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 80,
            highestLevel: 0,
            teamPower: 0
        })),
        {
            score: 80,
            difficulty: "HARD"
        }
    );
});

test("calculate classifies a score above 80 as HARD", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            teamSize: 0,
            averageLevel: 100,
            highestLevel: 0,
            teamPower: 0
        })).difficulty,
        "HARD"
    );
});

test("calculate can classify a gym leader as MEDIUM from the category bonus", () => {
    assert.deepEqual(
        createService().calculate(createAnalysis({
            type: "GYM_LEADER",
            teamSize: 0,
            averageLevel: 40,
            highestLevel: 0,
            teamPower: 0
        })),
        {
            score: 45,
            difficulty: "MEDIUM"
        }
    );
});

test("calculate can classify a rival as MEDIUM from the category bonus", () => {
    assert.deepEqual(
        createService().calculate(createAnalysis({
            type: "RIVAL",
            teamSize: 0,
            averageLevel: 35,
            highestLevel: 0,
            teamPower: 0
        })),
        {
            score: 45,
            difficulty: "MEDIUM"
        }
    );
});

test("calculate can classify a champion as MEDIUM from the category bonus", () => {
    assert.deepEqual(
        createService().calculate(createAnalysis({
            type: "CHAMPION",
            teamSize: 0,
            averageLevel: 15,
            highestLevel: 0,
            teamPower: 0
        })),
        {
            score: 45,
            difficulty: "MEDIUM"
        }
    );
});

test("calculate can classify an Elite Four trainer as HARD from the category bonus", () => {
    assert.deepEqual(
        createService().calculate(createAnalysis({
            type: "ELITE_FOUR",
            teamSize: 0,
            averageLevel: 60,
            highestLevel: 0,
            teamPower: 0
        })),
        {
            score: 80,
            difficulty: "HARD"
        }
    );
});

test("calculate uses HARD classification before MEDIUM", () => {
    assert.equal(
        createService().calculate(createAnalysis({
            type: "CHAMPION",
            teamSize: 0,
            averageLevel: 50,
            highestLevel: 0,
            teamPower: 0
        })).difficulty,
        "HARD"
    );
});

// --------------------------------------------------
// Result structure and side effects
// --------------------------------------------------

test("calculate returns only score and difficulty", () => {
    const result = createService().calculate(createAnalysis());

    assert.deepEqual(Object.keys(result), ["score", "difficulty"]);
});

test("calculate returns a numeric score for complete numeric input", () => {
    const result = createService().calculate(createAnalysis());

    assert.equal(typeof result.score, "number");
    assert.ok(Number.isFinite(result.score));
});

test("calculate does not mutate its analysis input", () => {
    const service = createService();
    const analysis = createAnalysis();
    const original = { ...analysis };

    service.calculate(analysis);

    assert.deepEqual(analysis, original);
});

test("calculate produces the same result for equivalent inputs", () => {
    const service = createService();
    const analysis = createAnalysis();

    assert.deepEqual(
        service.calculate(analysis),
        service.calculate({ ...analysis })
    );
});

test("calculate returns EASY when required numeric fields are missing", () => {
    const result = createService().calculate({
        type: "YOUNGSTER"
    });

    assert.ok(Number.isNaN(result.score));
    assert.equal(result.difficulty, "EASY");
});

test("calculate throws when the analysis object is missing", () => {
    assert.throws(
        () => createService().calculate(null),
        TypeError
    );

    assert.throws(
        () => createService().calculate(undefined),
        TypeError
    );
});

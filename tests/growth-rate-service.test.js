"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const GrowthRateService =
    require("../scripts/services/growth-rate-service");


const FALLBACK_RATES = [
    {
        id: 0,
        name: "Medium Fast",
        constant: "GROWTH_MEDIUM_FAST"
    },
    {
        id: 1,
        name: "Erratic",
        constant: "GROWTH_ERRATIC"
    },
    {
        id: 2,
        name: "Fluctuating",
        constant: "GROWTH_FLUCTUATING"
    },
    {
        id: 3,
        name: "Medium Slow",
        constant: "GROWTH_MEDIUM_SLOW"
    },
    {
        id: 4,
        name: "Fast",
        constant: "GROWTH_FAST"
    },
    {
        id: 5,
        name: "Slow",
        constant: "GROWTH_SLOW"
    }
];


function createService(game = "firered") {
    return new GrowthRateService(game);
}


// Temporarily replace filesystem methods so database-loading tests
// are independent of the files on the user's machine.
function createServiceWithMockedFs({
    game = "firered",
    exists = false,
    content = JSON.stringify(FALLBACK_RATES)
} = {}) {
    const originalExistsSync = fs.existsSync;
    const originalReadFileSync = fs.readFileSync;
    const existsCalls = [];
    const readCalls = [];

    fs.existsSync = function (filePath) {
        existsCalls.push(filePath);
        return exists;
    };

    fs.readFileSync = function (filePath, encoding) {
        readCalls.push({ filePath, encoding });
        return content;
    };

    try {
        const service = new GrowthRateService(game);

        return {
            service,
            existsCalls,
            readCalls
        };
    } finally {
        fs.existsSync = originalExistsSync;
        fs.readFileSync = originalReadFileSync;
    }
}


// -----------------------------------------------
// Constructor
// -----------------------------------------------

test("constructor creates a GrowthRateService instance", () => {
    assert.ok(createService() instanceof GrowthRateService);
});

test("constructor defaults the game to firered", () => {
    const { service } = createServiceWithMockedFs();

    assert.equal(service.game, "firered");
});

test("constructor stores the supplied game", () => {
    const { service } = createServiceWithMockedFs({
        game: "emerald"
    });

    assert.equal(service.game, "emerald");
});

test("constructor loads growth rates into rates", () => {
    const { service } = createServiceWithMockedFs();

    assert.deepEqual(service.rates, FALLBACK_RATES);
});

test("constructor loads the database only once", () => {
    const { existsCalls, readCalls } = createServiceWithMockedFs({
        exists: true
    });

    assert.equal(existsCalls.length, 1);
    assert.equal(readCalls.length, 1);
});


// -----------------------------------------------
// loadDatabase
// -----------------------------------------------

test("loadDatabase checks the growth-rate reference path from the current working directory", () => {
    const { existsCalls } = createServiceWithMockedFs();

    assert.deepEqual(existsCalls, [
        path.join(
            process.cwd(),
            "database",
            "references",
            "growth-rates.json"
        )
    ]);
});

test("loadDatabase uses utf8 when reading the reference database", () => {
    const { readCalls } = createServiceWithMockedFs({
        exists: true
    });

    assert.equal(readCalls.length, 1);
    assert.equal(readCalls[0].encoding, "utf8");
});

test("loadDatabase reads the reference database when it exists", () => {
    const database = [
        {
            id: 12,
            name: "Custom Rate",
            constant: "GROWTH_CUSTOM"
        }
    ];

    const { service, readCalls } = createServiceWithMockedFs({
        exists: true,
        content: JSON.stringify(database)
    });

    assert.deepEqual(service.rates, database);
    assert.equal(readCalls.length, 1);
});

test("loadDatabase does not read the file when it does not exist", () => {
    const { readCalls } = createServiceWithMockedFs({
        exists: false
    });

    assert.equal(readCalls.length, 0);
});

test("loadDatabase provides all six fallback growth rates when the file is missing", () => {
    const { service } = createServiceWithMockedFs({
        exists: false
    });

    assert.deepEqual(service.rates, FALLBACK_RATES);
});

test("loadDatabase returns parsed JSON rather than the fallback when the file exists", () => {
    const database = [
        {
            id: 99,
            name: "Test Curve",
            constant: "GROWTH_TEST"
        }
    ];

    const { service } = createServiceWithMockedFs({
        exists: true,
        content: JSON.stringify(database)
    });

    assert.deepEqual(service.rates, database);
    assert.equal(service.rates.length, 1);
});

test("loadDatabase throws when existing database JSON is invalid", () => {
    assert.throws(
        () => createServiceWithMockedFs({
            exists: true,
            content: "{ invalid json"
        }),
        SyntaxError
    );
});


// -----------------------------------------------
// getRate
// -----------------------------------------------

test("getRate finds Medium Fast by constant", () => {
    const { service } = createServiceWithMockedFs();

    assert.deepEqual(
        service.getRate("GROWTH_MEDIUM_FAST"),
        FALLBACK_RATES[0]
    );
});

test("getRate finds Erratic by constant", () => {
    const { service } = createServiceWithMockedFs();

    assert.deepEqual(
        service.getRate("GROWTH_ERRATIC"),
        FALLBACK_RATES[1]
    );
});

test("getRate finds Fluctuating by constant", () => {
    const { service } = createServiceWithMockedFs();

    assert.deepEqual(
        service.getRate("GROWTH_FLUCTUATING"),
        FALLBACK_RATES[2]
    );
});

test("getRate finds Medium Slow by constant", () => {
    const { service } = createServiceWithMockedFs();

    assert.deepEqual(
        service.getRate("GROWTH_MEDIUM_SLOW"),
        FALLBACK_RATES[3]
    );
});

test("getRate finds Fast by constant", () => {
    const { service } = createServiceWithMockedFs();

    assert.deepEqual(
        service.getRate("GROWTH_FAST"),
        FALLBACK_RATES[4]
    );
});

test("getRate finds Slow by constant", () => {
    const { service } = createServiceWithMockedFs();

    assert.deepEqual(
        service.getRate("GROWTH_SLOW"),
        FALLBACK_RATES[5]
    );
});

test("getRate returns null for an unknown constant", () => {
    const { service } = createServiceWithMockedFs();

    assert.equal(service.getRate("GROWTH_UNKNOWN"), null);
});

test("getRate returns null for a missing constant", () => {
    const { service } = createServiceWithMockedFs();

    assert.equal(service.getRate(undefined), null);
});

test("getRate uses exact constant matching", () => {
    const { service } = createServiceWithMockedFs();

    assert.equal(service.getRate("growth_fast"), null);
});

test("getRate returns the matching database entry itself", () => {
    const { service } = createServiceWithMockedFs();

    assert.equal(
        service.getRate("GROWTH_FAST"),
        service.rates[4]
    );
});


// -----------------------------------------------
// getRequiredExp: Medium Fast
// -----------------------------------------------

test("Medium Fast uses the cube of the level", () => {
    const service = createService();

    assert.equal(service.getRequiredExp(10), 1000);
});

test("Medium Fast requires zero EXP at level zero", () => {
    const service = createService();

    assert.equal(service.getRequiredExp(0), 0);
});

test("Medium Fast requires eight EXP at level two", () => {
    const service = createService();

    assert.equal(service.getRequiredExp(2), 8);
});

test("Medium Fast requires 125000 EXP at level fifty", () => {
    const service = createService();

    assert.equal(service.getRequiredExp(50), 125000);
});

test("Medium Fast requires 1000000 EXP at level one hundred", () => {
    const service = createService();

    assert.equal(service.getRequiredExp(100), 1000000);
});

test("Medium Fast is the default growth rate", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(20),
        service.getRequiredExp(20, "GROWTH_MEDIUM_FAST")
    );
});

test("an unknown growth-rate constant falls back to Medium Fast", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(10, "GROWTH_UNKNOWN"),
        1000
    );
});


// -----------------------------------------------
// getRequiredExp: Fast
// -----------------------------------------------

test("Fast growth uses 0.8 times the cube of the level", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(10, "GROWTH_FAST"),
        800
    );
});

test("Fast growth requires six EXP at level two", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(2, "GROWTH_FAST"),
        6
    );
});

test("Fast growth requires 100000 EXP at level fifty", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(50, "GROWTH_FAST"),
        100000
    );
});

test("Fast growth floors fractional results", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(1, "GROWTH_FAST"),
        0
    );
});


// -----------------------------------------------
// getRequiredExp: Slow
// -----------------------------------------------

test("Slow growth uses 1.25 times the cube of the level", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(10, "GROWTH_SLOW"),
        1250
    );
});

test("Slow growth requires ten EXP at level two", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(2, "GROWTH_SLOW"),
        10
    );
});

test("Slow growth requires 156250 EXP at level fifty", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(50, "GROWTH_SLOW"),
        156250
    );
});

test("Slow growth floors fractional results", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(1, "GROWTH_SLOW"),
        1
    );
});


// -----------------------------------------------
// getRequiredExp: Medium Slow
// -----------------------------------------------

test("Medium Slow uses its cubic formula at level ten", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(10, "GROWTH_MEDIUM_SLOW"),
        560
    );
});

test("Medium Slow requires nine EXP at level two", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(2, "GROWTH_MEDIUM_SLOW"),
        9
    );
});

test("Medium Slow requires 117360 EXP at level fifty", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(50, "GROWTH_MEDIUM_SLOW"),
        117360
    );
});

test("Medium Slow requires 1059860 EXP at level one hundred", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(100, "GROWTH_MEDIUM_SLOW"),
        1059860
    );
});

test("Medium Slow floors the formula result", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(3, "GROWTH_MEDIUM_SLOW"),
        57
    );
});

test("Medium Slow preserves the formula's negative result at level one", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(1, "GROWTH_MEDIUM_SLOW"),
        -54
    );
});


// -----------------------------------------------
// Erratic growth curve
// -----------------------------------------------

test("Erratic uses its first formula at level one", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(1, "GROWTH_ERRATIC"),
        1
    );
});

test("Erratic uses its first formula at level fifty", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(50, "GROWTH_ERRATIC"),
        125000
    );
});

test("Erratic uses its second formula at level fifty-one", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(51, "GROWTH_ERRATIC"),
        131324
    );
});

test("Erratic uses its second formula at level sixty-eight", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(68, "GROWTH_ERRATIC"),
        257834
    );
});

test("Erratic uses its third formula at level sixty-nine", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(69, "GROWTH_ERRATIC"),
        267406
    );
});

test("Erratic uses its third formula at level ninety-eight", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(98, "GROWTH_ERRATIC"),
        584166
    );
});

test("Erratic uses its fourth formula at level ninety-nine", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(99, "GROWTH_ERRATIC"),
        591882
    );
});

test("Erratic floors its formula result", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(51, "GROWTH_ERRATIC"),
        Math.floor(51 ** 3 * (150 - 51) / 100)
    );
});


// -----------------------------------------------
// Fluctuating growth curve
// -----------------------------------------------

test("Fluctuating uses its first formula at level one", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(1, "GROWTH_FLUCTUATING"),
        0
    );
});

test("Fluctuating uses its first formula at level fifteen", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(15, "GROWTH_FLUCTUATING"),
        1980
    );
});

test("Fluctuating uses its second formula at level sixteen", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(16, "GROWTH_FLUCTUATING"),
        2457
    );
});

test("Fluctuating uses its second formula at level thirty-six", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(36, "GROWTH_FLUCTUATING"),
        46656
    );
});

test("Fluctuating uses its third formula at level thirty-seven", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(37, "GROWTH_FLUCTUATING"),
        51159
    );
});

test("Fluctuating floors its formula result", () => {
    const service = createService();

    assert.equal(
        service.getRequiredExp(16, "GROWTH_FLUCTUATING"),
        Math.floor(16 ** 3 * (16 + 14) / 50)
    );
});


// -----------------------------------------------
// getLevelFromExp: Medium Fast and default
// -----------------------------------------------

test("getLevelFromExp returns level one for zero EXP", () => {
    const service = createService();

    assert.equal(service.getLevelFromExp(0), 1);
});

test("getLevelFromExp returns level one below the level-two threshold", () => {
    const service = createService();

    assert.equal(service.getLevelFromExp(7), 1);
});

test("getLevelFromExp returns level two at exactly eight EXP", () => {
    const service = createService();

    assert.equal(service.getLevelFromExp(8), 2);
});

test("getLevelFromExp returns level two one EXP below the level-three threshold", () => {
    const service = createService();

    assert.equal(service.getLevelFromExp(26), 2);
});

test("getLevelFromExp returns level three at exactly twenty-seven EXP", () => {
    const service = createService();

    assert.equal(service.getLevelFromExp(27), 3);
});

test("getLevelFromExp returns level ten at exactly one thousand EXP", () => {
    const service = createService();

    assert.equal(service.getLevelFromExp(1000), 10);
});

test("getLevelFromExp returns level ninety-nine below one million EXP", () => {
    const service = createService();

    assert.equal(service.getLevelFromExp(999999), 99);
});

test("getLevelFromExp caps the result at level one hundred", () => {
    const service = createService();

    assert.equal(
        service.getLevelFromExp(Number.MAX_SAFE_INTEGER),
        100
    );
});

test("getLevelFromExp uses Medium Fast when the rate is omitted", () => {
    const service = createService();

    assert.equal(
        service.getLevelFromExp(1000),
        service.getLevelFromExp(1000, "GROWTH_MEDIUM_FAST")
    );
});

test("getLevelFromExp handles negative EXP by returning level one", () => {
    const service = createService();

    assert.equal(service.getLevelFromExp(-100), 1);
});


// -----------------------------------------------
// getLevelFromExp: other growth rates
// -----------------------------------------------

test("getLevelFromExp handles Fast growth at the level-two threshold", () => {
    const service = createService();

    assert.equal(
        service.getLevelFromExp(6, "GROWTH_FAST"),
        2
    );
});

test("getLevelFromExp remains level one below the Fast level-two threshold", () => {
    const service = createService();

    assert.equal(
        service.getLevelFromExp(5, "GROWTH_FAST"),
        1
    );
});

test("getLevelFromExp handles Slow growth at the level-two threshold", () => {
    const service = createService();

    assert.equal(
        service.getLevelFromExp(10, "GROWTH_SLOW"),
        2
    );
});

test("getLevelFromExp handles Medium Slow growth at the level-two threshold", () => {
    const service = createService();

    assert.equal(
        service.getLevelFromExp(9, "GROWTH_MEDIUM_SLOW"),
        2
    );
});

test("getLevelFromExp handles Medium Slow growth at the level-three threshold", () => {
    const service = createService();

    assert.equal(
        service.getLevelFromExp(57, "GROWTH_MEDIUM_SLOW"),
        3
    );
});

test("getLevelFromExp handles Erratic growth at level fifty", () => {
    const service = createService();

    assert.equal(
        service.getLevelFromExp(125000, "GROWTH_ERRATIC"),
        50
    );
});

test("getLevelFromExp handles Fluctuating growth at level fifteen", () => {
    const service = createService();

    assert.equal(
        service.getLevelFromExp(1980, "GROWTH_FLUCTUATING"),
        15
    );
});

test("getLevelFromExp uses the default curve for an unknown growth-rate constant", () => {
    const service = createService();

    assert.equal(
        service.getLevelFromExp(27, "GROWTH_UNKNOWN"),
        3
    );
});


// -----------------------------------------------
// getAllRates
// -----------------------------------------------

test("getAllRates returns all loaded rates", () => {
    const { service } = createServiceWithMockedFs();

    assert.deepEqual(
        service.getAllRates(),
        FALLBACK_RATES
    );
});

test("getAllRates returns the rates array stored on the service", () => {
    const { service } = createServiceWithMockedFs();

    assert.equal(
        service.getAllRates(),
        service.rates
    );
});

test("getAllRates reflects changes to the stored rates array", () => {
    const { service } = createServiceWithMockedFs();
    const extraRate = {
        id: 6,
        name: "Custom",
        constant: "GROWTH_CUSTOM"
    };

    service.rates.push(extraRate);

    assert.equal(
        service.getAllRates().at(-1),
        extraRate
    );
});


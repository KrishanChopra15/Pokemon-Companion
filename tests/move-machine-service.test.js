"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const MoveMachineService =
    require("../scripts/services/move-machine-service");

const PokemonMoveSlot =
    require("../scripts/domain/pokemon-move-slot");


const FIXTURES = [
    {
        species: "SPECIES_BULBASAUR",
        machines: [
            {
                constant: "TM01",
                move: {
                    constant: "MOVE_FOCUS_PUNCH",
                    name: "FOCUS PUNCH",
                    pp: 20,
                    power: 150,
                    accuracy: 100
                }
            },
            {
                constant: "HM01",
                move: {
                    constant: "MOVE_CUT",
                    name: "CUT",
                    pp: 30,
                    power: 50,
                    accuracy: 95
                }
            }
        ]
    },
    {
        species: "SPECIES_CHARMANDER",
        machines: [
            {
                constant: "TM02",
                move: {
                    constant: "MOVE_DRAGON_CLAW",
                    name: "DRAGON CLAW",
                    pp: 15,
                    power: 80,
                    accuracy: 100
                }
            }
        ]
    },
    {
        species: "SPECIES_SQUIRTLE",
        machines: []
    }
];


function createService({
    game = "firered",
    moveDatabase = null,
    machines = FIXTURES,
    rawContent
} = {}) {
    const originalReadFileSync = fs.readFileSync;
    const readCalls = [];

    fs.readFileSync = function (filePath, encoding) {
        readCalls.push({ filePath, encoding });

        if (rawContent !== undefined) {
            return rawContent;
        }

        return JSON.stringify(machines);
    };

    try {
        const service = new MoveMachineService(
            game,
            moveDatabase
        );

        return { service, readCalls };
    } finally {
        fs.readFileSync = originalReadFileSync;
    }
}


// -----------------------------------------------
// Constructor and database loading
// -----------------------------------------------

test("constructor loads the default FireRed machine database", () => {
    const { service, readCalls } = createService();

    assert.equal(readCalls.length, 1);
    assert.equal(
        readCalls[0].filePath,
        path.join(
            __dirname,
            "../database/generated/firered/pokemon-machines.json"
        )
    );
    assert.equal(readCalls[0].encoding, "utf8");
    assert.equal(service.machines.length, FIXTURES.length);
});

test("constructor uses the requested game in the database path", () => {
    const { readCalls } = createService({
        game: "emerald"
    });

    assert.equal(
        readCalls[0].filePath,
        path.join(
            __dirname,
            "../database/generated/emerald/pokemon-machines.json"
        )
    );
});

test("constructor parses the machine database JSON", () => {
    const { service } = createService();

    assert.deepEqual(service.machines, FIXTURES);
});

test("constructor stores the injected move database", () => {
    const moveDatabase = {
        getMoveByConstant() {
            return null;
        }
    };

    const { service } = createService({ moveDatabase });

    assert.equal(service.moveDatabase, moveDatabase);
});

test("constructor defaults the move database to null", () => {
    const { service } = createService();

    assert.equal(service.moveDatabase, null);
});

test("constructor throws when the database contains invalid JSON", () => {
    assert.throws(
        () => createService({ rawContent: "{ invalid json" }),
        SyntaxError
    );
});


// -----------------------------------------------
// getMachines
// -----------------------------------------------

test("getMachines finds a Pokémon using its plain species name", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getMachines("Bulbasaur"),
        FIXTURES[0].machines
    );
});

test("getMachines accepts an existing SPECIES_ constant", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getMachines("SPECIES_BULBASAUR"),
        FIXTURES[0].machines
    );
});

test("getMachines normalizes a plain lowercase species name", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getMachines("bulbasaur"),
        FIXTURES[0].machines
    );
});

test("getMachines normalizes a mixed-case species name", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getMachines("cHaRmAnDeR"),
        FIXTURES[1].machines
    );
});

test("getMachines returns an empty array for an unknown species", () => {
    const { service } = createService();

    assert.deepEqual(service.getMachines("MISSINGNO"), []);
});

test("getMachines returns the original machine list for a match", () => {
    const { service } = createService();

    assert.equal(
        service.getMachines("Bulbasaur"),
        service.machines[0].machines
    );
});

test("getMachines returns an empty array for a species with no machines", () => {
    const { service } = createService();

    assert.deepEqual(service.getMachines("Squirtle"), []);
});


// -----------------------------------------------
// canLearn
// -----------------------------------------------

test("canLearn returns true for a compatible TM", () => {
    const { service } = createService();

    assert.equal(
        service.canLearn("Bulbasaur", "TM01"),
        true
    );
});

test("canLearn returns true for a compatible HM", () => {
    const { service } = createService();

    assert.equal(
        service.canLearn("Bulbasaur", "HM01"),
        true
    );
});

test("canLearn returns false for an incompatible machine", () => {
    const { service } = createService();

    assert.equal(
        service.canLearn("Bulbasaur", "TM02"),
        false
    );
});

test("canLearn returns false for an unknown species", () => {
    const { service } = createService();

    assert.equal(
        service.canLearn("MISSINGNO", "TM01"),
        false
    );
});

test("canLearn accepts a SPECIES_ constant", () => {
    const { service } = createService();

    assert.equal(
        service.canLearn("SPECIES_CHARMANDER", "TM02"),
        true
    );
});

test("canLearn uses exact machine constant matching", () => {
    const { service } = createService();

    assert.equal(
        service.canLearn("Bulbasaur", "tm01"),
        false
    );
});


// -----------------------------------------------
// getCompatibleMachines
// -----------------------------------------------

test("getCompatibleMachines returns a Pokémon's machines", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getCompatibleMachines("Bulbasaur"),
        FIXTURES[0].machines
    );
});

test("getCompatibleMachines returns the same list as getMachines", () => {
    const { service } = createService();

    assert.equal(
        service.getCompatibleMachines("Bulbasaur"),
        service.getMachines("Bulbasaur")
    );
});

test("getCompatibleMachines returns an empty array for an unknown species", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getCompatibleMachines("UNKNOWN"),
        []
    );
});


// -----------------------------------------------
// getMove
// -----------------------------------------------

test("getMove returns the move reference for a compatible machine", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getMove("Bulbasaur", "TM01"),
        FIXTURES[0].machines[0].move
    );
});

test("getMove returns the correct move for another machine", () => {
    const { service } = createService();

    assert.deepEqual(
        service.getMove("Bulbasaur", "HM01"),
        FIXTURES[0].machines[1].move
    );
});

test("getMove returns null for an incompatible machine", () => {
    const { service } = createService();

    assert.equal(
        service.getMove("Bulbasaur", "TM02"),
        null
    );
});

test("getMove returns null for an unknown species", () => {
    const { service } = createService();

    assert.equal(
        service.getMove("UNKNOWN", "TM01"),
        null
    );
});

test("getMove matches machine constants exactly", () => {
    const { service } = createService();

    assert.equal(
        service.getMove("Bulbasaur", "tm01"),
        null
    );
});


// -----------------------------------------------
// resolveMove
// -----------------------------------------------

test("resolveMove returns null when the Pokémon cannot learn the machine move", () => {
    const { service } = createService();

    assert.equal(
        service.resolveMove("Bulbasaur", "TM02"),
        null
    );
});

test("resolveMove returns the reference when no move database is injected", () => {
    const { service } = createService();

    const result = service.resolveMove("Bulbasaur", "TM01");

    assert.equal(result, service.getMove("Bulbasaur", "TM01"));
});

test("resolveMove looks up the referenced move constant", () => {
    const calls = [];

    const completeMove = {
        constant: "MOVE_FOCUS_PUNCH",
        name: "FOCUS PUNCH",
        pp: 20,
        power: 150,
        accuracy: 100,
        description: "Complete move data"
    };

    const moveDatabase = {
        getMoveByConstant(constant) {
            calls.push(constant);
            return completeMove;
        }
    };

    const { service } = createService({ moveDatabase });

    const result = service.resolveMove("Bulbasaur", "TM01");

    assert.deepEqual(calls, ["MOVE_FOCUS_PUNCH"]);
    assert.equal(result, completeMove);
});

test("resolveMove returns complete move data when lookup succeeds", () => {
    const completeMove = {
        constant: "MOVE_FOCUS_PUNCH",
        name: "FOCUS PUNCH",
        pp: 20,
        power: 150,
        accuracy: 100,
        extraData: true
    };

    const moveDatabase = {
        getMoveByConstant() {
            return completeMove;
        }
    };

    const { service } = createService({ moveDatabase });

    assert.equal(
        service.resolveMove("Bulbasaur", "TM01"),
        completeMove
    );
});

test("resolveMove falls back to the reference when lookup returns null", () => {
    const moveDatabase = {
        getMoveByConstant() {
            return null;
        }
    };

    const { service } = createService({ moveDatabase });

    assert.equal(
        service.resolveMove("Bulbasaur", "TM01"),
        service.getMove("Bulbasaur", "TM01")
    );
});

test("resolveMove falls back to the reference when lookup returns undefined", () => {
    const moveDatabase = {
        getMoveByConstant() {
            return undefined;
        }
    };

    const { service } = createService({ moveDatabase });

    assert.equal(
        service.resolveMove("Bulbasaur", "TM01"),
        service.getMove("Bulbasaur", "TM01")
    );
});

test("resolveMove does not query the move database for an incompatible machine", () => {
    let lookupCalled = false;

    const moveDatabase = {
        getMoveByConstant() {
            lookupCalled = true;
            return null;
        }
    };

    const { service } = createService({ moveDatabase });

    assert.equal(
        service.resolveMove("Bulbasaur", "TM02"),
        null
    );
    assert.equal(lookupCalled, false);
});


// -----------------------------------------------
// teachMove
// -----------------------------------------------

test("teachMove returns failure for an incompatible machine", () => {
    const { service } = createService();

    assert.deepEqual(
        service.teachMove("Bulbasaur", "TM02"),
        {
            success: false,
            reason: "Pokemon cannot learn this move"
        }
    );
});

test("teachMove returns failure for an unknown species", () => {
    const { service } = createService();

    assert.deepEqual(
        service.teachMove("UNKNOWN", "TM01"),
        {
            success: false,
            reason: "Pokemon cannot learn this move"
        }
    );
});

test("teachMove returns a successful result for a compatible machine", () => {
    const { service } = createService();

    const result = service.teachMove("Bulbasaur", "TM01");

    assert.equal(result.success, true);
    assert.ok(result.move instanceof PokemonMoveSlot);
    assert.equal(result.data, service.getMove("Bulbasaur", "TM01"));
});

test("teachMove creates a Pokémon move slot", () => {
    const { service } = createService();

    const result = service.teachMove("Bulbasaur", "TM01");

    assert.ok(result.move instanceof PokemonMoveSlot);
});

test("teachMove sets the move slot constant", () => {
    const { service } = createService();

    const result = service.teachMove("Bulbasaur", "TM01");

    assert.equal(
        result.move.constant,
        "MOVE_FOCUS_PUNCH"
    );
});

test("teachMove initializes current PP from the move data", () => {
    const { service } = createService();

    const result = service.teachMove("Bulbasaur", "TM01");

    assert.equal(result.move.currentPP, 20);
});

test("teachMove initializes maximum PP from the move data", () => {
    const { service } = createService();

    const result = service.teachMove("Bulbasaur", "TM01");

    assert.equal(result.move.maxPP, 20);
});

test("teachMove defaults current and maximum PP to zero when PP is zero", () => {
    const machines = [
        {
            species: "SPECIES_BULBASAUR",
            machines: [
                {
                    constant: "TM99",
                    move: {
                        constant: "MOVE_ZERO_PP",
                        name: "ZERO PP MOVE",
                        pp: 0
                    }
                }
            ]
        }
    ];

    const { service } = createService({ machines });

    const result = service.teachMove("Bulbasaur", "TM99");

    assert.equal(result.success, true);
    assert.equal(result.move.currentPP, 0);
    assert.equal(result.move.maxPP, 0);
});

test("teachMove defaults current and maximum PP to zero when PP is absent", () => {
    const machines = [
        {
            species: "SPECIES_BULBASAUR",
            machines: [
                {
                    constant: "TM99",
                    move: {
                        constant: "MOVE_NO_PP",
                        name: "NO PP MOVE"
                    }
                }
            ]
        }
    ];

    const { service } = createService({ machines });

    const result = service.teachMove("Bulbasaur", "TM99");

    assert.equal(result.success, true);
    assert.equal(result.move.currentPP, 0);
    assert.equal(result.move.maxPP, 0);
});

test("teachMove returns the move data alongside the move slot", () => {
    const { service } = createService();

    const result = service.teachMove("Bulbasaur", "HM01");

    assert.equal(result.success, true);
    assert.equal(result.data, service.getMove("Bulbasaur", "HM01"));
    assert.equal(result.data.constant, "MOVE_CUT");
});

test("teachMove uses resolved move data when a move database is injected", () => {
    const completeMove = {
        constant: "MOVE_FOCUS_PUNCH",
        name: "FOCUS PUNCH",
        pp: 25,
        power: 150,
        accuracy: 100
    };

    const moveDatabase = {
        getMoveByConstant() {
            return completeMove;
        }
    };

    const { service } = createService({ moveDatabase });

    const result = service.teachMove("Bulbasaur", "TM01");

    assert.equal(result.success, true);
    assert.equal(result.data, completeMove);
    assert.equal(result.move.currentPP, 25);
    assert.equal(result.move.maxPP, 25);
});

test("teaching one move does not mutate the machine database", () => {
    const { service } = createService();
    const originalMove = FIXTURES[0].machines[0].move;
    const originalSnapshot = { ...originalMove };

    service.teachMove("Bulbasaur", "TM01");

    assert.deepEqual(originalMove, originalSnapshot);
});

test("teaching a move does not modify the fixture machine list", () => {
    const { service } = createService();
    const originalMachines = service.getMachines("Bulbasaur");
    const originalLength = originalMachines.length;

    service.teachMove("Bulbasaur", "TM01");

    assert.equal(originalMachines.length, originalLength);
});

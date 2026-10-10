"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattleValidationService = require("../scripts/services/battle-validation-service.js");

// --------------------------------
// Test helpers
// --------------------------------

function createMove(overrides = {}) {
    return {
        name: "Tackle",
        constant: "MOVE_TACKLE",
        currentPP: 10,
        pp: 35,
        ...overrides
    };
}

function createPokemon(moves = [createMove()]) {
    return {
        species: "BULBASAUR",
        name: "Bulbasaur",
        moves
    };
}

function createService() {
    return new BattleValidationService();
}

// --------------------------------
// Constructor
// --------------------------------

test("BattleValidationService initializes the STRUGGLE constant", () => {
    const service = createService();

    assert.equal(service.struggleConstant, "MOVE_STRUGGLE");
});

// --------------------------------
// Basic move validation
// --------------------------------

test("BattleValidationService rejects a missing Pokémon", () => {
    const service = createService();

    const result = service.validateMove(null, "MOVE_TACKLE");

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid Pokémon");
});

test("BattleValidationService rejects an undefined Pokémon", () => {
    const service = createService();

    const result = service.validateMove(undefined, "MOVE_TACKLE");

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid Pokémon");
});

test("BattleValidationService rejects a missing move when usable moves remain", () => {
    const service = createService();
    const pokemon = createPokemon();

    const result = service.validateMove(pokemon, null);

    assert.equal(result.success, false);
    assert.equal(result.reason, "No move selected");
});

test("BattleValidationService requests STRUGGLE when no move is selected and no PP remains", () => {
    const service = createService();

    const pokemon = createPokemon([
        createMove({ currentPP: 0, pp: 0 })
    ]);

    const result = service.validateMove(pokemon, null);

    assert.deepEqual(result, {
        success: true,
        struggle: true
    });
});

test("BattleValidationService requests STRUGGLE when the Pokémon has no moves", () => {
    const service = createService();

    const result = service.validateMove(
        createPokemon([]),
        undefined
    );

    assert.deepEqual(result, {
        success: true,
        struggle: true
    });
});

// --------------------------------
// STRUGGLE validation
// --------------------------------

test("BattleValidationService accepts string STRUGGLE when no usable moves remain", () => {
    const service = createService();

    const pokemon = createPokemon([
        createMove({ currentPP: 0, pp: 0 })
    ]);

    const result = service.validateMove(
        pokemon,
        "MOVE_STRUGGLE"
    );

    assert.deepEqual(result, {
        success: true
    });
});

test("BattleValidationService accepts object STRUGGLE when no usable moves remain", () => {
    const service = createService();

    const pokemon = createPokemon([
        createMove({ currentPP: 0, pp: 0 })
    ]);

    const result = service.validateMove(
        pokemon,
        {
            name: "Struggle",
            constant: "MOVE_STRUGGLE"
        }
    );

    assert.deepEqual(result, {
        success: true
    });
});

test("BattleValidationService rejects STRUGGLE while usable moves remain", () => {
    const service = createService();
    const pokemon = createPokemon();

    const result = service.validateMove(
        pokemon,
        "MOVE_STRUGGLE"
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Cannot use STRUGGLE while moves remain"
    );
});

test("BattleValidationService rejects object STRUGGLE while usable moves remain", () => {
    const service = createService();
    const pokemon = createPokemon();

    const result = service.validateMove(
        pokemon,
        {
            name: "Struggle",
            constant: "MOVE_STRUGGLE"
        }
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Cannot use STRUGGLE while moves remain"
    );
});

// --------------------------------
// Known move identification
// --------------------------------

test("BattleValidationService accepts a known move identified by constant", () => {
    const service = createService();
    const move = createMove();
    const pokemon = createPokemon([move]);

    const result = service.validateMove(
        pokemon,
        {
            name: "Different display name",
            constant: "MOVE_TACKLE"
        }
    );

    assert.equal(result.success, true);
    assert.equal(result.move, move);
});

test("BattleValidationService accepts a known move identified by name", () => {
    const service = createService();
    const move = createMove();
    const pokemon = createPokemon([move]);

    const result = service.validateMove(
        pokemon,
        {
            name: "Tackle"
        }
    );

    assert.equal(result.success, true);
    assert.equal(result.move, move);
});

test("BattleValidationService accepts a known move supplied as a string", () => {
    const service = createService();
    const move = createMove();
    const pokemon = createPokemon([move]);

    const result = service.validateMove(
        pokemon,
        "Tackle"
    );

    assert.equal(result.success, true);
    assert.equal(result.move, move);
});

test("BattleValidationService matches a MOVE_ constant to a known move name", () => {
    const service = createService();

    const move = {
        name: "TACKLE",
        currentPP: 10
    };

    const pokemon = createPokemon([move]);

    const result = service.validateMove(
        pokemon,
        "MOVE_TACKLE"
    );

    assert.equal(result.success, true);
    assert.equal(result.move, move);
});

test("BattleValidationService returns the actual known move object", () => {
    const service = createService();

    const move = createMove({
        currentPP: 7
    });

    const pokemon = createPokemon([move]);

    const result = service.validateMove(
        pokemon,
        "MOVE_TACKLE"
    );

    assert.equal(result.success, true);
    assert.strictEqual(result.move, move);
});

test("BattleValidationService rejects a move the Pokémon does not know", () => {
    const service = createService();

    const result = service.validateMove(
        createPokemon(),
        "MOVE_THUNDERBOLT"
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Move not known by Pokémon");
});

test("BattleValidationService rejects a move with an unknown name and constant", () => {
    const service = createService();

    const result = service.validateMove(
        createPokemon(),
        {
            name: "Thunderbolt",
            constant: "MOVE_THUNDERBOLT"
        }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Move not known by Pokémon");
});

// --------------------------------
// PP validation
// --------------------------------

test("BattleValidationService accepts a known move with positive current PP", () => {
    const service = createService();
    const move = createMove({ currentPP: 1 });

    const result = service.validateMove(
        createPokemon([move]),
        move
    );

    assert.equal(result.success, true);
    assert.equal(result.move, move);
});

test("BattleValidationService rejects a known move with zero PP", () => {
    const service = createService();

    const move = createMove({
        currentPP: 0,
        pp: 0
    });

    const result = service.validateMove(
        createPokemon([move]),
        move
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "No PP remaining");
    assert.equal(result.struggle, true);
});

test("BattleValidationService indicates STRUGGLE is unavailable when another move has PP", () => {
    const service = createService();

    const exhaustedMove = createMove({
        currentPP: 0,
        pp: 0
    });

    const usableMove = createMove({
        name: "Growl",
        constant: "MOVE_GROWL",
        currentPP: 5,
        pp: 40
    });

    const result = service.validateMove(
        createPokemon([exhaustedMove, usableMove]),
        exhaustedMove
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "No PP remaining");
    assert.equal(result.struggle, false);
});

test("BattleValidationService indicates STRUGGLE is available when all moves are exhausted", () => {
    const service = createService();

    const firstMove = createMove({
        currentPP: 0,
        pp: 0
    });

    const secondMove = createMove({
        name: "Growl",
        constant: "MOVE_GROWL",
        currentPP: 0,
        pp: 0
    });

    const result = service.validateMove(
        createPokemon([firstMove, secondMove]),
        firstMove
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "No PP remaining");
    assert.equal(result.struggle, true);
});

// --------------------------------
// getKnownMove
// --------------------------------

test("BattleValidationService returns null when the selected move is missing", () => {
    const service = createService();

    assert.equal(
        service.getKnownMove(createPokemon(), null),
        null
    );
});

test("BattleValidationService finds a known move by constant", () => {
    const service = createService();
    const move = createMove();
    const pokemon = createPokemon([move]);

    assert.strictEqual(
        service.getKnownMove(pokemon, {
            constant: "MOVE_TACKLE"
        }),
        move
    );
});

test("BattleValidationService finds a known move by exact name", () => {
    const service = createService();
    const move = createMove();
    const pokemon = createPokemon([move]);

    assert.strictEqual(
        service.getKnownMove(pokemon, {
            name: "Tackle"
        }),
        move
    );
});

test("BattleValidationService returns undefined for an unknown move", () => {
    const service = createService();

    assert.equal(
        service.getKnownMove(
            createPokemon(),
            "MOVE_THUNDERBOLT"
        ),
        undefined
    );
});

// --------------------------------
// getUsableMoves
// --------------------------------

test("BattleValidationService returns no usable moves for a missing Pokémon", () => {
    const service = createService();

    assert.deepEqual(service.getUsableMoves(null), []);
});

test("BattleValidationService returns no usable moves when moves is missing", () => {
    const service = createService();

    assert.deepEqual(
        service.getUsableMoves({
            name: "Bulbasaur"
        }),
        []
    );
});

test("BattleValidationService returns no usable moves when moves is not an array", () => {
    const service = createService();

    assert.deepEqual(
        service.getUsableMoves({
            moves: "Tackle"
        }),
        []
    );
});

test("BattleValidationService filters out moves with no PP", () => {
    const service = createService();

    const usableMove = createMove({
        currentPP: 5
    });

    const exhaustedMove = createMove({
        name: "Growl",
        constant: "MOVE_GROWL",
        currentPP: 0,
        pp: 0
    });

    const pokemon = createPokemon([
        usableMove,
        exhaustedMove
    ]);

    assert.deepEqual(
        service.getUsableMoves(pokemon),
        [usableMove]
    );
});

test("BattleValidationService keeps moves with positive legacy PP", () => {
    const service = createService();

    const legacyMove = {
        name: "Tackle",
        pp: 5
    };

    assert.deepEqual(
        service.getUsableMoves(
            createPokemon([legacyMove])
        ),
        [legacyMove]
    );
});

// --------------------------------
// hasNoPP
// --------------------------------

test("BattleValidationService reports no PP for a Pokémon with no moves", () => {
    const service = createService();

    assert.equal(
        service.hasNoPP(createPokemon([])),
        true
    );
});

test("BattleValidationService reports no PP for a missing Pokémon", () => {
    const service = createService();

    assert.equal(service.hasNoPP(null), true);
});

test("BattleValidationService reports no PP when all moves are exhausted", () => {
    const service = createService();

    assert.equal(
        service.hasNoPP(
            createPokemon([
                createMove({ currentPP: 0, pp: 0 }),
                createMove({
                    name: "Growl",
                    constant: "MOVE_GROWL",
                    currentPP: 0,
                    pp: 0
                })
            ])
        ),
        true
    );
});

test("BattleValidationService reports remaining PP when a move is usable", () => {
    const service = createService();

    assert.equal(
        service.hasNoPP(
            createPokemon([
                createMove({ currentPP: 0, pp: 0 }),
                createMove({
                    name: "Growl",
                    constant: "MOVE_GROWL",
                    currentPP: 1
                })
            ])
        ),
        false
    );
});

// --------------------------------
// getCurrentPP
// --------------------------------

test("BattleValidationService returns zero PP for a missing move", () => {
    const service = createService();

    assert.equal(service.getCurrentPP(null), 0);
});

test("BattleValidationService reads numeric currentPP", () => {
    const service = createService();

    assert.equal(
        service.getCurrentPP({ currentPP: 8 }),
        8
    );
});

test("BattleValidationService accepts currentPP stored as a numeric string", () => {
    const service = createService();

    assert.equal(
        service.getCurrentPP({ currentPP: "6" }),
        6
    );
});

test("BattleValidationService clamps negative currentPP to zero", () => {
    const service = createService();

    assert.equal(
        service.getCurrentPP({ currentPP: -5 }),
        0
    );
});

test("BattleValidationService falls back to legacy pp when currentPP is absent", () => {
    const service = createService();

    assert.equal(
        service.getCurrentPP({ pp: 12 }),
        12
    );
});

test("BattleValidationService prioritizes currentPP over legacy pp", () => {
    const service = createService();

    assert.equal(
        service.getCurrentPP({
            currentPP: 0,
            pp: 20
        }),
        0
    );
});

test("BattleValidationService falls back to legacy pp when currentPP is not numeric", () => {
    const service = createService();

    assert.equal(
        service.getCurrentPP({
            currentPP: "invalid",
            pp: 7
        }),
        7
    );
});

test("BattleValidationService returns zero when both PP values are absent", () => {
    const service = createService();

    assert.equal(
        service.getCurrentPP({
            name: "Tackle"
        }),
        0
    );
});

test("BattleValidationService returns zero when both PP values are invalid", () => {
    const service = createService();

    assert.equal(
        service.getCurrentPP({
            currentPP: "invalid",
            pp: "invalid"
        }),
        0
    );
});

// --------------------------------
// No unintended mutations
// --------------------------------

test("BattleValidationService does not modify Pokémon or move data during validation", () => {
    const service = createService();

    const move = createMove({
        currentPP: 5
    });

    const pokemon = createPokemon([move]);

    const pokemonBefore = structuredClone(pokemon);

    const result = service.validateMove(
        pokemon,
        "MOVE_TACKLE"
    );

    assert.equal(result.success, true);
    assert.deepEqual(pokemon, pokemonBefore);
});
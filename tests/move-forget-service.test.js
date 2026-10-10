"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const MoveForgetService = require("../scripts/services/move-forget-service");

function makeMove(constant, extra = {}) {
    return { constant, ...extra };
}

function makeMoves(...constants) {
    return constants.map(constant => makeMove(constant));
}

test("findMoveIndex returns -1 for a non-array", () => {
    const service = new MoveForgetService();

    assert.equal(service.findMoveIndex(null, "TACKLE"), -1);
    assert.equal(service.findMoveIndex(undefined, "TACKLE"), -1);
    assert.equal(service.findMoveIndex("TACKLE", "TACKLE"), -1);
    assert.equal(service.findMoveIndex({}, "TACKLE"), -1);
});

test("findMoveIndex returns -1 for an empty array", () => {
    const service = new MoveForgetService();

    assert.equal(service.findMoveIndex([], "TACKLE"), -1);
});

test("findMoveIndex finds a move at the beginning", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL", "EMBER");

    assert.equal(service.findMoveIndex(moves, "TACKLE"), 0);
});

test("findMoveIndex finds a move in the middle", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL", "EMBER");

    assert.equal(service.findMoveIndex(moves, "GROWL"), 1);
});

test("findMoveIndex finds a move at the end", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL", "EMBER");

    assert.equal(service.findMoveIndex(moves, "EMBER"), 2);
});

test("findMoveIndex returns -1 when the move is absent", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL");

    assert.equal(service.findMoveIndex(moves, "EMBER"), -1);
});

test("findMoveIndex compares move constants rather than object identity", () => {
    const service = new MoveForgetService();
    const moves = [makeMove("TACKLE")];

    assert.equal(
        service.findMoveIndex(moves, "TACKLE"),
        0
    );
});

test("findMoveIndex is case-sensitive", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE");

    assert.equal(service.findMoveIndex(moves, "tackle"), -1);
});

test("findMoveIndex returns the first matching index for duplicate constants", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "EMBER", "TACKLE");

    assert.equal(service.findMoveIndex(moves, "TACKLE"), 0);
});

test("findMoveIndex does not mutate the move array", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL");
    const originalMoves = [...moves];

    service.findMoveIndex(moves, "GROWL");

    assert.deepEqual(moves, originalMoves);
});

test("knowsMove returns false for a non-array", () => {
    const service = new MoveForgetService();

    assert.equal(service.knowsMove(null, "TACKLE"), false);
    assert.equal(service.knowsMove(undefined, "TACKLE"), false);
    assert.equal(service.knowsMove("TACKLE", "TACKLE"), false);
});

test("knowsMove returns false for an empty array", () => {
    const service = new MoveForgetService();

    assert.equal(service.knowsMove([], "TACKLE"), false);
});

test("knowsMove returns true when the move is present", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL");

    assert.equal(service.knowsMove(moves, "GROWL"), true);
});

test("knowsMove returns false when the move is absent", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL");

    assert.equal(service.knowsMove(moves, "EMBER"), false);
});

test("knowsMove is case-sensitive", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE");

    assert.equal(service.knowsMove(moves, "tackle"), false);
});

test("knowsMove does not remove or reorder moves", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL", "EMBER");
    const originalMoves = [...moves];

    service.knowsMove(moves, "GROWL");

    assert.deepEqual(moves, originalMoves);
});

test("forgetMove returns failure for a non-array", () => {
    const service = new MoveForgetService();

    assert.deepEqual(service.forgetMove(null, "TACKLE"), {
        success: false,
        reason: "Move not found"
    });
});

test("forgetMove returns failure for an empty array", () => {
    const service = new MoveForgetService();

    assert.deepEqual(service.forgetMove([], "TACKLE"), {
        success: false,
        reason: "Move not found"
    });
});

test("forgetMove returns failure when the move is absent", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL");
    const originalMoves = [...moves];

    const result = service.forgetMove(moves, "EMBER");

    assert.deepEqual(result, {
        success: false,
        reason: "Move not found"
    });
    assert.deepEqual(moves, originalMoves);
});

test("forgetMove removes a move from the beginning", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL", "EMBER");

    const result = service.forgetMove(moves, "TACKLE");

    assert.equal(result.success, true);
    assert.deepEqual(
        moves.map(move => move.constant),
        ["GROWL", "EMBER"]
    );
});

test("forgetMove removes a move from the middle", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL", "EMBER");

    const result = service.forgetMove(moves, "GROWL");

    assert.equal(result.success, true);
    assert.deepEqual(
        moves.map(move => move.constant),
        ["TACKLE", "EMBER"]
    );
});

test("forgetMove removes a move from the end", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL", "EMBER");

    const result = service.forgetMove(moves, "EMBER");

    assert.equal(result.success, true);
    assert.deepEqual(
        moves.map(move => move.constant),
        ["TACKLE", "GROWL"]
    );
});

test("forgetMove returns the forgotten move constant", () => {
    const service = new MoveForgetService();
    const moves = [makeMove("TACKLE", { currentPP: 12 })];

    const result = service.forgetMove(moves, "TACKLE");

    assert.equal(result.success, true);
    assert.equal(result.forgotten, "TACKLE");
});

test("forgetMove returns the original forgotten move object", () => {
    const service = new MoveForgetService();
    const forgottenMove = makeMove("TACKLE", { currentPP: 12 });
    const moves = [forgottenMove];

    const result = service.forgetMove(moves, "TACKLE");

    assert.equal(result.success, true);
    assert.strictEqual(result.move, forgottenMove);
});

test("forgetMove preserves the forgotten move's extra properties", () => {
    const service = new MoveForgetService();
    const forgottenMove = makeMove("TACKLE", {
        currentPP: 7,
        maxPP: 35,
        ppUps: 2
    });
    const moves = [forgottenMove];

    const result = service.forgetMove(moves, "TACKLE");

    assert.equal(result.success, true);
    assert.deepEqual(result.move, {
        constant: "TACKLE",
        currentPP: 7,
        maxPP: 35,
        ppUps: 2
    });
});

test("forgetMove returns the original object reference, not a copy", () => {
    const service = new MoveForgetService();
    const forgottenMove = makeMove("TACKLE");
    const moves = [forgottenMove];

    const result = service.forgetMove(moves, "TACKLE");

    assert.strictEqual(result.move, forgottenMove);
});

test("forgetMove preserves the order and identities of remaining moves", () => {
    const service = new MoveForgetService();
    const first = makeMove("TACKLE");
    const forgotten = makeMove("GROWL");
    const third = makeMove("EMBER");
    const moves = [first, forgotten, third];

    service.forgetMove(moves, "GROWL");

    assert.equal(moves.length, 2);
    assert.strictEqual(moves[0], first);
    assert.strictEqual(moves[1], third);
});

test("forgetMove removes only the first duplicate constant", () => {
    const service = new MoveForgetService();
    const first = makeMove("TACKLE", { id: 1 });
    const second = makeMove("TACKLE", { id: 2 });
    const moves = [first, second];

    const result = service.forgetMove(moves, "TACKLE");

    assert.equal(result.success, true);
    assert.strictEqual(result.move, first);
    assert.deepEqual(moves, [second]);
});

test("forgetMove can remove the only move", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE");

    const result = service.forgetMove(moves, "TACKLE");

    assert.equal(result.success, true);
    assert.equal(moves.length, 0);
});

test("forgetMove does not replace the original array", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL");
    const originalArray = moves;

    service.forgetMove(moves, "TACKLE");

    assert.strictEqual(moves, originalArray);
});

test("forgetMove returns only the documented success fields", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE");

    const result = service.forgetMove(moves, "TACKLE");

    assert.deepEqual(Object.keys(result).sort(), [
        "forgotten",
        "move",
        "success"
    ]);
});

test("forgetPokemonMove initializes missing moves to an empty array", () => {
    const service = new MoveForgetService();
    const pokemon = {};

    const result = service.forgetPokemonMove(pokemon, "TACKLE");

    assert.deepEqual(pokemon.moves, []);
    assert.deepEqual(result, {
        success: false,
        reason: "Move not found"
    });
});

test("forgetPokemonMove initializes undefined moves to an empty array", () => {
    const service = new MoveForgetService();
    const pokemon = { moves: undefined };

    service.forgetPokemonMove(pokemon, "TACKLE");

    assert.deepEqual(pokemon.moves, []);
});

test("forgetPokemonMove initializes null moves to an empty array", () => {
    const service = new MoveForgetService();
    const pokemon = { moves: null };

    service.forgetPokemonMove(pokemon, "TACKLE");

    assert.deepEqual(pokemon.moves, []);
});

test("forgetPokemonMove removes a known Pokémon move", () => {
    const service = new MoveForgetService();
    const pokemon = { moves: makeMoves("TACKLE", "GROWL") };

    const result = service.forgetPokemonMove(pokemon, "GROWL");

    assert.equal(result.success, true);
    assert.deepEqual(
        pokemon.moves.map(move => move.constant),
        ["TACKLE"]
    );
});

test("forgetPokemonMove returns the forgotten Pokémon move", () => {
    const service = new MoveForgetService();
    const forgottenMove = makeMove("TACKLE", { currentPP: 5 });
    const pokemon = { moves: [forgottenMove] };

    const result = service.forgetPokemonMove(pokemon, "TACKLE");

    assert.equal(result.success, true);
    assert.equal(result.forgotten, "TACKLE");
    assert.strictEqual(result.move, forgottenMove);
});

test("forgetPokemonMove leaves other Pokémon moves intact", () => {
    const service = new MoveForgetService();
    const first = makeMove("TACKLE");
    const second = makeMove("GROWL");
    const third = makeMove("EMBER");
    const pokemon = { moves: [first, second, third] };

    service.forgetPokemonMove(pokemon, "GROWL");

    assert.deepEqual(pokemon.moves, [first, third]);
});

test("forgetPokemonMove returns failure for a missing move", () => {
    const service = new MoveForgetService();
    const pokemon = { moves: makeMoves("TACKLE") };

    const result = service.forgetPokemonMove(pokemon, "EMBER");

    assert.deepEqual(result, {
        success: false,
        reason: "Move not found"
    });
    assert.deepEqual(
        pokemon.moves.map(move => move.constant),
        ["TACKLE"]
    );
});

test("forgetPokemonMove preserves an existing moves array reference", () => {
    const service = new MoveForgetService();
    const moves = makeMoves("TACKLE", "GROWL");
    const pokemon = { moves };

    service.forgetPokemonMove(pokemon, "TACKLE");

    assert.strictEqual(pokemon.moves, moves);
});

test("forgetPokemonMove initializes a false moves property to an empty array", () => {
    const service = new MoveForgetService();
    const pokemon = { moves: false };

    const result = service.forgetPokemonMove(pokemon, "TACKLE");

    assert.deepEqual(pokemon.moves, []);
    assert.equal(result.success, false);
});

test("forgetPokemonMove initializes an empty-string moves property to an empty array", () => {
    const service = new MoveForgetService();
    const pokemon = { moves: "" };

    const result = service.forgetPokemonMove(pokemon, "TACKLE");

    assert.deepEqual(pokemon.moves, []);
    assert.equal(result.success, false);
});


test("forgetPokemonMove returns failure for a truthy non-array moves property", () => {
    const service = new MoveForgetService();
    const moves = { constant: "TACKLE" };
    const pokemon = { moves };

    const result = service.forgetPokemonMove(pokemon, "TACKLE");

    assert.deepEqual(result, {
        success: false,
        reason: "Move not found"
    });
    assert.strictEqual(pokemon.moves, moves);
});


test("forgetPokemonMove does not mutate unrelated Pokémon properties", () => {
    const service = new MoveForgetService();
    const pokemon = {
        name: "Pikachu",
        level: 12,
        moves: makeMoves("TACKLE", "GROWL")
    };

    service.forgetPokemonMove(pokemon, "TACKLE");

    assert.equal(pokemon.name, "Pikachu");
    assert.equal(pokemon.level, 12);
});

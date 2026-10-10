"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const MoveReplacementService = require("../scripts/services/move-replacement-service");
const PokemonMoveSlot = require("../scripts/domain/pokemon-move-slot");

function makeMove(constant, pp = 10) {
    return { constant, pp };
}

function makeSlot(constant, currentPP = 10, maxPP = 10) {
    return new PokemonMoveSlot({
        constant,
        currentPP,
        maxPP
    });
}

function makeMoves(...constants) {
    return constants.map(constant => makeSlot(constant));
}

test("constructor defaults to a maximum of four moves", () => {
    const service = new MoveReplacementService();

    assert.equal(service.maxMoves, 4);
});

test("constructor accepts a custom move capacity", () => {
    const service = new MoveReplacementService(6);

    assert.equal(service.maxMoves, 6);
});

test("canAddMove returns true when the move list is empty", () => {
    const service = new MoveReplacementService();

    assert.equal(service.canAddMove([]), true);
});

test("canAddMove returns true below the default capacity", () => {
    const service = new MoveReplacementService();

    assert.equal(service.canAddMove(makeMoves("TACKLE", "GROWL", "SCRATCH")), true);
});

test("canAddMove returns false at the default capacity", () => {
    const service = new MoveReplacementService();

    assert.equal(
        service.canAddMove(makeMoves("TACKLE", "GROWL", "SCRATCH", "EMBER")),
        false
    );
});

test("canAddMove returns false above the configured capacity", () => {
    const service = new MoveReplacementService(2);

    assert.equal(service.canAddMove(makeMoves("TACKLE", "GROWL", "SCRATCH")), false);
});

test("canAddMove uses a custom capacity", () => {
    const service = new MoveReplacementService(5);

    assert.equal(
        service.canAddMove(makeMoves("A", "B", "C", "D")),
        true
    );

    assert.equal(
        service.canAddMove(makeMoves("A", "B", "C", "D", "E")),
        false
    );
});

test("alreadyKnowsMove returns false for an empty move list", () => {
    const service = new MoveReplacementService();

    assert.equal(service.alreadyKnowsMove([], makeMove("TACKLE")), false);
});

test("alreadyKnowsMove detects a matching move constant", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE", "GROWL");

    assert.equal(service.alreadyKnowsMove(moves, makeMove("GROWL")), true);
});

test("alreadyKnowsMove returns false when no constant matches", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE", "GROWL");

    assert.equal(service.alreadyKnowsMove(moves, makeMove("EMBER")), false);
});

test("alreadyKnowsMove compares constants rather than object identity", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE");

    assert.equal(
        service.alreadyKnowsMove(moves, { constant: "TACKLE", pp: 35 }),
        true
    );
});

test("alreadyKnowsMove is case-sensitive", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE");

    assert.equal(service.alreadyKnowsMove(moves, makeMove("tackle")), false);
});

test("getReplacementOptions reports capacity and duplicate status", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE", "GROWL");
    const newMove = makeMove("EMBER", 25);

    const result = service.getReplacementOptions(moves, newMove);

    assert.equal(result.canAdd, true);
    assert.equal(result.duplicate, false);
    assert.equal(result.currentMoves, moves);
    assert.equal(result.newMove, newMove);
});

test("getReplacementOptions reports a duplicate move", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE", "GROWL");
    const newMove = makeMove("TACKLE");

    const result = service.getReplacementOptions(moves, newMove);

    assert.equal(result.canAdd, true);
    assert.equal(result.duplicate, true);
});

test("getReplacementOptions reports full capacity", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("A", "B", "C", "D");
    const newMove = makeMove("E");

    const result = service.getReplacementOptions(moves, newMove);

    assert.equal(result.canAdd, false);
    assert.equal(result.duplicate, false);
});

test("getReplacementOptions does not modify the current moves", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE", "GROWL");
    const originalMoves = [...moves];

    service.getReplacementOptions(moves, makeMove("EMBER"));

    assert.deepEqual(moves, originalMoves);
    assert.equal(moves.length, 2);
});

test("addMove succeeds when there is capacity and no duplicate", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE");
    const newMove = makeMove("EMBER", 25);

    const result = service.addMove(moves, newMove);

    assert.equal(result.success, true);
    assert.equal(moves.length, 2);
    assert.ok(result.move instanceof PokemonMoveSlot);
    assert.equal(result.move.constant, "EMBER");
});

test("addMove initializes currentPP from the move PP", () => {
    const service = new MoveReplacementService();
    const moves = [];

    const result = service.addMove(moves, makeMove("EMBER", 25));

    assert.equal(result.success, true);
    assert.equal(result.move.currentPP, 25);
});

test("addMove initializes maxPP from the move PP", () => {
    const service = new MoveReplacementService();
    const moves = [];

    const result = service.addMove(moves, makeMove("EMBER", 25));

    assert.equal(result.success, true);
    assert.equal(result.move.maxPP, 25);
});

test("addMove appends the created slot to the original array", () => {
    const service = new MoveReplacementService();
    const existingSlot = makeSlot("TACKLE");
    const moves = [existingSlot];

    const result = service.addMove(moves, makeMove("EMBER", 25));

    assert.equal(moves[0], existingSlot);
    assert.equal(moves[1], result.move);
});

test("addMove returns the same slot that it appends", () => {
    const service = new MoveReplacementService();
    const moves = [];

    const result = service.addMove(moves, makeMove("EMBER", 25));

    assert.equal(moves[0], result.move);
});

test("addMove allows adding a move to an empty list", () => {
    const service = new MoveReplacementService();
    const moves = [];

    const result = service.addMove(moves, makeMove("TACKLE", 35));

    assert.equal(result.success, true);
    assert.equal(moves.length, 1);
});

test("addMove allows filling the final available slot", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("A", "B", "C");

    const result = service.addMove(moves, makeMove("D", 10));

    assert.equal(result.success, true);
    assert.equal(moves.length, 4);
});

test("addMove rejects a move when all slots are full", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("A", "B", "C", "D");
    const originalMoves = [...moves];

    const result = service.addMove(moves, makeMove("E"));

    assert.deepEqual(result, {
        success: false,
        reason: "Move slots full"
    });
    assert.deepEqual(moves, originalMoves);
});

test("addMove checks capacity before checking duplicates", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("A", "B", "C", "D");

    const result = service.addMove(moves, makeMove("A"));

    assert.equal(result.success, false);
    assert.equal(result.reason, "Move slots full");
});

test("addMove rejects a duplicate when there is available capacity", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE");
    const originalMoves = [...moves];

    const result = service.addMove(moves, makeMove("TACKLE"));

    assert.deepEqual(result, {
        success: false,
        reason: "Already knows move"
    });
    assert.deepEqual(moves, originalMoves);
});

test("addMove does not append a duplicate move", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE", "GROWL");

    service.addMove(moves, makeMove("TACKLE"));

    assert.equal(moves.length, 2);
});

test("addMove uses a custom capacity", () => {
    const service = new MoveReplacementService(2);
    const moves = makeMoves("TACKLE");

    const result = service.addMove(moves, makeMove("EMBER", 25));

    assert.equal(result.success, true);
    assert.equal(moves.length, 2);
});

test("addMove rejects additions at a custom capacity", () => {
    const service = new MoveReplacementService(1);
    const moves = makeMoves("TACKLE");

    const result = service.addMove(moves, makeMove("EMBER", 25));

    assert.equal(result.success, false);
    assert.equal(result.reason, "Move slots full");
    assert.equal(moves.length, 1);
});

test("addMove creates a distinct slot object", () => {
    const service = new MoveReplacementService();
    const moves = [];

    const result = service.addMove(moves, makeMove("TACKLE", 35));

    assert.notEqual(result.move, makeMove("TACKLE", 35));
    assert.ok(result.move instanceof PokemonMoveSlot);
});

test("replaceMove replaces a move identified by its constant", () => {
    const service = new MoveReplacementService();
    const oldSlot = makeSlot("TACKLE");
    const otherSlot = makeSlot("GROWL");
    const moves = [oldSlot, otherSlot];

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.equal(result.success, true);
    assert.equal(moves[0].constant, "EMBER");
    assert.equal(moves[1], otherSlot);
});

test("replaceMove reports the old move constant on success", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE");

    const result = service.replaceMove(moves, "TACKLE", makeMove("EMBER", 25));

    assert.equal(result.replaced, "TACKLE");
});

test("replaceMove returns the newly created slot", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE");

    const result = service.replaceMove(moves, "TACKLE", makeMove("EMBER", 25));

    assert.ok(result.move instanceof PokemonMoveSlot);
    assert.equal(result.move.constant, "EMBER");
    assert.equal(moves[0], result.move);
});

test("replaceMove initializes currentPP from the new move PP", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE");

    const result = service.replaceMove(moves, "TACKLE", makeMove("EMBER", 25));

    assert.equal(result.move.currentPP, 25);
});

test("replaceMove initializes maxPP from the new move PP", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE");

    const result = service.replaceMove(moves, "TACKLE", makeMove("EMBER", 25));

    assert.equal(result.move.maxPP, 25);
});

test("replaceMove preserves the number of move slots", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE", "GROWL", "SCRATCH", "EMBER");

    const result = service.replaceMove(moves, "GROWL", makeMove("WATER_GUN", 25));

    assert.equal(result.success, true);
    assert.equal(moves.length, 4);
});

test("replaceMove preserves the order of unaffected moves", () => {
    const service = new MoveReplacementService();
    const first = makeSlot("TACKLE");
    const second = makeSlot("GROWL");
    const third = makeSlot("SCRATCH");
    const moves = [first, second, third];

    service.replaceMove(moves, "GROWL", makeMove("EMBER", 25));

    assert.equal(moves[0], first);
    assert.equal(moves[2], third);
});

test("replaceMove replaces only the first matching move", () => {
    const service = new MoveReplacementService();
    const first = makeSlot("TACKLE");
    const second = makeSlot("TACKLE");
    const moves = [first, second];

    const result = service.replaceMove(moves, "TACKLE", makeMove("EMBER", 25));

    assert.equal(result.success, true);
    assert.equal(moves[0], result.move);
    assert.equal(moves[1], second);
});

test("replaceMove fails when the old move is not found", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE", "GROWL");
    const originalMoves = [...moves];

    const result = service.replaceMove(moves, "EMBER", makeMove("WATER_GUN", 25));

    assert.deepEqual(result, {
        success: false,
        reason: "Old move not found"
    });
    assert.deepEqual(moves, originalMoves);
});

test("replaceMove does not modify the move list when the old move is missing", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE", "GROWL");
    const originalFirst = moves[0];
    const originalSecond = moves[1];

    service.replaceMove(moves, "EMBER", makeMove("WATER_GUN", 25));

    assert.equal(moves.length, 2);
    assert.equal(moves[0], originalFirst);
    assert.equal(moves[1], originalSecond);
});

test("replaceMove can replace the only move in a list", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE");

    const result = service.replaceMove(moves, "TACKLE", makeMove("EMBER", 25));

    assert.equal(result.success, true);
    assert.equal(moves.length, 1);
    assert.equal(moves[0].constant, "EMBER");
});

test("replaceMove can replace a move when the list is at capacity", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("A", "B", "C", "D");

    const result = service.replaceMove(moves, "B", makeMove("E", 10));

    assert.equal(result.success, true);
    assert.equal(moves.length, 4);
    assert.equal(moves[1].constant, "E");
});

test("replaceMove can replace a move with the same constant", () => {
    const service = new MoveReplacementService();
    const oldSlot = makeSlot("TACKLE", 5, 35);
    const moves = [oldSlot];

    const result = service.replaceMove(moves, "TACKLE", makeMove("TACKLE", 35));

    assert.equal(result.success, true);
    assert.notEqual(moves[0], oldSlot);
    assert.equal(moves[0].constant, "TACKLE");
    assert.equal(moves[0].currentPP, 35);
    assert.equal(moves[0].maxPP, 35);
});

test("replaceMove does not check whether the new move is already known", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE", "EMBER");

    const result = service.replaceMove(moves, "TACKLE", makeMove("EMBER", 25));

    assert.equal(result.success, true);
    assert.deepEqual(
        moves.map(slot => slot.constant),
        ["EMBER", "EMBER"]
    );
});

test("replaceMove does not enforce the add-move capacity check", () => {
    const service = new MoveReplacementService(1);
    const moves = makeMoves("TACKLE", "GROWL");

    const result = service.replaceMove(moves, "TACKLE", makeMove("EMBER", 25));

    assert.equal(result.success, true);
    assert.equal(moves.length, 2);
});

test("replaceMove matches the old move constant case-sensitively", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE");

    const result = service.replaceMove(moves, "tackle", makeMove("EMBER", 25));

    assert.equal(result.success, false);
    assert.equal(result.reason, "Old move not found");
});

test("addMove and replaceMove create independent slots for the same move", () => {
    const service = new MoveReplacementService();
    const addedMoves = [];
    const replacedMoves = makeMoves("TACKLE");

    const added = service.addMove(addedMoves, makeMove("EMBER", 25));
    const replaced = service.replaceMove(
        replacedMoves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.notEqual(added.move, replaced.move);
    assert.equal(added.move.constant, replaced.move.constant);
    assert.equal(added.move.currentPP, replaced.move.currentPP);
    assert.equal(added.move.maxPP, replaced.move.maxPP);
});

test("failed addMove leaves existing slot identities unchanged", () => {
    const service = new MoveReplacementService();
    const first = makeSlot("TACKLE");
    const second = makeSlot("GROWL");
    const moves = [first, second];

    service.addMove(moves, makeMove("TACKLE"));

    assert.equal(moves[0], first);
    assert.equal(moves[1], second);
});

test("successful replaceMove creates a new slot instead of mutating the old slot", () => {
    const service = new MoveReplacementService();
    const oldSlot = makeSlot("TACKLE", 4, 35);
    const moves = [oldSlot];

    const result = service.replaceMove(moves, "TACKLE", makeMove("EMBER", 25));

    assert.equal(result.success, true);
    assert.notEqual(result.move, oldSlot);
    assert.equal(oldSlot.constant, "TACKLE");
    assert.equal(oldSlot.currentPP, 4);
    assert.equal(oldSlot.maxPP, 35);
});

test("getReplacementOptions returns the original moves array reference", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE");

    const result = service.getReplacementOptions(moves, makeMove("EMBER"));

    assert.strictEqual(result.currentMoves, moves);
});

test("getReplacementOptions returns the original new move reference", () => {
    const service = new MoveReplacementService();
    const moves = makeMoves("TACKLE");
    const newMove = makeMove("EMBER");

    const result = service.getReplacementOptions(moves, newMove);

    assert.strictEqual(result.newMove, newMove);
});

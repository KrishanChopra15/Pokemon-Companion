"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const MoveReplacementSelectionService = require("../scripts/services/move-replacement-selection-service");
const PokemonMoveSlot = require("../scripts/domain/pokemon-move-slot");

function makeMove(constant, pp = 10) {
    return { constant, pp };
}

function makeSlot(constant, currentPP = 10, maxPP = 10) {
    return new PokemonMoveSlot({
        constant,
        basePP: maxPP,
        currentPP,
        maxPP,
        ppUps: 0
    });
}

function makeMoves(...constants) {
    return constants.map(constant => makeSlot(constant));
}

function makeForgetService(handler) {
    return {
        forgetMove: handler
    };
}

test("constructor defaults to no move forget service", () => {
    const service = new MoveReplacementSelectionService();

    assert.equal(service.moveForget, null);
});

test("constructor accepts a move forget service", () => {
    const forgetService = makeForgetService(() => ({ success: true }));
    const service = new MoveReplacementSelectionService(forgetService);

    assert.equal(service.moveForget, forgetService);
});

test("replaceMove fails when the forget service is unavailable", () => {
    const service = new MoveReplacementSelectionService();
    const moves = makeMoves("TACKLE");

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.deepEqual(result, {
        success: false,
        reason: "Move forget service unavailable"
    });
});

test("missing forget service leaves current moves unchanged", () => {
    const service = new MoveReplacementSelectionService();
    const moves = makeMoves("TACKLE", "GROWL");
    const originalMoves = [...moves];

    service.replaceMove(moves, "TACKLE", makeMove("EMBER", 25));

    assert.deepEqual(moves, originalMoves);
});

test("replaceMove calls forgetMove with the current moves and selected move", () => {
    const moves = makeMoves("TACKLE", "GROWL");
    let receivedMoves;
    let receivedForgottenMove;

    const forgetService = makeForgetService((currentMoves, forgottenMove) => {
        receivedMoves = currentMoves;
        receivedForgottenMove = forgottenMove;
        return { success: false, reason: "Stop after verification" };
    });

    const service = new MoveReplacementSelectionService(forgetService);

    service.replaceMove(moves, "GROWL", makeMove("EMBER", 25));

    assert.equal(receivedMoves, moves);
    assert.equal(receivedForgottenMove, "GROWL");
});

test("replaceMove propagates a failed forget result unchanged", () => {
    const failure = {
        success: false,
        reason: "Move not found",
        code: "NOT_FOUND"
    };

    const service = new MoveReplacementSelectionService(
        makeForgetService(() => failure)
    );

    const result = service.replaceMove(
        makeMoves("TACKLE"),
        "EMBER",
        makeMove("WATER_GUN", 25)
    );

    assert.equal(result, failure);
});

test("replaceMove does not validate new move PP after a failed forget", () => {
    let forgetCalled = false;

    const service = new MoveReplacementSelectionService(
        makeForgetService(() => {
            forgetCalled = true;
            return { success: false, reason: "Cannot forget" };
        })
    );

    const result = service.replaceMove(
        makeMoves("TACKLE"),
        "TACKLE",
        makeMove("EMBER", -1)
    );

    assert.equal(forgetCalled, true);
    assert.equal(result.success, false);
    assert.equal(result.reason, "Cannot forget");
});

test("replaceMove rejects non-numeric PP", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", "not-a-number")
    );

    assert.deepEqual(result, {
        success: false,
        reason: "Invalid new move PP"
    });
});

test("replaceMove rejects undefined PP", () => {
    const service = new MoveReplacementSelectionService(
        makeForgetService(() => ({ success: true }))
    );

    const result = service.replaceMove(
        makeMoves("TACKLE"),
        "TACKLE",
        { constant: "EMBER" }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid new move PP");
});

test("replaceMove rejects NaN PP", () => {
    const service = new MoveReplacementSelectionService(
        makeForgetService(() => ({ success: true }))
    );

    const result = service.replaceMove(
        makeMoves("TACKLE"),
        "TACKLE",
        makeMove("EMBER", NaN)
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid new move PP");
});

test("replaceMove rejects positive Infinity PP", () => {
    const service = new MoveReplacementSelectionService(
        makeForgetService(() => ({ success: true }))
    );

    const result = service.replaceMove(
        makeMoves("TACKLE"),
        "TACKLE",
        makeMove("EMBER", Infinity)
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid new move PP");
});

test("replaceMove rejects negative Infinity PP", () => {
    const service = new MoveReplacementSelectionService(
        makeForgetService(() => ({ success: true }))
    );

    const result = service.replaceMove(
        makeMoves("TACKLE"),
        "TACKLE",
        makeMove("EMBER", -Infinity)
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid new move PP");
});

test("replaceMove rejects negative PP", () => {
    const service = new MoveReplacementSelectionService(
        makeForgetService(() => ({ success: true }))
    );

    const result = service.replaceMove(
        makeMoves("TACKLE"),
        "TACKLE",
        makeMove("EMBER", -1)
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid new move PP");
});

test("replaceMove accepts zero PP", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("ZERO_MOVE", 0)
    );

    assert.equal(result.success, true);
    assert.equal(result.move.basePP, 0);
    assert.equal(result.move.currentPP, 0);
    assert.equal(result.move.maxPP, 0);
});

test("replaceMove accepts numeric-string PP and converts it to a number", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", "25")
    );

    assert.equal(result.success, true);
    assert.equal(result.move.basePP, 25);
    assert.equal(result.move.currentPP, 25);
    assert.equal(result.move.maxPP, 25);
});

test("replaceMove accepts a positive fractional PP value", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("TEST_MOVE", 2.5)
    );

    assert.equal(result.success, true);
    assert.equal(result.move.basePP, 2.5);
});

test("replaceMove initializes the new slot basePP from move PP", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.equal(result.success, true);
    assert.equal(result.move.basePP, 25);
});

test("replaceMove initializes currentPP to the new move base PP", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.equal(result.success, true);
    assert.equal(result.move.currentPP, 25);
});

test("replaceMove initializes maxPP to the new move base PP", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.equal(result.success, true);
    assert.equal(result.move.maxPP, 25);
});

test("replaceMove initializes ppUps to zero", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.equal(result.success, true);
    assert.equal(result.move.ppUps, 0);
});

test("replaceMove returns a PokemonMoveSlot on success", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.equal(result.success, true);
    assert.ok(result.move instanceof PokemonMoveSlot);
});

test("replaceMove returns the forgotten move identifier", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.equal(result.success, true);
    assert.equal(result.forgotten, "TACKLE");
});

test("replaceMove returns the learned move constant", () => {
    const moves = makeMoves("TACKLE");
    const newMove = makeMove("EMBER", 25);
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(moves, "TACKLE", newMove);

    assert.equal(result.success, true);
    assert.equal(result.learned, "EMBER");
});

test("replaceMove appends the created slot to the current moves array", () => {
    const oldSlot = makeSlot("TACKLE");
    const moves = [oldSlot];

    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(
                currentMoves.findIndex(slot => slot.constant === "TACKLE"),
                1
            );
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.equal(result.success, true);
    assert.equal(moves.length, 1);
    assert.equal(moves[0], result.move);
});

test("replaceMove preserves other moves when the forget service removes one move", () => {
    const first = makeSlot("TACKLE");
    const second = makeSlot("GROWL");
    const moves = [first, second];

    const service = new MoveReplacementSelectionService(
        makeForgetService((currentMoves, forgottenMove) => {
            const index = currentMoves.findIndex(
                slot => slot.constant === forgottenMove
            );

            if (index === -1) {
                return { success: false, reason: "Move not found" };
            }

            currentMoves.splice(index, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.equal(result.success, true);
    assert.equal(moves.length, 2);
    assert.equal(moves[0], second);
    assert.equal(moves[1], result.move);
});

test("replaceMove does not append a new slot when PP is invalid", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", -5)
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid new move PP");
    assert.equal(moves.length, 0);
});

test("replaceMove validates PP after calling the forget service", () => {
    const callOrder = [];

    const service = new MoveReplacementSelectionService(
        makeForgetService(() => {
            callOrder.push("forget");
            return { success: true };
        })
    );

    service.replaceMove(
        [],
        "TACKLE",
        makeMove("EMBER", -1)
    );

    assert.deepEqual(callOrder, ["forget"]);
});

test("replaceMove passes the exact current moves array to the forget service", () => {
    const moves = makeMoves("TACKLE");
    let received;

    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            received = currentMoves;
            return { success: false, reason: "Stop" };
        })
    );

    service.replaceMove(moves, "TACKLE", makeMove("EMBER", 25));

    assert.strictEqual(received, moves);
});

test("replaceMove does not require the forget service to return a move slot", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.equal(result.success, true);
    assert.ok(result.move instanceof PokemonMoveSlot);
});

test("replaceMove can replace a move in a list containing multiple moves", () => {
    const moves = makeMoves("TACKLE", "GROWL", "SCRATCH");
    const service = new MoveReplacementSelectionService(
        makeForgetService((currentMoves, forgottenMove) => {
            const index = currentMoves.findIndex(
                slot => slot.constant === forgottenMove
            );

            if (index === -1) {
                return { success: false, reason: "Move not found" };
            }

            currentMoves.splice(index, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "GROWL",
        makeMove("EMBER", 25)
    );

    assert.equal(result.success, true);
    assert.deepEqual(
        moves.map(slot => slot.constant),
        ["TACKLE", "SCRATCH", "EMBER"]
    );
});

test("replaceMove does not itself verify that the forgotten move existed", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(() => ({ success: true }))
    );

    const result = service.replaceMove(
        moves,
        "NOT_PRESENT",
        makeMove("EMBER", 25)
    );

    assert.equal(result.success, true);
    assert.equal(result.forgotten, "NOT_PRESENT");
    assert.equal(moves.length, 2);
});

test("replaceMove does not itself enforce move capacity", () => {
    const moves = makeMoves("A", "B", "C", "D");
    const service = new MoveReplacementSelectionService(
        makeForgetService(() => ({ success: true }))
    );

    const result = service.replaceMove(
        moves,
        "A",
        makeMove("E", 25)
    );

    assert.equal(result.success, true);
    assert.equal(moves.length, 5);
});

test("replaceMove does not itself reject a new move already present in the list", () => {
    const moves = makeMoves("TACKLE", "EMBER");
    const service = new MoveReplacementSelectionService(
        makeForgetService(() => ({ success: true }))
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.equal(result.success, true);
    assert.deepEqual(
        moves.map(slot => slot.constant),
        ["TACKLE", "EMBER", "EMBER"]
    );
});

test("replaceMove returns failure when the forget service returns success false", () => {
    const moves = makeMoves("TACKLE");
    const failure = { success: false, reason: "Cannot forget this move" };
    const service = new MoveReplacementSelectionService(
        makeForgetService(() => failure)
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.strictEqual(result, failure);
});

test("replaceMove accepts whitespace-padded numeric-string PP according to Number conversion", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", " 25 ")
    );

    assert.equal(result.success, true);
    assert.equal(result.move.basePP, 25);
});

test("replaceMove converts an empty-string PP to zero according to Number conversion", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", "")
    );

    assert.equal(result.success, true);
    assert.equal(result.move.basePP, 0);
});

test("replaceMove creates a fresh slot rather than reusing a prior slot", () => {
    const oldSlot = makeSlot("TACKLE");
    const moves = [oldSlot];

    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.notStrictEqual(result.move, oldSlot);
    assert.notStrictEqual(result.move, oldSlot);
});

test("replaceMove uses the new move constant for the slot", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("WATER_GUN", 25)
    );

    assert.equal(result.success, true);
    assert.equal(result.move.constant, "WATER_GUN");
});

test("replaceMove returns a result with only the documented success fields", () => {
    const moves = makeMoves("TACKLE");
    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    const result = service.replaceMove(
        moves,
        "TACKLE",
        makeMove("EMBER", 25)
    );

    assert.deepEqual(Object.keys(result).sort(), [
        "forgotten",
        "learned",
        "move",
        "success"
    ]);
});

test("replaceMove does not mutate the new move definition", () => {
    const moves = makeMoves("TACKLE");
    const newMove = makeMove("EMBER", 25);
    const originalMove = { ...newMove };

    const service = new MoveReplacementSelectionService(
        makeForgetService(currentMoves => {
            currentMoves.splice(0, 1);
            return { success: true };
        })
    );

    service.replaceMove(moves, "TACKLE", newMove);

    assert.deepEqual(newMove, originalMove);
});

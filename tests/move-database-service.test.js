
"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const MoveDatabaseService = require("../scripts/services/move-database-service");

describe("MoveDatabaseService", () => {
    let service;

    function getService() {
        if (!service) {
            service = new MoveDatabaseService();
        }

        return service;
    }

    describe("Constructor", () => {
        it("should create an instance using the default FireRed database", () => {
            const instance = getService();

            assert.ok(instance instanceof MoveDatabaseService);
            assert.ok(Array.isArray(instance.moves));
            assert.ok(instance.moves.length > 0);
        });

        it("should load move records containing identifiers", () => {
            const instance = getService();

            for (const move of instance.moves) {
                assert.ok(move);
                assert.ok(
                    Object.prototype.hasOwnProperty.call(move, "id"),
                    "Each move should have an id property"
                );
                assert.ok(
                    Object.prototype.hasOwnProperty.call(move, "constant"),
                    "Each move should have a constant property"
                );
            }
        });
    });

    describe("normalizeMove", () => {
        it("should return null when the move is null", () => {
            assert.equal(getService().normalizeMove(null), null);
        });

        it("should return null when the move is undefined", () => {
            assert.equal(getService().normalizeMove(undefined), null);
        });

        it("should return a copy of a normal move object", () => {
            const instance = getService();
            const move = {
                id: 1,
                constant: "MOVE_TACKLE",
                name: "Tackle",
                power: 40,
                accuracy: 100
            };

            const result = instance.normalizeMove(move);

            assert.deepEqual(result, move);
            assert.notEqual(result, move);
        });

        it("should normalize an object type constant", () => {
            const instance = getService();
            const move = {
                constant: "MOVE_TACKLE",
                type: {
                    constant: "TYPE_NORMAL"
                }
            };

            const result = instance.normalizeMove(move);

            assert.equal(result.type, "NORMAL");
        });

        it("should remove TYPE_ from the beginning of a type constant", () => {
            const instance = getService();

            const result = instance.normalizeMove({
                type: {
                    constant: "TYPE_FIRE"
                }
            });

            assert.equal(result.type, "FIRE");
        });

        it("should preserve a type that is already a string", () => {
            const instance = getService();

            const result = instance.normalizeMove({
                type: "WATER"
            });

            assert.equal(result.type, "WATER");
        });

        it("should preserve an object type without a constant", () => {
            const instance = getService();
            const type = { name: "Normal" };

            const result = instance.normalizeMove({ type });

            assert.deepEqual(result.type, type);
        });

        it("should normalize an object effect constant", () => {
            const instance = getService();

            const result = instance.normalizeMove({
                effect: {
                    constant: "EFFECT_DAMAGE"
                }
            });

            assert.equal(result.effect, "EFFECT_DAMAGE");
        });

        it("should preserve a string effect", () => {
            const instance = getService();

            const result = instance.normalizeMove({
                effect: "DAMAGE"
            });

            assert.equal(result.effect, "DAMAGE");
        });

        it("should preserve an object effect without a constant", () => {
            const instance = getService();
            const effect = { description: "Special effect" };

            const result = instance.normalizeMove({ effect });

            assert.deepEqual(result.effect, effect);
        });

        it("should normalize type and effect together", () => {
            const instance = getService();

            const result = instance.normalizeMove({
                constant: "MOVE_EXAMPLE",
                type: {
                    constant: "TYPE_ELECTRIC"
                },
                effect: {
                    constant: "EFFECT_PARALYZE"
                }
            });

            assert.equal(result.type, "ELECTRIC");
            assert.equal(result.effect, "EFFECT_PARALYZE");
        });

        it("should preserve unrelated properties during normalization", () => {
            const instance = getService();

            const result = instance.normalizeMove({
                constant: "MOVE_EXAMPLE",
                power: 75,
                accuracy: 90,
                pp: 15,
                priority: 1
            });

            assert.equal(result.power, 75);
            assert.equal(result.accuracy, 90);
            assert.equal(result.pp, 15);
            assert.equal(result.priority, 1);
        });

        it("should not mutate the original move during normalization", () => {
            const instance = getService();
            const move = {
                constant: "MOVE_EXAMPLE",
                type: {
                    constant: "TYPE_GRASS"
                },
                effect: {
                    constant: "EFFECT_DAMAGE"
                }
            };

            instance.normalizeMove(move);

            assert.deepEqual(move.type, {
                constant: "TYPE_GRASS"
            });
            assert.deepEqual(move.effect, {
                constant: "EFFECT_DAMAGE"
            });
        });
    });

    describe("getMoveById", () => {
        it("should find a move by its ID", () => {
            const instance = getService();
            const expected = instance.moves[0];

            const result = instance.getMoveById(expected.id);

            assert.ok(result);
            assert.equal(result.id, expected.id);
            assert.equal(result.constant, expected.constant);
        });

        it("should return null for an unknown ID", () => {
            const instance = getService();

            assert.equal(
                instance.getMoveById("__UNKNOWN_MOVE_ID__"),
                null
            );
        });

        it("should return a normalized move", () => {
            const instance = getService();
            const index = instance.moves.findIndex(move =>
                move.type &&
                typeof move.type === "object" &&
                move.type.constant
            );

            if (index === -1) {
                return;
            }

            const result = instance.getMoveById(instance.moves[index].id);

            assert.equal(typeof result.type, "string");
        });
    });

    describe("getMoveByConstant", () => {
        it("should find a move by its constant", () => {
            const instance = getService();
            const expected = instance.moves[0];

            const result = instance.getMoveByConstant(expected.constant);

            assert.ok(result);
            assert.equal(result.constant, expected.constant);
            assert.equal(result.id, expected.id);
        });

        it("should return null for an unknown constant", () => {
            const instance = getService();

            assert.equal(
                instance.getMoveByConstant("MOVE_DOES_NOT_EXIST"),
                null
            );
        });

        it("should return a normalized move", () => {
            const instance = getService();
            const expected = instance.moves[0];

            const result = instance.getMoveByConstant(expected.constant);

            assert.deepEqual(result, instance.normalizeMove(expected));
        });
    });

    describe("getMove", () => {
        it("should look up a move by constant", () => {
            const instance = getService();
            const expected = instance.moves[0];

            assert.deepEqual(
                instance.getMove(expected.constant),
                instance.getMoveByConstant(expected.constant)
            );
        });

        it("should return null for an unknown constant", () => {
            assert.equal(
                getService().getMove("MOVE_DOES_NOT_EXIST"),
                null
            );
        });
    });

    describe("getMoveByName", () => {
        it("should find a move by its exact name", () => {
            const instance = getService();
            const expected = instance.moves.find(move => move.name);

            assert.ok(expected);

            const result = instance.getMoveByName(expected.name);

            assert.ok(result);
            assert.equal(result.name, expected.name);
            assert.equal(result.constant, expected.constant);
        });

        it("should perform case-insensitive name lookup", () => {
            const instance = getService();
            const expected = instance.moves.find(move => move.name);

            assert.ok(expected);

            const result = instance.getMoveByName(
                expected.name.toUpperCase()
            );

            assert.ok(result);
            assert.equal(result.constant, expected.constant);
        });

        it("should return null for an unknown name", () => {
            assert.equal(
                getService().getMoveByName("This Move Does Not Exist"),
                null
            );
        });

        it("should return the first matching move when names are duplicated", () => {
            const instance = getService();
            const expected = instance.moves.find(move => move.name);

            assert.ok(expected);

            const result = instance.getMoveByName(expected.name);

            assert.equal(result.constant, expected.constant);
        });
    });

    describe("getAllMoves", () => {
        it("should return an array containing all moves", () => {
            const instance = getService();
            const result = instance.getAllMoves();

            assert.ok(Array.isArray(result));
            assert.equal(result.length, instance.moves.length);
        });

        it("should return normalized move records", () => {
            const instance = getService();
            const result = instance.getAllMoves();

            assert.deepEqual(
                result,
                instance.moves.map(move => instance.normalizeMove(move))
            );
        });

        it("should not return the original move objects", () => {
            const instance = getService();
            const result = instance.getAllMoves();

            if (result.length > 0) {
                assert.notEqual(result[0], instance.moves[0]);
            }
        });

        it("should preserve the underlying database records", () => {
            const instance = getService();
            const original = instance.moves.map(move => ({ ...move }));

            instance.getAllMoves();

            assert.deepEqual(instance.moves, original);
        });
    });

    describe("hasMove", () => {
        it("should return true for an existing move constant", () => {
            const instance = getService();
            const existing = instance.moves[0];

            assert.equal(instance.hasMove(existing.constant), true);
        });

        it("should return false for an unknown move constant", () => {
            assert.equal(
                getService().hasMove("MOVE_DOES_NOT_EXIST"),
                false
            );
        });

        it("should return false for a constant with different casing", () => {
            const instance = getService();
            const existing = instance.moves[0];

            assert.equal(
                instance.hasMove(existing.constant.toLowerCase()),
                false
            );
        });

        it("should not require move normalization to check existence", () => {
            const instance = getService();
            const existing = instance.moves[0];

            assert.equal(instance.hasMove(existing.constant), true);
        });
    });
});

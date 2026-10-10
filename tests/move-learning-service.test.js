
"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const MoveLearningService = require("../scripts/services/move-learning-service");
const PokemonMoveSlot = require("../scripts/domain/pokemon-move-slot");

describe("MoveLearningService", () => {
    function createService(overrides = {}) {
        return new MoveLearningService(
            "firered",
            overrides.moveDatabase ?? null,
            overrides.moveReplacement ?? null,
            overrides.moveReplacementSelection ?? null,
            overrides.moveForget ?? null
        );
    }

    function createPokemon(overrides = {}) {
        return {
            id: 25,
            species: "PIKACHU",
            level: 10,
            moves: [],
            ...overrides
        };
    }

    function createMove(constant, pp = 35) {
        return {
            constant,
            pp
        };
    }

    function createFullMoves() {
        return [
            new PokemonMoveSlot({
                constant: "MOVE_TACKLE",
                currentPP: 35,
                maxPP: 35
            }),
            new PokemonMoveSlot({
                constant: "MOVE_GROWL",
                currentPP: 40,
                maxPP: 40
            }),
            new PokemonMoveSlot({
                constant: "MOVE_QUICK_ATTACK",
                currentPP: 30,
                maxPP: 30
            }),
            new PokemonMoveSlot({
                constant: "MOVE_THUNDER_SHOCK",
                currentPP: 30,
                maxPP: 30
            })
        ];
    }

    describe("Constructor", () => {

        it("should default to the FireRed game", () => {
            const service = new MoveLearningService();

            assert.equal(service.game, "firered");
            assert.ok(
                service.learners !== null &&
                typeof service.learners === "object" &&
                !Array.isArray(service.learners)
            );
        });

        it("should store injected services", () => {
            const moveDatabase = {};
            const moveReplacement = {};
            const moveReplacementSelection = {};
            const moveForget = {};

            const service = new MoveLearningService(
                "firered",
                moveDatabase,
                moveReplacement,
                moveReplacementSelection,
                moveForget
            );

            assert.equal(service.moveDatabase, moveDatabase);
            assert.equal(service.moveReplacement, moveReplacement);
            assert.equal(
                service.moveReplacementSelection,
                moveReplacementSelection
            );
            assert.equal(service.moveForget, moveForget);
        });

        it("should load a non-empty learner database", () => {
            const service = createService();

            assert.ok(
                Object.keys(service.learners).length > 0
            );
        });
    });

    describe("getLearnset", () => {
        it("should return an array for a known Pokémon ID", () => {
            const service = createService();
            const knownId = Object.keys(service.learners)[0];

            assert.ok(Array.isArray(service.getLearnset(knownId)));
        });

        it("should normalize numeric IDs to four-digit strings", () => {
            const service = createService();
            const knownId = Object.keys(service.learners).find(
                id => id === "0025"
            );

            if (!knownId) {
                return;
            }

            assert.deepEqual(
                service.getLearnset(25),
                service.learners["0025"]
            );
        });

        it("should normalize string IDs to four digits", () => {
            const service = createService();

            if (!service.learners["0025"]) {
                return;
            }

            assert.deepEqual(
                service.getLearnset("25"),
                service.learners["0025"]
            );
        });

        it("should preserve IDs already four digits long", () => {
            const service = createService();

            if (!service.learners["0025"]) {
                return;
            }

            assert.deepEqual(
                service.getLearnset("0025"),
                service.learners["0025"]
            );
        });

        it("should return an empty array for an unknown ID", () => {
            const service = createService();

            assert.deepEqual(
                service.getLearnset("UNKNOWN"),
                []
            );
        });
    });

    describe("getAvailableMoves", () => {
        it("should return only level-up moves learned at or below the Pokémon level", () => {
            const service = createService();
            const pokemon = createPokemon();

            const learnset = service.getLearnset(pokemon.id);
            const expected = learnset.filter(
                entry =>
                    entry.method === "LEVEL" &&
                    entry.level <= pokemon.level
            );

            assert.deepEqual(
                service.getAvailableMoves(pokemon),
                expected
            );
        });

        it("should exclude moves learned above the Pokémon level", () => {
            const service = createService();
            const pokemon = createPokemon({ level: 1 });

            const available = service.getAvailableMoves(pokemon);

            assert.ok(
                available.every(entry => entry.level <= pokemon.level)
            );
        });

        it("should exclude moves learned through methods other than LEVEL", () => {
            const service = createService();
            const pokemon = createPokemon({ level: 100 });

            const available = service.getAvailableMoves(pokemon);

            assert.ok(
                available.every(entry => entry.method === "LEVEL")
            );
        });

        it("should return no moves for an unknown Pokémon ID", () => {
            const service = createService();

            assert.deepEqual(
                service.getAvailableMoves(
                    createPokemon({ id: "UNKNOWN" })
                ),
                []
            );
        });
    });

    describe("getNewMoves", () => {
        it("should return available moves not already known", () => {
            const service = createService();
            const pokemon = createPokemon({ level: 100 });

            const available = service.getAvailableMoves(pokemon);
            const expected = available.filter(
                entry =>
                    !pokemon.moves.some(
                        move => move.constant === entry.move.constant
                    )
            );

            assert.deepEqual(service.getNewMoves(pokemon), expected);
        });

        it("should exclude moves the Pokémon already knows", () => {
            const service = createService();
            const pokemon = createPokemon({ level: 100 });
            const available = service.getAvailableMoves(pokemon);

            if (available.length === 0) {
                return;
            }

            pokemon.moves.push({
                constant: available[0].move.constant
            });

            const result = service.getNewMoves(pokemon);

            assert.ok(
                result.every(
                    entry => entry.move.constant !== available[0].move.constant
                )
            );
        });

        it("should handle a Pokémon without a moves property", () => {
            const service = createService();
            const pokemon = {
                id: 25,
                level: 100
            };

            assert.deepEqual(
                service.getNewMoves(pokemon),
                service.getAvailableMoves(pokemon)
            );
        });

        it("should return an empty array for an unknown Pokémon", () => {
            const service = createService();

            assert.deepEqual(
                service.getNewMoves(createPokemon({ id: "UNKNOWN" })),
                []
            );
        });
    });

    describe("createMoveSlot", () => {
        it("should create a PokemonMoveSlot instance", () => {
            const service = createService();

            const slot = service.createMoveSlot(
                createMove("MOVE_TACKLE", 35)
            );

            assert.ok(slot instanceof PokemonMoveSlot);
        });

        it("should initialize the move constant and PP values", () => {
            const service = createService();

            const slot = service.createMoveSlot(
                createMove("MOVE_THUNDERBOLT", 15)
            );

            assert.equal(slot.constant, "MOVE_THUNDERBOLT");
            assert.equal(slot.currentPP, 15);
            assert.equal(slot.maxPP, 15);
        });

        it("should initialize current PP and maximum PP to the same value", () => {
            const service = createService();

            const slot = service.createMoveSlot(
                createMove("MOVE_TEST", 7)
            );

            assert.equal(slot.currentPP, slot.maxPP);
        });

        it("should not change the source move object", () => {
            const service = createService();
            const move = createMove("MOVE_TEST", 20);
            const original = { ...move };

            service.createMoveSlot(move);

            assert.deepEqual(move, original);
        });
    });

    describe("learnMove", () => {
        it("should add a move when the Pokémon knows fewer than four moves", () => {
            const service = createService();
            const pokemon = createPokemon();
            const move = createMove("MOVE_TACKLE", 35);

            const result = service.learnMove(pokemon, move);

            assert.equal(result.success, true);
            assert.equal(result.learned, "MOVE_TACKLE");
            assert.ok(result.move instanceof PokemonMoveSlot);
            assert.equal(pokemon.moves.length, 1);
            assert.equal(pokemon.moves[0], result.move);
        });

        it("should return the learned move constant", () => {
            const service = createService();
            const pokemon = createPokemon();

            const result = service.learnMove(
                pokemon,
                createMove("MOVE_GROWL")
            );

            assert.equal(result.learned, "MOVE_GROWL");
        });

        it("should initialize the learned move's PP", () => {
            const service = createService();
            const pokemon = createPokemon();

            const result = service.learnMove(
                pokemon,
                createMove("MOVE_THUNDERBOLT", 15)
            );

            assert.equal(result.move.currentPP, 15);
            assert.equal(result.move.maxPP, 15);
        });

        it("should reject a move the Pokémon already knows", () => {
            const service = createService();
            const pokemon = createPokemon({
                moves: [
                    { constant: "MOVE_TACKLE" }
                ]
            });

            const result = service.learnMove(
                pokemon,
                createMove("MOVE_TACKLE")
            );

            assert.deepEqual(result, {
                success: false,
                reason: "Move already known"
            });
            assert.equal(pokemon.moves.length, 1);
        });

        it("should allow learning a fourth move", () => {
            const service = createService();
            const pokemon = createPokemon({
                moves: createFullMoves().slice(0, 3)
            });

            const result = service.learnMove(
                pokemon,
                createMove("MOVE_NEW")
            );

            assert.equal(result.success, true);
            assert.equal(pokemon.moves.length, 4);
        });

        it("should request replacement when the Pokémon already knows four moves", () => {
            const service = createService();
            const pokemon = createPokemon({
                moves: createFullMoves()
            });

            const result = service.learnMove(
                pokemon,
                createMove("MOVE_NEW", 10)
            );

            assert.equal(result.success, false);
            assert.equal(result.reason, "Needs replacement");
            assert.equal(pokemon.moves.length, 4);
        });

        it("should return null options when no replacement service exists", () => {
            const service = createService();
            const pokemon = createPokemon({
                moves: createFullMoves()
            });

            const result = service.learnMove(
                pokemon,
                createMove("MOVE_NEW", 10)
            );

            assert.equal(result.options, null);
        });

        it("should request replacement options from the replacement service", () => {
            const expectedOptions = ["MOVE_TACKLE", "MOVE_GROWL"];
            let receivedMoves;
            let receivedNewMove;

            const moveReplacement = {
                getReplacementOptions(moves, newMove) {
                    receivedMoves = moves;
                    receivedNewMove = newMove;

                    return expectedOptions;
                }
            };

            const service = createService({ moveReplacement });
            const pokemon = createPokemon({
                moves: createFullMoves()
            });
            const newMove = createMove("MOVE_NEW", 12);

            const result = service.learnMove(pokemon, newMove);

            assert.equal(result.reason, "Needs replacement");
            assert.equal(result.options, expectedOptions);
            assert.equal(receivedMoves, pokemon.moves);
            assert.deepEqual(receivedNewMove, {
                constant: "MOVE_NEW",
                pp: 12
            });
        });

        it("should not modify the move list when replacement is needed", () => {
            const service = createService();
            const moves = createFullMoves();
            const pokemon = createPokemon({ moves });

            service.learnMove(pokemon, createMove("MOVE_NEW"));

            assert.equal(pokemon.moves, moves);
            assert.equal(pokemon.moves.length, 4);
        });
    });

    describe("learnMoveWithReplacement", () => {
        it("should return success directly when the move fits", () => {
            const service = createService();
            const pokemon = createPokemon();

            const result = service.learnMoveWithReplacement(
                pokemon,
                createMove("MOVE_NEW"),
                "MOVE_TACKLE"
            );

            assert.equal(result.success, true);
            assert.equal(pokemon.moves.length, 1);
        });

        it("should return duplicate-move errors without requesting replacement", () => {
            const service = createService();
            const pokemon = createPokemon({
                moves: [{ constant: "MOVE_TACKLE" }]
            });

            const result = service.learnMoveWithReplacement(
                pokemon,
                createMove("MOVE_TACKLE"),
                "MOVE_GROWL"
            );

            assert.deepEqual(result, {
                success: false,
                reason: "Move already known"
            });
        });

        it("should report unavailable selection when no selection service exists", () => {
            const service = createService();
            const pokemon = createPokemon({
                moves: createFullMoves()
            });

            const result = service.learnMoveWithReplacement(
                pokemon,
                createMove("MOVE_NEW", 10),
                "MOVE_TACKLE"
            );

            assert.deepEqual(result, {
                success: false,
                reason: "Replacement selection unavailable"
            });
        });

        it("should delegate replacement to the selection service", () => {
            let receivedMoves;
            let receivedForgottenMove;
            let receivedNewMove;

            const expected = {
                success: true,
                forgotten: "MOVE_TACKLE",
                learned: "MOVE_NEW"
            };

            const moveReplacementSelection = {
                replaceMove(moves, forgottenMove, newMove) {
                    receivedMoves = moves;
                    receivedForgottenMove = forgottenMove;
                    receivedNewMove = newMove;

                    return expected;
                }
            };

            const service = createService({
                moveReplacementSelection
            });
            const pokemon = createPokemon({
                moves: createFullMoves()
            });

            const result = service.learnMoveWithReplacement(
                pokemon,
                createMove("MOVE_NEW", 10),
                "MOVE_TACKLE"
            );

            assert.equal(result, expected);
            assert.equal(receivedMoves, pokemon.moves);
            assert.equal(receivedForgottenMove, "MOVE_TACKLE");
            assert.deepEqual(receivedNewMove, {
                constant: "MOVE_NEW",
                pp: 10
            });
        });
    });

    describe("replaceLearnedMove", () => {
        it("should return an error when replacement selection is unavailable", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.deepEqual(
                service.replaceLearnedMove(
                    pokemon,
                    "MOVE_TACKLE",
                    createMove("MOVE_NEW")
                ),
                {
                    success: false,
                    reason: "Move replacement selection service unavailable"
                }
            );
        });

        it("should delegate replacement to the selection service", () => {
            const expected = { success: true };
            let receivedArguments;

            const moveReplacementSelection = {
                replaceMove(...args) {
                    receivedArguments = args;
                    return expected;
                }
            };

            const service = createService({
                moveReplacementSelection
            });
            const pokemon = createPokemon({
                moves: createFullMoves()
            });
            const newMove = createMove("MOVE_NEW");

            const result = service.replaceLearnedMove(
                pokemon,
                "MOVE_TACKLE",
                newMove
            );

            assert.equal(result, expected);
            assert.deepEqual(receivedArguments, [
                pokemon.moves,
                "MOVE_TACKLE",
                newMove
            ]);
        });
    });

    describe("forgetMove", () => {
        it("should return an error when the forget service is unavailable", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.deepEqual(
                service.forgetMove(pokemon, "MOVE_TACKLE"),
                {
                    success: false,
                    reason: "Move forget service unavailable"
                }
            );
        });

        it("should delegate forgetting to the move forget service", () => {
            const expected = { success: true };
            let receivedMoves;
            let receivedMove;

            const moveForget = {
                forgetMove(moves, move) {
                    receivedMoves = moves;
                    receivedMove = move;
                    return expected;
                }
            };

            const service = createService({ moveForget });
            const pokemon = createPokemon({
                moves: createFullMoves()
            });

            const result = service.forgetMove(
                pokemon,
                "MOVE_TACKLE"
            );

            assert.equal(result, expected);
            assert.equal(receivedMoves, pokemon.moves);
            assert.equal(receivedMove, "MOVE_TACKLE");
        });
    });

    describe("learnAvailableMoves", () => {
        it("should return an array of results", () => {
            const service = createService();
            const pokemon = createPokemon({ level: 100 });

            const results = service.learnAvailableMoves(pokemon);

            assert.ok(Array.isArray(results));
        });

        it("should learn available moves when the Pokémon has free slots", () => {
            const service = createService();
            const pokemon = createPokemon();

            service.getNewMoves = () => [
                { move: createMove("MOVE_TEST_A", 20) },
                { move: createMove("MOVE_TEST_B", 15) },
                { move: createMove("MOVE_TEST_C", 10) }
            ];

            const results = service.learnAvailableMoves(pokemon);

            assert.equal(results.length, 3);
            assert.ok(results.every(result => result.success === true));
            assert.equal(pokemon.moves.length, 3);

            assert.deepEqual(
                pokemon.moves.map(move => move.constant),
                ["MOVE_TEST_A", "MOVE_TEST_B", "MOVE_TEST_C"]
            );
        });


        it("should not attempt to learn moves the Pokémon already knows", () => {
            const service = createService();
            const pokemon = createPokemon({ level: 100 });

            const available = service.getAvailableMoves(pokemon);

            if (available.length === 0) {
                return;
            }

            const knownConstant = available[0].move.constant;

            pokemon.moves.push({
                constant: knownConstant
            });

            const newMoves = service.getNewMoves(pokemon);
            const attemptedMoves = [];

            service.learnMove = (targetPokemon, move) => {
                attemptedMoves.push(move.constant);

                return {
                    success: true,
                    learned: move.constant
                };
            };

            const results = service.learnAvailableMoves(pokemon);

            assert.equal(results.length, newMoves.length);
            assert.ok(!attemptedMoves.includes(knownConstant));
            assert.ok(
                attemptedMoves.every(
                    constant => constant !== knownConstant
                )
            );
        });


        it("should pass the replacement choice when one is supplied", () => {
            const replacementChoice = "MOVE_TACKLE";
            const service = createService();
            const pokemon = createPokemon({ level: 100 });

            const expectedNewMoves = service.getNewMoves(pokemon);
            const results = service.learnAvailableMoves(
                pokemon,
                replacementChoice
            );

            assert.equal(results.length, expectedNewMoves.length);
        });

        it("should return an empty array for an unknown Pokémon", () => {
            const service = createService();

            assert.deepEqual(
                service.learnAvailableMoves(
                    createPokemon({ id: "UNKNOWN" })
                ),
                []
            );
        });
    });

    describe("prepareNewMoves", () => {
        it("should return an array of move slots", () => {
            const service = createService();
            const pokemon = createPokemon({ level: 100 });

            const result = service.prepareNewMoves(pokemon);

            assert.ok(Array.isArray(result));
            assert.ok(
                result.every(slot => slot instanceof PokemonMoveSlot)
            );
        });

        it("should create one slot for each new move", () => {
            const service = createService();
            const pokemon = createPokemon({ level: 100 });

            assert.equal(
                service.prepareNewMoves(pokemon).length,
                service.getNewMoves(pokemon).length
            );
        });

        it("should not add prepared slots to the Pokémon's current moves", () => {
            const service = createService();
            const pokemon = createPokemon({ level: 100 });
            const originalMoves = pokemon.moves;

            service.prepareNewMoves(pokemon);

            assert.equal(pokemon.moves, originalMoves);
            assert.equal(pokemon.moves.length, 0);
        });

        it("should return no slots for an unknown Pokémon", () => {
            const service = createService();

            assert.deepEqual(
                service.prepareNewMoves(
                    createPokemon({ id: "UNKNOWN" })
                ),
                []
            );
        });

        it("should not include moves already known by the Pokémon", () => {
            const service = createService();
            const pokemon = createPokemon({ level: 100 });
            const available = service.getAvailableMoves(pokemon);

            if (available.length === 0) {
                return;
            }

            pokemon.moves.push({
                constant: available[0].move.constant
            });

            const result = service.prepareNewMoves(pokemon);

            assert.ok(
                result.every(
                    slot => slot.constant !== available[0].move.constant
                )
            );
        });
    });
});

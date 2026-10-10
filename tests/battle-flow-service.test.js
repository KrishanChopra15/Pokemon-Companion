"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattleFlowService = require("../scripts/services/battle-flow-service");


function createContext(options = {}) {
    const playerPokemon = {
        species: "PIKACHU",
        hp: 35,
        moves: [
            { constant: "THUNDERBOLT", pp: 10 },
            { constant: "QUICK_ATTACK", pp: 5 }
        ]
    };

    const enemyPokemon = {
        species: "RATTATA",
        hp: 25,
        moves: [
            { constant: "TACKLE", pp: 20 },
            { constant: "TAIL_WHIP", pp: 10 }
        ]
    };

    const battle = {
        status: options.status || "ACTIVE",
        turn: 1,
        player: {
            activePokemon: playerPokemon
        },
        opponent: {
            activePokemon: enemyPokemon
        }
    };

    const calls = {
        validation: [],
        ai: [],
        order: [],
        moves: [],
        faint: [],
        endTurn: [],
        battleEnd: []
    };

    const validationService = options.noValidation
        ? null
        : {
            validateMove(pokemon, move) {
                calls.validation.push({ pokemon, move });

                if (options.validationResult !== undefined) {
                    return options.validationResult;
                }

                return {
                    success: true,
                    move
                };
            }
        };

    const turnOrderService = options.noOrder
        ? null
        : {
            getTurnOrder(actualBattle, playerMove, enemyMove) {
                calls.order.push({
                    battle: actualBattle,
                    playerMove,
                    enemyMove
                });

                if (options.actions !== undefined) {
                    return options.actions;
                }

                return [
                    {
                        side: "PLAYER",
                        move: playerMove
                    },
                    {
                        side: "OPPONENT",
                        move: enemyMove
                    }
                ];
            }
        };

    const turnService = options.noTurn
        ? null
        : {
            executeTurnMove(
                side,
                defenderSide,
                move,
                result,
                actualBattle
            ) {
                calls.moves.push({
                    side,
                    defenderSide,
                    move,
                    result,
                    battle: actualBattle
                });

                if (options.executeMove) {
                    options.executeMove(
                        side,
                        defenderSide,
                        move,
                        result,
                        actualBattle
                    );
                }
            },

            processEndTurn(actualBattle, result) {
                calls.endTurn.push({
                    battle: actualBattle,
                    result
                });

                if (options.processEndTurn) {
                    options.processEndTurn(actualBattle, result);
                }
            }
        };

    const faintService = options.noFaint
        ? null
        : {
            handleFaint(side, result) {
                calls.faint.push({ side, result });

                if (options.handleFaint) {
                    options.handleFaint(side, result);
                }
            }
        };

    const resultService = options.noResult
        ? null
        : {
            checkBattleEnd(actualBattle) {
                calls.battleEnd.push(actualBattle);

                if (options.checkBattleEnd) {
                    options.checkBattleEnd(actualBattle);
                }
            }
        };

    const pokemonService = options.noPokemon
        ? null
        : {
            getActivePokemon(side) {
                if (options.missingActivePokemon) {
                    return null;
                }

                return side?.activePokemon || null;
            },

            isFainted(pokemon) {
                return pokemon.hp <= 0;
            }
        };

    const battleAIService = options.noAI
        ? null
        : {
            chooseMove(enemy, player, usableMoves) {
                calls.ai.push({
                    enemy,
                    player,
                    usableMoves
                });

                if (options.enemyMove !== undefined) {
                    return options.enemyMove;
                }

                return usableMoves[0] || null;
            }
        };

    const service = new BattleFlowService(
        validationService,
        turnOrderService,
        turnService,
        faintService,
        resultService,
        pokemonService,
        battleAIService
    );

    return {
        service,
        battle,
        playerPokemon,
        enemyPokemon,
        calls
    };
}


// -------------------------------------
// Battle validation
// -------------------------------------

test("BattleFlowService rejects a missing battle", () => {
    const { service } = createContext();

    const result = service.processTurn(null, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Unknown battle");
});


test("BattleFlowService rejects a battle that has finished", () => {
    const { service, battle } = createContext({
        status: "WON"
    });

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Battle finished");
});


test("BattleFlowService rejects missing battle participants", () => {
    const { service, battle } = createContext();

    battle.opponent = null;

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid battle participants");
});


test("BattleFlowService rejects an unavailable Pokémon service", () => {
    const { service, battle } = createContext({
        noPokemon: true
    });

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Battle Pokémon service unavailable"
    );
});


test("BattleFlowService rejects missing active Pokémon", () => {
    const { service, battle } = createContext({
        missingActivePokemon: true
    });

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Missing active Pokémon");
});


test("BattleFlowService rejects an unavailable validation service", () => {
    const { service, battle } = createContext({
        noValidation: true
    });

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Battle validation unavailable");
});


test("BattleFlowService returns a failed move validation result", () => {
    const validationResult = {
        success: false,
        reason: "Move has no PP"
    };

    const { service, battle, calls } = createContext({
        validationResult
    });

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.strictEqual(result, validationResult);
    assert.equal(result.success, false);
    assert.equal(result.reason, "Move has no PP");
    assert.equal(calls.order.length, 0);
    assert.equal(calls.moves.length, 0);
});


// -------------------------------------
// Move selection helpers
// -------------------------------------

test("BattleFlowService creates the default STRUGGLE move", () => {
    const { service } = createContext();

    assert.deepEqual(service.getStruggleMove(), {
        name: "STRUGGLE",
        constant: "MOVE_STRUGGLE",
        type: "NORMAL",
        category: "PHYSICAL",
        power: 50,
        accuracy: 100,
        priority: 0
    });
});


test("BattleFlowService uses STRUGGLE when validation requests it", () => {
    const { service, battle, calls } = createContext({
        validationResult: {
            success: false,
            struggle: true
        }
    });

    const result = service.processTurn(battle, {
        constant: "TACKLE"
    });

    assert.equal(result.success, true);
    assert.equal(calls.order.length, 1);

    assert.equal(
        calls.order[0].playerMove.constant,
        "MOVE_STRUGGLE"
    );

    assert.equal(
        calls.moves[0].move.constant,
        "MOVE_STRUGGLE"
    );
});


test("BattleFlowService filters unusable enemy moves", () => {
    const { service } = createContext();

    const moves = [
        { constant: "TACKLE", pp: 5 },
        { constant: "GROWL", pp: 0 },
        { constant: "TAIL_WHIP", pp: -1 },
        { constant: "QUICK_ATTACK" },
        { constant: "BITE", pp: "3" }
    ];

    const usable = service.getUsableEnemyMoves({
        moves
    });

    assert.deepEqual(
        usable.map(move => move.constant),
        ["TACKLE", "QUICK_ATTACK", "BITE"]
    );
});


test("BattleFlowService returns no enemy moves when move data is missing", () => {
    const { service } = createContext();

    assert.deepEqual(service.getUsableEnemyMoves(null), []);
    assert.deepEqual(service.getUsableEnemyMoves({}), []);
    assert.deepEqual(
        service.getUsableEnemyMoves({ moves: null }),
        []
    );
});


test("BattleFlowService uses STRUGGLE when the enemy AI has no usable move", () => {
    const { service, battle, calls } = createContext({
        enemyMove: null
    });

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, true);

    assert.equal(
        calls.order[0].enemyMove.constant,
        "MOVE_STRUGGLE"
    );
});


// -------------------------------------
// Turn ordering and execution
// -------------------------------------

test("BattleFlowService rejects an unavailable turn-order service", () => {
    const { service, battle } = createContext({
        noOrder: true
    });

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Turn order service unavailable");
});


test("BattleFlowService executes ordered player and opponent moves", () => {
    const {
        service,
        battle,
        playerPokemon,
        enemyPokemon,
        calls
    } = createContext();

    const playerMove = {
        constant: "THUNDERBOLT"
    };

    const result = service.processTurn(
        battle,
        playerMove
    );

    assert.equal(result.success, true);
    assert.equal(calls.validation.length, 1);
    assert.equal(calls.ai.length, 1);
    assert.equal(calls.order.length, 1);

    assert.strictEqual(
        calls.validation[0].pokemon,
        playerPokemon
    );

    assert.strictEqual(
        calls.ai[0].enemy,
        enemyPokemon
    );

    assert.strictEqual(
        calls.ai[0].player,
        playerPokemon
    );

    assert.deepEqual(
        calls.moves.map(call => call.side),
        ["PLAYER", "OPPONENT"]
    );

    assert.strictEqual(
        calls.moves[0].move,
        playerMove
    );

    assert.equal(
        calls.moves[0].defenderSide,
        "OPPONENT"
    );

    assert.equal(
        calls.moves[1].defenderSide,
        "PLAYER"
    );

    assert.equal(result.result.turn, 1);
    assert.equal(result.result.player.pokemon, "PIKACHU");
    assert.equal(result.result.enemy.pokemon, "RATTATA");
    assert.equal(battle.turn, 2);
});


test("BattleFlowService records initial and final HP in the turn result", () => {
    const { service, battle } = createContext({
        executeMove(side, defenderSide, move, result, actualBattle) {
            if (side === "PLAYER") {
                actualBattle.opponent.activePokemon.hp -= 5;
            } else {
                actualBattle.player.activePokemon.hp -= 3;
            }
        }
    });

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, true);
    assert.equal(result.result.player.hp, 32);
    assert.equal(result.result.enemy.hp, 20);
});


test("BattleFlowService advances the turn and processes end-turn effects", () => {
    const { service, battle, calls } = createContext();

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, true);
    assert.equal(calls.endTurn.length, 1);
    assert.strictEqual(calls.endTurn[0].battle, battle);
    assert.equal(battle.turn, 2);
});


test("BattleFlowService checks the battle result after turn processing", () => {
    const { service, battle, calls } = createContext();

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, true);
    assert.ok(calls.battleEnd.length >= 1);

    for (const checkedBattle of calls.battleEnd) {
        assert.strictEqual(checkedBattle, battle);
    }
});


test("BattleFlowService handles faint checks when a faint service is provided", () => {
    const { service, battle, calls } = createContext();

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, true);

    // The service checks both sides after actions and at turn end.
    assert.ok(calls.faint.length >= 2);
});


test("BattleFlowService skips actions with an invalid side", () => {
    const { service, battle, calls } = createContext({
        actions: [
            {
                side: "UNKNOWN",
                move: {
                    constant: "TEST_MOVE"
                }
            }
        ]
    });

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, true);
    assert.equal(calls.moves.length, 0);
    assert.equal(battle.turn, 2);
});


test("BattleFlowService skips a move when the attacker is fainted", () => {
    const { service, battle, playerPokemon, calls } = createContext({
        actions: [
            {
                side: "PLAYER",
                move: {
                    constant: "THUNDERBOLT"
                }
            }
        ]
    });

    playerPokemon.hp = 0;

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, true);
    assert.equal(calls.moves.length, 0);
});


test("BattleFlowService reports an unavailable turn service when execution is needed", () => {
    const { service, battle } = createContext({
        noTurn: true,
        actions: [
            {
                side: "PLAYER",
                move: {
                    constant: "THUNDERBOLT"
                }
            }
        ]
    });

    const result = service.processTurn(battle, {
        constant: "THUNDERBOLT"
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Battle turn service unavailable");
});


// -------------------------------------
// Battle helpers
// -------------------------------------

test("BattleFlowService resolves player and opponent sides", () => {
    const { service, battle } = createContext();

    assert.strictEqual(
        service.getBattleSide(battle, "PLAYER"),
        battle.player
    );

    assert.strictEqual(
        service.getBattleSide(battle, "OPPONENT"),
        battle.opponent
    );

    assert.equal(
        service.getBattleSide(battle, "UNKNOWN"),
        null
    );

    assert.equal(
        service.getBattleSide(null, "PLAYER"),
        null
    );
});


test("BattleFlowService resolves Pokémon names from available fields", () => {
    const { service } = createContext();

    assert.equal(
        service.getPokemonName({ species: "PIKACHU", name: "Pika" }),
        "PIKACHU"
    );

    assert.equal(
        service.getPokemonName({ name: "Opponent" }),
        "Opponent"
    );

    assert.equal(
        service.getPokemonName({ constant: "SPECIES_EEVEE" }),
        "SPECIES_EEVEE"
    );

    assert.equal(
        service.getPokemonName({}),
        "UNKNOWN"
    );

    assert.equal(
        service.getPokemonName(null),
        "UNKNOWN"
    );
});
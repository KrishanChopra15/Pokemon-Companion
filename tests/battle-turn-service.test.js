"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattleTurnService = require(
    "../scripts/services/battle-turn-service.js"
);

// --------------------------------
// Test helpers
// --------------------------------

function createPokemon(name = "Bulbasaur", hp = 20, moves = []) {
    return {
        name,
        species: name.toUpperCase(),
        hp,
        maxHP: 20,
        moves
    };
}

function createMove(overrides = {}) {
    return {
        name: "Tackle",
        constant: "MOVE_TACKLE",
        currentPP: 10,
        maxPP: 10,
        usePP() {
            if (this.currentPP <= 0) {
                return false;
            }

            this.currentPP--;
            return true;
        },
        ...overrides
    };
}

function createBattle(overrides = {}) {
    return {
        id: "BATTLE_1",
        status: "ACTIVE",
        player: {
            party: [createPokemon("Bulbasaur")],
            active: 0
        },
        opponent: {
            party: [createPokemon("Charmander")],
            active: 0
        },
        ...overrides
    };
}

function createPokemonService() {
    return {
        getActivePokemon(side) {
            if (!side || !Array.isArray(side.party)) {
                return null;
            }

            return side.party[side.active ?? 0] || null;
        }
    };
}

function createService({
    moves = null,
    status = null,
    weather = null,
    pokemon = createPokemonService()
} = {}) {
    return new BattleTurnService(
        moves,
        status,
        weather,
        pokemon
    );
}

// --------------------------------
// Constructor
// --------------------------------

test("BattleTurnService stores its dependencies", () => {
    const moves = {};
    const status = {};
    const weather = {};
    const pokemon = {};

    const service = createService({
        moves,
        status,
        weather,
        pokemon
    });

    assert.equal(service.moves, moves);
    assert.equal(service.status, status);
    assert.equal(service.weather, weather);
    assert.equal(service.pokemon, pokemon);
});

// --------------------------------
// Pokémon name resolution
// --------------------------------

test("BattleTurnService resolves the species as the Pokémon name", () => {
    const service = createService();

    assert.equal(
        service.getPokemonName({
            species: "BULBASAUR",
            name: "Leafy"
        }),
        "BULBASAUR"
    );
});

test("BattleTurnService falls back to the Pokémon name", () => {
    const service = createService();

    assert.equal(
        service.getPokemonName({
            name: "Leafy"
        }),
        "Leafy"
    );
});

test("BattleTurnService falls back to the Pokémon constant", () => {
    const service = createService();

    assert.equal(
        service.getPokemonName({
            constant: "SPECIES_BULBASAUR"
        }),
        "SPECIES_BULBASAUR"
    );
});

test("BattleTurnService returns UNKNOWN when no name is available", () => {
    const service = createService();

    assert.equal(service.getPokemonName({}), "UNKNOWN");
});

test("BattleTurnService handles a missing Pokémon name input", () => {
    const service = createService();

    assert.equal(service.getPokemonName(null), "UNKNOWN");
});

// --------------------------------
// Battle-side resolution
// --------------------------------

test("BattleTurnService returns null when the battle is missing", () => {
    const service = createService();

    assert.equal(service.getSide(null, "PLAYER"), null);
});

test("BattleTurnService resolves the player side", () => {
    const service = createService();
    const battle = createBattle();

    assert.equal(
        service.getSide(battle, "PLAYER"),
        battle.player
    );
});

test("BattleTurnService resolves the opponent side", () => {
    const service = createService();
    const battle = createBattle();

    assert.equal(
        service.getSide(battle, "OPPONENT"),
        battle.opponent
    );
});

test("BattleTurnService rejects an unknown side", () => {
    const service = createService();

    assert.equal(
        service.getSide(createBattle(), "SPECTATOR"),
        null
    );
});

test("BattleTurnService does not resolve an absent side", () => {
    const service = createService();

    assert.equal(
        service.getSide(
            { opponent: {} },
            "PLAYER"
        ),
        undefined
    );
});

// --------------------------------
// Ordered move execution guards
// --------------------------------

test("BattleTurnService does nothing when the battle is missing", () => {
    let executeCalls = 0;

    const service = createService({
        moves: {
            executeMove() {
                executeCalls++;
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        createMove(),
        { actions: [] },
        null
    );

    assert.equal(executeCalls, 0);
});

test("BattleTurnService does nothing without a Pokémon service", () => {
    let executeCalls = 0;

    const service = createService({
        moves: {
            executeMove() {
                executeCalls++;
            }
        },
        pokemon: null
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        createMove(),
        { actions: [] },
        createBattle()
    );

    assert.equal(executeCalls, 0);
});

test("BattleTurnService skips an invalid attacker side", () => {
    let executeCalls = 0;

    const service = createService({
        moves: {
            executeMove() {
                executeCalls++;
            }
        }
    });

    service.executeTurnMove(
        "UNKNOWN",
        "OPPONENT",
        createMove(),
        { actions: [] },
        createBattle()
    );

    assert.equal(executeCalls, 0);
});

test("BattleTurnService skips an invalid defender side", () => {
    let executeCalls = 0;

    const service = createService({
        moves: {
            executeMove() {
                executeCalls++;
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "UNKNOWN",
        createMove(),
        { actions: [] },
        createBattle()
    );

    assert.equal(executeCalls, 0);
});

test("BattleTurnService skips execution when the attacker has no active Pokémon", () => {
    let executeCalls = 0;

    const battle = createBattle({
        player: {
            party: [],
            active: 0
        }
    });

    const service = createService({
        moves: {
            executeMove() {
                executeCalls++;
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        createMove(),
        { actions: [] },
        battle
    );

    assert.equal(executeCalls, 0);
});

test("BattleTurnService skips execution when no move is supplied", () => {
    let executeCalls = 0;

    const service = createService({
        moves: {
            executeMove() {
                executeCalls++;
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        null,
        { actions: [] },
        createBattle()
    );

    assert.equal(executeCalls, 0);
});

test("BattleTurnService skips execution when the move service is unavailable", () => {
    const service = createService();

    const result = { actions: [] };

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        createMove(),
        result,
        createBattle()
    );

    assert.deepEqual(result.actions, []);
});

// --------------------------------
// Move selection and execution
// --------------------------------

test("BattleTurnService selects the known move by constant", () => {
    let selectedMove;

    const knownMove = createMove();

    const attacker = createPokemon(
        "Bulbasaur",
        20,
        [knownMove]
    );

    const battle = createBattle({
        player: {
            party: [attacker],
            active: 0
        }
    });

    const service = createService({
        moves: {
            executeMove(_attacker, _defender, move) {
                selectedMove = move;
                return { damage: 4 };
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        {
            name: "Another Tackle",
            constant: "MOVE_TACKLE"
        },
        { actions: [] },
        battle
    );

    assert.strictEqual(selectedMove, knownMove);
});

test("BattleTurnService selects the known move by name", () => {
    let selectedMove;

    const knownMove = createMove();

    const attacker = createPokemon(
        "Bulbasaur",
        20,
        [knownMove]
    );

    const battle = createBattle({
        player: {
            party: [attacker],
            active: 0
        }
    });

    const service = createService({
        moves: {
            executeMove(_attacker, _defender, move) {
                selectedMove = move;
                return { damage: 2 };
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        { name: "Tackle" },
        { actions: [] },
        battle
    );

    assert.strictEqual(selectedMove, knownMove);
});

test("BattleTurnService uses the supplied move when it is not found in the moves list", () => {
    let selectedMove;

    const suppliedMove = {
        name: "Thunderbolt",
        constant: "MOVE_THUNDERBOLT"
    };

    const battle = createBattle();

    const service = createService({
        moves: {
            executeMove(_attacker, _defender, move) {
                selectedMove = move;
                return { damage: 5 };
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        suppliedMove,
        { actions: [] },
        battle
    );

    assert.strictEqual(selectedMove, suppliedMove);
});

test("BattleTurnService executes the move with battle context", () => {
    const battle = createBattle({
        weather: "RAIN",
        environment: "CAVE"
    });

    const move = createMove();

    let receivedArguments;

    const service = createService({
        moves: {
            executeMove(...args) {
                receivedArguments = args;
                return { damage: 5 };
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        move,
        { actions: [] },
        battle
    );

    assert.strictEqual(
        receivedArguments[0],
        battle.player.party[0]
    );

    assert.strictEqual(
        receivedArguments[1],
        battle.opponent.party[0]
    );

    assert.strictEqual(receivedArguments[2], move);

    assert.deepEqual(receivedArguments[3], {
        battle,
        weather: "RAIN",
        environment: "CAVE"
    });
});

test("BattleTurnService records the executed move in the action log", () => {
    const battle = createBattle();

    const result = {
        actions: []
    };

    const service = createService({
        moves: {
            executeMove() {
                return {
                    move: "Tackle",
                    damage: 7,
                    hit: true,
                    effect: "TEST_EFFECT"
                };
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        createMove(),
        result,
        battle
    );

    assert.deepEqual(result.actions[0], {
        attacker: "BULBASAUR",
        move: "Tackle",
        damage: 7,
        target: "CHARMANDER",
        targetHP: 20,
        hit: true,
        effect: "TEST_EFFECT"
    });
});

test("BattleTurnService defaults missing move-result fields in the action log", () => {
    const result = {
        actions: []
    };

    const battle = createBattle();

    const service = createService({
        moves: {
            executeMove() {
                return {};
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        createMove(),
        result,
        battle
    );

    assert.deepEqual(result.actions[0], {
        attacker: "BULBASAUR",
        move: "Tackle",
        damage: 0,
        target: "CHARMANDER",
        targetHP: 20,
        hit: true,
        effect: null
    });
});

test("BattleTurnService records a missed move", () => {
    const result = {
        actions: []
    };

    const service = createService({
        moves: {
            executeMove() {
                return {
                    hit: false,
                    damage: 0
                };
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        createMove(),
        result,
        createBattle()
    );

    assert.equal(result.actions[0].hit, false);
    assert.equal(result.actions[0].damage, 0);
});

// --------------------------------
// PP consumption during execution
// --------------------------------

test("BattleTurnService consumes PP after executing a regular known move", () => {
    const knownMove = createMove({ currentPP: 5 });
    let executeCalls = 0;

    const attacker = createPokemon(
        "Bulbasaur",
        20,
        [knownMove]
    );

    const battle = createBattle({
        player: {
            party: [attacker],
            active: 0
        }
    });

    const service = createService({
        moves: {
            executeMove() {
                executeCalls++;
                return { damage: 3 };
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        knownMove,
        { actions: [] },
        battle
    );

    assert.equal(executeCalls, 1);
    assert.equal(knownMove.currentPP, 4);
});

test("BattleTurnService does not consume PP for STRUGGLE", () => {
    const knownMove = createMove({ currentPP: 0 });

    const attacker = createPokemon(
        "Bulbasaur",
        20,
        [knownMove]
    );

    const battle = createBattle({
        player: {
            party: [attacker],
            active: 0
        }
    });

    let executedMove;

    const service = createService({
        moves: {
            executeMove(_attacker, _defender, move) {
                executedMove = move;
                return { damage: 4 };
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        {
            name: "STRUGGLE",
            constant: "MOVE_STRUGGLE"
        },
        { actions: [] },
        battle
    );

    assert.equal(executedMove.constant, "MOVE_STRUGGLE");
    assert.equal(knownMove.currentPP, 0);
});

test("BattleTurnService replaces the supplied STRUGGLE move with its runtime definition", () => {
    let selectedMove;

    const service = createService({
        moves: {
            executeMove(_attacker, _defender, move) {
                selectedMove = move;
                return {
                    damage: 4,
                    hit: true
                };
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        {
            name: "Incorrect name",
            constant: "MOVE_STRUGGLE"
        },
        { actions: [] },
        createBattle()
    );

    assert.deepEqual(selectedMove, {
        name: "STRUGGLE",
        constant: "MOVE_STRUGGLE",
        type: "NORMAL",
        category: "PHYSICAL",
        power: 50,
        accuracy: 100,
        priority: 0
    });
});

// --------------------------------
// STRUGGLE recoil
// --------------------------------

test("BattleTurnService applies one-quarter damage recoil for STRUGGLE", () => {
    const attacker = createPokemon("Bulbasaur", 20);
    const battle = createBattle({
        player: {
            party: [attacker],
            active: 0
        }
    });

    const result = {
        actions: []
    };

    const service = createService({
        moves: {
            executeMove() {
                return {
                    damage: 20,
                    hit: true
                };
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        {
            name: "STRUGGLE",
            constant: "MOVE_STRUGGLE"
        },
        result,
        battle
    );

    assert.equal(attacker.hp, 15);

    assert.deepEqual(result.actions[1], {
        type: "RECOIL_DAMAGE",
        pokemon: "BULBASAUR",
        damage: 5,
        remainingHP: 15
    });
});

test("BattleTurnService applies minimum one-point STRUGGLE recoil", () => {
    const attacker = createPokemon("Bulbasaur", 20);
    const battle = createBattle({
        player: {
            party: [attacker],
            active: 0
        }
    });

    const result = {
        actions: []
    };

    const service = createService({
        moves: {
            executeMove() {
                return {
                    damage: 0,
                    hit: true
                };
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        {
            name: "STRUGGLE",
            constant: "MOVE_STRUGGLE"
        },
        result,
        battle
    );

    assert.equal(attacker.hp, 19);
    assert.equal(result.actions[1].damage, 1);
});

test("BattleTurnService reduces STRUGGLE attacker HP to zero rather than below zero", () => {
    const attacker = createPokemon("Bulbasaur", 2);
    const battle = createBattle({
        player: {
            party: [attacker],
            active: 0
        }
    });

    const result = {
        actions: []
    };

    const service = createService({
        moves: {
            executeMove() {
                return {
                    damage: 40,
                    hit: true
                };
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        {
            name: "STRUGGLE",
            constant: "MOVE_STRUGGLE"
        },
        result,
        battle
    );

    assert.equal(attacker.hp, 0);
    assert.equal(result.actions[1].remainingHP, 0);
});

test("BattleTurnService does not apply STRUGGLE recoil when the move misses", () => {
    const attacker = createPokemon("Bulbasaur", 20);
    const result = {
        actions: []
    };

    const battle = createBattle({
        player: {
            party: [attacker],
            active: 0
        }
    });

    const service = createService({
        moves: {
            executeMove() {
                return {
                    damage: 0,
                    hit: false
                };
            }
        }
    });

    service.executeTurnMove(
        "PLAYER",
        "OPPONENT",
        {
            name: "STRUGGLE",
            constant: "MOVE_STRUGGLE"
        },
        result,
        battle
    );

    assert.equal(attacker.hp, 20);
    assert.equal(
        result.actions.some(action => action.type === "RECOIL_DAMAGE"),
        false
    );
});

// --------------------------------
// Direct PP consumption
// --------------------------------

test("BattleTurnService rejects PP consumption for missing Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.consumePP(null, createMove()),
        {
            success: false,
            reason: "Invalid Pokémon or move"
        }
    );
});

test("BattleTurnService rejects PP consumption when moves is not an array", () => {
    const service = createService();

    assert.deepEqual(
        service.consumePP(
            { moves: null },
            createMove()
        ),
        {
            success: false,
            reason: "Invalid Pokémon or move"
        }
    );
});

test("BattleTurnService rejects PP consumption when the move is missing", () => {
    const service = createService();

    assert.deepEqual(
        service.consumePP(
            { moves: [createMove()] },
            null
        ),
        {
            success: false,
            reason: "Invalid Pokémon or move"
        }
    );
});

test("BattleTurnService returns Move not found for an unknown move", () => {
    const service = createService();

    assert.deepEqual(
        service.consumePP(
            {
                moves: [createMove()]
            },
            {
                name: "Thunderbolt",
                constant: "MOVE_THUNDERBOLT"
            }
        ),
        {
            success: false,
            reason: "Move not found"
        }
    );
});

test("BattleTurnService consumes PP using the usePP method", () => {
    const knownMove = createMove({
        currentPP: 5
    });

    const service = createService();

    const result = service.consumePP(
        { moves: [knownMove] },
        knownMove
    );

    assert.equal(result.success, true);
    assert.equal(result.currentPP, 4);
    assert.equal(result.maxPP, 10);
    assert.equal(knownMove.currentPP, 4);
});

test("BattleTurnService reports exhausted PP when usePP fails", () => {
    const knownMove = createMove({
        currentPP: 0
    });

    const service = createService();

    const result = service.consumePP(
        { moves: [knownMove] },
        knownMove
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "No PP remaining");
    assert.equal(result.currentPP, 0);
    assert.equal(result.maxPP, 10);
});

test("BattleTurnService consumes legacy numeric PP", () => {
    const knownMove = {
        name: "Tackle",
        pp: 3,
        maxPP: 35
    };

    const service = createService();

    const result = service.consumePP(
        { moves: [knownMove] },
        knownMove
    );

    assert.equal(result.success, true);
    assert.equal(result.currentPP, 2);
    assert.equal(result.maxPP, 35);
    assert.equal(knownMove.pp, 2);
});

test("BattleTurnService clamps legacy PP to zero", () => {
    const knownMove = {
        name: "Tackle",
        pp: 0
    };

    const service = createService();

    const result = service.consumePP(
        { moves: [knownMove] },
        knownMove
    );

    assert.equal(result.success, true);
    assert.equal(result.currentPP, 0);
    assert.equal(knownMove.pp, 0);
});

test("BattleTurnService returns null maxPP when legacy maximum PP is absent", () => {
    const knownMove = {
        name: "Tackle",
        pp: 3
    };

    const service = createService();

    const result = service.consumePP(
        { moves: [knownMove] },
        knownMove
    );

    assert.equal(result.maxPP, null);
});

test("BattleTurnService reports unsupported PP tracking", () => {
    const knownMove = {
        name: "Tackle"
    };

    const service = createService();

    assert.deepEqual(
        service.consumePP(
            { moves: [knownMove] },
            knownMove
        ),
        {
            success: false,
            reason: "Move does not support PP tracking"
        }
    );
});

// --------------------------------
// End-of-turn processing
// --------------------------------

test("BattleTurnService skips end-turn processing for a missing battle", () => {
    let statusCalls = 0;
    let weatherCalls = 0;

    const service = createService({
        status: {
            processTurn() {
                statusCalls++;
            }
        },
        weather: {
            processTurn() {
                weatherCalls++;
            }
        }
    });

    service.processEndTurn(null, { actions: [] });

    assert.equal(statusCalls, 0);
    assert.equal(weatherCalls, 0);
});

test("BattleTurnService skips end-turn processing without a Pokémon service", () => {
    let statusCalls = 0;

    const service = createService({
        status: {
            processTurn() {
                statusCalls++;
            }
        },
        pokemon: null
    });

    service.processEndTurn(
        createBattle(),
        { actions: [] }
    );

    assert.equal(statusCalls, 0);
});

test("BattleTurnService processes status and weather for both living active Pokémon", () => {
    const battle = createBattle();
    const calls = [];
    const result = {
        actions: []
    };

    const service = createService({
        status: {
            processTurn(pokemon) {
                calls.push(`status:${pokemon.name}`);

                pokemon.hp -= 2;

                return {
                    damage: 2
                };
            }
        },
        weather: {
            processTurn(pokemon) {
                calls.push(`weather:${pokemon.name}`);

                pokemon.hp -= 1;

                return {
                    damage: 1
                };
            }
        }
    });

    service.processEndTurn(battle, result);

    assert.deepEqual(calls, [
        "status:Bulbasaur",
        "weather:Bulbasaur",
        "status:Charmander",
        "weather:Charmander"
    ]);

    assert.equal(battle.player.party[0].hp, 17);
    assert.equal(battle.opponent.party[0].hp, 17);
});

test("BattleTurnService records status damage", () => {
    const pokemon = createPokemon("Bulbasaur", 15);
    const battle = createBattle({
        player: {
            party: [pokemon],
            active: 0
        }
    });

    const result = {
        actions: []
    };

    const service = createService({
        status: {
            processTurn(target) {
                target.hp -= 3;

                return {
                    damage: 3
                };
            }
        }
    });

    service.processEndTurn(battle, result);

    assert.deepEqual(result.actions[0], {
        type: "STATUS_DAMAGE",
        pokemon: "BULBASAUR",
        damage: 3,
        remainingHP: 12
    });
});

test("BattleTurnService records weather damage", () => {
    const pokemon = createPokemon("Bulbasaur", 15);
    const battle = createBattle({
        player: {
            party: [pokemon],
            active: 0
        }
    });

    const result = {
        actions: []
    };

    const service = createService({
        weather: {
            processTurn(target) {
                target.hp -= 4;

                return {
                    damage: 4
                };
            }
        }
    });

    service.processEndTurn(battle, result);

    assert.deepEqual(result.actions[0], {
        type: "WEATHER_DAMAGE",
        pokemon: "BULBASAUR",
        damage: 4,
        remainingHP: 11
    });
});

test("BattleTurnService skips status and weather for fainted active Pokémon", () => {
    const battle = createBattle({
        player: {
            party: [createPokemon("Bulbasaur", 0)],
            active: 0
        },
        opponent: {
            party: [createPokemon("Charmander", -1)],
            active: 0
        }
    });

    let statusCalls = 0;
    let weatherCalls = 0;

    const service = createService({
        status: {
            processTurn() {
                statusCalls++;
                return { damage: 1 };
            }
        },
        weather: {
            processTurn() {
                weatherCalls++;
                return { damage: 1 };
            }
        }
    });

    const result = {
        actions: []
    };

    service.processEndTurn(battle, result);

    assert.equal(statusCalls, 0);
    assert.equal(weatherCalls, 0);
    assert.deepEqual(result.actions, []);
});

test("BattleTurnService skips status processing when the status service is unavailable", () => {
    const battle = createBattle();
    const calls = [];

    const service = createService({
        weather: {
            processTurn(pokemon) {
                calls.push(pokemon.name);

                return {
                    damage: 1
                };
            }
        }
    });

    const result = {
        actions: []
    };

    service.processEndTurn(battle, result);

    assert.deepEqual(calls, ["Bulbasaur", "Charmander"]);

    assert.deepEqual(
        result.actions.map(action => action.type),
        ["WEATHER_DAMAGE", "WEATHER_DAMAGE"]
    );
});

test("BattleTurnService skips weather processing when the weather service is unavailable", () => {
    const battle = createBattle();
    const calls = [];

    const service = createService({
        status: {
            processTurn(pokemon) {
                calls.push(pokemon.name);

                return {
                    damage: 1
                };
            }
        }
    });

    const result = {
        actions: []
    };

    service.processEndTurn(battle, result);

    assert.deepEqual(calls, ["Bulbasaur", "Charmander"]);

    assert.deepEqual(
        result.actions.map(action => action.type),
        ["STATUS_DAMAGE", "STATUS_DAMAGE"]
    );
});

test("BattleTurnService does not record status effects without damage", () => {
    const battle = createBattle();

    const service = createService({
        status: {
            processTurn() {
                return {
                    damage: 0
                };
            }
        }
    });

    const result = {
        actions: []
    };

    service.processEndTurn(battle, result);

    assert.deepEqual(result.actions, []);
});

test("BattleTurnService does not record weather effects without damage", () => {
    const battle = createBattle();

    const service = createService({
        weather: {
            processTurn() {
                return {
                    damage: 0
                };
            }
        }
    });

    const result = {
        actions: []
    };

    service.processEndTurn(battle, result);

    assert.deepEqual(result.actions, []);
});

// --------------------------------
// STRUGGLE definition
// --------------------------------

test("BattleTurnService returns the expected STRUGGLE move data", () => {
    const service = createService();

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

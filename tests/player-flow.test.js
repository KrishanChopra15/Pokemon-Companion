"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AppContainer = require("../scripts/app-container");
const PlayerFlow = require("../scripts/player/player-flow");
const PokemonMoveSlot = require("../scripts/domain/pokemon-move-slot");


function createContext() {
    const app = new AppContainer();

    return {
        app,
        session: app.get("session"),
        playerFlow: app.get("playerFlow")
    };
}


test("PlayerFlow creates a player and attaches it to the session", () => {
    const { session, playerFlow } = createContext();

    const result = playerFlow.createPlayer("Red");

    assert.equal(result.success, true);
    assert.equal(result.player.name, "Red");
    assert.strictEqual(session.getPlayer(), result.player);
});


test("PlayerFlow selects and registers the starter correctly", () => {
    const { app, session, playerFlow } = createContext();

    playerFlow.createPlayer("Red");

    const result = playerFlow.chooseStarter("CHARMANDER");

    assert.equal(result.success, true);
    assert.equal(result.starter, "CHARMANDER");
    assert.equal(result.tracked, true);
    assert.equal(result.team, true);
    assert.equal(result.active, true);

    const state = session.getState();
    const pokemon = result.pokemon;

    assert.equal(state.starter, "CHARMANDER");
    assert.equal(session.getPlayer().starter, "CHARMANDER");

    assert.ok(state.pokemon.includes(pokemon));
    assert.ok(state.team.includes(pokemon));

    assert.strictEqual(state.activePokemon, pokemon);
    assert.ok(
        state.pokemon.some(
            trackedPokemon =>
                trackedPokemon.trackerId === pokemon.trackerId
        )
    );
});


test("PlayerFlow initializes starter Pokémon with the expected fields", () => {
    const { session, playerFlow } = createContext();

    playerFlow.createPlayer("Red");

    const result = playerFlow.chooseStarter("CHARMANDER");

    assert.equal(result.success, true);

    const pokemon = result.pokemon;

    assert.equal(pokemon.species, "CHARMANDER");
    assert.equal(pokemon.level, 5);
    assert.equal(pokemon.exp, 0);
    assert.equal(pokemon.nickname, null);
    assert.equal(pokemon.ball, null);
    assert.equal(pokemon.metLocation, "PALLET_TOWN");
    assert.equal(pokemon.location, "PALLET_TOWN");
    assert.equal(pokemon.seen, true);
    assert.equal(pokemon.caught, true);
    assert.equal(pokemon.favorite, false);
    assert.equal(pokemon.isStarter, true);

    assert.ok(Array.isArray(pokemon.moves));
    assert.ok(pokemon.moves.length > 0);
    assert.equal(session.getState().storage.length, 0);
});


test("PlayerFlow rejects starter selection when no player exists", () => {
    const { playerFlow, session } = createContext();

    const result = playerFlow.chooseStarter("CHARMANDER");

    assert.equal(result.success, false);
    assert.equal(result.reason, "No player created");
    assert.equal(session.getState().starter, null);
    assert.equal(session.getState().pokemon.length, 0);
    assert.equal(session.getState().team.length, 0);
});


test("PlayerFlow prevents selecting a second starter", () => {
    const { session, playerFlow } = createContext();

    playerFlow.createPlayer("Red");

    const firstResult = playerFlow.chooseStarter("CHARMANDER");
    assert.equal(firstResult.success, true);

    const result = playerFlow.chooseStarter("SQUIRTLE");

    assert.equal(result.success, false);
    assert.equal(result.reason, "Starter already selected");

    const state = session.getState();

    assert.equal(state.starter, "CHARMANDER");
    assert.equal(state.pokemon.length, 1);
    assert.equal(state.team.length, 1);
    assert.strictEqual(state.activePokemon, firstResult.pokemon);
});


test("PlayerFlow creates the four most recent moves learned by the specified level", () => {
    const moveData = {
        MOVE_A: { constant: "MOVE_A", pp: 20 },
        MOVE_B: { constant: "MOVE_B", pp: 25 },
        MOVE_C: { constant: "MOVE_C", pp: 30 },
        MOVE_D: { constant: "MOVE_D", pp: 35 },
        MOVE_E: { constant: "MOVE_E", pp: 40 },
        MOVE_F: { constant: "MOVE_F", pp: 15 }
    };

    const moveDatabase = {
        getMove(constant) {
            return moveData[constant];
        }
    };

    const playerFlow = new PlayerFlow(
        null,
        null,
        null,
        null,
        moveDatabase
    );

    const speciesData = {
        learnset: [
            { level: 1, move: { constant: "MOVE_A" } },
            { level: 2, move: { constant: "MOVE_B" } },
            { level: 3, move: { constant: "MOVE_C" } },
            { level: 4, move: { constant: "MOVE_D" } },
            { level: 5, move: { constant: "MOVE_E" } },
            { level: 6, move: { constant: "MOVE_F" } }
        ]
    };

    const result = playerFlow.createStarterMoves(speciesData, 5);

    assert.equal(result.success, true);
    assert.equal(result.moves.length, 4);

    assert.deepEqual(
        result.moves.map(move => move.constant),
        ["MOVE_B", "MOVE_C", "MOVE_D", "MOVE_E"]
    );
});


test("PlayerFlow initializes each starter move slot with its PP", () => {
    const moveDatabase = {
        getMove(constant) {
            return {
                constant,
                pp: 35
            };
        }
    };

    const playerFlow = new PlayerFlow(
        null,
        null,
        null,
        null,
        moveDatabase
    );

    const result = playerFlow.createStarterMoves({
        learnset: [
            { level: 1, move: { constant: "TACKLE" } },
            { level: 3, move: { constant: "GROWL" } }
        ]
    }, 5);

    assert.equal(result.success, true);
    assert.equal(result.moves.length, 2);

    for (const move of result.moves) {
        assert.ok(move instanceof PokemonMoveSlot);
        assert.equal(move.basePP, 35);
        assert.equal(move.currentPP, 35);
        assert.equal(move.ppUps, 0);
    }
});


test("PlayerFlow handles unavailable starter move data", () => {
    const playerFlowWithoutDatabase = new PlayerFlow(
        null,
        null,
        null,
        null,
        null
    );

    const missingDatabaseResult =
        playerFlowWithoutDatabase.createStarterMoves({
            learnset: [
                { level: 1, move: { constant: "TACKLE" } }
            ]
        }, 5);

    assert.equal(missingDatabaseResult.success, false);
    assert.equal(
        missingDatabaseResult.reason,
        "Starter move data unavailable"
    );

    const playerFlow = new PlayerFlow(
        null,
        null,
        null,
        null,
        { getMove: () => null }
    );

    const noLearnsetResult =
        playerFlow.createStarterMoves({ learnset: [] }, 5);

    assert.equal(noLearnsetResult.success, false);
    assert.equal(
        noLearnsetResult.reason,
        "No starter moves available"
    );
});


test("PlayerFlow rejects missing or invalid move database entries", () => {
    const playerFlow = new PlayerFlow(
        null,
        null,
        null,
        null,
        { getMove: () => null }
    );

    const result = playerFlow.createStarterMoves({
        learnset: [
            { level: 1, move: { constant: "UNKNOWN_MOVE" } }
        ]
    }, 5);

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Move data unavailable: UNKNOWN_MOVE"
    );
});


test("PlayerFlow does not modify the shared species database record", () => {
    const { app, playerFlow } = createContext();

    playerFlow.createPlayer("Red");

    const database = app.get("pokemonDatabase");
    const speciesData = database.getPokemon("CHARMANDER");

    assert.ok(speciesData);

    const originalLevel = speciesData.level;
    const originalMoves = JSON.stringify(speciesData.learnset);

    const result = playerFlow.chooseStarter("CHARMANDER");

    assert.equal(result.success, true);
    assert.equal(speciesData.level, originalLevel);
    assert.equal(
        JSON.stringify(speciesData.learnset),
        originalMoves
    );

    assert.notStrictEqual(result.pokemon, speciesData);
});


test("PlayerFlow rolls back tracker and starter state if team addition fails", () => {
    const { app, session, playerFlow } = createContext();

    playerFlow.createPlayer("Red");

    const teamFlow = app.get("teamFlow");
    const originalAddToTeam = teamFlow.addToTeam;

    try {
        teamFlow.addToTeam = () => ({
            success: false,
            reason: "Team addition failed"
        });

        const result = playerFlow.chooseStarter("CHARMANDER");

        assert.equal(result.success, false);
        assert.equal(result.reason, "Team addition failed");

        const state = session.getState();

        assert.equal(state.starter, null);
        assert.equal(state.pokemon.length, 0);
        assert.equal(state.team.length, 0);
        assert.equal(state.activePokemon, null);
        assert.equal(session.getPlayer().starter, null);
    } finally {
        teamFlow.addToTeam = originalAddToTeam;
    }
});

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GameSession =
    require("../scripts/session/game-session");


test("GameSession uses one canonical TrainerState", () => {

    const session = new GameSession("firered");
    const state = session.getState();

    assert.strictEqual(
        session.state,
        session.trainerState
    );

    assert.strictEqual(
        state,
        session.trainerState
    );

    assert.equal(
        session.game,
        "firered"
    );

    assert.equal(
        state.currentLocation,
        "MAP_PALLET_TOWN"
    );

    assert.equal(
        state.started,
        false
    );

});


test("Session inventory and runtime state share references", () => {

    const session = new GameSession();
    const state = session.getState();

    assert.strictEqual(
        state.inventory,
        state.items
    );

    assert.deepEqual(
        state.team,
        []
    );

    assert.deepEqual(
        state.pokemon,
        []
    );

    assert.deepEqual(
        state.storage,
        []
    );

    assert.equal(
        state.activePokemon,
        null
    );

    assert.equal(
        state.nextPokemonId,
        1
    );

});


test("Reset creates fresh state and clears adventure progress", () => {

    const session = new GameSession();

    const player = {
        id: 1,
        name: "Reset Test",
        starter: "BULBASAUR"
    };

    session.setPlayer(player);

    const oldState = session.getState();

    oldState.addStoryFlag("RESET_TEST");
    oldState.addItem("POTION", 2);

    oldState.pokemon.push({
        id: 101,
        species: "BULBASAUR",
        level: 5
    });

    oldState.team.push({
        id: 101,
        species: "BULBASAUR",
        level: 5
    });

    oldState.storage.push({
        id: 102,
        species: "CHARMANDER",
        level: 5
    });

    oldState.starter = "BULBASAUR";

    oldState.activePokemon =
        oldState.team[0];

    session.start();

    const result = session.reset();

    const newState = session.getState();

    assert.equal(
        result.success,
        true
    );

    assert.notStrictEqual(
        newState,
        oldState
    );

    assert.strictEqual(
        session.state,
        session.trainerState
    );

    assert.strictEqual(
        newState,
        session.trainerState
    );

    assert.equal(
        session.getPlayer(),
        null
    );

    assert.equal(
        newState.started,
        false
    );

    assert.equal(
        newState.hasStoryFlag("RESET_TEST"),
        false
    );

    assert.equal(
        newState.getItemCount("POTION"),
        0
    );

    assert.deepEqual(
        newState.pokemon,
        []
    );

    assert.deepEqual(
        newState.team,
        []
    );

    assert.deepEqual(
        newState.storage,
        []
    );

    assert.equal(
        newState.starter,
        null
    );

    assert.equal(
        newState.activePokemon,
        null
    );

    assert.strictEqual(
        newState.inventory,
        newState.items
    );

});


test("Separate sessions keep their adventure state isolated", () => {

    const firstSession =
        new GameSession("firered");

    const secondSession =
        new GameSession("firered");

    const firstState =
        firstSession.getState();

    const secondState =
        secondSession.getState();


    assert.notStrictEqual(
        firstState,
        secondState
    );

    assert.notStrictEqual(
        firstState.pokemon,
        secondState.pokemon
    );

    assert.notStrictEqual(
        firstState.team,
        secondState.team
    );

    assert.notStrictEqual(
        firstState.storage,
        secondState.storage
    );

    assert.notStrictEqual(
        firstState.items,
        secondState.items
    );


    firstState.addStoryFlag(
        "FIRST_ADVENTURE_ONLY"
    );

    firstState.addItem(
        "POTION",
        3
    );

    firstState.team.push({
        id: 201,
        species: "BULBASAUR",
        level: 5
    });

    firstState.storage.push({
        id: 202,
        species: "SQUIRTLE",
        level: 5
    });


    assert.equal(
        firstState.hasStoryFlag(
            "FIRST_ADVENTURE_ONLY"
        ),
        true
    );

    assert.equal(
        secondState.hasStoryFlag(
            "FIRST_ADVENTURE_ONLY"
        ),
        false
    );

    assert.equal(
        firstState.getItemCount("POTION"),
        3
    );

    assert.equal(
        secondState.getItemCount("POTION"),
        0
    );

    assert.equal(
        firstState.team.length,
        1
    );

    assert.equal(
        secondState.team.length,
        0
    );

    assert.equal(
        firstState.storage.length,
        1
    );

    assert.equal(
        secondState.storage.length,
        0
    );

});

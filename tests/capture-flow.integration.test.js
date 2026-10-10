"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AppContainer = require("../scripts/app-container");


function createContext() {
    const app = new AppContainer();

    return {
        app,
        session: app.get("session"),
        captureFlow: app.get("captureFlow"),
        teamFlow: app.get("teamFlow"),
        inventoryFlow: app.get("inventoryFlow"),
        storageFlow: app.get("storageFlow"),
        pokemonTracker: app.get("pokemonTracker")
    };
}


test("Integration: capturing a Pokémon connects inventory, tracker, and team", () => {
    const {
        session,
        captureFlow
    } = createContext();

    const state = session.getState();

    // Provide one capture ball in the real session inventory.
    state.inventory.ITEM_POKE_BALL = 1;

    const result = captureFlow.confirmCapture(
        {
            species: "PIKACHU",
            level: 7,
            location: "ROUTE_2",
            metLocation: "ROUTE_2"
        },
        "POKE_BALL"
    );

    assert.equal(result.success, true);
    assert.equal(result.tracked, true);
    assert.equal(result.team, true);
    assert.equal(result.stored, false);

    // The real inventory service consumed the ball.
    assert.equal(state.inventory.ITEM_POKE_BALL, 0);

    // The Pokémon was registered in canonical state.
    const trackedPokemon = state.pokemon.find(
        pokemon => pokemon.species === "PIKACHU"
    );

    assert.ok(trackedPokemon);

    // The tracker and team contain the same object.
    assert.strictEqual(state.team[0], trackedPokemon);

    // The active inventory alias still points to canonical state.
    assert.strictEqual(state.inventory, state.items);

    // Capture details were initialized.
    assert.equal(trackedPokemon.level, 7);
    assert.equal(trackedPokemon.ball, "ITEM_POKE_BALL");
    assert.equal(trackedPokemon.metLocation, "ROUTE_2");

    // Normal capture does not send the Pokémon to PC storage.
    assert.equal(state.storage.length, 0);
});


test("Integration: a capture with a full party sends the Pokémon to PC storage", () => {
    const {
        session,
        captureFlow
    } = createContext();

    const state = session.getState();

    // Fill the party to its six-Pokémon limit.
    for (let index = 0; index < 6; index++) {
        state.team.push({
            id: index + 1,
            species: `TEST_POKEMON_${index + 1}`,
            level: 5
        });
    }

    state.inventory.ITEM_POKE_BALL = 1;

    const originalTeam = [...state.team];

    const result = captureFlow.confirmCapture(
        {
            species: "SNORLAX",
            level: 30,
            location: "ROUTE_12",
            metLocation: "ROUTE_12"
        },
        "POKE_BALL"
    );

    assert.equal(result.success, true);
    assert.equal(result.tracked, true);
    assert.equal(result.team, false);
    assert.equal(result.stored, true);

    // The team remains full and unchanged.
    assert.equal(state.team.length, 6);
    assert.deepEqual(state.team, originalTeam);

    // The capture ball was consumed.
    assert.equal(state.inventory.ITEM_POKE_BALL, 0);

    // The captured Pokémon is tracked and placed in PC storage.
    const trackedPokemon = state.pokemon.find(
        pokemon => pokemon.species === "SNORLAX"
    );

    assert.ok(trackedPokemon);
    assert.equal(state.storage.length, 1);
    assert.strictEqual(state.storage[0], trackedPokemon);

    // The overflow Pokémon was not added to the full party.
    assert.equal(
        state.team.some(pokemon => pokemon.species === "SNORLAX"),
        false
    );

    assert.strictEqual(state.inventory, state.items);
});
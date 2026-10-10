"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GameSession = require("../scripts/session/game-session");
const ActivePokemonManager = require("../scripts/team-active/active-pokemon-manager");


test("ActivePokemonManager uses the canonical session state", () => {
    const session = new GameSession();
    const manager = new ActivePokemonManager(session);

    assert.strictEqual(
        manager.getActive(),
        session.getState().activePokemon
    );
});


test("ActivePokemonManager initially has no active Pokémon", () => {
    const session = new GameSession();
    const manager = new ActivePokemonManager(session);

    assert.equal(manager.getActive(), null);
    assert.equal(manager.hasActive(), false);
});


test("Setting an active Pokémon stores the same object", () => {
    const session = new GameSession();
    const manager = new ActivePokemonManager(session);

    const pokemon = {
        id: 1,
        species: "PIKACHU",
        level: 10
    };

    const result = manager.setActive(pokemon);

    assert.equal(result.success, true);
    assert.strictEqual(result.pokemon, pokemon);
    assert.strictEqual(manager.getActive(), pokemon);
    assert.strictEqual(session.getState().activePokemon, pokemon);
    assert.equal(manager.hasActive(), true);
});


test("ActivePokemonManager rejects null Pokémon", () => {
    const session = new GameSession();
    const manager = new ActivePokemonManager(session);

    const result = manager.setActive(null);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid Pokemon");
    assert.equal(manager.getActive(), null);
    assert.equal(manager.hasActive(), false);
});


test("ActivePokemonManager rejects Pokémon without a species", () => {
    const session = new GameSession();
    const manager = new ActivePokemonManager(session);

    const result = manager.setActive({
        id: 2,
        level: 5
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid Pokemon");
    assert.equal(manager.getActive(), null);
});


test("Rejecting invalid Pokémon preserves the current selection", () => {
    const session = new GameSession();
    const manager = new ActivePokemonManager(session);

    const pokemon = {
        id: 3,
        species: "CHARMANDER",
        level: 5
    };

    manager.setActive(pokemon);

    const result = manager.setActive({
        id: 4,
        level: 5
    });

    assert.equal(result.success, false);
    assert.strictEqual(manager.getActive(), pokemon);
});


test("Clearing the active Pokémon sets it to null", () => {
    const session = new GameSession();
    const manager = new ActivePokemonManager(session);

    manager.setActive({
        id: 5,
        species: "SQUIRTLE",
        level: 5
    });

    const result = manager.clear();

    assert.equal(result.success, true);
    assert.equal(manager.getActive(), null);
    assert.equal(session.getState().activePokemon, null);
    assert.equal(manager.hasActive(), false);
});


test("Separate sessions keep active Pokémon isolated", () => {
    const firstSession = new GameSession();
    const secondSession = new GameSession();

    const firstManager = new ActivePokemonManager(firstSession);
    const secondManager = new ActivePokemonManager(secondSession);

    const pokemon = {
        id: 6,
        species: "BULBASAUR",
        level: 5
    };

    firstManager.setActive(pokemon);

    assert.strictEqual(firstManager.getActive(), pokemon);
    assert.equal(secondManager.getActive(), null);
    assert.equal(secondManager.hasActive(), false);
});
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AppContainer = require("../scripts/app-container");


function createAdventureContext() {
    const app = new AppContainer();

    return {
        app,
        session: app.get("session"),
        initializer: app.get("adventureInitializer")
    };
}


test("AdventureInitializer starts a new adventure successfully", () => {
    const { session, initializer } = createAdventureContext();

    const result = initializer.startAdventure(
        "Red",
        "CHARMANDER"
    );

    assert.equal(result.success, true);
    assert.equal(result.player.name, "Red");
    assert.equal(result.starter, "CHARMANDER");
    assert.equal(result.pokemon.species, "CHARMANDER");
    assert.equal(result.location, "PALLET_TOWN");

    assert.equal(session.getLocation(), "PALLET_TOWN");
    assert.equal(session.getState().started, true);
});


test("Adventure initialization connects the starter to all relevant state", () => {
    const { session, initializer } = createAdventureContext();

    const result = initializer.startAdventure(
        "Red",
        "CHARMANDER"
    );

    assert.equal(result.success, true);

    const state = session.getState();
    const starter = result.pokemon;

    assert.strictEqual(session.state, session.trainerState);
    assert.strictEqual(state, session.trainerState);

    assert.equal(state.starter, "CHARMANDER");
    assert.equal(session.player.starter, "CHARMANDER");

    assert.ok(state.pokemon.includes(starter));
    assert.ok(state.team.includes(starter));
    assert.strictEqual(state.activePokemon, starter);
});


test("AdventureInitializer trims player names and normalizes starter names", () => {
    const { initializer } = createAdventureContext();

    const result = initializer.startAdventure(
        "  Red  ",
        "  charmander  "
    );

    assert.equal(result.success, true);
    assert.equal(result.player.name, "Red");
    assert.equal(result.starter, "CHARMANDER");
    assert.equal(result.pokemon.species, "CHARMANDER");
});


test("AdventureInitializer rejects an empty player name", () => {
    const { session, initializer } = createAdventureContext();

    const originalState = session.getState();
    originalState.inventory.POTION = 3;

    const result = initializer.startAdventure(
        "   ",
        "CHARMANDER"
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid player name");

    assert.strictEqual(session.getState(), originalState);
    assert.equal(session.getState().inventory.POTION, 3);
});


test("AdventureInitializer rejects an invalid starter without resetting state", () => {
    const { session, initializer } = createAdventureContext();

    const originalState = session.getState();
    originalState.inventory.POTION = 3;

    const result = initializer.startAdventure(
        "Red",
        "MEWTWO"
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid starter");

    assert.strictEqual(session.getState(), originalState);
    assert.equal(session.getState().inventory.POTION, 3);
});


test("Starting a second adventure creates fresh state", () => {
    const { session, initializer } = createAdventureContext();

    const firstResult = initializer.startAdventure(
        "Red",
        "CHARMANDER"
    );

    assert.equal(firstResult.success, true);

    const previousState = session.getState();

    previousState.inventory.POTION = 5;
    previousState.totalSteps = 250;

    previousState.storage.push({
        id: 900,
        species: "SNORLAX",
        level: 30
    });

    const secondResult = initializer.startAdventure(
        "Leaf",
        "SQUIRTLE"
    );

    assert.equal(secondResult.success, true);
    assert.notStrictEqual(session.getState(), previousState);
    assert.strictEqual(session.state, session.trainerState);

    const newState = session.getState();

    assert.equal(session.player.name, "Leaf");
    assert.equal(newState.starter, "SQUIRTLE");

    assert.equal(newState.inventory.POTION || 0, 0);
    assert.equal(newState.totalSteps, 0);
    assert.equal(newState.storage.length, 0);

    assert.equal(newState.pokemon.length, 1);
    assert.equal(newState.team.length, 1);

    assert.strictEqual(newState.pokemon[0], secondResult.pokemon);
    assert.strictEqual(newState.team[0], secondResult.pokemon);
    assert.strictEqual(newState.activePokemon, secondResult.pokemon);

    assert.equal(session.getLocation(), "PALLET_TOWN");
});


test("A rejected new adventure does not replace the current adventure", () => {
    const { session, initializer } = createAdventureContext();

    const firstResult = initializer.startAdventure(
        "Red",
        "BULBASAUR"
    );

    assert.equal(firstResult.success, true);

    const originalState = session.getState();
    const originalPlayer = session.player;
    originalState.inventory.POTION = 2;

    const result = initializer.startAdventure(
        "",
        "SQUIRTLE"
    );

    assert.equal(result.success, false);
    assert.strictEqual(session.getState(), originalState);
    assert.strictEqual(session.player, originalPlayer);
    assert.equal(session.getState().inventory.POTION, 2);
    assert.strictEqual(
        session.getState().activePokemon,
        firstResult.pokemon
    );
});
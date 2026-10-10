"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GameSession = require("../scripts/session/game-session");
const SaveManager = require("../scripts/save/save-manager");
const PokemonMoveSlot = require("../scripts/domain/pokemon-move-slot");
const InventoryManager = require("../scripts/inventory/inventory-manager");


test("SaveManager creates saves with unique IDs", () => {
    const session = new GameSession();
    const saveManager = new SaveManager();

    const first = saveManager.createSave(session);
    const second = saveManager.createSave(session);

    assert.equal(first.success, true);
    assert.equal(second.success, true);
    assert.equal(first.saveId, 1);
    assert.equal(second.saveId, 2);
    assert.equal(saveManager.getSaves().length, 2);
});


test("SaveManager stores save data independently of live state", () => {
    const session = new GameSession();
    const saveManager = new SaveManager();
    const inventoryManager = new InventoryManager(session);

    inventoryManager.addItem("POTION", 3);
    session.getState().totalSteps = 120;

    const save = saveManager.createSave(session);

    inventoryManager.addItem("POTION", 5);
    session.getState().totalSteps = 999;

    const restoredSession = new GameSession();
    const result = saveManager.loadSave(
        save.saveId,
        restoredSession
    );

    assert.equal(result.success, true);
    assert.equal(
        restoredSession.getState().inventory.POTION,
        3
    );
    assert.equal(restoredSession.getState().totalSteps, 120);
});


test("Loading an unknown save ID fails cleanly", () => {
    const session = new GameSession();
    const saveManager = new SaveManager();

    const result = saveManager.loadSave(999, session);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Save not found");
});


test("Loading restores the canonical TrainerState reference", () => {
    const session = new GameSession();
    const saveManager = new SaveManager();

    const save = saveManager.createSave(session);
    const restoredSession = new GameSession();

    const result = saveManager.loadSave(
        save.saveId,
        restoredSession
    );

    assert.equal(result.success, true);
    assert.strictEqual(result.session, restoredSession);
    assert.strictEqual(
        restoredSession.state,
        restoredSession.trainerState
    );
    assert.strictEqual(
        restoredSession.getState(),
        restoredSession.trainerState
    );
    assert.strictEqual(
        restoredSession.getState().inventory,
        restoredSession.getState().items
    );
});


test("Loading restores player, game, and runtime state", () => {
    const session = new GameSession();
    const saveManager = new SaveManager();

    session.game = {
        name: "FireRed"
    };

    session.player = {
        name: "Red",
        starter: "CHARMANDER"
    };

    const state = session.getState();

    state.started = true;
    state.starter = "CHARMANDER";
    state.nextPokemonId = 25;
    state.walkingSteps = 12;
    state.totalSteps = 450;
    state.playTime = 600;

    const save = saveManager.createSave(session);
    const restoredSession = new GameSession();

    const result = saveManager.loadSave(
        save.saveId,
        restoredSession
    );

    assert.equal(result.success, true);
    assert.deepEqual(restoredSession.game, {
        name: "FireRed"
    });
    assert.deepEqual(restoredSession.player, {
        name: "Red",
        starter: "CHARMANDER"
    });

    const restoredState = restoredSession.getState();

    assert.equal(restoredState.started, true);
    assert.equal(restoredState.starter, "CHARMANDER");
    assert.equal(restoredState.nextPokemonId, 25);
    assert.equal(restoredState.walkingSteps, 12);
    assert.equal(restoredState.totalSteps, 450);
    assert.equal(restoredState.playTime, 600);
});


test("Loading preserves shared Pokémon references", () => {
    const session = new GameSession();
    const saveManager = new SaveManager();

    const state = session.getState();

    const pikachu = {
        id: 10,
        species: "PIKACHU",
        level: 15,
        moves: []
    };

    const bulbasaur = {
        id: 11,
        species: "BULBASAUR",
        level: 8,
        moves: []
    };

    state.pokemon.push(pikachu, bulbasaur);
    state.team.push(pikachu);
    state.activePokemon = pikachu;
    state.storage.push(bulbasaur);

    const save = saveManager.createSave(session);
    const restoredSession = new GameSession();

    const result = saveManager.loadSave(
        save.saveId,
        restoredSession
    );

    assert.equal(result.success, true);

    const restoredState = restoredSession.getState();

    assert.strictEqual(
        restoredState.pokemon[0],
        restoredState.team[0]
    );
    assert.strictEqual(
        restoredState.pokemon[0],
        restoredState.activePokemon
    );
    assert.strictEqual(
        restoredState.pokemon[1],
        restoredState.storage[0]
    );
});


test("Loading reconstructs runtime Pokémon move slots", () => {
    const session = new GameSession();
    const saveManager = new SaveManager();

    const move = new PokemonMoveSlot({
        constant: "TACKLE",
        basePP: 35,
        currentPP: 20,
        ppUps: 1,
        maxPP: 42
    });

    const pokemon = {
        id: 12,
        species: "SQUIRTLE",
        level: 10,
        moves: [move]
    };

    const state = session.getState();

    state.pokemon.push(pokemon);
    state.team.push(pokemon);
    state.activePokemon = pokemon;

    const save = saveManager.createSave(session);
    const restoredSession = new GameSession();

    const result = saveManager.loadSave(
        save.saveId,
        restoredSession
    );

    assert.equal(result.success, true);

    const restoredPokemon =
        restoredSession.getState().pokemon[0];

    const restoredMove = restoredPokemon.moves[0];

    assert.ok(restoredMove instanceof PokemonMoveSlot);
    assert.equal(restoredMove.constant, "TACKLE");
    assert.equal(restoredMove.basePP, 35);
    assert.equal(restoredMove.currentPP, 20);
    assert.equal(restoredMove.ppUps, 1);

    assert.strictEqual(
        restoredPokemon,
        restoredSession.getState().team[0]
    );
});


test("Loading one save into separate sessions creates independent state", () => {
    const session = new GameSession();
    const saveManager = new SaveManager();

    const pokemon = {
        id: 13,
        species: "EEVEE",
        level: 7,
        moves: []
    };

    const state = session.getState();

    state.pokemon.push(pokemon);
    state.team.push(pokemon);
    state.inventory.POTION = 2;

    const save = saveManager.createSave(session);

    const firstSession = new GameSession();
    const secondSession = new GameSession();

    assert.equal(
        saveManager.loadSave(save.saveId, firstSession).success,
        true
    );

    assert.equal(
        saveManager.loadSave(save.saveId, secondSession).success,
        true
    );

    const firstPokemon = firstSession.getState().pokemon[0];
    const secondPokemon = secondSession.getState().pokemon[0];

    assert.notStrictEqual(firstPokemon, secondPokemon);

    firstPokemon.level = 50;
    firstSession.getState().inventory.POTION = 99;

    assert.equal(secondPokemon.level, 7);
    assert.equal(secondSession.getState().inventory.POTION, 2);

    assert.strictEqual(
        firstPokemon,
        firstSession.getState().team[0]
    );

    assert.strictEqual(
        secondPokemon,
        secondSession.getState().team[0]
    );
});
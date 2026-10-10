"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GameSession = require("../scripts/session/game-session");
const StorageManager = require("../scripts/storage/storage-manager");


test("StorageManager uses the canonical session storage", () => {
    const session = new GameSession();
    const storageManager = new StorageManager(session);

    assert.strictEqual(
        storageManager.getStorage(),
        session.getState().storage
    );
});


test("StorageManager returns an array for PC storage", () => {
    const session = new GameSession();
    const storageManager = new StorageManager(session);

    assert.ok(Array.isArray(storageManager.getStorage()));
    assert.equal(storageManager.getCount(), 0);
});


test("StorageManager adds the same Pokémon object to storage", () => {
    const session = new GameSession();
    const storageManager = new StorageManager(session);

    const pokemon = {
        id: 100,
        species: "PIKACHU",
        level: 10
    };

    const result = storageManager.addPokemon(pokemon);

    assert.equal(result.success, true);
    assert.ok(storageManager.getStorage().includes(pokemon));
    assert.strictEqual(
        storageManager.getStorage()[0],
        pokemon
    );
    assert.equal(storageManager.getCount(), 1);
});


test("StorageManager rejects invalid Pokémon data", () => {
    const session = new GameSession();
    const storageManager = new StorageManager(session);

    const result = storageManager.addPokemon(null);

    assert.equal(result.success, false);
    assert.equal(storageManager.getCount(), 0);
});


test("StorageManager rejects a Pokémon without a species", () => {
    const session = new GameSession();
    const storageManager = new StorageManager(session);

    const result = storageManager.addPokemon({
        id: 101,
        level: 5
    });

    assert.equal(result.success, false);
    assert.equal(storageManager.getCount(), 0);
});


test("StorageManager prevents adding the same object twice", () => {
    const session = new GameSession();
    const storageManager = new StorageManager(session);

    const pokemon = {
        id: 102,
        species: "BULBASAUR",
        level: 5
    };

    const firstResult = storageManager.addPokemon(pokemon);
    const secondResult = storageManager.addPokemon(pokemon);

    assert.equal(firstResult.success, true);
    assert.equal(secondResult.success, false);
    assert.equal(storageManager.getCount(), 1);
});


test("StorageManager prevents duplicate Pokémon IDs", () => {
    const session = new GameSession();
    const storageManager = new StorageManager(session);

    const firstPokemon = {
        id: 103,
        species: "CHARMANDER",
        level: 5
    };

    const duplicatePokemon = {
        id: 103,
        species: "SQUIRTLE",
        level: 5
    };

    assert.equal(
        storageManager.addPokemon(firstPokemon).success,
        true
    );

    const result = storageManager.addPokemon(duplicatePokemon);

    assert.equal(result.success, false);
    assert.equal(storageManager.getCount(), 1);
    assert.strictEqual(
        storageManager.findPokemon(103),
        firstPokemon
    );
});


test("StorageManager assigns an ID when a Pokémon has no ID", () => {
    const session = new GameSession();
    const storageManager = new StorageManager(session);

    const pokemon = {
        species: "EEVEE",
        level: 8
    };

    const previousNextId = session.getState().nextPokemonId;
    const result = storageManager.addPokemon(pokemon);

    assert.equal(result.success, true);
    assert.ok(pokemon.id !== undefined && pokemon.id !== null);
    assert.equal(
        pokemon.id,
        previousNextId
    );
    assert.equal(
        session.getState().nextPokemonId,
        previousNextId + 1
    );
});


test("StorageManager finds a Pokémon by ID", () => {
    const session = new GameSession();
    const storageManager = new StorageManager(session);

    const pokemon = {
        id: 104,
        species: "PSYDUCK",
        level: 12
    };

    storageManager.addPokemon(pokemon);

    assert.strictEqual(
        storageManager.findPokemon(104),
        pokemon
    );
    assert.equal(storageManager.findPokemon(999), undefined);
});


test("StorageManager removes the correct Pokémon by ID", () => {
    const session = new GameSession();
    const storageManager = new StorageManager(session);

    const firstPokemon = {
        id: 105,
        species: "GEODUDE",
        level: 7
    };

    const secondPokemon = {
        id: 106,
        species: "ZUBAT",
        level: 8
    };

    storageManager.addPokemon(firstPokemon);
    storageManager.addPokemon(secondPokemon);

    const result = storageManager.removePokemon(105);

    assert.equal(result.success, true);
    assert.equal(storageManager.getCount(), 1);
    assert.equal(storageManager.findPokemon(105), undefined);
    assert.strictEqual(
        storageManager.findPokemon(106),
        secondPokemon
    );
});


test("StorageManager handles removing an unknown ID", () => {
    const session = new GameSession();
    const storageManager = new StorageManager(session);

    const result = storageManager.removePokemon(999);

    assert.equal(result.success, false);
    assert.equal(storageManager.getCount(), 0);
});


test("StorageManager count reflects current stored Pokémon", () => {
    const session = new GameSession();
    const storageManager = new StorageManager(session);

    storageManager.addPokemon({
        id: 107,
        species: "PIDGEY",
        level: 3
    });

    storageManager.addPokemon({
        id: 108,
        species: "RATTATA",
        level: 4
    });

    assert.equal(storageManager.getCount(), 2);

    storageManager.removePokemon(107);

    assert.equal(storageManager.getCount(), 1);
});


test("Separate sessions keep PC storage isolated", () => {
    const firstSession = new GameSession();
    const secondSession = new GameSession();

    const firstStorage = new StorageManager(firstSession);
    const secondStorage = new StorageManager(secondSession);

    const pokemon = {
        id: 109,
        species: "SNORLAX",
        level: 30
    };

    firstStorage.addPokemon(pokemon);

    assert.equal(firstStorage.getCount(), 1);
    assert.equal(secondStorage.getCount(), 0);
    assert.notStrictEqual(
        firstStorage.getStorage(),
        secondStorage.getStorage()
    );
});
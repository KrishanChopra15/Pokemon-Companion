
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GameSession =
    require("../scripts/session/game-session");

const PokemonTrackerService =
    require("../scripts/services/pokemon-tracker-service");

const TeamManager =
    require("../scripts/team/team-manager");


test("Tracker adds the same Pokémon object to canonical state", () => {

    const session = new GameSession();

    const tracker =
        new PokemonTrackerService(session);

    const pokemon = {
        species: "BULBASAUR",
        level: 5
    };

    const result =
        tracker.addPokemon(pokemon);

    assert.equal(
        result.success,
        true
    );

    assert.strictEqual(
        result.pokemon,
        pokemon
    );

    assert.strictEqual(
        tracker.getAll()[0],
        pokemon
    );

    assert.strictEqual(
        session.getState().pokemon[0],
        pokemon
    );

    assert.equal(
        pokemon.trackerId,
        1
    );

    assert.equal(
        session.getState().nextPokemonId,
        2
    );

});


test("Tracker initializes missing Pokémon fields", () => {

    const session = new GameSession();

    const tracker =
        new PokemonTrackerService(session);

    const pokemon = {
        species: "CHARMANDER",
        level: 5
    };

    const result =
        tracker.addPokemon(pokemon);

    assert.equal(
        result.success,
        true
    );

    assert.equal(
        pokemon.nickname,
        null
    );

    assert.equal(
        pokemon.exp,
        0
    );

    assert.equal(
        pokemon.friendship,
        70
    );

    assert.equal(
        pokemon.ball,
        null
    );

    assert.equal(
        pokemon.metLocation,
        null
    );

    assert.deepEqual(
        pokemon.moves,
        []
    );

    assert.equal(
        pokemon.seen,
        true
    );

    assert.equal(
        pokemon.caught,
        true
    );

    assert.equal(
        pokemon.favorite,
        false
    );

});


test("Tracker and team can share the same Pokémon object", () => {

    const session = new GameSession();

    const tracker =
        new PokemonTrackerService(session);

    const team =
        new TeamManager(session);

    const pokemon = {
        species: "SQUIRTLE",
        level: 5
    };

    const tracked =
        tracker.addPokemon(pokemon);

    assert.equal(
        tracked.success,
        true
    );

    const added =
        team.addPokemon(pokemon);

    assert.equal(
        added.success,
        true
    );

    assert.strictEqual(
        tracker.getAll()[0],
        team.getTeam()[0]
    );

    assert.strictEqual(
        tracker.getAll()[0],
        pokemon
    );

    pokemon.level = 10;

    assert.equal(
        team.getTeam()[0].level,
        10
    );

});


test("Tracker finds Pokémon by species regardless of letter case", () => {

    const session = new GameSession();

    const tracker =
        new PokemonTrackerService(session);

    const bulbasaur = {
        species: "BULBASAUR",
        level: 5
    };

    const charmander = {
        species: "CHARMANDER",
        level: 5
    };

    tracker.addPokemon(bulbasaur);
    tracker.addPokemon(charmander);

    const found =
        tracker.findPokemon("bulbasaur");

    assert.equal(
        found.length,
        1
    );

    assert.strictEqual(
        found[0],
        bulbasaur
    );

    assert.strictEqual(
        tracker.getPokemon(
            bulbasaur.trackerId
        ),
        bulbasaur
    );

});


test("Tracker updates and removes Pokémon correctly", () => {

    const session = new GameSession();

    const tracker =
        new PokemonTrackerService(session);

    const pokemon = {
        species: "BULBASAUR",
        level: 5,
        friendship: 70
    };

    tracker.addPokemon(pokemon);

    const updated =
        tracker.updatePokemon(
            pokemon.trackerId,
            {
                level: 8,
                friendship: 300
            }
        );

    assert.equal(
        updated.success,
        true
    );

    assert.strictEqual(
        updated.pokemon,
        pokemon
    );

    assert.equal(
        pokemon.level,
        8
    );

    assert.equal(
        pokemon.friendship,
        255
    );

    const removed =
        tracker.removePokemon(
            pokemon.trackerId
        );

    assert.equal(
        removed.success,
        true
    );

    assert.strictEqual(
        removed.pokemon,
        pokemon
    );

    assert.equal(
        tracker.getAll().length,
        0
    );

});


test("Tracker rejects invalid Pokémon data", () => {

    const session = new GameSession();

    const tracker =
        new PokemonTrackerService(session);

    const missingPokemon =
        tracker.addPokemon(null);

    const missingSpecies =
        tracker.addPokemon({
            level: 5
        });

    assert.equal(
        missingPokemon.success,
        false
    );

    assert.equal(
        missingSpecies.success,
        false
    );

    assert.equal(
        tracker.getAll().length,
        0
    );

});


test("Collection summary counts caught Pokémon and species", () => {

    const session = new GameSession();

    const tracker =
        new PokemonTrackerService(session);

    tracker.addPokemon({
        species: "BULBASAUR",
        level: 5
    });

    tracker.addPokemon({
        species: "BULBASAUR",
        level: 8,
        caught: true
    });

    tracker.addPokemon({
        species: "CHARMANDER",
        level: 5,
        caught: false
    });

    const summary =
        tracker.getSummary();

    assert.equal(
        summary.total,
        3
    );

    assert.equal(
        summary.caught,
        2
    );

    assert.equal(
        tracker.getCaughtSpeciesCount(),
        1
    );

});

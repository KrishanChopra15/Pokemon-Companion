
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GameSession =
    require("../scripts/session/game-session");

const TeamManager =
    require("../scripts/team/team-manager");


test("TeamManager uses the canonical session team", () => {

    const session = new GameSession();
    const manager = new TeamManager(session);

    assert.strictEqual(
        manager.getTeam(),
        session.getState().team
    );

    assert.equal(
        manager.getSize(),
        0
    );

});


test("TeamManager adds the same Pokémon object", () => {

    const session = new GameSession();
    const manager = new TeamManager(session);

    const pokemon = {
        id: 1,
        species: "BULBASAUR",
        level: 5
    };

    const result =
        manager.addPokemon(pokemon);

    assert.equal(
        result.success,
        true
    );

    assert.strictEqual(
        result.pokemon,
        pokemon
    );

    assert.strictEqual(
        manager.getTeam()[0],
        pokemon
    );

    assert.equal(
        manager.getSize(),
        1
    );

});


test("TeamManager rejects an invalid Pokémon", () => {

    const session = new GameSession();
    const manager = new TeamManager(session);

    const result =
        manager.addPokemon(null);

    assert.equal(
        result.success,
        false
    );

    assert.equal(
        result.reason,
        "Invalid Pokemon"
    );

    assert.equal(
        manager.getSize(),
        0
    );

});


test("TeamManager enforces the six Pokémon limit", () => {

    const session = new GameSession();
    const manager = new TeamManager(session);

    const pokemon = [];

    for(
        let i = 0;
        i < 6;
        i++
    )
    {

        pokemon.push({

            id: i + 1,

            species:
                "TESTMON_" + i,

            level: 5

        });

    }


    for(
        const member of pokemon
    )
    {

        assert.equal(
            manager.addPokemon(member).success,
            true
        );

    }


    const overflow =
        manager.addPokemon({

            id: 7,

            species: "OVERFLOWMON",

            level: 5

        });


    assert.equal(
        manager.getSize(),
        6
    );

    assert.equal(
        overflow.success,
        false
    );

    assert.equal(
        overflow.reason,
        "Team is full"
    );

});


test("Removing a Pokémon object targets that individual", () => {

    const session = new GameSession();
    const manager = new TeamManager(session);

    const first = {
        id: 1,
        species: "PIKACHU",
        level: 5
    };

    const second = {
        id: 2,
        species: "PIKACHU",
        level: 10
    };

    manager.addPokemon(first);
    manager.addPokemon(second);

    const result =
        manager.removePokemon(second);

    assert.equal(
        result.success,
        true
    );

    assert.strictEqual(
        result.pokemon,
        second
    );

    assert.deepEqual(
        manager.getTeam(),
        [first]
    );

    assert.strictEqual(
        manager.getTeam()[0],
        first
    );

});


test("Removing by Pokémon ID targets the correct member", () => {

    const session = new GameSession();
    const manager = new TeamManager(session);

    const first = {
        id: 101,
        species: "EEVEE",
        level: 5
    };

    const second = {
        id: 102,
        species: "EEVEE",
        level: 12
    };

    manager.addPokemon(first);
    manager.addPokemon(second);

    const result =
        manager.removePokemon(102);

    assert.equal(
        result.success,
        true
    );

    assert.strictEqual(
        result.pokemon,
        second
    );

    assert.deepEqual(
        manager.getTeam(),
        [first]
    );

});


test("Species-based removal remains compatible", () => {

    const session = new GameSession();
    const manager = new TeamManager(session);

    const pokemon = {
        id: 1,
        species: "SQUIRTLE",
        level: 5
    };

    manager.addPokemon(pokemon);

    const result =
        manager.removePokemon("SQUIRTLE");

    assert.equal(
        result.success,
        true
    );

    assert.strictEqual(
        result.pokemon,
        pokemon
    );

    assert.equal(
        manager.getSize(),
        0
    );

});


test("TeamManager reports membership by species", () => {

    const session = new GameSession();
    const manager = new TeamManager(session);

    manager.addPokemon({

        id: 1,

        species: "CHARMANDER",

        level: 5

    });


    assert.equal(
        manager.hasPokemon("CHARMANDER"),
        true
    );

    assert.equal(
        manager.hasPokemon("BULBASAUR"),
        false
    );

});


test("TeamManager swaps Pokémon positions", () => {

    const session = new GameSession();
    const manager = new TeamManager(session);

    const first = {
        id: 1,
        species: "BULBASAUR",
        level: 5
    };

    const second = {
        id: 2,
        species: "CHARMANDER",
        level: 5
    };

    manager.addPokemon(first);
    manager.addPokemon(second);

    const result =
        manager.swapPokemon(0, 1);

    assert.equal(
        result.success,
        true
    );

    assert.strictEqual(
        manager.getTeam()[0],
        second
    );

    assert.strictEqual(
        manager.getTeam()[1],
        first
    );

});


test("TeamManager rejects invalid swap positions", () => {

    const session = new GameSession();
    const manager = new TeamManager(session);

    const pokemon = {
        id: 1,
        species: "BULBASAUR",
        level: 5
    };

    manager.addPokemon(pokemon);

    const result =
        manager.swapPokemon(0, 5);

    assert.equal(
        result.success,
        false
    );

    assert.equal(
        result.reason,
        "Invalid position"
    );

    assert.strictEqual(
        manager.getTeam()[0],
        pokemon
    );

});


test("Clearing the team preserves its shared array reference", () => {

    const session = new GameSession();
    const manager = new TeamManager(session);

    manager.addPokemon({

        id: 1,

        species: "BULBASAUR",

        level: 5

    });


    const originalTeam =
        manager.getTeam();

    const result =
        manager.clear();


    assert.equal(
        result.success,
        true
    );

    assert.equal(
        manager.getSize(),
        0
    );

    assert.strictEqual(
        manager.getTeam(),
        originalTeam
    );

    assert.strictEqual(
        session.getState().team,
        originalTeam
    );

});

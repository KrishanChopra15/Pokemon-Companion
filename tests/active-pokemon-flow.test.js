"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GameSession = require("../scripts/session/game-session");
const TeamManager = require("../scripts/team/team-manager");
const TeamFlow = require("../scripts/team/team-flow");
const ActivePokemonManager = require("../scripts/team-active/active-pokemon-manager");
const ActivePokemonFlow = require("../scripts/team-active/active-pokemon-flow");


function createContext() {
    const session = new GameSession();
    const teamManager = new TeamManager(session);
    const teamFlow = new TeamFlow(teamManager);
    const activeManager = new ActivePokemonManager(session);
    const activeFlow = new ActivePokemonFlow(
        activeManager,
        teamFlow
    );

    return {
        session,
        teamManager,
        teamFlow,
        activeManager,
        activeFlow
    };
}


// -------------------------------------
// Selecting the active Pokémon
// -------------------------------------

test("ActivePokemonFlow selects a Pokémon that belongs to the team", () => {
    const {
        session,
        teamFlow,
        activeFlow
    } = createContext();

    const pokemon = {
        id: 1,
        species: "PIKACHU",
        level: 10
    };

    teamFlow.addToTeam(pokemon);

    const result = activeFlow.selectActive(pokemon);

    assert.equal(result.success, true);
    assert.strictEqual(result.pokemon, pokemon);
    assert.strictEqual(activeFlow.getActive(), pokemon);
    assert.strictEqual(session.getState().activePokemon, pokemon);
});


test("ActivePokemonFlow rejects a Pokémon that is not on the team", () => {
    const {
        session,
        activeFlow
    } = createContext();

    const pokemon = {
        id: 2,
        species: "CHARMANDER",
        level: 5
    };

    const result = activeFlow.selectActive(pokemon);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Pokemon not in team");
    assert.equal(session.getState().activePokemon, null);
});


test("ActivePokemonFlow rejects a null Pokémon without throwing", () => {
    const { activeFlow } = createContext();

    assert.doesNotThrow(() => {
        const result = activeFlow.selectActive(null);

        assert.equal(result.success, false);
    });
});


test("ActivePokemonFlow rejects a Pokémon without a species", () => {
    const { activeFlow } = createContext();

    const result = activeFlow.selectActive({
        id: 3,
        level: 5
    });

    assert.equal(result.success, false);
});


test("ActivePokemonFlow rejects a different object with the same species", () => {
    const {
        session,
        teamFlow,
        activeFlow
    } = createContext();

    const teamPokemon = {
        id: 4,
        species: "EEVEE",
        level: 8
    };

    const differentPokemon = {
        id: 5,
        species: "EEVEE",
        level: 20
    };

    teamFlow.addToTeam(teamPokemon);

    const result = activeFlow.selectActive(differentPokemon);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Pokemon not in team");
    assert.equal(session.getState().activePokemon, null);
});


test("Selecting a different team member updates the active Pokémon", () => {
    const {
        session,
        teamFlow,
        activeFlow
    } = createContext();

    const first = {
        id: 6,
        species: "BULBASAUR",
        level: 5
    };

    const second = {
        id: 7,
        species: "SQUIRTLE",
        level: 5
    };

    teamFlow.addToTeam(first);
    teamFlow.addToTeam(second);

    assert.equal(activeFlow.selectActive(first).success, true);

    const result = activeFlow.selectActive(second);

    assert.equal(result.success, true);
    assert.strictEqual(activeFlow.getActive(), second);
    assert.strictEqual(session.getState().activePokemon, second);
});


// -------------------------------------
// Active Pokémon access and status
// -------------------------------------

test("ActivePokemonFlow returns the currently active Pokémon", () => {
    const {
        teamFlow,
        activeFlow
    } = createContext();

    const pokemon = {
        id: 8,
        species: "GROWLITHE",
        level: 12
    };

    teamFlow.addToTeam(pokemon);
    activeFlow.selectActive(pokemon);

    assert.strictEqual(activeFlow.getActive(), pokemon);
});


test("ActivePokemonFlow reports status when a Pokémon is active", () => {
    const {
        teamFlow,
        activeFlow
    } = createContext();

    const pokemon = {
        id: 9,
        species: "ABRA",
        level: 7
    };

    teamFlow.addToTeam(pokemon);
    activeFlow.selectActive(pokemon);

    const status = activeFlow.getStatus();

    assert.strictEqual(status.active, pokemon);
    assert.equal(status.hasActive, true);
});


test("ActivePokemonFlow reports status when no Pokémon is active", () => {
    const { activeFlow } = createContext();

    const status = activeFlow.getStatus();

    assert.equal(status.active, null);
    assert.equal(status.hasActive, false);
});


test("ActivePokemonFlow clears the active Pokémon", () => {
    const {
        session,
        teamFlow,
        activeFlow
    } = createContext();

    const pokemon = {
        id: 10,
        species: "MEOWTH",
        level: 6
    };

    teamFlow.addToTeam(pokemon);
    activeFlow.selectActive(pokemon);

    const result = activeFlow.clearActive();

    assert.equal(result.success, true);
    assert.equal(activeFlow.getActive(), null);
    assert.equal(session.getState().activePokemon, null);
    assert.equal(activeFlow.getStatus().hasActive, false);

    // Clearing the active selection must not remove the party member.
    assert.strictEqual(session.getState().team[0], pokemon);
});


// -------------------------------------
// Selection failure preserves state
// -------------------------------------

test("A failed selection does not replace the existing active Pokémon", () => {
    const {
        session,
        teamFlow,
        activeFlow
    } = createContext();

    const existingPokemon = {
        id: 11,
        species: "PIDGEY",
        level: 4
    };

    const nonTeamPokemon = {
        id: 12,
        species: "RATTATA",
        level: 5
    };

    teamFlow.addToTeam(existingPokemon);
    activeFlow.selectActive(existingPokemon);

    const result = activeFlow.selectActive(nonTeamPokemon);

    assert.equal(result.success, false);
    assert.strictEqual(
        session.getState().activePokemon,
        existingPokemon
    );
});


// -------------------------------------
// Session isolation
// -------------------------------------

test("Active Pokémon selections remain isolated between sessions", () => {
    const first = createContext();
    const second = createContext();

    const pokemon = {
        id: 13,
        species: "PIKACHU",
        level: 10
    };

    first.teamFlow.addToTeam(pokemon);

    const result = first.activeFlow.selectActive(pokemon);

    assert.equal(result.success, true);
    assert.strictEqual(first.activeFlow.getActive(), pokemon);

    assert.equal(second.activeFlow.getActive(), null);
    assert.equal(second.activeFlow.getStatus().hasActive, false);
});
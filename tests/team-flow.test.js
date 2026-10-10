"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AppContainer = require("../scripts/app-container");
const TeamFlow = require("../scripts/team/team-flow");


function createMockContext() {
    const members = [];
    const calls = [];

    const manager = {
        addPokemon(pokemon) {
            calls.push({
                method: "addPokemon",
                args: [pokemon]
            });

            if (!pokemon || !pokemon.species) {
                return {
                    success: false,
                    reason: "Invalid Pokemon"
                };
            }

            if (members.length >= 6) {
                return {
                    success: false,
                    reason: "Team Full"
                };
            }

            members.push(pokemon);

            return {
                success: true,
                pokemon
            };
        },

        removePokemon(target) {
            calls.push({
                method: "removePokemon",
                args: [target]
            });

            const index = members.findIndex(
                pokemon =>
                    pokemon === target ||
                    (
                        target &&
                        target.id != null &&
                        pokemon.id === target.id
                    ) ||
                    (
                        typeof target === "string" &&
                        pokemon.species === target
                    )
            );

            if (index === -1) {
                return {
                    success: false,
                    reason: "Pokemon not found"
                };
            }

            const [pokemon] = members.splice(index, 1);

            return {
                success: true,
                pokemon
            };
        },

        swapPokemon(first, second) {
            calls.push({
                method: "swapPokemon",
                args: [first, second]
            });

            if (
                !Number.isInteger(first) ||
                !Number.isInteger(second) ||
                first < 0 ||
                second < 0 ||
                first >= members.length ||
                second >= members.length
            ) {
                return {
                    success: false,
                    reason: "Invalid team position"
                };
            }

            [
                members[first],
                members[second]
            ] = [
                members[second],
                members[first]
            ];

            return {
                success: true
            };
        },

        getTeam() {
            calls.push({
                method: "getTeam",
                args: []
            });

            return members;
        },

        getSize() {
            calls.push({
                method: "getSize",
                args: []
            });

            return members.length;
        }
    };

    return {
        flow: new TeamFlow(manager),
        manager,
        members,
        calls
    };
}


function createRealContext() {
    const app = new AppContainer();

    return {
        app,
        session: app.get("session"),
        flow: app.get("teamFlow")
    };
}


// -------------------------------------
// Delegation tests
// -------------------------------------

test("TeamFlow delegates adding Pokémon to TeamManager", () => {
    const { flow, members, calls } = createMockContext();

    const pokemon = {
        id: 1,
        species: "PIKACHU",
        level: 10
    };

    const result = flow.addToTeam(pokemon);

    assert.equal(result.success, true);
    assert.strictEqual(result.pokemon, pokemon);
    assert.strictEqual(members[0], pokemon);

    assert.deepEqual(calls[0], {
        method: "addPokemon",
        args: [pokemon]
    });
});


test("TeamFlow delegates removing Pokémon to TeamManager", () => {
    const { flow, members, calls } = createMockContext();

    const pokemon = {
        id: 2,
        species: "CHARMANDER",
        level: 5
    };

    members.push(pokemon);

    const result = flow.removeFromTeam(pokemon);

    assert.equal(result.success, true);
    assert.strictEqual(result.pokemon, pokemon);
    assert.equal(members.length, 0);

    assert.deepEqual(calls[0], {
        method: "removePokemon",
        args: [pokemon]
    });
});


test("TeamFlow delegates team reordering to TeamManager", () => {
    const { flow, members, calls } = createMockContext();

    const first = {
        id: 3,
        species: "BULBASAUR",
        level: 5
    };

    const second = {
        id: 4,
        species: "SQUIRTLE",
        level: 5
    };

    members.push(first, second);

    const result = flow.reorderTeam(0, 1);

    assert.equal(result.success, true);
    assert.strictEqual(members[0], second);
    assert.strictEqual(members[1], first);

    assert.deepEqual(calls[0], {
        method: "swapPokemon",
        args: [0, 1]
    });
});


test("TeamFlow getTeam returns the manager's team array", () => {
    const { flow, members } = createMockContext();

    const pokemon = {
        id: 5,
        species: "EEVEE",
        level: 8
    };

    members.push(pokemon);

    assert.strictEqual(flow.getTeam(), members);
    assert.strictEqual(flow.getTeam()[0], pokemon);
});


test("TeamFlow getStatus reports party size and team members", () => {
    const { flow, members } = createMockContext();

    members.push(
        {
            id: 6,
            species: "PIKACHU",
            level: 10
        },
        {
            id: 7,
            species: "SNORLAX",
            level: 20
        }
    );

    const status = flow.getStatus();

    assert.equal(status.size, 2);
    assert.strictEqual(status.team, members);
    assert.strictEqual(status.team[0], members[0]);
    assert.strictEqual(status.team[1], members[1]);
});


test("TeamFlow returns failures from TeamManager unchanged", () => {
    const { flow } = createMockContext();

    const addResult = flow.addToTeam(null);

    assert.equal(addResult.success, false);
    assert.equal(addResult.reason, "Invalid Pokemon");

    const removeResult = flow.removeFromTeam({
        id: 999,
        species: "UNKNOWN"
    });

    assert.equal(removeResult.success, false);
    assert.equal(removeResult.reason, "Pokemon not found");
});


// -------------------------------------
// Real application integration tests
// -------------------------------------

test("Integration: TeamFlow updates the canonical session team", () => {
    const { session, flow } = createRealContext();

    const pokemon = {
        id: 101,
        species: "PIKACHU",
        level: 12
    };

    const result = flow.addToTeam(pokemon);

    assert.equal(result.success, true);
    assert.strictEqual(result.pokemon, pokemon);
    assert.strictEqual(session.getState().team[0], pokemon);
    assert.strictEqual(flow.getTeam(), session.getState().team);
});


test("Integration: TeamFlow enforces the six Pokémon party limit", () => {
    const { session, flow } = createRealContext();

    const state = session.getState();

    for (let index = 0; index < 6; index++) {
        const result = flow.addToTeam({
            id: 200 + index,
            species: `TEST_POKEMON_${index + 1}`,
            level: 5
        });

        assert.equal(result.success, true);
    }

    const seventhPokemon = {
        id: 300,
        species: "EEVEE",
        level: 5
    };

    const result = flow.addToTeam(seventhPokemon);

    assert.equal(result.success, false);
    assert.equal(state.team.length, 6);
    assert.equal(state.team.includes(seventhPokemon), false);
});


test("Integration: TeamFlow removes the requested Pokémon without replacing the team array", () => {
    const { session, flow } = createRealContext();

    const first = {
        id: 401,
        species: "PIKACHU",
        level: 10
    };

    const second = {
        id: 402,
        species: "EEVEE",
        level: 8
    };

    const originalTeam = session.getState().team;

    flow.addToTeam(first);
    flow.addToTeam(second);

    const result = flow.removeFromTeam(first);

    assert.equal(result.success, true);
    assert.strictEqual(result.pokemon, first);
    assert.strictEqual(session.getState().team, originalTeam);
    assert.deepEqual(session.getState().team, [second]);
});


test("Integration: TeamFlow reorder changes party order but preserves Pokémon objects", () => {
    const { session, flow } = createRealContext();

    const first = {
        id: 501,
        species: "BULBASAUR",
        level: 5
    };

    const second = {
        id: 502,
        species: "CHARMANDER",
        level: 5
    };

    flow.addToTeam(first);
    flow.addToTeam(second);

    const result = flow.reorderTeam(0, 1);

    assert.equal(result.success, true);
    assert.strictEqual(session.getState().team[0], second);
    assert.strictEqual(session.getState().team[1], first);
    assert.equal(session.getState().team.length, 2);
});
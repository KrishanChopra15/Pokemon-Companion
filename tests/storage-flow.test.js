"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AppContainer = require("../scripts/app-container");
const StorageFlow = require("../scripts/storage/storage-flow");


function createRealContext() {
    const app = new AppContainer();

    return {
        app,
        session: app.get("session"),
        flow: app.get("storageFlow"),
        teamFlow: app.get("teamFlow")
    };
}


function createMockContext(options = {}) {
    const items = [...(options.storageItems || [])];
    const members = [...(options.teamMembers || [])];

    const storage = {
        getStorage() {
            return items;
        },

        getCount() {
            return items.length;
        },

        addPokemon(pokemon) {
            if (options.failStorageAddition) {
                return {
                    success: false,
                    reason: "Storage addition failed"
                };
            }

            if (
                items.some(
                    item =>
                        item === pokemon ||
                        (
                            pokemon.id != null &&
                            item.id === pokemon.id
                        )
                )
            ) {
                return {
                    success: false,
                    reason: "Duplicate Pokémon"
                };
            }

            items.push(pokemon);

            return {
                success: true,
                pokemon
            };
        },

        findPokemon(id) {
            return items.find(pokemon => pokemon.id === id);
        },

        removePokemon(id) {
            if (options.failStorageRemoval) {
                return {
                    success: false,
                    reason: "Storage removal failed"
                };
            }

            const index = items.findIndex(
                pokemon => pokemon.id === id
            );

            if (index === -1) {
                return {
                    success: false,
                    reason: "Pokemon not found"
                };
            }

            const [pokemon] = items.splice(index, 1);

            return {
                success: true,
                pokemon
            };
        }
    };

    const team = {
        getTeam() {
            return members;
        },

        addToTeam(pokemon) {
            if (options.failTeamAddition) {
                return {
                    success: false,
                    reason: "Team addition failed"
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

        removeFromTeam(target) {
            const index = members.findIndex(
                pokemon =>
                    pokemon === target ||
                    (
                        target &&
                        target.id != null &&
                        pokemon.id === target.id
                    )
            );

            if (index === -1) {
                return {
                    success: false,
                    reason: "Pokémon not on team"
                };
            }

            const [pokemon] = members.splice(index, 1);

            return {
                success: true,
                pokemon
            };
        }
    };

    return {
        flow: new StorageFlow(
            options.noStorage ? null : storage,
            options.noTeam ? null : team
        ),
        storage,
        team,
        items,
        members
    };
}


// -------------------------------------
// Real AppContainer integration tests
// -------------------------------------

test("Integration: depositing a Pokémon moves the same object into PC storage", () => {
    const { session, flow } = createRealContext();

    const pokemon = {
        id: 501,
        species: "PIKACHU",
        level: 12
    };

    session.getState().team.push(pokemon);

    const result = flow.depositPokemon(pokemon);

    assert.equal(result.success, true);
    assert.equal(session.getState().team.includes(pokemon), false);
    assert.ok(session.getState().storage.includes(pokemon));
    assert.strictEqual(session.getState().storage[0], pokemon);
});


test("Integration: a team Pokémon can be selected by ID for deposit", () => {
    const { session, flow } = createRealContext();

    const pokemon = {
        id: 502,
        species: "CHARMANDER",
        level: 8
    };

    session.getState().team.push(pokemon);

    const result = flow.depositPokemon({
        id: 502,
        species: "CHARMANDER"
    });

    assert.equal(result.success, true);
    assert.equal(session.getState().team.length, 0);
    assert.strictEqual(session.getState().storage[0], pokemon);
});


test("Integration: withdrawing a Pokémon moves the same object back to the team", () => {
    const { session, flow } = createRealContext();

    const pokemon = {
        id: 503,
        species: "SQUIRTLE",
        level: 10
    };

    flow.storePokemon(pokemon);

    const result = flow.withdrawPokemon(503);

    assert.equal(result.success, true);
    assert.strictEqual(result.pokemon, pokemon);
    assert.strictEqual(session.getState().team[0], pokemon);
    assert.equal(session.getState().storage.length, 0);
});


test("Integration: PC storage and the party never contain duplicate entries after transfer", () => {
    const { session, flow } = createRealContext();

    const pokemon = {
        id: 504,
        species: "BULBASAUR",
        level: 7
    };

    session.getState().team.push(pokemon);

    const deposit = flow.depositPokemon(pokemon);

    assert.equal(deposit.success, true);
    assert.equal(
        session.getState().team.filter(
            item => item.id === pokemon.id
        ).length,
        0
    );

    const withdraw = flow.withdrawPokemon(pokemon.id);

    assert.equal(withdraw.success, true);
    assert.equal(
        session.getState().team.filter(
            item => item.id === pokemon.id
        ).length,
        1
    );
    assert.equal(
        session.getState().storage.filter(
            item => item.id === pokemon.id
        ).length,
        0
    );
});


// -------------------------------------
// StorageFlow validation and behavior
// -------------------------------------

test("StorageFlow rejects invalid Pokémon when storing directly", () => {
    const { flow, items } = createMockContext();

    assert.equal(flow.storePokemon(null).success, false);
    assert.equal(flow.storePokemon({ level: 5 }).success, false);
    assert.equal(items.length, 0);
});


test("StorageFlow reports unavailable storage", () => {
    const { flow } = createMockContext({
        noStorage: true
    });

    const result = flow.storePokemon({
        species: "PIKACHU",
        level: 5
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Storage unavailable");
});


test("StorageFlow stores a new overflow Pokémon directly", () => {
    const pokemon = {
        id: 505,
        species: "SNORLAX",
        level: 30
    };

    const { flow, items, members } = createMockContext();

    const result = flow.storePokemon(pokemon);

    assert.equal(result.success, true);
    assert.strictEqual(items[0], pokemon);
    assert.equal(members.length, 0);
});


test("StorageFlow rejects a deposit for a Pokémon not on the team", () => {
    const pokemon = {
        id: 506,
        species: "EEVEE",
        level: 5
    };

    const { flow, items, members } = createMockContext();

    const result = flow.depositPokemon(pokemon);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Pokemon is not on the team");
    assert.equal(items.length, 0);
    assert.equal(members.length, 0);
});


test("StorageFlow restores a Pokémon to the team if storage addition fails", () => {
    const pokemon = {
        id: 507,
        species: "GEODUDE",
        level: 8
    };

    const context = createMockContext({
        teamMembers: [pokemon],
        failStorageAddition: true
    });

    const result = context.flow.depositPokemon(pokemon);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Storage addition failed");
    assert.equal(result.restoredToTeam, true);
    assert.strictEqual(context.members[0], pokemon);
    assert.equal(context.items.length, 0);
});


test("StorageFlow rejects withdrawal of a missing Pokémon", () => {
    const { flow } = createMockContext();

    const result = flow.withdrawPokemon(999);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Pokemon not found");
});


test("StorageFlow rejects withdrawal if the team service is unavailable", () => {
    const pokemon = {
        id: 508,
        species: "PONYTA",
        level: 12
    };

    const { flow, items } = createMockContext({
        storageItems: [pokemon],
        noTeam: true
    });

    const result = flow.withdrawPokemon(508);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Team unavailable");
    assert.strictEqual(items[0], pokemon);
});


test("StorageFlow prevents a Pokémon already on the team from being withdrawn twice", () => {
    const pokemon = {
        id: 509,
        species: "GROWLITHE",
        level: 10
    };

    const context = createMockContext({
        storageItems: [pokemon],
        teamMembers: [pokemon]
    });

    const result = context.flow.withdrawPokemon(509);

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Pokemon is already on the team"
    );
    assert.equal(context.members.length, 1);
    assert.equal(context.items.length, 1);
});


test("StorageFlow preserves PC storage if adding to the team fails", () => {
    const pokemon = {
        id: 510,
        species: "ABRA",
        level: 8
    };

    const context = createMockContext({
        storageItems: [pokemon],
        failTeamAddition: true
    });

    const result = context.flow.withdrawPokemon(510);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Team addition failed");
    assert.equal(context.items.length, 1);
    assert.strictEqual(context.items[0], pokemon);
    assert.equal(context.members.length, 0);
});


test("StorageFlow rolls back a team addition if PC removal fails", () => {
    const pokemon = {
        id: 511,
        species: "MACHOP",
        level: 9
    };

    const context = createMockContext({
        storageItems: [pokemon],
        failStorageRemoval: true
    });

    const result = context.flow.withdrawPokemon(511);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Storage removal failed");

    assert.equal(context.members.length, 0);
    assert.equal(context.items.length, 1);
    assert.strictEqual(context.items[0], pokemon);
});


test("StorageFlow exposes storage and count through its status", () => {
    const first = {
        id: 512,
        species: "ODDISH",
        level: 6
    };

    const second = {
        id: 513,
        species: "PSYDUCK",
        level: 11
    };

    const { flow, items } = createMockContext({
        storageItems: [first, second]
    });

    assert.strictEqual(flow.getStorage(), items);

    const status = flow.getStatus();

    assert.equal(status.count, 2);
    assert.strictEqual(status.storage, items);
});
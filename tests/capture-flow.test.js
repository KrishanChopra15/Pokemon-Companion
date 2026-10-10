"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const CaptureFlow = require("../scripts/capture/capture-flow");


function createContext(options = {}) {
    const items = {
        ...(options.items || {})
    };

    const captureHistory = [];
    const trackedPokemon = [];
    const teamMembers = [];
    const storedPokemon = [];
    const usedItems = [];
    const removedPokemon = [];
    const friendshipCalls = [];
    const actions = [];

    if (options.teamFull) {
        for (let index = 0; index < 6; index++) {
            teamMembers.push({
                id: index + 1,
                species: `TEAM_POKEMON_${index + 1}`,
                level: 5
            });
        }
    }

    const inventory = {
        hasItem(item) {
            return Boolean(items[item]);
        },

        useItem(item) {
            if (!items[item]) {
                return {
                    success: false,
                    reason: "Item not found"
                };
            }

            items[item]--;
            usedItems.push(item);

            return {
                success: true,
                item,
                quantity: items[item]
            };
        }
    };

    const captures = {
        addCapture(pokemon) {
            captureHistory.push(pokemon);

            return {
                success: true,
                capture: pokemon
            };
        },

        getCaptures() {
            return captureHistory;
        }
    };

    const tracker = {
        addPokemon(pokemon) {
            pokemon.trackerId = trackedPokemon.length + 1;

            if (pokemon.id === undefined) {
                pokemon.id = null;
            }

            trackedPokemon.push(pokemon);

            return {
                success: true,
                pokemon
            };
        },

        removePokemon(id) {
            removedPokemon.push(id);

            return {
                success: true,
                id
            };
        }
    };

    const team = {
        addToTeam(pokemon) {
            if (options.failTeamAddition || teamMembers.length >= 6) {
                return {
                    success: false,
                    reason: "Team Full"
                };
            }

            teamMembers.push(pokemon);

            return {
                success: true,
                pokemon
            };
        }
    };

    const storage = {
        storePokemon(pokemon) {
            if (storedPokemon.includes(pokemon)) {
                return {
                    success: false,
                    reason: "Pokémon already stored"
                };
            }

            storedPokemon.push(pokemon);

            return {
                success: true,
                pokemon
            };
        }
    };

    const actionFlow = {
        capturePokemon(species, level, location) {
            const action = {
                type: "CAPTURE",
                species,
                level,
                location
            };

            actions.push(action);

            return {
                success: true,
                action
            };
        }
    };

    const pokemonDatabase = {
        getBaseFriendship(species) {
            const values = options.friendshipBySpecies || {};

            return Object.prototype.hasOwnProperty.call(
                values,
                species
            )
                ? values[species]
                : 70;
        }
    };

    const friendshipService = {
        initialize(pokemon, baseFriendship) {
            friendshipCalls.push({
                pokemon,
                baseFriendship
            });

            pokemon.friendship = baseFriendship;

            return {
                success: true
            };
        }
    };

    const captureFlow = new CaptureFlow(
        null,
        captures,
        team,
        storage,
        inventory,
        tracker,
        actionFlow,
        pokemonDatabase,
        friendshipService
    );

    return {
        captureFlow,
        items,
        inventory,
        captureHistory,
        trackedPokemon,
        teamMembers,
        storedPokemon,
        usedItems,
        removedPokemon,
        friendshipCalls,
        actions
    };
}


test("CaptureFlow rejects invalid Pokémon", () => {
    const context = createContext({
        items: {
            ITEM_POKE_BALL: 2
        }
    });

    const result = context.captureFlow.confirmCapture(null);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid Pokemon");
    assert.equal(context.items.ITEM_POKE_BALL, 2);
    assert.equal(context.captureHistory.length, 0);
    assert.equal(context.trackedPokemon.length, 0);
});


test("CaptureFlow rejects Pokémon without a species", () => {
    const context = createContext({
        items: {
            ITEM_POKE_BALL: 2
        }
    });

    const result = context.captureFlow.confirmCapture({
        level: 5
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid Pokemon");
    assert.equal(context.items.ITEM_POKE_BALL, 2);
});


test("CaptureFlow rejects a capture when no ball is available", () => {
    const context = createContext();

    const result = context.captureFlow.confirmCapture({
        species: "PIKACHU",
        level: 5,
        location: "ROUTE_2"
    });

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "No ITEM_POKE_BALL available"
    );

    assert.equal(context.captureHistory.length, 0);
    assert.equal(context.trackedPokemon.length, 0);
    assert.equal(context.teamMembers.length, 0);
    assert.equal(context.actions.length, 0);
});


test("CaptureFlow normalizes common capture ball names", () => {
    const { captureFlow } = createContext();

    const cases = [
        [null, "ITEM_POKE_BALL"],
        ["pokeball", "ITEM_POKE_BALL"],
        ["POKE_BALL", "ITEM_POKE_BALL"],
        ["greatball", "ITEM_GREAT_BALL"],
        ["GREAT_BALL", "ITEM_GREAT_BALL"],
        ["ultraball", "ITEM_ULTRA_BALL"],
        ["MASTER_BALL", "ITEM_MASTER_BALL"],
        ["safariball", "ITEM_SAFARI_BALL"],
        ["ITEM_NET_BALL", "ITEM_NET_BALL"]
    ];

    for (const [input, expected] of cases) {
        assert.equal(
            captureFlow.normalizeBall(input),
            expected
        );
    }
});


test("CaptureFlow successfully captures and registers a Pokémon", () => {
    const context = createContext({
        items: {
            ITEM_POKE_BALL: 2
        },
        friendshipBySpecies: {
            PIKACHU: 90
        }
    });

    const wildPokemon = {
        species: "PIKACHU",
        level: 7,
        location: "ROUTE_2",
        metLocation: "ROUTE_2"
    };

    const result = context.captureFlow.confirmCapture(
        wildPokemon,
        "POKE_BALL"
    );

    assert.equal(result.success, true);
    assert.equal(result.ball, "ITEM_POKE_BALL");
    assert.equal(result.friendship, 90);
    assert.equal(result.metLocation, "ROUTE_2");

    assert.equal(context.items.ITEM_POKE_BALL, 1);
    assert.deepEqual(context.usedItems, ["ITEM_POKE_BALL"]);

    assert.equal(context.captureHistory.length, 1);
    assert.equal(context.trackedPokemon.length, 1);
    assert.equal(context.teamMembers.length, 1);
    assert.equal(context.storedPokemon.length, 0);

    const capturedPokemon = result.capture;

    assert.equal(capturedPokemon.species, "PIKACHU");
    assert.equal(capturedPokemon.level, 7);
    assert.equal(capturedPokemon.friendship, 90);
    assert.equal(capturedPokemon.ball, "ITEM_POKE_BALL");
    assert.equal(capturedPokemon.metLocation, "ROUTE_2");
    assert.equal(capturedPokemon.location, "ROUTE_2");

    assert.strictEqual(
        context.captureHistory[0],
        capturedPokemon
    );
    assert.strictEqual(
        context.trackedPokemon[0],
        capturedPokemon
    );
    assert.strictEqual(
        context.teamMembers[0],
        capturedPokemon
    );

    assert.equal(result.tracked, true);
    assert.equal(result.team, true);
    assert.equal(result.stored, false);
    assert.ok(result.action);
});


test("CaptureFlow uses the supplied capture ball and preserves location", () => {
    const context = createContext({
        items: {
            ITEM_GREAT_BALL: 1
        }
    });

    const result = context.captureFlow.confirmCapture(
        {
            species: "ODDISH",
            level: 12,
            location: "ROUTE_24"
        },
        "greatball"
    );

    assert.equal(result.success, true);
    assert.equal(result.ball, "ITEM_GREAT_BALL");
    assert.equal(result.metLocation, "ROUTE_24");
    assert.equal(context.items.ITEM_GREAT_BALL, 0);
    assert.deepEqual(context.usedItems, ["ITEM_GREAT_BALL"]);
});


test("CaptureFlow falls back to location for metLocation", () => {
    const context = createContext({
        items: {
            ITEM_POKE_BALL: 1
        }
    });

    const result = context.captureFlow.confirmCapture({
        species: "GEODUDE",
        level: 9,
        location: "MT_MOON"
    });

    assert.equal(result.success, true);
    assert.equal(result.metLocation, "MT_MOON");
    assert.equal(result.capture.location, "MT_MOON");
});


test("CaptureFlow falls back to default friendship when unavailable", () => {
    const context = createContext({
        items: {
            ITEM_POKE_BALL: 1
        }
    });

    const result = context.captureFlow.confirmCapture({
        species: "ZUBAT",
        level: 4
    });

    assert.equal(result.success, true);
    assert.equal(result.friendship, 70);
    assert.equal(result.capture.friendship, 70);
    assert.equal(result.metLocation, null);
});


test("CaptureFlow sends overflow Pokémon to PC storage", () => {
    const context = createContext({
        items: {
            ITEM_POKE_BALL: 1
        },
        teamFull: true
    });

    const result = context.captureFlow.confirmCapture({
        species: "SNORLAX",
        level: 30,
        location: "ROUTE_12"
    });

    assert.equal(result.success, true);
    assert.equal(result.tracked, true);
    assert.equal(result.team, false);
    assert.equal(result.stored, true);

    assert.equal(context.trackedPokemon.length, 1);
    assert.equal(context.teamMembers.length, 6);
    assert.equal(context.storedPokemon.length, 1);

    assert.strictEqual(
        context.trackedPokemon[0],
        result.capture
    );

    assert.strictEqual(
        context.storedPokemon[0],
        result.capture
    );

    assert.equal(context.items.ITEM_POKE_BALL, 0);
});


test("CaptureFlow records capture actions", () => {
    const context = createContext({
        items: {
            ITEM_POKE_BALL: 1
        }
    });

    const result = context.captureFlow.confirmCapture({
        species: "MAGIKARP",
        level: 5,
        location: "ROUTE_4"
    });

    assert.equal(result.success, true);
    assert.equal(context.actions.length, 1);

    assert.deepEqual(context.actions[0], {
        type: "CAPTURE",
        species: "MAGIKARP",
        level: 5,
        location: "ROUTE_4"
    });

    assert.deepEqual(result.action, context.actions[0]);
});


test("CaptureFlow exposes the captured Pokémon list", () => {
    const context = createContext({
        items: {
            ITEM_POKE_BALL: 2
        }
    });

    context.captureFlow.confirmCapture({
        species: "PIDGEY",
        level: 3
    });

    context.captureFlow.confirmCapture({
        species: "RATTATA",
        level: 4
    });

    const captures = context.captureFlow.getCapturedPokemon();

    assert.equal(captures.length, 2);
    assert.equal(captures[0].species, "PIDGEY");
    assert.equal(captures[1].species, "RATTATA");
    assert.strictEqual(captures, context.captureHistory);
});


test("CaptureFlow delegates capture removal to the tracker", () => {
    const context = createContext();

    const result = context.captureFlow.removeCapture(42);

    assert.equal(result.success, true);
    assert.deepEqual(context.removedPokemon, [42]);
});
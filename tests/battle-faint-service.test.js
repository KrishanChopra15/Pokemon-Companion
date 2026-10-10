"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattleFaintService = require(
    "../scripts/services/battle-faint-service.js"
);

// --------------------------------
// Test helpers
// --------------------------------

function createPokemon(name = "Bulbasaur", hp = 20, overrides = {}) {
    return {
        name,
        species: name.toUpperCase(),
        level: 5,
        hp,
        friendship: 70,
        ...overrides
    };
}

function createSide(name, pokemon, party = [pokemon]) {
    return {
        name,
        party,
        active: 0
    };
}

function createResult() {
    return {
        actions: []
    };
}

function createPokemonService() {
    return {
        getActivePokemon(side) {
            if (!side || !Array.isArray(side.party)) {
                return null;
            }

            return side.party[side.active ?? 0] || null;
        }
    };
}

function createService({
    pokemon = createPokemonService(),
    switches = null,
    friendship = null
} = {}) {
    return new BattleFaintService(
        pokemon,
        switches,
        friendship
    );
}

// --------------------------------
// Constructor
// --------------------------------

test("BattleFaintService stores its dependencies", () => {
    const pokemon = {};
    const switches = {};
    const friendship = {};

    const service = createService({
        pokemon,
        switches,
        friendship
    });

    assert.equal(service.pokemon, pokemon);
    assert.equal(service.switches, switches);
    assert.equal(service.friendship, friendship);
});

test("BattleFaintService supports an omitted friendship service", () => {
    const service = new BattleFaintService(
        createPokemonService(),
        null
    );

    assert.equal(service.friendship, null);
});

// --------------------------------
// handleFaint: detection
// --------------------------------

test("BattleFaintService returns false when the active Pokémon is missing", () => {
    const service = createService();

    const side = {
        name: "PLAYER",
        party: [],
        active: 0
    };

    assert.equal(
        service.handleFaint(side, createResult()),
        false
    );
});

test("BattleFaintService returns false when the active Pokémon is alive", () => {
    const service = createService();
    const pokemon = createPokemon("Bulbasaur", 1);
    const result = createResult();

    const side = createSide("PLAYER", pokemon);

    assert.equal(service.handleFaint(side, result), false);
    assert.deepEqual(result.actions, []);
});

test("BattleFaintService detects a Pokémon with zero HP as fainted", () => {
    const service = createService();
    const pokemon = createPokemon("Bulbasaur", 0);
    const result = createResult();
    const side = createSide("PLAYER", pokemon);

    service.handleFaint(side, result);

    assert.equal(
        result.actions.some(action => action.type === "FAINT"),
        true
    );
});

test("BattleFaintService detects a Pokémon with negative HP as fainted", () => {
    const service = createService();
    const pokemon = createPokemon("Bulbasaur", -2);
    const result = createResult();
    const side = createSide("PLAYER", pokemon);

    service.handleFaint(side, result);

    assert.equal(
        result.actions.some(action => action.type === "FAINT"),
        true
    );
});

// --------------------------------
// handleFaint: faint events
// --------------------------------

test("BattleFaintService records the fainted Pokémon species", () => {
    const service = createService();
    const pokemon = createPokemon("Bulbasaur", 0);
    const result = createResult();
    const side = createSide("PLAYER", pokemon);

    service.handleFaint(side, result);

    assert.deepEqual(result.actions[0], {
        type: "FAINT",
        pokemon: "BULBASAUR"
    });
});

test("BattleFaintService records a faint event for an opponent Pokémon", () => {
    const service = createService();
    const pokemon = createPokemon("Charmander", 0);
    const result = createResult();
    const side = createSide("OPPONENT", pokemon);

    service.handleFaint(side, result);

    assert.deepEqual(result.actions[0], {
        type: "FAINT",
        pokemon: "CHARMANDER"
    });
});

test("BattleFaintService does not duplicate an existing faint event for the same species", () => {
    const service = createService();
    const pokemon = createPokemon("Bulbasaur", 0);
    const result = {
        actions: [
            {
                type: "FAINT",
                pokemon: "BULBASAUR"
            }
        ]
    };

    const side = createSide("PLAYER", pokemon);

    service.handleFaint(side, result);

    assert.equal(
        result.actions.filter(action => action.type === "FAINT").length,
        1
    );
});

test("BattleFaintService does not treat an unrelated action as an existing faint event", () => {
    const service = createService();
    const pokemon = createPokemon("Bulbasaur", 0);
    const result = {
        actions: [
            {
                type: "DAMAGE",
                pokemon: "BULBASAUR"
            }
        ]
    };

    const side = createSide("PLAYER", pokemon);

    service.handleFaint(side, result);

    assert.equal(
        result.actions.filter(action => action.type === "FAINT").length,
        1
    );
});

// --------------------------------
// Player-side identification
// --------------------------------

test("BattleFaintService identifies the player by side name", () => {
    const service = createService();

    assert.equal(
        service.isPlayerSide({ name: "PLAYER" }),
        true
    );
});

test("BattleFaintService identifies the player by case-insensitive name", () => {
    const service = createService();

    assert.equal(
        service.isPlayerSide({ name: "player" }),
        true
    );
});

test("BattleFaintService identifies the player by side ID", () => {
    const service = createService();

    assert.equal(
        service.isPlayerSide({ id: "PLAYER" }),
        true
    );
});

test("BattleFaintService identifies the player by side type", () => {
    const service = createService();

    assert.equal(
        service.isPlayerSide({ type: "PLAYER" }),
        true
    );
});

test("BattleFaintService identifies a side with the player flag", () => {
    const service = createService();

    assert.equal(
        service.isPlayerSide({ player: true }),
        true
    );
});

test("BattleFaintService rejects an opponent side", () => {
    const service = createService();

    assert.equal(
        service.isPlayerSide({
            name: "OPPONENT",
            id: "OPPONENT",
            type: "OPPONENT",
            player: false
        }),
        false
    );
});

test("BattleFaintService rejects a missing side", () => {
    const service = createService();

    assert.equal(service.isPlayerSide(null), false);
    assert.equal(service.isPlayerSide(undefined), false);
});

// --------------------------------
// Opponent level resolution
// --------------------------------

test("BattleFaintService returns null for a missing side", () => {
    const service = createService();

    assert.equal(service.getOpponentLevel(null), null);
});

test("BattleFaintService reads the level from opponentPokemon", () => {
    const service = createService();

    assert.equal(
        service.getOpponentLevel({
            opponentPokemon: {
                level: 12
            }
        }),
        12
    );
});

test("BattleFaintService converts a numeric opponent level string", () => {
    const service = createService();

    assert.equal(
        service.getOpponentLevel({
            opponentPokemon: {
                level: "18"
            }
        }),
        18
    );
});

test("BattleFaintService falls back to the opponent active Pokémon", () => {
    const service = createService();

    assert.equal(
        service.getOpponentLevel({
            opponent: {
                activePokemon: {
                    level: 14
                }
            }
        }),
        14
    );
});

test("BattleFaintService reads the active opponent from its party", () => {
    const service = createService();

    assert.equal(
        service.getOpponentLevel({
            opponent: {
                party: [
                    { level: 8 },
                    { level: 16 }
                ],
                active: 1
            }
        }),
        16
    );
});

test("BattleFaintService reads the active opponent from opponentParty", () => {
    const service = createService();

    assert.equal(
        service.getOpponentLevel({
            opponentParty: [
                { level: 9 },
                { level: 17 }
            ],
            opponentActive: 1
        }),
        17
    );
});

test("BattleFaintService returns null when no valid opponent level is available", () => {
    const service = createService();

    assert.equal(
        service.getOpponentLevel({
            opponentPokemon: {
                level: "invalid"
            }
        }),
        null
    );
});

// --------------------------------
// Friendship synchronization
// --------------------------------

test("BattleFaintService rejects synchronization without a Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.syncFriendshipState(null),
        {
            success: false,
            synchronized: false,
            reason: "Missing Pokemon"
        }
    );
});

test("BattleFaintService reports when the source Pokémon is unavailable", () => {
    const service = createService();
    const pokemon = createPokemon("Bulbasaur", 0, {
        friendship: 55
    });

    const result = service.syncFriendshipState(pokemon);

    assert.equal(result.success, true);
    assert.equal(result.synchronized, false);
    assert.equal(result.reason, "Source Pokemon unavailable");
    assert.strictEqual(result.pokemon, pokemon);
});

test("BattleFaintService copies runtime friendship to the source Pokémon", () => {
    const service = createService();

    const sourcePokemon = {
        species: "BULBASAUR",
        friendship: 70
    };

    const runtimePokemon = createPokemon("Bulbasaur", 0, {
        friendship: 45,
        sourcePokemon
    });

    const result = service.syncFriendshipState(runtimePokemon);

    assert.equal(sourcePokemon.friendship, 45);
    assert.equal(result.success, true);
    assert.equal(result.synchronized, true);
    assert.equal(result.friendship, 45);
    assert.strictEqual(result.pokemon, sourcePokemon);
});

test("BattleFaintService preserves the source Pokémon object identity", () => {
    const service = createService();

    const sourcePokemon = {
        species: "BULBASAUR",
        friendship: 70
    };

    const runtimePokemon = createPokemon("Bulbasaur", 0, {
        friendship: 50,
        sourcePokemon
    });

    const result = service.syncFriendshipState(runtimePokemon);

    assert.strictEqual(result.pokemon, sourcePokemon);
    assert.strictEqual(runtimePokemon.sourcePokemon, sourcePokemon);
});

// --------------------------------
// Friendship on player faint
// --------------------------------

test("BattleFaintService applies friendship loss for a fainted player Pokémon", () => {
    const sourcePokemon = {
        species: "BULBASAUR",
        friendship: 70
    };

    const pokemon = createPokemon("Bulbasaur", 0, {
        friendship: 65,
        sourcePokemon
    });

    const result = createResult();
    const side = createSide("PLAYER", pokemon);

    side.opponentPokemon = {
        level: 8
    };

    let receivedPokemon;
    let receivedContext;

    const service = createService({
        friendship: {
            applyFainting(target, context) {
                receivedPokemon = target;
                receivedContext = context;

                target.friendship = 60;

                return {
                    friendship: 60,
                    change: -5
                };
            }
        }
    });

    service.handleFaint(side, result);

    assert.strictEqual(receivedPokemon, pokemon);
    assert.deepEqual(receivedContext, {
        pokemonLevel: 5,
        opponentLevel: 8
    });

    assert.equal(pokemon.friendship, 60);
    assert.equal(sourcePokemon.friendship, 60);

    const friendshipAction = result.actions.find(
        action => action.type === "FRIENDSHIP_CHANGE"
    );

    assert.deepEqual(friendshipAction, {
        type: "FRIENDSHIP_CHANGE",
        pokemon: "BULBASAUR",
        event: "FAINT",
        friendship: 60,
        change: -5,
        synchronization: {
            success: true,
            synchronized: true,
            friendship: 60,
            pokemon: sourcePokemon
        }
    });
});

test("BattleFaintService does not apply friendship loss for an opponent Pokémon", () => {
    const pokemon = createPokemon("Charmander", 0);
    const result = createResult();
    const side = createSide("OPPONENT", pokemon);

    let friendshipCalls = 0;

    const service = createService({
        friendship: {
            applyFainting() {
                friendshipCalls++;

                return {
                    friendship: 60,
                    change: -5
                };
            }
        }
    });

    service.handleFaint(side, result);

    assert.equal(friendshipCalls, 0);
    assert.equal(
        result.actions.some(
            action => action.type === "FRIENDSHIP_CHANGE"
        ),
        false
    );
});

test("BattleFaintService skips friendship handling when the friendship service is unavailable", () => {
    const service = createService();
    const pokemon = createPokemon("Bulbasaur", 0);
    const side = createSide("PLAYER", pokemon);
    const result = createResult();

    service.handleFaint(side, result);

    assert.equal(
        result.actions.some(
            action => action.type === "FRIENDSHIP_CHANGE"
        ),
        false
    );
});

test("BattleFaintService skips friendship handling when applyFainting is unavailable", () => {
    const service = createService({
        friendship: {}
    });

    const pokemon = createPokemon("Bulbasaur", 0);
    const side = createSide("PLAYER", pokemon);
    const result = createResult();

    service.handleFaint(side, result);

    assert.equal(
        result.actions.some(
            action => action.type === "FRIENDSHIP_CHANGE"
        ),
        false
    );
});

// --------------------------------
// Automatic switching
// --------------------------------

test("BattleFaintService switches to the replacement Pokémon when autoSwitch succeeds", () => {
    const faintedPokemon = createPokemon("Bulbasaur", 0);
    const replacementPokemon = createPokemon("Squirtle", 20);

    const side = createSide("PLAYER", faintedPokemon, [
        faintedPokemon,
        replacementPokemon
    ]);

    const result = createResult();

    let receivedSide;

    const service = createService({
        switches: {
            autoSwitch(targetSide) {
                receivedSide = targetSide;

                return {
                    success: true,
                    index: 1,
                    pokemon: replacementPokemon
                };
            }
        }
    });

    const handled = service.handleFaint(side, result);

    assert.equal(handled, true);
    assert.strictEqual(receivedSide, side);
    assert.equal(side.active, 1);

    assert.deepEqual(result.actions, [
        {
            type: "FAINT",
            pokemon: "BULBASAUR"
        },
        {
            type: "SWITCH",
            pokemon: "SQUIRTLE"
        }
    ]);
});

test("BattleFaintService returns false when automatic switching fails", () => {
    const pokemon = createPokemon("Bulbasaur", 0);
    const side = createSide("PLAYER", pokemon);
    const result = createResult();

    const service = createService({
        switches: {
            autoSwitch() {
                return {
                    success: false
                };
            }
        }
    });

    assert.equal(service.handleFaint(side, result), false);
    assert.equal(side.active, 0);
    assert.equal(
        result.actions.some(action => action.type === "FAINT"),
        true
    );
    assert.equal(
        result.actions.some(action => action.type === "SWITCH"),
        false
    );
});

test("BattleFaintService returns false when no switching service is available", () => {
    const service = createService();
    const pokemon = createPokemon("Bulbasaur", 0);
    const side = createSide("PLAYER", pokemon);
    const result = createResult();

    assert.equal(service.handleFaint(side, result), false);
    assert.equal(side.active, 0);
    assert.equal(result.actions.length, 1);
});

test("BattleFaintService does not change the active index when switching fails", () => {
    const faintedPokemon = createPokemon("Bulbasaur", 0);
    const side = createSide("PLAYER", faintedPokemon, [
        faintedPokemon,
        createPokemon("Squirtle")
    ]);

    side.active = 0;

    const service = createService({
        switches: {
            autoSwitch() {
                return null;
            }
        }
    });

    service.handleFaint(side, createResult());

    assert.equal(side.active, 0);
});

// --------------------------------
// Faint handling result
// --------------------------------

test("BattleFaintService returns false after recording a faint when no replacement is available", () => {
    const service = createService({
        switches: {
            autoSwitch() {
                return {
                    success: false,
                    reason: "No available Pokémon"
                };
            }
        }
    });

    const pokemon = createPokemon("Bulbasaur", 0);
    const side = createSide("PLAYER", pokemon);
    const result = createResult();

    const handled = service.handleFaint(side, result);

    assert.equal(handled, false);
    assert.equal(result.actions[0].type, "FAINT");
});

test("BattleFaintService does not modify a living Pokémon's HP", () => {
    const service = createService();
    const pokemon = createPokemon("Bulbasaur", 10);
    const side = createSide("PLAYER", pokemon);

    service.handleFaint(side, createResult());

    assert.equal(pokemon.hp, 10);
});

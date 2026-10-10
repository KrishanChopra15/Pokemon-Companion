"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const PokemonTrackerService = require(
    "../scripts/services/pokemon-tracker-service"
);

function createHarness(options = {}) {
    const state = {
        nextPokemonId: options.nextPokemonId ?? 1,
        pokemon: options.pokemon ?? []
    };

    const session = {
        getState() {
            return state;
        }
    };

    return {
        state,
        session,
        service: new PokemonTrackerService(session)
    };
}

function createPokemon(overrides = {}) {
    return {
        species: "BULBASAUR",
        ...overrides
    };
}

function addPokemon(harness, pokemon = createPokemon()) {
    return harness.service.addPokemon(pokemon);
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a PokemonTrackerService instance", () => {
    const harness = createHarness();

    assert.ok(harness.service instanceof PokemonTrackerService);
});

test("constructor stores the session reference", () => {
    const harness = createHarness();

    assert.strictEqual(
        harness.service.session,
        harness.session
    );
});

test("constructor does not modify session state", () => {
    const harness = createHarness({
        nextPokemonId: 10
    });

    assert.equal(harness.state.nextPokemonId, 10);
    assert.deepEqual(harness.state.pokemon, []);
});

// --------------------------------------------------
// addPokemon(): validation
// --------------------------------------------------

test("addPokemon rejects null", () => {
    const harness = createHarness();

    assert.deepEqual(
        harness.service.addPokemon(null),
        {
            success: false,
            reason: "Missing Pokemon"
        }
    );
});

test("addPokemon rejects undefined", () => {
    const harness = createHarness();

    assert.deepEqual(
        harness.service.addPokemon(undefined),
        {
            success: false,
            reason: "Missing Pokemon"
        }
    );
});

test("addPokemon rejects false", () => {
    const harness = createHarness();

    assert.deepEqual(
        harness.service.addPokemon(false),
        {
            success: false,
            reason: "Missing Pokemon"
        }
    );
});

test("addPokemon rejects an object without species", () => {
    const harness = createHarness();

    assert.deepEqual(
        harness.service.addPokemon({ name: "Bulbasaur" }),
        {
            success: false,
            reason: "Missing Pokemon species"
        }
    );
});

test("addPokemon rejects an empty species string", () => {
    const harness = createHarness();

    assert.deepEqual(
        harness.service.addPokemon({ species: "" }),
        {
            success: false,
            reason: "Missing Pokemon species"
        }
    );
});

test("addPokemon rejects a null species", () => {
    const harness = createHarness();

    assert.deepEqual(
        harness.service.addPokemon({ species: null }),
        {
            success: false,
            reason: "Missing Pokemon species"
        }
    );
});

test("addPokemon does not modify the tracker for a missing Pokémon", () => {
    const harness = createHarness({
        nextPokemonId: 5
    });

    harness.service.addPokemon(null);

    assert.equal(harness.state.nextPokemonId, 5);
    assert.deepEqual(harness.state.pokemon, []);
});

test("addPokemon does not modify the tracker for a missing species", () => {
    const harness = createHarness({
        nextPokemonId: 5
    });

    harness.service.addPokemon({ level: 10 });

    assert.equal(harness.state.nextPokemonId, 5);
    assert.deepEqual(harness.state.pokemon, []);
});

// --------------------------------------------------
// addPokemon(): defaults and normalization
// --------------------------------------------------

test("addPokemon assigns the next tracker ID", () => {
    const harness = createHarness({
        nextPokemonId: 7
    });

    const pokemon = createPokemon();
    const result = addPokemon(harness, pokemon);

    assert.equal(result.success, true);
    assert.equal(pokemon.trackerId, 7);
});

test("addPokemon increments the next tracker ID", () => {
    const harness = createHarness({
        nextPokemonId: 7
    });

    addPokemon(harness);

    assert.equal(harness.state.nextPokemonId, 8);
});

test("addPokemon assigns sequential tracker IDs", () => {
    const harness = createHarness();

    const first = addPokemon(harness, createPokemon());
    const second = addPokemon(
        harness,
        createPokemon({ species: "CHARMANDER" })
    );

    assert.equal(first.pokemon.trackerId, 1);
    assert.equal(second.pokemon.trackerId, 2);
    assert.equal(harness.state.nextPokemonId, 3);
});

test("addPokemon defaults id to null", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    addPokemon(harness, pokemon);

    assert.equal(pokemon.id, null);
});

test("addPokemon preserves an existing Pokémon ID", () => {
    const harness = createHarness();
    const pokemon = createPokemon({ id: 25 });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.id, 25);
});

test("addPokemon preserves a zero Pokémon ID", () => {
    const harness = createHarness();
    const pokemon = createPokemon({ id: 0 });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.id, 0);
});

test("addPokemon defaults nickname to null", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    addPokemon(harness, pokemon);

    assert.equal(pokemon.nickname, null);
});

test("addPokemon preserves an existing nickname", () => {
    const harness = createHarness();
    const pokemon = createPokemon({
        nickname: "Sprout"
    });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.nickname, "Sprout");
});

test("addPokemon defaults level to one", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    addPokemon(harness, pokemon);

    assert.equal(pokemon.level, 1);
});

test("addPokemon preserves an existing level", () => {
    const harness = createHarness();
    const pokemon = createPokemon({ level: 20 });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.level, 20);
});

test("addPokemon preserves a level of zero", () => {
    const harness = createHarness();
    const pokemon = createPokemon({ level: 0 });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.level, 0);
});

test("addPokemon defaults experience to zero", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    addPokemon(harness, pokemon);

    assert.equal(pokemon.exp, 0);
});

test("addPokemon preserves existing experience", () => {
    const harness = createHarness();
    const pokemon = createPokemon({ exp: 250 });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.exp, 250);
});

test("addPokemon defaults friendship to 70", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    addPokemon(harness, pokemon);

    assert.equal(pokemon.friendship, 70);
});

test("addPokemon preserves existing friendship", () => {
    const harness = createHarness();
    const pokemon = createPokemon({
        friendship: 220
    });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.friendship, 220);
});

test("addPokemon preserves zero friendship", () => {
    const harness = createHarness();
    const pokemon = createPokemon({
        friendship: 0
    });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.friendship, 0);
});

test("addPokemon uses captureBall when ball is missing", () => {
    const harness = createHarness();
    const pokemon = createPokemon({
        captureBall: "GREAT_BALL"
    });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.ball, "GREAT_BALL");
});

test("addPokemon prefers ball over captureBall", () => {
    const harness = createHarness();
    const pokemon = createPokemon({
        ball: "ULTRA_BALL",
        captureBall: "GREAT_BALL"
    });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.ball, "ULTRA_BALL");
});

test("addPokemon defaults ball to null when both aliases are missing", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    addPokemon(harness, pokemon);

    assert.equal(pokemon.ball, null);
});

test("addPokemon preserves a zero ball value", () => {
    const harness = createHarness();
    const pokemon = createPokemon({
        ball: 0,
        captureBall: "GREAT_BALL"
    });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.ball, 0);
});

test("addPokemon uses location when metLocation is missing", () => {
    const harness = createHarness();
    const pokemon = createPokemon({
        location: "PALLET_TOWN"
    });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.metLocation, "PALLET_TOWN");
});

test("addPokemon prefers metLocation over location", () => {
    const harness = createHarness();
    const pokemon = createPokemon({
        metLocation: "ROUTE_1",
        location: "PALLET_TOWN"
    });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.metLocation, "ROUTE_1");
});

test("addPokemon defaults metLocation to null", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    addPokemon(harness, pokemon);

    assert.equal(pokemon.metLocation, null);
});

test("addPokemon preserves an existing moves array", () => {
    const harness = createHarness();
    const moves = ["TACKLE", "GROWL"];
    const pokemon = createPokemon({ moves });

    addPokemon(harness, pokemon);

    assert.strictEqual(pokemon.moves, moves);
});

test("addPokemon defaults missing moves to an empty array", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    addPokemon(harness, pokemon);

    assert.deepEqual(pokemon.moves, []);
});

test("addPokemon replaces non-array moves with an empty array", () => {
    const harness = createHarness();
    const pokemon = createPokemon({
        moves: "TACKLE"
    });

    addPokemon(harness, pokemon);

    assert.deepEqual(pokemon.moves, []);
});

test("addPokemon replaces null moves with an empty array", () => {
    const harness = createHarness();
    const pokemon = createPokemon({ moves: null });

    addPokemon(harness, pokemon);

    assert.deepEqual(pokemon.moves, []);
});

test("addPokemon defaults seen to true", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    addPokemon(harness, pokemon);

    assert.equal(pokemon.seen, true);
});

test("addPokemon preserves seen false", () => {
    const harness = createHarness();
    const pokemon = createPokemon({ seen: false });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.seen, false);
});

test("addPokemon defaults caught to true", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    addPokemon(harness, pokemon);

    assert.equal(pokemon.caught, true);
});

test("addPokemon preserves caught false", () => {
    const harness = createHarness();
    const pokemon = createPokemon({ caught: false });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.caught, false);
});

test("addPokemon defaults favorite to false", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    addPokemon(harness, pokemon);

    assert.equal(pokemon.favorite, false);
});

test("addPokemon preserves favorite true", () => {
    const harness = createHarness();
    const pokemon = createPokemon({ favorite: true });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.favorite, true);
});

// --------------------------------------------------
// addPokemon(): state and identity
// --------------------------------------------------

test("addPokemon returns success and the Pokémon", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    assert.deepEqual(
        addPokemon(harness, pokemon),
        {
            success: true,
            pokemon
        }
    );
});

test("addPokemon stores the same Pokémon object in session state", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    addPokemon(harness, pokemon);

    assert.strictEqual(harness.state.pokemon[0], pokemon);
});

test("addPokemon mutates and stores the original object", () => {
    const harness = createHarness();
    const pokemon = createPokemon();

    const result = addPokemon(harness, pokemon);

    assert.strictEqual(result.pokemon, pokemon);
    assert.strictEqual(harness.state.pokemon[0], pokemon);
});

test("addPokemon appends rather than replaces existing Pokémon", () => {
    const existing = createPokemon({
        species: "CHARMANDER",
        trackerId: 20
    });

    const harness = createHarness({
        pokemon: [existing]
    });

    const newPokemon = createPokemon();

    addPokemon(harness, newPokemon);

    assert.equal(harness.state.pokemon.length, 2);
    assert.strictEqual(harness.state.pokemon[0], existing);
    assert.strictEqual(harness.state.pokemon[1], newPokemon);
});

test("addPokemon preserves species exactly as supplied", () => {
    const harness = createHarness();
    const pokemon = createPokemon({
        species: "bulbasaur"
    });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.species, "bulbasaur");
});

test("addPokemon preserves unrelated Pokémon properties", () => {
    const harness = createHarness();
    const pokemon = createPokemon({
        ability: "OVERGROW",
        customData: { bond: 10 }
    });

    addPokemon(harness, pokemon);

    assert.equal(pokemon.ability, "OVERGROW");
    assert.deepEqual(pokemon.customData, { bond: 10 });
});

// --------------------------------------------------
// getAll()
// --------------------------------------------------

test("getAll returns an empty array for an empty tracker", () => {
    const harness = createHarness();

    assert.deepEqual(harness.service.getAll(), []);
});

test("getAll returns the session Pokémon array", () => {
    const existing = createPokemon();
    const harness = createHarness({
        pokemon: [existing]
    });

    assert.strictEqual(
        harness.service.getAll(),
        harness.state.pokemon
    );
});

test("getAll returns the same array on repeated calls", () => {
    const harness = createHarness();

    assert.strictEqual(
        harness.service.getAll(),
        harness.service.getAll()
    );
});

test("getAll reflects Pokémon added later", () => {
    const harness = createHarness();

    harness.service.getAll();

    addPokemon(harness);

    assert.equal(harness.service.getAll().length, 1);
});

// --------------------------------------------------
// findPokemon()
// --------------------------------------------------

test("findPokemon returns an empty array when species is missing", () => {
    const harness = createHarness();

    assert.deepEqual(harness.service.findPokemon(null), []);
});

test("findPokemon returns an empty array for an empty species", () => {
    const harness = createHarness();

    assert.deepEqual(harness.service.findPokemon(""), []);
});

test("findPokemon finds an exact species match", () => {
    const pokemon = createPokemon();
    const harness = createHarness({ pokemon: [pokemon] });

    assert.deepEqual(
        harness.service.findPokemon("BULBASAUR"),
        [pokemon]
    );
});

test("findPokemon normalizes lowercase search input", () => {
    const pokemon = createPokemon();
    const harness = createHarness({ pokemon: [pokemon] });

    assert.deepEqual(
        harness.service.findPokemon("bulbasaur"),
        [pokemon]
    );
});

test("findPokemon normalizes mixed-case search input", () => {
    const pokemon = createPokemon();
    const harness = createHarness({ pokemon: [pokemon] });

    assert.deepEqual(
        harness.service.findPokemon("BulBaSauR"),
        [pokemon]
    );
});

test("findPokemon returns every matching tracked Pokémon", () => {
    const first = createPokemon({ trackerId: 1 });
    const second = createPokemon({ trackerId: 2 });

    const harness = createHarness({
        pokemon: [first, second]
    });

    assert.deepEqual(
        harness.service.findPokemon("BULBASAUR"),
        [first, second]
    );
});

test("findPokemon returns an empty array when no species matches", () => {
    const harness = createHarness({
        pokemon: [createPokemon()]
    });

    assert.deepEqual(
        harness.service.findPokemon("CHARMANDER"),
        []
    );
});

test("findPokemon uses exact matching for stored species", () => {
    const pokemon = createPokemon({
        species: "bulbasaur"
    });

    const harness = createHarness({ pokemon: [pokemon] });

    assert.deepEqual(
        harness.service.findPokemon("bulbasaur"),
        []
    );
});

test("findPokemon stringifies a numeric search input", () => {
    const pokemon = createPokemon({ species: "25" });
    const harness = createHarness({ pokemon: [pokemon] });

    assert.deepEqual(
        harness.service.findPokemon(25),
        [pokemon]
    );
});

test("findPokemon does not modify tracked Pokémon", () => {
    const pokemon = createPokemon({ seen: false });
    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.findPokemon("BULBASAUR");

    assert.equal(pokemon.seen, false);
});

// --------------------------------------------------
// getPokemon()
// --------------------------------------------------

test("getPokemon finds Pokémon by tracker ID", () => {
    const pokemon = createPokemon({ trackerId: 10 });
    const harness = createHarness({ pokemon: [pokemon] });

    assert.strictEqual(harness.service.getPokemon(10), pokemon);
});

test("getPokemon finds Pokémon by original Pokémon ID", () => {
    const pokemon = createPokemon({
        id: 25,
        trackerId: 10
    });

    const harness = createHarness({ pokemon: [pokemon] });

    assert.strictEqual(harness.service.getPokemon(25), pokemon);
});

test("getPokemon prioritizes tracker ID over Pokémon ID", () => {
    const first = createPokemon({
        id: 50,
        trackerId: 10
    });

    const second = createPokemon({
        id: 10,
        trackerId: 20
    });

    const harness = createHarness({
        pokemon: [first, second]
    });

    assert.strictEqual(harness.service.getPokemon(10), first);
});

test("getPokemon returns null for an unknown ID", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({
                id: 25,
                trackerId: 1
            })
        ]
    });

    assert.equal(harness.service.getPokemon(999), null);
});

test("getPokemon returns null for an empty tracker", () => {
    const harness = createHarness();

    assert.equal(harness.service.getPokemon(1), null);
});

test("getPokemon uses strict ID matching", () => {
    const pokemon = createPokemon({
        trackerId: 10,
        id: 25
    });

    const harness = createHarness({ pokemon: [pokemon] });

    assert.equal(harness.service.getPokemon("10"), null);
    assert.equal(harness.service.getPokemon("25"), null);
});

test("getPokemon finds an ID of zero", () => {
    const pokemon = createPokemon({
        id: 0,
        trackerId: 10
    });

    const harness = createHarness({ pokemon: [pokemon] });

    assert.strictEqual(harness.service.getPokemon(0), pokemon);
});

test("getPokemon returns the same Pokémon object", () => {
    const pokemon = createPokemon({ trackerId: 3 });
    const harness = createHarness({ pokemon: [pokemon] });

    assert.strictEqual(harness.service.getPokemon(3), pokemon);
});

// --------------------------------------------------
// removePokemon()
// --------------------------------------------------

test("removePokemon reports when the Pokémon is not found", () => {
    const harness = createHarness();

    assert.deepEqual(
        harness.service.removePokemon(99),
        {
            success: false,
            reason: "Pokemon not found"
        }
    );
});

test("removePokemon removes a Pokémon by tracker ID", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    assert.equal(
        harness.service.removePokemon(1).success,
        true
    );

    assert.deepEqual(harness.state.pokemon, []);
});

test("removePokemon returns the removed Pokémon", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    const result = harness.service.removePokemon(1);

    assert.strictEqual(result.pokemon, pokemon);
});

test("removePokemon removes a Pokémon by original Pokémon ID", () => {
    const pokemon = createPokemon({
        id: 25,
        trackerId: 1
    });

    const harness = createHarness({ pokemon: [pokemon] });

    assert.equal(
        harness.service.removePokemon(25).success,
        true
    );

    assert.deepEqual(harness.state.pokemon, []);
});

test("removePokemon preserves the order of remaining Pokémon", () => {
    const first = createPokemon({ trackerId: 1 });
    const second = createPokemon({
        species: "CHARMANDER",
        trackerId: 2
    });
    const third = createPokemon({
        species: "SQUIRTLE",
        trackerId: 3
    });

    const harness = createHarness({
        pokemon: [first, second, third]
    });

    harness.service.removePokemon(2);

    assert.deepEqual(
        harness.state.pokemon,
        [first, third]
    );
});

test("removePokemon removes only the matching Pokémon", () => {
    const first = createPokemon({ trackerId: 1 });
    const second = createPokemon({ trackerId: 2 });

    const harness = createHarness({
        pokemon: [first, second]
    });

    harness.service.removePokemon(1);

    assert.deepEqual(harness.state.pokemon, [second]);
});

test("removePokemon prioritizes tracker ID over Pokémon ID", () => {
    const first = createPokemon({
        id: 50,
        trackerId: 10
    });

    const second = createPokemon({
        id: 10,
        trackerId: 20
    });

    const harness = createHarness({
        pokemon: [first, second]
    });

    const result = harness.service.removePokemon(10);

    assert.strictEqual(result.pokemon, first);
    assert.deepEqual(harness.state.pokemon, [second]);
});

test("removePokemon reports failure for a second removal of the same Pokémon", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({ trackerId: 1 })
        ]
    });

    harness.service.removePokemon(1);

    assert.deepEqual(
        harness.service.removePokemon(1),
        {
            success: false,
            reason: "Pokemon not found"
        }
    );
});

test("removePokemon uses strict ID matching", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({ trackerId: 10 })
        ]
    });

    assert.deepEqual(
        harness.service.removePokemon("10"),
        {
            success: false,
            reason: "Pokemon not found"
        }
    );
});

test("removePokemon does not alter the next tracker ID", () => {
    const harness = createHarness({
        nextPokemonId: 8,
        pokemon: [
            createPokemon({ trackerId: 7 })
        ]
    });

    harness.service.removePokemon(7);

    assert.equal(harness.state.nextPokemonId, 8);
});

test("removePokemon handles an empty tracker", () => {
    const harness = createHarness();

    assert.equal(
        harness.service.removePokemon(1).success,
        false
    );

    assert.deepEqual(harness.state.pokemon, []);
});

// --------------------------------------------------
// findIndexById()
// --------------------------------------------------

test("findIndexById returns the tracker index", () => {
    const first = createPokemon({ trackerId: 1 });
    const second = createPokemon({ trackerId: 2 });

    const harness = createHarness({
        pokemon: [first, second]
    });

    assert.equal(harness.service.findIndexById(2), 1);
});

test("findIndexById falls back to the original Pokémon ID", () => {
    const pokemon = createPokemon({
        id: 25,
        trackerId: 1
    });

    const harness = createHarness({
        pokemon: [pokemon]
    });

    assert.equal(harness.service.findIndexById(25), 0);
});

test("findIndexById returns the first index when IDs match", () => {
    const first = createPokemon({
        id: 50,
        trackerId: 10
    });

    const second = createPokemon({
        id: 10,
        trackerId: 20
    });

    const harness = createHarness({
        pokemon: [first, second]
    });

    assert.equal(harness.service.findIndexById(10), 0);
});

test("findIndexById returns minus one when no ID matches", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({ trackerId: 1 })
        ]
    });

    assert.equal(harness.service.findIndexById(99), -1);
});

test("findIndexById returns minus one for an empty tracker", () => {
    const harness = createHarness();

    assert.equal(harness.service.findIndexById(1), -1);
});

test("findIndexById uses strict matching", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({ trackerId: 10 })
        ]
    });

    assert.equal(harness.service.findIndexById("10"), -1);
});

// --------------------------------------------------
// updatePokemon(): validation and basic updates
// --------------------------------------------------

test("updatePokemon reports a missing Pokémon", () => {
    const harness = createHarness();

    assert.deepEqual(
        harness.service.updatePokemon(99, {
            level: 10
        }),
        {
            success: false,
            reason: "Pokemon not found"
        }
    );
});

test("updatePokemon rejects null updates", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    assert.deepEqual(
        harness.service.updatePokemon(1, null),
        {
            success: false,
            reason: "Invalid updates"
        }
    );
});

test("updatePokemon rejects undefined updates", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    assert.deepEqual(
        harness.service.updatePokemon(1, undefined),
        {
            success: false,
            reason: "Invalid updates"
        }
    );
});

test("updatePokemon rejects false updates", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    assert.deepEqual(
        harness.service.updatePokemon(1, false),
        {
            success: false,
            reason: "Invalid updates"
        }
    );
});

test("updatePokemon rejects string updates", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    assert.deepEqual(
        harness.service.updatePokemon(1, "invalid"),
        {
            success: false,
            reason: "Invalid updates"
        }
    );
});

test("updatePokemon rejects numeric updates", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    assert.deepEqual(
        harness.service.updatePokemon(1, 123),
        {
            success: false,
            reason: "Invalid updates"
        }
    );
});

test("updatePokemon rejects function updates", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    assert.deepEqual(
        harness.service.updatePokemon(1, () => {}),
        {
            success: false,
            reason: "Invalid updates"
        }
    );
});

test("updatePokemon validates the Pokémon before validating updates", () => {
    const harness = createHarness();

    assert.deepEqual(
        harness.service.updatePokemon(999, null),
        {
            success: false,
            reason: "Pokemon not found"
        }
    );
});

test("updatePokemon accepts an empty update object", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    const result = harness.service.updatePokemon(1, {});

    assert.equal(result.success, true);
    assert.strictEqual(result.pokemon, pokemon);
});

test("updatePokemon changes the specified fields", () => {
    const pokemon = createPokemon({
        trackerId: 1,
        level: 5,
        nickname: null
    });

    const harness = createHarness({ pokemon: [pokemon] });

    const result = harness.service.updatePokemon(1, {
        level: 15,
        nickname: "Sprout"
    });

    assert.equal(result.success, true);
    assert.equal(pokemon.level, 15);
    assert.equal(pokemon.nickname, "Sprout");
});

test("updatePokemon preserves fields not included in updates", () => {
    const pokemon = createPokemon({
        trackerId: 1,
        level: 5,
        exp: 200,
        nickname: "Leaf"
    });

    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.updatePokemon(1, {
        level: 10
    });

    assert.equal(pokemon.level, 10);
    assert.equal(pokemon.exp, 200);
    assert.equal(pokemon.nickname, "Leaf");
});

test("updatePokemon returns the same Pokémon object", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    const result = harness.service.updatePokemon(1, {
        level: 20
    });

    assert.strictEqual(result.pokemon, pokemon);
});

test("updatePokemon updates the existing tracked object in place", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.updatePokemon(1, {
        level: 20
    });

    assert.strictEqual(harness.state.pokemon[0], pokemon);
    assert.equal(harness.state.pokemon[0].level, 20);
});

// --------------------------------------------------
// updatePokemon(): friendship normalization
// --------------------------------------------------

test("updatePokemon floors fractional friendship", () => {
    const pokemon = createPokemon({
        trackerId: 1,
        friendship: 70
    });

    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.updatePokemon(1, {
        friendship: 123.9
    });

    assert.equal(pokemon.friendship, 123);
});

test("updatePokemon converts numeric string friendship", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.updatePokemon(1, {
        friendship: "180"
    });

    assert.equal(pokemon.friendship, 180);
});

test("updatePokemon clamps friendship above 255", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.updatePokemon(1, {
        friendship: 300
    });

    assert.equal(pokemon.friendship, 255);
});

test("updatePokemon clamps negative friendship to zero", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.updatePokemon(1, {
        friendship: -10
    });

    assert.equal(pokemon.friendship, 0);
});

test("updatePokemon preserves zero friendship", () => {
    const pokemon = createPokemon({
        trackerId: 1,
        friendship: 100
    });

    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.updatePokemon(1, {
        friendship: 0
    });

    assert.equal(pokemon.friendship, 0);
});

test("updatePokemon clamps fractional friendship above 255", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.updatePokemon(1, {
        friendship: 255.9
    });

    assert.equal(pokemon.friendship, 255);
});

test("updatePokemon floors negative fractional friendship before clamping", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.updatePokemon(1, {
        friendship: -0.5
    });

    assert.equal(pokemon.friendship, 0);
});

test("updatePokemon leaves nonnumeric friendship unchanged after assignment", () => {
    const pokemon = createPokemon({
        trackerId: 1,
        friendship: 70
    });

    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.updatePokemon(1, {
        friendship: "invalid"
    });

    assert.equal(pokemon.friendship, "invalid");
});

test("updatePokemon leaves infinite friendship unchanged after assignment", () => {
    const pokemon = createPokemon({
        trackerId: 1,
        friendship: 70
    });

    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.updatePokemon(1, {
        friendship: Infinity
    });

    assert.equal(pokemon.friendship, Infinity);
});

test("updatePokemon does not normalize friendship if it is not included", () => {
    const pokemon = createPokemon({
        trackerId: 1,
        friendship: 300
    });

    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.updatePokemon(1, {
        level: 20
    });

    assert.equal(pokemon.friendship, 300);
});

test("updatePokemon skips friendship normalization when the update value is undefined", () => {
    const pokemon = createPokemon({
        trackerId: 1,
        friendship: 70
    });

    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.updatePokemon(1, {
        friendship: undefined
    });

    assert.equal(pokemon.friendship, undefined);
});

// --------------------------------------------------
// favoritePokemon()
// --------------------------------------------------

test("favoritePokemon marks a Pokémon as favorite", () => {
    const pokemon = createPokemon({
        trackerId: 1,
        favorite: false
    });

    const harness = createHarness({ pokemon: [pokemon] });

    const result = harness.service.favoritePokemon(1);

    assert.equal(result.success, true);
    assert.equal(pokemon.favorite, true);
});

test("favoritePokemon returns the Pokémon object", () => {
    const pokemon = createPokemon({ trackerId: 1 });
    const harness = createHarness({ pokemon: [pokemon] });

    const result = harness.service.favoritePokemon(1);

    assert.strictEqual(result.pokemon, pokemon);
});

test("favoritePokemon reports a missing Pokémon", () => {
    const harness = createHarness();

    assert.deepEqual(
        harness.service.favoritePokemon(99),
        {
            success: false,
            reason: "Pokemon not found"
        }
    );
});

test("favoritePokemon can use the original Pokémon ID", () => {
    const pokemon = createPokemon({
        id: 25,
        trackerId: 1
    });

    const harness = createHarness({ pokemon: [pokemon] });

    assert.equal(
        harness.service.favoritePokemon(25).success,
        true
    );

    assert.equal(pokemon.favorite, true);
});

test("favoritePokemon leaves other Pokémon unchanged", () => {
    const first = createPokemon({
        trackerId: 1,
        favorite: false
    });

    const second = createPokemon({
        trackerId: 2,
        species: "CHARMANDER",
        favorite: false
    });

    const harness = createHarness({
        pokemon: [first, second]
    });

    harness.service.favoritePokemon(1);

    assert.equal(first.favorite, true);
    assert.equal(second.favorite, false);
});

test("favoritePokemon is idempotent", () => {
    const pokemon = createPokemon({
        trackerId: 1,
        favorite: true
    });

    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.favoritePokemon(1);
    harness.service.favoritePokemon(1);

    assert.equal(pokemon.favorite, true);
});

// --------------------------------------------------
// markSeen()
// --------------------------------------------------

test("markSeen marks matching Pokémon as seen", () => {
    const pokemon = createPokemon({
        trackerId: 1,
        seen: false
    });

    const harness = createHarness({ pokemon: [pokemon] });

    const result = harness.service.markSeen("BULBASAUR");

    assert.deepEqual(result, {
        success: true,
        count: 1
    });

    assert.equal(pokemon.seen, true);
});

test("markSeen marks every matching Pokémon as seen", () => {
    const first = createPokemon({
        trackerId: 1,
        seen: false
    });

    const second = createPokemon({
        trackerId: 2,
        seen: false
    });

    const harness = createHarness({
        pokemon: [first, second]
    });

    const result = harness.service.markSeen("BULBASAUR");

    assert.equal(result.count, 2);
    assert.equal(first.seen, true);
    assert.equal(second.seen, true);
});

test("markSeen normalizes lowercase species input", () => {
    const pokemon = createPokemon({
        seen: false
    });

    const harness = createHarness({ pokemon: [pokemon] });

    assert.equal(
        harness.service.markSeen("bulbasaur").count,
        1
    );

    assert.equal(pokemon.seen, true);
});

test("markSeen returns zero when no species matches", () => {
    const harness = createHarness({
        pokemon: [createPokemon()]
    });

    assert.deepEqual(
        harness.service.markSeen("CHARMANDER"),
        {
            success: true,
            count: 0
        }
    );
});

test("markSeen returns zero when species is missing", () => {
    const pokemon = createPokemon({
        seen: false
    });

    const harness = createHarness({ pokemon: [pokemon] });

    assert.deepEqual(
        harness.service.markSeen(null),
        {
            success: true,
            count: 0
        }
    );

    assert.equal(pokemon.seen, false);
});

test("markSeen does not change unrelated species", () => {
    const first = createPokemon({
        seen: false
    });

    const second = createPokemon({
        species: "CHARMANDER",
        seen: false
    });

    const harness = createHarness({
        pokemon: [first, second]
    });

    harness.service.markSeen("BULBASAUR");

    assert.equal(first.seen, true);
    assert.equal(second.seen, false);
});

test("markSeen does not change caught status", () => {
    const pokemon = createPokemon({
        seen: false,
        caught: false
    });

    const harness = createHarness({ pokemon: [pokemon] });

    harness.service.markSeen("BULBASAUR");

    assert.equal(pokemon.seen, true);
    assert.equal(pokemon.caught, false);
});

test("markSeen reports the number of matches even when already seen", () => {
    const pokemon = createPokemon({
        seen: true
    });

    const harness = createHarness({ pokemon: [pokemon] });

    assert.equal(
        harness.service.markSeen("BULBASAUR").count,
        1
    );
});

// --------------------------------------------------
// getCaughtSpeciesCount()
// --------------------------------------------------

test("getCaughtSpeciesCount returns zero for an empty tracker", () => {
    const harness = createHarness();

    assert.equal(harness.service.getCaughtSpeciesCount(), 0);
});

test("getCaughtSpeciesCount counts a caught species", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({
                species: "BULBASAUR",
                caught: true
            })
        ]
    });

    assert.equal(harness.service.getCaughtSpeciesCount(), 1);
});

test("getCaughtSpeciesCount counts distinct caught species", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({
                species: "BULBASAUR",
                caught: true
            }),
            createPokemon({
                species: "CHARMANDER",
                caught: true
            })
        ]
    });

    assert.equal(harness.service.getCaughtSpeciesCount(), 2);
});

test("getCaughtSpeciesCount counts duplicate caught species only once", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({
                trackerId: 1,
                species: "BULBASAUR",
                caught: true
            }),
            createPokemon({
                trackerId: 2,
                species: "BULBASAUR",
                caught: true
            })
        ]
    });

    assert.equal(harness.service.getCaughtSpeciesCount(), 1);
});

test("getCaughtSpeciesCount ignores uncaught Pokémon", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({
                species: "BULBASAUR",
                caught: false
            }),
            createPokemon({
                species: "CHARMANDER",
                caught: true
            })
        ]
    });

    assert.equal(harness.service.getCaughtSpeciesCount(), 1);
});

test("getCaughtSpeciesCount ignores Pokémon without a species", () => {
    const harness = createHarness({
        pokemon: [
            { caught: true },
            createPokemon({
                species: "BULBASAUR",
                caught: true
            })
        ]
    });

    assert.equal(harness.service.getCaughtSpeciesCount(), 1);
});

test("getCaughtSpeciesCount ignores empty species", () => {
    const harness = createHarness({
        pokemon: [
            { species: "", caught: true },
            createPokemon({
                species: "BULBASAUR",
                caught: true
            })
        ]
    });

    assert.equal(harness.service.getCaughtSpeciesCount(), 1);
});

test("getCaughtSpeciesCount ignores null entries", () => {
    const harness = createHarness({
        pokemon: [
            null,
            createPokemon({
                species: "BULBASAUR",
                caught: true
            })
        ]
    });

    assert.equal(harness.service.getCaughtSpeciesCount(), 1);
});

test("getCaughtSpeciesCount uses exact species names", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({
                species: "BULBASAUR",
                caught: true
            }),
            createPokemon({
                species: "bulbasaur",
                caught: true
            })
        ]
    });

    assert.equal(harness.service.getCaughtSpeciesCount(), 2);
});

test("getCaughtSpeciesCount ignores caught values that are falsy", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({
                species: "BULBASAUR",
                caught: 0
            }),
            createPokemon({
                species: "CHARMANDER",
                caught: true
            })
        ]
    });

    assert.equal(harness.service.getCaughtSpeciesCount(), 1);
});

test("getCaughtSpeciesCount includes truthy caught values", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({
                species: "BULBASAUR",
                caught: 1
            })
        ]
    });

    assert.equal(harness.service.getCaughtSpeciesCount(), 1);
});

// --------------------------------------------------
// getSummary()
// --------------------------------------------------

test("getSummary returns zero counts for an empty tracker", () => {
    const harness = createHarness();

    assert.deepEqual(
        harness.service.getSummary(),
        {
            total: 0,
            caught: 0,
            favorites: 0
        }
    );
});

test("getSummary counts all tracked Pokémon", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({
                trackerId: 1,
                caught: true
            }),
            createPokemon({
                trackerId: 2,
                species: "CHARMANDER",
                caught: true
            }),
            createPokemon({
                trackerId: 3,
                species: "SQUIRTLE",
                caught: true
            })
        ]
    });

    assert.deepEqual(
        harness.service.getSummary(),
        {
            total: 3,
            caught: 3,
            favorites: 0
        }
    );
});

test("getSummary counts caught Pokémon", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({
                caught: true
            }),
            createPokemon({
                species: "CHARMANDER",
                caught: false
            }),
            createPokemon({
                species: "SQUIRTLE",
                caught: true
            })
        ]
    });

    assert.equal(harness.service.getSummary().caught, 2);
});

test("getSummary counts favorite Pokémon", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({
                favorite: true
            }),
            createPokemon({
                species: "CHARMANDER",
                favorite: false
            }),
            createPokemon({
                species: "SQUIRTLE",
                favorite: true
            })
        ]
    });

    assert.equal(harness.service.getSummary().favorites, 2);
});

test("getSummary counts favorites independently from caught status", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({
                caught: false,
                favorite: true
            }),
            createPokemon({
                species: "CHARMANDER",
                caught: true,
                favorite: false
            })
        ]
    });

    assert.deepEqual(
        harness.service.getSummary(),
        {
            total: 2,
            caught: 1,
            favorites: 1
        }
    );
});

test("getSummary returns exactly total, caught, and favorites", () => {
    const harness = createHarness({
        pokemon: [createPokemon()]
    });

    assert.deepEqual(
        Object.keys(harness.service.getSummary()).sort(),
        ["caught", "favorites", "total"]
    );
});

test("getSummary uses truthy caught and favorite values", () => {
    const harness = createHarness({
        pokemon: [
            createPokemon({
                caught: 1,
                favorite: "yes"
            }),
            createPokemon({
                species: "CHARMANDER",
                caught: 0,
                favorite: ""
            })
        ]
    });

    assert.deepEqual(
        harness.service.getSummary(),
        {
            total: 2,
            caught: 1,
            favorites: 1
        }
    );
});

test("getSummary reflects changes to the tracked collection", () => {
    const harness = createHarness();

    addPokemon(harness);

    assert.deepEqual(
        harness.service.getSummary(),
        {
            total: 1,
            caught: 1,
            favorites: 0
        }
    );

    harness.service.favoritePokemon(1);

    assert.deepEqual(
        harness.service.getSummary(),
        {
            total: 1,
            caught: 1,
            favorites: 1
        }
    );

    harness.service.removePokemon(1);

    assert.deepEqual(
        harness.service.getSummary(),
        {
            total: 0,
            caught: 0,
            favorites: 0
        }
    );
});
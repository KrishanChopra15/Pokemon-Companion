"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const BattlePokemonService = require(
    "../scripts/services/battle-pokemon-service.js"
);

// --------------------------------
// Test helpers
// --------------------------------

function createPokemon(name = "Bulbasaur", hp = 20) {
    return {
        name,
        species: name.toUpperCase(),
        hp
    };
}

function createService() {
    return new BattlePokemonService();
}

// --------------------------------
// Active Pokémon lookup
// --------------------------------

test("BattlePokemonService returns null for a missing side", () => {
    const service = createService();

    assert.equal(service.getActivePokemon(null), null);
});

test("BattlePokemonService returns null when the side has no party array", () => {
    const service = createService();

    assert.equal(
        service.getActivePokemon({
            active: 0
        }),
        null
    );
});

test("BattlePokemonService returns null when the party is not an array", () => {
    const service = createService();

    assert.equal(
        service.getActivePokemon({
            party: "Bulbasaur",
            active: 0
        }),
        null
    );
});

test("BattlePokemonService returns the first Pokémon when active is zero", () => {
    const service = createService();
    const first = createPokemon("Bulbasaur");
    const second = createPokemon("Squirtle");

    const result = service.getActivePokemon({
        party: [first, second],
        active: 0
    });

    assert.strictEqual(result, first);
});

test("BattlePokemonService defaults a missing active index to zero", () => {
    const service = createService();
    const first = createPokemon("Bulbasaur");

    const result = service.getActivePokemon({
        party: [first]
    });

    assert.strictEqual(result, first);
});

test("BattlePokemonService defaults a null active index to zero", () => {
    const service = createService();
    const first = createPokemon("Bulbasaur");

    const result = service.getActivePokemon({
        party: [first],
        active: null
    });

    assert.strictEqual(result, first);
});

test("BattlePokemonService retrieves the Pokémon at the selected index", () => {
    const service = createService();
    const second = createPokemon("Squirtle");

    const result = service.getActivePokemon({
        party: [
            createPokemon("Bulbasaur"),
            second,
            createPokemon("Charmander")
        ],
        active: 1
    });

    assert.strictEqual(result, second);
});

test("BattlePokemonService returns null for an empty party", () => {
    const service = createService();

    assert.equal(
        service.getActivePokemon({
            party: [],
            active: 0
        }),
        null
    );
});

test("BattlePokemonService returns null for an out-of-range active index", () => {
    const service = createService();

    assert.equal(
        service.getActivePokemon({
            party: [createPokemon()],
            active: 3
        }),
        null
    );
});

test("BattlePokemonService returns null for a negative active index", () => {
    const service = createService();

    assert.equal(
        service.getActivePokemon({
            party: [createPokemon()],
            active: -1
        }),
        null
    );
});

test("BattlePokemonService returns null when the selected party slot is empty", () => {
    const service = createService();

    assert.equal(
        service.getActivePokemon({
            party: [
                createPokemon("Bulbasaur"),
                null
            ],
            active: 1
        }),
        null
    );
});

test("BattlePokemonService returns the original Pokémon without cloning it", () => {
    const service = createService();
    const pokemon = createPokemon();

    const result = service.getActivePokemon({
        party: [pokemon],
        active: 0
    });

    assert.strictEqual(result, pokemon);
});

// --------------------------------
// Faint checks
// --------------------------------

test("BattlePokemonService treats a missing Pokémon as fainted", () => {
    const service = createService();

    assert.equal(service.isFainted(null), true);
});

test("BattlePokemonService treats zero HP as fainted", () => {
    const service = createService();

    assert.equal(
        service.isFainted(createPokemon("Bulbasaur", 0)),
        true
    );
});

test("BattlePokemonService treats negative HP as fainted", () => {
    const service = createService();

    assert.equal(
        service.isFainted(createPokemon("Bulbasaur", -5)),
        true
    );
});

test("BattlePokemonService does not treat positive HP as fainted", () => {
    const service = createService();

    assert.equal(
        service.isFainted(createPokemon("Bulbasaur", 1)),
        false
    );

    assert.equal(
        service.isFainted(createPokemon("Bulbasaur", 20)),
        false
    );
});

// --------------------------------
// Alive checks
// --------------------------------

test("BattlePokemonService treats a missing Pokémon as not alive", () => {
    const service = createService();

    assert.equal(service.isAlive(null), false);
});

test("BattlePokemonService treats positive HP as alive", () => {
    const service = createService();

    assert.equal(
        service.isAlive(createPokemon("Bulbasaur", 20)),
        true
    );
});

test("BattlePokemonService treats zero HP as not alive", () => {
    const service = createService();

    assert.equal(
        service.isAlive(createPokemon("Bulbasaur", 0)),
        false
    );
});

test("BattlePokemonService treats negative HP as not alive", () => {
    const service = createService();

    assert.equal(
        service.isAlive(createPokemon("Bulbasaur", -1)),
        false
    );
});

test("BattlePokemonService treats a Pokémon without HP as not alive", () => {
    const service = createService();

    assert.equal(
        service.isAlive({
            name: "Bulbasaur"
        }),
        false
    );
});

// --------------------------------
// Count living Pokémon
// --------------------------------

test("BattlePokemonService returns zero for a missing party", () => {
    const service = createService();

    assert.equal(service.getAliveCount(null), 0);
});

test("BattlePokemonService returns zero when the party is not an array", () => {
    const service = createService();

    assert.equal(
        service.getAliveCount("Bulbasaur"),
        0
    );
});

test("BattlePokemonService returns zero for an empty party", () => {
    const service = createService();

    assert.equal(service.getAliveCount([]), 0);
});

test("BattlePokemonService counts all living Pokémon", () => {
    const service = createService();

    const party = [
        createPokemon("Bulbasaur", 20),
        createPokemon("Squirtle", 10),
        createPokemon("Charmander", 1)
    ];

    assert.equal(service.getAliveCount(party), 3);
});

test("BattlePokemonService excludes fainted Pokémon from the count", () => {
    const service = createService();

    const party = [
        createPokemon("Bulbasaur", 20),
        createPokemon("Squirtle", 0),
        createPokemon("Charmander", -5)
    ];

    assert.equal(service.getAliveCount(party), 1);
});

test("BattlePokemonService ignores empty party slots when counting living Pokémon", () => {
    const service = createService();

    const party = [
        createPokemon("Bulbasaur", 20),
        null,
        undefined,
        createPokemon("Squirtle", 0)
    ];

    assert.equal(service.getAliveCount(party), 1);
});

test("BattlePokemonService returns zero when no party members have positive HP", () => {
    const service = createService();

    const party = [
        createPokemon("Bulbasaur", 0),
        createPokemon("Squirtle", -1)
    ];

    assert.equal(service.getAliveCount(party), 0);
});

// --------------------------------
// Party alive checks
// --------------------------------

test("BattlePokemonService reports false for a missing party", () => {
    const service = createService();

    assert.equal(service.hasAlivePokemon(null), false);
});

test("BattlePokemonService reports false for an empty party", () => {
    const service = createService();

    assert.equal(service.hasAlivePokemon([]), false);
});

test("BattlePokemonService reports true when at least one Pokémon is alive", () => {
    const service = createService();

    const party = [
        createPokemon("Bulbasaur", 0),
        createPokemon("Squirtle", 5)
    ];

    assert.equal(service.hasAlivePokemon(party), true);
});

test("BattlePokemonService reports false when every Pokémon has fainted", () => {
    const service = createService();

    const party = [
        createPokemon("Bulbasaur", 0),
        createPokemon("Squirtle", -2)
    ];

    assert.equal(service.hasAlivePokemon(party), false);
});

test("BattlePokemonService reports false when the party is not an array", () => {
    const service = createService();

    assert.equal(
        service.hasAlivePokemon({
            name: "Bulbasaur",
            hp: 20
        }),
        false
    );
});

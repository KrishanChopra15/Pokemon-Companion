"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const PokemonSwitchService =
    require("../scripts/services/pokemon-switch-service");

    
function pokemon(species, hp = 100) {
    return { species, hp };
}

function makeSide(party, active) {
    return { party, active };
}

function createService() {
    return new PokemonSwitchService();
}


// -----------------------------------------------
// Constructor
// -----------------------------------------------

test("constructor creates a PokémonSwitchService instance", () => {
    const service = createService();

    assert.ok(service instanceof PokemonSwitchService);
});


// -----------------------------------------------
// getAvailablePokemon
// -----------------------------------------------

test("getAvailablePokemon returns every healthy Pokémon", () => {
    const service = createService();

    const charmander = pokemon("CHARMANDER", 39);
    const squirtle = pokemon("SQUIRTLE", 44);

    const side = makeSide(
        [charmander, squirtle],
        0
    );

    assert.deepEqual(
        service.getAvailablePokemon(side),
        [
            { index: 0, pokemon: charmander },
            { index: 1, pokemon: squirtle }
        ]
    );
});

test("getAvailablePokemon preserves original party indices", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER", 40),
            pokemon("SQUIRTLE", 0),
            pokemon("BULBASAUR", 30)
        ],
        0
    );

    assert.deepEqual(
        service.getAvailablePokemon(side).map(entry => entry.index),
        [0, 2]
    );
});

test("getAvailablePokemon excludes Pokémon with zero HP", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER", 40),
            pokemon("SQUIRTLE", 0)
        ],
        0
    );

    assert.deepEqual(
        service.getAvailablePokemon(side).map(entry => entry.pokemon.species),
        ["CHARMANDER"]
    );
});

test("getAvailablePokemon excludes Pokémon with negative HP", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER", -1),
            pokemon("SQUIRTLE", 10)
        ],
        0
    );

    assert.deepEqual(
        service.getAvailablePokemon(side).map(entry => entry.pokemon.species),
        ["SQUIRTLE"]
    );
});

test("getAvailablePokemon excludes null party entries", () => {
    const service = createService();

    const charmander = pokemon("CHARMANDER");

    const side = makeSide(
        [null, charmander],
        0
    );

    assert.deepEqual(
        service.getAvailablePokemon(side),
        [{ index: 1, pokemon: charmander }]
    );
});

test("getAvailablePokemon excludes undefined party entries", () => {
    const service = createService();

    const charmander = pokemon("CHARMANDER");

    const party = [];
    party[1] = undefined;
    party[2] = charmander;

    const side = makeSide(party, 0);

    assert.deepEqual(
        service.getAvailablePokemon(side),
        [{ index: 2, pokemon: charmander }]
    );
});

test("getAvailablePokemon excludes entries with missing HP", () => {
    const service = createService();

    const side = makeSide(
        [
            { species: "CHARMANDER" },
            pokemon("SQUIRTLE", 20)
        ],
        0
    );

    assert.deepEqual(
        service.getAvailablePokemon(side).map(entry => entry.pokemon.species),
        ["SQUIRTLE"]
    );
});

test("getAvailablePokemon returns an empty array for a missing side", () => {
    const service = createService();

    assert.deepEqual(service.getAvailablePokemon(null), []);
});

test("getAvailablePokemon returns an empty array for an undefined side", () => {
    const service = createService();

    assert.deepEqual(service.getAvailablePokemon(undefined), []);
});

test("getAvailablePokemon returns an empty array when party is missing", () => {
    const service = createService();

    assert.deepEqual(service.getAvailablePokemon({ active: 0 }), []);
});

test("getAvailablePokemon returns an empty array when party is not an array", () => {
    const service = createService();

    assert.deepEqual(
        service.getAvailablePokemon({
            party: {},
            active: 0
        }),
        []
    );
});

test("getAvailablePokemon returns an empty array for an empty party", () => {
    const service = createService();

    assert.deepEqual(
        service.getAvailablePokemon(makeSide([], 0)),
        []
    );
});

test("getAvailablePokemon returns an empty array when every Pokémon has fainted", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER", 0),
            pokemon("SQUIRTLE", -1)
        ],
        0
    );

    assert.deepEqual(service.getAvailablePokemon(side), []);
});

test("getAvailablePokemon preserves the original Pokémon object references", () => {
    const service = createService();

    const charmander = pokemon("CHARMANDER");
    const side = makeSide([charmander], 0);

    const result = service.getAvailablePokemon(side);

    assert.equal(result[0].pokemon, charmander);
});

test("getAvailablePokemon does not modify the party", () => {
    const service = createService();

    const party = [
        pokemon("CHARMANDER"),
        pokemon("SQUIRTLE", 0)
    ];

    const originalParty = [...party];
    const side = makeSide(party, 0);

    service.getAvailablePokemon(side);

    assert.deepEqual(side.party, originalParty);
});


// -----------------------------------------------
// canSwitch
// -----------------------------------------------

test("canSwitch rejects a missing side", () => {
    const service = createService();

    assert.deepEqual(
        service.canSwitch(null, 0),
        {
            allowed: false,
            reason: "Invalid party"
        }
    );
});

test("canSwitch rejects a side without a party", () => {
    const service = createService();

    assert.deepEqual(
        service.canSwitch({ active: 0 }, 1),
        {
            allowed: false,
            reason: "Invalid party"
        }
    );
});

test("canSwitch rejects a non-array party", () => {
    const service = createService();

    assert.deepEqual(
        service.canSwitch(
            { party: {}, active: 0 },
            1
        ),
        {
            allowed: false,
            reason: "Invalid party"
        }
    );
});

test("canSwitch rejects an out-of-range index", () => {
    const service = createService();

    const side = makeSide(
        [pokemon("CHARMANDER")],
        0
    );

    assert.deepEqual(
        service.canSwitch(side, 1),
        {
            allowed: false,
            reason: "Invalid Pokémon"
        }
    );
});

test("canSwitch rejects a negative index", () => {
    const service = createService();

    const side = makeSide(
        [pokemon("CHARMANDER")],
        0
    );

    assert.deepEqual(
        service.canSwitch(side, -1),
        {
            allowed: false,
            reason: "Invalid Pokémon"
        }
    );
});

test("canSwitch rejects a null party entry", () => {
    const service = createService();

    const side = makeSide(
        [pokemon("CHARMANDER"), null],
        0
    );

    assert.deepEqual(
        service.canSwitch(side, 1),
        {
            allowed: false,
            reason: "Invalid Pokémon"
        }
    );
});

test("canSwitch rejects a fainted Pokémon at zero HP", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE", 0)
        ],
        0
    );

    assert.deepEqual(
        service.canSwitch(side, 1),
        {
            allowed: false,
            reason: "Pokémon fainted"
        }
    );
});

test("canSwitch rejects a Pokémon with negative HP", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE", -5)
        ],
        0
    );

    assert.deepEqual(
        service.canSwitch(side, 1),
        {
            allowed: false,
            reason: "Pokémon fainted"
        }
    );
});

test("canSwitch rejects the currently active Pokémon", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE")
        ],
        0
    );

    assert.deepEqual(
        service.canSwitch(side, 0),
        {
            allowed: false,
            reason: "Already active"
        }
    );
});

test("canSwitch allows a healthy inactive Pokémon", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE")
        ],
        0
    );

    assert.deepEqual(
        service.canSwitch(side, 1),
        { allowed: true }
    );
});

test("canSwitch allows a switch when the active index is different", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE"),
            pokemon("BULBASAUR")
        ],
        1
    );

    assert.deepEqual(
        service.canSwitch(side, 2),
        { allowed: true }
    );
});


// -----------------------------------------------
// switchPokemon
// -----------------------------------------------

test("switchPokemon successfully switches to a healthy Pokémon", () => {
    const service = createService();

    const charmander = pokemon("CHARMANDER");
    const squirtle = pokemon("SQUIRTLE");

    const side = makeSide(
        [charmander, squirtle],
        0
    );

    const result = service.switchPokemon(side, 1);

    assert.deepEqual(result, {
        success: true,
        previous: 0,
        current: 1,
        pokemon: squirtle
    });
});

test("switchPokemon updates the active index", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE")
        ],
        0
    );

    service.switchPokemon(side, 1);

    assert.equal(side.active, 1);
});

test("switchPokemon returns the previous active index", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE"),
            pokemon("BULBASAUR")
        ],
        2
    );

    const result = service.switchPokemon(side, 0);

    assert.equal(result.previous, 2);
});

test("switchPokemon returns the new active index as current", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE")
        ],
        0
    );

    const result = service.switchPokemon(side, 1);

    assert.equal(result.current, 1);
});

test("switchPokemon returns the selected Pokémon object", () => {
    const service = createService();

    const squirtle = pokemon("SQUIRTLE");
    const side = makeSide(
        [pokemon("CHARMANDER"), squirtle],
        0
    );

    const result = service.switchPokemon(side, 1);

    assert.equal(result.pokemon, squirtle);
});

test("switchPokemon rejects an invalid target without changing the active index", () => {
    const service = createService();

    const side = makeSide(
        [pokemon("CHARMANDER")],
        0
    );

    const result = service.switchPokemon(side, 5);

    assert.deepEqual(result, {
        success: false,
        reason: "Invalid Pokémon"
    });
    assert.equal(side.active, 0);
});

test("switchPokemon rejects a fainted target without changing the active index", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE", 0)
        ],
        0
    );

    const result = service.switchPokemon(side, 1);

    assert.deepEqual(result, {
        success: false,
        reason: "Pokémon fainted"
    });
    assert.equal(side.active, 0);
});

test("switchPokemon rejects switching to the current Pokémon without changing state", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE")
        ],
        0
    );

    const originalParty = [...side.party];
    const result = service.switchPokemon(side, 0);

    assert.deepEqual(result, {
        success: false,
        reason: "Already active"
    });
    assert.equal(side.active, 0);
    assert.deepEqual(side.party, originalParty);
});

test("switchPokemon does not reorder the party", () => {
    const service = createService();

    const party = [
        pokemon("CHARMANDER"),
        pokemon("SQUIRTLE"),
        pokemon("BULBASAUR")
    ];

    const side = makeSide(party, 0);

    service.switchPokemon(side, 2);

    assert.equal(side.party, party);
    assert.equal(side.party[0].species, "CHARMANDER");
    assert.equal(side.party[1].species, "SQUIRTLE");
    assert.equal(side.party[2].species, "BULBASAUR");
});


// -----------------------------------------------
// needsSwitch
// -----------------------------------------------

test("needsSwitch returns true for a missing side", () => {
    const service = createService();

    assert.equal(service.needsSwitch(null), true);
});

test("needsSwitch returns true for an undefined side", () => {
    const service = createService();

    assert.equal(service.needsSwitch(undefined), true);
});

test("needsSwitch returns true when party is missing", () => {
    const service = createService();

    assert.equal(
        service.needsSwitch({ active: 0 }),
        true
    );
});

test("needsSwitch returns true when party is not an array", () => {
    const service = createService();

    assert.equal(
        service.needsSwitch({
            party: {},
            active: 0
        }),
        true
    );
});

test("needsSwitch returns true for an empty party", () => {
    const service = createService();

    assert.equal(
        service.needsSwitch(makeSide([], 0)),
        true
    );
});

test("needsSwitch returns true when the active Pokémon is missing", () => {
    const service = createService();

    const side = makeSide(
        [pokemon("CHARMANDER")],
        3
    );

    assert.equal(service.needsSwitch(side), true);
});

test("needsSwitch returns true when the active Pokémon is null", () => {
    const service = createService();

    const side = makeSide(
        [null, pokemon("SQUIRTLE")],
        0
    );

    assert.equal(service.needsSwitch(side), true);
});

test("needsSwitch returns true when the active Pokémon has zero HP", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER", 0),
            pokemon("SQUIRTLE")
        ],
        0
    );

    assert.equal(service.needsSwitch(side), true);
});

test("needsSwitch returns true when the active Pokémon has negative HP", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER", -10),
            pokemon("SQUIRTLE")
        ],
        0
    );

    assert.equal(service.needsSwitch(side), true);
});

test("needsSwitch returns false when the active Pokémon is healthy", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER", 1),
            pokemon("SQUIRTLE")
        ],
        0
    );

    assert.equal(service.needsSwitch(side), false);
});

test("needsSwitch defaults to party index zero when active is undefined", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER", 0),
            pokemon("SQUIRTLE", 50)
        ],
        undefined
    );

    assert.equal(service.needsSwitch(side), true);
});

test("needsSwitch checks party index zero when active is zero", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER", 0),
            pokemon("SQUIRTLE", 50)
        ],
        0
    );

    assert.equal(service.needsSwitch(side), true);
});


// -----------------------------------------------
// getNextAvailable
// -----------------------------------------------

test("getNextAvailable returns the first healthy inactive Pokémon", () => {
    const service = createService();

    const squirtle = pokemon("SQUIRTLE");

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            squirtle,
            pokemon("BULBASAUR")
        ],
        0
    );

    assert.deepEqual(
        service.getNextAvailable(side),
        {
            index: 1,
            pokemon: squirtle
        }
    );
});

test("getNextAvailable skips the active Pokémon", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE")
        ],
        1
    );

    const result = service.getNextAvailable(side);

    assert.equal(result.index, 0);
    assert.equal(result.pokemon.species, "CHARMANDER");
});

test("getNextAvailable skips fainted inactive Pokémon", () => {
    const service = createService();

    const bulbasaur = pokemon("BULBASAUR");

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE", 0),
            bulbasaur
        ],
        0
    );

    assert.deepEqual(
        service.getNextAvailable(side),
        {
            index: 2,
            pokemon: bulbasaur
        }
    );
});

test("getNextAvailable skips null party entries", () => {
    const service = createService();

    const squirtle = pokemon("SQUIRTLE");

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            null,
            squirtle
        ],
        0
    );

    assert.deepEqual(
        service.getNextAvailable(side),
        {
            index: 2,
            pokemon: squirtle
        }
    );
});

test("getNextAvailable returns null when no inactive healthy Pokémon exist", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE", 0)
        ],
        0
    );

    assert.equal(service.getNextAvailable(side), null);
});

test("getNextAvailable returns null when the party is empty", () => {
    const service = createService();

    assert.equal(
        service.getNextAvailable(makeSide([], 0)),
        null
    );
});

test("getNextAvailable returns null for a missing side", () => {
    const service = createService();

    assert.equal(service.getNextAvailable(null), null);
});

test("getNextAvailable preserves the original Pokémon reference", () => {
    const service = createService();

    const squirtle = pokemon("SQUIRTLE");

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            squirtle
        ],
        0
    );

    assert.equal(
        service.getNextAvailable(side).pokemon,
        squirtle
    );
});


// -----------------------------------------------
// autoSwitch
// -----------------------------------------------

test("autoSwitch switches to the first healthy inactive Pokémon", () => {
    const service = createService();

    const charmander = pokemon("CHARMANDER");
    const squirtle = pokemon("SQUIRTLE");

    const side = makeSide(
        [charmander, squirtle],
        0
    );

    assert.deepEqual(
        service.autoSwitch(side),
        {
            success: true,
            previous: 0,
            index: 1,
            pokemon: squirtle
        }
    );
});

test("autoSwitch updates the active index", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE")
        ],
        0
    );

    service.autoSwitch(side);

    assert.equal(side.active, 1);
});

test("autoSwitch returns the previous active index", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE"),
            pokemon("BULBASAUR")
        ],
        2
    );

    const result = service.autoSwitch(side);

    assert.equal(result.previous, 2);
    assert.equal(result.index, 0);
});

test("autoSwitch skips the fainted Pokémon", () => {
    const service = createService();

    const bulbasaur = pokemon("BULBASAUR");

    const side = makeSide(
        [
            pokemon("CHARMANDER", 0),
            pokemon("SQUIRTLE", 0),
            bulbasaur
        ],
        0
    );

    const result = service.autoSwitch(side);

    assert.equal(result.success, true);
    assert.equal(result.index, 2);
    assert.equal(result.pokemon, bulbasaur);
    assert.equal(side.active, 2);
});

test("autoSwitch fails when there is no available inactive Pokémon", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER"),
            pokemon("SQUIRTLE", 0)
        ],
        0
    );

    assert.deepEqual(
        service.autoSwitch(side),
        {
            success: false,
            reason: "No available Pokémon"
        }
    );
});

test("autoSwitch fails for an empty party", () => {
    const service = createService();

    const side = makeSide([], 0);

    assert.deepEqual(
        service.autoSwitch(side),
        {
            success: false,
            reason: "No available Pokémon"
        }
    );
});

test("autoSwitch fails for a missing side", () => {
    const service = createService();

    assert.deepEqual(
        service.autoSwitch(null),
        {
            success: false,
            reason: "No available Pokémon"
        }
    );
});

test("autoSwitch does not change the active index when it fails", () => {
    const service = createService();

    const side = makeSide(
        [pokemon("CHARMANDER")],
        0
    );

    const result = service.autoSwitch(side);

    assert.equal(result.success, false);
    assert.equal(side.active, 0);
});

test("autoSwitch does not reorder the party", () => {
    const service = createService();

    const party = [
        pokemon("CHARMANDER"),
        pokemon("SQUIRTLE"),
        pokemon("BULBASAUR")
    ];

    const side = makeSide(party, 0);

    service.autoSwitch(side);

    assert.equal(side.party, party);
    assert.deepEqual(
        side.party.map(p => p.species),
        ["CHARMANDER", "SQUIRTLE", "BULBASAUR"]
    );
});

test("autoSwitch can choose another Pokémon even when the current one is healthy", () => {
    const service = createService();

    const side = makeSide(
        [
            pokemon("CHARMANDER", 80),
            pokemon("SQUIRTLE", 50)
        ],
        0
    );

    const result = service.autoSwitch(side);

    assert.equal(result.success, true);
    assert.equal(result.index, 1);
    assert.equal(side.active, 1);
});

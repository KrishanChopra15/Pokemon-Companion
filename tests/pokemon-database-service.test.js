"use strict";

const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const PokemonDatabaseService = require(
    "../scripts/services/pokemon-database-service"
);

const GENERATED_DIR = path.resolve(
    __dirname,
    "../database/generated"
);

const TEST_GAME = `__pokemon_database_service_test_${process.pid}`;
const FIXTURE_DIR = path.join(GENERATED_DIR, TEST_GAME);
const FIXTURE_FILE = path.join(
    FIXTURE_DIR,
    "pokemon-species.json"
);

const BULBASAUR = {
    name: "BULBASAUR",
    id: "0001",
    friendship: 70,
    type1: { name: "GRASS" },
    type2: { name: "POISON" },
    ability1: { name: "OVERGROW" },
    ability2: { name: "CHLOROPHYLL" },
    evolutions: [
        {
            method: "EVO_LEVEL",
            level: 16,
            targetSpecies: { name: "IVYSAUR" }
        },
        {
            method: { constant: "EVO_ITEM" },
            item: { constant: "ITEM_LEAF_STONE" },
            targetSpecies: "VENUSAUR"
        },
        {
            method: "EVO_TRADE",
            targetSpecies: "TRADE_TARGET"
        },
        {
            method: "EVO_FRIENDSHIP",
            targetSpecies: "FRIENDSHIP_TARGET"
        },
        {
            method: "EVO_FRIENDSHIP_DAY",
            targetSpecies: "DAY_TARGET"
        },
        {
            method: "EVO_FRIENDSHIP_NIGHT",
            targetSpecies: "NIGHT_TARGET"
        },
        {
            method: "EVO_TRADE_ITEM",
            item: { name: "ITEM_UP_GRADE" },
            targetSpecies: "TRADE_ITEM_TARGET"
        },
        {
            method: "UNKNOWN_METHOD",
            targetSpecies: "UNKNOWN_TARGET"
        },
        {
            method: "EVO_LEVEL"
        },
        {
            method: { constant: "" },
            targetSpecies: "INVALID_METHOD_TARGET"
        },
        null
    ]
};

const IVYSAUR = {
    name: "IVYSAUR",
    id: "0002",
    friendship: 70,
    type1: { name: "GRASS" },
    type2: { name: "POISON" },
    ability1: { name: "OVERGROW" },
    ability2: { name: "CHLOROPHYLL" },
    evolutions: []
};

const CHARMANDER = {
    name: "CHARMANDER",
    id: "0004",
    friendship: "80.9",
    type1: { name: "FIRE" },
    type2: null,
    ability1: { name: "BLAZE" },
    ability2: null,
    evolutions: [
        {
            method: { constant: "EVO_LEVEL" },
            parameter: "16",
            targetSpecies: { name: "CHARMELEON" }
        }
    ]
};

const SQUIRTLE = {
    name: "SQUIRTLE",
    id: "0007",
    friendship: 300.9,
    type1: { name: "WATER" },
    type2: null,
    ability1: { name: "TORRENT" },
    ability2: null,
    evolutions: []
};

const EXTRA_POKEMON = [
    {
        name: "ZEROFRIEND",
        id: "0008",
        friendship: 0,
        type1: { name: "NORMAL" },
        type2: null,
        ability1: { name: "RUN_AWAY" },
        ability2: null,
        evolutions: []
    },
    {
        name: "NEGFRIEND",
        id: "0009",
        friendship: -4.8,
        type1: { name: "NORMAL" },
        type2: { name: "FIRE" },
        ability1: { name: "RUN_AWAY" },
        ability2: { name: "FLASH_FIRE" },
        evolutions: []
    },
    {
        name: "BADFRIEND",
        id: "0010",
        friendship: "not-a-number",
        type1: null,
        type2: null,
        ability1: null,
        ability2: null,
        evolutions: []
    },
    {
        name: "NULLFRIEND",
        id: "0011",
        friendship: null,
        type1: null,
        type2: null,
        ability1: null,
        ability2: null,
        evolutions: []
    },
    {
        name: "NOFRIEND",
        id: "0012",
        type1: null,
        type2: null,
        ability1: null,
        ability2: null,
        evolutions: []
    },
    {
        name: "TYPEMIX",
        id: "0400",
        friendship: 50,
        type1: { name: "NORMAL" },
        type2: { name: "FIRE" },
        ability1: { name: "RUN_AWAY" },
        ability2: { name: "FLASH_FIRE" },
        evolutions: []
    },
    {
        name: "EEVEE",
        id: "0133",
        friendship: 70,
        type1: { name: "NORMAL" },
        type2: null,
        ability1: { name: "RUN_AWAY" },
        ability2: { name: "ADAPTABILITY" },
        evolutions: []
    }
];

const FIXTURE_POKEMON = [
    BULBASAUR,
    IVYSAUR,
    CHARMANDER,
    SQUIRTLE,
    ...EXTRA_POKEMON
];

function writeGameFixture(game, contents) {
    const directory = path.join(GENERATED_DIR, game);
    const file = path.join(directory, "pokemon-species.json");

    fs.mkdirSync(directory, { recursive: true });

    fs.writeFileSync(
        file,
        typeof contents === "string"
            ? contents
            : JSON.stringify(contents, null, 2),
        "utf8"
    );

    return { directory, file };
}

function removeGameFixture(game) {
    fs.rmSync(
        path.join(GENERATED_DIR, game),
        { recursive: true, force: true }
    );
}

writeGameFixture(TEST_GAME, FIXTURE_POKEMON);

after(() => {
    removeGameFixture(TEST_GAME);
});

function createService(game = TEST_GAME) {
    return new PokemonDatabaseService(game);
}

// --------------------------------------------------
// Constructor and database loading
// --------------------------------------------------

test("constructor creates a PokemonDatabaseService instance", () => {
    assert.ok(createService() instanceof PokemonDatabaseService);
});

test("constructor stores the supplied game name", () => {
    const service = createService();

    assert.equal(service.game, TEST_GAME);
});

test("constructor loads the generated Pokémon database", () => {
    const service = createService();

    assert.ok(Array.isArray(service.pokemon));
    assert.ok(service.pokemon.length > 0);
});

test("constructor loads every Pokémon fixture record", () => {
    const service = createService();

    assert.equal(service.pokemon.length, FIXTURE_POKEMON.length);
});

test("constructor loads the fixture Pokémon names", () => {
    const service = createService();

    assert.deepEqual(
        service.pokemon.map(pokemon => pokemon.name),
        FIXTURE_POKEMON.map(pokemon => pokemon.name)
    );
});

test("constructor parses Pokémon data from JSON", () => {
    const service = createService();

    assert.equal(service.pokemon[0].name, "BULBASAUR");
    assert.equal(service.pokemon[0].id, "0001");
});

test("constructor loads the database independently for each instance", () => {
    const first = createService();
    const second = createService();

    assert.notStrictEqual(first.pokemon, second.pokemon);
    assert.deepEqual(first.pokemon, second.pokemon);
});

test("constructor loads the game-specific database", () => {
    const game = `${TEST_GAME}_alternate`;

    try {
        writeGameFixture(game, [
            {
                name: "ALTERNATE",
                id: "9999",
                evolutions: []
            }
        ]);

        const service = createService(game);

        assert.deepEqual(service.pokemon, [
            {
                name: "ALTERNATE",
                id: "9999",
                evolutions: []
            }
        ]);
    } finally {
        removeGameFixture(game);
    }
});

test("constructor throws when the requested database file does not exist", () => {
    assert.throws(
        () => createService(`${TEST_GAME}_missing`),
        error => error.code === "ENOENT"
    );
});

test("constructor throws when the database file contains invalid JSON", () => {
    const game = `${TEST_GAME}_invalid_json`;

    try {
        writeGameFixture(game, "{ invalid json");

        assert.throws(
            () => createService(game),
            SyntaxError
        );
    } finally {
        removeGameFixture(game);
    }
});

// --------------------------------------------------
// getPokemon()
// --------------------------------------------------

test("getPokemon finds Bulbasaur by uppercase name", () => {
    const service = createService();

    assert.equal(
        service.getPokemon("BULBASAUR").name,
        "BULBASAUR"
    );
});

test("getPokemon finds Pokémon from mixed-case input", () => {
    const service = createService();

    assert.equal(
        service.getPokemon("Bulbasaur").name,
        "BULBASAUR"
    );
});

test("getPokemon finds Pokémon from lowercase input", () => {
    const service = createService();

    assert.equal(
        service.getPokemon("bulbasaur").name,
        "BULBASAUR"
    );
});

test("getPokemon returns the original Pokémon record", () => {
    const service = createService();

    assert.strictEqual(
        service.getPokemon("BULBASAUR"),
        service.pokemon[0]
    );
});

test("getPokemon returns null for an unknown name", () => {
    const service = createService();

    assert.equal(service.getPokemon("MISSING"), null);
});

test("getPokemon returns null for an empty string", () => {
    const service = createService();

    assert.equal(service.getPokemon(""), null);
});

test("getPokemon returns null for null", () => {
    const service = createService();

    assert.equal(service.getPokemon(null), null);
});

test("getPokemon returns null for undefined", () => {
    const service = createService();

    assert.equal(service.getPokemon(undefined), null);
});

test("getPokemon stringifies a numeric input before searching", () => {
    const game = `${TEST_GAME}_numeric_name`;

    try {
        writeGameFixture(game, [
            { name: "123", id: "0123" }
        ]);

        const service = createService(game);

        assert.equal(service.getPokemon(123).name, "123");
    } finally {
        removeGameFixture(game);
    }
});

test("getPokemon does not remove a SPECIES_ prefix", () => {
    const service = createService();

    assert.equal(
        service.getPokemon("SPECIES_BULBASAUR"),
        null
    );
});

// --------------------------------------------------
// getPokemonById()
// --------------------------------------------------

test("getPokemonById finds a Pokémon using a four-digit ID", () => {
    const service = createService();

    assert.equal(
        service.getPokemonById("0001").name,
        "BULBASAUR"
    );
});

test("getPokemonById pads a numeric ID with leading zeros", () => {
    const service = createService();

    assert.equal(
        service.getPokemonById(1).name,
        "BULBASAUR"
    );
});

test("getPokemonById pads a short string ID", () => {
    const service = createService();

    assert.equal(
        service.getPokemonById("4").name,
        "CHARMANDER"
    );
});

test("getPokemonById preserves an already padded ID", () => {
    const service = createService();

    assert.equal(
        service.getPokemonById("0007").name,
        "SQUIRTLE"
    );
});

test("getPokemonById returns null for an unknown ID", () => {
    const service = createService();

    assert.equal(service.getPokemonById(9999), null);
});

test("getPokemonById returns the original Pokémon record", () => {
    const service = createService();

    assert.strictEqual(
        service.getPokemonById(1),
        service.pokemon[0]
    );
});

test("getPokemonById stringifies null", () => {
    const service = createService();

    assert.equal(service.getPokemonById(null), null);
});

test("getPokemonById does not truncate IDs longer than four characters", () => {
    const game = `${TEST_GAME}_long_id`;

    try {
        writeGameFixture(game, [
            { name: "LONGID", id: "12345" }
        ]);

        const service = createService(game);

        assert.equal(service.getPokemonById(12345).name, "LONGID");
    } finally {
        removeGameFixture(game);
    }
});

// --------------------------------------------------
// getAllPokemon()
// --------------------------------------------------

test("getAllPokemon returns an array", () => {
    const service = createService();

    assert.ok(Array.isArray(service.getAllPokemon()));
});

test("getAllPokemon returns all loaded Pokémon", () => {
    const service = createService();

    assert.equal(
        service.getAllPokemon().length,
        FIXTURE_POKEMON.length
    );
});

test("getAllPokemon returns the internal database array", () => {
    const service = createService();

    assert.strictEqual(
        service.getAllPokemon(),
        service.pokemon
    );
});

test("getAllPokemon preserves database ordering", () => {
    const service = createService();

    assert.deepEqual(
        service.getAllPokemon().map(pokemon => pokemon.name),
        FIXTURE_POKEMON.map(pokemon => pokemon.name)
    );
});

test("getAllPokemon returns the same reference on repeated calls", () => {
    const service = createService();

    assert.strictEqual(
        service.getAllPokemon(),
        service.getAllPokemon()
    );
});

// --------------------------------------------------
// getBaseFriendship()
// --------------------------------------------------

test("getBaseFriendship returns the base friendship value", () => {
    const service = createService();

    assert.equal(service.getBaseFriendship("BULBASAUR"), 70);
});

test("getBaseFriendship accepts lowercase species names", () => {
    const service = createService();

    assert.equal(service.getBaseFriendship("bulbasaur"), 70);
});

test("getBaseFriendship converts numeric strings to numbers", () => {
    const service = createService();

    assert.equal(service.getBaseFriendship("CHARMANDER"), 80);
});

test("getBaseFriendship floors fractional values", () => {
    const game = `${TEST_GAME}_fractional_friendship`;

    try {
        writeGameFixture(game, [
            { name: "FRACTIONAL", friendship: 125.9 }
        ]);

        assert.equal(
            createService(game).getBaseFriendship("FRACTIONAL"),
            125
        );
    } finally {
        removeGameFixture(game);
    }
});

test("getBaseFriendship clamps values above 255", () => {
    const service = createService();

    assert.equal(service.getBaseFriendship("SQUIRTLE"), 255);
});

test("getBaseFriendship clamps negative values to zero", () => {
    const service = createService();

    assert.equal(service.getBaseFriendship("NEGFRIEND"), 0);
});

test("getBaseFriendship preserves zero", () => {
    const service = createService();

    assert.equal(service.getBaseFriendship("ZEROFRIEND"), 0);
});

test("getBaseFriendship returns null for a missing Pokémon", () => {
    const service = createService();

    assert.equal(service.getBaseFriendship("MISSING"), null);
});

test("getBaseFriendship returns null for a nonnumeric value", () => {
    const service = createService();

    assert.equal(service.getBaseFriendship("BADFRIEND"), null);
});

test("getBaseFriendship returns zero for a null friendship value", () => {
    const service = createService();

    assert.equal(service.getBaseFriendship("NULLFRIEND"), 0);
});

test("getBaseFriendship returns null when friendship is absent", () => {
    const service = createService();

    assert.equal(service.getBaseFriendship("NOFRIEND"), null);
});

test("getBaseFriendship accepts friendship values represented as numeric strings", () => {
    const game = `${TEST_GAME}_string_friendship`;

    try {
        writeGameFixture(game, [
            { name: "STRINGFRIEND", friendship: "155" }
        ]);

        assert.equal(
            createService(game).getBaseFriendship("STRINGFRIEND"),
            155
        );
    } finally {
        removeGameFixture(game);
    }
});

// --------------------------------------------------
// getEvolutions()
// --------------------------------------------------

test("getEvolutions returns an array for a Pokémon with evolutions", () => {
    const service = createService();

    assert.ok(Array.isArray(service.getEvolutions("BULBASAUR")));
});

test("getEvolutions normalizes valid evolution records", () => {
    const service = createService();

    const evolutions = service.getEvolutions("BULBASAUR");

    assert.ok(evolutions.length > 0);

    for (const evolution of evolutions) {
        assert.ok(evolution.method);
        assert.ok(evolution.target);
    }
});

test("getEvolutions returns all supported evolution options", () => {
    const service = createService();

    const evolutions = service.getEvolutions("BULBASAUR");

    assert.deepEqual(
        evolutions.map(evolution => evolution.method),
        [
            "LEVEL",
            "EVOLUTION_STONE",
            "TRADE",
            "FRIENDSHIP",
            "FRIENDSHIP_DAY",
            "FRIENDSHIP_NIGHT",
            "TRADE_ITEM"
        ]
    );
});

test("getEvolutions filters invalid evolution records", () => {
    const service = createService();

    const evolutions = service.getEvolutions("BULBASAUR");

    assert.ok(
        evolutions.every(evolution => evolution !== null)
    );
});

test("getEvolutions returns an empty array for a missing Pokémon", () => {
    const service = createService();

    assert.deepEqual(service.getEvolutions("MISSING"), []);
});

test("getEvolutions returns an empty array for Pokémon without evolutions", () => {
    const service = createService();

    assert.deepEqual(service.getEvolutions("IVYSAUR"), []);
});

test("getEvolutions returns an empty array when evolutions is missing", () => {
    const game = `${TEST_GAME}_no_evolutions`;

    try {
        writeGameFixture(game, [
            { name: "NOEVOLUTIONS", id: "8000" }
        ]);

        assert.deepEqual(
            createService(game).getEvolutions("NOEVOLUTIONS"),
            []
        );
    } finally {
        removeGameFixture(game);
    }
});

test("getEvolutions returns an empty array when evolutions is not an array", () => {
    const game = `${TEST_GAME}_invalid_evolutions`;

    try {
        writeGameFixture(game, [
            {
                name: "INVALIDEVOLUTIONS",
                evolutions: { method: "EVO_LEVEL" }
            }
        ]);

        assert.deepEqual(
            createService(game).getEvolutions("INVALIDEVOLUTIONS"),
            []
        );
    } finally {
        removeGameFixture(game);
    }
});

test("getEvolutions does not mutate the stored evolution array", () => {
    const service = createService();
    const original = structuredClone(
        service.getPokemon("BULBASAUR").evolutions
    );

    service.getEvolutions("BULBASAUR");

    assert.deepEqual(
        service.getPokemon("BULBASAUR").evolutions,
        original
    );
});

// --------------------------------------------------
// getEvolution()
// --------------------------------------------------

test("getEvolution returns the first normalized evolution", () => {
    const service = createService();

    assert.deepEqual(
        service.getEvolution("BULBASAUR"),
        service.getEvolutions("BULBASAUR")[0]
    );
});

test("getEvolution returns the level evolution for Bulbasaur", () => {
    const service = createService();

    assert.deepEqual(
        service.getEvolution("BULBASAUR"),
        {
            method: "LEVEL",
            value: 16,
            target: "IVYSAUR"
        }
    );
});

test("getEvolution returns null for a Pokémon without evolutions", () => {
    const service = createService();

    assert.equal(service.getEvolution("IVYSAUR"), null);
});

test("getEvolution returns null for an unknown species", () => {
    const service = createService();

    assert.equal(service.getEvolution("MISSING"), null);
});

test("getEvolution returns the first valid result when invalid records precede it", () => {
    const game = `${TEST_GAME}_invalid_first`;

    try {
        writeGameFixture(game, [
            {
                name: "TESTMON",
                evolutions: [
                    null,
                    { method: "UNKNOWN", targetSpecies: "UNKNOWN_TARGET" },
                    {
                        method: "EVO_LEVEL",
                        level: 10,
                        targetSpecies: "NEXTMON"
                    }
                ]
            }
        ]);

        assert.deepEqual(
            createService(game).getEvolution("TESTMON"),
            {
                method: "LEVEL",
                value: 10,
                target: "NEXTMON"
            }
        );
    } finally {
        removeGameFixture(game);
    }
});

// --------------------------------------------------
// normalizeEvolution()
// --------------------------------------------------

test("normalizeEvolution returns null for null input", () => {
    const service = createService();

    assert.equal(service.normalizeEvolution(null), null);
});

test("normalizeEvolution returns null for undefined input", () => {
    const service = createService();

    assert.equal(service.normalizeEvolution(undefined), null);
});

test("normalizeEvolution returns null for an empty object", () => {
    const service = createService();

    assert.equal(service.normalizeEvolution({}), null);
});

test("normalizeEvolution returns null when the method is missing", () => {
    const service = createService();

    assert.equal(
        service.normalizeEvolution({
            targetSpecies: "IVYSAUR"
        }),
        null
    );
});

test("normalizeEvolution returns null when the method is empty", () => {
    const service = createService();

    assert.equal(
        service.normalizeEvolution({
            method: "",
            targetSpecies: "IVYSAUR"
        }),
        null
    );
});

test("normalizeEvolution returns null when a method object lacks a constant", () => {
    const service = createService();

    assert.equal(
        service.normalizeEvolution({
            method: {},
            targetSpecies: "IVYSAUR"
        }),
        null
    );
});

test("normalizeEvolution returns null when the target is missing", () => {
    const service = createService();

    assert.equal(
        service.normalizeEvolution({
            method: "EVO_LEVEL",
            level: 16
        }),
        null
    );
});

test("normalizeEvolution uses a target object's name", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: "EVO_LEVEL",
            level: 16,
            targetSpecies: { name: "Ivysaur" }
        }),
        {
            method: "LEVEL",
            value: 16,
            target: "IVYSAUR"
        }
    );
});

test("normalizeEvolution uppercases a string target", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: "EVO_TRADE",
            targetSpecies: "haunter"
        }),
        {
            method: "TRADE",
            value: null,
            target: "HAUNTER"
        }
    );
});

test("normalizeEvolution accepts a method constant object", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: { constant: "EVO_LEVEL" },
            level: 20,
            targetSpecies: "IVYSAUR"
        }),
        {
            method: "LEVEL",
            value: 20,
            target: "IVYSAUR"
        }
    );
});

test("normalizeEvolution returns null for an unknown method", () => {
    const service = createService();

    assert.equal(
        service.normalizeEvolution({
            method: "UNKNOWN_METHOD",
            targetSpecies: "IVYSAUR"
        }),
        null
    );
});

test("normalizeEvolution recognizes level evolution", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: "EVO_LEVEL",
            level: 16,
            targetSpecies: "IVYSAUR"
        }),
        {
            method: "LEVEL",
            value: 16,
            target: "IVYSAUR"
        }
    );
});

test("normalizeEvolution reads a level from parameter when level is absent", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: "EVO_LEVEL",
            parameter: 22,
            targetSpecies: "TESTMON"
        }),
        {
            method: "LEVEL",
            value: 22,
            target: "TESTMON"
        }
    );
});

test("normalizeEvolution returns null level when neither level nor parameter is valid", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: "EVO_LEVEL",
            targetSpecies: "TESTMON"
        }),
        {
            method: "LEVEL",
            value: null,
            target: "TESTMON"
        }
    );
});

test("normalizeEvolution recognizes an evolution stone", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: "EVO_ITEM",
            item: "ITEM_FIRE_STONE",
            targetSpecies: "TESTMON"
        }),
        {
            method: "EVOLUTION_STONE",
            value: "ITEM_FIRE_STONE",
            item: "ITEM_FIRE_STONE",
            target: "TESTMON"
        }
    );
});

test("normalizeEvolution recognizes a regular evolution item", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: "EVO_ITEM",
            item: "ITEM_UP_GRADE",
            targetSpecies: "TESTMON"
        }),
        {
            method: "ITEM",
            value: "ITEM_UP_GRADE",
            item: "ITEM_UP_GRADE",
            target: "TESTMON"
        }
    );
});

test("normalizeEvolution obtains item constants from item objects", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: "EVO_ITEM",
            item: { constant: "ITEM_WATER_STONE" },
            targetSpecies: "TESTMON"
        }),
        {
            method: "EVOLUTION_STONE",
            value: "ITEM_WATER_STONE",
            item: "ITEM_WATER_STONE",
            target: "TESTMON"
        }
    );
});

test("normalizeEvolution recognizes trade evolution", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: "EVO_TRADE",
            targetSpecies: "GENGAR"
        }),
        {
            method: "TRADE",
            value: null,
            target: "GENGAR"
        }
    );
});

test("normalizeEvolution uses the generation-three friendship threshold", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: "EVO_FRIENDSHIP",
            targetSpecies: "TESTMON"
        }),
        {
            method: "FRIENDSHIP",
            value: 220,
            target: "TESTMON"
        }
    );
});

test("normalizeEvolution recognizes friendship during the day", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: "EVO_FRIENDSHIP_DAY",
            targetSpecies: "TESTMON"
        }),
        {
            method: "FRIENDSHIP_DAY",
            value: 220,
            target: "TESTMON"
        }
    );
});

test("normalizeEvolution recognizes friendship during the night", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: "EVO_FRIENDSHIP_NIGHT",
            targetSpecies: "TESTMON"
        }),
        {
            method: "FRIENDSHIP_NIGHT",
            value: 220,
            target: "TESTMON"
        }
    );
});

test("normalizeEvolution recognizes trade with an item", () => {
    const service = createService();

    assert.deepEqual(
        service.normalizeEvolution({
            method: "EVO_TRADE_ITEM",
            item: "ITEM_UP_GRADE",
            targetSpecies: "TESTMON"
        }),
        {
            method: "TRADE_ITEM",
            value: "ITEM_UP_GRADE",
            item: "ITEM_UP_GRADE",
            target: "TESTMON"
        }
    );
});

test("normalizeEvolution falls back to the target object when its name is absent", () => {
    const service = createService();

    const result = service.normalizeEvolution({
        method: "EVO_TRADE",
        targetSpecies: { constant: "SPECIES_TESTMON" }
    });

    assert.equal(result.target, "[OBJECT OBJECT]");
});

// --------------------------------------------------
// getEvolutionLevel()
// --------------------------------------------------

test("getEvolutionLevel reads the level field", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionLevel({ level: 16 }),
        16
    );
});

test("getEvolutionLevel converts a numeric string", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionLevel({ level: "25" }),
        25
    );
});

test("getEvolutionLevel accepts a fractional number", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionLevel({ level: 12.5 }),
        12.5
    );
});

test("getEvolutionLevel reads parameter when level is absent", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionLevel({ parameter: 30 }),
        30
    );
});

test("getEvolutionLevel prefers level over parameter", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionLevel({
            level: 18,
            parameter: 30
        }),
        18
    );
});

test("getEvolutionLevel returns null for nonnumeric level and parameter", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionLevel({
            level: "invalid",
            parameter: "invalid"
        }),
        null
    );
});

test("getEvolutionLevel returns null when both fields are absent", () => {
    const service = createService();

    assert.equal(service.getEvolutionLevel({}), null);
});

test("getEvolutionLevel converts a null level to zero", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionLevel({ level: null }),
        0
    );
});

test("getEvolutionLevel falls back to parameter when level is not finite", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionLevel({
            level: Infinity,
            parameter: 40
        }),
        40
    );
});

// --------------------------------------------------
// getEvolutionItem()
// --------------------------------------------------

test("getEvolutionItem returns a string item", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionItem({ item: "ITEM_FIRE_STONE" }),
        "ITEM_FIRE_STONE"
    );
});

test("getEvolutionItem prefers an item constant", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionItem({
            item: {
                constant: "ITEM_THUNDER_STONE",
                name: "Thunder Stone"
            }
        }),
        "ITEM_THUNDER_STONE"
    );
});

test("getEvolutionItem uses an item name when no constant exists", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionItem({
            item: { name: "Moon Stone" }
        }),
        "Moon Stone"
    );
});

test("getEvolutionItem falls back to parameter", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionItem({
            parameter: "ITEM_WATER_STONE"
        }),
        "ITEM_WATER_STONE"
    );
});

test("getEvolutionItem prefers item over parameter", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionItem({
            item: "ITEM_FIRE_STONE",
            parameter: "ITEM_WATER_STONE"
        }),
        "ITEM_FIRE_STONE"
    );
});

test("getEvolutionItem returns null when the item and parameter are absent", () => {
    const service = createService();

    assert.equal(service.getEvolutionItem({}), null);
});

test("getEvolutionItem returns null for a falsy parameter", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionItem({ parameter: 0 }),
        null
    );
});

test("getEvolutionItem falls back to parameter when the item object has no usable fields", () => {
    const service = createService();

    assert.equal(
        service.getEvolutionItem({
            item: {},
            parameter: "ITEM_UP_GRADE"
        }),
        "ITEM_UP_GRADE"
    );
});

// --------------------------------------------------
// isEvolutionStone()
// --------------------------------------------------

test("isEvolutionStone recognizes a Fire Stone", () => {
    const service = createService();

    assert.equal(
        service.isEvolutionStone("ITEM_FIRE_STONE"),
        true
    );
});

test("isEvolutionStone recognizes a Thunder Stone", () => {
    const service = createService();

    assert.equal(
        service.isEvolutionStone("ITEM_THUNDER_STONE"),
        true
    );
});

test("isEvolutionStone recognizes a Water Stone", () => {
    const service = createService();

    assert.equal(
        service.isEvolutionStone("ITEM_WATER_STONE"),
        true
    );
});

test("isEvolutionStone recognizes a Leaf Stone", () => {
    const service = createService();

    assert.equal(
        service.isEvolutionStone("ITEM_LEAF_STONE"),
        true
    );
});

test("isEvolutionStone recognizes a Moon Stone", () => {
    const service = createService();

    assert.equal(
        service.isEvolutionStone("ITEM_MOON_STONE"),
        true
    );
});

test("isEvolutionStone recognizes a Sun Stone", () => {
    const service = createService();

    assert.equal(
        service.isEvolutionStone("ITEM_SUN_STONE"),
        true
    );
});

test("isEvolutionStone ignores casing and surrounding whitespace", () => {
    const service = createService();

    assert.equal(
        service.isEvolutionStone("  item_fire_stone  "),
        true
    );
});

test("isEvolutionStone rejects a regular evolution item", () => {
    const service = createService();

    assert.equal(
        service.isEvolutionStone("ITEM_UP_GRADE"),
        false
    );
});

test("isEvolutionStone rejects an empty string", () => {
    const service = createService();

    assert.equal(service.isEvolutionStone(""), false);
});

test("isEvolutionStone rejects null", () => {
    const service = createService();

    assert.equal(service.isEvolutionStone(null), false);
});

test("isEvolutionStone rejects undefined", () => {
    const service = createService();

    assert.equal(service.isEvolutionStone(undefined), false);
});

test("isEvolutionStone stringifies numeric inputs", () => {
    const service = createService();

    assert.equal(service.isEvolutionStone(123), false);
});

// --------------------------------------------------
// getByType()
// --------------------------------------------------

test("getByType returns an array", () => {
    const service = createService();

    assert.ok(Array.isArray(service.getByType("GRASS")));
});

test("getByType finds Pokémon by their primary type", () => {
    const service = createService();

    assert.ok(
        service.getByType("GRASS").some(
            pokemon => pokemon.name === "BULBASAUR"
        )
    );
});

test("getByType finds Pokémon by their secondary type", () => {
    const service = createService();

    assert.ok(
        service.getByType("POISON").some(
            pokemon => pokemon.name === "BULBASAUR"
        )
    );
});

test("getByType is case-insensitive for the search type", () => {
    const service = createService();

    assert.deepEqual(
        service.getByType("fire").map(pokemon => pokemon.name),
        service.getByType("FIRE").map(pokemon => pokemon.name)
    );
});

test("getByType returns Pokémon matching either type only once", () => {
    const service = createService();

    const results = service.getByType("FIRE");

    assert.equal(
        results.filter(pokemon => pokemon.name === "TYPEMIX").length,
        1
    );
});

test("getByType excludes Pokémon whose types do not match", () => {
    const service = createService();

    assert.equal(
        service.getByType("PSYCHIC").some(
            pokemon => pokemon.name === "BULBASAUR"
        ),
        false
    );
});

test("getByType handles Pokémon without a secondary type", () => {
    const service = createService();

    assert.ok(
        service.getByType("FIRE").some(
            pokemon => pokemon.name === "CHARMANDER"
        )
    );
});

test("getByType handles Pokémon with missing type data", () => {
    const service = createService();

    assert.doesNotThrow(() => service.getByType("NORMAL"));
});

test("getByType returns an empty array when nothing matches", () => {
    const service = createService();

    assert.deepEqual(service.getByType("UNUSED_TYPE"), []);
});

test("getByType preserves database order", () => {
    const service = createService();

    assert.deepEqual(
        service.getByType("NORMAL").map(pokemon => pokemon.name),
        ["ZEROFRIEND", "NEGFRIEND", "TYPEMIX", "EEVEE"]
    );
});

// --------------------------------------------------
// getByAbility()
// --------------------------------------------------

test("getByAbility returns an array", () => {
    const service = createService();

    assert.ok(Array.isArray(service.getByAbility("OVERGROW")));
});

test("getByAbility finds a Pokémon by primary ability", () => {
    const service = createService();

    assert.ok(
        service.getByAbility("OVERGROW").some(
            pokemon => pokemon.name === "BULBASAUR"
        )
    );
});

test("getByAbility finds a Pokémon by secondary ability", () => {
    const service = createService();

    assert.ok(
        service.getByAbility("CHLOROPHYLL").some(
            pokemon => pokemon.name === "BULBASAUR"
        )
    );
});

test("getByAbility uppercases the search value", () => {
    const service = createService();

    assert.deepEqual(
        service.getByAbility("blaze").map(pokemon => pokemon.name),
        service.getByAbility("BLAZE").map(pokemon => pokemon.name)
    );
});

test("getByAbility returns Pokémon matching either ability only once", () => {
    const service = createService();

    const results = service.getByAbility("RUN_AWAY");

    assert.equal(
        results.filter(pokemon => pokemon.name === "TYPEMIX").length,
        1
    );
});

test("getByAbility excludes Pokémon without the requested ability", () => {
    const service = createService();

    assert.equal(
        service.getByAbility("LEVITATE").some(
            pokemon => pokemon.name === "BULBASAUR"
        ),
        false
    );
});

test("getByAbility handles Pokémon without a secondary ability", () => {
    const service = createService();

    assert.ok(
        service.getByAbility("BLAZE").some(
            pokemon => pokemon.name === "CHARMANDER"
        )
    );
});

test("getByAbility handles missing ability data", () => {
    const service = createService();

    assert.doesNotThrow(() => service.getByAbility("OVERGROW"));
});

test("getByAbility returns an empty array when no ability matches", () => {
    const service = createService();

    assert.deepEqual(service.getByAbility("UNUSED_ABILITY"), []);
});

test("getByAbility preserves database order", () => {
    const service = createService();

    assert.deepEqual(
        service.getByAbility("RUN_AWAY").map(pokemon => pokemon.name),
        ["ZEROFRIEND", "NEGFRIEND", "TYPEMIX", "EEVEE"]
    );
});

test("getByAbility uses exact stored ability names", () => {
    const game = `${TEST_GAME}_ability_case`;

    try {
        writeGameFixture(game, [
            {
                name: "CASETEST",
                id: "9001",
                ability1: { name: "Blaze" },
                ability2: null
            }
        ]);

        const service = createService(game);

        assert.deepEqual(service.getByAbility("BLAZE"), []);
    } finally {
        removeGameFixture(game);
    }
});

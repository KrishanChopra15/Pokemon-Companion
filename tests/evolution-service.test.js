"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const EvolutionService = require("../scripts/services/evolution-service");

function createPokemon(overrides = {}) {
    return {
        species: "EEVEE",
        level: 20,
        friendship: 220,
        evolutionHistory: [],
        ...overrides
    };
}

function createDatabase(overrides = {}) {
    return {
        game: "Other",
        getEvolution() {
            return null;
        },
        getEvolutions() {
            return [];
        },
        getPokemon() {
            return null;
        },
        ...overrides
    };
}

function createService(database = createDatabase(), friendship = null) {
    return new EvolutionService(database, friendship);
}

test("constructor stores the database and friendship service", () => {
    const database = createDatabase();
    const friendship = {
        getFriendship: () => 200
    };

    const service = createService(database, friendship);

    assert.equal(service.database, database);
    assert.equal(service.friendship, friendship);
    assert.equal(service.friendshipThreshold, 220);
    assert.equal(service.fireRedNationalDexRequirement, true);
});

test("checkEvolution rejects a missing Pokemon", () => {
    const service = createService();

    assert.deepEqual(service.checkEvolution(null), {
        success: false,
        reason: "Missing Pokemon"
    });
});

test("checkEvolution rejects a Pokemon with no available evolutions", () => {
    const service = createService();

    assert.deepEqual(
        service.checkEvolution(createPokemon()),
        {
            success: false,
            reason: "No evolution available"
        }
    );
});

test("checkEvolution returns the first eligible evolution", () => {
    const database = createDatabase({
        getEvolutions: () => [
            {
                method: "LEVEL",
                value: 16,
                target: "VAPOREON"
            },
            {
                method: "LEVEL",
                value: 25,
                target: "JOLTEON"
            }
        ]
    });

    const service = createService(database);
    const pokemon = createPokemon({ level: 20 });

    const result = service.checkEvolution(pokemon);

    assert.equal(result.success, true);
    assert.equal(result.from, "EEVEE");
    assert.equal(result.to, "VAPOREON");
    assert.equal(pokemon.species, "VAPOREON");
});

test("checkEvolution merges context with evolution target and item", () => {
    const database = createDatabase({
        getEvolutions: () => [
            {
                method: "TRADE",
                value: null,
                target: "GENGAR",
                item: null
            }
        ]
    });

    const service = createService(database);
    const result = service.checkEvolution(
        createPokemon({ species: "HAUNTER" }),
        { traded: true }
    );

    assert.equal(result.success, true);
    assert.equal(result.to, "GENGAR");
});

test("checkEvolution reports unmet requirements", () => {
    const database = createDatabase({
        getEvolutions: () => [
            {
                method: "LEVEL",
                value: 30,
                target: "VAPOREON"
            }
        ]
    });

    const service = createService(database);
    const pokemon = createPokemon({ level: 10 });

    const result = service.checkEvolution(pokemon);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Evolution requirements not met");
    assert.equal(result.pokemon, "EEVEE");
    assert.equal(result.friendship, 220);
    assert.equal(result.evolutions.length, 1);
    assert.equal(pokemon.species, "EEVEE");
});

test("getEvolutionData returns null for a missing Pokemon", () => {
    const service = createService();

    assert.equal(service.getEvolutionData(null), null);
});

test("getEvolutionData returns null when the database is missing", () => {
    const service = createService(null);

    assert.equal(service.getEvolutionData(createPokemon()), null);
});

test("getEvolutionData looks up the Pokemon species", () => {
    let receivedSpecies;

    const database = createDatabase({
        getEvolution(species) {
            receivedSpecies = species;
            return { species };
        }
    });

    const service = createService(database);
    const pokemon = createPokemon();

    assert.deepEqual(service.getEvolutionData(pokemon), {
        species: "EEVEE"
    });
    assert.equal(receivedSpecies, "EEVEE");
});

test("getEvolutions returns an empty array without a database", () => {
    const service = createService(null);

    assert.deepEqual(service.getEvolutions("EEVEE"), []);
});

test("getEvolutions uses the preferred database API", () => {
    let receivedSpecies;

    const evolutions = [
        {
            method: "LEVEL",
            value: 16,
            target: "VAPOREON"
        }
    ];

    const database = createDatabase({
        getEvolutions(species) {
            receivedSpecies = species;
            return evolutions;
        }
    });

    const service = createService(database);

    assert.equal(service.getEvolutions("EEVEE"), evolutions);
    assert.equal(receivedSpecies, "EEVEE");
});

test("getEvolutions falls back to an empty array for a falsy database result", () => {
    const database = createDatabase({
        getEvolutions: () => null
    });

    const service = createService(database);

    assert.deepEqual(service.getEvolutions("EEVEE"), []);
});

test("getEvolutions uses the legacy lookup when getEvolutions is unavailable", () => {
    const evolution = {
        method: "LEVEL",
        value: 16,
        target: "VAPOREON"
    };

    const database = {
        getEvolution: () => evolution
    };

    const service = createService(database);

    assert.deepEqual(service.getEvolutions("EEVEE"), [evolution]);
});

test("getEvolutions returns an empty array when the legacy lookup finds nothing", () => {
    const service = createService({
        getEvolution: () => null
    });

    assert.deepEqual(service.getEvolutions("EEVEE"), []);
});

test("canEvolve rejects a missing Pokemon", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolve(null, "LEVEL", 10),
        {
            allowed: false,
            reason: "Missing Pokemon"
        }
    );
});

test("canEvolve allows a Pokemon at the required level", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolve(createPokemon({ level: 16 }), "LEVEL", 16),
        {
            allowed: true,
            reason: null
        }
    );
});

test("canEvolve allows a Pokemon above the required level", () => {
    const service = createService();

    assert.equal(
        service.canEvolve(createPokemon({ level: 20 }), "LEVEL", 16).allowed,
        true
    );
});

test("canEvolve rejects a Pokemon below the required level", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolve(createPokemon({ level: 15 }), "LEVEL", 16),
        {
            allowed: false,
            reason: "Requires level 16"
        }
    );
});

test("canEvolve rejects an invalid level requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolve(createPokemon(), "LEVEL", "invalid"),
        {
            allowed: false,
            reason: "Invalid level requirement"
        }
    );
});

test("canEvolve rejects a Pokemon with an invalid level", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolve(createPokemon({ level: "invalid" }), "LEVEL", 10),
        {
            allowed: false,
            reason: "Invalid Pokemon level"
        }
    );
});

test("canEvolve accepts a numeric-string level requirement", () => {
    const service = createService();

    assert.equal(
        service.canEvolve(createPokemon({ level: 20 }), "LEVEL", "18").allowed,
        true
    );
});

test("canEvolve delegates evolution-stone requirements", () => {
    const service = createService();

    const result = service.canEvolve(
        createPokemon(),
        "EVOLUTION_STONE",
        "FIRE_STONE",
        { items: ["FIRE_STONE"] }
    );

    assert.equal(result.allowed, true);
    assert.equal(result.reason, null);
});

test("canEvolve delegates generic item requirements", () => {
    const service = createService();

    const result = service.canEvolve(
        createPokemon(),
        "ITEM",
        "SPECIAL_ITEM",
        { items: ["SPECIAL_ITEM"] }
    );

    assert.equal(result.allowed, true);
});

test("canEvolve delegates friendship requirements", () => {
    const service = createService();

    const result = service.canEvolve(
        createPokemon({ friendship: 200 }),
        "FRIENDSHIP",
        200,
        { levelUp: true }
    );

    assert.equal(result.allowed, true);
});

test("canEvolve delegates daytime friendship requirements", () => {
    const service = createService();

    const result = service.canEvolve(
        createPokemon(),
        "FRIENDSHIP_DAY",
        220,
        { levelUp: true, time: "DAY" }
    );

    assert.equal(result.allowed, true);
});

test("canEvolve delegates nighttime friendship requirements", () => {
    const service = createService();

    const result = service.canEvolve(
        createPokemon(),
        "FRIENDSHIP_NIGHT",
        220,
        { levelUp: true, time: "NIGHT" }
    );

    assert.equal(result.allowed, true);
});

test("canEvolve requires explicit trade confirmation", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolve(createPokemon(), "TRADE"),
        {
            allowed: false,
            reason: "Trade required"
        }
    );
});

test("canEvolve allows trade when context confirms it", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolve(createPokemon(), "TRADE", null, {
            traded: true
        }),
        {
            allowed: true,
            reason: null
        }
    );
});

test("canEvolve delegates trade-item requirements", () => {
    const service = createService();

    const result = service.canEvolve(
        createPokemon(),
        "TRADE_ITEM",
        "METAL_COAT",
        {
            traded: true,
            items: ["METAL_COAT"]
        }
    );

    assert.equal(result.allowed, true);
});

test("canEvolve rejects an unknown evolution method", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolve(createPokemon(), "UNKNOWN", null),
        {
            allowed: false,
            reason: "Unknown evolution method"
        }
    );
});

test("canEvolveByItem rejects a missing item", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolveByItem(createPokemon(), null),
        {
            allowed: false,
            reason: "Missing evolution item"
        }
    );
});

test("canEvolveByItem reports a missing evolution stone", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolveByItem(
            createPokemon(),
            null,
            {},
            true
        ),
        {
            allowed: false,
            reason: "Missing evolution stone"
        }
    );
});

test("canEvolveByItem allows a matching item", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolveByItem(
            createPokemon(),
            "POTION",
            { items: ["POTION"] }
        ),
        {
            allowed: true,
            reason: null
        }
    );
});

test("canEvolveByItem matches item names case-insensitively", () => {
    const service = createService();

    assert.equal(
        service.canEvolveByItem(
            createPokemon(),
            "FIRE_STONE",
            { items: ["fire_stone"] },
            true
        ).allowed,
        true
    );
});

test("canEvolveByItem rejects an item absent from inventory", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolveByItem(
            createPokemon(),
            "WATER_STONE",
            { items: ["FIRE_STONE"] },
            true
        ),
        {
            allowed: false,
            reason: "Missing evolution stone: WATER_STONE"
        }
    );
});

test("canEvolveByFriendship requires a level-up trigger", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolveByFriendship(
            createPokemon(),
            220,
            {}
        ),
        {
            allowed: false,
            reason: "Friendship evolution requires a level-up"
        }
    );
});

test("canEvolveByFriendship accepts the LEVEL_UP trigger", () => {
    const service = createService();

    const result = service.canEvolveByFriendship(
        createPokemon({ friendship: 220 }),
        220,
        { trigger: "LEVEL_UP" }
    );

    assert.equal(result.allowed, true);
});

test("canEvolveByFriendship accepts the evolutionTrigger alias", () => {
    const service = createService();

    const result = service.canEvolveByFriendship(
        createPokemon({ friendship: 220 }),
        220,
        { evolutionTrigger: "LEVEL_UP" }
    );

    assert.equal(result.allowed, true);
});

test("canEvolveByFriendship uses the default threshold for invalid values", () => {
    const service = createService();

    const result = service.canEvolveByFriendship(
        createPokemon({ friendship: 219 }),
        "invalid",
        { levelUp: true }
    );

    assert.equal(result.allowed, false);
    assert.equal(result.requiredFriendship, 220);
    assert.equal(result.reason, "Requires friendship 220");
});

test("canEvolveByFriendship rejects friendship below the threshold", () => {
    const service = createService();

    const result = service.canEvolveByFriendship(
        createPokemon({ friendship: 219 }),
        220,
        { levelUp: true }
    );

    assert.equal(result.allowed, false);
    assert.equal(result.friendship, 219);
    assert.equal(result.requiredFriendship, 220);
});

test("canEvolveByFriendship allows friendship at the threshold", () => {
    const service = createService();

    const result = service.canEvolveByFriendship(
        createPokemon({ friendship: 220 }),
        220,
        { levelUp: true }
    );

    assert.equal(result.allowed, true);
    assert.equal(result.friendship, 220);
});

test("canEvolveByFriendship rejects a mismatched time of day", () => {
    const service = createService();

    const result = service.canEvolveByFriendship(
        createPokemon(),
        220,
        { levelUp: true, time: "NIGHT" },
        "DAY"
    );

    assert.equal(result.allowed, false);
    assert.equal(result.reason, "Friendship evolution requires day");
});

test("canEvolveByTradeItem requires a confirmed trade", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolveByTradeItem(
            createPokemon(),
            "METAL_COAT",
            { items: ["METAL_COAT"] }
        ),
        {
            allowed: false,
            reason: "Trade required"
        }
    );
});

test("canEvolveByTradeItem rejects a missing item requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolveByTradeItem(
            createPokemon(),
            null,
            { traded: true, items: [] }
        ),
        {
            allowed: false,
            reason: "Missing trade evolution item"
        }
    );
});

test("canEvolveByTradeItem allows a trade with the required item", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolveByTradeItem(
            createPokemon(),
            "METAL_COAT",
            { traded: true, items: ["METAL_COAT"] }
        ),
        {
            allowed: true,
            reason: null
        }
    );
});

test("canEvolveByTradeItem rejects a trade without the required item", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolveByTradeItem(
            createPokemon(),
            "METAL_COAT",
            { traded: true, items: [] }
        ),
        {
            allowed: false,
            reason: "Missing trade evolution item: METAL_COAT"
        }
    );
});

test("evolve rejects a missing Pokemon", () => {
    const service = createService();

    assert.deepEqual(service.evolve(null, {}), {
        success: false,
        reason: "Missing Pokemon"
    });
});

test("evolve rejects missing evolution data", () => {
    const service = createService();

    assert.deepEqual(
        service.evolve(createPokemon(), null),
        {
            success: false,
            reason: "Missing evolution data"
        }
    );
});

test("evolve rejects unmet requirements without changing species", () => {
    const service = createService();
    const pokemon = createPokemon({ level: 5 });

    const result = service.evolve(pokemon, {
        method: "LEVEL",
        value: 16,
        target: "VAPOREON"
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Requires level 16");
    assert.equal(pokemon.species, "EEVEE");
});

test("evolve changes species and records evolution history", () => {
    const service = createService();
    const pokemon = createPokemon({ level: 20 });

    const result = service.evolve(pokemon, {
        method: "LEVEL",
        value: 16,
        target: "VAPOREON"
    });

    assert.equal(result.success, true);
    assert.equal(result.from, "EEVEE");
    assert.equal(result.to, "VAPOREON");
    assert.equal(pokemon.species, "VAPOREON");
    assert.equal(pokemon.evolutionHistory.length, 1);
    assert.equal(pokemon.evolutionHistory[0].from, "EEVEE");
    assert.equal(pokemon.evolutionHistory[0].to, "VAPOREON");
    assert.equal(pokemon.evolutionHistory[0].method, "LEVEL");
    assert.equal(typeof pokemon.evolutionHistory[0].date, "string");
});

test("evolve initializes a missing evolution history array", () => {
    const service = createService();
    const pokemon = createPokemon({ evolutionHistory: null });

    const result = service.evolve(pokemon, {
        method: "LEVEL",
        value: 16,
        target: "VAPOREON"
    });

    assert.equal(result.success, true);
    assert.equal(pokemon.evolutionHistory.length, 1);
});

test("evolve records null when the Pokemon level is zero", () => {
    const service = createService();
    const pokemon = createPokemon({ level: 0 });

    service.evolve(pokemon, {
        method: "LEVEL",
        value: 0,
        target: "VAPOREON"
    });

    assert.equal(pokemon.evolutionHistory[0].level, null);
});

test("evolve consumes an evolution item from inventory", () => {
    const service = createService();
    const pokemon = createPokemon();
    const items = ["FIRE_STONE", "POTION"];

    const result = service.evolve(pokemon, {
        method: "EVOLUTION_STONE",
        value: "FIRE_STONE",
        item: "FIRE_STONE",
        target: "FLAREON",
        context: {
            items
        }
    });

    assert.equal(result.success, true);
    assert.deepEqual(items, ["POTION"]);
    assert.equal(result.item, "ITEM_FIRE_STONE");
    assert.equal(pokemon.evolutionHistory[0].item, "ITEM_FIRE_STONE");
});

test("evolve fails when the evolution item inventory is unavailable", () => {
    const service = createService();
    const pokemon = createPokemon();

    const result = service.evolve(pokemon, {
        method: "ITEM",
        value: "SPECIAL_ITEM",
        item: "SPECIAL_ITEM",
        target: "VAPOREON",
        context: {}
    });

    assert.equal(result.success, false);
    assert.equal(result.reason, "Missing evolution item: SPECIAL_ITEM");
    assert.equal(pokemon.species, "EEVEE");
});

test("evolve does not consume an item when consumption is disabled", () => {
    const service = createService();
    const pokemon = createPokemon();
    const items = ["FIRE_STONE"];

    const result = service.evolve(pokemon, {
        method: "EVOLUTION_STONE",
        value: "FIRE_STONE",
        item: "FIRE_STONE",
        target: "FLAREON",
        context: {
            items,
            consumeItem: false
        }
    });

    assert.equal(result.success, true);
    assert.deepEqual(items, ["FIRE_STONE"]);
    assert.equal(result.item, "ITEM_FIRE_STONE");
});

test("evolveByLevel evolves when the level requirement is met", () => {
    const service = createService();
    const pokemon = createPokemon({ level: 16 });

    const result = service.evolveByLevel(
        pokemon,
        "VAPOREON",
        16
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.species, "VAPOREON");
});

test("evolveByItem normalizes item names and consumes a stone", () => {
    const service = createService();
    const pokemon = createPokemon();
    const items = ["ITEM_WATER_STONE"];

    const result = service.evolveByItem(
        pokemon,
        "VAPOREON",
        "water_stone",
        items
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.species, "VAPOREON");
    assert.deepEqual(items, []);
    assert.equal(result.item, "ITEM_WATER_STONE");
});

test("evolveByTrade requires trade confirmation", () => {
    const service = createService();
    const pokemon = createPokemon({ species: "HAUNTER" });

    const result = service.evolveByTrade(
        pokemon,
        "GENGAR"
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Trade required");
    assert.equal(pokemon.species, "HAUNTER");
});

test("evolveByTrade evolves when trade is confirmed", () => {
    const service = createService();
    const pokemon = createPokemon({ species: "HAUNTER" });

    const result = service.evolveByTrade(
        pokemon,
        "GENGAR",
        true
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.species, "GENGAR");
});

test("evolveByFriendship uses the default threshold", () => {
    const service = createService();
    const pokemon = createPokemon({ species: "EEVEE", friendship: 220 });

    const result = service.evolveByFriendship(
        pokemon,
        "ESPEON"
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.species, "ESPEON");
});

test("evolveByFriendshipDay supplies the DAY requirement", () => {
    const service = createService();
    const pokemon = createPokemon({ friendship: 220 });

    const result = service.evolveByFriendshipDay(
        pokemon,
        "ESPEON"
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.species, "ESPEON");
});

test("evolveByFriendshipNight supplies the NIGHT requirement", () => {
    const service = createService();
    const pokemon = createPokemon({ friendship: 220 });

    const result = service.evolveByFriendshipNight(
        pokemon,
        "UMBREON"
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.species, "UMBREON");
});

test("getEvolution returns null without a database", () => {
    const service = createService(null);

    assert.equal(service.getEvolution("EEVEE"), null);
});

test("getEvolution rejects non-string species", () => {
    const service = createService();

    assert.equal(service.getEvolution(null), null);
    assert.equal(service.getEvolution(undefined), null);
    assert.equal(service.getEvolution(25), null);
});

test("getEvolution uppercases species before lookup", () => {
    let receivedSpecies;

    const service = createService({
        getEvolution(species) {
            receivedSpecies = species;
            return { species };
        }
    });

    service.getEvolution("eevee");

    assert.equal(receivedSpecies, "EEVEE");
});

test("getEvolution removes the SPECIES_ prefix", () => {
    let receivedSpecies;

    const service = createService({
        getEvolution(species) {
            receivedSpecies = species;
            return { species };
        }
    });

    service.getEvolution("SPECIES_EEVEE");

    assert.equal(receivedSpecies, "EEVEE");
});

test("getFriendship uses the friendship service when available", () => {
    let receivedPokemon;
    const pokemon = createPokemon();

    const service = createService(createDatabase(), {
        getFriendship(value) {
            receivedPokemon = value;
            return 180;
        }
    });

    assert.equal(service.getFriendship(pokemon), 180);
    assert.equal(receivedPokemon, pokemon);
});

test("getFriendship clamps values to the range zero through 255", () => {
    const service = createService();

    assert.equal(service.getFriendship(createPokemon({ friendship: -10 })), 0);
    assert.equal(service.getFriendship(createPokemon({ friendship: 300 })), 255);
});

test("getFriendship floors fractional values", () => {
    const service = createService();

    assert.equal(
        service.getFriendship(createPokemon({ friendship: 123.9 })),
        123
    );
});

test("getFriendship defaults to 70 for invalid friendship", () => {
    const service = createService();

    assert.equal(
        service.getFriendship(createPokemon({ friendship: "invalid" })),
        70
    );

    assert.equal(
        service.getFriendship(createPokemon({ friendship: undefined })),
        70
    );
});

test("isFireRed detects FireRed case-insensitively", () => {
    const service = createService(createDatabase({ game: "FireRed" }));

    assert.equal(service.isFireRed(), true);
});

test("isFireRed returns false for another game", () => {
    const service = createService(createDatabase({ game: "Emerald" }));

    assert.equal(service.isFireRed(), false);
});

test("isFireRed returns false without string game metadata", () => {
    const service = createService(createDatabase({ game: null }));

    assert.equal(service.isFireRed(), false);
});

test("fireRedRequiresNationalDex accepts explicit National Dex ownership", () => {
    const service = createService(createDatabase({ game: "FireRed" }));

    assert.equal(
        service.fireRedRequiresNationalDex(
            createPokemon(),
            { nationalDex: true }
        ),
        false
    );

    assert.equal(
        service.fireRedRequiresNationalDex(
            createPokemon(),
            { hasNationalDex: true }
        ),
        false
    );
});

test("fireRedRequiresNationalDex rejects evolution when National Dex is explicitly absent", () => {
    const service = createService(createDatabase({ game: "FireRed" }));

    assert.equal(
        service.fireRedRequiresNationalDex(
            createPokemon(),
            { nationalDex: false }
        ),
        true
    );

    assert.equal(
        service.fireRedRequiresNationalDex(
            createPokemon(),
            { hasNationalDex: false }
        ),
        true
    );
});

test("fireRedRequiresNationalDex checks target National Dex number", () => {
    const service = createService(
        createDatabase({
            game: "FireRed",
            getPokemon: () => ({ nationalDexNumber: 196 })
        })
    );

    assert.equal(
        service.fireRedRequiresNationalDex(
            createPokemon(),
            { target: "ESPEON" }
        ),
        true
    );
});

test("fireRedRequiresNationalDex does not restrict targets in the first 151", () => {
    const service = createService(
        createDatabase({
            game: "FireRed",
            getPokemon: () => ({ nationalDexNumber: 133 })
        })
    );

    assert.equal(
        service.fireRedRequiresNationalDex(
            createPokemon(),
            { target: "EEVEE" }
        ),
        false
    );
});

test("fireRedRequiresNationalDex returns false when the target is missing", () => {
    const service = createService(createDatabase({ game: "FireRed" }));

    assert.equal(
        service.fireRedRequiresNationalDex(createPokemon(), {}),
        false
    );
});

test("getNationalDexNumber returns null without a database or species", () => {
    assert.equal(createService(null).getNationalDexNumber("EEVEE"), null);
    assert.equal(createService().getNationalDexNumber(null), null);
});

test("getNationalDexNumber returns null without getPokemon", () => {
    const service = createService({});

    assert.equal(service.getNationalDexNumber("EEVEE"), null);
});

test("getNationalDexNumber supports nationalDexNumber", () => {
    const service = createService(
        createDatabase({
            getPokemon: () => ({ nationalDexNumber: 25 })
        })
    );

    assert.equal(service.getNationalDexNumber("PIKACHU"), 25);
});

test("getNationalDexNumber falls back to dexNumber and id", () => {
    const service = createService(
        createDatabase({
            getPokemon: () => ({ dexNumber: "133" })
        })
    );

    assert.equal(service.getNationalDexNumber("EEVEE"), 133);

    const fallbackService = createService(
        createDatabase({
            getPokemon: () => ({ id: 6 })
        })
    );

    assert.equal(fallbackService.getNationalDexNumber("CHARIZARD"), 6);
});

test("getNationalDexNumber returns null for invalid records", () => {
    const service = createService(
        createDatabase({
            getPokemon: () => ({ nationalDexNumber: "invalid" })
        })
    );

    assert.equal(service.getNationalDexNumber("UNKNOWN"), null);
});

test("matchesTimeOfDay rejects missing actual time", () => {
    const service = createService();

    assert.equal(service.matchesTimeOfDay(null, "DAY"), false);
    assert.equal(service.matchesTimeOfDay("", "DAY"), false);
});

test("matchesTimeOfDay compares normalized time strings", () => {
    const service = createService();

    assert.equal(service.matchesTimeOfDay(" day ", "DAY"), true);
    assert.equal(service.matchesTimeOfDay("night", "NIGHT"), true);
    assert.equal(service.matchesTimeOfDay("DAY", "NIGHT"), false);
});

test("normalizeItem returns null for missing values", () => {
    const service = createService();

    assert.equal(service.normalizeItem(null), null);
    assert.equal(service.normalizeItem(undefined), null);
    assert.equal(service.normalizeItem(""), null);
});

test("normalizeItem adds the ITEM_ prefix", () => {
    const service = createService();

    assert.equal(service.normalizeItem("fire_stone"), "ITEM_FIRE_STONE");
});

test("normalizeItem preserves an existing prefix", () => {
    const service = createService();

    assert.equal(
        service.normalizeItem("item_fire_stone"),
        "ITEM_FIRE_STONE"
    );
});

test("normalizeItem trims whitespace and normalizes case", () => {
    const service = createService();

    assert.equal(
        service.normalizeItem("  Water_Stone "),
        "ITEM_WATER_STONE"
    );
});

test("itemsMatch compares normalized item names", () => {
    const service = createService();

    assert.equal(service.itemsMatch("FIRE_STONE", "ITEM_FIRE_STONE"), true);
    assert.equal(service.itemsMatch("water_stone", "WATER_STONE"), true);
    assert.equal(service.itemsMatch("FIRE_STONE", "WATER_STONE"), false);
});

test("itemsMatch treats two missing item values as equal", () => {
    const service = createService();

    assert.equal(service.itemsMatch(null, undefined), true);
});

test("isEvolutionStone recognizes supported evolution stones", () => {
    const service = createService();

    for (const stone of [
        "FIRE_STONE",
        "THUNDER_STONE",
        "WATER_STONE",
        "LEAF_STONE",
        "MOON_STONE",
        "SUN_STONE"
    ]) {
        assert.equal(service.isEvolutionStone(stone), true, stone);
    }
});

test("isEvolutionStone rejects non-stones and missing values", () => {
    const service = createService();

    assert.equal(service.isEvolutionStone("POTION"), false);
    assert.equal(service.isEvolutionStone(null), false);
    assert.equal(service.isEvolutionStone(""), false);
});

test("consumeEvolutionItem rejects a missing item", () => {
    const service = createService();

    assert.deepEqual(service.consumeEvolutionItem(null), {
        success: false,
        reason: "Missing evolution item"
    });
});

test("consumeEvolutionItem succeeds without consuming when disabled", () => {
    const service = createService();

    assert.deepEqual(
        service.consumeEvolutionItem("FIRE_STONE", {
            consumeItem: false
        }),
        {
            success: true,
            item: "ITEM_FIRE_STONE",
            consumed: false
        }
    );
});

test("consumeEvolutionItem requires an inventory array", () => {
    const service = createService();

    assert.deepEqual(
        service.consumeEvolutionItem("FIRE_STONE", {}),
        {
            success: false,
            reason: "Evolution item inventory unavailable"
        }
    );
});

test("consumeEvolutionItem removes a matching inventory item", () => {
    const service = createService();
    const items = ["POTION", "FIRE_STONE", "WATER_STONE"];

    assert.deepEqual(
        service.consumeEvolutionItem("FIRE_STONE", { items }),
        {
            success: true,
            item: "ITEM_FIRE_STONE",
            consumed: true
        }
    );

    assert.deepEqual(items, ["POTION", "WATER_STONE"]);
});

test("consumeEvolutionItem matches inventory names without prefixes", () => {
    const service = createService();
    const items = ["fire_stone"];

    const result = service.consumeEvolutionItem("ITEM_FIRE_STONE", {
        items
    });

    assert.equal(result.success, true);
    assert.deepEqual(items, []);
});

test("consumeEvolutionItem does not remove anything when the item is absent", () => {
    const service = createService();
    const items = ["POTION"];

    assert.deepEqual(
        service.consumeEvolutionItem("FIRE_STONE", { items }),
        {
            success: false,
            reason: "Missing evolution item: ITEM_FIRE_STONE"
        }
    );

    assert.deepEqual(items, ["POTION"]);
});
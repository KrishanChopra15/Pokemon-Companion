"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const PokemonAvailabilityService = require(
    "../scripts/services/pokemon-availability-service"
);

const BULBASAUR = {
    name: "Bulbasaur",
    constant: "SPECIES_BULBASAUR"
};

const CHARMANDER = {
    name: "Charmander",
    constant: "SPECIES_CHARMANDER"
};

const SQUIRTLE = {
    name: "Squirtle",
    constant: "SPECIES_SQUIRTLE"
};

function createPokemonDatabase(records) {
    const data = records || {
        BULBASAUR,
        CHARMANDER,
        SQUIRTLE
    };

    return {
        getPokemon(species) {
            return Object.prototype.hasOwnProperty.call(data, species)
                ? data[species]
                : null;
        }
    };
}

function createService(options = {}) {
    const pokemonDatabase =
        Object.prototype.hasOwnProperty.call(options, "pokemonDatabase")
            ? options.pokemonDatabase
            : createPokemonDatabase();

    return new PokemonAvailabilityService(
        pokemonDatabase,
        options.locationDatabase ?? null,
        options.evolutionService ?? null,
        options.availabilityDatabase ?? null,
        options.progressionRules ?? null,
        options.pokemonRestrictions ?? null
    );
}

function createEvolutionService(result) {
    return {
        getEvolutionSource(constant) {
            return result;
        }
    };
}

function createLevelEvolution(level) {
    return {
        requirement: {
            method: "LEVEL",
            level
        }
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a PokemonAvailabilityService instance", () => {
    assert.ok(createService() instanceof PokemonAvailabilityService);
});

test("constructor stores the Pokémon database", () => {
    const database = createPokemonDatabase();

    const service = new PokemonAvailabilityService(database);

    assert.equal(service.pokemonDatabase, database);
});

test("constructor preserves the Pokémon database reference", () => {
    const database = createPokemonDatabase();

    const service = new PokemonAvailabilityService(database);

    assert.strictEqual(service.pokemonDatabase, database);
});

test("constructor defaults location database to null", () => {
    const service = new PokemonAvailabilityService(
        createPokemonDatabase()
    );

    assert.equal(service.locationDatabase, null);
});

test("constructor stores the location database", () => {
    const locations = {
        getPokemon() {
            return [];
        }
    };

    const service = new PokemonAvailabilityService(
        createPokemonDatabase(),
        locations
    );

    assert.strictEqual(service.locationDatabase, locations);
});

test("constructor defaults evolution service to null", () => {
    const service = new PokemonAvailabilityService(
        createPokemonDatabase()
    );

    assert.equal(service.evolution, null);
});

test("constructor stores the evolution service", () => {
    const evolution = createEvolutionService(null);

    const service = new PokemonAvailabilityService(
        createPokemonDatabase(),
        null,
        evolution
    );

    assert.strictEqual(service.evolution, evolution);
});

test("constructor defaults availability database to null", () => {
    const service = new PokemonAvailabilityService(
        createPokemonDatabase()
    );

    assert.equal(service.availabilityDatabase, null);
});

test("constructor stores the availability database", () => {
    const availabilityDatabase = { example: true };

    const service = new PokemonAvailabilityService(
        createPokemonDatabase(),
        null,
        null,
        availabilityDatabase
    );

    assert.strictEqual(
        service.availabilityDatabase,
        availabilityDatabase
    );
});

test("constructor defaults progression rules to an empty object", () => {
    const service = new PokemonAvailabilityService(
        createPokemonDatabase(),
        null,
        null,
        null,
        null
    );

    assert.deepEqual(service.rules, {});
});

test("constructor stores progression rules", () => {
    const rules = {
        GYM_1: {
            recommendedLevel: 10,
            maxReasonableLevel: 20
        }
    };

    const service = new PokemonAvailabilityService(
        createPokemonDatabase(),
        null,
        null,
        null,
        rules
    );

    assert.strictEqual(service.rules, rules);
});

test("constructor defaults Pokémon restrictions to an empty object", () => {
    const service = new PokemonAvailabilityService(
        createPokemonDatabase(),
        null,
        null,
        null,
        {},
        null
    );

    assert.deepEqual(service.restrictions, {});
});

test("constructor stores Pokémon restrictions", () => {
    const restrictions = {
        MEWTWO: {
            availableAfter: "POST_GAME"
        }
    };

    const service = new PokemonAvailabilityService(
        createPokemonDatabase(),
        null,
        null,
        null,
        {},
        restrictions
    );

    assert.strictEqual(service.restrictions, restrictions);
});

test("constructor replaces false progression rules with an empty object", () => {
    const service = new PokemonAvailabilityService(
        createPokemonDatabase(),
        null,
        null,
        null,
        false
    );

    assert.deepEqual(service.rules, {});
});

test("constructor replaces false Pokémon restrictions with an empty object", () => {
    const service = new PokemonAvailabilityService(
        createPokemonDatabase(),
        null,
        null,
        null,
        {},
        false
    );

    assert.deepEqual(service.restrictions, {});
});

// --------------------------------------------------
// getPokemon()
// --------------------------------------------------

test("getPokemon delegates to the Pokémon database", () => {
    const calls = [];

    const database = {
        getPokemon(species) {
            calls.push(species);
            return BULBASAUR;
        }
    };

    const service = createService({
        pokemonDatabase: database
    });

    assert.strictEqual(service.getPokemon("BULBASAUR"), BULBASAUR);
    assert.deepEqual(calls, ["BULBASAUR"]);
});

test("getPokemon returns the database result", () => {
    const service = createService();

    assert.strictEqual(service.getPokemon("BULBASAUR"), BULBASAUR);
});

test("getPokemon returns null when the species is unknown", () => {
    const service = createService();

    assert.equal(service.getPokemon("UNKNOWN"), null);
});

test("getPokemon returns null when no Pokémon database exists", () => {
    const service = createService({
        pokemonDatabase: null
    });

    assert.equal(service.getPokemon("BULBASAUR"), null);
});

test("getPokemon passes a SPECIES_ constant unchanged to the database", () => {
    const calls = [];

    const service = createService({
        pokemonDatabase: {
            getPokemon(species) {
                calls.push(species);
                return BULBASAUR;
            }
        }
    });

    service.getPokemon("SPECIES_BULBASAUR");

    assert.deepEqual(calls, ["SPECIES_BULBASAUR"]);
});

// --------------------------------------------------
// isAvailable()
// --------------------------------------------------

test("isAvailable reports a missing Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.isAvailable("MISSING"),
        {
            available: false,
            status: "ERROR",
            reason: "Pokemon not found"
        }
    );
});

test("isAvailable reports a missing Pokémon when the database is absent", () => {
    const service = createService({
        pokemonDatabase: null
    });

    assert.deepEqual(
        service.isAvailable("BULBASAUR"),
        {
            available: false,
            status: "ERROR",
            reason: "Pokemon not found"
        }
    );
});

test("isAvailable allows a known Pokémon by default", () => {
    const service = createService();

    assert.deepEqual(
        service.isAvailable("BULBASAUR"),
        {
            available: true,
            status: "AVAILABLE",
            species: "Bulbasaur",
            constant: "SPECIES_BULBASAUR",
            difficulty: "NORMAL",
            warning: null,
            source: "NORMAL"
        }
    );
});

test("isAvailable returns the Pokémon name", () => {
    const service = createService();

    assert.equal(
        service.isAvailable("CHARMANDER").species,
        "Charmander"
    );
});

test("isAvailable returns the Pokémon constant", () => {
    const service = createService();

    assert.equal(
        service.isAvailable("SQUIRTLE").constant,
        "SPECIES_SQUIRTLE"
    );
});

test("isAvailable defaults difficulty to NORMAL", () => {
    const service = createService();

    assert.equal(
        service.isAvailable("BULBASAUR").difficulty,
        "NORMAL"
    );
});

test("isAvailable defaults warning to null", () => {
    const service = createService();

    assert.equal(
        service.isAvailable("BULBASAUR").warning,
        null
    );
});

test("isAvailable reports the NORMAL source for regular availability", () => {
    const service = createService();

    assert.equal(
        service.isAvailable("BULBASAUR").source,
        "NORMAL"
    );
});

test("isAvailable does not mutate the Pokémon record", () => {
    const pokemon = {
        name: "Bulbasaur",
        constant: "SPECIES_BULBASAUR"
    };

    const service = createService({
        pokemonDatabase: createPokemonDatabase({
            BULBASAUR: pokemon
        })
    });

    service.isAvailable("BULBASAUR");

    assert.deepEqual(pokemon, {
        name: "Bulbasaur",
        constant: "SPECIES_BULBASAUR"
    });
});

test("isAvailable ignores restrictions when no matching rule exists", () => {
    const service = createService({
        pokemonRestrictions: {
            CHARMANDER: {
                availableAfter: "POST_GAME",
                reason: "Post-game only"
            }
        }
    });

    assert.equal(
        service.isAvailable("BULBASAUR").available,
        true
    );
});

test("isAvailable rejects a Pokémon locked by its progression rule", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                availableAfter: "POST_GAME",
                reason: "Available after the main story"
            }
        }
    });

    assert.deepEqual(
        service.isAvailable("BULBASAUR", {
            progression: "GYM_1"
        }),
        {
            available: false,
            status: "LOCKED",
            difficulty: "LOCKED",
            reason: "Available after the main story"
        }
    );
});

test("isAvailable unlocks a Pokémon at the required progression", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                availableAfter: "POST_GAME",
                reason: "Available after the main story"
            }
        }
    });

    assert.equal(
        service.isAvailable("BULBASAUR", {
            progression: "POST_GAME"
        }).available,
        true
    );
});

test("isAvailable checks location after official restrictions", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                availableAfter: "POST_GAME",
                reason: "Locked"
            }
        },
        locationDatabase: {
            getPokemon() {
                throw new Error("Location should not be checked");
            }
        }
    });

    assert.equal(
        service.isAvailable("BULBASAUR", {
            progression: "GYM_1",
            location: "ROUTE_1"
        }).status,
        "LOCKED"
    );
});

test("isAvailable checks difficulty after location availability", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                return [];
            }
        },
        evolutionService: {
            getEvolutionSource() {
                throw new Error("Difficulty should not be calculated");
            }
        }
    });

    assert.deepEqual(
        service.isAvailable("BULBASAUR", {
            location: "ROUTE_1",
            progression: "GYM_1"
        }),
        {
            available: false,
            status: "LOCKED"
        }
    );
});

test("isAvailable skips location checks when location is missing", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                throw new Error("Location lookup should be skipped");
            }
        }
    });

    assert.equal(
        service.isAvailable("BULBASAUR").available,
        true
    );
});

test("isAvailable skips location checks when location is an empty string", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                throw new Error("Location lookup should be skipped");
            }
        }
    });

    assert.equal(
        service.isAvailable("BULBASAUR", {
            location: ""
        }).available,
        true
    );
});

test("isAvailable uses the TRADE override before official restrictions", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                availableAfter: "POST_GAME",
                reason: "Normally locked"
            }
        }
    });

    const result = service.isAvailable("BULBASAUR", {
        source: "TRADE",
        progression: "GYM_1"
    });

    assert.equal(result.available, true);
    assert.equal(result.source, "TRADE");
    assert.equal(result.difficulty, "TRADE");
});

test("isAvailable applies TRADE override before location checking", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                throw new Error("Trade should bypass location checking");
            }
        }
    });

    assert.equal(
        service.isAvailable("BULBASAUR", {
            source: "TRADE",
            location: "ROUTE_1"
        }).source,
        "TRADE"
    );
});

test("isAvailable does not apply the TRADE override to lowercase trade source", () => {
    const service = createService();

    const result = service.isAvailable("BULBASAUR", {
        source: "trade"
    });

    assert.equal(result.source, "NORMAL");
});

test("isAvailable returns an error before applying a trade override to an unknown Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.isAvailable("MISSING", {
            source: "TRADE"
        }),
        {
            available: false,
            status: "ERROR",
            reason: "Pokemon not found"
        }
    );
});

test("isAvailable treats an undefined context as the default context", () => {
    const service = createService();

    assert.equal(
        service.isAvailable("BULBASAUR", undefined).available,
        true
    );
});

// --------------------------------------------------
// checkOfficialRestriction()
// --------------------------------------------------

test("checkOfficialRestriction allows species without a rule", () => {
    const service = createService();

    assert.deepEqual(
        service.checkOfficialRestriction("BULBASAUR", {}),
        { available: true }
    );
});

test("checkOfficialRestriction allows a null rule", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: null
        }
    });

    assert.deepEqual(
        service.checkOfficialRestriction("BULBASAUR", {}),
        { available: true }
    );
});

test("checkOfficialRestriction allows a rule without restrictions", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {}
        }
    });

    assert.deepEqual(
        service.checkOfficialRestriction("BULBASAUR", {}),
        { available: true }
    );
});

test("checkOfficialRestriction locks when progression is missing", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                availableAfter: "POST_GAME",
                reason: "Post-game only"
            }
        }
    });

    assert.deepEqual(
        service.checkOfficialRestriction("BULBASAUR", {}),
        {
            available: false,
            status: "LOCKED",
            difficulty: "LOCKED",
            reason: "Post-game only"
        }
    );
});

test("checkOfficialRestriction locks at the wrong progression", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                availableAfter: "GYM_8",
                reason: "Late-game Pokémon"
            }
        }
    });

    assert.equal(
        service.checkOfficialRestriction("BULBASAUR", {
            progression: "GYM_7"
        }).status,
        "LOCKED"
    );
});

test("checkOfficialRestriction unlocks at an exact progression match", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                availableAfter: "GYM_8",
                reason: "Late-game Pokémon"
            }
        }
    });

    assert.deepEqual(
        service.checkOfficialRestriction("BULBASAUR", {
            progression: "GYM_8"
        }),
        { available: true }
    );
});

test("checkOfficialRestriction does not lock when availableAfter is empty", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                availableAfter: "",
                reason: "Unused restriction"
            }
        }
    });

    assert.deepEqual(
        service.checkOfficialRestriction("BULBASAUR", {}),
        { available: true }
    );
});

test("checkOfficialRestriction checks requirements after progression unlock", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                availableAfter: "POST_GAME",
                requirements: ["NATIONAL_DEX"],
                reason: "Locked"
            }
        }
    });

    assert.deepEqual(
        service.checkOfficialRestriction("BULBASAUR", {
            progression: "POST_GAME"
        }),
        {
            available: false,
            status: "LOCKED",
            difficulty: "LOCKED",
            reason: "Locked",
            missingRequirements: ["NATIONAL_DEX"]
        }
    );
});

test("checkOfficialRestriction returns the missing requirements", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                requirements: [
                    "CHAMPION_DEFEATED",
                    "NATIONAL_DEX"
                ],
                reason: "Requirements not met"
            }
        }
    });

    const result = service.checkOfficialRestriction(
        "BULBASAUR",
        { progression: "GYM_8" }
    );

    assert.deepEqual(result.missingRequirements, [
        "CHAMPION_DEFEATED",
        "NATIONAL_DEX"
    ]);
});

test("checkOfficialRestriction allows satisfied requirements", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                requirements: [
                    "CHAMPION_DEFEATED",
                    "NATIONAL_DEX"
                ],
                reason: "Requirements not met"
            }
        }
    });

    assert.deepEqual(
        service.checkOfficialRestriction("BULBASAUR", {
            progression: "POST_GAME",
            nationalDex: true
        }),
        { available: true }
    );
});

test("checkOfficialRestriction preserves an undefined reason when locked", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                availableAfter: "POST_GAME"
            }
        }
    });

    const result = service.checkOfficialRestriction("BULBASAUR", {
        progression: "GYM_1"
    });

    assert.equal(result.available, false);
    assert.equal(result.reason, undefined);
});

// --------------------------------------------------
// getMissingRequirements()
// --------------------------------------------------

test("getMissingRequirements returns an empty array for no requirements", () => {
    const service = createService();

    assert.deepEqual(
        service.getMissingRequirements([], {}),
        []
    );
});

test("getMissingRequirements reports a missing champion victory", () => {
    const service = createService();

    assert.deepEqual(
        service.getMissingRequirements(
            ["CHAMPION_DEFEATED"],
            { progression: "GYM_8" }
        ),
        ["CHAMPION_DEFEATED"]
    );
});

test("getMissingRequirements accepts champion victory at POST_GAME", () => {
    const service = createService();

    assert.deepEqual(
        service.getMissingRequirements(
            ["CHAMPION_DEFEATED"],
            { progression: "POST_GAME" }
        ),
        []
    );
});

test("getMissingRequirements reports a missing National Dex", () => {
    const service = createService();

    assert.deepEqual(
        service.getMissingRequirements(["NATIONAL_DEX"], {}),
        ["NATIONAL_DEX"]
    );
});

test("getMissingRequirements accepts a true National Dex flag", () => {
    const service = createService();

    assert.deepEqual(
        service.getMissingRequirements(
            ["NATIONAL_DEX"],
            { nationalDex: true }
        ),
        []
    );
});

test("getMissingRequirements treats a false National Dex flag as missing", () => {
    const service = createService();

    assert.deepEqual(
        service.getMissingRequirements(
            ["NATIONAL_DEX"],
            { nationalDex: false }
        ),
        ["NATIONAL_DEX"]
    );
});

test("getMissingRequirements treats a missing National Dex flag as missing", () => {
    const service = createService();

    assert.deepEqual(
        service.getMissingRequirements(
            ["NATIONAL_DEX"],
            {}
        ),
        ["NATIONAL_DEX"]
    );
});

test("getMissingRequirements ignores unknown requirement names", () => {
    const service = createService();

    assert.deepEqual(
        service.getMissingRequirements(
            ["UNKNOWN_REQUIREMENT"],
            {}
        ),
        []
    );
});

test("getMissingRequirements preserves requirement order", () => {
    const service = createService();

    assert.deepEqual(
        service.getMissingRequirements(
            [
                "NATIONAL_DEX",
                "CHAMPION_DEFEATED",
                "SOMETHING_ELSE"
            ],
            { progression: "GYM_1" }
        ),
        [
            "NATIONAL_DEX",
            "CHAMPION_DEFEATED"
        ]
    );
});

test("getMissingRequirements can report both supported requirements", () => {
    const service = createService();

    assert.deepEqual(
        service.getMissingRequirements(
            ["CHAMPION_DEFEATED", "NATIONAL_DEX"],
            { progression: "GYM_8", nationalDex: false }
        ),
        ["CHAMPION_DEFEATED", "NATIONAL_DEX"]
    );
});

test("getMissingRequirements returns a fresh array on each call", () => {
    const service = createService();

    const first = service.getMissingRequirements(
        ["NATIONAL_DEX"],
        {}
    );

    const second = service.getMissingRequirements(
        ["NATIONAL_DEX"],
        {}
    );

    assert.notStrictEqual(first, second);
    assert.deepEqual(first, second);
});

// --------------------------------------------------
// normalizeSpeciesConstant()
// --------------------------------------------------

test("normalizeSpeciesConstant prefixes a plain name", () => {
    const service = createService();

    assert.equal(
        service.normalizeSpeciesConstant("BULBASAUR"),
        "SPECIES_BULBASAUR"
    );
});

test("normalizeSpeciesConstant uppercases lowercase names", () => {
    const service = createService();

    assert.equal(
        service.normalizeSpeciesConstant("bulbasaur"),
        "SPECIES_BULBASAUR"
    );
});

test("normalizeSpeciesConstant uppercases mixed-case names", () => {
    const service = createService();

    assert.equal(
        service.normalizeSpeciesConstant("BulBaSauR"),
        "SPECIES_BULBASAUR"
    );
});

test("normalizeSpeciesConstant preserves an existing SPECIES_ constant", () => {
    const service = createService();

    assert.equal(
        service.normalizeSpeciesConstant("SPECIES_BULBASAUR"),
        "SPECIES_BULBASAUR"
    );
});

test("normalizeSpeciesConstant preserves an existing constant as written", () => {
    const service = createService();

    assert.equal(
        service.normalizeSpeciesConstant("SPECIES_Bulbasaur"),
        "SPECIES_Bulbasaur"
    );
});

test("normalizeSpeciesConstant only recognizes the uppercase prefix", () => {
    const service = createService();

    assert.equal(
        service.normalizeSpeciesConstant("species_BULBASAUR"),
        "SPECIES_SPECIES_BULBASAUR"
    );
});

test("normalizeSpeciesConstant handles a name containing underscores", () => {
    const service = createService();

    assert.equal(
        service.normalizeSpeciesConstant("MR_MIME"),
        "SPECIES_MR_MIME"
    );
});

test("normalizeSpeciesConstant throws when given a number", () => {
    const service = createService();

    assert.throws(
        () => service.normalizeSpeciesConstant(25),
        TypeError
    );
});

// --------------------------------------------------
// calculateDifficulty()
// --------------------------------------------------

test("calculateDifficulty returns NORMAL without an evolution service", () => {
    const service = createService();

    assert.deepEqual(
        service.calculateDifficulty("BULBASAUR", {
            progression: "GYM_1"
        }),
        {
            level: "NORMAL",
            warning: null
        }
    );
});

test("calculateDifficulty returns NORMAL without progression", () => {
    const service = createService({
        evolutionService: createEvolutionService(
            createLevelEvolution(30)
        )
    });

    assert.deepEqual(
        service.calculateDifficulty("BULBASAUR", {}),
        {
            level: "NORMAL",
            warning: null
        }
    );
});

test("calculateDifficulty skips evolution lookup without progression", () => {
    const evolution = {
        getEvolutionSource() {
            throw new Error("Evolution lookup should be skipped");
        }
    };

    const service = createService({
        evolutionService: evolution
    });

    assert.deepEqual(
        service.calculateDifficulty("BULBASAUR", {}),
        {
            level: "NORMAL",
            warning: null
        }
    );
});

test("calculateDifficulty normalizes the species constant for evolution lookup", () => {
    const calls = [];

    const service = createService({
        evolutionService: {
            getEvolutionSource(constant) {
                calls.push(constant);
                return null;
            }
        }
    });

    service.calculateDifficulty("bulbasaur", {
        progression: "GYM_1"
    });

    assert.deepEqual(calls, ["SPECIES_BULBASAUR"]);
});

test("calculateDifficulty preserves an existing species constant for lookup", () => {
    const calls = [];

    const service = createService({
        evolutionService: {
            getEvolutionSource(constant) {
                calls.push(constant);
                return null;
            }
        }
    });

    service.calculateDifficulty("SPECIES_BULBASAUR", {
        progression: "GYM_1"
    });

    assert.deepEqual(calls, ["SPECIES_BULBASAUR"]);
});

test("calculateDifficulty returns NORMAL when no evolution source exists", () => {
    const service = createService({
        evolutionService: createEvolutionService(null)
    });

    assert.deepEqual(
        service.calculateDifficulty("BULBASAUR", {
            progression: "GYM_1"
        }),
        {
            level: "NORMAL",
            warning: null
        }
    );
});

test("calculateDifficulty returns NORMAL for undefined evolution data", () => {
    const service = createService({
        evolutionService: createEvolutionService(undefined)
    });

    assert.deepEqual(
        service.calculateDifficulty("BULBASAUR", {
            progression: "GYM_1"
        }),
        {
            level: "NORMAL",
            warning: null
        }
    );
});

test("calculateDifficulty returns NORMAL for an unknown progression rule", () => {
    const service = createService({
        evolutionService: createEvolutionService(
            createLevelEvolution(40)
        ),
        progressionRules: {}
    });

    assert.deepEqual(
        service.calculateDifficulty("BULBASAUR", {
            progression: "UNKNOWN"
        }),
        {
            level: "NORMAL",
            warning: null
        }
    );
});

test("calculateDifficulty returns NORMAL for non-level evolution", () => {
    const service = createService({
        evolutionService: createEvolutionService({
            requirement: {
                method: "STONE",
                item: "FIRE_STONE"
            }
        }),
        progressionRules: {
            GYM_1: {
                recommendedLevel: 10,
                maxReasonableLevel: 20
            }
        }
    });

    assert.deepEqual(
        service.calculateDifficulty("BULBASAUR", {
            progression: "GYM_1"
        }),
        {
            level: "NORMAL",
            warning: null
        }
    );
});

test("calculateDifficulty returns NORMAL at the recommended evolution level", () => {
    const service = createService({
        evolutionService: createEvolutionService(
            createLevelEvolution(10)
        ),
        progressionRules: {
            GYM_1: {
                recommendedLevel: 10,
                maxReasonableLevel: 20
            }
        }
    });

    assert.deepEqual(
        service.calculateDifficulty("BULBASAUR", {
            progression: "GYM_1"
        }),
        {
            level: "NORMAL",
            warning: null
        }
    );
});

test("calculateDifficulty returns NORMAL below the recommended level", () => {
    const service = createService({
        evolutionService: createEvolutionService(
            createLevelEvolution(8)
        ),
        progressionRules: {
            GYM_1: {
                recommendedLevel: 10,
                maxReasonableLevel: 20
            }
        }
    });

    assert.equal(
        service.calculateDifficulty("BULBASAUR", {
            progression: "GYM_1"
        }).level,
        "NORMAL"
    );
});

test("calculateDifficulty returns HARD_GRIND above the recommended level", () => {
    const service = createService({
        evolutionService: createEvolutionService(
            createLevelEvolution(15)
        ),
        progressionRules: {
            GYM_1: {
                recommendedLevel: 10,
                maxReasonableLevel: 20
            }
        }
    });

    assert.deepEqual(
        service.calculateDifficulty("BULBASAUR", {
            progression: "GYM_1"
        }),
        {
            level: "HARD_GRIND",
            warning: "Possible before GYM_1. Requires evolution at level 15."
        }
    );
});

test("calculateDifficulty returns HARD_GRIND at the maximum reasonable level", () => {
    const service = createService({
        evolutionService: createEvolutionService(
            createLevelEvolution(20)
        ),
        progressionRules: {
            GYM_1: {
                recommendedLevel: 10,
                maxReasonableLevel: 20
            }
        }
    });

    assert.equal(
        service.calculateDifficulty("BULBASAUR", {
            progression: "GYM_1"
        }).level,
        "HARD_GRIND"
    );
});

test("calculateDifficulty returns EXTREME_GRIND above the maximum reasonable level", () => {
    const service = createService({
        evolutionService: createEvolutionService(
            createLevelEvolution(21)
        ),
        progressionRules: {
            GYM_1: {
                recommendedLevel: 10,
                maxReasonableLevel: 20
            }
        }
    });

    assert.deepEqual(
        service.calculateDifficulty("BULBASAUR", {
            progression: "GYM_1"
        }),
        {
            level: "EXTREME_GRIND",
            warning: "Possible before GYM_1, but requires excessive grinding to reach level 21."
        }
    );
});

test("calculateDifficulty interpolates the level in HARD_GRIND warning", () => {
    const service = createService({
        evolutionService: createEvolutionService(
            createLevelEvolution(18)
        ),
        progressionRules: {
            GYM_2: {
                recommendedLevel: 12,
                maxReasonableLevel: 20
            }
        }
    });

    assert.equal(
        service.calculateDifficulty("BULBASAUR", {
            progression: "GYM_2"
        }).warning,
        "Possible before GYM_2. Requires evolution at level 18."
    );
});

test("calculateDifficulty interpolates progression and level in EXTREME_GRIND warning", () => {
    const service = createService({
        evolutionService: createEvolutionService(
            createLevelEvolution(35)
        ),
        progressionRules: {
            GYM_3: {
                recommendedLevel: 15,
                maxReasonableLevel: 25
            }
        }
    });

    assert.equal(
        service.calculateDifficulty("BULBASAUR", {
            progression: "GYM_3"
        }).warning,
        "Possible before GYM_3, but requires excessive grinding to reach level 35."
    );
});

test("calculateDifficulty uses the rule for the current progression", () => {
    const service = createService({
        evolutionService: createEvolutionService(
            createLevelEvolution(15)
        ),
        progressionRules: {
            GYM_1: {
                recommendedLevel: 10,
                maxReasonableLevel: 20
            },
            GYM_2: {
                recommendedLevel: 15,
                maxReasonableLevel: 25
            }
        }
    });

    assert.equal(
        service.calculateDifficulty("BULBASAUR", {
            progression: "GYM_2"
        }).level,
        "NORMAL"
    );
});

test("calculateDifficulty throws when evolution data lacks a requirement", () => {
    const service = createService({
        evolutionService: createEvolutionService({}),
        progressionRules: {
            GYM_1: {
                recommendedLevel: 10,
                maxReasonableLevel: 20
            }
        }
    });

    assert.throws(
        () => service.calculateDifficulty("BULBASAUR", {
            progression: "GYM_1"
        }),
        TypeError
    );
});

// --------------------------------------------------
// isAvailableAtLocation()
// --------------------------------------------------

test("isAvailableAtLocation allows checking when no location database exists", () => {
    const service = createService();

    assert.deepEqual(
        service.isAvailableAtLocation("BULBASAUR", "ROUTE_1"),
        { available: true }
    );
});

test("isAvailableAtLocation queries the requested location", () => {
    const calls = [];

    const service = createService({
        locationDatabase: {
            getPokemon(location) {
                calls.push(location);
                return [];
            }
        }
    });

    service.isAvailableAtLocation("BULBASAUR", "ROUTE_1");

    assert.deepEqual(calls, ["ROUTE_1"]);
});

test("isAvailableAtLocation locks when the location has no encounters", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                return null;
            }
        }
    });

    assert.deepEqual(
        service.isAvailableAtLocation("BULBASAUR", "UNKNOWN_LOCATION"),
        {
            available: false,
            status: "LOCKED",
            reason: "Location has no encounters"
        }
    );
});

test("isAvailableAtLocation locks when the location returns undefined", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                return undefined;
            }
        }
    });

    assert.equal(
        service.isAvailableAtLocation("BULBASAUR", "UNKNOWN_LOCATION").available,
        false
    );
});

test("isAvailableAtLocation locks when the encounter list is empty", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                return [];
            }
        }
    });

    assert.deepEqual(
        service.isAvailableAtLocation("BULBASAUR", "ROUTE_1"),
        {
            available: false,
            status: "LOCKED"
        }
    );
});

test("isAvailableAtLocation finds a matching species", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                return [
                    { species: "BULBASAUR" }
                ];
            }
        }
    });

    assert.deepEqual(
        service.isAvailableAtLocation("BULBASAUR", "ROUTE_1"),
        {
            available: true,
            status: "AVAILABLE"
        }
    );
});

test("isAvailableAtLocation rejects a species absent from encounters", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                return [
                    { species: "CHARMANDER" }
                ];
            }
        }
    });

    assert.deepEqual(
        service.isAvailableAtLocation("BULBASAUR", "ROUTE_1"),
        {
            available: false,
            status: "LOCKED"
        }
    );
});

test("isAvailableAtLocation checks all encounter entries", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                return [
                    { species: "CHARMANDER" },
                    { species: "SQUIRTLE" },
                    { species: "BULBASAUR" }
                ];
            }
        }
    });

    assert.equal(
        service.isAvailableAtLocation("BULBASAUR", "ROUTE_1").available,
        true
    );
});

test("isAvailableAtLocation uses exact species matching", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                return [
                    { species: "SPECIES_BULBASAUR" }
                ];
            }
        }
    });

    assert.equal(
        service.isAvailableAtLocation("BULBASAUR", "ROUTE_1").available,
        false
    );
});

test("isAvailableAtLocation does not normalize species names", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                return [
                    { species: "bulbasaur" }
                ];
            }
        }
    });

    assert.equal(
        service.isAvailableAtLocation("BULBASAUR", "ROUTE_1").available,
        false
    );
});

test("isAvailableAtLocation returns only availability and status for a known location", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                return [{ species: "BULBASAUR" }];
            }
        }
    });

    assert.deepEqual(
        service.isAvailableAtLocation("BULBASAUR", "ROUTE_1"),
        {
            available: true,
            status: "AVAILABLE"
        }
    );
});

// --------------------------------------------------
// checkTrade()
// --------------------------------------------------

test("checkTrade reports a missing Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.checkTrade("MISSING"),
        {
            available: false,
            status: "ERROR",
            reason: "Pokemon not found"
        }
    );
});

test("checkTrade allows a known Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.checkTrade("BULBASAUR"),
        {
            available: true,
            status: "AVAILABLE",
            species: "Bulbasaur",
            constant: "SPECIES_BULBASAUR",
            difficulty: "TRADE",
            warning: "Obtained through trade. Not available through normal FireRed progression.",
            source: "TRADE"
        }
    );
});

test("checkTrade returns trade difficulty", () => {
    const service = createService();

    assert.equal(
        service.checkTrade("BULBASAUR").difficulty,
        "TRADE"
    );
});

test("checkTrade explains that normal progression does not provide the Pokémon", () => {
    const service = createService();

    assert.equal(
        service.checkTrade("BULBASAUR").warning,
        "Obtained through trade. Not available through normal FireRed progression."
    );
});

test("checkTrade reports the TRADE source", () => {
    const service = createService();

    assert.equal(
        service.checkTrade("BULBASAUR").source,
        "TRADE"
    );
});

test("checkTrade returns the database species name and constant", () => {
    const service = createService();

    const result = service.checkTrade("CHARMANDER");

    assert.equal(result.species, "Charmander");
    assert.equal(result.constant, "SPECIES_CHARMANDER");
});

test("checkTrade does not run evolution difficulty calculations", () => {
    const service = createService({
        evolutionService: {
            getEvolutionSource() {
                throw new Error("Trade should skip evolution calculations");
            }
        }
    });

    assert.equal(
        service.checkTrade("BULBASAUR").available,
        true
    );
});

// --------------------------------------------------
// filterAvailable()
// --------------------------------------------------

test("filterAvailable returns an empty array for an empty Pokémon list", () => {
    const service = createService();

    assert.deepEqual(
        service.filterAvailable([]),
        []
    );
});

test("filterAvailable returns one result for each input species", () => {
    const service = createService();

    assert.equal(
        service.filterAvailable([
            "BULBASAUR",
            "CHARMANDER",
            "SQUIRTLE"
        ]).length,
        3
    );
});

test("filterAvailable preserves the input species order", () => {
    const service = createService();

    const results = service.filterAvailable([
        "SQUIRTLE",
        "BULBASAUR",
        "CHARMANDER"
    ]);

    assert.deepEqual(
        results.map(entry => entry.species),
        ["SQUIRTLE", "BULBASAUR", "CHARMANDER"]
    );
});

test("filterAvailable preserves each input value in the species field", () => {
    const service = createService();

    const results = service.filterAvailable([
        "BULBASAUR",
        "MISSING"
    ]);

    assert.equal(results[0].species, "BULBASAUR");
    assert.equal(results[1].species, "MISSING");
});

test("filterAvailable includes the availability result for each species", () => {
    const service = createService();

    const results = service.filterAvailable([
        "BULBASAUR",
        "MISSING"
    ]);

    assert.deepEqual(results[0].result, {
        available: true,
        status: "AVAILABLE",
        species: "Bulbasaur",
        constant: "SPECIES_BULBASAUR",
        difficulty: "NORMAL",
        warning: null,
        source: "NORMAL"
    });

    assert.deepEqual(results[1].result, {
        available: false,
        status: "ERROR",
        reason: "Pokemon not found"
    });
});

test("filterAvailable forwards the context to every availability check", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                availableAfter: "POST_GAME",
                reason: "Post-game only"
            }
        }
    });

    const results = service.filterAvailable(
        ["BULBASAUR", "CHARMANDER"],
        { progression: "GYM_1" }
    );

    assert.equal(results[0].result.status, "LOCKED");
    assert.equal(results[1].result.available, true);
});

test("filterAvailable supports the TRADE context", () => {
    const service = createService();

    const results = service.filterAvailable(
        ["BULBASAUR", "CHARMANDER"],
        { source: "TRADE" }
    );

    assert.equal(results[0].result.source, "TRADE");
    assert.equal(results[1].result.source, "TRADE");
});

test("filterAvailable does not mutate the input list", () => {
    const service = createService();
    const species = ["BULBASAUR", "CHARMANDER"];

    service.filterAvailable(species);

    assert.deepEqual(species, ["BULBASAUR", "CHARMANDER"]);
});

test("filterAvailable returns a new result array on each call", () => {
    const service = createService();
    const species = ["BULBASAUR"];

    const first = service.filterAvailable(species);
    const second = service.filterAvailable(species);

    assert.notStrictEqual(first, second);
});

test("filterAvailable returns a result object for every input entry", () => {
    const service = createService();

    const results = service.filterAvailable([
        "BULBASAUR",
        "UNKNOWN",
        "SQUIRTLE"
    ]);

    for (const entry of results) {
        assert.ok(Object.prototype.hasOwnProperty.call(entry, "species"));
        assert.ok(Object.prototype.hasOwnProperty.call(entry, "result"));
    }
});

// --------------------------------------------------
// explain()
// --------------------------------------------------

test("explain returns the normal availability result", () => {
    const service = createService();

    assert.deepEqual(
        service.explain("BULBASAUR"),
        service.isAvailable("BULBASAUR")
    );
});

test("explain reports a missing Pokémon", () => {
    const service = createService();

    assert.deepEqual(
        service.explain("MISSING"),
        {
            available: false,
            status: "ERROR",
            reason: "Pokemon not found"
        }
    );
});

test("explain forwards the context", () => {
    const service = createService({
        pokemonRestrictions: {
            BULBASAUR: {
                availableAfter: "POST_GAME",
                reason: "Post-game only"
            }
        }
    });

    assert.equal(
        service.explain("BULBASAUR", {
            progression: "GYM_1"
        }).status,
        "LOCKED"
    );
});

test("explain supports trade availability", () => {
    const service = createService();

    assert.equal(
        service.explain("BULBASAUR", {
            source: "TRADE"
        }).source,
        "TRADE"
    );
});

test("explain returns the same fields as isAvailable", () => {
    const service = createService();

    const result = service.explain("BULBASAUR");

    assert.deepEqual(
        Object.keys(result).sort(),
        [
            "available",
            "constant",
            "difficulty",
            "source",
            "species",
            "status",
            "warning"
        ].sort()
    );
});

test("explain returns location restrictions when applicable", () => {
    const service = createService({
        locationDatabase: {
            getPokemon() {
                return [];
            }
        }
    });

    assert.deepEqual(
        service.explain("BULBASAUR", {
            location: "ROUTE_1"
        }),
        {
            available: false,
            status: "LOCKED"
        }
    );
});

test("explain returns evolution difficulty when applicable", () => {
    const service = createService({
        evolutionService: createEvolutionService(
            createLevelEvolution(18)
        ),
        progressionRules: {
            GYM_1: {
                recommendedLevel: 10,
                maxReasonableLevel: 20
            }
        }
    });

    const result = service.explain("BULBASAUR", {
        progression: "GYM_1"
    });

    assert.equal(result.available, true);
    assert.equal(result.difficulty, "HARD_GRIND");
    assert.equal(
        result.warning,
        "Possible before GYM_1. Requires evolution at level 18."
    );
});

test("explain does not mutate the Pokémon restriction configuration", () => {
    const restrictions = {
        BULBASAUR: {
            availableAfter: "POST_GAME",
            reason: "Post-game only"
        }
    };

    const service = createService({
        pokemonRestrictions: restrictions
    });

    service.explain("BULBASAUR", {
        progression: "GYM_1"
    });

    assert.deepEqual(restrictions, {
        BULBASAUR: {
            availableAfter: "POST_GAME",
            reason: "Post-game only"
        }
    });
});

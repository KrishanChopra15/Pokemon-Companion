"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const TeamRecommendationService = require("../scripts/services/team-recommendation-service");

function createService(availabilityService = null) {
    return new TeamRecommendationService(availabilityService);
}

function createPokemon(species, level = 10, type = undefined) {
    const pokemon = { species, level };

    if (type !== undefined) {
        pokemon.type = type;
    }

    return pokemon;
}

function createAvailabilityService(available = true) {
    const calls = [];

    return {
        calls,
        service: {
            isAvailable(species, context) {
                calls.push({ species, context });

                return {
                    available: typeof available === "function"
                        ? available(species, context)
                        : available
                };
            }
        }
    };
}

const EXPECTED_TYPES = [
    "NORMAL",
    "FIRE",
    "WATER",
    "GRASS",
    "ELECTRIC",
    "PSYCHIC"
];

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a TeamRecommendationService instance", () => {
    assert.ok(createService() instanceof TeamRecommendationService);
});

test("constructor defaults availability service to null", () => {
    assert.equal(createService().availability, null);
});

test("constructor stores the supplied availability service", () => {
    const availability = { isAvailable() {} };

    assert.strictEqual(createService(availability).availability, availability);
});

test("constructor initializes the type advantage database", () => {
    assert.deepEqual(
        Object.keys(createService().typeAdvantages),
        EXPECTED_TYPES
    );
});

test("constructor creates independent type advantage objects", () => {
    const first = createService();
    const second = createService();

    assert.notStrictEqual(first.typeAdvantages, second.typeAdvantages);
    assert.notStrictEqual(
        first.typeAdvantages.FIRE,
        second.typeAdvantages.FIRE
    );
});

test("every supported type contains strong and weak arrays", () => {
    const service = createService();

    for (const type of EXPECTED_TYPES) {
        assert.ok(Array.isArray(service.typeAdvantages[type].strong));
        assert.ok(Array.isArray(service.typeAdvantages[type].weak));
    }
});

// --------------------------------------------------
// filterAvailable
// --------------------------------------------------

test("filterAvailable returns the input when no availability service exists", () => {
    const service = createService();
    const pokemon = [
        createPokemon("PIKACHU"),
        createPokemon("CHARMANDER")
    ];

    assert.strictEqual(service.filterAvailable(pokemon), pokemon);
});

test("filterAvailable returns the same reference without filtering", () => {
    const pokemon = [];

    assert.strictEqual(
        createService().filterAvailable(pokemon),
        pokemon
    );
});

test("filterAvailable keeps every Pokémon when all are available", () => {
    const pokemon = [
        createPokemon("PIKACHU"),
        createPokemon("CHARMANDER")
    ];
    const { service: availability } = createAvailabilityService(true);

    assert.deepEqual(
        createService(availability).filterAvailable(pokemon),
        pokemon
    );
});

test("filterAvailable removes unavailable Pokémon", () => {
    const pokemon = [
        createPokemon("PIKACHU"),
        createPokemon("CHARMANDER"),
        createPokemon("SQUIRTLE")
    ];

    const { service: availability } = createAvailabilityService(
        species => species !== "CHARMANDER"
    );

    assert.deepEqual(
        createService(availability).filterAvailable(pokemon),
        [pokemon[0], pokemon[2]]
    );
});

test("filterAvailable returns an empty array when none are available", () => {
    const pokemon = [
        createPokemon("PIKACHU"),
        createPokemon("CHARMANDER")
    ];
    const { service: availability } = createAvailabilityService(false);

    assert.deepEqual(
        createService(availability).filterAvailable(pokemon),
        []
    );
});

test("filterAvailable checks each Pokémon's species", () => {
    const pokemon = [
        createPokemon("PIKACHU"),
        createPokemon("CHARMANDER")
    ];
    const { service: availability, calls } = createAvailabilityService(true);

    createService(availability).filterAvailable(pokemon);

    assert.deepEqual(
        calls.map(call => call.species),
        ["PIKACHU", "CHARMANDER"]
    );
});

test("filterAvailable passes the supplied context to availability checks", () => {
    const context = { location: "CERULEAN_CITY", mode: "story" };
    const pokemon = [createPokemon("PIKACHU")];
    const { service: availability, calls } = createAvailabilityService(true);

    createService(availability).filterAvailable(pokemon, context);

    assert.strictEqual(calls[0].context, context);
});

test("filterAvailable defaults context to an empty object", () => {
    const pokemon = [createPokemon("PIKACHU")];
    const { service: availability, calls } = createAvailabilityService(true);

    createService(availability).filterAvailable(pokemon);

    assert.deepEqual(calls[0].context, {});
});

test("filterAvailable preserves the order of available Pokémon", () => {
    const pokemon = [
        createPokemon("PIKACHU"),
        createPokemon("BULBASAUR"),
        createPokemon("MEW"),
        createPokemon("SQUIRTLE")
    ];

    const { service: availability } = createAvailabilityService(
        species => species !== "BULBASAUR"
    );

    assert.deepEqual(
        createService(availability).filterAvailable(pokemon),
        [pokemon[0], pokemon[2], pokemon[3]]
    );
});

test("filterAvailable preserves original Pokémon object references", () => {
    const pikachu = createPokemon("PIKACHU");
    const charmander = createPokemon("CHARMANDER");
    const { service: availability } = createAvailabilityService(true);

    const result = createService(availability).filterAvailable([
        pikachu,
        charmander
    ]);

    assert.strictEqual(result[0], pikachu);
    assert.strictEqual(result[1], charmander);
});

test("filterAvailable does not mutate the original Pokémon array", () => {
    const pokemon = [
        createPokemon("PIKACHU"),
        createPokemon("CHARMANDER")
    ];
    const original = [...pokemon];
    const { service: availability } = createAvailabilityService(false);

    createService(availability).filterAvailable(pokemon);

    assert.deepEqual(pokemon, original);
});

test("filterAvailable calls availability once per Pokémon", () => {
    const pokemon = [
        createPokemon("PIKACHU"),
        createPokemon("CHARMANDER"),
        createPokemon("SQUIRTLE")
    ];
    const { service: availability, calls } = createAvailabilityService(true);

    createService(availability).filterAvailable(pokemon);

    assert.equal(calls.length, 3);
});

test("filterAvailable propagates availability service errors", () => {
    const service = createService({
        isAvailable() {
            throw new Error("Availability lookup failed");
        }
    });

    assert.throws(
        () => service.filterAvailable([createPokemon("PIKACHU")]),
        /Availability lookup failed/
    );
});

test("filterAvailable throws when the availability service lacks isAvailable", () => {
    const service = createService({});

    assert.throws(
        () => service.filterAvailable([createPokemon("PIKACHU")]),
        TypeError
    );
});

test("filterAvailable uses the available property of the result", () => {
    const pokemon = [
        createPokemon("PIKACHU"),
        createPokemon("CHARMANDER")
    ];

    const service = createService({
        isAvailable(species) {
            return species === "PIKACHU"
                ? { available: true }
                : { available: false, reason: "Unavailable" };
        }
    });

    assert.deepEqual(
        service.filterAvailable(pokemon),
        [pokemon[0]]
    );
});

// --------------------------------------------------
// checkTypeAdvantage
// --------------------------------------------------

test("checkTypeAdvantage recognizes Fire against Grass", () => {
    assert.equal(
        createService().checkTypeAdvantage("FIRE", "GRASS"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Fire against Ice", () => {
    assert.equal(
        createService().checkTypeAdvantage("FIRE", "ICE"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Fire against Bug", () => {
    assert.equal(
        createService().checkTypeAdvantage("FIRE", "BUG"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Fire against Steel", () => {
    assert.equal(
        createService().checkTypeAdvantage("FIRE", "STEEL"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Fire against Water as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("FIRE", "WATER"),
        "WEAK"
    );
});

test("checkTypeAdvantage recognizes Fire against Ground as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("FIRE", "GROUND"),
        "WEAK"
    );
});

test("checkTypeAdvantage recognizes Fire against Rock as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("FIRE", "ROCK"),
        "WEAK"
    );
});

test("checkTypeAdvantage recognizes Water against Fire", () => {
    assert.equal(
        createService().checkTypeAdvantage("WATER", "FIRE"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Water against Ground", () => {
    assert.equal(
        createService().checkTypeAdvantage("WATER", "GROUND"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Water against Rock", () => {
    assert.equal(
        createService().checkTypeAdvantage("WATER", "ROCK"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Water against Electric as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("WATER", "ELECTRIC"),
        "WEAK"
    );
});

test("checkTypeAdvantage recognizes Water against Grass as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("WATER", "GRASS"),
        "WEAK"
    );
});

test("checkTypeAdvantage recognizes Grass against Water", () => {
    assert.equal(
        createService().checkTypeAdvantage("GRASS", "WATER"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Grass against Ground", () => {
    assert.equal(
        createService().checkTypeAdvantage("GRASS", "GROUND"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Grass against Rock", () => {
    assert.equal(
        createService().checkTypeAdvantage("GRASS", "ROCK"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Grass against Fire as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("GRASS", "FIRE"),
        "WEAK"
    );
});

test("checkTypeAdvantage recognizes Grass against Ice as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("GRASS", "ICE"),
        "WEAK"
    );
});

test("checkTypeAdvantage recognizes Grass against Poison as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("GRASS", "POISON"),
        "WEAK"
    );
});

test("checkTypeAdvantage recognizes Grass against Flying as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("GRASS", "FLYING"),
        "WEAK"
    );
});

test("checkTypeAdvantage recognizes Grass against Bug as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("GRASS", "BUG"),
        "WEAK"
    );
});

test("checkTypeAdvantage recognizes Electric against Water", () => {
    assert.equal(
        createService().checkTypeAdvantage("ELECTRIC", "WATER"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Electric against Flying", () => {
    assert.equal(
        createService().checkTypeAdvantage("ELECTRIC", "FLYING"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Electric against Ground as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("ELECTRIC", "GROUND"),
        "WEAK"
    );
});

test("checkTypeAdvantage recognizes Psychic against Fighting", () => {
    assert.equal(
        createService().checkTypeAdvantage("PSYCHIC", "FIGHTING"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Psychic against Poison", () => {
    assert.equal(
        createService().checkTypeAdvantage("PSYCHIC", "POISON"),
        "SUPER"
    );
});

test("checkTypeAdvantage recognizes Psychic against Bug as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("PSYCHIC", "BUG"),
        "WEAK"
    );
});

test("checkTypeAdvantage recognizes Psychic against Ghost as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("PSYCHIC", "GHOST"),
        "WEAK"
    );
});

test("checkTypeAdvantage recognizes Psychic against Dark as weak", () => {
    assert.equal(
        createService().checkTypeAdvantage("PSYCHIC", "DARK"),
        "WEAK"
    );
});

test("checkTypeAdvantage returns NORMAL for an unlisted matchup", () => {
    assert.equal(
        createService().checkTypeAdvantage("FIRE", "NORMAL"),
        "NORMAL"
    );
});

test("checkTypeAdvantage returns NORMAL for NORMAL type attacks", () => {
    assert.equal(
        createService().checkTypeAdvantage("NORMAL", "GHOST"),
        "NORMAL"
    );
});

test("checkTypeAdvantage returns NORMAL for an unsupported attacker type", () => {
    assert.equal(
        createService().checkTypeAdvantage("DRAGON", "GRASS"),
        "NORMAL"
    );
});

test("checkTypeAdvantage compares types case-insensitively", () => {
    assert.equal(
        createService().checkTypeAdvantage("fire", "grass"),
        "SUPER"
    );
});

test("checkTypeAdvantage accepts mixed-case type names", () => {
    assert.equal(
        createService().checkTypeAdvantage("WaTeR", "RoCk"),
        "SUPER"
    );
});

test("checkTypeAdvantage rejects a missing attacker type", () => {
    assert.throws(
        () => createService().checkTypeAdvantage(undefined, "GRASS"),
        TypeError
    );
});

test("checkTypeAdvantage rejects a missing defender type", () => {
    assert.throws(
        () => createService().checkTypeAdvantage("FIRE", undefined),
        TypeError
    );
});

test("checkTypeAdvantage rejects numeric types", () => {
    assert.throws(
        () => createService().checkTypeAdvantage(10, "GRASS"),
        TypeError
    );
});

// --------------------------------------------------
// calculateScore
// --------------------------------------------------

test("calculateScore returns zero for equal levels and no types", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("PIKACHU", 10),
            createPokemon("RATTATA", 10)
        ),
        0
    );
});

test("calculateScore adds the level difference", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("PIKACHU", 15),
            createPokemon("RATTATA", 10)
        ),
        5
    );
});

test("calculateScore subtracts points when the Pokémon is lower level", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("PIKACHU", 5),
            createPokemon("RATTATA", 15)
        ),
        -10
    );
});

test("calculateScore adds 50 for a super-effective type", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("CHARMANDER", 10, "FIRE"),
            createPokemon("BULBASAUR", 10, "GRASS")
        ),
        50
    );
});

test("calculateScore subtracts 50 for a weak type matchup", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("CHARMANDER", 10, "FIRE"),
            createPokemon("SQUIRTLE", 10, "WATER")
        ),
        -50
    );
});

test("calculateScore combines level and type advantage", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("CHARMANDER", 15, "FIRE"),
            createPokemon("BULBASAUR", 10, "GRASS")
        ),
        55
    );
});

test("calculateScore combines level disadvantage and type advantage", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("CHARMANDER", 5, "FIRE"),
            createPokemon("BULBASAUR", 10, "GRASS")
        ),
        45
    );
});

test("calculateScore combines level advantage and a weak matchup", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("CHARMANDER", 20, "FIRE"),
            createPokemon("SQUIRTLE", 10, "WATER")
        ),
        -40
    );
});

test("calculateScore accepts type1 as the Pokémon type", () => {
    assert.equal(
        createService().calculateScore(
            { species: "CHARMANDER", level: 10, type1: "FIRE" },
            { species: "BULBASAUR", level: 10, type1: "GRASS" }
        ),
        50
    );
});

test("calculateScore accepts type1 as the opponent type", () => {
    assert.equal(
        createService().calculateScore(
            { species: "CHARMANDER", level: 10, type: "FIRE" },
            { species: "BULBASAUR", level: 10, type1: "GRASS" }
        ),
        50
    );
});

test("calculateScore prefers type over type1 for the Pokémon", () => {
    assert.equal(
        createService().calculateScore(
            {
                species: "CHARMANDER",
                level: 10,
                type: "NORMAL",
                type1: "FIRE"
            },
            createPokemon("BULBASAUR", 10, "GRASS")
        ),
        0
    );
});

test("calculateScore prefers type over type1 for the opponent", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("CHARMANDER", 10, "FIRE"),
            {
                species: "BULBASAUR",
                level: 10,
                type: "NORMAL",
                type1: "GRASS"
            }
        ),
        0
    );
});

test("calculateScore ignores types when the Pokémon has no type", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("PIKACHU", 12),
            createPokemon("RATTATA", 10, "GRASS")
        ),
        2
    );
});

test("calculateScore ignores types when the opponent has no type", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("CHARMANDER", 12, "FIRE"),
            createPokemon("BULBASAUR", 10)
        ),
        2
    );
});

test("calculateScore ignores level difference when the Pokémon level is zero", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("PIKACHU", 0),
            createPokemon("RATTATA", 10)
        ),
        0
    );
});

test("calculateScore ignores level difference when the opponent level is zero", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("PIKACHU", 10),
            createPokemon("RATTATA", 0)
        ),
        0
    );
});

test("calculateScore still scores types when levels are zero", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("CHARMANDER", 0, "FIRE"),
            createPokemon("BULBASAUR", 0, "GRASS")
        ),
        50
    );
});

test("calculateScore returns zero for an unknown type matchup with equal levels", () => {
    assert.equal(
        createService().calculateScore(
            createPokemon("DRAGON", 10, "DRAGON"),
            createPokemon("MEW", 10, "PSYCHIC")
        ),
        0
    );
});

test("calculateScore does not mutate Pokémon objects", () => {
    const pokemon = createPokemon("CHARMANDER", 15, "FIRE");
    const opponent = createPokemon("BULBASAUR", 10, "GRASS");
    const originalPokemon = { ...pokemon };
    const originalOpponent = { ...opponent };

    createService().calculateScore(pokemon, opponent);

    assert.deepEqual(pokemon, originalPokemon);
    assert.deepEqual(opponent, originalOpponent);
});

// --------------------------------------------------
// recommendTeam: input validation
// --------------------------------------------------

test("recommendTeam rejects missing Pokémon data", () => {
    assert.deepEqual(
        createService().recommendTeam(null, []),
        {
            success: false,
            reason: "Missing Pokemon data"
        }
    );
});

test("recommendTeam rejects missing opponents", () => {
    assert.deepEqual(
        createService().recommendTeam([], null),
        {
            success: false,
            reason: "Missing Pokemon data"
        }
    );
});

test("recommendTeam rejects both inputs when missing", () => {
    assert.deepEqual(
        createService().recommendTeam(null, null),
        {
            success: false,
            reason: "Missing Pokemon data"
        }
    );
});

test("recommendTeam accepts empty Pokémon and opponent arrays", () => {
    assert.deepEqual(
        createService().recommendTeam([], []),
        {
            success: true,
            team: [],
            ranking: []
        }
    );
});

test("recommendTeam returns success for valid inputs", () => {
    const result = createService().recommendTeam(
        [createPokemon("PIKACHU")],
        [createPokemon("RATTATA")]
    );

    assert.equal(result.success, true);
});

test("recommendTeam returns both team and ranking arrays", () => {
    const result = createService().recommendTeam(
        [createPokemon("PIKACHU")],
        [createPokemon("RATTATA")]
    );

    assert.ok(Array.isArray(result.team));
    assert.ok(Array.isArray(result.ranking));
});

// --------------------------------------------------
// recommendTeam: ranking
// --------------------------------------------------

test("recommendTeam ranks stronger type matchups first", () => {
    const pokemon = [
        createPokemon("CHARMANDER", 10, "FIRE"),
        createPokemon("SQUIRTLE", 10, "WATER"),
        createPokemon("BULBASAUR", 10, "GRASS")
    ];

    const result = createService().recommendTeam(
        pokemon,
        [createPokemon("ODDISH", 10, "GRASS")]
    );

    assert.deepEqual(
        result.ranking.map(item => item.pokemon.species),
        ["CHARMANDER", "BULBASAUR", "SQUIRTLE"]
    );

    assert.deepEqual(
        result.ranking.map(item => item.score),
        [50, 0, -50]
    );
});

test("recommendTeam ranks higher-level Pokémon first when types are equal", () => {
    const pokemon = [
        createPokemon("PIKACHU_A", 5, "NORMAL"),
        createPokemon("PIKACHU_B", 20, "NORMAL"),
        createPokemon("PIKACHU_C", 10, "NORMAL")
    ];

    const result = createService().recommendTeam(
        pokemon,
        [createPokemon("RATTATA", 10, "NORMAL")]
    );

    assert.deepEqual(
        result.ranking.map(item => item.pokemon.species),
        ["PIKACHU_B", "PIKACHU_C", "PIKACHU_A"]
    );
});

test("recommendTeam sums scores against all opponents", () => {
    const pokemon = [
        createPokemon("FIRE_MON", 10, "FIRE"),
        createPokemon("WATER_MON", 10, "WATER")
    ];

    const result = createService().recommendTeam(
        pokemon,
        [
            createPokemon("GRASS_MON", 10, "GRASS"),
            createPokemon("ROCK_MON", 10, "ROCK")
        ]
    );

    const scores = Object.fromEntries(
        result.ranking.map(item => [item.pokemon.species, item.score])
    );

    assert.equal(scores.FIRE_MON, 0);
    assert.equal(scores.WATER_MON, 0);
});

test("recommendTeam returns the original Pokémon object in each ranking entry", () => {
    const pikachu = createPokemon("PIKACHU", 15, "ELECTRIC");

    const result = createService().recommendTeam(
        [pikachu],
        [createPokemon("SQUIRTLE", 10, "WATER")]
    );

    assert.strictEqual(result.ranking[0].pokemon, pikachu);
    assert.strictEqual(result.team[0], pikachu);
});

test("recommendTeam includes a numeric score for every candidate", () => {
    const result = createService().recommendTeam(
        [
            createPokemon("PIKACHU", 15, "ELECTRIC"),
            createPokemon("CHARMANDER", 12, "FIRE")
        ],
        [createPokemon("SQUIRTLE", 10, "WATER")]
    );

    for (const item of result.ranking) {
        assert.equal(typeof item.score, "number");
        assert.ok(Number.isFinite(item.score));
    }
});

test("recommendTeam sorts the ranking in descending score order", () => {
    const result = createService().recommendTeam(
        [
            createPokemon("LOW", 5, "NORMAL"),
            createPokemon("HIGH", 20, "FIRE"),
            createPokemon("MID", 10, "NORMAL")
        ],
        [createPokemon("OPPONENT", 10, "GRASS")]
    );

    const scores = result.ranking.map(item => item.score);

    assert.deepEqual(
        scores,
        [...scores].sort((a, b) => b - a)
    );
});

test("recommendTeam preserves input order for equal scores", () => {
    const pokemon = [
        createPokemon("FIRST", 10, "NORMAL"),
        createPokemon("SECOND", 10, "NORMAL"),
        createPokemon("THIRD", 10, "NORMAL")
    ];

    const result = createService().recommendTeam(
        pokemon,
        [createPokemon("OPPONENT", 10, "NORMAL")]
    );

    assert.deepEqual(
        result.ranking.map(item => item.pokemon.species),
        ["FIRST", "SECOND", "THIRD"]
    );
});

test("recommendTeam does not modify the supplied Pokémon array", () => {
    const pokemon = [
        createPokemon("CHARMANDER", 10, "FIRE"),
        createPokemon("SQUIRTLE", 10, "WATER")
    ];
    const original = [...pokemon];

    createService().recommendTeam(
        pokemon,
        [createPokemon("BULBASAUR", 10, "GRASS")]
    );

    assert.deepEqual(pokemon, original);
});

test("recommendTeam does not modify the supplied opponents array", () => {
    const opponents = [
        createPokemon("BULBASAUR", 10, "GRASS"),
        createPokemon("SQUIRTLE", 10, "WATER")
    ];
    const original = [...opponents];

    createService().recommendTeam(
        [createPokemon("CHARMANDER", 10, "FIRE")],
        opponents
    );

    assert.deepEqual(opponents, original);
});

// --------------------------------------------------
// recommendTeam: team size
// --------------------------------------------------

test("recommendTeam selects six Pokémon by default", () => {
    const pokemon = Array.from(
        { length: 8 },
        (_, index) => createPokemon(`MON_${index}`, 10 + index, "NORMAL")
    );

    const result = createService().recommendTeam(
        pokemon,
        [createPokemon("OPPONENT", 10, "NORMAL")]
    );

    assert.equal(result.team.length, 6);
});

test("recommendTeam respects a custom team size", () => {
    const pokemon = Array.from(
        { length: 8 },
        (_, index) => createPokemon(`MON_${index}`, index + 1, "NORMAL")
    );

    const result = createService().recommendTeam(
        pokemon,
        [createPokemon("OPPONENT", 5, "NORMAL")],
        3
    );

    assert.equal(result.team.length, 3);
});

test("recommendTeam can return a team of size one", () => {
    const pokemon = [
        createPokemon("PIKACHU"),
        createPokemon("CHARMANDER")
    ];

    const result = createService().recommendTeam(
        pokemon,
        [createPokemon("RATTATA")],
        1
    );

    assert.equal(result.team.length, 1);
});

test("recommendTeam returns an empty team when size is zero", () => {
    const result = createService().recommendTeam(
        [createPokemon("PIKACHU")],
        [createPokemon("RATTATA")],
        0
    );

    assert.deepEqual(result.team, []);
    assert.equal(result.ranking.length, 1);
});

test("recommendTeam returns all candidates when fewer than six are available", () => {
    const pokemon = [
        createPokemon("PIKACHU"),
        createPokemon("CHARMANDER"),
        createPokemon("SQUIRTLE")
    ];

    const result = createService().recommendTeam(
        pokemon,
        [createPokemon("RATTATA")]
    );

    assert.equal(result.team.length, 3);
});

test("recommendTeam returns all eligible candidates in ranking", () => {
    const pokemon = Array.from(
        { length: 9 },
        (_, index) => createPokemon(`MON_${index}`, index + 1)
    );

    const result = createService().recommendTeam(
        pokemon,
        [createPokemon("OPPONENT")]
    );

    assert.equal(result.team.length, 6);
    assert.equal(result.ranking.length, 9);
});

// --------------------------------------------------
// recommendTeam: availability integration
// --------------------------------------------------

test("recommendTeam filters unavailable Pokémon before ranking", () => {
    const pokemon = [
        createPokemon("PIKACHU", 20, "ELECTRIC"),
        createPokemon("CHARMANDER", 10, "FIRE"),
        createPokemon("SQUIRTLE", 15, "WATER")
    ];

    const { service: availability } = createAvailabilityService(
        species => species !== "PIKACHU"
    );

    const result = createService(availability).recommendTeam(
        pokemon,
        [createPokemon("BULBASAUR", 10, "GRASS")]
    );

    assert.deepEqual(
        result.team.map(member => member.species),
        ["CHARMANDER", "SQUIRTLE"]
    );

    assert.equal(
        result.ranking.some(item => item.pokemon.species === "PIKACHU"),
        false
    );
});

test("recommendTeam passes context to availability filtering", () => {
    const context = { location: "CERULEAN_CITY" };
    const pokemon = [createPokemon("PIKACHU")];
    const { service: availability, calls } = createAvailabilityService(true);

    createService(availability).recommendTeam(
        pokemon,
        [createPokemon("RATTATA")],
        6,
        context
    );

    assert.strictEqual(calls[0].context, context);
});

test("recommendTeam uses default context when none is supplied", () => {
    const pokemon = [createPokemon("PIKACHU")];
    const { service: availability, calls } = createAvailabilityService(true);

    createService(availability).recommendTeam(
        pokemon,
        [createPokemon("RATTATA")]
    );

    assert.deepEqual(calls[0].context, {});
});

test("recommendTeam can return an empty team when no Pokémon are available", () => {
    const { service: availability } = createAvailabilityService(false);

    const result = createService(availability).recommendTeam(
        [createPokemon("PIKACHU"), createPokemon("CHARMANDER")],
        [createPokemon("RATTATA")]
    );

    assert.deepEqual(result, {
        success: true,
        team: [],
        ranking: []
    });
});

test("recommendTeam propagates availability errors", () => {
    const service = createService({
        isAvailable() {
            throw new Error("Availability failed");
        }
    });

    assert.throws(
        () => service.recommendTeam(
            [createPokemon("PIKACHU")],
            [createPokemon("RATTATA")]
        ),
        /Availability failed/
    );
});

// --------------------------------------------------
// createSummary
// --------------------------------------------------

test("createSummary returns recommended species and count", () => {
    const service = createService();

    assert.deepEqual(
        service.createSummary({
            team: [
                createPokemon("PIKACHU"),
                createPokemon("CHARMANDER"),
                createPokemon("SQUIRTLE")
            ]
        }),
        {
            recommended: ["PIKACHU", "CHARMANDER", "SQUIRTLE"],
            count: 3
        }
    );
});

test("createSummary handles an empty team", () => {
    assert.deepEqual(
        createService().createSummary({ team: [] }),
        {
            recommended: [],
            count: 0
        }
    );
});

test("createSummary preserves team order", () => {
    assert.deepEqual(
        createService().createSummary({
            team: [
                createPokemon("SQUIRTLE"),
                createPokemon("PIKACHU"),
                createPokemon("CHARMANDER")
            ]
        }).recommended,
        ["SQUIRTLE", "PIKACHU", "CHARMANDER"]
    );
});

test("createSummary reads species from each Pokémon", () => {
    assert.deepEqual(
        createService().createSummary({
            team: [
                { species: "MEW" },
                { species: "MEWTWO" }
            ]
        }),
        {
            recommended: ["MEW", "MEWTWO"],
            count: 2
        }
    );
});

test("createSummary does not include ranking scores", () => {
    const result = createService().createSummary({
        team: [createPokemon("PIKACHU")],
        ranking: [{ pokemon: createPokemon("PIKACHU"), score: 55 }]
    });

    assert.deepEqual(result, {
        recommended: ["PIKACHU"],
        count: 1
    });
});

test("createSummary does not mutate the input team", () => {
    const team = [
        createPokemon("PIKACHU"),
        createPokemon("CHARMANDER")
    ];
    const original = [...team];

    createService().createSummary({ team });

    assert.deepEqual(team, original);
});

test("createSummary throws when result is missing", () => {
    assert.throws(
        () => createService().createSummary(undefined),
        TypeError
    );
});

test("createSummary throws when team is missing", () => {
    assert.throws(
        () => createService().createSummary({}),
        TypeError
    );

    assert.throws(
        () => createService().createSummary({ team: null }),
        TypeError
    );
});

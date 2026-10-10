"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const StarterSelectionService = require("../scripts/services/starter-selection-service");

function createService() {
    return new StarterSelectionService();
}

function createPlayerState(starter = null) {
    return starter ? { starter } : {};
}

const FAMILIES = {
    BULBASAUR: ["BULBASAUR", "IVYSAUR", "VENUSAUR"],
    CHARMANDER: ["CHARMANDER", "CHARMELEON", "CHARIZARD"],
    SQUIRTLE: ["SQUIRTLE", "WARTORTLE", "BLASTOISE"]
};

const ALL_STARTERS = Object.values(FAMILIES).flat();

// --------------------------------------------------
// Constructor and starter families
// --------------------------------------------------

test("constructor creates a StarterSelectionService instance", () => {
    assert.ok(createService() instanceof StarterSelectionService);
});

test("constructor initializes the three starter families", () => {
    assert.deepEqual(createService().starterFamilies, FAMILIES);
});

test("constructor creates independent family objects", () => {
    assert.notStrictEqual(
        createService().starterFamilies,
        createService().starterFamilies
    );
});

test("starter families contain three Pokémon each", () => {
    const service = createService();

    for (const family of Object.values(service.starterFamilies)) {
        assert.equal(family.length, 3);
    }
});

test("starter families include Bulbasaur and its evolutions", () => {
    assert.deepEqual(
        createService().starterFamilies.BULBASAUR,
        ["BULBASAUR", "IVYSAUR", "VENUSAUR"]
    );
});

test("starter families include Charmander and its evolutions", () => {
    assert.deepEqual(
        createService().starterFamilies.CHARMANDER,
        ["CHARMANDER", "CHARMELEON", "CHARIZARD"]
    );
});

test("starter families include Squirtle and its evolutions", () => {
    assert.deepEqual(
        createService().starterFamilies.SQUIRTLE,
        ["SQUIRTLE", "WARTORTLE", "BLASTOISE"]
    );
});

// --------------------------------------------------
// selectStarter
// --------------------------------------------------

test("selectStarter selects Bulbasaur", () => {
    const playerState = {};

    assert.deepEqual(
        createService().selectStarter(playerState, "BULBASAUR"),
        { success: true, starter: "BULBASAUR" }
    );

    assert.equal(playerState.starter, "BULBASAUR");
});

test("selectStarter selects Charmander", () => {
    const playerState = {};

    assert.deepEqual(
        createService().selectStarter(playerState, "CHARMANDER"),
        { success: true, starter: "CHARMANDER" }
    );

    assert.equal(playerState.starter, "CHARMANDER");
});

test("selectStarter selects Squirtle", () => {
    const playerState = {};

    assert.deepEqual(
        createService().selectStarter(playerState, "SQUIRTLE"),
        { success: true, starter: "SQUIRTLE" }
    );

    assert.equal(playerState.starter, "SQUIRTLE");
});

test("selectStarter returns the selected starter in its result", () => {
    const playerState = {};

    const result = createService().selectStarter(
        playerState,
        "BULBASAUR"
    );

    assert.equal(result.starter, playerState.starter);
});

test("selectStarter allows replacing an existing valid selection", () => {
    const playerState = { starter: "BULBASAUR" };

    const result = createService().selectStarter(
        playerState,
        "CHARMANDER"
    );

    assert.deepEqual(result, {
        success: true,
        starter: "CHARMANDER"
    });

    assert.equal(playerState.starter, "CHARMANDER");
});

test("selectStarter does not change player state for an invalid starter", () => {
    const playerState = { starter: "BULBASAUR" };

    const result = createService().selectStarter(
        playerState,
        "PIKACHU"
    );

    assert.deepEqual(result, {
        success: false,
        reason: "Invalid starter"
    });

    assert.equal(playerState.starter, "BULBASAUR");
});

test("selectStarter rejects an empty starter string", () => {
    assert.deepEqual(
        createService().selectStarter({}, ""),
        {
            success: false,
            reason: "Invalid starter"
        }
    );
});

test("selectStarter rejects a lowercase starter name", () => {
    assert.deepEqual(
        createService().selectStarter({}, "bulbasaur"),
        {
            success: false,
            reason: "Invalid starter"
        }
    );
});

test("selectStarter rejects an evolved Pokémon as the initial starter", () => {
    for (const starter of ["IVYSAUR", "VENUSAUR", "CHARMELEON",
        "CHARIZARD", "WARTORTLE", "BLASTOISE"]) {
        assert.deepEqual(
            createService().selectStarter({}, starter),
            {
                success: false,
                reason: "Invalid starter"
            }
        );
    }
});

test("selectStarter rejects null as a starter", () => {
    assert.deepEqual(
        createService().selectStarter({}, null),
        {
            success: false,
            reason: "Invalid starter"
        }
    );
});

test("selectStarter rejects undefined as a starter", () => {
    assert.deepEqual(
        createService().selectStarter({}, undefined),
        {
            success: false,
            reason: "Invalid starter"
        }
    );
});

test("selectStarter rejects a numeric starter", () => {
    assert.deepEqual(
        createService().selectStarter({}, 123),
        {
            success: false,
            reason: "Invalid starter"
        }
    );
});

test("selectStarter rejects an object starter", () => {
    assert.deepEqual(
        createService().selectStarter({}, { species: "BULBASAUR" }),
        {
            success: false,
            reason: "Invalid starter"
        }
    );
});

test("selectStarter rejects a missing player state for a valid starter", () => {
    assert.throws(
        () => createService().selectStarter(null, "BULBASAUR"),
        TypeError
    );
});

test("selectStarter does not validate player state before an invalid starter", () => {
    assert.deepEqual(
        createService().selectStarter(null, "PIKACHU"),
        {
            success: false,
            reason: "Invalid starter"
        }
    );
});

// --------------------------------------------------
// getStarter
// --------------------------------------------------

test("getStarter returns the selected starter", () => {
    assert.equal(
        createService().getStarter({ starter: "BULBASAUR" }),
        "BULBASAUR"
    );
});

test("getStarter returns Charmander when selected", () => {
    assert.equal(
        createService().getStarter({ starter: "CHARMANDER" }),
        "CHARMANDER"
    );
});

test("getStarter returns Squirtle when selected", () => {
    assert.equal(
        createService().getStarter({ starter: "SQUIRTLE" }),
        "SQUIRTLE"
    );
});

test("getStarter returns null when no starter is selected", () => {
    assert.equal(createService().getStarter({}), null);
});

test("getStarter returns null when starter is undefined", () => {
    assert.equal(
        createService().getStarter({ starter: undefined }),
        null
    );
});

test("getStarter returns null for a null starter", () => {
    assert.equal(
        createService().getStarter({ starter: null }),
        null
    );
});

test("getStarter returns null for an empty starter string", () => {
    assert.equal(
        createService().getStarter({ starter: "" }),
        null
    );
});

test("getStarter returns null for a false starter value", () => {
    assert.equal(
        createService().getStarter({ starter: false }),
        null
    );
});

test("getStarter preserves a truthy stored value", () => {
    assert.equal(
        createService().getStarter({ starter: "UNKNOWN_STARTER" }),
        "UNKNOWN_STARTER"
    );
});

test("getStarter throws for a missing player state", () => {
    assert.throws(
        () => createService().getStarter(null),
        TypeError
    );
});

// --------------------------------------------------
// getStarterFamily
// --------------------------------------------------

test("getStarterFamily returns the Bulbasaur family", () => {
    assert.deepEqual(
        createService().getStarterFamily("BULBASAUR"),
        FAMILIES.BULBASAUR
    );
});

test("getStarterFamily returns the Charmander family", () => {
    assert.deepEqual(
        createService().getStarterFamily("CHARMANDER"),
        FAMILIES.CHARMANDER
    );
});

test("getStarterFamily returns the Squirtle family", () => {
    assert.deepEqual(
        createService().getStarterFamily("SQUIRTLE"),
        FAMILIES.SQUIRTLE
    );
});

test("getStarterFamily returns an empty array for an unknown starter", () => {
    assert.deepEqual(
        createService().getStarterFamily("PIKACHU"),
        []
    );
});

test("getStarterFamily returns an empty array for an empty string", () => {
    assert.deepEqual(createService().getStarterFamily(""), []);
});

test("getStarterFamily returns an empty array for null", () => {
    assert.deepEqual(createService().getStarterFamily(null), []);
});

test("getStarterFamily returns an empty array for undefined", () => {
    assert.deepEqual(createService().getStarterFamily(undefined), []);
});

test("getStarterFamily uses exact case-sensitive matching", () => {
    assert.deepEqual(
        createService().getStarterFamily("bulbasaur"),
        []
    );
});

test("getStarterFamily returns the underlying family array", () => {
    const service = createService();

    assert.strictEqual(
        service.getStarterFamily("BULBASAUR"),
        service.starterFamilies.BULBASAUR
    );
});

// --------------------------------------------------
// getSelectedStarterFamily
// --------------------------------------------------

test("getSelectedStarterFamily returns the selected Bulbasaur family", () => {
    assert.deepEqual(
        createService().getSelectedStarterFamily(
            createPlayerState("BULBASAUR")
        ),
        FAMILIES.BULBASAUR
    );
});

test("getSelectedStarterFamily returns the selected Charmander family", () => {
    assert.deepEqual(
        createService().getSelectedStarterFamily(
            createPlayerState("CHARMANDER")
        ),
        FAMILIES.CHARMANDER
    );
});

test("getSelectedStarterFamily returns the selected Squirtle family", () => {
    assert.deepEqual(
        createService().getSelectedStarterFamily(
            createPlayerState("SQUIRTLE")
        ),
        FAMILIES.SQUIRTLE
    );
});

test("getSelectedStarterFamily returns an empty array when no starter is selected", () => {
    assert.deepEqual(
        createService().getSelectedStarterFamily({}),
        []
    );
});

test("getSelectedStarterFamily returns an empty array for an empty starter", () => {
    assert.deepEqual(
        createService().getSelectedStarterFamily({ starter: "" }),
        []
    );
});

test("getSelectedStarterFamily returns an empty array for an unknown starter", () => {
    assert.deepEqual(
        createService().getSelectedStarterFamily(
            createPlayerState("UNKNOWN_STARTER")
        ),
        []
    );
});

test("getSelectedStarterFamily throws for missing player state", () => {
    assert.throws(
        () => createService().getSelectedStarterFamily(null),
        TypeError
    );
});

// --------------------------------------------------
// getBlockedPokemon
// --------------------------------------------------

test("getBlockedPokemon returns no blocked Pokémon without a selection", () => {
    assert.deepEqual(
        createService().getBlockedPokemon({}),
        []
    );
});

test("getBlockedPokemon blocks the Charmander and Squirtle families for Bulbasaur", () => {
    assert.deepEqual(
        createService().getBlockedPokemon(
            createPlayerState("BULBASAUR")
        ),
        [
            ...FAMILIES.CHARMANDER,
            ...FAMILIES.SQUIRTLE
        ]
    );
});

test("getBlockedPokemon blocks the Bulbasaur and Squirtle families for Charmander", () => {
    assert.deepEqual(
        createService().getBlockedPokemon(
            createPlayerState("CHARMANDER")
        ),
        [
            ...FAMILIES.BULBASAUR,
            ...FAMILIES.SQUIRTLE
        ]
    );
});

test("getBlockedPokemon blocks the Bulbasaur and Charmander families for Squirtle", () => {
    assert.deepEqual(
        createService().getBlockedPokemon(
            createPlayerState("SQUIRTLE")
        ),
        [
            ...FAMILIES.BULBASAUR,
            ...FAMILIES.CHARMANDER
        ]
    );
});

test("getBlockedPokemon returns six blocked Pokémon for a valid selection", () => {
    for (const starter of Object.keys(FAMILIES)) {
        assert.equal(
            createService().getBlockedPokemon(
                createPlayerState(starter)
            ).length,
            6
        );
    }
});

test("getBlockedPokemon never blocks the selected starter family", () => {
    const service = createService();

    for (const starter of Object.keys(FAMILIES)) {
        const blocked = service.getBlockedPokemon(
            createPlayerState(starter)
        );

        for (const species of FAMILIES[starter]) {
            assert.equal(blocked.includes(species), false);
        }
    }
});

test("getBlockedPokemon preserves the family ordering", () => {
    const blocked = createService().getBlockedPokemon(
        createPlayerState("CHARMANDER")
    );

    assert.deepEqual(blocked.slice(0, 3), FAMILIES.BULBASAUR);
    assert.deepEqual(blocked.slice(3, 6), FAMILIES.SQUIRTLE);
});

test("getBlockedPokemon returns a new array on each call", () => {
    const service = createService();
    const playerState = createPlayerState("BULBASAUR");

    assert.notStrictEqual(
        service.getBlockedPokemon(playerState),
        service.getBlockedPokemon(playerState)
    );
});

test("getBlockedPokemon does not modify the player state", () => {
    const playerState = createPlayerState("BULBASAUR");
    const original = { ...playerState };

    createService().getBlockedPokemon(playerState);

    assert.deepEqual(playerState, original);
});

test("getBlockedPokemon blocks all known starter families for an unknown selection", () => {
    assert.deepEqual(
        createService().getBlockedPokemon(
            createPlayerState("UNKNOWN_STARTER")
        ),
        ALL_STARTERS
    );
});

test("getBlockedPokemon throws for a missing player state", () => {
    assert.throws(
        () => createService().getBlockedPokemon(null),
        TypeError
    );
});

// --------------------------------------------------
// isAllowed
// --------------------------------------------------

test("isAllowed permits all Pokémon when no starter is selected", () => {
    const service = createService();

    for (const species of ALL_STARTERS) {
        assert.equal(service.isAllowed({}, species), true);
    }

    assert.equal(service.isAllowed({}, "PIKACHU"), true);
});

test("isAllowed permits Pokémon from the selected family", () => {
    const service = createService();

    for (const species of FAMILIES.BULBASAUR) {
        assert.equal(
            service.isAllowed(createPlayerState("BULBASAUR"), species),
            true
        );
    }
});

test("isAllowed blocks Pokémon from other starter families", () => {
    const service = createService();
    const playerState = createPlayerState("BULBASAUR");

    for (const species of [
        ...FAMILIES.CHARMANDER,
        ...FAMILIES.SQUIRTLE
    ]) {
        assert.equal(service.isAllowed(playerState, species), false);
    }
});

test("isAllowed permits non-starter Pokémon after a starter is selected", () => {
    const service = createService();
    const playerState = createPlayerState("BULBASAUR");

    for (const species of ["PIKACHU", "PIDGEY", "RATTATA", "MEW"]) {
        assert.equal(service.isAllowed(playerState, species), true);
    }
});

test("isAllowed uses exact species matching", () => {
    const service = createService();
    const playerState = createPlayerState("BULBASAUR");

    assert.equal(service.isAllowed(playerState, "CHARMANDER"), false);
    assert.equal(service.isAllowed(playerState, "charmander"), true);
    assert.equal(service.isAllowed(playerState, "CharMANDER"), true);
});

test("isAllowed permits an empty species string", () => {
    assert.equal(
        createService().isAllowed(
            createPlayerState("BULBASAUR"),
            ""
        ),
        true
    );
});

test("isAllowed permits null species", () => {
    assert.equal(
        createService().isAllowed(
            createPlayerState("BULBASAUR"),
            null
        ),
        true
    );
});

test("isAllowed does not change the player state", () => {
    const playerState = createPlayerState("SQUIRTLE");
    const original = { ...playerState };

    createService().isAllowed(playerState, "CHARMANDER");

    assert.deepEqual(playerState, original);
});

test("isAllowed throws for a missing player state", () => {
    assert.throws(
        () => createService().isAllowed(null, "PIKACHU"),
        TypeError
    );
});

// --------------------------------------------------
// belongsToSelectedFamily
// --------------------------------------------------

test("belongsToSelectedFamily returns true when no starter is selected", () => {
    const service = createService();

    for (const species of ALL_STARTERS) {
        assert.equal(service.belongsToSelectedFamily({}, species), true);
    }

    assert.equal(service.belongsToSelectedFamily({}, "PIKACHU"), true);
});

test("belongsToSelectedFamily accepts every Pokémon in the selected family", () => {
    const service = createService();

    for (const starter of Object.keys(FAMILIES)) {
        for (const species of FAMILIES[starter]) {
            assert.equal(
                service.belongsToSelectedFamily(
                    createPlayerState(starter),
                    species
                ),
                true
            );
        }
    }
});

test("belongsToSelectedFamily rejects Pokémon in other starter families", () => {
    const service = createService();

    assert.equal(
        service.belongsToSelectedFamily(
            createPlayerState("BULBASAUR"),
            "CHARMANDER"
        ),
        false
    );

    assert.equal(
        service.belongsToSelectedFamily(
            createPlayerState("CHARMANDER"),
            "SQUIRTLE"
        ),
        false
    );

    assert.equal(
        service.belongsToSelectedFamily(
            createPlayerState("SQUIRTLE"),
            "BULBASAUR"
        ),
        false
    );
});

test("belongsToSelectedFamily rejects unrelated Pokémon after selection", () => {
    const service = createService();

    assert.equal(
        service.belongsToSelectedFamily(
            createPlayerState("BULBASAUR"),
            "PIKACHU"
        ),
        false
    );
});

test("belongsToSelectedFamily uses exact species matching", () => {
    const service = createService();
    const playerState = createPlayerState("BULBASAUR");

    assert.equal(
        service.belongsToSelectedFamily(playerState, "IVYSAUR"),
        true
    );

    assert.equal(
        service.belongsToSelectedFamily(playerState, "ivysaur"),
        false
    );
});

test("belongsToSelectedFamily returns true for an unknown selected starter", () => {
    assert.equal(
        createService().belongsToSelectedFamily(
            createPlayerState("UNKNOWN_STARTER"),
            "PIKACHU"
        ),
        true
    );
});

test("belongsToSelectedFamily throws for a missing player state", () => {
    assert.throws(
        () => createService().belongsToSelectedFamily(null, "PIKACHU"),
        TypeError
    );
});

// --------------------------------------------------
// filterAvailablePokemon
// --------------------------------------------------

test("filterAvailablePokemon returns the original list when no starter is selected", () => {
    const service = createService();
    const pokemon = [
        "BULBASAUR",
        "CHARMANDER",
        "SQUIRTLE",
        "PIKACHU"
    ];

    assert.deepEqual(
        service.filterAvailablePokemon({}, pokemon),
        pokemon
    );
});

test("filterAvailablePokemon removes other starter families", () => {
    const service = createService();
    const pokemon = [
        "BULBASAUR",
        "IVYSAUR",
        "VENUSAUR",
        "CHARMANDER",
        "CHARMELEON",
        "CHARIZARD",
        "SQUIRTLE",
        "WARTORTLE",
        "BLASTOISE",
        "PIKACHU"
    ];

    assert.deepEqual(
        service.filterAvailablePokemon(
            createPlayerState("BULBASAUR"),
            pokemon
        ),
        [
            "BULBASAUR",
            "IVYSAUR",
            "VENUSAUR",
            "PIKACHU"
        ]
    );
});

test("filterAvailablePokemon handles all three starter selections", () => {
    const service = createService();

    for (const starter of Object.keys(FAMILIES)) {
        const result = service.filterAvailablePokemon(
            createPlayerState(starter),
            ALL_STARTERS
        );

        assert.deepEqual(
            result,
            ALL_STARTERS.filter(
                species => !service.getBlockedPokemon(
                    createPlayerState(starter)
                ).includes(species)
            )
        );
    }
});

test("filterAvailablePokemon supports objects with species properties", () => {
    const service = createService();
    const pokemon = [
        { species: "BULBASAUR", level: 5 },
        { species: "CHARMANDER", level: 5 },
        { species: "PIKACHU", level: 10 }
    ];

    assert.deepEqual(
        service.filterAvailablePokemon(
            createPlayerState("BULBASAUR"),
            pokemon
        ),
        [
            { species: "BULBASAUR", level: 5 },
            { species: "PIKACHU", level: 10 }
        ]
    );
});

test("filterAvailablePokemon preserves original Pokémon object references", () => {
    const service = createService();
    const bulbasaur = { species: "BULBASAUR", level: 5 };
    const pikachu = { species: "PIKACHU", level: 10 };

    const result = service.filterAvailablePokemon(
        createPlayerState("BULBASAUR"),
        [bulbasaur, pikachu]
    );

    assert.strictEqual(result[0], bulbasaur);
    assert.strictEqual(result[1], pikachu);
});

test("filterAvailablePokemon does not mutate the input list", () => {
    const service = createService();
    const pokemon = [
        "BULBASAUR",
        "CHARMANDER",
        "SQUIRTLE",
        "PIKACHU"
    ];
    const original = [...pokemon];

    service.filterAvailablePokemon(
        createPlayerState("BULBASAUR"),
        pokemon
    );

    assert.deepEqual(pokemon, original);
});

test("filterAvailablePokemon returns a new array", () => {
    const service = createService();
    const pokemon = ["BULBASAUR", "PIKACHU"];

    assert.notStrictEqual(
        service.filterAvailablePokemon({}, pokemon),
        pokemon
    );
});

test("filterAvailablePokemon returns an empty array for a non-array input", () => {
    const service = createService();

    for (const input of [null, undefined, {}, "PIKACHU", 123, false]) {
        assert.deepEqual(
            service.filterAvailablePokemon({}, input),
            []
        );
    }
});

test("filterAvailablePokemon returns an empty array for an empty list", () => {
    assert.deepEqual(
        createService().filterAvailablePokemon({}, []),
        []
    );
});

test("filterAvailablePokemon keeps entries without a species property when not blocked", () => {
    const service = createService();
    const entry = { name: "Unknown entry" };

    assert.deepEqual(
        service.filterAvailablePokemon(
            createPlayerState("BULBASAUR"),
            [entry]
        ),
        [entry]
    );
});

test("filterAvailablePokemon uses the entry itself when species is falsey", () => {
    const service = createService();
    const entry = { species: "", name: "Unknown entry" };

    assert.deepEqual(
        service.filterAvailablePokemon(
            createPlayerState("BULBASAUR"),
            [entry]
        ),
        [entry]
    );
});

test("filterAvailablePokemon preserves list order", () => {
    const service = createService();
    const pokemon = [
        "PIKACHU",
        "BULBASAUR",
        "MEW",
        "VENUSAUR",
        "RATTATA"
    ];

    assert.deepEqual(
        service.filterAvailablePokemon(
            createPlayerState("BULBASAUR"),
            pokemon
        ),
        ["PIKACHU", "BULBASAUR", "MEW", "VENUSAUR", "RATTATA"]
    );
});

test("filterAvailablePokemon blocks every known starter when selection is unknown", () => {
    const service = createService();

    assert.deepEqual(
        service.filterAvailablePokemon(
            createPlayerState("UNKNOWN_STARTER"),
            ALL_STARTERS
        ),
        []
    );
});

test("filterAvailablePokemon permits non-starter Pokémon for an unknown selection", () => {
    assert.deepEqual(
        createService().filterAvailablePokemon(
            createPlayerState("UNKNOWN_STARTER"),
            ["PIKACHU", "MEW"]
        ),
        ["PIKACHU", "MEW"]
    );
});

test("filterAvailablePokemon handles duplicate species without deduplicating", () => {
    assert.deepEqual(
        createService().filterAvailablePokemon(
            createPlayerState("BULBASAUR"),
            ["BULBASAUR", "PIKACHU", "PIKACHU", "VENUSAUR"]
        ),
        ["BULBASAUR", "PIKACHU", "PIKACHU", "VENUSAUR"]
    );
});

// --------------------------------------------------
// Combined selection behavior
// --------------------------------------------------

test("selecting a starter updates all related queries", () => {
    const service = createService();
    const playerState = {};

    const selection = service.selectStarter(
        playerState,
        "CHARMANDER"
    );

    assert.equal(selection.success, true);
    assert.equal(service.getStarter(playerState), "CHARMANDER");
    assert.deepEqual(
        service.getSelectedStarterFamily(playerState),
        FAMILIES.CHARMANDER
    );
    assert.equal(
        service.isAllowed(playerState, "CHARMELEON"),
        true
    );
    assert.equal(
        service.isAllowed(playerState, "BULBASAUR"),
        false
    );
    assert.equal(
        service.belongsToSelectedFamily(playerState, "CHARIZARD"),
        true
    );
});

test("changing the starter changes the blocked families", () => {
    const service = createService();
    const playerState = { starter: "BULBASAUR" };

    assert.equal(
        service.isAllowed(playerState, "BULBASAUR"),
        true
    );
    assert.equal(
        service.isAllowed(playerState, "CHARMANDER"),
        false
    );

    service.selectStarter(playerState, "SQUIRTLE");

    assert.equal(
        service.isAllowed(playerState, "SQUIRTLE"),
        true
    );
    assert.equal(
        service.isAllowed(playerState, "BULBASAUR"),
        false
    );
    assert.equal(
        service.isAllowed(playerState, "CHARMANDER"),
        false
    );
});

test("an invalid selection preserves previous filtering behavior", () => {
    const service = createService();
    const playerState = { starter: "BULBASAUR" };

    service.selectStarter(playerState, "PIKACHU");

    assert.equal(playerState.starter, "BULBASAUR");
    assert.equal(
        service.isAllowed(playerState, "CHARMANDER"),
        false
    );
    assert.equal(
        service.isAllowed(playerState, "PIKACHU"),
        true
    );
});

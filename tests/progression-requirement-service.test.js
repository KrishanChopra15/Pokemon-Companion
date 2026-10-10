"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const ProgressionRequirementService =
    require("../scripts/services/progression-requirement-service");

function createService() {
    return new ProgressionRequirementService();
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a ProgressionRequirementService instance", () => {
    const service = createService();

    assert.ok(service instanceof ProgressionRequirementService);
});

// --------------------------------------------------
// check
// --------------------------------------------------

test("check allows null requirements", () => {
    const service = createService();

    assert.deepEqual(
        service.check(null, {}),
        { available: true }
    );
});

test("check allows undefined requirements", () => {
    const service = createService();

    assert.deepEqual(
        service.check(undefined, {}),
        { available: true }
    );
});

test("check allows false requirements", () => {
    const service = createService();

    assert.deepEqual(
        service.check(false, {}),
        { available: true }
    );
});

test("check allows an empty requirement object", () => {
    const service = createService();

    assert.deepEqual(
        service.check({}, {}),
        { available: true }
    );
});

test("check allows requirements when every condition is satisfied", () => {
    const service = createService();

    const requirements = {
        badges: ["BOULDER_BADGE"],
        storyFlags: ["BRIDGE_REPAIRED"],
        items: ["BICYCLE"],
        locations: ["PALLET_TOWN"],
        abilities: ["CAN_USE_CUT"],
        championDefeated: true,
        nationalDex: true
    };

    const playerState = {
        badges: ["BOULDER_BADGE"],
        storyFlags: ["BRIDGE_REPAIRED"],
        items: {
            BICYCLE: 1
        },
        locations: ["PALLET_TOWN"],
        abilities: ["CAN_USE_CUT"],
        championDefeated: true,
        nationalDex: true
    };

    assert.deepEqual(
        service.check(requirements, playerState),
        { available: true }
    );
});

test("check returns the first failing result", () => {
    const service = createService();

    assert.deepEqual(
        service.check(
            {
                badges: ["CASCADE_BADGE"],
                storyFlags: ["BRIDGE_REPAIRED"]
            },
            {}
        ),
        {
            available: false,
            reason: "Missing badge: CASCADE_BADGE"
        }
    );
});

test("check prioritizes badges before story flags", () => {
    const service = createService();

    const result = service.check(
        {
            badges: ["BOULDER_BADGE"],
            storyFlags: ["BRIDGE_REPAIRED"]
        },
        {}
    );

    assert.equal(result.reason, "Missing badge: BOULDER_BADGE");
});

test("check prioritizes story flags before items", () => {
    const service = createService();

    const result = service.check(
        {
            storyFlags: ["BRIDGE_REPAIRED"],
            items: ["BICYCLE"]
        },
        {}
    );

    assert.equal(result.reason, "Missing story flag: BRIDGE_REPAIRED");
});

test("check prioritizes items before locations", () => {
    const service = createService();

    const result = service.check(
        {
            items: ["BICYCLE"],
            locations: ["PALLET_TOWN"]
        },
        {}
    );

    assert.equal(result.reason, "Missing item: BICYCLE");
});

test("check prioritizes locations before abilities", () => {
    const service = createService();

    const result = service.check(
        {
            locations: ["PALLET_TOWN"],
            abilities: ["CAN_USE_CUT"]
        },
        {}
    );

    assert.equal(result.reason, "Location unavailable: PALLET_TOWN");
});

test("check prioritizes abilities before Champion status", () => {
    const service = createService();

    const result = service.check(
        {
            abilities: ["CAN_USE_CUT"],
            championDefeated: true
        },
        {}
    );

    assert.equal(result.reason, "Missing ability: CAN_USE_CUT");
});

test("check prioritizes Champion status before National Dex", () => {
    const service = createService();

    const result = service.check(
        {
            championDefeated: true,
            nationalDex: true
        },
        {}
    );

    assert.equal(result.reason, "Champion not defeated");
});

test("check returns the National Dex failure when it is the only unmet requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.check(
            { nationalDex: true },
            {}
        ),
        {
            available: false,
            reason: "National Dex required"
        }
    );
});

test("check does not mutate the requirements object", () => {
    const service = createService();

    const requirements = {
        badges: ["BOULDER_BADGE"],
        items: ["BICYCLE"]
    };

    const original = structuredClone(requirements);

    service.check(requirements, {});

    assert.deepEqual(requirements, original);
});

test("check does not mutate the player state", () => {
    const service = createService();

    const state = {
        badges: ["BOULDER_BADGE"],
        items: { BICYCLE: 1 },
        locations: ["PALLET_TOWN"]
    };

    const original = structuredClone(state);

    service.check(
        {
            badges: ["BOULDER_BADGE"],
            items: ["BICYCLE"],
            locations: ["PALLET_TOWN"]
        },
        state
    );

    assert.deepEqual(state, original);
});

// --------------------------------------------------
// Badges
// --------------------------------------------------

test("checkBadges allows missing badge requirements", () => {
    const service = createService();

    assert.deepEqual(
        service.checkBadges(undefined, {}),
        { available: true }
    );
});

test("checkBadges allows a null badge requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkBadges(null, {}),
        { available: true }
    );
});

test("checkBadges allows an empty badge list", () => {
    const service = createService();

    assert.deepEqual(
        service.checkBadges([], {}),
        { available: true }
    );
});

test("checkBadges rejects a missing badge", () => {
    const service = createService();

    assert.deepEqual(
        service.checkBadges(
            ["BOULDER_BADGE"],
            { badges: [] }
        ),
        {
            available: false,
            reason: "Missing badge: BOULDER_BADGE"
        }
    );
});

test("checkBadges allows an owned badge", () => {
    const service = createService();

    assert.deepEqual(
        service.checkBadges(
            ["BOULDER_BADGE"],
            { badges: ["BOULDER_BADGE"] }
        ),
        { available: true }
    );
});

test("checkBadges requires every listed badge", () => {
    const service = createService();

    assert.deepEqual(
        service.checkBadges(
            ["BOULDER_BADGE", "CASCADE_BADGE"],
            { badges: ["BOULDER_BADGE"] }
        ),
        {
            available: false,
            reason: "Missing badge: CASCADE_BADGE"
        }
    );
});

test("checkBadges returns the first missing badge", () => {
    const service = createService();

    assert.deepEqual(
        service.checkBadges(
            ["BOULDER_BADGE", "CASCADE_BADGE"],
            {}
        ),
        {
            available: false,
            reason: "Missing badge: BOULDER_BADGE"
        }
    );
});

test("checkBadges supports badges supplied in a different order", () => {
    const service = createService();

    assert.deepEqual(
        service.checkBadges(
            ["CASCADE_BADGE", "BOULDER_BADGE"],
            { badges: ["BOULDER_BADGE", "CASCADE_BADGE"] }
        ),
        { available: true }
    );
});

test("checkBadges uses exact badge matching", () => {
    const service = createService();

    assert.deepEqual(
        service.checkBadges(
            ["BOULDER_BADGE"],
            { badges: ["boulder_badge"] }
        ),
        {
            available: false,
            reason: "Missing badge: BOULDER_BADGE"
        }
    );
});

test("checkBadges treats a missing badges array as empty", () => {
    const service = createService();

    assert.deepEqual(
        service.checkBadges(["BOULDER_BADGE"], {}),
        {
            available: false,
            reason: "Missing badge: BOULDER_BADGE"
        }
    );
});

// --------------------------------------------------
// Story flags
// --------------------------------------------------

test("checkStoryFlags allows missing flag requirements", () => {
    const service = createService();

    assert.deepEqual(
        service.checkStoryFlags(undefined, {}),
        { available: true }
    );
});

test("checkStoryFlags allows an empty flag list", () => {
    const service = createService();

    assert.deepEqual(
        service.checkStoryFlags([], {}),
        { available: true }
    );
});

test("checkStoryFlags rejects a missing story flag", () => {
    const service = createService();

    assert.deepEqual(
        service.checkStoryFlags(
            ["BRIDGE_REPAIRED"],
            { storyFlags: [] }
        ),
        {
            available: false,
            reason: "Missing story flag: BRIDGE_REPAIRED"
        }
    );
});

test("checkStoryFlags allows a completed story flag", () => {
    const service = createService();

    assert.deepEqual(
        service.checkStoryFlags(
            ["BRIDGE_REPAIRED"],
            { storyFlags: ["BRIDGE_REPAIRED"] }
        ),
        { available: true }
    );
});

test("checkStoryFlags requires every listed flag", () => {
    const service = createService();

    assert.deepEqual(
        service.checkStoryFlags(
            ["BRIDGE_REPAIRED", "ROCKETS_DEFEATED"],
            { storyFlags: ["BRIDGE_REPAIRED"] }
        ),
        {
            available: false,
            reason: "Missing story flag: ROCKETS_DEFEATED"
        }
    );
});

test("checkStoryFlags returns the first missing flag", () => {
    const service = createService();

    assert.deepEqual(
        service.checkStoryFlags(
            ["BRIDGE_REPAIRED", "ROCKETS_DEFEATED"],
            {}
        ),
        {
            available: false,
            reason: "Missing story flag: BRIDGE_REPAIRED"
        }
    );
});

test("checkStoryFlags uses exact flag matching", () => {
    const service = createService();

    assert.deepEqual(
        service.checkStoryFlags(
            ["BRIDGE_REPAIRED"],
            { storyFlags: ["bridge_repaired"] }
        ),
        {
            available: false,
            reason: "Missing story flag: BRIDGE_REPAIRED"
        }
    );
});

test("checkStoryFlags treats a missing storyFlags array as empty", () => {
    const service = createService();

    assert.deepEqual(
        service.checkStoryFlags(["BRIDGE_REPAIRED"], {}),
        {
            available: false,
            reason: "Missing story flag: BRIDGE_REPAIRED"
        }
    );
});

// --------------------------------------------------
// Items
// --------------------------------------------------

test("checkItems allows missing item requirements", () => {
    const service = createService();

    assert.deepEqual(
        service.checkItems(undefined, {}),
        { available: true }
    );
});

test("checkItems allows an empty item list", () => {
    const service = createService();

    assert.deepEqual(
        service.checkItems([], {}),
        { available: true }
    );
});

test("checkItems rejects a missing item", () => {
    const service = createService();

    assert.deepEqual(
        service.checkItems(
            ["BICYCLE"],
            { items: {} }
        ),
        {
            available: false,
            reason: "Missing item: BICYCLE"
        }
    );
});

test("checkItems allows an item with a positive quantity", () => {
    const service = createService();

    assert.deepEqual(
        service.checkItems(
            ["BICYCLE"],
            { items: { BICYCLE: 1 } }
        ),
        { available: true }
    );
});

test("checkItems requires every listed item", () => {
    const service = createService();

    assert.deepEqual(
        service.checkItems(
            ["BICYCLE", "POKE_FLUTE"],
            { items: { BICYCLE: 1 } }
        ),
        {
            available: false,
            reason: "Missing item: POKE_FLUTE"
        }
    );
});

test("checkItems returns the first missing item", () => {
    const service = createService();

    assert.deepEqual(
        service.checkItems(
            ["BICYCLE", "POKE_FLUTE"],
            {}
        ),
        {
            available: false,
            reason: "Missing item: BICYCLE"
        }
    );
});

test("checkItems uses item keys rather than inventory array membership", () => {
    const service = createService();

    assert.deepEqual(
        service.checkItems(
            ["BICYCLE"],
            { items: ["BICYCLE"] }
        ),
        {
            available: false,
            reason: "Missing item: BICYCLE"
        }
    );
});

test("checkItems treats an item quantity of zero as missing", () => {
    const service = createService();

    assert.deepEqual(
        service.checkItems(
            ["POTION"],
            { items: { POTION: 0 } }
        ),
        {
            available: false,
            reason: "Missing item: POTION"
        }
    );
});

test("checkItems treats a missing items object as empty", () => {
    const service = createService();

    assert.deepEqual(
        service.checkItems(["BICYCLE"], {}),
        {
            available: false,
            reason: "Missing item: BICYCLE"
        }
    );
});

// --------------------------------------------------
// Locations
// --------------------------------------------------

test("checkLocations allows missing location requirements", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocations(undefined, {}),
        { available: true }
    );
});

test("checkLocations allows an empty location list", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocations([], {}),
        { available: true }
    );
});

test("checkLocations rejects an unavailable location", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocations(
            ["PALLET_TOWN"],
            { locations: [] }
        ),
        {
            available: false,
            reason: "Location unavailable: PALLET_TOWN"
        }
    );
});

test("checkLocations allows an unlocked location", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocations(
            ["PALLET_TOWN"],
            { locations: ["PALLET_TOWN"] }
        ),
        { available: true }
    );
});

test("checkLocations requires every listed location", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocations(
            ["PALLET_TOWN", "VIRIDIAN_CITY"],
            { locations: ["PALLET_TOWN"] }
        ),
        {
            available: false,
            reason: "Location unavailable: VIRIDIAN_CITY"
        }
    );
});

test("checkLocations returns the first unavailable location", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocations(
            ["PALLET_TOWN", "VIRIDIAN_CITY"],
            {}
        ),
        {
            available: false,
            reason: "Location unavailable: PALLET_TOWN"
        }
    );
});

test("checkLocations uses exact location matching", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocations(
            ["PALLET_TOWN"],
            { locations: ["pallet_town"] }
        ),
        {
            available: false,
            reason: "Location unavailable: PALLET_TOWN"
        }
    );
});

test("checkLocations treats a missing locations array as empty", () => {
    const service = createService();

    assert.deepEqual(
        service.checkLocations(["PALLET_TOWN"], {}),
        {
            available: false,
            reason: "Location unavailable: PALLET_TOWN"
        }
    );
});

// --------------------------------------------------
// Abilities
// --------------------------------------------------

test("checkAbilities allows missing ability requirements", () => {
    const service = createService();

    assert.deepEqual(
        service.checkAbilities(undefined, {}),
        { available: true }
    );
});

test("checkAbilities allows an empty ability list", () => {
    const service = createService();

    assert.deepEqual(
        service.checkAbilities([], {}),
        { available: true }
    );
});

test("checkAbilities rejects a missing ability", () => {
    const service = createService();

    assert.deepEqual(
        service.checkAbilities(
            ["CAN_USE_CUT"],
            { abilities: [] }
        ),
        {
            available: false,
            reason: "Missing ability: CAN_USE_CUT"
        }
    );
});

test("checkAbilities allows an owned ability", () => {
    const service = createService();

    assert.deepEqual(
        service.checkAbilities(
            ["CAN_USE_CUT"],
            { abilities: ["CAN_USE_CUT"] }
        ),
        { available: true }
    );
});

test("checkAbilities requires every listed ability", () => {
    const service = createService();

    assert.deepEqual(
        service.checkAbilities(
            ["CAN_USE_CUT", "CAN_USE_SURF"],
            { abilities: ["CAN_USE_CUT"] }
        ),
        {
            available: false,
            reason: "Missing ability: CAN_USE_SURF"
        }
    );
});

test("checkAbilities returns the first missing ability", () => {
    const service = createService();

    assert.deepEqual(
        service.checkAbilities(
            ["CAN_USE_CUT", "CAN_USE_SURF"],
            {}
        ),
        {
            available: false,
            reason: "Missing ability: CAN_USE_CUT"
        }
    );
});

test("checkAbilities uses exact ability matching", () => {
    const service = createService();

    assert.deepEqual(
        service.checkAbilities(
            ["CAN_USE_CUT"],
            { abilities: ["can_use_cut"] }
        ),
        {
            available: false,
            reason: "Missing ability: CAN_USE_CUT"
        }
    );
});

test("checkAbilities treats a missing abilities array as empty", () => {
    const service = createService();

    assert.deepEqual(
        service.checkAbilities(["CAN_USE_CUT"], {}),
        {
            available: false,
            reason: "Missing ability: CAN_USE_CUT"
        }
    );
});

// --------------------------------------------------
// Champion status
// --------------------------------------------------

test("checkChampion allows a false requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkChampion(false, {}),
        { available: true }
    );
});

test("checkChampion allows an undefined requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkChampion(undefined, {}),
        { available: true }
    );
});

test("checkChampion rejects a required but undefeated Champion", () => {
    const service = createService();

    assert.deepEqual(
        service.checkChampion(true, {}),
        {
            available: false,
            reason: "Champion not defeated"
        }
    );
});

test("checkChampion allows access when the Champion was defeated", () => {
    const service = createService();

    assert.deepEqual(
        service.checkChampion(
            true,
            { championDefeated: true }
        ),
        { available: true }
    );
});

test("checkChampion requires a truthy championDefeated value", () => {
    const service = createService();

    assert.deepEqual(
        service.checkChampion(
            true,
            { championDefeated: false }
        ),
        {
            available: false,
            reason: "Champion not defeated"
        }
    );
});

test("checkChampion allows access when Champion status is not required", () => {
    const service = createService();

    assert.deepEqual(
        service.checkChampion(false, { championDefeated: false }),
        { available: true }
    );
});

// --------------------------------------------------
// National Dex
// --------------------------------------------------

test("checkNationalDex allows a false requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkNationalDex(false, {}),
        { available: true }
    );
});

test("checkNationalDex allows an undefined requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.checkNationalDex(undefined, {}),
        { available: true }
    );
});

test("checkNationalDex rejects a required but unowned National Dex", () => {
    const service = createService();

    assert.deepEqual(
        service.checkNationalDex(true, {}),
        {
            available: false,
            reason: "National Dex required"
        }
    );
});

test("checkNationalDex allows access when National Dex is enabled", () => {
    const service = createService();

    assert.deepEqual(
        service.checkNationalDex(
            true,
            { nationalDex: true }
        ),
        { available: true }
    );
});

test("checkNationalDex rejects a false National Dex status", () => {
    const service = createService();

    assert.deepEqual(
        service.checkNationalDex(
            true,
            { nationalDex: false }
        ),
        {
            available: false,
            reason: "National Dex required"
        }
    );
});

test("checkNationalDex allows access when National Dex is not required", () => {
    const service = createService();

    assert.deepEqual(
        service.checkNationalDex(
            false,
            { nationalDex: false }
        ),
        { available: true }
    );
});

// --------------------------------------------------
// Missing player-state edge cases
// --------------------------------------------------

test("check allows an empty requirement object without player state", () => {
    const service = createService();

    assert.deepEqual(
        service.check({}),
        { available: true }
    );
});

test("checkBadges throws when badges are required but player state is missing", () => {
    const service = createService();

    assert.throws(
        () => service.checkBadges(["BOULDER_BADGE"], undefined),
        TypeError
    );
});

test("checkStoryFlags throws when flags are required but player state is missing", () => {
    const service = createService();

    assert.throws(
        () => service.checkStoryFlags(["BRIDGE_REPAIRED"], undefined),
        TypeError
    );
});

test("checkItems throws when items are required but player state is missing", () => {
    const service = createService();

    assert.throws(
        () => service.checkItems(["BICYCLE"], undefined),
        TypeError
    );
});

test("checkLocations throws when locations are required but player state is missing", () => {
    const service = createService();

    assert.throws(
        () => service.checkLocations(["PALLET_TOWN"], undefined),
        TypeError
    );
});

test("checkAbilities throws when abilities are required but player state is missing", () => {
    const service = createService();

    assert.throws(
        () => service.checkAbilities(["CAN_USE_CUT"], undefined),
        TypeError
    );

});

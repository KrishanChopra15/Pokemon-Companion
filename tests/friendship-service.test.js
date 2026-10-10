"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const FriendshipService = require("../scripts/services/friendship-service");

function createPokemon(friendship = 70, extra = {}) {
    return {
        species: "PIKACHU",
        level: 10,
        friendship,
        ...extra
    };
}

function createService() {
    return new FriendshipService();
}

test("constructor sets Gen III friendship defaults", () => {
    const service = createService();

    assert.equal(service.defaultFriendship, 70);
    assert.equal(service.minimumFriendship, 0);
    assert.equal(service.maximumFriendship, 255);
    assert.equal(service.walkingStepInterval, 128);
    assert.equal(service.walkingChance, 0.5);
    assert.equal(service.walkingIncrease, 1);
    assert.equal(service.evolutionThreshold, 220);
    assert.equal(service.daisyGroomingIncrease, 3);
});

test("getFriendship defaults for a missing Pokemon", () => {
    assert.equal(createService().getFriendship(null), 70);
});

test("getFriendship defaults for missing friendship", () => {
    const pokemon = { species: "PIKACHU" };

    assert.equal(createService().getFriendship(pokemon), 70);
});

test("getFriendship defaults for nonnumeric friendship", () => {
    const service = createService();

    assert.equal(service.getFriendship(createPokemon("invalid")), 70);
});

test("getFriendship clamps negative friendship", () => {
    assert.equal(createService().getFriendship(createPokemon(-10)), 0);
});

test("getFriendship clamps friendship above 255", () => {
    assert.equal(createService().getFriendship(createPokemon(300)), 255);
});

test("getFriendship floors fractional friendship", () => {
    assert.equal(createService().getFriendship(createPokemon(99.8)), 99);
});

test("initialize rejects a missing Pokemon", () => {
    assert.deepEqual(createService().initialize(null), {
        success: false,
        reason: "Missing Pokemon"
    });
});

test("initialize sets default friendship", () => {
    const pokemon = {};

    const result = createService().initialize(pokemon);

    assert.equal(result.success, true);
    assert.equal(result.previousFriendship, null);
    assert.equal(result.friendship, 70);
    assert.equal(pokemon.friendship, 70);
});

test("initialize clamps the requested friendship", () => {
    const service = createService();
    const pokemon = {};

    service.initialize(pokemon, 300);

    assert.equal(pokemon.friendship, 255);
});

test("initialize records previous friendship when present", () => {
    const pokemon = createPokemon(120);

    const result = createService().initialize(pokemon, 150);

    assert.equal(result.previousFriendship, 120);
    assert.equal(result.friendship, 150);
});

test("setFriendship rejects a missing Pokemon", () => {
    assert.deepEqual(createService().setFriendship(null, 100), {
        success: false,
        reason: "Missing Pokemon"
    });
});

test("setFriendship rejects an invalid value", () => {
    assert.deepEqual(
        createService().setFriendship(createPokemon(), "invalid"),
        {
            success: false,
            reason: "Invalid friendship value"
        }
    );
});

test("setFriendship updates friendship and reports the change", () => {
    const pokemon = createPokemon(100);

    const result = createService().setFriendship(pokemon, 130);

    assert.equal(result.success, true);
    assert.equal(result.previousFriendship, 100);
    assert.equal(result.friendship, 130);
    assert.equal(result.change, 30);
    assert.equal(pokemon.friendship, 130);
});

test("setFriendship clamps values to the valid range", () => {
    const service = createService();
    const pokemon = createPokemon(100);

    assert.equal(service.setFriendship(pokemon, -20).friendship, 0);
    assert.equal(service.setFriendship(pokemon, 999).friendship, 255);
});

test("setFriendship accepts a numeric string", () => {
    const pokemon = createPokemon(70);

    const result = createService().setFriendship(pokemon, "125");

    assert.equal(result.success, true);
    assert.equal(result.friendship, 125);
});

test("changeFriendship rejects a missing Pokemon", () => {
    assert.deepEqual(createService().changeFriendship(null, 5), {
        success: false,
        reason: "Missing Pokemon"
    });
});

test("changeFriendship rejects an invalid amount", () => {
    assert.deepEqual(
        createService().changeFriendship(createPokemon(), "invalid"),
        {
            success: false,
            reason: "Invalid friendship change"
        }
    );
});

test("changeFriendship applies a positive change", () => {
    const pokemon = createPokemon(100);

    const result = createService().changeFriendship(pokemon, 5);

    assert.equal(result.success, true);
    assert.equal(result.previousFriendship, 100);
    assert.equal(result.requestedChange, 5);
    assert.equal(result.change, 5);
    assert.equal(result.friendship, 105);
});

test("changeFriendship applies a negative change without positive modifiers", () => {
    const pokemon = createPokemon(100, {
        ball: "ITEM_LUXURY_BALL",
        metLocation: "PALLET_TOWN"
    });

    const result = createService().changeFriendship(pokemon, -5, {
        location: "PALLET_TOWN"
    });

    assert.equal(result.change, -5);
    assert.equal(result.friendship, 95);
});

test("changeFriendship clamps friendship at zero", () => {
    const pokemon = createPokemon(2);

    const result = createService().changeFriendship(pokemon, -10);

    assert.equal(result.friendship, 0);
    assert.equal(result.change, -2);
});

test("changeFriendship clamps friendship at 255", () => {
    const pokemon = createPokemon(254);

    const result = createService().changeFriendship(pokemon, 10);

    assert.equal(result.friendship, 255);
    assert.equal(result.change, 1);
});

test("applyPositiveModifiers returns zero for invalid amounts", () => {
    const service = createService();

    assert.equal(service.applyPositiveModifiers(createPokemon(), 0), 0);
    assert.equal(service.applyPositiveModifiers(createPokemon(), -2), 0);
    assert.equal(service.applyPositiveModifiers(createPokemon(), NaN), 0);
});

test("applyPositiveModifiers adds a Luxury Ball bonus", () => {
    const pokemon = createPokemon(70, {
        ball: "ITEM_LUXURY_BALL"
    });

    assert.equal(
        createService().applyPositiveModifiers(pokemon, 3),
        4
    );
});

test("applyPositiveModifiers recognizes captureBall as a Luxury Ball", () => {
    const pokemon = createPokemon(70, {
        captureBall: "ITEM_LUXURY_BALL"
    });

    assert.equal(
        createService().applyPositiveModifiers(pokemon, 3),
        4
    );
});

test("applyPositiveModifiers recognizes ballConstant as a Luxury Ball", () => {
    const pokemon = createPokemon(70, {
        ballConstant: "ITEM_LUXURY_BALL"
    });

    assert.equal(
        createService().applyPositiveModifiers(pokemon, 3),
        4
    );
});

test("applyPositiveModifiers adds a met-location bonus", () => {
    const pokemon = createPokemon(70, {
        metLocation: "PALLET_TOWN"
    });

    assert.equal(
        createService().applyPositiveModifiers(pokemon, 3, {
            location: "PALLET_TOWN"
        }),
        4
    );
});

test("applyPositiveModifiers accepts the explicit metLocation option", () => {
    assert.equal(
        createService().applyPositiveModifiers(createPokemon(), 3, {
            metLocation: true
        }),
        4
    );
});

test("applyPositiveModifiers stacks both positive bonuses", () => {
    const pokemon = createPokemon(70, {
        ball: "ITEM_LUXURY_BALL",
        metLocation: "PALLET_TOWN"
    });

    assert.equal(
        createService().applyPositiveModifiers(pokemon, 3, {
            location: "PALLET_TOWN"
        }),
        5
    );
});

test("applyEvent rejects a missing Pokemon", () => {
    assert.deepEqual(createService().applyEvent(null, "LEVEL_UP"), {
        success: false,
        reason: "Missing Pokemon"
    });
});

test("applyEvent rejects an unknown event", () => {
    const result = createService().applyEvent(
        createPokemon(),
        "UNKNOWN_EVENT"
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Unknown friendship event: UNKNOWN_EVENT");
});

test("applyEvent dispatches LEVEL_UP", () => {
    const result = createService().applyEvent(
        createPokemon(50),
        "LEVEL_UP"
    );

    assert.equal(result.success, true);
    assert.equal(result.event, "LEVEL_UP");
    assert.equal(result.baseIncrease, 5);
});

test("applyEvent dispatches VITAMIN", () => {
    const result = createService().applyEvent(
        createPokemon(50),
        "VITAMIN"
    );

    assert.equal(result.success, true);
    assert.equal(result.event, "VITAMIN");
    assert.equal(result.baseIncrease, 5);
});

test("applyEvent dispatches MAJOR_BATTLE", () => {
    const result = createService().applyEvent(
        createPokemon(50),
        "MAJOR_BATTLE"
    );

    assert.equal(result.success, true);
    assert.equal(result.event, "MAJOR_BATTLE");
    assert.equal(result.baseIncrease, 3);
});

test("applyEvent dispatches BATTLE_ITEM", () => {
    const result = createService().applyEvent(
        createPokemon(50),
        "BATTLE_ITEM"
    );

    assert.equal(result.success, true);
    assert.equal(result.event, "BATTLE_ITEM");
    assert.equal(result.baseIncrease, 1);
});

test("applyEvent dispatches WALKING", () => {
    const result = createService().applyEvent(
        createPokemon(50),
        "WALKING",
        { steps: 1 }
    );

    assert.equal(result.success, true);
    assert.equal(result.event, "WALKING");
    assert.equal(result.triggered, false);
});

test("applyEvent dispatches DAISY_GROOMING", () => {
    const result = createService().applyEvent(
        createPokemon(50),
        "DAISY_GROOMING"
    );

    assert.equal(result.success, true);
    assert.equal(result.event, "DAISY_GROOMING");
    assert.equal(result.baseIncrease, 3);
});

test("applyEvent dispatches FAINT", () => {
    const result = createService().applyEvent(
        createPokemon(100),
        "FAINT"
    );

    assert.equal(result.success, true);
    assert.equal(result.event, "FAINT");
    assert.equal(result.baseChange, -5);
});

test("applyEvent dispatches ENERGY_POWDER", () => {
    const result = createService().applyEvent(
        createPokemon(100),
        "ENERGY_POWDER"
    );

    assert.equal(result.success, true);
    assert.equal(result.event, "BITTER_MEDICINE");
    assert.equal(result.medicine, "ENERGY_POWDER");
});

test("applyEvent dispatches HEAL_POWDER", () => {
    const result = createService().applyEvent(
        createPokemon(100),
        "HEAL_POWDER"
    );

    assert.equal(result.success, true);
    assert.equal(result.medicine, "HEAL_POWDER");
});

test("applyEvent dispatches ENERGY_ROOT", () => {
    const result = createService().applyEvent(
        createPokemon(100),
        "ENERGY_ROOT"
    );

    assert.equal(result.success, true);
    assert.equal(result.medicine, "ENERGY_ROOT");
});

test("applyEvent dispatches REVIVAL_HERB", () => {
    const result = createService().applyEvent(
        createPokemon(100),
        "REVIVAL_HERB"
    );

    assert.equal(result.success, true);
    assert.equal(result.medicine, "REVIVAL_HERB");
});

test("applyLevelUp uses the LOW tier increase", () => {
    const pokemon = createPokemon(50);
    const result = createService().applyLevelUp(pokemon);

    assert.equal(result.tier, "LOW");
    assert.equal(result.baseIncrease, 5);
    assert.equal(pokemon.friendship, 55);
});

test("applyLevelUp uses the MID tier increase", () => {
    const pokemon = createPokemon(150);
    const result = createService().applyLevelUp(pokemon);

    assert.equal(result.tier, "MID");
    assert.equal(result.baseIncrease, 3);
    assert.equal(pokemon.friendship, 153);
});

test("applyLevelUp uses the HIGH tier increase", () => {
    const pokemon = createPokemon(220);
    const result = createService().applyLevelUp(pokemon);

    assert.equal(result.tier, "HIGH");
    assert.equal(result.baseIncrease, 2);
    assert.equal(pokemon.friendship, 222);
});

test("applyVitamin uses the tier-based increase", () => {
    const pokemon = createPokemon(150);
    const result = createService().applyVitamin(pokemon);

    assert.equal(result.tier, "MID");
    assert.equal(result.baseIncrease, 3);
    assert.equal(pokemon.friendship, 153);
});

test("applyMajorBattle uses the tier-based increase", () => {
    const pokemon = createPokemon(150);
    const result = createService().applyMajorBattle(pokemon);

    assert.equal(result.tier, "MID");
    assert.equal(result.baseIncrease, 2);
    assert.equal(pokemon.friendship, 152);
});

test("applyBattleItem increases friendship below 200", () => {
    const pokemon = createPokemon(199);
    const result = createService().applyBattleItem(pokemon);

    assert.equal(result.success, true);
    assert.equal(result.change, 1);
    assert.equal(pokemon.friendship, 200);
});

test("applyBattleItem makes no change at 200 friendship", () => {
    const pokemon = createPokemon(200);
    const result = createService().applyBattleItem(pokemon);

    assert.equal(result.success, true);
    assert.equal(result.change, 0);
    assert.equal(result.friendship, 200);
    assert.equal(result.resultTier, "HIGH");
});

test("applyWalking rejects a nonnumeric step count", () => {
    const result = createService().applyWalking(
        createPokemon(),
        { steps: "invalid" }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid walking step count");
});

test("applyWalking rejects zero steps", () => {
    const result = createService().applyWalking(
        createPokemon(),
        { steps: 0 }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid walking step count");
});

test("applyWalking rejects negative steps", () => {
    const result = createService().applyWalking(
        createPokemon(),
        { steps: -128 }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid walking step count");
});

test("applyWalking succeeds without a full interval", () => {
    const pokemon = createPokemon(70);
    const result = createService().applyWalking(pokemon, {
        steps: 127,
        random: () => 0
    });

    assert.equal(result.success, true);
    assert.equal(result.intervals, 0);
    assert.equal(result.triggered, false);
    assert.equal(result.change, 0);
    assert.equal(pokemon.friendship, 70);
});

test("applyWalking increases friendship when the random check succeeds", () => {
    const pokemon = createPokemon(70);
    const result = createService().applyWalking(pokemon, {
        steps: 128,
        random: () => 0
    });

    assert.equal(result.success, true);
    assert.equal(result.intervals, 1);
    assert.equal(result.triggered, true);
    assert.equal(result.change, 1);
    assert.equal(pokemon.friendship, 71);
});

test("applyWalking does not increase friendship when the random check fails", () => {
    const pokemon = createPokemon(70);
    const result = createService().applyWalking(pokemon, {
        steps: 128,
        random: () => 0.9
    });

    assert.equal(result.success, true);
    assert.equal(result.triggered, false);
    assert.equal(result.change, 0);
    assert.equal(pokemon.friendship, 70);
});

test("applyWalking evaluates each complete 128-step interval", () => {
    const pokemon = createPokemon(70);
    const result = createService().applyWalking(pokemon, {
        steps: 384,
        random: () => 0
    });

    assert.equal(result.intervals, 3);
    assert.equal(result.changes.length, 3);
    assert.equal(result.change, 3);
    assert.equal(pokemon.friendship, 73);
});

test("applyWalking accepts a numeric-string step count", () => {
    const pokemon = createPokemon(70);
    const result = createService().applyWalking(pokemon, {
        steps: "128",
        random: () => 0
    });

    assert.equal(result.success, true);
    assert.equal(result.change, 1);
});

test("applyWalking applies Luxury Ball bonus to successful checks", () => {
    const pokemon = createPokemon(70, {
        ball: "ITEM_LUXURY_BALL"
    });

    const result = createService().applyWalking(pokemon, {
        steps: 128,
        random: () => 0
    });

    assert.equal(result.change, 2);
    assert.equal(pokemon.friendship, 72);
});

test("applyWalking clamps friendship at the maximum", () => {
    const pokemon = createPokemon(255);
    const result = createService().applyWalking(pokemon, {
        steps: 128,
        random: () => 0
    });

    assert.equal(result.friendship, 255);
    assert.equal(result.change, 0);
});

test("applyDaisyGrooming increases friendship by three", () => {
    const pokemon = createPokemon(100);
    const result = createService().applyDaisyGrooming(pokemon);

    assert.equal(result.success, true);
    assert.equal(result.event, "DAISY_GROOMING");
    assert.equal(result.baseIncrease, 3);
    assert.equal(pokemon.friendship, 103);
});

test("applyFainting uses the stronger penalty when levels are missing", () => {
    const pokemon = createPokemon(100);
    const result = createService().applyFainting(pokemon);

    assert.equal(result.success, true);
    assert.equal(result.baseChange, -5);
    assert.equal(pokemon.friendship, 95);
});

test("applyFainting uses the smaller penalty when the level difference is below 30", () => {
    const pokemon = createPokemon(100);
    const result = createService().applyFainting(pokemon, {
        opponentLevel: 20,
        pokemonLevel: 10
    });

    assert.equal(result.baseChange, -1);
    assert.equal(pokemon.friendship, 99);
});

test("applyFainting uses the stronger penalty when the level difference is 30", () => {
    const pokemon = createPokemon(100);
    const result = createService().applyFainting(pokemon, {
        opponentLevel: 40,
        pokemonLevel: 10
    });

    assert.equal(result.baseChange, -5);
    assert.equal(pokemon.friendship, 95);
});

test("applyFainting uses the smaller penalty when the opponent is lower level", () => {
    const pokemon = createPokemon(100);
    const result = createService().applyFainting(pokemon, {
        opponentLevel: 5,
        pokemonLevel: 10
    });

    assert.equal(result.baseChange, -1);
    assert.equal(pokemon.friendship, 99);
});

test("applyBitterMedicine rejects an unknown medicine", () => {
    const result = createService().applyBitterMedicine(
        createPokemon(),
        "UNKNOWN_MEDICINE"
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Unknown bitter medicine: UNKNOWN_MEDICINE");
});

test("applyBitterMedicine applies Energy Powder penalty in LOW tier", () => {
    const pokemon = createPokemon(50);
    const result = createService().applyBitterMedicine(
        pokemon,
        "ENERGY_POWDER"
    );

    assert.equal(result.tier, "LOW");
    assert.equal(result.baseChange, -5);
    assert.equal(pokemon.friendship, 45);
});

test("applyBitterMedicine applies Energy Powder penalty in HIGH tier", () => {
    const pokemon = createPokemon(220);
    const result = createService().applyBitterMedicine(
        pokemon,
        "ENERGY_POWDER"
    );

    assert.equal(result.tier, "HIGH");
    assert.equal(result.baseChange, -10);
    assert.equal(pokemon.friendship, 210);
});

test("applyBitterMedicine applies Energy Root penalty in MID tier", () => {
    const pokemon = createPokemon(150);
    const result = createService().applyBitterMedicine(
        pokemon,
        "ENERGY_ROOT"
    );

    assert.equal(result.tier, "MID");
    assert.equal(result.baseChange, -10);
    assert.equal(pokemon.friendship, 140);
});

test("applyBitterMedicine applies Revival Herb penalty in HIGH tier", () => {
    const pokemon = createPokemon(220);
    const result = createService().applyBitterMedicine(
        pokemon,
        "REVIVAL_HERB"
    );

    assert.equal(result.tier, "HIGH");
    assert.equal(result.baseChange, -20);
    assert.equal(pokemon.friendship, 200);
});

test("getTierAmount returns the configured LOW amount", () => {
    assert.equal(
        createService().getTierAmount("LOW", {
            low: 5,
            mid: 3,
            high: 2
        }),
        5
    );
});

test("getTierAmount returns the configured MID amount", () => {
    assert.equal(
        createService().getTierAmount("MID", {
            low: 5,
            mid: 3,
            high: 2
        }),
        3
    );
});

test("getTierAmount returns the configured HIGH amount", () => {
    assert.equal(
        createService().getTierAmount("HIGH", {
            low: 5,
            mid: 3,
            high: 2
        }),
        2
    );
});

test("getTierAmount returns zero for an unknown tier", () => {
    assert.equal(
        createService().getTierAmount("UNKNOWN", {
            low: 5,
            mid: 3,
            high: 2
        }),
        0
    );
});

test("getTierAmount returns zero when the selected amount is zero", () => {
    assert.equal(
        createService().getTierAmount("LOW", {
            low: 0,
            mid: 3,
            high: 2
        }),
        0
    );
});

test("getTier returns LOW below 100 friendship", () => {
    assert.equal(createService().getTier(createPokemon(99)), "LOW");
});

test("getTier returns MID from 100 through 199 friendship", () => {
    const service = createService();

    assert.equal(service.getTier(createPokemon(100)), "MID");
    assert.equal(service.getTier(createPokemon(199)), "MID");
});

test("getTier returns HIGH from 200 friendship", () => {
    const service = createService();

    assert.equal(service.getTier(createPokemon(200)), "HIGH");
    assert.equal(service.getTier(createPokemon(255)), "HIGH");
});

test("getTierFromValue clamps its input", () => {
    const service = createService();

    assert.equal(service.getTierFromValue(-10), "LOW");
    assert.equal(service.getTierFromValue(300), "HIGH");
});

test("canEvolve allows friendship at the threshold", () => {
    const result = createService().canEvolve(createPokemon(220));

    assert.equal(result.allowed, true);
    assert.equal(result.friendship, 220);
    assert.equal(result.requiredFriendship, 220);
    assert.equal(result.remaining, 0);
});

test("canEvolve rejects friendship below the threshold", () => {
    const result = createService().canEvolve(createPokemon(219));

    assert.equal(result.allowed, false);
    assert.equal(result.remaining, 1);
});

test("canEvolve accepts a custom threshold", () => {
    const result = createService().canEvolve(createPokemon(150), 150);

    assert.equal(result.allowed, true);
    assert.equal(result.requiredFriendship, 150);
    assert.equal(result.remaining, 0);
});

test("canEvolve reports remaining friendship", () => {
    const result = createService().canEvolve(createPokemon(100), 220);

    assert.equal(result.allowed, false);
    assert.equal(result.remaining, 120);
});

test("isMax recognizes maximum friendship", () => {
    const service = createService();

    assert.equal(service.isMax(createPokemon(255)), true);
    assert.equal(service.isMax(createPokemon(254)), false);
});

test("isMinimum recognizes zero friendship", () => {
    const service = createService();

    assert.equal(service.isMinimum(createPokemon(0)), true);
    assert.equal(service.isMinimum(createPokemon(1)), false);
});

test("hasLuxuryBall recognizes the ball field", () => {
    assert.equal(
        createService().hasLuxuryBall(
            createPokemon(70, { ball: "ITEM_LUXURY_BALL" })
        ),
        true
    );
});

test("hasLuxuryBall rejects other balls", () => {
    assert.equal(
        createService().hasLuxuryBall(
            createPokemon(70, { ball: "ITEM_POKE_BALL" })
        ),
        false
    );
});

test("hasLuxuryBall returns false for a missing Pokemon", () => {
    assert.equal(createService().hasLuxuryBall(null), false);
});

test("hasLuxuryBall accepts whitespace and lowercase ball names", () => {
    assert.equal(
        createService().hasLuxuryBall(
            createPokemon(70, { ball: " item_luxury_ball " })
        ),
        true
    );
});

test("isAtMetLocation recognizes matching locations", () => {
    const pokemon = createPokemon(70, {
        metLocation: "PALLET_TOWN"
    });

    assert.equal(
        createService().isAtMetLocation(pokemon, "PALLET_TOWN"),
        true
    );
});

test("isAtMetLocation supports the location field", () => {
    const pokemon = createPokemon(70, {
        location: "PALLET_TOWN"
    });

    assert.equal(
        createService().isAtMetLocation(pokemon, "PALLET_TOWN"),
        true
    );
});

test("isAtMetLocation supports currentLocation on the Pokemon", () => {
    const pokemon = createPokemon(70, {
        metLocation: "PALLET_TOWN",
        currentLocation: "PALLET_TOWN"
    });

    assert.equal(createService().isAtMetLocation(pokemon), true);
});

test("isAtMetLocation rejects mismatched locations", () => {
    const pokemon = createPokemon(70, {
        metLocation: "PALLET_TOWN"
    });

    assert.equal(
        createService().isAtMetLocation(pokemon, "VIRIDIAN_CITY"),
        false
    );
});

test("isAtMetLocation rejects missing location information", () => {
    assert.equal(
        createService().isAtMetLocation(createPokemon(70), "PALLET_TOWN"),
        false
    );
});

test("isAtMetLocation returns false for a missing Pokemon", () => {
    assert.equal(createService().isAtMetLocation(null, "PALLET_TOWN"), false);
});

test("clamp floors values and keeps them within range", () => {
    const service = createService();

    assert.equal(service.clamp(15.9), 15);
    assert.equal(service.clamp(-5), 0);
    assert.equal(service.clamp(300), 255);
});

test("clamp defaults invalid values to default friendship", () => {
    assert.equal(createService().clamp("invalid"), 70);
    assert.equal(createService().clamp(NaN), 70);
});

test("clamp accepts numeric strings", () => {
    assert.equal(createService().clamp("125"), 125);
});
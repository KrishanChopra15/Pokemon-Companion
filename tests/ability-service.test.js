"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AbilityService = require("../scripts/services/ability-service");

function createService() {
    return new AbilityService();
}

function createPokemon(ability, extra = {}) {
    return {
        species: "PIKACHU",
        ability,
        maxHP: 100,
        ...extra
    };
}

// Constructor and ability data

test("constructor initializes the ability definitions", () => {
    const service = createService();

    assert.ok(service.abilities);
    assert.equal(typeof service.abilities, "object");
});

test("HUGE_POWER doubles attack", () => {
    const service = createService();

    assert.equal(service.abilities.HUGE_POWER.attackMultiplier, 2);
});

test("PURE_POWER doubles attack", () => {
    const service = createService();

    assert.equal(service.abilities.PURE_POWER.attackMultiplier, 2);
});

test("SLOW_START halves attack and speed", () => {
    const service = createService();

    assert.equal(service.abilities.SLOW_START.attackMultiplier, 0.5);
    assert.equal(service.abilities.SLOW_START.speedMultiplier, 0.5);
});

test("LEVITATE grants Ground-type immunity", () => {
    const service = createService();

    assert.deepEqual(
        service.abilities.LEVITATE.immuneTypes,
        ["TYPE_GROUND"]
    );
});

test("FLASH_FIRE grants Fire immunity and a Fire boost", () => {
    const service = createService();

    assert.deepEqual(
        service.abilities.FLASH_FIRE.immuneTypes,
        ["TYPE_FIRE"]
    );
    assert.equal(service.abilities.FLASH_FIRE.boostType, "TYPE_FIRE");
});

test("WATER_ABSORB grants Water immunity and healing", () => {
    const service = createService();

    assert.deepEqual(
        service.abilities.WATER_ABSORB.immuneTypes,
        ["TYPE_WATER"]
    );
    assert.equal(service.abilities.WATER_ABSORB.heal, true);
});

test("VOLT_ABSORB grants Electric immunity and healing", () => {
    const service = createService();

    assert.deepEqual(
        service.abilities.VOLT_ABSORB.immuneTypes,
        ["TYPE_ELECTRIC"]
    );
    assert.equal(service.abilities.VOLT_ABSORB.heal, true);
});

test("CLEAR_BODY prevents all stat drops", () => {
    assert.equal(
        createService().abilities.CLEAR_BODY.preventStatDrop,
        true
    );
});

test("HYPER_CUTTER prevents Attack drops", () => {
    assert.equal(
        createService().abilities.HYPER_CUTTER.preventAttackDrop,
        true
    );
});

test("INTIMIDATE lowers enemy Attack by one stage", () => {
    assert.equal(
        createService().abilities.INTIMIDATE.lowerEnemyAttack,
        1
    );
});

// Ability lookup

test("getAbility returns data for a known ability", () => {
    const service = createService();

    assert.strictEqual(
        service.getAbility(createPokemon("HUGE_POWER")),
        service.abilities.HUGE_POWER
    );
});

test("getAbility returns null when the Pokemon has no ability", () => {
    assert.equal(
        createService().getAbility(createPokemon(null)),
        null
    );
});

test("getAbility returns null for an unknown ability", () => {
    assert.equal(
        createService().getAbility(createPokemon("UNKNOWN_ABILITY")),
        null
    );
});

test("getAbility does not modify the Pokemon", () => {
    const service = createService();
    const pokemon = createPokemon("HUGE_POWER");

    const before = { ...pokemon };
    service.getAbility(pokemon);

    assert.deepEqual(pokemon, before);
});

// Ability checks

test("hasAbility recognizes a matching ability", () => {
    assert.equal(
        createService().hasAbility(
            createPokemon("LEVITATE"),
            "LEVITATE"
        ),
        true
    );
});

test("hasAbility rejects a different ability", () => {
    assert.equal(
        createService().hasAbility(
            createPokemon("LEVITATE"),
            "HUGE_POWER"
        ),
        false
    );
});

test("hasAbility returns false for a Pokemon without an ability", () => {
    assert.equal(
        createService().hasAbility(createPokemon(null), "LEVITATE"),
        false
    );
});

// Type immunity

test("isImmune recognizes Levitate against Ground moves", () => {
    assert.equal(
        createService().isImmune(
            createPokemon("LEVITATE"),
            "TYPE_GROUND"
        ),
        true
    );
});

test("isImmune rejects non-Ground moves for Levitate", () => {
    assert.equal(
        createService().isImmune(
            createPokemon("LEVITATE"),
            "TYPE_FIRE"
        ),
        false
    );
});

test("isImmune recognizes Flash Fire against Fire moves", () => {
    assert.equal(
        createService().isImmune(
            createPokemon("FLASH_FIRE"),
            "TYPE_FIRE"
        ),
        true
    );
});

test("isImmune recognizes Water Absorb against Water moves", () => {
    assert.equal(
        createService().isImmune(
            createPokemon("WATER_ABSORB"),
            "TYPE_WATER"
        ),
        true
    );
});

test("isImmune recognizes Volt Absorb against Electric moves", () => {
    assert.equal(
        createService().isImmune(
            createPokemon("VOLT_ABSORB"),
            "TYPE_ELECTRIC"
        ),
        true
    );
});

test("isImmune returns false for a Pokemon without an ability", () => {
    assert.equal(
        createService().isImmune(
            createPokemon(null),
            "TYPE_GROUND"
        ),
        false
    );
});

test("isImmune returns false for an unknown ability", () => {
    assert.equal(
        createService().isImmune(
            createPokemon("UNKNOWN_ABILITY"),
            "TYPE_GROUND"
        ),
        false
    );
});

test("isImmune returns false for an unrelated move type", () => {
    assert.equal(
        createService().isImmune(
            createPokemon("WATER_ABSORB"),
            "TYPE_FIRE"
        ),
        false
    );
});

// Attack modifiers

test("modifyAttack doubles Attack with Huge Power", () => {
    assert.equal(
        createService().modifyAttack(
            createPokemon("HUGE_POWER"),
            100
        ),
        200
    );
});

test("modifyAttack doubles Attack with Pure Power", () => {
    assert.equal(
        createService().modifyAttack(
            createPokemon("PURE_POWER"),
            75
        ),
        150
    );
});

test("modifyAttack halves Attack with Slow Start", () => {
    assert.equal(
        createService().modifyAttack(
            createPokemon("SLOW_START"),
            100
        ),
        50
    );
});

test("modifyAttack floors fractional results", () => {
    assert.equal(
        createService().modifyAttack(
            createPokemon("SLOW_START"),
            99
        ),
        49
    );
});

test("modifyAttack preserves Attack without a modifying ability", () => {
    assert.equal(
        createService().modifyAttack(
            createPokemon("LEVITATE"),
            101
        ),
        101
    );
});

test("modifyAttack preserves Attack without an ability", () => {
    assert.equal(
        createService().modifyAttack(createPokemon(null), 100),
        100
    );
});

test("modifyAttack preserves zero Attack", () => {
    assert.equal(
        createService().modifyAttack(
            createPokemon("HUGE_POWER"),
            0
        ),
        0
    );
});

test("modifyAttack handles negative values using the configured multiplier", () => {
    assert.equal(
        createService().modifyAttack(
            createPokemon("HUGE_POWER"),
            -10
        ),
        -20
    );
});

// Speed modifiers

test("modifySpeed halves Speed with Slow Start", () => {
    assert.equal(
        createService().modifySpeed(
            createPokemon("SLOW_START"),
            100
        ),
        50
    );
});

test("modifySpeed floors fractional results", () => {
    assert.equal(
        createService().modifySpeed(
            createPokemon("SLOW_START"),
            99
        ),
        49
    );
});

test("modifySpeed preserves Speed without a modifying ability", () => {
    assert.equal(
        createService().modifySpeed(
            createPokemon("HUGE_POWER"),
            101
        ),
        101
    );
});

test("modifySpeed preserves Speed without an ability", () => {
    assert.equal(
        createService().modifySpeed(createPokemon(null), 100),
        100
    );
});

test("modifySpeed preserves zero Speed", () => {
    assert.equal(
        createService().modifySpeed(
            createPokemon("SLOW_START"),
            0
        ),
        0
    );
});

// Stat-drop protection

test("preventsStatDrop recognizes Clear Body for Attack", () => {
    assert.equal(
        createService().preventsStatDrop(
            createPokemon("CLEAR_BODY"),
            "attack"
        ),
        true
    );
});

test("preventsStatDrop recognizes Clear Body for Defense", () => {
    assert.equal(
        createService().preventsStatDrop(
            createPokemon("CLEAR_BODY"),
            "defense"
        ),
        true
    );
});

test("preventsStatDrop recognizes Clear Body for Speed", () => {
    assert.equal(
        createService().preventsStatDrop(
            createPokemon("CLEAR_BODY"),
            "speed"
        ),
        true
    );
});

test("preventsStatDrop recognizes Hyper Cutter for Attack", () => {
    assert.equal(
        createService().preventsStatDrop(
            createPokemon("HYPER_CUTTER"),
            "attack"
        ),
        true
    );
});

test("Hyper Cutter does not prevent Defense drops", () => {
    assert.equal(
        createService().preventsStatDrop(
            createPokemon("HYPER_CUTTER"),
            "defense"
        ),
        false
    );
});

test("Hyper Cutter does not prevent Speed drops", () => {
    assert.equal(
        createService().preventsStatDrop(
            createPokemon("HYPER_CUTTER"),
            "speed"
        ),
        false
    );
});

test("preventsStatDrop returns false without an ability", () => {
    assert.equal(
        createService().preventsStatDrop(
            createPokemon(null),
            "attack"
        ),
        false
    );
});

test("preventsStatDrop returns false for an unrelated ability", () => {
    assert.equal(
        createService().preventsStatDrop(
            createPokemon("HUGE_POWER"),
            "attack"
        ),
        false
    );
});

// Absorption and healing

test("absorbMove fails without an ability", () => {
    assert.deepEqual(
        createService().absorbMove(
            createPokemon(null),
            "TYPE_WATER"
        ),
        { success: false }
    );
});

test("absorbMove fails for a non-healing ability", () => {
    assert.deepEqual(
        createService().absorbMove(
            createPokemon("FLASH_FIRE"),
            "TYPE_FIRE"
        ),
        { success: false }
    );
});

test("absorbMove heals one quarter of maximum HP with Water Absorb", () => {
    assert.deepEqual(
        createService().absorbMove(
            createPokemon("WATER_ABSORB", { maxHP: 100 }),
            "TYPE_WATER"
        ),
        {
            success: true,
            heal: true,
            amount: 25
        }
    );
});

test("absorbMove heals one quarter of maximum HP with Volt Absorb", () => {
    assert.deepEqual(
        createService().absorbMove(
            createPokemon("VOLT_ABSORB", { maxHP: 120 }),
            "TYPE_ELECTRIC"
        ),
        {
            success: true,
            heal: true,
            amount: 30
        }
    );
});

test("absorbMove floors fractional healing", () => {
    assert.deepEqual(
        createService().absorbMove(
            createPokemon("WATER_ABSORB", { maxHP: 101 }),
            "TYPE_WATER"
        ),
        {
            success: true,
            heal: true,
            amount: 25
        }
    );
});

test("absorbMove fails when the move type does not match", () => {
    assert.deepEqual(
        createService().absorbMove(
            createPokemon("WATER_ABSORB"),
            "TYPE_FIRE"
        ),
        { success: false }
    );
});

test("absorbMove does not modify the Pokemon HP", () => {
    const service = createService();
    const pokemon = createPokemon("WATER_ABSORB", {
        hp: 40,
        maxHP: 100
    });

    service.absorbMove(pokemon, "TYPE_WATER");

    assert.equal(pokemon.hp, 40);
});

// Type boosts

test("boostsType recognizes Flash Fire boosting Fire moves", () => {
    assert.equal(
        createService().boostsType(
            createPokemon("FLASH_FIRE"),
            "TYPE_FIRE"
        ),
        true
    );
});

test("boostsType rejects other move types for Flash Fire", () => {
    assert.equal(
        createService().boostsType(
            createPokemon("FLASH_FIRE"),
            "TYPE_WATER"
        ),
        false
    );
});

test("boostsType returns false without an ability", () => {
    assert.equal(
        createService().boostsType(
            createPokemon(null),
            "TYPE_FIRE"
        ),
        false
    );
});

test("boostsType returns false for an unknown ability", () => {
    assert.equal(
        createService().boostsType(
            createPokemon("UNKNOWN_ABILITY"),
            "TYPE_FIRE"
        ),
        false
    );
});

// Ability listing

test("getAllAbilities returns an array", () => {
    assert.ok(Array.isArray(createService().getAllAbilities()));
});

test("getAllAbilities includes every defined ability", () => {
    const service = createService();

    assert.deepEqual(service.getAllAbilities(), Object.keys(service.abilities));
});

test("getAllAbilities includes stat-modifying abilities", () => {
    const abilities = createService().getAllAbilities();

    assert.ok(abilities.includes("HUGE_POWER"));
    assert.ok(abilities.includes("PURE_POWER"));
    assert.ok(abilities.includes("SLOW_START"));
});

test("getAllAbilities includes immunity abilities", () => {
    const abilities = createService().getAllAbilities();

    assert.ok(abilities.includes("LEVITATE"));
    assert.ok(abilities.includes("FLASH_FIRE"));
    assert.ok(abilities.includes("WATER_ABSORB"));
    assert.ok(abilities.includes("VOLT_ABSORB"));
});

test("getAllAbilities includes stat protection and entry abilities", () => {
    const abilities = createService().getAllAbilities();

    assert.ok(abilities.includes("CLEAR_BODY"));
    assert.ok(abilities.includes("HYPER_CUTTER"));
    assert.ok(abilities.includes("INTIMIDATE"));
});

test("getAllAbilities does not return duplicate names", () => {
    const abilities = createService().getAllAbilities();

    assert.equal(abilities.length, new Set(abilities).size);
});

test("getAllAbilities does not modify the ability definitions", () => {
    const service = createService();
    const before = Object.keys(service.abilities);

    service.getAllAbilities();

    assert.deepEqual(Object.keys(service.abilities), before);
});
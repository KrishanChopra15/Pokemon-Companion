"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const LevelUpService = require("../scripts/services/level-up-service.js");

function createService() {
    return new LevelUpService();
}

function createPokemon(overrides = {}) {
    return {
        species: "PIKACHU",
        level: 5,
        hp: 20,
        maxHP: 20,
        stats: {
            hp: 20,
            attack: 15,
            defense: 12,
            spAttack: 18,
            spDefense: 16,
            speed: 22,
        },
        moves: ["TACKLE"],
        ...overrides,
    };
}

test("constructor configures the expected stat growth values", () => {
    const service = createService();

    assert.deepEqual(service.statGrowth, {
        hp: 3,
        attack: 2,
        defense: 2,
        spAttack: 2,
        spDefense: 2,
        speed: 2,
    });
});

test("levelUp returns a failure for a missing Pokemon", () => {
    assert.deepEqual(createService().levelUp(null), {
        success: false,
        reason: "Missing Pokemon",
    });
});

test("levelUp returns a failure for an undefined Pokemon", () => {
    assert.deepEqual(createService().levelUp(undefined), {
        success: false,
        reason: "Missing Pokemon",
    });
});

test("levelUp increases the Pokemon level by one by default", () => {
    const pokemon = createPokemon();

    const result = createService().levelUp(pokemon);

    assert.equal(pokemon.level, 6);
    assert.equal(result.oldLevel, 5);
    assert.equal(result.newLevel, 6);
    assert.deepEqual(result.levels, [6]);
});

test("levelUp applies the expected stat increases", () => {
    const pokemon = createPokemon();

    createService().levelUp(pokemon);

    assert.deepEqual(pokemon.stats, {
        hp: 23,
        attack: 17,
        defense: 14,
        spAttack: 20,
        spDefense: 18,
        speed: 24,
    });
});

test("levelUp returns the updated stats in its result", () => {
    const pokemon = createPokemon();

    const result = createService().levelUp(pokemon);

    assert.deepEqual(result.stats, pokemon.stats);
});

test("levelUp applies multiple level increases", () => {
    const pokemon = createPokemon();

    const result = createService().levelUp(pokemon, 3);

    assert.equal(pokemon.level, 8);
    assert.equal(result.oldLevel, 5);
    assert.equal(result.newLevel, 8);
    assert.deepEqual(result.levels, [6, 7, 8]);
});

test("levelUp applies stat growth once for every gained level", () => {
    const pokemon = createPokemon();

    createService().levelUp(pokemon, 3);

    assert.deepEqual(pokemon.stats, {
        hp: 29,
        attack: 21,
        defense: 18,
        spAttack: 24,
        spDefense: 22,
        speed: 28,
    });
});

test("levelUp accepts an array of levels and uses its length", () => {
    const pokemon = createPokemon();

    const result = createService().levelUp(pokemon, [6, 7, 8]);

    assert.equal(pokemon.level, 8);
    assert.deepEqual(result.levels, [6, 7, 8]);
});

test("levelUp accepts an empty array without increasing the level", () => {
    const pokemon = createPokemon();

    const result = createService().levelUp(pokemon, []);

    assert.equal(pokemon.level, 5);
    assert.equal(result.oldLevel, 5);
    assert.equal(result.newLevel, 5);
    assert.deepEqual(result.levels, []);
});

test("levelUp with zero levels does not change level or stats", () => {
    const pokemon = createPokemon();
    const originalStats = { ...pokemon.stats };

    const result = createService().levelUp(pokemon, 0);

    assert.equal(pokemon.level, 5);
    assert.deepEqual(pokemon.stats, originalStats);
    assert.deepEqual(result.levels, []);
});

test("levelUp preserves the original level in its result", () => {
    const pokemon = createPokemon({ level: 12 });

    const result = createService().levelUp(pokemon, 2);

    assert.equal(result.oldLevel, 12);
    assert.equal(result.newLevel, 14);
});

test("levelUp updates maxHP and restores current HP to maxHP", () => {
    const pokemon = createPokemon({
        hp: 10,
        maxHP: 20,
    });

    createService().levelUp(pokemon);

    assert.equal(pokemon.maxHP, 23);
    assert.equal(pokemon.hp, 23);
});

test("levelUp increases maxHP and current HP for each gained level", () => {
    const pokemon = createPokemon({
        hp: 10,
        maxHP: 20,
    });

    createService().levelUp(pokemon, 3);

    assert.equal(pokemon.maxHP, 29);
    assert.equal(pokemon.hp, 29);
});

test("levelUp does not update current HP when maxHP is absent", () => {
    const pokemon = createPokemon({
        hp: 10,
        maxHP: undefined,
    });

    createService().levelUp(pokemon);

    assert.equal(pokemon.hp, 10);
    assert.equal(pokemon.maxHP, undefined);
});

test("levelUp initializes missing stats before applying growth", () => {
    const pokemon = createPokemon({
        stats: undefined,
        hp: 30,
    });

    createService().levelUp(pokemon);

    assert.deepEqual(pokemon.stats, {
        hp: 33,
        attack: 7,
        defense: 7,
        spAttack: 7,
        spDefense: 7,
        speed: 7,
    });
});

test("levelUp initializes stats using a fallback HP value when HP is zero", () => {
    const pokemon = createPokemon({
        stats: undefined,
        hp: 0,
    });

    createService().levelUp(pokemon);

    assert.equal(pokemon.stats.hp, 13);
});

test("levelUp initializes stats using a fallback HP value when HP is missing", () => {
    const pokemon = createPokemon({
        stats: undefined,
        hp: undefined,
    });

    createService().levelUp(pokemon);

    assert.equal(pokemon.stats.hp, 13);
});

test("levelUp preserves existing stat values before applying growth", () => {
    const pokemon = createPokemon({
        stats: {
            hp: 50,
            attack: 40,
            defense: 30,
            spAttack: 20,
            spDefense: 10,
            speed: 5,
        },
    });

    createService().levelUp(pokemon);

    assert.deepEqual(pokemon.stats, {
        hp: 53,
        attack: 42,
        defense: 32,
        spAttack: 22,
        spDefense: 12,
        speed: 7,
    });
});

test("applyStats initializes stats when they are missing", () => {
    const pokemon = createPokemon({
        stats: undefined,
        hp: 40,
    });

    createService().applyStats(pokemon);

    assert.deepEqual(pokemon.stats, {
        hp: 43,
        attack: 7,
        defense: 7,
        spAttack: 7,
        spDefense: 7,
        speed: 7,
    });
});

test("applyStats increases all six stats", () => {
    const pokemon = createPokemon();
    const service = createService();

    service.applyStats(pokemon);

    assert.deepEqual(pokemon.stats, {
        hp: 23,
        attack: 17,
        defense: 14,
        spAttack: 20,
        spDefense: 18,
        speed: 24,
    });
});

test("applyStats restores HP to maxHP after increasing maxHP", () => {
    const pokemon = createPokemon({
        hp: 1,
        maxHP: 30,
    });

    createService().applyStats(pokemon);

    assert.equal(pokemon.maxHP, 33);
    assert.equal(pokemon.hp, 33);
});

test("applyStats leaves current HP unchanged when maxHP is absent", () => {
    const pokemon = createPokemon({
        hp: 7,
        maxHP: undefined,
    });

    createService().applyStats(pokemon);

    assert.equal(pokemon.hp, 7);
});

test("applyStats does not change the Pokemon level", () => {
    const pokemon = createPokemon({ level: 15 });

    createService().applyStats(pokemon);

    assert.equal(pokemon.level, 15);
});

test("getStats returns the Pokemon stats object", () => {
    const pokemon = createPokemon();

    assert.equal(createService().getStats(pokemon), pokemon.stats);
});

test("getStats returns null when stats are missing", () => {
    const pokemon = createPokemon({ stats: undefined });

    assert.equal(createService().getStats(pokemon), null);
});

test("learnMove initializes a missing moves array", () => {
    const pokemon = createPokemon({ moves: undefined });

    const result = createService().learnMove(pokemon, "THUNDERBOLT");

    assert.deepEqual(pokemon.moves, ["THUNDERBOLT"]);
    assert.deepEqual(result, {
        success: true,
        move: "THUNDERBOLT",
    });
});

test("learnMove adds a move to the existing moves array", () => {
    const pokemon = createPokemon();

    const result = createService().learnMove(pokemon, "QUICK ATTACK");

    assert.equal(result.success, true);
    assert.equal(result.move, "QUICK ATTACK");
    assert.deepEqual(pokemon.moves, ["TACKLE", "QUICK ATTACK"]);
});

test("learnMove rejects an already known move", () => {
    const pokemon = createPokemon();

    const result = createService().learnMove(pokemon, "TACKLE");

    assert.deepEqual(result, {
        success: false,
        reason: "Move already known",
    });
    assert.deepEqual(pokemon.moves, ["TACKLE"]);
});

test("learnMove rejects a duplicate without changing the moves array", () => {
    const pokemon = createPokemon({
        moves: ["TACKLE", "GROWL"],
    });
    const originalMoves = [...pokemon.moves];

    createService().learnMove(pokemon, "GROWL");

    assert.deepEqual(pokemon.moves, originalMoves);
});

test("learnMove allows distinct moves", () => {
    const pokemon = createPokemon();

    createService().learnMove(pokemon, "THUNDERBOLT");
    createService().learnMove(pokemon, "IRON TAIL");

    assert.deepEqual(pokemon.moves, [
        "TACKLE",
        "THUNDERBOLT",
        "IRON TAIL",
    ]);
});

test("learnMove uses array identity to detect duplicates", () => {
    const pokemon = createPokemon({
        moves: [{ name: "TACKLE" }],
    });

    const result = createService().learnMove(
        pokemon,
        { name: "TACKLE" }
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.moves.length, 2);
});

test("learnMove can add an undefined move when it is not already known", () => {
    const pokemon = createPokemon();

    const result = createService().learnMove(pokemon, undefined);

    assert.equal(result.success, true);
    assert.equal(pokemon.moves.length, 2);
    assert.equal(pokemon.moves[1], undefined);
});

test("processMoves returns an empty array when available moves are missing", () => {
    const pokemon = createPokemon();

    assert.deepEqual(createService().processMoves(pokemon, undefined), []);
    assert.deepEqual(createService().processMoves(pokemon, null), []);
});

test("processMoves learns moves available at the current level", () => {
    const pokemon = createPokemon({ level: 5 });

    const learned = createService().processMoves(pokemon, [
        { level: 1, name: "TACKLE" },
        { level: 5, name: "THUNDER SHOCK" },
        { level: 6, name: "QUICK ATTACK" },
    ]);

    assert.deepEqual(learned, ["THUNDER SHOCK"]);
    assert.deepEqual(pokemon.moves, ["TACKLE", "THUNDER SHOCK"]);
});

test("processMoves learns moves available below the current level", () => {
    const pokemon = createPokemon({
        level: 10,
        moves: [],
    });

    const learned = createService().processMoves(pokemon, [
        { level: 2, name: "GROWL" },
        { level: 7, name: "THUNDER SHOCK" },
    ]);

    assert.deepEqual(learned, ["GROWL", "THUNDER SHOCK"]);
    assert.deepEqual(pokemon.moves, ["GROWL", "THUNDER SHOCK"]);
});

test("processMoves does not learn moves above the current level", () => {
    const pokemon = createPokemon({
        level: 5,
        moves: [],
    });

    const learned = createService().processMoves(pokemon, [
        { level: 6, name: "QUICK ATTACK" },
        { level: 10, name: "THUNDERBOLT" },
    ]);

    assert.deepEqual(learned, []);
    assert.deepEqual(pokemon.moves, []);
});

test("processMoves skips moves the Pokemon already knows", () => {
    const pokemon = createPokemon({
        level: 10,
        moves: ["TACKLE"],
    });

    const learned = createService().processMoves(pokemon, [
        { level: 1, name: "TACKLE" },
        { level: 5, name: "GROWL" },
    ]);

    assert.deepEqual(learned, ["GROWL"]);
    assert.deepEqual(pokemon.moves, ["TACKLE", "GROWL"]);
});

test("processMoves returns learned move names in input order", () => {
    const pokemon = createPokemon({
        level: 20,
        moves: [],
    });

    const learned = createService().processMoves(pokemon, [
        { level: 10, name: "MOVE A" },
        { level: 2, name: "MOVE B" },
        { level: 15, name: "MOVE C" },
    ]);

    assert.deepEqual(learned, ["MOVE A", "MOVE B", "MOVE C"]);
});

test("processMoves initializes a missing moves array through learnMove", () => {
    const pokemon = createPokemon({
        level: 5,
        moves: undefined,
    });

    const learned = createService().processMoves(pokemon, [
        { level: 5, name: "THUNDER SHOCK" },
    ]);

    assert.deepEqual(learned, ["THUNDER SHOCK"]);
    assert.deepEqual(pokemon.moves, ["THUNDER SHOCK"]);
});

test("processMoves returns an empty list when no move qualifies", () => {
    const pokemon = createPokemon({
        level: 1,
        moves: [],
    });

    const learned = createService().processMoves(pokemon, [
        { level: 2, name: "GROWL" },
    ]);

    assert.deepEqual(learned, []);
});

test("createSummary returns the Pokemon species and levels", () => {
    const pokemon = createPokemon({ level: 8 });

    assert.deepEqual(
        createService().createSummary(pokemon, 5),
        {
            pokemon: "PIKACHU",
            oldLevel: 5,
            newLevel: 8,
            stats: pokemon.stats,
        }
    );
});

test("createSummary returns the current stats object", () => {
    const pokemon = createPokemon();

    const result = createService().createSummary(pokemon, 4);

    assert.equal(result.stats, pokemon.stats);
});

test("createSummary returns null stats when the Pokemon has no stats", () => {
    const pokemon = createPokemon({ stats: undefined });

    const result = createService().createSummary(pokemon, 5);

    assert.equal(result.stats, null);
});

test("createSummary does not mutate the Pokemon", () => {
    const pokemon = createPokemon();
    const originalLevel = pokemon.level;
    const originalStats = { ...pokemon.stats };
    const originalMoves = [...pokemon.moves];

    createService().createSummary(pokemon, 3);

    assert.equal(pokemon.level, originalLevel);
    assert.deepEqual(pokemon.stats, originalStats);
    assert.deepEqual(pokemon.moves, originalMoves);
});
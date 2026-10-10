"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const WildBattleService = require(
    "../scripts/services/wild-battle-service"
);

function createPokemon(overrides = {}) {
    return {
        species: "Bulbasaur",
        level: 5,
        hp: 20,
        ...overrides
    };
}

function createProgression({
    exp = 25,
    progressionResult = { success: true },
    evolutionResult = { success: true, evolved: false }
} = {}) {
    const calls = {
        calculateExp: [],
        processProgression: [],
        processEvolution: []
    };

    const progression = {
        experience: {
            calculateExp(defeatedPokemon, source) {
                calls.calculateExp.push({
                    defeatedPokemon,
                    source
                });

                return exp;
            }
        },

        processProgression(pokemon, receivedExp) {
            calls.processProgression.push({
                pokemon,
                exp: receivedExp
            });

            return progressionResult;
        },

        processEvolution(pokemon) {
            calls.processEvolution.push({ pokemon });
            return evolutionResult;
        }
    };

    return { progression, calls };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor stores the battle and progression services", () => {
    const battles = { startWildBattle() {} };
    const progression = { processProgression() {} };

    const service = new WildBattleService(battles, progression);

    assert.equal(service.battles, battles);
    assert.equal(service.progression, progression);
});

test("constructor preserves null dependencies", () => {
    const service = new WildBattleService(null, null);

    assert.equal(service.battles, null);
    assert.equal(service.progression, null);
});

test("constructor accepts missing dependencies", () => {
    const service = new WildBattleService();

    assert.equal(service.battles, undefined);
    assert.equal(service.progression, undefined);
});

// --------------------------------------------------
// Encounter creation
// --------------------------------------------------

test("createEncounter rejects a missing Pokémon", () => {
    const service = new WildBattleService();

    assert.deepEqual(service.createEncounter(), {
        success: false,
        reason: "Missing Pokemon"
    });
});

test("createEncounter rejects null", () => {
    const service = new WildBattleService();

    assert.deepEqual(service.createEncounter(null), {
        success: false,
        reason: "Missing Pokemon"
    });
});

test("createEncounter rejects false", () => {
    const service = new WildBattleService();

    assert.deepEqual(service.createEncounter(false), {
        success: false,
        reason: "Missing Pokemon"
    });
});

test("createEncounter accepts a Pokémon object", () => {
    const service = new WildBattleService();
    const pokemon = createPokemon();

    const result = service.createEncounter(pokemon);

    assert.equal(result.success, true);
    assert.equal(result.type, "WILD");
    assert.equal(result.pokemon, pokemon);
});

test("createEncounter preserves the original Pokémon object identity", () => {
    const service = new WildBattleService();
    const pokemon = createPokemon({ species: "Pikachu" });

    const result = service.createEncounter(pokemon);

    assert.strictEqual(result.pokemon, pokemon);
});

test("createEncounter does not mutate the Pokémon", () => {
    const service = new WildBattleService();
    const pokemon = createPokemon();
    const original = { ...pokemon };

    service.createEncounter(pokemon);

    assert.deepEqual(pokemon, original);
});

test("createEncounter creates a new encounter result each time", () => {
    const service = new WildBattleService();
    const pokemon = createPokemon();

    const first = service.createEncounter(pokemon);
    const second = service.createEncounter(pokemon);

    assert.notStrictEqual(first, second);
    assert.strictEqual(first.pokemon, second.pokemon);
});

// --------------------------------------------------
// Battle preparation
// --------------------------------------------------

test("prepareBattle succeeds for a valid wild Pokémon", () => {
    const service = new WildBattleService();
    const player = {
        party: [createPokemon({ species: "Charmander" })]
    };
    const wildPokemon = createPokemon({ species: "Rattata" });

    const result = service.prepareBattle(player, wildPokemon);

    assert.equal(result.success, true);
    assert.ok(result.battle);
});

test("prepareBattle creates a WILD battle", () => {
    const service = new WildBattleService();

    const result = service.prepareBattle(
        { party: [] },
        createPokemon()
    );

    assert.equal(result.battle.type, "WILD");
});

test("prepareBattle uses the player's party", () => {
    const service = new WildBattleService();
    const party = [
        createPokemon({ species: "Charmander" }),
        createPokemon({ species: "Pikachu" })
    ];

    const result = service.prepareBattle(
        { party },
        createPokemon({ species: "Rattata" })
    );

    assert.strictEqual(result.battle.player.party, party);
});

test("prepareBattle preserves the original player party reference", () => {
    const service = new WildBattleService();
    const party = [createPokemon()];

    const result = service.prepareBattle(
        { party },
        createPokemon({ species: "Pidgey" })
    );

    assert.strictEqual(result.battle.player.party, party);
});

test("prepareBattle creates an opponent party containing the wild Pokémon", () => {
    const service = new WildBattleService();
    const wildPokemon = createPokemon({ species: "Pidgey" });

    const result = service.prepareBattle(
        { party: [] },
        wildPokemon
    );

    assert.deepEqual(result.battle.opponent.party, [wildPokemon]);
    assert.equal(result.battle.opponent.party.length, 1);
});

test("prepareBattle preserves the wild Pokémon object identity", () => {
    const service = new WildBattleService();
    const wildPokemon = createPokemon();

    const result = service.prepareBattle(
        { party: [] },
        wildPokemon
    );

    assert.strictEqual(
        result.battle.opponent.party[0],
        wildPokemon
    );
});

test("prepareBattle does not duplicate or replace the player's Pokémon", () => {
    const service = new WildBattleService();
    const starter = createPokemon({ species: "Squirtle" });
    const party = [starter];

    const result = service.prepareBattle(
        { party },
        createPokemon({ species: "Rattata" })
    );

    assert.equal(result.battle.player.party.length, 1);
    assert.strictEqual(result.battle.player.party[0], starter);
});

test("prepareBattle returns an error for a missing wild Pokémon", () => {
    const service = new WildBattleService();

    assert.deepEqual(
        service.prepareBattle({ party: [] }, null),
        {
            success: false,
            reason: "Missing Pokemon"
        }
    );
});

// --------------------------------------------------
// Starting a wild battle
// --------------------------------------------------

test("startBattle delegates to startWildBattle", () => {
    const calls = [];
    const expectedResult = {
        success: true,
        battleId: "wild-1"
    };

    const battles = {
        startWildBattle(player, wildPokemon) {
            calls.push({ player, wildPokemon });
            return expectedResult;
        }
    };

    const service = new WildBattleService(battles, null);
    const player = { party: [createPokemon()] };
    const wildPokemon = createPokemon({ species: "Pidgey" });

    const result = service.startBattle(player, wildPokemon);

    assert.strictEqual(result, expectedResult);
    assert.deepEqual(calls, [{ player, wildPokemon }]);
});

test("startBattle passes the original player reference", () => {
    let receivedPlayer;

    const service = new WildBattleService({
        startWildBattle(player) {
            receivedPlayer = player;
            return { success: true };
        }
    });

    const player = { party: [] };

    service.startBattle(player, createPokemon());

    assert.strictEqual(receivedPlayer, player);
});

test("startBattle passes the original wild Pokémon reference", () => {
    let receivedPokemon;

    const service = new WildBattleService({
        startWildBattle(player, pokemon) {
            receivedPokemon = pokemon;
            return { success: true };
        }
    });

    const wildPokemon = createPokemon({ species: "Pikachu" });

    service.startBattle({ party: [] }, wildPokemon);

    assert.strictEqual(receivedPokemon, wildPokemon);
});

test("startBattle returns an error when battle service is missing", () => {
    const service = new WildBattleService(null, null);

    assert.deepEqual(
        service.startBattle(
            { party: [] },
            createPokemon()
        ),
        {
            success: false,
            reason: "Wild battle support unavailable"
        }
    );
});

test("startBattle returns an error when startWildBattle is missing", () => {
    const service = new WildBattleService({}, null);

    assert.deepEqual(
        service.startBattle(
            { party: [] },
            createPokemon()
        ),
        {
            success: false,
            reason: "Wild battle support unavailable"
        }
    );
});

test("startBattle returns an error when startWildBattle is undefined", () => {
    const service = new WildBattleService(
        { startWildBattle: undefined },
        null
    );

    assert.deepEqual(
        service.startBattle(
            { party: [] },
            createPokemon()
        ),
        {
            success: false,
            reason: "Wild battle support unavailable"
        }
    );
});

test("startBattle does not start a battle when the wild Pokémon is missing", () => {
    let called = false;

    const service = new WildBattleService({
        startWildBattle() {
            called = true;
            return { success: true };
        }
    });

    const result = service.startBattle({ party: [] }, null);

    assert.deepEqual(result, {
        success: false,
        reason: "Missing Pokemon"
    });
    assert.equal(called, false);
});

test("startBattle returns the battle service result unchanged", () => {
    const expected = {
        success: false,
        reason: "Battle already active"
    };

    const service = new WildBattleService({
        startWildBattle() {
            return expected;
        }
    });

    const result = service.startBattle(
        { party: [] },
        createPokemon()
    );

    assert.strictEqual(result, expected);
});

// --------------------------------------------------
// Victory and experience
// --------------------------------------------------

test("victory rejects a missing player Pokémon", () => {
    const { progression } = createProgression();
    const service = new WildBattleService(null, progression);

    assert.deepEqual(
        service.victory(null, createPokemon()),
        {
            success: false,
            reason: "Missing Pokemon"
        }
    );
});

test("victory rejects a missing defeated Pokémon", () => {
    const { progression } = createProgression();
    const service = new WildBattleService(null, progression);

    assert.deepEqual(
        service.victory(createPokemon(), null),
        {
            success: false,
            reason: "Missing Pokemon"
        }
    );
});

test("victory rejects when both Pokémon are missing", () => {
    const { progression } = createProgression();
    const service = new WildBattleService(null, progression);

    assert.deepEqual(service.victory(null, null), {
        success: false,
        reason: "Missing Pokemon"
    });
});

test("victory calculates experience with the default WILD source", () => {
    const { progression, calls } = createProgression({ exp: 35 });
    const service = new WildBattleService(null, progression);

    const playerPokemon = createPokemon({ species: "Charmander" });
    const defeatedPokemon = createPokemon({ species: "Rattata" });

    service.victory(playerPokemon, defeatedPokemon);

    assert.deepEqual(calls.calculateExp, [
        {
            defeatedPokemon,
            source: "WILD"
        }
    ]);
});

test("victory forwards a custom experience source", () => {
    const { progression, calls } = createProgression();
    const service = new WildBattleService(null, progression);

    const defeatedPokemon = createPokemon({ species: "Pidgey" });

    service.victory(
        createPokemon(),
        defeatedPokemon,
        "TRAINER"
    );

    assert.equal(calls.calculateExp.length, 1);
    assert.equal(calls.calculateExp[0].source, "TRAINER");
});

test("victory sends calculated experience to processProgression", () => {
    const { progression, calls } = createProgression({ exp: 42 });
    const service = new WildBattleService(null, progression);
    const playerPokemon = createPokemon();

    service.victory(
        playerPokemon,
        createPokemon({ species: "Rattata" })
    );

    assert.deepEqual(calls.processProgression, [
        {
            pokemon: playerPokemon,
            exp: 42
        }
    ]);
});

test("victory returns the defeated Pokémon species and calculated experience", () => {
    const { progression } = createProgression({ exp: 55 });
    const service = new WildBattleService(null, progression);

    const result = service.victory(
        createPokemon({ species: "Charmander" }),
        createPokemon({ species: "Pidgey" })
    );

    assert.equal(result.defeated, "Pidgey");
    assert.equal(result.exp, 55);
});

test("victory returns the progression result", () => {
    const progressionResult = {
        success: true,
        levelsGained: 1
    };

    const { progression } = createProgression({
        progressionResult
    });

    const service = new WildBattleService(null, progression);

    const result = service.victory(
        createPokemon(),
        createPokemon({ species: "Rattata" })
    );

    assert.strictEqual(result.progression, progressionResult);
});

test("victory mirrors the progression success value", () => {
    const { progression } = createProgression({
        progressionResult: {
            success: false,
            reason: "Progression failed"
        }
    });

    const service = new WildBattleService(null, progression);

    const result = service.victory(
        createPokemon(),
        createPokemon()
    );

    assert.equal(result.success, false);
    assert.equal(result.progression.reason, "Progression failed");
});

test("victory returns a successful result when progression succeeds", () => {
    const { progression } = createProgression({
        progressionResult: { success: true }
    });

    const service = new WildBattleService(null, progression);

    const result = service.victory(
        createPokemon(),
        createPokemon({ species: "Pidgey" })
    );

    assert.equal(result.success, true);
});

test("victory calculates experience before processing progression", () => {
    const callOrder = [];

    const progression = {
        experience: {
            calculateExp() {
                callOrder.push("experience");
                return 20;
            }
        },

        processProgression() {
            callOrder.push("progression");
            return { success: true };
        }
    };

    const service = new WildBattleService(null, progression);

    service.victory(createPokemon(), createPokemon());

    assert.deepEqual(callOrder, ["experience", "progression"]);
});

// --------------------------------------------------
// Evolution check
// --------------------------------------------------

test("checkEvolution delegates to processEvolution", () => {
    const calls = [];
    const expectedResult = {
        success: true,
        evolved: true
    };

    const progression = {
        processEvolution(pokemon) {
            calls.push(pokemon);
            return expectedResult;
        }
    };

    const service = new WildBattleService(null, progression);
    const pokemon = createPokemon({ species: "Charmander" });

    const result = service.checkEvolution(pokemon);

    assert.strictEqual(result, expectedResult);
    assert.deepEqual(calls, [pokemon]);
});

test("checkEvolution preserves the Pokémon object identity", () => {
    let receivedPokemon;

    const progression = {
        processEvolution(pokemon) {
            receivedPokemon = pokemon;
            return { success: true };
        }
    };

    const service = new WildBattleService(null, progression);
    const pokemon = createPokemon();

    service.checkEvolution(pokemon);

    assert.strictEqual(receivedPokemon, pokemon);
});

test("checkEvolution returns an unsuccessful evolution result unchanged", () => {
    const expected = {
        success: false,
        reason: "Evolution conditions not met"
    };

    const service = new WildBattleService(null, {
        processEvolution() {
            return expected;
        }
    });

    assert.strictEqual(
        service.checkEvolution(createPokemon()),
        expected
    );
});

// --------------------------------------------------
// Victory summary
// --------------------------------------------------

test("createVictorySummary returns the expected fields", () => {
    const service = new WildBattleService();
    const pokemon = createPokemon({ species: "Charmander" });
    const defeatedPokemon = createPokemon({ species: "Rattata" });

    const result = service.createVictorySummary(
        pokemon,
        defeatedPokemon,
        40
    );

    assert.deepEqual(result, {
        pokemon: "Charmander",
        defeated: "Rattata",
        exp: 40
    });
});

test("createVictorySummary uses the Pokémon species names", () => {
    const service = new WildBattleService();

    const result = service.createVictorySummary(
        createPokemon({ species: "Pikachu" }),
        createPokemon({ species: "Pidgey" }),
        12
    );

    assert.equal(result.pokemon, "Pikachu");
    assert.equal(result.defeated, "Pidgey");
});

test("createVictorySummary preserves the supplied experience amount", () => {
    const service = new WildBattleService();

    const result = service.createVictorySummary(
        createPokemon(),
        createPokemon(),
        123
    );

    assert.equal(result.exp, 123);
});

test("createVictorySummary does not mutate either Pokémon", () => {
    const service = new WildBattleService();

    const pokemon = createPokemon({ species: "Squirtle" });
    const defeatedPokemon = createPokemon({ species: "Pidgey" });

    const originalPokemon = { ...pokemon };
    const originalDefeatedPokemon = { ...defeatedPokemon };

    service.createVictorySummary(pokemon, defeatedPokemon, 25);

    assert.deepEqual(pokemon, originalPokemon);
    assert.deepEqual(defeatedPokemon, originalDefeatedPokemon);
});
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const EncounterBattleFlow = require("../scripts/encounter/encounter-battle-flow");


function createContext(options = {}) {
    const encounter =
        Object.prototype.hasOwnProperty.call(options, "encounter")
            ? options.encounter
            : {
                type: "WILD",
                location: "ROUTE_1",
                species: "PIDGEY",
                level: 3
            };

    const calls = [];

    const encounterFlow = {
        getCurrentEncounter() {
            return encounter;
        }
    };

    const wildBattleService = options.noWildBattle
        ? null
        : {
            startBattle(player, playerPokemon, actualEncounter) {
                calls.push({
                    player,
                    playerPokemon,
                    encounter: actualEncounter
                });

                if (options.battleResult !== undefined) {
                    return options.battleResult;
                }

                return {
                    success: true,
                    battleId: 1,
                    opponent: actualEncounter.species
                };
            }
        };

    return {
        flow: new EncounterBattleFlow(
            encounterFlow,
            wildBattleService
        ),
        encounter,
        encounterFlow,
        wildBattleService,
        calls
    };
}


// -------------------------------------
// Encounter availability
// -------------------------------------

test("EncounterBattleFlow reports no battle when there is no encounter", () => {
    const { flow } = createContext({
        encounter: null
    });

    assert.equal(flow.canBattle(), false);
    assert.equal(flow.getEncounter(), null);
});


test("EncounterBattleFlow reports battle availability for an active encounter", () => {
    const { flow } = createContext();

    assert.equal(flow.canBattle(), true);
});


test("EncounterBattleFlow returns the exact active encounter", () => {
    const { flow, encounter } = createContext();

    assert.strictEqual(flow.getEncounter(), encounter);
});


// -------------------------------------
// Starting wild battles
// -------------------------------------

test("EncounterBattleFlow rejects a battle when no encounter is active", () => {
    const { flow, calls } = createContext({
        encounter: null
    });

    const player = {
        name: "Red"
    };

    const pokemon = {
        species: "PIKACHU",
        level: 10
    };

    const result = flow.startBattle(player, pokemon);

    assert.equal(result.success, false);
    assert.equal(result.reason, "No active encounter");
    assert.equal(calls.length, 0);
});


test("EncounterBattleFlow rejects a battle when the service is unavailable", () => {
    const { flow, calls } = createContext({
        noWildBattle: true
    });

    const result = flow.startBattle(
        { name: "Red" },
        { species: "PIKACHU", level: 10 }
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Wild battle service unavailable"
    );

    assert.equal(calls.length, 0);
});


test("EncounterBattleFlow passes the player, Pokémon, and encounter to the battle service", () => {
    const {
        flow,
        encounter,
        calls
    } = createContext();

    const player = {
        name: "Red"
    };

    const pokemon = {
        species: "CHARMANDER",
        level: 5
    };

    const result = flow.startBattle(player, pokemon);

    assert.equal(result.success, true);
    assert.strictEqual(result.encounter, encounter);

    assert.deepEqual(calls, [
        {
            player,
            playerPokemon: pokemon,
            encounter
        }
    ]);

    assert.equal(result.battle.success, true);
    assert.equal(result.battle.opponent, "PIDGEY");
});


test("EncounterBattleFlow preserves the battle service result", () => {
    const battleResult = {
        success: true,
        battleId: 42,
        turn: 1
    };

    const { flow } = createContext({
        battleResult
    });

    const result = flow.startBattle(
        { name: "Red" },
        { species: "SQUIRTLE", level: 5 }
    );

    assert.equal(result.success, true);
    assert.strictEqual(result.battle, battleResult);
});


// -------------------------------------
// Failure propagation
// -------------------------------------

test("EncounterBattleFlow does not report success when the battle service fails", () => {
    const battleResult = {
        success: false,
        reason: "No usable player Pokémon"
    };

    const { flow } = createContext({
        battleResult
    });

    const result = flow.startBattle(
        { name: "Red" },
        { species: "PIKACHU", level: 10 }
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "No usable player Pokémon"
    );
    assert.strictEqual(result.battle, battleResult);
});
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const EncounterFlow = require("../scripts/encounter/encounter-flow");


function createContext(locations = {}) {
    const calls = {
        setEncounter: [],
        clearEncounter: 0,
        getLocation: []
    };

    let currentEncounter = null;

    const encounterManager = {
        setEncounter(encounter) {
            calls.setEncounter.push(encounter);
            currentEncounter = encounter;

            return {
                success: true,
                encounter
            };
        },

        getEncounter() {
            return currentEncounter;
        },

        clearEncounter() {
            calls.clearEncounter++;

            const previous = currentEncounter;
            currentEncounter = null;

            return {
                success: true,
                encounter: previous
            };
        },

        hasEncounter() {
            return currentEncounter !== null;
        }
    };

    const locationDatabase = {
        getLocation(location) {
            calls.getLocation.push(location);
            return locations[location] || null;
        }
    };

    return {
        flow: new EncounterFlow(
            encounterManager,
            locationDatabase
        ),
        encounterManager,
        locationDatabase,
        calls
    };
}


// -------------------------------------
// Available Pokémon
// -------------------------------------

test("EncounterFlow returns available Pokémon for a location", () => {
    const { flow } = createContext({
        ROUTE_1: {
            encounters: [
                { pokemon: "PIDGEY", level: 2 },
                { pokemon: "RATTATA", level: 3 },
                { pokemon: "PIKACHU", level: 5 }
            ]
        }
    });

    assert.deepEqual(
        flow.getAvailablePokemon("ROUTE_1"),
        ["PIDGEY", "RATTATA", "PIKACHU"]
    );
});


test("EncounterFlow removes duplicate species from the available list", () => {
    const { flow } = createContext({
        ROUTE_2: {
            encounters: [
                { pokemon: "PIDGEY", level: 2 },
                { pokemon: "RATTATA", level: 3 },
                { pokemon: "PIDGEY", level: 4 },
                { pokemon: "RATTATA", level: 5 },
                { pokemon: "SPEAROW", level: 6 }
            ]
        }
    });

    assert.deepEqual(
        flow.getAvailablePokemon("ROUTE_2"),
        ["PIDGEY", "RATTATA", "SPEAROW"]
    );
});


test("EncounterFlow returns an empty list for an unknown location", () => {
    const { flow } = createContext();

    assert.deepEqual(
        flow.getAvailablePokemon("UNKNOWN_LOCATION"),
        []
    );
});


test("EncounterFlow returns an empty list when encounter data is missing", () => {
    const { flow } = createContext({
        VIRIDIAN_CITY: {},
        PALLET_TOWN: {
            encounters: null
        }
    });

    assert.deepEqual(
        flow.getAvailablePokemon("VIRIDIAN_CITY"),
        []
    );

    assert.deepEqual(
        flow.getAvailablePokemon("PALLET_TOWN"),
        []
    );
});


test("EncounterFlow returns an empty list for a location with no encounters", () => {
    const { flow } = createContext({
        ROUTE_3: {
            encounters: []
        }
    });

    assert.deepEqual(
        flow.getAvailablePokemon("ROUTE_3"),
        []
    );
});


// -------------------------------------
// Generate encounters
// -------------------------------------

test("EncounterFlow generates an encounter with valid data", () => {
    const { flow, calls } = createContext({
        ROUTE_1: {
            encounters: [
                { pokemon: "PIDGEY", level: 2 },
                { pokemon: "RATTATA", level: 5 }
            ]
        }
    });

    const result = flow.generateEncounter("ROUTE_1");

    assert.equal(result.success, true);

    assert.equal(result.encounter.type, "WILD");
    assert.equal(result.encounter.location, "ROUTE_1");

    assert.ok(
        ["PIDGEY", "RATTATA"].includes(
            result.encounter.species
        )
    );

    assert.ok(result.encounter.level >= 2);
    assert.ok(result.encounter.level <= 5);

    assert.equal(calls.setEncounter.length, 1);
    assert.strictEqual(
        calls.setEncounter[0],
        result.encounter
    );
});


test("EncounterFlow selects only Pokémon available at the requested location", () => {
    const { flow } = createContext({
        ROUTE_1: {
            encounters: [
                { pokemon: "PIDGEY", level: 2 }
            ]
        },
        ROUTE_2: {
            encounters: [
                { pokemon: "RATTATA", level: 4 }
            ]
        }
    });

    for (let index = 0; index < 20; index++) {
        const result = flow.generateEncounter("ROUTE_1");

        assert.equal(result.success, true);
        assert.equal(result.encounter.species, "PIDGEY");
        assert.equal(result.encounter.location, "ROUTE_1");

        flow.endEncounter();
    }
});


test("EncounterFlow rejects generation when no Pokémon are available", () => {
    const { flow, calls } = createContext({
        ROUTE_1: {
            encounters: []
        }
    });

    const result = flow.generateEncounter("ROUTE_1");

    assert.equal(result.success, false);
    assert.equal(result.reason, "No Pokémon available");
    assert.equal(calls.setEncounter.length, 0);
});


test("EncounterFlow does not replace the current encounter when generation fails", () => {
    const { flow, encounterManager, calls } = createContext({
        ROUTE_1: {
            encounters: [
                { pokemon: "PIDGEY", level: 2 }
            ]
        },
        EMPTY_ROUTE: {
            encounters: []
        }
    });

    const initialResult = flow.generateEncounter("ROUTE_1");

    assert.equal(initialResult.success, true);

    const existingEncounter =
        encounterManager.getEncounter();

    const failedResult =
        flow.generateEncounter("EMPTY_ROUTE");

    assert.equal(failedResult.success, false);

    assert.strictEqual(
        flow.getCurrentEncounter(),
        existingEncounter
    );

    assert.equal(calls.setEncounter.length, 1);
});


// -------------------------------------
// Encounter level generation
// -------------------------------------

test("EncounterFlow generates a level within the configured range", () => {
    const { flow } = createContext({
        ROUTE_1: {
            encounters: [
                { pokemon: "PIDGEY", level: 2 },
                { pokemon: "RATTATA", level: 7 },
                { pokemon: "SPEAROW", level: 4 }
            ]
        }
    });

    for (let index = 0; index < 50; index++) {
        const level = flow.generateLevel("ROUTE_1");

        assert.ok(
            Number.isInteger(level),
            "Expected an integer encounter level"
        );

        assert.ok(level >= 2);
        assert.ok(level <= 7);
    }
});


test("EncounterFlow uses level 5 when location encounter data is unavailable", () => {
    const { flow } = createContext({
        ROUTE_1: {},
        ROUTE_2: {
            encounters: []
        }
    });

    assert.equal(flow.generateLevel("UNKNOWN_LOCATION"), 5);
    assert.equal(flow.generateLevel("ROUTE_1"), 5);
    assert.equal(flow.generateLevel("ROUTE_2"), 5);
});


test("EncounterFlow supports a location with one fixed encounter level", () => {
    const { flow } = createContext({
        ROUTE_1: {
            encounters: [
                { pokemon: "PIKACHU", level: 9 }
            ]
        }
    });

    assert.equal(flow.generateLevel("ROUTE_1"), 9);
});


test("EncounterFlow defaults missing encounter levels to level 5", () => {
    const { flow } = createContext({
        ROUTE_1: {
            encounters: [
                { pokemon: "PIDGEY" },
                { pokemon: "RATTATA", level: 8 }
            ]
        }
    });

    for (let index = 0; index < 30; index++) {
        const level = flow.generateLevel("ROUTE_1");

        assert.ok(level >= 5);
        assert.ok(level <= 8);
    }
});


// -------------------------------------
// Active encounter and status
// -------------------------------------

test("EncounterFlow returns the current encounter", () => {
    const { flow } = createContext({
        ROUTE_1: {
            encounters: [
                { pokemon: "PIKACHU", level: 4 }
            ]
        }
    });

    const result = flow.generateEncounter("ROUTE_1");

    assert.strictEqual(
        flow.getCurrentEncounter(),
        result.encounter
    );
});


test("EncounterFlow reports inactive status before an encounter", () => {
    const { flow } = createContext();

    const status = flow.getStatus();

    assert.equal(status.active, false);
    assert.equal(status.encounter, null);
});


test("EncounterFlow reports active status after generating an encounter", () => {
    const { flow } = createContext({
        ROUTE_1: {
            encounters: [
                { pokemon: "RATTATA", level: 3 }
            ]
        }
    });

    const result = flow.generateEncounter("ROUTE_1");
    const status = flow.getStatus();

    assert.equal(status.active, true);
    assert.strictEqual(
        status.encounter,
        result.encounter
    );
});


test("EncounterFlow ends and clears the current encounter", () => {
    const { flow, calls } = createContext({
        ROUTE_1: {
            encounters: [
                { pokemon: "PIDGEY", level: 2 }
            ]
        }
    });

    flow.generateEncounter("ROUTE_1");

    const result = flow.endEncounter();

    assert.equal(result.success, true);
    assert.equal(calls.clearEncounter, 1);
    assert.equal(flow.getCurrentEncounter(), null);
    assert.equal(flow.getStatus().active, false);
});


test("EncounterFlow delegates location lookups to the location database", () => {
    const { flow, calls } = createContext({
        ROUTE_1: {
            encounters: [
                { pokemon: "RATTATA", level: 3 }
            ]
        }
    });

    flow.getAvailablePokemon("ROUTE_1");

    assert.deepEqual(
        calls.getLocation,
        ["ROUTE_1"]
    );
});
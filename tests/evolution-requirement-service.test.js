"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const EvolutionRequirementService = require("../scripts/services/evolution-requirement-service");

function createService(evolutions = []) {
    return new EvolutionRequirementService(evolutions);
}

function createEvolution(targetSpecies, method, extra = {}) {
    return {
        targetSpecies,
        method,
        ...extra
    };
}

function createChain(species, evolutions) {
    return {
        species,
        evolutions
    };
}

test("constructor uses an empty array by default", () => {
    const service = createService();

    assert.deepEqual(service.evolutions, []);
});

test("constructor stores the provided evolution database", () => {
    const database = [createChain("PICHU", [])];
    const service = createService(database);

    assert.equal(service.evolutions, database);
});

test("constructor falls back to an empty array for non-array input", () => {
    for (const value of [null, undefined, {}, "data", 123]) {
        const service = new EvolutionRequirementService(value);

        assert.deepEqual(service.evolutions, []);
    }
});

test("normalizeMethod returns null for null or undefined", () => {
    const service = createService();

    assert.equal(service.normalizeMethod(null), null);
    assert.equal(service.normalizeMethod(undefined), null);
});

test("normalizeMethod trims whitespace and converts methods to uppercase", () => {
    const service = createService();

    assert.equal(service.normalizeMethod("  evo_level  "), "LEVEL");
    assert.equal(service.normalizeMethod("  evo_item  "), "EVO_ITEM");
    assert.equal(service.normalizeMethod("  custom_method  "), "CUSTOM_METHOD");
});

test("normalizeMethod converts EVO_LEVEL to LEVEL", () => {
    const service = createService();

    assert.equal(service.normalizeMethod("EVO_LEVEL"), "LEVEL");
});

test("normalizeMethod preserves EVO_ITEM", () => {
    const service = createService();

    assert.equal(service.normalizeMethod("EVO_ITEM"), "EVO_ITEM");
});

test("normalizeMethod preserves EVO_TRADE", () => {
    const service = createService();

    assert.equal(service.normalizeMethod("EVO_TRADE"), "EVO_TRADE");
});

test("normalizeMethod preserves EVO_TRADE_ITEM", () => {
    const service = createService();

    assert.equal(service.normalizeMethod("EVO_TRADE_ITEM"), "EVO_TRADE_ITEM");
});

test("normalizeMethod converts EVO_BEAUTY to BEAUTY", () => {
    const service = createService();

    assert.equal(service.normalizeMethod("EVO_BEAUTY"), "BEAUTY");
});

test("normalizeMethod converts stat-based evolution methods to LEVEL", () => {
    const service = createService();

    const methods = [
        "EVO_LEVEL_ATK_GT_DEF",
        "EVO_LEVEL_ATK_EQ_DEF",
        "EVO_LEVEL_ATK_LT_DEF",
        "EVO_LEVEL_SILCOON",
        "EVO_LEVEL_CASCOON",
        "EVO_LEVEL_NINJASK",
        "EVO_LEVEL_SHEDINJA"
    ];

    for (const method of methods) {
        assert.equal(service.normalizeMethod(method), "LEVEL");
    }
});

test("normalizeMethod returns unknown normalized methods unchanged", () => {
    const service = createService();

    assert.equal(service.normalizeMethod("CUSTOM_METHOD"), "CUSTOM_METHOD");
    assert.equal(service.normalizeMethod("unknown"), "UNKNOWN");
});

test("normalizeMethod converts non-string values to strings", () => {
    const service = createService();

    assert.equal(service.normalizeMethod(123), "123");
    assert.equal(service.normalizeMethod(true), "TRUE");
});

test("buildRequirement returns null for a missing evolution", () => {
    const service = createService();

    assert.equal(service.buildRequirement(null), null);
    assert.equal(service.buildRequirement(undefined), null);
});

test("buildRequirement builds a level requirement from level", () => {
    const service = createService();

    assert.deepEqual(
        service.buildRequirement({
            method: "EVO_LEVEL",
            level: 16
        }),
        {
            method: "LEVEL",
            level: 16,
            item: null
        }
    );
});

test("buildRequirement uses parameter when level is missing", () => {
    const service = createService();

    assert.deepEqual(
        service.buildRequirement({
            method: "EVO_LEVEL",
            parameter: 20
        }),
        {
            method: "LEVEL",
            level: 20,
            item: null
        }
    );
});

test("buildRequirement prefers level over parameter", () => {
    const service = createService();

    assert.deepEqual(
        service.buildRequirement({
            method: "EVO_LEVEL",
            level: 25,
            parameter: 16
        }),
        {
            method: "LEVEL",
            level: 25,
            item: null
        }
    );
});

test("buildRequirement converts a numeric-string level to a number", () => {
    const service = createService();

    assert.deepEqual(
        service.buildRequirement({
            method: "EVO_LEVEL",
            level: "18"
        }),
        {
            method: "LEVEL",
            level: 18,
            item: null
        }
    );
});

test("buildRequirement returns a null level when the level is missing", () => {
    const service = createService();

    assert.deepEqual(
        service.buildRequirement({
            method: "EVO_LEVEL"
        }),
        {
            method: "LEVEL",
            level: null,
            item: null
        }
    );
});

test("buildRequirement returns a null level for null or empty level values", () => {
    const service = createService();

    for (const level of [null, ""]) {
        assert.equal(
            service.buildRequirement({
                method: "EVO_LEVEL",
                level
            }).level,
            null
        );
    }
});

test("buildRequirement converts an empty level to a null level without using parameter", () => {
    const service = createService();

    assert.equal(
        service.buildRequirement({
            method: "EVO_LEVEL",
            level: "",
            parameter: 16
        }).level,
        null
    );
});

test("buildRequirement builds an item requirement from item", () => {
    const service = createService();

    assert.deepEqual(
        service.buildRequirement({
            method: "EVO_ITEM",
            item: "FIRE_STONE"
        }),
        {
            method: "EVO_ITEM",
            level: null,
            item: "FIRE_STONE"
        }
    );
});

test("buildRequirement uses parameter when an item is missing", () => {
    const service = createService();

    assert.equal(
        service.buildRequirement({
            method: "EVO_ITEM",
            parameter: "THUNDER_STONE"
        }).item,
        "THUNDER_STONE"
    );
});

test("buildRequirement preserves an explicitly empty item", () => {
    const service = createService();

    assert.equal(
        service.buildRequirement({
            method: "EVO_ITEM",
            item: "",
            parameter: "FIRE_STONE"
        }).item,
        ""
    );
});

test("buildRequirement returns a null item when item and parameter are missing", () => {
    const service = createService();

    assert.equal(
        service.buildRequirement({
            method: "EVO_ITEM"
        }).item,
        null
    );
});

test("buildRequirement creates a trade requirement without an item", () => {
    const service = createService();

    assert.deepEqual(
        service.buildRequirement({
            method: "EVO_TRADE",
            item: "FIRE_STONE"
        }),
        {
            method: "EVO_TRADE",
            level: null,
            item: null
        }
    );
});

test("buildRequirement creates a trade-item requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.buildRequirement({
            method: "EVO_TRADE_ITEM",
            item: "METAL_COAT"
        }),
        {
            method: "EVO_TRADE_ITEM",
            level: null,
            item: "METAL_COAT"
        }
    );
});

test("buildRequirement uses parameter for a trade-item requirement", () => {
    const service = createService();

    assert.equal(
        service.buildRequirement({
            method: "EVO_TRADE_ITEM",
            parameter: "KING'S_ROCK"
        }).item,
        "KING'S_ROCK"
    );
});

test("buildRequirement creates a beauty requirement", () => {
    const service = createService();

    assert.deepEqual(
        service.buildRequirement({
            method: "EVO_BEAUTY",
            beauty: 170
        }),
        {
            method: "BEAUTY",
            level: null,
            item: null,
            beauty: 170
        }
    );
});

test("buildRequirement uses parameter when beauty is missing", () => {
    const service = createService();

    assert.equal(
        service.buildRequirement({
            method: "EVO_BEAUTY",
            parameter: 200
        }).beauty,
        200
    );
});

test("buildRequirement preserves an explicitly zero beauty value", () => {
    const service = createService();

    assert.equal(
        service.buildRequirement({
            method: "EVO_BEAUTY",
            beauty: 0,
            parameter: 200
        }).beauty,
        0
    );
});

test("buildRequirement returns basic fields for an unknown method", () => {
    const service = createService();

    assert.deepEqual(
        service.buildRequirement({
            method: "CUSTOM_METHOD",
            level: 12,
            item: "SPECIAL_ITEM",
            parameter: 99
        }),
        {
            method: "CUSTOM_METHOD",
            level: 12,
            item: "SPECIAL_ITEM"
        }
    );
});

test("buildRequirement normalizes a missing method to null", () => {
    const service = createService();

    assert.deepEqual(
        service.buildRequirement({
            level: 10,
            item: "STONE"
        }),
        {
            method: null,
            level: 10,
            item: "STONE"
        }
    );
});

test("getEvolutionSource returns null for a missing species", () => {
    const service = createService();

    assert.equal(service.getEvolutionSource(null), null);
    assert.equal(service.getEvolutionSource(undefined), null);
    assert.equal(service.getEvolutionSource(""), null);
});

test("getEvolutionSource finds an evolution using targetSpecies", () => {
    const evolution = createEvolution("RAICHU", "EVO_ITEM", {
        item: "THUNDER_STONE"
    });
    const service = createService([
        createChain("PIKACHU", [evolution])
    ]);

    assert.deepEqual(service.getEvolutionSource("RAICHU"), {
        from: "PIKACHU",
        requirement: {
            method: "EVO_ITEM",
            level: null,
            item: "THUNDER_STONE"
        }
    });
});

test("getEvolutionSource supports the legacy target property", () => {
    const service = createService([
        createChain("PIKACHU", [
            {
                target: "RAICHU",
                method: "EVO_ITEM",
                item: "THUNDER_STONE"
            }
        ])
    ]);

    assert.equal(service.getEvolutionSource("RAICHU").from, "PIKACHU");
});

test("getEvolutionSource prefers targetSpecies over target", () => {
    const service = createService([
        createChain("PIKACHU", [
            {
                targetSpecies: "RAICHU",
                target: "PICHU",
                method: "EVO_ITEM",
                item: "THUNDER_STONE"
            }
        ])
    ]);

    assert.equal(service.getEvolutionSource("RAICHU").from, "PIKACHU");
    assert.equal(service.getEvolutionSource("PICHU"), null);
});

test("getEvolutionSource returns the first matching evolution", () => {
    const service = createService([
        createChain("FIRST_SOURCE", [
            createEvolution("TARGET", "EVO_LEVEL", { level: 10 })
        ]),
        createChain("SECOND_SOURCE", [
            createEvolution("TARGET", "EVO_LEVEL", { level: 20 })
        ])
    ]);

    assert.equal(service.getEvolutionSource("TARGET").from, "FIRST_SOURCE");
    assert.equal(
        service.getEvolutionSource("TARGET").requirement.level,
        10
    );
});

test("getEvolutionSource skips null chains", () => {
    const service = createService([
        null,
        createChain("PIKACHU", [
            createEvolution("RAICHU", "EVO_LEVEL", { level: 20 })
        ])
    ]);

    assert.equal(service.getEvolutionSource("RAICHU").from, "PIKACHU");
});

test("getEvolutionSource skips chains without an evolutions array", () => {
    const service = createService([
        {},
        { species: "INVALID", evolutions: null },
        createChain("PIKACHU", [
            createEvolution("RAICHU", "EVO_LEVEL", { level: 20 })
        ])
    ]);

    assert.equal(service.getEvolutionSource("RAICHU").from, "PIKACHU");
});

test("getEvolutionSource skips null evolution entries", () => {
    const service = createService([
        createChain("PIKACHU", [
            null,
            createEvolution("RAICHU", "EVO_LEVEL", { level: 20 })
        ])
    ]);

    assert.equal(service.getEvolutionSource("RAICHU").from, "PIKACHU");
});

test("getEvolutionSource returns null when no target matches", () => {
    const service = createService([
        createChain("PIKACHU", [
            createEvolution("RAICHU", "EVO_ITEM", {
                item: "THUNDER_STONE"
            })
        ])
    ]);

    assert.equal(service.getEvolutionSource("PICHU"), null);
});

test("getEvolutionSource returns null for an empty database", () => {
    const service = createService([]);

    assert.equal(service.getEvolutionSource("RAICHU"), null);
});

test("getEvolutionSource builds an empty requirement for a missing method", () => {
    const service = createService([
        createChain("SOURCE", [
            createEvolution("TARGET", null)
        ])
    ]);

    assert.deepEqual(service.getEvolutionSource("TARGET"), {
        from: "SOURCE",
        requirement: {
            method: null,
            level: null,
            item: null
        }
    });
});

test("canEvolveBeforeStage rejects a species with no evolution source", () => {
    const service = createService();

    assert.deepEqual(
        service.canEvolveBeforeStage("UNKNOWN", {
            maxReasonableLevel: 100
        }),
        {
            available: false,
            reason: "No evolution source found"
        }
    );
});

test("canEvolveBeforeStage rejects a missing stage rule for level evolution", () => {
    const service = createService([
        createChain("CHARMANDER", [
            createEvolution("CHARMELEON", "EVO_LEVEL", { level: 16 })
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("CHARMELEON", null),
        {
            available: false,
            reason: "Missing stage level rule"
        }
    );
});

test("canEvolveBeforeStage rejects a stage rule with no maximum level", () => {
    const service = createService([
        createChain("CHARMANDER", [
            createEvolution("CHARMELEON", "EVO_LEVEL", { level: 16 })
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("CHARMELEON", {}),
        {
            available: false,
            reason: "Missing stage level rule"
        }
    );
});

test("canEvolveBeforeStage allows a level evolution within the stage limit", () => {
    const service = createService([
        createChain("CHARMANDER", [
            createEvolution("CHARMELEON", "EVO_LEVEL", { level: 16 })
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("CHARMELEON", {
            maxReasonableLevel: 20
        }),
        {
            available: true
        }
    );
});

test("canEvolveBeforeStage allows a level equal to the stage limit", () => {
    const service = createService([
        createChain("CHARMANDER", [
            createEvolution("CHARMELEON", "EVO_LEVEL", { level: 16 })
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("CHARMELEON", {
            maxReasonableLevel: 16
        }),
        {
            available: true
        }
    );
});

test("canEvolveBeforeStage rejects a level above the stage limit", () => {
    const service = createService([
        createChain("CHARMANDER", [
            createEvolution("CHARMELEON", "EVO_LEVEL", { level: 36 })
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("CHARMELEON", {
            maxReasonableLevel: 20
        }),
        {
            available: false,
            reason: "Requires level 36"
        }
    );
});

test("canEvolveBeforeStage reports a null level when the requirement has no level", () => {
    const service = createService([
        createChain("SOURCE", [
            createEvolution("TARGET", "EVO_LEVEL")
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("TARGET", {
            maxReasonableLevel: 50
        }),
        {
            available: false,
            reason: "Requires level null"
        }
    );
});

test("canEvolveBeforeStage rejects item evolution with the required item", () => {
    const service = createService([
        createChain("EEVEE", [
            createEvolution("FLAREON", "EVO_ITEM", {
                item: "FIRE_STONE"
            })
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("FLAREON", {
            maxReasonableLevel: 100
        }),
        {
            available: false,
            reason: "Requires item: FIRE_STONE"
        }
    );
});

test("canEvolveBeforeStage reports a missing item for item evolution", () => {
    const service = createService([
        createChain("EEVEE", [
            createEvolution("FLAREON", "EVO_ITEM")
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("FLAREON", {}),
        {
            available: false,
            reason: "Requires item: null"
        }
    );
});

test("canEvolveBeforeStage allows trade evolution", () => {
    const service = createService([
        createChain("HAUNTER", [
            createEvolution("GENGAR", "EVO_TRADE")
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("GENGAR", null),
        {
            available: true,
            reason: null
        }
    );
});

test("canEvolveBeforeStage rejects trade-item evolution", () => {
    const service = createService([
        createChain("ONIX", [
            createEvolution("STEELIX", "EVO_TRADE_ITEM", {
                item: "METAL_COAT"
            })
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("STEELIX", null),
        {
            available: false,
            reason: "Requires trade and item: METAL_COAT"
        }
    );
});

test("canEvolveBeforeStage reports a missing item for trade-item evolution", () => {
    const service = createService([
        createChain("ONIX", [
            createEvolution("STEELIX", "EVO_TRADE_ITEM")
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("STEELIX", null),
        {
            available: false,
            reason: "Requires trade and item: null"
        }
    );
});

test("canEvolveBeforeStage rejects beauty evolution", () => {
    const service = createService([
        createChain("FEEBAS", [
            createEvolution("MILOTIC", "EVO_BEAUTY", {
                beauty: 170
            })
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("MILOTIC", null),
        {
            available: false,
            reason: "Requires beauty: 170"
        }
    );
});

test("canEvolveBeforeStage reports a missing beauty value", () => {
    const service = createService([
        createChain("FEEBAS", [
            createEvolution("MILOTIC", "EVO_BEAUTY")
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("MILOTIC", null),
        {
            available: false,
            reason: "Requires beauty: null"
        }
    );
});

test("canEvolveBeforeStage rejects an unknown evolution requirement", () => {
    const service = createService([
        createChain("SOURCE", [
            createEvolution("TARGET", "CUSTOM_METHOD")
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("TARGET", null),
        {
            available: false,
            reason: "Unknown evolution requirement"
        }
    );
});

test("canEvolveBeforeStage rejects an unknown normalized requirement", () => {
    const service = createService([
        createChain("SOURCE", [
            createEvolution("TARGET", null)
        ])
    ]);

    assert.deepEqual(
        service.canEvolveBeforeStage("TARGET", null),
        {
            available: false,
            reason: "Unknown evolution requirement"
        }
    );
});

test("explain reports that a species without an evolution source does not evolve", () => {
    const service = createService();

    assert.deepEqual(service.explain("PIKACHU"), {
        species: "PIKACHU",
        evolves: false
    });
});

test("explain includes the source and requirement for an evolving species", () => {
    const service = createService([
        createChain("PIKACHU", [
            createEvolution("RAICHU", "EVO_ITEM", {
                item: "THUNDER_STONE"
            })
        ])
    ]);

    assert.deepEqual(service.explain("RAICHU"), {
        species: "RAICHU",
        evolves: true,
        from: "PIKACHU",
        requirement: {
            method: "EVO_ITEM",
            level: null,
            item: "THUNDER_STONE"
        }
    });
});

test("explain preserves the requested species in its result", () => {
    const service = createService([
        createChain("SOURCE", [
            createEvolution("TARGET", "EVO_LEVEL", { level: 10 })
        ])
    ]);

    assert.equal(service.explain("TARGET").species, "TARGET");
});

test("explain includes a level requirement", () => {
    const service = createService([
        createChain("BULBASAUR", [
            createEvolution("IVYSAUR", "EVO_LEVEL", { level: 16 })
        ])
    ]);

    assert.deepEqual(service.explain("IVYSAUR"), {
        species: "IVYSAUR",
        evolves: true,
        from: "BULBASAUR",
        requirement: {
            method: "LEVEL",
            level: 16,
            item: null
        }
    });
});

test("explain returns evolves false when the species argument is missing", () => {
    const service = createService();

    assert.deepEqual(service.explain(undefined), {
        species: undefined,
        evolves: false
    });
});
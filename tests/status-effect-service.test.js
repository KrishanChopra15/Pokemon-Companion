
"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const StatusEffectService = require("../scripts/services/status-effect-service");

function createService() {
    return new StatusEffectService();
}

function createPokemon(overrides = {}) {
    return {
        name: "Test Pokemon",
        hp: 100,
        maxHP: 100,
        status: null,
        statusTurns: 0,
        statusData: null,
        ...overrides
    };
}

function withMockedRandom(value, callback) {
    const originalRandom = Math.random;

    Math.random = () => value;

    try {
        return callback();
    } finally {
        Math.random = originalRandom;
    }
}

describe("StatusEffectService", () => {
    describe("Constructor and status definitions", () => {
        it("should create a service instance", () => {
            assert.ok(createService() instanceof StatusEffectService);
        });

        it("should define all six supported statuses", () => {
            const service = createService();

            assert.deepEqual(service.getAllStatuses(), [
                "POISON",
                "BAD_POISON",
                "BURN",
                "PARALYSIS",
                "SLEEP",
                "FREEZE"
            ]);
        });

        it("should define poison damage as one eighth", () => {
            assert.equal(createService().effects.POISON.damageFraction, 1 / 8);
        });

        it("should define toxic damage as one sixteenth before scaling", () => {
            assert.equal(
                createService().effects.BAD_POISON.damageFraction,
                1 / 16
            );
        });

        it("should define burn damage as one eighth", () => {
            assert.equal(createService().effects.BURN.damageFraction, 1 / 8);
        });

        it("should define the burn attack multiplier", () => {
            assert.equal(
                createService().effects.BURN.attackMultiplier,
                0.5
            );
        });

        it("should define the paralysis speed multiplier", () => {
            assert.equal(
                createService().effects.PARALYSIS.speedMultiplier,
                0.25
            );
        });

        it("should define the paralysis immobilization chance", () => {
            assert.equal(
                createService().effects.PARALYSIS.immobilizeChance,
                0.25
            );
        });

        it("should define the sleep duration range", () => {
            const service = createService();

            assert.equal(service.effects.SLEEP.minTurns, 1);
            assert.equal(service.effects.SLEEP.maxTurns, 7);
        });

        it("should define the freeze thaw chance", () => {
            assert.equal(createService().effects.FREEZE.thawChance, 0.2);
        });
    });

    describe("Status application", () => {
        it("should apply poison successfully", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.deepEqual(service.applyStatus(pokemon, "POISON"), {
                success: true,
                status: "POISON"
            });

            assert.equal(pokemon.status, "POISON");
        });

        it("should apply burn successfully", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.deepEqual(service.applyStatus(pokemon, "BURN"), {
                success: true,
                status: "BURN"
            });
        });

        it("should apply paralysis successfully", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.deepEqual(service.applyStatus(pokemon, "PARALYSIS"), {
                success: true,
                status: "PARALYSIS"
            });
        });

        it("should apply bad poison successfully", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.deepEqual(service.applyStatus(pokemon, "BAD_POISON"), {
                success: true,
                status: "BAD_POISON"
            });
        });

        it("should initialize statusData when applying a status", () => {
            const service = createService();
            const pokemon = createPokemon();

            service.applyStatus(pokemon, "POISON");

            assert.deepEqual(pokemon.statusData, { toxicCounter: 0 });
        });

        it("should initialize the toxic counter to zero", () => {
            const service = createService();
            const pokemon = createPokemon();

            service.applyStatus(pokemon, "BAD_POISON");

            assert.equal(pokemon.statusData.toxicCounter, 0);
        });

        it("should allow sleep to last one turn", () => {
            const service = createService();
            const pokemon = createPokemon();

            withMockedRandom(0, () => {
                service.applyStatus(pokemon, "SLEEP");
            });

            assert.equal(pokemon.statusTurns, 1);
        });

        it("should allow sleep to last seven turns", () => {
            const service = createService();
            const pokemon = createPokemon();

            withMockedRandom(0.999999, () => {
                service.applyStatus(pokemon, "SLEEP");
            });

            assert.equal(pokemon.statusTurns, 7);
        });

        it("should assign an intermediate sleep duration", () => {
            const service = createService();
            const pokemon = createPokemon();

            withMockedRandom(0.5, () => {
                service.applyStatus(pokemon, "SLEEP");
            });

            assert.equal(pokemon.statusTurns, 4);
        });

        it("should reject an unknown status", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.deepEqual(service.applyStatus(pokemon, "CONFUSION"), {
                success: false,
                reason: "Unknown status"
            });

            assert.equal(pokemon.status, null);
        });

        it("should reject a missing status", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.deepEqual(service.applyStatus(pokemon, undefined), {
                success: false,
                reason: "Unknown status"
            });
        });

        it("should not overwrite an existing status", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "POISON" });

            assert.deepEqual(service.applyStatus(pokemon, "BURN"), {
                success: false,
                reason: "Already has status"
            });

            assert.equal(pokemon.status, "POISON");
        });

        it("should not overwrite an existing sleep status", () => {
            const service = createService();
            const pokemon = createPokemon({
                status: "SLEEP",
                statusTurns: 3
            });

            const result = service.applyStatus(pokemon, "PARALYSIS");

            assert.equal(result.success, false);
            assert.equal(pokemon.status, "SLEEP");
            assert.equal(pokemon.statusTurns, 3);
        });

        it("should support inflict as an alias for applyStatus", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.deepEqual(service.inflict(pokemon, "POISON"), {
                success: true,
                status: "POISON"
            });
        });

        it("should not initialize sleep turns for non-sleep statuses", () => {
            const service = createService();
            const pokemon = createPokemon({ statusTurns: 5 });

            service.applyStatus(pokemon, "POISON");

            assert.equal(pokemon.statusTurns, 5);
        });
    });

    describe("Status removal", () => {
        it("should remove the current status", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "POISON" });

            service.removeStatus(pokemon);

            assert.equal(pokemon.status, null);
        });

        it("should reset status turns", () => {
            const service = createService();
            const pokemon = createPokemon({
                status: "SLEEP",
                statusTurns: 4
            });

            service.removeStatus(pokemon);

            assert.equal(pokemon.statusTurns, 0);
        });

        it("should clear statusData", () => {
            const service = createService();
            const pokemon = createPokemon({
                status: "BAD_POISON",
                statusData: { toxicCounter: 3 }
            });

            service.removeStatus(pokemon);

            assert.equal(pokemon.statusData, null);
        });

        it("should return a successful removal result", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "BURN" });

            assert.deepEqual(service.removeStatus(pokemon), {
                success: true
            });
        });

        it("should safely remove a status when none is present", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.deepEqual(service.removeStatus(pokemon), {
                success: true
            });

            assert.equal(pokemon.status, null);
            assert.equal(pokemon.statusTurns, 0);
            assert.equal(pokemon.statusData, null);
        });
    });

    describe("Status queries", () => {
        it("should return true when the requested status matches", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "POISON" });

            assert.equal(service.hasStatus(pokemon, "POISON"), true);
        });

        it("should return false when the requested status differs", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "POISON" });

            assert.equal(service.hasStatus(pokemon, "BURN"), false);
        });

        it("should return false when no status is present", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.equal(service.hasStatus(pokemon, "POISON"), false);
        });

        it("should return the current status", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "PARALYSIS" });

            assert.equal(service.getStatus(pokemon), "PARALYSIS");
        });

        it("should return null when no status is present", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.equal(service.getStatus(pokemon), null);
        });
    });

    describe("Turn processing and status damage", () => {
        it("should return zero damage when no status is present", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.deepEqual(service.processTurn(pokemon), {
                success: true,
                damage: 0
            });

            assert.equal(pokemon.hp, 100);
        });

        it("should apply poison damage based on max HP", () => {
            const service = createService();
            const pokemon = createPokemon({
                hp: 100,
                maxHP: 120,
                status: "POISON"
            });

            const result = service.processTurn(pokemon);

            assert.equal(result.damage, 15);
            assert.equal(pokemon.hp, 85);
            assert.equal(result.status, "POISON");
        });

        it("should apply burn damage based on max HP", () => {
            const service = createService();
            const pokemon = createPokemon({
                hp: 100,
                maxHP: 80,
                status: "BURN"
            });

            const result = service.processTurn(pokemon);

            assert.equal(result.damage, 10);
            assert.equal(pokemon.hp, 90);
        });

        it("should apply bad poison damage on the first turn", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "BAD_POISON" });

            const result = service.processTurn(pokemon);

            assert.equal(result.damage, 6);
            assert.equal(pokemon.hp, 94);
            assert.equal(pokemon.statusData.toxicCounter, 1);
        });

        it("should increase bad poison damage on subsequent turns", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "BAD_POISON" });

            service.processTurn(pokemon);
            const result = service.processTurn(pokemon);

            assert.equal(result.damage, 12);
            assert.equal(pokemon.hp, 82);
            assert.equal(pokemon.statusData.toxicCounter, 2);
        });

        it("should continue increasing the toxic counter", () => {
            const service = createService();
            const pokemon = createPokemon({
                status: "BAD_POISON",
                statusData: { toxicCounter: 3 }
            });

            const result = service.processTurn(pokemon);

            assert.equal(result.damage, 25);
            assert.equal(pokemon.statusData.toxicCounter, 4);
        });

        it("should initialize missing toxic status data", () => {
            const service = createService();
            const pokemon = createPokemon({
                status: "BAD_POISON",
                statusData: null
            });

            const result = service.processTurn(pokemon);

            assert.equal(result.damage, 6);
            assert.equal(pokemon.statusData.toxicCounter, 1);
        });

        it("should deal at least one damage for a small HP value", () => {
            const service = createService();
            const pokemon = createPokemon({
                hp: 5,
                maxHP: 5,
                status: "POISON"
            });

            const result = service.processTurn(pokemon);

            assert.equal(result.damage, 1);
            assert.equal(pokemon.hp, 4);
        });

        it("should reduce HP to zero when damage exceeds remaining HP", () => {
            const service = createService();
            const pokemon = createPokemon({
                hp: 1,
                maxHP: 100,
                status: "POISON"
            });

            const result = service.processTurn(pokemon);

            assert.equal(result.damage, 12);
            assert.equal(pokemon.hp, 0);
        });

        it("should not allow HP to become negative", () => {
            const service = createService();
            const pokemon = createPokemon({
                hp: 2,
                maxHP: 100,
                status: "BURN"
            });

            service.processTurn(pokemon);

            assert.equal(pokemon.hp, 0);
            assert.ok(pokemon.hp >= 0);
        });

        it("should return the current status when processing a status effect", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "BURN" });

            assert.equal(service.processTurn(pokemon).status, "BURN");
        });

        it("should not apply end-turn damage for sleep", () => {
            const service = createService();
            const pokemon = createPokemon({
                status: "SLEEP",
                statusTurns: 3
            });

            const result = service.processTurn(pokemon);

            assert.equal(result.damage, 0);
            assert.equal(pokemon.hp, 100);
        });

        it("should not apply end-turn damage for freeze", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "FREEZE" });

            const result = service.processTurn(pokemon);

            assert.equal(result.damage, 0);
            assert.equal(pokemon.hp, 100);
        });

        it("should not apply end-turn damage for paralysis", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "PARALYSIS" });

            const result = service.processTurn(pokemon);

            assert.equal(result.damage, 0);
            assert.equal(pokemon.hp, 100);
        });
    });

    describe("Can act: sleep", () => {
        it("should prevent action while sleep turns remain", () => {
            const service = createService();
            const pokemon = createPokemon({
                status: "SLEEP",
                statusTurns: 3
            });

            assert.equal(service.canAct(pokemon), false);
            assert.equal(pokemon.statusTurns, 2);
            assert.equal(pokemon.status, "SLEEP");
        });

        it("should reduce sleep turns by one each time", () => {
            const service = createService();
            const pokemon = createPokemon({
                status: "SLEEP",
                statusTurns: 3
            });

            service.canAct(pokemon);
            service.canAct(pokemon);

            assert.equal(pokemon.statusTurns, 1);
        });

        it("should wake up when the sleep counter reaches zero", () => {
            const service = createService();
            const pokemon = createPokemon({
                status: "SLEEP",
                statusTurns: 1
            });

            assert.equal(service.canAct(pokemon), true);
            assert.equal(pokemon.status, null);
            assert.equal(pokemon.statusTurns, 0);
            assert.equal(pokemon.statusData, null);
        });

        it("should allow action when the sleep counter starts at zero", () => {
            const service = createService();
            const pokemon = createPokemon({
                status: "SLEEP",
                statusTurns: 0
            });

            assert.equal(service.canAct(pokemon), true);
            assert.equal(pokemon.status, null);
        });
    });

    describe("Can act: freeze", () => {
        it("should thaw when the random value equals the thaw threshold", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "FREEZE" });

            const result = withMockedRandom(0.2, () => {
                return service.canAct(pokemon);
            });

            assert.equal(result, true);
            assert.equal(pokemon.status, null);
        });

        it("should thaw when the random value is below the threshold", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "FREEZE" });

            const result = withMockedRandom(0.1, () => {
                return service.canAct(pokemon);
            });

            assert.equal(result, true);
            assert.equal(pokemon.status, null);
        });

        it("should remain frozen when the random value exceeds the threshold", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "FREEZE" });

            const result = withMockedRandom(0.21, () => {
                return service.canAct(pokemon);
            });

            assert.equal(result, false);
            assert.equal(pokemon.status, "FREEZE");
        });
    });

    describe("Can act: paralysis", () => {
        it("should prevent action when the random value is zero", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "PARALYSIS" });

            assert.equal(
                withMockedRandom(0, () => service.canAct(pokemon)),
                false
            );
        });

        it("should prevent action at the immobilization threshold", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "PARALYSIS" });

            assert.equal(
                withMockedRandom(0.25, () => service.canAct(pokemon)),
                false
            );
        });

        it("should allow action when the random value exceeds the threshold", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "PARALYSIS" });

            assert.equal(
                withMockedRandom(0.26, () => service.canAct(pokemon)),
                true
            );
        });

        it("should allow action when the random value is near one", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "PARALYSIS" });

            assert.equal(
                withMockedRandom(0.999999, () => service.canAct(pokemon)),
                true
            );
        });
    });

    describe("Can act: other statuses", () => {
        it("should allow action when poisoned", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "POISON" });

            assert.equal(service.canAct(pokemon), true);
        });

        it("should allow action when burned", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "BURN" });

            assert.equal(service.canAct(pokemon), true);
        });

        it("should allow action when badly poisoned", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "BAD_POISON" });

            assert.equal(service.canAct(pokemon), true);
        });

        it("should allow action when no status is present", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.equal(service.canAct(pokemon), true);
        });
    });

    describe("Battle modifiers", () => {
        it("should reduce speed to one quarter during paralysis", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "PARALYSIS" });

            assert.equal(service.getSpeedMultiplier(pokemon), 0.25);
        });

        it("should return normal speed without paralysis", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "POISON" });

            assert.equal(service.getSpeedMultiplier(pokemon), 1);
        });

        it("should return normal speed without a status", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.equal(service.getSpeedMultiplier(pokemon), 1);
        });

        it("should halve attack during burn", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "BURN" });

            assert.equal(service.getAttackMultiplier(pokemon), 0.5);
        });

        it("should return normal attack without burn", () => {
            const service = createService();
            const pokemon = createPokemon({ status: "POISON" });

            assert.equal(service.getAttackMultiplier(pokemon), 1);
        });

        it("should return normal attack without a status", () => {
            const service = createService();
            const pokemon = createPokemon();

            assert.equal(service.getAttackMultiplier(pokemon), 1);
        });
    });

    describe("Random number generation", () => {
        it("should return the minimum when Math.random is zero", () => {
            const service = createService();

            assert.equal(
                withMockedRandom(0, () => service.randomNumber(1, 7)),
                1
            );
        });

        it("should return the maximum for a random value near one", () => {
            const service = createService();

            assert.equal(
                withMockedRandom(0.999999, () => service.randomNumber(1, 7)),
                7
            );
        });

        it("should return a number within the inclusive range", () => {
            const service = createService();

            for (const randomValue of [0, 0.1, 0.25, 0.5, 0.75, 0.999999]) {
                const result = withMockedRandom(randomValue, () => {
                    return service.randomNumber(2, 6);
                });

                assert.ok(result >= 2);
                assert.ok(result <= 6);
                assert.equal(Number.isInteger(result), true);
            }
        });

        it("should return the same value when the minimum equals the maximum", () => {
            const service = createService();

            assert.equal(
                withMockedRandom(0.5, () => service.randomNumber(4, 4)),
                4
            );
        });
    });
});


"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const MoveEffectService = require("../scripts/services/move-effect-service");

function createPokemon(overrides = {}) {
    return {
        species: "PIKACHU",
        hp: 100,
        maxHP: 100,
        type: ["ELECTRIC"],
        cursed: false,
        ...overrides
    };
}

function createStatStageService() {
    return {
        increaseCalls: [],
        decreaseCalls: [],

        increase(pokemon, stat, amount) {
            const result = { pokemon, stat, amount, action: "increase" };
            this.increaseCalls.push(result);
            return result;
        },

        decrease(pokemon, stat, amount) {
            const result = { pokemon, stat, amount, action: "decrease" };
            this.decreaseCalls.push(result);
            return result;
        }
    };
}

describe("MoveEffectService", () => {
    describe("Constructor", () => {
        it("should create an instance without dependencies", () => {
            const service = new MoveEffectService();

            assert.ok(service instanceof MoveEffectService);
            assert.equal(service.statStage, null);
            assert.equal(service.statusEffect, null);
        });

        it("should store the supplied stat stage service", () => {
            const statStage = createStatStageService();
            const service = new MoveEffectService(statStage);

            assert.equal(service.statStage, statStage);
        });

        it("should store the supplied status effect service", () => {
            const statusEffect = { inflict() {} };
            const service = new MoveEffectService(null, statusEffect);

            assert.equal(service.statusEffect, statusEffect);
        });

        it("should register the generated effect handlers", () => {
            const service = new MoveEffectService();

            assert.deepEqual(service.effectHandlers, {
                EFFECT_BURN_HIT: "BURN_HIT",
                EFFECT_SPECIAL_DEFENSE_DOWN_HIT:
                    "SPECIAL_DEFENSE_DOWN_HIT",
                EFFECT_WEATHER_BALL: "WEATHER_BALL",
                EFFECT_MAGNITUDE: "MAGNITUDE",
                EFFECT_RETURN: "RETURN",
                EFFECT_HIGH_CRITICAL: "HIGH_CRITICAL"
            });
        });
    });

    describe("applyEffect routing", () => {
        it("should return null when the move is missing", () => {
            const service = new MoveEffectService();

            assert.equal(service.applyEffect(null, createPokemon(), createPokemon()), null);
        });

        it("should route STAT_CHANGE effects", () => {
            const statStage = createStatStageService();
            const service = new MoveEffectService(statStage);
            const user = createPokemon();
            const target = createPokemon();

            const result = service.applyEffect({
                effect: "STAT_CHANGE",
                target: "SELF",
                changes: [{ stat: "attack", amount: 1 }]
            }, user, target);

            assert.equal(result.success, true);
            assert.equal(result.changes.length, 1);
            assert.equal(statStage.increaseCalls[0].pokemon, user);
        });

        it("should route STATUS effects", () => {
            const statusEffect = {
                inflict(pokemon, status) {
                    return { success: true, pokemon, status };
                }
            };
            const service = new MoveEffectService(null, statusEffect);
            const target = createPokemon();

            const result = service.applyEffect({
                effect: "STATUS",
                status: "BURN"
            }, createPokemon(), target);

            assert.equal(result.success, true);
            assert.equal(result.pokemon, target);
            assert.equal(result.status, "BURN");
        });

        it("should route FORCED_SWITCH effects", () => {
            const service = new MoveEffectService();
            const target = createPokemon({ species: "CHARMANDER" });

            const result = service.applyEffect({
                effect: "FORCED_SWITCH"
            }, createPokemon(), target, {});

            assert.deepEqual(result, {
                success: true,
                action: "FORCE_SWITCH",
                pokemon: "CHARMANDER"
            });
        });

        it("should route CURSE effects", () => {
            const service = new MoveEffectService();
            const user = createPokemon({ type: ["GHOST"] });
            const target = createPokemon();

            const result = service.applyEffect({
                effect: "CURSE"
            }, user, target);

            assert.equal(result.success, true);
            assert.equal(result.type, "GHOST_CURSE");
            assert.equal(target.cursed, true);
        });

        it("should route generated effects", () => {
            const service = new MoveEffectService();

            const result = service.applyEffect({
                effect: "EFFECT_RETURN"
            }, createPokemon(), createPokemon());

            assert.deepEqual(result, {
                success: true,
                friendshipBased: true
            });
        });

        it("should reject an unknown effect", () => {
            const service = new MoveEffectService();

            assert.deepEqual(service.applyEffect({
                effect: "NOT_A_REAL_EFFECT"
            }, createPokemon(), createPokemon()), {
                success: false,
                reason: "Unknown effect"
            });
        });

        it("should reject an undefined effect", () => {
            const service = new MoveEffectService();

            assert.deepEqual(service.applyEffect({}, createPokemon(), createPokemon()), {
                success: false,
                reason: "Unknown effect"
            });
        });
    });

    describe("Generated burn effect", () => {
        it("should return a successful burn effect", () => {
            const service = new MoveEffectService();

            assert.deepEqual(service.applyGeneratedEffect(
                "BURN_HIT",
                { secondaryEffectChance: 10 },
                createPokemon(),
                createPokemon()
            ), {
                success: true,
                status: "BURN",
                chance: 10
            });
        });

        it("should preserve a zero secondary effect chance", () => {
            const service = new MoveEffectService();

            const result = service.applyGeneratedEffect(
                "BURN_HIT",
                { secondaryEffectChance: 0 },
                createPokemon(),
                createPokemon()
            );

            assert.equal(result.chance, 0);
        });

        it("should preserve an undefined secondary effect chance", () => {
            const service = new MoveEffectService();

            const result = service.applyGeneratedEffect(
                "BURN_HIT",
                {},
                createPokemon(),
                createPokemon()
            );

            assert.equal(result.chance, undefined);
        });
    });

    describe("Generated special defense effect", () => {
        it("should lower special defense by one stage", () => {
            const service = new MoveEffectService();

            assert.deepEqual(service.applyGeneratedEffect(
                "SPECIAL_DEFENSE_DOWN_HIT",
                { secondaryEffectChance: 20 },
                createPokemon(),
                createPokemon()
            ), {
                success: true,
                stat: "spDefense",
                amount: -1,
                chance: 20
            });
        });

        it("should preserve the supplied secondary effect chance", () => {
            const service = new MoveEffectService();

            const result = service.applyGeneratedEffect(
                "SPECIAL_DEFENSE_DOWN_HIT",
                { secondaryEffectChance: 100 },
                createPokemon(),
                createPokemon()
            );

            assert.equal(result.chance, 100);
        });
    });

    describe("Generated Weather Ball effect", () => {
        it("should indicate that Weather Ball transforms", () => {
            const service = new MoveEffectService();

            assert.deepEqual(service.applyGeneratedEffect(
                "WEATHER_BALL",
                {},
                createPokemon(),
                createPokemon()
            ), {
                success: true,
                transformed: true
            });
        });
    });

    describe("Generated Magnitude effect", () => {
        it("should return the move magnitude", () => {
            const service = new MoveEffectService();

            assert.deepEqual(service.applyGeneratedEffect(
                "MAGNITUDE",
                { magnitude: 7 },
                createPokemon(),
                createPokemon()
            ), {
                success: true,
                magnitude: 7
            });
        });

        it("should preserve a magnitude of zero", () => {
            const service = new MoveEffectService();

            const result = service.applyGeneratedEffect(
                "MAGNITUDE",
                { magnitude: 0 },
                createPokemon(),
                createPokemon()
            );

            assert.equal(result.magnitude, 0);
        });

        it("should preserve an undefined magnitude", () => {
            const service = new MoveEffectService();

            const result = service.applyGeneratedEffect(
                "MAGNITUDE",
                {},
                createPokemon(),
                createPokemon()
            );

            assert.equal(result.magnitude, undefined);
        });
    });

    describe("Generated Return effect", () => {
        it("should indicate that Return depends on friendship", () => {
            const service = new MoveEffectService();

            assert.deepEqual(service.applyGeneratedEffect(
                "RETURN",
                {},
                createPokemon(),
                createPokemon()
            ), {
                success: true,
                friendshipBased: true
            });
        });
    });

    describe("Generated high critical effect", () => {
        it("should return the high critical rate property", () => {
            const service = new MoveEffectService();

            assert.deepEqual(service.applyGeneratedEffect(
                "HIGH_CRITICAL",
                {},
                createPokemon(),
                createPokemon()
            ), {
                success: true,
                criticalRate: "HIGH"
            });
        });

        it("should route EFFECT_HIGH_CRITICAL through applyEffect", () => {
            const service = new MoveEffectService();

            const result = service.applyEffect({
                effect: "EFFECT_HIGH_CRITICAL"
            }, createPokemon(), createPokemon());

            assert.deepEqual(result, {
                success: true,
                criticalRate: "HIGH"
            });
        });
    });

    describe("Unknown generated effects", () => {
        it("should reject an unknown generated effect", () => {
            const service = new MoveEffectService();

            assert.deepEqual(service.applyGeneratedEffect(
                "UNKNOWN_GENERATED_EFFECT",
                {},
                createPokemon(),
                createPokemon()
            ), {
                success: false,
                reason: "Unknown generated effect"
            });
        });
    });

    describe("Stat changes", () => {
        it("should increase a stat when the amount is positive", () => {
            const statStage = createStatStageService();
            const service = new MoveEffectService(statStage);
            const user = createPokemon();
            const target = createPokemon();

            const result = service.applyStatChange({
                target: "SELF",
                changes: [{ stat: "attack", amount: 2 }]
            }, user, target);

            assert.equal(result.success, true);
            assert.equal(statStage.increaseCalls.length, 1);
            assert.equal(statStage.increaseCalls[0].pokemon, user);
            assert.equal(statStage.increaseCalls[0].stat, "attack");
            assert.equal(statStage.increaseCalls[0].amount, 2);
        });

        it("should decrease a stat when the amount is negative", () => {
            const statStage = createStatStageService();
            const service = new MoveEffectService(statStage);
            const user = createPokemon();
            const target = createPokemon();

            const result = service.applyStatChange({
                target: "TARGET",
                changes: [{ stat: "defense", amount: -2 }]
            }, user, target);

            assert.equal(result.success, true);
            assert.equal(statStage.decreaseCalls.length, 1);
            assert.equal(statStage.decreaseCalls[0].pokemon, target);
            assert.equal(statStage.decreaseCalls[0].stat, "defense");
            assert.equal(statStage.decreaseCalls[0].amount, 2);
        });

        it("should apply multiple stat changes", () => {
            const statStage = createStatStageService();
            const service = new MoveEffectService(statStage);
            const user = createPokemon();
            const target = createPokemon();

            const result = service.applyStatChange({
                target: "SELF",
                changes: [
                    { stat: "attack", amount: 1 },
                    { stat: "defense", amount: 2 },
                    { stat: "speed", amount: -1 }
                ]
            }, user, target);

            assert.equal(result.success, true);
            assert.equal(result.changes.length, 3);
            assert.equal(statStage.increaseCalls.length, 2);
            assert.equal(statStage.decreaseCalls.length, 1);
        });

        it("should use the target Pokémon unless target is SELF", () => {
            const statStage = createStatStageService();
            const service = new MoveEffectService(statStage);
            const user = createPokemon();
            const target = createPokemon();

            service.applyStatChange({
                target: "TARGET",
                changes: [{ stat: "attack", amount: 1 }]
            }, user, target);

            assert.equal(statStage.increaseCalls[0].pokemon, target);
        });

        it("should return an empty changes array when no changes are supplied", () => {
            const statStage = createStatStageService();
            const service = new MoveEffectService(statStage);

            const result = service.applyStatChange({
                target: "SELF",
                changes: []
            }, createPokemon(), createPokemon());

            assert.deepEqual(result, {
                success: true,
                changes: []
            });
        });

        it("should preserve results returned by the stat stage service", () => {
            const expected = { success: false, reason: "Stage limit reached" };
            const statStage = {
                increase() {
                    return expected;
                },
                decrease() {
                    return expected;
                }
            };
            const service = new MoveEffectService(statStage);

            const result = service.applyStatChange({
                target: "SELF",
                changes: [{ stat: "attack", amount: 1 }]
            }, createPokemon(), createPokemon());

            assert.equal(result.changes[0], expected);
        });
    });

    describe("Status application", () => {
        it("should return an error when the status service is missing", () => {
            const service = new MoveEffectService();

            assert.deepEqual(service.applyStatus({
                status: "BURN"
            }, createPokemon()), {
                success: false,
                reason: "Status service missing"
            });
        });

        it("should prefer inflict when both status APIs exist", () => {
            const calls = [];
            const statusEffect = {
                inflict(pokemon, status) {
                    calls.push("inflict");
                    return { success: true, pokemon, status };
                },
                applyStatus(pokemon, status) {
                    calls.push("applyStatus");
                    return { success: true, pokemon, status };
                }
            };
            const service = new MoveEffectService(null, statusEffect);
            const target = createPokemon();

            const result = service.applyStatus({ status: "POISON" }, target);

            assert.deepEqual(calls, ["inflict"]);
            assert.equal(result.status, "POISON");
            assert.equal(result.pokemon, target);
        });

        it("should fall back to applyStatus when inflict is unavailable", () => {
            const statusEffect = {
                applyStatus(pokemon, status) {
                    return { success: true, pokemon, status };
                }
            };
            const service = new MoveEffectService(null, statusEffect);
            const target = createPokemon();

            const result = service.applyStatus({ status: "PARALYSIS" }, target);

            assert.equal(result.success, true);
            assert.equal(result.status, "PARALYSIS");
            assert.equal(result.pokemon, target);
        });

        it("should reject a status service without a supported API", () => {
            const service = new MoveEffectService(null, {});
            
            assert.deepEqual(service.applyStatus({
                status: "BURN"
            }, createPokemon()), {
                success: false,
                reason: "Unsupported status API"
            });
        });

        it("should pass the move status to the status service", () => {
            let receivedStatus;
            const statusEffect = {
                inflict(pokemon, status) {
                    receivedStatus = status;
                    return { success: true };
                }
            };
            const service = new MoveEffectService(null, statusEffect);

            service.applyStatus({ status: "FREEZE" }, createPokemon());

            assert.equal(receivedStatus, "FREEZE");
        });
    });

    describe("Forced switching", () => {
        it("should return the target species as the forced-switch Pokémon", () => {
            const service = new MoveEffectService();
            const target = createPokemon({ species: "SNORLAX" });

            assert.deepEqual(service.applyForcedSwitch(target, {}), {
                success: true,
                action: "FORCE_SWITCH",
                pokemon: "SNORLAX"
            });
        });

        it("should not directly switch the target Pokémon", () => {
            const service = new MoveEffectService();
            const target = createPokemon({ species: "PIDGEY" });
            const battle = { activePokemon: target };

            service.applyForcedSwitch(target, battle);

            assert.equal(battle.activePokemon, target);
        });
    });

    describe("Ghost-type Curse", () => {
        it("should halve the user's HP rounded down", () => {
            const service = new MoveEffectService();
            const user = createPokemon({
                type: ["GHOST"],
                hp: 99,
                maxHP: 99
            });
            const target = createPokemon();

            service.applyCurse(user, target);

            assert.equal(user.hp, 49);
        });

        it("should mark the target as cursed", () => {
            const service = new MoveEffectService();
            const user = createPokemon({ type: ["GHOST"] });
            const target = createPokemon();

            service.applyCurse(user, target);

            assert.equal(target.cursed, true);
        });

        it("should return the ghost Curse result", () => {
            const service = new MoveEffectService();

            assert.deepEqual(service.applyCurse(
                createPokemon({ type: ["GHOST"] }),
                createPokemon()
            ), {
                success: true,
                type: "GHOST_CURSE",
                damagePerTurn: true
            });
        });

        it("should support a ghost type among multiple types", () => {
            const service = new MoveEffectService();
            const user = createPokemon({ type: ["POISON", "GHOST"] });
            const target = createPokemon();

            const result = service.applyCurse(user, target);

            assert.equal(result.type, "GHOST_CURSE");
            assert.equal(target.cursed, true);
        });

        it("should return normal Curse for a non-Ghost user", () => {
            const service = new MoveEffectService();
            const user = createPokemon({ type: ["NORMAL"] });
            const target = createPokemon();

            const result = service.applyCurse(user, target);

            assert.deepEqual(result, {
                success: true,
                type: "NORMAL_CURSE",
                changes: [
                    { stat: "attack", amount: 1 },
                    { stat: "defense", amount: 1 },
                    { stat: "speed", amount: -1 }
                ]
            });
        });

        it("should not change HP for normal Curse", () => {
            const service = new MoveEffectService();
            const user = createPokemon({
                type: ["NORMAL"],
                hp: 80,
                maxHP: 100
            });

            service.applyCurse(user, createPokemon());

            assert.equal(user.hp, 80);
        });

        it("should not mark the target as cursed for normal Curse", () => {
            const service = new MoveEffectService();
            const target = createPokemon();

            service.applyCurse(
                createPokemon({ type: ["NORMAL"] }),
                target
            );

            assert.equal(target.cursed, false);
        });

        it("should treat a missing type as normal Curse", () => {
            const service = new MoveEffectService();
            const user = createPokemon({ type: undefined });

            const result = service.applyCurse(user, createPokemon());

            assert.equal(result.type, "NORMAL_CURSE");
        });

            
        it("should recognize GHOST in a string type", () => {
            const service = new MoveEffectService();
            const user = createPokemon({ type: "GHOST" });
        
            const result = service.applyCurse(user, createPokemon());
        
            assert.equal(result.type, "GHOST_CURSE");
        });
    });
});
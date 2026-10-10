
"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const MoveMechanicsService = require("../scripts/services/move-mechanics-service");

function createPokemon(overrides = {}) {
    return {
        species: "PIKACHU",
        friendship: 70,
        ivs: {
            hp: 31,
            attack: 31,
            defense: 31,
            speed: 31,
            spAttack: 31,
            spDefense: 31
        },
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

describe("MoveMechanicsService", () => {
    describe("Constructor and tables", () => {
        it("should create an instance with FireRed as the default game", () => {
            const service = new MoveMechanicsService();

            assert.ok(service instanceof MoveMechanicsService);
            assert.equal(service.game, "firered");
            assert.equal(service.moveDatabase, null);
        });

        it("should store a supplied game and move database", () => {
            const database = { getMove() {} };
            const service = new MoveMechanicsService("emerald", database);

            assert.equal(service.game, "emerald");
            assert.equal(service.moveDatabase, database);
        });

        it("should define all sixteen Hidden Power types", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.hiddenPowerTypes, [
                "FIGHTING",
                "FLYING",
                "POISON",
                "GROUND",
                "ROCK",
                "BUG",
                "GHOST",
                "STEEL",
                "FIRE",
                "WATER",
                "GRASS",
                "ELECTRIC",
                "PSYCHIC",
                "ICE",
                "DRAGON",
                "DARK"
            ]);
        });

        it("should define Weather Ball mappings for all supported weather", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.weatherBallMap, {
                RAIN: { type: "WATER", power: 100 },
                SUN: { type: "FIRE", power: 100 },
                HAIL: { type: "ICE", power: 100 },
                SANDSTORM: { type: "ROCK", power: 100 }
            });
        });

        it("should define the Magnitude power table", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.magnitudeTable, {
                4: { power: 10 },
                5: { power: 30 },
                6: { power: 50 },
                7: { power: 70 },
                8: { power: 90 },
                9: { power: 110 },
                10: { power: 150 }
            });
        });

        it("should expose the Nature Power environment list", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.getNaturePowerEnvironments(), [
                "BUILDING",
                "PLAIN",
                "LINK_BATTLE",
                "TALL_GRASS",
                "LONG_GRASS",
                "ASH",
                "SAND",
                "CAVE",
                "ROCK",
                "POND",
                "SEA",
                "UNDERWATER"
            ]);
        });
    });

    describe("Nature Power", () => {
        it("should resolve BUILDING to Swift", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("BUILDING"), {
                constant: "MOVE_SWIFT"
            });
        });

        it("should resolve PLAIN to Swift", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("PLAIN"), {
                constant: "MOVE_SWIFT"
            });
        });

        it("should resolve LINK_BATTLE to Swift", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("LINK_BATTLE"), {
                constant: "MOVE_SWIFT"
            });
        });

        it("should resolve TALL_GRASS to Stun Spore", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("TALL_GRASS"), {
                constant: "MOVE_STUN_SPORE"
            });
        });

        it("should resolve LONG_GRASS to Razor Leaf", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("LONG_GRASS"), {
                constant: "MOVE_RAZOR_LEAF"
            });
        });

        it("should resolve ASH to Earthquake", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("ASH"), {
                constant: "MOVE_EARTHQUAKE"
            });
        });

        it("should resolve SAND to Earthquake", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("SAND"), {
                constant: "MOVE_EARTHQUAKE"
            });
        });

        it("should resolve CAVE to Shadow Ball", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("CAVE"), {
                constant: "MOVE_SHADOW_BALL"
            });
        });

        it("should resolve ROCK to Rock Slide", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("ROCK"), {
                constant: "MOVE_ROCK_SLIDE"
            });
        });

        it("should resolve POND to BubbleBeam", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("POND"), {
                constant: "MOVE_BUBBLEBEAM"
            });
        });

        it("should resolve SEA to Surf", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("SEA"), {
                constant: "MOVE_SURF"
            });
        });

        it("should resolve UNDERWATER to Hydro Pump", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("UNDERWATER"), {
                constant: "MOVE_HYDRO_PUMP"
            });
        });

        it("should normalize lowercase environment names", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("tall_grass"), {
                constant: "MOVE_STUN_SPORE"
            });
        });

        it("should fall back to PLAIN for an unknown environment", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower("UNKNOWN"), {
                constant: "MOVE_SWIFT"
            });
        });

        it("should convert a missing environment to the string UNDEFINED and fall back", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveNaturePower(undefined), {
                constant: "MOVE_SWIFT"
            });
        });
    });

    describe("Hidden Power type calculation", () => {
        it("should return DARK when IVs are missing", () => {
            const service = new MoveMechanicsService();

            assert.equal(
                service.calculateHiddenPowerType({}),
                "DARK"
            );
        });

        it("should calculate FIGHTING when all IVs are zero", () => {
            const service = new MoveMechanicsService();
            const pokemon = createPokemon({
                ivs: {
                    hp: 0,
                    attack: 0,
                    defense: 0,
                    speed: 0,
                    spAttack: 0,
                    spDefense: 0
                }
            });

            assert.equal(service.calculateHiddenPowerType(pokemon), "FIGHTING");
        });

        it("should calculate DARK when all IVs are odd", () => {
            const service = new MoveMechanicsService();

            assert.equal(
                service.calculateHiddenPowerType(createPokemon()),
                "DARK"
            );
        });


        it("should calculate FLYING when the type formula produces index 1", () => {
            const service = new MoveMechanicsService();
            const pokemon = createPokemon({
                ivs: {
                    hp: 1,
                    attack: 0,
                    defense: 1,
                    speed: 0,
                    spAttack: 0,
                    spDefense: 0
                }
            });

            assert.equal(service.calculateHiddenPowerType(pokemon), "FLYING");
        });

        it("should calculate POISON when the type formula produces index 2", () => {
            const service = new MoveMechanicsService();
            const pokemon = createPokemon({
                ivs: {
                    hp: 1,
                    attack: 0,
                    defense: 0,
                    speed: 1,
                    spAttack: 0,
                    spDefense: 0
                }
            });

            assert.equal(service.calculateHiddenPowerType(pokemon), "POISON");
        });

        it("should calculate GROUND when the type formula produces index 3", () => {
            const service = new MoveMechanicsService();
            const pokemon = createPokemon({
                ivs: {
                    hp: 1,
                    attack: 0,
                    defense: 1,
                    speed: 1,
                    spAttack: 0,
                    spDefense: 0
                }
            });

            assert.equal(service.calculateHiddenPowerType(pokemon), "GROUND");
        });

        it("should calculate ROCK when the type formula produces index 4", () => {
            const service = new MoveMechanicsService();
            const pokemon = createPokemon({
                ivs: {
                    hp: 1,
                    attack: 0,
                    defense: 0,
                    speed: 0,
                    spAttack: 1,
                    spDefense: 0
                }
            });

            assert.equal(service.calculateHiddenPowerType(pokemon), "ROCK");
        });

        it("should calculate BUG when the type formula produces index 5", () => {
            const service = new MoveMechanicsService();
            const pokemon = createPokemon({
                ivs: {
                    hp: 1,
                    attack: 0,
                    defense: 1,
                    speed: 0,
                    spAttack: 1,
                    spDefense: 0
                }
            });

            assert.equal(service.calculateHiddenPowerType(pokemon), "BUG");
        });


        it("should return a type from the supported type list", () => {
            const service = new MoveMechanicsService();

            const type = service.calculateHiddenPowerType(createPokemon());

            assert.ok(service.hiddenPowerTypes.includes(type));
        });
    });

    describe("Hidden Power base power calculation", () => {
        it("should return 30 when IVs are missing", () => {
            const service = new MoveMechanicsService();

            assert.equal(service.calculateHiddenPowerPower({}), 30);
        });

        it("should calculate 30 power when all IVs are zero", () => {
            const service = new MoveMechanicsService();
            const pokemon = createPokemon({
                ivs: {
                    hp: 0,
                    attack: 0,
                    defense: 0,
                    speed: 0,
                    spAttack: 0,
                    spDefense: 0
                }
            });

            assert.equal(service.calculateHiddenPowerPower(pokemon), 30);
        });

        it("should calculate 70 power when all IVs are 31", () => {
            const service = new MoveMechanicsService();

            assert.equal(
                service.calculateHiddenPowerPower(createPokemon()),
                70
            );
        });

        it("should calculate power between 30 and 70 for valid IVs", () => {
            const service = new MoveMechanicsService();

            for (let iv = 0; iv <= 31; iv++) {
                const pokemon = createPokemon({
                    ivs: {
                        hp: iv,
                        attack: iv,
                        defense: iv,
                        speed: iv,
                        spAttack: iv,
                        spDefense: iv
                    }
                });

                const power = service.calculateHiddenPowerPower(pokemon);

                assert.ok(power >= 30);
                assert.ok(power <= 70);
            }
        });
    });

    describe("Hidden Power resolution", () => {
        it("should return the Hidden Power constant, type, and power", () => {
            const service = new MoveMechanicsService();

            const result = service.resolveHiddenPower(createPokemon());

            assert.deepEqual(result, {
                constant: "MOVE_HIDDEN_POWER",
                type: "DARK",
                power: 70
            });
        });

        it("should use fallback type and power when IVs are missing", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveHiddenPower({}), {
                constant: "MOVE_HIDDEN_POWER",
                type: "DARK",
                power: 30
            });
        });
    });

    describe("Weather Ball", () => {
        it("should resolve rain to Water with 100 power", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveWeatherBall("RAIN"), {
                constant: "MOVE_WEATHER_BALL",
                type: "WATER",
                power: 100
            });
        });

        it("should resolve sun to Fire with 100 power", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveWeatherBall("SUN"), {
                constant: "MOVE_WEATHER_BALL",
                type: "FIRE",
                power: 100
            });
        });

        it("should resolve hail to Ice with 100 power", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveWeatherBall("HAIL"), {
                constant: "MOVE_WEATHER_BALL",
                type: "ICE",
                power: 100
            });
        });

        it("should resolve sandstorm to Rock with 100 power", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveWeatherBall("SANDSTORM"), {
                constant: "MOVE_WEATHER_BALL",
                type: "ROCK",
                power: 100
            });
        });

        it("should normalize lowercase weather names", () => {
            const service = new MoveMechanicsService();

            assert.equal(service.resolveWeatherBall("rain").type, "WATER");
        });

        it("should use Normal type and 50 power without weather", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveWeatherBall(null), {
                constant: "MOVE_WEATHER_BALL",
                type: "NORMAL",
                power: 50
            });
        });

        it("should use Normal type and 50 power for unknown weather", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveWeatherBall("FOG"), {
                constant: "MOVE_WEATHER_BALL",
                type: "NORMAL",
                power: 50
            });
        });
    });

    describe("Magnitude", () => {
        const cases = [
            { roll: 0, magnitude: 4, power: 10 },
            { roll: 0.049999, magnitude: 4, power: 10 },
            { roll: 0.05, magnitude: 5, power: 30 },
            { roll: 0.149999, magnitude: 5, power: 30 },
            { roll: 0.15, magnitude: 6, power: 50 },
            { roll: 0.349999, magnitude: 6, power: 50 },
            { roll: 0.35, magnitude: 7, power: 70 },
            { roll: 0.649999, magnitude: 7, power: 70 },
            { roll: 0.65, magnitude: 8, power: 90 },
            { roll: 0.849999, magnitude: 8, power: 90 },
            { roll: 0.85, magnitude: 9, power: 110 },
            { roll: 0.949999, magnitude: 9, power: 110 },
            { roll: 0.95, magnitude: 10, power: 150 },
            { roll: 0.999999, magnitude: 10, power: 150 }
        ];

        for (const testCase of cases) {
            it(`should resolve roll ${testCase.roll} to Magnitude ${testCase.magnitude}`, () => {
                const service = new MoveMechanicsService();

                const result = withMockedRandom(testCase.roll, () => {
                    return service.resolveMagnitude();
                });

                assert.deepEqual(result, {
                    constant: "MOVE_MAGNITUDE",
                    magnitude: testCase.magnitude,
                    power: testCase.power
                });
            });
        }
    });

    describe("Return", () => {
        it("should default friendship to 70", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveReturn({}), {
                constant: "MOVE_RETURN",
                power: 28
            });
        });

        it("should return zero power at zero friendship", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveReturn({ friendship: 0 }), {
                constant: "MOVE_RETURN",
                power: 0
            });
        });

        it("should calculate power from friendship", () => {
            const service = new MoveMechanicsService();

            assert.equal(service.resolveReturn({ friendship: 100 }).power, 40);
        });

        it("should cap Return power at 102", () => {
            const service = new MoveMechanicsService();

            assert.equal(service.resolveReturn({ friendship: 255 }).power, 102);
        });
    });

    describe("Frustration", () => {
        it("should default friendship to 70", () => {
            const service = new MoveMechanicsService();

            assert.deepEqual(service.resolveFrustration({}), {
                constant: "MOVE_FRUSTRATION",
                power: 74
            });
        });

        it("should reach 102 power at zero friendship", () => {
            const service = new MoveMechanicsService();

            assert.equal(
                service.resolveFrustration({ friendship: 0 }).power,
                102
            );
        });

        it("should return zero power at maximum friendship", () => {
            const service = new MoveMechanicsService();

            assert.equal(
                service.resolveFrustration({ friendship: 255 }).power,
                0
            );
        });

        it("should calculate power from friendship", () => {
            const service = new MoveMechanicsService();

            assert.equal(
                service.resolveFrustration({ friendship: 100 }).power,
                62
            );
        });

        it("should cap Frustration power at 102", () => {
            const service = new MoveMechanicsService();

            assert.equal(
                service.resolveFrustration({ friendship: -100 }).power,
                102
            );
        });
    });

    describe("Move database resolution", () => {
        it("should return the original move when the move is missing", () => {
            const database = { getMove() { throw new Error("Should not run"); } };
            const service = new MoveMechanicsService("firered", database);

            assert.equal(service.resolveMoveData(null), null);
        });

        it("should return the original move when no database is configured", () => {
            const service = new MoveMechanicsService();
            const move = { constant: "MOVE_TACKLE", power: 40 };

            assert.equal(service.resolveMoveData(move), move);
        });

        it("should return the original move when database lookup fails", () => {
            const service = new MoveMechanicsService("firered", {
                getMove() {
                    return null;
                }
            });

            const move = { constant: "MOVE_UNKNOWN", power: 20 };

            assert.equal(service.resolveMoveData(move), move);
        });

        it("should merge database data with the supplied move", () => {
            const service = new MoveMechanicsService("firered", {
                getMove(constant) {
                    assert.equal(constant, "MOVE_TACKLE");

                    return {
                        name: "Tackle",
                        power: 35,
                        accuracy: 95,
                        type: "NORMAL"
                    };
                }
            });

            const result = service.resolveMoveData({
                constant: "MOVE_TACKLE",
                power: 40
            });

            assert.deepEqual(result, {
                name: "Tackle",
                power: 40,
                accuracy: 95,
                type: "NORMAL",
                constant: "MOVE_TACKLE"
            });
        });

        it("should let supplied move properties override database properties", () => {
            const service = new MoveMechanicsService("firered", {
                getMove() {
                    return { power: 35, accuracy: 95 };
                }
            });

            const result = service.resolveMoveData({
                constant: "MOVE_TACKLE",
                power: 50,
                accuracy: 100
            });

            assert.equal(result.power, 50);
            assert.equal(result.accuracy, 100);
        });
    });

    describe("resolveMove dispatcher", () => {
        it("should return null when the move is missing", () => {
            const service = new MoveMechanicsService();

            assert.equal(service.resolveMove(null), null);
        });

        it("should resolve Nature Power using the environment", () => {
            const service = new MoveMechanicsService();

            const result = service.resolveMove(
                { constant: "MOVE_NATURE_POWER" },
                { environment: "CAVE" }
            );

            assert.deepEqual(result, { constant: "MOVE_SHADOW_BALL" });
        });

        it("should resolve Hidden Power using the supplied Pokémon", () => {
            const service = new MoveMechanicsService();

            const result = service.resolveMove(
                { constant: "MOVE_HIDDEN_POWER" },
                { pokemon: createPokemon() }
            );

            assert.equal(result.constant, "MOVE_HIDDEN_POWER");
            assert.equal(result.type, "DARK");
            assert.equal(result.power, 70);
        });

        it("should resolve Weather Ball using the supplied weather", () => {
            const service = new MoveMechanicsService();

            const result = service.resolveMove(
                { constant: "MOVE_WEATHER_BALL" },
                { weather: "SUN" }
            );

            assert.deepEqual(result, {
                constant: "MOVE_WEATHER_BALL",
                type: "FIRE",
                power: 100
            });
        });

        it("should resolve Magnitude", () => {
            const service = new MoveMechanicsService();

            const result = withMockedRandom(0.95, () => {
                return service.resolveMove({
                    constant: "MOVE_MAGNITUDE"
                });
            });

            assert.deepEqual(result, {
                constant: "MOVE_MAGNITUDE",
                magnitude: 10,
                power: 150
            });
        });

        it("should resolve Return using the supplied Pokémon", () => {
            const service = new MoveMechanicsService();

            const result = service.resolveMove(
                { constant: "MOVE_RETURN" },
                { pokemon: { friendship: 200 } }
            );

            assert.equal(result.constant, "MOVE_RETURN");
            assert.equal(result.power, 80);
        });

        it("should resolve Frustration using the supplied Pokémon", () => {
            const service = new MoveMechanicsService();

            const result = service.resolveMove(
                { constant: "MOVE_FRUSTRATION" },
                { pokemon: { friendship: 200 } }
            );

            assert.equal(result.constant, "MOVE_FRUSTRATION");
            assert.equal(result.power, 22);
        });

        it("should leave ordinary moves unchanged when no database exists", () => {
            const service = new MoveMechanicsService();
            const move = { constant: "MOVE_TACKLE", power: 40 };

            assert.equal(service.resolveMove(move), move);
        });

        it("should resolve transformed move data through the database", () => {
            const service = new MoveMechanicsService("firered", {
                getMove(constant) {
                    if (constant === "MOVE_SWIFT") {
                        return {
                            name: "Swift",
                            power: 60,
                            accuracy: 100
                        };
                    }

                    return null;
                }
            });

            const result = service.resolveMove(
                { constant: "MOVE_NATURE_POWER" },
                { environment: "PLAIN" }
            );

            assert.deepEqual(result, {
                name: "Swift",
                power: 60,
                accuracy: 100,
                constant: "MOVE_SWIFT"
            });
        });

        it("should preserve original properties when resolving an ordinary move from the database", () => {
            const service = new MoveMechanicsService("firered", {
                getMove() {
                    return {
                        name: "Tackle",
                        power: 35,
                        accuracy: 95
                    };
                }
            });

            const result = service.resolveMove({
                constant: "MOVE_TACKLE",
                power: 40
            });

            assert.equal(result.name, "Tackle");
            assert.equal(result.power, 40);
            assert.equal(result.accuracy, 95);
        });
    });
});

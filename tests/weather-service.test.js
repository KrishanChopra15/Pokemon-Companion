"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const WeatherService =
    require("../scripts/services/weather-service");


function createService() {
    return new WeatherService();
}

function makePokemon({
    species = "CHARMANDER",
    hp = 160,
    maxHP = 160,
    type = ["NORMAL"],
    ability = null
} = {}) {
    return { species, hp, maxHP, type, ability };
}

function makeSide(party, active = 0) {
    return { party, active };
}

function makeBattle({
    playerPokemon = makePokemon({ species: "CHARMANDER" }),
    opponentPokemon = makePokemon({
        species: "SQUIRTLE",
        type: ["WATER"]
    }),
    weather = null
} = {}) {
    return {
        player: makeSide([playerPokemon], 0),
        opponent: makeSide([opponentPokemon], 0),
        weather
    };
}


// -----------------------------------------------
// Constructor and weather definitions
// -----------------------------------------------

test("constructor creates a WeatherService instance", () => {
    assert.ok(createService() instanceof WeatherService);
});

test("constructor defines all four supported weather types", () => {
    const service = createService();

    assert.deepEqual(
        Object.keys(service.weatherTypes),
        ["RAIN", "SUN", "SANDSTORM", "HAIL"]
    );
});

test("constructor creates an independent weather definition object", () => {
    const first = createService();
    const second = createService();

    assert.notEqual(first.weatherTypes, second.weatherTypes);
});

test("rain defines a Water move multiplier of 1.5", () => {
    const service = createService();

    assert.equal(service.weatherTypes.RAIN.waterMultiplier, 1.5);
});

test("rain defines a Fire move multiplier of 0.5", () => {
    const service = createService();

    assert.equal(service.weatherTypes.RAIN.fireMultiplier, 0.5);
});

test("sun defines a Fire move multiplier of 1.5", () => {
    const service = createService();

    assert.equal(service.weatherTypes.SUN.fireMultiplier, 1.5);
});

test("sun defines a Water move multiplier of 0.5", () => {
    const service = createService();

    assert.equal(service.weatherTypes.SUN.waterMultiplier, 0.5);
});

test("sandstorm defines damage as one sixteenth", () => {
    const service = createService();

    assert.equal(service.weatherTypes.SANDSTORM.damageFraction, 1 / 16);
});

test("hail defines damage as one sixteenth", () => {
    const service = createService();

    assert.equal(service.weatherTypes.HAIL.damageFraction, 1 / 16);
});


// -----------------------------------------------
// setWeather
// -----------------------------------------------

for (const weather of ["RAIN", "SUN", "SANDSTORM", "HAIL"]) {
    test(`setWeather successfully sets ${weather}`, () => {
        const service = createService();
        const battle = { weather: null };

        const result = service.setWeather(battle, weather);

        assert.deepEqual(result, {
            success: true,
            weather
        });

        assert.deepEqual(battle.weather, {
            type: weather,
            turns: 5,
            source: "MOVE"
        });
    });
}

test("setWeather uses the default source MOVE", () => {
    const service = createService();
    const battle = {};

    service.setWeather(battle, "RAIN");

    assert.equal(battle.weather.source, "MOVE");
});

test("setWeather uses the default duration of five turns", () => {
    const service = createService();
    const battle = {};

    service.setWeather(battle, "SUN");

    assert.equal(battle.weather.turns, 5);
});

test("setWeather accepts a custom source", () => {
    const service = createService();
    const battle = {};

    service.setWeather(battle, "RAIN", "ABILITY");

    assert.equal(battle.weather.source, "ABILITY");
});

test("setWeather accepts a custom duration", () => {
    const service = createService();
    const battle = {};

    service.setWeather(battle, "SUN", "MOVE", 3);

    assert.equal(battle.weather.turns, 3);
});

test("setWeather accepts zero turns", () => {
    const service = createService();
    const battle = {};

    const result = service.setWeather(battle, "RAIN", "MOVE", 0);

    assert.equal(result.success, true);
    assert.equal(battle.weather.turns, 0);
});

test("setWeather replaces previously active weather", () => {
    const service = createService();
    const battle = {};

    service.setWeather(battle, "RAIN");
    service.setWeather(battle, "SUN", "ABILITY", 2);

    assert.deepEqual(battle.weather, {
        type: "SUN",
        turns: 2,
        source: "ABILITY"
    });
});

test("setWeather rejects an unknown weather type", () => {
    const service = createService();
    const battle = {};

    assert.deepEqual(
        service.setWeather(battle, "FOG"),
        {
            success: false,
            reason: "Unknown weather"
        }
    );
});

test("setWeather does not change active weather when the requested type is invalid", () => {
    const service = createService();
    const existingWeather = {
        type: "RAIN",
        turns: 3,
        source: "MOVE"
    };
    const battle = { weather: existingWeather };

    service.setWeather(battle, "FOG");

    assert.equal(battle.weather, existingWeather);
});

test("setWeather rejects lowercase weather names", () => {
    const service = createService();
    const battle = {};

    assert.deepEqual(
        service.setWeather(battle, "rain"),
        {
            success: false,
            reason: "Unknown weather"
        }
    );
});


// -----------------------------------------------
// clearWeather and getWeather
// -----------------------------------------------

test("clearWeather removes active weather", () => {
    const service = createService();
    const battle = {
        weather: { type: "RAIN", turns: 3, source: "MOVE" }
    };

    assert.deepEqual(
        service.clearWeather(battle),
        { success: true }
    );

    assert.equal(battle.weather, null);
});

test("clearWeather works when no weather is active", () => {
    const service = createService();
    const battle = { weather: null };

    assert.deepEqual(
        service.clearWeather(battle),
        { success: true }
    );

    assert.equal(battle.weather, null);
});

test("getWeather returns active weather", () => {
    const service = createService();
    const weather = {
        type: "RAIN",
        turns: 4,
        source: "MOVE"
    };
    const battle = { weather };

    assert.equal(service.getWeather(battle), weather);
});

test("getWeather returns null when weather is absent", () => {
    const service = createService();

    assert.equal(service.getWeather({}), null);
});

test("getWeather returns null when weather is explicitly null", () => {
    const service = createService();

    assert.equal(
        service.getWeather({ weather: null }),
        null
    );
});

test("getWeather returns null when weather is undefined", () => {
    const service = createService();

    assert.equal(
        service.getWeather({ weather: undefined }),
        null
    );
});


// -----------------------------------------------
// isWeatherSuppressed
// -----------------------------------------------

test("isWeatherSuppressed returns false when neither active Pokémon suppresses weather", () => {
    const service = createService();
    const battle = makeBattle();

    assert.equal(service.isWeatherSuppressed(battle), false);
});

test("isWeatherSuppressed detects Air Lock on the player's active Pokémon", () => {
    const service = createService();
    const battle = makeBattle({
        playerPokemon: makePokemon({ ability: "AIR_LOCK" })
    });

    assert.equal(service.isWeatherSuppressed(battle), true);
});

test("isWeatherSuppressed detects Cloud Nine on the player's active Pokémon", () => {
    const service = createService();
    const battle = makeBattle({
        playerPokemon: makePokemon({ ability: "CLOUD_NINE" })
    });

    assert.equal(service.isWeatherSuppressed(battle), true);
});

test("isWeatherSuppressed detects Air Lock on the opponent's active Pokémon", () => {
    const service = createService();
    const battle = makeBattle({
        opponentPokemon: makePokemon({ ability: "AIR_LOCK" })
    });

    assert.equal(service.isWeatherSuppressed(battle), true);
});

test("isWeatherSuppressed detects Cloud Nine on the opponent's active Pokémon", () => {
    const service = createService();
    const battle = makeBattle({
        opponentPokemon: makePokemon({ ability: "CLOUD_NINE" })
    });

    assert.equal(service.isWeatherSuppressed(battle), true);
});

test("isWeatherSuppressed ignores a different ability", () => {
    const service = createService();
    const battle = makeBattle({
        playerPokemon: makePokemon({ ability: "BLAZE" })
    });

    assert.equal(service.isWeatherSuppressed(battle), false);
});

test("isWeatherSuppressed checks the active Pokémon rather than the bench", () => {
    const service = createService();
    const player = makeSide([
        makePokemon({ species: "CHARMANDER", ability: "BLAZE" }),
        makePokemon({ species: "RAYQUAZA", ability: "AIR_LOCK" })
    ], 0);

    const battle = {
        player,
        opponent: makeSide([makePokemon()], 0)
    };

    assert.equal(service.isWeatherSuppressed(battle), false);
});

test("isWeatherSuppressed detects an ability even if the active Pokémon has fainted", () => {
    const service = createService();
    const battle = makeBattle({
        playerPokemon: makePokemon({
            hp: 0,
            ability: "CLOUD_NINE"
        })
    });

    assert.equal(service.isWeatherSuppressed(battle), true);
});

test("isWeatherSuppressed handles missing player and opponent sides", () => {
    const service = createService();

    assert.equal(
        service.isWeatherSuppressed({}),
        false
    );
});


// -----------------------------------------------
// getEffectiveWeather
// -----------------------------------------------

test("getEffectiveWeather returns null when no weather exists", () => {
    const service = createService();
    const battle = { weather: null };

    assert.equal(service.getEffectiveWeather(battle), null);
});

test("getEffectiveWeather returns active weather when not suppressed", () => {
    const service = createService();
    const weather = {
        type: "RAIN",
        turns: 3,
        source: "MOVE"
    };
    const battle = makeBattle({ weather });

    assert.equal(service.getEffectiveWeather(battle), weather);
});

test("getEffectiveWeather returns null when Air Lock suppresses weather", () => {
    const service = createService();
    const battle = makeBattle({
        weather: { type: "SUN", turns: 3, source: "MOVE" },
        playerPokemon: makePokemon({ ability: "AIR_LOCK" })
    });

    assert.equal(service.getEffectiveWeather(battle), null);
});

test("getEffectiveWeather returns null when Cloud Nine suppresses weather", () => {
    const service = createService();
    const battle = makeBattle({
        weather: { type: "RAIN", turns: 3, source: "MOVE" },
        opponentPokemon: makePokemon({ ability: "CLOUD_NINE" })
    });

    assert.equal(service.getEffectiveWeather(battle), null);
});

test("getEffectiveWeather does not remove the underlying weather when suppressed", () => {
    const service = createService();
    const weather = {
        type: "RAIN",
        turns: 4,
        source: "MOVE"
    };
    const battle = makeBattle({
        weather,
        playerPokemon: makePokemon({ ability: "AIR_LOCK" })
    });

    service.getEffectiveWeather(battle);

    assert.equal(battle.weather, weather);
    assert.equal(battle.weather.turns, 4);
});


// -----------------------------------------------
// isSandstormImmune
// -----------------------------------------------

test("isSandstormImmune detects Rock type", () => {
    const service = createService();

    assert.ok(service.isSandstormImmune(
        makePokemon({ type: ["ROCK"] })
    ));
});

test("isSandstormImmune detects Ground type", () => {
    const service = createService();

    assert.ok(service.isSandstormImmune(
        makePokemon({ type: ["GROUND"] })
    ));
});

test("isSandstormImmune detects Steel type", () => {
    const service = createService();

    assert.ok(service.isSandstormImmune(
        makePokemon({ type: ["STEEL"] })
    ));
});

test("isSandstormImmune detects an immune type in a dual-type Pokémon", () => {
    const service = createService();

    assert.ok(service.isSandstormImmune(
        makePokemon({ type: ["WATER", "ROCK"] })
    ));
});

test("isSandstormImmune returns a falsy result for a non-immune type", () => {
    const service = createService();

    assert.ok(!service.isSandstormImmune(
        makePokemon({ type: ["FIRE"] })
    ));
});

test("isSandstormImmune returns a falsy result when type is missing", () => {
    const service = createService();

    assert.ok(!service.isSandstormImmune(
        makePokemon({ type: undefined })
    ));
});


// -----------------------------------------------
// applyWeatherDamage
// -----------------------------------------------

test("applyWeatherDamage returns zero for a missing Pokémon", () => {
    const service = createService();

    assert.equal(service.applyWeatherDamage(null, "SANDSTORM"), 0);
});

test("applyWeatherDamage returns zero for an undefined Pokémon", () => {
    const service = createService();

    assert.equal(service.applyWeatherDamage(undefined, "HAIL"), 0);
});

test("applyWeatherDamage applies one-sixteenth maximum HP during sandstorm", () => {
    const service = createService();
    const target = makePokemon({ hp: 160, maxHP: 160 });

    const damage = service.applyWeatherDamage(target, "SANDSTORM");

    assert.equal(damage, 10);
    assert.equal(target.hp, 150);
});

test("applyWeatherDamage applies one-sixteenth maximum HP during hail", () => {
    const service = createService();
    const target = makePokemon({ hp: 160, maxHP: 160 });

    const damage = service.applyWeatherDamage(target, "HAIL");

    assert.equal(damage, 10);
    assert.equal(target.hp, 150);
});

test("applyWeatherDamage rounds fractional damage down", () => {
    const service = createService();
    const target = makePokemon({ hp: 100, maxHP: 100 });

    const damage = service.applyWeatherDamage(target, "HAIL");

    assert.equal(damage, 6);
    assert.equal(target.hp, 94);
});

test("applyWeatherDamage deals at least one damage", () => {
    const service = createService();
    const target = makePokemon({ hp: 10, maxHP: 15 });

    const damage = service.applyWeatherDamage(target, "HAIL");

    assert.equal(damage, 1);
    assert.equal(target.hp, 9);
});

test("applyWeatherDamage does not damage Rock types in sandstorm", () => {
    const service = createService();
    const target = makePokemon({
        hp: 100,
        maxHP: 160,
        type: ["ROCK"]
    });

    assert.equal(
        service.applyWeatherDamage(target, "SANDSTORM"),
        0
    );
    assert.equal(target.hp, 100);
});

test("applyWeatherDamage does not damage Ground types in sandstorm", () => {
    const service = createService();
    const target = makePokemon({
        hp: 100,
        maxHP: 160,
        type: ["GROUND"]
    });

    assert.equal(
        service.applyWeatherDamage(target, "SANDSTORM"),
        0
    );
    assert.equal(target.hp, 100);
});

test("applyWeatherDamage does not damage Steel types in sandstorm", () => {
    const service = createService();
    const target = makePokemon({
        hp: 100,
        maxHP: 160,
        type: ["STEEL"]
    });

    assert.equal(
        service.applyWeatherDamage(target, "SANDSTORM"),
        0
    );
    assert.equal(target.hp, 100);
});

test("applyWeatherDamage applies sandstorm damage to a non-immune dual type", () => {
    const service = createService();
    const target = makePokemon({
        hp: 100,
        maxHP: 160,
        type: ["WATER", "ICE"]
    });

    assert.equal(
        service.applyWeatherDamage(target, "SANDSTORM"),
        10
    );
    assert.equal(target.hp, 90);
});

test("applyWeatherDamage does not damage Ice types during hail", () => {
    const service = createService();
    const target = makePokemon({
        hp: 100,
        maxHP: 160,
        type: ["ICE"]
    });

    assert.equal(
        service.applyWeatherDamage(target, "HAIL"),
        0
    );
    assert.equal(target.hp, 100);
});

test("applyWeatherDamage protects a dual-type Pokémon that includes Ice during hail", () => {
    const service = createService();
    const target = makePokemon({
        hp: 100,
        maxHP: 160,
        type: ["WATER", "ICE"]
    });

    assert.equal(
        service.applyWeatherDamage(target, "HAIL"),
        0
    );
    assert.equal(target.hp, 100);
});

test("applyWeatherDamage reduces HP to zero when damage exceeds remaining HP", () => {
    const service = createService();
    const target = makePokemon({ hp: 3, maxHP: 160 });

    const damage = service.applyWeatherDamage(target, "SANDSTORM");

    assert.equal(damage, 10);
    assert.equal(target.hp, 0);
});

test("applyWeatherDamage does not let HP fall below zero", () => {
    const service = createService();
    const target = makePokemon({ hp: 1, maxHP: 160 });

    service.applyWeatherDamage(target, "HAIL");

    assert.equal(target.hp, 0);
});

test("applyWeatherDamage returns the calculated damage amount", () => {
    const service = createService();
    const target = makePokemon({ hp: 500, maxHP: 320 });

    assert.equal(
        service.applyWeatherDamage(target, "SANDSTORM"),
        20
    );
});


// -----------------------------------------------
// processTurn
// -----------------------------------------------

test("processTurn returns an empty damage list when there is no weather", () => {
    const service = createService();
    const battle = makeBattle();

    assert.deepEqual(
        service.processTurn(battle),
        {
            success: true,
            damage: []
        }
    );
});

test("processTurn does not alter weather duration when there is no weather", () => {
    const service = createService();
    const battle = makeBattle();

    service.processTurn(battle);

    assert.equal(battle.weather, null);
});

test("processTurn reduces rain duration by one", () => {
    const service = createService();
    const battle = makeBattle({
        weather: { type: "RAIN", turns: 3, source: "MOVE" }
    });

    service.processTurn(battle);

    assert.equal(battle.weather.turns, 2);
});

test("processTurn reduces sun duration by one", () => {
    const service = createService();
    const battle = makeBattle({
        weather: { type: "SUN", turns: 3, source: "MOVE" }
    });

    service.processTurn(battle);

    assert.equal(battle.weather.turns, 2);
});

test("processTurn produces no residual damage during rain", () => {
    const service = createService();
    const playerPokemon = makePokemon();
    const opponentPokemon = makePokemon({ species: "SQUIRTLE" });
    const battle = makeBattle({
        playerPokemon,
        opponentPokemon,
        weather: { type: "RAIN", turns: 3, source: "MOVE" }
    });

    assert.deepEqual(
        service.processTurn(battle),
        {
            success: true,
            damage: []
        }
    );

    assert.equal(playerPokemon.hp, 160);
    assert.equal(opponentPokemon.hp, 160);
});

test("processTurn produces no residual damage during sun", () => {
    const service = createService();
    const playerPokemon = makePokemon();
    const opponentPokemon = makePokemon({ species: "SQUIRTLE" });
    const battle = makeBattle({
        playerPokemon,
        opponentPokemon,
        weather: { type: "SUN", turns: 3, source: "MOVE" }
    });

    const result = service.processTurn(battle);

    assert.deepEqual(result, {
        success: true,
        damage: []
    });

    assert.equal(playerPokemon.hp, 160);
    assert.equal(opponentPokemon.hp, 160);
});

test("processTurn damages both active Pokémon during sandstorm", () => {
    const service = createService();
    const playerPokemon = makePokemon({
        species: "CHARMANDER",
        hp: 160,
        maxHP: 160,
        type: ["FIRE"]
    });
    const opponentPokemon = makePokemon({
        species: "SQUIRTLE",
        hp: 160,
        maxHP: 160,
        type: ["WATER"]
    });
    const battle = makeBattle({
        playerPokemon,
        opponentPokemon,
        weather: { type: "SANDSTORM", turns: 3, source: "MOVE" }
    });

    assert.deepEqual(
        service.processTurn(battle),
        {
            success: true,
            damage: [
                { pokemon: "CHARMANDER", damage: 10 },
                { pokemon: "SQUIRTLE", damage: 10 }
            ]
        }
    );

    assert.equal(playerPokemon.hp, 150);
    assert.equal(opponentPokemon.hp, 150);
    assert.equal(battle.weather.turns, 2);
});

test("processTurn respects sandstorm immunities", () => {
    const service = createService();
    const playerPokemon = makePokemon({
        species: "GEODUDE",
        type: ["ROCK", "GROUND"]
    });
    const opponentPokemon = makePokemon({
        species: "SQUIRTLE",
        type: ["WATER"]
    });
    const battle = makeBattle({
        playerPokemon,
        opponentPokemon,
        weather: { type: "SANDSTORM", turns: 2, source: "MOVE" }
    });

    const result = service.processTurn(battle);

    assert.deepEqual(result.damage, [
        { pokemon: "GEODUDE", damage: 0 },
        { pokemon: "SQUIRTLE", damage: 10 }
    ]);

    assert.equal(playerPokemon.hp, 160);
    assert.equal(opponentPokemon.hp, 150);
});

test("processTurn damages non-Ice Pokémon during hail", () => {
    const service = createService();
    const playerPokemon = makePokemon({
        species: "CHARMANDER",
        type: ["FIRE"]
    });
    const opponentPokemon = makePokemon({
        species: "SQUIRTLE",
        type: ["WATER"]
    });
    const battle = makeBattle({
        playerPokemon,
        opponentPokemon,
        weather: { type: "HAIL", turns: 3, source: "MOVE" }
    });

    const result = service.processTurn(battle);

    assert.deepEqual(result.damage, [
        { pokemon: "CHARMANDER", damage: 10 },
        { pokemon: "SQUIRTLE", damage: 10 }
    ]);
});

test("processTurn respects hail immunity for Ice Pokémon", () => {
    const service = createService();
    const playerPokemon = makePokemon({
        species: "LAPRAS",
        type: ["WATER", "ICE"]
    });
    const opponentPokemon = makePokemon({
        species: "CHARMANDER",
        type: ["FIRE"]
    });
    const battle = makeBattle({
        playerPokemon,
        opponentPokemon,
        weather: { type: "HAIL", turns: 3, source: "MOVE" }
    });

    const result = service.processTurn(battle);

    assert.deepEqual(result.damage, [
        { pokemon: "LAPRAS", damage: 0 },
        { pokemon: "CHARMANDER", damage: 10 }
    ]);

    assert.equal(playerPokemon.hp, 160);
    assert.equal(opponentPokemon.hp, 150);
});

test("processTurn uses each side's active party index", () => {
    const service = createService();
    const benchPokemon = makePokemon({ species: "BULBASAUR" });
    const activePlayer = makePokemon({ species: "CHARMANDER" });
    const opponentPokemon = makePokemon({ species: "SQUIRTLE" });

    const battle = {
        player: makeSide([benchPokemon, activePlayer], 1),
        opponent: makeSide([opponentPokemon], 0),
        weather: { type: "SANDSTORM", turns: 2, source: "MOVE" }
    };

    const result = service.processTurn(battle);

    assert.equal(result.damage[0].pokemon, "CHARMANDER");
    assert.equal(activePlayer.hp, 150);
    assert.equal(benchPokemon.hp, 160);
});

test("processTurn clears weather when its duration reaches zero", () => {
    const service = createService();
    const battle = makeBattle({
        weather: { type: "RAIN", turns: 1, source: "MOVE" }
    });

    service.processTurn(battle);

    assert.equal(battle.weather, null);
});

test("processTurn clears weather when its duration becomes negative", () => {
    const service = createService();
    const battle = makeBattle({
        weather: { type: "SUN", turns: 0, source: "MOVE" }
    });

    service.processTurn(battle);

    assert.equal(battle.weather, null);
});

test("processTurn preserves active weather while turns remain", () => {
    const service = createService();
    const battle = makeBattle({
        weather: { type: "RAIN", turns: 2, source: "MOVE" }
    });

    service.processTurn(battle);

    assert.equal(battle.weather.type, "RAIN");
    assert.equal(battle.weather.turns, 1);
});

test("processTurn does not decrement suppressed weather", () => {
    const service = createService();
    const battle = makeBattle({
        weather: { type: "SANDSTORM", turns: 3, source: "MOVE" },
        playerPokemon: makePokemon({ ability: "AIR_LOCK" })
    });

    assert.deepEqual(
        service.processTurn(battle),
        { success: true, damage: [] }
    );

    assert.equal(battle.weather.turns, 3);
});

test("processTurn does not apply residual damage while weather is suppressed", () => {
    const service = createService();
    const playerPokemon = makePokemon({ ability: "CLOUD_NINE" });
    const opponentPokemon = makePokemon();
    const battle = makeBattle({
        playerPokemon,
        opponentPokemon,
        weather: { type: "HAIL", turns: 3, source: "MOVE" }
    });

    service.processTurn(battle);

    assert.equal(playerPokemon.hp, 160);
    assert.equal(opponentPokemon.hp, 160);
});


// -----------------------------------------------
// getMoveMultiplier
// -----------------------------------------------

test("getMoveMultiplier returns one when weather is absent", () => {
    const service = createService();

    assert.equal(service.getMoveMultiplier(null, "FIRE"), 1);
});

test("getMoveMultiplier boosts Water moves in rain", () => {
    const service = createService();

    assert.equal(
        service.getMoveMultiplier({ type: "RAIN" }, "WATER"),
        1.5
    );
});

test("getMoveMultiplier weakens Fire moves in rain", () => {
    const service = createService();

    assert.equal(
        service.getMoveMultiplier({ type: "RAIN" }, "FIRE"),
        0.5
    );
});

test("getMoveMultiplier boosts Fire moves in sun", () => {
    const service = createService();

    assert.equal(
        service.getMoveMultiplier({ type: "SUN" }, "FIRE"),
        1.5
    );
});

test("getMoveMultiplier weakens Water moves in sun", () => {
    const service = createService();

    assert.equal(
        service.getMoveMultiplier({ type: "SUN" }, "WATER"),
        0.5
    );
});

test("getMoveMultiplier leaves other move types unchanged in rain", () => {
    const service = createService();

    assert.equal(
        service.getMoveMultiplier({ type: "RAIN" }, "ELECTRIC"),
        1
    );
});

test("getMoveMultiplier leaves other move types unchanged in sun", () => {
    const service = createService();

    assert.equal(
        service.getMoveMultiplier({ type: "SUN" }, "GRASS"),
        1
    );
});

test("getMoveMultiplier leaves Fire moves unchanged in sandstorm", () => {
    const service = createService();

    assert.equal(
        service.getMoveMultiplier({ type: "SANDSTORM" }, "FIRE"),
        1
    );
});

test("getMoveMultiplier leaves Water moves unchanged in hail", () => {
    const service = createService();

    assert.equal(
        service.getMoveMultiplier({ type: "HAIL" }, "WATER"),
        1
    );
});

test("getMoveMultiplier returns one for an unknown weather", () => {
    const service = createService();

    assert.equal(
        service.getMoveMultiplier({ type: "FOG" }, "FIRE"),
        1
    );
});

test("getMoveMultiplier returns one for an unknown move type", () => {
    const service = createService();

    assert.equal(
        service.getMoveMultiplier({ type: "RAIN" }, "UNKNOWN"),
        1
    );
});

test("getMoveMultiplier requires uppercase move type names", () => {
    const service = createService();

    assert.equal(
        service.getMoveMultiplier({ type: "RAIN" }, "water"),
        1
    );
});


// -----------------------------------------------
// getSolarBeamModifier
// -----------------------------------------------

test("getSolarBeamModifier returns the default when weather is absent", () => {
    const service = createService();

    assert.deepEqual(
        service.getSolarBeamModifier(null),
        { powerMultiplier: 1, instant: false }
    );
});

test("getSolarBeamModifier halves power during rain", () => {
    const service = createService();

    assert.deepEqual(
        service.getSolarBeamModifier({ type: "RAIN" }),
        { powerMultiplier: 0.5, instant: false }
    );
});

test("getSolarBeamModifier halves power during sandstorm", () => {
    const service = createService();

    assert.deepEqual(
        service.getSolarBeamModifier({ type: "SANDSTORM" }),
        { powerMultiplier: 0.5, instant: false }
    );
});

test("getSolarBeamModifier halves power during hail", () => {
    const service = createService();

    assert.deepEqual(
        service.getSolarBeamModifier({ type: "HAIL" }),
        { powerMultiplier: 0.5, instant: false }
    );
});

test("getSolarBeamModifier makes Solar Beam instant in sun", () => {
    const service = createService();

    assert.deepEqual(
        service.getSolarBeamModifier({ type: "SUN" }),
        { powerMultiplier: 1, instant: true }
    );
});

test("getSolarBeamModifier returns the default for unknown weather", () => {
    const service = createService();

    assert.deepEqual(
        service.getSolarBeamModifier({ type: "FOG" }),
        { powerMultiplier: 1, instant: false }
    );
});


// -----------------------------------------------
// getThunderAccuracy
// -----------------------------------------------

test("getThunderAccuracy returns 100 during rain", () => {
    const service = createService();

    assert.equal(
        service.getThunderAccuracy({ type: "RAIN" }),
        100
    );
});

test("getThunderAccuracy returns 50 during sun", () => {
    const service = createService();

    assert.equal(
        service.getThunderAccuracy({ type: "SUN" }),
        50
    );
});

test("getThunderAccuracy returns 70 without weather", () => {
    const service = createService();

    assert.equal(service.getThunderAccuracy(null), 70);
});

test("getThunderAccuracy returns 70 during sandstorm", () => {
    const service = createService();

    assert.equal(
        service.getThunderAccuracy({ type: "SANDSTORM" }),
        70
    );
});

test("getThunderAccuracy returns 70 during hail", () => {
    const service = createService();

    assert.equal(
        service.getThunderAccuracy({ type: "HAIL" }),
        70
    );
});

test("getThunderAccuracy returns 70 for an unknown weather type", () => {
    const service = createService();

    assert.equal(
        service.getThunderAccuracy({ type: "FOG" }),
        70
    );
});


// -----------------------------------------------
// getWeatherBallData
// -----------------------------------------------

test("getWeatherBallData defaults to Normal type without weather", () => {
    const service = createService();

    assert.deepEqual(
        service.getWeatherBallData(null),
        { type: "NORMAL", power: 50 }
    );
});

test("getWeatherBallData returns Water type and 100 power in rain", () => {
    const service = createService();

    assert.deepEqual(
        service.getWeatherBallData({ type: "RAIN" }),
        { type: "WATER", power: 100 }
    );
});

test("getWeatherBallData returns Fire type and 100 power in sun", () => {
    const service = createService();

    assert.deepEqual(
        service.getWeatherBallData({ type: "SUN" }),
        { type: "FIRE", power: 100 }
    );
});

test("getWeatherBallData returns Ice type and 100 power in hail", () => {
    const service = createService();

    assert.deepEqual(
        service.getWeatherBallData({ type: "HAIL" }),
        { type: "ICE", power: 100 }
    );
});

test("getWeatherBallData returns Rock type and 100 power in sandstorm", () => {
    const service = createService();

    assert.deepEqual(
        service.getWeatherBallData({ type: "SANDSTORM" }),
        { type: "ROCK", power: 100 }
    );
});

test("getWeatherBallData returns undefined for unknown weather", () => {
    const service = createService();

    assert.equal(
        service.getWeatherBallData({ type: "FOG" }),
        undefined
    );
});


// -----------------------------------------------
// getAllWeather
// -----------------------------------------------

test("getAllWeather returns every supported weather type", () => {
    const service = createService();

    assert.deepEqual(
        service.getAllWeather(),
        ["RAIN", "SUN", "SANDSTORM", "HAIL"]
    );
});

test("getAllWeather returns a new array on each call", () => {
    const service = createService();

    const first = service.getAllWeather();
    const second = service.getAllWeather();

    assert.notEqual(first, second);
    assert.deepEqual(first, second);
});

test("getAllWeather reflects keys from the weather definitions", () => {
    const service = createService();

    assert.deepEqual(
        service.getAllWeather(),
        Object.keys(service.weatherTypes)
    );
});

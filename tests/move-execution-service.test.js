"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const MoveExecutionService = require("../scripts/services/move-execution-service");

function makePokemon(species, hp = 100, extra = {}) {
    return { species, hp, ...extra };
}

function makeMove(constant = "TACKLE", extra = {}) {
    return {
        constant,
        name: constant,
        power: 40,
        accuracy: 100,
        ...extra
    };
}

function makeService({
    mechanics = null,
    effect = null,
    damage = null,
    status = null
} = {}) {
    return new MoveExecutionService(mechanics, effect, damage, status);
}

test("constructor stores all injected services", () => {
    const mechanics = {};
    const effect = {};
    const damage = {};
    const status = {};

    const service = new MoveExecutionService(
        mechanics,
        effect,
        damage,
        status
    );

    assert.strictEqual(service.moveMechanics, mechanics);
    assert.strictEqual(service.moveEffect, effect);
    assert.strictEqual(service.damageCalculation, damage);
    assert.strictEqual(service.statusEffect, status);
});

test("constructor defaults optional services to null", () => {
    const service = new MoveExecutionService();

    assert.equal(service.moveMechanics, null);
    assert.equal(service.moveEffect, null);
    assert.equal(service.damageCalculation, null);
    assert.equal(service.statusEffect, null);
    assert.equal(service.defaultAccuracy, 100);
});

test("executeMove rejects a missing attacker", () => {
    const service = makeService();

    assert.deepEqual(
        service.executeMove(null, makePokemon("SQUIRTLE"), makeMove()),
        { success: false, reason: "Invalid move data" }
    );
});

test("executeMove rejects a missing defender", () => {
    const service = makeService();

    assert.deepEqual(
        service.executeMove(makePokemon("CHARMANDER"), null, makeMove()),
        { success: false, reason: "Invalid move data" }
    );
});

test("executeMove rejects a missing move", () => {
    const service = makeService();

    assert.deepEqual(
        service.executeMove(
            makePokemon("CHARMANDER"),
            makePokemon("SQUIRTLE"),
            null
        ),
        { success: false, reason: "Invalid move data" }
    );
});

test("executeMove rejects all three required inputs when they are absent", () => {
    const service = makeService();

    assert.deepEqual(
        service.executeMove(null, null, null),
        { success: false, reason: "Invalid move data" }
    );
});

test("executeMove returns a status restriction result when the attacker cannot act", () => {
    const service = makeService({
        status: { canAct: () => false }
    });

    const attacker = makePokemon("CHARMANDER");
    const defender = makePokemon("SQUIRTLE");

    const result = service.executeMove(attacker, defender, makeMove());

    assert.deepEqual(result, {
        success: true,
        hit: false,
        damage: 0,
        move: "TACKLE",
        message: "Unable to move due to status"
    });
    assert.equal(defender.hp, 100);
});

test("status restriction checks the attacker", () => {
    let received;

    const service = makeService({
        status: {
            canAct(pokemon) {
                received = pokemon;
                return false;
            }
        }
    });

    const attacker = makePokemon("CHARMANDER");

    service.executeMove(attacker, makePokemon("SQUIRTLE"), makeMove());

    assert.strictEqual(received, attacker);
});

test("status restriction prevents mechanics, effects, and damage calculation", () => {
    let mechanicsCalls = 0;
    let effectCalls = 0;
    let damageCalls = 0;

    const service = makeService({
        status: { canAct: () => false },
        mechanics: {
            resolveMove() {
                mechanicsCalls++;
                return {};
            }
        },
        effect: {
            applyEffect() {
                effectCalls++;
            }
        },
        damage: {
            calculateDamage() {
                damageCalls++;
                return 10;
            }
        }
    });

    service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        makeMove("TACKLE", { effect: "test" })
    );

    assert.equal(mechanicsCalls, 0);
    assert.equal(effectCalls, 0);
    assert.equal(damageCalls, 0);
});

test("status restriction result falls back to move constant when name is missing", () => {
    const service = makeService({
        status: { canAct: () => false }
    });

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        { constant: "TACKLE" }
    );

    assert.equal(result.move, "TACKLE");
});

test("executeMove resolves mechanics using attacker and context environment", () => {
    const attacker = makePokemon("CHARMANDER");
    let receivedMove;
    let receivedContext;

    const service = makeService({
        mechanics: {
            resolveMove(move, context) {
                receivedMove = move;
                receivedContext = context;
                return { power: 0, name: "Resolved Move" };
            }
        }
    });

    const originalMove = makeMove();
    const context = { weather: "RAIN", environment: "CAVE" };

    service.executeMove(
        attacker,
        makePokemon("SQUIRTLE"),
        originalMove,
        context
    );

    assert.strictEqual(receivedMove, originalMove);
    assert.deepEqual(receivedContext, {
        pokemon: attacker,
        weather: "RAIN",
        environment: "CAVE"
    });
});

test("mechanics resolution merges resolved fields with the original move", () => {
    const service = makeService({
        mechanics: {
            resolveMove() {
                return { power: 0, name: "Changed Name" };
            }
        }
    });

    const originalMove = makeMove("TACKLE", {
        type: "NORMAL",
        accuracy: 100
    });

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        originalMove
    );

    assert.equal(result.resolvedMove.constant, "TACKLE");
    assert.equal(result.resolvedMove.type, "NORMAL");
    assert.equal(result.resolvedMove.name, "Changed Name");
    assert.equal(result.resolvedMove.power, 0);
});

test('executeMove continues with the original move when mechanics resolution produces null', () => {
    const service = new MoveExecutionService({
        resolveMove: () => null
    });

    const attacker = { species: 'CHARMANDER', hp: 100 };
    const defender = { species: 'SQUIRTLE', hp: 100 };
    const move = {
        name: 'TACKLE',
        constant: 'TACKLE',
        power: 40,
        accuracy: 100
    };

    const result = service.executeMove(attacker, defender, move);

    assert.equal(result.success, true);
    assert.equal(result.hit, true);
    assert.equal(result.move, 'TACKLE');
    assert.equal(result.damage, 1);
    assert.equal(result.remainingHP, 99);
    assert.deepEqual(result.resolvedMove, move);
});

test("mechanics resolution can override the original accuracy", () => {
    const service = makeService({
        mechanics: {
            resolveMove() {
                return { accuracy: 0 };
            }
        }
    });

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        makeMove("TACKLE", { accuracy: 100 })
    );

    assert.equal(result.hit, false);
    assert.equal(result.message, "Move missed");
});

test("default accuracy is used when resolved move accuracy is undefined", () => {
    const service = makeService();

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        { constant: "TACKLE", power: 0 }
    );

    assert.equal(result.success, true);
    assert.equal(result.hit, true);
});

test("accuracy of 100 always hits", () => {
    const service = makeService();

    assert.equal(service.checkAccuracy(100), true);
});

test("accuracy above 100 always hits", () => {
    const service = makeService();

    assert.equal(service.checkAccuracy(150), true);
});

test("accuracy of zero always misses", () => {
    const service = makeService();

    assert.equal(service.checkAccuracy(0), false);
});

test("negative accuracy always misses", () => {
    const service = makeService();

    assert.equal(service.checkAccuracy(-10), false);
});

test("accuracy below 100 uses a random roll from 1 to 100", () => {
    const service = makeService();
    const originalRandom = Math.random;

    try {
        Math.random = () => 0;
        assert.equal(service.checkAccuracy(1), true);

        Math.random = () => 0.009;
        assert.equal(service.checkAccuracy(1), true);

        Math.random = () => 0.01;
        assert.equal(service.checkAccuracy(1), false);

        Math.random = () => 0.98;
        assert.equal(service.checkAccuracy(99), true);
    } finally {
        Math.random = originalRandom;
    }
});

test("a missed move does not apply effects or damage", () => {
    let effectCalls = 0;
    let damageCalls = 0;

    const service = makeService({
        effect: {
            applyEffect() {
                effectCalls++;
            }
        },
        damage: {
            calculateDamage() {
                damageCalls++;
                return 10;
            }
        }
    });

    const defender = makePokemon("SQUIRTLE");

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        defender,
        makeMove("TACKLE", { accuracy: 0, effect: "test" })
    );

    assert.equal(result.success, true);
    assert.equal(result.hit, false);
    assert.equal(result.damage, 0);
    assert.equal(result.message, "Move missed");
    assert.equal(defender.hp, 100);
    assert.equal(effectCalls, 0);
    assert.equal(damageCalls, 0);
});

test("a missed move uses the move constant when name is missing", () => {
    const service = makeService();

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        { constant: "TACKLE", power: 40, accuracy: 0 }
    );

    assert.equal(result.move, "TACKLE");
});

test("move effects are skipped when no effect is defined", () => {
    let calls = 0;

    const service = makeService({
        effect: {
            applyEffect() {
                calls++;
                return { success: true };
            }
        }
    });

    service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        makeMove("TACKLE", { effect: null, power: 0 })
    );

    assert.equal(calls, 0);
});

test("move effects are skipped when no effect service is injected", () => {
    const service = makeService();

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        makeMove("TACKLE", { effect: "test", power: 0 })
    );

    assert.equal(result.effect.moveEffect, null);
});

test("move effect service receives move, attacker, defender, and battle context", () => {
    let received;

    const service = makeService({
        effect: {
            applyEffect(...args) {
                received = args;
                return { success: true, effect: "applied" };
            }
        }
    });

    const attacker = makePokemon("CHARMANDER");
    const defender = makePokemon("SQUIRTLE");
    const move = makeMove("TACKLE", { effect: "test", power: 0 });
    const battle = { id: "battle-1" };

    service.executeMove(attacker, defender, move, { battle });

    assert.deepEqual(received, [move, attacker, defender, battle]);
});

test("a failed move effect is ignored", () => {
    const service = makeService({
        effect: {
            applyEffect() {
                return { success: false, reason: "Effect failed" };
            }
        }
    });

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        makeMove("TACKLE", { effect: "test", power: 0 })
    );

    assert.equal(result.success, true);
    assert.equal(result.effect.moveEffect, null);
});

test("a successful move effect is included in the result", () => {
    const effectResult = { success: true, effect: "boosted" };

    const service = makeService({
        effect: {
            applyEffect() {
                return effectResult;
            }
        }
    });

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        makeMove("TACKLE", { effect: "test", power: 0 })
    );

    assert.strictEqual(result.effect.moveEffect, effectResult);
});

test("direct status is applied when move status and status service exist", () => {
    let received;

    const service = makeService({
        status: {
            canAct: () => true,
            applyStatus(...args) {
                received = args;
                return { success: true, status: "BURN" };
            }
        }
    });

    const defender = makePokemon("SQUIRTLE");
    const move = makeMove("WILL_O_WISP", {
        power: 0,
        status: "BURN"
    });

    service.executeMove(
        makePokemon("CHARMANDER"),
        defender,
        move
    );

    assert.deepEqual(received, [defender, "BURN"]);
});

test("direct status is skipped when move has no status", () => {
    let calls = 0;

    const service = makeService({
        status: {
            canAct: () => true,
            applyStatus() {
                calls++;
            }
        }
    });

    service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        makeMove("TACKLE", { power: 0, status: null })
    );

    assert.equal(calls, 0);
});

test("direct status is skipped when no status service is injected", () => {
    const service = makeService();

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        makeMove("WILL_O_WISP", {
            power: 0,
            status: "BURN"
        })
    );

    assert.equal(result.effect.status, null);
});

test("status and move effects are included in a utility move result", () => {
    const moveEffect = { success: true, effect: "utility" };
    const statusResult = { success: true, status: "BURN" };

    const service = makeService({
        effect: {
            applyEffect() {
                return moveEffect;
            }
        },
        status: {
            canAct: () => true,
            applyStatus() {
                return statusResult;
            }
        }
    });

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        makeMove("UTILITY", {
            power: 0,
            effect: "test",
            status: "BURN"
        })
    );

    assert.equal(result.success, true);
    assert.equal(result.hit, true);
    assert.equal(result.damage, 0);
    assert.strictEqual(result.effect.moveEffect, moveEffect);
    assert.strictEqual(result.effect.status, statusResult);
});

test("a utility move reports defender HP as remaining HP", () => {
    const defender = makePokemon("SQUIRTLE", 37);
    const service = makeService();

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        defender,
        makeMove("GROWL", { power: 0 })
    );

    assert.equal(result.remainingHP, 37);
    assert.equal(defender.hp, 37);
});

test("a utility move returns the resolved move", () => {
    const service = makeService();
    const move = makeMove("GROWL", { power: 0 });

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        move
    );

    assert.strictEqual(result.resolvedMove, move);
});

test("utility move result uses name before constant", () => {
    const service = makeService();

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        makeMove("GROWL", { name: "Growl", power: 0 })
    );

    assert.equal(result.move, "Growl");
});

test("damage defaults to one when no damage service is injected", () => {
    const service = makeService();
    const defender = makePokemon("SQUIRTLE", 100);

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        defender,
        makeMove("TACKLE", { power: 40 })
    );

    assert.equal(result.damage, 1);
    assert.equal(defender.hp, 99);
    assert.equal(result.remainingHP, 99);
});

test("damage calculation receives attacker, defender, move, and context", () => {
    let received;

    const service = makeService({
        damage: {
            calculateDamage(...args) {
                received = args;
                return 12;
            }
        }
    });

    const attacker = makePokemon("CHARMANDER");
    const defender = makePokemon("SQUIRTLE");
    const move = makeMove();
    const context = { weather: "SUN" };

    service.executeMove(attacker, defender, move, context);

    assert.deepEqual(received, [attacker, defender, move, context]);
});

test("calculated damage is applied to the defender", () => {
    const service = makeService({
        damage: {
            calculateDamage() {
                return 25;
            }
        }
    });

    const defender = makePokemon("SQUIRTLE", 100);

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        defender,
        makeMove()
    );

    assert.equal(result.damage, 25);
    assert.equal(defender.hp, 75);
    assert.equal(result.remainingHP, 75);
});

test("calculated damage can reduce defender HP to zero", () => {
    const service = makeService({
        damage: {
            calculateDamage() {
                return 100;
            }
        }
    });

    const defender = makePokemon("SQUIRTLE", 100);

    const result = service.executeMove(
        makePokemon("CHARMANDER"),
        defender,
        makeMove()
    );

    assert.equal(defender.hp, 0);
    assert.equal(result.remainingHP, 0);
});

test("applyDamage subtracts damage from HP", () => {
    const service = makeService();
    const pokemon = makePokemon("SQUIRTLE", 80);

    assert.equal(service.applyDamage(pokemon, 30), 50);
    assert.equal(pokemon.hp, 50);
});

test("applyDamage clamps negative HP to zero", () => {
    const service = makeService();
    const pokemon = makePokemon("SQUIRTLE", 10);

    assert.equal(service.applyDamage(pokemon, 50), 0);
    assert.equal(pokemon.hp, 0);
});

test("applyDamage sets missing numeric HP to zero before subtracting", () => {
    const service = makeService();
    const pokemon = { species: "SQUIRTLE" };

    assert.equal(service.applyDamage(pokemon, 5), 0);
    assert.equal(pokemon.hp, 0);
});

test("applyDamage normalizes non-numeric HP to zero", () => {
    const service = makeService();
    const pokemon = { species: "SQUIRTLE", hp: "80" };

    assert.equal(service.applyDamage(pokemon, 5), 0);
    assert.equal(pokemon.hp, 0);
});

test("applyDamage does not clamp HP above its starting value", () => {
    const service = makeService();
    const pokemon = makePokemon("SQUIRTLE", 80);

    assert.equal(service.applyDamage(pokemon, -10), 90);
    assert.equal(pokemon.hp, 90);
});

test("isFainted returns true for a missing Pokémon", () => {
    const service = makeService();

    assert.equal(service.isFainted(null), true);
    assert.equal(service.isFainted(undefined), true);
});

test("isFainted returns true at zero HP", () => {
    const service = makeService();

    assert.equal(service.isFainted(makePokemon("SQUIRTLE", 0)), true);
});

test("isFainted returns true below zero HP", () => {
    const service = makeService();

    assert.equal(service.isFainted(makePokemon("SQUIRTLE", -1)), true);
});

test("isFainted returns false above zero HP", () => {
    const service = makeService();

    assert.equal(service.isFainted(makePokemon("SQUIRTLE", 1)), false);
});

test("getResultSummary returns attacker, defender, move, damage, and faint status", () => {
    const service = makeService();

    const summary = service.getResultSummary(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE", 0),
        makeMove("TACKLE"),
        { move: "Tackle", damage: 40 }
    );

    assert.deepEqual(summary, {
        attacker: "CHARMANDER",
        defender: "SQUIRTLE",
        move: "Tackle",
        damage: 40,
        fainted: true
    });
});

test("getResultSummary falls back to move name and constant", () => {
    const service = makeService();

    const summary = service.getResultSummary(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE", 50),
        { name: "Growl", constant: "GROWL" },
        {}
    );

    assert.equal(summary.move, "Growl");
});

test("getResultSummary falls back to the move constant when result and name are absent", () => {
    const service = makeService();

    const summary = service.getResultSummary(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE", 50),
        { constant: "GROWL" },
        {}
    );

    assert.equal(summary.move, "GROWL");
});

test("getResultSummary defaults falsy damage to zero", () => {
    const service = makeService();

    const summary = service.getResultSummary(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE", 50),
        makeMove(),
        { damage: 0 }
    );

    assert.equal(summary.damage, 0);
});

test("getResultSummary reports a living defender as not fainted", () => {
    const service = makeService();

    const summary = service.getResultSummary(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE", 1),
        makeMove(),
        { damage: 99 }
    );

    assert.equal(summary.fainted, false);
});

test("move execution does not mutate the original move during mechanics resolution", () => {
    const service = makeService({
        mechanics: {
            resolveMove() {
                return { power: 0, name: "Resolved" };
            }
        }
    });

    const move = makeMove("TACKLE");
    const original = { ...move };

    service.executeMove(
        makePokemon("CHARMANDER"),
        makePokemon("SQUIRTLE"),
        move
    );

    assert.deepEqual(move, original);
});

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const MoveStateService = require("../scripts/services/move-state-service");

function makePokemon(id, species = "PIKACHU") {
    return { id, species };
}

test("constructor initializes an empty state map", () => {
    const service = new MoveStateService();

    assert.ok(service.states instanceof Map);
    assert.equal(service.states.size, 0);
});

test("getId prefers a truthy Pokémon id", () => {
    const service = new MoveStateService();

    assert.equal(service.getId(makePokemon("pokemon-1")), "pokemon-1");
});

test("getId falls back to species when id is missing", () => {
    const service = new MoveStateService();

    assert.equal(service.getId({ species: "PIKACHU" }), "PIKACHU");
});

test("getId falls back to species when id is empty", () => {
    const service = new MoveStateService();

    assert.equal(service.getId({ id: "", species: "PIKACHU" }), "PIKACHU");
});

test("getId falls back to species when id is zero", () => {
    const service = new MoveStateService();

    assert.equal(service.getId({ id: 0, species: "PIKACHU" }), "PIKACHU");
});

test("initialize creates the default state for a Pokémon", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    const state = service.initialize(pokemon);

    assert.deepEqual(state, {
        rollout: null,
        furyCutter: null,
        rage: false,
        bide: null
    });
});

test("initialize stores one state entry per ID", () => {
    const service = new MoveStateService();

    service.initialize(makePokemon("pokemon-1"));
    service.initialize(makePokemon("pokemon-1"));

    assert.equal(service.states.size, 1);
});

test("initialize returns the same state object for the same ID", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    const first = service.initialize(pokemon);
    const second = service.initialize(pokemon);

    assert.strictEqual(first, second);
});

test("initialize keeps states separate for different IDs", () => {
    const service = new MoveStateService();

    const first = service.initialize(makePokemon("pokemon-1"));
    const second = service.initialize(makePokemon("pokemon-2"));

    assert.notStrictEqual(first, second);
    assert.equal(service.states.size, 2);
});

test("initialize uses species as the state key when IDs are absent", () => {
    const service = new MoveStateService();

    const first = service.initialize({ species: "PIKACHU" });
    const second = service.initialize({ species: "PIKACHU" });

    assert.strictEqual(first, second);
});

test("initialize shares state for different Pokémon objects with the same ID", () => {
    const service = new MoveStateService();

    const first = service.initialize(makePokemon("shared-id", "PIKACHU"));
    const second = service.initialize(makePokemon("shared-id", "CHARMANDER"));

    assert.strictEqual(first, second);
});

test("startRollout initializes Rollout at turn one with power 30", () => {
    const service = new MoveStateService();

    const rollout = service.startRollout(makePokemon("pokemon-1"));

    assert.deepEqual(rollout, {
        turn: 1,
        power: 30
    });
});

test("startRollout stores the returned Rollout state", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    const rollout = service.startRollout(pokemon);

    assert.strictEqual(service.getRollout(pokemon), rollout);
});

test("startRollout resets an existing Rollout sequence", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startRollout(pokemon);
    service.continueRollout(pokemon);

    const rollout = service.startRollout(pokemon);

    assert.deepEqual(rollout, {
        turn: 1,
        power: 30
    });
});

test("continueRollout starts Rollout if it is not active", () => {
    const service = new MoveStateService();

    const rollout = service.continueRollout(makePokemon("pokemon-1"));

    assert.deepEqual(rollout, {
        turn: 1,
        power: 30
    });
});

test("continueRollout increments the turn", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startRollout(pokemon);
    const rollout = service.continueRollout(pokemon);

    assert.equal(rollout.turn, 2);
});

test("continueRollout doubles the power", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startRollout(pokemon);
    const rollout = service.continueRollout(pokemon);

    assert.equal(rollout.power, 60);
});

test("continueRollout doubles Rollout power over repeated turns", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startRollout(pokemon);
    service.continueRollout(pokemon);
    service.continueRollout(pokemon);
    const rollout = service.continueRollout(pokemon);

    assert.equal(rollout.turn, 4);
    assert.equal(rollout.power, 240);
});

test("getRollout returns null before Rollout starts", () => {
    const service = new MoveStateService();

    assert.equal(service.getRollout(makePokemon("pokemon-1")), null);
});

test("getRollout returns the active Rollout state", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");
    const rollout = service.startRollout(pokemon);

    assert.strictEqual(service.getRollout(pokemon), rollout);
});

test("resetRollout clears Rollout state", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startRollout(pokemon);

    assert.deepEqual(service.resetRollout(pokemon), { success: true });
    assert.equal(service.getRollout(pokemon), null);
});

test("resetRollout does not reset other move states", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startRollout(pokemon);
    service.startFuryCutter(pokemon);
    service.activateRage(pokemon);
    service.startBide(pokemon);

    service.resetRollout(pokemon);

    const state = service.initialize(pokemon);

    assert.equal(state.rollout, null);
    assert.notEqual(state.furyCutter, null);
    assert.equal(state.rage, true);
    assert.notEqual(state.bide, null);
});

test("startFuryCutter initializes stage one with power 10", () => {
    const service = new MoveStateService();

    const state = service.startFuryCutter(makePokemon("pokemon-1"));

    assert.deepEqual(state, {
        stage: 1,
        power: 10
    });
});

test("startFuryCutter stores the returned state", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    const furyCutter = service.startFuryCutter(pokemon);

    assert.strictEqual(
        service.initialize(pokemon).furyCutter,
        furyCutter
    );
});

test("startFuryCutter resets an existing sequence", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startFuryCutter(pokemon);
    service.continueFuryCutter(pokemon);

    const furyCutter = service.startFuryCutter(pokemon);

    assert.deepEqual(furyCutter, {
        stage: 1,
        power: 10
    });
});

test("continueFuryCutter starts a sequence if none exists", () => {
    const service = new MoveStateService();

    const state = service.continueFuryCutter(makePokemon("pokemon-1"));

    assert.deepEqual(state, {
        stage: 1,
        power: 10
    });
});

test("continueFuryCutter increments the stage", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startFuryCutter(pokemon);
    const state = service.continueFuryCutter(pokemon);

    assert.equal(state.stage, 2);
});

test("continueFuryCutter doubles the power", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startFuryCutter(pokemon);
    const state = service.continueFuryCutter(pokemon);

    assert.equal(state.power, 20);
});

test("continueFuryCutter doubles power across multiple stages", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startFuryCutter(pokemon);
    service.continueFuryCutter(pokemon);
    service.continueFuryCutter(pokemon);
    const state = service.continueFuryCutter(pokemon);

    assert.equal(state.stage, 4);
    assert.equal(state.power, 80);
});

test("continueFuryCutter caps power at 160", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startFuryCutter(pokemon);

    for (let i = 0; i < 10; i++) {
        service.continueFuryCutter(pokemon);
    }

    const state = service.initialize(pokemon).furyCutter;

    assert.equal(state.power, 160);
});

test("continueFuryCutter continues incrementing stage after power is capped", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startFuryCutter(pokemon);

    for (let i = 0; i < 10; i++) {
        service.continueFuryCutter(pokemon);
    }

    const before = service.initialize(pokemon).furyCutter.stage;
    const state = service.continueFuryCutter(pokemon);

    assert.equal(state.stage, before + 1);
    assert.equal(state.power, 160);
});

test("resetFuryCutter clears Fury Cutter state", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startFuryCutter(pokemon);

    assert.deepEqual(service.resetFuryCutter(pokemon), { success: true });
    assert.equal(service.initialize(pokemon).furyCutter, null);
});

test("resetFuryCutter does not reset other move states", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startFuryCutter(pokemon);
    service.startRollout(pokemon);
    service.activateRage(pokemon);

    service.resetFuryCutter(pokemon);

    const state = service.initialize(pokemon);

    assert.equal(state.furyCutter, null);
    assert.notEqual(state.rollout, null);
    assert.equal(state.rage, true);
});

test("activateRage sets Rage to true", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    assert.deepEqual(service.activateRage(pokemon), { success: true });
    assert.equal(service.isRageActive(pokemon), true);
});

test("isRageActive returns false before Rage activates", () => {
    const service = new MoveStateService();

    assert.equal(service.isRageActive(makePokemon("pokemon-1")), false);
});

test("activateRage is safe to call repeatedly", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.activateRage(pokemon);
    service.activateRage(pokemon);

    assert.equal(service.isRageActive(pokemon), true);
});

test("resetRage sets Rage to false", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.activateRage(pokemon);

    assert.deepEqual(service.resetRage(pokemon), { success: true });
    assert.equal(service.isRageActive(pokemon), false);
});

test("resetRage does not reset other move states", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.activateRage(pokemon);
    service.startRollout(pokemon);
    service.startBide(pokemon);

    service.resetRage(pokemon);

    const state = service.initialize(pokemon);

    assert.equal(state.rage, false);
    assert.notEqual(state.rollout, null);
    assert.notEqual(state.bide, null);
});

test("startBide initializes zero turns and zero stored damage", () => {
    const service = new MoveStateService();

    const bide = service.startBide(makePokemon("pokemon-1"));

    assert.deepEqual(bide, {
        turns: 0,
        damage: 0
    });
});

test("startBide stores the returned Bide state", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    const bide = service.startBide(pokemon);

    assert.strictEqual(service.initialize(pokemon).bide, bide);
});

test("startBide resets an existing Bide state", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startBide(pokemon);
    service.storeBideDamage(pokemon, 20);
    service.continueBide(pokemon);

    const bide = service.startBide(pokemon);

    assert.deepEqual(bide, {
        turns: 0,
        damage: 0
    });
});

test("storeBideDamage starts Bide when it is not active", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    const damage = service.storeBideDamage(pokemon, 20);

    assert.equal(damage, 20);
    assert.deepEqual(service.initialize(pokemon).bide, {
        turns: 0,
        damage: 20
    });
});

test("storeBideDamage adds damage to the existing total", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startBide(pokemon);
    service.storeBideDamage(pokemon, 20);

    const total = service.storeBideDamage(pokemon, 15);

    assert.equal(total, 35);
});

test("storeBideDamage returns the accumulated damage", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startBide(pokemon);

    assert.equal(service.storeBideDamage(pokemon, 12), 12);
    assert.equal(service.storeBideDamage(pokemon, 8), 20);
});

test("storeBideDamage does not change Bide turns", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startBide(pokemon);
    service.storeBideDamage(pokemon, 10);

    assert.equal(service.initialize(pokemon).bide.turns, 0);
});

test("continueBide increments turns when Bide is active", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startBide(pokemon);
    const bide = service.continueBide(pokemon);

    assert.equal(bide.turns, 1);
});

test("continueBide returns the current Bide state", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");
    const bide = service.startBide(pokemon);

    const result = service.continueBide(pokemon);

    assert.strictEqual(result, bide);
});

test("continueBide returns null when Bide is inactive", () => {
    const service = new MoveStateService();

    assert.equal(service.continueBide(makePokemon("pokemon-1")), null);
});

test("continueBide does not create a Bide state when inactive", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.continueBide(pokemon);

    assert.equal(service.initialize(pokemon).bide, null);
});

test("releaseBide returns twice the stored damage", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startBide(pokemon);
    service.storeBideDamage(pokemon, 30);

    assert.equal(service.releaseBide(pokemon), 60);
});

test("releaseBide returns zero when Bide is inactive", () => {
    const service = new MoveStateService();

    assert.equal(service.releaseBide(makePokemon("pokemon-1")), 0);
});

test("releaseBide clears Bide state after releasing damage", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startBide(pokemon);
    service.storeBideDamage(pokemon, 30);

    service.releaseBide(pokemon);

    assert.equal(service.initialize(pokemon).bide, null);
});

test("releaseBide returns zero when no damage was stored", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startBide(pokemon);

    assert.equal(service.releaseBide(pokemon), 0);
});

test("releaseBide can be called repeatedly", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startBide(pokemon);
    service.storeBideDamage(pokemon, 25);

    assert.equal(service.releaseBide(pokemon), 50);
    assert.equal(service.releaseBide(pokemon), 0);
});

test("releaseBide clears accumulated damage before a new Bide sequence", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startBide(pokemon);
    service.storeBideDamage(pokemon, 20);
    service.releaseBide(pokemon);

    service.startBide(pokemon);
    service.storeBideDamage(pokemon, 5);

    assert.equal(service.releaseBide(pokemon), 10);
});

test("reset restores all move states to their defaults", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    service.startRollout(pokemon);
    service.startFuryCutter(pokemon);
    service.activateRage(pokemon);
    service.startBide(pokemon);
    service.storeBideDamage(pokemon, 40);

    assert.deepEqual(service.reset(pokemon), { success: true });
    assert.deepEqual(service.initialize(pokemon), {
        rollout: null,
        furyCutter: null,
        rage: false,
        bide: null
    });
});

test("reset replaces the stored state object", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");
    const original = service.initialize(pokemon);

    service.reset(pokemon);

    const resetState = service.initialize(pokemon);

    assert.notStrictEqual(resetState, original);
});

test("reset preserves the number of tracked Pokémon", () => {
    const service = new MoveStateService();
    const first = makePokemon("pokemon-1");
    const second = makePokemon("pokemon-2");

    service.initialize(first);
    service.initialize(second);
    service.reset(first);

    assert.equal(service.states.size, 2);
});

test("reset does not change another Pokémon's state", () => {
    const service = new MoveStateService();
    const first = makePokemon("pokemon-1");
    const second = makePokemon("pokemon-2");

    service.startRollout(first);
    service.activateRage(second);

    service.reset(first);

    assert.equal(service.getRollout(first), null);
    assert.equal(service.isRageActive(second), true);
});

test("Rollout state is independent between Pokémon IDs", () => {
    const service = new MoveStateService();
    const first = makePokemon("pokemon-1");
    const second = makePokemon("pokemon-2");

    service.startRollout(first);
    service.continueRollout(first);
    service.startRollout(second);

    assert.deepEqual(service.getRollout(first), {
        turn: 2,
        power: 60
    });
    assert.deepEqual(service.getRollout(second), {
        turn: 1,
        power: 30
    });
});

test("Fury Cutter state is independent between Pokémon IDs", () => {
    const service = new MoveStateService();
    const first = makePokemon("pokemon-1");
    const second = makePokemon("pokemon-2");

    service.startFuryCutter(first);
    service.continueFuryCutter(first);
    service.startFuryCutter(second);

    assert.deepEqual(service.initialize(first).furyCutter, {
        stage: 2,
        power: 20
    });
    assert.deepEqual(service.initialize(second).furyCutter, {
        stage: 1,
        power: 10
    });
});

test("Rage state is independent between Pokémon IDs", () => {
    const service = new MoveStateService();
    const first = makePokemon("pokemon-1");
    const second = makePokemon("pokemon-2");

    service.activateRage(first);

    assert.equal(service.isRageActive(first), true);
    assert.equal(service.isRageActive(second), false);
});

test("Bide state is independent between Pokémon IDs", () => {
    const service = new MoveStateService();
    const first = makePokemon("pokemon-1");
    const second = makePokemon("pokemon-2");

    service.startBide(first);
    service.storeBideDamage(first, 20);
    service.startBide(second);

    assert.equal(service.initialize(first).bide.damage, 20);
    assert.equal(service.initialize(second).bide.damage, 0);
});

test("resetRollout initializes state for a previously unseen Pokémon", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    assert.deepEqual(service.resetRollout(pokemon), { success: true });
    assert.deepEqual(service.initialize(pokemon), {
        rollout: null,
        furyCutter: null,
        rage: false,
        bide: null
    });
});

test("resetFuryCutter initializes state for a previously unseen Pokémon", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    assert.deepEqual(service.resetFuryCutter(pokemon), { success: true });
    assert.equal(service.initialize(pokemon).furyCutter, null);
});

test("resetRage initializes state for a previously unseen Pokémon", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    assert.deepEqual(service.resetRage(pokemon), { success: true });
    assert.equal(service.isRageActive(pokemon), false);
});

test("releaseBide initializes state for a previously unseen Pokémon", () => {
    const service = new MoveStateService();
    const pokemon = makePokemon("pokemon-1");

    assert.equal(service.releaseBide(pokemon), 0);
    assert.deepEqual(service.initialize(pokemon), {
        rollout: null,
        furyCutter: null,
        rage: false,
        bide: null
    });
});

"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const ItemEffectService = require(
    "../scripts/services/item-effect-service"
);

function createPokemon(overrides = {}) {
    return {
        species: "Bulbasaur",
        hp: 30,
        maxHP: 100,
        status: null,
        statusTurns: 0,
        statusData: null,
        moves: [
            createMove()
        ],
        ...overrides
    };
}

function createMove(overrides = {}) {
    return {
        constant: "MOVE_TACKLE",
        name: "Tackle",
        currentPP: 5,
        maxPP: 35,
        ppUps: 0,
        applyPPUp() {
            const previousPPUps = this.ppUps;
            const previousMaxPP = this.maxPP;

            if (this.ppUps >= 3) {
                return {
                    success: false,
                    reason: "PP Up limit reached"
                };
            }

            this.ppUps++;
            this.maxPP++;

            return {
                success: true,
                previousPPUps,
                ppUps: this.ppUps,
                previousMaxPP,
                maxPP: this.maxPP,
                increase: this.maxPP - previousMaxPP
            };
        },
        applyPPMax() {
            const previousPPUps = this.ppUps;
            const previousMaxPP = this.maxPP;

            if (this.ppUps >= 3) {
                return {
                    success: false,
                    reason: "PP is already maximized"
                };
            }

            this.ppUps = 3;
            this.maxPP = 56;

            return {
                success: true,
                previousPPUps,
                ppUps: this.ppUps,
                previousMaxPP,
                maxPP: this.maxPP,
                increase: this.maxPP - previousMaxPP
            };
        },
        ...overrides
    };
}

function createFriendshipService({
    friendship = 70,
    changeResult = null
} = {}) {
    const calls = {
        getFriendship: [],
        changeFriendship: []
    };

    const service = {
        getFriendship(pokemon) {
            calls.getFriendship.push(pokemon);
            return friendship;
        },

        changeFriendship(pokemon, amount, options = {}) {
            calls.changeFriendship.push({
                pokemon,
                amount,
                options
            });

            if (changeResult) {
                return changeResult;
            }

            return {
                success: true,
                previousFriendship: friendship,
                change: amount,
                friendship: Math.max(
                    0,
                    Math.min(255, friendship + amount)
                )
            };
        },

        getTierFromValue(value) {
            if (value < 100) return "LOW";
            if (value < 200) return "MID";
            return "HIGH";
        }
    };

    return { service, calls };
}

function createStatStageService({
    stage = 0,
    increaseResult = null,
    maxStage = 6
} = {}) {
    const calls = {
        getStage: [],
        increase: []
    };

    const service = {
        maxStage,

        getStage(pokemon, stat) {
            calls.getStage.push({ pokemon, stat });
            return stage;
        },

        increase(pokemon, stat, amount) {
            calls.increase.push({ pokemon, stat, amount });

            return increaseResult || {
                success: true,
                stage: Math.min(maxStage, stage + amount)
            };
        }
    };

    return { service, calls };
}

function createStatusService() {
    const calls = [];

    return {
        calls,

        removeStatus(pokemon) {
            calls.push(pokemon);
            pokemon.status = null;
            pokemon.statusTurns = 0;
            pokemon.statusData = null;

            return { success: true };
        }
    };
}

function friendshipEffect(overrides = {}) {
    return {
        type: "FRIENDSHIP_CHANGE",
        low: 5,
        mid: 3,
        high: 2,
        ...overrides
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor stores all supplied dependencies", () => {
    const status = {};
    const friendship = {};
    const statStage = {};

    const service = new ItemEffectService(
        status,
        friendship,
        statStage
    );

    assert.strictEqual(service.status, status);
    assert.strictEqual(service.friendship, friendship);
    assert.strictEqual(service.statStage, statStage);
});

test("constructor defaults all dependencies to null", () => {
    const service = new ItemEffectService();

    assert.equal(service.status, null);
    assert.equal(service.friendship, null);
    assert.equal(service.statStage, null);
});

// --------------------------------------------------
// Main use dispatcher
// --------------------------------------------------

test("use rejects missing item behavior", () => {
    const service = new ItemEffectService();

    assert.deepEqual(service.use(null, createPokemon()), {
        success: false,
        reason: "Missing item behavior"
    });
});

test("use rejects a missing Pokémon", () => {
    const service = new ItemEffectService();

    assert.deepEqual(service.use({ behavior: "HEAL_HP" }, null), {
        success: false,
        reason: "Missing Pokemon"
    });
});

test("use rejects unsupported behaviors", () => {
    const service = new ItemEffectService();

    assert.deepEqual(
        service.use(
            { behavior: "UNKNOWN_BEHAVIOR" },
            createPokemon()
        ),
        {
            success: false,
            reason: "Unsupported item behavior: UNKNOWN_BEHAVIOR"
        }
    );
});

test("use requires a party for REVIVE_ALL", () => {
    const service = new ItemEffectService();

    assert.deepEqual(
        service.use(
            { behavior: "REVIVE_ALL", amount: "HALF_MAX_HP" },
            createPokemon()
        ),
        {
            success: false,
            reason: "REVIVE_ALL requires a party",
            behavior: "REVIVE_ALL"
        }
    );
});

test("use returns a failed primary effect without applying friendship", () => {
    const { service: friendship } = createFriendshipService();
    const itemService = new ItemEffectService(null, friendship);

    const pokemon = createPokemon({ hp: 100 });

    const result = itemService.use(
        {
            behavior: "HEAL_HP",
            amount: 20,
            effects: [friendshipEffect()]
        },
        pokemon
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Pokemon already has full HP");
});

// --------------------------------------------------
// HP healing
// --------------------------------------------------

test("healHP restores a fixed amount of HP", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ hp: 30 });

    const result = service.healHP(
        { behavior: "HEAL_HP", amount: 20 },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(result.previousHP, 30);
    assert.equal(result.healed, 20);
    assert.equal(result.hp, 50);
    assert.equal(pokemon.hp, 50);
    assert.equal(result.maxHP, 100);
});

test("healHP supports FULL healing", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ hp: 25 });

    const result = service.healHP(
        { behavior: "HEAL_HP", amount: "FULL" },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(result.healed, 75);
    assert.equal(pokemon.hp, 100);
});

test("healHP does not exceed maximum HP", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ hp: 90 });

    const result = service.healHP(
        { behavior: "HEAL_HP", amount: 50 },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(result.healed, 10);
    assert.equal(pokemon.hp, 100);
});

test("healHP rejects invalid maximum HP", () => {
    const service = new ItemEffectService();

    const result = service.healHP(
        { behavior: "HEAL_HP", amount: 20 },
        createPokemon({ maxHP: 0 })
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid maximum HP");
});

test("healHP rejects fainted Pokémon", () => {
    const service = new ItemEffectService();

    const result = service.healHP(
        { behavior: "HEAL_HP", amount: 20 },
        createPokemon({ hp: 0 })
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Cannot use HP medicine on a fainted Pokemon"
    );
});

test("healHP rejects Pokémon already at full HP", () => {
    const service = new ItemEffectService();

    const result = service.healHP(
        { behavior: "HEAL_HP", amount: 20 },
        createPokemon({ hp: 100 })
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Pokemon already has full HP");
});

test("healHP rejects invalid healing amounts", () => {
    const service = new ItemEffectService();

    const result = service.healHP(
        { behavior: "HEAL_HP", amount: -1 },
        createPokemon({ hp: 30 })
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid healing amount");
});

test("healHP does not mutate Pokémon when healing fails", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ hp: 30 });

    const result = service.healHP(
        { behavior: "HEAL_HP", amount: 0 },
        pokemon
    );

    assert.equal(result.success, false);
    assert.equal(pokemon.hp, 30);
});

test("use dispatches HEAL_HP", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ hp: 30 });

    const result = service.use(
        { behavior: "HEAL_HP", amount: 15 },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.hp, 45);
});

test("resolveHealAmount resolves FULL to maximum HP", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveHealAmount("FULL", 100), 100);
});

test("resolveHealAmount accepts numeric strings", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveHealAmount("25", 100), 25);
});

test("resolveHealAmount returns zero for negative values", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveHealAmount(-1, 100), 0);
});

test("resolveHealAmount returns zero for invalid values", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveHealAmount("invalid", 100), 0);
});

// --------------------------------------------------
// Move-slot lookup and PP helpers
// --------------------------------------------------

test("getMoveSlot returns null when Pokémon is missing", () => {
    const service = new ItemEffectService();

    assert.equal(service.getMoveSlot(null, "MOVE_TACKLE"), null);
});

test("getMoveSlot returns null when moves are not an array", () => {
    const service = new ItemEffectService();

    assert.equal(
        service.getMoveSlot({ moves: "TACKLE" }, "MOVE_TACKLE"),
        null
    );
});

test("getMoveSlot returns null when move is missing", () => {
    const service = new ItemEffectService();

    assert.equal(
        service.getMoveSlot(createPokemon(), null),
        null
    );
});

test("getMoveSlot returns the exact move object when present", () => {
    const service = new ItemEffectService();
    const move = createMove();
    const pokemon = createPokemon({ moves: [move] });

    assert.strictEqual(service.getMoveSlot(pokemon, move), move);
});

test("getMoveSlot resolves a move by its constant string", () => {
    const service = new ItemEffectService();
    const move = createMove();
    const pokemon = createPokemon({ moves: [move] });

    assert.strictEqual(
        service.getMoveSlot(pokemon, "MOVE_TACKLE"),
        move
    );
});

test("getMoveSlot resolves an object containing a move constant", () => {
    const service = new ItemEffectService();
    const move = createMove();
    const pokemon = createPokemon({ moves: [move] });

    assert.strictEqual(
        service.getMoveSlot(pokemon, { constant: "MOVE_TACKLE" }),
        move
    );
});

test("getMoveSlot returns null for an unknown move", () => {
    const service = new ItemEffectService();

    assert.equal(
        service.getMoveSlot(createPokemon(), "MOVE_UNKNOWN"),
        null
    );
});

test("getMoveCurrentPP reads currentPP", () => {
    const service = new ItemEffectService();

    assert.equal(
        service.getMoveCurrentPP({ currentPP: 8, pp: 2 }),
        8
    );
});

test("getMoveCurrentPP supports the legacy pp property", () => {
    const service = new ItemEffectService();

    assert.equal(service.getMoveCurrentPP({ pp: 7 }), 7);
});

test("getMoveCurrentPP returns zero for negative PP", () => {
    const service = new ItemEffectService();

    assert.equal(service.getMoveCurrentPP({ currentPP: -5 }), 0);
});

test("getMoveCurrentPP returns zero for missing PP", () => {
    const service = new ItemEffectService();

    assert.equal(service.getMoveCurrentPP({}), 0);
});

test("getMoveCurrentPP returns zero for a missing move", () => {
    const service = new ItemEffectService();

    assert.equal(service.getMoveCurrentPP(null), 0);
});

test("getMoveMaxPP reads maxPP", () => {
    const service = new ItemEffectService();

    assert.equal(service.getMoveMaxPP({ maxPP: 25 }), 25);
});

test("getMoveMaxPP returns zero for negative maximum PP", () => {
    const service = new ItemEffectService();

    assert.equal(service.getMoveMaxPP({ maxPP: -1 }), 0);
});

test("getMoveMaxPP returns zero for missing move", () => {
    const service = new ItemEffectService();

    assert.equal(service.getMoveMaxPP(null), 0);
});

test("setMoveCurrentPP updates the currentPP property when present", () => {
    const service = new ItemEffectService();
    const move = { currentPP: 5, pp: 2 };

    service.setMoveCurrentPP(move, 9);

    assert.equal(move.currentPP, 9);
    assert.equal(move.pp, 2);
});

test("setMoveCurrentPP supports legacy pp-only moves", () => {
    const service = new ItemEffectService();
    const move = { pp: 2 };

    service.setMoveCurrentPP(move, 9);

    assert.equal(move.pp, 9);
});

test("setMoveCurrentPP does not set negative PP", () => {
    const service = new ItemEffectService();
    const move = { currentPP: 5 };

    service.setMoveCurrentPP(move, -10);

    assert.equal(move.currentPP, 0);
});

// --------------------------------------------------
// PP restoration
// --------------------------------------------------

test("healPPOne rejects a missing move", () => {
    const service = new ItemEffectService();

    assert.deepEqual(
        service.healPPOne(
            { behavior: "HEAL_PP_ONE", amount: 10 },
            createPokemon(),
            null
        ),
        {
            success: false,
            reason: "No move selected"
        }
    );
});

test("healPPOne rejects a move the Pokémon does not know", () => {
    const service = new ItemEffectService();

    const result = service.healPPOne(
        { behavior: "HEAL_PP_ONE", amount: 10 },
        createPokemon(),
        "MOVE_UNKNOWN"
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Move not known by Pokemon");
});

test("healPPOne restores a fixed amount of PP", () => {
    const service = new ItemEffectService();
    const move = createMove({ currentPP: 5, maxPP: 35 });
    const pokemon = createPokemon({ moves: [move] });

    const result = service.healPPOne(
        { behavior: "HEAL_PP_ONE", amount: 10 },
        pokemon,
        move
    );

    assert.equal(result.success, true);
    assert.equal(result.previousPP, 5);
    assert.equal(result.restored, 10);
    assert.equal(result.currentPP, 15);
    assert.equal(move.currentPP, 15);
});

test("healPPOne supports FULL PP restoration", () => {
    const service = new ItemEffectService();
    const move = createMove({ currentPP: 5, maxPP: 35 });
    const pokemon = createPokemon({ moves: [move] });

    const result = service.healPPOne(
        { behavior: "HEAL_PP_ONE", amount: "FULL" },
        pokemon,
        move
    );

    assert.equal(result.success, true);
    assert.equal(move.currentPP, 35);
});

test("healPPOne does not exceed maximum PP", () => {
    const service = new ItemEffectService();
    const move = createMove({ currentPP: 33, maxPP: 35 });
    const pokemon = createPokemon({ moves: [move] });

    const result = service.healPPOne(
        { behavior: "HEAL_PP_ONE", amount: 10 },
        pokemon,
        move
    );

    assert.equal(result.success, true);
    assert.equal(result.restored, 2);
    assert.equal(move.currentPP, 35);
});

test("healPPOne rejects invalid maximum PP", () => {
    const service = new ItemEffectService();
    const move = createMove({ currentPP: 0, maxPP: 0 });
    const pokemon = createPokemon({ moves: [move] });

    const result = service.healPPOne(
        { behavior: "HEAL_PP_ONE", amount: 10 },
        pokemon,
        move
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid maximum PP");
});

test("healPPOne rejects a move that already has full PP", () => {
    const service = new ItemEffectService();
    const move = createMove({ currentPP: 35, maxPP: 35 });
    const pokemon = createPokemon({ moves: [move] });

    const result = service.healPPOne(
        { behavior: "HEAL_PP_ONE", amount: 10 },
        pokemon,
        move
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Move already has full PP");
});

test("healPPOne rejects an invalid recovery amount", () => {
    const service = new ItemEffectService();
    const move = createMove({ currentPP: 5, maxPP: 35 });
    const pokemon = createPokemon({ moves: [move] });

    const result = service.healPPOne(
        { behavior: "HEAL_PP_ONE", amount: -1 },
        pokemon,
        move
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid PP recovery amount");
});

test("use dispatches HEAL_PP_ONE", () => {
    const service = new ItemEffectService();
    const move = createMove({ currentPP: 5 });
    const pokemon = createPokemon({ moves: [move] });

    const result = service.use(
        { behavior: "HEAL_PP_ONE", amount: 5 },
        pokemon,
        move
    );

    assert.equal(result.success, true);
    assert.equal(move.currentPP, 10);
});

test("healPPAll rejects Pokémon without a moves array", () => {
    const service = new ItemEffectService();

    const result = service.healPPAll(
        { behavior: "HEAL_PP_ALL", amount: 10 },
        createPokemon({ moves: undefined })
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Pokemon has no moves");
});

test("healPPAll rejects when every move has full PP", () => {
    const service = new ItemEffectService();
    const move = createMove({ currentPP: 35, maxPP: 35 });

    const result = service.healPPAll(
        { behavior: "HEAL_PP_ALL", amount: 10 },
        createPokemon({ moves: [move] })
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "All moves already have full PP");
    assert.equal(result.restoredCount, 0);
});

test("healPPAll restores PP across multiple moves", () => {
    const service = new ItemEffectService();
    const first = createMove({
        constant: "MOVE_TACKLE",
        currentPP: 5,
        maxPP: 35
    });
    const second = createMove({
        constant: "MOVE_GROWL",
        currentPP: 10,
        maxPP: 40
    });
    const full = createMove({
        constant: "MOVE_VINE_WHIP",
        currentPP: 25,
        maxPP: 25
    });

    const result = service.healPPAll(
        { behavior: "HEAL_PP_ALL", amount: 10 },
        createPokemon({ moves: [first, second, full] })
    );

    assert.equal(result.success, true);
    assert.equal(result.restoredCount, 2);
    assert.equal(first.currentPP, 15);
    assert.equal(second.currentPP, 20);
    assert.equal(full.currentPP, 25);
});

test("healPPAll supports FULL PP restoration", () => {
    const service = new ItemEffectService();
    const move = createMove({ currentPP: 1, maxPP: 35 });

    const result = service.healPPAll(
        { behavior: "HEAL_PP_ALL", amount: "FULL" },
        createPokemon({ moves: [move] })
    );

    assert.equal(result.success, true);
    assert.equal(move.currentPP, 35);
});

test("healPPAll reports failure when no PP can be restored", () => {
    const service = new ItemEffectService();
    const move = createMove({ currentPP: 5, maxPP: 35 });

    const result = service.healPPAll(
        { behavior: "HEAL_PP_ALL", amount: 0 },
        createPokemon({ moves: [move] })
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "No PP could be restored");
    assert.equal(move.currentPP, 5);
});

test("use dispatches HEAL_PP_ALL", () => {
    const service = new ItemEffectService();
    const move = createMove({ currentPP: 1, maxPP: 35 });
    const pokemon = createPokemon({ moves: [move] });

    const result = service.use(
        { behavior: "HEAL_PP_ALL", amount: 5 },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(move.currentPP, 6);
});

test("resolvePPAmount resolves FULL to maximum PP", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolvePPAmount("FULL", 35), 35);
});

test("resolvePPAmount accepts numeric strings", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolvePPAmount("10", 35), 10);
});

test("resolvePPAmount returns zero for invalid amounts", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolvePPAmount("invalid", 35), 0);
    assert.equal(service.resolvePPAmount(-1, 35), 0);
});

// --------------------------------------------------
// PP Up and PP Max
// --------------------------------------------------

test("applyPPUp rejects a missing move", () => {
    const service = new ItemEffectService();

    assert.equal(
        service.applyPPUp(
            { behavior: "PP_UP" },
            createPokemon(),
            null
        ).reason,
        "No move selected"
    );
});

test("applyPPUp rejects a move not known by Pokémon", () => {
    const service = new ItemEffectService();

    const result = service.applyPPUp(
        { behavior: "PP_UP" },
        createPokemon(),
        "MOVE_UNKNOWN"
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Move not known by Pokemon");
});

test("applyPPUp rejects move slots without PP Up support", () => {
    const service = new ItemEffectService();
    const move = createMove({ applyPPUp: undefined });
    const pokemon = createPokemon({ moves: [move] });

    const result = service.applyPPUp(
        { behavior: "PP_UP" },
        pokemon,
        move
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Move does not support PP Up");
});

test("applyPPUp returns the updated PP Up data", () => {
    const service = new ItemEffectService();
    const move = createMove();
    const pokemon = createPokemon({ moves: [move] });

    const result = service.applyPPUp(
        { behavior: "PP_UP" },
        pokemon,
        move
    );

    assert.equal(result.success, true);
    assert.equal(result.behavior, "PP_UP");
    assert.equal(result.previousPPUps, 0);
    assert.equal(result.ppUps, 1);
    assert.equal(result.previousMaxPP, 35);
    assert.equal(result.maxPP, 36);
    assert.strictEqual(result.move, move);
});

test("applyPPUp returns an underlying move failure", () => {
    const service = new ItemEffectService();
    const move = createMove({
        applyPPUp() {
            return {
                success: false,
                reason: "Cannot use another PP Up"
            };
        }
    });

    const result = service.applyPPUp(
        { behavior: "PP_UP" },
        createPokemon({ moves: [move] }),
        move
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Cannot use another PP Up");
});

test("use dispatches PP_UP", () => {
    const service = new ItemEffectService();
    const move = createMove();
    const result = service.use(
        { behavior: "PP_UP" },
        createPokemon({ moves: [move] }),
        move
    );

    assert.equal(result.success, true);
    assert.equal(result.behavior, "PP_UP");
});

test("applyPPMax rejects a missing move", () => {
    const service = new ItemEffectService();

    assert.equal(
        service.applyPPMax(
            { behavior: "PP_MAX" },
            createPokemon(),
            null
        ).reason,
        "No move selected"
    );
});

test("applyPPMax rejects a move not known by Pokémon", () => {
    const service = new ItemEffectService();

    const result = service.applyPPMax(
        { behavior: "PP_MAX" },
        createPokemon(),
        "MOVE_UNKNOWN"
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Move not known by Pokemon");
});

test("applyPPMax rejects move slots without PP Max support", () => {
    const service = new ItemEffectService();
    const move = createMove({ applyPPMax: undefined });

    const result = service.applyPPMax(
        { behavior: "PP_MAX" },
        createPokemon({ moves: [move] }),
        move
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Move does not support PP Max");
});

test("applyPPMax returns the updated PP Max data", () => {
    const service = new ItemEffectService();
    const move = createMove();
    const pokemon = createPokemon({ moves: [move] });

    const result = service.applyPPMax(
        { behavior: "PP_MAX" },
        pokemon,
        move
    );

    assert.equal(result.success, true);
    assert.equal(result.behavior, "PP_MAX");
    assert.equal(result.ppUps, 3);
    assert.equal(result.maxPP, 56);
    assert.strictEqual(result.move, move);
});

test("applyPPMax returns an underlying move failure", () => {
    const service = new ItemEffectService();
    const move = createMove({
        applyPPMax() {
            return {
                success: false,
                reason: "PP already maximized"
            };
        }
    });

    const result = service.applyPPMax(
        { behavior: "PP_MAX" },
        createPokemon({ moves: [move] }),
        move
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "PP already maximized");
});

test("use dispatches PP_MAX", () => {
    const service = new ItemEffectService();
    const move = createMove();

    const result = service.use(
        { behavior: "PP_MAX" },
        createPokemon({ moves: [move] }),
        move
    );

    assert.equal(result.success, true);
    assert.equal(result.behavior, "PP_MAX");
});

// --------------------------------------------------
// Status curing
// --------------------------------------------------

test("cureStatus rejects Pokémon without a status", () => {
    const service = new ItemEffectService();

    const result = service.cureStatus(
        { behavior: "CURE_STATUS", status: "POISON" },
        createPokemon({ status: null })
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Pokemon has no status condition");
});

test("cureStatus rejects a status mismatch", () => {
    const service = new ItemEffectService();

    const result = service.cureStatus(
        { behavior: "CURE_STATUS", status: "POISON" },
        createPokemon({ status: "BURN" })
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Pokemon does not have POISON");
});

test("cureStatus clears the matching status", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({
        status: "POISON",
        statusTurns: 4,
        statusData: { turns: 4 }
    });

    const result = service.cureStatus(
        { behavior: "CURE_STATUS", status: "POISON" },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(result.previousStatus, "POISON");
    assert.equal(result.status, null);
    assert.equal(pokemon.status, null);
    assert.equal(pokemon.statusTurns, 0);
    assert.equal(pokemon.statusData, null);
});

test("cureStatus supports the ALL status selector", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ status: "BURN" });

    const result = service.cureStatus(
        { behavior: "CURE_STATUS", status: "ALL" },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.status, null);
});

test("cureStatus delegates to the injected status service", () => {
    const status = createStatusService();
    const service = new ItemEffectService(status);
    const pokemon = createPokemon({ status: "PARALYSIS" });

    const result = service.cureStatus(
        { behavior: "CURE_STATUS", status: "PARALYSIS" },
        pokemon
    );

    assert.equal(result.success, true);
    assert.deepEqual(status.calls, [pokemon]);
});

test("use dispatches CURE_STATUS", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ status: "BURN" });

    const result = service.use(
        { behavior: "CURE_STATUS", status: "BURN" },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.status, null);
});

// --------------------------------------------------
// Full Restore behavior
// --------------------------------------------------

test("healHPAndCureStatus restores HP and clears status", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({
        hp: 40,
        status: "BURN",
        statusTurns: 2,
        statusData: { turns: 2 }
    });

    const result = service.healHPAndCureStatus(
        { behavior: "HEAL_HP_AND_CURE_STATUS" },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(result.previousHP, 40);
    assert.equal(result.hp, 100);
    assert.equal(result.previousStatus, "BURN");
    assert.equal(result.status, null);
    assert.equal(pokemon.status, null);
});

test("healHPAndCureStatus rejects invalid maximum HP", () => {
    const service = new ItemEffectService();

    const result = service.healHPAndCureStatus(
        { behavior: "HEAL_HP_AND_CURE_STATUS" },
        createPokemon({ maxHP: 0 })
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid maximum HP");
});

test("healHPAndCureStatus rejects fainted Pokémon", () => {
    const service = new ItemEffectService();

    const result = service.healHPAndCureStatus(
        { behavior: "HEAL_HP_AND_CURE_STATUS" },
        createPokemon({ hp: 0 })
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Cannot use Full Restore on a fainted Pokemon"
    );
});

test("healHPAndCureStatus rejects full HP without status", () => {
    const service = new ItemEffectService();

    const result = service.healHPAndCureStatus(
        { behavior: "HEAL_HP_AND_CURE_STATUS" },
        createPokemon({ hp: 100, status: null })
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Pokemon already has full HP and no status condition"
    );
});

test("healHPAndCureStatus heals a status-afflicted Pokémon at full HP", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({
        hp: 100,
        status: "POISON"
    });

    const result = service.healHPAndCureStatus(
        { behavior: "HEAL_HP_AND_CURE_STATUS" },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(result.previousHP, 100);
    assert.equal(pokemon.status, null);
});

test("use dispatches HEAL_HP_AND_CURE_STATUS", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({
        hp: 40,
        status: "BURN"
    });

    const result = service.use(
        { behavior: "HEAL_HP_AND_CURE_STATUS" },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.hp, 100);
    assert.equal(pokemon.status, null);
});

// --------------------------------------------------
// Revival
// --------------------------------------------------

test("revive rejects invalid maximum HP", () => {
    const service = new ItemEffectService();

    const result = service.revive(
        { behavior: "REVIVE", amount: "HALF_MAX_HP" },
        createPokemon({ hp: 0, maxHP: 0 })
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid maximum HP");
});

test("revive rejects a Pokémon that is not fainted", () => {
    const service = new ItemEffectService();

    const result = service.revive(
        { behavior: "REVIVE", amount: "HALF_MAX_HP" },
        createPokemon({ hp: 10 })
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Pokemon is not fainted");
});

test("revive restores half maximum HP", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ hp: 0 });

    const result = service.revive(
        { behavior: "REVIVE", amount: "HALF_MAX_HP" },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(result.revivedHP, 50);
    assert.equal(pokemon.hp, 50);
});

test("revive supports FULL revival", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ hp: 0 });

    const result = service.revive(
        { behavior: "REVIVE", amount: "FULL" },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(result.revivedHP, 100);
    assert.equal(pokemon.hp, 100);
});

test("revive supports a fixed revival amount", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ hp: 0 });

    const result = service.revive(
        { behavior: "REVIVE", amount: 20 },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(result.revivedHP, 20);
    assert.equal(pokemon.hp, 20);
});

test("revive does not restore above maximum HP", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ hp: 0 });

    const result = service.revive(
        { behavior: "REVIVE", amount: 200 },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.hp, 100);
});

test("revive rejects an invalid revival amount", () => {
    const service = new ItemEffectService();

    const result = service.revive(
        { behavior: "REVIVE", amount: -1 },
        createPokemon({ hp: 0 })
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid revival amount");
});

test("revive removes status effects from the revived Pokémon", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({
        hp: 0,
        status: "POISON",
        statusTurns: 3,
        statusData: { turns: 3 }
    });

    const result = service.revive(
        { behavior: "REVIVE", amount: "HALF_MAX_HP" },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.status, null);
    assert.equal(pokemon.statusTurns, 0);
    assert.equal(pokemon.statusData, null);
});

test("use dispatches REVIVE", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ hp: 0 });

    const result = service.use(
        { behavior: "REVIVE", amount: "HALF_MAX_HP" },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.hp, 50);
});

test("resolveReviveAmount resolves FULL", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveReviveAmount("FULL", 100), 100);
});

test("resolveReviveAmount resolves HALF_MAX_HP", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveReviveAmount("HALF_MAX_HP", 101), 50);
});

test("resolveReviveAmount caps numeric values at maximum HP", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveReviveAmount(150, 100), 100);
});

test("resolveReviveAmount returns zero for invalid values", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveReviveAmount(-1, 100), 0);
    assert.equal(service.resolveReviveAmount("invalid", 100), 0);
});

// --------------------------------------------------
// Party-wide revival
// --------------------------------------------------

test("useOnParty rejects missing behavior", () => {
    const service = new ItemEffectService();

    assert.deepEqual(service.useOnParty(null, []), {
        success: false,
        reason: "Missing item behavior"
    });
});

test("useOnParty rejects a non-array party", () => {
    const service = new ItemEffectService();

    assert.deepEqual(
        service.useOnParty(
            { behavior: "REVIVE_ALL", amount: "HALF_MAX_HP" },
            null
        ),
        {
            success: false,
            reason: "Party must be an array"
        }
    );
});

test("useOnParty rejects unsupported party behaviors", () => {
    const service = new ItemEffectService();

    const result = service.useOnParty(
        { behavior: "HEAL_HP" },
        [createPokemon()]
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Unsupported party item behavior: HEAL_HP"
    );
});

test("reviveAll rejects a party with no fainted Pokémon", () => {
    const service = new ItemEffectService();

    const result = service.reviveAll(
        { behavior: "REVIVE_ALL", amount: "HALF_MAX_HP" },
        [createPokemon({ hp: 10 }), createPokemon({ hp: 30 })]
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "No fainted Pokemon in party");
    assert.equal(result.revivedCount, 0);
});

test("reviveAll revives every fainted Pokémon", () => {
    const service = new ItemEffectService();
    const first = createPokemon({ species: "Bulbasaur", hp: 0 });
    const second = createPokemon({ species: "Charmander", hp: 0 });
    const living = createPokemon({ species: "Squirtle", hp: 10 });
    const party = [first, second, living];

    const result = service.reviveAll(
        {
            behavior: "REVIVE_ALL",
            amount: "HALF_MAX_HP",
            scope: "PARTY"
        },
        party
    );

    assert.equal(result.success, true);
    assert.equal(result.revivedCount, 2);
    assert.equal(result.partySize, 3);
    assert.equal(first.hp, 50);
    assert.equal(second.hp, 50);
    assert.equal(living.hp, 10);
});

test("reviveAll preserves the identity of revived Pokémon", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ hp: 0 });

    const result = service.reviveAll(
        { behavior: "REVIVE_ALL", amount: "FULL" },
        [pokemon]
    );

    assert.strictEqual(result.revived[0].pokemon, pokemon);
});

test("reviveAll clears status conditions from revived Pokémon", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({
        hp: 0,
        status: "BURN",
        statusTurns: 2,
        statusData: { turns: 2 }
    });

    const result = service.reviveAll(
        { behavior: "REVIVE_ALL", amount: "HALF_MAX_HP" },
        [pokemon]
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.status, null);
    assert.equal(pokemon.statusTurns, 0);
    assert.equal(pokemon.statusData, null);
});

test("reviveAll skips fainted Pokémon with invalid maximum HP", () => {
    const service = new ItemEffectService();
    const invalid = createPokemon({ hp: 0, maxHP: 0 });

    const result = service.reviveAll(
        { behavior: "REVIVE_ALL", amount: "FULL" },
        [invalid]
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "No valid fainted Pokemon could be revived"
    );
});

test("reviveAll defaults the scope to PARTY", () => {
    const service = new ItemEffectService();

    const result = service.reviveAll(
        { behavior: "REVIVE_ALL", amount: "FULL" },
        [createPokemon({ hp: 0 })]
    );

    assert.equal(result.success, true);
    assert.equal(result.scope, "PARTY");
});

test("useOnParty dispatches REVIVE_ALL", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({ hp: 0 });

    const result = service.useOnParty(
        { behavior: "REVIVE_ALL", amount: "HALF_MAX_HP" },
        [pokemon]
    );

    assert.equal(result.success, true);
    assert.equal(pokemon.hp, 50);
});

// --------------------------------------------------
// Status helper and HP getters
// --------------------------------------------------

test("removeStatus uses the supplied status service", () => {
    const status = createStatusService();
    const service = new ItemEffectService(status);
    const pokemon = createPokemon({ status: "POISON" });

    const result = service.removeStatus(pokemon);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(status.calls, [pokemon]);
    assert.equal(pokemon.status, null);
});

test("removeStatus falls back to clearing the Pokémon status", () => {
    const service = new ItemEffectService();
    const pokemon = createPokemon({
        status: "BURN",
        statusTurns: 4,
        statusData: { turns: 4 }
    });

    const result = service.removeStatus(pokemon);

    assert.deepEqual(result, { success: true });
    assert.equal(pokemon.status, null);
    assert.equal(pokemon.statusTurns, 0);
    assert.equal(pokemon.statusData, null);
});

test("getCurrentHP returns valid HP", () => {
    const service = new ItemEffectService();

    assert.equal(service.getCurrentHP({ hp: 45 }), 45);
});

test("getCurrentHP returns zero for invalid or negative HP", () => {
    const service = new ItemEffectService();

    assert.equal(service.getCurrentHP({ hp: -1 }), 0);
    assert.equal(service.getCurrentHP({ hp: "invalid" }), 0);
});

test("getMaxHP returns valid maximum HP", () => {
    const service = new ItemEffectService();

    assert.equal(service.getMaxHP({ maxHP: 100 }), 100);
});

test("getMaxHP returns zero for invalid maximum HP", () => {
    const service = new ItemEffectService();

    assert.equal(service.getMaxHP({ maxHP: -1 }), 0);
    assert.equal(service.getMaxHP({ maxHP: "invalid" }), 0);
});

// --------------------------------------------------
// Friendship changes
// --------------------------------------------------

test("applyFriendshipEffects returns null when no effects exist", () => {
    const service = new ItemEffectService();

    assert.equal(
        service.applyFriendshipEffects(
            { behavior: "HEAL_HP" },
            createPokemon()
        ),
        null
    );
});

test("applyFriendshipEffects returns null without friendship effect", () => {
    const service = new ItemEffectService();

    assert.equal(
        service.applyFriendshipEffects(
            {
                behavior: "HEAL_HP",
                effects: [{ type: "OTHER_EFFECT" }]
            },
            createPokemon()
        ),
        null
    );
});

test("applyFriendshipEffects finds the friendship change effect", () => {
    const { service: friendship, calls } = createFriendshipService();
    const service = new ItemEffectService(null, friendship);
    const pokemon = createPokemon();

    const result = service.applyFriendshipEffects(
        {
            behavior: "HEAL_HP",
            effects: [
                { type: "OTHER_EFFECT" },
                friendshipEffect()
            ]
        },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(calls.getFriendship.length, 1);
    assert.equal(calls.changeFriendship.length, 1);
});

test("applyFriendshipEffects returns null for a missing behavior", () => {
    const service = new ItemEffectService();

    assert.equal(
        service.applyFriendshipEffects(null, createPokemon()),
        null
    );
});

test("applyFriendshipChange reports missing friendship service", () => {
    const service = new ItemEffectService();

    const result = service.applyFriendshipChange(
        friendshipEffect(),
        createPokemon()
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Friendship service is not available"
    );
});

test("applyFriendshipChange applies the LOW-tier friendship amount", () => {
    const { service: friendship, calls } = createFriendshipService({
        friendship: 50
    });

    const service = new ItemEffectService(null, friendship);

    const result = service.applyFriendshipChange(
        friendshipEffect({ low: 5, mid: 3, high: 2 }),
        createPokemon()
    );

    assert.equal(result.success, true);
    assert.equal(result.requestedChange, 5);
    assert.equal(result.friendship, 55);
    assert.equal(calls.changeFriendship[0].amount, 5);
});

test("applyFriendshipChange applies the MID-tier friendship amount", () => {
    const { service: friendship } = createFriendshipService({
        friendship: 150
    });

    const service = new ItemEffectService(null, friendship);

    const result = service.applyFriendshipChange(
        friendshipEffect({ low: 5, mid: 3, high: 2 }),
        createPokemon()
    );

    assert.equal(result.success, true);
    assert.equal(result.requestedChange, 3);
});

test("applyFriendshipChange applies the HIGH-tier friendship amount", () => {
    const { service: friendship } = createFriendshipService({
        friendship: 220
    });

    const service = new ItemEffectService(null, friendship);

    const result = service.applyFriendshipChange(
        friendshipEffect({ low: 5, mid: 3, high: 2 }),
        createPokemon()
    );

    assert.equal(result.success, true);
    assert.equal(result.requestedChange, 2);
});

test("applyFriendshipChange forwards options to FriendshipService", () => {
    const { service: friendship, calls } = createFriendshipService();
    const service = new ItemEffectService(null, friendship);
    const pokemon = createPokemon();
    const options = { metLocationBonus: true };

    service.applyFriendshipChange(friendshipEffect(), pokemon, options);

    assert.strictEqual(calls.changeFriendship[0].options, options);
});

test("applyFriendshipChange preserves a failed friendship result", () => {
    const failure = {
        success: false,
        reason: "Friendship change rejected"
    };

    const { service: friendship } = createFriendshipService({
        changeResult: failure
    });

    const service = new ItemEffectService(null, friendship);

    assert.strictEqual(
        service.applyFriendshipChange(
            friendshipEffect(),
            createPokemon()
        ),
        failure
    );
});

test("use reports failure when the secondary friendship effect fails", () => {
    const { service: friendship } = createFriendshipService({
        changeResult: {
            success: false,
            reason: "Friendship failed"
        }
    });

    const service = new ItemEffectService(null, friendship);
    const pokemon = createPokemon({ hp: 30 });

    const result = service.use(
        {
            behavior: "HEAL_HP",
            amount: 20,
            effects: [friendshipEffect()]
        },
        pokemon
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Friendship failed");
    assert.equal(result.behavior, "HEAL_HP");
    assert.strictEqual(result.pokemon, pokemon);
    assert.equal(result.effect.success, true);
    assert.equal(result.friendship.success, false);
});

test("use includes a successful friendship result when available", () => {
    const { service: friendship } = createFriendshipService();
    const service = new ItemEffectService(null, friendship);
    const pokemon = createPokemon({ hp: 30 });

    const result = service.use(
        {
            behavior: "HEAL_HP",
            amount: 20,
            effects: [friendshipEffect()]
        },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(result.friendship.success, true);
    assert.equal(result.friendship.requestedChange, 5);
});

test("getFriendship uses the friendship service when available", () => {
    const { service: friendship } = createFriendshipService({
        friendship: 155
    });

    const service = new ItemEffectService(null, friendship);

    assert.equal(service.getFriendship(createPokemon()), 155);
});

test("getFriendship falls back to 70", () => {
    const service = new ItemEffectService();

    assert.equal(service.getFriendship(createPokemon()), 70);
});

test("getFriendshipTier delegates to the friendship service", () => {
    const service = new ItemEffectService(null, {
        getTierFromValue(value) {
            return value === 42 ? "CUSTOM" : "OTHER";
        }
    });

    assert.equal(service.getFriendshipTier(42), "CUSTOM");
});

test("getFriendshipTier fallback identifies LOW", () => {
    const service = new ItemEffectService();

    assert.equal(service.getFriendshipTier(50), "LOW");
});

test("getFriendshipTier fallback identifies MID", () => {
    const service = new ItemEffectService();

    assert.equal(service.getFriendshipTier(150), "MID");
});

test("getFriendshipTier fallback identifies HIGH", () => {
    const service = new ItemEffectService();

    assert.equal(service.getFriendshipTier(200), "HIGH");
});

test("resolveFriendshipChange uses tier-specific values", () => {
    const service = new ItemEffectService();

    assert.equal(
        service.resolveFriendshipChange(
            { low: 5, mid: 3, high: 2 },
            50
        ),
        5
    );

    assert.equal(
        service.resolveFriendshipChange(
            { low: 5, mid: 3, high: 2 },
            150
        ),
        3
    );

    assert.equal(
        service.resolveFriendshipChange(
            { low: 5, mid: 3, high: 2 },
            220
        ),
        2
    );
});

test("resolveFriendshipChange falls back to mid when the tier value is missing", () => {
    const service = new ItemEffectService();

    assert.equal(
        service.resolveFriendshipChange(
            { mid: 4, high: 2 },
            50
        ),
        4
    );
});

test("resolveFriendshipChange returns zero when no amount is defined", () => {
    const service = new ItemEffectService();

    assert.equal(
        service.resolveFriendshipChange({}, 50),
        0
    );
});

test("toNumber truncates fractional numbers", () => {
    const service = new ItemEffectService();

    assert.equal(service.toNumber(5.9), 5);
});

test("toNumber returns zero for invalid numbers", () => {
    const service = new ItemEffectService();

    assert.equal(service.toNumber("invalid"), 0);
});

// --------------------------------------------------
// Battle stat-stage effects
// --------------------------------------------------

test("resolveRuntimeStat maps ATTACK", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveRuntimeStat("ATTACK"), "attack");
});

test("resolveRuntimeStat maps DEFENSE", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveRuntimeStat("DEFENSE"), "defense");
});

test("resolveRuntimeStat maps SPEED", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveRuntimeStat("SPEED"), "speed");
});

test("resolveRuntimeStat maps SPECIAL_ATTACK aliases", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveRuntimeStat("SPECIAL_ATTACK"), "spAttack");
    assert.equal(service.resolveRuntimeStat("SP_ATTACK"), "spAttack");
});

test("resolveRuntimeStat maps SPECIAL_DEFENSE aliases", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveRuntimeStat("SPECIAL_DEFENSE"), "spDefense");
    assert.equal(service.resolveRuntimeStat("SP_DEFENSE"), "spDefense");
});

test("resolveRuntimeStat maps ACCURACY and EVASION", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveRuntimeStat("ACCURACY"), "accuracy");
    assert.equal(service.resolveRuntimeStat("EVASION"), "evasion");
});

test("resolveRuntimeStat normalizes whitespace and case", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveRuntimeStat("special attack"), "spAttack");
});

test("resolveRuntimeStat returns null for unknown stats", () => {
    const service = new ItemEffectService();

    assert.equal(service.resolveRuntimeStat("HP"), null);
    assert.equal(service.resolveRuntimeStat(null), null);
});

test("raiseStatStage reports a missing stat-stage service", () => {
    const service = new ItemEffectService();

    const result = service.raiseStatStage(
        {
            behavior: "RAISE_STAT_STAGE",
            stat: "ATTACK",
            stages: 1
        },
        createPokemon()
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Stat stage service is not available"
    );
});

test("raiseStatStage rejects unknown stats", () => {
    const { service: statStage } = createStatStageService();
    const service = new ItemEffectService(null, null, statStage);

    const result = service.raiseStatStage(
        {
            behavior: "RAISE_STAT_STAGE",
            stat: "HP",
            stages: 1
        },
        createPokemon()
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Unknown battle stat: HP");
});

test("raiseStatStage defaults invalid stage amounts to one", () => {
    const { service: statStage, calls } = createStatStageService();
    const service = new ItemEffectService(null, null, statStage);
    const pokemon = createPokemon();

    const result = service.raiseStatStage(
        {
            behavior: "RAISE_STAT_STAGE",
            stat: "ATTACK",
            stages: "invalid"
        },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(calls.increase[0].amount, 1);
});

test("raiseStatStage rejects zero stage increase", () => {
    const { service: statStage } = createStatStageService();
    const service = new ItemEffectService(null, null, statStage);

    const result = service.raiseStatStage(
        {
            behavior: "RAISE_STAT_STAGE",
            stat: "ATTACK",
            stages: 0
        },
        createPokemon()
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid stat stage increase");
});

test("raiseStatStage rejects negative stage increase", () => {
    const { service: statStage } = createStatStageService();
    const service = new ItemEffectService(null, null, statStage);

    const result = service.raiseStatStage(
        {
            behavior: "RAISE_STAT_STAGE",
            stat: "ATTACK",
            stages: -2
        },
        createPokemon()
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid stat stage increase");
});

test("raiseStatStage rejects a stat already at maximum", () => {
    const { service: statStage, calls } = createStatStageService({
        stage: 6
    });

    const service = new ItemEffectService(null, null, statStage);
    const pokemon = createPokemon();

    const result = service.raiseStatStage(
        {
            behavior: "RAISE_STAT_STAGE",
            stat: "ATTACK",
            stages: 1
        },
        pokemon
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "attack is already at maximum stage");
    assert.equal(calls.increase.length, 0);
});

test("raiseStatStage delegates the increase to the stat-stage service", () => {
    const { service: statStage, calls } = createStatStageService({
        stage: 1
    });

    const service = new ItemEffectService(null, null, statStage);
    const pokemon = createPokemon();

    const result = service.raiseStatStage(
        {
            behavior: "RAISE_STAT_STAGE",
            stat: "SPECIAL ATTACK",
            stages: 2
        },
        pokemon
    );

    assert.equal(result.success, true);
    assert.equal(result.stat, "spAttack");
    assert.equal(result.stages, 2);
    assert.equal(result.previousStage, 1);
    assert.equal(result.stage, 3);
    assert.deepEqual(calls.increase, [
        {
            pokemon,
            stat: "spAttack",
            amount: 2
        }
    ]);
});

test("raiseStatStage returns a failed increase result", () => {
    const { service: statStage } = createStatStageService({
        increaseResult: {
            success: false,
            reason: "Stage increase blocked"
        }
    });

    const service = new ItemEffectService(null, null, statStage);

    const result = service.raiseStatStage(
        {
            behavior: "RAISE_STAT_STAGE",
            stat: "ATTACK",
            stages: 1
        },
        createPokemon()
    );

    assert.deepEqual(result, {
        success: false,
        reason: "Stage increase blocked"
    });
});

test("use dispatches RAISE_STAT_STAGE", () => {
    const { service: statStage } = createStatStageService();
    const service = new ItemEffectService(null, null, statStage);

    const result = service.use(
        {
            behavior: "RAISE_STAT_STAGE",
            stat: "SPEED",
            stages: 1
        },
        createPokemon()
    );

    assert.equal(result.success, true);
    assert.equal(result.stat, "speed");
});
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GameSession = require("../scripts/session/game-session");
const InventoryManager = require("../scripts/inventory/inventory-manager");
const InventoryFlow = require("../scripts/inventory/inventory-flow");


function createContext(options = {}) {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    const itemBehaviors =
        Object.prototype.hasOwnProperty.call(options, "itemBehaviors")
            ? options.itemBehaviors
            : {
                ITEM_POTION: {
                    itemConstant: "ITEM_POTION",
                    behavior: "HEAL"
                },
                ITEM_REVIVE: {
                    itemConstant: "ITEM_REVIVE",
                    behavior: "REVIVE"
                },
                ITEM_ETHER: {
                    itemConstant: "ITEM_ETHER",
                    behavior: "RESTORE_PP"
                }
            };

    const defaultEffectService = {
        use(behavior, pokemon, move) {
            return {
                success: true,
                behavior: behavior.behavior,
                pokemon: pokemon.species,
                move: move ? move.constant : null
            };
        },

        useOnParty(behavior, party) {
            return {
                success: true,
                behavior: behavior.behavior,
                revivedCount: 0,
                partySize: party.length
            };
        }
    };

    const itemEffectService =
        Object.prototype.hasOwnProperty.call(
            options,
            "itemEffectService"
        )
            ? options.itemEffectService
            : defaultEffectService;

    const flow = new InventoryFlow(
        inventoryManager,
        itemEffectService,
        itemBehaviors
    );

    return {
        session,
        inventoryManager,
        flow
    };
}


// -------------------------------------
// Basic inventory operations
// -------------------------------------

test("InventoryFlow receives items and updates inventory", () => {
    const { flow, session } = createContext();

    const result = flow.receiveItem("ITEM_POTION", 3);

    assert.equal(result.success, true);
    assert.equal(result.quantity, 3);
    assert.equal(
        session.getState().inventory.ITEM_POTION,
        3
    );
});


test("InventoryFlow records successful item receipts", () => {
    const { flow } = createContext();

    flow.receiveItem("ITEM_POTION", 2);

    assert.deepEqual(flow.getHistory(), [
        {
            action: "ADD",
            item: "ITEM_POTION",
            quantity: 2
        }
    ]);
});


test("InventoryFlow does not record a failed item receipt", () => {
    const { flow } = createContext();

    const result = flow.receiveItem(null);

    assert.equal(result.success, false);
    assert.equal(flow.getHistory().length, 0);
});


test("InventoryFlow uses one item and records the action", () => {
    const { flow } = createContext();

    flow.receiveItem("ITEM_POTION", 3);

    const result = flow.useItem("ITEM_POTION");

    assert.equal(result.success, true);
    assert.equal(result.quantity, 2);
    assert.equal(flow.getQuantity("ITEM_POTION"), 2);

    assert.deepEqual(flow.getHistory(), [
        {
            action: "ADD",
            item: "ITEM_POTION",
            quantity: 3
        },
        {
            action: "USE",
            item: "ITEM_POTION"
        }
    ]);
});


test("InventoryFlow does not record a failed item use", () => {
    const { flow } = createContext();

    const result = flow.useItem("ITEM_POTION");

    assert.equal(result.success, false);
    assert.equal(flow.getHistory().length, 0);
});


test("InventoryFlow removes a specified quantity", () => {
    const { flow } = createContext();

    flow.receiveItem("ITEM_POTION", 5);

    const result = flow.removeItem("ITEM_POTION", 3);

    assert.equal(result.success, true);
    assert.equal(result.quantity, 2);
    assert.equal(flow.getQuantity("ITEM_POTION"), 2);

    assert.equal(
        flow.getHistory().at(-1).action,
        "REMOVE"
    );

    assert.equal(
        flow.getHistory().at(-1).quantity,
        3
    );
});


test("InventoryFlow exposes the live inventory and quantities", () => {
    const { flow, inventoryManager } = createContext();

    flow.receiveItem("ITEM_POTION", 4);

    assert.strictEqual(
        flow.getInventory(),
        inventoryManager.getInventory()
    );

    assert.equal(flow.getQuantity("ITEM_POTION"), 4);
    assert.equal(flow.hasItem("ITEM_POTION"), true);
    assert.equal(flow.hasItem("ITEM_REVIVE"), false);
});


test("InventoryFlow can clear its history", () => {
    const { flow } = createContext();

    flow.receiveItem("ITEM_POTION", 2);
    flow.useItem("ITEM_POTION");

    assert.equal(flow.getHistory().length, 2);

    flow.clearHistory();

    assert.deepEqual(flow.getHistory(), []);
    assert.equal(flow.getQuantity("ITEM_POTION"), 1);
});


// -------------------------------------
// Behavior lookup
// -------------------------------------

test("InventoryFlow resolves item behavior from an object database", () => {
    const behavior = {
        itemConstant: "ITEM_POTION",
        behavior: "HEAL"
    };

    const { flow } = createContext({
        itemBehaviors: {
            ITEM_POTION: behavior
        }
    });

    assert.strictEqual(
        flow.getItemBehavior("ITEM_POTION"),
        behavior
    );

    assert.equal(
        flow.getItemBehavior("UNKNOWN_ITEM"),
        null
    );
});


test("InventoryFlow resolves item behavior from an array database", () => {
    const behavior = {
        itemConstant: "ITEM_ETHER",
        behavior: "RESTORE_PP"
    };

    const { flow } = createContext({
        itemBehaviors: [behavior]
    });

    assert.strictEqual(
        flow.getItemBehavior("ITEM_ETHER"),
        behavior
    );

    assert.equal(
        flow.getItemBehavior("UNKNOWN_ITEM"),
        null
    );
});


// -------------------------------------
// Using items on individual Pokémon
// -------------------------------------

test("Using an item on Pokémon rejects an invalid item", () => {
    const { flow } = createContext();

    const result = flow.useItemOnPokemon(
        null,
        { species: "PIKACHU" }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid item");
});


test("Using an item on Pokémon rejects a missing Pokémon", () => {
    const { flow } = createContext();

    flow.receiveItem("ITEM_POTION", 1);

    const result = flow.useItemOnPokemon(
        "ITEM_POTION",
        null
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Missing Pokemon");
    assert.equal(flow.getQuantity("ITEM_POTION"), 1);
});


test("Using an item on Pokémon fails when the item is missing", () => {
    const { flow } = createContext();

    const result = flow.useItemOnPokemon(
        "ITEM_POTION",
        { species: "PIKACHU" }
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Item not found");
});


test("Using an item on Pokémon fails when no behavior is defined", () => {
    const { flow } = createContext();

    flow.receiveItem("ITEM_UNKNOWN", 1);

    const result = flow.useItemOnPokemon(
        "ITEM_UNKNOWN",
        { species: "PIKACHU" }
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "No item behavior defined for ITEM_UNKNOWN"
    );

    assert.equal(flow.getQuantity("ITEM_UNKNOWN"), 1);
});


test("Using an item on Pokémon fails when the effect service is unavailable", () => {
    const { flow } = createContext({
        itemEffectService: null
    });

    flow.receiveItem("ITEM_POTION", 1);

    const result = flow.useItemOnPokemon(
        "ITEM_POTION",
        { species: "PIKACHU" }
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Item effect service is not available"
    );

    assert.equal(flow.getQuantity("ITEM_POTION"), 1);
});


test("A failed Pokémon item effect does not consume the item", () => {
    const effectService = {
        use() {
            return {
                success: false,
                reason: "Pokémon does not need healing"
            };
        }
    };

    const { flow } = createContext({
        itemEffectService: effectService
    });

    flow.receiveItem("ITEM_POTION", 2);

    const pokemon = {
        species: "PIKACHU",
        level: 10
    };

    const result = flow.useItemOnPokemon(
        "ITEM_POTION",
        pokemon
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Pokémon does not need healing"
    );

    assert.equal(flow.getQuantity("ITEM_POTION"), 2);

    assert.equal(
        flow.getHistory().filter(
            entry => entry.action === "USE_ON_POKEMON"
        ).length,
        0
    );
});


test("A successful Pokémon item effect consumes one item and records the use", () => {
    let receivedPokemon = null;
    let receivedMove = null;

    const effectService = {
        use(behavior, pokemon, move) {
            receivedPokemon = pokemon;
            receivedMove = move;

            pokemon.level += 1;

            return {
                success: true,
                description: "Effect applied"
            };
        }
    };

    const { flow } = createContext({
        itemEffectService: effectService
    });

    flow.receiveItem("ITEM_POTION", 2);

    const pokemon = {
        species: "PIKACHU",
        level: 10
    };

    const move = {
        constant: "THUNDERBOLT"
    };

    const result = flow.useItemOnPokemon(
        "ITEM_POTION",
        pokemon,
        move
    );

    assert.equal(result.success, true);
    assert.equal(result.behavior, "HEAL");
    assert.strictEqual(result.pokemon, pokemon);
    assert.strictEqual(result.move, move);
    assert.strictEqual(receivedPokemon, pokemon);
    assert.strictEqual(receivedMove, move);

    assert.equal(pokemon.level, 11);
    assert.equal(result.remaining, 1);
    assert.equal(flow.getQuantity("ITEM_POTION"), 1);

    assert.deepEqual(
        flow.getHistory().at(-1),
        {
            action: "USE_ON_POKEMON",
            item: "ITEM_POTION",
            behavior: "HEAL",
            pokemon: "PIKACHU",
            move: "THUNDERBOLT"
        }
    );
});


test("A successful effect does not report success if item consumption fails", () => {
    const inventory = {
        hasItem() {
            return true;
        },

        removeItem() {
            return {
                success: false,
                reason: "Inventory changed"
            };
        },

        getQuantity() {
            return 1;
        }
    };

    const effectService = {
        use() {
            return {
                success: true
            };
        }
    };

    const flow = new InventoryFlow(
        inventory,
        effectService,
        {
            ITEM_POTION: {
                itemConstant: "ITEM_POTION",
                behavior: "HEAL"
            }
        }
    );

    const result = flow.useItemOnPokemon(
        "ITEM_POTION",
        { species: "PIKACHU" }
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Item effect succeeded but item could not be consumed"
    );

    assert.equal(flow.getHistory().length, 0);
});


// -------------------------------------
// Using items on the whole party
// -------------------------------------

test("Using an item on the party rejects an invalid item", () => {
    const { flow } = createContext();

    const result = flow.useItemOnParty(
        null,
        []
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid item");
});


test("Using an item on the party requires an array", () => {
    const { flow } = createContext();

    const result = flow.useItemOnParty(
        "ITEM_REVIVE",
        {}
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Party must be an array");
});


test("Using an item on the party fails when the item is missing", () => {
    const { flow } = createContext();

    const result = flow.useItemOnParty(
        "ITEM_REVIVE",
        []
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Item not found");
});


test("Using a party item fails when no behavior is defined", () => {
    const { flow } = createContext();

    flow.receiveItem("ITEM_UNKNOWN", 1);

    const result = flow.useItemOnParty(
        "ITEM_UNKNOWN",
        []
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "No item behavior defined for ITEM_UNKNOWN"
    );

    assert.equal(flow.getQuantity("ITEM_UNKNOWN"), 1);
});


test("Using a party item fails when the effect service is unavailable", () => {
    const { flow } = createContext({
        itemEffectService: null
    });

    flow.receiveItem("ITEM_REVIVE", 1);

    const result = flow.useItemOnParty(
        "ITEM_REVIVE",
        []
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Party item effect service is not available"
    );

    assert.equal(flow.getQuantity("ITEM_REVIVE"), 1);
});


test("A failed party item effect does not consume the item", () => {
    const effectService = {
        useOnParty() {
            return {
                success: false,
                reason: "No Pokémon can be revived"
            };
        }
    };

    const { flow } = createContext({
        itemEffectService: effectService
    });

    flow.receiveItem("ITEM_REVIVE", 2);

    const result = flow.useItemOnParty(
        "ITEM_REVIVE",
        [{ species: "PIKACHU" }]
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "No Pokémon can be revived"
    );

    assert.equal(flow.getQuantity("ITEM_REVIVE"), 2);

    assert.equal(
        flow.getHistory().some(
            entry => entry.action === "USE_ON_PARTY"
        ),
        false
    );
});


test("A successful party item effect consumes one item and records revived count", () => {
    const party = [
        { species: "PIKACHU" },
        { species: "CHARMANDER" }
    ];

    let receivedParty = null;

    const effectService = {
        useOnParty(behavior, actualParty) {
            receivedParty = actualParty;

            return {
                success: true,
                revivedCount: 2
            };
        }
    };

    const { flow } = createContext({
        itemEffectService: effectService
    });

    flow.receiveItem("ITEM_REVIVE", 3);

    const result = flow.useItemOnParty(
        "ITEM_REVIVE",
        party
    );

    assert.equal(result.success, true);
    assert.equal(result.behavior, "REVIVE");
    assert.equal(result.remaining, 2);
    assert.strictEqual(receivedParty, party);

    assert.equal(flow.getQuantity("ITEM_REVIVE"), 2);

    assert.deepEqual(
        flow.getHistory().at(-1),
        {
            action: "USE_ON_PARTY",
            item: "ITEM_REVIVE",
            behavior: "REVIVE",
            revived: 2
        }
    );
});


test("A successful party effect does not report success if item consumption fails", () => {
    const inventory = {
        hasItem() {
            return true;
        },

        removeItem() {
            return {
                success: false,
                reason: "Inventory changed"
            };
        },

        getQuantity() {
            return 1;
        }
    };

    const effectService = {
        useOnParty() {
            return {
                success: true,
                revivedCount: 1
            };
        }
    };

    const flow = new InventoryFlow(
        inventory,
        effectService,
        {
            ITEM_REVIVE: {
                itemConstant: "ITEM_REVIVE",
                behavior: "REVIVE"
            }
        }
    );

    const result = flow.useItemOnParty(
        "ITEM_REVIVE",
        [{ species: "PIKACHU" }]
    );

    assert.equal(result.success, false);
    assert.equal(
        result.reason,
        "Item effect succeeded but item could not be consumed"
    );

    assert.equal(flow.getHistory().length, 0);
});
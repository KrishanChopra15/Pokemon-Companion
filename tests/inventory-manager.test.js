"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const GameSession = require("../scripts/session/game-session");
const InventoryManager = require("../scripts/inventory/inventory-manager");


test("InventoryManager uses the canonical session inventory", () => {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    assert.strictEqual(
        inventoryManager.getInventory(),
        session.getState().inventory
    );
});


test("InventoryManager adds an item with the default quantity", () => {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    const result = inventoryManager.addItem("POTION");

    assert.equal(result.success, true);
    assert.equal(result.item, "POTION");
    assert.equal(result.quantity, 1);
    assert.equal(inventoryManager.getQuantity("POTION"), 1);
});


test("InventoryManager adds the requested quantity", () => {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    const result = inventoryManager.addItem("POKE_BALL", 5);

    assert.equal(result.success, true);
    assert.equal(result.quantity, 5);
    assert.equal(inventoryManager.getQuantity("POKE_BALL"), 5);
});


test("Adding an existing item increases its quantity", () => {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    inventoryManager.addItem("POTION", 3);
    const result = inventoryManager.addItem("POTION", 4);

    assert.equal(result.success, true);
    assert.equal(result.quantity, 7);
    assert.equal(inventoryManager.getQuantity("POTION"), 7);
});


test("InventoryManager rejects a missing item name", () => {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    const result = inventoryManager.addItem(null);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Invalid item");
    assert.equal(Object.keys(inventoryManager.getInventory()).length, 0);
});


test("InventoryManager removes the requested quantity", () => {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    inventoryManager.addItem("POTION", 5);

    const result = inventoryManager.removeItem("POTION", 2);

    assert.equal(result.success, true);
    assert.equal(result.item, "POTION");
    assert.equal(result.quantity, 3);
    assert.equal(inventoryManager.getQuantity("POTION"), 3);
});


test("Removing an item quantity of one uses the default amount", () => {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    inventoryManager.addItem("POKE_BALL", 3);

    const result = inventoryManager.removeItem("POKE_BALL");

    assert.equal(result.success, true);
    assert.equal(result.quantity, 2);
});


test("Removing an item that does not exist fails", () => {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    const result = inventoryManager.removeItem("POTION");

    assert.equal(result.success, false);
    assert.equal(result.reason, "Item not found");
    assert.equal(inventoryManager.getQuantity("POTION"), 0);
});


test("Removing more items than available fails without changing inventory", () => {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    inventoryManager.addItem("POTION", 3);

    const result = inventoryManager.removeItem("POTION", 5);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Not enough items");
    assert.equal(inventoryManager.getQuantity("POTION"), 3);
});


test("hasItem reports whether an item has a positive quantity", () => {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    assert.equal(inventoryManager.hasItem("POTION"), false);

    inventoryManager.addItem("POTION", 2);

    assert.equal(inventoryManager.hasItem("POTION"), true);
});


test("getQuantity returns zero for an item not in inventory", () => {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    assert.equal(inventoryManager.getQuantity("RARE_CANDY"), 0);
});


test("getInventory returns the shared inventory object", () => {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    const inventory = inventoryManager.getInventory();

    inventoryManager.addItem("POTION", 2);

    assert.strictEqual(inventoryManager.getInventory(), inventory);
    assert.strictEqual(session.getState().inventory, inventory);
    assert.equal(inventory.POTION, 2);
});


test("Clearing inventory preserves the shared object reference", () => {
    const session = new GameSession();
    const inventoryManager = new InventoryManager(session);

    inventoryManager.addItem("POTION", 3);
    inventoryManager.addItem("POKE_BALL", 5);

    const inventory = inventoryManager.getInventory();

    const result = inventoryManager.clear();

    assert.equal(result.success, true);
    assert.strictEqual(inventoryManager.getInventory(), inventory);
    assert.strictEqual(session.getState().inventory, inventory);
    assert.deepEqual(inventory, {});
});


test("Separate sessions keep their inventories isolated", () => {
    const firstSession = new GameSession();
    const secondSession = new GameSession();

    const firstInventory = new InventoryManager(firstSession);
    const secondInventory = new InventoryManager(secondSession);

    firstInventory.addItem("POTION", 5);

    assert.equal(firstInventory.getQuantity("POTION"), 5);
    assert.equal(secondInventory.getQuantity("POTION"), 0);
    assert.notStrictEqual(
        firstInventory.getInventory(),
        secondInventory.getInventory()
    );
});
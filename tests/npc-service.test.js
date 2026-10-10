"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const NPCService = require("../scripts/services/npc-service");

let fixtureCounter = 0;

const DEFAULT_DATA = {
    PALLET_TOWN: [
        {
            id: "NPC_1",
            name: "Professor",
            script: "PROFESSOR_SCRIPT"
        },
        {
            id: "NPC_2",
            name: "Assistant",
            script: "ASSISTANT_SCRIPT"
        }
    ],

    ROUTE_1: [
        {
            id: "NPC_3",
            name: "Trainer",
            script: "TRAINER_SCRIPT"
        }
    ],

    VIRIDIAN_CITY: []
};

function createFixture(t, options = {}) {
    const game =
        `__npc_service_test_${process.pid}_${++fixtureCounter}`;

    const directory = path.join(
        __dirname,
        "..",
        "database",
        "generated",
        game
    );

    fs.mkdirSync(directory, { recursive: true });

    if (options.writeDatabase !== false) {
        const data =
            Object.prototype.hasOwnProperty.call(options, "data")
                ? options.data
                : DEFAULT_DATA;

        fs.writeFileSync(
            path.join(directory, "npcs.json"),
            JSON.stringify(data),
            "utf8"
        );
    }

    t.after(() => {
        fs.rmSync(directory, {
            recursive: true,
            force: true
        });
    });

    return {
        game,
        directory,

        createService() {
            return new NPCService(game);
        }
    };
}

// --------------------------------------------------
// Constructor and database loading
// --------------------------------------------------

test("constructor creates an NPCService instance", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.ok(service instanceof NPCService);
});

test("constructor loads NPCs from the generated database", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(service.count(), 3);
});

test("constructor flattens NPC records from all locations", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.npcs.map(npc => npc.id),
        ["NPC_1", "NPC_2", "NPC_3"]
    );
});

test("constructor adds the source location to every NPC", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.npcs.map(npc => npc.location),
        ["PALLET_TOWN", "PALLET_TOWN", "ROUTE_1"]
    );
});

test("constructor preserves NPC properties", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(service.npcs[0], {
        id: "NPC_1",
        name: "Professor",
        script: "PROFESSOR_SCRIPT",
        location: "PALLET_TOWN"
    });
});

test("constructor overwrites an NPC's original location with its database key", t => {
    const fixture = createFixture(t, {
        data: {
            ROUTE_1: [
                {
                    id: "NPC_1",
                    location: "OLD_LOCATION",
                    name: "Trainer"
                }
            ]
        }
    });

    const service = fixture.createService();

    assert.equal(service.npcs[0].location, "ROUTE_1");
});

test("constructor preserves the order of locations and NPCs", t => {
    const fixture = createFixture(t, {
        data: {
            LOCATION_B: [
                { id: "B1" },
                { id: "B2" }
            ],
            LOCATION_A: [
                { id: "A1" },
                { id: "A2" }
            ]
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.npcs.map(npc => npc.id),
        ["B1", "B2", "A1", "A2"]
    );
});

test("constructor preserves additional nested NPC metadata", t => {
    const metadata = {
        role: "merchant",
        inventory: ["POTION", "POKE_BALL"]
    };

    const fixture = createFixture(t, {
        data: {
            TOWN: [
                {
                    id: "NPC_1",
                    metadata
                }
            ]
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.npcs[0].metadata,
        metadata
    );
});

test("constructor loads a custom game database", t => {
    const data = {
        TEST_TOWN: [
            { id: "CUSTOM_NPC", name: "Custom NPC" }
        ]
    };

    const fixture = createFixture(t, { data });
    const service = fixture.createService();

    assert.deepEqual(service.npcs, [
        {
            id: "CUSTOM_NPC",
            name: "Custom NPC",
            location: "TEST_TOWN"
        }
    ]);
});

test("constructor loads an empty database", t => {
    const fixture = createFixture(t, {
        data: {}
    });

    const service = fixture.createService();

    assert.deepEqual(service.npcs, []);
    assert.equal(service.count(), 0);
});

test("constructor loads locations with empty NPC arrays", t => {
    const fixture = createFixture(t, {
        data: {
            PALLET_TOWN: [],
            ROUTE_1: [],
            VIRIDIAN_CITY: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(service.npcs, []);
});

test("constructor throws when the NPC database file is missing", t => {
    const fixture = createFixture(t, {
        writeDatabase: false
    });

    assert.throws(
        () => fixture.createService(),
        error =>
            error instanceof Error &&
            error.message.startsWith("NPC database missing:")
    );
});

test("constructor throws when the NPC database contains malformed JSON", t => {
    const fixture = createFixture(t);

    fs.writeFileSync(
        path.join(fixture.directory, "npcs.json"),
        "{invalid json",
        "utf8"
    );

    assert.throws(
        () => fixture.createService(),
        SyntaxError
    );
});

test("constructor throws when the requested game directory does not exist", () => {
    const game =
        `__npc_service_missing_${process.pid}_${++fixtureCounter}`;

    assert.throws(
        () => new NPCService(game),
        error =>
            error instanceof Error &&
            error.message.startsWith("NPC database missing:")
    );
});

test("constructor throws when a location has no iterable NPC list", t => {
    const fixture = createFixture(t, {
        data: {
            PALLET_TOWN: null
        }
    });

    assert.throws(
        () => fixture.createService(),
        TypeError
    );
});

// --------------------------------------------------
// getNPCs
// --------------------------------------------------

test("getNPCs returns NPCs in Pallet Town", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getNPCs("PALLET_TOWN").map(npc => npc.id),
        ["NPC_1", "NPC_2"]
    );
});

test("getNPCs returns NPCs in Route 1", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getNPCs("ROUTE_1").map(npc => npc.id),
        ["NPC_3"]
    );
});

test("getNPCs returns an empty array for a location without NPCs", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getNPCs("VIRIDIAN_CITY"),
        []
    );
});

test("getNPCs returns an empty array for an unknown location", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getNPCs("UNKNOWN_LOCATION"),
        []
    );
});

test("getNPCs returns an empty array for an empty location ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getNPCs(""),
        []
    );
});

test("getNPCs returns an empty array for a null location ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getNPCs(null),
        []
    );
});

test("getNPCs returns an empty array for an undefined location ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getNPCs(undefined),
        []
    );
});

test("getNPCs matches location names exactly", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getNPCs("pallet_town"),
        []
    );
});

test("getNPCs returns the original NPC objects", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const npcs = service.getNPCs("PALLET_TOWN");

    assert.strictEqual(npcs[0], service.npcs[0]);
    assert.strictEqual(npcs[1], service.npcs[1]);
});

test("getNPCs returns a new filtered array on every call", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const first = service.getNPCs("PALLET_TOWN");
    const second = service.getNPCs("PALLET_TOWN");

    assert.notStrictEqual(first, second);
    assert.deepEqual(first, second);
});

test("getNPCs does not mutate the stored NPC database", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const original = [...service.npcs];

    service.getNPCs("PALLET_TOWN");
    service.getNPCs("ROUTE_1");
    service.getNPCs("UNKNOWN_LOCATION");

    assert.deepEqual(service.npcs, original);
});

test("getNPCs preserves order when multiple NPCs share a location", t => {
    const fixture = createFixture(t, {
        data: {
            TOWN: [
                { id: "NPC_C" },
                { id: "NPC_A" },
                { id: "NPC_B" }
            ]
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getNPCs("TOWN").map(npc => npc.id),
        ["NPC_C", "NPC_A", "NPC_B"]
    );
});

test("getNPCs does not include NPCs from other locations", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.ok(
        service.getNPCs("PALLET_TOWN")
            .every(npc => npc.location === "PALLET_TOWN")
    );
});

// --------------------------------------------------
// getNPC
// --------------------------------------------------

test("getNPC finds an NPC by ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getNPC("NPC_1"),
        {
            id: "NPC_1",
            name: "Professor",
            script: "PROFESSOR_SCRIPT",
            location: "PALLET_TOWN"
        }
    );
});

test("getNPC returns the original stored NPC object", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.strictEqual(
        service.getNPC("NPC_2"),
        service.npcs[1]
    );
});

test("getNPC returns the first matching NPC when IDs are duplicated", t => {
    const fixture = createFixture(t, {
        data: {
            TOWN_A: [
                { id: "DUPLICATE", name: "First NPC" }
            ],
            TOWN_B: [
                { id: "DUPLICATE", name: "Second NPC" }
            ]
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getNPC("DUPLICATE"),
        {
            id: "DUPLICATE",
            name: "First NPC",
            location: "TOWN_A"
        }
    );
});

test("getNPC returns null for an unknown ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.getNPC("UNKNOWN_NPC"),
        null
    );
});

test("getNPC returns null for an empty ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(service.getNPC(""), null);
});

test("getNPC returns null for a null ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(service.getNPC(null), null);
});

test("getNPC returns null for an undefined ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(service.getNPC(undefined), null);
});

test("getNPC uses exact ID matching", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.getNPC("npc_1"),
        null
    );
});

test("getNPC can find an NPC whose ID is numeric", t => {
    const fixture = createFixture(t, {
        data: {
            TOWN: [
                { id: 123, name: "Numeric ID NPC" }
            ]
        }
    });

    const service = fixture.createService();

    assert.equal(
        service.getNPC(123).name,
        "Numeric ID NPC"
    );
});

test("getNPC distinguishes numeric and string IDs", t => {
    const fixture = createFixture(t, {
        data: {
            TOWN: [
                { id: 123, name: "Numeric ID NPC" }
            ]
        }
    });

    const service = fixture.createService();

    assert.equal(service.getNPC("123"), null);
});

// --------------------------------------------------
// getAllNPCs
// --------------------------------------------------

test("getAllNPCs returns all flattened NPCs", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getAllNPCs().map(npc => npc.id),
        ["NPC_1", "NPC_2", "NPC_3"]
    );
});

test("getAllNPCs returns an array", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.ok(Array.isArray(service.getAllNPCs()));
});

test("getAllNPCs returns the internal NPC array", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.strictEqual(
        service.getAllNPCs(),
        service.npcs
    );
});

test("getAllNPCs returns the same array on repeated calls", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.strictEqual(
        service.getAllNPCs(),
        service.getAllNPCs()
    );
});

test("getAllNPCs returns an empty array for an empty database", t => {
    const fixture = createFixture(t, {
        data: {}
    });

    const service = fixture.createService();

    assert.deepEqual(service.getAllNPCs(), []);
});

test("changes to the array returned by getAllNPCs affect stored NPCs", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const allNPCs = service.getAllNPCs();
    allNPCs.push({
        id: "NPC_ADDED",
        location: "TEST_TOWN"
    });

    assert.strictEqual(service.getAllNPCs(), allNPCs);
    assert.equal(service.getNPC("NPC_ADDED").location, "TEST_TOWN");
    assert.equal(service.count(), 4);
});

// --------------------------------------------------
// count
// --------------------------------------------------

test("count returns the total number of NPCs", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(service.count(), 3);
});

test("count returns zero when the database contains no NPCs", t => {
    const fixture = createFixture(t, {
        data: {}
    });

    const service = fixture.createService();

    assert.equal(service.count(), 0);
});

test("count includes NPCs from every location", t => {
    const fixture = createFixture(t, {
        data: {
            AREA_A: [
                { id: "A1" },
                { id: "A2" }
            ],
            AREA_B: [
                { id: "B1" },
                { id: "B2" },
                { id: "B3" }
            ],
            AREA_C: []
        }
    });

    const service = fixture.createService();

    assert.equal(service.count(), 5);
});

test("count includes NPCs with duplicate IDs", t => {
    const fixture = createFixture(t, {
        data: {
            AREA_A: [
                { id: "DUPLICATE" }
            ],
            AREA_B: [
                { id: "DUPLICATE" }
            ]
        }
    });

    const service = fixture.createService();

    assert.equal(service.count(), 2);
});

test("count reflects changes to the internal array", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    service.npcs.push({
        id: "NPC_EXTRA",
        location: "TEST_TOWN"
    });

    assert.equal(service.count(), 4);
});

test("count decreases when an NPC is removed from the internal array", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    service.npcs.pop();

    assert.equal(service.count(), 2);
});

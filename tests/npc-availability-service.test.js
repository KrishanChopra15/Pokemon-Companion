"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const NPCAvailabilityService =
    require("../scripts/services/npc-availability-service");

// --------------------------------------------------
// Test helpers
// --------------------------------------------------

function createMocks(options = {}) {
    const npcs =
        options.npcs || [];

    const eventsByScript =
        options.eventsByScript || {};

    const visibility =
        options.visibility || {};

    const getNPCsCalls = [];
    const getEventsByNPCCalls = [];
    const canShowEventCalls = [];

    const npcService = {
        getNPCs(location) {
            getNPCsCalls.push(location);

            if (typeof options.getNPCs === "function") {
                return options.getNPCs(location);
            }

            return npcs;
        }
    };

    const eventService = {
        getEventsByNPC(script) {
            getEventsByNPCCalls.push(script);

            if (typeof options.getEventsByNPC === "function") {
                return options.getEventsByNPC(script);
            }

            return eventsByScript[script] || [];
        },

        canShowEvent(event, trainerState) {
            canShowEventCalls.push({
                event,
                trainerState
            });

            if (typeof options.canShowEvent === "function") {
                return options.canShowEvent(event, trainerState);
            }

            if (Object.prototype.hasOwnProperty.call(visibility, event.id)) {
                return {
                    visible: visibility[event.id]
                };
            }

            return { visible: false };
        }
    };

    return {
        npcService,
        eventService,
        getNPCsCalls,
        getEventsByNPCCalls,
        canShowEventCalls,

        createService() {
            return new NPCAvailabilityService(
                npcService,
                eventService
            );
        }
    };
}

function makeNPC(id, script = `${id}_SCRIPT`) {
    return { id, script };
}

function makeEvent(id) {
    return { id };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates an NPCAvailabilityService instance", () => {
    const mocks = createMocks();
    const service = mocks.createService();

    assert.ok(service instanceof NPCAvailabilityService);
});

test("constructor stores the supplied NPC service", () => {
    const mocks = createMocks();
    const service = mocks.createService();

    assert.strictEqual(service.npcService, mocks.npcService);
});

test("constructor stores the supplied event service", () => {
    const mocks = createMocks();
    const service = mocks.createService();

    assert.strictEqual(service.eventService, mocks.eventService);
});

test("constructor does not call either dependency", () => {
    const mocks = createMocks();
    mocks.createService();

    assert.deepEqual(mocks.getNPCsCalls, []);
    assert.deepEqual(mocks.getEventsByNPCCalls, []);
    assert.deepEqual(mocks.canShowEventCalls, []);
});

// --------------------------------------------------
// Basic getAvailableNPCs behavior
// --------------------------------------------------

test("getAvailableNPCs requests NPCs for the supplied location", () => {
    const mocks = createMocks({
        npcs: [makeNPC("NPC_1")]
    });

    const service = mocks.createService();

    service.getAvailableNPCs("PALLET_TOWN", {});

    assert.deepEqual(
        mocks.getNPCsCalls,
        ["PALLET_TOWN"]
    );
});

test("getAvailableNPCs returns an empty array when there are no NPCs", () => {
    const mocks = createMocks({ npcs: [] });
    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("PALLET_TOWN", {}),
        []
    );
});

test("getAvailableNPCs returns the NPCs when all have no events", () => {
    const npcs = [
        makeNPC("NPC_1"),
        makeNPC("NPC_2"),
        makeNPC("NPC_3")
    ];

    const mocks = createMocks({ npcs });
    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("PALLET_TOWN", {}),
        npcs
    );
});

test("getAvailableNPCs includes an NPC whose script has no events", () => {
    const npc = makeNPC("NPC_1");

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: []
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("PALLET_TOWN", {}),
        [npc]
    );
});

test("getAvailableNPCs includes NPCs with no events without checking visibility", () => {
    const npc = makeNPC("NPC_1");

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: []
        }
    });

    const service = mocks.createService();

    service.getAvailableNPCs("PALLET_TOWN", {});

    assert.deepEqual(mocks.canShowEventCalls, []);
});

test("getAvailableNPCs excludes an NPC when all its events are hidden", () => {
    const npc = makeNPC("NPC_1");

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: [
                makeEvent("EVENT_1"),
                makeEvent("EVENT_2")
            ]
        },
        visibility: {
            EVENT_1: false,
            EVENT_2: false
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("PALLET_TOWN", {}),
        []
    );
});

test("getAvailableNPCs includes an NPC when its only event is visible", () => {
    const npc = makeNPC("NPC_1");

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: [makeEvent("EVENT_1")]
        },
        visibility: {
            EVENT_1: true
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("PALLET_TOWN", {}),
        [npc]
    );
});

test("getAvailableNPCs includes an NPC when at least one event is visible", () => {
    const npc = makeNPC("NPC_1");

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: [
                makeEvent("EVENT_1"),
                makeEvent("EVENT_2"),
                makeEvent("EVENT_3")
            ]
        },
        visibility: {
            EVENT_1: false,
            EVENT_2: true,
            EVENT_3: false
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("PALLET_TOWN", {}),
        [npc]
    );
});

test("getAvailableNPCs excludes an NPC when every event is hidden", () => {
    const npc = makeNPC("NPC_1");

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: [
                makeEvent("EVENT_1"),
                makeEvent("EVENT_2"),
                makeEvent("EVENT_3")
            ]
        },
        visibility: {
            EVENT_1: false,
            EVENT_2: false,
            EVENT_3: false
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("PALLET_TOWN", {}),
        []
    );
});

test("getAvailableNPCs handles a mix of event-free, visible, and hidden NPCs", () => {
    const npcWithoutEvents = makeNPC("NPC_NO_EVENT");
    const npcWithVisibleEvent = makeNPC("NPC_VISIBLE");
    const npcWithHiddenEvents = makeNPC("NPC_HIDDEN");

    const mocks = createMocks({
        npcs: [
            npcWithoutEvents,
            npcWithVisibleEvent,
            npcWithHiddenEvents
        ],

        eventsByScript: {
            NPC_NO_EVENT_SCRIPT: [],
            NPC_VISIBLE_SCRIPT: [
                makeEvent("VISIBLE_EVENT")
            ],
            NPC_HIDDEN_SCRIPT: [
                makeEvent("HIDDEN_EVENT_1"),
                makeEvent("HIDDEN_EVENT_2")
            ]
        },

        visibility: {
            VISIBLE_EVENT: true,
            HIDDEN_EVENT_1: false,
            HIDDEN_EVENT_2: false
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("VIRIDIAN_CITY", {}),
        [
            npcWithoutEvents,
            npcWithVisibleEvent
        ]
    );
});

// --------------------------------------------------
// Event lookup
// --------------------------------------------------

test("getAvailableNPCs looks up events using each NPC script", () => {
    const npcs = [
        makeNPC("NPC_1", "SCRIPT_A"),
        makeNPC("NPC_2", "SCRIPT_B")
    ];

    const mocks = createMocks({ npcs });
    const service = mocks.createService();

    service.getAvailableNPCs("ROUTE_1", {});

    assert.deepEqual(
        mocks.getEventsByNPCCalls,
        ["SCRIPT_A", "SCRIPT_B"]
    );
});

test("getAvailableNPCs checks events separately for each NPC", () => {
    const npcA = makeNPC("NPC_A", "SCRIPT_A");
    const npcB = makeNPC("NPC_B", "SCRIPT_B");

    const mocks = createMocks({
        npcs: [npcA, npcB],

        eventsByScript: {
            SCRIPT_A: [makeEvent("EVENT_A")],
            SCRIPT_B: [makeEvent("EVENT_B")]
        },

        visibility: {
            EVENT_A: true,
            EVENT_B: false
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("ROUTE_1", {}),
        [npcA]
    );
});

test("getAvailableNPCs passes an undefined script to event lookup when absent", () => {
    const npc = { id: "NPC_WITHOUT_SCRIPT" };

    const mocks = createMocks({
        npcs: [npc],
        getEventsByNPC() {
            return [];
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("ROUTE_1", {}),
        [npc]
    );

    assert.deepEqual(
        mocks.getEventsByNPCCalls,
        [undefined]
    );
});

test("getAvailableNPCs passes an empty script to event lookup unchanged", () => {
    const npc = makeNPC("NPC_1", "");

    const mocks = createMocks({
        npcs: [npc],
        getEventsByNPC() {
            return [];
        }
    });

    const service = mocks.createService();

    service.getAvailableNPCs("ROUTE_1", {});

    assert.deepEqual(
        mocks.getEventsByNPCCalls,
        [""]
    );
});

// --------------------------------------------------
// Trainer state and event visibility
// --------------------------------------------------

test("getAvailableNPCs passes trainer state to canShowEvent", () => {
    const npc = makeNPC("NPC_1");
    const event = makeEvent("EVENT_1");
    const trainerState = {
        badges: ["BOULDER_BADGE"],
        storyFlags: ["BRIDGE_REPAIRED"]
    };

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: [event]
        },
        canShowEvent(givenEvent, givenState) {
            return {
                visible: givenEvent === event &&
                    givenState === trainerState
            };
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("ROUTE_1", trainerState),
        [npc]
    );

    assert.strictEqual(
        mocks.canShowEventCalls[0].trainerState,
        trainerState
    );
});

test("getAvailableNPCs passes the exact event object to canShowEvent", () => {
    const npc = makeNPC("NPC_1");
    const event = makeEvent("EVENT_1");

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: [event]
        },
        canShowEvent() {
            return { visible: false };
        }
    });

    const service = mocks.createService();

    service.getAvailableNPCs("ROUTE_1", {});

    assert.strictEqual(
        mocks.canShowEventCalls[0].event,
        event
    );
});

test("getAvailableNPCs passes undefined trainer state through unchanged", () => {
    const npc = makeNPC("NPC_1");
    const event = makeEvent("EVENT_1");

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: [event]
        },
        canShowEvent(givenEvent, trainerState) {
            assert.strictEqual(trainerState, undefined);
            return { visible: true };
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("ROUTE_1"),
        [npc]
    );
});

test("getAvailableNPCs uses the visible property from the event result", () => {
    const npc = makeNPC("NPC_1");

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: [makeEvent("EVENT_1")]
        },
        canShowEvent() {
            return {
                visible: true,
                reason: "A separate field"
            };
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("ROUTE_1", {}),
        [npc]
    );
});

test("getAvailableNPCs excludes an NPC when the event result is not visible", () => {
    const npc = makeNPC("NPC_1");

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: [makeEvent("EVENT_1")]
        },
        canShowEvent() {
            return {
                visible: false,
                reason: "Story requirement not met"
            };
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("ROUTE_1", {}),
        []
    );
});

// --------------------------------------------------
// Array filtering behavior
// --------------------------------------------------

test("getAvailableNPCs preserves the original NPC order", () => {
    const npcs = [
        makeNPC("NPC_A"),
        makeNPC("NPC_B"),
        makeNPC("NPC_C")
    ];

    const mocks = createMocks({
        npcs,
        eventsByScript: {
            NPC_A_SCRIPT: [],
            NPC_B_SCRIPT: [],
            NPC_C_SCRIPT: []
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("ROUTE_1", {}),
        npcs
    );
});

test("getAvailableNPCs returns a new filtered array", () => {
    const npcs = [
        makeNPC("NPC_A"),
        makeNPC("NPC_B")
    ];

    const mocks = createMocks({ npcs });
    const service = mocks.createService();

    const result = service.getAvailableNPCs("ROUTE_1", {});

    assert.notStrictEqual(result, npcs);
    assert.deepEqual(result, npcs);
});

test("getAvailableNPCs does not mutate the source NPC array", () => {
    const npcs = [
        makeNPC("NPC_VISIBLE"),
        makeNPC("NPC_HIDDEN")
    ];

    const original = [...npcs];

    const mocks = createMocks({
        npcs,
        eventsByScript: {
            NPC_VISIBLE_SCRIPT: [makeEvent("VISIBLE_EVENT")],
            NPC_HIDDEN_SCRIPT: [makeEvent("HIDDEN_EVENT")]
        },
        visibility: {
            VISIBLE_EVENT: true,
            HIDDEN_EVENT: false
        }
    });

    const service = mocks.createService();

    service.getAvailableNPCs("ROUTE_1", {});

    assert.deepEqual(npcs, original);
});

test("getAvailableNPCs does not remove or modify NPC properties", () => {
    const npc = {
        id: "NPC_1",
        script: "SCRIPT_1",
        name: "Test NPC",
        metadata: { role: "merchant" }
    };

    const mocks = createMocks({
        npcs: [npc]
    });

    const service = mocks.createService();
    const result = service.getAvailableNPCs("ROUTE_1", {});

    assert.strictEqual(result[0], npc);
    assert.deepEqual(npc, {
        id: "NPC_1",
        script: "SCRIPT_1",
        name: "Test NPC",
        metadata: { role: "merchant" }
    });
});

test("getAvailableNPCs invokes canShowEvent only until a visible event is found", () => {
    const npc = makeNPC("NPC_1");

    const eventA = makeEvent("EVENT_A");
    const eventB = makeEvent("EVENT_B");
    const eventC = makeEvent("EVENT_C");

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: [eventA, eventB, eventC]
        },
        visibility: {
            EVENT_A: false,
            EVENT_B: true,
            EVENT_C: true
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("ROUTE_1", {}),
        [npc]
    );

    assert.deepEqual(
        mocks.canShowEventCalls.map(call => call.event.id),
        ["EVENT_A", "EVENT_B"]
    );
});

test("getAvailableNPCs checks every event when all events are hidden", () => {
    const npc = makeNPC("NPC_1");

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: [
                makeEvent("EVENT_A"),
                makeEvent("EVENT_B"),
                makeEvent("EVENT_C")
            ]
        },
        visibility: {
            EVENT_A: false,
            EVENT_B: false,
            EVENT_C: false
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("ROUTE_1", {}),
        []
    );

    assert.equal(mocks.canShowEventCalls.length, 3);
});

test("getAvailableNPCs does not evaluate events after finding one visible event", () => {
    const npcA = makeNPC("NPC_A");
    const npcB = makeNPC("NPC_B");

    const mocks = createMocks({
        npcs: [npcA, npcB],

        eventsByScript: {
            NPC_A_SCRIPT: [
                makeEvent("A_VISIBLE"),
                makeEvent("A_LATER")
            ],
            NPC_B_SCRIPT: [
                makeEvent("B_HIDDEN")
            ]
        },

        visibility: {
            A_VISIBLE: true,
            A_LATER: true,
            B_HIDDEN: false
        }
    });

    const service = mocks.createService();

    assert.deepEqual(
        service.getAvailableNPCs("ROUTE_1", {}),
        [npcA]
    );

    assert.deepEqual(
        mocks.canShowEventCalls.map(call => call.event.id),
        ["A_VISIBLE", "B_HIDDEN"]
    );
});

// --------------------------------------------------
// Error propagation and dependency behavior
// --------------------------------------------------

test("getAvailableNPCs propagates errors from getNPCs", () => {
    const expectedError = new Error("NPC lookup failed");

    const mocks = createMocks({
        getNPCs() {
            throw expectedError;
        }
    });

    const service = mocks.createService();

    assert.throws(
        () => service.getAvailableNPCs("ROUTE_1", {}),
        error => error === expectedError
    );
});

test("getAvailableNPCs propagates errors from getEventsByNPC", () => {
    const expectedError = new Error("Event lookup failed");

    const mocks = createMocks({
        npcs: [makeNPC("NPC_1")],
        getEventsByNPC() {
            throw expectedError;
        }
    });

    const service = mocks.createService();

    assert.throws(
        () => service.getAvailableNPCs("ROUTE_1", {}),
        error => error === expectedError
    );
});

test("getAvailableNPCs propagates errors from canShowEvent", () => {
    const expectedError = new Error("Visibility check failed");

    const mocks = createMocks({
        npcs: [makeNPC("NPC_1")],
        eventsByScript: {
            NPC_1_SCRIPT: [makeEvent("EVENT_1")]
        },
        canShowEvent() {
            throw expectedError;
        }
    });

    const service = mocks.createService();

    assert.throws(
        () => service.getAvailableNPCs("ROUTE_1", {}),
        error => error === expectedError
    );
});

test("getAvailableNPCs calls each dependency with the expected arguments", () => {
    const npc = makeNPC("NPC_1");
    const event = makeEvent("EVENT_1");
    const state = { storyFlags: ["MET_RIVAL"] };

    const mocks = createMocks({
        npcs: [npc],
        eventsByScript: {
            NPC_1_SCRIPT: [event]
        },
        visibility: {
            EVENT_1: true
        }
    });

    const service = mocks.createService();

    service.getAvailableNPCs("VIRIDIAN_CITY", state);

    assert.deepEqual(mocks.getNPCsCalls, ["VIRIDIAN_CITY"]);
    assert.deepEqual(
        mocks.getEventsByNPCCalls,
        ["NPC_1_SCRIPT"]
    );

    assert.equal(mocks.canShowEventCalls.length, 1);
    assert.strictEqual(mocks.canShowEventCalls[0].event, event);
    assert.strictEqual(mocks.canShowEventCalls[0].trainerState, state);
});

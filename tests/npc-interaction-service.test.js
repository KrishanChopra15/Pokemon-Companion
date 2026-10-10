"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const NPCInteractionService =
    require("../scripts/services/npc-interaction-service");

// --------------------------------------------------
// Test helpers
// --------------------------------------------------

function createMocks(options = {}) {
    const calls = {
        getNPC: [],
        getEvent: [],
        getStoryEvent: [],
        hasCompletedEvent: [],
        canShowEvent: [],
        getDialogue: [],
        getChoices: [],
        executeEvent: [],
        completeStoryEvent: []
    };

    const npc = options.npc === undefined
        ? { id: "NPC_1", name: "Test NPC" }
        : options.npc;

    const event = options.event === undefined
        ? {
            id: "EVENT_1",
            oneTime: false,
            dialogues: ["DIALOGUE_1"],
            rewards: []
        }
        : options.event;

    const storyEvent = options.storyEvent === undefined
        ? null
        : options.storyEvent;

    const dialogueResults = options.dialogueResults || {
        DIALOGUE_1: {
            id: "DIALOGUE_1",
            text: "Hello, Trainer!"
        }
    };

    const choices = options.choices || [];
    const execution = options.execution === undefined
        ? { success: true }
        : options.execution;

    const visibility = options.visibility || {
        visible: true,
        reason: "Event hidden"
    };

    const trainerState = options.trainerState || {
        hasCompletedEvent(eventId) {
            calls.hasCompletedEvent.push(eventId);

            if (typeof options.hasCompletedEvent === "function") {
                return options.hasCompletedEvent(eventId);
            }

            return false;
        }
    };

    const npcService = options.npcService === null
        ? null
        : {
            getNPC(npcId) {
                calls.getNPC.push(npcId);

                if (typeof options.getNPC === "function") {
                    return options.getNPC(npcId);
                }

                return npc;
            }
        };

    const eventService = {
        getEvent(npcId) {
            calls.getEvent.push(npcId);

            if (typeof options.getEvent === "function") {
                return options.getEvent(npcId);
            }

            return event;
        },

        canShowEvent(givenEvent, givenState) {
            calls.canShowEvent.push({
                event: givenEvent,
                trainerState: givenState
            });

            if (typeof options.canShowEvent === "function") {
                return options.canShowEvent(givenEvent, givenState);
            }

            return visibility;
        },

        getChoices(givenEvent, givenState) {
            calls.getChoices.push({
                event: givenEvent,
                trainerState: givenState
            });

            if (typeof options.getChoices === "function") {
                return options.getChoices(givenEvent, givenState);
            }

            return choices;
        },

        executeEvent(givenEvent, givenState) {
            calls.executeEvent.push({
                event: givenEvent,
                trainerState: givenState
            });

            if (typeof options.executeEvent === "function") {
                return options.executeEvent(givenEvent, givenState);
            }

            return execution;
        }
    };

    const dialogueService = {
        getDialogue(dialogueId) {
            calls.getDialogue.push(dialogueId);

            if (typeof options.getDialogue === "function") {
                return options.getDialogue(dialogueId);
            }

            return dialogueResults[dialogueId];
        }
    };

    const storyEventService = options.storyEventService === null
        ? null
        : options.storyEventService === undefined && options.noStoryEventService
            ? null
            : {
                getEvent(npcId) {
                    calls.getStoryEvent.push(npcId);

                    if (typeof options.getStoryEvent === "function") {
                        return options.getStoryEvent(npcId);
                    }

                    return storyEvent;
                },

                completeStoryEvent(npcId, givenState) {
                    calls.completeStoryEvent.push({
                        npcId,
                        trainerState: givenState
                    });

                    if (typeof options.completeStoryEvent === "function") {
                        return options.completeStoryEvent(npcId, givenState);
                    }
                }
            };

    const service = new NPCInteractionService(
        npcService,
        eventService,
        dialogueService,
        storyEventService
    );

    return {
        service,
        npc,
        event,
        storyEvent,
        trainerState,
        calls,
        npcService,
        eventService,
        dialogueService,
        storyEventService
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates an NPCInteractionService instance", () => {
    const mocks = createMocks();

    assert.ok(mocks.service instanceof NPCInteractionService);
});

test("constructor stores the NPC service", () => {
    const mocks = createMocks();

    assert.strictEqual(
        mocks.service.npcService,
        mocks.npcService
    );
});

test("constructor stores the event service", () => {
    const mocks = createMocks();

    assert.strictEqual(
        mocks.service.eventService,
        mocks.eventService
    );
});

test("constructor stores the dialogue service", () => {
    const mocks = createMocks();

    assert.strictEqual(
        mocks.service.dialogueService,
        mocks.dialogueService
    );
});

test("constructor defaults storyEventService to null", () => {
    const service = new NPCInteractionService(
        {},
        {},
        {}
    );

    assert.equal(service.storyEventService, null);
});

test("constructor stores the supplied story event service", () => {
    const mocks = createMocks();

    assert.strictEqual(
        mocks.service.storyEventService,
        mocks.storyEventService
    );
});

// --------------------------------------------------
// NPC and event lookup
// --------------------------------------------------

test("interact looks up the NPC using the supplied ID", () => {
    const mocks = createMocks();

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.deepEqual(mocks.calls.getNPC, ["NPC_1"]);
});

test("interact looks up a direct event using the NPC ID", () => {
    const mocks = createMocks();

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.deepEqual(mocks.calls.getEvent, ["NPC_1"]);
});

test("interact passes the trainer state through to visibility checks", () => {
    const mocks = createMocks();

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.strictEqual(
        mocks.calls.canShowEvent[0].trainerState,
        mocks.trainerState
    );
});

test("interact uses the direct event when one is found", () => {
    const directEvent = {
        id: "DIRECT_EVENT",
        dialogues: [],
        rewards: []
    };

    const mocks = createMocks({
        event: directEvent,
        storyEvent: {
            id: "STORY_EVENT",
            dialogues: []
        }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.equal(result.event, "DIRECT_EVENT");
    assert.deepEqual(mocks.calls.getStoryEvent, []);
});

test("interact resolves a story alias when no direct event exists", () => {
    const storyEvent = {
        id: "STORY_EVENT",
        dialogues: [],
        rewards: []
    };

    const mocks = createMocks({
        event: null,
        storyEvent
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.equal(result.event, "STORY_EVENT");
    assert.deepEqual(mocks.calls.getStoryEvent, ["NPC_1"]);
});

test("interact does not look up a story alias when there is no story event service", () => {
    const mocks = createMocks({
        event: null,
        noStoryEventService: true
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.deepEqual(result, {
        success: false,
        reason: "No event found"
    });

    assert.deepEqual(mocks.calls.getStoryEvent, []);
});

test("interact returns failure when neither direct nor story event exists", () => {
    const mocks = createMocks({
        event: null,
        storyEvent: null
    });

    assert.deepEqual(
        mocks.service.interact("NPC_1", mocks.trainerState),
        {
            success: false,
            reason: "No event found"
        }
    );
});

test("interact stops when no event exists", () => {
    const mocks = createMocks({
        event: null,
        storyEvent: null
    });

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.deepEqual(mocks.calls.canShowEvent, []);
    assert.deepEqual(mocks.calls.getDialogue, []);
    assert.deepEqual(mocks.calls.getChoices, []);
    assert.deepEqual(mocks.calls.executeEvent, []);
});

test("interact can proceed without an NPC service", () => {
    const mocks = createMocks({
        npcService: null
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.equal(result.success, true);
    assert.equal(result.npc, "NPC_1");
    assert.deepEqual(mocks.calls.getNPC, []);
});

// --------------------------------------------------
// One-time event completion
// --------------------------------------------------

test("interact rejects an already completed one-time event", () => {
    const mocks = createMocks({
        event: {
            id: "ONE_TIME_EVENT",
            oneTime: true,
            dialogues: []
        },
        hasCompletedEvent(eventId) {
            return eventId === "ONE_TIME_EVENT";
        }
    });

    assert.deepEqual(
        mocks.service.interact("NPC_1", mocks.trainerState),
        {
            success: false,
            event: "ONE_TIME_EVENT",
            reason: "Event already completed"
        }
    );
});

test("interact checks completion using the event ID", () => {
    const mocks = createMocks({
        event: {
            id: "ONE_TIME_EVENT",
            oneTime: true,
            dialogues: []
        }
    });

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.deepEqual(
        mocks.calls.hasCompletedEvent,
        ["ONE_TIME_EVENT"]
    );
});

test("interact does not check completion for a repeatable event", () => {
    const mocks = createMocks({
        event: {
            id: "REPEATABLE_EVENT",
            oneTime: false,
            dialogues: []
        }
    });

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.deepEqual(mocks.calls.hasCompletedEvent, []);
});

test("interact continues when a one-time event has not been completed", () => {
    const mocks = createMocks({
        event: {
            id: "ONE_TIME_EVENT",
            oneTime: true,
            dialogues: []
        },
        hasCompletedEvent() {
            return false;
        }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.equal(result.success, true);
    assert.deepEqual(mocks.calls.canShowEvent.length, 1);
});

test("interact returns before checking visibility for a completed event", () => {
    const mocks = createMocks({
        event: {
            id: "ONE_TIME_EVENT",
            oneTime: true,
            dialogues: []
        },
        hasCompletedEvent() {
            return true;
        }
    });

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.deepEqual(mocks.calls.canShowEvent, []);
});

test("interact skips the completion check when trainer state has no method", () => {
    const mocks = createMocks({
        event: {
            id: "ONE_TIME_EVENT",
            oneTime: true,
            dialogues: []
        }
    });

    const state = {};

    const result = mocks.service.interact("NPC_1", state);

    assert.equal(result.success, true);
});

test("interact propagates errors from hasCompletedEvent", () => {
    const expectedError = new Error("Completion lookup failed");

    const mocks = createMocks({
        event: {
            id: "ONE_TIME_EVENT",
            oneTime: true,
            dialogues: []
        },
        hasCompletedEvent() {
            throw expectedError;
        }
    });

    assert.throws(
        () => mocks.service.interact("NPC_1", mocks.trainerState),
        error => error === expectedError
    );
});

// --------------------------------------------------
// Visibility
// --------------------------------------------------

test("interact returns a failure when the event is not visible", () => {
    const mocks = createMocks({
        visibility: {
            visible: false,
            reason: "Requires the first badge"
        }
    });

    assert.deepEqual(
        mocks.service.interact("NPC_1", mocks.trainerState),
        {
            success: false,
            reason: "Requires the first badge"
        }
    );
});

test("interact passes the event to canShowEvent", () => {
    const mocks = createMocks();

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.strictEqual(
        mocks.calls.canShowEvent[0].event,
        mocks.event
    );
});

test("interact stops before dialogue loading when the event is hidden", () => {
    const mocks = createMocks({
        visibility: {
            visible: false,
            reason: "Not available yet"
        }
    });

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.deepEqual(mocks.calls.getDialogue, []);
    assert.deepEqual(mocks.calls.getChoices, []);
    assert.deepEqual(mocks.calls.executeEvent, []);
});

test("interact propagates errors from canShowEvent", () => {
    const expectedError = new Error("Visibility failed");

    const mocks = createMocks({
        canShowEvent() {
            throw expectedError;
        }
    });

    assert.throws(
        () => mocks.service.interact("NPC_1", mocks.trainerState),
        error => error === expectedError
    );
});

// --------------------------------------------------
// Dialogue loading
// --------------------------------------------------

test("interact loads dialogue records from event dialogue IDs", () => {
    const event = {
        id: "EVENT_1",
        dialogues: ["DIALOGUE_A", "DIALOGUE_B"],
        rewards: []
    };

    const dialogueA = { id: "DIALOGUE_A", text: "Hello" };
    const dialogueB = { id: "DIALOGUE_B", text: "Goodbye" };

    const mocks = createMocks({
        event,
        dialogueResults: {
            DIALOGUE_A: dialogueA,
            DIALOGUE_B: dialogueB
        }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.deepEqual(mocks.calls.getDialogue, [
        "DIALOGUE_A",
        "DIALOGUE_B"
    ]);

    assert.deepEqual(result.dialogues, [dialogueA, dialogueB]);
});

test("interact filters out dialogue results that are falsey", () => {
    const event = {
        id: "EVENT_1",
        dialogues: ["VALID", "MISSING", "EMPTY"],
        rewards: []
    };

    const validDialogue = {
        id: "VALID",
        text: "Welcome"
    };

    const mocks = createMocks({
        event,
        dialogueResults: {
            VALID: validDialogue,
            MISSING: null,
            EMPTY: false
        }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.deepEqual(
        result.dialogues,
        [validDialogue]
    );
});

test("interact returns an empty dialogue array when no dialogues are configured", () => {
    const mocks = createMocks({
        event: {
            id: "EVENT_1",
            dialogues: [],
            rewards: []
        }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.deepEqual(result.dialogues, []);
    assert.deepEqual(mocks.calls.getDialogue, []);
});

test("interact returns an empty dialogue array when dialogues is absent", () => {
    const mocks = createMocks({
        event: {
            id: "EVENT_1",
            rewards: []
        }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.deepEqual(result.dialogues, []);
});

test("interact preserves dialogue order", () => {
    const event = {
        id: "EVENT_1",
        dialogues: ["D3", "D1", "D2"],
        rewards: []
    };

    const mocks = createMocks({
        event,
        dialogueResults: {
            D1: { id: "D1" },
            D2: { id: "D2" },
            D3: { id: "D3" }
        }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.deepEqual(
        result.dialogues.map(dialogue => dialogue.id),
        ["D3", "D1", "D2"]
    );
});

test("interact propagates errors from getDialogue", () => {
    const expectedError = new Error("Dialogue lookup failed");

    const mocks = createMocks({
        getDialogue() {
            throw expectedError;
        }
    });

    assert.throws(
        () => mocks.service.interact("NPC_1", mocks.trainerState),
        error => error === expectedError
    );
});

// --------------------------------------------------
// Choices and event execution
// --------------------------------------------------

test("interact retrieves choices from the event service", () => {
    const choiceList = [
        { id: "YES", text: "Yes" },
        { id: "NO", text: "No" }
    ];

    const mocks = createMocks({
        choices: choiceList
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.deepEqual(result.choices, choiceList);
    assert.strictEqual(
        mocks.calls.getChoices[0].event,
        mocks.event
    );
    assert.strictEqual(
        mocks.calls.getChoices[0].trainerState,
        mocks.trainerState
    );
});

test("interact does not execute an event when choices are available", () => {
    const mocks = createMocks({
        choices: [
            { id: "OPTION_1" }
        ]
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.equal(result.success, true);
    assert.deepEqual(result.choices, [{ id: "OPTION_1" }]);
    assert.equal(result.execution, null);
    assert.deepEqual(mocks.calls.executeEvent, []);
});

test("interact executes an event when no choices are available", () => {
    const mocks = createMocks({
        choices: [],
        execution: { success: true }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.equal(mocks.calls.executeEvent.length, 1);
    assert.strictEqual(
        mocks.calls.executeEvent[0].event,
        mocks.event
    );
    assert.strictEqual(
        mocks.calls.executeEvent[0].trainerState,
        mocks.trainerState
    );
    assert.deepEqual(result.execution, { success: true });
});

test("interact returns the execution success status", () => {
    const mocks = createMocks({
        execution: { success: false }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.equal(result.success, false);
    assert.deepEqual(result.execution, { success: false });
});

test("interact completes the story event after successful execution", () => {
    const mocks = createMocks({
        execution: { success: true }
    });

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.deepEqual(
        mocks.calls.completeStoryEvent,
        [{
            npcId: "NPC_1",
            trainerState: mocks.trainerState
        }]
    );
});

test("interact does not complete the story event after failed execution", () => {
    const mocks = createMocks({
        execution: { success: false }
    });

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.deepEqual(mocks.calls.completeStoryEvent, []);
});

test("interact does not complete the story event when choices are available", () => {
    const mocks = createMocks({
        choices: [{ id: "OPTION_1" }]
    });

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.deepEqual(mocks.calls.completeStoryEvent, []);
});

test("interact does not complete a companion story without storyEventService", () => {
    const mocks = createMocks({
        noStoryEventService: true,
        execution: { success: true }
    });

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.deepEqual(mocks.calls.completeStoryEvent, []);
});

test("interact throws when event execution returns null", () => {
    const mocks = createMocks({
        execution: null
    });

    assert.throws(
        () => mocks.service.interact("NPC_1", mocks.trainerState),
        TypeError
    );

    assert.deepEqual(mocks.calls.completeStoryEvent, []);
});

test("interact uses the NPC ID when completing the story event", () => {
    const mocks = createMocks();

    mocks.service.interact("CUSTOM_NPC_ID", mocks.trainerState);

    assert.equal(
        mocks.calls.completeStoryEvent[0].npcId,
        "CUSTOM_NPC_ID"
    );
});

test("interact propagates errors from getChoices", () => {
    const expectedError = new Error("Choice lookup failed");

    const mocks = createMocks({
        getChoices() {
            throw expectedError;
        }
    });

    assert.throws(
        () => mocks.service.interact("NPC_1", mocks.trainerState),
        error => error === expectedError
    );
});

test("interact propagates errors from executeEvent", () => {
    const expectedError = new Error("Execution failed");

    const mocks = createMocks({
        executeEvent() {
            throw expectedError;
        }
    });

    assert.throws(
        () => mocks.service.interact("NPC_1", mocks.trainerState),
        error => error === expectedError
    );
});

test("interact propagates errors from completeStoryEvent", () => {
    const expectedError = new Error("Story completion failed");

    const mocks = createMocks({
        completeStoryEvent() {
            throw expectedError;
        }
    });

    assert.throws(
        () => mocks.service.interact("NPC_1", mocks.trainerState),
        error => error === expectedError
    );
});

// --------------------------------------------------
// Response shape and rewards
// --------------------------------------------------

test("interact returns the NPC object when one is found", () => {
    const npc = {
        id: "NPC_1",
        name: "Professor"
    };

    const mocks = createMocks({ npc });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.strictEqual(result.npc, npc);
});

test("interact falls back to the NPC ID when no NPC record is found", () => {
    const mocks = createMocks({
        npc: null
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.equal(result.npc, "NPC_1");
});

test("interact returns the event ID", () => {
    const mocks = createMocks({
        event: {
            id: "CUSTOM_EVENT",
            dialogues: [],
            rewards: []
        }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.equal(result.event, "CUSTOM_EVENT");
});

test("interact returns event rewards", () => {
    const rewards = [
        { type: "ITEM", id: "POTION", quantity: 2 },
        { type: "MONEY", amount: 500 }
    ];

    const mocks = createMocks({
        event: {
            id: "EVENT_1",
            dialogues: [],
            rewards
        }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.strictEqual(result.rewards, rewards);
});

test("interact returns an empty rewards array when rewards are absent", () => {
    const mocks = createMocks({
        event: {
            id: "EVENT_1",
            dialogues: []
        }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.deepEqual(result.rewards, []);
});

test("interact returns an empty rewards array when rewards are null", () => {
    const mocks = createMocks({
        event: {
            id: "EVENT_1",
            dialogues: [],
            rewards: null
        }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.deepEqual(result.rewards, []);
});

test("interact returns all expected response fields", () => {
    const npc = { id: "NPC_1" };
    const event = {
        id: "EVENT_1",
        dialogues: ["DIALOGUE_1"],
        rewards: [{ type: "ITEM", id: "POTION" }]
    };

    const dialogue = {
        id: "DIALOGUE_1",
        text: "Hello"
    };

    const mocks = createMocks({
        npc,
        event,
        dialogueResults: {
            DIALOGUE_1: dialogue
        },
        execution: { success: true }
    });

    const result = mocks.service.interact(
        "NPC_1",
        mocks.trainerState
    );

    assert.deepEqual(result, {
        success: true,
        npc,
        event: "EVENT_1",
        dialogues: [dialogue],
        choices: [],
        rewards: event.rewards,
        execution: { success: true }
    });
});

// --------------------------------------------------
// State handling and call ordering
// --------------------------------------------------

test("interact passes the same trainer state to each event operation", () => {
    const state = {
        marker: "test-state",
        hasCompletedEvent() {
            return false;
        }
    };

    const mocks = createMocks({
        event: {
            id: "ONE_TIME_EVENT",
            oneTime: true,
            dialogues: []
        },
        trainerState: state
    });

    mocks.service.interact("NPC_1", state);

    assert.strictEqual(
        mocks.calls.canShowEvent[0].trainerState,
        state
    );
    assert.strictEqual(
        mocks.calls.getChoices[0].trainerState,
        state
    );
    assert.strictEqual(
        mocks.calls.executeEvent[0].trainerState,
        state
    );
    assert.strictEqual(
        mocks.calls.completeStoryEvent[0].trainerState,
        state
    );
});

test("interact finds the NPC and direct event before checking visibility", () => {
    const mocks = createMocks();

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.deepEqual(
        [
            mocks.calls.getNPC.length,
            mocks.calls.getEvent.length,
            mocks.calls.canShowEvent.length
        ],
        [1, 1, 1]
    );
});

test("interact resolves a story alias before returning no-event failure", () => {
    const mocks = createMocks({
        event: null,
        storyEvent: null
    });

    mocks.service.interact("NPC_1", mocks.trainerState);

    assert.deepEqual(mocks.calls.getEvent, ["NPC_1"]);
    assert.deepEqual(mocks.calls.getStoryEvent, ["NPC_1"]);
});

test("interact does not mutate the supplied trainer state directly", () => {
    const state = {
        badges: ["BOULDER_BADGE"],
        visitedLocations: [],
        storyFlags: []
    };

    const original = {
        badges: [...state.badges],
        visitedLocations: [...state.visitedLocations],
        storyFlags: [...state.storyFlags]
    };

    const mocks = createMocks({
        trainerState: state
    });

    mocks.service.interact("NPC_1", state);

    assert.deepEqual(state, original);
});

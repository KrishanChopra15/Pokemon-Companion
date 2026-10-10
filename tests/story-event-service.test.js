"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const StoryEventService = require("../scripts/services/story-event-service");
const mappings = require("../scripts/rules/firered-event-mappings");

const UNKNOWN_STORY_ID = "__UNKNOWN_STORY_EVENT_FOR_TESTS__";
const STORY_IDS = Object.keys(mappings);

const VALID_STORY_ID = STORY_IDS.find(
    id => mappings[id] && typeof mappings[id] === "object"
);

const MAPPING_WITH_COMPLETION_FLAG = STORY_IDS.find(
    id => mappings[id] && mappings[id].completionFlag
);

const MAPPING_WITHOUT_COMPLETION_FLAG = STORY_IDS.find(
    id => mappings[id] && !mappings[id].completionFlag
);

const MAPPING_WITH_REWARDS = STORY_IDS.find(
    id => mappings[id] &&
        mappings[id].rewards &&
        typeof mappings[id].rewards === "object"
);

const MAPPING_WITH_KEY_ITEMS = STORY_IDS.find(
    id => mappings[id] &&
        mappings[id].rewards &&
        Array.isArray(mappings[id].rewards.addKeyItems) &&
        mappings[id].rewards.addKeyItems.length > 0
);

const MAPPING_WITH_EXTRA_FLAGS = STORY_IDS.find(
    id => mappings[id] &&
        mappings[id].rewards &&
        Array.isArray(mappings[id].rewards.addStoryFlags) &&
        mappings[id].rewards.addStoryFlags.length > 0
);

function createService(eventService = {}) {
    return new StoryEventService(eventService);
}

function createTrainerState() {
    const calls = {
        addedKeyItems: [],
        addedStoryFlags: []
    };

    const trainerState = {
        addKeyItem(item) {
            calls.addedKeyItems.push(item);
        },

        addStoryFlag(flag) {
            calls.addedStoryFlags.push(flag);
        }
    };

    return { trainerState, calls };
}

function createEventService(event = { id: "ROM_EVENT_1" }) {
    const calls = {
        eventIds: []
    };

    const eventService = {
        getEvent(eventId) {
            calls.eventIds.push(eventId);
            return event;
        }
    };

    return { eventService, calls, event };
}

// --------------------------------------------------
// Construction
// --------------------------------------------------

test("constructor creates a StoryEventService instance", () => {
    assert.ok(createService() instanceof StoryEventService);
});

test("constructor stores the supplied event service", () => {
    const eventService = {};

    assert.strictEqual(
        createService(eventService).eventService,
        eventService
    );
});

test("constructor preserves a null event service", () => {
    assert.equal(createService(null).eventService, null);
});

test("constructor preserves an undefined event service", () => {
    const service = new StoryEventService(undefined);

    assert.equal(service.eventService, undefined);
});

test("story mapping database contains accessible mapping keys", () => {
    assert.ok(Array.isArray(STORY_IDS));
    assert.ok(STORY_IDS.length > 0);
});

test("at least one valid story mapping can be identified", () => {
    assert.notEqual(VALID_STORY_ID, undefined);
    assert.equal(typeof mappings[VALID_STORY_ID], "object");
});

// --------------------------------------------------
// hasMapping
// --------------------------------------------------

test("hasMapping returns true for a known story event", () => {
    assert.equal(
        createService().hasMapping(VALID_STORY_ID),
        true
    );
});

test("hasMapping returns false for an unknown story event", () => {
    assert.equal(
        createService().hasMapping(UNKNOWN_STORY_ID),
        false
    );
});

test("hasMapping returns false for an empty story ID", () => {
    assert.equal(createService().hasMapping(""), false);
});

test("hasMapping returns false for a null story ID", () => {
    assert.equal(createService().hasMapping(null), false);
});

test("hasMapping returns false for an undefined story ID", () => {
    assert.equal(createService().hasMapping(undefined), false);
});

test("hasMapping uses exact story ID matching", () => {
    const storyId = VALID_STORY_ID;

    assert.equal(createService().hasMapping(storyId), true);
    assert.equal(
        createService().hasMapping(storyId.toLowerCase()),
        mappings[storyId.toLowerCase()] ? true : false
    );
});

test("hasMapping returns a boolean", () => {
    const service = createService();

    for (const storyId of [VALID_STORY_ID, UNKNOWN_STORY_ID, "", null]) {
        assert.equal(typeof service.hasMapping(storyId), "boolean");
    }
});

// --------------------------------------------------
// getEventId
// --------------------------------------------------

test("getEventId returns the mapped ROM event ID", () => {
    const mapping = mappings[VALID_STORY_ID];

    assert.equal(
        createService().getEventId(VALID_STORY_ID),
        mapping.eventId
    );
});

test("getEventId agrees with the stored mapping", () => {
    const service = createService();

    for (const storyId of STORY_IDS) {
        if (!mappings[storyId]) {
            continue;
        }

        assert.equal(
            service.getEventId(storyId),
            mappings[storyId].eventId
        );
    }
});

test("getEventId returns null for an unknown story ID", () => {
    assert.equal(
        createService().getEventId(UNKNOWN_STORY_ID),
        null
    );
});

test("getEventId returns null for an empty story ID", () => {
    assert.equal(createService().getEventId(""), null);
});

test("getEventId returns null for a null story ID", () => {
    assert.equal(createService().getEventId(null), null);
});

test("getEventId returns null for an undefined story ID", () => {
    assert.equal(createService().getEventId(undefined), null);
});

test("getEventId does not require an event service", () => {
    assert.equal(
        createService(null).getEventId(VALID_STORY_ID),
        mappings[VALID_STORY_ID].eventId
    );
});

// --------------------------------------------------
// getCompletionFlag
// --------------------------------------------------

test("getCompletionFlag returns the configured flag when available", {
    skip: !MAPPING_WITH_COMPLETION_FLAG
}, () => {
    assert.equal(
        createService().getCompletionFlag(MAPPING_WITH_COMPLETION_FLAG),
        mappings[MAPPING_WITH_COMPLETION_FLAG].completionFlag
    );
});

test("getCompletionFlag returns null when a mapping has no completion flag", {
    skip: !MAPPING_WITHOUT_COMPLETION_FLAG
}, () => {
    assert.equal(
        createService().getCompletionFlag(MAPPING_WITHOUT_COMPLETION_FLAG),
        null
    );
});

test("getCompletionFlag returns null for an unknown story ID", () => {
    assert.equal(
        createService().getCompletionFlag(UNKNOWN_STORY_ID),
        null
    );
});

test("getCompletionFlag returns null for an empty story ID", () => {
    assert.equal(createService().getCompletionFlag(""), null);
});

test("getCompletionFlag returns null for a null story ID", () => {
    assert.equal(createService().getCompletionFlag(null), null);
});

test("getCompletionFlag returns null for an undefined story ID", () => {
    assert.equal(
        createService().getCompletionFlag(undefined),
        null
    );
});

test("getCompletionFlag does not require an event service", () => {
    assert.equal(
        createService(null).getCompletionFlag(VALID_STORY_ID),
        mappings[VALID_STORY_ID].completionFlag || null
    );
});

// --------------------------------------------------
// getEvent
// --------------------------------------------------

test("getEvent delegates using the mapped ROM event ID", () => {
    const { eventService, calls, event } = createEventService();
    const service = createService(eventService);

    assert.strictEqual(service.getEvent(VALID_STORY_ID), event);

    assert.deepEqual(calls.eventIds, [
        mappings[VALID_STORY_ID].eventId
    ]);
});

test("getEvent returns the exact event returned by the event service", () => {
    const event = {
        id: "EVENT_CUSTOM",
        nested: { value: 42 }
    };
    const { eventService } = createEventService(event);

    assert.strictEqual(
        createService(eventService).getEvent(VALID_STORY_ID),
        event
    );
});

test("getEvent returns null for an unknown story event", () => {
    const { eventService, calls } = createEventService();

    assert.equal(
        createService(eventService).getEvent(UNKNOWN_STORY_ID),
        null
    );

    assert.deepEqual(calls.eventIds, []);
});

test("getEvent returns null for a null story ID", () => {
    const { eventService, calls } = createEventService();

    assert.equal(createService(eventService).getEvent(null), null);
    assert.deepEqual(calls.eventIds, []);
});

test("getEvent returns null for an empty story ID", () => {
    const { eventService, calls } = createEventService();

    assert.equal(createService(eventService).getEvent(""), null);
    assert.deepEqual(calls.eventIds, []);
});

test("getEvent does not query the event service for an unknown story", () => {
    let calls = 0;

    const service = createService({
        getEvent() {
            calls++;
        }
    });

    service.getEvent(UNKNOWN_STORY_ID);

    assert.equal(calls, 0);
});

test("getEvent propagates errors from the event service", () => {
    const service = createService({
        getEvent() {
            throw new Error("Event lookup failed");
        }
    });

    assert.throws(
        () => service.getEvent(VALID_STORY_ID),
        /Event lookup failed/
    );
});

test("getEvent propagates an undefined event-service error for a known story", () => {
    const service = createService(undefined);

    assert.throws(
        () => service.getEvent(VALID_STORY_ID),
        TypeError
    );
});

test("getEvent propagates errors when getEvent is not callable", () => {
    const service = createService({
        getEvent: true
    });

    assert.throws(
        () => service.getEvent(VALID_STORY_ID),
        TypeError
    );
});

// --------------------------------------------------
// completeStoryEvent: unknown IDs
// --------------------------------------------------

test("completeStoryEvent rejects an unknown story event", () => {
    assert.deepEqual(
        createService().completeStoryEvent(UNKNOWN_STORY_ID, {}),
        {
            success: false,
            reason: "Unknown story event"
        }
    );
});

test("completeStoryEvent rejects an unknown event without trainer state", () => {
    assert.deepEqual(
        createService().completeStoryEvent(UNKNOWN_STORY_ID, null),
        {
            success: false,
            reason: "Unknown story event"
        }
    );
});

test("completeStoryEvent rejects an empty story ID", () => {
    assert.deepEqual(
        createService().completeStoryEvent("", {}),
        {
            success: false,
            reason: "Unknown story event"
        }
    );
});

test("completeStoryEvent rejects a null story ID", () => {
    assert.deepEqual(
        createService().completeStoryEvent(null, {}),
        {
            success: false,
            reason: "Unknown story event"
        }
    );
});

test("completeStoryEvent rejects an undefined story ID", () => {
    assert.deepEqual(
        createService().completeStoryEvent(undefined, {}),
        {
            success: false,
            reason: "Unknown story event"
        }
    );
});

// --------------------------------------------------
// completeStoryEvent: completion flags
// --------------------------------------------------

test("completeStoryEvent adds the configured completion flag", {
    skip: !MAPPING_WITH_COMPLETION_FLAG
}, () => {
    const storyId = MAPPING_WITH_COMPLETION_FLAG;
    const mapping = mappings[storyId];
    const { trainerState, calls } = createTrainerState();

    const result = createService().completeStoryEvent(
        storyId,
        trainerState
    );

    assert.equal(result.success, true);
    assert.equal(result.storyId, storyId);
    assert.equal(result.completionFlag, mapping.completionFlag);

    assert.ok(
        calls.addedStoryFlags.includes(mapping.completionFlag)
    );
});

test("completeStoryEvent adds the completion flag exactly once unless it also appears in additional rewards", {
    skip: !MAPPING_WITH_COMPLETION_FLAG
}, () => {
    const storyId = MAPPING_WITH_COMPLETION_FLAG;
    const flag = mappings[storyId].completionFlag;
    const { trainerState, calls } = createTrainerState();

    createService().completeStoryEvent(storyId, trainerState);

    const expectedCount = 1 +
        (mappings[storyId].rewards?.addStoryFlags || [])
            .filter(item => item === flag).length;

    assert.equal(
        calls.addedStoryFlags.filter(item => item === flag).length,
        expectedCount
    );
});

test("completeStoryEvent returns null completionFlag when the mapping has none", {
    skip: !MAPPING_WITHOUT_COMPLETION_FLAG
}, () => {
    const storyId = MAPPING_WITHOUT_COMPLETION_FLAG;
    const { trainerState } = createTrainerState();

    const result = createService().completeStoryEvent(
        storyId,
        trainerState
    );

    assert.deepEqual(result, {
        success: true,
        storyId,
        completionFlag: null
    });
});

test("completeStoryEvent does not add a completion flag when none is configured", {
    skip: !MAPPING_WITHOUT_COMPLETION_FLAG
}, () => {
    const storyId = MAPPING_WITHOUT_COMPLETION_FLAG;
    const { trainerState, calls } = createTrainerState();

    createService().completeStoryEvent(storyId, trainerState);

    const additionalFlags =
        mappings[storyId].rewards?.addStoryFlags || [];

    assert.deepEqual(calls.addedStoryFlags, additionalFlags);
});

// --------------------------------------------------
// completeStoryEvent: key-item rewards
// --------------------------------------------------

test("completeStoryEvent grants mapped key-item rewards", {
    skip: !MAPPING_WITH_KEY_ITEMS
}, () => {
    const storyId = MAPPING_WITH_KEY_ITEMS;
    const expectedItems =
        mappings[storyId].rewards.addKeyItems;
    const { trainerState, calls } = createTrainerState();

    createService().completeStoryEvent(storyId, trainerState);

    assert.deepEqual(calls.addedKeyItems, expectedItems);
});

test("completeStoryEvent preserves key-item reward order", {
    skip: !MAPPING_WITH_KEY_ITEMS
}, () => {
    const storyId = MAPPING_WITH_KEY_ITEMS;
    const { trainerState, calls } = createTrainerState();

    createService().completeStoryEvent(storyId, trainerState);

    assert.deepEqual(
        calls.addedKeyItems,
        mappings[storyId].rewards.addKeyItems
    );
});

test("completeStoryEvent passes key-item reward values directly to the trainer state", {
    skip: !MAPPING_WITH_KEY_ITEMS
}, () => {
    const storyId = MAPPING_WITH_KEY_ITEMS;
    const { trainerState, calls } = createTrainerState();

    createService().completeStoryEvent(storyId, trainerState);

    for (const item of mappings[storyId].rewards.addKeyItems) {
        assert.ok(calls.addedKeyItems.includes(item));
    }
});

// --------------------------------------------------
// completeStoryEvent: additional story flags
// --------------------------------------------------

test("completeStoryEvent grants mapped additional story flags", {
    skip: !MAPPING_WITH_EXTRA_FLAGS
}, () => {
    const storyId = MAPPING_WITH_EXTRA_FLAGS;
    const mapping = mappings[storyId];
    const { trainerState, calls } = createTrainerState();

    createService().completeStoryEvent(storyId, trainerState);

    assert.deepEqual(
        calls.addedStoryFlags,
        [
            ...(mapping.completionFlag ? [mapping.completionFlag] : []),
            ...mapping.rewards.addStoryFlags
        ]
    );
});

test("completeStoryEvent preserves additional story flag order", {
    skip: !MAPPING_WITH_EXTRA_FLAGS
}, () => {
    const storyId = MAPPING_WITH_EXTRA_FLAGS;
    const { trainerState, calls } = createTrainerState();

    createService().completeStoryEvent(storyId, trainerState);

    const expectedFlags = [
        ...(mappings[storyId].completionFlag
            ? [mappings[storyId].completionFlag]
            : []),
        ...mappings[storyId].rewards.addStoryFlags
    ];

    assert.deepEqual(calls.addedStoryFlags, expectedFlags);
});

// --------------------------------------------------
// completeStoryEvent: reward handling
// --------------------------------------------------

test("completeStoryEvent succeeds for a known mapping with the expected result", () => {
    const storyId = VALID_STORY_ID;
    const mapping = mappings[storyId];
    const { trainerState } = createTrainerState();

    assert.deepEqual(
        createService().completeStoryEvent(storyId, trainerState),
        {
            success: true,
            storyId,
            completionFlag: mapping.completionFlag || null
        }
    );
});

test("completeStoryEvent uses an empty reward object when rewards are absent", {
    skip: !STORY_IDS.some(
        id => mappings[id] && !mappings[id].rewards
    )
}, () => {
    const storyId = STORY_IDS.find(
        id => mappings[id] && !mappings[id].rewards
    );
    const { trainerState, calls } = createTrainerState();

    const result = createService().completeStoryEvent(
        storyId,
        trainerState
    );

    assert.equal(result.success, true);
    assert.deepEqual(calls.addedKeyItems, []);

    assert.deepEqual(
        calls.addedStoryFlags,
        mappings[storyId].completionFlag
            ? [mappings[storyId].completionFlag]
            : []
    );
});

test("completeStoryEvent does not modify the mapping database", () => {
    const mapping = mappings[VALID_STORY_ID];
    const original = JSON.stringify(mapping);
    const { trainerState } = createTrainerState();

    createService().completeStoryEvent(
        VALID_STORY_ID,
        trainerState
    );

    assert.equal(JSON.stringify(mapping), original);
});

test("completeStoryEvent does not require an event service", () => {
    const { trainerState } = createTrainerState();

    const result = createService(null).completeStoryEvent(
        VALID_STORY_ID,
        trainerState
    );

    assert.equal(result.success, true);
});

test("completeStoryEvent propagates missing addStoryFlag when completion flag is configured", {
    skip: !MAPPING_WITH_COMPLETION_FLAG
}, () => {
    assert.throws(
        () => createService().completeStoryEvent(
            MAPPING_WITH_COMPLETION_FLAG,
            {}
        ),
        TypeError
    );
});

test("completeStoryEvent propagates missing addKeyItem when key-item rewards exist", {
    skip: !MAPPING_WITH_KEY_ITEMS
}, () => {
    const storyId = MAPPING_WITH_KEY_ITEMS;
    const trainerState = {
        addStoryFlag() {}
    };

    assert.throws(
        () => createService().completeStoryEvent(
            storyId,
            trainerState
        ),
        TypeError
    );
});

test("completeStoryEvent propagates missing addStoryFlag for additional flag rewards", {
    skip: !MAPPING_WITH_EXTRA_FLAGS
}, () => {
    const storyId = MAPPING_WITH_EXTRA_FLAGS;
    const trainerState = {
        addKeyItem() {}
    };

    assert.throws(
        () => createService().completeStoryEvent(
            storyId,
            trainerState
        ),
        TypeError
    );
});

test("completeStoryEvent propagates errors from addStoryFlag", {
    skip: !MAPPING_WITH_COMPLETION_FLAG
}, () => {
    const trainerState = {
        addStoryFlag() {
            throw new Error("Cannot add story flag");
        },
        addKeyItem() {}
    };

    assert.throws(
        () => createService().completeStoryEvent(
            MAPPING_WITH_COMPLETION_FLAG,
            trainerState
        ),
        /Cannot add story flag/
    );
});

test("completeStoryEvent propagates errors from addKeyItem", {
    skip: !MAPPING_WITH_KEY_ITEMS
}, () => {
    const trainerState = {
        addStoryFlag() {},
        addKeyItem() {
            throw new Error("Cannot add key item");
        }
    };

    assert.throws(
        () => createService().completeStoryEvent(
            MAPPING_WITH_KEY_ITEMS,
            trainerState
        ),
        /Cannot add key item/
    );
});

// --------------------------------------------------
// Cross-check every mapped story event
// --------------------------------------------------

test("every mapping can be queried consistently", () => {
    const service = createService();
    let checked = 0;

    for (const storyId of STORY_IDS) {
        if (!mappings[storyId]) {
            continue;
        }

        assert.equal(service.hasMapping(storyId), true);
        assert.equal(service.getEventId(storyId), mappings[storyId].eventId);
        assert.equal(
            service.getCompletionFlag(storyId),
            mappings[storyId].completionFlag || null
        );

        checked++;
    }

    assert.ok(checked > 0);
});

test("every mapped story event delegates to its configured event ID", () => {
    const calls = [];
    const eventService = {
        getEvent(eventId) {
            calls.push(eventId);
            return { id: eventId };
        }
    };

    const service = createService(eventService);

    for (const storyId of STORY_IDS) {
        if (!mappings[storyId]) {
            continue;
        }

        const event = service.getEvent(storyId);

        assert.deepEqual(event, {
            id: mappings[storyId].eventId
        });
    }

    assert.deepEqual(
        calls,
        STORY_IDS
            .filter(id => mappings[id])
            .map(id => mappings[id].eventId)
    );
});

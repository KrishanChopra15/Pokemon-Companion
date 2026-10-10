"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const ObjectiveService = require("../scripts/services/objective-service");

// --------------------------------------------------
// Test helpers
// --------------------------------------------------

function createMocks(options = {}) {
    const calls = {
        story: [],
        gym: [],
        progression: []
    };

    const storyObjectives =
        options.storyObjectives || [];

    const gymObjectives =
        options.gymObjectives || [];

    const progressionObjectives =
        options.progressionObjectives || [];

    const storyService = options.story === null
        ? null
        : {
            getNextObjectives(trainerState) {
                calls.story.push(trainerState);

                if (typeof options.getNextObjectives === "function") {
                    return options.getNextObjectives(trainerState);
                }

                return storyObjectives;
            }
        };

    const gymService = options.gym === null
        ? null
        : options.gymWithoutMethod
            ? {}
            : {
                getAvailableGyms(trainerState) {
                    calls.gym.push(trainerState);

                    if (typeof options.getAvailableGyms === "function") {
                        return options.getAvailableGyms(trainerState);
                    }

                    return gymObjectives;
                }
            };

    const progressionService = options.progression === null
        ? null
        : options.progressionWithoutMethod
            ? {}
            : {
                getObjectives(trainerState) {
                    calls.progression.push(trainerState);

                    if (typeof options.getProgressionObjectives === "function") {
                        return options.getProgressionObjectives(trainerState);
                    }

                    return progressionObjectives;
                }
            };

    const service = new ObjectiveService(
        storyService,
        gymService,
        progressionService
    );

    return {
        service,
        calls,
        storyService,
        gymService,
        progressionService
    };
}

function storyObjective(id, description, location) {
    return { id, description, location };
}

function gymObjective(id, name, city) {
    return { id, name, city };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates an ObjectiveService instance", () => {
    const mocks = createMocks();

    assert.ok(mocks.service instanceof ObjectiveService);
});

test("constructor stores the story progression service", () => {
    const mocks = createMocks();

    assert.strictEqual(
        mocks.service.story,
        mocks.storyService
    );
});

test("constructor defaults gym service to null", () => {
    const service = new ObjectiveService({});

    assert.equal(service.gym, null);
});

test("constructor defaults progression service to null", () => {
    const service = new ObjectiveService({});

    assert.equal(service.progression, null);
});

test("constructor stores the supplied gym service", () => {
    const mocks = createMocks();

    assert.strictEqual(
        mocks.service.gym,
        mocks.gymService
    );
});

test("constructor stores the supplied progression service", () => {
    const mocks = createMocks();

    assert.strictEqual(
        mocks.service.progression,
        mocks.progressionService
    );
});

// --------------------------------------------------
// getStoryObjectives
// --------------------------------------------------

test("getStoryObjectives returns an empty array without a story service", () => {
    const mocks = createMocks({ story: null });

    assert.deepEqual(
        mocks.service.getStoryObjectives({}),
        []
    );
});

test("getStoryObjectives delegates to getNextObjectives", () => {
    const state = { storyFlags: ["MET_RIVAL"] };
    const mocks = createMocks();

    mocks.service.getStoryObjectives(state);

    assert.deepEqual(mocks.calls.story, [state]);
});

test("getStoryObjectives passes the original trainer state", () => {
    const state = { marker: true };
    const mocks = createMocks();

    mocks.service.getStoryObjectives(state);

    assert.strictEqual(mocks.calls.story[0], state);
});

test("getStoryObjectives maps story records to STORY objectives", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Meet the Professor", "PALLET_TOWN"),
            storyObjective("S2", "Visit the lab", "LAB")
        ]
    });

    assert.deepEqual(
        mocks.service.getStoryObjectives({}),
        [
            {
                type: "STORY",
                id: "S1",
                title: "Meet the Professor",
                location: "PALLET_TOWN"
            },
            {
                type: "STORY",
                id: "S2",
                title: "Visit the lab",
                location: "LAB"
            }
        ]
    );
});

test("getStoryObjectives maps description to title", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Defeat the rival", "ROUTE_1")
        ]
    });

    const result = mocks.service.getStoryObjectives({});

    assert.equal(result[0].title, "Defeat the rival");
});

test("getStoryObjectives preserves IDs and locations", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("STORY_42", "Continue journey", "CERULEAN_CITY")
        ]
    });

    const result = mocks.service.getStoryObjectives({});

    assert.equal(result[0].id, "STORY_42");
    assert.equal(result[0].location, "CERULEAN_CITY");
});

test("getStoryObjectives returns an empty array when no story objectives exist", () => {
    const mocks = createMocks({
        storyObjectives: []
    });

    assert.deepEqual(
        mocks.service.getStoryObjectives({}),
        []
    );
});

test("getStoryObjectives preserves story objective order", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S3", "Third", "C"),
            storyObjective("S1", "First", "A"),
            storyObjective("S2", "Second", "B")
        ]
    });

    assert.deepEqual(
        mocks.service.getStoryObjectives({}).map(objective => objective.id),
        ["S3", "S1", "S2"]
    );
});

test("getStoryObjectives does not include unrelated source fields", () => {
    const mocks = createMocks({
        storyObjectives: [
            {
                id: "S1",
                description: "Find the item",
                location: "FOREST",
                hidden: true,
                internalData: 123
            }
        ]
    });

    assert.deepEqual(
        mocks.service.getStoryObjectives({}),
        [
            {
                type: "STORY",
                id: "S1",
                title: "Find the item",
                location: "FOREST"
            }
        ]
    );
});

// --------------------------------------------------
// getGymObjectives
// --------------------------------------------------

test("getGymObjectives returns an empty array without a gym service", () => {
    const mocks = createMocks({ gym: null });

    assert.deepEqual(
        mocks.service.getGymObjectives({}),
        []
    );
});

test("getGymObjectives returns an empty array when getAvailableGyms is missing", () => {
    const mocks = createMocks({
        gymWithoutMethod: true
    });

    assert.deepEqual(
        mocks.service.getGymObjectives({}),
        []
    );
});

test("getGymObjectives returns an empty array when getAvailableGyms is not a function", () => {
    const service = new ObjectiveService(
        null,
        { getAvailableGyms: true },
        null
    );

    assert.deepEqual(
        service.getGymObjectives({}),
        []
    );
});

test("getGymObjectives delegates to getAvailableGyms", () => {
    const state = { badges: ["BOULDER_BADGE"] };
    const mocks = createMocks();

    mocks.service.getGymObjectives(state);

    assert.deepEqual(mocks.calls.gym, [state]);
});

test("getGymObjectives passes the original trainer state", () => {
    const state = { marker: "gym-state" };
    const mocks = createMocks();

    mocks.service.getGymObjectives(state);

    assert.strictEqual(mocks.calls.gym[0], state);
});

test("getGymObjectives maps gym records to GYM objectives", () => {
    const mocks = createMocks({
        gymObjectives: [
            gymObjective("GYM_1", "Brock", "PEWTER_CITY"),
            gymObjective("GYM_2", "Misty", "CERULEAN_CITY")
        ]
    });

    assert.deepEqual(
        mocks.service.getGymObjectives({}),
        [
            {
                type: "GYM",
                id: "GYM_1",
                title: "Defeat Brock.",
                location: "PEWTER_CITY"
            },
            {
                type: "GYM",
                id: "GYM_2",
                title: "Defeat Misty.",
                location: "CERULEAN_CITY"
            }
        ]
    );
});

test("getGymObjectives formats gym titles with the expected punctuation", () => {
    const mocks = createMocks({
        gymObjectives: [
            gymObjective("GYM_1", "Brock", "PEWTER_CITY")
        ]
    });

    assert.equal(
        mocks.service.getGymObjectives({})[0].title,
        "Defeat Brock."
    );
});

test("getGymObjectives uses gym city as the objective location", () => {
    const mocks = createMocks({
        gymObjectives: [
            gymObjective("GYM_1", "Brock", "PEWTER_CITY")
        ]
    });

    assert.equal(
        mocks.service.getGymObjectives({})[0].location,
        "PEWTER_CITY"
    );
});

test("getGymObjectives returns an empty array when no gyms are available", () => {
    const mocks = createMocks({
        gymObjectives: []
    });

    assert.deepEqual(
        mocks.service.getGymObjectives({}),
        []
    );
});

test("getGymObjectives preserves gym order", () => {
    const mocks = createMocks({
        gymObjectives: [
            gymObjective("GYM_C", "Third", "C"),
            gymObjective("GYM_A", "First", "A"),
            gymObjective("GYM_B", "Second", "B")
        ]
    });

    assert.deepEqual(
        mocks.service.getGymObjectives({}).map(objective => objective.id),
        ["GYM_C", "GYM_A", "GYM_B"]
    );
});

test("getGymObjectives does not include unrelated gym fields", () => {
    const mocks = createMocks({
        gymObjectives: [
            {
                id: "GYM_1",
                name: "Brock",
                city: "PEWTER_CITY",
                defeated: false,
                internalData: 123
            }
        ]
    });

    assert.deepEqual(
        mocks.service.getGymObjectives({}),
        [
            {
                type: "GYM",
                id: "GYM_1",
                title: "Defeat Brock.",
                location: "PEWTER_CITY"
            }
        ]
    );
});

// --------------------------------------------------
// getObjectives
// --------------------------------------------------

test("getObjectives combines story, gym, and progression objectives", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Find the Professor", "LAB")
        ],
        gymObjectives: [
            gymObjective("G1", "Brock", "PEWTER_CITY")
        ],
        progressionObjectives: [
            {
                type: "WORLD",
                id: "P1",
                title: "Open the bridge",
                location: "ROUTE_24"
            }
        ]
    });

    assert.deepEqual(
        mocks.service.getObjectives({}),
        [
            {
                type: "STORY",
                id: "S1",
                title: "Find the Professor",
                location: "LAB"
            },
            {
                type: "GYM",
                id: "G1",
                title: "Defeat Brock.",
                location: "PEWTER_CITY"
            },
            {
                type: "WORLD",
                id: "P1",
                title: "Open the bridge",
                location: "ROUTE_24"
            }
        ]
    );
});

test("getObjectives places story objectives before gym objectives", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Story goal", "A")
        ],
        gymObjectives: [
            gymObjective("G1", "Gym Leader", "B")
        ]
    });

    assert.deepEqual(
        mocks.service.getObjectives({}).map(objective => objective.type),
        ["STORY", "GYM"]
    );
});

test("getObjectives places gym objectives before progression objectives", () => {
    const mocks = createMocks({
        gymObjectives: [
            gymObjective("G1", "Gym Leader", "B")
        ],
        progressionObjectives: [
            { type: "WORLD", id: "P1", title: "World goal" }
        ]
    });

    assert.deepEqual(
        mocks.service.getObjectives({}).map(objective => objective.type),
        ["GYM", "WORLD"]
    );
});

test("getObjectives returns story objectives when optional services are absent", () => {
    const mocks = createMocks({
        gym: null,
        progression: null,
        storyObjectives: [
            storyObjective("S1", "Story goal", "A")
        ]
    });

    assert.deepEqual(
        mocks.service.getObjectives({}),
        [
            {
                type: "STORY",
                id: "S1",
                title: "Story goal",
                location: "A"
            }
        ]
    );
});

test("getObjectives returns an empty array when all services provide no objectives", () => {
    const mocks = createMocks({
        storyObjectives: [],
        gymObjectives: [],
        progressionObjectives: []
    });

    assert.deepEqual(
        mocks.service.getObjectives({}),
        []
    );
});

test("getObjectives works without all three services", () => {
    const service = new ObjectiveService(null, null, null);

    assert.deepEqual(service.getObjectives({}), []);
});

test("getObjectives skips progression when getObjectives is missing", () => {
    const service = new ObjectiveService(
        null,
        null,
        {}
    );

    assert.deepEqual(service.getObjectives({}), []);
});

test("getObjectives skips progression when getObjectives is not a function", () => {
    const service = new ObjectiveService(
        null,
        null,
        { getObjectives: true }
    );

    assert.deepEqual(service.getObjectives({}), []);
});

test("getObjectives passes the same state to all available services", () => {
    const state = { marker: "same-state" };
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Story", "A")
        ],
        gymObjectives: [
            gymObjective("G1", "Brock", "B")
        ],
        progressionObjectives: [
            { type: "WORLD", id: "P1", title: "Progression" }
        ]
    });

    mocks.service.getObjectives(state);

    assert.strictEqual(mocks.calls.story[0], state);
    assert.strictEqual(mocks.calls.gym[0], state);
    assert.strictEqual(mocks.calls.progression[0], state);
});

test("getObjectives retrieves each objective source once per call", () => {
    const mocks = createMocks();

    mocks.service.getObjectives({});

    assert.equal(mocks.calls.story.length, 1);
    assert.equal(mocks.calls.gym.length, 1);
    assert.equal(mocks.calls.progression.length, 1);
});

test("getObjectives includes progression objectives without remapping them", () => {
    const progressionObjective = {
        type: "CUSTOM",
        id: "P1",
        title: "Custom objective",
        location: "CUSTOM_AREA",
        additional: { keep: true }
    };

    const mocks = createMocks({
        progressionObjectives: [progressionObjective]
    });

    const result = mocks.service.getObjectives({});

    assert.strictEqual(result[0], progressionObjective);
    assert.deepEqual(result[0], progressionObjective);
});

test("getObjectives preserves the order within each objective source", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S2", "Second story", "B"),
            storyObjective("S1", "First story", "A")
        ],
        gymObjectives: [
            gymObjective("G2", "Misty", "CERULEAN_CITY"),
            gymObjective("G1", "Brock", "PEWTER_CITY")
        ],
        progressionObjectives: [
            { type: "WORLD", id: "P2", title: "Second" },
            { type: "WORLD", id: "P1", title: "First" }
        ]
    });

    assert.deepEqual(
        mocks.service.getObjectives({}).map(objective => objective.id),
        ["S2", "S1", "G2", "G1", "P2", "P1"]
    );
});

test("getObjectives returns a new combined array per call", () => {
    const mocks = createMocks();

    const first = mocks.service.getObjectives({});
    const second = mocks.service.getObjectives({});

    assert.notStrictEqual(first, second);
    assert.deepEqual(first, second);
});

// --------------------------------------------------
// getNextObjective
// --------------------------------------------------

test("getNextObjective returns the first story objective when present", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Story first", "A")
        ],
        gymObjectives: [
            gymObjective("G1", "Brock", "B")
        ]
    });

    assert.deepEqual(
        mocks.service.getNextObjective({}),
        {
            type: "STORY",
            id: "S1",
            title: "Story first",
            location: "A"
        }
    );
});

test("getNextObjective returns the first gym objective when there are no story objectives", () => {
    const mocks = createMocks({
        storyObjectives: [],
        gymObjectives: [
            gymObjective("G1", "Brock", "PEWTER_CITY"),
            gymObjective("G2", "Misty", "CERULEAN_CITY")
        ]
    });

    assert.deepEqual(
        mocks.service.getNextObjective({}),
        {
            type: "GYM",
            id: "G1",
            title: "Defeat Brock.",
            location: "PEWTER_CITY"
        }
    );
});

test("getNextObjective returns the first progression objective when it is the only source", () => {
    const progressionObjective = {
        type: "WORLD",
        id: "P1",
        title: "Open the bridge"
    };

    const mocks = createMocks({
        progressionObjectives: [progressionObjective]
    });

    assert.strictEqual(
        mocks.service.getNextObjective({}),
        progressionObjective
    );
});

test("getNextObjective returns null when no objectives exist", () => {
    const mocks = createMocks({
        storyObjectives: [],
        gymObjectives: [],
        progressionObjectives: []
    });

    assert.equal(
        mocks.service.getNextObjective({}),
        null
    );
});

test("getNextObjective returns null when all services are absent", () => {
    const service = new ObjectiveService(null, null, null);

    assert.equal(service.getNextObjective({}), null);
});

test("getNextObjective passes trainer state through to objective providers", () => {
    const state = { marker: true };
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Goal", "A")
        ]
    });

    mocks.service.getNextObjective(state);

    assert.strictEqual(mocks.calls.story[0], state);
});

// --------------------------------------------------
// getObjectivesByType
// --------------------------------------------------

test("getObjectivesByType returns only story objectives", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Story one", "A"),
            storyObjective("S2", "Story two", "B")
        ],
        gymObjectives: [
            gymObjective("G1", "Brock", "C")
        ]
    });

    assert.deepEqual(
        mocks.service.getObjectivesByType("STORY", {}),
        [
            {
                type: "STORY",
                id: "S1",
                title: "Story one",
                location: "A"
            },
            {
                type: "STORY",
                id: "S2",
                title: "Story two",
                location: "B"
            }
        ]
    );
});

test("getObjectivesByType returns only gym objectives", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Story", "A")
        ],
        gymObjectives: [
            gymObjective("G1", "Brock", "PEWTER_CITY")
        ]
    });

    assert.deepEqual(
        mocks.service.getObjectivesByType("GYM", {}),
        [
            {
                type: "GYM",
                id: "G1",
                title: "Defeat Brock.",
                location: "PEWTER_CITY"
            }
        ]
    );
});

test("getObjectivesByType returns progression objectives of the requested type", () => {
    const mocks = createMocks({
        progressionObjectives: [
            { type: "WORLD", id: "P1", title: "World goal" },
            { type: "QUEST", id: "P2", title: "Quest goal" },
            { type: "WORLD", id: "P3", title: "Another world goal" }
        ]
    });

    assert.deepEqual(
        mocks.service.getObjectivesByType("WORLD", {}),
        [
            { type: "WORLD", id: "P1", title: "World goal" },
            { type: "WORLD", id: "P3", title: "Another world goal" }
        ]
    );
});

test("getObjectivesByType returns an empty array for an unknown type", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Story", "A")
        ],
        gymObjectives: [
            gymObjective("G1", "Brock", "B")
        ]
    });

    assert.deepEqual(
        mocks.service.getObjectivesByType("UNKNOWN", {}),
        []
    );
});

test("getObjectivesByType matches type case-sensitively", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Story", "A")
        ]
    });

    assert.deepEqual(
        mocks.service.getObjectivesByType("story", {}),
        []
    );
});

test("getObjectivesByType preserves the combined objective order", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Story", "A"),
            storyObjective("S2", "Story two", "B")
        ],
        progressionObjectives: [
            { type: "STORY", id: "P1", title: "Progression story" }
        ]
    });

    assert.deepEqual(
        mocks.service.getObjectivesByType("STORY", {})
            .map(objective => objective.id),
        ["S1", "S2", "P1"]
    );
});

test("getObjectivesByType passes trainer state to objective providers", () => {
    const state = { marker: "filter-state" };
    const mocks = createMocks();

    mocks.service.getObjectivesByType("STORY", state);

    assert.strictEqual(mocks.calls.story[0], state);
    assert.strictEqual(mocks.calls.gym[0], state);
    assert.strictEqual(mocks.calls.progression[0], state);
});

// --------------------------------------------------
// getSummary
// --------------------------------------------------

test("getSummary returns the objective count and list", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Story goal", "A")
        ],
        gymObjectives: [
            gymObjective("G1", "Brock", "B")
        ]
    });

    assert.deepEqual(
        mocks.service.getSummary({}),
        {
            count: 2,
            objectives: [
                {
                    type: "STORY",
                    id: "S1",
                    title: "Story goal",
                    location: "A"
                },
                {
                    type: "GYM",
                    id: "G1",
                    title: "Defeat Brock.",
                    location: "B"
                }
            ]
        }
    );
});

test("getSummary returns zero and an empty array when no objectives exist", () => {
    const mocks = createMocks({
        storyObjectives: [],
        gymObjectives: [],
        progressionObjectives: []
    });

    assert.deepEqual(
        mocks.service.getSummary({}),
        {
            count: 0,
            objectives: []
        }
    );
});

test("getSummary count matches the length of objectives", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "One", "A"),
            storyObjective("S2", "Two", "B")
        ],
        gymObjectives: [
            gymObjective("G1", "Brock", "C")
        ],
        progressionObjectives: [
            { type: "WORLD", id: "P1", title: "Four" }
        ]
    });

    const summary = mocks.service.getSummary({});

    assert.equal(summary.count, summary.objectives.length);
    assert.equal(summary.count, 4);
});

test("getSummary preserves story, gym, and progression priority", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Story", "A")
        ],
        gymObjectives: [
            gymObjective("G1", "Brock", "B")
        ],
        progressionObjectives: [
            { type: "WORLD", id: "P1", title: "Progression" }
        ]
    });

    assert.deepEqual(
        mocks.service.getSummary({}).objectives.map(objective => objective.type),
        ["STORY", "GYM", "WORLD"]
    );
});

test("getSummary passes trainer state through to objective providers", () => {
    const state = { marker: "summary-state" };
    const mocks = createMocks();

    mocks.service.getSummary(state);

    assert.strictEqual(mocks.calls.story[0], state);
    assert.strictEqual(mocks.calls.gym[0], state);
    assert.strictEqual(mocks.calls.progression[0], state);
});

// --------------------------------------------------
// hasObjectives
// --------------------------------------------------

test("hasObjectives returns true when story objectives exist", () => {
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Story goal", "A")
        ]
    });

    assert.equal(
        mocks.service.hasObjectives({}),
        true
    );
});

test("hasObjectives returns true when gym objectives exist", () => {
    const mocks = createMocks({
        gymObjectives: [
            gymObjective("G1", "Brock", "PEWTER_CITY")
        ]
    });

    assert.equal(
        mocks.service.hasObjectives({}),
        true
    );
});

test("hasObjectives returns true when progression objectives exist", () => {
    const mocks = createMocks({
        progressionObjectives: [
            { type: "WORLD", id: "P1", title: "World goal" }
        ]
    });

    assert.equal(
        mocks.service.hasObjectives({}),
        true
    );
});

test("hasObjectives returns false when no objectives exist", () => {
    const mocks = createMocks({
        storyObjectives: [],
        gymObjectives: [],
        progressionObjectives: []
    });

    assert.equal(
        mocks.service.hasObjectives({}),
        false
    );
});

test("hasObjectives returns false when all services are absent", () => {
    const service = new ObjectiveService(null, null, null);

    assert.equal(service.hasObjectives({}), false);
});

test("hasObjectives passes trainer state through to objective providers", () => {
    const state = { marker: "has-objectives-state" };
    const mocks = createMocks({
        storyObjectives: [
            storyObjective("S1", "Story goal", "A")
        ]
    });

    mocks.service.hasObjectives(state);

    assert.strictEqual(mocks.calls.story[0], state);
    assert.strictEqual(mocks.calls.gym[0], state);
    assert.strictEqual(mocks.calls.progression[0], state);
});

// --------------------------------------------------
// Error propagation
// --------------------------------------------------

test("getStoryObjectives propagates story service errors", () => {
    const expectedError = new Error("Story objectives failed");

    const mocks = createMocks({
        getNextObjectives() {
            throw expectedError;
        }
    });

    assert.throws(
        () => mocks.service.getStoryObjectives({}),
        error => error === expectedError
    );
});

test("getGymObjectives propagates gym service errors", () => {
    const expectedError = new Error("Gym objectives failed");

    const mocks = createMocks({
        getAvailableGyms() {
            throw expectedError;
        }
    });

    assert.throws(
        () => mocks.service.getGymObjectives({}),
        error => error === expectedError
    );
});

test("getObjectives propagates progression service errors", () => {
    const expectedError = new Error("Progression objectives failed");

    const mocks = createMocks({
        getProgressionObjectives() {
            throw expectedError;
        }
    });

    assert.throws(
        () => mocks.service.getObjectives({}),
        error => error === expectedError
    );
});

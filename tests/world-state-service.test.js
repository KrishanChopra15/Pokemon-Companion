const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

const WorldStateService = require("../scripts/services/world-state-service.js");
const ProgressionService = require("../scripts/services/progression-service.js");

function createTrainerState(overrides = {}) {
    const completedEvents = overrides.completedEvents ?? [];
    const storyFlags = overrides.storyFlags ?? [];

    return {
        completedEvents,
        storyFlags,

        hasCompletedEvent(eventId) {
            return completedEvents.includes(eventId);
        },

        hasStoryFlag(flag) {
            return storyFlags.includes(flag);
        },

        ...overrides
    };
}

function createProgressionService(result = { allowed: true }) {
    const calls = [];

    return {
        calls,

        canUnlock(requirement, trainerState) {
            calls.push({ requirement, trainerState });
            return result;
        }
    };
}

function createService(options = {}) {
    const progressionService =
        options.progressionService ?? createProgressionService();

    return {
        progressionService,
        service: new WorldStateService(
            options.game ?? "firered",
            progressionService
        )
    };
}

describe("WorldStateService constructor", () => {
    test("creates a service instance", () => {
        const { service } = createService();

        assert.ok(service instanceof WorldStateService);
    });

    test("uses the supplied progression service", () => {
        const progressionService = createProgressionService();
        const { service } = createService({ progressionService });

        assert.equal(service.progressionService, progressionService);
    });

    test("creates a default progression service when none is supplied", () => {
        const service = new WorldStateService();

        assert.ok(
            service.progressionService instanceof ProgressionService
        );
    });

    test("creates a default progression service when null is supplied", () => {
        const service = new WorldStateService("firered", null);

        assert.ok(
            service.progressionService instanceof ProgressionService
        );
    });

    test("accepts a custom game identifier", () => {
        const service = new WorldStateService("emerald");

        assert.ok(
            service.progressionService instanceof ProgressionService
        );
    });
});

describe("WorldStateService canShowEvent", () => {
    test("returns a missing-data result for a null event", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(null, createTrainerState()),
            {
                visible: false,
                reason: "No event data"
            }
        );
    });

    test("returns a missing-data result for an undefined event", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(undefined, createTrainerState()),
            {
                visible: false,
                reason: "No event data"
            }
        );
    });

    test("shows an event when it has no conditions", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(
                { id: "EVENT_1" },
                createTrainerState()
            ),
            { visible: true }
        );
    });

    test("shows an event when its conditions are empty", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(
                { id: "EVENT_1", conditions: {} },
                createTrainerState()
            ),
            { visible: true }
        );
    });

    test("hides a completed event when hiddenWhenCompleted is true", () => {
        const { service } = createService();
        const trainerState = createTrainerState({
            completedEvents: ["EVENT_1"]
        });

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    hiddenWhenCompleted: true
                },
                trainerState
            ),
            {
                visible: false,
                reason: "Event completed"
            }
        );
    });

    test("keeps a completed event visible when hiddenWhenCompleted is false", () => {
        const { service } = createService();
        const trainerState = createTrainerState({
            completedEvents: ["EVENT_1"]
        });

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    hiddenWhenCompleted: false
                },
                trainerState
            ),
            { visible: true }
        );
    });

    test("does not hide an event that has not been completed", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    hiddenWhenCompleted: true
                },
                createTrainerState()
            ),
            { visible: true }
        );
    });

    test("checks completion using the event ID", () => {
        let receivedId;

        const trainerState = createTrainerState({
            hasCompletedEvent(id) {
                receivedId = id;
                return false;
            }
        });

        const { service } = createService();

        service.canShowEvent(
            {
                id: "CUSTOM_EVENT",
                hiddenWhenCompleted: true
            },
            trainerState
        );

        assert.equal(receivedId, "CUSTOM_EVENT");
    });

    test("hides an event when a required story flag is missing", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    conditions: {
                        requireStoryFlags: ["PACKAGE_DELIVERED"]
                    }
                },
                createTrainerState()
            ),
            {
                visible: false,
                reason: "Missing PACKAGE_DELIVERED"
            }
        );
    });

    test("shows an event when its required story flag is present", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    conditions: {
                        requireStoryFlags: ["PACKAGE_DELIVERED"]
                    }
                },
                createTrainerState({
                    storyFlags: ["PACKAGE_DELIVERED"]
                })
            ),
            { visible: true }
        );
    });

    test("requires all listed story flags", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    conditions: {
                        requireStoryFlags: ["FLAG_A", "FLAG_B"]
                    }
                },
                createTrainerState({
                    storyFlags: ["FLAG_A"]
                })
            ),
            {
                visible: false,
                reason: "Missing FLAG_B"
            }
        );
    });

    test("returns the first missing required flag", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    conditions: {
                        requireStoryFlags: ["FLAG_A", "FLAG_B"]
                    }
                },
                createTrainerState()
            ),
            {
                visible: false,
                reason: "Missing FLAG_A"
            }
        );
    });

    test("allows an event when the required flag list is empty", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    conditions: {
                        requireStoryFlags: []
                    }
                },
                createTrainerState()
            ),
            { visible: true }
        );
    });

    test("hides an event when an excluded story flag is present", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    conditions: {
                        excludeStoryFlags: ["RIVAL_DEFEATED"]
                    }
                },
                createTrainerState({
                    storyFlags: ["RIVAL_DEFEATED"]
                })
            ),
            {
                visible: false,
                reason: "Blocked by RIVAL_DEFEATED"
            }
        );
    });

    test("shows an event when its excluded story flag is absent", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    conditions: {
                        excludeStoryFlags: ["RIVAL_DEFEATED"]
                    }
                },
                createTrainerState()
            ),
            { visible: true }
        );
    });

    test("blocks an event when any excluded flag is present", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    conditions: {
                        excludeStoryFlags: ["FLAG_A", "FLAG_B"]
                    }
                },
                createTrainerState({
                    storyFlags: ["FLAG_B"]
                })
            ),
            {
                visible: false,
                reason: "Blocked by FLAG_B"
            }
        );
    });

    test("checks required flags before excluded flags", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    conditions: {
                        requireStoryFlags: ["MISSING_FLAG"],
                        excludeStoryFlags: ["BLOCKING_FLAG"]
                    }
                },
                createTrainerState({
                    storyFlags: ["BLOCKING_FLAG"]
                })
            ),
            {
                visible: false,
                reason: "Missing MISSING_FLAG"
            }
        );
    });

    test("checks story flags before progression requirements", () => {
        const progressionService = createProgressionService({
            allowed: false,
            reason: "Locked"
        });

        const { service } = createService({ progressionService });

        const result = service.canShowEvent(
            {
                id: "EVENT_1",
                conditions: {
                    requireStoryFlags: ["MISSING_FLAG"],
                    progression: { badges: 3 }
                }
            },
            createTrainerState()
        );

        assert.deepEqual(result, {
            visible: false,
            reason: "Missing MISSING_FLAG"
        });
        assert.equal(progressionService.calls.length, 0);
    });

    test("hides an event when its progression requirement is denied", () => {
        const progressionService = createProgressionService({
            allowed: false,
            reason: "Missing required badge"
        });

        const { service } = createService({ progressionService });

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    conditions: {
                        progression: { badges: 3 }
                    }
                },
                createTrainerState()
            ),
            {
                visible: false,
                reason: "Missing required badge"
            }
        );
    });

    test("passes progression requirements and trainer state to canUnlock", () => {
        const progressionService = createProgressionService({
            allowed: true
        });

        const { service } = createService({ progressionService });
        const requirement = { badges: 3 };
        const trainerState = createTrainerState();

        service.canShowEvent(
            {
                id: "EVENT_1",
                conditions: { progression: requirement }
            },
            trainerState
        );

        assert.equal(progressionService.calls.length, 1);
        assert.equal(progressionService.calls[0].requirement, requirement);
        assert.equal(progressionService.calls[0].trainerState, trainerState);
    });

    test("shows an event when progression requirements are allowed", () => {
        const { service } = createService({
            progressionService: createProgressionService({
                allowed: true
            })
        });

        assert.deepEqual(
            service.canShowEvent(
                {
                    id: "EVENT_1",
                    conditions: {
                        progression: { badges: 1 }
                    }
                },
                createTrainerState()
            ),
            { visible: true }
        );
    });

    test("does not call progression service when there is no progression requirement", () => {
        const progressionService = createProgressionService();
        const { service } = createService({ progressionService });

        service.canShowEvent(
            { id: "EVENT_1", conditions: {} },
            createTrainerState()
        );

        assert.equal(progressionService.calls.length, 0);
    });
});

describe("WorldStateService canShowNPC", () => {
    test("returns a missing-data result for a null NPC", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowNPC(null, createTrainerState()),
            {
                visible: false,
                reason: "No NPC data"
            }
        );
    });

    test("returns a missing-data result for an undefined NPC", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowNPC(undefined, createTrainerState()),
            {
                visible: false,
                reason: "No NPC data"
            }
        );
    });

    test("shows an NPC with no conditions or removal event", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowNPC(
                { id: "NPC_1" },
                createTrainerState()
            ),
            { visible: true }
        );
    });

    test("hides an NPC after its removal event is completed", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowNPC(
                {
                    id: "NPC_1",
                    hiddenAfterEvent: "RIVAL_DEFEATED"
                },
                createTrainerState({
                    completedEvents: ["RIVAL_DEFEATED"]
                })
            ),
            {
                visible: false,
                reason: "NPC removed after event"
            }
        );
    });

    test("shows an NPC when its removal event is incomplete", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowNPC(
                {
                    id: "NPC_1",
                    hiddenAfterEvent: "RIVAL_DEFEATED"
                },
                createTrainerState()
            ),
            { visible: true }
        );
    });

    test("checks NPC removal using hiddenAfterEvent", () => {
        let receivedId;

        const trainerState = createTrainerState({
            hasCompletedEvent(id) {
                receivedId = id;
                return false;
            }
        });

        const { service } = createService();

        service.canShowNPC(
            { hiddenAfterEvent: "CUSTOM_EVENT" },
            trainerState
        );

        assert.equal(receivedId, "CUSTOM_EVENT");
    });

    test("checks required story flags in NPC conditions", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowNPC(
                {
                    id: "NPC_1",
                    conditions: {
                        requireStoryFlags: ["MET_PROFESSOR"]
                    }
                },
                createTrainerState()
            ),
            {
                visible: false,
                reason: "Missing MET_PROFESSOR"
            }
        );
    });

    test("checks excluded story flags in NPC conditions", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowNPC(
                {
                    id: "NPC_1",
                    conditions: {
                        excludeStoryFlags: ["QUEST_COMPLETE"]
                    }
                },
                createTrainerState({
                    storyFlags: ["QUEST_COMPLETE"]
                })
            ),
            {
                visible: false,
                reason: "Blocked by QUEST_COMPLETE"
            }
        );
    });

    test("shows an NPC when all its conditions are satisfied", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowNPC(
                {
                    id: "NPC_1",
                    conditions: {
                        requireStoryFlags: ["FLAG_A"],
                        excludeStoryFlags: ["FLAG_B"]
                    }
                },
                createTrainerState({ storyFlags: ["FLAG_A"] })
            ),
            { visible: true }
        );
    });

    test("checks removal before evaluating NPC conditions", () => {
        let storyFlagChecks = 0;

        const trainerState = createTrainerState({
            completedEvents: ["REMOVE_NPC"],
            hasCompletedEvent(id) {
                return id === "REMOVE_NPC";
            },
            hasStoryFlag() {
                storyFlagChecks++;
                return false;
            }
        });

        const { service } = createService();

        const result = service.canShowNPC(
            {
                hiddenAfterEvent: "REMOVE_NPC",
                conditions: {
                    requireStoryFlags: ["FLAG_A"]
                }
            },
            trainerState
        );

        assert.deepEqual(result, {
            visible: false,
            reason: "NPC removed after event"
        });
        assert.equal(storyFlagChecks, 0);
    });
});

describe("WorldStateService canShowObject", () => {
    test("returns a missing-data result for a null object", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowObject(null, createTrainerState()),
            {
                visible: false,
                reason: "No object data"
            }
        );
    });

    test("returns a missing-data result for an undefined object", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowObject(undefined, createTrainerState()),
            {
                visible: false,
                reason: "No object data"
            }
        );
    });

    test("shows an object with no conditions or removal event", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowObject(
                { id: "OBJECT_1" },
                createTrainerState()
            ),
            { visible: true }
        );
    });

    test("hides an object after its removal event is completed", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowObject(
                {
                    id: "OBJECT_1",
                    hiddenAfterEvent: "ITEM_COLLECTED"
                },
                createTrainerState({
                    completedEvents: ["ITEM_COLLECTED"]
                })
            ),
            {
                visible: false,
                reason: "Object removed after event"
            }
        );
    });

    test("shows an object when its removal event is incomplete", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowObject(
                {
                    id: "OBJECT_1",
                    hiddenAfterEvent: "ITEM_COLLECTED"
                },
                createTrainerState()
            ),
            { visible: true }
        );
    });

    test("checks object removal using hiddenAfterEvent", () => {
        let receivedId;

        const trainerState = createTrainerState({
            hasCompletedEvent(id) {
                receivedId = id;
                return false;
            }
        });

        const { service } = createService();

        service.canShowObject(
            { hiddenAfterEvent: "CUSTOM_EVENT" },
            trainerState
        );

        assert.equal(receivedId, "CUSTOM_EVENT");
    });

    test("checks required story flags in object conditions", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowObject(
                {
                    id: "OBJECT_1",
                    conditions: {
                        requireStoryFlags: ["UNLOCKED_DOOR"]
                    }
                },
                createTrainerState()
            ),
            {
                visible: false,
                reason: "Missing UNLOCKED_DOOR"
            }
        );
    });

    test("checks excluded story flags in object conditions", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowObject(
                {
                    id: "OBJECT_1",
                    conditions: {
                        excludeStoryFlags: ["DOOR_OPENED"]
                    }
                },
                createTrainerState({
                    storyFlags: ["DOOR_OPENED"]
                })
            ),
            {
                visible: false,
                reason: "Blocked by DOOR_OPENED"
            }
        );
    });

    test("shows an object when all its conditions are satisfied", () => {
        const { service } = createService();

        assert.deepEqual(
            service.canShowObject(
                {
                    id: "OBJECT_1",
                    conditions: {
                        requireStoryFlags: ["FLAG_A"],
                        excludeStoryFlags: ["FLAG_B"]
                    }
                },
                createTrainerState({ storyFlags: ["FLAG_A"] })
            ),
            { visible: true }
        );
    });

    test("checks removal before evaluating object conditions", () => {
        let storyFlagChecks = 0;

        const trainerState = createTrainerState({
            hasCompletedEvent(id) {
                return id === "REMOVE_OBJECT";
            },
            hasStoryFlag() {
                storyFlagChecks++;
                return false;
            }
        });

        const { service } = createService();

        const result = service.canShowObject(
            {
                hiddenAfterEvent: "REMOVE_OBJECT",
                conditions: {
                    requireStoryFlags: ["FLAG_A"]
                }
            },
            trainerState
        );

        assert.deepEqual(result, {
            visible: false,
            reason: "Object removed after event"
        });
        assert.equal(storyFlagChecks, 0);
    });
});

describe("WorldStateService checkConditions", () => {
    test("returns visible when no conditions are specified", () => {
        const { service } = createService();

        assert.deepEqual(
            service.checkConditions({}, createTrainerState()),
            { visible: true }
        );
    });

    test("returns visible when required and excluded lists are empty", () => {
        const { service } = createService();

        assert.deepEqual(
            service.checkConditions(
                {
                    requireStoryFlags: [],
                    excludeStoryFlags: []
                },
                createTrainerState()
            ),
            { visible: true }
        );
    });

    test("returns a reason for a missing required flag", () => {
        const { service } = createService();

        assert.deepEqual(
            service.checkConditions(
                { requireStoryFlags: ["FLAG_A"] },
                createTrainerState()
            ),
            {
                visible: false,
                reason: "Missing FLAG_A"
            }
        );
    });

    test("returns visible when the required flag is present", () => {
        const { service } = createService();

        assert.deepEqual(
            service.checkConditions(
                { requireStoryFlags: ["FLAG_A"] },
                createTrainerState({ storyFlags: ["FLAG_A"] })
            ),
            { visible: true }
        );
    });

    test("requires every required flag to be present", () => {
        const { service } = createService();

        assert.deepEqual(
            service.checkConditions(
                { requireStoryFlags: ["FLAG_A", "FLAG_B"] },
                createTrainerState({ storyFlags: ["FLAG_A"] })
            ),
            {
                visible: false,
                reason: "Missing FLAG_B"
            }
        );
    });

    test("returns the first missing flag", () => {
        const { service } = createService();

        assert.deepEqual(
            service.checkConditions(
                { requireStoryFlags: ["FLAG_A", "FLAG_B"] },
                createTrainerState()
            ),
            {
                visible: false,
                reason: "Missing FLAG_A"
            }
        );
    });

    test("returns a reason when an excluded flag is present", () => {
        const { service } = createService();

        assert.deepEqual(
            service.checkConditions(
                { excludeStoryFlags: ["FLAG_A"] },
                createTrainerState({ storyFlags: ["FLAG_A"] })
            ),
            {
                visible: false,
                reason: "Blocked by FLAG_A"
            }
        );
    });

    test("returns visible when excluded flags are absent", () => {
        const { service } = createService();

        assert.deepEqual(
            service.checkConditions(
                { excludeStoryFlags: ["FLAG_A"] },
                createTrainerState()
            ),
            { visible: true }
        );
    });

    test("checks required flags before excluded flags", () => {
        const { service } = createService();

        assert.deepEqual(
            service.checkConditions(
                {
                    requireStoryFlags: ["MISSING_FLAG"],
                    excludeStoryFlags: ["BLOCKED_FLAG"]
                },
                createTrainerState({ storyFlags: ["BLOCKED_FLAG"] })
            ),
            {
                visible: false,
                reason: "Missing MISSING_FLAG"
            }
        );
    });

    test("does not check excluded flags after a required flag is missing", () => {
        let excludeFlagChecked = false;

        const trainerState = createTrainerState({
            hasStoryFlag(flag) {
                if (flag === "BLOCKED_FLAG") {
                    excludeFlagChecked = true;
                    return true;
                }

                return false;
            }
        });

        const { service } = createService();

        service.checkConditions(
            {
                requireStoryFlags: ["MISSING_FLAG"],
                excludeStoryFlags: ["BLOCKED_FLAG"]
            },
            trainerState
        );

        assert.equal(excludeFlagChecked, false);
    });
});

describe("WorldStateService getWorldState", () => {
    test("returns completed events, story flags, and event states", () => {
        const state = {
            completedEvents: ["EVENT_A"],
            storyFlags: ["FLAG_A"],
            eventStates: { EVENT_A: "completed" }
        };

        const { service } = createService();

        assert.deepEqual(service.getWorldState(state), {
            completedEvents: ["EVENT_A"],
            storyFlags: ["FLAG_A"],
            eventStates: { EVENT_A: "completed" }
        });
    });

    test("defaults completed events to an empty array", () => {
        const { service } = createService();

        assert.deepEqual(
            service.getWorldState({
                storyFlags: [],
                eventStates: {}
            }).completedEvents,
            []
        );
    });

    test("defaults story flags to an empty array", () => {
        const { service } = createService();

        assert.deepEqual(
            service.getWorldState({
                completedEvents: [],
                eventStates: {}
            }).storyFlags,
            []
        );
    });

    test("defaults event states to an empty object", () => {
        const { service } = createService();

        assert.deepEqual(
            service.getWorldState({
                completedEvents: [],
                storyFlags: []
            }).eventStates,
            {}
        );
    });

    test("defaults missing state collections independently", () => {
        const { service } = createService();

        assert.deepEqual(service.getWorldState({}), {
            completedEvents: [],
            storyFlags: [],
            eventStates: {}
        });
    });

    test("defaults null completed events to an empty array", () => {
        const { service } = createService();

        assert.deepEqual(
            service.getWorldState({
                completedEvents: null
            }).completedEvents,
            []
        );
    });

    test("defaults null story flags to an empty array", () => {
        const { service } = createService();

        assert.deepEqual(
            service.getWorldState({
                storyFlags: null
            }).storyFlags,
            []
        );
    });

    test("defaults null event states to an empty object", () => {
        const { service } = createService();

        assert.deepEqual(
            service.getWorldState({
                eventStates: null
            }).eventStates,
            {}
        );
    });

    test("preserves the original completed events reference", () => {
        const completedEvents = ["EVENT_A"];
        const { service } = createService();

        assert.equal(
            service.getWorldState({ completedEvents }).completedEvents,
            completedEvents
        );
    });

    test("preserves the original story flags reference", () => {
        const storyFlags = ["FLAG_A"];
        const { service } = createService();

        assert.equal(
            service.getWorldState({ storyFlags }).storyFlags,
            storyFlags
        );
    });

    test("preserves the original event states reference", () => {
        const eventStates = { EVENT_A: "seen" };
        const { service } = createService();

        assert.equal(
            service.getWorldState({ eventStates }).eventStates,
            eventStates
        );
    });

    test("does not include unrelated trainer state properties", () => {
        const { service } = createService();

        const result = service.getWorldState({
            completedEvents: [],
            storyFlags: [],
            eventStates: {},
            currentLocation: "Pallet Town",
            badges: ["BOULDER_BADGE"]
        });

        assert.deepEqual(Object.keys(result), [
            "completedEvents",
            "storyFlags",
            "eventStates"
        ]);
    });

    test("does not mutate the supplied trainer state", () => {
        const state = {
            completedEvents: ["EVENT_A"],
            storyFlags: ["FLAG_A"],
            eventStates: { EVENT_A: "completed" }
        };

        const original = {
            completedEvents: [...state.completedEvents],
            storyFlags: [...state.storyFlags],
            eventStates: { ...state.eventStates }
        };

        const { service } = createService();

        service.getWorldState(state);

        assert.deepEqual(state, original);
    });
});

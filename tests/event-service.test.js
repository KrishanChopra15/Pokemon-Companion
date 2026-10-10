"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const EventService = require("../scripts/services/event-service");
const TrainerState = require("../scripts/domain/trainer-state");


function createContext(options = {}) {
    const worldStateService = options.worldStateService || {
        canShowEvent() {
            return {
                visible: true,
                reason: null
            };
        }
    };

    const pokemonTracker = options.pokemonTracker || {
        getCaughtCount() {
            return 0;
        }
    };

    const progressionService = options.progressionService || null;

    const service = new EventService(
        "firered",
        progressionService,
        pokemonTracker,
        worldStateService
    );

    return {
        service,
        state: new TrainerState(),
        worldStateService,
        pokemonTracker
    };
}


function createEvent(overrides = {}) {
    return {
        id: "TEST_EVENT",
        location: "TEST_LOCATION",
        npc: "TEST_NPC",
        repeatable: true,
        requirements: {},
        choices: [],
        rewards: [],
        effects: {},
        ...overrides
    };
}


// -------------------------------------
// Database loading and event lookup
// -------------------------------------

test("EventService loads the FireRed event database", () => {
    const { service } = createContext();

    assert.ok(Array.isArray(service.events));
    assert.ok(service.events.length > 0);
    assert.ok(service.storyEventMap);
    assert.equal(typeof service.storyEventMap, "object");
});


test("EventService finds an event by its direct ID", () => {
    const { service } = createContext();
    const event = service.events[0];

    assert.ok(event);

    assert.strictEqual(
        service.getEvent(event.id),
        event
    );
});


test("EventService returns null for an unknown event", () => {
    const { service } = createContext();

    assert.equal(
        service.getEvent("NONEXISTENT_TEST_EVENT"),
        null
    );
});


test("Story event aliases resolve to their mapped ROM event", () => {
    const { service } = createContext();

    const aliasEntry = Object.entries(
        service.storyEventMap
    ).find(([alias, mapping]) => {
        return (
            mapping &&
            mapping.eventId &&
            service.events.some(
                event => event.id === mapping.eventId
            )
        );
    });

    if (!aliasEntry) {
        assert.ok(
            Object.keys(service.storyEventMap).length >= 0
        );
        return;
    }

    const [alias, mapping] = aliasEntry;

    assert.strictEqual(
        service.getEvent(alias),
        service.events.find(
            event => event.id === mapping.eventId
        )
    );
});


test("EventService filters events by location", () => {
    const { service } = createContext();
    const event = service.events[0];

    const matches = service.getEventsByLocation(
        event.location
    );

    assert.ok(Array.isArray(matches));
    assert.ok(matches.includes(event));

    for (const match of matches) {
        assert.equal(match.location, event.location);
    }
});


test("EventService filters events by NPC", () => {
    const { service } = createContext();
    const event = service.events[0];

    const matches = service.getEventsByNPC(event.npc);

    assert.ok(Array.isArray(matches));
    assert.ok(matches.includes(event));

    for (const match of matches) {
        assert.equal(match.npc, event.npc);
    }
});


// -------------------------------------
// Event requirements
// -------------------------------------

test("Events without requirements can be triggered", () => {
    const { service, state } = createContext();

    const result = service.canTrigger(
        createEvent(),
        state
    );

    assert.equal(result.allowed, true);
});


test("EventService rejects a missing event", () => {
    const { service, state } = createContext();

    const result = service.canTrigger(null, state);

    assert.equal(result.allowed, false);
    assert.equal(result.reason, "Event not found");
});


test("EventService checks required story flags", () => {
    const { service, state } = createContext();

    const event = createEvent({
        requirements: {
            storyFlags: ["MET_OAK"]
        }
    });

    const blocked = service.canTrigger(event, state);

    assert.equal(blocked.allowed, false);
    assert.equal(blocked.reason, "Requires story flag MET_OAK");

    state.addStoryFlag("MET_OAK");

    const allowed = service.canTrigger(event, state);

    assert.equal(allowed.allowed, true);
});


test("EventService checks required items", () => {
    const { service, state } = createContext();

    const event = createEvent({
        requirements: {
            items: ["POTION"]
        }
    });

    const blocked = service.canTrigger(event, state);

    assert.equal(blocked.allowed, false);
    assert.equal(blocked.reason, "Requires item POTION");

    state.addItem("POTION", 1);

    assert.equal(
        service.canTrigger(event, state).allowed,
        true
    );
});


test("EventService checks required key items", () => {
    const { service, state } = createContext();

    const event = createEvent({
        requirements: {
            keyItems: ["BICYCLE"]
        }
    });

    const blocked = service.canTrigger(event, state);

    assert.equal(blocked.allowed, false);
    assert.equal(blocked.reason, "Requires key item BICYCLE");

    state.addKeyItem("BICYCLE");

    assert.equal(
        service.canTrigger(event, state).allowed,
        true
    );
});


test("EventService checks required badges", () => {
    const { service, state } = createContext();

    const event = createEvent({
        requirements: {
            badges: ["BOULDER_BADGE"]
        }
    });

    const blocked = service.canTrigger(event, state);

    assert.equal(blocked.allowed, false);
    assert.equal(
        blocked.reason,
        "Requires badge BOULDER_BADGE"
    );

    state.addBadge("BOULDER_BADGE");

    assert.equal(
        service.canTrigger(event, state).allowed,
        true
    );
});


test("Non-repeatable completed events cannot be triggered again", () => {
    const { service, state } = createContext();

    const event = createEvent({
        id: "ONE_TIME_EVENT",
        repeatable: false
    });

    state.completeEvent(event.id);

    const result = service.canTrigger(event, state);

    assert.equal(result.allowed, false);
    assert.equal(result.reason, "Event already completed");
});


// -------------------------------------
// Progression integration
// -------------------------------------

test("EventService allows events with no mapped progression", () => {
    const { service, state } = createContext();

    const result = service.checkEventProgression(
        createEvent(),
        state
    );

    assert.equal(result.allowed, true);
    assert.equal(result.progression, null);
});


test("EventService blocks a mapped event when its progression requirement fails", () => {
    const tracker = {
        getCaughtCount() {
            return 0;
        }
    };

    let checkedRequirement = false;

    const progressionService = {
        getAllProgression() {
            return {
                testProgression: {
                    id: "TEST_PROGRESSION",
                    eventId: "TEST_EVENT",
                    requirement: {
                        type: "test"
                    }
                }
            };
        },

        checkRequirement(requirement, state, context) {
            checkedRequirement = true;

            assert.deepEqual(requirement, {
                type: "test"
            });

            assert.strictEqual(
                context.pokemonTracker,
                tracker
            );

            return {
                allowed: false,
                reason: "Requirement not met"
            };
        }
    };

    const { service, state } = createContext({
        progressionService,
        pokemonTracker: tracker
    });

    const result = service.checkEventProgression(
        createEvent(),
        state
    );

    assert.equal(checkedRequirement, true);
    assert.equal(result.allowed, false);
    assert.equal(result.progression, "TEST_PROGRESSION");
    assert.equal(result.reason, "Requirement not met");
});


test("EventService requires progression service when a mapped rule exists", () => {
    const progressionService = {
        getAllProgression() {
            return {
                testProgression: {
                    id: "TEST_PROGRESSION",
                    eventId: "TEST_EVENT",
                    requirement: {}
                }
            };
        }
    };

    const { service, state } = createContext({
        progressionService
    });

    const result = service.checkEventProgression(
        createEvent(),
        state
    );

    assert.equal(result.allowed, false);
    assert.equal(
        result.reason,
        "Progression service unavailable"
    );
});


// -------------------------------------
// Executing events
// -------------------------------------

test("EventService rejects execution without an event", () => {
    const { service, state } = createContext();

    const result = service.executeEvent(null, state);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Event not found");
});


test("EventService rejects execution without trainer state", () => {
    const { service } = createContext();

    const result = service.executeEvent(
        createEvent(),
        null
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Missing trainer state");
});


test("EventService rejects an event hidden by world state", () => {
    const { service, state } = createContext({
        worldStateService: {
            canShowEvent() {
                return {
                    visible: false,
                    reason: "Event not visible yet"
                };
            }
        }
    });

    const result = service.executeEvent(
        createEvent(),
        state
    );

    assert.equal(result.success, false);
    assert.equal(result.reason, "Event not visible yet");
    assert.equal(state.hasCompletedEvent("TEST_EVENT"), false);
});


test("EventService applies event effects and records completion", () => {
    const { service, state } = createContext();

    state.addStoryFlag("OLD_FLAG");

    const event = createEvent({
        id: "REWARD_EVENT",
        effects: {
            addKeyItems: ["BICYCLE"],
            addItems: [
                "POTION",
                {
                    id: "SUPER_POTION",
                    quantity: 2
                }
            ],
            addPokemon: [
                {
                    species: "PIKACHU",
                    level: 5
                }
            ],
            addStoryFlags: ["NEW_FLAG"],
            removeStoryFlags: ["OLD_FLAG"]
        }
    });

    const result = service.executeEvent(event, state);

    assert.equal(result.success, true);
    assert.equal(result.event, "REWARD_EVENT");
    assert.deepEqual(result.progression, []);
    assert.equal(result.eventProgression, null);

    assert.equal(state.hasKeyItem("BICYCLE"), true);
    assert.equal(state.hasItem("POTION"), true);
    assert.equal(state.hasItem("SUPER_POTION"), true);

    assert.equal(state.hasStoryFlag("NEW_FLAG"), true);
    assert.equal(state.hasStoryFlag("OLD_FLAG"), false);

    assert.ok(
        state.pokemon.some(
            pokemon => pokemon.species === "PIKACHU"
        )
    );

    assert.equal(state.hasCompletedEvent("REWARD_EVENT"), true);
});


test("EventService blocks event execution when mapped progression fails", () => {
    const progressionService = {
        getAllProgression() {
            return {
                testProgression: {
                    id: "TEST_PROGRESSION",
                    eventId: "LOCKED_EVENT",
                    requirement: {}
                }
            };
        },

        checkRequirement() {
            return {
                allowed: false,
                reason: "Progression locked"
            };
        }
    };

    const { service, state } = createContext({
        progressionService
    });

    const event = createEvent({
        id: "LOCKED_EVENT",
        effects: {
            addItems: ["RARE_CANDY"]
        }
    });

    const result = service.executeEvent(event, state);

    assert.equal(result.success, false);
    assert.equal(result.reason, "Progression locked");
    assert.equal(result.progression, "TEST_PROGRESSION");
    assert.equal(state.hasItem("RARE_CANDY"), false);
    assert.equal(state.hasCompletedEvent("LOCKED_EVENT"), false);
});


// -------------------------------------
// Choices and visibility
// -------------------------------------

test("EventService returns no choices when requirements are unmet", () => {
    const { service, state } = createContext();

    const event = createEvent({
        requirements: {
            storyFlags: ["NEEDS_FLAG"]
        },
        choices: [
            {
                id: "CHOICE_A",
                text: "Choose A",
                effects: {}
            }
        ]
    });

    assert.deepEqual(service.getChoices(event, state), []);
});


test("EventService returns choices for an available event", () => {
    const { service, state } = createContext();

    const event = createEvent({
        choices: [
            {
                id: "CHOICE_A",
                text: "Choose A",
                effects: {}
            },
            {
                id: "CHOICE_B",
                text: "Choose B",
                effects: {}
            }
        ]
    });

    const choices = service.getChoices(event, state);

    assert.equal(choices.length, 2);
});


test("EventService delegates visibility checks to WorldStateService", () => {
    const event = createEvent();
    const state = new TrainerState();

    let receivedEvent = null;
    let receivedState = null;

    const worldStateService = {
        canShowEvent(actualEvent, actualState) {
            receivedEvent = actualEvent;
            receivedState = actualState;

            return {
                visible: true
            };
        }
    };

    const { service } = createContext({
        worldStateService
    });

    const result = service.canShowEvent(event, state);

    assert.equal(result.visible, true);
    assert.strictEqual(receivedEvent, event);
    assert.strictEqual(receivedState, state);
});
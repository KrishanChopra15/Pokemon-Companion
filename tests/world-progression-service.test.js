const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

const WorldProgressionService = require("../scripts/services/world-progression-service.js");

function createTrainerState(overrides = {}) {
    return {
        currentLocation: "Pewter City",
        badges: ["BOULDER_BADGE"],
        storyFlags: ["OAKS_PACKAGE_DELIVERED"],
        ...overrides
    };
}

function createServices(options = {}) {
    const storyObjectives = options.storyObjectives ?? [];
    const availableGyms = options.availableGyms ?? [];

    const story = {
        getNextObjectives: options.getNextObjectives ??
            (() => storyObjectives)
    };

    const gyms = {
        getAvailableGyms: options.getAvailableGyms ??
            (() => availableGyms)
    };

    const progression = options.progression ?? null;

    return {
        story,
        gyms,
        progression,
        service: new WorldProgressionService(
            story,
            gyms,
            progression
        )
    };
}

function createStoryObjective(overrides = {}) {
    return {
        id: "DELIVER_PACKAGE",
        description: "Deliver the package to Professor Oak.",
        location: "Pallet Town",
        ...overrides
    };
}

function createGym(overrides = {}) {
    return {
        id: "PEWTER_GYM",
        name: "Brock",
        city: "Pewter City",
        ...overrides
    };
}

describe("WorldProgressionService constructor", () => {
    test("stores the story progression service", () => {
        const { service, story } = createServices();

        assert.equal(service.story, story);
    });

    test("stores the gym progression service", () => {
        const { service, gyms } = createServices();

        assert.equal(service.gyms, gyms);
    });

    test("defaults the optional progression service to null", () => {
        const { service } = createServices();

        assert.equal(service.progression, null);
    });

    test("stores a supplied progression service", () => {
        const progression = { name: "ProgressionService" };
        const { service } = createServices({ progression });

        assert.equal(service.progression, progression);
    });
});

describe("WorldProgressionService getCurrentObjectives", () => {
    test("maps story objectives to the expected result shape", () => {
        const storyObjective = createStoryObjective();
        const { service } = createServices({
            storyObjectives: [storyObjective]
        });

        assert.deepEqual(
            service.getCurrentObjectives(createTrainerState()),
            [
                {
                    type: "STORY",
                    id: "DELIVER_PACKAGE",
                    description: "Deliver the package to Professor Oak.",
                    location: "Pallet Town"
                }
            ]
        );
    });

    test("maps gym objectives to the expected result shape", () => {
        const gym = createGym();
        const { service } = createServices({
            availableGyms: [gym]
        });

        assert.deepEqual(
            service.getCurrentObjectives(createTrainerState()),
            [
                {
                    type: "GYM",
                    id: "PEWTER_GYM",
                    description: "Defeat Brock.",
                    location: "Pewter City"
                }
            ]
        );
    });

    test("includes story objectives before gym objectives", () => {
        const { service } = createServices({
            storyObjectives: [createStoryObjective()],
            availableGyms: [createGym()]
        });

        const objectives = service.getCurrentObjectives(
            createTrainerState()
        );

        assert.deepEqual(
            objectives.map(objective => objective.type),
            ["STORY", "GYM"]
        );
    });

    test("combines multiple story and gym objectives", () => {
        const { service } = createServices({
            storyObjectives: [
                createStoryObjective(),
                createStoryObjective({
                    id: "VISIT_VIRIDIAN",
                    description: "Visit Viridian City.",
                    location: "Viridian City"
                })
            ],
            availableGyms: [
                createGym(),
                createGym({
                    id: "CERULEAN_GYM",
                    name: "Misty",
                    city: "Cerulean City"
                })
            ]
        });

        assert.deepEqual(
            service.getCurrentObjectives(createTrainerState()),
            [
                {
                    type: "STORY",
                    id: "DELIVER_PACKAGE",
                    description: "Deliver the package to Professor Oak.",
                    location: "Pallet Town"
                },
                {
                    type: "STORY",
                    id: "VISIT_VIRIDIAN",
                    description: "Visit Viridian City.",
                    location: "Viridian City"
                },
                {
                    type: "GYM",
                    id: "PEWTER_GYM",
                    description: "Defeat Brock.",
                    location: "Pewter City"
                },
                {
                    type: "GYM",
                    id: "CERULEAN_GYM",
                    description: "Defeat Misty.",
                    location: "Cerulean City"
                }
            ]
        );
    });

    test("returns an empty array when no objectives are available", () => {
        const { service } = createServices();

        assert.deepEqual(
            service.getCurrentObjectives(createTrainerState()),
            []
        );
    });

    test("passes the trainer state to the story service", () => {
        const trainerState = createTrainerState();
        let receivedState;

        const { service } = createServices({
            getNextObjectives(state) {
                receivedState = state;
                return [];
            }
        });

        service.getCurrentObjectives(trainerState);

        assert.equal(receivedState, trainerState);
    });

    test("passes the trainer state to the gym service", () => {
        const trainerState = createTrainerState();
        let receivedState;

        const { service } = createServices({
            getAvailableGyms(state) {
                receivedState = state;
                return [];
            }
        });

        service.getCurrentObjectives(trainerState);

        assert.equal(receivedState, trainerState);
    });

    test("calls the story service once per invocation", () => {
        let calls = 0;

        const { service } = createServices({
            getNextObjectives() {
                calls++;
                return [];
            }
        });

        service.getCurrentObjectives(createTrainerState());

        assert.equal(calls, 1);
    });

    test("calls the gym service once per invocation", () => {
        let calls = 0;

        const { service } = createServices({
            getAvailableGyms() {
                calls++;
                return [];
            }
        });

        service.getCurrentObjectives(createTrainerState());

        assert.equal(calls, 1);
    });

    test("preserves story objective field values", () => {
        const objective = createStoryObjective({
            id: "CUSTOM_OBJECTIVE",
            description: "Complete a custom task.",
            location: "Lavender Town"
        });

        const { service } = createServices({
            storyObjectives: [objective]
        });

        const result = service.getCurrentObjectives(
            createTrainerState()
        );

        assert.deepEqual(result[0], {
            type: "STORY",
            id: "CUSTOM_OBJECTIVE",
            description: "Complete a custom task.",
            location: "Lavender Town"
        });
    });

    test("formats gym descriptions using the gym name", () => {
        const { service } = createServices({
            availableGyms: [
                createGym({ name: "Lt. Surge" })
            ]
        });

        const result = service.getCurrentObjectives(
            createTrainerState()
        );

        assert.equal(result[0].description, "Defeat Lt. Surge.");
    });

    test("uses the gym city as the objective location", () => {
        const { service } = createServices({
            availableGyms: [
                createGym({ city: "Cerulean City" })
            ]
        });

        const result = service.getCurrentObjectives(
            createTrainerState()
        );

        assert.equal(result[0].location, "Cerulean City");
    });

    test("does not include additional story objective properties", () => {
        const objective = createStoryObjective({
            secretField: "should not be copied"
        });

        const { service } = createServices({
            storyObjectives: [objective]
        });

        const result = service.getCurrentObjectives(
            createTrainerState()
        );

        assert.equal("secretField" in result[0], false);
    });

    test("returns a new objectives array on each call", () => {
        const { service } = createServices();

        const first = service.getCurrentObjectives(
            createTrainerState()
        );

        const second = service.getCurrentObjectives(
            createTrainerState()
        );

        assert.notEqual(first, second);
        assert.deepEqual(first, second);
    });
});

describe("WorldProgressionService getAvailableGyms", () => {
    test("returns the gyms supplied by the gym service", () => {
        const gyms = [createGym()];
        const { service } = createServices({
            availableGyms: gyms
        });

        assert.deepEqual(
            service.getAvailableGyms(createTrainerState()),
            gyms
        );
    });

    test("passes the trainer state to the gym service", () => {
        const trainerState = createTrainerState();
        let receivedState;

        const { service } = createServices({
            getAvailableGyms(state) {
                receivedState = state;
                return [];
            }
        });

        service.getAvailableGyms(trainerState);

        assert.equal(receivedState, trainerState);
    });

    test("returns the original gym array reference", () => {
        const gyms = [createGym()];
        const { service } = createServices({
            availableGyms: gyms
        });

        assert.equal(
            service.getAvailableGyms(createTrainerState()),
            gyms
        );
    });

    test("returns an empty array when no gyms are available", () => {
        const { service } = createServices();

        assert.deepEqual(
            service.getAvailableGyms(createTrainerState()),
            []
        );
    });

    test("calls the gym service once", () => {
        let calls = 0;

        const { service } = createServices({
            getAvailableGyms() {
                calls++;
                return [];
            }
        });

        service.getAvailableGyms(createTrainerState());

        assert.equal(calls, 1);
    });
});

describe("WorldProgressionService getCompletedStoryFlags", () => {
    test("returns the trainer's story flags", () => {
        const flags = [
            "OAKS_PACKAGE_DELIVERED",
            "FIRST_GYM_DEFEATED"
        ];

        const { service } = createServices();

        assert.deepEqual(
            service.getCompletedStoryFlags(
                createTrainerState({ storyFlags: flags })
            ),
            flags
        );
    });

    test("returns the original story flags reference", () => {
        const flags = ["OAKS_PACKAGE_DELIVERED"];
        const { service } = createServices();

        assert.equal(
            service.getCompletedStoryFlags(
                createTrainerState({ storyFlags: flags })
            ),
            flags
        );
    });

    test("returns an empty array when story flags are absent", () => {
        const { service } = createServices();

        assert.deepEqual(
            service.getCompletedStoryFlags(
                createTrainerState({ storyFlags: undefined })
            ),
            []
        );
    });

    test("returns an empty array when story flags are null", () => {
        const { service } = createServices();

        assert.deepEqual(
            service.getCompletedStoryFlags(
                createTrainerState({ storyFlags: null })
            ),
            []
        );
    });

    test("preserves an explicitly empty story flags array", () => {
        const flags = [];
        const { service } = createServices();

        assert.equal(
            service.getCompletedStoryFlags(
                createTrainerState({ storyFlags: flags })
            ),
            flags
        );
    });

    test("does not add or remove story flags", () => {
        const flags = ["FLAG_A", "FLAG_B"];
        const original = [...flags];
        const { service } = createServices();

        service.getCompletedStoryFlags(
            createTrainerState({ storyFlags: flags })
        );

        assert.deepEqual(flags, original);
    });
});

describe("WorldProgressionService getBadgeProgress", () => {
    test("returns the obtained badges and their count", () => {
        const badges = [
            "BOULDER_BADGE",
            "CASCADE_BADGE"
        ];

        const { service } = createServices();

        assert.deepEqual(
            service.getBadgeProgress(
                createTrainerState({ badges })
            ),
            {
                obtained: badges,
                count: 2
            }
        );
    });

    test("returns the original badges reference", () => {
        const badges = ["BOULDER_BADGE"];
        const { service } = createServices();

        assert.equal(
            service.getBadgeProgress(
                createTrainerState({ badges })
            ).obtained,
            badges
        );
    });

    test("returns zero badges when the badges property is absent", () => {
        const { service } = createServices();

        assert.deepEqual(
            service.getBadgeProgress(
                createTrainerState({ badges: undefined })
            ),
            {
                obtained: [],
                count: 0
            }
        );
    });

    test("returns zero badges when the badges property is null", () => {
        const { service } = createServices();

        assert.deepEqual(
            service.getBadgeProgress(
                createTrainerState({ badges: null })
            ),
            {
                obtained: [],
                count: 0
            }
        );
    });

    test("handles an explicitly empty badges array", () => {
        const badges = [];
        const { service } = createServices();

        assert.deepEqual(
            service.getBadgeProgress(
                createTrainerState({ badges })
            ),
            {
                obtained: badges,
                count: 0
            }
        );
    });

    test("counts every badge entry", () => {
        const badges = [
            "BOULDER_BADGE",
            "BOULDER_BADGE",
            "CASCADE_BADGE"
        ];

        const { service } = createServices();

        assert.equal(
            service.getBadgeProgress(
                createTrainerState({ badges })
            ).count,
            3
        );
    });
});

describe("WorldProgressionService getWorldSummary", () => {
    test("returns the current location, badges, flags, and objectives", () => {
        const storyObjective = createStoryObjective();
        const gym = createGym();

        const { service } = createServices({
            storyObjectives: [storyObjective],
            availableGyms: [gym]
        });

        const trainerState = createTrainerState();

        assert.deepEqual(
            service.getWorldSummary(trainerState),
            {
                location: "Pewter City",
                badges: {
                    obtained: ["BOULDER_BADGE"],
                    count: 1
                },
                storyFlags: ["OAKS_PACKAGE_DELIVERED"],
                objectives: [
                    {
                        type: "STORY",
                        id: "DELIVER_PACKAGE",
                        description: "Deliver the package to Professor Oak.",
                        location: "Pallet Town"
                    },
                    {
                        type: "GYM",
                        id: "PEWTER_GYM",
                        description: "Defeat Brock.",
                        location: "Pewter City"
                    }
                ]
            }
        );
    });

    test("returns null when the current location is absent", () => {
        const { service } = createServices();

        const summary = service.getWorldSummary(
            createTrainerState({ currentLocation: undefined })
        );

        assert.equal(summary.location, null);
    });

    test("returns null when the current location is null", () => {
        const { service } = createServices();

        const summary = service.getWorldSummary(
            createTrainerState({ currentLocation: null })
        );

        assert.equal(summary.location, null);
    });

    test("returns null when the current location is an empty string", () => {
        const { service } = createServices();

        const summary = service.getWorldSummary(
            createTrainerState({ currentLocation: "" })
        );

        assert.equal(summary.location, null);
    });

    test("returns an empty progress summary for empty state collections", () => {
        const { service } = createServices();

        assert.deepEqual(
            service.getWorldSummary({
                currentLocation: "Viridian City",
                badges: [],
                storyFlags: []
            }),
            {
                location: "Viridian City",
                badges: {
                    obtained: [],
                    count: 0
                },
                storyFlags: [],
                objectives: []
            }
        );
    });

    test("uses the current trainer state to calculate objectives", () => {
        const trainerState = createTrainerState();
        let storyState;
        let gymState;

        const { service } = createServices({
            getNextObjectives(state) {
                storyState = state;
                return [];
            },
            getAvailableGyms(state) {
                gymState = state;
                return [];
            }
        });

        service.getWorldSummary(trainerState);

        assert.equal(storyState, trainerState);
        assert.equal(gymState, trainerState);
    });

    test("preserves the story flags reference in the summary", () => {
        const flags = ["OAKS_PACKAGE_DELIVERED"];
        const { service } = createServices();

        const summary = service.getWorldSummary(
            createTrainerState({ storyFlags: flags })
        );

        assert.equal(summary.storyFlags, flags);
    });

    test("preserves the badges reference in the badge summary", () => {
        const badges = ["BOULDER_BADGE"];
        const { service } = createServices();

        const summary = service.getWorldSummary(
            createTrainerState({ badges })
        );

        assert.equal(summary.badges.obtained, badges);
    });
});

describe("WorldProgressionService isGameComplete", () => {
    test("returns true when ELITE_FOUR_UNLOCKED is present", () => {
        const { service } = createServices();

        assert.equal(
            service.isGameComplete(
                createTrainerState({
                    storyFlags: [
                        "OAKS_PACKAGE_DELIVERED",
                        "ELITE_FOUR_UNLOCKED"
                    ]
                })
            ),
            true
        );
    });

    test("returns false when the completion flag is absent", () => {
        const { service } = createServices();

        assert.equal(
            service.isGameComplete(
                createTrainerState({
                    storyFlags: ["OAKS_PACKAGE_DELIVERED"]
                })
            ),
            false
        );
    });

    test("returns false when story flags are empty", () => {
        const { service } = createServices();

        assert.equal(
            service.isGameComplete(
                createTrainerState({ storyFlags: [] })
            ),
            false
        );
    });

    test("returns false when story flags are absent", () => {
        const { service } = createServices();

        assert.equal(
            service.isGameComplete(
                createTrainerState({ storyFlags: undefined })
            ),
            false
        );
    });

    test("returns false when story flags are null", () => {
        const { service } = createServices();

        assert.equal(
            service.isGameComplete(
                createTrainerState({ storyFlags: null })
            ),
            false
        );
    });

    test("uses an exact completion flag match", () => {
        const { service } = createServices();

        assert.equal(
            service.isGameComplete(
                createTrainerState({
                    storyFlags: ["elite_four_unlocked"]
                })
            ),
            false
        );
    });

    test("does not treat a similarly named flag as completion", () => {
        const { service } = createServices();

        assert.equal(
            service.isGameComplete(
                createTrainerState({
                    storyFlags: ["ELITE_FOUR_UNLOCKED_PENDING"]
                })
            ),
            false
        );
    });

    test("returns true when other flags precede the completion flag", () => {
        const { service } = createServices();

        assert.equal(
            service.isGameComplete(
                createTrainerState({
                    storyFlags: [
                        "FLAG_A",
                        "FLAG_B",
                        "ELITE_FOUR_UNLOCKED"
                    ]
                })
            ),
            true
        );
    });
});

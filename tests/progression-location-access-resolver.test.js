const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

const ProgressionLocationAccessResolver = require(
    "../scripts/services/progression-location-access-resolver.js"
);

function createLocation(overrides = {}) {
    return {
        id: "MAP_ROUTE2",
        connections: [],
        ...overrides
    };
}

function createEvaluator(result = true) {
    const calls = [];

    return {
        calls,

        isSatisfied(requirement, stage, state, dependencyStack) {
            calls.push({
                requirement,
                stage,
                state,
                dependencyStack
            });

            if (typeof result === "function") {
                return result(
                    requirement,
                    stage,
                    state,
                    dependencyStack
                );
            }

            return result;
        }
    };
}

function createService(options = {}) {
    const locations = options.locations ?? {};
    const rules = options.progressionRules ?? [];
    const evaluator = options.requirementEvaluator ?? null;

    return {
        locations,
        rules,
        evaluator,

        service: new ProgressionLocationAccessResolver(
            locations,
            rules,
            evaluator
        )
    };
}

function createStartingLocations(overrides = {}) {
    return {
        MAP_PALLET_TOWN: {
            id: "MAP_PALLET_TOWN",
            connections: [],
            ...overrides
        }
    };
}

describe("ProgressionLocationAccessResolver constructor", () => {
    test("stores the locations object", () => {
        const locations = createStartingLocations();
        const { service } = createService({ locations });

        assert.equal(service.locations, locations);
    });

    test("stores valid progression rules", () => {
        const rules = [
            {
                location: "MAP_ROUTE2",
                type: "GYM"
            }
        ];

        const { service } = createService({
            progressionRules: rules
        });

        assert.equal(service.rules, rules);
    });

    test("stores the requirement evaluator", () => {
        const evaluator = createEvaluator();
        const { service } = createService({
            requirementEvaluator: evaluator
        });

        assert.equal(service.requirementEvaluator, evaluator);
    });

    test("defaults locations to an empty object", () => {
        const service = new ProgressionLocationAccessResolver();

        assert.deepEqual(service.locations, {});
    });

    test("defaults progression rules to an empty array", () => {
        const service = new ProgressionLocationAccessResolver();

        assert.deepEqual(service.rules, []);
    });

    test("defaults the requirement evaluator to null", () => {
        const service = new ProgressionLocationAccessResolver();

        assert.equal(service.requirementEvaluator, null);
    });

    test("replaces null locations with an empty object", () => {
        const service = new ProgressionLocationAccessResolver(null);

        assert.deepEqual(service.locations, {});
    });

    test("replaces string locations with an empty object", () => {
        const service = new ProgressionLocationAccessResolver("locations");

        assert.deepEqual(service.locations, {});
    });

    test("replaces numeric locations with an empty object", () => {
        const service = new ProgressionLocationAccessResolver(42);

        assert.deepEqual(service.locations, {});
    });

    test("replaces non-array progression rules with an empty array", () => {
        const service = new ProgressionLocationAccessResolver(
            {},
            { location: "MAP_ROUTE2" }
        );

        assert.deepEqual(service.rules, []);
    });

    test("accepts an empty progression rule array", () => {
        const service = new ProgressionLocationAccessResolver({}, []);

        assert.deepEqual(service.rules, []);
    });

    test("accepts an object map of locations", () => {
        const locations = {
            MAP_PALLET_TOWN: {
                id: "MAP_PALLET_TOWN"
            },
            MAP_ROUTE1: {
                id: "MAP_ROUTE1"
            }
        };

        const { service } = createService({ locations });

        assert.equal(service.locations, locations);
        assert.equal(
            service.getStartingLocations().length,
            2
        );
    });
});

describe("ProgressionLocationAccessResolver buildProgressionRuleIndex", () => {
    test("indexes a rule by its location", () => {
        const rule = {
            location: "MAP_ROUTE2",
            type: "GYM"
        };

        const { service } = createService({
            progressionRules: [rule]
        });

        assert.deepEqual(
            service.progressionRulesByLocation.MAP_ROUTE2,
            [rule]
        );
    });

    test("groups multiple rules for the same location", () => {
        const first = {
            location: "MAP_ROUTE2",
            type: "GYM"
        };

        const second = {
            location: "MAP_ROUTE2",
            type: "HM"
        };

        const { service } = createService({
            progressionRules: [first, second]
        });

        assert.deepEqual(
            service.progressionRulesByLocation.MAP_ROUTE2,
            [first, second]
        );
    });

    test("keeps rules for different locations separate", () => {
        const first = {
            location: "MAP_ROUTE2",
            type: "GYM"
        };

        const second = {
            location: "MAP_ROUTE3",
            type: "HM"
        };

        const { service } = createService({
            progressionRules: [first, second]
        });

        assert.deepEqual(
            service.progressionRulesByLocation,
            {
                MAP_ROUTE2: [first],
                MAP_ROUTE3: [second]
            }
        );
    });

    test("ignores a null rule", () => {
        const valid = {
            location: "MAP_ROUTE2",
            type: "GYM"
        };

        const { service } = createService({
            progressionRules: [null, valid]
        });

        assert.deepEqual(
            service.progressionRulesByLocation,
            { MAP_ROUTE2: [valid] }
        );
    });

    test("ignores an undefined rule", () => {
        const valid = {
            location: "MAP_ROUTE2",
            type: "GYM"
        };

        const { service } = createService({
            progressionRules: [undefined, valid]
        });

        assert.deepEqual(
            service.progressionRulesByLocation,
            { MAP_ROUTE2: [valid] }
        );
    });

    test("ignores rules without a location", () => {
        const { service } = createService({
            progressionRules: [
                { type: "GYM" },
                { location: "", type: "HM" },
                { location: "MAP_ROUTE2", type: "GYM" }
            ]
        });

        assert.deepEqual(
            service.progressionRulesByLocation,
            {
                MAP_ROUTE2: [
                    { location: "MAP_ROUTE2", type: "GYM" }
                ]
            }
        );
    });

    test("preserves rule references in the index", () => {
        const rule = {
            location: "MAP_ROUTE2",
            type: "GYM"
        };

        const { service } = createService({
            progressionRules: [rule]
        });

        assert.equal(
            service.progressionRulesByLocation.MAP_ROUTE2[0],
            rule
        );
    });

    test("returns an empty index when there are no rules", () => {
        const { service } = createService();

        assert.deepEqual(
            service.progressionRulesByLocation,
            {}
        );
    });
});

describe("ProgressionLocationAccessResolver getStartingLocations", () => {
    test("returns Pallet Town when it exists", () => {
        const { service } = createService({
            locations: createStartingLocations()
        });

        assert.deepEqual(
            service.getStartingLocations(),
            ["MAP_PALLET_TOWN"]
        );
    });

    test("returns Route 1 when it exists", () => {
        const { service } = createService({
            locations: {
                MAP_ROUTE1: { id: "MAP_ROUTE1" }
            }
        });

        assert.deepEqual(
            service.getStartingLocations(),
            ["MAP_ROUTE1"]
        );
    });

    test("returns both starting locations in candidate order", () => {
        const { service } = createService({
            locations: {
                MAP_ROUTE1: { id: "MAP_ROUTE1" },
                MAP_PALLET_TOWN: { id: "MAP_PALLET_TOWN" }
            }
        });

        assert.deepEqual(
            service.getStartingLocations(),
            ["MAP_PALLET_TOWN", "MAP_ROUTE1"]
        );
    });

    test("returns an empty array when neither starting location exists", () => {
        const { service } = createService({
            locations: {
                MAP_ROUTE2: { id: "MAP_ROUTE2" }
            }
        });

        assert.deepEqual(service.getStartingLocations(), []);
    });
});

describe("ProgressionLocationAccessResolver getGateRequirement", () => {
    test("extracts a nested requirement from a gate", () => {
        const requirement = { badges: 2 };
        const { service } = createService();

        assert.equal(
            service.getGateRequirement({
                requirement,
                type: "HARD_GATE"
            }),
            requirement
        );
    });

    test("returns the gate itself when there is no requirement property", () => {
        const gate = {
            badges: 2,
            type: "CUSTOM_GATE"
        };

        const { service } = createService();

        assert.equal(service.getGateRequirement(gate), gate);
    });

    test("returns an explicitly undefined requirement", () => {
        const { service } = createService();

        assert.equal(
            service.getGateRequirement({
                requirement: undefined
            }),
            undefined
        );
    });

    test("returns an explicitly null requirement", () => {
        const { service } = createService();

        assert.equal(
            service.getGateRequirement({
                requirement: null
            }),
            null
        );
    });

    test("returns null when the gate is null", () => {
        const { service } = createService();

        assert.equal(service.getGateRequirement(null), null);
    });

    test("returns undefined when the gate is undefined", () => {
        const { service } = createService();

        assert.equal(service.getGateRequirement(undefined), undefined);
    });

    test("returns primitive gate values unchanged", () => {
        const { service } = createService();

        assert.equal(service.getGateRequirement("BADGE_REQUIRED"), "BADGE_REQUIRED");
        assert.equal(service.getGateRequirement(3), 3);
    });
});

describe("ProgressionLocationAccessResolver isRequirementSatisfied", () => {
    test("returns true when no evaluator is configured", () => {
        const { service } = createService();

        assert.equal(
            service.isRequirementSatisfied(
                { badges: 2 },
                "STAGE_2",
                {},
                new Set()
            ),
            true
        );
    });

    test("delegates requirement evaluation to the configured evaluator", () => {
        const evaluator = createEvaluator(true);
        const { service } = createService({
            requirementEvaluator: evaluator
        });

        const requirement = { badges: 2 };
        const state = { badges: ["BOULDER_BADGE"] };
        const stack = new Set(["MAP_ROUTE2"]);

        assert.equal(
            service.isRequirementSatisfied(
                requirement,
                "STAGE_2",
                state,
                stack
            ),
            true
        );

        assert.equal(evaluator.calls.length, 1);
        assert.equal(evaluator.calls[0].requirement, requirement);
        assert.equal(evaluator.calls[0].stage, "STAGE_2");
        assert.equal(evaluator.calls[0].state, state);
        assert.equal(evaluator.calls[0].dependencyStack, stack);
    });

    test("returns false when the evaluator rejects a requirement", () => {
        const evaluator = createEvaluator(false);
        const { service } = createService({
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.isRequirementSatisfied(
                { badges: 3 },
                "STAGE_1",
                {},
                new Set()
            ),
            false
        );
    });

    test("returns the evaluator's result directly", () => {
        const marker = { allowed: "custom-result" };
        const evaluator = {
            isSatisfied() {
                return marker;
            }
        };

        const { service } = createService({
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.isRequirementSatisfied({}, null, null, new Set()),
            marker
        );
    });

    test("treats a missing isSatisfied method as no evaluator", () => {
        const { service } = createService({
            requirementEvaluator: {}
        });

        assert.equal(
            service.isRequirementSatisfied({}, null, null, new Set()),
            true
        );
    });

    test("treats a non-function isSatisfied property as no evaluator", () => {
        const { service } = createService({
            requirementEvaluator: { isSatisfied: true }
        });

        assert.equal(
            service.isRequirementSatisfied({}, null, null, new Set()),
            true
        );
    });
});

describe("ProgressionLocationAccessResolver isConnectionUsableAtStage", () => {
    test("returns false for a null connection", () => {
        const { service } = createService();

        assert.equal(
            service.isConnectionUsableAtStage(null, "STAGE_1"),
            false
        );
    });

    test("returns false for an undefined connection", () => {
        const { service } = createService();

        assert.equal(
            service.isConnectionUsableAtStage(undefined, "STAGE_1"),
            false
        );
    });

    test("allows a connection without requirements", () => {
        const { service } = createService();

        assert.equal(
            service.isConnectionUsableAtStage(
                { location: "MAP_ROUTE2" },
                "STAGE_1"
            ),
            true
        );
    });

    test("allows a connection with an empty requirements array", () => {
        const { service } = createService();

        assert.equal(
            service.isConnectionUsableAtStage(
                {
                    location: "MAP_ROUTE2",
                    requirements: []
                },
                "STAGE_1"
            ),
            true
        );
    });

    test("ignores a non-array requirements property", () => {
        const { service } = createService();

        assert.equal(
            service.isConnectionUsableAtStage(
                {
                    location: "MAP_ROUTE2",
                    requirements: { badges: 3 }
                },
                "STAGE_1"
            ),
            true
        );
    });

    test("requires all connection requirements to be satisfied", () => {
        const evaluator = createEvaluator(requirement => requirement.allowed);
        const { service } = createService({
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.isConnectionUsableAtStage(
                {
                    location: "MAP_ROUTE2",
                    requirements: [
                        { allowed: true },
                        { allowed: true }
                    ]
                },
                "STAGE_1"
            ),
            true
        );

        assert.equal(evaluator.calls.length, 2);
    });

    test("rejects a connection when a requirement is unsatisfied", () => {
        const evaluator = createEvaluator(
            requirement => requirement.allowed
        );

        const { service } = createService({
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.isConnectionUsableAtStage(
                {
                    location: "MAP_ROUTE2",
                    requirements: [
                        { allowed: true },
                        { allowed: false },
                        { allowed: true }
                    ]
                },
                "STAGE_1"
            ),
            false
        );

        assert.equal(evaluator.calls.length, 2);
    });

    test("passes stage, state, and dependency stack to the evaluator", () => {
        const evaluator = createEvaluator(true);
        const { service } = createService({
            requirementEvaluator: evaluator
        });

        const state = { badgeCount: 2 };
        const stack = new Set(["MAP_ROUTE1"]);

        service.isConnectionUsableAtStage(
            {
                location: "MAP_ROUTE2",
                requirements: [{ badges: 2 }]
            },
            "STAGE_2",
            state,
            stack
        );

        assert.equal(evaluator.calls[0].stage, "STAGE_2");
        assert.equal(evaluator.calls[0].state, state);
        assert.equal(evaluator.calls[0].dependencyStack, stack);
    });
});

describe("ProgressionLocationAccessResolver isLocationUsableAtStage", () => {
    test("returns false for a missing location", () => {
        const { service } = createService();

        assert.equal(
            service.isLocationUsableAtStage(null, "STAGE_1"),
            false
        );
    });

    test("returns false for an undefined location", () => {
        const { service } = createService();

        assert.equal(
            service.isLocationUsableAtStage(undefined, "STAGE_1"),
            false
        );
    });

    test("allows a location with no gates or progression rules", () => {
        const { service } = createService();

        assert.equal(
            service.isLocationUsableAtStage(
                createLocation(),
                "STAGE_1"
            ),
            true
        );
    });

    test("allows a location with an empty hard-gate list", () => {
        const { service } = createService();

        assert.equal(
            service.isLocationUsableAtStage(
                createLocation({
                    gates: { hard: [] }
                }),
                "STAGE_1"
            ),
            true
        );
    });

    test("rejects a location when a hard gate is unsatisfied", () => {
        const evaluator = createEvaluator(false);
        const { service } = createService({
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.isLocationUsableAtStage(
                createLocation({
                    gates: {
                        hard: [
                            {
                                requirement: { badges: 4 }
                            }
                        ]
                    }
                }),
                "STAGE_1"
            ),
            false
        );
    });

    test("extracts the nested requirement from a hard gate", () => {
        const requirement = { badges: 4 };
        const evaluator = createEvaluator(true);
        const { service } = createService({
            requirementEvaluator: evaluator
        });

        service.isLocationUsableAtStage(
            createLocation({
                gates: {
                    hard: [
                        {
                            type: "HARD_GATE",
                            requirement
                        }
                    ]
                }
            }),
            "STAGE_2"
        );

        assert.equal(evaluator.calls[0].requirement, requirement);
    });

    test("checks progression hard-gate rules against the location ID", () => {
        const evaluator = createEvaluator(false);
        const rule = {
            location: "MAP_ROUTE2",
            type: "HARD_GATE",
            requirement: { badge: "CASCADE_BADGE" }
        };

        const { service } = createService({
            progressionRules: [rule],
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.isLocationUsableAtStage(
                createLocation({ id: "MAP_ROUTE2" }),
                "STAGE_2"
            ),
            false
        );
    });

    test("matches progression-rule location IDs without matching letter case", () => {
        const evaluator = createEvaluator(false);
        const { service } = createService({
            progressionRules: [
                {
                    location: "MAP_ROUTE2",
                    type: "HARD_GATE",
                    requirement: { badges: 3 }
                }
            ],
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.isLocationUsableAtStage(
                createLocation({ id: "map_route2" }),
                "STAGE_2"
            ),
            false
        );
    });

    test("ignores progression rules belonging to other locations", () => {
        const evaluator = createEvaluator(false);
        const { service } = createService({
            progressionRules: [
                {
                    location: "MAP_ROUTE3",
                    type: "HARD_GATE",
                    requirement: { badges: 3 }
                }
            ],
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.isLocationUsableAtStage(
                createLocation({ id: "MAP_ROUTE2" }),
                "STAGE_2"
            ),
            true
        );

        assert.equal(evaluator.calls.length, 0);
    });

    test("rejects a location when a non-gym progression requirement fails", () => {
        const evaluator = createEvaluator(false);
        const { service } = createService({
            progressionRules: [
                {
                    location: "MAP_ROUTE2",
                    type: "STORY",
                    requirement: { storyFlag: "BRIDGE_FIXED" }
                }
            ],
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.isLocationUsableAtStage(
                createLocation(),
                "STAGE_2"
            ),
            false
        );
    });

    test("does not block physical entry for GYM rules", () => {
        const evaluator = createEvaluator(false);
        const { service } = createService({
            progressionRules: [
                {
                    location: "MAP_ROUTE2",
                    type: "GYM",
                    requirement: { badges: 7 }
                }
            ],
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.isLocationUsableAtStage(
                createLocation(),
                "STAGE_2"
            ),
            true
        );

        assert.equal(evaluator.calls.length, 0);
    });

    test("does not block physical entry for HM rules", () => {
        const evaluator = createEvaluator(false);
        const { service } = createService({
            progressionRules: [
                {
                    location: "MAP_ROUTE2",
                    type: "HM",
                    requirement: { hm: "SURF" }
                }
            ],
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.isLocationUsableAtStage(
                createLocation(),
                "STAGE_2"
            ),
            true
        );

        assert.equal(evaluator.calls.length, 0);
    });

    test("compares progression rule types without matching letter case", () => {
        const evaluator = createEvaluator(false);
        const { service } = createService({
            progressionRules: [
                {
                    location: "MAP_ROUTE2",
                    type: "gym",
                    requirement: { badges: 7 }
                }
            ],
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.isLocationUsableAtStage(
                createLocation(),
                "STAGE_2"
            ),
            true
        );
    });

    test("ignores non-hard-gate progression rules without requirements", () => {
        const evaluator = createEvaluator(false);
        const { service } = createService({
            progressionRules: [
                {
                    location: "MAP_ROUTE2",
                    type: "STORY"
                }
            ],
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.isLocationUsableAtStage(
                createLocation(),
                "STAGE_2"
            ),
            true
        );

        assert.equal(evaluator.calls.length, 0);
    });

    test("does not reject a location when the progression rule list is empty", () => {
        const { service } = createService();

        assert.equal(
            service.isLocationUsableAtStage(
                createLocation(),
                "STAGE_1"
            ),
            true
        );
    });
});

describe("ProgressionLocationAccessResolver canAccessLocationAtStage", () => {
    test("returns false for an empty location ID", () => {
        const { service } = createService();

        assert.equal(
            service.canAccessLocationAtStage("", "STAGE_1"),
            false
        );
    });

    test("returns false for a null location ID", () => {
        const { service } = createService();

        assert.equal(
            service.canAccessLocationAtStage(null, "STAGE_1"),
            false
        );
    });

    test("returns false for an unknown location ID", () => {
        const { service } = createService();

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_UNKNOWN",
                "STAGE_1"
            ),
            false
        );
    });

    test("allows Pallet Town as a starting location", () => {
        const { service } = createService({
            locations: createStartingLocations()
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_PALLET_TOWN",
                "STAGE_1"
            ),
            true
        );
    });

    test("allows Route 1 as a starting location", () => {
        const { service } = createService({
            locations: {
                MAP_ROUTE1: { id: "MAP_ROUTE1" }
            }
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE1",
                "STAGE_1"
            ),
            true
        );
    });

    test("allows a starting location without evaluating its gates", () => {
        const evaluator = createEvaluator(false);
        const { service } = createService({
            locations: {
                MAP_PALLET_TOWN: {
                    id: "MAP_PALLET_TOWN",
                    gates: {
                        hard: [
                            {
                                requirement: { impossible: true }
                            }
                        ]
                    }
                }
            },
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_PALLET_TOWN",
                "STAGE_1"
            ),
            true
        );

        assert.equal(evaluator.calls.length, 0);
    });

    test("finds a location reachable through a connection", () => {
        const locations = {
            MAP_PALLET_TOWN: {
                id: "MAP_PALLET_TOWN",
                connections: [
                    { location: "MAP_ROUTE1" }
                ]
            },
            MAP_ROUTE1: {
                id: "MAP_ROUTE1",
                connections: [
                    { location: "MAP_ROUTE2" }
                ]
            },
            MAP_ROUTE2: {
                id: "MAP_ROUTE2",
                connections: []
            }
        };

        const { service } = createService({ locations });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_1"
            ),
            true
        );
    });

    test("returns false when a location is disconnected from all starting locations", () => {
        const locations = {
            MAP_PALLET_TOWN: {
                id: "MAP_PALLET_TOWN",
                connections: []
            },
            MAP_ROUTE2: {
                id: "MAP_ROUTE2",
                connections: []
            }
        };

        const { service } = createService({ locations });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_1"
            ),
            false
        );
    });

    test("cannot traverse a connection whose requirement is denied", () => {
        const locations = {
            MAP_PALLET_TOWN: {
                id: "MAP_PALLET_TOWN",
                connections: [
                    {
                        location: "MAP_ROUTE2",
                        requirements: [{ allowed: false }]
                    }
                ]
            },
            MAP_ROUTE2: {
                id: "MAP_ROUTE2",
                connections: []
            }
        };

        const evaluator = createEvaluator(
            requirement => requirement.allowed
        );

        const { service } = createService({
            locations,
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_1"
            ),
            false
        );
    });

    test("traverses a connection when its requirements are satisfied", () => {
        const locations = {
            MAP_PALLET_TOWN: {
                id: "MAP_PALLET_TOWN",
                connections: [
                    {
                        location: "MAP_ROUTE2",
                        requirements: [{ allowed: true }]
                    }
                ]
            },
            MAP_ROUTE2: {
                id: "MAP_ROUTE2",
                connections: []
            }
        };

        const evaluator = createEvaluator(
            requirement => requirement.allowed
        );

        const { service } = createService({
            locations,
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_1"
            ),
            true
        );
    });

    test("cannot reach a location through an unusable intermediate location", () => {
        const locations = {
            MAP_PALLET_TOWN: {
                id: "MAP_PALLET_TOWN",
                connections: [
                    { location: "MAP_ROUTE1" }
                ]
            },
            MAP_ROUTE1: {
                id: "MAP_ROUTE1",
                gates: {
                    hard: [
                        {
                            requirement: { allowed: false }
                        }
                    ]
                },
                connections: [
                    { location: "MAP_ROUTE2" }
                ]
            },
            MAP_ROUTE2: {
                id: "MAP_ROUTE2",
                connections: []
            }
        };

        const evaluator = createEvaluator(
            requirement => requirement.allowed
        );

        const { service } = createService({
            locations,
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_1"
            ),
            false
        );
    });

    test("can use another available route when the first route is blocked", () => {
        const locations = {
            MAP_PALLET_TOWN: {
                id: "MAP_PALLET_TOWN",
                connections: [
                    {
                        location: "MAP_ROUTE1",
                        requirements: [{ allowed: false }]
                    },
                    { location: "MAP_ROUTE3" }
                ]
            },
            MAP_ROUTE1: {
                id: "MAP_ROUTE1",
                connections: [
                    { location: "MAP_ROUTE2" }
                ]
            },
            MAP_ROUTE3: {
                id: "MAP_ROUTE3",
                connections: [
                    { location: "MAP_ROUTE2" }
                ]
            },
            MAP_ROUTE2: {
                id: "MAP_ROUTE2",
                connections: []
            }
        };

        const evaluator = createEvaluator(
            requirement => requirement.allowed
        );

        const { service } = createService({
            locations,
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_1"
            ),
            true
        );
    });

    test("ignores malformed connections while traversing", () => {
        const locations = {
            MAP_PALLET_TOWN: {
                id: "MAP_PALLET_TOWN",
                connections: [
                    null,
                    {},
                    { location: "" },
                    { location: "MAP_ROUTE2" }
                ]
            },
            MAP_ROUTE2: {
                id: "MAP_ROUTE2",
                connections: []
            }
        };

        const { service } = createService({ locations });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_1"
            ),
            true
        );
    });

    test("ignores connections pointing to unknown locations", () => {
        const locations = {
            MAP_PALLET_TOWN: {
                id: "MAP_PALLET_TOWN",
                connections: [
                    { location: "MAP_UNKNOWN" }
                ]
            },
            MAP_ROUTE2: {
                id: "MAP_ROUTE2",
                connections: []
            }
        };

        const { service } = createService({ locations });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_1"
            ),
            false
        );
    });

    test("handles a cyclic map graph without looping indefinitely", () => {
        const locations = {
            MAP_PALLET_TOWN: {
                id: "MAP_PALLET_TOWN",
                connections: [
                    { location: "MAP_ROUTE1" }
                ]
            },
            MAP_ROUTE1: {
                id: "MAP_ROUTE1",
                connections: [
                    { location: "MAP_PALLET_TOWN" },
                    { location: "MAP_ROUTE2" }
                ]
            },
            MAP_ROUTE2: {
                id: "MAP_ROUTE2",
                connections: [
                    { location: "MAP_ROUTE1" }
                ]
            }
        };

        const { service } = createService({ locations });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_1"
            ),
            true
        );
    });

    test("returns false for an isolated location in a cyclic graph", () => {
        const locations = {
            MAP_PALLET_TOWN: {
                id: "MAP_PALLET_TOWN",
                connections: [
                    { location: "MAP_ROUTE1" }
                ]
            },
            MAP_ROUTE1: {
                id: "MAP_ROUTE1",
                connections: [
                    { location: "MAP_PALLET_TOWN" }
                ]
            },
            MAP_ROUTE2: {
                id: "MAP_ROUTE2",
                connections: [
                    { location: "MAP_ROUTE3" }
                ]
            },
            MAP_ROUTE3: {
                id: "MAP_ROUTE3",
                connections: [
                    { location: "MAP_ROUTE2" }
                ]
            }
        };

        const { service } = createService({ locations });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_1"
            ),
            false
        );
    });

    test("allows an access-root gate with no requirement", () => {
        const locations = {
            MAP_ROUTE2: {
                id: "MAP_ROUTE2",
                gates: {
                    hard: [
                        {
                            accessRoot: true
                        }
                    ]
                },
                connections: []
            }
        };

        const { service } = createService({ locations });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_1"
            ),
            true
        );
    });

    test("allows a satisfied access-root gate", () => {
        const requirement = { badges: 2 };
        const evaluator = createEvaluator(true);

        const { service } = createService({
            locations: {
                MAP_ROUTE2: {
                    id: "MAP_ROUTE2",
                    gates: {
                        hard: [
                            {
                                accessRoot: true,
                                requirement
                            }
                        ]
                    },
                    connections: []
                }
            },
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_2"
            ),
            true
        );

        assert.equal(evaluator.calls[0].requirement, requirement);
    });

    test("rejects an unsatisfied access-root gate when no alternative route exists", () => {
        const evaluator = createEvaluator(false);

        const { service } = createService({
            locations: {
                MAP_ROUTE2: {
                    id: "MAP_ROUTE2",
                    gates: {
                        hard: [
                            {
                                accessRoot: true,
                                requirement: { badges: 8 }
                            }
                        ]
                    },
                    connections: []
                }
            },
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_2"
            ),
            false
        );
    });

    test("does not treat a non-root hard gate as an independent access root", () => {
        const evaluator = createEvaluator(true);

        const { service } = createService({
            locations: {
                MAP_ROUTE2: {
                    id: "MAP_ROUTE2",
                    gates: {
                        hard: [
                            {
                                requirement: { badges: 2 }
                            }
                        ]
                    },
                    connections: []
                }
            },
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_2"
            ),
            false
        );
    });

    test("allows a progression hard-gate access root without a requirement", () => {
        const { service } = createService({
            locations: {
                MAP_ROUTE2: {
                    id: "MAP_ROUTE2",
                    connections: []
                }
            },
            progressionRules: [
                {
                    location: "MAP_ROUTE2",
                    type: "HARD_GATE",
                    accessRoot: true
                }
            ]
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_2"
            ),
            true
        );
    });

    test("allows a progression hard-gate access root when its requirement is satisfied", () => {
        const requirement = { badges: 4 };
        const evaluator = createEvaluator(true);

        const { service } = createService({
            locations: {
                MAP_ROUTE2: {
                    id: "MAP_ROUTE2",
                    connections: []
                }
            },
            progressionRules: [
                {
                    location: "MAP_ROUTE2",
                    type: "HARD_GATE",
                    accessRoot: true,
                    requirement
                }
            ],
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_3"
            ),
            true
        );

        assert.equal(evaluator.calls[0].requirement, requirement);
    });

    test("rejects an unsatisfied progression hard-gate access root when disconnected", () => {
        const evaluator = createEvaluator(false);

        const { service } = createService({
            locations: {
                MAP_ROUTE2: {
                    id: "MAP_ROUTE2",
                    connections: []
                }
            },
            progressionRules: [
                {
                    location: "MAP_ROUTE2",
                    type: "HARD_GATE",
                    accessRoot: true,
                    requirement: { badges: 8 }
                }
            ],
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_3"
            ),
            false
        );
    });

    test("ignores progression rules that are not hard gates when resolving access roots", () => {
        const evaluator = createEvaluator(true);

        const { service } = createService({
            locations: {
                MAP_ROUTE2: {
                    id: "MAP_ROUTE2",
                    connections: []
                }
            },
            progressionRules: [
                {
                    location: "MAP_ROUTE2",
                    type: "GYM",
                    accessRoot: true
                }
            ],
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_3"
            ),
            false
        );

        assert.equal(evaluator.calls.length, 0);
    });

    test("normalizes progression rule type when checking access roots", () => {
        const { service } = createService({
            locations: {
                MAP_ROUTE2: {
                    id: "MAP_ROUTE2",
                    connections: []
                }
            },
            progressionRules: [
                {
                    location: "MAP_ROUTE2",
                    type: "hard_gate",
                    accessRoot: true
                }
            ]
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_3"
            ),
            true
        );
    });

    test("uses the supplied dependency stack when checking a repeated location", () => {
        const evaluator = createEvaluator(true);
        const stack = new Set(["MAP_ROUTE2"]);

        const { service } = createService({
            locations: {
                MAP_ROUTE2: {
                    id: "MAP_ROUTE2",
                    gates: {
                        hard: [
                            {
                                accessRoot: true,
                                requirement: { badges: 1 }
                            }
                        ]
                    },
                    connections: []
                }
            },
            requirementEvaluator: evaluator
        });

        assert.equal(
            service.canAccessLocationAtStage(
                "MAP_ROUTE2",
                "STAGE_1",
                {},
                stack
            ),
            true
        );

        assert.equal(
            evaluator.calls[0].dependencyStack,
            stack
        );
    });
});

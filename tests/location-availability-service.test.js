"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const LocationAvailabilityService = require("../scripts/services/location-availability-service");

// --------------------------------------------------
// Fixtures
// --------------------------------------------------

function createRules() {
    return [
        {
            location: "VIRIDIAN_FOREST",
            requirement: {
                badges: ["BOULDER_BADGE"],
                keyItems: [],
                flags: ["OAK_PARCEL_DELIVERED"]
            }
        },
        {
            location: "CERULEAN_CITY",
            requirement: {
                badges: ["BOULDER_BADGE"],
                keyItems: ["BICYCLE"],
                flags: ["BRIDGE_CLEARED"]
            }
        },
        {
            location: "POWER_PLANT",
            requirement: {
                badges: [
                    "BOULDER_BADGE",
                    "CASCADE_BADGE"
                ],
                keyItems: ["SURFBOARD"],
                flags: ["POWER_RESTORED"]
            }
        },
        {
            location: "PALLET_TOWN",
            requirement: {}
        },
        {
            location: "EMPTY_REQUIREMENTS",
            requirement: {
                badges: [],
                keyItems: [],
                flags: []
            }
        }
    ];
}

function createContext(options = {}) {
    return {
        badges: options.badges || [],
        keyItems: options.keyItems || [],
        flags: options.flags || []
    };
}

function createService(options = {}) {
    const locations = Object.prototype.hasOwnProperty.call(
        options,
        "locations"
    )
        ? options.locations
        : ["PALLET_TOWN", "VIRIDIAN_FOREST", "CERULEAN_CITY"];

    const rules = Object.prototype.hasOwnProperty.call(
        options,
        "rules"
    )
        ? options.rules
        : createRules();

    return {
        locations,
        rules,
        service: new LocationAvailabilityService(locations, rules)
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a LocationAvailabilityService instance", () => {
    const { service } = createService();

    assert.ok(service instanceof LocationAvailabilityService);
});

test("constructor stores the supplied location database", () => {
    const locations = ["PALLET_TOWN", "ROUTE_1"];

    const { service } = createService({ locations });

    assert.strictEqual(service.locations, locations);
});

test("constructor stores the supplied progression rules", () => {
    const rules = createRules();

    const { service } = createService({ rules });

    assert.strictEqual(service.rules, rules);
});

test("constructor defaults the location database to an empty array", () => {
    const service = new LocationAvailabilityService();

    assert.deepEqual(service.locations, []);
});

test("constructor defaults progression rules to an empty array", () => {
    const service = new LocationAvailabilityService();

    assert.deepEqual(service.rules, []);
});

test("constructor accepts an explicitly empty location database", () => {
    const { service } = createService({
        locations: []
    });

    assert.deepEqual(service.locations, []);
});

test("constructor accepts an explicitly empty rules array", () => {
    const { service } = createService({
        rules: []
    });

    assert.deepEqual(service.rules, []);
});

// --------------------------------------------------
// getLocationRule
// --------------------------------------------------

test("getLocationRule finds the Viridian Forest rule", () => {
    const { service, rules } = createService();

    assert.strictEqual(
        service.getLocationRule("VIRIDIAN_FOREST"),
        rules[0]
    );
});

test("getLocationRule finds the Cerulean City rule", () => {
    const { service } = createService();

    assert.equal(
        service.getLocationRule("CERULEAN_CITY").location,
        "CERULEAN_CITY"
    );
});

test("getLocationRule finds the Power Plant rule", () => {
    const { service } = createService();

    assert.equal(
        service.getLocationRule("POWER_PLANT").location,
        "POWER_PLANT"
    );
});

test("getLocationRule finds a rule with empty requirements", () => {
    const { service, rules } = createService();

    assert.strictEqual(
        service.getLocationRule("PALLET_TOWN"),
        rules[3]
    );
});

test("getLocationRule returns undefined for an unknown location", () => {
    const { service } = createService();

    assert.equal(
        service.getLocationRule("UNKNOWN_LOCATION"),
        undefined
    );
});

test("getLocationRule returns undefined when there are no rules", () => {
    const { service } = createService({
        rules: []
    });

    assert.equal(
        service.getLocationRule("VIRIDIAN_FOREST"),
        undefined
    );
});

test("getLocationRule uses exact location matching", () => {
    const { service } = createService();

    assert.equal(
        service.getLocationRule("viridian_forest"),
        undefined
    );
});

test("getLocationRule returns the first rule when locations are duplicated", () => {
    const rules = [
        {
            location: "ROUTE_1",
            requirement: {
                badges: ["FIRST_BADGE"]
            }
        },
        {
            location: "ROUTE_1",
            requirement: {
                badges: ["SECOND_BADGE"]
            }
        }
    ];

    const { service } = createService({ rules });

    assert.strictEqual(
        service.getLocationRule("ROUTE_1"),
        rules[0]
    );
});

test("getLocationRule does not mutate the rules array", () => {
    const { service, rules } = createService();
    const original = [...rules];

    service.getLocationRule("CERULEAN_CITY");

    assert.deepEqual(rules, original);
});

// --------------------------------------------------
// isAvailable: no rule
// --------------------------------------------------

test("isAvailable returns AVAILABLE when the location has no rule", () => {
    const { service } = createService();

    assert.deepEqual(
        service.isAvailable("UNKNOWN_LOCATION"),
        {
            available: true,
            status: "AVAILABLE",
            location: "UNKNOWN_LOCATION",
            reason: null
        }
    );
});

test("isAvailable allows an unlisted location without requirements", () => {
    const { service } = createService({
        rules: []
    });

    assert.equal(
        service.isAvailable("ROUTE_1").available,
        true
    );
});

test("isAvailable includes the requested location when no rule exists", () => {
    const { service } = createService({
        rules: []
    });

    assert.equal(
        service.isAvailable("CUSTOM_LOCATION").location,
        "CUSTOM_LOCATION"
    );
});

test("isAvailable reports a null reason when no rule exists", () => {
    const { service } = createService({
        rules: []
    });

    assert.equal(
        service.isAvailable("CUSTOM_LOCATION").reason,
        null
    );
});

test("isAvailable returns AVAILABLE for a rule with empty requirements", () => {
    const { service } = createService();

    assert.deepEqual(
        service.isAvailable("PALLET_TOWN"),
        {
            available: true,
            status: "AVAILABLE",
            location: "PALLET_TOWN",
            reason: null
        }
    );
});

test("isAvailable returns AVAILABLE for empty requirement lists", () => {
    const { service } = createService();

    assert.deepEqual(
        service.isAvailable("EMPTY_REQUIREMENTS"),
        {
            available: true,
            status: "AVAILABLE",
            location: "EMPTY_REQUIREMENTS",
            reason: null
        }
    );
});

test("isAvailable defaults context to an empty object", () => {
    const { service } = createService();

    assert.equal(
        service.isAvailable("VIRIDIAN_FOREST").available,
        false
    );
});

// --------------------------------------------------
// checkRequirements: no requirements
// --------------------------------------------------

test("checkRequirements returns available for an empty requirement object", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements({}),
        {
            available: true,
            missingRequirements: []
        }
    );
});

test("checkRequirements defaults requirements to an empty object", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(),
        {
            available: true,
            missingRequirements: []
        }
    );
});

test("checkRequirements defaults context to an empty object", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements({
            badges: [],
            keyItems: [],
            flags: []
        }),
        {
            available: true,
            missingRequirements: []
        }
    );
});

test("checkRequirements accepts empty badge requirements", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements({
            badges: []
        }),
        {
            available: true,
            missingRequirements: []
        }
    );
});

test("checkRequirements accepts empty key item requirements", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements({
            keyItems: []
        }),
        {
            available: true,
            missingRequirements: []
        }
    );
});

test("checkRequirements accepts empty story flag requirements", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements({
            flags: []
        }),
        {
            available: true,
            missingRequirements: []
        }
    );
});

// --------------------------------------------------
// checkRequirements: badges
// --------------------------------------------------

test("checkRequirements accepts an owned badge", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(
            {
                badges: ["BOULDER_BADGE"]
            },
            createContext({
                badges: ["BOULDER_BADGE"]
            })
        ),
        {
            available: true,
            missingRequirements: []
        }
    );
});

test("checkRequirements rejects a missing badge", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(
            {
                badges: ["BOULDER_BADGE"]
            },
            createContext()
        ),
        {
            available: false,
            reason: "Location unavailable. Missing requirements: BOULDER_BADGE",
            missingRequirements: ["BOULDER_BADGE"]
        }
    );
});

test("checkRequirements accepts multiple owned badges", () => {
    const { service } = createService();

    assert.equal(
        service.checkRequirements(
            {
                badges: ["BOULDER_BADGE", "CASCADE_BADGE"]
            },
            createContext({
                badges: ["BOULDER_BADGE", "CASCADE_BADGE"]
            })
        ).available,
        true
    );
});

test("checkRequirements returns every missing badge", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(
            {
                badges: [
                    "BOULDER_BADGE",
                    "CASCADE_BADGE",
                    "THUNDER_BADGE"
                ]
            },
            createContext({
                badges: ["CASCADE_BADGE"]
            })
        ).missingRequirements,
        ["BOULDER_BADGE", "THUNDER_BADGE"]
    );
});

test("checkRequirements treats badge matching as case-sensitive", () => {
    const { service } = createService();

    assert.equal(
        service.checkRequirements(
            {
                badges: ["BOULDER_BADGE"]
            },
            createContext({
                badges: ["boulder_badge"]
            })
        ).available,
        false
    );
});

test("checkRequirements treats missing context badges as empty", () => {
    const { service } = createService();

    assert.equal(
        service.checkRequirements(
            {
                badges: ["BOULDER_BADGE"]
            },
            {}
        ).available,
        false
    );
});

// --------------------------------------------------
// checkRequirements: key items
// --------------------------------------------------

test("checkRequirements accepts an owned key item", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(
            {
                keyItems: ["BICYCLE"]
            },
            createContext({
                keyItems: ["BICYCLE"]
            })
        ),
        {
            available: true,
            missingRequirements: []
        }
    );
});

test("checkRequirements rejects a missing key item", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(
            {
                keyItems: ["BICYCLE"]
            },
            createContext()
        ),
        {
            available: false,
            reason: "Location unavailable. Missing requirements: BICYCLE",
            missingRequirements: ["BICYCLE"]
        }
    );
});

test("checkRequirements returns every missing key item", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(
            {
                keyItems: ["BICYCLE", "SS_TICKET", "POKE_FLUTE"]
            },
            createContext({
                keyItems: ["SS_TICKET"]
            })
        ).missingRequirements,
        ["BICYCLE", "POKE_FLUTE"]
    );
});

test("checkRequirements handles mixed owned and missing key items", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(
            {
                keyItems: ["BICYCLE", "SS_TICKET"]
            },
            createContext({
                keyItems: ["BICYCLE"]
            })
        ).missingRequirements,
        ["SS_TICKET"]
    );
});

test("checkRequirements treats key item matching as case-sensitive", () => {
    const { service } = createService();

    assert.equal(
        service.checkRequirements(
            {
                keyItems: ["BICYCLE"]
            },
            createContext({
                keyItems: ["bicycle"]
            })
        ).available,
        false
    );
});

test("checkRequirements treats missing context key items as empty", () => {
    const { service } = createService();

    assert.equal(
        service.checkRequirements(
            {
                keyItems: ["BICYCLE"]
            },
            {}
        ).available,
        false
    );
});

// --------------------------------------------------
// checkRequirements: story flags
// --------------------------------------------------

test("checkRequirements accepts a present story flag", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(
            {
                flags: ["BRIDGE_CLEARED"]
            },
            createContext({
                flags: ["BRIDGE_CLEARED"]
            })
        ),
        {
            available: true,
            missingRequirements: []
        }
    );
});

test("checkRequirements rejects a missing story flag", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(
            {
                flags: ["BRIDGE_CLEARED"]
            },
            createContext()
        ),
        {
            available: false,
            reason: "Location unavailable. Missing requirements: BRIDGE_CLEARED",
            missingRequirements: ["BRIDGE_CLEARED"]
        }
    );
});

test("checkRequirements returns every missing story flag", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(
            {
                flags: [
                    "BRIDGE_CLEARED",
                    "POWER_RESTORED",
                    "OAK_PARCEL_DELIVERED"
                ]
            },
            createContext({
                flags: ["POWER_RESTORED"]
            })
        ).missingRequirements,
        ["BRIDGE_CLEARED", "OAK_PARCEL_DELIVERED"]
    );
});

test("checkRequirements handles mixed present and missing story flags", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(
            {
                flags: ["FLAG_A", "FLAG_B", "FLAG_C"]
            },
            createContext({
                flags: ["FLAG_A", "FLAG_C"]
            })
        ).missingRequirements,
        ["FLAG_B"]
    );
});

test("checkRequirements treats story flag matching as case-sensitive", () => {
    const { service } = createService();

    assert.equal(
        service.checkRequirements(
            {
                flags: ["BRIDGE_CLEARED"]
            },
            createContext({
                flags: ["bridge_cleared"]
            })
        ).available,
        false
    );
});

test("checkRequirements treats missing context flags as empty", () => {
    const { service } = createService();

    assert.equal(
        service.checkRequirements(
            {
                flags: ["BRIDGE_CLEARED"]
            },
            {}
        ).available,
        false
    );
});

// --------------------------------------------------
// checkRequirements: combinations
// --------------------------------------------------

test("checkRequirements accepts a combination when every requirement is met", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(
            {
                badges: ["BOULDER_BADGE"],
                keyItems: ["BICYCLE"],
                flags: ["BRIDGE_CLEARED"]
            },
            createContext({
                badges: ["BOULDER_BADGE"],
                keyItems: ["BICYCLE"],
                flags: ["BRIDGE_CLEARED"]
            })
        ),
        {
            available: true,
            missingRequirements: []
        }
    );
});

test("checkRequirements reports missing requirements from all categories", () => {
    const { service } = createService();

    assert.deepEqual(
        service.checkRequirements(
            {
                badges: ["BOULDER_BADGE"],
                keyItems: ["BICYCLE"],
                flags: ["BRIDGE_CLEARED"]
            },
            createContext()
        ).missingRequirements,
        [
            "BOULDER_BADGE",
            "BICYCLE",
            "BRIDGE_CLEARED"
        ]
    );
});

test("checkRequirements checks badges before key items and flags", () => {
    const { service } = createService();

    const result = service.checkRequirements(
        {
            badges: ["BADGE_A", "BADGE_B"],
            keyItems: ["ITEM_A"],
            flags: ["FLAG_A", "FLAG_B"]
        },
        {}
    );

    assert.deepEqual(
        result.missingRequirements,
        [
            "BADGE_A",
            "BADGE_B",
            "ITEM_A",
            "FLAG_A",
            "FLAG_B"
        ]
    );
});

test("checkRequirements only reports missing requirements", () => {
    const { service } = createService();

    const result = service.checkRequirements(
        {
            badges: ["BADGE_A", "BADGE_B"],
            keyItems: ["ITEM_A"],
            flags: ["FLAG_A"]
        },
        createContext({
            badges: ["BADGE_A"],
            keyItems: ["ITEM_A"],
            flags: []
        })
    );

    assert.deepEqual(
        result.missingRequirements,
        ["BADGE_B", "FLAG_A"]
    );
});

test("checkRequirements includes repeated missing requirements", () => {
    const { service } = createService();

    const result = service.checkRequirements(
        {
            badges: ["BADGE_A", "BADGE_A"]
        },
        {}
    );

    assert.deepEqual(
        result.missingRequirements,
        ["BADGE_A", "BADGE_A"]
    );
});

test("checkRequirements creates a reason from all missing requirements", () => {
    const { service } = createService();

    const result = service.checkRequirements(
        {
            badges: ["BOULDER_BADGE"],
            keyItems: ["BICYCLE"],
            flags: ["BRIDGE_CLEARED"]
        },
        {}
    );

    assert.equal(
        result.reason,
        "Location unavailable. Missing requirements: BOULDER_BADGE, BICYCLE, BRIDGE_CLEARED"
    );
});

test("checkRequirements returns no missing requirements when all checks pass", () => {
    const { service } = createService();

    const result = service.checkRequirements(
        {
            badges: ["BOULDER_BADGE"],
            keyItems: ["BICYCLE"],
            flags: ["BRIDGE_CLEARED"]
        },
        createContext({
            badges: ["BOULDER_BADGE"],
            keyItems: ["BICYCLE"],
            flags: ["BRIDGE_CLEARED"]
        })
    );

    assert.deepEqual(result.missingRequirements, []);
});

test("checkRequirements does not include a reason on success", () => {
    const { service } = createService();

    const result = service.checkRequirements(
        {},
        {}
    );

    assert.equal(
        Object.prototype.hasOwnProperty.call(result, "reason"),
        false
    );
});

// --------------------------------------------------
// generateReason
// --------------------------------------------------

test("generateReason includes the missing requirements prefix", () => {
    const { service } = createService();

    assert.equal(
        service.generateReason(["BOULDER_BADGE"]),
        "Location unavailable. Missing requirements: BOULDER_BADGE"
    );
});

test("generateReason joins multiple requirements with commas", () => {
    const { service } = createService();

    assert.equal(
        service.generateReason([
            "BOULDER_BADGE",
            "BICYCLE",
            "BRIDGE_CLEARED"
        ]),
        "Location unavailable. Missing requirements: BOULDER_BADGE, BICYCLE, BRIDGE_CLEARED"
    );
});

test("generateReason returns the prefix for an empty array", () => {
    const { service } = createService();

    assert.equal(
        service.generateReason([]),
        "Location unavailable. Missing requirements: "
    );
});

test("generateReason preserves requirement order", () => {
    const { service } = createService();

    assert.equal(
        service.generateReason(["FLAG_B", "BADGE_A", "ITEM_C"]),
        "Location unavailable. Missing requirements: FLAG_B, BADGE_A, ITEM_C"
    );
});

test("generateReason does not mutate the missing array", () => {
    const { service } = createService();

    const missing = ["BADGE_A", "ITEM_B"];
    const original = [...missing];

    service.generateReason(missing);

    assert.deepEqual(missing, original);
});

test("generateReason handles string values in the missing array", () => {
    const { service } = createService();

    assert.equal(
        service.generateReason(["CUT", "SURF"]),
        "Location unavailable. Missing requirements: CUT, SURF"
    );
});

// --------------------------------------------------
// isAvailable: locked locations
// --------------------------------------------------

test("isAvailable locks Viridian Forest when requirements are missing", () => {
    const { service } = createService();

    assert.deepEqual(
        service.isAvailable("VIRIDIAN_FOREST"),
        {
            available: false,
            status: "LOCKED",
            location: "VIRIDIAN_FOREST",
            reason: "Location unavailable. Missing requirements: BOULDER_BADGE, OAK_PARCEL_DELIVERED",
            missingRequirements: [
                "BOULDER_BADGE",
                "OAK_PARCEL_DELIVERED"
            ]
        }
    );
});

test("isAvailable unlocks Viridian Forest when all requirements are met", () => {
    const { service } = createService();

    assert.deepEqual(
        service.isAvailable(
            "VIRIDIAN_FOREST",
            createContext({
                badges: ["BOULDER_BADGE"],
                flags: ["OAK_PARCEL_DELIVERED"]
            })
        ),
        {
            available: true,
            status: "AVAILABLE",
            location: "VIRIDIAN_FOREST",
            reason: null
        }
    );
});

test("isAvailable locks Cerulean City when multiple requirements are missing", () => {
    const { service } = createService();

    const result = service.isAvailable(
        "CERULEAN_CITY",
        createContext({
            badges: ["BOULDER_BADGE"]
        })
    );

    assert.equal(result.available, false);
    assert.equal(result.status, "LOCKED");

    assert.deepEqual(
        result.missingRequirements,
        ["BICYCLE", "BRIDGE_CLEARED"]
    );
});

test("isAvailable unlocks Cerulean City when all requirements are met", () => {
    const { service } = createService();

    const result = service.isAvailable(
        "CERULEAN_CITY",
        createContext({
            badges: ["BOULDER_BADGE"],
            keyItems: ["BICYCLE"],
            flags: ["BRIDGE_CLEARED"]
        })
    );

    assert.equal(result.available, true);
    assert.equal(result.status, "AVAILABLE");
    assert.equal(result.reason, null);
});

test("isAvailable locks Power Plant when all required categories are missing", () => {
    const { service } = createService();

    const result = service.isAvailable("POWER_PLANT");

    assert.equal(result.available, false);
    assert.deepEqual(
        result.missingRequirements,
        [
            "BOULDER_BADGE",
            "CASCADE_BADGE",
            "SURFBOARD",
            "POWER_RESTORED"
        ]
    );
});

test("isAvailable returns only missing requirements in the locked result", () => {
    const { service } = createService();

    const result = service.isAvailable(
        "POWER_PLANT",
        createContext({
            badges: ["BOULDER_BADGE"],
            flags: ["POWER_RESTORED"]
        })
    );

    assert.deepEqual(
        result.missingRequirements,
        ["CASCADE_BADGE", "SURFBOARD"]
    );
});

test("isAvailable returns the expected fields for an available location", () => {
    const { service } = createService();

    const result = service.isAvailable("PALLET_TOWN");

    assert.deepEqual(
        Object.keys(result),
        ["available", "status", "location", "reason"]
    );
});

test("isAvailable returns the expected fields for a locked location", () => {
    const { service } = createService();

    const result = service.isAvailable("VIRIDIAN_FOREST");

    assert.deepEqual(
        Object.keys(result),
        [
            "available",
            "status",
            "location",
            "reason",
            "missingRequirements"
        ]
    );
});

test("isAvailable preserves the exact location identifier", () => {
    const { service } = createService({
        rules: []
    });

    assert.equal(
        service.isAvailable("CUSTOM_LOCATION").location,
        "CUSTOM_LOCATION"
    );
});

test("isAvailable uses only the first matching location rule", () => {
    const rules = [
        {
            location: "ROUTE_1",
            requirement: {}
        },
        {
            location: "ROUTE_1",
            requirement: {
                badges: ["BADGE_A"]
            }
        }
    ];

    const { service } = createService({ rules });

    assert.equal(
        service.isAvailable("ROUTE_1").available,
        true
    );
});

// --------------------------------------------------
// explain
// --------------------------------------------------

test("explain returns an availability explanation", () => {
    const { service } = createService();

    assert.deepEqual(
        service.explain("PALLET_TOWN"),
        {
            available: true,
            status: "AVAILABLE",
            location: "PALLET_TOWN",
            reason: null
        }
    );
});

test("explain reports why a location is locked", () => {
    const { service } = createService();

    const result = service.explain("VIRIDIAN_FOREST");

    assert.equal(result.available, false);
    assert.equal(result.status, "LOCKED");

    assert.match(
        result.reason,
        /BOULDER_BADGE/
    );

    assert.match(
        result.reason,
        /OAK_PARCEL_DELIVERED/
    );
});

test("explain forwards context when checking a location", () => {
    const { service } = createService();

    const context = createContext({
        badges: ["BOULDER_BADGE"],
        flags: ["OAK_PARCEL_DELIVERED"]
    });

    assert.deepEqual(
        service.explain("VIRIDIAN_FOREST", context),
        service.isAvailable("VIRIDIAN_FOREST", context)
    );
});

test("explain defaults context to an empty object", () => {
    const { service } = createService();

    assert.deepEqual(
        service.explain("VIRIDIAN_FOREST"),
        service.isAvailable("VIRIDIAN_FOREST")
    );
});

test("explain allows a location that has no matching rule", () => {
    const { service } = createService({
        rules: []
    });

    assert.deepEqual(
        service.explain("UNLISTED_LOCATION"),
        {
            available: true,
            status: "AVAILABLE",
            location: "UNLISTED_LOCATION",
            reason: null
        }
    );
});

// --------------------------------------------------
// Context isolation and repeated checks
// --------------------------------------------------

test("isAvailable does not mutate the provided context", () => {
    const { service } = createService();

    const context = createContext({
        badges: ["BOULDER_BADGE"],
        keyItems: ["BICYCLE"],
        flags: ["BRIDGE_CLEARED"]
    });

    const original = {
        badges: [...context.badges],
        keyItems: [...context.keyItems],
        flags: [...context.flags]
    };

    service.isAvailable("CERULEAN_CITY", context);

    assert.deepEqual(context, original);
});

test("isAvailable does not mutate progression rules", () => {
    const { service, rules } = createService();
    const original = structuredClone(rules);

    service.isAvailable("VIRIDIAN_FOREST");

    assert.deepEqual(rules, original);
});

test("repeated availability checks return consistent results", () => {
    const { service } = createService();

    const first = service.isAvailable("VIRIDIAN_FOREST");
    const second = service.isAvailable("VIRIDIAN_FOREST");

    assert.deepEqual(first, second);
});

test("availability is recalculated when context changes", () => {
    const { service } = createService();

    const locked = service.isAvailable(
        "VIRIDIAN_FOREST",
        createContext()
    );

    const unlocked = service.isAvailable(
        "VIRIDIAN_FOREST",
        createContext({
            badges: ["BOULDER_BADGE"],
            flags: ["OAK_PARCEL_DELIVERED"]
        })
    );

    assert.equal(locked.available, false);
    assert.equal(unlocked.available, true);
});

test("independent context objects produce independent availability results", () => {
    const { service } = createService();

    const first = service.isAvailable(
        "VIRIDIAN_FOREST",
        createContext({
            badges: ["BOULDER_BADGE"],
            flags: ["OAK_PARCEL_DELIVERED"]
        })
    );

    const second = service.isAvailable(
        "VIRIDIAN_FOREST",
        createContext()
    );

    assert.equal(first.available, true);
    assert.equal(second.available, false);
});
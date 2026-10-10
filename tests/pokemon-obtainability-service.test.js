"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const PokemonObtainabilityService =
    require("../scripts/services/pokemon-obtainability-service");


function createSources(sources = []) {
    const calls = [];

    return {
        calls,
        service: {
            resolve(species) {
                calls.push(species);
                return { sources };
            }
        }
    };
}

function createLocationService(result = { available: true }) {
    const calls = [];

    return {
        calls,
        service: {
            isAvailable(location, context) {
                calls.push({ location, context });
                return result;
            }
        }
    };
}

function createStarterSelectionService(result = true) {
    const calls = [];

    return {
        calls,
        service: {
            belongsToSelectedFamily(playerState, species) {
                calls.push({ playerState, species });
                return result;
            }
        }
    };
}

function createService({
    sources = createSources(),
    locations = createLocationService(),
    availability = null,
    starterSelection = null
} = {}) {
    return new PokemonObtainabilityService(
        sources.service || sources,
        locations.service || locations,
        availability,
        starterSelection?.service || starterSelection
    );
}

function wildSource(location = "PALLET_TOWN") {
    return {
        method: "WILD",
        location
    };
}

function starterSource() {
    return {
        method: "STARTER"
    };
}

function evolutionSource(requirement = "LEVEL_16") {
    return {
        method: "EVOLUTION",
        requirement
    };
}

function tradeSource() {
    return {
        method: "TRADE"
    };
}


// -----------------------------------------------
// Constructor
// -----------------------------------------------

test("constructor creates a PokemonObtainabilityService instance", () => {
    assert.ok(
        createService() instanceof PokemonObtainabilityService
    );
});

test("constructor stores the source resolver", () => {
    const sources = createSources();
    const service = createService({ sources });

    assert.equal(service.sources, sources.service);
});

test("constructor stores the location service", () => {
    const locations = createLocationService();
    const service = createService({ locations });

    assert.equal(service.locations, locations.service);
});

test("constructor defaults the availability service to null", () => {
    const service = createService();

    assert.equal(service.availability, null);
});

test("constructor stores the injected availability service", () => {
    const availability = { marker: "availability service" };
    const service = createService({ availability });

    assert.equal(service.availability, availability);
});

test("constructor defaults the starter-selection service to null", () => {
    const service = createService();

    assert.equal(service.starterSelection, null);
});

test("constructor stores the injected starter-selection service", () => {
    const starterSelection = createStarterSelectionService();
    const service = createService({ starterSelection });

    assert.equal(
        service.starterSelection,
        starterSelection.service
    );
});


// -----------------------------------------------
// canObtain: source resolution
// -----------------------------------------------

test("canObtain resolves sources using the requested species", () => {
    const sources = createSources([evolutionSource()]);
    const service = createService({ sources });

    service.canObtain("CHARMANDER");

    assert.deepEqual(sources.calls, ["CHARMANDER"]);
});

test("canObtain returns UNKNOWN when there are no known sources", () => {
    const sources = createSources([]);
    const service = createService({ sources });

    assert.deepEqual(
        service.canObtain("MISSINGNO"),
        {
            available: false,
            status: "UNKNOWN",
            species: "MISSINGNO",
            reason: "No known acquisition method."
        }
    );
});

test("canObtain returns UNKNOWN for an empty sources array", () => {
    const sources = createSources([]);
    const service = createService({ sources });

    const result = service.canObtain("UNKNOWN_SPECIES");

    assert.equal(result.status, "UNKNOWN");
    assert.equal(result.available, false);
    assert.equal(result.species, "UNKNOWN_SPECIES");
});

test("canObtain includes the requested species in an unknown result", () => {
    const service = createService({
        sources: createSources([])
    });

    assert.equal(
        service.canObtain("BULBASAUR").species,
        "BULBASAUR"
    );
});

test("canObtain returns AVAILABLE when an evolution source exists", () => {
    const service = createService({
        sources: createSources([evolutionSource()])
    });

    const result = service.canObtain("CHARMELEON");

    assert.equal(result.available, true);
    assert.equal(result.status, "AVAILABLE");
    assert.equal(result.species, "CHARMELEON");
    assert.equal(result.source, "EVOLUTION");
});

test("canObtain returns the successful source result in details", () => {
    const source = evolutionSource("LEVEL_36");
    const service = createService({
        sources: createSources([source])
    });

    const result = service.canObtain("CHARIZARD");

    assert.deepEqual(result.details, {
        available: true,
        source: "EVOLUTION",
        requirement: "LEVEL_36"
    });
});

test("canObtain returns only the expected fields for an available result", () => {
    const service = createService({
        sources: createSources([evolutionSource()])
    });

    const result = service.canObtain("CHARMELEON");

    assert.deepEqual(
        Object.keys(result).sort(),
        ["available", "status", "species", "source", "details"].sort()
    );
});

test("canObtain selects the first available source", () => {
    const sources = createSources([
        tradeSource(),
        evolutionSource("LEVEL_16")
    ]);
    const service = createService({ sources });

    const result = service.canObtain("CHARMELEON");

    assert.equal(result.available, true);
    assert.equal(result.source, "EVOLUTION");
});

test("canObtain checks all sources before selecting an available source", () => {
    const locations = createLocationService({
        available: false,
        reason: "Location locked",
        missingRequirements: ["BADGE_1"]
    });

    const sources = createSources([
        wildSource("ROUTE_1"),
        evolutionSource("LEVEL_16")
    ]);

    const service = createService({ sources, locations });

    service.canObtain("CHARMELEON");

    assert.equal(locations.calls.length, 1);
    assert.equal(locations.calls[0].location, "ROUTE_1");
});

test("canObtain returns AVAILABLE if a later source is accessible", () => {
    const locations = createLocationService({
        available: false,
        reason: "Route locked",
        missingRequirements: ["BADGE_1"]
    });

    const sources = createSources([
        wildSource("ROUTE_1"),
        evolutionSource("LEVEL_16")
    ]);

    const service = createService({ sources, locations });
    const result = service.canObtain("CHARMELEON");

    assert.equal(result.available, true);
    assert.equal(result.source, "EVOLUTION");
});


// -----------------------------------------------
// canObtain: blocked sources and requirements
// -----------------------------------------------

test("canObtain returns LOCKED when every source is blocked", () => {
    const locations = createLocationService({
        available: false,
        reason: "Location locked",
        missingRequirements: ["BADGE_1"]
    });

    const service = createService({
        sources: createSources([wildSource()]),
        locations
    });

    const result = service.canObtain("PIKACHU");

    assert.equal(result.available, false);
    assert.equal(result.status, "LOCKED");
    assert.equal(result.species, "PIKACHU");
});

test("canObtain uses the first blocked source reason", () => {
    const sources = createSources([
        wildSource("ROUTE_1"),
        tradeSource()
    ]);

    const locations = createLocationService({
        available: false,
        reason: "Route is not accessible",
        missingRequirements: ["BADGE_1"]
    });

    const service = createService({ sources, locations });
    const result = service.canObtain("PIKACHU");

    assert.equal(result.reason, "Route is not accessible");
});

test("canObtain collects missing requirements from all blocked sources", () => {
    const sources = createSources([
        wildSource("ROUTE_1"),
        wildSource("CAVE_1")
    ]);

    const calls = [];
    const locations = {
        service: {
            isAvailable(location) {
                calls.push(location);

                if (location === "ROUTE_1") {
                    return {
                        available: false,
                        reason: "Route locked",
                        missingRequirements: ["BADGE_1", "CUT"]
                    };
                }

                return {
                    available: false,
                    reason: "Cave locked",
                    missingRequirements: ["CUT", "SURF"]
                };
            }
        }
    };

    const service = createService({ sources, locations });
    const result = service.canObtain("ONIX");

    assert.deepEqual(
        result.missingRequirements,
        ["BADGE_1", "CUT", "SURF"]
    );
});

test("canObtain deduplicates missing requirements", () => {
    const sources = createSources([
        wildSource("ROUTE_1"),
        wildSource("ROUTE_2")
    ]);

    const locations = {
        service: {
            isAvailable() {
                return {
                    available: false,
                    reason: "Locked",
                    missingRequirements: ["BADGE_1", "BADGE_1"]
                };
            }
        }
    };

    const service = createService({ sources, locations });
    const result = service.canObtain("PIKACHU");

    assert.deepEqual(result.missingRequirements, ["BADGE_1"]);
});

test("canObtain includes an empty missingRequirements array when no blocked source supplies requirements", () => {
    const service = createService({
        sources: createSources([tradeSource()])
    });

    const result = service.canObtain("PIKACHU");

    assert.deepEqual(result.missingRequirements, []);
});

test("canObtain includes all blocked source results", () => {
    const service = createService({
        sources: createSources([
            tradeSource(),
            starterSource()
        ])
    });

    const result = service.canObtain("PIKACHU");

    assert.equal(result.status, "LOCKED");
    assert.equal(result.sources.length, 2);
    assert.equal(result.sources[0].source, "TRADE");
    assert.equal(result.sources[1].source, "STARTER");
});

test("canObtain returns the first blocked reason even when later sources have different reasons", () => {
    const service = createService({
        sources: createSources([
            tradeSource(),
            starterSource()
        ])
    });

    const result = service.canObtain("PIKACHU");

    assert.equal(result.reason, "Requires trading.");
});


// -----------------------------------------------
// checkSource: wild encounters
// -----------------------------------------------

test("checkSource checks the wild encounter's location", () => {
    const locations = createLocationService();
    const service = createService({ locations });
    const context = { badges: ["BADGE_1"] };

    service.checkSource("PIKACHU", wildSource("VIRIDIAN_FOREST"), context);

    assert.deepEqual(locations.calls, [
        {
            location: "VIRIDIAN_FOREST",
            context
        }
    ]);
});

test("checkSource passes the context object to the location service unchanged", () => {
    const locations = createLocationService();
    const service = createService({ locations });
    const context = { allowFly: true };

    service.checkSource("PIKACHU", wildSource(), context);

    assert.equal(locations.calls[0].context, context);
});

test("checkSource returns an available wild result when the location is accessible", () => {
    const service = createService({
        locations: createLocationService({ available: true })
    });

    assert.deepEqual(
        service.checkSource("PIKACHU", wildSource("ROUTE_1"), {}),
        {
            available: true,
            source: "WILD",
            location: "ROUTE_1"
        }
    );
});

test("checkSource includes the wild encounter location in the result", () => {
    const service = createService();

    const result = service.checkSource(
        "PIKACHU",
        wildSource("POWER_PLANT"),
        {}
    );

    assert.equal(result.location, "POWER_PLANT");
});

test("checkSource returns a blocked wild result when the location is inaccessible", () => {
    const locationResult = {
        available: false,
        reason: "Need Surf",
        missingRequirements: ["SURF"]
    };

    const service = createService({
        locations: createLocationService(locationResult)
    });

    assert.deepEqual(
        service.checkSource("PIKACHU", wildSource("POWER_PLANT"), {}),
        {
            available: false,
            source: "WILD",
            reason: "Need Surf",
            missingRequirements: ["SURF"]
        }
    );
});

test("checkSource preserves missing requirements from the location result", () => {
    const locationResult = {
        available: false,
        reason: "Locked",
        missingRequirements: ["BADGE_2", "CUT"]
    };

    const service = createService({
        locations: createLocationService(locationResult)
    });

    const result = service.checkSource("ONIX", wildSource(), {});

    assert.deepEqual(
        result.missingRequirements,
        ["BADGE_2", "CUT"]
    );
});

test("checkSource preserves an undefined location missingRequirements field", () => {
    const service = createService({
        locations: createLocationService({
            available: false,
            reason: "Locked"
        })
    });

    const result = service.checkSource("ONIX", wildSource(), {});

    assert.equal(result.available, false);
    assert.equal(result.missingRequirements, undefined);
});


// -----------------------------------------------
// checkSource: starter acquisition
// -----------------------------------------------

test("checkSource blocks starters when starter selection service is missing", () => {
    const service = createService();

    assert.deepEqual(
        service.checkSource("BULBASAUR", starterSource(), {
            playerState: {}
        }),
        {
            available: false,
            source: "STARTER",
            reason: "Starter selection unavailable."
        }
    );
});

test("checkSource blocks starters when playerState is missing", () => {
    const starterSelection = createStarterSelectionService(true);
    const service = createService({ starterSelection });

    assert.deepEqual(
        service.checkSource("BULBASAUR", starterSource(), {}),
        {
            available: false,
            source: "STARTER",
            reason: "Starter selection unavailable."
        }
    );

    assert.equal(starterSelection.calls.length, 0);
});

test("checkSource blocks starters when playerState is null", () => {
    const starterSelection = createStarterSelectionService(true);
    const service = createService({ starterSelection });

    const result = service.checkSource("BULBASAUR", starterSource(), {
        playerState: null
    });

    assert.equal(result.available, false);
    assert.equal(result.reason, "Starter selection unavailable.");
});

test("checkSource allows a starter in the selected family", () => {
    const starterSelection = createStarterSelectionService(true);
    const service = createService({ starterSelection });
    const playerState = { starter: "BULBASAUR" };

    assert.deepEqual(
        service.checkSource("IVYSAUR", starterSource(), { playerState }),
        {
            available: true,
            source: "STARTER"
        }
    );
});

test("checkSource calls belongsToSelectedFamily with playerState and species", () => {
    const starterSelection = createStarterSelectionService(true);
    const service = createService({ starterSelection });
    const playerState = { starter: "SQUIRTLE" };

    service.checkSource("WARTORTLE", starterSource(), { playerState });

    assert.deepEqual(starterSelection.calls, [
        {
            playerState,
            species: "WARTORTLE"
        }
    ]);
});

test("checkSource blocks a starter outside the selected family", () => {
    const starterSelection = createStarterSelectionService(false);
    const service = createService({ starterSelection });

    assert.deepEqual(
        service.checkSource("CHARMANDER", starterSource(), {
            playerState: { starter: "SQUIRTLE" }
        }),
        {
            available: false,
            source: "STARTER",
            reason: "Different starter family selected."
        }
    );
});

test("checkSource does not call starter selection when playerState is absent", () => {
    const starterSelection = createStarterSelectionService(true);
    const service = createService({ starterSelection });

    service.checkSource("BULBASAUR", starterSource(), {});

    assert.equal(starterSelection.calls.length, 0);
});


// -----------------------------------------------
// checkSource: evolution acquisition
// -----------------------------------------------

test("checkSource allows evolution as an acquisition method", () => {
    const service = createService();

    assert.deepEqual(
        service.checkSource(
            "CHARIZARD",
            evolutionSource("LEVEL_36"),
            {}
        ),
        {
            available: true,
            source: "EVOLUTION",
            requirement: "LEVEL_36"
        }
    );
});

test("checkSource preserves the evolution requirement", () => {
    const requirement = {
        type: "LEVEL",
        level: 36
    };

    const service = createService();
    const result = service.checkSource(
        "CHARIZARD",
        evolutionSource(requirement),
        {}
    );

    assert.equal(result.requirement, requirement);
});

test("checkSource allows an evolution source without a requirement", () => {
    const service = createService();
    const result = service.checkSource(
        "CHARIZARD",
        { method: "EVOLUTION" },
        {}
    );

    assert.equal(result.available, true);
    assert.equal(result.source, "EVOLUTION");
    assert.equal(result.requirement, undefined);
});


// -----------------------------------------------
// checkSource: trade acquisition
// -----------------------------------------------

test("checkSource allows trade when allowTrade is true", () => {
    const service = createService();

    assert.deepEqual(
        service.checkSource(
            "ALAKAZAM",
            tradeSource(),
            { allowTrade: true }
        ),
        {
            available: true,
            source: "TRADE"
        }
    );
});

test("checkSource blocks trade when allowTrade is false", () => {
    const service = createService();

    assert.deepEqual(
        service.checkSource(
            "ALAKAZAM",
            tradeSource(),
            { allowTrade: false }
        ),
        {
            available: false,
            source: "TRADE",
            reason: "Requires trading."
        }
    );
});

test("checkSource blocks trade when allowTrade is missing", () => {
    const service = createService();

    assert.deepEqual(
        service.checkSource("ALAKAZAM", tradeSource(), {}),
        {
            available: false,
            source: "TRADE",
            reason: "Requires trading."
        }
    );
});

test("checkSource only allows trade when allowTrade is exactly true", () => {
    const service = createService();

    for (const value of [1, "true", "yes", null]) {
        const result = service.checkSource(
            "ALAKAZAM",
            tradeSource(),
            { allowTrade: value }
        );

        assert.equal(result.available, false);
        assert.equal(result.reason, "Requires trading.");
    }
});


// -----------------------------------------------
// checkSource: unknown acquisition methods
// -----------------------------------------------

test("checkSource blocks an unknown acquisition method", () => {
    const service = createService();

    assert.deepEqual(
        service.checkSource(
            "MEWTWO",
            { method: "GIFT" },
            {}
        ),
        {
            available: false,
            source: "GIFT",
            reason: "Unknown acquisition method."
        }
    );
});

test("checkSource returns the unknown method name as source", () => {
    const service = createService();

    const result = service.checkSource(
        "MEWTWO",
        { method: "EVENT" },
        {}
    );

    assert.equal(result.source, "EVENT");
});

test("checkSource treats lowercase method names as unknown", () => {
    const service = createService();

    const result = service.checkSource(
        "MEWTWO",
        { method: "wild", location: "ROUTE_1" },
        {}
    );

    assert.deepEqual(result, {
        available: false,
        source: "wild",
        reason: "Unknown acquisition method."
    });
});


// -----------------------------------------------
// canObtain: mixed source scenarios
// -----------------------------------------------

test("canObtain returns WILD when the wild source is the first available source", () => {
    const service = createService({
        sources: createSources([
            wildSource("ROUTE_1"),
            evolutionSource()
        ])
    });

    const result = service.canObtain("PIKACHU");

    assert.equal(result.available, true);
    assert.equal(result.source, "WILD");
    assert.equal(result.details.location, "ROUTE_1");
});

test("canObtain returns STARTER when starter selection is valid", () => {
    const service = createService({
        sources: createSources([starterSource()]),
        starterSelection: createStarterSelectionService(true)
    });

    const result = service.canObtain("BULBASAUR", {
        playerState: { starter: "BULBASAUR" }
    });

    assert.equal(result.available, true);
    assert.equal(result.source, "STARTER");
});

test("canObtain returns TRADE when trading is allowed", () => {
    const service = createService({
        sources: createSources([tradeSource()])
    });

    const result = service.canObtain("ALAKAZAM", {
        allowTrade: true
    });

    assert.equal(result.available, true);
    assert.equal(result.source, "TRADE");
});

test("canObtain returns LOCKED when every source is unavailable", () => {
    const service = createService({
        sources: createSources([
            tradeSource(),
            starterSource()
        ])
    });

    const result = service.canObtain("ALAKAZAM");

    assert.equal(result.available, false);
    assert.equal(result.status, "LOCKED");
    assert.equal(result.sources.length, 2);
});

test("canObtain does not require every acquisition method to be available", () => {
    const service = createService({
        sources: createSources([
            tradeSource(),
            evolutionSource("LEVEL_16")
        ])
    });

    const result = service.canObtain("CHARMELEON");

    assert.equal(result.available, true);
    assert.equal(result.source, "EVOLUTION");
});


// -----------------------------------------------
// explain
// -----------------------------------------------

test("explain delegates to canObtain", () => {
    const service = createService();
    let receivedSpecies;
    let receivedContext;

    service.canObtain = (species, context) => {
        receivedSpecies = species;
        receivedContext = context;
        return { available: true, status: "AVAILABLE" };
    };

    const context = { allowTrade: true };
    const result = service.explain("ALAKAZAM", context);

    assert.deepEqual(result, {
        available: true,
        status: "AVAILABLE"
    });
    assert.equal(receivedSpecies, "ALAKAZAM");
    assert.equal(receivedContext, context);
});

test("explain defaults context to an empty object", () => {
    const service = createService();
    let receivedContext;

    service.canObtain = (species, context) => {
        receivedContext = context;
        return { species };
    };

    service.explain("PIKACHU");

    assert.deepEqual(receivedContext, {});
});

test("explain returns the canObtain result unchanged", () => {
    const service = createService();
    const expected = {
        available: false,
        status: "UNKNOWN",
        species: "MISSINGNO",
        reason: "No known acquisition method."
    };

    service.canObtain = () => expected;

    assert.equal(service.explain("MISSINGNO"), expected);
});


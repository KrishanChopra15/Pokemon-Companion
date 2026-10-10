"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const LocationGraphService = require("../scripts/services/location-graph-service");

let fixtureCounter = 0;

const DEFAULT_GRAPH = {
    A: ["B", "C"],
    B: ["D"],
    C: ["E"],
    D: ["F"],
    E: [],
    F: []
};

function createFixture(t, options = {}) {
    const game =
        `__location_graph_service_test_${process.pid}_${++fixtureCounter}`;

    const directory = path.join(
        __dirname,
        "..",
        "database",
        "raw",
        game
    );

    fs.mkdirSync(directory, { recursive: true });

    if (options.writeGraph !== false) {
        const graph =
            Object.prototype.hasOwnProperty.call(options, "graph")
                ? options.graph
                : DEFAULT_GRAPH;

        fs.writeFileSync(
            path.join(directory, "location-graph.json"),
            JSON.stringify(graph),
            "utf8"
        );
    }

    t.after(() => {
        fs.rmSync(directory, {
            recursive: true,
            force: true
        });
    });

    return {
        game,
        directory,

        createService() {
            return new LocationGraphService(game);
        }
    };
}

// --------------------------------------------------
// Constructor and graph loading
// --------------------------------------------------

test("constructor creates a LocationGraphService instance", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.ok(service instanceof LocationGraphService);
});

test("constructor loads the graph from JSON", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(service.graph, DEFAULT_GRAPH);
});

test("constructor loads a custom graph", t => {
    const graph = {
        START: ["TOWN"],
        TOWN: ["FOREST"],
        FOREST: []
    };

    const fixture = createFixture(t, { graph });
    const service = fixture.createService();

    assert.deepEqual(service.graph, graph);
});

test("constructor preserves object connection records", t => {
    const graph = {
        START: [
            {
                location: "TOWN",
                requirements: ["BOULDER_BADGE"]
            }
        ]
    };

    const fixture = createFixture(t, { graph });
    const service = fixture.createService();

    assert.deepEqual(service.graph, graph);
});

test("constructor loads an empty graph", t => {
    const fixture = createFixture(t, {
        graph: {}
    });

    const service = fixture.createService();

    assert.deepEqual(service.graph, {});
});

test("constructor throws when the graph file is missing", t => {
    const fixture = createFixture(t, {
        writeGraph: false
    });

    assert.throws(
        () => fixture.createService(),
        error => error.code === "ENOENT"
    );
});

test("constructor throws when the graph JSON is malformed", t => {
    const fixture = createFixture(t);

    fs.writeFileSync(
        path.join(fixture.directory, "location-graph.json"),
        "{invalid json",
        "utf8"
    );

    assert.throws(
        () => fixture.createService(),
        SyntaxError
    );
});

test("constructor throws when the game directory does not exist", () => {
    const game =
        `__location_graph_service_missing_${process.pid}_${++fixtureCounter}`;

    assert.throws(
        () => new LocationGraphService(game),
        error => error.code === "ENOENT"
    );
});

// --------------------------------------------------
// getConnections
// --------------------------------------------------

test("getConnections returns the connections of a location", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getConnections("A"),
        ["B", "C"]
    );
});

test("getConnections returns connections in their stored order", t => {
    const fixture = createFixture(t, {
        graph: {
            START: ["C", "A", "B"]
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getConnections("START"),
        ["C", "A", "B"]
    );
});

test("getConnections returns object connections unchanged", t => {
    const connection = {
        location: "TOWN",
        requirements: ["BOULDER_BADGE"]
    };

    const fixture = createFixture(t, {
        graph: {
            START: [connection]
        }
    });

    const service = fixture.createService();
    const connections = service.getConnections("START");

    assert.deepEqual(connections, [connection]);
    assert.strictEqual(connections[0], service.graph.START[0]);
});

test("getConnections returns an empty array for a location with no connections", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getConnections("E"),
        []
    );
});

test("getConnections returns an empty array for an unknown location", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getConnections("UNKNOWN_LOCATION"),
        []
    );
});

test("getConnections returns an empty array for an empty ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getConnections(""),
        []
    );
});

test("getConnections returns an empty array for a null ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getConnections(null),
        []
    );
});

test("getConnections returns an empty array for an undefined ID", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getConnections(undefined),
        []
    );
});

test("getConnections returns an empty array when a graph entry is null", t => {
    const fixture = createFixture(t, {
        graph: {
            START: null
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getConnections("START"),
        []
    );
});

test("getConnections returns an empty array when a graph entry is false", t => {
    const fixture = createFixture(t, {
        graph: {
            START: false
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getConnections("START"),
        []
    );
});

test("getConnections returns the original stored connection array", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.strictEqual(
        service.getConnections("A"),
        service.graph.A
    );
});

// --------------------------------------------------
// getReachableLocations: basic traversal
// --------------------------------------------------

test("getReachableLocations includes the start location", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.ok(
        service.getReachableLocations("A").includes("A")
    );
});

test("getReachableLocations includes all locations in a connected graph", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A"),
        ["A", "B", "C", "D", "E", "F"]
    );
});

test("getReachableLocations follows breadth-first order", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B", "C"],
            B: ["D"],
            C: ["E"],
            D: ["F"],
            E: ["G"],
            F: [],
            G: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A"),
        ["A", "B", "C", "D", "E", "F", "G"]
    );
});

test("getReachableLocations returns only the start for an unknown starting location", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("UNKNOWN"),
        ["UNKNOWN"]
    );
});

test("getReachableLocations returns only the start for an isolated location", t => {
    const fixture = createFixture(t, {
        graph: {
            A: [],
            B: ["C"],
            C: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A"),
        ["A"]
    );
});

test("getReachableLocations returns the start for an empty graph", t => {
    const fixture = createFixture(t, {
        graph: {}
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("START"),
        ["START"]
    );
});

test("getReachableLocations handles a graph containing one location", t => {
    const fixture = createFixture(t, {
        graph: {
            ONLY: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("ONLY"),
        ["ONLY"]
    );
});

test("getReachableLocations visits every reachable location only once", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B", "C", "B"],
            B: ["D", "C"],
            C: ["D"],
            D: ["A"]
        }
    });

    const service = fixture.createService();
    const reachable = service.getReachableLocations("A");

    assert.deepEqual(reachable, ["A", "B", "C", "D"]);
    assert.equal(new Set(reachable).size, reachable.length);
});

test("getReachableLocations terminates when the graph contains a cycle", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B"],
            B: ["C"],
            C: ["A"]
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A"),
        ["A", "B", "C"]
    );
});

test("getReachableLocations handles self-connections", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["A", "B"],
            B: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A"),
        ["A", "B"]
    );
});

test("getReachableLocations does not visit disconnected locations", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B"],
            B: [],
            C: ["D"],
            D: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A"),
        ["A", "B"]
    );
});

test("getReachableLocations handles multiple routes to the same destination", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B", "C"],
            B: ["D"],
            C: ["D"],
            D: ["E"],
            E: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A"),
        ["A", "B", "C", "D", "E"]
    );
});

test("getReachableLocations does not mutate the graph", t => {
    const graph = {
        A: ["B", "C"],
        B: ["D"],
        C: [],
        D: []
    };

    const original = JSON.stringify(graph);
    const fixture = createFixture(t, { graph });
    const service = fixture.createService();

    service.getReachableLocations("A");

    assert.equal(JSON.stringify(service.graph), original);
});

test("getReachableLocations returns a new array on each call", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const first = service.getReachableLocations("A");
    const second = service.getReachableLocations("A");

    assert.notStrictEqual(first, second);
    assert.deepEqual(first, second);
});

// --------------------------------------------------
// getReachableLocations: connection formats
// --------------------------------------------------

test("getReachableLocations supports string connections", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B"],
            B: ["C"],
            C: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A"),
        ["A", "B", "C"]
    );
});

test("getReachableLocations supports object connections", t => {
    const fixture = createFixture(t, {
        graph: {
            A: [
                { location: "B" },
                { location: "C" }
            ],
            B: [{ location: "D" }],
            C: [],
            D: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A"),
        ["A", "B", "C", "D"]
    );
});

test("getReachableLocations supports mixed string and object connections", t => {
    const fixture = createFixture(t, {
        graph: {
            A: [
                "B",
                { location: "C", requirements: [] }
            ],
            B: ["D"],
            C: [{ location: "E" }],
            D: [],
            E: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A"),
        ["A", "B", "C", "D", "E"]
    );
});

test("getReachableLocations skips object connections without a destination", t => {
    const fixture = createFixture(t, {
        graph: {
            A: [
                {},
                { requirements: ["BADGE"] },
                { location: "B" }
            ],
            B: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A"),
        ["A", "B"]
    );
});

test("getReachableLocations skips connections with an empty destination", t => {
    const fixture = createFixture(t, {
        graph: {
            A: [
                { location: "" },
                { location: "B" }
            ],
            B: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A"),
        ["A", "B"]
    );
});

test("getReachableLocations uses an empty requirements array for string connections", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B"],
            B: []
        }
    });

    const service = fixture.createService();
    const calls = [];

    service.getReachableLocations("A", (requirements, connection) => {
        calls.push({ requirements, connection });
        return true;
    });

    assert.deepEqual(calls, [
        { requirements: [], connection: "B" }
    ]);
});

test("getReachableLocations passes object requirements to the callback", t => {
    const requirements = ["BOULDER_BADGE"];

    const fixture = createFixture(t, {
        graph: {
            A: [
                {
                    location: "B",
                    requirements
                }
            ],
            B: []
        }
    });

    const service = fixture.createService();
    let receivedRequirements;
    let receivedConnection;

    service.getReachableLocations("A", (givenRequirements, connection) => {
        receivedRequirements = givenRequirements;
        receivedConnection = connection;
        return true;
    });

    assert.deepEqual(receivedRequirements, requirements);
    assert.strictEqual(receivedConnection, service.graph.A[0]);
});

test("getReachableLocations defaults missing object requirements to an empty array", t => {
    const fixture = createFixture(t, {
        graph: {
            A: [{ location: "B" }],
            B: []
        }
    });

    const service = fixture.createService();
    let receivedRequirements;

    service.getReachableLocations("A", requirements => {
        receivedRequirements = requirements;
        return true;
    });

    assert.deepEqual(receivedRequirements, []);
});

test("getReachableLocations defaults null object requirements to an empty array", t => {
    const fixture = createFixture(t, {
        graph: {
            A: [{ location: "B", requirements: null }],
            B: []
        }
    });

    const service = fixture.createService();
    let receivedRequirements;

    service.getReachableLocations("A", requirements => {
        receivedRequirements = requirements;
        return true;
    });

    assert.deepEqual(receivedRequirements, []);
});

// --------------------------------------------------
// getReachableLocations: traversal callback
// --------------------------------------------------

test("getReachableLocations uses its default callback to allow traversal", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A"),
        ["A", "B", "C", "D", "E", "F"]
    );
});

test("getReachableLocations excludes a destination when traversal is denied", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    const reachable = service.getReachableLocations(
        "A",
        (requirements, connection) => connection !== "B"
    );

    assert.deepEqual(reachable, ["A", "C", "E"]);
});

test("getReachableLocations can block one route while allowing another", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B", "C"],
            B: ["D"],
            C: ["D"],
            D: ["E"],
            E: []
        }
    });

    const service = fixture.createService();

    const reachable = service.getReachableLocations(
        "A",
        (requirements, connection) => connection !== "B"
    );

    assert.deepEqual(reachable, ["A", "C", "D", "E"]);
});

test("getReachableLocations passes requirements to the traversal callback", t => {
    const requirements = ["CASCADE_BADGE"];

    const fixture = createFixture(t, {
        graph: {
            A: [
                { location: "B", requirements }
            ],
            B: []
        }
    });

    const service = fixture.createService();
    let receivedRequirements;

    const reachable = service.getReachableLocations(
        "A",
        givenRequirements => {
            receivedRequirements = givenRequirements;
            return true;
        }
    );

    assert.deepEqual(reachable, ["A", "B"]);
    assert.deepEqual(receivedRequirements, requirements);
});

test("getReachableLocations passes the full connection to the callback", t => {
    const connection = {
        location: "B",
        requirements: ["BICYCLE"],
        metadata: { route: "north" }
    };

    const fixture = createFixture(t, {
        graph: {
            A: [connection],
            B: []
        }
    });

    const service = fixture.createService();
    let receivedConnection;

    service.getReachableLocations("A", (requirements, givenConnection) => {
        receivedConnection = givenConnection;
        return true;
    });

    assert.strictEqual(receivedConnection, service.graph.A[0]);
});

test("getReachableLocations does not call the callback for a visited destination", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B", "B"],
            B: []
        }
    });

    const service = fixture.createService();
    const calls = [];

    service.getReachableLocations("A", (requirements, connection) => {
        calls.push(connection);
        return true;
    });

    assert.deepEqual(calls, ["B", "B"]);
});

test("getReachableLocations does not call the callback for an invalid destination", t => {
    const fixture = createFixture(t, {
        graph: {
            A: [
                {},
                { location: "" },
                { location: "B" }
            ],
            B: []
        }
    });

    const service = fixture.createService();
    const calls = [];

    service.getReachableLocations("A", (requirements, connection) => {
        calls.push(connection);
        return true;
    });

    assert.equal(calls.length, 1);
    assert.strictEqual(calls[0], service.graph.A[2]);
});

test("getReachableLocations does not traverse outgoing edges of a blocked location", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B"],
            B: ["C"],
            C: []
        }
    });

    const service = fixture.createService();

    const reachable = service.getReachableLocations(
        "A",
        (requirements, connection) => connection !== "B"
    );

    assert.deepEqual(reachable, ["A"]);
});

test("getReachableLocations allows a path when the callback returns a truthy value", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B"],
            B: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A", () => "allowed"),
        ["A", "B"]
    );
});

test("getReachableLocations blocks a path when the callback returns a falsey value", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B"],
            B: []
        }
    });

    const service = fixture.createService();

    assert.deepEqual(
        service.getReachableLocations("A", () => 0),
        ["A"]
    );
});

// --------------------------------------------------
// isReachable
// --------------------------------------------------

test("isReachable returns true for a direct connection", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(service.isReachable("A", "B"), true);
});

test("isReachable returns true for an indirect connection", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(service.isReachable("A", "F"), true);
});

test("isReachable returns false for a disconnected location", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B"],
            B: [],
            C: []
        }
    });

    const service = fixture.createService();

    assert.equal(service.isReachable("A", "C"), false);
});

test("isReachable returns true when the start and target are the same", t => {
    const fixture = createFixture(t, {
        graph: {
            A: []
        }
    });

    const service = fixture.createService();

    assert.equal(service.isReachable("A", "A"), true);
});

test("isReachable returns true when an unknown start equals the target", t => {
    const fixture = createFixture(t, {
        graph: {}
    });

    const service = fixture.createService();

    assert.equal(
        service.isReachable("UNKNOWN", "UNKNOWN"),
        true
    );
});

test("isReachable returns false when the target does not exist in the reachable graph", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.isReachable("A", "UNKNOWN"),
        false
    );
});

test("isReachable respects a traversal callback that blocks a direct connection", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(
        service.isReachable(
            "A",
            "B",
            (requirements, connection) => connection !== "B"
        ),
        false
    );
});

test("isReachable can find a destination through an alternate allowed path", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B", "C"],
            B: ["D"],
            C: ["D"],
            D: []
        }
    });

    const service = fixture.createService();

    assert.equal(
        service.isReachable(
            "A",
            "D",
            (requirements, connection) => connection !== "B"
        ),
        true
    );
});

test("isReachable passes the callback through to getReachableLocations", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B"],
            B: []
        }
    });

    const service = fixture.createService();
    const received = [];

    const result = service.isReachable(
        "A",
        "B",
        (requirements, connection) => {
            received.push(connection);
            return true;
        }
    );

    assert.equal(result, true);
    assert.deepEqual(received, ["B"]);
});

test("isReachable respects object connection requirements through the callback", t => {
    const fixture = createFixture(t, {
        graph: {
            A: [
                {
                    location: "B",
                    requirements: ["BOULDER_BADGE"]
                }
            ],
            B: []
        }
    });

    const service = fixture.createService();

    assert.equal(
        service.isReachable(
            "A",
            "B",
            requirements => requirements.includes("BOULDER_BADGE")
        ),
        true
    );

    assert.equal(
        service.isReachable(
            "A",
            "B",
            requirements => requirements.length === 0
        ),
        false
    );
});

test("isReachable uses the default callback when none is supplied", t => {
    const fixture = createFixture(t);
    const service = fixture.createService();

    assert.equal(service.isReachable("A", "F"), true);
});

test("isReachable returns false when a blocked path has no alternative", t => {
    const fixture = createFixture(t, {
        graph: {
            A: ["B"],
            B: ["C"],
            C: []
        }
    });

    const service = fixture.createService();

    assert.equal(
        service.isReachable(
            "A",
            "C",
            (requirements, connection) => connection !== "B"
        ),
        false
    );
});

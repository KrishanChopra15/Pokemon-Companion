"use strict";

const test = require("node:test");
const after = test.after;
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const DialogueService = require(
    "../scripts/services/dialogue-service"
);

const TEST_GAME = `__dialogue_service_test_${process.pid}`;
const RAW_DIR = path.resolve(__dirname, "../database/raw");

const DIALOGUES = {
    INTRO: {
        id: "intro",
        text: "Welcome to Pallet Town.",
        speaker: "PROFESSOR"
    },
    ROUTE_1: {
        id: "route_1",
        text: "Watch out for tall grass.",
        speaker: "GUIDE"
    },
    GYM_TIP: {
        id: "gym_tip",
        text: "Train your Pokémon before entering.",
        speaker: "NPC"
    },
    INTRO_ALT: {
        id: "intro_alternate",
        text: "Another introduction.",
        speaker: "NPC"
    }
};

const TEST_DIR = path.join(RAW_DIR, TEST_GAME);
const TEST_FILE = path.join(TEST_DIR, "dialogues.json");

function writeFixture(game, data) {
    const directory = path.join(RAW_DIR, game);
    const file = path.join(directory, "dialogues.json");

    fs.mkdirSync(directory, { recursive: true });

    fs.writeFileSync(
        file,
        typeof data === "string"
            ? data
            : JSON.stringify(data, null, 2),
        "utf8"
    );

    return { directory, file };
}

function removeFixture(game) {
    fs.rmSync(
        path.join(RAW_DIR, game),
        {
            recursive: true,
            force: true
        }
    );
}

function createService(game = TEST_GAME) {
    return new DialogueService(game);
}

writeFixture(TEST_GAME, DIALOGUES);

after(() => {
    removeFixture(TEST_GAME);
});

// --------------------------------------------------
// Constructor and database loading
// --------------------------------------------------

test("constructor creates a DialogueService instance", () => {
    assert.ok(createService() instanceof DialogueService);
});

test("constructor loads the dialogue database", () => {
    const service = createService();

    assert.deepEqual(service.dialogues, DIALOGUES);
});

test("constructor loads all dialogue records", () => {
    const service = createService();

    assert.equal(
        Object.keys(service.dialogues).length,
        Object.keys(DIALOGUES).length
    );
});

test("constructor preserves dialogue IDs and text", () => {
    const service = createService();

    assert.equal(service.dialogues.INTRO.id, "intro");
    assert.equal(
        service.dialogues.INTRO.text,
        "Welcome to Pallet Town."
    );
});

test("constructor preserves additional dialogue properties", () => {
    const service = createService();

    assert.equal(
        service.dialogues.INTRO.speaker,
        "PROFESSOR"
    );
});

test("constructor loads data from the requested game directory", () => {
    const game = `${TEST_GAME}_alternate`;

    try {
        writeFixture(game, {
            UNIQUE: {
                id: "unique",
                text: "Game-specific dialogue."
            }
        });

        const service = createService(game);

        assert.deepEqual(service.dialogues, {
            UNIQUE: {
                id: "unique",
                text: "Game-specific dialogue."
            }
        });
    } finally {
        removeFixture(game);
    }
});

test("constructor parses JSON from the dialogue file", () => {
    const game = `${TEST_GAME}_json`;

    try {
        writeFixture(game, '{"HELLO":{"id":"hello","text":"Hi"}}');

        const service = createService(game);

        assert.deepEqual(service.dialogues, {
            HELLO: {
                id: "hello",
                text: "Hi"
            }
        });
    } finally {
        removeFixture(game);
    }
});

test("constructor throws when the dialogue file does not exist", () => {
    assert.throws(
        () => createService(`${TEST_GAME}_missing`),
        error => error.code === "ENOENT"
    );
});

test("constructor throws when the dialogue file contains invalid JSON", () => {
    const game = `${TEST_GAME}_invalid_json`;

    try {
        writeFixture(game, "{ invalid JSON");

        assert.throws(
            () => createService(game),
            SyntaxError
        );
    } finally {
        removeFixture(game);
    }
});

test("constructor loads an empty dialogue object", () => {
    const game = `${TEST_GAME}_empty`;

    try {
        writeFixture(game, {});

        assert.deepEqual(createService(game).dialogues, {});
    } finally {
        removeFixture(game);
    }
});

test("constructor preserves dialogue database keys", () => {
    const service = createService();

    assert.deepEqual(
        Object.keys(service.dialogues),
        ["INTRO", "ROUTE_1", "GYM_TIP", "INTRO_ALT"]
    );
});

// --------------------------------------------------
// getDialogue()
// --------------------------------------------------

test("getDialogue retrieves a dialogue by its database key", () => {
    const service = createService();

    assert.deepEqual(
        service.getDialogue("INTRO"),
        DIALOGUES.INTRO
    );
});

test("getDialogue returns the requested dialogue text", () => {
    const service = createService();

    assert.equal(
        service.getDialogue("ROUTE_1").text,
        "Watch out for tall grass."
    );
});

test("getDialogue returns the requested speaker", () => {
    const service = createService();

    assert.equal(
        service.getDialogue("INTRO").speaker,
        "PROFESSOR"
    );
});

test("getDialogue returns the original dialogue object", () => {
    const service = createService();

    assert.strictEqual(
        service.getDialogue("INTRO"),
        service.dialogues.INTRO
    );
});

test("getDialogue returns null for an unknown ID", () => {
    const service = createService();

    assert.equal(service.getDialogue("UNKNOWN"), null);
});

test("getDialogue returns null for an empty ID", () => {
    const service = createService();

    assert.equal(service.getDialogue(""), null);
});

test("getDialogue returns null for a null ID", () => {
    const service = createService();

    assert.equal(service.getDialogue(null), null);
});

test("getDialogue returns null for an undefined ID", () => {
    const service = createService();

    assert.equal(service.getDialogue(undefined), null);
});

test("getDialogue uses exact database-key matching", () => {
    const service = createService();

    assert.equal(service.getDialogue("intro"), null);
    assert.deepEqual(
        service.getDialogue("INTRO"),
        DIALOGUES.INTRO
    );
});

test("getDialogue does not search by the dialogue's internal ID", () => {
    const service = createService();

    assert.equal(service.getDialogue("intro"), null);
    assert.deepEqual(
        service.getDialogue("INTRO"),
        DIALOGUES.INTRO
    );
});

test("getDialogue supports numeric keys converted to strings by JavaScript", () => {
    const game = `${TEST_GAME}_numeric_key`;

    try {
        writeFixture(game, {
            "123": {
                id: "numeric_dialogue",
                text: "Numeric-key dialogue."
            }
        });

        const service = createService(game);

        assert.deepEqual(
            service.getDialogue(123),
            {
                id: "numeric_dialogue",
                text: "Numeric-key dialogue."
            }
        );
    } finally {
        removeFixture(game);
    }
});

test("getDialogue returns null for a stored falsy dialogue value", () => {
    const game = `${TEST_GAME}_falsy`;

    try {
        writeFixture(game, {
            EMPTY: null
        });

        assert.equal(createService(game).getDialogue("EMPTY"), null);
    } finally {
        removeFixture(game);
    }
});

// --------------------------------------------------
// search()
// --------------------------------------------------

test("search returns an array", () => {
    const service = createService();

    assert.ok(Array.isArray(service.search("intro")));
});

test("search finds a dialogue by ID fragment", () => {
    const service = createService();

    assert.deepEqual(
        service.search("route"),
        [DIALOGUES.ROUTE_1]
    );
});

test("search finds a complete dialogue ID", () => {
    const service = createService();

    assert.deepEqual(
        service.search("gym_tip"),
        [DIALOGUES.GYM_TIP]
    );
});

test("search is case-insensitive for the query", () => {
    const service = createService();

    assert.deepEqual(
        service.search("INTRO"),
        service.search("intro")
    );
});

test("search is case-insensitive for stored dialogue IDs", () => {
    const game = `${TEST_GAME}_mixed_case`;

    try {
        const entries = {
            FIRST: {
                id: "IntroScene",
                text: "Mixed-case identifier."
            }
        };

        writeFixture(game, entries);

        const service = createService(game);

        assert.deepEqual(
            service.search("INTROSCENE"),
            [entries.FIRST]
        );
    } finally {
        removeFixture(game);
    }
});

test("search returns all matching dialogue IDs", () => {
    const service = createService();

    assert.deepEqual(
        service.search("intro"),
        [
            DIALOGUES.INTRO,
            DIALOGUES.INTRO_ALT
        ]
    );
});

test("search returns matching dialogues in database order", () => {
    const service = createService();

    assert.deepEqual(
        service.search("intro").map(dialogue => dialogue.id),
        ["intro", "intro_alternate"]
    );
});

test("search returns an empty array when no ID matches", () => {
    const service = createService();

    assert.deepEqual(service.search("nonexistent"), []);
});

test("search with an empty query returns all dialogues with IDs", () => {
    const service = createService();

    assert.deepEqual(
        service.search(""),
        Object.values(DIALOGUES)
    );
});

test("search returns the original dialogue objects", () => {
    const service = createService();

    const results = service.search("route");

    assert.strictEqual(results[0], service.dialogues.ROUTE_1);
});

test("search does not mutate the dialogue database", () => {
    const service = createService();
    const original = structuredClone(service.dialogues);

    service.search("intro");

    assert.deepEqual(service.dialogues, original);
});

test("search matches IDs rather than dialogue text", () => {
    const service = createService();

    assert.deepEqual(
        service.search("grass"),
        []
    );
});

test("search does not match the speaker field", () => {
    const service = createService();

    assert.deepEqual(
        service.search("professor"),
        []
    );
});

test("search does not match text when the ID is unrelated", () => {
    const service = createService();

    const results = service.search("welcome");

    assert.deepEqual(results, []);
});

test("search handles dialogue IDs containing underscores", () => {
    const service = createService();

    assert.deepEqual(
        service.search("route_1"),
        [DIALOGUES.ROUTE_1]
    );
});

test("search requires a string query", () => {
    const service = createService();

    assert.throws(
        () => service.search(null),
        TypeError
    );

    assert.throws(
        () => service.search(undefined),
        TypeError
    );
});

test("search throws when a dialogue has no ID", () => {
    const game = `${TEST_GAME}_missing_id`;

    try {
        writeFixture(game, {
            INVALID: {
                text: "This dialogue has no ID."
            }
        });

        const service = createService(game);

        assert.throws(
            () => service.search("anything"),
            TypeError
        );
    } finally {
        removeFixture(game);
    }
});

test("search with an empty query still requires valid dialogue IDs", () => {
    const game = `${TEST_GAME}_empty_query_invalid`;

    try {
        writeFixture(game, {
            INVALID: {
                text: "Missing an ID."
            }
        });

        const service = createService(game);

        assert.throws(
            () => service.search(""),
            TypeError
        );
    } finally {
        removeFixture(game);
    }
});

// --------------------------------------------------
// getAll()
// --------------------------------------------------

test("getAll returns the entire dialogue database", () => {
    const service = createService();

    assert.deepEqual(service.getAll(), DIALOGUES);
});

test("getAll returns the original database object", () => {
    const service = createService();

    assert.strictEqual(service.getAll(), service.dialogues);
});

test("getAll returns the same object on repeated calls", () => {
    const service = createService();

    assert.strictEqual(
        service.getAll(),
        service.getAll()
    );
});

test("getAll preserves all dialogue keys", () => {
    const service = createService();

    assert.deepEqual(
        Object.keys(service.getAll()),
        ["INTRO", "ROUTE_1", "GYM_TIP", "INTRO_ALT"]
    );
});

test("getAll allows callers to access nested dialogue fields", () => {
    const service = createService();

    assert.equal(
        service.getAll().GYM_TIP.text,
        "Train your Pokémon before entering."
    );
});

test("getAll returns an empty object for an empty database", () => {
    const game = `${TEST_GAME}_empty_get_all`;

    try {
        writeFixture(game, {});

        assert.deepEqual(createService(game).getAll(), {});
    } finally {
        removeFixture(game);
    }
});

// --------------------------------------------------
// Cross-method behavior
// --------------------------------------------------

test("getDialogue returns a dialogue that search can also find", () => {
    const service = createService();
    const direct = service.getDialogue("GYM_TIP");
    const searched = service.search("gym_tip");

    assert.ok(searched.includes(direct));
});

test("search results reference objects contained in getAll", () => {
    const service = createService();
    const all = service.getAll();
    const results = service.search("intro");

    for (const result of results) {
        assert.ok(Object.values(all).includes(result));
    }
});

test("getAll reflects mutations to the returned database object", () => {
    const service = createService();

    service.getAll().EXTRA = {
        id: "extra",
        text: "Added dialogue."
    };

    assert.deepEqual(
        service.getDialogue("EXTRA"),
        {
            id: "extra",
            text: "Added dialogue."
        }
    );

    assert.deepEqual(
        service.search("extra"),
        [
            {
                id: "extra",
                text: "Added dialogue."
            }
        ]
    );
});

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const TrainerDatabaseService = require("../scripts/services/trainer-database-service");

let fixtureCounter = 0;

function uniqueGame() {
    fixtureCounter++;

    return `test-trainer-db-${process.pid}-${Date.now()}-${fixtureCounter}`;
}

function createFixture(t, content, options = {}) {
    const game = uniqueGame();
    const directory = path.join(
        process.cwd(),
        "database",
        "generated",
        game
    );

    const filePath = path.join(directory, "full-trainers.json");

    fs.mkdirSync(directory, { recursive: true });

    if (options.write !== false) {
        const serialized = typeof content === "string"
            ? content
            : JSON.stringify(content);

        fs.writeFileSync(filePath, serialized, "utf8");
    }

    t.after(() => {
        fs.rmSync(directory, { recursive: true, force: true });
    });

    return { game, directory, filePath };
}

function withWarningsSuppressed(callback) {
    const originalWarn = console.warn;
    console.warn = () => {};

    try {
        return callback();
    } finally {
        console.warn = originalWarn;
    }
}

function createService(trainers = {}) {
    return withWarningsSuppressed(() => {
        const service = new TrainerDatabaseService(uniqueGame());
        service.trainers = trainers;
        return service;
    });
}

function trainer(overrides = {}) {
    return {
        id: "TRAINER_1",
        trainerName: "Youngster Ben",
        trainerType: "YOUNGSTER",
        party: {
            pokemon: [
                { species: "RATTATA", level: 8 },
                { species: "PIDGEY", level: 9 }
            ]
        },
        ...overrides
    };
}

function createTrainerMap() {
    return {
        TRAINER_1: trainer(),
        TRAINER_2: trainer({
            id: "TRAINER_2",
            trainerName: "Lass Alice",
            trainerType: "LASS"
        }),
        TRAINER_3: trainer({
            id: "TRAINER_3",
            trainerName: "Leader Brock",
            trainerType: "GYM_LEADER"
        }),
        TRAINER_4: trainer({
            id: "TRAINER_4",
            trainerName: "Elite Lorelei",
            trainerType: "ELITE_FOUR"
        }),
        TRAINER_5: trainer({
            id: "TRAINER_5",
            trainerName: "Champion Blue",
            trainerType: "CHAMPION"
        }),
        TRAINER_6: trainer({
            id: "TRAINER_6",
            trainerName: "Rocket Grunt",
            trainerType: "VILLAIN_TEAM"
        })
    };
}

// --------------------------------------------------
// Constructor
// --------------------------------------------------

test("constructor creates a TrainerDatabaseService instance", () => {
    const service = createService();

    assert.ok(service instanceof TrainerDatabaseService);
});

test("constructor defaults the game to firered", () => {
    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService()
    );

    assert.equal(service.game, "firered");
});

test("constructor stores the selected game", () => {
    const game = uniqueGame();
    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(game)
    );

    assert.equal(service.game, game);
});

test("constructor loads the database into trainers", t => {
    const fixture = createFixture(t, {
        TRAINER_1: trainer()
    });

    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    assert.deepEqual(service.trainers, {
        TRAINER_1: trainer()
    });
});

test("constructor loads the requested game's database", t => {
    const fixture = createFixture(t, {
        GAME_SPECIFIC_TRAINER: trainer({
            id: "GAME_SPECIFIC_TRAINER"
        })
    });

    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    assert.ok(service.hasTrainer("GAME_SPECIFIC_TRAINER"));
});

test("constructor preserves the loaded trainer records", t => {
    const record = trainer({
        party: {
            pokemon: [
                {
                    species: "PIKACHU",
                    level: 20,
                    moves: ["THUNDERBOLT"]
                }
            ]
        }
    });

    const fixture = createFixture(t, {
        TRAINER_1: record
    });

    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    assert.deepEqual(service.getTrainer("TRAINER_1"), record);
});

// --------------------------------------------------
// loadDatabase
// --------------------------------------------------

test("loadDatabase reads the full-trainers JSON file", t => {
    const data = {
        TRAINER_1: trainer()
    };

    const fixture = createFixture(t, data);
    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    assert.deepEqual(service.trainers, data);
});

test("loadDatabase unwraps the generated trainers wrapper", t => {
    const data = {
        metadata: { game: "firered" },
        trainers: {
            TRAINER_1: trainer(),
            TRAINER_2: trainer({ id: "TRAINER_2" })
        }
    };

    const fixture = createFixture(t, data);
    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    assert.deepEqual(service.trainers, data.trainers);
    assert.equal(service.trainers.metadata, undefined);
});

test("loadDatabase supports an empty trainers wrapper", t => {
    const fixture = createFixture(t, {
        trainers: {}
    });

    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    assert.deepEqual(service.trainers, {});
});

test("loadDatabase returns the unwrapped database when trainers is absent", t => {
    const data = {
        TRAINER_1: trainer(),
        metadata: { game: "firered" }
    };

    const fixture = createFixture(t, data);
    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    assert.deepEqual(service.trainers, data);
});

test("loadDatabase returns the original data when trainers is null", t => {
    const data = {
        trainers: null,
        TRAINER_1: trainer()
    };

    const fixture = createFixture(t, data);
    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    assert.deepEqual(service.trainers, data);
});

test("loadDatabase returns an empty object when the file is missing", t => {
    const fixture = createFixture(t, undefined, { write: false });
    const originalWarn = console.warn;
    const warnings = [];

    let service;

    console.warn = (...args) => warnings.push(args);

    try {
        service = new TrainerDatabaseService(fixture.game);
    } finally {
        console.warn = originalWarn;
    }

    assert.deepEqual(service.trainers, {});
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0][0], "Trainer database not found:");
    assert.equal(warnings[0][1], fixture.filePath);
});

test("loadDatabase throws when JSON is malformed", t => {
    const fixture = createFixture(t, "{invalid json");

    assert.throws(
        () => withWarningsSuppressed(
            () => new TrainerDatabaseService(fixture.game)
        ),
        SyntaxError
    );
});

test("loadDatabase throws when a valid JSON value is null", t => {
    const fixture = createFixture(t, "null");

    assert.throws(
        () => withWarningsSuppressed(
            () => new TrainerDatabaseService(fixture.game)
        ),
        TypeError
    );
});

test("loadDatabase does not change the file contents", t => {
    const data = { TRAINER_1: trainer() };
    const fixture = createFixture(t, data);
    const original = fs.readFileSync(fixture.filePath, "utf8");

    withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    assert.equal(fs.readFileSync(fixture.filePath, "utf8"), original);
});

// --------------------------------------------------
// getTrainer
// --------------------------------------------------

test("getTrainer returns a trainer by direct ID lookup", () => {
    const trainers = createTrainerMap();
    const service = createService(trainers);

    assert.strictEqual(service.getTrainer("TRAINER_1"), trainers.TRAINER_1);
});

test("getTrainer returns the original trainer object", () => {
    const trainers = createTrainerMap();
    const service = createService(trainers);

    assert.strictEqual(service.getTrainer("TRAINER_3"), trainers.TRAINER_3);
});

test("getTrainer returns null for an unknown ID", () => {
    assert.equal(createService({}).getTrainer("UNKNOWN"), null);
});

test("getTrainer returns null for an empty ID", () => {
    assert.equal(createService().getTrainer(""), null);
});

test("getTrainer returns null for a null ID", () => {
    assert.equal(createService().getTrainer(null), null);
});

test("getTrainer returns null for an undefined ID", () => {
    assert.equal(createService().getTrainer(undefined), null);
});

test("getTrainer returns null for a false ID", () => {
    assert.equal(createService().getTrainer(false), null);
});

test("getTrainer returns null for numeric zero", () => {
    assert.equal(createService().getTrainer(0), null);
});

test("getTrainer supports case-insensitive ID search", () => {
    const record = trainer({ id: "BROCK_TRAINER" });
    const service = createService({ key: record });

    assert.strictEqual(service.getTrainer("brock_trainer"), record);
});

test("getTrainer supports trainerName search", () => {
    const record = trainer({ trainerName: "Leader Brock" });
    const service = createService({ key: record });

    assert.strictEqual(service.getTrainer("Leader Brock"), record);
});

test("getTrainer supports case-insensitive trainerName search", () => {
    const record = trainer({ trainerName: "Leader Brock" });
    const service = createService({ key: record });

    assert.strictEqual(service.getTrainer("leader brock"), record);
});

test("getTrainer supports name search", () => {
    const record = {
        id: "CUSTOM_ID",
        name: "Gym Leader Brock"
    };

    const service = createService({ key: record });

    assert.strictEqual(service.getTrainer("Gym Leader Brock"), record);
});

test("getTrainer supports case-insensitive name search", () => {
    const record = {
        id: "CUSTOM_ID",
        name: "Gym Leader Brock"
    };

    const service = createService({ key: record });

    assert.strictEqual(service.getTrainer("GYM LEADER BROCK"), record);
});

test("getTrainer converts numeric search IDs to strings", () => {
    const record = trainer({ id: "123" });
    const service = createService({ key: record });

    assert.strictEqual(service.getTrainer(123), record);
});

test("getTrainer prioritizes direct lookup", () => {
    const direct = trainer({ id: "DIRECT" });
    const other = trainer({ id: "OTHER", trainerName: "DIRECT" });

    const service = createService({
        DIRECT: direct,
        OTHER: other
    });

    assert.strictEqual(service.getTrainer("DIRECT"), direct);
});

test("getTrainer falls back to searching if direct lookup misses", () => {
    const record = trainer({ id: "TRAINER_9" });
    const service = createService({ otherKey: record });

    assert.strictEqual(service.getTrainer("TRAINER_9"), record);
});

test("getTrainer ignores falsy direct lookup entries", () => {
    const record = trainer({ id: "VALID_TRAINER" });

    const service = createService({
        VALID_TRAINER: null,
        otherKey: record
    });

    assert.strictEqual(service.getTrainer("VALID_TRAINER"), record);
});

test("getTrainer handles a record without trainerName", () => {
    const record = { id: "NO_NAME" };
    const service = createService({ NO_NAME: record });

    assert.strictEqual(service.getTrainer("NO_NAME"), record);
});

test("getTrainer handles a record without an ID or name match", () => {
    const record = { trainerType: "YOUNGSTER" };
    const service = createService({ key: record });

    assert.equal(service.getTrainer("UNKNOWN"), null);
});

test("getTrainer ignores null and primitive records during search", () => {
    const record = trainer({ id: "VALID" });
    const service = createService({
        NULL_RECORD: null,
        STRING_RECORD: "invalid",
        NUMBER_RECORD: 123,
        VALID: record
    });

    assert.strictEqual(service.getTrainer("VALID"), record);
    assert.equal(service.getTrainer("UNKNOWN"), null);
});

// --------------------------------------------------
// hasTrainer
// --------------------------------------------------

test("hasTrainer returns true when a trainer exists", () => {
    assert.equal(
        createService(createTrainerMap()).hasTrainer("TRAINER_1"),
        true
    );
});

test("hasTrainer returns false for an unknown trainer", () => {
    assert.equal(createService().hasTrainer("UNKNOWN"), false);
});

test("hasTrainer supports case-insensitive trainer search", () => {
    assert.equal(
        createService({
            key: trainer({ id: "BROCK_TRAINER" })
        }).hasTrainer("brock_trainer"),
        true
    );
});

test("hasTrainer returns false for a missing ID", () => {
    const service = createService();

    assert.equal(service.hasTrainer(""), false);
    assert.equal(service.hasTrainer(null), false);
    assert.equal(service.hasTrainer(undefined), false);
});

test("hasTrainer returns a boolean", () => {
    const service = createService(createTrainerMap());

    assert.equal(typeof service.hasTrainer("TRAINER_1"), "boolean");
    assert.equal(typeof service.hasTrainer("UNKNOWN"), "boolean");
});

// --------------------------------------------------
// getAllTrainers
// --------------------------------------------------

test("getAllTrainers returns all object-valued trainer records", () => {
    const trainers = createTrainerMap();
    const service = createService(trainers);

    assert.deepEqual(
        service.getAllTrainers(),
        Object.values(trainers)
    );
});

test("getAllTrainers excludes null records", () => {
    const service = createService({
        A: trainer({ id: "A" }),
        B: null
    });

    assert.deepEqual(
        service.getAllTrainers().map(item => item.id),
        ["A"]
    );
});

test("getAllTrainers excludes primitive records", () => {
    const service = createService({
        A: trainer({ id: "A" }),
        B: "invalid",
        C: 123,
        D: false
    });

    assert.deepEqual(
        service.getAllTrainers().map(item => item.id),
        ["A"]
    );
});

test("getAllTrainers returns an empty array for an empty database", () => {
    assert.deepEqual(createService({}).getAllTrainers(), []);
});

test("getAllTrainers preserves database insertion order", () => {
    const service = createService({
        C: trainer({ id: "C" }),
        A: trainer({ id: "A" }),
        B: trainer({ id: "B" })
    });

    assert.deepEqual(
        service.getAllTrainers().map(item => item.id),
        ["C", "A", "B"]
    );
});

test("getAllTrainers returns a new array each time", () => {
    const service = createService(createTrainerMap());

    assert.notStrictEqual(
        service.getAllTrainers(),
        service.getAllTrainers()
    );
});

test("getAllTrainers preserves original trainer object references", () => {
    const record = trainer();
    const service = createService({ TRAINER_1: record });

    assert.strictEqual(service.getAllTrainers()[0], record);
});

// --------------------------------------------------
// getParty
// --------------------------------------------------

test("getParty returns the party for a known trainer", () => {
    const record = trainer();
    const service = createService({ TRAINER_1: record });

    assert.strictEqual(
        service.getParty("TRAINER_1"),
        record.party
    );
});

test("getParty returns an empty array for an unknown trainer", () => {
    assert.deepEqual(createService().getParty("UNKNOWN"), []);
});

test("getParty returns an empty array when the party is missing", () => {
    const service = createService({
        TRAINER_1: trainer({ party: undefined })
    });

    assert.deepEqual(service.getParty("TRAINER_1"), []);
});

test("getParty returns an empty array when the party is null", () => {
    const service = createService({
        TRAINER_1: trainer({ party: null })
    });

    assert.deepEqual(service.getParty("TRAINER_1"), []);
});

test("getParty returns an empty array when the party is false", () => {
    const service = createService({
        TRAINER_1: trainer({ party: false })
    });

    assert.deepEqual(service.getParty("TRAINER_1"), []);
});

test("getParty returns the underlying party object when present", () => {
    const party = {
        pokemon: [
            { species: "PIKACHU", level: 20 }
        ]
    };

    const service = createService({
        TRAINER_1: trainer({ party })
    });

    assert.strictEqual(service.getParty("TRAINER_1"), party);
});

test("getParty supports case-insensitive trainer IDs", () => {
    const record = trainer({ id: "TRAINER_ABC" });
    const service = createService({ key: record });

    assert.strictEqual(service.getParty("trainer_abc"), record.party);
});

// --------------------------------------------------
// getByType
// --------------------------------------------------

test("getByType returns trainers matching trainerType", () => {
    const service = createService(createTrainerMap());

    assert.deepEqual(
        service.getByType("GYM_LEADER").map(item => item.id),
        ["TRAINER_3"]
    );
});

test("getByType returns trainers matching the type alias", () => {
    const record = {
        id: "ALIAS_TRAINER",
        type: "GYM_LEADER"
    };

    const service = createService({ ALIAS_TRAINER: record });

    assert.deepEqual(
        service.getByType("GYM_LEADER"),
        [record]
    );
});

test("getByType compares types case-insensitively", () => {
    const service = createService(createTrainerMap());

    assert.deepEqual(
        service.getByType("gym_leader").map(item => item.id),
        ["TRAINER_3"]
    );
});

test("getByType returns an empty array for a missing type", () => {
    const service = createService(createTrainerMap());

    assert.deepEqual(service.getByType(""), []);
    assert.deepEqual(service.getByType(null), []);
    assert.deepEqual(service.getByType(undefined), []);
});

test("getByType returns an empty array when no trainers match", () => {
    assert.deepEqual(
        createService(createTrainerMap()).getByType("POKEMON_RANGER"),
        []
    );
});

test("getByType supports both trainerType and type fields", () => {
    const first = trainer({
        id: "FIRST",
        trainerType: "BUG_CATCHER"
    });

    const second = {
        id: "SECOND",
        type: "BUG_CATCHER"
    };

    const service = createService({
        FIRST: first,
        SECOND: second,
        THIRD: trainer({
            id: "THIRD",
            trainerType: "YOUNGSTER"
        })
    });

    assert.deepEqual(
        service.getByType("BUG_CATCHER"),
        [first, second]
    );
});

test("getByType does not return the same record twice", () => {
    const record = trainer({
        id: "BOTH_FIELDS",
        trainerType: "GYM_LEADER",
        type: "GYM_LEADER"
    });

    const service = createService({ BOTH_FIELDS: record });

    assert.deepEqual(
        service.getByType("GYM_LEADER"),
        [record]
    );
});

test("getByType ignores null and primitive entries", () => {
    const valid = trainer({
        id: "VALID",
        trainerType: "GYM_LEADER"
    });

    const service = createService({
        VALID: valid,
        NULL_RECORD: null,
        STRING_RECORD: "GYM_LEADER",
        NUMBER_RECORD: 123
    });

    assert.deepEqual(service.getByType("GYM_LEADER"), [valid]);
});

test("getByType returns records in database order", () => {
    const service = createService({
        A: trainer({ id: "A", trainerType: "LASS" }),
        B: trainer({ id: "B", trainerType: "LASS" }),
        C: trainer({ id: "C", trainerType: "LASS" })
    });

    assert.deepEqual(
        service.getByType("LASS").map(item => item.id),
        ["A", "B", "C"]
    );
});

// --------------------------------------------------
// Convenience category methods
// --------------------------------------------------

test("getGymLeaders returns gym leaders", () => {
    const service = createService(createTrainerMap());

    assert.deepEqual(
        service.getGymLeaders().map(item => item.id),
        ["TRAINER_3"]
    );
});

test("getEliteFour returns Elite Four trainers", () => {
    const service = createService(createTrainerMap());

    assert.deepEqual(
        service.getEliteFour().map(item => item.id),
        ["TRAINER_4"]
    );
});

test("getChampions returns champions", () => {
    const service = createService(createTrainerMap());

    assert.deepEqual(
        service.getChampions().map(item => item.id),
        ["TRAINER_5"]
    );
});

test("getVillainTeam returns villain team trainers", () => {
    const service = createService(createTrainerMap());

    assert.deepEqual(
        service.getVillainTeam().map(item => item.id),
        ["TRAINER_6"]
    );
});

test("getGymLeaders returns an empty array when none exist", () => {
    assert.deepEqual(
        createService({
            A: trainer({ trainerType: "YOUNGSTER" })
        }).getGymLeaders(),
        []
    );
});

test("getEliteFour supports the type alias", () => {
    const record = {
        id: "ELITE_ALIAS",
        type: "ELITE_FOUR"
    };

    assert.deepEqual(
        createService({ ELITE_ALIAS: record }).getEliteFour(),
        [record]
    );
});

test("category methods do not modify the trainer database", () => {
    const trainers = createTrainerMap();
    const service = createService(trainers);
    const original = { ...trainers };

    service.getGymLeaders();
    service.getEliteFour();
    service.getChampions();
    service.getVillainTeam();

    assert.deepEqual(service.trainers, original);
});

// --------------------------------------------------
// reload
// --------------------------------------------------

test("reload returns the newly loaded database", t => {
    const fixture = createFixture(t, {
        FIRST: trainer({ id: "FIRST" })
    });

    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    fs.writeFileSync(
        fixture.filePath,
        JSON.stringify({
            SECOND: trainer({ id: "SECOND" })
        }),
        "utf8"
    );

    const result = service.reload();

    assert.deepEqual(
        Object.keys(result),
        ["SECOND"]
    );
    assert.strictEqual(service.trainers, result);
});

test("reload replaces the previous trainer records", t => {
    const fixture = createFixture(t, {
        FIRST: trainer({ id: "FIRST" })
    });

    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    assert.equal(service.hasTrainer("FIRST"), true);

    fs.writeFileSync(
        fixture.filePath,
        JSON.stringify({
            SECOND: trainer({ id: "SECOND" })
        }),
        "utf8"
    );

    service.reload();

    assert.equal(service.hasTrainer("FIRST"), false);
    assert.equal(service.hasTrainer("SECOND"), true);
});

test("reload unwraps the trainers wrapper", t => {
    const fixture = createFixture(t, {
        FIRST: trainer({ id: "FIRST" })
    });

    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    fs.writeFileSync(
        fixture.filePath,
        JSON.stringify({
            trainers: {
                WRAPPED: trainer({ id: "WRAPPED" })
            }
        }),
        "utf8"
    );

    assert.deepEqual(
        Object.keys(service.reload()),
        ["WRAPPED"]
    );
});

test("reload returns an empty database when the file disappears", t => {
    const fixture = createFixture(t, {
        FIRST: trainer({ id: "FIRST" })
    });

    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    fs.unlinkSync(fixture.filePath);

    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args);

    let result;

    try {
        result = service.reload();
    } finally {
        console.warn = originalWarn;
    }

    assert.deepEqual(result, {});
    assert.deepEqual(service.trainers, {});
    assert.equal(warnings.length, 1);
});

test("reload propagates malformed JSON errors", t => {
    const fixture = createFixture(t, {
        FIRST: trainer({ id: "FIRST" })
    });

    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    fs.writeFileSync(fixture.filePath, "{invalid", "utf8");

    assert.throws(() => service.reload(), SyntaxError);
});

test("reload preserves the selected game", t => {
    const fixture = createFixture(t, {
        FIRST: trainer({ id: "FIRST" })
    });

    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    service.reload();

    assert.equal(service.game, fixture.game);
});

test("reload does not modify the generated database file", t => {
    const data = {
        FIRST: trainer({ id: "FIRST" })
    };

    const fixture = createFixture(t, data);
    const service = withWarningsSuppressed(
        () => new TrainerDatabaseService(fixture.game)
    );

    const original = fs.readFileSync(fixture.filePath, "utf8");

    service.reload();

    assert.equal(fs.readFileSync(fixture.filePath, "utf8"), original);
});

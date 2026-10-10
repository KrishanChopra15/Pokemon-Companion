const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

const TrainerService = require("../scripts/services/trainer-service.js");

function createTrainer(overrides = {}) {
    return {
        id: "T001",
        trainerName: "Brock",
        trainerType: "GYM_LEADER",
        party: [
            { species: "GEODUDE", level: 12 },
            { species: "ONIX", level: 14 }
        ],
        ...overrides
    };
}

function createService(trainers = []) {
    return new TrainerService(trainers);
}

describe("TrainerService constructor", () => {
    test("uses an empty array by default", () => {
        const service = new TrainerService();

        assert.deepEqual(service.getTrainerList(), []);
    });

    test("accepts an array of trainers", () => {
        const trainers = [createTrainer()];

        const service = createService(trainers);

        assert.equal(service.getAllTrainers(), trainers);
    });

    test("accepts an object containing a trainers array", () => {
        const trainers = [createTrainer()];

        const service = createService({ trainers });

        assert.equal(service.getAllTrainers(), trainers);
    });

    test("accepts an object containing an empty trainers array", () => {
        const service = createService({ trainers: [] });

        assert.deepEqual(service.getAllTrainers(), []);
    });

    test("accepts an object map of trainers", () => {
        const brock = createTrainer({ id: "T001" });
        const misty = createTrainer({
            id: "T002",
            trainerName: "Misty"
        });

        const service = createService({
            brock,
            misty
        });

        assert.deepEqual(
            service.getAllTrainers(),
            [brock, misty]
        );
    });
});

describe("TrainerService getTrainerList", () => {
    test("returns an array when trainers is an array", () => {
        const trainers = [createTrainer()];
        const service = createService(trainers);

        assert.deepEqual(service.getTrainerList(), trainers);
    });

    test("returns the original array reference", () => {
        const trainers = [createTrainer()];
        const service = createService(trainers);

        assert.equal(service.getTrainerList(), trainers);
    });

    test("converts an object map into an array of values", () => {
        const brock = createTrainer({ id: "T001" });
        const misty = createTrainer({
            id: "T002",
            trainerName: "Misty"
        });

        const service = createService({ brock, misty });

        assert.deepEqual(service.getTrainerList(), [brock, misty]);
    });

    test("returns an empty array for null trainer data", () => {
        const service = createService(null);

        assert.deepEqual(service.getTrainerList(), []);
    });

    test("returns an empty array for undefined trainer data", () => {
        const service = createService(undefined);

        assert.deepEqual(service.getTrainerList(), []);
    });

    test("returns an empty array for numeric trainer data", () => {
        const service = createService(123);

        assert.deepEqual(service.getTrainerList(), []);
    });

    test("returns an empty array for string trainer data", () => {
        const service = createService("trainers");

        assert.deepEqual(service.getTrainerList(), []);
    });
});

describe("TrainerService getTrainer", () => {
    const trainers = [
        createTrainer({
            id: "T001",
            trainerName: "Brock",
            name: "Rock Specialist"
        }),
        createTrainer({
            id: "T002",
            trainerName: "Misty",
            name: "Water Specialist"
        })
    ];

    test("finds a trainer by ID", () => {
        const service = createService(trainers);

        assert.equal(service.getTrainer("T001"), trainers[0]);
    });

    test("finds a trainer by ID without matching letter case", () => {
        const service = createService(trainers);

        assert.equal(service.getTrainer("t001"), trainers[0]);
    });

    test("finds a trainer by trainerName", () => {
        const service = createService(trainers);

        assert.equal(service.getTrainer("Brock"), trainers[0]);
    });

    test("finds a trainer by trainerName without matching letter case", () => {
        const service = createService(trainers);

        assert.equal(service.getTrainer("mIsTy"), trainers[1]);
    });

    test("finds a trainer by name when trainerName is absent", () => {
        const trainer = createTrainer({
            id: "T003",
            trainerName: undefined,
            name: "Lance"
        });

        const service = createService([trainer]);

        assert.equal(service.getTrainer("Lance"), trainer);
    });

    test("finds a trainer using an ID supplied as a number", () => {
        const trainer = createTrainer({ id: "123" });
        const service = createService([trainer]);

        assert.equal(service.getTrainer(123), trainer);
    });

    test("returns the trainer matching an ID before a matching name", () => {
        const first = createTrainer({
            id: "BROCK",
            trainerName: "First Trainer"
        });

        const second = createTrainer({
            id: "T002",
            trainerName: "Brock"
        });

        const service = createService([first, second]);

        assert.equal(service.getTrainer("Brock"), first);
    });

    test("returns the first matching trainer when names are duplicated", () => {
        const first = createTrainer({ id: "T001" });
        const second = createTrainer({ id: "T002" });

        const service = createService([
            first,
            second
        ]);

        assert.equal(service.getTrainer("Brock"), first);
    });

    test("returns null when the trainer is not found", () => {
        const service = createService(trainers);

        assert.equal(service.getTrainer("UNKNOWN"), null);
    });

    test("returns null for an empty string", () => {
        const service = createService(trainers);

        assert.equal(service.getTrainer(""), null);
    });

    test("returns null for a null ID", () => {
        const service = createService(trainers);

        assert.equal(service.getTrainer(null), null);
    });

    test("returns null for an undefined ID", () => {
        const service = createService(trainers);

        assert.equal(service.getTrainer(undefined), null);
    });

    test("returns null for a numeric zero ID", () => {
        const service = createService(trainers);

        assert.equal(service.getTrainer(0), null);
    });
});

describe("TrainerService hasTrainer", () => {
    test("returns true when a trainer exists by ID", () => {
        const service = createService([createTrainer()]);

        assert.equal(service.hasTrainer("T001"), true);
    });

    test("returns true when a trainer exists by name", () => {
        const service = createService([createTrainer()]);

        assert.equal(service.hasTrainer("Brock"), true);
    });

    test("returns false when a trainer does not exist", () => {
        const service = createService([createTrainer()]);

        assert.equal(service.hasTrainer("UNKNOWN"), false);
    });

    test("returns false for an empty ID", () => {
        const service = createService([createTrainer()]);

        assert.equal(service.hasTrainer(""), false);
    });
});

describe("TrainerService getAllTrainers", () => {
    test("returns all trainers", () => {
        const trainers = [
            createTrainer({ id: "T001" }),
            createTrainer({ id: "T002" })
        ];

        const service = createService(trainers);

        assert.deepEqual(service.getAllTrainers(), trainers);
    });

    test("returns an empty array when there are no trainers", () => {
        const service = createService();

        assert.deepEqual(service.getAllTrainers(), []);
    });

    test("returns the original trainer array reference", () => {
        const trainers = [createTrainer()];
        const service = createService(trainers);

        assert.equal(service.getAllTrainers(), trainers);
    });
});

describe("TrainerService getGymLeader", () => {
    test("returns a trainer whose trainerType is GYM_LEADER", () => {
        const leader = createTrainer({
            trainerType: "GYM_LEADER"
        });

        const service = createService([leader]);

        assert.equal(service.getGymLeader("Brock"), leader);
    });

    test("returns a trainer whose type is GYM_LEADER", () => {
        const leader = createTrainer({
            trainerType: undefined,
            type: "GYM_LEADER"
        });

        const service = createService([leader]);

        assert.equal(service.getGymLeader("Brock"), leader);
    });

    test("returns null when the trainer is not a gym leader", () => {
        const trainer = createTrainer({
            trainerType: "ELITE_FOUR"
        });

        const service = createService([trainer]);

        assert.equal(service.getGymLeader("Brock"), null);
    });

    test("returns null when the trainer does not exist", () => {
        const service = createService([createTrainer()]);

        assert.equal(service.getGymLeader("Unknown"), null);
    });

    test("requires the gym leader type to match exactly", () => {
        const trainer = createTrainer({
            trainerType: "gym_leader"
        });

        const service = createService([trainer]);

        assert.equal(service.getGymLeader("Brock"), null);
    });
});

describe("TrainerService getParty", () => {
    test("returns the party of an existing trainer", () => {
        const trainer = createTrainer();
        const service = createService([trainer]);

        assert.deepEqual(
            service.getParty("Brock"),
            trainer.party
        );
    });

    test("returns the original party reference", () => {
        const trainer = createTrainer();
        const service = createService([trainer]);

        assert.equal(service.getParty("Brock"), trainer.party);
    });

    test("returns an empty array when the trainer does not exist", () => {
        const service = createService([createTrainer()]);

        assert.deepEqual(service.getParty("Unknown"), []);
    });

    test("returns an empty array when the party is absent", () => {
        const trainer = createTrainer({ party: undefined });
        const service = createService([trainer]);

        assert.deepEqual(service.getParty("Brock"), []);
    });

    test("returns an empty array when the party is null", () => {
        const trainer = createTrainer({ party: null });
        const service = createService([trainer]);

        assert.deepEqual(service.getParty("Brock"), []);
    });
});

describe("TrainerService createBattleTrainer", () => {
    test("creates battle-ready data for an existing trainer", () => {
        const trainer = createTrainer();
        const service = createService([trainer]);

        assert.deepEqual(
            service.createBattleTrainer("Brock"),
            {
                success: true,
                trainer: {
                    id: "T001",
                    name: "Brock",
                    type: "GYM_LEADER",
                    party: trainer.party
                }
            }
        );
    });

    test("looks up a trainer using its ID", () => {
        const trainer = createTrainer();
        const service = createService([trainer]);

        assert.equal(
            service.createBattleTrainer("T001").success,
            true
        );
    });

    test("uses name when trainerName is absent", () => {
        const trainer = createTrainer({
            trainerName: undefined,
            name: "Lance"
        });

        const service = createService([trainer]);

        assert.deepEqual(
            service.createBattleTrainer("Lance").trainer.name,
            "Lance"
        );
    });

    test("uses type when trainerType is absent", () => {
        const trainer = createTrainer({
            trainerType: undefined,
            type: "CHAMPION"
        });

        const service = createService([trainer]);

        assert.deepEqual(
            service.createBattleTrainer("Brock").trainer.type,
            "CHAMPION"
        );
    });

    test("returns an empty party when the party is absent", () => {
        const trainer = createTrainer({ party: undefined });
        const service = createService([trainer]);

        assert.deepEqual(
            service.createBattleTrainer("Brock").trainer.party,
            []
        );
    });

    test("returns an empty party when the party is null", () => {
        const trainer = createTrainer({ party: null });
        const service = createService([trainer]);

        assert.deepEqual(
            service.createBattleTrainer("Brock").trainer.party,
            []
        );
    });

    test("returns failure when the trainer does not exist", () => {
        const service = createService();

        assert.deepEqual(
            service.createBattleTrainer("Unknown"),
            {
                success: false,
                reason: "Trainer not found"
            }
        );
    });

    test("does not include battle trainer data when lookup fails", () => {
        const service = createService();

        const result = service.createBattleTrainer("Unknown");

        assert.equal("trainer" in result, false);
    });
});

describe("TrainerService getByType", () => {
    const trainers = [
        createTrainer({
            id: "T001",
            trainerType: "GYM_LEADER"
        }),
        createTrainer({
            id: "T002",
            trainerType: "RIVAL"
        }),
        createTrainer({
            id: "T003",
            trainerType: undefined,
            type: "GYM_LEADER"
        }),
        createTrainer({
            id: "T004",
            trainerType: "CHAMPION"
        })
    ];

    test("returns trainers matching the requested type", () => {
        const service = createService(trainers);

        assert.deepEqual(
            service.getByType("GYM_LEADER"),
            [trainers[0], trainers[2]]
        );
    });

    test("matches trainer types without matching letter case", () => {
        const service = createService(trainers);

        assert.deepEqual(
            service.getByType("rival"),
            [trainers[1]]
        );
    });

    test("matches the type property when trainerType is absent", () => {
        const service = createService([trainers[2]]);

        assert.deepEqual(
            service.getByType("GYM_LEADER"),
            [trainers[2]]
        );
    });

    test("returns an empty array when no trainers match", () => {
        const service = createService(trainers);

        assert.deepEqual(
            service.getByType("UNKNOWN"),
            []
        );
    });

    test("returns an empty array for an empty type", () => {
        const service = createService(trainers);

        assert.deepEqual(service.getByType(""), []);
    });

    test("returns an empty array for a null type", () => {
        const service = createService(trainers);

        assert.deepEqual(service.getByType(null), []);
    });

    test("returns an empty array for an undefined type", () => {
        const service = createService(trainers);

        assert.deepEqual(service.getByType(undefined), []);
    });

    test("returns an empty array when the trainer list is empty", () => {
        const service = createService();

        assert.deepEqual(
            service.getByType("GYM_LEADER"),
            []
        );
    });
});

describe("TrainerService count", () => {
    test("returns zero when there are no trainers", () => {
        const service = createService();

        assert.equal(service.count(), 0);
    });

    test("returns the total number of trainers", () => {
        const service = createService([
            createTrainer({ id: "T001" }),
            createTrainer({ id: "T002" }),
            createTrainer({ id: "T003" })
        ]);

        assert.equal(service.count(), 3);
    });

    test("counts trainers stored in an object map", () => {
        const service = createService({
            brock: createTrainer({ id: "T001" }),
            misty: createTrainer({ id: "T002" })
        });

        assert.equal(service.count(), 2);
    });

    test("counts every entry even when IDs are duplicated", () => {
        const service = createService([
            createTrainer({ id: "T001" }),
            createTrainer({ id: "T001" })
        ]);

        assert.equal(service.count(), 2);
    });

    test("counts every entry regardless of trainer type", () => {
        const service = createService([
            createTrainer({ trainerType: "GYM_LEADER" }),
            createTrainer({ trainerType: "RIVAL" }),
            createTrainer({ trainerType: "CHAMPION" })
        ]);

        assert.equal(service.count(), 3);
    });
});

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const moves = JSON.parse(
    fs.readFileSync(
        path.join(
            __dirname,
            '../../database/generated/moves.json'
        ),
        'utf8'
    )
);

function runTest(
    description,
    callback
) {
    try {
        callback();

        console.log(
            `✓ ${description}`
        );
    } catch (error) {
        console.error(
            `✗ ${description}`
        );

        throw error;
    }
}

/*
|--------------------------------------------------------------------------
| Blizzard
|--------------------------------------------------------------------------
*/

runTest(
    'Blizzard accuracy changes in Generation II',
    () => {
        assert.strictEqual(
            moves.blizzard[1].accuracy,
            90
        );

        assert.strictEqual(
            moves.blizzard[2].accuracy,
            70
        );
    }
);

runTest(
    'Blizzard power changes in Generation VI',
    () => {
        assert.strictEqual(
            moves.blizzard[5].power,
            120
        );

        assert.strictEqual(
            moves.blizzard[6].power,
            110
        );
    }
);

runTest(
    'Blizzard changes from Hail to Snow',
    () => {
        assert.ok(
            moves.blizzard[8]
                .description
                .includes('Hail')
        );

        assert.ok(
            moves.blizzard[9]
                .description
                .includes('Snow')
        );
    }
);

runTest(
    'Blizzard retains its freeze chance',
    () => {
        assert.strictEqual(
            moves.blizzard[1]
                .secondary
                .chance,
            10
        );

        assert.strictEqual(
            moves.blizzard[9]
                .secondary
                .chance,
            10
        );
    }
);

/*
|--------------------------------------------------------------------------
| Tackle
|--------------------------------------------------------------------------
*/

runTest(
    'Tackle changes correctly',
    () => {
        assert.strictEqual(
            moves.tackle[1].power,
            35
        );

        assert.strictEqual(
            moves.tackle[5].power,
            50
        );

        assert.strictEqual(
            moves.tackle[7].power,
            40
        );
    }
);

runTest(
    'Tackle remains a physical move',
    () => {
        assert.strictEqual(
            moves.tackle[1].category,
            'Physical'
        );

        assert.strictEqual(
            moves.tackle[9].category,
            'Physical'
        );
    }
);

/*
|--------------------------------------------------------------------------
| Drain Punch
|--------------------------------------------------------------------------
*/

runTest(
    'Drain Punch does not exist before Generation IV',
    () => {
        assert.strictEqual(
            moves.drainpunch[1],
            undefined
        );

        assert.strictEqual(
            moves.drainpunch[2],
            undefined
        );

        assert.strictEqual(
            moves.drainpunch[3],
            undefined
        );
    }
);

runTest(
    'Drain Punch exists from Generation IV onwards',
    () => {
        assert.strictEqual(
            moves.drainpunch[4].power,
            60
        );

        assert.strictEqual(
            moves.drainpunch[5].power,
            75
        );
    }
);

runTest(
    'Drain Punch gains the heal flag',
    () => {
        assert.strictEqual(
            moves.drainpunch[5]
                .flags
                .heal,
            undefined
        );

        assert.strictEqual(
            moves.drainpunch[6]
                .flags
                .heal,
            1
        );
    }
);

runTest(
    'Drain Punch was introduced in Generation IV',
    () => {
        assert.strictEqual(
            moves.drainpunch[4]
                .introducedGeneration,
            4
        );
    }
);

/*
|--------------------------------------------------------------------------
| Counter
|--------------------------------------------------------------------------
*/

runTest(
    'Counter mechanics change over time',
    () => {
        assert.notStrictEqual(
            moves.counter[1]
                .description,
            moves.counter[9]
                .description
        );
    }
);

/*
|--------------------------------------------------------------------------
| Hyper Beam
|--------------------------------------------------------------------------
*/

runTest(
    'Hyper Beam mechanics change after Generation I',
    () => {
        assert.notStrictEqual(
            moves.hyperbeam[1]
                .description,
            moves.hyperbeam[2]
                .description
        );
    }
);

console.log();
console.log('All tests passed.');
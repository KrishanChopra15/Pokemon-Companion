const assert = require('node:assert');

const {
    getAbilityHistory
} = require(
    '../generate/generate-ability-history'
);

function test(name, fn) {
    fn();
    console.log(`✓ ${name}`);
}

test(
    'Torrent does not exist before Generation III',
    () => {
        const history = getAbilityHistory('torrent');

        assert.strictEqual(history[1], undefined);
        assert.strictEqual(history[2], undefined);
    }
);

test(
    'Torrent exists from Generation III onward',
    () => {
        const history = getAbilityHistory('torrent');

        assert.ok(history[3]);
        assert.strictEqual(
            history[3].introducedGeneration,
            3
        );
    }
);

test(
    'Torrent description changes in Generation V',
    () => {
        const history = getAbilityHistory('torrent');

        assert.notStrictEqual(
            history[4].description,
            history[5].description
        );
    }
);

test(
    'Protean introduced in Generation VI',
    () => {
        const history = getAbilityHistory('protean');

        assert.strictEqual(history[5], undefined);
        assert.ok(history[6]);
    }
);

test(
    'Protean rating changes in Generation IX',
    () => {
        const history = getAbilityHistory('protean');

        assert.strictEqual(history[8].rating, 4.5);
        assert.strictEqual(history[9].rating, 4);
    }
);

test(
    'Levitate description changes over time',
    () => {
        const history = getAbilityHistory('levitate');

        assert.notStrictEqual(
            history[3].description,
            history[9].description
        );
    }
);

test(
    'Intimidate history exists',
    () => {
        const history = getAbilityHistory('intimidate');

        assert.ok(history[3]);
        assert.ok(history[9]);
    }
);

console.log('\nAll tests passed.');
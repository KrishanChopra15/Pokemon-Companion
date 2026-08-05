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

const moveId = process.argv[2];

if (!moveId) {
    console.error(
        'Please specify a move ID.'
    );

    process.exit(1);
}

const move = moves[moveId];

if (!move) {
    console.error(
        `Move "${moveId}" was not found.`
    );

    process.exit(1);
}

console.dir(
    move,
    {
        depth: null
    }
);
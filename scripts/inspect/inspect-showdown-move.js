'use strict';

const fs = require('fs');
const path = require('path');

const MOVE = 'tackle';

const ROOT = path.join(
    __dirname,
    '../../database/external/showdown/data',
);

const GENERATIONS = [
    'gen1',
    'gen2',
    'gen3',
    'gen4',
    'gen5',
    'gen6',
    'gen7',
    'gen8',
];

function loadFile(filename) {
    if (!fs.existsSync(filename)) {
        return '';
    }

    return fs.readFileSync(filename, 'utf8');
}

function findMove(contents, move) {
    const pattern = new RegExp(
        `${move}:\\s*\\{([\\s\\S]*?)\\n\\t\\},`,
        'm',
    );

    const match = contents.match(pattern);

    return match ? match[0] : null;
}

const baseFile = path.join(ROOT, 'moves.ts');

console.log('\n==============================');
console.log('BASE');
console.log('==============================\n');

const baseMove = findMove(loadFile(baseFile), MOVE);

console.log(baseMove ?? 'Not found.');

for (const generation of GENERATIONS) {
    const filename = path.join(
        ROOT,
        'mods',
        generation,
        'moves.ts',
    );

    console.log('\n==============================');
    console.log(generation.toUpperCase());
    console.log('==============================\n');

    const move = findMove(loadFile(filename), MOVE);

    console.log(move ?? 'Not found.');
}
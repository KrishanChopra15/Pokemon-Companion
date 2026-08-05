'use strict';

const fs = require('fs');
const path = require('path');

const filename = path.join(
    __dirname,
    '../../database/external/showdown/data/mods/gen1/moves.ts',
);

const contents = fs.readFileSync(filename, 'utf8');

console.log(contents.slice(0, 3000));
const fs = require('node:fs');
const path = require('node:path');

const {
    getMoveHistory
} = require('./generate-move-history');

const {
    getGenerationDex
} = require('../utils/loaders/showdown');

const OUTPUT_PATH = path.join(
    __dirname,
    '../../database/generated/moves.json'
);

function getMoveIds() {
    const dex = getGenerationDex(9);

    return Object
        .keys(dex.data.Moves)
        .sort();
}

function generateMoves() {
    const moveIds = getMoveIds();

    const histories = {};

    console.log(`Found ${moveIds.length} moves.`);

    for (const moveId of moveIds) {
        histories[moveId] = getMoveHistory(moveId);
    }

    fs.writeFileSync(
        OUTPUT_PATH,
        JSON.stringify(histories, null, 4)
    );

    console.log(
        `Successfully generated ${moveIds.length} move histories.`
    );

    console.log(
        `Output written to:\n${OUTPUT_PATH}`
    );
}

generateMoves();
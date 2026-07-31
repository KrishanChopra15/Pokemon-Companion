const path = require('node:path');

const { Dex } = require(
    '../../../database/external/showdown/dist/sim'
);

const SHOWDOWN_ROOT = path.join(
    __dirname,
    '../../../database/external/showdown/dist/data'
);

function getGenerationPath(generation) {
    if (generation === 9) {
        return path.join(SHOWDOWN_ROOT, 'moves.js');
    }

    return path.join(
        SHOWDOWN_ROOT,
        'mods',
        `gen${generation}`,
        'moves.js'
    );
}

function getGenerationDex(generation) {
    if (generation === 9) {
        return Dex;
    }

    return Dex.mod(`gen${generation}`);
}

function loadGeneration(generation) {
    return require(
        getGenerationPath(generation)
    ).Moves;
}

function loadBaseMoves() {
    return require(
        path.join(
            SHOWDOWN_ROOT,
            'moves.js'
        )
    ).Moves;
}

function loadGenerationOverrides(generation) {
    if (generation === 9) {
        return {};
    }

    return require(
        path.join(
            SHOWDOWN_ROOT,
            'mods',
            `gen${generation}`,
            'moves.js'
        )
    ).Moves;
}

function getMove(moveId, generation) {
    return getGenerationDex(generation)
        .moves
        .get(moveId);
}

module.exports = {
    getGenerationDex,
    getGenerationPath,
    getMove,
    loadBaseMoves,
    loadGeneration,
    loadGenerationOverrides
};
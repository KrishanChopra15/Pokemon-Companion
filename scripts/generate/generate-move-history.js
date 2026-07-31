const {
    getMove
} = require('../utils/loaders/showdown');

const {
    normaliseMove
} = require('../utils/normalisers/move');

function getMoveHistory(moveId) {
    const history = {};

    for (let generation = 1; generation <= 9; generation++) {
        const move = getMove(
            moveId,
            generation
        );

        if (move.gen > generation) {
            continue;
        }

        history[generation] = normaliseMove(
            move,
            generation
        );
    }

    return history;
}

module.exports = {
    getMoveHistory
};
const {
    getMoveHistory
} = require('../generate/generate-move-history');

console.dir(
    getMoveHistory('blizzard'),
    { depth: null }
);
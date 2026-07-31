const { Dex } = require(
    '../../database/external/showdown/dist/sim'
);

const gen5 = Dex.mod('gen5');

console.log(gen5.currentMod);
console.log(gen5.parentMod);
const { Dex } = require(
    '../../database/external/showdown/dist/sim'
);

for (let gen = 1; gen <= 9; gen++) {
    const dex = gen === 9
        ? Dex
        : Dex.mod(`gen${gen}`);

    console.log({
        gen,
        currentMod: dex.currentMod,
        parentMod: dex.parentMod
    });
}
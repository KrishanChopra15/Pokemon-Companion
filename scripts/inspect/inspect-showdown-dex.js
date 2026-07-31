const { Dex } = require("../../database/external/showdown/dist/sim");

for (let gen = 1; gen <= 9; gen++) {
    const dex = Dex.mod(`gen${gen}`);
    const move = dex.moves.get("blizzard");

    console.log({
        gen,
        currentMod: dex.currentMod,
        accuracy: move.accuracy,
        basePower: move.basePower,
        target: move.target,
    });
}
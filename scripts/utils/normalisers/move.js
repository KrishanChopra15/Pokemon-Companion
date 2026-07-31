function normaliseMove(
    move,
    generation
) {
    return {
        id: move.id,
        name: move.name,

        generation: generation,
        introducedGeneration: move.gen,
        
        number: move.num,

        type: move.type,
        category: move.category,

        power: move.basePower,
        accuracy: move.accuracy,
        pp: move.pp,

        priority: move.priority,
        target: move.target,

        critRatio: move.critRatio,

        flags: {
            ...move.flags
        },

        secondary: move.secondary
            ? {
                ...move.secondary
            }
            : null,

        contestType: move.contestType,

        shortDescription: move.shortDesc,
        description: move.desc
    };
}

module.exports = {
    normaliseMove
};
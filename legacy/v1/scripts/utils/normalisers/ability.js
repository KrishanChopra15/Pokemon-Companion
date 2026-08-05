function normaliseAbility(
    ability,
    generation
) {
    return {
        id: ability.id,
        name: ability.name,

        generation: generation,
        introducedGeneration: ability.gen,

        number: ability.num,

        rating: ability.rating,

        shortDescription: ability.shortDesc,
        description: ability.desc
    };
}

module.exports = {
    normaliseAbility
};
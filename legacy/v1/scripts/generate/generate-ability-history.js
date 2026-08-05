const {
    getAbility
} = require(
    '../utils/loaders/showdown'
);

const {
    normaliseAbility
} = require(
    '../utils/normalisers/ability'
);

function getAbilityHistory(
    abilityId
) {
    const history = {};

    for (
        let generation = 1;
        generation <= 9;
        generation++
    ) {
        const ability = getAbility(
            abilityId,
            generation
        );

        if (ability.gen > generation) {
            continue;
        }

        history[generation] = normaliseAbility(
            ability,
            generation
        );
    }

    return history;
}

module.exports = {
    getAbilityHistory
};
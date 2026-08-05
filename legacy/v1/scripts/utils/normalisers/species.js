function normaliseBaseStats(

    baseStats,

    generation

) {

    if (generation === 1) {

        return {

            hp:
                baseStats.hp,

            atk:
                baseStats.atk,

            def:
                baseStats.def,

            special:
                baseStats.spa,

            spa:
                null,

            spd:
                null,

            spe:
                baseStats.spe

        };

    }

    return {

        hp:
            baseStats.hp,

        atk:
            baseStats.atk,

        def:
            baseStats.def,

        special:
            null,

        spa:
            baseStats.spa,

        spd:
            baseStats.spd,

        spe:
            baseStats.spe

    };

}

function normaliseAbilities(

    abilities,

    generation

) {

    if (generation < 3) {

        return {};

    }

    return {

        ...abilities

    };

}

function normaliseSpecies(

    species,

    generation

) {

    return {

        id:
            species.id,

        name:
            species.name,

        generation,

        introducedGeneration:
            species.gen,

        number:
            species.num,

        types: [

            ...species.types

        ],

        baseStats:
            normaliseBaseStats(

                species.baseStats,

                generation

            ),

        baseStatTotal:
            species.bst,

        abilities:
            normaliseAbilities(

                species.abilities,

                generation

            ),

        preEvolution:
            species.prevo ||
            null,

        evolutions: [

            ...species.evos

        ],

        evolutionType:
            species.evoType ??
            null,

        evolutionMove:
            species.evoMove ??
            null,

        evolutionLevel:
            species.evoLevel ??
            null,

        isNotFullyEvolved:
            species.nfe,

        eggGroups:

            generation >= 2

                ? [

                    ...species.eggGroups

                ]

                : [],

        canHatch:

            generation >= 2 &&

            species.canHatch,

        gender:

            generation >= 2

                ? species.gender ||
                    null

                : null,

        genderRatio:

            generation >= 2 &&

            species.genderRatio

                ? {

                    ...species.genderRatio

                }

                : null,

        heightMeters:
            species.heightm,

        weightKilograms:
            species.weightkg,

        color:
            species.color,

        tier:
            species.tier,

        doublesTier:
            species.doublesTier,

        nationalDexTier:
            species.natDexTier,

        tags: [

            ...species.tags

        ],

        canGigantamax:

            generation === 8

                ? species.canGigantamax ??
                    false

                : false,

        cannotDynamax:

            generation === 8

                ? species.cannotDynamax ??
                    false

                : false

    };

}

module.exports = {

    normaliseSpecies

};
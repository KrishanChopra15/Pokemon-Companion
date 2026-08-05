function normaliseStringList(
    value
) {

    if (!value) {

        return [];

    }

    return Array.isArray(
        value
    )

        ? [

            ...value

        ]

        : [

            value

        ];

}

function getFormType(
    form
) {

    if (form.isMega) {

        return "Mega";

    }

    if (form.isPrimal) {

        return "Primal";

    }

    if (

        form.forme === "Gmax" ||

        form.canGigantamax

    ) {

        return "Gigantamax";

    }

    if (form.isCosmeticForme) {

        return "Cosmetic";

    }

    if (form.battleOnly) {

        return "Battle Only";

    }

    return "Alternate";

}

function normaliseForm(

    form,

    generation

) {

    return {

        id:
            form.id,

        name:
            form.name,

        generation,

        introducedGeneration:
            form.gen,

        number:
            form.num,

        baseSpecies:
            form.baseSpecies,

        formName:
            form.forme,

        formType:
            getFormType(
                form
            ),

        spriteId:
            form.spriteid,

        types: [

            ...form.types

        ],

        baseStats: {

            ...form.baseStats

        },

        baseStatTotal:
            form.bst,

        abilities:

            generation >= 3

                ? {

                    ...form.abilities

                }

                : {},

        heightMeters:
            form.heightm,

        weightKilograms:
            form.weightkg,

        color:
            form.color,

        requiredItem:
            form.requiredItem ??
            null,

        requiredItems:
            normaliseStringList(
                form.requiredItems
            ),

        battleOnly:
            normaliseStringList(
                form.battleOnly
            ),

        changesFrom:
            form.changesFrom ??
            null,

        isMega:
            form.isMega ??
            false,

        isPrimal:
            form.isPrimal ??
            false,

        isCosmetic:
            form.isCosmeticForme ??
            false,

        canGigantamax:

            generation === 8

                ? form.canGigantamax ??
                    false

                : false,

        cannotDynamax:

            generation === 8

                ? form.cannotDynamax ??
                    false

                : false

    };

}

module.exports = {

    normaliseForm

};
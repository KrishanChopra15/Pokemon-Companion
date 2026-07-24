const {
    getIdFromUrl
} = require("./helpers");

const {
    formatApiName,
    formatGeneration
} = require("./formatting");

/* ---------------------------------- */
/* Generic References                 */
/* ---------------------------------- */

/**
 * Creates a lightweight reference
 * from a PokéAPI resource or local
 * database object.
 */
function createNamedApiReference(
    resource
) {

    if (!resource) {

        return null;

    }

    return {

        id:
            resource.id ??
            getIdFromUrl(
                resource.url
            ),

        name:
            formatApiName(
                resource.name
            )

    };

}

/* ---------------------------------- */
/* Version References                 */
/* ---------------------------------- */

function createVersionGroupReference(

    versionGroup,

    includeOrder = false

) {

    if (!versionGroup) {

        return null;

    }

    const reference = {

        id:
            versionGroup.id,

        apiName:
            versionGroup.apiName,

        name:
            versionGroup.name

    };

    if (includeOrder) {

        reference.order =
            versionGroup.order;

    }

    return reference;

}

/* ---------------------------------- */
/* Generation                         */
/* ---------------------------------- */

function createGenerationReference(
    generation
) {

    if (!generation) {

        return null;

    }

    return {

        id:
            getIdFromUrl(
                generation.url
            ),

        name:
            formatGeneration(
                generation.name
            )

    };

}

/* ---------------------------------- */
/* Game                               */
/* ---------------------------------- */

function createGameReference(
    game
) {

    return createNamedApiReference(
        game
    );

}

/* ---------------------------------- */
/* Pokémon                            */
/* ---------------------------------- */

function createPokemonReference(
    pokemon
) {

    if (!pokemon) {

        return null;

    }

    return (
        pokemon.id ??
        getIdFromUrl(
            pokemon.url
        )
    );

}

function createSpeciesReference(
    species
) {

    if (!species) {

        return null;

    }

    return {

        id:
            species.id ??
            getIdFromUrl(
                species.url
            )

    };

}

/* ---------------------------------- */
/* Battle                             */
/* ---------------------------------- */

function createTypeReference(
    type
) {

    if (!type) {

        return null;

    }

    const reference =
        createNamedApiReference(
            type
        );

    if (type.legacy) {

        reference.legacy = true;

    }

    return reference;

}

function createAbilityReference(
    ability
) {

    return createNamedApiReference(
        ability
    );

}

function createMoveReference(
    move
) {

    return createNamedApiReference(
        move
    );

}

function createTargetReference(
    target
) {

    return createNamedApiReference(
        target
    );

}

/* ---------------------------------- */
/* World                              */
/* ---------------------------------- */

function createRegionReference(
    region
) {

    return createNamedApiReference(
        region
    );

}

function createLocationReference(
    location
) {

    return createNamedApiReference(
        location
    );

}

/* ---------------------------------- */
/* Items                              */
/* ---------------------------------- */

function createItemReference(
    item
) {

    return createNamedApiReference(
        item
    );

}

module.exports = {

    createNamedApiReference,

    createVersionGroupReference,

    createGenerationReference,

    createGameReference,

    createPokemonReference,

    createSpeciesReference,

    createTypeReference,

    createAbilityReference,

    createMoveReference,

    createTargetReference,

    createRegionReference,

    createLocationReference,

    createItemReference

};
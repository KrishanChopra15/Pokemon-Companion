const {
    createSearchEntry
} = require("./search");

/**
 * Creates a search entry for an entity.
 */

function createEntitySearchEntry(
    type,
    entity
) {

    return createSearchEntry({

        type,

        id:
            entity.id,

        identifier:
            entity.identifier,

        name:
            entity.name,

        keywords: [

            entity.identifier,

            entity.name

        ]

    });

}

/**
 * Pokémon
 */

function createPokemonSearchEntry(
    pokemon
) {

    return createEntitySearchEntry(
        "pokemon",
        pokemon
    );

}

/**
 * Species
 */

function createSpeciesSearchEntry(
    species
) {

    return createEntitySearchEntry(
        "species",
        species
    );

}

/**
 * Moves
 */

function createMoveSearchEntry(
    move
) {

    return createEntitySearchEntry(
        "move",
        move
    );

}

/**
 * Abilities
 */

function createAbilitySearchEntry(
    ability
) {

    return createEntitySearchEntry(
        "ability",
        ability
    );

}

/**
 * Items
 */

function createItemSearchEntry(
    item
) {

    return createEntitySearchEntry(
        "item",
        item
    );

}

/**
 * Types
 */

function createTypeSearchEntry(
    type
) {

    return createEntitySearchEntry(
        "type",
        type
    );

}

/**
 * Locations
 */

function createLocationSearchEntry(
    location
) {

    return createEntitySearchEntry(
        "location",
        location
    );

}

module.exports = {

    createAbilitySearchEntry,

    createItemSearchEntry,

    createLocationSearchEntry,

    createMoveSearchEntry,

    createPokemonSearchEntry,

    createSpeciesSearchEntry,

    createTypeSearchEntry

};
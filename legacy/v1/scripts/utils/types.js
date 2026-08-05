/**
 * Creates the lightweight lookup object
 * used throughout the frontend.
 */

function createTypeLookup(
    type
) {

    return {

        id:
            type.id,

        identifier:
            type.identifier,

        name:
            type.name,

        color:
            type.color,

        emoji:
            type.emoji,

        icon:
            type.icon

    };

}

module.exports = {

    createTypeLookup

};
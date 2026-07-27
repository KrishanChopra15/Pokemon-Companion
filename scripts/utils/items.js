/**
 * Creates the lightweight lookup object
 * used throughout the frontend.
 */

function createItemLookup(
    item
) {

    return {

        id:
            item.id,

        identifier:
            item.identifier,

        name:
            item.name,

        categoryId:
            item.categoryId,

        cost:
            item.cost,

        flingPower:
            item.flingPower,

        flingEffectId:
            item.flingEffectId

    };

}

module.exports = {

    createItemLookup

};
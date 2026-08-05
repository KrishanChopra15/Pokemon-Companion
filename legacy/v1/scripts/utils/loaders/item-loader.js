const {
    getGenerationDex
} = require("./showdown");

/**
 * Loads every valid item for a generation.
 *
 * @param {number} generation
 * @returns {Array<Object>}
 */
function loadItems(
    generation
) {

    return getGenerationDex(
        generation
    ).items.all().filter(

        item =>

            item.exists &&

            item.id

    );

}

/**
 * Gets every item ID found across
 * all supported generations.
 *
 * @returns {Array<string>}
 */
function loadItemIds() {

    const itemIds =
        new Set();

    for (

        let generation = 1;

        generation <= 9;

        generation++

    ) {

        const items =
            loadItems(
                generation
            );

        for (const item of items) {

            itemIds.add(
                item.id
            );

        }

    }

    return [

        ...itemIds

    ].sort();

}

/**
 * Loads one item as it exists
 * in the requested generation.
 *
 * @param {string} itemId
 * @param {number} generation
 * @returns {Object}
 */
function loadItem(

    itemId,

    generation

) {

    return getGenerationDex(
        generation
    ).items.get(
        itemId
    );

}

module.exports = {

    loadItem,
    loadItemIds,
    loadItems

};
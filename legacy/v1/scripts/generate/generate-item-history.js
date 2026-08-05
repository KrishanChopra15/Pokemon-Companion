const {
    getItem
} = require(
    "../utils/loaders/showdown"
);

const {
    normaliseItem
} = require(
    "../utils/normalisers/item"
);

function getItemHistory(
    itemId
) {

    const history = {};

    for (

        let generation = 1;

        generation <= 9;

        generation++

    ) {

        const item =
            getItem(
                itemId,
                generation
            );

        if (

            !item.exists ||

            item.gen > generation

        ) {

            continue;

        }

        history[generation] =
            normaliseItem(
                item,
                generation
            );

    }

    return history;

}

module.exports = {

    getItemHistory

};
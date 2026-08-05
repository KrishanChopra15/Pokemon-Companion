const {
    generateLookup
} = require("../utils/lookup");

const {
    createItemLookup
} = require("../utils/items");

const {
    printPhase,
    printError
} = require("../utils/logger");

function generateItemLookup(
    {
        verbose = true
    } = {}
) {

    return generateLookup({

        input:
            "items.json",

        output:
            "item-lookup.json",

        label:
            "Items",

        createEntry:
            createItemLookup,

        verbose

    });

}

module.exports = {

    generateItemLookup

};

if (require.main === module) {

    (async () => {

        try {

            printPhase(
                "Item Lookup Generation"
            );

            await generateItemLookup();

        }

        catch (error) {

            printError(
                error,
                "Error generating item lookup"
            );

        }

    })();

}
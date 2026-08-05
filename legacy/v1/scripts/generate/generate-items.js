const fs = require("node:fs");
const path = require("node:path");

const {
    loadItemIds
} = require(
    "../utils/loaders/item-loader"
);

const {
    getItemHistory
} = require(
    "./generate-item-history"
);

const OUTPUT_PATH = path.join(
    __dirname,
    "../../database/generated/items.json"
);

function generateItems() {

    const itemIds =
        loadItemIds();

    const items = {};

    console.log(
        `Found ${itemIds.length} items.`
    );

    for (const itemId of itemIds) {

        const history =
            getItemHistory(
                itemId
            );

        if (

            Object.keys(
                history
            ).length === 0

        ) {

            continue;

        }

        items[itemId] =
            history;

    }

    fs.mkdirSync(

        path.dirname(
            OUTPUT_PATH
        ),

        {

            recursive: true

        }

    );

    fs.writeFileSync(

        OUTPUT_PATH,

        JSON.stringify(
            items,
            null,
            2
        )

    );

    console.log(

        `Successfully generated ${
            Object.keys(
                items
            ).length
        } item histories.`

    );

    console.log(
        `Output written to:\n${OUTPUT_PATH}`
    );

}

generateItems();
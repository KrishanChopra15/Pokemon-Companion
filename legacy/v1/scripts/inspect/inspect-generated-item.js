const items = require(
    "../../database/generated/items.json"
);

const id = (

    process.argv[2] ||

    ""

).toLowerCase();

console.dir(

    items[id],

    {

        depth:
            null

    }

);
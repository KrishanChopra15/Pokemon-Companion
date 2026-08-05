const species = require(
    "../../database/generated/species.json"
);

const id = (

    process.argv[2] ||

    ""

).toLowerCase();

console.dir(

    species[id],

    {

        depth:
            null

    }

);
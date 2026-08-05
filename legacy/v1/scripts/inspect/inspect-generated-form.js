const forms = require(
    "../../database/generated/forms.json"
);

const id = (

    process.argv[2] ||

    ""

).toLowerCase();

console.dir(

    forms[id],

    {

        depth:
            null

    }

);
const {
    generateLookup
} = require("../utils/lookup");

const {
    createTypeLookup
} = require("../utils/types");

const {
    printPhase,
    printError
} = require("../utils/logger");

function generateTypeLookup(
    {
        verbose = true
    } = {}
) {

    return generateLookup({

        input:
            "types.json",

        output:
            "type-lookup.json",

        label:
            "Types",

        createEntry:
            createTypeLookup,

        verbose

    });

}

module.exports = {

    generateTypeLookup

};

if (require.main === module) {

    (async () => {

        try {

            printPhase(
                "Type Lookup Generation"
            );

            await generateTypeLookup();

        }

        catch (error) {

            printError(
                error,
                "Error generating type lookup"
            );

        }

    })();

}
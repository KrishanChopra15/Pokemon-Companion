const {
    generateLookup
} = require("../utils/lookup");

const {
    createSpeciesLookup
} = require("../utils/build-species");

const {
    printPhase,
    printError
} = require("../utils/logger");

function generateSpeciesLookup(
    {
        verbose = true
    } = {}
) {

    return generateLookup({

        input:
            "species.json",

        output:
            "species-lookup.json",

        label:
            "Species",

        createEntry:
            createSpeciesLookup,

        verbose

    });

}

module.exports = {

    generateSpeciesLookup

};

if (require.main === module) {

    (async () => {

        try {

            printPhase(
                "Species Lookup Generation"
            );

            await generateSpeciesLookup();

        }

        catch (error) {

            printError(
                error,
                "Error generating species lookup"
            );

        }

    })();

}
const {
    generateLookup
} = require("../utils/lookup");

const {
    createMoveLookup
} = require("../utils/moves");

const {
    printPhase,
    printError
} = require("../utils/logger");

function generateMoveLookup(
    {
        verbose = true
    } = {}
) {

    return generateLookup({

        input:
            "moves.json",

        output:
            "move-lookup.json",

        label:
            "Moves",

        createEntry:
            createMoveLookup,

        verbose

    });

}

module.exports = {

    generateMoveLookup

};

if (require.main === module) {

    (async () => {

        try {

            printPhase(
                "Move Lookup Generation"
            );

            await generateMoveLookup();

        }

        catch (error) {

            printError(
                error,
                "Error generating move lookup"
            );

        }

    })();

}
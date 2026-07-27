const {
    generateLookup
} = require("../utils/lookup");

const {
    createAbilityLookup
} = require("../utils/abilities");

const {
    printPhase,
    printError
} = require("../utils/logger");

function generateAbilityLookup(
    {
        verbose = true
    } = {}
) {

    return generateLookup({

        input:
            "abilities.json",

        output:
            "ability-lookup.json",

        label:
            "Abilities",

        createEntry:
            createAbilityLookup,

        verbose

    });

}

module.exports = {

    generateAbilityLookup

};

if (require.main === module) {

    (async () => {

        try {

            printPhase(
                "Ability Lookup Generation"
            );

            await generateAbilityLookup();

        }

        catch (error) {

            printError(
                error,
                "Error generating ability lookup"
            );

        }

    })();

}
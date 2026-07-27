const relationships =
    require("../config/relationships");

const {
    generateRelationship
} = require("../utils/relationship");

const {
    printError,
    printPhase,
    printPipelineSuccess
} = require("../utils/logger");

async function generateRelationships(
    {
        verbose = true
    } = {}
) {

    let total = 0;

    for (const relationship of relationships) {

        const result =
            generateRelationship({

                ...relationship,

                verbose

            });

        if (!result.success) {

            return result;

        }

        total += result.count;

    }

    if (verbose) {

        printPipelineSuccess(
            "Relationship Generation"
        );

    }

    return {

        success: true,

        count: total,

        message:
            `${relationships.length} relationship databases generated`

    };

}

module.exports = {

    generateRelationships

};

if (require.main === module) {

    (async () => {

        try {

            printPhase(
                "Relationship Generation"
            );

            await generateRelationships();

        }

        catch (error) {

            printError(
                error,
                "Relationship Generation"
            );

        }

    })();

}
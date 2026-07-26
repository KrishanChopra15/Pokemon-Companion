const {
    printPhase,
    printSuccess,
    printError,
    printPipelineStep,
    printPipelineSuccess,
    formatElapsedTime,
    printPipelineFooter,
    printSummary
} = require("../utils/logger");

const {
    validateDatabase
} = require("../validate/validate-database");

const {
    validateEvolutions
} = require("../validate/validate-evolutions");

const PIPELINE = [

    {
        name: "Database",
        icon: "🗃",
        action: validateDatabase,
        label: "Database validated"
    },

    {
        name: "Evolution Graph",
        icon: "🧬",
        action: validateEvolutions,
        label: "evolution records validated"
    }

];

async function validateAll(
    {
        nested = false
    } = {}
) {

    const startTime =
        Date.now();

    const summary = [];

    try {

        if (!nested) {

            printPhase(
                "Pokémon Companion Validation Pipeline"
            );

        }

        for (

            let index = 0;

            index < PIPELINE.length;

            index++

        ) {

            const step =
                PIPELINE[index];

            printPipelineStep(

                index + 1,

                PIPELINE.length,

                `${step.icon} ${step.name}`

            );

            const result =
                await step.action({

                    verbose: false

                });

            if (

                !result ||

                !result.success

            ) {

                throw (

                    result?.error ??

                    new Error(
                        `${step.name} validation failed.`
                    )

                );

            }

            const successMessage =

                result.message ||

                (

                    typeof result.count === "number"

                        ? `${result.count} ${step.label}`

                        : step.label

                );

            printPipelineSuccess(
                successMessage
            );

            summary.push({

                label: step.name,

                value:

                    typeof result.count === "number"

                        ? String(
                            result.count
                        )

                        : "Passed"

            });

        }

        const elapsed =
            formatElapsedTime(

                Date.now() -
                startTime

            );

        if (!nested) {

            printPipelineFooter(

                elapsed,

                PIPELINE.length,

                PIPELINE.length

            );

            printSummary(

                "Validation Summary",

                summary

            );

            printSuccess(
                "Pokémon Companion database validation passed."
            );

        }

        return {

            success: true,

            elapsed

        };

    }

    catch (error) {

        if (!nested) {

            printError(
                error,
                "Validation pipeline failed"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    validateAll

};

if (require.main === module) {

    validateAll();

}
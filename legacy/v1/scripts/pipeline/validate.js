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

/**
 * Validation execution order.
 *
 * Keep this list ordered by dependency.
 */

const VALIDATION_PIPELINE = Object.freeze([

    Object.freeze({
        id: "database",
        name: "Database",
        icon: "🗃️",
        action: validateDatabase
    }),

    Object.freeze({
        id: "evolution-graph",
        name: "Evolution Graph",
        icon: "🧬",
        action: validateEvolutions
    })

]);

const TOTAL_STEPS =
    VALIDATION_PIPELINE.length;

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

        let stepNumber = 0;

        for (

            const step of VALIDATION_PIPELINE

        ) {

            stepNumber++;

            printPipelineStep(

                stepNumber,

                TOTAL_STEPS,

                `${step.icon} ${step.name}`

            );

            const result =
                await step.action({

                    verbose: false

                });

            if (!result?.success) {

                throw (

                    result?.error ??

                    new Error(
                        `${step.name} validation failed.`
                    )

                );

            }

            const successMessage =

                result.message ??

                `${step.name} completed`;

            printPipelineSuccess(
                successMessage
            );

            summary.push({

                label:
                    `${step.icon} ${step.name}`,

                value:

                    typeof result.count === "number"

                        ? result.count.toLocaleString()

                        : result.elapsed ??

                          "✓"

            });

        }

        const elapsed =
            formatElapsedTime(

                Date.now() -
                startTime

            );

        if (!nested) {

            printPipelineFooter(
                elapsed
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

            elapsed,

            message:
                "Validation completed"

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
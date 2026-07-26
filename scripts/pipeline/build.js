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
    downloadAll
} = require("./download");

const {
    generateAll
} = require("./generate");

const {
    validateAll
} = require("./validate");

const PIPELINE = [

    {
        name: "Download",
        icon: "📥",
        action: downloadAll,
        label: "Download completed"
    },

    {
        name: "Generate",
        icon: "⚙",
        action: generateAll,
        label: "Generation completed"
    },

    {
        name: "Validate",
        icon: "✅",
        action: validateAll,
        label: "Validation completed"
    }

];

async function buildAll(
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
                "Pokémon Companion Build Pipeline"
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

                    nested: true

                });

            if (

                !result ||

                !result.success

            ) {

                throw (

                    result?.error ??

                    new Error(
                        `${step.name} pipeline failed.`
                    )

                );

            }

            printPipelineSuccess(
                step.label
            );

            summary.push({

                label: step.name,

                value:

                    result.elapsed ||

                    "Completed"

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

                "Build Summary",

                summary

            );

            printSuccess(
                "Pokémon Companion build completed successfully."
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
                "Build pipeline failed"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    buildAll

};

if (require.main === module) {

    buildAll();

}
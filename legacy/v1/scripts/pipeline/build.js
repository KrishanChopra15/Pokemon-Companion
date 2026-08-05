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

const BUILD_PIPELINE = [

    {
        name: "Download",
        icon: "📥",
        action: downloadAll,
        label: "Download completed"
    },

    {
        name: "Generate",
        icon: "⚙️",
        action: generateAll,
        label: "Generation completed"
    },

    {
        name: "Validate",
        icon: "🛡️",
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

            index < BUILD_PIPELINE.length;

            index++

        ) {

            const step =
                BUILD_PIPELINE[index];

            printPipelineStep(

                index + 1,

                BUILD_PIPELINE.length,

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

            const successMessage =

                result.message ??

                step.label;

            printPipelineSuccess(
                successMessage
            );

            summary.push({

                label:
                    `${step.icon} ${step.name}`,

                value:
                    result.elapsed

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

                BUILD_PIPELINE.length,

                BUILD_PIPELINE.length

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

            elapsed,

            message:
                "Build completed"

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
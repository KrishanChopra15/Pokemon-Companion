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
    generatePokemonIndex
} = require("../generate/generate-pokemon-index");

const {
    generateCategoryIndexes
} = require("../generate/generate-category-index");

const {
    generateSpeciesForms
} = require("../generate/generate-species-forms");

const {
    generateEvolutionGraph
} = require("../generate/generate-evolution-graph");

const {
    generateLearnsetDatabase
} = require("../generate/generate-learnset-database");

const PIPELINE = [

    {
        name: "Pokémon Index",
        icon: "📚",
        action: generatePokemonIndex,
        label: "Pokémon indexed"
    },

    {
        name: "Category Indexes",
        icon: "🗂",
        action: generateCategoryIndexes,
        label: "category indexes generated"
    },

    {
        name: "Species Forms",
        icon: "📝",
        action: generateSpeciesForms,
        label: "species forms generated"
    },

    {
        name: "Evolution Graph",
        icon: "🧬",
        action: generateEvolutionGraph,
        label: "evolution entries generated"
    },

    {
        name: "Learnset Database",
        icon: "📖",
        action: generateLearnsetDatabase,
        label: "learnset databases generated"
    }

];

async function generateAll(
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
                "Pokémon Companion Generation Pipeline"
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

                result.success === false

            ) {

                throw (

                    result?.error ??

                    new Error(
                        `${step.name} failed.`
                    )

                );

            }

            const successMessage =

                result.message ||

                (

                    typeof result.count === "number"

                        ? `${result.count} ${step.label}`

                        : `${step.name} completed`

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

                        : "Completed"

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

                "Generation Summary",

                summary

            );

            printSuccess(
                "Pokémon Companion generated data is up to date."
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
                "Generation pipeline failed"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    generateAll

};

if (require.main === module) {

    generateAll();

}
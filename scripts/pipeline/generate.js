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

const {
    generateManifest
} = require("../generate/generate-manifest");

/**
 * Generation execution order.
 *
 * Keep this list ordered by dependency.
 */

const GENERATION_PIPELINE = Object.freeze([

    Object.freeze({
        id: "pokemon-index",
        name: "Pokémon Index",
        icon: "📚",
        action: generatePokemonIndex
    }),

    Object.freeze({
        id: "category-indexes",
        name: "Category Indexes",
        icon: "🗂️",
        action: generateCategoryIndexes
    }),

    Object.freeze({
        id: "species-forms",
        name: "Species Forms",
        icon: "📝",
        action: generateSpeciesForms
    }),

    Object.freeze({
        id: "evolution-graph",
        name: "Evolution Graph",
        icon: "🧬",
        action: generateEvolutionGraph
    }),

    Object.freeze({
        id: "learnset-database",
        name: "Learnset Database",
        icon: "📖",
        action: generateLearnsetDatabase
    }),

    Object.freeze({
        id: "manifest",
        name: "Manifest",
        icon: "📦",
        action: generateManifest
    })


]);

const TOTAL_STEPS =
    GENERATION_PIPELINE.length;

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

        let stepNumber = 0;

        for (

            const step of GENERATION_PIPELINE

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
                        `${step.name} failed.`
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

                "Generation Summary",

                summary

            );

            printSuccess(
                "Pokémon Companion generated data is up to date."
            );

        }

        return {

            success: true,

            elapsed,

            message:
                "Generation completed"

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
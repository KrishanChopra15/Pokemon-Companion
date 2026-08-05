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
    downloadPokemon
} = require("../download/download-pokemon");

const {
    downloadSpecies
} = require("../download/download-species");

const {
    downloadMoves
} = require("../download/download-moves");

const {
    downloadEvolutions
} = require("../download/download-evolutions");

const {
    downloadLearnsets
} = require("../download/download-learnsets");

const {
    downloadMachines
} = require("../download/download-machines");

const {
    downloadVersionGroups
} = require("../download/download-version-groups");

const {
    downloadGames
} = require("../download/download-games");

const {
    downloadTypes
} = require("../download/download-types");

const {
    downloadLegacyTypes
} = require("../download/legacy/download-legacy-types");

const {
    downloadDamageClasses
} = require("../download/download-damage-classes");

const {
    downloadMoveTargets
} = require("../download/download-move-targets");

const {
    downloadAbilities
} = require("../download/download-abilities");

const {
    downloadAbilityHistory
} = require("../download/download-ability-history");

const {
    downloadMoveHistory
} = require("../download/download-move-history");

const {
    downloadMoveEffectHistory
} = require("../download/download-move-effect-history");

const {
    downloadForms
} = require("../download/download-forms");

const {
    downloadItems
} = require("../download/download-items");

const {
    downloadLocations
} = require("../download/download-locations");

const {
    downloadSprites
} = require("../download/download-sprites");

/**
 * Download execution order.
 *
 * Keep this list ordered by dependency.
 * Earlier resources may be required by later downloaders.
 */

const DOWNLOAD_PIPELINE = Object.freeze([

    Object.freeze({
        id: "version-groups",
        name: "Version Groups",
        icon: "📦",
        action: downloadVersionGroups,
    }),

    Object.freeze({
        id: "games",
        name: "Games",
        icon: "🎮",
        action: downloadGames,
    }),

    Object.freeze({
        id: "types",
        name: "Types",
        icon: "🎨",
        action: downloadTypes,
    }),

    Object.freeze({
        id: "legacy-types",
        name: "Legacy Types",
        icon: "🎨",
        action: downloadLegacyTypes,
    }),

    Object.freeze({
        id: "damage-classes",
        name: "Damage Classes",
        icon: "⚔️",
        action: downloadDamageClasses,
    }),

    Object.freeze({
        id: "move-targets",
        name: "Move Targets",
        icon: "🎯",
        action: downloadMoveTargets,
    }),

    Object.freeze({
        id: "abilities",
        name: "Abilities",
        icon: "✨",
        action: downloadAbilities,
    }),

    Object.freeze({
        id: "ability-history",
        name: "Ability History",
        icon: "📜",
        action: downloadAbilityHistory,
    }),

    Object.freeze({
        id: "moves",
        name: "Moves",
        icon: "💥",
        action: downloadMoves,
    }),

    Object.freeze({
        id: "move-history",
        name: "Move History",
        icon: "📜",
        action: downloadMoveHistory,
    }),

    Object.freeze({
        id: "move-effect-history",
        name: "Move Effect History",
        icon: "📜",
        action: downloadMoveEffectHistory,
    }),

    Object.freeze({
        id: "pokemon",
        name: "Pokémon",
        icon: "⚪",
        action: downloadPokemon,
    }),

    Object.freeze({
        id: "species",
        name: "Species",
        icon: "📖",
        action: downloadSpecies,
    }),

    Object.freeze({
        id: "forms",
        name: "Forms",
        icon: "📝",
        action: downloadForms,
    }),

    Object.freeze({
        id: "sprites",
        name: "Sprites",
        icon: "🖼️",
        action: downloadSprites,
    }),

    Object.freeze({
        id: "evolution-chains",
        name: "Evolution Chains",
        icon: "🧬",
        action: downloadEvolutions,
    }),

    Object.freeze({
        id: "learnsets",
        name: "Learnsets",
        icon: "📚",
        action: downloadLearnsets,
    }),

    Object.freeze({
        id: "machines",
        name: "Machines",
        icon: "💿",
        action: downloadMachines,
    }),

    Object.freeze({
        id: "items",
        name: "Items",
        icon: "🎒",
        action: downloadItems,
    }),

    Object.freeze({
        id: "locations",
        name: "Locations",
        icon: "🗺️",
        action: downloadLocations,
    })

]);

const TOTAL_STEPS =
    DOWNLOAD_PIPELINE.length;

async function downloadAll(
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
                "Pokémon Companion Download Pipeline"
            );

        }

            let stepNumber = 1;

            for (
            
                const step of DOWNLOAD_PIPELINE
            
            ) {
            
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
            
            stepNumber++;

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

                "Download Summary",

                summary

            );

            printSuccess(
                "Pokémon Companion database is up to date."
            );

        }

        return {
        
            success: true,
        
            elapsed,
        
            message:
                "Download completed"
        
        };

    }

    catch (error) {

        if (!nested) {

            printError(
                error,
                "Download pipeline failed"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadAll

};

if (require.main === module) {

    downloadAll();

}
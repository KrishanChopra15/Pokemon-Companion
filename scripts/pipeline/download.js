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

const PIPELINE = [

    {
        name: "Version Groups",
        icon: "📦",
        action: downloadVersionGroups,
        label: "version groups"
    },

    {
        name: "Games",
        icon: "🎮",
        action: downloadGames,
        label: "games"
    },

    {
        name: "Types",
        icon: "🎨",
        action: downloadTypes,
        label: "types"
    },

    {
        name: "Legacy Types",
        icon: "🎨",
        action: downloadLegacyTypes,
        label: "legacy types"
    },

    {
        name: "Damage Classes",
        icon: "⚔",
        action: downloadDamageClasses,
        label: "damage classes"
    },

    {
        name: "Move Targets",
        icon: "🎯",
        action: downloadMoveTargets,
        label: "move targets"
    },

    {
        name: "Abilities",
        icon: "✨",
        action: downloadAbilities,
        label: "abilities"
    },

    {
        name: "Ability History",
        icon: "📜",
        action: downloadAbilityHistory,
        label: "ability history entries"
    },

    {
        name: "Moves",
        icon: "💥",
        action: downloadMoves,
        label: "moves"
    },

    {
        name: "Move History",
        icon: "📜",
        action: downloadMoveHistory,
        label: "move history entries"
    },

    {
        name: "Move Effect History",
        icon: "📜",
        action: downloadMoveEffectHistory,
        label: "move effect history entries"
    },

    {
        name: "Pokémon",
        icon: "⚪",
        action: downloadPokemon,
        label: "Pokémon"
    },

    {
        name: "Species",
        icon: "📖",
        action: downloadSpecies,
        label: "species"
    },

    {
        name: "Forms",
        icon: "📝",
        action: downloadForms,
        label: "forms"
    },

    {
        name: "Sprites",
        icon: "🖼",
        action: downloadSprites,
        label: "sprite records"
    },

    {
        name: "Evolution Chains",
        icon: "🧬",
        action: downloadEvolutions,
        label: "evolution chains"
    },

    {
        name: "Learnsets",
        icon: "📚",
        action: downloadLearnsets,
        label: "learnsets"
    },

    {
        name: "Machines",
        icon: "💿",
        action: downloadMachines,
        label: "machines"
    },

    {
        name: "Items",
        icon: "🎒",
        action: downloadItems,
        label: "items"
    },

    {
        name: "Locations",
        icon: "🗺",
        action: downloadLocations,
        label: "locations"
    }

];

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
                        `${step.name} failed.`
                    )

                );

            }

            const successMessage =

                result.message ||

                (

                    typeof result.count === "number"

                        ? `${result.count} ${step.label} downloaded`

                        : `${step.name} completed`

                );

            printPipelineSuccess(
                successMessage
            );

            summary.push({

                label: step.name,

                value: String(
                    result.count
                )

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

                "Download Summary",

                summary

            );

            printSuccess(
                "Pokémon Companion database is up to date."
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
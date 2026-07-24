const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    formatApiName,
    cleanFlavorText
} = require("../utils/formatting");

const {
    getIdFromUrl,
    findEnglishEntry,
    sortById
} = require("../utils/helpers");

const {
    getResource,
    getResourceList
} = require("../utils/api");

const {
    createGenerationReference,
    createNamedApiReference
} = require("../utils/references");

const {
    buildFlavorMap,
    buildMoveHistory,
    buildMoveVersions,
    createMoveFlags,
    createMoveContest,
    createMoveMeta,
    createStatChanges
} = require("../utils/moves");

const {
    printSuccess,
    printOutputFile,
    printError
} = require("../utils/logger");

const versionGroups = require(
    "../../database/version-groups.json"
);

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/moves.json"
);

async function downloadMoves() {

    try {

        const moves = [];

        const moveResources =
            await getResourceList(
                "move"
            );

        for (const moveResource of moveResources) {

            const id =
                getIdFromUrl(
                    moveResource.url
                );

            console.log(
                `Downloading Move #${id}...`
            );

            const move =
                await getResource(
                    "move",
                    id
                );

            const englishEffect =
                findEnglishEntry(
                    move.effect_entries
                );

            const history =
                buildMoveHistory(
                    move.past_values,
                    versionGroups
                );

            const flavorMap =
                buildFlavorMap(
                    move.flavor_text_entries
                );

            const versions =
                buildMoveVersions(
                    move,
                    history,
                    flavorMap,
                    versionGroups
                );

            moves.push({

                id:
                    move.id,

                name:
                    formatApiName(
                        move.name
                    ),

                generation:
                    createGenerationReference(
                        move.generation
                    ),

                type:
                    createNamedApiReference(
                        move.type
                    ),

                damageClass:
                    createNamedApiReference(
                        move.damage_class
                    ),

                target:
                    createNamedApiReference(
                        move.target
                    ),

                priority:
                    move.priority,

                flags:
                    createMoveFlags(
                        move.flags
                    ),

                contest:
                    createMoveContest(
                        move
                    ),

                meta:
                    createMoveMeta(
                        move.meta
                    ),

                statChanges:
                    createStatChanges(
                        move.stat_changes
                    ),

                effect:
                    cleanFlavorText(
                        englishEffect?.effect
                    ),

                shortEffect:
                    cleanFlavorText(
                        englishEffect?.short_effect
                    ),

                versions

            });

        }

        sortById(
            moves
        );

        saveJSON(
            OUTPUT_FILE,
            moves
        );

        printSuccess(
            `Downloaded ${moves.length} moves`
        );

        printOutputFile(
            OUTPUT_FILE
        );

    } catch (error) {

        printError(
            error,
            "Error downloading moves"
        );

    }

}

downloadMoves();
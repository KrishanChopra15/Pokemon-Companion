const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    formatGameName
} = require("../utils/formatting");

const {
    getIdFromUrl,
    sortById
} = require("../utils/helpers");

const {
    getResource,
    getResourceList
} = require("../utils/api");

const {
    createVersionGroupReference
} = require("../utils/references");

const {
    printSuccess,
    printOutputFile,
    printError,
    printVerbose
} = require("../utils/logger");

const versionGroups = require(
    "../../database/version-groups.json"
);

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/games.json"
);

const versionGroupApiMap =
    new Map(

        versionGroups.map(
            versionGroup => [

                versionGroup.apiName,

                versionGroup

            ]
        )

    );

async function downloadGames(
    {
        verbose = true
    } = {}
) {

    try {

        const games = [];

        const gameResources =
            await getResourceList(
                "version"
            );

        for (const gameResource of gameResources) {

            const id =
                getIdFromUrl(
                    gameResource.url
                );

            if (verbose) {

                printVerbose(
                    `Downloading Game #${id}...`
                );

            }

            const game =
                await getResource(
                    "version",
                    id
                );

            const versionGroup =
                versionGroupApiMap.get(
                    game.version_group.name
                );

            games.push({

                id:
                    game.id,

                apiName:
                    game.name,

                name:
                    formatGameName(
                        game.name
                    ),

                generation:
                    versionGroup?.generation ??
                    null,

                versionGroup:
                    createVersionGroupReference(
                        versionGroup,
                        true
                    )

            });

        }

        sortById(
            games
        );

        saveJSON(
            OUTPUT_FILE,
            games
        );

        if (verbose) {

            printSuccess(
                `Downloaded ${games.length} games`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                games.length,

            output:
                OUTPUT_FILE,

            message:
                `${games.length} games downloaded`

        };

    }

    catch (error) {

        if (verbose) {

            printError(
                error,
                "Error downloading games"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadGames

};

if (require.main === module) {

    downloadGames();

}
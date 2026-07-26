const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    formatApiName
} = require("../utils/formatting");

const {
    getIdFromUrl,
    findEnglishEntry,
    createReferenceList,
    sortById
} = require("../utils/helpers");

const {
    getResource,
    getResourceList
} = require("../utils/api");

const {
    createGenerationReference,
    createLocationReference,
    createNamedApiReference,
    createRegionReference
} = require("../utils/references");

const {
    printSuccess,
    printOutputFile,
    printError,
    printVerbose
} = require("../utils/logger");

const LOCATIONS_OUTPUT_FILE = path.join(
    __dirname,
    "../../database/locations.json"
);

const LOCATION_AREAS_OUTPUT_FILE = path.join(
    __dirname,
    "../../database/location-areas.json"
);

function createGameIndexes(
    gameIndexes = []
) {

    return gameIndexes.map(
        gameIndex => ({

            generation:
                createGenerationReference(
                    gameIndex.generation
                ),

            gameIndex:
                gameIndex.game_index

        })
    );

}

function createEncounterMethods(
    encounterMethodRates = []
) {

    return encounterMethodRates.map(
        encounterMethodRate => ({

            method:
                createNamedApiReference(
                    encounterMethodRate.encounter_method
                ),

            versions:

                encounterMethodRate.version_details.map(
                    versionDetail => ({

                        game:
                            createNamedApiReference(
                                versionDetail.version
                            ),

                        rate:
                            versionDetail.rate

                    })
                )

        })
    );

}

function createLocationAreaName(
    locationArea
) {

    const englishName =
        findEnglishEntry(
            locationArea.names
        )?.name;

    return englishName ||
        formatApiName(
            locationArea.name
        );

}

async function downloadLocations(
    {
        verbose = true
    } = {}
) {

    try {

        const locations = [];

        const locationAreas = [];

        const locationResources =
            await getResourceList(
                "location"
            );

        for (const locationResource of locationResources) {

            const id =
                getIdFromUrl(
                    locationResource.url
                );

            if (verbose) {

                printVerbose(
                    `Downloading Location #${id}...`
                );

            }

            const location =
                await getResource(
                    "location",
                    id
                );

            locations.push({

                id:
                    location.id,

                apiName:
                    location.name,

                name:
                    findEnglishEntry(
                        location.names
                    )?.name ||

                    formatApiName(
                        location.name
                    ),

                region:
                    createRegionReference(
                        location.region
                    ),

                gameIndexes:
                    createGameIndexes(
                        location.game_indices
                    ),

                areas:
                    createReferenceList(
                        location.areas,
                        createNamedApiReference
                    )

            });

        }

        const locationAreaResources =
            await getResourceList(
                "location-area"
            );

        for (const locationAreaResource of locationAreaResources) {

            const id =
                getIdFromUrl(
                    locationAreaResource.url
                );

            if (verbose) {

                printVerbose(
                    `Downloading Location Area #${id}...`
                );

            }

            const locationArea =
                await getResource(
                    "location-area",
                    id
                );

            locationAreas.push({

                id:
                    locationArea.id,

                apiName:
                    locationArea.name,

                name:
                    createLocationAreaName(
                        locationArea
                    ),

                gameIndex:
                    locationArea.game_index,

                location:
                    createLocationReference(
                        locationArea.location
                    ),

                encounterMethods:
                    createEncounterMethods(
                        locationArea.encounter_method_rates
                    )

            });

        }

        sortById(
            locations
        );

        sortById(
            locationAreas
        );

        saveJSON(
            LOCATIONS_OUTPUT_FILE,
            locations
        );

        saveJSON(
            LOCATION_AREAS_OUTPUT_FILE,
            locationAreas
        );

        if (verbose) {

            printSuccess(
                `Downloaded ${locations.length} locations and ${locationAreas.length} location areas`
            );

            printOutputFile(
                LOCATIONS_OUTPUT_FILE
            );

            printOutputFile(
                LOCATION_AREAS_OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                locations.length,

            areaCount:
                locationAreas.length,

            output: [

                LOCATIONS_OUTPUT_FILE,

                LOCATION_AREAS_OUTPUT_FILE

            ],

            message:
                `${locations.length} locations and ${locationAreas.length} location areas downloaded`

        };

    }

    catch (error) {

        if (verbose) {

            printError(
                error,
                "Error downloading locations"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadLocations

};

if (require.main === module) {

    downloadLocations();

}
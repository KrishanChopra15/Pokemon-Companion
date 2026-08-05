const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    formatApiName,
    cleanEffectText
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
    createNamedApiReference,
    createPokemonReference
} = require("../utils/references");

const {
    printSuccess,
    printOutputFile,
    printError,
    printVerbose
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/items.json"
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

function createHeldByPokemon(
    holders = []
) {

    return holders.map(
        holder => ({

            pokemon:
                createPokemonReference(
                    holder.pokemon
                ),

            versions:

                holder.version_details.map(
                    detail => ({

                        rarity:
                            detail.rarity,

                        game:
                            createNamedApiReference(
                                detail.version
                            )

                    })
                )

        })
    );

}

function createMachines(
    machines = []
) {

    return machines.map(
        machine => ({

            id:
                getIdFromUrl(
                    machine.machine.url
                ),

            versionGroup:
                createNamedApiReference(
                    machine.version_group
                )

        })
    );

}

async function downloadItems(
    {
        verbose = true
    } = {}
) {

    try {

        const items = [];

        const itemResources =
            await getResourceList(
                "item"
            );

        for (const itemResource of itemResources) {

            const id =
                getIdFromUrl(
                    itemResource.url
                );

            if (verbose) {

                printVerbose(
                    `Downloading Item #${id}...`
                );

            }

            const item =
                await getResource(
                    "item",
                    id
                );

            const englishEffect =
                findEnglishEntry(
                    item.effect_entries
                );

            items.push({

                id:
                    item.id,

                apiName:
                    item.name,

                name:
                    formatApiName(
                        item.name
                    ),

                category:
                    createNamedApiReference(
                        item.category
                    ),

                attributes:
                    createReferenceList(
                        item.attributes,
                        createNamedApiReference
                    ),

                cost:
                    item.cost,

                flingPower:
                    item.fling_power,

                flingEffect:
                    createNamedApiReference(
                        item.fling_effect
                    ),

                effect:
                    cleanEffectText(
                        englishEffect?.effect
                    ),

                shortEffect:
                    cleanEffectText(
                        englishEffect?.short_effect
                    ),

                sprite:
                    item.sprites?.default ??
                    null,

                gameIndexes:
                    createGameIndexes(
                        item.game_indices
                    ),

                heldByPokemon:
                    createHeldByPokemon(
                        item.held_by_pokemon
                    ),

                babyTriggerFor:
                    getIdFromUrl(
                        item.baby_trigger_for?.url
                    ),

                machines:
                    createMachines(
                        item.machines
                    )

            });

        }

        sortById(
            items
        );

        saveJSON(
            OUTPUT_FILE,
            items
        );

        if (verbose) {

            printSuccess(
                `Downloaded ${items.length} items`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                items.length,

            output:
                OUTPUT_FILE,

            message:
                `${items.length} items downloaded`

        };

    }

    catch (error) {

        if (verbose) {

            printError(
                error,
                "Error downloading items"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadItems

};

if (require.main === module) {

    downloadItems();

}
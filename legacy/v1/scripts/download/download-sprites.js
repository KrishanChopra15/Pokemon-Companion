const fs = require("fs");
const path = require("path");

const {
    PNG
} = require("pngjs");

const {
    DATABASE_DIR,
    saveJSON
} = require("../utils/json");

const {
    formatGeneration,
    formatVersionGroup
} = require("../utils/formatting");

const {
    createReferenceList,
    sortById
} = require("../utils/helpers");

const {
    getResource,
    downloadFile
} = require("../utils/api");

const {
    createNamedApiReference
} = require("../utils/references");

const {
    printSuccess,
    printOutputFile,
    printError,
    printVerbose
} = require("../utils/logger");

const pokemon = require(
    "../../database/pokemon.json"
);

const species = require(
    "../../database/species.json"
);

const versionGroups = require(
    "../../database/version-groups.json"
);

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/sprites.json"
);

const ASSET_DIRECTORY = path.join(
    DATABASE_DIR,
    "assets/sprites"
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

const speciesGenerationMap =
    new Map(

        species.map(
            speciesEntry => [

                speciesEntry.id,

                speciesEntry.generation.id

            ]
        )

    );

function createGenerationDirectory(
    apiName
) {

    const generations = {

        "generation-i":
            "01-generation-i",

        "generation-ii":
            "02-generation-ii",

        "generation-iii":
            "03-generation-iii",

        "generation-iv":
            "04-generation-iv",

        "generation-v":
            "05-generation-v",

        "generation-vi":
            "06-generation-vi",

        "generation-vii":
            "07-generation-vii",

        "generation-viii":
            "08-generation-viii",

        "generation-ix":
            "09-generation-ix"

    };

    return generations[apiName] ??
        apiName;

}

function getGenerationOrder(
    apiName
) {

    const generations = {

        "generation-i": 1,

        "generation-ii": 2,

        "generation-iii": 3,

        "generation-iv": 4,

        "generation-v": 5,

        "generation-vi": 6,

        "generation-vii": 7,

        "generation-viii": 8,

        "generation-ix": 9

    };

    return generations[apiName] ??
        Number.MAX_SAFE_INTEGER;

}

function getVersionGroupOrder(
    apiName
) {

    return (

        versionGroupApiMap.get(
            apiName
        )?.order ??

        Number.MAX_SAFE_INTEGER

    );

}

function createStaticSprites(
    sprites = {}
) {

    return {

        front: {

            default:
                sprites.front_default ??
                null,

            shiny:
                sprites.front_shiny ??
                null,

            female:
                sprites.front_female ??
                null,

            shinyFemale:
                sprites.front_shiny_female ??
                null

        },

        back: {

            default:
                sprites.back_default ??
                null,

            shiny:
                sprites.back_shiny ??
                null,

            female:
                sprites.back_female ??
                null,

            shinyFemale:
                sprites.back_shiny_female ??
                null

        }

    };

}

function hasSpriteUrls(
    sprites
) {

    return Object.values(
        sprites.front
    ).some(Boolean) ||

    Object.values(
        sprites.back
    ).some(Boolean);

}

function hasDirectSprites(
    sprites = {}
) {

    return Boolean(
        sprites.front_default
    );

}

function getSpriteExtension(
    url
) {

    const extension =
        path.extname(

            new URL(
                url
            ).pathname

        );

    return extension ||
        ".png";

}

function createAssetPath(
    outputFile
) {

    return path

        .relative(

            DATABASE_DIR,

            outputFile

        )

        .split(
            path.sep
        )

        .join("/");

}

function isLegacyGeneration(
    directories
) {

    return directories.some(
        directory =>

            directory.endsWith(
                "generation-i"
            ) ||

            directory.endsWith(
                "generation-ii"
            )
    );

}

function isWhitePixel(

    data,

    index

) {

    return (

        data[index] >= 250 &&

        data[index + 1] >= 250 &&

        data[index + 2] >= 250 &&

        data[index + 3] > 0

    );

}

function removeLegacyBackground(
    file
) {

    const image =
        PNG.sync.read(
            file
        );

    const {

        width,

        height,

        data

    } = image;

    const visited =
        new Uint8Array(
            width * height
        );

    const queue = [];

    let queueIndex = 0;

    function addPixel(

        x,

        y

    ) {

        const position =
            y * width +
            x;

        const index =
            position * 4;

        if (

            visited[position] ||

            !isWhitePixel(
                data,
                index
            )

        ) {

            return;

        }

        visited[position] = 1;

        queue.push(
            position
        );

    }

    for (

        let x = 0;

        x < width;

        x++

    ) {

        addPixel(
            x,
            0
        );

        addPixel(
            x,
            height - 1
        );

    }

    for (

        let y = 0;

        y < height;

        y++

    ) {

        addPixel(
            0,
            y
        );

        addPixel(
            width - 1,
            y
        );

    }

    while (

        queueIndex <

        queue.length

    ) {

        const position =
            queue[queueIndex];

        queueIndex++;

        const x =
            position % width;

        const y =
            Math.floor(
                position / width
            );

        const index =
            position * 4;

        data[index + 3] = 0;

        if (x > 0) {

            addPixel(
                x - 1,
                y
            );

        }

        if (x < width - 1) {

            addPixel(
                x + 1,
                y
            );

        }

        if (y > 0) {

            addPixel(
                x,
                y - 1
            );

        }

        if (y < height - 1) {

            addPixel(
                x,
                y + 1
            );

        }

    }

    return PNG.sync.write(
        image
    );

}

function processLegacySprite(

    outputFile,

    extension,

    directories

) {

    if (

        extension !== ".png" ||

        !isLegacyGeneration(
            directories
        )

    ) {

        return;

    }

    const file =
        fs.readFileSync(
            outputFile
        );

    const transparentFile =
        removeLegacyBackground(
            file
        );

    fs.writeFileSync(
        outputFile,
        transparentFile
    );

}

function collectSpriteVersions(

    versions = {},

    introducedGeneration

) {

    const spriteVersions = [];

    for (

        const [

            generation,

            generationVersions

        ] of Object.entries(
            versions
        )

    ) {

        if (

            getGenerationOrder(
                generation
            ) < introducedGeneration

        ) {

            continue;

        }

        for (

            const [

                apiName,

                sprites

            ] of Object.entries(
                generationVersions
            )

        ) {

            if (

                apiName === "icons" ||

                !hasDirectSprites(
                    sprites
                )

            ) {

                continue;

            }

            spriteVersions.push({

                generation,

                apiName,

                sprites

            });

        }

    }

    return spriteVersions;

}

function createSpriteFallbacks(

    spriteVersions,

    currentGeneration,

    currentApiName,

    currentSprites = {},

    globalSprites = {}

) {

    const currentGenerationOrder =
        getGenerationOrder(
            currentGeneration
        );

    const currentVersionOrder =
        getVersionGroupOrder(
            currentApiName
        );

    const supportsShiny =
        currentGenerationOrder > 1;

    const candidates =
        spriteVersions

            .filter(
                spriteVersion =>

                    spriteVersion.apiName !==
                    currentApiName
            )

            .sort(

                (

                    first,

                    second

                ) => {

                    const firstGenerationDifference =

                        Math.abs(

                            getGenerationOrder(
                                first.generation
                            ) -

                            currentGenerationOrder

                        );

                    const secondGenerationDifference =

                        Math.abs(

                            getGenerationOrder(
                                second.generation
                            ) -

                            currentGenerationOrder

                        );

                    if (

                        firstGenerationDifference !==

                        secondGenerationDifference

                    ) {

                        return (

                            firstGenerationDifference -

                            secondGenerationDifference

                        );

                    }

                    return (

                        Math.abs(

                            getVersionGroupOrder(
                                first.apiName
                            ) -

                            currentVersionOrder

                        ) -

                        Math.abs(

                            getVersionGroupOrder(
                                second.apiName
                            ) -

                            currentVersionOrder

                        )

                    );

                }

            );

    function findFallbackSprite(
        spriteKey
    ) {

        for (const candidate of candidates) {

            const url =
                candidate.sprites[
                    spriteKey
                ];

            if (url) {

                return url;

            }

        }

        return globalSprites[
            spriteKey
        ] ?? null;

    }

    const fallback = {};

    fallback.back_default =

        currentSprites.back_default ??

        findFallbackSprite(
            "back_default"
        );

    if (!supportsShiny) {

        return fallback;

    }

    fallback.front_shiny =

        currentSprites.front_shiny ??

        findFallbackSprite(
            "front_shiny"
        );

    fallback.back_shiny =

        currentSprites.back_shiny ??

        findFallbackSprite(
            "back_shiny"
        );

    return fallback;

}

function mergeSpriteSources(

    sprites = {},

    fallback = {},

    supportsShiny = true

) {

    return {

        front_default:

            sprites.front_default ??
            null,

        front_shiny:

            supportsShiny

                ? (

                    sprites.front_shiny ??

                    fallback.front_shiny ??

                    null

                )

                : null,

        front_female:

            sprites.front_female ??
            null,

        front_shiny_female:

            supportsShiny

                ? (

                    sprites.front_shiny_female ??

                    null

                )

                : null,

        back_default:

            sprites.back_default ??

            fallback.back_default ??

            null,

        back_shiny:

            supportsShiny

                ? (

                    sprites.back_shiny ??

                    fallback.back_shiny ??

                    null

                )

                : null,

        back_female:

            sprites.back_female ??
            null,

        back_shiny_female:

            supportsShiny

                ? (

                    sprites.back_shiny_female ??

                    null

                )

                : null

    };

}

async function downloadSprite(

    url,

    directories,

    name

) {

    if (!url) {

        return null;

    }

    const extension =
        getSpriteExtension(
            url
        );

    const outputFile = path.join(

        ASSET_DIRECTORY,

        ...directories,

        `${name}${extension}`

    );

    if (

        !fs.existsSync(
            outputFile
        )

    ) {

        fs.mkdirSync(

            path.dirname(
                outputFile
            ),

            {

                recursive: true

            }

        );

        const file =
            await downloadFile(
                url
            );

        fs.writeFileSync(
            outputFile,
            file
        );

    }

    processLegacySprite(

        outputFile,

        extension,

        directories

    );

    return createAssetPath(
        outputFile
    );

}

async function downloadStaticSprites(

    sprites,

    directories

) {

    return {

        front: {

            default:
                await downloadSprite(

                    sprites.front_default,

                    directories,

                    "front-default"

                ),

            shiny:
                await downloadSprite(

                    sprites.front_shiny,

                    directories,

                    "front-shiny"

                ),

            female:
                await downloadSprite(

                    sprites.front_female,

                    directories,

                    "front-female"

                ),

            shinyFemale:
                await downloadSprite(

                    sprites.front_shiny_female,

                    directories,

                    "front-shiny-female"

                )

        },

        back: {

            default:
                await downloadSprite(

                    sprites.back_default,

                    directories,

                    "back-default"

                ),

            shiny:
                await downloadSprite(

                    sprites.back_shiny,

                    directories,

                    "back-shiny"

                ),

            female:
                await downloadSprite(

                    sprites.back_female,

                    directories,

                    "back-female"

                ),

            shinyFemale:
                await downloadSprite(

                    sprites.back_shiny_female,

                    directories,

                    "back-shiny-female"

                )

        }

    };

}

async function createSpriteSet(

    sprites = {},

    directories,

    fallbackSprites = {},

    generation

) {

    const supportsShiny =
        getGenerationOrder(
            generation
        ) > 1;

    const standardSources =
        mergeSpriteSources(

            sprites,

            fallbackSprites,

            supportsShiny

        );

    const animatedSources =
        mergeSpriteSources(

            sprites.animated,

            {},

            supportsShiny

        );

    const standard =
        createStaticSprites(
            standardSources
        );

    const animated =
        createStaticSprites(
            animatedSources
        );

    return {

        standard:

            hasSpriteUrls(
                standard
            )

                ? await downloadStaticSprites(

                    standardSources,

                    [

                        ...directories,

                        "standard"

                    ]

                )

                : null,

        animated:

            hasSpriteUrls(
                animated
            )

                ? await downloadStaticSprites(

                    animatedSources,

                    [

                        ...directories,

                        "animated"

                    ]

                )

                : null

    };

}

async function createVersionSprites(

    versions = {},

    pokemonId,

    generation,

    generationDirectory,

    spriteVersions,

    globalSprites

) {

    const result = [];

    for (

        const [

            apiName,

            sprites

        ] of Object.entries(
            versions
        )

    ) {

        if (

            apiName === "icons" ||

            !hasDirectSprites(
                sprites
            )

        ) {

            continue;

        }

        const fallbackSprites =
            createSpriteFallbacks(

                spriteVersions,

                generation,

                apiName,

                sprites,

                globalSprites

            );

        const spriteSet =
            await createSpriteSet(

                sprites,

                [

                    String(
                        pokemonId
                    ),

                    generationDirectory,

                    apiName

                ],

                fallbackSprites,

                generation

            );

        const versionGroup =
            versionGroupApiMap.get(
                apiName
            );

        result.push({

            apiName,

            name:

                versionGroup?.name ??

                formatVersionGroup(
                    apiName
                ),

            games:

                versionGroup?.games ??

                [],

            sprites:
                spriteSet

        });

    }

    return result;

}

async function createGenerationSprites(

    versions = {},

    pokemonId,

    globalSprites,

    introducedGeneration

) {

    const generations = [];

    const spriteVersions =
        collectSpriteVersions(

            versions,

            introducedGeneration

        );

    for (

        const [

            apiName,

            versionSprites

        ] of Object.entries(
            versions
        )

    ) {

        if (

            getGenerationOrder(
                apiName
            ) < introducedGeneration

        ) {

            continue;

        }

        const sprites =
            await createVersionSprites(

                versionSprites,

                pokemonId,

                apiName,

                createGenerationDirectory(
                    apiName
                ),

                spriteVersions,

                globalSprites

            );

        if (sprites.length === 0) {

            continue;

        }

        generations.push({

            apiName,

            name:
                formatGeneration(
                    apiName
                ),

            versions:
                sprites

        });

    }

    return generations;

}

async function downloadSprites(
    {
        verbose = true
    } = {}
) {

    try {

        const sprites = [];

        for (const pokemonEntry of pokemon) {

            if (verbose) {

                printVerbose(
                    `Downloading Sprites for Pokémon #${pokemonEntry.id}...`
                );

            }

            const introducedGeneration =
                speciesGenerationMap.get(
                    pokemonEntry.speciesId
                );

            if (!introducedGeneration) {

                throw new Error(
                    `Missing generation data for species #${pokemonEntry.speciesId}.`
                );

            }

            const pokemonResource =
                await getResource(

                    "pokemon",

                    pokemonEntry.id

                );

            sprites.push({

                id:
                    pokemonResource.id,

                pokemon: {

                    id:
                        pokemonEntry.id,

                    number:
                        pokemonEntry.number,

                    name:
                        pokemonEntry.name,

                    species:
                        createNamedApiReference(
                            pokemonResource.species
                        ),

                    forms:
                        createReferenceList(

                            pokemonResource.forms,

                            createNamedApiReference

                        )

                },

                generations:
                    await createGenerationSprites(

                        pokemonResource.sprites.versions,

                        pokemonEntry.id,

                        pokemonResource.sprites,

                        introducedGeneration

                    )

            });

        }

        sortById(
            sprites
        );

        saveJSON(
            OUTPUT_FILE,
            sprites
        );

        if (verbose) {

            printSuccess(
                `Downloaded sprites for ${sprites.length} Pokémon`
            );

            printOutputFile(
                OUTPUT_FILE
            );

            printOutputFile(
                ASSET_DIRECTORY
            );

        }

        return {

            success: true,

            count:
                sprites.length,

            output:
                OUTPUT_FILE,

            message:
                `Sprites for ${sprites.length} Pokémon downloaded`

        };

    }

    catch (error) {

        if (verbose) {

            printError(
                error,
                "Error downloading sprites"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadSprites

};

if (require.main === module) {

    downloadSprites();

}
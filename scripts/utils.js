const fs = require("fs");

const axios = require("axios");

const versionGroups = require(
    "../database/version-groups.json"
);

const versionGroupApiMap = new Map(
    versionGroups.map(group => [
        group.apiName,
        group
    ])
);
/* Formatting */

/**
 * Converts a string to Title Case.
 * Examples:
 * "fire" -> "Fire"
 * "medium slow" -> "Medium Slow"
 */
function toTitleCase(text) {

    if (!text) {
        return "";
    }

    return text
        .replace(/-/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());

    }

/**
 * Converts PokéAPI generation names into readable text.
 */
function formatGeneration(generation) {

    const generations = {

        "generation-i": "Generation I",
        "generation-ii": "Generation II",
        "generation-iii": "Generation III",
        "generation-iv": "Generation IV",
        "generation-v": "Generation V",
        "generation-vi": "Generation VI",
        "generation-vii": "Generation VII",
        "generation-viii": "Generation VIII",
        "generation-ix": "Generation IX"

    };

    return generations[generation] || generation;

}

/**
 * Converts PokéAPI version names into readable game names.
 */
function formatGameName(game) {

    const names = {
    
        "firered": "FireRed",
        "leafgreen": "LeafGreen",
    
        "heartgold": "HeartGold",
        "soulsilver": "SoulSilver",
    
        "lets-go-pikachu": "Let's Go Pikachu",
        "lets-go-eevee": "Let's Go Eevee",
    
        "omega-ruby": "Omega Ruby",
        "alpha-sapphire": "Alpha Sapphire",
    
        "black-2": "Black 2",
        "white-2": "White 2"
    
    };

    if (names[game]) {
        return names[game];
    }

    return game
        .split("-")
        .map(word => toTitleCase(word))
        .join(" ");

}

// TODO:
// Verify whether this helper is still needed after the
// data pipeline is fully complete. Remove if unused.
/**
 * Converts PokéAPI version-group names into readable text.
 */
function formatVersionGroup(name) {

    const names = {

        "firered-leafgreen":
            "FireRed LeafGreen",

        "heartgold-soulsilver":
            "HeartGold SoulSilver",

        "black-white":
            "Black White",

        "black-2-white-2":
            "Black 2 White 2",

        "omega-ruby-alpha-sapphire":
            "Omega Ruby Alpha Sapphire",

        "sun-moon":
            "Sun Moon",

        "ultra-sun-ultra-moon":
            "Ultra Sun Ultra Moon",

        "lets-go-pikachu-lets-go-eevee":
            "Let's Go Pikachu Let's Go Eevee",

        "sword-shield":
            "Sword Shield",

        "brilliant-diamond-shining-pearl":
            "Brilliant Diamond Shining Pearl",

        "scarlet-violet":
            "Scarlet Violet"

    };

    if (names[name]) {
        return names[name];
    }

    return name
        .split("-")
        .map(word => toTitleCase(word))
        .join(" ");

}

function formatApiName(name) {

    if (!name) {
        return "";
    }

    return toTitleCase(
        name.replace(/-/g, " ")
    );

}

/* Cleaning */

/**
 * Cleans text returned by PokéAPI.
 */
function cleanFlavorText(text) {

    if (!text) {
        return "";
    }

    return text
        .replace(/\f/g, " ")
        .replace(/\n/g, " ")
        .replace(/\r/g, " ")
        .replace(/\s+/g, " ")
        .replace(/POKéMON/g, "Pokémon")
        .replace(/\$effect_chance/g, "Effect Chance")
        .trim();

}

function cleanEffectText(
    text
) {

    if (!text) {

        return null;

    }

    return text

        // [Defense]{mechanic:defense} → Defense
        .replace(
            /\[([^\]]+)\]\{[^}]+\}/g,
            "$1"
        )

        // []{move:dig} → Dig
        .replace(
            /\[\]\{move:([^}]+)\}/g,
            (_, move) => formatApiName(move)
        )

        // []{type:normal} → Normal
        .replace(
            /\[\]\{type:([^}]+)\}/g,
            (_, type) => formatApiName(type)
        )

        .replace(
            /\[\]\{ability:([^}]+)\}/g,
            (_, ability) => formatApiName(
                ability
            )
        )

        // Remove extra spaces
        .replace(
            /\s+/g,
            " "
        )

        .trim();
}

/* JSON */

/**
 * Saves JSON data to a file.
 */
function saveJSON(filePath, data) {

    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 4),
        "utf8"
    );

}

/* General Utilities */

// TODO:
// Verify whether this helper is still needed after the
// data pipeline is fully complete. Remove if unused.
/**
 * Converts an array of objects with a `name` property
 * into a sorted array of Title Case names.
 */
function sortTitleCaseNames(array) {

    return array
        .map(item =>
            typeof item === "string"
                ? toTitleCase(item)
                : toTitleCase(item.name)
        )
        .sort();

}

function hasFlag(flags, name) {

    return (flags ?? []).some(
        flag => flag.name === name
    );

}

/**
 * Extracts the numeric ID from a PokéAPI URL.
 * Example:
 * https://pokeapi.co/api/v2/type/10/
 * -> 10
 */
function getIdFromUrl(url) {

    if (!url) {
        return null;
    }

    return Number(
        url
            .split("/")
            .filter(Boolean)
            .pop()
    );

}

function createLookupMap(
    primary,
    legacy = []
) {

    return new Map([
        ...primary.map(item => [
            item.id,
            item
        ]),
        ...legacy.map(item => [
            item.id,
            item
        ])
    ]);

}

/* Reference Builders */

/**
 * Creates a lightweight reference object
 * from a PokéAPI resource or local database object.
 */
function createNamedApiReference(
    resource
) {

    if (!resource) {

        return null;

    }

    return {

        id:
            resource.id ??
            getIdFromUrl(
                resource.url
            ),

        name: formatApiName(
            resource.name
        )

    };

}

function createVersionGroupReference(
    versionGroup,
    includeOrder = false
) {

    if (!versionGroup) {

        return null;

    }

    const reference = {

        id: versionGroup.id,

        apiName: versionGroup.apiName,

        name: versionGroup.name

    };

    if (includeOrder) {

        reference.order =
            versionGroup.order;

    }

    return reference;

}

/**
 * Creates a Generation reference.
 */
function createGenerationReference(
    generation
) {

    if (!generation) {

        return null;

    }

    return {

        id: getIdFromUrl(
            generation.url
        ),

        name: formatGeneration(
            generation.name
        )

    };

}

function createGameReference(
    game
) {

    return createNamedApiReference(
        game
    );

}

function createPokemonReference(
    pokemon
) {

    if (!pokemon) {

        return null;

    }

    return getIdFromUrl(
        pokemon.url
    );

}

function createTypeReference(
    type
) {

    if (!type) {

        return null;

    }

    const reference =
        createNamedApiReference(
            type
        );

    if (type.legacy) {

        reference.legacy = true;

    }

    return reference;

}

function createTargetReference(
    target
) {

    return createNamedApiReference(
        target
    );

}

/**
 * Returns all resources for a PokéAPI endpoint.
 */
async function getResourceList(
    endpoint
) {

    const {
        data
    } = await axios.get(
        `https://pokeapi.co/api/v2/${endpoint}?limit=100000`
    );

    return data.results;

}

/**
 * Creates a lookup that maps each
 * version name to its version group.
 */
async function getVersionGroupLookup() {

    const versions =
        await getResourceList(
            "version"
        );

    const lookup = new Map();

    for (const version of versions) {

        const id = getIdFromUrl(
            version.url
        );

        const {
            data
        } = await axios.get(
            `https://pokeapi.co/api/v2/version/${id}`
        );

        const versionGroup =
            versionGroupApiMap.get(
                data.version_group.name
            );

        lookup.set(

            data.name,

            createVersionGroupReference(
                versionGroup,
                true
            )

        );

    }

    return lookup;

}

module.exports = {

    toTitleCase,
    formatGeneration,
    formatGameName,
    formatVersionGroup,
    formatApiName,

    cleanFlavorText,
    cleanEffectText,

    saveJSON,

    sortTitleCaseNames,
    hasFlag,
    getIdFromUrl,
    createLookupMap,

    createNamedApiReference,
    createVersionGroupReference,
    createGenerationReference,
    createGameReference,
    createPokemonReference,
    createTypeReference,
    createTargetReference,

    getResourceList,
    getVersionGroupLookup
};
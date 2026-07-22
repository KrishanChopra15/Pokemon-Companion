const fs = require("fs");

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




module.exports = {

    toTitleCase,
    getIdFromUrl,
    formatGeneration,
    formatGameName,
    formatVersionGroup,
    formatApiName,
    cleanFlavorText,
    saveJSON,
    sortTitleCaseNames

};
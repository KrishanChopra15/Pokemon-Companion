/**
 * Formatting Utilities
 *
 * Helpers for formatting and cleaning text returned by
 * PokéAPI or stored in the local database.
 */

/* ---------------------------------- */
/* Text Formatting                    */
/* ---------------------------------- */

/**
 * Converts a string to Title Case.
 *
 * Examples:
 * fire -> Fire
 * medium slow -> Medium Slow
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
 * Converts a PokéAPI generation identifier
 * into a readable generation name.
 *
 * Example:
 * generation-iii -> Generation III
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

    return generations[generation] ?? generation;

}

/**
 * Converts a PokéAPI version name
 * into a readable game name.
 *
 * Example:
 * heartgold -> HeartGold
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
        .map(toTitleCase)
        .join(" ");

}

/**
 * Converts a PokéAPI version-group
 * identifier into readable text.
 *
 * Example:
 * black-2-white-2 -> Black 2 White 2
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
        .map(toTitleCase)
        .join(" ");

}

/**
 * Converts a PokéAPI identifier
 * into readable text.
 *
 * Example:
 * solar-power -> Solar Power
 */
function formatApiName(name) {

    if (!name) {
        return "";
    }

    return toTitleCase(
        name.replace(/-/g, " ")
    );

}

function formatNationalDexNumber(id) {

    return `#${String(id).padStart(4, "0")}`;

}

/* ---------------------------------- */
/* Text Cleaning                      */
/* ---------------------------------- */

/**
 * Cleans Pokédex flavor text.
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

        .replace(
            /POKéMON/g,
            "Pokémon"
        )

        .replace(
            /\$effect_chance/g,
            "Effect Chance"
        )

        .trim();

}

/**
 * Cleans move and ability effect text.
 */
function cleanEffectText(text) {

    if (!text) {
        return null;
    }

    return text

        .replace(
            /\[([^\]]+)\]\{[^}]+\}/g,
            "$1"
        )

        .replace(
            /\[\]\{move:([^}]+)\}/g,
            (_, move) => formatApiName(move)
        )

        .replace(
            /\[\]\{type:([^}]+)\}/g,
            (_, type) => formatApiName(type)
        )

        .replace(
            /\[\]\{ability:([^}]+)\}/g,
            (_, ability) => formatApiName(ability)
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}

/* ---------------------------------- */
/* Sorting Helpers                    */
/* ---------------------------------- */

/**
 * Converts an array of names
 * into a sorted Title Case array.
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

    formatGeneration,
    formatGameName,
    formatVersionGroup,
    formatApiName,
    formatNationalDexNumber,

    cleanFlavorText,
    cleanEffectText,

    sortTitleCaseNames

};
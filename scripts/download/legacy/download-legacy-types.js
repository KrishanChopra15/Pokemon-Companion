/**
 * Legacy Type Generator
 *
 * Generates legacy Pokémon battle types that no longer exist
 * in the official PokéAPI datasets.
 *
 * Current legacy types:
 * - ??? (Unknown)
 * - Shadow
 *
 * These are required for historical move data and older games.
 */
const path = require("path");

const {
    saveJSON
} = require("../../utils");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../../database/legacy/types.json"
);

const legacyTypes = [

    {
        id: 10001,

        apiName: "unknown",

        name: "???",

        color: "#808080",

        gradient: {
            start: "#9E9E9E",
            end: "#616161"
        },

        emoji: "❓",

        icon: "assets/icons/types/unknown.svg",

        description:
            "The ??? type existed in Generation II through Generation IV. It was used internally for certain mechanics, most notably the move Curse. The type was removed in Generation V.",

        damageRelations: {

            doubleDamageTo: [],

            doubleDamageFrom: [],

            halfDamageTo: [],

            halfDamageFrom: [],

            noDamageTo: [],

            noDamageFrom: []

        },

        legacy: true

    },

    {
        id: 10002,

        apiName: "shadow",

        name: "Shadow",

        color: "#5B3A8E",

        gradient: {
            start: "#7B5CB8",
            end: "#2D1B4E"
        },

        emoji: "🌑",

        icon: "assets/icons/types/shadow.svg",

        description:
            "The Shadow type was introduced in Pokémon Colosseum and Pokémon XD: Gale of Darkness. It is exclusive to Shadow Pokémon and was never part of the main series battle type system.",

        damageRelations: {

            doubleDamageTo: [],

            doubleDamageFrom: [],

            halfDamageTo: [],

            halfDamageFrom: [],

            noDamageTo: [],

            noDamageFrom: []

        },

        legacy: true

    }

];

saveJSON(
    OUTPUT_FILE,
    legacyTypes
);

console.log(
    `Successfully generated ${legacyTypes.length} legacy types.`
);
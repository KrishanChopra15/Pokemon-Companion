const path = require("path");
const fs = require("fs");

const GENERATED_DIR = path.join(
    __dirname,
    "../../database/generated"
);

const CATEGORY_FILES = [

    "mega-index.json",
    "regional-index.json",
    "gigantamax-index.json",
    "primal-index.json",
    "totem-index.json",
    "gender-index.json",
    "forme-index.json",
    "alternate-index.json"

];

function load(file) {

    return JSON.parse(

        fs.readFileSync(

            path.join(
                GENERATED_DIR,
                file
            ),

            "utf8"

        )

    );

}

console.log("");
console.log("========================================");
console.log(" Category Index Inspection");
console.log("========================================");
console.log("");

const pokemonIndex =
    load("pokemon-index.json");

const defaultPokemon =
    pokemonIndex.filter(
        pokemon => pokemon.isDefault
    );

const alternatePokemon =
    pokemonIndex.filter(
        pokemon => !pokemon.isDefault
    );

console.log(
    `Total Pokémon: ${pokemonIndex.length}`
);

console.log(
    `Default Pokémon: ${defaultPokemon.length}`
);

console.log(
    `Alternate Pokémon: ${alternatePokemon.length}`
);

console.log("");

const categoryEntries = [];
const categorySummary = [];

for (const file of CATEGORY_FILES) {

    const data =
        load(file);

    categorySummary.push({

        file,

        count: data.length

    });

    for (const pokemon of data) {

        categoryEntries.push({

            ...pokemon,

            source: file

        });

    }

}

console.log("Category Counts");
console.table(
    categorySummary
);

console.log("");

/* ---------------------------------- */
/* Duplicate Pokémon IDs              */
/* ---------------------------------- */

const seen = new Map();

const duplicates = [];

for (const pokemon of categoryEntries) {

    if (
        seen.has(
            pokemon.pokemonId
        )
    ) {

        duplicates.push({

            pokemonId:
                pokemon.pokemonId,

            first:
                seen.get(
                    pokemon.pokemonId
                ),

            second:
                pokemon.source

        });

    }

    else {

        seen.set(

            pokemon.pokemonId,

            pokemon.source

        );

    }

}

console.log(
    `Duplicate Pokémon IDs: ${duplicates.length}`
);

if (duplicates.length) {

    console.table(
        duplicates
    );

}

/* ---------------------------------- */
/* Missing Pokémon                    */
/* ---------------------------------- */

const categoryIds =
    new Set(

        categoryEntries.map(
            pokemon => pokemon.pokemonId
        )

    );

const missing =
    alternatePokemon.filter(

        pokemon =>

            !categoryIds.has(
                pokemon.pokemonId
            )

    );

console.log(
    `Missing alternate Pokémon: ${missing.length}`
);

if (missing.length) {

    console.table(

        missing.map(

            pokemon => ({

                pokemonId:
                    pokemon.pokemonId,

                speciesId:
                    pokemon.speciesId,

                name:
                    pokemon.name,

                category:
                    pokemon.category

            })

        )

    );

}

/* ---------------------------------- */
/* Unexpected Pokémon                 */
/* ---------------------------------- */

const alternateIds =
    new Set(

        alternatePokemon.map(
            pokemon => pokemon.pokemonId
        )

    );

const unexpected =
    categoryEntries.filter(

        pokemon =>

            !alternateIds.has(
                pokemon.pokemonId
            )

    );

console.log(
    `Unexpected Pokémon: ${unexpected.length}`
);

if (unexpected.length) {

    console.table(
        unexpected
    );

}

/* ---------------------------------- */
/* Totals                             */
/* ---------------------------------- */

console.log("");

console.log(
    `Indexed Alternate Pokémon: ${categoryEntries.length}`
);

console.log(
    `Expected Alternate Pokémon: ${alternatePokemon.length}`
);

console.log("");

if (

    duplicates.length === 0 &&

    missing.length === 0 &&

    unexpected.length === 0 &&

    categoryEntries.length === alternatePokemon.length

) {

    console.log("✅ PASS");
    console.log(
        "All category indexes are consistent."
    );

}

else {

    console.log("❌ FAIL");
    console.log(
        "Category indexes contain inconsistencies."
    );

}

console.log("");
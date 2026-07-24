const path = require("path");
const fs = require("fs");

const DATABASE_DIR = path.join(
    __dirname,
    "../../database/generated"
);

const FILE = path.join(
    DATABASE_DIR,
    "pokemon-index.json"
);

const pokemon = JSON.parse(
    fs.readFileSync(
        FILE,
        "utf8"
    )
);

console.log("");
console.log("========================================");
console.log(" Pokémon Index Inspection");
console.log("========================================");
console.log("");

console.log(
    `Total Pokémon: ${pokemon.length}`
);

const speciesIds = new Set(
    pokemon.map(p => p.speciesId)
);

console.log(
    `Total Species: ${speciesIds.size}`
);

console.log("");

/* ------------------------------------------------ */

console.log("Checking National Dex Numbers...");

const missingNumbers =
    pokemon.filter(
        p => !p.number
    );

console.log(
    `Missing numbers: ${missingNumbers.length}`
);

if (missingNumbers.length) {

    console.table(
        missingNumbers.slice(0, 20)
    );

}

/* ------------------------------------------------ */

console.log("");
console.log("Checking duplicate Pokémon IDs...");

const pokemonIds = new Set();
const duplicatePokemon = [];

for (const entry of pokemon) {

    if (
        pokemonIds.has(
            entry.pokemonId
        )
    ) {

        duplicatePokemon.push(
            entry
        );

    }

    pokemonIds.add(
        entry.pokemonId
    );

}

console.log(
    `Duplicate Pokémon IDs: ${duplicatePokemon.length}`
);

/* ------------------------------------------------ */

console.log("");
console.log(
    "Checking duplicate identifiers..."
);

const identifierMap = new Map();

const duplicateIdentifiers = [];

for (const entry of pokemon) {

    const key =
        `${entry.speciesId}-${entry.identifier}`;

    if (
        identifierMap.has(key)
    ) {

        duplicateIdentifiers.push(
            entry
        );

    }

    identifierMap.set(
        key,
        true
    );

}

console.log(
    `Duplicate identifiers: ${duplicateIdentifiers.length}`
);

/* ------------------------------------------------ */

console.log("");
console.log(
    "Checking default forms..."
);

const grouped = new Map();

for (const entry of pokemon) {

    if (
        !grouped.has(
            entry.speciesId
        )
    ) {

        grouped.set(
            entry.speciesId,
            []
        );

    }

    grouped
        .get(entry.speciesId)
        .push(entry);

}

const missingDefault = [];
const multipleDefault = [];

for (const [
    speciesId,
    forms
] of grouped) {

    const defaults =
        forms.filter(
            form => form.isDefault
        );

    if (
        defaults.length === 0
    ) {

        missingDefault.push(
            speciesId
        );

    }

    if (
        defaults.length > 1
    ) {

        multipleDefault.push(
            speciesId
        );

    }

}

console.log(
    `Species without default: ${missingDefault.length}`
);

console.log(
    `Species with multiple defaults: ${multipleDefault.length}`
);

/* ------------------------------------------------ */

console.log("");
console.log(
    "Checking categories..."
);

const allowed = new Set([

    "Default",

    "Mega",

    "Regional",

    "Gigantamax",

    "Primal",

    "Totem",

    "Gender",

    "Forme",

    "Alternate"

]);

const invalidCategories =
    pokemon.filter(

        p =>

            !allowed.has(
                p.category
            )

    );

console.log(
    `Invalid categories: ${invalidCategories.length}`
);

/* ------------------------------------------------ */

console.log("");
console.log(
    "Category Summary"
);

const summary = {};

for (const entry of pokemon) {

    summary[entry.category] =
        (summary[entry.category] || 0) + 1;

}

console.table(summary);

/* ------------------------------------------------ */

function showSpecies(name) {

    console.log("");
    console.log(
        `=== ${name} ===`
    );

    console.table(

        pokemon.filter(

            p =>

                p.name.startsWith(
                    name
                )

        )

    );

}

showSpecies("Charizard");
showSpecies("Rotom");
showSpecies("Deoxys");
showSpecies("Mr Mime");
showSpecies("Farfetchd");
showSpecies("Pikachu");
showSpecies("Urshifu");
showSpecies("Zygarde");

console.log("");
console.log("Inspection Complete.");
console.log("");
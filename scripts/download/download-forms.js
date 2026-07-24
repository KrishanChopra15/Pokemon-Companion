const Database = require("better-sqlite3");
const path = require("path");

const {
    saveJSON,
    createLookupMap,
    createVersionGroupReference
} = require("../utils");

const pokemon = require("../../database/pokemon.json");
const versionGroups = require("../../database/version-groups.json");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/forms.json"
);

const pokemonMap = createLookupMap(
    pokemon
);

const versionGroupMap = createLookupMap(
    versionGroups
);

const database = new Database(
    path.join(
        __dirname,
        "../../database/external/veekun/veekun-pokedex.sqlite"
    ),
    {
        readonly: true
    }
);

const rows = database.prepare(`
    SELECT
        pf.id,
        pf.identifier,
        pf.form_identifier,
        pf.pokemon_id,
        pf.introduced_in_version_group_id,
        pf.is_default,
        pf.is_battle_only,
        pf.is_mega,
        pf.form_order,
        pf."order",
        pfn.form_name
    FROM pokemon_forms pf

    LEFT JOIN pokemon_form_names pfn
        ON pfn.pokemon_form_id = pf.id
        AND pfn.local_language_id = 9

    ORDER BY
        pf."order",
        pf.form_order,
        pf.id;
`).all();

const forms = [];

for (const row of rows) {

    const pokemon = pokemonMap.get(
        row.pokemon_id
    );

    if (!pokemon) {
        continue;
    }

    const versionGroup = versionGroupMap.get(
        row.introduced_in_version_group_id
    );

    const isSpecial =

        Boolean(
            row.is_mega
        ) ||

        Boolean(
            row.is_battle_only
        ) ||

        row.form_identifier !== null;

    forms.push({

        id: row.id,

        pokemon: {

            id: pokemon.id,

            number: pokemon.number,

            name: pokemon.name

        },

        identifier:
            row.identifier,

        formIdentifier:
            row.form_identifier,

        name:

            row.form_name ??

            "Default Form",

        introducedInVersionGroup:

            createVersionGroupReference(
                versionGroup,
                true
            ),

        isDefault:
            Boolean(
                row.is_default
            ),

        isBattleOnly:
            Boolean(
                row.is_battle_only
            ),

        isMega:
            Boolean(
                row.is_mega
            ),

        isSpecial,

        formOrder:
            row.form_order,

        order:
            row.order

    });

}

saveJSON(
    OUTPUT_FILE,
    forms
);

console.log(
    `Successfully generated ${forms.length} forms.`
);

database.close();
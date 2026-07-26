const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    createLookupMap
} = require("../utils/helpers");

const {
    createVersionGroupReference
} = require("../utils/references");

const {
    withVeekunDatabase
} = require("../utils/database");

const {
    printSuccess,
    printOutputFile,
    printError
} = require("../utils/logger");

const pokemon = require(
    "../../database/pokemon.json"
);

const versionGroups = require(
    "../../database/version-groups.json"
);

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/forms.json"
);

function downloadForms(
    {
        verbose = true
    } = {}
) {

    try {

        const forms =
            withVeekunDatabase(database => {

                const pokemonMap =
                    createLookupMap(
                        pokemon
                    );

                const versionGroupMap =
                    createLookupMap(
                        versionGroups
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

                    const currentPokemon =
                        pokemonMap.get(
                            row.pokemon_id
                        );

                    if (!currentPokemon) {

                        continue;

                    }

                    const versionGroup =
                        versionGroupMap.get(
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

                        id:
                            row.id,

                        pokemon: {

                            id:
                                currentPokemon.id,

                            number:
                                currentPokemon.number,

                            name:
                                currentPokemon.name

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

                return forms;

            });

        if (verbose) {

            printSuccess(
                `Downloaded ${forms.length} forms`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                forms.length

        };

    } catch (error) {

        if (verbose) {

            printError(
                error,
                "Error downloading forms"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    downloadForms

};

if (require.main === module) {

    downloadForms();

}
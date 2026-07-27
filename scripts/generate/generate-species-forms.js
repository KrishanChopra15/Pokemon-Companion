const path = require("path");

const {
    DATABASE_DIR,
    loadJSON,
    saveJSON
} = require("../utils/json");

const {
    printPhase,
    printSection,
    printSuccess,
    printOutputFile,
    printError
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    DATABASE_DIR,
    "generated",
    "species-forms.json"
);

function groupBySpecies(
    pokemon
) {

    const groups = new Map();

    for (const entry of pokemon) {

        if (!groups.has(entry.speciesId)) {

            groups.set(
                entry.speciesId,
                []
            );

        }

        groups
            .get(entry.speciesId)
            .push(entry);

    }

    return groups;

}

function determineCategory(
    identifier
) {

    const value =
        identifier.toLowerCase();

    if (value.includes("mega")) {
        return "Mega";
    }

    if (value.includes("gmax")) {
        return "Gigantamax";
    }

    if (

        value.includes("alola") ||
        value.includes("galar") ||
        value.includes("hisui") ||
        value.includes("paldea")

    ) {

        return "Regional";

    }

    if (value.includes("primal")) {
        return "Primal";
    }

    if (value.includes("totem")) {
        return "Totem";
    }

    if (

        value.includes("male") ||
        value.includes("female")

    ) {

        return "Gender";

    }

    if (

        value.includes("attack") ||
        value.includes("defense") ||
        value.includes("speed") ||
        value.includes("origin") ||
        value.includes("therian") ||
        value.includes("sky") ||
        value.includes("heat") ||
        value.includes("wash") ||
        value.includes("frost") ||
        value.includes("fan") ||
        value.includes("mow") ||
        value.includes("blade") ||
        value.includes("school") ||
        value.includes("complete") ||
        value.includes("zen") ||
        value.includes("pirouette") ||
        value.includes("resolute") ||
        value.includes("ash") ||
        value.includes("battle-bond")

    ) {

        return "Forme";

    }

    return "Alternate";

}

function createDisplayName(
    identifier
) {

    if (!identifier) {

        return "Default";

    }

    return identifier

        .split("-")

        .map(

            word =>

                word.charAt(0).toUpperCase() +

                word.slice(1)

        )

        .join(" ");

}

function sortForms(
    forms
) {

    const order = {

        Default: 0,
        Mega: 1,
        Regional: 2,
        Gigantamax: 3,
        Primal: 4,
        Totem: 5,
        Gender: 6,
        Forme: 7,
        Alternate: 8

    };

    forms.sort(

        (a, b) =>

            order[a.category] -
            order[b.category] ||

            a.order -
            b.order

    );

}

function createFormsForSpecies(
    species,
    pokemonList
) {

    const forms = [];

    for (const pokemon of pokemonList) {

        const isDefault =
            pokemon.id < 10000;

        let identifier =
            "default";

        if (!isDefault) {

            const prefix =
                species.name + " ";

            if (

                pokemon.name.startsWith(
                    prefix
                )

            ) {

                identifier =
                    pokemon.name.substring(
                        prefix.length
                    );

            } else {

                identifier =
                    pokemon.name.trim();

            }

            identifier =

                identifier

                    .trim()

                    .toLowerCase()

                    .replace(/[.'’:]/g, "")

                    .replace(/\s+/g, "-");

        }

        forms.push({

            pokemonId:
                pokemon.id,

            order:
                pokemon.order,

            identifier,

            displayName:

                isDefault
                    ? "Default"
                    : createDisplayName(
                        identifier
                    ),

            category:

                isDefault
                    ? "Default"
                    : determineCategory(
                        identifier
                    ),

            isDefault

        });

    }

    sortForms(
        forms
    );

    for (const form of forms) {

        delete form.order;

    }

    return forms;

}

function generateSpeciesForms(
    {
        verbose = true
    } = {}
) {

    try {

        const pokemon =
            loadJSON(
                "pokemon.json"
            );

        const species =
            loadJSON(
                "species.json"
            );

        const groups =
            groupBySpecies(
                pokemon
            );

        if (verbose) {

            printSection(
                `Loaded ${pokemon.length} Pokémon`
            );

            console.log(
                `Loaded ${species.length} Species`
            );

            console.log(
                `Created ${groups.size} species groups`
            );

        }

        const generated = [];

        for (const currentSpecies of species) {

            const pokemonList =
                groups.get(
                    currentSpecies.id
                );

            if (!pokemonList) {

                continue;

            }

            generated.push({

                species: {

                    id:
                        currentSpecies.id,

                    number:
                        currentSpecies.number,

                    name:
                        currentSpecies.name

                },

                forms:

                    createFormsForSpecies(
                        currentSpecies,
                        pokemonList
                    )

            });

        }

        saveJSON(
            OUTPUT_FILE,
            generated
        );

        if (verbose) {

            printSuccess(
                `Generated ${generated.length} species entries`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            success: true,

            count:
                generated.length,

            output:
                OUTPUT_FILE,

            message:
                `${generated.length} species forms generated`

        };

    }

    catch (error) {

        if (verbose) {

            printError(
                error,
                "Error generating species forms"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    generateSpeciesForms

};

if (require.main === module) {

    (async () => {

        try {

            printPhase(
                "Phase 8 - Species Forms Generation"
            );

            await generateSpeciesForms();

        } catch (error) {

            printError(
                error,
                "Error generating species forms"
            );

        }

    })();

}
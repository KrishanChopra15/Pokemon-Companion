function isDefaultPokemon(
    pokemon
) {

    return pokemon.id < 10000;

}

function createIdentifier(
    speciesName,
    pokemonName
) {

    if (
        pokemonName === speciesName ||
        pokemonName === `${speciesName} Normal`
    ) {

        return "default";

    }

    let identifier =
        pokemonName;

    const prefix =
        speciesName + " ";

    if (
        pokemonName.startsWith(
            prefix
        )
    ) {

        identifier =
            pokemonName.substring(
                prefix.length
            );

    }

    return identifier

        .trim()

        .toLowerCase()

        .replace(/[.'’:]/g, "")

        .replace(/\s+/g, "-");

}

function createDisplayName(
    identifier
) {

    if (
        !identifier ||
        identifier === "default"
    ) {

        return "Default";

    }

    if (
        identifier === "gmax"
    ) {

        return "Gigantamax";

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

function determineCategory(
    identifier
) {

    const value =
        identifier.toLowerCase();

    if (
        value === "default"
    ) {

        return "Default";

    }

    if (
        value.includes("mega")
    ) {

        return "Mega";

    }

    if (
        value.includes("gmax")
    ) {

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

    if (
        value.includes("primal")
    ) {

        return "Primal";

    }

    if (
        value.includes("totem")
    ) {

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

function createPokemonMetadata(
    pokemon
) {

    const identifier =
        createIdentifier(

            pokemon.speciesName,

            pokemon.name

        );

    const isDefault =
        identifier === "default";

    const displayName =
        createDisplayName(
            identifier
        );

    const category =
        determineCategory(
            identifier
        );

    return {

        pokemonId:
            pokemon.id,

        speciesId:
            pokemon.speciesId,

        number:
            pokemon.number,

        order:
            pokemon.order,

        name:
            isDefault
                ? pokemon.speciesName
                : pokemon.name,

        identifier,

        displayName,

        category,

        isDefault

    };

}

function sortPokemonIndex(
    pokemon
) {

    const categoryOrder = {

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

    pokemon.sort(

        (
            a,
            b
        ) => {

            // National Dex order
            if (

                a.speciesId !==

                b.speciesId

            ) {

                return (

                    a.speciesId -

                    b.speciesId

                );

            }

            // Default form first
            if (

                a.isDefault !==

                b.isDefault

            ) {

                return a.isDefault
                    ? -1
                    : 1;

            }

            // Category order
            const categoryDifference =

                categoryOrder[a.category] -

                categoryOrder[b.category];

            if (

                categoryDifference !== 0

            ) {

                return categoryDifference;

            }

            // Use PokéAPI order when available
            if (

                a.order >= 0 &&

                b.order >= 0

            ) {

                return (

                    a.order -

                    b.order

                );

            }

            // Alphabetical fallback
            const displayDifference =

                a.displayName.localeCompare(
                    b.displayName
                );

            if (

                displayDifference !== 0

            ) {

                return displayDifference;

            }

            // Stable final fallback
            return (

                a.pokemonId -

                b.pokemonId

            );

        }

    );

}

module.exports = {

    isDefaultPokemon,

    createIdentifier,

    createDisplayName,

    determineCategory,

    createPokemonMetadata,

    sortPokemonIndex

};
const {
    findPokemon
} = require("./inspect-search");

const {
    printField,
    printList,
    printNotFound,
    printSection,
    printTypeList
} = require("./inspect-utils");

const {
    printEvolution
} = require("../utils/evolution");

const {
    printSpecies
} = require("../utils/species");

const {
    printLearnset
} = require("../utils/learnset");

const {
    printPokemonHeading
} = require(
    "../utils/pokemon-formatting"
);

const {
    COLOURS,
    printDivider
} = require("../utils/logger");

/**
 * Inspects a Pokémon.
 *
 * @param {string|number} query
 */
function inspectPokemon(
    query
) {

    const pokemon =
        findPokemon(
            query
        );

    if (!pokemon) {

        printNotFound(
            "Pokémon",
            query
        );

        return;

    }

    printPokemonHeading(
        pokemon
    );

    printSection(
        "Basic"
    );

    printField(
        "ID",
        pokemon.id
    );

    printField(
        "Species ID",
        pokemon.speciesId
    );

    printField(
        "Order",
        pokemon.order
    );

    console.log();

    printSection(
        "Physical"
    );

    printField(
        "Height",
        `${pokemon.height} m`
    );

    printField(
        "Weight",
        `${pokemon.weight} kg`
    );

    console.log();

    printSection(
        "Abilities"
    );

    printList(

        pokemon.abilities.map(

            ability =>

                ability.hidden

                    ? `${ability.name} ★ Hidden`

                    : ability.name

        )

    );

    console.log();

    printSection(
        "Base Stats"
    );

    printField(
        "HP",
        pokemon.stats.hp
    );

    printField(
        "Attack",
        pokemon.stats.attack
    );

    printField(
        "Defense",
        pokemon.stats.defense
    );

    printField(
        "Special Attack",
        pokemon.stats.specialAttack
    );

    printField(
        "Special Defense",
        pokemon.stats.specialDefense
    );

    printField(
        "Speed",
        pokemon.stats.speed
    );

    const total =

        Object.values(
            pokemon.stats
        ).reduce(

            (
                sum,
                stat
            ) =>

                sum + stat,

            0

        );

    printField(
        "Total",
        total,
        COLOURS.GREEN
    );

    console.log();

    printSpecies(
        pokemon.speciesId
    );

    printEvolution(
        pokemon.speciesId
    );

    printLearnset(
        pokemon.speciesId
    );

}

module.exports = {

    inspectPokemon

};
const {

    findAbility,
    findPokemonByAbility

} = require("./inspect-search");

const {

    printAbilityHeading

} = require(
    "../utils/pokemon-formatting"
);

const {

    printField,
    printList,
    printNotFound,
    printParagraph,
    printSection

} = require("./inspect-utils");

function inspectAbility(

    query,

    {

        limit = null

    } = {}

) {

    const ability =

        findAbility(query);

    if (!ability) {

        printNotFound(
            "Ability",
            query
        );

        return;

    }

    const pokemon =
        findPokemonByAbility(
            ability.id
        );

    printAbilityHeading(
        ability
    );

    console.log();

    printSection(
        "General"
    );

    printField(
        "ID",
        ability.id
    );

    printField(
        "Generation",
        ability.generation.name
    );

    printField(
        "Main Series",
        ability.isMainSeries
            ? "Yes"
            : "No"
    );

    console.log();

    printSection(
        "Description"
    );

    printParagraph(
        ability.description
    );

    console.log();

    printSection(
        "Battle Effect"
    );

    printParagraph(
        ability.effect
    );

    console.log();

    printSection(
        `Pokémon (${pokemon.length})`
    );

    printList(

        pokemon.map(
            entry => entry.name
        ),

        null,

        limit

    );

    console.log();

}

module.exports = {

    inspectAbility

};
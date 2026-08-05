const {
    COLOURS,
    colour,
    printDivider
} = require("./logger");

function printPokemonHeading(
    pokemon
) {

    console.log();

    printDivider(
        COLOURS.CYAN
    );

    console.log();

    console.log(

        colour(

            COLOURS.BOLD + COLOURS.CYAN,

            `⚡ ${pokemon.name}`

        ) +

        colour(

            COLOURS.DIM + COLOURS.WHITE,

            ` (${pokemon.number})`

        )

    );

    console.log();

    console.log(

        pokemon.types

            .map(

                type => colourType(type.name)

            )

            .join(

                colour(

                    COLOURS.DIM,

                    " • "

                )

            )

    );

    console.log();

    printDivider(
        COLOURS.CYAN
    );

    console.log();

}

function colourType(
    type
) {

    const TYPE_STYLES = {

        Normal: {

            colour: COLOURS.WHITE,

            icon: "⚪"

        },

        Fire: {

            colour: COLOURS.RED,

            icon: "🔥"

        },

        Water: {

            colour: COLOURS.BLUE,

            icon: "💧"

        },

        Electric: {

            colour: COLOURS.YELLOW,

            icon: "⚡"

        },

        Grass: {

            colour: COLOURS.GREEN,

            icon: "🌱"

        },

        Ice: {

            colour: COLOURS.CYAN,

            icon: "❄"

        },

        Fighting: {

            colour: COLOURS.RED,

            icon: "🥊"

        },

        Poison: {

            colour: COLOURS.MAGENTA,

            icon: "🟣"

        },

        Ground: {

            colour: COLOURS.YELLOW,

            icon: "🌍"

        },

        Flying: {

            colour: COLOURS.CYAN,

            icon: "🪽"

        },

        Psychic: {

            colour: COLOURS.MAGENTA,

            icon: "🔮"

        },

        Bug: {

            colour: COLOURS.GREEN,

            icon: "🐛"

        },

        Rock: {

            colour: COLOURS.YELLOW,

            icon: "🪨"

        },

        Ghost: {

            colour: COLOURS.DIM,

            icon: "👻"

        },

        Dragon: {

            colour: COLOURS.MAGENTA,

            icon: "🐉"

        },

        Dark: {

            colour: COLOURS.DIM,

            icon: "🌑"

        },

        Steel: {

            colour: COLOURS.WHITE,

            icon: "⚙"

        },

        Fairy: {

            colour: COLOURS.MAGENTA,

            icon: "🧚"

        }

    };

    const style =

        TYPE_STYLES[type] ||

        {

            colour: COLOURS.WHITE,

            icon: "⚪"

        };

    return colour(

        style.colour,

        `${style.icon} ${type}`

    );

}

/**
 * Prints an ability heading.
 *
 * @param {Object} ability
 */
function printAbilityHeading(
    ability
) {

    printDivider(
        COLOURS.YELLOW
    );

    console.log(

        colour(

            COLOURS.BOLD + COLOURS.YELLOW,

            `✨ ${ability.name}`

        )

    );

    printDivider(
        COLOURS.YELLOW
    );

}

function printMoveHeading(
    move
) {

    printDivider(
        COLOURS.RED
    );

    console.log(

        colour(

            COLOURS.BOLD + COLOURS.RED,

            `💥 ${move.name}`

        )

    );

    printDivider(
        COLOURS.RED
    );

}

module.exports = {

    printPokemonHeading,

    printAbilityHeading,

    printMoveHeading,

    colourType
}
/**
 * Utility Library
 *
 * Re-exports all utility modules so they can be
 * imported from a single location.
 */

module.exports = {

    /* API */

    ...require("./api"),

    /* Formatting */

    ...require("./formatting"),

    /* Helpers */

    ...require("./helpers"),

    /* JSON */

    ...require("./json"),

    /* Logger */

    ...require("./logger"),

    /* Pokémon */

    ...require("./pokemon"),

    /* Forms */

    ...require("./forms")

};
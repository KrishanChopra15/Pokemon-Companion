/**
 * Pokémon Companion
 * Define Parser
 *
 * Parses C preprocessor defines.
 *
 * Example:
 *
 * #define EGG_GROUP_MONSTER      1
 * #define EGG_GROUP_DRAGON       14
 */

"use strict";

class DefineParser {

    /**
     * Parse #define constants.
     *
     * @param {string} source
     * @param {string} prefix
     * @returns {Object[]}
     */
    parse(source, prefix) {

        const results = [];

        const regex = new RegExp(
            `#define\\s+(${prefix}[A-Z0-9_]+)\\s+(\\d+)`,
            "g"
        );

        let match;

        while ((match = regex.exec(source)) !== null) {

            const constant = match[1];

            const id = Number(match[2]);

            const name = constant
                .replace(prefix, "")
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, letter => letter.toUpperCase());

            results.push({

                id,

                constant,

                name

            });

        }

        return results;

    }

}

module.exports = DefineParser;
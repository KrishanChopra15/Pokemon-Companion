/**
 * Pokémon Companion
 * Comment Enum Parser
 *
 * Extracts simple reference lists from C source files that use
 * comments to label array entries.
 *
 * Example:
 *
 * { // Medium Fast
 * { // Erratic
 * { // Fluctuating
 */

"use strict";

class CommentEnumParser {

    /**
     * Parse comment-labelled array entries.
     *
     * @param {string} source
     * @param {Object} options
     * @returns {Object[]}
     */
    parse(source, options = {}) {

        const {
            maxEntries = Infinity,
            ignore = []
        } = options;

        const results = [];

        const regex = /{\s*\/\/\s*(.+?)\s*$/gm;

        let match;
        let id = 0;

        while ((match = regex.exec(source)) !== null) {

            const name = match[1].trim();

            const shouldIgnore = ignore.some(text =>
                name.includes(text)
            );

            if (shouldIgnore) {
                continue;
            }

            results.push({
                id,
                name
            });

            id++;

            if (results.length >= maxEntries) {
                break;
            }

        }

        return results;

    }

}

module.exports = CommentEnumParser;
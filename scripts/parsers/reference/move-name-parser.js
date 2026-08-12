"use strict";

class MoveNameParser {

    /**
     * Parse move names.
     *
     * @param {string} source
     * @returns {Object[]}
     */
    parse(source) {

        const moves = [];

        const regex = /^\s*\[(MOVE_[A-Z0-9_]+)\]/gm;

        let match;

        let id = 0;

        while ((match = regex.exec(source)) !== null) {

            const constant = match[1];

            const name = constant
                .replace("MOVE_", "")
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, letter => letter.toUpperCase());

            moves.push({

                id,

                constant,

                name

            });

            id++;

        }

        return moves;

    }

}

module.exports = MoveNameParser;
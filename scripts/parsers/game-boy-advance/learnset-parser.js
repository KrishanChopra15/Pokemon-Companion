/**
 * Pokémon Companion
 * Game Boy Advance Learnset Parser
 *
 * Parses LEVEL_UP_MOVE entries from
 * level_up_learnsets.h.
 *
 * Responsibilities:
 * - Parse one learnset move entry.
 * - Produce LearnsetMove objects.
 *
 * Does NOT:
 * - Read files.
 * - Find Pokémon.
 * - Extract complete learnsets.
 */

"use strict";

const LearnsetMove =
require("../../domain/learnset-move");


class LearnsetParser {


    /**
     * Parse one LEVEL_UP_MOVE entry.
     *
     * Example:
     *
     * LEVEL_UP_MOVE(1, MOVE_TACKLE)
     *
     * @param {string} entry
     * @returns {LearnsetMove|null}
     */
    parse(entry) {


        const regex =
        /LEVEL_UP_MOVE\((\d+),\s*(MOVE_[A-Z0-9_]+)\)/;


        const match =
        entry.match(regex);


        if (!match) {

            return null;

        }


        return new LearnsetMove({

            level: Number(match[1]),

            move: match[2]

        });


    }


}


module.exports = LearnsetParser;
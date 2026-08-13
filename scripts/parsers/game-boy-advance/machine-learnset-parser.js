/**
 * Pokémon Companion
 * Game Boy Advance Machine Learnset Parser
 *
 * Parses TM/HM compatibility entries
 * from tmhm_learnsets.h
 *
 * Responsibilities:
 * - Parse one Pokémon TM/HM entry.
 * - Extract machine constants.
 *
 * Does NOT:
 * - Read files.
 * - Resolve items.
 * - Resolve moves.
 */

"use strict";


class MachineLearnsetParser {


    /**
     * Parse a single TMHM_LEARNSET entry.
     *
     * Example:
     *
     * [SPECIES_BULBASAUR] = TMHM_LEARNSET(TMHM(TM06_TOXIC)
     *                                      | TMHM(HM01_CUT))
     *
     * @param {string} species
     * @param {string} block
     * @returns {Object}
     */
    parse(species, block) {


        const machines = [];


        const regex =
            /TMHM\((TM\d+_[A-Z0-9_]+|HM\d+_[A-Z0-9_]+)\)/g;


        let match;


        while ((match = regex.exec(block)) !== null) {

            machines.push(
                match[1]
            );

        }


        return {

            species,

            machines

        };


    }


}


module.exports = MachineLearnsetParser;
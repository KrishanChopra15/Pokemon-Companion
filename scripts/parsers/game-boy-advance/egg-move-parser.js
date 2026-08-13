/**
 * Pokémon Companion
 * Egg Move Parser
 *
 * Parses egg_moves.h entries.
 */

"use strict";


class EggMoveParser {


    parse(block) {

        const moves = block
            .match(/MOVE_[A-Z0-9_]+/g);


        return moves || [];

    }


}


module.exports = EggMoveParser;
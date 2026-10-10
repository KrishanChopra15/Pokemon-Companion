/**
 * Pokémon Companion
 * FireRed Shared Progression Requirements
 *
 * Single source of truth for reusable
 * progression requirements.
 *
 * Does NOT:
 * - Define locations.
 * - Define progression rules.
 * - Read ROM data.
 * - Track player state.
 */

"use strict";


module.exports =
{
    ALL_EIGHT_BADGES:
    {
        badges:
        [
            "BOULDER_BADGE",
            "CASCADE_BADGE",
            "THUNDER_BADGE",
            "RAINBOW_BADGE",
            "SOUL_BADGE",
            "MARSH_BADGE",
            "VOLCANO_BADGE",
            "EARTH_BADGE"
        ]
    }
};
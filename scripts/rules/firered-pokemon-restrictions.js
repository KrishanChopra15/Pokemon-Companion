/**
 * Pokémon Companion
 * FireRed Pokémon Restrictions
 *
 * Defines hard Pokémon availability restrictions.
 *
 * Responsibilities:
 * - Define Pokémon locked behind story completion.
 * - Define legendary/post-game requirements.
 * - Define special unlock conditions.
 *
 * Does NOT:
 * - Check player state.
 * - Handle encounters.
 * - Calculate evolution difficulty.
 * - Recommend teams.
 */

"use strict";


module.exports =
{


    //--------------------------------
    // Legendary / Post Game Pokémon
    //--------------------------------


    MEWTWO:
    {

        requirements:
        [

            "CHAMPION_DEFEATED",

            "NATIONAL_DEX"

        ],


        unlocks:
        [

            "CERULEAN_CAVE_ACCESS"

        ],


        reason:

            "Requires defeating the Champion and obtaining the National Dex to unlock Cerulean Cave access."


    }


};
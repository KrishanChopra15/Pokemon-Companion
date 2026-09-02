/**
 * Pokémon Companion
 * FireRed Progression Rules
 *
 * Combines all FireRed progression rule groups.
 *
 * Does NOT:
 * - Define rules itself.
 * - Read ROM data.
 * - Track player state.
 */

"use strict";


const gyms =
    require("./gyms");


const hms =
    require("./hms");


const story =
    require("./story");


const worldGates =
    require("./world-gates");


const postGame =
    require("./post-game");



module.exports =
[
    ...gyms,

    ...hms,

    ...story,

    ...worldGates,

    ...postGame

];
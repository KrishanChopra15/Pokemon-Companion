/**
 * Pokémon Companion
 * Progression Unlock Service
 *
 * Applies progression rule unlocks
 * to the current trainer state.
 *
 * Responsibilities:
 * - Apply progression unlocks.
 * - Grant HM field abilities.
 * - Grant badges.
 * - Grant story flags.
 * - Grant general abilities.
 * - Report unsupported unlock types.
 *
 * Does NOT:
 * - Define progression rules.
 * - Check map traversal.
 * - Decide progression requirements.
 * - Parse ROM data.
 * - Load databases.
 */

"use strict";


class ProgressionUnlockService
{


    //--------------------------------
    // Apply progression unlocks
    //--------------------------------


    apply(
        progression,
        trainerState
    )
    {


        if(
            !progression
        )
        {

            return {

                success:false,

                applied:[],

                skipped:[],

                reason:
                    "Missing progression"

            };

        }



        if(
            !trainerState
        )
        {

            return {

                success:false,

                applied:[],

                skipped:[],

                reason:
                    "Missing trainer state"

            };

        }



        const unlocks =
            Array.isArray(
                progression.unlocks
            )
            ?
            progression.unlocks
            :
            [];



        const applied = [];

        const skipped = [];



        //--------------------------------
        // Apply each unlock
        //--------------------------------


        for(
            const unlock of unlocks
        )
        {


            const result =
                this.applyUnlock(

                    unlock,

                    progression,

                    trainerState

                );



            if(
                result.applied
            )
            {

                applied.push(
                    unlock
                );

            }
            else
            {

                skipped.push({

                    unlock,

                    reason:
                        result.reason

                });

            }


        }



        return {

            success:true,

            progression:
                progression.id
                ||
                null,

            applied,

            skipped

        };

    }





    //--------------------------------
    // Apply one unlock
    //--------------------------------


    applyUnlock(
        unlock,
        progression,
        trainerState
    )
    {


        if(
            !unlock
            ||
            typeof unlock !==
                "string"
        )
        {

            return {

                applied:false,

                reason:
                    "Invalid unlock"

            };

        }



        const normalized =
            unlock
                .toUpperCase();





        //--------------------------------
        // HM / field ability
        //--------------------------------
        //
        // Example:
        //
        // CAN_USE_CUT
        // CAN_USE_FLASH
        // CAN_USE_SURF
        // CAN_USE_STRENGTH
        // CAN_USE_FLY
        //
        // These are stored in the
        // trainer HM ability state.
        //--------------------------------


        if(
            normalized.startsWith(
                "CAN_USE_"
            )
        )
        {


            if(
                typeof trainerState.addHMAbility ===
                    "function"
            )
            {

                trainerState.addHMAbility(

                    normalized

                );


                return {

                    applied:true

                };

            }


            return {

                applied:false,

                reason:
                    "Trainer state cannot store HM abilities"

            };

        }





        //--------------------------------
        // Badge
        //--------------------------------
        //
        // Example:
        //
        // BOULDER_BADGE
        // CASCADE_BADGE
        // THUNDER_BADGE
        //--------------------------------


        if(
            normalized.endsWith(
                "_BADGE"
            )
        )
        {


            if(
                typeof trainerState.addBadge ===
                    "function"
            )
            {

                trainerState.addBadge(

                    normalized

                );


                return {

                    applied:true

                };

            }


            return {

                applied:false,

                reason:
                    "Trainer state cannot store badges"

            };

        }





        //--------------------------------
        // Story flag
        //--------------------------------
        //
        // Story systems may explicitly
        // declare flags as unlocks.
        //
        // Example:
        //
        // SILPH_CO_COMPLETED
        // POKEDEX_RECEIVED
        //--------------------------------


        if(
            normalized.startsWith(
                "FLAG_"
            )
        )
        {


            const flag =
                normalized.replace(
                    /^FLAG_/,
                    ""
                );



            if(
                typeof trainerState.addStoryFlag ===
                    "function"
            )
            {

                trainerState.addStoryFlag(

                    flag

                );


                return {

                    applied:true

                };

            }


            return {

                applied:false,

                reason:
                    "Trainer state cannot store story flags"

            };

        }





        //--------------------------------
        // General ability
        //--------------------------------
        //
        // Used for non-HM capabilities.
        //--------------------------------


        if(
            typeof trainerState.addAbility ===
                "function"
        )
        {


            trainerState.addAbility(

                normalized

            );


            return {

                applied:true

            };

        }





        //--------------------------------
        // Unsupported unlock
        //--------------------------------


        return {

            applied:false,

            reason:
                "Unsupported progression unlock"

        };

    }





    //--------------------------------
    // Check whether unlock can be applied
    //--------------------------------


    canApply(
        unlock,
        trainerState
    )
    {


        if(
            !unlock
            ||
            typeof unlock !==
                "string"
        )
        {

            return false;

        }



        if(
            !trainerState
        )
        {

            return false;

        }



        const normalized =
            unlock
                .toUpperCase();



        //--------------------------------
        // HM / field ability
        //--------------------------------


        if(
            normalized.startsWith(
                "CAN_USE_"
            )
        )
        {

            return typeof trainerState.addHMAbility ===
                "function";

        }





        //--------------------------------
        // Badge
        //--------------------------------


        if(
            normalized.endsWith(
                "_BADGE"
            )
        )
        {

            return typeof trainerState.addBadge ===
                "function";

        }





        //--------------------------------
        // Story flag
        //--------------------------------


        if(
            normalized.startsWith(
                "FLAG_"
            )
        )
        {

            return typeof trainerState.addStoryFlag ===
                "function";

        }





        //--------------------------------
        // General ability
        //--------------------------------


        return typeof trainerState.addAbility ===
            "function";

    }





    //--------------------------------
    // Apply all available unlocks
    //--------------------------------


    applyAll(
        progressions,
        trainerState
    )
    {


        if(
            !Array.isArray(
                progressions
            )
        )
        {

            return {

                success:false,

                applied:[],

                skipped:[],

                reason:
                    "Invalid progression list"

            };

        }



        const applied = [];

        const skipped = [];



        for(
            const progression of
                progressions
        )
        {


            const result =
                this.apply(

                    progression,

                    trainerState

                );



            if(
                result.success
            )
            {

                applied.push({

                    progression:
                        result.progression,

                    unlocks:
                        result.applied

                });

            }
            else
            {

                skipped.push({

                    progression:
                        progression
                        &&
                        progression.id
                        ||
                        null,

                    reason:
                        result.reason

                });

            }


        }



        return {

            success:true,

            applied,

            skipped

        };

    }


}



module.exports =
    ProgressionUnlockService;

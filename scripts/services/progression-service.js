/**
 * Pokémon Companion
 * Progression Service
 *
 * Evaluates trainer progression rules.
 *
 * Responsibilities:
 * - Check badge requirements.
 * - Check HM requirements.
 * - Check key items.
 * - Check story requirements.
 *
 * Does NOT:
 * - Traverse maps.
 * - Parse source files.
 * - Handle obstacles.
 */

"use strict";


class ProgressionService {


    constructor() {


        this.hmRules = {


            CUT: {

                badge:
                    "BOULDER_BADGE"

            },


            FLASH: {

                badge:
                    "BOULDER_BADGE"

            },


            SURF: {

                badge:
                    "SOUL_BADGE"

            },


            STRENGTH: {

                badge:
                    "RAINBOW_BADGE"

            },


            FLY: {

                badge:
                    "THUNDER_BADGE"

            },


            //--------------------------------
            // Sevii Islands mechanic
            //--------------------------------

            ROCK_SMASH: {

                storyFlag:
                    "ROCK_SMASH_UNLOCKED"

            }


        };


    }





    //--------------------------------
    // HM checks
    //--------------------------------


    canUseHM(
        hm,
        trainerState
    ) {


        const rule =
            this.hmRules[hm];



        if (!rule) {


            return {

                allowed:false,

                reason:
                    "Unknown HM"

            };


        }



        //--------------------------------
        // HM obtained
        //--------------------------------

        if (
            !this.hasHM(
                hm,
                trainerState
            )
        ) {


            return {

                allowed:false,

                reason:
                    "HM not obtained"

            };


        }



        //--------------------------------
        // Badge requirement
        //--------------------------------

        if (
            rule.badge
            &&
            !this.hasBadge(
                rule.badge,
                trainerState
            )
        ) {


            return {

                allowed:false,

                reason:
                    `Requires ${rule.badge}`

            };


        }



        //--------------------------------
        // Story requirement
        //--------------------------------

        if (
            rule.storyFlag
            &&
            !this.hasStoryRequirement(
                rule.storyFlag,
                trainerState
            )
        ) {


            return {

                allowed:false,

                reason:
                    `Requires ${rule.storyFlag}`

            };


        }



        return {

            allowed:true

        };


    }





    //--------------------------------
    // HM ownership
    //--------------------------------


    hasHM(
        hm,
        trainerState
    ) {


        if (
            trainerState.hasHM
        ) {


            return trainerState.hasHM(
                hm
            );


        }



        return (
            trainerState.hms
            ||
            []
        )
        .includes(
            hm
        );


    }





    //--------------------------------
    // Badge checks
    //--------------------------------


    hasBadge(
        badge,
        trainerState
    ) {


        if (
            trainerState.hasBadge
        ) {


            return trainerState.hasBadge(
                badge
            );


        }



        return (
            trainerState.badges
            ||
            []
        )
        .includes(
            badge
        );


    }





    hasBadges(
        badges,
        trainerState
    ) {


        for (
            const badge of badges
        ) {


            if (
                !this.hasBadge(
                    badge,
                    trainerState
                )
            ) {


                return false;


            }


        }


        return true;


    }





    //--------------------------------
    // Key item checks
    //--------------------------------


    hasKeyItem(
        item,
        trainerState
    ) {


        if (
            trainerState.hasKeyItem
        ) {


            return trainerState.hasKeyItem(
                item
            );


        }



        return (
            trainerState.keyItems
            ||
            []
        )
        .includes(
            item
        );


    }





    //--------------------------------
    // Story checks
    //--------------------------------


    hasStoryRequirement(
        flag,
        trainerState
    ) {


        if (
            trainerState.hasStoryFlag
        ) {


            return trainerState.hasStoryFlag(
                flag
            );


        }



        return (
            trainerState.storyFlags
            ||
            []
        )
        .includes(
            flag
        );


    }



    isBeforeEvent(
        flag,
        trainerState
    ) {


        return !this.hasStoryRequirement(
            flag,
            trainerState
        );


    }





    //--------------------------------
    // Location progression
    //--------------------------------


    canAccessLocation(
        location,
        trainerState
    ) {


        switch(location) {



            //--------------------------------
            // S.S Anne
            //--------------------------------

            case "MAP_SSANNE_EXTERIOR":


                if (
                    !this.hasKeyItem(
                        "SS_TICKET",
                        trainerState
                    )
                ) {


                    return {

                        allowed:false,

                        reason:
                            "Requires SS_TICKET"

                    };


                }



                if (
                    this.hasStoryRequirement(
                        "SS_ANNE_DEPARTED",
                        trainerState
                    )
                ) {


                    return {

                        allowed:false,

                        reason:
                            "SS Anne has departed"

                    };


                }


                break;




            //--------------------------------
            // Victory Road
            //--------------------------------

            case "MAP_VICTORY_ROAD_1F":


                if (
                    (
                        trainerState.badges
                        ||
                        []
                    )
                    .length < 8
                ) {


                    return {

                        allowed:false,

                        reason:
                            "Requires all 8 badges"

                    };


                }


                break;


        }



        return {

            allowed:true

        };


    }


}


module.exports = ProgressionService;
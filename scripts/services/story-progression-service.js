/**
 * Pokémon Companion
 * Story Progression Service
 *
 * Handles main story progression.
 *
 * Responsibilities:
 * - Check story flags.
 * - Check story unlocks.
 * - Provide next objectives.
 * - Evaluate important events.
 *
 * Does NOT:
 * - Handle battles.
 * - Handle map traversal.
 * - Parse ROM data.
 * - Modify trainer state.
 */

"use strict";


class StoryProgressionService {



    constructor() {


        this.storyRules = [


            //--------------------------------
            // Beginning
            //--------------------------------

            {
                id:
                    "GET_OAK_PARCEL",

                description:
                    "Deliver Oak's Parcel to Professor Oak.",

                location:
                    "VIRIDIAN_CITY",

                requirement:
                    null,

                completionFlag:
                    "OAK_PARCEL_DELIVERED"

            },



            {
                id:
                    "RECEIVE_POKEDEX",

                description:
                    "Receive the Pokédex from Professor Oak.",

                location:
                    "PALLET_TOWN",

                requirement:
                    {
                        storyFlag:
                            "OAK_PARCEL_DELIVERED"
                    },

                completionFlag:
                    "POKEDEX_RECEIVED"

            },





            //--------------------------------
            // Mt Moon
            //--------------------------------


            {
                id:
                    "COMPLETE_MT_MOON",

                description:
                    "Travel through Mt. Moon.",

                location:
                    "MAP_MT_MOON_1F",

                requirement:
                    {
                        badge:
                            "BOULDER_BADGE"
                    },

                completionFlag:
                    "MT_MOON_COMPLETED"

            },







            //--------------------------------
            // Bill
            //--------------------------------


            {
                id:
                    "HELP_BILL",

                description:
                    "Help Bill with his Pokémon experiment.",

                location:
                    "MAP_BILLS_HOUSE",

                requirement:
                    {
                        storyFlag:
                            "MT_MOON_COMPLETED"
                    },

                completionFlag:
                    "BILL_EVENT_COMPLETED"

            },







            //--------------------------------
            // SS Anne
            //--------------------------------


            {
                id:
                    "ENTER_SS_ANNE",

                description:
                    "Board the S.S. Anne.",

                location:
                    "MAP_SSANNE_EXTERIOR",

                requirement:
                    {
                        keyItem:
                            "SS_TICKET"
                    },

                completionFlag:
                    "SS_ANNE_ENTERED"

            },



            {
                id:
                    "SS_ANNE_DEPART",

                description:
                    "Complete the S.S. Anne event.",

                location:
                    "MAP_SSANNE",

                requirement:
                    {
                        storyFlag:
                            "SS_ANNE_ENTERED"
                    },

                completionFlag:
                    "SS_ANNE_DEPARTED"

            },








            //--------------------------------
            // Silph Co
            //--------------------------------


            {
                id:
                    "CLEAR_SILPH_CO",

                description:
                    "Defeat Team Rocket in Silph Co.",

                location:
                    "MAP_SILPH_CO_1F",

                requirement:
                    {
                        badge:
                            "RAINBOW_BADGE"
                    },

                completionFlag:
                    "SILPH_CO_COMPLETED"

            },







            //--------------------------------
            // Elite Four
            //--------------------------------


            {
                id:
                    "UNLOCK_ELITE_FOUR",

                description:
                    "Challenge the Pokémon League.",

                location:
                    "MAP_POKEMON_LEAGUE",

                requirement:
                    {
                        badges: [

                            "BOULDER_BADGE",
                            "CASCADE_BADGE",
                            "THUNDER_BADGE",
                            "RAINBOW_BADGE",
                            "SOUL_BADGE",
                            "MARSH_BADGE",
                            "VOLCANO_BADGE",
                            "EARTH_BADGE"

                        ]
                    },

                completionFlag:
                    "ELITE_FOUR_UNLOCKED"

            }


        ];


    }








    //--------------------------------
    // Get all rules
    //--------------------------------


    getAllRules()
    {


        return this.storyRules;


    }









    //--------------------------------
    // Find rule
    //--------------------------------


    getRule(id)
    {


        return (

            this.storyRules.find(

                rule =>
                    rule.id === id

            )

            ||

            null

        );


    }









    //--------------------------------
    // Check requirement
    //--------------------------------


    canComplete(
        id,
        trainerState
    )
    {


        const rule =
            this.getRule(
                id
            );



        if(
            !rule
        )
        {


            return {

                allowed:false,

                reason:
                    "Unknown story objective"

            };


        }






        if(
            !rule.requirement
        )
        {


            return {

                allowed:true

            };


        }






        const requirement =
            rule.requirement;







        if(
            requirement.badge
            &&
            !this.hasBadge(

                requirement.badge,

                trainerState

            )
        )
        {


            return {

                allowed:false,

                reason:
                    `Requires ${requirement.badge}`

            };


        }







        if(
            requirement.badges
        )
        {


            for(
                const badge of requirement.badges
            )
            {


                if(
                    !this.hasBadge(
                        badge,
                        trainerState
                    )
                )
                {


                    return {

                        allowed:false,

                        reason:
                            `Requires ${badge}`

                    };


                }


            }


        }







        if(
            requirement.keyItem
            &&
            !this.hasKeyItem(

                requirement.keyItem,

                trainerState

            )
        )
        {


            return {

                allowed:false,

                reason:
                    `Requires ${requirement.keyItem}`

            };


        }








        if(
            requirement.storyFlag
            &&
            !this.hasStoryFlag(

                requirement.storyFlag,

                trainerState

            )
        )
        {


            return {

                allowed:false,

                reason:
                    `Requires ${requirement.storyFlag}`

            };


        }







        return {

            allowed:true

        };


    }









    //--------------------------------
    // Next objectives
    //--------------------------------


    getNextObjectives(
        trainerState
    )
    {


        return this.storyRules.filter(

            rule => {


                if(
                    trainerState.hasStoryFlag(
                        rule.completionFlag
                    )
                )
                {

                    return false;

                }



                return this.canComplete(

                    rule.id,

                    trainerState

                )
                .allowed;


            }

        );


    }









    //--------------------------------
    // State checks
    //--------------------------------


    hasBadge(
        badge,
        trainerState
    )
    {


        return (

            trainerState.badges
            ||
            []

        )
        .includes(
            badge
        );


    }






    hasKeyItem(
        item,
        trainerState
    )
    {


        return (

            trainerState.keyItems
            ||
            []

        )
        .includes(
            item
        );


    }






    hasStoryFlag(
        flag,
        trainerState
    )
    {


        return (

            trainerState.storyFlags
            ||
            []

        )
        .includes(
            flag
        );


    }





}



module.exports =
    StoryProgressionService;
/**
 * Pokémon Companion
 * Story Progression Service
 *
 * Handles main story progression.
 *
 * Responsibilities:
 * - Check story flags.
 * - Check completed events.
 * - Check story unlocks.
 * - Provide next objectives.
 * - Evaluate important events.
 *
 * Does NOT:
 * - Handle battles.
 * - Handle map traversal.
 * - Parse ROM data.
 * - Modify trainer state.
 *
 * Important:
 * - Story objectives describe milestones.
 * - Actual event requirements are resolved by the
 *   event/world-state systems.
 * - This service must not impose artificial gym-order
 *   restrictions on alternate FireRed routes.
 */

"use strict";


class StoryProgressionService
{


    constructor()
    {

        this.storyRules =
        [

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
            // S.S. Anne
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
            // Silph Co.
            //
            // IMPORTANT:
            //
            // Do not require RAINBOW_BADGE here.
            //
            // FireRed's world progression allows the
            // player to reach Saffron and Silph Co.
            // through an alternate route before
            // completing Gym 3 or Gym 4.
            //
            // The actual event scripts and world-state
            // system are responsible for determining
            // whether the player can enter and complete
            // the event.
            //--------------------------------

            {
                id:
                    "CLEAR_SILPH_CO",

                description:
                    "Defeat Team Rocket in Silph Co.",

                location:
                    "MAP_SILPH_CO_1F",

                requirement:
                    null,

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
                },

                completionFlag:
                    "ELITE_FOUR_UNLOCKED"

            }

        ];

    }





    //--------------------------------
    // Get rules
    //--------------------------------

    getAllRules()
    {

        return this.storyRules;

    }





    //--------------------------------
    // Get rule
    //--------------------------------

    getRule(
        id
    )
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
    // Can objective start?
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

                allowed:
                    false,

                reason:
                    "Unknown story objective"

            };

        }


        const requirement =
            rule.requirement;


        if(
            !requirement
        )
        {

            return {

                allowed:
                    true

            };

        }


        //--------------------------------
        // Single badge
        //--------------------------------

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

                allowed:
                    false,

                reason:
                    `Requires ${requirement.badge}`

            };

        }


        //--------------------------------
        // Multiple badges
        //--------------------------------

        if(
            requirement.badges
        )
        {

            for(
                const badge of
                    requirement.badges
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

                        allowed:
                            false,

                        reason:
                            `Requires ${badge}`

                    };

                }

            }

        }


        //--------------------------------
        // Single key item
        //--------------------------------

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

                allowed:
                    false,

                reason:
                    `Requires ${requirement.keyItem}`

            };

        }


        //--------------------------------
        // Single story flag
        //--------------------------------

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

                allowed:
                    false,

                reason:
                    `Requires ${requirement.storyFlag}`

            };

        }


        return {

            allowed:
                true

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

            rule =>
            {

                //--------------------------------
                // Already completed
                //--------------------------------

                if(
                    this.isCompleted(

                        rule,

                        trainerState

                    )
                )
                {

                    return false;

                }


                //--------------------------------
                // Requirement satisfied
                //--------------------------------

                return this.canComplete(

                    rule.id,

                    trainerState

                )
                .allowed;

            }

        );

    }





    //--------------------------------
    // Completion check
    //--------------------------------

    isCompleted(
        rule,
        trainerState
    )
    {

        //--------------------------------
        // Story flag completed
        //--------------------------------

        if(
            this.hasStoryFlag(

                rule.completionFlag,

                trainerState

            )
        )
        {

            return true;

        }


        //--------------------------------
        // Event completed
        //--------------------------------

        if(
            trainerState.completedEvents
        )
        {

            if(
                trainerState.completedEvents.includes(

                    rule.id

                )
            )
            {

                return true;

            }


            if(
                trainerState.completedEvents.includes(

                    rule.completionFlag

                )
            )
            {

                return true;

            }

        }


        return false;

    }





    //--------------------------------
    // State helpers
    //--------------------------------

    hasBadge(
        badge,
        trainerState
    )
    {

        if(
            trainerState
            &&
            typeof trainerState.hasBadge ===
                "function"
        )
        {

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





    hasKeyItem(
        item,
        trainerState
    )
    {

        if(
            trainerState
            &&
            typeof trainerState.hasKeyItem ===
                "function"
        )
        {

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





    hasStoryFlag(
        flag,
        trainerState
    )
    {

        if(
            trainerState
            &&
            typeof trainerState.hasStoryFlag ===
                "function"
        )
        {

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


}





module.exports =
    StoryProgressionService;
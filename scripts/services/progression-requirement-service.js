/**
 * Pokémon Companion
 * Progression Requirement Service
 *
 * Checks if player progression
 * satisfies requirements.
 *
 * Responsibilities:
 * - Check badges.
 * - Check story flags.
 * - Check items.
 * - Check locations.
 * - Check abilities.
 * - Check Champion status.
 * - Check National Dex.
 *
 * Does NOT:
 * - Handle Pokémon.
 * - Handle battles.
 * - Handle recommendations.
 */

"use strict";





class ProgressionRequirementService {



    //--------------------------------
    // Check requirements
    //--------------------------------


    check(
        requirements,
        playerState
    )
    {


        if(
            !requirements
        )
        {

            return {

                available:true

            };

        }





        const checks =
        [

            this.checkBadges(
                requirements.badges,
                playerState
            ),


            this.checkStoryFlags(
                requirements.storyFlags,
                playerState
            ),


            this.checkItems(
                requirements.items,
                playerState
            ),


            this.checkLocations(
                requirements.locations,
                playerState
            ),


            this.checkAbilities(
                requirements.abilities,
                playerState
            ),


            this.checkChampion(
                requirements.championDefeated,
                playerState
            ),


            this.checkNationalDex(
                requirements.nationalDex,
                playerState
            )

        ];






        for(
            const result of checks
        )
        {

            if(
                !result.available
            )
            {

                return result;

            }

        }








        return {

            available:true

        };


    }









    //--------------------------------
    // Badges
    //--------------------------------


    checkBadges(
        badges,
        playerState
    )
    {


        if(
            !badges
            ||
            badges.length === 0
        )
        {

            return {

                available:true

            };

        }





        const owned =
            playerState.badges || [];





        for(
            const badge of badges
        )
        {

            if(
                !owned.includes(
                    badge
                )
            )
            {

                return {

                    available:false,

                    reason:
                    "Missing badge: " + badge

                };

            }

        }





        return {

            available:true

        };


    }









    //--------------------------------
    // Story flags
    //--------------------------------


    checkStoryFlags(
        flags,
        playerState
    )
    {


        if(
            !flags
            ||
            flags.length === 0
        )
        {

            return {

                available:true

            };

        }





        const completed =
            playerState.storyFlags || [];





        for(
            const flag of flags
        )
        {

            if(
                !completed.includes(
                    flag
                )
            )
            {

                return {

                    available:false,

                    reason:
                    "Missing story flag: " + flag

                };

            }

        }





        return {

            available:true

        };


    }









    //--------------------------------
    // Items
    //--------------------------------


    checkItems(
        items,
        playerState
    )
    {


        if(
            !items
            ||
            items.length === 0
        )
        {

            return {

                available:true

            };

        }





        const inventory =
            playerState.items || {};





        for(
            const item of items
        )
        {

            if(
                !inventory[item]
            )
            {

                return {

                    available:false,

                    reason:
                    "Missing item: " + item

                };

            }

        }





        return {

            available:true

        };


    }









    //--------------------------------
    // Locations
    //--------------------------------


    checkLocations(
        locations,
        playerState
    )
    {


        if(
            !locations
            ||
            locations.length === 0
        )
        {

            return {

                available:true

            };

        }





        const unlocked =
            playerState.locations || [];





        for(
            const location of locations
        )
        {

            if(
                !unlocked.includes(
                    location
                )
            )
            {

                return {

                    available:false,

                    reason:
                    "Location unavailable: " + location

                };

            }

        }





        return {

            available:true

        };


    }









    //--------------------------------
    // Abilities
    //--------------------------------


    checkAbilities(
        abilities,
        playerState
    )
    {


        if(
            !abilities
            ||
            abilities.length === 0
        )
        {

            return {

                available:true

            };

        }





        const owned =
            playerState.abilities || [];





        for(
            const ability of
                abilities
        )
        {

            if(
                !owned.includes(
                    ability
                )
            )
            {

                return {

                    available:false,

                    reason:
                    "Missing ability: " + ability

                };

            }

        }





        return {

            available:true

        };


    }









    //--------------------------------
    // Champion
    //--------------------------------


    checkChampion(
        required,
        playerState
    )
    {


        if(
            !required
        )
        {

            return {

                available:true

            };

        }





        if(
            !playerState.championDefeated
        )
        {

            return {

                available:false,

                reason:
                "Champion not defeated"

            };

        }





        return {

            available:true

        };


    }









    //--------------------------------
    // National Dex
    //--------------------------------


    checkNationalDex(
        required,
        playerState
    )
    {


        if(
            !required
        )
        {

            return {

                available:true

            };

        }





        if(
            !playerState.nationalDex
        )
        {

            return {

                available:false,

                reason:
                "National Dex required"

            };

        }





        return {

            available:true

        };


    }



}





module.exports =
    ProgressionRequirementService;
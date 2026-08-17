/**
 * Pokémon Companion
 * Map Access Service
 *
 * Handles world location unlock rules.
 *
 * Responsibilities:
 * - Check location accessibility.
 * - Evaluate HM requirements.
 * - Evaluate story requirements.
 * - Evaluate badge requirements.
 * - Evaluate key item requirements.
 *
 * Does NOT:
 * - Move player.
 * - Load maps.
 * - Modify trainer state.
 */

"use strict";


class MapAccessService {


    constructor()
    {


        this.locations = [


            //--------------------------------
            // Starting areas
            //--------------------------------


            {
                id:
                    "PALLET_TOWN",

                requirement:
                    null

            },


            {
                id:
                    "VIRIDIAN_CITY",

                requirement:
                    null

            },





            //--------------------------------
            // Early game
            //--------------------------------


            {
                id:
                    "PEWTER_CITY",

                requirement:
                {
                    storyFlags:
                    [
                        "POKEDEX_RECEIVED"
                    ]
                }

            },





            {
                id:
                    "MT_MOON",

                requirement:
                {
                    badges:
                    [
                        "BOULDER_BADGE"
                    ]
                }

            },





            {
                id:
                    "CERULEAN_CITY",

                requirement:
                {
                    badges:
                    [
                        "BOULDER_BADGE"
                    ]
                }

            },








            //--------------------------------
            // Cut progression
            //--------------------------------


            {
                id:
                    "VERMILION_CITY",

                requirement:
                {
                    hm:
                        "CUT"
                }

            },







            {
                id:
                    "ROCK_TUNNEL",

                requirement:
                {
                    hm:
                        "FLASH",

                    badges:
                    [
                        "BOULDER_BADGE"
                    ]

                }

            },








            //--------------------------------
            // Mid game
            //--------------------------------


            {
                id:
                    "CELADON_CITY",

                requirement:
                {
                    badges:
                    [
                        "BOULDER_BADGE"
                    ]
                }

            },





            {
                id:
                    "FUCHSIA_CITY",

                requirement:
                {
                    access:
                        "CELADON_CITY"
                }

            },







            //--------------------------------
            // Saffron
            //--------------------------------


            {
                id:
                    "SAFFRON_CITY",

                requirement:
                {
                    storyFlags:
                    [
                        "SILPH_CO_COMPLETED"
                    ]
                }

            },








            //--------------------------------
            // Cinnabar
            //--------------------------------


            {
                id:
                    "CINNABAR_ISLAND",

                requirement:
                {
                    hm:
                        "SURF"
                }

            }


        ];

    }









    //--------------------------------
    // Get all locations
    //--------------------------------


    getAllLocations()
    {

        return this.locations;

    }









    //--------------------------------
    // Find location
    //--------------------------------


    getLocation(
        id
    )
    {

        return (

            this.locations.find(

                location =>

                    location.id === id

            )

            ||

            null

        );

    }









    //--------------------------------
    // Access check
    //--------------------------------


    canAccess(
        locationId,
        trainerState
    )
    {


        const location =
            this.getLocation(
                locationId
            );



        if(
            !location
        )
        {

            return {

                allowed:false,

                reason:
                    "Unknown location"

            };

        }







        const requirement =
            location.requirement;



        if(
            !requirement
        )
        {

            return {

                allowed:true

            };

        }








        //--------------------------------
        // Story flags
        //--------------------------------


        if(
            requirement.storyFlags
        )
        {

            for(
                const flag of requirement.storyFlags
            )
            {

                if(
                    !trainerState.hasStoryFlag(flag)
                )
                {

                    return {

                        allowed:false,

                        reason:
                            `Requires story flag ${flag}`

                    };

                }

            }

        }








        //--------------------------------
        // Badges
        //--------------------------------


        if(
            requirement.badges
        )
        {

            for(
                const badge of requirement.badges
            )
            {

                if(
                    !trainerState.hasBadge(badge)
                )
                {

                    return {

                        allowed:false,

                        reason:
                            `Requires badge ${badge}`

                    };

                }

            }

        }








        //--------------------------------
        // HM requirements
        //--------------------------------


        if(
            requirement.hm
        )
        {


            if(
                !this.hasHM(
                    requirement.hm,
                    trainerState
                )
            )
            {

                return {

                    allowed:false,

                    reason:
                        `Requires HM ${requirement.hm}`

                };

            }


        }








        //--------------------------------
        // Connected access
        //--------------------------------


        if(
            requirement.access
        )
        {


            if(
                !trainerState.hasVisited(
                    requirement.access
                )
            )
            {

                return {

                    allowed:false,

                    reason:
                        `Requires access to ${requirement.access}`

                };

            }

        }








        return {

            allowed:true

        };


    }









    //--------------------------------
    // HM check
    //--------------------------------


    hasHM(
        hm,
        trainerState
    )
    {


        if(
            trainerState.hasHM
            &&
            trainerState.hasHM(hm)
        )
        {

            return true;

        }



        if(
            trainerState.hms
            &&
            trainerState.hms.includes(hm)
        )
        {

            return true;

        }



        if(
            trainerState.hmAbilities
            &&
            trainerState.hmAbilities.includes(hm)
        )
        {

            return true;

        }



        return false;

    }









    //--------------------------------
    // Available locations
    //--------------------------------


    getAvailableLocations(
        trainerState
    )
    {


        return this.locations.filter(

            location =>

                this.canAccess(

                    location.id,

                    trainerState

                )
                .allowed

        );

    }









    //--------------------------------
    // Unlock location
    //--------------------------------


    unlockLocation(
        locationId,
        trainerState
    )
    {


        const result =
            this.canAccess(

                locationId,

                trainerState

            );



        if(
            !result.allowed
        )
        {

            return {

                success:false,

                reason:
                    result.reason

            };

        }





        trainerState.visitLocation(
            locationId
        );





        return {

            success:true,

            location:
                locationId

        };


    }


}



module.exports =
    MapAccessService;
/**
 * Pokémon Companion
 * Gym Progression Service
 *
 * Provides FireRed gym progression data.
 *
 * Responsibilities:
 * - Provide gym order.
 * - Provide gym unlock progression.
 * - Check gym availability.
 * - Check badge ownership.
 *
 * Does NOT:
 * - Read ROM data.
 * - Handle map traversal.
 * - Analyze Pokémon.
 * - Execute battles.
 */

"use strict";


class GymProgressionService {



    constructor() {


        this.gyms = [


            {
                id: "TRAINER_LEADER_BROCK",
                name: "Brock",
                city: "PEWTER_CITY",
                badge: "BOULDER_BADGE",
                order: 1,
                requirement: null
            },


            {
                id: "TRAINER_LEADER_MISTY",
                name: "Misty",
                city: "CERULEAN_CITY",
                badge: "CASCADE_BADGE",
                order: 2,

                requirement: {

                    badges: [
                        "BOULDER_BADGE"
                    ]

                }
            },


            {
                id: "TRAINER_LEADER_LT_SURGE",
                name: "Lt. Surge",
                city: "VERMILION_CITY",
                badge: "THUNDER_BADGE",
                order: 3,

                requirement: {

                    badges: [
                        "CASCADE_BADGE"
                    ]

                }
            },


            {
                id: "TRAINER_LEADER_ERIKA",
                name: "Erika",
                city: "CELADON_CITY",
                badge: "RAINBOW_BADGE",
                order: 4,

                requirement: {

                    badges: [
                        "THUNDER_BADGE"
                    ]

                }
            },


            {
                id: "TRAINER_LEADER_KOGA",
                name: "Koga",
                city: "FUCHSIA_CITY",
                badge: "SOUL_BADGE",
                order: 5,

                requirement: {

                    badges: [
                        "RAINBOW_BADGE"
                    ]

                }
            },


            {
                id: "TRAINER_LEADER_SABRINA",
                name: "Sabrina",
                city: "SAFFRON_CITY",
                badge: "MARSH_BADGE",
                order: 6,

                requirement: {

                    badges: [
                        "SOUL_BADGE"
                    ]

                }
            },


            {
                id: "TRAINER_LEADER_BLAINE",
                name: "Blaine",
                city: "CINNABAR_ISLAND",
                badge: "VOLCANO_BADGE",
                order: 7,

                requirement: {

                    badges: [
                        "MARSH_BADGE"
                    ]

                }
            },


            {
                id: "TRAINER_LEADER_BLUE",
                name: "Blue",
                city: "VIRIDIAN_CITY",
                badge: "EARTH_BADGE",
                order: 8,

                requirement: {

                    badges: [
                        "VOLCANO_BADGE"
                    ]

                }
            }


        ];


    }





    //--------------------------------
    // Gym lookup
    //--------------------------------


    getAllGyms() {


        return this.gyms;


    }





    getGym(id) {


        return (

            this.gyms.find(

                gym =>
                    gym.id === id

            )

            ||

            null

        );


    }





    getPreviousGyms(id) {


        const gym =
            this.getGym(
                id
            );



        if(
            !gym
        ) {

            return [];

        }



        return this.gyms.filter(

            entry =>
                entry.order < gym.order

        );


    }





    //--------------------------------
    // Gym availability
    //--------------------------------


    canChallengeGym(
        id,
        trainerState
    ) {


        const gym =
            this.getGym(
                id
            );



        if(
            !gym
        ) {


            return {

                allowed:false,

                reason:
                    "Unknown gym"

            };


        }





        if(

            trainerState.hasCompletedBattle
            &&
            trainerState.hasCompletedBattle(
                id
            )

        ) {


            return {

                allowed:false,

                reason:
                    "Gym already defeated"

            };


        }





        if(
            gym.requirement
            &&
            gym.requirement.badges
        ) {


            const hasRequirements =
                gym.requirement.badges.every(

                    badge =>

                        this.playerHasBadge(
                            badge,
                            trainerState
                        )

                );



            if(
                !hasRequirements
            ) {


                return {

                    allowed:false,

                    reason:
                        "Missing required badges"

                };


            }


        }





        return {

            allowed:true

        };


    }





    //--------------------------------
    // Available gyms
    //--------------------------------


    getAvailableGyms(
        trainerState
    ) {


        return this.gyms.filter(

            gym =>

                this.canChallengeGym(

                    gym.id,

                    trainerState

                )
                .allowed

        );


    }





    //--------------------------------
    // Badge checks
    //--------------------------------


    playerHasBadge(
        badge,
        trainerState
    ) {


        if(
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





    hasBadge(
        gymId,
        trainerState
    ) {


        const gym =
            this.getGym(
                gymId
            );



        if(
            !gym
        ) {

            return false;

        }



        return this.playerHasBadge(
            gym.badge,
            trainerState
        );


    }





    getGymCount() {


        return this.gyms.length;


    }





    getCompletedGymCount(
        trainerState
    ) {


        return this.gyms.filter(

            gym =>

                trainerState.hasCompletedBattle
                &&
                trainerState.hasCompletedBattle(
                    gym.id
                )

        )
        .length;


    }



}



module.exports =
    GymProgressionService;
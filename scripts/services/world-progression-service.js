/**
 * Pokémon Companion
 * World Progression Service
 *
 * Combines all progression systems.
 *
 * Responsibilities:
 * - Provide current objectives.
 * - Combine story progression.
 * - Combine gym progression.
 * - Find available activities.
 * - Provide world progress summary.
 *
 * Does NOT:
 * - Modify trainer state.
 * - Handle battles.
 * - Traverse maps.
 * - Parse ROM data.
 */

"use strict";



class WorldProgressionService {



    constructor(
        storyProgressionService,
        gymProgressionService,
        progressionService = null
    ) {


        this.story =
            storyProgressionService;


        this.gyms =
            gymProgressionService;


        this.progression =
            progressionService;


    }






    //--------------------------------
    // Current objectives
    //--------------------------------


    getCurrentObjectives(
        trainerState
    ) {


        const objectives = [];





        //--------------------------------
        // Story objectives
        //--------------------------------


        const storyObjectives =
            this.story
                .getNextObjectives(
                    trainerState
                );



        for(
            const objective of storyObjectives
        ) {


            objectives.push(

                {

                    type:
                        "STORY",


                    id:
                        objective.id,


                    description:
                        objective.description,


                    location:
                        objective.location


                }

            );


        }








        //--------------------------------
        // Gym objectives
        //--------------------------------


        const availableGyms =
            this.gyms
                .getAvailableGyms(
                    trainerState
                );



        for(
            const gym of availableGyms
        ) {


            objectives.push(

                {

                    type:
                        "GYM",


                    id:
                        gym.id,


                    description:
                        `Defeat ${gym.name}.`,


                    location:
                        gym.city


                }

            );


        }





        return objectives;


    }









    //--------------------------------
    // Available gyms
    //--------------------------------


    getAvailableGyms(
        trainerState
    ) {


        return this.gyms
            .getAvailableGyms(
                trainerState
            );


    }









    //--------------------------------
    // Story progress
    //--------------------------------


    getCompletedStoryFlags(
        trainerState
    ) {


        return (

            trainerState.storyFlags

            ||

            []

        );


    }









    //--------------------------------
    // Badge progress
    //--------------------------------


    getBadgeProgress(
        trainerState
    ) {


        return {


            obtained:

                (

                    trainerState.badges

                    ||

                    []

                ),



            count:

                (

                    trainerState.badges

                    ||

                    []

                )
                .length



        };


    }









    //--------------------------------
    // World summary
    //--------------------------------


    getWorldSummary(
        trainerState
    ) {


        return {


            location:
                trainerState.currentLocation
                ||
                null,



            badges:
                this.getBadgeProgress(
                    trainerState
                ),



            storyFlags:
                this.getCompletedStoryFlags(
                    trainerState
                ),



            objectives:
                this.getCurrentObjectives(
                    trainerState
                )



        };


    }









    //--------------------------------
    // Check if player has completed
    //--------------------------------


    isGameComplete(
        trainerState
    ) {


        return (

            trainerState.storyFlags
            ||
            []

        )
        .includes(

            "ELITE_FOUR_UNLOCKED"

        );


    }





}



module.exports =
    WorldProgressionService;
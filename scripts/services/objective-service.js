/**
 * Pokémon Companion
 * Objective Service
 *
 * Central objective manager.
 *
 * Responsibilities:
 * - Combine story objectives.
 * - Combine gym objectives.
 * - Combine progression objectives.
 * - Provide current player goals.
 *
 * Does NOT:
 * - Modify trainer state.
 * - Execute events.
 * - Handle battles.
 * - Traverse maps.
 */

"use strict";


class ObjectiveService {



    constructor(
        storyProgressionService,
        gymService,
        progressionService = null
    ) {


        this.story =
            storyProgressionService;


        this.gym =
            gymService;


        this.progression =
            progressionService;


    }







    //--------------------------------
    // Get all current objectives
    //--------------------------------


    getObjectives(
        trainerState
    ) {


        const objectives = [];





        //--------------------------------
        // Story objectives
        //--------------------------------


        if(
            this.story
        ) {


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


                        title:
                            objective.description,


                        location:
                            objective.location


                    }

                );


            }


        }









        //--------------------------------
        // Gym objectives
        //--------------------------------


        if(
            this.gym
        ) {


            const gyms =
                this.gym
                    .getAvailableGyms(
                        trainerState
                    );



            for(
                const gym of gyms
            ) {


                objectives.push(

                    {

                        type:
                            "GYM",


                        id:
                            gym.id,


                        title:
                            `Defeat ${gym.name}.`,


                        location:
                            gym.city


                    }

                );


            }


        }







        return objectives;


    }









    //--------------------------------
    // Find next objective
    //--------------------------------


    getNextObjective(
        trainerState
    ) {


        const objectives =
            this.getObjectives(
                trainerState
            );



        return (

            objectives[0]

            ||

            null

        );


    }









    //--------------------------------
    // Filter objectives
    //--------------------------------


    getObjectivesByType(
        type,
        trainerState
    ) {


        return this.getObjectives(
            trainerState
        )
        .filter(

            objective =>

                objective.type === type

        );


    }









    //--------------------------------
    // Objective summary
    //--------------------------------


    getSummary(
        trainerState
    ) {


        const objectives =
            this.getObjectives(
                trainerState
            );



        return {


            count:
                objectives.length,


            objectives:
                objectives


        };


    }









    //--------------------------------
    // Check if objective exists
    //--------------------------------


    hasObjectives(
        trainerState
    ) {


        return (

            this.getObjectives(
                trainerState
            )
            .length > 0

        );


    }





}



module.exports =
    ObjectiveService;
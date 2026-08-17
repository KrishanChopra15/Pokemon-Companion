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
        gymService = null,
        progressionService = null
    )
    {


        this.story =
            storyProgressionService;


        this.gym =
            gymService;


        this.progression =
            progressionService;


    }








    //--------------------------------
    // Get story objectives
    //--------------------------------


    getStoryObjectives(
        trainerState
    )
    {


        if(
            !this.story
        )
        {

            return [];

        }



        return this.story
            .getNextObjectives(
                trainerState
            )
            .map(

                objective =>

                ({

                    type:
                        "STORY",


                    id:
                        objective.id,


                    title:
                        objective.description,


                    location:
                        objective.location


                })

            );


    }









    //--------------------------------
    // Get gym objectives
    //--------------------------------


    getGymObjectives(
        trainerState
    )
    {


        if(
            !this.gym
            ||
            typeof this.gym.getAvailableGyms !== "function"
        )
        {

            return [];

        }





        return this.gym
            .getAvailableGyms(
                trainerState
            )
            .map(

                gym =>

                ({

                    type:
                        "GYM",


                    id:
                        gym.id,


                    title:
                        `Defeat ${gym.name}.`,


                    location:
                        gym.city


                })

            );


    }









    //--------------------------------
    // Get all objectives
    //--------------------------------


    getObjectives(
        trainerState
    )
    {


        const objectives = [];





        //--------------------------------
        // Story priority
        //--------------------------------


        objectives.push(

            ...this.getStoryObjectives(
                trainerState
            )

        );






        //--------------------------------
        // Gym objectives
        //--------------------------------


        objectives.push(

            ...this.getGymObjectives(
                trainerState
            )

        );






        //--------------------------------
        // Future progression systems
        //--------------------------------


        if(
            this.progression
            &&
            typeof this.progression.getObjectives === "function"
        )
        {


            objectives.push(

                ...this.progression.getObjectives(
                    trainerState
                )

            );


        }






        return objectives;


    }









    //--------------------------------
    // Get next objective
    //--------------------------------


    getNextObjective(
        trainerState
    )
    {


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
    // Filter by type
    //--------------------------------


    getObjectivesByType(
        type,
        trainerState
    )
    {


        return this.getObjectives(
            trainerState
        )
        .filter(

            objective =>

                objective.type === type

        );


    }









    //--------------------------------
    // Summary
    //--------------------------------


    getSummary(
        trainerState
    )
    {


        const objectives =
            this.getObjectives(
                trainerState
            );



        return {


            count:
                objectives.length,


            objectives


        };


    }









    //--------------------------------
    // Has objectives
    //--------------------------------


    hasObjectives(
        trainerState
    )
    {


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
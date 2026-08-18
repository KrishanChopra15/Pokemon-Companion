/**
 * Pokémon Companion
 * Encounter Flow
 *
 * Coordinates wild encounters.
 *
 * Responsibilities:
 * - Check encounter availability.
 * - Generate encounter data.
 * - Store active encounter.
 * - Provide encounter results.
 *
 * Does NOT:
 * - Execute battles.
 * - Handle capture.
 * - Modify trainer state.
 * - Calculate damage.
 */

"use strict";





class EncounterFlow {



    constructor(
        encounterManager,
        locationDatabase
    )
    {


        this.encounters =
            encounterManager;


        this.locations =
            locationDatabase;


    }









    //--------------------------------
    // Generate encounter
    //--------------------------------


    generateEncounter(
        location,
        playerState = {}
    )
    {


        const pokemonList =
            this.getAvailablePokemon(
                location
            );



        if(
            pokemonList.length === 0
        )
        {

            return {

                success:false,

                reason:
                    "No Pokémon available"

            };

        }








        const species =
            pokemonList[

                Math.floor(

                    Math.random()

                    *

                    pokemonList.length

                )

            ];








        const encounter =
        {

            type:
                "WILD",


            location,


            species,


            level:
                this.generateLevel(
                    location
                )


        };








        this.encounters.setEncounter(

            encounter

        );








        return {

            success:true,

            encounter

        };


    }









    //--------------------------------
    // Available Pokémon
    //--------------------------------


    getAvailablePokemon(
        location
    )
    {


        const data =
            this.locations
                .getLocation(
                    location
                );



        if(
            !data
        )
        {

            return [];

        }








        if(
            !data.encounters
        )
        {

            return [];

        }








        return [

            ...new Set(

                data.encounters.map(

                    encounter =>

                        encounter.pokemon

                )

            )

        ];


    }









    //--------------------------------
    // Current encounter
    //--------------------------------


    getCurrentEncounter()
    {

        return this.encounters
            .getEncounter();

    }









    //--------------------------------
    // End encounter
    //--------------------------------


    endEncounter()
    {

        return this.encounters
            .clearEncounter();

    }









    //--------------------------------
    // Encounter level
    //--------------------------------


    generateLevel(
        location
    )
    {


        const data =
            this.locations
                .getLocation(
                    location
                );



        if(
            !data ||
            !data.encounters ||
            data.encounters.length === 0
        )
        {

            return 5;

        }








        const levels =
            data.encounters.map(

                encounter =>

                    encounter.level || 5

            );



        const min =
            Math.min(
                ...levels
            );


        const max =
            Math.max(
                ...levels
            );



        return Math.floor(

            Math.random()

            *

            (

                max -

                min +

                1

            )

        )

        +

        min;


    }









    //--------------------------------
    // Status
    //--------------------------------


    getStatus()
    {

        return {

            active:

                this.encounters
                    .hasEncounter(),


            encounter:

                this.encounters
                    .getEncounter()


        };


    }



}





module.exports =
    EncounterFlow;
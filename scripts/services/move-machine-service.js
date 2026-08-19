/**
 * Pokémon Companion
 * Move Machine Service
 *
 * Handles TM/HM move learning.
 *
 * Responsibilities:
 * - Load machine compatibility database.
 * - Check Pokémon TM/HM compatibility.
 * - Resolve complete move data.
 * - Create taught move slots.
 *
 * Does NOT:
 * - Consume items.
 * - Replace moves.
 * - Execute moves.
 * - Handle battles.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");


const PokemonMoveSlot =
    require("../domain/pokemon-move-slot");





class MoveMachineService {



    constructor(
        game = "firered",
        moveDatabase = null
    )
    {


        const databasePath =
            path.join(

                __dirname,

                "../../database/generated",

                game,

                "pokemon-machines.json"

            );



        this.machines =
            JSON.parse(

                fs.readFileSync(

                    databasePath,

                    "utf8"

                )

            );



        /**
         * Full move database service.
         *
         * Used for:
         * - PP
         * - Power
         * - Accuracy
         * - Effects
         */
        this.moveDatabase =
            moveDatabase;


    }









    //--------------------------------
    // Get Pokemon machines
    //--------------------------------


    getMachines(
        species
    )
    {


        const constant =
            species.startsWith(
                "SPECIES_"
            )

            ?

            species

            :

            "SPECIES_" +

            species.toUpperCase();




        const entry =
            this.machines.find(

                pokemon =>

                    pokemon.species === constant

            );



        return (

            entry

            ?

            entry.machines

            :

            []

        );


    }









    //--------------------------------
    // Check compatibility
    //--------------------------------


    canLearn(
        species,
        machine
    )
    {


        const machines =
            this.getMachines(
                species
            );



        return machines.some(

            entry =>

                entry.constant === machine

        );


    }









    //--------------------------------
    // Get compatible machines
    //--------------------------------


    getCompatibleMachines(
        species
    )
    {

        return this.getMachines(
            species
        );

    }









    //--------------------------------
    // Get machine move reference
    //--------------------------------


    getMove(
        species,
        machine
    )
    {


        const machines =
            this.getMachines(
                species
            );



        const found =
            machines.find(

                entry =>

                    entry.constant === machine

            );



        return (

            found

            ?

            found.move

            :

            null

        );


    }









    //--------------------------------
    // Resolve complete move data
    //--------------------------------


    resolveMove(
        species,
        machine
    )
    {


        const reference =
            this.getMove(

                species,

                machine

            );



        if(
            !reference
        )
        {

            return null;

        }





        if(
            !this.moveDatabase
        )
        {

            return reference;

        }





        return (

            this.moveDatabase.getMoveByConstant(
            
                reference.constant
            
            )

            ||

            reference

        );


    }









    //--------------------------------
    // Teach machine move
    //--------------------------------


    teachMove(
        species,
        machine
    )
    {


        const move =
            this.resolveMove(

                species,

                machine

            );



        if(
            !move
        )
        {

            return {

                success:false,

                reason:
                    "Pokemon cannot learn this move"

            };

        }






        const slot =
            new PokemonMoveSlot({

                constant:

                    move.constant,


                currentPP:

                    move.pp || 0,


                maxPP:

                    move.pp || 0


            });





        return {

            success:true,

            move:slot,

            data:move

        };


    }



}





module.exports =
    MoveMachineService;
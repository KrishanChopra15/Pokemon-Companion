/**
 * Pokémon Companion
 * Move Learning Service
 *
 * Handles Pokémon level-up move learning.
 *
 * Responsibilities:
 * - Load move learner database.
 * - Find moves learned by level.
 * - Create runtime move slots.
 * - Add newly learned moves.
 * - Request move replacement when needed.
 * - Execute selected move replacement.
 *
 * Does NOT:
 * - Teach TM/HM moves.
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





class MoveLearningService {



    constructor(
        game = "firered",
        moveDatabase = null,
        moveReplacement = null,
        moveReplacementSelection = null
    )
    {

        this.game =
            game;


        this.moveDatabase =
            moveDatabase;


        this.moveReplacement =
            moveReplacement;


        this.moveReplacementSelection =
            moveReplacementSelection;



        const databasePath =
            path.join(

                __dirname,

                "../../database/generated",

                game,

                "pokemon-move-learners.json"

            );



        this.learners =
            JSON.parse(

                fs.readFileSync(

                    databasePath,

                    "utf8"

                )

            );


    }









    //--------------------------------
    // Get learnset
    //--------------------------------


    getLearnset(
        pokemonId
    )
    {


        const id =
            String(pokemonId)
            .padStart(
                4,
                "0"
            );



        return (

            this.learners[id]

            ||

            []

        );


    }









    //--------------------------------
    // Get available level moves
    //--------------------------------


    getAvailableMoves(
        pokemon
    )
    {


        const learnset =
            this.getLearnset(
                pokemon.id
            );



        return learnset.filter(

            entry =>


                entry.method === "LEVEL"

                &&

                entry.level <= pokemon.level


        );


    }









    //--------------------------------
    // Get new moves
    //--------------------------------


    getNewMoves(
        pokemon
    )
    {


        const available =
            this.getAvailableMoves(
                pokemon
            );



        const currentMoves =
            pokemon.moves
            ||
            [];





        return available.filter(

            entry => {


                return !currentMoves.some(

                    move =>

                        move.constant ===
                        entry.move.constant

                );


            }


        );


    }









    //--------------------------------
    // Create runtime move slot
    //--------------------------------


    createMoveSlot(
        move
    )
    {


        return new PokemonMoveSlot({

            constant:
                move.constant,


            currentPP:
                move.pp,


            maxPP:
                move.pp


        });


    }









    //--------------------------------
    // Learn single move
    //--------------------------------


    learnMove(
        pokemon,
        move
    )
    {


        const currentMoves =
            pokemon.moves
            ||
            [];



        const slot =
            this.createMoveSlot(
                move
            );





        //--------------------------------
        // Duplicate
        //--------------------------------


        const exists =
            currentMoves.some(

                existing =>

                    existing.constant ===
                    move.constant

            );



        if(exists)
        {

            return {

                success:false,

                reason:
                    "Move already known"

            };

        }








        //--------------------------------
        // Empty slot
        //--------------------------------


        if(
            currentMoves.length < 4
        )
        {


            currentMoves.push(
                slot
            );


            pokemon.moves =
                currentMoves;



            return {

                success:true,

                move:slot

            };


        }








        //--------------------------------
        // Replacement required
        //--------------------------------


        if(
            !this.moveReplacement
        )
        {

            return {

                success:false,

                reason:
                    "Move replacement service unavailable"

            };

        }





        return {

            success:false,

            reason:
                "Needs replacement",


            options:

                this.moveReplacement.getReplacementOptions(

                    currentMoves,


                    {

                        constant:
                            move.constant,


                        pp:
                            move.pp

                    }

                )

        };


    }









    //--------------------------------
    // Execute chosen replacement
    //--------------------------------


    replaceLearnedMove(
        pokemon,
        forgottenMove,
        newMove
    )
    {


        if(
            !this.moveReplacementSelection
        )
        {

            return {

                success:false,

                reason:
                    "Move replacement selection service unavailable"

            };

        }



        return this.moveReplacementSelection.replaceMove(

            pokemon,

            forgottenMove,

            newMove

        );


    }









    //--------------------------------
    // Learn all available moves
    //--------------------------------


    learnAvailableMoves(
        pokemon
    )
    {


        const newMoves =
            this.getNewMoves(
                pokemon
            );



        const results = [];



        for(
            const entry of newMoves
        )
        {


            const result =
                this.learnMove(

                    pokemon,

                    entry.move

                );



            results.push(
                result
            );



            if(

                result.success === false

                &&

                result.reason === "Needs replacement"

            )
            {

                break;

            }


        }



        return results;


    }









    //--------------------------------
    // Prepare learned moves
    //--------------------------------


    prepareNewMoves(
        pokemon
    )
    {


        const newMoves =
            this.getNewMoves(
                pokemon
            );



        return newMoves.map(

            entry =>

                this.createMoveSlot(

                    entry.move

                )

        );


    }



}





module.exports =
    MoveLearningService;
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
        moveReplacementSelection = null,
        moveForget = null
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


        this.moveForget =
            moveForget;



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


        return this.learners[id] || [];

    }









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









    getNewMoves(
        pokemon
    )
    {

        const available =
            this.getAvailableMoves(
                pokemon
            );


        const currentMoves =
            pokemon.moves || [];



        return available.filter(

            entry =>

                !currentMoves.some(

                    move =>

                        move.constant ===
                        entry.move.constant

                )

        );

    }









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









    learnMove(
        pokemon,
        move
    )
    {


        const currentMoves =
            pokemon.moves || [];



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






        const slot =
            this.createMoveSlot(
                move
            );





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

                learned:
                    move.constant,

                move:slot

            };

        }






        return {

            success:false,

            reason:
                "Needs replacement",


            options:

                this.moveReplacement

                ?

                this.moveReplacement.getReplacementOptions(

                    currentMoves,

                    {

                        constant:
                            move.constant,


                        pp:
                            move.pp

                    }

                )

                :

                null

        };


    }









    //--------------------------------
    // Automatic replacement flow
    //--------------------------------


    learnMoveWithReplacement(
        pokemon,
        move,
        forgottenMove
    )
    {


        const result =
            this.learnMove(
                pokemon,
                move
            );



        if(
            result.success
        )
        {

            return result;

        }



        if(
            result.reason !==
            "Needs replacement"
        )
        {

            return result;

        }



        if(
            !this.moveReplacementSelection
        )
        {

            return {

                success:false,

                reason:
                    "Replacement selection unavailable"

            };

        }





        return this.moveReplacementSelection.replaceMove(

            pokemon.moves,

            forgottenMove,

            {

                constant:
                    move.constant,


                pp:
                    move.pp

            }

        );


    }









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

            pokemon.moves,

            forgottenMove,

            newMove

        );

    }









    forgetMove(
        pokemon,
        move
    )
    {

        if(
            !this.moveForget
        )
        {

            return {

                success:false,

                reason:
                    "Move forget service unavailable"

            };

        }



        return this.moveForget.forgetMove(

            pokemon.moves,

            move

        );

    }









    learnAvailableMoves(
        pokemon,
        replacementChoice = null
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


            let result;



            if(
                replacementChoice
            )
            {


                result =
                    this.learnMoveWithReplacement(

                        pokemon,

                        entry.move,

                        replacementChoice

                    );


            }
            else
            {


                result =
                    this.learnMove(

                        pokemon,

                        entry.move

                    );


            }




            results.push(
                result
            );



        }



        return results;


    }









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
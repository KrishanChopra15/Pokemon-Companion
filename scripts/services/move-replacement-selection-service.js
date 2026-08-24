/**
 * Pokémon Companion
 * Move Replacement Selection Service
 *
 * Handles selecting which move gets forgotten.
 *
 * Responsibilities:
 * - Validate forgotten move.
 * - Remove forgotten move.
 * - Add replacement move.
 * - Return replacement result.
 *
 * Does NOT:
 * - Decide which move should be forgotten.
 * - Handle level-up logic.
 */

"use strict";


const PokemonMoveSlot =
    require("../domain/pokemon-move-slot");





class MoveReplacementSelectionService {



    constructor(
        moveForget = null
    )
    {

        this.moveForget =
            moveForget;

    }









    //--------------------------------
    // Replace selected move
    //--------------------------------


    replaceMove(

        currentMoves,

        forgottenMove,

        newMove

    )
    {


        //--------------------------------
        // Check forget service
        //--------------------------------


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








        //--------------------------------
        // Forget old move
        //--------------------------------


        const forgetResult =

            this.moveForget.forgetMove(

                currentMoves,

                forgottenMove

            );





        if(
            forgetResult.success === false
        )
        {

            return forgetResult;

        }









        //--------------------------------
        // Create new move slot
        //--------------------------------


        const slot =

            new PokemonMoveSlot({

                constant:

                    newMove.constant,


                currentPP:

                    newMove.pp,


                maxPP:

                    newMove.pp

            });









        //--------------------------------
        // Add new move
        //--------------------------------


        currentMoves.push(
            slot
        );









        //--------------------------------
        // Result
        //--------------------------------


        return {


            success:true,


            forgotten:

                forgottenMove,


            learned:

                newMove.constant,


            move:

                slot


        };


    }



}





module.exports =
    MoveReplacementSelectionService;
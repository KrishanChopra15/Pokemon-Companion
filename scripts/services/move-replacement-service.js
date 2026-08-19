/**
 * Pokémon Companion
 * Move Replacement Service
 *
 * Handles replacing Pokémon moves.
 *
 * Responsibilities:
 * - Check move capacity.
 * - Detect duplicate moves.
 * - Replace existing moves.
 *
 * Does NOT:
 * - Learn moves.
 * - Check TM/HM compatibility.
 * - Execute moves.
 */

"use strict";


const PokemonMoveSlot =
    require("../domain/pokemon-move-slot");



class MoveReplacementService {


    constructor(
        maxMoves = 4
    )
    {

        this.maxMoves =
            maxMoves;

    }







    //--------------------------------
    // Check if move can be added
    //--------------------------------


    canAddMove(
        moves
    )
    {


        return moves.length < this.maxMoves;


    }








    //--------------------------------
    // Check duplicate
    //--------------------------------


    alreadyKnowsMove(
        moves,
        move
    )
    {


        return moves.some(

            slot =>

                slot.constant === move.constant

        );


    }








    //--------------------------------
    // Get replacement options
    //--------------------------------


    getReplacementOptions(
        moves,
        newMove
    )
    {


        return {

            canAdd:
                this.canAddMove(
                    moves
                ),


            duplicate:
                this.alreadyKnowsMove(
                    moves,
                    newMove
                ),


            currentMoves:
                moves,


            newMove

        };


    }








    //--------------------------------
    // Add new move
    //--------------------------------


    addMove(
        moves,
        move
    )
    {


        if(
            !this.canAddMove(
                moves
            )
        )
        {

            return {

                success:false,

                reason:
                    "Move slots full"

            };

        }



        if(
            this.alreadyKnowsMove(
                moves,
                move
            )
        )
        {

            return {

                success:false,

                reason:
                    "Already knows move"

            };

        }





        const slot =
            new PokemonMoveSlot({

                constant:
                    move.constant,


                currentPP:
                    move.pp,


                maxPP:
                    move.pp

            });



        moves.push(slot);



        return {

            success:true,

            move:slot

        };


    }








    //--------------------------------
    // Replace move
    //--------------------------------


    replaceMove(
        moves,
        oldMove,
        newMove
    )
    {


        const index =
            moves.findIndex(

                slot =>

                    slot.constant ===
                    oldMove

            );



        if(
            index === -1
        )
        {

            return {

                success:false,

                reason:
                    "Old move not found"

            };

        }




        const slot =
            new PokemonMoveSlot({

                constant:
                    newMove.constant,


                currentPP:
                    newMove.pp,


                maxPP:
                    newMove.pp

            });



        moves[index] =
            slot;



        return {

            success:true,

            replaced:
                oldMove,

            move:
                slot

        };


    }



}





module.exports =
    MoveReplacementService;
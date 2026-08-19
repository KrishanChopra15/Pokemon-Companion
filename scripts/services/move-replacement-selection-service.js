/**
 * Pokémon Companion
 * Move Replacement Selection Service
 *
 * Handles replacing an existing Pokémon move.
 *
 * Responsibilities:
 * - Remove forgotten move.
 * - Add newly learned move.
 * - Validate replacement choice.
 *
 * Does NOT:
 * - Decide which move should be forgotten.
 * - Handle battles.
 * - Teach TM/HM moves.
 */

"use strict";


const PokemonMoveSlot =
    require("../domain/pokemon-move-slot");




class MoveReplacementSelectionService {



    //--------------------------------
    // Replace move
    //--------------------------------


    replaceMove(
        pokemon,
        forgottenMove,
        newMove
    )
    {


        const moves =
            pokemon.moves
            ||
            [];



        const index =
            moves.findIndex(

                move =>

                    move.constant ===
                    forgottenMove

            );



        if(index === -1)
        {

            return {

                success:false,

                reason:
                    "Move to forget not found"

            };

        }





        const newSlot =
            new PokemonMoveSlot({

                constant:
                    newMove.constant,


                currentPP:
                    newMove.pp,


                maxPP:
                    newMove.pp

            });





        moves[index] =
            newSlot;



        pokemon.moves =
            moves;



        return {

            success:true,

            forgotten:
                forgottenMove,


            learned:
                newMove.constant,


            move:
                newSlot

        };


    }



}





module.exports =
    MoveReplacementSelectionService;
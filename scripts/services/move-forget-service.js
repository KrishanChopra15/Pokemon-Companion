/**
 * Pokémon Companion
 * Move Forget Service
 *
 * Handles removing known Pokémon moves.
 *
 * Responsibilities:
 * - Check if Pokémon knows a move.
 * - Remove selected move.
 * - Return forgotten move information.
 *
 * Does NOT:
 * - Learn new moves.
 * - Replace moves.
 * - Create move slots.
 */

"use strict";





class MoveForgetService {



    //--------------------------------
    // Find move index
    //--------------------------------


    findMoveIndex(

        moves,

        constant

    )
    {


        if(
            !Array.isArray(moves)
        )
        {

            return -1;

        }





        return moves.findIndex(

            move =>

                move.constant === constant

        );


    }









    //--------------------------------
    // Check if move exists
    //--------------------------------


    knowsMove(

        moves,

        constant

    )
    {


        return (

            this.findMoveIndex(

                moves,

                constant

            )

            !==

            -1

        );


    }









    //--------------------------------
    // Forget move
    //--------------------------------


    forgetMove(

        moves,

        constant

    )
    {


        const index =

            this.findMoveIndex(

                moves,

                constant

            );





        if(
            index === -1
        )
        {

            return {

                success:false,

                reason:
                    "Move not found"

            };

        }







        const forgotten =

            moves.splice(

                index,

                1

            )[0];







        return {

            success:true,

            forgotten:

                forgotten.constant,

            move:

                forgotten

        };


    }









    //--------------------------------
    // Forget move from Pokémon
    //--------------------------------


    forgetPokemonMove(

        pokemon,

        constant

    )
    {


        if(
            !pokemon.moves
        )
        {

            pokemon.moves = [];

        }





        const result =

            this.forgetMove(

                pokemon.moves,

                constant

            );





        return result;


    }



}





module.exports =
    MoveForgetService;
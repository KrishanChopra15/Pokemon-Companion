/**
 * Pokémon Companion
 * Battle Validation Service
 *
 * Handles battle input validation.
 *
 * Responsibilities:
 * - Validate selected moves.
 * - Check PP.
 * - Determine Struggle usage.
 *
 * Does NOT:
 * - Execute moves.
 * - Calculate damage.
 * - Modify battle state.
 */

"use strict";





class BattleValidationService {



    constructor()
    {

        this.struggleConstant =
            "MOVE_STRUGGLE";

    }









    //--------------------------------
    // Validate move
    //--------------------------------


    validateMove(
        pokemon,
        move
    )
    {


        if(
            !pokemon
        )
        {

            return {

                success:false,

                reason:
                    "Invalid Pokémon"

            };

        }





        const usableMoves =
            this.getUsableMoves(

                pokemon

            );









        //--------------------------------
        // No move selected
        //--------------------------------


        if(
            !move
        )
        {


            if(
                usableMoves.length === 0
            )
            {

                return {

                    success:true,

                    struggle:true

                };

            }





            return {

                success:false,

                reason:
                    "No move selected"

            };


        }









        //--------------------------------
        // Manual STRUGGLE
        //--------------------------------


        if(
            move.constant ===
            this.struggleConstant
        )
        {


            if(
                usableMoves.length === 0
            )
            {

                return {

                    success:true

                };

            }





            return {

                success:false,

                reason:
                    "Cannot use STRUGGLE while moves remain"

            };


        }









        //--------------------------------
        // Find known move
        //--------------------------------


        const selectedMove =
            this.getKnownMove(

                pokemon,

                move

            );





        if(
            !selectedMove
        )
        {

            return {

                success:false,

                reason:
                    "Move not known by Pokémon"

            };

        }









        //--------------------------------
        // PP check
        //--------------------------------


        if(
            typeof selectedMove.pp ===
            "number"

            &&

            selectedMove.pp <= 0
        )
        {


            return {

                success:false,

                reason:
                    "No PP remaining",


                struggle:
                    this.hasNoPP(

                        pokemon

                    )

            };


        }









        return {

            success:true

        };


    }









    //--------------------------------
    // Find move owned by Pokémon
    //--------------------------------


    getKnownMove(
        pokemon,
        move
    )
    {


        const moves =
            pokemon.moves || [];





        return moves.find(

            knownMove =>


                (

                    knownMove.constant

                    &&

                    move.constant

                    &&

                    knownMove.constant ===
                    move.constant

                )

                ||

                (

                    knownMove.name

                    &&

                    move.name

                    &&

                    knownMove.name ===
                    move.name

                )

        );


    }









    //--------------------------------
    // Get usable moves
    //--------------------------------


    getUsableMoves(
        pokemon
    )
    {


        if(
            !pokemon
            ||
            !Array.isArray(
                pokemon.moves
            )
        )
        {

            return [];

        }





        return pokemon.moves.filter(

            move =>

                typeof move.pp !==
                "number"

                ||

                move.pp > 0

        );


    }









    //--------------------------------
    // Check all PP exhausted
    //--------------------------------


    hasNoPP(
        pokemon
    )
    {


        return (

            this.getUsableMoves(

                pokemon

            )
            .length === 0

        );


    }


}





module.exports =
    BattleValidationService;
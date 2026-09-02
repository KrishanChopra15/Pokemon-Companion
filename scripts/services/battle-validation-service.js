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


class BattleValidationService
{


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

                success:
                    false,

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

                    success:
                        true,

                    struggle:
                        true

                };

            }


            return {

                success:
                    false,

                reason:
                    "No move selected"

            };

        }


        //--------------------------------
        // Manual STRUGGLE
        //--------------------------------

        const moveConstant =
            typeof move === "string"
            ?
            move
            :
            move.constant;


        if(
            moveConstant ===
            this.struggleConstant
        )
        {

            if(
                usableMoves.length === 0
            )
            {

                return {

                    success:
                        true

                };

            }


            return {

                success:
                    false,

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

                success:
                    false,

                reason:
                    "Move not known by Pokémon"

            };

        }


        //--------------------------------
        // PP check
        //--------------------------------

        if(
            this.getCurrentPP(
                selectedMove
            ) <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "No PP remaining",

                struggle:
                    this.hasNoPP(
                        pokemon
                    )

            };

        }


        return {

            success:
                true,

            move:
                selectedMove

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


        if(
            !move
        )
        {

            return null;

        }


        const moveName =
            typeof move === "string"
            ?
            move
            :
            move.name;


        const moveConstant =
            typeof move === "string"
            ?
            move
            :
            move.constant;


        return moves.find(

            knownMove =>

                (
                    knownMove.constant

                    &&

                    knownMove.constant ===
                    moveConstant

                )

                ||

                (
                    knownMove.name

                    &&

                    (
                        knownMove.name ===
                        moveName

                        ||

                        knownMove.name ===

                        String(
                            moveName
                        )
                        .replace(
                            "MOVE_",
                            ""
                        )

                    )

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

                this.getCurrentPP(
                    move
                ) > 0

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


    //--------------------------------
    // Get current PP
    //--------------------------------

    getCurrentPP(
        move
    )
    {

        if(
            !move
        )
        {

            return 0;

        }


        const currentPP =
            Number(
                move.currentPP
            );


        if(
            Number.isFinite(
                currentPP
            )
        )
        {

            return Math.max(
                0,
                currentPP
            );

        }


        //--------------------------------
        // Legacy compatibility
        //--------------------------------

        const legacyPP =
            Number(
                move.pp
            );


        if(
            Number.isFinite(
                legacyPP
            )
        )
        {

            return Math.max(
                0,
                legacyPP
            );

        }


        return 0;

    }


}


module.exports =
    BattleValidationService;
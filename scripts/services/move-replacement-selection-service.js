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
 * - Initialize new move PP state.
 * - Return replacement result.
 *
 * Does NOT:
 * - Decide which move should be forgotten.
 * - Handle level-up logic.
 * - Execute moves.
 */

"use strict";


const PokemonMoveSlot =
    require("../domain/pokemon-move-slot");


class MoveReplacementSelectionService
{


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

                success:
                    false,

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
        // Resolve new move PP
        //--------------------------------

        const basePP =
            Number(
                newMove.pp
            );


        if(
            !Number.isFinite(
                basePP
            )
            ||
            basePP < 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid new move PP"

            };

        }


        //--------------------------------
        // Create new move slot
        //
        // A newly learned move starts with:
        // - basePP = move database PP
        // - currentPP = basePP
        // - maxPP = basePP
        // - ppUps = 0
        //--------------------------------

        const slot =
            new PokemonMoveSlot({

                constant:
                    newMove.constant,

                basePP:
                    basePP,

                currentPP:
                    basePP,

                maxPP:
                    basePP,

                ppUps:
                    0

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

            success:
                true,

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
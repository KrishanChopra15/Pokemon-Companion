/**
 * Pokémon Companion
 * Battle Controller
 *
 * Handles battle API requests.
 *
 * Responsibilities:
 * - Create battles.
 * - Process turns.
 * - Get battle state.
 * - Get battle status.
 *
 * Does NOT:
 * - Calculate damage.
 * - Execute moves.
 * - Handle EXP.
 * - Handle evolution.
 */

"use strict";





const battleService =
    require("../services/battleService");


const BattleSerializer =
    require("../utils/battleSerializer");









//--------------------------------
// Create battle
//--------------------------------


exports.createBattle = async (

    req,

    res

) =>
{


    try
    {


        const {
        
            trainerId,
        
            opponent,
        
            player
        
        } = req.body;
        
        
        
        
        
        if(
            !trainerId
            ||
            !opponent
            ||
            !player
        )
        {
        
        
            return res.status(400).json(
            
                {
                
                    success:false,
                
                    message:
                        "Missing battle data"
                
                }
            
            );
        
        
        }
        
        
        
        
        
        
        const result =
        
            await battleService.createBattle(
            
                trainerId,
            
                opponent,
            
                player
            
            );
        
        






        return res.json(

            result

        );


    }


    catch(error)
    {


        return res.status(500).json(

            {

                success:false,

                message:
                    error.message

            }

        );


    }


};









//--------------------------------
// Get battle
//--------------------------------


exports.getBattle = async (

    req,

    res

) =>
{


    try
    {


        const battle =

            await battleService.getBattle(

                req.params.id

            );








        if(
            !battle
        )
        {


            return res.status(404).json(

                {

                    success:false,

                    message:
                        "Battle not found"

                }

            );


        }








        return res.json(
        
            {
            
                success:true,
            
                battle:
            
                    BattleSerializer.battle(
                    
                        battle
                    
                    )
                
            }
        
        );


    }


    catch(error)
    {


        return res.status(500).json(

            {

                success:false,

                message:
                    error.message

            }

        );


    }


};









//--------------------------------
// Process turn
//--------------------------------


exports.processTurn = async (

    req,

    res

) =>
{


    try
    {


        const {

            move

        } = req.body;








        if(
            !move
        )
        {


            return res.status(400).json(

                {

                    success:false,

                    message:
                        "Move required"

                }

            );


        }








        const result =

            await battleService.processTurn(

                req.params.id,

                move

            );








        return res.json(

            result

        );


    }


    catch(error)
    {


        return res.status(500).json(

            {

                success:false,

                message:
                    error.message

            }

        );


    }


};









//--------------------------------
// Get battle state
//--------------------------------


exports.getState = async (

    req,

    res

) =>
{


    try
    {


        const state =

            await battleService.getState(

                req.params.id

            );








        if(
            !state
        )
        {


            return res.status(404).json(

                {

                    success:false,

                    message:
                        "Battle state unavailable"

                }

            );


        }








        return res.json(

            {

                success:true,

                state

            }

        );


    }


    catch(error)
    {


        return res.status(500).json(

            {

                success:false,

                message:
                    error.message

            }

        );


    }


};









//--------------------------------
// Battle status
//--------------------------------


exports.getBattleStatus = async (

    req,

    res

) =>
{


    try
    {


        const battle =

            await battleService.getBattle(

                req.params.id

            );








        return res.json(

            {

                success:true,

                status:

                    battle

                    ?

                    battle.status

                    :

                    "UNKNOWN"

            }

        );


    }


    catch(error)
    {


        return res.status(500).json(

            {

                success:false,

                message:
                    error.message

            }

        );


    }


};
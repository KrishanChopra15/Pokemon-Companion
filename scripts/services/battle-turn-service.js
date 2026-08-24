/**
 * Pokémon Companion
 * Battle Turn Service
 *
 * Handles execution of battle turns.
 *
 * Responsibilities:
 * - Execute moves.
 * - Consume PP.
 * - Create action logs.
 * - Handle Struggle recoil.
 * - Process end turn effects.
 *
 * Does NOT:
 * - Determine turn order.
 * - Calculate damage.
 * - Validate moves.
 * - Manage battle state.
 */

"use strict";





class BattleTurnService {



    constructor(
        moveExecutionService,
        statusEffectService,
        weatherService
    )
    {


        this.moves =
            moveExecutionService;


        this.status =
            statusEffectService;


        this.weather =
            weatherService;


    }









    //--------------------------------
    // Execute ordered move
    //--------------------------------


    executeTurnMove(
        attackerSide,
        defenderSide,
        move,
        result,
        battle,
        getActivePokemon
    )
    {


        const attacker =
            getActivePokemon(

                attackerSide

            );


        const defender =
            getActivePokemon(

                defenderSide

            );





        if(
            !attacker ||
            !defender ||
            !move
        )
        {

            return;

        }





        let selectedMove =
            
            attacker.moves.find(
            
                knownMove =>
                
                    (
                        knownMove.constant
                        &&
                        move.constant
                        &&
                        knownMove.constant === move.constant
                    )
                
                    ||
                
                    (
                        knownMove.name
                        &&
                        move.name
                        &&
                        knownMove.name === move.name
                    )
                
            );
        
        
        if(
            !selectedMove
        )
        {
        
            selectedMove =
                move;
        
        }





        //--------------------------------
        // Resolve STRUGGLE
        //--------------------------------

        if(
            move &&
            move.constant ===
            "MOVE_STRUGGLE"
        )
        {

            selectedMove =
            {

                name:
                    "STRUGGLE",


                constant:
                    "MOVE_STRUGGLE",


                type:
                    "NORMAL",


                category:
                    "PHYSICAL",


                power:
                    50,


                accuracy:
                    100,


                priority:
                    0

            };


        }









        //--------------------------------
        // Execute move
        //--------------------------------


        const moveResult =

            this.moves.executeMove(

                attacker,

                defender,

                selectedMove,

                {

                    battle,

                    weather:
                        battle.weather,

                    environment:
                        battle.environment

                }

            );









        //--------------------------------
        // Consume PP
        //--------------------------------


        if(
            selectedMove.constant !==
            "MOVE_STRUGGLE"
        )
        {

            this.consumePP(

                attacker,

                selectedMove

            );

        }









        //--------------------------------
        // Battle log
        //--------------------------------


        result.actions.push(

            {

                attacker:
                    attacker.species,


                move:
                    moveResult.move
                    ||
                    selectedMove.name,


                damage:
                    moveResult.damage
                    ||
                    0,


                target:
                    defender.species,


                targetHP:
                    defender.hp,


                hit:
                    moveResult.hit !== false,


                effect:
                    moveResult.effect
                    ||
                    null

            }

        );









        //--------------------------------
        // Struggle recoil
        //--------------------------------


        if(

            selectedMove.constant ===
            "MOVE_STRUGGLE"

            &&

            moveResult.hit !== false

        )
        {


            const recoil =

                Math.max(

                    1,

                    Math.floor(

                        moveResult.damage / 4

                    )

                );





            attacker.hp -= recoil;





            if(
                attacker.hp < 0
            )
            {

                attacker.hp = 0;

            }





            result.actions.push(

                {

                    type:
                        "RECOIL_DAMAGE",


                    pokemon:
                        attacker.species,


                    damage:
                        recoil,


                    remainingHP:
                        attacker.hp

                }

            );


        }


    }









    //--------------------------------
    // Consume PP
    //--------------------------------


    consumePP(
        pokemon,
        move
    )
    {


        if(
            !pokemon ||
            !pokemon.moves ||
            !move
        )
        {

            return;

        }





        const selected =

            pokemon.moves.find(

                known =>


                    (

                        known.constant
                        &&
                        move.constant
                        &&
                        known.constant ===
                        move.constant

                    )

                    ||

                    (

                        known.name
                        &&
                        move.name
                        &&
                        known.name ===
                        move.name

                    )

            );





        if(
            !selected
        )
        {

            return;

        }





        if(
            typeof selected.pp ===
            "number"
        )
        {

            selected.pp--;





            if(
                selected.pp < 0
            )
            {

                selected.pp = 0;

            }

        }


    }









    //--------------------------------
    // End turn processing
    //--------------------------------


    processEndTurn(
        battle,
        result,
        getActivePokemon
    )
    {


        const activePokemon =
        [

            getActivePokemon(

                battle.player

            ),


            getActivePokemon(

                battle.opponent

            )

        ];





        for(
            const pokemon of activePokemon
        )
        {


            if(
                !pokemon ||
                pokemon.hp <= 0
            )
            {

                continue;

            }





            //--------------------------------
            // Status effects
            //--------------------------------


            if(
                this.status
            )
            {


                const statusResult =

                    this.status.processTurn(

                        pokemon

                    );





                if(
                    statusResult
                    &&
                    statusResult.damage
                )
                {


                    result.actions.push(

                        {

                            type:
                                "STATUS_DAMAGE",


                            pokemon:
                                pokemon.species,


                            damage:
                                statusResult.damage,


                            remainingHP:
                                pokemon.hp

                        }

                    );

                }


            }









            //--------------------------------
            // Weather effects
            //--------------------------------


            if(
                this.weather
            )
            {


                const weatherResult =

                    this.weather.processTurn(

                        pokemon

                    );





                if(
                    weatherResult
                    &&
                    weatherResult.damage
                )
                {


                    result.actions.push(

                        {

                            type:
                                "WEATHER_DAMAGE",


                            pokemon:
                                pokemon.species,


                            damage:
                                weatherResult.damage,


                            remainingHP:
                                pokemon.hp

                        }

                    );

                }


            }


        }


    }


}





module.exports =
    BattleTurnService;
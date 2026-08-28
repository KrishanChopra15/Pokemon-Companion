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
 * - Store Pokémon.
 * - Create duplicate Pokémon data.
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
        weatherService,
        battlePokemonService
    )
    {

        this.moves =
            moveExecutionService;


        this.status =
            statusEffectService;


        this.weather =
            weatherService;


        this.pokemon =
            battlePokemonService;

    }


    //--------------------------------
    // Pokémon name resolver
    //--------------------------------

    getPokemonName(
        pokemon
    )
    {

        return (

            pokemon?.species

            ||

            pokemon?.name

            ||

            pokemon?.constant

            ||

            "UNKNOWN"

        );

    }


    //--------------------------------
    // Resolve battle side
    //--------------------------------

    getSide(
        battle,
        side
    )
    {

        if(
            !battle
        )
        {

            return null;

        }


        if(
            side === "PLAYER"
        )
        {

            return battle.player;

        }


        if(
            side === "OPPONENT"
        )
        {

            return battle.opponent;

        }


        return null;

    }


    //--------------------------------
    // Execute ordered move
    //--------------------------------

    executeTurnMove(
        attackerSide,
        defenderSide,
        move,
        result,
        battle
    )
    {

        if(
            !battle ||
            !this.pokemon
        )
        {

            return;

        }


        //--------------------------------
        // Resolve participants
        //--------------------------------

        const attackerParticipant =

            this.getSide(

                battle,

                attackerSide

            );


        const defenderParticipant =

            this.getSide(

                battle,

                defenderSide

            );


        if(
            !attackerParticipant ||
            !defenderParticipant
        )
        {

            return;

        }


        //--------------------------------
        // Resolve active Pokémon
        //--------------------------------

        const attacker =

            this.pokemon.getActivePokemon(

                attackerParticipant

            );


        const defender =

            this.pokemon.getActivePokemon(

                defenderParticipant

            );


        if(
            !attacker ||
            !defender ||
            !move
        )
        {

            return;

        }


        //--------------------------------
        // Resolve known move
        //--------------------------------

        let selectedMove =

            Array.isArray(
                attacker.moves
            )

            ?

            attacker.moves.find(

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

            )

            :

            null;


        //--------------------------------
        // Use supplied move if not found
        //--------------------------------

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
            move.constant ===
            "MOVE_STRUGGLE"
        )
        {

            selectedMove =
                this.getStruggleMove();

        }


        //--------------------------------
        // Execute move
        //--------------------------------

        if(
            !this.moves
        )
        {

            return;

        }


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
                    this.getPokemonName(
                        attacker
                    ),


                move:
                    moveResult?.move
                    ||
                    selectedMove.name,


                damage:
                    moveResult?.damage
                    ||
                    0,


                target:
                    this.getPokemonName(
                        defender
                    ),


                targetHP:
                    defender.hp,


                hit:
                    moveResult?.hit !== false,


                effect:
                    moveResult?.effect
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

            moveResult?.hit !== false

        )
        {

            const recoil =

                Math.max(

                    1,

                    Math.floor(

                        (moveResult?.damage || 0) / 4

                    )

                );


            attacker.hp -=
                recoil;


            if(
                attacker.hp < 0
            )
            {

                attacker.hp =
                    0;

            }


            result.actions.push(

                {

                    type:
                        "RECOIL_DAMAGE",


                    pokemon:
                        this.getPokemonName(
                            attacker
                        ),


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
            !Array.isArray(
                pokemon.moves
            ) ||
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

                selected.pp =
                    0;

            }

        }

    }


    //--------------------------------
    // End turn processing
    //--------------------------------

    processEndTurn(
        battle,
        result
    )
    {

        if(
            !battle ||
            !this.pokemon
        )
        {

            return;

        }


        const activePokemon =
        [

            this.pokemon.getActivePokemon(

                battle.player

            ),


            this.pokemon.getActivePokemon(

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
                                this.getPokemonName(
                                    pokemon
                                ),


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
                                this.getPokemonName(
                                    pokemon
                                ),


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


    //--------------------------------
    // Struggle
    //--------------------------------

    getStruggleMove()
    {

        return {

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


}


module.exports =
    BattleTurnService;
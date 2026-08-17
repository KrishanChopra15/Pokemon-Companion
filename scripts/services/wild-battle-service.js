/**
 * Pokémon Companion
 * Wild Battle Service
 *
 * Handles wild Pokémon battles.
 *
 * Responsibilities:
 * - Create wild encounters.
 * - Prepare wild battles.
 * - Start wild battles.
 * - Resolve wild battle results.
 * - Process Pokémon progression.
 *
 * Does NOT:
 * - Generate encounters.
 * - Handle movement.
 * - Execute battle mechanics.
 * - Handle trainer battles.
 * - Manage gyms.
 */

"use strict";





class WildBattleService {



    constructor(
        battleService,
        progressionService
    )
    {


        this.battles =
            battleService;


        this.progression =
            progressionService;


    }









    //--------------------------------
    // Create encounter
    //--------------------------------


    createEncounter(
        pokemon
    )
    {


        if(
            !pokemon
        )
        {

            return {

                success:false,

                reason:
                    "Missing Pokemon"

            };

        }






        return {


            success:true,


            type:
                "WILD",


            pokemon


        };


    }









    //--------------------------------
    // Prepare battle
    //--------------------------------


    prepareBattle(
        player,
        wildPokemon
    )
    {


        const encounter =
            this.createEncounter(

                wildPokemon

            );



        if(
            !encounter.success
        )
        {

            return encounter;

        }








        return {


            success:true,


            battle:

            {

                type:
                    "WILD",


                player:
                {

                    party:

                        player.party

                },


                opponent:
                {

                    party:

                    [

                        wildPokemon

                    ]

                }


            }


        };


    }









    //--------------------------------
    // Start wild battle
    //--------------------------------


    startBattle(
        player,
        wildPokemon
    )
    {


        const prepared =
            this.prepareBattle(

                player,

                wildPokemon

            );



        if(
            !prepared.success
        )
        {

            return prepared;

        }








        if(
            !this.battles
            ||
            !this.battles.startWildBattle
        )
        {

            return {

                success:false,

                reason:
                    "Wild battle support unavailable"

            };

        }








        return this.battles.startWildBattle(

            player,

            wildPokemon

        );


    }









    //--------------------------------
    // Resolve victory
    //--------------------------------


    victory(
        playerPokemon,
        defeatedPokemon,
        source = "WILD"
    )
    {


        if(
            !playerPokemon
            ||
            !defeatedPokemon
        )
        {

            return {

                success:false,

                reason:
                    "Missing Pokemon"

            };

        }








        const exp =
            this.progression
                .experience
                .calculateExp(

                    defeatedPokemon,

                    source

                );








        const result =
            this.progression
                .processProgression(

                    playerPokemon,

                    exp

                );








        return {


            success:

                result.success,


            defeated:

                defeatedPokemon.species,


            exp,


            progression:

                result


        };


    }









    //--------------------------------
    // Evolution check
    //--------------------------------


    checkEvolution(
        pokemon
    )
    {


        return this.progression
            .processEvolution(

                pokemon

            );


    }









    //--------------------------------
    // Victory summary
    //--------------------------------


    createVictorySummary(
        pokemon,
        defeatedPokemon,
        exp
    )
    {


        return {


            pokemon:

                pokemon.species,


            defeated:

                defeatedPokemon.species,


            exp


        };


    }



}





module.exports =
    WildBattleService;
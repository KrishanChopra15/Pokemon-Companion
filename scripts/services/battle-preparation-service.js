/**
 * Pokémon Companion
 * Battle Preparation Service
 *
 * Prepares data required to start a battle.
 *
 * Responsibilities:
 * - Resolve player battle party.
 * - Resolve opponent trainer party.
 * - Prepare trainer battle metadata.
 * - Prepare AI configuration.
 * - Validate battle participants.
 * - Calculate battle stats.
 *
 * Does NOT:
 * - Execute battles.
 * - Calculate damage.
 * - Handle move selection.
 * - Manage battle turns.
 */

"use strict";





class BattlePreparationService {



    constructor(
        trainerDatabaseService = null,
        pokemonDatabaseService = null,
        statCalculationService = null,
        pokemonStatProviderService = null
    )
    {


        this.trainers =
            trainerDatabaseService;


        this.pokemon =
            pokemonDatabaseService;


        this.statCalculation =
            statCalculationService;


        this.statProvider =
            pokemonStatProviderService;


    }









    //--------------------------------
    // Prepare trainer battle
    //--------------------------------


    prepareTrainerBattle(
        trainerId,
        playerState
    )
    {


        const trainer =

            this.getTrainer(
                trainerId
            );



        if(
            !trainer
        )
        {

            return {

                success:false,

                reason:
                    "Unknown trainer"

            };

        }








        const playerParty =

            this.getPlayerParty(
                playerState
            )

            .map(

                pokemon =>

                    this.preparePokemon(
                        pokemon
                    )

            )

            .filter(Boolean);








        if(
            playerParty.length === 0
        )
        {

            return {

                success:false,

                reason:
                    "Player has no Pokémon"

            };

        }








        const opponentParty =

            this.getTrainerParty(
                trainerId
            )

            .map(

                pokemon =>

                    this.preparePokemon(
                        pokemon
                    )

            )

            .filter(Boolean);








        if(
            opponentParty.length === 0
        )
        {

            return {

                success:false,

                reason:
                    "Trainer has no Pokémon"

            };

        }








        return {


            success:true,


            battleType:

                "TRAINER",


            trainerId,


            trainer,



            player:
            {

                party:

                    playerParty,


                active:

                    0

            },



            opponent:
            {

                party:

                    opponentParty,


                active:

                    0,


                trainerClass:

                    trainer.trainerClass,


                trainerPic:

                    trainer.trainerPic,


                aiFlags:

                    trainer.aiFlags,


                encounterMusic:

                    trainer.encounterMusic

            }


        };


    }









    //--------------------------------
    // Get trainer
    //--------------------------------


    getTrainer(
        trainerId
    )
    {

        if(
            !this.trainers
        )
        {
            return null;
        }



        return this.trainers.getTrainer(
            trainerId
        );


    }









    //--------------------------------
    // Get trainer party
    //--------------------------------


    getTrainerParty(
        trainerId
    )
    {


        const trainer =

            this.getTrainer(
                trainerId
            );



        if(
            !trainer
        )
        {
            return [];
        }



        if(
            Array.isArray(
                trainer.party
            )
        )
        {
            return trainer.party;
        }



        if(
            trainer.party
            &&
            Array.isArray(
                trainer.party.pokemon
            )
        )
        {
            return trainer.party.pokemon;
        }



        return [];

    }









    //--------------------------------
    // Player party
    //--------------------------------


    getPlayerParty(
        playerState
    )
    {


        if(
            !playerState
        )
        {
            return [];
        }



        if(
            Array.isArray(
                playerState.pokemon
            )
        )
        {
            return playerState.pokemon;
        }



        if(
            Array.isArray(
                playerState.team
            )
        )
        {
            return playerState.team;
        }



        return [];

    }









    //--------------------------------
    // Prepare Pokémon
    //--------------------------------


    preparePokemon(
        pokemon
    )
    {


        if(
            !pokemon
        )
        {
            return null;
        }






        let basePokemon = null;



        if(
            this.pokemon
            &&
            pokemon.species
        )
        {

            basePokemon =

                this.pokemon.getPokemon(

                    pokemon.species

                );

        }








        const level =

            pokemon.level

            ||

            1;








        let types = [];



        if(
            pokemon.types
        )
        {

            types =
                pokemon.types;

        }

        else if(
            pokemon.type
        )
        {


            types =

                Array.isArray(
                    pokemon.type
                )

                ?

                pokemon.type

                :

                [

                    pokemon.type

                ];


        }

        else if(
            basePokemon
        )
        {


            types =

            [

                basePokemon.type1?.name?.toUpperCase(),

                basePokemon.type2?.name?.toUpperCase()

            ]

            .filter(Boolean);


        }








        const cleanPokemon =

        {

            ...(basePokemon || {}),

            ...pokemon

        };





        delete cleanPokemon.type;








        let prepared =

        {


            ...cleanPokemon,



            species:

                pokemon.species

                ||

                basePokemon?.name

                ||

                "UNKNOWN",



            level,



            types,



            status:

                pokemon.status

                ||

                null,



            statStages:

            {

                attack:0,

                defense:0,

                speed:0,

                spAttack:0,

                spDefense:0,

                accuracy:0,

                evasion:0

            }

        };









        //--------------------------------
        // Calculate battle stats
        //--------------------------------


        if(
            this.statProvider
        )
        {


            const stats =

                this.statProvider.getBattleStats(

                    prepared,

                    "EXACT"

                );





            prepared =

            {


                ...prepared,



                hp:

                    pokemon.hp

                    ||

                    stats.hp

                    ||

                    1,



                maxHP:

                    pokemon.maxHP

                    ||

                    stats.hp

                    ||

                    1,



                attack:

                    stats.attack

                    ||

                    1,



                defense:

                    stats.defense

                    ||

                    1,



                spAttack:

                    stats.spAttack

                    ||

                    1,



                spDefense:

                    stats.spDefense

                    ||

                    1,



                speed:

                    stats.speed

                    ||

                    1


            };


        }

        else
        {


            prepared.hp =

                pokemon.hp

                ||

                (

                    level * 2

                    +

                    20

                );



            prepared.maxHP =

                pokemon.maxHP

                ||

                prepared.hp;



            prepared.attack =

                pokemon.attack

                ||

                basePokemon?.baseAttack

                ||

                1;



            prepared.defense =

                pokemon.defense

                ||

                basePokemon?.baseDefense

                ||

                1;



            prepared.spAttack =

                pokemon.spAttack

                ||

                basePokemon?.baseSpAttack

                ||

                1;



            prepared.spDefense =

                pokemon.spDefense

                ||

                basePokemon?.baseSpDefense

                ||

                1;



            prepared.speed =

                pokemon.speed

                ||

                basePokemon?.baseSpeed

                ||

                1;


        }









        //--------------------------------
        // Prepare moves
        //--------------------------------


        prepared.moves =

            Array.isArray(
                pokemon.moves
            )

            ?

            pokemon.moves.map(

                move =>

                ({

                    name:

                        move.name

                        ||

                        move.move

                        ||

                        move.constant,



                    constant:

                        move.constant

                        ||

                        move.move

                        ||

                        move.name,



                    type:

                        move.type

                        ||

                        "NORMAL",



                    category:

                        move.category

                        ||

                        "PHYSICAL",



                    power:

                        move.power

                        ||

                        0,



                    accuracy:

                        move.accuracy

                        ||

                        100,



                    pp:

                        move.pp

                        ??

                        move.maxPP

                        ??

                        10


                })

            )

            :

            [];







        console.log(

            "PREPARED POKEMON:",

            {

                species:
                    prepared.species,

                hp:
                    prepared.hp,

                attack:
                    prepared.attack,

                defense:
                    prepared.defense,

                spAttack:
                    prepared.spAttack,

                spDefense:
                    prepared.spDefense,

                speed:
                    prepared.speed

            }

        );





        return prepared;


    }









    //--------------------------------
    // Check battle ready
    //--------------------------------


    canBattle(
        trainerId,
        playerState
    )
    {


        const result =

            this.prepareTrainerBattle(

                trainerId,

                playerState

            );



        return result.success;


    }









    //--------------------------------
    // Battle summary
    //--------------------------------


    getBattleSummary(
        trainerId
    )
    {


        const trainer =

            this.getTrainer(
                trainerId
            );



        if(
            !trainer
        )
        {
            return null;
        }



        return {


            trainerId,


            name:

                trainer.trainerName,


            type:

                trainer.trainerType,


            class:

                trainer.trainerClass,


            party:

                this.getTrainerParty(
                    trainerId
                )


        };


    }



}





module.exports =
    BattlePreparationService;
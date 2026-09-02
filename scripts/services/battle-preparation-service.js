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
 * - Preserve individual Pokémon runtime state.
 *
 * Does NOT:
 * - Execute battles.
 * - Calculate damage.
 * - Handle move selection.
 * - Manage battle turns.
 */

"use strict";


const PokemonMoveSlot =
    require("../domain/pokemon-move-slot");


class BattlePreparationService
{


    constructor(
        trainerDatabaseService = null,
        pokemonDatabaseService = null,
        statCalculationService = null,
        pokemonStatProviderService = null,
        moveDatabaseService = null
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


        this.moves =
            moveDatabaseService;

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

                success:
                    false,

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

                success:
                    false,

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

                success:
                    false,

                reason:
                    "Trainer has no Pokémon"

            };

        }


        return {

            success:
                true,

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


        if(
            Array.isArray(
                playerState.party
            )
        )
        {

            return playerState.party;

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


        let basePokemon =
            null;


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


        let types =
            [];


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


        //--------------------------------
        // Preserve incoming Pokémon state
        //--------------------------------

        const cleanPokemon =
        {

            ...(basePokemon || {}),

            ...pokemon

        };


        delete cleanPokemon.type;


        //--------------------------------
        // Friendship
        //
        // This preserves the individual's
        // existing friendship value.
        //
        // Battle runtime falls back to
        // the same default already used by
        // friendship-based move mechanics.
        //--------------------------------

        const friendship =
            this.resolveFriendship(
                pokemon
            );
                
                
        let prepared =
        {
            ...cleanPokemon,
        
            sourcePokemon:
                pokemon,
        
            species:
                pokemon.species
                ||
                basePokemon?.name
                ||
                "UNKNOWN",
        
            level,
        
            friendship,
        
            types,
        
            status:
                pokemon.status
                ||
                null,
        
            statStages:
            {
                attack:
                    0,
            
                defense:
                    0,
            
                speed:
                    0,
            
                spAttack:
                    0,
            
                spDefense:
                    0,
            
                accuracy:
                    0,
            
                evasion:
                    0
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

        let moveSource =
            [];


        //--------------------------------
        // Use supplied moves
        //--------------------------------

        if(
            Array.isArray(
                pokemon.moves
            )
            &&
            pokemon.moves.length > 0
        )
        {

            moveSource =
                pokemon.moves;

        }


        //--------------------------------
        // Load level-up moves
        //--------------------------------

        else if(
            basePokemon
            &&
            Array.isArray(
                basePokemon.learnset
            )
        )
        {

            moveSource =

                basePokemon.learnset

                    .filter(

                        entry =>

                            entry.level <=
                            level

                    )

                    .slice(-4)

                    .map(

                        entry =>

                            entry.move

                    );

        }


        //--------------------------------
        // Build runtime moves
        //--------------------------------

        prepared.moves =

            moveSource.map(

                move =>

                    this.prepareMove(
                        move
                    )

            )
            .filter(Boolean);


        console.log(

            "PREPARED POKEMON:",

            {

                species:
                    prepared.species,

                hp:
                    prepared.hp,

                friendship:
                    prepared.friendship,

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
    // Prepare runtime move
    //--------------------------------

    prepareMove(
        move
    )
    {

        if(
            !move
        )
        {

            return null;

        }


        //--------------------------------
        // Resolve move constant
        //--------------------------------

        const constant =

            move.constant

            ||

            move.move?.constant

            ||

            (

                move.name

                ?

                (

                    move.name.startsWith(
                        "MOVE_"
                    )

                    ?

                    move.name

                    :

                    `MOVE_${
                        move.name.toUpperCase()
                    }`

                )

                :

                null

            );


        if(
            !constant
        )
        {

            return null;

        }


        //--------------------------------
        // Resolve database move
        //--------------------------------

        const databaseMove =

            this.moves

            &&

            constant

            ?

            this.moves.getMoveByConstant(
                constant
            )

            :

            null;


        //--------------------------------
        // Resolve base PP
        //--------------------------------

        const basePP =
            this.resolveBasePP(

                move,

                databaseMove

            );


        //--------------------------------
        // Resolve PP Up count
        //--------------------------------

        const ppUps =
            this.resolvePPUps(
                move,
                basePP
            );


        //--------------------------------
        // Resolve current PP
        //--------------------------------

        const currentPP =
            this.resolveCurrentPP(

                move,

                basePP,

                ppUps

            );


        //--------------------------------
        // Create runtime move slot
        //--------------------------------

        const slot =
            new PokemonMoveSlot({

                constant:
                    constant,

                basePP:
                    basePP,

                ppUps:
                    ppUps,

                currentPP:
                    currentPP

            });


        //--------------------------------
        // Attach battle move metadata
        //
        // PokemonMoveSlot remains the
        // authoritative owner of PP state.
        //--------------------------------

        slot.name =

            databaseMove?.name

            ||

            move.name

            ||

            constant

            ||

            "UNKNOWN";


        slot.type =

            databaseMove?.type

            ||

            move.type

            ||

            "NORMAL";


        slot.category =

            databaseMove?.category

            ||

            move.category

            ||

            "PHYSICAL";


        slot.power =

            databaseMove?.power

            ||

            move.power

            ||

            0;


        slot.accuracy =

            databaseMove?.accuracy

            ??

            move.accuracy

            ??

            100;


        slot.effect =

            databaseMove?.effect

            ??

            move.effect

            ??

            null;


        //--------------------------------
        // Preserve any existing runtime
        // move state that is not handled
        // by the move slot.
        //--------------------------------

        if(
            move.target !==
            undefined
        )
        {

            slot.target =
                move.target;

        }


        if(
            move.priority !==
            undefined
        )
        {

            slot.priority =
                move.priority;

        }


        if(
            move.flags !==
            undefined
        )
        {

            slot.flags =
                move.flags;

        }


        return slot;

    }


    //--------------------------------
    // Resolve friendship
    //--------------------------------

    resolveFriendship(
        pokemon
    )
    {

        const friendship =
            Number(
                pokemon.friendship
            );


        if(
            Number.isFinite(
                friendship
            )
        )
        {

            return Math.min(

                255,

                Math.max(
                    0,
                    Math.floor(
                        friendship
                    )
                )

            );

        }


        return 70;

    }


    //--------------------------------
    // Resolve base PP
    //--------------------------------

    resolveBasePP(
        move,
        databaseMove
    )
    {

        const values =
        [

            move.basePP,

            databaseMove?.pp

        ];


        for(
            const value of values
        )
        {

            const numeric =
                Number(
                    value
                );


            if(
                Number.isFinite(
                    numeric
                )
                &&
                numeric >= 0
            )
            {

                return Math.floor(
                    numeric
                );

            }

        }


        return 20;

    }


    //--------------------------------
    // Resolve PP Ups
    //--------------------------------

    resolvePPUps(
        move,
        basePP
    )
    {

        const explicit =
            Number(
                move.ppUps
            );


        if(
            Number.isFinite(
                explicit
            )
        )
        {

            return Math.min(

                3,

                Math.max(
                    0,
                    Math.floor(
                        explicit
                    )
                )

            );

        }


        //--------------------------------
        // Infer from stored maximum PP
        //--------------------------------

        const storedMaxPP =
            Number(
                move.maxPP
            );


        if(
            Number.isFinite(
                storedMaxPP
            )
            &&
            basePP > 0
        )
        {

            const increase =
                Math.floor(
                    basePP / 5
                );


            if(
                increase > 0
            )
            {

                return Math.min(

                    3,

                    Math.max(

                        0,

                        Math.round(

                            (
                                storedMaxPP -
                                basePP
                            )
                            /
                            increase

                        )

                    )

                );

            }

        }


        return 0;

    }


    //--------------------------------
    // Resolve current PP
    //--------------------------------

    resolveCurrentPP(
        move,
        basePP,
        ppUps
    )
    {

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
        // Legacy PP compatibility
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


        //--------------------------------
        // New move
        //--------------------------------

        const maxPP =
            basePP
            +
            (
                Math.floor(
                    basePP / 5
                )
                *
                ppUps
            );


        return Math.max(
            0,
            maxPP
        );

    }


    //--------------------------------
    // Resolve Gen 3 move category
    //--------------------------------

    getMoveCategory(
        type
    )
    {

        const specialTypes =
        [

            "FIRE",

            "WATER",

            "GRASS",

            "ELECTRIC",

            "ICE",

            "PSYCHIC",

            "DRAGON",

            "DARK"

        ];


        if(
            !type
        )
        {

            return "PHYSICAL";

        }


        return specialTypes.includes(

            String(
                type
            )
            .toUpperCase()

        )

        ?

        "SPECIAL"

        :

        "PHYSICAL";

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
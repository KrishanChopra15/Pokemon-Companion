
/**
 * Pokémon Companion
 * Player Flow
 *
 * Coordinates player setup flow.
 *
 * Responsibilities:
 * - Create player.
 * - Select starter.
 * - Initialize the starter Pokémon.
 * - Register starter with the tracker.
 * - Add starter to the team.
 * - Set the active Pokémon.
 * - Update session.
 *
 * Does NOT:
 * - Handle battles.
 * - Handle progression.
 * - Manage Pokémon teams directly.
 */

"use strict";


const PokemonMoveSlot =
    require("../domain/pokemon-move-slot");


class PlayerFlow
{

    constructor(
        playerManager,
        starterSelection,
        session,
        pokemonDatabase = null,
        moveDatabase = null,
        pokemonTracker = null,
        teamFlow = null,
        activePokemonManager = null
    )
    {

        this.playerManager =
            playerManager;

        this.starterSelection =
            starterSelection;

        this.session =
            session;

        this.pokemonDatabase =
            pokemonDatabase;

        this.moveDatabase =
            moveDatabase;

        this.tracker =
            pokemonTracker;

        this.team =
            teamFlow;

        this.activePokemon =
            activePokemonManager;

    }


    //--------------------------------
    // Create player
    //--------------------------------

    createPlayer(
        name
    )
    {

        const result =
            this.playerManager
                .createPlayer(
                    name
                );


        if(
            !result.success
        )
        {

            return result;

        }


        this.playerManager
            .attachToSession(

                this.session,

                result.player

            );


        return result;

    }


    //--------------------------------
    // Create starter moves
    //--------------------------------

    createStarterMoves(
        speciesData,
        level
    )
    {

        if(
            !speciesData ||
            !Array.isArray(
                speciesData.learnset
            ) ||
            !this.moveDatabase
        )
        {

            return {

                success: false,

                reason:
                    "Starter move data unavailable"

            };

        }


        //--------------------------------
        // Find moves learned by this level
        //--------------------------------

        const learnedMoves =
            speciesData.learnset

                .filter(

                    entry =>

                        entry &&
                        Number(entry.level) <= level &&
                        entry.move &&
                        entry.move.constant

                )

                .sort(

                    (first, second) =>

                        Number(first.level) -
                        Number(second.level)

                )

                .slice(-4);


        if(
            learnedMoves.length === 0
        )
        {

            return {

                success: false,

                reason:
                    "No starter moves available"

            };

        }


        //--------------------------------
        // Initialize runtime move slots
        //--------------------------------

        const moves = [];


        for(
            const entry of learnedMoves
        )
        {

            const moveData =
                this.moveDatabase.getMove(
                    entry.move.constant
                );


            if(
                !moveData ||
                !Number.isFinite(
                    Number(moveData.pp)
                ) ||
                Number(moveData.pp) < 0
            )
            {

                return {

                    success: false,

                    reason:
                        "Move data unavailable: " +
                        entry.move.constant

                };

            }


            moves.push(

                new PokemonMoveSlot({

                    constant:
                        moveData.constant,

                    basePP:
                        Number(moveData.pp),

                    currentPP:
                        Number(moveData.pp),

                    ppUps:
                        0

                })

            );

        }


        return {

            success: true,

            moves

        };

    }


    //--------------------------------
    // Choose starter
    //--------------------------------

    chooseStarter(
        starter
    )
    {

        //--------------------------------
        // Validate player
        //--------------------------------

        const player =
            this.session
                .getPlayer();


        if(
            !player
        )
        {

            return {

                success: false,

                reason:
                    "No player created"

            };

        }


        //--------------------------------
        // Prevent selecting another starter
        //--------------------------------

        const state =
            this.session
                .getState();


        if(
            state.starter ||
            player.starter
        )
        {

            return {

                success: false,

                reason:
                    "Starter already selected"

            };

        }


        //--------------------------------
        // Validate required services
        //--------------------------------

        if(
            !this.starterSelection ||
            !this.pokemonDatabase ||
            !this.moveDatabase ||
            !this.tracker ||
            !this.team ||
            !this.activePokemon
        )
        {

            return {

                success: false,

                reason:
                    "Starter services unavailable"

            };

        }


        //--------------------------------
        // Normalize species
        //--------------------------------

        const species =
            String(
                starter || ""
            )
            .trim()
            .toUpperCase();


        //--------------------------------
        // Resolve species data
        //--------------------------------

        const speciesData =
            this.pokemonDatabase
                .getPokemon(
                    species
                );


        if(
            !speciesData
        )
        {

            return {

                success: false,

                reason:
                    "Starter species not found"

            };

        }


        //--------------------------------
        // Starter level
        //--------------------------------

        const level =
            5;


        //--------------------------------
        // Initialize moves before changing
        // the player's state.
        //--------------------------------

        const moveResult =
            this.createStarterMoves(

                speciesData,

                level

            );


        if(
            !moveResult.success
        )
        {

            return moveResult;

        }


        //--------------------------------
        // Create a separate runtime Pokémon.
        //
        // Never modify the shared species
        // database record.
        //--------------------------------

        const pokemon =
        {

            species:
                species,

            level:
                level,

            exp:
                0,

            friendship:
                speciesData.friendship ?? 70,

            nickname:
                null,

            ball:
                null,

            metLocation:
                "PALLET_TOWN",

            location:
                "PALLET_TOWN",

            moves:
                moveResult.moves,

            seen:
                true,

            caught:
                true,

            favorite:
                false,

            isStarter:
                true

        };


        //--------------------------------
        // Record the selected starter
        //--------------------------------

        const selectionResult =
            this.starterSelection
                .selectStarter(

                    state,

                    species

                );


        if(
            !selectionResult.success
        )
        {

            return selectionResult;

        }


        //--------------------------------
        // Register with Pokémon tracker
        //--------------------------------

        const tracked =
            this.tracker
                .addPokemon(
                    pokemon
                );


        if(
            !tracked ||
            !tracked.success
        )
        {

            state.starter =
                null;

            return tracked || {

                success: false,

                reason:
                    "Could not register starter"

            };

        }


        const starterPokemon =
            tracked.pokemon ||
            pokemon;


        //--------------------------------
        // Add the same object to the team
        //--------------------------------

        const teamResult =
            this.team
                .addToTeam(
                    starterPokemon
                );


        if(
            !teamResult ||
            !teamResult.success
        )
        {

            this.tracker
                .removePokemon(
                    starterPokemon.trackerId
                );


            state.starter =
                null;


            return teamResult || {

                success: false,

                reason:
                    "Could not add starter to team"

            };

        }


        //--------------------------------
        // Set the same object as active
        //--------------------------------

        this.activePokemon
            .setActive(
                starterPokemon
            );


        //--------------------------------
        // Update player profile
        //--------------------------------

        player.starter =
            species;


        return {

            success: true,

            starter:
                species,

            pokemon:
                starterPokemon,

            tracked:
                true,

            team:
                true,

            active:
                true

        };

    }


    //--------------------------------
    // Get player
    //--------------------------------

    getPlayer()
    {

        return this.session
            .getPlayer();

    }


    //--------------------------------
    // Get starter
    //--------------------------------

    getStarter()
    {

        const player =
            this.getPlayer();


        return player

            ?

            player.starter

            :

            null;

    }

}


module.exports =
    PlayerFlow;

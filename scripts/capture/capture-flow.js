/**
 * Pokémon Companion
 * Capture Flow
 *
 * Handles player-confirmed Pokémon captures.
 *
 * Responsibilities:
 * - Validate capture.
 * - Consume capture items.
 * - Initialize Pokémon friendship.
 * - Preserve capture ball.
 * - Preserve met location.
 * - Store captured Pokémon.
 * - Update tracker.
 * - Add Pokémon to team.
 * - Send overflow Pokémon to PC storage.
 * - Create actions.
 *
 * Does NOT:
 * - Detect wild encounters.
 * - Execute battle mechanics.
 * - Calculate capture probability.
 * - Execute friendship mechanics.
 */

"use strict";


class CaptureFlow {



    constructor(
        captureService,
        captureManager,
        teamFlow,
        storageFlow,
        inventoryFlow,
        pokemonTracker,
        actionFlow,
        pokemonDatabase = null,
        friendshipService = null
    )
    {


        this.captureService =
            captureService;


        this.captures =
            captureManager;


        this.team =
            teamFlow;


        this.storage =
            storageFlow;


        this.inventory =
            inventoryFlow;


        this.tracker =
            pokemonTracker;


        this.actions =
            actionFlow;


        this.pokemonDatabase =
            pokemonDatabase;


        this.friendship =
            friendshipService;


    }









    //--------------------------------
    // Confirm Capture
    //--------------------------------


    confirmCapture(
        pokemon,
        ball = "POKE_BALL"
    )
    {


        if(
            !pokemon ||
            !pokemon.species
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid Pokemon"

            };

        }


        //--------------------------------
        // Normalize ball
        //--------------------------------

        const captureBall =
            this.normalizeBall(
                ball
            );


        //--------------------------------
        // Check capture item
        //--------------------------------

        if(
            !this.inventory
            ||
            typeof this.inventory.hasItem !==
                "function"
            ||
            !this.inventory.hasItem(
                captureBall
            )
        )
        {

            return {

                success:
                    false,

                reason:
                    `No ${captureBall} available`

            };

        }


        //--------------------------------
        // Consume capture ball
        //--------------------------------

        const usedBall =
            this.inventory.useItem(
                captureBall
            );


        if(
            !usedBall.success
        )
        {

            return usedBall;

        }


        //--------------------------------
        // Resolve base friendship
        //--------------------------------

        const baseFriendship =
            this.getBaseFriendship(
                pokemon.species
            );


        //--------------------------------
        // Build actual owned Pokémon
        //--------------------------------

        const pokemonData =
        {

            species:
                pokemon.species,


            level:
                pokemon.level || 1,


            friendship:
                baseFriendship,


            ball:
                captureBall,


            metLocation:
                pokemon.metLocation
                ||
                pokemon.location
                ||
                null,


            location:
                pokemon.location
                ||
                null

        };


        //--------------------------------
        // Initialize friendship through
        // the central friendship service.
        //--------------------------------

        if(
            this.friendship
            &&
            typeof this.friendship.initialize ===
                "function"
        )
        {

            const friendshipResult =
                this.friendship.initialize(

                    pokemonData,

                    baseFriendship

                );


            if(
                !friendshipResult.success
            )
            {

                return friendshipResult;

            }

        }


        //--------------------------------
        // Store Capture History
        //--------------------------------

        const captured =
            this.captures
                .addCapture(
                    pokemonData
                );


        if(
            !captured.success
        )
        {

            return captured;

        }


        const storedPokemon =
            captured.capture
            ||
            captured.pokemon
            ||
            pokemonData;


        //--------------------------------
        // Update Tracker
        //--------------------------------

        const tracked =
            this.tracker
                .addPokemon(
                    pokemonData
                );


        //--------------------------------
        // Add To Team
        //--------------------------------

        let teamResult =
        {

            success:
                false,

            reason:
                "Team Full"

        };


        if(
            this.team
            &&
            this.team.addToTeam
        )
        {

            teamResult =
                this.team
                    .addToTeam(
                        pokemonData
                    );

        }


        //--------------------------------
        // Overflow Storage
        //--------------------------------

        let storageResult =
        {

            success:
                false,

            reason:
                "Added To Team"

        };


        if(
            !teamResult.success
        )
        {

            if(
                this.storage
                &&
                this.storage.storePokemon
            )
            {

                storageResult =
                    this.storage
                        .storePokemon(
                            pokemonData
                        );

            }
            else
            {

                storageResult =
                {

                    success:
                        false,

                    reason:
                        "Storage unavailable"

                };

            }

        }


        //--------------------------------
        // Action History
        //--------------------------------

        const action =
            this.actions
                .capturePokemon(

                    pokemon.species,

                    pokemon.level || 1,

                    pokemon.location
                    ||
                    null

                );


        //--------------------------------
        // Return result
        //--------------------------------

        return {

            success:
                true,

            capture:
                storedPokemon,

            tracked:
                tracked.success,

            team:
                teamResult.success,

            stored:
                storageResult.success,

            storage:
                storageResult,

            ball:
                captureBall,

            friendship:
                pokemonData.friendship,

            metLocation:
                pokemonData.metLocation,

            action:
                action.action

        };

    }









    //--------------------------------
    // Resolve base friendship
    //--------------------------------


    getBaseFriendship(
        species
    )
    {

        if(
            this.pokemonDatabase
            &&
            typeof this.pokemonDatabase.getBaseFriendship ===
                "function"
        )
        {

            const friendship =
                this.pokemonDatabase.getBaseFriendship(
                    species
                );


            if(
                friendship !== null
                &&
                friendship !== undefined
            )
            {

                return friendship;

            }

        }


        //--------------------------------
        // Defensive fallback
        //--------------------------------

        return 70;

    }









    //--------------------------------
    // Normalize capture ball
    //--------------------------------


    normalizeBall(
        ball
    )
    {

        if(
            !ball
        )
        {

            return "ITEM_POKE_BALL";

        }


        const value =
            String(
                ball
            )
            .trim()
            .toUpperCase();


        const aliases =
        {

            POKEBALL:
                "ITEM_POKE_BALL",


            POKE_BALL:
                "ITEM_POKE_BALL",


            ITEM_POKE_BALL:
                "ITEM_POKE_BALL",


            GREATBALL:
                "ITEM_GREAT_BALL",


            GREAT_BALL:
                "ITEM_GREAT_BALL",


            ITEM_GREAT_BALL:
                "ITEM_GREAT_BALL",


            ULTRABALL:
                "ITEM_ULTRA_BALL",


            ULTRA_BALL:
                "ITEM_ULTRA_BALL",


            ITEM_ULTRA_BALL:
                "ITEM_ULTRA_BALL",


            MASTERBALL:
                "ITEM_MASTER_BALL",


            MASTER_BALL:
                "ITEM_MASTER_BALL",


            ITEM_MASTER_BALL:
                "ITEM_MASTER_BALL",


            SAFARIBALL:
                "ITEM_SAFARI_BALL",


            SAFARI_BALL:
                "ITEM_SAFARI_BALL",


            ITEM_SAFARI_BALL:
                "ITEM_SAFARI_BALL",


            LUXURYBALL:
                "ITEM_LUXURY_BALL",


            LUXURY_BALL:
                "ITEM_LUXURY_BALL",


            ITEM_LUXURY_BALL:
                "ITEM_LUXURY_BALL",


            NETBALL:
                "ITEM_NET_BALL",


            NET_BALL:
                "ITEM_NET_BALL",


            ITEM_NET_BALL:
                "ITEM_NET_BALL",


            DIVEBALL:
                "ITEM_DIVE_BALL",


            DIVE_BALL:
                "ITEM_DIVE_BALL",


            ITEM_DIVE_BALL:
                "ITEM_DIVE_BALL",


            NESTBALL:
                "ITEM_NEST_BALL",


            NEST_BALL:
                "ITEM_NEST_BALL",


            ITEM_NEST_BALL:
                "ITEM_NEST_BALL",


            REPEATBALL:
                "ITEM_REPEAT_BALL",


            REPEAT_BALL:
                "ITEM_REPEAT_BALL",


            ITEM_REPEAT_BALL:
                "ITEM_REPEAT_BALL",


            TIMERBALL:
                "ITEM_TIMER_BALL",


            TIMER_BALL:
                "ITEM_TIMER_BALL",


            ITEM_TIMER_BALL:
                "ITEM_TIMER_BALL",


            PREMIERBALL:
                "ITEM_PREMIER_BALL",


            PREMIER_BALL:
                "ITEM_PREMIER_BALL",


            ITEM_PREMIER_BALL:
                "ITEM_PREMIER_BALL"

        };


        return (

            aliases[value]
            ||
            value.startsWith(
                "ITEM_"
            )

                ?

                value

                :

                "ITEM_" +
                value

        );

    }









    //--------------------------------
    // Remove Capture
    //--------------------------------


    removeCapture(
        id
    )
    {

        return this.tracker
            .removePokemon(
                id
            );

    }









    //--------------------------------
    // Captured Pokémon List
    //--------------------------------


    getCapturedPokemon()
    {

        return this.captures
            .getCaptures();

    }



}





module.exports =
    CaptureFlow;
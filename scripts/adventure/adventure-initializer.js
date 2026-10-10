
/**
 * Pokémon Companion
 * Adventure Initializer
 *
 * Creates a new Pokémon adventure.
 *
 * Responsibilities:
 * - Reset the current adventure session.
 * - Initialize player.
 * - Select and create starter Pokémon.
 * - Initialize session.
 * - Set the starting location.
 *
 * Does NOT:
 * - Execute battles.
 * - Handle progression rules.
 * - Manage saves.
 */

"use strict";


class AdventureInitializer
{

    constructor(
        playerFlow,
        session,
        worldState = null
    )
    {

        this.playerFlow =
            playerFlow;

        this.session =
            session;

        // Kept for compatibility with the
        // existing AppContainer registration.
        // WorldStateService has no reset() method.
        this.worldState =
            worldState;

    }


    //--------------------------------
    // Start adventure
    //--------------------------------

    startAdventure(
        playerName,
        starter
    )
    {

        //--------------------------------
        // Validate inputs before resetting
        // an existing adventure.
        //--------------------------------

        if(
            !playerName ||
            typeof playerName !== "string" ||
            playerName.trim().length === 0
        )
        {

            return {

                success: false,

                reason:
                    "Invalid player name"

            };

        }


        if(
            !this.playerFlow ||
            !this.playerFlow.starterSelection
        )
        {

            return {

                success: false,

                reason:
                    "Starter selection service unavailable"

            };

        }


        const normalizedStarter =
            String(
                starter || ""
            )
            .trim()
            .toUpperCase();


        if(
            !this.playerFlow.starterSelection
                .getStarterFamily(
                    normalizedStarter
                )
                .length
        )
        {

            return {

                success: false,

                reason:
                    "Invalid starter"

            };

        }


        //--------------------------------
        // Reset the adventure session first.
        //
        // This creates a fresh TrainerState
        // and restores session.state to point
        // at session.trainerState.
        //--------------------------------

        const resetResult =
            this.session.reset();


        if(
            !resetResult ||
            !resetResult.success
        )
        {

            return {

                success: false,

                reason:
                    "Could not reset adventure session"

            };

        }


        //--------------------------------
        // Create player
        //--------------------------------

        const playerResult =
            this.playerFlow.createPlayer(
                playerName.trim()
            );


        if(
            !playerResult.success
        )
        {

            return playerResult;

        }


        //--------------------------------
        // Create and register starter Pokémon
        //--------------------------------

        const starterResult =
            this.playerFlow.chooseStarter(
                normalizedStarter
            );


        if(
            !starterResult.success
        )
        {

            return starterResult;

        }


        //--------------------------------
        // Start session
        //--------------------------------

        const startResult =
            this.session.start();


        if(
            !startResult ||
            !startResult.success
        )
        {

            return {

                success: false,

                reason:
                    "Could not start adventure session"

            };

        }


        //--------------------------------
        // Set starting location
        //--------------------------------

        this.session.setLocation(
            "PALLET_TOWN"
        );


        //--------------------------------
        // Return initialized adventure
        //--------------------------------

        return {

            success: true,

            player:
                this.playerFlow.getPlayer(),

            starter:
                this.playerFlow.getStarter(),

            pokemon:
                starterResult.pokemon,

            location:
                this.session.getLocation()

        };

    }

}


module.exports =
    AdventureInitializer;

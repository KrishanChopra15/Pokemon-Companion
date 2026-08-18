/**
 * Pokémon Companion
 * Player Manager
 *
 * Handles player profile creation.
 *
 * Responsibilities:
 * - Create player profile.
 * - Store trainer identity.
 * - Initialize player state.
 * - Connect player with session.
 *
 * Does NOT:
 * - Choose starter Pokémon.
 * - Handle battles.
 * - Manage progression.
 * - Modify databases.
 */

"use strict";





class PlayerManager {



    constructor()
    {

        this.players = [];

        this.nextId = 1;

    }









    //--------------------------------
    // Create player
    //--------------------------------


    createPlayer(
        name
    )
    {


        if(
            !name
            ||
            name.trim().length === 0
        )
        {

            return {

                success:false,

                reason:
                    "Invalid player name"

            };

        }








        const player =
        {

            id:

                this.nextId++,


            name:

                name,


            createdAt:

                Date.now(),


            starter:

                null,


            trainerState:

            {

                badges:[],

                team:[],

                inventory:[],

                storyFlags:[],

                currentLocation:
                    "PALLET_TOWN"

            }


        };








        this.players.push(

            player

        );








        return {

            success:true,

            player

        };


    }









    //--------------------------------
    // Get player
    //--------------------------------


    getPlayer(
        id
    )
    {

        return this.players.find(

            player =>

                player.id === id

        )

        ||

        null;

    }









    //--------------------------------
    // Get all players
    //--------------------------------


    getAllPlayers()
    {

        return this.players;

    }









    //--------------------------------
    // Attach player to session
    //--------------------------------


    attachToSession(
        session,
        player
    )
    {


        if(
            !session
            ||
            !player
        )
        {

            return {

                success:false,

                reason:
                    "Invalid session or player"

            };

        }





        session.setPlayer(

            player

        );





        return {

            success:true,

            player

        };


    }









    //--------------------------------
    // Update player
    //--------------------------------


    updatePlayer(
        id,
        updates
    )
    {


        const player =
            this.getPlayer(
                id
            );



        if(
            !player
        )
        {

            return {

                success:false,

                reason:
                    "Player not found"

            };

        }








        Object.assign(

            player,

            updates

        );








        return {

            success:true,

            player

        };


    }



}





module.exports =
    PlayerManager;
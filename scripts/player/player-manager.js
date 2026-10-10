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



    constructor(
        session
    )
    {


        this.session =
            session;


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
                1,


            name:
                name,


            createdAt:
                Date.now(),


            starter:
                null

        };








        this.session
            .setPlayer(
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


        const player =
            this.session
                .getPlayer();


        if(
            !player
        )
        {

            return null;

        }


        if(
            id !== undefined
            &&
            player.id !== id
        )
        {

            return null;

        }


        return player;

    }









    //--------------------------------
    // Get all players
    //--------------------------------


    getAllPlayers()
    {


        const player =
            this.session
                .getPlayer();


        if(
            !player
        )
        {

            return [];

        }


        return [
            player
        ];

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








        if(
            !updates
            ||
            typeof updates !==
                "object"
        )
        {

            return {

                success:false,

                reason:
                    "Invalid updates"

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
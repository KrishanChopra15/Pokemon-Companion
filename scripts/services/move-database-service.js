/**
 * Pokémon Companion
 * Move Database Service
 *
 * Provides access to generated Pokémon move database.
 *
 * Responsibilities:
 * - Load move database.
 * - Query move information.
 * - Normalize move data for battle systems.
 *
 * Does NOT:
 * - Execute moves.
 * - Teach moves.
 * - Handle battle logic.
 * - Modify Pokémon.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class MoveDatabaseService {



    constructor(
        game = "firered"
    )
    {


        const databasePath =
            path.join(

                __dirname,

                "../../database/generated",

                game,

                "pokemon-moves.json"

            );




        this.moves =
            JSON.parse(

                fs.readFileSync(

                    databasePath,

                    "utf8"

                )

            );


    }









    //--------------------------------
    // Normalize move data
    //--------------------------------
    //
    // Converts database format
    // into battle format
    //
    //--------------------------------


    normalizeMove(
        move
    )
    {


        if(
            !move
        )
        {

            return null;

        }






        const normalized =
        {

            ...move

        };








        //--------------------------------
        // Normalize type
        //--------------------------------


        if(
            typeof normalized.type === "object"

            &&

            normalized.type.constant
        )
        {


            normalized.type =

                normalized.type.constant

                .replace(

                    "TYPE_",

                    ""

                );


        }








        //--------------------------------
        // Normalize effect
        //--------------------------------


        if(
            typeof normalized.effect === "object"

            &&

            normalized.effect.constant
        )
        {


            normalized.effect =

                normalized.effect.constant;


        }








        return normalized;


    }









    //--------------------------------
    // Get move by ID
    //--------------------------------


    getMoveById(
        id
    )
    {


        const move =
            this.moves.find(

                move =>

                    move.id === id

            );



        return this.normalizeMove(

            move

        );


    }









    //--------------------------------
    // Get move by constant
    //--------------------------------


    getMoveByConstant(
        constant
    )
    {


        const move =
            this.moves.find(

                move =>

                    move.constant === constant

            );



        return this.normalizeMove(

            move

        );


    }









    //--------------------------------
    // Generic move lookup
    //--------------------------------


    getMove(
        constant
    )
    {


        return this.getMoveByConstant(

            constant

        );


    }









    //--------------------------------
    // Get move by name
    //--------------------------------


    getMoveByName(
        name
    )
    {


        const search =
            name.toLowerCase();




        const move =
            this.moves.find(

                move =>

                    move.name &&

                    move.name.toLowerCase()

                    ===

                    search

            );



        return this.normalizeMove(

            move

        );


    }









    //--------------------------------
    // Get all moves
    //--------------------------------


    getAllMoves()
    {


        return this.moves.map(

            move =>

                this.normalizeMove(

                    move

                )

        );


    }









    //--------------------------------
    // Check existence
    //--------------------------------


    hasMove(
        constant
    )
    {


        return this.moves.some(

            move =>

                move.constant === constant

        );


    }



}





module.exports =
    MoveDatabaseService;
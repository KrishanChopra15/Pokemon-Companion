/**
 * Pokémon Companion
 * Move Database Service
 *
 * Provides access to generated Pokémon move database.
 *
 * Responsibilities:
 * - Load move database.
 * - Query move information.
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
    // Get move by ID
    //--------------------------------


    getMoveById(
        id
    )
    {


        return this.moves.find(

            move =>

                move.id === id

        )

        ||

        null;


    }









    //--------------------------------
    // Get move by constant
    //--------------------------------


    getMoveByConstant(
        constant
    )
    {


        return this.moves.find(

            move =>

                move.constant === constant

        )

        ||

        null;


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




        return this.moves.find(

            move =>

                move.name &&

                move.name.toLowerCase()

                ===

                search

        )

        ||

        null;


    }









    //--------------------------------
    // Get all moves
    //--------------------------------


    getAllMoves()
    {

        return this.moves;

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
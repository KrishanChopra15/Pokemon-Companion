/**
 * Pokémon Companion
 * NPC Service
 *
 * Provides NPC information.
 *
 * Responsibilities:
 * - Load NPC database.
 * - Find NPCs in locations.
 * - Find NPC by ID.
 *
 * Does NOT:
 * - Execute dialogue.
 * - Execute choices.
 * - Modify player state.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class NPCService {



    constructor(
        game = "firered"
    )
    {


        const file =
            path.join(

                __dirname,

                "../../database/generated",

                game,

                "npcs.json"

            );





        if(
            !fs.existsSync(file)
        )
        {

            throw new Error(

                `NPC database missing: ${file}`

            );

        }








        const data =
            JSON.parse(

                fs.readFileSync(

                    file,

                    "utf8"

                )

            );








        this.npcs = [];








        //--------------------------------
        // Flatten location NPC data
        //--------------------------------


        for(
            const location of Object.keys(data)
        )
        {


            const locationNPCs =
                data[location];



            for(
                const npc of locationNPCs
            )
            {


                this.npcs.push({

                    ...npc,


                    location


                });


            }


        }


    }









    //--------------------------------
    // Get NPCs in location
    //--------------------------------


    getNPCs(
        location
    )
    {


        return this.npcs.filter(

            npc =>

                npc.location === location

        );


    }









    //--------------------------------
    // Get NPC by ID
    //--------------------------------


    getNPC(
        id
    )
    {


        return (

            this.npcs.find(

                npc =>

                    npc.id === id

            )

            ||

            null

        );


    }









    //--------------------------------
    // Get all NPCs
    //--------------------------------


    getAllNPCs()
    {


        return this.npcs;


    }







    //--------------------------------
    // Count NPCs
    //--------------------------------


    count()
    {


        return this.npcs.length;


    }



}





module.exports =
    NPCService;
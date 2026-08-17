/**
 * Pokémon Companion
 * Event Generator
 *
 * Generates generated event database from extracted scripts.
 *
 * Output:
 * database/generated/{game}/events.json
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



class EventGenerator {



    generate(
        scripts,
        npcs,
        objects,
        game
    )
    {


        const events = [];



        //--------------------------------
        // Convert scripts into events
        //--------------------------------


        for(
            const script of Object.values(
                scripts
            )
        )
        {


            const relatedNPC =
                this.findNPC(
                    npcs,
                    objects,
                    script.id
                );



            const npcData =
                relatedNPC
                ?
                relatedNPC.npc
                :
                null;



            const location =
                relatedNPC
                ?
                relatedNPC.location
                :
                null;



            const effects =
                script.effects
                ||
                {};





            events.push({

                //--------------------------------
                // Identity
                //--------------------------------


                id:
                    script.id,


                sourceScript:
                    script.id,





                //--------------------------------
                // NPC reference
                //--------------------------------


                npc:
                    script.id,


                npcData,





                //--------------------------------
                // Location
                //--------------------------------


                location:
                    this.normalizeLocation(
                        location
                    ),



                sourceLocation:
                    location,



                position:
                    npcData
                    ?
                    npcData.position
                    :
                    null,





                //--------------------------------
                // Trigger
                //--------------------------------


                trigger:
                    "interaction",





                //--------------------------------
                // Progression
                //--------------------------------


                requirements:
                    script.requirements
                    ||
                    {
                        storyFlags: [],
                        items: [],
                        badges: []
                    },


                conditions:
                    script.conditions
                    ||
                    {
                        requireStoryFlags: [],
                        excludeStoryFlags: []
                    },



                repeatable:
                    false,





                //--------------------------------
                // Dialogue
                //--------------------------------


                dialogues:
                    script.dialogues
                    ||
                    [],





                //--------------------------------
                // Effects
                //--------------------------------


                effects,





                //--------------------------------
                // Rewards
                //--------------------------------


                rewards:
                    this.convertRewards(
                        effects
                    ),





                //--------------------------------
                // Choices
                //--------------------------------


                choices:
                    []

            });



        }





        //--------------------------------
        // Save
        //--------------------------------


        const output =
            path.join(
                __dirname,
                "../../../database/generated",
                game,
                "events.json"
            );





        fs.mkdirSync(
            path.dirname(output),
            {
                recursive:true
            }
        );





        fs.writeFileSync(
            output,
            JSON.stringify(
                events,
                null,
                4
            )
        );





        console.log();

        console.log(
            "Generated event database."
        );


        console.log(
            `Events: ${events.length}`
        );


        console.log();



        return events;


    }





    //--------------------------------
    // Normalize location names
    //--------------------------------


    normalizeLocation(
        location
    )
    {


        if(
            !location
        )
            return null;



        return location
            .replace(
                "MAP_",
                ""
            )
            .toLowerCase();


    }





    //--------------------------------
    // Convert effects → rewards
    //--------------------------------


    convertRewards(
        effects = {}
    )
    {


        const rewards = [];





        //--------------------------------
        // Items
        //--------------------------------


        for(
            const item of effects.addItems || []
        )
        {


            rewards.push({

                type:
                    "item",


                item:
                    item.item
                    ||
                    item.name,


                quantity:
                    item.quantity
                    ||
                    1

            });


        }





        //--------------------------------
        // Pokémon
        //--------------------------------


        for(
            const pokemon of effects.addPokemon || []
        )
        {


            rewards.push({

                type:
                    "pokemon",


                pokemon

            });


        }





        //--------------------------------
        // Eggs
        //--------------------------------


        for(
            const egg of effects.addEggs || []
        )
        {


            rewards.push({

                type:
                    "egg",


                pokemon:
                    egg

            });


        }





        //--------------------------------
        // Money
        //--------------------------------


        if(
            effects.addMoney > 0
        )
        {


            rewards.push({

                type:
                    "money",


                amount:
                    effects.addMoney

            });


        }





        //--------------------------------
        // TMs
        //--------------------------------


        for(
            const tm of effects.addTMs || []
        )
        {


            rewards.push({

                type:
                    "tm",


                tm

            });


        }





        //--------------------------------
        // Key Items
        //--------------------------------


        for(
            const item of effects.addKeyItems || []
        )
        {


            rewards.push({

                type:
                    "keyItem",


                item

            });


        }





        return rewards;


    }





    //--------------------------------
    // Find NPC / Object / Script
    //--------------------------------


    findNPC(
        npcs,
        objects,
        scriptId
    )
    {


        //--------------------------------
        // NPC database
        //--------------------------------


        for(
            const [location,npcList]
            of Object.entries(npcs)
        )
        {


            for(
                const npc of npcList
            )
            {


                if(
                    npc.script === scriptId
                )
                {


                    return {

                        location,

                        npc

                    };


                }


            }


        }





        //--------------------------------
        // Object events
        //--------------------------------


        for(
            const object of objects || []
        )
        {


            if(
                object.script === scriptId
            )
            {


                return {

                    location:
                        object.location
                        ||
                        null,


                    npc:
                        object

                };


            }


        }





        //--------------------------------
        // Script-only event
        //--------------------------------


        return {

            location:null,

            npc:null

        };


    }


}


module.exports =
EventGenerator;
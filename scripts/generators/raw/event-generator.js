/**
 * Pokémon Companion
 * Event Generator
 *
 * Generates generated event database from extracted scripts.
 *
 * Output:
 * database/generated/{game}/events.json
 *
 * Responsibilities:
 * - Convert extracted scripts into event records.
 * - Preserve event map/location information.
 * - Preserve requirements and conditions.
 * - Preserve event effects and rewards.
 * - Associate events with NPC/object data when available.
 *
 * Does NOT:
 * - Execute scripts.
 * - Calculate progression.
 * - Modify player state.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class EventGenerator
{


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
            const script of
                Object.values(
                    scripts
                )
        )
        {

            if(
                !script
            )
            {

                continue;

            }


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


            //--------------------------------
            // Resolve event location
            //
            // Prefer the actual location from
            // NPC/object association.
            //
            // Otherwise use the canonical map
            // captured by EventScriptExtractor.
            //--------------------------------

            const location =
                relatedNPC?.location
                ||
                script.map
                ||
                script.location
                ||
                null;


            const sourceLocation =
                script.map
                ||
                relatedNPC?.location
                ||
                script.location
                ||
                null;


            const effects =
                script.effects
                ||
                {};


            //--------------------------------
            // Create event
            //--------------------------------

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
                    relatedNPC?.npc
                    ?
                    script.id
                    :
                    null,


                npcData,





                //--------------------------------
                // Location
                //--------------------------------

                location:
                    this.normalizeLocation(

                        location

                    ),


                sourceLocation,



                map:
                    script.map
                    ||
                    null,



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
                    this.normalizeRequirements(

                        script.requirements

                    ),


                conditions:
                    this.normalizeConditions(

                        script.conditions

                    ),



                repeatable:
                    false,





                //--------------------------------
                // Dialogue
                //--------------------------------

                dialogues:
                    Array.isArray(
                        script.dialogues
                    )
                    ?
                    script.dialogues
                    :
                    [],





                //--------------------------------
                // Script calls
                //--------------------------------

                calls:
                    Array.isArray(
                        script.calls
                    )
                    ?
                    script.calls
                    :
                    [],





                //--------------------------------
                // Script jumps
                //--------------------------------

                jumps:
                    Array.isArray(
                        script.jumps
                    )
                    ?
                    script.jumps
                    :
                    [],





                //--------------------------------
                // Specials
                //--------------------------------

                specials:
                    Array.isArray(
                        script.specials
                    )
                    ?
                    script.specials
                    :
                    [],


                specialVars:
                    Array.isArray(
                        script.specialVars
                    )
                    ?
                    script.specialVars
                    :
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

            path.dirname(
                output
            ),

            {
                recursive:
                    true
            }

        );


        fs.writeFileSync(

            output,

            JSON.stringify(

                events,

                null,

                4

            ),

            "utf8"

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
        {

            return null;

        }


        return String(
            location
        )
        .replace(
            /^MAP_/,
            ""
        )
        .toLowerCase();

    }





    //--------------------------------
    // Normalize requirements
    //--------------------------------

    normalizeRequirements(
        requirements
    )
    {

        if(
            !requirements
            ||
            typeof requirements !==
                "object"
        )
        {

            return {

                storyFlags:
                    [],

                items:
                    [],

                badges:
                    []

            };

        }


        return {

            storyFlags:
                Array.isArray(
                    requirements.storyFlags
                )
                ?
                [
                    ...new Set(
                        requirements.storyFlags
                    )
                ]
                :
                [],


            items:
                Array.isArray(
                    requirements.items
                )
                ?
                [
                    ...new Set(
                        requirements.items
                    )
                ]
                :
                [],


            badges:
                Array.isArray(
                    requirements.badges
                )
                ?
                [
                    ...new Set(
                        requirements.badges
                    )
                ]
                :
                []

        };

    }





    //--------------------------------
    // Normalize conditions
    //--------------------------------

    normalizeConditions(
        conditions
    )
    {

        if(
            !conditions
            ||
            typeof conditions !==
                "object"
        )
        {

            return {

                requireStoryFlags:
                    [],

                excludeStoryFlags:
                    []

            };

        }


        return {

            requireStoryFlags:
                Array.isArray(
                    conditions.requireStoryFlags
                )
                ?
                [
                    ...new Set(
                        conditions.requireStoryFlags
                    )
                ]
                :
                [],


            excludeStoryFlags:
                Array.isArray(
                    conditions.excludeStoryFlags
                )
                ?
                [
                    ...new Set(
                        conditions.excludeStoryFlags
                    )
                ]
                :
                []

        };

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
            const item of
                effects.addItems || []
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
            const pokemon of
                effects.addPokemon || []
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
            const egg of
                effects.addEggs || []
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
            const tm of
                effects.addTMs || []
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
            const item of
                effects.addKeyItems || []
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
            const [
                location,
                npcList
            ]
            of
                Object.entries(
                    npcs || {}
                )
        )
        {

            if(
                !Array.isArray(
                    npcList
                )
            )
            {

                continue;

            }


            for(
                const npc of
                    npcList
            )
            {

                if(
                    npc
                    &&
                    npc.script ===
                        scriptId
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
            const object of
                objects || []
        )
        {

            if(
                object
                &&
                object.script ===
                    scriptId
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

        return null;

    }


}





module.exports =
    EventGenerator;
/**
 * Pokémon Companion
 * Event Script Extractor
 *
 * Extracts event scripts:
 * - Dialogue references
 * - Item rewards
 * - Pokémon gifts
 * - Egg gifts
 * - Money rewards
 * - TM rewards
 * - Key items
 * - Wild battles
 * - Trainer battles
 * - Story flags
 * - Variables
 * - Script calls
 * - Script jumps
 * - Special commands
 * - Special-var commands
 * - Requirements
 * - Conditions
 *
 * Does NOT:
 * - Execute scripts.
 * - Modify player state.
 * - Resolve trainer data.
 * - Resolve NPC data.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");


const EventRequirementExtractor =
    require("./event-requirement-extractor");


const EventScriptCallExtractor =
    require("./event-script-call-extractor");


const EventScriptJumpExtractor =
    require("./event-script-jump-extractor");


const EventScriptEffectExtractor =
    require("./event-script-effect-extractor");


class EventScriptExtractor
{


    constructor()
    {

        this.requirementExtractor =
            new EventRequirementExtractor();


        this.callExtractor =
            new EventScriptCallExtractor();


        this.jumpExtractor =
            new EventScriptJumpExtractor();


        this.effectExtractor =
            new EventScriptEffectExtractor();

    }


    //--------------------------------
    // Extract all event scripts
    //--------------------------------

    extract(
        referencePath
    )
    {

        const mapsPath =
            path.join(

                referencePath,

                "data/maps"

            );


        const scripts =
            {};


        const maps =
            fs.readdirSync(

                mapsPath,

                {
                    withFileTypes:
                        true

                }

            );


        for(
            const mapEntry of
                maps
        )
        {

            //--------------------------------
            // Only process directories.
            //--------------------------------

            if(
                !mapEntry.isDirectory()
            )
            {

                continue;

            }


            const map =
                mapEntry.name;


            const mapDirectory =
                path.join(

                    mapsPath,

                    map

                );


            const mapFile =
                path.join(

                    mapDirectory,

                    "map.json"

                );


            const file =
                path.join(

                    mapDirectory,

                    "scripts.inc"

                );


            if(
                !fs.existsSync(
                    file
                )
            )
            {

                continue;

            }


            //--------------------------------
            // Read the canonical map ID.
            //
            // This prevents us from guessing a
            // MAP_* constant from the directory.
            //--------------------------------

            let mapId =
                null;


            if(
                fs.existsSync(
                    mapFile
                )
            )
            {

                try
                {

                    const mapData =
                        JSON.parse(

                            fs.readFileSync(

                                mapFile,

                                "utf8"

                            )

                        );


                    if(
                        typeof mapData.id ===
                            "string"
                    )
                    {

                        mapId =
                            mapData.id;

                    }

                }
                catch(
                    error
                )
                {

                    throw new Error(

                        `Failed to read map metadata: ${mapFile}\n` +
                        error.message

                    );

                }

            }


            Object.assign(

                scripts,

                this.extractScripts(

                    file,

                    mapId

                )

            );

        }


        return scripts;

    }


    //--------------------------------
    // Extract scripts from one file
    //--------------------------------

    extractScripts(
        file,
        map = null
    )
    {

        const content =
            fs.readFileSync(

                file,

                "utf8"

            );


        const result =
            {};


        //--------------------------------
        // Capture script blocks
        //--------------------------------

        const regex =
            /([A-Za-z0-9_]+)::([\s\S]*?)(?=\n[A-Za-z0-9_]+::|$)/g;


        let match;


        while(
            (
                match =
                    regex.exec(
                        content
                    )
            )
        )
        {

            const id =
                match[1];


            const body =
                match[2];


            //--------------------------------
            // Requirements / Conditions
            //--------------------------------

            const requirementData =
                this.requirementExtractor.extract(

                    body

                );


            //--------------------------------
            // Variables
            //--------------------------------

            const variables =
                this.effectExtractor.extractVariables(

                    body

                );


            //--------------------------------
            // Dialogues
            //--------------------------------

            const dialogues =
                [

                    ...body.matchAll(

                        /msgbox\s+([A-Za-z0-9_]+)/g

                    )

                ]
                .map(

                    x =>
                        x[1]

                );


            //--------------------------------
            // Script calls
            //--------------------------------

            const calls =
                this.callExtractor.extract(

                    body

                );


            //--------------------------------
            // Script jumps
            //--------------------------------

            const jumps =
                this.jumpExtractor.extract(

                    body

                );


            //--------------------------------
            // Special commands
            //--------------------------------

            const specials =
                this.extractSpecials(

                    body

                );


            //--------------------------------
            // Special-var commands
            //--------------------------------

            const specialVars =
                this.extractSpecialVars(

                    body

                );


            //--------------------------------
            // Effects
            //--------------------------------

            const effects =
                this.effectExtractor.extract(

                    body

                );


            //--------------------------------
            // Save
            //--------------------------------

            // Keep scripts that only delegate
            // through calls, jumps, specials,
            // or special-vars.

            if(

                dialogues.length

                ||

                calls.length

                ||

                jumps.length

                ||

                specials.length

                ||

                specialVars.length

                ||

                effects.addItems.length

                ||

                effects.addPokemon.length

                ||

                effects.addEggs.length

                ||

                effects.addTMs.length

                ||

                effects.addKeyItems.length

                ||

                effects.addMoney > 0

                ||

                effects.addStoryFlags.length

                ||

                effects.removeStoryFlags.length

                ||

                effects.battles.length

            )
            {

                result[id] =
                {

                    id,

                    map,

                    dialogues,

                    calls,

                    jumps,

                    specials,

                    specialVars,

                    effects,

                    requirements:
                        requirementData.requirements,

                    conditions:
                        requirementData.conditions

                };

            }

        }


        return result;

    }


    //--------------------------------
    // Extract special commands
    //--------------------------------

    extractSpecials(
        body
    )
    {

        const specials =
            [];


        for(
            const match of
                body.matchAll(

                    /^\s*special\s+([A-Za-z0-9_]+)/gm

                )
        )
        {

            specials.push({

                type:
                    "SPECIAL",

                name:
                    match[1]

            });

        }


        return specials;

    }


    //--------------------------------
    // Extract special-var commands
    //--------------------------------

    extractSpecialVars(
        body
    )
    {

        const specialVars =
            [];


        for(
            const match of
                body.matchAll(

                    /^\s*specialvar\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)/gm

                )
        )
        {

            specialVars.push({

                type:
                    "SPECIAL_VAR",

                variable:
                    match[1],

                name:
                    match[2]

            });

        }


        return specialVars;

    }


}


module.exports =
    EventScriptExtractor;
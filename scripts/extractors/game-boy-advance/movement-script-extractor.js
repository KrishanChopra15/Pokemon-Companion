/**
 * Pokémon Companion
 * Movement Script Extractor
 *
 * Extracts movement script definitions from FireRed source.
 *
 * Responsibilities:
 * - Read movement definitions from map scripts.
 * - Identify movement script labels.
 * - Preserve movement command order.
 * - Preserve command arguments.
 * - Classify common movement commands.
 * - Preserve unknown movement commands without discarding them.
 *
 * Does NOT:
 * - Execute movement scripts.
 * - Calculate final coordinates.
 * - Resolve NPCs.
 * - Resolve event scripts.
 * - Modify game state.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



class MovementScriptExtractor
{


    //--------------------------------
    // Extract all movement scripts
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


        const result =
            {};


        if(
            !fs.existsSync(
                mapsPath
            )
        )
        {

            return result;

        }


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

            if(
                !mapEntry.isDirectory()
            )
            {

                continue;

            }


            const map =
                mapEntry.name;


            const scriptsFile =
                path.join(

                    mapsPath,

                    map,

                    "scripts.inc"

                );


            if(
                !fs.existsSync(
                    scriptsFile
                )
            )
            {

                continue;

            }


            const scripts =
                this.extractFile(

                    scriptsFile,

                    map

                );


            for(
                const [
                    id,
                    movement
                ]
                of Object.entries(
                    scripts
                )
            )
            {

                result[id] =
                    movement;

            }

        }


        return result;

    }


    //--------------------------------
    // Extract movement scripts
    // from one scripts.inc file
    //--------------------------------

    extractFile(
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
        // Capture labeled blocks
        //--------------------------------
        //
        // The final alternative uses a true
        // JavaScript end-of-input check:
        //
        // (?![\s\S])
        //
        // This is used instead of \z because
        // JavaScript does not support \z.
        //--------------------------------

        const regex =
            /^([A-Za-z0-9_]+)::([\s\S]*?)(?=^[A-Za-z0-9_]+::|(?![\s\S]))/gm;


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


            //--------------------------------
            // Only movement definitions
            //--------------------------------

            if(
                !this.isMovementScript(
                    id
                )
            )
            {

                continue;

            }


            const body =
                match[2];


            const commands =
                this.extractCommands(
                    body
                );


            //--------------------------------
            // Ignore empty definitions
            //--------------------------------

            if(
                commands.length ===
                0
            )
            {

                continue;

            }


            result[id] =
            {

                id,

                map,

                commands

            };

        }


        return result;

    }


    //--------------------------------
    // Determine whether a label is
    // a movement definition
    //--------------------------------

    isMovementScript(
        id
    )
    {

        const value =
            String(
                id ||
                ""
            );


        return (

            value.includes(
                "Movement_"
            )

        );

    }


    //--------------------------------
    // Extract movement commands
    //--------------------------------

    extractCommands(
        body
    )
    {

        const commands =
            [];


        const lines =
            body.split(
                "\n"
            );


        for(
            const line of
                lines
        )
        {

            let value =
                line.trim();


            //--------------------------------
            // Ignore empty lines
            //--------------------------------

            if(
                !value
            )
            {

                continue;

            }


            //--------------------------------
            // Ignore comments
            //--------------------------------

            if(
                value.startsWith(
                    "@"
                )
            )
            {

                continue;

            }


            //--------------------------------
            // Remove inline comments
            //--------------------------------

            const commentIndex =
                value.indexOf(
                    "@"
                );


            if(
                commentIndex !==
                -1
            )
            {

                value =
                    value
                        .slice(
                            0,
                            commentIndex
                        )
                        .trim();

            }


            if(
                !value
            )
            {

                continue;

            }


            //--------------------------------
            // Ignore labels
            //--------------------------------

            if(
                value.endsWith(
                    "::"
                )
            )
            {

                continue;

            }


            //--------------------------------
            // Ignore assembler directives
            //--------------------------------

            if(
                value.startsWith(
                    "."
                )
            )
            {

                continue;

            }


            //--------------------------------
            // Ignore preprocessor lines
            //--------------------------------

            if(
                value.startsWith(
                    "#"
                )
            )
            {

                continue;

            }


            //--------------------------------
            // Parse command
            //--------------------------------

            const parts =
                value
                    .split(
                        /[,\s]+/
                    )
                    .filter(
                        Boolean
                    );


            if(
                parts.length ===
                0
            )
            {

                continue;

            }


            const name =
                parts[0];


            const argumentsList =
                parts.slice(
                    1
                );


            commands.push({

                type:
                    this.classifyCommand(
                        name
                    ),

                name,

                arguments:
                    argumentsList,

                raw:
                    value

            });

        }


        return commands;

    }


    //--------------------------------
    // Classify movement command
    //--------------------------------

    classifyCommand(
        name
    )
    {

        const value =
            String(
                name ||
                ""
            ).toLowerCase();


        //--------------------------------
        // Terminator
        //--------------------------------

        if(
            value ===
            "step_end"
        )
        {

            return "STEP_END";

        }


        //--------------------------------
        // Delays
        //--------------------------------

        if(
            value.startsWith(
                "delay_"
            )
        )
        {

            return "DELAY";

        }


        //--------------------------------
        // Walking
        //--------------------------------

        if(
            value.startsWith(
                "walk_"
            )
            ||
            value.startsWith(
                "run_"
            )
        )
        {

            return "WALK";

        }


        //--------------------------------
        // Sliding
        //--------------------------------

        if(
            value.startsWith(
                "slide_"
            )
        )
        {

            return "SLIDE";

        }


        //--------------------------------
        // Jumping
        //--------------------------------

        if(
            value.startsWith(
                "jump_"
            )
        )
        {

            return "JUMP";

        }


        //--------------------------------
        // Facing
        //--------------------------------

        if(
            value.startsWith(
                "face_"
            )
        )
        {

            return "FACE";

        }


        //--------------------------------
        // Facing lock/unlock
        //--------------------------------

        if(
            value ===
            "lock_facing_direction"
        )
        {

            return "LOCK_FACING";

        }


        if(
            value ===
            "unlock_facing_direction"
        )
        {

            return "UNLOCK_FACING";

        }


        //--------------------------------
        // Generic movement command
        //--------------------------------

        return "MOVEMENT";

    }


}


module.exports =
    MovementScriptExtractor;
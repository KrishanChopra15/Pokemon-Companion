/**
 * Pokémon Companion
 * Movement Script Generator
 *
 * Generates the raw movement script database.
 *
 * Responsibilities:
 * - Convert extracted movement scripts into a raw database.
 * - Group movement scripts by map.
 * - Preserve movement command order.
 * - Preserve command names.
 * - Preserve command arguments.
 * - Preserve raw command text.
 * - Write the movement script database.
 *
 * Does NOT:
 * - Execute movement commands.
 * - Resolve NPCs.
 * - Calculate final coordinates.
 * - Resolve event scripts.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



class MovementScriptGenerator
{


    //--------------------------------
    // Generate movement script database
    //--------------------------------

    generate(
        movements,
        game
    )
    {

        if(
            !movements
            ||
            typeof movements !==
                "object"
            ||
            Array.isArray(
                movements
            )
        )
        {

            throw new TypeError(
                "Movement script data must be an object."
            );

        }


        if(
            typeof game !==
                "string"
            ||
            !game
        )
        {

            throw new TypeError(
                "Game must be a non-empty string."
            );

        }


        const database =
            {};


        //--------------------------------
        // Group movement scripts by map
        //--------------------------------

        for(
            const movement of
                Object.values(
                    movements
                )
        )
        {

            if(
                !movement
                ||
                typeof movement !==
                    "object"
            )
            {

                continue;

            }


            const map =
                movement.map
                ||
                "UNKNOWN";


            if(
                !database[map]
            )
            {

                database[map] =
                    [];

            }


            database[map].push(

                this.normalizeMovement(
                    movement
                )

            );

        }


        //--------------------------------
        // Sort movement scripts by ID
        //--------------------------------

        for(
            const map of
                Object.keys(
                    database
                )
        )
        {

            database[map].sort(

                (
                    a,
                    b
                ) =>

                    String(
                        a.id
                    )
                    .localeCompare(
                        String(
                            b.id
                        )
                    )

            );

        }


        //--------------------------------
        // Write database
        //--------------------------------

        const outputPath =
            path.join(

                __dirname,

                "../../../database/raw",

                game,

                "movement-scripts.json"

            );


        fs.mkdirSync(

            path.dirname(
                outputPath
            ),

            {
                recursive:
                    true
            }

        );


        fs.writeFileSync(

            outputPath,

            JSON.stringify(

                database,

                null,

                4

            ),

            "utf8"

        );


        //--------------------------------
        // Statistics
        //--------------------------------

        const locations =
            Object.keys(
                database
            );


        const totalMovements =
            Object.values(
                database
            )
            .reduce(

                (
                    total,
                    mapMovements
                ) =>

                    total +
                    mapMovements.length,

                0

            );


        const totalCommands =
            Object.values(
                database
            )
            .flat()
            .reduce(

                (
                    total,
                    movement
                ) =>

                    total +
                    (
                        movement.commands?.length
                        ||
                        0
                    ),

                0

            );


        console.log();


        console.log(
            "Generated movement script database."
        );


        console.log(
            `Game: ${game}`
        );


        console.log(
            `Locations: ${locations.length}`
        );


        console.log(
            `Movement definitions: ${totalMovements}`
        );


        console.log(
            `Movement commands: ${totalCommands}`
        );


        console.log();


        return database;

    }


    //--------------------------------
    // Normalize one movement script
    //--------------------------------

    normalizeMovement(
        movement
    )
    {

        return {

            id:
                movement.id
                ||
                null,

            map:
                movement.map
                ||
                null,

            commands:
                this.normalizeCommands(

                    movement.commands

                )

        };

    }


    //--------------------------------
    // Normalize movement commands
    //--------------------------------

    normalizeCommands(
        commands
    )
    {

        if(
            !Array.isArray(
                commands
            )
        )
        {

            return [];

        }


        return commands.map(

            command =>

                this.normalizeCommand(
                    command
                )

        );

    }


    //--------------------------------
    // Normalize one command
    //--------------------------------

    normalizeCommand(
        command
    )
    {

        if(
            !command
            ||
            typeof command !==
                "object"
        )
        {

            return {

                type:
                    "UNKNOWN",

                name:
                    null,

                arguments:
                    [],

                raw:
                    null

            };

        }


        return {

            type:
                command.type
                ||
                "MOVEMENT",

            name:
                command.name
                ||
                null,

            arguments:
                Array.isArray(
                    command.arguments
                )
                ?
                command.arguments
                :
                [],

            raw:
                command.raw
                ||
                command.name
                ||
                null

        };

    }


}


module.exports =
    MovementScriptGenerator;
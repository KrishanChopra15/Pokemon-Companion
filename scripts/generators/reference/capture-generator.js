/**
 * Pokémon Companion
 * Capture Reference Generator
 *
 * Generates the FireRed capture reference database.
 *
 * Responsibilities:
 * - Read FireRed capture source.
 * - Read FireRed Safari source.
 * - Coordinate capture ball parser.
 * - Coordinate capture ball builder.
 * - Coordinate Safari capture parser.
 * - Coordinate Safari capture builder.
 * - Write capture.json.
 *
 * Does NOT:
 * - Calculate capture probability.
 * - Execute capture mechanics.
 * - Read Pokémon species data.
 * - Handle battles.
 */

"use strict";


const ReferenceGenerator =
    require("./reference-generator");


const CaptureBallParser =
    require("../../parsers/reference/capture-ball-parser");


const CaptureReferenceBuilder =
    require("../../builders/capture-reference-builder");


const SafariCaptureParser =
    require("../../parsers/reference/safari-capture-parser");


const SafariCaptureReferenceBuilder =
    require("../../builders/safari-capture-reference-builder");



class CaptureGenerator
    extends ReferenceGenerator
{


    //----------------------------------------
    // Generate capture reference
    //----------------------------------------

    generate()
    {

        //----------------------------------------
        // Read FireRed battle source
        //----------------------------------------

        const battleSource =
            this.readSourceFile(

                "pokefirered",

                "src",

                "battle_script_commands.c"

            );


        //----------------------------------------
        // Read FireRed battle main source
        //----------------------------------------

        const battleMainSource =
            this.readSourceFile(

                "pokefirered",

                "src",

                "battle_main.c"

            );


        //----------------------------------------
        // Read FireRed Safari flee source
        //----------------------------------------

        const battleAiSource =
            this.readSourceFile(

                "pokefirered",

                "src",

                "battle_ai_script_commands.c"

            );


        //----------------------------------------
        // Parse capture ball rules
        //----------------------------------------

        const captureBallParser =
            new CaptureBallParser();


        const parsedBalls =
            captureBallParser.parse(

                battleSource

            );


        //----------------------------------------
        // Build capture ball reference
        //----------------------------------------

        const captureReferenceBuilder =
            new CaptureReferenceBuilder();


        const balls =
            captureReferenceBuilder.build(

                parsedBalls

            );


        //----------------------------------------
        // Parse Safari rules
        //----------------------------------------

        const safariParser =
            new SafariCaptureParser();


        const parsedSafari =
            safariParser.parse({

                battleMain:
                    battleMainSource,

                battleAi:
                    battleAiSource

            });


        //----------------------------------------
        // Build Safari reference
        //----------------------------------------

        const safariBuilder =
            new SafariCaptureReferenceBuilder();


        const safari =
            safariBuilder.build(

                parsedSafari

            );


        //----------------------------------------
        // Combine capture reference
        //----------------------------------------

        const capture =
        {

            balls,

            safari

        };


        //----------------------------------------
        // Write database
        //----------------------------------------

        this.writeGameDatabase(

            capture

        );


        //----------------------------------------
        // Output information
        //----------------------------------------

        console.log();

        console.log(

            "Generated capture reference database."

        );

        console.log(

            "Game: firered"

        );

        console.log(

            `Capture balls: ${
                this.countCaptureBalls(
                    balls
                )
            }`

        );

        console.log(

            `Safari actions: ${
                this.countSafariActions(
                    safari
                )
            }`

        );

    }


    //----------------------------------------
    // Count capture balls
    //----------------------------------------

    countCaptureBalls(
        balls
    )
    {

        if(
            !balls
        )
        {

            return 0;

        }


        let count =
            0;


        if(
            Array.isArray(
                balls.standardBalls
            )
        )
        {

            count +=
                balls.standardBalls.length;

        }


        if(
            Array.isArray(
                balls.conditionalBalls
            )
        )
        {

            count +=
                balls.conditionalBalls.length;

        }


        if(
            balls.masterBall
        )
        {

            count +=
                1;

        }


        return count;

    }


    //----------------------------------------
    // Count Safari actions
    //----------------------------------------

    countSafariActions(
        safari
    )
    {

        if(
            !safari
        )
        {

            return 0;

        }


        let count =
            0;


        if(
            safari.bait
        )
        {

            count +=
                1;

        }


        if(
            safari.rock
        )
        {

            count +=
                1;

        }


        return count;

    }


    //----------------------------------------
    // Write game-specific database
    //----------------------------------------

    writeGameDatabase(
        data
    )
    {

        const fs =
            require("fs");


        const path =
            require("path");


        const directory =
            path.join(

                process.cwd(),

                "database",

                "reference",

                "firered"

            );


        fs.mkdirSync(

            directory,

            {

                recursive:
                    true

            }

        );


        const file =
            path.join(

                directory,

                "capture.json"

            );


        fs.writeFileSync(

            file,

            JSON.stringify(

                data,

                null,

                4

            )

        );


        console.log(

            `Generated ${file}`

        );

    }


}


module.exports =
    CaptureGenerator;
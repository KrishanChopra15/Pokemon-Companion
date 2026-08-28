/**
 * Pokémon Companion
 * Capture Ball Parser
 *
 * Parses FireRed Poké Ball capture rules from
 * battle_script_commands.c.
 *
 * Responsibilities:
 * - Locate the standard ball multiplier table.
 * - Extract standard ball multipliers.
 * - Extract conditional ball rules.
 * - Extract Master Ball behavior.
 *
 * Does NOT:
 * - Calculate capture odds.
 * - Calculate shake probability.
 * - Calculate final capture percentage.
 * - Read Pokémon data.
 * - Write databases.
 */

"use strict";


class CaptureBallParser
{


    //----------------------------------------
    // Parse capture ball rules
    //----------------------------------------

    parse(
        source
    )
    {

        if(
            typeof source !==
            "string"
        )
        {

            throw new TypeError(
                "Capture source must be a string."
            );

        }


        const standardBalls =
            this.parseStandardBalls(
                source
            );


        const conditionalBalls =
            this.parseConditionalBalls(
                source
            );


        const masterBall =
            this.parseMasterBall(
                source
            );


        return {

            standardBalls,

            conditionalBalls,

            masterBall

        };

    }


    //----------------------------------------
    // Parse standard ball table
    //----------------------------------------

    parseStandardBalls(
        source
    )
    {

        /*
         * FireRed defines:
         *
         * sBallCatchBonuses[]
         *
         * The table excerpt is:
         *
         * Ultra Ball  = 20
         * Great Ball  = 15
         * Poké Ball   = 10
         * Safari Ball = 15
         *
         * These values are divided by 10
         * by the capture calculation.
         */

        const tableRegex =
            /sBallCatchBonuses\[\][\s\S]*?\{([\s\S]*?)\};/;


        const match =
            source.match(
                tableRegex
            );


        if(
            !match
        )
        {

            throw new Error(
                "sBallCatchBonuses[] table not found."
            );

        }


        const body =
            match[1];


        const regex =
            /\[\s*(ITEM_[A-Z0-9_]+)\s*-\s*ITEM_ULTRA_BALL\s*\]\s*=\s*(\d+)\s*,/g;


        const balls =
            [];


        let entry;


        while(
            (
                entry =
                    regex.exec(
                        body
                    )
            ) !== null
        )
        {

            balls.push(

                {

                    itemConstant:
                        entry[1],

                    multiplierValue:
                        Number(
                            entry[2]
                        ),

                    multiplier:
                        Number(
                            entry[2]
                        ) / 10

                }

            );

        }


        return balls;

    }


    //----------------------------------------
    // Parse conditional balls
    //----------------------------------------

    parseConditionalBalls(
        source
    )
    {

        const balls =
            [];


        //--------------------------------
        // Net Ball
        //--------------------------------

        if(
            source.includes(
                "case ITEM_NET_BALL:"
            )
        )
        {

            balls.push(

                {

                    itemConstant:
                        "ITEM_NET_BALL",

                    type:
                        "CONDITIONAL",

                    defaultMultiplier:
                        1,

                    conditions:
                    [

                        {

                            condition:
                                "TARGET_TYPE_WATER_OR_BUG",

                            multiplier:
                                3

                        }

                    ]

                }

            );

        }


        //--------------------------------
        // Dive Ball
        //--------------------------------

        if(
            source.includes(
                "case ITEM_DIVE_BALL:"
            )
        )
        {

            balls.push(

                {

                    itemConstant:
                        "ITEM_DIVE_BALL",

                    type:
                        "CONDITIONAL",

                    defaultMultiplier:
                        1,

                    conditions:
                    [

                        {

                            condition:
                                "UNDERWATER",

                            multiplier:
                                3.5

                        }

                    ]

                }

            );

        }


        //--------------------------------
        // Nest Ball
        //--------------------------------

        if(
            source.includes(
                "case ITEM_NEST_BALL:"
            )
        )
        {

            balls.push(

                {

                    itemConstant:
                        "ITEM_NEST_BALL",

                    type:
                        "LEVEL_BASED",

                    defaultMultiplier:
                        1,

                    formula:
                        "40 - targetLevel",

                    minimumMultiplier:
                        1,

                    activeBelowLevel:
                        40

                }

            );

        }


        //--------------------------------
        // Repeat Ball
        //--------------------------------

        if(
            source.includes(
                "case ITEM_REPEAT_BALL:"
            )
        )
        {

            balls.push(

                {

                    itemConstant:
                        "ITEM_REPEAT_BALL",

                    type:
                        "CONDITIONAL",

                    defaultMultiplier:
                        1,

                    conditions:
                    [

                        {

                            condition:
                                "TARGET_ALREADY_CAUGHT",

                            multiplier:
                                3

                        }

                    ]

                }

            );

        }


        //--------------------------------
        // Timer Ball
        //--------------------------------

        if(
            source.includes(
                "case ITEM_TIMER_BALL:"
            )
        )
        {

            balls.push(

                {

                    itemConstant:
                        "ITEM_TIMER_BALL",

                    type:
                        "TURN_BASED",

                    formula:
                        "battleTurn + 10",

                    minimumMultiplier:
                        1,

                    maximumMultiplier:
                        4

                }

            );

        }


        //--------------------------------
        // Luxury Ball
        //--------------------------------

        if(
            source.includes(
                "case ITEM_LUXURY_BALL:"
            )
        )
        {

            balls.push(

                {

                    itemConstant:
                        "ITEM_LUXURY_BALL",

                    type:
                        "STANDARD",

                    multiplier:
                        1

                }

            );

        }


        //--------------------------------
        // Premier Ball
        //--------------------------------

        if(
            source.includes(
                "case ITEM_PREMIER_BALL:"
            )
        )
        {

            balls.push(

                {

                    itemConstant:
                        "ITEM_PREMIER_BALL",

                    type:
                        "STANDARD",

                    multiplier:
                        1

                }

            );

        }


        //--------------------------------
        // Safari Ball
        //--------------------------------

        if(
            source.includes(
                "ITEM_SAFARI_BALL"
            )
        )
        {

            balls.push(

                {

                    itemConstant:
                        "ITEM_SAFARI_BALL",

                    type:
                        "SAFARI",

                    multiplier:
                        1.5,

                    usesSafariCatchFactor:
                        true

                }

            );

        }


        return balls;

    }


    //----------------------------------------
    // Parse Master Ball behavior
    //----------------------------------------

    parseMasterBall(
        source
    )
    {

        if(
            !source.includes(
                "ITEM_MASTER_BALL"
            )
        )
        {

            return null;

        }


        return {

            itemConstant:
                "ITEM_MASTER_BALL",

            type:
                "GUARANTEED",

            multiplier:
                null,

            guaranteed:
                true

        };

    }

}


module.exports =
    CaptureBallParser;
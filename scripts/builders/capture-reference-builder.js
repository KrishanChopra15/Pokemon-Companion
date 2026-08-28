/**
 * Pokémon Companion
 * Capture Reference Builder
 *
 * Builds normalized capture reference data
 * from parsed FireRed Poké Ball rules.
 *
 * Responsibilities:
 * - Normalize standard ball data.
 * - Normalize conditional ball data.
 * - Normalize Master Ball data.
 *
 * Does NOT:
 * - Read source files.
 * - Parse C source.
 * - Calculate capture probability.
 * - Execute capture mechanics.
 * - Read Pokémon databases.
 * - Write databases.
 */

"use strict";


class CaptureReferenceBuilder
{


    //----------------------------------------
    // Build capture reference
    //----------------------------------------

    build(
        parsed
    )
    {

        if(
            !parsed
        )
        {

            throw new TypeError(
                "Parsed capture data is required."
            );

        }


        return {

            standardBalls:
                this.buildStandardBalls(
                    parsed.standardBalls
                ),

            conditionalBalls:
                this.buildConditionalBalls(
                    parsed.conditionalBalls
                ),

            masterBall:
                this.buildMasterBall(
                    parsed.masterBall
                )

        };

    }


    //----------------------------------------
    // Build standard balls
    //----------------------------------------

    buildStandardBalls(
        balls = []
    )
    {

        return balls.map(

            ball =>
            ({

                itemConstant:
                    ball.itemConstant,

                multiplier:
                    ball.multiplier,

                multiplierValue:
                    ball.multiplierValue

            })

        );

    }


    //----------------------------------------
    // Build conditional balls
    //----------------------------------------

    buildConditionalBalls(
        balls = []
    )
    {

        return balls.map(

            ball =>
            {

                const result =
                {

                    itemConstant:
                        ball.itemConstant,

                    type:
                        ball.type

                };


                if(
                    ball.defaultMultiplier !==
                    undefined
                )
                {

                    result.defaultMultiplier =
                        ball.defaultMultiplier;

                }


                if(
                    ball.multiplier !==
                    undefined
                )
                {

                    result.multiplier =
                        ball.multiplier;

                }


                if(
                    Array.isArray(
                        ball.conditions
                    )
                )
                {

                    result.conditions =
                        ball.conditions.map(

                            condition =>
                            ({

                                condition:
                                    condition.condition,

                                multiplier:
                                    condition.multiplier

                            })

                        );

                }


                if(
                    ball.formula
                )
                {

                    result.formula =
                        ball.formula;

                }


                if(
                    ball.minimumMultiplier !==
                    undefined
                )
                {

                    result.minimumMultiplier =
                        ball.minimumMultiplier;

                }


                if(
                    ball.maximumMultiplier !==
                    undefined
                )
                {

                    result.maximumMultiplier =
                        ball.maximumMultiplier;

                }


                if(
                    ball.activeBelowLevel !==
                    undefined
                )
                {

                    result.activeBelowLevel =
                        ball.activeBelowLevel;

                }


                if(
                    ball.usesSafariCatchFactor
                )
                {

                    result.usesSafariCatchFactor =
                        true;

                }


                return result;

            }

        );

    }


    //----------------------------------------
    // Build Master Ball
    //----------------------------------------

    buildMasterBall(
        ball
    )
    {

        if(
            !ball
        )
        {

            return null;

        }


        return {

            itemConstant:
                ball.itemConstant,

            type:
                ball.type,

            guaranteed:
                Boolean(
                    ball.guaranteed
                )

        };

    }


}


module.exports =
    CaptureReferenceBuilder;
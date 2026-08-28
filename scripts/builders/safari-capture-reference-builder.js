/**
 * Pokémon Companion
 * Safari Capture Reference Builder
 *
 * Builds normalized Safari Zone capture reference data
 * from parsed FireRed Safari mechanics.
 *
 * Responsibilities:
 * - Normalize Safari catch-factor rules.
 * - Normalize Safari escape-factor rules.
 * - Normalize Bait rules.
 * - Normalize Rock rules.
 * - Normalize Safari flee rules.
 *
 * Does NOT:
 * - Read source files.
 * - Parse C source.
 * - Calculate capture probability.
 * - Execute Safari actions.
 * - Write databases.
 */

"use strict";


class SafariCaptureReferenceBuilder
{


    //----------------------------------------
    // Build Safari reference
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
                "Parsed Safari capture data is required."
            );

        }


        return {

            factors:
                this.buildFactors(
                    parsed.factors
                ),

            bait:
                this.buildAction(
                    parsed.bait
                ),

            rock:
                this.buildAction(
                    parsed.rock
                ),

            flee:
                this.buildFleeRules(
                    parsed.flee
                )

        };

    }


    //----------------------------------------
    // Build factors
    //----------------------------------------

    buildFactors(
        factors
    )
    {

        if(
            !factors
        )
        {

            return {

                catchFactor:
                    null,

                escapeFactor:
                    null

            };

        }


        return {

            catchFactor:
                this.buildFactor(
                    factors.catchFactor
                ),

            escapeFactor:
                this.buildFactor(
                    factors.escapeFactor
                )

        };

    }


    //----------------------------------------
    // Build one factor
    //----------------------------------------

    buildFactor(
        factor
    )
    {

        if(
            !factor
        )
        {

            return null;

        }


        const result =
        {

            formula:
                factor.formula

        };


        if(
            factor.minimum !==
                undefined
        )
        {

            result.minimum =
                factor.minimum;

        }


        if(
            factor.maximum !==
                undefined
        )
        {

            result.maximum =
                factor.maximum;

        }


        return result;

    }


    //----------------------------------------
    // Build Bait or Rock action
    //----------------------------------------

    buildAction(
        action
    )
    {

        if(
            !action
        )
        {

            return null;

        }


        const result =
        {

            action:
                action.action

        };


        //--------------------------------
        // Counter
        //--------------------------------

        if(
            action.counter
        )
        {

            result.counter =
            {

                randomFormula:
                    action.counter.randomFormula,

                minimum:
                    action.counter.minimum,

                maximum:
                    action.counter.maximum

            };

        }


        if(
            action.counterMaximum !==
                undefined
        )
        {

            result.counterMaximum =
                action.counterMaximum;

        }


        //--------------------------------
        // Counters cleared
        //--------------------------------

        if(
            Array.isArray(
                action.clears
            )
        )
        {

            result.clears =
                [
                    ...action.clears
                ];

        }


        //--------------------------------
        // Catch factor modification
        //--------------------------------

        if(
            action.catchFactor
        )
        {

            result.catchFactor =
            {

                operation:
                    action.catchFactor.operation

            };


            if(
                action.catchFactor.minimum !==
                    undefined
            )
            {

                result.catchFactor.minimum =
                    action.catchFactor.minimum;

            }


            if(
                action.catchFactor.maximum !==
                    undefined
            )
            {

                result.catchFactor.maximum =
                    action.catchFactor.maximum;

            }

        }


        return result;

    }


    //----------------------------------------
    // Build flee rules
    //----------------------------------------

    buildFleeRules(
        flee
    )
    {

        if(
            !flee
        )
        {

            return null;

        }


        const result =
        {

            rules:
                [],

            finalMultiplier:
                flee.finalMultiplier,

            randomRange:
                flee.randomRange

        };


        if(
            Array.isArray(
                flee.rules
            )
        )
        {

            result.rules =
                flee.rules.map(

                    rule =>
                    {

                        const normalized =
                        {

                            condition:
                                rule.condition,

                            operation:
                                rule.operation

                        };


                        if(
                            rule.value !==
                                undefined
                        )
                        {

                            normalized.value =
                                rule.value;

                        }


                        if(
                            rule.minimum !==
                                undefined
                        )
                        {

                            normalized.minimum =
                                rule.minimum;

                        }


                        if(
                            rule.maximum !==
                                undefined
                        )
                        {

                            normalized.maximum =
                                rule.maximum;

                        }


                        return normalized;

                    }

                );

        }


        return result;

    }


}


module.exports =
    SafariCaptureReferenceBuilder;
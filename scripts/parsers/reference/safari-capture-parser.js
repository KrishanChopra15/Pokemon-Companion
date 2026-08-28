/**
 * Pokémon Companion
 * Safari Capture Parser
 *
 * Parses FireRed Safari Zone capture mechanics.
 *
 * Responsibilities:
 * - Parse Safari catch-factor initialization.
 * - Parse Safari escape-factor initialization.
 * - Parse Bait behavior.
 * - Parse Rock behavior.
 * - Parse Bait/Rock counters.
 * - Parse Safari flee-rate modifiers.
 *
 * Does NOT:
 * - Calculate capture probability.
 * - Execute Safari actions.
 * - Read Pokémon databases.
 * - Write databases.
 */

"use strict";


class SafariCaptureParser
{


    //----------------------------------------
    // Parse Safari rules
    //----------------------------------------

    parse(
        sources
    )
    {

        if(
            !sources
        )
        {

            throw new TypeError(
                "Safari capture source is required."
            );

        }


        /*
         * The Safari mechanics are split across
         * multiple FireRed source files.
         *
         * Accept either:
         *
         * parse("source")
         *
         * or:
         *
         * parse({
         *     battleMain,
         *     battleAi
         * })
         */

        const battleMain =
            typeof sources === "string"
            ?
            sources
            :
            sources.battleMain || "";


        const battleAi =
            typeof sources === "string"
            ?
            sources
            :
            sources.battleAi || "";


        return {

            factors:
                this.parseFactors(
                    battleMain
                ),

            bait:
                this.parseBait(
                    battleMain
                ),

            rock:
                this.parseRock(
                    battleMain
                ),

            flee:
                this.parseFleeRules(
                    battleAi
                )

        };

    }


    //----------------------------------------
    // Parse initial factors
    //----------------------------------------

    parseFactors(
        source
    )
    {

        return {

            catchFactor:
            {

                formula:
                    "speciesCatchRate * 100 / 1275"

            },

            escapeFactor:
            {

                formula:
                    "speciesSafariZoneFleeRate * 100 / 1275",

                minimum:
                    2

            }

        };

    }


    //----------------------------------------
    // Parse Bait
    //----------------------------------------

    parseBait(
        source
    )
    {

        const detected =
            source.includes(
                "safariBaitThrowCounter += Random() % 5 + 2"
            )
            &&
            source.includes(
                "safariCatchFactor >>= 1"
            );


        if(
            !detected
        )
        {

            return null;

        }


        return {

            action:
                "BAIT",

            counter:
            {

                randomFormula:
                    "Random() % 5 + 2",

                minimum:
                    2,

                maximum:
                    6

            },

            counterMaximum:
                6,

            clears:
            [
                "ROCK_COUNTER"
            ],

            catchFactor:
            {

                operation:
                    "HALF",

                minimum:
                    3

            }

        };

    }


    //----------------------------------------
    // Parse Rock
    //----------------------------------------

    parseRock(
        source
    )
    {

        const detected =
            source.includes(
                "safariRockThrowCounter += Random() % 5 + 2"
            )
            &&
            source.includes(
                "safariCatchFactor <<= 1"
            );


        if(
            !detected
        )
        {

            return null;

        }


        return {

            action:
                "ROCK",

            counter:
            {

                randomFormula:
                    "Random() % 5 + 2",

                minimum:
                    2,

                maximum:
                    6

            },

            counterMaximum:
                6,

            clears:
            [
                "BAIT_COUNTER"
            ],

            catchFactor:
            {

                operation:
                    "DOUBLE",

                maximum:
                    20

            }

        };

    }


    //----------------------------------------
    // Parse flee rules
    //----------------------------------------

    parseFleeRules(
        source
    )
    {

        const rules =
            [];


        //----------------------------------------
        // Rock active
        //----------------------------------------

        const rockMatch =
            /safariFleeRate\s*=\s*gBattleStruct->safariEscapeFactor\s*\*\s*2[\s\S]*?if\s*\(\s*safariFleeRate\s*>\s*20\s*\)[\s\S]*?safariFleeRate\s*=\s*20/.test(
                source
            );


        if(
            rockMatch
        )
        {

            rules.push({

                condition:
                    "ROCK_ACTIVE",

                operation:
                    "MULTIPLY",

                value:
                    2,

                maximum:
                    20

            });

        }


        //----------------------------------------
        // Bait active
        //----------------------------------------

        const baitMatch =
            /safariFleeRate\s*=\s*gBattleStruct->safariEscapeFactor\s*\/\s*4[\s\S]*?if\s*\(\s*safariFleeRate\s*==\s*0\s*\)[\s\S]*?safariFleeRate\s*=\s*1/.test(
                source
            );


        if(
            baitMatch
        )
        {

            rules.push({

                condition:
                    "BAIT_ACTIVE",

                operation:
                    "DIVIDE",

                value:
                    4,

                minimum:
                    1

            });

        }


        //----------------------------------------
        // No Bait or Rock
        //----------------------------------------

        rules.push({

            condition:
                "NO_BAIT_OR_ROCK",

            operation:
                "NONE"

        });


        return {

            rules,

            finalMultiplier:
                5,

            randomRange:
                100

        };

    }


}


module.exports =
    SafariCaptureParser;
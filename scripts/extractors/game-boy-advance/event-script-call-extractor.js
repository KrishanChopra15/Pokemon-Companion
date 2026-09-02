/**
 * Pokémon Companion
 * Event Script Call Extractor
 *
 * Extracts script-to-script call relationships.
 *
 * Responsibilities:
 * - Extract plain calls.
 * - Extract conditional calls.
 * - Preserve call metadata.
 * - Remove duplicate call records.
 *
 * Does NOT:
 * - Execute scripts.
 * - Resolve called scripts.
 * - Extract jumps.
 * - Extract direct effects.
 */

"use strict";


class EventScriptCallExtractor
{


    //--------------------------------
    // Extract script calls
    //--------------------------------

    extract(
        body
    )
    {

        const calls =
            [];


        //--------------------------------
        // Plain call
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*call\s+([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addCall(

                calls,

                {

                    type:
                        "CALL",

                    target:
                        match[1]

                }

            );

        }


        //--------------------------------
        // call_if_set
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*call_if_set\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addCall(

                calls,

                {

                    type:
                        "CALL_IF_SET",

                    flag:
                        match[1],

                    target:
                        match[2]

                }

            );

        }


        //--------------------------------
        // call_if_unset
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*call_if_unset\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addCall(

                calls,

                {

                    type:
                        "CALL_IF_UNSET",

                    flag:
                        match[1],

                    target:
                        match[2]

                }

            );

        }


        //--------------------------------
        // call_if_eq
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*call_if_eq\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addCall(

                calls,

                {

                    type:
                        "CALL_IF_EQ",

                    variable:
                        match[1],

                    value:
                        match[2],

                    target:
                        match[3]

                }

            );

        }


        //--------------------------------
        // call_if_ne
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*call_if_ne\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addCall(

                calls,

                {

                    type:
                        "CALL_IF_NE",

                    variable:
                        match[1],

                    value:
                        match[2],

                    target:
                        match[3]

                }

            );

        }


        //--------------------------------
        // call_if_gt
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*call_if_gt\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addCall(

                calls,

                {

                    type:
                        "CALL_IF_GT",

                    variable:
                        match[1],

                    value:
                        match[2],

                    target:
                        match[3]

                }

            );

        }


        //--------------------------------
        // call_if_ge
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*call_if_ge\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addCall(

                calls,

                {

                    type:
                        "CALL_IF_GE",

                    variable:
                        match[1],

                    value:
                        match[2],

                    target:
                        match[3]

                }

            );

        }


        //--------------------------------
        // call_if_lt
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*call_if_lt\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addCall(

                calls,

                {

                    type:
                        "CALL_IF_LT",

                    variable:
                        match[1],

                    value:
                        match[2],

                    target:
                        match[3]

                }

            );

        }


        //--------------------------------
        // call_if_le
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*call_if_le\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addCall(

                calls,

                {

                    type:
                        "CALL_IF_LE",

                    variable:
                        match[1],

                    value:
                        match[2],

                    target:
                        match[3]

                }

            );

        }


        return calls;

    }


    //--------------------------------
    // Add unique call
    //--------------------------------

    addCall(
        calls,
        call
    )
    {

        const exists =
            calls.some(

                existing =>

                    JSON.stringify(
                        existing
                    )
                    ===
                    JSON.stringify(
                        call
                    )

            );


        if(
            !exists
        )
        {

            calls.push(
                call
            );

        }

    }


}


module.exports =
    EventScriptCallExtractor;
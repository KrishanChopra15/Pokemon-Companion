/**
 * Pokémon Companion
 * Event Script Jump Extractor
 *
 * Extracts script jump relationships.
 *
 * Responsibilities:
 * - Extract plain gotos.
 * - Extract conditional gotos.
 * - Preserve jump metadata.
 * - Remove duplicate jump records.
 *
 * Does NOT:
 * - Execute scripts.
 * - Resolve jumped scripts.
 * - Extract calls.
 * - Extract direct effects.
 */

"use strict";


class EventScriptJumpExtractor
{


    //--------------------------------
    // Extract script jumps
    //--------------------------------

    extract(
        body
    )
    {

        const jumps =
            [];


        //--------------------------------
        // Plain goto
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*goto\s+([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addJump(

                jumps,

                {

                    type:
                        "GOTO",

                    target:
                        match[1]

                }

            );

        }


        //--------------------------------
        // goto_if_set
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*goto_if_set\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addJump(

                jumps,

                {

                    type:
                        "GOTO_IF_SET",

                    flag:
                        match[1],

                    target:
                        match[2]

                }

            );

        }


        //--------------------------------
        // goto_if_unset
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*goto_if_unset\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addJump(

                jumps,

                {

                    type:
                        "GOTO_IF_UNSET",

                    flag:
                        match[1],

                    target:
                        match[2]

                }

            );

        }


        //--------------------------------
        // goto_if_eq
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*goto_if_eq\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addJump(

                jumps,

                {

                    type:
                        "GOTO_IF_EQ",

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
        // goto_if_ne
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*goto_if_ne\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addJump(

                jumps,

                {

                    type:
                        "GOTO_IF_NE",

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
        // goto_if_gt
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*goto_if_gt\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addJump(

                jumps,

                {

                    type:
                        "GOTO_IF_GT",

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
        // goto_if_ge
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*goto_if_ge\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addJump(

                jumps,

                {

                    type:
                        "GOTO_IF_GE",

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
        // goto_if_lt
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*goto_if_lt\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addJump(

                jumps,

                {

                    type:
                        "GOTO_IF_LT",

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
        // goto_if_le
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^\s*goto_if_le\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addJump(

                jumps,

                {

                    type:
                        "GOTO_IF_LE",

                    variable:
                        match[1],

                    value:
                        match[2],

                    target:
                        match[3]

                }

            );

        }


        return jumps;

    }


    //--------------------------------
    // Add unique jump
    //--------------------------------

    addJump(
        jumps,
        jump
    )
    {

        const exists =
            jumps.some(

                existing =>

                    JSON.stringify(
                        existing
                    )
                    ===
                    JSON.stringify(
                        jump
                    )

            );


        if(
            !exists
        )
        {

            jumps.push(
                jump
            );

        }

    }


}


module.exports =
    EventScriptJumpExtractor;
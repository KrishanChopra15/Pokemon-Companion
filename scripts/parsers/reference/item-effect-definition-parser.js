/**
 * Pokémon Companion
 * Item Effect Definition Parser
 *
 * Parses FireRed item effect definitions from
 * src/data/pokemon/item_effects.h.
 *
 * Responsibilities:
 * - Find sItemEffect_* definitions.
 * - Parse their declared sizes.
 * - Parse indexed fields.
 * - Preserve macro usage.
 *
 * Does NOT:
 * - Interpret item effects.
 * - Resolve item constants.
 * - Build semantic effects.
 * - Write databases.
 */

"use strict";


class ItemEffectDefinitionParser
{


    //----------------------------------------
    // Parse definitions
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
                "Item effect source must be a string."
            );

        }


        const definitions =
            [];


        const regex =
            /static\s+const\s+u8\s+(sItemEffect_[A-Za-z0-9_]+)\s*\[(\d+)\]\s*=\s*\{([\s\S]*?)\n\};/g;


        let match;


        while(
            (
                match =
                    regex.exec(source)
            ) !== null
        )
        {

            definitions.push(

                {

                    name:
                        match[1],

                    size:
                        Number(
                            match[2]
                        ),

                    fields:
                        this.parseFields(
                            match[3]
                        )

                }

            );

        }


        return definitions;

    }


    //----------------------------------------
    // Parse fields
    //----------------------------------------

    parseFields(
        body
    )
    {

        const fields =
            {};


        const regex =
            /\[\s*(\d+)\s*\]\s*=\s*([^,\n]+)\s*,?/g;


        let match;


        while(
            (
                match =
                    regex.exec(body)
            ) !== null
        )
        {

            fields[
                Number(
                    match[1]
                )
            ] =
                match[2].trim();

        }


        //----------------------------------------
        // Preserve macro usage
        //----------------------------------------

        const macros =
            [];


        if(
            body.includes(
                "VITAMIN_FRIENDSHIP_CHANGE"
            )
        )
        {

            macros.push(
                "VITAMIN_FRIENDSHIP_CHANGE"
            );

        }


        if(
            body.includes(
                "STAT_BOOST_FRIENDSHIP_CHANGE"
            )
        )
        {

            macros.push(
                "STAT_BOOST_FRIENDSHIP_CHANGE"
            );

        }


        if(
            macros.length > 0
        )
        {

            fields.__macros =
                macros;

        }


        return fields;

    }

}


module.exports =
    ItemEffectDefinitionParser;
/**
 * Pokémon Companion
 * Item Effect Table Parser
 *
 * Parses the FireRed gItemEffectTable[] mapping.
 *
 * Responsibilities:
 * - Locate gItemEffectTable[].
 * - Extract item constants.
 * - Extract corresponding effect definitions.
 *
 * Does NOT:
 * - Parse effect definitions.
 * - Interpret effect flags.
 * - Resolve item data.
 * - Build semantic effects.
 * - Write databases.
 */

"use strict";


class ItemEffectTableParser
{


    //----------------------------------------
    // Parse item effect table
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
                "Item effect table source must be a string."
            );

        }


        const tableStart =
            source.indexOf(
                "const u8 *const gItemEffectTable[]"
            );


        if(
            tableStart === -1
        )
        {

            throw new Error(
                "gItemEffectTable[] not found."
            );

        }


        const tableSource =
            source.substring(
                tableStart
            );


        const tableEnd =
            tableSource.indexOf(
                "};"
            );


        const body =
            tableEnd === -1
            ?
            tableSource
            :
            tableSource.substring(
                0,
                tableEnd
            );


        const mappings =
            [];


        const regex =
            /\[\s*(ITEM_[A-Z0-9_]+)\s*-\s*ITEM_POTION\s*\]\s*=\s*(sItemEffect_[A-Za-z0-9_]+)\s*,/g;


        let match;


        while(
            (
                match =
                    regex.exec(
                        body
                    )
            ) !== null
        )
        {

            mappings.push(

                {

                    itemConstant:
                        match[1],

                    effectName:
                        match[2]

                }

            );

        }


        return mappings;

    }


}


module.exports =
    ItemEffectTableParser;
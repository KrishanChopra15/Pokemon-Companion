/**
 * Pokémon Companion
 * Item Effect Generator
 *
 * Generates the table-based Pokémon item effect
 * reference database.
 *
 * Responsibilities:
 * - Read FireRed item effect source files.
 * - Coordinate item effect parsers.
 * - Coordinate item effect builder.
 * - Write item-effects.json.
 *
 * Does NOT:
 * - Parse C syntax itself.
 * - Interpret effect flags.
 * - Execute item effects.
 * - Handle battles.
 * - Handle capture calculations.
 * - Handle field item mechanics.
 */

"use strict";


const ReferenceGenerator =
    require("./reference-generator");


const ItemEffectDefinitionParser =
    require("../../parsers/reference/item-effect-definition-parser");


const ItemEffectTableParser =
    require("../../parsers/reference/item-effect-table-parser");


const ItemEffectBuilder =
    require("../../builders/item-effect-builder");



class ItemEffectGenerator
    extends ReferenceGenerator
{


    //----------------------------------------
    // Generate item effect database
    //----------------------------------------

    generate()
    {

        //----------------------------------------
        // Read source files
        //----------------------------------------

        const effectSource =
            this.readSourceFile(

                "pokefirered",

                "src",

                "data",

                "pokemon",

                "item_effects.h"

            );


        const itemSource =
            this.readSourceFile(

                "pokefirered",

                "include",

                "constants",

                "items.h"

            );


        //----------------------------------------
        // Parse item IDs
        //----------------------------------------

        const itemIds =
            this.parseItemIds(
                itemSource
            );


        //----------------------------------------
        // Parse effect definitions
        //----------------------------------------

        const definitionParser =
            new ItemEffectDefinitionParser();


        const definitions =
            definitionParser.parse(
                effectSource
            );


        //----------------------------------------
        // Parse effect table
        //----------------------------------------

        const tableParser =
            new ItemEffectTableParser();


        const mappings =
            tableParser.parse(
                effectSource
            );


        //----------------------------------------
        // Build semantic effects
        //----------------------------------------

        const builder =
            new ItemEffectBuilder();


        const effects =
            builder.build(

                definitions,

                mappings,

                itemIds

            );


        //----------------------------------------
        // Write database
        //----------------------------------------

        this.writeDatabase(

            "item-effects",

            effects

        );


        console.log();


        console.log(
            "Generated item effect reference database."
        );


        console.log(
            `Items: ${effects.length}`
        );

    }


    //----------------------------------------
    // Parse item IDs
    //----------------------------------------

    parseItemIds(
        source
    )
    {

        const itemIds =
            new Map();


        const regex =
            /^\s*#define\s+(ITEM_[A-Z0-9_]+)\s+(\d+)/gm;


        let match;


        while(
            (
                match =
                    regex.exec(
                        source
                    )
            ) !== null
        )
        {

            itemIds.set(

                match[1],

                Number(
                    match[2]
                )

            );

        }


        return itemIds;

    }


}


module.exports =
    ItemEffectGenerator;
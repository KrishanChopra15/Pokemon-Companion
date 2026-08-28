/**
 * Pokémon Companion
 * Pickup Loot Pool Generator
 *
 * Generates the game-specific Pickup loot pool
 * and the Pokémon associated with that loot pool.
 *
 * Responsibilities:
 * - Read the selected game's Pickup table.
 * - Extract item constants and cumulative thresholds.
 * - Convert thresholds into probability ranges.
 * - Define the Pokémon that use this Pickup pool.
 * - Write the Pickup reference database.
 *
 * Does NOT:
 * - Read ROMs.
 * - Execute Pickup mechanics.
 * - Modify Pokémon species.
 * - Handle battle logic.
 */

"use strict";


const ReferenceGenerator =
    require("./reference-generator");



class PickupGenerator
    extends ReferenceGenerator
{


    //----------------------------------------
    // Constructor
    //----------------------------------------

    constructor(
        game = "firered"
    )
    {

        super();


        this.game =
            String(
                game
            ).toLowerCase();

    }


    //----------------------------------------
    // Generate Pickup reference database
    //----------------------------------------

    generate()
    {

        const source =
            this.readSourceFile(

                "pokefirered",

                "src",

                "battle_script_commands.c"

            );


        const entries =
            this.parsePickupTable(
                source
            );


        const lootPool =
            this.buildLootPool(
                entries
            );


        const pokemonUsers =
            this.getPokemonUsers();


        const pickup =
        {

            game:
                this.game,

            pokemonUsers,

            lootPool

        };


        this.writeGameDatabase(
            pickup
        );


        console.log();


        console.log(
            "Generated Pickup reference database."
        );


        console.log(
            `Game: ${this.game}`
        );


        console.log(
            `Pokémon users: ${pokemonUsers.length}`
        );


        console.log(
            `Loot entries: ${lootPool.length}`
        );

    }


    //----------------------------------------
    // Get Pokémon using Pickup pool
    //----------------------------------------

    getPokemonUsers()
    {

        /*
         * These Pokémon share the Generation III
         * Pickup loot pool represented by the
         * selected FireRed/LeafGreen context.
         *
         * They are stored as species constants,
         * rather than copying species records into
         * the Pickup reference database.
         */

        switch(
            this.game
        )
        {

            case "firered":

            case "leafgreen":

                return [

                    "SPECIES_ZIGZAGOON",

                    "SPECIES_LINOONE",

                    "SPECIES_PHANPY",

                    "SPECIES_MEOWTH",

                    "SPECIES_TEDDIURSA",

                    "SPECIES_AIPOM"

                ];


            default:

                throw new Error(

                    `Unsupported Pickup game: ${this.game}`

                );

        }

    }


    //----------------------------------------
    // Parse Pickup table
    //----------------------------------------

    parsePickupTable(
        source
    )
    {

        const tableRegex =

            /static\s+const\s+struct\s+PickupItem\s+sPickupItems\[\]\s*=\s*\{([\s\S]*?)\n\};/;


        const match =
            source.match(
                tableRegex
            );


        if(
            !match
        )
        {

            throw new Error(

                "Pickup table not found in battle_script_commands.c"

            );

        }


        const body =
            match[1];


        const entryRegex =

            /\{\s*(ITEM_[A-Z0-9_]+)\s*,\s*(\d+)\s*\}/g;


        const entries =
            [];


        let entry;


        while(
            (
                entry =
                    entryRegex.exec(
                        body
                    )
            ) !== null
        )
        {

            entries.push(

                {

                    itemConstant:
                        entry[1],

                    threshold:
                        Number(
                            entry[2]
                        )

                }

            );

        }


        if(
            entries.length === 0
        )
        {

            throw new Error(

                "No Pickup entries found."

            );

        }


        return entries;

    }


    //----------------------------------------
    // Build effective loot pool
    //----------------------------------------

    buildLootPool(
        entries
    )
    {

        /*
         * FireRed's Cmd_pickup() uses:
         *
         *     for (j = 0; j < 15; ++j)
         *
         * Therefore only the first 15 entries
         * in sPickupItems are effective.
         */

        const effectiveEntries =
            entries.slice(
                0,
                15
            );


        const lootPool =
            [];


        let previousThreshold =
            0;


        for(
            const entry of effectiveEntries
        )
        {

            const threshold =
                entry.threshold;


            const minRoll =
                previousThreshold;


            const maxRoll =
                threshold - 1;


            const probability =
                Math.max(

                    0,

                    threshold -
                    previousThreshold

                );


            lootPool.push(

                {

                    itemConstant:
                        entry.itemConstant,

                    threshold,

                    minRoll,

                    maxRoll,

                    probability

                }

            );


            previousThreshold =
                threshold;

        }


        return lootPool;

    }


    //----------------------------------------
    // Write game-specific database
    //----------------------------------------

    writeGameDatabase(
        data
    )
    {

        const directory =
            require("path").join(

                process.cwd(),

                "database",

                "reference",

                this.game

            );


        const fs =
            require("fs");


        fs.mkdirSync(

            directory,

            {

                recursive:
                    true

            }

        );


        const file =
            require("path").join(

                directory,

                "pickup.json"

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
    PickupGenerator;
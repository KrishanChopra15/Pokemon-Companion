/**
 * Pokémon Companion
 * Generation III Item Behavior Reference Generator
 *
 * Generates the shared Generation III item behavior
 * reference database.
 *
 * Responsibilities:
 * - Read items.json.
 * - Read item-effects.json.
 * - Apply Generation III item behavior rules.
 * - Build normalized behavior records.
 * - Write gen3-item-behaviors.json.
 *
 * Does NOT:
 * - Read game-specific item metadata.
 * - Define game-specific item availability.
 * - Execute item behavior.
 * - Modify Pokémon.
 * - Manage inventory.
 * - Handle battles.
 */

"use strict";


const fs =
    require("fs");

const path =
    require("path");


const Gen3ItemBehaviorReferenceBuilder =
    require("../../builders/gen3-item-behavior-reference-builder");


const Gen3ItemBehaviors =
    require("../../rules/gen3-item-behaviors");


class Gen3ItemBehaviorGenerator
{


    //----------------------------------------
    // Generate Generation III item behaviors
    //----------------------------------------

    generate()
    {

        //----------------------------------------
        // Reference database paths
        //----------------------------------------

        const referenceDirectory =
            path.join(

                process.cwd(),

                "database",

                "reference"

            );


        const itemsPath =
            path.join(

                referenceDirectory,

                "items.json"

            );


        const itemEffectsPath =
            path.join(

                referenceDirectory,

                "item-effects.json"

            );


        //----------------------------------------
        // Validate reference databases
        //----------------------------------------

        if(
            !fs.existsSync(
                itemsPath
            )
        )
        {

            throw new Error(

                `Items reference database not found: ${itemsPath}`

            );

        }


        if(
            !fs.existsSync(
                itemEffectsPath
            )
        )
        {

            throw new Error(

                `Item effects reference database not found: ${itemEffectsPath}`

            );

        }


        //----------------------------------------
        // Read reference databases
        //----------------------------------------

        const items =
            JSON.parse(

                fs.readFileSync(

                    itemsPath,

                    "utf8"

                )

            );


        const itemEffects =
            JSON.parse(

                fs.readFileSync(

                    itemEffectsPath,

                    "utf8"

                )

            );


        //----------------------------------------
        // Keep only items with explicit
        // Generation III behavior rules.
        //----------------------------------------

        const behaviorItems =
            items.filter(

                item =>
                    Object.prototype.hasOwnProperty.call(

                        Gen3ItemBehaviors,

                        item.constant

                    )

            );


        //----------------------------------------
        // Build normalized reference
        //----------------------------------------

        const builder =
            new Gen3ItemBehaviorReferenceBuilder();


        const behaviors =
            builder.build(

                behaviorItems,

                itemEffects

            );


        //----------------------------------------
        // Write database
        //----------------------------------------

        this.writeDatabase(

            behaviors

        );


        console.log();

        console.log(
            "Generated Generation III item behavior reference database."
        );

        console.log(
            "Generation: gen3"
        );

        console.log(
            `Items: ${behaviors.length}`
        );

    }


    //----------------------------------------
    // Write database
    //----------------------------------------

    writeDatabase(
        data
    )
    {

        const directory =
            path.join(

                process.cwd(),

                "database",

                "reference"

            );


        fs.mkdirSync(

            directory,

            {
                recursive:
                    true

            }

        );


        const file =
            path.join(

                directory,

                "gen3-item-behaviors.json"

            );


        fs.writeFileSync(

            file,

            JSON.stringify(

                data,

                null,

                4

            )

        );


        console.log();

        console.log(
            `Generated ${file}`
        );

    }


}


module.exports =
    Gen3ItemBehaviorGenerator;
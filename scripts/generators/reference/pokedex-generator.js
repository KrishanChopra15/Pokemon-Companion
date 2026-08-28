/**
 * Pokémon Companion
 * Pokémon Pokédex Reference Generator
 *
 * Generates the Pokédex reference database for the
 * selected Pokémon game.
 *
 * Responsibilities:
 * - Read Pokédex entry metadata.
 * - Read game-specific Pokédex text.
 * - Extract category, height, and weight.
 * - Resolve Pokédex description pointers.
 * - Write the normalized Pokédex reference database.
 *
 * Does NOT:
 * - Read ROMs.
 * - Parse binary data.
 * - Generate Pokémon species.
 * - Build the final generated species database.
 */

"use strict";


const ReferenceGenerator =
    require("./reference-generator");


class PokedexGenerator
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
    // Generate
    //----------------------------------------

    generate()
    {

        const entriesSource =
            this.readSourceFile(

                "pokefirered",

                "src",

                "data",

                "pokemon",

                "pokedex_entries.h"

            );


        const textSource =
            this.readSourceFile(

                "pokefirered",

                "src",

                "data",

                "pokemon",

                this.getTextFile()

            );


        const texts =
            this.parseTexts(
                textSource
            );


        const entries =
            this.parseEntries(
                entriesSource
            );


        const pokedex =
            entries.map(

                entry =>
                {

                    return {

                        id:
                            entry.id,

                        constant:
                            entry.constant,

                        nationalDexNumber:
                            entry.nationalDexNumber,

                        game:
                            this.game,

                        generation:
                            entry.generation,

                        category:
                            entry.category,

                        height:
                            entry.height,

                        weight:
                            entry.weight,

                        description:
                            texts.get(
                                entry.descriptionKey
                            )
                            ||
                            ""

                    };

                }

            );


        this.writeDatabase(

            "pokedex",

            pokedex

        );


        console.log();


        console.log(
            "Generated Pokédex reference database."
        );


        console.log(
            `Game: ${this.game}`
        );


        console.log(
            `Entries: ${pokedex.length}`
        );


    }


    //----------------------------------------
    // Game-specific text file
    //----------------------------------------

    getTextFile()
    {

        switch(
            this.game
        )
        {

            case "firered":

                return "pokedex_text_fr.h";


            case "leafgreen":

                return "pokedex_text_lg.h";


            default:

                throw new Error(

                    `Unsupported Pokédex game: ${this.game}`

                );

        }

    }


    //----------------------------------------
    // Parse Pokédex entries
    //----------------------------------------

    parseEntries(
        source
    )
    {

        const entries =
            [];


        this.currentDexNumber =
            1;


        /*
         * Example source:
         *
         * [NATIONAL_DEX_CHARMANDER] =
         * {
         *     .categoryName = _("LIZARD"),
         *     .height = 6,
         *     .weight = 85,
         *     .description = gCharmanderPokedexText,
         *     ...
         * },
         */


        const entryRegex =

            /\[\s*NATIONAL_DEX_([A-Z0-9_]+)\s*\]\s*=\s*\{([\s\S]*?)\n\s*\},/g;


        let match;


        while(
            (
                match =
                    entryRegex.exec(
                        source
                    )
            ) !== null
        )
        {

            const dexName =
                match[1];


            const body =
                match[2];


            //--------------------------------
            // Ignore dummy entry
            //--------------------------------

            if(
                dexName ===
                "NONE"
            )
            {

                continue;

            }


            //--------------------------------
            // Extract metadata
            //--------------------------------

            const category =
                this.extractStringField(

                    body,

                    "categoryName"

                );


            const height =
                this.extractNumericField(

                    body,

                    "height"

                );


            const weight =
                this.extractNumericField(

                    body,

                    "weight"

                );


            const descriptionKey =
                this.extractIdentifierField(

                    body,

                    "description"

                );


            //--------------------------------
            // Assign National Dex number
            //--------------------------------

            const nationalDexNumber =

                String(
                    this.currentDexNumber++
                )
                .padStart(
                    4,
                    "0"
                );


            //--------------------------------
            // Create record
            //--------------------------------

            entries.push(

                {

                    id:
                        nationalDexNumber,

                    constant:
                        `SPECIES_${dexName}`,

                    nationalDexNumber,

                    generation:
                        3,

                    category,

                    height,

                    weight,

                    descriptionKey

                }

            );

        }


        return entries;

    }


    //----------------------------------------
    // Extract string field
    //----------------------------------------

    extractStringField(
        body,
        field
    )
    {

        const regex =

            new RegExp(

                `\\.${field}\\s*=\\s*_\\(\\s*"([^"]*)"\\s*\\)`,

                "m"

            );


        const match =
            regex.exec(
                body
            );


        return match
            ?
            this.cleanText(
                match[1]
            )
            :
            null;

    }


    //----------------------------------------
    // Extract numeric field
    //----------------------------------------

    extractNumericField(
        body,
        field
    )
    {

        const regex =

            new RegExp(

                `\\.${field}\\s*=\\s*(-?\\d+)`,

                "m"

            );


        const match =
            regex.exec(
                body
            );


        return match
            ?
            Number(
                match[1]
            )
            :
            null;

    }


    //----------------------------------------
    // Extract identifier field
    //----------------------------------------

    extractIdentifierField(
        body,
        field
    )
    {

        const regex =

            new RegExp(

                `\\.${field}\\s*=\\s*([A-Za-z0-9_]+)`,

                "m"

            );


        const match =
            regex.exec(
                body
            );


        return match
            ?
            match[1]
            :
            null;

    }


    //----------------------------------------
    // Parse Pokédex text
    //----------------------------------------

    parseTexts(
        source
    )
    {

        const texts =
            new Map();


        /*
         * Example source:
         *
         * const u8 gCharmanderPokedexText[] = _(
         *     "From the time it is born, a flame burns\n"
         *     "at the tip of its tail. Its life would end\n"
         *     "if the flame were to go out.");
         *
         */


        const regex =

            /const\s+u8\s+(g[A-Za-z0-9_]+PokedexText)\[\]\s*=\s*_\(\s*([\s\S]*?)\s*\);/g;


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

            const textKey =
                match[1];


            const block =
                match[2];


            const text =
                this.parseTextBlock(
                    block
                );


            texts.set(

                textKey,

                text

            );

        }


        return texts;

    }


    //----------------------------------------
    // Parse text block
    //----------------------------------------

    parseTextBlock(
        block
    )
    {

        const strings =
            [];


        const regex =
            /"((?:\\.|[^"\\])*)"/g;


        let match;


        while(
            (
                match =
                    regex.exec(
                        block
                    )
            ) !== null
        )
        {

            strings.push(
                match[1]
            );

        }


        return this.cleanText(

            strings.join("")

        );

    }


    //----------------------------------------
    // Clean source text
    //----------------------------------------

    cleanText(
        text
    )
    {

        if(
            typeof text !==
            "string"
        )
        {

            return text;

        }


        return text

            /*
             * Source line breaks.
             */

            .replace(
                /\\n/g,
                " "
            )

            /*
             * Pokémon text-page control code.
             */

            .replace(
                /\\p/g,
                " "
            )

            /*
             * Normalize whitespace.
             */

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    }


}


module.exports =
    PokedexGenerator;
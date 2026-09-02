/**
 * Pokémon Companion
 * Species Info Parser
 *
 * Parses species_info.h from pokefirered.
 */

"use strict";


class SpeciesInfoParser
{


    //--------------------------------
    // Parse species_info.h
    //--------------------------------

    parse(
        source
    )
    {

        const species =
            [];


        if(
            typeof source !==
            "string"
        )
        {

            throw new TypeError(
                "Species source must be a string."
            );

        }


        //--------------------------------
        // Match species declarations
        //--------------------------------
        //
        // We first locate:
        //
        // [SPECIES_X] =
        //
        // and then manually locate the
        // balanced {...} block.
        //
        // This avoids breaking on nested
        // brace expressions such as:
        //
        // .types = { TYPE_GRASS, TYPE_POISON }
        //--------------------------------

        const declarationRegex =
            /\[SPECIES_([A-Z0-9_]+)\]\s*=\s*/g;


        let match;


        while(
            (
                match =
                    declarationRegex.exec(
                        source
                    )
            )
        )
        {

            const constant =
                `SPECIES_${match[1]}`;


            const declarationEnd =
                declarationRegex.lastIndex;


            //--------------------------------
            // Locate opening brace
            //--------------------------------

            const openingBrace =
                source.indexOf(
                    "{",
                    declarationEnd
                );


            //--------------------------------
            // Non-braced alias/value
            //--------------------------------
            //
            // This can occur for special
            // definitions that reference
            // an existing macro/value.
            //--------------------------------

            if(
                openingBrace ===
                -1
                ||
                this.isBeforeNextSpecies(

                    source,

                    openingBrace,

                    declarationRegex

                )
            )
            {

                continue;

            }


            //--------------------------------
            // Extract balanced block
            //--------------------------------

            const blockEnd =
                this.findMatchingBrace(

                    source,

                    openingBrace

                );


            if(
                blockEnd ===
                -1
            )
            {

                continue;

            }


            const block =
                source.slice(

                    openingBrace + 1,

                    blockEnd

                );


            //--------------------------------
            // Create record
            //--------------------------------

            const data =
            {

                id:
                    this.getSpeciesId(
                        constant,
                        species
                    ),

                constant,

                name:
                    null,

                generation:
                    1,

                baseHP:
                    this.value(
                        block,
                        "baseHP"
                    ),

                baseAttack:
                    this.value(
                        block,
                        "baseAttack"
                    ),

                baseDefense:
                    this.value(
                        block,
                        "baseDefense"
                    ),

                baseSpeed:
                    this.value(
                        block,
                        "baseSpeed"
                    ),

                baseSpAttack:
                    this.value(
                        block,
                        "baseSpAttack"
                    ),

                baseSpDefense:
                    this.value(
                        block,
                        "baseSpDefense"
                    ),

                type1:
                    this.type(
                        block,
                        0
                    ),

                type2:
                    this.type(
                        block,
                        1
                    ),

                catchRate:
                    this.value(
                        block,
                        "catchRate"
                    ),

                expYield:
                    this.value(
                        block,
                        "expYield"
                    ),

                evYieldHP:
                    this.value(
                        block,
                        "evYield_HP"
                    ),

                evYieldAttack:
                    this.value(
                        block,
                        "evYield_Attack"
                    ),

                evYieldDefense:
                    this.value(
                        block,
                        "evYield_Defense"
                    ),

                evYieldSpeed:
                    this.value(
                        block,
                        "evYield_Speed"
                    ),

                evYieldSpAttack:
                    this.value(
                        block,
                        "evYield_SpAttack"
                    ),

                evYieldSpDefense:
                    this.value(
                        block,
                        "evYield_SpDefense"
                    ),

                itemCommon:
                    this.constant(
                        block,
                        "itemCommon"
                    ),

                itemRare:
                    this.constant(
                        block,
                        "itemRare"
                    ),

                genderRatio:
                    this.raw(
                        block,
                        "genderRatio"
                    ),

                eggCycles:
                    this.value(
                        block,
                        "eggCycles"
                    ),

                friendship:
                    this.value(
                        block,
                        "friendship"
                    ),

                growthRate:
                    this.constant(
                        block,
                        "growthRate"
                    ),

                eggGroup1:
                    this.constant(
                        block,
                        "eggGroups",
                        0
                    ),

                eggGroup2:
                    this.constant(
                        block,
                        "eggGroups",
                        1
                    ),

                ability1:
                    this.constant(
                        block,
                        "abilities",
                        0
                    ),

                ability2:
                    this.constant(
                        block,
                        "abilities",
                        1
                    ),

                safariZoneFleeRate:
                    this.value(
                        block,
                        "safariZoneFleeRate"
                    ),

                bodyColor:
                    this.constant(
                        block,
                        "bodyColor"
                    ),

                noFlip:
                    this.raw(
                        block,
                        "noFlip"
                    )

            };


            species.push(
                data
            );


            //--------------------------------
            // Move parser position past
            // this complete record
            //--------------------------------

            declarationRegex.lastIndex =
                blockEnd + 1;

        }


        //--------------------------------
        // Normalize IDs using source order
        //--------------------------------

        species.forEach(

            (
                pokemon,
                index
            ) =>
            {

                pokemon.id =
                    index;

            }

        );


        return species;

    }


    //--------------------------------
    // Find matching closing brace
    //--------------------------------

    findMatchingBrace(
        source,
        openingBrace
    )
    {

        let depth =
            0;


        let inString =
            false;


        let quote =
            null;


        let inChar =
            false;


        let escaped =
            false;


        for(
            let index =
                openingBrace;

            index <
            source.length;

            index++
        )
        {

            const character =
                source[index];


            //--------------------------------
            // Handle escaped characters
            //--------------------------------

            if(
                escaped
            )
            {

                escaped =
                    false;

                continue;

            }


            if(
                (
                    inString
                    ||
                    inChar
                )
                &&
                character ===
                "\\"
            )
            {

                escaped =
                    true;

                continue;

            }


            //--------------------------------
            // Strings
            //--------------------------------

            if(
                character ===
                '"'
                &&
                !inChar
            )
            {

                inString =
                    !inString;

                continue;

            }


            //--------------------------------
            // Character literals
            //--------------------------------

            if(
                character ===
                "'"
                &&
                !inString
            )
            {

                inChar =
                    !inChar;

                continue;

            }


            if(
                inString
                ||
                inChar
            )
            {

                continue;

            }


            //--------------------------------
            // Opening brace
            //--------------------------------

            if(
                character ===
                "{"
            )
            {

                depth++;

                continue;

            }


            //--------------------------------
            // Closing brace
            //--------------------------------

            if(
                character ===
                "}"
            )
            {

                depth--;

                if(
                    depth ===
                    0
                )
                {

                    return index;

                }

            }

        }


        return -1;

    }


    //--------------------------------
    // Check whether another species
    // declaration appears before the
    // expected opening brace.
    //--------------------------------

    isBeforeNextSpecies(
        source,
        openingBrace,
        declarationRegex
    )
    {

        const position =
            declarationRegex.lastIndex;


        const nextDeclaration =
            source.indexOf(
                "[SPECIES_",
                position
            );


        return (

            nextDeclaration !==
            -1
            &&
            nextDeclaration <
            openingBrace

        );

    }


    //--------------------------------
    // Species ID
    //--------------------------------

    getSpeciesId(
        constant,
        species
    )
    {

        //--------------------------------
        // FireRed source ordering is used
        // as the fallback ID source.
        //--------------------------------

        return species.length;

    }


    //--------------------------------
    // Numeric field
    //--------------------------------

    value(
        block,
        field
    )
    {

        const regex =
            new RegExp(

                `\\.${field}\\s*=\\s*([0-9]+)`

            );


        const match =
            block.match(
                regex
            );


        return match
            ?
            Number(
                match[1]
            )
            :
            0;

    }


    //--------------------------------
    // Raw field
    //--------------------------------

    raw(
        block,
        field
    )
    {

        const regex =
            new RegExp(

                `\\.${field}\\s*=\\s*([^,\\n}]+)`

            );


        const match =
            block.match(
                regex
            );


        return match
            ?
            match[1].trim()
            :
            null;

    }


    //--------------------------------
    // Constant field
    //--------------------------------

    constant(
        block,
        field,
        index = null
    )
    {

        const regex =
            new RegExp(

                `\\.${field}\\s*=\\s*\\{([^}]+)\\}`

            );


        const match =
            block.match(
                regex
            );


        if(
            !match
        )
        {

            return this.raw(
                block,
                field
            );

        }


        const values =
            match[1]
                .split(",")
                .map(

                    value =>
                        value.trim()

                );


        return values[
            index ?? 0
        ];

    }


    //--------------------------------
    // Pokémon types
    //--------------------------------

    type(
        block,
        index
    )
    {

        const regex =
            /\.types\s*=\s*\{([^}]+)\}/;


        const match =
            block.match(
                regex
            );


        if(
            !match
        )
        {

            return null;

        }


        const values =
            match[1]
                .split(",")
                .map(

                    value =>
                        value.trim()

                );


        return values[index]
            ||
            null;

    }


}


module.exports =
    SpeciesInfoParser;
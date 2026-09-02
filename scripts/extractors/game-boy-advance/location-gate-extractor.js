/**
 * Pokémon Companion
 * Location Gate Extractor
 *
 * Extracts location access gates.
 *
 * Responsibilities:
 * - Read map.json files.
 * - Extract explicit movement/access requirements.
 * - Preserve hard and soft gate semantics.
 *
 * Does NOT:
 * - Generate databases.
 * - Handle player progression.
 * - Infer story progression.
 * - Infer gym requirements from map names.
 * - Invent requirements not present in source data.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class LocationGateExtractor
{


    extract(
        sourcePath
    )
    {

        const mapsPath =
            path.join(

                sourcePath,

                "data",

                "maps"

            );


        const gates = {};


        if(
            !fs.existsSync(
                mapsPath
            )
        )
        {

            throw new Error(

                `Maps directory not found: ${mapsPath}`

            );

        }


        const maps =
            fs.readdirSync(

                mapsPath,

                {
                    withFileTypes:
                        true

                }

            );


        for(
            const mapEntry of
                maps
        )
        {

            //--------------------------------
            // Only process map directories.
            //--------------------------------

            if(
                !mapEntry.isDirectory()
            )
            {

                continue;

            }


            const map =
                mapEntry.name;


            const mapDirectory =
                path.join(

                    mapsPath,

                    map

                );


            const mapFile =
                path.join(

                    mapDirectory,

                    "map.json"

                );


            if(
                !fs.existsSync(
                    mapFile
                )
            )
            {

                continue;

            }


            const data =
                JSON.parse(

                    fs.readFileSync(

                        mapFile,

                        "utf8"

                    )

                );


            if(
                !data.id
            )
            {

                continue;

            }


            const entry =
            {

                id:
                    data.id,

                soft:
                    [],

                hard:
                    []

            };


            //--------------------------------
            // Flash
            //
            // Flash is a navigation aid in
            // FireRed. It is therefore kept
            // as a soft gate rather than a
            // hard access restriction.
            //--------------------------------

            if(
                data.requires_flash ===
                    true
            )
            {

                this.addGate(

                    entry.soft,

                    {
                        type:
                            "FLASH",

                        reason:
                            "navigation"
                    }

                );

            }


            //--------------------------------
            // Preserve explicit hard gates
            //
            // Only use source fields when
            // they explicitly provide access
            // requirements.
            //--------------------------------

            this.extractExplicitHardGates(

                data,

                entry.hard

            );


            //--------------------------------
            // Preserve explicit soft gates
            //
            // This allows future game-specific
            // source fields to be supported
            // without changing the output
            // structure.
            //--------------------------------

            this.extractExplicitSoftGates(

                data,

                entry.soft

            );


            //--------------------------------
            // Save only locations that have
            // actual gates.
            //--------------------------------

            if(
                entry.soft.length > 0
                ||
                entry.hard.length > 0
            )
            {

                gates[data.id] =
                    entry;

            }

        }


        return gates;

    }





    //--------------------------------
    // Explicit hard gates
    //--------------------------------

    extractExplicitHardGates(
        data,
        hard
    )
    {

        if(
            !data
        )
        {

            return;

        }


        //--------------------------------
        // Generic hard gate collection
        //--------------------------------

        if(
            Array.isArray(
                data.hard_gates
            )
        )
        {

            for(
                const gate of
                    data.hard_gates
            )
            {

                this.addGate(

                    hard,

                    gate

                );

            }

        }


        //--------------------------------
        // Generic access requirements
        //--------------------------------

        if(
            Array.isArray(
                data.access_requirements
            )
        )
        {

            for(
                const requirement of
                    data.access_requirements
            )
            {

                this.addGate(

                    hard,

                    requirement

                );

            }

        }

    }





    //--------------------------------
    // Explicit soft gates
    //--------------------------------

    extractExplicitSoftGates(
        data,
        soft
    )
    {

        if(
            !data
        )
        {

            return;

        }


        if(
            Array.isArray(
                data.soft_gates
            )
        )
        {

            for(
                const gate of
                    data.soft_gates
            )
            {

                this.addGate(

                    soft,

                    gate

                );

            }

        }

    }





    //--------------------------------
    // Add gate without duplicates
    //--------------------------------

    addGate(
        gates,
        gate
    )
    {

        if(
            !gate
        )
        {

            return;

        }


        let normalized;


        //--------------------------------
        // Object gate
        //--------------------------------

        if(
            typeof gate ===
                "object"
        )
        {

            normalized =
            {

                ...gate

            };

        }


        //--------------------------------
        // String gate
        //--------------------------------

        else if(
            typeof gate ===
                "string"
        )
        {

            normalized =
            {

                type:
                    gate

            };

        }


        else
        {

            return;

        }


        //--------------------------------
        // Gate must have a type.
        //--------------------------------

        if(
            !normalized.type
        )
        {

            return;

        }


        //--------------------------------
        // Prevent duplicate gates.
        //--------------------------------

        const exists =
            gates.some(

                existing =>

                    JSON.stringify(
                        existing
                    )
                    ===
                    JSON.stringify(
                        normalized
                    )

            );


        if(
            exists
        )
        {

            return;

        }


        gates.push(
            normalized
        );

    }


}





module.exports =
    LocationGateExtractor;
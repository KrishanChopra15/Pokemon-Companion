/**
 * Pokémon Companion
 * Location Gate Merger
 *
 * Combines:
 *
 * 1. Existing extracted location gates.
 * 2. Source-derived FireRed gates.
 *
 * Source-derived gates take precedence when
 * the same gate ID exists in both layers.
 *
 * Does NOT:
 * - Evaluate progression.
 * - Execute player state.
 * - Apply WorldGates corrections yet.
 */

"use strict";


class LocationGateMerger
{


    merge(
        baseGates = {},
        sourceGates = {}
    )
    {

        const result =
            {};


        //--------------------------------
        // Copy base gates first.
        //--------------------------------

        this.copyLayer(

            result,

            baseGates

        );


        //--------------------------------
        // Apply source-derived gates.
        //
        // Source wins on duplicate IDs.
        //--------------------------------

        this.applyLayer(

            result,

            sourceGates

        );


        return result;

    }



    //--------------------------------
    // Copy a gate layer
    //--------------------------------

    copyLayer(
        target,
        layer
    )
    {

        if(
            !layer
            ||
            typeof layer !==
                "object"
        )
        {

            return;

        }


        for(
            const [
                locationId,
                entry
            ]
            of
            Object.entries(
                layer
            )
        )
        {

            if(
                !entry
                ||
                typeof entry !==
                    "object"
            )
            {

                continue;

            }


            if(
                !target[locationId]
            )
            {

                target[locationId] =
                {

                    id:
                        locationId,

                    soft:
                        [],

                    hard:
                        []

                };

            }


            this.addGates(

                target[locationId].soft,

                entry.soft

            );


            this.addGates(

                target[locationId].hard,

                entry.hard

            );

        }

    }



    //--------------------------------
    // Apply source layer
    //--------------------------------

    applyLayer(
        target,
        source
    )
    {

        if(
            !source
            ||
            typeof source !==
                "object"
        )
        {

            return;

        }


        for(
            const [
                locationId,
                entry
            ]
            of
            Object.entries(
                source
            )
        )
        {

            if(
                !entry
                ||
                typeof entry !==
                    "object"
            )
            {

                continue;

            }


            if(
                !target[locationId]
            )
            {

                target[locationId] =
                {

                    id:
                        locationId,

                    soft:
                        [],

                    hard:
                        []

                };

            }


            this.addGatesSourceFirst(

                target[locationId].soft,

                entry.soft

            );


            this.addGatesSourceFirst(

                target[locationId].hard,

                entry.hard

            );

        }

    }



    //--------------------------------
    // Add base gates
    //--------------------------------

    addGates(
        target,
        gates
    )
    {

        if(
            !Array.isArray(
                gates
            )
        )
        {

            return;

        }


        for(
            const gate of
                gates
        )
        {

            if(
                !gate
            )
            {

                continue;

            }


            const id =
                gate.id
                ??
                null;


            if(
                id
                &&
                target.some(
                    existing =>
                        existing
                        &&
                        existing.id ===
                            id
                )
            )
            {

                continue;

            }


            target.push(
                gate
            );

        }

    }



    //--------------------------------
    // Add source gates.
    //
    // Source wins when IDs overlap.
    //--------------------------------

    addGatesSourceFirst(
        target,
        sourceGates
    )
    {

        if(
            !Array.isArray(
                sourceGates
            )
        )
        {

            return;

        }


        for(
            const sourceGate of
                sourceGates
        )
        {

            if(
                !sourceGate
            )
            {

                continue;

            }


            const id =
                sourceGate.id
                ??
                null;


            if(
                !id
            )
            {

                target.push(
                    sourceGate
                );

                continue;

            }


            const index =
                target.findIndex(

                    existing =>
                        existing
                        &&
                        existing.id ===
                            id

                );


            if(
                index >= 0
            )
            {

                target[index] =
                    sourceGate;

            }
            else
            {

                target.push(
                    sourceGate
                );

            }

        }

    }

}


module.exports =
    LocationGateMerger;

/**
 * Pokémon Companion
 * Event Script Effect Extractor
 *
 * Extracts direct effects from event scripts.
 *
 * Responsibilities:
 * - Items.
 * - Pokémon gifts.
 * - Egg gifts.
 * - Money.
 * - Wild battles.
 * - Trainer battles.
 * - Story flags.
 * - Object state changes.
 * - Object movements.
 * - Warp state changes.
 * - Variables.
 *
 * Does NOT:
 * - Resolve trainers.
 * - Execute battle logic.
 * - Resolve NPCs.
 * - Resolve script calls or jumps.
 */

"use strict";


class EventScriptEffectExtractor
{


    //--------------------------------
    // Extract all effects
    //--------------------------------

    extract(
        body
    )
    {

        const variables =
            this.extractVariables(
                body
            );


        const effects =
        {

            addItems:
                [],

            removeItems:
                [],

            addPokemon:
                [],

            addEggs:
                [],

            addTMs:
                [],

            addKeyItems:
                [],

            addMoney:
                0,

            removeMoney:
                0,

            addStoryFlags:
                [],

            removeStoryFlags:
                [],

            battles:
                [],

            objectStateChanges:
                [],

            movements:
                [],

            warps:
                [],

            dynamicWarps:
                []

        };


        //--------------------------------
        // Items
        //--------------------------------

        for(
            const item of
                body.matchAll(

                    /giveitem(?:_msg)?[^\n]*ITEM_([A-Z0-9_]+)(?:,\s*(\d+))?/g

                )
        )
        {

            const name =
                item[1];


            const quantity =
                Number(

                    item[2]
                    ||
                    1

                );


            if(
                name.startsWith(
                    "TM"
                )
            )
            {

                effects.addTMs.push(
                    name
                );

            }


            else if(
                [

                    "SS_TICKET",

                    "POKE_FLUTE",

                    "HM01",

                    "HM02",

                    "HM03",

                    "HM04",

                    "HM05",

                    "BICYCLE",

                    "OAKS_PARCEL",

                    "SILPH_SCOPE",

                    "BIKE_VOUCHER",

                    "COIN_CASE",

                    "CARD_KEY"

                ]
                .includes(
                    name
                )
            )
            {

                effects.addKeyItems.push(
                    name
                );

            }


            else
            {

                effects.addItems.push({

                    item:
                        name,

                    quantity

                });

            }

        }


        //--------------------------------
        // Pokémon gifts
        //--------------------------------

        for(
            const pokemon of
                body.matchAll(

                    /givemon\s+SPECIES_([A-Z0-9_]+),\s*(\d+)/g

                )
        )
        {

            effects.addPokemon.push({

                species:
                    pokemon[1],

                level:
                    Number(
                        pokemon[2]
                    )

            });

        }


        //--------------------------------
        // Pokémon variable gifts
        //--------------------------------

        for(
            const pokemon of
                body.matchAll(

                    /givemon\s+(VAR_[A-Za-z0-9_]+),\s*(\d+)/g

                )
        )
        {

            const species =
                variables[
                    pokemon[1]
                ];


            if(
                species
            )
            {

                effects.addPokemon.push({

                    species,

                    level:
                        Number(
                            pokemon[2]
                        )

                });

            }

        }


        //--------------------------------
        // Eggs
        //--------------------------------

        for(
            const egg of
                body.matchAll(

                    /giveegg\s+SPECIES_([A-Z0-9_]+)/g

                )
        )
        {

            effects.addEggs.push({

                species:
                    egg[1]

            });

        }


        //--------------------------------
        // Money
        //--------------------------------

        for(
            const money of
                body.matchAll(

                    /givemoney\s+[A-Z0-9_]+,\s*(\d+)/g

                )
        )
        {

            effects.addMoney +=

                Number(
                    money[1]
                );

        }


        //--------------------------------
        // Wild battles
        //--------------------------------

        for(
            const battle of
                body.matchAll(

                    /setwildbattle\s+SPECIES_([A-Z0-9_]+),\s*(\d+)/g

                )
        )
        {

            effects.battles.push({

                type:
                    "wild",

                species:
                    battle[1],

                level:
                    Number(
                        battle[2]
                    )

            });

        }


        //--------------------------------
        // Trainer battles
        //--------------------------------

        this.extractTrainerBattles(

            body,

            effects.battles

        );


        //--------------------------------
        // Flags
        //--------------------------------

        for(
            const flag of
                body.matchAll(

                    /setflag\s+FLAG_([A-Z0-9_]+)/g

                )
        )
        {

            effects.addStoryFlags.push(
                flag[1]
            );

        }


        for(
            const flag of
                body.matchAll(

                    /clearflag\s+FLAG_([A-Z0-9_]+)/g

                )
        )
        {

            effects.removeStoryFlags.push(
                flag[1]
            );

        }


        //--------------------------------
        // Object state changes
        //--------------------------------

        this.extractObjectStateChanges(

            body,

            effects.objectStateChanges

        );


        //--------------------------------
        // Object movements
        //--------------------------------

        this.extractMovements(

            body,

            effects.movements

        );


        //--------------------------------
        // Warp changes
        //--------------------------------

        this.extractWarps(

            body,

            effects.warps,

            effects.dynamicWarps

        );


        return effects;

    }


    //--------------------------------
    // Extract variables
    //--------------------------------

    extractVariables(
        body
    )
    {

        const variables =
            {};


        for(
            const variable of
                body.matchAll(

                    /setvar\s+(VAR_[A-Za-z0-9_]+),\s*SPECIES_([A-Z0-9_]+)/g

                )
        )
        {

            variables[
                variable[1]
            ] =
                variable[2];

        }


        return variables;

    }


    //--------------------------------
    // Extract object state changes
    //--------------------------------

    extractObjectStateChanges(
        body,
        changes
    )
    {

        //--------------------------------
        // addobject
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*addobject[ \t]+([^,\s]+)(?:[ \t]*,[ \t]*([^,\s]+))?[ \t]*$/gm

                )
        )
        {

            changes.push({

                type:
                    "ADD_OBJECT",

                localId:
                    match[1],

                map:
                    match[2]
                    ||
                    null

            });

        }


        //--------------------------------
        // removeobject
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*removeobject[ \t]+([^,\s]+)(?:[ \t]*,[ \t]*([^,\s]+))?[ \t]*$/gm

                )
        )
        {

            changes.push({

                type:
                    "REMOVE_OBJECT",

                localId:
                    match[1],

                map:
                    match[2]
                    ||
                    null

            });

        }


        //--------------------------------
        // setobjectxy
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*setobjectxy[ \t]+([^,\s]+)[ \t]*,[ \t]*(-?\d+)[ \t]*,[ \t]*(-?\d+)[ \t]*$/gm

                )
        )
        {

            changes.push({

                type:
                    "SET_OBJECT_XY",

                localId:
                    match[1],

                position:
                {

                    x:
                        Number(
                            match[2]
                        ),

                    y:
                        Number(
                            match[3]
                        )

                }

            });

        }


        //--------------------------------
        // setobjectxyperm
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*setobjectxyperm[ \t]+([^,\s]+)[ \t]*,[ \t]*(-?\d+)[ \t]*,[ \t]*(-?\d+)[ \t]*$/gm

                )
        )
        {

            changes.push({

                type:
                    "SET_OBJECT_XY_PERM",

                localId:
                    match[1],

                position:
                {

                    x:
                        Number(
                            match[2]
                        ),

                    y:
                        Number(
                            match[3]
                        )

                }

            });

        }


        //--------------------------------
        // copyobjectxytoperm
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*copyobjectxytoperm[ \t]+([^,\s]+)[ \t]*$/gm

                )
        )
        {

            changes.push({

                type:
                    "COPY_OBJECT_XY_TO_PERM",

                localId:
                    match[1]

            });

        }


        //--------------------------------
        // setobjectmovementtype
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*setobjectmovementtype[ \t]+([^,\s]+)[ \t]*,[ \t]*([^,\s]+)[ \t]*$/gm

                )
        )
        {

            changes.push({

                type:
                    "SET_OBJECT_MOVEMENT_TYPE",

                localId:
                    match[1],

                movementType:
                    match[2]

            });

        }


        //--------------------------------
        // turnobject
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*turnobject[ \t]+([^,\s]+)[ \t]*,[ \t]*([^,\s]+)[ \t]*$/gm

                )
        )
        {

            changes.push({

                type:
                    "TURN_OBJECT",

                localId:
                    match[1],

                direction:
                    match[2]

            });

        }

    }


    //--------------------------------
    // Extract movement applications
    //--------------------------------

    extractMovements(
        body,
        movements
    )
    {

        for(
            const match of
                body.matchAll(

                    /^[ \t]*applymovement[ \t]+([^,\s]+)[ \t]*,[ \t]*([^,\s]+)(?:[ \t]*,[ \t]*([^,\s]+))?[ \t]*$/gm

                )
        )
        {

            movements.push({

                type:
                    "APPLY_MOVEMENT",

                localId:
                    match[1],

                movement:
                    match[2],

                map:
                    match[3]
                    ||
                    null

            });

        }

    }


    //--------------------------------
    // Extract warp commands
    //--------------------------------

    extractWarps(
        body,
        warps,
        dynamicWarps
    )
    {

        //--------------------------------
        // setdynamicwarp
        //--------------------------------
        //
        // FireRed allows:
        //
        // setdynamicwarp MAP
        // setdynamicwarp MAP, warpId
        // setdynamicwarp MAP, x, y
        // setdynamicwarp MAP, warpId, x, y
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*setdynamicwarp[ \t]+(.+?)[ \t]*$/gm

                )
        )
        {

            const parsed =
                this.parseWarpArguments(
                    match[1]
                );


            if(
                parsed
            )
            {

                dynamicWarps.push({

                    type:
                        "SET_DYNAMIC_WARP",

                    ...parsed

                });

            }

        }


        //--------------------------------
        // Regular warp
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*warp[ \t]+(.+?)[ \t]*$/gm

                )
        )
        {

            const parsed =
                this.parseWarpArguments(
                    match[1]
                );


            if(
                parsed
            )
            {

                warps.push({

                    type:
                        "WARP",

                    ...parsed

                });

            }

        }


        //--------------------------------
        // Silent warp
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*warpsilent[ \t]+(.+?)[ \t]*$/gm

                )
        )
        {

            const parsed =
                this.parseWarpArguments(
                    match[1]
                );


            if(
                parsed
            )
            {

                warps.push({

                    type:
                        "WARP_SILENT",

                    ...parsed

                });

            }

        }


        //--------------------------------
        // Door warp
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*warpdoor[ \t]+(.+?)[ \t]*$/gm

                )
        )
        {

            const parsed =
                this.parseWarpArguments(
                    match[1]
                );


            if(
                parsed
            )
            {

                warps.push({

                    type:
                        "WARP_DOOR",

                    ...parsed

                });

            }

        }


        //--------------------------------
        // Teleport warp
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*warpteleport[ \t]+(.+?)[ \t]*$/gm

                )
        )
        {

            const parsed =
                this.parseWarpArguments(
                    match[1]
                );


            if(
                parsed
            )
            {

                warps.push({

                    type:
                        "WARP_TELEPORT",

                    ...parsed

                });

            }

        }


        //--------------------------------
        // Hole warp
        //--------------------------------
        //
        // warphole only accepts a map.
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*warphole[ \t]+([^,\s]+)[ \t]*$/gm

                )
        )
        {

            warps.push({

                type:
                    "WARP_HOLE",

                map:
                    match[1]

            });

        }


        //--------------------------------
        // setwarp
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*setwarp[ \t]+(.+?)[ \t]*$/gm

                )
        )
        {

            const parsed =
                this.parseWarpArguments(
                    match[1]
                );


            if(
                parsed
            )
            {

                warps.push({

                    type:
                        "SET_WARP",

                    ...parsed

                });

            }

        }


        //--------------------------------
        // setdivewarp
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*setdivewarp[ \t]+(.+?)[ \t]*$/gm

                )
        )
        {

            const parsed =
                this.parseWarpArguments(
                    match[1]
                );


            if(
                parsed
            )
            {

                warps.push({

                    type:
                        "SET_DIVE_WARP",

                    ...parsed

                });

            }

        }


        //--------------------------------
        // setholewarp
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /^[ \t]*setholewarp[ \t]+(.+?)[ \t]*$/gm

                )
        )
        {

            const parsed =
                this.parseWarpArguments(
                    match[1]
                );


            if(
                parsed
            )
            {

                warps.push({

                    type:
                        "SET_HOLE_WARP",

                    ...parsed

                });

            }

        }

    }


    //--------------------------------
    // Parse FireRed warp arguments
    //--------------------------------

    parseWarpArguments(
        argumentString
    )
    {

        const parts =
            argumentString
                .split(",")
                .map(
                    part =>
                        part.trim()
                )
                .filter(
                    Boolean
                );


        if(
            parts.length ===
            0
        )
        {

            return null;

        }


        const map =
            parts[0];


        if(
            parts.length ===
            1
        )
        {

            return {

                map

            };

        }


        if(
            parts.length ===
            2
        )
        {

            const second =
                parts[1];


            if(
                this.isInteger(
                    second
                )
            )
            {

                return {

                    map,

                    warpId:
                        Number(
                            second
                        )

                };

            }


            return {

                map,

                x:
                    this.parseNumberOrValue(
                        second
                    )

            };

        }


        if(
            parts.length ===
            3
        )
        {

            return {

                map,

                x:
                    this.parseNumberOrValue(
                        parts[1]
                    ),

                y:
                    this.parseNumberOrValue(
                        parts[2]
                    )

            };

        }


        return {

            map,

            warpId:
                this.parseNumberOrValue(
                    parts[1]
                ),

            x:
                this.parseNumberOrValue(
                    parts[2]
                ),

            y:
                this.parseNumberOrValue(
                    parts[3]
                )

        };

    }


    //--------------------------------
    // Parse numeric/value argument
    //--------------------------------

    parseNumberOrValue(
        value
    )
    {

        if(
            this.isInteger(
                value
            )
        )
        {

            return Number(
                value
            );

        }


        return value;

    }


    //--------------------------------
    // Integer check
    //--------------------------------

    isInteger(
        value
    )
    {

        return /^-?\d+$/.test(
            String(
                value
            ).trim()
        );

    }


    //--------------------------------
    // Extract trainer battles
    //--------------------------------

    extractTrainerBattles(
        body,
        battles
    )
    {

        //--------------------------------
        // Single battles
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /trainerbattle_single\s+(TRAINER_[A-Z0-9_]+)/g

                )
        )
        {

            battles.push({

                type:
                    "trainer",

                trainer:
                    match[1],

                battleType:
                    "single",

                rematch:
                    false

            });

        }


        //--------------------------------
        // Double battles
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /trainerbattle_double\s+(TRAINER_[A-Z0-9_]+)/g

                )
        )
        {

            battles.push({

                type:
                    "trainer",

                trainer:
                    match[1],

                battleType:
                    "double",

                rematch:
                    false

            });

        }


        //--------------------------------
        // Rematch single
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /trainerbattle_rematch\s+(TRAINER_[A-Z0-9_]+)/g

                )
        )
        {

            battles.push({

                type:
                    "trainer",

                trainer:
                    match[1],

                battleType:
                    "single",

                rematch:
                    true

            });

        }


        //--------------------------------
        // Rematch double
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /trainerbattle_rematch_double\s+(TRAINER_[A-Z0-9_]+)/g

                )
        )
        {

            battles.push({

                type:
                    "trainer",

                trainer:
                    match[1],

                battleType:
                    "double",

                rematch:
                    true

            });

        }


        //--------------------------------
        // No intro
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /trainerbattle_no_intro\s+(TRAINER_[A-Z0-9_]+)/g

                )
        )
        {

            battles.push({

                type:
                    "trainer",

                trainer:
                    match[1],

                battleType:
                    "single",

                rematch:
                    false,

                noIntro:
                    true

            });

        }


        //--------------------------------
        // Early rival
        //--------------------------------

        for(
            const match of
                body.matchAll(

                    /trainerbattle_earlyrival\s+(TRAINER_[A-Z0-9_]+)\s*,\s*[A-Z0-9_]+/g

                )
        )
        {

            battles.push({

                type:
                    "trainer",

                trainer:
                    match[1],

                battleType:
                    "single",

                rematch:
                    false,

                earlyRival:
                    true

            });

        }

    }


}


module.exports =
    EventScriptEffectExtractor;
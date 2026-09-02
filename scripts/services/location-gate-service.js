/**
 * Pokémon Companion
 * Location Gate Service
 *
 * Checks location access requirements.
 *
 * Responsibilities:
 * - Load location gates.
 * - Load progression-based world gates.
 * - Validate hard requirements.
 * - Provide soft requirement warnings.
 * - Use progression rules.
 *
 * Does NOT:
 * - Handle field obstacles.
 * - Traverse maps.
 * - Build graphs.
 * - Handle internal objects.
 * - Determine story progression itself.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class LocationGateService
{


    constructor(
        game,
        progressionService = null
    )
    {

        const generatedPath =
            path.join(

                __dirname,

                "../../database/generated",

                game

            );


        this.progression =
            progressionService;


        //--------------------------------
        // Load locations
        //--------------------------------

        const locationsPath =
            path.join(

                generatedPath,

                "locations.json"

            );


        if(
            !fs.existsSync(
                locationsPath
            )
        )
        {

            throw new Error(

                `Location database missing: ${locationsPath}`

            );

        }


        this.locations =
            JSON.parse(

                fs.readFileSync(

                    locationsPath,

                    "utf8"

                )

            );

    }





    //--------------------------------
    // Get location gates
    //--------------------------------

    getGate(
        location
    )
    {

        const data =
            this.locations[location];


        const soft =
            data
            &&
            data.gates
            ?
            [
                ...(data.gates.soft || [])
            ]
            :
            [];


        const hard =
            data
            &&
            data.gates
            ?
            [
                ...(data.gates.hard || [])
            ]
            :
            [];



        //--------------------------------
        // Add progression world gates
        //--------------------------------
        //
        // Progression rules marked as
        // HARD_GATE or SOFT_GATE are
        // location-access rules.
        //
        // Their complete requirement
        // object is preserved so the
        // generic progression service
        // can evaluate it.
        //--------------------------------

        if(
            this.progression
            &&
            typeof this.progression
                .getAllProgression ===
                    "function"
        )
        {


            const progression =
                this.progression
                    .getAllProgression();


            const worldGates =
                Object.values(
                    progression
                )
                .filter(

                    rule =>

                        rule
                        &&
                        rule.location ===
                            location
                        &&
                        (
                            String(
                                rule.type
                                ||
                                ""
                            )
                            .toUpperCase()
                            ===
                            "HARD_GATE"
                            ||
                            String(
                                rule.type
                                ||
                                ""
                            )
                            .toUpperCase()
                            ===
                            "SOFT_GATE"
                        )

                );



            //--------------------------------
            // Add hard gates
            //--------------------------------

            for(
                const rule of
                    worldGates
            )
            {

                if(
                    String(
                        rule.type
                        ||
                        ""
                    )
                    .toUpperCase()
                    ===
                    "HARD_GATE"
                )
                {

                    const duplicate =
                        hard.some(

                            gate =>

                                gate
                                &&
                                gate.id
                                &&
                                rule.id
                                &&
                                gate.id ===
                                    rule.id

                        );


                    if(
                        !duplicate
                    )
                    {

                        hard.push(
                            rule
                        );

                    }

                }

            }



            //--------------------------------
            // Add soft gates
            //--------------------------------

            for(
                const rule of
                    worldGates
            )
            {

                if(
                    String(
                        rule.type
                        ||
                        ""
                    )
                    .toUpperCase()
                    ===
                    "SOFT_GATE"
                )
                {

                    const duplicate =
                        soft.some(

                            gate =>

                                gate
                                &&
                                gate.id
                                &&
                                rule.id
                                &&
                                gate.id ===
                                    rule.id

                        );


                    if(
                        !duplicate
                    )
                    {

                        soft.push(
                            rule
                        );

                    }

                }

            }

        }


        return {

            soft,

            hard

        };

    }





    //--------------------------------
    // Check hard access
    //--------------------------------

    canEnter(
        location,
        playerState = {}
    )
    {

        const gates =
            this.getGate(
                location
            );


        //--------------------------------
        // Hard gates only block entry.
        //
        // Soft gates are deliberately
        // ignored here.
        //--------------------------------

        for(
            const gate of
                gates.hard
        )
        {

            const result =
                this.hasRequirement(

                    gate,

                    playerState

                );


            if(
                !result.allowed
            )
            {

                return {

                    allowed:
                        false,

                    type:
                        "hard",

                    requirement:
                        gate.type
                        ||
                        null,

                    reason:
                        result.reason

                };

            }

        }


        return {

            allowed:
                true

        };

    }





    //--------------------------------
    // Soft warnings
    //--------------------------------

    getWarnings(
        location,
        playerState = {}
    )
    {

        const warnings = [];


        const gates =
            this.getGate(
                location
            );


        for(
            const gate of
                gates.soft
        )
        {

            const result =
                this.hasRequirement(

                    gate,

                    playerState

                );


            if(
                !result.allowed
            )
            {

                warnings.push({

                    type:
                        gate.type
                        ||
                        null,

                    reason:
                        gate.reason
                        ||
                        result.reason

                });

            }

        }


        return warnings;

    }





    //--------------------------------
    // Requirement evaluation
    //--------------------------------

    hasRequirement(
        gate,
        playerState
    )
    {

        if(
            !gate
        )
        {

            return {

                allowed:
                    true

            };

        }


        //--------------------------------
        // Progression gate with an
        // explicit requirement object.
        //
        // Example:
        //
        // {
        //     type:
        //         "HARD_GATE",
        //
        //     requirement:
        //     {
        //         abilities:
        //         [
        //             "CAN_USE_CUT"
        //         ]
        //     }
        // }
        //--------------------------------

        if(
            gate.requirement
            &&
            typeof gate.requirement ===
                "object"
        )
        {

            if(
                this.progression
                &&
                typeof this.progression
                    .checkRequirement ===
                        "function"
            )
            {

                return this.progression
                    .checkRequirement(

                        gate.requirement,

                        playerState

                    );

            }


            return this.checkDirectProgressionRequirement(

                gate.requirement,

                playerState

            );

        }


        //--------------------------------
        // Use generic progression service
        // for legacy location gates.
        //--------------------------------

        if(
            this.progression
            &&
            typeof this.progression.checkRequirement ===
                "function"
        )
        {

            const requirement =
                this.convertGateToRequirement(
                    gate
                );


            return this.progression.checkRequirement(

                requirement,

                playerState

            );

        }


        //--------------------------------
        // Direct fallback
        //--------------------------------

        return this.checkDirectRequirement(

            gate,

            playerState

        );

    }





    //--------------------------------
    // Convert gate → requirement
    //--------------------------------

    convertGateToRequirement(
        gate
    )
    {

        if(
            typeof gate ===
                "string"
        )
        {

            return {

                ability:
                    gate

            };

        }


        const type =
            String(

                gate.type

                ||

                ""

            )
            .toUpperCase();


        //--------------------------------
        // HM / field abilities
        //--------------------------------

        const abilityMap =
        {

            CUT:
                "CAN_USE_CUT",

            FLASH:
                "CAN_USE_FLASH",

            SURF:
                "CAN_USE_SURF",

            STRENGTH:
                "CAN_USE_STRENGTH",

            FLY:
                "CAN_USE_FLY",

            ROCK_SMASH:
                "CAN_USE_ROCK_SMASH",

            POKE_FLUTE:
                "CAN_USE_POKE_FLUTE"

        };


        if(
            abilityMap[type]
        )
        {

            return {

                abilities:
                [
                    abilityMap[type]
                ]

            };

        }


        //--------------------------------
        // Explicit ability
        //--------------------------------

        if(
            type.startsWith(
                "CAN_USE_"
            )
        )
        {

            return {

                abilities:
                [
                    type
                ]

            };

        }


        //--------------------------------
        // Badge
        //--------------------------------

        if(
            type.endsWith(
                "_BADGE"
            )
        )
        {

            return {

                badges:
                [
                    type
                ]

            };

        }


        //--------------------------------
        // Key item
        //--------------------------------

        if(
            type.startsWith(
                "ITEM_"
            )
        )
        {

            return {

                keyItems:
                [
                    type.replace(
                        /^ITEM_/,
                        ""
                    )
                ]

            };

        }


        //--------------------------------
        // Story flag
        //--------------------------------

        if(
            type.startsWith(
                "FLAG_"
            )
        )
        {

            return {

                storyFlags:
                [
                    type.replace(
                        /^FLAG_/,
                        ""
                    )
                ]

            };

        }


        //--------------------------------
        // Generic named requirement
        //--------------------------------

        return {

            ability:
                type

        };

    }





    //--------------------------------
    // Direct progression requirement
    //--------------------------------

    checkDirectProgressionRequirement(
        requirement,
        playerState
    )
    {

        if(
            !requirement
        )
        {

            return {

                allowed:
                    true

            };

        }


        //--------------------------------
        // Badges
        //--------------------------------

        for(
            const badge of
                requirement.badges || []
        )
        {

            if(
                !this.hasBadge(
                    badge,
                    playerState
                )
            )
            {

                return {

                    allowed:
                        false,

                    reason:
                        `Requires badge ${badge}`

                };

            }

        }


        //--------------------------------
        // Key items
        //--------------------------------

        for(
            const item of
                requirement.keyItems || []
        )
        {

            if(
                !this.hasKeyItem(
                    item,
                    playerState
                )
            )
            {

                return {

                    allowed:
                        false,

                    reason:
                        `Requires key item ${item}`

                };

            }

        }


        //--------------------------------
        // Story flags
        //--------------------------------

        for(
            const flag of
                requirement.storyFlags || []
        )
        {

            if(
                !this.hasStoryFlag(
                    flag,
                    playerState
                )
            )
            {

                return {

                    allowed:
                        false,

                    reason:
                        `Requires story flag ${flag}`

                };

            }

        }


        //--------------------------------
        // Abilities
        //--------------------------------

        for(
            const ability of
                requirement.abilities || []
        )
        {

            if(
                !this.hasAbility(
                    ability,
                    playerState
                )
            )
            {

                return {

                    allowed:
                        false,

                    reason:
                        `Requires ability ${ability}`

                };

            }

        }


        return {

            allowed:
                true

        };

    }





    //--------------------------------
    // Direct fallback requirement
    //--------------------------------

    checkDirectRequirement(
        gate,
        playerState
    )
    {

        if(
            !gate
        )
        {

            return {

                allowed:
                    true

            };

        }


        const type =
            String(

                gate.type

                ||

                ""

            )
            .toUpperCase();


        //--------------------------------
        // CAN_USE_* ability
        //--------------------------------

        if(
            type.startsWith(
                "CAN_USE_"
            )
        )
        {

            if(
                this.hasAbility(

                    type,

                    playerState

                )
            )
            {

                return {

                    allowed:
                        true

                };

            }


            return {

                allowed:
                    false,

                reason:
                    `Requires ${type}`

            };

        }


        //--------------------------------
        // HM ability names
        //--------------------------------

        const hmMap =
        {

            CUT:
                "CAN_USE_CUT",

            FLASH:
                "CAN_USE_FLASH",

            SURF:
                "CAN_USE_SURF",

            STRENGTH:
                "CAN_USE_STRENGTH",

            FLY:
                "CAN_USE_FLY",

            ROCK_SMASH:
                "CAN_USE_ROCK_SMASH",

            POKE_FLUTE:
                "CAN_USE_POKE_FLUTE"

        };


        if(
            hmMap[type]
        )
        {

            if(
                this.hasAbility(

                    hmMap[type],

                    playerState

                )
            )
            {

                return {

                    allowed:
                        true

                };

            }


            return {

                allowed:
                    false,

                reason:
                    `Requires ${hmMap[type]}`

            };

        }


        //--------------------------------
        // Badge
        //--------------------------------

        if(
            playerState
            &&
            Array.isArray(
                playerState.badges
            )
            &&
            playerState.badges.includes(
                type
            )
        )
        {

            return {

                allowed:
                    true

            };

        }


        //--------------------------------
        // Story flag
        //--------------------------------

        if(
            playerState
            &&
            Array.isArray(
                playerState.storyFlags
            )
            &&
            playerState.storyFlags.includes(
                type
            )
        )
        {

            return {

                allowed:
                    true

            };

        }


        //--------------------------------
        // Unknown gate
        //--------------------------------

        return {

            allowed:
                false,

            reason:
                gate.reason
                ||
                `Requires ${type}`

        };

    }





    //--------------------------------
    // Badge check
    //--------------------------------

    hasBadge(
        badge,
        playerState
    )
    {

        if(
            playerState
            &&
            typeof playerState.hasBadge ===
                "function"
        )
        {

            return playerState.hasBadge(
                badge
            );

        }


        return (
            playerState
            &&
            Array.isArray(
                playerState.badges
            )
            &&
            playerState.badges.includes(
                badge
            )
        );

    }





    //--------------------------------
    // Key item check
    //--------------------------------

    hasKeyItem(
        item,
        playerState
    )
    {

        if(
            playerState
            &&
            typeof playerState.hasKeyItem ===
                "function"
        )
        {

            return playerState.hasKeyItem(
                item
            );

        }


        return (
            playerState
            &&
            Array.isArray(
                playerState.keyItems
            )
            &&
            playerState.keyItems.includes(
                item
            )
        );

    }





    //--------------------------------
    // Story flag check
    //--------------------------------

    hasStoryFlag(
        flag,
        playerState
    )
    {

        if(
            playerState
            &&
            typeof playerState.hasStoryFlag ===
                "function"
        )
        {

            return playerState.hasStoryFlag(
                flag
            );

        }


        return (
            playerState
            &&
            Array.isArray(
                playerState.storyFlags
            )
            &&
            playerState.storyFlags.includes(
                flag
            )
        );

    }





    //--------------------------------
    // Ability check
    //--------------------------------

    hasAbility(
        ability,
        playerState
    )
    {

        const normalized =
            String(
                ability
            )
            .toUpperCase();


        //--------------------------------
        // Generic abilities
        //--------------------------------

        if(
            playerState
            &&
            Array.isArray(
                playerState.abilities
            )
            &&
            playerState.abilities.some(

                value =>

                    String(
                        value
                    )
                    .toUpperCase()
                    ===
                    normalized

            )
        )
        {

            return true;

        }


        //--------------------------------
        // HM abilities
        //--------------------------------

        if(
            playerState
            &&
            Array.isArray(
                playerState.hmAbilities
            )
            &&
            playerState.hmAbilities.some(

                value =>

                    String(
                        value
                    )
                    .toUpperCase()
                    ===
                    normalized

            )
        )
        {

            return true;

        }


        //--------------------------------
        // Direct HM storage
        //--------------------------------

        if(
            normalized.startsWith(
                "CAN_USE_"
            )
        )
        {

            const hm =
                normalized.replace(

                    /^CAN_USE_/,

                    ""

                );


            if(
                playerState
                &&
                Array.isArray(
                    playerState.hms
                )
                &&
                playerState.hms.some(

                    value =>

                        String(
                            value
                        )
                        .toUpperCase()
                        ===
                        hm

                )
            )
            {

                return true;

            }

        }


        return false;

    }


}





module.exports =
    LocationGateService;

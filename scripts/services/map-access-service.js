/**
 * Pokémon Companion
 * Map Access Service
 *
 * Handles world location access rules.
 *
 * Responsibilities:
 * - Load generated location data.
 * - Evaluate hard location gates.
 * - Evaluate progression rules attached to locations.
 * - Evaluate badge requirements.
 * - Evaluate HM / ability requirements.
 * - Evaluate key item requirements.
 * - Evaluate story flag requirements.
 * - Preserve soft gates as navigation warnings.
 * - Determine whether a location is reachable from visited locations.
 *
 * Does NOT:
 * - Move the player automatically.
 * - Modify trainer state.
 * - Parse ROM data.
 * - Infer story progression from gym order.
 * - Treat soft gates as hard access requirements.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class MapAccessService
{


    constructor(
        game = "firered",
        locationDatabase = null,
        progressionDatabase = null
    )
    {

        this.game =
            game;


        //--------------------------------
        // Load location database
        //--------------------------------

        this.locations =
            locationDatabase
            ||
            this.loadDatabase(

                "generated",

                "locations.json",

                {}

            );


        //--------------------------------
        // Load progression database
        //--------------------------------

        this.progression =
            progressionDatabase
            ||
            this.loadDatabase(

                "generated",

                "progression.json",

                {}

            );


        //--------------------------------
        // Build progression index
        //--------------------------------

        this.progressionByLocation =
            this.buildProgressionIndex();

    }





    //--------------------------------
    // Load database
    //--------------------------------

    loadDatabase(
        directoryType,
        file,
        defaultValue
    )
    {

        const filePath =
            path.join(

                process.cwd(),

                "database",

                directoryType,

                this.game,

                file

            );


        if(
            !fs.existsSync(
                filePath
            )
        )
        {

            return defaultValue;

        }


        return JSON.parse(

            fs.readFileSync(

                filePath,

                "utf8"

            )

        );

    }





    //--------------------------------
    // Build progression index
    //--------------------------------

    buildProgressionIndex()
    {

        const index = {};


        const records =
            Array.isArray(
                this.progression
            )
            ?
            this.progression
            :
            Object.values(
                this.progression
            );


        for(
            const record of
                records
        )
        {

            if(
                !record
                ||
                !record.location
            )
            {

                continue;

            }


            if(
                !index[record.location]
            )
            {

                index[record.location] =
                    [];

            }


            index[record.location].push(
                record
            );

        }


        return index;

    }





    //--------------------------------
    // Get all locations
    //--------------------------------

    getAllLocations()
    {

        if(
            Array.isArray(
                this.locations
            )
        )
        {

            return this.locations;

        }


        return Object.values(
            this.locations
        );

    }





    //--------------------------------
    // Find location
    //--------------------------------

    getLocation(
        id
    )
    {

        if(
            !id
        )
        {

            return null;

        }


        //--------------------------------
        // Direct lookup
        //--------------------------------

        if(
            this.locations
            &&
            this.locations[id]
        )
        {

            return this.locations[id];

        }


        //--------------------------------
        // Array database fallback
        //--------------------------------

        if(
            Array.isArray(
                this.locations
            )
        )
        {

            return (

                this.locations.find(

                    location =>
                        location
                        &&
                        location.id === id

                )

                ||

                null

            );

        }


        return null;

    }





    //--------------------------------
    // Access check
    //--------------------------------

    canAccess(
        locationId,
        trainerState
    )
    {

        const location =
            this.getLocation(
                locationId
            );


        if(
            !location
        )
        {

            return {

                allowed:
                    false,

                reason:
                    "Unknown location"

            };

        }


        //--------------------------------
        // Trainer state
        //--------------------------------

        const state =
            trainerState
            ||
            {};


        //--------------------------------
        // Location hard gates
        //--------------------------------

        const locationResult =
            this.checkLocationHardGates(

                location,

                state

            );


        if(
            !locationResult.allowed
        )
        {

            return locationResult;

        }


        //--------------------------------
        // Progression rules attached to
        // this location
        //--------------------------------

        const progressionResult =
            this.checkProgressionRules(

                locationId,

                state

            );


        if(
            !progressionResult.allowed
        )
        {

            return progressionResult;

        }


        //--------------------------------
        // No blocking requirements
        //--------------------------------

        return {

            allowed:
                true

        };

    }





    //--------------------------------
    // Location hard gates
    //--------------------------------

    checkLocationHardGates(
        location,
        trainerState
    )
    {

        const gates =
            location.gates
            ||
            {};


        const hard =
            Array.isArray(
                gates.hard
            )
            ?
            gates.hard
            :
            [];


        for(
            const gate of
                hard
        )
        {

            const result =
                this.checkRequirement(

                    gate,

                    trainerState

                );


            if(
                !result.allowed
            )
            {

                return result;

            }

        }


        //--------------------------------
        // Soft gates are intentionally
        // ignored for access.
        //--------------------------------

        return {

            allowed:
                true

        };

    }





    //--------------------------------
    // Progression rules for location
    //--------------------------------

    checkProgressionRules(
        locationId,
        trainerState
    )
    {

        const rules =
            this.progressionByLocation[
                locationId
            ]
            ||
            [];


        //--------------------------------
        // No progression rules
        //--------------------------------

        if(
            rules.length ===
                0
        )
        {

            return {

                allowed:
                    true

            };

        }


        //--------------------------------
        // A location may have several
        // records.
        //
        // A HARD_GATE / STORY / GYM rule
        // is only blocking when its own
        // requirement represents actual
        // access to that location.
        //--------------------------------

        for(
            const rule of
                rules
        )
        {

            const type =
                String(

                    rule.type

                    ||

                    ""

                )
                .toUpperCase();


            //--------------------------------
            // Ignore completion records when
            // evaluating basic location access.
            //--------------------------------

            if(
                type ===
                    "GYM"
                ||
                type ===
                    "HM"
            )
            {

                continue;

            }


            const result =
                this.checkRequirement(

                    rule.requirement,

                    trainerState

                );


            if(
                !result.allowed
            )
            {

                return result;

            }

        }


        return {

            allowed:
                true

        };

    }





    //--------------------------------
    // Requirement check
    //--------------------------------

    checkRequirement(
        requirement,
        trainerState
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

        if(
            Array.isArray(
                requirement.badges
            )
        )
        {

            if(
                !this.hasBadges(

                    requirement.badges,

                    trainerState

                )
            )
            {

                return {

                    allowed:
                        false,

                    reason:
                        "Missing required badges"

                };

            }

        }


        //--------------------------------
        // Single badge
        //--------------------------------

        if(
            requirement.badge
        )
        {

            if(
                !this.hasBadge(

                    requirement.badge,

                    trainerState

                )
            )
            {

                return {

                    allowed:
                        false,

                    reason:
                        `Requires ${requirement.badge}`

                };

            }

        }


        //--------------------------------
        // Multiple HMs
        //--------------------------------

        if(
            Array.isArray(
                requirement.hms
            )
        )
        {

            for(
                const hm of
                    requirement.hms
            )
            {

                if(
                    !this.hasHM(

                        hm,

                        trainerState

                    )
                )
                {

                    return {

                        allowed:
                            false,

                        reason:
                            `Requires HM ${hm}`

                    };

                }

            }

        }


        //--------------------------------
        // Single HM
        //--------------------------------

        if(
            requirement.hm
        )
        {

            if(
                !this.hasHM(

                    requirement.hm,

                    trainerState

                )
            )
            {

                return {

                    allowed:
                        false,

                    reason:
                        `Requires HM ${requirement.hm}`

                };

            }

        }


        //--------------------------------
        // Abilities
        //--------------------------------

        if(
            Array.isArray(
                requirement.abilities
            )
        )
        {

            for(
                const ability of
                    requirement.abilities
            )
            {

                if(
                    !this.hasAbility(

                        ability,

                        trainerState

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

        }


        //--------------------------------
        // Single ability
        //--------------------------------

        if(
            requirement.ability
        )
        {

            if(
                !this.hasAbility(

                    requirement.ability,

                    trainerState

                )
            )
            {

                return {

                    allowed:
                        false,

                    reason:
                        `Requires ability ${requirement.ability}`

                };

            }

        }


        //--------------------------------
        // Multiple key items
        //--------------------------------

        if(
            Array.isArray(
                requirement.keyItems
            )
        )
        {

            for(
                const item of
                    requirement.keyItems
            )
            {

                if(
                    !this.hasKeyItem(

                        item,

                        trainerState

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

        }


        //--------------------------------
        // Single key item
        //--------------------------------

        if(
            requirement.keyItem
        )
        {

            if(
                !this.hasKeyItem(

                    requirement.keyItem,

                    trainerState

                )
            )
            {

                return {

                    allowed:
                        false,

                    reason:
                        `Requires ${requirement.keyItem}`

                };

            }

        }


        //--------------------------------
        // Multiple story flags
        //--------------------------------

        if(
            Array.isArray(
                requirement.storyFlags
            )
        )
        {

            for(
                const flag of
                    requirement.storyFlags
            )
            {

                if(
                    !this.hasStoryFlag(

                        flag,

                        trainerState

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

        }


        //--------------------------------
        // Single story flag
        //--------------------------------

        if(
            requirement.storyFlag
        )
        {

            if(
                !this.hasStoryFlag(

                    requirement.storyFlag,

                    trainerState

                )
            )
            {

                return {

                    allowed:
                        false,

                    reason:
                        `Requires ${requirement.storyFlag}`

                };

            }

        }


        //--------------------------------
        // Access to another location
        //--------------------------------

        if(
            requirement.access
        )
        {

            if(
                !this.hasVisited(

                    requirement.access,

                    trainerState

                )
            )
            {

                return {

                    allowed:
                        false,

                    reason:
                        `Requires access to ${requirement.access}`

                };

            }

        }


        return {

            allowed:
                true

        };

    }





    //--------------------------------
    // Badge helpers
    //--------------------------------

    hasBadge(
        badge,
        trainerState
    )
    {

        if(
            trainerState
            &&
            typeof trainerState.hasBadge ===
                "function"
        )
        {

            return trainerState.hasBadge(
                badge
            );

        }


        return (

            trainerState.badges

            ||

            []

        )
        .includes(
            badge
        );

    }





    hasBadges(
        badges,
        trainerState
    )
    {

        return badges.every(

            badge =>

                this.hasBadge(

                    badge,

                    trainerState

                )

        );

    }





    //--------------------------------
    // HM helpers
    //--------------------------------

    hasHM(
        hm,
        trainerState
    )
    {

        if(
            trainerState
            &&
            typeof trainerState.hasHM ===
                "function"
            &&
            trainerState.hasHM(
                hm
            )
        )
        {

            return true;

        }


        if(
            trainerState
            &&
            Array.isArray(
                trainerState.hms
            )
            &&
            trainerState.hms.includes(
                hm
            )
        )
        {

            return true;

        }


        if(
            trainerState
            &&
            Array.isArray(
                trainerState.hmAbilities
            )
            &&
            trainerState.hmAbilities.includes(
                hm
            )
        )
        {

            return true;

        }


        //--------------------------------
        // Normalize common HM ability
        // names.
        //--------------------------------

        const normalized =
            String(
                hm
            )
            .toUpperCase();


        if(
            trainerState
            &&
            Array.isArray(
                trainerState.hmAbilities
            )
        )
        {

            return trainerState.hmAbilities.some(

                ability =>

                    String(
                        ability
                    )
                    .toUpperCase()
                    ===
                    normalized

            );

        }


        return false;

    }





    //--------------------------------
    // Ability helpers
    //--------------------------------

    hasAbility(
        ability,
        trainerState
    )
    {

        if(
            !ability
        )
        {

            return true;

        }


        const normalized =
            String(
                ability
            )
            .toUpperCase();


        if(
            trainerState
            &&
            Array.isArray(
                trainerState.abilities
            )
        )
        {

            if(
                trainerState.abilities.some(

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

        }


        if(
            trainerState
            &&
            Array.isArray(
                trainerState.hmAbilities
            )
        )
        {

            if(
                trainerState.hmAbilities.some(

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

        }


        //--------------------------------
        // CAN_USE_* abilities may also be
        // represented as HMs.
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


            return this.hasHM(

                hm,

                trainerState

            );

        }


        return false;

    }





    //--------------------------------
    // Key item helpers
    //--------------------------------

    hasKeyItem(
        item,
        trainerState
    )
    {

        if(
            trainerState
            &&
            typeof trainerState.hasKeyItem ===
                "function"
        )
        {

            return trainerState.hasKeyItem(
                item
            );

        }


        return (

            trainerState.keyItems

            ||

            []

        )
        .includes(
            item
        );

    }





    //--------------------------------
    // Story flag helpers
    //--------------------------------

    hasStoryFlag(
        flag,
        trainerState
    )
    {

        if(
            trainerState
            &&
            typeof trainerState.hasStoryFlag ===
                "function"
        )
        {

            return trainerState.hasStoryFlag(
                flag
            );

        }


        return (

            trainerState.storyFlags

            ||

            []

        )
        .includes(
            flag
        );

    }





    //--------------------------------
    // Visited location helpers
    //--------------------------------

    hasVisited(
        location,
        trainerState
    )
    {

        if(
            trainerState
            &&
            typeof trainerState.hasVisited ===
                "function"
        )
        {

            return trainerState.hasVisited(
                location
            );

        }


        return (

            trainerState.visitedLocations

            ||

            []

        )
        .includes(
            location
        );

    }





    //--------------------------------
    // Available locations
    //--------------------------------

    getAvailableLocations(
        trainerState
    )
    {

        return this.getAllLocations()

            .filter(

                location =>

                    this.canAccess(

                        location.id,

                        trainerState

                    )
                    .allowed

            );

    }





    //--------------------------------
    // Unlock location
    //--------------------------------

    unlockLocation(
        locationId,
        trainerState
    )
    {

        const result =
            this.canAccess(

                locationId,

                trainerState

            );


        if(
            !result.allowed
        )
        {

            return {

                success:
                    false,

                reason:
                    result.reason

            };

        }


        //--------------------------------
        // Do not mutate state when the
        // trainer state does not expose
        // a visit method.
        //--------------------------------

        if(
            trainerState
            &&
            typeof trainerState.visitLocation ===
                "function"
        )
        {

            trainerState.visitLocation(
                locationId
            );

        }


        return {

            success:
                true,

            location:
                locationId

        };

    }





    //--------------------------------
    // Soft gate warnings
    //--------------------------------

    getSoftGates(
        locationId
    )
    {

        const location =
            this.getLocation(
                locationId
            );


        if(
            !location
        )
        {

            return [];

        }


        const gates =
            location.gates
            ||
            {};


        return Array.isArray(
            gates.soft
        )
        ?
        gates.soft
        :
        [];

    }


}





module.exports =
    MapAccessService;
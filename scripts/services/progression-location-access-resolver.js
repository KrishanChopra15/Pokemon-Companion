/**
 * Pokémon Companion
 * Progression Location Access Resolver
 *
 * Resolves whether a FireRed location can be
 * physically reached at a progression stage.
 *
 * Responsibilities:
 * - Resolve starting locations.
 * - Traverse location connections.
 * - Check location usability.
 * - Check connection requirements.
 * - Resolve progression-based location requirements.
 * - Protect recursive location dependencies.
 *
 * Does NOT:
 * - Define FireRed rules.
 * - Build location graphs.
 * - Build stage states.
 * - Calculate Pokémon availability.
 */

"use strict";


class ProgressionLocationAccessResolver
{


    constructor(
        locations = {},
        progressionRules = [],
        requirementEvaluator = null
    )
    {

        this.locations =
            locations
            &&
            typeof locations === "object"
            ?
            locations
            :
            {};

        this.rules =
            Array.isArray(
                progressionRules
            )
            ?
            progressionRules
            :
            [];

        this.requirementEvaluator =
            requirementEvaluator;

        this.progressionRulesByLocation =
            this.buildProgressionRuleIndex();

    }





    //--------------------------------
    // Build rule index
    //--------------------------------

    buildProgressionRuleIndex()
    {

        const index =
            {};


        for(
            const rule of
                this.rules
        )
        {

            if(
                !rule
                ||
                !rule.location
            )
            {

                continue;

            }


            if(
                !index[
                    rule.location
                ]
            )
            {

                index[
                    rule.location
                ] = [];

            }


            index[
                rule.location
            ].push(
                rule
            );

        }


        return index;

    }





    //--------------------------------
    // Resolve location access
    //--------------------------------

    canAccessLocationAtStage(
        locationId,
        stage,
        state = null,
        dependencyStack = new Set()
    )
    {

        if(
            !locationId
            ||
            !this.locations[
                locationId
            ]
        )
        {

            return false;

        }


        const startingLocations =
            this.getStartingLocations();


        //--------------------------------
        // Starting maps are accessible.
        //--------------------------------

        if(
            startingLocations.includes(
                locationId
            )
        )
        {

            return true;

        }


        const stack =
            dependencyStack instanceof Set
                ?
                dependencyStack
                :
                new Set();


        //--------------------------------
        // Independent access roots
        //--------------------------------
        //
        // Some locations are reached through
        // transport systems rather than ordinary
        // map connections.
        //
        // Generated location gates can explicitly
        // declare themselves as access roots.
        // Progression correction rules can also
        // declare access roots.
        //
        // A satisfied root gate establishes
        // independent physical reachability.
        //--------------------------------
            
        const targetLocation =
            this.locations[
                locationId
            ];
        
        
        const targetGates =
            targetLocation
            &&
            targetLocation.gates
            &&
            Array.isArray(
                targetLocation.gates.hard
            )
            ?
            targetLocation.gates.hard
            :
            [];
        
        
        for(
            const gate of
                targetGates
        )
        {
        
            if(
                gate?.accessRoot !==
                true
            )
            {
                continue;
            }
        
        
            const requirement =
                this.getGateRequirement(
                    gate
                );
            
            
            if(
                !requirement
                ||
                this.isRequirementSatisfied(
                    requirement,
                    stage,
                    state,
                    stack
                )
            )
            {
            
                return true;
            
            }
        
        }
        
        
        //--------------------------------
        // Progression correction roots
        //--------------------------------
        
        const locationRules =
            this.progressionRulesByLocation[
                locationId
            ]
            ||
            [];
        
        
        for(
            const rule of
                locationRules
        )
        {
        
            const type =
                String(
                    rule?.type
                    ||
                    ""
                )
                .toUpperCase();
            
            
            if(
                type !==
                "HARD_GATE"
            )
            {
                continue;
            }
        
        
            if(
                rule.accessRoot !==
                true
            )
            {
                continue;
            }
        
        
            if(
                !rule.requirement
            )
            {
                return true;
            }
        
        
            if(
                this.isRequirementSatisfied(
                    rule.requirement,
                    stage,
                    state,
                    stack
                )
            )
            {
                return true;
            }
        
        }


        //--------------------------------
        // Prevent dependency cycles.
        //--------------------------------

        if(
            stack.has(
                locationId
            )
        )
        {

            return false;

        }


        const nextStack =
            new Set(
                stack
            );


        nextStack.add(
            locationId
        );


        const visited =
            new Set();


        const queue =
        [
            ...startingLocations
        ];


        while(
            queue.length > 0
        )
        {

            const current =
                queue.shift();


            if(
                visited.has(
                    current
                )
            )
            {

                continue;

            }


            visited.add(
                current
            );


            const location =
                this.locations[
                    current
                ];


            if(
                !location
            )
            {

                continue;

            }


            if(
                !this.isLocationUsableAtStage(
                    location,
                    stage,
                    state,
                    nextStack
                )
            )
            {

                continue;

            }


            if(
                current ===
                locationId
            )
            {

                return true;

            }


            const connections =
                Array.isArray(
                    location.connections
                )
                ?
                location.connections
                :
                [];


            for(
                const connection of
                    connections
            )
            {

                if(
                    !connection
                    ||
                    !connection.location
                )
                {

                    continue;

                }


                if(
                    visited.has(
                        connection.location
                    )
                )
                {

                    continue;

                }


                if(
                    !this.isConnectionUsableAtStage(
                        connection,
                        stage,
                        state,
                        nextStack
                    )
                )
                {

                    continue;

                }


                queue.push(
                    connection.location
                );

            }

        }


        return false;

    }





    //--------------------------------
    // Location usability
    //--------------------------------

    isLocationUsableAtStage(
        location,
        stage,
        state = null,
        dependencyStack = new Set()
    )
    {

        if(
            !location
        )
        {

            return false;

        }


        //--------------------------------
        // Generated hard gates
        //--------------------------------

        const gates =
            location.gates
            ||
            {};


        const hardGates =
            Array.isArray(
                gates.hard
            )
            ?
            gates.hard
            :
            [];


        for(
            const gate of
                hardGates
        )
        {
        
            const requirement =
                this.getGateRequirement(
                    gate
                );
            
            
            if(
                !this.isRequirementSatisfied(
                    requirement,
                    stage,
                    state,
                    dependencyStack
                )
            )
            {
            
                return false;
            
            }
        
        }


        //--------------------------------
        // Progression hard gates
        //--------------------------------

        const locationId =
            String(
                location.id
                ||
                ""
            ).toUpperCase();


        const progressionRules =
            this.progressionRulesByLocation[
                locationId
            ]
            ||
            [];


        for(
            const rule of
                progressionRules
        )
        {

            const type =
                String(
                    rule?.type
                    ||
                    ""
                )
                .toUpperCase();


            if(
                type !==
                "HARD_GATE"
            )
            {

                continue;

            }


            if(
                !this.isRequirementSatisfied(
                    rule.requirement,
                    stage,
                    state,
                    dependencyStack
                )
            )
            {

                return false;

            }

        }


        //--------------------------------
        // Other progression rules
        //--------------------------------

        const rules =
            this.progressionRulesByLocation[
                location.id
            ]
            ||
            [];


        for(
            const rule of
                rules
        )
        {

            const type =
                String(
                    rule?.type
                    ||
                    ""
                )
                .toUpperCase();


            //--------------------------------
            // Completion rules do not block
            // physical entry.
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


            //--------------------------------
            // No requirement means no gate.
            //--------------------------------

            if(
                !rule.requirement
            )
            {

                continue;

            }


            if(
                !this.isRequirementSatisfied(
                    rule.requirement,
                    stage,
                    state,
                    dependencyStack
                )
            )
            {

                return false;

            }

        }


        return true;

    }





    //--------------------------------
    // Extract requirement payload
    //--------------------------------
    //
    // Generated location gates contain metadata
    // alongside the actual requirement:
    //
    // {
    //     type:
    //         "HARD_GATE",
    //
    //     requirement:
    //     {
    //         badges:
    //         [...]
    //     }
    // }
    //
    // The evaluator must receive the nested
    // requirement, not the gate metadata object.
    //--------------------------------

    getGateRequirement(
        gate
    )
    {

        if(
            gate
            &&
            typeof gate ===
                "object"
            &&
            Object.prototype.hasOwnProperty.call(
                gate,
                "requirement"
            )
        )
        {

            return gate.requirement;

        }


        return gate;

    }





    //--------------------------------
    // Connection usability
    //--------------------------------

    isConnectionUsableAtStage(
        connection,
        stage,
        state = null,
        dependencyStack = new Set()
    )
    {

        if(
            !connection
        )
        {

            return false;

        }


        const requirements =
            Array.isArray(
                connection.requirements
            )
            ?
            connection.requirements
            :
            [];


        for(
            const requirement of
                requirements
        )
        {

            if(
                !this.isRequirementSatisfied(
                    requirement,
                    stage,
                    state,
                    dependencyStack
                )
            )
            {

                return false;

            }

        }


        return true;

    }





    //--------------------------------
    // Requirement evaluation
    //--------------------------------

    isRequirementSatisfied(
        requirement,
        stage,
        state,
        dependencyStack
    )
    {

        if(
            !this.requirementEvaluator
            ||
            typeof this.requirementEvaluator.isSatisfied !==
                "function"
        )
        {

            return true;

        }


        return this.requirementEvaluator.isSatisfied(

            requirement,

            stage,

            state,

            dependencyStack

        );

    }





    //--------------------------------
    // Starting locations
    //--------------------------------

    getStartingLocations()
    {

        const candidates =
        [
            "MAP_PALLET_TOWN",
            "MAP_ROUTE1"
        ];


        return candidates.filter(

            location =>
                Boolean(
                    this.locations[
                        location
                    ]
                )

        );

    }


}


module.exports =
    ProgressionLocationAccessResolver;
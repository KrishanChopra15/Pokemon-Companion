/**
 * Pokémon Companion
 * Progression Requirement Evaluator
 *
 * Evaluates compound progression requirements.
 *
 * Responsibilities:
 * - Evaluate named requirements.
 * - Evaluate badges.
 * - Evaluate key items.
 * - Evaluate abilities.
 * - Evaluate HMs.
 * - Evaluate story flags.
 * - Evaluate location dependencies.
 *
 * Does NOT:
 * - Define FireRed rules.
 * - Build stage state.
 * - Build location graphs.
 * - Store player state.
 */

"use strict";


class ProgressionRequirementEvaluator {


    constructor(
        handlers = {}
    )
    {

        this.handlers =
            handlers;

    }





    //--------------------------------
    // Main requirement check
    //--------------------------------

    isSatisfied(
        requirement,
        stage,
        state = null,
        dependencyStack = new Set()
    )
    {

        if(
            !requirement
        )
        {

            return true;

        }


        //--------------------------------
        // String requirement
        //--------------------------------

        if(
            typeof requirement ===
                "string"
        )
        {

            return this.call(

                "isNamedRequirementSatisfiedAtStage",

                requirement,

                stage,

                state

            );

        }


        if(
            typeof requirement !==
                "object"
        )
        {

            return true;

        }


        //--------------------------------
        // ANY OF
        //
        // At least one complete
        // requirement must be satisfied.
        //--------------------------------

        if(
            Array.isArray(
                requirement.anyOf
            )
        )
        {

            return requirement.anyOf.some(

                option =>

                    this.isSatisfied(

                        option,

                        stage,

                        state,

                        dependencyStack

                    )

            );

        }


        const checks = [];


        //--------------------------------
        // Named requirement
        //--------------------------------

        const type =
            requirement.type
            ||
            requirement.kind
            ||
            requirement.requirement;


        if(
            type
        )
        {

            checks.push(

                this.call(

                    "isNamedRequirementSatisfiedAtStage",

                    type,

                    stage,

                    state

                )

            );

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

            checks.push(

                requirement.abilities.every(

                    ability =>

                        this.call(

                            "isNamedRequirementSatisfiedAtStage",

                            ability,

                            stage,

                            state

                        )

                )

            );

        }


        //--------------------------------
        // HMs
        //--------------------------------

        if(
            Array.isArray(
                requirement.hms
            )
        )
        {

            checks.push(

                requirement.hms.every(

                    hm =>

                        this.call(

                            "isNamedRequirementSatisfiedAtStage",

                            hm,

                            stage,

                            state

                        )

                )

            );

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

            checks.push(

                this.call(

                    "areBadgesSatisfiedAtStage",

                    requirement.badges,

                    stage,

                    state

                )

            );

        }


        //--------------------------------
        // Key items
        //--------------------------------

        if(
            Array.isArray(
                requirement.keyItems
            )
        )
        {

            checks.push(

                this.call(

                    "areKeyItemsSatisfiedAtStage",

                    requirement.keyItems,

                    stage,

                    state

                )

            );

        }


        //--------------------------------
        // Single badge
        //--------------------------------

        if(
            requirement.badge
        )
        {

            checks.push(

                this.call(

                    "isBadgeSatisfiedAtStage",

                    requirement.badge,

                    stage,

                    state

                )

            );

        }


        //--------------------------------
        // Single key item
        //--------------------------------

        if(
            requirement.keyItem
        )
        {

            checks.push(

                this.call(

                    "isKeyItemSatisfiedAtStage",

                    requirement.keyItem,

                    stage,

                    state

                )

            );

        }


        //--------------------------------
        // Story flags
        //--------------------------------

        if(
            Array.isArray(
                requirement.storyFlags
            )
        )
        {

            checks.push(

                requirement.storyFlags.every(

                    flag =>

                        this.call(

                            "isStoryFlagSatisfiedAtStage",

                            flag,

                            stage,

                            state

                        )

                )

            );

        }


        //--------------------------------
        // Location dependencies
        //--------------------------------

        if(
            Array.isArray(
                requirement.locations
            )
        )
        {

            const stack =
                dependencyStack instanceof Set
                    ?
                    dependencyStack
                    :
                    new Set();


            checks.push(

                requirement.locations.every(

                    locationId => {

                        return this.call(

                            "canAccessLocationAtStage",

                            locationId,

                            stage,

                            state,

                            stack

                        );

                    }

                )

            );

        }


        //--------------------------------
        // Unknown empty object
        //--------------------------------

        if(
            checks.length === 0
        )
        {

            return true;

        }


        //--------------------------------
        // ALL categories are AND
        //--------------------------------

        return checks.every(
            Boolean
        );

    }





    //--------------------------------
    // Safe handler call
    //--------------------------------

    call(
        name,
        ...args
    )
    {

        const handler =
            this.handlers[name];


        if(
            typeof handler !==
                "function"
        )
        {

            return false;

        }


        return handler(
            ...args
        );

    }


}


module.exports =
    ProgressionRequirementEvaluator;
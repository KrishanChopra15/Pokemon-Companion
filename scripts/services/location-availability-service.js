/**
 * Pokémon Companion
 * Location Availability Service
 *
 * Determines whether locations are accessible during progression.
 *
 * Responsibilities:
 * - Check location story access.
 * - Check badge requirements.
 * - Check HM requirements.
 * - Explain location restrictions.
 *
 * Does NOT:
 * - Check Pokémon encounters.
 * - Handle evolution.
 * - Recommend teams.
 * - Track player state.
 */

"use strict";





class LocationAvailabilityService {



    constructor(
        locationDatabase = [],
        progressionRules = []
    )
    {


        this.locations =
            locationDatabase;


        this.rules =
            progressionRules;


    }









    //--------------------------------
    // Main check
    //--------------------------------


    isAvailable(
        location,
        context = {}
    )
    {


        const rule =
            this.getLocationRule(

                location

            );



        if(
            !rule
        )
        {

            return {

                available:true,

                status:"AVAILABLE",

                location,

                reason:null

            };

        }








        const requirement =
            rule.requirement;



        const result =
            this.checkRequirements(

                requirement,

                context

            );



        if(
            !result.available
        )
        {

            return {

                available:false,

                status:"LOCKED",

                location,

                reason:
                    result.reason,

                missingRequirements:
                    result.missingRequirements

            };

        }








        return {

            available:true,

            status:"AVAILABLE",

            location,

            reason:null

        };


    }









    //--------------------------------
    // Find location rule
    //--------------------------------


    getLocationRule(
        location
    )
    {


        return this.rules.find(

            rule =>

                rule.location === location

        );


    }









    //--------------------------------
    // Check requirements
    //--------------------------------


    checkRequirements(
        requirement = {},
        context = {}
    )
    {


        const missing = [];








        //--------------------------------
        // Badge requirements
        //--------------------------------


        if(
            requirement.badges
        )
        {


            requirement.badges.forEach(

                badge =>

                {

                    if(
                        !context.badges
                        ||
                        !context.badges.includes(
                            badge
                        )
                    )
                    {

                        missing.push(

                            badge

                        );

                    }

                }

            );

        }








        //--------------------------------
        // Key item requirements
        //--------------------------------


        if(
            requirement.keyItems
        )
        {


            requirement.keyItems.forEach(

                item =>

                {

                    if(
                        !context.keyItems
                        ||
                        !context.keyItems.includes(
                            item
                        )
                    )
                    {

                        missing.push(

                            item

                        );

                    }

                }

            );

        }








        //--------------------------------
        // Story flags
        //--------------------------------


        if(
            requirement.flags
        )
        {


            requirement.flags.forEach(

                flag =>

                {

                    if(
                        !context.flags
                        ||
                        !context.flags.includes(
                            flag
                        )
                    )
                    {

                        missing.push(

                            flag

                        );

                    }

                }

            );

        }








        if(
            missing.length > 0
        )
        {

            return {

                available:false,

                reason:

                    this.generateReason(

                        missing

                    ),


                missingRequirements:

                    missing

            };

        }








        return {

            available:true,

            missingRequirements:[]

        };


    }









    //--------------------------------
    // Generate explanation
    //--------------------------------


    generateReason(
        missing
    )
    {


        return (

            "Location unavailable. Missing requirements: "

            +

            missing.join(
                ", "
            )

        );


    }









    //--------------------------------
    // Explain
    //--------------------------------


    explain(
        location,
        context={}
    )
    {


        return this.isAvailable(

            location,

            context

        );


    }



}





module.exports =
    LocationAvailabilityService;
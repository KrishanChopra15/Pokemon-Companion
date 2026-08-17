/**
 * Pokémon Companion
 * Pokémon Obtainability Service
 *
 * Determines whether a Pokémon can actually be obtained
 * during the current progression.
 *
 * Responsibilities:
 * - Combine source resolver.
 * - Check location access.
 * - Check progression restrictions.
 * - Respect starter selection.
 * - Support trade overrides.
 * - Explain blocked acquisition paths.
 *
 * Does NOT:
 * - Recommend teams.
 * - Handle battles.
 * - Calculate damage.
 * - Handle moves.
 */

"use strict";





class PokemonObtainabilityService {



    constructor(
        sourceResolver,
        locationService,
        availabilityService = null,
        starterSelectionService = null
    )
    {


        this.sources =
            sourceResolver;


        this.locations =
            locationService;


        this.availability =
            availabilityService;


        this.starterSelection =
            starterSelectionService;


    }









    //--------------------------------
    // Main check
    //--------------------------------


    canObtain(
        species,
        context = {}
    )
    {


        const sourceData =
            this.sources.resolve(

                species

            );



        if(
            !sourceData.sources.length
        )
        {

            return {


                available:false,


                status:"UNKNOWN",


                species,


                reason:
                "No known acquisition method."

            };

        }








        const results =
            sourceData.sources.map(

                source =>

                    this.checkSource(

                        species,

                        source,

                        context

                    )

            );








        const availableSource =
            results.find(

                result =>

                    result.available

            );








        if(
            availableSource
        )
        {

            return {


                available:true,


                status:"AVAILABLE",


                species,


                source:

                    availableSource.source,


                details:

                    availableSource


            };

        }








        return {


            available:false,


            status:"LOCKED",


            species,


            reason:

                results[0].reason,


            missingRequirements:

                [

                    ...

                    new Set(

                        results.flatMap(

                            result =>

                                result.missingRequirements || []

                        )

                    )

                ],


            sources:results


        };


    }









    //--------------------------------
    // Check individual source
    //--------------------------------


    checkSource(
        species,
        source,
        context
    )
    {


        //--------------------------------
        // Wild encounter
        //--------------------------------


        if(
            source.method === "WILD"
        )
        {


            const locationResult =

                this.locations.isAvailable(

                    source.location,

                    context

                );



            if(
                !locationResult.available
            )
            {

                return {


                    available:false,


                    source:"WILD",


                    reason:

                        locationResult.reason,


                    missingRequirements:

                        locationResult.missingRequirements


                };

            }



            return {


                available:true,


                source:"WILD",


                location:

                    source.location


            };


        }









        //--------------------------------
        // Starter
        //--------------------------------


        if(
            source.method === "STARTER"
        )
        {


            if(
                !this.starterSelection
                ||
                !context.playerState
            )
            {

                return {


                    available:false,


                    source:"STARTER",


                    reason:
                    "Starter selection unavailable."


                };

            }








            const allowed =

                this.starterSelection.belongsToSelectedFamily(

                    context.playerState,

                    species

                );








            if(
                allowed
            )
            {

                return {


                    available:true,


                    source:"STARTER"


                };

            }








            return {


                available:false,


                source:"STARTER",


                reason:
                "Different starter family selected."


            };


        }









        //--------------------------------
        // Evolution
        //--------------------------------


        if(
            source.method === "EVOLUTION"
        )
        {


            return {


                available:true,


                source:"EVOLUTION",


                requirement:

                    source.requirement


            };


        }









        //--------------------------------
        // Trade
        //--------------------------------


        if(
            source.method === "TRADE"
        )
        {


            if(
                context.allowTrade === true
            )
            {

                return {


                    available:true,


                    source:"TRADE"


                };

            }








            return {


                available:false,


                source:"TRADE",


                reason:
                "Requires trading."


            };


        }









        return {


            available:false,


            source:

                source.method,


            reason:

            "Unknown acquisition method."


        };


    }









    //--------------------------------
    // Explain
    //--------------------------------


    explain(
        species,
        context={}
    )
    {


        return this.canObtain(

            species,

            context

        );


    }



}





module.exports =
    PokemonObtainabilityService;
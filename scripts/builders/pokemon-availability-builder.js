/**
 * Pokémon Companion
 * Pokémon Availability Builder
 *
 * Builds Pokémon availability database.
 *
 * Responsibilities:
 * - Combine encounter data.
 * - Combine evolution requirements.
 * - Combine item requirements.
 * - Create availability rules.
 * - Generate full progression availability.
 * - Track earliest obtainable stage.
 * - Track starter selection restrictions.
 *
 * Does NOT:
 * - Recommend teams.
 * - Handle battles.
 * - Calculate damage.
 * - Execute progression.
 */

"use strict";


const EvolutionRequirementService =
    require("../services/evolution-requirement-service");





class PokemonAvailabilityBuilder {



    constructor(
        pokemonDatabase,
        encounterDatabase,
        evolutionDatabase,
        itemDatabase = null,
        progressionRules = null,
        starterSelectionService = null,
        playerState = null
    )
    {


        this.pokemon =
            pokemonDatabase || [];


        this.encounters =
            encounterDatabase || [];


        this.evolutions =
            evolutionDatabase || [];


        this.items =
            itemDatabase || null;


        this.starterSelection =
            starterSelectionService || null;


        this.playerState =
            playerState;



        this.evolutionService =
            new EvolutionRequirementService(

                this.evolutions

            );



        this.rules =
            progressionRules ||

            {

                BROCK:
                {
                    maxReasonableLevel:20
                },


                MISTY:
                {
                    maxReasonableLevel:30
                },


                LT_SURGE:
                {
                    maxReasonableLevel:35
                },


                ERIKA:
                {
                    maxReasonableLevel:40
                },


                KOGA:
                {
                    maxReasonableLevel:45
                },


                SABRINA:
                {
                    maxReasonableLevel:50
                },


                BLAINE:
                {
                    maxReasonableLevel:55
                },


                GIOVANNI:
                {
                    maxReasonableLevel:55
                },


                ELITE_FOUR:
                {
                    maxReasonableLevel:60
                },


                CHAMPION:
                {
                    maxReasonableLevel:65
                },


                POST_GAME:
                {
                    maxReasonableLevel:100
                }

            };

    }









    //--------------------------------
    // Build database
    //--------------------------------


    build()
    {


        return this.pokemon.map(

            pokemon =>

                this.buildPokemonAvailability(

                    pokemon

                )

        );


    }









    //--------------------------------
    // Build single Pokemon
    //--------------------------------


    buildPokemonAvailability(
        pokemon
    )
    {


        const evolution =

            this.evolutionService.getEvolutionSource(

                pokemon.constant

            );



        return {


            species:

                pokemon.name,



            constant:

                pokemon.constant,



            starterRestriction:

                this.getStarterRestriction(

                    pokemon.name

                ),



            sources:

                this.getSources(

                    pokemon,

                    evolution

                ),



            locations:

                this.getLocations(

                    pokemon.name

                ),



            availability:

                this.calculateAvailability(

                    pokemon,

                    evolution

                ),



            progression:

                this.calculateProgression(

                    pokemon

                )


        };


    }









    //--------------------------------
    // Sources
    //--------------------------------


    getSources(
        pokemon,
        evolution
    )
    {


        const sources = [];



        if(
            this.isStarter(
                pokemon.name
            )
        )
        {

            sources.push({

                method:
                    "STARTER"

            });

        }



        if(
            this.getLocations(

                pokemon.name

            ).length > 0
        )
        {

            sources.push({

                method:
                    "WILD"

            });

        }



        if(
            evolution
        )
        {

            sources.push({

                method:
                    "EVOLUTION",


                from:
                    evolution.from,


                requirement:
                    evolution.requirement


            });

        }



        return sources;


    }









    //--------------------------------
    // Locations
    //--------------------------------


    getLocations(
        species
    )
    {


        return [

            ...new Set(

                this.encounters

                    .filter(

                        encounter =>

                            encounter.species === species

                    )

                    .map(

                        encounter =>

                            encounter.location

                    )

            )

        ];


    }









    //--------------------------------
    // Availability
    //--------------------------------


    calculateAvailability(
        pokemon,
        evolution
    )
    {


        return {


            starter:

                this.isStarter(

                    pokemon.name

                ),



            starterLine:

                this.isStarterLine(

                    pokemon.name

                ),



            wild:

                this.getLocations(

                    pokemon.name

                ).length > 0,



            evolution:

                Boolean(

                    evolution

                ),



            trade:false,



            item:

                this.hasItemEvolution(

                    evolution

                )


        };


    }









    //--------------------------------
    // Starter restriction
    //--------------------------------


    getStarterRestriction(
        species
    )
    {


        if(
            !this.starterSelection
            ||
            !this.playerState
        )
        {

            return {

                blocked:false,

                reason:null

            };

        }








        const owned =

            this.playerState.ownedPokemon

            &&

            this.playerState.ownedPokemon.includes(

                species

            );








        if(
            owned
        )
        {

            return {

                blocked:false,

                reason:
                    "Already owned"

            };

        }








        const allowed =

            this.starterSelection.isAllowed(

                this.playerState,

                species

            );








        if(
            allowed
        )
        {

            return {

                blocked:false,

                reason:null

            };

        }








        return {

            blocked:true,

            reason:
                "Different starter selected"

        };


    }









    //--------------------------------
    // Progression
    //--------------------------------


    calculateProgression(
        pokemon
    )
    {


        const stages =
        [

            "BROCK",

            "MISTY",

            "LT_SURGE",

            "ERIKA",

            "KOGA",

            "SABRINA",

            "BLAINE",

            "GIOVANNI",

            "ELITE_FOUR",

            "CHAMPION",

            "POST_GAME"

        ];



        const progression = {};



        stages.forEach(

            stage =>

            {

                progression[stage] =

                    this.canExistByStage(

                        pokemon,

                        stage

                    );

            }

        );



        return progression;


    }









    //--------------------------------
    // Stage availability
    //--------------------------------


    canExistByStage(
        pokemon,
        stage
    )
    {


        if(
            pokemon.name === "MEWTWO"
        )
        {

            return stage === "POST_GAME";

        }








        if(
            this.isStarter(

                pokemon.name

            )
        )
        {

            return true;

        }








        if(
            this.getLocations(

                pokemon.name

            ).length > 0
        )
        {

            return true;

        }








        const evolution =

            this.evolutionService.getEvolutionSource(

                pokemon.constant

            );








        if(
            evolution
        )
        {

            const result =

                this.evolutionService.canEvolveBeforeStage(

                    pokemon.constant,

                    this.rules[stage]

                );



            return result.available;

        }








        return false;


    }









    //--------------------------------
    // Starter
    //--------------------------------


    isStarter(
        name
    )
    {


        return [

            "BULBASAUR",

            "CHARMANDER",

            "SQUIRTLE"

        ]

        .includes(

            name

        );


    }









    //--------------------------------
    // Starter line
    //--------------------------------


    isStarterLine(
        name
    )
    {


        return [

            "BULBASAUR",
            "IVYSAUR",
            "VENUSAUR",

            "CHARMANDER",
            "CHARMELEON",
            "CHARIZARD",

            "SQUIRTLE",
            "WARTORTLE",
            "BLASTOISE"

        ]

        .includes(

            name

        );


    }









    //--------------------------------
    // Item evolution
    //--------------------------------


    hasItemEvolution(
        evolution
    )
    {


        if(
            !evolution
        )
        {

            return false;

        }



        return (

            evolution.requirement

            &&

            evolution.requirement.method ===

            "EVO_ITEM"

        );


    }









    //--------------------------------
    // Obtainable before gym
    //--------------------------------


    getObtainableBeforeGym(
        gym
    )
    {


        return this.build()

            .filter(

                pokemon =>

                    pokemon.progression[gym]

                    &&

                    !pokemon.starterRestriction.blocked

            );


    }



}





module.exports =
    PokemonAvailabilityBuilder;
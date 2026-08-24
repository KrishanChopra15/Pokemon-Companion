/**
 * Pokémon Companion
 * Move Mechanics Service
 *
 * Handles special move transformations.
 *
 * Responsibilities:
 * - Resolve Nature Power.
 * - Resolve Hidden Power.
 * - Resolve Weather Ball.
 * - Resolve special move behavior.
 * - Handle move transformations before execution.
 *
 * Does NOT:
 * - Calculate damage.
 * - Apply damage.
 * - Execute turns.
 * - Handle battle state.
 */

"use strict";





class MoveMechanicsService {



    constructor(
        game = "firered",
        moveDatabaseService = null
    )
    {


        this.game =
            game;


        this.moveDatabase =
            moveDatabaseService;


        //--------------------------------
        // Gen 3 Hidden Power Types
        //--------------------------------


        this.hiddenPowerTypes =
        [

            "FIGHTING",

            "FLYING",

            "POISON",

            "GROUND",

            "ROCK",

            "BUG",

            "GHOST",

            "STEEL",

            "FIRE",

            "WATER",

            "GRASS",

            "ELECTRIC",

            "PSYCHIC",

            "ICE",

            "DRAGON",

            "DARK"

        ];





        //--------------------------------
        // Weather Ball
        // Weather -> Type + Power
        //--------------------------------


        this.weatherBallMap =
        {


            RAIN:
            {

                type:
                    "WATER",

                power:
                    100

            },



            SUN:
            {

                type:
                    "FIRE",

                power:
                    100

            },



            HAIL:
            {

                type:
                    "ICE",

                power:
                    100

            },



            SANDSTORM:
            {

                type:
                    "ROCK",

                power:
                    100

            }


        };





        //--------------------------------
        // Magnitude
        // Random power move
        //--------------------------------


        this.magnitudeTable =
        {
        
        
            4:
            {
            
                power:
                    10
            
            },
        
        
            5:
            {
            
                power:
                    30
            
            },
        
        
            6:
            {
            
                power:
                    50
            
            },
        
        
            7:
            {
            
                power:
                    70
            
            },
        
        
            8:
            {
            
                power:
                    90
            
            },
        
        
            9:
            {
            
                power:
                    110
            
            },
        
        
            10:
            {
            
                power:
                    150
            
            }
        
        
        };





        //--------------------------------
        // Gen 3 Nature Power
        //--------------------------------
        //
        // Battle Environment -> Move
        //
        //--------------------------------


        this.naturePowerMap =
        {


            BUILDING:
            {

                constant:
                    "MOVE_SWIFT"

            },


            PLAIN:
            {

                constant:
                    "MOVE_SWIFT"

            },


            LINK_BATTLE:
            {

                constant:
                    "MOVE_SWIFT"

            },





            TALL_GRASS:
            {

                constant:
                    "MOVE_STUN_SPORE"

            },


            LONG_GRASS:
            {

                constant:
                    "MOVE_RAZOR_LEAF"

            },





            ASH:
            {

                constant:
                    "MOVE_EARTHQUAKE"

            },


            SAND:
            {

                constant:
                    "MOVE_EARTHQUAKE"

            },





            CAVE:
            {

                constant:
                    "MOVE_SHADOW_BALL"

            },





            ROCK:
            {

                constant:
                    "MOVE_ROCK_SLIDE"

            },





            POND:
            {

                constant:
                    "MOVE_BUBBLEBEAM"

            },


            SEA:
            {

                constant:
                    "MOVE_SURF"

            },


            UNDERWATER:
            {

                constant:
                    "MOVE_HYDRO_PUMP"

            }


        };


    }









    //--------------------------------
    // Resolve Nature Power
    //--------------------------------


    resolveNaturePower(
        environment
    )
    {


        const terrain =
            String(environment)
            .toUpperCase();





        return (

            this.naturePowerMap[terrain]

            ||

            this.naturePowerMap.PLAIN

        );


    }









    //--------------------------------
    // Resolve Hidden Power
    //--------------------------------


    resolveHiddenPower(
        pokemon
    )
    {


        return {

            constant:
                "MOVE_HIDDEN_POWER",


            type:

                this.calculateHiddenPowerType(
                    pokemon
                ),


            power:

                this.calculateHiddenPowerPower(
                    pokemon
                )

        };


    }









    //--------------------------------
    // Hidden Power Type
    // Generation 3 Formula
    //--------------------------------


    calculateHiddenPowerType(
        pokemon
    )
    {


        const ivs =
            pokemon.ivs;



        if(
            !ivs
        )
        {

            return "DARK";

        }





        const value =

        (

            (

                (ivs.hp & 1)

                |

                ((ivs.attack & 1) << 1)

                |

                ((ivs.defense & 1) << 2)

                |

                ((ivs.speed & 1) << 3)

                |

                ((ivs.spAttack & 1) << 4)

                |

                ((ivs.spDefense & 1) << 5)

            )

            *

            15

        )

        /

        63;





        return this.hiddenPowerTypes[

            Math.floor(
                value
            )

        ];


    }









    //--------------------------------
    // Hidden Power Base Power
    // Generation 3 Formula
    //--------------------------------


    calculateHiddenPowerPower(
        pokemon
    )
    {


        const ivs =
            pokemon.ivs;



        if(
            !ivs
        )
        {

            return 30;

        }





        const value =

        (

            (

                ((Math.floor(ivs.hp / 2) & 1))

                |

                ((Math.floor(ivs.attack / 2) & 1) << 1)

                |

                ((Math.floor(ivs.defense / 2) & 1) << 2)

                |

                ((Math.floor(ivs.speed / 2) & 1) << 3)

                |

                ((Math.floor(ivs.spAttack / 2) & 1) << 4)

                |

                ((Math.floor(ivs.spDefense / 2) & 1) << 5)

            )

            *

            40

        )

        /

        63;





        return (

            Math.floor(
                value
            )

            +

            30

        );


    }









    //--------------------------------
    // Resolve Weather Ball
    //--------------------------------


    resolveWeatherBall(
        weather
    )
    {


        const currentWeather =
            weather
            ?
            String(weather).toUpperCase()
            :
            null;




        if(
            currentWeather
            &&
            this.weatherBallMap[currentWeather]
        )
        {


            return {

                constant:
                    "MOVE_WEATHER_BALL",


                type:
                    this.weatherBallMap[currentWeather].type,


                power:
                    this.weatherBallMap[currentWeather].power

            };


        }






        return {

            constant:
                "MOVE_WEATHER_BALL",


            type:
                "NORMAL",


            power:
                50

        };


    }









    //--------------------------------
    // Resolve Magnitude
    //--------------------------------


    resolveMagnitude()
    {


        const roll =
            Math.random() * 100;



        let magnitude;





        if(
            roll < 5
        )
        {

            magnitude = 4;

        }

        else if(
            roll < 15
        )
        {

            magnitude = 5;

        }

        else if(
            roll < 35
        )
        {

            magnitude = 6;

        }

        else if(
            roll < 65
        )
        {

            magnitude = 7;

        }

        else if(
            roll < 85
        )
        {

            magnitude = 8;

        }

        else if(
            roll < 95
        )
        {

            magnitude = 9;

        }

        else
        {

            magnitude = 10;

        }





        return {

            constant:
                "MOVE_MAGNITUDE",


            magnitude,


            power:
                this.magnitudeTable[magnitude].power

        };


    }









    //--------------------------------
    // Resolve Return
    //--------------------------------


    resolveReturn(
        pokemon
    )
    {


        const friendship =
            pokemon.friendship
            ??
            70;



        const power =
            Math.floor(

                friendship *

                10

                /

                25

            );



        return {

            constant:
                "MOVE_RETURN",

            power:
                Math.min(
                    102,
                    power
                )

        };


    }









    //--------------------------------
    // Resolve Frustration
    //--------------------------------


    resolveFrustration(
        pokemon
    )
    {


        const friendship =
            pokemon.friendship
            ??
            70;



        const power =
            Math.floor(

                (

                    255 -

                    friendship

                )

                *

                10

                /

                25

            );



        return {

            constant:
                "MOVE_FRUSTRATION",

            power:
                Math.min(
                    102,
                    power
                )

        };


    }









    //--------------------------------
    // Resolve move data
    //--------------------------------


    resolveMoveData(
        move
    )
    {


        if(
            !move
            ||
            !this.moveDatabase
        )
        {

            return move;

        }



        const data =
            this.moveDatabase.getMove(

                move.constant

            );



        if(
            !data
        )
        {

            return move;

        }




        return {

            ...data,

            ...move

        };


    }









    //--------------------------------
    // Resolve move transformation
    //--------------------------------


    resolveMove(
        move,
        context = {}
    )
    {


        if(
            !move
        )
        {

            return null;

        }








        //--------------------------------
        // Nature Power
        //--------------------------------


        if(

            move.constant ===
            "MOVE_NATURE_POWER"

        )
        {

            return this.resolveMoveData(
            
                this.resolveNaturePower(
                
                    context.environment
                
                )
            
            );

        }








        //--------------------------------
        // Hidden Power
        //--------------------------------


        if(

            move.constant ===
            "MOVE_HIDDEN_POWER"

        )
        {

            return this.resolveHiddenPower(

                context.pokemon

            );

        }








        //--------------------------------
        // Weather Ball
        //--------------------------------


        if(

            move.constant ===
            "MOVE_WEATHER_BALL"

        )
        {

            return this.resolveMoveData(
            
                this.resolveWeatherBall(
                
                    context.weather
                
                )
            
            );

        }








        //--------------------------------
        // Magnitude
        //--------------------------------


        if(
        
            move.constant ===
            "MOVE_MAGNITUDE"
        
        )
        {
        
            return this.resolveMoveData(
            
                this.resolveMagnitude()
            
            );
        
        }








        //--------------------------------
        // Return
        //--------------------------------


        if(
        
            move.constant ===
            "MOVE_RETURN"
        
        )
        {
        
            return this.resolveMoveData(
            
                this.resolveReturn(
                
                    context.pokemon
                
                )
            
            );
        
        }







        //--------------------------------
        // Frustration
        //--------------------------------


        if(
        
            move.constant ===
            "MOVE_FRUSTRATION"
        
        )
        {
        
            return this.resolveMoveData(
            
                this.resolveFrustration(
                
                    context.pokemon
                
                )
            
            );
        
        }








        //--------------------------------
        // Other moves unchanged
        //--------------------------------


        return this.resolveMoveData(
            move
        );


    }









    //--------------------------------
    // Get Nature Power environments
    //--------------------------------


    getNaturePowerEnvironments()
    {

        return Object.keys(

            this.naturePowerMap

        );


    }



}





module.exports =
    MoveMechanicsService;
/**
 * Pokémon Companion
 * Weather Service
 *
 * Handles battle weather.
 *
 * Responsibilities:
 * - Set weather.
 * - Remove weather.
 * - Track weather duration.
 * - Check active weather.
 * - Handle weather suppression.
 * - Apply weather turn effects.
 * - Modify weather affected moves.
 *
 * Does NOT:
 * - Calculate damage.
 * - Execute moves.
 * - Handle abilities directly.
 */

"use strict";





class WeatherService {



    constructor()
    {


        this.weatherTypes =
        {


            RAIN:
            {

                waterMultiplier:
                    1.5,


                fireMultiplier:
                    0.5

            },





            SUN:
            {

                fireMultiplier:
                    1.5,


                waterMultiplier:
                    0.5

            },





            SANDSTORM:
            {

                damageFraction:
                    1 / 16

            },





            HAIL:
            {

                damageFraction:
                    1 / 16

            }



        };


    }









    //--------------------------------
    // Set weather
    //--------------------------------


    setWeather(
        battle,
        weather,
        source = "MOVE",
        turns = 5
    )
    {


        if(
            !this.weatherTypes[weather]
        )
        {

            return {

                success:false,

                reason:
                    "Unknown weather"

            };

        }





        battle.weather =
        {

            type:
                weather,


            turns,


            source


        };





        return {

            success:true,

            weather

        };


    }









    //--------------------------------
    // Clear weather
    //--------------------------------


    clearWeather(
        battle
    )
    {


        battle.weather =
            null;



        return {

            success:true

        };


    }









    //--------------------------------
    // Get actual weather
    //--------------------------------


    getWeather(
        battle
    )
    {


        return (

            battle.weather

            ||

            null

        );


    }









    //--------------------------------
    // Get effective weather
    //--------------------------------


    getEffectiveWeather(
        battle
    )
    {


        const weather =
            this.getWeather(
                battle
            );



        if(
            !weather
        )
        {

            return null;

        }





        if(
            this.isWeatherSuppressed(
                battle
            )
        )
        {

            return null;

        }





        return weather;


    }









    //--------------------------------
    // Air Lock / Cloud Nine
    //--------------------------------


    isWeatherSuppressed(
        battle
    )
    {


        const activePokemon =
        [

            battle.player?.party?.[
                battle.player.active
            ],


            battle.opponent?.party?.[
                battle.opponent.active
            ]

        ];





        return activePokemon.some(

            pokemon =>


                pokemon &&

                (

                    pokemon.ability ===
                    "AIR_LOCK"

                    ||

                    pokemon.ability ===
                    "CLOUD_NINE"

                )

        );


    }









    //--------------------------------
    // Weather turn processing
    //--------------------------------


    processTurn(
        battle
    )
    {


        const weather =
            this.getEffectiveWeather(
                battle
            );



        if(
            !weather
        )
        {

            return {

                success:true,

                damage:[]

            };

        }



        const results = [];



        if(

            weather.type === "SANDSTORM"

            ||

            weather.type === "HAIL"

        )
        {


            const sides =
            [

                battle.player,

                battle.opponent

            ];



            for(
                const side of sides
            )
            {


                const pokemon =
                    side.party[
                        side.active
                    ];



                const damage =
                    this.applyWeatherDamage(

                        pokemon,

                        weather.type

                    );



                results.push(

                    {

                        pokemon:
                            pokemon.species,


                        damage

                    }

                );


            }


        }



        weather.turns--;



        if(
            weather.turns <= 0
        )
        {

            this.clearWeather(
                battle
            );

        }



        return {

            success:true,

            damage:results

        };


    }









    //--------------------------------
    // Weather damage
    //--------------------------------


    applyWeatherDamage(
        pokemon,
        weather
    )
    {


        if(
            !pokemon
        )
        {

            return 0;

        }





        if(
            weather === "SANDSTORM"

            &&

            this.isSandstormImmune(
                pokemon
            )
        )
        {

            return 0;

        }





        if(

            weather === "HAIL"

            &&

            pokemon.type?.includes("ICE")

        )
        {

            return 0;

        }





        const damage =
            Math.max(

                1,

                Math.floor(

                    pokemon.maxHP *

                    1 / 16

                )

            );



        pokemon.hp -= damage;



        if(
            pokemon.hp < 0
        )
        {

            pokemon.hp = 0;

        }



        return damage;


    }









    //--------------------------------
    // Sandstorm immunity
    //--------------------------------


    isSandstormImmune(
        pokemon
    )
    {


        return (

            pokemon.type?.includes("ROCK")

            ||

            pokemon.type?.includes("GROUND")

            ||

            pokemon.type?.includes("STEEL")

        );


    }









    //--------------------------------
    // Weather damage multiplier
    //--------------------------------


    getMoveMultiplier(
        weather,
        moveType
    )
    {


        if(
            !weather
        )
        {

            return 1;

        }



        const data =
            this.weatherTypes[
                weather.type
            ];



        if(
            !data
        )
        {

            return 1;

        }



        if(
            moveType === "FIRE"

            &&

            data.fireMultiplier
        )
        {

            return data.fireMultiplier;

        }



        if(
            moveType === "WATER"

            &&

            data.waterMultiplier
        )
        {

            return data.waterMultiplier;

        }



        return 1;


    }









    //--------------------------------
    // Solar Beam modifier
    //--------------------------------


    getSolarBeamModifier(
        weather
    )
    {


        if(
            !weather
        )
        {

            return {

                powerMultiplier:1,

                instant:false

            };

        }





        if(
            weather.type === "RAIN"

            ||

            weather.type === "SANDSTORM"

            ||

            weather.type === "HAIL"

        )
        {

            return {

                powerMultiplier:0.5,

                instant:false

            };

        }





        if(
            weather.type === "SUN"
        )
        {

            return {

                powerMultiplier:1,

                instant:true

            };

        }





        return {

            powerMultiplier:1,

            instant:false

        };


    }









    //--------------------------------
    // Thunder accuracy
    //--------------------------------


    getThunderAccuracy(
        weather
    )
    {


        if(

            weather

            &&

            weather.type === "RAIN"

        )
        {

            return 100;

        }



        if(

            weather

            &&

            weather.type === "SUN"

        )
        {

            return 50;

        }



        return 70;


    }









    //--------------------------------
    // Weather Ball
    //--------------------------------


    getWeatherBallData(
        weather
    )
    {


        if(
            !weather
        )
        {

            return {

                type:
                    "NORMAL",


                power:
                    50

            };

        }





        switch(
            weather.type
        )
        {


            case "RAIN":

                return {

                    type:
                        "WATER",

                    power:
                        100

                };



            case "SUN":

                return {

                    type:
                        "FIRE",

                    power:
                        100

                };



            case "HAIL":

                return {

                    type:
                        "ICE",

                    power:
                        100

                };



            case "SANDSTORM":

                return {

                    type:
                        "ROCK",

                    power:
                        100

                };


        }


    }









    //--------------------------------
    // Weather list
    //--------------------------------


    getAllWeather()
    {

        return Object.keys(

            this.weatherTypes

        );

    }



}





module.exports =
    WeatherService;
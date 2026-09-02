/**
 * Pokémon Companion
 * Pokémon Database Service
 *
 * Provides access to generated Pokémon databases.
 *
 * Responsibilities:
 * - Load Pokémon database.
 * - Query Pokémon data.
 * - Query evolution data.
 * - Query base friendship.
 * - Resolve all evolution options.
 *
 * Does NOT:
 * - Parse source files.
 * - Generate databases.
 * - Build databases.
 * - Execute evolution logic.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class PokemonDatabaseService {



    constructor(
        game
    )
    {

        this.game =
            game;


        const databasePath =
            path.join(

                __dirname,

                "../../database/generated",

                game,

                "pokemon-species.json"

            );





        this.pokemon =
            JSON.parse(

                fs.readFileSync(

                    databasePath,

                    "utf8"

                )

            );


    }









    //--------------------------------
    // Get Pokemon
    //--------------------------------


    getPokemon(
        name
    )
    {


        if(
            !name
        )
        {

            return null;

        }


        return this.pokemon.find(

            pokemon =>

                pokemon.name ===

                String(
                    name
                ).toUpperCase()

        )

        ||

        null;


    }









    //--------------------------------
    // Get Pokemon by ID
    //--------------------------------


    getPokemonById(
        id
    )
    {


        const formattedId =
            String(id)

            .padStart(

                4,

                "0"

            );





        return this.pokemon.find(

            pokemon =>

                pokemon.id === formattedId

        )

        ||

        null;


    }









    //--------------------------------
    // Get all Pokemon
    //--------------------------------


    getAllPokemon()
    {

        return this.pokemon;

    }









    //--------------------------------
    // Get base friendship
    //--------------------------------


    getBaseFriendship(
        species
    )
    {


        const pokemon =
            this.getPokemon(

                species

            );


        if(
            !pokemon
        )
        {

            return null;

        }


        const friendship =
            Number(
                pokemon.friendship
            );


        if(
            !Number.isFinite(
                friendship
            )
        )
        {

            return null;

        }


        return Math.min(

            255,

            Math.max(

                0,

                Math.floor(
                    friendship
                )

            )

        );

    }









    //--------------------------------
    // Get all evolution data
    //--------------------------------


    getEvolutions(
        species
    )
    {


        const pokemon =
            this.getPokemon(

                species

            );


        if(
            !pokemon
            ||
            !Array.isArray(
                pokemon.evolutions
            )
            ||
            pokemon.evolutions.length === 0
        )
        {

            return [];

        }


        return pokemon.evolutions

            .map(

                evolution =>

                    this.normalizeEvolution(
                        evolution
                    )

            )

            .filter(

                evolution =>

                    evolution !== null

            );

    }









    //--------------------------------
    // Get first evolution
    //
    // Preserves compatibility with
    // callers that expect one result.
    //--------------------------------


    getEvolution(
        species
    )
    {


        const evolutions =
            this.getEvolutions(
                species
            );


        return (

            evolutions[0]

            ||

            null

        );

    }









    //--------------------------------
    // Normalize evolution
    //--------------------------------


    normalizeEvolution(
        evolution
    )
    {


        if(
            !evolution
            ||
            !evolution.method
        )
        {

            return null;

        }


        const methodConstant =

            typeof evolution.method ===
                "string"

            ?

            evolution.method

            :

            evolution.method.constant;


        if(
            !methodConstant
        )
        {

            return null;

        }


        //--------------------------------
        // Target
        //--------------------------------

        const target =
            evolution.targetSpecies
            &&
            (
                evolution.targetSpecies.name
                ||
                evolution.targetSpecies
            );


        if(
            !target
        )
        {

            return null;

        }


        //--------------------------------
        // Normalize target name
        //--------------------------------

        const targetSpecies =
            String(
                target
            ).toUpperCase();


        //--------------------------------
        // Level evolution
        //--------------------------------

        if(
            methodConstant ===
                "EVO_LEVEL"
        )
        {

            return {

                method:
                    "LEVEL",

                value:
                    this.getEvolutionLevel(
                        evolution
                    ),

                target:
                    targetSpecies

            };

        }


        //--------------------------------
        // Stone/item evolution
        //--------------------------------

        if(
            methodConstant ===
                "EVO_ITEM"
        )
        {

            const item =
                this.getEvolutionItem(
                    evolution
                );


            return {

                method:
                    this.isEvolutionStone(
                        item
                    )

                    ?

                    "EVOLUTION_STONE"

                    :

                    "ITEM",

                value:
                    item,

                item:
                    item,

                target:
                    targetSpecies

            };

        }


        //--------------------------------
        // Trade evolution
        //--------------------------------

        if(
            methodConstant ===
                "EVO_TRADE"
        )
        {

            return {

                method:
                    "TRADE",

                value:
                    null,

                target:
                    targetSpecies

            };

        }


        //--------------------------------
        // Friendship evolution
        //
        // Generation III friendship
        // evolution requirement:
        // 220 friendship.
        //--------------------------------

        if(
            methodConstant ===
                "EVO_FRIENDSHIP"
        )
        {

            return {

                method:
                    "FRIENDSHIP",

                value:
                    220,

                target:
                    targetSpecies

            };

        }


        //--------------------------------
        // Friendship day evolution
        //
        // The friendship threshold is
        // still 220. Day handling is
        // resolved by EvolutionService.
        //--------------------------------

        if(
            methodConstant ===
                "EVO_FRIENDSHIP_DAY"
        )
        {

            return {

                method:
                    "FRIENDSHIP_DAY",

                value:
                    220,

                target:
                    targetSpecies

            };

        }


        //--------------------------------
        // Friendship night evolution
        //
        // The friendship threshold is
        // still 220. Night handling is
        // resolved by EvolutionService.
        //--------------------------------

        if(
            methodConstant ===
                "EVO_FRIENDSHIP_NIGHT"
        )
        {

            return {

                method:
                    "FRIENDSHIP_NIGHT",

                value:
                    220,

                target:
                    targetSpecies

            };

        }


        //--------------------------------
        // Trade with item
        //--------------------------------

        if(
            methodConstant ===
                "EVO_TRADE_ITEM"
        )
        {

            const item =
                this.getEvolutionItem(
                    evolution
                );


            return {

                method:
                    "TRADE_ITEM",

                value:
                    item,

                item:
                    item,

                target:
                    targetSpecies

            };

        }


        //--------------------------------
        // Unknown method
        //--------------------------------

        return null;

    }









    //--------------------------------
    // Get evolution level
    //--------------------------------


    getEvolutionLevel(
        evolution
    )
    {


        if(
            evolution.level !==
                undefined
        )
        {

            const level =
                Number(
                    evolution.level
                );


            if(
                Number.isFinite(
                    level
                )
            )
            {

                return level;

            }

        }


        if(
            evolution.parameter !==
                undefined
        )
        {

            const parameter =
                Number(
                    evolution.parameter
                );


            if(
                Number.isFinite(
                    parameter
                )
            )
            {

                return parameter;

            }

        }


        return null;

    }









    //--------------------------------
    // Get evolution item
    //--------------------------------


    getEvolutionItem(
        evolution
    )
    {


        if(
            evolution.item
        )
        {

            if(
                typeof evolution.item ===
                    "string"
            )
            {

                return evolution.item;

            }


            if(
                evolution.item.constant
            )
            {

                return evolution.item.constant;

            }


            if(
                evolution.item.name
            )
            {

                return evolution.item.name;

            }

        }


        if(
            evolution.parameter
        )
        {

            return evolution.parameter;

        }


        return null;

    }









    //--------------------------------
    // Check whether evolution item
    // is an evolution stone
    //--------------------------------


    isEvolutionStone(
        item
    )
    {


        if(
            !item
        )
        {

            return false;

        }


        const value =
            String(
                item
            )
            .trim()
            .toUpperCase();


        const stones =
        [

            "ITEM_FIRE_STONE",

            "ITEM_THUNDER_STONE",

            "ITEM_WATER_STONE",

            "ITEM_LEAF_STONE",

            "ITEM_MOON_STONE",

            "ITEM_SUN_STONE"

        ];


        return stones.includes(
            value
        );

    }









    //--------------------------------
    // Type search
    //--------------------------------


    getByType(
        type
    )
    {


        const searchType =
            type.toLowerCase();





        return this.getAllPokemon()

            .filter(

                pokemon =>


                    (

                        pokemon.type1 &&

                        pokemon.type1.name

                        .toLowerCase()

                        ===

                        searchType

                    )


                    ||

                    (

                        pokemon.type2 &&

                        pokemon.type2.name

                        .toLowerCase()

                        ===

                        searchType

                    )


            );


    }









    //--------------------------------
    // Ability search
    //--------------------------------


    getByAbility(
        ability
    )
    {


        const searchAbility =
            ability.toUpperCase();





        return this.getAllPokemon()

            .filter(

                pokemon =>


                    (

                        pokemon.ability1 &&

                        pokemon.ability1.name === searchAbility

                    )


                    ||

                    (

                        pokemon.ability2 &&

                        pokemon.ability2.name === searchAbility

                    )


            );


    }



}





module.exports =
    PokemonDatabaseService;
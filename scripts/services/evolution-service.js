/**
 * Pokémon Companion
 * Evolution Service
 *
 * Handles Pokémon evolution logic.
 *
 * Responsibilities:
 * - Check evolution requirements.
 * - Process level evolutions.
 * - Process item / evolution stone evolutions.
 * - Process friendship evolutions.
 * - Process trade evolutions.
 * - Process trade-with-item evolutions.
 * - Handle level-up evolution triggers.
 * - Handle friendship evolution requirements.
 * - Handle FireRed National Pokédex restrictions.
 * - Lookup evolution data.
 * - Return evolution results.
 *
 * Does NOT:
 * - Give EXP.
 * - Handle battles.
 * - Calculate stats.
 * - Manage storage.
 * - Load ROM data.
 */

"use strict";


class EvolutionService {



    constructor(
        evolutionDatabase = null,
        friendshipService = null
    )
    {

        this.database =
            evolutionDatabase;


        this.friendship =
            friendshipService;


        this.friendshipThreshold =
            220;


        this.fireRedNationalDexRequirement =
            true;


    }









    //--------------------------------
    // Automatic evolution check
    //--------------------------------


    checkEvolution(
        pokemon,
        context = {}
    )
    {

        if(
            !pokemon
        )
        {

            return {

                success:
                    false,

                reason:
                    "Missing Pokemon"

            };

        }


        //--------------------------------
        // Get every possible evolution
        //--------------------------------

        const evolutions =
            this.getEvolutions(
                pokemon.species
            );


        if(
            evolutions.length === 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "No evolution available"

            };

        }


        //--------------------------------
        // Find first eligible evolution
        //--------------------------------

        for(
            const evolution of
                evolutions
        )
        {

            const check =
                this.canEvolve(

                    pokemon,

                    evolution.method,

                    evolution.value,

                    {

                        ...context,

                        target:
                            evolution.target,

                        item:
                            evolution.item

                    }

                );


            if(
                check.allowed
            )
            {

                return this.evolve(

                    pokemon,

                    {

                        ...evolution,

                        context:

                        {

                            ...context,

                            target:
                                evolution.target,

                            item:
                                evolution.item

                        }

                    }

                );

            }

        }


        //--------------------------------
        // No evolution requirement met
        //--------------------------------

        return {

            success:
                false,

            reason:
                "Evolution requirements not met",

            pokemon:
                pokemon.species,

            friendship:
                this.getFriendship(
                    pokemon
                ),

            evolutions

        };

    }









    //--------------------------------
    // Evolution database lookup
    //--------------------------------


    getEvolutionData(
        pokemon
    )
    {


        if(
            !pokemon
            ||
            !this.database
        )
        {

            return null;

        }


        return this.getEvolution(

            pokemon.species

        );

    }









    //--------------------------------
    // Get all evolutions
    //--------------------------------


    getEvolutions(
        species
    )
    {


        if(
            !this.database
        )
        {

            return [];

        }


        //--------------------------------
        // Preferred database API
        //--------------------------------

        if(
            typeof this.database.getEvolutions ===
                "function"
        )
        {

            return (

                this.database.getEvolutions(
                    species
                )

                ||

                []

            );

        }


        //--------------------------------
        // Legacy fallback
        //--------------------------------

        const evolution =
            this.getEvolution(
                species
            );


        return evolution

            ?

            [

                evolution

            ]

            :

            [];

    }









    //--------------------------------
    // Check evolution requirements
    //--------------------------------


    canEvolve(
        pokemon,
        method,
        value,
        context = {}
    )
    {


        if(
            !pokemon
        )
        {

            return {

                allowed:
                    false,

                reason:
                    "Missing Pokemon"

            };

        }


        switch(
            method
        )
        {


            //--------------------------------
            // Level evolution
            //--------------------------------

            case "LEVEL":

            {

                const level =
                    Number(
                        value
                    );


                const currentLevel =
                    Number(
                        pokemon.level
                    );


                if(
                    !Number.isFinite(
                        level
                    )
                )
                {

                    return {

                        allowed:
                            false,

                        reason:
                            "Invalid level requirement"

                    };

                }


                if(
                    !Number.isFinite(
                        currentLevel
                    )
                )
                {

                    return {

                        allowed:
                            false,

                        reason:
                            "Invalid Pokemon level"

                    };

                }


                return {

                    allowed:
                        currentLevel >= level,

                    reason:

                        currentLevel >= level

                        ?

                        null

                        :

                        `Requires level ${level}`

                };

            }


            //--------------------------------
            // Evolution stone
            //--------------------------------

            case "EVOLUTION_STONE":

                return this.canEvolveByItem(

                    pokemon,

                    value,

                    context,

                    true

                );


            //--------------------------------
            // Generic item evolution
            //--------------------------------

            case "ITEM":

                return this.canEvolveByItem(

                    pokemon,

                    value,

                    context,

                    false

                );


            //--------------------------------
            // Friendship evolution
            //--------------------------------

            case "FRIENDSHIP":

                return this.canEvolveByFriendship(

                    pokemon,

                    value,

                    context,

                    null

                );


            //--------------------------------
            // Friendship during day
            //--------------------------------

            case "FRIENDSHIP_DAY":

                return this.canEvolveByFriendship(

                    pokemon,

                    value,

                    context,

                    "DAY"

                );


            //--------------------------------
            // Friendship during night
            //--------------------------------

            case "FRIENDSHIP_NIGHT":

                return this.canEvolveByFriendship(

                    pokemon,

                    value,

                    context,

                    "NIGHT"

                );


            //--------------------------------
            // Trade evolution
            //--------------------------------

            case "TRADE":

                return {

                    allowed:
                        context.traded === true,

                    reason:

                        context.traded === true

                        ?

                        null

                        :

                        "Trade required"

                };


            //--------------------------------
            // Trade with item
            //--------------------------------

            case "TRADE_ITEM":

                return this.canEvolveByTradeItem(

                    pokemon,

                    value,

                    context

                );


            //--------------------------------
            // Unknown
            //--------------------------------

            default:

                return {

                    allowed:
                        false,

                    reason:
                        "Unknown evolution method"

                };

        }

    }









    //--------------------------------
    // Check evolution by item
    //--------------------------------


    canEvolveByItem(
        pokemon,
        item,
        context = {},
        evolutionStone = false
    )
    {

        if(
            !item
        )
        {

            return {

                allowed:
                    false,

                reason:
                    evolutionStone

                    ?

                    "Missing evolution stone"

                    :

                    "Missing evolution item"

            };

        }


        const items =
            Array.isArray(
                context.items
            )

            ?

            context.items

            :

            [];


        const hasItem =
            items.some(

                value =>

                    this.itemsMatch(
                        value,
                        item
                    )

            );


        return {

            allowed:
                hasItem,

            reason:

                hasItem

                ?

                null

                :

                (
                    evolutionStone

                    ?

                    `Missing evolution stone: ${item}`

                    :

                    `Missing evolution item: ${item}`
                )

        };

    }









    //--------------------------------
    // Check friendship evolution
    //--------------------------------


    canEvolveByFriendship(
        pokemon,
        value,
        context = {},
        requiredTime = null
    )
    {

        //--------------------------------
        // Friendship evolution requires
        // a level-up trigger.
        //--------------------------------

        if(
            context.levelUp !== true
            &&
            context.trigger !==
                "LEVEL_UP"
            &&
            context.evolutionTrigger !==
                "LEVEL_UP"
        )
        {

            return {

                allowed:
                    false,

                reason:
                    "Friendship evolution requires a level-up"

            };

        }


        //--------------------------------
        // FireRed National Dex restriction
        //--------------------------------

        if(
            this.isFireRed()
        )
        {

            if(
                this.fireRedRequiresNationalDex(
                    pokemon,
                    context
                )
            )
            {

                return {

                    allowed:
                        false,

                    reason:
                        "National Pokedex required for this evolution"

                };

            }

        }


        //--------------------------------
        // FireRed has no day/night cycle
        //--------------------------------

        if(
            this.isFireRed()
            &&
            requiredTime
        )
        {

            return {

                allowed:
                    false,

                reason:
                    "FireRed does not support day/night friendship evolution"

            };

        }


        //--------------------------------
        // Check day/night requirement
        //--------------------------------

        if(
            requiredTime
            &&
            !this.matchesTimeOfDay(
                context.time,
                requiredTime
            )
        )
        {

            return {

                allowed:
                    false,

                reason:
                    `Friendship evolution requires ${requiredTime.toLowerCase()}`

            };

        }


        //--------------------------------
        // Resolve threshold
        //--------------------------------

        const threshold =
            Number(
                value
            );


        const requiredFriendship =
            Number.isFinite(
                threshold
            )

            ?

            threshold

            :

            this.friendshipThreshold;


        //--------------------------------
        // Read friendship
        //--------------------------------

        const friendship =
            this.getFriendship(
                pokemon
            );


        if(
            friendship <
                requiredFriendship
        )
        {

            return {

                allowed:
                    false,

                reason:
                    `Requires friendship ${requiredFriendship}`,

                friendship,

                requiredFriendship

            };

        }


        return {

            allowed:
                true,

            friendship,

            requiredFriendship

        };

    }









    //--------------------------------
    // Check trade with item
    //--------------------------------


    canEvolveByTradeItem(
        pokemon,
        item,
        context = {}
    )
    {

        if(
            context.traded !== true
        )
        {

            return {

                allowed:
                    false,

                reason:
                    "Trade required"

            };

        }


        if(
            !item
        )
        {

            return {

                allowed:
                    false,

                reason:
                    "Missing trade evolution item"

            };

        }


        const items =
            Array.isArray(
                context.items
            )

            ?

            context.items

            :

            [];


        const hasItem =
            items.some(

                value =>

                    this.itemsMatch(
                        value,
                        item
                    )

            );


        return {

            allowed:
                hasItem,

            reason:

                hasItem

                ?

                null

                :

                `Missing trade evolution item: ${item}`

        };

    }









    //--------------------------------
    // Evolve Pokémon
    //--------------------------------


    evolve(
        pokemon,
        evolution
    )
    {


        if(
            !pokemon
        )
        {

            return {

                success:
                    false,

                reason:
                    "Missing Pokemon"

            };

        }


        if(
            !evolution
        )
        {

            return {

                success:
                    false,

                reason:
                    "Missing evolution data"

            };

        }


        //--------------------------------
        // Check requirements
        //--------------------------------

        const check =
            this.canEvolve(

                pokemon,

                evolution.method,

                evolution.value,

                evolution.context || {}

            );


        if(
            !check.allowed
        )
        {

            return {

                success:
                    false,

                reason:
                    check.reason,

                requirement:
                    check

            };

        }


        //--------------------------------
        // Consume evolution item
        //--------------------------------

        let consumedItem =
            null;


        if(
            evolution.method ===
                "EVOLUTION_STONE"
            ||
            evolution.method ===
                "ITEM"
            ||
            evolution.method ===
                "TRADE_ITEM"
        )
        {

            consumedItem =
                this.consumeEvolutionItem(

                    evolution.item ||
                    evolution.value,

                    evolution.context

                );


            if(
                consumedItem.success ===
                    false
            )
            {

                return {

                    success:
                        false,

                    reason:
                        consumedItem.reason

                };

            }

        }


        //--------------------------------
        // Change species
        //--------------------------------

        const oldSpecies =
            pokemon.species;


        pokemon.species =
            evolution.target;


        //--------------------------------
        // Evolution history
        //--------------------------------

        if(
            !pokemon.evolutionHistory
        )
        {

            pokemon.evolutionHistory =
                [];

        }


        pokemon.evolutionHistory.push(

            {

                from:
                    oldSpecies,

                to:
                    pokemon.species,

                method:
                    evolution.method,

                level:
                    pokemon.level || null,

                friendship:
                    this.getFriendship(
                        pokemon
                    ),

                item:
                    consumedItem
                    &&
                    consumedItem.item
                    ||

                    evolution.item
                    ||

                    null,

                date:
                    new Date().toISOString()

            }

        );


        //--------------------------------
        // Result
        //--------------------------------

        return {

            success:
                true,

            from:
                oldSpecies,

            to:
                pokemon.species,

            method:
                evolution.method,

            friendship:
                this.getFriendship(
                    pokemon
                ),

            item:
                consumedItem
                &&
                consumedItem.item
                ||

                evolution.item
                ||

                null

        };

    }









    //--------------------------------
    // Level evolution
    //--------------------------------


    evolveByLevel(
        pokemon,
        target,
        level
    )
    {

        return this.evolve(

            pokemon,

            {

                method:
                    "LEVEL",

                value:
                    level,

                target,

                context:

                {

                    levelUp:
                        true,

                    trigger:
                        "LEVEL_UP"

                }

            }

        );

    }









    //--------------------------------
    // Item evolution
    //--------------------------------


    evolveByItem(
        pokemon,
        target,
        item,
        items
    )
    {

        const normalizedItem =
            this.normalizeItem(
                item
            );


        return this.evolve(

            pokemon,

            {

                method:
                    this.isEvolutionStone(
                        normalizedItem
                    )

                    ?

                    "EVOLUTION_STONE"

                    :

                    "ITEM",

                value:
                    normalizedItem,

                item:
                    normalizedItem,

                target,

                context:

                {

                    items,

                    consumeItem:
                        true

                }

            }

        );

    }









    //--------------------------------
    // Trade evolution
    //--------------------------------


    evolveByTrade(
        pokemon,
        target,
        traded = false
    )
    {

        return this.evolve(

            pokemon,

            {

                method:
                    "TRADE",

                value:
                    null,

                target,

                context:

                {

                    traded

                }

            }

        );

    }









    //--------------------------------
    // Friendship evolution
    //--------------------------------


    evolveByFriendship(
        pokemon,
        target,
        friendship =
            this.friendshipThreshold
    )
    {

        return this.evolve(

            pokemon,

            {

                method:
                    "FRIENDSHIP",

                value:
                    friendship,

                target,

                context:

                {

                    levelUp:
                        true,

                    trigger:
                        "LEVEL_UP"

                }

            }

        );

    }









    //--------------------------------
    // Friendship day evolution
    //--------------------------------


    evolveByFriendshipDay(
        pokemon,
        target,
        friendship =
            this.friendshipThreshold
    )
    {

        return this.evolve(

            pokemon,

            {

                method:
                    "FRIENDSHIP_DAY",

                value:
                    friendship,

                target,

                context:

                {

                    levelUp:
                        true,

                    trigger:
                        "LEVEL_UP",

                    time:
                        "DAY"

                }

            }

        );

    }









    //--------------------------------
    // Friendship night evolution
    //--------------------------------


    evolveByFriendshipNight(
        pokemon,
        target,
        friendship =
            this.friendshipThreshold
    )
    {

        return this.evolve(

            pokemon,

            {

                method:
                    "FRIENDSHIP_NIGHT",

                value:
                    friendship,

                target,

                context:

                {

                    levelUp:
                        true,

                    trigger:
                        "LEVEL_UP",

                    time:
                        "NIGHT"

                }

            }

        );

    }









    //--------------------------------
    // Database lookup
    //--------------------------------


    getEvolution(
        species
    )
    {


        if(
            !this.database
        )
        {

            return null;

        }


        if(
            typeof species !==
                "string"
        )
        {

            return null;

        }


        let name =
            species.toUpperCase();


        if(
            name.startsWith(
                "SPECIES_"
            )
        )
        {

            name =
                name.replace(
                    "SPECIES_",
                    ""
                );

        }


        return this.database.getEvolution(

            name

        );

    }









    //--------------------------------
    // Get friendship
    //--------------------------------


    getFriendship(
        pokemon
    )
    {

        if(
            this.friendship
            &&
            typeof this.friendship.getFriendship ===
                "function"
        )
        {

            return this.friendship.getFriendship(
                pokemon
            );

        }


        const value =
            Number(
                pokemon.friendship
            );


        if(
            Number.isFinite(
                value
            )
        )
        {

            return Math.min(

                255,

                Math.max(

                    0,

                    Math.floor(
                        value
                    )

                )

            );

        }


        return 70;

    }









    //--------------------------------
    // Check FireRed
    //--------------------------------


    isFireRed()
    {

        const game =
            this.database
            &&
            this.database.game;


        if(
            typeof game ===
                "string"
        )
        {

            return (

                game.toLowerCase()
                ===
                "firered"

            );

        }


        //--------------------------------
        // The current database service
        // does not expose game metadata.
        //
        // EvolutionService can therefore
        // receive an explicit game value
        // through context where needed.
        //--------------------------------

        return false;

    }









    //--------------------------------
    // Check FireRed National Dex
    //--------------------------------


    fireRedRequiresNationalDex(
        pokemon,
        context
    )
    {

        //--------------------------------
        // Explicit context overrides
        //--------------------------------

        if(
            context.nationalDex === true
            ||
            context.hasNationalDex === true
        )
        {

            return false;

        }


        if(
            context.nationalDex === false
            ||
            context.hasNationalDex === false
        )
        {

            return true;

        }


        //--------------------------------
        // Target-based FireRed restriction
        //--------------------------------

        const target =
            context.target;


        if(
            !target
        )
        {

            return false;

        }


        const nationalDexNumber =
            this.getNationalDexNumber(
                target
            );


        //--------------------------------
        // Generation II / III evolution
        // stages are locked in FireRed
        // until National Dex.
        //--------------------------------

        return (

            Number.isFinite(
                nationalDexNumber
            )

            &&

            nationalDexNumber >
                151

        );

    }









    //--------------------------------
    // Get National Dex number
    //--------------------------------


    getNationalDexNumber(
        species
    )
    {

        if(
            !this.database
            ||
            !species
        )
        {

            return null;

        }


        if(
            typeof this.database.getPokemon !==
                "function"
        )
        {

            return null;

        }


        const pokemon =
            this.database.getPokemon(
                species
            );


        if(
            !pokemon
        )
        {

            return null;

        }


        const value =
            Number(
                pokemon.nationalDexNumber
                ||
                pokemon.dexNumber
                ||
                pokemon.id
            );


        if(
            !Number.isFinite(
                value
            )
        )
        {

            return null;

        }


        return value;

    }









    //--------------------------------
    // Check time
    //--------------------------------


    matchesTimeOfDay(
        actualTime,
        requiredTime
    )
    {

        if(
            !actualTime
        )
        {

            return false;

        }


        const value =
            String(
                actualTime
            )
            .trim()
            .toUpperCase();


        const required =
            String(
                requiredTime
            )
            .trim()
            .toUpperCase();


        return (

            value ===
            required

        );

    }









    //--------------------------------
    // Normalize item
    //--------------------------------


    normalizeItem(
        item
    )
    {

        if(
            !item
        )
        {

            return null;

        }


        const value =
            String(
                item
            )
            .trim()
            .toUpperCase();


        if(
            value.startsWith(
                "ITEM_"
            )
        )
        {

            return value;

        }


        return (
            "ITEM_" +
            value
        );

    }









    //--------------------------------
    // Check item match
    //--------------------------------


    itemsMatch(
        first,
        second
    )
    {

        const normalizedFirst =
            this.normalizeItem(
                first
            );


        const normalizedSecond =
            this.normalizeItem(
                second
            );


        return (

            normalizedFirst
            ===
            normalizedSecond

        );

    }









    //--------------------------------
    // Check evolution stone
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
            this.normalizeItem(
                item
            );


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
    // Consume evolution item
    //--------------------------------


    consumeEvolutionItem(
        item,
        context = {}
    )
    {

        if(
            !item
        )
        {

            return {

                success:
                    false,

                reason:
                    "Missing evolution item"

            };

        }


        //--------------------------------
        // Do not consume when explicitly
        // disabled.
        //--------------------------------

        if(
            context.consumeItem ===
                false
        )
        {

            return {

                success:
                    true,

                item:
                    this.normalizeItem(
                        item
                    ),

                consumed:
                    false

            };

        }


        //--------------------------------
        // Context may supply an array.
        //--------------------------------

        if(
            !Array.isArray(
                context.items
            )
        )
        {

            return {

                success:
                    false,

                reason:
                    "Evolution item inventory unavailable"

            };

        }


        const normalized =
            this.normalizeItem(
                item
            );


        const index =
            context.items.findIndex(

                value =>

                    this.itemsMatch(
                        value,
                        normalized
                    )

            );


        if(
            index === -1
        )
        {

            return {

                success:
                    false,

                reason:
                    `Missing evolution item: ${normalized}`

            };

        }


        context.items.splice(
            index,
            1
        );


        return {

            success:
                true,

            item:
                normalized,

            consumed:
                true

        };

    }









}





module.exports =
    EvolutionService;
/**
 * Pokémon Companion
 * Backend Pokémon Service
 *
 * API-facing Pokémon data service.
 *
 * Responsibilities:
 * - Access the generated Pokémon database.
 * - Retrieve Pokémon collections.
 * - Retrieve individual Pokémon.
 * - Search Pokémon.
 * - Filter Pokémon.
 * - Sort Pokémon.
 * - Paginate Pokémon.
 * - Build API-friendly Pokémon responses.
 * - Build Pokémon evolution chains.
 * - Build Pickup data.
 *
 * Does NOT:
 * - Store Pokémon data separately.
 * - Generate Pokémon databases.
 * - Duplicate Pokémon database logic.
 * - Manipulate the DOM.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");


const PokemonDatabaseService =
    require("../../scripts/services/pokemon-database-service");



class PokemonService {


    constructor(
        game = "firered"
    )
    {

        this.game =
            String(
                game
            ).toLowerCase();


        this.database =
            new PokemonDatabaseService(
                this.game
            );


        //--------------------------------
        // Load game-specific Pickup data
        //--------------------------------

        this.pickup =
            this.loadPickupDatabase();


        //--------------------------------
        // Load item reference database
        //--------------------------------

        this.itemReferences =
            this.loadItemReferences();

    }


    //--------------------------------
    // Get all database Pokémon
    //--------------------------------

    getAllPokemon()
    {

        return this.database.getAllPokemon();

    }


    //--------------------------------
    // Get public Pokédex Pokémon
    //--------------------------------
    //
    // Internal species such as:
    //
    // SPECIES_OLD_UNOWN_A
    // SPECIES_OLD_UNOWN_B
    //
    // are retained in the generated database
    // but are not exposed through the public
    // National Pokédex collection.
    //--------------------------------

    getPublicPokemon()
    {

        return this.getAllPokemon().filter(

            pokemon =>

                pokemon
                &&
                typeof pokemon.name ===
                    "string"
                &&
                pokemon.name.trim() !== ""
                &&
                pokemon.name !== "?"

        );

    }


    //--------------------------------
    // Get Pokémon by ID
    //--------------------------------

    getPokemonById(
        id
    )
    {

        return this.database.getPokemonById(
            id
        );

    }


    //--------------------------------
    // Get Pokémon by name
    //--------------------------------

    getPokemon(
        name
    )
    {

        return this.database.getPokemon(
            name
        );

    }


    //--------------------------------
    // Get complete Pokémon details
    //--------------------------------

    getPokemonDetails(
        id
    )
    {

        const pokemon =
            this.getPokemonById(
                id
            );


        if(
            !pokemon
        )
        {

            return null;

        }


        return this.buildPokemonDetails(
            pokemon
        );

    }


    //--------------------------------
    // Load Pickup database
    //--------------------------------

    loadPickupDatabase()
    {

        const file =
            path.join(

                process.cwd(),

                "database",

                "reference",

                this.game,

                "pickup.json"

            );


        if(
            !fs.existsSync(
                file
            )
        )
        {

            return null;

        }


        try
        {

            return JSON.parse(

                fs.readFileSync(
                    file,
                    "utf8"
                )

            );

        }
        catch(error)
        {

            throw new Error(

                `Failed to load Pickup database: ${error.message}`

            );

        }

    }


    //--------------------------------
    // Load item references
    //--------------------------------

    loadItemReferences()
    {

        const file =
            path.join(

                process.cwd(),

                "database",

                "reference",

                "items.json"

            );


        if(
            !fs.existsSync(
                file
            )
        )
        {

            return [];

        }


        try
        {

            return JSON.parse(

                fs.readFileSync(
                    file,
                    "utf8"
                )

            );

        }
        catch(error)
        {

            throw new Error(

                `Failed to load item reference database: ${error.message}`

            );

        }

    }


    //--------------------------------
    // Build list Pokémon object
    //--------------------------------

    buildPokemonSummary(
        pokemon
    )
    {

        if(
            !pokemon
        )
        {

            return null;

        }


        return {

            id:
                pokemon.id,

            nationalDexNumber:
                pokemon.nationalDexNumber,

            constant:
                pokemon.constant,

            name:
                pokemon.name,

            generation:
                pokemon.generation,

            types:
                this.buildTypes(
                    pokemon
                )

        };

    }


    //--------------------------------
    // Build complete Pokémon object
    //--------------------------------

    buildPokemonDetails(
        pokemon
    )
    {

        if(
            !pokemon
        )
        {

            return null;

        }


        return {

            id:
                pokemon.id,

            nationalDexNumber:
                pokemon.nationalDexNumber,

            constant:
                pokemon.constant,

            name:
                pokemon.name,

            generation:
                pokemon.generation,


            //--------------------------------
            // Base stats
            //--------------------------------

            baseStats:
            {

                hp:
                    pokemon.baseHP,

                attack:
                    pokemon.baseAttack,

                defense:
                    pokemon.baseDefense,

                speed:
                    pokemon.baseSpeed,

                specialAttack:
                    pokemon.baseSpAttack,

                specialDefense:
                    pokemon.baseSpDefense

            },


            //--------------------------------
            // Types
            //--------------------------------

            types:
                this.buildTypes(
                    pokemon
                ),


            //--------------------------------
            // Abilities
            //--------------------------------

            abilities:
                this.buildAbilities(
                    pokemon
                ),


            //--------------------------------
            // Pokédex
            //--------------------------------

            pokedex:
                pokemon.pokedex
                ||
                null,


            //--------------------------------
            // Direct evolution mechanics
            //--------------------------------
            //
            // This remains unchanged.
            // It represents the direct outgoing
            // evolution rules for the selected
            // Pokémon.
            //--------------------------------

            evolutions:
                Array.isArray(
                    pokemon.evolutions
                )
                ?
                pokemon.evolutions
                :
                [],


            //--------------------------------
            // Complete evolution chain
            //--------------------------------

            evolutionChain:
                this.getEvolutionChain(
                    pokemon.id
                ),


            //--------------------------------
            // Pickup
            //--------------------------------

            pickup:
                this.buildPickup(
                    pokemon
                ),


            //--------------------------------
            // Learnset
            //--------------------------------

            learnset:
                Array.isArray(
                    pokemon.learnset
                )
                ?
                pokemon.learnset
                :
                [],


            //--------------------------------
            // Machines
            //--------------------------------

            machines:
                Array.isArray(
                    pokemon.machines
                )
                ?
                pokemon.machines
                :
                [],


            //--------------------------------
            // Egg moves
            //--------------------------------

            eggMoves:
                Array.isArray(
                    pokemon.eggMoves
                )
                ?
                pokemon.eggMoves
                :
                [],


            //--------------------------------
            // Evolution-exclusive moves
            //--------------------------------

            evolutionLostMoves:
                Array.isArray(
                    pokemon.evolutionLostMoves
                )
                ?
                pokemon.evolutionLostMoves
                :
                [],


            //--------------------------------
            // Additional species data
            //--------------------------------

            catchRate:
                pokemon.catchRate,

            expYield:
                pokemon.expYield,


            evYield:
            {

                hp:
                    pokemon.evYieldHP,

                attack:
                    pokemon.evYieldAttack,

                defense:
                    pokemon.evYieldDefense,

                speed:
                    pokemon.evYieldSpeed,

                specialAttack:
                    pokemon.evYieldSpAttack,

                specialDefense:
                    pokemon.evYieldSpDefense

            },


            genderRatio:
                pokemon.genderRatio,

            eggCycles:
                pokemon.eggCycles,

            friendship:
                pokemon.friendship,


            growthRate:
                pokemon.growthRate
                ||
                null,


            eggGroups:
                this.buildEggGroups(
                    pokemon
                ),


            heldItems:
            {

                common:
                    pokemon.itemCommon
                    ||
                    null,

                rare:
                    pokemon.itemRare
                    ||
                    null

            },


            safariZoneFleeRate:
                pokemon.safariZoneFleeRate,

            bodyColor:
                pokemon.bodyColor
                ||
                null,

            noFlip:
                pokemon.noFlip

        };

    }


    //--------------------------------
    // Build Pickup data
    //--------------------------------

    buildPickup(
        pokemon
    )
    {

        if(
            !this.pickup
        )
        {

            return null;

        }


        if(
            !this.hasPickupAbility(
                pokemon
            )
        )
        {

            return null;

        }


        return {

            game:
                this.pickup.game,

            activationChance:
                10,

            pokemonUsers:
                this.buildPickupPokemonUsers(),

            lootPool:
                this.buildPickupLootPool()

        };

    }


    //--------------------------------
    // Check Pickup ability
    //--------------------------------

    hasPickupAbility(
        pokemon
    )
    {

        if(
            !pokemon
        )
        {

            return false;

        }


        return (

            pokemon.ability1
            &&
            (
                pokemon.ability1.name ===
                "PICKUP"
            )

        )
        ||
        (

            pokemon.ability2
            &&
            (
                pokemon.ability2.name ===
                "PICKUP"
            )

        );

    }


    //--------------------------------
    // Build Pickup Pokémon users
    //--------------------------------
    //
    // These are resolved from the Pickup
    // reference database.
    //
    // Some species may not exist in the
    // current game's generated species
    // database, for example Zigzagoon
    // and Linoone in the current FireRed
    // dataset.
    //--------------------------------

    buildPickupPokemonUsers()
    {

        if(
            !Array.isArray(
                this.pickup?.pokemonUsers
            )
        )
        {

            return [];

        }


        const users =
            this.pickup.pokemonUsers.map(

                constant =>
                {

                    const pokemon =
                        this.getPokemonByConstant(
                            constant
                        );


                    if(
                        pokemon
                    )
                    {

                        return {

                            id:
                                pokemon.id,

                            nationalDexNumber:
                                pokemon.nationalDexNumber,

                            constant:
                                pokemon.constant,

                            name:
                                pokemon.name

                        };

                    }


                    return {

                        id:
                            null,

                        nationalDexNumber:
                            null,

                        constant,

                        name:
                            this.formatSpeciesName(
                                constant
                            )

                    };

                }

            );


        //--------------------------------
        // Sort by National Dex number
        //--------------------------------

        users.sort(

            (a, b) =>
            {

                const dexA =
                    Number(
                        a.nationalDexNumber
                    );


                const dexB =
                    Number(
                        b.nationalDexNumber
                    );


                //--------------------------------
                // Known Dex numbers first
                //--------------------------------

                if(
                    Number.isNaN(dexA)
                    &&
                    Number.isNaN(dexB)
                )
                {

                    return a.name.localeCompare(
                        b.name
                    );

                }


                if(
                    Number.isNaN(dexA)
                )
                {

                    return 1;

                }


                if(
                    Number.isNaN(dexB)
                )
                {

                    return -1;

                }


                return dexA - dexB;

            }

        );


        return users;

    }


    //--------------------------------
    // Find Pokémon by constant
    //--------------------------------

    getPokemonByConstant(
        constant
    )
    {

        if(
            !constant
        )
        {

            return null;

        }


        return this.getAllPokemon().find(

            pokemon =>

                pokemon.constant ===
                constant

        )
        ||
        null;

    }


    //--------------------------------
    // Format species constant
    //--------------------------------

    formatSpeciesName(
        constant
    )
    {

        if(
            typeof constant !==
            "string"
        )
        {

            return constant;

        }


        return constant

            .replace(
                /^SPECIES_/,
                ""
            )

            .replace(
                /_/g,
                " "
            );

    }


    //--------------------------------
    // Build Pickup loot pool
    //--------------------------------

    buildPickupLootPool()
    {

        if(
            !Array.isArray(
                this.pickup?.lootPool
            )
        )
        {

            return [];

        }


        return this.pickup.lootPool.map(

            entry =>
            {

                const item =
                    this.getItemReference(
                        entry.itemConstant
                    );


                return {

                    item:
                        item
                        ||
                        {

                            id:
                                null,

                            constant:
                                entry.itemConstant,

                            name:
                                this.formatItemName(
                                    entry.itemConstant
                                )

                        },

                    threshold:
                        entry.threshold,

                    minRoll:
                        entry.minRoll,

                    maxRoll:
                        entry.maxRoll,

                    probability:
                        entry.probability

                };

            }

        );

    }


    //--------------------------------
    // Get item reference
    //--------------------------------

    getItemReference(
        constant
    )
    {

        if(
            !constant
            ||
            !Array.isArray(
                this.itemReferences
            )
        )
        {

            return null;

        }


        return this.itemReferences.find(

            item =>

                item.constant ===
                constant

        )
        ||
        null;

    }


    //--------------------------------
    // Format item constant
    //--------------------------------

    formatItemName(
        constant
    )
    {

        if(
            typeof constant !==
            "string"
        )
        {

            return constant;

        }


        return constant

            .replace(
                /^ITEM_/,
                ""
            )

            .replace(
                /_/g,
                " "
            );

    }


    //--------------------------------
    // Evolution chain
    //--------------------------------

    /**
     * Build the evolution chain for a Pokémon.
     *
     * Rules:
     *
     * 1. If the selected Pokémon is the root,
     *    return the complete evolution tree.
     *
     * 2. If the selected Pokémon is not the root,
     *    return only the path from the root to
     *    the selected Pokémon.
     *
     * This gives:
     *
     * Eevee:
     *
     * Eevee
     * ├── Vaporeon
     * ├── Jolteon
     * ├── Flareon
     * ├── Espeon
     * └── Umbreon
     *
     * Umbreon:
     *
     * Eevee → Umbreon
     *
     * Charmander:
     *
     * Charmander → Charmeleon → Charizard
     *
     * @param {string|number} id
     * @returns {Object|null}
     */

    getEvolutionChain(
        id
    )
    {

        const selected =
            this.getPokemonById(
                id
            );


        if(
            !selected
        )
        {

            return null;

        }


        const publicPokemon =
            this.getPublicPokemon();


        const root =
            this.findEvolutionRoot(
                selected,
                publicPokemon
            );


        if(
            !root
        )
        {

            return null;

        }


        const isRoot =
            root.id ===
            selected.id;


        let stages;


        //--------------------------------
        // Root selected
        //--------------------------------

        if(
            isRoot
        )
        {

            stages =
                this.buildFullEvolutionStages(
                    root,
                    publicPokemon
                );

        }


        //--------------------------------
        // Evolution selected
        //--------------------------------

        else
        {

            stages =
                this.buildSelectedEvolutionPath(
                    root,
                    selected,
                    publicPokemon
                );

        }


        return {

            selected:
                selected.id,

            root:
                root.id,

            stages

        };

    }


    //--------------------------------
    // Find evolution root
    //--------------------------------

    findEvolutionRoot(
        selected,
        pokemonList
    )
    {

        let current =
            selected;


        const visited =
            new Set();


        while(
            current
            &&
            !visited.has(
                current.id
            )
        )
        {

            visited.add(
                current.id
            );


            const parent =
                this.findEvolutionParent(
                    current,
                    pokemonList
                );


            if(
                !parent
            )
            {

                break;

            }


            current =
                parent;

        }


        return current;

    }


    //--------------------------------
    // Find parent evolution
    //--------------------------------

    findEvolutionParent(
        target,
        pokemonList
    )
    {

        if(
            !target
        )
        {

            return null;

        }


        for(
            const pokemon of pokemonList
        )
        {

            if(
                !Array.isArray(
                    pokemon.evolutions
                )
            )
            {

                continue;

            }


            for(
                const evolution of pokemon.evolutions
            )
            {

                const targetSpecies =
                    evolution.targetSpecies;


                if(
                    !targetSpecies
                )
                {

                    continue;

                }


                if(
                    String(
                        targetSpecies.id
                    ) ===
                    String(
                        target.id
                    )
                )
                {

                    return pokemon;

                }

            }

        }


        return null;

    }


    //--------------------------------
    // Build complete evolution tree
    //--------------------------------

    buildFullEvolutionStages(
        root,
        pokemonList
    )
    {

        const stages =
            [];


        const visited =
            new Set();


        const queue =
        [

            {

                pokemon:
                    root,

                depth:
                    0

            }

        ];


        while(
            queue.length > 0
        )
        {

            const current =
                queue.shift();


            const pokemon =
                current.pokemon;


            const depth =
                current.depth;


            if(
                visited.has(
                    pokemon.id
                )
            )
            {

                continue;

            }


            visited.add(
                pokemon.id
            );


            if(
                !stages[depth]
            )
            {

                stages[depth] =
                    [];

            }


            stages[depth].push(

                this.buildEvolutionNode(
                    pokemon
                )

            );


            if(
                !Array.isArray(
                    pokemon.evolutions
                )
            )
            {

                continue;

            }


            for(
                const evolution of pokemon.evolutions
            )
            {

                const target =
                    this.findPokemonByEvolutionTarget(
                        evolution.targetSpecies,
                        pokemonList
                    );


                if(
                    !target
                )
                {

                    continue;

                }


                queue.push(

                    {

                        pokemon:
                            target,

                        depth:
                            depth + 1,

                        evolution

                    }

                );

            }

        }


        return this.rebuildEvolutionStages(
            stages,
            root,
            pokemonList
        );

    }


    //--------------------------------
    // Build selected evolution path
    //--------------------------------

    buildSelectedEvolutionPath(
        root,
        selected,
        pokemonList
    )
    {

        const evolutionPath =
            [];


        let current =
            selected;


        const visited =
            new Set();


        while(
            current
            &&
            !visited.has(
                current.id
            )
        )
        {

            visited.add(
                current.id
            );


            const parent =
                this.findEvolutionParent(
                    current,
                    pokemonList
                );


            evolutionPath.unshift(
                {

                    pokemon:
                        current,

                    evolution:
                        parent
                        ?
                        this.findEvolutionToTarget(
                            parent,
                            current
                        )
                        :
                        null

                }

            );


            if(
                !parent
            )
            {

                break;

            }


            current =
                parent;

        }


        return evolutionPath.map(

            entry =>

                [

                    this.buildEvolutionNode(
                        entry.pokemon,
                        entry.evolution
                    )

                ]

        );

    }


    //--------------------------------
    // Rebuild full evolution stages
    //--------------------------------

    rebuildEvolutionStages(
        stages,
        root,
        pokemonList
    )
    {

        return stages.map(

            (
                stage,
                depth
            ) =>

                stage.map(

                    node =>

                        this.buildEvolutionNode(

                            this.getPokemonById(
                                node.id
                            )
                            ||
                            pokemonList.find(
                                pokemon =>
                                    pokemon.id ===
                                    node.id
                            ),

                            depth === 0
                            ?
                            null
                            :
                            this.findIncomingEvolution(
                                node.id,
                                pokemonList
                            )

                        )

                )

        );

    }


    //--------------------------------
    // Build evolution node
    //--------------------------------

    buildEvolutionNode(
        pokemon,
        evolution = null
    )
    {

        if(
            !pokemon
        )
        {

            return null;

        }


        const node =
        {

            id:
                pokemon.id,

            nationalDexNumber:
                pokemon.nationalDexNumber,

            constant:
                pokemon.constant,

            name:
                pokemon.name

        };


        if(
            evolution
        )
        {

            node.evolution =
                this.buildEvolutionRequirement(
                    evolution
                );

        }


        return node;

    }


    //--------------------------------
    // Build evolution requirement
    //--------------------------------

    buildEvolutionRequirement(
        evolution
    )
    {

        if(
            !evolution
        )
        {

            return null;

        }


        const requirement =
        {

            method:
                evolution.method
                ?
                {

                    id:
                        evolution.method.id,

                    constant:
                        evolution.method.constant,

                    name:
                        evolution.method.name

                }
                :
                null

        };


        if(
            evolution.level !==
            undefined
        )
        {

            requirement.level =
                evolution.level;

        }


        if(
            evolution.item
        )
        {

            requirement.item =
            {

                id:
                    evolution.item.id,

                constant:
                    evolution.item.constant,

                name:
                    evolution.item.name

            };

        }


        if(
            evolution.beauty !==
            undefined
        )
        {

            requirement.beauty =
                evolution.beauty;

        }


        return requirement;

    }


    //--------------------------------
    // Find Pokémon by evolution target
    //--------------------------------

    findPokemonByEvolutionTarget(
        targetSpecies,
        pokemonList
    )
    {

        if(
            !targetSpecies
        )
        {

            return null;

        }


        const targetId =
            String(
                targetSpecies.id
            );


        return pokemonList.find(

            pokemon =>

                String(
                    pokemon.id
                ) ===
                targetId

        )
        ||
        null;

    }


    //--------------------------------
    // Find evolution to target
    //--------------------------------

    findEvolutionToTarget(
        parent,
        target
    )
    {

        if(
            !parent
            ||
            !Array.isArray(
                parent.evolutions
            )
        )
        {

            return null;

        }


        return parent.evolutions.find(

            evolution =>

                evolution.targetSpecies
                &&
                String(
                    evolution.targetSpecies.id
                ) ===
                String(
                    target.id
                )

        )
        ||
        null;

    }


    //--------------------------------
    // Find incoming evolution
    //--------------------------------

    findIncomingEvolution(
        targetId,
        pokemonList
    )
    {

        for(
            const pokemon of pokemonList
        )
        {

            const evolution =
                this.findEvolutionToTargetById(
                    pokemon,
                    targetId
                );


            if(
                evolution
            )
            {

                return evolution;

            }

        }


        return null;

    }


    //--------------------------------
    // Find evolution to target by ID
    //--------------------------------

    findEvolutionToTargetById(
        pokemon,
        targetId
    )
    {

        if(
            !pokemon
            ||
            !Array.isArray(
                pokemon.evolutions
            )
        )
        {

            return null;

        }


        return pokemon.evolutions.find(

            evolution =>

                evolution.targetSpecies
                &&
                String(
                    evolution.targetSpecies.id
                ) ===
                String(
                    targetId
                )

        )
        ||
        null;

    }


    //--------------------------------
    // Build types
    //--------------------------------

    buildTypes(
        pokemon
    )
    {

        const types =
            [];


        if(
            pokemon.type1
        )
        {

            types.push(
                pokemon.type1
            );

        }


        if(
            pokemon.type2
        )
        {

            types.push(
                pokemon.type2
            );

        }


        return types;

    }


    //--------------------------------
    // Build abilities
    //--------------------------------

    buildAbilities(
        pokemon
    )
    {

        const abilities =
            [];


        if(
            pokemon.ability1
        )
        {

            abilities.push(
                pokemon.ability1
            );

        }


        if(
            pokemon.ability2
        )
        {

            abilities.push(
                pokemon.ability2
            );

        }


        return abilities;

    }


    //--------------------------------
    // Build egg groups
    //--------------------------------

    buildEggGroups(
        pokemon
    )
    {

        const groups =
            [];


        if(
            pokemon.eggGroup1
        )
        {

            groups.push(
                pokemon.eggGroup1
            );

        }


        if(
            pokemon.eggGroup2
        )
        {

            groups.push(
                pokemon.eggGroup2
            );

        }


        return groups;

    }


    //--------------------------------
    // Search Pokémon
    //--------------------------------

    searchPokemon(
        search = ""
    )
    {

        const query =
            String(
                search
            )
            .trim()
            .toLowerCase();


        if(
            !query
        )
        {

            return this.getPublicPokemon();

        }


        return this.getPublicPokemon().filter(

            pokemon =>

                pokemon.name
                    ?.toLowerCase()
                    .includes(
                        query
                    )

                ||

                pokemon.nationalDexNumber
                    ?.includes(
                        query
                    )

                ||

                pokemon.id
                    ?.includes(
                        query
                    )

        );

    }


    //--------------------------------
    // Filter by generation
    //--------------------------------

    getByGeneration(
        generation
    )
    {

        const value =
            Number(
                generation
            );


        if(
            !Number.isInteger(
                value
            )
        )
        {

            return [];

        }


        return this.getPublicPokemon().filter(

            pokemon =>

                pokemon.generation ===
                value

        );

    }


    //--------------------------------
    // Filter by type
    //--------------------------------

    getByType(
        type
    )
    {

        if(
            !type
        )
        {

            return [];

        }


        const searchType =
            String(
                type
            )
            .trim()
            .toLowerCase();


        return this.getPublicPokemon().filter(

            pokemon =>

                (
                    pokemon.type1
                    &&
                    pokemon.type1.name
                        ?.toLowerCase()
                    ===
                    searchType
                )

                ||

                (
                    pokemon.type2
                    &&
                    pokemon.type2.name
                        ?.toLowerCase()
                    ===
                    searchType
                )

        );

    }


    //--------------------------------
    // Filter by ability
    //--------------------------------

    getByAbility(
        ability
    )
    {

        if(
            !ability
        )
        {

            return [];

        }


        const searchAbility =
            String(
                ability
            )
            .trim()
            .toUpperCase();


        return this.getPublicPokemon().filter(

            pokemon =>

                (
                    pokemon.ability1
                    &&
                    pokemon.ability1.name ===
                    searchAbility
                )

                ||

                (
                    pokemon.ability2
                    &&
                    pokemon.ability2.name ===
                    searchAbility
                )

        );

    }


    //--------------------------------
    // Get evolution data
    //--------------------------------

    getEvolution(
        species
    )
    {

        return this.database.getEvolution(
            species
        );

    }


    //--------------------------------
    // Search, filter and sort
    //--------------------------------

    queryPokemon(
        options = {}
    )
    {

        let pokemon =
            this.getPublicPokemon();


        //--------------------------------
        // Search
        //--------------------------------

        if(
            options.search
        )
        {

            pokemon =
                this.searchPokemon(
                    options.search
                );

        }


        //--------------------------------
        // Generation
        //--------------------------------

        if(
            options.generation !==
            undefined
            &&
            options.generation !==
            null
            &&
            options.generation !==
            ""
            &&
            options.generation !==
            "all"
        )
        {

            const generation =
                Number(
                    options.generation
                );


            if(
                Number.isInteger(
                    generation
                )
            )
            {

                pokemon =
                    pokemon.filter(

                        entry =>

                            entry.generation ===
                            generation

                    );

            }

        }


        //--------------------------------
        // Type
        //--------------------------------

        if(
            options.type
            &&
            options.type !==
            "all"
        )
        {

            const type =
                String(
                    options.type
                )
                .trim()
                .toLowerCase();


            pokemon =
                pokemon.filter(

                    entry =>

                        (
                            entry.type1
                            &&
                            entry.type1.name
                                ?.toLowerCase()
                            ===
                            type
                        )

                        ||

                        (
                            entry.type2
                            &&
                            entry.type2.name
                                ?.toLowerCase()
                            ===
                            type
                        )

                );

        }


        //--------------------------------
        // Ability
        //--------------------------------

        if(
            options.ability
        )
        {

            const ability =
                String(
                    options.ability
                )
                .trim()
                .toUpperCase();


            pokemon =
                pokemon.filter(

                    entry =>

                        (
                            entry.ability1
                            &&
                            entry.ability1.name ===
                            ability
                        )

                        ||

                        (
                            entry.ability2
                            &&
                            entry.ability2.name ===
                            ability
                        )

                );

        }


        //--------------------------------
        // Sort
        //--------------------------------

        switch(
            options.sort
        )
        {

            case "number-desc":

                pokemon.sort(

                    (a, b) =>

                        Number(
                            b.nationalDexNumber
                        )
                        -
                        Number(
                            a.nationalDexNumber
                        )

                );

                break;


            case "name":

                pokemon.sort(

                    (a, b) =>

                        a.name.localeCompare(
                            b.name
                        )

                );

                break;


            case "name-desc":

                pokemon.sort(

                    (a, b) =>

                        b.name.localeCompare(
                            a.name
                        )

                );

                break;


            case "number":

            default:

                pokemon.sort(

                    (a, b) =>

                        Number(
                            a.nationalDexNumber
                        )
                        -
                        Number(
                            b.nationalDexNumber
                        )

                );

                break;

        }


        return pokemon;

    }


    //--------------------------------
    // Paginate Pokémon
    //--------------------------------

    paginate(
        pokemon,
        page = 1,
        limit = 24
    )
    {

        const safePage =
            Math.max(
                1,
                Number(
                    page
                )
                ||
                1
            );


        const safeLimit =
            Math.max(
                1,
                Number(
                    limit
                )
                ||
                24
            );


        const total =
            pokemon.length;


        const pages =
            Math.ceil(
                total /
                safeLimit
            );


        const start =
            (
                safePage -
                1
            )
            *
            safeLimit;


        const items =
            pokemon.slice(

                start,

                start +
                safeLimit

            );


        return {

            items,

            pagination:
            {

                page:
                    safePage,

                limit:
                    safeLimit,

                total,

                pages

            }

        };

    }


}


module.exports =
    PokemonService;
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
 * - Combine Pokémon gift events.
 * - Create availability rules.
 * - Generate cumulative progression availability.
 * - Track starter selection restrictions.
 * - Track FireRed-specific availability restrictions.
 * - Track external trade routes.
 *
 * Does NOT:
 * - Recommend teams.
 * - Handle battles.
 * - Calculate damage.
 * - Execute progression.
 * - Parse source files.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");


const EvolutionRequirementService =
    require("../services/evolution-requirement-service");





class PokemonAvailabilityBuilder
{


    constructor(
        pokemonDatabase,
        encounterDatabase,
        evolutionDatabase,
        itemDatabase = null,
        progressionRules = null,
        starterSelectionService = null,
        playerState = null,
        eventDatabase = null,
        locationDatabase = null
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
            playerState || null;


        this.events =
            eventDatabase || {};


        this.locations =
            locationDatabase || {};


        this.evolutionService =
            new EvolutionRequirementService(

                this.evolutions

            );


        //--------------------------------
        // Keep progression rules available
        // for future validation, but do not
        // use them as gym-order thresholds.
        //--------------------------------

        this.rules =
            Array.isArray(
                progressionRules
            )
            ?
            progressionRules
            :
            [];
        
        
        this.progressionRulesByLocation =
            this.buildProgressionRuleIndex();


        //--------------------------------
        // Stage definitions
        //
        // These are cumulative snapshots.
        //
        // They do NOT mean:
        //
        // "the player has exactly this gym
        // and nothing else."
        //
        // They mean:
        //
        // "the player can have reached this
        // point in a valid FireRed playthrough."
        //--------------------------------

        this.stages =
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


        //--------------------------------
        // Cache cumulative stage states.
        //--------------------------------

        this.stageStates =
            null;

    }





    //--------------------------------
    // Build database
    //--------------------------------

    build()
    {

        return this.pokemon

            .filter(

                pokemon =>

                    pokemon

                    &&

                    pokemon.constant !==
                        "SPECIES_NONE"

            )

            .map(

                pokemon =>

                    this.buildPokemonAvailability(

                        pokemon

                    )

            );

    }





    //--------------------------------
    // Build single Pokémon
    //--------------------------------

    buildPokemonAvailability(
        pokemon
    )
    {

        const species =
            this.getSpeciesName(
                pokemon
            );


        const evolution =
            this.evolutionService.getEvolutionSource(

                pokemon.constant

            );


        const locations =
            this.getLocations(
                species
            );


        const gifts =
            this.getGiftEvents(
                pokemon
            );


        return {

            species,

            constant:
                pokemon.constant,

            starterRestriction:
                this.getStarterRestriction(
                    species
                ),

            sources:
                this.getSources(
                    pokemon,
                    evolution,
                    locations,
                    gifts
                ),

            locations,

            availability:
                this.calculateAvailability(
                    pokemon,
                    evolution,
                    species,
                    locations,
                    gifts
                ),

            restriction:
                this.getRestriction(
                    pokemon,
                    evolution
                ),

            tradeAvailability:
                this.getTradeAvailability(
                    pokemon,
                    evolution
                ),

            progression:
                this.calculateProgression(
                    pokemon,
                    species,
                    locations,
                    gifts
                )

        };

    }





    //--------------------------------
    // Resolve species name
    //--------------------------------

    getSpeciesName(
        pokemon
    )
    {

        if(
            pokemon
            &&
            typeof pokemon.name ===
                "string"
            &&
            pokemon.name.trim()
        )
        {

            return pokemon.name
                .trim()
                .toUpperCase();

        }


        if(
            pokemon
            &&
            typeof pokemon.constant ===
                "string"
        )
        {

            return pokemon.constant

                .replace(
                    /^SPECIES_/,
                    ""
                )

                .toUpperCase();

        }


        return null;

    }





    //--------------------------------
    // Sources
    //--------------------------------

    getSources(
        pokemon,
        evolution,
        locations = null,
        gifts = null
    )
    {

        const sources = [];


        const species =
            this.getSpeciesName(
                pokemon
            );


        const resolvedLocations =
            locations
            ||
            this.getLocations(
                species
            );


        const resolvedGifts =
            gifts
            ||
            this.getGiftEvents(
                pokemon
            );


        //--------------------------------
        // Starter
        //--------------------------------

        if(
            this.isStarter(
                species
            )
        )
        {

            sources.push({

                method:
                    "STARTER"

            });

        }


        //--------------------------------
        // Wild
        //--------------------------------

        for(
            const location of
                resolvedLocations
        )
        {

            sources.push({

                method:
                    "WILD",

                location:
                    location.location,

                encounterMethod:
                    location.method,

                displayMethod:
                    location.displayMethod,

                encounterRate:
                    location.encounterRate,

                rod:
                    location.rod,

                slotIndex:
                    location.slotIndex,

                slotEncounterRate:
                    location.slotEncounterRate,

                minLevel:
                    location.minLevel,

                maxLevel:
                    location.maxLevel

            });

        }


        //--------------------------------
        // Evolution
        //--------------------------------

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


        //--------------------------------
        // Gift Pokémon
        //--------------------------------

        const seenGiftSources =
            new Set();


        for(
            const gift of
                resolvedGifts
        )
        {

            const key =
            [
                gift.script,
                gift.level,
                gift.location

            ]
            .join("|");


            if(
                seenGiftSources.has(
                    key
                )
            )
            {

                continue;

            }


            seenGiftSources.add(
                key
            );


            sources.push({

                method:
                    "GIFT",

                script:
                    gift.script,

                level:
                    gift.level,

                location:
                    gift.location

            });

        }


        //--------------------------------
        // External trade
        //--------------------------------

        if(
            this.hasExternalTradeRoute(
                pokemon
            )
        )
        {

            sources.push({

                method:
                    "EXTERNAL_TRADE",

                games:
                    this.getExternalTradeGames(
                        pokemon
                    ),

                reason:
                    this.getExternalTradeReason(
                        pokemon
                    )

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

        if(
            !species
        )
        {

            return [];

        }


        const normalizedSpecies =
            this.normalizeSpeciesValue(
                species
            );


        const locations = [];


        for(
            const encounter of
                this.encounters
        )
        {

            if(
                !encounter
                ||
                !Array.isArray(
                    encounter.mons
                )
            )
            {

                continue;

            }


            for(
                const mon of
                    encounter.mons
            )
            {

                const monSpecies =
                    this.normalizeSpeciesValue(
                        mon?.species
                    );


                if(
                    monSpecies !==
                    normalizedSpecies
                )
                {

                    continue;

                }


                if(
                    !encounter.map
                )
                {

                    continue;

                }


                locations.push({

                    location:
                        encounter.map,

                    method:
                        encounter.method ||
                        "WILD",

                    displayMethod:
                        this.getDisplayMethod(
                            encounter.method
                        ),

                    encounterRate:
                        encounter.encounterRate ??
                        null,

                    rod:
                        this.getFishingRodForSlot(
                            encounter,
                            mon?.slotIndex
                        ),

                    slotIndex:
                        mon?.slotIndex ??
                        null,

                    slotEncounterRate:
                        mon?.slotEncounterRate ??
                        null,

                    minLevel:
                        mon?.minLevel ??
                        null,

                    maxLevel:
                        mon?.maxLevel ??
                        null

                });

            }

        }


        return locations;

    }





    //--------------------------------
    // Resolve fishing rod
    //--------------------------------

    getFishingRodForSlot(
        encounter,
        slotIndex
    )
    {

        if(
            encounter?.method !==
                "fishing_mons"
        )
        {

            return null;

        }


        if(
            !encounter.rodGroups
            ||
            slotIndex === null
            ||
            slotIndex === undefined
        )
        {

            return null;

        }


        for(
            const [rod, slots] of
                Object.entries(
                    encounter.rodGroups
                )
        )
        {

            if(
                Array.isArray(
                    slots
                )
                &&
                slots.includes(
                    slotIndex
                )
            )
            {

                return rod;

            }

        }


        return null;

    }





    //--------------------------------
    // Display encounter method
    //--------------------------------

    getDisplayMethod(
        method
    )
    {

        const methods =
        {

            land_mons:
                "Grass",

            water_mons:
                "Surf",

            fishing_mons:
                "Fishing",

            rock_smash_mons:
                "Rock Smash"

        };


        return (

            methods[method]

            ||

            method

            ||

            "Wild"

        );

    }





    //--------------------------------
    // Gift events
    //--------------------------------

    getGiftEvents(
        pokemon
    )
    {

        if(
            !pokemon
            ||
            !this.events
            ||
            typeof this.events !==
                "object"
        )
        {

            return [];

        }


        const targetSpecies =
            this.normalizeSpeciesValue(
                pokemon.constant
            );


        if(
            !targetSpecies
        )
        {

            return [];

        }


        const gifts = [];


        for(
            const event of
                Object.values(
                    this.events
                )
        )
        {

            if(
                !event
                ||
                !event.effects
                ||
                !Array.isArray(
                    event.effects.addPokemon
                )
            )
            {

                continue;

            }


            for(
                const gift of
                    event.effects.addPokemon
            )
            {

                if(
                    !gift
                )
                {

                    continue;

                }


                const giftSpecies =
                    this.normalizeSpeciesValue(
                        gift.species
                    );


                if(
                    giftSpecies !==
                    targetSpecies
                )
                {

                    continue;

                }


                const level =
                    gift.level !==
                        undefined
                    &&
                    gift.level !==
                        null
                    ?
                    Number(
                        gift.level
                    )
                    :
                    null;


                const location =
                    this.getEventLocation(
                        event
                    );


                const script =
                    event.id
                    ||
                    null;


                const key =
                [
                    script,
                    giftSpecies,
                    level,
                    location

                ]
                .join("|");


                if(
                    gifts.some(

                        existing =>

                            existing.key ===
                            key

                    )
                )
                {

                    continue;

                }


                gifts.push({

                    key,

                    script,

                    species:
                        giftSpecies,

                    level,

                    location

                });

            }

        }


        return gifts.map(

            gift =>
            ({

                script:
                    gift.script,

                species:
                    gift.species,

                level:
                    gift.level,

                location:
                    gift.location

            })

        );

    }





    //--------------------------------
    // Resolve event location
    //--------------------------------

    getEventLocation(
        event
    )
    {

        if(
            !event
        )
        {

            return null;

        }


        if(
            typeof event.map ===
                "string"
            &&
            event.map
        )
        {

            return event.map;

        }


        if(
            typeof event.sourceLocation ===
                "string"
            &&
            event.sourceLocation
        )
        {

            return event.sourceLocation;

        }


        if(
            typeof event.location ===
                "string"
            &&
            event.location
        )
        {

            return event.location;

        }


        return null;

    }





    //--------------------------------
    // Normalize species
    //--------------------------------

    normalizeSpeciesValue(
        species
    )
    {

        if(
            species ===
                null
            ||
            species ===
                undefined
        )
        {

            return null;

        }


        return String(
            species
        )

        .replace(
            /^SPECIES_/,
            ""
        )

        .toUpperCase();

    }





    //--------------------------------
    // Availability
    //--------------------------------

    calculateAvailability(
        pokemon,
        evolution,
        species = null,
        locations = null,
        gifts = null
    )
    {

        const resolvedSpecies =
            species
            ||
            this.getSpeciesName(
                pokemon
            );


        const resolvedLocations =
            locations
            ||
            this.getLocations(
                resolvedSpecies
            );


        const resolvedGifts =
            gifts
            ||
            this.getGiftEvents(
                pokemon
            );


        return {

            starter:
                this.isStarter(
                    resolvedSpecies
                ),

            starterLine:
                this.isStarterLine(
                    resolvedSpecies
                ),

            wild:
                resolvedLocations.length >
                    0,

            evolution:
                Boolean(
                    evolution
                ),

            trade:
                this.isTradeEvolution(
                    evolution
                )
                ||
                this.hasExternalTradeRoute(
                    pokemon
                ),

            item:
                this.hasItemEvolution(
                    evolution
                ),

            gift:
                resolvedGifts.length >
                    0

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

                blocked:
                    false,

                reason:
                    null

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

                blocked:
                    false,

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

                blocked:
                    false,

                reason:
                    null

            };

        }


        return {

            blocked:
                true,

            reason:
                "Different starter selected"

        };

    }





    //--------------------------------
    // FireRed restrictions
    //--------------------------------

    getRestriction(
        pokemon,
        evolution
    )
    {

        const species =
            pokemon?.constant;


        //--------------------------------
        // Espeon / Umbreon
        //--------------------------------

        if(
            species ===
                "SPECIES_ESPEON"
            ||
            species ===
                "SPECIES_UMBREON"
        )
        {

            return {

                blocked:
                    true,

                type:
                    "TIME_CYCLE",

                reason:
                    "FireRed has no day/night cycle, so this Pokémon cannot be evolved natively in FireRed."

            };

        }


        //--------------------------------
        // No restriction
        //--------------------------------

        return {

            blocked:
                false,

            type:
                null,

            reason:
                null

        };

    }





    //--------------------------------
    // External trade route
    //--------------------------------

    hasExternalTradeRoute(
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

            pokemon.constant ===
                "SPECIES_ESPEON"

            ||

            pokemon.constant ===
                "SPECIES_UMBREON"

        );

    }





    //--------------------------------
    // External trade games
    //--------------------------------

    getExternalTradeGames(
        pokemon
    )
    {

        if(
            !this.hasExternalTradeRoute(
                pokemon
            )
        )
        {

            return [];

        }


        return [

            "RUBY",

            "SAPPHIRE",

            "EMERALD"

        ];

    }





    //--------------------------------
    // External trade reason
    //--------------------------------

    getExternalTradeReason(
        pokemon
    )
    {

        if(
            !pokemon
        )
        {

            return null;

        }


        if(
            pokemon.constant ===
                "SPECIES_ESPEON"
        )
        {

            return (

                "Trade Eevee to Ruby, Sapphire, " +
                "or Emerald, evolve it with the " +
                "required friendship and daytime " +
                "condition, then trade Espeon back."

            );

        }


        if(
            pokemon.constant ===
                "SPECIES_UMBREON"
        )
        {

            return (

                "Trade Eevee to Ruby, Sapphire, " +
                "or Emerald, evolve it with the " +
                "required friendship and nighttime " +
                "condition, then trade Umbreon back."

            );

        }


        return null;

    }





    //--------------------------------
    // Trade availability
    //--------------------------------

    getTradeAvailability(
        pokemon,
        evolution
    )
    {

        if(
            !pokemon
        )
        {

            return {

                available:
                    false,

                games:
                    [],

                reason:
                    null

            };

        }


        //--------------------------------
        // External trade
        //--------------------------------

        if(
            this.hasExternalTradeRoute(
                pokemon
            )
        )
        {

            return {

                available:
                    true,

                games:
                    this.getExternalTradeGames(
                        pokemon
                    ),

                reason:
                    this.getExternalTradeReason(
                        pokemon
                    )

            };

        }


        //--------------------------------
        // Trade evolution
        //--------------------------------

        if(
            this.isTradeEvolution(
                evolution
            )
        )
        {

            return {

                available:
                    true,

                games:
                [

                    "FIRERED",

                    "LEAFGREEN",

                    "RUBY",

                    "SAPPHIRE",

                    "EMERALD"

                ],

                reason:
                    "Requires a trade evolution."

            };

        }


        //--------------------------------
        // No trade availability
        //--------------------------------

        return {

            available:
                false,

            games:
                [],

            reason:
                null

        };

    }





    //--------------------------------
    // Progression
    //--------------------------------

    calculateProgression(
        pokemon,
        species = null,
        locations = null,
        gifts = null
    )
    {

        const progression = {};


        const resolvedSpecies =
            species
            ||
            this.getSpeciesName(
                pokemon
            );


        const resolvedLocations =
            locations
            ||
            this.getLocations(
                resolvedSpecies
            );


        const resolvedGifts =
            gifts
            ||
            this.getGiftEvents(
                pokemon
            );


        //--------------------------------
        // Build cumulative stage states
        //--------------------------------

        const states =
            this.buildCumulativeStageStates();


        for(
            const stage of
                this.stages
        )
        {

            progression[stage] =
                this.canExistByStage(

                    pokemon,

                    resolvedSpecies,

                    stage,

                    resolvedLocations,

                    resolvedGifts,

                    states[stage]

                );

        }


        return progression;

    }





    //--------------------------------
    // Stage availability
    //--------------------------------

    canExistByStage(
        pokemon,
        species,
        stage,
        locations = null,
        gifts = null,
        state = null
    )
    {

        //--------------------------------
        // Mewtwo
        //--------------------------------

        if(
            species ===
                "MEWTWO"
        )
        {

            return stage ===
                "POST_GAME";

        }


        //--------------------------------
        // Starter
        //--------------------------------

        if(
            this.isStarter(
                species
            )
        )
        {

            return true;

        }


        //--------------------------------
        // Evolution restriction
        //--------------------------------

        const restriction =
            this.getRestriction(
                pokemon,

                this.evolutionService.getEvolutionSource(

                    pokemon.constant

                )

            );


        if(
            restriction.blocked
        )
        {

            //--------------------------------
            // Espeon / Umbreon can still be
            // obtained by their documented
            // external trade route.
            //--------------------------------

            if(
                this.hasExternalTradeRoute(
                    pokemon
                )
            )
            {

                return true;

            }

        }


        //--------------------------------
        // Wild
        //--------------------------------

        const resolvedLocations =
            locations
            ||
            this.getLocations(
                species
            );


        const wildAvailable =
            resolvedLocations.length >
                0
            &&
            this.canAccessWildPokemonAtStage(

                resolvedLocations,

                stage,

                state

            );


        //--------------------------------
        // Gift
        //--------------------------------

        const resolvedGifts =
            gifts
            ||
            this.getGiftEvents(
                pokemon
            );


        const giftAvailable =
            resolvedGifts.length >
                0
            &&
            this.canAccessGiftPokemonAtStage(

                resolvedGifts,

                stage,

                state

            );


        //--------------------------------
        // Evolution
        //--------------------------------

        const evolution =
            this.evolutionService.getEvolutionSource(

                pokemon.constant

            );


        let evolutionAvailable =
            false;


        if(
            evolution
        )
        {

            const evolutionState =
                state
                ||
                {

                    maxReasonableLevel:
                        this.getStageMaxLevel(
                            stage
                        )

                };


            const result =
                this.evolutionService.canEvolveBeforeStage(

                    pokemon.constant,

                    evolutionState

                );


            evolutionAvailable =
                result.available;

        }


        //--------------------------------
        // Trade evolution
        //--------------------------------

        const tradeEvolutionAvailable =
            this.isTradeEvolution(
                evolution
            )
            &&
            this.canPerformTradeEvolutionAtStage(

                pokemon,

                stage,

                state

            );


        //--------------------------------
        // External trade
        //
        // Espeon/Umbreon are represented as
        // documented cross-game routes.
        //--------------------------------

        const externalTradeAvailable =
            this.hasExternalTradeRoute(
                pokemon
            )
            &&
            this.canPerformExternalTradeAtStage(

                pokemon,

                stage,

                state

            );


        //--------------------------------
        // Any valid route
        //--------------------------------

        return (

            wildAvailable

            ||

            giftAvailable

            ||

            evolutionAvailable

            ||

            tradeEvolutionAvailable

            ||

            externalTradeAvailable

        );

    }





    //--------------------------------
    // Wild availability by stage
    //--------------------------------

    canAccessWildPokemonAtStage(
        locations,
        stage,
        state = null
    )
    {

        if(
            !Array.isArray(
                locations
            )
            ||
            locations.length ===
                0
        )
        {

            return false;

        }


        for(
            const locationId of
                locations
        )
        {

            if(
                this.canAccessLocationAtStage(

                    locationId,

                    stage,

                    state

                )
            )
            {

                return true;

            }

        }


        return false;

    }





    //--------------------------------
    // Gift availability by stage
    //--------------------------------

    canAccessGiftPokemonAtStage(
        gifts,
        stage,
        state = null
    )
    {

        if(
            !Array.isArray(
                gifts
            )
            ||
            gifts.length ===
                0
        )
        {

            return false;

        }


        for(
            const gift of
                gifts
        )
        {

            if(
                !gift.location
            )
            {

                continue;

            }


            if(
                this.canAccessLocationAtStage(

                    gift.location,

                    stage,

                    state

                )
            )
            {

                return true;

            }

        }


        return false;

    }





    //--------------------------------
    // Progression rule index
    //--------------------------------

    buildProgressionRuleIndex()
    {

        const index = {};


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
                !index[rule.location]
            )
            {

                index[rule.location] =
                    [];

            }


            index[rule.location].push(
                rule
            );

        }


        return index;

    }





    //--------------------------------
    // Location progression
    //--------------------------------

    canAccessLocationAtStage(
        locationId,
        stage,
        state = null
    )
    {

        if(
            !locationId
            ||
            !this.locations
            ||
            typeof this.locations !==
                "object"
        )
        {

            return false;

        }


        if(
            !this.locations[locationId]
        )
        {

            return false;

        }


        //--------------------------------
        // Use cumulative state when supplied.
        //--------------------------------

        const resolvedState =
            state
            ||
            this.buildStageState(
                stage
            );


        //--------------------------------
        // Starting maps
        //--------------------------------

        const startingLocations =
            this.getStartingLocations();


        if(
            startingLocations.includes(
                locationId
            )
        )
        {

            return true;

        }


        //--------------------------------
        // Traverse from every legitimate
        // starting location.
        //--------------------------------

        const visited =
            new Set();


        const queue =
        [

            ...startingLocations

        ];


        while(
            queue.length >
                0
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


            if(
                current ===
                    locationId
            )
            {

                return true;

            }


            const location =
                this.locations[current];


            if(
                !location
            )
            {

                continue;

            }


            //--------------------------------
            // A soft gate never blocks
            // traversal.
            //--------------------------------

            if(
                !this.isLocationUsableAtStage(

                    location,

                    stage,

                    resolvedState

                )
            )
            {

                continue;

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

                        resolvedState

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
        state = null
    )
    {
    
        if(
            !location
        )
        {
        
            return false;
        
        }
    
    
        const resolvedState =
            state
            ||
            this.buildStageState(
                stage
            );
        
        
        //--------------------------------
        // Generated location hard gates
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
        
            if(
                !this.isGateSatisfiedAtStage(
                
                    gate,
                
                    stage,
                
                    resolvedState
                
                )
            )
            {
            
                return false;
            
            }
        
        }
    
    
        //--------------------------------
        // FireRed progression rules
        //--------------------------------
        //
        // These are separate from physical
        // map gates.
        //
        // Example:
        //
        // MAP_SAFFRON_CITY
        //     requires TEA
        //
        // This prevents the unrestricted
        // world graph from bypassing the
        // actual story route.
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
                
                    rule.type
                
                    ||
                
                    ""
                
                )
                .toUpperCase();
            
            
            //--------------------------------
            // Completion rules do not block
            // entering the location.
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
            // Only rules with real
            // requirements can block.
            //--------------------------------
        
            if(
                !rule.requirement
            )
            {
            
                continue;
            
            }
        
        
            if(
                !this.isRequirementSatisfiedAtStage(
                
                    rule.requirement,
                
                    stage,
                
                    resolvedState
                
                )
            )
            {
            
                return false;
            
            }
        
        }
    
    
        return true;
    
    }





    //--------------------------------
    // Connection usability
    //--------------------------------

    isConnectionUsableAtStage(
        connection,
        stage,
        state = null
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
                !this.isRequirementSatisfiedAtStage(

                    requirement,

                    stage,

                    state

                )
            )
            {

                return false;

            }

        }


        return true;

    }





    //--------------------------------
    // Gate stage evaluation
    //--------------------------------

    isGateSatisfiedAtStage(
        gate,
        stage,
        state = null
    )
    {

        if(
            !gate
        )
        {

            return true;

        }


        return this.isRequirementSatisfiedAtStage(

            gate,

            stage,

            state

        );

    }





    //--------------------------------
    // Requirement stage evaluation
    //--------------------------------

    isRequirementSatisfiedAtStage(
        requirement,
        stage,
        state = null
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

            return this.isNamedRequirementSatisfiedAtStage(

                requirement,

                stage,

                state

            );

        }


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

            return this.isNamedRequirementSatisfiedAtStage(

                type,

                stage,

                state

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

            return requirement.abilities.every(

                ability =>

                    this.isNamedRequirementSatisfiedAtStage(

                        ability,

                        stage,

                        state

                    )

            );

        }


        //--------------------------------
        // HM requirements
        //--------------------------------

        if(
            Array.isArray(
                requirement.hms
            )
        )
        {

            return requirement.hms.every(

                hm =>

                    this.isNamedRequirementSatisfiedAtStage(

                        hm,

                        stage,

                        state

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

            return this.areBadgesSatisfiedAtStage(

                requirement.badges,

                stage,

                state

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

            return this.areKeyItemsSatisfiedAtStage(

                requirement.keyItems,

                stage,

                state

            );

        }


        //--------------------------------
        // Single badge
        //--------------------------------

        if(
            requirement.badge
        )
        {

            return this.isBadgeSatisfiedAtStage(

                requirement.badge,

                stage,

                state

            );

        }


        //--------------------------------
        // Single key item
        //--------------------------------

        if(
            requirement.keyItem
        )
        {

            return this.isKeyItemSatisfiedAtStage(

                requirement.keyItem,

                stage,

                state

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

            return requirement.storyFlags.every(

                flag =>

                    this.isStoryFlagSatisfiedAtStage(

                        flag,

                        stage,

                        state

                    )

            );

        }


        //--------------------------------
        // Unknown requirement
        //--------------------------------

        return true;

    }





    //--------------------------------
    // Named requirement
    //--------------------------------

    isNamedRequirementSatisfiedAtStage(
        requirement,
        stage,
        state = null
    )
    {

        if(
            !requirement
        )
        {

            return true;

        }


        const value =
            String(
                requirement
            )
            .toUpperCase();


        const resolvedState =
            state
            ||
            this.buildStageState(
                stage
            );


        //--------------------------------
        // Always available
        //--------------------------------

        if(
            value ===
                "NONE"
        )
        {

            return true;

        }


        //--------------------------------
        // Abilities
        //--------------------------------

        if(
            resolvedState.abilities.includes(
                value
            )
        )
        {

            return true;

        }


        //--------------------------------
        // HM aliases
        //--------------------------------

        const hmAbilityMap =
        {

            CUT:
                "CAN_USE_CUT",

            FLASH:
                "CAN_USE_FLASH",

            SURF:
                "CAN_USE_SURF",

            STRENGTH:
                "CAN_USE_STRENGTH",

            FLY:
                "CAN_USE_FLY",

            ROCK_SMASH:
                "CAN_USE_ROCK_SMASH"

        };


        if(
            hmAbilityMap[value]
            &&
            resolvedState.abilities.includes(
                hmAbilityMap[value]
            )
        )
        {

            return true;

        }


        //--------------------------------
        // Badges
        //--------------------------------

        if(
            resolvedState.badges.includes(
                value
            )
        )
        {

            return true;

        }


        //--------------------------------
        // Key items
        //--------------------------------

        if(
            resolvedState.keyItems.includes(
                value
            )
        )
        {

            return true;

        }


        //--------------------------------
        // Story flags
        //--------------------------------

        if(
            resolvedState.storyFlags.includes(
                value
            )
        )
        {

            return true;

        }


        return false;

    }





    //--------------------------------
    // Badge list
    //--------------------------------

    areBadgesSatisfiedAtStage(
        badges,
        stage,
        state = null
    )
    {

        return badges.every(

            badge =>

                this.isBadgeSatisfiedAtStage(

                    badge,

                    stage,

                    state

                )

        );

    }





    //--------------------------------
    // Single badge
    //--------------------------------

    isBadgeSatisfiedAtStage(
        badge,
        stage,
        state = null
    )
    {

        if(
            !badge
        )
        {

            return true;

        }


        const resolvedState =
            state
            ||
            this.buildStageState(
                stage
            );


        return resolvedState.badges.includes(

            String(
                badge
            )
            .toUpperCase()

        );

    }





    //--------------------------------
    // Key item list
    //--------------------------------

    areKeyItemsSatisfiedAtStage(
        keyItems,
        stage,
        state = null
    )
    {

        return keyItems.every(

            keyItem =>

                this.isKeyItemSatisfiedAtStage(

                    keyItem,

                    stage,

                    state

                )

        );

    }





    //--------------------------------
    // Single key item
    //--------------------------------

    isKeyItemSatisfiedAtStage(
        keyItem,
        stage,
        state = null
    )
    {

        if(
            !keyItem
        )
        {

            return true;

        }


        const resolvedState =
            state
            ||
            this.buildStageState(
                stage
            );


        return resolvedState.keyItems.includes(

            String(
                keyItem
            )
            .toUpperCase()

        );

    }





    //--------------------------------
    // Story flag
    //--------------------------------

    isStoryFlagSatisfiedAtStage(
        flag,
        stage,
        state = null
    )
    {

        if(
            !flag
        )
        {

            return true;

        }


        const resolvedState =
            state
            ||
            this.buildStageState(
                stage
            );


        return resolvedState.storyFlags.includes(

            String(
                flag
            )
            .toUpperCase()

        );

    }





    //--------------------------------
    // Stage max evolution level
    //--------------------------------

    getStageMaxLevel(
        stage
    )
    {

        const levels =
        {

            BROCK:
                20,

            MISTY:
                30,

            LT_SURGE:
                35,

            ERIKA:
                40,

            KOGA:
                45,

            SABRINA:
                50,

            BLAINE:
                55,

            GIOVANNI:
                55,

            ELITE_FOUR:
                60,

            CHAMPION:
                65,

            POST_GAME:
                100

        };


        return levels[stage]
            ||
            100;

    }





    //--------------------------------
    // Cumulative stage states
    //--------------------------------

    buildCumulativeStageStates()
    {

        if(
            this.stageStates
        )
        {

            return this.stageStates;

        }


        const states = {};


        //--------------------------------
        // Start with the absolute minimum
        // state.
        //--------------------------------

        let current =
        {

            badges:
                [],

            keyItems:
                [],

            abilities:
                [],

            storyFlags:
                []

        };


        for(
            const stage of
                this.stages
        )
        {

            current =
                this.buildStageState(

                    stage,

                    current

                );


            states[stage] =
            {

                badges:
                    [
                        ...current.badges
                    ],

                keyItems:
                    [
                        ...current.keyItems
                    ],

                abilities:
                    [
                        ...current.abilities
                    ],

                storyFlags:
                    [
                        ...current.storyFlags
                    ]

            };

        }


        this.stageStates =
            states;


        return states;

    }





    //--------------------------------
    // Build one stage state
    //--------------------------------

    buildStageState(
        stage,
        previousState = null
    )
    {

        const base =
            previousState
            ?
            {

                badges:
                    [
                        ...(previousState.badges || [])
                    ],

                keyItems:
                    [
                        ...(previousState.keyItems || [])
                    ],

                abilities:
                    [
                        ...(previousState.abilities || [])
                    ],

                storyFlags:
                    [
                        ...(previousState.storyFlags || [])
                    ]

            }
            :
            {

                badges:
                    [],

                keyItems:
                    [],

                abilities:
                    [],

                storyFlags:
                    []

            };


        //--------------------------------
        // Stage badge
        //
        // Each stage is cumulative.
        //--------------------------------

        const badgeByStage =
        [

            "BOULDER_BADGE",

            "CASCADE_BADGE",

            "THUNDER_BADGE",

            "RAINBOW_BADGE",

            "SOUL_BADGE",

            "MARSH_BADGE",

            "VOLCANO_BADGE",

            "EARTH_BADGE"

        ];


        const stageIndex =
            this.stages.indexOf(
                stage
            );


        if(
            stageIndex >= 0
        )
        {

            const badgeCount =
                Math.min(

                    stageIndex + 1,

                    badgeByStage.length

                );


            for(
                let index = 0;
                index < badgeCount;
                index++
            )
            {

                this.addUnique(

                    base.badges,

                    badgeByStage[index]

                );

            }

        }


        //--------------------------------
        // Story/event progression
        //--------------------------------
        //
        // Only add story milestones that
        // are actually known to occur by
        // this stage.
        //
        // These are intentionally kept
        // separate from gym completion.
        //--------------------------------

        if(
            stageIndex >=
                this.stages.indexOf(
                    "BROCK"
                )
        )
        {

            this.addUnique(

                base.storyFlags,

                "POKEDEX_RECEIVED"

            );

        }


        //--------------------------------
        // HM / ability progression
        //
        // Cut becomes usable after Cascade.
        // Flash becomes usable after Boulder.
        // Surf becomes usable after Koga.
        // Strength becomes usable after Erika.
        // Fly becomes usable after Lt. Surge.
        //--------------------------------

        if(
            stageIndex >=
                this.stages.indexOf(
                    "BROCK"
                )
        )
        {

            this.addUnique(

                base.abilities,

                "CAN_USE_FLASH"

            );

        }


        if(
            stageIndex >=
                this.stages.indexOf(
                    "MISTY"
                )
        )
        {

            this.addUnique(

                base.abilities,

                "CAN_USE_CUT"

            );

        }


        if(
            stageIndex >=
                this.stages.indexOf(
                    "LT_SURGE"
                )
        )
        {

            this.addUnique(

                base.abilities,

                "CAN_USE_FLY"

            );

        }


        if(
            stageIndex >=
                this.stages.indexOf(
                    "KOGA"
                )
        )
        {

            this.addUnique(

                base.abilities,

                "CAN_USE_SURF"

            );

        }


        if(
            stageIndex >=
                this.stages.indexOf(
                    "ERIKA"
                )
        )
        {

            this.addUnique(

                base.abilities,

                "CAN_USE_STRENGTH"

            );

        }


        //--------------------------------
        // S.S. Ticket
        //--------------------------------

        if(
            stageIndex >=
                this.stages.indexOf(
                    "MISTY"
                )
        )
        {

            this.addUnique(

                base.keyItems,

                "SS_TICKET"

            );

        }


        //--------------------------------
        // Tea / Saffron access
        //
        // Tea is obtainable after reaching
        // Celadon. It is NOT inherently tied
        // to Sabrina.
        //
        // For the availability snapshot,
        // we model it as obtainable by the
        // earliest stage where the alternate
        // Celadon → Saffron route is possible.
        //--------------------------------

        if(
            stageIndex >=
                this.stages.indexOf(
                    "MISTY"
                )
        )
        {

            this.addUnique(

                base.keyItems,

                "TEA"

            );

        }


        //--------------------------------
        // Silph Co. event
        //
        // Once the state reaches the point
        // where Saffron and Silph Co. are
        // reachable, this milestone can be
        // available independently from Gym 4.
        //--------------------------------

        if(
            stageIndex >=
                this.stages.indexOf(
                    "MISTY"
                )
        )
        {

            this.addUnique(

                base.storyFlags,

                "SILPH_CO_COMPLETED"

            );

        }


        return base;

    }





    //--------------------------------
    // Trade evolution availability
    //--------------------------------

    canPerformTradeEvolutionAtStage(
        pokemon,
        stage,
        state = null
    )
    {

        const resolvedState =
            state
            ||
            this.buildStageState(
                stage
            );


        //--------------------------------
        // A trade route exists only when
        // the game is already at a point
        // where trading is possible.
        //
        // FireRed trade access is not treated
        // as a universal "Brock" property.
        //--------------------------------

        return (

            resolvedState.keyItems.includes(
                "SS_TICKET"
            )
            ||
            stage ===
                "POST_GAME"
            ||
            stage ===
                "CHAMPION"
        );

    }





    //--------------------------------
    // External trade availability
    //--------------------------------

    canPerformExternalTradeAtStage(
        pokemon,
        stage,
        state = null
    )
    {

        if(
            !this.hasExternalTradeRoute(
                pokemon
            )
        )
        {

            return false;

        }


        //--------------------------------
        // External trade is represented
        // as a post-early-game capability.
        //
        // The important distinction is
        // that this is a trade route, not
        // native FireRed evolution.
        //--------------------------------

        const resolvedState =
            state
            ||
            this.buildStageState(
                stage
            );


        return (

            resolvedState.keyItems.includes(
                "SS_TICKET"
            )
            ||
            stage ===
                "POST_GAME"
        );

    }





    //--------------------------------
    // Add unique
    //--------------------------------

    addUnique(
        array,
        value
    )
    {

        if(
            !Array.isArray(
                array
            )
            ||
            !value
        )
        {

            return;

        }


        if(
            !array.includes(
                value
            )
        )
        {

            array.push(
                value
            );

        }

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

            this.normalizeSpeciesValue(
                name
            )

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

            this.normalizeSpeciesValue(
                name
            )

        );

    }





    //--------------------------------
    // Trade evolution
    //--------------------------------

    isTradeEvolution(
        evolution
    )
    {

        if(
            !evolution
        )
        {

            return false;

        }


        const method =
            evolution.requirement?.method;


        return (

            method ===
                "EVO_TRADE"

            ||

            method ===
                "EVO_TRADE_ITEM"

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
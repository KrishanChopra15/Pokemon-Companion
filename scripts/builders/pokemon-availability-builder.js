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
 * - Combine special/static encounters.
 * - Create availability rules.
 * - Generate cumulative progression availability.
 * - Track starter selection restrictions.
 * - Track FireRed-specific availability restrictions.
 * - Track external trade routes.
 * - Track cross-game availability.
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


const PokemonAvailabilityProgressionBuilder =
    require("./availability/pokemon-availability-progression-builder");





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


        //--------------------------------
        // Build-time progression coordinator.
        //
        // The detailed stage graph, requirement
        // evaluation, cumulative states, and
        // progression calculations live in the
        // dedicated progression builder.
        //--------------------------------

        this.progressionBuilder =
            new PokemonAvailabilityProgressionBuilder(

                this.rules,

                this.locations,

                this.evolutionService,

                {
                    getSpeciesName:
                        pokemon =>
                            this.getSpeciesName(
                                pokemon
                            ),

                    getLocations:
                        species =>
                            this.getProgressionLocations(
                                species
                            ),

                    getGiftEvents:
                        pokemon =>
                            this.getGiftEvents(
                                pokemon
                            ),

                    getRestriction:
                        (pokemon, evolution) =>
                            this.getRestriction(
                                pokemon,
                                evolution
                            ),

                    hasExternalTradeRoute:
                        pokemon =>
                            this.hasExternalTradeRoute(
                                pokemon
                            ),

                    getExternalTradeGames:
                        pokemon =>
                            this.getExternalTradeGames(
                                pokemon
                            ),

                    getExternalTradeReason:
                        pokemon =>
                            this.getExternalTradeReason(
                                pokemon
                            ),

                    isStarter:
                        species =>
                            this.isStarter(
                                species
                            ),

                    isTradeEvolution:
                        evolution =>
                            this.isTradeEvolution(
                                evolution
                            )
                }

            );


        //--------------------------------
        // Preserve the public stage collection
        // used by older callers.
        //--------------------------------

        this.stages =
            this.progressionBuilder.stages
            ||
            [
                "PRE_BROCK",
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


        const specialEncounters =
            this.getSpecialEncounterEvents(
                pokemon
            );


        const gameAvailability =
            this.getGameAvailability(
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
                    gifts,
                    specialEncounters
                ),

            locations,

            availability:
                this.calculateAvailability(
                    pokemon,
                    evolution,
                    species,
                    locations,
                    gifts,
                    specialEncounters
                ),

            gameAvailability,

            forms: 
                this.getFormAvailability( 
                    pokemon, 
                    species 
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
                    gifts,
                    specialEncounters
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
        gifts = null,
        specialEncounters = null
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


        const resolvedSpecialEncounters =
            specialEncounters
            ||
            this.getSpecialEncounterEvents(
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

                encounterCount:
                    1,

                script:
                    gift.script,

                level:
                    gift.level,

                location:
                    gift.location

            });

        }


        //--------------------------------
        // Special / static encounters
        //
        // Every separate event is preserved.
        //
        // Example:
        //
        // Route 12 Snorlax = 1
        // Route 16 Snorlax = 1
        //
        // These remain two sources rather
        // than becoming encounterCount: 2.
        //--------------------------------

        const seenSpecialSources =
            new Set();


        for(
            const special of
                resolvedSpecialEncounters
        )
        {

            const key =
            [
                special.script,
                special.species,
                special.location,
                special.level

            ]
            .join("|");


            if(
                seenSpecialSources.has(
                    key
                )
            )
            {

                continue;

            }


            seenSpecialSources.add(
                key
            );


            sources.push({
            
                method:
                    "SPECIAL",
            
                encounterCount:
                    1,
            
                script:
                    special.script,
            
                species:
                    special.species,
            
                location:
                    special.location,
            
                level:
                    special.level,
            
                form:
                    special.form,
            
                requirements:
                    special.requirements
                    ||
                    {
                        storyFlags: [],
                        items: [],
                        badges: []
                    },
                
                conditions:
                    special.conditions
                    ||
                    {
                        requireStoryFlags: [],
                        excludeStoryFlags: []
                    }
                
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
                this.getEventRecords()
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
                    event.eventId
                    ||
                    event.script
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
    // Special / static encounters
    //--------------------------------

    getSpecialEncounterEvents(
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


        const encounters = [];


        for(
            const event of
                this.getEventRecords()
        )
        {

            if(
                !event
            )
            {

                continue;

            }


            const entityType =
                String(
                    event.entityType
                    ||
                    ""
                )
                .trim()
                .toUpperCase();


            const roles =
                Array.isArray(
                    event.roles
                )
                ?
                event.roles
                :
                [];


            const normalizedRoles =
                roles.map(

                    role =>
                        String(
                            role
                            ||
                            ""
                        )
                        .trim()
                        .toUpperCase()

                );


            const isClassifiedSpecial =
                entityType ===
                    "SPECIAL_ENCOUNTER"
                ||
                normalizedRoles.includes(
                    "SPECIAL_ENCOUNTER"
                );


            //--------------------------------
            // Classified NPC/event records
            //--------------------------------

            if(
                isClassifiedSpecial
            )
            {

                const interactions =
                    Array.isArray(
                        event.interactions
                    )
                    ?
                    event.interactions
                    :
                    [];


                for(
                    const interaction of
                        interactions
                )
                {

                    if(
                        !interaction
                    )
                    {

                        continue;

                    }


                    const interactionType =
                        String(
                            interaction.type
                            ||
                            ""
                        )
                        .trim()
                        .toUpperCase();


                    if(
                        interactionType !==
                            "WILD_BATTLE"
                    )
                    {

                        continue;

                    }


                    const species =
                        this.normalizeSpeciesValue(
                            interaction.species
                        );


                    if(
                        species !==
                            targetSpecies
                    )
                    {

                        continue;

                    }


                    encounters.push(
                        this.createSpecialEncounterRecord(
                            event,
                            species,
                            interaction.level,
                            interaction.form || null
                        )
                    );

                }


                continue;

            }


            //--------------------------------
            // Raw event fallback
            //
            // EventScriptExtractor represents
            // setwildbattle calls as:
            //
            // effects.battles = [
            //     {
            //         type: "wild",
            //         species: "...",
            //         level: ...
            //     }
            // ]
            //
            // These are scripted/static
            // encounters, not normal encounter
            // table encounters.
            //--------------------------------

            const battles =
                Array.isArray(
                    event.effects?.battles
                )
                ?
                event.effects.battles
                :
                [];


            for(
                const battle of
                    battles
            )
            {

                if(
                    !battle
                )
                {

                    continue;

                }


                const battleType =
                    String(
                        battle.type
                        ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                if(
                    battleType !==
                        "wild"
                )
                {

                    continue;

                }


                const species =
                    this.normalizeSpeciesValue(
                        battle.species
                    );


                if(
                    species !==
                        targetSpecies
                )
                {

                    continue;

                }


                encounters.push(
                    this.createSpecialEncounterRecord(
                        event,
                        species,
                        battle.level,
                        battle.form || null
                    )
                );

            }

        }


        //--------------------------------
        // Remove duplicate records
        //--------------------------------

        const unique =
            [];

        const seen =
            new Set();


        for(
            const encounter of
                encounters
        )
        {

            const key =
                [
                    encounter.script,
                    encounter.species,
                    encounter.location,
                    encounter.level,
                    encounter.form
                ]
                .join("|");


            if(
                seen.has(
                    key
                )
            )
            {

                continue;

            }


            seen.add(
                key
            );


            unique.push(
                encounter
            );

        }


        return unique;

    }





    //--------------------------------
    // Create special encounter record
    //--------------------------------

    createSpecialEncounterRecord(
        event,
        species,
        level,
        form = null
    )
    {

        const normalizedLevel =
            level !== undefined
            &&
            level !== null
                ?
                Number(level)
                :
                null;


        const script =
            event.id
            ||
            event.eventId
            ||
            event.script
            ||
            null;


        const resolvedForm =
            form
            ||
            this.getSpecialEncounterForm(
                species,
                event
            );


        return {

            script,

            species,

            location:
                this.getSpecialEncounterLocation(
                    event,
                    script,
                    species
                ),

            level:
                Number.isFinite(
                    normalizedLevel
                )
                    ?
                    normalizedLevel
                    :
                    null,

            form:
                resolvedForm,

            requirements:
                event.requirements
                &&
                typeof event.requirements ===
                    "object"
                    ?
                    {
                        ...event.requirements
                    }
                    :
                    {
                        storyFlags: [],
                        items: [],
                        badges: []
                    },

            conditions:
                event.conditions
                &&
                typeof event.conditions ===
                    "object"
                    ?
                    {
                        ...event.conditions
                    }
                    :
                    {
                        requireStoryFlags: [],
                        excludeStoryFlags: []
                    }

        };

    }





    //--------------------------------
    // Special encounter form
    //--------------------------------

    getSpecialEncounterForm(
        species,
        event
    )
    {

        if(
            species ===
                "DEOXYS"
            &&
            String(
                event?.game
                ||
                "FIRERED"
            )
            .toUpperCase() ===
                "FIRERED"
        )
        {

            return "ATTACK";

        }


        return null;

    }





    //--------------------------------
    // Special encounter location
    //--------------------------------

    getSpecialEncounterLocation(
        event,
        script,
        species
    )
    {

        const directLocation =
            this.getEventLocation(
                event
            );


        if(
            directLocation
        )
        {

            return directLocation;

        }


        //--------------------------------
        // Known FireRed static encounter
        // script locations used only when
        // the raw event has no location.
        //--------------------------------

        const locationByScript =
        {

            Route12_EventScript_Snorlax:
                "MAP_ROUTE12",

            Route16_EventScript_Snorlax:
                "MAP_ROUTE16",

            SeafoamIslands_B4F_EventScript_Articuno:
                "MAP_SEAFOAM_ISLANDS_B4F",

            PowerPlant_EventScript_Zapdos:
                "MAP_POWER_PLANT",

            MtEmber_Summit_EventScript_Moltres:
                "MAP_MT_EMBER_SUMMIT",

            CeruleanCave_B1F_EventScript_Mewtwo:
                "MAP_CERULEAN_CAVE_B1F",

            ThreeIsland_BerryForest_EventScript_Lostelle:
                "MAP_THREE_ISLAND_BERRY_FOREST",

            BirthIsland_EventScript_Deoxys:
                "MAP_BIRTH_ISLAND"

        };


        if(
            script
            &&
            locationByScript[script]
        )
        {

            return locationByScript[script];

        }


        //--------------------------------
        // Common FireRed script prefix
        // fallback.
        //--------------------------------

        if(
            typeof script ===
                "string"
        )
        {

            const marker =
                "_EventScript_";


            const markerIndex =
                script.indexOf(
                    marker
                );


            if(
                markerIndex > 0
            )
            {

                const prefix =
                    script.substring(
                        0,
                        markerIndex
                    );


                const commonLocation =
                    this.mapScriptPrefixToLocation(
                        prefix
                    );


                if(
                    commonLocation
                )
                {

                    return commonLocation;

                }

            }

        }


        return null;

    }





    //--------------------------------
    // Map script prefix fallback
    //--------------------------------

    mapScriptPrefixToLocation(
        prefix
    )
    {

        if(
            !prefix
        )
        {

            return null;

        }


        const known =
        {

            Route12:
                "MAP_ROUTE12",

            Route16:
                "MAP_ROUTE16",

            PowerPlant:
                "MAP_POWER_PLANT",

            MtEmber_Summit:
                "MAP_MT_EMBER_SUMMIT",

            CeruleanCave_B1F:
                "MAP_CERULEAN_CAVE_B1F",

            SeafoamIslands_B4F:
                "MAP_SEAFOAM_ISLANDS_B4F",

            ThreeIsland_BerryForest:
                "MAP_THREE_ISLAND_BERRY_FOREST",

            BirthIsland:
                "MAP_BIRTH_ISLAND"

        };


        return known[prefix]
            ||
            null;

    }





    //--------------------------------
    // Resolve event records
    //
    // Event data may be:
    //
    // - an array
    // - an object keyed by ID
    // - a wrapper object
    // - nested category collections
    //
    // Search recursively so the availability
    // builder does not depend on one specific
    // event database layout.
    //--------------------------------

    getEventRecords()
    {

        if(
            !this.events
            ||
            typeof this.events !==
                "object"
        )
        {

            return [];

        }


        const records = [];

        const visited =
            new Set();


        const visit =
            value =>
            {

                if(
                    !value
                    ||
                    typeof value !==
                        "object"
                    ||
                    visited.has(
                        value
                    )
                )
                {

                    return;

                }


                visited.add(
                    value
                );


                if(
                    Array.isArray(
                        value
                    )
                )
                {

                    for(
                        const item of
                            value
                    )
                    {

                        visit(
                            item
                        );

                    }

                    return;

                }


                const looksLikeEvent =
                    Boolean(

                        value.entityType

                        ||

                        value.roles

                        ||

                        value.interactions

                        ||

                        value.eventId

                        ||

                        value.id

                        ||

                        value.effects?.battles

                        ||

                        value.effects?.addPokemon

                    );


                if(
                    looksLikeEvent
                )
                {

                    records.push(
                        value
                    );

                }


                for(
                    const child of
                        Object.values(
                            value
                        )
                )
                {

                    if(
                        child
                        &&
                        typeof child ===
                            "object"
                    )
                    {

                        visit(
                            child
                        );

                    }

                }

            };


        visit(
            this.events
        );


        return records;

    }





    //--------------------------------
    // Cross-game availability
    //
    // gameAvailability answers:
    //
    // "In which games can this exact
    // Pokémon/form be obtained natively?"
    //
    // tradeAvailability answers:
    //
    // "Does obtaining it require a
    // trade route in FireRed?"
    //--------------------------------

    getGameAvailability(
        pokemon
    )
    {

        const species =
            this.normalizeSpeciesValue(
                pokemon?.constant
            );


        const knownGames =
        {

            RAYQUAZA:
            {
                games:
                [
                    "RUBY",
                    "SAPPHIRE",
                    "EMERALD"
                ],

                locations:
                {
                    RUBY:
                        "SKY_PILLAR",

                    SAPPHIRE:
                        "SKY_PILLAR",

                    EMERALD:
                        "SKY_PILLAR"
                }
            },


            KYOGRE:
            {
                games:
                [
                    "SAPPHIRE",
                    "EMERALD"
                ],

                locations:
                {
                    SAPPHIRE:
                        "CAVE_OF_ORIGIN",

                    EMERALD:
                        "MARINE_CAVE"
                }
            },


            GROUDON:
            {
                games:
                [
                    "RUBY",
                    "EMERALD"
                ],

                locations:
                {
                    RUBY:
                        "CAVE_OF_ORIGIN",

                    EMERALD:
                        "TERRA_CAVE"
                }
            },


            LATIAS:
            {
                games:
                [
                    "RUBY",
                    "SAPPHIRE",
                    "EMERALD"
                ]
            },


            LATIOS:
            {
                games:
                [
                    "RUBY",
                    "SAPPHIRE",
                    "EMERALD"
                ]
            },


            REGIROCK:
            {
                games:
                [
                    "RUBY",
                    "SAPPHIRE",
                    "EMERALD"
                ]
            },


            REGICE:
            {
                games:
                [
                    "RUBY",
                    "SAPPHIRE",
                    "EMERALD"
                ]
            },


            REGISTEEL:
            {
                games:
                [
                    "RUBY",
                    "SAPPHIRE",
                    "EMERALD"
                ]
            },


            JIRACHI:
            {
                games:
                    []
            },


            //--------------------------------
            // Deoxys is form-specific in
            // Generation III.
            //--------------------------------

            DEOXYS:
            {
                games:
                [
                    "FIRERED"
                ],

                locations:
                {
                    FIRERED:
                        "BIRTH_ISLAND"
                },

                forms:
                {
                    NORMAL:
                    {
                        games:
                        [
                            "RUBY",
                            "SAPPHIRE"
                        ],

                        location:
                            "BIRTH_ISLAND",

                        method:
                            "SPECIAL"
                    },

                    ATTACK:
                    {
                        games:
                        [
                            "FIRERED"
                        ],

                        location:
                            "BIRTH_ISLAND",

                        method:
                            "SPECIAL"
                    },

                    DEFENSE:
                    {
                        games:
                        [
                            "LEAFGREEN"
                        ],

                        location:
                            "BIRTH_ISLAND",

                        method:
                            "SPECIAL",

                        tradeFrom:
                            "LEAFGREEN"
                    },

                    SPEED:
                    {
                        games:
                        [
                            "EMERALD"
                        ],

                        location:
                            "BIRTH_ISLAND",

                        method:
                            "SPECIAL",

                        tradeFrom:
                            "EMERALD"
                    }
                }
            }

        };


        const known =
            knownGames[
                species
            ];


        if(
            !known
        )
        {

            return {

                available:
                    false,

                games:
                    [],

                locations:
                    {},

                forms:
                    {}

            };

        }


        return {

            available:
                known.games.length >
                    0,

            games:
                [
                    ...known.games
                ],

            locations:
                known.locations
                ||
                {},

            forms:
                known.forms
                ||
                {}

        };

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
        gifts = null,
        specialEncounters = null
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


        const resolvedSpecialEncounters =
            specialEncounters
            ||
            this.getSpecialEncounterEvents(
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
                    0,

            special:
                resolvedSpecialEncounters.length >
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
    // Form availability
    //--------------------------------

    getFormAvailability(
        pokemon,
        species = null
    )
    {

        const resolvedSpecies =
            species
            ||
            this.getSpeciesName(
                pokemon
            );


        if(
            resolvedSpecies !==
                "DEOXYS"
        )
        {

            return null;

        }


        return {

            description:
                "Deoxys has game-specific forms in Generation III. FireRed natively provides Attack Form. The Defense Form comes from LeafGreen, the Speed Form comes from Emerald, and the Normal Form comes from Ruby or Sapphire.",

            currentGame:
            {
                game:
                    "FIRERED",

                nativeForm:
                    "ATTACK",

                location:
                    "BIRTH_ISLAND",

                level:
                    30,

                method:
                    "SPECIAL"
            },

            forms:
            {
                NORMAL:
                {
                    nativeGames:
                    [
                        "RUBY",
                        "SAPPHIRE"
                    ],

                    location:
                        "BIRTH_ISLAND",

                    tradeRequiredInFireRed:
                        true,

                    tradeFrom:
                    [
                        "RUBY",
                        "SAPPHIRE"
                    ]
                },

                ATTACK:
                {
                    nativeGames:
                    [
                        "FIRERED"
                    ],

                    location:
                        "BIRTH_ISLAND",

                    tradeRequiredInFireRed:
                        false
                },

                DEFENSE:
                {
                    nativeGames:
                    [
                        "LEAFGREEN"
                    ],

                    location:
                        "BIRTH_ISLAND",

                    tradeRequiredInFireRed:
                        true,

                    tradeFrom:
                    [
                        "LEAFGREEN"
                    ]
                },

                SPEED:
                {
                    nativeGames:
                    [
                        "EMERALD"
                    ],

                    location:
                        "BIRTH_ISLAND",

                    tradeRequiredInFireRed:
                        true,

                    tradeFrom:
                    [
                        "EMERALD"
                    ]
                }
            }

        };

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
        // Deoxys form trade routes
        //--------------------------------

        if(
            pokemon.constant ===
                "SPECIES_DEOXYS"
        )
        {

            return {

                available:
                    true,

                games:
                [
                    "RUBY",
                    "SAPPHIRE",
                    "LEAFGREEN",
                    "EMERALD"
                ],

                reason:
                    "FireRed natively provides Deoxys Attack Form. The Normal Form comes from Ruby or Sapphire, the Defense Form from LeafGreen, and the Speed Form from Emerald. Those other forms require trading the Deoxys back to FireRed."

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
        gifts = null,
        specialEncounters = null
    )
    {
        const resolvedSpecies =
            species
            ||
            this.getSpeciesName(
                pokemon
            );
        
        
        const resolvedLocations =
            this.normalizeProgressionLocations(
                locations
                ||
                this.getLocations(
                    resolvedSpecies
                )
            );
        
        
        const resolvedGifts =
            gifts
            ||
            this.getGiftEvents(
                pokemon
            );
        
        
        const resolvedSpecialEncounters =
            specialEncounters
            ||
            this.getSpecialEncounterEvents(
                pokemon
            );
        
        
        const progression =
            this.progressionBuilder.calculateProgression(
            
                pokemon,
            
                resolvedSpecies,
            
                resolvedLocations,
            
                resolvedGifts,
            
                resolvedSpecialEncounters
            
            );
        
        
        //--------------------------------
        // Special/static encounters
        //
        // Static legendary encounters that
        // belong to the post-game should
        // become obtainable at POST_GAME.
        //
        // Do not mark every SPECIAL encounter
        // as post-game. Snorlax, Lostelle's
        // Hypno, etc. have different timing.
        //--------------------------------
        
        const postGameSpecialSpecies =
        [
            "ARTICUNO",
            "ZAPDOS",
            "MOLTRES"
        ];
    
    
        if(
            resolvedSpecialEncounters.length > 0
            &&
            postGameSpecialSpecies.includes(
                resolvedSpecies
            )
        )
        {
            progression.POST_GAME =
                true;
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

        return this.progressionBuilder.canExistByStage(

            pokemon,

            species,

            stage,

            this.normalizeProgressionLocations(
                locations
                ||
                this.getLocations(
                    species
                )
            ),

            gifts
            ||
            this.getGiftEvents(
                pokemon
            ),

            state

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

        return this.progressionBuilder.canAccessWildPokemonAtStage(

            this.normalizeProgressionLocations(
                locations
            ),

            stage,

            state

        );

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

        return this.progressionBuilder.canAccessGiftPokemonAtStage(

            gifts,

            stage,

            state

        );

    }





    //--------------------------------
    // Progression rule index
    //--------------------------------

    buildProgressionRuleIndex()
    {

        return this.progressionBuilder
            ?
            this.progressionBuilder.buildProgressionRuleIndex()
            :
            {};

    }





    //--------------------------------
    // Location stage availability
    //--------------------------------

    canAccessLocationAtStage(
        location,
        stage,
        state = null
    )
    {

        return this.progressionBuilder.canAccessLocationAtStage(

            location,

            stage,

            state

        );

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

        return this.progressionBuilder.isLocationUsableAtStage(

            location,

            stage,

            state

        );

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

        return this.progressionBuilder.isConnectionUsableAtStage(

            connection,

            stage,

            state

        );

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

        return this.progressionBuilder.isGateSatisfiedAtStage(

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

        return this.progressionBuilder.isRequirementSatisfiedAtStage(

            requirement,

            stage,

            state

        );

    }





    //--------------------------------
    // Named requirement stage evaluation
    //--------------------------------

    isNamedRequirementSatisfiedAtStage(
        requirement,
        stage,
        state = null
    )
    {

        return this.progressionBuilder.isNamedRequirementSatisfiedAtStage(

            requirement,

            stage,

            state

        );

    }





    //--------------------------------
    // Badge requirements
    //--------------------------------

    areBadgesSatisfiedAtStage(
        badges,
        stage,
        state = null
    )
    {

        return this.progressionBuilder.areBadgesSatisfiedAtStage(

            badges,

            stage,

            state

        );

    }





    //--------------------------------
    // Single badge requirement
    //--------------------------------

    isBadgeSatisfiedAtStage(
        badge,
        stage,
        state = null
    )
    {

        return this.progressionBuilder.isBadgeSatisfiedAtStage(

            badge,

            stage,

            state

        );

    }





    //--------------------------------
    // Key item requirements
    //--------------------------------

    areKeyItemsSatisfiedAtStage(
        keyItems,
        stage,
        state = null
    )
    {

        return this.progressionBuilder.areKeyItemsSatisfiedAtStage(

            keyItems,

            stage,

            state

        );

    }





    //--------------------------------
    // Single key item requirement
    //--------------------------------

    isKeyItemSatisfiedAtStage(
        keyItem,
        stage,
        state = null
    )
    {

        return this.progressionBuilder.isKeyItemSatisfiedAtStage(

            keyItem,

            stage,

            state

        );

    }





    //--------------------------------
    // Story flag requirement
    //--------------------------------

    isStoryFlagSatisfiedAtStage(
        flag,
        stage,
        state = null
    )
    {

        return this.progressionBuilder.isStoryFlagSatisfiedAtStage(

            flag,

            stage,

            state

        );

    }





    //--------------------------------
    // Stage max level
    //--------------------------------

    getStageMaxLevel(
        stage
    )
    {

        return this.progressionBuilder.getStageMaxLevel(
            stage
        );

    }





    //--------------------------------
    // Cumulative stage states
    //--------------------------------

    buildCumulativeStageStates()
    {

        return this.progressionBuilder.buildCumulativeStageStates();

    }





    //--------------------------------
    // Single stage state
    //--------------------------------

    buildStageState(
        stage
    )
    {

        return this.progressionBuilder.buildStageState(
            stage
        );

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

        return this.progressionBuilder.canPerformTradeEvolutionAtStage(

            pokemon,

            stage,

            state

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

        return this.progressionBuilder.canPerformExternalTradeAtStage(

            pokemon,

            stage,

            state

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

        return this.progressionBuilder.addUnique(

            array,

            value

        );

    }





    //--------------------------------
    // Starting locations
    //--------------------------------

    getStartingLocations()
    {

        return this.progressionBuilder.getStartingLocations();

    }





    //--------------------------------
    // Progression location adapter
    //--------------------------------

    getProgressionLocations(
        species
    )
    {

        return this.normalizeProgressionLocations(

            this.getLocations(
                species
            )

        );

    }





    //--------------------------------
    // Normalize progression locations
    //--------------------------------

    normalizeProgressionLocations(
        locations = []
    )
    {

        if(
            !Array.isArray(
                locations
            )
        )
        {

            return [];

        }


        return locations

            .map(

                location =>

                {

                    if(
                        typeof location ===
                            "string"
                    )
                    {

                        return location;

                    }


                    if(
                        location
                        &&
                        typeof location.location ===
                            "string"
                    )
                    {

                        return {

                            ...location

                        };

                    }


                    if(
                        location
                        &&
                        typeof location.id ===
                            "string"
                    )
                    {

                        return {

                            ...location,

                            location:
                                location.id

                        };

                    }


                    return null;

                }

            )

            .filter(
                Boolean
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
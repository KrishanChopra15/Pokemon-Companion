/**
 * Pokémon Companion
 * Pokémon Availability Progression Builder
 *
 * Builds progression-based availability information
 * for Pokémon.
 *
 * Responsibilities:
 * - Calculate cumulative progression.
 * - Evaluate Pokémon existence by stage.
 * - Evaluate wild location access by stage.
 * - Evaluate gift location access by stage.
 * - Evaluate progression requirements.
 * - Evaluate location gates.
 * - Build cumulative stage states.
 * - Evaluate trade availability by stage.
 *
 * Does NOT:
 * - Resolve Pokémon sources.
 * - Parse encounter data.
 * - Resolve gifts.
 * - Resolve Pokémon species.
 * - Build final Pokémon availability records.
 */

"use strict";


const ProgressionRequirementEvaluator =
    require("../../services/progression-requirement-evaluator");


const ProgressionLocationAccessResolver =
    require("../../services/progression-location-access-resolver");


class PokemonAvailabilityProgressionBuilder {


    constructor(
        options = {},
        locationDatabase = null,
        evolutionService = null,
        adapters = null
    )
    {

        //--------------------------------
        // Support both constructor forms.
        //
        // Current callers use:
        //   rules,
        //   locations,
        //   evolutionService,
        //   adapters
        //
        // Also preserve support for the
        // options-object form.
        //--------------------------------

        const resolvedOptions =
            Array.isArray(options)
            ?
            {
                progressionRules:
                    options,

                locationDatabase:
                    locationDatabase,

                evolutionService:
                    evolutionService,

                ...(adapters || {})
            }
            :
            (options || {});


        this.rules =
            Array.isArray(
                resolvedOptions.progressionRules
            )
                ? resolvedOptions.progressionRules
                : [];


        this.locations =
            resolvedOptions.locationDatabase
            &&
            typeof resolvedOptions.locationDatabase ===
                "object"
                ? resolvedOptions.locationDatabase
                : {};


        this.evolutionService =
            resolvedOptions.evolutionService ||
            null;


        this.getSpeciesName =
            typeof resolvedOptions.getSpeciesName ===
                "function"
                ?
                resolvedOptions.getSpeciesName
                :
                pokemon =>
                    pokemon?.name
                    ||
                    pokemon?.constant
                        ?.replace(
                            /^SPECIES_/,
                            ""
                        )
                        ?.toUpperCase()
                    ||
                    null;


        this.getLocations =
            typeof resolvedOptions.getLocations ===
                "function"
                ?
                resolvedOptions.getLocations
                :
                () => [];


        this.getGiftEvents =
            typeof resolvedOptions.getGiftEvents ===
                "function"
                ?
                resolvedOptions.getGiftEvents
                :
                () => [];


        this.getRestriction =
            typeof resolvedOptions.getRestriction ===
                "function"
                ?
                resolvedOptions.getRestriction
                :
                () => ({
                    blocked:
                        false
                });


        this.hasExternalTradeRoute =
            typeof resolvedOptions.hasExternalTradeRoute ===
                "function"
                ?
                resolvedOptions.hasExternalTradeRoute
                :
                () => false;


        this.getExternalTradeGames =
            typeof resolvedOptions.getExternalTradeGames ===
                "function"
                ?
                resolvedOptions.getExternalTradeGames
                :
                () => [];


        this.getExternalTradeReason =
            typeof resolvedOptions.getExternalTradeReason ===
                "function"
                ?
                resolvedOptions.getExternalTradeReason
                :
                () => null;


        this.isStarter =
            typeof resolvedOptions.isStarter ===
                "function"
                ?
                resolvedOptions.isStarter
                :
                () => false;


        this.isTradeEvolution =
            typeof resolvedOptions.isTradeEvolution ===
                "function"
                ?
                resolvedOptions.isTradeEvolution
                :
                () => false;


        this.stages =
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


        //--------------------------------
        // Requirement evaluator
        //--------------------------------

        this.requirementEvaluator =
            new ProgressionRequirementEvaluator({

                isNamedRequirementSatisfiedAtStage:
                    (requirement, stage, state) =>
                        this.isNamedRequirementSatisfiedAtStage(
                            requirement,
                            stage,
                            state
                        ),

                areBadgesSatisfiedAtStage:
                    (badges, stage, state) =>
                        this.areBadgesSatisfiedAtStage(
                            badges,
                            stage,
                            state
                        ),

                isBadgeSatisfiedAtStage:
                    (badge, stage, state) =>
                        this.isBadgeSatisfiedAtStage(
                            badge,
                            stage,
                            state
                        ),

                areKeyItemsSatisfiedAtStage:
                    (keyItems, stage, state) =>
                        this.areKeyItemsSatisfiedAtStage(
                            keyItems,
                            stage,
                            state
                        ),

                isKeyItemSatisfiedAtStage:
                    (keyItem, stage, state) =>
                        this.isKeyItemSatisfiedAtStage(
                            keyItem,
                            stage,
                            state
                        ),

                isStoryFlagSatisfiedAtStage:
                    (flag, stage, state) =>
                        this.isStoryFlagSatisfiedAtStage(
                            flag,
                            stage,
                            state
                        ),

                canAccessLocationAtStage:
                    (
                        locationId,
                        stage,
                        state,
                        dependencyStack
                    ) =>
                        this.locationAccessResolver
                            ?
                            this.locationAccessResolver
                                .canAccessLocationAtStage(
                                    locationId,
                                    stage,
                                    state,
                                    dependencyStack
                                )
                            :
                            false

            });


        //--------------------------------
        // Location access resolver
        //--------------------------------

        this.locationAccessResolver =
            new ProgressionLocationAccessResolver(
                this.locations,
                this.rules,
                this.requirementEvaluator
            );

    }





    //--------------------------------
    // Location access
    //--------------------------------

    canAccessLocationAtStage(
        locationId,
        stage,
        state = null,
        dependencyStack = new Set()
    )
    {

        return this.locationAccessResolver
            .canAccessLocationAtStage(
                locationId,
                stage,
                state,
                dependencyStack
            );

    }





    //--------------------------------
    // Location usability
    //--------------------------------

    isLocationUsableAtStage(
        location,
        stage,
        state = null,
        dependencyStack = new Set()
    )
    {

        return this.locationAccessResolver
            .isLocationUsableAtStage(
                location,
                stage,
                state,
                dependencyStack
            );

    }





    //--------------------------------
    // Connection usability
    //--------------------------------

    isConnectionUsableAtStage(
        connection,
        stage,
        state = null,
        dependencyStack = new Set()
    )
    {

        return this.locationAccessResolver
            .isConnectionUsableAtStage(
                connection,
                stage,
                state,
                dependencyStack
            );

    }





    //--------------------------------
    // Gate evaluation
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
    // Requirement evaluation
    //--------------------------------

    isRequirementSatisfiedAtStage(
        requirement,
        stage,
        state = null,
        dependencyStack = new Set()
    )
    {

        return this.requirementEvaluator.isSatisfied(
            requirement,
            stage,
            state,
            dependencyStack
        );

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

        const progression =
            {};


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
            [];


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
                
                    states[stage],
                
                    resolvedSpecialEncounters
                
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
        state = null,
        specialEncounters = null
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

            return (
                stage ===
                    "POST_GAME"
            );

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

        const evolution =
            this.evolutionService
            &&
            typeof this.evolutionService.getEvolutionSource ===
                "function"
            ?
            this.evolutionService.getEvolutionSource(
                pokemon.constant
            )
            :
            null;


        const restriction =
            this.getRestriction(

                pokemon,

                evolution

            );


        if(
            restriction.blocked
        )
        {

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
        // Special / static encounters
        //--------------------------------

        const resolvedSpecialEncounters =
            specialEncounters
            ||
            [];


        const specialAvailable =
            resolvedSpecialEncounters.length >
                0
            &&
            this.canAccessSpecialPokemonAtStage(
            
                resolvedSpecialEncounters,
            
                stage,
            
                state
            
            );


        //--------------------------------
        // Evolution
        //--------------------------------

        let evolutionAvailable =
            false;


        if(
            evolution
            &&
            this.evolutionService
            &&
            typeof this.evolutionService.canEvolveBeforeStage ===
                "function"
        )
        {

            const evolutionState =
            {
                ...(state || {}),

                maxReasonableLevel:
                    state?.maxReasonableLevel
                    ??
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
        
            specialAvailable
        
            ||
        
            evolutionAvailable
        
            ||
        
            tradeEvolutionAvailable
        
            ||
        
            externalTradeAvailable
        
        );

    }





    //--------------------------------
    // Special availability by stage
    //--------------------------------
    
    canAccessSpecialPokemonAtStage(
        encounters,
        stage,
        state = null
    )
    {
    
        if(
            !Array.isArray(
                encounters
            )
            ||
            encounters.length ===
                0
        )
        {
        
            return false;
        
        }
    
    
        for(
            const encounter of
                encounters
        )
        {
        
            if(
                !encounter
            )
            {
            
                continue;
            
            }
        
        
            //--------------------------------
            // Location access
            //--------------------------------
        
            if(
                !encounter.location
                ||
                !this.canAccessLocationAtStage(
                
                    encounter.location,
                
                    stage,
                
                    state
                
                )
            )
            {
            
                continue;
            
            }
        
        
            //--------------------------------
            // Event requirements
            //--------------------------------
        
            if(
                encounter.requirements
                &&
                !this.isRequirementSatisfiedAtStage(
                
                    encounter.requirements,
                
                    stage,
                
                    state
                
                )
            )
            {
            
                continue;
            
            }
        
        
            //--------------------------------
            // Event conditions
            //--------------------------------
        
            const conditions =
                encounter.conditions
                ||
                {};
        
        
            const requiredFlags =
                Array.isArray(
                    conditions.requireStoryFlags
                )
                ?
                conditions.requireStoryFlags
                :
                [];
            
            
            const excludedFlags =
                Array.isArray(
                    conditions.excludeStoryFlags
                )
                ?
                conditions.excludeStoryFlags
                :
                [];
            
            
            const requiredFlagsSatisfied =
                requiredFlags.every(
                
                    flag =>
                        this.isStoryFlagSatisfiedAtStage(
                        
                            flag,
                        
                            stage,
                        
                            state
                        
                        )
                    
                );
            
            
            if(
                !requiredFlagsSatisfied
            )
            {
            
                continue;
            
            }
        
        
            const excludedFlagsPresent =
                excludedFlags.some(
                
                    flag =>
                        this.isStoryFlagSatisfiedAtStage(
                        
                            flag,
                        
                            stage,
                        
                            state
                        
                        )
                    
                );
            
            
            if(
                excludedFlagsPresent
            )
            {
            
                continue;
            
            }
        
        
            return true;
        
        }
    
    
        return false;
    
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
            const source of
                locations
        )
        {
        
            //--------------------------------
            // Resolve location ID
            //--------------------------------
        
            const locationId =
                typeof source ===
                    "string"
                    ?
                    source
                    :
                    source?.location
                    ||
                    source?.id
                    ||
                    null;
        
        
            if(
                !locationId
            )
            {
            
                continue;
            
            }
        
        
            //--------------------------------
            // Physical location access
            //--------------------------------
        
            if(
                !this.canAccessLocationAtStage(
                
                    locationId,
                
                    stage,
                
                    state
                
                )
            )
            {
            
                continue;
            
            }
        
        
            //--------------------------------
            // Plain Grass encounters
            //--------------------------------
        
            const method =
                typeof source ===
                    "object"
                    ?
                    source.method
                    ||
                    source.encounterMethod
                    :
                    null;
        
        
            if(
                !method
                ||
                method ===
                    "land_mons"
            )
            {
            
                return true;
            
            }
        
        
            //--------------------------------
            // Surf
            //--------------------------------
        
            if(
                method ===
                    "water_mons"
            )
            {
            
                if(
                    this.isNamedRequirementSatisfiedAtStage(
                    
                        "CAN_USE_SURF",
                    
                        stage,
                    
                        state
                    
                    )
                )
                {
                
                    return true;
                
                }
            
                continue;
            
            }
        
        
            //--------------------------------
            // Rock Smash
            //--------------------------------
        
            if(
                method ===
                    "rock_smash_mons"
            )
            {
            
                if(
                    this.isNamedRequirementSatisfiedAtStage(
                    
                        "CAN_USE_ROCK_SMASH",
                    
                        stage,
                    
                        state
                    
                    )
                )
                {
                
                    return true;
                
                }
            
                continue;
            
            }
        
        
            //--------------------------------
            // Fishing
            //--------------------------------
        
            if(
                method ===
                    "fishing_mons"
            )
            {
            
                const rod =
                    String(
                        source.rod
                        ||
                        ""
                    )
                    .trim()
                    .toUpperCase();
                
                
                if(
                    rod ===
                        "OLD_ROD"
                    ||
                    rod ===
                        "GOOD_ROD"
                    ||
                    rod ===
                        "SUPER_ROD"
                )
                {
                
                    const keyItems =
                        Array.isArray(
                            state?.keyItems
                        )
                        ?
                        state.keyItems
                        :
                        [];
                    
                    
                    if(
                        keyItems.includes(
                            rod
                        )
                    )
                    {
                    
                        return true;
                    
                    }
                
                }
            
            
                continue;
            
            }
        
        
            //--------------------------------
            // Unknown method
            //
            // Do not automatically grant
            // access to an unknown encounter
            // method.
            //--------------------------------
        
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

            PRE_BROCK:
                20,

            BROCK:
                30,

            MISTY:
                35,

            LT_SURGE:
                40,

            ERIKA:
                45,

            KOGA:
                50,

            SABRINA:
                55,

            BLAINE:
                55,

            GIOVANNI:
                60,

            ELITE_FOUR:
                65,

            CHAMPION:
                70,

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


        const states =
            {};


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

                    Math.max(
                        stageIndex,
                        0
                    ),

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
    // Starting locations
    //--------------------------------

    getStartingLocations()
    {

        return this.locationAccessResolver
            .getStartingLocations();

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

}





module.exports =
    PokemonAvailabilityProgressionBuilder;
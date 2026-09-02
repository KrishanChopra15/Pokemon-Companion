/**
 * Pokémon Companion
 * Event Service
 *
 * Executes NPC events.
 *
 * Responsibilities:
 * - Load event database.
 * - Load story event mappings.
 * - Find events.
 * - Validate requirements.
 * - Execute events.
 * - Execute choices.
 * - Apply rewards.
 * - Apply progression unlocks.
 * - Update trainer state.
 *
 * Does NOT:
 * - Parse ROM data.
 * - Extract events.
 * - Create events.
 * - Define progression rules.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");


const GameEvent =
    require("../domain/game-event");


const EventChoice =
    require("../domain/event-choice");


const RewardService =
    require("./reward-service");


const WorldStateService =
    require("./world-state-service");





class EventService {



    constructor(
        game = "firered",
        progressionService = null,
        pokemonTracker = null
    )
    {


        //--------------------------------
        // Events database
        //--------------------------------


        const eventFile =
            path.join(

                process.cwd(),

                "database",

                "generated",

                game,

                "events.json"

            );



        if(
            !fs.existsSync(eventFile)
        )
        {

            throw new Error(
                `Event database missing: ${eventFile}`
            );

        }





        const data =
            JSON.parse(

                fs.readFileSync(

                    eventFile,

                    "utf8"

                )

            );





        this.events =
            data.map(

                event =>

                    this.createEvent(
                        event
                    )

            );







        //--------------------------------
        // Story Event Mapping
        //--------------------------------


        const mappingFile =
            path.join(

                process.cwd(),

                "database",

                "generated",

                game,

                "story-event-map.json"

            );





        this.storyEventMap =
            fs.existsSync(mappingFile)

            ?

            JSON.parse(

                fs.readFileSync(

                    mappingFile,

                    "utf8"

                )

            )

            :

            {};








        //--------------------------------
        // Services
        //--------------------------------


        this.rewardService =
            new RewardService();



        this.worldStateService =
            new WorldStateService();



        this.progression =
            progressionService;



        this.pokemonTracker =
            pokemonTracker;

    }









    //--------------------------------
    // Create domain objects
    //--------------------------------


    createEvent(
        data
    )
    {

        return new GameEvent(
            data
        );

    }





    createChoice(
        data
    )
    {

        return new EventChoice(
            data
        );

    }









    //--------------------------------
    // Find events
    //--------------------------------


    getEvent(
        id
    )
    {


        //--------------------------------
        // Story alias lookup
        //--------------------------------


        const mapped =
            this.storyEventMap[id];



        if(
            mapped
        )
        {


            return (

                this.events.find(

                    event =>

                        event.id === mapped.eventId

                )

                ||

                null

            );


        }







        //--------------------------------
        // Direct ROM event lookup
        //--------------------------------


        return (

            this.events.find(

                event =>

                    event.id === id

            )

            ||

            null

        );


    }









    getEventsByLocation(
        location
    )
    {

        return this.events.filter(

            event =>

                event.location === location

        );

    }







    getEventsByNPC(
        npc
    )
    {

        return this.events.filter(

            event =>

                event.npc === npc

        );

    }









    //--------------------------------
    // Find progression for event
    //--------------------------------
    //
    // Finds a progression rule whose
    // eventId points to this exact ROM
    // event.
    //
    // This keeps event requirements
    // data-driven.
    //--------------------------------


    getEventProgression(
        event
    )
    {


        if(
            !event
            ||
            !this.progression
            ||
            typeof this.progression
                .getAllProgression !==
                    "function"
        )
        {

            return null;

        }



        const progressions =
            Object.values(

                this.progression
                    .getAllProgression()

            );



        return (

            progressions.find(

                progression =>

                    progression
                    &&
                    progression.eventId
                    &&
                    progression.eventId ===
                        event.id

            )

            ||

            null

        );

    }









    //--------------------------------
    // Check event progression
    //--------------------------------


    checkEventProgression(
        event,
        trainerState
    )
    {


        const progression =
            this.getEventProgression(
                event
            );



        //--------------------------------
        // No mapped progression
        //--------------------------------
        //
        // Ordinary ROM events continue
        // normally.
        //--------------------------------


        if(
            !progression
        )
        {

            return {

                allowed:true,

                progression:null

            };

        }



        //--------------------------------
        // Build requirement context
        //--------------------------------


        const context =
        {

            pokemonTracker:
                this.pokemonTracker

        };



        //--------------------------------
        // Evaluate requirement
        //--------------------------------


        if(
            !this.progression
            ||
            typeof this.progression
                .checkRequirement !==
                    "function"
        )
        {

            return {

                allowed:false,

                progression:
                    progression.id,

                reason:
                    "Progression service unavailable"

            };

        }



        const result =
            this.progression
                .checkRequirement(

                    progression.requirement,

                    trainerState,

                    context

                );



        if(
            !result.allowed
        )
        {

            return {

                allowed:false,

                progression:
                    progression.id,

                reason:
                    result.reason

            };

        }



        return {

            allowed:true,

            progression:
                progression.id,

            reason:null

        };

    }









    //--------------------------------
    // Execute event
    //--------------------------------


    executeEvent(
        event,
        trainerState
    )
    {


        //--------------------------------
        // Validate event
        //--------------------------------


        if(
            !event
        )
        {

            return {

                success:false,

                reason:
                    "Event not found"

            };

        }



        if(
            !trainerState
        )
        {

            return {

                success:false,

                reason:
                    "Missing trainer state"

            };

        }







        //--------------------------------
        // World visibility
        //--------------------------------


        const visibility =
            this.worldStateService.canShowEvent(

                event,

                trainerState

            );



        if(
            !visibility.visible
        )
        {

            return {

                success:false,

                reason:
                    visibility.reason

            };

        }







        //--------------------------------
        // Normal event requirements
        //--------------------------------


        const check =
            this.canTrigger(

                event,

                trainerState

            );



        if(
            !check.allowed
        )
        {

            return {

                success:false,

                reason:
                    check.reason

            };

        }







        //--------------------------------
        // Companion progression requirement
        //--------------------------------
        //
        // Only checks the progression
        // rule associated with this exact
        // event.
        //
        // It does NOT apply progression
        // unlocks here.
        //
        // The event itself remains
        // responsible for its actual
        // ROM-derived rewards/effects.
        //--------------------------------


        const progressionCheck =
            this.checkEventProgression(

                event,

                trainerState

            );



        if(
            !progressionCheck.allowed
        )
        {

            return {

                success:false,

                reason:
                    progressionCheck.reason,

                progression:
                    progressionCheck.progression

            };

        }








        //--------------------------------
        // Rewards
        //--------------------------------


        for(
            const reward of event.rewards || []
        )
        {


            this.rewardService.execute(

                reward,

                trainerState

            );


        }








        //--------------------------------
        // Effects
        //--------------------------------


        const effects =
            event.effects || {};





        //--------------------------------
        // Key items
        //--------------------------------


        for(
            const item of
                effects.addKeyItems || []
        )
        {

            if(
                !item
            )
            {

                continue;

            }


            trainerState.addKeyItem(

                item

            );

        }








        //--------------------------------
        // Normal items
        //--------------------------------


        for(
            const item of
                effects.addItems || []
        )
        {

            if(
                !item
            )
            {

                continue;

            }



            if(
                typeof item ===
                    "string"
            )
            {

                trainerState.addItem(

                    item,

                    1

                );

                continue;

            }



            trainerState.addItem(

                item.id
                ||
                item.name,

                item.quantity
                ||
                1

            );

        }








        //--------------------------------
        // Pokémon
        //--------------------------------


        for(
            const pokemon of
                effects.addPokemon || []
        )
        {

            if(
                !pokemon
            )
            {

                continue;

            }



            trainerState.addPokemon(

                pokemon

            );

        }








        //--------------------------------
        // Money
        //--------------------------------


        if(
            effects.addMoney
        )
        {

            trainerState.addMoney(

                effects.addMoney

            );

        }



        if(
            effects.removeMoney
        )
        {

            trainerState.removeMoney(

                effects.removeMoney

            );

        }








        //--------------------------------
        // Story flags
        //--------------------------------


        for(
            const flag of
                effects.addStoryFlags || []
        )
        {

            trainerState.addStoryFlag(

                flag

            );

        }





        for(
            const flag of
                effects.removeStoryFlags || []
        )
        {

            trainerState.removeStoryFlag(

                flag

            );

        }








        //--------------------------------
        // Battles
        //--------------------------------


        for(
            const battle of
                effects.battles || []
        )
        {

            trainerState.completeBattle(

                battle

            );

        }








        //--------------------------------
        // Progression unlocks
        //--------------------------------
        //
        // Progression unlocks are NOT
        // automatically completed after
        // every event.
        //
        // Event-linked progression rules
        // such as HM05_ACQUISITION only
        // gate their corresponding event.
        //
        // Separate progression rules such
        // as FLASH_UNLOCK must be completed
        // explicitly by the progression system.
        //--------------------------------


        const progressionResults = [];








        //--------------------------------
        // Complete event
        //--------------------------------


        if(
            trainerState.completeEvent
        )
        {

            trainerState.completeEvent(

                event.id

            );

        }







        return {

            success:true,

            event:
                event.id,


            progression:
                progressionResults,


            eventProgression:
                progressionCheck.progression,


            state:

                trainerState.serialize

                ?

                trainerState.serialize()

                :

                trainerState


        };


    }









    //--------------------------------
    // Choices
    //--------------------------------


    getChoices(
        event,
        trainerState
    )
    {


        const check =
            this.canTrigger(

                event,

                trainerState

            );



        if(
            !check.allowed
        )
        {

            return [];

        }





        const progressionCheck =
            this.checkEventProgression(

                event,

                trainerState

            );



        if(
            !progressionCheck.allowed
        )
        {

            return [];

        }





        return (

            event.choices || []

        )
        .map(

            choice =>

                this.createChoice(
                    choice
                )

        );


    }







    executeChoice(
        choice,
        trainerState
    )
    {

        return this.rewardService.execute(

            choice.effects || {},

            trainerState

        );


    }









    //--------------------------------
    // Requirements
    //--------------------------------


    canTrigger(
        event,
        trainerState
    )
    {


        if(
            !event
        )
        {

            return {

                allowed:false,

                reason:
                    "Event not found"

            };

        }



        if(

            event.repeatable === false

            &&

            trainerState.hasCompletedEvent

            &&

            trainerState.hasCompletedEvent(
                event.id
            )

        )
        {

            return {

                allowed:false,

                reason:
                    "Event already completed"

            };

        }







        const requirements =
            event.requirements || {};








        for(
            const flag of
                requirements.storyFlags || []
        )
        {

            if(
                !trainerState.hasStoryFlag(flag)
            )
            {

                return {

                    allowed:false,

                    reason:
                        `Requires story flag ${flag}`

                };

            }

        }








        for(
            const item of
                requirements.items || []
        )
        {

            if(
                !trainerState.hasItem(item)
            )
            {

                return {

                    allowed:false,

                    reason:
                        `Requires item ${item}`

                };

            }

        }








        for(
            const item of
                requirements.keyItems || []
        )
        {

            if(
                !trainerState.hasKeyItem(item)
            )
            {

                return {

                    allowed:false,

                    reason:
                        `Requires key item ${item}`

                };

            }

        }








        for(
            const badge of
                requirements.badges || []
        )
        {

            if(
                !trainerState.hasBadge(badge)
            )
            {

                return {

                    allowed:false,

                    reason:
                        `Requires badge ${badge}`

                };

            }

        }







        return {

            allowed:true

        };


    }









    //--------------------------------
    // Visibility
    //--------------------------------


    canShowEvent(
        event,
        trainerState
    )
    {

        return this.worldStateService.canShowEvent(

            event,

            trainerState

        );

    }



}



module.exports =
    EventService;

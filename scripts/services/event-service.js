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
 * - Update trainer state.
 *
 * Does NOT:
 * - Parse ROM data.
 * - Extract events.
 * - Create events.
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
        game = "firered"
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
    // Execute event
    //--------------------------------


    executeEvent(
        event,
        trainerState
    )
    {


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





        for(
            const flag of effects.addStoryFlags || []
        )
        {

            trainerState.addStoryFlag(
                flag
            );

        }





        for(
            const flag of effects.removeStoryFlags || []
        )
        {

            trainerState.removeStoryFlag(
                flag
            );

        }








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
            const flag of requirements.storyFlags || []
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
            const item of requirements.items || []
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
            const item of requirements.keyItems || []
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
            const badge of requirements.badges || []
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
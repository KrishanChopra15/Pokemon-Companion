/**
 * Pokémon Companion
 * Event Service
 *
 * Executes NPC events.
 *
 * Responsibilities:
 * - Load event database.
 * - Find events.
 * - Validate requirements.
 * - Execute events.
 * - Execute choices.
 * - Apply rewards.
 * - Update trainer state.
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
        game
    )
    {


        const file =
            path.join(
                __dirname,
                "../../database/generated",
                game,
                "events.json"
            );



        const data =
            JSON.parse(
                fs.readFileSync(
                    file,
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



        this.rewardService =
            new RewardService();



        this.worldStateService =
            new WorldStateService();


    }





    //--------------------------------
    // Create domain object
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
    // Find event
    //--------------------------------


    getEvent(
        id
    )
    {

        return this.events.find(
            event =>
                event.id === id
        )
        ||
        null;

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
    // Execute Event
    //--------------------------------


    executeEvent(
        event,
        trainerState
    )
    {


        //--------------------------------
        // World visibility check
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
        // Requirement check
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
        // Apply rewards
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
        // Apply effects
        //--------------------------------


        const effects =
            event.effects
            ||
            {};





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
            typeof trainerState.completeEvent === "function"
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
                trainerState.getState()

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
            event.choices
            ||
            []
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


        const effects =
            choice.effects
            ||
            {};



        return this.rewardService.execute(
            effects,
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


        //--------------------------------
        // Completed event
        //--------------------------------


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
            event.requirements
            ||
            {};





        //--------------------------------
        // Story Flags
        //--------------------------------


        for(
            const flag of requirements.storyFlags || []
        )
        {

            if(
                !trainerState.hasStoryFlag(
                    flag
                )
            )
            {

                return {

                    allowed:false,

                    reason:
                        `Requires story flag ${flag}`

                };

            }

        }





        //--------------------------------
        // Items
        //--------------------------------


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





        //--------------------------------
        // Key Items
        //--------------------------------


        for(
            const item of requirements.keyItems || []
        )
        {

            if(
                !trainerState.hasKeyItem(
                    item
                )
            )
            {

                return {

                    allowed:false,

                    reason:
                        `Requires key item ${item}`

                };

            }

        }





        //--------------------------------
        // Badges
        //--------------------------------


        for(
            const badge of requirements.badges || []
        )
        {


            if(
                !trainerState.hasBadge(
                    badge
                )
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
    // Visibility Proxy
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
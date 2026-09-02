/**
 * Pokémon Companion
 * NPC Classifier
 *
 * Classifies NPCs using their direct event and resolved event graph.
 *
 * Responsibilities:
 * - Coordinate event resolution.
 * - Coordinate scene resolution.
 * - Coordinate trainer resolution.
 * - Coordinate reward extraction.
 * - Determine NPC roles.
 * - Determine interaction types.
 * - Determine entity type.
 * - Determine significance.
 *
 * Does NOT:
 * - Write databases.
 * - Parse source files.
 * - Execute event logic.
 */

"use strict";


const NPCEventResolver =
    require("./npc-event-resolver");


const NPCSceneResolver =
    require("./npc-scene-resolver");


const NPCTrainerResolver =
    require("./npc-trainer-resolver");


const NPCRewardResolver =
    require("./npc-reward-resolver");



class NPCClassifier
{


    constructor()
    {

        this.eventResolver =
            new NPCEventResolver();


        this.sceneResolver =
            new NPCSceneResolver();


        this.trainerResolver =
            new NPCTrainerResolver();


        this.rewardResolver =
            new NPCRewardResolver();

    }


    //--------------------------------
    // Classify NPC
    //--------------------------------

    classifyNPC(
        npc,
        event,
        events,
        trainers
    )
    {

        const roles =
            [];


        const interactionTypes =
            [];


        const trainerIds =
            [];


        const trainerTypes =
            [];


        const trainerRecords =
            [];


        const rewards =
        {

            items:
                [],

            pokemon:
                [],

            eggs:
                [],

            tms:
                [],

            keyItems:
                [],

            money:
                0

        };


        const interactions =
            [];


        //--------------------------------
        // No event
        //--------------------------------

        if(
            !event
        )
        {

            return {

                entityType:
                    this.getEntityType(

                        npc,

                        null,

                        []

                    ),

                significance:
                    "AMBIENT",

                roles:
                    [
                        "AMBIENT"
                    ],

                interactionTypes,

                trainerIds,

                trainerTypes,

                trainers:
                    trainerRecords,

                rewards,

                interactions

            };

        }


        //--------------------------------
        // Resolve complete script graph
        //--------------------------------

        const resolved =
            this.eventResolver.resolve(

                event.id,

                events

            );


        const resolvedEvents =
            resolved.events;


        //--------------------------------
        // Process every resolved event
        //--------------------------------

        for(
            const resolvedEvent of
                resolvedEvents
        )
        {

            this.processEvent(

                resolvedEvent,

                roles,

                interactionTypes,

                trainerIds,

                trainerTypes,

                trainerRecords,

                rewards,

                interactions,

                trainers

            );

        }


        //--------------------------------
        // Entity type
        //--------------------------------

        const entityType =
            this.getEntityType(

                npc,

                event,

                resolvedEvents

            );


        //--------------------------------
        // Dialogue fallback
        //--------------------------------

        if(
            roles.length === 0
            &&
            interactionTypes.includes(
                "DIALOGUE"
            )
        )
        {

            roles.push(
                "DIALOGUE"
            );

        }


        //--------------------------------
        // Ambient fallback
        //--------------------------------

        if(
            roles.length === 0
        )
        {

            roles.push(
                "AMBIENT"
            );

        }


        //--------------------------------
        // Significance
        //--------------------------------

        const significance =
            this.getSignificance(

                roles

            );


        return {

            entityType,

            significance,

            roles,

            interactionTypes,

            trainerIds,

            trainerTypes,

            trainers:
                trainerRecords,

            rewards,

            interactions

        };

    }


    //--------------------------------
    // Classify scene participant
    //--------------------------------

    classifySceneParticipant(
        participant,
        trainers
    )
    {

        const roles =
            [];


        const interactionTypes =
            [];


        const trainerIds =
            [];


        const trainerTypes =
            [];


        const trainerRecords =
            [];


        const rewards =
        {

            items:
                [],

            pokemon:
                [],

            eggs:
                [],

            tms:
                [],

            keyItems:
                [],

            money:
                0

        };


        const interactions =
            [];


        //--------------------------------
        // Invalid participant
        //--------------------------------

        if(
            !participant
        )
        {

            roles.push(
                "AMBIENT"
            );


            return {

                entityType:
                    "HUMAN_NPC",

                significance:
                    "AMBIENT",

                roles,

                interactionTypes,

                trainerIds,

                trainerTypes,

                trainers:
                    trainerRecords,

                rewards,

                interactions

            };

        }


        //--------------------------------
        // Resolve scene trainer battles
        //--------------------------------

        for(
            const battle of
                participant.battles || []
        )
        {

            this.trainerResolver.processBattle(

                battle,

                roles,

                interactionTypes,

                trainerIds,

                trainerTypes,

                trainerRecords,

                interactions,

                trainers

            );

        }


        //--------------------------------
        // Preserve scene trainer IDs
        //--------------------------------

        for(
            const trainerId of
                participant.trainerIds || []
        )
        {

            this.addUnique(

                trainerIds,

                trainerId

            );

        }


        //--------------------------------
        // Resolve trainer records
        //--------------------------------

        for(
            const trainerId of
                participant.trainerIds || []
        )
        {

            const trainer =
                trainers[
                    trainerId
                ];


            if(
                !trainer
            )
            {

                continue;

            }


            const trainerType =
                this.trainerResolver.resolveTrainerType(

                    trainerId,

                    trainer

                );


            this.addUnique(

                trainerTypes,

                trainerType

            );


            const recordExists =
                trainerRecords.some(

                    record =>

                        record.id ===
                        trainerId

                );


            if(
                !recordExists
            )
            {

                trainerRecords.push({

                    id:
                        trainerId,

                    type:
                        trainerType,

                    name:
                        trainer.trainerName
                        ||
                        null,

                    class:
                        trainer.trainerClass
                        ||
                        null,

                    pic:
                        trainer.trainerPic
                        ||
                        null

                });

            }


            this.trainerResolver.addTrainerRole(

                roles,

                interactionTypes,

                trainerType

            );

        }


        //--------------------------------
        // Fallback trainer types
        //--------------------------------

        for(
            const trainerType of
                participant.trainerTypes || []
        )
        {

            this.addUnique(

                trainerTypes,

                trainerType

            );


            this.trainerResolver.addTrainerRole(

                roles,

                interactionTypes,

                trainerType

            );

        }


        //--------------------------------
        // Scene must represent a battle
        //--------------------------------

        if(
            trainerIds.length > 0
        )
        {

            this.addUnique(

                roles,

                "BATTLE"

            );


            this.addUnique(

                interactionTypes,

                "BATTLE"

            );

        }


        //--------------------------------
        // Fallback
        //--------------------------------

        if(
            roles.length === 0
        )
        {

            roles.push(
                "AMBIENT"
            );

        }


        //--------------------------------
        // Significance
        //--------------------------------

        const significance =
            this.getSignificance(

                roles

            );


        return {

            entityType:
                "HUMAN_NPC",

            significance,

            roles,

            interactionTypes,

            trainerIds,

            trainerTypes,

            trainers:
                trainerRecords,

            rewards,

            interactions

        };

    }


    //--------------------------------
    // Process resolved event
    //--------------------------------

    processEvent(
        event,
        roles,
        interactionTypes,
        trainerIds,
        trainerTypes,
        trainerRecords,
        rewards,
        interactions,
        trainers
    )
    {

        //--------------------------------
        // Dialogue
        //--------------------------------

        if(
            Array.isArray(
                event.dialogues
            )
            &&
            event.dialogues.length > 0
        )
        {

            this.addUnique(

                interactionTypes,

                "DIALOGUE"

            );

        }


        const effects =
            event.effects
            ||
            {};


        //--------------------------------
        // Battles
        //--------------------------------

        if(
            Array.isArray(
                effects.battles
            )
        )
        {

            for(
                const battle of
                    effects.battles
            )
            {

                if(
                    !battle
                )
                {

                    continue;

                }


                //--------------------------------
                // Trainer battle
                //--------------------------------

                if(
                    battle.type ===
                    "trainer"
                )
                {

                    this.trainerResolver.processBattle(

                        battle,

                        roles,

                        interactionTypes,

                        trainerIds,

                        trainerTypes,

                        trainerRecords,

                        interactions,

                        trainers

                    );

                }


                //--------------------------------
                // Wild battle
                //--------------------------------

                if(
                    battle.type ===
                    "wild"
                )
                {

                    this.addUnique(

                        roles,

                        "SPECIAL_ENCOUNTER"

                    );


                    this.addUnique(

                        interactionTypes,

                        "WILD_BATTLE"

                    );


                    interactions.push({

                        type:
                            "WILD_BATTLE",

                        species:
                            battle.species
                            ||
                            null,

                        level:
                            battle.level
                            ||
                            null

                    });

                }

            }

        }


        //--------------------------------
        // Rewards
        //--------------------------------

        this.rewardResolver.process(

            event,

            roles,

            interactionTypes,

            rewards,

            interactions

        );


        //--------------------------------
        // Story progression
        //--------------------------------

        const addFlags =
            Array.isArray(
                effects.addStoryFlags
            )
            ?
            effects.addStoryFlags
            :
            [];


        const removeFlags =
            Array.isArray(
                effects.removeStoryFlags
            )
            ?
            effects.removeStoryFlags
            :
            [];


        if(
            addFlags.length > 0
            ||
            removeFlags.length > 0
        )
        {

            this.addUnique(

                roles,

                "STORY"

            );


            this.addUnique(

                roles,

                "PROGRESSION"

            );


            this.addUnique(

                interactionTypes,

                "STORY_EVENT"

            );


            interactions.push({

                type:
                    "STORY_EVENT",

                addStoryFlags:
                    addFlags,

                removeStoryFlags:
                    removeFlags

            });

        }


        //--------------------------------
        // Conditional event
        //--------------------------------

        if(
            event.requirements
            &&
            Object.keys(
                event.requirements
            ).length > 0
        )
        {

            this.addUnique(

                interactionTypes,

                "CONDITIONAL"

            );

        }


        if(
            event.conditions
            &&
            Object.keys(
                event.conditions
            ).length > 0
        )
        {

            this.addUnique(

                interactionTypes,

                "CONDITIONAL"

            );

        }

    }


    //--------------------------------
    // Determine entity type
    //--------------------------------

    getEntityType(
        npc,
        event,
        resolvedEvents = []
    )
    {

        //--------------------------------
        // Item objects
        //--------------------------------

        if(
            npc
            &&
            typeof npc.graphics ===
                "string"
            &&
            npc.graphics.includes(
                "ITEM_BALL"
            )
        )
        {

            return "INTERACTIVE_OBJECT";

        }


        //--------------------------------
        // Fossil objects
        //--------------------------------

        if(
            npc
            &&
            typeof npc.graphics ===
                "string"
            &&
            npc.graphics.includes(
                "FOSSIL"
            )
        )
        {

            return "INTERACTIVE_OBJECT";

        }


        //--------------------------------
        // Wild battles
        //--------------------------------

        if(
            resolvedEvents.some(

                resolvedEvent =>

                    resolvedEvent
                    &&
                    resolvedEvent.effects
                    &&
                    Array.isArray(
                        resolvedEvent.effects.battles
                    )
                    &&
                    resolvedEvent.effects.battles.some(

                        battle =>

                            battle
                            &&
                            battle.type ===
                                "wild"

                    )

            )
        )
        {

            return "SPECIAL_ENCOUNTER";

        }


        //--------------------------------
        // Direct fallback
        //--------------------------------

        if(
            event
            &&
            event.effects
            &&
            Array.isArray(
                event.effects.battles
            )
            &&
            event.effects.battles.some(

                battle =>

                    battle
                    &&
                    battle.type ===
                        "wild"

            )
        )
        {

            return "SPECIAL_ENCOUNTER";

        }


        //--------------------------------
        // Human NPC
        //--------------------------------

        return "HUMAN_NPC";

    }


    //--------------------------------
    // Determine significance
    //--------------------------------

    getSignificance(
        roles
    )
    {

        if(
            roles.includes(
                "GYM_LEADER"
            )
            ||
            roles.includes(
                "ELITE_FOUR"
            )
            ||
            roles.includes(
                "CHAMPION"
            )
            ||
            roles.includes(
                "RIVAL"
            )
        )
        {

            return "CRITICAL";

        }


        if(
            roles.includes(
                "VILLAIN_TEAM"
            )
            ||
            roles.includes(
                "SPECIAL_ENCOUNTER"
            )
            ||
            roles.includes(
                "GIFT_POKEMON"
            )
            ||
            roles.includes(
                "GIFT_EGG"
            )
            ||
            roles.includes(
                "FRIENDSHIP"
            )
            ||
            roles.includes(
                "STORY"
            )
        )
        {

            return "HIGH";

        }


        if(
            roles.includes(
                "TRAINER"
            )
            ||
            roles.includes(
                "REWARD"
            )
            ||
            roles.includes(
                "MACHINE_REWARD"
            )
            ||
            roles.includes(
                "KEY_ITEM_REWARD"
            )
        )
        {

            return "MEDIUM";

        }


        if(
            roles.includes(
                "DIALOGUE"
            )
        )
        {

            return "LOW";

        }


        return "AMBIENT";

    }


    //--------------------------------
    // Add unique array value
    //--------------------------------

    addUnique(
        array,
        value
    )
    {

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
    NPCClassifier;
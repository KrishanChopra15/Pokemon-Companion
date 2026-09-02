/**
 * Pokémon Companion
 * NPC Scene Resolver
 *
 * Resolves map-level and coordinate-triggered scene scripts.
 *
 * Responsibilities:
 * - Resolve map script entry points.
 * - Resolve coordinate event entry points.
 * - Follow event script calls.
 * - Follow event script jumps.
 * - Collect local ID references per scene path.
 * - Match local IDs to map objects.
 * - Collect trainer battles per scene path.
 * - Associate trainer battles with likely scene participants.
 * - Preserve event IDs for each scene participant.
 *
 * Does NOT:
 * - Classify NPCs globally.
 * - Execute runtime conditions.
 * - Modify event data.
 */

"use strict";


class NPCSceneResolver
{


    //--------------------------------
    // Resolve one map scene
    //--------------------------------

    resolve(
        mapScriptData,
        events,
        objects = [],
        coordinateEvents = []
    )
    {

        if(
            !mapScriptData
            ||
            typeof mapScriptData !==
                "object"
        )
        {

            return {

                map:
                    null,

                localIds:
                    [],

                eventIds:
                    [],

                trainerIds:
                    [],

                trainerTypes:
                    [],

                battles:
                    [],

                participants:
                    [],

                battleParticipants:
                    []

            };

        }


        const scenePaths =
            [];


        //--------------------------------
        // Map script entry points
        //--------------------------------

        for(
            const script of
                mapScriptData.mapScripts || []
        )
        {

            if(
                !script
                ||
                !script.target
            )
            {

                continue;

            }


            scenePaths.push(

                this.resolveEntryPoint(

                    script.target,

                    events,

                    mapScriptData,

                    objects

                )

            );

        }


        //--------------------------------
        // Conditional map script entry points
        //--------------------------------

        for(
            const script of
                mapScriptData.conditionalScripts || []
        )
        {

            if(
                !script
                ||
                !script.target
            )
            {

                continue;

            }


            scenePaths.push(

                this.resolveEntryPoint(

                    script.target,

                    events,

                    mapScriptData,

                    objects

                )

            );

        }


        //--------------------------------
        // Coordinate event entry points
        //--------------------------------

        for(
            const coordinateEvent of
                coordinateEvents
        )
        {

            if(
                !coordinateEvent
                ||
                !coordinateEvent.target
            )
            {

                continue;

            }


            scenePaths.push(

                this.resolveEntryPoint(

                    coordinateEvent.target,

                    events,

                    mapScriptData,

                    objects

                )

            );

        }


        //--------------------------------
        // Aggregate paths
        //--------------------------------

        const eventIds =
            [];


        const localIds =
            [];


        const trainerIds =
            [];


        const trainerTypes =
            [];


        const battles =
            [];


        const participants =
            [];


        const battleParticipants =
            [];


        for(
            const scenePath of
                scenePaths
        )
        {

            this.mergeUnique(

                eventIds,

                scenePath.eventIds

            );


            this.mergeUnique(

                localIds,

                scenePath.localIds

            );


            this.mergeUnique(

                trainerIds,

                scenePath.trainerIds

            );


            this.mergeUnique(

                trainerTypes,

                scenePath.trainerTypes

            );


            this.mergeUniqueObjects(

                battles,

                scenePath.battles

            );


            for(
                const participant of
                    scenePath.participants
            )
            {

                this.mergeParticipant(

                    participants,

                    participant

                );

            }


            for(
                const participant of
                    scenePath.battleParticipants
            )
            {

                this.mergeParticipant(

                    battleParticipants,

                    participant

                );

            }

        }


        return {

            map:
                mapScriptData.map
                ||
                null,

            localIds,

            eventIds,

            trainerIds,

            trainerTypes,

            battles,

            participants,

            battleParticipants

        };

    }


    //--------------------------------
    // Resolve one scene entry point
    //--------------------------------

    resolveEntryPoint(
        entryPoint,
        events,
        mapScriptData,
        objects
    )
    {

        const eventIds =
            [];


        const localIds =
            [];


        const trainerIds =
            [];


        const trainerTypes =
            [];


        const battles =
            [];


        const visited =
            new Set();


        const addUnique =
            (
                array,
                value
            ) =>
            {

                if(
                    value
                    &&
                    !array.includes(
                        value
                    )
                )
                {

                    array.push(
                        value
                    );

                }

            };


        const addUniqueObject =
            (
                array,
                value
            ) =>
            {

                const exists =
                    array.some(

                        existing =>

                            JSON.stringify(
                                existing
                            )
                            ===
                            JSON.stringify(
                                value
                            )

                    );


                if(
                    !exists
                )
                {

                    array.push(
                        value
                    );

                }

            };


        //--------------------------------
        // Traverse event graph
        //--------------------------------

        const visit =
            eventId =>
            {

                if(
                    !eventId
                    ||
                    visited.has(
                        eventId
                    )
                )
                {

                    return;

                }


                visited.add(
                    eventId
                );


                const event =
                    events[
                        eventId
                    ];


                if(
                    !event
                )
                {

                    return;

                }


                addUnique(

                    eventIds,

                    eventId

                );


                //--------------------------------
                // Local IDs
                //--------------------------------

                const reference =
                    this.findScriptReference(

                        mapScriptData,

                        eventId

                    );


                if(
                    reference
                )
                {

                    for(
                        const localId of
                            reference.localIds || []
                    )
                    {

                        if(
                            localId
                            &&
                            localId !==
                                "LOCALID_PLAYER"
                        )
                        {

                            addUnique(

                                localIds,

                                localId

                            );

                        }

                    }

                }


                //--------------------------------
                // Trainer battles
                //--------------------------------

                const eventBattles =
                    event.effects
                    &&
                    Array.isArray(
                        event.effects.battles
                    )
                    ?
                    event.effects.battles
                    :
                    [];


                for(
                    const battle of
                        eventBattles
                )
                {

                    if(
                        battle
                        &&
                        battle.type ===
                            "trainer"
                    )
                    {

                        addUnique(

                            trainerIds,

                            battle.trainer

                        );


                        addUniqueObject(

                            battles,

                            battle

                        );

                    }

                }


                //--------------------------------
                // Calls
                //--------------------------------

                for(
                    const call of
                        event.calls || []
                )
                {

                    if(
                        call
                        &&
                        call.target
                    )
                    {

                        visit(
                            call.target
                        );

                    }

                }


                //--------------------------------
                // Jumps
                //--------------------------------

                for(
                    const jump of
                        event.jumps || []
                )
                {

                    if(
                        jump
                        &&
                        jump.target
                    )
                    {

                        visit(
                            jump.target
                        );

                    }

                }

            };


        visit(
            entryPoint
        );


        //--------------------------------
        // Resolve trainer types
        //--------------------------------

        for(
            const trainerId of
                trainerIds
        )
        {

            addUnique(

                trainerTypes,

                this.getTrainerType(
                    trainerId
                )

            );

        }


        //--------------------------------
        // Resolve participants
        //--------------------------------

        const participants =
            this.buildParticipants(

                mapScriptData,

                objects,

                localIds,

                eventIds

            );


        //--------------------------------
        // Resolve battle participant
        //--------------------------------

        const battleParticipants =
            this.resolveBattleParticipants(

                participants,

                battles,

                trainerIds,

                trainerTypes,

                eventIds

            );


        return {

            entryPoint,

            eventIds,

            localIds,

            trainerIds,

            trainerTypes,

            battles,

            participants,

            battleParticipants

        };

    }


    //--------------------------------
    // Build participants
    //--------------------------------

    buildParticipants(
        mapScriptData,
        objects,
        localIds,
        eventIds = []
    )
    {

        const mapObjects =
            Array.isArray(
                objects
            )
            ?
            objects.filter(

                object =>

                    object
                    &&
                    object.map ===
                        mapScriptData.map

            )
            :
            [];


        const participants =
            [];


        for(
            const localId of
                localIds
        )
        {

            const object =
                mapObjects.find(

                    candidate =>

                        candidate.localId ===
                        localId

                );


            participants.push({

                localId,

                object:
                    object
                    ||
                    null,

                eventIds:
                    [
                        ...eventIds
                    ],

                trainerIds:
                    [],

                trainerTypes:
                    [],

                battles:
                    []

            });

        }


        return participants;

    }


    //--------------------------------
    // Resolve battle participant
    //--------------------------------

    resolveBattleParticipants(
        participants,
        battles,
        trainerIds,
        trainerTypes,
        eventIds = []
    )
    {

        const candidates =
            participants.filter(

                participant =>

                    participant
                    &&
                    participant.object

            );


        if(
            candidates.length ===
            0
        )
        {

            return [];

        }


        const candidate =
            this.findBattleParticipant(

                candidates,

                trainerTypes

            );


        if(
            !candidate
        )
        {

            return [];

        }


        return [

            {

                localId:
                    candidate.localId,

                object:
                    candidate.object,

                eventIds:
                    [
                        ...eventIds
                    ],

                trainerIds:
                    [
                        ...trainerIds
                    ],

                trainerTypes:
                    [
                        ...trainerTypes
                    ],

                battles:
                    [
                        ...battles
                    ]

            }

        ];

    }


    //--------------------------------
    // Merge participant
    //--------------------------------

    mergeParticipant(
        array,
        participant
    )
    {

        const existing =
            array.find(

                value =>

                    value.localId ===
                    participant.localId

            );


        if(
            !existing
        )
        {

            array.push({

                localId:
                    participant.localId,

                object:
                    participant.object
                    ||
                    null,

                eventIds:
                    [
                        ...(participant.eventIds || [])
                    ],

                trainerIds:
                    [
                        ...(participant.trainerIds || [])
                    ],

                trainerTypes:
                    [
                        ...(participant.trainerTypes || [])
                    ],

                battles:
                    [
                        ...(participant.battles || [])
                    ]

            });

            return;

        }


        this.mergeUnique(

            existing.eventIds,

            participant.eventIds || []

        );


        this.mergeUnique(

            existing.trainerIds,

            participant.trainerIds || []

        );


        this.mergeUnique(

            existing.trainerTypes,

            participant.trainerTypes || []

        );


        this.mergeUniqueObjects(

            existing.battles,

            participant.battles || []

        );

    }


    //--------------------------------
    // Find likely battle participant
    //--------------------------------

    findBattleParticipant(
        candidates,
        trainerTypes
    )
    {

        //--------------------------------
        // Champion
        //--------------------------------

        if(
            trainerTypes.includes(
                "CHAMPION"
            )
        )
        {

            const champion =
                candidates.find(

                    participant =>

                        this.isRivalLikeObject(
                            participant
                        )

                );


            if(
                champion
            )
            {

                return champion;

            }

        }


        //--------------------------------
        // Rival
        //--------------------------------

        if(
            trainerTypes.includes(
                "RIVAL"
            )
        )
        {

            const rival =
                candidates.find(

                    participant =>

                        this.isRivalLikeObject(
                            participant
                        )

                );


            if(
                rival
            )
            {

                return rival;

            }

        }


        //--------------------------------
        // Villain team
        //--------------------------------

        if(
            trainerTypes.includes(
                "VILLAIN_TEAM"
            )
        )
        {

            const villain =
                candidates.find(

                    participant =>

                        this.isVillainLikeObject(
                            participant
                        )

                );


            if(
                villain
            )
            {

                return villain;

            }

        }


        return null;

    }


    //--------------------------------
    // Identify Rival / Blue object
    //--------------------------------

    isRivalLikeObject(
        participant
    )
    {

        const localId =
            String(
                participant.localId
                ||
                ""
            ).toUpperCase();


        const graphics =
            String(
                participant.object?.graphics
                ||
                ""
            ).toUpperCase();


        return (

            localId.includes(
                "RIVAL"
            )

            ||

            graphics.includes(
                "BLUE"
            )

        );

    }


    //--------------------------------
    // Identify villain object
    //--------------------------------

    isVillainLikeObject(
        participant
    )
    {

        const localId =
            String(
                participant.localId
                ||
                ""
            ).toUpperCase();


        const graphics =
            String(
                participant.object?.graphics
                ||
                ""
            ).toUpperCase();


        return (

            localId.includes(
                "ROCKET"
            )

            ||

            localId.includes(
                "GRUNT"
            )

            ||

            localId.includes(
                "VILLAIN"
            )

            ||

            graphics.includes(
                "ROCKET"
            )

        );

    }


    //--------------------------------
    // Merge unique values
    //--------------------------------

    mergeUnique(
        target,
        values
    )
    {

        for(
            const value of
                values || []
        )
        {

            if(
                value
                &&
                !target.includes(
                    value
                )
            )
            {

                target.push(
                    value
                );

            }

        }

    }


    //--------------------------------
    // Merge unique objects
    //--------------------------------

    mergeUniqueObjects(
        target,
        values
    )
    {

        for(
            const value of
                values || []
        )
        {

            const exists =
                target.some(

                    existing =>

                        JSON.stringify(
                            existing
                        )
                        ===
                        JSON.stringify(
                            value
                        )

                );


            if(
                !exists
            )
            {

                target.push(
                    value
                );

            }

        }

    }


    //--------------------------------
    // Resolve trainer type
    //--------------------------------

    getTrainerType(
        trainerId
    )
    {

        const id =
            String(
                trainerId
                ||
                ""
            ).toUpperCase();


        if(
            id.includes(
                "CHAMPION"
            )
        )
        {

            return "CHAMPION";

        }


        if(
            id.includes(
                "ELITE_FOUR"
            )
        )
        {

            return "ELITE_FOUR";

        }


        if(
            id.includes(
                "RIVAL"
            )
        )
        {

            return "RIVAL";

        }


        if(
            id.includes(
                "ROCKET"
            )
            ||
            id.includes(
                "AQUA"
            )
            ||
            id.includes(
                "MAGMA"
            )
            ||
            id.includes(
                "GALACTIC"
            )
            ||
            id.includes(
                "PLASMA"
            )
        )
        {

            return "VILLAIN_TEAM";

        }


        return "TRAINER";

    }


    //--------------------------------
    // Find local ID references
    //--------------------------------

    findScriptReference(
        mapScriptData,
        eventId
    )
    {

        for(
            const reference of
                mapScriptData.scriptReferences || []
        )
        {

            if(
                reference
                &&
                reference.id ===
                    eventId
            )
            {

                return reference;

            }

        }


        return null;

    }


}


module.exports =
    NPCSceneResolver;
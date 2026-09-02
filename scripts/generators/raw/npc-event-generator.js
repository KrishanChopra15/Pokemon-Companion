/**
 * Pokémon Companion
 * NPC Event Generator
 *
 * Generates the NPC database.
 *
 * Responsibilities:
 * - Convert extracted NPC events.
 * - Ask the NPC classifier for classification data.
 * - Resolve scene-driven NPCs.
 * - Preserve spatial information.
 * - Merge scene data into existing NPC records.
 * - Write the NPC database.
 *
 * Does NOT:
 * - Resolve event graphs directly.
 * - Resolve trainers directly.
 * - Extract rewards directly.
 * - Classify NPC roles directly.
 * - Parse ROM source.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");


const NPCClassifier =
    require("./npc-classifier");



class NPCEventGenerator
{


    //--------------------------------
    // Constructor
    //--------------------------------

    constructor()
    {

        this.classifier =
            new NPCClassifier();

    }


    //--------------------------------
    // Generate NPC database
    //--------------------------------

    generate(
        npcs,
        events,
        trainers,
        game,
        objects = [],
        mapScripts = {},
        coordinateEvents = {}
    )
    {

        if(
            !npcs
            ||
            typeof npcs !==
                "object"
        )
        {

            throw new TypeError(
                "NPC data must be an object."
            );

        }


        if(
            !events
            ||
            typeof events !==
                "object"
        )
        {

            throw new TypeError(
                "Event data must be an object."
            );

        }


        if(
            !trainers
            ||
            typeof trainers !==
                "object"
        )
        {

            throw new TypeError(
                "Trainer data must be an object."
            );

        }


        if(
            typeof game !==
                "string"
            ||
            !game
        )
        {

            throw new TypeError(
                "Game must be a non-empty string."
            );

        }


        if(
            !Array.isArray(
                objects
            )
        )
        {

            throw new TypeError(
                "Object data must be an array."
            );

        }


        if(
            !mapScripts
            ||
            typeof mapScripts !==
                "object"
        )
        {

            throw new TypeError(
                "Map script data must be an object."
            );

        }


        if(
            !coordinateEvents
            ||
            typeof coordinateEvents !==
                "object"
        )
        {

            throw new TypeError(
                "Coordinate event data must be an object."
            );

        }


        const outputPath =
            path.join(

                __dirname,

                "../../../database/generated",

                game,

                "npcs.json"

            );


        const database =
            {};


        //--------------------------------
        // Build ordinary NPC records
        //--------------------------------

        for(
            const location of
                Object.keys(npcs)
        )
        {

            const locationNPCs =
                Array.isArray(
                    npcs[location]
                )
                ?
                npcs[location]
                :
                [];


            database[location] =
                locationNPCs.map(

                    npc =>

                        this.buildNPCRecord(

                            npc,

                            location,

                            events,

                            trainers

                        )

                );

        }


        //--------------------------------
        // Enrich scene-driven NPC records
        //--------------------------------

        this.addSceneNPCRecords(

            database,

            npcs,

            events,

            trainers,

            objects,

            mapScripts,

            coordinateEvents

        );


        //--------------------------------
        // Write database
        //--------------------------------

        fs.mkdirSync(

            path.dirname(
                outputPath
            ),

            {
                recursive:
                    true
            }

        );


        fs.writeFileSync(

            outputPath,

            JSON.stringify(

                database,

                null,

                4

            ),

            "utf8"

        );


        console.log();


        console.log(
            "Generated NPC database."
        );


        console.log(
            `Locations: ${Object.keys(database).length}`
        );


        const totalNPCs =
            Object.values(
                database
            )
            .reduce(

                (
                    total,
                    locationNPCs
                ) =>

                    total +
                    locationNPCs.length,

                0

            );


        console.log(
            `NPCs: ${totalNPCs}`
        );


        console.log();


        return database;

    }


    //--------------------------------
    // Build one ordinary NPC record
    //--------------------------------

    buildNPCRecord(
        npc,
        location,
        events,
        trainers
    )
    {

        const event =
            events[
                npc.script
            ]
            ||
            null;


        const classification =
            this.classifier.classifyNPC(

                npc,

                event,

                events,

                trainers

            );


        return {

            id:
                npc.script,


            name:
                this.getNPCName(
                    npc
                ),


            graphics:
                npc.graphics,


            script:
                npc.script,


            location,


            position:
                npc.position,


            entityType:
                classification.entityType,


            significance:
                classification.significance,


            roles:
                classification.roles,


            interactionTypes:
                classification.interactionTypes,


            eventId:
                event
                ?
                event.id
                :
                null,


            trainerIds:
                classification.trainerIds,


            trainerTypes:
                classification.trainerTypes,


            trainers:
                classification.trainers,


            rewards:
                classification.rewards,


            interactions:
                classification.interactions

        };

    }


    //--------------------------------
    // Enrich scene-driven NPC records
    //--------------------------------

    addSceneNPCRecords(
        database,
        npcs,
        events,
        trainers,
        objects,
        mapScripts,
        coordinateEvents
    )
    {

        const maps =
            new Set([

                ...Object.keys(
                    mapScripts || {}
                ),

                ...Object.keys(
                    coordinateEvents || {}
                )

            ]);


        for(
            const map of
                maps
        )
        {

            const mapScriptData =
                mapScripts[
                    map
                ];


            const mapCoordinateEvents =
                Array.isArray(
                    coordinateEvents[
                        map
                    ]
                )
                ?
                coordinateEvents[
                    map
                ]
                :
                [];


            if(
                !mapScriptData
                &&
                mapCoordinateEvents.length ===
                    0
            )
            {

                continue;

            }


            const sceneData =
                mapScriptData
                ||
                {

                    map,

                    mapScripts:
                        [],

                    conditionalScripts:
                        [],

                    localIds:
                        [],

                    scriptReferences:
                        []

                };


            const scene =
                this.classifier.sceneResolver.resolve(

                    sceneData,

                    events,

                    objects,

                    mapCoordinateEvents

                );


            //--------------------------------
            // Process battle participants
            //--------------------------------

            for(
                const participant of
                    scene.battleParticipants || []
            )
            {

                if(
                    !participant
                    ||
                    !participant.object
                )
                {

                    continue;

                }


                //--------------------------------
                // Classify scene participant
                //--------------------------------

                const classification =
                    this.classifier.classifySceneParticipant(

                        participant,

                        trainers

                    );


                if(
                    !classification.roles
                    ||
                    classification.roles.length ===
                        0
                )
                {

                    continue;

                }


                //--------------------------------
                // Find location
                //--------------------------------

                const location =
                    this.findLocationForMap(

                        map,

                        npcs,

                        database

                    );


                if(
                    !database[location]
                )
                {

                    database[location] =
                        [];

                }


                //--------------------------------
                // Build scene record
                //--------------------------------

                const record =
                    this.buildSceneNPCRecord(

                        participant,

                        location,

                        classification

                    );


                //--------------------------------
                // Extract rewards from this
                // participant's scene path
                //--------------------------------

                record.rewards =
                    this.mergeRewards(

                        record.rewards,

                        this.extractSceneRewards(

                            participant,

                            events

                        )

                    );


                //--------------------------------
                // Find existing NPC
                //--------------------------------

                const existingIndex =
                    this.findSceneNPCIndex(

                        database,

                        location,

                        participant.object

                    );


                //--------------------------------
                // Merge into existing NPC
                //--------------------------------

                if(
                    existingIndex !==
                    -1
                )
                {

                    database[location][
                        existingIndex
                    ] =
                        this.mergeSceneNPCRecord(

                            database[location][
                                existingIndex
                            ],

                            record

                        );


                    continue;

                }


                //--------------------------------
                // Add missing scene NPC
                //--------------------------------

                database[location].push(
                    record
                );

            }

        }

    }


    //--------------------------------
    // Build scene NPC record
    //--------------------------------

    buildSceneNPCRecord(
        participant,
        location,
        classification
    )
    {

        const object =
            participant.object;


        return {

            id:
                `${object.map}_${participant.localId}`,

            localId:
                participant.localId,

            name:
                this.getNPCName(
                    object
                ),

            graphics:
                object.graphics,

            script:
                object.script ===
                "0x0"
                ?
                null
                :
                object.script,

            location,

            position:
                object.position,

            entityType:
                classification.entityType,

            significance:
                classification.significance,

            roles:
                classification.roles,

            interactionTypes:
                classification.interactionTypes,

            eventId:
                null,

            trainerIds:
                classification.trainerIds,

            trainerTypes:
                classification.trainerTypes,

            trainers:
                classification.trainers,

            rewards:
                classification.rewards,

            interactions:
                classification.interactions

        };

    }


    //--------------------------------
    // Extract rewards from scene events
    //--------------------------------

    extractSceneRewards(
        participant,
        events
    )
    {

        const rewards =
        {

            items: [],

            pokemon: [],

            eggs: [],

            tms: [],

            keyItems: [],

            money: 0

        };


        for(
            const eventId of
                participant.eventIds || []
        )
        {

            const event =
                events[
                    eventId
                ];


            if(
                !event
            )
            {

                continue;

            }


            const convertedRewards =
                this.convertRewards(

                    event.effects ||
                    {}

                );


            for(
                const reward of
                    convertedRewards
            )
            {

                switch(
                    reward.type
                )
                {

                    case "item":

                        rewards.items.push(
                            reward
                        );

                        break;


                    case "pokemon":

                        rewards.pokemon.push(
                            reward
                        );

                        break;


                    case "egg":

                        rewards.eggs.push(
                            reward
                        );

                        break;


                    case "tm":

                        rewards.tms.push(
                            reward
                        );

                        break;


                    case "keyItem":

                        rewards.keyItems.push(
                            reward.item
                        );

                        break;


                    case "money":

                        rewards.money =
                            Math.max(

                                rewards.money,

                                reward.amount ||
                                0

                            );

                        break;

                }

            }

        }


        return rewards;

    }


    //--------------------------------
    // Convert effects → rewards
    //--------------------------------

    convertRewards(
        effects = {}
    )
    {

        const rewards = [];


        //--------------------------------
        // Items
        //--------------------------------

        for(
            const item of
                effects.addItems || []
        )
        {

            rewards.push({

                type:
                    "item",

                item:
                    item.item
                    ||
                    item.name,

                quantity:
                    item.quantity
                    ||
                    1

            });

        }


        //--------------------------------
        // Pokémon
        //--------------------------------

        for(
            const pokemon of
                effects.addPokemon || []
        )
        {

            rewards.push({

                type:
                    "pokemon",

                pokemon

            });

        }


        //--------------------------------
        // Eggs
        //--------------------------------

        for(
            const egg of
                effects.addEggs || []
        )
        {

            rewards.push({

                type:
                    "egg",

                pokemon:
                    egg

            });

        }


        //--------------------------------
        // Money
        //--------------------------------

        if(
            effects.addMoney > 0
        )
        {

            rewards.push({

                type:
                    "money",

                amount:
                    effects.addMoney

            });

        }


        //--------------------------------
        // TMs
        //--------------------------------

        for(
            const tm of
                effects.addTMs || []
        )
        {

            rewards.push({

                type:
                    "tm",

                tm

            });

        }


        //--------------------------------
        // Key Items
        //--------------------------------

        for(
            const item of
                effects.addKeyItems || []
        )
        {

            rewards.push({

                type:
                    "keyItem",

                item

            });

        }


        return rewards;

    }


    //--------------------------------
    // Merge scene data into NPC
    //--------------------------------

    mergeSceneNPCRecord(
        existing,
        sceneRecord
    )
    {

        return {

            ...existing,


            //--------------------------------
            // Identity
            //--------------------------------

            id:
                existing.id
                ||
                sceneRecord.id,


            localId:
                existing.localId
                ||
                sceneRecord.localId,


            name:
                existing.name
                ||
                sceneRecord.name,


            graphics:
                existing.graphics
                ||
                sceneRecord.graphics,


            script:
                existing.script
                ||
                sceneRecord.script,


            location:
                existing.location
                ||
                sceneRecord.location,


            position:
                existing.position
                ||
                sceneRecord.position,


            //--------------------------------
            // Classification
            //--------------------------------

            entityType:
                existing.entityType
                ||
                sceneRecord.entityType,


            significance:
                this.mergeSignificance(

                    existing.significance,

                    sceneRecord.significance

                ),


            roles:
                this.mergeArrayValues(

                    existing.roles,

                    sceneRecord.roles

                ),


            interactionTypes:
                this.mergeArrayValues(

                    existing.interactionTypes,

                    sceneRecord.interactionTypes

                ),


            //--------------------------------
            // Event
            //--------------------------------

            eventId:
                existing.eventId
                ||
                sceneRecord.eventId,


            //--------------------------------
            // Trainers
            //--------------------------------

            trainerIds:
                this.mergeArrayValues(

                    existing.trainerIds,

                    sceneRecord.trainerIds

                ),


            trainerTypes:
                this.mergeArrayValues(

                    existing.trainerTypes,

                    sceneRecord.trainerTypes

                ),


            trainers:
                this.mergeObjectArray(

                    existing.trainers,

                    sceneRecord.trainers,

                    "id"

                ),


            //--------------------------------
            // Rewards
            //--------------------------------

            rewards:
                this.mergeRewards(

                    existing.rewards,

                    sceneRecord.rewards

                ),


            //--------------------------------
            // Interactions
            //--------------------------------

            interactions:
                this.mergeObjectArray(

                    existing.interactions,

                    sceneRecord.interactions,

                    "trainerId"

                )

        };

    }


    //--------------------------------
    // Merge significance
    //--------------------------------

    mergeSignificance(
        existing,
        incoming
    )
    {

        const priority =
        {

            AMBIENT:
                0,

            LOW:
                1,

            MEDIUM:
                2,

            HIGH:
                3,

            CRITICAL:
                4

        };


        if(
            !existing
        )
        {

            return incoming;

        }


        if(
            !incoming
        )
        {

            return existing;

        }


        return (

            (
                priority[incoming]
                ||
                0
            )
            >
            (
                priority[existing]
                ||
                0
            )

            ?

            incoming

            :

            existing

        );

    }


    //--------------------------------
    // Merge primitive arrays
    //--------------------------------

    mergeArrayValues(
        existing = [],
        additions = []
    )
    {

        return [

            ...new Set([

                ...(existing || []),

                ...(additions || [])

            ])

        ];

    }


    //--------------------------------
    // Merge object arrays
    //--------------------------------

    mergeObjectArray(
        existing = [],
        additions = [],
        key
    )
    {

        const result =
        [
            ...(existing || [])
        ];


        for(
            const addition of
                additions || []
        )
        {

            const exists =
                result.some(

                    item =>

                        item
                        &&
                        addition
                        &&
                        item[key] ===
                        addition[key]

                );


            if(
                !exists
            )
            {

                result.push(
                    addition
                );

            }

        }


        return result;

    }


    //--------------------------------
    // Merge rewards
    //--------------------------------

    mergeRewards(
        existing = {},
        additions = {}
    )
    {

        const current =
        {

            items:
                existing.items || [],

            pokemon:
                existing.pokemon || [],

            eggs:
                existing.eggs || [],

            tms:
                existing.tms || [],

            keyItems:
                existing.keyItems || [],

            money:
                existing.money || 0

        };


        const incoming =
        {

            items:
                additions.items || [],

            pokemon:
                additions.pokemon || [],

            eggs:
                additions.eggs || [],

            tms:
                additions.tms || [],

            keyItems:
                additions.keyItems || [],

            money:
                additions.money || 0

        };


        return {

            items:
                this.mergeObjectArray(

                    current.items,

                    incoming.items,

                    "item"

                ),


            pokemon:
                this.mergeObjectArray(

                    current.pokemon,

                    incoming.pokemon,

                    "pokemon"

                ),


            eggs:
                this.mergeObjectArray(

                    current.eggs,

                    incoming.eggs,

                    "pokemon"

                ),


            tms:
                this.mergeTMRewards(
                
                    current.tms,
                
                    incoming.tms
                
                ),


            keyItems:
                this.mergeArrayValues(

                    current.keyItems,

                    incoming.keyItems

                ),


            money:
                Math.max(

                    current.money,

                    incoming.money

                )

        };

    }


    //--------------------------------
    // Merge TM rewards
    //--------------------------------
    
    mergeTMRewards(
        existing = [],
        additions = []
    )
    {
    
        const result = [];
    
    
        for(
            const tm of
                existing || []
        )
        {
        
            const value =
                typeof tm ===
                "string"
                ?
                tm
                :
                tm?.tm;
        
        
            if(
                value
                &&
                !result.includes(
                    value
                )
            )
            {
            
                result.push(
                    value
                );
            
            }
        
        }
    
    
        for(
            const tm of
                additions || []
        )
        {
        
            const value =
                typeof tm ===
                "string"
                ?
                tm
                :
                tm?.tm;
        
        
            if(
                value
                &&
                !result.includes(
                    value
                )
            )
            {
            
                result.push(
                    value
                );
            
            }
        
        }
    
    
        return result;
    
    }


    //--------------------------------
    // Find existing scene NPC
    //--------------------------------

    findSceneNPCIndex(
        database,
        location,
        object
    )
    {

        const locationNPCs =
            database[
                location
            ];


        if(
            !Array.isArray(
                locationNPCs
            )
        )
        {

            return -1;

        }


        return locationNPCs.findIndex(

            npc =>

                this.isSameObject(

                    npc,

                    object

                )

        );

    }


    //--------------------------------
    // Compare NPC to source object
    //--------------------------------

    isSameObject(
        npc,
        object
    )
    {

        if(
            !npc
            ||
            !object
        )
        {

            return false;

        }


        if(
            npc.graphics !==
            object.graphics
        )
        {

            return false;

        }


        if(
            !npc.position
            ||
            !object.position
        )
        {

            return false;

        }


        return (

            npc.position.x ===
            object.position.x

            &&

            npc.position.y ===
            object.position.y

            &&

            npc.position.elevation ===
            object.position.elevation

        );

    }


    //--------------------------------
    // Find output location for map
    //--------------------------------

    findLocationForMap(
        map,
        npcs,
        database
    )
    {

        const normalizedMap =
            this.normalizeMapName(
                map
            );


        //--------------------------------
        // Prefer existing NPC location
        //--------------------------------

        for(
            const location of
                Object.keys(
                    npcs || {}
                )
        )
        {

            const normalizedLocation =
                this.normalizeMapName(
                    location
                );


            if(
                normalizedLocation ===
                normalizedMap
            )
            {

                return location;

            }

        }


        //--------------------------------
        // Fall back to database location
        //--------------------------------

        for(
            const location of
                Object.keys(
                    database || {}
                )
        )
        {

            const normalizedLocation =
                this.normalizeMapName(
                    location
                );


            if(
                normalizedLocation ===
                normalizedMap
            )
            {

                return location;

            }

        }


        //--------------------------------
        // Canonical fallback
        //--------------------------------

        return `MAP_${String(
            map ||
            ""
        ).toUpperCase()}`;

    }


    //--------------------------------
    // Normalize map/location name
    //--------------------------------

    normalizeMapName(
        value
    )
    {

        return String(
            value ||
            ""
        )
        .replace(
            /^MAP_/i,
            ""
        )
        .replace(
            /[^A-Za-z0-9]/g,
            ""
        )
        .toLowerCase();

    }


    //--------------------------------
    // NPC names
    //--------------------------------

    getNPCName(
        npc
    )
    {

        switch(
            npc.graphics
        )
        {

            case "OBJ_EVENT_GFX_BILL":

                return "Bill";


            case "OBJ_EVENT_GFX_NURSE":

                return "Nurse Joy";


            case "OBJ_EVENT_GFX_GYM_GUY":

                return "Gym Guide";


            case "OBJ_EVENT_GFX_MR_FUJI":

                return "Mr. Fuji";


            case "OBJ_EVENT_GFX_AGATHA":

                return "Agatha";


            case "OBJ_EVENT_GFX_BRUNO":

                return "Bruno";


            case "OBJ_EVENT_GFX_LANCE":

                return "Lance";


            case "OBJ_EVENT_GFX_LORELEI":

                return "Lorelei";


            case "OBJ_EVENT_GFX_BLUE":

                return "Blue";


            case "OBJ_EVENT_GFX_PROF_OAK":

                return "Professor Oak";


            default:

                return null;

        }

    }


}


module.exports =
    NPCEventGenerator;
/**
 * Pokémon Companion
 * FireRed Source Gate Extractor
 *
 * Derives physical location-access facts directly from
 * pret/pokefirered source files.
 *
 * This is source-derived data.
 * It is NOT the correction layer.
 *
 * Current derivations:
 * - Victory Road 1F entrance from Route 23 badge guards.
 * - Sevii ferry physical access from Tri Pass / Rainbow Pass flow.
 *
 * Does NOT:
 * - Handle player progression.
 * - Apply project-specific corrections.
 * - Replace world-gates.js.
 */

"use strict";

const fs =
    require("fs");

const path =
    require("path");


class FireRedSourceGateExtractor
{


    //--------------------------------
    // Main extraction
    //--------------------------------

    extract(
        sourcePath
    )
    {

        const gates =
            {};



        this.extractVictoryRoad(

            sourcePath,

            gates

        );



        this.extractSeviiAccess(

            sourcePath,

            gates

        );



        return gates;

    }



    //--------------------------------
    // Victory Road
    //
    // Route 23 contains the badge
    // guards. The first Victory Road
    // warp is the physical entrance.
    //--------------------------------

    extractVictoryRoad(
        sourcePath,
        gates
    )
    {

        const route23MapPath =
            path.join(

                sourcePath,

                "data",

                "maps",

                "Route23",

                "map.json"

            );


        const route23ScriptPath =
            path.join(

                sourcePath,

                "data",

                "scripts",

                "route23.inc"

            );


        const route22EntranceMapPath =
            path.join(

                sourcePath,

                "data",

                "maps",

                "Route22_NorthEntrance",

                "map.json"

            );


        const route22EntranceScriptPath =
            path.join(

                sourcePath,

                "data",

                "maps",

                "Route22_NorthEntrance",

                "scripts.inc"

            );


        if(
            !fs.existsSync(
                route23MapPath
            )
            ||
            !fs.existsSync(
                route23ScriptPath
            )
        )
        {

            console.warn(

                "FireRed source gate extraction: Route 23 source files not found."

            );

            return;

        }


        const route23Map =
            JSON.parse(

                fs.readFileSync(

                    route23MapPath,

                    "utf8"

                )

            );


        const route23Script =
            fs.readFileSync(

                route23ScriptPath,

                "utf8"

            );


        //--------------------------------
        // Find the actual physical entrance
        // from Route 23 into Victory Road 1F.
        //--------------------------------

        const victoryRoadWarp =
            (
                Array.isArray(
                    route23Map.warp_events
                )
                ?
                route23Map.warp_events
                :
                []
            )
            .find(

                warp =>

                    warp
                    &&
                    warp.dest_map ===
                        "MAP_VICTORY_ROAD_1F"

            );


        if(
            !victoryRoadWarp
        )
        {

            console.warn(

                "FireRed source gate extraction: Route 23 has no Victory Road 1F warp."

            );

            return;

        }


        //--------------------------------
        // FireRed's Route 23 badge system
        // uses a shared switch:
        //
        // case 1 -> Boulder
        // case 2 -> Cascade
        // ...
        // case 8 -> Earth
        //
        // Parse the actual switch cases
        // from pret/pokefirered rather than
        // assuming all checks live beside
        // the Victory Road map.
        //--------------------------------

        const badgeNames =
        {

            "1":
                "BOULDER_BADGE",

            "2":
                "CASCADE_BADGE",

            "3":
                "THUNDER_BADGE",

            "4":
                "RAINBOW_BADGE",

            "5":
                "SOUL_BADGE",

            "6":
                "MARSH_BADGE",

            "7":
                "VOLCANO_BADGE",

            "8":
                "EARTH_BADGE"

        };


        const badgeCases =
            {};


        const casePattern =
            /case\s+(\d+),\s+Route23_EventScript_Check([A-Za-z]+Badge)\b/g;


        for(
            const match of
                route23Script.matchAll(
                    casePattern
                )
        )
        {

            const number =
                match[1];


            if(
                !badgeNames[number]
            )
            {

                continue;

            }


            if(
                badgeCases[number]
            )
            {

                continue;

            }


            badgeCases[number] =
            {

                badge:
                    badgeNames[number],

                script:
                    match[2],

                flag:
                    `FLAG_BADGE${String(number).padStart(2, "0")}_GET`

            };

        }


        //--------------------------------
        // The shared switch is the canonical
        // source for the eight badge sequence.
        //--------------------------------

        const badgeNumbers =
            Object.keys(
                badgeCases
            )
            .sort(

                (a, b) =>
                    Number(a)
                    -
                    Number(b)

            );


        if(
            badgeNumbers.length !==
                8
        )
        {

            console.warn(

                `FireRed source gate extraction: expected 8 Route 23 badge cases, found ${badgeNumbers.length}.`

            );

            return;

        }


        const badges =
            badgeNumbers.map(

                number =>
                    badgeCases[number].badge

            );


        //--------------------------------
        // Verify the actual badge-1 entrance
        // guard as additional source evidence.
        //--------------------------------

        let boulderEntrance =
            null;


        if(
            fs.existsSync(
                route22EntranceMapPath
            )
            &&
            fs.existsSync(
                route22EntranceScriptPath
            )
        )
        {

            const route22Map =
                JSON.parse(

                    fs.readFileSync(

                        route22EntranceMapPath,

                        "utf8"

                    )

                );


            const route22Script =
                fs.readFileSync(

                    route22EntranceScriptPath,

                    "utf8"

                );


            const boulderGuard =
                (
                    Array.isArray(
                        route22Map.object_events
                    )
                    ?
                    route22Map.object_events
                    :
                    []
                )
                .find(

                    object =>

                        object
                        &&
                        String(
                            object.script
                            ||
                            ""
                        ).includes(
                            "BoulderBadgeGuard"
                        )

                );


            if(
                boulderGuard
            )
            {

                boulderEntrance =
                {

                    map:
                        "MAP_ROUTE22_NORTH_ENTRANCE",

                    script:
                        boulderGuard.script,

                    varValue:
                        route22Script.includes(
                            "setvar VAR_TEMP_1, 1"
                        )
                            ?
                            1
                            :
                            null

                };

            }

        }


        //--------------------------------
        // Create source-derived gate.
        //--------------------------------

        this.addGate(

            gates,

            "MAP_VICTORY_ROAD_1F",

            {

                id:
                    "VICTORY_ROAD_ACCESS",

                type:
                    "HARD_GATE",

                scope:
                    "PHYSICAL_ACCESS",

                requirement:
                {

                    badges

                },

                source:
                {

                    type:
                        "PRET_POKEFIRERED",

                    repository:
                        "pret/pokefirered",

                    files:
                    [

                        "data/scripts/route23.inc",

                        "data/maps/Route23/map.json",

                        "data/maps/Route22_NorthEntrance/scripts.inc",

                        "data/maps/Route22_NorthEntrance/map.json"

                    ],

                    evidence:
                    {

                        route23BadgeCases:
                            badgeCases,

                        route23VictoryRoadWarp:
                        {

                            x:
                                victoryRoadWarp.x
                                ??
                                null,

                            y:
                                victoryRoadWarp.y
                                ??
                                null,

                            elevation:
                                victoryRoadWarp.elevation
                                ??
                                null,

                            destination:
                                victoryRoadWarp.dest_map,

                            destinationWarp:
                                victoryRoadWarp.dest_warp_id
                                ??
                                null

                        },

                        boulderEntrance

                    }

                }

            }

        );

    }



    //--------------------------------
    // Sevii physical access
    //--------------------------------

    extractSeviiAccess(
        sourcePath,
        gates
    )
    {

        const vermilionPath =
            path.join(

                sourcePath,

                "data",

                "maps",

                "VermilionCity",

                "scripts.inc"

            );


        const seagallopPath =
            path.join(

                sourcePath,

                "data",

                "scripts",

                "seagallop.inc"

            );


        const oneIslandPath =
            path.join(

                sourcePath,

                "data",

                "maps",

                "OneIsland_PokemonCenter_1F",

                "scripts.inc"

            );


        if(
            !fs.existsSync(
                vermilionPath
            )
            ||
            !fs.existsSync(
                seagallopPath
            )
            ||
            !fs.existsSync(
                oneIslandPath
            )
        )
        {

            console.warn(

                "FireRed source gate extraction: Sevii ferry source files not found."

            );

            return;

        }



        const vermilion =
            fs.readFileSync(

                vermilionPath,

                "utf8"

            );


        const seagallop =
            fs.readFileSync(

                seagallopPath,

                "utf8"

            );


        const oneIsland =
            fs.readFileSync(

                oneIslandPath,

                "utf8"

            );



        //--------------------------------
        // Verify the Tri Pass flow.
        //--------------------------------

        const hasTriPassFlow =
            vermilion.includes(
                "VermilionCity_EventScript_ChooseSeagallopDestTriPass"
            )
            &&
            vermilion.includes(
                "EventScript_SailToTwoIsland2"
            )
            &&
            vermilion.includes(
                "EventScript_SailToThreeIsland2"
            )
            &&
            seagallop.includes(
                "EventScript_SailToTwoIsland2"
            )
            &&
            seagallop.includes(
                "EventScript_SailToThreeIsland2"
            );



        //--------------------------------
        // Verify the Rainbow Pass flow.
        //--------------------------------

        const hasRainbowPassFlow =
            vermilion.includes(
                "VermilionCity_EventScript_ChooseSeagallopDestRainbowPass"
            )
            &&
            vermilion.includes(
                "EventScript_SeviiDestinationsPage1"
            )
            &&
            seagallop.includes(
                "EventScript_SeviiDestinationsPage1"
            )
            &&
            seagallop.includes(
                "EventScript_SeviiDestinationsPage2"
            )
            &&
            seagallop.includes(
                "EventScript_SailToFourIsland"
            )
            &&
            seagallop.includes(
                "EventScript_SailToFiveIsland"
            )
            &&
            seagallop.includes(
                "EventScript_SailToSixIsland"
            )
            &&
            seagallop.includes(
                "EventScript_SailToSevenIsland"
            );



        //--------------------------------
        // Verify the actual Tri -> Rainbow
        // progression transition.
        //--------------------------------

        const rainbowGrant =
            oneIsland.includes(
                "removeitem ITEM_TRI_PASS"
            )
            &&
            oneIsland.includes(
                "additem ITEM_RAINBOW_PASS"
            )
            &&
            oneIsland.includes(
                "setvar VAR_MAP_SCENE_ONE_ISLAND_POKEMON_CENTER_1F, 5"
            );



        if(
            !hasTriPassFlow
        )
        {

            console.warn(

                "FireRed source gate extraction: Tri Pass ferry flow could not be verified."

            );

        }



        if(
            !hasRainbowPassFlow
        )
        {

            console.warn(

                "FireRed source gate extraction: Rainbow Pass ferry flow could not be verified."

            );

        }



        if(
            !rainbowGrant
        )
        {

            console.warn(

                "FireRed source gate extraction: Tri Pass -> Rainbow Pass transition could not be verified."

            );

        }



        //--------------------------------
        // Two Island
        //--------------------------------

        if(
            hasTriPassFlow
        )
        {

            this.addGate(

                gates,

                "MAP_TWO_ISLAND",

                {

                    id:
                        "TWO_ISLAND_ACCESS",

                    type:
                        "HARD_GATE",

                    scope:
                        "PHYSICAL_ACCESS",

                    accessRoot:
                        true,

                    requirement:
                    {

                        anyOf:
                        [

                            {
                                keyItems:
                                [
                                    "TRI_PASS"
                                ]
                            },

                            {
                                keyItems:
                                [
                                    "RAINBOW_PASS"
                                ]
                            }

                        ]

                    },

                    source:
                    {

                        type:
                            "PRET_POKEFIRERED",

                        repository:
                            "pret/pokefirered",

                        files:
                        [

                            "data/maps/VermilionCity/scripts.inc",

                            "data/scripts/seagallop.inc"

                        ],

                        evidence:
                        {

                            preRainbowDestination:
                                "EventScript_SailToTwoIsland2",

                            rainbowDestination:
                                "EventScript_SailToTwoIsland"

                        }

                    }

                }

            );

        }



        //--------------------------------
        // Three Island
        //--------------------------------

        if(
            hasTriPassFlow
        )
        {

            this.addGate(

                gates,

                "MAP_THREE_ISLAND",

                {

                    id:
                        "THREE_ISLAND_ACCESS",

                    type:
                        "HARD_GATE",

                    scope:
                        "PHYSICAL_ACCESS",

                    accessRoot:
                        true,

                    requirement:
                    {

                        anyOf:
                        [

                            {
                                keyItems:
                                [
                                    "TRI_PASS"
                                ]
                            },

                            {
                                keyItems:
                                [
                                    "RAINBOW_PASS"
                                ]
                            }

                        ]

                    },

                    source:
                    {

                        type:
                            "PRET_POKEFIRERED",

                        repository:
                            "pret/pokefirered",

                        files:
                        [

                            "data/maps/VermilionCity/scripts.inc",

                            "data/scripts/seagallop.inc"

                        ],

                        evidence:
                        {

                            preRainbowDestination:
                                "EventScript_SailToThreeIsland2",

                            rainbowDestination:
                                "EventScript_SailToThreeIsland"

                        }

                    }

                }

            );

        }



        //--------------------------------
        // Four through Seven Island
        //--------------------------------
        //
        // The source unlocks the full
        // Sevii destination menu after
        // the Rainbow Pass transition.
        //
        // These are physical-access facts.
        // Project-specific story restrictions
        // remain a separate correction layer.
        //--------------------------------

        if(
            hasRainbowPassFlow
            &&
            rainbowGrant
        )
        {

            const islands =
            [

                {
                    id:
                        "MAP_FOUR_ISLAND",

                    gateId:
                        "FOUR_ISLAND_ACCESS",

                    destination:
                        "EventScript_SailToFourIsland"

                },

                {
                    id:
                        "MAP_FIVE_ISLAND",

                    gateId:
                        "FIVE_ISLAND_ACCESS",

                    destination:
                        "EventScript_SailToFiveIsland"

                },

                {
                    id:
                        "MAP_SIX_ISLAND",

                    gateId:
                        "SIX_ISLAND_PHYSICAL_ACCESS",

                    destination:
                        "EventScript_SailToSixIsland"

                },

                {
                    id:
                        "MAP_SEVEN_ISLAND",

                    gateId:
                        "SEVEN_ISLAND_PHYSICAL_ACCESS",

                    destination:
                        "EventScript_SailToSevenIsland"

                }

            ];



            for(
                const island of
                    islands
            )
            {

                this.addGate(

                    gates,

                    island.id,

                    {

                        id:
                            island.gateId,

                        type:
                            "HARD_GATE",

                        scope:
                            "PHYSICAL_ACCESS",

                        accessRoot:
                            true,

                        requirement:
                        {

                            keyItems:
                            [
                                "RAINBOW_PASS"
                            ]

                        },

                        source:
                        {

                            type:
                                "PRET_POKEFIRERED",

                            repository:
                                "pret/pokefirered",

                            files:
                            [

                                "data/maps/VermilionCity/scripts.inc",

                                "data/scripts/seagallop.inc",

                                "data/maps/OneIsland_PokemonCenter_1F/scripts.inc"

                            ],

                            evidence:
                            {

                                rainbowState:
                                    "VAR_MAP_SCENE_ONE_ISLAND_POKEMON_CENTER_1F >= 5",

                                destination:
                                    island.destination

                            }

                        }

                    }

                );

            }

        }

    }



    //--------------------------------
    // Add gate
    //--------------------------------

    addGate(
        gates,
        location,
        gate
    )
    {

        if(
            !location
            ||
            !gate
        )
        {

            return;

        }


        if(
            !gates[location]
        )
        {

            gates[location] =
            {

                id:
                    location,

                soft:
                    [],

                hard:
                    []

            };

        }


        const target =
            String(
                gate.type
            ).toUpperCase() ===
                "SOFT_GATE"
            ?
            gates[location].soft
            :
            gates[location].hard;


        const duplicate =
            target.some(

                existing =>

                    existing
                    &&
                    existing.id ===
                        gate.id

            );


        if(
            duplicate
        )
        {

            return;

        }


        target.push(
            gate

        );

    }

}


module.exports =
    FireRedSourceGateExtractor;

/**
 * Pokémon Companion
 * Progression Stage State Builder
 *
 * Builds the cumulative player state
 * represented by each progression stage.
 *
 * Responsibilities:
 * - Build one stage state.
 * - Build cumulative stage states.
 * - Add stage badges.
 * - Add stage abilities.
 * - Add stage key items.
 * - Add stage story flags.
 * - Provide stage level limits.
 *
 * Does NOT:
 * - Evaluate requirements.
 * - Traverse locations.
 * - Define world gates.
 * - Calculate Pokémon availability.
 */

"use strict";


class ProgressionStageStateBuilder
{


    constructor(
        stages = []
    )
    {

        this.stages =
            Array.isArray(stages)
                ?
                stages
                :
                [];

        this.stageStates =
            null;

    }





    //--------------------------------
    // Get maximum reasonable level
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
    // Build cumulative stage states
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


        const stageIndex =
            this.stages.indexOf(
                stage
            );


        //--------------------------------
        // Badges
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
        // Pokédex progression
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
        // Flash
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


        //--------------------------------
        // Cut
        //--------------------------------

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


        //--------------------------------
        // Fly
        //--------------------------------

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


        //--------------------------------
        // Surf
        //--------------------------------

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


        //--------------------------------
        // Strength
        //--------------------------------

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
        // Tea
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
        // Silph Co.
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
    // Add unique value
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
    ProgressionStageStateBuilder;
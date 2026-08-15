/**
 * Pokémon Companion
 * Event Requirement Extractor
 *
 * Extracts event requirements and conditions.
 *
 * Detects:
 * - Required story flags
 * - Excluded story flags
 * - Required items
 * - Required badges
 */

"use strict";


class EventRequirementExtractor {



    extract(
        scriptBody
    )
    {


        const requirements =
        {

            storyFlags: [],

            items: [],

            badges: []

        };



        const conditions =
        {

            requireStoryFlags: [],

            excludeStoryFlags: []

        };





        //--------------------------------
        // Flag must exist
        //--------------------------------


        for(
            const match of scriptBody.matchAll(
                /goto_if_set\s+FLAG_([A-Z0-9_]+)/g
            )
        )
        {


            conditions.excludeStoryFlags.push(
                match[1]
            );


        }





        //--------------------------------
        // Flag must NOT exist
        //--------------------------------


        for(
            const match of scriptBody.matchAll(
                /goto_if_unset\s+FLAG_([A-Z0-9_]+)/g
            )
        )
        {


            requirements.storyFlags.push(
                match[1]
            );


        }





        //--------------------------------
        // Required items
        //--------------------------------


        for(
            const match of scriptBody.matchAll(
                /checkitem\s+ITEM_([A-Z0-9_]+)/g
            )
        )
        {


            requirements.items.push(
                match[1]
            );


        }





        //--------------------------------
        // Badge checks
        //--------------------------------


        for(
            const match of scriptBody.matchAll(
                /checkbadge\s+BADGE_([A-Z0-9_]+)/g
            )
        )
        {


            requirements.badges.push(
                match[1]
            );


        }





        return {

            requirements,

            conditions

        };


    }


}



module.exports =
EventRequirementExtractor;
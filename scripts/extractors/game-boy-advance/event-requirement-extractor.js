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
 *
 * Does NOT:
 * - Execute scripts.
 * - Determine final progression stage.
 * - Resolve player state.
 */

"use strict";


class EventRequirementExtractor
{


    extract(
        scriptBody
    )
    {

        const requirements =
        {

            storyFlags:
                [],

            items:
                [],

            badges:
                []

        };


        const conditions =
        {

            requireStoryFlags:
                [],

            excludeStoryFlags:
                []

        };


        //--------------------------------
        // Flag must exist
        //--------------------------------

        for(
            const match of
                scriptBody.matchAll(

                    /goto_if_set\s+FLAG_([A-Z0-9_]+)/g

                )
        )
        {

            const flag =
                match[1];


            if(
                !conditions.excludeStoryFlags.includes(
                    flag
                )
            )
            {

                conditions.excludeStoryFlags.push(
                    flag
                );

            }

        }


        //--------------------------------
        // Flag must NOT exist
        //--------------------------------

        for(
            const match of
                scriptBody.matchAll(

                    /goto_if_unset\s+FLAG_([A-Z0-9_]+)/g

                )
        )
        {

            const flag =
                match[1];


            if(
                !requirements.storyFlags.includes(
                    flag
                )
            )
            {

                requirements.storyFlags.push(
                    flag
                );

            }


            if(
                !conditions.requireStoryFlags.includes(
                    flag
                )
            )
            {

                conditions.requireStoryFlags.push(
                    flag
                );

            }

        }


        //--------------------------------
        // Required items
        //--------------------------------

        for(
            const match of
                scriptBody.matchAll(

                    /checkitem\s+ITEM_([A-Z0-9_]+)/g

                )
        )
        {

            const item =
                match[1];


            if(
                !requirements.items.includes(
                    item
                )
            )
            {

                requirements.items.push(
                    item
                );

            }

        }


        //--------------------------------
        // Badge checks
        //--------------------------------

        for(
            const match of
                scriptBody.matchAll(

                    /checkbadge\s+BADGE_([A-Z0-9_]+)/g

                )
        )
        {

            const badge =
                match[1];


            if(
                !requirements.badges.includes(
                    badge
                )
            )
            {

                requirements.badges.push(
                    badge
                );

            }

        }


        //--------------------------------
        // Normalize empty arrays
        //--------------------------------

        requirements.storyFlags =
            [
                ...new Set(
                    requirements.storyFlags
                )
            ];


        requirements.items =
            [
                ...new Set(
                    requirements.items
                )
            ];


        requirements.badges =
            [
                ...new Set(
                    requirements.badges
                )
            ];


        conditions.requireStoryFlags =
            [
                ...new Set(
                    conditions.requireStoryFlags
                )
            ];


        conditions.excludeStoryFlags =
            [
                ...new Set(
                    conditions.excludeStoryFlags
                )
            ];


        return {

            requirements,

            conditions

        };

    }


}


module.exports =
    EventRequirementExtractor;
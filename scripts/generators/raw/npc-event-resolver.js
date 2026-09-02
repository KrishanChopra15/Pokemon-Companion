/**
 * Pokémon Companion
 * NPC Event Resolver
 *
 * Resolves the static event-script graph reachable from an NPC event.
 *
 * Responsibilities:
 * - Follow script calls.
 * - Follow script jumps.
 * - Prevent cycles.
 *
 * Does NOT:
 * - Execute event logic.
 * - Evaluate runtime conditions.
 * - Classify NPCs.
 * - Resolve trainers.
 * - Extract rewards.
 */

"use strict";


class NPCEventResolver
{


    //--------------------------------
    // Resolve event graph
    //--------------------------------

    resolve(
        rootEventId,
        events
    )
    {

        const resolvedEvents =
            [];


        const visited =
            new Set();


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


                resolvedEvents.push(
                    event
                );


                //--------------------------------
                // Follow calls
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
                // Follow jumps
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
            rootEventId
        );


        return {

            events:
                resolvedEvents

        };

    }


}


module.exports =
    NPCEventResolver;
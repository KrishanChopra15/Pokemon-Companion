/**
 * Pokémon Companion
 * Battle Faint Service
 *
 * Handles Pokémon fainting and switching.
 *
 * Responsibilities:
 * - Detect fainted Pokémon.
 * - Create faint events.
 * - Apply friendship loss from fainting.
 * - Synchronize persistent friendship state.
 * - Request automatic switching.
 *
 * Does NOT:
 * - Calculate damage.
 * - Execute moves.
 * - Manage battle state.
 * - Calculate friendship rules.
 */

"use strict";





class BattleFaintService {



    constructor(
        pokemonService,
        pokemonSwitchService,
        friendshipService = null
    )
    {


        this.pokemon =
            pokemonService;


        this.switches =
            pokemonSwitchService;


        this.friendship =
            friendshipService;


    }









    //--------------------------------
    // Handle faint
    //--------------------------------


    handleFaint(
        side,
        result
    )
    {


        const pokemon =

            this.pokemon.getActivePokemon(

                side

            );





        if(
            !pokemon
            ||
            pokemon.hp > 0
        )
        {

            return false;

        }









        //--------------------------------
        // Add faint event
        //--------------------------------


        const exists =

            result.actions.some(

                action =>

                    action.type ===
                    "FAINT"

                    &&

                    action.pokemon ===
                    pokemon.species

            );





        if(
            !exists
        )
        {

            result.actions.push(

                {

                    type:
                        "FAINT",


                    pokemon:
                        pokemon.species

                }

            );

        }









        //--------------------------------
        // Apply friendship loss
        //
        // Only player-owned Pokémon
        // should receive the fainting
        // friendship penalty.
        //--------------------------------


        let friendshipResult =
            null;


        if(
            this.isPlayerSide(
                side
            )
        )
        {

            if(
                this.friendship
                &&
                typeof this.friendship.applyFainting ===
                    "function"
            )
            {

                const opponentLevel =
                    this.getOpponentLevel(
                        side
                    );


                friendshipResult =
                    this.friendship.applyFainting(

                        pokemon,

                        {

                            pokemonLevel:
                                pokemon.level,

                            opponentLevel

                        }

                    );


                //--------------------------------
                // Synchronize friendship to the
                // authoritative Pokémon object.
                //--------------------------------

                const synchronization =
                    this.syncFriendshipState(

                        pokemon

                    );


                //--------------------------------
                // Keep friendship result attached
                // to the battle event.
                //--------------------------------

                result.actions.push(

                    {

                        type:
                            "FRIENDSHIP_CHANGE",


                        pokemon:
                            pokemon.species,


                        event:
                            "FAINT",


                        friendship:
                            friendshipResult.friendship,


                        change:
                            friendshipResult.change,


                        synchronization:
                            synchronization

                    }

                );

            }

        }









        //--------------------------------
        // Try automatic switch
        //--------------------------------


        if(
            this.switches
        )
        {


            const switched =

                this.switches.autoSwitch(

                    side

                );





            if(
                switched
                &&
                switched.success
            )
            {


                side.active =

                    switched.index;





                result.actions.push(

                    {

                        type:
                            "SWITCH",


                        pokemon:
                            switched.pokemon.species

                    }

                );





                return true;

            }


        }









        return false;


    }









    //--------------------------------
    // Synchronize friendship
    //--------------------------------


    syncFriendshipState(
        pokemon
    )
    {

        if(
            !pokemon
        )
        {

            return {

                success:
                    false,

                synchronized:
                    false,

                reason:
                    "Missing Pokemon"

            };

        }


        //--------------------------------
        // Battle runtime Pokémon keeps
        // a reference to the authoritative
        // Pokémon through sourcePokemon.
        //--------------------------------

        if(
            !pokemon.sourcePokemon
        )
        {

            return {

                success:
                    true,

                synchronized:
                    false,

                reason:
                    "Source Pokemon unavailable",

                pokemon

            };

        }


        const source =
            pokemon.sourcePokemon;


        source.friendship =
            pokemon.friendship;


        //--------------------------------
        // Return the authoritative object
        //--------------------------------

        return {

            success:
                true,

            synchronized:
                true,

            friendship:
                source.friendship,

            pokemon:
                source

        };

    }









    //--------------------------------
    // Determine player side
    //--------------------------------


    isPlayerSide(
        side
    )
    {

        if(
            !side
        )
        {

            return false;

        }


        //--------------------------------
        // Common side identifiers
        //--------------------------------

        if(
            side.name
            &&
            String(
                side.name
            )
            .toUpperCase()
            ===
            "PLAYER"
        )
        {

            return true;

        }


        if(
            side.id
            &&
            String(
                side.id
            )
            .toUpperCase()
            ===
            "PLAYER"
        )
        {

            return true;

        }


        if(
            side.type
            &&
            String(
                side.type
            )
            .toUpperCase()
            ===
            "PLAYER"
        )
        {

            return true;

        }


        //--------------------------------
        // Some battle systems attach the
        // player flag directly.
        //--------------------------------

        if(
            side.player ===
                true
        )
        {

            return true;

        }


        return false;

    }









    //--------------------------------
    // Get opponent level
    //--------------------------------


    getOpponentLevel(
        side
    )
    {

        if(
            !side
        )
        {

            return null;

        }


        //--------------------------------
        // Direct opponent reference
        //--------------------------------

        if(
            side.opponentPokemon
        )
        {

            const level =
                Number(
                    side.opponentPokemon.level
                );


            if(
                Number.isFinite(
                    level
                )
            )
            {

                return level;

            }

        }


        //--------------------------------
        // Battle opponent reference
        //--------------------------------

        if(
            side.opponent
        )
        {

            const opponent =
                side.opponent;


            if(
                opponent.activePokemon
            )
            {

                const level =
                    Number(
                        opponent.activePokemon.level
                    );


                if(
                    Number.isFinite(
                        level
                    )
                )
                {

                    return level;

                }

            }


            if(
                opponent.party
                &&
                Number.isInteger(
                    opponent.active
                )
                &&
                opponent.party[
                    opponent.active
                ]
            )
            {

                const level =
                    Number(
                        opponent.party[
                            opponent.active
                        ].level
                    );


                if(
                    Number.isFinite(
                        level
                    )
                )
                {

                    return level;

                }

            }

        }


        //--------------------------------
        // Side may expose the opponent
        // party directly.
        //--------------------------------

        if(
            side.opponentParty
            &&
            Number.isInteger(
                side.opponentActive
            )
            &&
            side.opponentParty[
                side.opponentActive
            ]
        )
        {

            const level =
                Number(
                    side.opponentParty[
                        side.opponentActive
                    ].level
                );


            if(
                Number.isFinite(
                    level
                )
            )
            {

                return level;

            }

        }


        return null;

    }



}





module.exports =
    BattleFaintService;
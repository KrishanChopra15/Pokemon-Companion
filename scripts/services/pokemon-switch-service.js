/**
 * Pokémon Companion
 * Pokémon Switch Service
 *
 * Handles Pokémon switching during battles.
 *
 * Responsibilities:
 * - Check available Pokémon.
 * - Detect fainted Pokémon.
 * - Validate switch choices.
 * - Change active Pokémon.
 *
 * Does NOT:
 * - Execute battles.
 * - Handle moves.
 * - Calculate damage.
 * - Manage trainer AI.
 * - Give rewards.
 */

"use strict";


class PokemonSwitchService {


    //--------------------------------
    // Get available Pokémon
    //--------------------------------

    getAvailablePokemon(
        side
    )
    {

        if(
            !side ||
            !Array.isArray(
                side.party
            )
        )
        {

            return [];

        }


        return side.party
            .map(

                (pokemon, index) =>

                ({

                    index,

                    pokemon

                })

            )
            .filter(

                entry =>

                    entry.pokemon &&
                    entry.pokemon.hp > 0

            );

    }


    //--------------------------------
    // Check switch possible
    //--------------------------------

    canSwitch(
        side,
        index
    )
    {

        if(
            !side ||
            !Array.isArray(
                side.party
            )
        )
        {

            return {

                allowed:false,

                reason:
                    "Invalid party"

            };

        }


        const pokemon =
            side.party[index];


        if(
            !pokemon
        )
        {

            return {

                allowed:false,

                reason:
                    "Invalid Pokémon"

            };

        }


        if(
            pokemon.hp <= 0
        )
        {

            return {

                allowed:false,

                reason:
                    "Pokémon fainted"

            };

        }


        if(
            side.active === index
        )
        {

            return {

                allowed:false,

                reason:
                    "Already active"

            };

        }


        return {

            allowed:true

        };

    }


    //--------------------------------
    // Switch Pokémon
    //--------------------------------

    switchPokemon(
        side,
        index
    )
    {

        const check =
            this.canSwitch(
                side,
                index
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


        const previous =
            side.active;


        side.active =
            index;


        return {

            success:true,

            previous,

            current:
                index,

            pokemon:
                side.party[index]

        };

    }


    //--------------------------------
    // Check if forced switch needed
    //--------------------------------

    needsSwitch(
        side
    )
    {

        if(
            !side ||
            !Array.isArray(
                side.party
            )
        )
        {

            return true;

        }


        const activeIndex =
            side.active || 0;


        const active =
            side.party[
                activeIndex
            ];


        if(
            !active
        )
        {

            return true;

        }


        return active.hp <= 0;

    }


    //--------------------------------
    // Get next available Pokémon
    //--------------------------------

    getNextAvailable(
        side
    )
    {

        const available =
            this.getAvailablePokemon(
                side
            );


        return available.find(

            entry =>

                entry.index !== side.active

        )

        ||

        null;

    }


    //--------------------------------
    // Auto switch
    //--------------------------------

    autoSwitch(
        side
    )
    {

        const next =
            this.getNextAvailable(
                side
            );


        if(
            !next
        )
        {

            return {

                success:false,

                reason:
                    "No available Pokémon"

            };

        }


        const previous =
            side.active;


        side.active =
            next.index;


        return {

            success:true,

            previous,

            index:
                next.index,

            pokemon:
                next.pokemon

        };

    }


}


module.exports =
    PokemonSwitchService;
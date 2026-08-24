/**
 * Pokémon Companion
 * Battle Faint Service
 *
 * Handles Pokémon fainting and switching.
 *
 * Responsibilities:
 * - Detect fainted Pokémon.
 * - Create faint events.
 * - Request automatic switching.
 *
 * Does NOT:
 * - Calculate damage.
 * - Execute moves.
 * - Manage battle state.
 */

"use strict";





class BattleFaintService {



    constructor(
        pokemonService,
        pokemonSwitchService
    )
    {


        this.pokemon =
            pokemonService;


        this.switches =
            pokemonSwitchService;


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


}





module.exports =
    BattleFaintService;
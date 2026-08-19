/**
 * Pokémon Companion
 * Battle Active Manager
 *
 * Manages the Pokémon currently active in battle.
 *
 * Responsibilities:
 * - Set active Pokémon.
 * - Track battle HP.
 * - Track faint state.
 * - Clear active Pokémon.
 *
 * Does NOT:
 * - Execute moves.
 * - Calculate damage.
 * - Handle switching rules.
 */

"use strict";





class BattleActiveManager {



    constructor()
    {

        this.active = null;

    }









    //--------------------------------
    // Set active Pokémon
    //--------------------------------


    setActive(
        pokemon
    )
    {


        if(
            !pokemon ||
            !pokemon.species
        )
        {

            return {

                success:false,

                reason:
                    "Invalid Pokemon"

            };

        }







        this.active =
        {

            species:
                pokemon.species,


            level:
                pokemon.level || 1,


            hp:
                pokemon.hp || 100,


            maxHp:
                pokemon.hp || 100,


            fainted:false


        };








        return {

            success:true,

            pokemon:
                this.active

        };


    }









    //--------------------------------
    // Get active Pokémon
    //--------------------------------


    getActive()
    {

        return this.active;

    }









    //--------------------------------
    // Damage active Pokémon
    //--------------------------------


    takeDamage(
        amount
    )
    {


        if(
            !this.active
        )
        {

            return {

                success:false,

                reason:
                    "No active Pokemon"

            };

        }







        this.active.hp -= amount;



        if(
            this.active.hp <= 0
        )
        {

            this.active.hp = 0;

            this.active.fainted = true;

        }







        return {

            success:true,

            pokemon:
                this.active

        };


    }









    //--------------------------------
    // Heal active Pokémon
    //--------------------------------


    heal(
        amount
    )
    {


        if(
            !this.active
        )
        {

            return {

                success:false,

                reason:
                    "No active Pokemon"

            };

        }







        this.active.hp += amount;



        if(
            this.active.hp >
            this.active.maxHp
        )
        {

            this.active.hp =
                this.active.maxHp;

        }







        return {

            success:true,

            pokemon:
                this.active

        };


    }









    //--------------------------------
    // Clear active Pokémon
    //--------------------------------


    clear()
    {

        this.active = null;


        return {

            success:true

        };

    }









    //--------------------------------
    // Status
    //--------------------------------


    getStatus()
    {


        return {


            hasActive:

                !!this.active,


            active:

                this.active


        };


    }



}





module.exports =
    BattleActiveManager;
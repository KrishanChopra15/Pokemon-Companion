/**
 * Pokémon Companion
 * Battle Opponent Manager
 *
 * Manages enemy Pokémon currently in battle.
 *
 * Responsibilities:
 * - Set opponent Pokémon.
 * - Track enemy HP.
 * - Track faint state.
 * - Clear opponent Pokémon.
 *
 * Does NOT:
 * - Execute moves.
 * - Calculate damage.
 * - Handle AI.
 */

"use strict";





class BattleOpponentManager {



    constructor()
    {

        this.opponent = null;

    }









    //--------------------------------
    // Set opponent Pokémon
    //--------------------------------


    setOpponent(
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







        this.opponent =
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
                this.opponent

        };


    }









    //--------------------------------
    // Get opponent
    //--------------------------------


    getOpponent()
    {

        return this.opponent;

    }









    //--------------------------------
    // Damage opponent
    //--------------------------------


    takeDamage(
        amount
    )
    {


        if(
            !this.opponent
        )
        {

            return {

                success:false,

                reason:
                    "No opponent Pokemon"

            };

        }







        this.opponent.hp -= amount;



        if(
            this.opponent.hp <= 0
        )
        {

            this.opponent.hp = 0;

            this.opponent.fainted = true;

        }







        return {

            success:true,

            pokemon:
                this.opponent

        };


    }









    //--------------------------------
    // Heal opponent
    //--------------------------------


    heal(
        amount
    )
    {


        if(
            !this.opponent
        )
        {

            return {

                success:false,

                reason:
                    "No opponent Pokemon"

            };

        }







        this.opponent.hp += amount;



        if(
            this.opponent.hp >
            this.opponent.maxHp
        )
        {

            this.opponent.hp =
                this.opponent.maxHp;

        }







        return {

            success:true,

            pokemon:
                this.opponent

        };


    }









    //--------------------------------
    // Clear opponent
    //--------------------------------


    clear()
    {

        this.opponent = null;


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


            hasOpponent:

                !!this.opponent,


            opponent:

                this.opponent


        };


    }



}





module.exports =
    BattleOpponentManager;
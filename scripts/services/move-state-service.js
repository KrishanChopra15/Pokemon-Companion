/**
 * Pokémon Companion
 * Move State Service
 *
 * Handles multi-turn move states.
 *
 * Responsibilities:
 * - Track Rollout turns.
 * - Track Fury Cutter stages.
 * - Track Rage state.
 * - Track Bide storage.
 * - Reset move states.
 *
 * Does NOT:
 * - Calculate damage.
 * - Execute moves.
 * - Apply move effects.
 */

"use strict";





class MoveStateService {



    constructor()
    {


        this.states =
            new Map();


    }









    //--------------------------------
    // Create Pokémon state
    //--------------------------------


    initialize(
        pokemon
    )
    {


        const id =
            this.getId(
                pokemon
            );



        if(
            !this.states.has(id)
        )
        {

            this.states.set(

                id,

                {

                    rollout:null,

                    furyCutter:null,

                    rage:false,

                    bide:null

                }

            );

        }



        return this.states.get(id);


    }









    //--------------------------------
    // Generate ID
    //--------------------------------


    getId(
        pokemon
    )
    {


        return (

            pokemon.id

            ||

            pokemon.species

        );


    }









    //--------------------------------
    // Rollout
    //--------------------------------


    startRollout(
        pokemon
    )
    {


        const state =
            this.initialize(
                pokemon
            );



        state.rollout =
        {

            turn:1,

            power:30

        };



        return state.rollout;


    }









    continueRollout(
        pokemon
    )
    {


        const state =
            this.initialize(
                pokemon
            );



        if(
            !state.rollout
        )
        {

            return this.startRollout(
                pokemon
            );

        }





        state.rollout.turn++;





        state.rollout.power *= 2;





        return state.rollout;


    }









    getRollout(
        pokemon
    )
    {


        const state =
            this.initialize(
                pokemon
            );


        return state.rollout;


    }









    resetRollout(
        pokemon
    )
    {


        const state =
            this.initialize(
                pokemon
            );


        state.rollout =
            null;


        return {

            success:true

        };


    }









    //--------------------------------
    // Fury Cutter
    //--------------------------------


    startFuryCutter(
        pokemon
    )
    {


        const state =
            this.initialize(
                pokemon
            );


        state.furyCutter =
        {

            stage:1,

            power:10

        };


        return state.furyCutter;


    }









    continueFuryCutter(
        pokemon
    )
    {


        const state =
            this.initialize(
                pokemon
            );



        if(
            !state.furyCutter
        )
        {

            return this.startFuryCutter(
                pokemon
            );

        }





        state.furyCutter.stage++;




        state.furyCutter.power *= 2;





        if(
            state.furyCutter.power > 160
        )
        {

            state.furyCutter.power = 160;

        }





        return state.furyCutter;


    }









    resetFuryCutter(
        pokemon
    )
    {


        const state =
            this.initialize(
                pokemon
            );


        state.furyCutter =
            null;


        return {

            success:true

        };


    }









    //--------------------------------
    // Rage
    //--------------------------------


    activateRage(
        pokemon
    )
    {


        const state =
            this.initialize(
                pokemon
            );


        state.rage =
            true;



        return {

            success:true

        };


    }









    isRageActive(
        pokemon
    )
    {


        const state =
            this.initialize(
                pokemon
            );


        return state.rage;


    }









    resetRage(
        pokemon
    )
    {


        const state =
            this.initialize(
                pokemon
            );


        state.rage =
            false;



        return {

            success:true

        };


    }









    //--------------------------------
    // Bide
    //--------------------------------


    startBide(
        pokemon
    )
    {


        const state =
            this.initialize(
                pokemon
            );



        state.bide =
        {

            turns:0,

            damage:0

        };



        return state.bide;


    }









    storeBideDamage(
        pokemon,
        damage
    )
    {


        const state =
            this.initialize(
                pokemon
            );



        if(
            !state.bide
        )
        {

            this.startBide(
                pokemon
            );

        }



        state.bide.damage += damage;



        return state.bide.damage;


    }









    continueBide(
        pokemon
    )
    {


        const state =
            this.initialize(
                pokemon
            );



        if(
            state.bide
        )
        {

            state.bide.turns++;

        }



        return state.bide;


    }









    releaseBide(
        pokemon
    )
    {


        const state =
            this.initialize(
                pokemon
            );



        const damage =
            state.bide
            ?
            state.bide.damage * 2
            :
            0;



        state.bide =
            null;



        return damage;


    }









    //--------------------------------
    // Reset all move states
    //--------------------------------


    reset(
        pokemon
    )
    {


        this.states.set(

            this.getId(pokemon),

            {

                rollout:null,

                furyCutter:null,

                rage:false,

                bide:null

            }

        );



        return {

            success:true

        };


    }



}





module.exports =
    MoveStateService;
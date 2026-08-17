/**
 * Pokémon Companion
 * Reward Service
 *
 * Applies event rewards to trainer state.
 */

"use strict";


class RewardService {



    execute(
        rewards,
        trainerState
    )
    {


        if(!rewards)
        {

            return {

                success:false,

                reason:
                    "No rewards"

            };

        }





        //--------------------------------
        // Items
        //--------------------------------


        for(
            const item of rewards.addItems || []
        )
        {

            trainerState.addItem(

                item.name,

                item.quantity || 1

            );


        }







        //--------------------------------
        // Pokémon
        //--------------------------------


        for(
            const pokemon of rewards.addPokemon || []
        )
        {


            trainerState.addPokemon(

                {

                    species:
                        pokemon.species,


                    level:
                        pokemon.level || 1

                }

            );


        }







        //--------------------------------
        // Money
        //--------------------------------


        if(
            rewards.addMoney
        )
        {


            trainerState.addMoney(

                rewards.addMoney

            );


        }







        //--------------------------------
        // Story flags
        //--------------------------------


        for(
            const flag of rewards.addStoryFlags || []
        )
        {


            trainerState.addStoryFlag(

                flag

            );


        }







        //--------------------------------
        // Remove flags
        //--------------------------------


        for(
            const flag of rewards.removeStoryFlags || []
        )
        {


            trainerState.removeStoryFlag(

                flag

            );


        }







        //--------------------------------
        // Battles
        //--------------------------------


        for(
            const battle of rewards.battles || []
        )
        {


            trainerState.completeBattle(

                battle

            );


        }







        return {


            success:true,


            state:

                trainerState.getState

                ?

                trainerState.getState()

                :

                trainerState.serialize
                ?

                trainerState.serialize()

                :

                trainerState


        };


    }


}


module.exports =
RewardService;
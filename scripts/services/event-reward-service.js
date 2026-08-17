/**
 * Pokémon Companion
 * Event Reward Service
 *
 * Handles rewards from story events and NPC interactions.
 *
 * Responsibilities:
 * - Give items.
 * - Give key items.
 * - Give Pokémon.
 * - Add story flags.
 * - Unlock HM field abilities.
 * - Complete events.
 *
 * Does NOT:
 * - Trigger events.
 * - Check requirements.
 * - Handle NPC interaction.
 * - Decide progression.
 */

"use strict";


class EventRewardService {



    //--------------------------------
    // Apply event rewards
    //--------------------------------


    giveRewards(
        rewards,
        trainerState
    ) {


        if(
            !rewards
        ) {


            return {


                success:false,


                reason:
                    "No rewards"


            };


        }



        //--------------------------------
        // Normal items
        //--------------------------------


        for(
            const item of rewards.items || []
        ) {


            trainerState.addItem(

                item.id,

                item.quantity || 1

            );


        }







        //--------------------------------
        // Key items
        //--------------------------------


        for(
            const item of rewards.keyItems || []
        ) {


            trainerState.addKeyItem(

                item

            );


        }







        //--------------------------------
        // Pokémon rewards
        //--------------------------------


        for(
            const pokemon of rewards.pokemon || []
        ) {


            trainerState.addPokemon(

                pokemon

            );


        }







        //--------------------------------
        // Story flags
        //--------------------------------


        for(
            const flag of rewards.storyFlags || []
        ) {


            trainerState.addStoryFlag(

                flag

            );


        }







        //--------------------------------
        // HM field abilities
        //--------------------------------


        for(
            const ability of rewards.hmAbilities || []
        ) {


            trainerState.addHMAbility(

                ability

            );


        }







        //--------------------------------
        // Completed events
        //--------------------------------


        for(
            const event of rewards.completedEvents || []
        ) {


            trainerState.completeEvent(

                event

            );


        }







        return {


            success:true,


            rewards


        };


    }







    //--------------------------------
    // Validate rewards
    //--------------------------------


    hasRewards(
        rewards
    ) {


        if(
            !rewards
        ) {


            return false;


        }



        return (

            (rewards.items || []).length > 0

            ||

            (rewards.keyItems || []).length > 0

            ||

            (rewards.pokemon || []).length > 0

            ||

            (rewards.storyFlags || []).length > 0

            ||

            (rewards.hmAbilities || []).length > 0

            ||

            (rewards.completedEvents || []).length > 0

        );


    }







    //--------------------------------
    // Create reward object helpers
    //--------------------------------


    createStoryReward(
        flag
    ) {


        return {


            storyFlags:[
                flag
            ]


        };


    }





    createItemReward(
        item,
        quantity = 1
    ) {


        return {


            items:[

                {

                    id:item,

                    quantity

                }

            ]


        };


    }





    createKeyItemReward(
        item
    ) {


        return {


            keyItems:[

                item

            ]


        };


    }





    createHMAbilityReward(
        ability
    ) {


        return {


            hmAbilities:[

                ability

            ]


        };


    }



}



module.exports =
    EventRewardService;
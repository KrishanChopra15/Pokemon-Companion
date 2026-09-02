/**
 * Pokémon Companion
 * NPC Reward Resolver
 *
 * Extracts rewards produced by resolved NPC events.
 *
 * Responsibilities:
 * - Pokémon gifts.
 * - Egg gifts.
 * - Item rewards.
 * - TM rewards.
 * - Key-item rewards.
 * - Money rewards.
 *
 * Does NOT:
 * - Resolve event graphs.
 * - Resolve trainers.
 * - Classify NPCs.
 */

"use strict";


class NPCRewardResolver
{


    //--------------------------------
    // Process rewards
    //--------------------------------

    process(
        event,
        roles,
        interactionTypes,
        rewards,
        interactions
    )
    {

        const effects =
            event.effects
            ||
            {};


        //--------------------------------
        // Pokémon gifts
        //--------------------------------

        if(
            Array.isArray(
                effects.addPokemon
            )
            &&
            effects.addPokemon.length > 0
        )
        {

            this.addUnique(

                roles,

                "GIFT_POKEMON"

            );


            this.addUnique(

                interactionTypes,

                "GIFT_POKEMON"

            );


            for(
                const pokemon of
                    effects.addPokemon
            )
            {

                rewards.pokemon.push({

                    species:
                        pokemon.species,

                    level:
                        pokemon.level

                });

            }


            interactions.push({

                type:
                    "GIFT_POKEMON"

            });

        }


        //--------------------------------
        // Eggs
        //--------------------------------

        if(
            Array.isArray(
                effects.addEggs
            )
            &&
            effects.addEggs.length > 0
        )
        {

            this.addUnique(

                roles,

                "GIFT_EGG"

            );


            this.addUnique(

                interactionTypes,

                "GIFT_EGG"

            );


            for(
                const egg of
                    effects.addEggs
            )
            {

                rewards.eggs.push({

                    species:
                        egg.species

                });

            }


            interactions.push({

                type:
                    "GIFT_EGG"

            });

        }


        //--------------------------------
        // Item rewards
        //--------------------------------

        if(
            Array.isArray(
                effects.addItems
            )
            &&
            effects.addItems.length > 0
        )
        {

            this.addUnique(

                roles,

                "REWARD"

            );


            this.addUnique(

                interactionTypes,

                "ITEM_REWARD"

            );


            for(
                const item of
                    effects.addItems
            )
            {

                rewards.items.push({

                    item:
                        item.item,

                    quantity:
                        item.quantity

                });

            }


            interactions.push({

                type:
                    "ITEM_REWARD"

            });

        }


        //--------------------------------
        // TMs
        //--------------------------------

        if(
            Array.isArray(
                effects.addTMs
            )
            &&
            effects.addTMs.length > 0
        )
        {

            this.addUnique(

                roles,

                "MACHINE_REWARD"

            );


            this.addUnique(

                interactionTypes,

                "TM_REWARD"

            );


            for(
                const tm of
                    effects.addTMs
            )
            {

                this.addUnique(

                    rewards.tms,

                    tm

                );

            }


            interactions.push({

                type:
                    "TM_REWARD"

            });

        }


        //--------------------------------
        // Key items
        //--------------------------------

        if(
            Array.isArray(
                effects.addKeyItems
            )
            &&
            effects.addKeyItems.length > 0
        )
        {

            this.addUnique(

                roles,

                "KEY_ITEM_REWARD"

            );


            this.addUnique(

                interactionTypes,

                "KEY_ITEM_REWARD"

            );


            for(
                const item of
                    effects.addKeyItems
            )
            {

                this.addUnique(

                    rewards.keyItems,

                    item

                );

            }


            interactions.push({

                type:
                    "KEY_ITEM_REWARD"

            });

        }


        //--------------------------------
        // Money
        //--------------------------------

        const money =
            Number(
                effects.addMoney
            );


        if(
            Number.isFinite(
                money
            )
            &&
            money > 0
        )
        {

            rewards.money +=
                money;


            this.addUnique(

                roles,

                "REWARD"

            );


            this.addUnique(

                interactionTypes,

                "MONEY_REWARD"

            );


            interactions.push({

                type:
                    "MONEY_REWARD",

                amount:
                    money

            });

        }

    }


    //--------------------------------
    // Add unique array value
    //--------------------------------

    addUnique(
        array,
        value
    )
    {

        if(
            !array.includes(
                value
            )
        )
        {

            array.push(
                value
            );

        }

    }


}


module.exports =
    NPCRewardResolver;
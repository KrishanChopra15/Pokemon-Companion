/**
 * Pokémon Companion
 * Trainer State
 *
 * Represents current player progression state.
 *
 * Responsibilities:
 * - Store badges.
 * - Store HM abilities.
 * - Store key items.
 * - Store story flags.
 * - Store inventory items.
 * - Store received Pokémon.
 * - Store money.
 * - Store completed battles/events.
 *
 * Does NOT:
 * - Decide progression.
 * - Unlock locations.
 * - Traverse maps.
 */

"use strict";


class TrainerState {


    constructor() {


        //--------------------------------
        // Progression
        //--------------------------------


        this.badges = [];


        this.hms = [];


        this.keyItems = [];


        this.storyFlags = [];




        //--------------------------------
        // Inventory
        //--------------------------------


        this.items = {};




        //--------------------------------
        // Pokémon
        //--------------------------------


        this.pokemon = [];




        //--------------------------------
        // Economy
        //--------------------------------


        this.money = 3000;




        //--------------------------------
        // Completed actions
        //--------------------------------


        this.completedBattles = [];


        this.completedEvents = [];


    }





    //--------------------------------
    // Badges
    //--------------------------------


    addBadge(
        badge
    ) {


        if(
            !this.badges.includes(
                badge
            )
        ) {

            this.badges.push(
                badge
            );

        }


    }



    hasBadge(
        badge
    ) {


        return this.badges.includes(
            badge
        );


    }





    //--------------------------------
    // HM abilities
    //--------------------------------


    addHM(
        hm
    ) {


        if(
            !this.hms.includes(
                hm
            )
        ) {

            this.hms.push(
                hm
            );

        }


    }



    hasHM(
        hm
    ) {


        return this.hms.includes(
            hm
        );


    }





    //--------------------------------
    // Key Items
    //--------------------------------


    addKeyItem(
        item
    ) {


        if(
            !this.keyItems.includes(
                item
            )
        ) {

            this.keyItems.push(
                item
            );

        }


    }



    hasKeyItem(
        item
    ) {


        return this.keyItems.includes(
            item
        );


    }





    //--------------------------------
    // Normal Items
    //--------------------------------


    addItem(
        item,
        quantity = 1
    ) {


        if(
            !this.items[item]
        ) {

            this.items[item] = 0;

        }



        this.items[item] += quantity;


    }





    removeItem(
        item,
        quantity = 1
    ) {


        if(
            !this.items[item]
        ) {

            return false;

        }



        this.items[item] -= quantity;



        if(
            this.items[item] <= 0
        ) {

            delete this.items[item];

        }



        return true;


    }





    hasItem(
        item
    ) {


        return (
            this.items[item] &&
            this.items[item] > 0
        );


    }





    getItemCount(
        item
    ) {


        return this.items[item] || 0;


    }





    //--------------------------------
    // Pokémon
    //--------------------------------


    addPokemon(
        pokemon
    ) {


        this.pokemon.push(
            pokemon
        );


    }



    hasPokemon(
        species
    ) {


        return this.pokemon.some(
            pokemon =>
                pokemon.species === species
        );


    }





    //--------------------------------
    // Money
    //--------------------------------


    addMoney(
        amount
    ) {


        this.money += amount;


    }



    removeMoney(
        amount
    ) {


        if(
            this.money < amount
        ) {

            return false;

        }



        this.money -= amount;


        return true;


    }



    getMoney()
    {

        return this.money;

    }





    //--------------------------------
    // Story Flags
    //--------------------------------


    addStoryFlag(
        flag
    ) {


        if(
            !this.storyFlags.includes(
                flag
            )
        ) {

            this.storyFlags.push(
                flag
            );

        }


    }





    removeStoryFlag(
        flag
    ) {


        this.storyFlags =
            this.storyFlags.filter(
                value =>
                    value !== flag
            );


    }





    hasStoryFlag(
        flag
    ) {


        return this.storyFlags.includes(
            flag
        );


    }





    //--------------------------------
    // Battle Tracking
    //--------------------------------


    completeBattle(
        battle
    ) {


        if(
            !this.completedBattles.includes(
                battle
            )
        ) {

            this.completedBattles.push(
                battle
            );

        }


    }



    hasCompletedBattle(
        battle
    ) {


        return this.completedBattles.includes(
            battle
        );


    }





    //--------------------------------
    // Event Tracking
    //--------------------------------


    completeEvent(
        event
    ) {


        if(
            !this.completedEvents.includes(
                event
            )
        ) {

            this.completedEvents.push(
                event
            );

        }


    }



    hasCompletedEvent(
        event
    ) {


        return this.completedEvents.includes(
            event
        );


    }





    //--------------------------------
    // Debug output
    //--------------------------------


    getState() {


        return {


            badges:
                this.badges,


            hms:
                this.hms,


            keyItems:
                this.keyItems,


            storyFlags:
                this.storyFlags,


            items:
                this.items,


            pokemon:
                this.pokemon,


            money:
                this.money,


            completedBattles:
                this.completedBattles,


            completedEvents:
                this.completedEvents


        };


    }


}


module.exports = TrainerState;
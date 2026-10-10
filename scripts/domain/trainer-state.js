
/**
 * Pokémon Companion
 * Trainer State
 *
 * Represents current player progression state.
 *
 * Responsibilities:
 * - Store badges.
 * - Store HM items.
 * - Store HM usage permissions.
 * - Store general field abilities.
 * - Store key items.
 * - Store story flags.
 * - Store inventory items.
 * - Store received Pokémon.
 * - Store Pokémon in PC storage.
 * - Store money.
 * - Store completed battles/events.
 * - Store world event states.
 * - Store player location.
 *
 * Does NOT:
 * - Decide progression.
 * - Unlock locations.
 * - Traverse maps.
 */

"use strict";


class TrainerState {


    constructor(data = {})
    {

        //--------------------------------
        // Player location
        //--------------------------------

        this.currentLocation =
            data.currentLocation || null;

        this.visitedLocations =
            data.visitedLocations || [];


        //--------------------------------
        // Progression
        //--------------------------------

        this.badges =
            data.badges || [];


        //--------------------------------
        // HM Items
        //--------------------------------

        this.hms =
            data.hms || [];


        //--------------------------------
        // HM usage permissions
        //--------------------------------

        this.hmAbilities =
            data.hmAbilities || [];


        //--------------------------------
        // General field abilities
        //--------------------------------

        this.abilities =
            data.abilities || [];


        //--------------------------------
        // Key items and story flags
        //--------------------------------

        this.keyItems =
            data.keyItems || [];

        this.storyFlags =
            data.storyFlags || [];


        //--------------------------------
        // Inventory
        //--------------------------------

        this.items =
            data.items || {};


        //--------------------------------
        // Pokémon collection
        //--------------------------------

        this.pokemon =
            data.pokemon || [];


        //--------------------------------
        // Selected starter
        //--------------------------------

        this.starter =
            data.starter ?? null;


        //--------------------------------
        // PC Storage
        //--------------------------------

        this.storage =
            data.storage || [];


        //--------------------------------
        // Economy
        //--------------------------------

        this.money =
            data.money ?? 3000;


        //--------------------------------
        // Completed actions
        //--------------------------------

        this.completedBattles =
            data.completedBattles || [];

        this.completedEvents =
            data.completedEvents || [];


        //--------------------------------
        // World State
        //--------------------------------

        this.eventStates =
            data.eventStates || {};

    }


    //--------------------------------
    // Location
    //--------------------------------

    setLocation(location)
    {

        this.currentLocation =
            location;

        this.visitLocation(
            location
        );

    }


    visitLocation(location)
    {

        if(
            location &&
            !this.visitedLocations.includes(location)
        )
        {

            this.visitedLocations.push(
                location
            );

        }

    }


    hasVisited(location)
    {

        return this.visitedLocations.includes(
            location
        );

    }


    //--------------------------------
    // Badges
    //--------------------------------

    addBadge(badge)
    {

        if(
            !this.hasBadge(badge)
        )
        {

            this.badges.push(
                badge
            );

        }

    }


    hasBadge(badge)
    {

        return this.badges.includes(
            badge
        );

    }


    //--------------------------------
    // HM Items
    //--------------------------------

    addHM(hm)
    {

        if(
            !this.hasHM(hm)
        )
        {

            this.hms.push(
                hm
            );

        }

    }


    hasHM(hm)
    {

        return this.hms.includes(
            hm
        );

    }


    //--------------------------------
    // HM Usage Permissions
    //--------------------------------

    addHMAbility(move)
    {

        if(
            !this.hasHMAbility(move)
        )
        {

            this.hmAbilities.push(
                move
            );

        }

    }


    hasHMAbility(move)
    {

        return this.hmAbilities.includes(
            move
        );

    }


    //--------------------------------
    // General Field Abilities
    //--------------------------------

    addAbility(ability)
    {

        if(
            !this.hasAbility(ability)
        )
        {

            this.abilities.push(
                ability
            );

        }

    }


    hasAbility(ability)
    {

        return this.abilities.includes(
            ability
        );

    }


    //--------------------------------
    // Key Items
    //--------------------------------

    addKeyItem(item)
    {

        if(
            !this.hasKeyItem(item)
        )
        {

            this.keyItems.push(
                item
            );

        }

    }


    hasKeyItem(item)
    {

        return this.keyItems.includes(
            item
        );

    }


    //--------------------------------
    // Items
    //--------------------------------

    addItem(
        item,
        quantity = 1
    )
    {

        this.items[item] =
            (
                this.items[item] || 0
            ) +
            quantity;

    }


    removeItem(
        item,
        quantity = 1
    )
    {

        if(
            !this.hasItem(item)
        )
        {

            return false;

        }


        this.items[item] -= quantity;


        if(
            this.items[item] <= 0
        )
        {

            delete this.items[item];

        }


        return true;

    }


    hasItem(item)
    {

        return (
            this.items[item] || 0
        ) > 0;

    }


    getItemCount(item)
    {

        return this.items[item] || 0;

    }


    //--------------------------------
    // Pokémon
    //--------------------------------

    addPokemon(pokemon)
    {

        this.pokemon.push(
            pokemon
        );

    }


    hasPokemon(species)
    {

        return this.pokemon.some(

            pokemon =>
                pokemon.species === species

        );

    }


    //--------------------------------
    // Money
    //--------------------------------

    addMoney(amount)
    {

        this.money += amount;

    }


    removeMoney(amount)
    {

        if(
            this.money < amount
        )
        {

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

    addStoryFlag(flag)
    {

        if(
            !this.hasStoryFlag(flag)
        )
        {

            this.storyFlags.push(
                flag
            );

        }

    }


    removeStoryFlag(flag)
    {

        this.storyFlags =
            this.storyFlags.filter(

                value =>
                    value !== flag

            );

    }


    hasStoryFlag(flag)
    {

        return this.storyFlags.includes(
            flag
        );

    }


    //--------------------------------
    // Battles
    //--------------------------------

    completeBattle(battle)
    {

        if(
            !this.completedBattles.includes(battle)
        )
        {

            this.completedBattles.push(
                battle
            );

        }

    }


    hasCompletedBattle(battle)
    {

        return this.completedBattles.includes(
            battle
        );

    }


    //--------------------------------
    // Events
    //--------------------------------

    completeEvent(event)
    {

        if(
            !this.completedEvents.includes(event)
        )
        {

            this.completedEvents.push(
                event
            );

        }


        this.eventStates[event] =
        {

            state:
                "completed",

            completed:
                true

        };

    }


    hasCompletedEvent(event)
    {

        return this.completedEvents.includes(
            event
        );

    }


    getEventState(event)
    {

        return (

            this.eventStates[event]

            ||

            {
                state: "active",
                completed: false
            }

        );

    }


    setEventState(
        event,
        state
    )
    {

        this.eventStates[event] =
            state;

    }


    //--------------------------------
    // State getter
    //--------------------------------

    getState()
    {

        return this.serialize();

    }


    //--------------------------------
    // Save serialization
    //--------------------------------

    serialize()
    {

        return {

            currentLocation:
                this.currentLocation,

            visitedLocations:
                this.visitedLocations,

            badges:
                this.badges,

            hms:
                this.hms,

            hmAbilities:
                this.hmAbilities,

            abilities:
                this.abilities,

            keyItems:
                this.keyItems,

            storyFlags:
                this.storyFlags,

            items:
                this.items,

            pokemon:
                this.pokemon,

            starter:
                this.starter,

            storage:
                this.storage,

            money:
                this.money,

            completedBattles:
                this.completedBattles,

            completedEvents:
                this.completedEvents,

            eventStates:
                this.eventStates

        };

    }


}


module.exports =
    TrainerState;

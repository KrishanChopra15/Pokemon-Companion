/**
 * Pokémon Companion
 * Item Effect Service
 *
 * Executes normalized item behaviors.
 *
 * Responsibilities:
 * - Apply healing item effects.
 * - Apply status curing effects.
 * - Apply revival effects.
 * - Apply party-wide revival effects.
 * - Validate item use against Pokémon state.
 * - Return structured item-use results.
 *
 * Does NOT:
 * - Manage inventory.
 * - Remove items from inventory.
 * - Load ROM data.
 * - Parse game source.
 * - Calculate battles.
 * - Manage teams.
 * - Manage friendship.
 */

"use strict";


class ItemEffectService
{


    constructor(
        statusEffectService = null
    )
    {

        this.status =
            statusEffectService;

    }


    //--------------------------------
    // Use item behavior on Pokémon
    //--------------------------------

    use(
        behavior,
        pokemon
    )
    {

        if(
            !behavior
        )
        {

            return {

                success:
                    false,

                reason:
                    "Missing item behavior"

            };

        }


        if(
            !pokemon
        )
        {

            return {

                success:
                    false,

                reason:
                    "Missing Pokemon"

            };

        }


        switch(
            behavior.behavior
        )
        {

            case "HEAL_HP":

                return this.healHP(
                    behavior,
                    pokemon
                );


            case "CURE_STATUS":

                return this.cureStatus(
                    behavior,
                    pokemon
                );


            case "HEAL_HP_AND_CURE_STATUS":

                return this.healHPAndCureStatus(
                    behavior,
                    pokemon
                );


            case "REVIVE":

                return this.revive(
                    behavior,
                    pokemon
                );


            case "REVIVE_ALL":

                return {

                    success:
                        false,

                    reason:
                        "REVIVE_ALL requires a party",

                    behavior:
                        behavior.behavior

                };


            default:

                return {

                    success:
                        false,

                    reason:
                        `Unsupported item behavior: ${behavior.behavior}`

                };

        }

    }


    //--------------------------------
    // Use item behavior on party
    //--------------------------------

    useOnParty(
        behavior,
        party
    )
    {

        if(
            !behavior
        )
        {

            return {

                success:
                    false,

                reason:
                    "Missing item behavior"

            };

        }


        if(
            !Array.isArray(
                party
            )
        )
        {

            return {

                success:
                    false,

                reason:
                    "Party must be an array"

            };

        }


        switch(
            behavior.behavior
        )
        {

            case "REVIVE_ALL":

                return this.reviveAll(
                    behavior,
                    party
                );


            default:

                return {

                    success:
                        false,

                    reason:
                        `Unsupported party item behavior: ${behavior.behavior}`

                };

        }

    }


    //--------------------------------
    // Heal HP
    //--------------------------------

    healHP(
        behavior,
        pokemon
    )
    {

        const maxHP =
            this.getMaxHP(
                pokemon
            );


        const currentHP =
            this.getCurrentHP(
                pokemon
            );


        if(
            maxHP <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid maximum HP"

            };

        }


        if(
            currentHP <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Cannot use HP medicine on a fainted Pokemon"

            };

        }


        if(
            currentHP >= maxHP
        )
        {

            return {

                success:
                    false,

                reason:
                    "Pokemon already has full HP"

            };

        }


        const amount =
            this.resolveHealAmount(
                behavior.amount,
                maxHP
            );


        if(
            amount <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid healing amount"

            };

        }


        const healed =
            Math.min(

                amount,

                maxHP - currentHP

            );


        pokemon.hp =
            currentHP + healed;


        return {

            success:
                true,

            behavior:
                behavior.behavior,

            pokemon:
                pokemon,

            previousHP:
                currentHP,

            healed:
                healed,

            hp:
                pokemon.hp,

            maxHP:
                maxHP

        };

    }


    //--------------------------------
    // Cure status
    //--------------------------------

    cureStatus(
        behavior,
        pokemon
    )
    {

        const status =
            behavior.status;


        //--------------------------------
        // No status to cure
        //--------------------------------

        if(
            !pokemon.status
        )
        {

            return {

                success:
                    false,

                reason:
                    "Pokemon has no status condition"

            };

        }


        //--------------------------------
        // Validate specific status
        //--------------------------------

        if(
            status !== "ALL"
            &&
            pokemon.status !== status
        )
        {

            return {

                success:
                    false,

                reason:
                    `Pokemon does not have ${status}`

            };

        }


        const previousStatus =
            pokemon.status;


        //--------------------------------
        // Use central status service
        //--------------------------------

        this.removeStatus(
            pokemon
        );


        return {

            success:
                true,

            behavior:
                behavior.behavior,

            pokemon:
                pokemon,

            previousStatus:
                previousStatus,

            status:
                null

        };

    }


    //--------------------------------
    // Heal HP and cure status
    //--------------------------------

    healHPAndCureStatus(
        behavior,
        pokemon
    )
    {

        const maxHP =
            this.getMaxHP(
                pokemon
            );


        const currentHP =
            this.getCurrentHP(
                pokemon
            );


        if(
            maxHP <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid maximum HP"

            };

        }


        //--------------------------------
        // Full Restore cannot revive
        //--------------------------------

        if(
            currentHP <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Cannot use Full Restore on a fainted Pokemon"

            };

        }


        if(
            currentHP >= maxHP
            &&
            !pokemon.status
        )
        {

            return {

                success:
                    false,

                reason:
                    "Pokemon already has full HP and no status condition"

            };

        }


        const previousHP =
            currentHP;


        const previousStatus =
            pokemon.status ||
            null;


        //--------------------------------
        // Restore HP
        //--------------------------------

        pokemon.hp =
            maxHP;


        //--------------------------------
        // Cure status
        //--------------------------------

        if(
            pokemon.status
        )
        {

            this.removeStatus(
                pokemon
            );

        }


        return {

            success:
                true,

            behavior:
                behavior.behavior,

            pokemon:
                pokemon,

            previousHP:
                previousHP,

            hp:
                pokemon.hp,

            maxHP:
                maxHP,

            previousStatus:
                previousStatus,

            status:
                pokemon.status ||
                null

        };

    }


    //--------------------------------
    // Revive one Pokémon
    //--------------------------------

    revive(
        behavior,
        pokemon
    )
    {

        const maxHP =
            this.getMaxHP(
                pokemon
            );


        const currentHP =
            this.getCurrentHP(
                pokemon
            );


        if(
            maxHP <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid maximum HP"

            };

        }


        //--------------------------------
        // Revive requires fainted Pokémon
        //--------------------------------

        if(
            currentHP > 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Pokemon is not fainted"

            };

        }


        const reviveAmount =
            this.resolveReviveAmount(
                behavior.amount,
                maxHP
            );


        if(
            reviveAmount <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid revival amount"

            };

        }


        const previousHP =
            currentHP;


        const previousStatus =
            pokemon.status ||
            null;


        //--------------------------------
        // Restore HP
        //--------------------------------

        pokemon.hp =
            reviveAmount;


        //--------------------------------
        // Clear status if present
        //--------------------------------

        if(
            pokemon.status
        )
        {

            this.removeStatus(
                pokemon
            );

        }


        return {

            success:
                true,

            behavior:
                behavior.behavior,

            pokemon:
                pokemon,

            previousHP:
                previousHP,

            hp:
                pokemon.hp,

            maxHP:
                maxHP,

            revivedHP:
                reviveAmount,

            previousStatus:
                previousStatus,

            status:
                pokemon.status ||
                null

        };

    }


    //--------------------------------
    // Revive all fainted Pokémon
    //--------------------------------

    reviveAll(
        behavior,
        party
    )
    {

        //--------------------------------
        // Find fainted Pokémon
        //--------------------------------

        const fainted =
            party.filter(

                pokemon =>
                    pokemon
                    &&
                    this.getCurrentHP(
                        pokemon
                    ) <= 0

            );


        //--------------------------------
        // Nothing to revive
        //--------------------------------

        if(
            fainted.length === 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "No fainted Pokemon in party",

                revived:
                    [],

                revivedCount:
                    0,

                partySize:
                    party.length

            };

        }


        //--------------------------------
        // Revive each fainted Pokémon
        //--------------------------------

        const revived =
            [];


        for(
            const pokemon of fainted
        )
        {

            const maxHP =
                this.getMaxHP(
                    pokemon
                );


            if(
                maxHP <= 0
            )
            {

                continue;

            }


            const previousHP =
                this.getCurrentHP(
                    pokemon
                );


            const previousStatus =
                pokemon.status ||
                null;


            //--------------------------------
            // Sacred Ash uses full HP
            //--------------------------------

            pokemon.hp =
                this.resolveReviveAmount(
                    behavior.amount,
                    maxHP
                );


            //--------------------------------
            // Clear status if present
            //--------------------------------

            if(
                pokemon.status
            )
            {

                this.removeStatus(
                    pokemon
                );

            }


            revived.push({

                pokemon:
                    pokemon,

                previousHP:
                    previousHP,

                hp:
                    pokemon.hp,

                maxHP:
                    maxHP,

                previousStatus:
                    previousStatus,

                status:
                    pokemon.status ||
                    null

            });

        }


        //--------------------------------
        // Make sure at least one Pokémon
        // was actually revived.
        //--------------------------------

        if(
            revived.length === 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "No valid fainted Pokemon could be revived",

                revived:
                    [],

                revivedCount:
                    0,

                partySize:
                    party.length

            };

        }


        return {

            success:
                true,

            behavior:
                behavior.behavior,

            amount:
                behavior.amount,

            scope:
                behavior.scope ||
                "PARTY",

            revived:
                revived,

            revivedCount:
                revived.length,

            partySize:
                party.length

        };

    }


    //--------------------------------
    // Remove status
    //--------------------------------

    removeStatus(
        pokemon
    )
    {

        if(
            this.status
            &&
            typeof this.status.removeStatus ===
                "function"
        )
        {

            return this.status.removeStatus(
                pokemon
            );

        }


        //--------------------------------
        // Fallback
        //--------------------------------

        pokemon.status =
            null;


        pokemon.statusTurns =
            0;


        pokemon.statusData =
            null;


        return {

            success:
                true

        };

    }


    //--------------------------------
    // Resolve healing amount
    //--------------------------------

    resolveHealAmount(
        amount,
        maxHP
    )
    {

        if(
            amount ===
            "FULL"
        )
        {

            return maxHP;

        }


        const numericAmount =
            Number(
                amount
            );


        if(
            !Number.isFinite(
                numericAmount
            )
            ||
            numericAmount < 0
        )
        {

            return 0;

        }


        return numericAmount;

    }


    //--------------------------------
    // Resolve revival amount
    //--------------------------------

    resolveReviveAmount(
        amount,
        maxHP
    )
    {

        if(
            amount ===
            "FULL"
        )
        {

            return maxHP;

        }


        if(
            amount ===
            "HALF_MAX_HP"
        )
        {

            return Math.floor(
                maxHP / 2
            );

        }


        const numericAmount =
            Number(
                amount
            );


        if(
            !Number.isFinite(
                numericAmount
            )
            ||
            numericAmount < 0
        )
        {

            return 0;

        }


        return Math.min(
            numericAmount,
            maxHP
        );

    }


    //--------------------------------
    // Get current HP
    //--------------------------------

    getCurrentHP(
        pokemon
    )
    {

        const hp =
            Number(
                pokemon.hp
            );


        if(
            !Number.isFinite(
                hp
            )
            ||
            hp < 0
        )
        {

            return 0;

        }


        return hp;

    }


    //--------------------------------
    // Get maximum HP
    //--------------------------------

    getMaxHP(
        pokemon
    )
    {

        const maxHP =
            Number(
                pokemon.maxHP
            );


        if(
            Number.isFinite(
                maxHP
            )
            &&
            maxHP >= 0
        )
        {

            return maxHP;

        }


        return 0;

    }


}


module.exports =
    ItemEffectService;
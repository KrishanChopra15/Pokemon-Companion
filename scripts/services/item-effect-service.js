/**
 * Pokémon Companion
 * Item Effect Service
 *
 * Executes normalized item behaviors.
 *
 * Responsibilities:
 * - Apply healing item effects.
 * - Apply PP recovery effects.
 * - Apply PP Up effects.
 * - Apply PP Max effects.
 * - Apply status curing effects.
 * - Apply revival effects.
 * - Apply party-wide revival effects.
 * - Apply battle stat effects.
 * - Apply friendship changes.
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
 */

"use strict";


class ItemEffectService
{


    constructor(
        statusEffectService = null,
        friendshipService = null,
        statStageService = null
    )
    {

        this.status =
            statusEffectService;


        this.friendship =
            friendshipService;


        this.statStage =
            statStageService;

    }


    //--------------------------------
    // Use item behavior on Pokémon
    //--------------------------------

    use(
        behavior,
        pokemon,
        move = null,
        options = {}
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


        //--------------------------------
        // Apply primary behavior
        //--------------------------------

        let result;


        switch(
            behavior.behavior
        )
        {

            case "HEAL_HP":

                result =
                    this.healHP(
                        behavior,
                        pokemon
                    );

                break;


            case "HEAL_PP_ONE":

                result =
                    this.healPPOne(
                        behavior,
                        pokemon,
                        move
                    );

                break;


            case "HEAL_PP_ALL":

                result =
                    this.healPPAll(
                        behavior,
                        pokemon
                    );

                break;


            case "PP_UP":

                result =
                    this.applyPPUp(
                        behavior,
                        pokemon,
                        move
                    );

                break;


            case "PP_MAX":

                result =
                    this.applyPPMax(
                        behavior,
                        pokemon,
                        move
                    );

                break;


            case "RAISE_STAT_STAGE":

                result =
                    this.raiseStatStage(
                        behavior,
                        pokemon
                    );

                break;


            case "CURE_STATUS":

                result =
                    this.cureStatus(
                        behavior,
                        pokemon
                    );

                break;


            case "HEAL_HP_AND_CURE_STATUS":

                result =
                    this.healHPAndCureStatus(
                        behavior,
                        pokemon
                    );

                break;


            case "REVIVE":

                result =
                    this.revive(
                        behavior,
                        pokemon
                    );

                break;


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


        //--------------------------------
        // Primary effect failed
        //--------------------------------

        if(
            !result.success
        )
        {

            return result;

        }


        //--------------------------------
        // Apply secondary friendship effects
        //--------------------------------

        const friendshipResult =
            this.applyFriendshipEffects(

                behavior,

                pokemon,

                options

            );


        //--------------------------------
        // Include friendship result when
        // the item actually has one.
        //--------------------------------

        if(
            friendshipResult
        )
        {

            //--------------------------------
            // If friendship itself failed,
            // do not report the item as fully
            // successful.
            //--------------------------------

            if(
                friendshipResult.success ===
                    false
            )
            {

                return {

                    success:
                        false,

                    reason:
                        friendshipResult.reason,

                    behavior:
                        behavior.behavior,

                    pokemon:
                        pokemon,

                    effect:
                        result,

                    friendship:
                        friendshipResult

                };

            }


            result.friendship =
                friendshipResult;

        }


        return result;

    }


    //--------------------------------
    // Use item behavior on party
    //--------------------------------

    useOnParty(
        behavior,
        party,
        options = {}
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
    // Apply friendship effects
    //
    // Returns null when the item has
    // no friendship effect.
    //--------------------------------

    applyFriendshipEffects(
        behavior,
        pokemon,
        options = {}
    )
    {

        if(
            !behavior
            ||
            !Array.isArray(
                behavior.effects
            )
        )
        {

            return null;

        }


        const friendshipEffect =
            behavior.effects.find(

                effect =>

                    effect
                    &&
                    effect.type ===
                        "FRIENDSHIP_CHANGE"

            );


        if(
            !friendshipEffect
        )
        {

            return null;

        }


        return this.applyFriendshipChange(

            friendshipEffect,

            pokemon,

            options

        );

    }


    //--------------------------------
    // Apply friendship change
    //--------------------------------

    applyFriendshipChange(
        effect,
        pokemon,
        options = {}
    )
    {

        //--------------------------------
        // Require friendship service
        //--------------------------------

        if(
            !this.friendship
            ||
            typeof this.friendship.getFriendship !==
                "function"
            ||
            typeof this.friendship.changeFriendship !==
                "function"
        )
        {

            return {

                success:
                    false,

                reason:
                    "Friendship service is not available"

            };

        }


        //--------------------------------
        // Read current friendship
        //--------------------------------

        const previousFriendship =
            this.friendship.getFriendship(
                pokemon
            );


        //--------------------------------
        // Resolve Gen III tier-based amount
        //--------------------------------

        const amount =
            this.resolveFriendshipChange(

                effect,

                previousFriendship

            );


        //--------------------------------
        // Apply through FriendshipService
        //
        // This is important because
        // FriendshipService handles:
        // - clamping
        // - Luxury Ball bonus
        // - met-location bonus
        // - positive/negative rules
        //--------------------------------

        const result =
            this.friendship.changeFriendship(

                pokemon,

                amount,

                options

            );


        if(
            !result.success
        )
        {

            return result;

        }


        //--------------------------------
        // Return item friendship result
        //--------------------------------

        return {

            success:
                true,

            previousFriendship:
                result.previousFriendship,

            requestedChange:
                amount,

            change:
                result.change,

            friendship:
                result.friendship,

            tier:
                this.friendship.getTierFromValue(

                    result.previousFriendship

                ),

            resultTier:
                this.friendship.getTierFromValue(

                    result.friendship

                )

        };

    }


    //--------------------------------
    // Get friendship tier
    //--------------------------------

    getFriendshipTier(
        friendship
    )
    {

        if(
            this.friendship
            &&
            typeof this.friendship.getTierFromValue ===
                "function"
        )
        {

            return this.friendship.getTierFromValue(
                friendship
            );

        }


        //--------------------------------
        // Defensive fallback
        //--------------------------------

        if(
            friendship < 100
        )
        {

            return "LOW";

        }


        if(
            friendship < 200
        )
        {

            return "MID";

        }


        return "HIGH";

    }


    //--------------------------------
    // Resolve friendship change
    //--------------------------------

    resolveFriendshipChange(
        effect,
        friendship
    )
    {

        const tier =
            this.getFriendshipTier(
                friendship
            );


        //--------------------------------
        // High friendship
        //--------------------------------

        if(
            tier ===
                "HIGH"
            &&
            effect.high !==
                undefined
        )
        {

            return this.toNumber(
                effect.high
            );

        }


        //--------------------------------
        // Mid friendship
        //--------------------------------

        if(
            tier ===
                "MID"
            &&
            effect.mid !==
                undefined
        )
        {

            return this.toNumber(
                effect.mid
            );

        }


        //--------------------------------
        // Low friendship
        //--------------------------------

        if(
            tier ===
                "LOW"
            &&
            effect.low !==
                undefined
        )
        {

            return this.toNumber(
                effect.low
            );

        }


        //--------------------------------
        // Fallbacks
        //--------------------------------

        if(
            effect.mid !==
                undefined
        )
        {

            return this.toNumber(
                effect.mid
            );

        }


        if(
            effect.low !==
                undefined
        )
        {

            return this.toNumber(
                effect.low
            );

        }


        if(
            effect.high !==
                undefined
        )
        {

            return this.toNumber(
                effect.high
            );

        }


        return 0;

    }


    //--------------------------------
    // Get friendship
    //--------------------------------

    getFriendship(
        pokemon
    )
    {

        //--------------------------------
        // Require friendship service
        //--------------------------------

        if(
            this.friendship
            &&
            typeof this.friendship.getFriendship ===
                "function"
        )
        {

            return this.friendship.getFriendship(
                pokemon
            );

        }


        //--------------------------------
        // Defensive fallback
        //--------------------------------

        return 70;

    }


    //--------------------------------
    // Convert to number
    //--------------------------------

    toNumber(
        value
    )
    {

        const number =
            Number(
                value
            );


        if(
            !Number.isFinite(
                number
            )
        )
        {

            return 0;

        }


        return Math.trunc(
            number
        );

    }


    //--------------------------------
    // Raise stat stage
    //--------------------------------

    raiseStatStage(
        behavior,
        pokemon
    )
    {

        //--------------------------------
        // Require stat stage service
        //--------------------------------

        if(
            !this.statStage
            ||
            typeof this.statStage.getStage !==
                "function"
            ||
            typeof this.statStage.increase !==
                "function"
        )
        {

            return {

                success:
                    false,

                reason:
                    "Stat stage service is not available"

            };

        }


        //--------------------------------
        // Resolve runtime stat name
        //--------------------------------

        const stat =
            this.resolveRuntimeStat(
                behavior.stat
            );


        if(
            !stat
        )
        {

            return {

                success:
                    false,

                reason:
                    `Unknown battle stat: ${behavior.stat}`

            };

        }


        //--------------------------------
        // Resolve stage increase
        //--------------------------------

        const stages =
            Number(
                behavior.stages
            );


        const amount =
            Number.isFinite(
                stages
            )

            ?

            Math.trunc(
                stages
            )

            :

            1;


        if(
            amount <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid stat stage increase"

            };

        }


        //--------------------------------
        // Get current stage
        //--------------------------------

        const previousStage =
            this.statStage.getStage(

                pokemon,

                stat

            );


        //--------------------------------
        // Prevent successful use when
        // the stat is already at +6.
        //--------------------------------

        const maxStage =
            typeof this.statStage.maxStage ===
                "number"

            ?

            this.statStage.maxStage

            :

            6;


        if(
            previousStage >= maxStage
        )
        {

            return {

                success:
                    false,

                reason:
                    `${stat} is already at maximum stage`,

                stat,

                previousStage,

                stage:
                    previousStage

            };

        }


        //--------------------------------
        // Apply the stage increase
        //--------------------------------

        const result =
            this.statStage.increase(

                pokemon,

                stat,

                amount

            );


        if(
            !result.success
        )
        {

            return result;

        }


        //--------------------------------
        // Return stat result
        //--------------------------------

        return {

            success:
                true,

            behavior:
                behavior.behavior,

            pokemon:
                pokemon,

            stat,

            stages:
                amount,

            previousStage,

            stage:
                result.stage

        };

    }


    //--------------------------------
    // Resolve normalized stat to
    // runtime StatStageService name
    //--------------------------------

    resolveRuntimeStat(
        stat
    )
    {

        if(
            !stat
        )
        {

            return null;

        }


        const normalized =
            String(
                stat
            )
            .toUpperCase()
            .replace(
                /\s+/g,
                "_"
            );


        const mapping =
        {

            ATTACK:
                "attack",

            DEFENSE:
                "defense",

            SPEED:
                "speed",

            SPECIAL_ATTACK:
                "spAttack",

            SP_ATTACK:
                "spAttack",

            SPECIAL_DEFENSE:
                "spDefense",

            SP_DEFENSE:
                "spDefense",

            ACCURACY:
                "accuracy",

            EVASION:
                "evasion"

        };


        return mapping[
            normalized
        ]
        ||
        null;

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

                maxHP -
                currentHP

            );


        pokemon.hp =
            currentHP +
            healed;


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
    // Heal PP for one move
    //--------------------------------

    healPPOne(
        behavior,
        pokemon,
        move
    )
    {

        if(
            !move
        )
        {

            return {

                success:
                    false,

                reason:
                    "No move selected"

            };

        }


        const moveSlot =
            this.getMoveSlot(
                pokemon,
                move
            );


        if(
            !moveSlot
        )
        {

            return {

                success:
                    false,

                reason:
                    "Move not known by Pokemon"

            };

        }


        const currentPP =
            this.getMoveCurrentPP(
                moveSlot
            );


        const maxPP =
            this.getMoveMaxPP(
                moveSlot
            );


        if(
            maxPP <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid maximum PP"

            };

        }


        if(
            currentPP >= maxPP
        )
        {

            return {

                success:
                    false,

                reason:
                    "Move already has full PP"

            };

        }


        const amount =
            this.resolvePPAmount(
                behavior.amount,
                maxPP
            );


        if(
            amount <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid PP recovery amount"

            };

        }


        const restored =
            Math.min(

                amount,

                maxPP -
                currentPP

            );


        const previousPP =
            currentPP;


        const newPP =
            currentPP +
            restored;


        this.setMoveCurrentPP(
            moveSlot,
            newPP
        );


        return {

            success:
                true,

            behavior:
                behavior.behavior,

            pokemon:
                pokemon,

            move:
                moveSlot,

            previousPP:
                previousPP,

            restored:
                restored,

            currentPP:
                newPP,

            maxPP:
                maxPP

        };

    }


    //--------------------------------
    // Heal PP for all moves
    //--------------------------------

    healPPAll(
        behavior,
        pokemon
    )
    {

        if(
            !Array.isArray(
                pokemon.moves
            )
        )
        {

            return {

                success:
                    false,

                reason:
                    "Pokemon has no moves"

            };

        }


        const recoverableMoves =
            pokemon.moves.filter(

                move =>

                    this.getMoveMaxPP(
                        move
                    ) > 0

                    &&

                    this.getMoveCurrentPP(
                        move
                    )
                    <
                    this.getMoveMaxPP(
                        move
                    )

            );


        if(
            recoverableMoves.length === 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "All moves already have full PP",

                restored:
                    [],

                restoredCount:
                    0

            };

        }


        const restoredMoves =
            [];


        for(
            const move of
                recoverableMoves
        )
        {

            const currentPP =
                this.getMoveCurrentPP(
                    move
                );


            const maxPP =
                this.getMoveMaxPP(
                    move
                );


            const amount =
                this.resolvePPAmount(
                    behavior.amount,
                    maxPP
                );


            if(
                amount <= 0
            )
            {

                continue;

            }


            const restored =
                Math.min(

                    amount,

                    maxPP -
                    currentPP

                );


            if(
                restored <= 0
            )
            {

                continue;

            }


            const newPP =
                currentPP +
                restored;


            this.setMoveCurrentPP(
                move,
                newPP
            );


            restoredMoves.push({

                move:
                    move,

                previousPP:
                    currentPP,

                restored:
                    restored,

                currentPP:
                    newPP,

                maxPP:
                    maxPP

            });

        }


        if(
            restoredMoves.length === 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "No PP could be restored",

                restored:
                    [],

                restoredCount:
                    0

            };

        }


        return {

            success:
                true,

            behavior:
                behavior.behavior,

            pokemon:
                pokemon,

            restored:
                restoredMoves,

            restoredCount:
                restoredMoves.length

        };

    }


    //--------------------------------
    // Apply PP Up
    //--------------------------------

    applyPPUp(
        behavior,
        pokemon,
        move
    )
    {

        if(
            !move
        )
        {

            return {

                success:
                    false,

                reason:
                    "No move selected"

            };

        }


        const moveSlot =
            this.getMoveSlot(
                pokemon,
                move
            );


        if(
            !moveSlot
        )
        {

            return {

                success:
                    false,

                reason:
                    "Move not known by Pokemon"

            };

        }


        if(
            typeof moveSlot.applyPPUp !==
                "function"
        )
        {

            return {

                success:
                    false,

                reason:
                    "Move does not support PP Up"

            };

        }


        const result =
            moveSlot.applyPPUp();


        if(
            !result.success
        )
        {

            return {

                success:
                    false,

                reason:
                    result.reason,

                behavior:
                    behavior.behavior,

                pokemon:
                    pokemon,

                move:
                    moveSlot

            };

        }


        return {

            success:
                true,

            behavior:
                behavior.behavior,

            pokemon:
                pokemon,

            move:
                moveSlot,

            previousPPUps:
                result.previousPPUps,

            ppUps:
                result.ppUps,

            previousMaxPP:
                result.previousMaxPP,

            maxPP:
                result.maxPP,

            increase:
                result.increase

        };

    }


    //--------------------------------
    // Apply PP Max
    //--------------------------------

    applyPPMax(
        behavior,
        pokemon,
        move
    )
    {

        if(
            !move
        )
        {

            return {

                success:
                    false,

                reason:
                    "No move selected"

            };

        }


        const moveSlot =
            this.getMoveSlot(
                pokemon,
                move
            );


        if(
            !moveSlot
        )
        {

            return {

                success:
                    false,

                reason:
                    "Move not known by Pokemon"

            };

        }


        if(
            typeof moveSlot.applyPPMax !==
                "function"
        )
        {

            return {

                success:
                    false,

                reason:
                    "Move does not support PP Max"

            };

        }


        const result =
            moveSlot.applyPPMax();


        if(
            !result.success
        )
        {

            return {

                success:
                    false,

                reason:
                    result.reason,

                behavior:
                    behavior.behavior,

                pokemon:
                    pokemon,

                move:
                    moveSlot

            };

        }


        return {

            success:
                true,

            behavior:
                behavior.behavior,

            pokemon:
                pokemon,

            move:
                moveSlot,

            previousPPUps:
                result.previousPPUps,

            ppUps:
                result.ppUps,

            previousMaxPP:
                result.previousMaxPP,

            maxPP:
                result.maxPP,

            increase:
                result.increase

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


        if(
            status !==
                "ALL"
            &&
            pokemon.status !==
                status
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


        pokemon.hp =
            maxHP;


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


        pokemon.hp =
            reviveAmount;


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

        const fainted =
            party.filter(

                pokemon =>

                    pokemon
                    &&
                    this.getCurrentHP(
                        pokemon
                    ) <= 0

            );


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


        const revived =
            [];


        for(
            const pokemon of
                fainted
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


            pokemon.hp =
                this.resolveReviveAmount(
                    behavior.amount,
                    maxHP
                );


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
    // Resolve PP recovery amount
    //--------------------------------

    resolvePPAmount(
        amount,
        maxPP
    )
    {

        if(
            amount ===
                "FULL"
        )
        {

            return maxPP;

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
    // Resolve Pokémon move slot
    //--------------------------------

    getMoveSlot(
        pokemon,
        move
    )
    {

        if(
            !pokemon
            ||
            !Array.isArray(
                pokemon.moves
            )
            ||
            !move
        )
        {

            return null;

        }


        //--------------------------------
        // Move slot object
        //--------------------------------

        if(
            pokemon.moves.includes(
                move
            )
        )
        {

            return move;

        }


        //--------------------------------
        // Move constant
        //--------------------------------

        const moveConstant =
            typeof move ===
                "string"

            ?

            move

            :

            move.constant;


        if(
            !moveConstant
        )
        {

            return null;

        }


        return (

            pokemon.moves.find(

                knownMove =>

                    knownMove
                    &&
                    knownMove.constant ===
                        moveConstant

            )

            ||

            null

        );

    }


    //--------------------------------
    // Get current PP from move slot
    //--------------------------------

    getMoveCurrentPP(
        move
    )
    {

        if(
            !move
        )
        {

            return 0;

        }


        const currentPP =
            Number(
                move.currentPP
            );


        if(
            Number.isFinite(
                currentPP
            )
        )
        {

            return Math.max(
                0,
                currentPP
            );

        }


        //--------------------------------
        // Legacy compatibility
        //--------------------------------

        const legacyPP =
            Number(
                move.pp
            );


        if(
            Number.isFinite(
                legacyPP
            )
        )
        {

            return Math.max(
                0,
                legacyPP
            );

        }


        return 0;

    }


    //--------------------------------
    // Get maximum PP from move slot
    //--------------------------------

    getMoveMaxPP(
        move
    )
    {

        if(
            !move
        )
        {

            return 0;

        }


        const maxPP =
            Number(
                move.maxPP
            );


        if(
            Number.isFinite(
                maxPP
            )
            &&
            maxPP >= 0
        )
        {

            return maxPP;

        }


        return 0;

    }


    //--------------------------------
    // Set current PP on move slot
    //--------------------------------

    setMoveCurrentPP(
        move,
        value
    )
    {

        const newPP =
            Math.max(
                0,
                value
            );


        //--------------------------------
        // Preferred PokemonMoveSlot path
        //--------------------------------

        if(
            move
            &&
            Object.prototype.hasOwnProperty.call(
                move,
                "currentPP"
            )
        )
        {

            move.currentPP =
                newPP;

            return;

        }


        //--------------------------------
        // Legacy compatibility
        //--------------------------------

        if(
            move
        )
        {

            move.pp =
                newPP;

        }

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
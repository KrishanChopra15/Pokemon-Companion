/**
 * Pokémon Companion
 * Generation III Item Behavior Rules
 *
 * Semantic item behavior definitions shared across
 * Generation III Pokémon games.
 *
 * Responsibilities:
 * - Define normalized semantic behavior for Generation III items.
 * - Group items by reusable behavior types.
 * - Preserve Generation III behavior meaning.
 *
 * Does NOT:
 * - Define game-specific item availability.
 * - Parse C source.
 * - Read item databases.
 * - Execute item behavior.
 * - Modify Pokémon.
 * - Manage inventory.
 */

"use strict";


const Gen3ItemBehaviors =
{

    //================================
    // Healing
    //================================

    ITEM_POTION:
    {
        category:
            "HEALING",

        behavior:
            "HEAL_HP",

        amount:
            20
    },


    ITEM_SUPER_POTION:
    {
        category:
            "HEALING",

        behavior:
            "HEAL_HP",

        amount:
            50
    },


    ITEM_HYPER_POTION:
    {
        category:
            "HEALING",

        behavior:
            "HEAL_HP",

        amount:
            200
    },


    ITEM_MAX_POTION:
    {
        category:
            "HEALING",

        behavior:
            "HEAL_HP",

        amount:
            "FULL"
    },


    ITEM_FRESH_WATER:
    {
        category:
            "HEALING",

        behavior:
            "HEAL_HP",

        amount:
            50
    },


    ITEM_SODA_POP:
    {
        category:
            "HEALING",

        behavior:
            "HEAL_HP",

        amount:
            60
    },


    ITEM_LEMONADE:
    {
        category:
            "HEALING",

        behavior:
            "HEAL_HP",

        amount:
            80
    },


    ITEM_MOOMOO_MILK:
    {
        category:
            "HEALING",

        behavior:
            "HEAL_HP",

        amount:
            100
    },


    ITEM_ENERGY_POWDER:
    {
        category:
            "HEALING",

        behavior:
            "HEAL_HP",

        amount:
            50
    },


    ITEM_ENERGY_ROOT:
    {
        category:
            "HEALING",

        behavior:
            "HEAL_HP",

        amount:
            200
    },


    ITEM_BERRY_JUICE:
    {
        category:
            "HEALING",

        behavior:
            "HEAL_HP",

        amount:
            20
    },


    ITEM_FULL_RESTORE:
    {
        category:
            "HEALING",

        behavior:
            "HEAL_HP_AND_CURE_STATUS",

        amount:
            "FULL",

        scope:
            "SINGLE_POKEMON"
    },


    //================================
    // PP recovery
    //================================

    ITEM_ETHER:
    {
        category:
            "PP_RECOVERY",

        behavior:
            "HEAL_PP_ONE",

        amount:
            10,

        scope:
            "SINGLE_MOVE"
    },


    ITEM_MAX_ETHER:
    {
        category:
            "PP_RECOVERY",

        behavior:
            "HEAL_PP_ONE",

        amount:
            "FULL",

        scope:
            "SINGLE_MOVE"
    },


    ITEM_ELIXIR:
    {
        category:
            "PP_RECOVERY",

        behavior:
            "HEAL_PP_ALL",

        amount:
            10,

        scope:
            "ALL_MOVES"
    },


    ITEM_MAX_ELIXIR:
    {
        category:
            "PP_RECOVERY",

        behavior:
            "HEAL_PP_ALL",

        amount:
            "FULL",

        scope:
            "ALL_MOVES"
    },


    //================================
    // PP expansion
    //================================

    ITEM_PP_UP:
    {
        category:
            "PP_EXPANSION",

        behavior:
            "PP_UP",

        scope:
            "SINGLE_MOVE"
    },


    ITEM_PP_MAX:
    {
        category:
            "PP_EXPANSION",

        behavior:
            "PP_MAX",

        scope:
            "SINGLE_MOVE"
    },


    //================================
    // Status healing
    //================================

    ITEM_FULL_HEAL:
    {
        category:
            "STATUS_HEALING",

        behavior:
            "CURE_STATUS",

        status:
            "ALL"
    },


    ITEM_ANTIDOTE:
    {
        category:
            "STATUS_HEALING",

        behavior:
            "CURE_STATUS",

        status:
            "POISON"
    },


    ITEM_BURN_HEAL:
    {
        category:
            "STATUS_HEALING",

        behavior:
            "CURE_STATUS",

        status:
            "BURN"
    },


    ITEM_ICE_HEAL:
    {
        category:
            "STATUS_HEALING",

        behavior:
            "CURE_STATUS",

        status:
            "FREEZE"
    },


    ITEM_AWAKENING:
    {
        category:
            "STATUS_HEALING",

        behavior:
            "CURE_STATUS",

        status:
            "SLEEP"
    },


    ITEM_PARALYZE_HEAL:
    {
        category:
            "STATUS_HEALING",

        behavior:
            "CURE_STATUS",

        status:
            "PARALYSIS"
    },


    ITEM_HEAL_POWDER:
    {
        category:
            "STATUS_HEALING",

        behavior:
            "CURE_STATUS",

        status:
            "ALL"
    },


    ITEM_LAVA_COOKIE:
    {
        category:
            "STATUS_HEALING",

        behavior:
            "CURE_STATUS",

        status:
            "ALL"
    },


    //================================
    // Revival
    //================================

    ITEM_REVIVE:
    {
        category:
            "REVIVAL",

        behavior:
            "REVIVE",

        amount:
            "HALF_MAX_HP"
    },


    ITEM_MAX_REVIVE:
    {
        category:
            "REVIVAL",

        behavior:
            "REVIVE",

        amount:
            "FULL"
    },


    ITEM_REVIVAL_HERB:
    {
        category:
            "REVIVAL",

        behavior:
            "REVIVE",

        amount:
            "FULL"
    },


    ITEM_SACRED_ASH:
    {
        category:
            "REVIVAL",

        behavior:
            "REVIVE_ALL",

        amount:
            "FULL",

        scope:
            "PARTY"
    },


    //================================
    // Battle stat boosts
    //================================

    ITEM_X_ATTACK:
    {
        category:
            "BATTLE_STAT",

        behavior:
            "RAISE_STAT_STAGE",

        stat:
            "ATTACK",

        stages:
            1,

        scope:
            "ACTIVE_BATTLER"
    },


    ITEM_X_DEFEND:
    {
        category:
            "BATTLE_STAT",

        behavior:
            "RAISE_STAT_STAGE",

        stat:
            "DEFENSE",

        stages:
            1,

        scope:
            "ACTIVE_BATTLER"
    },


    ITEM_X_SPEED:
    {
        category:
            "BATTLE_STAT",

        behavior:
            "RAISE_STAT_STAGE",

        stat:
            "SPEED",

        stages:
            1,

        scope:
            "ACTIVE_BATTLER"
    },


    ITEM_X_ACCURACY:
    {
        category:
            "BATTLE_STAT",

        behavior:
            "RAISE_STAT_STAGE",

        stat:
            "ACCURACY",

        stages:
            1,

        scope:
            "ACTIVE_BATTLER"
    },


    ITEM_X_SPECIAL:
    {
        category:
            "BATTLE_STAT",

        behavior:
            "RAISE_STAT_STAGE",

        stat:
            "SPECIAL_ATTACK",

        stages:
            1,

        scope:
            "ACTIVE_BATTLER"
    },


    //================================
    // Critical-hit support
    //================================

    ITEM_DIRE_HIT:
    {
        category:
            "BATTLE_CRITICAL",

        behavior:
            "FOCUS_ENERGY",

        scope:
            "ACTIVE_BATTLER"
    },


    //================================
    // Stat protection
    //================================

    ITEM_GUARD_SPEC:
    {
        category:
            "BATTLE_PROTECTION",

        behavior:
            "MIST",

        duration:
            5,

        scope:
            "SIDE"
    },


    //================================
    // Sellable items
    //================================

    ITEM_NUGGET:
    {
        category:
            "ECONOMY",

        behavior:
            "SELLABLE"
    }

};


module.exports =
    Gen3ItemBehaviors;
/**
 * Pokémon Companion
 * Friendship Service
 *
 * Manages individual Pokémon friendship.
 *
 * Responsibilities:
 * - Read Pokémon friendship.
 * - Initialize missing friendship.
 * - Set friendship.
 * - Change friendship.
 * - Clamp friendship to the Gen III range.
 * - Resolve friendship tiers.
 * - Apply Gen III friendship event rules.
 * - Apply Luxury Ball friendship bonus.
 * - Apply met-location friendship bonus.
 * - Resolve walking friendship checks.
 *
 * Does NOT:
 * - Manage items.
 * - Execute moves.
 * - Handle evolution.
 * - Manage inventory.
 * - Load ROM data.
 * - Manage battle state.
 * - Manage player movement.
 */

"use strict";


class FriendshipService
{


    constructor()
    {

        this.defaultFriendship =
            70;


        this.minimumFriendship =
            0;


        this.maximumFriendship =
            255;


        //--------------------------------
        // Gen III walking rule
        //--------------------------------

        this.walkingStepInterval =
            128;


        this.walkingChance =
            0.5;


        this.walkingIncrease =
            1;


        //--------------------------------
        // Gen III friendship evolution
        //--------------------------------

        this.evolutionThreshold =
            220;


        //--------------------------------
        // Daisy grooming
        //--------------------------------

        this.daisyGroomingIncrease =
            3;


    }


    //--------------------------------
    // Get friendship
    //--------------------------------

    getFriendship(
        pokemon
    )
    {

        if(
            !pokemon
        )
        {

            return this.defaultFriendship;

        }


        const friendship =
            Number(
                pokemon.friendship
            );


        if(
            !Number.isFinite(
                friendship
            )
        )
        {

            return this.defaultFriendship;

        }


        return this.clamp(
            friendship
        );

    }


    //--------------------------------
    // Initialize friendship
    //--------------------------------

    initialize(
        pokemon,
        friendship = this.defaultFriendship
    )
    {

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


        const previousFriendship =
            Object.prototype.hasOwnProperty.call(
                pokemon,
                "friendship"
            )
            ?
            this.getFriendship(
                pokemon
            )
            :
            null;


        const value =
            this.clamp(
                friendship
            );


        pokemon.friendship =
            value;


        return {

            success:
                true,

            previousFriendship,

            friendship:
                value

        };

    }


    //--------------------------------
    // Set friendship
    //--------------------------------

    setFriendship(
        pokemon,
        value
    )
    {

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


        const numericValue =
            Number(
                value
            );


        if(
            !Number.isFinite(
                numericValue
            )
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid friendship value"

            };

        }


        const previousFriendship =
            this.getFriendship(
                pokemon
            );


        const friendship =
            this.clamp(
                numericValue
            );


        pokemon.friendship =
            friendship;


        return {

            success:
                true,

            previousFriendship,

            friendship,

            change:
                friendship -
                previousFriendship

        };

    }


    //--------------------------------
    // Change friendship
    //--------------------------------

    changeFriendship(
        pokemon,
        amount,
        options = {}
    )
    {

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


        const numericAmount =
            Number(
                amount
            );


        if(
            !Number.isFinite(
                numericAmount
            )
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid friendship change"

            };

        }


        const previousFriendship =
            this.getFriendship(
                pokemon
            );


        //--------------------------------
        // Negative changes do not receive
        // positive friendship modifiers.
        //--------------------------------

        let finalAmount =
            numericAmount;


        if(
            finalAmount > 0
        )
        {

            finalAmount =
                this.applyPositiveModifiers(

                    pokemon,

                    finalAmount,

                    options

                );

        }


        const friendship =
            this.clamp(

                previousFriendship +
                finalAmount

            );


        pokemon.friendship =
            friendship;


        return {

            success:
                true,

            previousFriendship,

            requestedChange:
                numericAmount,

            change:
                friendship -
                previousFriendship,

            friendship

        };

    }


    //--------------------------------
    // Apply positive friendship
    // modifiers
    //--------------------------------

    applyPositiveModifiers(
        pokemon,
        amount,
        options = {}
    )
    {

        let result =
            Number(
                amount
            );


        if(
            !Number.isFinite(
                result
            )
            ||
            result <= 0
        )
        {

            return 0;

        }


        //--------------------------------
        // Luxury Ball
        //--------------------------------

        if(
            this.hasLuxuryBall(
                pokemon
            )
        )
        {

            result++;

        }


        //--------------------------------
        // Met-location bonus
        //--------------------------------

        if(
            options.metLocation ===
                true
            ||
            this.isAtMetLocation(
                pokemon,
                options.location
            )
        )
        {

            result++;

        }


        return result;

    }


    //--------------------------------
    // Apply a friendship event
    //--------------------------------

    applyEvent(
        pokemon,
        event,
        options = {}
    )
    {

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
            event
        )
        {

            case "LEVEL_UP":

                return this.applyLevelUp(
                    pokemon,
                    options
                );


            case "VITAMIN":

                return this.applyVitamin(
                    pokemon,
                    options
                );


            case "MAJOR_BATTLE":

                return this.applyMajorBattle(
                    pokemon,
                    options
                );


            case "BATTLE_ITEM":

                return this.applyBattleItem(
                    pokemon,
                    options
                );


            case "WALKING":

                return this.applyWalking(
                    pokemon,
                    options
                );


            case "DAISY_GROOMING":

                return this.applyDaisyGrooming(
                    pokemon,
                    options
                );


            case "FAINT":

                return this.applyFainting(
                    pokemon,
                    options
                );


            case "ENERGY_POWDER":

                return this.applyBitterMedicine(
                    pokemon,
                    "ENERGY_POWDER",
                    options
                );


            case "HEAL_POWDER":

                return this.applyBitterMedicine(
                    pokemon,
                    "HEAL_POWDER",
                    options
                );


            case "ENERGY_ROOT":

                return this.applyBitterMedicine(
                    pokemon,
                    "ENERGY_ROOT",
                    options
                );


            case "REVIVAL_HERB":

                return this.applyBitterMedicine(
                    pokemon,
                    "REVIVAL_HERB",
                    options
                );


            default:

                return {

                    success:
                        false,

                    reason:
                        `Unknown friendship event: ${event}`

                };

        }

    }


    //--------------------------------
    // Level up friendship
    //--------------------------------

    applyLevelUp(
        pokemon,
        options = {}
    )
    {

        const tier =
            this.getTier(
                pokemon
            );


        const amount =
            this.getTierAmount(

                tier,

                {
                    low:
                        5,

                    mid:
                        3,

                    high:
                        2

                }

            );


        const result =
            this.changeFriendship(

                pokemon,

                amount,

                options

            );


        return {

            ...result,

            event:
                "LEVEL_UP",

            tier,

            baseIncrease:
                amount

        };

    }


    //--------------------------------
    // Vitamin friendship
    //--------------------------------

    applyVitamin(
        pokemon,
        options = {}
    )
    {

        const tier =
            this.getTier(
                pokemon
            );


        const amount =
            this.getTierAmount(

                tier,

                {
                    low:
                        5,

                    mid:
                        3,

                    high:
                        2

                }

            );


        const result =
            this.changeFriendship(

                pokemon,

                amount,

                options

            );


        return {

            ...result,

            event:
                "VITAMIN",

            tier,

            baseIncrease:
                amount

        };

    }


    //--------------------------------
    // Major battle friendship
    //
    // Gym Leader / Elite Four /
    // Champion in Gen III.
    //--------------------------------

    applyMajorBattle(
        pokemon,
        options = {}
    )
    {

        const tier =
            this.getTier(
                pokemon
            );


        const amount =
            this.getTierAmount(

                tier,

                {
                    low:
                        3,

                    mid:
                        2,

                    high:
                        1

                }

            );


        const result =
            this.changeFriendship(

                pokemon,

                amount,

                options

            );


        return {

            ...result,

            event:
                "MAJOR_BATTLE",

            tier,

            baseIncrease:
                amount

        };

    }


    //--------------------------------
    // Battle item friendship
    //
    // X items, Dire Hit, Guard Spec.
    // In Gen III these give +1 when
    // friendship is below 200.
    //--------------------------------

    applyBattleItem(
        pokemon,
        options = {}
    )
    {

        const friendship =
            this.getFriendship(
                pokemon
            );


        if(
            friendship >= 200
        )
        {

            return {

                success:
                    true,

                event:
                    "BATTLE_ITEM",

                previousFriendship:
                    friendship,

                requestedChange:
                    0,

                change:
                    0,

                friendship,

                tier:
                    this.getTier(
                        pokemon
                    ),

                resultTier:
                    this.getTier(
                        pokemon
                    )

            };

        }


        const result =
            this.changeFriendship(

                pokemon,

                1,

                options

            );


        return {

            ...result,

            event:
                "BATTLE_ITEM",

            baseIncrease:
                1

        };

    }


    //--------------------------------
    // Walking friendship
    //
    // Caller supplies the number of
    // steps accumulated.
    //--------------------------------

    applyWalking(
        pokemon,
        options = {}
    )
    {

        const steps =
            Number(
                options.steps
            );


        if(
            !Number.isFinite(
                steps
            )
            ||
            steps <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid walking step count"

            };

        }


        const intervals =
            Math.floor(

                steps /
                this.walkingStepInterval

            );


        if(
            intervals <= 0
        )
        {

            return {

                success:
                    true,

                event:
                    "WALKING",

                steps,

                intervals:
                    0,

                triggered:
                    false,

                previousFriendship:
                    this.getFriendship(
                        pokemon
                    ),

                change:
                    0,

                friendship:
                    this.getFriendship(
                        pokemon
                    )

            };

        }


        const previousFriendship =
            this.getFriendship(
                pokemon
            );


        const changes =
            [];


        let friendship =
            previousFriendship;


        //--------------------------------
        // A 50% chance is evaluated for
        // each 128-step interval.
        //--------------------------------

        const random =
            typeof options.random ===
                "function"

            ?

            options.random

            :

            Math.random;


        for(
            let i = 0;
            i < intervals;
            i++
        )
        {

            if(
                random() >=
                    this.walkingChance
            )
            {

                continue;

            }


            const before =
                friendship;


            const amount =
                this.applyPositiveModifiers(

                    pokemon,

                    this.walkingIncrease,

                    options

                );


            friendship =
                this.clamp(

                    friendship +
                    amount

                );


            changes.push({

                previousFriendship:
                    before,

                baseIncrease:
                    this.walkingIncrease,

                appliedIncrease:
                    friendship -
                    before,

                friendship

            });

        }


        pokemon.friendship =
            friendship;


        return {

            success:
                true,

            event:
                "WALKING",

            steps,

            intervals,

            triggered:
                changes.length > 0,

            previousFriendship,

            change:
                friendship -
                previousFriendship,

            friendship,

            changes

        };

    }


    //--------------------------------
    // Daisy grooming
    //--------------------------------

    applyDaisyGrooming(
        pokemon,
        options = {}
    )
    {

        const result =
            this.changeFriendship(

                pokemon,

                this.daisyGroomingIncrease,

                options

            );


        return {

            ...result,

            event:
                "DAISY_GROOMING",

            baseIncrease:
                this.daisyGroomingIncrease

        };

    }


    //--------------------------------
    // Fainting friendship penalty
    //--------------------------------

    applyFainting(
        pokemon,
        options = {}
    )
    {

        const opponentLevel =
            Number(
                options.opponentLevel
            );


        const pokemonLevel =
            Number(
                options.pokemonLevel
            );


        //--------------------------------
        // Outside battle or invalid
        // opponent data uses the stronger
        // Gen III penalty.
        //--------------------------------

        let amount =
            -5;


        if(
            Number.isFinite(
                opponentLevel
            )
            &&
            Number.isFinite(
                pokemonLevel
            )
        )
        {

            const levelDifference =
                opponentLevel -
                pokemonLevel;


            if(
                levelDifference < 30
            )
            {

                amount =
                    -1;

            }
            else
            {

                amount =
                    -5;

            }

        }


        const result =
            this.changeFriendship(

                pokemon,

                amount,

                {}

            );


        return {

            ...result,

            event:
                "FAINT",

            baseChange:
                amount

        };

    }


    //--------------------------------
    // Bitter medicine
    //--------------------------------

    applyBitterMedicine(
        pokemon,
        medicine,
        options = {}
    )
    {

        const tier =
            this.getTier(
                pokemon
            );


        const amounts =
        {

            ENERGY_POWDER:
            {

                low:
                    -5,

                mid:
                    -5,

                high:
                    -10

            },


            HEAL_POWDER:
            {

                low:
                    -5,

                mid:
                    -5,

                high:
                    -10

            },


            ENERGY_ROOT:
            {

                low:
                    -10,

                mid:
                    -10,

                high:
                    -15

            },


            REVIVAL_HERB:
            {

                low:
                    -15,

                mid:
                    -15,

                high:
                    -20

            }

        };


        const definition =
            amounts[
                medicine
            ];


        if(
            !definition
        )
        {

            return {

                success:
                    false,

                reason:
                    `Unknown bitter medicine: ${medicine}`

            };

        }


        const amount =
            this.getTierAmount(

                tier,

                definition

            );


        const result =
            this.changeFriendship(

                pokemon,

                amount,

                {}

            );


        return {

            ...result,

            event:
                "BITTER_MEDICINE",

            medicine,

            tier,

            baseChange:
                amount

        };

    }


    //--------------------------------
    // Get tier amount
    //--------------------------------

    getTierAmount(
        tier,
        amounts
    )
    {

        switch(
            tier
        )
        {

            case "LOW":

                return Number(
                    amounts.low
                )
                ||
                0;


            case "MID":

                return Number(
                    amounts.mid
                )
                ||
                0;


            case "HIGH":

                return Number(
                    amounts.high
                )
                ||
                0;


            default:

                return 0;

        }

    }


    //--------------------------------
    // Get friendship tier
    //--------------------------------

    getTier(
        pokemon
    )
    {

        return this.getTierFromValue(

            this.getFriendship(
                pokemon
            )

        );

    }


    //--------------------------------
    // Get friendship tier from value
    //--------------------------------

    getTierFromValue(
        friendship
    )
    {

        const value =
            this.clamp(
                friendship
            );


        if(
            value < 100
        )
        {

            return "LOW";

        }


        if(
            value < 200
        )
        {

            return "MID";

        }


        return "HIGH";

    }


    //--------------------------------
    // Check evolution threshold
    //--------------------------------

    canEvolve(
        pokemon,
        threshold =
            this.evolutionThreshold
    )
    {

        const friendship =
            this.getFriendship(
                pokemon
            );


        const required =
            Number(
                threshold
            );


        return {

            allowed:

                friendship >=
                required,

            friendship,

            requiredFriendship:
                required,

            remaining:

                Math.max(

                    0,

                    required -
                    friendship

                )

        };

    }


    //--------------------------------
    // Check maximum friendship
    //--------------------------------

    isMax(
        pokemon
    )
    {

        return (

            this.getFriendship(
                pokemon
            )

            >=

            this.maximumFriendship

        );

    }


    //--------------------------------
    // Check minimum friendship
    //--------------------------------

    isMinimum(
        pokemon
    )
    {

        return (

            this.getFriendship(
                pokemon
            )

            <=

            this.minimumFriendship

        );

    }


    //--------------------------------
    // Luxury Ball check
    //--------------------------------

    hasLuxuryBall(
        pokemon
    )
    {

        if(
            !pokemon
        )
        {

            return false;

        }


        const ball =
            pokemon.ball
            ||
            pokemon.captureBall
            ||
            pokemon.ballConstant;


        if(
            !ball
        )
        {

            return false;

        }


        return (

            String(
                ball
            )
            .trim()
            .toUpperCase()

            ===

            "ITEM_LUXURY_BALL"

        );

    }


    //--------------------------------
    // Met-location check
    //--------------------------------

    isAtMetLocation(
        pokemon,
        currentLocation = null
    )
    {

        if(
            !pokemon
        )
        {

            return false;

        }


        const metLocation =
            pokemon.metLocation
            ||
            pokemon.location
            ||
            null;


        const location =
            currentLocation
            ||
            pokemon.currentLocation
            ||
            null;


        if(
            !metLocation
            ||
            !location
        )
        {

            return false;

        }


        return (

            String(
                metLocation
            )
            ===
            String(
                location
            )

        );

    }


    //--------------------------------
    // Clamp friendship
    //--------------------------------

    clamp(
        value
    )
    {

        const numericValue =
            Number(
                value
            );


        if(
            !Number.isFinite(
                numericValue
            )
        )
        {

            return this.defaultFriendship;

        }


        return Math.min(

            this.maximumFriendship,

            Math.max(

                this.minimumFriendship,

                Math.floor(
                    numericValue
                )

            )

        );

    }


}


module.exports =
    FriendshipService;
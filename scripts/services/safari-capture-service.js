/**
 * Pokémon Companion
 * Safari Capture Service
 *
 * Handles Pokémon FireRed Safari Zone capture mechanics.
 *
 * Responsibilities:
 * - Initialize Safari capture state.
 * - Calculate Safari catch probability.
 * - Calculate Safari flee probability.
 * - Apply Safari Bait.
 * - Apply Safari Rock.
 * - Manage Bait and Rock counters.
 * - Advance Safari state by turns.
 * - Compare Normal, Bait and Rock states.
 * - Provide Safari action summaries.
 * - Project Safari state across turns.
 *
 * Does NOT:
 * - Parse source files.
 * - Generate databases.
 * - Handle normal Poké Ball mechanics.
 * - Manage inventory.
 * - Manage money.
 * - Manage Safari Zone entry.
 * - Manage Safari Zone movement.
 */

"use strict";


const CaptureService =
    require("./capture-service");


class SafariCaptureService {


    //----------------------------------------
    // Create Safari capture service
    //----------------------------------------

    constructor(
        captureReference
    )
    {

        if(
            !captureReference
        )
        {

            throw new TypeError(
                "Capture reference data is required."
            );

        }


        if(
            !captureReference.safari
        )
        {

            throw new TypeError(
                "Safari capture reference data is required."
            );

        }


        this.reference =
            captureReference;

        this.safari =
            captureReference.safari;


        /*
         * Reuse the already verified normal
         * FireRed capture calculations.
         *
         * This service owns Safari state.
         * CaptureService owns the generic
         * FireRed catch/shake calculation.
         */

        this.captureService =
            new CaptureService(

                captureReference

            );

    }


    //----------------------------------------
    // Initialize Safari state
    //----------------------------------------

    initializeState(
        pokemon
    )
    {

        if(
            !pokemon
        )
        {

            throw new TypeError(
                "Pokemon is required."
            );

        }


        const catchRate =
            this.validateCatchRate(
                pokemon.catchRate
            );


        const safariFleeRate =
            this.validateSafariFleeRate(
                pokemon.safariZoneFleeRate
            );


        const catchFactor =
            this.calculateInitialCatchFactor(
                catchRate
            );


        const escapeFactor =
            this.calculateInitialEscapeFactor(
                safariFleeRate
            );


        return {

            pokemon:
                pokemon.species
                ??
                pokemon.name
                ??
                pokemon.id
                ??
                null,

            baseCatchFactor:
                catchFactor,

            baseEscapeFactor:
                escapeFactor,

            safariCatchFactor:
                catchFactor,

            safariEscapeFactor:
                escapeFactor,

            baitCounter:
                0,

            rockCounter:
                0,

            activeAction:
                "NONE",

            turn:
                0

        };

    }


    //----------------------------------------
    // Calculate Safari state
    //----------------------------------------

    calculate(
        state,
        options = {}
    )
    {

        this.validateState(
            state
        );


        const catchResult =
            this.calculateCatchChance(

                state,

                options

            );


        const fleeResult =
            this.calculateFleeChance(

                state

            );


        return {

            available:
                true,

            state,

            catch:
                catchResult,

            flee:
                fleeResult

        };

    }


    //----------------------------------------
    // Calculate Safari catch chance
    //----------------------------------------

    calculateCatchChance(
        state,
        options = {}
    )
    {

        this.validateState(
            state
        );


        const maxHP =
            this.validateHP(

                options.maxHP
                ??
                1,

                "maxHP"

            );


        const currentHP =
            this.validateCurrentHP(

                options.currentHP
                ??
                maxHP,

                maxHP

            );


        const status =
            this.captureService.normalizeStatus(

                options.status

            );


        const safariCatchFactor =
            this.validateSafariFactor(

                state.safariCatchFactor,

                "safariCatchFactor"

            );


        /*
         * FireRed converts the Safari catch
         * factor back into the catch-rate form
         * used by the normal capture formula.
         */

        const effectiveCatchRate =
            this.captureService.calculateSafariCatchRate(

                safariCatchFactor

            );


        /*
         * Safari Ball uses the FireRed
         * multiplier of 15, represented here
         * as 1.5x.
         */

        const ballMultiplier =
            1.5;


        const modifiedOdds =
            this.captureService.calculateModifiedOdds(

                effectiveCatchRate,

                ballMultiplier,

                currentHP,

                maxHP,

                status

            );


        //----------------------------------------
        // Automatic catch
        //----------------------------------------

        if(
            modifiedOdds >
            254
        )
        {

            return {

                available:
                    true,

                ball:
                    "ITEM_SAFARI_BALL",

                safariCatchFactor,

                catchRate:
                    effectiveCatchRate,

                maxHP,

                currentHP,

                status,

                ballMultiplier,

                modifiedOdds,

                shakeThreshold:
                    null,

                shakeChance:
                    1,

                captureChance:
                    1,

                capturePercentage:
                    100,

                guaranteed:
                    true

            };

        }


        const shakeThreshold =
            this.captureService.calculateShakeThreshold(

                modifiedOdds

            );


        const shakeChance =
            this.captureService.calculateShakeChance(

                shakeThreshold

            );


        const captureChance =
            Math.pow(

                shakeChance,

                3

            );


        return {

            available:
                true,

            ball:
                "ITEM_SAFARI_BALL",

            safariCatchFactor,

            catchRate:
                effectiveCatchRate,

            maxHP,

            currentHP,

            status,

            ballMultiplier,

            modifiedOdds,

            shakeThreshold,

            shakeChance,

            captureChance,

            capturePercentage:
                captureChance *
                100,

            guaranteed:
                false

        };

    }


    //----------------------------------------
    // Calculate Safari flee chance
    //----------------------------------------

    calculateFleeChance(
        state
    )
    {

        this.validateState(
            state
        );


        const escapeFactor =
            this.validateSafariFactor(

                state.safariEscapeFactor,

                "safariEscapeFactor"

            );


        let fleeRate =
            escapeFactor;


        //----------------------------------------
        // Rock active
        //----------------------------------------

        if(
            state.rockCounter >
            0
        )
        {

            fleeRate =
                Math.min(

                    20,

                    fleeRate *
                    2

                );

        }


        //----------------------------------------
        // Bait active
        //----------------------------------------

        else if(
            state.baitCounter >
            0
        )
        {

            fleeRate =
                Math.floor(

                    fleeRate /
                    4

                );


            if(
                fleeRate ===
                0
            )
            {

                fleeRate =
                    1;

            }

        }


        //----------------------------------------
        // Final FireRed multiplier
        //----------------------------------------

        fleeRate *=
            5;


        fleeRate =
            Math.min(

                100,

                fleeRate

            );


        return {

            available:
                true,

            safariEscapeFactor:
                escapeFactor,

            activeAction:
                this.getActiveAction(
                    state
                ),

            baitCounter:
                state.baitCounter,

            rockCounter:
                state.rockCounter,

            fleeRate,

            fleePercentage:
                fleeRate,

            willCheckThisTurn:
                true

        };

    }


    //----------------------------------------
    // Compare Safari actions
    //----------------------------------------

    compareActions(
        state,
        options = {}
    )
    {

        this.validateState(
            state
        );


        const normalState =
            this.createComparisonState(

                state,

                "NONE"

            );


        const baitState =
            this.createComparisonState(

                state,

                "BAIT"

            );


        const rockState =
            this.createComparisonState(

                state,

                "ROCK"

            );


        return {

            normal:
                this.calculate(

                    normalState,

                    options

                ),

            bait:
                this.calculate(

                    baitState,

                    options

                ),

            rock:
                this.calculate(

                    rockState,

                    options

                )

        };

    }


    //----------------------------------------
    // Get Safari action summary
    //----------------------------------------

    getActionSummary(
        state,
        options = {}
    )
    {

        this.validateState(
            state
        );


        const normalState =
            this.createComparisonState(

                state,

                "NONE"

            );


        const baitState =
            this.createComparisonState(

                state,

                "BAIT"

            );


        const rockState =
            this.createComparisonState(

                state,

                "ROCK"

            );


        const normal =
            this.calculate(

                normalState,

                options

            );


        const bait =
            this.calculate(

                baitState,

                options

            );


        const rock =
            this.calculate(

                rockState,

                options

            );


        return {

            normal:
            {

                action:
                    "NONE",

                catchPercentage:
                    normal.catch.capturePercentage,

                fleePercentage:
                    normal.flee.fleePercentage,

                catchFactor:
                    normal.state.safariCatchFactor,

                escapeFactor:
                    normal.state.safariEscapeFactor

            },


            bait:
            {

                action:
                    "BAIT",

                catchPercentage:
                    bait.catch.capturePercentage,

                fleePercentage:
                    bait.flee.fleePercentage,

                catchFactor:
                    bait.state.safariCatchFactor,

                escapeFactor:
                    bait.state.safariEscapeFactor,

                duration:
                {

                    minimum:
                        this.safari.bait.counter.minimum,

                    maximum:
                        this.safari.bait.counter.maximum

                }

            },


            rock:
            {

                action:
                    "ROCK",

                catchPercentage:
                    rock.catch.capturePercentage,

                fleePercentage:
                    rock.flee.fleePercentage,

                catchFactor:
                    rock.state.safariCatchFactor,

                escapeFactor:
                    rock.state.safariEscapeFactor,

                duration:
                {

                    minimum:
                        this.safari.rock.counter.minimum,

                    maximum:
                        this.safari.rock.counter.maximum

                }

            }

        };

    }


    //----------------------------------------
    // Create comparison state
    //----------------------------------------

    createComparisonState(
        state,
        action
    )
    {

        const comparison =
        {

            ...state,

            baitCounter:
                0,

            rockCounter:
                0,

            activeAction:
                "NONE"

        };


        //----------------------------------------
        // Bait
        //----------------------------------------

        if(
            action ===
            "BAIT"
        )
        {

            comparison.baitCounter =
                1;

            comparison.safariCatchFactor =
                this.applyBaitCatchFactor(

                    state.safariCatchFactor

                );

            comparison.activeAction =
                "BAIT";

        }


        //----------------------------------------
        // Rock
        //----------------------------------------

        else if(
            action ===
            "ROCK"
        )
        {

            comparison.rockCounter =
                1;

            comparison.safariCatchFactor =
                this.applyRockCatchFactor(

                    state.safariCatchFactor

                );

            comparison.activeAction =
                "ROCK";

        }


        return comparison;

    }


    //----------------------------------------
    // Apply Safari action
    //----------------------------------------

    applyAction(
        state,
        action
    )
    {

        this.validateState(
            state
        );


        const normalizedAction =
            String(
                action
            )
            .trim()
            .toUpperCase();


        const nextState =
        {

            ...state,

            baitCounter:
                state.baitCounter,

            rockCounter:
                state.rockCounter,

            turn:
                state.turn

        };


        //----------------------------------------
        // BAIT
        //----------------------------------------

        if(
            normalizedAction ===
            "BAIT"
        )
        {

            nextState.baitCounter =
                this.randomActionDuration();


            nextState.rockCounter =
                0;


            nextState.safariCatchFactor =
                this.applyBaitCatchFactor(

                    state.safariCatchFactor

                );


            nextState.activeAction =
                "BAIT";

        }


        //----------------------------------------
        // ROCK
        //----------------------------------------

        else if(
            normalizedAction ===
            "ROCK"
        )
        {

            nextState.rockCounter =
                this.randomActionDuration();


            nextState.baitCounter =
                0;


            nextState.safariCatchFactor =
                this.applyRockCatchFactor(

                    state.safariCatchFactor

                );


            nextState.activeAction =
                "ROCK";

        }
        else
        {

            throw new Error(

                `Unknown Safari action: ${action}`

            );

        }


        return nextState;

    }


    //----------------------------------------
    // Apply Bait catch factor
    //----------------------------------------

    applyBaitCatchFactor(
        catchFactor
    )
    {

        const factor =
            this.validateSafariFactor(

                catchFactor,

                "safariCatchFactor"

            );


        /*
         * FireRed:
         *
         * safariCatchFactor >>= 1
         *
         * minimum 3
         */

        return Math.max(

            3,

            Math.floor(
                factor /
                2
            )

        );

    }


    //----------------------------------------
    // Apply Rock catch factor
    //----------------------------------------

    applyRockCatchFactor(
        catchFactor
    )
    {

        const factor =
            this.validateSafariFactor(

                catchFactor,

                "safariCatchFactor"

            );


        /*
         * FireRed:
         *
         * safariCatchFactor <<= 1
         *
         * maximum 20
         */

        return Math.min(

            20,

            factor *
            2

        );

    }


    //----------------------------------------
    // Advance Safari turn
    //----------------------------------------

    advanceTurn(
        state
    )
    {

        this.validateState(
            state
        );


        const previousRockCounter =
            state.rockCounter;


        const nextState =
        {

            ...state,

            baitCounter:
                Math.max(

                    0,

                    state.baitCounter -
                    1

                ),

            rockCounter:
                Math.max(

                    0,

                    state.rockCounter -
                    1

                ),

            turn:
                state.turn +
                1

        };


        //----------------------------------------
        // Rock expiration
        //----------------------------------------

        if(
            previousRockCounter >
            0
            &&
            nextState.rockCounter ===
            0
        )
        {

            /*
             * FireRed resets the catch factor
             * when the Rock counter expires.
             */

            nextState.safariCatchFactor =
                nextState.baseCatchFactor;

        }


        /*
         * Bait expiration does NOT reset the
         * catch factor in the source logic.
         */

        nextState.activeAction =
            this.getActiveAction(

                nextState

            );


        return nextState;

    }


    //----------------------------------------
    // Project turns
    //----------------------------------------

    projectTurns(
        state,
        options = {}
    )
    {

        this.validateState(
            state
        );


        const turns =
            Number(
                options.turns
            );


        if(
            !Number.isInteger(
                turns
            )
            ||
            turns <
            0
        )
        {

            throw new RangeError(

                "turns must be a non-negative integer."

            );

        }


        const projection =
            [];


        let currentState =
        {
            ...state
        };


        //----------------------------------------
        // Include current state
        //----------------------------------------

        projection.push(

            this.createProjectionEntry(

                currentState,

                options

            )

        );


        //----------------------------------------
        // Advance requested turns
        //----------------------------------------

        for(
            let index = 0;

            index < turns;

            index++
        )
        {

            currentState =
                this.advanceTurn(

                    currentState

                );


            projection.push(

                this.createProjectionEntry(

                    currentState,

                    options

                )

            );

        }


        return projection;

    }


    //----------------------------------------
    // Create projection entry
    //----------------------------------------

    createProjectionEntry(
        state,
        options
    )
    {

        const result =
            this.calculate(

                state,

                options

            );


        return {

            turn:
                state.turn,

            activeAction:
                state.activeAction,

            baitCounter:
                state.baitCounter,

            rockCounter:
                state.rockCounter,

            safariCatchFactor:
                state.safariCatchFactor,

            safariEscapeFactor:
                state.safariEscapeFactor,

            catchPercentage:
                result.catch.capturePercentage,

            fleePercentage:
                result.flee.fleePercentage

        };

    }


    //----------------------------------------
    // Get active Safari action
    //----------------------------------------

    getActiveAction(
        state
    )
    {

        if(
            state.rockCounter >
            0
        )
        {

            return "ROCK";

        }


        if(
            state.baitCounter >
            0
        )
        {

            return "BAIT";

        }


        return "NONE";

    }


    //----------------------------------------
    // Generate action duration
    //----------------------------------------

    randomActionDuration()
    {

        /*
         * FireRed:
         *
         * Random() % 5 + 2
         *
         * Range:
         *
         * 2, 3, 4, 5, 6
         */

        return (

            Math.floor(

                Math.random() *
                5

            )
            +
            2

        );

    }


    //----------------------------------------
    // Calculate initial catch factor
    //----------------------------------------

    calculateInitialCatchFactor(
        catchRate
    )
    {

        /*
         * FireRed:
         *
         * catchRate * 100 / 1275
         */

        return Math.max(

            0,

            Math.floor(

                catchRate *
                100 /
                1275

            )

        );

    }


    //----------------------------------------
    // Calculate initial escape factor
    //----------------------------------------

    calculateInitialEscapeFactor(
        safariFleeRate
    )
    {

        /*
         * FireRed:
         *
         * safariZoneFleeRate * 100 / 1275
         *
         * minimum = 2
         */

        const factor =
            Math.floor(

                safariFleeRate *
                100 /
                1275

            );


        return Math.max(

            2,

            factor

        );

    }


    //----------------------------------------
    // Validate Safari state
    //----------------------------------------

    validateState(
        state
    )
    {

        if(
            !state
        )
        {

            throw new TypeError(

                "Safari state is required."

            );

        }


        this.validateSafariFactor(

            state.safariCatchFactor,

            "safariCatchFactor"

        );


        this.validateSafariFactor(

            state.safariEscapeFactor,

            "safariEscapeFactor"

        );


        this.validateCounter(

            state.baitCounter,

            "baitCounter"

        );


        this.validateCounter(

            state.rockCounter,

            "rockCounter"

        );

    }


    //----------------------------------------
    // Validate Safari factor
    //----------------------------------------

    validateSafariFactor(
        value,
        field
    )
    {

        const result =
            Number(
                value
            );


        if(
            !Number.isFinite(
                result
            )
            ||
            result <
            0
        )
        {

            throw new RangeError(

                `${field} must be a non-negative number.`

            );

        }


        return Math.floor(
            result
        );

    }


    //----------------------------------------
    // Validate counter
    //----------------------------------------

    validateCounter(
        value,
        field
    )
    {

        const result =
            Number(
                value
            );


        if(
            !Number.isInteger(
                result
            )
            ||
            result <
            0
            ||
            result >
            6
        )
        {

            throw new RangeError(

                `${field} must be an integer from 0 to 6.`

            );

        }


        return result;

    }


    //----------------------------------------
    // Validate catch rate
    //----------------------------------------

    validateCatchRate(
        value
    )
    {

        const result =
            Number(
                value
            );


        if(
            !Number.isFinite(
                result
            )
            ||
            result <
            0
        )
        {

            throw new RangeError(

                "catchRate must be a non-negative number."

            );

        }


        return Math.floor(
            result
        );

    }


    //----------------------------------------
    // Validate Safari flee rate
    //----------------------------------------

    validateSafariFleeRate(
        value
    )
    {

        const result =
            Number(
                value
            );


        if(
            !Number.isFinite(
                result
            )
            ||
            result <
            0
        )
        {

            throw new RangeError(

                "safariZoneFleeRate must be a non-negative number."

            );

        }


        return Math.floor(
            result
        );

    }


    //----------------------------------------
    // Validate HP
    //----------------------------------------

    validateHP(
        value,
        field
    )
    {

        const result =
            Number(
                value
            );


        if(
            !Number.isFinite(
                result
            )
            ||
            result <=
            0
        )
        {

            throw new RangeError(

                `${field} must be greater than 0.`

            );

        }


        return Math.floor(
            result
        );

    }


    //----------------------------------------
    // Validate current HP
    //----------------------------------------

    validateCurrentHP(
        value,
        maxHP
    )
    {

        const result =
            Number(
                value
            );


        if(
            !Number.isFinite(
                result
            )
        )
        {

            throw new RangeError(

                "currentHP must be a number."

            );

        }


        return Math.min(

            maxHP,

            Math.max(

                0,

                Math.floor(
                    result
                )

            )

        );

    }


}


module.exports =
    SafariCaptureService;
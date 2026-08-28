/**
 * Pokémon Companion
 * Capture Service
 *
 * Calculates and processes normal Pokémon capture attempts
 * using Pokémon FireRed / Generation III mechanics.
 *
 * Responsibilities:
 * - Calculate FireRed capture odds.
 * - Resolve Poké Ball multipliers.
 * - Apply HP modifiers.
 * - Apply status modifiers.
 * - Calculate shake probability.
 * - Calculate final capture probability.
 * - Process normal capture attempts.
 *
 * Does NOT:
 * - Parse source files.
 * - Generate databases.
 * - Handle Safari Zone state.
 * - Handle Bait or Rock.
 * - Handle Safari flee mechanics.
 * - Handle battles.
 * - Manage inventory.
 * - Manage party storage.
 * - Load ROM data.
 */

"use strict";


class CaptureService {


    //----------------------------------------
    // Create capture service
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


        this.reference =
            captureReference;


        /*
         * Capture references are organized as:
         *
         * reference.balls
         *
         * The fallback keeps compatibility with
         * older references that stored ball data
         * directly at the root.
         */

        this.balls =
            captureReference.balls
            ??
            captureReference;

    }


    //----------------------------------------
    // Calculate capture probability
    //----------------------------------------

    calculate(
        options = {}
    )
    {

        const catchRate =
            this.validateCatchRate(
                options.catchRate
            );


        const maxHP =
            this.validateHP(
                options.maxHP,
                "maxHP"
            );


        const currentHP =
            this.validateCurrentHP(
                options.currentHP,
                maxHP
            );


        const status =
            this.normalizeStatus(
                options.status
            );


        const ballConstant =
            this.normalizeBallConstant(
                options.ball
            );


        const ball =
            this.getBall(
                ballConstant
            );


        if(
            !ball
        )
        {

            throw new Error(

                `Unknown capture ball: ${options.ball}`

            );

        }


        //----------------------------------------
        // Master Ball
        //----------------------------------------

        if(
            ball.guaranteed
        )
        {

            return {

                ball:
                    ball.itemConstant,

                available:
                    true,

                catchRate,

                maxHP,

                currentHP,

                status,

                ballMultiplier:
                    null,

                modifiedOdds:
                    255,

                shakeThreshold:
                    null,

                shakeChance:
                    1,

                shakesRequired:
                    3,

                captureChance:
                    1,

                capturePercentage:
                    100,

                guaranteed:
                    true

            };

        }


        //----------------------------------------
        // Safari Ball catch factor
        //----------------------------------------

        let effectiveCatchRate =
            catchRate;


        /*
         * Safari Ball is retained here because it
         * is still a capture ball.
         *
         * Safari Zone state itself belongs to
         * SafariCaptureService.
         */

        if(
            ball.usesSafariCatchFactor
        )
        {

            if(
                options.safariCatchFactor ===
                    undefined
                ||
                options.safariCatchFactor ===
                    null
            )
            {

                throw new Error(

                    "Safari Ball requires safariCatchFactor."

                );

            }


            effectiveCatchRate =
                this.calculateSafariCatchRate(

                    options.safariCatchFactor

                );

        }


        //----------------------------------------
        // Ball multiplier
        //----------------------------------------

        const ballMultiplier =
            this.calculateBallMultiplier(

                ball,

                {

                    level:
                        options.level,

                    targetTypes:
                        this.getTargetTypes(
                            options
                        ),

                    alreadyCaught:
                        Boolean(
                            options.alreadyCaught
                        ),

                    underwater:
                        Boolean(
                            options.underwater
                        ),

                    battleTurn:
                        options.battleTurn

                }

            );


        //----------------------------------------
        // FireRed odds
        //----------------------------------------

        const modifiedOdds =
            this.calculateModifiedOdds(

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

                ball:
                    ball.itemConstant,

                available:
                    true,

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

                shakesRequired:
                    3,

                captureChance:
                    1,

                capturePercentage:
                    100,

                guaranteed:
                    true

            };

        }


        //----------------------------------------
        // Calculate shake threshold
        //----------------------------------------

        const shakeThreshold =
            this.calculateShakeThreshold(

                modifiedOdds

            );


        //----------------------------------------
        // One-shake probability
        //----------------------------------------

        const shakeChance =
            this.calculateShakeChance(

                shakeThreshold

            );


        //----------------------------------------
        // Three successful shakes
        //----------------------------------------

        const captureChance =
            Math.pow(

                shakeChance,

                3

            );


        return {

            ball:
                ball.itemConstant,

            available:
                true,

            catchRate:
                effectiveCatchRate,

            maxHP,

            currentHP,

            status,

            ballMultiplier,

            modifiedOdds,

            shakeThreshold,

            shakeChance,

            shakesRequired:
                3,

            captureChance,

            capturePercentage:
                captureChance *
                100,

            guaranteed:
                false

        };

    }


    //----------------------------------------
    // Calculate all capture balls
    //----------------------------------------

    calculateForAllBalls(
        options = {}
    )
    {

        return this.getAllBalls().map(

            ball =>
            {

                //--------------------------------
                // Safari Ball needs Safari context
                //--------------------------------

                if(
                    ball.usesSafariCatchFactor
                    &&
                    (
                        options.safariCatchFactor ===
                            undefined
                        ||
                        options.safariCatchFactor ===
                            null
                    )
                )
                {

                    return {

                        ball:
                            ball.itemConstant,

                        available:
                            false,

                        reason:
                            "Safari Ball requires safariCatchFactor."

                    };

                }


                //--------------------------------
                // Calculate normally
                //--------------------------------

                try
                {

                    return this.calculate(

                        {

                            ...options,

                            ball:
                                ball.itemConstant

                        }

                    );

                }
                catch(
                    error
                )
                {

                    return {

                        ball:
                            ball.itemConstant,

                        available:
                            false,

                        reason:
                            error.message

                    };

                }

            }

        );

    }


    //----------------------------------------
    // Calculate ball multiplier
    //----------------------------------------

    calculateBallMultiplier(
        ball,
        options = {}
    )
    {

        if(
            ball.guaranteed
        )
        {

            return null;

        }


        //----------------------------------------
        // Standard multiplier
        //----------------------------------------

        if(
            ball.multiplier !==
                undefined
            &&
            ball.type !==
                "CONDITIONAL"
            &&
            ball.type !==
                "LEVEL_BASED"
            &&
            ball.type !==
                "TURN_BASED"
        )
        {

            return Number(
                ball.multiplier
            );

        }


        //----------------------------------------
        // Conditional multiplier
        //----------------------------------------

        if(
            ball.type ===
            "CONDITIONAL"
        )
        {

            return this.calculateConditionalMultiplier(

                ball,

                options

            );

        }


        //----------------------------------------
        // Level-based multiplier
        //----------------------------------------

        if(
            ball.type ===
            "LEVEL_BASED"
        )
        {

            return this.calculateLevelMultiplier(

                ball,

                options

            );

        }


        //----------------------------------------
        // Turn-based multiplier
        //----------------------------------------

        if(
            ball.type ===
            "TURN_BASED"
        )
        {

            return this.calculateTurnMultiplier(

                ball,

                options

            );

        }


        //----------------------------------------
        // Safari Ball
        //----------------------------------------

        if(
            ball.type ===
            "SAFARI"
        )
        {

            return Number(

                ball.multiplier
                ??
                1.5

            );

        }


        //----------------------------------------
        // Default
        //----------------------------------------

        return Number(

            ball.defaultMultiplier
            ??
            ball.multiplier
            ??
            1

        );

    }


    //----------------------------------------
    // Calculate conditional multiplier
    //----------------------------------------

    calculateConditionalMultiplier(
        ball,
        options
    )
    {

        let multiplier =
            Number(

                ball.defaultMultiplier
                ??
                1

            );


        if(
            !Array.isArray(
                ball.conditions
            )
        )
        {

            return multiplier;

        }


        for(
            const condition of
                ball.conditions
        )
        {

            if(
                this.conditionMatches(

                    condition.condition,

                    options

                )
            )
            {

                multiplier =
                    Number(
                        condition.multiplier
                    );

                break;

            }

        }


        return multiplier;

    }


    //----------------------------------------
    // Match conditional rule
    //----------------------------------------

    conditionMatches(
        condition,
        options
    )
    {

        switch(
            condition
        )
        {

            case "TARGET_TYPE_WATER_OR_BUG":

                return (

                    this.hasTargetType(

                        options.targetTypes,

                        "Water"

                    )

                    ||

                    this.hasTargetType(

                        options.targetTypes,

                        "Bug"

                    )

                );


            case "UNDERWATER":

                return Boolean(
                    options.underwater
                );


            case "TARGET_ALREADY_CAUGHT":

                return Boolean(
                    options.alreadyCaught
                );


            default:

                return false;

        }

    }


    //----------------------------------------
    // Calculate Nest Ball multiplier
    //----------------------------------------

    calculateLevelMultiplier(
        ball,
        options
    )
    {

        const level =
            Number(
                options.level
            );


        if(
            !Number.isFinite(
                level
            )
        )
        {

            return Number(

                ball.defaultMultiplier
                ??
                1

            );

        }


        //----------------------------------------
        // FireRed:
        //
        // level < 40
        //     multiplier = 40 - level
        //     minimum source value = 10
        //
        // level >= 40
        //     multiplier = 10
        //
        // Our reference stores the multiplier
        // as 1x based units, so divide by 10.
        //----------------------------------------

        if(
            level >=
            40
        )
        {

            return Number(

                ball.defaultMultiplier
                ??
                1

            );

        }


        let multiplier =
            40 -
            Math.floor(
                level
            );


        if(
            ball.minimumMultiplier !==
                undefined
        )
        {

            multiplier =
                Math.max(

                    multiplier,

                    Number(
                        ball.minimumMultiplier
                    )

                );

        }


        return multiplier /
            10;

    }


    //----------------------------------------
    // Calculate Timer Ball multiplier
    //----------------------------------------

    calculateTurnMultiplier(
        ball,
        options
    )
    {

        const battleTurn =
            Math.max(

                0,

                Number(
                    options.battleTurn
                )
                ||
                0

            );


        /*
         * FireRed:
         *
         * ballMultiplier =
         * battleTurnCounter + 10;
         *
         * maximum = 40
         *
         * Source value / 10 gives
         * the effective multiplier.
         */

        let multiplier =
            (
                battleTurn +
                10
            )
            /
            10;


        if(
            ball.maximumMultiplier !==
                undefined
        )
        {

            multiplier =
                Math.min(

                    multiplier,

                    Number(
                        ball.maximumMultiplier
                    )

                );

        }


        return multiplier;

    }


    //----------------------------------------
    // Calculate FireRed modified odds
    //----------------------------------------

    calculateModifiedOdds(
        catchRate,
        ballMultiplier,
        currentHP,
        maxHP,
        status
    )
    {

        /*
         * FireRed:
         *
         * odds =
         *     (catchRate * ballMultiplier / 10)
         *     *
         *     (maxHP * 3 - hp * 2)
         *     /
         *     (3 * maxHP);
         *
         * Our ball multipliers are normalized:
         *
         * Poké Ball  = 1
         * Great Ball = 1.5
         * Ultra Ball = 2
         *
         * Therefore convert back to FireRed's
         * integer source representation first.
         */

        const sourceBallMultiplier =
            Math.round(

                ballMultiplier *
                10

            );


        //----------------------------------------
        // First term
        //----------------------------------------

        const firstTerm =
            Math.floor(

                catchRate *
                sourceBallMultiplier /
                10

            );


        //----------------------------------------
        // HP factor
        //----------------------------------------

        const hpNumerator =
            (
                maxHP * 3
            )
            -
            (
                currentHP * 2
            );


        const hpDenominator =
            3 *
            maxHP;


        let odds =
            Math.floor(

                firstTerm *
                hpNumerator /
                hpDenominator

            );


        //----------------------------------------
        // Sleep / Freeze
        //----------------------------------------

        if(
            status ===
            "SLEEP"
            ||
            status ===
            "FREEZE"
        )
        {

            odds =
                odds *
                2;

        }


        //----------------------------------------
        // Poison / Burn / Paralysis / Toxic
        //----------------------------------------

        else if(
            status ===
            "POISON"
            ||
            status ===
            "BURN"
            ||
            status ===
            "PARALYSIS"
            ||
            status ===
            "TOXIC"
        )
        {

            odds =
                Math.floor(

                    odds *
                    15 /
                    10

                );

        }


        //----------------------------------------
        // Keep FireRed odds integer
        //----------------------------------------

        return Math.max(

            0,

            Math.floor(
                odds
            )

        );

    }


    //----------------------------------------
    // Calculate FireRed shake threshold
    //----------------------------------------

    calculateShakeThreshold(
        odds
    )
    {

        if(
            odds <=
            0
        )
        {

            return 0;

        }


        /*
         * FireRed:
         *
         * odds = Sqrt(Sqrt(16711680 / odds));
         * odds = 1048560 / odds;
         *
         * The C implementation stores the
         * intermediate results as integers.
         */

        const firstDivision =
            Math.floor(

                16711680 /
                odds

            );


        const firstSquareRoot =
            Math.floor(

                Math.sqrt(
                    firstDivision
                )

            );


        const secondSquareRoot =
            Math.floor(

                Math.sqrt(
                    firstSquareRoot
                )

            );


        if(
            secondSquareRoot <=
            0
        )
        {

            return 65535;

        }


        const threshold =
            Math.floor(

                1048560 /
                secondSquareRoot

            );


        return Math.max(

            0,

            Math.min(

                65535,

                threshold

            )

        );

    }


    //----------------------------------------
    // Calculate one-shake probability
    //----------------------------------------

    calculateShakeChance(
        threshold
    )
    {

        if(
            threshold <=
            0
        )
        {

            return 0;

        }


        if(
            threshold >=
            65536
        )
        {

            return 1;

        }


        /*
         * FireRed:
         *
         * Random() < odds
         *
         * Random() is a 16-bit value:
         * 0 through 65535.
         */

        return (

            threshold /
            65536

        );

    }


    //----------------------------------------
    // Generate FireRed-compatible random
    //----------------------------------------

    random16()
    {

        return Math.floor(

            Math.random() *
            65536

        );

    }


    //----------------------------------------
    // Calculate Safari Ball catch rate
    //----------------------------------------

    calculateSafariCatchRate(
        safariCatchFactor
    )
    {

        const factor =
            this.validateSafariFactor(

                safariCatchFactor,

                "safariCatchFactor"

            );


        /*
         * FireRed:
         *
         * catchRate =
         * safariCatchFactor * 1275 / 100;
         */

        return Math.min(

            255,

            Math.floor(

                factor *
                1275 /
                100

            )

        );

    }


    //----------------------------------------
    // Get all capture balls
    //----------------------------------------

    getAllBalls()
    {

        const balls =
            [];


        //----------------------------------------
        // Standard balls
        //----------------------------------------

        if(
            Array.isArray(
                this.balls.standardBalls
            )
        )
        {

            for(
                const ball of
                    this.balls.standardBalls
            )
            {

                this.addUniqueBall(

                    balls,

                    ball

                );

            }

        }


        //----------------------------------------
        // Conditional balls
        //----------------------------------------

        if(
            Array.isArray(
                this.balls.conditionalBalls
            )
        )
        {

            for(
                const ball of
                    this.balls.conditionalBalls
            )
            {

                this.addUniqueBall(

                    balls,

                    ball

                );

            }

        }


        //----------------------------------------
        // Master Ball
        //----------------------------------------

        if(
            this.balls.masterBall
        )
        {

            this.addUniqueBall(

                balls,

                this.balls.masterBall

            );

        }


        return balls;

    }


    //----------------------------------------
    // Add unique ball
    //----------------------------------------

    addUniqueBall(
        balls,
        ball
    )
    {

        if(
            !ball
        )
        {

            return;

        }


        if(
            balls.some(

                entry =>
                    entry.itemConstant ===
                    ball.itemConstant

            )
        )
        {

            return;

        }


        balls.push(
            ball
        );

    }


    //----------------------------------------
    // Get capture ball
    //----------------------------------------

    getBall(
        constant
    )
    {

        const normalized =
            this.normalizeBallConstant(

                constant

            );


        if(
            !normalized
        )
        {

            return null;

        }


        //----------------------------------------
        // Master Ball
        //----------------------------------------

        if(
            this.balls.masterBall
            &&
            this.balls.masterBall.itemConstant ===
                normalized
        )
        {

            return {

                ...this.balls.masterBall,

                guaranteed:
                    true

            };

        }


        //----------------------------------------
        // Standard balls
        //----------------------------------------

        if(
            Array.isArray(
                this.balls.standardBalls
            )
        )
        {

            const standard =
                this.balls.standardBalls.find(

                    ball =>
                        ball.itemConstant ===
                        normalized

                );


            if(
                standard
            )
            {

                return standard;

            }

        }


        //----------------------------------------
        // Conditional balls
        //----------------------------------------

        if(
            Array.isArray(
                this.balls.conditionalBalls
            )
        )
        {

            const conditional =
                this.balls.conditionalBalls.find(

                    ball =>
                        ball.itemConstant ===
                        normalized

                );


            if(
                conditional
            )
            {

                return conditional;

            }

        }


        return null;

    }


    //----------------------------------------
    // Normalize ball constant
    //----------------------------------------

    normalizeBallConstant(
        ball
    )
    {

        if(
            !ball
        )
        {

            return "ITEM_POKE_BALL";

        }


        const value =
            String(
                ball
            )
            .trim()
            .toUpperCase();


        const aliases =
        {

            POKEBALL:
                "ITEM_POKE_BALL",

            POKE_BALL:
                "ITEM_POKE_BALL",

            ITEM_POKE_BALL:
                "ITEM_POKE_BALL",

            GREATBALL:
                "ITEM_GREAT_BALL",

            GREAT_BALL:
                "ITEM_GREAT_BALL",

            ITEM_GREAT_BALL:
                "ITEM_GREAT_BALL",

            ULTRABALL:
                "ITEM_ULTRA_BALL",

            ULTRA_BALL:
                "ITEM_ULTRA_BALL",

            ITEM_ULTRA_BALL:
                "ITEM_ULTRA_BALL",

            MASTERBALL:
                "ITEM_MASTER_BALL",

            MASTER_BALL:
                "ITEM_MASTER_BALL",

            ITEM_MASTER_BALL:
                "ITEM_MASTER_BALL",

            SAFARIBALL:
                "ITEM_SAFARI_BALL",

            SAFARI_BALL:
                "ITEM_SAFARI_BALL",

            ITEM_SAFARI_BALL:
                "ITEM_SAFARI_BALL",

            NETBALL:
                "ITEM_NET_BALL",

            NET_BALL:
                "ITEM_NET_BALL",

            ITEM_NET_BALL:
                "ITEM_NET_BALL",

            DIVEBALL:
                "ITEM_DIVE_BALL",

            DIVE_BALL:
                "ITEM_DIVE_BALL",

            ITEM_DIVE_BALL:
                "ITEM_DIVE_BALL",

            NESTBALL:
                "ITEM_NEST_BALL",

            NEST_BALL:
                "ITEM_NEST_BALL",

            ITEM_NEST_BALL:
                "ITEM_NEST_BALL",

            REPEATBALL:
                "ITEM_REPEAT_BALL",

            REPEAT_BALL:
                "ITEM_REPEAT_BALL",

            ITEM_REPEAT_BALL:
                "ITEM_REPEAT_BALL",

            TIMERBALL:
                "ITEM_TIMER_BALL",

            TIMER_BALL:
                "ITEM_TIMER_BALL",

            ITEM_TIMER_BALL:
                "ITEM_TIMER_BALL",

            LUXURYBALL:
                "ITEM_LUXURY_BALL",

            LUXURY_BALL:
                "ITEM_LUXURY_BALL",

            ITEM_LUXURY_BALL:
                "ITEM_LUXURY_BALL",

            PREMIERBALL:
                "ITEM_PREMIER_BALL",

            PREMIER_BALL:
                "ITEM_PREMIER_BALL",

            ITEM_PREMIER_BALL:
                "ITEM_PREMIER_BALL"

        };


        return (

            aliases[value]
            ||
            value

        );

    }


    //----------------------------------------
    // Normalize status
    //----------------------------------------

    normalizeStatus(
        status
    )
    {

        if(
            !status
        )
        {

            return "NONE";

        }


        const value =
            String(
                status
            )
            .trim()
            .toUpperCase();


        const aliases =
        {

            NONE:
                "NONE",

            NORMAL:
                "NONE",

            ASLEEP:
                "SLEEP",

            SLEEP:
                "SLEEP",

            FROZEN:
                "FREEZE",

            FREEZE:
                "FREEZE",

            POISONED:
                "POISON",

            POISON:
                "POISON",

            BURNED:
                "BURN",

            BURN:
                "BURN",

            PARALYZED:
                "PARALYSIS",

            PARALYSIS:
                "PARALYSIS",

            TOXIC_POISON:
                "TOXIC",

            TOXIC:
                "TOXIC"

        };


        return (

            aliases[value]
            ||
            value

        );

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
            result < 0
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
    // Validate maximum HP
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


    //----------------------------------------
    // Validate Safari factor
    //----------------------------------------

    validateSafariFactor(
        value,
        field = "safariCatchFactor"
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
            result < 0
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
    // Get target types
    //----------------------------------------

    getTargetTypes(
        options
    )
    {

        if(
            Array.isArray(
                options.targetTypes
            )
        )
        {

            return options.targetTypes;

        }


        if(
            options.pokemon
        )
        {

            return this.getTargetTypesFromPokemon(

                options.pokemon

            );

        }


        return [];

    }


    //----------------------------------------
    // Get target types from Pokémon
    //----------------------------------------

    getTargetTypesFromPokemon(
        pokemon
    )
    {

        if(
            !pokemon
        )
        {

            return [];

        }


        if(
            Array.isArray(
                pokemon.types
            )
        )
        {

            return pokemon.types;

        }


        const types =
            [];


        if(
            pokemon.type1
        )
        {

            types.push(
                pokemon.type1
            );

        }


        if(
            pokemon.type2
        )
        {

            types.push(
                pokemon.type2
            );

        }


        return types;

    }


    //----------------------------------------
    // Check target type
    //----------------------------------------

    hasTargetType(
        types,
        expected
    )
    {

        if(
            !Array.isArray(
                types
            )
        )
        {

            return false;

        }


        return types.some(

            type =>
            {

                if(
                    typeof type ===
                    "string"
                )
                {

                    return (

                        type.toLowerCase() ===
                        expected.toLowerCase()

                    );

                }


                if(
                    type
                    &&
                    typeof type.name ===
                        "string"
                )
                {

                    return (

                        type.name.toLowerCase() ===
                        expected.toLowerCase()

                    );

                }


                return false;

            }

        );

    }


    //----------------------------------------
    // Get Pokémon identifier
    //----------------------------------------

    getPokemonIdentifier(
        pokemon
    )
    {

        return (

            pokemon.species
            ??
            pokemon.name
            ??
            pokemon.constant
            ??
            pokemon.id
            ??
            null

        );

    }


    //----------------------------------------
    // Attempt normal capture
    //----------------------------------------

    attemptCapture(
        pokemon,
        ball = "ITEM_POKE_BALL",
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

                captured:
                    false,

                reason:
                    "Missing Pokemon"

            };

        }


        //----------------------------------------
        // Build calculation options
        //----------------------------------------

        const calculationOptions =
        {

            ...options,

            ball,

            catchRate:
                options.catchRate ??
                pokemon.catchRate,

            currentHP:
                options.currentHP ??
                pokemon.currentHP ??
                pokemon.hp,

            maxHP:
                options.maxHP ??
                pokemon.maxHP,

            level:
                options.level ??
                pokemon.level,

            targetTypes:
                options.targetTypes ??
                this.getTargetTypesFromPokemon(

                    pokemon

                )

        };


        //----------------------------------------
        // Calculate
        //----------------------------------------

        let result;


        try
        {

            result =
                this.calculate(

                    calculationOptions

                );

        }
        catch(
            error
        )
        {

            return {

                success:
                    false,

                captured:
                    false,

                pokemon:
                    this.getPokemonIdentifier(
                        pokemon
                    ),

                ball:
                    this.normalizeBallConstant(
                        ball
                    ),

                reason:
                    error.message

            };

        }


        //----------------------------------------
        // Guaranteed capture
        //----------------------------------------

        if(
            result.guaranteed
        )
        {

            return {

                success:
                    true,

                captured:
                    true,

                pokemon:
                    this.getPokemonIdentifier(
                        pokemon
                    ),

                ball:
                    result.ball,

                chance:
                    result.capturePercentage,

                roll:
                    null,

                shakes:
                    3,

                result

            };

        }


        //----------------------------------------
        // Perform three shake checks
        //----------------------------------------

        let shakes =
            0;


        for(
            let index = 0;

            index < 3;

            index++
        )
        {

            const roll =
                this.random16();


            if(
                roll <
                result.shakeThreshold
            )
            {

                shakes++;

            }
            else
            {

                break;

            }

        }


        const captured =
            shakes === 3;


        return {

            success:
                true,

            captured,

            pokemon:
                this.getPokemonIdentifier(
                    pokemon
                ),

            ball:
                result.ball,

            chance:
                result.capturePercentage,

            roll:
                null,

            shakes,

            result

        };

    }


    //----------------------------------------
    // Calculate legacy capture chance
    //----------------------------------------

    calculateChance(
        pokemon,
        ball = "ITEM_POKE_BALL",
        options = {}
    )
    {

        if(
            !pokemon
        )
        {

            return 0;

        }


        const result =
            this.calculate(

                {

                    ...options,

                    ball,

                    catchRate:
                        options.catchRate ??
                        pokemon.catchRate,

                    currentHP:
                        options.currentHP ??
                        pokemon.currentHP ??
                        pokemon.hp,

                    maxHP:
                        options.maxHP ??
                        pokemon.maxHP,

                    level:
                        options.level ??
                        pokemon.level,

                    targetTypes:
                        options.targetTypes ??
                        this.getTargetTypesFromPokemon(

                            pokemon

                        )

                }

            );


        return result.capturePercentage;

    }


    //----------------------------------------
    // Create capture summary
    //----------------------------------------

    createSummary(
        pokemon,
        result
    )
    {

        return {

            pokemon:
                this.getPokemonIdentifier(
                    pokemon
                ),

            captured:
                Boolean(
                    result.captured
                ),

            ball:
                result.ball,

            chance:
                result.chance
                ??
                result.result?.capturePercentage
                ??
                0,

            shakes:
                result.shakes
                ??
                null

        };

    }


}


module.exports =
    CaptureService;
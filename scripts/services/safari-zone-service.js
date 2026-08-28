/**
 * Pokémon Companion
 * Safari Zone Service
 *
 * Handles Pokémon FireRed Safari Zone session mechanics.
 *
 * Responsibilities:
 * - Check Safari Zone entry requirements.
 * - Process Safari Zone entry.
 * - Track Safari Zone steps.
 * - Track Safari Balls.
 * - Track active Safari Zone sessions.
 * - Consume Safari Zone steps.
 * - Consume Safari Balls.
 * - End Safari Zone sessions.
 *
 * Does NOT:
 * - Calculate Pokémon capture probability.
 * - Handle Bait.
 * - Handle Rock.
 * - Calculate flee probability.
 * - Manage general inventory.
 * - Manage general money.
 * - Handle VS Seeker.
 * - Handle trainer battles.
 */

"use strict";


class SafariZoneService {


    //----------------------------------------
    // Create Safari Zone service
    //----------------------------------------

    constructor(
        options = {}
    )
    {

        this.entryFee =
            options.entryFee
            ??
            500;


        this.maximumSteps =
            options.maximumSteps
            ??
            600;


        this.startingSafariBalls =
            options.startingSafariBalls
            ??
            30;

    }


    //----------------------------------------
    // Get Safari Zone configuration
    //----------------------------------------

    getConfiguration()
    {

        return {

            entryFee:
                this.entryFee,

            maximumSteps:
                this.maximumSteps,

            startingSafariBalls:
                this.startingSafariBalls

        };

    }


    //----------------------------------------
    // Check entry eligibility
    //----------------------------------------

    canEnter(
        trainerState
    )
    {

        const money =
            this.getTrainerMoney(
                trainerState
            );


        return {

            allowed:
                money >=
                this.entryFee,

            money,

            entryFee:
                this.entryFee,

            shortfall:
                Math.max(

                    0,

                    this.entryFee -
                    money

                )

        };

    }


    //----------------------------------------
    // Enter Safari Zone
    //----------------------------------------

    enter(
        trainerState
    )
    {

        const eligibility =
            this.canEnter(
                trainerState
            );


        if(
            !eligibility.allowed
        )
        {

            return {

                success:
                    false,

                reason:
                    "NOT_ENOUGH_MONEY",

                money:
                    eligibility.money,

                entryFee:
                    eligibility.entryFee,

                shortfall:
                    eligibility.shortfall

            };

        }


        this.removeMoney(

            trainerState,

            this.entryFee

        );


        return {

            success:
                true,

            session:
            {

                active:
                    true,

                stepsRemaining:
                    this.maximumSteps,

                stepsUsed:
                    0,

                safariBallsRemaining:
                    this.startingSafariBalls,

                safariBallsUsed:
                    0

            }

        };

    }


    //----------------------------------------
    // Check whether session is active
    //----------------------------------------

    isActive(
        session
    )
    {

        return Boolean(

            session
            &&
            session.active === true

        );

    }


    //----------------------------------------
    // Get session summary
    //----------------------------------------

    getSessionSummary(
        session
    )
    {

        this.validateSession(
            session
        );


        return {

            active:
                session.active,

            stepsRemaining:
                session.stepsRemaining,

            stepsUsed:
                session.stepsUsed,

            safariBallsRemaining:
                session.safariBallsRemaining,

            safariBallsUsed:
                session.safariBallsUsed,

            stepsPercentageRemaining:
                (
                    session.stepsRemaining /
                    this.maximumSteps
                )
                *
                100,

            ballsPercentageRemaining:
                (
                    session.safariBallsRemaining /
                    this.startingSafariBalls
                )
                *
                100

        };

    }


    //----------------------------------------
    // Consume Safari Zone steps
    //----------------------------------------

    consumeSteps(
        session,
        steps = 1
    )
    {

        this.validateSession(
            session
        );


        this.validatePositiveInteger(
            steps,
            "steps"
        );


        if(
            !session.active
        )
        {

            return {

                success:
                    false,

                reason:
                    "SESSION_INACTIVE",

                session:
                    {
                        ...session
                    }

            };

        }


        const actualSteps =
            Math.min(

                steps,

                session.stepsRemaining

            );


        const nextSession =
        {

            ...session,

            stepsRemaining:
                session.stepsRemaining -
                actualSteps,

            stepsUsed:
                session.stepsUsed +
                actualSteps

        };


        //----------------------------------------
        // Safari Zone exhausted
        //----------------------------------------

        if(
            nextSession.stepsRemaining ===
            0
        )
        {

            nextSession.active =
                false;


            return {

                success:
                    true,

                exhausted:
                    true,

                reason:
                    "STEPS_EXHAUSTED",

                session:
                    nextSession

            };

        }


        return {

            success:
                true,

            exhausted:
                false,

            stepsConsumed:
                actualSteps,

            session:
                nextSession

        };

    }


    //----------------------------------------
    // Consume one Safari Ball
    //----------------------------------------

    useSafariBall(
        session
    )
    {

        this.validateSession(
            session
        );


        if(
            !session.active
        )
        {

            return {

                success:
                    false,

                reason:
                    "SESSION_INACTIVE",

                session:
                    {
                        ...session
                    }

            };

        }


        if(
            session.safariBallsRemaining <=
            0
        )
        {

            return {

                success:
                    false,

                reason:
                    "NO_SAFARI_BALLS",

                session:
                    {
                        ...session
                    }

            };

        }


        const nextSession =
        {

            ...session,

            safariBallsRemaining:
                session.safariBallsRemaining -
                1,

            safariBallsUsed:
                session.safariBallsUsed +
                1

        };


        return {

            success:
                true,

            session:
                nextSession

        };

    }


    //----------------------------------------
    // Add Safari Balls
    //----------------------------------------

    addSafariBalls(
        session,
        quantity
    )
    {

        this.validateSession(
            session
        );


        this.validatePositiveInteger(
            quantity,
            "quantity"
        );


        return {

            ...session,

            safariBallsRemaining:
                session.safariBallsRemaining +
                quantity

        };

    }


    //----------------------------------------
    // End Safari session
    //----------------------------------------

    exit(
        session
    )
    {

        this.validateSession(
            session
        );


        return {

            ...session,

            active:
                false

        };

    }


    //----------------------------------------
    // Create empty session
    //----------------------------------------

    createSession()
    {

        return {

            active:
                false,

            stepsRemaining:
                0,

            stepsUsed:
                0,

            safariBallsRemaining:
                0,

            safariBallsUsed:
                0

        };

    }


    //----------------------------------------
    // Validate Safari session
    //----------------------------------------

    validateSession(
        session
    )
    {

        if(
            !session
            ||
            typeof session !==
                "object"
        )
        {

            throw new TypeError(

                "Safari session is required."

            );

        }


        this.validateNonNegativeInteger(

            session.stepsRemaining,

            "stepsRemaining"

        );


        this.validateNonNegativeInteger(

            session.stepsUsed,

            "stepsUsed"

        );


        this.validateNonNegativeInteger(

            session.safariBallsRemaining,

            "safariBallsRemaining"

        );


        this.validateNonNegativeInteger(

            session.safariBallsUsed,

            "safariBallsUsed"

        );


        if(
            typeof session.active !==
            "boolean"
        )
        {

            throw new TypeError(

                "Safari session active state must be a boolean."

            );

        }

    }


    //----------------------------------------
    // Read trainer money
    //----------------------------------------

    getTrainerMoney(
        trainerState
    )
    {

        if(
            !trainerState
        )
        {

            throw new TypeError(

                "Trainer state is required."

            );

        }


        if(
            typeof trainerState.getMoney ===
            "function"
        )
        {

            return Number(

                trainerState.getMoney()

            );

        }


        if(
            Number.isFinite(
                trainerState.money
            )
        )
        {

            return Number(
                trainerState.money
            );

        }


        throw new TypeError(

            "Trainer state does not provide money."

        );

    }


    //----------------------------------------
    // Remove money
    //----------------------------------------

    removeMoney(
        trainerState,
        amount
    )
    {

        if(
            !trainerState
        )
        {

            throw new TypeError(

                "Trainer state is required."

            );

        }


        if(
            typeof trainerState.removeMoney ===
            "function"
        )
        {

            trainerState.removeMoney(
                amount
            );

            return;

        }


        if(
            Number.isFinite(
                trainerState.money
            )
        )
        {

            if(
                trainerState.money <
                amount
            )
            {

                throw new Error(

                    "Not enough money."

                );

            }


            trainerState.money -=
                amount;

            return;

        }


        throw new TypeError(

            "Trainer state does not provide money management."

        );

    }


    //----------------------------------------
    // Validate positive integer
    //----------------------------------------

    validatePositiveInteger(
        value,
        field
    )
    {

        if(
            !Number.isInteger(
                value
            )
            ||
            value <=
            0
        )
        {

            throw new RangeError(

                `${field} must be a positive integer.`

            );

        }

    }


    //----------------------------------------
    // Validate non-negative integer
    //----------------------------------------

    validateNonNegativeInteger(
        value,
        field
    )
    {

        if(
            !Number.isInteger(
                value
            )
            ||
            value < 0
        )
        {

            throw new RangeError(

                `${field} must be a non-negative integer.`

            );

        }

    }


}


module.exports =
    SafariZoneService;
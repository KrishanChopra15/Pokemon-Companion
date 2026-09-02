/**
 * Pokémon Companion
 * Pokémon Move Slot Domain
 *
 * Represents one move currently known by a Pokémon.
 *
 * Responsibilities:
 * - Store move reference.
 * - Track current PP.
 * - Track base PP.
 * - Track maximum PP.
 * - Track PP Up usage.
 * - Consume PP.
 * - Restore PP.
 * - Apply PP Up.
 * - Apply PP Max.
 *
 * Does NOT:
 * - Store move power.
 * - Store accuracy.
 * - Execute moves.
 * - Read databases.
 */

"use strict";


class PokemonMoveSlot
{


    /**
     * Create a Pokémon move slot.
     *
     * @param {Object} data
     */
    constructor(
        data = {}
    )
    {

        /**
         * Move constant.
         *
         * Example:
         * MOVE_EMBER
         */
        this.constant =
            data.constant ||
            null;


        /**
         * Base maximum PP before
         * any PP Up or PP Max usage.
         */
        this.basePP =
            this.resolveBasePP(
                data
            );


        /**
         * Number of PP Up stages used.
         *
         * Generation III supports
         * a maximum of 3.
         */
        this.ppUps =
            this.normalizePPUps(
                data.ppUps
            );


        /**
         * Maximum PP.
         *
         * If maxPP is explicitly supplied
         * for an existing saved/runtime slot,
         * preserve it when no PP Up information
         * is available.
         *
         * Otherwise calculate it from
         * base PP and PP Up count.
         */
        this.maxPP =
            this.resolveMaxPP(
                data
            );


        /**
         * Current remaining PP.
         */
        this.currentPP =
            this.resolveCurrentPP(
                data
            );

    }


    //--------------------------------
    // Resolve base PP
    //--------------------------------

    resolveBasePP(
        data
    )
    {

        const basePP =
            Number(
                data.basePP
            );


        if(
            Number.isFinite(
                basePP
            )
            &&
            basePP >= 0
        )
        {

            return basePP;

        }


        const maxPP =
            Number(
                data.maxPP
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


        const currentPP =
            Number(
                data.currentPP
            );


        if(
            Number.isFinite(
                currentPP
            )
            &&
            currentPP >= 0
        )
        {

            return currentPP;

        }


        return 0;

    }


    //--------------------------------
    // Resolve maximum PP
    //--------------------------------

    resolveMaxPP(
        data
    )
    {

        const suppliedMaxPP =
            Number(
                data.maxPP
            );


        //--------------------------------
        // Explicit base PP
        //--------------------------------

        if(
            Object.prototype.hasOwnProperty.call(
                data,
                "basePP"
            )
        )
        {

            return this.calculateMaxPP();

        }


        //--------------------------------
        // Explicit PP Up information
        //--------------------------------

        if(
            Object.prototype.hasOwnProperty.call(
                data,
                "ppUps"
            )
        )
        {

            return this.calculateMaxPP();

        }


        //--------------------------------
        // Legacy move slot
        //--------------------------------

        if(
            Number.isFinite(
                suppliedMaxPP
            )
            &&
            suppliedMaxPP >= 0
        )
        {

            return suppliedMaxPP;

        }


        return this.calculateMaxPP();

    }


    //--------------------------------
    // Calculate maximum PP
    //--------------------------------

    calculateMaxPP()
    {

        const basePP =
            this.basePP;


        if(
            basePP <= 0
        )
        {

            return 0;

        }


        const increasePerPPUp =
            Math.floor(
                basePP / 5
            );


        return (

            basePP

            +

            (
                increasePerPPUp
                *
                this.ppUps
            )

        );

    }


    //--------------------------------
    // Normalize PP Up count
    //--------------------------------

    normalizePPUps(
        value
    )
    {

        const ppUps =
            Number(
                value
            );


        if(
            !Number.isFinite(
                ppUps
            )
        )
        {

            return 0;

        }


        return Math.min(

            3,

            Math.max(
                0,
                Math.floor(
                    ppUps
                )
            )

        );

    }


    //--------------------------------
    // Resolve current PP
    //--------------------------------

    resolveCurrentPP(
        data
    )
    {

        const currentPP =
            Number(
                data.currentPP
            );


        if(
            Number.isFinite(
                currentPP
            )
        )
        {

            return Math.min(

                this.maxPP,

                Math.max(
                    0,
                    currentPP
                )

            );

        }


        const legacyPP =
            Number(
                data.pp
            );


        if(
            Number.isFinite(
                legacyPP
            )
        )
        {

            return Math.min(

                this.maxPP,

                Math.max(
                    0,
                    legacyPP
                )

            );

        }


        return this.maxPP;

    }


    //--------------------------------
    // Use PP
    //--------------------------------

    usePP()
    {

        if(
            this.currentPP <= 0
        )
        {

            return false;

        }


        this.currentPP--;


        return true;

    }


    //--------------------------------
    // Restore PP
    //--------------------------------

    restorePP()
    {

        this.currentPP =
            this.maxPP;


        return this.currentPP;

    }


    //--------------------------------
    // Restore partial PP
    //--------------------------------

    restorePPAmount(
        amount
    )
    {

        const numericAmount =
            Number(
                amount
            );


        if(
            !Number.isFinite(
                numericAmount
            )
            ||
            numericAmount <= 0
        )
        {

            return 0;

        }


        const restored =
            Math.min(

                numericAmount,

                this.maxPP - this.currentPP

            );


        this.currentPP +=
            restored;


        return restored;

    }


    //--------------------------------
    // Apply PP Up
    //--------------------------------

    applyPPUp()
    {

        //--------------------------------
        // Maximum PP Ups already used
        //--------------------------------

        if(
            this.ppUps >= 3
        )
        {

            return {

                success:
                    false,

                reason:
                    "Move already has maximum PP Up"

            };

        }


        //--------------------------------
        // Invalid base PP
        //--------------------------------

        if(
            this.basePP <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid base PP"

            };

        }


        const increase =
            Math.floor(
                this.basePP / 5
            );


        if(
            increase <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Move cannot receive a PP increase"

            };

        }


        const previousMaxPP =
            this.maxPP;


        const previousPPUps =
            this.ppUps;


        this.ppUps++;


        this.maxPP =
            this.calculateMaxPP();


        return {

            success:
                true,

            previousPPUps:
                previousPPUps,

            ppUps:
                this.ppUps,

            previousMaxPP:
                previousMaxPP,

            maxPP:
                this.maxPP,

            increase:
                increase

        };

    }


    //--------------------------------
    // Apply PP Max
    //--------------------------------

    applyPPMax()
    {

        //--------------------------------
        // Invalid base PP
        //--------------------------------

        if(
            this.basePP <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid base PP"

            };

        }


        //--------------------------------
        // Already maximum
        //--------------------------------

        if(
            this.ppUps >= 3
            &&
            this.maxPP ===
                this.calculateMaxPP()
        )
        {

            return {

                success:
                    false,

                reason:
                    "Move already has maximum PP"

            };

        }


        const previousPPUps =
            this.ppUps;


        const previousMaxPP =
            this.maxPP;


        this.ppUps =
            3;


        this.maxPP =
            this.calculateMaxPP();


        return {

            success:
                true,

            previousPPUps:
                previousPPUps,

            ppUps:
                this.ppUps,

            previousMaxPP:
                previousMaxPP,

            maxPP:
                this.maxPP,

            increase:
                this.maxPP -
                previousMaxPP

        };

    }


    //--------------------------------
    // Check empty
    //--------------------------------

    isEmpty()
    {

        return (

            this.currentPP <= 0

        );

    }


    //--------------------------------
    // Check full PP
    //--------------------------------

    isFull()
    {

        return (

            this.currentPP >=
            this.maxPP

        );

    }


    //--------------------------------
    // Get PP summary
    //--------------------------------

    getPPSummary()
    {

        return {

            basePP:
                this.basePP,

            currentPP:
                this.currentPP,

            maxPP:
                this.maxPP,

            ppUps:
                this.ppUps,

            ppUpPercentage:
                (
                    this.basePP > 0

                    ?

                    (
                        (
                            this.maxPP -
                            this.basePP
                        )
                        /
                        this.basePP
                    )
                    *
                    100

                    :

                    0
                )

        };

    }


}


module.exports =
    PokemonMoveSlot;
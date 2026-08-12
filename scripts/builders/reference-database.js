/**
 * Pokémon Companion
 * Reference Database
 *
 * Provides fast lookup of reference records.
 */

"use strict";

class ReferenceDatabase {

    /**
     * Create a Reference Database.
     *
     * @param {Object[]} records
     */
    constructor(records = []) {

        this.records = records;

        this.byId = new Map();

        this.byConstant = new Map();

        for (const record of records) {

            this.byId.set(
                record.id,
                record
            );

            if (record.constant) {

                this.byConstant.set(
                    record.constant,
                    record
                );

            }

        }

    }

    /**
     * Get all records.
     *
     * @returns {Object[]}
     */
    all() {

        return this.records;

    }

    /**
     * Get a record by ID or constant.
     *
     * Supports:
     * - numeric IDs
     * - string constants
     *
     * Examples:
     *
     * get(10)
     * get("TYPE_GRASS")
     *
     * @param {number|string} value
     * @returns {Object|null}
     */
    get(value) {


        if (value === null || value === undefined) {

            return null;

        }


        //----------------------------------------
        // Numeric lookup
        //----------------------------------------

        if (
            typeof value === "number" ||
            /^\d+$/.test(value)
        ) {

            return (
                this.byId.get(
                    Number(value)
                )
                ||
                null
            );

        }


        //----------------------------------------
        // Constant lookup
        //----------------------------------------

        if (typeof value === "string") {

            return (
                this.byConstant.get(value)
                ||
                null
            );

        }


        return null;

    }

    /**
     * Get a record by constant.
     *
     * @param {string} constant
     * @returns {Object|null}
     */
    getByConstant(constant) {
    
        return this.get(constant);
    
    }

    /**
     * Check whether a record exists.
     *
     * @param {number|string} id
     * @returns {boolean}
     */
    has(id) {

        return this.byId.has(id);

    }

    /**
     * Check whether a constant exists.
     *
     * @param {string} constant
     * @returns {boolean}
     */
    hasConstant(constant) {

        return this.byConstant.has(constant);

    }

    /**
     * Find a record.
     *
     * @param {Function} predicate
     * @returns {Object|null}
     */
    find(predicate) {

        return this.records.find(predicate) || null;

    }

}

module.exports = ReferenceDatabase;
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



            if (record.id !== undefined) {


                this.byId.set(
                    String(record.id),
                    record
                );


            }



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
     * @param {number|string} value
     * @returns {Object|null}
     */
    get(value) {



        if (
            value === null ||
            value === undefined
        ) {

            return null;

        }




        //----------------------------------------
        // Constant lookup
        //----------------------------------------

        if (
            typeof value === "string" &&
            value.includes("_")
        ) {


            return (

                this.byConstant.get(value)

                ||

                null

            );


        }




        //----------------------------------------
        // ID lookup
        //----------------------------------------

        const id =
            String(value).padStart(
                4,
                "0"
            );



        return (

            this.byId.get(id)

            ||

            this.byId.get(
                String(value)
            )

            ||

            null

        );


    }





    /**
     * Get by constant.
     *
     * @param {string} constant
     * @returns {Object|null}
     */
    getByConstant(constant) {


        return (

            this.byConstant.get(
                constant
            )

            ||

            null

        );


    }





    /**
     * Check whether ID or constant exists.
     *
     * @param {number|string} value
     * @returns {boolean}
     */
    has(value) {


        return this.get(value) !== null;


    }





    /**
     * Check constant exists.
     *
     * @param {string} constant
     * @returns {boolean}
     */
    hasConstant(constant) {


        return this.byConstant.has(
            constant
        );


    }





    /**
     * Find record.
     *
     * @param {Function} predicate
     * @returns {Object|null}
     */
    find(predicate) {


        return (

            this.records.find(
                predicate
            )

            ||

            null

        );


    }


}



module.exports = ReferenceDatabase;
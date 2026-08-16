/**
 * Pokémon Companion
 * Reference Registry
 *
 * Loads and exposes every reference database.
 *
 * Responsibilities:
 * - Load reference databases.
 * - Wrap them as ReferenceDatabase objects.
 * - Provide centralized access.
 */

"use strict";


const fs = require("fs");
const path = require("path");

const ReferenceDatabase =
    require("./reference-database");



class ReferenceRegistry {



    constructor() {


        this.basePath = path.join(

            process.cwd(),

            "database",

            "reference"

        );



        this.speciesNames =
            this.load(
                "species-names"
            );



        this.moveNames =
            this.load(
                "move-names"
            );



        this.moveEffects =
            this.load(
                "move-effects"
            );



        this.moveTargets =
            this.load(
                "move-targets"
            );



        this.types =
            this.load(
                "types"
            );



        this.abilities =
            this.load(
                "abilities"
            );



        this.growthRates =
            this.load(
                "growth-rates"
            );



        this.eggGroups =
            this.load(
                "egg-groups"
            );



        this.bodyColors =
            this.load(
                "body-colors"
            );



        this.evolutionMethods =
            this.load(
                "evolution-methods"
            );



        this.items =
            this.load(
                "items"
            );



        this.machines =
            this.load(
                "machines"
            );


    }




    /**
     * Load a reference database.
     *
     * @param {string} name
     * @returns {ReferenceDatabase}
     */
    load(name) {



        const file = path.join(

            this.basePath,

            `${name}.json`

        );



        if (
            !fs.existsSync(file)
        ) {

            throw new Error(

                `Missing reference database: ${name}.json`

            );

        }



        const records = JSON.parse(

            fs.readFileSync(

                file,

                "utf8"

            )

        );



        return new ReferenceDatabase(

            records

        );


    }



}



module.exports = ReferenceRegistry;
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
 *
 * Does NOT:
 * - Generate reference databases.
 * - Modify reference records.
 * - Build generated Pokémon data.
 */

"use strict";


const fs =
    require("fs");

const path =
    require("path");


const ReferenceDatabase =
    require("./reference-database");



class ReferenceRegistry {



    constructor()
    {


        //----------------------------------------
        // Reference database root
        //----------------------------------------

        this.basePath =
            path.join(

                process.cwd(),

                "database",

                "reference"

            );



        //----------------------------------------
        // Species names
        //----------------------------------------

        this.speciesNames =
            this.load(

                "species-names"

            );



        //----------------------------------------
        // Move names
        //----------------------------------------

        this.moveNames =
            this.load(

                "move-names"

            );



        //----------------------------------------
        // Move effects
        //----------------------------------------

        this.moveEffects =
            this.load(

                "move-effects"

            );



        //----------------------------------------
        // Move targets
        //----------------------------------------

        this.moveTargets =
            this.load(

                "move-targets"

            );



        //----------------------------------------
        // Types
        //----------------------------------------

        this.types =
            this.load(

                "types"

            );



        //----------------------------------------
        // Abilities
        //----------------------------------------

        this.abilities =
            this.load(

                "abilities"

            );



        //----------------------------------------
        // Growth rates
        //----------------------------------------

        this.growthRates =
            this.load(

                "growth-rates"

            );



        //----------------------------------------
        // Egg groups
        //----------------------------------------

        this.eggGroups =
            this.load(

                "egg-groups"

            );



        //----------------------------------------
        // Body colors
        //----------------------------------------

        this.bodyColors =
            this.load(

                "body-colors"

            );



        //----------------------------------------
        // Evolution methods
        //----------------------------------------

        this.evolutionMethods =
            this.load(

                "evolution-methods"

            );



        //----------------------------------------
        // Items
        //----------------------------------------

        this.items =
            this.load(

                "items"

            );



        //----------------------------------------
        // Machines
        //----------------------------------------

        this.machines =
            this.load(

                "machines"

            );



        //----------------------------------------
        // Pokédex
        //----------------------------------------

        this.pokedex =
            this.load(

                "pokedex"

            );


    }





    //----------------------------------------
    // Load reference database
    //----------------------------------------

    /**
     * Load a reference database.
     *
     * @param {string} name
     * @returns {ReferenceDatabase}
     */

    load(
        name
    )
    {


        const file =
            path.join(

                this.basePath,

                `${name}.json`

            );



        //----------------------------------------
        // Validate file
        //----------------------------------------

        if(
            !fs.existsSync(
                file
            )
        )
        {


            throw new Error(

                `Missing reference database: ${name}.json`

            );


        }



        //----------------------------------------
        // Read database
        //----------------------------------------

        const records =

            JSON.parse(

                fs.readFileSync(

                    file,

                    "utf8"

                )

            );



        //----------------------------------------
        // Wrap database
        //----------------------------------------

        return new ReferenceDatabase(

            records

        );


    }


}



module.exports =
    ReferenceRegistry;
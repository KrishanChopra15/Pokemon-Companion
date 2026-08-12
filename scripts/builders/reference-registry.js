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

const ReferenceDatabase = require("./reference-database");

class ReferenceRegistry {

    constructor() {

        this.speciesNames = this.load(
            "species-names"
        );

        this.moveNames = this.load(
            "move-names"
        );

        this.types = this.load(
            "types"
        );

        this.abilities = this.load(
            "abilities"
        );

        this.growthRates = this.load(
            "growth-rates"
        );

        this.eggGroups = this.load(
            "egg-groups"
        );

        this.bodyColors = this.load(
            "body-colors"
        );

        this.evolutionMethods = this.load(
            "evolution-methods"
        );

        this.items = this.load(
            "items"
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
            process.cwd(),
            "database",
            "reference",
            `${name}.json`
        );

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
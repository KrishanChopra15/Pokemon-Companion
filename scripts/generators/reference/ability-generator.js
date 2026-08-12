/**
 * Pokémon Companion
 * Ability Generator
 *
 * Generates the Pokémon ability reference database.
 *
 * Responsibilities:
 * - Read the FireRed ability reference file.
 * - Extract ability names.
 * - Extract ability descriptions.
 * - Build the ability database.
 *
 * Does NOT:
 * - Read ROMs.
 * - Parse binary data.
 * - Generate Pokémon species.
 */

"use strict";

const ReferenceGenerator = require("./reference-generator");

class AbilityGenerator extends ReferenceGenerator {

    /**
     * Generate the ability database.
     */
    generate() {

        const source = this.readSourceFile(
            "pokefirered",
            "src",
            "data",
            "text",
            "abilities.h"
        );

        //--------------------------------------
        // Extract descriptions
        //--------------------------------------

        const descriptions = new Map();

        const descriptionRegex =
            /static const u8\s+(s\w+Description)\[\]\s*=\s*_\("([^"]*)"\);/g;

        let match;

        while ((match = descriptionRegex.exec(source)) !== null) {

            descriptions.set(
                match[1],
                match[2]
            );

        }

        //--------------------------------------
        // Extract description pointers
        //--------------------------------------

        const pointers = new Map();

        const pointerRegex =
            /\[(ABILITY_[A-Z0-9_]+)\]\s*=\s*(s\w+Description)/g;

        while ((match = pointerRegex.exec(source)) !== null) {

            pointers.set(
                match[1],
                match[2]
            );

        }

        //--------------------------------------
        // Extract names
        //--------------------------------------

        const abilities = [];

        const nameRegex =
            /\[(ABILITY_[A-Z0-9_]+)\]\s*=\s*_\("([^"]*)"\)/g;

        let id = 0;

        while ((match = nameRegex.exec(source)) !== null) {

            const constant = match[1];

            const descriptionKey = pointers.get(constant);

            abilities.push({

                id,

                constant,

                name: match[2],

                description: descriptionKey
                    ? descriptions.get(descriptionKey)
                    : null

            });

            id++;

        }

        //--------------------------------------
        // Write database
        //--------------------------------------

        this.writeDatabase(
            "abilities",
            abilities
        );

    }

}

module.exports = AbilityGenerator;
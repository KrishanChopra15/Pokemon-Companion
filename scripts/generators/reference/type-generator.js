/**
 * Pokémon Companion
 * Type Generator
 *
 * Generates the Pokémon type reference database.
 *
 * Responsibilities:
 * - Produce the canonical Pokémon types.
 * - Write the reference database.
 *
 * Does NOT:
 * - Read ROMs.
 * - Parse binary data.
 * - Generate Pokémon species.
 */

"use strict";

const fs = require("fs");
const path = require("path");

class TypeGenerator {

    generate() {

        const types = [
        
            {
                id: 0,
                constant: "TYPE_NORMAL",
                name: "Normal"
            },
        
            {
                id: 1,
                constant: "TYPE_FIGHTING",
                name: "Fighting"
            },
        
            {
                id: 2,
                constant: "TYPE_FLYING",
                name: "Flying"
            },
        
            {
                id: 3,
                constant: "TYPE_POISON",
                name: "Poison"
            },
        
            {
                id: 4,
                constant: "TYPE_GROUND",
                name: "Ground"
            },
        
            {
                id: 5,
                constant: "TYPE_ROCK",
                name: "Rock"
            },
        
            {
                id: 6,
                constant: "TYPE_BUG",
                name: "Bug"
            },
        
            {
                id: 7,
                constant: "TYPE_GHOST",
                name: "Ghost"
            },
        
            {
                id: 8,
                constant: "TYPE_STEEL",
                name: "Steel"
            },
        
            {
                id: 9,
                constant: "TYPE_MYSTERY",
                name: "Mystery"
            },
        
            {
                id: 10,
                constant: "TYPE_FIRE",
                name: "Fire"
            },
        
            {
                id: 11,
                constant: "TYPE_WATER",
                name: "Water"
            },
        
            {
                id: 12,
                constant: "TYPE_GRASS",
                name: "Grass"
            },
        
            {
                id: 13,
                constant: "TYPE_ELECTRIC",
                name: "Electric"
            },
        
            {
                id: 14,
                constant: "TYPE_PSYCHIC",
                name: "Psychic"
            },
        
            {
                id: 15,
                constant: "TYPE_ICE",
                name: "Ice"
            },
        
            {
                id: 16,
                constant: "TYPE_DRAGON",
                name: "Dragon"
            },
        
            {
                id: 17,
                constant: "TYPE_DARK",
                name: "Dark"
            }
        
        ];

        const outputDirectory = path.join(
            process.cwd(),
            "database",
            "reference"
        );

        fs.mkdirSync(
            outputDirectory,
            {
                recursive: true
            }
        );

        const outputFile = path.join(
            outputDirectory,
            "types.json"
        );

        fs.writeFileSync(
            outputFile,
            JSON.stringify(types, null, 4)
        );

        console.log(
            `Generated ${outputFile}`
        );

        console.log(
            `${types.length} Pokémon types generated.`
        );

    }

}

module.exports = TypeGenerator;
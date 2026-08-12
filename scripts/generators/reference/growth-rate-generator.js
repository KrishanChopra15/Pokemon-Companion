/**
 * Pokémon Companion
 * Growth Rate Generator
 *
 * Generates the Growth Rate reference database.
 *
 * Responsibilities:
 * - Read experience_tables.h
 * - Parse Growth Rates
 * - Generate growth-rates.json
 */

"use strict";

const fs = require("fs");
const path = require("path");

const CommentEnumParser = require("../../parsers/reference/comment-enum-parser");

class GrowthRateGenerator {

    generate() {

        const inputFile = path.join(
            process.cwd(),
            "..",
            "References",
            "pokefirered",
            "src",
            "data",
            "pokemon",
            "experience_tables.h"
        );

        const outputDirectory = path.join(
            process.cwd(),
            "database",
            "reference"
        );

        const outputFile = path.join(
            outputDirectory,
            "growth-rates.json"
        );

        const source = fs.readFileSync(
            inputFile,
            "utf8"
        );

        const parser = new CommentEnumParser();

        let growthRates = parser.parse(source, {
            maxEntries: 6
        });
        
        
        const constants = [
        
            "GROWTH_MEDIUM_FAST",
            "GROWTH_ERRATIC",
            "GROWTH_FLUCTUATING",
            "GROWTH_MEDIUM_SLOW",
            "GROWTH_FAST",
            "GROWTH_SLOW"
        
        ];
        
        
        growthRates = growthRates.map(rate => {
        
            return {
            
                ...rate,
            
                constant: constants[rate.id]
            
            };
        
        });

        fs.mkdirSync(
            outputDirectory,
            {
                recursive: true
            }
        );

        fs.writeFileSync(
            outputFile,
            JSON.stringify(
                growthRates,
                null,
                4
            )
        );

        console.log(
            `Generated ${outputFile}`
        );

        console.log(
            `${growthRates.length} growth rates extracted.`
        );

    }

}

module.exports = GrowthRateGenerator;
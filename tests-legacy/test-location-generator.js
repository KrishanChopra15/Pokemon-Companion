"use strict";

const path = require("path");


const LocationExtractor =
    require("../scripts/extractors/game-boy-advance/location-extractor");


const LocationGenerator =
    require("../scripts/generators/raw/location-generator");



const extractor =
    new LocationExtractor();



const locations =
    extractor.extract(

        path.resolve(
            "../References/pokefirered"
        )

    );



const generator =
    new LocationGenerator();



generator.generate(
    locations
);
"use strict";


const LocationGateExtractor =
    require("../scripts/extractors/game-boy-advance/location-gate-extractor");


const LocationGateGenerator =
    require("../scripts/generators/raw/location-gate-generator");



const extractor =
    new LocationGateExtractor();



const gates =
    extractor.extract(
        "../References/pokefirered"
    );



const generator =
    new LocationGateGenerator();



generator.generate(
    gates,
    "firered"
);
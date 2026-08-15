"use strict";


const LocationRequirementExtractor =
    require("../scripts/extractors/game-boy-advance/location-requirement-extractor");


const extractor =
    new LocationRequirementExtractor();



const requirements =
    extractor.extract(
        "../References/pokefirered"
    );


console.log(
    "Requirements found:"
);


console.log(
    Object.keys(
        requirements
    ).length
);


console.log(
    requirements
);
"use strict";


const LocationGateExtractor =
    require("../scripts/extractors/game-boy-advance/location-gate-extractor");


const extractor =
    new LocationGateExtractor();



const gates =
    extractor.extract(
        "../References/pokefirered"
    );



console.log(
    "Gate count:"
);


console.log(
    Object.keys(gates).length
);



console.log(
    gates
);
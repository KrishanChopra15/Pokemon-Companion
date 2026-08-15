"use strict";


const LocationExtractor =
    require("../scripts/extractors/game-boy-advance/location-extractor");


const path =
    require("path");


const extractor =
    new LocationExtractor();


const result =
    extractor.extract(
        path.resolve(
            "../References/pokefirered"
        )
    );


console.log(
    result.find(
        x =>
            x.id === "MAP_VIRIDIAN_FOREST"
    )
);


console.log(
    "Locations:",
    result.length
);
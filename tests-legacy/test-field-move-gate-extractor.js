"use strict";


const FieldMoveGateExtractor =
require("../scripts/extractors/game-boy-advance/field-move-gate-extractor");


const extractor =
new FieldMoveGateExtractor();


const gates =
extractor.extract(
    "../References/pokefirered"
);



console.log(
    "Pewter City:"
);


console.log(
    JSON.stringify(
        gates.MAP_PEWTER_CITY,
        null,
        2
    )
);



console.log();


console.log(
    "Route 10:"
);


console.log(
    JSON.stringify(
        gates.MAP_ROUTE10,
        null,
        2
    )
);
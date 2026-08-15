"use strict";


const LocationGraphBuilder =
    require("../scripts/builders/location-graph-builder");



const builder =
    new LocationGraphBuilder();



builder.build(
    "../References/pokefirered",
    "firered"
);
"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer(
        "firered"
    );



console.log(
    "Location Access:",
    !!app.get("locationAccess")
);


console.log(
    "Location Analysis:",
    !!app.get("locationAnalysis")
);


console.log(
    "Location Availability:",
    !!app.get("locationAvailability")
);


console.log(
    "Map Access:",
    !!app.get("mapAccess")
);
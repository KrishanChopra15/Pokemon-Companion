"use strict";


const GrowthRateService =
    require("../scripts/services/growth-rate-service");


const growth =
    new GrowthRateService();


console.log(
    "Level 16 Medium Slow:"
);


console.log(

    growth.getRequiredExp(

        16,

        "GROWTH_MEDIUM_SLOW"

    )

);


console.log(
    "Level 16 Medium Fast:"
);


console.log(

    growth.getRequiredExp(

        16,

        "GROWTH_MEDIUM_FAST"

    )

);
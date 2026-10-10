"use strict";


const EventScriptExtractor =
require("../scripts/extractors/game-boy-advance/event-script-extractor");


const extractor =
new EventScriptExtractor();


const scripts =
extractor.extract(
    "/Users/krishanchopra/Coding/Pokemon-project/References/pokefirered"
);



// Search examples

for(
    const script of Object.values(scripts)
)
{

    const text =
        JSON.stringify(script);



    if(
        text.includes("LAPRAS") ||
        text.includes("EEVEE") ||
        text.includes("MAGIKARP") ||
        text.includes("SNORLAX") ||
        text.includes("TM42")
    )
    {

        console.log(
            JSON.stringify(
                script,
                null,
                4
            )
        );


    }

}
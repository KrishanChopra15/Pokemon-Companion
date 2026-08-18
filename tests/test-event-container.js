"use strict";


const AppContainer =
    require("../scripts/app-container");


const app =
    new AppContainer("firered");



console.log(
    "Event:",
    !!app.get("eventService")
);


console.log(
    "Event Reward:",
    !!app.get("eventRewardService")
);


console.log(
    "Reward:",
    !!app.get("rewardService")
);


console.log(
    "Story Event:",
    !!app.get("storyEventService")
);
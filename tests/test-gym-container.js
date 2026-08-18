const AppContainer =
    require("../scripts/app-container");


const app =
    new AppContainer();



console.log(
    "Gym:",
    Boolean(
        app.get("gym")
    )
);


console.log(
    "Gym Location:",
    Boolean(
        app.get("gymLocation")
    )
);


console.log(
    "Gym Reward:",
    Boolean(
        app.get("gymReward")
    )
);


console.log(
    "Gym Event:",
    Boolean(
        app.get("gymEventService")
    )
);
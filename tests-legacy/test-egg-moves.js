const Extractor =
require("../scripts/extractors/game-boy-advance/pokemon-egg-move-extractor");


const data =
new Extractor().extractAll();


console.log(
    "Total:",
    data.length
);


console.log(
    JSON.stringify(
        data.find(
            x =>
            x.species === "SPECIES_MUDKIP"
        ),
        null,
        4
    )
);
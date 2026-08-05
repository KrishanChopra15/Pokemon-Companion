const {
    getGenerationDex
} = require(
    "../utils/loaders/showdown"
);

const TEST_POKEMON = [

    "bulbasaur",
    "pikachu",
    "charizard",
    "eevee",
    "scyther",
    "gengar",
    "lucario",
    "greninja",
    "dragapult"

];

for (const id of TEST_POKEMON) {

    const dex =
        getGenerationDex(9);

    const learnset =
        dex.data.Learnsets[id];

    console.log();
    console.log(
        "=".repeat(80)
    );

    console.log(
        id.toUpperCase()
    );

    console.log(
        "=".repeat(80)
    );

    if (!learnset) {

        console.log(
            "No learnset found."
        );

        continue;

    }

    console.log(

        JSON.stringify(
            learnset,
            null,
            2
        )

    );

}
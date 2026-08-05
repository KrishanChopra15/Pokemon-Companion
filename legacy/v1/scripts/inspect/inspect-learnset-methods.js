const path = require("path");

const {
    loadJSON
} = require("../utils/json");

const {
    getResource
} = require("../utils/api");

async function inspectLearnsetMethods() {

    const pokemonList =
        loadJSON("pokemon.json");

    const methods =
        new Set();

    for (const pokemon of pokemonList) {

        console.log(
            `Inspecting ${pokemon.name}...`
        );

        const data =
            await getResource(
                "pokemon",
                pokemon.id
            );

        for (const move of data.moves) {

            for (const detail of move.version_group_details) {

                methods.add(
                    detail.move_learn_method.name
                );

            }

        }

    }

    console.log("");
    console.log("================================");
    console.log("Learn Methods");
    console.log("================================");

    console.log(
        [...methods].sort()
    );

    console.log("");

    console.log(
        `Total Methods: ${methods.size}`
    );

}

inspectLearnsetMethods();
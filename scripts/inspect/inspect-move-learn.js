const axios = require("axios");

async function inspectMove() {

    const { data } = await axios.get(
        "https://pokeapi.co/api/v2/move/33/"
    );

    console.log("Past Values:");
    console.log(data.past_values);

    console.log("\nFlavor Entries:");
    console.log(
        data.flavor_text_entries
            .filter(
                e => e.language.name === "en"
            )
            .map(e => ({
                version: e.version_group.name,
                text: e.flavor_text
            }))
    );

}

inspectMove();
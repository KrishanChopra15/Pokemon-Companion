const axios = require("axios");

async function inspectVersionGroup() {

    const { data } = await axios.get(
        "https://pokeapi.co/api/v2/version-group/11/"
    );

    console.log(JSON.stringify(data, null, 4));

}

inspectVersionGroup();
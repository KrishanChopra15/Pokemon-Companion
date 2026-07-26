const axios = require("axios");

const MACHINE_ID = 508;

async function inspectMachine() {

    const { data } = await axios.get(
        `https://pokeapi.co/api/v2/machine/${MACHINE_ID}`
    );

    console.log(
        JSON.stringify(
            data,
            null,
            4
        )
    );

}

inspectMachine();
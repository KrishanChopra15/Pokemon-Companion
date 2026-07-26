const axios = require("axios");

const MOVE_ID = 85; // Thunderbolt

async function inspectMachines() {

    const { data: move } = await axios.get(
        `https://pokeapi.co/api/v2/move/${MOVE_ID}`
    );

    console.log("================================");
    console.log("Move:", move.name);
    console.log("================================");

    console.log("");

    console.log("Machines:");

    console.log(
        JSON.stringify(
            move.machines,
            null,
            4
        )
    );

}

inspectMachines();
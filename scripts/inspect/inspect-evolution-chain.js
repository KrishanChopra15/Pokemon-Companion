const axios = require("axios");

const EVOLUTION_CHAIN_ID = 67; // Change this when needed

async function inspectEvolutionChain() {

    const { data: chain } = await axios.get(
        `https://pokeapi.co/api/v2/evolution-chain/${EVOLUTION_CHAIN_ID}`
    );

    console.log("================================");
    console.log(`Evolution Chain #${EVOLUTION_CHAIN_ID}`);
    console.log("================================");

    console.log(
        JSON.stringify(
            chain,
            null,
            4
        )
    );

}

inspectEvolutionChain();
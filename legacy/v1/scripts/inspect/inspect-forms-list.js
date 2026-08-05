const fetch = global.fetch;

async function main() {

    console.log("Downloading forms list...\n");

    const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon-form?limit=100000"
    );

    const data = await response.json();

    console.log("Total Forms:");
    console.log(data.count);

    console.log("\nFirst 20 Forms:\n");

    console.table(
        data.results.slice(0, 20)
    );

    console.log("\nLast 20 Forms:\n");

    console.table(
        data.results.slice(-20)
    );

}

main().catch(console.error);
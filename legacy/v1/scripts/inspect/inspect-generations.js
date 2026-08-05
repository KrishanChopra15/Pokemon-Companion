const fetch = global.fetch;

async function main() {

    const response = await fetch(
        "https://pokeapi.co/api/v2/generation"
    );

    const data = await response.json();

    console.log(
        `Generations: ${data.count}\n`
    );

    console.table(data.results);

}

main().catch(console.error);
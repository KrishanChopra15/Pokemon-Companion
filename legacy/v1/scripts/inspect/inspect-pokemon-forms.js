const pokemon = require("../../database/pokemon.json");

console.log("\n========================================");
console.log("=== Pokémon Forms Inspection ===");
console.log("========================================\n");

const forms = pokemon.filter(
    p => p.id >= 10000
);

console.log(`Total alternate Pokémon: ${forms.length}\n`);

console.table(
    forms.slice(0, 30).map(p => ({
        id: p.id,
        speciesId: p.speciesId,
        number: p.number,
        name: p.name
    }))
);

console.log("\n========================================");
console.log("=== Naming Pattern Summary ===");
console.log("========================================\n");

const patterns = {};

for (const p of forms) {

    const words = p.name.split(" ");

    if (words.length > 1) {

        const suffix = words.slice(1).join(" ");

        patterns[suffix] ??= 0;
        patterns[suffix]++;

    }

}

console.table(
    Object.entries(patterns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100)
        .map(([pattern, count]) => ({
            pattern,
            count
        }))
);

console.log("\n========================================");
console.log("=== Sample Mega Forms ===");
console.log("========================================\n");

console.table(
    forms
        .filter(p => p.name.includes("Mega"))
        .slice(0, 20)
        .map(p => ({
            id: p.id,
            speciesId: p.speciesId,
            name: p.name
        }))
);

console.log("\n========================================");
console.log("=== Sample Regional Forms ===");
console.log("========================================\n");

console.table(
    forms
        .filter(p =>
            p.name.includes("Alolan") ||
            p.name.includes("Galarian") ||
            p.name.includes("Hisuian") ||
            p.name.includes("Paldean")
        )
        .slice(0, 20)
        .map(p => ({
            id: p.id,
            speciesId: p.speciesId,
            name: p.name
        }))
);
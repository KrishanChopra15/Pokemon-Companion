module.exports = {
    schemaVersion: 1,

    version: "1.0.0",

    output: "database/generated/manifest.json",

    database: [
        { key: "abilities", file: "abilities.json" },
        { key: "forms", file: "forms.json" },
        { key: "games", file: "games.json" },
        { key: "items", file: "items.json" },
        { key: "learnsets", file: "learnsets.json" },
        { key: "locations", file: "locations.json" },
        { key: "machines", file: "machines.json" },
        { key: "moves", file: "moves.json" },
        { key: "pokemon", file: "pokemon.json" },
        { key: "species", file: "species.json" },
        { key: "types", file: "types.json" }
    ],

    generated: [
        { key: "evolutionGraph", file: "evolution-graph.json" },
        { key: "learnsetDatabase", file: "learnset-database.json" },
        { key: "movesByType", file: "moves-by-type.json" },
        { key: "pokemonByAbility", file: "pokemon-by-ability.json" },
        { key: "pokemonByType", file: "pokemon-by-type.json" },
        { key: "pokemonIndex", file: "pokemon-index.json" },
        { key: "pokemonLookup", file: "pokemon-lookup.json" },
        { key: "searchIndex", file: "search-index.json" },
        { key: "speciesForms", file: "species-forms.json" },
        { key: "speciesLookup", file: "species-lookup.json" }
    ]
};
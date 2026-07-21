const axios = require("axios");
const path = require("path");

const {
    toTitleCase,
    saveJSON,
    sortTitleCaseNames
} = require("./utils");

const metadata = require("../database/metadata/type-metadata.json");
const OUTPUT_FILE = path.join(
    __dirname,
    "../database/types.json"
);

async function downloadTypes() {
    try {
        const response = await axios.get(
            "https://pokeapi.co/api/v2/type"
        );

        const types = [];

        for (const typeInfo of response.data.results) {

            if (["unknown", "shadow"].includes(typeInfo.name)) {
                continue;
            }

            console.log(`Downloading ${typeInfo.name}...`);

            const typeResponse = await axios.get(typeInfo.url);

            const type = typeResponse.data;

            const typeName = toTitleCase(type.name);

            const typeMetadata = metadata[typeName] || {};

            const damage = type.damage_relations;

            types.push({
            
                id: type.id,
                name: typeName,
            
                color: typeMetadata.color || null,           
                gradient: typeMetadata.gradient || null,         
                emoji: typeMetadata.emoji || "",            
                icon: typeMetadata.icon || null,           
                description: typeMetadata.description || "",

                damageRelations: {
                
                    doubleDamageTo:
                        sortTitleCaseNames(damage.double_damage_to),
                
                    halfDamageTo:
                        sortTitleCaseNames(damage.half_damage_to),
                
                    noDamageTo:
                        sortTitleCaseNames(damage.no_damage_to),
                
                    doubleDamageFrom:
                        sortTitleCaseNames(damage.double_damage_from),
                
                    halfDamageFrom:
                        sortTitleCaseNames(damage.half_damage_from),
                
                    noDamageFrom:
                        sortTitleCaseNames(damage.no_damage_from)
                
                }
            
            });

        }

        types.sort((a, b) => a.id - b.id);

        saveJSON(
            OUTPUT_FILE,
            types
        );

        console.log(
            `Successfully downloaded ${types.length} Pokémon types.`
        );

        } catch (error) {

        console.error("Error downloading types:");

        console.error(error.message);

    }

}

downloadTypes();
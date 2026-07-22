const axios = require("axios");
const path = require("path");

const {
    saveJSON,
    formatGeneration,
    formatVersionGroup,
    formatGameName,
    getIdFromUrl
} = require("./utils");

const OUTPUT_FILE = path.join(
    __dirname,
    "../database/version-groups.json"
);

async function downloadVersionGroups() {

    try {

        const versionGroups = [];

        const { data } = await axios.get(
            "https://pokeapi.co/api/v2/version-group?limit=100"
        );

        for (const versionGroupInfo of data.results) {

            console.log(
                `Downloading ${versionGroupInfo.name}...`
            );

            const { data: versionGroup } = await axios.get(
                versionGroupInfo.url
            );

            versionGroups.push({

                id: versionGroup.id,

                name: formatVersionGroup(
                    versionGroup.name
                ),

                generation: {

                    id: getIdFromUrl(
                        versionGroup.generation.url
                    ),

                    name: formatGeneration(
                        versionGroup.generation.name
                    )

                },

                games: versionGroup.versions
                    .map(version => ({
                    
                        id: getIdFromUrl(
                            version.url
                        ),
                    
                        name: formatGameName(
                            version.name
                        )
                    
                    }))
                    .sort((a, b) => a.id - b.id)

            });

        }

        versionGroups.sort(
            (a, b) => a.id - b.id
        );

        saveJSON(
            OUTPUT_FILE,
            versionGroups
        );

        console.log(
            `Successfully downloaded ${versionGroups.length} version groups.`
        );

    } catch (error) {

        console.error(
            "Error downloading version groups:"
        );

        console.error(error.message);

    }

}

downloadVersionGroups();
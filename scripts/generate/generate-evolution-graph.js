const path = require("path");

const {
    loadJSON,
    saveJSON
} = require("../utils/json");

const {
    buildEvolutionGraph
} = require("../utils/evolution");

const {
    printSuccess,
    printOutputFile,
    printError
} = require("../utils/logger");

const INPUT_FILE = path.join(
    __dirname,
    "../../database/evolutions.json"
);

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/generated/evolution-graph.json"
);

function generateEvolutionGraph() {

    try {

        const evolutionChains =
            loadJSON("evolutions.json");

        const evolutionGraph =
            buildEvolutionGraph(
                evolutionChains
            );

        saveJSON(
            OUTPUT_FILE,
            evolutionGraph
        );

        printSuccess(
            `Generated ${evolutionGraph.length} evolution graph entries`
        );

        printOutputFile(
            OUTPUT_FILE
        );

    } catch (error) {

        printError(
            error,
            "Error generating evolution graph"
        );

    }

}

generateEvolutionGraph();
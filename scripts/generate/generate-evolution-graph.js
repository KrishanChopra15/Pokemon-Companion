const path = require("path");

const {
    loadJSON,
    saveJSON
} = require("../utils/json");

const {
    buildEvolutionGraph
} = require("../utils/evolution");

const {
    printPhase,
    printSuccess,
    printOutputFile,
    printError
} = require("../utils/logger");

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/generated/evolution-graph.json"
);

function generateEvolutionGraph(
    {
        verbose = true
    } = {}
) {

    try {

        const evolutionChains =
            loadJSON(
                "evolutions.json"
            );

        const evolutionGraph =
            buildEvolutionGraph(
                evolutionChains
            );

        saveJSON(
            OUTPUT_FILE,
            evolutionGraph
        );

        if (verbose) {

            printSuccess(
                `Generated ${evolutionGraph.length} evolution graph entries`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        }

        return {

            count:
                evolutionGraph.length,

            output:
                OUTPUT_FILE

        };

    } catch (error) {

        if (verbose) {

            printError(
                error,
                "Error generating evolution graph"
            );

        }

        throw error;

    }

}

module.exports = {

    generateEvolutionGraph

};

if (require.main === module) {

    (async () => {

        try {

            printPhase(
                "Phase 8 - Evolution Graph Generation"
            );

            await generateEvolutionGraph();

        } catch (error) {

            printError(
                error,
                "Error generating evolution graph"
            );

        }

    })();

}
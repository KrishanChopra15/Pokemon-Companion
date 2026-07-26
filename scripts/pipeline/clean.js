const fs = require("fs");
const path = require("path");

const {
    printPhase,
    printSuccess,
    printError,
    printPipelineStep,
    printPipelineSuccess,
    printPipelineFooter,
    formatElapsedTime,
    printSummary
} = require("../utils/logger");

const DIRECTORIES = [

    {
        name: "Generated",
        icon: "🧹",
        path: path.join(
            __dirname,
            "../../generated"
        )
    }

];

async function clean(
    {
        nested = false
    } = {}
) {

    const startTime =
        Date.now();

    const summary = [];

    try {

        if (!nested) {

            printPhase(
                "Pokémon Companion Clean Pipeline"
            );

        }

        for (

            let index = 0;

            index < DIRECTORIES.length;

            index++

        ) {

            const directory =
                DIRECTORIES[index];

            const directoryName =
                path.basename(
                    directory.path
                );

            printPipelineStep(

                index + 1,

                DIRECTORIES.length,

                `${directory.icon} ${directory.name}`

            );

            if (

                fs.existsSync(
                    directory.path
                )

            ) {

                fs.rmSync(

                    directory.path,

                    {

                        recursive: true,

                        force: true

                    }

                );

                printPipelineSuccess(
                    `${directoryName}/ removed`
                );

                summary.push({

                    label: directory.name,

                    value: "Removed"

                });

            }

            else {

                printPipelineSuccess(
                    `${directoryName}/ already clean`
                );

                summary.push({

                    label: directory.name,

                    value: "Already clean"

                });

            }

        }

        const elapsed =
            formatElapsedTime(

                Date.now() -
                startTime

            );

        if (!nested) {

            printPipelineFooter(

                elapsed,

                DIRECTORIES.length,

                DIRECTORIES.length

            );

            printSummary(

                "Clean Summary",

                summary

            );

            printSuccess(
                "Pokémon Companion generated files are clean."
            );

        }

        return {

            success: true,

            elapsed

        };

    }

    catch (error) {

        if (!nested) {

            printError(
                error,
                "Clean pipeline failed"
            );

        }

        return {

            success: false,

            error

        };

    }

}

module.exports = {

    clean

};

if (require.main === module) {

    clean();

}
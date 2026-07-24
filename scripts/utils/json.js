const fs = require("fs");
const path = require("path");

const DATABASE_DIR = path.join(
    __dirname,
    "../../database"
);

function loadJSON(file) {

    return JSON.parse(

        fs.readFileSync(

            path.join(
                DATABASE_DIR,
                file
            ),

            "utf8"

        )

    );

}

function saveJSON(outputFile, data) {

    const outputDir =
        path.dirname(outputFile);

    if (!fs.existsSync(outputDir)) {

        fs.mkdirSync(
            outputDir,
            {
                recursive: true
            }
        );

    }

    fs.writeFileSync(

        outputFile,

        JSON.stringify(
            data,
            null,
            4
        )

    );

}

module.exports = {

    DATABASE_DIR,

    loadJSON,

    saveJSON

};
const fs = require("node:fs");
const path = require("node:path");

const SHOWDOWN_ROOT = path.join(
    __dirname,
    "../../database/external/showdown"
);

const KEYWORDS = [

    "tm",
    "hm",
    "tr",
    "machine",
    "machines"

];

const EXTENSIONS = new Set([

    ".js",
    ".ts",
    ".json"

]);

function searchFile(filePath) {

    const text = fs.readFileSync(
        filePath,
        "utf8"
    );

    const lower =
        text.toLowerCase();

    let found = false;

    for (const keyword of KEYWORDS) {

        if (
            lower.includes(keyword)
        ) {

            found = true;
            break;

        }

    }

    if (!found) {

        return;

    }

    console.log();
    console.log(
        "=".repeat(80)
    );
    console.log(filePath);

    const lines =
        text.split("\n");

    lines.forEach(

        (line, index) => {

            const lowerLine =
                line.toLowerCase();

            if (

                KEYWORDS.some(
                    keyword =>
                        lowerLine.includes(keyword)
                )

            ) {

                console.log(

                    `${String(index + 1).padStart(5)} | ${line}`

                );

            }

        }

    );

}

function walk(directory) {

    const entries =
        fs.readdirSync(
            directory,
            {
                withFileTypes: true
            }
        );

    for (const entry of entries) {

        const fullPath =
            path.join(
                directory,
                entry.name
            );

        if (entry.isDirectory()) {

            if (

                entry.name === "node_modules" ||

                entry.name === ".git" ||

                entry.name === "dist" ||

                entry.name === "logs"

            ) {

                continue;

            }

            walk(fullPath);

            continue;

        }

        if (

            !EXTENSIONS.has(
                path.extname(
                    entry.name
                )
            )

        ) {

            continue;

        }

        searchFile(
            fullPath
        );

    }

}

walk(
    SHOWDOWN_ROOT
);
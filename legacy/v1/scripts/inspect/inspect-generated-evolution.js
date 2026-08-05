const path = require("node:path");

const evolutions = require(
    path.join(
        __dirname,
        "../../database/generated/evolutions.json"
    )
);

const speciesId =
    (
        process.argv[2] ||
        ""
    ).toLowerCase();

if (!speciesId) {

    console.log(
        "Usage:"
    );

    console.log(
        "node scripts/inspect/inspect-generated-evolution.js <species>"
    );

    process.exit(1);

}

const history =
    evolutions[speciesId];

if (!history) {

    console.log(
        `No evolution history found for "${speciesId}".`
    );

    process.exit(1);

}

console.log(
    JSON.stringify(
        history,
        null,
        2
    )
);
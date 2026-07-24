const Database = require("better-sqlite3");
const path = require("path");

function openVeekunDatabase() {
    return new Database(
        path.join(
            __dirname,
            "../../database/external/veekun/veekun-pokedex.sqlite"
        ),
        {
            readonly: true
        }
    );
}

function withVeekunDatabase(
    callback
) {

    const database =
        openVeekunDatabase();

    try {

        return callback(
            database
        );

    } finally {

        database.close();

    }

}

module.exports = {
    openVeekunDatabase,
    withVeekunDatabase
};
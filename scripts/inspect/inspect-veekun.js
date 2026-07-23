const Database = require("better-sqlite3");
const path = require("path");

const DATABASE = path.join(
    __dirname,
    "../../database/external/veekun/veekun-pokedex.sqlite"
);

const db = new Database(DATABASE, {
    readonly: true
});

console.log("Connected to Veekun!\n");

// Show all tables
const tables = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type='table'
    ORDER BY name;
`).all();

console.log("Tables:\n");

for (const table of tables) {

    console.log(table.name);

}

db.close();     
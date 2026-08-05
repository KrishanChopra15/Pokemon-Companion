'use strict';

const Database = require('better-sqlite3');
const path = require('path');

const databasePath = path.join(
    __dirname,
    '../../database/external/veekun/veekun-pokedex.sqlite',
);

const db = new Database(databasePath, {
    readonly: true,
});

function getTables() {
    return db.prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        ORDER BY name;
    `).all();
}

console.log('Connected to Veekun.\n');

for (const table of getTables()) {
    console.log(table.name);
}

db.close();
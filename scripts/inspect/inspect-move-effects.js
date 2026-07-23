const Database = require("better-sqlite3");
const path = require("path");

const database = new Database(
    path.join(
        __dirname,
        "../../database/external/veekun/veekun-pokedex.sqlite"
    ),
    {
        readonly: true
    }
);

console.log("\n=== move_effects ===\n");

console.table(
    database.prepare(`
        PRAGMA table_info(move_effects);
    `).all()
);

console.table(
    database.prepare(`
        SELECT *
        FROM move_effects
        LIMIT 10;
    `).all()
);

console.log("\n=== move_effect_prose ===\n");

console.table(
    database.prepare(`
        PRAGMA table_info(move_effect_prose);
    `).all()
);

console.table(
    database.prepare(`
        SELECT *
        FROM move_effect_prose
        LIMIT 10;
    `).all()
);

console.log("\n=== move_effect_changelog ===\n");

console.table(
    database.prepare(`
        PRAGMA table_info(move_effect_changelog);
    `).all()
);

console.table(
    database.prepare(`
        SELECT *
        FROM move_effect_changelog
        LIMIT 10;
    `).all()
);

console.log("\n=== move_effect_changelog_prose ===\n");

console.table(
    database.prepare(`
        PRAGMA table_info(move_effect_changelog_prose);
    `).all()
);

console.table(
    database.prepare(`
        SELECT *
        FROM move_effect_changelog_prose
        LIMIT 10;
    `).all()
);

database.close();
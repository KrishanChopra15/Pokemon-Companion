const Database = require("better-sqlite3");
const path = require("path");

const DATABASE = path.join(
    __dirname,
    "../../database/external/veekun/veekun-pokedex.sqlite"
);

const db = new Database(
    DATABASE,
    {
        readonly: true
    }
);

const rows = db.prepare(`
    SELECT
        mc.move_id,
        vg.identifier AS version_group,
        mc.type_id,
        mc.power,
        mc.pp,
        mc.accuracy,
        mc.priority,
        mc.target_id,
        mc.effect_id,
        mc.effect_chance
    FROM move_changelog mc
    JOIN version_groups vg
        ON mc.changed_in_version_group_id = vg.id
    ORDER BY mc.move_id, vg."order"
    LIMIT 30;
`).all();

console.table(rows);

db.close();
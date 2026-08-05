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

const rows = database.prepare(`
    SELECT
        mec.id,
        mec.effect_id,
        mec.changed_in_version_group_id,
        vg.identifier AS version_group,
        mecp.effect
    FROM move_effect_changelog mec
    JOIN version_groups vg
        ON vg.id = mec.changed_in_version_group_id
    JOIN move_effect_changelog_prose mecp
        ON mecp.move_effect_changelog_id = mec.id
    WHERE mecp.local_language_id = 9
    ORDER BY
        vg."order";
`).all();

console.log(
    "Historical effect changes:",
    rows.length
);

console.table(
    rows.slice(0, 20)
);

database.close();
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
        ac.id,
        ac.ability_id,
        ac.changed_in_version_group_id,
        vg.identifier AS version_group,
        acp.effect
    FROM ability_changelog ac
    JOIN ability_changelog_prose acp
        ON acp.ability_changelog_id = ac.id
    JOIN version_groups vg
        ON vg.id = ac.changed_in_version_group_id
    WHERE
        acp.local_language_id = 9
    ORDER BY
        ac.ability_id,
        vg."order";
`).all();

console.log(
    `Historical ability changes: ${rows.length}`
);

console.table(
    rows.slice(0, 30)
);

database.close();
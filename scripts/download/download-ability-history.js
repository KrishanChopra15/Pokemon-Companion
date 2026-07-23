const Database = require("better-sqlite3");
const path = require("path");

const {
    saveJSON,
    createLookupMap,
    cleanEffectText,
    createVersionGroupReference
} = require("../utils");

const versionGroups = require(
    "../../database/version-groups.json"
);

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/history/ability-history.json"
);

const versionGroupMap = createLookupMap(
    versionGroups
);

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
        ac.ability_id,
        ac.changed_in_version_group_id,
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

const history = new Map();

for (const row of rows) {

    if (!history.has(row.ability_id)) {

        history.set(
            row.ability_id,
            []
        );

    }

    const versionGroup =
        versionGroupMap.get(
            row.changed_in_version_group_id
        );
    
    history.get(
        row.ability_id
    ).push({
    
        versionGroup:
            createVersionGroupReference(
                versionGroup
            ),
        
        effect:
            cleanEffectText(
                row.effect
            )
        
    });

}

const output = Object.fromEntries(
    history
);

saveJSON(
    OUTPUT_FILE,
    output
);

console.log(
    `Successfully saved history for ${history.size} abilities.`
);

database.close();
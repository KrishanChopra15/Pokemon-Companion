const Database = require("better-sqlite3");
const path = require("path");

const {
    saveJSON,
    createLookupMap,
    cleanEffectText,
    createVersionGroupReference,
    createTypeReference,
    createTargetReference
} = require("../utils");

const versionGroups = require(
    "../../database/version-groups.json"
);

const types = require(
    "../../database/types.json"
);

const legacyTypes = require(
    "../../database/legacy/types.json"
);

const moveTargets = require(
    "../../database/move-targets.json"
);

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/history/move-history.json"
);

const versionGroupMap =
    createLookupMap(
        versionGroups
    );

const typeMap = createLookupMap(
    types,
    legacyTypes
);

const targetMap =
    createLookupMap(
        moveTargets
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
        mc.move_id,
        mc.changed_in_version_group_id,
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
        ON vg.id = mc.changed_in_version_group_id
    ORDER BY
        mc.move_id,
        vg."order";
`).all();

const history = new Map();

for (const row of rows) {

    if (!history.has(row.move_id)) {

        history.set(
            row.move_id,
            []
        );

    }

    const change = {

        versionGroup:
            createVersionGroupReference(
                versionGroupMap.get(
                    row.changed_in_version_group_id
                )
            )

    };

    if (row.power !== null) {

        change.power = row.power;

    }

    if (row.pp !== null) {

        change.pp = row.pp;

    }

    if (row.accuracy !== null) {

        change.accuracy = row.accuracy;

    }

    if (row.priority !== null) {

        change.priority = row.priority;

    }

    if (row.effect_chance !== null) {

        change.effectChance =
            row.effect_chance;

    }

    if (row.type_id) {

        change.type =
            createTypeReference(
                typeMap.get(
                    row.type_id
                )
            );

    }

    if (row.target_id) {

        change.target =
            createTargetReference(
                targetMap.get(
                    row.target_id
                )
            );

    }

    history.get(
        row.move_id
    ).push(
        change
    );

}

const output = Object.fromEntries(
    history
);

saveJSON(
    OUTPUT_FILE,
    output
);

console.log(
    `Successfully saved history for ${history.size} moves.`
);

database.close();
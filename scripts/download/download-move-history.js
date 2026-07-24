const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    createLookupMap
} = require("../utils/helpers");

const {
    createVersionGroupReference,
    createTypeReference,
    createTargetReference
} = require("../utils/references");

const {
    withVeekunDatabase
} = require("../utils/database");

const {
    printSuccess,
    printOutputFile,
    printError
} = require("../utils/logger");

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

function downloadMoveHistory() {

    try {

        withVeekunDatabase(database => {

            const versionGroupMap =
                createLookupMap(
                    versionGroups
                );

            const typeMap =
                createLookupMap(
                    types,
                    legacyTypes
                );

            const targetMap =
                createLookupMap(
                    moveTargets
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

                const versionGroup =
                    versionGroupMap.get(
                        row.changed_in_version_group_id
                    );

                const change = {

                    versionGroup:
                        createVersionGroupReference(
                            versionGroup,
                            true
                        )

                };

                if (row.power !== null) {

                    change.power =
                        row.power;

                }

                if (row.pp !== null) {

                    change.pp =
                        row.pp;

                }

                if (row.accuracy !== null) {

                    change.accuracy =
                        row.accuracy;

                }

                if (row.priority !== null) {

                    change.priority =
                        row.priority;

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

                if (

                    Object.keys(change).length > 1

                ) {

                    history.get(
                        row.move_id
                    ).push(
                        change
                    );

                }

            }

            for (const [moveId, entries] of history) {

                if (entries.length === 0) {

                    history.delete(
                        moveId
                    );

                }

            }

            saveJSON(
                OUTPUT_FILE,
                Object.fromEntries(
                    history
                )
            );

            printSuccess(
                `Downloaded history for ${history.size} moves`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        });

    } catch (error) {

        printError(
            error,
            "Error downloading move history"
        );

    }

}

downloadMoveHistory();
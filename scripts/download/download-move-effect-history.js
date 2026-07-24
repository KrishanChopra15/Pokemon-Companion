const path = require("path");

const {
    saveJSON
} = require("../utils/json");

const {
    createLookupMap
} = require("../utils/helpers");

const {
    cleanEffectText
} = require("../utils/formatting");

const {
    createVersionGroupReference
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

const OUTPUT_FILE = path.join(
    __dirname,
    "../../database/history/move-effect-history.json"
);

function downloadMoveEffectHistory() {

    try {

        withVeekunDatabase(database => {

            const versionGroupMap =
                createLookupMap(
                    versionGroups
                );

            const rows = database.prepare(`
                SELECT
                    mec.id,
                    mec.effect_id,
                    mec.changed_in_version_group_id,
                    mep.short_effect,
                    mecp.effect
                FROM move_effect_changelog mec
                JOIN move_effect_changelog_prose mecp
                    ON mecp.move_effect_changelog_id = mec.id
                JOIN move_effect_prose mep
                    ON mep.move_effect_id = mec.effect_id
                JOIN version_groups vg
                    ON vg.id = mec.changed_in_version_group_id
                WHERE
                    mecp.local_language_id = 9
                    AND mep.local_language_id = 9
                ORDER BY
                    mec.effect_id,
                    vg."order";
            `).all();

            const history = new Map();

            for (const row of rows) {

                if (!history.has(row.effect_id)) {

                    history.set(
                        row.effect_id,
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

                const shortEffect =
                    cleanEffectText(
                        row.short_effect
                    );

                if (shortEffect) {

                    change.shortEffect =
                        shortEffect;

                }

                const effect =
                    cleanEffectText(
                        row.effect
                    );

                if (effect) {

                    change.effect =
                        effect;

                }

                if (

                    Object.keys(change).length > 1

                ) {

                    history.get(
                        row.effect_id
                    ).push(
                        change
                    );

                }

            }

            for (const [effectId, entries] of history) {

                if (

                    entries.length === 0

                ) {

                    history.delete(
                        effectId
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
                `Downloaded history for ${history.size} move effects`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        });

    } catch (error) {

        printError(
            error,
            "Error downloading move effect history"
        );

    }

}

downloadMoveEffectHistory();
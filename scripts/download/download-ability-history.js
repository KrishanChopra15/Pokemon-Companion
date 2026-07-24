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
    "../../database/history/ability-history.json"
);

function downloadAbilityHistory() {

    try {

        withVeekunDatabase(database => {

            const versionGroupMap =
                createLookupMap(
                    versionGroups
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
                            versionGroup,
                            true
                        ),

                    effect:
                        cleanEffectText(
                            row.effect
                        )

                });

            }

            saveJSON(
                OUTPUT_FILE,
                Object.fromEntries(
                    history
                )
            );

            printSuccess(
                `Downloaded history for ${history.size} abilities`
            );

            printOutputFile(
                OUTPUT_FILE
            );

        });

    } catch (error) {

        printError(
            error,
            "Error downloading ability history"
        );

    }

}

downloadAbilityHistory();
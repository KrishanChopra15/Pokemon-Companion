const fs = require("fs");
const path = require("path");

const {
    DATABASE_DIR,
    MOVE_HISTORY_FIELDS,
    MOVE_EFFECT_HISTORY_FIELDS,
    errors
} = require("./validation-context");

const {
    createIdLookup,
    validateChronologicalHistory,
    validateNotEmptyString,
    validateNonNegativeNumber,
    validateRange
} = require("./validation-utils");

function validateAbilityHistory(
    {
        verbose = true
    } = {}
) {

    const history = JSON.parse(

        fs.readFileSync(

            path.join(
                DATABASE_DIR,
                "history/ability-history.json"
            ),

            "utf8"

        )

    );

    const versionGroups =
        createIdLookup(
            "version-groups.json"
        );

    for (

        const [

            abilityId,

            entries

        ] of Object.entries(
            history
        )

    ) {

        validateChronologicalHistory(

            "ability-history.json",

            `Ability ${abilityId}`,

            entries

        );

        for (const entry of entries) {

            if (

                !versionGroups.has(
                    entry.versionGroup.id
                )

            ) {

                errors.push(
                    `ability-history.json: Ability ${abilityId} has invalid version group ${entry.versionGroup.id}.`
                );

            }

            validateNotEmptyString(

                "ability-history.json",

                `Ability ${abilityId}`,

                "effect",

                entry.effect

            );

        }

    }

    if (verbose) {

        console.log(
            "✓ history/ability-history.json"
        );

    }

}

function validateMoveHistory(
    {
        verbose = true
    } = {}
) {

    const history = JSON.parse(

        fs.readFileSync(

            path.join(
                DATABASE_DIR,
                "history/move-history.json"
            ),

            "utf8"

        )

    );

    const versionGroups =
        createIdLookup(
            "version-groups.json"
        );

    const typeIds = new Set([

        ...JSON.parse(

            fs.readFileSync(

                path.join(
                    DATABASE_DIR,
                    "types.json"
                ),

                "utf8"

            )

        ).map(
            type => type.id
        ),

        ...JSON.parse(

            fs.readFileSync(

                path.join(
                    DATABASE_DIR,
                    "legacy/types.json"
                ),

                "utf8"

            )

        ).map(
            type => type.id
        )

    ]);

    const targetIds =
        createIdLookup(
            "move-targets.json"
        );

    const moves =
        createIdLookup(
            "moves.json"
        );

    for (

        const [

            moveId,

            entries

        ] of Object.entries(
            history
        )

    ) {

        if (

            !moves.has(
                Number(moveId)
            )

        ) {

            errors.push(
                `move-history.json: Unknown move ${moveId}.`
            );

            continue;

        }

        if (

            entries.length === 0

        ) {

            errors.push(
                `move-history.json: Move ${moveId} has an empty history array.`
            );

            continue;

        }

        validateChronologicalHistory(

            "move-history.json",

            `Move ${moveId}`,

            entries

        );

        for (const entry of entries) {

            const hasChange =
                MOVE_HISTORY_FIELDS.some(
                    field => field in entry
                );

            if (!hasChange) {

                errors.push(
                    `move-history.json: Move ${moveId} contains a history entry with no tracked changes.`
                );

                continue;

            }

            if (

                !versionGroups.has(
                    entry.versionGroup.id
                )

            ) {

                errors.push(
                    `move-history.json: Move ${moveId} has invalid version group ${entry.versionGroup.id}.`
                );

            }

            if (

                entry.type &&

                !typeIds.has(
                    entry.type.id
                )

            ) {

                errors.push(
                    `move-history.json: Move ${moveId} has invalid type ${entry.type.id}.`
                );

            }

            if (

                entry.target &&

                !targetIds.has(
                    entry.target.id
                )

            ) {

                errors.push(
                    `move-history.json: Move ${moveId} has invalid target ${entry.target.id}.`
                );

            }

            if ("power" in entry) {

                validateNonNegativeNumber(
                    "move-history.json",
                    `Move ${moveId}`,
                    "power",
                    entry.power,
                    true
                );

            }

            if ("pp" in entry) {

                validateNonNegativeNumber(
                    "move-history.json",
                    `Move ${moveId}`,
                    "pp",
                    entry.pp,
                    true
                );

            }

            if ("accuracy" in entry) {

                validateRange(
                    "move-history.json",
                    `Move ${moveId}`,
                    "accuracy",
                    entry.accuracy,
                    0,
                    100,
                    true
                );

            }

            if ("priority" in entry) {

                validateRange(
                    "move-history.json",
                    `Move ${moveId}`,
                    "priority",
                    entry.priority,
                    -7,
                    7,
                    true
                );

            }

            if ("effectChance" in entry) {

                validateRange(
                    "move-history.json",
                    `Move ${moveId}`,
                    "effectChance",
                    entry.effectChance,
                    0,
                    100,
                    true
                );

            }

        }

    }

    if (verbose) {

        console.log(
            "✓ history/move-history.json"
        );

    }

}

function validateMoveEffectHistory(
    {
        verbose = true
    } = {}
) {

    const history = JSON.parse(

        fs.readFileSync(

            path.join(
                DATABASE_DIR,
                "history/move-effect-history.json"
            ),

            "utf8"

        )

    );

    const versionGroups =
        createIdLookup(
            "version-groups.json"
        );

    for (

        const [

            effectId,

            entries

        ] of Object.entries(
            history
        )

    ) {

        if (

            entries.length === 0

        ) {

            errors.push(
                `move-effect-history.json: Effect ${effectId} has an empty history array.`
            );

            continue;

        }

        validateChronologicalHistory(

            "move-effect-history.json",

            `Effect ${effectId}`,

            entries

        );

        for (const entry of entries) {

            const hasChange =

                MOVE_EFFECT_HISTORY_FIELDS.some(

                    field => field in entry

                );

            if (!hasChange) {

                errors.push(
                    `move-effect-history.json: Effect ${effectId} contains a history entry with no tracked changes.`
                );

                continue;

            }

            if (

                !versionGroups.has(
                    entry.versionGroup.id
                )

            ) {

                errors.push(
                    `move-effect-history.json: Effect ${effectId} has invalid version group ${entry.versionGroup.id}.`
                );

            }

            if ("effect" in entry) {

                validateNotEmptyString(

                    "move-effect-history.json",

                    `Effect ${effectId}`,

                    "effect",

                    entry.effect

                );

            }

            if ("shortEffect" in entry) {

                validateNotEmptyString(

                    "move-effect-history.json",

                    `Effect ${effectId}`,

                    "shortEffect",

                    entry.shortEffect

                );

            }

        }

    }

    if (verbose) {

        console.log(
            "✓ history/move-effect-history.json"
        );

    }

}

function validateHistory(
    {
        verbose = true
    } = {}
) {

    if (verbose) {

        console.log(
            "Phase 7 - History validation..."
        );

    }

    validateAbilityHistory({
        verbose
    });

    validateMoveHistory({
        verbose
    });

    validateMoveEffectHistory({
        verbose
    });

    if (verbose) {

        console.log("");

    }

}

module.exports = {

    validateAbilityHistory,

    validateMoveHistory,

    validateMoveEffectHistory,

    validateHistory

};
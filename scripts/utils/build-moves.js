const {
    cleanFlavorText
} = require("./formatting");

const {
    hasFlag,
    getIdFromUrl,
    createLookupMap,
    sortByProperty
} = require("./helpers");

const {
    createNamedApiReference,
    createVersionGroupReference
} = require("./references");

/**
 * Builds a map of
 * version-group -> flavor text.
 */
function buildFlavorMap(
    flavorEntries = []
) {

    const flavorMap = new Map();

    for (const entry of flavorEntries) {

        if (
            entry.language?.name !== "en"
        ) {

            continue;

        }

        flavorMap.set(

            entry.version_group.name,

            cleanFlavorText(
                entry.flavor_text
            )

        );

    }

    return flavorMap;

}

/**
 * Builds the ordered
 * move history.
 */
function buildMoveHistory(
    pastValues = [],
    versionGroups = []
) {

    const history = [];

    const versionGroupMap =
        createLookupMap(
            versionGroups,
            "apiName"
        );

    for (const past of pastValues) {

        const versionGroup =
            versionGroupMap.get(
                past.version_group.name
            );

        if (!versionGroup) {

            continue;

        }

        history.push({

            order:
                versionGroup.order,

            data:
                past

        });

    }

    sortByProperty(
        history,
        "order"
    );

    return history;

}

/**
 * Creates the version table
 * for a move.
 */
function buildMoveVersions(

    move,

    history,

    flavorMap,

    versionGroups

) {

    const versions = [];

    for (const versionGroup of versionGroups) {

        let power =
            move.power;

        let accuracy =
            move.accuracy;

        let pp =
            move.pp;

        let effectChance =
            move.effect_chance;

        let type =
            move.type;

        for (const change of history) {

            if (
                change.order >
                versionGroup.order
            ) {

                break;

            }

            const past =
                change.data;

            if (
                past.power !== null
            ) {

                power =
                    past.power;

            }

            if (
                past.accuracy !== null
            ) {

                accuracy =
                    past.accuracy;

            }

            if (
                past.pp !== null
            ) {

                pp =
                    past.pp;

            }

            if (
                past.effect_chance !== null
            ) {

                effectChance =
                    past.effect_chance;

            }

            if (
                past.type !== null
            ) {

                type =
                    past.type;

            }

        }

        versions.push({

            versionGroup:
                createVersionGroupReference(
                    versionGroup,
                    true
                ),

            power,

            accuracy,

            pp,

            effectChance,

            type:
                createNamedApiReference(
                    type
                ),

            description:

                flavorMap.get(
                    versionGroup.apiName
                ) ?? null

        });

    }

    return versions;

}

/**
 * Creates move flags.
 */
function createMoveFlags(
    flags = []
) {

    return {

        contact:
            hasFlag(
                flags,
                "contact"
            ),

        protect:
            hasFlag(
                flags,
                "protect"
            ),

        mirror:
            hasFlag(
                flags,
                "mirror"
            ),

        sound:
            hasFlag(
                flags,
                "sound"
            ),

        punch:
            hasFlag(
                flags,
                "punch"
            ),

        bite:
            hasFlag(
                flags,
                "bite"
            ),

        pulse:
            hasFlag(
                flags,
                "pulse"
            ),

        powder:
            hasFlag(
                flags,
                "powder"
            ),

        heal:
            hasFlag(
                flags,
                "heal"
            )

    };

}

/**
 * Creates contest data.
 */
function createMoveContest(
    move
) {

    return {

        type:
            move.contest_type
                ? createNamedApiReference(
                    move.contest_type
                )
                : null,

        effect:
            move.contest_effect
                ? getIdFromUrl(
                    move.contest_effect.url
                )
                : null,

        superEffect:
            move.super_contest_effect
                ? getIdFromUrl(
                    move.super_contest_effect.url
                )
                : null

    };

}

/**
 * Creates move metadata.
 */
function createMoveMeta(
    meta
) {

    if (!meta) {

        return null;

    }

    return {

        ailment:
            meta.ailment
                ? createNamedApiReference(
                    meta.ailment
                )
                : null,

        category:
            meta.category
                ? createNamedApiReference(
                    meta.category
                )
                : null,

        minHits:
            meta.min_hits,

        maxHits:
            meta.max_hits,

        minTurns:
            meta.min_turns,

        maxTurns:
            meta.max_turns,

        drain:
            meta.drain,

        healing:
            meta.healing,

        critRate:
            meta.crit_rate,

        ailmentChance:
            meta.ailment_chance,

        flinchChance:
            meta.flinch_chance,

        statChance:
            meta.stat_chance

    };

}

/**
 * Creates stat change data.
 */
function createStatChanges(
    statChanges = []
) {

    return statChanges.map(

        change => ({

            stat:
                createNamedApiReference(
                    change.stat
                ),

            change:
                change.change

        })

    );

}

/**
 * Creates the lightweight lookup object
 * used throughout the frontend.
 */
function createMoveLookup(
    move
) {

    return {

        id:
            move.id,

        identifier:
            move.identifier,

        name:
            move.name,

        typeId:
            move.typeId,

        damageClassId:
            move.damageClassId,

        power:
            move.power,

        accuracy:
            move.accuracy,

        pp:
            move.pp,

        priority:
            move.priority

    };

}

module.exports = {

    buildFlavorMap,
    buildMoveHistory,
    buildMoveVersions,
    createMoveFlags,
    createMoveContest,
    createMoveMeta,
    createStatChanges,
    createMoveLookup

};
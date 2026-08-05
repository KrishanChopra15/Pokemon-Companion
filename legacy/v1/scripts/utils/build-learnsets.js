const {
    getIdFromUrl
} = require("./helpers");

/**
 * Converts PokéAPI learn methods into
 * Pokémon Companion learn methods.
 */
function normalizeLearnMethod(
    method
) {

    switch (method) {

        case "level-up":
            return "level-up";

        case "machine":
            return "machine";

        case "tutor":
            return "tutor";

        case "egg":
            return "egg";

        case "train":
            return "train";

        case "form-change":
            return "form-change";

        case "xd-purification":
            return "purification";

        case "light-ball-egg":
        case "stadium-surfing-pikachu":
        case "zygarde-cube":
            return "special";

        default:
            return "unknown";

    }

}

/**
 * Creates a normalized learn entry.
 */
function createLearnEntry(
    move,
    detail
) {

    return {

        moveId:
            getIdFromUrl(
                move.move.url
            ),

        versionGroupId:
            getIdFromUrl(
                detail.version_group.url
            ),

        method:
            normalizeLearnMethod(
                detail.move_learn_method.name
            ),

        level:
            detail.level_learned_at

    };

}

/**
 * Builds the normalized learnset
 * for a single Pokémon.
 */
function buildLearnsets(
    pokemon
) {

    const learnsets = [];

    for (const move of pokemon.moves) {

        for (const detail of move.version_group_details) {

            learnsets.push(

                createLearnEntry(
                    move,
                    detail
                )

            );

        }

    }

    return learnsets;

}

module.exports = {

    normalizeLearnMethod,

    createLearnEntry,

    buildLearnsets

};
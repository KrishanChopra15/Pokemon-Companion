const {
    loadJSON
} = require("./json");

const moves =
    loadJSON(
        "moves.json"
    );

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

function getMoveById(
    moveId
) {

    return moves.find(
        move =>
            move.id === moveId
    ) || null;

}

function getMoveVersion(
    move,
    versionGroupId
) {

    return move.versions.find(

        version =>

            version.versionGroup.id ===
            versionGroupId

    ) || null;

}

/* ---------------------------------- */
/* Exports                            */
/* ---------------------------------- */

module.exports = {

    getMoveById,

    getMoveVersion

};
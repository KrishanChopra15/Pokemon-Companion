const {
    loadJSON
} = require("./json");

const {
    getMoveById
} = require("./moves");

const learnsets =
    loadJSON(
        "generated/learnset-database.json"
    );

const {
    COLOURS,
    colour,
    printDivider,
    printSection,
    printSubSection
} = require("./logger");

const MOVE_SECTIONS = {

    levelUp: "Level Up",

    machine: "TM / Machine",

    tutor: "Tutor",

    egg: "Egg",

    event: "Event",

    special: "Special",

    preEvolution: "Pre-Evolution",

    formChange: "Form Change",

    purification: "Purification",

    train: "Train"

};

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

function getLearnset(
    speciesId
) {

    return learnsets.find(
        entry =>
            entry.speciesId === speciesId
    ) || null;

}

function getVersionLearnset(
    speciesId,
    versionGroupId
) {

    const learnset =
        getLearnset(
            speciesId
        );

    if (!learnset) {

        return null;

    }

    return (

        learnset.versions[
            String(
                versionGroupId
            )
        ] || null

    );

}

function printMoveSection(
    title,
    moves,
    formatter
) {

    if (
        !moves ||
        moves.length === 0
    ) {

        return;

    }

    printSubSection(
        `${title} (${moves.length})`
    );

    for (const entry of moves) {

        console.log(
            formatter(entry)
        );

    }

    console.log();

}

function padLevel(
    level
) {

    return String(
        level
    ).padStart(
        3,
        " "
    );

}

function formatLevelMove(
    learn
) {

    const move =
        getMoveById(
            learn.moveId
        );

    const level =
        colour(
            COLOURS.YELLOW,
            padLevel(
                learn.level
            )
        );

    const name =
        colour(
            COLOURS.BOLD + COLOURS.WHITE,
            move
                ? move.name
                : `#${learn.moveId}`
        );

    return `  ⭐ Lv. ${level}  ${name}`;

}

function formatMove(
    moveId
) {

    const move =
        getMoveById(
            moveId
        );

    const name =
        colour(
            COLOURS.WHITE,
            move
                ? move.name
                : `#${moveId}`
        );

    return `  ⚪ ${name}`;

}

function sortMoveIds(
    moveIds
) {

    return [

        ...moveIds

    ].sort(

        (a, b) => {

            const moveA =
                getMoveById(a);

            const moveB =
                getMoveById(b);

            return moveA.name.localeCompare(
                moveB.name
            );

        }

    );

}

/* ---------------------------------- */
/* Printing                           */
/* ---------------------------------- */

function printLearnset(

    speciesId,

    versionGroupId = 1

) {

    const learnset =
        getVersionLearnset(

            speciesId,

            versionGroupId

        );

    if (!learnset) {

        return;

    }

    printSection(
        "📚 Moves"
    );

    console.log();

    printMoveSection(

        MOVE_SECTIONS.levelUp,

        learnset.levelUp,

        formatLevelMove

    );

    printMoveSection(

        MOVE_SECTIONS.machine,

        sortMoveIds(
            learnset.machine
        ),

        formatMove

    );

    printMoveSection(

        MOVE_SECTIONS.tutor,

        sortMoveIds(
            learnset.tutor
        ),

        formatMove

    );

    printMoveSection(

        MOVE_SECTIONS.egg,

        sortMoveIds(
            learnset.egg
        ),

        formatMove

    );

    printMoveSection(

        MOVE_SECTIONS.special,

        sortMoveIds(
            learnset.special
        ),

        formatMove

    );

    printMoveSection(

        MOVE_SECTIONS.preEvolution,

        sortMoveIds(
            learnset.preEvolution
        ),

        formatMove

    );

    printMoveSection(

        MOVE_SECTIONS.event,

        sortMoveIds(
            learnset.event
        ),

        formatMove

    );

    printMoveSection(

        MOVE_SECTIONS.formChange,

        sortMoveIds(
            learnset.formChange
        ),

        formatMove

    );

    printMoveSection(

        MOVE_SECTIONS.purification,

        sortMoveIds(
            learnset.purification
        ),

        formatMove

    );

    printMoveSection(

        MOVE_SECTIONS.train,

        sortMoveIds(
            learnset.train
        ),

        formatMove

    );

    printDivider();

    console.log();

}

/* ---------------------------------- */
/* Exports                            */
/* ---------------------------------- */

module.exports = {

    getLearnset,

    getVersionLearnset,

    printLearnset

};
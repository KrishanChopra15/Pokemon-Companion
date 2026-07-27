const {
    printBullet,
    printLabelValue,
    printSection,
    printSubSection
} = require("./logger");

const {
    loadJSON
} = require("./json");

const species =
    loadJSON(
        "species.json"
    );

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

function getSpeciesById(
    speciesId
) {

    return species.find(
        entry =>
            entry.id === speciesId
    ) || null;

}

function printSpecies(
    speciesId
) {

    const entry =
        getSpeciesById(
            speciesId
        );

    if (!entry) {

        return;

    }

    printSection(
        "📖 Species"
    );

    printLabelValue(
        "Generation",
        entry.generation.name
    );

    printLabelValue(
        "Category",
        entry.category
    );

    printLabelValue(
        "Color",
        entry.color.name
    );

    printLabelValue(
        "Shape",
        entry.shape.name
    );

    printLabelValue(
        "Habitat",
        entry.habitat.name
    );

    printLabelValue(
        "Growth Rate",
        entry.growthRate.name
    );

    console.log();

    printLabelValue(
        "Capture Rate",
        entry.captureRate
    );

    printLabelValue(
        "Base Friendship",
        entry.baseFriendship
    );

    printLabelValue(
        "Hatch Counter",
        entry.hatchCounter
    );

    console.log();

    printSubSection(
        `🪺  Egg Groups (${entry.eggGroups.length})`
    );

    entry.eggGroups.forEach(

        group =>

            printBullet(
                group.name
            )

    );

    console.log();

}

module.exports = {

    getSpeciesById,

    printSpecies

};
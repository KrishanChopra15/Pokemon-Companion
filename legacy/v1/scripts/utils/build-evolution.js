const {
    getIdFromUrl
} = require("./helpers");

const {
    formatApiName
} = require("./formatting");

/* ---------------------------------- */
/* Evolution Methods                  */
/* ---------------------------------- */

function extractEvolutionMethod(
    details = {}
) {

    return {

        trigger:
            details.trigger
                ? formatApiName(
                    details.trigger.name
                )
                : null,

        minLevel:
            details.min_level,

        item:
            details.item
                ? formatApiName(
                    details.item.name
                )
                : null,

        heldItem:
            details.held_item
                ? formatApiName(
                    details.held_item.name
                )
                : null,

        tradeSpecies:
            details.trade_species
                ? getIdFromUrl(
                    details.trade_species.url
                )
                : null,

        minHappiness:
            details.min_happiness,

        minAffection:
            details.min_affection,

        minBeauty:
            details.min_beauty,

        gender:
            details.gender,

        location:
            details.location
                ? formatApiName(
                    details.location.name
                )
                : null,

        knownMove:
            details.known_move
                ? formatApiName(
                    details.known_move.name
                )
                : null,

        knownMoveType:
            details.known_move_type
                ? formatApiName(
                    details.known_move_type.name
                )
                : null,

        partySpecies:
            details.party_species
                ? getIdFromUrl(
                    details.party_species.url
                )
                : null,

        partyType:
            details.party_type
                ? formatApiName(
                    details.party_type.name
                )
                : null,

        region:
            details.region
                ? formatApiName(
                    details.region.name
                )
                : null,

        timeOfDay:
            details.time_of_day || null,

        relativePhysicalStats:
            details.relative_physical_stats,

        turnUpsideDown:
            details.turn_upside_down,

        needsOverworldRain:
            details.needs_overworld_rain,

        nearSpecialRock:
            details.near_special_rock,

        needsMultiplayer:
            details.needs_multiplayer

    };

}

/* ---------------------------------- */
/* Evolution Graph                    */
/* ---------------------------------- */

function walkEvolutionNode(
    node,
    graph,
    parentId = null,
    stage = 1
) {

    const speciesId =
        getIdFromUrl(
            node.species.url
        );

    const evolvesTo =
        node.evolves_to.map(child => ({

            speciesId:
                getIdFromUrl(
                    child.species.url
                ),

            methods:
                child.evolution_details.map(
                    extractEvolutionMethod
                )

        }));

    graph.push({

        speciesId,

        evolvesFrom:
            parentId,

        evolvesTo,

        stage

    });

    for (const child of node.evolves_to) {

        walkEvolutionNode(

            child,

            graph,

            speciesId,

            stage + 1

        );

    }

}

function buildEvolutionGraph(
    evolutionChains
) {

    const graph = [];

    for (const chain of evolutionChains) {

        walkEvolutionNode(

            chain.chain,

            graph

        );

    }

    graph.sort(
        (a, b) =>
            a.speciesId - b.speciesId
    );

    return graph;

}

module.exports = {

    buildEvolutionGraph

};
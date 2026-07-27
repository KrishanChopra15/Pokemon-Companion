const {
    loadJSON
} = require("./json");

const {
    formatApiName
} = require("./formatting");

const {
    COLOURS,
    colour,
    printSection,
    printTree
} = require("./logger");

/* ---------------------------------- */
/* Database                           */
/* ---------------------------------- */

const evolutionGraph =
    loadJSON(
        "generated/evolution-graph.json"
    );

const pokemon =
    loadJSON(
        "pokemon.json"
    );

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

function getEvolutionNode(
    speciesId
) {

    return evolutionGraph.find(
        node =>
            node.speciesId === speciesId
    ) || null;

}

function getPokemonBySpeciesId(
    speciesId
) {

    return pokemon.find(
        entry =>
            entry.speciesId === speciesId
    ) || null;

}

/* ---------------------------------- */
/* Root                               */
/* ---------------------------------- */

function getEvolutionRoot(
    speciesId
) {

    let current =
        getEvolutionNode(
            speciesId
        );

    while (
        current &&
        current.evolvesFrom !== null
    ) {

        current =
            getEvolutionNode(
                current.evolvesFrom
            );

    }

    return current;

}

/* ---------------------------------- */
/* Chain                              */
/* ---------------------------------- */

function getEvolutionChain(
    speciesId
) {

    const root =
        getEvolutionRoot(
            speciesId
        );

    if (!root) {

        return [];

    }

    const chain = [];

    function walk(
        node
    ) {

        const pokemon =
            getPokemonBySpeciesId(
                node.speciesId
            );

        chain.push({

            speciesId:
                node.speciesId,

            stage:
                node.stage,

            pokemon

        });

        for (const child of node.evolvesTo) {

            const childNode =
                getEvolutionNode(
                    child.speciesId
                );

            if (childNode) {

                walk(
                    childNode
                );

            }

        }

    }

    walk(
        root
    );

    return chain;

}

function compact(
    values = []
) {

    return values.filter(
        value => value && value.trim()
    );

}

function formatEvolutionMethod(
    method = {}
) {

    if (!method.trigger) {

        return "Unknown";

    }

    if (method.trigger === "Level Up") {

        const parts = [];

        if (method.minLevel) {

            parts.push(
                `Lv. ${method.minLevel}`
            );

        }

        if (method.gender === 1) {

            parts.push(
                "Female"
            );

        }

        if (method.gender === 2) {

            parts.push(
                "Male"
            );

        }

        parts.push(
            formatApiName(
                method.timeOfDay
            )
        );

        if (method.minHappiness) {

            parts.push(
                "High Friendship"
            );

        }

        if (method.knownMove) {

            parts.push(
                `Knowing ${formatApiName(method.knownMove)}`
            );

        }

        if (method.location) {

            parts.push(
                `At ${formatApiName(method.location)}`
            );

        }

        const description =
            compact(
                parts
            ).join(
                " • "
            );

        return description || "Level Up";

    }

    if (method.trigger === "Trade") {

        if (method.heldItem) {

            return `Trade holding ${formatApiName(method.heldItem)}`;

        }

        return "Trade";

    }

    if (method.trigger === "Use Item") {

        return formatApiName(
            method.item
        );

    }

    return method.trigger;

}

function printEvolutionTree(
    node,
    indent = ""
) {

    node.evolvesTo.forEach(

        (
            child,
            index
        ) => {

            const isLast =
                index === node.evolvesTo.length - 1;

            const branch =
                isLast
                    ? "└──"
                    : "├──";

            const nextIndent =
                indent +
                (
                    isLast
                        ? "    "
                        : "│   "
                );

            const pokemon =
                getPokemonBySpeciesId(
                    child.speciesId
                );

            const name =
                pokemon
                    ? pokemon.name
                    : `#${child.speciesId}`;

            const method =
                formatEvolutionMethod(
                    child.methods?.[0] || {}
                );
                        
            const formattedMethod =
                colour(
                
                    COLOURS.YELLOW,
                
                    method
                
                );
            
            const formattedArrow =
                colour(
                
                    COLOURS.DIM,
                
                    " → "
                
                );
            
            const formattedName =
                colour(
                
                    COLOURS.BOLD + COLOURS.WHITE,
                
                    name
                
                );
            
            printTree(
            
                `${indent}${branch} `,
            
                `${formattedMethod}${formattedArrow}${formattedName}`
            
            );

            

            const childNode =
                getEvolutionNode(
                    child.speciesId
                );

            if (childNode) {

                printEvolutionTree(

                    childNode,

                    nextIndent

                );

            }

        }

    );

}

function printEvolution(
    speciesId
) {

    const root =
        getEvolutionRoot(
            speciesId
        );

    if (!root) {

        return;

    }

    const rootPokemon =
        getPokemonBySpeciesId(
            root.speciesId
        );

    printSection(
        "🧬 Evolution"
    );

    console.log(

        colour(

            COLOURS.BOLD + COLOURS.CYAN,

            rootPokemon
                ? rootPokemon.name
                : `#${root.speciesId}`

        )

    );

    printEvolutionTree(
        root
    );

    console.log();

}

module.exports = {

    getEvolutionChain,

    getEvolutionNode,

    getEvolutionRoot,

    getPokemonBySpeciesId,

    formatEvolutionMethod,

    printEvolution

};
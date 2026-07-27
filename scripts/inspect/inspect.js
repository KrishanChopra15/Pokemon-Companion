const {
    printHeading
} = require("./inspect-utils");

const {
    inspectStats
} = require("./inspect-stats");

const {
    inspectPokemon
} = require("./inspect-pokemon");

function inspect() {

    const [, , command, ...args] =
        process.argv;

    switch (command) {

        case "stats":

            inspectStats();

            break;

        case "pokemon":
            
            inspectPokemon(
                args.join(" ")
            );
        
            break;

        case "move":

            console.log(
                `Inspect Move: ${args.join(" ")}`
            );

            break;

        case "ability":

            console.log(
                `Inspect Ability: ${args.join(" ")}`
            );

            break;

        case "species":

            console.log(
                `Inspect Species: ${args.join(" ")}`
            );

            break;

        case "files":

            console.log(
                "Inspect Files"
            );

            break;

        default:

            console.log(
`Usage:

node scripts/inspect stats

node scripts/inspect pokemon <name|id>

node scripts/inspect species <name|id>

node scripts/inspect move <name|id>

node scripts/inspect ability <name|id>

node scripts/inspect files`
            );

    }

}

module.exports = {

    inspect

};

if (require.main === module) {

    inspect();

}
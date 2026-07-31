const {
    printHeading
} = require("./inspect-utils");

const {
    inspectStats
} = require("./inspect-stats");

const {
    inspectPokemon
} = require("./inspect-pokemon");

const {
    inspectAbility
} = require("./inspect-ability");

const {
    inspectMove
} = require("./inspect-move");

function parseInspectionArguments(
    args
) {

    const query = [];

    let limit = null;

    for (

        let index = 0;

        index < args.length;

        index++

    ) {

        const argument =
            args[index];

        if (

            argument === "--limit"

        ) {

            const value =
                Number(
                    args[index + 1]
                );

            if (

                !Number.isInteger(
                    value
                ) ||

                value < 1

            ) {

                throw new Error(
                    "--limit must be a positive number."
                );

            }

            limit =
                value;

            index++;

            continue;

        }

        query.push(
            argument
        );

    }

    return {

        query:

            query.join(
                " "
            ),

        limit

    };

}

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

            try {

                const {

                    query,

                    limit

                } = parseInspectionArguments(
                    args
                );

                inspectMove(

                    query,

                    {

                        limit

                    }

                );

            }

            catch (error) {

                console.log(
                    error.message
                );

            }

            break;

        case "ability":

            try {

                const {

                    query,

                    limit

                } = parseInspectionArguments(
                    args
                );

                inspectAbility(

                    query,

                    {

                        limit

                    }

                );

            }

            catch (error) {

                console.log(
                    error.message
                );

            }

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

node scripts/inspect move <name|id> [--limit <number>]

node scripts/inspect ability <name|id> [--limit <number>]

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
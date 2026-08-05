function getMethod(methodCode) {

    switch (methodCode) {

        case "L":
            return "level-up";

        case "M":
            return "tm";

        case "T":
            return "tutor";

        case "E":
            return "egg";

        case "S":
            return "event";

        case "V":
            return "virtual-console";

        case "D":
            return "dream-world";

        case "R":
            return "special";

        default:
            return "unknown";

    }

}

function parseLearnMethod(entry) {

    const generation =
        Number(entry[0]);

    const methodCode =
        entry[1];

    const extra =
        entry.slice(2);

    const parsed = {

        generation,

        method:
            getMethod(
                methodCode
            )

    };

    switch (methodCode) {

        case "L":

            parsed.level =
                Number(extra);

            break;

        case "S":

            parsed.event =
                Number(extra);

            break;

        default:

            if (extra.length > 0) {

                parsed.extra =
                    extra;

            }

    }

    return parsed;

}

function normaliseLearnset(
    learnset
) {

    const moves = {};

    for (

        const [

            move,

            methods

        ]

        of Object.entries(
            learnset.learnset ?? {}
        )

    ) {

        moves[move] =
            methods.map(
                parseLearnMethod
            );

    }

    return {

        learnset:
            moves,

        events:

            learnset.eventData ??

            []

    };

}

module.exports = {

    parseLearnMethod,
    normaliseLearnset

};
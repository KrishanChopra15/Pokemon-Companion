const fs = require("fs");
const path = require("path");


const SOURCE = path.join(
    __dirname,
    "../../../../References/pokefirered/src/data/trainers.h"
);


const OUTPUT = path.join(
    __dirname,
    "../../../database/raw/firered/trainers.json"
);


const text = fs.readFileSync(SOURCE, "utf8");


const trainers = {};


// Match each trainer block
const trainerRegex =
/\[([A-Z0-9_]+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/g;


let match;


while ((match = trainerRegex.exec(text)) !== null) {

    const trainerId = match[1];
    const body = match[2];


    const getField = (regex) => {
        const result = body.match(regex);
        return result ? result[1] : null;
    };


    trainers[trainerId] = {

        trainerClass: getField(
            /\.trainerClass = ([A-Z0-9_]+)/
        ),

        encounterMusic: getField(
            /\.encounterMusic_gender = ([A-Z0-9_]+)/
        ),

        trainerPic: getField(
            /\.trainerPic = ([A-Z0-9_]+)/
        ),

        trainerName: getField(
            /\.trainerName = _\("([^"]*)"\)/
        ),

        doubleBattle:
            body.includes(".doubleBattle = TRUE"),

        aiFlags: getField(
            /\.aiFlags = ([A-Z0-9_]+)/
        ),

        party: (() => {

            const party =
            body.match(
                /sParty_[A-Za-z0-9]+/
            );

            return party ? party[0] : null;

        })()

    };
}


// create folder
fs.mkdirSync(
    path.dirname(OUTPUT),
    {
        recursive:true
    }
);


fs.writeFileSync(
    OUTPUT,
    JSON.stringify(trainers,null,2)
);


console.log(
    `Generated ${Object.keys(trainers).length} trainers`
);
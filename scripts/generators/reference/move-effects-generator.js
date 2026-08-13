"use strict";

const fs = require("fs");
const path = require("path");


class MoveEffectsGenerator {


    generate(){


        const file =
        path.join(
            process.cwd(),
            "../References/pokefirered/include/constants/battle_move_effects.h"
        );


        const text =
        fs.readFileSync(
            file,
            "utf8"
        );


        const effects=[];


        const regex =
        /#define EFFECT_([A-Z0-9_]+)\s+(\d+)/g;


        let match;


        while(
            (match = regex.exec(text))
        ){

            effects.push({

                id:
                    Number(match[2]),

                constant:
                    `EFFECT_${match[1]}`,

                name:
                    this.format(match[1])

            });

        }


        const output =
        path.join(
            process.cwd(),
            "database",
            "reference",
            "move-effects.json"
        );


        fs.writeFileSync(
            output,
            JSON.stringify(
                effects,
                null,
                4
            )
        );


        console.log(
            `Generated ${output}`
        );

    }



    format(value){

        return value
        .toLowerCase()
        .replaceAll("_"," ")
        .replace(
            /\b\w/g,
            c=>c.toUpperCase()
        );

    }


}


module.exports=MoveEffectsGenerator;
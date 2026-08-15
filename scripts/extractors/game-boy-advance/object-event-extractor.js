/**
 * Pokémon Companion
 * Object Event Extractor
 *
 * Extracts map object events.
 *
 * Responsibilities:
 * - Read events.inc
 * - Extract object graphics
 * - Extract script references
 * - Extract hide flags
 * - Extract positions
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



class ObjectEventExtractor {



    extract(
        referencePath
    )
    {


        const mapsPath =
            path.join(
                referencePath,
                "data/maps"
            );



        const objects = [];



        const maps =
            fs.readdirSync(
                mapsPath
            );



        for(
            const map of maps
        )
        {


            const file =
                path.join(
                    mapsPath,
                    map,
                    "events.inc"
                );



            if(
                !fs.existsSync(file)
            )
                continue;



            const data =
                this.extractFile(
                    file,
                    map
                );



            objects.push(
                ...data
            );


        }



        return objects;


    }







    extractFile(
        file,
        map
    )
    {


        const content =
            fs.readFileSync(
                file,
                "utf8"
            );



        const objects = [];



        const regex =
        /object_event\s+(\d+),\s*([A-Z0-9_]+),\s*(\d+),\s*(\d+),\s*(\d+),\s*[A-Z0-9_]+,\s*\d+,\s*\d+,\s*[A-Z0-9_]+,\s*0,\s*([A-Za-z0-9_]+),\s*([A-Z0-9_]+)/g;



        let match;



        while(
            (match = regex.exec(content))
        )
        {


            objects.push({

                map,


                id:
                    Number(match[1]),


                graphics:
                    match[2],


                position:
                {

                    x:
                        Number(match[3]),


                    y:
                        Number(match[4]),


                    elevation:
                        Number(match[5])

                },


                script:
                    match[6],


                hideFlag:
                    match[7]


            });


        }



        return objects;


    }


}



module.exports =
ObjectEventExtractor;
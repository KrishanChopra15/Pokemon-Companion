/**
 * Pokémon Companion
 * Dialogue Extractor
 *
 * Extracts NPC dialogue text.
 *
 * Responsibilities:
 * - Read map text files.
 * - Find text labels.
 * - Extract dialogue strings.
 *
 * Does NOT:
 * - Execute dialogue.
 * - Create choices.
 */

"use strict";


const fs = require("fs");
const path = require("path");



class DialogueExtractor {



    extract(referencePath) {


        const mapsPath =
            path.join(
                referencePath,
                "data/maps"
            );



        const dialogues = {};



        const maps =
            fs.readdirSync(
                mapsPath
            );



        for(
            const map of maps
        ) {


            const mapPath =
                path.join(
                    mapsPath,
                    map
                );



            if(
                !fs.statSync(mapPath).isDirectory()
            ) continue;



            const textFile =
                path.join(
                    mapPath,
                    "text.inc"
                );



            if(
                fs.existsSync(textFile)
            ) {


                const texts =
                    this.extractTexts(
                        textFile
                    );



                Object.assign(
                    dialogues,
                    texts
                );


            }


        }



        return dialogues;


    }





    extractTexts(file) {


        const content =
            fs.readFileSync(
                file,
                "utf8"
            );



        const results = {};



        /*
         *
         * Matches:
         *
         * Label:
         * Label::
         *
         */

        const labelRegex =
            /^([A-Za-z0-9_]+)::?\s*$/gm;



        let match;



        while(
            (match = labelRegex.exec(content))
        ) {


            const id =
                match[1];



            const start =
                labelRegex.lastIndex;



            const remaining =
                content.slice(
                    start
                );



            const nextLabel =
                remaining.search(
                    /^([A-Za-z0-9_]+)::?\s*$/m
                );



            const block =
                nextLabel === -1
                    ?
                    remaining
                    :
                    remaining.slice(
                        0,
                        nextLabel
                    );



            const strings =
                [
                    ...block.matchAll(
                        /\.string\s+"([^"]*)"/g
                    )
                ]
                .map(
                    value =>
                        value[1]
                );



            if(
                strings.length > 0
            ) {


                results[id] = {

                    id,

                    text:
                        strings
                            .join("")
                            .replace(
                                /\$/g,
                                ""
                            )

                };


            }


        }



        return results;


    }


}


module.exports =
    DialogueExtractor;
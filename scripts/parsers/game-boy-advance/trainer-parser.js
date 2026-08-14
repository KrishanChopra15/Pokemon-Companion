/**
 * Pokémon Companion
 * Trainer Parser
 *
 * Parses trainer definitions from pokefirered source.
 *
 * Responsibilities:
 * - Read trainers.h
 * - Extract trainer metadata.
 * - Return trainer data.
 *
 * Does NOT:
 * - Write databases.
 * - Build generated data.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class TrainerParser {


    constructor() {

        this.source = path.join(
            __dirname,
            "../../../../References/pokefirered/src/data/trainers.h"
        );

    }



    parse() {


        const text =
            fs.readFileSync(
                this.source,
                "utf8"
            );


        const trainers = {};


        const trainerRegex =
        /\[([A-Z0-9_]+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/g;


        let match;


        while ((match = trainerRegex.exec(text)) !== null) {


            const trainerId = match[1];
            const body = match[2];


            const getField = (regex) => {

                const result =
                    body.match(regex);

                return result
                    ? result[1]
                    : null;

            };


            trainers[trainerId] = {

                trainerClass:
                    getField(
                        /\.trainerClass = ([A-Z0-9_]+)/
                    ),


                encounterMusic:
                    getField(
                        /\.encounterMusic_gender = ([A-Z0-9_]+)/
                    ),


                trainerPic:
                    getField(
                        /\.trainerPic = ([A-Z0-9_]+)/
                    ),


                trainerName:
                    getField(
                        /\.trainerName = _\("([^"]*)"\)/
                    ),


                doubleBattle:
                    body.includes(
                        ".doubleBattle = TRUE"
                    ),


                aiFlags:
                    getField(
                        /\.aiFlags = ([A-Z0-9_]+)/
                    ),


                party:
                    (() => {

                        const party =
                            body.match(
                                /sParty_[A-Za-z0-9]+/
                            );


                        return party
                            ? party[0]
                            : null;

                    })()

            };

        }


        return trainers;

    }

}


module.exports = TrainerParser;
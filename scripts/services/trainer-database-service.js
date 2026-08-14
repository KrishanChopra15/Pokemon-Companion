/**
 * Pokémon Companion
 * Trainer Database Service
 *
 * Provides access to generated trainer databases.
 *
 * Responsibilities:
 * - Load trainer database.
 * - Query trainers.
 *
 * Does NOT:
 * - Parse source files.
 * - Generate databases.
 * - Build databases.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class TrainerDatabaseService {


    constructor(game) {


        const databasePath =
            path.join(
                __dirname,
                "../../database/generated",
                game,
                "full-trainers.json"
            );


        this.trainers =
            JSON.parse(
                fs.readFileSync(
                    databasePath,
                    "utf8"
                )
            );

    }



    getTrainer(id) {

        return this.trainers[id] || null;

    }



    getAllTrainers() {

        return Object.values(
            this.trainers
        );

    }



    getByType(type) {

        return this.getAllTrainers()
            .filter(
                trainer =>
                    trainer.trainerType === type
            );

    }



    getGymLeaders() {

        return this.getByType(
            "GYM_LEADER"
        );

    }



    getEliteFour() {

        return this.getByType(
            "ELITE_FOUR"
        );

    }



    getChampions() {

        return this.getByType(
            "CHAMPION"
        );

    }



    getVillainTeam() {

        return this.getByType(
            "VILLAIN_TEAM"
        );

    }


}


module.exports = TrainerDatabaseService;
/**
 * Pokémon Companion
 * Gym Progression Service
 *
 * Provides FireRed gym progression data.
 *
 * Responsibilities:
 * - Provide gym order.
 * - Provide gym unlock progression.
 *
 * Does NOT:
 * - Read ROM data.
 * - Handle map traversal.
 * - Analyze Pokémon.
 */

"use strict";


class GymProgressionService {


    constructor() {


        this.gyms = [

            {
                id: "TRAINER_LEADER_BROCK",
                name: "Brock",
                city: "PEWTER_CITY",
                badge: "BOULDER_BADGE",
                order: 1
            },


            {
                id: "TRAINER_LEADER_MISTY",
                name: "Misty",
                city: "CERULEAN_CITY",
                badge: "CASCADE_BADGE",
                order: 2
            },


            {
                id: "TRAINER_LEADER_LT_SURGE",
                name: "Lt. Surge",
                city: "VERMILION_CITY",
                badge: "THUNDER_BADGE",
                order: 3
            },


            {
                id: "TRAINER_LEADER_ERIKA",
                name: "Erika",
                city: "CELADON_CITY",
                badge: "RAINBOW_BADGE",
                order: 4
            },


            {
                id: "TRAINER_LEADER_KOGA",
                name: "Koga",
                city: "FUCHSIA_CITY",
                badge: "SOUL_BADGE",
                order: 5
            },


            {
                id: "TRAINER_LEADER_SABRINA",
                name: "Sabrina",
                city: "SAFFRON_CITY",
                badge: "MARSH_BADGE",
                order: 6
            },


            {
                id: "TRAINER_LEADER_BLAINE",
                name: "Blaine",
                city: "CINNABAR_ISLAND",
                badge: "VOLCANO_BADGE",
                order: 7
            },


            {
                id: "TRAINER_LEADER_BLUE",
                name: "Blue",
                city: "VIRIDIAN_CITY",
                badge: "EARTH_BADGE",
                order: 8
            }

        ];


    }



    getAllGyms() {


        return this.gyms;

    }



    getGym(id) {


        return this.gyms.find(
            gym =>
                gym.id === id
        ) || null;

    }



    getPreviousGyms(id) {


        const gym =
            this.getGym(id);



        if (!gym) {

            return [];

        }



        return this.gyms.filter(
            entry =>
                entry.order < gym.order
        );

    }



}


module.exports = GymProgressionService;
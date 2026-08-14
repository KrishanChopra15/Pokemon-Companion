/**
 * Pokémon Companion
 * Pokémon Database Service
 *
 * Provides access to generated Pokémon databases.
 *
 * Responsibilities:
 * - Load Pokémon database.
 * - Query Pokémon data.
 *
 * Does NOT:
 * - Parse source files.
 * - Generate databases.
 * - Build databases.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class PokemonDatabaseService {


    constructor(game) {


        const databasePath =
            path.join(
                __dirname,
                "../../database/generated",
                game,
                "pokemon-species.json"
            );


        this.pokemon =
            JSON.parse(
                fs.readFileSync(
                    databasePath,
                    "utf8"
                )
            );

    }



    getPokemon(name) {


        return this.pokemon.find(
            pokemon =>
                pokemon.name === name.toUpperCase()
        ) || null;


    }



    getPokemonById(id) {


        const formattedId =
            String(id).padStart(4, "0");


        return this.pokemon.find(
            pokemon =>
                pokemon.id === formattedId
        ) || null;


    }



    getAllPokemon() {

        return this.pokemon;

    }



    getByType(type) {


        const searchType =
            type.toLowerCase();


        return this.getAllPokemon()
            .filter(
                pokemon =>

                    pokemon.type1 &&
                    pokemon.type1.name.toLowerCase() === searchType

                    ||

                    pokemon.type2 &&
                    pokemon.type2.name.toLowerCase() === searchType

            );

    }



    getByAbility(ability) {


        const searchAbility =
            ability.toUpperCase();


        return this.getAllPokemon()
            .filter(
                pokemon =>

                    pokemon.abilities &&
                    pokemon.abilities.some(
                        item =>
                            item.name === searchAbility
                    )

            );

    }


}


module.exports = PokemonDatabaseService;
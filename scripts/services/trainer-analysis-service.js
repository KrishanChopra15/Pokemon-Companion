/**
 * Pokémon Companion
 * Trainer Analysis Service
 *
 * Analyzes trainer teams.
 *
 * Responsibilities:
 * - Resolve trainer Pokémon.
 * - Calculate trainer information.
 *
 * Does NOT:
 * - Load databases directly.
 * - Build databases.
 */

"use strict";


class TrainerAnalysisService {


    constructor(
        trainerDatabase,
        pokemonDatabase
    ) {

        this.trainerDatabase =
            trainerDatabase;


        this.pokemonDatabase =
            pokemonDatabase;

    }



    analyzeTrainer(id) {


        const trainer =
            this.trainerDatabase.getTrainer(id);



        if (!trainer) {

            return null;

        }



        const team =
            trainer.party
                ? trainer.party.pokemon.map(
                    pokemon => ({

                        species:
                            pokemon.species,

                        level:
                            pokemon.level,

                        iv:
                            pokemon.iv,

                        pokemon:
                            this.pokemonDatabase.getPokemon(
                                pokemon.species
                            )

                    })
                )
                : [];



        return {


            id:
                trainer.id,


            name:
                trainer.trainerName,


            type:
                trainer.trainerType,


            team,


            teamSize:
                this.getTeamSize(team),


            highestLevel:
                this.getHighestLevel(team),


            averageLevel:
                this.getAverageLevel(team),


            types:
                this.getTypes(team),


            teamPower:
                this.getTeamPower(team)

        };

    }



    getTeamSize(team) {

        return team.length;

    }



    getHighestLevel(team) {


        if (team.length === 0) {

            return 0;

        }


        return Math.max(
            ...team.map(
                pokemon =>
                    pokemon.level
            )
        );

    }



    getAverageLevel(team) {


        if (team.length === 0) {

            return 0;

        }


        const total =
            team.reduce(
                (sum, pokemon) =>
                    sum + pokemon.level,
                0
            );


        return Math.round(
            total / team.length
        );

    }



    getTypes(team) {


        const types =
            new Set();



        team.forEach(
            member => {


                const pokemon =
                    member.pokemon;



                if (!pokemon) {

                    return;

                }



                if (pokemon.type1) {

                    types.add(
                        pokemon.type1.name
                    );

                }



                if (pokemon.type2) {

                    types.add(
                        pokemon.type2.name
                    );

                }


            }
        );



        return [
            ...types
        ];

    }



    getTeamPower(team) {


        return team.reduce(
            (total, member) => {


                const pokemon =
                    member.pokemon;



                if (!pokemon) {

                    return total;

                }



                return total +

                    pokemon.baseHP +

                    pokemon.baseAttack +

                    pokemon.baseDefense +

                    pokemon.baseSpeed +

                    pokemon.baseSpAttack +

                    pokemon.baseSpDefense;


            },
            0
        );

    }


}


module.exports = TrainerAnalysisService;
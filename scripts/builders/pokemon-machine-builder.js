/**
 * Pokémon Companion
 * Pokémon Machine Builder
 *
 * Builds generated Pokémon machine database.
 */

"use strict";

const Builder = require("./builder");
const ReferenceRegistry = require("./reference-registry");


class PokemonMachineBuilder extends Builder {


    build(game) {


        const rawMachines =
        this.loadRawDatabase(
            game,
            "pokemon-machines"
        );


        const references =
        new ReferenceRegistry();


        const generated =
        rawMachines.map(entry => {


            return {

                species: entry.species,


                machines:
                entry.machines.map(machine => {


                    const reference =
                    references.machines.getByConstant(
                        machine
                    );


                    if (!reference) {

                        return null;

                    }


                    const move =
                    references.moveNames.getByConstant(
                        reference.move.constant
                    );


                    return {

                        constant:
                        reference.constant,


                        name:
                        reference.name,


                        itemConstant:
                        reference.itemConstant,


                        move:
                        move

                    };


                })
                .filter(Boolean)

            };


        });



        this.saveGeneratedDatabase(
            game,
            "pokemon-machines",
            generated
        );


        console.log();

        console.log(
            "Generated Pokémon machines database."
        );

        console.log(
            `Machine records: ${generated.length}`
        );

        console.log();


    }


}


module.exports = PokemonMachineBuilder;
/**
 * Pokémon Companion
 * Storage Manager Test
 */

"use strict";


const StorageManager =
    require("../scripts/storage/storage-manager");



const storage =
    new StorageManager();



console.log(
    "Storage Manager:",
    !!storage
);





const add =
    storage.addPokemon(

        {

            species:
                "RATTATA",


            level:
                3,


            location:
                "MAP_ROUTE1"

        }

    );



console.log(
    "Add Pokemon:",
    add.success
);



console.log(
    "Pokemon:",
    add.pokemon.species
);



console.log(
    "Storage Count:",
    storage.getCount()
);





const remove =
    storage.removePokemon(

        add.pokemon.id

    );



console.log(
    "Remove:",
    remove.success
);
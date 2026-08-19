/**
 * Pokémon Companion
 * Storage Flow Test
 */

"use strict";


const StorageManager =
    require("../scripts/storage/storage-manager");


const StorageFlow =
    require("../scripts/storage/storage-flow");





const manager =
    new StorageManager();



const storage =
    new StorageFlow(
        manager
    );





console.log(
    "Storage Flow:",
    !!storage
);





const add =
    storage.storePokemon(

        {

            species:
                "PIKACHU",


            level:
                12,


            location:
                "MAP_VIRIDIAN_FOREST"

        }

    );



console.log(
    "Store Pokemon:",
    add.success
);



console.log(
    "Pokemon:",
    add.pokemon.species
);



console.log(
    "Storage Count:",
    storage
        .getStatus()
        .count
);







const remove =
    storage.removePokemon(

        add.pokemon.id

    );



console.log(
    "Remove:",
    remove.success
);
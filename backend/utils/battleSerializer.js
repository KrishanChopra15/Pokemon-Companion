"use strict";


class BattleSerializer {


    //--------------------------------
    // Serialize Pokémon
    //--------------------------------

    static pokemon(pokemon)
    {

        if(!pokemon)
        {
            return null;
        }


        return {

            species:
                pokemon.species,


            level:
                pokemon.level,


            hp:
                pokemon.hp,


            maxHp:
                pokemon.maxHP,


            types:
                pokemon.types || [],


            status:
                pokemon.status || null,


            moves:

                (pokemon.moves || [])
                .map(move =>

                ({

                    name:
                        move.name,


                    constant:
                        move.constant,


                    type:
                        move.type,


                    category:
                        move.category,


                    power:
                        move.power,


                    accuracy:
                        move.accuracy,


                    pp:
                        move.pp

                }))

        };

    }





    //--------------------------------
    // Serialize battle
    //--------------------------------

    static battle(battle)
    {


        return {


            id:
                battle.id,


            type:
                battle.type,


            status:
                battle.status,



            player:
            {

                active:
                    battle.player.active,


                pokemon:

                    this.pokemon(

                        battle.player.party[

                            battle.player.active

                        ]

                    )

            },



            opponent:
            {

                trainer:

                    battle.trainer.trainerName,


                active:
                    battle.opponent.active,


                pokemon:

                    this.pokemon(

                        battle.opponent.party[

                            battle.opponent.active

                        ]

                    )

            }



        };


    }


}



module.exports =
    BattleSerializer;
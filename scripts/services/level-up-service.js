/**
 * Pokémon Companion
 * Level Up Service
 *
 * Handles Pokémon level-up processing.
 *
 * Responsibilities:
 * - Apply level increases.
 * - Calculate stat growth.
 * - Process learned moves.
 * - Provide level-up summaries.
 *
 * Does NOT:
 * - Give EXP.
 * - Calculate EXP.
 * - Execute battles.
 * - Handle evolution.
 * - Load ROM data.
 */

"use strict";





class LevelUpService {



    constructor()
    {


        this.statGrowth =
        {

            hp:
                3,


            attack:
                2,


            defense:
                2,


            spAttack:
                2,


            spDefense:
                2,


            speed:
                2


        };


    }









    //--------------------------------
    // Process level up
    //--------------------------------


    levelUp(
        pokemon,
        levels = 1
    )
    {


        if(
            !pokemon
        )
        {

            return {

                success:false,

                reason:
                    "Missing Pokemon"

            };

        }







        const gainedLevels =
            [];



        const oldLevel =
            pokemon.level;








        let levelCount =
            0;








        //--------------------------------
        // Accept array or number
        //--------------------------------


        if(
            Array.isArray(levels)
        )
        {

            levelCount =
                levels.length;

        }
        else
        {

            levelCount =
                levels;

        }








        for(
            let i = 0;
            i < levelCount;
            i++
        )
        {


            pokemon.level++;




            this.applyStats(

                pokemon

            );




            gainedLevels.push(

                pokemon.level

            );


        }








        return {


            success:true,


            oldLevel,


            newLevel:

                pokemon.level,


            levels:

                gainedLevels,


            stats:

                this.getStats(

                    pokemon

                )

        };


    }









    //--------------------------------
    // Apply stat growth
    //--------------------------------


    applyStats(
        pokemon
    )
    {


        if(
            !pokemon.stats
        )
        {

            pokemon.stats =
            {

                hp:
                    pokemon.hp
                    ||
                    10,


                attack:
                    5,


                defense:
                    5,


                spAttack:
                    5,


                spDefense:
                    5,


                speed:
                    5

            };

        }








        for(
            const stat in this.statGrowth
        )
        {


            pokemon.stats[stat] +=

                this.statGrowth[stat];


        }








        if(
            pokemon.maxHP !== undefined
        )
        {


            pokemon.maxHP +=

                this.statGrowth.hp;



            pokemon.hp =

                pokemon.maxHP;


        }


    }









    //--------------------------------
    // Stats summary
    //--------------------------------


    getStats(
        pokemon
    )
    {


        return pokemon.stats

            ||

            null;


    }









    //--------------------------------
    // Learn move
    //--------------------------------


    learnMove(
        pokemon,
        move
    )
    {


        if(
            !pokemon.moves
        )
        {

            pokemon.moves =
                [];

        }







        if(
            pokemon.moves.includes(
                move
            )
        )
        {

            return {

                success:false,

                reason:
                    "Move already known"

            };

        }








        pokemon.moves.push(

            move

        );





        return {

            success:true,

            move

        };


    }









    //--------------------------------
    // Process learned moves
    //--------------------------------


    processMoves(
        pokemon,
        availableMoves
    )
    {


        if(
            !availableMoves
        )
        {

            return [];

        }







        const learned =
            [];







        for(
            const move of availableMoves
        )
        {


            if(
                move.level <= pokemon.level
            )
            {


                const result =
                    this.learnMove(

                        pokemon,

                        move.name

                    );



                if(
                    result.success
                )
                {

                    learned.push(

                        move.name

                    );

                }


            }


        }







        return learned;


    }









    //--------------------------------
    // Level up summary
    //--------------------------------


    createSummary(
        pokemon,
        oldLevel
    )
    {


        return {


            pokemon:

                pokemon.species,


            oldLevel,


            newLevel:

                pokemon.level,


            stats:

                this.getStats(

                    pokemon

                )


        };


    }



}





module.exports =
    LevelUpService;
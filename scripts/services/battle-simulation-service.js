/**
 * Pokémon Companion
 * Battle Simulation Service
 *
 * Creates battle simulation scenarios.
 *
 * Responsibilities:
 * - Generate EXACT stat scenarios.
 * - Generate RANDOM stat scenarios.
 * - Generate BEST_CASE scenarios.
 * - Generate WORST_CASE scenarios.
 * - Simulate prediction battles.
 * - Calculate simulation damage.
 *
 * Does NOT:
 * - Execute real battles.
 * - Modify save data.
 * - Handle UI.
 */

"use strict";





class BattleSimulationService {



    constructor(
        pokemonStatProviderService = null,
        typeEffectivenessService = null,
        statusEffectService = null
    )
    {


        this.statProvider =
            pokemonStatProviderService;



        this.typeEffectiveness =
            typeEffectivenessService;



        this.statusEffect =
            statusEffectService;


    }









    //--------------------------------
    // Get battle stats
    //--------------------------------


    getSimulationStats(
        pokemon,
        mode = "RANDOM"
    )
    {


        if(
            !this.statProvider
        )
        {

            return pokemon;

        }




        return this.statProvider.getBattleStats(

            pokemon,

            mode

        );


    }









    //--------------------------------
    // Generate scenarios
    //--------------------------------


    generateScenarios(
        pokemon,
        mode = "RANDOM"
    )
    {


        switch(
            mode
        )
        {


            case "EXACT":

                return [

                    this.exact(
                        pokemon
                    )

                ];



            case "BEST_CASE":

                return [

                    this.bestCase(
                        pokemon
                    )

                ];



            case "WORST_CASE":

                return [

                    this.worstCase(
                        pokemon
                    )

                ];



            case "RANDOM":

                return [

                    this.random(
                        pokemon
                    ),


                    this.random(
                        pokemon
                    ),


                    this.random(
                        pokemon
                    )

                ];



            default:

                return [];

        }


    }









    //--------------------------------
    // Exact scenario
    //--------------------------------


    exact(
        pokemon
    )
    {


        return this.getSimulationStats(

            pokemon,

            "EXACT"

        );


    }









    //--------------------------------
    // Random scenario
    //--------------------------------


    random(
        pokemon
    )
    {


        const copy =

        {

            ...pokemon,


            ivs:

                this.generateRandomIVs(),



            evs:

                this.generateRandomEVs(),



            nature:

                this.randomNature()


        };



        return this.getSimulationStats(

            copy,

            "RANDOM"

        );


    }









    //--------------------------------
    // Best scenario
    //--------------------------------


    bestCase(
        pokemon
    )
    {


        const copy =

        {

            ...pokemon,


            ivs:

                this.maxIVs(),



            evs:

                this.getBestEVSpread(
                    pokemon
                ),



            nature:

                this.bestNature(
                    pokemon
                )


        };



        return this.getSimulationStats(

            copy,

            "BEST_CASE"

        );


    }









    //--------------------------------
    // Worst scenario
    //--------------------------------


    worstCase(
        pokemon
    )
    {


        const copy =

        {

            ...pokemon,


            ivs:

                this.zeroIVs(),



            evs:

                this.zeroEVs(),



            nature:

                "HARDY"


        };



        return this.getSimulationStats(

            copy,

            "WORST_CASE"

        );


    }









    //--------------------------------
    // Generate random IVs
    //--------------------------------


    generateRandomIVs()
    {


        return {


            hp:
                this.randomNumber(
                    0,
                    31
                ),



            attack:
                this.randomNumber(
                    0,
                    31
                ),



            defense:
                this.randomNumber(
                    0,
                    31
                ),



            spAttack:
                this.randomNumber(
                    0,
                    31
                ),



            spDefense:
                this.randomNumber(
                    0,
                    31
                ),



            speed:
                this.randomNumber(
                    0,
                    31
                )


        };


    }









    //--------------------------------
    // Maximum IVs
    //--------------------------------


    maxIVs()
    {

        return {


            hp:31,

            attack:31,

            defense:31,

            spAttack:31,

            spDefense:31,

            speed:31


        };


    }









    //--------------------------------
    // Minimum IVs
    //--------------------------------


    zeroIVs()
    {

        return {


            hp:0,

            attack:0,

            defense:0,

            spAttack:0,

            spDefense:0,

            speed:0


        };


    }









    //--------------------------------
    // Generate random EVs
    //--------------------------------


    generateRandomEVs()
    {


        const stats =

        [

            "hp",

            "attack",

            "defense",

            "spAttack",

            "spDefense",

            "speed"

        ];



        let remaining = 510;



        const evs =

        {

            hp:0,

            attack:0,

            defense:0,

            spAttack:0,

            spDefense:0,

            speed:0

        };





        for(
            let i = 0;
            i < stats.length;
            i++
        )
        {


            const stat =
                stats[i];



            const max =

                Math.min(

                    252,

                    remaining

                );



            const value =

                this.randomNumber(

                    0,

                    max

                );



            evs[stat] =
                value;



            remaining -=
                value;


        }



        return evs;


    }









    //--------------------------------
    // Best EV spread
    //--------------------------------


    getBestEVSpread(
        pokemon
    )
    {


        if(
            pokemon.category === "SPECIAL"
        )
        {

            return this.maxSpecialEVs();

        }



        return this.maxPhysicalEVs();


    }









    maxPhysicalEVs()
    {

        return {


            hp:0,

            attack:252,

            defense:0,

            spAttack:0,

            spDefense:4,

            speed:252


        };


    }









    maxSpecialEVs()
    {

        return {


            hp:0,

            attack:0,

            defense:0,

            spAttack:252,

            spDefense:4,

            speed:252


        };


    }









    //--------------------------------
    // Zero EVs
    //--------------------------------


    zeroEVs()
    {

        return {


            hp:0,

            attack:0,

            defense:0,

            spAttack:0,

            spDefense:0,

            speed:0


        };


    }









    //--------------------------------
    // Nature handling
    //--------------------------------


    bestNature(
        pokemon
    )
    {


        if(
            pokemon.category === "SPECIAL"
        )
        {

            return "MODEST";

        }



        return "ADAMANT";


    }









    randomNature()
    {


        const natures =

        [

            "ADAMANT",

            "MODEST",

            "JOLLY",

            "TIMID",

            "BOLD",

            "CALM",

            "CAREFUL",

            "IMPISH",

            "HARDY"

        ];



        return natures[

            this.randomNumber(

                0,

                natures.length - 1

            )

        ];


    }









    //--------------------------------
    // Random number
    //--------------------------------


    randomNumber(
        min,
        max
    )
    {


        return Math.floor(

            Math.random()

            *

            (

                max -

                min +

                1

            )

            +

            min

        );


    }









    //--------------------------------
    // Battle simulation
    //--------------------------------


    simulateBattle(
        battle
    )
    {


        const player =

            battle.player.party[0];



        const opponent =

            battle.opponent.party[0];


        player.maxHP =
            player.hp;
            
            
        opponent.maxHP =
            opponent.hp;
            
            
        player.status = null;
        player.statusData = null;


        opponent.status = null;
        opponent.statusData = null;
            

        const battleLog = [];


        while(
            player.hp > 0 &&
            opponent.hp > 0
        )
        {


            const playerMove =
                this.chooseMove(player);


            const opponentMove =
                this.chooseMove(opponent);


            const first =
                this.determineFirstPokemon(
                    player,
                    opponent,
                    playerMove,
                    opponentMove
                );



            if(
                first === "PLAYER"
            )
            {



                const playerDamage =
                                
                    this.calculateSimulationDamage(
                    
                        {
                            ...player,
                            status:
                                player.status
                        },
                    
                        opponent,
                    
                        playerMove
                    
                    );
                
                
                opponent.hp -= playerDamage.damage;
                                
                                
                this.applyStatus(
                    opponent,
                    playerMove
                );
                
                
                battleLog.push({
                
                    attacker:
                        player.species,
                
                    move:
                        playerMove.name,
                
                    damage:
                        playerDamage.damage,
                
                    critical:
                        playerDamage.critical,
                
                    target:
                        opponent.species,
                
                    targetHP:
                        Math.max(
                            0,
                            opponent.hp
                        ),
                    
                    status:
                        opponent.status
                    
                });





                if(
                    opponent.hp <= 0
                )
                {

                    return {
                    
                        winner:
                            "PLAYER",
                    
                        log:
                            battleLog
                    
                    };

                }



                const opponentDamage =

                    this.calculateSimulationDamage(
                    
                        {
                            ...opponent,
                            status:
                                opponent.status
                        },
                    
                        player,
                    
                        opponentMove
                    
                    );
                
                
                player.hp -= opponentDamage.damage;


                this.applyStatus(
                    player,
                    opponentMove
                );
                
                
                battleLog.push({
                
                    attacker:
                        opponent.species,
                
                    move:
                        opponentMove.name,
                
                    damage:
                        opponentDamage.damage,
                
                    critical:
                        opponentDamage.critical,
                
                    target:
                        player.species,
                
                    targetHP:
                        Math.max(
                            0,
                            player.hp
                        ),
                    
                    status:
                        player.status
                    
                });


            }

            else
            {



                const opponentDamage =

                    this.calculateSimulationDamage(
                    
                        {
                            ...opponent,
                            status:
                                opponent.status
                        },
                    
                        player,
                    
                        opponentMove
                    
                    );
                
                
                player.hp -= opponentDamage.damage;
                                
                                
                this.applyStatus(
                    player,
                    opponentMove
                );
                
                
                battleLog.push({
                
                    attacker:
                        opponent.species,
                
                    move:
                        opponentMove.name,
                
                    damage:
                        opponentDamage.damage,
                
                    critical:
                        opponentDamage.critical,
                
                    target:
                        player.species,
                
                    targetHP:
                        Math.max(
                            0,
                            player.hp
                        ),
                    
                    status:
                        player.status
                    
                });





                if(
                    player.hp <= 0
                )
                {

                    return {
                    
                        winner:
                            "OPPONENT",
                    
                        log:
                            battleLog
                    
                    };

                }



                const playerDamage =

                    this.calculateSimulationDamage(
                    
                        {
                            ...player,
                            status:
                                player.status
                        },
                    
                        opponent,
                    
                        playerMove
                    
                    );
                
                
                opponent.hp -= playerDamage.damage;


                this.applyStatus(
                    opponent,
                    playerMove
                );
                
                
                battleLog.push({
                
                    attacker:
                        player.species,
                
                    move:
                        playerMove.name,
                
                    damage:
                        playerDamage.damage,
                
                    critical:
                        playerDamage.critical,
                
                    target:
                        opponent.species,
                
                    targetHP:
                        Math.max(
                            0,
                            opponent.hp
                        ),
                    
                    status:
                        opponent.status
                    
                });

            }



            if(
                this.statusEffect
            )
            {
            
            
                if(
                    player.hp <= 0 ||
                    opponent.hp <= 0
                )
                {
                
                    break;
                
                }
            
            
            
            
            
                const playerStatusResult =
            
                    this.statusEffect.processTurn(
                        player
                    );
                
                
                
                
                
                if(
                    playerStatusResult.damage > 0
                )
                {
                
                    battleLog.push({
                    
                        event:
                            "STATUS_DAMAGE",
                    
                    
                        target:
                            player.species,
                    
                    
                        status:
                            player.status,
                    
                    
                        damage:
                            playerStatusResult.damage,
                    
                    
                        targetHP:
                            player.hp
                    
                    
                    });
                
                
                }
            
            
            
            
            
            
            
                if(
                    player.hp <= 0
                )
                {
                
                    return {
                    
                        winner:
                            "OPPONENT",
                    
                        log:
                            battleLog
                    
                    };
                
                }
            
            
            
            
            
            
            
            
            
                const opponentStatusResult =
            
                    this.statusEffect.processTurn(
                        opponent
                    );
                
                
                
                
                
                
                
                if(
                    opponentStatusResult.damage > 0
                )
                {
                
                    battleLog.push({
                    
                        event:
                            "STATUS_DAMAGE",
                    
                    
                        target:
                            opponent.species,
                    
                    
                        status:
                            opponent.status,
                    
                    
                        damage:
                            opponentStatusResult.damage,
                    
                    
                        targetHP:
                            opponent.hp
                    
                    
                    });
                
                
                }
            
            
            
            
            
            
                if(
                    opponent.hp <= 0
                )
                {
                
                    return {
                    
                        winner:
                            "PLAYER",
                    
                        log:
                            battleLog
                    
                    };
                
                }
            
            }

        }





        return {
        
        
            winner:
        
                player.hp > 0
        
                    ? "PLAYER"
        
                    : "OPPONENT",
        
        
            log:
                battleLog
        
        
        };


    }









    //--------------------------------
    // Determine turn order
    //--------------------------------

    determineFirstPokemon(
        player,
        opponent,
        playerMove,
        opponentMove
    )
    {


        const playerPriority =
            playerMove.priority || 0;


        const opponentPriority =
            opponentMove.priority || 0;



        if(
            playerPriority >
            opponentPriority
        )
        {
            return "PLAYER";
        }



        if(
            opponentPriority >
            playerPriority
        )
        {
            return "OPPONENT";
        }



        const playerSpeed =

            player.speed *

            (
                this.statusEffect
            
                ?
            
                this.statusEffect.getSpeedMultiplier(
                    player
                )
            
                :
            
                1
            );
        
        
        
        const opponentSpeed =
        
            opponent.speed *
        
            (
                this.statusEffect
            
                ?
            
                this.statusEffect.getSpeedMultiplier(
                    opponent
                )
            
                :
            
                1
            );
        
        
        
        if(
            playerSpeed >
            opponentSpeed
        )
        {
            return "PLAYER";
        }



        if(
            opponentSpeed >
            playerSpeed
        )
        {
            return "OPPONENT";
        }



        return (

            this.randomNumber(
                0,
                1
            )

            ===

            0

        )

        ?

        "PLAYER"

        :

        "OPPONENT";


    }









    //--------------------------------
    // Choose simulation move
    //--------------------------------


    chooseMove(
        pokemon
    )
    {


        if(
            pokemon.moves
            &&
            pokemon.moves.length > 0
        )
        {


            return pokemon.moves[

                this.randomNumber(

                    0,

                    pokemon.moves.length - 1

                )

            ];

        }





        return {


            name:
                "TACKLE",


            type:
                "NORMAL",


            category:
                "PHYSICAL",


            power:
                40,


            accuracy:
                100,
        
        
            priority:
                0


        };


    }









    //--------------------------------
    // Damage calculation
    //--------------------------------


    calculateSimulationDamage(
        attacker,
        defender,
        move = null
    )
    {


        move =

            move
            ||
            {

                type:"NORMAL",

                power:40,

                category:"PHYSICAL"

            };



                
        //--------------------------------
        // Accuracy check
        //--------------------------------
                
        if(
            move.accuracy
            &&
            this.randomNumber(
                1,
                100
            )
            >
            move.accuracy
        )
        {
        
            return 0;
        
        }




        const level =

            attacker.level

            ||

            10;







        let attackStat;



        let defenseStat;







        if(
            move.category === "SPECIAL"
        )
        {


            attackStat =

                attacker.spAttack

                ||

                attacker.attack

                ||

                10;




            defenseStat =

                defender.spDefense

                ||

                defender.defense

                ||

                10;


        }

        else
        {
        
        
            attackStat =
        
                attacker.attack
        
                ||
        
                10;
        
        
        
            //--------------------------------
            // Burn attack reduction
            //--------------------------------

            if(
                this.statusEffect
            )
            {
            
                attackStat *=
            
                    this.statusEffect.getAttackMultiplier(
                        attacker
                    );
                
            }
        
        
        
            defenseStat =
        
                defender.defense
        
                ||
        
                10;
        
        
        }









        const power =

            move.power

            ||

            40;







        let damage =



            (

                (

                    (

                        (

                            2 *

                            level /

                            5

                        )

                        +

                        2

                    )

                    *

                    power

                    *

                    attackStat

                    /

                    defenseStat


                )

                /

                50


            )

            +

            2;









        //--------------------------------
        // STAB
        //--------------------------------


        if(
            attacker.types
            &&
            attacker.types.includes(
                move.type
            )
        )
        {


            damage *=

                1.5;


        }









        //--------------------------------
        // Type effectiveness
        //--------------------------------


        damage *=

            this.calculateTypeEffectiveness(
            
                move.type,
            
                defender.types
            
            );









        //--------------------------------
        // Critical Hit
        //--------------------------------


        const critical =

            this.randomNumber(
                1,
                16
            ) === 1;
        
        
        
        if(
            critical
        )
        {
        
            damage *= 1.5;
        
        }









        //--------------------------------
        // Random factor
        //--------------------------------


        damage *=


            this.randomNumber(

                85,

                100

            )

            /

            100;







        return {
        
            damage:
        
                Math.max(
                
                    1,
                
                    Math.round(
                        damage
                    )
                
                ),
            
            
            critical
            
        };


    }









    //--------------------------------
    // Apply status effects
    //--------------------------------
    
    applyStatus(
        pokemon,
        move
    )
    {
    
    
        if(
            !this.statusEffect
        )
        {
        
            return null;
        
        }
    
    
    
        if(
            !move.status
        )
        {
        
            return null;
        
        }
    
    
    
    
    
        //--------------------------------
        // Gen 3 Status Immunities
        //--------------------------------
    
    
        if(
            move.status === "BURN"
            &&
            pokemon.types
            &&
            pokemon.types.includes("FIRE")
        )
        {
        
            return {
            
                success:false,
            
                reason:
                    "Fire type immune to burn"
            
            };
        
        }
    
    
    
    
    
    
        if(
            move.status === "POISON"
            &&
            pokemon.types
            &&
            (
                pokemon.types.includes("POISON")
                ||
                pokemon.types.includes("STEEL")
            )
        )
        {
        
            return {
            
                success:false,
            
                reason:
                    "Poison immunity"
            
            };
        
        }
    
    
    
    
    
        return this.statusEffect.applyStatus(
        
            pokemon,
        
            move.status
        
        );
    
    
    }









    //--------------------------------
    // Type effectiveness resolver
    //--------------------------------

    calculateTypeEffectiveness(
        attackType,
        defenderTypes = []
    )
    {


        if(
            this.typeEffectiveness
        )
        {


            return this.typeEffectiveness.getMultiplier(

                attackType,

                defenderTypes

            );


        }



        return this.getTypeMultiplier(

            attackType,

            defenderTypes

        );


    }









    //--------------------------------
    // Type multiplier
    //--------------------------------


    getTypeMultiplier(
        attackType,
        defenderTypes = []
    )
    {


        if(
            !Array.isArray(
                defenderTypes
            )
        )
        {

            defenderTypes =
                [

                    defenderTypes

                ];

        }







        let multiplier = 1;








        for(
            const type of defenderTypes
        )
        {


            if(
                attackType === "FIRE"
                &&
                type === "GRASS"
            )
            {

                multiplier *= 2;

            }



            if(
                attackType === "FIRE"
                &&
                type === "ROCK"
            )
            {

                multiplier *= 0.5;

            }



            if(
                attackType === "WATER"
                &&
                type === "ROCK"
            )
            {

                multiplier *= 2;

            }



            if(
                attackType === "GRASS"
                &&
                type === "WATER"
            )
            {

                multiplier *= 2;

            }



            if(
                attackType === "ELECTRIC"
                &&
                type === "WATER"
            )
            {

                multiplier *= 2;

            }



            if(
                attackType === "GROUND"
                &&
                type === "ROCK"
            )
            {

                multiplier *= 2;

            }


        }






        return multiplier;


    }



}





module.exports =
    BattleSimulationService;
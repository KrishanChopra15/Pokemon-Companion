/**
 * Pokémon Companion
 * Battle Prediction Service
 *
 * Predicts battle outcomes before actual battle.
 *
 * Responsibilities:
 * - Run battle simulations.
 * - Compare exact/random/best/worst cases.
 * - Calculate win/loss probability.
 * - Provide battle recommendations.
 *
 * Does NOT:
 * - Modify save data.
 * - Execute real battles.
 * - Handle UI.
 */

"use strict";





class BattlePredictionService {



    constructor(
        battleSimulationService = null,
        battlePreparationService = null
    )
    {
    
    
        this.simulation =
            battleSimulationService;
    
    
        this.preparation =
            battlePreparationService;
    
    
    }









    //--------------------------------
    // Predict trainer battle
    //--------------------------------


    predictTrainerBattle(
        trainerId,
        playerState,
        mode = "RANDOM",
        simulations = 100
    )
    {


        if(
            !this.preparation
        )
        {

            return {

                success:false,

                reason:
                    "Battle preparation unavailable"

            };

        }






        const prepared =

            this.preparation.prepareTrainerBattle(

                trainerId,

                playerState

            );





        if(
            !prepared.success
        )
        {

            return prepared;

        }








        let wins = 0;

        let losses = 0;

        let draws = 0;






        for(
            let i = 0;

            i < simulations;

            i++
        )
        {


            const result =

                this.runSimulation(

                    prepared,

                    mode

                );



            if(
                result === "WIN"
            )
            {
                wins++;
            }


            else if(
                result === "LOSS"
            )
            {
                losses++;
            }


            else
            {
                draws++;
            }


        }







        return {


            success:true,


            trainerId,


            mode,


            simulations,



            result:
            {

                wins,

                losses,

                draws


            },



            winRate:

                Math.floor(

                    (

                        wins /

                        simulations

                    )

                    *

                    100

                ),



            recommendation:

                this.getRecommendation(

                    wins,

                    losses,

                    simulations

                )


        };


    }









    //--------------------------------
    // Run one battle
    //--------------------------------


    runSimulation(
        battleData,
        mode
    )
    {


        const playerParty =

            battleData.player.party.map(

                pokemon =>

                    this.applyScenario(

                        pokemon,

                        mode

                    )

            );





        const enemyParty =

            battleData.opponent.party.map(

                pokemon =>

                    this.applyScenario(

                        pokemon,

                        "RANDOM"

                    )

            );






        const simulatedBattle =

        {

            ...battleData,


            player:
            {

                ...battleData.player,

                party:
                    playerParty

            },


            opponent:
            {

                ...battleData.opponent,

                party:
                    enemyParty

            }


        };






        if(
            !this.simulation
        )
        {
        
            return "DRAW";
        
        }
        
        
        
        const result =
        
            this.simulation.simulateBattle(
            
                simulatedBattle
            
            );





        if(
            result?.winner === "PLAYER"
        )
        {
            return "WIN";
        }





        if(
            result?.winner === "OPPONENT"
        )
        {
            return "LOSS";
        }





        return "DRAW";


    }









    //--------------------------------
    // Apply stat scenario
    //--------------------------------


    applyScenario(
        pokemon,
        mode
    )
    {
    
    
        if(
            !this.simulation
        )
        {
        
            return pokemon;
        
        }
    
    
    
        let simulated;
    
    
    
        switch(
            mode
        )
        {
        
        
            case "EXACT":
        
                simulated =
                    this.simulation.exact(
                        pokemon
                    );
                
                break;
                
                
                
            case "BEST_CASE":
                
                simulated =
                    this.simulation.bestCase(
                        pokemon
                    );
                
                break;
                
                
                
            case "WORST_CASE":
                
                simulated =
                    this.simulation.worstCase(
                        pokemon
                    );
                
                break;
                
                
                
            default:
                
                simulated =
                    this.simulation.random(
                        pokemon
                    );
                
                break;
                
                
        }
    
    
    
    
        return simulated;
    
    
    }









    //--------------------------------
    // Recommendation
    //--------------------------------


    getRecommendation(
        wins,
        losses,
        total
    )
    {


        const rate =

            wins /

            total;





        if(
            rate >= 0.8
        )
        {

            return "VERY_FAVOURABLE";

        }





        if(
            rate >= 0.5
        )
        {

            return "SLIGHT_ADVANTAGE";

        }





        if(
            rate >= 0.3
        )
        {

            return "RISKY";

        }





        return "UNFAVOURABLE";


    }





}





module.exports =
    BattlePredictionService;
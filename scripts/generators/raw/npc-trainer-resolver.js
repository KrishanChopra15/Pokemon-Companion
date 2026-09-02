/**
 * Pokémon Companion
 * NPC Trainer Resolver
 *
 * Resolves trainer information associated with NPC battle events.
 *
 * Responsibilities:
 * - Resolve contextual trainer types.
 * - Build trainer records.
 * - Add trainer roles.
 * - Add trainer battle interactions.
 *
 * Does NOT:
 * - Parse trainer source data.
 * - Execute battles.
 * - Resolve NPC event graphs.
 */

"use strict";


class NPCTrainerResolver
{


    //--------------------------------
    // Process trainer battle
    //--------------------------------

    processBattle(
        battle,
        roles,
        interactionTypes,
        trainerIds,
        trainerTypes,
        trainerRecords,
        interactions,
        trainers
    )
    {

        if(
            !battle
        )
        {

            return;

        }


        //--------------------------------
        // Trainer battle
        //--------------------------------

        if(
            battle.type !==
            "trainer"
        )
        {

            return;

        }


        this.addUnique(

            roles,

            "BATTLE"

        );


        this.addUnique(

            interactionTypes,

            "BATTLE"

        );


        const trainerId =
            battle.trainer
            ||
            null;


        if(
            trainerId
        )
        {

            this.addUnique(

                trainerIds,

                trainerId

            );


            const trainer =
                trainers[
                    trainerId
                ];


            if(
                trainer
            )
            {

                const trainerType =
                    this.resolveTrainerType(

                        trainerId,

                        trainer

                    );


                this.addUnique(

                    trainerTypes,

                    trainerType

                );


                const recordExists =
                    trainerRecords.some(

                        record =>

                            record.id ===
                            trainerId

                    );


                if(
                    !recordExists
                )
                {

                    trainerRecords.push({

                        id:
                            trainerId,

                        type:
                            trainerType,

                        name:
                            trainer.trainerName
                            ||
                            null,

                        class:
                            trainer.trainerClass
                            ||
                            null,

                        pic:
                            trainer.trainerPic
                            ||
                            null

                    });

                }


                this.addTrainerRole(

                    roles,

                    interactionTypes,

                    trainerType

                );

            }

        }


        //--------------------------------
        // Battle interaction
        //--------------------------------

        const interactionExists =
            interactions.some(

                interaction =>

                    interaction.type ===
                    "BATTLE"

                    &&

                    interaction.trainerId ===
                    trainerId

                    &&

                    interaction.battleType ===
                    (
                        battle.battleType
                        ||
                        "single"
                    )

                    &&

                    interaction.rematch ===
                    (
                        battle.rematch ===
                        true
                    )

            );


        if(
            !interactionExists
        )
        {

            interactions.push({

                type:
                    "BATTLE",

                battleType:
                    battle.battleType
                    ||
                    "single",

                trainerId,

                rematch:
                    battle.rematch ===
                    true,

                noIntro:
                    battle.noIntro ===
                    true,

                earlyRival:
                    battle.earlyRival ===
                    true

            });

        }

    }


    //--------------------------------
    // Resolve trainer type
    //--------------------------------

    resolveTrainerType(
        trainerId,
        trainer
    )
    {

        const id =
            String(
                trainerId ||
                ""
            )
            .toUpperCase();


        const trainerClass =
            String(
                trainer.trainerClass ||
                ""
            )
            .toUpperCase();


        //--------------------------------
        // Champion
        //--------------------------------

        if(
            id.includes(
                "CHAMPION"
            )
        )
        {

            return "CHAMPION";

        }


        //--------------------------------
        // Elite Four
        //--------------------------------

        if(
            id.includes(
                "ELITE_FOUR"
            )
        )
        {

            return "ELITE_FOUR";

        }


        //--------------------------------
        // Rival
        //--------------------------------

        if(
            id.includes(
                "RIVAL"
            )
        )
        {

            return "RIVAL";

        }


        //--------------------------------
        // Villain teams
        //--------------------------------

        if(
            id.includes(
                "ROCKET"
            )
            ||
            id.includes(
                "AQUA"
            )
            ||
            id.includes(
                "MAGMA"
            )
            ||
            id.includes(
                "GALACTIC"
            )
            ||
            id.includes(
                "PLASMA"
            )
        )
        {

            return "VILLAIN_TEAM";

        }


        if(
            id.includes(
                "BOSS_"
            )
            ||
            id.endsWith(
                "_BOSS"
            )
            ||
            trainerClass.includes(
                "BOSS"
            )
        )
        {

            return "VILLAIN_TEAM";

        }


        //--------------------------------
        // Gym Leader
        //--------------------------------

        if(
            id.includes(
                "TRAINER_LEADER_"
            )
            ||
            id.includes(
                "LEADER_"
            )
        )
        {

            return "GYM_LEADER";

        }


        //--------------------------------
        // Existing type
        //--------------------------------

        if(
            trainer.trainerType
        )
        {

            return String(
                trainer.trainerType
            )
            .toUpperCase();

        }


        return "TRAINER";

    }


    //--------------------------------
    // Add trainer role
    //--------------------------------

    addTrainerRole(
        roles,
        interactionTypes,
        trainerType
    )
    {

        const type =
            String(
                trainerType
                ||
                "TRAINER"
            )
            .toUpperCase();


        switch(
            type
        )
        {

            case "GYM_LEADER":

                this.addUnique(
                    roles,
                    "GYM_LEADER"
                );


                this.addUnique(
                    roles,
                    "PROGRESSION"
                );

                break;


            case "ELITE_FOUR":

                this.addUnique(
                    roles,
                    "ELITE_FOUR"
                );


                this.addUnique(
                    roles,
                    "BATTLE"
                );


                this.addUnique(
                    roles,
                    "PROGRESSION"
                );

                break;


            case "CHAMPION":

                this.addUnique(
                    roles,
                    "CHAMPION"
                );


                this.addUnique(
                    roles,
                    "BATTLE"
                );


                this.addUnique(
                    roles,
                    "PROGRESSION"
                );

                break;


            case "RIVAL":

                this.addUnique(
                    roles,
                    "RIVAL"
                );


                this.addUnique(
                    roles,
                    "BATTLE"
                );

                break;


            case "VILLAIN_TEAM":

                this.addUnique(
                    roles,
                    "VILLAIN_TEAM"
                );


                this.addUnique(
                    roles,
                    "BATTLE"
                );

                break;


            default:

                this.addUnique(
                    roles,
                    "TRAINER"
                );

                break;

        }


        this.addUnique(

            interactionTypes,

            "BATTLE"

        );

    }


    //--------------------------------
    // Add unique array value
    //--------------------------------

    addUnique(
        array,
        value
    )
    {

        if(
            !array.includes(
                value
            )
        )
        {

            array.push(
                value
            );

        }

    }


}


module.exports =
    NPCTrainerResolver;
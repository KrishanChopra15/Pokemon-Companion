/**
 * Pokémon Companion
 * Progression Service
 *
 * Evaluates progression database rules.
 *
 * Responsibilities:
 * - Load progression database.
 * - Check requirements.
 * - Evaluate unlocks.
 * - Check trainer state.
 *
 * Does NOT:
 * - Know game specific rules.
 * - Traverse maps.
 * - Parse source files.
 * - Handle obstacles.
 */

"use strict";


const fs =
    require("fs");

const path =
    require("path");



class ProgressionService {



    constructor(
        game = "firered"
    ) {


        this.game =
            game;


        this.progression =
            this.loadProgression();


    }





    //--------------------------------
    // Database
    //--------------------------------


    loadProgression() {


        const file =
            path.join(

                process.cwd(),

                "database",

                "generated",

                this.game,

                "progression.json"

            );



        if(
            !fs.existsSync(file)
        ) {

            return {};

        }



        return JSON.parse(

            fs.readFileSync(
                file,
                "utf8"
            )

        );


    }





    getProgression(id) {


        return (

            this.progression[id]

            ||

            null

        );


    }





    //--------------------------------
    // Main Evaluation
    //--------------------------------


    canUnlock(
        id,
        trainerState
    ) {


        const progression =
            this.getProgression(id);



        if(!progression) {


            return {

                allowed:false,

                reason:
                    "Unknown progression"

            };


        }




        return this.checkRequirement(

            progression.requirement,

            trainerState

        );


    }





    checkRequirement(
        requirement,
        trainerState
    ) {


        if(
            !requirement
        ) {


            return {

                allowed:true

            };


        }





        //--------------------------------
        // Badge requirement
        //--------------------------------


        if(
            requirement.badges
        ) {


            if(
                !this.hasBadges(

                    requirement.badges,

                    trainerState

                )
            ) {


                return {

                    allowed:false,

                    reason:
                        "Missing required badges"

                };


            }


        }





        //--------------------------------
        // Single badge
        //--------------------------------


        if(
            requirement.badge
        ) {


            if(
                !this.hasBadge(

                    requirement.badge,

                    trainerState

                )
            ) {


                return {

                    allowed:false,

                    reason:
                        `Requires ${requirement.badge}`

                };


            }


        }






        //--------------------------------
        // HM
        //--------------------------------


        if(
            requirement.hm
        ) {


            if(
                !this.hasHM(

                    requirement.hm,

                    trainerState

                )
            ) {


                return {

                    allowed:false,

                    reason:
                        `Requires HM ${requirement.hm}`

                };


            }


        }






        //--------------------------------
        // Key Item
        //--------------------------------


        if(
            requirement.keyItem
        ) {


            if(
                !this.hasKeyItem(

                    requirement.keyItem,

                    trainerState

                )
            ) {


                return {

                    allowed:false,

                    reason:
                        `Requires ${requirement.keyItem}`

                };


            }


        }






        //--------------------------------
        // Story Flag
        //--------------------------------


        if(
            requirement.storyFlag
        ) {


            if(
                !this.hasStoryFlag(

                    requirement.storyFlag,

                    trainerState

                )
            ) {


                return {

                    allowed:false,

                    reason:
                        `Requires ${requirement.storyFlag}`

                };


            }


        }





        return {

            allowed:true

        };


    }







    //--------------------------------
    // Badges
    //--------------------------------


    hasBadge(
        badge,
        trainerState
    ) {


        if(
            trainerState.hasBadge
        ) {

            return trainerState.hasBadge(
                badge
            );

        }



        return (

            trainerState.badges

            ||

            []

        )
        .includes(
            badge
        );


    }





    hasBadges(
        badges,
        trainerState
    ) {


        return badges.every(

            badge =>
                this.hasBadge(
                    badge,
                    trainerState
                )

        );


    }







    //--------------------------------
    // HM
    //--------------------------------


    hasHM(
        hm,
        trainerState
    ) {


        if(
            trainerState.hasHM
        ) {


            return trainerState.hasHM(
                hm
            );


        }



        return (

            trainerState.hms

            ||

            []

        )
        .includes(
            hm
        );


    }







    //--------------------------------
    // Items
    //--------------------------------


    hasKeyItem(
        item,
        trainerState
    ) {


        if(
            trainerState.hasKeyItem
        ) {


            return trainerState.hasKeyItem(
                item
            );


        }



        return (

            trainerState.keyItems

            ||

            []

        )
        .includes(
            item
        );


    }







    //--------------------------------
    // Story
    //--------------------------------


    hasStoryFlag(
        flag,
        trainerState
    ) {


        if(
            trainerState.hasStoryFlag
        ) {


            return trainerState.hasStoryFlag(
                flag
            );


        }



        return (

            trainerState.storyFlags

            ||

            []

        )
        .includes(
            flag
        );


    }





}



module.exports =
    ProgressionService;
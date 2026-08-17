/**
 * Pokémon Companion
 * Progression Service
 *
 * Evaluates progression database rules.
 *
 * Responsibilities:
 * - Load progression database.
 * - Find progression rules.
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
    )
    {


        this.game =
            game;


        this.progression =
            this.loadProgression();


    }









    //--------------------------------
    // Database
    //--------------------------------


    loadProgression()
    {


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
        )
        {

            return {};

        }



        return JSON.parse(

            fs.readFileSync(

                file,

                "utf8"

            )

        );


    }









    getProgression(
        id
    )
    {

        return (

            this.progression[id]

            ||

            null

        );

    }









    getAllProgression()
    {

        return this.progression;

    }









    getLocationProgression(
        location
    )
    {


        return Object.keys(

            this.progression

        )
        .filter(

            id =>

                this.progression[id]
                    .location === location

        );


    }









    //--------------------------------
    // Main Evaluation
    //--------------------------------


    canUnlock(
        id,
        trainerState
    )
    {


        const progression =
            this.getProgression(id);



        if(
            !progression
        )
        {

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
    )
    {


        if(
            !requirement
        )
        {

            return {

                allowed:true

            };

        }







        //--------------------------------
        // Badges
        //--------------------------------


        if(
            requirement.badges
        )
        {


            if(
                !this.hasBadges(

                    requirement.badges,

                    trainerState

                )
            )
            {

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
        )
        {


            if(
                !this.hasBadge(

                    requirement.badge,

                    trainerState

                )
            )
            {

                return {

                    allowed:false,

                    reason:
                        `Requires ${requirement.badge}`

                };

            }


        }









        //--------------------------------
        // Multiple HMs
        //--------------------------------


        if(
            requirement.hms
        )
        {


            for(
                const hm of requirement.hms
            )
            {


                if(
                    !this.hasHM(

                        hm,

                        trainerState

                    )
                )
                {

                    return {

                        allowed:false,

                        reason:
                            `Requires HM ${hm}`

                    };

                }


            }


        }









        //--------------------------------
        // Single HM
        //--------------------------------


        if(
            requirement.hm
        )
        {


            if(
                !this.hasHM(

                    requirement.hm,

                    trainerState

                )
            )
            {

                return {

                    allowed:false,

                    reason:
                        `Requires HM ${requirement.hm}`

                };

            }


        }









        //--------------------------------
        // Multiple Key Items
        //--------------------------------


        if(
            requirement.keyItems
        )
        {


            for(
                const item of requirement.keyItems
            )
            {


                if(
                    !this.hasKeyItem(

                        item,

                        trainerState

                    )
                )
                {

                    return {

                        allowed:false,

                        reason:
                            `Requires key item ${item}`

                    };

                }


            }


        }









        //--------------------------------
        // Single Key Item
        //--------------------------------


        if(
            requirement.keyItem
        )
        {


            if(
                !this.hasKeyItem(

                    requirement.keyItem,

                    trainerState

                )
            )
            {

                return {

                    allowed:false,

                    reason:
                        `Requires ${requirement.keyItem}`

                };

            }


        }









        //--------------------------------
        // Multiple Story Flags
        //--------------------------------


        if(
            requirement.storyFlags
        )
        {


            for(
                const flag of requirement.storyFlags
            )
            {


                if(
                    !this.hasStoryFlag(

                        flag,

                        trainerState

                    )
                )
                {

                    return {

                        allowed:false,

                        reason:
                            `Requires story flag ${flag}`

                    };

                }


            }


        }









        //--------------------------------
        // Single Story Flag
        //--------------------------------


        if(
            requirement.storyFlag
        )
        {


            if(
                !this.hasStoryFlag(

                    requirement.storyFlag,

                    trainerState

                )
            )
            {

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
    // Badge helpers
    //--------------------------------


    hasBadge(
        badge,
        trainerState
    )
    {


        if(
            trainerState.hasBadge
        )
        {

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
    )
    {

        return badges.every(

            badge =>

                this.hasBadge(

                    badge,

                    trainerState

                )

        );

    }









    //--------------------------------
    // HM helpers
    //--------------------------------


    hasHM(
        hm,
        trainerState
    )
    {


        if(
            trainerState.hasHM
            &&
            trainerState.hasHM(hm)
        )
        {

            return true;

        }




        if(
            trainerState.hms
            &&
            trainerState.hms.includes(hm)
        )
        {

            return true;

        }





        if(
            trainerState.hmAbilities
            &&
            trainerState.hmAbilities.includes(hm)
        )
        {

            return true;

        }



        return false;


    }









    //--------------------------------
    // Key item helpers
    //--------------------------------


    hasKeyItem(
        item,
        trainerState
    )
    {


        if(
            trainerState.hasKeyItem
        )
        {

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
    // Story helpers
    //--------------------------------


    hasStoryFlag(
        flag,
        trainerState
    )
    {


        if(
            trainerState.hasStoryFlag
        )
        {

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
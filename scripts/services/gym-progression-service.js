/**
 * Pokémon Companion
 * Gym Progression Service
 *
 * Provides gym progression logic.
 *
 * Responsibilities:
 * - Check gym availability.
 * - Check badge ownership.
 * - Check story requirements.
 * - Provide recommended progression.
 *
 * Does NOT:
 * - Load database files.
 * - Read ROM data.
 * - Handle map traversal.
 * - Analyze Pokémon.
 * - Execute battles.
 */

"use strict";





class GymProgressionService {



    constructor(
        gymDatabaseService,
        mapAccessService = null
    )
    {


        this.database =
            gymDatabaseService;



        this.mapAccess =
            mapAccessService;


    }









    //--------------------------------
    // Lookup
    //--------------------------------


    getAllGyms()
    {

        if(
            !this.database
        )
        {

            return [];

        }


        return this.database.getAllGyms();

    }







    getGym(
        id
    )
    {

        if(
            !this.database
        )
        {

            return null;

        }


        return this.database.getGym(
            id
        );

    }









    getGymByOrder(
        order
    )
    {

        return this.getAllGyms()
            .find(

                gym =>

                    gym.order === order

            )

            ||

            null;

    }









    getNextGym(
        order
    )
    {

        return this.getGymByOrder(

            order + 1

        );

    }









    //--------------------------------
    // Previous gyms
    //--------------------------------


    getPreviousGyms(
        id
    )
    {


        const gym =
            this.getGym(id);



        if(
            !gym
        )
        {

            return [];

        }




        return this.getAllGyms()
            .filter(

                entry =>

                    entry.order < gym.order

            );


    }









    //--------------------------------
    // Challenge check
    //--------------------------------


    canChallengeGym(
        id,
        trainerState
    )
    {


        const gym =
            this.getGym(id);



        if(
            !gym
        )
        {

            return {

                allowed:false,

                reason:
                    "Unknown gym"

            };

        }








        if(

            trainerState.hasCompletedBattle

            &&

            trainerState.hasCompletedBattle(id)

        )
        {

            return {

                allowed:false,

                reason:
                    "Gym already defeated"

            };

        }








        const requirement =
            gym.requirements;





        if(
            requirement
        )
        {


            if(
                !this.checkStoryFlags(
                    requirement,
                    trainerState
                )
            )
            {

                return {

                    allowed:false,

                    reason:
                        "Missing story requirement"

                };

            }






            if(
                !this.checkBadges(
                    requirement,
                    trainerState
                )
            )
            {

                return {

                    allowed:false,

                    reason:
                        "Missing badge requirement"

                };

            }






            if(
                !this.checkHMs(
                    requirement,
                    trainerState
                )
            )
            {

                return {

                    allowed:false,

                    reason:
                        "Missing HM requirement"

                };

            }






            if(
                !this.checkKeyItems(
                    requirement,
                    trainerState
                )
            )
            {

                return {

                    allowed:false,

                    reason:
                        "Missing key item requirement"

                };

            }







            if(
                requirement.access
            )
            {


                const access =
                    this.checkAccess(

                        requirement.access,

                        trainerState

                    );



                if(
                    !access.allowed
                )
                {

                    return access;

                }

            }


        }







        return {

            allowed:true

        };


    }









    //--------------------------------
    // Requirement checks
    //--------------------------------


    checkStoryFlags(
        requirement,
        trainerState
    )
    {

        if(
            !requirement.storyFlags
        )
        {

            return true;

        }




        return requirement.storyFlags.every(

            flag =>

                this.hasStoryFlag(
                    flag,
                    trainerState
                )

        );


    }







    checkBadges(
        requirement,
        trainerState
    )
    {

        if(
            !requirement.badges
        )
        {

            return true;

        }




        return requirement.badges.every(

            badge =>

                this.playerHasBadge(
                    badge,
                    trainerState
                )

        );


    }







    checkHMs(
        requirement,
        trainerState
    )
    {

        if(
            !requirement.hms
        )
        {

            return true;

        }




        return requirement.hms.every(

            hm =>

                this.hasHM(
                    hm,
                    trainerState
                )

        );


    }







    checkKeyItems(
        requirement,
        trainerState
    )
    {

        if(
            !requirement.keyItems
        )
        {

            return true;

        }




        return requirement.keyItems.every(

            item =>

                this.hasKeyItem(
                    item,
                    trainerState
                )

        );


    }









    //--------------------------------
    // Map access
    //--------------------------------


    checkAccess(
        location,
        trainerState
    )
    {


        if(
            this.mapAccess
        )
        {

            return this.mapAccess.canAccess(

                location,

                trainerState

            );

        }





        const visited =
            trainerState.visitedLocations
            ||
            [];



        return {

            allowed:

                visited.includes(
                    location
                )

        };


    }









    //--------------------------------
    // Helpers
    //--------------------------------


    hasHM(
        hm,
        trainerState
    )
    {

        return (

            trainerState.hmAbilities

            ||
            []

        )
        .includes(hm)

        ||

        (

            trainerState.hms

            ||
            []

        )
        .includes(hm);


    }







    hasKeyItem(
        item,
        trainerState
    )
    {


        if(
            trainerState.hasKeyItem
        )
        {

            return trainerState.hasKeyItem(item);

        }



        return (

            trainerState.keyItems

            ||
            []

        )
        .includes(item);


    }







    hasStoryFlag(
        flag,
        trainerState
    )
    {


        if(
            trainerState.hasStoryFlag
        )
        {

            return trainerState.hasStoryFlag(flag);

        }



        return (

            trainerState.storyFlags

            ||
            []

        )
        .includes(flag);


    }







    playerHasBadge(
        badge,
        trainerState
    )
    {


        if(
            trainerState.hasBadge
        )
        {

            return trainerState.hasBadge(badge);

        }



        return (

            trainerState.badges

            ||
            []

        )
        .includes(badge);


    }









    //--------------------------------
    // Available gyms
    //--------------------------------


    getAvailableGyms(
        trainerState
    )
    {

        return this.getAllGyms()
            .filter(

                gym =>

                    this.canChallengeGym(
                        gym.id,
                        trainerState
                    )
                    .allowed

            );


    }









    //--------------------------------
    // Recommended progression
    //--------------------------------


    getRecommendedNextGyms(
        trainerState
    )
    {


        const available =
            this.getAvailableGyms(
                trainerState
            );



        if(
            available.length === 0
        )
        {

            return [];

        }




        const nextOrder =
            Math.min(

                ...

                available.map(

                    gym =>

                        gym.order

                )

            );




        return available.filter(

            gym =>

                gym.order === nextOrder

        );


    }









    //--------------------------------
    // Next unfinished gym
    //--------------------------------


    getNextUncompletedGym(
        trainerState
    )
    {


        return this.getAllGyms()
            .sort(

                (a,b)=>

                    a.order - b.order

            )
            .find(

                gym =>

                !(
                    trainerState.hasCompletedBattle

                    &&

                    trainerState.hasCompletedBattle(
                        gym.id
                    )

                )

            )

            ||

            null;


    }









    //--------------------------------
    // Badge
    //--------------------------------


    hasBadge(
        gymId,
        trainerState
    )
    {


        const gym =
            this.getGym(
                gymId
            );



        if(
            !gym
        )
        {

            return false;

        }



        return this.playerHasBadge(

            gym.badge,

            trainerState

        );


    }









    //--------------------------------
    // Statistics
    //--------------------------------


    getGymCount()
    {

        return this.getAllGyms()
            .length;

    }







    getCompletedGymCount(
        trainerState
    )
    {

        return this.getAllGyms()
            .filter(

                gym =>

                    trainerState.hasCompletedBattle

                    &&

                    trainerState.hasCompletedBattle(
                        gym.id
                    )

            )
            .length;


    }



}





module.exports =
    GymProgressionService;
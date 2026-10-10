
/**
 * Pokémon Companion
 * Storage Flow
 *
 * Coordinates PC storage operations.
 *
 * Responsibilities:
 * - Store Pokémon in PC.
 * - Remove Pokémon from PC.
 * - Move Pokémon between party and PC.
 * - Provide storage status.
 * - Preserve Pokémon identity during transfers.
 *
 * Does NOT:
 * - Capture Pokémon.
 * - Manage party limits.
 * - Execute battles.
 */

"use strict";


class StorageFlow
{

    constructor(
        storageManager,
        teamFlow = null
    )
    {

        this.storage =
            storageManager;

        this.team =
            teamFlow;

    }


    //--------------------------------
    // Get current team members
    //--------------------------------

    getTeamMembers()
    {

        if(
            !this.team
        )
        {

            return null;

        }


        // Support a TeamFlow that exposes getTeam().
        if(
            typeof this.team.getTeam === "function"
        )
        {

            const team =
                this.team.getTeam();

            return Array.isArray(team)
                ? team
                : null;

        }


        // TeamFlow delegates to TeamManager.
        if(
            this.team.team &&
            typeof this.team.team.getTeam === "function"
        )
        {

            const team =
                this.team.team.getTeam();

            return Array.isArray(team)
                ? team
                : null;

        }


        return null;

    }


    //--------------------------------
    // Find the actual team Pokémon
    //--------------------------------

    findTeamPokemon(target)
    {

        const team =
            this.getTeamMembers();


        if(
            !team ||
            !target
        )
        {

            return null;

        }


        return team.find(

            pokemon =>

                pokemon === target ||
                (
                    target.id != null &&
                    pokemon.id === target.id
                )

        ) || null;

    }


    //--------------------------------
    // Store Pokémon in PC
    //--------------------------------

    storePokemon(
        pokemon
    )
    {

        if(
            !pokemon ||
            typeof pokemon !== "object" ||
            !pokemon.species
        )
        {

            return {

                success: false,

                reason:
                    "Invalid Pokemon"

            };

        }


        if(
            !this.storage ||
            typeof this.storage.addPokemon !== "function"
        )
        {

            return {

                success: false,

                reason:
                    "Storage unavailable"

            };

        }


        // Newly captured overflow Pokémon are
        // not on the team, so store them directly.
        return this.storage.addPokemon(
            pokemon
        );

    }


    //--------------------------------
    // Remove Pokémon from PC
    //--------------------------------

    removePokemon(
        id
    )
    {

        return this.storage
            .removePokemon(
                id
            );

    }


    //--------------------------------
    // Find Pokémon in PC
    //--------------------------------

    findPokemon(
        id
    )
    {

        return this.storage
            .findPokemon(
                id
            );

    }


    //--------------------------------
    // Withdraw Pokémon from PC
    //--------------------------------

    withdrawPokemon(
        id
    )
    {

        const pokemon =
            this.storage
                .findPokemon(
                    id
                );


        if(
            !pokemon
        )
        {

            return {

                success: false,

                reason:
                    "Pokemon not found"

            };

        }


        if(
            !this.team ||
            typeof this.team.addToTeam !== "function" ||
            typeof this.team.removeFromTeam !== "function"
        )
        {

            return {

                success: false,

                reason:
                    "Team unavailable"

            };

        }


        //--------------------------------
        // Prevent duplicate team entries
        //--------------------------------

        const existingPokemon =
            this.findTeamPokemon(
                pokemon
            );


        if(
            existingPokemon
        )
        {

            return {

                success: false,

                reason:
                    "Pokemon is already on the team"

            };

        }


        //--------------------------------
        // Add Pokémon to the team first
        //
        // TeamManager enforces the party
        // size limit.
        //--------------------------------

        const added =
            this.team
                .addToTeam(
                    pokemon
                );


        if(
            !added ||
            !added.success
        )
        {

            return added || {

                success: false,

                reason:
                    "Could not add Pokemon to team"

            };

        }


        //--------------------------------
        // Remove from PC after successful
        // team addition
        //--------------------------------

        const removed =
            this.storage
                .removePokemon(
                    id
                );


        if(
            !removed ||
            !removed.success
        )
        {

            // Roll back the team addition
            // if the PC removal fails.
            this.team
                .removeFromTeam(
                    pokemon
                );


            return {

                success: false,

                reason:
                    removed?.reason ||
                    "Could not remove Pokemon from PC"

            };

        }


        return {

            success: true,

            pokemon,

            removed

        };

    }


    //--------------------------------
    // Deposit Pokémon into PC
    //--------------------------------

    depositPokemon(
        pokemon
    )
    {

        if(
            !pokemon ||
            typeof pokemon !== "object" ||
            !pokemon.species
        )
        {

            return {

                success: false,

                reason:
                    "Invalid Pokemon"

            };

        }


        if(
            !this.storage ||
            typeof this.storage.addPokemon !== "function"
        )
        {

            return {

                success: false,

                reason:
                    "Storage unavailable"

            };

        }


        if(
            !this.team ||
            typeof this.team.removeFromTeam !== "function" ||
            typeof this.team.addToTeam !== "function"
        )
        {

            return {

                success: false,

                reason:
                    "Team unavailable"

            };

        }


        //--------------------------------
        // Resolve the exact Pokémon from
        // the active team when possible.
        //--------------------------------

        const teamMembers =
            this.getTeamMembers();


        if(
            Array.isArray(teamMembers)
        )
        {

            const teamPokemon =
                this.findTeamPokemon(
                    pokemon
                );


            if(
                !teamPokemon
            )
            {

                return {

                    success: false,

                    reason:
                        "Pokemon is not on the team"

                };

            }


            pokemon =
                teamPokemon;

        }


        //--------------------------------
        // Remove Pokémon from the team
        //--------------------------------

        const removedFromTeam =
            this.team
                .removeFromTeam(
                    pokemon
                );


        if(
            !removedFromTeam ||
            !removedFromTeam.success
        )
        {

            return removedFromTeam || {

                success: false,

                reason:
                    "Could not remove Pokemon from team"

            };

        }


        const pokemonToStore =
            removedFromTeam.pokemon ||
            pokemon;


        //--------------------------------
        // Add the same Pokémon object to PC
        //--------------------------------

        const stored =
            this.storage
                .addPokemon(
                    pokemonToStore
                );


        if(
            !stored ||
            !stored.success
        )
        {

            //--------------------------------
            // Roll back if storage fails
            //--------------------------------

            const restored =
                this.team
                    .addToTeam(
                        pokemonToStore
                    );


            return {

                success: false,

                reason:
                    stored?.reason ||
                    "Could not store Pokemon",

                restoredToTeam:
                    Boolean(
                        restored &&
                        restored.success
                    )

            };

        }


        return {

            success: true,

            pokemon:
                stored.pokemon,

            removed:
                removedFromTeam

        };

    }


    //--------------------------------
    // Storage list
    //--------------------------------

    getStorage()
    {

        return this.storage
            .getStorage();

    }


    //--------------------------------
    // Storage status
    //--------------------------------

    getStatus()
    {

        return {

            count:
                this.storage
                    .getCount(),

            storage:
                this.storage
                    .getStorage()

        };

    }

}


module.exports =
    StorageFlow;

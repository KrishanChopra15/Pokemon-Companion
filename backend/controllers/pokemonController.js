/**
 * Pokémon Companion
 * Pokémon Controller
 *
 * Handles Pokémon API requests.
 *
 * Responsibilities:
 * - Return Pokémon lists.
 * - Return Pokémon details.
 * - Handle search and filters.
 * - Handle sorting.
 * - Handle pagination.
 *
 * Does NOT:
 * - Access the database directly.
 * - Generate Pokémon data.
 * - Contain Pokémon business logic.
 */

"use strict";


const PokemonService =
    require("../services/pokemonService");



const pokemonService =
    new PokemonService(
        "firered"
    );



/*
 * Return a lightweight Pokémon summary.
 */
function buildSummary(
    pokemon
)
{

    return pokemonService.buildPokemonSummary(
        pokemon
    );

}



/*========================================
  GET /api/pokemon
========================================*/

exports.getPokemon = async (
    req,
    res
) =>
{

    try
    {

        const {
            page = 1,
            limit = 24,
            search = "",
            generation = "all",
            type = "all",
            ability = "",
            sort = "number"
        } = req.query;


        //--------------------------------
        // Query Pokémon
        //--------------------------------

        const pokemon =
            pokemonService.queryPokemon(
                {
                    search,
                    generation,
                    type,
                    ability,
                    sort
                }
            );


        //--------------------------------
        // Pagination
        //--------------------------------

        const paginated =
            pokemonService.paginate(
                pokemon,
                page,
                limit
            );


        //--------------------------------
        // Build summaries
        //--------------------------------

        const summaries =
            paginated.items
                .map(
                    buildSummary
                )
                .filter(
                    Boolean
                );


        //--------------------------------
        // Response
        //--------------------------------

        return res.status(200).json(

            {

                success:
                    true,

                pokemon:
                    summaries,

                pagination:
                    paginated.pagination

            }

        );

    }
    catch(error)
    {

        console.error(
            "Pokémon list error:",
            error
        );


        return res.status(500).json(

            {

                success:
                    false,

                message:
                    error.message

            }

        );

    }

};



/*========================================
  GET /api/pokemon/:id
========================================*/

exports.getPokemonById = async (
    req,
    res
) =>
{

    try
    {

        const {
            id
        } = req.params;


        //--------------------------------
        // Validate ID
        //--------------------------------

        if(
            !id
        )
        {

            return res.status(400).json(

                {

                    success:
                        false,

                    message:
                        "Pokémon ID required"

                }

            );

        }


        //--------------------------------
        // Get Pokémon
        //--------------------------------

        const pokemon =
            pokemonService.getPokemonDetails(
                id
            );


        //--------------------------------
        // Not found
        //--------------------------------

        if(
            !pokemon
        )
        {

            return res.status(404).json(

                {

                    success:
                        false,

                    message:
                        "Pokémon not found"

                }

            );

        }


        //--------------------------------
        // Response
        //--------------------------------

        return res.status(200).json(

            {

                success:
                    true,

                pokemon

            }

        );

    }
    catch(error)
    {

        console.error(
            "Pokémon details error:",
            error
        );


        return res.status(500).json(

            {

                success:
                    false,

                message:
                    error.message

            }

        );

    }

};
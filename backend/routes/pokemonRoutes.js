/**
 * Pokémon Companion
 * Pokémon Routes
 *
 * Handles Pokémon API endpoints.
 *
 * Routes:
 * GET /api/pokemon
 * GET /api/pokemon/:id
 */

"use strict";


const express =
    require("express");


const router =
    express.Router();


const pokemonController =
    require("../controllers/pokemonController");


//========================================
// Get Pokémon list
//========================================
//
// GET
// /api/pokemon
//
// Query parameters:
//
// ?page=1
// ?limit=24
// ?search=char
// ?generation=1
// ?type=Fire
// ?ability=BLAZE
// ?sort=number
//
//========================================

router.get(

    "/",

    pokemonController.getPokemon

);


//========================================
// Get Pokémon details
//========================================
//
// GET
// /api/pokemon/:id
//
// Example:
//
// /api/pokemon/0004
//
//========================================

router.get(

    "/:id",

    pokemonController.getPokemonById

);


module.exports =
    router;
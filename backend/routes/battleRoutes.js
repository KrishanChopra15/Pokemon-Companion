/**
 * Pokémon Companion
 * Battle Routes
 *
 * Handles battle API endpoints.
 *
 * Routes:
 * POST   /api/battles
 * GET    /api/battles/:id
 * POST   /api/battles/:id/turn
 * GET    /api/battles/:id/state
 */

"use strict";


const express =
    require("express");


const router =
    express.Router();



const battleController =
    require("../controllers/battleController");









//--------------------------------
// Create battle
//--------------------------------
//
// POST
// /api/battles
//
// Body:
//
// {
//    trainer:"BROCK",
//    player:{}
// }
//
//--------------------------------


router.post(

    "/",

    battleController.createBattle

);









//--------------------------------
// Get battle
//--------------------------------
//
// GET
// /api/battles/:id
//
//--------------------------------


router.get(

    "/:id",

    battleController.getBattle

);









//--------------------------------
// Process turn
//--------------------------------
//
// POST
// /api/battles/:id/turn
//
// Body:
//
// {
//    move:"EMBER"
// }
//
//--------------------------------


router.post(

    "/:id/turn",

    battleController.processTurn

);









//--------------------------------
// Get state
//--------------------------------
//
// GET
// /api/battles/:id/state
//
//--------------------------------


router.get(

    "/:id/state",

    battleController.getState

);









module.exports =
    router;
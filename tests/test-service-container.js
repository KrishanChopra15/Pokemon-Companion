/**
 * Pokémon Companion
 * Service Container Test
 *
 * Tests:
 * - Register services.
 * - Retrieve services.
 * - Check service existence.
 */

"use strict";


const ServiceContainer =
require("../scripts/container/service-container");



const container =
new ServiceContainer();



const testService =
{
    name:"Test Service"
};



// Register service

container.register(
    "test",
    testService
);



// Check existence

console.log(
    "Exists:",
    container.has("test")
);



// Retrieve service

console.log(
    "Service:",
    container.get("test")
);
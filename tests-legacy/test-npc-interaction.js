const NPCInteractionService =
require("../scripts/services/npc-interaction-service");


const NPCService =
require("../scripts/services/npc-service");


const EventService =
require("../scripts/services/event-service");


const DialogueService =
require("../scripts/services/dialogue-service");


const TrainerState =
require("../scripts/domain/trainer-state");



const trainer =
new TrainerState();



const interaction =
new NPCInteractionService(

    new NPCService("firered"),

    new EventService("firered"),

    new DialogueService("firered")

);



console.log(
interaction.interact(
"CinnabarIsland_PokemonCenter_1F_EventScript_Bill",
trainer
));
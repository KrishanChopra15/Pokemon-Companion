const EventRequirementExtractor =
require("../scripts/extractors/game-boy-advance/event-requirement-extractor");


const extractor =
new EventRequirementExtractor();



const script = `

goto_if_set FLAG_GOT_SS_TICKET AlreadyGotTicket

goto_if_unset FLAG_BADGE_BOULDER Continue

checkitem ITEM_POKE_FLUTE

checkbadge BADGE_BOULDER

`;



console.log(
    extractor.extract(script)
);
const {
    getSpecies
} = require(
    "../utils/loaders/showdown"
);

const TEST_POKEMON = [

    "bulbasaur",
    "ivysaur",
    "pikachu",
    "onix",
    "eevee",
    "scyther",
    "gloom",
    "kirlia",
    "inkay",
    "sneasel",
    "qwilfishhisui",
    "basculinwhitestriped",
    "ursaring",
    "primeape",
    "bisharp",
    "charcadet",
    "finizen",
    "gimmighoul",
    "milcery"

];

function printField(
    name,
    value
) {

    if (
        value === undefined
    ) {

        return;

    }

    console.log(

        name.padEnd(22),

        value

    );

}

for (

    const id of TEST_POKEMON

) {

    const species =
        getSpecies(
            id,
            9
        );

    console.log();
    console.log(
        "=".repeat(70)
    );
    console.log(
        species.name.toUpperCase()
    );
    console.log(
        "=".repeat(70)
    );

    printField(
        "gen",
        species.gen
    );

    printField(
        "prevo",
        species.prevo
    );

    printField(
        "evos",
        species.evos
    );

    printField(
        "nfe",
        species.nfe
    );

    console.log();

    console.log(
        "----- Evolution Fields -----"
    );

    printField(
        "evoType",
        species.evoType
    );

    printField(
        "evoItem",
        species.evoItem
    );

    printField(
        "evoMove",
        species.evoMove
    );

    printField(
        "evoLevel",
        species.evoLevel
    );

    printField(
        "evoCondition",
        species.evoCondition
    );

    printField(
        "requiredItem",
        species.requiredItem
    );

    printField(
        "requiredItems",
        species.requiredItems
    );

    printField(
        "requiredMove",
        species.requiredMove
    );

    printField(
        "requiredAbility",
        species.requiredAbility
    );

    printField(
        "requiredNature",
        species.requiredNature
    );

    printField(
        "requiredGender",
        species.requiredGender
    );

    printField(
        "requiredWeather",
        species.requiredWeather
    );

    printField(
        "requiredTime",
        species.requiredTime
    );

    printField(
        "requiredFriendship",
        species.requiredFriendship
    );

    printField(
        "requiredBeauty",
        species.requiredBeauty
    );

    printField(
        "requiredStat",
        species.requiredStat
    );

    printField(
        "requiredParty",
        species.requiredParty
    );

    printField(
        "requiredLocation",
        species.requiredLocation
    );

    console.log();

    console.log(
        "----- Misc -----"
    );

    printField(
        "forme",
        species.forme
    );

    printField(
        "baseSpecies",
        species.baseSpecies
    );

    printField(
        "formeOrder",
        species.formeOrder
    );

}
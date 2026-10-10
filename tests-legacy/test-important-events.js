/**
 * Pokémon Companion
 * Important Event Test
 *
 * Checks important FireRed events:
 * - Gift Pokémon
 * - Key items
 * - TMs
 * - HMs
 * - Story events
 * - Requirements
 * - Conditions
 */

"use strict";


const fs =
    require("fs");



const events =
    JSON.parse(
        fs.readFileSync(
            "./database/generated/firered/events.json",
            "utf8"
        )
    );






function printEvent(
    event
)
{


    console.log();

    console.log(
        event.id
    );



    console.log(
        JSON.stringify(
            {
                effects:
                    event.effects,

                requirements:
                    event.requirements,

                conditions:
                    event.conditions
            },
            null,
            2
        )
    );


}







const checks =
[


    {
        name:"EEVEE",

        test:event =>
            event.effects.addPokemon
            .some(
                p =>
                    p.species === "EEVEE"
            )
    },



    {
        name:"LAPRAS",

        test:event =>
            event.effects.addPokemon
            .some(
                p =>
                    p.species === "LAPRAS"
            )
    },



    {
        name:"SNORLAX",

        test:event =>
            event.effects.battles
            .some(
                b =>
                    b.species === "SNORLAX"
            )
    },



    {
        name:"MAGIKARP",

        test:event =>
            event.effects.addPokemon
            .some(
                p =>
                    p.species === "MAGIKARP"
            )
    },



    {
        name:"TM42",

        test:event =>
            event.effects.addTMs
            .includes(
                "TM42"
            )
    },



    {
        name:"POKE_FLUTE",

        test:event =>
            event.effects.addKeyItems
            .includes(
                "POKE_FLUTE"
            )
    },



    {
        name:"SS_TICKET",

        test:event =>
            event.effects.addKeyItems
            .includes(
                "SS_TICKET"
            )
    },



    {
        name:"OAKS_PARCEL",

        test:event =>
            event.effects.addKeyItems
            .includes(
                "OAKS_PARCEL"
            )
    },



    {
        name:"HM01",

        test:event =>
            event.effects.addKeyItems
            .includes(
                "HM01"
            )
    }


];









for(
    const check of checks
)
{


    console.log(
        "\n================="
    );


    console.log(
        check.name
    );


    console.log(
        "================="
    );



    const results =
        events.filter(
            check.test
        );



    if(
        results.length === 0
    )
    {


        console.log(
            "No events found."
        );


        continue;


    }




    results.forEach(
        printEvent
    );


}
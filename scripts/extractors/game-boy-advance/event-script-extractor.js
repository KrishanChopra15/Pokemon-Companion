/**
 * Pokémon Companion
 * Event Script Extractor
 *
 * Extracts event scripts:
 * - Dialogue references
 * - Item rewards
 * - Pokémon gifts
 * - Egg gifts
 * - Money rewards
 * - TM rewards
 * - Key items
 * - Wild battles
 * - Trainer battles
 * - Story flags
 * - Variables
 * - Requirements
 * - Conditions
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");


const EventRequirementExtractor =
    require("./event-requirement-extractor");



class EventScriptExtractor {



    constructor()
    {

        this.requirementExtractor =
            new EventRequirementExtractor();

    }





    extract(referencePath)
    {


        const mapsPath =
            path.join(
                referencePath,
                "data/maps"
            );



        const scripts = {};



        const maps =
            fs.readdirSync(
                mapsPath
            );



        for(
            const map of maps
        )
        {


            const file =
                path.join(
                    mapsPath,
                    map,
                    "scripts.inc"
                );



            if(
                !fs.existsSync(file)
            )
                continue;



            Object.assign(
                scripts,
                this.extractScripts(file)
            );


        }


        return scripts;


    }







    extractScripts(file)
    {


        const content =
            fs.readFileSync(
                file,
                "utf8"
            );



        const result = {};



        const regex =
            /([A-Za-z0-9_]+)::([\s\S]*?)(?=\n[A-Za-z0-9_]+::|$)/g;



        let match;



        while(
            (match = regex.exec(content))
        )
        {


            const id =
                match[1];


            const body =
                match[2];




            //--------------------------------
            // Requirements / Conditions
            //--------------------------------


            const requirementData =
                this.requirementExtractor.extract(
                    body
                );




            //--------------------------------
            // Variables
            //--------------------------------


            const variables =
                {};



            for(
                const variable of body.matchAll(
                    /setvar\s+(VAR_[A-Za-z0-9_]+),\s*SPECIES_([A-Z0-9_]+)/g
                )
            )
            {


                variables[variable[1]] =
                    variable[2];


            }







            //--------------------------------
            // Dialogues
            //--------------------------------


            const dialogues =
            [
                ...
                body.matchAll(
                    /msgbox\s+([A-Za-z0-9_]+)/g
                )
            ]
            .map(
                x => x[1]
            );







            //--------------------------------
            // Effects
            //--------------------------------


            const effects =
            {

                addItems: [],

                removeItems: [],

                addPokemon: [],

                addEggs: [],

                addTMs: [],

                addKeyItems: [],

                addMoney: 0,

                removeMoney: 0,

                addStoryFlags: [],

                removeStoryFlags: [],

                battles: []

            };







            //--------------------------------
            // Items
            //--------------------------------


            for(
                const item of body.matchAll(
                    /giveitem(?:_msg)?[^\n]*ITEM_([A-Z0-9_]+)(?:,\s*(\d+))?/g
                )
            )
            {


                const name =
                    item[1];


                const quantity =
                    Number(
                        item[2] || 1
                    );



                if(
                    name.startsWith("TM")
                )
                {

                    effects.addTMs.push(
                        name
                    );

                }
                else if(
                    [
                        "SS_TICKET",
                        "POKE_FLUTE",
                        "HM01",
                        "HM02",
                        "HM03",
                        "HM04",
                        "HM05",
                        "BICYCLE",
                        "OAKS_PARCEL",
                        "SILPH_SCOPE",
                        "BIKE_VOUCHER",
                        "COIN_CASE",
                        "CARD_KEY"
                    ]
                    .includes(name)
                )
                {

                    effects.addKeyItems.push(
                        name
                    );

                }
                else
                {

                    effects.addItems.push({

                        item:name,

                        quantity

                    });

                }


            }







            //--------------------------------
            // Pokémon gifts
            //--------------------------------


            for(
                const pokemon of body.matchAll(
                    /givemon\s+SPECIES_([A-Z0-9_]+),\s*(\d+)/g
                )
            )
            {


                effects.addPokemon.push({

                    species:
                        pokemon[1],


                    level:
                        Number(
                            pokemon[2]
                        )

                });


            }







            //--------------------------------
            // Pokémon variable gifts
            //--------------------------------


            for(
                const pokemon of body.matchAll(
                    /givemon\s+(VAR_[A-Za-z0-9_]+),\s*(\d+)/g
                )
            )
            {


                const species =
                    variables[pokemon[1]];



                if(
                    species
                )
                {

                    effects.addPokemon.push({

                        species,

                        level:
                            Number(
                                pokemon[2]
                            )

                    });


                }


            }







            //--------------------------------
            // Eggs
            //--------------------------------


            for(
                const egg of body.matchAll(
                    /giveegg\s+SPECIES_([A-Z0-9_]+)/g
                )
            )
            {


                effects.addEggs.push({

                    species:
                        egg[1]

                });


            }







            //--------------------------------
            // Money
            //--------------------------------


            for(
                const money of body.matchAll(
                    /givemoney\s+[A-Z0-9_]+,\s*(\d+)/g
                )
            )
            {


                effects.addMoney +=
                    Number(
                        money[1]
                    );


            }







            //--------------------------------
            // Wild battles
            //--------------------------------


            for(
                const battle of body.matchAll(
                    /setwildbattle\s+SPECIES_([A-Z0-9_]+),\s*(\d+)/g
                )
            )
            {


                effects.battles.push({

                    type:"wild",

                    species:
                        battle[1],

                    level:
                        Number(
                            battle[2]
                        )

                });


            }







            //--------------------------------
            // Trainer battles
            //--------------------------------


            for(
                const battle of body.matchAll(
                    /trainerbattle\s+([A-Z0-9_]+)/g
                )
            )
            {


                effects.battles.push({

                    type:"trainer",

                    trainer:
                        battle[1]

                });


            }







            //--------------------------------
            // Flags
            //--------------------------------


            for(
                const flag of body.matchAll(
                    /setflag\s+FLAG_([A-Z0-9_]+)/g
                )
            )
            {


                effects.addStoryFlags.push(
                    flag[1]
                );


            }



            for(
                const flag of body.matchAll(
                    /clearflag\s+FLAG_([A-Z0-9_]+)/g
                )
            )
            {


                effects.removeStoryFlags.push(
                    flag[1]
                );


            }







            //--------------------------------
            // Save
            //--------------------------------


            if(

                dialogues.length ||

                effects.addItems.length ||

                effects.addPokemon.length ||

                effects.addEggs.length ||

                effects.addTMs.length ||

                effects.addKeyItems.length ||

                effects.addMoney > 0 ||

                effects.addStoryFlags.length ||

                effects.removeStoryFlags.length ||

                effects.battles.length

            )
            {


                result[id] =
                {

                    id,

                    dialogues,

                    effects,


                    requirements:
                        requirementData.requirements,


                    conditions:
                        requirementData.conditions

                };


            }


        }



        return result;


    }


}



module.exports =
    EventScriptExtractor;
/**
 * Pokémon Companion
 * Machine Generator
 *
 * Generates the TM/HM reference database.
 *
 * Responsibilities:
 * - Read TM/HM item constants.
 * - Read TM/HM move mapping.
 * - Create machine references.
 * - Write machines.json.
 */

"use strict";

const ReferenceGenerator =
require("./reference-generator");

const DefineParser =
require("../../parsers/reference/define-parser");


class MachineGenerator extends ReferenceGenerator {


    generate() {


        //----------------------------------------
        // Read item constants
        //----------------------------------------

        const itemSource =
        this.readSourceFile(
            "pokefirered",
            "include",
            "constants",
            "items.h"
        );


        const itemParser =
        new DefineParser();


        const items =
        itemParser.parse(
            itemSource,
            "ITEM_"
        );


        const itemMap =
        new Map();


        for (const item of items) {

            itemMap.set(
                item.constant,
                item
            );

        }


        //----------------------------------------
        // Read TM/HM move table
        //----------------------------------------

        const partyMenuSource =
        this.readSourceFile(
            "pokefirered",
            "src",
            "data",
            "party_menu.h"
        );


        const moves =
        this.parseMachineMoves(
            partyMenuSource
        );


        //----------------------------------------
        // Build machines
        //----------------------------------------

        const machines = [];


        moves.forEach((move, index) => {


            let constant;


            if (index < 50) {

                constant =
                `ITEM_TM${String(index + 1).padStart(2,"0")}`;

            } else {

                constant =
                `ITEM_HM${String(index - 49).padStart(2,"0")}`;

            }


            const item =
            itemMap.get(
                constant
            );


            if (!item) {

                return;

            }


            machines.push({
            
                id: item.value,
            
                constant:
                    constant
                        .replace("ITEM_", "")
                        + "_" +
                    move.constant.replace("MOVE_", ""),
            
                itemConstant: constant,
            
                name:
                    constant.replace("ITEM_", ""),
            
                move
            
            });


        });


        this.writeDatabase(
            "machines",
            machines
        );


    }



    parseMachineMoves(source) {


        const regex =
        /static const u16 sTMHMMoves\[\]\s*=\s*\{([\s\S]*?)\};/;


        const match =
        source.match(regex);


        if (!match) {

            return [];

        }


        return match[1]

            .split(",")

            .map(
                value =>
                value.trim()
            )

            .filter(
                value =>
                value.startsWith("MOVE_")
            )

            .map(
                (constant, index) => ({

                    id:index,

                    constant

                })

            );


    }


}


module.exports = MachineGenerator;
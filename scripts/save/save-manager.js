/**
 * Pokémon Companion
 * Save Manager
 *
 * Handles save creation and loading.
 *
 * Responsibilities:
 * - Create save data.
 * - Store saves in memory.
 * - Restore session state.
 * - Reconstruct runtime Pokémon move slots.
 *
 * Does NOT:
 * - Handle filesystem.
 * - Handle cloud saves.
 * - Modify game rules.
 */

"use strict";


const SaveData =
    require("./save-data");


const PokemonMoveSlot =
    require("../domain/pokemon-move-slot");


class SaveManager
{


    constructor()
    {

        this.saves =
            [];


        this.nextId =
            1;

    }


    //--------------------------------
    // Create save
    //--------------------------------

    createSave(
        session
    )
    {

        const save =
            new SaveData(
                session
            );


        const record =
        {

            id:
                this.nextId++,

            data:
                save.toJSON()

        };


        this.saves.push(
            record
        );


        return {

            success:
                true,

            saveId:
                record.id,

            data:
                record.data

        };

    }


    //--------------------------------
    // Load save
    //--------------------------------

    loadSave(
        id,
        session
    )
    {

        const record =
            this.saves.find(

                save =>

                    save.id ===
                    id

            );


        if(
            !record
        )
        {

            return {

                success:
                    false,

                reason:
                    "Save not found"

            };

        }


        session.game =
            record.data.game;


        session.player =
            this.rehydrateState(
                record.data.player
            );


        session.state =
            this.rehydrateState(
                record.data.state
            );


        return {

            success:
                true,

            session

        };

    }


    //--------------------------------
    // Rehydrate saved state
    //--------------------------------

    rehydrateState(
        value
    )
    {

        //--------------------------------
        // Arrays
        //--------------------------------

        if(
            Array.isArray(
                value
            )
        )
        {

            return value.map(

                item =>

                    this.rehydrateState(
                        item
                    )

            );

        }


        //--------------------------------
        // Non-object values
        //--------------------------------

        if(
            !value
            ||
            typeof value !==
                "object"
        )
        {

            return value;

        }


        //--------------------------------
        // Saved move slot
        //
        // Identify by the PP-state fields
        // introduced for runtime move slots.
        //--------------------------------

        if(
            typeof value.constant ===
                "string"
            &&
            (
                Object.prototype.hasOwnProperty.call(
                    value,
                    "basePP"
                )
                ||
                Object.prototype.hasOwnProperty.call(
                    value,
                    "ppUps"
                )
                ||
                Object.prototype.hasOwnProperty.call(
                    value,
                    "currentPP"
                )
                ||
                Object.prototype.hasOwnProperty.call(
                    value,
                    "maxPP"
                )
            )
        )
        {

            return new PokemonMoveSlot({

                constant:
                    value.constant,

                basePP:
                    value.basePP,

                ppUps:
                    value.ppUps,

                currentPP:
                    value.currentPP,

                maxPP:
                    value.maxPP

            });

        }


        //--------------------------------
        // Generic object
        //--------------------------------

        const result =
            {};


        for(
            const key of
                Object.keys(value)
        )
        {

            result[key] =
                this.rehydrateState(
                    value[key]
                );

        }


        return result;

    }


    //--------------------------------
    // List saves
    //--------------------------------

    getSaves()
    {

        return this.saves;

    }


}


module.exports =
    SaveManager;
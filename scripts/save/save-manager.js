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


const TrainerState =
    require("../domain/trainer-state");


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


        //--------------------------------
        // Restore game and player
        //--------------------------------

        session.game =
            record.data.game;


        session.player =
            this.rehydrateState(
                record.data.player
            );


        //--------------------------------
        // Restore saved state
        //--------------------------------

        const savedState =
            this.rehydrateState(
                record.data.state
            );


        //--------------------------------
        // Reconstruct TrainerState
        //--------------------------------

        const trainerState =
            new TrainerState(
                savedState
            );


        //--------------------------------
        // Restore additional runtime state
        //--------------------------------

        Object.assign(

            trainerState,

            {

                started:
                    savedState.started
                    ?? false,

                nextPokemonId:
                    savedState.nextPokemonId
                    ?? 1,

                team:
                    savedState.team
                    ?? [],

                activePokemon:
                    savedState.activePokemon
                    ?? null,

                inventory:
                    trainerState.items,

                walkingSteps:
                    savedState.walkingSteps
                    ?? 0,

                totalSteps:
                    savedState.totalSteps
                    ?? 0,

                playTime:
                    savedState.playTime
                    ?? 0

            }

        );


        //--------------------------------
        // Restore shared session reference
        //--------------------------------

        session.trainerState =
            trainerState;


        session.state =
            trainerState;


        return {

            success:
                true,

            session

        };

    }


    //--------------------------------
    // Rehydrate saved state
    //
    // WeakMap preserves shared object
    // references across Pokémon, team,
    // and active Pokémon state.
    //--------------------------------

    rehydrateState(
        value,
        seen = new WeakMap()
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

            if(
                seen.has(
                    value
                )
            )
            {

                return seen.get(
                    value
                );

            }


            const result =
                [];


            seen.set(
                value,
                result
            );


            for(
                const item of
                    value
            )
            {

                result.push(

                    this.rehydrateState(

                        item,

                        seen

                    )

                );

            }


            return result;

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
        // Preserve previously restored
        // object references.
        //--------------------------------

        if(
            seen.has(
                value
            )
        )
        {

            return seen.get(
                value
            );

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

            const moveSlot =
                new PokemonMoveSlot({

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


            seen.set(
                value,
                moveSlot
            );


            return moveSlot;

        }


        //--------------------------------
        // Generic object
        //--------------------------------

        const result =
            {};


        seen.set(
            value,
            result
        );


        for(
            const key of
                Object.keys(value)
        )
        {

            result[key] =
                this.rehydrateState(

                    value[key],

                    seen

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
const fs = require("fs");
const path = require("path");

const {
    DATABASE_DIR,
    errors
} = require("./validation-context");

const {
    validateRange,
    validateNonNegativeNumber
} = require("./validation-utils");

function validateVersionGroupIntegrity(
    {
        verbose = true
    } = {}
) {

    const versionGroups = JSON.parse(

        fs.readFileSync(

            path.join(
                DATABASE_DIR,
                "version-groups.json"
            ),

            "utf8"

        )

    );

    const orders = new Set();

    let expectedOrder = 1;

    const sorted = [...versionGroups].sort(
        (a, b) => a.order - b.order
    );

    for (const group of sorted) {

        if (orders.has(group.order)) {

            errors.push(
                `version-groups.json contains duplicate order ${group.order}.`
            );

        }

        orders.add(
            group.order
        );

        if (group.order !== expectedOrder) {

            errors.push(
                `version-groups.json is missing order ${expectedOrder}.`
            );

            expectedOrder = group.order;

        }

        if (group.generationOrder < 1) {

            errors.push(
                `Version Group ${group.id} has invalid generationOrder ${group.generationOrder}.`
            );

        }

        if (
            group.generation.id !==
            group.generationOrder
        ) {

            errors.push(
                `Version Group ${group.id} has mismatched generation.id and generationOrder.`
            );

        }

        expectedOrder++;

    }

    if (verbose) {

        console.log(
            "✓ version-groups.json"
        );

    }

}

function validatePokemonIntegrity(
    {
        verbose = true
    } = {}
) {

    const pokemon = JSON.parse(

        fs.readFileSync(

            path.join(
                DATABASE_DIR,
                "pokemon.json"
            ),

            "utf8"

        )

    );

    for (const entry of pokemon) {

        const expectedNumber =
            `#${String(entry.id).padStart(4, "0")}`;

        if (entry.number !== expectedNumber) {

            errors.push(
                `Pokémon ${entry.id} has invalid number "${entry.number}".`
            );

        }

        validateNonNegativeNumber(
            "pokemon.json",
            `Pokémon ${entry.id}`,
            "height",
            entry.height
        );

        validateNonNegativeNumber(
            "pokemon.json",
            `Pokémon ${entry.id}`,
            "weight",
            entry.weight
        );

        const typeSlots = new Set();

        for (const type of entry.types) {

            if (

                type.slot < 1 ||

                type.slot > 2

            ) {

                errors.push(
                    `Pokémon ${entry.id} has invalid type slot ${type.slot}.`
                );

            }

            if (

                typeSlots.has(
                    type.slot
                )

            ) {

                errors.push(
                    `Pokémon ${entry.id} has duplicate type slot ${type.slot}.`
                );

            }

            typeSlots.add(
                type.slot
            );

        }

        const abilitySlots = new Set();

        for (const ability of entry.abilities) {

            if (

                ability.slot < 1

            ) {

                errors.push(
                    `Pokémon ${entry.id} has invalid ability slot ${ability.slot}.`
                );

            }

            if (

                abilitySlots.has(
                    ability.slot
                )

            ) {

                errors.push(
                    `Pokémon ${entry.id} has duplicate ability slot ${ability.slot}.`
                );

            }

            abilitySlots.add(
                ability.slot
            );

        }

    }

    if (verbose) {

        console.log(
            "✓ pokemon.json"
        );

    }

}

function validateMoveIntegrity(
    {
        verbose = true
    } = {}
) {

    const moves = JSON.parse(

        fs.readFileSync(

            path.join(
                DATABASE_DIR,
                "moves.json"
            ),

            "utf8"

        )

    );

    for (const move of moves) {

        validateRange(

            "moves.json",

            `Move ${move.id}`,

            "priority",

            move.priority,

            -7,

            7

        );

        for (const version of move.versions) {

            validateNonNegativeNumber(

                "moves.json",

                `Move ${move.id} (${version.versionGroup.name})`,

                "power",

                version.power,

                true

            );

            validateNonNegativeNumber(

                "moves.json",

                `Move ${move.id} (${version.versionGroup.name})`,

                "pp",

                version.pp,

                true

            );

            validateRange(

                "moves.json",

                `Move ${move.id} (${version.versionGroup.name})`,

                "accuracy",

                version.accuracy,

                0,

                100,

                true

            );

            validateRange(

                "moves.json",

                `Move ${move.id} (${version.versionGroup.name})`,

                "effectChance",

                version.effectChance,

                0,

                100,

                true

            );

        }

    }

    if (verbose) {

        console.log(
            "✓ moves.json"
        );

    }

}

function validateIntegrity(
    {
        verbose = true
    } = {}
) {

    if (verbose) {

        console.log(
            "Phase 6 - Data integrity validation..."
        );

    }

    validateVersionGroupIntegrity({
        verbose
    });

    validatePokemonIntegrity({
        verbose
    });

    validateMoveIntegrity({
        verbose
    });

    if (verbose) {

        console.log("");

    }

}

module.exports = {

    validateVersionGroupIntegrity,

    validatePokemonIntegrity,

    validateMoveIntegrity,

    validateIntegrity

};
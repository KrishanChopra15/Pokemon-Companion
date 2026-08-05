const fs = require("fs");
const path = require("path");

const {
    DATABASE_DIR
} = require("./validation-context");

const {
    createIdLookup,
    validateReference
} = require("./validation-utils");

function createLookups() {

    return {

        abilities:
            createIdLookup(
                "abilities.json"
            ),

        types:
            createIdLookup(
                "types.json",
                "legacy/types.json"
            ),

        species:
            createIdLookup(
                "species.json"
            ),

        moveTargets:
            createIdLookup(
                "move-targets.json"
            ),

        damageClasses:
            createIdLookup(
                "damage-classes.json"
            ),

        versionGroups:
            createIdLookup(
                "version-groups.json"
            )

    };

}

function validatePokemonReferences(
    lookups,
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

        validateReference(

            "pokemon.json",

            `Pokémon ${entry.id}`,

            "species",

            entry.speciesId,

            lookups.species

        );

        for (const type of entry.types) {

            validateReference(

                "pokemon.json",

                `Pokémon ${entry.id}`,

                "type",

                type.id,

                lookups.types

            );

        }

        for (const ability of entry.abilities) {

            validateReference(

                "pokemon.json",

                `Pokémon ${entry.id}`,

                "ability",

                ability.id,

                lookups.abilities

            );

        }

    }

    if (verbose) {

        console.log(
            "✓ pokemon.json"
        );

    }

}

function validateMoveReferences(
    lookups,
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

    for (const entry of moves) {

        validateReference(

            "moves.json",

            `Move ${entry.id}`,

            "generation",

            entry.generation?.id,

            lookups.versionGroups

        );

        validateReference(

            "moves.json",

            `Move ${entry.id}`,

            "type",

            entry.type?.id,

            lookups.types

        );

        validateReference(

            "moves.json",

            `Move ${entry.id}`,

            "damageClass",

            entry.damageClass?.id,

            lookups.damageClasses

        );

        validateReference(

            "moves.json",

            `Move ${entry.id}`,

            "target",

            entry.target?.id,

            lookups.moveTargets

        );

        for (const version of entry.versions) {

            validateReference(

                "moves.json",

                `Move ${entry.id}`,

                "versionGroup",

                version.versionGroup?.id,

                lookups.versionGroups

            );

            validateReference(

                "moves.json",

                `Move ${entry.id}`,

                "version type",

                version.type?.id,

                lookups.types

            );

        }

    }

    if (verbose) {

        console.log(
            "✓ moves.json"
        );

    }

}

function validateSpeciesReferences(
    lookups,
    {
        verbose = true
    } = {}
) {

    const species = JSON.parse(

        fs.readFileSync(

            path.join(
                DATABASE_DIR,
                "species.json"
            ),

            "utf8"

        )

    );

    for (const entry of species) {

        validateReference(

            "species.json",

            `Species ${entry.id}`,

            "generation",

            entry.generation?.id,

            lookups.versionGroups

        );

    }

    if (verbose) {

        console.log(
            "✓ species.json"
        );

    }

}

function validateAbilityReferences(
    lookups,
    {
        verbose = true
    } = {}
) {

    const abilities = JSON.parse(

        fs.readFileSync(

            path.join(
                DATABASE_DIR,
                "abilities.json"
            ),

            "utf8"

        )

    );

    for (const entry of abilities) {

        validateReference(

            "abilities.json",

            `Ability ${entry.id}`,

            "generation",

            entry.generation?.id,

            lookups.versionGroups

        );

    }

    if (verbose) {

        console.log(
            "✓ abilities.json"
        );

    }

}

function validateReferences(
    {
        verbose = true
    } = {}
) {

    if (verbose) {

        console.log(
            "Phase 5 - Checking references..."
        );

    }

    const lookups =
        createLookups();

    validatePokemonReferences(
        lookups,
        {
            verbose
        }
    );

    validateMoveReferences(
        lookups,
        {
            verbose
        }
    );

    validateSpeciesReferences(
        lookups,
        {
            verbose
        }
    );

    validateAbilityReferences(
        lookups,
        {
            verbose
        }
    );

    if (verbose) {

        console.log("");

    }

}

module.exports = {

    createLookups,

    validatePokemonReferences,

    validateMoveReferences,

    validateSpeciesReferences,

    validateAbilityReferences,

    validateReferences

};
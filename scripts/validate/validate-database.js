const fs = require("fs");
const path = require("path");

const DATABASE_DIR = path.join(
    __dirname,
    "../../database"
);

const DATABASE_FILES = [

    "abilities.json",
    "damage-classes.json",
    "move-targets.json",
    "moves.json",
    "pokemon.json",
    "species.json",
    "types.json",
    "version-groups.json",

    "history/ability-history.json",
    "history/move-effect-history.json",
    "history/move-history.json"

];

const ENTITY_FILES = [

    {
        file: "abilities.json",
        uniqueName: true
    },

    {
        file: "damage-classes.json",
        uniqueName: true
    },

    {
        file: "move-targets.json",
        uniqueName: true
    },

    {
        file: "moves.json",
        uniqueName: true
    },

    {
        file: "pokemon.json",
        uniqueName: true
    },

    {
        file: "species.json",
        uniqueName: true
    },

    {
        file: "types.json",
        uniqueName: true
    },

    {
        file: "version-groups.json",
        uniqueName: true
    }

];

const errors = [];

function validateFiles() {

    console.log(
        "Phase 1 - Checking file existence..."
    );

    for (const file of DATABASE_FILES) {

        const filePath = path.join(
            DATABASE_DIR,
            file
        );

        if (!fs.existsSync(filePath)) {

            errors.push(
                `Missing file: ${file}`
            );

            continue;

        }

        console.log(
            `✓ ${file}`
        );

    }

    console.log("");

}

function validateJson() {

    console.log(
        "Phase 2 - Validating JSON..."
    );

    for (const file of DATABASE_FILES) {

        const filePath = path.join(
            DATABASE_DIR,
            file
        );

        if (!fs.existsSync(filePath)) {

            continue;

        }

        try {

            const data = JSON.parse(
                fs.readFileSync(
                    filePath,
                    "utf8"
                )
            );

            const isHistory =
                file.startsWith(
                    "history/"
                );

            if (isHistory) {

                if (

                    Array.isArray(data) ||

                    data === null ||

                    typeof data !== "object"

                ) {

                    errors.push(
                        `${file} should contain an object.`
                    );

                    continue;

                }

            } else {

                if (!Array.isArray(data)) {

                    errors.push(
                        `${file} should contain an array.`
                    );

                    continue;

                }

            }

            if (

                (Array.isArray(data) &&
                    data.length === 0) ||

                (!Array.isArray(data) &&
                    Object.keys(data).length === 0)

            ) {

                errors.push(
                    `${file} is empty.`
                );

                continue;

            }

            console.log(
                `✓ ${file}`
            );

        } catch {

            errors.push(
                `${file} contains invalid JSON.`
            );

        }

    }

    console.log("");

}

function validateUniqueIds(
    file,
    data
) {

    const ids = new Set();

    for (const entry of data) {

        if (entry.id === undefined) {

            errors.push(
                `${file} contains an entry without an ID.`
            );

            continue;

        }

        if (ids.has(entry.id)) {

            errors.push(
                `${file} contains duplicate ID ${entry.id}.`
            );

            continue;

        }

        ids.add(
            entry.id
        );

    }

}

function validateUniqueNames(
    file,
    data
) {

    const names = new Set();

    for (const entry of data) {

        if (
            entry.name === undefined
        ) {

            continue;

        }

        if (
            names.has(entry.name)
        ) {

            errors.push(
                `${file} contains duplicate name "${entry.name}".`
            );

            continue;

        }

        names.add(
            entry.name
        );

    }

}

function createIdLookup(
    ...files
) {

    const ids = new Set();

    for (const file of files) {

        const filePath = path.join(
            DATABASE_DIR,
            file
        );

        const data = JSON.parse(
            fs.readFileSync(
                filePath,
                "utf8"
            )
        );

        for (const entry of data) {

            ids.add(
                entry.id
            );

        }

    }

    return ids;

}

function validateNonNegativeNumber(
    file,
    entity,
    field,
    value,
    allowNull = false
) {

    if (value === null) {

        if (allowNull) {
            return;
        }

        errors.push(
            `${file}: ${entity} has null ${field}.`
        );

        return;

    }

    if (

        typeof value !== "number" ||

        value < 0

    ) {

        errors.push(
            `${file}: ${entity} has invalid ${field} ${value}.`
        );

    }

}

function validateRange(
    file,
    entity,
    field,
    value,
    min,
    max,
    allowNull = false
) {

    if (value === null) {

        if (allowNull) {
            return;
        }

        errors.push(
            `${file}: ${entity} has null ${field}.`
        );

        return;

    }

    if (

        typeof value !== "number" ||

        value < min ||

        value > max

    ) {

        errors.push(
            `${file}: ${entity} has invalid ${field} ${value}.`
        );

    }

}

function validateNotEmptyString(
    file,
    entity,
    field,
    value
) {

    if (

        typeof value !== "string" ||

        value.trim() === ""

    ) {

        errors.push(
            `${file}: ${entity} has empty ${field}.`
        );

    }

}

function validateReference(
    file,
    source,
    field,
    value,
    lookup
) {

    if (
        value === null ||
        value === undefined
    ) {

        return;

    }

    if (
        !lookup.has(value)
    ) {

        errors.push(

            `${file}: ${source} has invalid ${field} ID ${value}.`

        );

    }

}

function validateDuplicateIds() {

    console.log(
        "Phase 3 - Checking duplicate IDs..."
    );

    for (const entity of ENTITY_FILES) {
    
        const file = entity.file;

        const filePath = path.join(
            DATABASE_DIR,
            file
        );

        const data = JSON.parse(
            fs.readFileSync(
                filePath,
                "utf8"
            )
        );

        validateUniqueIds(
            file,
            data
        );

        console.log(
            `✓ ${file}`
        );

    }

    console.log("");

}

function validateDuplicateNames() {

    console.log(
        "Phase 4 - Checking duplicate names..."
    );

    for (const entity of ENTITY_FILES) {

        if (!entity.uniqueName) {

            continue;

        }

        const filePath = path.join(
            DATABASE_DIR,
            entity.file
        );

        const data = JSON.parse(
            fs.readFileSync(
                filePath,
                "utf8"
            )
        );

        validateUniqueNames(
            entity.file,
            data
        );

        console.log(
            `✓ ${entity.file}`
        );

    }

    console.log("");

}

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
    lookups
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

    console.log(
        "✓ pokemon.json"
    );

}

function validateMoveReferences(
    lookups
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

    console.log(
        "✓ moves.json"
    );

}

function validateSpeciesReferences(
    lookups
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

    console.log(
        "✓ species.json"
    );

}

function validateAbilityReferences(
    lookups
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

    console.log(
        "✓ abilities.json"
    );

}

function validateReferences() {

    console.log(
        "Phase 5 - Checking references..."
    );

    const lookups =
        createLookups();

    const validators = [

        validatePokemonReferences,

        validateMoveReferences,

        validateSpeciesReferences,

        validateAbilityReferences

    ];

    for (const validator of validators) {

        validator(
            lookups
        );

    }

    console.log("");

}

function validateVersionGroupIntegrity() {

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

    console.log(
        "✓ version-groups.json"
    );

}

function validatePokemonIntegrity() {

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

        //
        // Pokédex number
        //

        const expectedNumber =
            `#${String(entry.id).padStart(4, "0")}`;

        if (entry.number !== expectedNumber) {

            errors.push(
                `Pokémon ${entry.id} has invalid number "${entry.number}".`
            );

        }

        //
        // Height
        //

        validateNonNegativeNumber(
            "pokemon.json",
            `Pokémon ${entry.id}`,
            "height",
            entry.height
        );

        //
        // Weight
        //

        validateNonNegativeNumber(
            "pokemon.json",
            `Pokémon ${entry.id}`,
            "weight",
            entry.weight
        );

        //
        // Type slots
        //

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

        //
        // Ability slots
        //

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

    console.log(
        "✓ pokemon.json"
    );

}

function validateMoveIntegrity() {

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
    console.log(
        "✓ moves.json"
    );

}

function validateIntegrity() {

    console.log(
        "Phase 6 - Data integrity validation..."
    );

    const validators = [

        validateVersionGroupIntegrity,

        validatePokemonIntegrity,

        validateMoveIntegrity

    ];

    for (const validator of validators) {

        validator();

    }

    console.log("");

}

function validateHistory() {

    console.log(
        "Phase 7 - History validation (Coming Soon)\n"
    );

}

function printSummary() {

    console.log(
        "========================================"
    );

    if (errors.length === 0) {

        console.log(
            "✅ Database validation passed."
        );

    } else {

        console.log(
            `❌ Database validation failed with ${errors.length} error(s).\n`
        );

        for (const error of errors) {

            console.log(
                `• ${error}`
            );

        }

        process.exitCode = 1;

    }

}

function main() {

    console.log(
        "\nStarting database validation...\n"
    );

    validateFiles();

    validateJson();

    validateDuplicateIds();

    validateDuplicateNames();

    validateReferences();

    validateIntegrity();

    validateHistory();

    printSummary();

}

main();
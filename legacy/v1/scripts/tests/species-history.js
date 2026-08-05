const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const species = JSON.parse(

    fs.readFileSync(

        path.join(

            __dirname,

            "../../database/generated/species.json"

        ),

        "utf8"

    )

);

function runTest(

    description,

    callback

) {

    try {

        callback();

        console.log(
            `✓ ${description}`
        );

    } catch (error) {

        console.error(
            `✗ ${description}`
        );

        throw error;

    }

}

/*
|--------------------------------------------------------------------------
| Bulbasaur
|--------------------------------------------------------------------------
*/

runTest(

    "Bulbasaur uses the Gen I Special stat",

    () => {

        const bulbasaur =
            species.bulbasaur[1];

        assert.strictEqual(

            bulbasaur.baseStats.special,

            65

        );

        assert.strictEqual(

            bulbasaur.baseStats.spa,

            null

        );

        assert.strictEqual(

            bulbasaur.baseStats.spd,

            null

        );

        assert.strictEqual(

            bulbasaur.baseStatTotal,

            253

        );

    }

);

runTest(

    "Bulbasaur abilities begin in Generation III",

    () => {

        assert.deepStrictEqual(

            species.bulbasaur[2]
                .abilities,

            {}

        );

        assert.strictEqual(

            species.bulbasaur[3]
                .abilities["0"],

            "Overgrow"

        );

    }

);

runTest(

    "Bulbasaur Hidden Ability begins in Generation V",

    () => {

        assert.strictEqual(

            species.bulbasaur[4]
                .abilities.H,

            undefined

        );

        assert.strictEqual(

            species.bulbasaur[5]
                .abilities.H,

            "Chlorophyll"

        );

    }

);

/*
|--------------------------------------------------------------------------
| Pichu
|--------------------------------------------------------------------------
*/

runTest(

    "Pichu is introduced in Generation II",

    () => {

        assert.strictEqual(

            species.pichu[1],

            undefined

        );

        assert.ok(
            species.pichu[2]
        );

        assert.strictEqual(

            species.pichu[2]
                .introducedGeneration,

            2

        );

    }

);

/*
|--------------------------------------------------------------------------
| Clefairy
|--------------------------------------------------------------------------
*/

runTest(

    "Clefairy changes from Normal to Fairy in Generation VI",

    () => {

        assert.deepStrictEqual(

            species.clefairy[5]
                .types,

            [

                "Normal"

            ]

        );

        assert.deepStrictEqual(

            species.clefairy[6]
                .types,

            [

                "Fairy"

            ]

        );

    }

);

/*
|--------------------------------------------------------------------------
| Charizard
|--------------------------------------------------------------------------
*/

runTest(

    "Charizard Gigantamax exists only in Generation VIII",

    () => {

        assert.strictEqual(

            species.charizard[7]
                .canGigantamax,

            false

        );

        assert.ok(

            species.charizard[8]
                .canGigantamax

        );

        assert.strictEqual(

            species.charizard[9]
                .canGigantamax,

            false

        );

    }

);

/*
|--------------------------------------------------------------------------
| Tinkaton
|--------------------------------------------------------------------------
*/

runTest(

    "Tinkaton is introduced in Generation IX",

    () => {

        assert.strictEqual(

            species.tinkaton[8],

            undefined

        );

        assert.ok(
            species.tinkaton[9]
        );

        assert.strictEqual(

            species.tinkaton[9]
                .introducedGeneration,

            9

        );

    }

);

console.log();
console.log(
    "All tests passed."
);
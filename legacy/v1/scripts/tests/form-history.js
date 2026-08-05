const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const forms = JSON.parse(

    fs.readFileSync(

        path.join(

            __dirname,

            "../../database/generated/forms.json"

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
| Mega Charizard X
|--------------------------------------------------------------------------
*/

runTest(

    "Mega Charizard X is introduced in Generation VI",

    () => {

        assert.strictEqual(

            forms.charizardmegax[5],

            undefined

        );

        assert.ok(
            forms.charizardmegax[6]
        );

        assert.strictEqual(

            forms.charizardmegax[6]
                .formType,

            "Mega"

        );

    }

);

runTest(

    "Mega Charizard X is unavailable in Generation VIII",

    () => {

        assert.strictEqual(

            forms.charizardmegax[8],

            undefined

        );

    }

);

runTest(

    "Mega Charizard X returns in Generation IX",

    () => {

        assert.ok(
            forms.charizardmegax[9]
        );

    }

);

/*
|--------------------------------------------------------------------------
| Alolan Rattata
|--------------------------------------------------------------------------
*/

runTest(

    "Alolan Rattata is introduced in Generation VII",

    () => {

        assert.strictEqual(

            forms.rattataalola[6],

            undefined

        );

        assert.ok(
            forms.rattataalola[7]
        );

        assert.strictEqual(

            forms.rattataalola[7]
                .baseSpecies,

            "Rattata"

        );

    }

);

runTest(

    "Alolan Rattata has Dark and Normal types",

    () => {

        assert.deepStrictEqual(

            forms.rattataalola[7]
                .types,

            [

                "Dark",

                "Normal"

            ]

        );

    }

);

/*
|--------------------------------------------------------------------------
| Gigantamax Charizard
|--------------------------------------------------------------------------
*/

runTest(

    "Gigantamax Charizard exists only in Generation VIII",

    () => {

        assert.strictEqual(

            forms.charizardgmax[7],

            undefined

        );

        assert.ok(
            forms.charizardgmax[8]
        );

        assert.strictEqual(

            forms.charizardgmax[8]
                .formType,

            "Gigantamax"

        );

        assert.strictEqual(

            forms.charizardgmax[9],

            undefined

        );

    }

);

/*
|--------------------------------------------------------------------------
| Primal Groudon
|--------------------------------------------------------------------------
*/

runTest(

    "Primal Groudon exists only in Generation VI",

    () => {

        assert.strictEqual(

            forms.groudonprimal[5],

            undefined

        );

        assert.ok(
            forms.groudonprimal[6]
        );

        assert.strictEqual(

            forms.groudonprimal[6]
                .formType,

            "Primal"

        );

        assert.strictEqual(

            forms.groudonprimal[7],

            undefined

        );

    }

);

console.log();
console.log(
    "All tests passed."
);
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const items = JSON.parse(

    fs.readFileSync(

        path.join(

            __dirname,

            "../../database/generated/items.json"

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
| Poké Ball
|--------------------------------------------------------------------------
*/

runTest(

    "Poké Ball exists from Generation I",

    () => {

        assert.ok(
            items.pokeball[1]
        );

        assert.strictEqual(

            items.pokeball[1]
                .introducedGeneration,

            1

        );

    }

);

/*
|--------------------------------------------------------------------------
| Leftovers
|--------------------------------------------------------------------------
*/

runTest(

    "Leftovers does not exist before Generation II",

    () => {

        assert.strictEqual(

            items.leftovers[1],

            undefined

        );

    }

);

runTest(

    "Leftovers exists from Generation II onward",

    () => {

        assert.ok(
            items.leftovers[2]
        );

        assert.strictEqual(

            items.leftovers[2]
                .introducedGeneration,

            2

        );

        assert.ok(
            items.leftovers[9]
        );

    }

);

/*
|--------------------------------------------------------------------------
| Choice Band
|--------------------------------------------------------------------------
*/

runTest(

    "Choice Band is introduced in Generation III",

    () => {

        assert.strictEqual(

            items.choiceband[2],

            undefined

        );

        assert.ok(
            items.choiceband[3]
        );

        assert.strictEqual(

            items.choiceband[3]
                .introducedGeneration,

            3

        );

    }

);

/*
|--------------------------------------------------------------------------
| Choice Scarf
|--------------------------------------------------------------------------
*/

runTest(

    "Choice Scarf is introduced in Generation IV",

    () => {

        assert.strictEqual(

            items.choicescarf[3],

            undefined

        );

        assert.ok(
            items.choicescarf[4]
        );

        assert.strictEqual(

            items.choicescarf[4]
                .introducedGeneration,

            4

        );

    }

);

/*
|--------------------------------------------------------------------------
| Assault Vest
|--------------------------------------------------------------------------
*/

runTest(

    "Assault Vest is introduced in Generation VI",

    () => {

        assert.strictEqual(

            items.assaultvest[5],

            undefined

        );

        assert.ok(
            items.assaultvest[6]
        );

        assert.strictEqual(

            items.assaultvest[6]
                .introducedGeneration,

            6

        );

    }

);

/*
|--------------------------------------------------------------------------
| Normalium Z
|--------------------------------------------------------------------------
*/

runTest(

    "Normalium Z is introduced in Generation VII",

    () => {

        assert.strictEqual(

            items.normaliumz[6],

            undefined

        );

        assert.ok(
            items.normaliumz[7]
        );

        assert.strictEqual(

            items.normaliumz[7]
                .introducedGeneration,

            7

        );

        assert.strictEqual(

            items.normaliumz[7]
                .zMoveType,

            "Normal"

        );

    }

);

console.log();
console.log(
    "All tests passed."
);
const assert = require("node:assert");

const evolutions = require(
    "../../database/generated/evolutions.json"
);

function test(
    name,
    callback
) {

    try {

        callback();

        console.log(
            `✓ ${name}`
        );

    } catch (error) {

        console.error(
            `✗ ${name}`
        );

        throw error;

    }

}

/* -------------------------------------------------- */
/* Bulbasaur                                           */
/* -------------------------------------------------- */

test(

    "Bulbasaur evolves into Ivysaur at level 16",

    () => {

        const evolution =
            evolutions.bulbasaur
                .evolutions[0];

        assert.strictEqual(
            evolution.species,
            "ivysaur"
        );

        assert.strictEqual(
            evolution.details.trigger,
            "level-up"
        );

        assert.strictEqual(
            evolution.details.minimumLevel,
            16
        );

    }

);

/* -------------------------------------------------- */
/* Eevee                                               */
/* -------------------------------------------------- */

test(

    "Eevee has eight evolutions",

    () => {

        assert.strictEqual(

            evolutions.eevee
                .evolutions.length,

            8

        );

    }

);

test(

    "Sylveon requires a Fairy-type move",

    () => {

        const sylveon =

            evolutions.eevee
                .evolutions.find(

                    evolution =>

                        evolution.species ===
                        "sylveon"

                );

        assert.ok(
            sylveon
        );

        assert.strictEqual(

            sylveon.details
                .knownMoveType,

            "fairy"

        );

    }

);

/* -------------------------------------------------- */
/* Onix                                                */
/* -------------------------------------------------- */

test(

    "Onix evolves using Metal Coat",

    () => {

        const steelix =

            evolutions.onix
                .evolutions[0];

        assert.strictEqual(

            steelix.details
                .trigger,

            "trade"

        );

        assert.strictEqual(

            steelix.details
                .heldItem,

            "Metal Coat"

        );

    }

);

/* -------------------------------------------------- */
/* Gloom                                               */
/* -------------------------------------------------- */

test(

    "Gloom has two branching evolutions",

    () => {

        const species =

            evolutions.gloom
                .evolutions
                .map(

                    evolution =>

                        evolution.species

                );

        assert.deepStrictEqual(

            species.sort(),

            [

                "bellossom",

                "vileplume"

            ]

        );

    }

);

/* -------------------------------------------------- */
/* Inkay                                               */
/* -------------------------------------------------- */

test(

    "Inkay requires turning the console upside down",

    () => {

        const evolution =

            evolutions.inkay
                .evolutions[0];

        assert.strictEqual(

            evolution.details
                .turnUpsideDown,

            true

        );

    }

);

/* -------------------------------------------------- */
/* Charcadet                                           */
/* -------------------------------------------------- */

test(

    "Charcadet evolves using special armor",

    () => {

        const items =

            evolutions.charcadet
                .evolutions
                .map(

                    evolution =>

                        evolution.details
                            .item

                );

        assert.deepStrictEqual(

            items.sort(),

            [

                "Auspicious Armor",

                "Malicious Armor"

            ]

        );

    }

);

/* -------------------------------------------------- */
/* Primeape                                            */
/* -------------------------------------------------- */

test(

    "Primeape evolves after using Rage Fist",

    () => {

        const evolution =

            evolutions.primeape
                .evolutions[0];

        assert.strictEqual(

            evolution.details
                .trigger,

            "use-move"

        );

        assert.strictEqual(

            evolution.details
                .usedMove,

            "rage-fist"

        );

        assert.strictEqual(

            evolution.details
                .minimumMoveCount,

            20

        );

    }

);

/* -------------------------------------------------- */
/* Bisharp                                             */
/* -------------------------------------------------- */

test(

    "Bisharp has the Generation IX evolution trigger",

    () => {

        const evolution =

            evolutions.bisharp
                .evolutions[0];

        assert.strictEqual(

            evolution.details
                .trigger,

            "three-defeated-bisharp"

        );

    }

);

/* -------------------------------------------------- */
/* Finizen                                             */
/* -------------------------------------------------- */

test(

    "Finizen requires multiplayer",

    () => {

        const evolution =

            evolutions.finizen
                .evolutions[0];

        assert.strictEqual(

            evolution.details
                .needsMultiplayer,

            true

        );

    }

);

/* -------------------------------------------------- */
/* Gimmighoul                                          */
/* -------------------------------------------------- */

test(

    "Gimmighoul uses the coin evolution trigger",

    () => {

        const evolution =

            evolutions.gimmighoul
                .evolutions[0];

        assert.strictEqual(

            evolution.details
                .trigger,

            "gimmighoul-coins"

        );

    }

);

console.log();

console.log(
    "All tests passed."
);
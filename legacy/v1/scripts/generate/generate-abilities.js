const fs = require('node:fs');
const path = require('node:path');

const {
    getGenerationDex
} = require(
    '../utils/loaders/showdown'
);

const {
    getAbilityHistory
} = require(
    './generate-ability-history'
);

const OUTPUT_PATH = path.join(
    __dirname,
    '../../database/generated/abilities.json'
);

function generateAbilities() {
    const dex = getGenerationDex(9);

    const abilities = {};

    for (const ability of dex.abilities.all()) {
        if (!ability.exists) {
            continue;
        }

        abilities[ability.id] = getAbilityHistory(
            ability.id
        );
    }

    fs.mkdirSync(
        path.dirname(OUTPUT_PATH),
        {
            recursive: true
        }
    );

    fs.writeFileSync(
        OUTPUT_PATH,
        JSON.stringify(
            abilities,
            null,
            2
        )
    );

    console.log(
        `Generated ${Object.keys(abilities).length} abilities`
    );

    console.log(
        `Saved to ${OUTPUT_PATH}`
    );
}

generateAbilities();
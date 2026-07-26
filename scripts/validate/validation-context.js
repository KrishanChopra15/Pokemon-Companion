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

const MOVE_HISTORY_FIELDS = [

    "power",

    "accuracy",

    "pp",

    "priority",

    "effectChance",

    "type",

    "target",

    "description"

];

const MOVE_EFFECT_HISTORY_FIELDS = [

    "effect",

    "shortEffect"

];

const ENTITY_FILES = [

    {

        file:
            "abilities.json",

        uniqueName:
            true

    },

    {

        file:
            "damage-classes.json",

        uniqueName:
            true

    },

    {

        file:
            "move-targets.json",

        uniqueName:
            true

    },

    {

        file:
            "moves.json",

        uniqueName:
            true

    },

    {

        file:
            "pokemon.json",

        uniqueName:
            true

    },

    {

        file:
            "species.json",

        uniqueName:
            true

    },

    {

        file:
            "types.json",

        uniqueName:
            true

    },

    {

        file:
            "version-groups.json",

        uniqueName:
            true

    }

];

const errors = [];

module.exports = {

    DATABASE_DIR,

    DATABASE_FILES,

    ENTITY_FILES,

    MOVE_HISTORY_FIELDS,

    MOVE_EFFECT_HISTORY_FIELDS,

    errors

};
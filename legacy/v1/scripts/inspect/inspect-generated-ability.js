const abilities = require(
    '../../database/generated/abilities.json'
);

const id = (
    process.argv[2] || ''
).toLowerCase();

console.dir(
    abilities[id],
    {
        depth: null
    }
);
const ReferenceRegistry = require("../scripts/builders/reference-registry");

const references = new ReferenceRegistry();

console.log(
    references.evolutionMethods.get(4)
);
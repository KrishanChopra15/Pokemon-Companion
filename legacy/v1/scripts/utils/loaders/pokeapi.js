const fs = require("node:fs");
const path = require("node:path");

const POKEAPI_ROOT = path.join(
    __dirname,
    "../../../database/external/pokeapi"
);

const BASE_URL =
    "https://pokeapi.co/api/v2";

function ensureDirectory(directory) {

    fs.mkdirSync(
        directory,
        {
            recursive: true
        }
    );

}

function getResourceDirectory(resource) {

    return path.join(
        POKEAPI_ROOT,
        resource
    );

}

function getCachePath(resource, id) {

    return path.join(
        getResourceDirectory(resource),
        `${id}.json`
    );

}

function hasCachedResource(resource, id) {

    return fs.existsSync(
        getCachePath(resource, id)
    );

}

function readCachedResource(resource, id) {

    return JSON.parse(

        fs.readFileSync(

            getCachePath(
                resource,
                id
            ),

            "utf8"

        )

    );

}

function writeCachedResource(
    resource,
    id,
    data
) {

    const directory =
        getResourceDirectory(
            resource
        );

    ensureDirectory(
        directory
    );

    fs.writeFileSync(

        getCachePath(
            resource,
            id
        ),

        JSON.stringify(
            data,
            null,
            2
        )

    );

}

async function downloadResource(
    resource,
    id
) {

    const url =
        `${BASE_URL}/${resource}/${id}`;

    console.log(
        `Downloading ${url}`
    );

    const response =
        await fetch(
            url
        );

    if (

        !response.ok

    ) {

        throw new Error(

            `Failed to download ${url} (${response.status})`

        );

    }

    const data =
        await response.json();

    writeCachedResource(

        resource,

        id,

        data

    );

    return data;

}

async function fetchResource(
    resource,
    id
) {

    if (

        hasCachedResource(
            resource,
            id
        )

    ) {

        return readCachedResource(
            resource,
            id
        );

    }

    return downloadResource(
        resource,
        id
    );

}

async function fetchEvolutionChain(id) {

    return fetchResource(
        "evolution-chain",
        id
    );

}

async function fetchPokemonSpecies(id) {

    return fetchResource(
        "pokemon-species",
        id
    );

}

async function loadEvolutionChainForSpecies(
    speciesId
) {

    const species =
        await fetchPokemonSpecies(
            speciesId
        );

    const url =
        species.evolution_chain.url;

    const chainId =
        url
            .split("/")
            .filter(Boolean)
            .at(-1);

    return fetchEvolutionChain(
        chainId
    );

}

async function fetchPokemon(id) {

    return fetchResource(
        "pokemon",
        id
    );

}

async function fetchMove(id) {

    return fetchResource(
        "move",
        id
    );

}

async function fetchItem(id) {

    return fetchResource(
        "item",
        id
    );

}

async function fetchAbility(id) {

    return fetchResource(
        "ability",
        id
    );

}

module.exports = {

    POKEAPI_ROOT,

    fetchResource,

    fetchEvolutionChain,

    fetchPokemonSpecies,

    loadEvolutionChainForSpecies,

    fetchPokemon,

    fetchMove,

    fetchItem,

    fetchAbility,

    hasCachedResource,

    readCachedResource,

    writeCachedResource

};
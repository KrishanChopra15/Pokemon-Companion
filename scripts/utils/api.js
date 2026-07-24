const axios = require("axios");

const versionGroups = require(
    "../../database/version-groups.json"
);

const {
    getIdFromUrl
} = require("./helpers");

const {
    createVersionGroupReference
} = require("./references");

/* ---------------------------------- */
/* API Client                         */
/* ---------------------------------- */

const api = axios.create({

    baseURL:
        "https://pokeapi.co/api/v2",

    timeout:
        30000

});

/* ---------------------------------- */
/* Resources                          */
/* ---------------------------------- */

/**
 * Returns every resource
 * from a PokéAPI endpoint.
 *
 * Example:
 * getResourceList("pokemon")
 */
async function getResourceList(
    endpoint
) {

    const {

        data

    } = await api.get(

        `/${endpoint}?limit=100000`

    );

    return data.results;

}

/**
 * Downloads a single
 * PokéAPI resource.
 *
 * Examples:
 * getResource("move", 15)
 * getResource("version-group", "red-blue")
 */
async function getResource(

    endpoint,

    resource

) {

    const {

        data

    } = await api.get(

        `/${endpoint}/${resource}`

    );

    return data;

}

/* ---------------------------------- */
/* Version Groups                     */
/* ---------------------------------- */

const versionGroupApiMap =
    new Map(

        versionGroups.map(

            group => [

                group.apiName,

                group

            ]

        )

    );

/**
 * Creates a lookup that maps
 * every version to its
 * version group.
 */
async function getVersionGroupLookup() {

    const versions =
        await getResourceList(
            "version"
        );

    const lookup =
        new Map();

    for (const version of versions) {

        const id =
            getIdFromUrl(
                version.url
            );

        const data =
            await getResource(
                "version",
                id
            );

        const versionGroup =
            versionGroupApiMap.get(
                data.version_group.name
            );

        lookup.set(

            data.name,

            createVersionGroupReference(

                versionGroup,

                true

            )

        );

    }

    return lookup;

}

module.exports = {

    api,

    getResource,

    getResourceList,

    getVersionGroupLookup

};
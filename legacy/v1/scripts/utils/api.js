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

const MAX_RETRIES = 5;

const RETRY_DELAY = 1000;

/* ---------------------------------- */
/* Retry Helper                       */
/* ---------------------------------- */

function sleep(milliseconds) {

    return new Promise(

        resolve =>

            setTimeout(
                resolve,
                milliseconds
            )

    );

}

async function requestWithRetry(

    url,

    options = {}

) {

    let lastError;

    for (

        let attempt = 1;

        attempt <= MAX_RETRIES;

        attempt++

    ) {

        try {

            const {

                data

            } = await api.get(

                url,

                options

            );

            return data;

        } catch (error) {

            lastError = error;

            const status =
                error.response?.status;

            const code =
                error.code;

            const retryable =

                status === 429 ||

                status === 502 ||

                status === 503 ||

                status === 504 ||

                code === "ECONNRESET" ||

                code === "ETIMEDOUT" ||

                code === "ECONNABORTED" ||

                code === "ERR_STREAM_PREMATURE_CLOSE" ||

                code === "ERR_BAD_RESPONSE" ||

                error.message?.includes(
                    "stream has been aborted"
                ) ||
            
                error.message?.includes(
                    "socket hang up"
                );

            if (

                !retryable ||

                attempt === MAX_RETRIES

            ) {

                throw error;

            }

            console.log(

                `Retry ${attempt}/${MAX_RETRIES}: ${url}`

            );

            await sleep(
                RETRY_DELAY * attempt
            );

        }

    }

    throw lastError;

}

/* ---------------------------------- */
/* Resources                          */
/* ---------------------------------- */

async function getResourceList(
    endpoint
) {

    const data =
        await requestWithRetry(

            `/${endpoint}?limit=100000`

        );

    return data.results;

}

async function getResource(

    endpoint,

    resource

) {

    return requestWithRetry(

        `/${endpoint}/${resource}`

    );

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

async function downloadFile(
    url
) {

    const data =
        await requestWithRetry(

            url,

            {

                responseType:
                    "arraybuffer"

            }

        );

    return Buffer.from(
        data
    );

}

module.exports = {

    api,

    getResource,

    getResourceList,

    getVersionGroupLookup,

    downloadFile

};
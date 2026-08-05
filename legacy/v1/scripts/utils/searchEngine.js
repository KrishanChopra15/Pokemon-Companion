const {
    loadJSON
} = require("./json");

/**
 * Loads the search index.
 */

function loadSearchIndex() {

    return loadJSON(
        "generated/search-index.json"
    );

}

/**
 * Normalizes a search query.
 */

function normalizeQuery(
    query
) {

    return String(query)
        .trim()
        .toLowerCase();

}

/**
 * Searches every entry.
 */

function searchEntries(
    entries,
    query
) {

    const search =
        normalizeQuery(query);

    return entries.filter(

        entry =>

            entry.name
                .toLowerCase()
                .includes(search)

            ||

            entry.identifier
                .toLowerCase()
                .includes(search)

            ||

            entry.keywords.some(

                keyword =>

                    keyword.includes(
                        search
                    )

            )

    );

}

/**
 * Searches a specific type.
 */

function searchByType(
    entries,
    type,
    query
) {

    return searchEntries(
        entries,
        query
    ).filter(

        entry =>

            entry.type === type

    );

}

/**
 * Returns the first result.
 */

function searchOne(
    entries,
    query
) {

    return searchEntries(
        entries,
        query
    )[0] ?? null;

}

module.exports = {

    loadSearchIndex,

    normalizeQuery,

    searchEntries,

    searchByType,

    searchOne

};
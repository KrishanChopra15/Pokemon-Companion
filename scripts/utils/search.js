/**
 * Creates a search entry.
 */

function createSearchEntry({

    type,

    id,

    identifier,

    name,

    keywords = []

}) {

    return {

        type,

        id,

        identifier,

        name,

        keywords:

            Array.from(

                new Set(

                    keywords

                        .filter(Boolean)

                        .map(

                            keyword =>

                                String(keyword)

                                    .trim()

                                    .toLowerCase()

                        )

                )

            )

    };

}

/**
 * Sorts search entries alphabetically.
 */

function sortSearchEntries(
    entries
) {

    entries.sort(

        (a, b) =>

            a.name.localeCompare(
                b.name
            ) ||

            a.type.localeCompare(
                b.type
            ) ||

            a.id - b.id

    );

}

module.exports = {

    createSearchEntry,

    sortSearchEntries

};
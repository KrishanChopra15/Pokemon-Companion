const fs = require("node:fs");
const path = require("node:path");

const {
    loadFormIds
} = require(
    "../utils/loaders/form-loader"
);

const {
    getFormHistory
} = require(
    "./generate-form-history"
);

const OUTPUT_PATH = path.join(
    __dirname,
    "../../database/generated/forms.json"
);

function generateForms() {

    const formIds =
        loadFormIds();

    const forms = {};

    console.log(
        `Found ${formIds.length} forms.`
    );

    for (const formId of formIds) {

        const history =
            getFormHistory(
                formId
            );

        if (

            Object.keys(
                history
            ).length === 0

        ) {

            continue;

        }

        forms[formId] =
            history;

    }

    fs.mkdirSync(

        path.dirname(
            OUTPUT_PATH
        ),

        {

            recursive: true

        }

    );

    fs.writeFileSync(

        OUTPUT_PATH,

        JSON.stringify(
            forms,
            null,
            2
        )

    );

    console.log(

        `Successfully generated ${
            Object.keys(
                forms
            ).length
        } form histories.`

    );

    console.log(
        `Output written to:\n${OUTPUT_PATH}`
    );

}

generateForms();
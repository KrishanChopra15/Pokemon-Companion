const {
    loadForm
} = require(
    "../utils/loaders/form-loader"
);

const {
    normaliseForm
} = require(
    "../utils/normalisers/form"
);

function isFormAvailable(

    form,

    generation

) {

    if (

        form.forme === "Gmax" &&

        generation !== 8

    ) {

        return false;

    }

    if (

        form.isPrimal &&

        generation !== 6

    ) {

        return false;

    }

    if (

        form.isMega &&

        ![

            6,
            7,
            9

        ].includes(
            generation
        )

    ) {

        return false;

    }

    return true;

}

function getFormHistory(
    formId
) {

    const history = {};

    for (

        let generation = 1;

        generation <= 9;

        generation++

    ) {

        const form =
            loadForm(
                formId,
                generation
            );

        if (

            !form.exists ||

            form.gen > generation ||

            !form.forme ||

            !isFormAvailable(
                form,
                generation
            )

        ) {

            continue;

        }

        history[generation] =
            normaliseForm(
                form,
                generation
            );

    }

    return history;

}

module.exports = {

    getFormHistory,
    isFormAvailable

};
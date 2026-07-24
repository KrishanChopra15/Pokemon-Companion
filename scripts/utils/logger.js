function printPhase(title) {

    console.log("");

    console.log(
        "========================================"
    );

    console.log(title);

    console.log(
        "========================================"
    );

}

function printError(
    error,
    title = "Error"
) {

    console.error("");

    console.error(
        `${title}:`
    );

    console.error(
        error.message
    );

}

function printSuccess(
    message
) {

    console.log("");

    console.log(
        `✅ ${message}`
    );

    console.log("");

}

function printSection(
    title
) {

    console.log("");

    console.log(
        "----------------------------------------"
    );

    console.log(
        title
    );

    console.log(
        "----------------------------------------"
    );

}

function printOutputFile(
    filePath
) {

    console.log(
        `Saved to ${filePath}`
    );

}

module.exports = {

    printPhase,
    printError,
    printSuccess,
    printSection,
    printOutputFile

};
const RESET = "\x1b[0m";

const BOLD = "\x1b[1m";

const DIM = "\x1b[2m";

const RED = "\x1b[31m";

const GREEN = "\x1b[32m";

const YELLOW = "\x1b[33m";

const BLUE = "\x1b[34m";

const MAGENTA = "\x1b[35m";

const CYAN = "\x1b[36m";

const WHITE = "\x1b[37m";

const COLOURS = {

    RESET,

    BOLD,

    DIM,

    RED,

    GREEN,

    YELLOW,

    BLUE,

    MAGENTA,

    CYAN,

    WHITE

};

function colour(
    colour,
    text
) {

    return `${colour}${text}${RESET}`;

}

function printPhase(
    title
) {

    console.log("");

    console.log(
        colour(
            CYAN,
            "══════════════════════════════════════════════════════"
        )
    );

    console.log(
        colour(
            BOLD + CYAN,
            `🚀 ${title}`
        )
    );

    console.log(
        colour(
            CYAN,
            "══════════════════════════════════════════════════════"
        )
    );
    console.log();
}



function printSection(
    title
) {

    console.log("");

    console.log(
        colour(
            BLUE,
            "──────────────────────────────────────────────────────"
        )
    );

    console.log(
        colour(
            BOLD + BLUE,
            title
        )
    );

    console.log(
        colour(
            BLUE,
            "──────────────────────────────────────────────────────"
        )
    );

}

function printDivider(
    dividerColour = COLOURS.BLUE
) {

    console.log(

        colour(

            dividerColour,

            "──────────────────────────────────────────────────────"

        )

    );

}

function printSuccess(
    message
) {

    console.log(
        colour(
            GREEN,
            `✅ ${message}`
        )
    );

    console.log("");

}

function printWarning(
    message
) {

    console.log(
        colour(
            YELLOW,
            `⚠ ${message}`
        )
    );

}

function printError(
    error,
    title = "Error"
) {

    console.error("");

    console.error(
        colour(
            RED,
            `❌ ${title}`
        )
    );

    console.error(
        colour(
            RED,
            error.message
        )
    );

    console.error("");

}

function printOutputFile(
    filePath
) {

    console.log(

        colour(
            DIM,
            `    ↳ ${filePath}`
        )

    );

}

const VERBOSE = true;

function printVerbose(
    message
) {

    if (!VERBOSE) {

        return;

    }

    console.log(

        colour(
            DIM,
            message
        )

    );

}

const STEP_ICONS = {

    Download: "📥",

    Generate: "⚙️",

    Validate: "✔️",

    Clean: "🧹",

    Build: "🚀",

    Pokémon: "⚪",

    Species: "📖",

    Moves: "💥",

    Abilities: "✨",

    Types: "🎨",

    "Legacy Types": "🕰️",

    "Damage Classes": "⚔️",

    "Move Targets": "🎯",

    "Version Groups": "📦",

    "Evolution Chains": "🧬",

    "Learnsets": "📚",

    Machines: "💿",

    Forms: "📝",

    "Ability History": "📜",

    "Move History": "📜",

    "Move Effect History": "📜"

};

function printPipelineStep(
    step,
    total,
    name
) {

    const icon =

        STEP_ICONS[name] ??

        "•";

    console.log("");

    console.log(

        colour(

            MAGENTA,

            `${icon} [${step}/${total}] ${name}`

        )

    );

}

function printPipelineSuccess(
    message
) {

    console.log(

        colour(

            GREEN,

            `    ✓ ${message}`

        )

    );

}

function formatElapsedTime(
    milliseconds
) {

    const seconds =
        milliseconds / 1000;

    if (

        seconds < 60

    ) {

        return `${seconds.toFixed(2)}s`;

    }

    const minutes =
        Math.floor(
            seconds / 60
        );

    const remainingSeconds =
        (
            seconds % 60
        ).toFixed(2);

    return `${minutes}m ${remainingSeconds}s`;

}

function printPipelineFooter(
    elapsed,
    completedSteps = null,
    totalSteps = null
) {

    console.log("");

    console.log(

        colour(

            CYAN,

            "══════════════════════════════════════════════════════"

        )

    );

    console.log(

        colour(

            BOLD,

            `Completed in ${elapsed}`

        )

    );

    if (

        completedSteps !== null &&

        totalSteps !== null

    ) {

        console.log(

            colour(

                GREEN,

                `${completedSteps}/${totalSteps} steps completed successfully`

            )

        );

    }

    console.log(

        colour(

            CYAN,

            "══════════════════════════════════════════════════════"

        )

    );

}

function printSummary(
    title,
    rows
) {

    console.log("");

    console.log(

        colour(

            BOLD + CYAN,

            `📊 ${title}`

        )

    );

    console.log("");

    for (const row of rows) {

        printLabelValue(

            row.label,

            colour(
                COLOURS.GREEN,
                row.value
            )

        );

    }

    console.log("");

}

function printSubSection(
    title
) {

    console.log(

        colour(

            BOLD + YELLOW,

            title

        )

    );

    console.log(

        colour(

            DIM,

            "─".repeat(
                title.length
            )

        )

    );

}

function printLabelValue(
    label,
    value,
    valueColour = COLOURS.WHITE
) {

    console.log(

        `  ${colour(

            COLOURS.CYAN,

            label.padEnd(18)

        )}${colour(

            valueColour,
            String(value)

        )}`

    );

}

function printBullet(
    text
) {

    console.log(

        `  ${colour(

            COLOURS.GREEN,

            "•"

        )} ${colour(

            COLOURS.WHITE,

            text

        )}`

    );

}

function printTree(
    prefix,
    text
) {

    console.log(

        `${colour(

            COLOURS.DIM,

            prefix

        )}${colour(

            COLOURS.WHITE,

            text

        )}`

    );

}


module.exports = {

    COLOURS,

    colour,

    printPhase,

    printSection,

    printDivider,

    printSubSection,

    printLabelValue,

    printBullet,

    printTree,

    printSuccess,

    printWarning,

    printError,

    printOutputFile,

    printVerbose,

    printPipelineStep,

    printPipelineSuccess,

    formatElapsedTime,

    printPipelineFooter,

    printSummary

};
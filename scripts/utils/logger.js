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

        const label =
            row.label.padEnd(
                24,
                "."
            );

        console.log(

            `  ${label} ${colour(GREEN, row.value)}`

        );

    }

    console.log("");

}

module.exports = {

    printPhase,

    printError,

    printSuccess,

    printWarning,

    printSection,

    printOutputFile,

    printVerbose,

    printPipelineStep,

    printPipelineSuccess,

    formatElapsedTime,

    printPipelineFooter,

    printSummary

};
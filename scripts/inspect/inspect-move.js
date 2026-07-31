const {

    findMove

} = require("./inspect-search");

const {

    colourType,
    printMoveHeading

} = require(
    "../utils/pokemon-formatting"
);

const {

    printField,
    printList,
    printNotFound,
    printParagraph,
    printSection

} = require("./inspect-utils");

function formatValue(
    value
) {

    return value ??
        "—";

}

function formatFlag(
    flag
) {

    return (

        flag.charAt(0).toUpperCase() +

        flag.slice(1)

    );

}

function getLatestVersion(
    move
) {

    return [

        ...move.versions

    ]

        .sort(
            (first, second) =>

                first.versionGroup.order -

                second.versionGroup.order
        )

        .at(-1);

}

function inspectMove(

    query,

    {

        limit = null

    } = {}

) {

    const move =
        findMove(query);

    if (!move) {

        printNotFound(
            "Move",
            query
        );

        return;

    }

    const latestVersion =
        getLatestVersion(
            move
        );

    const activeFlags =
        Object.entries(
            move.flags
        )

            .filter(
                ([, value]) => value
            )

            .map(
                ([flag]) =>

                    formatFlag(
                        flag
                    )
            );

    const versionHistory = [

        ...move.versions

    ].sort(

        (first, second) =>

            first.versionGroup.order -

            second.versionGroup.order

    );

    printMoveHeading(
        move
    );

    console.log();

    printSection(
        "General"
    );

    printField(
        "ID",
        move.id
    );

    printField(
        "Generation",
        move.generation.name
    );

    printField(
        "Type",
        colourType(
            move.type.name
        )
    );

    printField(
        "Category",
        move.damageClass.name
    );

    printField(
        "Target",
        move.target.name
    );

    printField(
        "Priority",
        move.priority
    );

    console.log();

    printSection(
        "Battle Stats"
    );

    printField(
        "Power",
        formatValue(
            latestVersion?.power
        )
    );

    printField(
        "Accuracy",
        formatValue(
            latestVersion?.accuracy
        )
    );

    printField(
        "PP",
        formatValue(
            latestVersion?.pp
        )
    );

    printField(
        "Effect Chance",
        formatValue(
            latestVersion?.effectChance
        )
    );

    console.log();

    printSection(
        "Effect"
    );

    printParagraph(
        move.effect
    );

    console.log();

    printSection(
        "Flags"
    );

    printList(
        activeFlags
    );

    console.log();

    printSection(
        "Metadata"
    );

    printField(
        "Ailment",
        move.meta.ailment.name
    );

    printField(
        "Category",
        move.meta.category.name
    );

    printField(
        "Flinch Chance",
        `${move.meta.flinchChance}%`
    );

    printField(
        "Critical Rate",
        move.meta.critRate
    );

    console.log();

    printSection(
        `Version History (${move.versions.length})`
    );
    
    const displayedVersions =
    
        limit === null
    
            ? versionHistory
    
            : versionHistory.slice(
                0,
                limit
            );
        
    const versionColumnWidth = 34;
    const powerColumnWidth = 7;
    const accuracyColumnWidth = 6;
    const ppColumnWidth = 4;
        
    console.log(
    
        "  " +
    
        "Version Group".padEnd(
            versionColumnWidth
        ) +
    
        "Power".padStart(
            powerColumnWidth
        ) +
    
        "Acc".padStart(
            accuracyColumnWidth
        ) +
    
        "PP".padStart(
            ppColumnWidth
        )
    
    );
    
    console.log(
    
        "  " +
    
        "─".repeat(
        
            versionColumnWidth +
        
            powerColumnWidth +
        
            accuracyColumnWidth +
        
            ppColumnWidth
        
        )
    
    );
    
    displayedVersions.forEach(
    
        version => {
        
            console.log(
            
                "  " +
            
                version.versionGroup.name.padEnd(
                    versionColumnWidth
                ) +
            
                String(
                    formatValue(
                        version.power
                    )
                ).padStart(
                    powerColumnWidth
                ) +
            
                String(
                    formatValue(
                        version.accuracy
                    )
                ).padStart(
                    accuracyColumnWidth
                ) +
            
                String(
                    formatValue(
                        version.pp
                    )
                ).padStart(
                    ppColumnWidth
                )
            
            );
        
        }
    
    );
    
    if (
    
        limit !== null &&
    
        versionHistory.length > limit
    
    ) {
    
        console.log();
    
        console.log(
        
            `  … and ${versionHistory.length - limit} more`
        
        );
    
    }
    
    console.log();

}

module.exports = {

    inspectMove

};
const axios = require("axios");
const path = require("path");

const {
    formatApiName,
    formatGeneration,
    saveJSON,
    getIdFromUrl,
    hasFlag,
    cleanFlavorText
} = require("./utils");

const {
    TOTAL_MOVES
} = require("./config");

const versionGroups = require(
    "../database/version-groups.json"
);

const OUTPUT_FILE = path.join(
    __dirname,
    "../database/moves.json"
);

async function downloadMoves() {

    try {

        const moves = [];

        for (
            let id = 1;
            id <= TOTAL_MOVES;
            id++
        ) {

            console.log(
                `Downloading Move #${id}...`
            );

            const { data: move } = await axios.get(
                `https://pokeapi.co/api/v2/move/${id}`
            );

            const type = move.type;

            const target = move.target;

            const damageClass = move.damage_class;

            const generation = move.generation;

            const meta = move.meta;

            const contestType = move.contest_type;

            const contestEffect = move.contest_effect;

            const superContestEffect =
                move.super_contest_effect;

            const flags = move.flags;

            const statChanges = move.stat_changes;

            const pastValues = move.past_values;

            const effectEntries = move.effect_entries;

            const flavorEntries =
                move.flavor_text_entries;

            const englishEffect = effectEntries.find(
                entry => entry.language.name === "en"
            );

            const history = [];

            const flavorMap = new Map();

            for (const past of pastValues) {
            
                const versionGroup = versionGroups.find(
                    vg =>
                        vg.apiName ===
                        past.version_group.name
                );

                if (!versionGroup) {
                
                    continue;
                
                }
            
                history.push({
                
                    order: versionGroup.order,
                
                    data: past
                
                });
            
            }

            history.sort(
            
                (a, b) => a.order - b.order
            
            );

            for (const entry of flavorEntries) {
            
                if (entry.language.name !== "en") {
                    continue;
                }
            
                flavorMap.set(
                
                    entry.version_group.name,
                
                    cleanFlavorText(
                        entry.flavor_text
                    )
                
                );
            
            }

            const versions = [];

            for (const versionGroup of versionGroups) {
            
                let power = move.power;

                let accuracy = move.accuracy;

                let pp = move.pp;

                let effectChance = move.effect_chance;

                let type = move.type;

                for (const change of history) {
                
                    if (change.order > versionGroup.order) {
                    
                        break;
                    
                    }
                
                    const past = change.data;
                
                    if (past.power !== null) {
                    
                        power = past.power;
                    
                    }
                
                    if (past.accuracy !== null) {
                    
                        accuracy = past.accuracy;
                    
                    }
                
                    if (past.pp !== null) {
                    
                        pp = past.pp;
                    
                    }
                
                    if (past.effect_chance !== null) {
                    
                        effectChance =
                            past.effect_chance;
                    
                    }
                
                    if (past.type !== null) {
                    
                        type = past.type;
                    
                    }
                
                }
            
                versions.push({

                    versionGroup: {
                    
                        id: versionGroup.id,
                    
                        order: versionGroup.order,
                    
                        apiName:
                            versionGroup.apiName,
                    
                        name:
                            versionGroup.name
                    
                    },
                
                    power,
                
                    accuracy,
                
                    pp,
                
                    effectChance,
                
                    type: {
                    
                        id: getIdFromUrl(type.url),
                    
                        name: formatApiName(
                            type.name
                        )
                    
                    },
                
                    description:
                
                        flavorMap.get(
                            versionGroup.apiName
                        ) || null
                    
                });
            
            }

            moves.push({
            
                id: move.id,
            
                name: formatApiName(
                    move.name
                ),
            
                generation: {
                
                    id: getIdFromUrl(
                        generation.url
                    ),
                
                    name: formatGeneration(
                        generation.name
                    )
                
                },
            
                type: {
                
                    id: getIdFromUrl(
                        type.url
                    ),
                
                    name: formatApiName(
                        type.name
                    )
                
                },
            
                damageClass: {
                
                    id: getIdFromUrl(
                        damageClass.url
                    ),
                
                    name: formatApiName(
                        damageClass.name
                    )
                
                },
            
                target: {
                
                    id: getIdFromUrl(
                        target.url
                    ),
                
                    name: formatApiName(
                        target.name
                    )
                
                },
            
                priority: move.priority,

                flags: {
                
                    contact: hasFlag(flags, "contact"),
                
                    protect: hasFlag(flags, "protect"),
                
                    mirror: hasFlag(flags, "mirror"),
                
                    sound: hasFlag(flags, "sound"),
                
                    punch: hasFlag(flags, "punch"),
                
                    bite: hasFlag(flags, "bite"),
                
                    pulse: hasFlag(flags, "pulse"),
                
                    powder: hasFlag(flags, "powder"),
                
                    heal: hasFlag(flags, "heal")
                
                },
                
                contest: {
                
                    type: contestType
                        ? {
                        
                            id: getIdFromUrl(
                                contestType.url
                            ),
                        
                            name: formatApiName(
                                contestType.name
                            )
                        
                        }
                        : null,
                    
                    effect: contestEffect
                        ? getIdFromUrl(
                            contestEffect.url
                        )
                        : null,
                    
                    superEffect: superContestEffect
                        ? getIdFromUrl(
                            superContestEffect.url
                        )
                        : null
                    
                },

                meta: meta
                    ? {
                    
                        ailment: meta.ailment
                            ? {
                            
                                id: getIdFromUrl(
                                    meta.ailment.url
                                ),
                            
                                name: formatApiName(
                                    meta.ailment.name
                                )
                            
                            }
                            : null,
                        
                        category: meta.category
                            ? {
                            
                                id: getIdFromUrl(
                                    meta.category.url
                                ),
                            
                                name: formatApiName(
                                    meta.category.name
                                )
                            
                            }
                            : null,
                        
                        minHits: meta.min_hits,
                        
                        maxHits: meta.max_hits,
                        
                        minTurns: meta.min_turns,
                        
                        maxTurns: meta.max_turns,
                        
                        drain: meta.drain,
                        
                        healing: meta.healing,
                        
                        critRate: meta.crit_rate,
                        
                        ailmentChance: meta.ailment_chance,
                        
                        flinchChance: meta.flinch_chance,
                        
                        statChance: meta.stat_chance
                        
                    }
                    : null,

                statChanges: statChanges.map(change => ({
                
                    stat: {
                    
                        id: getIdFromUrl(
                            change.stat.url
                        ),
                    
                        name: formatApiName(
                            change.stat.name
                        )
                    
                    },
                
                    change: change.change
                
                })),

                effect: cleanFlavorText(
                    englishEffect?.effect
                ),

                shortEffect: cleanFlavorText(
                    englishEffect?.short_effect
                ),

                versions

            });
        
        }

        moves.sort(
            (a, b) => a.id - b.id
        );

        saveJSON(
            OUTPUT_FILE,
            moves
        );

        console.log(
            `Successfully downloaded ${moves.length} moves.`
        );

    } catch (error) {

        console.error(
            "Error downloading moves:"
        );

        console.error(error.message);

    }

}

downloadMoves();
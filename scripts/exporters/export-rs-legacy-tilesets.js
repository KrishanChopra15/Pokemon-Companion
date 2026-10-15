
/**
 * Pokemon Companion
 *
 * Ruby/Sapphire Legacy Tileset Exporter
 *
 * Exports original Ruby/Sapphire tilesets needed to render legacy
 * layouts contained in the FireRed source repository.
 *
 * Source assets are converted with the official pokeruby gbagfx tool.
 * Original map grids are never modified by this exporter.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "../..");

const referenceRoot = path.resolve(
    projectRoot,
    "../References/pokeruby"
);

const sourceTilesetRoot = path.join(
    referenceRoot,
    "data",
    "tilesets"
);

const assetRoot = path.join(
    projectRoot,
    "assets",
    "firered",
    "maps"
);

const outputRoot = path.join(
    assetRoot,
    "legacy-rs"
);

const gbagfxDirectory = path.join(
    referenceRoot,
    "tools",
    "gbagfx"
);

const gbagfxPath = path.join(
    gbagfxDirectory,
    "gbagfx"
);

const SOURCE_PRIMARY_PALETTE_COUNT = 6;
const SOURCE_TOTAL_PALETTE_COUNT = 12;
const SOURCE_PRIMARY_TILE_COUNT = 512;
const SOURCE_PRIMARY_METATILE_COUNT = 512;

const TILES = [
    {
        key: "building",
        source: "primary/building",
        role: "primary"
    },
    {
        key: "general",
        source: "primary/general",
        role: "primary"
    },
    {
        key: "brendans_mays_house",
        source: "secondary/brendans_mays_house",
        role: "secondary"
    },
    {
        key: "shop",
        source: "secondary/shop",
        role: "secondary"
    },
    {
        key: "lilycove",
        source: "secondary/lilycove",
        role: "secondary"
    },
    {
        key: "generic_building",
        source: "secondary/generic_building",
        role: "secondary",
        tileCount: 509
    },
    {
        key: "dewford",
        source: "secondary/dewford",
        role: "secondary",
        tileCount: 343
    },
    {
        key: "ship",
        source: "secondary/ship",
        role: "secondary",
        tileCount: 342
    },
    {
        key: "cable_club",
        source: "secondary/cable_club",
        role: "secondary",
        tileCount: 512,
        appendGraphics: [
            {
                file: "unknown_tiles.png",
                tileCount: 120
            }
        ],
        totalTileCount: 632
    }
];

const LAYOUT_OVERRIDES = {
    LAYOUT_LITTLEROOT_TOWN_MAYS_HOUSE_2F: {
        primary: "building",
        secondary: "brendans_mays_house"
    },

    LAYOUT_LAVARIDGE_TOWN_HERB_SHOP: {
        primary: "building",
        secondary: "shop"
    },

    LAYOUT_RS_SAFARI_ZONE_ENTRANCE: {
        primary: "building",
        secondary: "shop"
    },

    LAYOUT_RS_SAFARI_ZONE_NORTHEAST: {
        primary: "general",
        secondary: "lilycove"
    },

    LAYOUT_RS_SAFARI_ZONE_SOUTHWEST: {
        primary: "general",
        secondary: "lilycove"
    },

    LAYOUT_RS_SAFARI_ZONE_SOUTHEAST: {
        primary: "general",
        secondary: "lilycove"
    },

    LAYOUT_PACIFIDLOG_TOWN_HOUSE1: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_PACIFIDLOG_TOWN_HOUSE2: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_RUSTBORO_CITY_CUTTERS_HOUSE: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_FORTREE_CITY_HOUSE1: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_FORTREE_CITY_HOUSE2: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_FORTREE_CITY_DECORATION_SHOP: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_RUSTBORO_CITY_FLAT2_1F: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_RUSTBORO_CITY_FLAT2_2F: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_RUSTBORO_CITY_FLAT2_3F: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_SOOTOPOLIS_CITY_HOUSE1: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_SOOTOPOLIS_CITY_HOUSE2: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_SOOTOPOLIS_CITY_HOUSE3: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_RUSTBORO_CITY_FLAT1_1F: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_RUSTBORO_CITY_FLAT1_2F: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_RS_BATTLE_TOWER: {
        primary: "general",
        secondary: "dewford"
    },

    LAYOUT_MOSSDEEP_CITY_EREADER_TRAINER_HOUSE_1F: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_MOSSDEEP_CITY_EREADER_TRAINER_HOUSE_2F: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_RS_SAFARI_ZONE_REST_HOUSE: {
        primary: "building",
        secondary: "generic_building"
    },

    LAYOUT_SS_TIDAL_CORRIDOR: {
        primary: "general",
        secondary: "ship"
    },

    LAYOUT_SS_TIDAL_LOWER_DECK: {
        primary: "general",
        secondary: "ship"
    },

    LAYOUT_SS_TIDAL_ROOMS: {
        primary: "general",
        secondary: "ship"
    },

    LAYOUT_EVER_GRANDE_CITY_HALL_OF_FAME: {
        primary: "building",
        secondary: "cable_club"
    }
};

function requireFile(file, description) {
    if (!fs.existsSync(file)) {
        throw new Error(`${description} not found: ${file}`);
    }
}

function runCommand(command, args, description) {
    console.log(`\n${description}`);

    const result = spawnSync(command, args, {
        cwd: projectRoot,
        stdio: "inherit"
    });

    if (result.error) {
        throw new Error(
            `${description} failed: ${result.error.message}`
        );
    }

    if (result.status !== 0) {
        throw new Error(
            `${description} failed with exit code ${result.status}`
        );
    }
}

function ensureGbagfx() {
    if (fs.existsSync(gbagfxPath)) {
        return;
    }

    requireFile(
        path.join(gbagfxDirectory, "Makefile"),
        "Ruby/Sapphire gbagfx Makefile"
    );

    runCommand(
        "make",
        ["-C", gbagfxDirectory],
        "Building the official Ruby/Sapphire gbagfx converter"
    );

    requireFile(
        gbagfxPath,
        "Compiled Ruby/Sapphire gbagfx executable"
    );
}

function ensureDirectory(directory) {
    fs.mkdirSync(directory, {
        recursive: true
    });
}

function getPngDimensions(file) {
    const data = fs.readFileSync(file);

    const signature = Buffer.from([
        0x89, 0x50, 0x4E, 0x47,
        0x0D, 0x0A, 0x1A, 0x0A
    ]);

    if (
        data.length < 26 ||
        !data.subarray(0, 8).equals(signature)
    ) {
        throw new Error(`Invalid PNG file: ${file}`);
    }

    return {
        width: data.readUInt32BE(16),
        height: data.readUInt32BE(20),
        bitDepth: data[24],
        colorType: data[25]
    };
}

function relativeAssetPath(file) {
    return path.relative(assetRoot, file)
        .split(path.sep)
        .join("/");
}

function getSourceTileSlots(file) {
    const info = getPngDimensions(file);

    if (
        info.width % 8 !== 0 ||
        info.height % 8 !== 0
    ) {
        throw new Error(
            `PNG dimensions must be divisible by 8: ${file}`
        );
    }

    return {
        ...info,
        tileSlots: (info.width / 8) * (info.height / 8)
    };
}

function convertGraphics(
    sourcePng,
    outputFile,
    requestedTileCount,
    description
) {
    const sourceInfo = getSourceTileSlots(sourcePng);

    if (
        !Number.isInteger(requestedTileCount) ||
        requestedTileCount < 1 ||
        requestedTileCount > sourceInfo.tileSlots
    ) {
        throw new Error(
            `${description}: requested ${requestedTileCount} tiles, ` +
            `but source contains ${sourceInfo.tileSlots} tile slots`
        );
    }

    const args = [
        sourcePng,
        outputFile
    ];

    if (requestedTileCount !== sourceInfo.tileSlots) {
        args.push("-num_tiles", String(requestedTileCount));
    }

    runCommand(
        gbagfxPath,
        args,
        `Converting ${description}`
    );

    const output = fs.readFileSync(outputFile);

    if (output.length % 32 !== 0) {
        throw new Error(
            `${description}: converted graphics are not whole 4bpp tiles`
        );
    }

    const actualTileCount = output.length / 32;

    if (actualTileCount !== requestedTileCount) {
        throw new Error(
            `${description}: expected ${requestedTileCount} tiles, ` +
            `got ${actualTileCount}`
        );
    }

    return {
        data: output,
        sourceInfo,
        tileCount: actualTileCount
    };
}

function exportTileset(definition) {
    const sourceDirectory = path.join(
        sourceTilesetRoot,
        definition.source
    );

    const destinationDirectory = path.join(
        outputRoot,
        "tilesets",
        definition.key
    );

    const sourcePng = path.join(
        sourceDirectory,
        "tiles.png"
    );

    const sourceMetatiles = path.join(
        sourceDirectory,
        "metatiles.bin"
    );

    const sourceAttributes = path.join(
        sourceDirectory,
        "metatile_attributes.bin"
    );

    requireFile(sourcePng, `${definition.key} source graphics`);
    requireFile(sourceMetatiles, `${definition.key} metatile data`);
    requireFile(sourceAttributes, `${definition.key} attribute data`);

    ensureDirectory(destinationDirectory);

    const baseSourceInfo = getSourceTileSlots(sourcePng);
    const requestedBaseTileCount =
        definition.tileCount ?? baseSourceInfo.tileSlots;

    const graphicsOutput = path.join(
        destinationDirectory,
        "tiles.4bpp"
    );

    const baseResult = convertGraphics(
        sourcePng,
        graphicsOutput,
        requestedBaseTileCount,
        `${definition.key} graphics`
    );

    const graphicsParts = [baseResult.data];
    const appendedGraphics = [];
    let totalTileCount = baseResult.tileCount;

    for (
        const [index, extraDefinition] of
        (definition.appendGraphics ?? []).entries()
    ) {
        const extraSource = path.join(
            sourceDirectory,
            extraDefinition.file
        );

        requireFile(
            extraSource,
            `${definition.key} additional graphics`
        );

        const extraOutput = path.join(
            destinationDirectory,
            `tiles-extra-${index}.4bpp`
        );

        let extraResult;

        try {
            extraResult = convertGraphics(
                extraSource,
                extraOutput,
                extraDefinition.tileCount ??
                    getSourceTileSlots(extraSource).tileSlots,
                `${definition.key} additional graphics ${extraDefinition.file}`
            );

            graphicsParts.push(extraResult.data);
            totalTileCount += extraResult.tileCount;

            appendedGraphics.push({
                file: extraDefinition.file,
                tileCount: extraResult.tileCount,
                bytes: extraResult.data.length
            });
        } finally {
            if (fs.existsSync(extraOutput)) {
                fs.unlinkSync(extraOutput);
            }
        }
    }

    if (
        definition.totalTileCount !== undefined &&
        totalTileCount !== definition.totalTileCount
    ) {
        throw new Error(
            `${definition.key}: expected ${definition.totalTileCount} ` +
            `combined tiles, got ${totalTileCount}`
        );
    }

    const graphics = Buffer.concat(graphicsParts);

    if (graphics.length !== totalTileCount * 32) {
        throw new Error(
            `${definition.key}: combined graphics byte count is invalid`
        );
    }

    fs.writeFileSync(graphicsOutput, graphics);

    const metatilesOutput = path.join(
        destinationDirectory,
        "metatiles.bin"
    );

    const attributesOutput = path.join(
        destinationDirectory,
        "metatile_attributes.bin"
    );

    fs.copyFileSync(sourceMetatiles, metatilesOutput);
    fs.copyFileSync(sourceAttributes, attributesOutput);

    const metatiles = fs.readFileSync(metatilesOutput);
    const attributes = fs.readFileSync(attributesOutput);

    if (metatiles.length % 16 !== 0) {
        throw new Error(
            `${definition.key}: metatile data is not divisible by 16`
        );
    }

    if (attributes.length % 2 !== 0) {
        throw new Error(
            `${definition.key}: attribute data is not divisible by 2`
        );
    }

    const metatileCount = metatiles.length / 16;
    const attributeCount = attributes.length / 2;

    if (metatileCount !== attributeCount) {
        throw new Error(
            `${definition.key}: ${metatileCount} metatiles but ` +
            `${attributeCount} attribute records`
        );
    }

    const palettesDirectory = path.join(
        destinationDirectory,
        "palettes"
    );

    ensureDirectory(palettesDirectory);

    const palettes = [];

    const firstPalette = definition.role === "primary"
        ? 0
        : SOURCE_PRIMARY_PALETTE_COUNT;

    const endPalette = definition.role === "primary"
        ? SOURCE_PRIMARY_PALETTE_COUNT
        : SOURCE_TOTAL_PALETTE_COUNT;

    for (
        let paletteBank = firstPalette;
        paletteBank < endPalette;
        paletteBank++
    ) {
        const paletteName =
            String(paletteBank).padStart(2, "0");

        const sourcePalette = path.join(
            sourceDirectory,
            "palettes",
            `${paletteName}.pal`
        );

        const outputPalette = path.join(
            palettesDirectory,
            `${paletteName}.gbapal`
        );

        requireFile(
            sourcePalette,
            `${definition.key} palette ${paletteName}`
        );

        runCommand(
            gbagfxPath,
            [sourcePalette, outputPalette],
            `Converting ${definition.key} palette ${paletteName}`
        );

        const paletteData = fs.readFileSync(outputPalette);

        if (paletteData.length !== 32) {
            throw new Error(
                `${definition.key} palette ${paletteName}: ` +
                `expected 32 bytes, got ${paletteData.length}`
            );
        }

        palettes.push({
            bank: paletteBank,
            path: relativeAssetPath(outputPalette)
        });
    }

    const result = {
        key: definition.key,
        role: definition.role,
        source: definition.source,

        graphics: {
            width: baseSourceInfo.width,
            height: baseSourceInfo.height,
            sourceBitDepth: baseSourceInfo.bitDepth,
            sourceColorType: baseSourceInfo.colorType,
            sourceTileSlots: baseSourceInfo.tileSlots,
            baseTileCount: baseResult.tileCount,
            appendedGraphics,
            tileCount: totalTileCount,
            bytes: graphics.length
        },

        metatileCount,
        attributeCount,

        assets: {
            tiles: relativeAssetPath(graphicsOutput),
            metatiles: relativeAssetPath(metatilesOutput),
            attributes: relativeAssetPath(attributesOutput),
            palettes
        }
    };

    console.log("\nExported tileset summary:");
    console.log(JSON.stringify(result, null, 2));

    return result;
}

function run() {
    console.log("Ruby/Sapphire legacy tileset exporter");
    console.log(`Source: ${referenceRoot}`);
    console.log(`Output: ${outputRoot}`);

    requireFile(
        path.join(referenceRoot, "data", "layouts", "layouts.json"),
        "Ruby/Sapphire layout manifest"
    );

    ensureGbagfx();
    ensureDirectory(outputRoot);

    const tilesets = {};

    for (const definition of TILES) {
        tilesets[definition.key] = exportTileset(definition);
    }

    const outputManifest = {
        game: "firered",
        assetSet: "legacy-rs-tilesets",
        source: "pret/pokeruby",

        sourceRules: {
            primaryTileCount: SOURCE_PRIMARY_TILE_COUNT,
            primaryMetatileCount: SOURCE_PRIMARY_METATILE_COUNT,
            primaryPaletteCount: SOURCE_PRIMARY_PALETTE_COUNT,
            totalPaletteCount: SOURCE_TOTAL_PALETTE_COUNT,

            metatileBytes: 16,
            attributeBytes: 2,

            layerTypeMask: 0xF000,
            layerTypeShift: 12
        },

        layoutOverrides: LAYOUT_OVERRIDES,
        tilesets
    };

    const manifestFile = path.join(
        outputRoot,
        "manifest.json"
    );

    fs.writeFileSync(
        manifestFile,
        JSON.stringify(outputManifest, null, 2) + "\n",
        "utf8"
    );

    console.log("\nRuby/Sapphire legacy asset export finished.");
    console.log(`Tilesets exported: ${Object.keys(tilesets).length}`);
    console.log(`Layout overrides: ${Object.keys(LAYOUT_OVERRIDES).length}`);
    console.log(
        `Manifest: ${path.relative(projectRoot, manifestFile)}`
    );
}

try {
    run();
} catch (error) {
    console.error("\nRuby/Sapphire legacy export failed.");
    console.error(error.message);
    process.exitCode = 1;
}

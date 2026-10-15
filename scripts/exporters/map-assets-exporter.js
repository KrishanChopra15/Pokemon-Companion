
/**
 * Pokémon Companion
 * FireRed Map Asset Exporter
 *
 * Exports original map binaries and their referenced tileset resources.
 * Resource paths are resolved from the original pokefirered C declarations.
 *
 * Does not modify the source repository or frontend.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "../..");

const sourceRoot = path.resolve(
    projectRoot,
    "..",
    "References",
    "pokefirered"
);

const outputRoot = path.join(
    projectRoot,
    "assets",
    "firered",
    "maps"
);

const SOURCE_FILES = [
    "src/data/tilesets/headers.h",
    "src/data/tilesets/graphics.h",
    "src/data/tilesets/metatiles.h",
    "src/graphics.c"
];

const CONSTANTS = {
    primaryTileCount: 640,
    totalTileCount: 1024,
    primaryPaletteBanks: 7,
    totalPaletteBanks: 13,
    mapGridMetatileIdMask: 0x03FF,
    mapGridCollisionMask: 0x0C00,
    mapGridElevationMask: 0xF000,
    bytesPer4bppTile: 32,
    tileWidth: 8,
    tileHeight: 8,
    tilesPerMetatile: 8,
    bytesPerMetatile: 16
};

const resourceCache = new Map();
const warnings = [];

function requirePath(file, description) {
    if (!fs.existsSync(file)) {
        throw new Error(`${description} not found: ${file}`);
    }
}

function readSource(relativePath) {
    const file = path.resolve(sourceRoot, relativePath);
    requirePath(file, "Source file");
    return fs.readFileSync(file, "utf8");
}

function writeOutput(relativePath, data) {
    const target = path.resolve(
        outputRoot,
        ...relativePath.split("/")
    );

    if (
        target !== outputRoot &&
        target.startsWith(outputRoot + path.sep) === false
    ) {
        throw new Error(`Unsafe output path: ${relativePath}`);
    }

    fs.mkdirSync(path.dirname(target), {
        recursive: true
    });

    fs.writeFileSync(target, data);
}

function getSourceFile(relativePath) {
    const target = path.resolve(
        sourceRoot,
        ...relativePath.split("/")
    );

    if (
        target !== sourceRoot &&
        target.startsWith(sourceRoot + path.sep) === false
    ) {
        throw new Error(`Unsafe source path: ${relativePath}`);
    }

    requirePath(target, "Referenced source resource");
    return target;
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Decodes the GBA BIOS 0x10 LZ77 compression format.
 */
function decompressGbaLz77(input, description) {
    if (input.length < 4 || input[0] !== 0x10) {
        throw new Error(`Invalid GBA LZ77 data: ${description}`);
    }

    const outputSize =
        input[1] |
        (input[2] << 8) |
        (input[3] << 16);

    if (outputSize === 0) {
        throw new Error(
            `Invalid decompressed length: ${description}`
        );
    }

    const output = Buffer.alloc(outputSize);

    let inputOffset = 4;
    let outputOffset = 0;

    while (outputOffset < outputSize) {
        if (inputOffset >= input.length) {
            throw new Error(
                `Unexpected end of compressed data: ${description}`
            );
        }

        const flags = input[inputOffset++];

        for (
            let bit = 7;
            bit >= 0 && outputOffset < outputSize;
            bit--
        ) {
            if ((flags & (1 << bit)) === 0) {
                if (inputOffset >= input.length) {
                    throw new Error(
                        `Incomplete literal: ${description}`
                    );
                }

                output[outputOffset++] = input[inputOffset++];
                continue;
            }

            if (inputOffset + 1 >= input.length) {
                throw new Error(
                    `Incomplete LZ77 reference: ${description}`
                );
            }

            const first = input[inputOffset++];
            const second = input[inputOffset++];

            const length = (first >>> 4) + 3;
            const displacement =
                (((first & 0x0F) << 8) | second) + 1;

            if (displacement > outputOffset) {
                throw new Error(
                    `Invalid LZ77 displacement: ${description}`
                );
            }

            for (let i = 0; i < length; i++) {
                if (outputOffset >= outputSize) {
                    break;
                }

                output[outputOffset] =
                    output[outputOffset - displacement];

                outputOffset++;
            }
        }
    }

    return output;
}

function toAssetPath(sourceRelativePath) {
    const normalized = sourceRelativePath.replace(/\\/g, "/");
    const prefix = "data/tilesets/";

    if (normalized.startsWith(prefix) === false) {
        throw new Error(
            `Unexpected tileset resource path: ${sourceRelativePath}`
        );
    }

    const relative = normalized.slice(prefix.length);

    // Store decompressed tile graphics for easier frontend use.
    return (
        "tilesets/" +
        relative.replace(/\.4bpp\.lz$/, ".4bpp")
    );
}

/**
 * Exports a tileset file once, even when several maps share it.
 */
function exportTilesetFile(sourceRelativePath, kind) {
    const assetPath = toAssetPath(sourceRelativePath);

    if (resourceCache.has(assetPath) === false) {
        const sourceFile = getSourceFile(sourceRelativePath);

        let data = fs.readFileSync(sourceFile);

        if (sourceRelativePath.endsWith(".lz")) {
            data = decompressGbaLz77(
                data,
                sourceRelativePath
            );
        }

        if (
            kind === "tiles" &&
            data.length % CONSTANTS.bytesPer4bppTile !== 0
        ) {
            throw new Error(
                `4bpp graphics size is not a whole number of tiles: ` +
                `${sourceRelativePath} (${data.length} bytes)`
            );
        }

        if (
            kind === "metatiles" &&
            data.length % CONSTANTS.bytesPerMetatile !== 0
        ) {
            throw new Error(
                `Invalid metatile data length: ${sourceRelativePath}`
            );
        }

        if (kind === "attributes" && data.length % 4 !== 0) {
            throw new Error(
                `Invalid metatile attribute data length: ${sourceRelativePath}`
            );
        }

        if (
            kind === "palette" &&
            data.length !== 32
        ) {
            throw new Error(
                `Expected a 16-color GBA palette: ${sourceRelativePath}`
            );
        }

        writeOutput(assetPath, data);

        resourceCache.set(assetPath, {
            path: assetPath,
            bytes: data.length
        });
    }

    return resourceCache.get(assetPath);
}

function findSingleResourcePath(symbol, sourceTexts) {
    const pattern = new RegExp(
        `\\b${escapeRegex(symbol)}\\s*\\[\\s*\\]\\s*=\\s*` +
        `INCBIN_U(?:16|32)\\s*\\(\\s*"([^"]+)"\\s*\\)`
    );

    for (const sourceText of sourceTexts) {
        const match = sourceText.match(pattern);

        if (match) {
            return match[1];
        }
    }

    return null;
}

function findPalettePaths(symbol, sourceTexts) {
    const pattern = new RegExp(
        `\\b${escapeRegex(symbol)}\\s*\\[\\s*\\]` +
        `\\s*\\[\\s*16\\s*\\]\\s*=\\s*\\{([\\s\\S]*?)\\};`
    );

    for (const sourceText of sourceTexts) {
        const match = sourceText.match(pattern);

        if (match) {
            return [
                ...match[1].matchAll(
                    /INCBIN_U16\s*\(\s*"([^"]+)"\s*\)/g
                )
            ].map(item => item[1]);
        }
    }

    return null;
}

function findTilesetDefinition(name, headerText) {
    const pattern = new RegExp(
        `const\\s+struct\\s+Tileset\\s+` +
        `${escapeRegex(name)}\\s*=\\s*\\{([\\s\\S]*?)\\};`
    );

    const match = headerText.match(pattern);

    if (match === null) {
        throw new Error(
            `Tileset definition not found in headers.h: ${name}`
        );
    }

    const block = match[1];

    function getSymbol(property) {
        const propertyPattern = new RegExp(
            `\\.${property}\\s*=\\s*([A-Za-z_]\\w*)`
        );

        const propertyMatch = block.match(propertyPattern);

        if (propertyMatch === null) {
            return null;
        }

        return propertyMatch[1] === "NULL"
            ? null
            : propertyMatch[1];
    }

    function getBoolean(property) {
        const propertyPattern = new RegExp(
            `\\.${property}\\s*=\\s*(TRUE|FALSE)`
        );

        const propertyMatch = block.match(propertyPattern);

        if (propertyMatch === null) {
            return false;
        }

        return propertyMatch[1] === "TRUE";
    }

    return {
        isCompressed: getBoolean("isCompressed"),
        isSecondary: getBoolean("isSecondary"),
        tilesSymbol: getSymbol("tiles"),
        palettesSymbol: getSymbol("palettes"),
        metatilesSymbol: getSymbol("metatiles"),
        attributesSymbol: getSymbol("metatileAttributes")
    };
}

function resolveSingleSymbol(symbol, sourceTexts, description) {
    if (symbol === null) {
        return null;
    }

    const relativePath = findSingleResourcePath(
        symbol,
        sourceTexts
    );

    if (relativePath === null) {
        throw new Error(
            `Cannot resolve ${description} symbol: ${symbol}`
        );
    }

    return relativePath;
}

function resolveTileset(name, headerText, sourceTexts) {
    const definition = findTilesetDefinition(
        name,
        headerText
    );

    const tilesPath = resolveSingleSymbol(
        definition.tilesSymbol,
        sourceTexts,
        "tile graphics"
    );

    const metatilesPath = resolveSingleSymbol(
        definition.metatilesSymbol,
        sourceTexts,
        "metatiles"
    );

    const attributesPath = resolveSingleSymbol(
        definition.attributesSymbol,
        sourceTexts,
        "metatile attributes"
    );

    let palettePaths = [];

    if (definition.palettesSymbol !== null) {
        const result = findPalettePaths(
            definition.palettesSymbol,
            sourceTexts
        );

        if (result === null) {
            throw new Error(
                `Cannot resolve palette array: ${definition.palettesSymbol}`
            );
        }

        palettePaths = result;
    }

    if (tilesPath === null) {
        warnings.push(
            `${name} has no tile graphics reference in its source definition.`
        );
    }

    const assets = {
        tiles: null,
        metatiles: null,
        attributes: null,
        palettes: []
    };

    let tileCount = null;
    let metatileCount = null;

    if (tilesPath !== null) {
        const result = exportTilesetFile(tilesPath, "tiles");

        assets.tiles = result.path;
        tileCount = result.bytes / CONSTANTS.bytesPer4bppTile;
    }

    if (metatilesPath !== null) {
        const result = exportTilesetFile(
            metatilesPath,
            "metatiles"
        );

        assets.metatiles = result.path;
        metatileCount = result.bytes / CONSTANTS.bytesPerMetatile;
    }

    if (attributesPath !== null) {
        assets.attributes = exportTilesetFile(
            attributesPath,
            "attributes"
        ).path;
    }

    // FireRed's engine loads banks 0-6 for a primary tileset
    // and banks 7-12 for a secondary tileset.
    const paletteStart = definition.isSecondary
        ? CONSTANTS.primaryPaletteBanks
        : 0;

    const paletteEnd = definition.isSecondary
        ? CONSTANTS.totalPaletteBanks
        : CONSTANTS.primaryPaletteBanks;

    for (
        let index = paletteStart;
        index < paletteEnd && index < palettePaths.length;
        index++
    ) {
        const paletteSource = palettePaths[index];

        const palette = exportTilesetFile(
            paletteSource,
            "palette"
        );

        assets.palettes.push({
            bank: index,
            path: palette.path
        });
    }

    if (palettePaths.length < paletteEnd) {
        warnings.push(
            `${name} declares ${palettePaths.length} palette entries; ` +
            `source loader uses banks ${paletteStart}-${paletteEnd - 1}.`
        );
    }

    return {
        isCompressed: definition.isCompressed,
        isSecondary: definition.isSecondary,
        sourceSymbols: {
            tiles: definition.tilesSymbol,
            palettes: definition.palettesSymbol,
            metatiles: definition.metatilesSymbol,
            attributes: definition.attributesSymbol
        },
        tileCount,
        metatileCount,
        assets
    };
}

function exportLayout(layout, sourceIndex, seenIds) {
    const requiredFields = [
        "id",
        "width",
        "height",
        "border_width",
        "border_height",
        "primary_tileset",
        "secondary_tileset",
        "blockdata_filepath",
        "border_filepath"
    ];

    for (const field of requiredFields) {
        if (layout[field] === undefined) {
            throw new Error(
                `Layout at source index ${sourceIndex} is missing ${field}`
            );
        }
    }

    if (seenIds.has(layout.id)) {
        throw new Error(`Duplicate layout ID: ${layout.id}`);
    }

    seenIds.add(layout.id);

    const mapSource = path.resolve(
        sourceRoot,
        layout.blockdata_filepath
    );

    const borderSource = path.resolve(
        sourceRoot,
        layout.border_filepath
    );

    requirePath(mapSource, `Map binary for ${layout.id}`);
    requirePath(borderSource, `Border binary for ${layout.id}`);

    const mapData = fs.readFileSync(mapSource);
    const borderData = fs.readFileSync(borderSource);

    const expectedMapBytes =
        layout.width * layout.height * 2;

    if (mapData.length !== expectedMapBytes) {
        throw new Error(
            `${layout.id}: map.bin size mismatch. ` +
            `Expected ${expectedMapBytes}, got ${mapData.length}.`
        );
    }

    const expectedBorderBytes =
        layout.border_width * layout.border_height * 2;

    if (
        expectedBorderBytes > 0 &&
        borderData.length !== expectedBorderBytes
    ) {
        throw new Error(
            `${layout.id}: border.bin size mismatch. ` +
            `Expected ${expectedBorderBytes}, got ${borderData.length}.`
        );
    }

    const safeId = layout.id.replace(/[^A-Za-z0-9_-]/g, "_");

    const mapPath = `layouts/${safeId}/map.bin`;
    const borderPath = `layouts/${safeId}/border.bin`;

    writeOutput(mapPath, mapData);
    writeOutput(borderPath, borderData);

    return {
        sourceIndex,
        id: layout.id,
        name: layout.name,
        width: layout.width,
        height: layout.height,
        borderWidth: layout.border_width,
        borderHeight: layout.border_height,
        primaryTileset: layout.primary_tileset,
        secondaryTileset: layout.secondary_tileset,
        tileBases: {
            primary: 0,
            secondary: CONSTANTS.primaryTileCount
        },
        source: {
            map: layout.blockdata_filepath,
            border: layout.border_filepath
        },
        assets: {
            map: mapPath,
            border: borderPath
        }
    };
}

function run() {
    const layoutFile = path.join(
        sourceRoot,
        "data",
        "layouts",
        "layouts.json"
    );

    requirePath(layoutFile, "FireRed layouts database");

    const rawLayouts = JSON.parse(
        fs.readFileSync(layoutFile, "utf8")
    );

    if (Array.isArray(rawLayouts.layouts) === false) {
        throw new Error(
            "Expected layouts.json to contain a layouts array."
        );
    }

    const headerText = readSource(
        "src/data/tilesets/headers.h"
    );

    const sourceTexts = SOURCE_FILES.map(
        file => readSource(file)
    );

    const layouts = [];
    const seenIds = new Set();

    for (
        let sourceIndex = 0;
        sourceIndex < rawLayouts.layouts.length;
        sourceIndex++
    ) {
        const layout = rawLayouts.layouts[sourceIndex];

        // The source array contains empty placeholder slots.
        if (
            layout === null ||
            typeof layout !== "object" ||
            typeof layout.id !== "string"
        ) {
            continue;
        }

        layouts.push(
            exportLayout(layout, sourceIndex, seenIds)
        );
    }

    const usedTilesets = new Set();

    for (const layout of layouts) {
        for (const name of [
            layout.primaryTileset,
            layout.secondaryTileset
        ]) {
            if (name && name !== "NULL") {
                usedTilesets.add(name);
            }
        }
    }

    const tilesets = {};

    for (const name of [...usedTilesets].sort()) {
        tilesets[name] = resolveTileset(
            name,
            headerText,
            sourceTexts
        );
    }

    const manifest = {
        game: "firered",
        source: "pret/pokefirered",
        sourceLayoutCount: rawLayouts.layouts.length,
        layoutCount: layouts.length,
        tilesetCount: Object.keys(tilesets).length,
        format: {
            mapGrid: {
                entryBytes: 2,
                byteOrder: "little-endian",
                metatileIdMask: CONSTANTS.mapGridMetatileIdMask,
                collisionMask: CONSTANTS.mapGridCollisionMask,
                elevationMask: CONSTANTS.mapGridElevationMask
            },
            tileGraphics: {
                bitsPerPixel: 4,
                bytesPerTile: CONSTANTS.bytesPer4bppTile,
                tileWidth: CONSTANTS.tileWidth,
                tileHeight: CONSTANTS.tileHeight
            },
            metatiles: {
                bytesPerMetatile: CONSTANTS.bytesPerMetatile,
                entriesPerMetatile: CONSTANTS.tilesPerMetatile,
                entryBytes: 2
            },
            tileSlots: {
                primaryCount: CONSTANTS.primaryTileCount,
                secondaryBase: CONSTANTS.primaryTileCount,
                totalCount: CONSTANTS.totalTileCount
            },
            paletteBanks: {
                primaryStart: 0,
                primaryCount: CONSTANTS.primaryPaletteBanks,
                secondaryStart: CONSTANTS.primaryPaletteBanks,
                secondaryCount:
                    CONSTANTS.totalPaletteBanks -
                    CONSTANTS.primaryPaletteBanks,
                totalCount: CONSTANTS.totalPaletteBanks
            }
        },
        layouts,
        tilesets
    };

    writeOutput(
        "manifest.json",
        JSON.stringify(manifest, null, 2) + "\n"
    );

    console.log();
    console.log("FireRed map assets exported.");
    console.log(`Layout source slots: ${rawLayouts.layouts.length}`);
    console.log(`Layouts exported: ${layouts.length}`);
    console.log(`Tilesets referenced: ${Object.keys(tilesets).length}`);
    console.log(`Unique tileset files: ${resourceCache.size}`);
    console.log(
        "Manifest: assets/firered/maps/manifest.json"
    );

    if (warnings.length > 0) {
        console.log();
        console.log("Warnings:");

        for (const warning of warnings) {
            console.log(`- ${warning}`);
        }
    }

    console.log();
}

try {
    run();
} catch (error) {
    console.error();
    console.error("FireRed map asset export failed.");
    console.error(error.message);
    process.exitCode = 1;
}

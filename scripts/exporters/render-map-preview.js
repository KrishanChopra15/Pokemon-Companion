
/**
 * Pokémon Companion
 * FireRed Map Preview Renderer
 *
 * Reconstructs a static map image from the exported original assets.
 *
 * Uses:
 * - Original map-grid and metatile binaries.
 * - Original 4bpp tile graphics.
 * - Original GBA RGB555 palettes.
 * - Original metatile layer attributes.
 *
 * This renders a static preview without NPCs, characters, animation,
 * weather, or other dynamic in-game effects.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const projectRoot = path.resolve(__dirname, "../..");

const assetRoot = path.join(
    projectRoot,
    "assets",
    "firered",
    "maps"
);

const manifestPath = path.join(
    assetRoot,
    "manifest.json"
);

const legacyManifestPath = path.join(
    assetRoot,
    "legacy-rs",
    "manifest.json"
);

const TILE_INDEX_MASK = 0x03FF;
const H_FLIP_MASK = 0x0400;
const V_FLIP_MASK = 0x0800;
const PALETTE_MASK = 0xF000;

const TOTAL_METATILE_COUNT = 1024;

const FIRE_RED_RULES = {
    primaryTileCount: 640,
    primaryMetatileCount: 640,
    attributeBytes: 4,
    layerTypeMask: 0x60000000,
    layerTypeShift: 29
};

const RUBY_SAPPHIRE_RULES = {
    primaryTileCount: 512,
    primaryMetatileCount: 512,
    attributeBytes: 2,
    layerTypeMask: 0xF000,
    layerTypeShift: 12
};

// Rendering is synchronous, so this profile applies to the map
// currently being rendered.
let activeRules = FIRE_RED_RULES;

const TILE_SIZE = 8;
const METATILE_SIZE = 16;
const BYTES_PER_TILE = 32;
const BYTES_PER_METATILE = 16;

// Records missing graphics encountered during static map rendering.
// This tracker is reset for each map.
const missingGraphicsRecords = new Map();

function recordMissingGraphics(record) {
    const key = JSON.stringify(record);
    missingGraphicsRecords.set(key, record);
}

const LAYER_TYPE_NORMAL = 0;
const LAYER_TYPE_COVERED = 1;
const LAYER_TYPE_SPLIT = 2;

// Original FireRed BG3 filler tilemap entry used for NORMAL metatiles.
const NORMAL_BACKGROUND_TILE_ENTRY = 0x3014;

function requireFile(file, description) {
    if (!fs.existsSync(file)) {
        throw new Error(`${description} not found: ${file}`);
    }
}

function readAsset(relativePath, description) {
    if (
        typeof relativePath !== "string" ||
        relativePath.length === 0
    ) {
        throw new Error(`Missing asset path for ${description}`);
    }

    const file = path.resolve(
        assetRoot,
        ...relativePath.split("/")
    );

    if (
        file !== assetRoot &&
        file.startsWith(assetRoot + path.sep) === false
    ) {
        throw new Error(`Unsafe asset path: ${relativePath}`);
    }

    requireFile(file, description);
    return fs.readFileSync(file);
}

function loadResource(manifest, name) {
    const result = manifest.tilesets[name];

    if (result === undefined) {
        throw new Error(
            `Tileset not found in manifest: ${name}`
        );
    }

    return result;
}

function loadBinaryResource(tileset, key, description) {
    const relativePath = tileset.assets[key];

    if (
        relativePath === null ||
        relativePath === undefined
    ) {
        throw new Error(
            `${description} has no exported ${key} resource`
        );
    }

    return readAsset(relativePath, description);
}

function expand5BitColor(value) {
    return (value << 3) | (value >>> 2);
}

/**
 * Reads an original Game Boy Advance 16-color RGB555 palette.
 */
function decodePalette(relativePath) {
    const data = readAsset(relativePath, "Palette");

    if (data.length !== 32) {
        throw new Error(
            `Expected 32-byte GBA palette, got ${data.length}: ` +
            relativePath
        );
    }

    const colors = [];

    for (let i = 0; i < 16; i++) {
        const color = data.readUInt16LE(i * 2);

        colors.push([
            expand5BitColor(color & 0x1F),
            expand5BitColor((color >>> 5) & 0x1F),
            expand5BitColor((color >>> 10) & 0x1F)
        ]);
    }

    return colors;
}

/**
 * Creates the palette-bank lookup for this map.
 *
 * Primary and secondary tilesets supply different palette banks.
 */
function loadPaletteBanks(primary, secondary) {
    const palettes = new Map();

    for (const tileset of [primary, secondary]) {
        if (tileset === null) {
            continue;
        }

        for (const entry of tileset.assets.palettes) {
            if (palettes.has(entry.bank)) {
                throw new Error(
                    `Duplicate palette bank ${entry.bank}`
                );
            }

            palettes.set(
                entry.bank,
                decodePalette(entry.path)
            );
        }
    }

    return palettes;
}

function createLayer(width, height) {
    return Buffer.alloc(width * height * 4);
}

function setPixel(layer, imageWidth, x, y, color) {
    const offset = (y * imageWidth + x) * 4;

    layer[offset] = color[0];
    layer[offset + 1] = color[1];
    layer[offset + 2] = color[2];
    layer[offset + 3] = 255;
}

/**
 * Draws one original 8x8 4bpp tile onto a transparent RGBA layer.
 *
 * The 16-bit tilemap entry contains:
 * - Global tile index in bits 0-9.
 * - Horizontal flip in bit 10.
 * - Vertical flip in bit 11.
 * - Palette bank in bits 12-15.
 */
function drawTile(
    layer,
    imageWidth,
    imageHeight,
    destinationX,
    destinationY,
    entry,
    primaryGraphics,
    secondaryGraphics,
    palettes,
    description
) {
    const tileIndex = entry & TILE_INDEX_MASK;
    const horizontalFlip = (entry & H_FLIP_MASK) !== 0;
    const verticalFlip = (entry & V_FLIP_MASK) !== 0;
    const paletteBank = (entry & PALETTE_MASK) >>> 12;

    const palette = palettes.get(paletteBank);

    if (palette === undefined) {
        throw new Error(
            `Palette bank ${paletteBank} not available for ${description}`
        );
    }

    let graphics;
    let localTileIndex;

    if (tileIndex < activeRules.primaryTileCount) {
        graphics = primaryGraphics;
        localTileIndex = tileIndex;
    } else {
        graphics = secondaryGraphics;
        localTileIndex =
            tileIndex - activeRules.primaryTileCount;
    }

    // If a tileset has no graphics resource, record the problem
    // and leave this 8x8 tile transparent.
    if (graphics === null) {
        recordMissingGraphics({
            description,
            tileIndex,
            localTileIndex,
            availableTiles: 0,
            reason: "Graphics resource unavailable"
        });

        return;
    }

    const tileOffset = localTileIndex * BYTES_PER_TILE;

    // Some original metatiles reference graphics outside the
    // exported tileset data. Skip only the affected tile.
    if (tileOffset + BYTES_PER_TILE > graphics.length) {
        recordMissingGraphics({
            description,
            tileIndex,
            localTileIndex,
            availableTiles: Math.floor(
                graphics.length / BYTES_PER_TILE
            ),
            reason: "Tile index outside exported graphics"
        });

        return;
    }

    for (let dy = 0; dy < TILE_SIZE; dy++) {
        const sourceY = verticalFlip ? 7 - dy : dy;

        for (let dx = 0; dx < TILE_SIZE; dx++) {
            const sourceX = horizontalFlip ? 7 - dx : dx;

            const byteOffset =
                tileOffset +
                sourceY * 4 +
                Math.floor(sourceX / 2);

            const packed = graphics[byteOffset];

            // Original GBA 4bpp pixels use the low nibble first.
            const colorIndex = sourceX % 2 === 0
                ? packed & 0x0F
                : (packed >>> 4) & 0x0F;

            // Color index zero is transparent on these BG layers.
            if (colorIndex === 0) {
                continue;
            }

            const x = destinationX + dx;
            const y = destinationY + dy;

            if (
                x < 0 ||
                y < 0 ||
                x >= imageWidth ||
                y >= imageHeight
            ) {
                continue;
            }

            setPixel(
                layer,
                imageWidth,
                x,
                y,
                palette[colorIndex]
            );
        }
    }
}

/**
 * Draws four consecutive tile entries as a 2x2 tile arrangement.
 */
function drawMetatileQuarter(
    layer,
    imageWidth,
    imageHeight,
    mapX,
    mapY,
    entries,
    startIndex,
    primaryGraphics,
    secondaryGraphics,
    palettes,
    description
) {
    for (let i = 0; i < 4; i++) {
        const entry = entries.readUInt16LE(
            startIndex * 2 + i * 2
        );

        const tileX =
            mapX * METATILE_SIZE +
            (i % 2) * TILE_SIZE;

        const tileY =
            mapY * METATILE_SIZE +
            Math.floor(i / 2) * TILE_SIZE;

        drawTile(
            layer,
            imageWidth,
            imageHeight,
            tileX,
            tileY,
            entry,
            primaryGraphics,
            secondaryGraphics,
            palettes,
            description
        );
    }
}

/**
 * Draws the original BG3 filler entry used by NORMAL metatiles.
 *
 * FireRed's DrawMetatile() writes 0x3014 into all four BG3 tilemap
 * positions for a NORMAL metatile. This represents four copies of
 * the same background tile entry, not a new metatile definition.
 */
function drawNormalBackgroundFiller(
    layer,
    imageWidth,
    imageHeight,
    mapX,
    mapY,
    primaryGraphics,
    secondaryGraphics,
    palettes,
    description
) {
    const entries = Buffer.alloc(8);

    for (let i = 0; i < 4; i++) {
        entries.writeUInt16LE(
            NORMAL_BACKGROUND_TILE_ENTRY,
            i * 2
        );
    }

    drawMetatileQuarter(
        layer,
        imageWidth,
        imageHeight,
        mapX,
        mapY,
        entries,
        0,
        primaryGraphics,
        secondaryGraphics,
        palettes,
        description
    );
}

/**
 * Resolves a metatile ID to its source definition and layer type.
 */
function getMetatileRecord(
    metatileId,
    primaryMetatiles,
    secondaryMetatiles,
    primaryAttributes,
    secondaryAttributes
) {
    if (
        metatileId < 0 ||
        metatileId >= TOTAL_METATILE_COUNT
    ) {
        throw new Error(
            `Invalid metatile ID: ${metatileId}`
        );
    }

    let data;
    let attributes;
    let localId;

    if (metatileId < activeRules.primaryMetatileCount) {
        data = primaryMetatiles;
        attributes = primaryAttributes;
        localId = metatileId;
    } else {
        data = secondaryMetatiles;
        attributes = secondaryAttributes;
        localId =
            metatileId - activeRules.primaryMetatileCount;
    }

    const metaOffset = localId * BYTES_PER_METATILE;

    if (
        data === null ||
        metaOffset + BYTES_PER_METATILE > data.length
    ) {
        throw new Error(
            `Metatile ${metatileId} is outside its definition data`
        );
    }

    const attributeBytes = activeRules.attributeBytes;
    const attributeOffset = localId * attributeBytes;

    if (
        attributes === null ||
        attributeOffset + attributeBytes > attributes.length
    ) {
        throw new Error(
            `Metatile ${metatileId} is outside its attribute data`
        );
    }

    const attributeWord = attributeBytes === 2
        ? attributes.readUInt16LE(attributeOffset)
        : attributes.readUInt32LE(attributeOffset);

    // Verified in the original fieldmap.c: layer type is bits 29-30.
    const layerType =
        (attributeWord & activeRules.layerTypeMask) >>>
        activeRules.layerTypeShift;

    if (
        layerType !== LAYER_TYPE_NORMAL &&
        layerType !== LAYER_TYPE_COVERED &&
        layerType !== LAYER_TYPE_SPLIT
    ) {
        throw new Error(
            `Unsupported metatile layer type ${layerType} ` +
            `for metatile ${metatileId}`
        );
    }

    return {
        entries: data.subarray(
            metaOffset,
            metaOffset + BYTES_PER_METATILE
        ),
        layerType
    };
}

/**
 * Composites the three original background layers from bottom to top.
 */
function compositeLayers(layers, width, height) {
    const png = new PNG({ width, height });

    for (let pixel = 0; pixel < width * height; pixel++) {
        const destination = pixel * 4;

        // The backdrop is black when no drawn BG pixel covers it.
        png.data[destination] = 0;
        png.data[destination + 1] = 0;
        png.data[destination + 2] = 0;
        png.data[destination + 3] = 255;

        // Bottom, middle, then top, matching the original BG order.
        for (const layer of layers) {
            const alpha = layer[destination + 3];

            if (alpha === 0) {
                continue;
            }

            png.data[destination] = layer[destination];
            png.data[destination + 1] = layer[destination + 1];
            png.data[destination + 2] = layer[destination + 2];
            png.data[destination + 3] = 255;
        }
    }

    return PNG.sync.write(png);
}

/**
 * Creates a clearly identifiable placeholder for layouts that cannot
 * be reconstructed because their source declares no primary tileset.
 *
 * This is not an authentic game-map rendering.
 */
function createPlaceholderPreview(layout, reason = null) {
    const width = layout.width * METATILE_SIZE;
    const height = layout.height * METATILE_SIZE;
    const png = new PNG({ width, height });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const offset = (y * width + x) * 4;

            const cellX = Math.floor(x / METATILE_SIZE);
            const cellY = Math.floor(y / METATILE_SIZE);
            const checker = (cellX + cellY) % 2 === 0;

            let color = checker
                ? [48, 49, 62]
                : [68, 69, 83];

            const diagonalA = Math.abs(
                y - x * (height - 1) / Math.max(1, width - 1)
            ) <= 2;

            const diagonalB = Math.abs(
                y - (height - 1) *
                    (1 - x / Math.max(1, width - 1))
            ) <= 2;

            const gridLine =
                x % METATILE_SIZE === 0 ||
                y % METATILE_SIZE === 0;

            const border =
                x < 3 ||
                y < 3 ||
                x >= width - 3 ||
                y >= height - 3;

            if (diagonalA || diagonalB) {
                color = [220, 85, 85];
            } else if (border) {
                color = [235, 175, 70];
            } else if (gridLine) {
                color = [110, 112, 130];
            }

            png.data[offset] = color[0];
            png.data[offset + 1] = color[1];
            png.data[offset + 2] = color[2];
            png.data[offset + 3] = 255;
        }
    }

    return {
        png: PNG.sync.write(png),
        width,
        height,
        missingGraphics: [],
        status: "placeholder",
        placeholderReason: reason ?? (
            "The source layout declares a NULL primary tileset. " +
            "This image is a diagnostic placeholder, not an authentic map."
        )
    };
}

function renderMap(manifest, layout, legacyManifest) {
    // A fresh list is collected for each rendered map.
    missingGraphicsRecords.clear();

    const legacyOverride =
        legacyManifest?.layoutOverrides?.[layout.id] ?? null;

    activeRules = legacyOverride
        ? RUBY_SAPPHIRE_RULES
        : FIRE_RED_RULES;

    if (
        legacyOverride !== null &&
        (
            !legacyManifest.tilesets[legacyOverride.primary] ||
            !legacyManifest.tilesets[legacyOverride.secondary]
        )
    ) {
        throw new Error(
            `Missing Ruby/Sapphire tileset resources for ${layout.id}`
        );
    }

    const primary = legacyOverride
        ? legacyManifest.tilesets[legacyOverride.primary]
        : loadResource(manifest, layout.primaryTileset);

    const secondary = legacyOverride
        ? legacyManifest.tilesets[legacyOverride.secondary]
        : layout.secondaryTileset === "NULL"
            ? null
            : loadResource(manifest, layout.secondaryTileset);

    const primaryGraphics = loadBinaryResource(
        primary,
        "tiles",
        layout.primaryTileset
    );

    const secondaryGraphics = secondary === null
        ? null
        : loadBinaryResource(
            secondary,
            "tiles",
            layout.secondaryTileset
        );

    const primaryMetatiles = loadBinaryResource(
        primary,
        "metatiles",
        layout.primaryTileset
    );

    const secondaryMetatiles = secondary === null
        ? null
        : loadBinaryResource(
            secondary,
            "metatiles",
            layout.secondaryTileset
        );

    const primaryAttributes = loadBinaryResource(
        primary,
        "attributes",
        layout.primaryTileset
    );

    const secondaryAttributes = secondary === null
        ? null
        : loadBinaryResource(
            secondary,
            "attributes",
            layout.secondaryTileset
        );

    const palettes = loadPaletteBanks(
        primary,
        secondary
    );

    if (
        secondaryMetatiles === null ||
        secondaryAttributes === null
    ) {
        throw new Error(
            "This preview renderer currently requires both primary " +
            "and secondary metatile resources."
        );
    }

    const mapData = readAsset(
        layout.assets.map,
        `${layout.id} map grid`
    );

    const expectedBytes =
        layout.width * layout.height * 2;

    if (mapData.length !== expectedBytes) {
        throw new Error(
            `${layout.id}: expected ${expectedBytes} map bytes, ` +
            `found ${mapData.length}`
        );
    }

    const width = layout.width * METATILE_SIZE;
    const height = layout.height * METATILE_SIZE;

    // layers[0] = BG3, layers[1] = BG1, layers[2] = BG2.
    const layers = [
        createLayer(width, height),
        createLayer(width, height),
        createLayer(width, height)
    ];

    for (let y = 0; y < layout.height; y++) {
        for (let x = 0; x < layout.width; x++) {
            const mapOffset = (y * layout.width + x) * 2;
            const mapWord = mapData.readUInt16LE(mapOffset);
            const metatileId = mapWord & 0x03FF;

            const record = getMetatileRecord(
                metatileId,
                primaryMetatiles,
                secondaryMetatiles,
                primaryAttributes,
                secondaryAttributes
            );

            const { entries, layerType } = record;

            const description =
                `${layout.id} at map cell (${x}, ${y}), ` +
                `metatile ${metatileId}`;

            if (layerType === LAYER_TYPE_NORMAL) {
                // Original FireRed: fill BG3 with 0x3014 first.
                drawNormalBackgroundFiller(
                    layers[0],
                    width,
                    height,
                    x,
                    y,
                    primaryGraphics,
                    secondaryGraphics,
                    palettes,
                    description
                );

                // Original FireRed: bottom four entries go to BG1.
                drawMetatileQuarter(
                    layers[1],
                    width,
                    height,
                    x,
                    y,
                    entries,
                    0,
                    primaryGraphics,
                    secondaryGraphics,
                    palettes,
                    description
                );

                // Original FireRed: top four entries go to BG2.
                drawMetatileQuarter(
                    layers[2],
                    width,
                    height,
                    x,
                    y,
                    entries,
                    4,
                    primaryGraphics,
                    secondaryGraphics,
                    palettes,
                    description
                );
            } else if (layerType === LAYER_TYPE_COVERED) {
                // Original FireRed: bottom four entries go to BG3.
                drawMetatileQuarter(
                    layers[0],
                    width,
                    height,
                    x,
                    y,
                    entries,
                    0,
                    primaryGraphics,
                    secondaryGraphics,
                    palettes,
                    description
                );

                // Original FireRed: top four entries go to BG1.
                drawMetatileQuarter(
                    layers[1],
                    width,
                    height,
                    x,
                    y,
                    entries,
                    4,
                    primaryGraphics,
                    secondaryGraphics,
                    palettes,
                    description
                );
            } else if (layerType === LAYER_TYPE_SPLIT) {
                // Original FireRed: bottom four entries go to BG3.
                drawMetatileQuarter(
                    layers[0],
                    width,
                    height,
                    x,
                    y,
                    entries,
                    0,
                    primaryGraphics,
                    secondaryGraphics,
                    palettes,
                    description
                );

                // Original FireRed: top four entries go to BG2.
                drawMetatileQuarter(
                    layers[2],
                    width,
                    height,
                    x,
                    y,
                    entries,
                    4,
                    primaryGraphics,
                    secondaryGraphics,
                    palettes,
                    description
                );
            }
        }
    }

    return {
        png: compositeLayers(layers, width, height),
        width,
        height,
        missingGraphics: [
            ...missingGraphicsRecords.values()
        ]
    };
}

function run() {
    requireFile(manifestPath, "Exported map manifest");

    const manifest = JSON.parse(
        fs.readFileSync(manifestPath, "utf8")
    );

    const legacyManifest = fs.existsSync(legacyManifestPath)
        ? JSON.parse(
            fs.readFileSync(legacyManifestPath, "utf8")
        )
        : null;

    const renderAll = process.argv[2] === "--all";

    const requestedId = renderAll
        ? null
        : process.argv[2] || "LAYOUT_PALLET_TOWN";

    let targets;

    if (renderAll) {
        targets = manifest.layouts;
    } else {
        const layout = manifest.layouts.find(
            entry => entry.id === requestedId
        );

        if (layout === undefined) {
            throw new Error(
                `Layout ${requestedId} was not found in the manifest.`
            );
        }

        targets = [layout];
    }

    const rendered = [];
    const failures = [];

    console.log();

    console.log(
        renderAll
            ? "Rendering all FireRed map layouts..."
            : "Rendering FireRed map preview..."
    );

    console.log(`Layouts to process: ${targets.length}`);
    console.log();

    for (let index = 0; index < targets.length; index++) {
        const layout = targets[index];

        try {
            const isUnverifiedRsPokemonCenter =
                layout.id === "LAYOUT_RS_POKEMON_CENTER_1F";

            const isPlaceholder =
                layout.primaryTileset === "NULL" ||
                isUnverifiedRsPokemonCenter;

            const result = isPlaceholder
                ? createPlaceholderPreview(
                    layout,
                    isUnverifiedRsPokemonCenter
                        ? "Unused legacy Ruby/Sapphire layout. Its compatible " +
                          "tileset and metatile definitions have not been " +
                          "verified, so this is a diagnostic placeholder, " +
                          "not an authentic map."
                        : null
                )
                : renderMap(
                    manifest,
                    layout,
                    legacyManifest
                );

            const outputRelative = `previews/${layout.id}.png`;

            const outputFile = path.join(
                assetRoot,
                ...outputRelative.split("/")
            );

            fs.mkdirSync(path.dirname(outputFile), {
                recursive: true
            });

            fs.writeFileSync(outputFile, result.png);

            rendered.push({
                id: layout.id,
                name: layout.name,
                sourceIndex: layout.sourceIndex,
                layoutWidth: layout.width,
                layoutHeight: layout.height,
                widthPixels: result.width,
                heightPixels: result.height,
                image: `assets/firered/maps/${outputRelative}`,
                missingGraphics: result.missingGraphics,
                status: result.status ?? "rendered",
                placeholderReason: result.placeholderReason ?? null
            });
        } catch (error) {
            if (renderAll === false) {
                throw error;
            }

            const failure = {
                id: layout.id,
                name: layout.name,
                message: error.message
            };

            failures.push(failure);

            console.error(
                `[FAILED] ${layout.id}: ${error.message}`
            );
        }

        const attempted = index + 1;

        if (
            attempted % 25 === 0 ||
            attempted === targets.length
        ) {
            console.log(
                `Progress: ${attempted}/${targets.length} | ` +
                `Generated: ${rendered.length} | ` +
                `Failed: ${failures.length}`
            );
        }
    }

    if (renderAll) {
        const previewManifest = {
            game: "firered",
            source: "pret/pokefirered",
            sourceLayoutCount: manifest.sourceLayoutCount,
            attemptedCount: targets.length,
            generatedImageCount: rendered.length,
            renderedCount: rendered.filter(
                entry => entry.status !== "placeholder"
            ).length,
            placeholderCount: rendered.filter(
                entry => entry.status === "placeholder"
            ).length,
            failedCount: failures.length,
            maps: rendered.sort(
                (a, b) => a.sourceIndex - b.sourceIndex
            ),
            failures
        };

        const manifestFile = path.join(
            assetRoot,
            "previews",
            "manifest.json"
        );

        fs.mkdirSync(path.dirname(manifestFile), {
            recursive: true
        });

        fs.writeFileSync(
            manifestFile,
            JSON.stringify(previewManifest, null, 2) + "\n",
            "utf8"
        );

        console.log();
        console.log("FireRed batch map rendering finished.");

        const placeholderCount = rendered.filter(
            entry => entry.status === "placeholder"
        ).length;

        console.log(`Layouts attempted: ${targets.length}`);
        console.log(`Images generated: ${rendered.length}`);

        console.log(
            `Maps rendered: ${rendered.length - placeholderCount}`
        );

        console.log(`Placeholders: ${placeholderCount}`);
        console.log(`Failures: ${failures.length}`);

        console.log(
            "Preview manifest: " +
            "assets/firered/maps/previews/manifest.json"
        );

        if (failures.length > 0) {
            console.log();
            console.log("Layouts requiring investigation:");

            for (const failure of failures) {
                console.log(
                    `- ${failure.id}: ${failure.message}`
                );
            }

            process.exitCode = 1;
        }

        console.log();
        return;
    }

    const result = rendered[0];

    console.log();

    if (result.status === "placeholder") {
        console.log(
            "Map placeholder generated; this is not an authentic rendering."
        );

        console.log(`Reason: ${result.placeholderReason}`);
    } else {
        console.log("FireRed map preview rendered.");
    }

    console.log(`Layout: ${result.id}`);

    console.log(
        `Dimensions: ${result.widthPixels} x ` +
        `${result.heightPixels} pixels`
    );

    console.log(`Output: ${result.image}`);

    if (result.missingGraphics.length > 0) {
        console.log(
            `Missing graphics fallbacks: ${result.missingGraphics.length}`
        );

        for (const missing of result.missingGraphics) {
            console.log(
                `- Tile ${missing.tileIndex} at ${missing.description} ` +
                `(${missing.reason})`
            );
        }
    }

    console.log();
}

try {
    run();
} catch (error) {
    console.error();
    console.error("FireRed map preview failed.");
    console.error(error.message);
    process.exitCode = 1;
}

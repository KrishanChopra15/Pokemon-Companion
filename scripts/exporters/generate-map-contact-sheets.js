
"use strict";

/**
 * Pokémon Companion
 * Map Preview Contact Sheet Generator
 *
 * Reads:
 *   assets/firered/maps/previews/manifest.json
 *
 * Creates:
 *   assets/firered/maps/contact-sheets/sheet-01.png
 *   assets/firered/maps/contact-sheets/sheet-02.png
 *   ...
 *   assets/firered/maps/contact-sheets/manifest.json
 *
 * Uses pngjs, which is already used by the map preview renderer.
 * No additional package is required.
 */

const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const projectRoot = path.resolve(__dirname, "../..");

const previewManifestPath = path.join(
    projectRoot,
    "assets",
    "firered",
    "maps",
    "previews",
    "manifest.json"
);

const outputDirectory = path.join(
    projectRoot,
    "assets",
    "firered",
    "maps",
    "contact-sheets"
);

// Layout of each contact sheet.
const COLUMNS = 4;
const ROWS = 6;
const MAPS_PER_SHEET = COLUMNS * ROWS;

// Card and sheet dimensions.
const MARGIN = 16;
const HEADER_HEIGHT = 42;
const CELL_WIDTH = 260;
const CELL_HEIGHT = 174;
const GAP = 12;
const CARD_PADDING = 8;

const THUMBNAIL_WIDTH = CELL_WIDTH - CARD_PADDING * 2;
const THUMBNAIL_HEIGHT = 116;

// Resulting sheets are approximately 1132 x 1164 pixels.
const SHEET_WIDTH =
    MARGIN * 2 +
    COLUMNS * CELL_WIDTH +
    (COLUMNS - 1) * GAP;

const SHEET_HEIGHT =
    HEADER_HEIGHT +
    ROWS * CELL_HEIGHT +
    (ROWS - 1) * GAP +
    MARGIN;

// Colors use RGB arrays.
const COLORS = {
    background: [23, 24, 30],
    card: [35, 36, 45],
    thumbnailBackground: [25, 26, 33],
    gridBorder: [76, 79, 94],
    placeholderBorder: [235, 174, 65],
    errorBorder: [235, 91, 91],
    text: [235, 237, 243],
    secondaryText: [171, 176, 190],
    placeholderText: [255, 199, 92],
    errorText: [255, 119, 119]
};

/**
 * Compact 5x7 bitmap font.
 *
 * Contact sheets use ASCII-only uppercase labels so they can be
 * generated without Canvas, SVG rendering, or system fonts.
 */
const FONT = {
    " ": [
        "00000",
        "00000",
        "00000",
        "00000",
        "00000",
        "00000",
        "00000"
    ],
    "A": [
        "01110",
        "10001",
        "10001",
        "11111",
        "10001",
        "10001",
        "10001"
    ],
    "B": [
        "11110",
        "10001",
        "10001",
        "11110",
        "10001",
        "10001",
        "11110"
    ],
    "C": [
        "01111",
        "10000",
        "10000",
        "10000",
        "10000",
        "10000",
        "01111"
    ],
    "D": [
        "11110",
        "10001",
        "10001",
        "10001",
        "10001",
        "10001",
        "11110"
    ],
    "E": [
        "11111",
        "10000",
        "10000",
        "11110",
        "10000",
        "10000",
        "11111"
    ],
    "F": [
        "11111",
        "10000",
        "10000",
        "11110",
        "10000",
        "10000",
        "10000"
    ],
    "G": [
        "01111",
        "10000",
        "10000",
        "10111",
        "10001",
        "10001",
        "01111"
    ],
    "H": [
        "10001",
        "10001",
        "10001",
        "11111",
        "10001",
        "10001",
        "10001"
    ],
    "I": [
        "11111",
        "00100",
        "00100",
        "00100",
        "00100",
        "00100",
        "11111"
    ],
    "J": [
        "00111",
        "00010",
        "00010",
        "00010",
        "10010",
        "10010",
        "01100"
    ],
    "K": [
        "10001",
        "10010",
        "10100",
        "11000",
        "10100",
        "10010",
        "10001"
    ],
    "L": [
        "10000",
        "10000",
        "10000",
        "10000",
        "10000",
        "10000",
        "11111"
    ],
    "M": [
        "10001",
        "11011",
        "10101",
        "10101",
        "10001",
        "10001",
        "10001"
    ],
    "N": [
        "10001",
        "11001",
        "11001",
        "10101",
        "10011",
        "10011",
        "10001"
    ],
    "O": [
        "01110",
        "10001",
        "10001",
        "10001",
        "10001",
        "10001",
        "01110"
    ],
    "P": [
        "11110",
        "10001",
        "10001",
        "11110",
        "10000",
        "10000",
        "10000"
    ],
    "Q": [
        "01110",
        "10001",
        "10001",
        "10001",
        "10101",
        "10010",
        "01101"
    ],
    "R": [
        "11110",
        "10001",
        "10001",
        "11110",
        "10100",
        "10010",
        "10001"
    ],
    "S": [
        "01111",
        "10000",
        "10000",
        "01110",
        "00001",
        "00001",
        "11110"
    ],
    "T": [
        "11111",
        "00100",
        "00100",
        "00100",
        "00100",
        "00100",
        "00100"
    ],
    "U": [
        "10001",
        "10001",
        "10001",
        "10001",
        "10001",
        "10001",
        "01110"
    ],
    "V": [
        "10001",
        "10001",
        "10001",
        "10001",
        "10001",
        "01010",
        "00100"
    ],
    "W": [
        "10001",
        "10001",
        "10001",
        "10101",
        "10101",
        "10101",
        "01010"
    ],
    "X": [
        "10001",
        "10001",
        "01010",
        "00100",
        "01010",
        "10001",
        "10001"
    ],
    "Y": [
        "10001",
        "10001",
        "01010",
        "00100",
        "00100",
        "00100",
        "00100"
    ],
    "Z": [
        "11111",
        "00001",
        "00010",
        "00100",
        "01000",
        "10000",
        "11111"
    ],
    "0": [
        "01110",
        "10001",
        "10011",
        "10101",
        "11001",
        "10001",
        "01110"
    ],
    "1": [
        "00100",
        "01100",
        "00100",
        "00100",
        "00100",
        "00100",
        "01110"
    ],
    "2": [
        "01110",
        "10001",
        "00001",
        "00010",
        "00100",
        "01000",
        "11111"
    ],
    "3": [
        "11110",
        "00001",
        "00001",
        "01110",
        "00001",
        "00001",
        "11110"
    ],
    "4": [
        "00010",
        "00110",
        "01010",
        "10010",
        "11111",
        "00010",
        "00010"
    ],
    "5": [
        "11111",
        "10000",
        "10000",
        "11110",
        "00001",
        "00001",
        "11110"
    ],
    "6": [
        "01110",
        "10000",
        "10000",
        "11110",
        "10001",
        "10001",
        "01110"
    ],
    "7": [
        "11111",
        "00001",
        "00010",
        "00100",
        "01000",
        "01000",
        "01000"
    ],
    "8": [
        "01110",
        "10001",
        "10001",
        "01110",
        "10001",
        "10001",
        "01110"
    ],
    "9": [
        "01110",
        "10001",
        "10001",
        "01111",
        "00001",
        "00001",
        "01110"
    ],
    "_": [
        "00000",
        "00000",
        "00000",
        "00000",
        "00000",
        "00000",
        "11111"
    ],
    "-": [
        "00000",
        "00000",
        "00000",
        "11111",
        "00000",
        "00000",
        "00000"
    ],
    ".": [
        "00000",
        "00000",
        "00000",
        "00000",
        "00000",
        "00110",
        "00110"
    ],
    ":": [
        "00000",
        "00110",
        "00110",
        "00000",
        "00110",
        "00110",
        "00000"
    ]
};

function requireFile(file, description) {
    if (!fs.existsSync(file)) {
        throw new Error(`${description} not found: ${file}`);
    }
}

function fillRect(png, x, y, width, height, color) {
    const startX = Math.max(0, Math.floor(x));
    const startY = Math.max(0, Math.floor(y));
    const endX = Math.min(png.width, Math.ceil(x + width));
    const endY = Math.min(png.height, Math.ceil(y + height));

    for (let py = startY; py < endY; py++) {
        for (let px = startX; px < endX; px++) {
            const offset = (py * png.width + px) * 4;

            png.data[offset] = color[0];
            png.data[offset + 1] = color[1];
            png.data[offset + 2] = color[2];
            png.data[offset + 3] = 255;
        }
    }
}

function strokeRect(png, x, y, width, height, color, thickness = 1) {
    fillRect(png, x, y, width, thickness, color);
    fillRect(png, x, y + height - thickness, width, thickness, color);
    fillRect(png, x, y, thickness, height, color);
    fillRect(png, x + width - thickness, y, thickness, height, color);
}

function drawText(png, value, x, y, color, maxWidth) {
    const normalized = String(value)
        .toUpperCase()
        .replace(/[^A-Z0-9 _.-]/g, " ");

    const maxCharacters = Math.max(
        0,
        Math.floor((maxWidth + 1) / 6)
    );

    let text = normalized;

    if (text.length > maxCharacters) {
        text = maxCharacters > 0
            ? text.slice(0, maxCharacters - 1) + "."
            : "";
    }

    let cursorX = x;

    for (const character of text) {
        const glyph = FONT[character] || FONT[" "];

        for (let row = 0; row < 7; row++) {
            for (let column = 0; column < 5; column++) {
                if (glyph[row][column] !== "1") {
                    continue;
                }

                const px = cursorX + column;
                const py = y + row;

                if (
                    px < 0 ||
                    py < 0 ||
                    px >= png.width ||
                    py >= png.height
                ) {
                    continue;
                }

                const offset = (py * png.width + px) * 4;

                png.data[offset] = color[0];
                png.data[offset + 1] = color[1];
                png.data[offset + 2] = color[2];
                png.data[offset + 3] = 255;
            }
        }

        cursorX += 6;
    }
}

function drawImageContain(
    destination,
    image,
    x,
    y,
    maxWidth,
    maxHeight,
    background
) {
    fillRect(
        destination,
        x,
        y,
        maxWidth,
        maxHeight,
        background
    );

    const scale = Math.min(
        maxWidth / image.width,
        maxHeight / image.height
    );

    const drawWidth = Math.max(
        1,
        Math.floor(image.width * scale)
    );

    const drawHeight = Math.max(
        1,
        Math.floor(image.height * scale)
    );

    const offsetX = Math.floor(
        x + (maxWidth - drawWidth) / 2
    );

    const offsetY = Math.floor(
        y + (maxHeight - drawHeight) / 2
    );

    // Nearest-neighbor scaling preserves pixel-art edges.
    for (let dy = 0; dy < drawHeight; dy++) {
        const sourceY = Math.min(
            image.height - 1,
            Math.floor((dy * image.height) / drawHeight)
        );

        for (let dx = 0; dx < drawWidth; dx++) {
            const sourceX = Math.min(
                image.width - 1,
                Math.floor((dx * image.width) / drawWidth)
            );

            const sourceOffset =
                (sourceY * image.width + sourceX) * 4;

            const targetX = offsetX + dx;
            const targetY = offsetY + dy;

            const targetOffset =
                (targetY * destination.width + targetX) * 4;

            const alpha = image.data[sourceOffset + 3] / 255;

            for (let channel = 0; channel < 3; channel++) {
                destination.data[targetOffset + channel] = Math.round(
                    image.data[sourceOffset + channel] * alpha +
                    background[channel] * (1 - alpha)
                );
            }

            destination.data[targetOffset + 3] = 255;
        }
    }
}

function getSafeImagePath(relativePath) {
    if (typeof relativePath !== "string" || relativePath.length === 0) {
        throw new Error("Preview manifest entry has no image path.");
    }

    const imagePath = path.resolve(projectRoot, relativePath);

    if (
        imagePath !== projectRoot &&
        !imagePath.startsWith(projectRoot + path.sep)
    ) {
        throw new Error(`Image path escapes project root: ${relativePath}`);
    }

    return imagePath;
}

function getMapStatus(entry, imageError) {
    if (imageError) {
        return "IMAGE ERROR";
    }

    if (entry.status === "placeholder") {
        return "PLACEHOLDER";
    }

    if (
        Array.isArray(entry.missingGraphics) &&
        entry.missingGraphics.length > 0
    ) {
        return "MISSING GRAPHICS";
    }

    return "RENDERED";
}

function createSheetHeader(sheet, sheetNumber, totalSheets, totalMaps) {
    fillRect(
        sheet,
        0,
        0,
        SHEET_WIDTH,
        HEADER_HEIGHT,
        COLORS.background
    );

    const number = String(sheetNumber).padStart(2, "0");
    const total = String(totalSheets).padStart(2, "0");

    drawText(
        sheet,
        `FIRERED MAP PREVIEWS - SHEET ${number}/${total}`,
        MARGIN,
        10,
        COLORS.text,
        SHEET_WIDTH - MARGIN * 2
    );

    drawText(
        sheet,
        `${totalMaps} MAPS TOTAL - PLACEHOLDERS AND ERRORS ARE MARKED`,
        MARGIN,
        25,
        COLORS.secondaryText,
        SHEET_WIDTH - MARGIN * 2
    );
}

function renderMapCard(sheet, entry, index, pageNumber, issues) {
    const localIndex = index % MAPS_PER_SHEET;

    const column = localIndex % COLUMNS;
    const row = Math.floor(localIndex / COLUMNS);

    const cardX = MARGIN + column * (CELL_WIDTH + GAP);
    const cardY = HEADER_HEIGHT + row * (CELL_HEIGHT + GAP);

    let sourceImage = null;
    let imageError = null;

    try {
        const imagePath = getSafeImagePath(entry.image);
        requireFile(imagePath, `Preview for ${entry.id}`);

        sourceImage = PNG.sync.read(
            fs.readFileSync(imagePath)
        );
    } catch (error) {
        imageError = error.message;

        issues.push({
            id: entry.id,
            image: entry.image ?? null,
            message: error.message
        });
    }

    const status = getMapStatus(entry, imageError);

    const borderColor =
        status === "PLACEHOLDER"
            ? COLORS.placeholderBorder
            : status === "IMAGE ERROR"
                ? COLORS.errorBorder
                : status === "MISSING GRAPHICS"
                    ? COLORS.placeholderBorder
                    : COLORS.gridBorder;

    strokeRect(
        sheet,
        cardX,
        cardY,
        CELL_WIDTH,
        CELL_HEIGHT,
        borderColor,
        2
    );

    fillRect(
        sheet,
        cardX + 2,
        cardY + 2,
        CELL_WIDTH - 4,
        CELL_HEIGHT - 4,
        COLORS.card
    );

    const thumbnailX = cardX + CARD_PADDING;
    const thumbnailY = cardY + CARD_PADDING;

    if (sourceImage) {
        drawImageContain(
            sheet,
            sourceImage,
            thumbnailX,
            thumbnailY,
            THUMBNAIL_WIDTH,
            THUMBNAIL_HEIGHT,
            COLORS.thumbnailBackground
        );
    } else {
        fillRect(
            sheet,
            thumbnailX,
            thumbnailY,
            THUMBNAIL_WIDTH,
            THUMBNAIL_HEIGHT,
            COLORS.thumbnailBackground
        );

        drawText(
            sheet,
            "IMAGE ERROR",
            thumbnailX + 8,
            thumbnailY + Math.floor(THUMBNAIL_HEIGHT / 2) - 3,
            COLORS.errorText,
            THUMBNAIL_WIDTH - 16
        );
    }

    // The layout ID is shown beneath the thumbnail.
    const titleY = cardY + 132;

    drawText(
        sheet,
        entry.id || "UNKNOWN LAYOUT",
        cardX + CARD_PADDING,
        titleY,
        COLORS.text,
        CELL_WIDTH - CARD_PADDING * 2
    );

    const missingCount = Array.isArray(entry.missingGraphics)
        ? entry.missingGraphics.length
        : 0;

    const dimensions =
        entry.widthPixels && entry.heightPixels
            ? `${entry.widthPixels}X${entry.heightPixels}`
            : sourceImage
                ? `${sourceImage.width}X${sourceImage.height}`
                : "UNKNOWN SIZE";

    let detail = `${status} ${dimensions}`;

    if (missingCount > 0) {
        detail += ` MISSING ${missingCount}`;
    }

    const detailColor =
        status === "IMAGE ERROR"
            ? COLORS.errorText
            : status === "PLACEHOLDER" ||
              status === "MISSING GRAPHICS"
                ? COLORS.placeholderText
                : COLORS.secondaryText;

    drawText(
        sheet,
        detail,
        cardX + CARD_PADDING,
        cardY + 147,
        detailColor,
        CELL_WIDTH - CARD_PADDING * 2
    );

    return {
        id: entry.id,
        sourceIndex: entry.sourceIndex ?? null,
        sheet: `sheet-${String(pageNumber).padStart(2, "0")}.png`,
        row: row + 1,
        column: column + 1,
        status,
        sourceImage: entry.image ?? null,
        widthPixels: entry.widthPixels ?? sourceImage?.width ?? null,
        heightPixels: entry.heightPixels ?? sourceImage?.height ?? null,
        missingGraphicsCount: missingCount,
        placeholderReason: entry.placeholderReason ?? null,
        imageError
    };
}

function main() {
    requireFile(
        previewManifestPath,
        "Map preview manifest"
    );

    const previewManifest = JSON.parse(
        fs.readFileSync(previewManifestPath, "utf8")
    );

    if (!Array.isArray(previewManifest.maps)) {
        throw new Error(
            "Preview manifest does not contain a valid maps array."
        );
    }

    const maps = [...previewManifest.maps].sort(
        (a, b) => (a.sourceIndex ?? 0) - (b.sourceIndex ?? 0)
    );

    fs.mkdirSync(outputDirectory, {
        recursive: true
    });

    // Remove old generated sheets so a smaller new batch cannot
    // leave stale contact-sheet images from a previous run.
    for (const file of fs.readdirSync(outputDirectory)) {
        if (/^sheet-\d+\.png$/i.test(file)) {
            fs.unlinkSync(path.join(outputDirectory, file));
        }
    }

    const totalMaps = maps.length;

    const totalSheets = Math.ceil(
        totalMaps / MAPS_PER_SHEET
    );

    const issues = [];
    const sheetEntries = [];
    const mapEntries = [];

    console.log();
    console.log("Generating FireRed map contact sheets...");
    console.log(`Map previews: ${totalMaps}`);
    console.log(`Maps per sheet: ${MAPS_PER_SHEET}`);
    console.log(`Contact sheets: ${totalSheets}`);
    console.log();

    for (
        let pageIndex = 0;
        pageIndex < totalSheets;
        pageIndex++
    ) {
        const pageNumber = pageIndex + 1;
        const firstMapIndex = pageIndex * MAPS_PER_SHEET;
        const pageMaps = maps.slice(
            firstMapIndex,
            firstMapIndex + MAPS_PER_SHEET
        );

        const sheet = new PNG({
            width: SHEET_WIDTH,
            height: SHEET_HEIGHT
        });

        fillRect(
            sheet,
            0,
            0,
            SHEET_WIDTH,
            SHEET_HEIGHT,
            COLORS.background
        );

        createSheetHeader(
            sheet,
            pageNumber,
            totalSheets,
            totalMaps
        );

        const firstId = pageMaps[0]?.id ?? null;
        const lastId = pageMaps[pageMaps.length - 1]?.id ?? null;

        for (let localIndex = 0; localIndex < pageMaps.length; localIndex++) {
            const globalIndex = firstMapIndex + localIndex;

            const mapEntry = renderMapCard(
                sheet,
                pageMaps[localIndex],
                globalIndex,
                pageNumber,
                issues
            );

            mapEntries.push(mapEntry);
        }

        const sheetName =
            `sheet-${String(pageNumber).padStart(2, "0")}.png`;

        const sheetPath = path.join(
            outputDirectory,
            sheetName
        );

        fs.writeFileSync(
            sheetPath,
            PNG.sync.write(sheet)
        );

        sheetEntries.push({
            sheet: sheetName,
            image: `assets/firered/maps/contact-sheets/${sheetName}`,
            width: SHEET_WIDTH,
            height: SHEET_HEIGHT,
            mapCount: pageMaps.length,
            firstLayoutId: firstId,
            lastLayoutId: lastId
        });

        console.log(
            `Generated ${sheetName} ` +
            `(${pageMaps.length} map previews)`
        );
    }

    const placeholderCount = mapEntries.filter(
        entry => entry.status === "PLACEHOLDER"
    ).length;

    const missingGraphicsCount = mapEntries.filter(
        entry => entry.status === "MISSING GRAPHICS"
    ).length;

    const errorCount = mapEntries.filter(
        entry => entry.status === "IMAGE ERROR"
    ).length;

    const outputManifest = {
        game: "firered",
        generatedAt: new Date().toISOString(),
        sourceManifest:
            "assets/firered/maps/previews/manifest.json",
        totalMaps,
        mapsPerSheet: MAPS_PER_SHEET,
        columns: COLUMNS,
        rows: ROWS,
        sheetCount: totalSheets,
        placeholderCount,
        mapsWithMissingGraphics: missingGraphicsCount,
        imageErrors: errorCount,
        sheets: sheetEntries,
        maps: mapEntries,
        issues
    };

    const outputManifestPath = path.join(
        outputDirectory,
        "manifest.json"
    );

    fs.writeFileSync(
        outputManifestPath,
        JSON.stringify(outputManifest, null, 2) + "\n",
        "utf8"
    );

    console.log();
    console.log("Contact-sheet generation finished.");
    console.log(`Maps listed: ${totalMaps}`);
    console.log(`Sheets generated: ${totalSheets}`);
    console.log(`Placeholders: ${placeholderCount}`);
    console.log(`Maps with missing graphics: ${missingGraphicsCount}`);
    console.log(`Image errors: ${errorCount}`);
    console.log(
        "Output folder: assets/firered/maps/contact-sheets/"
    );
    console.log(
        "Index manifest: assets/firered/maps/contact-sheets/manifest.json"
    );
    console.log();

    if (issues.length > 0) {
        console.log("Images requiring investigation:");

        for (const issue of issues) {
            console.log(`- ${issue.id}: ${issue.message}`);
        }

        console.log();
    }
}

try {
    main();
} catch (error) {
    console.error();
    console.error("Contact-sheet generation failed.");
    console.error(error.stack || error.message);
    process.exitCode = 1;
}

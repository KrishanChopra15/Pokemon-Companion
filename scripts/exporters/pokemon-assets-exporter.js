
/**
 * Pokémon Companion
 * FireRed Pokémon Asset Exporter
 *
 * Copies original Pokémon PNG assets and generates shiny
 * front/back sprites using the original FireRed shiny palettes.
 *
 * Preserves alternate forms and records all paths in a manifest.
 * Does not download assets or modify frontend files.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "../..");

const sourceRoot = path.resolve(
    projectRoot,
    "..",
    "References",
    "pokefirered",
    "graphics",
    "pokemon"
);

const speciesFile = path.join(
    projectRoot,
    "database",
    "generated",
    "firered",
    "pokemon-species.json"
);

const outputRoot = path.join(
    projectRoot,
    "assets",
    "firered",
    "pokemon"
);

const PNG_SIGNATURE = Buffer.from([
    0x89, 0x50, 0x4E, 0x47,
    0x0D, 0x0A, 0x1A, 0x0A
]);

// Default forms used when the species folder does not contain
// its own front.png, back.png, or icon.png.
const defaultForms = {
    unown: "a",
    castform: "normal"
};

const primaryAssets = [
    { name: "front", filename: "front.png", output: "sprites/front" },
    { name: "back", filename: "back.png", output: "sprites/back" },
    { name: "icon", filename: "icon.png", output: "icons" },
    { name: "footprint", filename: "footprint.png", output: "footprints" }
];

const variantAssets = {
    "front.png": "front",
    "back.png": "back",
    "icon.png": "icon",
    "footprint.png": "footprint"
};

// PNG chunk CRC table.
const CRC_TABLE = (() => {
    const table = new Uint32Array(256);

    for (let i = 0; i < 256; i++) {
        let value = i;

        for (let bit = 0; bit < 8; bit++) {
            value = (value & 1)
                ? (0xEDB88320 ^ (value >>> 1))
                : (value >>> 1);
        }

        table[i] = value >>> 0;
    }

    return table;
})();

function crc32(buffer) {
    let crc = 0xFFFFFFFF;

    for (const byte of buffer) {
        crc = CRC_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
    }

    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createPngChunk(type, data) {
    const typeBuffer = Buffer.from(type, "ascii");
    const chunk = Buffer.alloc(data.length + 12);

    chunk.writeUInt32BE(data.length, 0);
    typeBuffer.copy(chunk, 4);
    data.copy(chunk, 8);

    const checksumInput = chunk.subarray(4, 8 + data.length);
    chunk.writeUInt32BE(
        crc32(checksumInput),
        8 + data.length
    );

    return chunk;
}

function requirePath(targetPath, description) {
    if (!fs.existsSync(targetPath)) {
        throw new Error(`${description} not found: ${targetPath}`);
    }
}

/**
 * Resolves a path relative to the exported Pokémon asset directory.
 */
function getOutputPath(relativePath) {
    return path.join(
        outputRoot,
        ...relativePath.split("/")
    );
}

function copyPng(sourcePath, relativePath) {
    requirePath(sourcePath, "Source image");

    const targetPath = getOutputPath(relativePath);

    fs.mkdirSync(path.dirname(targetPath), {
        recursive: true
    });

    fs.copyFileSync(sourcePath, targetPath);

    return relativePath;
}

/**
 * Decompresses a GBA BIOS-style 0x10 LZ77 stream.
 * Used only if a palette is available in compressed form.
 */
function decompressGbaLz77(input, description) {
    if (input.length < 4 || input[0] !== 0x10) {
        throw new Error(
            `Invalid GBA LZ77 data: ${description}`
        );
    }

    const outputSize =
        input[1] |
        (input[2] << 8) |
        (input[3] << 16);

    if (outputSize <= 0) {
        throw new Error(
            `Invalid decompressed size: ${description}`
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
                        `Unexpected end of compressed data: ${description}`
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

/**
 * Finds the nearest palette, looking from the form directory
 * up to its species directory.
 *
 * This lets forms such as Castform use their own palette,
 * while forms such as Unown can inherit the species palette.
 */
function findPaletteFile(
    startDirectory,
    speciesDirectory,
    paletteName
) {
    let current = path.resolve(startDirectory);
    const speciesRoot = path.resolve(speciesDirectory);

    while (
        current === speciesRoot ||
        current.startsWith(speciesRoot + path.sep)
    ) {
        const plainPalette = path.join(
            current,
            `${paletteName}.gbapal`
        );

        const compressedPalette = path.join(
            current,
            `${paletteName}.gbapal.lz`
        );

        if (fs.existsSync(plainPalette)) {
            return plainPalette;
        }

        if (fs.existsSync(compressedPalette)) {
            return compressedPalette;
        }

        if (current === speciesRoot) {
            break;
        }

        current = path.dirname(current);
    }

    return null;
}

/**
 * Converts an original FireRed/GBA palette into RGB values.
 *
 * Each palette entry is a little-endian RGB555 color.
 */
function readGbaPalette(palettePath) {
    let data = fs.readFileSync(palettePath);

    if (palettePath.endsWith(".lz")) {
        data = decompressGbaLz77(data, palettePath);
    }

    if (data.length !== 32) {
        throw new Error(
            `Expected a 32-byte, 16-color palette: ${palettePath}. ` +
            `Found ${data.length} bytes.`
        );
    }

    const colors = [];

    for (let i = 0; i < 16; i++) {
        const value = data.readUInt16LE(i * 2);

        const red5 = value & 0x1F;
        const green5 = (value >>> 5) & 0x1F;
        const blue5 = (value >>> 10) & 0x1F;

        // Expand each 5-bit GBA channel into an 8-bit PNG channel.
        const red = (red5 << 3) | (red5 >>> 2);
        const green = (green5 << 3) | (green5 >>> 2);
        const blue = (blue5 << 3) | (blue5 >>> 2);

        colors.push([red, green, blue]);
    }

    return colors;
}

/**
 * Replaces the PLTE chunk of an indexed PNG with the given
 * GBA palette. Every other PNG chunk is preserved.
 *
 * The original indexed pixel data and transparency information
 * are not modified.
 */
function createShinyPng(sourcePath, palettePath) {
    const png = fs.readFileSync(sourcePath);

    if (
        png.length < 8 ||
        !png.subarray(0, 8).equals(PNG_SIGNATURE)
    ) {
        throw new Error(`Invalid PNG file: ${sourcePath}`);
    }

    // Indexed-color PNGs are required for this palette operation.
    if (png[25] !== 3) {
        throw new Error(
            `Expected an indexed-color PNG: ${sourcePath}. ` +
            `Color type was ${png[25]}.`
        );
    }

    const colors = readGbaPalette(palettePath);
    const chunks = [];

    let offset = 8;
    let paletteReplaced = false;

    while (offset < png.length) {
        if (offset + 12 > png.length) {
            throw new Error(
                `Incomplete PNG chunk: ${sourcePath}`
            );
        }

        const dataLength = png.readUInt32BE(offset);
        const chunkEnd = offset + dataLength + 12;

        if (chunkEnd > png.length) {
            throw new Error(
                `PNG chunk exceeds file bounds: ${sourcePath}`
            );
        }

        const type = png.toString(
            "ascii",
            offset + 4,
            offset + 8
        );

        if (type === "PLTE") {
            if (paletteReplaced) {
                throw new Error(
                    `PNG contains multiple PLTE chunks: ${sourcePath}`
                );
            }

            const originalPaletteLength = dataLength;

            if (
                originalPaletteLength === 0 ||
                originalPaletteLength % 3 !== 0
            ) {
                throw new Error(
                    `Invalid PNG color table: ${sourcePath}`
                );
            }

            const colorCount = originalPaletteLength / 3;

            if (colorCount > colors.length) {
                throw new Error(
                    `PNG requires ${colorCount} colors but its ` +
                    `GBA palette has only ${colors.length}: ${sourcePath}`
                );
            }

            const paletteData = Buffer.alloc(
                originalPaletteLength
            );

            for (let i = 0; i < colorCount; i++) {
                const [red, green, blue] = colors[i];

                paletteData[i * 3] = red;
                paletteData[i * 3 + 1] = green;
                paletteData[i * 3 + 2] = blue;
            }

            chunks.push(
                createPngChunk("PLTE", paletteData)
            );

            paletteReplaced = true;
        } else {
            // Keep original bytes and CRCs for all unchanged chunks.
            chunks.push(png.subarray(offset, chunkEnd));
        }

        offset = chunkEnd;

        if (type === "IEND") {
            break;
        }
    }

    if (!paletteReplaced) {
        throw new Error(
            `PNG has no PLTE color table: ${sourcePath}`
        );
    }

    // Preserve any trailing bytes if present.
    if (offset < png.length) {
        chunks.push(png.subarray(offset));
    }

    return Buffer.concat([
        png.subarray(0, 8),
        ...chunks
    ]);
}

function writeShinyPng(
    sourcePath,
    palettePath,
    relativePath
) {
    const targetPath = getOutputPath(relativePath);

    fs.mkdirSync(path.dirname(targetPath), {
        recursive: true
    });

    const shinyPng = createShinyPng(
        sourcePath,
        palettePath
    );

    fs.writeFileSync(targetPath, shinyPng);

    return relativePath;
}

function getSpeciesFolder(species) {
    if (
        typeof species.constant !== "string" ||
        !species.constant.startsWith("SPECIES_")
    ) {
        throw new Error(
            `Invalid species constant: ${JSON.stringify(species.constant)}`
        );
    }

    return species.constant
        .replace(/^SPECIES_/, "")
        .toLowerCase();
}

/**
 * Copies PNGs in alternate-form directories and generates
 * shiny front/back variants when those sprites are present.
 */
function exportForms(
    sourceDirectory,
    dex,
    forms,
    counts
) {
    let copied = 0;

    function visit(directory, relativeDirectories) {
        const entries = fs.readdirSync(directory, {
            withFileTypes: true
        });

        entries.sort((a, b) => a.name.localeCompare(b.name));

        for (const entry of entries) {
            const sourcePath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                visit(sourcePath, [
                    ...relativeDirectories,
                    entry.name
                ]);
                continue;
            }

            if (relativeDirectories.length === 0) {
                continue;
            }

            const assetName = variantAssets[entry.name];

            if (!assetName) {
                continue;
            }

            const formName = relativeDirectories.join("/");

            const relativePath = [
                "forms",
                dex,
                ...relativeDirectories,
                entry.name
            ].join("/");

            copyPng(sourcePath, relativePath);

            if (!forms[formName]) {
                forms[formName] = {};
            }

            forms[formName][assetName] = relativePath;
            copied++;

            if (assetName !== "front" && assetName !== "back") {
                continue;
            }

            const palettePath = findPaletteFile(
                directory,
                sourceDirectory,
                "shiny"
            );

            if (!palettePath) {
                throw new Error(
                    `Missing shiny palette for form ${formName} ` +
                    `of Pokédex ${dex}.`
                );
            }

            const shinyRelativePath = [
                "forms",
                dex,
                ...relativeDirectories,
                "shiny",
                entry.name
            ].join("/");

            writeShinyPng(
                sourcePath,
                palettePath,
                shinyRelativePath
            );

            if (!forms[formName].shiny) {
                forms[formName].shiny = {};
            }

            forms[formName].shiny[assetName] =
                shinyRelativePath;

            counts.shinyVariants++;
        }
    }

    visit(sourceDirectory, []);

    return copied;
}

function run() {
    requirePath(sourceRoot, "FireRed graphics source");
    requirePath(speciesFile, "Generated species database");

    const species = JSON.parse(
        fs.readFileSync(speciesFile, "utf8")
    );

    if (!Array.isArray(species)) {
        throw new Error(
            "The generated species database must contain an array."
        );
    }

    fs.mkdirSync(outputRoot, { recursive: true });

    const seenDexNumbers = new Set();
    const manifestEntries = [];

    const counts = {
        front: 0,
        back: 0,
        icon: 0,
        footprint: 0,
        shinyFront: 0,
        shinyBack: 0,
        variants: 0,
        shinyVariants: 0
    };

    for (const pokemon of species) {
        const dexNumber = Number(pokemon.nationalDexNumber);

        if (
            !Number.isInteger(dexNumber) ||
            dexNumber < 1 ||
            dexNumber > 999
        ) {
            throw new Error(
                `Invalid National Pokédex number for ${pokemon.name}.`
            );
        }

        const dex = String(dexNumber).padStart(3, "0");

        if (seenDexNumbers.has(dex)) {
            throw new Error(
                `Duplicate National Pokédex number: ${dex}`
            );
        }

        seenDexNumbers.add(dex);

        const folder = getSpeciesFolder(pokemon);
        const sourceDirectory = path.join(sourceRoot, folder);

        requirePath(
            sourceDirectory,
            `Graphics folder for ${pokemon.name}`
        );

        const defaultForm = defaultForms[folder] || null;
        const exportedAssets = {};
        const shinyAssets = {};

        for (const asset of primaryAssets) {
            const candidates = [
                path.join(sourceDirectory, asset.filename)
            ];

            if (defaultForm) {
                candidates.push(
                    path.join(
                        sourceDirectory,
                        defaultForm,
                        asset.filename
                    )
                );
            }

            const sourcePath = candidates.find(
                candidate => fs.existsSync(candidate)
            );

            if (!sourcePath) {
                throw new Error(
                    `Missing ${asset.filename} for ${pokemon.name}. ` +
                    `Checked the species folder and its default form.`
                );
            }

            const relativePath = [
                asset.output,
                `${dex}.png`
            ].join("/");

            exportedAssets[asset.name] = copyPng(
                sourcePath,
                relativePath
            );

            counts[asset.name]++;

            if (asset.name !== "front" && asset.name !== "back") {
                continue;
            }

            const palettePath = findPaletteFile(
                path.dirname(sourcePath),
                sourceDirectory,
                "shiny"
            );

            if (!palettePath) {
                throw new Error(
                    `Missing shiny palette for ${pokemon.name}.`
                );
            }

            const shinyRelativePath = [
                "sprites",
                "shiny",
                asset.name,
                `${dex}.png`
            ].join("/");

            shinyAssets[asset.name] = writeShinyPng(
                sourcePath,
                palettePath,
                shinyRelativePath
            );

            counts[
                asset.name === "front"
                    ? "shinyFront"
                    : "shinyBack"
            ]++;
        }

        const forms = {};

        counts.variants += exportForms(
            sourceDirectory,
            dex,
            forms,
            counts
        );

        exportedAssets.shiny = shinyAssets;

        manifestEntries.push({
            id: pokemon.id,
            nationalDexNumber: pokemon.nationalDexNumber,
            dexNumber,
            name: pokemon.name,
            sourceFolder: folder,
            defaultForm,
            assets: exportedAssets,
            forms
        });
    }

    manifestEntries.sort(
        (a, b) => a.dexNumber - b.dexNumber
    );

    const manifest = {
        game: "firered",
        source: "pret/pokefirered",
        speciesCount: manifestEntries.length,
        pokemon: manifestEntries
    };

    fs.writeFileSync(
        path.join(outputRoot, "manifest.json"),
        JSON.stringify(manifest, null, 2) + "\n",
        "utf8"
    );

    console.log();
    console.log("FireRed Pokémon assets exported.");
    console.log(`Species: ${manifestEntries.length}`);
    console.log(`Front sprites: ${counts.front}`);
    console.log(`Back sprites: ${counts.back}`);
    console.log(`Icons: ${counts.icon}`);
    console.log(`Footprints: ${counts.footprint}`);
    console.log(`Shiny front sprites: ${counts.shinyFront}`);
    console.log(`Shiny back sprites: ${counts.shinyBack}`);
    console.log(`Form images: ${counts.variants}`);
    console.log(`Shiny form sprites: ${counts.shinyVariants}`);
    console.log("Manifest: assets/firered/pokemon/manifest.json");
    console.log();
}

try {
    run();
} catch (error) {
    console.error();
    console.error("Pokémon asset export failed.");
    console.error(error.message);
    process.exitCode = 1;
}

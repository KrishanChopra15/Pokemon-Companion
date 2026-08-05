const fs = require("fs");
const path = require("path");

/**
 * Returns true if a file exists.
 *
 * @param {string} filePath
 * @returns {boolean}
 */
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

/**
 * Reads a JSON file.
 *
 * @param {string} filePath
 * @returns {*}
 */
function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const { loadJSONFile } = require("./json");

/**
 * Returns the number of entries inside a JSON value.
 *
 * Arrays  -> length
 * Objects -> number of keys
 * Other   -> 1
 *
 * @param {*} value
 * @returns {number}
 */
function getEntryCount(value) {
    if (Array.isArray(value)) {
        return value.length;
    }

    if (value && typeof value === "object") {
        return Object.keys(value).length;
    }

    return 1;
}

/**
 * Returns the size of a file in bytes.
 *
 * @param {string} filePath
 * @returns {number}
 */
function getFileSize(filePath) {
    return fs.statSync(filePath).size;
}

/**
 * Builds manifest information for a JSON file.
 *
 * @param {string} baseDirectory
 * @param {{ key: string, file: string }} definition
 * @returns {{
 *     key: string,
 *     file: string,
 *     entries: number,
 *     bytes: number
 * }}
 */
function getManifestEntry(baseDirectory, definition) {
    const filePath = path.join(baseDirectory, definition.file);

    if (!fileExists(filePath)) {
        throw new Error(`Manifest file not found: ${filePath}`);
    }

    const json = loadJSONFile(filePath);

    return {
        key: definition.key,
        file: definition.file,
        entries: getEntryCount(json),
        bytes: getFileSize(filePath)
    };
}

/**
 * Builds an object of manifest entries.
 *
 * @param {string} baseDirectory
 * @param {Array<{ key: string, file: string }>} definitions
 * @returns {Object}
 */
function buildManifestSection(baseDirectory, definitions) {
    const section = {};

    for (const definition of definitions) {
        const entry = getManifestEntry(baseDirectory, definition);

        section[entry.key] = {
            file: entry.file,
            entries: entry.entries,
            bytes: entry.bytes
        };
    }

    return section;
}

module.exports = {
    buildManifestSection,
    fileExists,
    getEntryCount,
    getFileSize,
    getManifestEntry
};
/**
 * Source Manager
 *
 * Responsible for discovering official Pokémon sources.
 *
 * Responsibilities:
 * - Discover official source files.
 * - Create Source objects.
 * - Return discovered sources.
 *
 * Does NOT:
 * - Read ROM contents.
 * - Validate ROMs.
 * - Parse binary formats.
 * * - Extract Pokémon data.
 */

const fs = require("fs");
const path = require("path");

const Platforms = require("./platforms");
const Source = require("./source");

class SourceManager {
    constructor(sourceDirectory) {
        this.sourceDirectory = sourceDirectory;
    }

    discover() {
        const sources = [];

        // Iterate over every supported platform
        for (const platform of Object.values(Platforms)) {

            const platformPath = path.join(
                this.sourceDirectory,
                platform.directory
            );

            // Skip missing platform directories
            if (!fs.existsSync(platformPath)) {
                continue;
            }

            const entries = fs.readdirSync(platformPath);

            for (const entry of entries) {

                const absolutePath = path.join(platformPath, entry);

                const stats = fs.statSync(absolutePath);

                // Skip directories (for now)
                if (!stats.isFile()) {
                    continue;
                }

                const extension = path.extname(entry).toLowerCase();

                if (!platform.extensions.includes(extension)) {
                    continue;
                }

                const source = new Source({
                    platform,
                    fileName: entry,
                    extension,
                    platformDirectory: platform.directory,
                    absolutePath,
                    relativePath: path.join(platform.directory, entry),
                    size: stats.size,
                });

                sources.push(source);
            }
        }

        return sources;
    }
}

module.exports = SourceManager;
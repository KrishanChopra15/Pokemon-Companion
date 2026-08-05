/**
 * Represents a discovered official source.
 *
 * A Source contains filesystem information only.
 * It does not validate or interpret the file.
 */

class Source {
  constructor({
    platform,
    fileName,
    extension,
    platformDirectory,
    absolutePath,
    relativePath,
    size,
    discoveredAt = new Date(),
    status = "discovered",
  }) {
    this.platform = platform;
    this.fileName = fileName;
    this.extension = extension;
    this.platformDirectory = platformDirectory;
    this.absolutePath = absolutePath;
    this.relativePath = relativePath;
    this.size = size;
    this.discoveredAt = discoveredAt;
    this.status = status;
  }
}

module.exports = Source;
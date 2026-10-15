
"use strict";

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SOURCE_ROOT = path.resolve(
  PROJECT_ROOT,
  "../References/pokefirered"
);

const MAP_SOURCE_ROOT = path.join(SOURCE_ROOT, "data/maps");
const OBJECT_EVENT_SOURCE_ROOT = path.join(
  SOURCE_ROOT,
  "src/data/object_events"
);

const CONSTANTS_FILE = path.join(
  SOURCE_ROOT,
  "include/constants/event_objects.h"
);
const GRAPHICS_POINTERS_FILE = path.join(
  OBJECT_EVENT_SOURCE_ROOT,
  "object_event_graphics_info_pointers.h"
);
const GRAPHICS_INFO_FILE = path.join(
  OBJECT_EVENT_SOURCE_ROOT,
  "object_event_graphics_info.h"
);
const GRAPHICS_DEFINITIONS_FILE = path.join(
  OBJECT_EVENT_SOURCE_ROOT,
  "object_event_graphics.h"
);
const PICTURE_TABLES_FILE = path.join(
  OBJECT_EVENT_SOURCE_ROOT,
  "object_event_pic_tables.h"
);

const NPC_ROOT = path.join(PROJECT_ROOT, "assets/firered/npcs");
const SPRITE_ROOT = path.join(NPC_ROOT, "sprites");
const MAP_ENTITY_ROOT = path.join(
  PROJECT_ROOT,
  "assets/firered/maps/entities"
);
const MAP_ENTITY_FILES_ROOT = path.join(
  MAP_ENTITY_ROOT,
  "by-map"
);

function readText(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required source file not found: ${filePath}`);
  }

  return fs.readFileSync(filePath, "utf8");
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8"
  );
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function safeFileName(value) {
  return String(value)
    .replace(/[^A-Za-z0-9_-]/g, "_");
}

function parseNumber(value) {
  if (value == null) return null;

  const match = String(value).trim().match(/^-?\d+$/);
  return match ? Number(match[0]) : null;
}

function parseField(body, fieldName) {
  const pattern = new RegExp(
    String.raw`\.${fieldName}\s*=\s*([^,\n]+)`
  );
  const match = body.match(pattern);

  return match ? match[1].trim() : null;
}

function recursivelyFindFiles(directory, fileName) {
  if (!fs.existsSync(directory)) {
    throw new Error(`Source directory not found: ${directory}`);
  }

  const results = [];

  function walk(currentDirectory) {
    for (const entry of fs.readdirSync(currentDirectory, {
      withFileTypes: true
    })) {
      const fullPath = path.join(currentDirectory, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name === fileName) {
        results.push(fullPath);
      }
    }
  }

  walk(directory);
  return results.sort();
}

function readPngDimensions(filePath) {
  if (!fs.existsSync(filePath)) return null;

  const buffer = fs.readFileSync(filePath);

  // PNG signature plus the IHDR chunk.
  if (
    buffer.length < 24 ||
    buffer.toString("hex", 0, 8) !== "89504e470d0a1a0a" ||
    buffer.toString("ascii", 12, 16) !== "IHDR"
  ) {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function parseGraphicsIds(source) {
  const result = new Map();
  const pattern =
    /^\s*#define\s+(OBJ_EVENT_GFX_[A-Z0-9_]+)\s+([^\s/]+)/gm;

  for (const match of source.matchAll(pattern)) {
    const symbol = match[1];
    const rawValue = match[2];

    result.set(symbol, {
      symbol,
      numericId: parseNumber(rawValue),
      rawValue
    });
  }

  return result;
}

function parseGraphicsPointers(source) {
  const result = new Map();
  const pattern =
    /\[\s*(OBJ_EVENT_GFX_[A-Z0-9_]+)\s*\]\s*=\s*&\s*gObjectEventGraphicsInfo_([A-Za-z0-9_]+)/g;

  for (const match of source.matchAll(pattern)) {
    result.set(match[1], match[2]);
  }

  return result;
}

function parseGraphicsInfo(source) {
  const result = new Map();
  const pattern =
    /const\s+struct\s+ObjectEventGraphicsInfo\s+gObjectEventGraphicsInfo_([A-Za-z0-9_]+)\s*=\s*\{([\s\S]*?)\n\};/g;

  for (const match of source.matchAll(pattern)) {
    const symbol = match[1];
    const body = match[2];

    result.set(symbol, {
      symbol,
      tileTag: parseField(body, "tileTag"),
      paletteTag: parseField(body, "paletteTag"),
      size: parseNumber(parseField(body, "size")),
      width: parseNumber(parseField(body, "width")),
      height: parseNumber(parseField(body, "height")),
      shadowSize: parseField(body, "shadowSize"),
      inanimate: parseField(body, "inanimate"),
      tracks: parseField(body, "tracks"),
      animationTable: parseField(body, "anims"),
      pictureTable: parseField(body, "images")
    });
  }

  return result;
}

function parsePictureDefinitions(source) {
  const result = new Map();
  const pattern =
    /const\s+u16\s+(gObjectEventPic_[A-Za-z0-9_]+)\s*\[\]\s*=\s*INCBIN_U16\(\s*"([^"]+\.4bpp)"\s*\)/g;

  for (const match of source.matchAll(pattern)) {
    result.set(match[1], match[2]);
  }

  return result;
}

function parsePictureTables(source) {
  const result = new Map();

  const tablePattern =
    /static\s+const\s+struct\s+SpriteFrameImage\s+sPicTable_([A-Za-z0-9_]+)\s*\[\]\s*=\s*\{([\s\S]*?)\n\};/g;

  const framePattern =
    /\b[A-Za-z0-9_]*frame\s*\(\s*(gObjectEventPic_[A-Za-z0-9_]+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;

  for (const tableMatch of source.matchAll(tablePattern)) {
    const tableName = `sPicTable_${tableMatch[1]}`;
    const body = tableMatch[2];
    const frames = [];

    for (const frameMatch of body.matchAll(framePattern)) {
      const widthTiles = Number(frameMatch[2]);
      const heightTiles = Number(frameMatch[3]);
      const frameIndex = Number(frameMatch[4]);

      frames.push({
        tableIndex: frames.length,
        imageSymbol: frameMatch[1],
        frameIndex,
        widthTiles,
        heightTiles,
        width: widthTiles * 8,
        height: heightTiles * 8
      });
    }

    result.set(tableName, frames);
  }

  return result;
}

function getOutputSpritePath(sourceRelativePath) {
  const prefix = "graphics/object_events/pics/";

  let relativeImagePath = sourceRelativePath.replace(/\\/g, "/");

  if (relativeImagePath.startsWith(prefix)) {
    relativeImagePath = relativeImagePath.slice(prefix.length);
  } else {
    relativeImagePath = path.posix.join(
      "unclassified",
      path.posix.basename(relativeImagePath)
    );
  }

  return toPosixPath(
    path.join("assets/firered/npcs/sprites", relativeImagePath)
  );
}

function buildSpriteCatalog() {
  const constants = parseGraphicsIds(readText(CONSTANTS_FILE));
  const pointers = parseGraphicsPointers(
    readText(GRAPHICS_POINTERS_FILE)
  );
  const graphicsInfo = parseGraphicsInfo(
    readText(GRAPHICS_INFO_FILE)
  );
  const pictureDefinitions = parsePictureDefinitions(
    readText(GRAPHICS_DEFINITIONS_FILE)
  );
  const pictureTables = parsePictureTables(
    readText(PICTURE_TABLES_FILE)
  );

  const copiedImages = new Map();
  const spriteRecords = [];
  let missingPngCount = 0;
  let unresolvedMetadataCount = 0;

  function resolveImage(imageSymbol) {
    const cached = copiedImages.get(imageSymbol);
    if (cached) return cached;

    const graphicsPath = pictureDefinitions.get(imageSymbol);

    if (!graphicsPath) {
      const result = {
        imageSymbol,
        sourceImage: null,
        imagePath: null,
        dimensions: null,
        available: false
      };

      copiedImages.set(imageSymbol, result);
      return result;
    }

    const sourcePng = path.resolve(
      SOURCE_ROOT,
      graphicsPath.replace(/\.4bpp$/, ".png")
    );

    const dimensions = readPngDimensions(sourcePng);

    if (!dimensions) {
      missingPngCount++;

      const result = {
        imageSymbol,
        sourceImage: graphicsPath.replace(/\.4bpp$/, ".png"),
        imagePath: null,
        dimensions: null,
        available: false
      };

      copiedImages.set(imageSymbol, result);
      return result;
    }

    const outputRelativePath = getOutputSpritePath(
      graphicsPath.replace(/\.4bpp$/, ".png")
    );
    const outputPath = path.join(
      PROJECT_ROOT,
      outputRelativePath
    );

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.copyFileSync(sourcePng, outputPath);

    const result = {
      imageSymbol,
      sourceImage: graphicsPath.replace(/\.4bpp$/, ".png"),
      imagePath: outputRelativePath,
      dimensions,
      available: true
    };

    copiedImages.set(imageSymbol, result);
    return result;
  }

  for (const [graphicsId, idInfo] of constants.entries()) {
    const metadataSymbol = pointers.get(graphicsId) || null;
    const metadata = metadataSymbol
      ? graphicsInfo.get(metadataSymbol) || null
      : null;

    if (!metadata) unresolvedMetadataCount++;

    const pictureTableName = metadata?.pictureTable || null;
    const pictureFrames = pictureTableName
      ? pictureTables.get(pictureTableName) || []
      : [];

    const frames = pictureFrames.map((frame) => {
      const image = resolveImage(frame.imageSymbol);

      const x = frame.frameIndex * frame.width;

      return {
        tableIndex: frame.tableIndex,
        frameIndex: frame.frameIndex,
        imageSymbol: frame.imageSymbol,
        imagePath: image.imagePath,
        sheetWidth: image.dimensions?.width ?? null,
        sheetHeight: image.dimensions?.height ?? null,
        x,
        y: 0,
        width: frame.width,
        height: frame.height,
        inBounds: image.dimensions
          ? x + frame.width <= image.dimensions.width &&
            frame.height <= image.dimensions.height
          : false,
        available: image.available
      };
    });

    // Some picture tables may not have been parsed. Try the
    // conventional symbol name as a fallback for asset discovery.
    let fallbackImage = null;

    if (frames.length === 0 && pictureTableName) {
      const likelySymbol = pictureTableName.replace(
        /^sPicTable_/,
        "gObjectEventPic_"
      );

      if (pictureDefinitions.has(likelySymbol)) {
        fallbackImage = resolveImage(likelySymbol);
      }
    }

    const availableFrames = frames.filter(
      (frame) => frame.available && frame.inBounds
    );

    spriteRecords.push({
      graphicsId,
      numericId: idInfo.numericId,
      rawNumericId: idInfo.rawValue,
      metadataSymbol: metadataSymbol
        ? `gObjectEventGraphicsInfo_${metadataSymbol}`
        : null,
      metadataAvailable: Boolean(metadata),
      dimensions: metadata
        ? { width: metadata.width, height: metadata.height }
        : null,
      tileSizeBytes: metadata?.size ?? null,
      tileTag: metadata?.tileTag ?? null,
      paletteTag: metadata?.paletteTag ?? null,
      shadowSize: metadata?.shadowSize ?? null,
      inanimate: metadata?.inanimate ?? null,
      tracks: metadata?.tracks ?? null,
      animationTable: metadata?.animationTable ?? null,
      pictureTable: pictureTableName,
      imagePath: frames.find((frame) => frame.imagePath)?.imagePath
        ?? fallbackImage?.imagePath
        ?? null,
      imageAvailable: frames.some((frame) => frame.available) ||
        Boolean(fallbackImage?.available),
      frameTableCount: frames.length,
      availableFrameCount: availableFrames.length,
      frames,
      source: {
        constantsFile: "include/constants/event_objects.h",
        pointerTable:
          "src/data/object_events/object_event_graphics_info_pointers.h",
        graphicsInfo:
          "src/data/object_events/object_event_graphics_info.h",
        pictureTableFile:
          "src/data/object_events/object_event_pic_tables.h",
        imageDefinitions:
          "src/data/object_events/object_event_graphics.h"
      }
    });
  }

  spriteRecords.sort((a, b) =>
    (a.numericId ?? Number.MAX_SAFE_INTEGER) -
      (b.numericId ?? Number.MAX_SAFE_INTEGER) ||
    a.graphicsId.localeCompare(b.graphicsId)
  );

  const catalog = {
    schemaVersion: 1,
    game: "Pokemon FireRed",
    description:
      "Object-event graphics metadata and source sprite-sheet frame references.",
    coordinateNotes:
      "Frame rectangles use pixel coordinates in the exported sprite sheets.",
    graphicsIdCount: spriteRecords.length,
    imageSymbolCount: pictureDefinitions.size,
    spriteImageCount: [...copiedImages.values()].filter(
      (image) => image.available
    ).length,
    missingPngCount,
    unresolvedMetadataCount,
    sprites: spriteRecords
  };

  writeJson(
    path.join(NPC_ROOT, "sprite-catalog.json"),
    catalog
  );

  return {
    catalog,
    byGraphicsId: new Map(
      spriteRecords.map((record) => [record.graphicsId, record])
    )
  };
}

function normalizeObjectEvent(event, index, spriteCatalog) {
  const graphicsId = event.graphics_id ?? null;
  const sprite = graphicsId
    ? spriteCatalog.get(graphicsId) || null
    : null;

  return {
    index,
    localId: event.local_id ?? null,
    graphicsId,
    graphicsNumericId: sprite?.numericId ?? null,

    // Map position is stored in tiles, not screen pixels.
    x: event.x ?? null,
    y: event.y ?? null,
    elevation: event.elevation ?? null,

    movementType: event.movement_type ?? null,
    movementRangeX: event.movement_range_x ?? null,
    movementRangeY: event.movement_range_y ?? null,

    trainerType: event.trainer_type ?? null,
    trainerSightOrBerryTreeId:
      event.trainer_sight_or_berry_tree_id ?? null,

    script: event.script ?? null,

    // Preserve the original source flag. Its meaning can depend
    // on game state, so this exporter does not resolve it to true/false.
    visibilityFlag: event.flag ?? null,

    spriteCatalogKey: graphicsId,
    spriteAvailable: Boolean(sprite?.imageAvailable),
    spriteImagePath: sprite?.imagePath ?? null,

    // Keep the source record to avoid discarding fields that the
    // exporter does not normalize yet.
    sourceEvent: event
  };
}

function exportMapEntities(spriteCatalog) {
  const mapFiles = recursivelyFindFiles(
    MAP_SOURCE_ROOT,
    "map.json"
  );

  const mapRecords = [];
  const seenMapIds = new Set();
  const duplicateMapIds = [];
  const unresolvedGraphics = new Set();

  let totalObjectEvents = 0;
  let missingSpriteEvents = 0;
  let mapsWithoutId = 0;

  for (const sourceFile of mapFiles) {
    let sourceMap;

    try {
      sourceMap = JSON.parse(readText(sourceFile));
    } catch (error) {
      console.warn(
        `[warn] Could not parse ${sourceFile}: ${error.message}`
      );
      continue;
    }

    const mapId = sourceMap.id;

    if (!mapId || typeof mapId !== "string") {
      mapsWithoutId++;
      console.warn(`[warn] Map without a string ID: ${sourceFile}`);
      continue;
    }

    if (seenMapIds.has(mapId)) {
      duplicateMapIds.push(mapId);
      console.warn(`[warn] Duplicate map ID: ${mapId}`);
    }
    seenMapIds.add(mapId);

    const sourceEvents = Array.isArray(sourceMap.object_events)
      ? sourceMap.object_events
      : [];

    const objectEvents = sourceEvents.map((event, index) =>
      normalizeObjectEvent(event, index, spriteCatalog)
    );

    totalObjectEvents += objectEvents.length;

    for (const event of objectEvents) {
      if (!event.spriteAvailable) {
        missingSpriteEvents++;

        if (event.graphicsId) {
          unresolvedGraphics.add(event.graphicsId);
        }
      }
    }

    const sourceRelativePath = toPosixPath(
      path.relative(SOURCE_ROOT, sourceFile)
    );

    const output = {
      schemaVersion: 1,
      mapId,
      layoutId: sourceMap.layout ?? null,
      objectEventCount: objectEvents.length,
      coordinateSystem: "map tiles",
      sourceFile: sourceRelativePath,
      objectEvents
    };

    const outputFileName = `${safeFileName(mapId)}.json`;
    const outputPath = path.join(
      MAP_ENTITY_FILES_ROOT,
      outputFileName
    );

    writeJson(outputPath, output);

    mapRecords.push({
      mapId,
      layoutId: sourceMap.layout ?? null,
      objectEventCount: objectEvents.length,
      file: toPosixPath(
        path.join("assets/firered/maps/entities/by-map", outputFileName)
      ),
      sourceFile: sourceRelativePath
    });
  }

  mapRecords.sort((a, b) => a.mapId.localeCompare(b.mapId));

  const manifest = {
    schemaVersion: 1,
    game: "Pokemon FireRed",
    description:
      "Map object-event locations exported from source map definitions.",
    mapCount: mapRecords.length,
    objectEventCount: totalObjectEvents,
    mapsWithoutId,
    duplicateMapIds,
    maps: mapRecords,
    diagnostics: {
      eventsWithoutAvailableSprite: missingSpriteEvents,
      unresolvedGraphicsIds: [...unresolvedGraphics].sort()
    }
  };

  writeJson(
    path.join(MAP_ENTITY_ROOT, "manifest.json"),
    manifest
  );

  return manifest;
}

function main() {
  console.log("Exporting FireRed NPC sprite data...");

  fs.mkdirSync(SPRITE_ROOT, { recursive: true });
  fs.mkdirSync(MAP_ENTITY_FILES_ROOT, { recursive: true });

  const { catalog, byGraphicsId } = buildSpriteCatalog();
  const manifest = exportMapEntities(byGraphicsId);

  console.log("");
  console.log("NPC export complete.");
  console.log(`Graphics IDs catalogued: ${catalog.graphicsIdCount}`);
  console.log(`Sprite images copied: ${catalog.spriteImageCount}`);
  console.log(`Maps exported: ${manifest.mapCount}`);
  console.log(`Map object events: ${manifest.objectEventCount}`);
  console.log(
    `Events without an available sprite: ${
      manifest.diagnostics.eventsWithoutAvailableSprite
    }`
  );

  if (catalog.missingPngCount > 0) {
    console.warn(
      `Sprite PNGs missing or unreadable: ${catalog.missingPngCount}`
    );
  }

  if (catalog.unresolvedMetadataCount > 0) {
    console.warn(
      `Graphics IDs without resolved metadata: ${
        catalog.unresolvedMetadataCount
      }`
    );
  }

  if (manifest.duplicateMapIds.length > 0) {
    console.warn(
      `Duplicate map IDs: ${manifest.duplicateMapIds.join(", ")}`
    );
  }

  console.log("");
  console.log("Generated files:");
  console.log("  assets/firered/npcs/sprite-catalog.json");
  console.log("  assets/firered/npcs/sprites/");
  console.log("  assets/firered/maps/entities/manifest.json");
  console.log("  assets/firered/maps/entities/by-map/");
}

try {
  main();
} catch (error) {
  console.error(`[error] ${error.stack || error.message}`);
  process.exitCode = 1;
}

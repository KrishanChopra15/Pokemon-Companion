
"use strict";

/**
 * Pokemon Companion
 * FireRed NPC Map Preview Renderer
 *
 * Combines existing layout previews with the static object-event
 * placements exported from the original FireRed map definitions.
 *
 * This is a static preview:
 * - No NPC movement or animation.
 * - No runtime resolution of OBJ_EVENT_GFX_VAR_*.
 * - No evaluation of in-game visibility flags.
 * - Original map previews remain unchanged.
 */

const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const PROJECT_ROOT = path.resolve(__dirname, "../..");

const MAP_ROOT = path.join(PROJECT_ROOT, "assets/firered/maps");
const NPC_ROOT = path.join(PROJECT_ROOT, "assets/firered/npcs");

const ENTITY_MANIFEST_PATH = path.join(
  MAP_ROOT,
  "entities/manifest.json"
);
const SPRITE_CATALOG_PATH = path.join(
  NPC_ROOT,
  "sprite-catalog.json"
);

const BASE_PREVIEW_ROOT = path.join(MAP_ROOT, "previews");
const OUTPUT_ROOT = path.join(MAP_ROOT, "previews-with-npcs");

const TILE_SIZE = 16;

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required JSON file not found: ${filePath}`);
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8"
  );
}

function safeFileName(value) {
  return String(value).replace(/[^A-Za-z0-9_-]/g, "_");
}

function resolveProjectPath(relativePath) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    throw new Error("Expected a non-empty project-relative path.");
  }

  const resolved = path.resolve(PROJECT_ROOT, relativePath);

  if (
    resolved !== PROJECT_ROOT &&
    !resolved.startsWith(PROJECT_ROOT + path.sep)
  ) {
    throw new Error(`Unsafe project-relative path: ${relativePath}`);
  }

  return resolved;
}

function getPng(pngCache, relativePath) {
  if (!pngCache.has(relativePath)) {
    const fullPath = resolveProjectPath(relativePath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`PNG not found: ${relativePath}`);
    }

    const buffer = fs.readFileSync(fullPath);
    pngCache.set(relativePath, PNG.sync.read(buffer));
  }

  return pngCache.get(relativePath);
}

/**
 * Choose a static representative frame.
 *
 * The first valid picture-table entry is used when available.
 * This does not evaluate the character's animation table.
 */
function chooseStaticFrame(sprite) {
  if (!sprite || !Array.isArray(sprite.frames)) {
    return null;
  }

  const usable = sprite.frames.filter((frame) => {
    return (
      frame &&
      frame.available === true &&
      frame.inBounds === true &&
      typeof frame.imagePath === "string" &&
      Number.isFinite(frame.x) &&
      Number.isFinite(frame.y) &&
      Number.isFinite(frame.width) &&
      Number.isFinite(frame.height) &&
      frame.width > 0 &&
      frame.height > 0
    );
  });

  return (
    usable.find((frame) => frame.tableIndex === 0) ||
    usable.sort((a, b) => a.tableIndex - b.tableIndex)[0] ||
    null
  );
}

/**
 * Alpha-composite one source-sheet frame onto the map image.
 *
 * The destination position is the NPC's feet anchor:
 * - horizontally centered on the event's map tile
 * - bottom-aligned with the event's map tile
 *
 * Map coordinates are in 16-pixel metatiles.
 */
function drawFrame(background, sheet, frame, event) {
  const mapX = Number(event.x);
  const mapY = Number(event.y);

  if (!Number.isFinite(mapX) || !Number.isFinite(mapY)) {
    return { status: "invalid-coordinates" };
  }

  const sourceX = frame.x;
  const sourceY = frame.y;
  const spriteWidth = frame.width;
  const spriteHeight = frame.height;

  if (
    sourceX < 0 ||
    sourceY < 0 ||
    sourceX + spriteWidth > sheet.width ||
    sourceY + spriteHeight > sheet.height
  ) {
    return { status: "invalid-frame-bounds" };
  }

  const destinationX = Math.round(
    mapX * TILE_SIZE + (TILE_SIZE - spriteWidth) / 2
  );

  const destinationY = Math.round(
    (mapY + 1) * TILE_SIZE - spriteHeight
  );

  if (
    destinationX >= background.width ||
    destinationY >= background.height ||
    destinationX + spriteWidth <= 0 ||
    destinationY + spriteHeight <= 0
  ) {
    return { status: "outside-map" };
  }

  for (let py = 0; py < spriteHeight; py++) {
    const targetY = destinationY + py;

    if (targetY < 0 || targetY >= background.height) {
      continue;
    }

    for (let px = 0; px < spriteWidth; px++) {
      const targetX = destinationX + px;

      if (targetX < 0 || targetX >= background.width) {
        continue;
      }

      const sourceOffset =
        ((sourceY + py) * sheet.width + sourceX + px) * 4;

      const targetOffset =
        (targetY * background.width + targetX) * 4;

      const alpha = sheet.data[sourceOffset + 3];

      if (alpha === 0) {
        continue;
      }

      if (alpha === 255) {
        background.data[targetOffset] = sheet.data[sourceOffset];
        background.data[targetOffset + 1] =
          sheet.data[sourceOffset + 1];
        background.data[targetOffset + 2] =
          sheet.data[sourceOffset + 2];
        background.data[targetOffset + 3] = 255;
        continue;
      }

      // Blend partially transparent pixels against the map.
      const sourceAlpha = alpha / 255;
      const destinationAlpha =
        background.data[targetOffset + 3] / 255;

      const outputAlpha =
        sourceAlpha + destinationAlpha * (1 - sourceAlpha);

      if (outputAlpha === 0) continue;

      for (let channel = 0; channel < 3; channel++) {
        const sourceValue = sheet.data[sourceOffset + channel];
        const destinationValue = background.data[targetOffset + channel];

        background.data[targetOffset + channel] = Math.round(
          (
            sourceValue * sourceAlpha +
            destinationValue * destinationAlpha * (1 - sourceAlpha)
          ) / outputAlpha
        );
      }

      background.data[targetOffset + 3] =
        Math.round(outputAlpha * 255);
    }
  }

  return {
    status: "drawn",
    destinationX,
    destinationY,
    width: spriteWidth,
    height: spriteHeight
  };
}

function isConditionalVisibilityFlag(flag) {
  if (flag == null || flag === 0 || flag === "0") {
    return false;
  }

  return true;
}

function main() {
  const entityManifest = readJson(ENTITY_MANIFEST_PATH);
  const spriteCatalog = readJson(SPRITE_CATALOG_PATH);

  const spriteByGraphicsId = new Map(
    spriteCatalog.sprites.map((sprite) => [
      String(sprite.graphicsId),
      sprite
    ])
  );

  const pngCache = new Map();
  const mapResults = [];

  const totals = {
    mapsListed: entityManifest.maps.length,
    mapsRendered: 0,
    mapsSkipped: 0,
    objectEventsSeen: 0,
    spritesDrawn: 0,
    eventsWithoutGraphicsId: 0,
    eventsWithoutCatalogEntry: 0,
    eventsWithoutUsableFrame: 0,
    eventsWithInvalidCoordinates: 0,
    eventsOutsideMap: 0,
    eventsWithConditionalVisibilityFlags: 0,
    missingBackgrounds: 0
  };

  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });

  for (const mapEntry of entityManifest.maps) {
    let mapData;

    try {
      mapData = readJson(resolveProjectPath(mapEntry.file));
    } catch (error) {
      totals.mapsSkipped++;

      mapResults.push({
        mapId: mapEntry.mapId,
        status: "failed",
        reason: error.message
      });

      console.warn(`[SKIP] ${mapEntry.mapId}: ${error.message}`);
      continue;
    }

    const mapId = mapData.mapId;
    const layoutId = mapData.layoutId;
    const basePreviewRelative = layoutId
      ? `assets/firered/maps/previews/${layoutId}.png`
      : null;

    if (
      !basePreviewRelative ||
      !fs.existsSync(resolveProjectPath(basePreviewRelative))
    ) {
      totals.mapsSkipped++;
      totals.missingBackgrounds++;

      mapResults.push({
        mapId,
        layoutId,
        status: "skipped",
        reason: "No rendered background preview for this layout"
      });

      continue;
    }

    let background;

    try {
      // Read a fresh image for each map, even if the layout is shared.
      const buffer = fs.readFileSync(
        resolveProjectPath(basePreviewRelative)
      );
      background = PNG.sync.read(buffer);
    } catch (error) {
      totals.mapsSkipped++;

      mapResults.push({
        mapId,
        layoutId,
        status: "failed",
        reason: `Could not read background: ${error.message}`
      });

      console.warn(
        `[SKIP] ${mapId}: unable to read layout preview`
      );
      continue;
    }

    const events = Array.isArray(mapData.objectEvents)
      ? [...mapData.objectEvents]
      : [];

    totals.objectEventsSeen += events.length;

    // Draw farther/northern entities first, then those farther south.
    // This gives overlapping static sprites a basic depth order.
    events.sort((a, b) => {
      const yDifference = Number(a.y) - Number(b.y);

      if (Number.isFinite(yDifference) && yDifference !== 0) {
        return yDifference;
      }

      return Number(a.index ?? 0) - Number(b.index ?? 0);
    });

    const mapCounts = {
      objectEvents: events.length,
      spritesDrawn: 0,
      unresolvedGraphics: 0,
      framesUnavailable: 0,
      invalidCoordinates: 0,
      outsideMap: 0,
      conditionalVisibilityFlags: 0
    };

    for (const event of events) {
      if (isConditionalVisibilityFlag(event.visibilityFlag)) {
        totals.eventsWithConditionalVisibilityFlags++;
        mapCounts.conditionalVisibilityFlags++;
      }

      if (event.graphicsId == null || event.graphicsId === "") {
        totals.eventsWithoutGraphicsId++;
        mapCounts.unresolvedGraphics++;
        continue;
      }

      const graphicsId = String(event.graphicsId);
      const sprite = spriteByGraphicsId.get(graphicsId);

      if (!sprite) {
        // Includes ID 0 and runtime-variable graphics identifiers.
        totals.eventsWithoutCatalogEntry++;
        mapCounts.unresolvedGraphics++;
        continue;
      }

      const frame = chooseStaticFrame(sprite);

      if (!frame) {
        totals.eventsWithoutUsableFrame++;
        mapCounts.framesUnavailable++;
        continue;
      }

      const sheetPath = frame.imagePath || sprite.imagePath;

      if (!sheetPath) {
        totals.eventsWithoutUsableFrame++;
        mapCounts.framesUnavailable++;
        continue;
      }

      let sheet;

      try {
        sheet = getPng(pngCache, sheetPath);
      } catch (error) {
        totals.eventsWithoutUsableFrame++;
        mapCounts.framesUnavailable++;
        continue;
      }

      const result = drawFrame(background, sheet, frame, event);

      if (result.status === "drawn") {
        totals.spritesDrawn++;
        mapCounts.spritesDrawn++;
      } else if (result.status === "invalid-coordinates") {
        totals.eventsWithInvalidCoordinates++;
        mapCounts.invalidCoordinates++;
      } else if (result.status === "outside-map") {
        totals.eventsOutsideMap++;
        mapCounts.outsideMap++;
      } else {
        totals.eventsWithoutUsableFrame++;
        mapCounts.framesUnavailable++;
      }
    }

    const outputRelative = toProjectRelativeOutput(mapId);
    const outputFile = resolveProjectPath(outputRelative);

    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, PNG.sync.write(background));

    totals.mapsRendered++;

    mapResults.push({
      mapId,
      layoutId,
      status: "rendered",
      image: outputRelative,
      background: basePreviewRelative,
      width: background.width,
      height: background.height,
      ...mapCounts
    });

    if (totals.mapsRendered % 50 === 0) {
      console.log(
        `Rendered ${totals.mapsRendered}/${totals.mapsListed} maps...`
      );
    }
  }

  const outputManifest = {
    schemaVersion: 1,
    game: "Pokemon FireRed",
    description:
      "Static object-event sprites composited over existing map-layout previews.",
    tileSizePixels: TILE_SIZE,
    frameSelection:
      "First valid picture-table frame; animation commands are not evaluated.",
    coordinateAnchor:
      "Sprite centered horizontally on its event tile, with its feet aligned to the tile's bottom edge.",
    visibilityNote:
      "Source visibility flags are recorded but not evaluated against in-game state.",
    runtimeGraphicsNote:
      "ID 0 and OBJ_EVENT_GFX_VAR_* entries are skipped because their visible sprites cannot be determined from static map data alone.",
    totals,
    maps: mapResults
  };

  writeJson(
    path.join(OUTPUT_ROOT, "manifest.json"),
    outputManifest
  );

  console.log("");
  console.log("NPC map preview export complete.");
  console.log(`Maps listed: ${totals.mapsListed}`);
  console.log(`Maps rendered: ${totals.mapsRendered}`);
  console.log(`Maps skipped: ${totals.mapsSkipped}`);
  console.log(`Object events seen: ${totals.objectEventsSeen}`);
  console.log(`NPC sprites drawn: ${totals.spritesDrawn}`);
  console.log(
    `Events with conditional visibility flags: ${
      totals.eventsWithConditionalVisibilityFlags
    }`
  );
  console.log(
    `Events without catalog entries: ${totals.eventsWithoutCatalogEntry}`
  );
  console.log(
    `Events without usable frames: ${totals.eventsWithoutUsableFrame}`
  );
  console.log(
    `Events with invalid coordinates: ${totals.eventsWithInvalidCoordinates}`
  );
  console.log(`Events outside map images: ${totals.eventsOutsideMap}`);
  console.log("");
  console.log("Output directory:");
  console.log("  assets/firered/maps/previews-with-npcs/");
  console.log("Manifest:");
  console.log("  assets/firered/maps/previews-with-npcs/manifest.json");
}

function toProjectRelativeOutput(mapId) {
  return path.join(
    "assets",
    "firered",
    "maps",
    "previews-with-npcs",
    `${safeFileName(mapId)}.png`
  );
}

try {
  main();
} catch (error) {
  console.error(`[error] ${error.stack || error.message}`);
  process.exitCode = 1;
}

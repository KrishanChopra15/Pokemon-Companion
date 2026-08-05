/**
 * Official source platforms supported by Pokémon Companion.
 *
 * This file defines every platform recognised by the Source Manager.
 * It contains configuration only and no discovery or validation logic.
 */

const Platforms = {
  GAME_BOY: {
    id: "game-boy",
    name: "Game Boy",
    directory: "game-boy",
    extensions: [".gb"],
    reader: "GameBoyReader",
  },

  GAME_BOY_COLOR: {
    id: "game-boy-color",
    name: "Game Boy Color",
    directory: "game-boy-color",
    extensions: [".gbc"],
    reader: "GameBoyColorReader",
  },

  GAME_BOY_ADVANCE: {
    id: "game-boy-advance",
    name: "Game Boy Advance",
    directory: "game-boy-advance",
    extensions: [".gba"],
    reader: "GameBoyAdvanceReader",
  },

  NINTENDO_DS: {
    id: "nintendo-ds",
    name: "Nintendo DS",
    directory: "nintendo-ds",
    extensions: [".nds"],
    reader: "NintendoDSReader",
  },

  NINTENDO_3DS: {
    id: "nintendo-3ds",
    name: "Nintendo 3DS",
    directory: "nintendo-3ds",
    extensions: [".3ds", ".cia"],
    reader: "Nintendo3DSReader",
  },

  NINTENDO_SWITCH: {
    id: "nintendo-switch",
    name: "Nintendo Switch",
    directory: "nintendo-switch",
    extensions: [],
    reader: "NintendoSwitchReader",
  },

  DISTRIBUTIONS: {
    id: "distributions",
    name: "Official Distributions",
    directory: "distributions",
    extensions: [],
    reader: "DistributionReader",
  },
};

module.exports = Platforms;
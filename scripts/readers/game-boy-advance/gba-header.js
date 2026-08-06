/**
 * Pokémon Companion
 * Game Boy Advance ROM Header Specification
 *
 * Defines the official Game Boy Advance ROM header layout.
 *
 * All offsets and lengths are measured in bytes.
 */

"use strict";

const GBAHeader = Object.freeze({

    /**
     * Nintendo Logo
     */

    NINTENDO_LOGO_OFFSET: 0x04,
    NINTENDO_LOGO_LENGTH: 156,

    /**
     * Game Title
     */

    TITLE_OFFSET: 0xA0,
    TITLE_LENGTH: 12,

    /**
     * Game Code
     */

    GAME_CODE_OFFSET: 0xAC,
    GAME_CODE_LENGTH: 4,

    /**
     * Maker Code
     */

    MAKER_CODE_OFFSET: 0xB0,
    MAKER_CODE_LENGTH: 2,

    /**
     * Fixed Value
     */

    FIXED_VALUE_OFFSET: 0xB2,

    /**
     * Main Unit Code
     */

    UNIT_CODE_OFFSET: 0xB3,

    /**
     * Device Type
     */

    DEVICE_TYPE_OFFSET: 0xB4,

    /**
     * Reserved Area
     */

    RESERVED_AREA_1_OFFSET: 0xB5,
    RESERVED_AREA_1_LENGTH: 7,

    /**
     * Software Version
     */

    VERSION_OFFSET: 0xBC,

    /**
     * Header Checksum
     */

    HEADER_CHECKSUM_OFFSET: 0xBD,

    /**
     * Reserved Area
     */

    RESERVED_AREA_2_OFFSET: 0xBE,
    RESERVED_AREA_2_LENGTH: 2,

    /**
     * ROM Entry Point
     */

    ENTRY_POINT_OFFSET: 0x00,
    ENTRY_POINT_LENGTH: 4

});

module.exports = GBAHeader;
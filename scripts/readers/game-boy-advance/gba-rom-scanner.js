"use strict";

class GbaRomScanner {

    /**
     * @param {GameBoyAdvanceReader} reader
     */
    constructor(reader) {

        this.reader = reader;

    }

    /**
     * Find first occurrence of a byte signature.
     *
     * @param {Buffer} signature
     * @returns {number}
     */
    find(signature) {

        const matches = this.findAll(signature);

        return matches.length > 0
            ? matches[0]
            : -1;

    }

    /**
     * Find every occurrence of a byte signature.
     *
     * @param {Buffer} signature
     * @returns {number[]}
     */
    findAll(signature) {

        const matches = [];

        const rom = this.reader.romBuffer;

        for (
            let offset = 0;
            offset <= rom.length - signature.length;
            offset++
        ) {

            let match = true;

            for (
                let i = 0;
                i < signature.length;
                i++
            ) {

                if (rom[offset + i] !== signature[i]) {

                    match = false;
                    break;

                }

            }

            if (match) {

                matches.push(offset);

            }

        }

        return matches;

    }

}

module.exports = GbaRomScanner;
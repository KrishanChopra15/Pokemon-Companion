"use strict";

const ReferenceGenerator = require("./reference-generator");
const MoveNameParser = require("../../parsers/reference/move-name-parser");

class MoveNameGenerator extends ReferenceGenerator {

    generate() {

        const source = this.readSourceFile(
            "pokefirered",
            "src",
            "data",
            "text",
            "move_names.h"
        );

        const parser = new MoveNameParser();

        const moves = parser.parse(source);

        this.writeDatabase(
            "move-names",
            moves
        );

    }

}

module.exports = MoveNameGenerator;
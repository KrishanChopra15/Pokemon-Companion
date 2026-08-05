const Database = require("better-sqlite3");
const path = require("node:path");

const DATABASE_PATH = path.join(
    __dirname,
    "../../database/external/veekun/veekun-pokedex.sqlite"
);

const db = new Database(
    DATABASE_PATH,
    {
        readonly: true
    }
);

const moveIdMap = new Map();

const moveRows = db.prepare(`
    SELECT
        id,
        identifier
    FROM moves
`).all();

for (const move of moveRows) {

    moveIdMap.set(
        move.identifier.replace(/-/g, ""),
        move.id
    );

}

const statement = db.prepare(`
    SELECT
        vg.identifier AS version_group,
        mach.machine_number,
        i.identifier AS item
    FROM machines mach
    JOIN version_groups vg
        ON vg.id = mach.version_group_id
    JOIN items i
        ON i.id = mach.item_id
    WHERE mach.move_id = ?
    ORDER BY vg.id
`);

function getMachineKind(itemIdentifier) {

    if (itemIdentifier.startsWith("hm")) {
        return "HM";
    }

    if (itemIdentifier.startsWith("tr")) {
        return "TR";
    }

    return "TM";

}

function getMachineCode(kind, number) {

    return `${kind}${String(number).padStart(2, "0")}`;

}

function getMachineHistory(moveId) {

    const veekunMoveId =
        moveIdMap.get(moveId);

    if (!veekunMoveId) {
        return {};
    }

    const rows =
        statement.all(
            veekunMoveId
        );

    if (rows.length === 0) {
        return {};
    }

    const history = {};

    for (const row of rows) {

        const kind =
            getMachineKind(
                row.item
            );

        history[
            row.version_group
        ] = {

            code: getMachineCode(
                kind,
                row.machine_number
            ),

            number: row.machine_number,

            kind

        };

    }

    return history;

}

module.exports = {
    getMachineHistory
};
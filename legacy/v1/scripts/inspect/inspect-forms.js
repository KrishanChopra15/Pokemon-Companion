const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
    path.join(
        __dirname,
        "../../database/external/veekun/veekun-pokedex.sqlite"
    ),
    {
        readonly: true
    }
);

console.log("\n========================================");
console.log("=== pokemon_forms (First 10 Rows) ===");
console.log("========================================\n");

console.table(
    db.prepare(`
        SELECT *
        FROM pokemon_forms
        LIMIT 10;
    `).all()
);

console.log("\n========================================");
console.log("=== pokemon_form_names (First 20 Rows) ===");
console.log("========================================\n");

console.table(
    db.prepare(`
        SELECT *
        FROM pokemon_form_names
        WHERE local_language_id = 9
        LIMIT 20;
    `).all()
);

console.log("\n========================================");
console.log("=== Special Forms ===");
console.log("========================================\n");

console.table(
    db.prepare(`
        SELECT
            pf.id,
            pf.identifier,
            pf.form_identifier,
            p.identifier AS pokemon,
            pf.pokemon_id,
            pf.introduced_in_version_group_id,
            pf.is_default,
            pf.is_battle_only,
            pf.is_mega,
            pf.form_order,
            pf."order",
            pfn.form_name,
            pfn.pokemon_name
        FROM pokemon_forms pf

        JOIN pokemon p
            ON p.id = pf.pokemon_id

        LEFT JOIN pokemon_form_names pfn
            ON pfn.pokemon_form_id = pf.id
            AND pfn.local_language_id = 9

        WHERE
            pf.is_mega = 1
            OR pf.identifier LIKE '%gmax%'
            OR pf.identifier LIKE '%alola%'
            OR pf.identifier LIKE '%galar%'
            OR pf.identifier LIKE '%hisui%'
            OR pf.identifier LIKE '%paldea%'
            OR pf.identifier LIKE '%origin%'
            OR pf.identifier LIKE '%therian%'
            OR pf.identifier LIKE '%primal%'
            OR pf.identifier LIKE '%mega%'

        ORDER BY pf.id;
    `).all()
);

console.log("\n========================================");
console.log("=== Statistics ===");
console.log("========================================\n");

const totalForms = db.prepare(`
    SELECT COUNT(*) AS totalForms
    FROM pokemon_forms;
`).get();

const pokemonWithForms = db.prepare(`
    SELECT COUNT(DISTINCT pokemon_id) AS pokemonWithForms
    FROM pokemon_forms;
`).get();

const megaForms = db.prepare(`
    SELECT COUNT(*) AS megaForms
    FROM pokemon_forms
    WHERE is_mega = 1;
`).get();

const battleOnlyForms = db.prepare(`
    SELECT COUNT(*) AS battleOnlyForms
    FROM pokemon_forms
    WHERE is_battle_only = 1;
`).get();

console.table([
    totalForms,
    pokemonWithForms,
    megaForms,
    battleOnlyForms
]);

console.log("\n========================================");
console.log("=== Form Identifier Breakdown ===");
console.log("========================================\n");

console.table(
    db.prepare(`
        SELECT
            COALESCE(form_identifier, '(default)') AS formIdentifier,
            COUNT(*) AS count
        FROM pokemon_forms
        GROUP BY form_identifier
        ORDER BY count DESC;
    `).all()
);

console.log("\n========================================");
console.log("=== Forms Introduced Per Version Group ===");
console.log("========================================\n");

console.table(
    db.prepare(`
        SELECT
            vg.identifier,
            vg.id,
            COUNT(*) AS forms
        FROM pokemon_forms pf

        JOIN version_groups vg
            ON vg.id = pf.introduced_in_version_group_id

        GROUP BY vg.id

        ORDER BY vg."order";
    `).all()
);

db.close();
function titleCase(text) {

    if (!text) {

        return null;

    }

    return text

        .split("-")

        .map(

            word =>

                word.charAt(0)
                    .toUpperCase() +

                word.slice(1)

        )

        .join(" ");

}

function normaliseEvolution(details = {}) {

    return {

        trigger:

            details.trigger?.name ??
            null,

        item:

            details.item
                ? titleCase(
                    details.item.name
                )
                : null,

        heldItem:

            details.held_item
                ? titleCase(
                    details.held_item.name
                )
                : null,

        tradeSpecies:

            details.trade_species?.name ??
            null,

        minimumLevel:

            details.min_level ??
            null,

        minimumHappiness:

            details.min_happiness ??
            null,

        minimumAffection:

            details.min_affection ??
            null,

        minimumBeauty:

            details.min_beauty ??
            null,

        minimumDamageTaken:

            details.min_damage_taken ??
            null,

        minimumMoveCount:

            details.min_move_count ??
            null,

        minimumSteps:

            details.min_steps ??
            null,

        gender:

            details.gender ??
            null,

        timeOfDay:

            details.time_of_day || null,

        knownMove:

            details.known_move?.name ??
            null,

        knownMoveType:

            details.known_move_type?.name ??
            null,

        usedMove:

            details.used_move?.name ??
            null,

        partySpecies:

            details.party_species?.name ??
            null,

        partyType:

            details.party_type?.name ??
            null,

        location:

            details.location?.name ??
            null,

        region:

            details.region?.name ??
            null,

        relativePhysicalStats:

            details.relative_physical_stats ??
            null,

        turnUpsideDown:

            details.turn_upside_down ??
            false,

        needsMultiplayer:

            details.needs_multiplayer ??
            false,

        needsOverworldRain:

            details.needs_overworld_rain ??
            false,

        nearSpecialRock:

            details.near_special_rock ??
            false,

        baseForm:

            details.base_form ??
            null,

        evolvedForm:

            details.evolved_form ??
            null,

        versionGroup:

            details.version_group?.name ??
            null

    };

}

module.exports = {

    normaliseEvolution

};
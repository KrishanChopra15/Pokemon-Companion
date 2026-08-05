function normaliseItemFling(
    fling
) {

    if (!fling) {

        return null;

    }

    return {

        basePower:
            fling.basePower ??
            null,

        status:
            fling.status ??
            null,

        volatileStatus:
            fling.volatileStatus ??
            null

    };

}

function normaliseItem(

    item,

    generation

) {

    return {

        id:
            item.id,

        name:
            item.name,

        generation,

        introducedGeneration:
            item.gen,

        number:
            item.num,

        shortDescription:
            item.shortDesc,

        description:
            item.desc,

        fling:
            normaliseItemFling(
                item.fling
            ),

        isBerry:
            item.isBerry ?? false,

        isGem:
            item.isGem ?? false,

        isPokeball:
            item.isPokeball ?? false,

        isMail:
            item.isMail ?? false,

        ignoreKlutz:
            item.ignoreKlutz ?? false,

        isPrimalOrb:
            item.isPrimalOrb ?? false,

        megaStone:
            item.megaStone ??
            null,

        megaEvolves:
            item.megaEvolves ??
            null,

        zMove:
            item.zMove ??
            null,

        zMoveType:
            item.zMoveType ??
            null,

        zMoveFrom:
            item.zMoveFrom ??
            null,

        zMoveUser:
            item.zMoveUser
                ? [

                    ...item.zMoveUser

                ]
                : [],

        plateType:
            item.onPlate ??
            null,

        driveType:
            item.onDrive ??
            null,

        memoryType:
            item.onMemory ??
            null,

        forcedForm:
            item.forcedForm ??
            null

    };

}

module.exports = {

    normaliseItem

};
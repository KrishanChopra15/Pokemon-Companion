function determineCategory(identifier) {

    const value = identifier.toLowerCase();

    if (value.includes("mega")) return "Mega";
    if (value.includes("gmax")) return "Gigantamax";

    if (
        value.includes("alola") ||
        value.includes("galar") ||
        value.includes("hisui") ||
        value.includes("paldea")
    ) {
        return "Regional";
    }

    if (value.includes("primal")) return "Primal";

    if (value.includes("totem")) return "Totem";

    if (
        value.includes("male") ||
        value.includes("female")
    ) {
        return "Gender";
    }

    if (

        value.includes("attack") ||
        value.includes("defense") ||
        value.includes("speed") ||
        value.includes("origin") ||
        value.includes("therian") ||
        value.includes("sky") ||
        value.includes("heat") ||
        value.includes("wash") ||
        value.includes("frost") ||
        value.includes("fan") ||
        value.includes("mow") ||
        value.includes("blade") ||
        value.includes("school") ||
        value.includes("complete") ||
        value.includes("zen") ||
        value.includes("pirouette") ||
        value.includes("resolute") ||
        value.includes("ash") ||
        value.includes("battle-bond")

    ) {

        return "Forme";

    }

    return "Alternate";

}

function createDisplayName(identifier) {

    if (!identifier) {

        return "Default";

    }

    return identifier

        .split("-")

        .map(

            word =>

                word.charAt(0).toUpperCase() +

                word.slice(1)

        )

        .join(" ");

}

function sortForms(forms) {

    const order = {

        Default: 0,

        Mega: 1,

        Regional: 2,

        Gigantamax: 3,

        Primal: 4,

        Totem: 5,

        Gender: 6,

        Forme: 7,

        Alternate: 8

    };

    forms.sort((a, b) => {

        const categoryDifference =
            order[a.category] -
            order[b.category];

        if (categoryDifference !== 0) {

            return categoryDifference;

        }

        return a.order - b.order;

    });

}

module.exports = {

    determineCategory,

    createDisplayName,

    sortForms

};
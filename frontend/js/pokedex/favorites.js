// ========================================
// Pokémon Favorites
// ========================================

const FAVORITES_KEY = "pokemonFavorites";

function getFavorites() {

    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

}

function saveFavorites(favorites) {

    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favorites)
    );

}

function isFavorite(id) {

    return getFavorites().includes(id);

}

function toggleFavorite(id) {

    let favorites = getFavorites();

    if (favorites.includes(id)) {

        favorites = favorites.filter(fav => fav !== id);

    } else {

        favorites.push(id);

    }

    saveFavorites(favorites);

}
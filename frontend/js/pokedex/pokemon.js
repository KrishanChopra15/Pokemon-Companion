// ========================================
// Pokémon Companion
// Pokémon Details
// ========================================

const params = new URLSearchParams(window.location.search);
const pokemonId =
    Number(params.get("id")) || 6;

const pokemon = pokemonData.find(
    p => p.id === pokemonId
);

const pokemonName = document.getElementById("pokemonName");
const pokemonNumber = document.getElementById("pokemonNumber");
const pokemonImage = document.getElementById("pokemonImage");
const pokemonDescription = document.getElementById("pokemonDescription");

const pokemonHeight = document.getElementById("pokemonHeight");
const pokemonWeight = document.getElementById("pokemonWeight");
const pokemonCategory = document.getElementById("pokemonCategory");

pokemonName.textContent = pokemon.name;
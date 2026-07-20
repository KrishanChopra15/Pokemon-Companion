// ========================================
// Pokémon Companion - National Pokédex
// ========================================

const pokemonGrid = document.getElementById("pokemonGrid");

const searchInput = document.getElementById("pokemonSearch");
const pokemonCount = document.getElementById("pokemonCount");

const generationFilter = document.getElementById("generationFilter");
const typeFilter = document.getElementById("typeFilter");
const sortPokemon = document.getElementById("sortPokemon");

let filteredPokemon = [...pokemonData];

// Render all Pokémon
function renderPokemon(pokemonList = filteredPokemon) {

    pokemonGrid.innerHTML = "";

    pokemonCount.textContent = pokemonList.length;

    pokemonList.forEach((pokemon) => {

        const card = document.createElement("article");

        card.className = "pokemon-card";

        card.innerHTML = `
        
            <button
                class="pokemon-card__favorite"
                data-id="${pokemon.id}"
                aria-label="Favorite ${pokemon.name}">

                ${isFavorite(pokemon.id) ? "❤️" : "🤍"}

            </button>

            <div class="pokemon-card__image">

                <img
                    src="${pokemon.image}"
                    alt="${pokemon.name}">

            </div>

            <span class="pokemon-card__number">

                ${pokemon.number}

            </span>

            <h3 class="pokemon-card__name">

                ${pokemon.name}

            </h3>

            <div class="pokemon-card__types">

                ${pokemon.types.map(type =>

                    `<span class="type type--${type.toLowerCase()}">

                        ${type}

                    </span>`

                ).join("")}

            </div>

            <button class="btn btn-primary pokemon-card__button">

                View Details

            </button>

        `;

        pokemonGrid.appendChild(card);
        const favoriteButton = card.querySelector(".pokemon-card__favorite");

        favoriteButton.addEventListener("click", () => {
        
            toggleFavorite(pokemon.id);
        
            renderPokemon(filteredPokemon);
        
        });
    });

}

// ========================================
// Apply All Filters
// ========================================

function applyFilters() {

    const searchText = searchInput.value.trim().toLowerCase();
    const selectedGeneration = generationFilter.value;
    const selectedType = typeFilter.value;
    const selectedSort = sortPokemon.value;

    filteredPokemon = pokemonData.filter((pokemon) => {

        const matchesSearch =
            pokemon.name.toLowerCase().includes(searchText) ||
            pokemon.number.includes(searchText);

        const matchesGeneration =
            selectedGeneration === "all" ||
            pokemon.generation === Number(selectedGeneration);

        const matchesType =
            selectedType === "all" ||
            pokemon.types.includes(selectedType);

        return matchesSearch && matchesGeneration && matchesType;

    });

    // Sorting
    switch (selectedSort) {

        case "number":
            filteredPokemon.sort((a, b) => a.id - b.id);
            break;

        case "number-desc":
            filteredPokemon.sort((a, b) => b.id - a.id);
            break;

        case "name":
            filteredPokemon.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            break;

        case "name-desc":
            filteredPokemon.sort((a, b) =>
                b.name.localeCompare(a.name)
            );
            break;

    }

    renderPokemon(filteredPokemon);

}

// ========================================
// Populate Type Filter
// ========================================

function populateTypeFilter() {

    const allTypes = new Set();

    pokemonData.forEach((pokemon) => {

        pokemon.types.forEach((type) => {

            allTypes.add(type);

        });

    });

    const sortedTypes = [...allTypes].sort();

    sortedTypes.forEach((type) => {

        const option = document.createElement("option");

        option.value = type;
        option.textContent = type;

        typeFilter.appendChild(option);

    });

}

// ========================================
// Event Listeners
// ========================================

searchInput.addEventListener("input", applyFilters);
generationFilter.addEventListener("change", applyFilters);
typeFilter.addEventListener("change", applyFilters);
sortPokemon.addEventListener("change", applyFilters);

// ========================================
// Initial Load
// ========================================

populateTypeFilter();
applyFilters();
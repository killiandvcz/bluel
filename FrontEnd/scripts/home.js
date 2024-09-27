let allWorks = [];


// Fonction pour récupérer les works depuis l'API
async function fetchWorks() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allWorks = await response.json();
        return allWorks;
    } catch (error) {
        console.error("Impossible de récupérer les works:", error);
        return [];
    }
}


// Fonction pour récupérer les catégories depuis l'API
async function fetchCategories() {
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Impossible de récupérer les catégories:", error);
        return [];
    }
}


// Fonction pour créer un élément de galerie
function createGalleryItem(work) {
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = work.imageUrl;
    img.alt = work.title;
    const figcaption = document.createElement('figcaption');
    figcaption.textContent = work.title;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    return figure;
}


// Fonction pour afficher les works dans la galerie
function displayWorks(works) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; // Vider la galerie existante
    works.forEach(work => {
        const galleryItem = createGalleryItem(work);
        gallery.appendChild(galleryItem);
    });
}


// Fonction pour créer les boutons de filtrage
function createFilterButtons(categories) {
    const filterContainer = document.querySelector('.filter-buttons');
    filterContainer.innerHTML = ''; // Vider le conteneur existant

    // Ajouter le bouton "Tous"
    const allButton = document.createElement('button');
    allButton.textContent = 'Tous';
    allButton.classList.add('filter-button', 'active');
    allButton.dataset.categoryId = 'all';
    filterContainer.appendChild(allButton);

    // Ajouter les boutons pour chaque catégorie
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.name;
        button.classList.add('filter-button');
        button.dataset.categoryId = category.id;
        filterContainer.appendChild(button);
    });

    // Ajouter les écouteurs d'événements pour le filtrage
    filterContainer.addEventListener('click', filterWorks);
}


// Fonction pour filtrer les works
function filterWorks(event) {
    if (event.target.classList.contains('filter-button')) {
        // Mettre à jour l'état actif des boutons
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        const categoryId = event.target.dataset.categoryId;
        let filteredWorks;

        if (categoryId === 'all') {
            filteredWorks = allWorks;
        } else {
            filteredWorks = allWorks.filter(work => work.categoryId == categoryId);
        }

        displayWorks(filteredWorks);
    }
}


// Fonction principale
async function initGallery() {
    allWorks = await fetchWorks();
    const categories = await fetchCategories();
    createFilterButtons(categories);
    displayWorks(allWorks);
}


// Exécuter la fonction principale au chargement de la page
document.addEventListener('DOMContentLoaded', initGallery);

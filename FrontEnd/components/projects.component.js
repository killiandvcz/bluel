// projects.js
import { auth } from "../scripts/auth.class.js";

class Modal extends HTMLElement {
    constructor(projects, closeModal) {
        super();
        this.projects = projects;
        this.closeModal = closeModal;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.querySelector('.close-modal').addEventListener('click', this.closeModal);
        this.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === this.querySelector('.modal-overlay')) {
                this.closeModal();
            }
        });
    }

    render() {
        this.innerHTML = `
        <style>
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .modal-content {
                background-color: white;
                padding: 20px;
                border-radius: 10px;
                max-width: 80%;
                max-height: 80%;
                overflow-y: auto;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            .close-modal {
                cursor: pointer;
                font-size: 24px;
            }
            .gallery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 10px;
            }
            .gallery-item {
                position: relative;
            }
            .gallery-item img {
                width: 100%;
                height: auto;
                object-fit: cover;
            }
            .delete-icon {
                position: absolute;
                top: 5px;
                right: 5px;
                background-color: black;
                color: white;
                padding: 2px;
                cursor: pointer;
            }
            .add-photo-btn {
                display: block;
                margin: 20px auto;
                padding: 10px 20px;
                background-color: #1D6154;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
        </style>
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Galerie photo</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="gallery-grid">
                    ${this.projects.map(project => `
                        <div class="gallery-item">
                            <img src="${project.imageUrl}" alt="${project.title}">
                            <span class="delete-icon">🗑️</span>
                        </div>
                    `).join('')}
                </div>
                <button class="add-photo-btn">Ajouter une photo</button>
            </div>
        </div>
        `;
    }
}

customElements.define('project-modal', Modal);



class ProjectTitle extends HTMLElement {
    constructor(openModal) {
        super();
        this.openModal = openModal;
    }

    connectedCallback() {
        this.render();
        if (auth.token) {
            this.querySelector('.edit-button').addEventListener('click', this.openModal);
        }
    }

    render() {
        this.innerHTML = `
        <style>
.projectsHead {
align-items: center;
justify-content: center;
display: flex;
margin-bottom: 30px;
gap: 25px;
h2{
margin: 0 !important;
}
.edit-button{
cursor: pointer;
display: flex;
align-items: center;
gap: 10px;
transition: all 0.3s ease;
&:hover{
color: #555555;
}
}
}
</style>
        <span class="projectsHead">
            <h2>Mes Projets</h2>
            ${auth.token ? `<span class="edit-button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5229 1.68576L13.8939 2.05679C14.1821 2.34503 14.1821 2.81113 13.8939 3.0963L13.0016 3.99169L11.5879 2.57808L12.4803 1.68576C12.7685 1.39751 13.2346 1.39751 13.5198 1.68576H13.5229ZM6.43332 7.73578L10.5484 3.61759L11.9621 5.03121L7.84387 9.14633C7.75494 9.23525 7.64455 9.29964 7.52496 9.33337L5.73111 9.84546L6.2432 8.05162C6.27693 7.93203 6.34133 7.82164 6.43025 7.73271L6.43332 7.73578ZM11.4408 0.646245L5.39074 6.6932C5.12397 6.95998 4.93078 7.28808 4.82959 7.64685L3.9526 10.7133C3.879 10.9708 3.94953 11.2468 4.13965 11.4369C4.32977 11.627 4.60574 11.6976 4.86332 11.624L7.92973 10.747C8.29156 10.6427 8.61967 10.4495 8.88338 10.1858L14.9334 4.13888C15.7951 3.27722 15.7951 1.87894 14.9334 1.01728L14.5624 0.646245C13.7007 -0.215415 12.3024 -0.215415 11.4408 0.646245ZM2.69844 1.84214C1.20816 1.84214 0 3.05031 0 4.54058V12.8812C0 14.3715 1.20816 15.5796 2.69844 15.5796H11.0391C12.5293 15.5796 13.7375 14.3715 13.7375 12.8812V9.44683C13.7375 9.039 13.4094 8.71089 13.0016 8.71089C12.5937 8.71089 12.2656 9.039 12.2656 9.44683V12.8812C12.2656 13.5589 11.7167 14.1078 11.0391 14.1078H2.69844C2.02076 14.1078 1.47188 13.5589 1.47188 12.8812V4.54058C1.47188 3.86291 2.02076 3.31402 2.69844 3.31402H6.13281C6.54065 3.31402 6.86875 2.98591 6.86875 2.57808C6.86875 2.17025 6.54065 1.84214 6.13281 1.84214H2.69844Z" fill="currentColor"/>
                </svg>
                modifier
            </span>` : ''}
        </span>
        `;
    }
}

customElements.define('project-title', ProjectTitle);

class FilterButtons extends HTMLElement {
    constructor(categories, onFilter) {
        super();
        this.categories = categories;
        this.onFilter = onFilter;
    }

    connectedCallback() {
        this.render();
        this.addEventListener('click', this.handleFilter.bind(this));
    }

    render() {
        if (!auth.token) {
            this.innerHTML = `
                <div class="filter-buttons">
                    <button class="filter-button active" data-category-id="all">Tous</button>
                    ${this.categories.map(category => `
                        <button class="filter-button" data-category-id="${category.id}">${category.name}</button>
                    `).join('')}
                </div>
            `;
        } else {
            this.innerHTML = ''; // Cacher les boutons si l'utilisateur est authentifié
        }
    }

    handleFilter(event) {
        if (!event.target.classList.contains('filter-button')) return;
        this.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.onFilter(event.target.dataset.categoryId);
    }
}

customElements.define('filter-buttons', FilterButtons);

export class Projects extends HTMLElement {
    constructor() {
        super();
        this.projects = [];
        this.categories = [];
        this.baseUrl = 'http://localhost:5678/api';
        this.isModalOpen = false;

        auth.onLogout(() => {
            this.updateView();
        });
    }

    connectedCallback() {
        this.innerHTML = `
            <section id="portfolio">
                <project-title></project-title>
                <filter-buttons></filter-buttons>
                <div class="gallery"></div>
            </section>
        `;
        this.initGallery();
    }

    async initGallery() {
        await Promise.all([this.fetchProjects(), this.fetchCategories()]);
        this.updateView();
    }

    updateView() {
        const title = new ProjectTitle(this.openModal.bind(this));
        this.querySelector('project-title').replaceWith(title);
        this.updateFilterButtons();
        this.displayProjects(this.projects);
    }

    openModal() {
        if (!this.isModalOpen) {
            const modal = new Modal(this.projects, this.closeModal.bind(this));
            document.body.appendChild(modal);
            this.isModalOpen = true;
        }
    }

    closeModal() {
        const modal = document.querySelector('project-modal');
        if (modal) {
            modal.remove();
            this.isModalOpen = false;
        }
    }

    updateFilterButtons() {
        const filterButtonsElement = this.querySelector('filter-buttons');
        if (filterButtonsElement) {
            filterButtonsElement.remove();
        }
        const newFilterButtons = new FilterButtons(this.categories, this.handleFilter.bind(this));
        this.querySelector('#portfolio').insertBefore(newFilterButtons, this.querySelector('.gallery'));
    }

    async fetchProjects() {
        try {
            const response = await fetch(`${this.baseUrl}/works`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.projects = await response.json();
        } catch (error) {
            console.error("Impossible de récupérer les projets:", error);
            this.projects = [];
        }
    }

    async fetchCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/categories`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.categories = await response.json();
        } catch (error) {
            console.error("Impossible de récupérer les catégories:", error);
            this.categories = [];
        }
    }

    handleFilter(categoryId) {
        const filteredProjects = categoryId === 'all'
            ? this.projects
            : this.projects.filter(project => project.categoryId == categoryId);
        this.displayProjects(filteredProjects);
    }

    displayProjects(projects) {
        const gallery = this.querySelector('.gallery');
        gallery.innerHTML = '';
        const fragment = document.createDocumentFragment();

        projects.forEach(project => {
            const projectElement = this.createProjectElement(project);
            fragment.appendChild(projectElement);
        });

        gallery.appendChild(fragment);
    }

    createProjectElement(project) {
        const figure = document.createElement('figure');
        figure.innerHTML = `
            <img src="${project.imageUrl}" alt="${project.title}">
            <figcaption>${project.title}</figcaption>
        `;
        return figure;
    }
}

customElements.define('my-projects', Projects);
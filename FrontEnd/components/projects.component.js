// projects.js
import { auth } from "../scripts/auth.class.js";

class Modal extends HTMLElement {
    constructor(projects, closeModal, categories, onProjectAdded, onProjectDeleted) {
        super();
        this.projects = projects;
        this.closeModal = closeModal;
        this.isAddingPhoto = false;
        this.categories = categories;
        this.isAddingPhoto = false;
        this.selectedFile = null;
        this.onProjectAdded = onProjectAdded;
        this.onProjectDeleted = onProjectDeleted;
    }

    connectedCallback() {
        this.render();
        // this.setupEventListeners();
    }

    setupEventListeners() {
        this.querySelector('.close-modal').addEventListener('click', this.closeModal);
        this.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === this.querySelector('.modal-overlay')) {
                this.closeModal();
            }
        });
        this.querySelector('.add-photo-btn')?.addEventListener('click', () => {
            this.isAddingPhoto = true;
            this.render();
        });
        this.querySelector('.back-modal')?.addEventListener('click', () => {
            this.isAddingPhoto = false;
            this.render();
        });

        if (this.isAddingPhoto) {
            const fileInput = this.querySelector('#file-upload');
            const photoUploadBtn = this.querySelector('.photo-upload-btn');
            const form = this.querySelector('.add-photo-form');

            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e);
            });

            photoUploadBtn.addEventListener('click', () => {
                fileInput.click();
            });

            form.addEventListener('input', () => {
                this.validateForm();
            });
        }

        if (this.isAddingPhoto) {
            const form = this.querySelector('.add-photo-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        if (!this.isAddingPhoto) {
            this.querySelectorAll('.delete-icon').forEach(icon => {
                icon.addEventListener('click', (e) => {
                    const projectId = e.target.closest('.gallery-item').dataset.projectId;
                    this.handleDeleteProject(projectId);
                });
            });
        }
    }

    async handleSubmit() {
        const titre = this.querySelector('#titre').value;
        const categorie = this.querySelector('#categorie').value;

        if (!this.selectedFile || !titre || !categorie) {
            alert("Veuillez remplir tous les champs et sélectionner une image.");
            return;
        }

        const formData = new FormData();
        formData.append('image', this.selectedFile);
        formData.append('title', titre);
        formData.append('category', categorie);

        try {
            const response = await fetch('http://localhost:5678/api/works', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Projet ajouté avec succès:', result);

            // Réinitialiser le formulaire
            this.querySelector('.add-photo-form').reset();
            this.selectedFile = null;
            this.querySelector('.photo-upload-area').innerHTML = this.getPhotoUploadAreaContent();

            // Mettre à jour la galerie
            if (this.onProjectAdded) {
                console.log('Appel de la fonction onProjectAdded');
                this.onProjectAdded(result);
            }
            console.log('Ajout du projet à la liste des projets', {result});
            this.projects.push(result);
            //delete doublon
            this.projects = this.projects.filter((project, index, self) =>
                index === self.findIndex((t) => (
                    t.id === project.id
                ))
            );


            // Optionnel : fermer la modale ou revenir à la vue galerie
            this.isAddingPhoto = false;
            this.render();

        } catch (error) {
            console.error('Erreur lors de l\'ajout du projet:', error);
            alert('Une erreur est survenue lors de l\'ajout du projet. Veuillez réessayer.');
        }
    }

    async handleDeleteProject(projectId) {
        console.log('Suppression du projet:', projectId);
        if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
            try {
                const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${auth.token}`
                    }
                });

                console.log('Réponse de la suppression:', response);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Suppression réussie, mettre à jour l'interface
                this.onProjectDeleted(projectId);
                this.projects = this.projects.filter(project => project.id != projectId);
                this.projects = this.projects.filter((project, index, self) =>
                        index === self.findIndex((t) => (
                            t.id === project.id
                        ))
                );
                console.log(this.projects);
                this.render();
            } catch (error) {
                console.error('Erreur lors de la suppression du projet:', error);
                alert('Une erreur est survenue lors de la suppression du projet. Veuillez réessayer.');
            }
        }
    }

    getPhotoUploadAreaContent() {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="58" height="58" viewBox="0 0 58 58" fill="none">
                <path d="M57 6H1C0.448 6 0 6.447 0 7V51C0 51.553 0.448 52 1 52H57C57.552 52 58 51.553 58 51V7C58 6.447 57.552 6 57 6ZM56 50H2V8H56V50Z" fill="#B9C5CC"/>
                <path d="M16 28.138C19.071 28.138 21.569 25.64 21.569 22.569C21.569 19.498 19.071 17 16 17C12.929 17 10.431 19.498 10.431 22.569C10.431 25.64 12.929 28.138 16 28.138ZM16 19C17.968 19 19.569 20.602 19.569 22.569C19.569 24.536 17.968 26.138 16 26.138C14.032 26.138 12.431 24.537 12.431 22.569C12.431 20.601 14.032 19 16 19Z" fill="#B9C5CC"/>
                <path d="M7.00004 46C7.23404 46 7.47004 45.918 7.66004 45.751L23.973 31.389L34.275 41.69C34.666 42.081 35.298 42.081 35.689 41.69C36.08 41.299 36.08 40.667 35.689 40.276L30.882 35.469L40.063 25.415L51.324 45.659C51.543 46.01 51.947 46.141 52.323 45.991C52.699 45.842 52.949 45.449 52.949 45.013V21C52.949 20.447 52.501 20 51.949 20C51.397 20 50.949 20.447 50.949 21V42.46L40.936 23.99C40.766 23.699 40.444 23.535 40.103 23.572C39.762 23.609 39.474 23.834 39.356 24.155L29.526 35.013L25.097 30.585C24.909 30.396 24.659 30.292 24.401 30.292C24.143 30.292 23.893 30.397 23.705 30.585L6.33904 45.751C5.94804 46.142 5.94804 46.774 6.33904 47.165C6.53004 47.357 6.76504 47.453 7.00004 47.453V46Z" fill="#B9C5CC"/>
            </svg>
            <input type="file" id="file-upload" accept="image/*" />
            <button type="button" class="photo-upload-btn">+ Ajouter photo</button>
            <span class="photo-upload-info">jpg, png : 4mo max</span>
        `;
    }

    handleFileSelection(event) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const photoUploadArea = this.querySelector('.photo-upload-area');
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.maxWidth = '100%';
            img.style.maxHeight = '200px';
            photoUploadArea.innerHTML = '';
            photoUploadArea.appendChild(img);
        }
        this.validateForm();
    }
    validateForm() {
        const titre = this.querySelector('#titre').value;
        const categorie = this.querySelector('#categorie').value;
        const submitBtn = this.querySelector('.valider-btn');

        if (this.selectedFile && titre && categorie) {
            submitBtn.style.backgroundColor = '#1D6154';
            submitBtn.disabled = false;
        } else {
            submitBtn.style.backgroundColor = '#A7A7A7';
            submitBtn.disabled = true;
        }
    }

    render() {
        this.innerHTML = this.isAddingPhoto ? this.renderAddPhotoForm() : this.renderGallery();
        this.setupEventListeners();
    }

    renderGallery() {
        return `
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
                width: 100%;
                max-width: 660px;
                max-height: 80%;
                box-sizing: border-box;             
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .modal-header {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                width:100% ;
                ._close {
                    align-self: flex-end; 
                    
                }
                h3 {
                    font-size: 30px;
                    margin-bottom: 25px;
                
                }
            }
            .close-modal {
                cursor: pointer;
                font-size: 24px;
            }
            .gallery-grid {
                width: 100%;
                max-width: 420px;   
                margin-bottom: 25px;
       
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
                gap: 20px 10px;
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
            .sep{
            display: block;
                width: 100%;
                max-width: 420px;
                height: 1px;
                background-color: black;
                margin: 20px 0;
                
                box-sizing: border-box;
            }
            .add-photo-btn {
                display: block;
                margin: 20px auto;
                padding: 10px 40px;
                border-radius: 50px;
                background-color: #1D6154;
                color: white;
                border: none;
                /*border-radius: 5px;*/
                cursor: pointer;
                font-family: 'Syne', sans-serif;
            }
        </style>
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="_close">
                        <span class="close-modal">&times;</span>
                    </div>
                    <h3>Galerie photo</h3>
                </div>
                <div class="gallery-grid">
                    ${this.projects.map(project => `
                        <div class="gallery-item" data-project-id="${project.id}">
                            <img src="${project.imageUrl}" alt="${project.title}">
                            <span class="delete-icon">🗑️</span>
                        </div>
                    `).join('')}
                </div>
                <span class="sep"></span>
                <button class="add-photo-btn">Ajouter une photo</button>
            </div>
        </div>
        `;
    }

    renderAddPhotoForm() {
        return `
        <style>
        .photo-upload-area img {
                max-width: 100%;
                max-height: 200px;
                object-fit: contain;
            }
            #file-upload {
                display: none;
            }
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
                width: 100%;
                max-width: 660px;
                max-height: 80%;
                box-sizing: border-box;             
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .modal-header {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                width:100% ;
                ._close {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    span{
                    cursor: pointer;
                    }
                }
                h3 {
                    font-size: 30px;
                    margin-bottom: 25px;
                
                }
            }
            .close-modal {
                cursor: pointer;
                font-size: 24px;
            }
            .add-photo-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
                width: 100%;
                max-width: 420px;
            }
            .photo-upload-area {
                background-color: #E8F1F6;
                border-radius: 3px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
            .photo-upload-area svg {
                width: 58px;
                height: 58px;
                color: #B9C5CC;
            }
            .photo-upload-btn {
                background-color: #CBD6DC;
                border-radius: 50px;
                padding: 10px 33px;
                color: #306685;
                font-weight: bold;
                border: none;
                cursor: pointer;
            }
            .photo-upload-info {
                font-size: 10px;
                color: #444444;
            }
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .form-group label {
                color: #515151;
                font-weight: 600;
            }
            .form-group input, .form-group select {
                box-sizing: border-box;
                height: 51px;
                font-size: 16px;
                font-family: "Work Sans", sans-serif;
                border: none;
                box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.09);
                padding: 10px;
            }
            .valider-btn {
                background-color: #A7A7A7;
                color: white;
                border: none;
                border-radius: 60px;
                padding: 10px 49px;
                font-family: 'Syne';
                font-weight: 700;
                font-size: 14px;
                align-self: center;
                cursor: pointer;
            }
        </style>
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="_close">
                        <span class="back-modal">&larr;</span>
                        <span class="close-modal">&times;</span>
                    </div>
                    <h3>Ajout photo</h3>
                </div>
                <form class="add-photo-form">
                    <div class="photo-upload-area">
                        ${this.getPhotoUploadAreaContent()}
                    </div>
                    <div class="form-group">
                        <label for="titre">Titre</label>
                        <input type="text" id="titre" name="titre" required>
                    </div>
                    <div class="form-group">
                        <label for="categorie">Catégorie</label>
                        <select id="categorie" name="categorie" required>
                            <option value="">Sélectionner une catégorie</option>
                            ${this.categories.map(category => `
                                <option value="${category.id}">${category.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <button type="submit" class="valider-btn" disabled>Valider</button>
                </form>
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
                <div class="main-gallery"></div>
            </section>
        `;
        this.initGallery();
    }

    async initGallery() {
        await Promise.all([this.fetchProjects(), this.fetchCategories()]);
        this.updateView();
    }

    updateView() {
        this.projects = this.projects.filter((project, index, self) =>
                index === self.findIndex((t) => (
                    t.id === project.id
                ))
        );
        const title = new ProjectTitle(this.openModal.bind(this));
        this.querySelector('project-title').replaceWith(title);
        this.updateFilterButtons();
        this.displayProjects(this.projects);
    }

    openModal() {
        if (!this.isModalOpen) {
            const modal = new Modal(
                this.projects,
                this.closeModal.bind(this),
                this.categories,
                this.onProjectAdded.bind(this),
                this.onProjectDeleted.bind(this)
            );
            document.body.appendChild(modal);
            this.isModalOpen = true;
        }
    }

    onProjectAdded(newProject) {
        console.log('Nouveau projet ajouté:', newProject);
        this.projects.push(newProject);
        this.updateView();
    }

    onProjectDeleted(projectId) {
        console.log('projets avant suppression', this.projects);
        this.projects = this.projects.filter(project => project.id != projectId);

        console.log('projets affichés', this.projects);
        this.updateView();
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
        this.querySelector('#portfolio').insertBefore(newFilterButtons, this.querySelector('.main-gallery'));
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
        const gallery = this.querySelector('.main-gallery');
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
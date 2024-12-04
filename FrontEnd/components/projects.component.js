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


            // Réinitialiser le formulaire
            this.querySelector('.add-photo-form').reset();
            this.selectedFile = null;
            this.querySelector('.photo-upload-area').innerHTML = this.getPhotoUploadAreaContent();

            // Mettre à jour la galerie
            if (this.onProjectAdded) {

                this.onProjectAdded(result);
            }

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

        if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
            try {
                const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${auth.token}`
                    }
                });



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

                this.render();
            } catch (error) {
                console.error('Erreur lors de la suppression du projet:', error);
                alert('Une erreur est survenue lors de la suppression du projet. Veuillez réessayer.');
            }
        }
    }

    getPhotoUploadAreaContent() {
        return `
            <svg width="70" height="61" viewBox="0 0 70 61" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M60.5517 6.88793C61.7228 6.88793 62.681 7.84612 62.681 9.01724V51.5768L62.0156 50.7118L43.9165 27.2894C43.3176 26.5042 42.3727 26.0517 41.3879 26.0517C40.4031 26.0517 39.4715 26.5042 38.8594 27.2894L27.8136 41.5824L23.7546 35.8998C23.1557 35.0614 22.1975 34.569 21.1595 34.569C20.1214 34.569 19.1632 35.0614 18.5644 35.9131L7.91783 50.8183L7.31896 51.6434V51.6034V9.01724C7.31896 7.84612 8.27715 6.88793 9.44827 6.88793H60.5517ZM9.44827 0.5C4.75048 0.5 0.93103 4.31945 0.93103 9.01724V51.6034C0.93103 56.3012 4.75048 60.1207 9.44827 60.1207H60.5517C65.2495 60.1207 69.069 56.3012 69.069 51.6034V9.01724C69.069 4.31945 65.2495 0.5 60.5517 0.5H9.44827ZM20.0948 26.0517C20.9337 26.0517 21.7644 25.8865 22.5394 25.5655C23.3144 25.2444 24.0186 24.7739 24.6118 24.1807C25.2049 23.5876 25.6755 22.8834 25.9965 22.1083C26.3175 21.3333 26.4828 20.5027 26.4828 19.6638C26.4828 18.8249 26.3175 17.9943 25.9965 17.2192C25.6755 16.4442 25.2049 15.74 24.6118 15.1468C24.0186 14.5537 23.3144 14.0831 22.5394 13.7621C21.7644 13.4411 20.9337 13.2759 20.0948 13.2759C19.2559 13.2759 18.4253 13.4411 17.6503 13.7621C16.8752 14.0831 16.171 14.5537 15.5779 15.1468C14.9847 15.74 14.5142 16.4442 14.1931 17.2192C13.8721 17.9943 13.7069 18.8249 13.7069 19.6638C13.7069 20.5027 13.8721 21.3333 14.1931 22.1083C14.5142 22.8834 14.9847 23.5876 15.5779 24.1807C16.171 24.7739 16.8752 25.2444 17.6503 25.5655C18.4253 25.8865 19.2559 26.0517 20.0948 26.0517Z" fill="#B9C5CC"/>
</svg>

            <input type="file" id="file-upload" accept="image/*" />
            <button type="button" class="photo-upload-btn">+ Ajouter photo</button>
            <span class="photo-upload-info">jpg, png : 4mo max</span>
        `;
    }

    handleFileSelection(event) {
        const file = event.target.files[0];
        const maxSize = 4 * 1024 * 1024; // 4 Mo en octets

        if (file) {
            if (file.size > maxSize) {
                alert("Le fichier est trop volumineux. La taille maximale autorisée est de 4 Mo.");
                event.target.value = ''; // Réinitialise l'input file
                this.selectedFile = null;
                return;
            }

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
                            <span class="delete-icon">
                                <svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.71607 0.35558C2.82455 0.136607 3.04754 0 3.29063 0H5.70938C5.95246 0 6.17545 0.136607 6.28393 0.35558L6.42857 0.642857H8.35714C8.71272 0.642857 9 0.930134 9 1.28571C9 1.64129 8.71272 1.92857 8.35714 1.92857H0.642857C0.287277 1.92857 0 1.64129 0 1.28571C0 0.930134 0.287277 0.642857 0.642857 0.642857H2.57143L2.71607 0.35558ZM0.642857 2.57143H8.35714V9C8.35714 9.70915 7.78058 10.2857 7.07143 10.2857H1.92857C1.21942 10.2857 0.642857 9.70915 0.642857 9V2.57143ZM2.57143 3.85714C2.39464 3.85714 2.25 4.00179 2.25 4.17857V8.67857C2.25 8.85536 2.39464 9 2.57143 9C2.74821 9 2.89286 8.85536 2.89286 8.67857V4.17857C2.89286 4.00179 2.74821 3.85714 2.57143 3.85714ZM4.5 3.85714C4.32321 3.85714 4.17857 4.00179 4.17857 4.17857V8.67857C4.17857 8.85536 4.32321 9 4.5 9C4.67679 9 4.82143 8.85536 4.82143 8.67857V4.17857C4.82143 4.00179 4.67679 3.85714 4.5 3.85714ZM6.42857 3.85714C6.25179 3.85714 6.10714 4.00179 6.10714 4.17857V8.67857C6.10714 8.85536 6.25179 9 6.42857 9C6.60536 9 6.75 8.85536 6.75 8.67857V4.17857C6.75 4.00179 6.60536 3.85714 6.42857 3.85714Z" fill="white"/>
                                </svg>
                            </span>
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
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="_close">
                        <span class="back-modal">
                        <svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.439478 7.94458C-0.146493 8.53055 -0.146493 9.48217 0.439478 10.0681L7.9399 17.5686C8.52587 18.1545 9.47748 18.1545 10.0635 17.5686C10.6494 16.9826 10.6494 16.031 10.0635 15.445L5.11786 10.5041H19.4999C20.3297 10.5041 21 9.83375 21 9.00402C21 8.17428 20.3297 7.50393 19.4999 7.50393H5.12255L10.0588 2.56303C10.6447 1.97706 10.6447 1.02545 10.0588 0.439478C9.47279 -0.146493 8.52118 -0.146493 7.93521 0.439478L0.43479 7.9399L0.439478 7.94458Z" fill="black"/>
</svg>

</span>
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
                    ${this.categories?.map(category => `
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

        this.projects.push(newProject);
        this.updateView();
    }

    onProjectDeleted(projectId) {

        this.projects = this.projects.filter(project => project.id != projectId);


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
// Attendez que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Empêche le formulaire d'être soumis normalement

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('http://localhost:5678/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Connexion réussie
                localStorage.setItem('authToken', data.token); // Stocke le token d'authentification
                localStorage.setItem('userId', data.userId); // Stocke l'ID de l'utilisateur si nécessaire
                window.location.href = './index.html'; // Redirection vers la page d'accueil
            } else {
                // Affiche un message d'erreur
                displayError(data.message || 'Erreur de connexion. Veuillez vérifier vos identifiants.');
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            displayError('Une erreur est survenue. Veuillez réessayer plus tard.');
        }
    });

    function displayError(message) {
        // Crée ou met à jour un élément pour afficher le message d'erreur
        let errorElement = document.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            loginForm.insertBefore(errorElement, loginForm.firstChild);
        }
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.marginBottom = '10px';
    }
});
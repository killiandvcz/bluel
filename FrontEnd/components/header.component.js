import {auth} from "../scripts/auth.class.js";

class Header extends HTMLElement {
    constructor() {
        super();
        auth.onLogout(() => this.render());
    }

    connectedCallback() {
        this.render();
    }

    render() {
        let btn = auth.token ? `
        <li><a class="logoutBtn">logout</a></li>
        ` : '<li><a href="./login.html">login</a></li>';

        this.innerHTML = `
      <header>
        <h1>Sophie Bluel <span>Architecte d'intérieur</span></h1>
        <nav>
          <ul>
            <li>projets</li>
            <li>contact</li>
            ${btn}
            <li><img src="./assets/icons/instagram.png" alt="Instagram"></li>
          </ul>
        </nav>
      </header>
    `;

        if (auth.token) {
            this.querySelector('.logoutBtn').onclick = () => auth.logout();
        }
    }
}

customElements.define('my-header', Header);
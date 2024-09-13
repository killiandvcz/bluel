class Header extends HTMLElement {
    constructor() {
        super();
        // this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.innerHTML = `
      <header>
        <h1>Sophie Bluel <span>Architecte d'intérieur</span></h1>
        <nav>
          <ul>
            <li>projets</li>
            <li>contact</li>
            <li>login</li>
            <li><img src="./assets/icons/instagram.png" alt="Instagram"></li>
          </ul>
        </nav>
      </header>
    `;
    }
}

customElements.define('my-header', Header);
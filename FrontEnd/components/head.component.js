class Head extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <meta charset="UTF-8">
        <title>Sophie Bluel - Architecte d'intérieur</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Work+Sans&display=swap" rel="stylesheet">
        <meta name="description" content="">
        <link rel="stylesheet" href="./assets/style.css">
        `
    }
}

customElements.define('my-head', Head);
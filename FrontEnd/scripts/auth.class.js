class Auth {
    constructor() {
        const token = localStorage.getItem("authToken");
        this.token = token || "";
        const userId = localStorage.getItem("userId");
        this.userId = userId || "";
    }

    handleLogout() {
        //this.handlers.forEach(handler => handler());
        this.handlers.has("logout") && this.handlers.get("logout").forEach(handler => handler());
    }
    handlers = new Map();
    onLogout(handler) {
        this.handlers.has("logout") || this.handlers.set("logout", new Set());
        const logoutHandlers = this.handlers.get("logout");
        logoutHandlers.add(handler);
    }

    logout() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        this.token = "";
        this.userId = "";
        this.handleLogout();
    }
}

export const auth = new Auth();
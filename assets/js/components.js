async function loadComponent(id, path) {
    try {
        const response = await fetch(path);
        const html = await response.text();
        document.getElementById(id).innerHTML = html;

        // Recarrega o script de navbar se necessário
        if (path.includes("navbar.html")) {
            const script = document.createElement("script");
            script.src = "assets/js/main.js";
            document.body.appendChild(script);
        }
    } catch (err) {
        console.error(`Erro ao carregar ${path}:`, err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Carrega automaticamente os placeholders se existirem
    if (document.getElementById("header-placeholder")) {
        loadComponent("header-placeholder", "/components/header.html");
    }
    if (document.getElementById("navbar-placeholder")) {
        loadComponent("navbar-placeholder", "/components/navbar.html");
    }
    if (document.getElementById("footer-placeholder")) {
        loadComponent("footer-placeholder", "/components/footer.html");
    }
});

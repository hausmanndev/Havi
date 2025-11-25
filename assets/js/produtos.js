// navbar toggling
const navbarShowBtn = document.querySelector('.navbar-show-btn');
const navbarCollapseDiv = document.querySelector('.navbar-collapse');
const navbarHideBtn = document.querySelector('.navbar-hide-btn');

if(navbarShowBtn && navbarCollapseDiv && navbarHideBtn){
    navbarShowBtn.addEventListener('click', function(){
        navbarCollapseDiv.classList.add('navbar-show');
    });
    navbarHideBtn.addEventListener('click', function(){
        navbarCollapseDiv.classList.remove('navbar-show');
    });
}

// stopping all animation and transition on resize
let resizeTimer;
window.addEventListener('resize', () =>{
    document.body.classList.add('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.body.classList.remove('resize-animation-stopper');
    }, 400);
});

function filtrarCategoria(cat) {
    const cards = document.querySelectorAll(".product-card");

    cards.forEach(card => {
        if (cat === "todos") {
            card.style.display = "block";
        } else {
            card.style.display = card.classList.contains(cat) ? "block" : "none";
        }
    });

    document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
}

function pesquisarProduto() {
    let filtro = document.getElementById("searchInput").value.toLowerCase();
    const cards = document.querySelectorAll(".product-card");

    cards.forEach(card => {
        let titulo = card.querySelector("h2").innerText.toLowerCase();

        card.style.display = titulo.includes(filtro) ? "block" : "none";
    });

    document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
}


/* ============================
      Produtos (EXEMPLO)
============================ */
const PRODUCTS = [
    { id: "p001", name: "Montagem Básica", price: 149.90, img: "https://via.placeholder.com/150?text=Montagem" },
    { id: "p002", name: "Upgrade SSD 480GB", price: 269.00, img: "https://via.placeholder.com/150?text=SSD" },
    { id: "p003", name: "Fonte 600W 80+ Bronze", price: 319.00, img: "https://via.placeholder.com/150?text=Fonte" },
    { id: "p004", name: "Limpeza e Manutenção", price: 89.90, img: "https://via.placeholder.com/150?text=Limpeza" },
    { id: "p005", name: "Instalação de SO", price: 129.00, img: "https://via.placeholder.com/150?text=SO" }
];

/* ============================
        Funções utilitárias
============================ */
const currency = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const onlyDigits = s => (s || "").replace(/\D/g, "");

/* ============================
         Variáveis DOM
============================ */
const $productList = document.getElementById("product-list");
const $cartItems = document.getElementById("cart-items");
const $subtotal = document.getElementById("subtotal");

/* ============================
        Carrinho (localStorage)
============================ */
let CART = loadCart();

function loadCart() {
    try {
        const raw = localStorage.getItem("encomendar_cart");
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveCart() {
    localStorage.setItem("encomendar_cart", JSON.stringify(CART));
    renderCart();
}

/* ============================
        Controle carrinho
============================ */
function addToCart(id) {
    if (!CART[id]) CART[id] = { qty: 0, ...PRODUCTS.find(p => p.id === id) };
    CART[id].qty++;
    saveCart();
}
function removeFromCart(id) {
    if (!CART[id]) return;
    CART[id].qty--;
    if (CART[id].qty <= 0) delete CART[id];
    saveCart();
}
function setQty(id, qty) {
    qty = Math.max(0, parseInt(qty) || 0);
    if (qty === 0) delete CART[id];
    else CART[id].qty = qty;
    saveCart();
}

/* ============================
        Renderização
============================ */
function renderProducts() {
    $productList.innerHTML = "";
    PRODUCTS.forEach(p => {
        const item = document.createElement("div");
        item.className = "prod";
        item.innerHTML = `
            <img src="${p.img}" alt="${p.name}">
            <div class="prod-info">
                <strong>${p.name}</strong>
                <div class="muted">${currency(p.price)}</div>
            </div>
            <button class="btn small secondary" data-add="${p.id}">Adicionar</button>
        `;
        $productList.appendChild(item);
    });

    $productList.addEventListener("click", e => {
        const id = e.target.getAttribute("data-add");
        if (id) addToCart(id);
    });
}

function renderCart() {
    $cartItems.innerHTML = "";
    let subtotal = 0;
    const ids = Object.keys(CART);

    if (ids.length === 0) {
        $cartItems.innerHTML = `<div class="muted">Carrinho vazio.</div>`;
        $subtotal.textContent = "R$ 0,00";
        return;
    }

    ids.forEach(id => {
        const it = CART[id];
        subtotal += it.qty * it.price;

        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
            <img src="${it.img}">
            <div class="ci-info">
                <div><strong>${it.name}</strong></div>
                <div class="muted">${currency(it.price)} x ${it.qty}</div>
            </div>
            <div class="qty">
                <button data-dec="${id}">-</button>
                <input type="number" value="${it.qty}" data-qty="${id}">
                <button data-inc="${id}">+</button>
            </div>
            <button class="btn small secondary" data-remove="${id}">Remover</button>
        `;
        $cartItems.appendChild(row);
    });

    $subtotal.textContent = currency(subtotal);

    /* Eventos */
    $cartItems.querySelectorAll("[data-inc]").forEach(b =>
        b.addEventListener("click", () => addToCart(b.dataset.inc))
    );

    $cartItems.querySelectorAll("[data-dec]").forEach(b =>
        b.addEventListener("click", () => removeFromCart(b.dataset.dec))
    );

    $cartItems.querySelectorAll("[data-remove]").forEach(b =>
        b.addEventListener("click", () => setQty(b.dataset.remove, 0))
    );

    $cartItems.querySelectorAll("[data-qty]").forEach(inp =>
        inp.addEventListener("change", () => setQty(inp.dataset.qty, inp.value))
    );
}

/* ============================
      Validação e envio
============================ */
document.getElementById("checkout").addEventListener("click", () => {
    const form = document.getElementById("order-form");
    const errors = document.querySelectorAll(".error");
    errors.forEach(e => (e.style.display = "none"));

    let ok = true;

    if (!form.nome.value.trim()) showError("nome"), ok = false;
    if (!/^\d{10,11}$/.test(onlyDigits(form.telefone.value))) showError("telefone"), ok = false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value)) showError("email"), ok = false;
    if (!/^\d{8}$/.test(onlyDigits(form.cep.value))) showError("cep"), ok = false;
    if (!form.endereco.value.trim()) showError("endereco"), ok = false;

    if (Object.keys(CART).length === 0) {
        alert("Carrinho vazio!");
        ok = false;
    }

    if (!ok) return;

    const order = {
        cliente: {
            nome: form.nome.value.trim(),
            telefone: form.telefone.value.trim(),
            email: form.email.value.trim(),
            cep: form.cep.value.trim(),
            endereco: form.endereco.value.trim(),
            cidade: form.cidade.value.trim(),
            estado: form.estado.value
        },
        itens: Object.values(CART),
        subtotal: Object.values(CART).reduce((s, i) => s + i.qty * i.price, 0),
        observacoes: form.observacoes.value.trim(),
        criado_em: new Date().toISOString()
    };

    console.log("PEDIDO:", order);
    alert("Pedido validado! Veja no console o objeto final para envio.");
});

function showError(campo) {
    document.querySelector(`.error[data-for="${campo}"]`).style.display = "block";
}

/* ============================
      Máscaras simples
============================ */
document.getElementById("telefone").addEventListener("input", e => {
    let v = onlyDigits(e.target.value).slice(0, 11);
    if (v.length > 2 && v.length <= 6) v = v.replace(/^(\d{2})(\d+)/, "($1) $2");
    if (v.length > 6 && v.length <= 10) v = v.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    e.target.value = v;
});

document.getElementById("cep").addEventListener("input", e => {
    let v = onlyDigits(e.target.value).slice(0, 8);
    if (v.length > 5) v = v.replace(/^(\d{5})(\d+)/, "$1-$2");
    e.target.value = v;
});

/* ============================
      VIA CEP — Auto preenchimento
============================ */
const cepField = document.getElementById("cep");
const enderecoField = document.getElementById("endereco");
const cidadeField = document.getElementById("cidade");
const estadoField = document.getElementById("estado");

// Ao sair do campo CEP -> busca automaticamente
cepField.addEventListener("blur", async () => {
    const cep = onlyDigits(cepField.value);

    if (cep.length !== 8) {
        return; // deixa validação original cuidar
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            alert("CEP não encontrado.");
            return;
        }

        // Monta endereço completo
        let endereco = `${data.logradouro || ""}`;
        if (data.bairro) endereco += ` - ${data.bairro}`;

        enderecoField.value = endereco.trim();
        cidadeField.value = data.localidade || "";
        
        // Seleciona o estado dentro do <select>
        if ([...estadoField.options].some(opt => opt.value === data.uf)) {
            estadoField.value = data.uf;
        } else {
            estadoField.value = "Outros";
        }

    } catch (err) {
        console.error("Erro ViaCEP:", err);
        alert("Erro ao consultar o CEP. Tente novamente.");
    }
});

/* ============================
      Inicialização
============================ */
renderProducts();
renderCart();

/* Expor para debug */
window.ENCOMENDAR = { CART, addToCart, removeFromCart, setQty };

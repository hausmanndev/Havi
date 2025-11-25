/* =======================================================
      Funções utilitárias
======================================================= */
const currency = v =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const onlyDigits = s => (s || "").replace(/\D/g, "");

/* =======================================================
      Variáveis de elementos da página
======================================================= */
const $productSelect = document.getElementById("product-select");
const $cartItems = document.getElementById("cart-items");
const $subtotal = document.getElementById("subtotal");
const $clearCartBtn = document.getElementById("clear-cart");

/* =======================================================
      Carrinho salvo no localStorage
======================================================= */
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

/* =======================================================
      Carregar estados e preencher o <select>
======================================================= */
async function loadStates() {
    try {
        const response = await fetch("/assets/data/estados.json");
        const estados = await response.json();

        const select = document.getElementById("estado");

        // Garante que só a primeira opção "Selecione" fique
        select.innerHTML = `<option value="">Selecione</option>`;

        estados.forEach(est => {
            const option = document.createElement("option");
            option.value = est.sigla;
            option.textContent = est.sigla;
            select.appendChild(option);
        });

    } catch (err) {
        console.error("Erro ao carregar estados:", err);
    }
}

/* =======================================================
      Carregar produtos e preencher o <select>
======================================================= */
async function loadProductsSelect() {
    try {
        const response = await fetch("/assets/data/produtos.json");
        const products = await response.json();

        // limpa o select
        $productSelect.innerHTML = `<option value="">Selecione</option>`;

        // adiciona opções
        products.forEach(p => {
            const option = document.createElement("option");
            option.value = p.nome;
            option.dataset.preco = p.preco;
            option.textContent = `${p.nome} – ${currency(p.preco)}`;
            $productSelect.appendChild(option);
        });

    } catch (err) {
        console.error("Erro ao carregar produtos:", err);
    }
}

/* =======================================================
      Adiciona produto ao carrinho ao selecionar no <select>
======================================================= */
$productSelect.addEventListener("change", function () {
    const option = this.options[this.selectedIndex];
    if (!option.value) return;

    const name = option.value;
    const price = Number(option.dataset.preco);

    // verifica se já existe
    let itemId = null;
    Object.keys(CART).forEach(id => {
        if (CART[id].name === name) itemId = id;
    });

    if (!itemId) {
        itemId = "prod_" + Date.now();
        CART[itemId] = { name, price, qty: 0 };
    }

    CART[itemId].qty++;
    saveCart();

    this.value = ""; // volta para "Selecione"
});

/* =======================================================
      Renderiza carrinho
======================================================= */
function renderCart() {
    $cartItems.innerHTML = "";
    let subtotal = 0;
    const ids = Object.keys(CART);

    if (ids.length === 0) {
        $cartItems.innerHTML = `<div class="muted">Carrinho vazio.</div>`;
        $subtotal.textContent = currency(0);
        return;
    }

    ids.forEach(id => {
        const it = CART[id];
        subtotal += it.qty * it.price;

        const row = document.createElement("div");
        row.className = "cart-item";

        row.innerHTML = `
            <div class="ci-info">
                <strong>${it.name}</strong>
                <div class="muted">${currency(it.price)} x ${it.qty}</div>
            </div>

            <div class="qty">
                <button data-dec="${id}">-</button>
                <input type="number" data-qty="${id}" value="${it.qty}">
                <button data-inc="${id}">+</button>
            </div>

            <button class="btn small secondary" data-remove="${id}">Remover</button>
        `;

        $cartItems.appendChild(row);
    });

    $subtotal.textContent = currency(subtotal);

    // botões +
    $cartItems.querySelectorAll("[data-inc]").forEach(btn => {
        btn.addEventListener("click", () => {
            CART[btn.dataset.inc].qty++;
            saveCart();
        });
    });

    // botões -
    $cartItems.querySelectorAll("[data-dec]").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.dec;
            CART[id].qty--;
            if (CART[id].qty <= 0) delete CART[id];
            saveCart();
        });
    });

    // remover
    $cartItems.querySelectorAll("[data-remove]").forEach(btn => {
        btn.addEventListener("click", () => {
            delete CART[btn.dataset.remove];
            saveCart();
        });
    });

    // alterar digitando
    $cartItems.querySelectorAll("[data-qty]").forEach(inp => {
        inp.addEventListener("change", () => {
            const id = inp.dataset.qty;
            const q = Math.max(0, parseInt(inp.value) || 0);
            if (q === 0) delete CART[id];
            else CART[id].qty = q;
            saveCart();
        });
    });
}

/* =======================================================
      Botão Limpar
======================================================= */
if ($clearCartBtn) {
    $clearCartBtn.addEventListener("click", () => {
        CART = {};
        localStorage.removeItem("encomendar_cart");
        renderCart();
        $productSelect.value = "";
    });
}

/* =======================================================
      Checkout — validação do formulário
======================================================= */
document.getElementById("checkout").addEventListener("click", () => {
    const form = document.getElementById("order-form");

    // Some os erros anteriores
    document.querySelectorAll(".error").forEach(e => {
        e.style.display = "none";
    });

    let ok = true;

    // Valida Hospital
    if (!form.nome.value.trim()) {
        showError("nome");
        ok = false;
    }

    // Valida telefone (10 ou 11 dígitos)
    if (!/^\d{10,11}$/.test(onlyDigits(form.telefone.value))) {
        showError("telefone");
        ok = false;
    }

    // Valida E-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value)) {
        showError("email");
        ok = false;
    }

    // Valida CEP
    if (!/^\d{8}$/.test(onlyDigits(form.cep.value))) {
        showError("cep");
        ok = false;
    }

    // Valida Número
    if (!onlyDigits(form.numero.value.trim())) {
        showError("numero");
        ok = false;
    }

    // Valida Endereço
    if (!form.endereco.value.trim()) {
        showError("endereco");
        ok = false;
    }

    // Valida Cidade
    if (!form.cidade.value.trim()) {
        showError("cidade");
        ok = false;
    }

    // Valida Estado
    if (!form.estado.value.trim()) {
        showError("estado");
        ok = false;
    }

    // Carrinho vazio
    if (Object.keys(CART).length === 0) {
        alert("Carrinho vazio!");
        ok = false;
    }

    if (!ok) return;

    // Monta objeto do pedido
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

    // 1. Mostrar mensagem dentro do carrinho
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = `
        <div style="
            padding: 1rem;
            margin-top: .5rem;
            text-align:center;
            color: #2e7d32;
            font-weight: 600;
        ">
            Pedido realizado com sucesso! ✔️
        </div>
    `;

    // 2. Zerar subtotal
    document.getElementById("subtotal").textContent = "R$ 0,00";

    // 3. Limpar carrinho (array / objeto)
    for (const key in CART) delete CART[key];
    localStorage.removeItem("cart");

    // 4. Limpar todos os campos do formulário
    form.reset();

    // 5. Exibir modal OU alert (use o que preferir)
    // alert("Pedido realizado com sucesso! Acompanhe o andamento no seu e-mail.");
    document.getElementById("success-modal").style.display = "flex";
});

/* Mostra o erro usando os elementos <div class="error" data-for="..."> */
function showError(campo) {
    const el = document.querySelector(`.error[data-for="${campo}"]`);
    if (el) el.style.display = "block";
}

/* =======================================================
      Máscaras de telefone e CEP
======================================================= */
const telefoneEl = document.getElementById("telefone");
if (telefoneEl) {
    telefoneEl.addEventListener("input", e => {
        let v = onlyDigits(e.target.value).slice(0, 11);
        if (v.length > 2 && v.length <= 6) v = v.replace(/^(\d{2})(\d+)/, "($1) $2");
        if (v.length > 6 && v.length <= 10) v = v.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
        if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        e.target.value = v;
    });
}

const cepEl = document.getElementById("cep");
if (cepEl) {
    cepEl.addEventListener("input", e => {
        let v = onlyDigits(e.target.value).slice(0, 8);
        if (v.length > 5) v = v.replace(/^(\d{5})(\d+)/, "$1-$2");
        e.target.value = v;
    });
}

/* =======================================================
      VIA CEP — preenchimento automático
======================================================= */
const cepField = document.getElementById("cep");
const enderecoField = document.getElementById("endereco");
const cidadeField = document.getElementById("cidade");
const estadoField = document.getElementById("estado");

if (cepField) {
    cepField.addEventListener("blur", async () => {
        const cep = onlyDigits(cepField.value);
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                alert("CEP não encontrado.");
                return;
            }

            let endereco = `${data.logradouro || ""}`;
            if (data.bairro) endereco += ` - ${data.bairro}`;

            enderecoField.value = endereco.trim();
            cidadeField.value = data.localidade || "";
            estadoField.value = data.uf || "Outros";

        } catch (err) {
            console.error("Erro ViaCEP:", err);
            alert("Erro ao consultar o CEP.");
        }
    });
}

/* =======================================================
      Inicialização
======================================================= */
loadProductsSelect();
renderCart();
loadStates();

/* Expor para debug */
window.ENCOMENDAR = { CART };

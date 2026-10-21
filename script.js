"use strict";

const products = [
    {
        id: 1,
        name: "Aashirvaad Atta",
        price: 250,
        category: "Grocery",
        emoji: "🌾",
        description: "Everyday kitchen essential",
        stock: 10
    },
    {
        id: 2,
        name: "Tata Salt",
        price: 28,
        category: "Grocery",
        emoji: "🧂",
        description: "A daily cooking staple",
        stock: 20
    },
    {
        id: 3,
        name: "Basmati Rice",
        price: 120,
        category: "Grocery",
        emoji: "🍚",
        description: "Rice for everyday meals",
        stock: 15
    },
    {
        id: 4,
        name: "Fresh Milk",
        price: 60,
        category: "Dairy",
        emoji: "🥛",
        description: "Everyday dairy essential",
        stock: 15
    },
    {
        id: 5,
        name: "Butter",
        price: 58,
        category: "Dairy",
        emoji: "🧈",
        description: "A creamy kitchen favourite",
        stock: 12
    },
    {
        id: 6,
        name: "Parle-G Biscuits",
        price: 10,
        category: "Snacks",
        emoji: "🍪",
        description: "A classic tea-time snack",
        stock: 30
    },
    {
        id: 7,
        name: "Potato Chips",
        price: 20,
        category: "Snacks",
        emoji: "🍟",
        description: "A crunchy little treat",
        stock: 20
    },
    {
        id: 8,
        name: "Dishwash Liquid",
        price: 99,
        category: "Household",
        emoji: "🧴",
        description: "An everyday home essential",
        stock: 8
    }
];

const cart = new Map();

let activeCategory = "All";
let toastTimer;

const productList = document.getElementById("product-list");
const searchInput = document.getElementById("search");
const cartCount = document.getElementById("cart-count");
const cartDrawer = document.getElementById("cart-drawer");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutSection = document.getElementById("checkout");
const orderForm = document.getElementById("order-form");

function formatPrice(value) {
    return new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2
    }).format(value);
}

function getCartCount() {
    let count = 0;

    for (const quantity of cart.values()) {
        count += quantity;
    }

    return count;
}

function getCartTotal() {
    let total = 0;

    for (const [id, quantity] of cart.entries()) {
        const product = products.find(item => item.id === id);

        if (product) {
            total += product.price * quantity;
        }
    }

    return total;
}

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("visible");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("visible");
    }, 2400);
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

function renderProducts() {
    const query = searchInput.value.trim().toLowerCase();

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query);

        const matchesCategory =
            activeCategory === "All" ||
            product.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    productList.replaceChildren();

    document.getElementById("empty-message").hidden =
        filteredProducts.length !== 0;

    filteredProducts.forEach(product => {
        const card = createElement("article", "product-card");

        const visual = createElement("div", "product-visual");

        const emoji = createElement(
            "span",
            "product-emoji",
            product.emoji
        );

        const label = createElement(
            "span",
            "product-label",
            product.stock > 0 ? "AVAILABLE" : "SOLD OUT"
        );

        visual.append(emoji, label);

        const info = createElement("div", "product-info");

        const category = createElement(
            "span",
            "product-category",
            product.category
        );

        const name = createElement("h3", "", product.name);

        const description = createElement(
            "p",
            "product-description",
            product.description
        );

        const bottom = createElement("div", "product-bottom");

        const price = createElement(
            "span",
            "product-price",
            `₹${formatPrice(product.price)}`
        );

        const button = createElement(
            "button",
            "add-button",
            product.stock === 0 ? "Sold Out" : "+ Add"
        );

        button.disabled =
            product.stock === 0 ||
            (cart.get(product.id) || 0) >= product.stock;

        button.addEventListener("click", () => {
            addToCart(product.id);
        });

        bottom.append(price, button);
        info.append(category, name, description, bottom);
        card.append(visual, info);

        productList.appendChild(card);
    });
}

function addToCart(id) {
    const product = products.find(item => item.id === id);

    if (!product) return;

    const quantity = cart.get(id) || 0;

    if (quantity >= product.stock) {
        showToast("Available stock limit reached.");
        return;
    }

    cart.set(id, quantity + 1);

    renderCart();
    renderProducts();

    showToast(`${product.name} added to your cart!`);
}

function changeQuantity(id, amount) {
    const product = products.find(item => item.id === id);

    if (!product) return;

    const current = cart.get(id) || 0;
    const updated = current + amount;

    if (updated <= 0) {
        cart.delete(id);
    } else if (updated <= product.stock) {
        cart.set(id, updated);
    } else {
        showToast("Available stock limit reached.");
        return;
    }

    renderCart();
    renderProducts();
}

function renderCart() {
    cartItems.replaceChildren();

    if (cart.size === 0) {
        const empty = createElement(
            "p",
            "",
            "Your basket is empty. Explore our products to get started!"
        );

        empty.style.color = "var(--muted)";
        empty.style.padding = "25px 0";

        cartItems.appendChild(empty);
    }

    for (const [id, quantity] of cart.entries()) {
        const product = products.find(item => item.id === id);

        if (!product) continue;

        const row = createElement("div", "cart-row");

        const emoji = createElement(
            "span",
            "cart-row-emoji",
            product.emoji
        );

        const info = createElement("div", "cart-row-info");

        const name = createElement("strong", "", product.name);

        const subtotal = createElement(
            "small",
            "",
            `₹${formatPrice(product.price * quantity)}`
        );

        info.append(name, subtotal);

        const controls = createElement("div", "quantity-controls");

        const minus = createElement("button", "", "−");
        minus.setAttribute(
            "aria-label",
            `Remove one ${product.name}`
        );

        minus.addEventListener("click", () => {
            changeQuantity(id, -1);
        });

        const quantityText = createElement(
            "span",
            "",
            String(quantity)
        );

        const plus = createElement("button", "", "+");
        plus.setAttribute("aria-label", `Add one ${product.name}`);

        plus.disabled = quantity >= product.stock;

        plus.addEventListener("click", () => {
            changeQuantity(id, 1);
        });

        controls.append(minus, quantityText, plus);
        row.append(emoji, info, controls);

        cartItems.appendChild(row);
    }

    cartCount.textContent = String(getCartCount());

    const total = formatPrice(getCartTotal());

    cartTotal.textContent = total;
    document.getElementById("checkout-total").textContent = total;
}

function openCart() {
    cartDrawer.hidden = false;
    overlay.hidden = false;
    document.body.classList.add("cart-open");

    document.getElementById("close-cart").focus();
}

function closeCart() {
    cartDrawer.hidden = true;
    overlay.hidden = true;
    document.body.classList.remove("cart-open");

    document.getElementById("open-cart").focus();
}

function goToCheckout() {
    if (cart.size === 0) {
        showToast("Add a product before checkout.");
        return;
    }

    closeCart();

    checkoutSection.hidden = false;

    checkoutSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

document.getElementById("open-cart").addEventListener("click", openCart);

document.getElementById("close-cart").addEventListener("click", closeCart);

overlay.addEventListener("click", closeCart);

document.getElementById("go-checkout").addEventListener(
    "click",
    goToCheckout
);

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !cartDrawer.hidden) {
        closeCart();
    }
});

searchInput.addEventListener("input", renderProducts);

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.category;

        document.querySelectorAll(".filter").forEach(filter => {
            filter.classList.toggle("active", filter === button);
        });

        renderProducts();
    });
});

document.querySelectorAll(".category-card").forEach(button => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.category;

        document.querySelectorAll(".filter").forEach(filter => {
            filter.classList.toggle(
                "active",
                filter.dataset.category === activeCategory
            );
        });

        renderProducts();

        document.getElementById("products").scrollIntoView({
            behavior: "smooth"
        });
    });
});

orderForm.addEventListener("submit", event => {
    event.preventDefault();

    if (cart.size === 0) {
        showToast("Your cart is empty.");
        return;
    }

    const phone = document.getElementById("customer-phone")
        .value.trim();

    if (!/^[0-9]{10}$/.test(phone)) {
        showToast("Enter a valid 10-digit mobile number.");
        return;
    }

    const orderMessage = document.getElementById("order-message");

    orderMessage.textContent =
        "This demo order has not been sent to a real store. " +
        "A secure backend is required to submit and track orders.";

    showToast("Demo completed! Backend integration is still needed.");

    // This demo deliberately does not store or transmit customer details.
});

document.getElementById("year").textContent =
    String(new Date().getFullYear());

renderProducts();
renderCart();
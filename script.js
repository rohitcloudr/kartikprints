// Default products loaded from products.json if no local data exists
const DEFAULT_PRODUCTS_URL = 'products.json';

let products = [];
let editingProductId = null;
let currentImageData = null;
const WHATSAPP_NUMBER = '+919699162625'; // CHANGE THIS TO YOUR WHATSAPP NUMBER
const ADMIN_CODE = '250515'; // CHANGE THIS TO YOUR SECURITY CODE

// ============ INITIAL LOAD ============
async function loadProducts() {
    const stored = localStorage.getItem('luxefitProducts');
    if (stored) {
        products = JSON.parse(stored);
    } else {
        try {
            const response = await fetch(DEFAULT_PRODUCTS_URL);
            products = await response.json();
        } catch (err) {
            products = [];
        }
    }
    renderProducts();
}

// ============ SECURITY CODE FUNCTIONS ============
function switchView(view) {
    if (view === 'admin') {
        document.getElementById('securityModal').classList.add('show');
        resetSecurityCode();
        return;
    }

    const customerView = document.getElementById('customerView');
    const adminView = document.getElementById('adminView');
    const buttons = document.querySelectorAll('.nav-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.nav-btn').classList.add('active');

    customerView.classList.add('active');
    adminView.classList.remove('active');
    filterProducts();
}

function moveToNext(element, index) {
    const value = element.value;

    if (!/^\d*$/.test(value)) {
        element.value = '';
        return;
    }

    if (value && index < 4) {
        document.getElementById(`digit${index + 1}`).focus();
    }

    document.getElementById('errorMessage').classList.remove('show');
    document.querySelectorAll('.code-digit').forEach(el => el.classList.remove('error'));
}

function getSecurityCode() {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += document.getElementById(`digit${i}`).value;
    }
    return code;
}

function resetSecurityCode() {
    for (let i = 0; i < 6; i++) {
        document.getElementById(`digit${i}`).value = '';
        document.getElementById(`digit${i}`).classList.remove('error');
    }
    document.getElementById('errorMessage').classList.remove('show');
    document.getElementById('successMessage').classList.remove('show');
    document.getElementById('digit0').focus();
}

function verifySecurityCode() {
    const enteredCode = getSecurityCode();

    if (enteredCode.length !== 6) {
        showSecurityError('Please enter 6 digits');
        return;
    }

    if (enteredCode === ADMIN_CODE) {
        document.getElementById('successMessage').textContent = '✓ Access granted!';
        document.getElementById('successMessage').classList.add('show');

        setTimeout(() => {
            closeSecurityModal();
            openAdminView();
        }, 800);
    } else {
        showSecurityError('Invalid security code. Try again!');
        document.querySelectorAll('.code-digit').forEach(el => {
            el.classList.add('error');
            el.value = '';
        });
        document.getElementById('digit0').focus();
    }
}

function showSecurityError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = '✕ ' + message;
    errorEl.classList.add('show');
}

function closeSecurityModal() {
    document.getElementById('securityModal').classList.remove('show');
    resetSecurityCode();
}

function openAdminView() {
    const customerView = document.getElementById('customerView');
    const adminView = document.getElementById('adminView');
    const buttons = document.querySelectorAll('.nav-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    buttons[1].classList.add('active');

    customerView.classList.remove('active');
    adminView.classList.add('active');
    renderAdminProducts();
}

window.addEventListener('click', function (event) {
    const securityModal = document.getElementById('securityModal');
    if (event.target === securityModal) {
        closeSecurityModal();
    }
});

// ============ RENDER FUNCTIONS ============
function renderProducts() {
    const container = document.getElementById('productsContainer');
    const emptyState = document.getElementById('emptyState');

    container.innerHTML = '';

    if (products.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <span class="product-badge">New</span>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description || 'Premium quality product'}</div>
                <div class="product-footer">
                    <span class="product-price">₹${product.price.toLocaleString()}</span>
                    <button class="btn btn-primary" onclick="buyProduct(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Buy
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterProducts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search) ||
            (p.description || '').toLowerCase().includes(search);
        const matchCategory = !category || p.category === category;
        return matchSearch && matchCategory;
    });

    const container = document.getElementById('productsContainer');
    const emptyState = document.getElementById('emptyState');

    container.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    filtered.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <span class="product-badge">New</span>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description || 'Premium quality product'}</div>
                <div class="product-footer">
                    <span class="product-price">₹${product.price.toLocaleString()}</span>
                    <button class="btn btn-primary" onclick="buyProduct(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Buy
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function buyProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const message = `Hi! I'm interested in: ${product.name} - ₹${product.price}`;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappLink, '_blank');
}

function renderAdminProducts() {
    const container = document.getElementById('adminProductsContainer');
    const emptyState = document.getElementById('adminEmptyState');

    container.innerHTML = '';

    if (products.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'admin-product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="admin-product-image">
            <div class="admin-product-body">
                <div class="admin-product-name">${product.name}</div>
                <div style="font-size: 0.85rem; color: var(--gray); margin-bottom: 0.5rem;">${product.category}</div>
                <div class="admin-product-price">₹${product.price.toLocaleString()}</div>
                <div class="admin-actions">
                    <button class="btn btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// ============ IMAGE UPLOAD ============
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showAlert('Please select a valid image file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageData = e.target.result;
        document.getElementById('imagePreview').src = currentImageData;
        document.getElementById('imagePreview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        document.getElementById('imageFile').files = files;
        handleImageUpload({ target: { files } });
    }
}

// ============ PRODUCT MANAGEMENT ============
function openAddProductModal() {
    editingProductId = null;
    currentImageData = null;
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('productModal').classList.add('show');
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    currentImageData = product.image;
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description || '';

    document.getElementById('imagePreview').src = product.image;
    document.getElementById('imagePreview').classList.remove('hidden');

    document.getElementById('productModal').classList.add('show');
}

function saveProduct(event) {
    event.preventDefault();

    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value;
    const image = currentImageData || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"%3E%3Crect fill="%23f0f0f0" width="200" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="18"%3EProduct Image%3C/text%3E%3C/svg%3E';

    if (editingProductId) {
        const product = products.find(p => p.id === editingProductId);
        if (product) {
            product.name = name;
            product.category = category;
            product.price = price;
            product.description = description;
            product.image = image;
            showAlert('Product updated successfully!', 'success');
        }
    } else {
        products.push({
            id: Date.now(),
            name,
            category,
            price,
            description,
            image
        });
        showAlert('Product added successfully!', 'success');
    }

    localStorage.setItem('luxefitProducts', JSON.stringify(products));
    closeModal('productModal');
    renderAdminProducts();
    renderProducts();
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('luxefitProducts', JSON.stringify(products));
        renderAdminProducts();
        showAlert('Product deleted successfully!', 'success');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    currentImageData = null;
}

window.onclick = function (event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        modal.classList.remove('show');
    }
};

function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert alert-${type} show`;

    setTimeout(() => {
        alert.classList.remove('show');
    }, 3500);
}

// Initialize
loadProducts();

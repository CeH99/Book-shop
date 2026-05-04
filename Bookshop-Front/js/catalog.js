const API_URL = 'http://localhost:8080/api/products';
const API_CATEGORIES_URL = 'http://localhost:8080/api/categories';
const API_AUTHORS_URL = 'http://localhost:8080/api/products/authors';

let currentPage = 0;
const pageSize = 8; 

let currentSearch = '';
let currentSort = 'id,desc'; 
let currentCategoryId = null;
let currentAuthor = '';
let currentMinPrice = null;
let currentMaxPrice = null;
let showWishlistOnly = false;

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.initWishlistCache === 'function') {
        await window.initWishlistCache();
    }

    fetchCategories();
    fetchProducts(currentPage);
    updateCartCount();
    fetchAuthors();
    fetchBanner();

    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const authorSelect = document.getElementById('author-select');

    if (authorSelect) {
        authorSelect.addEventListener('change', (e) => {
            currentAuthor = e.target.value;
            currentPage = 0; 
            fetchProducts(currentPage);
        });
    }

    if (searchInput) {
        let timeoutId;
        searchInput.addEventListener('input', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                currentSearch = searchInput.value;
                currentPage = 0; 
                fetchProducts(currentPage);
            }, 500);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            currentPage = 0; 
            fetchProducts(currentPage);
        });
    }
});

// Fetch genres and populate list
async function fetchCategories() {
    try {
        const response = await fetch(API_CATEGORIES_URL);
        const categories = await response.json();
        const list = document.getElementById('category-list');
        list.innerHTML = `<li class="active" onclick="selectCategory(null, this)">Усі книги</li>`;
        
        categories.forEach(cat => {
            list.innerHTML += `<li onclick="selectCategory(${cat.id}, this)">${cat.name}</li>`;
        });
    } catch (error) {
        console.error('Categories load error:', error);
    }
}

// Handle category selection
window.selectCategory = function(id, element) {
    currentCategoryId = id;
    currentPage = 0;
    document.querySelectorAll('#category-list li').forEach(li => li.classList.remove('active'));
    element.classList.add('active');
    fetchProducts(currentPage);
}

// Fetch and render products with filters
async function fetchProducts(page) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '<p>Завантаження...</p>';

    try {
        let url = `${API_URL}?page=${page}&size=${pageSize}&sort=${currentSort}`;
        if (currentSearch.trim() !== '') url += `&search=${encodeURIComponent(currentSearch)}`;
        if (currentCategoryId !== null) url += `&categoryId=${currentCategoryId}`;
        if (currentAuthor !== '') url += `&author=${encodeURIComponent(currentAuthor)}`;
        if (currentMinPrice !== null) url += `&minPrice=${currentMinPrice}`;
        if (currentMaxPrice !== null) url += `&maxPrice=${currentMaxPrice}`;

        if (showWishlistOnly) {
            if (window.wishlistCache.size === 0) {
                grid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Ваш список бажань порожній.</p>';
                document.getElementById('pagination-container').innerHTML = '';
                return;
            }
            const ids = Array.from(window.wishlistCache).join(',');
            url += `&ids=${ids}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const responseData = await response.json();
        const products = responseData.content || responseData;
        grid.innerHTML = '';

        if (!products || products.length === 0) {
            grid.innerHTML = '<p>Книг за вашим запитом не знайдено.</p>';
            document.getElementById('pagination-container').innerHTML = '';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'book-card';
            const imageSrc = product.imageUrl || product.imageKey || 'https://placehold.co/200x300?text=No+Cover';
            const heartColor = window.wishlistCache.has(product.id) ? '#c91818' : '#ccc';
            const finalPrice = product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price;

            let starsHtml = '';
            if (product.averageRating > 0) {
                const rounded = Math.round(product.averageRating);
                for (let i = 0; i < rounded; i++) starsHtml += '★';
                for (let i = rounded; i < 5; i++) starsHtml += '<span class="empty-star">★</span>';
                starsHtml += `<span class="rating-text">${product.averageRating} / 5</span>`;
            } else {
                starsHtml += '<span class="empty-star">★★★★★</span><span class="rating-text">Немає відгуків</span>';
            }

            card.innerHTML = `
                ${product.discount ? `<div class="badge-discount">-${product.discount}%</div>` : ''}
                <button class="wishlist-btn-card" onclick="toggleWishlist(${product.id}, event)" style="color: ${heartColor};" title="Додати до списку бажань">❤</button>
                <a href="book.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                    <img src="${imageSrc}" alt="${product.title}" class="book-cover" style="cursor: pointer;">
                    <h3 class="book-title" style="cursor: pointer;">${product.title}</h3>
                </a>
                <div class="book-rating">${starsHtml}</div>
                <div class="book-price">
                    ${product.discount > 0 ? `<span style="text-decoration: line-through; color: #999; font-size: 20px; margin-right: 5px;">${product.price}</span>` : ''} 
                    <span style="color: ${product.discount > 0 ? '#c91818' : 'inherit'};">${finalPrice} грн</span>
                </div>
                <button class="btn-buy" onclick="addToCart(${product.id}, '${product.title.replace(/'/g, "\\'")}', ${finalPrice})">Додати в кошик</button>
            `;
            grid.appendChild(card);
        });

        if (responseData.totalPages !== undefined) renderPagination(responseData.totalPages, responseData.number);

    } catch (error) {
        console.error('Products load error:', error);
        grid.innerHTML = '<p style="color: red;">Не вдалося завантажити каталог.</p>';
    }
}

// Render pagination buttons
function renderPagination(totalPages, activePage) {
    const container = document.getElementById('pagination-container');
    container.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 0; i < totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `btn-page ${i === activePage ? 'active' : ''}`;
        btn.innerText = i + 1;
        btn.onclick = () => {
            currentPage = i;
            fetchProducts(currentPage);
            document.querySelector('.catalog-section').scrollIntoView({ behavior: 'smooth' });
        };
        container.appendChild(btn);
    }
}

function addToCart(productId, title, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existingItem = cart.find(item => item.productId === productId);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ productId, title, price, quantity: 1 });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`"${title}" додано в кошик!`);
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countSpan = document.getElementById('cart-count');
    if (countSpan) countSpan.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Fetch unique authors for filter
async function fetchAuthors() {
    try {
        const response = await fetch(API_AUTHORS_URL);
        const authors = await response.json();
        const select = document.getElementById('author-select');
        select.innerHTML = '<option value="">Усі автори</option>';
        authors.forEach(author => { select.innerHTML += `<option value="${author}">${author}</option>`; });
    } catch (error) {
        console.error('Authors load error:', error);
    }
}

// Fetch and render promotional banner
async function fetchBanner() {
    const container = document.getElementById('hero-banner-container');
    try {
        const response = await fetch('http://localhost:8080/api/products/banner');
        if (response.status === 204 || !response.ok) {
            container.innerHTML = '';
            return;
        }

        const book = await response.json();
        const imageSrc = book.imageUrl || book.imageKey || 'https://placehold.co/400x600?text=No+Cover';

        container.innerHTML = `
            <div class="hero-banner">
                <div class="hero-banner-content">
                    <div class="hero-badge">Рекомендовано</div>
                    <h2 class="hero-title">${book.title}</h2>
                    <div class="hero-author">✍️ ${book.author}</div>
                    <p style="font-size: 18px; color: #ccc; margin-bottom: 30px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        ${book.description || 'Зверніть увагу на нашу найкращу книгу тижня! Замовляйте зараз за вигідною ціною.'}
                    </p>
                    <a href="book.html?id=${book.id}" class="btn-buy" style="display: inline-block; width: auto; font-size: 20px; padding: 15px 35px;">Детальніше</a>
                </div>
                <img src="${imageSrc}" alt="${book.title}" class="hero-image">
            </div>
        `;
    } catch (e) {
        console.error('Banner load error:', e);
    }
}

/*"Apply filters to product search"*/
window.applyFilters = function() {
    currentMinPrice = document.getElementById('min-price').value || null;
    currentMaxPrice = document.getElementById('max-price').value || null;
    const wl = document.getElementById('wishlist-only').checked;

    if (wl && !localStorage.getItem('jwt_token')) {
        showNotification("Будь ласка, увійдіть, щоб фільтрувати за списком бажань", true);
        document.getElementById('wishlist-only').checked = false;
        showWishlistOnly = false;
        return;
    }
    showWishlistOnly = wl;
    currentPage = 0;
    fetchProducts(currentPage);
}

const API_URL = 'http://56.228.80.231:8080/api/products';
const API_CATEGORIES_URL = 'http://56.228.80.231:8080/api/categories';
const API_AUTHORS_URL = 'http://56.228.80.231:8080/api/products/authors';

let currentPage = 0;
const pageSize = 8; 

let currentSearch = '';
let currentSort = 'id,desc'; 
let currentCategoryId = null;
let currentAuthor = '';

document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchProducts(currentPage);
    updateCartCount();
    fetchAuthors();

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
        console.error('Помилка завантаження категорій:', error);
    }
}

window.selectCategory = function(id, element) {
    currentCategoryId = id;
    currentPage = 0;
    
    document.querySelectorAll('#category-list li').forEach(li => li.classList.remove('active'));
    element.classList.add('active');

    fetchProducts(currentPage);
}

async function fetchProducts(page) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '<p>Завантаження...</p>';

    try {
        let url = `${API_URL}?page=${page}&size=${pageSize}&sort=${currentSort}`;
        if (currentSearch.trim() !== '') url += `&search=${encodeURIComponent(currentSearch)}`;
        
        if (currentCategoryId !== null) url += `&categoryId=${currentCategoryId}`;

        if (currentAuthor !== '') url += `&author=${encodeURIComponent(currentAuthor)}`;

        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`Помилка HTTP: ${response.status}`);

        const responseData = await response.json();
        
        const products = responseData.content ? responseData.content : responseData;
        
        grid.innerHTML = '';

        if (!products || products.length === 0) {
            grid.innerHTML = '<p>Книг за вашим запитом не знайдено.</p>';
            document.getElementById('pagination-container').innerHTML = '';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'book-card';
            const imageSrc = product.imageUrl ? product.imageUrl : product.imageKey ? product.imageKey : 'https://placehold.co/200x300?text=No+Cover';

            card.innerHTML = `
                <a href="book.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                    <img src="${imageSrc}" alt="${product.title}" class="book-cover" style="cursor: pointer;">
                    <h3 class="book-title" style="cursor: pointer;">${product.title}</h3>
                </a>
                <div class="book-price">${product.price} грн</div>
                <button class="btn-buy" onclick="addToCart(${product.id}, '${product.title.replace(/'/g, "\\'")}', ${product.price})">У кошик</button>
            `;
            grid.appendChild(card);
        });

        if (responseData.totalPages !== undefined) {
            renderPagination(responseData.totalPages, responseData.number);
        }

    } catch (error) {
        console.error('Помилка при завантаженні книг:', error);
        grid.innerHTML = '<p style="color: red;">Не вдалося завантажити каталог книг.</p>';
    }
}

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
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ productId, title, price, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`"${title}" додано у кошик!`);
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countSpan = document.getElementById('cart-count');
    if (countSpan) {
        countSpan.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

async function fetchAuthors() {
    try {
        const response = await fetch(API_AUTHORS_URL);
        const authors = await response.json();
        const select = document.getElementById('author-select');

        select.innerHTML = '<option value="">Усі автори</option>';
        authors.forEach(author => {
            select.innerHTML += `<option value="${author}">${author}</option>`;
        });
    } catch (error) {
        console.error('Помилка завантаження авторів:', error);
    }
}
const WISHLIST_API_URL = 'http://51.20.122.240:8080/api/wishlist';

document.addEventListener('DOMContentLoaded', () => {
    fetchWishlist();
});

// Fetch and display wishlist items
async function fetchWishlist() {
    const grid = document.getElementById('wishlist-grid');
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        renderEmptyState("Будь ласка, увійдіть, щоб переглянути список бажань.");
        return;
    }

    try {
        const response = await fetch(WISHLIST_API_URL, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Не вдалося завантажити список бажань');
        }

        const wishlist = await response.json();

        if (!wishlist || wishlist.length === 0) {
            renderEmptyState("Ваш список бажань порожній. Додайте щось із каталогу!");
            return;
        }

        grid.innerHTML = '';
        wishlist.forEach(product => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            const imageSrc = product.imageUrl || product.imageKey || 'https://placehold.co/200x300?text=No+Cover';

            card.innerHTML = `
                <button class="btn-remove-wishlist" onclick="removeFromWishlist(${product.id}, event)" title="Видалити зі списку бажань">✕</button>
                
                <a href="book.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                    <img src="${imageSrc}" alt="${product.title}" class="book-cover" style="cursor: pointer;">
                    <h3 class="book-title" style="cursor: pointer;">${product.title}</h3>
                </a>
                
                <div class="book-price">${product.price} грн</div>
                
                <button class="btn-buy" onclick="addToCart(${product.id}, '${product.title.replace(/'/g, "\\'")}', ${product.price})">Додати в кошик</button>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p style="color: red; text-align: center; grid-column: 1 / -1;">Помилка завантаження списку бажань.</p>';
    }
}

// Remove book from wishlist
async function removeFromWishlist(productId, event) {
    if(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const token = localStorage.getItem('jwt_token');
    
    try {
        const response = await fetch(`${WISHLIST_API_URL}/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Не вдалося видалити');

        showNotification("Книгу видалено зі списку бажань!");
        fetchWishlist();

    } catch (error) {
        console.error(error);
        showNotification("Не вдалося видалити книгу", true);
    }
}

// Render empty state message
function renderEmptyState(message) {
    const grid = document.getElementById('wishlist-grid');
    grid.style.display = 'block';
    grid.innerHTML = `
        <div class="wishlist-empty">
            <div class="wishlist-empty-icon">💔</div>
            <h3 style="color: #333; margin-bottom: 15px;">Тут порожньо</h3>
            <p style="color: #666; font-size: 18px; margin-bottom: 25px;">${message}</p>
            <a href="index.html" class="btn-buy" style="display: inline-block; width: auto; text-decoration: none;">Перейти до каталогу</a>
        </div>
    `;
}

// Add book to local cart
function addToCart(productId, title, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ productId, title, price, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    const countSpan = document.getElementById('cart-count');
    if (countSpan) {
        countSpan.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    showNotification(`"${title}" додано в кошик!`);
}

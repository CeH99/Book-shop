const API_URL = 'http://56.228.80.231:8080/api/products';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (!bookId) {
        document.getElementById('single-book-container').innerHTML = '<p class="error-message">Книгу не знайдено. Поверніться до каталогу.</p>';
        return;
    }

    fetchBookDetails(bookId);
    updateCartCount();
});

async function fetchBookDetails(id) {
    const container = document.getElementById('single-book-container');

    try {
        const response = await fetch(`${API_URL}/${id}`);
        
        if (!response.ok) {
            throw new Error('Не вдалося завантажити книгу');
        }

        const book = await response.json();
        
        const imageSrc = book.imageUrl ? book.imageUrl : book.imageKey ? book.imageKey : 'https://placehold.co/400x600?text=No+Cover';
        
        const isAvailable = book.stockQuantity > 0;
        const stockHtml = isAvailable 
            ? `<div class="book-details-stock in-stock">В наявності: ${book.stockQuantity} шт.</div>`
            : `<div class="book-details-stock out-of-stock">Немає в наявності</div>`;

        const btnHtml = isAvailable
            ? `<button class="btn-buy-large" onclick="addToCart(${book.id}, '${book.title.replace(/'/g, "\\'")}', ${book.price})">Додати у кошик</button>`
            : `<button class="btn-buy-large" disabled style="background: #ccc; cursor: not-allowed;">Немає в наявності</button>`;

        container.innerHTML = `
            <a href="index.html" style="color: #c91818; text-decoration: none; margin-bottom: 20px; display: inline-block;">← Повернутися до каталогу</a>
            <div class="book-details-container">
                <div class="book-details-image">
                    <img src="${imageSrc}" alt="${book.title}">
                </div>
                <div class="book-details-info">
                    <div class="book-details-info">
                    <h1 class="book-details-title">${book.title}</h1>
                    <h3 style="color: #666; font-weight: normal; margin-top: -10px; margin-bottom: 20px;">✍️ Автор: ${book.author || 'Невідомий автор'}</h3>
                    <div class="book-details-price">${book.price} грн</div>
                    ${stockHtml}
                    
                    <h3 style="margin-bottom: 10px;">Опис:</h3>
                    <div class="book-details-desc">${book.description || 'Опис відсутній.'}</div>
                    
                    ${btnHtml}
                </div>
            </div>
        `;

        document.title = `${book.title} - Онлайн-Книгарня`;

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color: red; text-align: center;">Помилка завантаження. Можливо, книгу було видалено.</p>';
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
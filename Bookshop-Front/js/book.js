const API_URL = 'http://localhost:8080/api/products';

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.initWishlistCache === 'function') {
        await window.initWishlistCache();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (bookId) {
        await fetchBookDetails(bookId);
        updateCartCount();
        loadReviews(bookId);
    } else {
        console.error("Book ID not found in URL");
    }
});

// Fetch and display book details
async function fetchBookDetails(id) {
    const container = document.getElementById('single-book-container');

    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Не вдалося завантажити книгу');

        const book = await response.json();
        const imageSrc = book.imageUrl || book.imageKey || 'https://placehold.co/400x600?text=No+Cover';
        const isAvailable = book.stockQuantity > 0;
        
        const stockHtml = isAvailable 
            ? `<div class="book-details-stock in-stock">В наявності: ${book.stockQuantity} шт.</div>`
            : `<div class="book-details-stock out-of-stock">Немає в наявності</div>`;

        const isWished = window.wishlistCache.has(book.id);
        const heartColor = isWished ? '#c91818' : '#ccc';
        const wishlistBtnHtml = `<button class="btn-wishlist-large" onclick="toggleWishlist(${book.id}, event)" style="color: ${heartColor};" title="Додати до списку бажань">❤️</button>`;

        const hasDiscount = book.discount && book.discount > 0;
        const finalPrice = hasDiscount ? Math.round(book.price * (1 - book.discount / 100)) : book.price;

        const priceHtml = hasDiscount 
            ? `<div class="book-details-price">
                 <span style="text-decoration: line-through; color: #999; font-size: 20px; margin-right: 10px;">${book.price} грн</span>
                 <span style="color: #c91818;">${finalPrice} грн</span>
               </div>`
            : `<div class="book-details-price">${book.price} грн</div>`;

        const discountBadgeHtml = hasDiscount 
            ? `<div style="position: absolute; top: 20px; left: 20px; background: #e74c3c; color: white; padding: 5px 15px; font-weight: bold; border-radius: 4px; z-index: 10; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">-${book.discount}%</div>` 
            : '';

        container.innerHTML = `
            <a href="index.html" style="color: #c91818; text-decoration: none; margin-bottom: 20px; display: inline-block;">← Назад до каталогу</a>
            <div class="book-details-container">
                <div class="book-details-image" style="position: relative;">
                    ${discountBadgeHtml}
                    <img src="${imageSrc}" alt="${book.title}">
                </div>
                <div class="book-details-info">
                    <h1 class="book-details-title">${book.title}</h1>
                    <h3 style="color: #666; font-weight: normal; margin-top: -10px; margin-bottom: 20px;">✍️ Автор: ${book.author || 'Невідомо'}</h3>
                    ${priceHtml}
                    ${stockHtml}
                    <h3 style="margin-bottom: 10px;">Опис:</h3>
                    <div class="book-details-desc">${book.description || 'Опис відсутній.'}</div>
                    <div style="display: flex; gap: 15px; margin-top: 30px;">
                        <button class="btn-buy-large" ${!isAvailable ? 'disabled style="background: #ccc; cursor: not-allowed;"' : `onclick="addToCart(${book.id}, '${book.title.replace(/'/g, "\\'")}', ${finalPrice})"`}>
                            ${isAvailable ? 'Додати в кошик' : 'Немає в наявності'}
                        </button>
                        ${wishlistBtnHtml}
                    </div>
                </div>
            </div>
        `;

        document.title = `${book.title} - Онлайн Книгарня`;

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color: red; text-align: center;">Помилка завантаження книги. Можливо, її було видалено.</p>';
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
    showNotification(`"${title}" додано в кошик!`);
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countSpan = document.getElementById('cart-count');
    if (countSpan) {
        countSpan.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

// Reviews and comments logic
let currentBookId = null;

async function loadReviews(bookId) {
    currentBookId = bookId;
    const reviewsSection = document.getElementById('reviews-section');
    const reviewsList = document.getElementById('reviews-list');
    const countSpan = document.getElementById('reviews-count');
    
    if (!reviewsSection || !reviewsList) return;
    
    reviewsSection.style.display = 'block';

    try {
        const response = await fetch(`http://localhost:8080/api/reviews/product/${bookId}`);
        if (!response.ok) throw new Error('Не вдалося завантажити відгуки');

        const reviews = await response.json();
        countSpan.innerText = reviews.length;
        reviewsList.innerHTML = '';

        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p style="color: #888; font-style: italic; background: #fafafa; padding: 15px; border-radius: 6px;">Будьте першим, хто залишить відгук!</p>';
            return;
        }

        reviews.forEach(review => {
            const dateStr = new Date(review.createdAt).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' });
            const initial = review.userName ? review.userName.charAt(0).toUpperCase() : '?';
            
            let starsHtml = '';
            for (let i = 0; i < 5; i++) {
                starsHtml += `<span style="color: ${i < review.rating ? '#f39c12' : '#e0e0e0'}; font-size: 14px;">★</span>`;
            }
            
            reviewsList.innerHTML += `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-user-info">
                            <div class="user-avatar-circle">${initial}</div>
                            <div class="review-author-name">${review.userName}</div>
                        </div>
                        <div class="review-date">${dateStr}</div>
                    </div>
                    <div class="review-stars-row">${starsHtml}</div>
                    <div class="review-text-content">${review.text}</div>
                </div>
            `;
        });
    } catch (error) {
        console.error(error);
        reviewsList.innerHTML = '<p style="color: red;">Не вдалося завантажити відгуки.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.getElementById('add-review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                showNotification("Будь ласка, увійдіть, щоб залишити відгук", true);
                return;
            }

            const rating = document.getElementById('review-rating').value;
            const text = document.getElementById('review-text').value.trim();
            const submitBtn = reviewForm.querySelector('button[type="submit"]');

            try {
                submitBtn.disabled = true;
                submitBtn.innerText = 'Надсилання...';

                const response = await fetch('http://localhost:8080/api/reviews', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId: currentBookId, text, rating: parseInt(rating) })
                });

                if (!response.ok) throw new Error('Не вдалося надіслати відгук');

                showNotification("Дякуємо за ваш відгук! 🌟");
                reviewForm.reset();
                loadReviews(currentBookId);
            } catch (error) {
                showNotification(error.message, true);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Надіслати відгук';
            }
        });
    }
});

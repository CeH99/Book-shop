const API_URL = 'http://localhost:8080/api/products';

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

async function fetchProducts() {
    const grid = document.getElementById('products-grid');

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Помилка HTTP: ${response.status}`);
        }

        const responseData = await response.json();

        const products = responseData.content ? responseData.content : responseData;
        
        grid.innerHTML = '';

        if (!products || products.length === 0) {
            grid.innerHTML = '<p>Книг поки немає в наявності.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            const imageSrc = product.imageUrl ? product.imageUrl : 'https://m.media-amazon.com/images/I/81q77Q39nHL.jpg';

            card.innerHTML = `
                <img src="${imageSrc}" alt="${product.title}" class="book-cover">
                <h3 class="book-title">${product.title}</h3>
                <div class="book-price">${product.price} грн</div>
                <button class="btn-buy" onclick="addToCart(${product.id}, '${product.title.replace(/'/g, "\\'")}', ${product.price})">У кошик</button>
            `;
            
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Помилка при завантаженні книг:', error);
        grid.innerHTML = '<p style="color: red;">Не вдалося завантажити каталог книг. Перевірте з\'єднання з сервером.</p>';
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
    alert(`"${title}" додано у кошик!`);
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countSpan = document.getElementById('cart-count');
    if (countSpan) {
        countSpan.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});
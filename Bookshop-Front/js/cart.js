const ORDERS_API_URL = 'http://localhost:8080/api/orders';

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

// Render cart items and summary
async function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    document.getElementById('cart-count').innerText = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart">Ваш кошик порожній. <a href="index.html">Перейти до каталогу</a></div>';
        return;
    }

    cartContainer.innerHTML = '<p style="text-align: center; padding: 50px;">Оновлення кошика...</p>';

    let tableHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Обкладинка</th>
                    <th>Назва</th>
                    <th>Ціна</th>
                    <th>Кількість</th>
                    <th>Сума</th>
                    <th>Дія</th>
                </tr>
            </thead>
            <tbody>
    `;

    let totalSum = 0;

    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        
        try {
            const response = await fetch(`http://localhost:8080/api/products/${item.productId}`);
            if (!response.ok) throw new Error();
            const product = await response.json();

            const imageSrc = product.imageUrl || product.imageKey || 'https://placehold.co/50x75?text=No+Cover';

            const finalPrice = product.discount && product.discount > 0 
                ? Math.round(product.price * (1 - product.discount / 100)) 
                : product.price;

            item.price = finalPrice;
            let itemSum = finalPrice * item.quantity;
            totalSum += itemSum;

            let priceHtml = product.discount > 0 
                ? `<span style="text-decoration: line-through; color: #999; font-size: 20px; margin-right: 8px;">${product.price} грн</span>
                   <span style="color: #c91818; font-weight: bold;">${finalPrice} грн</span>`
                : `<span>${product.price} грн</span>`;

            tableHTML += `
            <tr>
                <td>
                    <a href="book.html?id=${product.id}">
                        <img src="${imageSrc}" alt="${product.title}" style="width: 70px; height: 100px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    </a>
                </td>
                <td>
                    <a href="book.html?id=${product.id}" style="text-decoration: none; color: #222; font-size: 16px;">
                        <strong>${product.title}</strong>
                    </a>
                </td>
                <td>${priceHtml}</td>
                <td style="font-weight: 600; color: #555;">${item.quantity} шт.</td>
                <td><strong style="font-size: 18px; color: #222;">${itemSum} грн</strong></td>
                <td>
                    <button class="btn-remove" onclick="removeFromCart(${i})">Видалити</button>
                </td>
            </tr>
        `;
        } catch (error) {
            console.error("Error loading product ID:", item.productId);
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    tableHTML += `</tbody></table>
        <div class="checkout-section" style="margin-top: 30px; background: #fff; padding: 25px; border-radius: 8px; border: 1px solid #eee; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div style="margin-bottom: 20px;">
                <label for="delivery-address" style="font-weight: bold; display: block; margin-bottom: 10px; color: #333;">Адреса доставки:</label>
                <textarea id="delivery-address" rows="2" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; outline: none; font-size: 15px;" placeholder="Місто, номер відділення..."></textarea>
            </div>
            
            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 20px; margin-bottom: 20px; border-top: 2px solid #f5f5f5; padding-top: 20px;">
                <span style="font-size: 18px; color: #666;">Загальна сума:</span>
                <span style="font-size: 28px; font-weight: 900; color: #c91818;">${totalSum} грн</span>
            </div>
            
            <button class="checkout-btn" onclick="checkout()" style="width: 100%; padding: 18px; font-size: 18px; background: #c91818; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background 0.2s;">
                Оформити замовлення
            </button>
        </div>
    `;

    cartContainer.innerHTML = tableHTML;
}

// Handle order placement
async function checkout() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        showNotification("Будь ласка, увійдіть, щоб оформити замовлення!");
        window.location.href = 'login.html';
        return;
    }

    const addressInput = document.getElementById('delivery-address');
    const deliveryAddress = addressInput ? addressInput.value.trim() : '';

    if (!deliveryAddress) {
        showNotification("Будь ласка, вкажіть адресу доставки!");
        if (addressInput) addressInput.focus();
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderData = {
        deliveryAddress,
        items: cart.map(item => ({ productId: item.productId, quantity: item.quantity }))
    };

    try {
        const response = await fetch(ORDERS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            if (response.status === 403) {
                localStorage.removeItem('jwt_token');
                showNotification("Сесія заверсилася. Будь ласка, увійдіть знову.", true);
                window.location.href = 'login.html';
                return;
            }
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Помилка при оформленні замовлення');
        }

        showNotification('Замовлення успішно оформлено! Дякуємо за покупку.');
        localStorage.removeItem('cart'); 
        renderCart(); 
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification(error.message, true); 
    }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

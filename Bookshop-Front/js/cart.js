const ORDERS_API_URL = 'http://localhost:8080/api/orders';

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    document.getElementById('cart-count').innerText = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart">Ваш кошик порожній. <a href="index.html">Перейти до каталогу</a></div>';
        return;
    }

    let tableHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Назва книги</th>
                    <th>Ціна</th>
                    <th>Кількість</th>
                    <th>Сума</th>
                    <th>Дія</th>
                </tr>
            </thead>
            <tbody>
    `;

    let totalSum = 0;

    cart.forEach((item, index) => {
        let itemSum = item.price * item.quantity;
        totalSum += itemSum;
        tableHTML += `
            <tr>
                <td>${item.title}</td>
                <td>${item.price} грн</td>
                <td>${item.quantity} шт.</td>
                <td><strong>${itemSum} грн</strong></td>
                <td><button onclick="removeFromCart(${index})" style="color: red; border: none; background: none; cursor: pointer;">Видалити</button></td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;

    tableHTML += `
        <div class="checkout-section" style="margin-top: 30px; background: #f9f9f9; padding: 20px; border-radius: 8px;">
            <div style="margin-bottom: 20px;">
                <label for="delivery-address" style="font-weight: bold; display: block; margin-bottom: 8px;">Адреса доставки (Місто, Відділення Нової Пошти):</label>
                <textarea id="delivery-address" rows="2" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Наприклад: м. Київ, Відділення №15..."></textarea>
            </div>
            
            <div class="cart-total" style="font-size: 22px; font-weight: bold; margin-bottom: 15px;">
                Загальна сума: <span style="color: #c91818;">${totalSum} грн</span>
            </div>
            
            <button class="checkout-btn" onclick="checkout()" style="width: 100%; padding: 15px; font-size: 18px; background: #c91818; color: white; border: none; border-radius: 4px; cursor: pointer;">Оформити замовлення</button>
        </div>
    `;

    cartContainer.innerHTML = tableHTML;
}

async function checkout() {
    const token = localStorage.getItem('jwt_token');
    
    if (!token) {
        showNotification("Для оформлення замовлення необхідно увійти в систему!");
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
        deliveryAddress: deliveryAddress,
        items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))
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
                showNotification("Сесія закінчилася. Будь ласка, увійдіть знову.", true);
                window.location.href = 'login.html';
                return;
            }
            
            const errorData = await response.json().catch(() => null);
            const errorMessage = (errorData && errorData.message) ? errorData.message : 'Помилка при створенні замовлення';
            throw new Error(errorMessage);
        }

        showNotification('Замовлення успішно оформлено! Дякуємо за покупку.');
        localStorage.removeItem('cart'); 
        renderCart(); 

    } catch (error) {
        console.error('Помилка чекауту:', error);
        showNotification(error.message, true); 
    }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

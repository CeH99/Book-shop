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
    tableHTML += `<div class="cart-total">Загальна сума: ${totalSum} грн</div>`;
    tableHTML += `<button class="checkout-btn" onclick="checkout()">Оформити замовлення</button>`;
    
    tableHTML += `<div style="clear: both;"></div>`;

    cartContainer.innerHTML = tableHTML;
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

async function checkout() {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        alert("Для оформлення замовлення необхідно увійти в систему!");
        window.location.href = 'login.html';
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const orderData = {
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
                alert("Сесія закінчилася. Будь ласка, увійдіть знову.");
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Помилка при створенні замовлення');
        }

        alert('Замовлення успішно оформлено! Дякуємо за покупку.');
        localStorage.removeItem('cart');
        renderCart();

    } catch (error) {
        console.error('Помилка чекауту:', error);
        alert('Сталася помилка при оформленні замовлення. Спробуйте пізніше.');
    }
}
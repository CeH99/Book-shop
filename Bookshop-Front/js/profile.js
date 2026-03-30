const MY_ORDERS_URL = 'http://localhost:8080/api/orders/my';

document.addEventListener('DOMContentLoaded', () => {
    fetchMyOrders();
});

async function fetchMyOrders() {
    const container = document.getElementById('orders-container');
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(MY_ORDERS_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Помилка завантаження');

        const orders = await response.json();
        container.innerHTML = '';

        if (orders.length === 0) {
            container.innerHTML = '<p>У вас ще немає замовлень.</p>';
            return;
        }

        orders.sort((a, b) => b.id - a.id).forEach(order => {
            const date = new Date(order.date).toLocaleString('uk-UA');
            
            let itemsHtml = order.listOfItems.map(item => 
                `<li>${item.title} — ${item.quantity} шт. х ${item.price} грн</li>`
            ).join('');

            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.innerHTML = `
                <div class="order-header">
                    <div>
                        <strong>Замовлення #${order.id}</strong> <br>
                        <small style="color: #888;">${date}</small>
                    </div>
                    <div>
                        <span class="order-status status-${order.status}">${order.status}</span>
                    </div>
                </div>
                <ul class="order-items">
                    ${itemsHtml}
                </ul>
                <div style="text-align: right; margin-top: 15px; font-size: 18px;">
                    <strong>Разом: ${order.totalPrice} грн</strong>
                </div>
            `;
            container.appendChild(orderCard);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color: red;">Не вдалося завантажити історію замовлень.</p>';
    }
}
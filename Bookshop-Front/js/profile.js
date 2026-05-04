const MY_ORDERS_URL = 'http://51.20.122.240:8080/api/orders/my';

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    fetchMyOrders();
});

let currentUserData = { name: '', surname: '', email: '', telephone: '' };

// Load current user profile data
async function loadUserInfo() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const response = await fetch('http://51.20.122.240:8080/api/users/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Не вдалося завантажити дані');

        const user = await response.json();
        currentUserData = {
            name: user.name,
            surname: user.surname,
            email: user.email,
            telephone: user.telephone || ''
        };

        const greeting = document.getElementById('greeting-title');
        if (greeting) greeting.innerText = `Ласкаво просимо, ${user.name}!`;
        
        document.getElementById('profile-name').innerText = user.name;
        document.getElementById('profile-surname').innerText = user.surname;
        document.getElementById('profile-email').innerText = user.email;
        document.getElementById('profile-phone').innerText = user.telephone || 'Не вказано';
        
    } catch (e) {
        console.error("Profile load error:", e);
    }
}

// Fetch and render user order history
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
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Не вдалося завантажити замовлення');

        const orders = await response.json();
        container.innerHTML = '';

        if (orders.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px 0;">
                    <div style="font-size: 80px; margin-bottom: 20px;">📭</div>
                    <h3 style="color: #333; margin-bottom: 10px;">Історія порожня</h3>
                    <p style="color: #888; font-size: 16px;">Ви ще не робили замовлень.</p>
                </div>
            `;
            return;
        }

        const statusMap = { 'PENDING': 'Очікує оплати', 'PAID': 'Оплачено', 'SHIPPED': 'Відправлено', 'DELIVERED': 'Доставлено', 'CANCELLED': 'Скасовано' };
        const colorMap = { 'PENDING': '#f39c12', 'PAID': '#3498db', 'SHIPPED': '#9b59b6', 'DELIVERED': '#27ae60', 'CANCELLED': '#e74c3c' };

        orders.sort((a, b) => b.id - a.id).forEach(order => {
            const date = new Date(order.date).toLocaleString('uk-UA');
            let itemsHtml = order.listOfItems.map(item => `
                <li style="display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px dashed #eee;">
                    <a href="book.html?id=${item.productId}" style="flex-shrink: 0;">
                        <img src="${item.imageKey || 'https://placehold.co/45x65?text=Img'}" alt="cover" style="width: 45px; height: 65px; object-fit: cover; border-radius: 4px;">
                    </a>
                    <div style="flex-grow: 1;">
                        <a href="book.html?id=${item.productId}" style="text-decoration: none; color: #222; font-weight: 600;">${item.name}</a>
                        <div style="color: #888; font-size: 13px;">К-сть: ${item.quantity} шт.</div>
                    </div>
                    <div style="font-weight: bold; color: #444;">${item.price} грн</div>
                </li>`).join('');

            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.style.cssText = "border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; margin-bottom: 15px; background: #fafafa;";
            
            const cancellable = order.status === 'PENDING' || order.status === 'PAID';

            orderCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
                    <div>
                        <strong style="font-size: 18px; color: #c91818;">Замовлення #${order.id}</strong> <br>
                        <small style="color: #888;">📅 ${date}</small><br>
                        <small style="color: #444;">📍 Доставка: <strong>${order.deliveryAddress || 'Не вказано'}</strong></small>
                    </div>
                    <div style="text-align: right;">
                        <span style="background: ${colorMap[order.status] || '#7f8c8d'}; color: white; padding: 5px 10px; border-radius: 4px; font-size: 14px; font-weight: bold;">
                            ${statusMap[order.status] || order.status}
                        </span>
                        <div style="margin-top: 10px;">
                            ${cancellable ? `<button onclick="cancelOrder(${order.id})" style="padding: 8px 15px; border: 1px solid #e74c3c; background: transparent; color: #e74c3c; border-radius: 4px; cursor: pointer; font-size: 14px;">Скасувати замовлення ❌</button>` : ''}
                        </div>
                    </div>
                </div>
                <ul style="list-style: none; padding: 0; margin: 0;">${itemsHtml}</ul>
                <div style="text-align: right; margin-top: 15px; font-size: 18px;">Разом: <strong style="color: #222;">${order.totalPrice} грн</strong></div>
            `;
            container.appendChild(orderCard);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color: red;">Не вдалося завантажити історію замовлень.</p>';
    }
}

// Open edit profile modal
function openEditModal() {
    document.getElementById('edit-name').value = currentUserData.name;
    document.getElementById('edit-surname').value = currentUserData.surname;
    document.getElementById('edit-email').value = currentUserData.email;
    document.getElementById('edit-phone').value = currentUserData.telephone;
    document.getElementById('editProfileModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editProfileModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('edit-profile-form');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('jwt_token');
            const requestData = {
                name: document.getElementById('edit-name').value.trim(),
                surname: document.getElementById('edit-surname').value.trim(),
                email: document.getElementById('edit-email').value.trim(),
                telephone: document.getElementById('edit-phone').value.trim()
            };

            try {
                const response = await fetch('http://51.20.122.240:8080/api/users/me', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) throw new Error('Update failed');
                showNotification("Профіль оновлено!");
                closeEditModal();
                loadUserInfo(); 
            } catch (error) {
                console.error(error);
                showNotification("Не вдалося оновити профіль", true);
            }
        });
    }
});

// Cancel a pending/paid order
async function cancelOrder(orderId) {
    if (!confirm(`Ви впевнені, що хочете скасувати замовлення #${orderId}?`)) return;

    const token = localStorage.getItem('jwt_token');
    try {
        const response = await fetch(`http://51.20.122.240:8080/api/orders/${orderId}/cancel`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Не вдалося скасувати замовлення');
        }

        showNotification(`Замовлення #${orderId} скасовано!`);
        fetchMyOrders(); 
    } catch (error) {
        console.error(error);
        showNotification(error.message, true); 
    }
}

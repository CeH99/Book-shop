const MY_ORDERS_URL = 'http://56.228.80.231:8080/api/orders/my';

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    fetchMyOrders();
});

async function loadUserInfo() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const response = await fetch('http://56.228.80.231:8080/api/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Не вдалося завантажити дані');

        const user = await response.json();
        
        document.getElementById('profile-name').innerText = `${user.name} ${user.surname}`;
        document.getElementById('profile-email').innerText = user.email;
        
    } catch (e) {
        console.error("Помилка завантаження профілю", e);
        document.getElementById('profile-name').innerText = "Помилка завантаження";
        document.getElementById('profile-email').innerText = "Спробуйте оновити сторінку";
    }
}

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
            container.innerHTML = '<p style="color: #666; font-size: 16px;">У вас ще немає замовлень. <a href="index.html" style="color: #c91818;">Перейти в каталог</a></p>';
            return;
        }

        const statusMap = {
            'PENDING': 'Очікує',
            'PAID': 'Оплачено',
            'SHIPPED': 'Відправлено',
            'CANCELLED': 'Скасовано'
        };

        orders.sort((a, b) => b.id - a.id).forEach(order => {
            const date = new Date(order.date).toLocaleString('uk-UA');
            
            let itemsHtml = order.listOfItems.map(item => 
                `<li style="padding: 5px 0; border-bottom: 1px dashed #eee;">
                    📚 ${item.name || item.title || 'Книга'} — ${item.quantity} шт. х ${item.price} грн
                 </li>`
            ).join('');

            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.style.cssText = "border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; margin-bottom: 15px; background: #fafafa;";
            
            let displayStatus = statusMap[order.status] || order.status;
            let statusColor = order.status === 'PENDING' ? '#f39c12' : order.status === 'SHIPPED' ? '#27ae60' : '#7f8c8d';

            orderCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
                    <div>
                        <strong style="font-size: 18px; color: #c91818;">Замовлення #${order.id}</strong> <br>
                        <small style="color: #888;">📅 ${date}</small><br>
                        <small style="color: #444; display: inline-block; margin-top: 5px;">📍 Доставка: <strong>${order.deliveryAddress || 'Не вказано'}</strong></small>
                    </div>
                    <div>
                        <span style="background: ${statusColor}; color: white; padding: 5px 10px; border-radius: 4px; font-size: 14px; font-weight: bold;">
                            ${displayStatus}
                        </span>
                    </div>
                </div>
                <ul style="list-style: none; padding: 0; margin: 0; color: #555;">
                    ${itemsHtml}
                </ul>
                <div style="text-align: right; margin-top: 15px; font-size: 18px;">
                    Всього до сплати: <strong style="color: #222;">${order.totalPrice} грн</strong>
                </div>
            `;
            container.appendChild(orderCard);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color: red;">Не вдалося завантажити історію замовлень.</p>';
    }
}

let currentUserData = { name: '', surname: '' };

async function loadUserInfo() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const response = await fetch('http://56.228.80.231:8080/api/users/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Не вдалося завантажити дані');

        const user = await response.json();
        
        currentUserData.name = user.name;
        currentUserData.surname = user.surname;

        document.getElementById('profile-name').innerText = `${user.name} ${user.surname}`;
        document.getElementById('profile-email').innerText = user.email;
        
    } catch (e) {
        console.error("Помилка завантаження профілю", e);
    }
}

function openEditModal() {
    document.getElementById('edit-name').value = currentUserData.name;
    document.getElementById('edit-surname').value = currentUserData.surname;
    
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
                surname: document.getElementById('edit-surname').value.trim()
            };

            try {
                const response = await fetch('http://56.228.80.231:8080/api/users/me', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) throw new Error('Не вдалося оновити профіль');

                showNotification("Профіль успішно оновлено!");
                closeEditModal();
                loadUserInfo(); 
                
            } catch (error) {
                console.error(error);
                showNotification("Помилка при оновленні профілю", true);
            }
        });
    }
});
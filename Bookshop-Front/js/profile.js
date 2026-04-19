const MY_ORDERS_URL = 'http://localhost:8080/api/orders/my';

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    fetchMyOrders();
});

async function loadUserInfo() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:8080/api/users/me', {
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
            'PENDING': 'Очікує оплати',
            'PAID': 'Оплачено',
            'SHIPPED': 'Відправлено',
            'DELIVERED': 'Доставлено',
            'CANCELLED': 'Скасовано'
        };

        const colorMap = {
            'PENDING': '#f39c12',
            'PAID': '#3498db',
            'SHIPPED': '#9b59b6',
            'DELIVERED': '#27ae60',
            'CANCELLED': '#e74c3c'
        };

        orders.sort((a, b) => b.id - a.id).forEach(order => {
            const date = new Date(order.date).toLocaleString('uk-UA');
            
            let itemsHtml = order.listOfItems.map(item => {
                const itemImage = item.imageKey ? item.imageKey : 'https://placehold.co/50x75?text=Книга';
                const itemUrl = `book.html?id=${item.productId}`;

                return `
                <li style="display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px dashed #eee;">
                    <a href="${itemUrl}" style="flex-shrink: 0; text-decoration: none;">
                        <img src="${itemImage}" alt="cover" style="width: 45px; height: 65px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    </a>
                    
                    <div style="flex-grow: 1;">
                        <a href="${itemUrl}" style="text-decoration: none; color: #222; font-weight: 600; font-size: 15px; transition: 0.2s;" onmouseover="this.style.color='#c91818'" onmouseout="this.style.color='#222'">
                            ${item.name}
                        </a>
                        <div style="color: #888; font-size: 13px; margin-top: 3px;">Кількість: ${item.quantity} шт.</div>
                    </div>

                    <div style="font-weight: bold; color: #444;">
                        ${item.price} грн
                    </div>
                </li>`;
            }).join('');

            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.style.cssText = "border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; margin-bottom: 15px; background: #fafafa;";
            
            let displayStatus = statusMap[order.status] || order.status;
            let statusColor = colorMap[order.status] || '#7f8c8d';
            let cancelButtonHtml = '';

            if (order.status === 'PENDING' || order.status === 'PAID') {
                cancelButtonHtml = `<button onclick="cancelOrder(${order.id})" style="margin-top: 15px; padding: 8px 15px; border: 1px solid #e74c3c; background: transparent; color: #e74c3c; border-radius: 4px; cursor: pointer; font-size: 14px; transition: 0.2s;">Скасувати замовлення ❌</button>`;
            }

            orderCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
                    <div>
                        <strong style="font-size: 18px; color: #c91818;">Замовлення #${order.id}</strong> <br>
                        <small style="color: #888;">📅 ${date}</small><br>
                        <small style="color: #444; display: inline-block; margin-top: 5px;">📍 Доставка: <strong>${order.deliveryAddress || 'Не вказано'}</strong></small>
                    </div>
                    <div style="text-align: right;">
                        <span style="background: ${statusColor}; color: white; padding: 5px 10px; border-radius: 4px; font-size: 14px; font-weight: bold;">
                            ${displayStatus}
                        </span>
                        <div style="margin-top: 10px;">
                            ${cancelButtonHtml}
                        </div>
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

let currentUserData = { name: '', surname: '', email: '', telephone: '' };

async function loadUserInfo() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:8080/api/users/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Не вдалося завантажити дані');

        const user = await response.json();
        
        // Сохраняем все 4 поля
        currentUserData = {
            name: user.name,
            surname: user.surname,
            email: user.email,
            telephone: user.telephone || ''
        };

        document.getElementById('profile-name').innerText = `${user.name} ${user.surname}`;
        document.getElementById('profile-email').innerText = user.email;
        // Если хочешь выводить телефон под почтой, можно добавить элемент в HTML и заполнять его тут
        
    } catch (e) {
        console.error("Помилка завантаження профілю", e);
    }
}

function openEditModal() {
    // Подставляем данные в форму при открытии
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
            
            // Собираем все 4 поля
            const requestData = {
                name: document.getElementById('edit-name').value.trim(),
                surname: document.getElementById('edit-surname').value.trim(),
                email: document.getElementById('edit-email').value.trim(),
                telephone: document.getElementById('edit-phone').value.trim()
            };

            try {
                const response = await fetch('http://localhost:8080/api/users/me', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) throw new Error('Не вдалося оновити профіль');

                showNotification("Дані успішно оновлено!");
                closeEditModal();
                loadUserInfo(); 
                
            } catch (error) {
                console.error(error);
                showNotification("Помилка при оновленні профілю", true);
            }
        });
    }
});


async function cancelOrder(orderId) {
    if (!confirm(`Ви дійсно хочете скасувати замовлення #${orderId}?`)) {
        return;
    }

    const token = localStorage.getItem('jwt_token');
    try {
        const response = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error((errorData && errorData.message) ? errorData.message : 'Не вдалося скасувати замовлення');
        }

        showNotification(`Замовлення #${orderId} успішно скасовано!`);
        fetchMyOrders(); 
    } catch (error) {
        console.error(error);
        showNotification(error.message, true); 
    }
}
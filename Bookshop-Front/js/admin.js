const API_PRODUCTS_URL = 'http://51.20.122.240:8080/api/products';
const API_ORDERS_URL = 'http://51.20.122.240:8080/api/orders';
const API_CATEGORIES_URL = 'http://51.20.122.240:8080/api/categories';

let categoriesList = []; 
let allProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        showNotification("Доступ заборонено!");
        window.location.href = 'login.html';
        return;
    }

    try {
        const checkResponse = await fetch('http://51.20.122.240:8080/api/users/check-admin', { 
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (checkResponse.status === 403) {
            alert("Доступ заборонено! Ви не є адміністратором.");
            window.location.href = 'index.html'; 
            return;
        } else if (!checkResponse.ok) {
            throw new Error("Помилка авторизації");
        }
    } catch (error) {
        console.error("Role check error:", error);
        window.location.href = 'login.html';
        return;
    }
    
    loadAdminProducts();
    loadAdminOrders();
    loadAdminCategories();
    loadBannerOptions();
    loadAdminReviews();

    const addForm = document.getElementById('add-product-form');
    if (addForm) addForm.addEventListener('submit', createProduct);

    const editForm = document.getElementById('edit-product-form');
    if (editForm) editForm.addEventListener('submit', editProductSubmit);

    const addCatForm = document.getElementById('add-category-form');
    if (addCatForm) addCatForm.addEventListener('submit', createCategorySubmit);
});

// Load books for admin table
async function loadAdminProducts() {
    const tbody = document.getElementById('admin-products-table');
    try {
        const response = await fetch(API_PRODUCTS_URL);
        const data = await response.json();
        const products = data.content || data;

        allProducts = products;
        tbody.innerHTML = '';
        
        products.sort((a, b) => b.id - a.id).forEach(p => {
            const imageSrc = p.imageUrl || p.imageKey || 'https://placehold.co/50x75?text=Img';
            tbody.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td><img src="${imageSrc}" alt="обкладинка" style="width: 50px; border-radius: 4px;"></td>
                    <td class="fw-bold">${p.title}</td>
                    <td>${p.price} грн</td>
                    <td class="text-center">
                        <span class="badge ${p.stockQuantity > 5 ? 'bg-success' : 'bg-danger'}" style="font-size: 14px;">
                            ${p.stockQuantity} шт.
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${p.id})" title="Редагувати">✏️</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})" title="Видалити">🗑️</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Books load error:", error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Помилка завантаження книг</td></tr>';
    }
}

// Create new product
async function createProduct(event) {
    event.preventDefault();
    const token = localStorage.getItem('jwt_token');
    const submitBtn = document.querySelector('#add-product-form button[type="submit"]');

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = "Завантаження зображення...";
        
        let imageUrl = "";
        const fileInput = document.getElementById('prod-image-file');
        if (fileInput.files.length > 0) {
            imageUrl = await uploadImageToS3(fileInput.files[0]);
        }

        submitBtn.innerText = "Збереження книги...";
        const discountValue = document.getElementById('prod-discount').value;

        const requestData = {
            title: document.getElementById('prod-title').value.trim(),
            description: document.getElementById('prod-desc').value.trim(),
            price: parseFloat(document.getElementById('prod-price').value),
            stockQuantity: parseInt(document.getElementById('prod-stock').value),
            categoryId: parseInt(document.getElementById('prod-category').value),
            author: document.getElementById('prod-author').value.trim(),
            imageKey: imageUrl,
            discount: discountValue ? parseInt(discountValue) : null 
        };

        const response = await fetch(API_PRODUCTS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) throw new Error("Не вдалося створити товар");

        showNotification("Книгу успішно додано!");
        bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
        document.getElementById('add-product-form').reset();
        loadAdminProducts();
        
    } catch (error) {
        showNotification(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Зберегти книгу";
    }
}

// Delete product
async function deleteProduct(id) {
    const token = localStorage.getItem('jwt_token');
    if (!confirm(`Ви впевнені, що хочете видалити книгу з ID ${id}?`)) return;

    try {
        const response = await fetch(`${API_PRODUCTS_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Неможливо видалити (книга може бути в замовленнях клієнтів)");
        showNotification("Книгу видалено!");
        loadAdminProducts();
    } catch (error) {
        showNotification(error.message);
    }
}

// Open edit modal with product data
function openEditModal(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    document.getElementById('edit-prod-id').value = product.id;
    document.getElementById('edit-prod-title').value = product.title;
    document.getElementById('edit-prod-desc').value = product.description || '';
    document.getElementById('edit-prod-price').value = product.price;
    document.getElementById('edit-prod-stock').value = product.stockQuantity;
    document.getElementById('edit-prod-author').value = product.author || 'Невідомо';
    document.getElementById('edit-prod-discount').value = product.discount || '';
    
    document.getElementById('edit-prod-image-url').value = product.imageKey || product.imageUrl || '';
    document.getElementById('edit-prod-image-file').value = ""; 

    const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
    const cat = categoriesList.find(c => c.name === product.categoryName);
    document.getElementById('edit-prod-category').value = cat ? cat.id : "";

    modal.show();
}

// Submit product edits
async function editProductSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('jwt_token');
    const id = document.getElementById('edit-prod-id').value;
    const submitBtn = document.querySelector('#edit-product-form button[type="submit"]');

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = "Збереження...";

        let imageUrl = document.getElementById('edit-prod-image-url').value;
        const fileInput = document.getElementById('edit-prod-image-file');

        if (fileInput.files.length > 0) {
            imageUrl = await uploadImageToS3(fileInput.files[0]);
        }

        const discountValue = document.getElementById('edit-prod-discount').value;

        const requestData = {
            title: document.getElementById('edit-prod-title').value.trim(),
            description: document.getElementById('edit-prod-desc').value.trim(),
            price: parseFloat(document.getElementById('edit-prod-price').value),
            stockQuantity: parseInt(document.getElementById('edit-prod-stock').value),
            author: document.getElementById('edit-prod-author').value.trim(),
            categoryId: parseInt(document.getElementById('edit-prod-category').value),
            imageKey: imageUrl,
            discount: discountValue ? parseInt(discountValue) : null
        };

        const response = await fetch(`${API_PRODUCTS_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) throw new Error("Не вдалося оновити книгу");

        showNotification("Книгу оновлено!");
        bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
        loadAdminProducts();
        
    } catch (error) {
        showNotification(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Зберегти зміни";
    }
}

// Load all customer orders
async function loadAdminOrders() {
    const tbody = document.getElementById('admin-orders-table');
    const token = localStorage.getItem('jwt_token');

    try {
        const response = await fetch(API_ORDERS_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 403) {
            alert("Доступ заборонено! Ви не є адміністратором.");
            window.location.href = 'index.html';
            return;
        }

        if (!response.ok) throw new Error('Не вдалося завантажити замовлення');

        const orders = await response.json();
        tbody.innerHTML = '';

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Замовлень ще немає</td></tr>';
            return;
        }

        const availableStatuses = {
            'PENDING': 'Очікує',
            'PAID': 'Оплачено',
            'SHIPPED': 'Відправлено',
            'DELIVERED': 'Доставлено',
            'CANCELLED': 'Скасовано'
        };

        orders.sort((a, b) => b.id - a.id).forEach(order => {
            const date = new Date(order.date).toLocaleString('uk-UA');
            let itemsHtml = order.listOfItems.map(item => `
                <div style="font-size: 14px;">${item.title || item.bookTitle || 'Невідома книга'} (x${item.quantity})</div>
            `).join('');
            
            let badgeClassMap = {
                'PENDING': 'bg-warning text-dark',
                'PAID': 'bg-info text-dark',
                'SHIPPED': 'bg-primary',
                'DELIVERED': 'bg-success',
                'CANCELLED': 'bg-danger'
            };
            let statusBadgeClass = badgeClassMap[order.status] || 'bg-secondary';
            let statusName = availableStatuses[order.status] || order.status;
            let statusBadge = `<span class="badge ${statusBadgeClass}">${statusName}</span>`;

            let selectOptions = Object.keys(availableStatuses).map(statusKey => `
                <option value="${statusKey}" ${order.status === statusKey ? 'selected' : ''}>${availableStatuses[statusKey]}</option>
            `).join('');

            let actionHtml = `
                <div class="d-flex align-items-center">
                    <select class="form-select form-select-sm me-2" id="status-select-${order.id}" style="width: auto;">
                        ${selectOptions}
                    </select>
                    <button class="btn btn-sm btn-outline-primary" onclick="changeOrderStatus(${order.id})">Зберегти</button>
                </div>
            `;

            tbody.innerHTML += `
                <tr>
                    <td><strong>#${order.id}</strong></td>
                    <td style="font-size: 14px; color: #666;">${date}</td>
                    <td>${itemsHtml}</td>
                    <td class="fw-bold">${order.totalPrice} грн</td>
                    <td>${statusBadge}</td>
                    <td>${actionHtml}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Orders load error:", error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Не вдалося завантажити замовлення</td></tr>';
    }
}

/*"Update order status"*/
async function changeOrderStatus(orderId) {
    const token = localStorage.getItem('jwt_token');
    const newStatus = document.getElementById(`status-select-${orderId}`).value;
    
    try {
        const response = await fetch(`${API_ORDERS_URL}/${orderId}/status?newStatus=${newStatus}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Не вдалося оновити статус');

        showNotification(`Статус замовлення #${orderId} оновлено!`);
        loadAdminOrders();

    } catch (error) {
        showNotification(error.message);
    }
}

/*"Load categories for selects and table"*/
async function loadAdminCategories() {
    try {
        const response = await fetch(API_CATEGORIES_URL);
        categoriesList = await response.json();
        
        let optionsHtml = '<option value="">Оберіть жанр</option>';
        categoriesList.forEach(c => {
            optionsHtml += `<option value="${c.id}">${c.name}</option>`;
        });
        
        if(document.getElementById('prod-category')) document.getElementById('prod-category').innerHTML = optionsHtml;
        if(document.getElementById('edit-prod-category')) document.getElementById('edit-prod-category').innerHTML = optionsHtml;

        const tbody = document.getElementById('admin-categories-table');
        if (tbody) {
            tbody.innerHTML = '';
            if (categoriesList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center">Жанрів ще немає</td></tr>';
                return;
            }
            
            categoriesList.sort((a,b) => a.id - b.id).forEach(c => {
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${c.id}</strong></td>
                        <td class="fw-bold text-primary">${c.name}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${c.id})" title="Видалити">🗑️</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (e) {
        console.error("Categories load error:", e);
    }
}

/*"Create new category"*/
async function createCategorySubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('jwt_token');
    const catName = document.getElementById('cat-name').value.trim();

    try {
        const response = await fetch(API_CATEGORIES_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name: catName })
        });

        if (!response.ok) throw new Error("Не вдалося створити категорію. Можливо, вона вже існує.");

        alert("Жанр додано!"); 
        bootstrap.Modal.getInstance(document.getElementById('addCategoryModal')).hide();
        document.getElementById('add-category-form').reset();
        loadAdminCategories(); 
    } catch (error) {
        alert(error.message);
    }
}

/*"Delete category"*/
async function deleteCategory(id) {
    const token = localStorage.getItem('jwt_token');
    if (!confirm(`Ви впевнені, що хочете видалити жанр з ID ${id}?`)) return;

    try {
        const response = await fetch(`${API_CATEGORIES_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Не вдалося видалити жанр.");
        alert("Жанр видалено!");
        loadAdminCategories();
    } catch (error) {
        alert(error.message);
    }
}

/*"Upload image to server"*/
async function uploadImageToS3(file) {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem('jwt_token');

    const response = await fetch('http://51.20.122.240:8080/api/files/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    if (!response.ok) throw new Error("Не вдалося завантажити зображення");
    const data = await response.json();
    return data.url;
}

/*"Load books for banner selection"*/
async function loadBannerOptions() {
    const select = document.getElementById('banner-select');
    try {
        const response = await fetch('http://51.20.122.240:8080/api/products?size=100');
        const data = await response.json();
        const products = data.content || data;
        
        select.innerHTML = '<option value="">-- Оберіть книгу --</option>';
        products.forEach(p => {
            select.innerHTML += `<option value="${p.id}">${p.title} (${p.author})</option>`;
        });
    } catch (e) {
        console.error(e);
    }
}

/*"Save selected book as banner"*/
async function saveBanner() {
    const bookId = document.getElementById('banner-select').value;
    if(!bookId) return alert("Оберіть книгу!");

    const token = localStorage.getItem('jwt_token');
    try {
        const res = await fetch(`http://51.20.122.240:8080/api/products/banner/${bookId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            showNotification("Банер оновлено!");
        } else {
            showNotification("Оновлення не вдалося", true);
        }
    } catch (e) {
        showNotification("Помилка сервера", true);
    }
}

/*"Load all reviews for moderation"*/
async function loadAdminReviews() {
    const tbody = document.getElementById('admin-reviews-table');
    if (!tbody) return;
    
    const token = localStorage.getItem('jwt_token');

    try {
        const response = await fetch('http://51.20.122.240:8080/api/reviews', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Не вдалося завантажити відгуки');

        const reviews = await response.json();
        tbody.innerHTML = '';

        if (reviews.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Відгуків ще немає</td></tr>';
            return;
        }

        reviews.forEach(review => {
            const dateStr = review.createdAt ? new Date(review.createdAt).toLocaleString('uk-UA') : 'Невідомо';
            let stars = '';
            for (let i = 0; i < review.rating; i++) stars += '⭐';

            tbody.innerHTML += `
                <tr>
                    <td><strong>#${review.id}</strong></td>
                    <td style="font-size: 14px; color: #666;">${dateStr}</td>
                    <td class="fw-bold">${review.userName}</td>
                    <td>${stars}</td>
                    <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${review.text}">
                        ${review.text}
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteAdminReview(${review.id})" title="Видалити">🗑️</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Reviews load error:", error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Не вдалося завантажити відгуки</td></tr>';
    }
}

/*"Delete review"*/
async function deleteAdminReview(id) {
    const token = localStorage.getItem('jwt_token');
    if (!confirm(`Ви впевнені, що хочете остаточно видалити відгук #${id}?`)) return;

    try {
        const response = await fetch(`http://51.20.122.240:8080/api/reviews/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Видалення не вдалося");
        
        showNotification("Відгук видалено!");
        loadAdminReviews();
    } catch (error) {
        showNotification(error.message, true);
    }
}

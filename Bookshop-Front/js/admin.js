const API_PRODUCTS_URL = 'http://localhost:8080/api/products';

document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('jwt_token');
    if (!token) {
        alert("Доступ заборонено!");
        window.location.href = 'login.html';
        return;
    }

    loadAdminProducts();

    const form = document.getElementById('add-product-form');
    if (form) {
        form.addEventListener('submit', createProduct);
    }
});

async function loadAdminProducts() {
    const tbody = document.getElementById('admin-products-table');
    try {
        const response = await fetch(API_PRODUCTS_URL);
        const data = await response.json();
        const products = data.content ? data.content : data;

        tbody.innerHTML = '';
        
        products.sort((a, b) => b.id - a.id).forEach(p => {
            const imageSrc = p.imageUrl ? p.imageUrl : 'https://placehold.co/50x75?text=Img';
            
            tbody.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td><img src="${imageSrc}" alt="cover" style="width: 50px; border-radius: 4px;"></td>
                    <td class="fw-bold">${p.title}</td>
                    <td>${p.price} грн</td>
                    <td>
                        <span class="badge ${p.stockQuantity > 5 ? 'bg-success' : 'bg-danger'}">
                            ${p.stockQuantity} шт.
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">Видалити</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Помилка:", error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Помилка завантаження</td></tr>';
    }
}

async function createProduct(event) {
    event.preventDefault();
    const token = localStorage.getItem('jwt_token');

    const requestData = {
        title: document.getElementById('prod-title').value,
        description: document.getElementById('prod-desc').value,
        price: parseFloat(document.getElementById('prod-price').value),
        stockQuantity: parseInt(document.getElementById('prod-stock').value),
        imageKey: document.getElementById('prod-image').value 
    };

    try {
        const response = await fetch(API_PRODUCTS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error("Немає прав адміністратора!");
            }
            throw new Error("Помилка створення товару");
        }

        alert("Книгу успішно додано!");
        
        const modalElement = document.getElementById('addProductModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();

        document.getElementById('add-product-form').reset();
        loadAdminProducts();

    } catch (error) {
        alert(error.message);
    }
}

function deleteProduct(id) {
    alert(`Функція видалення (ID: ${id}) ще не реалізована на бекенді!`);
}
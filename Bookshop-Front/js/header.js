// Profile dropdown and auth logic
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt_token');
    const nav = document.querySelector('.main-nav');
    
    if (nav) {
        const loginLink = Array.from(nav.querySelectorAll('a')).find(a => a.getAttribute('href') === 'login.html');
        const existingDropdown = nav.querySelector('.profile-dropdown');

        if (token) {
            if (loginLink) loginLink.remove();

            if (!existingDropdown) {
                const currentPage = window.location.pathname;
                const isCabinetActive = (currentPage.includes('profile.html') || currentPage.includes('wishlist.html')) ? 'active' : '';

                const dropdown = document.createElement('div');
                dropdown.className = 'profile-dropdown';
                dropdown.innerHTML = `
                    <a href="profile.html" class="${isCabinetActive}">Мій кабінет ▾</a>
                    <div class="profile-dropdown-content">
                        <a href="profile.html">Профіль</a>
                        <a href="wishlist.html">Список бажань ❤️</a>
                        <a href="#" onclick="logoutUser(); return false;" style="border-top: 1px solid #eee; margin-top: 5px; padding-top: 10px;">Вийти</a>
                    </div>
                `;
                nav.appendChild(dropdown);
            }
        }
    }
});

// Global logout function
window.logoutUser = function() {
    if(confirm("Ви впевнені, що хочете вийти?")) {
        localStorage.removeItem('jwt_token');
        window.location.href = 'index.html'; 
    }
};

// Global notifications (Toastify)
window.showNotification = function(message, isError = false) {
    Toastify({
        text: message,
        duration: 3000, 
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true, 
        style: {
            background: isError ? "linear-gradient(to right, #ff5f6d, #ffc371)" : "linear-gradient(to right, #00b09b, #96c93d)",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontFamily: "'Nunito', sans-serif",
            fontSize: "16px"
        }
    }).showToast();
};

// Sticky header logic (hide on scroll down)
document.addEventListener('DOMContentLoaded', () => {
    let lastScrollTop = 0;
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll > lastScrollTop && currentScroll > header.offsetHeight) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });
});


window.wishlistCache = new Set();

// Initialize wishlist cache
window.initWishlistCache = async function() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const response = await fetch('http://51.20.122.240:8080/api/wishlist', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const wishlist = await response.json();
            window.wishlistCache.clear();
            wishlist.forEach(book => window.wishlistCache.add(book.id));
        }
    } catch (error) {
        console.error('Wishlist cache error:', error);
    }
};

// Toggle book in wishlist
window.toggleWishlist = async function(productId, event) {
    let btn = null;
    if(event) {
        event.preventDefault();
        event.stopPropagation();
        btn = event.target.closest('button') || event.target;
    }

    const token = localStorage.getItem('jwt_token');
    if (!token) {
        showNotification("Будь ласка, увійдіть, щоб зберігати книги ❤️", true);
        return;
    }

    const isWished = window.wishlistCache.has(productId);
    const method = isWished ? 'DELETE' : 'POST';

    if (btn) btn.style.pointerEvents = 'none';

    try {
        const response = await fetch(`http://51.20.122.240:8080/api/wishlist/${productId}`, {
            method,
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Update failed');

        if (isWished) {
            window.wishlistCache.delete(productId);
            showNotification("💔 Видалено зі списку бажань!");
            if (btn) btn.style.color = '#ccc'; 
            if (window.location.pathname.includes('wishlist.html') && typeof fetchWishlist === 'function') {
                fetchWishlist();
            }
        } else {
            window.wishlistCache.add(productId);
            showNotification("❤️ Додано до списку бажань!");
            if (btn) btn.style.color = '#c91818'; 
        }

    } catch (error) {
        console.error(error);
        showNotification("Помилка сервера", true);
    } finally {
        if (btn) btn.style.pointerEvents = 'auto';
    }
};


// Mini-cart (hover dropdown) logic
document.addEventListener('DOMContentLoaded', () => {
    const cartLink = document.querySelector('.cart-link');
    if (cartLink) {
        const wrapper = document.createElement('div');
        wrapper.className = 'cart-dropdown';
        cartLink.parentNode.insertBefore(wrapper, cartLink);
        wrapper.appendChild(cartLink);

        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'cart-dropdown-content';
        dropdownContent.id = 'mini-cart-content';
        wrapper.appendChild(dropdownContent);

        let hideTimeout;
        wrapper.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            window.renderMiniCart();
            dropdownContent.classList.add('show');
        });

        wrapper.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => {
                dropdownContent.classList.remove('show');
            }, 200); 
        });
    }
});

// Render mini-cart content
window.renderMiniCart = async function() {
    const container = document.getElementById('mini-cart-content');
    if (!container) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="padding: 25px; text-align: center;">
                <div style="font-size: 35px; margin-bottom: 10px; color: #e0e0e0;">🛒</div>
                <p style="color: #666; margin: 0; font-size: 16px;">Кошик порожній</p>
            </div>`;
        return;
    }

    if (!container.innerHTML.includes('Разом')) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">Завантаження...</div>';
    }

    let html = '<div style="padding: 15px; max-height: 450px; overflow-y: auto; overflow-x: hidden;">';
    const displayCart = cart.slice(0, 3);

    for (const item of displayCart) {
        const itemTotal = item.price * item.quantity;
        let imageSrc = 'https://placehold.co/50x75?text=No+Cover';
        try {
            const res = await fetch(`http://51.20.122.240:8080/api/products/${item.productId}`);
            if (res.ok) {
                const prod = await res.json();
                imageSrc = prod.imageUrl || prod.imageKey || imageSrc;
            }
        } catch (e) {
            console.error("Cart image load failed");
        }

        html += `
            <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f5f5f5;">
                <img src="${imageSrc}" alt="обкладинка" style="width: 50px; height: 75px; object-fit: cover; border-radius: 4px; border: 1px solid #eee;">
                <div style="flex: 1; min-width: 0;"> 
                    <a href="book.html?id=${item.productId}" style="font-size: 14px; font-weight: bold; color: #222; text-decoration: none; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 5px;">${item.title}</a>
                    <div style="font-size: 13px; color: #888;">${item.price} грн × ${item.quantity} шт.</div>
                </div>
                <div style="font-weight: bold; color: #c91818; font-size: 15px; white-space: nowrap;">${itemTotal} грн</div>
            </div>
        `;
    }

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cart.length > 3) {
        html += `<div style="text-align: center; font-size: 13px; color: #888; margin-bottom: 15px; padding: 6px; background: #f9f9f9; border-radius: 4px;">...та ще ${cart.length - 3}</div>`;
    }

    html += `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; font-size: 16px;">
            <span style="color: #555;">Разом:</span>
            <span style="font-weight: 900; color: #c91818; font-size: 19px;">${cartTotal} грн</span>
        </div>
        <a href="cart.html" class="btn-buy" style="display: block; text-align: center; margin-top: 15px; padding: 12px; font-size: 15px; text-decoration: none; border-radius: 6px; width: 100%; box-sizing: border-box;">Перейти до кошика</a>
    </div>`;

    container.innerHTML = html;
};

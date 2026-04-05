document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.main-nav');
    const token = localStorage.getItem('jwt_token');

    if (token && nav) {
        const loginLink = Array.from(nav.querySelectorAll('a')).find(a => a.getAttribute('href') === 'login.html');
        if (loginLink) {
            loginLink.remove();
        }

        const cartLink = nav.querySelector('.cart-link');

        const profileLink = document.createElement('a');
        profileLink.href = 'profile.html';
        profileLink.innerText = 'Мій профіль';
        nav.insertBefore(profileLink, cartLink);

        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.innerText = 'Вийти';
        logoutLink.style.color = '#c91818';
        logoutLink.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('jwt_token');
            window.location.href = 'index.html';
        };
        nav.insertBefore(logoutLink, cartLink);
    }
});

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
            fontFamily: "Arial, sans-serif",
            fontSize: "16px"
        }
    }).showToast();
}
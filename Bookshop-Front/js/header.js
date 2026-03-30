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
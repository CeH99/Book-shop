const AUTH_URL = 'http://localhost:8080/api/auth/login';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error('Невірні дані');
        }

        const data = await response.json();

        const jwtToken = data.token || data.jwt || data.accessToken; 
        
        if (jwtToken) {
            localStorage.setItem('jwt_token', jwtToken);
            window.location.href = 'index.html';
        } else {
            console.error('Токен не знайдено у відповіді:', data);
            errorMsg.style.display = 'block';
            errorMsg.innerText = 'Помилка сервера: токен не отримано';
        }

    } catch (error) {
        console.error('Помилка входу:', error);
        errorMsg.style.display = 'block';
        errorMsg.innerText = 'Невірний email або пароль!';
    }
}


const REGISTER_URL = 'http://localhost:8080/api/auth/register';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleRegister(event) {
    event.preventDefault(); 

    const name = document.getElementById('reg-name').value;
    const surname = document.getElementById('reg-surname').value;
    const email = document.getElementById('reg-email').value;
    const telephone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    
    const errorMsg = document.getElementById('reg-error-msg');
    const successMsg = document.getElementById('reg-success-msg');
    const submitBtn = event.target.querySelector('button');

    errorMsg.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerText = 'Зачекайте...';

    const requestData = {
        name: name,
        surname: surname,
        email: email,
        telephone: telephone,
        password: password
    };

    try {
        const response = await fetch(REGISTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error((errorData && errorData.message) ? errorData.message : 'Помилка реєстрації');
        }

        const data = await response.json();

        successMsg.style.display = 'block';

        const jwtToken = data.token || data.jwt || data.accessToken;
        
        if (jwtToken) {
            localStorage.setItem('jwt_token', jwtToken);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }

    } catch (error) {
        console.error('Помилка:', error);
        errorMsg.style.display = 'block';
        errorMsg.innerText = error.message === 'Failed to fetch' 
            ? 'Немає зв\'язку з сервером' 
            : 'Помилка: ' + error.message;
        
        submitBtn.disabled = false;
        submitBtn.innerText = 'Створити акаунт';
    }
}
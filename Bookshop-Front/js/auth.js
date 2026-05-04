const AUTH_URL = 'http://51.20.122.240:8080/api/auth/login';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Handle user login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Невірні дані для входу');
        }

        const data = await response.json();
        const jwtToken = data.token || data.jwt || data.accessToken; 
        
        if (jwtToken) {
            localStorage.setItem('jwt_token', jwtToken);
            window.location.href = 'index.html';
        } else {
            console.error('Token not found in response:', data);
            errorMsg.style.display = 'block';
            errorMsg.innerText = 'Помилка сервера: токен не отримано';
        }

    } catch (error) {
        console.error('Login error:', error);
        errorMsg.style.display = 'block';
        errorMsg.innerText = 'Невірний email або пароль!';
    }
}


const REGISTER_URL = 'http://51.20.122.240:8080/api/auth/register';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Handle user registration
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
    submitBtn.innerText = 'Будь ласка, зачекайте...';

    const requestData = { name, surname, email, telephone, password };

    try {
        const response = await fetch(REGISTER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error((errorData && errorData.message) ? errorData.message : 'Реєстрація не вдалася');
        }

        const data = await response.json();
        successMsg.style.display = 'block';

        const jwtToken = data.token || data.jwt || data.accessToken;
        
        if (jwtToken) {
            localStorage.setItem('jwt_token', jwtToken);
            setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        } else {
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        }

    } catch (error) {
        console.error('Registration error:', error);
        errorMsg.style.display = 'block';
        errorMsg.innerText = error.message === 'Failed to fetch' 
            ? 'Помилка з\'єднання з сервером' 
            : 'Помилка: ' + error.message;
        
        submitBtn.disabled = false;
        submitBtn.innerText = 'Створити акаунт';
    }
}

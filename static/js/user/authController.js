class AuthController {
    constructor() {
        this.loginFormSection = document.getElementById('loginForm');
        this.registerFormSection = document.getElementById('registerForm');

        // Initially display only the login form and set the title
        this.showLoginForm();

        // Bind event listeners for form navigation
        const registerLink = document.querySelector("a[href='#registerForm']");
        const loginLink = document.querySelector("a[href='#loginForm']");

        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }

        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }

        // Bind event listeners for form submissions
        this.loginForm = this.loginFormSection.querySelector('form');
        this.registerForm = this.registerFormSection.querySelector('form');

        if (this.loginForm) {
            this.loginForm.addEventListener('submit', this.login.bind(this));
        }

        if (this.registerForm) {
            this.registerForm.addEventListener('submit', this.register.bind(this));
        }

        // Bind the logout button
        this.logoutButton = document.getElementById('logoutButton');
        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', this.handleLogout.bind(this));
        }
    }

    showLoginForm() {
        // Show login form, hide signup form, and update title
        this.loginFormSection.style.display = 'block';
        this.registerFormSection.style.display = 'none';
        document.title = 'Login';
    }

    showRegisterForm() {
        // Show signup form, hide login form, and update title
        this.loginFormSection.style.display = 'none';
        this.registerFormSection.style.display = 'block';
        document.title = 'Sign Up';
    }

    async register(event) {
        event.preventDefault();

        const name = this.registerForm.querySelector('#name').value;
        const email = this.registerForm.querySelector('#email').value;
        const password = this.registerForm.querySelector('#password').value;
        const gender = this.registerForm.querySelector('#gender').value;


        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    gender
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful!');
                window.location.href = '/user/resumes/';
            } else {
                alert(data.message || 'Registration failed.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred. Please try again later.');
        }
    }

    async login(event) {
        event.preventDefault();

        const email = this.loginForm.querySelector('#email').value;
        const password = this.loginForm.querySelector('#password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('name', data.user.name);
                alert('Login successful! Redirecting to dashboard.');
                window.location.href = '/user/resumes/';
            } else {
                alert(data.message || 'Login failed.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred. Please try again later.');
        }
    }
    async handleLogout() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No token found, you are not logged in.');
                return;
            }

            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,  // Send the JWT token as a Bearer token in the Authorization header
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                localStorage.removeItem('token');  // Remove the token from localStorage
                window.location.href = '/';  // Redirect to login page
            } else {
                alert('Error logging out');
                window.location.href = '/'; 
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

// Initialize the AuthController
window.addEventListener('DOMContentLoaded', () => {
    new AuthController();
});

import { RestAPIUtil, NonAuthenticatedRestAPIUtil } from '../common/restAPIUtil.js';
class AuthController {
    constructor() {
        this.loginFormSection = document.getElementById('loginForm');
        this.registerFormSection = document.getElementById('registerForm');

        this.logoutBtn = document.getElementById('logoutButton');

        if(this.loginFormSection){
            this.showLoginForm();
            this.loginForm = this.loginFormSection.querySelector('form');
            if (this.loginForm) {
                this.loginForm.addEventListener('submit', this.login.bind(this));
            }
        }

        if(this.registerFormSection){
            this.registerForm = this.registerFormSection.querySelector('form');
            if (this.registerForm) {
                this.registerForm.addEventListener('submit', this.register.bind(this));
            }
    
        }
 
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

       
        // Bind the logout button
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
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
            const response = await NonAuthenticatedRestAPIUtil.post('/auth/register', {
                    name,
                    email,
                    password,
                    gender
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful! You need to login now');
                window.location.href = '/auth';
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
            const data = await NonAuthenticatedRestAPIUtil.post('/auth/login', { email, password });

            if (data) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('name', data.user.name);
                switch (data.user.role) {
                    case "admin":
                        window.location.href = "/admin_dashboard";
                        break;
                    case "customer_support":
                        window.location.href = "/support_dashboard";
                        break;
                    case "user":
                    default:
                        window.location.href = "/user/resumes/";
                }
            } else {
                document.getElementById('loginError').textContent = `Login failed with status: ${response.status}`;
                document.getElementById('loginError').style.display = 'block';
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

            const data = await RestAPIUtil.post('auth/logout', {}, true);

            if (data) {
                localStorage.removeItem('token');
                window.location.href = '/';
            } else {
                alert(`Error logging out`);
                console.error('Logout failed');
                window.location.href = '/';
            }
        } catch (error) {
            alert('Error logging out');
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    }
}

// Initialize the AuthController
window.addEventListener('DOMContentLoaded', () => {
    new AuthController();
});

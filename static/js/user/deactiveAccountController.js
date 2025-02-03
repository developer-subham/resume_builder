class DeactiveAccountController {
    constructor() {
        this.apiUrl = '/api/user';
        this.token = localStorage.getItem('token');

        this.deactivebtn = document.getElementById('deactivebtn');

        if (this.deactivebtn) {
            this.deactivebtn.addEventListener('click', this.confirmDeactivation.bind(this));
        }

    }

    confirmDeactivation() {
        if (confirm('Are you sure you want to deactivate your account?')) {
            this.deactivateAccount();
        }
    }

    async deactivateAccount() {
        try {
            const response = await fetch(`${this.apiUrl}/deactive_account`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || 'Failed to deactivate account');
            }

            alert('Account deactivated successfully!');
            localStorage.removeItem('token');
            window.location.href = '/';
        } catch (error) {
            console.error('Error deactivating account:', error);
            alert('Failed to deactivate account. Please try again.');
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new DeactiveAccountController();
});
class ChangePasswordController {
    constructor() {
        this.apiUrl = '/api/user';
        this.token = localStorage.getItem('token');
        
        this.changePasswordBtn = document.getElementById('changePassword');
        this.savechangePasswordBtn = document.getElementById('ch-psBtn');

        if (this.savechangePasswordBtn) {
            this.savechangePasswordBtn.addEventListener('click', this.handleChangePassword.bind(this));
        }
        if (this.changePasswordBtn) {
            this.changePasswordBtn.addEventListener('click', this.enablePassword.bind(this));
        }

        // Redirect if not logged in
        if (!this.token) {
            alert('Unauthorized access. Please log in.');
            window.location.href = '/auth';
            return;
        }
    }

    toggleChangePassword(isEditable) {
        const fields = ['old-ps', 'new-ps', 'confirm-ps'];
        fields.forEach((fieldId) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.disabled = !isEditable;
            }
        });

        this.savechangePasswordBtn.style.display = isEditable ? 'inline-block' : 'none';
        this.changePasswordBtn.style.display = isEditable ? 'none' : 'inline-block';
    }

    enablePassword() {
        this.toggleChangePassword(true);
    }

    async handleChangePassword() {
        try {
            const oldPassword = document.getElementById('old-ps').value;
            const newPassword = document.getElementById('new-ps').value;
            const confirmPassword = document.getElementById('confirm-ps').value;

            if (!oldPassword || !newPassword || !confirmPassword) {
                alert('Please fill in all fields.');
                return;
            }

            if (newPassword !== confirmPassword) {
                alert('Confirm password does not match.');
                return;
            }

            const response = await fetch(`${this.apiUrl}/change_password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
                body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || 'Failed to change password');
            }

            alert('Your password has been changed!');
            window.location.href = '/settings';
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Failed to change password. Please try again.');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChangePasswordController();
});
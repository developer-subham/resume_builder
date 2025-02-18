import { RestAPIUtil } from '../common/restAPIUtil.js';
class ChangePasswordController {
    constructor() {
        
        this.savechangePasswordBtn = document.getElementById('ch-psBtn');

        if (this.savechangePasswordBtn) {
            this.savechangePasswordBtn.addEventListener('click', this.handleChangePassword.bind(this));
        }
    }

    async handleChangePassword(event) {
        event.preventDefault();
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

            await RestAPIUtil.post(
                `user/change_password`,
                {
                    current_password: oldPassword,
                    new_password: newPassword,
                }
            );

            alert('Password changed successfully!');
            this.changePasswordForm.reset();
            window.location.href = '/settings';
        } catch (error) {
            console.error('Error changing password:', error);
            alert("Failed to change password. Please try again.");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChangePasswordController();
});
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
            let oldPasswordTag = document.getElementById('old-ps');
            let newPasswordTag  = document.getElementById('new-ps');
            let confirmPasswordTag  = document.getElementById('confirm-ps');


            const oldPassword = oldPasswordTag.value;
            const newPassword = newPasswordTag.value;
            const confirmPassword = confirmPasswordTag.value;

            if (newPassword !== confirmPassword) {
                alert('Confirm password does not match.');
                return;
            }

            try {
                await RestAPIUtil.patch(
                    `user/change_password`,
                    {
                        current_password: oldPassword,
                        new_password: newPassword,
                    }
                );
    
                alert('Password changed successfully!');
                oldPasswordTag.value="";
                newPasswordTag.value="";
                confirmPasswordTag.value="";

            } catch (error) {
                console.error('Error changing password:', error);
                alert('Failed to change password. Please try again.');
            }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChangePasswordController();
});
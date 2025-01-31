class UserSettingController {
    constructor() {
        this.profileForm = document.getElementById('editProfileForm');
        this.saveButton = document.getElementById('saveBtn');
        this.editButton = document.getElementById('editBtn');
        this.deactivebtn = document.getElementById('deactivebtn');
        this.changePasswordBtn = document.getElementById('changePassword');
        this.savechangePasswordBtn = document.getElementById('ch-psBtn');
        this.uploadImg = document.getElementById('')
        this.apiUrl = '/api/user';
        this.token = localStorage.getItem('token');

        this.deactivebtn.addEventListener('click', this.handleDeactivateAccount.bind(this))
        this.savechangePasswordBtn.addEventListener('click', this.handleChangePassword.bind(this))

        if (this.changePasswordBtn) {
            this.changePasswordBtn.addEventListener('click', this.enablePassword.bind(this));
        }

        if (!this.token) {
            alert('Unauthorized access. Please log in.');
            window.location.href = '/auth';
            return;
        }

        if (this.editButton) {
            this.editButton.addEventListener('click', this.enableEdit.bind(this));
        }

        if (this.saveButton) {
            this.saveButton.addEventListener('click', this.saveProfile.bind(this));
        }
        this.fetchUserProfile();

        if (!profilePic.src || profilePic.src.trim() === "") {
            profilePic.src = DEFAULT_IMAGE;
        }
    }

    async fetchUserProfile() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user data: ${response.statusText}`);
            }

            const data = await response.json();
            this.populateForm(data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            alert('Failed to load user profile. Please try again later.');
        }
    }

    populateForm(data) {
        document.getElementById('ch-fullname').value = data.name || '';
        document.getElementById('ch-email').value = data.email || '';
        document.getElementById('userGender').value = data.gender || 'Other';

        this.toggleEdit(false);
    }

    async saveProfile(event) {
        event.preventDefault();

        const updatedData = {
            name: document.getElementById('ch-fullname').value,
            email: document.getElementById('ch-email').value,
            gender: document.getElementById('userGender').value,
        };

        try {
            const response = await fetch(this.apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error(`Failed to update profile: ${response.statusText}`);
            }

            alert('Profile updated successfully!');
            this.toggleEdit(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    }

    enableEdit() {
        this.toggleEdit(true);
    }

    toggleEdit(isEditable) {
        const fields = ['ch-fullname', 'ch-email', 'userGender'];
        fields.forEach((fieldId) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.disabled = !isEditable;
            }
        });

        document.querySelector('#saveBtn').style.display = isEditable ? 'inline-block' : 'none';
        document.querySelector('#editBtn').style.display = isEditable ? 'none' : 'inline-block';
    }

    showSection(sectionId) {
        const sections = document.querySelectorAll('.settings-section');
        sections.forEach((section) => {
            section.style.display = section.id === sectionId ? 'block' : 'none';
        });
    }

    sendMessage() {
        const message = document.getElementById('chatMessage').value;
        if (message.length == 0){
            alert('Please enter your feedback what you need!')
        }
        if (message) {
            alert(`Message sent: ${message}`);
        }
        
    }

    async handleDeactivateAccount() {
        try {
            // Send a DELETE request to the backend
            const response = await fetch(`${this.apiUrl}/deactive_account`, {
                method: 'PATCH', // Use PATCH method
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`, // Include JWT token in the Authorization header
                },
            });
    
            if (!response.ok) {
                // If the response is not ok, extract the error message
                const errorResult = await response.json();
                throw new Error(errorResult.message || 'Failed to deactivate account');
            }
    
            const result = await response.json();
            alert(result.message || 'Account deactivated successfully!');
    
            // Clear token and redirect the user
            localStorage.removeItem('token');
            window.location.href = '/'; 
        } catch (error) {
            console.error('Error deactivating account:', error);
            alert(error.message || 'Failed to deactivate account. Please try again.');
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
    
        // Toggle visibility of buttons
        document.querySelector('#ch-psBtn').style.display = isEditable ? 'inline-block' : 'none';
        document.querySelector('#changePassword').style.display = isEditable ? 'none' : 'inline-block';
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
    
            const result = await response.json();
            alert(result.message || 'Your password has been changed!');

            window.location.href = '/settings';
        } catch (error) {
            alert(error.message || 'Failed to change password. Please try again.');
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    new UserSettingController();
});

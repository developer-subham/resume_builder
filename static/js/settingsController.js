class UserSettingController {
    constructor() {
        this.profileForm = document.getElementById('editProfileForm');
        this.saveButton = document.getElementById('saveBtn');
        this.editButton = document.getElementById('editBtn');
        this.apiUrl = '/api/user';
        this.token = localStorage.getItem('token');

        this.deleteBtn = document.getElementById('deleteBtn');

        this.deleteBtn.addEventListener('click', this.handelDeleteAccount.bind(this))

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

    toggleNavbar() {
        const sidebar = document.getElementById('sideNavbar');
        sidebar.classList.toggle('collapsed');
        sidebar.classList.toggle('expanded');
    }

    showSection(sectionId) {
        const sections = document.querySelectorAll('.settings-section');
        sections.forEach((section) => {
            section.style.display = section.id === sectionId ? 'block' : 'none';
        });
    }

    sendMessage() {
        const message = document.getElementById('chatMessage').value;
        alert(`Message sent: ${message}`);
    }

    async handelDeleteAccount() {
        const email = document.getElementById('emailConfirmation').value;
    
        if (!email) {
            alert('Please enter your email address.');
            return;
        }
    
        try {
            const response = await fetch(`${this.apiUrl}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
                body: JSON.stringify({ email }),
            });
    
            // Check if the response is successful (status code 2xx)
            if (!response.ok) {
                // If the response is not ok, we attempt to read the body to get the error message
                const errorText = await response.text();  // Read response as text
                try {
                    const errorResult = JSON.parse(errorText);  // Attempt to parse it as JSON
                    throw new Error(errorResult.message || 'Failed to delete account');
                } catch (jsonError) {
                    // If parsing fails, just throw the plain text response as an error
                    throw new Error(errorText || 'Failed to delete account');
                }
            }
    
            // If the response is OK, we can parse it as JSON
            const result = await response.json();
    
            alert('Account deleted successfully!');
            localStorage.removeItem('token'); // Clear local storage
            window.location.href = '/auth';  // Redirect to login page
        } catch (error) {
            console.error('Error deleting account:', error);
            alert(error.message || 'Failed to delete account. Please try again.');
        }
    }
    
}

document.addEventListener('DOMContentLoaded', () => {
    new UserSettingController();
});

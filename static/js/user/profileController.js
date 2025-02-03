class UserSettingController {
    constructor() {
        this.apiUrl = '/api/user';
        this.token = localStorage.getItem('token');

        // Elements
        this.profileForm = document.getElementById('editProfileForm');
        this.saveButton = document.getElementById('saveBtn');
        this.editButton = document.getElementById('editBtn');
        this.profileImageInput = document.getElementById('profileImageInput');
        this.profileImagePreview = document.getElementById('profileImagePreview');
        this.uploadImageButton = document.getElementById('uploadImageButton');

        // Check authentication
        if (!this.token) {
            alert('Unauthorized access. Please log in.');
            window.location.href = '/auth';
            return;
        }

        // Event Listeners
        this.initEventListeners();

        // Load profile data
        this.getUserProfile();
    }

    initEventListeners() {
        if (this.uploadImageButton) {
            this.uploadImageButton.addEventListener('click', () => this.profileImageInput.click());
        }
        if (this.profileImageInput) {
            this.profileImageInput.addEventListener('change', () => this.previewProfileImage());
        }
        if (this.editButton) {
            this.editButton.addEventListener('click', () => this.toggleEdit(true));
        }
        if (this.saveButton) {
            this.saveButton.addEventListener('click', (event) => this.saveProfile(event));
        }
    }

    async getUserProfile() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user data: ${response.statusText}`);
            }

            const data = await response.json();
            this.populateForm(data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            alert('Failed to load profile. Please try again later.');
        }
    }

    populateForm(data) {
        document.getElementById('ch-fullname').value = data.name || '';
        document.getElementById('ch-email').value = data.email || '';
        document.getElementById('userGender').value = data.gender || 'Other';

        this.profileImagePreview.src = data.profile_image ? `/${data.profile_image}` : '/default-profile.png';
        this.toggleEdit(false);
    }

    previewProfileImage() {
        const file = this.profileImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.profileImagePreview.src = event.target.result;
            };
            reader.onerror = () => {
                alert('Failed to load the image. Please try again.');
            };
            reader.readAsDataURL(file);
        }
    }

    async saveProfile(event) {
        event.preventDefault();

        const updatedData = {
            name: document.getElementById('ch-fullname').value,
            email: document.getElementById('ch-email').value,
            gender: document.getElementById('userGender').value,
            profile_image: null,
        };

        if (this.profileImageInput.files.length > 0) {
            updatedData.profile_image = await this.convertFileToBase64(this.profileImageInput.files[0]);
        }

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

    toggleEdit(isEditable) {
        ['ch-fullname', 'ch-email', 'userGender', 'uploadImageButton'].forEach((fieldId) => {
            const field = document.getElementById(fieldId);
            if (field) field.disabled = !isEditable;
        });

        this.editButton.style.display = isEditable ? 'none' : 'inline-block';
        this.saveButton.style.display = isEditable ? 'inline-block' : 'none';
    }

    async convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new UserSettingController());

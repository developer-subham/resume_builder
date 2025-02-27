    import { RestAPIUtil } from '../common/restAPIUtil.js';

    class adminUserController {
        constructor() {
            this.init();
        }

        init() {
            this.loadUsers();
            this.setupSearchEvent();
        }

        async loadUsers() {
            try {
                const users = await RestAPIUtil.get('/admin/users');
                let userTable = '';

                users.forEach(user => {
                    const profileImage = user.profile_image && user.profile_image.trim() !== "" 
                        ? user.profile_image 
                        : "/static/images/uploads/profile_pictures/default.png";

                    userTable += `
                        <tr data-user-id="${user.id}">
                            <td>${user.id}</td>
                            <td><img src="${profileImage}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;"></td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.gender}</td>
                            <td>
                                <span class="badge ${user.is_active ? 'bg-success' : 'bg-danger'}">
                                    ${user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td>${user.created_at}</td>
                            <td>${user.updated_at}</td>
                            <td>
                                <div>
                                    <button class="btn ${user.is_active ? 'btn-danger' : 'btn-success'} toggle-status-btn" 
                                        data-user-id="${user.id}" 
                                        data-is-active="${user.is_active}">
                                        <i class="${user.is_active ? 'fa-solid fa-user-slash' : 'fas fa-user-check'}"></i> 
                                        ${user.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button class="btn btn-success changepasswordbtn" data-user-id="${user.id}">
                                        <i class="fas fa-lock-open"></i> Change password
                                    </button>
                                </div>
                            </td>
                        </tr>`;
                });

                const tableBody = document.getElementById('userTableBody');
                if (tableBody) {
                    tableBody.innerHTML = userTable;

                    document.querySelectorAll('.toggle-status-btn').forEach(button => {
                        button.addEventListener('click', () => {
                            const userId = button.getAttribute('data-user-id');
                            const isActive = button.getAttribute('data-is-active') === "1";
                            this.toggleUserStatus(userId, isActive, button);
                        });
                    });

                    document.querySelectorAll('.changepasswordbtn').forEach(button => {
                        button.addEventListener('click', () => {
                            const userId = button.getAttribute('data-user-id');
                            this.showChangePasswordModal(userId, button);
                        });
                    });
                } else {
                    console.error("Table body element not found.");
                }
            } catch (error) {
                console.error('Error loading users:', error);
            }
        }

        async toggleUserStatus(userId, isActive, button) {
            const confirmationMessage = isActive 
                ? "Are you sure you want to deactivate this user?" 
                : "Are you sure you want to activate this user?";

            if (!confirm(confirmationMessage)) {
                return;
            }

            try {
                const response = await RestAPIUtil.patch(`/admin/users/${userId}/update-status`, {
                    is_active: isActive ? 0 : 1
                });

                if (response.message) {
                    alert(response.message);
                    const badge = button.closest('tr').querySelector('.badge');

                    if (isActive) {
                        badge.classList.remove('bg-success');
                        badge.classList.add('bg-danger');
                        badge.textContent = "Inactive";
                        button.innerHTML = `<i class="fas fa-user-check"></i> Activate`;
                        button.classList.remove('btn-danger');
                        button.classList.add('btn-success');
                        button.setAttribute('data-is-active', "0");
                    } else {
                        badge.classList.remove('bg-danger');
                        badge.classList.add('bg-success');
                        badge.textContent = "Active";
                        button.innerHTML = `<i class="fa-solid fa-user-slash"></i> Deactivate`;
                        button.classList.remove('btn-success');
                        button.classList.add('btn-danger');
                        button.setAttribute('data-is-active', "1");
                    }
                }
            } catch (error) {
                console.error("Error toggling user status:", error);
                alert("Failed to update user status.");
            }
        }

        showChangePasswordModal(userId) {
            const modal = document.getElementById('changePasswordModal');
            const confirmBtn = document.getElementById('confirmChangePassword');
            confirmBtn.addEventListener('click', () => {
                this.changePassword();
            });
            
            if (!modal || !confirmBtn) {
                console.error("Modal elements not found.");
                return;
            }

            // Store user ID in modal attribute
            confirmBtn.setAttribute('data-user-id', userId);

            // Show Bootstrap modal
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
        }

        async changePassword() {
            const newPasswordInput = document.getElementById('newPasswordInput');
            const confirmBtn = document.getElementById('confirmChangePassword');

            if (!confirmBtn || !newPasswordInput) {
                console.error("Change password elements not found.");
                return;
            }

            const userId = confirmBtn.getAttribute('data-user-id');
            const newPassword = newPasswordInput.value.trim();

            if (!newPassword) {
                alert("Please enter a new password.");
                return;
            }

            try {
                const response = await RestAPIUtil.patch(`/admin/users/${userId}/change_password`, {
                    password: newPassword
                });

                if (response.message) {
                    alert("Password changed successfully!");
                    newPasswordInput.value = "";
                    bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
                }
            } catch (error) {
                console.error("Error changing password:", error);
                alert("Failed to change password.");
            }
        }

        setupSearchEvent() {
            const searchButton = document.querySelector('.searchBtn');
            if (!searchButton) {
                console.error("Search button not found!");
                return;
            }
    
            searchButton.addEventListener('click', async () => {
                const searchInput = document.querySelector('.search');
                const searchValue = searchInput ? searchInput.value.trim() : "";
    
                if (searchValue === "") {
                    alert("Please enter a name or email to search.");
                    return;
                }
    
                try {
                    const response = await RestAPIUtil.get(`/admin/users/search?query=${encodeURIComponent(searchValue)}`);
                    
                    if (response && response.length > 0) {
                        this.showUserSearchModal(response[0]);  // Show first matching user
                    } else {
                        alert("User not found.");
                    }
                } catch (error) {
                    console.error("Error searching users:", error);
                    alert("Failed to search for users.");
                }
            });
        }
    
        showUserSearchModal(user) {
            const modalElement = document.getElementById('userSearchModal');
            const modalBody = document.getElementById('searchResultContainer');
    
            if (!modalElement || !modalBody) {
                console.error("Modal elements not found.");
                return;
            }
    
            const profileImage = user.profile_image && user.profile_image.trim() !== ""
                ? user.profile_image
                : "/static/images/uploads/profile_pictures/default.png";
    
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-4">
                        <img src="${profileImage}" class="img-fluid rounded">
                    </div>
                    <div class="col-md-8">
                        <p><strong>ID:</strong> ${user.id}</p>
                        <p><strong>Name:</strong> ${user.name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Gender:</strong> ${user.gender}</p>
                        <p><strong>Status:</strong> 
                            <span class="badge ${user.is_active ? 'bg-success' : 'bg-danger'}">
                                ${user.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </p>
                        <p><strong>Created At:</strong> ${user.created_at}</p>
                        <p><strong>Updated At:</strong> ${user.updated_at}</p>
                    </div>
                </div>
            `;
    
            // Ensure Bootstrap modal is properly initialized
            const modalInstance = new bootstrap.Modal(modalElement);
            modalInstance.show();
        }
    }

    document.addEventListener("DOMContentLoaded", () => new adminUserController());

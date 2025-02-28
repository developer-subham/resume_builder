import { RestAPIUtil } from '../common/restAPIUtil.js';

class AdminUserController {
    constructor() {
        this.currentPage = 1; // Track the current page
        this.totalPages = 1; // Track the total number of pages
        this.pageSize = 1; // Number of items per page
        this.init();
    }

    init() {
        this.loadUsers(); // Load users on initialization
        this.setupEventListeners(); // Set up event listeners for buttons
    }

    setupEventListeners() {
        // Previous button click event
        document.getElementById('prev-page')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--; // Go to the previous page
                this.loadUsers({}, this.currentPage); // Reload users for the new page
            }
        });

        // Next button click event
        document.getElementById('next-page')?.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++; // Go to the next page
                this.loadUsers({}, this.currentPage); // Reload users for the new page
            }
        });

        // Change password confirmation button
        document.getElementById('confirmChangePassword')?.addEventListener('click', () => {
            this.changePassword();
        });
    }

    async loadUsers(filters = {}, page = 1, pageSize = this.pageSize) {
        try {
            let url = `/admin/users?page=${page}&page_size=${pageSize}`;
            if (Object.keys(filters).length > 0) {
                url += `&${new URLSearchParams(filters)}`;
            }

            const response = await RestAPIUtil.get(url);
            const { users, pagination } = response;

            // Update pagination state
            this.currentPage = pagination.page;
            this.totalPages = pagination.total_pages;

            // Render users
            let userTable = '';
            users.forEach(user => {
                userTable += `
                    <tr data-user-id="${user.id}">
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.gender}</td>
                        <td>
                            <span class="badge ${user.is_active ? 'bg-success' : 'bg-danger'}">
                                ${user.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>${user.created_at}</td>
                        <td>
                            <div>
                                <button class="btn ${user.is_active ? 'btn-danger' : 'btn-success'} toggle-status-btn" 
                                    data-user-id="${user.id}" 
                                    data-is-active="${user.is_active}">
                                    <i class="${user.is_active ? 'fa-solid fa-user-slash' : 'fas fa-user-check'}" style="font-size: 16px;"></i> 
                                    ${user.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button class="btn btn-secondary changepasswordbtn" data-user-id="${user.id}">
                                    <i class="fas fa-lock-open" style="font-size: 16px;"></i> Change password
                                </button>
                                <button class="btn btn-success view-more-btn" data-user='${JSON.stringify(user)}'>
                                    <i class="fa-solid fa-ellipsis-vertical" style="font-size: 16px;"></i> View more
                                </button>
                            </div>
                        </td>
                    </tr>`;
            });

            // Update the table body
            const tableBody = document.getElementById('userTableBody');
            if (tableBody) {
                tableBody.innerHTML = userTable;

                // Attach event listeners to dynamically created buttons
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
                        this.showChangePasswordModal(userId);
                    });
                });

                document.querySelectorAll('.view-more-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const user = JSON.parse(button.getAttribute('data-user'));
                        this.showUserSearchModal(user);
                    });
                });
            } else {
                console.error("Table body element not found.");
            }

            // Update pagination controls
            this.updatePaginationControls();
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    updatePaginationControls() {
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');
        const pageInfo = document.getElementById('page-info');

        if (prevButton && nextButton && pageInfo) {
            // Update page info
            pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;

            // Enable/disable buttons based on current page
            prevButton.disabled = this.currentPage === 1;
            nextButton.disabled = this.currentPage === this.totalPages;
        }
    }

    async toggleUserStatus(userId, isActive, button) {
        const confirmationMessage = isActive
            ? "Are you sure you want to deactivate this user?"
            : "Are you sure you want to activate this user?";

        if (!confirm(confirmationMessage)) return;

        try {
            const response = await RestAPIUtil.patch(`/admin/users/${userId}/update-status`, {
                is_active: isActive ? 0 : 1
            });

            if (response.message) {
                alert(response.message);
                this.loadUsers({}, this.currentPage); // Reload users after status change
            }
        } catch (error) {
            console.error("Error toggling user status:", error);
            alert("Failed to update user status.");
        }
    }

    showChangePasswordModal(userId) {
        const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
        document.getElementById('confirmChangePassword').setAttribute('data-user-id', userId);
        modal.show();
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

    showUserSearchModal(user) {
        const modalElement = document.getElementById('userViewMoreModal');
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

        new bootstrap.Modal(modalElement).show();
    }
}

document.addEventListener("DOMContentLoaded", () => new AdminUserController());
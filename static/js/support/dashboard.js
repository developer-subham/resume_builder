import { RestAPIUtil } from '../common/restAPIUtil.js';

class SupportDashboard {
    constructor() {
        this.loadUsers();
        this.logout = document.getElementById('logoutBtn');
        if (this.logout) {
            this.logout.addEventListener("click", this.handleLogout.bind(this));
        }
    }

    async loadUsers() {
        try {
            const users = await RestAPIUtil.get('/support/users');
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
                        <td>
                            <button class="btn ${user.is_active ? 'btn-danger' : 'btn-success'} toggle-status-btn">
                                ${user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                        </td>
                    </tr>`;
            });

            const tableBody = document.getElementById('userTableBody');
            tableBody.innerHTML = userTable;

            // Add event listeners to buttons dynamically
            tableBody.querySelectorAll('.toggle-status-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const row = event.target.closest('tr');
                    const userId = row.getAttribute('data-user-id');
                    this.toggleUserStatus(userId, event.target);
                });
            });

        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async toggleUserStatus(userId, button) {
        try {
            const result = await RestAPIUtil.post(`/support/toggle_status/${userId}`);
            
            if (result.new_status !== undefined) {
                let row = button.closest('tr');
                let statusBadge = row.querySelector('td:nth-child(5) span');

                if (result.new_status === 0) {
                    statusBadge.classList.remove('bg-success');
                    statusBadge.classList.add('bg-danger');
                    statusBadge.textContent = 'Inactive';
                    button.textContent = 'Activate';
                    button.classList.remove('btn-danger');
                    button.classList.add('btn-success');
                } else {
                    statusBadge.classList.remove('bg-danger');
                    statusBadge.classList.add('bg-success');
                    statusBadge.textContent = 'Active';
                    button.textContent = 'Deactivate';
                    button.classList.remove('btn-success');
                    button.classList.add('btn-danger');
                }
            }
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    }
    async handleLogout(){
        localStorage.removeItem("token");
        alert("Logout successfull!");  
        window.location.href = "/auth"; 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SupportDashboard();
});

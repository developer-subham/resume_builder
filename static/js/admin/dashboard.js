import { RestAPIUtil } from '../common/restAPIUtil.js';

class Dashboard {
    constructor() {
        this.userCountElement = document.getElementById("totalUsers");
        this.resumeCountElement = document.getElementById("totalResumes");
        this.activeUserCountElement = document.getElementById("activeUsers");
        this.logoutButton = document.getElementById("logoutBtn");
        this.createResumeButton = document.getElementById("createResumeBtn");
        this.notificationButton = document.getElementById("notificationBtn");

        this.init();
    }

    async fetchStats() {
        try {
            const [userData, resumeData, activeUsersData] = await Promise.all([
                RestAPIUtil.get("/admin/total_users"),
                RestAPIUtil.get("/admin/total_resumes"),
                RestAPIUtil.get("/admin/active_users")
            ]);

            if (userData && resumeData && activeUsersData) {
                this.userCountElement.innerText = userData.total_users || 0;
                this.resumeCountElement.innerText = resumeData.total_resumes || 0;
                this.activeUserCountElement.innerText = activeUsersData.active_users || 0;
            } else {
                console.error("Invalid response format");
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }

    async loadUsers() {
        try {
            const users = await RestAPIUtil.get('/admin/users');
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
                        <td>${user.updated_at}</td>
                    </tr>`;
            });

            const tableBody = document.getElementById('userTableBody');
            if (tableBody) {
                tableBody.innerHTML = userTable;
            } else {
                console.error("Table body element not found.");
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    handleLogout() {
        localStorage.removeItem("token");
        window.location.href = "/auth";
    }

    init() {
        this.fetchStats();
        this.loadUsers();  // 🔥 Call loadUsers() here to fetch user data when the page loads
        this.logoutButton.addEventListener("click", () => this.handleLogout());
        this.createResumeButton.addEventListener("click", () => window.location.href = "/user/resumes");
        this.notificationButton.addEventListener("click", () => {
            const modal = new bootstrap.Modal(document.getElementById("notificationModal"));
            modal.show();
        });
    }
}

// Initialize Dashboard
document.addEventListener("DOMContentLoaded", () => new Dashboard());

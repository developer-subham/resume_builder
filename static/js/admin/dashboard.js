import { RestAPIUtil } from '../common/restAPIUtil.js';

class Dashboard {
    constructor() {
        this.userCountElement = document.getElementById("totalUsers");
        this.resumeCountElement = document.getElementById("totalResumes");
        this.activeUserCountElement = document.getElementById("activeUsers");
        this.logoutButton = document.getElementById("logoutBtn");
        this.createResumeButton = document.getElementById("createResumeBtn");
        this.notificationButton = document.getElementById("notificationBtn");
        this.genderChart = null;
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

    async fetchGenderStats() {
        try {
            const users = await RestAPIUtil.get('/admin/users');
            let maleCount = 0, femaleCount = 0, otherCount = 0;

            users.forEach(user => {
                if (user.gender.toLowerCase() === "male") maleCount++;
                else if (user.gender.toLowerCase() === "female") femaleCount++;
                else otherCount++;
            });

            this.renderGenderChart(maleCount, femaleCount, otherCount);
        } catch (error) {
            console.error("Error fetching gender stats:", error);
        }
    }

    renderGenderChart(male, female, other) {
        const ctx = document.getElementById('genderChart').getContext('2d');

        if (this.genderChart) {
            this.genderChart.destroy();
        }

        this.genderChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Male', 'Female', 'Other'],
                datasets: [{
                    label: 'Gender Distribution',
                    data: [male, female, other],
                    backgroundColor: ['#3498db', '#48A6A7', '#f1c40f'],
                    borderColor: ['#2980b9', '#48A6A7', '#f39c12'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            }
        });
    }

    handleLogout() {
        localStorage.removeItem("token");
        window.location.href = "/auth";
    }

    init() {
        this.fetchGenderStats();
        this.fetchStats();
        this.loadUsers();  // Load users on page load
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
 
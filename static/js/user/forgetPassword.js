import { RestAPIUtil } from '../common/restAPIUtil.js';

class PasswordReset {
    constructor() {
        this.apiUtil = new RestAPIUtil();
        this.token = new URLSearchParams(window.location.search).get("token");
        this.initUI();
    }

    initUI() {
        if (this.token) {
            document.getElementById("request-reset").classList.add("hidden");
            document.getElementById("reset-password").classList.remove("hidden");
        }
    }

    async requestPasswordReset() {
        const email = document.getElementById("email").value;
        try {
            const response = await this.apiUtil.post("/request_password_reset", { email });
            document.getElementById("request-message").innerText = response.message;
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async resetPassword() {
        const newPassword = document.getElementById("new-password").value;
        try {
            const response = await this.apiUtil.post("/reset-password", { new_password: newPassword }, this.token);
            document.getElementById("reset-message").innerText = response.message;
        } catch (error) {
            console.error("Error:", error);
        }
    }
}

const passwordReset = new PasswordReset();

document.getElementById("request-reset-btn").addEventListener("click", () => passwordReset.requestPasswordReset());
document.getElementById("reset-password-btn").addEventListener("click", () => passwordReset.resetPassword());

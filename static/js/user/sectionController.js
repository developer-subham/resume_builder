class SectionController {
    constructor() {
        this.sections = document.querySelectorAll(".settings-section");
    }

    showSection(sectionId) {
        // Hide all sections
        this.sections.forEach(section => {
            section.style.display = "none";
        });

        // Show the selected section
        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            selectedSection.style.display = "block";
        }
    }
}

// Initialize the controller and show default section
document.addEventListener("DOMContentLoaded", () => {
    const controller = new SectionController();
    controller.showSection("general-settings"); // Default to General Settings
});

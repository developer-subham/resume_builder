class ResumeDetailController {
    constructor() {
    }


    deleteSectionRow(button) {
        const row = button.closest('.custom-input');
        if (row) {
            row.remove();
        }
    }

    async saveSection(resumeId, section, data) {
        try {
            const response = await fetch(`/api/resume/${resumeId}/section/${section}`, {
                method: 'PUT',
                headers: {
                    ...this._getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                alert(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!`);
            } else {
                alert(result.error || 'Error saving section');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    // Pre-fill data into the form
    async prefillResumeData(resumeId) {
        try {
            const response = await fetch(`/api/resume/${resumeId}`, {
                method: 'GET',
                headers: this._getAuthHeaders(),
            });
            const resume = await response.json();

            // Populate profile fields including new ones
            if (resume.profile) {
                document.getElementById('fullName').value = resume.profile.full_name || '';
                document.getElementById('gender').value = resume.profile.gender || '';
                document.getElementById('mobile').value = resume.profile.mobile || '';
                document.getElementById('email').value = resume.profile.email || '';
                document.getElementById('resumePic').src = resume.profile.resume_pic || ''; // New image field
                document.getElementById('website').value = resume.profile.website || ''; // New website link
                document.getElementById('github').value = resume.profile.github || ''; // New GitHub link
                document.getElementById('linkedin').value = resume.profile.linkedin || ''; 
                document.getElementById('about').value = resume.profile.about || '';
            }

            // Pre-fill Experience list
            if (resume.experience && Array.isArray(resume.experience)) {
                resume.experience.forEach((exp, index) => {
                    this.addExperienceRow(exp, index);
                });
            }

            // Pre-fill Education list
            if (resume.education && Array.isArray(resume.education)) {
                resume.education.forEach((edu, index) => {
                    this.addEducationRow(edu, index);
                });
            }

              // Pre-fill Project list
              if (resume.projects && Array.isArray(resume.projects)) {
                resume.projects.forEach((proj, index) => {
                    this.addProjectRow(proj, index);
                });
            }

            // Pre-fill Skills list
            if (resume.skills && Array.isArray(resume.skills)) {
                resume.skills.forEach((skill, index) => {
                    this.addSkillRow(skill, index);
                });
            }

            // Pre-fill Hobbies list
            if (resume.hobbies && Array.isArray(resume.hobbies)) {
                resume.hobbies.forEach((hobby, index) => {
                    this.addHobbyRow(hobby, index);
                });
            }

            if (resume.resume_template) {
                document.getElementById('themeName').value = resume.resume_template.theme_name || '';
                document.getElementById('themeColor').value = resume.resume_template.theme_color || '';
            }
        } catch (error) {
            console.error('Error fetching resume data', error);
        }
    }

    // Add Experience Row (adjusted for single-line start/end dates and job title)
    addExperienceRow(existingData = {}, index = 0) {
        const row = `
            <div class="row experience-row custom-input" data-index="${index}">
                <div class="col-md-3 mb-3">
                    <input type="text" class="form-control" name="job_title" value="${existingData.job_title || ''}" placeholder="Enter job title">
                </div>
                <div class="col-md-3 mb-3">
                    <input type="text" class="form-control" name="company_name" value="${existingData.company_name || ''}" placeholder="Enter company Name">
                </div>
                <div class="col-md-2 mb-3">
                    <input type="text" class="form-control" name="city" value="${existingData.city || ''}" placeholder="City">
                </div>
                <div class="col-md-2 mb-3">
                    <input type="month" class="form-control" name="start_date" value="${existingData.start_date || ''}" placeholder="Start Date">
                </div>
                <div class="col-md-2 mb-3">
                    <input type="month" class="form-control" name="end_date" value="${existingData.end_date || ''}" placeholder="End Date">
                </div>
                <div class="col-md-2 mb-3">
                    <button type="button" class="btn btn-danger" onclick="deleteSectionRow(this, 'experience')">Delete</button>
                </div>
            </div>`;
        document.getElementById('experienceList').insertAdjacentHTML('beforeend', row);
    }

    // Add Education Row (adjusted for same-line fields)
    addEducationRow(existingData = {}, index = 0) {
        const row = `
            <div class="row education-row custom-input" data-index="${index}">
                <div class="col-md-2 mb-3">
                    <input type="text" class="form-control" name="degree" value="${existingData.degree || ''}" placeholder="Degree">
                </div>
                <div class="col-md-2 mb-3">
                    <input type="text" class="form-control" name="institution" value="${existingData.institution || ''}" placeholder="Institution">
                </div>
                <div class="col-md-2 mb-3">
                    <input type="text" class="form-control" name="city" value="${existingData.city || ''}" placeholder="City">
                </div>
                <div class="col-md-2 mb-3">
                    <input type="month" class="form-control" name="start_date" value="${existingData.start_date || ''}" placeholder="Start Date">
                </div>
                <div class="col-md-2 mb-3">
                    <input type="month" class="form-control" name="end_date" value="${existingData.end_date || ''}" placeholder="End Date">
                </div>
                <div class="col-md-2 mb-3">
                    <button type="button" class="btn btn-danger" onclick="deleteSectionRow(this, 'education')"><i class="bi bi-trash"></i></button>
                </div>
            </div>`;
        document.getElementById('educationList').insertAdjacentHTML('beforeend', row);
    }

    // Add Skill Row (reduce size for skill and proficiency fields)
    addSkillRow(existingData = '', index = 0) {
        const proficiencyLevels = ['Beginner', 'Intermediate', 'Expert'];
        const proficiencyOptions = proficiencyLevels.map(level => 
            `<option value="${level}" ${existingData.proficiency === level ? 'selected' : ''}>${level}</option>`
        ).join('');
    
        const row = `
            <div class="row skill-row custom-input" data-index="${index}">
                <div class="col-md-6 mb-3">
                    <input type="text" class="form-control" name="skill" value="${existingData.skill || ''}" placeholder="Skill">
                </div>
                <div class="col-md-4 mb-3">
                    <select class="form-select" name="proficiency">
                        ${proficiencyOptions}
                    </select>
                </div>
                <div class="col-md-2 mb-3">
                    <button type="button" class="btn btn-danger" onclick="deleteSectionRow(this, 'skills')">Delete</button>
                </div>
            </div>`;
        document.getElementById('skillsList').insertAdjacentHTML('beforeend', row);
    }

    addProjectRow(existingData = {}, index = 0) {
        const row = `
            <div class="row project-row custom-input" data-index="${index}">
                <div class="col-md-4 mb-3">
                    <input type="text" class="form-control" name="project_name" value="${existingData.project_name || ''}" placeholder="Project Name" id="projectName${index}">
                </div>
                <div class="col-md-4 mb-3">
                    <div class="d-flex">
                        <span class="ms-2 align-self-center">Start Date &nbsp;</span>
                        <input type="month" class="form-control" name="start_date" value="${existingData.start_date || ''}" id="projectStartDate${index}">
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="d-flex">
                        <span class="ms-2 align-self-center">End Date &nbsp; </span>
                        <input type="month" class="form-control" name="end_date" value="${existingData.end_date || ''}" id="projectEndDate${index}">
                    </div>
                </div>
                <div class="col-md-10 mb-3">
                    <textarea class="form-control textarea-input" name="project_description" rows="3" placeholder="Project Description">${existingData.project_description || ''}</textarea>
                </div>
                <div class="col-md-2 mb-3">
                    <button type="button" class="btn btn-danger" onclick="deleteSectionRow(this, 'projects')">
                        <i class="bi bi-trash"> Delete</i>
                    </button>
                </div>
            </div>`;
        document.getElementById('projectsList').insertAdjacentHTML('beforeend', row);
    }

    
    addHobbyRow(existingData = {}, index = 0) {
        const row = `
            <div class="row hobby-row custom-input" data-index="${index}">
                <div class="col-md-8 mb-3">
                    <input type="text" class="form-control" name="hobby" value="${existingData.hobby || ''}" placeholder="Hobby">
                </div>
                <div class="col-md-4 mb-3">
                    <button type="button" class="btn btn-danger" onclick="deleteSectionRow(this, 'hobbies')">Delete</button>
                </div>
            </div>`;
        document.getElementById('hobbiesList').insertAdjacentHTML('beforeend', row);
    }

    // Save Profile (including new fields)
    saveProfile(resumeId) {
        const sectionData = {
            full_name: document.getElementById('fullName').value,
            gender: document.getElementById('gender').value,
            mobile: document.getElementById('mobile').value,
            email: document.getElementById('email').value,
            resume_pic: document.getElementById('resumePic').src,
            website: document.getElementById('website').value,
            github: document.getElementById('github').value,
            linkedin: document.getElementById('linkedin').value,
            about: document.getElementById('about').value,
        };

        this.saveSection(resumeId, 'profile', sectionData);
    }

       
    saveResumeTemplate(resumeId) {
        const sectionData = {
            theme_name: document.getElementById('themeName').value,
            theme_color: document.getElementById('themeColor').value,
        };
        this.saveSection(resumeId, 'resume_template', sectionData);
    }


    getSectionData(section) {
        let data = [];
        let rows;
    
        if (section === 'experience') {
            rows = document.querySelectorAll('.experience-row');
        } else if (section === 'education') {
            rows = document.querySelectorAll('.education-row');
        }else if (section === 'projects') {
            rows = document.querySelectorAll('.project-row');
        } else if (section === 'skills') {
            rows = document.querySelectorAll('.skill-row');
        } else if (section === 'hobbies') {
            rows = document.querySelectorAll('.hobby-row');
        }
    
        rows.forEach(row => {
            const rowData = {};
            row.querySelectorAll('input').forEach(input => {
                rowData[input.name] = input.value;
            });
            data.push(rowData);
        });
    
        return data;
    }

    // Save Experience Section
    saveExperience(resumeId) {
        const sectionData = this.getSectionData('experience');
        this.saveSection(resumeId, 'experience', sectionData);
    }

    // Save Experience Section
    saveProjects(resumeId) {
        const sectionData = this.getSectionData('projects');
        this.saveSection(resumeId, 'projects', sectionData);
    }

    // Save Education Section
    saveEducation(resumeId) {
        const sectionData = this.getSectionData('education');
        this.saveSection(resumeId, 'education', sectionData);
    }

    // Save Skills Section
    saveSkills(resumeId) {
        const sectionData = this.getSectionData('skills');
        this.saveSection(resumeId, 'skills', sectionData);
    }

    // Save Hobbies Section
    saveHobbies(resumeId) {
        const sectionData = this.getSectionData('hobbies');
        this.saveSection(resumeId, 'hobbies', sectionData);
    }

    downloadResume(resumeId) {
        const resumeContent = document.getElementById('resumeContent');
    
        // Check if there is content to download
        if (!resumeContent || !resumeContent.innerHTML.trim()) {
            alert("Please preview your resume before downloading.");
            return;
        }
    
        // Create an options object for html2pdf
        const options = {
            filename: `resume_${resumeName}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
    
        // Convert the resume content to a PDF and download
        html2pdf()
            .from(resumeContent)  // Use the content inside the 'resumeContent' div
            .set(options)  // Set the options (filename, format, etc.)
            .save();  // Trigger the download
    }
    

    // Private method to get authentication headers
    _getAuthHeaders() {
        const token = localStorage.getItem('token');
        return { Authorization: `Bearer ${token}` };
    }
}

function extractResumeIdFromURL() {
    const pathSegments = window.location.pathname.split('/');
    const resumeId = pathSegments[pathSegments.length - 1];
    return resumeId;
}

// Event listener for the buttons (ensure these are outside the class)
document.addEventListener('DOMContentLoaded', () => {
    const controller = new ResumeDetailController();
    const resumeId = extractResumeIdFromURL(); // Helper function to extract ID
    controller.prefillResumeData(resumeId);

    // Save buttons
    document.getElementById('saveProfileBtn').addEventListener('click', () => controller.saveProfile(resumeId));
    document.getElementById('saveExperienceBtn').addEventListener('click', () => controller.saveExperience(resumeId));
    document.getElementById('saveEducationBtn').addEventListener('click', () => controller.saveEducation(resumeId));
    document.getElementById('saveProjectsBtn').addEventListener('click', () => controller.saveProjects(resumeId));
    document.getElementById('saveSkillsBtn').addEventListener('click', () => controller.saveSkills(resumeId));
    document.getElementById('saveHobbiesBtn').addEventListener('click', () => controller.saveHobbies(resumeId));
    document.getElementById('saveResumeTemplateBtn').addEventListener('click', () => controller.saveResumeTemplate(resumeId));

    // Add buttons
    document.getElementById('addExperienceBtn').addEventListener('click', () => controller.addExperienceRow());
    document.getElementById('addEducationBtn').addEventListener('click', () => controller.addEducationRow());
    document.getElementById('addProjectBtn').addEventListener('click', () => controller.addProjectRow());
    document.getElementById('addSkillBtn').addEventListener('click', () => controller.addSkillRow());
    document.getElementById('addHobbyBtn').addEventListener('click', () => controller.addHobbyRow());

    document.getElementById('downloadResumeBtn').addEventListener('click', () => {
        event.preventDefault(); 
        const resumeId = extractResumeIdFromURL(); // Helper function to extract ID
        controller.downloadResume(resumeId); // Pass resumeId to the downloadResume method
    });
});

function goToNextTab(tabId) {
    var myTab = new bootstrap.Tab(document.getElementById(tabId + '-tab'));
    myTab.show();
}

function goToPreviousTab(tabId) {
    var myTab = new bootstrap.Tab(document.getElementById(tabId + '-tab'));
    myTab.show();
}


function extractResumeIdFromURL() {
    const path = window.location.pathname;
    const resumeId = path.split('/').pop();  // Extract the last part of the URL as resume_id
    return resumeId;
}

function updateResumeTeplate(theme_name) {
    const resumeContent = document.getElementById('resumeContent');
    const resumeId = extractResumeIdFromURL();
    const token = localStorage.getItem('token'); 

    if (!token) return;

    const url = `/api/resume/template/${resumeId}/${theme_name}`;
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.text())
        .then(data => {
            resumeContent.innerHTML = data;
        })
        .catch(error => console.error('Error:', error));
}

// Function to update the theme color
function updateThemeColor(color) {
    const preview = document.getElementById('resumePreview');
    const resumeContent = document.getElementById('resumeContent');
    const resumeHeader = preview.querySelector('h3');

    if (preview) preview.style.color = color;
    if (resumeContent) resumeContent.style.color = color;
    if (resumeHeader) resumeHeader.style.color = color;
}

// Function to initialize event listeners
function initializeTemplateTab() {
    const themeColorSelect = document.getElementById('themeColor');
    const templateNameSelect = document.getElementById('themeName');
    const resumeContent = document.getElementById('resumeContent');

    if (!themeColorSelect || !templateNameSelect || !resumeContent) return;

    // Attach event listeners
    themeColorSelect.addEventListener('change', () => updateThemeColor(themeColorSelect.value));
    templateNameSelect.addEventListener('change', () => updateResumeTeplate(templateNameSelect.value));

    // Trigger initial updates
    updateThemeColor(themeColorSelect.value);
    updateResumeTeplate(templateNameSelect.value);
}

// DOMContentLoaded listener for tab initialization
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('a[data-bs-toggle="tab"][id="template-tab"]').addEventListener('shown.bs.tab', initializeTemplateTab);
    const controller = new ResumeDetailController();
    window.deleteSectionRow = controller.deleteSectionRow.bind(controller);
});

import { RestAPIUtil } from '../common/restAPIUtil.js';
import { downloadPdf, extractIdFromURL } from '../common/util.js';

class ResumeDetailController {
    constructor() {
        this.resumeId = extractIdFromURL();
        this.prefillResumeData(this.resumeId);

        document.getElementById('saveProfileBtn').addEventListener('click', () => this.saveProfile(this.resumeId));
        document.getElementById('saveExperienceBtn').addEventListener('click', () => this.saveExperience(this.resumeId));
        document.getElementById('saveEducationBtn').addEventListener('click', () => this.saveEducation(this.resumeId));
        document.getElementById('saveProjectsBtn').addEventListener('click', () => this.saveProjects(this.resumeId));
        document.getElementById('saveSkillsBtn').addEventListener('click', () => this.saveSkills(this.resumeId));
        document.getElementById('saveHobbiesBtn').addEventListener('click', () => this.saveHobbies(this.resumeId));
        document.getElementById('saveResumeTemplateBtn').addEventListener('click', () => this.saveResumeTemplate(this.resumeId));

        document.getElementById('addExperienceBtn').addEventListener('click', () => this.addExperienceRow());
        document.getElementById('addEducationBtn').addEventListener('click', () => this.addEducationRow());
        document.getElementById('addProjectBtn').addEventListener('click', () => this.addProjectRow());
        document.getElementById('addSkillBtn').addEventListener('click', () => this.addSkillRow());
        document.getElementById('addHobbyBtn').addEventListener('click', () => this.addHobbyRow());

        document.querySelector('a[data-bs-toggle="tab"][id="template-tab"]').addEventListener('shown.bs.tab', () => this.initializeResumeTemplateTab());
        window.deleteSectionRow = this.deleteSectionRow.bind(this);
    }

    initializeResumeTemplateTab() {
        const themeColorSelect = document.getElementById('themeColor');
        const templateNameSelect = document.getElementById('themeName');    
        themeColorSelect.addEventListener('change', () => this.previewThemeColor(themeColorSelect.value));
        templateNameSelect.addEventListener('change', () => this.previewResumeTemplate(templateNameSelect.value));
    

        if (!templateNameSelect.value) {
            templateNameSelect.value = '1';
        }
        this.previewThemeColor(themeColorSelect.value);
        this.previewResumeTemplate(templateNameSelect.value);
    }
    

    async previewResumeTemplate(theme_name) {
        const resumeContent = document.getElementById('resumeContent');
        try {
            const data = await RestAPIUtil.get(`resume/template/${this.resumeId}/${theme_name}`);
            resumeContent.innerHTML = data.resume;
        } catch (error) {
            alert('Error Previewing resume template: ' + error.message);
        }
    }

    previewThemeColor(color) {
        const preview = document.getElementById('resumePreview');
        const resumeContent = document.getElementById('resumeContent');
        const resumeHeader = preview.querySelector('h3');

        if (preview) preview.style.color = color;
        if (resumeContent) resumeContent.style.color = color;
        if (resumeHeader) resumeHeader.style.color = color;
    }

    async saveSection(resumeId, section, data) {
        try {
            const result = await RestAPIUtil.put(`resume/${resumeId}/section/${section}`, data);
            alert(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!`);
        } catch (error) {
            alert('Error saving section: ' + error.message);
        }
    }

    async prefillResumeData(resumeId) {
        try {
            const resume = await RestAPIUtil.get(`resume/${resumeId}`);

            if (resume.profile) {
                document.getElementById('fullName').value = resume.profile.full_name || '';
                document.getElementById('gender').value = resume.profile.gender || '';
                document.getElementById('mobile').value = resume.profile.mobile || '';
                document.getElementById('email').value = resume.profile.email || '';
                document.getElementById('resumePic').src = resume.profile.resume_pic || '';
                document.getElementById('website').value = resume.profile.website || '';
                document.getElementById('github').value = resume.profile.github || '';
                document.getElementById('linkedin').value = resume.profile.linkedin || '';
            }

            if (resume.experience) {
                resume.experience.forEach((exp, index) => this.addExperienceRow(exp, index));
            }

            if (resume.education) {
                resume.education.forEach((edu, index) => this.addEducationRow(edu, index));
            }

            if (resume.projects) {
                resume.projects.forEach((proj, index) => this.addProjectRow(proj, index));
            }

            if (resume.skills) {
                resume.skills.forEach((skill, index) => this.addSkillRow(skill, index));
            }

            if (resume.hobbies) {
                resume.hobbies.forEach((hobby, index) => this.addHobbyRow(hobby, index));
            }

            if (resume.resume_template) {
                document.getElementById('themeName').value = resume.resume_template.theme_name || '';
                document.getElementById('themeColor').value = resume.resume_template.theme_color || '';
            }
        } catch (error) {
            console.error('Error fetching resume data', error);
        }
    }

    addExperienceRow(existingData = {}, index = 0) {
        const row = `
            <div class="row experience-row custom-input" data-index="${index}">
                <div class="col-md-3 mb-3">
                    <input type="text" class="form-control" name="job_title" value="${existingData.job_title || ''}" placeholder="Job Title">
                </div>
                <div class="col-md-3 mb-3">
                    <input type="text" class="form-control" name="company_name" value="${existingData.company_name || ''}" placeholder="Company Name">
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
                        <i class="bi bi-trash"></i>
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

    saveExperience(resumeId) {
        const sectionData = this.getSectionData('experience');
        this.saveSection(resumeId, 'experience', sectionData);
    }

    saveProjects(resumeId) {
        const sectionData = this.getSectionData('projects');
        this.saveSection(resumeId, 'projects', sectionData);
    }

    saveEducation(resumeId) {
        const sectionData = this.getSectionData('education');
        this.saveSection(resumeId, 'education', sectionData);
    }

    saveSkills(resumeId) {
        const sectionData = this.getSectionData('skills');
        this.saveSection(resumeId, 'skills', sectionData);
    }

    saveHobbies(resumeId) {
        const sectionData = this.getSectionData('hobbies');
        this.saveSection(resumeId, 'hobbies', sectionData);
    }

    deleteSectionRow(button) {
        const row = button.closest('.custom-input');
        if (row) row.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ResumeDetailController();
});
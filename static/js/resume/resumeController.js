import { RestAPIUtil } from '../common/restAPIUtil.js';

class ResumeController {
    constructor() {
        this.createResumeBtn = document.getElementById('createResumeBtn');
        if (this.createResumeBtn) {
            this.createResumeBtn.addEventListener('click', this.createResumeHandler.bind(this));
            this.loadResumes();
        }
    }

    async loadResumes() {
        const grid = document.getElementById('resumesGrid');
        grid.innerHTML = '';

        try {
            const resumes = await RestAPIUtil.get('resume');
            resumes.forEach((resume) => {
                const card = document.createElement('div');
                card.className = 'col-md-3 mb-3';
                card.innerHTML = `
                  <div class="card" style="background-color: #dae3f1; color: black; border: none;">
                        <div class="card-body">
                            <h5 class="card-title">${resume.name}</h5>
                            <p class="card-text">Created: ${new Date(resume.created_at).toLocaleDateString()}</p>
                            <div class="d-flex justify-content-end gap-2">
                                <button class="btn btn-sm btn-primary edit-btn"><i class="fas fa-edit"></i> Edit</button>
                                <button class="btn btn-sm btn-success view-btn"><i class="fas fa-eye"></i> View</button>
                                <button class="btn btn-sm btn-danger delete-btn"><i class="fas fa-trash"></i> Delete</button>
                            </div>
                        </div>
                    </div>
                `;

                const editBtn = card.querySelector('.edit-btn');
                const viewBtn = card.querySelector('.view-btn');
                const deleteBtn = card.querySelector('.delete-btn');

                editBtn.addEventListener('click', () => this.editResume(resume.id));
                viewBtn.addEventListener('click', () => this.viewResume(resume.id));
                deleteBtn.addEventListener('click', () => this.deleteResume(resume.id));

                grid.appendChild(card);
            });
        } catch (error) {
            grid.innerHTML = '<p class="text-muted">No resumes found. Create your first resume above!</p>';  
        }
    }

    async createResumeHandler() {
        const resumeName = document.getElementById('newResumeName').value.trim();
        if (!resumeName) {
            alert('Please enter a resume name.');
            return;
        }

        try {
            const newResume = await RestAPIUtil.post('resume', { name: resumeName });
            this.loadResumes();
            document.getElementById('newResumeName').value = '';
        } catch (error) {
            console.error('Error creating resume:', error);
            alert('Failed to create resume. Please try again.');
        }
    }

    async deleteResume(id) {
        if (!confirm('Are you sure you want to delete this resume?')) return;

        try {
            await RestAPIUtil.delete(`resume/${id}`);
            this.loadResumes();
        } catch (error) {
            console.error('Error deleting resume:', error);
            alert('Failed to delete resume. Please try again.');
        }
    }

    viewResume(id) {
        window.location.href = `/resume/preview/${id}`;
    }

    editResume(id) {
        window.location.href = `/resume/${id}`;
    }
}

document.addEventListener('DOMContentLoaded', () => new ResumeController());
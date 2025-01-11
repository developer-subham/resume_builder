class ResumeDetailController{
    constructor(){

    }
    deleteSectionRow(button) {
        const row = button.closest('.custom-input');
        if(row){
            row.remove();
        }
    }

    async saveSection  (resumeId, section, data) {
        try{
            const response = await fetch(`/api/reusme/${resumeId}/section/${section}`,{
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaderes(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            
            if (response.ok) {
                alert(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!`);
            }
            else{
                alert(result.error || 'Error saving seciton');
            }
        }
        catch (error) {
            alert('Error: ' + error.message);
        }
    }

    // Pre-fill data intp the form
    async prefillResumeData(resumeId) {
        try {
            const response = await fetch(`/api/resume/${resumeId}`,{
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
                document.getElementById('linkedin').value = resume.profile.linkedin || ''; // New LinkedIn link
            }
        }
        catch(error) {
            
        }
    }
}
class ResumePreviewController {
    downloadResume(resumeId) {
        const resumeContent = document.getElementById('resumeContent');
    
        // Check if there is content to download
        if (!resumeContent || !resumeContent.innerHTML.trim()) {
            alert("Please preview your resume before downloading.");
            return;
        }
    
        // Create an options object for html2pdf
        const options = {
            margin: 10,
            filename: `resume_${resumeId}.pdf`,
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
    

}

function extractResumeIdFromURL() {
    const path = window.location.pathname;
    const resumeId = path.split('/').pop();
    return resumeId;
}

function updateResumePreview() {
    const resumeContent = document.getElementById('resumeContent');
    const resumeId = extractResumeIdFromURL();
    const token = localStorage.getItem('token'); 

    if (!token) return;

    const url = `/api/resume/preview/${resumeId}`;
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


document.addEventListener('DOMContentLoaded', function () {
   updateResumePreview()
});

document.getElementById('downloadResumeBtn').addEventListener('click', () => {
    event.preventDefault(); 
    const resumeId = extractResumeIdFromURL(); 
    const controller = new ResumePreviewController();
    controller.downloadResume(resumeId); 
});

export function extractIdFromURL() {
    const path = window.location.pathname;
    return path.split('/').pop();
}

export function downloadPdf(name, content ) {
    if (!content || !content.innerHTML.trim()) {
        alert("No content");
        return;
    }

    const options = {
        margin: 10,
        filename: `${name}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
        .from(content)
        .set(options)
        .save();
}
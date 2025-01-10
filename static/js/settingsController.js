function closeSideNav() {
    document.querySelector('.side-navbar').style.display = 'none';
}

function showGeneral() {
    document.getElementById('general-settings').style.display = 'block';
    document.getElementById('data-control-settings').style.display = 'none';
    document.getElementById('help-center-settings').style.display = 'none';
}

function showDataControl() {
    document.getElementById('general-settings').style.display = 'none';
    document.getElementById('data-control-settings').style.display = 'block';
    document.getElementById('help-center-settings').style.display = 'none';
}

function showHelpCenter() {
    document.getElementById('general-settings').style.display = 'none';
    document.getElementById('data-control-settings').style.display = 'none';
    document.getElementById('help-center-settings').style.display = 'block';
}

function changeTheme(theme) {
    if (theme === 'light') {
        document.body.classList.remove('bg-dark');
        document.body.classList.add('bg-light');
    } else if (theme === 'dark') {
        document.body.classList.remove('bg-light');
        document.body.classList.add('bg-dark');
    } else if (theme === 'system') {
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.body.classList.toggle('bg-dark', prefersDarkScheme);
        document.body.classList.toggle('bg-light', !prefersDarkScheme);
    }
}

function editProfile() {
    document.getElementById('editProfile').style.display = 'block';
}

function sendMessage() {
    const message = document.getElementById('chatMessage').value;
    alert(`Message sent: ${message}`);
}

function saveSettings() {
    alert("Settings saved successfully!");
}
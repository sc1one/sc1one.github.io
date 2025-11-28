// Theme Toggle Functionality
(function() {
    const themeToggle = document.getElementById('themeToggle');

    function getTheme() {
        return localStorage.getItem('theme') || 'dark';
    }

    function setTheme(theme) {
        document.documentElement.className = 'theme-' + theme;
        localStorage.setItem('theme', theme);

        // Update aria-label for accessibility
        const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        themeToggle.setAttribute('aria-label', label);
    }

    function toggleTheme() {
        const currentTheme = getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }

    // Initialize
    setTheme(getTheme());

    // Event listeners
    themeToggle.addEventListener('click', toggleTheme);

    // Keyboard accessibility
    themeToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });
})();

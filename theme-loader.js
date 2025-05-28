// theme-loader.js
(function() {
    const savedTheme = localStorage.getItem('selectedTheme') || 'theme-starfield'; // Default to Starfield
    document.body.className = savedTheme;

    // Listen for theme changes from the themes page to update instantly
    window.addEventListener('themechanged', (event) => {
        if (event.detail && event.detail.themeName) {
            document.body.className = event.detail.themeName;
        }
    });
})();

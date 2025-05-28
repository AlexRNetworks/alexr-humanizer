// script.js for index.html (Humanizer and Tab Cloaking)
document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const humanizeButton = document.getElementById('humanizeButton');
    const outputText = document.getElementById('outputText');

    humanizeButton.addEventListener('click', async () => {
        const text = inputText.value;
        if (!text) {
            alert('Please enter some text.');
            return;
        }
        outputText.textContent = 'Quantum Humanizing...'; // Or use value for textarea
        try {
            const response = await fetch('/.netlify/functions/gemini_v2', { // Ensure this endpoint is correct
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: text }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
            }
            const data = await response.json();
            const humanizedText = data.generatedText;
            
            // Clear previous output and type out new text
            outputText.value = ''; // Assuming outputText is a textarea
            let charIndex = 0;
            const interval = setInterval(() => {
                if (charIndex < humanizedText.length) {
                    outputText.value += humanizedText.charAt(charIndex);
                    charIndex++;
                } else {
                    clearInterval(interval);
                }
            }, 20);

        } catch (error) {
            console.error('Error:', error);
            outputText.value = `Error: ${error.message || 'An error occurred.'}`; // Display error in textarea
        }
    });

    // Animated Starfield (This function might be redundant if stars are only styled via CSS vars)
    // However, if themes might introduce different types of particles, it could be adapted.
    // For now, it just creates the star divs, CSS handles appearance.
    function createStars(numStars) {
        const starsContainer = document.querySelector('#page-background .stars');
        if (starsContainer) { // Only create if the container exists
            starsContainer.innerHTML = ''; // Clear existing stars if any
            for (let i = 0; i < numStars; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                const size = Math.random() * 3 + 1;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                star.style.left = `${x}%`;
                star.style.top = `${y}%`;
                star.style.animationDelay = `${Math.random() * 2}s`;
                starsContainer.appendChild(star);
            }
        }
    }
    // Call createStars if the current theme is supposed to have stars.
    // This requires knowing the current theme.
    // Alternatively, only call it for theme-starfield, or let CSS fully handle star presence.
    // For simplicity, let's assume the star divs are always in HTML and CSS toggles display.
    // The initial call is fine for Starfield if it's the default.
    if (document.documentElement.classList.contains('theme-starfield')) {
         createStars(200); // Only create stars if starfield theme is active.
    }
    // Or, always create them and let CSS hide them via `var(--stars-display)`:
    // createStars(200);


    // --- Tab Cloaking Script (reads from localStorage) ---
    const favicon = document.getElementById('favicon');
    const originalTitle = "Alexr - Star Edition"; // Hardcode original title
    const originalFaviconPath = 'alexr-favicon.png'; // Hardcode original favicon path

    // Ensure favicon element exists and has an initial href
    if (favicon && !favicon.href) {
        favicon.href = originalFaviconPath;
    }
    const currentOriginalFavicon = favicon ? favicon.href : originalFaviconPath;


    const cloakData = {
        "none": { title: originalTitle, favicon: currentOriginalFavicon },
        "delta-math": { title: "DeltaMath", favicon: "DeltaMath.png" },
        "google": { title: "Google", favicon: "Google.png" },
        "gmail": { title: "Gmail", favicon: "gmail.png" },
        "calculator": { title: "Calculator", favicon: "Google.png" }
    };

    function applyCloak() {
        const selectedCloakKey = localStorage.getItem('selectedCloak');
        if (selectedCloakKey && selectedCloakKey !== "none") {
            const cloak = cloakData[selectedCloakKey];
            if (cloak) {
                document.title = cloak.title;
                if (favicon) favicon.href = cloak.favicon;
            }
        } else {
            document.title = originalTitle;
            if (favicon) favicon.href = currentOriginalFavicon;
        }
    }

    function restoreOriginal() {
        document.title = originalTitle;
        if (favicon) favicon.href = currentOriginalFavicon;
    }

    if (document.hidden) {
        applyCloak();
    }
    
    window.addEventListener('blur', applyCloak);
    window.addEventListener('focus', restoreOriginal);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            applyCloak();
        } else {
            restoreOriginal();
        }
    });
    // --- End of Tab Cloaking Script ---
});

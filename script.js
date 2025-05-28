// script.js for index.html
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
        outputText.textContent = 'Quantum Humanizing...';
        try {
            const response = await fetch('/.netlify/functions/gemini_v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: text }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
            }
            const data = await response.json();
            const humanizedText = data.generatedText;
            outputText.textContent = '';
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
            outputText.textContent = `Error: ${error.message || 'An error occurred.'}`;
        }
    });

    // Animated Starfield
    function createStars(numStars) {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars';
        const quantumBackground = document.querySelector('.quantum-background');
        if (quantumBackground) {
            quantumBackground.appendChild(starsContainer);
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
    createStars(200);

    // --- Tab Cloaking Script (reads from localStorage) ---
    const favicon = document.getElementById('favicon');
    const originalTitle = document.title;
    const originalFavicon = favicon ? favicon.href : 'alexr-favicon.png'; // Ensure 'alexr-favicon.png' is correct

    const cloakData = {
        "none": { title: originalTitle, favicon: originalFavicon },
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
            // If "none" or no setting, ensure original is displayed (especially if focus is lost before any interaction)
            document.title = originalTitle;
            if (favicon) favicon.href = originalFavicon;
        }
    }

    function restoreOriginal() {
        document.title = originalTitle;
        if (favicon) favicon.href = originalFavicon;
    }

    // Apply cloak if tab is already blurred when page loads (e.g. opened in background)
    if (document.hidden) {
        applyCloak();
    }
    
    window.addEventListener('blur', applyCloak);
    window.addEventListener('focus', restoreOriginal);
    // Listen for visibility change as well, more robust for modern browsers
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            applyCloak();
        } else {
            restoreOriginal();
        }
    });
    // --- End of Tab Cloaking Script ---
});

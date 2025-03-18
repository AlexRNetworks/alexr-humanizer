// script.js
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
                headers: {
                    'Content-Type': 'application/json',
                },
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

    // Animated Starfield (moved here)
    function createStars(numStars) {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars';
        document.querySelector('.quantum-background').appendChild(starsContainer);

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

    createStars(200);

});

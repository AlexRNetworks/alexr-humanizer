// script.js
document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const humanizeButton = document.getElementById('humanizeButton');
    const outputText = document.getElementById('outputText');
    // NO toneSelector needed anymore

    humanizeButton.addEventListener('click', async () => {
        const text = inputText.value;
        // NO tone variable needed

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
                // Send ONLY the prompt.  No 'tone' property.
                body: JSON.stringify({ prompt: text }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
            }

            const data = await response.json();
            const humanizedText = data.generatedText;

            outputText.textContent = ''; // Clear the "Processing..." message
            let charIndex = 0;
            const interval = setInterval(() => {
                if (charIndex < humanizedText.length) {
                    outputText.value += humanizedText.charAt(charIndex); // Use .value for textarea
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

    // Particle effect (Keep this as is - it's separate from the API call)
    const particles = document.querySelector('.quantum-particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.background = 'rgba(0, 176, 155, 0.3)';
        particle.style.borderRadius = '50%';
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        particle.style.animation = `particleFade ${Math.random() * 5 + 3}s linear infinite`;
        particles.appendChild(particle);
    }

    // Particle fade animation (Keep this as is)
    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes particleFade {
        0% { opacity: 0; transform: translateY(-20px); }
        50% { opacity: 1; }
        100% { opacity: 0; transform: translateY(20px); }
    }`;
    document.head.appendChild(style);
});

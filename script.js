document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const humanizeButton = document.getElementById('humanizeButton');
    const outputText = document.getElementById('outputText');
    const toneSelector = document.getElementById('toneSelector'); // Keep the tone selector

    humanizeButton.addEventListener('click', async () => {
        const text = inputText.value;
        const tone = toneSelector.value; // Get the selected tone

        if (!text) {
            alert('Please enter some text.');
            return;
        }

        // Use a text/placeholder instead of innerHTML for initial message
        outputText.textContent = 'Quantum Humanizing...';

        try {
            const response = await fetch('/.netlify/functions/gemini_v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Include the 'tone' in the request body, along with 'prompt'
                body: JSON.stringify({ prompt: text, tone: tone }),
            });

            if (!response.ok) {
                // Get more detailed error from the response body
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
            }

            const data = await response.json();
            const humanizedText = data.generatedText; // Access the 'generatedText' property

            // Use textContent for initial setting, then build up with innerHTML for animation
            outputText.textContent = ''; // Clear the "Processing..." message
            let charIndex = 0;
            const interval = setInterval(() => {
                if (charIndex < humanizedText.length) {
                    outputText.innerHTML += humanizedText.charAt(charIndex);
                    charIndex++;
                } else {
                    clearInterval(interval);
                }
            }, 20);

        } catch (error) {
            console.error('Error:', error);
            // Use textContent for error message
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

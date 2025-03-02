document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const humanizeButton = document.getElementById('humanizeButton');
    const outputText = document.getElementById('outputText');
    const toneSelector = document.getElementById('toneSelector');

    humanizeButton.addEventListener('click', async () => {
        const text = inputText.value;
        const tone = toneSelector.value;

        if (!text) {
            alert('Please enter some text.');
            return;
        }

        outputText.innerHTML = '<p class="quantum-text">Quantum Humanizing...</p>';

        let systemPrompt = '';
        switch (tone) {
            case 'casual':
                systemPrompt = 'Humanize the following text in a casual, conversational tone, as if talking to a friend.';
                break;
            case 'complex':
                systemPrompt = 'Humanize the following text using complex sentence structures, advanced vocabulary, and nuanced rhetorical devices.';
                break;
            case 'teenager':
                systemPrompt = 'Humanize the following text using slang, abbreviations, and the typical speech patterns of a teenager.';
                break;
            case 'college':
                systemPrompt = 'Humanize the following text using a sophisticated, academic tone, suitable for a college student.';
                break;
            default:
                systemPrompt = 'Humanize the following text in a neutral, conversational tone.';
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.API_KEY}`, // Use GitHub secret
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [{
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: `Humanize: ${text}`,
                    }],
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const humanizedText = data.choices[0].message.content;

            outputText.innerHTML = '';
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
            outputText.innerHTML = `<p class="quantum-text">Error: ${error.message || 'An error occurred.'}</p>`;
        }
    });

    // Particle effect
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

    // Particle fade animation (added using dynamic style tag)
    const style = document.createElement('style');
    style.innerHTML = `
@keyframes particleFade {
    0% { opacity: 0; transform: translateY(-20px); }
    50% { opacity: 1; }
    100% { opacity: 0; transform: translateY(20px); }
}`;
    document.head.appendChild(style);
});

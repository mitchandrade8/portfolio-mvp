document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Navigation Active State Logic
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    function removeActiveClasses() {
        navLinks.forEach(link => link.classList.remove('active'));
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (this.getAttribute('href').startsWith('#')) {
                removeActiveClasses();
                this.classList.add('active');
            }
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.nav-links a[href="#${currentId}"]`);

                if (activeLink) {
                    removeActiveClasses();
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // ==========================================
    // 2. AI Chat Widget Logic
    // ==========================================
    const chatToggleBtn = document.getElementById('chat-widget-toggle');
    const chatWindow = document.getElementById('chat-widget-window');
    const chatCloseBtn = document.getElementById('chat-widget-close');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const suggestionsContainer = document.getElementById('chat-suggestions');

    // The Live AWS Lambda Endpoint
    const AGENT_URL = "https://qk2fyfnjaaecnydulxasuo3fdi0rfalk.lambda-url.us-east-1.on.aws/";

    let isSending = false;

    // Open/Close Chat
    chatToggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

    // Handle sending message (supports both typed input and suggestion chips)
    async function sendMessage(overrideText = null) {
        if (isSending) return;

        const text = (overrideText !== null ? overrideText : chatInput.value).trim();
        if (!text) return;

        // Hide starter suggestion chips once conversation starts
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }

        // Add user message to UI
        appendMessage(text, 'user-message');
        if (overrideText === null) {
            chatInput.value = '';
        }

        isSending = true;
        chatSendBtn.disabled = true;

        // Show typing indicator
        const typingIndicator = showTypingIndicator();
        scrollToBottom();

        try {
            // Call the live AWS Lambda backend
            const response = await fetch(AGENT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            typingIndicator.remove();

            if (response.ok && data.response) {
                appendMessage(data.response, 'ai-message');
            } else {
                appendMessage(data.error || "I'm having a little trouble connecting to my servers right now. Please email Mitch directly at hello@mitchellandrade.com!", 'ai-message');
            }
        } catch (error) {
            console.error("Error communicating with AI agent:", error);
            typingIndicator.remove();
            appendMessage("I seem to be offline right now! Please reach out to Mitch at hello@mitchellandrade.com.", 'ai-message');
        } finally {
            isSending = false;
            chatSendBtn.disabled = false;
            chatInput.focus();
            scrollToBottom();
        }
    }

    function appendMessage(text, className) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(typingDiv);
        return typingDiv;
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send on click or Enter key
    chatSendBtn.addEventListener('click', () => sendMessage());
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    // Suggested prompt chip clicks
    document.querySelectorAll('.suggestion-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            const promptText = chip.getAttribute('data-prompt');
            sendMessage(promptText);
        });
    });
});
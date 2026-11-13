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
    // 2. Share Portfolio Button Logic (Hero + Footer)
    // ==========================================
    const shareButtons = document.querySelectorAll('.js-share-portfolio');

    shareButtons.forEach((btn) => {
        btn.addEventListener('click', async () => {
            const label = btn.querySelector('.js-share-label');
            const shareData = {
                title: 'Mitchell Andrade | Software Engineer',
                text: 'Check out Mitchell Andrade’s software engineering portfolio — backend systems, Edge-AI, and fintech.',
                url: 'https://mitchellandrade.com'
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    // User canceled native share sheet
                }
            } else {
                try {
                    await navigator.clipboard.writeText(shareData.url);
                    if (label) {
                        label.textContent = 'Link Copied!';
                        setTimeout(() => {
                            label.textContent = 'Share Portfolio';
                        }, 2200);
                    }
                } catch (err) {
                    window.prompt('Copy portfolio link:', shareData.url);
                }
            }
        });
    });

    // ==========================================
    // 3. AI Chat Widget Logic
    // ==========================================
    const chatToggleBtn = document.getElementById('chat-widget-toggle');
    const chatWindow = document.getElementById('chat-widget-window');
    const chatCloseBtn = document.getElementById('chat-widget-close');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');

    // The Live AWS Lambda Endpoint
    const AGENT_URL = "https://qk2fyfnjaaecnydulxasuo3fdi0rfalk.lambda-url.us-east-1.on.aws/";

    const INITIAL_CHAT_HTML = `
        <div class="message ai-message">
            Hi! I can answer questions about Mitchell’s projects, skills, and availability. Try one of these:
        </div>
        <div id="chat-suggestions" class="chat-suggestions">
            <button type="button" class="suggestion-chip" data-prompt="What has Mitchell built?">What has Mitchell built?</button>
            <button type="button" class="suggestion-chip" data-prompt="Is he available for work?">Is he available for work?</button>
            <button type="button" class="suggestion-chip" data-prompt="How is this chat kept affordable?">How is this chat kept affordable?</button>
        </div>
    `;

    let isSending = false;

    function bindSuggestionChips() {
        document.querySelectorAll('.suggestion-chip').forEach((chip) => {
            chip.addEventListener('click', () => {
                const promptText = chip.getAttribute('data-prompt');
                sendMessage(promptText);
            });
        });
    }

    function resetChat() {
        chatMessages.innerHTML = INITIAL_CHAT_HTML;
        chatInput.value = '';
        isSending = false;
        chatSendBtn.disabled = false;
        bindSuggestionChips();
    }

    // Bind initial starter chips on load
    bindSuggestionChips();

    // Open/Close Chat (clears chat when toggled closed)
    chatToggleBtn.addEventListener('click', () => {
        const isCurrentlyHidden = chatWindow.classList.contains('hidden');
        if (isCurrentlyHidden) {
            chatWindow.classList.remove('hidden');
            chatInput.focus();
        } else {
            chatWindow.classList.add('hidden');
            resetChat();
        }
    });

    // Exit button closes and resets chat
    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        resetChat();
    });

    // Handle sending message (supports both typed input and suggestion chips)
    async function sendMessage(overrideText = null) {
        if (isSending) return;

        const text = (overrideText !== null ? overrideText : chatInput.value).trim();
        if (!text) return;

        // Hide starter suggestion chips once conversation starts
        const suggestionsContainer = document.getElementById('chat-suggestions');
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
});
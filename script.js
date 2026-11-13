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
    // 2. Clean Share Portfolio Logic (No Extra Text Block)
    // ==========================================
    const shareButtons = document.querySelectorAll('.js-share-portfolio');

    shareButtons.forEach((btn) => {
        btn.addEventListener('click', async () => {
            const label = btn.querySelector('.js-share-label');
            const shareData = {
                title: 'Mitchell Andrade | Software Engineer — Backend, AI & FinTech',
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
    // 3. AI Chat Widget Logic (Minimize/Expand + Auto-Clear)
    // ==========================================
    const chatToggleBtn = document.getElementById('chat-widget-toggle');
    const chatWindow = document.getElementById('chat-widget-window');
    const chatExpandBtn = document.getElementById('chat-widget-expand');
    const chatExpandIcon = document.getElementById('chat-expand-icon');
    const chatSheetHandle = document.querySelector('.chat-sheet-handle');
    const chatCloseBtn = document.getElementById('chat-widget-close');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const suggestionsBar = document.getElementById('chat-suggestions');

    // The Live AWS Lambda Endpoint
    const AGENT_URL = "https://qk2fyfnjaaecnydulxasuo3fdi0rfalk.lambda-url.us-east-1.on.aws/";

    const INITIAL_MESSAGE_HTML = `
        <div class="message ai-message">
            Hi! I can answer questions about Mitchell’s projects, skills, and availability.
        </div>
    `;

    const EXPAND_SVG = `
        <polyline points="15 3 21 3 21 9"></polyline>
        <polyline points="9 21 3 21 3 15"></polyline>
        <line x1="21" y1="3" x2="14" y2="10"></line>
        <line x1="3" y1="21" x2="10" y2="14"></line>
    `;

    const MINIMIZE_SVG = `
        <polyline points="4 14 10 14 10 20"></polyline>
        <polyline points="20 10 14 10 14 4"></polyline>
        <line x1="14" y1="10" x2="21" y2="3"></line>
        <line x1="3" y1="21" x2="10" y2="14"></line>
    `;

    let isSending = false;

    function toggleExpandState() {
        const isExpanded = chatWindow.classList.toggle('expanded');
        if (chatExpandIcon) {
            chatExpandIcon.innerHTML = isExpanded ? MINIMIZE_SVG : EXPAND_SVG;
        }
        scrollToBottom();
    }

    if (chatExpandBtn) {
        chatExpandBtn.addEventListener('click', toggleExpandState);
    }

    if (chatSheetHandle) {
        chatSheetHandle.addEventListener('click', toggleExpandState);
    }

    function resetChat() {
        chatMessages.innerHTML = INITIAL_MESSAGE_HTML;
        if (suggestionsBar) {
            suggestionsBar.style.display = 'flex';
        }
        chatWindow.classList.remove('expanded');
        if (chatExpandIcon) {
            chatExpandIcon.innerHTML = EXPAND_SVG;
        }
        chatInput.value = '';
        isSending = false;
        chatSendBtn.disabled = false;
    }

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

    // Handle sending message (supports both typed input and suggestion pills)
    async function sendMessage(overrideText = null) {
        if (isSending) return;

        const text = (overrideText !== null ? overrideText : chatInput.value).trim();
        if (!text) return;

        // Hide bottom suggestion pills once conversation begins
        if (suggestionsBar) {
            suggestionsBar.style.display = 'none';
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

    // Suggested prompt pill clicks
    document.querySelectorAll('.suggestion-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
            const promptText = pill.getAttribute('data-prompt');
            sendMessage(promptText);
        });
    });
});
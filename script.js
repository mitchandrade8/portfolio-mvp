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

    // Handle sending message
    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message to UI
        appendMessage(text, 'user-message');
        chatInput.value = '';

        // Show typing indicator
        const typingIndicator = showTypingIndicator();
        scrollToBottom();

        // Simulate network request (We will swap this with the AWS fetch call later)
        setTimeout(() => {
            typingIndicator.remove();
            appendMessage("I am currently operating in mock-mode while Mitchell finishes deploying my AWS Lambda backend! Soon, I will be able to answer live questions about his technical experience.", 'ai-message');
            scrollToBottom();
        }, 1200);
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
    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
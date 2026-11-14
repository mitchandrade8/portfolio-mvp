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
    // 3. AI Chat Widget Logic (Minimize/Expand + Touch Drag + Auto-Clear)
    // ==========================================
    const chatToggleBtn = document.getElementById('chat-widget-toggle');
    const chatWindow = document.getElementById('chat-widget-window');
    const chatExpandBtn = document.getElementById('chat-widget-expand');
    const chatExpandIcon = document.getElementById('chat-expand-icon');
    const chatSheetHandle = document.querySelector('.chat-sheet-handle');
    const chatHeader = document.querySelector('.chat-header');
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

    function setExpandedState(expanded) {
        chatWindow.style.height = '';
        chatWindow.style.maxHeight = '';
        chatWindow.classList.toggle('expanded', expanded);
        if (chatExpandIcon) {
            chatExpandIcon.innerHTML = expanded ? MINIMIZE_SVG : EXPAND_SVG;
        }
        scrollToBottom();
    }

    function toggleExpandState() {
        setExpandedState(!chatWindow.classList.contains('expanded'));
    }

    if (chatExpandBtn) {
        chatExpandBtn.addEventListener('click', toggleExpandState);
    }

    if (chatSheetHandle) {
        chatSheetHandle.addEventListener('click', () => {
            if (!wasDragged) {
                toggleExpandState();
            }
        });
    }

    function resetChat() {
        chatMessages.innerHTML = INITIAL_MESSAGE_HTML;
        if (suggestionsBar) {
            suggestionsBar.style.display = 'flex';
        }
        chatWindow.classList.remove('expanded', 'dragging');
        chatWindow.style.height = '';
        chatWindow.style.maxHeight = '';
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
            chatWindow.style.height = '';
            chatWindow.style.maxHeight = '';
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

    // ==========================================
    // 4. Mobile Bottom-Sheet Touch Drag & Swipe Gestures
    // ==========================================
    let dragStartY = 0;
    let dragStartHeight = 0;
    let dragDeltaY = 0;
    let isDraggingSheet = false;
    let wasDragged = false;

    function handleSheetTouchStart(e) {
        if (window.innerWidth > 768) return;
        if (e.target.closest('button')) return;

        isDraggingSheet = true;
        wasDragged = false;
        dragStartY = e.touches[0].clientY;
        dragStartHeight = chatWindow.getBoundingClientRect().height;
        dragDeltaY = 0;
        chatWindow.classList.add('dragging');
    }

    function handleSheetTouchMove(e) {
        if (!isDraggingSheet) return;
        e.preventDefault();

        dragDeltaY = e.touches[0].clientY - dragStartY;
        if (Math.abs(dragDeltaY) >= 10) {
            wasDragged = true;
        }

        const minHeight = window.innerHeight * 0.25;
        const maxHeight = window.innerHeight * 0.94;
        const nextHeight = Math.min(maxHeight, Math.max(minHeight, dragStartHeight - dragDeltaY));

        chatWindow.style.height = `${nextHeight}px`;
        chatWindow.style.maxHeight = `${nextHeight}px`;
    }

    function handleSheetTouchEnd() {
        if (!isDraggingSheet) return;
        isDraggingSheet = false;
        chatWindow.classList.remove('dragging');

        // Tap (no drag distance) toggles expand/shrink cleanly
        if (!wasDragged) {
            toggleExpandState();
            return;
        }

        // Swipe up -> expand to 94vh
        if (dragDeltaY < -45) {
            setExpandedState(true);
        } else if (dragDeltaY > 45) {
            // Swipe down -> shrink to 60vh if expanded, or close & reset if already compact
            if (chatWindow.classList.contains('expanded')) {
                setExpandedState(false);
            } else if (dragDeltaY > 110) {
                chatWindow.classList.add('hidden');
                resetChat();
            } else {
                setExpandedState(false);
            }
        } else {
            // Snap back to current state if release threshold wasn't crossed
            setExpandedState(chatWindow.classList.contains('expanded'));
        }
    }

    [chatSheetHandle, chatHeader].forEach((el) => {
        if (!el) return;
        el.addEventListener('touchstart', handleSheetTouchStart, { passive: true });
        el.addEventListener('touchmove', handleSheetTouchMove, { passive: false });
        el.addEventListener('touchend', handleSheetTouchEnd);
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
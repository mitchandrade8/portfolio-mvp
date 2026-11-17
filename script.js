document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Dark / Light Theme Toggle
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const nextTheme = isDark ? 'light' : 'dark';
            if (nextTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            try {
                localStorage.setItem('ma-theme', nextTheme);
            } catch (e) {}
        });
    }

    // ==========================================
    // 2. Navigation Scroll-Spy
    // ==========================================
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    if (sections.length > 0 && navLinks.length > 0) {
        const setActiveNav = (id) => {
            navLinks.forEach((link) => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        };

        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                const targetId = link.getAttribute('href').slice(1);
                setActiveNav(targetId);
            });
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveNav(entry.target.getAttribute('id'));
                    }
                });
            },
            { root: null, rootMargin: '-28% 0px -65% 0px', threshold: 0 }
        );

        sections.forEach((section) => observer.observe(section));
    }

    // ==========================================
    // 3. Share Portfolio Logic
    // ==========================================
    document.querySelectorAll('.js-share-portfolio').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const label = btn.querySelector('.js-share-label');
            const shareData = {
                title: 'Mitchell Andrade | Software Engineer — Backend, AI & FinTech',
                url: 'https://mitchellandrade.com/'
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                    return;
                } catch (err) {}
            }

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
        });
    });

    // ==========================================
    // 4. Collapsible Build Drawers & Project Filters
    // ==========================================
    const setDrawerState = (toggleBtn, open) => {
        if (!toggleBtn) return;
        const drawerId = toggleBtn.getAttribute('aria-controls');
        const drawer = drawerId ? document.getElementById(drawerId) : null;
        if (!drawer) return;

        toggleBtn.setAttribute('aria-expanded', String(open));
        drawer.classList.toggle('open', open);
    };

    const drawerToggles = document.querySelectorAll('.drawer-toggle-btn');
    drawerToggles.forEach((btn) => {
        btn.addEventListener('click', () => {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            setDrawerState(btn, !isExpanded);
        });
    });

    const toggleAllBtn = document.getElementById('toggle-all-phases');
    if (toggleAllBtn && drawerToggles.length > 0) {
        let allExpanded = false;
        toggleAllBtn.addEventListener('click', () => {
            allExpanded = !allExpanded;
            drawerToggles.forEach((btn) => setDrawerState(btn, allExpanded));
            toggleAllBtn.textContent = allExpanded ? 'Compact View (Collapse Logs)' : 'Expand All Build Logs';
        });
    }

    // Auto-expand project drawer when jumped to from "What's running right now"
    document.querySelectorAll('[data-jump-project]').forEach((row) => {
        row.addEventListener('click', () => {
            const projectId = row.getAttribute('data-jump-project');
            const card = document.getElementById(projectId);
            if (!card) return;
            const toggleBtn = card.querySelector('.drawer-toggle-btn');
            setDrawerState(toggleBtn, true);
        });
    });

    // Project Category Filtering
    const filterPills = document.querySelectorAll('.filter-pill');
    const filterableCards = document.querySelectorAll('[data-category]');

    filterPills.forEach((pill) => {
        pill.addEventListener('click', () => {
            const selected = pill.getAttribute('data-filter');
            filterPills.forEach((p) => p.classList.toggle('active', p === pill));

            filterableCards.forEach((card) => {
                const match = selected === 'all' || card.getAttribute('data-category') === selected;
                card.classList.toggle('is-hidden-filter', !match);
            });
        });
    });

    // ==========================================
    // 5. Architecture Unit Economics Simulator
    // ==========================================
    const simTabBtns = document.querySelectorAll('.sim-tab-btn[data-sim-target]');
    const switchSimTab = (targetName) => {
        simTabBtns.forEach((btn) => {
            const active = btn.getAttribute('data-sim-target') === targetName;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', String(active));
        });
        document.querySelectorAll('.sim-panel').forEach((panel) => {
            panel.classList.toggle('active', panel.id === `sim-panel-${targetName}`);
        });
    };

    simTabBtns.forEach((btn) => {
        btn.addEventListener('click', () => switchSimTab(btn.getAttribute('data-sim-target')));
    });

    document.querySelectorAll('.js-open-sim').forEach((link) => {
        link.addEventListener('click', () => {
            const tab = link.getAttribute('data-sim-tab');
            if (tab) switchSimTab(tab);
        });
    });

    // LockedIn Sliders
    const courtsInput = document.getElementById('sim-courts');
    const hoursInput = document.getElementById('sim-hours');
    const updateLockedInSim = () => {
        if (!courtsInput || !hoursInput) return;
        const courts = Number(courtsInput.value);
        const hours = Number(hoursInput.value);

        const gbPerHr = 4.5;
        const costPerGb = 0.095;
        const naiveGb = Math.round(courts * hours * 30 * gbPerHr);
        const edgeGb = Math.round(naiveGb * 0.5);
        const naiveCost = Math.round(naiveGb * costPerGb);
        const edgeCost = Math.round(edgeGb * costPerGb);
        const monthlySave = naiveCost - edgeCost;
        const annualSave = monthlySave * 12;

        document.getElementById('sim-courts-val').textContent = `${courts} ${courts === 1 ? 'court' : 'courts'}`;
        document.getElementById('sim-hours-val').textContent = `${hours} ${hours === 1 ? 'hr/day' : 'hrs/day'}`;
        document.getElementById('out-naive-gb').textContent = `${naiveGb.toLocaleString()} GB`;
        document.getElementById('out-edge-gb').textContent = `${edgeGb.toLocaleString()} GB`;
        document.getElementById('out-monthly-save').textContent = `$${monthlySave.toLocaleString()} / mo`;
        document.getElementById('out-annual-save').textContent = `$${annualSave.toLocaleString()} / yr`;
        document.getElementById('out-naive-cost').textContent = `$${naiveCost.toLocaleString()} / mo`;
        document.getElementById('out-edge-cost').textContent = `$${edgeCost.toLocaleString()} / mo`;
    };

    if (courtsInput && hoursInput) {
        courtsInput.addEventListener('input', updateLockedInSim);
        hoursInput.addEventListener('input', updateLockedInSim);
        updateLockedInSim();
    }

    // AI Agent Cost Guardrail Sliders
    const visitorsInput = document.getElementById('sim-visitors');
    const reqsInput = document.getElementById('sim-reqs');
    const updateAgentSim = () => {
        if (!visitorsInput || !reqsInput) return;
        const visitors = Number(visitorsInput.value);
        const reqs = Number(reqsInput.value);

        const monthlyReqs = visitors * reqs * 30;
        const costPerReq = 0.0022;
        const safeCost = monthlyReqs * costPerReq;
        // Unguarded endpoint assumes larger uncapped completions + 200 req/IP scraping bursts
        const riskCost = Math.max(safeCost * 4, visitors * 30 * 200 * 0.0011);
        const safePct = Math.min(100, Math.max(4, Math.round((safeCost / riskCost) * 100)));

        document.getElementById('sim-visitors-val').textContent = `${visitors.toLocaleString()} / day`;
        document.getElementById('sim-reqs-val').textContent = `${reqs} ${reqs === 1 ? 'req' : 'reqs'}`;
        document.getElementById('out-agent-reqs').textContent = monthlyReqs.toLocaleString();
        document.getElementById('out-agent-safe').textContent = `$${safeCost.toFixed(2)} / mo`;
        document.getElementById('out-agent-risk').textContent = `$${Math.round(riskCost).toLocaleString()}+ / mo`;
        document.getElementById('out-agent-risk-bar').textContent = `$${Math.round(riskCost).toLocaleString()} / mo`;
        document.getElementById('out-agent-safe-bar').textContent = `$${safeCost.toFixed(2)} / mo`;
        document.getElementById('bar-agent-safe').style.width = `${safePct}%`;
    };

    if (visitorsInput && reqsInput) {
        visitorsInput.addEventListener('input', updateAgentSim);
        reqsInput.addEventListener('input', updateAgentSim);
        updateAgentSim();
    }

    // ==========================================
    // 6. Interactive Technical Expertise Filter
    // ==========================================
    const skillPills = document.querySelectorAll('.skill-pill');
    const skillTargets = document.querySelectorAll('[data-skills]');
    const skillStatusBanner = document.getElementById('skills-filter-status');
    const skillStatusLabel = document.getElementById('skills-filter-label');
    const clearSkillBtn = document.getElementById('clear-skill-filter');
    let activeSkill = null;

    const applySkillHighlight = (skillKey, pillLabel) => {
        activeSkill = skillKey;
        skillPills.forEach((p) => {
            p.classList.toggle('active', skillKey !== null && p.getAttribute('data-skill') === skillKey);
        });

        if (!skillKey) {
            skillTargets.forEach((el) => {
                el.classList.remove('skill-matched', 'skill-dimmed');
            });
            if (skillStatusBanner) skillStatusBanner.classList.remove('visible');
            return;
        }

        let matchCount = 0;
        skillTargets.forEach((el) => {
            const tokens = (el.getAttribute('data-skills') || '').split(/\s+/);
            const matched = tokens.includes(skillKey);
            el.classList.toggle('skill-matched', matched);
            el.classList.toggle('skill-dimmed', !matched);
            if (matched) matchCount += 1;
        });

        if (skillStatusBanner && skillStatusLabel) {
            skillStatusLabel.textContent = `Highlighted ${matchCount} matching ${matchCount === 1 ? 'item' : 'items'} in Experience & Projects for "${pillLabel}"`;
            skillStatusBanner.classList.add('visible');
        }
    };

    skillPills.forEach((pill) => {
        pill.addEventListener('click', () => {
            const key = pill.getAttribute('data-skill');
            if (activeSkill === key) {
                applySkillHighlight(null, '');
            } else {
                applySkillHighlight(key, pill.textContent.trim());
            }
        });
    });

    if (clearSkillBtn) {
        clearSkillBtn.addEventListener('click', () => applySkillHighlight(null, ''));
    }

    // ==========================================
    // 7. Full-Screen Image Lightbox Modal
    // ==========================================
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let currentGroupItems = [];
    let currentIndex = 0;

    const renderLightboxItem = () => {
        const trigger = currentGroupItems[currentIndex];
        if (!trigger || !lightboxImg) return;
        const src = trigger.getAttribute('data-lightbox-src');
        const title = trigger.getAttribute('data-lightbox-title') || 'Artifact Preview';
        const caption = trigger.getAttribute('data-lightbox-caption') || '';

        lightboxImg.src = src;
        lightboxImg.alt = caption;
        lightboxTitle.textContent = title;
        lightboxCaption.textContent = caption;
        lightboxCounter.textContent = `${currentIndex + 1} / ${currentGroupItems.length}`;
    };

    const closeLightbox = () => {
        if (!lightboxModal) return;
        lightboxModal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    if (lightboxModal) {
        const triggers = Array.from(document.querySelectorAll('[data-lightbox-src]'));
        triggers.forEach((btn) => {
            btn.addEventListener('click', () => {
                const group = btn.getAttribute('data-lightbox-group');
                currentGroupItems = group
                    ? triggers.filter((item) => item.getAttribute('data-lightbox-group') === group)
                    : [btn];
                currentIndex = Math.max(0, currentGroupItems.indexOf(btn));
                renderLightboxItem();
                lightboxModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            });
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + currentGroupItems.length) % currentGroupItems.length;
            renderLightboxItem();
        });
        lightboxNext.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % currentGroupItems.length;
            renderLightboxItem();
        });

        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (lightboxModal.classList.contains('hidden')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') lightboxPrev.click();
            if (e.key === 'ArrowRight') lightboxNext.click();
        });
    }

    // ==========================================
    // 8. Resume Page Controls (HTML vs PDF Mode)
    // ==========================================
    const btnModeHtml = document.getElementById('btn-mode-html');
    const btnModePdf = document.getElementById('btn-mode-pdf');
    const resumeHtmlView = document.getElementById('resume-html-view');
    const resumePdfView = document.getElementById('resume-pdf-view');
    const printResumeBtn = document.getElementById('print-resume-btn');

    if (btnModeHtml && btnModePdf && resumeHtmlView && resumePdfView) {
        btnModeHtml.addEventListener('click', () => {
            btnModeHtml.classList.add('active');
            btnModePdf.classList.remove('active');
            btnModeHtml.setAttribute('aria-selected', 'true');
            btnModePdf.setAttribute('aria-selected', 'false');
            resumeHtmlView.classList.remove('hidden-mode');
            resumePdfView.classList.remove('active');
        });

        btnModePdf.addEventListener('click', () => {
            btnModePdf.classList.add('active');
            btnModeHtml.classList.remove('active');
            btnModePdf.setAttribute('aria-selected', 'true');
            btnModeHtml.setAttribute('aria-selected', 'false');
            resumeHtmlView.classList.add('hidden-mode');
            resumePdfView.classList.add('active');
        });
    }

    if (printResumeBtn) {
        printResumeBtn.addEventListener('click', () => window.print());
    }

    // ==========================================
    // 9. AI Chat Widget (+ Localhost Fallback)
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
    const charCountEl = document.getElementById('chat-char-count');
    const modeBadgeEl = document.getElementById('chat-mode-badge');

    if (!chatToggleBtn || !chatWindow) return;

    const AGENT_URL = 'https://qk2fyfnjaaecnydulxasuo3fdi0rfalk.lambda-url.us-east-1.on.aws/';
    const INITIAL_MESSAGE_HTML = `
        <div class="message ai-message">
            Hi! I can answer questions about Mitchell&rsquo;s projects, finance background, skills, and availability&mdash;or help you schedule a meeting or consultation.
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
    let chatHistory = [];
    let localIntakeState = { stage: 'idle', emailRequests: 0 };

    const updateCharCount = () => {
        if (charCountEl && chatInput) {
            charCountEl.textContent = `${chatInput.value.length} / 500`;
        }
    };

    if (chatInput) {
        chatInput.addEventListener('input', updateCharCount);
    }

    const scrollToBottom = () => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const setExpandedState = (expanded) => {
        chatWindow.style.height = '';
        chatWindow.style.maxHeight = '';
        chatWindow.classList.toggle('expanded', expanded);
        if (chatExpandIcon) {
            chatExpandIcon.innerHTML = expanded ? MINIMIZE_SVG : EXPAND_SVG;
        }
        scrollToBottom();
    };

    const toggleExpandState = () => {
        setExpandedState(!chatWindow.classList.contains('expanded'));
    };

    if (chatExpandBtn) {
        chatExpandBtn.addEventListener('click', toggleExpandState);
    }

    const syncSuggestionsVisibility = () => {
        if (!suggestionsBar) return;
        const pills = Array.from(suggestionsBar.querySelectorAll('.suggestion-pill'));
        const hasVisiblePill = pills.some((pill) => pill.style.display !== 'none');
        suggestionsBar.style.display = hasVisiblePill ? 'flex' : 'none';
    };

    const resetChat = () => {
        chatMessages.innerHTML = INITIAL_MESSAGE_HTML;
        if (suggestionsBar) {
            suggestionsBar.querySelectorAll('.suggestion-pill').forEach((pill) => {
                pill.style.display = '';
            });
            suggestionsBar.style.display = 'flex';
        }
        chatWindow.classList.remove('expanded', 'dragging');
        chatWindow.style.height = '';
        chatWindow.style.maxHeight = '';
        if (chatExpandIcon) chatExpandIcon.innerHTML = EXPAND_SVG;
        chatInput.value = '';
        updateCharCount();
        isSending = false;
        chatHistory = [];
        localIntakeState = { stage: 'idle', emailRequests: 0 };
        chatSendBtn.disabled = false;
    };

    const openChatWindow = () => {
        chatWindow.style.height = '';
        chatWindow.style.maxHeight = '';
        chatWindow.classList.remove('hidden');
        chatInput.focus();
    };

    chatToggleBtn.addEventListener('click', () => {
        if (chatWindow.classList.contains('hidden')) {
            openChatWindow();
        } else {
            chatWindow.classList.add('hidden');
            resetChat();
        }
    });

    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        resetChat();
    });

    document.querySelectorAll('.js-open-chat').forEach((btn) => {
        btn.addEventListener('click', openChatWindow);
    });

    document.querySelectorAll('.js-contact-assistant').forEach((btn) => {
        btn.addEventListener('click', () => {
            openChatWindow();
            const promptText = btn.getAttribute('data-contact-prompt');
            startScheduleIntake(promptText);
        });
    });

    // Touch drag for mobile bottom sheet
    let dragStartY = 0;
    let dragStartHeight = 0;
    let dragDeltaY = 0;
    let isDraggingSheet = false;
    let wasDragged = false;

    const handleSheetTouchStart = (e) => {
        if (window.innerWidth > 768) return;
        if (e.target.closest('button')) return;
        isDraggingSheet = true;
        wasDragged = false;
        dragStartY = e.touches[0].clientY;
        dragStartHeight = chatWindow.getBoundingClientRect().height;
        dragDeltaY = 0;
        chatWindow.classList.add('dragging');
    };

    const handleSheetTouchMove = (e) => {
        if (!isDraggingSheet) return;
        e.preventDefault();
        dragDeltaY = e.touches[0].clientY - dragStartY;
        if (Math.abs(dragDeltaY) >= 10) wasDragged = true;
        const minHeight = window.innerHeight * 0.25;
        const maxHeight = window.innerHeight * 0.92;
        const nextHeight = Math.min(maxHeight, Math.max(minHeight, dragStartHeight - dragDeltaY));
        chatWindow.style.height = `${nextHeight}px`;
        chatWindow.style.maxHeight = `${nextHeight}px`;
    };

    const handleSheetTouchEnd = () => {
        if (!isDraggingSheet) return;
        isDraggingSheet = false;
        chatWindow.classList.remove('dragging');
        if (!wasDragged) {
            toggleExpandState();
            return;
        }
        if (dragDeltaY < -45) {
            setExpandedState(true);
        } else if (dragDeltaY > 45) {
            if (chatWindow.classList.contains('expanded')) {
                setExpandedState(false);
            } else if (dragDeltaY > 110) {
                chatWindow.classList.add('hidden');
                resetChat();
            } else {
                setExpandedState(false);
            }
        } else {
            setExpandedState(chatWindow.classList.contains('expanded'));
        }
    };

    [chatSheetHandle, chatHeader].forEach((el) => {
        if (!el) return;
        el.addEventListener('touchstart', handleSheetTouchStart, { passive: true });
        el.addEventListener('touchmove', handleSheetTouchMove, { passive: false });
        el.addEventListener('touchend', handleSheetTouchEnd);
    });

    // Local preview fallback grounded strictly in Mitchell's verified portfolio & resume data
    const getLocalPreviewAnswer = (query) => {
        const q = query.toLowerCase();
        const emailMatch = query.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

        if (emailMatch) {
            localIntakeState.stage = 'idle';
            return `Thanks! I've logged your note for Mitch and noted your reply email (${emailMatch[0]}) in Local Demo Mode.\n\nOn production mitchellandrade.com, this calls the \`save_recruiter_inquiry\` tool to persist your details in DynamoDB and notify Mitch directly.`;
        }

        const refusesIntake = q.includes('prefer not') || q.includes('no thanks') || q.includes('just give') || q.includes("don't want") || q.includes('rather not');
        const asksEmail = q.includes('email') || q.includes('direct');

        if (refusesIntake || (asksEmail && localIntakeState.emailRequests >= 1)) {
            localIntakeState.stage = 'idle';
            return 'No problem at all! As a direct fallback, you can reach Mitch at hello@mitchellandrade.com or connect on LinkedIn at https://www.linkedin.com/in/mitchandrade/.';
        }

        if (asksEmail || q.includes('meeting') || q.includes('schedule') || q.includes('consultation') || q.includes('opportunity') || q.includes('interview') || q.includes('connect') || q.includes('get in touch') || q.includes('leave') || q.includes('reach mitch') || q.includes('contact')) {
            localIntakeState.stage = 'awaiting_details';
            if (asksEmail) localIntakeState.emailRequests += 1;
            return 'I’d be happy to pass a meeting, consultation, or opportunity request directly to Mitch!\n\nPlease share:\n• Your Name\n• Your Email address (plus optional Phone)\n• Your Company / Organization (optional)\n• Preferred days/times & timezone\n• A brief summary of the topic or role.';
        }

        if (localIntakeState.stage === 'awaiting_details') {
            return 'Got it—could you also include your Name and Email address so Mitch knows who to follow up with?';
        }

        if (q.includes('finance') || q.includes('portfolio') || q.includes('$3m') || q.includes('saff') || q.includes('quant')) {
            return 'Mitchell holds a B.S. in Business Administration (Finance) from the University of Northern Colorado (Jul 2023) and is completing his B.S. in Computer Science at CU Boulder.\n\nAt SAFF (2019–2020), he served as Portfolio Manager for a $3M equity portfolio—executing buy/sell orders and financial metric analysis. As an Independent Systems Engineer (2024–Present), he also builds C++/Python quantitative backtesting engines and PostgreSQL/Streamlit market data pipelines.';
        }
        if (q.includes('affordable') || q.includes('cost') || q.includes('guardrail') || q.includes('dynamodb') || q.includes('lambda')) {
            return 'This assistant runs on a zero-dependency Python AWS Lambda calling the Claude API. Cost is hard-capped via:\n• Atomic per-IP daily rate limits in DynamoDB (20 chat requests & 2 inquiry submissions/IP/day)\n• Strict 500-character input caps & 400-token output ceilings\n• Origin-locked CORS, reserved Lambda concurrency, and CloudWatch telemetry.';
        }
        if (q.includes('available') || q.includes('work') || q.includes('role') || q.includes('location') || q.includes('hire')) {
            return 'Mitchell is based in Colorado and open to opportunities across all U.S. locations (on-site or remote) in software engineering, backend/cloud systems, ML systems, or FinTech (plus Summer 2027 internships).\n\nIf you have a role or interview in mind, share your name, email, company, and a brief note here and I’ll pass it straight to Mitch!';
        }
        if (q.includes('lockedin') || q.includes('edge') || q.includes('jetson') || q.includes('basketball')) {
            return 'LockedIn is Mitchell’s Edge-AI basketball analytics system: an NVIDIA Jetson Orin Nano (1TB NVMe) paired with dual IMX477 cameras and a Raspberry Pi 5 AMOLED interface. Local inference filters video on-court, cutting projected AWS cloud ingress by up to 50% ahead of Milestone 01 court testing.';
        }
        if (q.includes('built') || q.includes('project') || q.includes('match play') || q.includes('dispatch') || q.includes('real estate')) {
            return 'Mitchell has built:\n• LockedIn — Edge-AI basketball analytics on Jetson Orin Nano + AWS pipeline\n• Serverless Portfolio AI Agent — Python AWS Lambda + DynamoDB rate-limited Claude assistant with lead capture\n• Match Play — Flask, React, PostgreSQL & NumPy golf compatibility app\n• AI Agent Dispatch Prototype — FastAPI, WebSockets & OpenAI human-in-the-loop triage\n• Real Estate Analytics Dashboard — PostgreSQL warehouse & Streamlit BI';
        }
        if (q.includes('skill') || q.includes('cert') || q.includes('aws') || q.includes('education') || q.includes('google')) {
            return 'Mitchell is pursuing a B.S. in Computer Science at CU Boulder (anticipated 2027; his academic standing earned an invitation to tour Google Boulder) and holds a Finance B.S. from UNC.\n\nCore stack: Python, C++, Java, Swift/SwiftUI, Scala, SQL, AWS, Docker, Kubernetes, Terraform, PostgreSQL, and PyTorch/TensorFlow. He also has 3 AWS certifications in progress.';
        }
        return 'Mitchell is a backend, cloud, and AI software engineer with a Finance degree and $3M portfolio management background. Ask me about his projects or experience—or tell me you’d like to connect and I can take down a note for him!';
    };

    const appendMessage = (text, className) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    };

    const showTypingIndicator = () => {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        chatMessages.appendChild(typingDiv);
        return typingDiv;
    };

    const recordTurn = (userText, assistantText) => {
        chatHistory.push({ role: 'user', content: userText });
        chatHistory.push({ role: 'assistant', content: assistantText });
        if (chatHistory.length > 6) {
            chatHistory = chatHistory.slice(-6);
        }
    };

    const buildIntakeCard = () => {
        const form = document.createElement('form');
        form.className = 'chat-intake-card';
        form.noValidate = true;

        const grid = document.createElement('div');
        grid.className = 'chat-intake-grid';

        const createFieldWrap = (fullWidth = false) => {
            const wrap = document.createElement('div');
            wrap.className = fullWidth ? 'chat-intake-field chat-intake-field-full' : 'chat-intake-field';
            return wrap;
        };

        // Inquiry type select
        const typeSelect = document.createElement('select');
        typeSelect.name = 'inquiry_type';
        typeSelect.className = 'chat-intake-select';
        typeSelect.setAttribute('aria-label', 'Inquiry type');
        [
            ['meeting', 'Meeting'],
            ['consultation', 'Consultation'],
            ['opportunity', 'Job Opportunity / Interview'],
            ['question', 'General Question']
        ].forEach(([value, label]) => {
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = label;
            typeSelect.appendChild(opt);
        });
        const typeWrap = createFieldWrap(true);
        typeWrap.appendChild(typeSelect);
        grid.appendChild(typeWrap);

        // Visitor name
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.name = 'visitor_name';
        nameInput.required = true;
        nameInput.maxLength = 60;
        nameInput.placeholder = 'Your name *';
        nameInput.className = 'chat-intake-input';
        nameInput.setAttribute('aria-label', 'Your name');
        const nameWrap = createFieldWrap(false);
        nameWrap.appendChild(nameInput);
        grid.appendChild(nameWrap);

        // Organization
        const orgInput = document.createElement('input');
        orgInput.type = 'text';
        orgInput.name = 'organization';
        orgInput.maxLength = 60;
        orgInput.placeholder = 'Company / Org (optional)';
        orgInput.className = 'chat-intake-input';
        orgInput.setAttribute('aria-label', 'Company or organization');
        const orgWrap = createFieldWrap(false);
        orgWrap.appendChild(orgInput);
        grid.appendChild(orgWrap);

        // Visitor email
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.name = 'visitor_email';
        emailInput.required = true;
        emailInput.maxLength = 80;
        emailInput.placeholder = 'Your email address *';
        emailInput.className = 'chat-intake-input';
        emailInput.setAttribute('aria-label', 'Your email address');
        const emailWrap = createFieldWrap(false);
        emailWrap.appendChild(emailInput);
        grid.appendChild(emailWrap);

        // Visitor phone
        const phoneInput = document.createElement('input');
        phoneInput.type = 'tel';
        phoneInput.name = 'visitor_phone';
        phoneInput.maxLength = 30;
        phoneInput.placeholder = 'Phone (optional)';
        phoneInput.className = 'chat-intake-input';
        phoneInput.setAttribute('aria-label', 'Phone number');
        const phoneWrap = createFieldWrap(false);
        phoneWrap.appendChild(phoneInput);
        grid.appendChild(phoneWrap);

        // Preferred time
        const timeInput = document.createElement('input');
        timeInput.type = 'text';
        timeInput.name = 'preferred_time';
        timeInput.maxLength = 60;
        timeInput.placeholder = 'Preferred day/time & timezone (e.g. Tue 2pm MT)';
        timeInput.className = 'chat-intake-input';
        timeInput.setAttribute('aria-label', 'Preferred day, time, and timezone');
        const timeWrap = createFieldWrap(true);
        timeWrap.appendChild(timeInput);
        grid.appendChild(timeWrap);

        // Summary
        const summaryInput = document.createElement('textarea');
        summaryInput.name = 'summary';
        summaryInput.rows = 2;
        summaryInput.required = true;
        summaryInput.maxLength = 180;
        summaryInput.placeholder = 'What would you like to discuss? *';
        summaryInput.className = 'chat-intake-textarea';
        summaryInput.setAttribute('aria-label', 'Summary of what you would like to discuss');
        const summaryWrap = createFieldWrap(true);
        summaryWrap.appendChild(summaryInput);
        grid.appendChild(summaryWrap);

        form.appendChild(grid);

        const hintEl = document.createElement('div');
        hintEl.className = 'chat-intake-hint';
        hintEl.textContent = '* Required fields';
        form.appendChild(hintEl);

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'chat-intake-submit';
        submitBtn.textContent = 'Send Request to Mitch';
        form.appendChild(submitBtn);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isSending) return;

            const clean = (val) => (val || '').replace(/\s+/g, ' ').trim();
            const inquiryType = clean(typeSelect.value) || 'meeting';
            const visitorName = clean(nameInput.value);
            const visitorEmail = clean(emailInput.value);
            const visitorPhone = clean(phoneInput.value);
            const organization = clean(orgInput.value);
            const preferredTime = clean(timeInput.value);
            const summary = clean(summaryInput.value);

            const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(visitorEmail);

            if (!visitorName) {
                hintEl.textContent = 'Please enter your name.';
                hintEl.classList.add('is-error');
                nameInput.focus();
                return;
            }
            if (!emailValid) {
                hintEl.textContent = 'Please enter a valid email address (e.g. name@company.com).';
                hintEl.classList.add('is-error');
                emailInput.focus();
                return;
            }
            if (!summary) {
                hintEl.textContent = 'Please add a brief topic or summary.';
                hintEl.classList.add('is-error');
                summaryInput.focus();
                return;
            }

            hintEl.textContent = 'Submitting directly to Mitch...';
            hintEl.classList.remove('is-error');

            const controls = form.querySelectorAll('input, select, textarea, button');
            controls.forEach((ctrl) => {
                ctrl.disabled = true;
            });
            submitBtn.textContent = 'Sending to Mitch...';

            const formattedMessage = (
                `Please save my ${inquiryType} request for Mitch. ` +
                `Name: ${visitorName} | Email: ${visitorEmail}` +
                (visitorPhone ? ` | Phone: ${visitorPhone}` : '') +
                (organization ? ` | Org: ${organization}` : '') +
                (preferredTime ? ` | Preferred Time: ${preferredTime}` : '') +
                ` | Topic: ${summary}`
            ).slice(0, 490);

            await sendMessage(formattedMessage, { isIntakeSubmission: true });
            submitBtn.textContent = 'Sent ✓';
            hintEl.textContent = 'Details delivered via AI Assistant.';
        });

        return form;
    };

    const startScheduleIntake = (userPromptText) => {
        if (isSending) return;
        const promptText = (userPromptText || "I'd like to schedule a meeting or consultation with Mitch.").trim();

        if (suggestionsBar) {
            suggestionsBar.querySelectorAll('[data-intake-trigger="true"]').forEach((pill) => {
                pill.style.display = 'none';
            });
            syncSuggestionsVisibility();
        }

        appendMessage(promptText, 'user-message');

        const assistantIntakeText =
            "I'd be happy to help you schedule a meeting or consultation with Mitch! " +
            'Please fill out the quick form below—or simply type your Name, Email, preferred date/time, and topic right in the chat:';

        recordTurn(promptText, assistantIntakeText);
        localIntakeState.stage = 'awaiting_details';

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ai-message ai-message-intake';

        const introP = document.createElement('p');
        introP.style.margin = '0';
        introP.textContent = assistantIntakeText;
        msgDiv.appendChild(introP);
        msgDiv.appendChild(buildIntakeCard());

        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    };

    const sendMessage = async (overrideText = null, options = {}) => {
        if (isSending) return;
        const text = (overrideText !== null ? overrideText : chatInput.value).trim();
        if (!text) return;

        if (suggestionsBar) {
            if (options.isIntakeSubmission) {
                suggestionsBar.style.display = 'none';
            } else {
                syncSuggestionsVisibility();
            }
        }
        appendMessage(text, 'user-message');
        if (overrideText === null) {
            chatInput.value = '';
            updateCharCount();
        }

        const historySnapshot = chatHistory.slice(-6);
        isSending = true;
        chatSendBtn.disabled = true;
        const typingIndicator = showTypingIndicator();
        scrollToBottom();

        try {
            const response = await fetch(AGENT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history: historySnapshot })
            });
            const data = await response.json();
            typingIndicator.remove();

            if (response.ok && data.response) {
                appendMessage(data.response, 'ai-message');
                recordTurn(text, data.response);
            } else {
                const fallbackReply = data.error || getLocalPreviewAnswer(text);
                appendMessage(fallbackReply, 'ai-message');
                recordTurn(text, fallbackReply);
            }
        } catch (error) {
            // Production Lambda restricts CORS to mitchellandrade.com; fallback smoothly on local demo origins
            typingIndicator.remove();
            const isLocalPreview = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
            if (isLocalPreview) {
                if (modeBadgeEl) {
                    modeBadgeEl.textContent = 'Local Demo Mode (CORS Fallback)';
                }
                const localReply = getLocalPreviewAnswer(text);
                setTimeout(() => {
                    appendMessage(localReply, 'ai-message');
                    recordTurn(text, localReply);
                }, 220);
            } else {
                console.error('Error communicating with AI agent:', error);
                appendMessage("I seem to be offline right now! Please reach out to Mitch directly at hello@mitchellandrade.com.", 'ai-message');
            }
        } finally {
            isSending = false;
            chatSendBtn.disabled = false;
            chatInput.focus();
            scrollToBottom();
        }
    };

    chatSendBtn.addEventListener('click', () => sendMessage());
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    document.querySelectorAll('.suggestion-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
            const promptText = pill.getAttribute('data-prompt');
            if (pill.hasAttribute('data-intake-trigger')) {
                startScheduleIntake(promptText);
                return;
            }
            pill.style.display = 'none';
            syncSuggestionsVisibility();
            sendMessage(promptText);
        });
    });
});

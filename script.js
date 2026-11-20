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
                const categories = (card.getAttribute('data-category') || '').split(/\s+/).filter(Boolean);
                const match = selected === 'all' || categories.includes(selected);
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

    // Colorado Real Estate Hedonic AVM & 10-Yr IRR Simulator
    const reMarketInput = document.getElementById('sim-re-market');
    const reSqftInput = document.getElementById('sim-re-sqft');
    const reRateInput = document.getElementById('sim-re-rate');
    const RE_MARKETS = {
        '80209': { ppsf: 612, rentPsf: 2.96, mill: 78.4 },
        '80302': { ppsf: 735, rentPsf: 3.24, mill: 82.9 },
        '80524': { ppsf: 356, rentPsf: 2.12, mill: 75.3 },
        '80920': { ppsf: 268, rentPsf: 1.66, mill: 63.8 },
        '80424': { ppsf: 915, rentPsf: 4.55, mill: 56.4 },
        '81611': { ppsf: 1780, rentPsf: 7.10, mill: 44.6 },
        '81501': { ppsf: 264, rentPsf: 1.62, mill: 68.4 },
        '80751': { ppsf: 182, rentPsf: 1.32, mill: 72.1 }
    };

    const solveIrrJs = (cfs) => {
        let lo = -0.4;
        let hi = 0.8;
        for (let i = 0; i < 50; i += 1) {
            const mid = 0.5 * (lo + hi);
            let npv = 0;
            for (let t = 0; t < cfs.length; t += 1) {
                npv += cfs[t] / Math.pow(1 + mid, t);
            }
            if (npv > 0) lo = mid; else hi = mid;
        }
        return (lo + hi) * 50;
    };

    const updateRealEstateSim = () => {
        if (!reMarketInput || !reSqftInput || !reRateInput) return;
        const m = RE_MARKETS[reMarketInput.value] || RE_MARKETS['80209'];
        const sqft = Number(reSqftInput.value);
        const ratePct = Number(reRateInput.value);

        const fmv = Math.round((m.ppsf * sqft) / 1000) * 1000;
        const monthlyRent = Math.round((m.rentPsf * sqft) / 10) * 10;
        const down = fmv * 0.25;
        const initEq = down + fmv * 0.02;
        const loanAmt = fmv - down;
        const mr = (ratePct / 100) / 12;
        const n = 360;
        const monthlyPi = loanAmt * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
        const annualDs = monthlyPi * 12;
        const effTaxRate = (0.067 * m.mill) / 1000;

        let bal = loanAmt;
        let cumCf = 0;
        let yr1Noi = 0;
        const cfs = [-initEq];

        for (let yr = 1; yr <= 10; yr += 1) {
            const egi = monthlyRent * 12 * Math.pow(1.035, yr - 1) * 0.95;
            const propTax = fmv * Math.pow(1.035, yr - 1) * effTaxRate;
            const opex = propTax + 2600 * Math.pow(1.025, yr - 1) + 1320 * Math.pow(1.02, yr - 1) + egi * 0.13;
            const noi = egi - opex;
            if (yr === 1) yr1Noi = noi;
            const cf = noi - annualDs;
            cumCf += cf;
            for (let mo = 0; mo < 12; mo += 1) {
                const intPmt = bal * mr;
                bal = Math.max(0, bal - Math.max(0, monthlyPi - intPmt));
            }
            const exitVal = fmv * Math.pow(1.045, yr);
            const netSale = exitVal * 0.945 - bal;
            cfs.push(cf + (yr === 10 ? netSale : 0));
        }

        const cap = (yr1Noi / fmv) * 100;
        const dscr = yr1Noi / annualDs;
        const irr = solveIrrJs(cfs);
        const totalRet = cfs.slice(1).reduce((a, b) => a + b, 0);
        const moic = totalRet / initEq;
        const yr10Val = fmv * Math.pow(1.045, 10);
        const yr10Wealth = Math.max(initEq, (yr10Val - bal) + cumCf);
        const initPct = Math.min(95, Math.max(12, Math.round((initEq / yr10Wealth) * 100)));

        document.getElementById('sim-re-ppsf-badge').textContent = `$${m.ppsf.toLocaleString()} / sf`;
        document.getElementById('sim-re-sqft-val').textContent = `${sqft.toLocaleString()} sq ft`;
        document.getElementById('sim-re-rate-val').textContent = `${ratePct.toFixed(2)}%`;
        document.getElementById('out-re-fmv').textContent = `$${fmv.toLocaleString()}`;
        document.getElementById('out-re-cap').textContent = `${cap.toFixed(2)}% ($${monthlyRent.toLocaleString()}/mo)`;
        document.getElementById('out-re-dscr').textContent = dscr >= 1.25 ? `${dscr.toFixed(2)}x (Pass)` : `${dscr.toFixed(2)}x`;
        document.getElementById('out-re-irr').textContent = `${irr.toFixed(1)}% (${moic.toFixed(2)}x)`;
        document.getElementById('out-re-wealth-bar').textContent = `$${Math.round(yr10Wealth).toLocaleString()}`;
        document.getElementById('out-re-init-bar').textContent = `$${Math.round(initEq).toLocaleString()}`;
        document.getElementById('bar-re-wealth').style.width = '100%';
        document.getElementById('bar-re-init').style.width = `${initPct}%`;
    };

    if (reMarketInput && reSqftInput && reRateInput) {
        [reMarketInput, reSqftInput, reRateInput].forEach((el) => el.addEventListener('input', updateRealEstateSim));
        updateRealEstateSim();
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
            return 'Mitchell has built:\n• LockedIn — Edge-AI basketball analytics on Jetson Orin Nano + AWS pipeline\n• Serverless Portfolio AI Agent — Python AWS Lambda + DynamoDB rate-limited Claude assistant with lead capture\n• Match Play — Live Python/Flask, Neon PostgreSQL, NumPy & Esri/Leaflet golf matchmaking app on Render (https://cspb3308-team-4.onrender.com/)\n• Real Estate Analytics & Valuation BI — 26-year (2000–2026) Kimball Star-Schema PostgreSQL warehouse across 7 Colorado regions & 26 markets, ETL pipeline, Hedonic AVM (R²=0.9965) & 10-yr Streamlit underwriting BI\n• AI Agent Dispatch Prototype — FastAPI, WebSockets & OpenAI human-in-the-loop triage';
        }
        if (q.includes('skill') || q.includes('cert') || q.includes('aws') || q.includes('education') || q.includes('google') || q.includes('gpa') || q.includes('shpe') || q.includes('nsls')) {
            return 'Mitchell is pursuing a B.S. in Computer Science at CU Boulder (3.7 GPA, anticipated 2027; his academic standing earned an invitation to tour Google Boulder) and holds a Finance B.S. from UNC. He is also a member of the Society of Hispanic Professional Engineers (SHPE) and the National Society of Leadership and Success (NSLS).\n\nCore stack: Python, C++, Java, Swift/SwiftUI, Scala, SQL, AWS, Docker, Kubernetes, Terraform, PostgreSQL, and PyTorch/TensorFlow. He also has 3 AWS certifications in progress.';
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

        const TIME_SLOTS = [
            '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM',
            '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
        ];
        const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        const DURATIONS = [
            ['15 mins', 15],
            ['30 mins', 30],
            ['45 mins', 45]
        ];

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayDow = today.getDay();
        const defaultOffsetDays = todayDow === 5 ? 3 : ((5 - todayDow + 7) % 7);
        const defaultDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + defaultOffsetDays);

        let selectedDate = defaultDate;
        let viewYear = defaultDate.getFullYear();
        let viewMonth = defaultDate.getMonth();
        let selectedDuration = 30;
        let selectedTime = '2:00 PM';
        let selectedTz = 'MT';
        let isFormLocked = false;

        const computeEndTime = (slotStr, durationMins) => {
            const match = slotStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (!match) return slotStr;
            let hours = parseInt(match[1], 10) % 12;
            const mins = parseInt(match[2], 10);
            if (match[3].toUpperCase() === 'PM') hours += 12;
            const totalMins = hours * 60 + mins + durationMins;
            const endHour24 = Math.floor(totalMins / 60) % 24;
            const endMin = totalMins % 60;
            const period = endHour24 >= 12 ? 'PM' : 'AM';
            const endHour12 = endHour24 % 12 || 12;
            return `${endHour12}:${String(endMin).padStart(2, '0')} ${period}`;
        };

        const createSection = (labelText) => {
            const section = document.createElement('div');
            section.className = 'chat-intake-section';
            const label = document.createElement('div');
            label.className = 'chat-intake-section-label';
            label.textContent = labelText;
            section.appendChild(label);
            return section;
        };

        const createFieldWrap = (fullWidth = false) => {
            const wrap = document.createElement('div');
            wrap.className = fullWidth ? 'chat-intake-field chat-intake-field-full' : 'chat-intake-field';
            return wrap;
        };

        // ---- Section 1: Type & Duration ----
        const sec1 = createSection('1. Select Type & Duration');

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
        sec1.appendChild(typeSelect);

        const durationBar = document.createElement('div');
        durationBar.className = 'chat-duration-bar';
        durationBar.setAttribute('role', 'group');
        durationBar.setAttribute('aria-label', 'Meeting duration');
        const durationBtns = [];

        const slotSummaryEl = document.createElement('div');
        slotSummaryEl.className = 'chat-slot-summary';

        const formatPreferredTime = () => {
            const dateShort = selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            const endTime = computeEndTime(selectedTime, selectedDuration);
            return { dateShort, endTime };
        };

        const updateSlotSummary = () => {
            const { dateShort, endTime } = formatPreferredTime();
            slotSummaryEl.textContent = `📅 ${dateShort} • ${selectedTime} – ${endTime} ${selectedTz} (${selectedDuration} mins)`;
        };

        DURATIONS.forEach(([label, mins]) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = mins === selectedDuration ? 'chat-duration-pill active' : 'chat-duration-pill';
            btn.textContent = label;
            btn.setAttribute('aria-pressed', String(mins === selectedDuration));
            btn.addEventListener('click', () => {
                if (isFormLocked) return;
                selectedDuration = mins;
                durationBtns.forEach((b) => {
                    const active = b === btn;
                    b.classList.toggle('active', active);
                    b.setAttribute('aria-pressed', String(active));
                });
                updateSlotSummary();
            });
            durationBtns.push(btn);
            durationBar.appendChild(btn);
        });
        sec1.appendChild(durationBar);
        form.appendChild(sec1);

        // ---- Section 2: Interactive Calendar & Time Slots ----
        const sec2 = createSection('2. Pick a Date & Time Slot');
        const calBox = document.createElement('div');
        calBox.className = 'chat-calendar-box';

        const calHeader = document.createElement('div');
        calHeader.className = 'chat-cal-header';

        const monthLabelEl = document.createElement('span');
        monthLabelEl.className = 'chat-cal-month-label';

        const calControls = document.createElement('div');
        calControls.className = 'chat-cal-controls';

        const tzSelect = document.createElement('select');
        tzSelect.className = 'chat-cal-tz';
        tzSelect.setAttribute('aria-label', 'Timezone');
        [
            ['MT', 'MT'],
            ['PT', 'PT'],
            ['CT', 'CT'],
            ['ET', 'ET']
        ].forEach(([val, text]) => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = text;
            tzSelect.appendChild(opt);
        });
        tzSelect.value = selectedTz;
        tzSelect.addEventListener('change', () => {
            selectedTz = tzSelect.value;
            updateSlotSummary();
        });

        const prevMonthBtn = document.createElement('button');
        prevMonthBtn.type = 'button';
        prevMonthBtn.className = 'chat-cal-nav-btn';
        prevMonthBtn.setAttribute('aria-label', 'Previous month');
        prevMonthBtn.textContent = '‹';

        const nextMonthBtn = document.createElement('button');
        nextMonthBtn.type = 'button';
        nextMonthBtn.className = 'chat-cal-nav-btn';
        nextMonthBtn.setAttribute('aria-label', 'Next month');
        nextMonthBtn.textContent = '›';

        calControls.appendChild(tzSelect);
        calControls.appendChild(prevMonthBtn);
        calControls.appendChild(nextMonthBtn);
        calHeader.appendChild(monthLabelEl);
        calHeader.appendChild(calControls);
        calBox.appendChild(calHeader);

        const weekdaysRow = document.createElement('div');
        weekdaysRow.className = 'chat-cal-weekdays';
        WEEKDAYS.forEach((dayName) => {
            const span = document.createElement('span');
            span.className = 'chat-cal-weekday';
            span.textContent = dayName;
            weekdaysRow.appendChild(span);
        });
        calBox.appendChild(weekdaysRow);

        const calGrid = document.createElement('div');
        calGrid.className = 'chat-cal-grid';
        calBox.appendChild(calGrid);

        const renderCalendar = () => {
            monthLabelEl.textContent = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
            const atMinMonth = viewYear === today.getFullYear() && viewMonth <= today.getMonth();
            prevMonthBtn.disabled = isFormLocked || atMinMonth;
            nextMonthBtn.disabled = isFormLocked;

            calGrid.innerHTML = '';
            const firstDow = new Date(viewYear, viewMonth, 1).getDay();
            const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

            for (let i = 0; i < firstDow; i += 1) {
                const spacer = document.createElement('span');
                spacer.className = 'chat-cal-spacer';
                spacer.setAttribute('aria-hidden', 'true');
                calGrid.appendChild(spacer);
            }

            for (let day = 1; day <= daysInMonth; day += 1) {
                const cellDate = new Date(viewYear, viewMonth, day);
                const isPast = cellDate < today;
                const isToday = cellDate.getTime() === today.getTime();
                const isSelected = cellDate.getTime() === selectedDate.getTime();

                const dayBtn = document.createElement('button');
                dayBtn.type = 'button';
                dayBtn.className = 'chat-cal-day';
                if (isToday) dayBtn.classList.add('is-today');
                if (isSelected) dayBtn.classList.add('is-selected');
                dayBtn.textContent = String(day);
                dayBtn.disabled = isFormLocked || isPast;
                dayBtn.setAttribute('aria-pressed', String(isSelected));
                dayBtn.setAttribute('aria-label', cellDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                }));

                dayBtn.addEventListener('click', () => {
                    if (isFormLocked || isPast) return;
                    selectedDate = cellDate;
                    renderCalendar();
                    updateSlotSummary();
                });

                calGrid.appendChild(dayBtn);
            }
        };

        prevMonthBtn.addEventListener('click', () => {
            if (isFormLocked) return;
            if (viewYear === today.getFullYear() && viewMonth <= today.getMonth()) return;
            viewMonth -= 1;
            if (viewMonth < 0) {
                viewMonth = 11;
                viewYear -= 1;
            }
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            if (isFormLocked) return;
            viewMonth += 1;
            if (viewMonth > 11) {
                viewMonth = 0;
                viewYear += 1;
            }
            renderCalendar();
        });

        const slotsGrid = document.createElement('div');
        slotsGrid.className = 'chat-slots-grid';
        slotsGrid.setAttribute('role', 'group');
        slotsGrid.setAttribute('aria-label', 'Preferred time slots');
        const slotBtns = [];

        TIME_SLOTS.forEach((slot) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = slot === selectedTime ? 'chat-slot-pill active' : 'chat-slot-pill';
            btn.textContent = slot;
            btn.setAttribute('aria-pressed', String(slot === selectedTime));
            btn.addEventListener('click', () => {
                if (isFormLocked) return;
                selectedTime = slot;
                slotBtns.forEach((b) => {
                    const active = b === btn;
                    b.classList.toggle('active', active);
                    b.setAttribute('aria-pressed', String(active));
                });
                updateSlotSummary();
            });
            slotBtns.push(btn);
            slotsGrid.appendChild(btn);
        });

        calBox.appendChild(slotsGrid);
        calBox.appendChild(slotSummaryEl);
        sec2.appendChild(calBox);
        form.appendChild(sec2);

        renderCalendar();
        updateSlotSummary();

        // ---- Section 3: Contact Details ----
        const sec3 = createSection('3. Your Contact Details');
        const grid = document.createElement('div');
        grid.className = 'chat-intake-grid';

        // Visitor name
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.name = 'visitor_name';
        nameInput.required = true;
        nameInput.maxLength = 50;
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
        orgInput.maxLength = 45;
        orgInput.placeholder = 'Company / Org';
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
        emailInput.maxLength = 70;
        emailInput.placeholder = 'Your email *';
        emailInput.className = 'chat-intake-input';
        emailInput.setAttribute('aria-label', 'Your email address');
        const emailWrap = createFieldWrap(false);
        emailWrap.appendChild(emailInput);
        grid.appendChild(emailWrap);

        // Visitor phone
        const phoneInput = document.createElement('input');
        phoneInput.type = 'tel';
        phoneInput.name = 'visitor_phone';
        phoneInput.maxLength = 24;
        phoneInput.placeholder = 'Phone (optional)';
        phoneInput.className = 'chat-intake-input';
        phoneInput.setAttribute('aria-label', 'Phone number');
        const phoneWrap = createFieldWrap(false);
        phoneWrap.appendChild(phoneInput);
        grid.appendChild(phoneWrap);

        // Summary
        const summaryInput = document.createElement('textarea');
        summaryInput.name = 'summary';
        summaryInput.rows = 2;
        summaryInput.required = true;
        summaryInput.maxLength = 160;
        summaryInput.placeholder = 'Topic / What would you like to discuss? *';
        summaryInput.className = 'chat-intake-textarea';
        summaryInput.setAttribute('aria-label', 'Summary of what you would like to discuss');
        const summaryWrap = createFieldWrap(true);
        summaryWrap.appendChild(summaryInput);
        grid.appendChild(summaryWrap);

        sec3.appendChild(grid);
        form.appendChild(sec3);

        const hintEl = document.createElement('div');
        hintEl.className = 'chat-intake-hint';
        hintEl.textContent = '* Required fields';
        form.appendChild(hintEl);

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'chat-intake-submit';
        submitBtn.textContent = 'Confirm & Send Request to Mitch';
        form.appendChild(submitBtn);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isSending || isFormLocked) return;

            const clean = (val) => (val || '').replace(/\s+/g, ' ').trim();
            const inquiryType = clean(typeSelect.value) || 'meeting';
            const visitorName = clean(nameInput.value);
            const visitorEmail = clean(emailInput.value);
            const visitorPhone = clean(phoneInput.value);
            const organization = clean(orgInput.value);
            const summary = clean(summaryInput.value);

            const { dateShort, endTime } = formatPreferredTime();
            const preferredTime = `${dateShort} at ${selectedTime}-${endTime} ${selectedTz} (${selectedDuration} mins)`;

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

            isFormLocked = true;
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
                ` | Preferred Time: ${preferredTime}` +
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

        setExpandedState(true);
        if (suggestionsBar) {
            suggestionsBar.style.display = 'none';
        }

        appendMessage(promptText, 'user-message');

        const assistantIntakeText =
            "I'd be happy to help you schedule a meeting or consultation with Mitch! " +
            'Pick a duration, date, and time slot below (or type your details right in the chat):';

        recordTurn(promptText, assistantIntakeText);
        localIntakeState.stage = 'awaiting_details';

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ai-message ai-message-intake';

        const introP = document.createElement('p');
        introP.className = 'chat-intake-intro';
        introP.textContent = assistantIntakeText;
        msgDiv.appendChild(introP);
        msgDiv.appendChild(buildIntakeCard());

        chatMessages.appendChild(msgDiv);
        requestAnimationFrame(() => {
            const topOffset =
                msgDiv.getBoundingClientRect().top -
                chatMessages.getBoundingClientRect().top +
                chatMessages.scrollTop -
                12;
            chatMessages.scrollTop = Math.max(0, topOffset);
        });
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

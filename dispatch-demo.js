(() => {
    "use strict";

    // 1. Light / Dark Theme Sync (matches portfolio script.js)
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const isDark = document.documentElement.getAttribute("data-theme") === "dark";
            if (isDark) {
                document.documentElement.removeAttribute("data-theme");
                try { localStorage.setItem("ma-theme", "light"); } catch (e) {}
            } else {
                document.documentElement.setAttribute("data-theme", "dark");
                try { localStorage.setItem("ma-theme", "dark"); } catch (e) {}
            }
        });
    }

    // 2. Plain-English Info Popover Definitions
    const INFO_COPY = {
        step_goal: {
            title: "Plain-English Goal Intake",
            plain: "Instead of clicking through 20 menus or scripts, you type what you want accomplished in everyday language.",
            why: "Why it matters: Makes automation accessible to engineers, ops leads, and stakeholders alike."
        },
        step_plan: {
            title: "Autonomous Planning & Self-Checking",
            plain: "Before touching anything live, the AI inspects the workspace, maps a checklist, writes code in a safe sandbox, and checks it for errors.",
            why: "Why it matters: Eliminates guesswork and catches syntax mistakes before human review."
        },
        step_gate: {
            title: "Human-in-the-Loop (HITL) Safety Gate",
            plain: "Any step that alters production traffic, live configuration, or cloud infrastructure triggers an automatic hard pause.",
            why: "Why it matters: Gives businesses AI speed without handing over unchecked control."
        },
        step_pivot: {
            title: "Approve, Tweak, or Safe Detour",
            plain: "A human can greenlight the step, adjust numbers (like traffic limits) directly in the form, or reject it so the AI builds a safe staging alternative.",
            why: "Why it matters: Turning down a risky AI idea doesn't crash the job — the system adapts safely."
        },
        panel_triage: {
            title: "Triage Assessment (Risk Scoring)",
            plain: "Just like a hospital ER desk, the AI first classifies how complex and risky a request is before doing any work.",
            why: "Business value: Ensures high-risk requests automatically get stricter safety checkpoints."
        },
        panel_thinking: {
            title: "Agent Thinking Stream (No Black Box)",
            plain: "Watch the AI explain its reasoning word-by-word as it works, so you always know why it chose a step.",
            why: "Business value: Builds trust and makes auditing or debugging effortless."
        },
        panel_dag: {
            title: "Visual Task Builder (DAG)",
            plain: "A live flowchart (Directed Acyclic Graph) showing each step, what depends on what, and whether a step is automatic or human-gated.",
            why: "Business value: Non-technical managers can immediately see progress, bottlenecks, and safety detours."
        },
        panel_artifact: {
            title: "Generated Artifact & AST Verification",
            plain: "Displays the actual files the AI wrote, paired with an automatic structural check (AST) proving the code is syntactically valid.",
            why: "Business value: Guarantees the AI isn't hallucinating broken code before a human reviews it."
        },
        panel_hitl: {
            title: "Human-in-the-Loop Safety Gate",
            plain: "A mandatory human approval panel that locks the AI until an authorized person clicks Approve, Modify, or Reject.",
            why: "Business value: Prevents accidental outages, bad config pushes, or unauthorized cloud changes."
        },
        panel_ws: {
            title: "WebSocket Event Stream",
            plain: "A live activity ticker streaming every tool call, pause, and human decision in real time without needing page refreshes.",
            why: "Business value: Creates a timestamped operational log for accountability and compliance."
        },
        glossary_agent: {
            title: "AI Agent vs. Standard Chatbot",
            plain: "A chatbot stops at giving advice. An AI Agent plans steps, uses tools, verifies results, and asks permission before acting.",
            why: "Business value: Turns AI from a Q&A toy into a reliable workflow assistant."
        },
        glossary_audit: {
            title: "SQLite Audit Trail",
            plain: "Every run, generated file, and human approval or rejection note is stored permanently in a database.",
            why: "Business value: Lets teams prove who approved what change and when — critical for enterprise governance."
        }
    };

    const popover = document.getElementById("info-popover");
    const popTitle = document.getElementById("info-popover-title");
    const popPlain = document.getElementById("info-popover-plain");
    const popWhy = document.getElementById("info-popover-why");
    const popClose = document.getElementById("info-popover-close");
    let activeInfoBtn = null;

    function closePopover() {
        popover.classList.add("hidden");
        activeInfoBtn = null;
    }

    function openPopoverFor(btn) {
        const key = btn.getAttribute("data-info-key");
        const info = INFO_COPY[key];
        if (!info) return;

        if (activeInfoBtn === btn && !popover.classList.contains("hidden")) {
            closePopover();
            return;
        }
        activeInfoBtn = btn;
        popTitle.textContent = info.title;
        popPlain.textContent = info.plain;
        popWhy.textContent = info.why;
        popover.classList.remove("hidden");

        // Clamp cleanly inside viewport so it never clips off-screen
        const bRect = btn.getBoundingClientRect();
        const pRect = popover.getBoundingClientRect();
        let left = bRect.left + bRect.width / 2 - pRect.width / 2;
        left = Math.max(12, Math.min(left, window.innerWidth - pRect.width - 12));
        let top = bRect.bottom + 8;
        if (top + pRect.height > window.innerHeight - 12) {
            top = Math.max(12, bRect.top - pRect.height - 8);
        }
        popover.style.left = `${left}px`;
        popover.style.top = `${top}px`;
    }

    document.querySelectorAll(".info-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            openPopoverFor(btn);
        });
    });

    popClose.addEventListener("click", closePopover);
    document.addEventListener("click", (e) => {
        if (!popover.classList.contains("hidden") && !popover.contains(e.target)) {
            closePopover();
        }
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closePopover();
    });

    // 3. Interactive Client-Side Agent Dispatch Simulator
    const SCENARIOS = {
        ratelimiter: {
            goal: "Refactor API token-bucket rate limiter with burst protection, verify edge cases, and push live gateway config.",
            triage: {
                domain: "API Gateway & Reliability",
                risk: "HIGH (Live Traffic)",
                summary: "Code build & checks run safely in sandbox; updating live gateway rate limits pauses for human sign-off."
            },
            thoughts: [
                { phase: "TRIAGE", title: "Scoring operational risk", text: "Separating safe sandbox code checks from live production gateway configuration." },
                { phase: "PLAN", title: "Building 5-step task graph", text: "1. Scan runtime -> 2. Design burst rules -> 3. Write rate_limiter.py -> 4. Run AST checks -> 5. Human-gated gateway push." },
                { phase: "VERIFY", title: "Self-checking generated code", text: "AST syntax & TokenBucketLimiter symbol contracts passed cleanly (0 syntax errors)." },
                { phase: "GATE", title: "Pausing for human confirmation", text: "Ready to push rate=150 req/s, burst=300 to api-gateway-prod. Waiting for operator Approve, Modify, or Reject." }
            ],
            nodes: [
                { id: "n1", step: 1, title: "Scan Workspace", tool: "scan_workspace()", risk: "low" },
                { id: "n2", step: 2, title: "Analyze Burst Rules", tool: "analyze_architecture()", risk: "low" },
                { id: "n3", step: 3, title: "Build rate_limiter.py", tool: "generate_artifact()", risk: "med" },
                { id: "n4", step: 4, title: "Verify AST & Symbols", tool: "run_verification_suite()", risk: "low" },
                { id: "n5", step: 5, title: "Push Live Gateway Config", tool: "apply_live_config()", risk: "high" }
            ],
            artifactName: "rate_limiter.py",
            artifactCode: `class TokenBucketLimiter:\n    """Enforces sustained RPS plus bounded burst capacity."""\n\n    def __init__(self, requests_per_second: float = 120.0, burst_limit: int = 240):\n        self.rate = float(requests_per_second)\n        self.capacity = float(burst_limit)\n        self._buckets = {}\n\n    def allow(self, key: str, tokens: float = 1.0) -> bool:\n        # Thread-safe monotonic refill & burst protection\n        return self.capacity >= tokens`,
            checkpoint: {
                title: "Approve apply_live_config (Push Live Gateway Config)",
                blast: "Changes live ingress traffic limits on api-gateway-prod. Impacts all active API callers immediately.",
                payload: { target_gateway: "api-gateway-prod", requests_per_second: 150, burst_limit: 300 },
                fallbackTitle: "Generate Safe Staging Patch",
                fallbackTool: "generate_staging_patch()",
                fallbackArtifactName: "staging_dry_run_patch.md",
                fallbackArtifact: `# Safe Staging Dry-Run Patch\n- Trigger: Operator rejected live gateway push\n- Production State: Unchanged (zero live customer impact)\n- Next Safe Action: Replay burst load test in staging first.`
            }
        },
        webhook: {
            goal: "Build a real-time webhook ingestion & alert router with FastAPI, verify signature checks, and promote a 15% canary release.",
            triage: {
                domain: "Event Ingestion & Alerting",
                risk: "HIGH (Canary Deploy)",
                summary: "Builds router + unit tests autonomously, passes AST verification, and gates 15% production rollout behind human approval."
            },
            thoughts: [
                { phase: "TRIAGE", title: "Analyzing incoming request", text: "Classifying webhook build as multi-stage: safe local code synthesis followed by gated canary release." },
                { phase: "PLAN", title: "Assembling 5-node DAG", text: "Mapping workspace scan, HMAC security design, webhook_router.py, AST suite, and canary release gate." },
                { phase: "VERIFY", title: "Running AST verification", text: "webhook_router.py verified cleanly (WebhookEvent, verify_signature, dispatch_with_backoff)." },
                { phase: "GATE", title: "Awaiting release approval", text: "All checks green. Paused at Human-in-the-Loop checkpoint before promoting 15% production canary." }
            ],
            nodes: [
                { id: "n1", step: 1, title: "Scan Workspace", tool: "scan_workspace()", risk: "low" },
                { id: "n2", step: 2, title: "Architect HMAC Retries", tool: "analyze_architecture()", risk: "low" },
                { id: "n3", step: 3, title: "Build webhook_router.py", tool: "generate_artifact()", risk: "med" },
                { id: "n4", step: 4, title: "Verify Python AST", tool: "run_verification_suite()", risk: "low" },
                { id: "n5", step: 5, title: "Deploy Canary Release", tool: "deploy_release()", risk: "high" }
            ],
            artifactName: "webhook_router.py",
            artifactCode: `@router.post("/webhooks/ingest", status_code=202)\nasync def ingest_webhook(event: WebhookEvent):\n    attempts = await dispatch_with_backoff(event, max_retries=3)\n    channel = "pager-oncall" if event.severity == "critical" else "ops-telemetry"\n    return {"accepted": True, "attempts": attempts, "channel": channel}`,
            checkpoint: {
                title: "Approve deploy_release (15% Canary)",
                blast: "Promotes webhook-ingest-service to production at 15% canary traffic after AST checks pass.",
                payload: { service_name: "webhook-ingest-service", environment: "production", canary_percent: 15 },
                fallbackTitle: "Emit Safe Staging Manifest",
                fallbackTool: "generate_staging_patch()",
                fallbackArtifactName: "staging_dry_run_patch.md",
                fallbackArtifact: `# Staging Canary Manifest (Safe Detour)\n- Production traffic unchanged at 0%.\n- Canary package staged for manual smoke testing.`
            }
        },
        aws: {
            goal: "Investigate portfolio website 5xx spike & AWS Lambda throttles, draft incident report, and gate production alias rollback.",
            triage: {
                domain: "AWS Cloud & Website Ops (Phase 2)",
                risk: "HIGH (Lambda Rollback)",
                summary: "Probes site uptime & CloudWatch logs read-only, drafts root-cause report, and pauses before rolling back live Lambda."
            },
            thoughts: [
                { phase: "TRIAGE", title: "Triaging live website alert", text: "Prioritizing read-only HTTP & CloudWatch diagnostics so we gather facts without touching live traffic." },
                { phase: "EXECUTE", title: "Correlating CloudWatch traces", text: "Found 14 upstream timeout errors on Lambda v15; baseline v14 had 0.0% errors." },
                { phase: "VERIFY", title: "Drafting root-cause report", text: "Generated aws_incident_report.md summarizing impacted /api/chat endpoint & safe rollback option." },
                { phase: "GATE", title: "Requesting rollback sign-off", text: "Ready to point portfolio-assistant-prod alias from v15 back to stable v14. Awaiting human decision." }
            ],
            nodes: [
                { id: "n1", step: 1, title: "Probe Website Uptime", tool: "check_website_health()", risk: "low" },
                { id: "n2", step: 2, title: "Query CloudWatch Logs", tool: "fetch_cloudwatch_logs()", risk: "low" },
                { id: "n3", step: 3, title: "Inspect Lambda Metrics", tool: "inspect_lambda_metrics()", risk: "low" },
                { id: "n4", step: 4, title: "Draft Incident Report", tool: "draft_incident_report()", risk: "low" },
                { id: "n5", step: 5, title: "Rollback Lambda Alias", tool: "rollback_lambda_alias()", risk: "high" }
            ],
            artifactName: "aws_incident_report.md",
            artifactCode: `# Phase 2 Incident Report (Preview)\n- Impacted Route: /api/chat (502 spike, 1840ms p95)\n- CloudWatch Evidence: 14 timeout entries on Lambda v15\n- Stable Baseline: v14 (0.0% errors)\n- Recommendation: Roll back prod alias v15 -> v14 via HITL gate.`,
            checkpoint: {
                title: "Approve rollback_lambda_alias (v15 -> v14)",
                blast: "Re-points live AWS Lambda production alias back to v14 immediately.",
                payload: { function_name: "portfolio-assistant-prod", alias: "prod", target_version: "v14" },
                fallbackTitle: "Save Manual Rollback Checklist",
                fallbackTool: "draft_incident_report()",
                fallbackArtifactName: "safe_rollback_checklist.md",
                fallbackArtifact: `# Manual AWS Rollback Checklist\n- Operator kept live Lambda v15 untouched.\n- CLI command & CloudWatch watch metrics exported for manual review.`
            }
        }
    };

    const el = {
        scPills: document.querySelectorAll(".sc-pill"),
        btnRun: document.getElementById("btn-run-demo"),
        btnReset: document.getElementById("btn-reset-demo"),
        statusPill: document.getElementById("demo-status-pill"),
        goalText: document.getElementById("demo-goal-text"),
        triageBadge: document.getElementById("demo-triage-badge"),
        triageBody: document.getElementById("demo-triage-body"),
        thinkDot: document.getElementById("demo-think-dot"),
        thoughtCount: document.getElementById("demo-thought-count"),
        thoughtsFeed: document.getElementById("demo-thoughts-feed"),
        dagStage: document.getElementById("demo-dag-stage"),
        dagSvg: document.getElementById("demo-dag-svg"),
        dagGrid: document.getElementById("demo-dag-grid"),
        verifiedBadge: document.getElementById("demo-verified-badge"),
        artTabs: document.getElementById("demo-artifact-tabs"),
        artBody: document.getElementById("demo-artifact-body"),
        hitlBox: document.getElementById("demo-hitl-box"),
        hitlBadge: document.getElementById("demo-hitl-badge"),
        hitlBody: document.getElementById("demo-hitl-body"),
        wsCount: document.getElementById("demo-ws-count"),
        wsFeed: document.getElementById("demo-ws-feed")
    };

    let currentScenarioKey = "ratelimiter";
    let runToken = 0;
    let renderedNodes = [];
    let renderedEdges = [];
    let artifacts = [];
    let activeArt = null;
    let wsSeq = 0;

    function sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }

    function setStatus(label, cls) {
        el.statusPill.textContent = label;
        el.statusPill.className = `demo-status ${cls}`;
        el.thinkDot.classList.toggle("active", cls === "status-running");
    }

    function logWS(type, msg) {
        wsSeq += 1;
        if (wsSeq === 1) el.wsFeed.innerHTML = "";
        const row = document.createElement("div");
        row.className = "ws-item";
        row.innerHTML = `<div class="ws-item-top"><span>#${wsSeq} ${type}</span><span>live</span></div><div class="ws-item-msg"></div>`;
        row.querySelector(".ws-item-msg").textContent = msg;
        el.wsFeed.appendChild(row);
        el.wsFeed.scrollTop = el.wsFeed.scrollHeight;
        el.wsCount.textContent = `${wsSeq} events`;
    }

    function addThought(th) {
        if (el.thoughtsFeed.querySelector(".console-muted")) {
            el.thoughtsFeed.innerHTML = "";
        }
        const card = document.createElement("div");
        card.className = "thought-card";
        card.innerHTML = `
            <div class="thought-card-head">
                <span class="thought-phase">${th.phase}</span>
                <span class="thought-card-title"></span>
            </div>
            <div class="thought-card-text"></div>
        `;
        card.querySelector(".thought-card-title").textContent = th.title;
        card.querySelector(".thought-card-text").textContent = th.text;
        el.thoughtsFeed.appendChild(card);
        el.thoughtsFeed.scrollTop = el.thoughtsFeed.scrollHeight;
        el.thoughtCount.textContent = `${el.thoughtsFeed.children.length} notes`;
    }

    function renderDag() {
        if (!renderedNodes.length) {
            el.dagGrid.innerHTML = `<div class="console-muted" style="grid-column: 1 / -1; text-align: center; padding: 1.5rem;">Task steps appear here node-by-node as the agent plans.</div>`;
            el.dagSvg.innerHTML = "";
            return;
        }
        el.dagGrid.innerHTML = "";
        renderedNodes.forEach((n) => {
            const div = document.createElement("div");
            div.className = `demo-node node-${n.status || "pending"} ${n.isFallback ? "node-fallback" : ""}`;
            div.dataset.nodeId = n.id;
            const riskLabel = n.risk === "high" ? "HITL GATE" : n.risk;
            div.innerHTML = `
                <div class="demo-node-top">
                    <span>STEP ${n.step}</span>
                    <span class="demo-risk-pill demo-risk-${n.risk}">${riskLabel}</span>
                </div>
                <div class="demo-node-title"></div>
                <div class="demo-node-tool"></div>
            `;
            div.querySelector(".demo-node-title").textContent = n.title;
            div.querySelector(".demo-node-tool").textContent = n.tool;
            el.dagGrid.appendChild(div);
        });
        requestAnimationFrame(drawDagEdges);
    }

    function drawDagEdges() {
        const sRect = el.dagStage.getBoundingClientRect();
        el.dagSvg.setAttribute("viewBox", `0 0 ${Math.max(1, sRect.width)} ${Math.max(1, sRect.height)}`);
        const paths = renderedEdges.map((e) => {
            const src = el.dagGrid.querySelector(`[data-node-id="${e.source}"]`);
            const dst = el.dagGrid.querySelector(`[data-node-id="${e.target}"]`);
            if (!src || !dst) return "";
            const a = src.getBoundingClientRect();
            const b = dst.getBoundingClientRect();
            const ax = a.left - sRect.left + a.width / 2;
            const ay = a.top - sRect.top + a.height / 2;
            const bx = b.left - sRect.left + b.width / 2;
            const by = b.top - sRect.top + b.height / 2;
            let d;
            if (Math.abs(ay - by) < 30 && bx > ax) {
                const x1 = a.right - sRect.left;
                const x2 = b.left - sRect.left;
                const mx = (x1 + x2) / 2;
                d = `M ${x1} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${x2} ${by}`;
            } else {
                const y1 = a.bottom - sRect.top;
                const y2 = b.top - sRect.top;
                const my = (y1 + y2) / 2;
                d = `M ${ax} ${y1} C ${ax} ${my}, ${bx} ${my}, ${bx} ${y2}`;
            }
            const color = e.kind === "fallback" ? "#34d399" : "rgba(124, 196, 255, 0.5)";
            const dash = e.kind === "fallback" ? 'stroke-dasharray="5 4"' : "";
            return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2" ${dash} />`;
        });
        el.dagSvg.innerHTML = paths.join("");
    }

    function renderArtifacts() {
        if (!artifacts.length) {
            el.artTabs.innerHTML = "";
            el.artBody.innerHTML = `<div class="console-muted">Code or incident reports built by the agent appear here with automatic safety checks.</div>`;
            return;
        }
        el.artTabs.innerHTML = "";
        artifacts.forEach((a) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `art-tab ${activeArt === a.name ? "active" : ""}`;
            btn.textContent = a.verified ? `${a.name} ✓` : a.name;
            btn.addEventListener("click", () => {
                activeArt = a.name;
                renderArtifacts();
            });
            el.artTabs.appendChild(btn);
        });
        const current = artifacts.find((a) => a.name === activeArt) || artifacts[0];
        el.artBody.innerHTML = `<pre class="artifact-pre"></pre>`;
        el.artBody.querySelector(".artifact-pre").textContent = current.code;
    }

    function resetDemo() {
        runToken += 1;
        const sc = SCENARIOS[currentScenarioKey];
        el.goalText.textContent = sc.goal;
        setStatus("READY", "status-ready");
        el.btnRun.disabled = false;
        el.triageBadge.textContent = "Standby";
        el.triageBody.innerHTML = `<div class="console-muted">Press <strong>Run Interactive Demo</strong> to watch the agent score risk and plan tools.</div>`;
        el.thoughtsFeed.innerHTML = `<div class="console-muted">Live step-by-step reasoning streams here in plain English...</div>`;
        el.thoughtCount.textContent = "0 notes";
        renderedNodes = [];
        renderedEdges = [];
        renderDag();
        artifacts = [];
        activeArt = null;
        el.verifiedBadge.classList.add("hidden");
        renderArtifacts();
        el.hitlBox.classList.remove("hitl-alert");
        el.hitlBadge.textContent = "Armed";
        el.hitlBody.innerHTML = `<div class="hitl-standby"><span class="hitl-shield" aria-hidden="true">&#128737;</span><p>When the AI reaches a high-impact action (like updating production limits), execution freezes here until you decide.</p></div>`;
        wsSeq = 0;
        el.wsCount.textContent = "0 events";
        el.wsFeed.innerHTML = `<div class="console-muted">Every action, pause, and human decision is logged live with timestamps.</div>`;
    }

    async function runDemo() {
        resetDemo();
        const token = runToken;
        const sc = SCENARIOS[currentScenarioKey];
        el.btnRun.disabled = true;
        setStatus("THINKING & BUILDING", "status-running");

        logWS("run.started", `Dispatched scenario (${sc.triage.domain})`);
        addThought(sc.thoughts[0]);
        await sleep(520);
        if (token !== runToken) return;

        // Triage complete
        el.triageBadge.textContent = "HIGH GATE";
        el.triageBody.innerHTML = `
            <div style="font-weight:650; color:#f8fafc; margin-bottom:4px;">${sc.triage.domain}</div>
            <div style="color:#94a3b8; font-size:0.76rem; margin-bottom:4px;">Risk Tier: <strong style="color:#fbbf24;">${sc.triage.risk}</strong></div>
            <div style="color:#cbd5e1; font-size:0.76rem;">${sc.triage.summary}</div>
        `;
        logWS("triage.completed", sc.triage.summary);

        // Planning DAG step by step
        addThought(sc.thoughts[1]);
        for (let i = 0; i < sc.nodes.length; i++) {
            if (token !== runToken) return;
            const node = { ...sc.nodes[i], status: "pending" };
            renderedNodes.push(node);
            if (i > 0) {
                renderedEdges.push({ source: sc.nodes[i - 1].id, target: node.id, kind: "normal" });
            }
            renderDag();
            logWS("plan.updated", `Added step ${node.step}: ${node.title}`);
            await sleep(260);
        }

        // Execute steps 1..4 autonomously
        for (let i = 0; i < 4; i++) {
            if (token !== runToken) return;
            renderedNodes[i].status = "running";
            renderDag();
            logWS("tool.called", `Running ${renderedNodes[i].tool}`);
            await sleep(420);
            if (token !== runToken) return;

            if (i === 2) {
                artifacts.push({ name: sc.artifactName, code: sc.artifactCode, verified: false });
                activeArt = sc.artifactName;
                renderArtifacts();
                logWS("artifact.created", `Generated ${sc.artifactName}`);
            }
            if (i === 3) {
                addThought(sc.thoughts[2]);
                if (artifacts[0]) artifacts[0].verified = true;
                el.verifiedBadge.classList.remove("hidden");
                renderArtifacts();
                logWS("tool.result", "AST syntax & structural checks passed (100% green)");
            }
            renderedNodes[i].status = "completed";
            renderDag();
            await sleep(240);
        }

        // Step 5: Pause at Human-in-the-Loop Gate
        if (token !== runToken) return;
        renderedNodes[4].status = "awaiting_approval";
        renderDag();
        addThought(sc.thoughts[3]);
        setStatus("AWAITING HUMAN APPROVAL", "status-paused");
        logWS("checkpoint.requested", `PAUSED before ${renderedNodes[4].tool}`);
        renderHitlPrompt(sc, token);
    }

    function renderHitlPrompt(sc, token) {
        el.hitlBox.classList.add("hitl-alert");
        el.hitlBadge.textContent = "ACTION REQUIRED";
        el.hitlBody.innerHTML = `
            <div style="font-weight:650; color:#f8fafc; font-size:0.81rem;">${sc.checkpoint.title}</div>
            <div class="hitl-blast-note">${sc.checkpoint.blast}</div>
            <label class="hitl-field-label" for="demo-hitl-json">Proposed Action Settings (Editable)</label>
            <textarea id="demo-hitl-json" class="hitl-json-edit">${JSON.stringify(sc.checkpoint.payload, null, 2)}</textarea>
            <label class="hitl-field-label" for="demo-hitl-note">Optional Note / Reason</label>
            <input id="demo-hitl-note" class="hitl-note-field" type="text" placeholder="e.g. Hold live push - test in staging first">
            <div class="hitl-btn-grid">
                <button type="button" id="demo-btn-approve" class="hitl-btn hitl-btn-approve">Approve &amp; Execute</button>
                <button type="button" id="demo-btn-modify" class="hitl-btn hitl-btn-modify">Modify &amp; Approve</button>
                <button type="button" id="demo-btn-reject" class="hitl-btn hitl-btn-reject">Reject &amp; Safe Re-plan</button>
            </div>
        `;

        document.getElementById("demo-btn-approve").addEventListener("click", () => resolveCheckpoint("approve", sc, token));
        document.getElementById("demo-btn-modify").addEventListener("click", () => resolveCheckpoint("modify", sc, token));
        document.getElementById("demo-btn-reject").addEventListener("click", () => resolveCheckpoint("reject", sc, token));
    }

    async function resolveCheckpoint(action, sc, token) {
        if (token !== runToken) return;
        const note = document.getElementById("demo-hitl-note")?.value?.trim() || "";
        const rawJson = document.getElementById("demo-hitl-json")?.value || "{}";

        if (action === "modify") {
            try { JSON.parse(rawJson); } catch (err) {
                alert("Please fix the JSON syntax before clicking Modify & Approve.");
                return;
            }
        }

        el.hitlBox.classList.remove("hitl-alert");
        setStatus("RESUMING", "status-running");

        if (action === "reject") {
            el.hitlBadge.textContent = "REJECTED";
            el.hitlBody.innerHTML = `<div style="color:#fda4af; font-size:0.8rem;"><strong>Operator Rejected</strong> &mdash; production left untouched.${note ? `<br>Note: "${note}"` : ""}</div>`;
            renderedNodes[4].status = "rejected";
            renderDag();
            logWS("checkpoint.resolved", "Rejected by human — inserting safe staging fallback");
            addThought({
                phase: "RE-PLAN",
                title: "Pivoting to Safe Fallback Branch",
                text: `Operator declined ${renderedNodes[4].tool}. Keeping production untouched and generating a safe dry-run staging patch instead.`
            });
            await sleep(500);
            if (token !== runToken) return;

            const fb = {
                id: "n6",
                step: 6,
                title: sc.checkpoint.fallbackTitle,
                tool: sc.checkpoint.fallbackTool,
                risk: "low",
                status: "completed",
                isFallback: true
            };
            renderedNodes.push(fb);
            renderedEdges.push({ source: "n5", target: "n6", kind: "fallback" });
            renderDag();

            artifacts.push({ name: sc.checkpoint.fallbackArtifactName, code: sc.checkpoint.fallbackArtifact, verified: true });
            activeArt = sc.checkpoint.fallbackArtifactName;
            renderArtifacts();
            logWS("artifact.created", `Safe fallback: ${sc.checkpoint.fallbackArtifactName}`);
        } else {
            const label = action === "modify" ? "MODIFIED & APPROVED" : "APPROVED";
            el.hitlBadge.textContent = label;
            el.hitlBody.innerHTML = `<div style="color:#34d399; font-size:0.8rem;"><strong>${label}</strong> &mdash; gated action executed cleanly.</div>`;
            logWS("checkpoint.resolved", `${label} by operator`);
            renderedNodes[4].status = "running";
            renderDag();
            await sleep(480);
            if (token !== runToken) return;
            renderedNodes[4].status = "completed";
            renderDag();
            logWS("tool.result", `Completed ${renderedNodes[4].tool}`);
        }

        setStatus("COMPLETED", "status-done");
        logWS("run.completed", "Workflow complete with full audit log.");
        el.btnRun.disabled = false;
    }

    el.scPills.forEach((pill) => {
        pill.addEventListener("click", () => {
            el.scPills.forEach((p) => p.classList.toggle("active", p === pill));
            currentScenarioKey = pill.getAttribute("data-scenario");
            resetDemo();
        });
    });

    el.btnRun.addEventListener("click", runDemo);
    el.btnReset.addEventListener("click", resetDemo);
    window.addEventListener("resize", () => requestAnimationFrame(drawDagEdges));

    resetDemo();
})();

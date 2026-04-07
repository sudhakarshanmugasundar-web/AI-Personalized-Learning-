// ============================================================
// AI Tutor Chatbot — OpenAI Powered | AI Personalized Learning
// ============================================================
(function () {
  'use strict';

  const API_BASE = 'http://localhost:8080';
  const CHAT_ENDPOINT = `${API_BASE}/chat`;
  const MAX_HISTORY = 20; // Max messages to keep in context

  /* ── DETECT CONTEXT FROM PAGE ── */
  function getPageContext() {
    const params = new URLSearchParams(window.location.search);
    const course = params.get('course') || localStorage.getItem('ailearn_course') || '';
    const level  = params.get('level')  || localStorage.getItem('ailearn_level')  || '';
    const user   = localStorage.getItem('ailearn_user') || 'Student';
    return { course, level, user };
  }

  function getCourseLabel(course) {
    const map = { java: '☕ Java', python: '🐍 Python', english: '🗣️ English' };
    return map[course] || '🤖 AI Tutor';
  }

  function getCourseChips(course) {
    const chips = {
      java: [
        { label: 'For Loop',    q: 'Explain for loop in Java with example' },
        { label: 'OOP',         q: 'What is OOP in Java? Explain with example' },
        { label: 'Arrays',      q: 'How do arrays work in Java?' },
        { label: 'Recursion',   q: 'What is recursion? Show me an example in Java' },
        { label: 'Exceptions',  q: 'How does exception handling work in Java?' },
        { label: 'Quiz Me!',    q: 'Give me an MCQ quiz question on Java concepts' },
      ],
      python: [
        { label: 'For Loop',    q: 'Explain for loop in Python with example' },
        { label: 'Lists',       q: 'How do lists work in Python?' },
        { label: 'Functions',   q: 'How do I define a function in Python?' },
        { label: 'OOP',         q: 'Explain OOP concepts in Python with an example' },
        { label: 'Lambda',      q: 'What is a lambda function in Python?' },
        { label: 'Quiz Me!',    q: 'Give me an MCQ quiz question on Python concepts' },
      ],
      english: [
        { label: 'Grammar',     q: 'Explain present tense and past tense with examples' },
        { label: 'Pronunciation', q: 'Give me tips to improve my English pronunciation' },
        { label: 'Vocabulary',  q: 'Teach me 5 useful English words with meanings and sentences' },
        { label: 'Speaking',    q: 'Give me a 1-minute speaking exercise on daily routine' },
        { label: 'Correct Me',  q: 'Check my sentence: "I am go to the market"' },
        { label: 'Practice',    q: 'Give me a fill-in-the-blank exercise in English' },
      ],
    };
    return chips[course] || [
      { label: 'Java Loops',   q: 'Explain for loop in Java with example' },
      { label: 'Python Lists', q: 'How do lists work in Python?' },
      { label: 'English Tips', q: 'Give me tips to improve my spoken English' },
      { label: 'Quiz Me!',     q: 'Give me a quiz question to test my knowledge' },
      { label: 'Debug Code',   q: 'What are common Java/Python errors beginners make?' },
    ];
  }

  /* ── STYLES ── */
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

    /* ── CHATBOT BUTTON ── */
    .aicb-fab {
      position: fixed; bottom: 28px; right: 28px;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #6c63ff 0%, #38bdf8 100%);
      color: #fff; font-size: 26px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 24px rgba(108,99,255,0.55);
      cursor: pointer; z-index: 9999; border: none;
      transition: transform 0.25s cubic-bezier(.175,.885,.32,1.275), box-shadow 0.25s;
      animation: aicb-pulse 2.8s ease-in-out infinite;
    }
    .aicb-fab:hover { transform: scale(1.12) translateY(-2px); box-shadow: 0 10px 36px rgba(108,99,255,0.7); }
    @keyframes aicb-pulse {
      0%,100% { box-shadow: 0 6px 24px rgba(108,99,255,0.55), 0 0 0 0 rgba(108,99,255,0.4); }
      50%      { box-shadow: 0 6px 24px rgba(108,99,255,0.55), 0 0 0 10px rgba(108,99,255,0); }
    }
    .aicb-badge {
      position: absolute; top: -4px; right: -4px;
      background: #22c55e; color: #fff;
      width: 18px; height: 18px; border-radius: 50%;
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #0a0a1a; display: none;
    }

    /* ── CHAT WINDOW ── */
    .aicb-window {
      position: fixed; bottom: 104px; right: 28px;
      width: 400px; height: 580px;
      background: rgba(12,12,26,0.97);
      backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
      border: 1px solid rgba(108,99,255,0.25);
      border-radius: 24px;
      display: none; flex-direction: column;
      z-index: 9999;
      box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(108,99,255,0.1);
      overflow: hidden;
      font-family: 'Inter', system-ui, sans-serif;
      transform-origin: bottom right;
      animation: aicb-open 0.22s cubic-bezier(.175,.885,.32,1.275) both;
    }
    @keyframes aicb-open {
      from { opacity: 0; transform: scale(0.85) translateY(20px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .aicb-window.visible { display: flex; }

    /* ── HEADER ── */
    .aicb-header {
      padding: 14px 18px;
      background: linear-gradient(90deg, rgba(108,99,255,0.2), rgba(56,189,248,0.1));
      border-bottom: 1px solid rgba(255,255,255,0.07);
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    .aicb-header-left { display: flex; align-items: center; gap: 10px; }
    .aicb-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg, #6c63ff, #38bdf8);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(108,99,255,0.4);
    }
    .aicb-title { color: #fff; font-size: 0.9rem; font-weight: 700; margin: 0; }
    .aicb-subtitle { color: #4ade80; font-size: 0.7rem; display: flex; align-items: center; gap: 4px; }
    .aicb-status-dot {
      width: 7px; height: 7px; border-radius: 50%; background: #4ade80;
      box-shadow: 0 0 6px #4ade80;
    }
    .aicb-header-actions { display: flex; align-items: center; gap: 6px; }
    .aicb-action-btn {
      background: rgba(255,255,255,0.08); border: none; color: rgba(255,255,255,0.7);
      cursor: pointer; font-size: 14px; width: 28px; height: 28px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      transition: background 0.2s, color 0.2s; line-height: 1;
    }
    .aicb-action-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
    .aicb-course-badge {
      padding: 3px 10px; border-radius: 100px;
      font-size: 0.68rem; font-weight: 600;
      background: rgba(108,99,255,0.2); color: #a5b4fc;
      border: 1px solid rgba(108,99,255,0.3);
    }

    /* ── TOPIC CHIPS ── */
    .aicb-chips {
      display: flex; gap: 6px; padding: 8px 14px;
      overflow-x: auto; flex-shrink: 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      scrollbar-width: none;
    }
    .aicb-chips::-webkit-scrollbar { display: none; }
    .aicb-chip {
      padding: 4px 11px;
      background: rgba(108,99,255,0.13);
      border: 1px solid rgba(108,99,255,0.22);
      border-radius: 100px;
      font-size: 0.7rem; font-weight: 500;
      color: #a5b4fc; white-space: nowrap;
      cursor: pointer; transition: all 0.18s; flex-shrink: 0;
    }
    .aicb-chip:hover {
      background: rgba(108,99,255,0.28); color: #fff;
      border-color: rgba(108,99,255,0.5);
      transform: translateY(-1px);
    }

    /* ── MESSAGES ── */
    .aicb-msgs {
      flex: 1; padding: 14px; overflow-y: auto;
      display: flex; flex-direction: column; gap: 12px;
      scrollbar-width: thin; scrollbar-color: rgba(108,99,255,0.3) transparent;
    }
    .aicb-msgs::-webkit-scrollbar { width: 4px; }
    .aicb-msgs::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.35); border-radius: 4px; }

    .aicb-msg-group { display: flex; flex-direction: column; gap: 4px; }
    .aicb-msg-group.user { align-items: flex-end; }
    .aicb-msg-group.bot  { align-items: flex-start; }

    .aicb-msg {
      max-width: 88%; padding: 10px 14px;
      border-radius: 18px; font-size: 0.855rem; line-height: 1.55;
      animation: aicb-msg-in 0.2s ease-out both;
    }
    @keyframes aicb-msg-in {
      from { opacity: 0; transform: translateY(10px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .aicb-msg.user {
      background: linear-gradient(135deg, #6c63ff, #5a52e0);
      color: #fff; border-bottom-right-radius: 5px;
    }
    .aicb-msg.bot {
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.09);
      color: #e2e8f0; border-bottom-left-radius: 5px;
      position: relative;
    }
    .aicb-msg.error {
      background: rgba(239,68,68,0.12);
      border: 1px solid rgba(239,68,68,0.25);
      color: #fca5a5;
    }

    .aicb-ts {
      font-size: 0.62rem; color: rgba(255,255,255,0.3);
      padding: 0 4px;
    }

    /* ── MARKDOWN RENDERING ── */
    .aicb-msg.bot strong { color: #e2e8f0; font-weight: 700; }
    .aicb-msg.bot em    { color: #a5b4fc; font-style: italic; }
    .aicb-msg.bot h3    { color: #818cf8; font-size: 0.9rem; font-weight: 700; margin: 8px 0 4px; }
    .aicb-msg.bot ul, .aicb-msg.bot ol {
      margin: 6px 0 6px 16px; padding: 0;
    }
    .aicb-msg.bot li { margin-bottom: 3px; }
    .aicb-msg.bot p  { margin: 4px 0; }

    /* ── CODE BLOCKS ── */
    .aicb-code-wrap {
      margin: 8px 0 0; border-radius: 10px; overflow: hidden;
      border: 1px solid rgba(108,99,255,0.25);
    }
    .aicb-code-header {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(108,99,255,0.15); padding: 6px 12px;
    }
    .aicb-code-lang {
      font-size: 0.68rem; font-weight: 700; color: #a5b4fc;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .aicb-copy-btn {
      background: rgba(255,255,255,0.08); border: none; color: rgba(255,255,255,0.6);
      cursor: pointer; font-size: 0.68rem; font-weight: 600;
      padding: 3px 8px; border-radius: 6px;
      transition: background 0.2s, color 0.2s;
    }
    .aicb-copy-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
    .aicb-code-body {
      background: rgba(0,0,0,0.5); padding: 12px;
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: 0.78rem; line-height: 1.6;
      color: #7dd3fc; overflow-x: auto;
      white-space: pre;
    }
    .aicb-code-body::-webkit-scrollbar { height: 3px; }
    .aicb-code-body::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.4); }

    /* ── INLINE CODE ── */
    .aicb-msg.bot code {
      background: rgba(108,99,255,0.2); color: #a5b4fc;
      padding: 1px 5px; border-radius: 4px;
      font-family: 'JetBrains Mono', monospace; font-size: 0.82em;
    }

    /* ── TYPING INDICATOR ── */
    .aicb-typing {
      display: flex; gap: 5px; align-items: center;
      padding: 10px 14px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 18px; border-bottom-left-radius: 5px;
      width: fit-content;
    }
    .aicb-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: rgba(108,99,255,0.7);
      animation: aicb-bounce 1.2s ease-in-out infinite;
    }
    .aicb-dot:nth-child(2) { animation-delay: 0.2s; }
    .aicb-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes aicb-bounce {
      0%,80%,100% { transform: translateY(0); opacity: 0.6; }
      40%          { transform: translateY(-6px); opacity: 1; }
    }

    /* ── INPUT AREA ── */
    .aicb-input-area {
      padding: 12px 14px; border-top: 1px solid rgba(255,255,255,0.07);
      display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0;
      background: rgba(0,0,0,0.2);
    }
    .aicb-input-wrap { flex: 1; position: relative; }
    .aicb-input {
      width: 100%;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px; padding: 10px 16px;
      color: #fff; outline: none; font-size: 0.855rem;
      font-family: inherit; resize: none; min-height: 42px; max-height: 120px;
      transition: border-color 0.2s, background 0.2s;
      line-height: 1.5;
    }
    .aicb-input::placeholder { color: rgba(255,255,255,0.3); }
    .aicb-input:focus {
      border-color: rgba(108,99,255,0.5);
      background: rgba(255,255,255,0.09);
    }
    .aicb-send {
      background: linear-gradient(135deg, #6c63ff, #5a52e0);
      border: none; border-radius: 50%;
      width: 40px; height: 40px; color: #fff;
      cursor: pointer; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
      box-shadow: 0 4px 14px rgba(108,99,255,0.4);
    }
    .aicb-send:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 6px 20px rgba(108,99,255,0.6); }
    .aicb-send:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

    /* ── FOOTER NOTE ── */
    .aicb-footer {
      padding: 6px 14px 8px;
      font-size: 0.62rem; color: rgba(255,255,255,0.22);
      text-align: center; flex-shrink: 0;
      border-top: none;
    }

    /* ── API KEY BANNER ── */
    .aicb-api-banner {
      margin: 8px 14px; padding: 10px 12px;
      background: rgba(251,191,36,0.12);
      border: 1px solid rgba(251,191,36,0.3);
      border-radius: 12px; font-size: 0.75rem;
      color: #fcd34d; display: none; line-height: 1.4;
    }
    .aicb-api-banner.show { display: block; }
    .aicb-api-banner strong { display: block; margin-bottom: 2px; }
  `;

  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.id = 'aicb-styles';
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* ── BUILD UI ── */
  const ctx = getPageContext();
  const chips = getCourseChips(ctx.course);

  const chipsHTML = chips.map(c =>
    `<button class="aicb-chip" data-q="${encodeURIComponent(c.q)}">${c.label}</button>`
  ).join('');

  const tpl = `
    <button class="aicb-fab" id="aicbFab" aria-label="Open AI Tutor Chat">
      🤖
      <span class="aicb-badge" id="aicbBadge"></span>
    </button>
    <div class="aicb-window" id="aicbWindow" role="dialog" aria-label="AI Tutor Chatbot" aria-modal="true">
      <div class="aicb-header">
        <div class="aicb-header-left">
          <div class="aicb-avatar">🤖</div>
          <div>
            <p class="aicb-title">AI Tutor</p>
            <span class="aicb-subtitle">
              <span class="aicb-status-dot"></span>
              Online — Ready to help
            </span>
          </div>
        </div>
        <div class="aicb-header-actions">
          ${ctx.course ? `<span class="aicb-course-badge" id="aicbCourseBadge">${getCourseLabel(ctx.course)}</span>` : ''}
          <button class="aicb-action-btn" id="aicbClear" title="Clear chat" aria-label="Clear chat">🗑</button>
          <button class="aicb-action-btn" id="aicbClose" aria-label="Close chat">✕</button>
        </div>
      </div>

      <div class="aicb-chips" id="aicbChips">${chipsHTML}</div>

      <div class="aicb-api-banner" id="aicbApiBanner">
        <strong>⚠️ API Key Required</strong>
        Set <code>OPENAI_API_KEY</code> env variable and restart the server to enable AI responses.
      </div>

      <div class="aicb-msgs" id="aicbMsgs" aria-live="polite" aria-label="Chat messages"></div>

      <div class="aicb-input-area">
        <div class="aicb-input-wrap">
          <textarea
            class="aicb-input" id="aicbInput"
            placeholder="Ask anything… (Shift+Enter for new line)"
            rows="1" autocomplete="off" spellcheck="true"
            aria-label="Chat input"
          ></textarea>
        </div>
        <button class="aicb-send" id="aicbSend" aria-label="Send message" disabled>
          ➤
        </button>
      </div>
      <div class="aicb-footer">Powered by OpenAI GPT · AI Personalized Learning</div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', tpl);

  /* ── REFS ── */
  const fab    = document.getElementById('aicbFab');
  const win    = document.getElementById('aicbWindow');
  const close  = document.getElementById('aicbClose');
  const clear  = document.getElementById('aicbClear');
  const msgs   = document.getElementById('aicbMsgs');
  const input  = document.getElementById('aicbInput');
  const sendBtn= document.getElementById('aicbSend');
  const chipsCon=document.getElementById('aicbChips');
  const apiBanner = document.getElementById('aicbApiBanner');
  const badge = document.getElementById('aicbBadge');

  /* ── STATE ── */
  let chatHistory = []; // [{role:'user'|'assistant', content:'...'}]
  let isLoading = false;
  let unreadCount = 0;

  /* ── UTILITY: TIMESTAMP ── */
  function nowTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /* ── UTILITY: MARKDOWN RENDERER ── */
  function renderMarkdown(text) {
    // Escape HTML entities first (except we'll insert our own tags)
    let html = text;

    // 1. Fenced code blocks: ```lang\ncode\n```
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const langLabel = lang || 'code';
      const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const id = 'cb' + Math.random().toString(36).slice(2,8);
      return `<div class="aicb-code-wrap">
        <div class="aicb-code-header">
          <span class="aicb-code-lang">${langLabel}</span>
          <button class="aicb-copy-btn" data-cbid="${id}" onclick="aicbCopyCode('${id}')">Copy</button>
        </div>
        <pre class="aicb-code-body" id="${id}">${escaped}</pre>
      </div>`;
    });

    // 2. Inline code: `code`
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // 3. Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // 4. Italic: *text* or _text_
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // 5. Headers: ### text
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');

    // 6. Unordered lists: - item or • item
    html = html.replace(/^[-•*]\s+(.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> items
    html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);

    // 7. Numbered lists: 1. item
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    // Already handled above wrapping

    // 8. Line breaks → <br> (except inside code blocks)
    // Split on newlines and preserve structure
    html = html.replace(/\n/g, '<br>');

    // Cleanup: remove double <br> around block elements
    html = html.replace(/<br><br>(<(?:ul|ol|h3|div))/g, '<br>$1');
    html = html.replace(/(<\/(?:ul|ol|h3|div)>)<br>/g, '$1');

    return html;
  }

  /* ── UTILITY: COPY CODE ── */
  window.aicbCopyCode = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    navigator.clipboard.writeText(el.textContent).then(() => {
      const btn = document.querySelector(`[data-cbid="${id}"]`);
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy', 1500); }
    });
  };

  /* ── ADD MESSAGE ── */
  function addMessage(role, text, opts = {}) {
    const group = document.createElement('div');
    group.className = `aicb-msg-group ${role}`;

    const bubble = document.createElement('div');
    bubble.className = `aicb-msg ${role}${opts.error ? ' error' : ''}`;

    if (role === 'bot') {
      bubble.innerHTML = renderMarkdown(text);
    } else {
      // User messages: plain text with HTML escaping
      bubble.textContent = text;
    }

    const ts = document.createElement('span');
    ts.className = 'aicb-ts';
    ts.textContent = nowTime();

    group.appendChild(bubble);
    group.appendChild(ts);
    msgs.appendChild(group);
    scrollToBottom();
    return bubble;
  }

  function scrollToBottom() {
    requestAnimationFrame(() => { msgs.scrollTop = msgs.scrollHeight; });
  }

  /* ── TYPING INDICATOR ── */
  let typingEl = null;
  function showTyping() {
    const group = document.createElement('div');
    group.className = 'aicb-msg-group bot';
    group.id = 'aicbTyping';
    const t = document.createElement('div');
    t.className = 'aicb-typing';
    t.innerHTML = '<span class="aicb-dot"></span><span class="aicb-dot"></span><span class="aicb-dot"></span>';
    group.appendChild(t);
    msgs.appendChild(group);
    scrollToBottom();
    typingEl = group;
  }
  function hideTyping() {
    if (typingEl) { typingEl.remove(); typingEl = null; }
    const old = document.getElementById('aicbTyping');
    if (old) old.remove();
  }

  /* ── WELCOME MESSAGE ── */
  function showWelcome() {
    const ctx2 = getPageContext();
    let greeting = `👋 Hi **${ctx2.user || 'there'}**! I'm your **AI Tutor**, powered by OpenAI.`;
    if (ctx2.course === 'java') {
      greeting += `\n\nI'm your **Java Programming Tutor** for this session. Ask me anything about:\n- Java syntax & concepts\n- Code examples & debugging\n- Practice problems & quizzes\n- OOP, arrays, loops, and more!`;
    } else if (ctx2.course === 'python') {
      greeting += `\n\nI'm your **Python Tutor** for this session. I can help with:\n- Python syntax & concepts\n- Lists, functions, OOP\n- Code examples & debugging\n- Practice problems & quizzes`;
    } else if (ctx2.course === 'english') {
      greeting += `\n\nI'm your **Spoken English Trainer** for this session. I can help with:\n- Grammar rules & corrections\n- Pronunciation tips\n- Vocabulary building\n- Speaking exercises & practice`;
    } else {
      greeting += `\n\nI cover **Java**, **Python**, and **Spoken English**. Click a topic chip above or ask me anything!`;
    }
    greeting += `\n\n💡 *Tap any chip above to get started instantly!*`;
    addMessage('bot', greeting);
  }

  /* ── SEND MESSAGE ── */
  async function sendMessage(text) {
    if (!text || isLoading) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    // Add user message to UI and history
    addMessage('user', trimmed);
    chatHistory.push({ role: 'user', content: trimmed });

    // Keep history bounded (MAX_HISTORY messages = MAX_HISTORY/2 turns)
    if (chatHistory.length > MAX_HISTORY) {
      chatHistory = chatHistory.slice(chatHistory.length - MAX_HISTORY);
    }

    isLoading = true;
    sendBtn.disabled = true;
    input.value = '';
    input.style.height = 'auto';

    showTyping();

    try {
      const ctx3 = getPageContext();
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({
          message: trimmed,
          history: chatHistory.slice(0, -1), // exclude the last user msg (server will add it)
          course: ctx3.course,
          level: ctx3.level,
          user: ctx3.user
        })
      });

      hideTyping();

      const data = await response.json();

      if (!response.ok || data.error) {
        // Handle specific errors
        if (data.error === 'API_KEY_NOT_SET') {
          apiBanner.classList.add('show');
          addMessage('bot', `⚠️ **API Key Not Configured**\n\nThe OpenAI API key is not set on the server. To fix this:\n\n1. Stop the server\n2. Run: \`export OPENAI_API_KEY=sk-your-key-here\`\n3. Restart with \`./run.sh\`\n\nGet your key at [platform.openai.com](https://platform.openai.com)`, { error: false });
        } else {
          addMessage('bot', `❌ **Something went wrong**\n\n${data.reply || data.error || 'Please try again.'}`, { error: true });
        }
        chatHistory.pop(); // Remove failed user message
      } else {
        const reply = data.reply;
        addMessage('bot', reply);
        chatHistory.push({ role: 'assistant', content: reply });

        // Show unread badge if window is closed
        if (!win.classList.contains('visible')) {
          unreadCount++;
          badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
          badge.style.display = 'flex';
        }
      }
    } catch (err) {
      hideTyping();
      chatHistory.pop(); // Remove failed user message

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        addMessage('bot', `🔌 **Cannot connect to server**\n\nMake sure the Java server is running:\n\`\`\`\n./run.sh\n\`\`\`\n\nServer should be at \`localhost:8080\``, { error: true });
      } else {
        addMessage('bot', `❌ **Error**: ${err.message}\n\nPlease try again.`, { error: true });
      }
    } finally {
      isLoading = false;
      sendBtn.disabled = !input.value.trim();
    }
  }

  /* ── TOGGLE WINDOW ── */
  function openChat() {
    win.classList.add('visible');
    // Reset animation
    win.style.animation = 'none';
    requestAnimationFrame(() => {
      win.style.animation = '';
    });
    unreadCount = 0;
    badge.style.display = 'none';
    input.focus();
    scrollToBottom();
  }

  function closeChat() {
    win.classList.remove('visible');
  }

  fab.addEventListener('click', () => {
    if (win.classList.contains('visible')) closeChat();
    else openChat();
  });
  close.addEventListener('click', closeChat);

  /* ── CLEAR CHAT ── */
  clear.addEventListener('click', () => {
    msgs.innerHTML = '';
    chatHistory = [];
    showWelcome();
  });

  /* ── INPUT HANDLING ── */
  input.addEventListener('input', () => {
    sendBtn.disabled = !input.value.trim() || isLoading;
    // Auto-resize textarea
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        sendMessage(input.value);
      }
    }
  });

  sendBtn.addEventListener('click', () => {
    if (!sendBtn.disabled) sendMessage(input.value);
  });

  /* ── CHIP CLICKS ── */
  chipsCon.addEventListener('click', e => {
    const chip = e.target.closest('.aicb-chip');
    if (!chip) return;
    const q = decodeURIComponent(chip.dataset.q);
    if (!win.classList.contains('visible')) openChat();
    sendMessage(q);
  });

  /* ── KEYBOARD SHORTCUT: Escape to close ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && win.classList.contains('visible')) closeChat();
  });

  /* ── INIT ── */
  showWelcome();

})();

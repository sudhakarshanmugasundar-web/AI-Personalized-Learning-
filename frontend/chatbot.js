(function() {
    const style = document.createElement('style');
    style.textContent = `
        #ai-chatbot-container {
            position: fixed; bottom: 30px; right: 30px; width: 380px; height: 500px;
            background: rgba(18, 18, 21, 0.95); backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.1); border-radius: 28px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6); display: none; flex-direction: column;
            z-index: 10000; overflow: hidden; animation: bot-slide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes bot-slide { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        
        #ai-chatbot-header {
            padding: 20px 24px; background: rgba(139, 92, 246, 0.1);
            border-bottom: 1px solid rgba(255,255,255,0.05); display: flex;
            align-items: center; justify-content: space-between;
        }
        .bot-brand { display: flex; align-items: center; gap: 10px; font-weight: 800; color: #8b5cf6; font-size: 0.9rem; }
        .bot-close { cursor: pointer; color: rgba(255,255,255,0.4); font-size: 1.2rem; transition: 0.2s; }
        .bot-close:hover { color: #f87171; }

        #ai-chat-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
        .chat-bubble { max-width: 80%; padding: 12px 16px; border-radius: 18px; font-size: 0.9rem; line-height: 1.5; font-weight: 500; }
        .bubble-bot { background: rgba(255,255,255,0.05); color: #fff; align-self: flex-start; border-bottom-left-radius: 4px; }
        .bubble-user { background: #8b5cf6; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }

        #ai-chat-input-wrap { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 10px; }
        #ai-chat-input { flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 16px; color: #fff; outline: none; transition: 0.2s; }
        #ai-chat-input:focus { border-color: #8b5cf6; }
        .send-btn { background: #8b5cf6; border: none; width: 40px; height: 40px; border-radius: 10px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }

        #bot-trigger {
            position: fixed; bottom: 30px; right: 30px; width: 64px; height: 64px;
            background: #8b5cf6; border-radius: 20px; display: flex;
            align-items: center; justify-content: center; cursor: pointer;
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4); z-index: 9999;
            transition: 0.3s;
        }
        #bot-trigger:hover { transform: scale(1.1) translateY(-5px); }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'ai-chatbot-container';
    container.innerHTML = `
        <div id="ai-chatbot-header">
            <div class="bot-brand">✨ AI TUTOR</div>
            <div class="bot-close" onclick="window.toggleChat()">×</div>
        </div>
        <div id="ai-chat-messages"></div>
        <div id="ai-chat-input-wrap">
            <input type="text" id="ai-chat-input" placeholder="Ask about your progress...">
            <button class="send-btn" onclick="window.sendChatMessage()">➜</button>
        </div>
    `;
    document.body.appendChild(container);

    const trigger = document.createElement('div');
    trigger.id = 'bot-trigger';
    trigger.innerHTML = `<span style="font-size:1.5rem">💬</span>`;
    trigger.onclick = () => window.toggleChat();
    document.body.appendChild(trigger);

    window.toggleChat = () => {
        const isOpen = container.style.display === 'flex';
        container.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen && document.getElementById('ai-chat-messages').children.length === 0) {
            addBubble("bot", "Hello! I'm your AI Tutor. I can help you with DSA, Machine Learning, and Aptitude based on your current performance. What's on your mind?");
        }
    };

    window.sendChatMessage = async () => {
        const input = document.getElementById('ai-chat-input');
        const text = input.value.trim();
        if (!text) return;

        addBubble("user", text);
        input.value = '';

        try {
            const res = await window.aiFetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            addBubble("bot", data.reply);
        } catch (e) {
            addBubble("bot", "The AI server is currently recalibrating. I'll be back online in a moment!");
        }
    };

    function addBubble(role, text) {
        const box = document.getElementById('ai-chat-messages');
        const b = document.createElement('div');
        b.className = `chat-bubble bubble-${role}`;
        b.innerText = text;
        box.appendChild(b);
        box.scrollTop = box.scrollHeight;
    }

    document.getElementById('ai-chat-input').onkeypress = (e) => {
        if (e.key === 'Enter') window.sendChatMessage();
    };
})();

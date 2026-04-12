/**
 * Shared Utilities for AI Personalized Learning
 */
(function() {
    window.AI_CONFIG = {
        API_BASE: "http://localhost:5001",
        RETRY_INTERVAL: 3000
    };

    let connectionOverlay = null;

    function createConnectionStatusUI() {
        if (connectionOverlay) return;
        
        const style = document.createElement('style');
        style.textContent = `
            #ai-connection-overlay {
                position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                background: rgba(15, 15, 15, 0.9); border: 1px solid rgba(139, 92, 246, 0.5);
                color: #8b5cf6; padding: 12px 24px; border-radius: 100px;
                display: flex; align-items: center; gap: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5); z-index: 99999;
                font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 0.9rem;
                pointer-events: none; transition: all 0.5s ease;
                opacity: 0; transform: translate(-50%, -20px);
            }
            #ai-connection-overlay.visible {
                opacity: 1; transform: translate(-50%, 0);
            }
            .ai-spinner {
                width: 16px; height: 16px; border: 2px solid rgba(139, 92, 246, 0.2);
                border-top-color: currentColor; border-radius: 50%;
                animation: ai-spin 1s linear infinite;
            }
            @keyframes ai-spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);

        connectionOverlay = document.createElement('div');
        connectionOverlay.id = 'ai-connection-overlay';
        connectionOverlay.innerHTML = '<div class="ai-spinner"></div> <span>Connecting to AI server...</span>';
        document.body.appendChild(connectionOverlay);
    }

    async function checkBackend() {
        try {
            const res = await fetch(window.AI_CONFIG.API_BASE + "/", { mode: 'cors' });
            if (res.ok) {
                hideStatus();
                return true;
            }
        } catch (e) {
            showStatus();
            return false;
        }
    }

    function showStatus() {
        if (!connectionOverlay) createConnectionStatusUI();
        connectionOverlay.classList.add('visible');
    }

    function hideStatus() {
        if (connectionOverlay) connectionOverlay.classList.remove('visible');
    }

    // Proxy for fetch to handle connection without blocking
    window.aiFetch = async function(endpoint, options = {}) {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000); // 3s timeout for API
            
            const res = await fetch(window.AI_CONFIG.API_BASE + endpoint, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return res;
        } catch (e) {
            console.error("aiFetch Error:", e);
            throw e; // Let the caller deal with it
        }
    };

    // Auto check on load
    document.addEventListener('DOMContentLoaded', () => {
        createConnectionStatusUI();
        checkBackend();
        setInterval(checkBackend, window.AI_CONFIG.RETRY_INTERVAL);

        // Global User Identity Logic - Updated for JSON 'user'
        const rawUser = localStorage.getItem('user');
        const displayUser = document.getElementById('displayUser');
        const displayEmail = document.getElementById('displayEmail');

        if (rawUser && (displayUser || displayEmail)) {
            try {
                const user = JSON.parse(rawUser);
                if (displayUser) displayUser.innerText = user.name || 'Student';
                if (displayEmail) displayEmail.innerText = user.email || '';
            } catch(e) { console.error("Identity parse error", e); }
        }
    });
})();

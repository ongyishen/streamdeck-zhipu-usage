/// <reference path="./utils/common.js" />
/// <reference path="./utils/axios.js" />

const plugin = new Plugins("xxx");

// Zhipu API endpoint
const API_URL = 'https://bigmodel.cn/api/monitor/usage/quota/limit';

// Default settings
const DEFAULTS = {
    apiKey: '',
    refreshInterval: 5
};

// Track contexts
const contexts = {};

// Canvas size for Stream Deck key (72x72)
const CANVAS_WIDTH = 72;
const CANVAS_HEIGHT = 72;

// Get Singapore time string
function getSGTime() {
    const now = new Date();
    const sgTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // UTC+8
    const hours = sgTime.getUTCHours().toString().padStart(2, '0');
    const minutes = sgTime.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Get color based on usage percentage
function getColor(pct) {
    if (pct < 80) return '#00FF00';      // Green
    if (pct <= 90) return '#FFFF00';     // Yellow
    return '#FF0000';                     // Red
}

// Draw the display on canvas
function drawDisplay(context, modelName, pctStr, color,timeRemain) {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    
    // Background - semi-transparent black
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Model name at top
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(modelName, CANVAS_WIDTH / 2, 12);
    
    // Percentage in middle (large font, colored)
    ctx.fillStyle = color;
    ctx.font = 'bold 18px Arial';
    ctx.fillText(pctStr, CANVAS_WIDTH / 2, 38);
    
    // Last refresh time at bottom (same size as model text)
    const sgTime = getSGTime();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.fillText(timeRemain, CANVAS_WIDTH / 2, 60);
    
    // Send image to Stream Deck and clear title
    window.socket.setImage(context, canvas.toDataURL('image/png'));
    window.socket.setTitle(context, '');
}

// Show error message on canvas
function drawError(context, message) {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    
    // Background - semi-transparent black
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Error text in red
    ctx.fillStyle = '#FF0000';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, CANVAS_WIDTH / 2, 40);
    
    window.socket.setImage(context, canvas.toDataURL('image/png'));
    window.socket.setTitle(context, '');
}

// 操作一 - MiniMax Usage Display
plugin.action1 = new Actions({
    default: DEFAULTS,
    _willAppear({ context, payload }) {
        console.log('[Zhipu] willAppear');
        const settings = { ...DEFAULTS, ...payload.settings };
        contexts[context] = { settings, intervalId: null };
        
        // Show loading on title
        window.socket.setTitle(context, "Loading...");
        fetchUsage(context);
        startPolling(context);
    },
    _willDisappear({ context }) {
        stopPolling(context);
        delete contexts[context];
    },
    keyUp(data) {
        console.log('[Zhipu] keyUp - refreshing');
        fetchUsage(data.context);
    },
    didReceiveSettings(data) {
        console.log('[Zhipu] didReceiveSettings:', data);
        const { context, payload } = data;
        if (contexts[context]) {
            contexts[context].settings = { ...DEFAULTS, ...payload.settings };
            stopPolling(context);
            fetchUsage(context);
            startPolling(context);
        }
    }
});

function formatRemainingTime(ms) {
    // 1. Calculate total minutes
    const totalMinutes = Math.floor(ms / (1000 * 60));
    
    // 2. Get full hours
    const hours = Math.floor(totalMinutes / 60);
    
    // 3. Get remaining minutes using modulo
    const minutes = totalMinutes % 60;
    
    return `${hours} hr ${minutes} min`;
}

async function fetchUsage(context) {
    const ctx = contexts[context];
    if (!ctx) return;
    
    const { apiKey } = ctx.settings;
    
    if (!apiKey) {
        drawError(context, "No API Key");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
                'User-Agent': 'Zhipu-Usage-Plugin/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('[Zhipu] Response:', data);

        if (data && data.success && data.code === 200 && Array.isArray(data.data.limits)) {
            const tokensLimit = data.data.limits.find(l => l.type === 'TOKENS_LIMIT');
            
            if (tokensLimit) {
                const pct = tokensLimit.percentage;
                const pctStr = pct.toFixed(1) + '%';
                const color = getColor(pct);
                
                // Calculate time until reset
                let timeRemain = '--';
                if (tokensLimit.nextResetTime) {
                    const resetMs = Math.max(0, tokensLimit.nextResetTime - Date.now());
                    timeRemain = formatRemainingTime(resetMs);
                }
                
                drawDisplay(context, 'Zhipu', pctStr, color, timeRemain);
            } else {
                drawError(context, "No Plan");
            }
        } else {
            drawError(context, "API Err");
        }
    } catch (err) {
        console.error('[Zhipu] Error:', err.message);
        drawError(context, "Net Err");
    }
}

function startPolling(context) {
    const ctx = contexts[context];
    if (!ctx) return;
    
    stopPolling(context);
    
    const intervalMs = (ctx.settings.refreshInterval || 5) * 60 * 1000;
    console.log('[Zhipu] Polling every', ctx.settings.refreshInterval, 'minutes');
    
    ctx.intervalId = setInterval(() => {
        fetchUsage(context);
    }, intervalMs);
}

function stopPolling(context) {
    const ctx = contexts[context];
    if (ctx && ctx.intervalId) {
        clearInterval(ctx.intervalId);
        ctx.intervalId = null;
    }
}

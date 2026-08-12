/**
 * MEVA AI - Wholesale Trade Management AI
 * Minimalist Mobile-First State Machine Application
 */

document.addEventListener('DOMContentLoaded', () => {
    initLandingPage();
    initDemoApp();
});

// ==========================================
// PART 1: LANDING PAGE LOGIC
// ==========================================
function initLandingPage() {
    // 1. Scroll Animations (Intersection Observer)
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

    // 2. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 3. Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 4. Demo Toggle
    const ctaBtns = document.querySelectorAll('.cta-demo');
    const backBtns = document.querySelectorAll('.btn-back-landing');

    ctaBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.add('demo-active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.remove('demo-active');
        });
    });
}

// ==========================================
// PART 2: DEMO APP STATE MACHINE
// ==========================================

const state = {
    trades: [],           // Array of trade objects
    isListening: false,   // Microphone active?
    lastTranscript: '',   // Speech text accumulated
    pendingTrade: null    // Parsed trade waiting for user confirmation
};

// Audio Visualizer State
const audioState = {
    context: null,
    analyser: null,
    source: null,
    stream: null,
    animationId: null
};

// --- Initialization ---
function initDemoApp() {
    loadTrades();
    renderTrades();
    updateMetrics();
    initSpeechRecognition();
    initQuickClickButtons();
    initResultCardActions();
    initLedgerDrawer();
}

// --- Utility Functions ---
function formatNumber(n) {
    return Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatCurrency(n) {
    return formatNumber(n) + ' UZS';
}

function generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function getTimestamp() {
    return new Date().toISOString();
}

// --- LocalStorage Persistence ---
function loadTrades() {
    const saved = localStorage.getItem('meva_trades');
    if (saved) {
        try {
            state.trades = JSON.parse(saved);
        } catch (e) {
            state.trades = [];
        }
    } else {
        state.trades = [];
    }
}

function saveTrades() {
    localStorage.setItem('meva_trades', JSON.stringify(state.trades));
}

// --- Web Speech API Controller ---
let recognition = null;

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        const transcriptEl = document.getElementById('transcript-area');
        if (transcriptEl) {
            transcriptEl.innerHTML = '<span class="transcript-placeholder">Brauzeringiz nutqni tanish funksiyasini qo\'llab-quvvatlamaydi. Chrome ishlating.</span>';
        }
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'uz-UZ';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        state.isListening = true;
        state.lastTranscript = '';
        updateMicButtonUI();
        startAudioVisualizer();
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        const fullText = (finalTranscript + ' ' + interimTranscript).trim();
        if (fullText) {
            state.lastTranscript = fullText;
            const transcriptEl = document.getElementById('transcript-area');
            if (transcriptEl) {
                transcriptEl.textContent = fullText;
            }
        }
    };

    recognition.onerror = (event) => {
        const transcriptEl = document.getElementById('transcript-area');
        if (transcriptEl && event.error !== 'no-speech') {
            transcriptEl.textContent = "Xato: " + event.error;
        }
        stopListeningAndProcess();
    };

    recognition.onend = () => {
        if (state.isListening) {
            stopListeningAndProcess();
        }
    };

    const micBtn = document.getElementById('mic-btn');
    if (micBtn) {
        micBtn.addEventListener('click', () => {
            if (state.isListening) {
                stopListeningAndProcess();
            } else {
                startListening();
            }
        });
    }

    // Allow clicking the transcript box to process immediately if text exists
    const transcriptEl = document.getElementById('transcript-area');
    if (transcriptEl) {
        transcriptEl.style.cursor = 'pointer';
        transcriptEl.addEventListener('click', () => {
            const currentText = transcriptEl.textContent.trim();
            if (currentText && !currentText.startsWith('Mikrofonni') && !currentText.startsWith('Tinglanmoqda')) {
                stopListeningAndProcess(currentText);
            }
        });
    }
}

function startListening() {
    if (recognition && !state.isListening) {
        try {
            state.lastTranscript = '';
            const transcriptEl = document.getElementById('transcript-area');
            if (transcriptEl) transcriptEl.textContent = "Tinglanmoqda...";
            recognition.start();
        } catch(e) { }
    }
}

function stopListeningAndProcess(explicitText) {
    if (recognition && state.isListening) {
        try { recognition.stop(); } catch(e){}
    }
    state.isListening = false;
    updateMicButtonUI();
    stopAudioVisualizer();

    const transcriptEl = document.getElementById('transcript-area');
    const textToProcess = explicitText || state.lastTranscript || (transcriptEl ? transcriptEl.textContent.trim() : '');
    
    if (textToProcess && 
        textToProcess !== "Tinglanmoqda..." && 
        !textToProcess.startsWith('Mikrofonni') && 
        textToProcess.length > 2) {
        startProcessing(textToProcess);
    }
}

function updateMicButtonUI() {
    const stageView = document.getElementById('voice-stage-view');
    const micLabel = document.getElementById('mic-label');
    
    if (state.isListening) {
        if (stageView) stageView.classList.add('recording');
        if (micLabel) micLabel.textContent = 'Yozib olinmoqda... To\'xtatish uchun bosing';
    } else {
        if (stageView) stageView.classList.remove('recording');
        if (micLabel) micLabel.textContent = 'Bosing va gapiring';
    }
}

// --- Audio Waveform Visualizer ---
async function startAudioVisualizer() {
    const canvas = document.getElementById('waveform-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (!audioState.context) {
        audioState.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioState.context.state === 'suspended') {
        await audioState.context.resume();
    }

    try {
        if (!audioState.stream) {
            audioState.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        }
        if (!audioState.source) {
            audioState.source = audioState.context.createMediaStreamSource(audioState.stream);
            audioState.analyser = audioState.context.createAnalyser();
            audioState.analyser.fftSize = 64;
            audioState.source.connect(audioState.analyser);
        }

        const bufferLength = audioState.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!state.isListening) return;
            audioState.animationId = requestAnimationFrame(draw);
            audioState.analyser.getByteFrequencyData(dataArray);

            canvas.width = canvas.clientWidth || 300;
            canvas.height = canvas.clientHeight || 50;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 1.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;

                ctx.fillStyle = '#2ee55c';
                ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 2, barHeight || 2);

                x += barWidth;
            }
        };
        draw();
    } catch (err) { }
}

function stopAudioVisualizer() {
    if (audioState.animationId) cancelAnimationFrame(audioState.animationId);
    const canvas = document.getElementById('waveform-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// --- Quick-Click Sample Voice Buttons ---
function initQuickClickButtons() {
    const quickBtns = document.querySelectorAll('.quick-btn');
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const phrase = btn.getAttribute('data-phrase');
            if (phrase) simulateVoiceInput(phrase);
        });
    });
}

function simulateVoiceInput(text) {
    const transcriptEl = document.getElementById('transcript-area');
    if (!transcriptEl) return;
    
    transcriptEl.textContent = '';
    let i = 0;
    
    const stageView = document.getElementById('voice-stage-view');
    if (stageView) stageView.classList.add('recording');
    
    const interval = setInterval(() => {
        transcriptEl.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
            clearInterval(interval);
            if (stageView) stageView.classList.remove('recording');
            setTimeout(() => {
                startProcessing(text);
            }, 400);
        }
    }, 25);
}

// --- Uzbek Wholesale NLP Parser ---
const KNOWN_NAMES = [
    'Salim', 'Jasur', 'Davron', 'Anvar', 'Karim', 'Botir', 'Rustam', 
    'Alisher', 'Sherzod', 'Akbar', 'Sardor', 'Dilshod', 'Farhod', 
    'Nodir', 'Olim', 'Tohir', 'Bekzod', 'Jamshid', 'Sanjar', 'Aziz', 
    'Hamid', 'Murod'
];

const KNOWN_PRODUCTS = [
    'olma', 'apelsin', 'anor', 'uzum', 'nok', 'shaftoli', 'gilos', 
    'limon', 'mandarin', 'banan', 'xurmo', 'anjir'
];

function parseUzbekPrice(text) {
    const lower = text.toLowerCase();
    
    // 1. Match digits with multiplier (e.g., "12 ming", "100 ming", "100000")
    const digitMatch = lower.match(/(\d+[\s,.]?\d*)\s*(ming|so'm|sum)/i);
    if (digitMatch) {
        let base = parseFloat(digitMatch[1].replace(/[\s,.]/g, ''));
        if (digitMatch[2].toLowerCase().startsWith('ming')) {
            base *= 1000;
        }
        return base;
    }

    // 2. Direct standalone large digits (e.g., 100000)
    const plainDigits = lower.match(/(\d{4,9})/);
    if (plainDigits) {
        return parseFloat(plainDigits[1]);
    }

    // 3. Uzbek number word phrases
    const wordNumbers = [
        { word: 'yuz ming', val: 100000 },
        { word: 'ellik ming', val: 50000 },
        { word: 'yigirma besh ming', val: 25000 },
        { word: 'yigirma ming', val: 20000 },
        { word: 'o\'n besh ming', val: 15000 },
        { word: 'on besh ming', val: 15000 },
        { word: 'o\'n ikki ming', val: 12000 },
        { word: 'on ikki ming', val: 12000 },
        { word: 'o\'n ming', val: 10000 },
        { word: 'on ming', val: 10000 },
        { word: 'o\'ttiz ming', val: 30000 },
        { word: 'ottiz ming', val: 30000 },
        { word: 'qirq ming', val: 40000 },
        { word: 'oltmish ming', val: 60000 },
        { word: 'yetmish ming', val: 70000 },
        { word: 'sakson ming', val: 80000 },
        { word: 'to\'qson ming', val: 90000 },
        { word: 'toqson ming', val: 90000 }
    ];

    for (let item of wordNumbers) {
        if (lower.includes(item.word)) {
            return item.val;
        }
    }

    return 100000; // Sensible default for produce trade
}

function parseWholesaleSpeech(text) {
    if (!text) return null;
    const lowerText = text.toLowerCase();
    
    let client = 'Salim';
    let product = 'Meva (Apelsin)';
    let quantity = 10;
    let unit = 'yashik';
    let status = 'qarz';

    // 1. Client name detection
    for (let name of KNOWN_NAMES) {
        const regex = new RegExp(name.toLowerCase() + '(ga|dan|da|ni)?', 'i');
        if (regex.test(lowerText)) {
            client = name;
            break;
        }
    }

    // 2. Product detection
    for (let prod of KNOWN_PRODUCTS) {
        if (lowerText.includes(prod)) {
            product = prod.charAt(0).toUpperCase() + prod.slice(1);
            break;
        }
    }

    // 3. Quantity & Unit
    const qtyRegex = /(\d+)\s*(ta\s*)?(yashik|kg|tonna|dona)?/i;
    const qtyMatch = lowerText.match(qtyRegex);
    if (qtyMatch) {
        quantity = parseFloat(qtyMatch[1]);
        if (qtyMatch[3]) unit = qtyMatch[3].toLowerCase();
    }

    // 4. Price parsing (digits + Uzbek words)
    const unitPrice = parseUzbekPrice(text);

    // 5. Payment Status
    if (/(keyinga|qarz|nasiya|keyin|qarzga)/i.test(lowerText)) {
        status = 'qarz';
    } else if (/(naqd|to'ladi|berdi)/i.test(lowerText)) {
        status = 'naqd';
    }

    let tareDeduction = 0;
    if (unit === 'yashik') {
        tareDeduction = quantity * 2.0; // 2kg standard crate tare
    }

    const totalGross = quantity * unitPrice;

    return {
        client,
        product,
        quantity,
        unit,
        unitPrice,
        totalGross,
        tareDeduction,
        status,
        rawText: text
    };
}

// --- STATE MACHINE TRANSITIONS ---

// Transition from Recording -> Processing (YouTube Spinner) -> Result Card
function startProcessing(transcriptText) {
    const voiceView = document.getElementById('voice-stage-view');
    const procView = document.getElementById('processing-stage-view');
    const resView = document.getElementById('result-stage-view');

    if (voiceView) voiceView.classList.add('hidden');
    if (procView) procView.classList.remove('hidden');
    if (resView) resView.classList.add('hidden');

    // Perceived AI calculation delay (~1.4s)
    setTimeout(() => {
        const parsed = parseWholesaleSpeech(transcriptText);
        state.pendingTrade = parsed;
        displayResultCard(parsed);

        if (procView) procView.classList.add('hidden');
        if (resView) resView.classList.remove('hidden');
    }, 1400);
}

// Populate Result Card UI
function displayResultCard(parsed) {
    document.getElementById('res-client').textContent = parsed.client;
    document.getElementById('res-product-qty').textContent = `${parsed.quantity} ${parsed.unit} ${parsed.product}`;
    document.getElementById('res-unit-price').textContent = `${formatNumber(parsed.unitPrice)} UZS`;
    document.getElementById('res-tare').textContent = parsed.tareDeduction > 0 ? `-${parsed.tareDeduction} kg (Avtomat)` : 'Yo\'q';
    document.getElementById('res-total').textContent = formatCurrency(parsed.totalGross);

    const badge = document.getElementById('res-status-badge');
    if (badge) {
        if (parsed.status === 'naqd') {
            badge.textContent = 'Naqd';
            badge.className = 'result-status-badge badge-cash';
        } else {
            badge.textContent = 'Qarz';
            badge.className = 'result-status-badge badge-debt';
        }
    }
}

// Initialize Result Card Confirmation Buttons
function initResultCardActions() {
    const btnConfirm = document.getElementById('btn-confirm-trade');
    const btnCancel = document.getElementById('btn-cancel-trade');

    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
            if (state.pendingTrade) {
                saveTradeToLedger(state.pendingTrade);
                showSuccessToast();
                resetToIdleStage();
            }
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            resetToIdleStage();
        });
    }
}

function saveTradeToLedger(parsed) {
    const trade = {
        id: generateId(),
        timestamp: getTimestamp(),
        dateStr: getToday(),
        client: parsed.client,
        product: parsed.product,
        quantity: parsed.quantity,
        unit: parsed.unit,
        unitPrice: parsed.unitPrice,
        totalGross: parsed.totalGross,
        tareDeduction: parsed.tareDeduction,
        status: parsed.status,
        paid: parsed.status === 'naqd'
    };

    state.trades.unshift(trade);
    saveTrades();
    renderTrades();
    updateMetrics();
}

function showSuccessToast() {
    const toast = document.getElementById('success-toast');
    if (toast) {
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 2200);
    }
}

function resetToIdleStage() {
    state.pendingTrade = null;
    state.lastTranscript = '';
    const voiceView = document.getElementById('voice-stage-view');
    const procView = document.getElementById('processing-stage-view');
    const resView = document.getElementById('result-stage-view');

    if (procView) procView.classList.add('hidden');
    if (resView) resView.classList.add('hidden');
    if (voiceView) voiceView.classList.remove('hidden');

    const transcriptEl = document.getElementById('transcript-area');
    if (transcriptEl) {
        transcriptEl.innerHTML = '<span class="transcript-placeholder">Mikrofonni bosib savdo ma\'lumotlarini aytishingiz mumkin...</span>';
    }
}

// --- SAVED TRADES LEDGER MODAL DRAWER ---
function initLedgerDrawer() {
    const btnOpen = document.getElementById('btn-open-ledger');
    const btnClose = document.getElementById('btn-close-ledger');
    const overlay = document.getElementById('ledger-drawer-overlay');

    if (btnOpen && overlay) {
        btnOpen.addEventListener('click', () => {
            overlay.classList.remove('hidden');
        });
    }

    if (btnClose && overlay) {
        btnClose.addEventListener('click', () => {
            overlay.classList.add('hidden');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.add('hidden');
        });
    }
}

// --- Trade Ledger Rendering & Metrics ---
function renderTrades() {
    const tbody = document.getElementById('trade-tbody');
    const emptyState = document.getElementById('empty-state');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (state.trades.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    if (emptyState) emptyState.classList.add('hidden');

    state.trades.forEach((trade, index) => {
        const tr = document.createElement('tr');
        
        let statusHtml = '';
        let actionHtml = '';

        if (trade.status === 'naqd' || trade.paid) {
            statusHtml = `<span class="badge-cash">Naqd</span>`;
            actionHtml = `<span class="paid-text">To'langan ✓</span>`;
        } else {
            statusHtml = `<span class="badge-debt">Qarz</span>`;
            actionHtml = `<button class="btn-pay" onclick="settleDebt('${trade.id}')">To'landi ✓</button>`;
        }

        const dateObj = new Date(trade.timestamp);
        const timeStr = dateObj.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${trade.client}</strong><br><span style="font-size:11px;color:var(--text-muted);">${timeStr}</span></td>
            <td>${trade.product}</td>
            <td>${trade.quantity} ${trade.unit}</td>
            <td><strong>${formatNumber(trade.totalGross)}</strong></td>
            <td>${statusHtml}</td>
            <td>${actionHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

window.settleDebt = function(id) {
    const tradeIndex = state.trades.findIndex(t => t.id === id);
    if (tradeIndex !== -1) {
        state.trades[tradeIndex].paid = true;
        state.trades[tradeIndex].status = 'naqd';
        saveTrades();
        renderTrades();
        updateMetrics();
    }
};

function updateMetrics() {
    let totalSales = 0;
    let totalDebt = 0;

    state.trades.forEach(trade => {
        totalSales += trade.totalGross;
        if (trade.status === 'qarz' && !trade.paid) {
            totalDebt += trade.totalGross;
        }
    });

    const elSales = document.getElementById('kpi-total-sales');
    const elDebt = document.getElementById('kpi-total-debt');
    const elCount = document.getElementById('kpi-trades-today');
    const elLedgerBadgeCount = document.getElementById('ledger-count');

    if (elSales) elSales.textContent = formatCurrency(totalSales);
    if (elDebt) elDebt.textContent = formatCurrency(totalDebt);
    if (elCount) elCount.textContent = state.trades.length.toString();
    if (elLedgerBadgeCount) elLedgerBadgeCount.textContent = state.trades.length.toString();
}

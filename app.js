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
    initVoiceWaveBackground();
    initMathSymbolsBackground();
    initTimelineScrollProgress();

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

    // 2. Floating Scroll Button (Occlum Down / Up Widget)
    const btnScroll = document.getElementById('btn-scroll-action');
    const iconDown = document.getElementById('scroll-icon-down');
    const iconUp = document.getElementById('scroll-icon-up');
    const progressCircle = document.getElementById('progress-ring-circle');
    const CIRCUMFERENCE = 150.796; // 2 * Math.PI * 24

    if (btnScroll) {
        function updateScrollWidget() {
            const scrollY = window.scrollY;
            const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const progressRatio = Math.min(1, Math.max(0, scrollY / maxScroll));

            // Fill SVG progress ring from 0% at top to 100% full circle at bottom
            if (progressCircle) {
                const offset = CIRCUMFERENCE - (progressRatio * CIRCUMFERENCE);
                progressCircle.style.strokeDashoffset = offset;
            }

            // If in upper half of page -> Show Down Arrow (takes to VERY BOTTOM)
            // If in lower half of page -> Show Up Arrow (takes to VERY TOP)
            if (progressRatio < 0.5) {
                if (iconDown) iconDown.classList.remove('hidden');
                if (iconUp) iconUp.classList.add('hidden');
            } else {
                if (iconDown) iconDown.classList.add('hidden');
                if (iconUp) iconUp.classList.remove('hidden');
            }
        }

        window.addEventListener('scroll', updateScrollWidget);
        updateScrollWidget(); // initial state

        btnScroll.addEventListener('click', () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progressRatio = window.scrollY / (maxScroll || 1);

            if (progressRatio < 0.5) {
                // Take to VERY BOTTOM of page
                window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
            } else {
                // Take to VERY TOP of page
                window.scrollTo({ top: 0, behavior: 'smooth' });
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

// Animated Voice Sound Waves Background Canvas
function initVoiceWaveBackground() {
    const canvas = document.getElementById('voice-bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth);
    let height = (canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight);

    window.addEventListener('resize', () => {
        if (canvas.parentElement) {
            width = canvas.width = canvas.parentElement.clientWidth;
            height = canvas.height = canvas.parentElement.clientHeight;
        }
    });

    let step = 0;
    const linesCount = 18;

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // 1. Draw ambient vertical equalizer bars (matching reference image 1 & 3)
        const barWidth = 3;
        const spacing = 18;
        const totalBars = Math.floor(width / spacing);
        
        ctx.fillStyle = 'rgba(46, 229, 92, 0.04)';
        for (let i = 0; i < totalBars; i++) {
            const barH = Math.sin(i * 0.15 + step * 0.02) * 80 + Math.cos(i * 0.08 + step * 0.03) * 60 + 100;
            const x = i * spacing;
            const y = height / 2 - barH / 2;
            ctx.fillRect(x, y, barWidth, barH);
        }

        // 2. Draw flowing sine ribbon waves (matching reference image 2)
        step += 0.015;

        for (let l = 0; l < linesCount; l++) {
            ctx.beginPath();
            ctx.lineWidth = l === 0 || l === linesCount - 1 ? 1.8 : 0.8;
            
            const alpha = 0.12 + (l / linesCount) * 0.35;
            ctx.strokeStyle = `rgba(46, 229, 92, ${alpha})`;

            const offsetY = (l - linesCount / 2) * 4;

            for (let x = 0; x < width; x += 5) {
                const angle1 = x * 0.004 + step + l * 0.04;
                const angle2 = x * 0.008 - step * 0.8;
                const y = height / 2 + offsetY + Math.sin(angle1) * 65 + Math.cos(angle2) * 35;

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }

        // 3. Glowing center wave accent line
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(122, 248, 156, 0.65)';
        for (let x = 0; x < width; x += 5) {
            const y = height / 2 + Math.sin(x * 0.005 + step * 1.2) * 75 + Math.sin(x * 0.01 - step) * 20;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        requestAnimationFrame(draw);
    }

    draw();
}

// ==========================================
// PART 2: DEMO APP STATE MACHINE
// ==========================================

const state = {
    trades: [],             // Array of saved trade objects
    isListening: false,     // Microphone active?
    isHandsFree: false,     // Hands-free continuous wake-word mode
    accumulatedText: '',    // Continuous accumulated speech text (Wispr Flow style)
    pendingTrade: null      // Parsed trade waiting for user confirmation
};

// Audio Visualizer State
const audioState = {
    context: null,
    analyser: null,
    source: null,
    stream: null,
    animationId: null
};

// Wispr Flow Control Flag
let userRequestedStop = false;

// --- Initialization ---
function initDemoApp() {
    loadTrades();
    renderTrades();
    updateMetrics();
    initSpeechRecognition();
    initQuickClickButtons();
    initResultCardActions();
    initClarifyActions();
    initLedgerDrawer();
    initHandsFreeToggle();
}

// --- Utility Functions ---
function formatNumber(n) {
    if (n === null || n === undefined || isNaN(n)) return '0';
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

// --- Web Speech API Controller (Wispr Flow & Hands-Free Mode) ---
let recognition = null;

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        const transcriptEl = document.getElementById('transcript-area');
        if (transcriptEl) {
            transcriptEl.innerHTML = '<span class="transcript-placeholder">Brauzeringizda Speech API yo\'q. Quyidagi tayyor misollardan birini bosing.</span>';
        }
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'uz-UZ';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        state.isListening = true;
        updateMicButtonUI();
        startAudioVisualizer();
    };

    recognition.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; ++i) {
            text += event.results[i][0].transcript + ' ';
        }
        text = text.trim();

        if (text) {
            state.accumulatedText = text;
            const transcriptEl = document.getElementById('transcript-area');
            if (transcriptEl) {
                transcriptEl.textContent = text;
            }

            // CHECK VOICE COMMANDS (When Result Card is visible or Hands-Free is active)
            const resView = document.getElementById('result-stage-view');
            if (resView && !resView.classList.contains('hidden')) {
                const lowerText = text.toLowerCase();
                if (/(tasdiqlash|saqlash|tugadi|ha|bo'ldi)/i.test(lowerText)) {
                    if (state.pendingTrade) {
                        saveTradeToLedger(state.pendingTrade);
                        showSuccessToast();
                        resetToIdleStage();
                    }
                } else if (/(qarz|nasiya|keyinga)/i.test(lowerText)) {
                    if (state.pendingTrade) {
                        state.pendingTrade.status = 'qarz';
                        displayResultCard(state.pendingTrade);
                    }
                } else if (/(naqd|to'ladi|berdi)/i.test(lowerText)) {
                    if (state.pendingTrade) {
                        state.pendingTrade.status = 'naqd';
                        displayResultCard(state.pendingTrade);
                    }
                } else if (/(qayta|yo'q|bekor)/i.test(lowerText)) {
                    resetToIdleStage();
                }
            }
        }
    };

    recognition.onerror = (event) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
            const transcriptEl = document.getElementById('transcript-area');
            if (transcriptEl) {
                transcriptEl.textContent = "Mikrofon xatosi: " + event.error;
            }
        }
    };

    // WISPR FLOW AUTO-RESTART: If speech engine pauses/ends but user DID NOT click stop, auto-restart!
    recognition.onend = () => {
        if ((state.isListening && !userRequestedStop) || state.isHandsFree) {
            try {
                recognition.start();
            } catch(e) { }
        }
    };

    const micBtn = document.getElementById('mic-btn');
    if (micBtn) {
        micBtn.addEventListener('click', () => {
            if (state.isListening) {
                userRequestedStop = true;
                stopListeningAndProcess();
            } else {
                userRequestedStop = false;
                startListening();
            }
        });
    }

    // Tap transcript box to process immediately
    const transcriptEl = document.getElementById('transcript-area');
    if (transcriptEl) {
        transcriptEl.style.cursor = 'pointer';
        transcriptEl.addEventListener('click', () => {
            const currentText = transcriptEl.textContent.trim();
            if (currentText && !currentText.startsWith('Mikrofonni') && !currentText.startsWith('Tinglanmoqda')) {
                userRequestedStop = true;
                stopListeningAndProcess(currentText);
            }
        });
    }
}

function startListening() {
    if (recognition) {
        try {
            state.accumulatedText = '';
            userRequestedStop = false;
            const transcriptEl = document.getElementById('transcript-area');
            if (transcriptEl) transcriptEl.textContent = "Tinglanmoqda... (Gapiravering, pause qilsangiz ham yozadi)";
            recognition.start();
        } catch(e) { }
    }
}

function stopListeningAndProcess(explicitText) {
    userRequestedStop = true;
    if (recognition) {
        try { recognition.stop(); } catch(e){}
    }
    state.isListening = false;
    updateMicButtonUI();
    stopAudioVisualizer();

    const transcriptEl = document.getElementById('transcript-area');
    const textToProcess = explicitText || state.accumulatedText || (transcriptEl ? transcriptEl.textContent.trim() : '');
    
    if (textToProcess && 
        !textToProcess.startsWith('Tinglanmoqda') && 
        !textToProcess.startsWith('Mikrofonni') && 
        !textToProcess.startsWith('Brauzeringizda') &&
        textToProcess.length > 1) {
        startProcessing(textToProcess);
    }
}

function updateMicButtonUI() {
    const stageView = document.getElementById('voice-stage-view');
    const micLabel = document.getElementById('mic-label');
    
    if (state.isListening) {
        if (stageView) stageView.classList.add('recording');
        if (micLabel) micLabel.textContent = 'Yozilmoqda... Yakunlash uchun tugmani bosing';
    } else {
        if (stageView) stageView.classList.remove('recording');
        if (micLabel) micLabel.textContent = 'Bosing va gapiring';
    }
}

function initHandsFreeToggle() {
    const btnToggle = document.getElementById('btn-hands-free-toggle');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            state.isHandsFree = !state.isHandsFree;
            if (state.isHandsFree) {
                btnToggle.classList.add('active');
                startListening();
            } else {
                btnToggle.classList.remove('active');
                userRequestedStop = true;
                stopListeningAndProcess();
            }
        });
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

// --- UZBEK WHOLESALE NLP PARSER & PHYSICS CALCULATOR ---

const KNOWN_NAMES = [
    'Salim', 'Jasur', 'Davron', 'Anvar', 'Karim', 'Botir', 'Rustam', 
    'Alisher', 'Sherzod', 'Akbar', 'Sardor', 'Dilshod', 'Farhod', 
    'Nodir', 'Olim', 'Tohir', 'Bekzod', 'Jamshid', 'Sanjar', 'Aziz', 
    'Hamid', 'Murod', 'Bernard', 'David'
];

const KNOWN_PRODUCTS = [
    'olma', 'apelsin', 'anor', 'uzum', 'nok', 'shaftoli', 'gilos', 
    'limon', 'mandarin', 'banan', 'xurmo', 'anjir'
];

function parseUzbekPrice(text) {
    const lower = text.toLowerCase();
    
    // 1. Match digits with multiplier (e.g., "12 ming", "47 ming", "100000")
    const digitMatch = lower.match(/(\d+[\s,.]?\d*)\s*(ming|so'm|sum)/i);
    if (digitMatch) {
        let base = parseFloat(digitMatch[1].replace(/[\s,.]/g, ''));
        if (digitMatch[2].toLowerCase().startsWith('ming')) {
            base *= 1000;
        }
        return base;
    }

    // 2. Direct standalone large digits (e.g., 100000, 12000)
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
        { word: 'to\'qson ming', val: 90000 }
    ];

    for (let item of wordNumbers) {
        if (lower.includes(item.word)) {
            return item.val;
        }
    }

    return null;
}

function parseWholesaleSpeech(text) {
    if (!text || text.trim().length < 2) {
        return { valid: false, reason: 'EMPTY' };
    }
    const lowerText = text.toLowerCase();

    // 1. Client name detection
    let client = null;
    for (let name of KNOWN_NAMES) {
        const regex = new RegExp(name.toLowerCase() + '(ga|dan|da|ni)?', 'i');
        if (regex.test(lowerText)) {
            client = name;
            break;
        }
    }

    // 2. Product detection
    let product = null;
    for (let prod of KNOWN_PRODUCTS) {
        if (lowerText.includes(prod)) {
            product = prod.charAt(0).toUpperCase() + prod.slice(1);
            break;
        }
    }

    // 3. Quantity of crates & Gross Weight
    let quantity = null;
    let unit = 'yashik';
    const qtyRegex = /(\d+)\s*(ta\s*)?(yashik|dona)?/i;
    const qtyMatch = lowerText.match(qtyRegex);
    if (qtyMatch) {
        quantity = parseFloat(qtyMatch[1]);
        if (qtyMatch[3]) unit = qtyMatch[3].toLowerCase();
    }

    // Gross Weight (Brutto vazn) e.g., "147 kg brutto" or "147 kg"
    let grossWeight = null;
    const grossMatch = lowerText.match(/(\d+[\s,.]?\d*)\s*kg\s*(brutto)?/i);
    if (grossMatch) {
        grossWeight = parseFloat(grossMatch[1].replace(',', '.'));
    }

    // 4. Price parsing (digits + Uzbek words)
    let unitPrice = parseUzbekPrice(text);

    // 5. Payment Status
    let status = 'qarz';
    if (/(keyinga|qarz|nasiya|keyin|qarzga)/i.test(lowerText)) {
        status = 'qarz';
    } else if (/(naqd|to'ladi|berdi)/i.test(lowerText)) {
        status = 'naqd';
    }

    // Explicit Tare Deduction per crate (e.g., "2.5 kg tara", "2 kg tara", "3 kg tara")
    let tareExplicit = false;
    let tarePerBox = 0;
    let tareDeduction = 0;

    const tareMatch = lowerText.match(/(\d+[\s,.]?\d*)\s*kg\s*tara/i);
    if (tareMatch) {
        tareExplicit = true;
        tarePerBox = parseFloat(tareMatch[1].replace(',', '.'));
        tareDeduction = (quantity || 1) * tarePerBox;
    } else if (lowerText.includes('tarasiz') || lowerText.includes('tara yo\'q')) {
        tareExplicit = true;
        tarePerBox = 0;
        tareDeduction = 0;
    }

    // ZERO GUESSING VALIDATION:
    if (!client && !quantity && !unitPrice && !product && !grossWeight) {
        return { valid: false, reason: 'UNRECOGNIZED', rawText: text };
    }

    if (client && !quantity && !unitPrice && !grossWeight) {
        return {
            valid: true,
            statusType: 'MISSING_QUANTITY_AND_PRICE',
            client: client,
            rawText: text
        };
    }

    if (client && (quantity || grossWeight) && !unitPrice) {
        return {
            valid: true,
            statusType: 'MISSING_PRICE',
            client: client,
            product: product || 'Meva',
            quantity: quantity || 10,
            grossWeight: grossWeight,
            unit: unit,
            status: status,
            rawText: text
        };
    }

    // Core Calculation Physics
    if (!client) client = 'Mijoz';
    if (!product) product = 'Olma';
    if (!quantity) quantity = 10;
    if (!unitPrice) unitPrice = 12000;

    let missingTare = false;
    if (unit === 'yashik' && !tareExplicit) {
        missingTare = true;
        tarePerBox = 2.0; // Standard 2.0kg estimate
        tareDeduction = quantity * tarePerBox;
    }

    // If gross weight is specified, Net Weight = Gross Weight - Total Tare Deduction!
    let netWeight = grossWeight ? Math.max(0, grossWeight - tareDeduction) : null;
    let totalGross = 0;

    if (netWeight && netWeight > 0) {
        totalGross = netWeight * unitPrice; // Price per kg mode!
    } else {
        totalGross = quantity * unitPrice;  // Price per box mode!
    }

    return {
        valid: true,
        statusType: missingTare ? 'MISSING_TARE' : 'COMPLETE',
        client,
        product,
        quantity,
        unit,
        grossWeight,
        tarePerBox,
        tareDeduction,
        netWeight,
        unitPrice,
        totalGross,
        status,
        missingTare,
        rawText: text
    };
}

// --- STATE MACHINE TRANSITIONS ---

function startProcessing(transcriptText) {
    const voiceView = document.getElementById('voice-stage-view');
    const procView = document.getElementById('processing-stage-view');
    const resView = document.getElementById('result-stage-view');
    const clarifyView = document.getElementById('clarify-stage-view');

    if (voiceView) voiceView.classList.add('hidden');
    if (procView) procView.classList.remove('hidden');
    if (resView) resView.classList.add('hidden');
    if (clarifyView) clarifyView.classList.add('hidden');

    setTimeout(() => {
        const parsed = parseWholesaleSpeech(transcriptText);
        if (procView) procView.classList.add('hidden');

        if (!parsed || !parsed.valid) {
            showAIClarification({
                type: 'UNRECOGNIZED',
                text: "Kechirasiz, aytgan gaplaringizni to'liq tushuna olmadim. Iltimos, savdo ma'lumotlarini aniqroq ayting."
            });
        } 
        else if (parsed.statusType === 'MISSING_QUANTITY_AND_PRICE') {
            showAIClarification({
                type: 'MISSING_QUANTITY_AND_PRICE',
                text: `${parsed.client} uchun savdoni tushundim. Mahsulot nomi, yashiklar soni va narxini ayting.`,
                client: parsed.client
            });
        }
        else if (parsed.statusType === 'MISSING_PRICE') {
            showAIClarification({
                type: 'MISSING_PRICE',
                text: `${parsed.client}ga ${parsed.quantity} ${parsed.unit} ${parsed.product} tushunarli. Lekin narx aytilmadi. Yashik yoki kilo narxi qancha?`,
                parsed: parsed
            });
        }
        else if (parsed.statusType === 'MISSING_TARE') {
            state.pendingTrade = parsed;
            showAIClarification({
                type: 'MISSING_TARE',
                text: `${parsed.client}ga ${parsed.quantity} ${parsed.unit} ${parsed.product} (${formatNumber(parsed.unitPrice)} UZS) tushunarli. Har bir yashik uchun tara chegirmasi qancha?`,
                parsed: parsed
            });
        } 
        else {
            state.pendingTrade = parsed;
            displayResultCard(parsed);
            if (resView) resView.classList.remove('hidden');
        }
    }, 1200);
}

// AI Clarification View Handler & Custom Tare Input
function showAIClarification(config) {
    const clarifyView = document.getElementById('clarify-stage-view');
    const askTextEl = document.getElementById('ai-ask-text');
    const optionsSection = document.getElementById('ai-options-section');
    const optionsChips = document.getElementById('ai-options-chips');
    const customTareBox = document.getElementById('custom-tare-box');

    if (askTextEl) askTextEl.textContent = config.text;

    if (optionsChips && optionsSection) {
        optionsChips.innerHTML = '';
        
        if (config.type === 'MISSING_TARE' && config.parsed) {
            optionsSection.classList.remove('hidden');
            if (customTareBox) customTareBox.classList.remove('hidden');

            const options = [1.5, 2.0, 2.5, 3.0, 0];
            options.forEach(kgVal => {
                const chip = document.createElement('button');
                chip.className = 'ai-chip-btn';
                chip.textContent = kgVal === 0 ? `0 kg (Tarasiz)` : `-${kgVal} kg / yashik`;
                chip.onclick = () => {
                    applyTareChoice(config.parsed, kgVal);
                };
                optionsChips.appendChild(chip);
            });
        }
        else if (config.type === 'MISSING_QUANTITY_AND_PRICE') {
            optionsSection.classList.remove('hidden');
            if (customTareBox) customTareBox.classList.add('hidden');
            
            const sample1 = document.createElement('button');
            sample1.className = 'ai-chip-btn';
            sample1.textContent = `10 yashik apelsin 12 mingdan keyinga`;
            sample1.onclick = () => {
                startProcessing(`${config.client}ga 10 yashik apelsin 12 mingdan keyinga`);
            };

            const sample2 = document.createElement('button');
            sample2.className = 'ai-chip-btn';
            sample2.textContent = `25 yashik olma 147 kg brutto 2.5 kg tara 47 mingdan`;
            sample2.onclick = () => {
                startProcessing(`${config.client}ga 25 yashik olma 147 kg brutto 2.5 kg tara 47 mingdan`);
            };

            optionsChips.appendChild(sample1);
            optionsChips.appendChild(sample2);
        }
        else {
            optionsSection.classList.add('hidden');
            if (customTareBox) customTareBox.classList.add('hidden');
        }
    }

    if (clarifyView) clarifyView.classList.remove('hidden');
}

function applyTareChoice(parsed, tarePerBox) {
    parsed.tarePerBox = tarePerBox;
    parsed.tareDeduction = parsed.quantity * tarePerBox;
    parsed.missingTare = false;
    
    if (parsed.grossWeight) {
        parsed.netWeight = Math.max(0, parsed.grossWeight - parsed.tareDeduction);
        parsed.totalGross = parsed.netWeight * parsed.unitPrice;
    } else {
        parsed.totalGross = parsed.quantity * parsed.unitPrice;
    }

    state.pendingTrade = parsed;
    const clarifyView = document.getElementById('clarify-stage-view');
    if (clarifyView) clarifyView.classList.add('hidden');
    
    displayResultCard(parsed);
    const resView = document.getElementById('result-stage-view');
    if (resView) resView.classList.remove('hidden');
}

function initClarifyActions() {
    const btnMic = document.getElementById('btn-clarify-mic');
    const btnCancel = document.getElementById('btn-clarify-cancel');
    const btnApplyCustom = document.getElementById('btn-apply-custom-tare');
    const inputCustom = document.getElementById('custom-tare-input');

    if (btnApplyCustom && inputCustom) {
        btnApplyCustom.addEventListener('click', () => {
            const val = parseFloat(inputCustom.value);
            if (!isNaN(val) && val >= 0 && state.pendingTrade) {
                applyTareChoice(state.pendingTrade, val);
            }
        });
    }

    if (btnMic) {
        btnMic.addEventListener('click', () => {
            resetToIdleStage();
            setTimeout(() => startListening(), 300);
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            resetToIdleStage();
        });
    }
}

// Populate Digital Bill Receipt & Formula Breakdown
function displayResultCard(parsed) {
    document.getElementById('res-client').textContent = parsed.client;
    document.getElementById('res-product-qty').textContent = `${parsed.quantity} ${parsed.unit} ${parsed.product}`;
    document.getElementById('res-unit-price').textContent = `${formatNumber(parsed.unitPrice)} UZS ${parsed.netWeight ? '/ kg' : ''}`;
    
    // Gross Weight
    const elGross = document.getElementById('res-gross-weight');
    if (elGross) {
        elGross.textContent = parsed.grossWeight ? `${parsed.grossWeight} kg` : 'Kiritilmadi';
    }

    // Tare Deduction
    const elTare = document.getElementById('res-tare');
    if (elTare) {
        elTare.textContent = parsed.tareDeduction > 0 
            ? `-${parsed.tareDeduction} kg (${parsed.quantity} yashik × ${parsed.tarePerBox || (parsed.tareDeduction/parsed.quantity).toFixed(1)} kg)`
            : '0 kg (Tarasiz)';
    }

    // Net Weight
    const elNet = document.getElementById('res-net-weight');
    if (elNet) {
        elNet.textContent = parsed.netWeight ? `${parsed.netWeight} kg` : `${parsed.quantity} yashik`;
    }

    // Total Amount
    document.getElementById('res-total').textContent = formatCurrency(parsed.totalGross);

    // Status Badge
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

    // Populate AI Calculation Steps Breakdown
    const stepsList = document.getElementById('res-math-steps');
    if (stepsList) {
        stepsList.innerHTML = '';

        const li1 = document.createElement('li');
        li1.innerHTML = `Savdo miqdori: <strong>${parsed.quantity} ${parsed.unit} ${parsed.product}</strong> ${parsed.grossWeight ? `(${parsed.grossWeight} kg Brutto)` : ''}`;
        stepsList.appendChild(li1);

        const li2 = document.createElement('li');
        if (parsed.tareDeduction > 0) {
            const tarePerBox = parsed.tarePerBox || (parsed.tareDeduction / parsed.quantity).toFixed(1);
            li2.innerHTML = `Tara chegirishi: ${parsed.quantity} yashik × ${tarePerBox} kg = <strong>-${parsed.tareDeduction} kg chegirma</strong>`;
        } else {
            li2.innerHTML = `Tara chegirishi: <strong>0 kg (Tarasiz)</strong>`;
        }
        stepsList.appendChild(li2);

        if (parsed.netWeight) {
            const liNet = document.createElement('li');
            liNet.innerHTML = `Netto toza vazn: ${parsed.grossWeight} kg - ${parsed.tareDeduction} kg = <strong>${parsed.netWeight} kg toza vazn</strong>`;
            stepsList.appendChild(liNet);
        }

        const li3 = document.createElement('li');
        if (parsed.netWeight) {
            li3.innerHTML = `Summa hisobi: ${parsed.netWeight} kg × ${formatNumber(parsed.unitPrice)} UZS = <strong>${formatCurrency(parsed.totalGross)}</strong>`;
        } else {
            li3.innerHTML = `Summa hisobi: ${parsed.quantity} ${parsed.unit} × ${formatNumber(parsed.unitPrice)} UZS = <strong>${formatCurrency(parsed.totalGross)}</strong>`;
        }
        stepsList.appendChild(li3);

        const li4 = document.createElement('li');
        li4.innerHTML = `Hujjatlashtirish: <strong>${parsed.client}</strong> daftarga <strong>${parsed.status === 'qarz' ? 'Qarz (Nasiya)' : 'Naqd to\'lov'}</strong> sifatida saqlanadi.`;
        stepsList.appendChild(li4);
    }
}

// Initialize Result Card Confirmation & Debt/Cash Toggle Buttons
function initResultCardActions() {
    const btnConfirm = document.getElementById('btn-confirm-trade');
    const btnCancel = document.getElementById('btn-cancel-trade');
    const btnSetDebt = document.getElementById('btn-set-debt');
    const btnSetCash = document.getElementById('btn-set-cash');

    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
            if (state.pendingTrade) {
                saveTradeToLedger(state.pendingTrade);
                showSuccessToast();
                resetToIdleStage();
            }
        });
    }

    if (btnSetDebt) {
        btnSetDebt.addEventListener('click', () => {
            if (state.pendingTrade) {
                state.pendingTrade.status = 'qarz';
                displayResultCard(state.pendingTrade);
            }
        });
    }

    if (btnSetCash) {
        btnSetCash.addEventListener('click', () => {
            if (state.pendingTrade) {
                state.pendingTrade.status = 'naqd';
                displayResultCard(state.pendingTrade);
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
        grossWeight: parsed.grossWeight,
        netWeight: parsed.netWeight,
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
    state.accumulatedText = '';
    userRequestedStop = false;
    const voiceView = document.getElementById('voice-stage-view');
    const procView = document.getElementById('processing-stage-view');
    const resView = document.getElementById('result-stage-view');
    const clarifyView = document.getElementById('clarify-stage-view');

    if (procView) procView.classList.add('hidden');
    if (resView) resView.classList.add('hidden');
    if (clarifyView) clarifyView.classList.add('hidden');
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
            <td>${trade.netWeight ? trade.netWeight + ' kg' : trade.quantity + ' ' + trade.unit}</td>
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

// Ambient Floating Math Symbols Canvas Engine (for Calculation Loss Section #muammo)
function initMathSymbolsBackground() {
    const canvas = document.getElementById('math-bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth);
    let height = (canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight);

    window.addEventListener('resize', () => {
        if (canvas.parentElement) {
            width = canvas.width = canvas.parentElement.clientWidth;
            height = canvas.height = canvas.parentElement.clientHeight;
        }
    });

    const mathSymbols = ['∑', '%', '×', '+', '÷', 'Δ', '∫', 'π', '√x', '±', '=', 'ƒ(x)', '≈', '≠'];
    const particles = [];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            symbol: mathSymbols[Math.floor(Math.random() * mathSymbols.length)],
            size: 14 + Math.random() * 20,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            alpha: 0.12 + Math.random() * 0.22,
            pulseSpeed: 0.015 + Math.random() * 0.025,
            pulseAngle: Math.random() * Math.PI * 2
        });
    }

    function animateMath() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            p.pulseAngle += p.pulseSpeed;
            const currentAlpha = p.alpha + Math.sin(p.pulseAngle) * 0.08;

            ctx.font = `700 ${p.size}px "Inter", monospace`;
            ctx.fillStyle = `rgba(46, 229, 92, ${Math.max(0.06, currentAlpha)})`;
            ctx.shadowColor = 'rgba(46, 229, 92, 0.45)';
            ctx.shadowBlur = 10;
            ctx.fillText(p.symbol, p.x, p.y);
        });

        requestAnimationFrame(animateMath);
    }
    animateMath();
}

// Scroll-Driven Reveal & Timeline Line Expansion for "How It Works"
function initTimelineScrollProgress() {
    const timelineSection = document.getElementById('qanday-ishlaydi');
    const progressLine = document.getElementById('timeline-line-progress');
    const timelineRows = document.querySelectorAll('.timeline-row');

    if (!timelineSection || !progressLine) return;

    function handleTimelineScroll() {
        const rect = timelineSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate progress line height (0% to 100%)
        const totalHeight = rect.height;
        const currentScroll = windowHeight * 0.6 - rect.top;
        const progressRatio = Math.min(1, Math.max(0, currentScroll / totalHeight));

        progressLine.style.height = `${progressRatio * 100}%`;

        // Reveal timeline rows sequentially
        timelineRows.forEach(row => {
            const rowRect = row.getBoundingClientRect();
            if (rowRect.top < windowHeight * 0.85) {
                row.classList.add('step-visible');
            }
        });
    }

    window.addEventListener('scroll', handleTimelineScroll);
    window.addEventListener('resize', handleTimelineScroll);
    handleTimelineScroll();
}
